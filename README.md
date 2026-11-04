# Dorothy · டோரதி

**Your life is more than what the world sees.**

A free, community-led support ecosystem for transgender people in India, starting in Tamil Nadu.

> பிறப்பொக்கும் எல்லா உயிர்க்கும் சிறப்பொவ்வா செய்தொழில் வேற்றுமை யான். (Thirukkural 972)

Built with Next.js (App Router), React and TypeScript. The hero and kolam are WebGL scenes built with three.js.

## Develop

```bash
npm install
```

```bash
npm run dev
```

Opens http://localhost:3000.

```bash
npm test
```

```bash
npm run typecheck
```

## Build

```bash
npm run build
```

```bash
npm start
```

Pages are pre-rendered as static HTML; `/api/ask` runs on demand. Security headers (CSP, HSTS, frame and referrer policy) are set in `next.config.ts`.

## Deploy

Vercel detects Next.js automatically (`vercel.json` pins the framework). Push to `main` to deploy. `.github/workflows/ci.yml` type-checks, tests and builds every push.

Set `NEXT_PUBLIC_SITE_URL` to your domain for canonical links, the sitemap and robots.txt.

## Structure

```
app/               routes: home, find-help, ask, stories, get-involved, privacy, not-found
app/api/ask        Dorothy AI retrieval (BGE-M3 RAG)
app/fonts          self-hosted Poppins and Noto Sans Tamil (next/font/local)
components/        header, footer, goddess hero, kolam, support cycle, Ask Dorothy, directory, forms
lib/engine.ts      BM25 keyword search with Tamil-aware matching, crisis detection
lib/rag.ts         BGE-M3 embeddings, hybrid ranking, optional grounded generation
lib/three/         WebGL scenes: the goddess relief and sand, the kolam
data/              verified knowledge base and resource directory
public/assets      goddess colour, normal and depth maps
space/             free Hugging Face Space that serves BGE-M3 embeddings
tools/             goddess map generator
```

## Dorothy AI (BGE-M3 RAG)

`/api/ask` embeds each question with [BAAI/bge-m3](https://huggingface.co/BAAI/bge-m3), a multilingual model that understands Tamil and English, and ranks the verified knowledge base by meaning, blended with keyword search. Crisis messages are handled on the device before any network call. If the service is unreachable, the chat answers from the same knowledge base with in-browser keyword search.

Set these in Vercel → Settings → Environment Variables:

| Variable | Required | Purpose |
|---|---|---|
| `HF_TOKEN` | yes | Hugging Face access token (free account, "Read" scope is enough). |
| `EMBED_URL` | no | Your own BGE-M3 endpoint, e.g. the free Space in `space/`: `https://<space>.hf.space/embed`. Leave unset to use the Hugging Face Inference API. |
| `EMBED_TOKEN` | no | Shared secret for your Space (set the same value as a Space secret). |
| `HF_CHAT_MODEL` | no | A chat model on Hugging Face Inference Providers to phrase answers only from the retrieved passages. Unset shows the verified entry as written. |
| `DENSE_THRESHOLD` | no | Minimum similarity to answer (default `0.55`). Raise it if answers feel off-topic, lower it if Dorothy says "I don't know" too often. |
| `NEXT_PUBLIC_FORM_ENDPOINT` | no | Free form backend (Formspree, Web3Forms). Unset opens the visitor's email app. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | no | Inbox for form submissions (default `hello@dorothy.in`). |

## Content rules

Every knowledge base entry and resource cites an official source and the date a person last checked it. Organisations are listed only with consent. `.github/workflows/check-links.yml` checks every source weekly and opens an issue when one breaks.

## Hero maps

```bash
python3 tools/goddess_maps.py path/to/goddess.webp public/assets/goddess
```

## Licences

three.js: MIT. Poppins and Noto Sans Tamil: SIL Open Font License.
