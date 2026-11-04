/*
 * Dorothy AI retrieval (server only): BAAI/bge-m3 dense embeddings over the verified
 * knowledge base, blended with BM25 keyword scores, plus optional grounded generation.
 */
import { KB } from "@/data/knowledge";
import { answer as keywordAnswer, type Lang } from "@/lib/engine";

type Fetch = typeof fetch;
type Opts = { fetchImpl?: Fetch };

const model = () => process.env.HF_EMBED_MODEL || "BAAI/bge-m3";
const threshold = () => Number(process.env.DENSE_THRESHOLD || 0.55);

export const plain = (html: string) =>
  String(html)
    .replace(/<li>/g, "\n• ").replace(/<\/p>/g, "\n").replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/[ \t]+/g, " ").replace(/\n\s+/g, "\n").trim();

/* Every entry is represented by several texts; an entry scores as its best-matching text. */
function passages() {
  const out: { i: number; text: string }[] = [];
  KB.forEach((d, i) => {
    d.q.forEach((q) => out.push({ i, text: q }));
    out.push({ i, text: `${d.cat}: ${d.k.join(", ")}` });
    out.push({ i, text: plain(d.en).slice(0, 1200) });
    out.push({ i, text: plain(d.ta).slice(0, 1200) });
  });
  return out;
}

const norm = (v: number[]) => {
  let s = 0;
  for (const x of v) s += x * x;
  s = Math.sqrt(s) || 1;
  return v.map((x) => x / s);
};
const dot = (a: number[], b: number[]) => {
  let s = 0;
  for (let k = 0; k < a.length; k++) s += a[k] * b[k];
  return s;
};

/* Accepts pooled vectors [n][d] or token-level [n][tokens][d] (BGE-M3 dense = CLS token). */
function toVectors(json: unknown, n: number): number[][] {
  if (!Array.isArray(json)) throw new Error("embedding response is not an array");
  if (n === 1 && typeof json[0] === "number") return [norm(json as number[])];
  return (json as unknown[]).map((e) => {
    const row = e as unknown[];
    return norm((Array.isArray(row[0]) ? row[0] : row) as number[]);
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function embed(texts: string[], { fetchImpl = fetch }: Opts = {}): Promise<number[][]> {
  const url = process.env.EMBED_URL || `https://router.huggingface.co/hf-inference/models/${model()}/pipeline/feature-extraction`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = process.env.EMBED_TOKEN || process.env.HF_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  const out: number[][] = [];
  for (let s = 0; s < texts.length; s += 24) {
    const chunk = texts.slice(s, s + 24);
    for (let attempt = 0; ; attempt++) {
      const res = await fetchImpl(url, { method: "POST", headers, body: JSON.stringify({ inputs: chunk }), signal: AbortSignal.timeout(12000) });
      if (res.status === 503 && attempt < 3) { await sleep(4000); continue; } // model warming up
      if (!res.ok) throw new Error(`embedding request failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
      out.push(...toVectors(await res.json(), chunk.length));
      break;
    }
  }
  return out;
}

let indexPromise: Promise<{ i: number; v: number[] }[]> | null = null;
function loadIndex(opts: Opts) {
  if (!indexPromise) {
    indexPromise = (async () => {
      const ps = passages();
      const vecs = await embed(ps.map((p) => p.text), opts);
      return ps.map((p, k) => ({ i: p.i, v: vecs[k] }));
    })().catch((e) => {
      indexPromise = null;
      throw e;
    });
  }
  return indexPromise;
}

export async function warm(opts: Opts = {}) {
  await loadIndex(opts);
}

export type Ranked = { id: string; dense: number; keyword: number; score: number };

export async function retrieve(question: string, opts: Opts = {}) {
  const [index, [q]] = await Promise.all([loadIndex(opts), embed([question], opts)]);

  const dense = new Array(KB.length).fill(-1);
  for (const p of index) dense[p.i] = Math.max(dense[p.i], dot(q, p.v));

  // keyword evidence from the same BM25 engine the browser uses
  const bm = new Array(KB.length).fill(0);
  const r = keywordAnswer(question);
  const hits = "hits" in r ? r.hits : [];
  const top = hits[0] ? hits[0].score : 0;
  hits.forEach((h) => { bm[KB.indexOf(h.doc)] = top ? h.score / top : 0; });

  const ranked: Ranked[] = KB.map((d, i) => ({
    id: d.id, dense: dense[i], keyword: bm[i],
    score: 0.8 * dense[i] + 0.2 * bm[i] * Math.max(dense[i], 0),
  })).sort((a, b) => b.score - a.score);
  const best = ranked[0];
  const t = threshold();
  const confident = best.dense >= t || (best.keyword > 0.99 && best.dense >= t - 0.08);
  return { model: model(), confident, results: ranked.slice(0, 3) };
}

/* Optional: a grounded answer from a Hugging Face chat model, only from retrieved passages. */
export async function generate(question: string, lang: Lang, ids: string[], { fetchImpl = fetch }: Opts = {}) {
  const chatModel = process.env.HF_CHAT_MODEL;
  if (!chatModel || !process.env.HF_TOKEN) return null;
  const context = ids
    .map((id, n) => {
      const d = KB.find((x) => x.id === id);
      return d ? `[${n + 1}] ${plain(lang === "ta" ? d.ta : d.en)}` : "";
    })
    .filter(Boolean)
    .join("\n\n");
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
    signal: AbortSignal.timeout(15000),
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.HF_TOKEN}` },
    body: JSON.stringify({
      model: chatModel, temperature: 0.2, max_tokens: 400,
      messages: [
        { role: "system", content: system },
        { role: "user", content: `Verified passages:\n${context}\n\nQuestion: ${question}` },
      ],
    }),
  });
  if (!res.ok) return null;
  const j = await res.json();
  const text: string | undefined = j?.choices?.[0]?.message?.content;
  return text ? text.replace(/[\u2013\u2014]/g, ",").trim() : null;
}
