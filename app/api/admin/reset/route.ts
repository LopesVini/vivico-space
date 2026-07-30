import { env } from "cloudflare:workers";

type ResetEnv = {
  DB: D1Database;
  PHOTOS?: R2Bucket;
  RESET_TOKEN?: string;
};

type PhotoObject = { object_key: string };

export async function POST(request: Request) {
  const bindings = env as unknown as ResetEnv;
  const suppliedToken = request.headers.get("x-vivico-reset-token") ?? "";

  if (!bindings.RESET_TOKEN || suppliedToken !== bindings.RESET_TOKEN) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  if (!bindings.DB || !bindings.PHOTOS) {
    return Response.json({ error: "Storage unavailable." }, { status: 503 });
  }

  const photos = await bindings.DB
    .prepare("SELECT object_key FROM gallery_photos")
    .all<PhotoObject>();

  for (const photo of photos.results) {
    await bindings.PHOTOS.delete(photo.object_key);
  }

  await bindings.DB.batch([
    bindings.DB.prepare("DELETE FROM gallery_vote_origins"),
    bindings.DB.prepare("DELETE FROM gallery_removal_votes"),
    bindings.DB.prepare("DELETE FROM gallery_photos"),
    bindings.DB.prepare("DELETE FROM visitor_entries"),
    bindings.DB.prepare("DELETE FROM visitor_registry"),
    bindings.DB.prepare("DELETE FROM abuse_events"),
    bindings.DB.prepare("DELETE FROM sqlite_sequence WHERE name IN ('visitor_entries', 'visitor_registry')"),
  ]);

  return Response.json({ reset: true, deletedPhotos: photos.results.length });
}
