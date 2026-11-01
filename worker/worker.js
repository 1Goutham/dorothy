/*
 * Dorothy AI — optional grounded-answer worker (Cloudflare Workers, free tier).
 *
 * The browser does retrieval and sends { question, lang, passages }. This worker asks a
 * small open model (Workers AI) to answer ONLY from those verified passages, in Tamil or
 * English. Nothing is logged or stored. If anything fails, the site falls back to showing
 * the verified passage directly, so this is a nice-to-have, never a dependency.
 *
 * Deploy: see worker/README.md
 */
const MODEL = "@cf/meta/llama-3.1-8b-instruct";

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
    const cors = {
      "Access-Control-Allow-Origin": allowed.includes(origin) ? origin : allowed[0] || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });

    let body;
    try { body = await request.json(); } catch { return json({ error: "bad json" }, 400, cors); }
    const question = String(body.question || "").slice(0, 400);
    const lang = body.lang === "ta" ? "ta" : "en";
    const passages = Array.isArray(body.passages) ? body.passages.slice(0, 3) : [];
    if (!question || !passages.length) return json({ error: "missing input" }, 400, cors);

    const context = passages.map((p, i) => `[${i + 1}] ${String(p.text || "").slice(0, 2000)}`).join("\n\n");
    const system = [
      "You are Dorothy, a warm, calm assistant for transgender people in Tamil Nadu, India.",
      "Answer ONLY using the verified passages provided. Do not add facts, numbers, names or links that are not in them.",
      "If the passages do not answer the question, say you don't have verified information and suggest contacting the Dorothy team.",
      "Never give medical, legal or psychological advice; describe services and rights and point to qualified people.",
      "If the person may be in danger, put emergency number 112 and Tele-MANAS 14416 first.",
      "Use simple, respectful language. Keep it under 150 words. Plain text, short paragraphs, '• ' for lists.",
      lang === "ta" ? "Reply in simple, natural Tamil." : "Reply in English.",
    ].join(" ");

    try {
      const out = await env.AI.run(MODEL, {
        messages: [
          { role: "system", content: system },
          { role: "user", content: `Verified passages:\n${context}\n\nQuestion: ${question}` },
        ],
        max_tokens: 400,
        temperature: 0.2,
      });
      return json({ answer: String(out.response || "").trim() }, 200, cors);
    } catch (e) {
      return json({ error: "model unavailable" }, 502, cors);
    }
  },
};

const json = (o, status, headers) =>
  new Response(JSON.stringify(o), { status, headers: { ...headers, "Content-Type": "application/json", "Cache-Control": "no-store" } });
