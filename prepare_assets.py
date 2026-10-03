#!/usr/bin/env python3
"""Siapkan aset: 6 sprite adegan karakter + art judul (hapus latar hijau)."""
import base64, glob, io, json, os
import numpy as np
from PIL import Image

SRC = "/home/user/uploads"
OUT = "/home/user/assets/chars.json"
OUT_TITLE = "/home/user/assets/title_art.txt"

# urutan file (sorted) -> adegan
scenes = ["diam", "lari", "serang", "bertahan", "super", "terkena"]
files = sorted(glob.glob(os.path.join(SRC, "*.png")))
assert len(files) == 6, files

items = []
for i, f in enumerate(files):
    im = Image.open(f).convert("RGBA")
    a = im.split()[3]
    im = im.crop(a.getbbox())
    w, h = im.size
    TH = 190
    nw = max(1, round(w * TH / h))
    im = im.resize((nw, TH), Image.LANCZOS)
    arr = np.asarray(im).astype(np.int16)
    al = arr[:, :, 3]
    al = np.where(al < 40, 0, np.where(al > 215, 255, al)).astype(np.uint8)
    arr[:, :, 3] = al
    im = Image.fromarray(arr.astype(np.uint8), "RGBA")
    buf = io.BytesIO()
    im.save(buf, "PNG", optimize=True)
    raw = buf.getvalue()
    if len(raw) > 90000:
        q = im.quantize(colors=200, method=Image.FASTOCTREE)
        b2 = io.BytesIO()
        q.save(b2, "PNG", optimize=True)
        if len(b2.getvalue()) < len(raw):
            raw = b2.getvalue()
    items.append({
        "name": scenes[i],
        "src": "data:image/png;base64," + base64.b64encode(raw).decode(),
        "w": im.size[0], "h": im.size[1],
    })
    print(f"{scenes[i]:10s} {os.path.basename(f)[:48]:50s} {w}x{h} -> {nw}x{TH}  {len(raw)/1024:.0f} KB")

json.dump(items, open(OUT, "w"))

# ---------- art judul: jpg super ber-aura api, hapus latar hijau ----------
jpg = os.path.join(SRC, "Create_3D_cartoon_character_2K_20261003051148.jpg")
im = Image.open(jpg).convert("RGB")
arr = np.asarray(im).astype(np.int16)
r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
mask = (g > r + 12) & (g > b + 12)          # latar hijau
alpha = np.where(mask, 0, 255).astype(np.uint8)
# despill: netralkan sisa hijau di tepi
g2 = np.where((~mask) & (g > r) & (g > b), np.maximum(r, b), g)
arr[:, :, 1] = g2.astype(np.uint8)
rgba = np.dstack([arr.astype(np.uint8), alpha])
im2 = Image.fromarray(rgba, "RGBA")
a2 = im2.split()[3]
im2 = im2.crop(a2.getbbox())
w, h = im2.size
NH = 470
nw = round(w * NH / h)
im2 = im2.resize((nw, NH), Image.LANCZOS)
q = im2.quantize(colors=200, method=Image.FASTOCTREE)
buf = io.BytesIO()
q.save(buf, "PNG", optimize=True)
raw = buf.getvalue()
open(OUT_TITLE, "w").write("data:image/png;base64," + base64.b64encode(raw).decode())
print("title art", w, h, "->", nw, NH, f"{len(raw)/1024:.0f} KB")
