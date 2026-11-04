import type { Metadata } from "next";
import AskDorothy from "@/components/AskDorothy";

export const metadata: Metadata = {
  title: "Dorothy AI · Ask in Tamil or English",
  description: "A private, bilingual assistant that answers only from verified sources about rights, identity documents, shelter, mental health, scholarships and work for transgender people.",
  alternates: { canonical: "/ask" },
};

export default function Ask() {
  return (
    <main id="main">
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">Dorothy AI · <span className="ta" lang="ta">டோரதி AI</span></span>
          <h1>Ask Dorothy. Get answers you can trust.</h1>
          <p className="lead">Ask in Tamil or English. Dorothy answers only from verified sources, shows you where each answer comes from, and tells you honestly when it doesn't know.</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: "48px" }}>
        <div className="wrap">
          <AskDorothy id="page" deepLink />
        </div>
      </section>
      <section className="section section--band">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">How Dorothy AI works</span>
            <h2>Retrieval first. Honesty always.</h2>
          </div>
          <div className="grid-4">
            <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M12 3 4 6v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V6Z"/></svg><h3>1 · Safety first</h3><p>If a message suggests someone may be at risk, crisis support appears before anything else.</p></div>
            <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><h3>2 · Understand</h3><p>The BGE-M3 language model reads your question in Tamil or English and finds the verified entries that mean the same thing, even in different words.</p></div>
            <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 5h16v11H8l-4 4Z"/></svg><h3>3 · Answer with sources</h3><p>The answer shows its sources and the date a person last reviewed it. Nothing is invented.</p></div>
            <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg><h3>4 · Hand to a human</h3><p>When it doesn't know, it says so and connects you to the Dorothy team or a professional.</p></div>
          </div>
        </div>
      </section>
    </main>
  );
}
