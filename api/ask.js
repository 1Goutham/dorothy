// POST /api/ask  { question, lang } -> { confident, results: [{ id, score }], answer? }
// Questions are not stored or logged.
import { retrieve, generate, warm } from "./_lib/rag.js";

const hits = new Map(); // light per-instance rate limit
function limited(ip) {
  const now = Date.now(), w = hits.get(ip) || [];
  const recent = w.filter((t) => now - t < 60000);
  recent.push(now); hits.set(ip, recent);
  return recent.length > 30;
}
const json = (o, status = 200) => new Response(JSON.stringify(o), {
  status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
});

export async function POST(request) {
  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  if (limited(ip)) return json({ error: "Too many questions at once. Please wait a moment." }, 429);
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid request" }, 400); }
  if (body.warm) { await warm().catch(() => {}); return json({ ok: true }); }
  const question = String(body.question || "").trim().slice(0, 300);
  const lang = body.lang === "ta" ? "ta" : "en";
  if (!question) return json({ error: "Empty question" }, 400);
  try {
    const r = await retrieve(question);
    let answer = null;
    if (r.confident) {
      const related = r.results.slice(1).filter((x) => x.score > r.results[0].score - 0.08).map((x) => x.id);
      answer = await generate(question, lang, [r.results[0].id, ...related]).catch(() => null);
    }
    return json({ ...r, answer });
  } catch (e) {
    return json({ error: "Retrieval unavailable" }, 503);
  }
}

export function GET() {
  return json({ ok: true, model: process.env.HF_EMBED_MODEL || "BAAI/bge-m3", generation: Boolean(process.env.HF_CHAT_MODEL) });
}
