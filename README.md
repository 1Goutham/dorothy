# Dorothy · டோரதி

**Your life is more than what the world sees.**

A free, community-led support ecosystem for transgender people in India, starting in Tamil Nadu.

> பிறப்பொக்கும் எல்லா உயிர்க்கும் சிறப்பொவ்வா செய்தொழில் வேற்றுமை யான். (Thirukkural 972)

## Develop

```bash
npm install
```

```bash
npm run dev
```

Opens the production build at http://localhost:8000.

```bash
npm test
```

## Build

```bash
npm run build
```

Writes a minified, fingerprinted site to `dist/` with a Content-Security-Policy, sitemap, robots.txt and web manifest. Set `SITE_URL` to your domain for canonical links and the sitemap.

## Deploy

Push to `main`. `.github/workflows/deploy.yml` tests, builds and publishes `dist/` to GitHub Pages (Settings → Pages → Source: GitHub Actions). Cloudflare Pages and Netlify work too: build command `npm run build`, output `dist`.

## Structure

```
src/pages        page content
src/partials     head, header, footer, Ask Dorothy widget
src/css          styles and self-hosted fonts
src/js           interactions, Dorothy AI, 3D hero (hero.js) and kolam (kolam.js)
src/data         verified knowledge base and resource directory
src/assets       goddess colour and depth maps, fonts, icon
tools            build, local server, goddess map generator
worker           optional Cloudflare Workers AI service for Dorothy AI
```

## Configuration

`src/js/config.js`

| Key | Purpose |
|---|---|
| `formEndpoint` | Free form backend (Formspree, Web3Forms). Empty opens the visitor's email app. |
| `contactEmail` | Inbox for form submissions. |
| `aiEndpoint` | URL of the deployed `worker/`. Empty answers straight from the knowledge base. |

## Content rules

Every knowledge base entry and resource cites an official source and the date a person last checked it. Organisations are listed only with consent. `.github/workflows/check-links.yml` checks every source weekly and opens an issue when one breaks.

## Hero maps

```bash
python3 tools/goddess_maps.py path/to/goddess.webp src/assets/goddess
```

## Licences

three.js: MIT. Poppins and Noto Sans Tamil: SIL Open Font License.
