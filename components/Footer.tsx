import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-about">
            <svg viewBox="0 0 120 32" height="30" aria-hidden="true">
              <text x="0" y="23" style={{ fontFamily: "var(--font-poppins), sans-serif" }} fontWeight="600" fontSize="22" letterSpacing="-0.6" fill="#f3f1ee">Dorothy</text>
              <g transform="translate(106 15)"><circle r="10" fill="#e1251b"/><g fill="none" stroke="#fff" strokeWidth="1.2"><circle cx="0" cy="-3.3" r="2.7"/><circle cx="3.3" cy="0" r="2.7"/><circle cx="0" cy="3.3" r="2.7"/><circle cx="-3.3" cy="0" r="2.7"/></g><circle r="1.1" fill="#fff"/></g>
            </svg>
            <p>A free, community-led support ecosystem for transgender people, starting in Tamil Nadu. No ads. No tracking. Ever.</p>
            <p className="ta" lang="ta">உங்கள் வாழ்க்கை உலகம் பார்ப்பதை விட மேலானது.</p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link href="/find-help">Find help</Link></li>
              <li><Link href="/ask">Dorothy AI</Link></li>
              <li><Link href="/stories">Stories of Strength</Link></li>
              <li><Link href="/find-help#education">Opportunities</Link></li>
            </ul>
          </div>
          <div>
            <h4>Dorothy</h4>
            <ul>
              <li><Link href="/get-involved">Volunteer</Link></li>
              <li><Link href="/get-involved#organisation">List an organisation</Link></li>
              <li><Link href="/privacy">Privacy &amp; trust</Link></li>
              <li><Link href="/get-involved#contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4>Need help now?</h4>
            <div className="sos">
              <a href="tel:112"><span>Emergency</span><b>112</b></a>
              <a href="tel:14416"><span>Tele-MANAS · mental health</span><b>14416</b></a>
              <a href="tel:15100"><span>Free legal aid</span><b>15100</b></a>
            </div>
          </div>
        </div>
        <div className="foot-base">
          <span>© <span>{new Date().getFullYear()}</span> Dorothy · Built openly, for free, with the community.</span>
        </div>
      </div>
    </footer>
  );
}
