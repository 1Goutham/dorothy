// Dorothy AI retrieval: BGE-M3 dense embeddings over the verified knowledge base,
// blended with BM25 keyword scores. The knowledge base is the same file the site ships.
const EMBED_MODEL = process.env.HF_EMBED_MODEL || "BAAI/bge-m3";
const THRESHOLD = Number(process.env.DENSE_THRESHOLD || 0.55);

let kbPromise = null;
async function loadKb() {
  if (!kbPromise) {
    kbPromise = (async () => {
      globalThis.window = globalThis.window || globalThis;
      await import("../../src/data/knowledge.js");
      await import("../../src/js/dorothy-ai.js");
      return { kb: globalThis.DOROTHY_KB, engine: globalThis.DorothyEngine };
    })();
  }
  return kbPromise;
}

const plain = (html) => String(html).replace(/<li>/g, "\n• ").replace(/<\/p>/g, "\n").replace(/<[^>]+>/g, " ")
  .replace(/&amp;/g, "&").replace(/[ \t]+/g, " ").replace(/\n\s+/g, "\n").trim();

/* Every entry is represented by several texts; an entry scores as its best-matching text. */
function passages(kb) {
  const out = [];
  kb.forEach((d, i) => {
    d.q.forEach((q) => out.push({ i, text: q }));
    out.push({ i, text: `${d.cat}: ${d.k.join(", ")}` });
    out.push({ i, text: plain(d.en).slice(0, 1200) });
    out.push({ i, text: plain(d.ta).slice(0, 1200) });
  });
  return out;
}

const norm = (v) => { let s = 0; for (const x of v) s += x * x; s = Math.sqrt(s) || 1; return v.map((x) => x / s); };
const dot = (a, b) => { let s = 0; for (let k = 0; k < a.length; k++) s += a[k] * b[k]; return s; };

/* Accepts pooled vectors [n][d] or token-level [n][tokens][d] (BGE-M3 dense = CLS token). */
function toVectors(json, n) {
  if (!Array.isArray(json)) throw new Error("embedding response is not an array");
  if (n === 1 && typeof json[0] === "number") return [norm(json)];
  return json.map((e) => norm(Array.isArray(e[0]) ? e[0] : e));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function embed(texts, { fetchImpl = fetch } = {}) {
  const url = process.env.EMBED_URL ||
    `https://router.huggingface.co/hf-inference/models/${EMBED_MODEL}/pipeline/feature-extraction`;
  const headers = { "Content-Type": "application/json" };
  const token = process.env.EMBED_TOKEN || process.env.HF_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  const out = [];
  for (let s = 0; s < texts.length; s += 24) {
    const chunk = texts.slice(s, s + 24);
    for (let attempt = 0; ; attempt++) {
      const res = await fetchImpl(url, { method: "POST", headers, body: JSON.stringify({ inputs: chunk }) });
      if (res.status === 503 && attempt < 3) { await sleep(4000); continue; } // model warming up
      if (!res.ok) throw new Error(`embedding request failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
      out.push(...toVectors(await res.json(), chunk.length));
      break;
    }
  }
  return out;
}

let indexPromise = null;
async function loadIndex(opts) {
  const { kb } = await loadKb();
  if (!indexPromise) {
    indexPromise = (async () => {
      const ps = passages(kb);
      const vecs = await embed(ps.map((p) => p.text), opts);
      return ps.map((p, k) => ({ i: p.i, v: vecs[k] }));
    })().catch((e) => { indexPromise = null; throw e; });
  }
  return indexPromise;
}

export async function warm(opts = {}) { await loadIndex(opts); }

export async function retrieve(question, opts = {}) {
  const { kb, engine } = await loadKb();
  const [index, [q]] = await Promise.all([loadIndex(opts), embed([question], opts)]);

  const dense = new Array(kb.length).fill(-1);
  for (const p of index) dense[p.i] = Math.max(dense[p.i], dot(q, p.v));

  // keyword evidence from the same BM25 engine the browser uses
  const bm = new Array(kb.length).fill(0);
  const hits = engine.answer(question).hits || [];
  const top = hits[0] ? hits[0].score : 0;
  hits.forEach((h) => { bm[kb.indexOf(h.doc)] = top ? h.score / top : 0; });

  const ranked = kb.map((d, i) => ({ id: d.id, dense: dense[i], keyword: bm[i], score: 0.8 * dense[i] + 0.2 * bm[i] * Math.max(dense[i], 0) }))
    .sort((a, b) => b.score - a.score);
  const best = ranked[0];
  const confident = best.dense >= THRESHOLD || (best.keyword > 0.99 && best.dense >= THRESHOLD - 0.08);
  return { model: EMBED_MODEL, confident, results: ranked.slice(0, 3) };
}

/* Optional: a grounded answer from a Hugging Face chat model, only from retrieved passages. */
export async function generate(question, lang, ids, { fetchImpl = fetch } = {}) {
  const model = process.env.HF_CHAT_MODEL;
  if (!model || !process.env.HF_TOKEN) return null;
  const { kb } = await loadKb();
  const context = ids.map((id, n) => {
    const d = kb.find((x) => x.id === id);
    return `[${n + 1}] ${plain(lang === "ta" ? d.ta : d.en)}`;
  }).join("\n\n");
  const system = [
    "You are Dorothy, a warm, calm assistant for transgender people in Tamil Nadu, India.",
    "Answer ONLY from the verified passages. Never add facts, numbers, names or links that are not in them.",
    "If they do not answer the question, say you don't have verified information and suggest contacting the Dorothy team.",
    "Never give medical, legal or psychological advice. Describe services and rights and point to qualified people.",
    "Keep it under 140 words, plain text, short paragraphs, '• ' for lists. Do not use long dashes.",
    lang === "ta" ? "Reply in simple, natural Tamil." : "Reply in English.",
  ].join(" ");
  const res = await fetchImpl("https://router.huggingface.co/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.HF_TOKEN}` },
    body: JSON.stringify({
      model, temperature: 0.2, max_tokens: 400,
      messages: [{ role: "system", content: system }, { role: "user", content: `Verified passages:\n${context}\n\nQuestion: ${question}` }],
    }),
  });
  if (!res.ok) return null;
  const j = await res.json();
  const text = j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
  return text ? text.replace(/[\u2013\u2014]/g, ",").trim() : null;
}
