"use client";

/*
 * Dorothy AI chat: a bilingual (Tamil / English) RAG assistant over the verified knowledge base.
 *  1. Safety first: messages that suggest someone may be at risk get crisis support at once,
 *     on the device, without any network call.
 *  2. Retrieval: /api/ask embeds the question with BAAI/bge-m3 and ranks verified entries by
 *     meaning. If that service is unavailable, BM25 keyword search runs here instead.
 *  3. Answer: the verified entry with its sources, or a grounded rephrasing when configured.
 *  4. Honesty: when nothing matches well, Dorothy says so and points to a person.
 */
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { type KBEntry } from "@/data/knowledge";
import { answer, byId, TA, type Lang } from "@/lib/engine";
import { Arrow } from "./icons";

const T = {
  en: {
    greet: "<p>Vanakkam! I'm Dorothy. Ask me about identity documents, your rights, shelter, mental health support, scholarships or work. English or Tamil, whichever you like.</p>",
    thanks: "<p>Always here. Take care of yourself.</p>",
    unknown: "<p>I don't have verified information on that yet, and I'd rather not guess.</p><p>You can <a href=\"/get-involved#contact\">ask a person from the Dorothy team</a>, or try one of these:</p>",
    crisisLead: "<p><strong>You don't have to go through this alone.</strong> Please reach out to someone right now:</p>",
    sources: "Verified sources", reviewed: "Last reviewed",
    ai: "Phrased by Dorothy AI from the sources below",
    placeholder: "Ask a question…",
  },
  ta: {
    greet: "<p>வணக்கம்! நான் டோரதி. அடையாள ஆவணங்கள், உங்கள் உரிமைகள், தங்குமிடம், மனநல ஆதரவு, கல்வி உதவித்தொகை, வேலை, எதைப் பற்றியும் தமிழிலோ ஆங்கிலத்திலோ கேளுங்கள்.</p>",
    thanks: "<p>எப்போதும் இங்கே இருக்கிறேன். உங்களைக் கவனித்துக் கொள்ளுங்கள்.</p>",
    unknown: "<p>இதைப் பற்றி சரிபார்க்கப்பட்ட தகவல் என்னிடம் இன்னும் இல்லை; ஊகித்துச் சொல்ல விரும்பவில்லை.</p><p><a href=\"/get-involved#contact\">டோரதி குழுவில் ஒருவரிடம் கேளுங்கள்</a>, அல்லது இவற்றில் ஒன்றை முயற்சிக்கவும்:</p>",
    crisisLead: "<p><strong>இதை நீங்கள் தனியாகக் கடக்க வேண்டியதில்லை.</strong> இப்போதே யாரையாவது அணுகுங்கள்:</p>",
    sources: "சரிபார்க்கப்பட்ட ஆதாரங்கள்", reviewed: "கடைசியாகச் சரிபார்த்தது",
    ai: "கீழே உள்ள ஆதாரங்களிலிருந்து டோரதி AI எழுதியது",
    placeholder: "உங்கள் கேள்வியைக் கேளுங்கள்…",
  },
};

const STARTERS = [
  { en: "So, who's behind Dorothy?", ta: "டோரதியை யார் நடத்துகிறார்கள்?" },
  { en: "What's in your list?", ta: "உங்களால் என்ன செய்ய முடியும்?" },
  { en: "How do I get a transgender ID card?", ta: "திருநர் அடையாள அட்டை எப்படி பெறுவது?" },
  { en: "I need a safe place to stay", ta: "எனக்கு தங்க இடம் வேண்டும்" },
  { en: "How can I reach you?", ta: "உங்களை எப்படித் தொடர்பு கொள்வது?" },
];

type Msg =
  | { id: number; role: "me"; text: string }
  | { id: number; role: "bot"; pending: true }
  | { id: number; role: "bot"; pending?: false; html: string; alert?: boolean; ai?: boolean; chips: string[]; source?: KBEntry; lang: Lang };

