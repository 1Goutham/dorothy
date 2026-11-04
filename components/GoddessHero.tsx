"use client";

import { useEffect, useRef } from "react";

/* The goddess as a lit 3D relief; she crumbles to sand where the pointer touches her.
   The WebGL scene loads after first paint; the poster shows if WebGL is unavailable. */
export default function GoddessHero() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let dispose = () => {};
    let cancelled = false;
    import("@/lib/three/goddess").then(({ mountGoddess }) => {
      if (!cancelled && ref.current) dispose = mountGoddess(ref.current);
    });
    return () => { cancelled = true; dispose(); };
  }, []);
  return (
    <div className="hero-stage" data-goddess="/assets/goddess/" ref={ref}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hero-poster" src="/assets/goddess/poster.webp" width={1024} height={1063} alt="" fetchPriority="high" />
    </div>
  );
}
