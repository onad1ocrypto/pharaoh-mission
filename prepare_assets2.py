#!/usr/bin/env python3
"""Proses sprite firaun baru: hapus chroma green, rapikan alpha, emit chars.json + title art."""
import base64, io, json
import numpy as np
from PIL import Image

BASE = "/home/user/assets/pharaoh/"
order = ["idle.png", "run.png", "attack.png", "defend.png", "super.png", "hurt.png"]
scenes = ["diam", "lari", "serang", "bertahan", "super", "terkena"]

items = []
for name, sc in zip(order, scenes):
    im = Image.open(BASE + name).convert("RGB")
    arr = np.asarray(im).astype(np.int16)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    mask = (g > r + 12) & (g > b + 12)
    alpha = np.where(mask, 0, 255).astype(np.uint8)
    g2 = np.where((~mask) & (g > r) & (g > b), np.maximum(r, b), g)
    arr[:, :, 1] = g2.astype(np.uint8)
    im2 = Image.fromarray(np.dstack([arr.astype(np.uint8), alpha]), "RGBA")
    bb = im2.split()[3].getbbox()
    im2 = im2.crop(bb)
    w, h = im2.size
    TH = 190
    nw = max(1, round(w * TH / h))
    im2 = im2.resize((nw, TH), Image.LANCZOS)
    buf = io.BytesIO()
    im2.save(buf, "PNG", optimize=True)
    raw = buf.getvalue()
    if len(raw) > 95000:
        q = im2.quantize(colors=200, method=Image.FASTOCTREE)
        b2 = io.BytesIO()
        q.save(b2, "PNG", optimize=True)
        if len(b2.getvalue()) < len(raw):
            raw = b2.getvalue()
    items.append({"name": sc, "src": "data:image/png;base64," + base64.b64encode(raw).decode(),
                  "w": im2.size[0], "h": im2.size[1]})
    print(f"{sc:10s} {w}x{h} -> {nw}x{TH}  {len(raw)/1024:.0f} KB")

json.dump(items, open("/home/user/assets/chars.json", "w"))

# title art dari super.png (resolusi lebih besar)
im = Image.open(BASE + "super.png").convert("RGB")
arr = np.asarray(im).astype(np.int16)
r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
mask = (g > r + 12) & (g > b + 12)
alpha = np.where(mask, 0, 255).astype(np.uint8)
g2 = np.where((~mask) & (g > r) & (g > b), np.maximum(r, b), g)
arr[:, :, 1] = g2.astype(np.uint8)
im2 = Image.fromarray(np.dstack([arr.astype(np.uint8), alpha]), "RGBA")
im2 = im2.crop(im2.split()[3].getbbox())
w, h = im2.size
NH = 470
nw = round(w * NH / h)
im2 = im2.resize((nw, NH), Image.LANCZOS)
q = im2.quantize(colors=200, method=Image.FASTOCTREE)
buf = io.BytesIO()
q.save(buf, "PNG", optimize=True)
open("/home/user/assets/title_art.txt", "w").write("data:image/png;base64," + base64.b64encode(buf.getvalue()).decode())
print("title art KB:", len(buf.getvalue()) // 1024)
print("total KB:", sum(len(i["src"]) for i in items) // 1024)
