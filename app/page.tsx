import type { Metadata } from "next";
import Link from "next/link";
import GoddessHero from "@/components/GoddessHero";
import SupportCycle from "@/components/SupportCycle";
import Kolam from "@/components/Kolam";
import AskDorothy from "@/components/AskDorothy";

export const metadata: Metadata = {
  title: "Dorothy · Your life is more than what the world sees",
  description: "A free, community-led support ecosystem for transgender people in India, starting in Tamil Nadu. Verified help, Dorothy AI in Tamil & English, opportunities and stories of strength.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main id="main">

  
      <section className="hero">
        <div className="wrap">
          <div className="hero-copy">
            <span className="eyebrow">Dorothy · டோரதி · Tamil Nadu</span>
            <h1>Your life is more than what <em>the world sees.</em></h1>
            <p className="hero-ta" lang="ta">பிறப்பொக்கும் எல்லா உயிர்க்கும்<br />சிறப்பொவ்வா செய்தொழில் வேற்றுமை யான்</p>
            <div className="hero-actions">
              <Link className="btn btn--light" href="/find-help">Find support <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5"/></svg></Link>
              <Link className="btn" href="/ask">Ask Dorothy AI <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5"/></svg></Link>
              <Link className="btn" href="/stories">Explore stories <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5"/></svg></Link>
            </div>
          </div>

          <GoddessHero />
        </div>
      </section>

  
      <section className="kural" aria-labelledby="kural-title">
        <div className="wrap">
          <span className="kural-num" id="kural-title">Thirukkural · 972</span>
          <div className="reveal">
            <p className="kural-text" lang="ta">பிறப்பொக்கும் எல்லா உயிர்க்கும் சிறப்பொவ்வா<br />செய்தொழில் வேற்றுமை யான்.</p>
            <p className="kural-tr">“All lives are equal by birth. What distinguishes us is only the worth of what we do.” Thiruvalluvar. Dorothy is built on this idea: no one is less because of who they are.</p>
          </div>
          <svg className="kural-mark" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
            <circle cx="32" cy="20" r="10"/><circle cx="44" cy="32" r="10"/><circle cx="32" cy="44" r="10"/><circle cx="20" cy="32" r="10"/>
            <circle cx="32" cy="32" r="2" fill="currentColor"/><circle cx="32" cy="4" r="1.4" fill="currentColor"/><circle cx="60" cy="32" r="1.4" fill="currentColor"/><circle cx="32" cy="60" r="1.4" fill="currentColor"/><circle cx="4" cy="32" r="1.4" fill="currentColor"/>
          </svg>
        </div>
      </section>

  
      <section className="section" id="start">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">Find help</span>
            <h2>Whatever you need, start here</h2>
            <p className="lead">Finding the right help shouldn't be difficult. Explore resources, discover opportunities and find people who can help you take your next step.</p>
          </div>
          <div className="need-grid">
            <Link className="need tilt reveal" href="/find-help#shelter">
              <svg className="need-icon lift" viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
                <path d="M8 26 28 9l20 17" /><path d="M13 22v25h30V22" fill="rgba(225,37,27,.12)"/>
                <path d="M28 41s-7-4.3-7-9a3.6 3.6 0 0 1 7-1.4A3.6 3.6 0 0 1 35 32c0 4.7-7 9-7 9Z" fill="currentColor" stroke="none"/>
              </svg>
              <h3 className="lift">Safe shelter</h3>
              <p>Find accommodation and housing support: Garima Greh, welfare-board homes and emergency help.</p>
              <span className="need-foot"><span className="btn btn--sm">Explore <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5"/></svg></span></span>
            </Link>
            <Link className="need tilt reveal" href="/find-help#wellbeing">
              <svg className="need-icon lift" viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M28 30s-9-5.4-9-11.4A4.6 4.6 0 0 1 28 16.8a4.6 4.6 0 0 1 9 1.8C37 24.6 28 30 28 30Z" fill="currentColor" stroke="none"/>
                <path d="M6 34l8-4c2-1 4-1 6 0l7 3c1.6.7 1.4 3-.4 3.2L20 37" /><path d="M50 34l-8-4c-2-1-4-1-6 0l-7 3"/>
                <path d="M6 34v10l9-3 13 4 13-4 9 3V34" fill="rgba(225,37,27,.12)"/>
              </svg>
              <h3 className="lift">Wellbeing</h3>
              <p>Free 24×7 mental health support, and trans-affirming professionals as we verify them.</p>
              <span className="need-foot"><span className="btn btn--sm">Explore <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5"/></svg></span></span>
            </Link>
            <Link className="need tilt reveal" href="/find-help#education">
              <svg className="need-icon lift" viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 20 28 10l24 10-24 10Z" fill="rgba(225,37,27,.18)"/><path d="M14 25v11c0 3 6.3 6 14 6s14-3 14-6V25"/><path d="M52 20v12"/><circle cx="52" cy="34" r="2" fill="currentColor"/>
              </svg>
              <h3 className="lift">Scholarships</h3>
              <p>Discover education funding and learning opportunities from Class IX to post-graduation.</p>
              <span className="need-foot"><span className="btn btn--sm">Explore <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5"/></svg></span></span>
            </Link>
            <Link className="need tilt reveal" href="/find-help#work">
              <svg className="need-icon lift" viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
                <rect x="7" y="17" width="42" height="29" rx="4" fill="rgba(225,37,27,.12)"/><path d="M21 17v-4a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4"/><path d="M7 29h42"/><rect x="24" y="26" width="8" height="6" rx="1.5" fill="currentColor"/>
              </svg>
              <h3 className="lift">Work &amp; careers</h3>
              <p>Explore jobs, skills training and mentorship with employers who include you.</p>
              <span className="need-foot"><span className="btn btn--sm">Explore <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5"/></svg></span></span>
            </Link>
          </div>
        </div>
      </section>

  
      <section className="section section--band" id="pillars">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">The six pillars</span>
            <h2>One ecosystem, built around a whole life</h2>
            <p className="lead">Not just a list of where to get help. A place that helps you move forward.</p>
          </div>
          <div className="pillars">
            <div className="pillar reveal" tabIndex={0}>
              <span className="pillar-n">01</span>
              <div><h3>Find Help <span className="ta" lang="ta">உதவி</span></h3><div className="pillar-body"><div><p>Shelters, accommodation, essential services and support. Each one is checked against its official source, with the date it was last verified.</p></div></div></div>
              <span className="tag tag--live">Live</span>
            </div>
            <div className="pillar reveal" tabIndex={0}>
              <span className="pillar-n">02</span>
              <div><h3>Dorothy AI <span className="ta" lang="ta">டோரதி AI</span></h3><div className="pillar-body"><div><p>A Tamil and English assistant that answers only from verified sources (retrieval-augmented), shows where every answer comes from, and hands you to a human when it should.</p></div></div></div>
              <span className="tag tag--live">Live</span>
            </div>
            <div className="pillar reveal" tabIndex={0}>
              <span className="pillar-n">03</span>
              <div><h3>Community Connect <span className="ta" lang="ta">சமூக இணைப்பு</span></h3><div className="pillar-body"><div><p>A moderated space for trans-to-trans support and peer connection. Private by default, verified members, and you control what you share.</p></div></div></div>
              <span className="tag">Phase 3</span>
            </div>
            <div className="pillar reveal" tabIndex={0}>
              <span className="pillar-n">04</span>
              <div><h3>Stories of Strength <span className="ta" lang="ta">வலிமையின் கதைகள்</span></h3><div className="pillar-body"><div><p>Real journeys and achievements that deserve to be heard. Shared only with full consent, and withdrawable at any time.</p></div></div></div>
              <span className="tag tag--live">Open for stories</span>
            </div>
            <div className="pillar reveal" tabIndex={0}>
              <span className="pillar-n">05</span>
              <div><h3>Opportunities <span className="ta" lang="ta">வாய்ப்புகள்</span></h3><div className="pillar-body"><div><p>Scholarships, education, employment, mentorship and professional growth, with eligibility explained simply.</p></div></div></div>
              <span className="tag tag--live">Live</span>
            </div>
            <div className="pillar reveal" tabIndex={0}>
              <span className="pillar-n">06</span>
              <div><h3>Give Support <span className="ta" lang="ta">ஆதரவு தர</span></h3><div className="pillar-body"><div><p>Volunteers, professionals, sponsors and partners: everyone who wants to show up for someone else.</p></div></div></div>
              <span className="tag tag--live">Volunteers welcome</span>
            </div>
          </div>
        </div>
      </section>

  
      <section className="section" id="cycle">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">The support cycle</span>
            <h2>From finding help to becoming help</h2>
            <p className="lead">Dorothy is designed as a complete cycle. Every person who is supported can one day support someone else.</p>
          </div>
          <SupportCycle />
        </div>
      </section>

  
      <section className="section section--band" id="join">
        <div className="wrap join">
          <Kolam />
          <div className="join-copy reveal">
            <span className="eyebrow">Give support</span>
            <h2>Be a part of <span className="ta-word" lang="ta">டோரதி</span></h2>
            <p className="lead">Whoever you are, whatever you can offer (your time, skills or kindness) can help make life a little easier for someone. Let's show up for each other.</p>
            <div className="hero-actions">
              <Link className="btn btn--light" href="/get-involved">Join as a volunteer <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5"/></svg></Link>
              <Link className="btn" href="/get-involved#organisation">List your organisation</Link>
            </div>
          </div>
        </div>
      </section>

  
      <section className="section" id="ask">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">Dorothy AI</span>
            <h2>Ask anything, in Tamil or English</h2>
            <p className="lead">Dorothy answers only from verified sources and shows you where each answer comes from. If it doesn't know, it says so and points you to a person.</p>
          </div>
          <div className="reveal"><AskDorothy id="home" /></div>
        </div>
      </section>

  
      <section className="section section--band" id="trust">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">Trust is the foundation</span>
            <h2>Private by design. Verified by people.</h2>
          </div>
          <div className="grid-4 reveal">
            <div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
              <h3>Private</h3><p>No accounts, ads or tracking. Questions you ask Dorothy AI are never stored or linked to you.</p>
            </div>
            <div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M12 3 4 6v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V6Z"/><path d="m9 12 2 2 4-4"/></svg>
              <h3>Verified</h3><p>Every resource links to its official source and shows when a person last checked it.</p>
            </div>
            <div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M7 11V7a5 5 0 0 1 10 0v4"/><path d="M5 11h14v3a7 7 0 0 1-14 0Z"/></svg>
              <h3>Consent first</h3><p>Stories and listings are published only with written consent and can be withdrawn any time.</p>
            </div>
            <div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>
              <h3>Safe exit</h3><p>Press Esc twice to leave instantly if you're not in a safe space.</p>
            </div>
          </div>
        </div>
      </section>

  
      <section className="section" id="roadmap">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">Roadmap</span>
            <h2>Built step by step, with care</h2>
            <p className="lead">We would rather do a few things well than many things badly. Here's how Dorothy grows.</p>
          </div>
          <div className="roadmap">
            <div className="phase is-now reveal"><h3>Foundation</h3><p>Website, verified resources and Dorothy AI in Tamil &amp; English.</p><span className="tag tag--red">Now</span></div>
            <div className="phase reveal"><h3>Care network</h3><p>Shelters, scholarships and volunteer professionals, verified one by one.</p><span className="tag">Next</span></div>
            <div className="phase reveal"><h3>Community</h3><p>Community Connect and Stories of Strength, moderated and private by default.</p><span className="tag">Phase 3</span></div>
            <div className="phase reveal"><h3>Partnerships</h3><p>Sponsors, transparent donations and employer partnerships.</p><span className="tag">Phase 4</span></div>
            <div className="phase reveal"><h3>Across India</h3><p>Beyond Tamil Nadu. More states, more languages.</p><span className="tag">Phase 5</span></div>
          </div>
        </div>
      </section>

    </main>
  );
}
