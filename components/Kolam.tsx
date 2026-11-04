"use client";

import { useEffect, useRef } from "react";

/* A sikku kolam drawn as one woven 3D line; it draws itself the first time it is seen. */
export default function Kolam() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let dispose = () => {};
    let cancelled = false;
    import("@/lib/three/kolam").then(({ mountKolam }) => {
      if (!cancelled && ref.current) dispose = mountKolam(ref.current);
    });
    return () => { cancelled = true; dispose(); };
  }, []);
  return <div className="join-art reveal" ref={ref} aria-hidden="true" />;
}
