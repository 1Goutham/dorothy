"use client";

/* Site-wide, quiet interactions: reveal on scroll, 3D tilt with glare, tap-to-open pillars,
   and the Esc-twice safety exit. */
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function SiteEffects() {
  const path = usePathname();

  // reveal: once, for whatever is on the current page
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = document.querySelectorAll<HTMLElement>(".reveal:not(.is-in)");
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      }),
      { rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [path]);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = matchMedia("(pointer: fine)").matches;
    const cleanups: (() => void)[] = [];

    // 3D tilt with soft glare, pointer devices only
    if (fine && !reduce) {
      let current: HTMLElement | null = null;
      const release = (card: HTMLElement) => {
        card.classList.remove("is-tilting");
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      };
      const onMove = (e: PointerEvent) => {
        const card = (e.target as Element | null)?.closest?.(".tilt") as HTMLElement | null;
        if (current && current !== card) release(current);
        current = card;
        if (!card) return;
        const max = parseFloat(card.dataset.tilt || "7");
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.classList.add("is-tilting");
        card.style.setProperty("--ry", ((px - 0.5) * max * 2).toFixed(2) + "deg");
        card.style.setProperty("--rx", ((0.5 - py) * max * 2).toFixed(2) + "deg");
        card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
      };
      document.addEventListener("pointermove", onMove, { passive: true });
      cleanups.push(() => document.removeEventListener("pointermove", onMove));
    }

    // pillars open on tap
    const onClick = (e: MouseEvent) => {
      const p = (e.target as Element | null)?.closest?.(".pillar");
      if (p) p.classList.toggle("is-open");
    };
    document.addEventListener("click", onClick);
    cleanups.push(() => document.removeEventListener("click", onClick));

    // safety: Esc twice leaves instantly and replaces the history entry
    let lastEsc = 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const now = Date.now();
      if (now - lastEsc < 600) window.location.replace("https://www.google.com/search?q=weather");
      lastEsc = now;
    };
    document.addEventListener("keydown", onKey);
    cleanups.push(() => document.removeEventListener("keydown", onKey));

    return () => cleanups.forEach((c) => c());
  }, []);

  return null;
}
