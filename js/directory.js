/* Dorothy — Find help directory: filter + search, deep-linkable via #category */
(function () {
  "use strict";
  const grid = document.querySelector("[data-directory]");
  if (!grid) return;
  const data = window.DOROTHY_RESOURCES || [];
  const cats = window.DOROTHY_CATS || {};
  const filtersEl = document.querySelector("[data-filters]");
  const search = document.querySelector("[data-dir-search]");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const arrow = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5"/></svg>';
  let active = (location.hash || "#all").slice(1);
  if (!cats[active]) active = "all";

  filtersEl.innerHTML = Object.keys(cats).map((k) =>
    `<button class="filter" type="button" data-cat="${k}" aria-pressed="${k === active}">${esc(cats[k].en)} <span class="ta" lang="ta" style="opacity:.6">· ${esc(cats[k].ta)}</span></button>`
  ).join("");

  function render() {
    const q = (search.value || "").trim().toLowerCase();
    const items = data.filter((r) => (active === "all" || r.cat === active) &&
      (!q || (r.name + " " + r.ta + " " + r.desc + " " + r.scope).toLowerCase().includes(q)));
    grid.innerHTML = items.length ? items.map((r) => `
      <article class="res tilt" data-tilt="4">
        <div class="res-top">
          <span class="res-cat">${esc((cats[r.cat] || {}).en || r.cat)}</span>
          <span class="tag ${r.verified === "official" ? "tag--live" : ""}">${r.verified === "official" ? "Official source" : "Community verified"}</span>
        </div>
        <h3>${esc(r.name)}</h3>
        <div class="ta" lang="ta" style="color:var(--faint);font-size:.86rem;margin-top:-6px">${esc(r.ta)}</div>
        <p>${esc(r.desc)}</p>
        <div class="res-links">
          ${r.phone ? `<a class="btn btn--sm btn--light" href="tel:${esc(r.phone)}">Call ${esc(r.phone)}</a>` : ""}
          ${r.url ? `<a class="btn btn--sm" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">Visit ${arrow}</a>` : ""}
        </div>
        <div class="res-foot"><span>${esc(r.scope)}</span><span>Checked ${esc(r.checked)}</span></div>
      </article>`).join("")
      : `<p class="empty">Nothing verified here yet. <a href="get-involved.html#organisation" style="text-decoration:underline">Know a trusted service? Tell us.</a></p>`;
  }

  filtersEl.addEventListener("click", (e) => {
    const b = e.target.closest("[data-cat]");
    if (!b) return;
    active = b.dataset.cat;
    filtersEl.querySelectorAll("[data-cat]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    history.replaceState(null, "", "#" + active);
    render();
  });
  search.addEventListener("input", render);
  window.addEventListener("hashchange", () => {
    const h = location.hash.slice(1);
    if (cats[h]) filtersEl.querySelector(`[data-cat="${h}"]`)?.click();
  });
  render();
})();
