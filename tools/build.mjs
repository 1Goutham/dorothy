// Dorothy — zero-dependency static build.
// Composes src/pages/*.html with shared partials and writes the final pages to the repo root,
// so the site can be hosted for free on GitHub Pages / Cloudflare Pages / Netlify as-is.
//   <!--#head title="…" desc="…"-->   <!--#header active="home"-->   <!--#footer-->
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const part = (n) => readFileSync(join(root, "src/partials", n + ".html"), "utf8");
const attrs = (s) => Object.fromEntries([...s.matchAll(/(\w+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
const fill = (tpl, vars) => tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? "");

const pages = readdirSync(join(root, "src/pages")).filter((f) => f.endsWith(".html"));
for (const f of pages) {
  let html = readFileSync(join(root, "src/pages", f), "utf8");
  html = html.replace(/<!--#head([^>]*)-->/, (_, a) => fill(part("head"), { page: f, ...attrs(a) }));
  html = html.replace(/<!--#header([^>]*)-->/, (_, a) => {
    const { active = "" } = attrs(a);
    return part("header").replace(/data-nav="(\w+)"/g, (m, k) => (k === active ? 'aria-current="page"' : ""));
  });
  html = html.replace(/<!--#ask([^>]*)-->/, (_, a) => fill(part("ask"), attrs(a)));
  html = html.replace(/<!--#footer-->/, part("footer"));
  html = html.replace("<!doctype html>\n", "<!doctype html>\n<!-- Generated from src/pages/" + f + " by tools/build.mjs — edit the source, then run `node tools/build.mjs`. -->\n");
  writeFileSync(join(root, f), html);
  console.log("built", f);
}
