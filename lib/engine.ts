/*
 * Dorothy AI keyword engine (BM25 with Tamil-aware matching), safety checks and small talk.
 * Shared by the chat component in the browser and the /api/ask route on the server.
 */
import { CRISIS, KB, type KBEntry } from "@/data/knowledge";

export type Lang = "en" | "ta";
export type Hit = { doc: KBEntry; score: number; coverage: number };
export type EngineResult =
  | { type: "empty" | "greet" | "thanks"; lang: Lang }
  | { type: "crisis"; lang: Lang; doc: KBEntry }
  | { type: "unknown"; lang: Lang; hits: Hit[] }
  | { type: "answer"; lang: Lang; doc: KBEntry; related: KBEntry[]; hits: Hit[] };

export const TA = /[஀-௿]/;

const STOP = new Set(
  ("a an the is are was were be been am i me my we our you your it its of to in on for at by with from " +
    "and or but if so do does did can could should would will shall may might what how who whom which where when why " +
    "this that these those there here please tell about any some get got have has had need want just also im i'm " +
    "என் நான் ஒரு இந்த அந்த என்ன எப்படி எங்கே யார் வேண்டும் உள்ளது இருக்கிறது பற்றி").split(/\s+/)
);

const norm = (s: string) =>
  String(s || "").toLowerCase().normalize("NFC").replace(/<[^>]+>/g, " ").replace(/[^\p{L}\p{N}\p{M}\s-]/gu, " ");

const stem = (w: string) => {
  if (w.length > 5 && w.endsWith("ing")) return w.slice(0, -3);
  if (w.length > 5 && w.endsWith("ed")) return w.slice(0, -2);
  if (w.length > 4 && w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
};

/* Tamil is agglutinative (சான்றிதழ் / சான்றிதழை / சான்றிதழுக்கு), so a short prefix of each
   Tamil word is indexed too. */
export function tokens(s: string): string[] {
  const out: string[] = [];
  norm(s).split(/[\s-]+/).forEach((w) => {
    if (!w || STOP.has(w)) return;
    if (TA.test(w)) {
      const cps = Array.from(w);
      out.push(w);
      if (cps.length > 4) out.push("~" + cps.slice(0, 4).join(""));
    } else if (w.length > 1) out.push(stem(w));
  });
  return out;
}

type Doc = { d: KBEntry; tf: Map<string, number>; len: number };
type Index = { docs: Doc[]; avg: number; idf: (t: string) => number };

function buildIndex(kb: KBEntry[]): Index {
  const docs = kb.map((d) => {
    const tf = new Map<string, number>();
    const add = (text: string, w: number) => tokens(text).forEach((t) => tf.set(t, (tf.get(t) || 0) + w));
    d.q.forEach((q) => add(q, 3));
    d.k.forEach((k) => add(k, 2.5));
    add(d.cat, 1);
    add(d.en, 0.6);
    add(d.ta, 0.6);
    let len = 0;
    tf.forEach((v) => (len += v));
    return { d, tf, len };
  });
  const N = docs.length;
  const avg = docs.reduce((s, x) => s + x.len, 0) / N;
  const df = new Map<string, number>();
  docs.forEach((x) => x.tf.forEach((_, t) => df.set(t, (df.get(t) || 0) + 1)));
  const idf = (t: string) => Math.log(1 + (N - (df.get(t) || 0) + 0.5) / ((df.get(t) || 0) + 0.5));
  return { docs, avg, idf };
}

let index: Index | null = null;

function search(query: string, k = 3): Hit[] {
  index = index || buildIndex(KB);
  const ix = index;
  const qt = Array.from(new Set(tokens(query)));
  if (!qt.length) return [];
  const k1 = 1.4, b = 0.7;
  return ix.docs
    .map((x) => {
      let score = 0, hit = 0;
      qt.forEach((t) => {
        const f = x.tf.get(t);
        if (!f) return;
        hit++;
        score += ix.idf(t) * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * x.len) / ix.avg)));
      });
      return { doc: x.d, score, coverage: hit / qt.length };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

export const isCrisis = (q: string) => {
  const n = norm(q);
  return CRISIS.some((w) => n.includes(norm(w).trim()));
};

const GREET = /^(hi|hey|hello|hai|vanakkam|vanakam|good (morning|evening|afternoon)|வணக்கம்)\b/i;
const THANKS = /^(thanks|thank you|thx|nandri|நன்றி)\b/i;

export const byId = (id: string) => KB.find((d) => d.id === id);

export function answer(question: string): EngineResult {
  const q = String(question || "").trim();
  const lang: Lang = TA.test(q) ? "ta" : "en";
  if (!q) return { type: "empty", lang };
  if (isCrisis(q)) return { type: "crisis", lang, doc: byId("crisis")! };
  if (GREET.test(q) && q.split(/\s+/).length <= 3) return { type: "greet", lang };
  if (THANKS.test(q) && q.split(/\s+/).length <= 4) return { type: "thanks", lang };
  const hits = search(q, 3);
  const top = hits[0];
  const confident = top && ((top.score >= 1.6 && top.coverage >= 0.25) || (top.coverage === 1 && top.score >= 1));
  if (!confident) return { type: "unknown", lang, hits };
  const related = hits.slice(1).filter((h) => h.score > top.score * 0.6).map((h) => h.doc);
  return { type: "answer", lang, doc: top.doc, related, hits };
}