type Semantic = { confident: boolean; results: { id: string; score: number }[]; answer?: string | null };

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const firstQ = (doc: KBEntry, lang: Lang) => {
  const q = doc.q.find((x) => (lang === "ta") === TA.test(x)) || doc.q[0];
  return lang === "ta" ? q : q.charAt(0).toUpperCase() + q.slice(1) + "?";
};

const ENDPOINT = "/api/ask";

async function semantic(question: string, lang: Lang): Promise<Semantic | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(ENDPOINT, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, lang }), signal: ctrl.signal,
    });
    if (!r.ok) return null;
    const j = await r.json();
    return j && Array.isArray(j.results) ? j : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export default function AskDorothy({ id, deepLink = false }: { id: string; deepLink?: boolean }) {
  const router = useRouter();
  const [pref, setPref] = useState<Lang>("en");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const logRef = useRef<HTMLDivElement>(null);
  const seq = useRef(0);
  const warmed = useRef(false);
  const prefRef = useRef<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dorothy-lang");
      if (saved === "ta" || saved === "en") { setPref(saved); prefRef.current = saved; }
    } catch {}
  }, []);

  const chooseLang = (l: Lang) => {
    setPref(l);
    prefRef.current = l;
    try { localStorage.setItem("dorothy-lang", l); } catch {}
  };

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [msgs]);

  const warm = () => {
    if (warmed.current) return;
    warmed.current = true;
    fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ warm: true }) }).catch(() => {});
  };

  async function ask(raw: string) {
    const question = raw.trim();
    if (!question) return;
    const meId = ++seq.current, botId = ++seq.current;
    setMsgs((m) => [...m, { id: meId, role: "me", text: question }, { id: botId, role: "bot", pending: true }]);

    let res = answer(question);
    // Tamil question, Tamil answer. English question, the language the visitor chose.
    const lang: Lang = res.lang === "ta" ? "ta" : prefRef.current;
    const t = T[lang];
    let generated: string | null = null;
    let related: KBEntry[] = res.type === "answer" ? res.related : [];

    if (res.type === "answer" || res.type === "unknown") {
      const sem = await semantic(question, lang);
      if (sem) {
        const top = sem.results[0];
        const doc = top && byId(top.id);
        if (sem.confident && doc) {
          related = sem.results.slice(1).filter((x) => x.score > top.score - 0.08).map((x) => byId(x.id)).filter((d): d is KBEntry => Boolean(d));
          res = { type: "answer", lang: res.lang, doc, related, hits: [] };
          generated = sem.answer || null;
        } else {
          res = { type: "unknown", lang: res.lang, hits: [] };
        }
      }
    } else {
      await new Promise((r) => setTimeout(r, 300));
    }

    let reply: Msg;
    if (res.type === "crisis") {
      reply = { id: botId, role: "bot", html: t.crisisLead + res.doc[lang], alert: true, chips: [], source: res.doc, lang };
    } else if (res.type === "unknown") {
      reply = { id: botId, role: "bot", html: t.unknown, chips: ["certificate", "shelter", "mental-health"].map((x) => firstQ(byId(x)!, lang)), lang };
    } else if (res.type === "answer") {
      const doc = res.doc;
      const html = generated
        ? generated.split(/\n{2,}/).map((p) => "<p>" + esc(p).replace(/\n/g, "<br>") + "</p>").join("")
        : doc[lang];
      const next: KBEntry[] = related.length
        ? related
        : (doc.follow || []).slice(0, 2).map((x) => byId(x)).filter((d): d is KBEntry => Boolean(d));
      reply = { id: botId, role: "bot", html, ai: Boolean(generated), chips: next.map((d) => firstQ(d, lang)), source: doc, lang };
    } else {
      reply = { id: botId, role: "bot", html: res.type === "thanks" ? t.thanks : t.greet, chips: [], lang };
    }
    setMsgs((m) => m.map((x) => (x.id === botId ? reply : x)));
  }

  // ask.html?q=... style deep links
  const deepAsked = useRef(false);
  useEffect(() => {
    if (!deepLink || deepAsked.current) return;
    deepAsked.current = true;
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) ask(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deepLink]);

  // links inside answers navigate within the app
  const onLogClick = (e: MouseEvent<HTMLDivElement>) => {
    const a = (e.target as Element).closest("a");
    const href = a?.getAttribute("href");
    if (a && href && href.startsWith("/") && !a.target) {
      e.preventDefault();
      router.push(href);
    }
  };

  const t = T[pref];

  return (
    <div className="ask-shell">
      <div className="ask-head">
        <div className="ask-id">
          <svg className="avatar" viewBox="0 0 40 40" aria-hidden="true">
            <circle cx="20" cy="20" r="18" fill="#e1251b" />
            <g fill="none" stroke="#fff" strokeWidth="1.6">
              <circle cx="20" cy="14.4" r="4.4" /><circle cx="25.6" cy="20" r="4.4" /><circle cx="20" cy="25.6" r="4.4" /><circle cx="14.4" cy="20" r="4.4" />
            </g>
            <circle cx="20" cy="20" r="1.6" fill="#fff" />
          </svg>
          <div>
            <strong>Ask Dorothy</strong>
            <small>A little guidance, whenever you need it. <span className="ta" lang="ta">தமிழிலும் கேட்கலாம்.</span></small>
          </div>
        </div>
        <div className="lang-toggle" role="group" aria-label="Answer language">
          <button type="button" aria-pressed={pref === "en"} onClick={() => chooseLang("en")}>English</button>
          <button type="button" aria-pressed={pref === "ta"} onClick={() => chooseLang("ta")} className="ta">தமிழ்</button>
        </div>
      </div>

      <div className="chips">
        {STARTERS.map((c) => (
          <button key={c.en} type="button" className="chip" onClick={() => ask(c[pref])}>{c[pref]}</button>
        ))}
      </div>

      <div className="log" aria-live="polite" ref={logRef} onClick={onLogClick}>
        {msgs.map((m) => {
          if (m.role === "me") return <div key={m.id} className="msg msg--me">{m.text}</div>;
          if (m.pending) {
            return (
              <div key={m.id} className="msg msg--bot">
                <span className="thinking" aria-label="Dorothy is thinking"><i></i><i></i><i></i></span>
              </div>
            );
          }
          const tt = T[m.lang];
          return (
            <div key={m.id} className={`msg msg--bot${m.alert ? " msg--alert" : ""}`}>
              <div dangerouslySetInnerHTML={{ __html: m.html }} />
              {m.ai && <div className="meta"><span className="tag tag--red">{tt.ai}</span></div>}
              {m.chips.length > 0 && (
                <div className="meta">
                  {m.chips.map((c) => <button key={c} type="button" className="chip" onClick={() => ask(c)}>{c}</button>)}
                </div>
              )}
              {m.source && (
                <div className="src">
                  <span>{tt.sources} · {tt.reviewed} {m.source.reviewed}</span>
                  {m.source.src.map((s) =>
                    /^https?:/.test(s.u)
                      ? <a key={s.u + s.t} href={s.u} target="_blank" rel="noopener noreferrer">↗ {s.t}</a>
                      : <a key={s.u + s.t} href={s.u}>↗ {s.t}</a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <form
        className="ask-form"
        autoComplete="off"
        onSubmit={(e) => { e.preventDefault(); const q = input; setInput(""); ask(q); }}
      >
        <label htmlFor={`ask-input-${id}`}>What can I help you with today?</label>
        <input
          id={`ask-input-${id}`} name="q" type="text" maxLength={300} placeholder={t.placeholder}
          value={input} onChange={(e) => setInput(e.target.value)} onFocus={warm}
        />
        <button className="btn btn--light" type="submit">Send <Arrow /></button>
      </form>
      <p className="ask-note">Not medical or legal advice. In danger? Call <a href="tel:112" style={{ textDecoration: "underline" }}>112</a>.</p>
    </div>
  );
}
