"use client";

/* The support cycle: a 3D ring that turns the chosen step to the front. */
import { useEffect, useRef, useState, type CSSProperties } from "react";

const STEPS = [
  { label: "Discover", title: "Discover Dorothy", desc: "A friend, a search, a poster at a clinic. Someone finds a calm, private place that was made for them." },
  { label: "Ask", title: "Ask in Tamil", desc: "They ask Dorothy AI a question in their own language and get an answer from verified sources, with the source shown." },
  { label: "Verified help", title: "Reach verified help", desc: "They find a verified organisation, shelter, helpline or professional, with what to expect before they go." },
  { label: "Opportunity", title: "Find an opportunity", desc: "A scholarship, a skill course, a mentor or a job with an employer who includes them." },
  { label: "Connect", title: "Connect with community", desc: "They meet people who understand their experience, trans-to-trans support, safely." },
  { label: "Give back", title: "Give back", desc: "Eventually, they become someone who supports another person. The cycle continues." },
];
const N = STEPS.length;

export default function SupportCycle() {
  const [{ idx, turn }, setRing] = useState({ idx: 0, turn: 0 });
  const [tilt, setTilt] = useState(64);
  const [radius, setRadius] = useState(180);
  const ringRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const auto = useRef<ReturnType<typeof setInterval> | null>(null);

  // turn the shortest way round to the chosen step
  const select = (next: number | ((i: number) => number)) => {
    setRing((prev) => {
      const raw = typeof next === "function" ? next(prev.idx) : next;
      const target = ((raw % N) + N) % N;
      let delta = target - prev.idx;
      if (delta > N / 2) delta -= N;
      if (delta < -N / 2) delta += N;
      return { idx: target, turn: prev.turn - delta * (360 / N) };
    });
  };
  const stopAuto = () => { if (auto.current) clearInterval(auto.current); auto.current = null; };
  const choose = (i: number) => { stopAuto(); select(i); };

  useEffect(() => {
    const ring = ringRef.current, stage = stageRef.current;
    if (!ring || !stage) return;
    const ro = new ResizeObserver(() => setRadius(ring.clientWidth / 2));
    ro.observe(ring);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting && !auto.current && !reduce) auto.current = setInterval(() => select((i) => i + 1), 4200);
      if (!en.isIntersecting) stopAuto();
    });
    io.observe(stage);
    return () => { ro.disconnect(); io.disconnect(); stopAuto(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fine = typeof window !== "undefined" && matchMedia("(pointer: fine)").matches;
  const step = STEPS[idx];

  return (
    <div className="cycle">
      <div
        className="ring-stage reveal"
        ref={stageRef}
        onPointerEnter={stopAuto}
        onPointerMove={(e) => {
          if (!fine) return;
          const r = e.currentTarget.getBoundingClientRect();
          setTilt(64 + ((e.clientY - r.top) / r.height - 0.5) * -10);
        }}
        onPointerLeave={() => setTilt(64)}
      >
        <div className="ring" ref={ringRef} style={{ "--rot": `${180 + turn}deg`, "--tilt": `${tilt}deg` } as CSSProperties}>
          <div className="ring-core"></div>
          {STEPS.map((s, i) => (
            <div className="node" key={s.label} style={{ "--a": `${(i * 360) / N}deg`, "--r": `${radius}px` } as CSSProperties}>
              <button type="button" aria-pressed={i === idx} onClick={() => choose(i)}>
                <b>{String(i + 1).padStart(2, "0")}</b>{s.label}
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="ring-detail reveal" aria-live="polite">
        <span className="step-n">{String(idx + 1).padStart(2, "0")}</span>
        <h3 style={{ fontSize: "1.6rem" }}>{step.title}</h3>
        <p>{step.desc}</p>
        <div className="ring-controls">
          <button className="icon-btn" type="button" aria-label="Previous step" onClick={() => choose(idx - 1)}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M10 3 5 8l5 5" /></svg>
          </button>
          <button className="icon-btn" type="button" aria-label="Next step" onClick={() => choose(idx + 1)}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="m6 3 5 5-5 5" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
