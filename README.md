# Dorothy · டோரதி

**Your life is more than what the world sees.**

Dorothy is a free, community-led support ecosystem for transgender people in India, starting in Tamil Nadu. It puts verified resources, a bilingual AI assistant, opportunities, stories and people who want to help in one calm, private place.

> பிறப்பொக்கும் எல்லா உயிர்க்கும் சிறப்பொவ்வா செய்தொழில் வேற்றுமை யான். — Thirukkural 972
> *All lives are equal by birth. What distinguishes us is only the worth of what we do.*

---

## What's built (Phase 1: Foundation)

| Page | What it does |
|---|---|
| `index.html` | Home page with a WebGL 3D kolam hero, Thirukkural 972, the "whatever you need" cards, the six pillars, an interactive 3D support-cycle ring, volunteering, Ask Dorothy, trust principles and the roadmap |
| `find-help.html` | Verified directory with filters and search, deep-linkable (`#shelter`, `#wellbeing`, `#education`, `#work`…) |
| `ask.html` | Dorothy AI, full page (supports `ask.html?q=…` links) |
| `stories.html` | Stories of Strength, starting with sourced public milestones and a consent-first way to submit a story |
| `get-involved.html` | Volunteer, list an organisation, Community Connect early list, contact |
| `privacy.html` | The privacy, consent and verification promise |

### Dorothy AI: how it works
- **Retrieval first (RAG).** Questions are matched with BM25 against `data/knowledge.js`, a knowledge base written from official sources in **Tamil and English**. Matching is Tamil-aware: Tamil words are agglutinative, so short word prefixes are indexed too.
- **Every answer shows its sources** and the date a person last reviewed it.
- **Safety first.** Messages that suggest someone may be at risk get crisis support (112, Tele-MANAS 14416) before anything else.
- **Honest.** If nothing matches well, it says so and points to a human. It doesn't guess.
- **Private.** It runs in the browser: no server, no storage, no tracking.
- **Optional LLM phrasing.** `worker/` holds a free Cloudflare Workers AI service that can only rephrase the retrieved passages. See `worker/README.md`.

Test it with:
```bash
node tests/ai.test.mjs
```
The test runs 30 real questions in English and Tamil, including crisis and off-topic cases.

### Design
Dark and minimal, with Tamil cultural roots: the 3D hero is a **sikku kolam**, a single unbroken line woven around pulli dots. It draws itself once, then rests and follows the pointer. The cards use subtle 3D tilt. There are no bouncy or cheap animations, and everything respects `prefers-reduced-motion`.

### Safety and privacy built in
- **Quick exit** button, and pressing **Esc twice** leaves the site instantly by replacing the history entry.
- **No third parties.** Fonts (Poppins, Noto Sans Tamil) and three.js are self-hosted, so no Google or CDN requests are made, and `no-referrer` is set.
- No accounts, analytics, cookies or ads. Forms have a honeypot and need no backend.

---

## Run locally
```bash
python3 -m http.server 8000
```
Then open http://localhost:8000.

## Edit pages
Edit pages in `src/pages/` and shared parts in `src/partials/`, then run:
```bash
node tools/build.mjs
```
The built `*.html` files in the root are what gets deployed. There are no dependencies and no `npm install`.

## Deploy for free
- **GitHub Pages:** Settings → Pages → Source: *GitHub Actions*. `.github/workflows/deploy.yml` builds, tests and deploys on every push to `main`.
- **Cloudflare Pages / Netlify:** point them at the repo root. No build command is needed because the built HTML is committed.
- **Custom domain** (e.g. `dorothy.in`): add it in Pages settings, plus a `CNAME` file containing the domain.

### Free services you can switch on in `js/config.js`
| Setting | Free option | Without it |
|---|---|---|
| `formEndpoint` | Formspree / Web3Forms / Getform free tier | Forms open the visitor's email app with the message pre-filled |
| `contactEmail` | Any inbox (e.g. a free Zoho Mail on your domain) | `hello@dorothy.in` |
| `aiEndpoint` | Cloudflare Workers AI free allowance | Answers come straight from the verified knowledge base |

---

## Keeping it trustworthy
1. **Every entry cites a source** someone can open. Government sources come first.
2. **`reviewed` / `checked` dates** are updated only when a person has re-checked the entry against its source.
3. **`.github/workflows/check-links.yml`** checks every source link weekly and opens an issue if one breaks.
4. **Community organisations** are listed only after a volunteer confirms them and they agree to be listed. Shelter addresses and private individuals' numbers are never published.
5. **Tamil text** should be reviewed by native speakers from the community before launch.

### Sources currently used
National Portal for Transgender Persons (MoSJE) · Transgender Persons (Protection of Rights) Act, 2019 · NALSA v. Union of India (2014) · Tamil Nadu Transgender Welfare Board (Dept. of Social Welfare) · SMILE scheme (myScheme) · Garima Greh (PIB) · Tele-MANAS (MoHFW) · 112 ERSS · NALSA legal aid 15100 · Naan Mudhalvan.

---

## Roadmap
| Phase | Focus | Status |
|---|---|---|
| 1 | Website, verified resources, Dorothy AI | **Built** |
| 2 | Shelters, scholarships and volunteer professionals, verified one by one | Next |
| 3 | Community Connect and Stories of Strength | Early list open |
| 4 | Sponsors, transparent donations, partnerships | Planned |
| 5 | Beyond Tamil Nadu, across India | Planned |

## Before public launch: checklist
- [ ] Native Tamil review of all Tamil text (`data/knowledge.js`, pages)
- [ ] A person clicks every source link and confirms its content, then updates the `reviewed` dates
- [ ] Set up a real inbox for `contactEmail` and, optionally, a `formEndpoint`
- [ ] Ask the people featured on `stories.html` whether they are happy to be featured
- [ ] Recruit the first verifiers and translators, and write a volunteer code of conduct
- [ ] Optional: add your hero illustration and the red community artwork from your design to `assets/`

## Licences
three.js: MIT (`vendor/three.LICENSE`). Poppins and Noto Sans Tamil: SIL Open Font License, via Fontsource.
