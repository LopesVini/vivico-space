const ABUSE_NAMESPACE = "vivico-mural-2026";

export const abuseTable = `CREATE TABLE IF NOT EXISTS abuse_events (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`;

export const voteOriginsTable = `CREATE TABLE IF NOT EXISTS gallery_vote_origins (
  photo_id TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (photo_id, fingerprint),
  FOREIGN KEY (photo_id) REFERENCES gallery_photos(id) ON DELETE CASCADE
)`;

export function mutationFromSameSite(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return false;
  const fetchSite = request.headers.get("sec-fetch-site");
  return !fetchSite || fetchSite === "same-origin";
}

export async function requestFingerprint(request: Request) {
  const forwarded = request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-real-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0]
    ?? "local";
  const bytes = new TextEncoder().encode(`${ABUSE_NAMESPACE}:${forwarded.trim()}`);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function takeRateLimit(db: D1Database, request: Request, kind: string, limit: number, windowSeconds: number) {
  const fingerprint = await requestFingerprint(request);
  await db.prepare("DELETE FROM abuse_events WHERE created_at < datetime('now', '-2 days')").run();
  const row = await db.prepare(`SELECT COUNT(*) AS total FROM abuse_events
    WHERE kind = ? AND fingerprint = ? AND created_at >= datetime('now', ?)`)
    .bind(kind, fingerprint, `-${windowSeconds} seconds`).first<{ total: number }>();
  if (Number(row?.total ?? 0) >= limit) return { allowed: false, fingerprint };
  await db.prepare("INSERT INTO abuse_events (id, kind, fingerprint) VALUES (?, ?, ?)")
    .bind(crypto.randomUUID(), kind, fingerprint).run();
  return { allowed: true, fingerprint };
}

export function jsonError(error: string, status: number, retryAfter?: number) {
  const headers = retryAfter ? { "retry-after": String(retryAfter) } : undefined;
  return Response.json({ error }, { status, headers });
}
