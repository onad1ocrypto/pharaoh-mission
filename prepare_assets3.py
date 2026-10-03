#!/usr/bin/env python3
"""Proses sprite musuh (chroma green) + banner & logo Pharaoh (hapus latar gelap)."""
import base64, io, json
import numpy as np
from PIL import Image

def chroma_green(path, TH):
    im = Image.open(path).convert("RGB")
    arr = np.asarray(im).astype(np.int16)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    mask = (g > r + 12) & (g > b + 12)
    alpha = np.where(mask, 0, 255).astype(np.uint8)
    g2 = np.where((~mask) & (g > r) & (g > b), np.maximum(r, b), g)
    arr[:, :, 1] = g2.astype(np.uint8)
    im2 = Image.fromarray(np.dstack([arr.astype(np.uint8), alpha]), "RGBA")
    im2 = im2.crop(im2.split()[3].getbbox())
    w, h = im2.size
    nw = max(1, round(w * TH / h))
    return im2.resize((nw, TH), Image.LANCZOS)

def drop_dark(path, thr, TW=None, TH=None):
    im = Image.open(path).convert("RGB")
    arr = np.asarray(im).astype(np.int16)
    lum = arr.sum(axis=2)
    alpha = np.where(lum < thr, 0, 255).astype(np.uint8)
    im2 = Image.fromarray(np.dstack([arr.astype(np.uint8), alpha]), "RGBA")
    im2 = im2.crop(im2.split()[3].getbbox())
    w, h = im2.size
    if TW:
        nh = max(1, round(h * TW / w))
        im2 = im2.resize((TW, nh), Image.LANCZOS)
    elif TH:
        nw = max(1, round(w * TH / h))
        im2 = im2.resize((nw, TH), Image.LANCZOS)
    return im2

def to_uri(im, max_kb=110):
    buf = io.BytesIO()
    im.save(buf, "PNG", optimize=True)
    raw = buf.getvalue()
    if len(raw) > max_kb * 1024:
        q = im.quantize(colors=200, method=Image.FASTOCTREE)
        b2 = io.BytesIO()
        q.save(b2, "PNG", optimize=True)
        if len(b2.getvalue()) < len(raw):
            raw = b2.getvalue()
    return "data:image/png;base64," + base64.b64encode(raw).decode(), len(raw)

en = {}
for key, path, th in [("s", "assets/enemies/scarab.png", 84),
                      ("m", "assets/enemies/mummy.png", 120),
                      ("b", "assets/enemies/bear.png", 112)]:
    im = chroma_green(path, th)
    uri, n = to_uri(im)
    en[key] = {"src": uri, "w": im.size[0], "h": im.size[1]}
    print(key, im.size, f"{n/1024:.0f} KB")
json.dump(en, open("assets/enemies.json", "w"))

banner = drop_dark("uploads/1500x500 (1).jpg", 20, TW=480)
uri, n = to_uri(banner)
logo = drop_dark("uploads/Jxkveq3G_400x400.jpg", 120, TH=140)
uri2, n2 = to_uri(logo)
json.dump({"banner": {"src": uri, "w": banner.size[0], "h": banner.size[1]},
           "logo": {"src": uri2, "w": logo.size[0], "h": logo.size[1]}},
          open("assets/logos.json", "w"))
print("banner", banner.size, f"{n/1024:.0f} KB | logo", logo.size, f"{n2/1024:.0f} KB")
