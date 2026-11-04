"use client";

/* Find help directory: filter and search, deep-linkable via #category */
import { useEffect, useState } from "react";
import Link from "next/link";
import { CATS, RESOURCES } from "@/data/resources";
import { Arrow } from "./icons";

export default function Directory() {
  const [active, setActive] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.slice(1);
      if (CATS[h]) setActive(h);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const pick = (k: string) => {
    setActive(k);
    history.replaceState(null, "", "#" + k);
  };

  const q = query.trim().toLowerCase();
  const items = RESOURCES.filter(
    (r) => (active === "all" || r.cat === active) && (!q || `${r.name} ${r.ta} ${r.desc} ${r.scope}`.toLowerCase().includes(q))
  );

  return (
    <>
      <div className="toolbar">
        <div className="filters" role="group" aria-label="Filter by category">
          {Object.entries(CATS).map(([k, c]) => (
            <button key={k} className="filter" type="button" aria-pressed={k === active} onClick={() => pick(k)}>
              {c.en} <span className="ta" lang="ta" style={{ opacity: 0.6 }}>· {c.ta}</span>
            </button>
          ))}
        </div>
        <label className="search">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="7" cy="7" r="5" /><path d="m14 14-3.5-3.5" /></svg>
          <span className="sr-only">Search resources</span>
          <input type="search" placeholder="Search: shelter, scholarship…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </div>
      <div className="res-grid" aria-live="polite">
        {items.length ? (
          items.map((r) => (
            <article className="res tilt" data-tilt="4" key={r.name}>
              <div className="res-top">
                <span className="res-cat">{CATS[r.cat]?.en || r.cat}</span>
                <span className={`tag ${r.verified === "official" ? "tag--live" : ""}`}>
                  {r.verified === "official" ? "Official source" : "Community verified"}
                </span>
              </div>
              <h3>{r.name}</h3>
              <div className="ta" lang="ta" style={{ color: "var(--faint)", fontSize: ".86rem", marginTop: "-6px" }}>{r.ta}</div>
              <p>{r.desc}</p>
              <div className="res-links">
                {r.phone && <a className="btn btn--sm btn--light" href={`tel:${r.phone}`}>Call {r.phone}</a>}
                {r.url && <a className="btn btn--sm" href={r.url} target="_blank" rel="noopener noreferrer">Visit <Arrow /></a>}
              </div>
              <div className="res-foot"><span>{r.scope}</span><span>Checked {r.checked}</span></div>
            </article>
          ))
        ) : (
          <p className="empty">
            Nothing verified here yet. <Link href="/get-involved#organisation" style={{ textDecoration: "underline" }}>Know a trusted service? Tell us.</Link>
          </p>
        )}
      </div>
    </>
  );
}
