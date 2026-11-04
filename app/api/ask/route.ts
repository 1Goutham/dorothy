// POST /api/ask  { question, lang } -> { confident, results: [{ id, score }], answer? }
// Questions are not stored or logged.
import { generate, retrieve, warm } from "@/lib/rag";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const recent = new Map<string, number[]>(); // light per-instance rate limit
function limited(ip: string) {
  const now = Date.now();
  const w = (recent.get(ip) || []).filter((t) => now - t < 60000);
  w.push(now);
  recent.set(ip, w);
  return w.length > 30;
}

const json = (o: unknown, status = 200) =>
  Response.json(o, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  if (limited(ip)) return json({ error: "Too many questions at once. Please wait a moment." }, 429);
  let body: { question?: unknown; lang?: unknown; warm?: unknown };
  try { body = await request.json(); } catch { return json({ error: "Invalid request" }, 400); }
  if (body.warm) {
    await warm().catch(() => {});
    return json({ ok: true });
  }
  const question = String(body.question || "").trim().slice(0, 300);
  const lang = body.lang === "ta" ? "ta" : "en";
  if (!question) return json({ error: "Empty question" }, 400);
  try {
    const r = await retrieve(question);
    let answer: string | null = null;
    if (r.confident) {
      const related = r.results.slice(1).filter((x) => x.score > r.results[0].score - 0.08).map((x) => x.id);
      answer = await generate(question, lang, [r.results[0].id, ...related]).catch(() => null);
    }
    return json({ ...r, answer });
  } catch {
    return json({ error: "Retrieval unavailable" }, 503);
  }
}

export function GET() {
  return json({ ok: true, model: process.env.HF_EMBED_MODEL || "BAAI/bge-m3", generation: Boolean(process.env.HF_CHAT_MODEL) });
}
