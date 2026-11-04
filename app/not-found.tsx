import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main">
      <section className="page-hero" style={{ border: "0", minHeight: "60vh", display: "grid", alignItems: "center" }}>
        <div className="wrap">
          <span className="eyebrow">404</span>
          <h1>This path doesn't lead anywhere yet.</h1>
          <p className="lead">But you're in the right place. Let's find what you need.</p>
          <div className="hero-actions"><Link className="btn btn--light" href="/">Go home</Link><Link className="btn" href="/ask">Ask Dorothy</Link><Link className="btn" href="/find-help">Find help</Link></div>
        </div>
      </section>
    </main>
  );
}
