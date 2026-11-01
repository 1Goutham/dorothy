// Run: node tests/ai.test.mjs , checks Dorothy AI routes questions to the right verified entry.
import { readFileSync } from "node:fs";
import vm from "node:vm";
const ctx = { window: {}, globalThis: {} }; ctx.window = ctx; vm.createContext(ctx);
for (const f of ["src/data/knowledge.js", "src/js/dorothy-ai.js"]) vm.runInContext(readFileSync(new URL("../" + f, import.meta.url), "utf8"), ctx);
const E = ctx.DorothyEngine;
const cases = [
  ["So, who's behind Dorothy?", "about"], ["What's in your list?", "capabilities"], ["How can I reach you?", "contact"],
  ["how do I get my trans ID card", "certificate"], ["can I change my gender on documents without surgery", "certificate"],
  ["my employer fired me for being trans", "rights"], ["I need a lawyer", "legal-aid"],
  ["my parents kicked me out, where can I stay", "shelter"], ["I feel so lonely", "mental-health"],
  ["any scholarships for college?", "scholarship"], ["I need a job", "work"], ["does insurance cover surgery", "health"],
  ["I want to volunteer as a therapist", "volunteer"], ["do you store my data", "privacy"],
  ["what does thirunambi mean", "words"], ["tamil nadu welfare board pension", "tn-board"],
  ["I want to share my story", "stories"], ["meet other trans people near me", "community"],
  ["திருநர் அடையாள அட்டை எப்படி பெறுவது?", "certificate"], ["எனக்கு தங்க இடம் வேண்டும்", "shelter"],
  ["நான் தனிமையாக உணர்கிறேன்", "mental-health"], ["கல்லூரி கட்டணத்துக்கு உதவித்தொகை உண்டா", "scholarship"],
  ["வேலை வேண்டும்", "work"], ["திருநங்கை என்றால் என்ன", "words"], ["நல வாரியம் ஓய்வூதியம்", "tn-board"],
];
let fail = 0;
for (const [q, want] of cases) {
  const r = E.answer(q); const got = r.type === "answer" ? r.doc.id : r.type;
  const ok = got === want; if (!ok) fail++;
  console.log(ok ? "✓" : "✗", q.padEnd(56), "→", got, ok ? "" : `(want ${want}; ${r.hits?.slice(0,3).map(h=>h.doc.id+":"+h.score.toFixed(2)+"/"+h.coverage.toFixed(2)).join(" ")})`);
}
const special = [["I want to kill myself", "crisis"], ["எனக்கு தற்கொலை எண்ணம் வருகிறது", "crisis"], ["vanakkam", "greet"], ["what's the cricket score", "unknown"], ["best biryani in chennai", "unknown"]];
for (const [q, want] of special) { const got = E.answer(q).type; if (got !== want) fail++; console.log(got === want ? "✓" : "✗", q.padEnd(56), "→", got); }
console.log(fail ? `\n${fail} failing` : "\nall passing"); process.exit(fail ? 1 : 0);
