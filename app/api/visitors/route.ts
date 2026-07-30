import { env } from "cloudflare:workers";

type Row = { id: number; name: string; instagram: string; first_seen_at: string; message: string | null; visitor_token: string | null };
const createTable = `CREATE TABLE IF NOT EXISTS visitor_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  instagram TEXT NOT NULL UNIQUE,
  first_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  message TEXT,
  visitor_token TEXT
)`;

async function database() { if (!env.DB) throw new Error("Database unavailable"); await env.DB.prepare(createTable).run(); for (const statement of ["ALTER TABLE visitor_registry ADD COLUMN message TEXT", "ALTER TABLE visitor_registry ADD COLUMN visitor_token TEXT"]) try { await env.DB.prepare(statement).run(); } catch {} return env.DB; }
const present = (row: Row) => ({ id: row.id, name: row.name, instagram: row.instagram, firstSeenAt: `${row.first_seen_at.replace(" ", "T")}Z`, message: row.message ?? null });

export async function GET() {
  try { const db = await database(); const result = await db.prepare("SELECT id, name, instagram, first_seen_at, message FROM visitor_registry ORDER BY first_seen_at ASC LIMIT 500").all<Row>(); return Response.json({ entries: result.results.map(present) }, { headers: { "cache-control": "no-store" } }); }
  catch { return Response.json({ entries: [] }, { status: 503 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const instagram = String(body.instagram ?? "").trim().replace(/^@/, "").toLowerCase().slice(0, 30);
    if (!/^[a-z0-9._]{1,30}$/.test(instagram)) return Response.json({ error: "Invalid visitor" }, { status: 400 });
    const db = await database();
    const current = await db.prepare("SELECT id, name, instagram, first_seen_at, message, visitor_token FROM visitor_registry WHERE instagram = ? LIMIT 1").bind(instagram).first<Row>();
    if (typeof body.message !== "undefined") {
      const message = typeof body.message === "string" ? body.message.trim().slice(0, 280) : "";
      if (!current) return Response.json({ error: "Visitor not found" }, { status: 404 });
      if (!message) return Response.json({ error: "Invalid message" }, { status: 400 });
      if (typeof body.visitorToken !== "string" || body.visitorToken !== current.visitor_token) return Response.json({ error: "Visitor not recognized" }, { status: 403 });
      await db.prepare("UPDATE visitor_registry SET message = ? WHERE instagram = ?").bind(message, instagram).run();
      const updated = await db.prepare("SELECT id, name, instagram, first_seen_at, message, visitor_token FROM visitor_registry WHERE instagram = ? LIMIT 1").bind(instagram).first<Row>();
      return Response.json({ entry: updated ? present(updated) : null, updated: true });
    }
    const suppliedToken = typeof body.visitorToken === "string" ? body.visitorToken : "";
    if (current?.visitor_token && suppliedToken === current.visitor_token) return Response.json({ entry: present(current), existing: true, visitorToken: current.visitor_token, canEdit: true });
    if (current && !current.visitor_token) {
      const visitorToken = crypto.randomUUID();
      await db.prepare("UPDATE visitor_registry SET visitor_token = ? WHERE instagram = ?").bind(visitorToken, instagram).run();
      return Response.json({ entry: present(current), existing: true, visitorToken, canEdit: true });
    }
    if (current) return Response.json({ entry: present(current), existing: true, canEdit: false });
    const name = `@${instagram}`;
    const visitorToken = crypto.randomUUID();
    await db.prepare("INSERT INTO visitor_registry (name, instagram, visitor_token) VALUES (?, ?, ?)").bind(name, instagram, visitorToken).run();
    const created = await db.prepare("SELECT id, name, instagram, first_seen_at, message, visitor_token FROM visitor_registry WHERE instagram = ? LIMIT 1").bind(instagram).first<Row>();
    return Response.json({ entry: created ? present(created) : null, existing: false, visitorToken, canEdit: true }, { status: 201 });
  } catch { return Response.json({ error: "Could not enter" }, { status: 500 }); }
}
