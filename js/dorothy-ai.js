/*
 * Dorothy AI — retrieval-first, bilingual (Tamil / English) assistant.
 *
 * How it answers:
 *  1. Safety first — if a message suggests someone may be at risk, crisis support is shown
 *     before anything else.
 *  2. Retrieval — the question is matched (BM25 + Tamil-aware prefix matching) against the
 *     verified knowledge base in /data/knowledge.js. Only verified passages can be used.
 *  3. Answer — by default the verified passage is shown directly, with its sources. If an
 *     `aiEndpoint` is configured (see /worker), the retrieved passages are sent to a small
 *     LLM that may only rephrase them — it is told to refuse anything not in the passages.
 *  4. Honesty — when nothing matches well, Dorothy says so and points to a human.
 *
 * Runs entirely in the browser by default: no server, no storage, no tracking.
 */
(function (root) {
  "use strict";

  const TA = /[஀-௿]/;
  const STOP = new Set(("a an the is are was were be been am i me my we our you your it its of to in on for at by with from " +
    "and or but if so do does did can could should would will shall may might what how who whom which where when why " +
    "this that these those there here please tell about any some get got have has had need want just also im i'm " +
    "என் நான் ஒரு இந்த அந்த என்ன எப்படி எங்கே யார் வேண்டும் உள்ளது இருக்கிறது பற்றி").split(/\s+/));

  const norm = (s) => String(s || "").toLowerCase().normalize("NFC").replace(/<[^>]+>/g, " ").replace(/[^\p{L}\p{N}\p{M}\s-]/gu, " ");
  const stem = (w) => {
    if (w.length > 5 && w.endsWith("ing")) return w.slice(0, -3);
    if (w.length > 5 && w.endsWith("ed")) return w.slice(0, -2);
    if (w.length > 4 && w.endsWith("ies")) return w.slice(0, -3) + "y";
    if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
    return w;
  };
  /* Tamil is agglutinative (சான்றிதழ் / சான்றிதழை / சான்றிதழுக்கு), so we also index a
     short codepoint prefix of each Tamil word. */
  function tokens(s) {
    const out = [];
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

  /* ---------- BM25 index ---------- */
  function buildIndex(kb) {
    const docs = kb.map((d) => {
      const tf = new Map();
      const add = (text, w) => tokens(text).forEach((t) => tf.set(t, (tf.get(t) || 0) + w));
      d.q.forEach((q) => add(q, 3));
      d.k.forEach((k) => add(k, 2.5));
      add(d.cat, 1);
      add(d.en, 0.6);
      add(d.ta, 0.6);
      let len = 0; tf.forEach((v) => (len += v));
      return { d, tf, len };
    });
    const N = docs.length;
    const avg = docs.reduce((s, x) => s + x.len, 0) / N;
    const df = new Map();
    docs.forEach((x) => x.tf.forEach((_, t) => df.set(t, (df.get(t) || 0) + 1)));
    const idf = (t) => Math.log(1 + (N - (df.get(t) || 0) + 0.5) / ((df.get(t) || 0) + 0.5));
    return { docs, avg, idf };
  }

  function search(index, query, k = 3) {
    const qt = Array.from(new Set(tokens(query)));
    if (!qt.length) return [];
    const k1 = 1.4, b = 0.7;
    return index.docs.map((x) => {
      let score = 0, hit = 0;
      qt.forEach((t) => {
        const f = x.tf.get(t);
        if (!f) return;
        hit++;
        score += index.idf(t) * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * x.len) / index.avg)));
      });
      return { doc: x.d, score, coverage: hit / qt.length };
    }).filter((r) => r.score > 0).sort((a, b) => b.score - a.score).slice(0, k);
  }

  const isCrisis = (q) => {
    const n = norm(q);
    return (root.DOROTHY_CRISIS || []).some((w) => n.includes(norm(w).trim()));
  };
  const GREET = /^(hi|hey|hello|hai|vanakkam|vanakam|good (morning|evening|afternoon)|வணக்கம்)\b/i;
  const THANKS = /^(thanks|thank you|thx|nandri|நன்றி)\b/i;

  /* Public engine — also used by tests */
  const engine = {
    tokens, isCrisis,
    index: null,
    ensure() { if (!this.index) this.index = buildIndex(root.DOROTHY_KB || []); return this.index; },
    answer(question) {
      const q = String(question || "").trim();
      const lang = TA.test(q) ? "ta" : "en";
      if (!q) return { type: "empty", lang };
      if (isCrisis(q)) return { type: "crisis", lang, doc: (root.DOROTHY_KB || []).find((d) => d.id === "crisis") };
      if (GREET.test(q) && q.split(/\s+/).length <= 3) return { type: "greet", lang };
      if (THANKS.test(q) && q.split(/\s+/).length <= 4) return { type: "thanks", lang };
      const hits = search(this.ensure(), q, 3);
      const top = hits[0];
      const confident = top && ((top.score >= 1.6 && top.coverage >= 0.25) || (top.coverage === 1 && top.score >= 1));
      if (!confident) return { type: "unknown", lang, hits };
      const related = hits.slice(1).filter((h) => h.score > top.score * 0.6).map((h) => h.doc);
      return { type: "answer", lang, doc: top.doc, related, hits };
    },
  };
  root.DorothyEngine = engine;

  /* ---------- UI ---------- */
  if (typeof document === "undefined") return;

  const T = {
    en: {
      greet: "<p>Vanakkam! I'm Dorothy. Ask me about identity documents, your rights, shelter, mental health support, scholarships or work — in English or Tamil.</p>",
      thanks: "<p>Always here. Take care of yourself. 🤍</p>",
      unknown: "<p>I don't have verified information on that yet, and I'd rather not guess.</p><p>You can <a href=\"get-involved.html#contact\">ask a person from the Dorothy team</a>, or try one of these:</p>",
      crisisLead: "<p><strong>You don't have to go through this alone.</strong> Please reach out to someone right now:</p>",
      sources: "Verified sources", reviewed: "Last reviewed", related: "You might also ask",
      error: "<p>Something went wrong. Showing the verified answer instead.</p>",
      ai: "Phrased by Dorothy AI from the sources below",
    },
    ta: {
      greet: "<p>வணக்கம்! நான் டோரதி. அடையாள ஆவணங்கள், உங்கள் உரிமைகள், தங்குமிடம், மனநல ஆதரவு, கல்வி உதவித்தொகை, வேலை — எதைப் பற்றியும் தமிழிலோ ஆங்கிலத்திலோ கேளுங்கள்.</p>",
      thanks: "<p>எப்போதும் இங்கே இருக்கிறேன். உங்களைக் கவனித்துக் கொள்ளுங்கள். 🤍</p>",
      unknown: "<p>இதைப் பற்றி சரிபார்க்கப்பட்ட தகவல் என்னிடம் இன்னும் இல்லை; ஊகித்துச் சொல்ல விரும்பவில்லை.</p><p><a href=\"get-involved.html#contact\">டோரதி குழுவில் ஒருவரிடம் கேளுங்கள்</a>, அல்லது இவற்றில் ஒன்றை முயற்சிக்கவும்:</p>",
      crisisLead: "<p><strong>இதை நீங்கள் தனியாகக் கடக்க வேண்டியதில்லை.</strong> இப்போதே யாரையாவது அணுகுங்கள்:</p>",
      sources: "சரிபார்க்கப்பட்ட ஆதாரங்கள்", reviewed: "கடைசியாகச் சரிபார்த்தது", related: "இதையும் கேட்கலாம்",
      error: "<p>ஏதோ தவறு நடந்தது. சரிபார்க்கப்பட்ட பதிலைக் காட்டுகிறேன்.</p>",
      ai: "கீழே உள்ள ஆதாரங்களிலிருந்து டோரதி AI எழுதியது",
    },
  };

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const firstQ = (doc, lang) => {
    const q = doc.q.find((x) => (lang === "ta") === TA.test(x)) || doc.q[0];
    return lang === "ta" ? q : q.charAt(0).toUpperCase() + q.slice(1) + "?";
  };
  const plain = (html) => html.replace(/<li>/g, "\n• ").replace(/<\/p>/g, "\n").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim();

  function mount(el) {
    const log = el.querySelector(".log");
    const form = el.querySelector("form");
    const input = form.querySelector("input");
    const langBtns = el.querySelectorAll("[data-lang]");
    const chipsWrap = el.querySelector(".chips");
    const cfg = root.DOROTHY_CONFIG || {};
    let pref = "en";      // what the visitor explicitly chose with the toggle
    try { pref = localStorage.getItem("dorothy-lang") || "en"; } catch (e) {}

    const setLang = (l, explicit) => {
      if (explicit !== false) pref = l;
      langBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === l)));
      input.placeholder = l === "ta" ? "உங்கள் கேள்வியைக் கேளுங்கள்…" : "Ask a question…";
      chipsWrap && chipsWrap.querySelectorAll("[data-q-en]").forEach((c) => (c.textContent = c.dataset["q" + (l === "ta" ? "Ta" : "En")]));
      if (explicit !== false) { try { localStorage.setItem("dorothy-lang", l); } catch (e) {} }
    };
    langBtns.forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));
    setLang(pref);

    const scroll = () => { log.scrollTop = log.scrollHeight; };
    const add = (cls, html) => {
      const m = document.createElement("div");
      m.className = "msg " + cls;
      m.innerHTML = html;
      log.appendChild(m);
      scroll();
      return m;
    };

    const chip = (doc, lang) => `<button type="button" class="chip" data-ask-q="${esc(firstQ(doc, lang))}">${esc(firstQ(doc, lang))}</button>`;
    const srcBlock = (doc, lang) => {
      const t = T[lang];
      return `<div class="src"><span>${t.sources} · ${t.reviewed} ${esc(doc.reviewed)}</span>` +
        doc.src.map((s) => `<a href="${esc(s.u)}" ${/^https?:/.test(s.u) ? 'target="_blank" rel="noopener noreferrer"' : ""}>↗ ${esc(s.t)}</a>`).join("") + "</div>";
    };
    const byId = (id) => (root.DOROTHY_KB || []).find((d) => d.id === id);

    async function respond(question) {
      const res = engine.answer(question);
      // Tamil question → Tamil answer. English question → the language the visitor chose.
      const lang = res.lang === "ta" ? "ta" : pref;
      const t = T[lang];

      const wait = add("msg--bot", '<span class="thinking" aria-label="Dorothy is thinking"><i></i><i></i><i></i></span>');
      await new Promise((r) => setTimeout(r, 420));

      let html = "";
      let cls = "msg--bot";
      if (res.type === "crisis") {
        cls += " msg--alert";
        html = t.crisisLead + res.doc[lang] + srcBlock(res.doc, lang);
      } else if (res.type === "greet") {
        html = t.greet;
      } else if (res.type === "thanks") {
        html = t.thanks;
      } else if (res.type === "unknown") {
        html = t.unknown + '<div class="meta">' + ["certificate", "shelter", "mental-health"].map((id) => chip(byId(id), lang)).join("") + "</div>";
      } else {
        let body = res.doc[lang];
        let note = "";
        if (cfg.aiEndpoint) {
          try {
            const passages = [res.doc].concat(res.related).map((d) => ({ id: d.id, text: plain(d[lang]), sources: d.src }));
            const r = await fetch(cfg.aiEndpoint, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ question, lang, passages }),
            });
            if (!r.ok) throw new Error(r.status);
            const j = await r.json();
            if (j && j.answer) {
              body = j.answer.split(/\n{2,}/).map((p) => "<p>" + esc(p).replace(/\n/g, "<br>") + "</p>").join("");
              note = `<div class="meta"><span class="tag tag--red">${t.ai}</span></div>`;
            }
          } catch (e) { note = ""; }
        }
        html = body + note;
        if (res.related.length) html += `<div class="meta">${res.related.map((d) => chip(d, lang)).join("")}</div>`;
        else if (res.doc.follow) html += `<div class="meta">${res.doc.follow.slice(0, 2).map(byId).filter(Boolean).map((d) => chip(d, lang)).join("")}</div>`;
        html += srcBlock(res.doc, lang);
      }
      wait.remove();
      const m = add(cls, html);
      m.querySelectorAll("[data-ask-q]").forEach((b) => b.addEventListener("click", () => ask(b.dataset.askQ)));
    }

    function ask(q) {
      q = String(q || "").trim();
      if (!q) return;
      add("msg--me", esc(q));
      respond(q);
    }

    form.addEventListener("submit", (e) => { e.preventDefault(); const q = input.value; input.value = ""; ask(q); });
    el.querySelectorAll("[data-ask-q]").forEach((b) => b.addEventListener("click", () => ask(b.textContent)));

    // Deep link: ask.html?q=...
    const pq = new URLSearchParams(location.search).get("q");
    if (pq && el.hasAttribute("data-ask-deeplink")) ask(pq);
  }

  document.querySelectorAll("[data-ask]").forEach(mount);
})(typeof window !== "undefined" ? window : globalThis);
