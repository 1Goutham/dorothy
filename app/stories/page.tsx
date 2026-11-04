import type { Metadata } from "next";
import DorothyForm from "@/components/DorothyForm";

export const metadata: Metadata = {
  title: "Stories of Strength · Dorothy",
  description: "Journeys and achievements of transgender people from Tamil Nadu, and a consent-first way to share your own story.",
  alternates: { canonical: "/stories" },
};

export default function Stories() {
  return (
    <main id="main">
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">Stories of Strength · <span className="ta" lang="ta">வலிமையின் கதைகள்</span></span>
          <h1>Lives that deserve to be heard</h1>
          <p className="lead">Every story here is told with consent. We begin with public milestones from Tamil Nadu that changed what is possible, and we're opening a careful, private way for you to share yours.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: "56px" }}>
        <div className="wrap">
          <div className="section-head"><span className="eyebrow">Milestones from Tamil Nadu</span></div>
          <div className="story-grid">
            <article className="story tilt reveal" data-tilt="4">
              <span className="yr">2017</span>
              <h3 className="lift">K. Prithika Yashini</h3>
              <p>After a legal fight that reached the Madras High Court, she took up duty as a police sub-inspector in Tamil Nadu in 2017. She is recognised as India's first transgender woman sub-inspector.</p>
              <a className="more" href="https://en.wikipedia.org/wiki/K._Prithika_Yashini" target="_blank" rel="noopener noreferrer">Read more ↗</a>
            </article>
            <article className="story tilt reveal" data-tilt="4">
              <span className="yr">2019</span>
              <h3 className="lift">Narthaki Nataraj</h3>
              <p>A Bharatanatyam artist from Madurai, she became the first transgender woman to receive the Padma Shri in 2019, an honour she says was earned on merit, as an artist.</p>
              <a className="more" href="https://en.wikipedia.org/wiki/Narthaki_Nataraj" target="_blank" rel="noopener noreferrer">Read more ↗</a>
            </article>
            <article className="story tilt reveal" data-tilt="4">
              <span className="yr">2013</span>
              <h3 className="lift">Grace Banu</h3>
              <p>Widely reported as the first transgender person admitted to an engineering college in Tamil Nadu, she went on to found the Trans Rights Now Collective and campaign for reservations.</p>
              <a className="more" href="https://en.wikipedia.org/wiki/Grace_Banu" target="_blank" rel="noopener noreferrer">Read more ↗</a>
            </article>
          </div>
        </div>
      </section>

      <section className="section section--band" id="share">
        <div className="wrap split">
          <div className="section-head" style={{ margin: "0" }}>
            <span className="eyebrow">Share your story</span>
            <h2>Your story, your rules</h2>
            <p className="lead">Your voice could be what someone needs to hear today. You stay in control at every step.</p>
            <ul className="prose" style={{ paddingLeft: "18px", marginTop: "8px" }}>
              <li><strong>Your name or anonymous.</strong> You choose. We never publish faces, places or details that could identify you unless you say so.</li>
              <li><strong>You review it first.</strong> Nothing is published until you approve the final version in writing.</li>
              <li><strong>Withdraw any time.</strong> Ask and it comes down, no questions asked.</li>
              <li><strong>Tamil or English.</strong> Write in whichever feels like home.</li>
            </ul>
          </div>
          <DorothyForm kind="Story submission">
            <div className="form-row">
              <div className="field"><label htmlFor="s-name">Name to publish (or leave blank for anonymous)</label><input id="s-name" name="publish_as" type="text" autoComplete="off" /></div>
              <div className="field"><label htmlFor="s-contact">How can we reach you? (email or phone, never published)</label><input id="s-contact" name="contact" type="text" required /></div>
            </div>
            <div className="field"><label htmlFor="s-story">Your story <span className="ta" lang="ta">· உங்கள் கதை</span></label><textarea id="s-story" name="story" required placeholder="As much or as little as you'd like to share…"></textarea></div>
            <label className="check"><input type="checkbox" name="consent_contact" value="yes" required /> I agree that Dorothy may contact me about this story. I understand nothing will be published without my final written approval, and that I can withdraw it at any time.</label>
            <input type="text" name="company" tabIndex={-1} autoComplete="off" style={{ display: "none" }} aria-hidden="true" />
            <div><button className="btn btn--light" type="submit">Send my story</button></div>
          </DorothyForm>
        </div>
      </section>
    </main>
  );
}
