// Dorothy production build: src/ -> dist/
// Bundles and tree-shakes three.js, minifies HTML/CSS/JS, fingerprints assets,
// adds a Content-Security-Policy, sitemap, robots and web manifest.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, cpSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import * as esbuild from "esbuild";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src");
const out = join(root, "dist");
const SITE = (process.env.SITE_URL || "https://dorothy.in").replace(/\/$/, "");

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, "js"), { recursive: true });
mkdirSync(join(out, "css"), { recursive: true });
mkdirSync(join(out, "data"), { recursive: true });

const hash = (s) => createHash("sha256").update(s).digest("hex").slice(0, 10);
const versions = {};
const write = (rel, content) => { writeFileSync(join(out, rel), content); versions[rel] = hash(content); };

/* CSS: fonts + styles in one minified file */
const css = readFileSync(join(src, "css/fonts.css"), "utf8") + readFileSync(join(src, "css/style.css"), "utf8");
write("css/style.css", (await esbuild.transform(css, { loader: "css", minify: true, target: ["chrome90", "safari14", "firefox90"] })).code);

/* Classic scripts and data */
for (const f of ["js/config.js", "js/main.js", "js/dorothy-ai.js", "js/directory.js", "data/knowledge.js", "data/resources.js"]) {
  const code = readFileSync(join(src, f), "utf8");
  write(f, (await esbuild.transform(code, { loader: "js", minify: true, target: "es2019", legalComments: "none" })).code);
}

/* 3D modules: bundled with a shared, tree-shaken three.js chunk */
const bundle = await esbuild.build({
  entryPoints: [join(src, "js/hero.js"), join(src, "js/kolam.js")],
  bundle: true, splitting: true, format: "esm", minify: true, target: "es2020",
  outdir: join(out, "js"), chunkNames: "chunks/[name]-[hash]", legalComments: "none", write: false,
});
for (const f of bundle.outputFiles) {
  mkdirSync(dirname(f.path), { recursive: true });
  writeFileSync(f.path, f.contents);
  versions[f.path.slice(out.length + 1)] = hash(f.contents);
}

/* Static assets */
cpSync(join(src, "assets"), join(out, "assets"), { recursive: true });

/* Content-Security-Policy: only Dorothy itself, plus endpoints configured in config.js */
const config = readFileSync(join(src, "js/config.js"), "utf8");
const origins = [...config.matchAll(/(?:formEndpoint|aiEndpoint)\s*:\s*"([^"]+)"/g)]
  .map((m) => { try { return new URL(m[1]).origin; } catch { return null; } }).filter(Boolean);
const csp = [
  "default-src 'self'", "script-src 'self'", "style-src 'self' 'unsafe-inline'", "img-src 'self' data:",
  "font-src 'self'", `connect-src 'self' ${origins.join(" ")}`.trim(), "base-uri 'self'", "object-src 'none'",
  `form-action 'self' mailto: ${origins.join(" ")}`.trim(),
].join("; ");

/* Pages */
const part = (n) => readFileSync(join(src, "partials", n + ".html"), "utf8");
const attrs = (s) => Object.fromEntries([...s.matchAll(/(\w+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
const fill = (tpl, vars) => tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? "");
const minifyHtml = (html) => html
  .replace(/<!--[\s\S]*?-->/g, "")
  .replace(/\s+/g, " ")
  .trim();

const pages = readdirSync(join(src, "pages")).filter((f) => f.endsWith(".html"));
for (const f of pages) {
  let html = readFileSync(join(src, "pages", f), "utf8");
  html = html.replace(/<!--#head([^>]*)-->/, (_, a) => fill(part("head"), { csp, url: SITE + "/" + (f === "index.html" ? "" : f), ...attrs(a) }));
  html = html.replace(/<!--#header([^>]*)-->/, (_, a) => {
    const { active = "" } = attrs(a);
    return part("header").replace(/ data-nav="(\w+)"/g, (m, k) => (k === active ? ' aria-current="page"' : ""));
  });
  html = html.replace(/<!--#ask([^>]*)-->/, (_, a) => fill(part("ask"), attrs(a)));
  html = html.replace(/<!--#footer-->/, part("footer"));
  html = html.replace(/(href|src)="((?:css|js|data)\/[^"?]+)"/g, (m, k, p) => (versions[p] ? `${k}="${p}?v=${versions[p]}"` : m));
  writeFileSync(join(out, f), minifyHtml(html));
}

/* Discovery & install */
const urls = pages.filter((p) => p !== "404.html").map((p) => `<url><loc>${SITE}/${p === "index.html" ? "" : p}</loc></url>`).join("");
writeFileSync(join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
writeFileSync(join(out, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
writeFileSync(join(out, "manifest.webmanifest"), JSON.stringify({
  name: "Dorothy", short_name: "Dorothy", start_url: "./", display: "standalone",
  background_color: "#0a0a0a", theme_color: "#0a0a0a",
  icons: [{ src: "assets/favicon.svg", sizes: "any", type: "image/svg+xml" }],
}));
writeFileSync(join(out, ".nojekyll"), "");
writeFileSync(join(out, "_headers"), `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()\n  X-Frame-Options: DENY\n  Content-Security-Policy: ${csp}; frame-ancestors 'none'\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n`);
if (existsSync(join(src, "CNAME"))) cpSync(join(src, "CNAME"), join(out, "CNAME"));

console.log(`Built ${pages.length} pages to dist/`);
