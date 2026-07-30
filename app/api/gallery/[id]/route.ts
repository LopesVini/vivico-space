import { env } from "cloudflare:workers";

type GalleryEnv = { DB: D1Database; PHOTOS?: R2Bucket };
type PhotoRow = { instagram: string; object_key: string };
type VisitorRow = { visitor_token: string | null };

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
    if (!bindings.PHOTOS) return new Response("Photo storage unavailable", { status: 503 });
    const { id } = await context.params;
    const row = await bindings.DB.prepare("SELECT object_key FROM gallery_photos WHERE id = ? LIMIT 1").bind(id).first<{ object_key: string }>();
    if (!row) return new Response("Not found", { status: 404 });
    const object = await bindings.PHOTOS.get(row.object_key);
    if (!object) return new Response("Not found", { status: 404 });
    const headers = new Headers({ "cache-control": "public, max-age=86400", "content-type": object.httpMetadata?.contentType ?? "image/jpeg" });
    return new Response(object.body, { headers });
  } catch { return new Response("Could not load photo", { status: 500 }); }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const bindings = env as unknown as GalleryEnv;
    if (!bindings.DB || !bindings.PHOTOS) return Response.json({ error: "Mural indisponível." }, { status: 503 });
    await bindings.DB.prepare(votesTable).run();
    const { id } = await context.params;
    const body = await request.json() as { instagram?: unknown; visitorToken?: unknown };
    const instagram = String(body.instagram ?? "").trim().replace(/^@/, "").toLowerCase();
    const visitorToken = String(body.visitorToken ?? "");
    if (!/^[a-z0-9._]{1,30}$/.test(instagram)) return Response.json({ error: "Visitante inválido." }, { status: 400 });
    const visitor = await bindings.DB.prepare("SELECT visitor_token FROM visitor_registry WHERE instagram = ? LIMIT 1").bind(instagram).first<VisitorRow>();
    if (!visitor?.visitor_token || visitor.visitor_token !== visitorToken) return Response.json({ error: "Entre novamente antes de marcar." }, { status: 403 });
    const photo = await bindings.DB.prepare("SELECT instagram, object_key FROM gallery_photos WHERE id = ? LIMIT 1").bind(id).first<PhotoRow>();
    if (!photo) return Response.json({ error: "A foto já saiu do muro." }, { status: 404 });
    if (photo.instagram === instagram) return Response.json({ error: "Você não pode marcar sua própria foto." }, { status: 409 });
    await bindings.DB.prepare("INSERT OR IGNORE INTO gallery_removal_votes (photo_id, instagram) VALUES (?, ?)").bind(id, instagram).run();
    const count = await bindings.DB.prepare("SELECT COUNT(*) AS total FROM gallery_removal_votes WHERE photo_id = ?").bind(id).first<{ total: number }>();
    if ((count?.total ?? 0) >= 15) {
      await bindings.PHOTOS.delete(photo.object_key);
      await bindings.DB.batch([
        bindings.DB.prepare("DELETE FROM gallery_removal_votes WHERE photo_id = ?").bind(id),
        bindings.DB.prepare("DELETE FROM gallery_photos WHERE id = ?").bind(id),
      ]);
      return Response.json({ disappeared: true, removalVotes: count?.total ?? 15 });
    }
    return Response.json({ marked: true, removalVotes: count?.total ?? 0 });
  } catch (error) {
    console.error("Gallery removal vote failed", error);
    return Response.json({ error: "Não foi possível marcar a foto." }, { status: 500 });
  }
}
