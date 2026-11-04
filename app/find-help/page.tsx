import type { Metadata } from "next";
import Link from "next/link";
import Directory from "@/components/Directory";

export const metadata: Metadata = {
  title: "Find help · Dorothy",
  description: "Verified shelters, mental health support, identity documents, scholarships, work and health resources for transgender people in Tamil Nadu and India.",
  alternates: { canonical: "/find-help" },
};

export default function FindHelp() {
  return (
    <main id="main">
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">Find help · <span className="ta" lang="ta">உதவி கண்டறிய</span></span>
          <h1>Verified help, in one place</h1>
          <p className="lead">Every listing links to its official source and shows when it was last checked. We add organisations only after we've confirmed them and they've agreed to be listed.</p>
          <div className="callout" role="note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 3 2 21h20Z"/><path d="M12 10v5M12 18h.01"/></svg>
            <p><strong>In danger right now?</strong> Call <a href="tel:112">112</a>. Thinking of hurting yourself? Call Tele-MANAS <a href="tel:14416">14416</a>. It's free and open 24×7.</p>
          </div>
        </div>
      </section>
      <section className="section" style={{ paddingTop: "48px" }}>
        <div className="wrap">
    <Directory />
          <div className="callout callout--quiet" style={{ marginTop: "40px" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
            <p>Know a trusted service in Tamil Nadu? <Link href="/get-involved#organisation">Tell us</Link>.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
