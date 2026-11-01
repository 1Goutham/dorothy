/* Dorothy, shared interactions. No dependencies. */
(function () {
  "use strict";
  const doc = document.documentElement;
  doc.classList.add("js");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(pointer: fine)").matches;

  /* Header state */
  const header = document.querySelector(".site-header");
  const onScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile menu */
  const menuBtn = document.querySelector(".menu-btn");
  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      const open = document.body.classList.toggle("menu-open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    document.querySelectorAll(".nav a").forEach((a) =>
      a.addEventListener("click", () => {
        document.body.classList.remove("menu-open");
        menuBtn.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* Quick exit: leaves instantly and replaces history entry. Esc twice also works. */
  const exit = () => { window.location.replace("https://www.google.com/search?q=weather"); };
  document.querySelectorAll("[data-quick-exit]").forEach((b) => b.addEventListener("click", exit));
  let lastEsc = 0;
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const now = Date.now();
    if (now - lastEsc < 600) exit();
    lastEsc = now;
  });

  /* Reveal, once, quietly */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach((el) => io.observe(el));
  } else reveals.forEach((el) => el.classList.add("is-in"));

  /* 3D tilt with soft glare, pointer devices only */
  if (fine && !reduce) {
    let current = null;
    const release = (card) => {
      card.classList.remove("is-tilting");
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    };
    document.addEventListener("pointermove", (e) => {
      const card = e.target.closest ? e.target.closest(".tilt") : null;
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
    }, { passive: true });
    document.addEventListener("pointerleave", () => current && release(current));
  }

  /* Pillars: tap to open on touch */
  document.querySelectorAll(".pillar").forEach((p) =>
    p.addEventListener("click", () => p.classList.toggle("is-open"))
  );

  /* Support cycle, a 3D ring that turns the chosen step to the front */
  const ring = document.querySelector("[data-ring]");
  if (ring) {
    const nodes = Array.from(ring.querySelectorAll(".node"));
    const steps = nodes.length;
    const detail = document.querySelector("[data-ring-detail]");
    const stage = ring.parentElement;
    let idx = 0, turn = 0;

    const layout = () => {
      const rad = ring.clientWidth / 2;
      nodes.forEach((n, i) => {
        n.style.setProperty("--a", (i * 360) / steps + "deg");
        n.style.setProperty("--r", rad + "px");
      });
    };
    const select = (i, fromUser) => {
      const prev = idx;
      idx = (i + steps) % steps;
      // shortest path rotation
      let delta = idx - prev;
      if (delta > steps / 2) delta -= steps;
      if (delta < -steps / 2) delta += steps;
      turn -= delta * (360 / steps);
      // front of the ring = bottom (closest to viewer when tilted back)
      ring.style.setProperty("--rot", 180 + turn + "deg");
      nodes.forEach((n, j) => n.querySelector("button").setAttribute("aria-pressed", String(j === idx)));
      const b = nodes[idx].querySelector("button");
      if (detail) {
        detail.querySelector("[data-n]").textContent = String(idx + 1).padStart(2, "0");
        detail.querySelector("[data-t]").textContent = b.dataset.title;
        detail.querySelector("[data-d]").textContent = b.dataset.desc;
      }
      if (fromUser) stopAuto();
    };
    nodes.forEach((n, i) => n.querySelector("button").addEventListener("click", () => select(i, true)));
    document.querySelector("[data-ring-prev]")?.addEventListener("click", () => select(idx - 1, true));
    document.querySelector("[data-ring-next]")?.addEventListener("click", () => select(idx + 1, true));

    if (fine && !reduce) {
      stage.addEventListener("pointermove", (e) => {
        const r = stage.getBoundingClientRect();
        const py = (e.clientY - r.top) / r.height - 0.5;
        ring.style.setProperty("--tilt", 64 + py * -10 + "deg");
      });
      stage.addEventListener("pointerleave", () => ring.style.setProperty("--tilt", "64deg"));
    }

    let timer = null;
    const startAuto = () => { if (!reduce) timer = setInterval(() => select(idx + 1), 4200); };
    const stopAuto = () => { clearInterval(timer); timer = null; };
    const vis = new IntersectionObserver(([en]) => { en.isIntersecting ? (!timer && startAuto()) : stopAuto(); });
    layout();
    new ResizeObserver(layout).observe(ring);
    select(0);
    vis.observe(stage);
    stage.addEventListener("pointerenter", stopAuto);
  }

  /* Forms: no tracking, no backend required.
     If DOROTHY_CONFIG.formEndpoint is set (e.g. a free Formspree/Web3Forms/Getform URL),
     we POST there. Otherwise we open the visitor's email app with the message prefilled. */
  document.querySelectorAll("form[data-form]").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const status = form.querySelector(".form-status");
      const cfg = window.DOROTHY_CONFIG || {};
      const data = new FormData(form);
      if (data.get("company")) return; // honeypot
      data.delete("company");
      const kind = form.dataset.form;
      const lines = [];
      data.forEach((v, k) => lines.push(k + ": " + v));
      if (cfg.formEndpoint) {
        try {
          data.append("_subject", "Dorothy, " + kind);
          const res = await fetch(cfg.formEndpoint, { method: "POST", body: data, headers: { Accept: "application/json" } });
          if (!res.ok) throw new Error(res.status);
          form.reset();
          status.textContent = "Thank you, we received this. Someone from Dorothy will reach out.";
          return;
        } catch (err) {
          status.textContent = "Couldn't send right now. Opening your email app instead…";
        }
      }
      const mail = "mailto:" + (cfg.contactEmail || "hello@dorothy.in") +
        "?subject=" + encodeURIComponent("Dorothy, " + kind) +
        "&body=" + encodeURIComponent(lines.join("\n"));
      window.location.href = mail;
      status.textContent = "Your email app should open with this message ready to send.";
    });
  });

  /* Year */
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
