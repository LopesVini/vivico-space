import { env } from "cloudflare:workers";

type GalleryEnv = { DB: D1Database; PHOTOS?: R2Bucket };
type VisitorRow = { visitor_token: string | null };
type PhotoRow = { id: string; instagram: string; created_at: string };

const galleryTable = `CREATE TABLE IF NOT EXISTS gallery_photos (
  id TEXT PRIMARY KEY,
  instagram TEXT NOT NULL,
  object_key TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`;

async function setup() {
  const bindings = env as unknown as GalleryEnv;
  if (!bindings.DB) throw new Error("Database unavailable");
  await bindings.DB.prepare(galleryTable).run();
  return bindings;
}

export async function GET() {
  try {
    const bindings = await setup();
    const rows = await bindings.DB.prepare("SELECT id, instagram, created_at FROM gallery_photos ORDER BY created_at DESC LIMIT 200").all<PhotoRow>();
    return Response.json({ photos: rows.results.map((row) => ({ id: row.id, instagram: row.instagram, createdAt: `${row.created_at.replace(" ", "T")}Z`, src: `/api/gallery/${row.id}` })) }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("Gallery list failed", error);
    return Response.json({ error: "Mural unavailable", photos: [] }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const bindings = await setup();
    if (!bindings.PHOTOS) return Response.json({ error: "O depósito de fotos não está conectado." }, { status: 503 });
    const form = await request.formData();
    const instagram = String(form.get("instagram") ?? "").trim().replace(/^@/, "").toLowerCase();
    const visitorToken = String(form.get("visitorToken") ?? "");
    const photo = form.get("photo");
    const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
    if (!/^[a-z0-9._]{1,30}$/.test(instagram) || !(photo instanceof File)) return Response.json({ error: "Foto inválida." }, { status: 400 });
    if (!acceptedTypes.has(photo.type)) return Response.json({ error: "Use JPG, PNG, WEBP ou GIF." }, { status: 415 });
    if (photo.size <= 0 || photo.size > 8_000_000) return Response.json({ error: "A foto deve ter até 8 MB." }, { status: 413 });
    const visitor = await bindings.DB.prepare("SELECT visitor_token FROM visitor_registry WHERE instagram = ? LIMIT 1").bind(instagram).first<VisitorRow>();
    if (!visitor?.visitor_token || visitor.visitor_token !== visitorToken) return Response.json({ error: "Entre novamente antes de postar." }, { status: 403 });
    const id = crypto.randomUUID();
    const objectKey = `gallery/${instagram}/${id}`;
    await bindings.PHOTOS.put(objectKey, photo.stream(), { httpMetadata: { contentType: photo.type } });
    const previous = await bindings.DB.prepare("SELECT id, object_key FROM gallery_photos WHERE instagram = ?").bind(instagram).all<{ id: string; object_key: string }>();
    for (const item of previous.results) await bindings.PHOTOS.delete(item.object_key);
    for (const item of previous.results) await bindings.DB.prepare("DELETE FROM gallery_removal_votes WHERE photo_id = ?").bind(item.id).run().catch(() => undefined);
    await bindings.DB.prepare("DELETE FROM gallery_photos WHERE instagram = ?").bind(instagram).run();
    await bindings.DB.prepare("INSERT INTO gallery_photos (id, instagram, object_key) VALUES (?, ?, ?)").bind(id, instagram, objectKey).run();
    return Response.json({ id, replaced: previous.results.length > 0 }, { status: 201 });
  } catch (error) {
    console.error("Gallery upload failed", error);
    return Response.json({ error: "A foto não colou. Tente outra vez." }, { status: 500 });
  }
}
