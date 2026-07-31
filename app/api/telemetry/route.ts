import { env } from "cloudflare:workers";
import { jsonError, mutationFromSameSite, takeRateLimit } from "../../lib/security";

const visitorTable = `CREATE TABLE IF NOT EXISTS anonymous_visitors (
  visitor_id TEXT PRIMARY KEY,
  first_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at TEXT NOT NULL DEFAULT (datetime('now'))
)`;

const eventTable = `CREATE TABLE IF NOT EXISTS anonymous_events (
  visitor_id TEXT NOT NULL,
  event TEXT NOT NULL,
  event_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (visitor_id, event, event_date),
  FOREIGN KEY (visitor_id) REFERENCES anonymous_visitors(visitor_id) ON DELETE CASCADE
)`;

const allowedEvents = new Set(["arrival", "entered_guest", "entered_registered", "opened_gallery", "opened_terminal", "posted_photo"]);

export async function POST(request: Request) {
  try {
    if (!mutationFromSameSite(request)) return jsonError("Origem inválida.", 403);
    const body = await request.json().catch(() => null) as { visitorId?: unknown; event?: unknown } | null;
    const visitorId = typeof body?.visitorId === "string" ? body.visitorId : "";
    const event = typeof body?.event === "string" ? body.event : "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(visitorId) || !allowedEvents.has(event)) return jsonError("Evento inválido.", 400);
    if (!env.DB) throw new Error("Database unavailable");
    await env.DB.batch([env.DB.prepare(visitorTable), env.DB.prepare(eventTable)]);
    const rate = await takeRateLimit(env.DB, request, "anonymous-telemetry", 300, 3600);
    if (!rate.allowed) return jsonError("Muitos eventos nesta rede.", 429, 3600);
    await env.DB.batch([
      env.DB.prepare("INSERT INTO anonymous_visitors (visitor_id) VALUES (?) ON CONFLICT(visitor_id) DO UPDATE SET last_seen_at = datetime('now')").bind(visitorId),
      env.DB.prepare("INSERT OR IGNORE INTO anonymous_events (visitor_id, event, event_date) VALUES (?, ?, date('now'))").bind(visitorId, event),
    ]);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Anonymous telemetry failed", error);
    return jsonError("Telemetria indisponível.", 503);
  }
}
