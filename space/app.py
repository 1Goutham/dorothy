"""Dorothy embeddings: BAAI/bge-m3 dense vectors over HTTP.

POST /embed  {"inputs": ["text", ...]}  ->  [[float x 1024], ...]   (L2-normalised)
"""
import os
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

MODEL = os.environ.get("MODEL", "BAAI/bge-m3")
TOKEN = os.environ.get("EMBED_TOKEN", "")

model = SentenceTransformer(MODEL, device="cpu")
model.max_seq_length = 512
app = FastAPI(title="Dorothy embeddings")


class Body(BaseModel):
    inputs: list[str] | str


@app.get("/")
def health():
    return {"ok": True, "model": MODEL}


@app.post("/embed")
def embed(body: Body, authorization: str = Header(default="")):
    if TOKEN and authorization != f"Bearer {TOKEN}":
        raise HTTPException(status_code=401, detail="unauthorised")
    texts = [body.inputs] if isinstance(body.inputs, str) else body.inputs
    if not texts or len(texts) > 64:
        raise HTTPException(status_code=400, detail="send 1 to 64 texts")
    texts = [t[:2000] for t in texts]
    vecs = model.encode(texts, batch_size=16, normalize_embeddings=True)
    return vecs.tolist()
