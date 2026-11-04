import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy & trust · Dorothy",
  description: "How Dorothy protects your privacy, verifies information and handles consent.",
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  return (
    <main id="main">
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">Privacy &amp; trust · <span className="ta" lang="ta">தனியுரிமை</span></span>
          <h1>Our promise to you</h1>
          <p className="lead">Trust, privacy, consent and verification aren't features of Dorothy. They are the foundation.</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: "56px" }}>
        <div className="wrap prose">
          <h2>What we don't do</h2>
          <ul>
            <li>No accounts, no sign-ups required to use anything on Dorothy.</li>
            <li>No advertising, no analytics cookies, no tracking pixels, no selling or sharing of data. Ever.</li>
            <li>No third-party fonts or scripts: everything is served from Dorothy itself, so other companies don't see your visit.</li>
          </ul>
          <h2>Dorothy AI</h2>
          <p>To understand your question in Tamil or English, Dorothy AI sends <strong>only the question</strong> to Dorothy's server, which uses the open BGE-M3 language model (hosted on Hugging Face) to match it against our verified knowledge base. When answers are written by an AI model, it receives only that question and the verified passages.</p>
          <p>We <strong>do not store or log your questions</strong>, and they are never linked to you: there are no accounts and no tracking. Closing the page clears the conversation. The only thing saved on your device is your language choice (English or Tamil). Messages that suggest you may be in danger are answered on your own device, without being sent anywhere.</p>
          <h2>When you contact us</h2>
          <p>If you send a form (volunteering, a story, an organisation, a message), we use it <strong>only for the reason you sent it</strong>. Only the small Dorothy core team can see it. Ask us to delete it at any time and we will.</p>
          <h2>Consent</h2>
          <ul>
            <li>Stories are published only with your written approval of the final version, and can be withdrawn at any time.</li>
            <li>Organisations are listed only after they agree to be listed.</li>
            <li>We never publish shelter addresses or private individuals' contact details.</li>
          </ul>
          <h2>Verification</h2>
          <p>Every resource and every Dorothy AI answer links to its source and shows the date a person last checked it. Government sources come first. Community organisations are verified by a volunteer before listing. If you see something wrong or outdated, <Link href="/get-involved#contact">please tell us</Link>.</p>
          <h2>Safety</h2>
          <p>If you're browsing somewhere that isn't safe, press <strong>Esc twice</strong> to leave instantly. Consider using a private or incognito window, which won't keep this site in your history.</p>
          <h2>Not professional advice</h2>
          <p>Dorothy shares information, not medical, legal or psychological advice. For decisions about your health, legal situation or wellbeing, please talk to a qualified professional.</p>
        </div>
      </section>
    </main>
  );
}
