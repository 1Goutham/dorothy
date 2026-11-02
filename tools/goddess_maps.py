"""Builds the goddess colour + depth maps used by the 3D relief hero.

python3 tools/goddess_maps.py <source-image> assets/goddess
The source is a grey sculpture on a transparent background. Depth is reconstructed
from the silhouette (body volume) and the baked shading (surface relief).
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

src, out = Path(sys.argv[1]), Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)
im = Image.open(src).convert("RGBA")
W = 1024
H = round(im.height * W / im.width)
im = im.resize((W, H), Image.LANCZOS)
a = np.asarray(im)[..., 3].astype(np.float32)
lum = np.asarray(im.convert("L")).astype(np.float32) / 255.0

mask = np.clip((a - 20) / 60, 0, 1)                       # figure coverage 0..1
mimg = Image.fromarray((mask * 255).astype(np.uint8))

def blur(img, r):
    return np.asarray(img.filter(ImageFilter.GaussianBlur(r))).astype(np.float32) / 255.0

# Volume: nested blurs of the silhouette approximate a distance field (thick torso, thin arms)
vol = 0.45 * blur(mimg, 46) + 0.35 * blur(mimg, 18) + 0.20 * blur(mimg, 6)
vol = vol / max(vol.max(), 1e-6)
# Relief: lit areas of a front-lit sculpture face the viewer -> slightly raised
limg = Image.fromarray((lum * mask * 255).astype(np.uint8))
relief = 0.6 * blur(limg, 2.5) + 0.4 * blur(limg, 7)
xs = np.linspace(0, 1, W)[None, :]
center = np.exp(-((xs - 0.5) / 0.2) ** 2) * blur(mimg, 10)   # torso and head stand in front of the arms
depth = (0.42 * vol + 0.30 * center + 0.28 * relief) * blur(mimg, 7) ** 1.5   # soft falloff at the silhouette so edges slope instead of forming walls
depth = np.clip(depth / max(depth.max(), 1e-6), 0, 1)

rgba = np.dstack([lum * 255, lum * 255, lum * 255, mask * 255]).astype(np.uint8)
Image.fromarray(rgba, "RGBA").save(out / "color.webp", quality=90, method=6)
# G channel: a soft band just inside the silhouette, where light from behind wraps the outline
rim = np.clip(mask - blur(mimg, 3), 0, 1)
rim = np.clip(rim / max(rim.max(), 1e-6), 0, 1) ** 1.4
dm = np.dstack([depth, rim, np.zeros_like(depth)])
Image.fromarray((dm * 255).astype(np.uint8), "RGB").save(out / "depth.webp", quality=92, method=6)

# Static fallback / poster: statue composited on black, as it appears on the site
poster = np.dstack([lum * mask * 0.82 * 255] * 3).astype(np.uint8)
Image.fromarray(poster, "RGB").save(out / "poster.webp", quality=84, method=6)
print("maps", W, H)

# Normal map: only the large, soft forms (body, limbs, drapery folds), so a moving light
# glides over her like studio light instead of picking out every carved line.
L = Image.fromarray((lum * 255).astype(np.uint8))
soft = blur(mimg, 30) + (blur(L, 8) - blur(L, 30)) * mask * 0.9
soft = blur(Image.fromarray((np.clip(soft, 0, 1) * 255).astype(np.uint8)), 3)
gy, gx = np.gradient(soft)
strength = 14.0
nx, ny, nz = -gx * strength, gy * strength, np.ones_like(soft)
ln = np.sqrt(nx ** 2 + ny ** 2 + nz ** 2)
normal = np.dstack([nx / ln, ny / ln, nz / ln])
Image.fromarray(((normal * 0.5 + 0.5) * 255).astype(np.uint8), "RGB").save(out / "normal.webp", quality=82, method=6)
print("normal map written")
