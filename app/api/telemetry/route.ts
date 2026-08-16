import { env } from "cloudflare:workers";
import { jsonError, mutationFromSameSite, takeRateLimit } from "../../lib/security";

const visitorTable = `CREATE TABLE IF NOT EXISTS anonymous_visitors (
  visitor_id TEXT PRIMARY KEY,
  country TEXT,
  region TEXT,
  city TEXT,
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
    
    // @ts-expect-error - cf property is injected by Cloudflare Workers
    const country = typeof request.cf?.country === "string" ? request.cf.country : null;
    // @ts-expect-error - cf property is injected by Cloudflare Workers
    const region = typeof request.cf?.region === "string" ? request.cf.region : null;
    // @ts-expect-error - cf property is injected by Cloudflare Workers
    const city = typeof request.cf?.city === "string" ? request.cf.city : null;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(visitorId) || !allowedEvents.has(event)) return jsonError("Evento inválido.", 400);
    if (!env.DB) throw new Error("Database unavailable");
    await env.DB.batch([env.DB.prepare(visitorTable), env.DB.prepare(eventTable)]);
    const rate = await takeRateLimit(env.DB, request, "anonymous-telemetry", 300, 3600);
    if (!rate.allowed) return jsonError("Muitos eventos nesta rede.", 429, 3600);
    await env.DB.batch([
      env.DB.prepare("INSERT INTO anonymous_visitors (visitor_id, country, region, city) VALUES (?, ?, ?, ?) ON CONFLICT(visitor_id) DO UPDATE SET last_seen_at = datetime('now'), country = COALESCE(excluded.country, anonymous_visitors.country), region = COALESCE(excluded.region, anonymous_visitors.region), city = COALESCE(excluded.city, anonymous_visitors.city)").bind(visitorId, country, region, city),
      env.DB.prepare("INSERT OR IGNORE INTO anonymous_events (visitor_id, event, event_date) VALUES (?, ?, date('now'))").bind(visitorId, event),
    ]);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Anonymous telemetry failed", error);
    return jsonError("Telemetria indisponível.", 503);
  }
}
