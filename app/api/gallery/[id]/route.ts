import { env } from "cloudflare:workers";
import { abuseTable, jsonError, mutationFromSameSite, requestFingerprint, takeRateLimit, voteOriginsTable } from "../../../lib/security";

type GalleryEnv = { DB: D1Database; PHOTOS?: R2Bucket };
type PhotoRow = { instagram: string; object_key: string };
type VisitorRow = { visitor_token: string | null; first_seen_at: string };

const votesTable = `CREATE TABLE IF NOT EXISTS gallery_removal_votes (
  photo_id TEXT NOT NULL,
  instagram TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (photo_id, instagram),
  FOREIGN KEY (photo_id) REFERENCES gallery_photos(id) ON DELETE CASCADE
)`;

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const bindings = env as unknown as GalleryEnv;
    if (!bindings.DB || !bindings.PHOTOS) return new Response("Mural indisponível", { status: 503 });
    const { id } = await context.params;
    if (!/^[a-f0-9-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });
    const row = await bindings.DB.prepare("SELECT object_key FROM gallery_photos WHERE id = ? LIMIT 1").bind(id).first<{ object_key: string }>();
    if (!row) return new Response("Not found", { status: 404 });
    const object = await bindings.PHOTOS.get(row.object_key);
    if (!object) return new Response("Not found", { status: 404 });
    const headers = new Headers({
      "cache-control": "public, max-age=86400, immutable",
      "content-type": object.httpMetadata?.contentType ?? "image/jpeg",
      "content-disposition": "inline",
      "cross-origin-resource-policy": "same-origin",
      "x-content-type-options": "nosniff",
    });
    return new Response(object.body, { headers });
  } catch (error) {
    console.error("Gallery image load failed", error);
    return new Response("Could not load photo", { status: 500 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!mutationFromSameSite(request)) return jsonError("Origem inválida.", 403);
    const bindings = env as unknown as GalleryEnv;
    if (!bindings.DB || !bindings.PHOTOS) return jsonError("Mural indisponível.", 503);
    await bindings.DB.batch([
      bindings.DB.prepare(votesTable),
      bindings.DB.prepare(voteOriginsTable),
      bindings.DB.prepare(abuseTable),
    ]);
    const { id } = await context.params;
    if (!/^[a-f0-9-]{36}$/i.test(id)) return jsonError("Foto não encontrada.", 404);
    const body = await request.json().catch(() => null) as { instagram?: unknown; visitorToken?: unknown } | null;
    if (!body) return jsonError("Pedido inválido.", 400);
    const instagram = String(body.instagram ?? "").trim().replace(/^@/, "").toLowerCase();
    const visitorToken = String(body.visitorToken ?? "");
    if (!/^[a-z0-9._]{1,30}$/.test(instagram)) return jsonError("Visitante inválido.", 400);
    const visitor = await bindings.DB.prepare("SELECT visitor_token, first_seen_at FROM visitor_registry WHERE instagram = ? LIMIT 1").bind(instagram).first<VisitorRow>();
    if (!visitor?.visitor_token || visitor.visitor_token !== visitorToken) return jsonError("Entre novamente antes de marcar.", 403);
    const photo = await bindings.DB.prepare("SELECT instagram, object_key FROM gallery_photos WHERE id = ? LIMIT 1").bind(id).first<PhotoRow>();
    if (!photo) return jsonError("A foto já saiu do muro.", 404);
    if (photo.instagram === instagram) return jsonError("Você não pode marcar sua própria foto.", 409);
    const isOldEnough = await bindings.DB.prepare("SELECT datetime(?) <= datetime('now', '-10 minutes') AS allowed").bind(visitor.first_seen_at).first<{ allowed: number }>();
    if (!isOldEnough?.allowed) return jsonError("Espere 10 minutos após a primeira entrada para marcar uma foto.", 429, 600);
    const fingerprint = await requestFingerprint(request);
    const existingOrigin = await bindings.DB.prepare("SELECT 1 AS found FROM gallery_vote_origins WHERE photo_id = ? AND fingerprint = ? LIMIT 1").bind(id, fingerprint).first();
    if (existingOrigin) return jsonError("Esta rede já marcou essa foto.", 409);
    const rate = await takeRateLimit(bindings.DB, request, "gallery-vote", 30, 3600);
    if (!rate.allowed) return jsonError("Muitas marcações em pouco tempo. Tente mais tarde.", 429, 900);
    await bindings.DB.batch([
      bindings.DB.prepare("INSERT INTO gallery_vote_origins (photo_id, fingerprint) VALUES (?, ?)").bind(id, fingerprint),
      bindings.DB.prepare("INSERT OR IGNORE INTO gallery_removal_votes (photo_id, instagram) VALUES (?, ?)").bind(id, instagram),
    ]);
    const count = await bindings.DB.prepare("SELECT COUNT(*) AS total FROM gallery_removal_votes WHERE photo_id = ?").bind(id).first<{ total: number }>();
    const total = Number(count?.total ?? 0);
    if (total >= 15) {
      await bindings.DB.batch([
        bindings.DB.prepare("DELETE FROM gallery_vote_origins WHERE photo_id = ?").bind(id),
        bindings.DB.prepare("DELETE FROM gallery_removal_votes WHERE photo_id = ?").bind(id),
        bindings.DB.prepare("DELETE FROM gallery_photos WHERE id = ?").bind(id),
      ]);
      try { await bindings.PHOTOS.delete(photo.object_key); }
      catch (error) { console.error("Removed gallery object cleanup failed", error); }
      return Response.json({ disappeared: true, removalVotes: total });
    }
    return Response.json({ marked: true, removalVotes: total });
  } catch (error) {
    console.error("Gallery removal vote failed", error);
    return jsonError("Não foi possível marcar a foto.", 500);
  }
}
