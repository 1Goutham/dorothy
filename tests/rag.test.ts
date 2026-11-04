// Run: npm test
// Exercises the /api/ask pipeline (batching, response shapes, warm-up retries, ranking,
// generation) against a stand-in embedding service, since the real BGE-M3 needs a network.
import assert from "node:assert/strict";

// Stand-in embedder: hashed bag of words, so related texts land near each other.
const DIM = 512;
const embedText = (t: string) => {
  const v = new Array(DIM).fill(0);
  String(t).toLowerCase().normalize("NFC").split(/[^\p{L}\p{M}\p{N}]+/u).filter(Boolean).forEach((w) => {
    for (const g of [w, w.slice(0, 4)]) { let h = 2166136261; for (const ch of g) h = Math.imul(h ^ ch.codePointAt(0)!, 16777619); v[(h >>> 0) % DIM] += 1; }
  });
  return v;
};
let calls = 0, warmups = 0, tokenLevel = false, chat = 0;
const fetchImpl = async (url: string, init: RequestInit) => {
  if (url.includes("chat/completions")) {
    chat++;
    return new Response(JSON.stringify({ choices: [{ message: { content: "Grounded answer \u2014 from passages." } }] }), { status: 200 });
  }
  calls++;
  if (warmups < 1) { warmups++; return new Response("loading", { status: 503 }); }
  const { inputs } = JSON.parse(String(init.body)) as { inputs: string[] };
  assert.ok(inputs.length <= 24, "batches are capped");
  const vecs = inputs.map(embedText);
  return new Response(JSON.stringify(tokenLevel ? vecs.map((v: number[]) => [v, v.map(() => 0)]) : vecs), { status: 200 });
};
globalThis.fetch = fetchImpl as unknown as typeof fetch;
process.env.DENSE_THRESHOLD = "0.3";
process.env.HF_TOKEN = "test";

const rag = await import("../lib/rag");
const t0 = Date.now();
await rag.warm();
assert.ok(calls > 3, "index is built in several batches");
assert.ok(Date.now() - t0 >= 3900, "waits when the model is warming up");

const cases = [
  ["how do I get my trans ID card", "certificate"], ["my parents kicked me out, where can I stay", "shelter"],
  ["any scholarships for college?", "scholarship"], ["திருநர் அடையாள அட்டை எப்படி பெறுவது?", "certificate"],
  ["எனக்கு தங்க இடம் வேண்டும்", "shelter"], ["I want to volunteer as a therapist", "volunteer"],
];
for (const [q, want] of cases) {
  const r = await rag.retrieve(q);
  assert.equal(r.results[0].id, want, q);
  assert.equal(r.model, "BAAI/bge-m3");
}
tokenLevel = true;
const r2 = await rag.retrieve("how do I get my trans ID card");
assert.equal(r2.results[0].id, "certificate", "token-level responses use the CLS vector");

assert.equal(await rag.generate("q", "en", ["certificate"]), null, "no chat model configured -> no generation");
process.env.HF_CHAT_MODEL = "some/model";
const g = await rag.generate("q", "en", ["certificate"]);
assert.equal(g, "Grounded answer , from passages.", "generation strips long dashes");
assert.equal(chat, 1);
console.log("rag: all passing");
