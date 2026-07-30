import { env } from "cloudflare:workers";
import { abuseTable, jsonError, mutationFromSameSite, takeRateLimit } from "../../lib/security";

const pulseTable = `CREATE TABLE IF NOT EXISTS terminal_pulse (
  id INTEGER PRIMARY KEY,
  last_at TEXT NOT NULL
)`;

export async function POST(request: Request) {
  try {
    if (!mutationFromSameSite(request)) return jsonError("Origem inválida.", 403);
    if (!env.DB) return jsonError("Pulso indisponível.", 503);
    await env.DB.batch([env.DB.prepare(pulseTable), env.DB.prepare(abuseTable)]);
    const rate = await takeRateLimit(env.DB, request, "terminal-pulse", 20, 3600);
    if (!rate.allowed) return jsonError("O pulso precisa descansar.", 429, 300);

    const previous = await env.DB.prepare("SELECT last_at FROM terminal_pulse WHERE id = 1 LIMIT 1").first<{ last_at: string }>();
    const pulsedAt = new Date().toISOString();
    await env.DB.prepare(`INSERT INTO terminal_pulse (id, last_at) VALUES (1, ?)
      ON CONFLICT(id) DO UPDATE SET last_at = excluded.last_at`).bind(pulsedAt).run();

    return Response.json({ previousAt: previous?.last_at ?? null, pulsedAt }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("Terminal pulse failed", error);
    return jsonError("Não foi possível sentir o pulso.", 500);
  }
}
