#!/usr/bin/env python3
"""Poster presentasi PHARAOH QUEST — komposit aset asli game."""
import base64, io, json
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1600, 2000
SERIF = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

def F(p, s): return ImageFont.truetype(p, s)
def uri_img(src):
    head, b64 = src.split(",", 1)
    return Image.open(io.BytesIO(base64.b64decode(b64))).convert("RGBA")

chars = json.load(open("assets/chars.json"))
enem = json.load(open("assets/enemies.json"))
pyr = Image.open("assets/pyramid_crop.png").convert("RGBA")
hero = uri_img(open("assets/title_art.txt").read().strip())

# ---------- latar: gradasi gelap opak + sinar merah via layer alpha ----------
base = Image.new("RGB", (W, H), (26, 5, 10))
db = ImageDraw.Draw(base)
for y in range(H):
    t = y / H
    db.line([(0, y), (W, y)], fill=(int(26 + 20 * t), int(5 + 6 * t), int(10 + 8 * t)))
poster = base.convert("RGBA")

rays = Image.new("RGBA", (W, H), (0, 0, 0, 0))
dr = ImageDraw.Draw(rays)
for i in range(14):
    x0 = -200 + i * 160
    dr.polygon([(x0, 0), (x0 + 90, 0), (x0 + 500, H), (x0 + 330, H)], fill=(232, 65, 66, 26))
poster = Image.alpha_composite(poster, rays)

d = ImageDraw.Draw(poster)  # gambar opak (frame, garis, teks)

# bingkai emas ganda
d.rectangle([18, 18, W - 19, H - 19], outline=(245, 197, 66, 255), width=6)
d.rectangle([34, 34, W - 35, H - 35], outline=(232, 65, 66, 200), width=3)

def ctext(s, y, size, fill, stroke, fontp=SERIF, sw=None):
    f = F(fontp, size)
    d.text((W / 2, y), s, anchor="mm", font=f, fill=fill,
           stroke_width=sw or max(2, size // 16), stroke_fill=stroke)

# ---------- header ----------
ctext("PHARAOH QUEST", 130, 128, (255, 217, 118), (122, 10, 16))
ctext("PHARAOH ON AVAX  ·  THE LIQUIDITY MISSION", 225, 40, (232, 65, 66), (246, 231, 200), sw=2)
ctext("—  1st ANNIVERSARY EDITION  —", 285, 30, (255, 217, 118), (40, 8, 8), sw=2)

def paste_centered(img, cx, cy, hgt):
    w = int(hgt * img.width / img.height)
    im = img.resize((w, hgt), Image.LANCZOS)
    poster.alpha_composite(im, (cx - w // 2, cy - hgt // 2))
    return w

# ---------- kartu semi-transparan via layer ----------
cards = Image.new("RGBA", (W, H), (0, 0, 0, 0))
dc = ImageDraw.Draw(cards)
SCENES = ["IDLE", "RUN", "ATTACK", "DEFEND", "SUPER MODE", "HURT"]
gx0, gy0, cw, ch = 640, 400, 450, 210
cells = []
for i in range(6):
    cx = gx0 + (i % 2) * cw + cw // 2
    cy = gy0 + (i // 2) * ch + ch // 2
    cells.append((cx, cy))
    dc.rounded_rectangle([cx - cw // 2 + 12, cy - ch // 2 + 8, cx + cw // 2 - 12, cy + ch // 2 - 8],
                         18, fill=(20, 10, 32, 190), outline=(245, 197, 66, 200), width=3)
dc.rounded_rectangle([1050, 1200, 1490, 1560], 22, fill=(60, 8, 12, 210), outline=(232, 65, 66, 255), width=5)
poster = Image.alpha_composite(poster, cards)
d = ImageDraw.Draw(poster)

# ---------- hero besar kiri ----------
paste_centered(hero, 330, 700, 560)
d.text((330, 1010), "THE PHARAOH", anchor="mm", font=F(SANS, 30), fill=(255, 217, 118), stroke_width=2, stroke_fill=(40, 8, 8))
d.text((330, 1050), "Hero of the Royal Vault", anchor="mm", font=F(SANS, 24), fill=(246, 231, 200), stroke_width=2, stroke_fill=(40, 8, 8))

# ---------- grid 6 pose ----------
for i, (cx, cy) in enumerate(cells):
    im = uri_img(chars[i]["src"])
    paste_centered(im, cx, cy - 26, 130)
    d.text((cx, cy + 78), SCENES[i], anchor="mm", font=F(SANS, 26), fill=(255, 217, 118), stroke_width=2, stroke_fill=(40, 8, 8))
d.text((gx0 + cw, 372), "ONE HERO · SIX SCENES", anchor="mm", font=F(SANS, 34), fill=(246, 231, 200), stroke_width=2, stroke_fill=(40, 8, 8))

# ---------- baris musuh ----------
d.line([(70, 1105), (W - 70, 1105)], fill=(245, 197, 66, 200), width=3)
d.text((W / 2, 1150), "ENEMIES OF THE DUNES", anchor="mm", font=F(SERIF, 44), fill=(255, 107, 94), stroke_width=3, stroke_fill=(40, 8, 8))
enames = {"s": ("SCARAB", 200), "m": ("MUMMY GUARD", 220), "b": ("BEAR PHARAOH — BOSS", 290)}
exs = [330, 790, 1270]
for k, ex in zip(["s", "m", "b"], exs):
    im = uri_img(enem[k]["src"])
    paste_centered(im, ex, 1350, enames[k][1])
    d.text((ex, 1510), enames[k][0], anchor="mm", font=F(SANS, 28),
           fill=(255, 107, 94) if k == "b" else (255, 217, 118), stroke_width=2, stroke_fill=(40, 8, 8))

# ---------- piramida finish ----------
d.line([(70, 1580), (W - 70, 1580)], fill=(245, 197, 66, 200), width=3)
pw = 620
ph = int(pw * pyr.height / pyr.width)
poster.alpha_composite(pyr.resize((pw, ph), Image.LANCZOS), (80, 1862 - ph))
d.text((1150, 1625), "THE RED GATE", anchor="mm", font=F(SERIF, 48), fill=(255, 217, 118), stroke_width=3, stroke_fill=(122, 10, 16))
lines = ["Finish every level by entering",
         "the crimson pyramid.",
         "",
         "Double jump · Energy shots",
         "Shield block · xPHAR super mode",
         "",
         "Global leaderboard —",
         "claim your rank at PHAR.GG"]
yy = 1672
for ln in lines:
    if ln:
        d.text((880, yy), ln, anchor="lm", font=F(SANS, 25), fill=(246, 231, 200), stroke_width=2, stroke_fill=(30, 6, 6))
    yy += 29 if ln else 12

# ---------- footer ----------
d.rectangle([0, H - 128, W, H], fill=(16, 4, 6, 255))
d.line([(0, H - 128), (W, H - 128)], fill=(245, 197, 66, 255), width=4)
d.text((W / 2, H - 86), "PHAR.GG  —  PHARAOH EXCHANGE · THE NATIVE LIQUIDITY LAYER ON AVALANCHE",
       anchor="mm", font=F(SANS, 30), fill=(255, 217, 118), stroke_width=2, stroke_fill=(60, 10, 10))
d.text((W / 2, H - 42), "x.com/onadeonft   ·   BY : SASAM", anchor="mm", font=F(SANS, 26), fill=(255, 107, 94), stroke_width=2, stroke_fill=(20, 4, 4))

poster.convert("RGB").save("pharaoh-quest-poster.jpg", quality=92)
print("poster ok", poster.size)
