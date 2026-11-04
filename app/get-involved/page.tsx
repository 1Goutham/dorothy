import type { Metadata } from "next";
import DorothyForm from "@/components/DorothyForm";

export const metadata: Metadata = {
  title: "Get involved · Dorothy",
  description: "Volunteer your time or skills, list a verified organisation, join Community Connect, or contact the Dorothy team.",
  alternates: { canonical: "/get-involved" },
};

export default function GetInvolved() {
  return (
    <main id="main">
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">Give support · <span className="ta" lang="ta">ஆதரவு தர</span></span>
          <h1>Be a part of <span className="ta red" lang="ta">டோரதி</span></h1>
          <p className="lead">Whoever you are, whatever you can offer (your time, skills or kindness) can help make life a little easier for someone. Let's show up for each other.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: "56px" }}>
        <div className="wrap">
          <div className="ways">
            <div className="way tilt reveal" data-tilt="4">
              <svg className="lift" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/></svg>
              <h3 className="lift">Professionals</h3>
              <p>Counsellors, therapists, lawyers, doctors, teachers and mentors: a few hours a month can change someone's year. We verify credentials and match carefully.</p>
            </div>
            <div className="way tilt reveal" data-tilt="4">
              <svg className="lift" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 5h9M8.5 3v2M6 5c0 4 3 7 6 8M11 5c0 4-3 7-7 8"/><path d="m13 21 4-9 4 9M14.5 18h5"/></svg>
              <h3 className="lift">Translators &amp; verifiers</h3>
              <p>Help us keep every word accurate in Tamil and English, and check that every listing is still current.</p>
            </div>
            <div className="way tilt reveal" data-tilt="4">
              <svg className="lift" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m8 7 4-4 4 4M12 3v13"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>
              <h3 className="lift">Builders &amp; designers</h3>
              <p>Dorothy is open and free. Developers, designers and writers can help build what comes next.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--band" id="volunteer">
        <div className="wrap split">
          <div className="section-head" style={{ margin: "0" }}>
            <span className="eyebrow">Volunteer</span>
            <h2>Join as a volunteer</h2>
            <p className="lead">Tell us a little about yourself. A person from the team will reply, usually within a week.</p>
          </div>
          <DorothyForm kind="Volunteer">
            <div className="form-row">
              <div className="field"><label htmlFor="v-name">Your name</label><input id="v-name" name="name" type="text" required autoComplete="name" /></div>
              <div className="field"><label htmlFor="v-email">Email</label><input id="v-email" name="email" type="email" required autoComplete="email" /></div>
            </div>
            <div className="form-row">
              <div className="field"><label htmlFor="v-role">How would you like to help?</label>
                <select id="v-role" name="role"><option>Counsellor / therapist</option><option>Lawyer / legal</option><option>Doctor / health</option><option>Teacher / mentor</option><option>Translator (Tamil ↔ English)</option><option>Resource verifier</option><option>Developer / designer</option><option>Something else</option></select>
              </div>
              <div className="field"><label htmlFor="v-city">City / district</label><input id="v-city" name="city" type="text" /></div>
            </div>
            <div className="field"><label htmlFor="v-msg">Anything you'd like us to know</label><textarea id="v-msg" name="message"></textarea></div>
            <label className="check"><input type="checkbox" name="consent" value="yes" required /> I agree to Dorothy's volunteer code: respect for every identity, confidentiality, and no personal contact outside Dorothy without consent.</label>
            <input type="text" name="company" tabIndex={-1} autoComplete="off" style={{ display: "none" }} aria-hidden="true" />
            <div><button className="btn btn--light" type="submit">Join as a volunteer</button></div>
          </DorothyForm>
        </div>
      </section>

      <section className="section" id="organisation">
        <div className="wrap split">
          <div className="section-head" style={{ margin: "0" }}>
            <span className="eyebrow">Organisations</span>
            <h2>List a trusted service</h2>
            <p className="lead">Shelters, NGOs, clinics, counsellors and inclusive employers in Tamil Nadu. A volunteer will call to verify before anything appears on Dorothy. We only list with your consent.</p>
          </div>
          <DorothyForm kind="Organisation listing">
            <div className="form-row">
              <div className="field"><label htmlFor="o-name">Organisation name</label><input id="o-name" name="organisation" type="text" required /></div>
              <div className="field"><label htmlFor="o-type">Type of support</label>
                <select id="o-type" name="type"><option>Shelter / accommodation</option><option>Mental health</option><option>Legal</option><option>Health / clinic</option><option>Education / scholarship</option><option>Employment / skills</option><option>Community group</option></select>
              </div>
            </div>
            <div className="form-row">
              <div className="field"><label htmlFor="o-site">Website or public page</label><input id="o-site" name="website" type="url" placeholder="https://" /></div>
              <div className="field"><label htmlFor="o-contact">Contact for verification</label><input id="o-contact" name="contact" type="text" required /></div>
            </div>
            <div className="field"><label htmlFor="o-msg">What do you offer, and to whom?</label><textarea id="o-msg" name="details"></textarea></div>
            <input type="text" name="company" tabIndex={-1} autoComplete="off" style={{ display: "none" }} aria-hidden="true" />
            <div><button className="btn btn--light" type="submit">Submit for verification</button></div>
          </DorothyForm>
        </div>
      </section>

      <section className="section section--band" id="community">
        <div className="wrap split">
          <div className="section-head" style={{ margin: "0" }}>
            <span className="eyebrow">Community Connect · Phase 3</span>
            <h2>Join the early list</h2>
            <p className="lead">A safe, moderated space for trans-to-trans support is coming. Leave a way to reach you and we'll invite you personally. No public profile, ever, unless you want one.</p>
          </div>
          <DorothyForm kind="Community Connect early list">
            <div className="form-row">
              <div className="field"><label htmlFor="c-name">What should we call you?</label><input id="c-name" name="name" type="text" /></div>
              <div className="field"><label htmlFor="c-contact">Email or phone</label><input id="c-contact" name="contact" type="text" required /></div>
            </div>
            <input type="text" name="company" tabIndex={-1} autoComplete="off" style={{ display: "none" }} aria-hidden="true" />
            <div><button className="btn btn--light" type="submit">Keep me posted</button></div>
          </DorothyForm>
        </div>
      </section>

      <section className="section" id="contact">
        <div className="wrap split">
          <div className="section-head" style={{ margin: "0" }}>
            <span className="eyebrow">Contact</span>
            <h2>Talk to a person</h2>
            <p className="lead">A real person from the Dorothy team reads every message. Or email <a href="mailto:hello@dorothy.in" style={{ textDecoration: "underline" }}>hello@dorothy.in</a>.</p>
            <div className="callout" style={{ marginTop: "12px" }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 3 2 21h20Z"/><path d="M12 10v5M12 18h.01"/></svg><p>Dorothy is not an emergency service. If you are in danger, call <a href="tel:112">112</a>.</p></div>
          </div>
          <DorothyForm kind="Contact">
            <div className="form-row">
              <div className="field"><label htmlFor="m-name">Name (optional)</label><input id="m-name" name="name" type="text" /></div>
              <div className="field"><label htmlFor="m-reply">Where should we reply?</label><input id="m-reply" name="reply_to" type="text" required /></div>
            </div>
            <div className="field"><label htmlFor="m-msg">Message</label><textarea id="m-msg" name="message" required></textarea></div>
            <input type="text" name="company" tabIndex={-1} autoComplete="off" style={{ display: "none" }} aria-hidden="true" />
            <div><button className="btn btn--light" type="submit">Send message</button></div>
          </DorothyForm>
        </div>
      </section>
    </main>
  );
}
