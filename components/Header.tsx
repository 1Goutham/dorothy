"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Arrow, Logo } from "./icons";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/find-help", label: "Find help" },
  { href: "/stories", label: "Stories" },
  { href: "/get-involved", label: "Support" },
];

export default function Header() {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
  }, [open]);

  const current = (href: string) => (href === "/" ? path === "/" : path.startsWith(href)) ? "page" : undefined;

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
      <div className="wrap">
        <Link className="brand" href="/" aria-label="Dorothy home">
          <Logo />
        </Link>
        <nav className="nav" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={current(n.href)}>{n.label}</Link>
          ))}
          <Link href="/ask" aria-current={current("/ask")}>Dorothy<b>AI</b></Link>
        </nav>
        <Link className="btn btn--light btn--sm header-cta" href="/get-involved#contact">Contact <Arrow /></Link>
        <button className="menu-btn" type="button" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span></span><span></span>
        </button>
      </div>
    </header>
  );
}
