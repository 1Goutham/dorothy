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

Opens the production build with the API at http://localhost:8000.

```bash
npm test
```

## Build

```bash
npm run build
```

Writes a minified, fingerprinted site to `dist/` with a Content-Security-Policy, sitemap, robots.txt and web manifest. Set `SITE_URL` to your domain for canonical links and the sitemap.

## Deploy

Vercel is the main host: `vercel.json` builds `dist/` and deploys `api/`. GitHub Pages (`.github/workflows/deploy.yml`) serves the static site only, where Dorothy AI uses in-browser search. Cloudflare Pages and Netlify work too: build command `npm run build`, output `dist`.

## Structure

```
src/pages        page content
src/partials     head, header, footer, Ask Dorothy widget
src/css          styles and self-hosted fonts
src/js           interactions, Dorothy AI, 3D hero (hero.js) and kolam (kolam.js)
src/data         verified knowledge base and resource directory
src/assets       goddess colour and depth maps, fonts, icon
tools            build, local server, goddess map generator
api              Dorothy AI retrieval function (BGE-M3 RAG) for Vercel
space            free Hugging Face Space that serves BGE-M3 embeddings
```

## Dorothy AI (BGE-M3 RAG)

`/api/ask` embeds each question with [BAAI/bge-m3](https://huggingface.co/BAAI/bge-m3), a multilingual model that understands Tamil and English, and ranks the verified knowledge base by meaning, blended with keyword search. Crisis messages are handled in the browser before any network call. If the service is unreachable, the chatbot answers from the same knowledge base with in-browser keyword search.

Set these in Vercel → Settings → Environment Variables:

| Variable | Required | Purpose |
|---|---|---|
| `HF_TOKEN` | yes | Hugging Face access token (free account, "Read" scope is enough). |
| `EMBED_URL` | no | Your own BGE-M3 endpoint, e.g. the free Space in `space/`: `https://<space>.hf.space/embed`. Leave unset to use the Hugging Face Inference API. |
| `EMBED_TOKEN` | no | Shared secret for your Space (set the same value as a Space secret). |
| `HF_CHAT_MODEL` | no | A chat model on Hugging Face Inference Providers to phrase answers only from the retrieved passages. Unset shows the verified entry as written. |
| `DENSE_THRESHOLD` | no | Minimum similarity to answer (default `0.55`). Raise it if answers feel off-topic, lower it if Dorothy says "I don't know" too often. |

Test locally with `HF_TOKEN=... npm run dev`.

## Configuration

`src/js/config.js`

| Key | Purpose |
|---|---|
| `formEndpoint` | Free form backend (Formspree, Web3Forms). Empty opens the visitor's email app. |
| `contactEmail` | Inbox for form submissions. |
| `askEndpoint` | Dorothy AI retrieval service, `/api/ask` by default. `""` uses only in-browser search. |

## Content rules

Every knowledge base entry and resource cites an official source and the date a person last checked it. Organisations are listed only with consent. `.github/workflows/check-links.yml` checks every source weekly and opens an issue when one breaks.

## Hero maps

```bash
python3 tools/goddess_maps.py path/to/goddess.webp src/assets/goddess
```

## Licences

three.js: MIT. Poppins and Noto Sans Tamil: SIL Open Font License.
