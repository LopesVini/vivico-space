import { env } from "cloudflare:workers";
import { abuseTable, jsonError, mutationFromSameSite, takeRateLimit, voteOriginsTable } from "../../lib/security";

type GalleryEnv = { DB: D1Database; PHOTOS?: R2Bucket };
type VisitorRow = { visitor_token: string | null };
type PhotoRow = { id: string; instagram: string; created_at: string; removal_votes: number };

const galleryTable = `CREATE TABLE IF NOT EXISTS gallery_photos (
  id TEXT PRIMARY KEY,
  instagram TEXT NOT NULL,
  object_key TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`;
const votesTable = `CREATE TABLE IF NOT EXISTS gallery_removal_votes (
  photo_id TEXT NOT NULL,
  instagram TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (photo_id, instagram),
  FOREIGN KEY (photo_id) REFERENCES gallery_photos(id) ON DELETE CASCADE
)`;

async function setup() {
  const bindings = env as unknown as GalleryEnv;
  if (!bindings.DB) throw new Error("Database unavailable");
  await bindings.DB.batch([
    bindings.DB.prepare(galleryTable),
    bindings.DB.prepare(votesTable),
    bindings.DB.prepare(voteOriginsTable),
    bindings.DB.prepare(abuseTable),
  ]);
  return bindings;
}

function matchesImageSignature(file: File) {
  return file.slice(0, 12).arrayBuffer().then((buffer) => {
    const bytes = new Uint8Array(buffer);
    if (file.type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    if (file.type === "image/png") return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a;
    if (file.type === "image/gif") return new TextDecoder().decode(bytes.slice(0, 6)) === "GIF87a" || new TextDecoder().decode(bytes.slice(0, 6)) === "GIF89a";
    if (file.type === "image/webp") return new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
    return false;
  });
}

export async function GET() {
  try {
    const bindings = await setup();
    const rows = await bindings.DB.prepare(`SELECT p.id, p.instagram, p.created_at, COUNT(v.instagram) AS removal_votes
      FROM gallery_photos p
      LEFT JOIN gallery_removal_votes v ON v.photo_id = p.id
      GROUP BY p.id, p.instagram, p.created_at
      ORDER BY p.created_at DESC LIMIT 200`).all<PhotoRow>();
    return Response.json({ photos: rows.results.map((row) => ({
      id: row.id,
      instagram: row.instagram,
      createdAt: `${row.created_at.replace(" ", "T")}Z`,
      src: `/api/gallery/${row.id}`,
      removalVotes: Number(row.removal_votes) || 0,
    })) }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("Gallery list failed", error);
    return jsonError("Mural indisponível.", 503);
  }
}

export async function POST(request: Request) {
  let storedObjectKey: string | null = null;
  try {
    if (!mutationFromSameSite(request)) return jsonError("Origem inválida.", 403);
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > 9_000_000) return jsonError("A foto deve ter até 8 MB.", 413);
    const bindings = await setup();
    if (!bindings.PHOTOS) return jsonError("O depósito de fotos não está conectado.", 503);
    const form = await request.formData();
    const instagram = String(form.get("instagram") ?? "").trim().replace(/^@/, "").toLowerCase();
    const visitorToken = String(form.get("visitorToken") ?? "");
    const photo = form.get("photo");
    const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
    if (!/^[a-z0-9._]{1,30}$/.test(instagram) || !(photo instanceof File)) return jsonError("Foto inválida.", 400);
    if (!acceptedTypes.has(photo.type)) return jsonError("Use JPG, PNG, WEBP ou GIF.", 415);
    if (photo.size <= 0 || photo.size > 8_000_000) return jsonError("A foto deve ter até 8 MB.", 413);
    if (!(await matchesImageSignature(photo))) return jsonError("O arquivo não é uma foto válida.", 415);
    const visitor = await bindings.DB.prepare("SELECT visitor_token FROM visitor_registry WHERE instagram = ? LIMIT 1").bind(instagram).first<VisitorRow>();
    if (!visitor?.visitor_token || visitor.visitor_token !== visitorToken) return jsonError("Essa assinatura já está em uso. Entre com o mesmo dispositivo.", 403);
    const rate = await takeRateLimit(bindings.DB, request, "gallery-upload", 12, 3600);
    if (!rate.allowed) return jsonError("Muitas tentativas. Espere um pouco antes de colar outra foto.", 429, 900);

    const id = crypto.randomUUID();
    const objectKey = `gallery/${instagram}/${id}`;
    storedObjectKey = objectKey;
    await bindings.PHOTOS.put(objectKey, photo.stream(), { httpMetadata: { contentType: photo.type } });
    const previous = await bindings.DB.prepare("SELECT id, object_key FROM gallery_photos WHERE instagram = ?").bind(instagram).all<{ id: string; object_key: string }>();
    const statements = previous.results.flatMap((item) => [
      bindings.DB.prepare("DELETE FROM gallery_vote_origins WHERE photo_id = ?").bind(item.id),
      bindings.DB.prepare("DELETE FROM gallery_removal_votes WHERE photo_id = ?").bind(item.id),
    ]);
    statements.push(
      bindings.DB.prepare("DELETE FROM gallery_photos WHERE instagram = ?").bind(instagram),
      bindings.DB.prepare("INSERT INTO gallery_photos (id, instagram, object_key) VALUES (?, ?, ?)").bind(id, instagram, objectKey),
    );
    await bindings.DB.batch(statements);
    storedObjectKey = null;
    for (const item of previous.results) {
      try { await bindings.PHOTOS.delete(item.object_key); }
      catch (error) { console.error("Old gallery object cleanup failed", error); }
    }
    return Response.json({ id, replaced: previous.results.length > 0 }, { status: 201 });
  } catch (error) {
    if (storedObjectKey) {
      try { await (env as unknown as GalleryEnv).PHOTOS?.delete(storedObjectKey); }
      catch (cleanupError) { console.error("Failed upload cleanup", cleanupError); }
    }
    console.error("Gallery upload failed", error);
    return jsonError("A foto não colou. Tente outra vez.", 500);
  }
}
