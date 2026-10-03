#!/usr/bin/env python3
"""Rakit PHARAOH QUEST -> satu file HTML mandiri (semua aset base64)."""
import base64, io, json
from PIL import Image

SRC = "/home/user/src"
OUT_HTML = "/home/user/pharaoh-quest.html"
OUT_JS = "/home/user/build/combined.js"

chars = json.load(open("/home/user/assets/chars.json"))

# judul art: sprite super ber-aura api (latar hijau sudah dihapus di prepare_assets)
title_art = open("/home/user/assets/title_art.txt").read().strip()
print("title art KB:", len(title_art) / 1024)

js_parts = ["10_core.js", "20_levels.js", "30_sprites.js", "40_game.js", "50_screens.js", "60_main.js"]
js = "\n".join(open(f"{SRC}/{p}").read() for p in js_parts)

assert "__CHARACTERS__" in js and "__TITLE_ART__" in js
js = js.replace("__CHARACTERS__", json.dumps(chars))
js = js.replace("__TITLE_ART__", json.dumps(title_art))
js = js.replace("__ENEMY_ART__", open("/home/user/assets/enemies.json").read())

head = open(f"{SRC}/head.html").read()
head = head.replace("__FONT_B64__", open("/home/user/assets/font_b64.txt").read().strip())
html = head + js + "\n</script>\n</body>\n</html>\n"

import os
os.makedirs("/home/user/build", exist_ok=True)
open(OUT_HTML, "w").write(html)
open(OUT_JS, "w").write(js)
print("html KB:", len(html) / 1024)
print("saved", OUT_HTML)
