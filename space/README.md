---
title: Dorothy Embeddings
emoji: 🌺
colorFrom: red
colorTo: gray
sdk: docker
app_port: 7860
pinned: false
---

BAAI/bge-m3 embeddings for Dorothy AI.

1. Create a new Space on huggingface.co with SDK **Docker** (free CPU basic hardware).
2. Upload these four files (`README.md`, `Dockerfile`, `requirements.txt`, `app.py`).
3. In the Space settings, add a secret `EMBED_TOKEN` with any long random string.
4. In Vercel, set `EMBED_URL` to `https://<your-space>.hf.space/embed` and `EMBED_TOKEN` to the same string.

A free Space sleeps after a period without visitors and takes a minute to wake. While it wakes, Dorothy AI answers from its in-browser search.
