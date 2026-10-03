#!/usr/bin/env python3
"""Rakit PHARAOH: YEAR ONE — MP4 dari key-art + narasi + musik sintesis."""
import math, wave, struct, subprocess, os
from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
W, H, FPS = 1280, 720, 25
ND = [7.46, 6.14, 5.18, 8.74, 8.14, 7.70, 7.73]          # durasi narasi terukur
SD = [d + 0.6 for d in ND[:6]] + [ND[6] + 1.8]            # durasi tiap scene
TOTAL = sum(SD)
print("total video s:", round(TOTAL, 2))

os.makedirs("assets/film", exist_ok=True)

# ---------------- musik sintesis (double-harmonic, nuansa Mesir) ----------------
SR = 22050
N = int((TOTAL + 1.0) * SR)
buf = [0.0] * N
SCALE = [0, 1, 4, 5, 7, 8, 11]
def deg(i):
    o, k = i // 7, i % 7
    return 220.0 * (2 ** ((SCALE[k] + 12 * o) / 12.0))     # root ~A3
# drone bass
for n in range(N):
    t = n / SR
    amp = 0.16 * (0.7 + 0.3 * math.sin(2 * math.pi * 0.25 * t))
    buf[n] += amp * (math.sin(2 * math.pi * 55.0 * t) + 0.5 * math.sin(2 * math.pi * 110.0 * t))
# melodi pluck
MEL = [7, None, 6, 5, None, 4, 5, None, 4, None, 2, 1, 0, None, None, None,
       2, None, 4, 5, None, 6, 7, None, 6, 5, 4, None, 2, 1, 0, None]
step = 60 / 96 / 2  # 96 bpm, eighth
i0 = 0
while i0 * step < TOTAL:
    m = MEL[i0 % 32]
    if m is not None:
        f = deg(m)
        s0 = int(i0 * step * SR)
        L = int(0.45 * SR)
        for k in range(min(L, N - s0)):
            tt = k / SR
            env = math.exp(-5.0 * tt)
            buf[s0 + k] += 0.14 * env * (math.sin(2 * math.pi * f * tt) + 0.35 * math.sin(4 * math.pi * f * tt))
    i0 += 1
# perkusi lembut tiap beat
b0 = 0
while b0 * 0.5 < TOTAL:
    s0 = int(b0 * 0.5 * SR)
    L = int(0.09 * SR)
    import random
    random.seed(b0)
    for k in range(min(L, N - s0)):
        tt = k / SR
        buf[s0 + k] += 0.05 * math.exp(-40 * tt) * (random.random() * 2 - 1)
    b0 += 1
# fade in/out musik
for n in range(N):
    t = n / SR
    g = min(1.0, t / 1.5, max(0.0, (TOTAL + 0.5 - t) / 2.0))
    buf[n] *= g
with wave.open("assets/film/music.wav", "w") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(b"".join(struct.pack("<h", max(-32000, min(32000, int(v * 32000)))) for v in buf))
print("music.wav ok")

# ---------------- kartu judul (overlay transparan) ----------------
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
def title_card(path, lines):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for text, size, y, fill, stroke in lines:
        f = ImageFont.truetype(FONT_B, size)
        d.font = f
        d.text((W / 2, y), text, anchor="mm", fill=fill,
               stroke_width=max(2, size // 14), stroke_fill=stroke)
    im.save(path)

title_card("assets/film/t1.png", [
    ("PHARAOH: YEAR ONE", 78, 560, (255, 217, 118, 255), (122, 10, 16, 255)),
    ("PHARAOH EXCHANGE  ·  1st ANNIVERSARY", 30, 622, (232, 65, 66, 255), (246, 231, 200, 255)),
])
t7start = sum(SD[:6])
title_card("assets/film/t7.png", [
    ("HAPPY 1st ANNIVERSARY", 64, 150, (255, 217, 118, 255), (122, 10, 16, 255)),
    ("PHARAOH ON AVAX — THE LIQUIDITY MISSION", 26, 208, (246, 231, 200, 255), (60, 12, 8, 255)),
    ("PHAR.GG   ·   BY : SASAM", 30, 600, (255, 107, 94, 255), (30, 6, 6, 255)),
])
print("cards ok")

# ---------------- ffmpeg ----------------
inp = []
for i in range(7):
    inp += ["-loop", "1", "-t", f"{SD[i]:.3f}", "-i", f"assets/film/scene{i+1}.jpg"]
for i in range(7):
    inp += ["-i", f"assets/film/n{i+1}.mp3"]
inp += ["-i", "assets/film/music.wav", "-i", "assets/film/t1.png", "-i", "assets/film/t7.png"]

fc = []
for i in range(7):
    z = (f"min(1.06+0.0007*on,1.22)" if i % 2 == 0 else f"max(1.22-0.0007*on,1.06)")
    fc.append(f"[{i}:v]scale=1600:900,zoompan=z='{z}':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS},"
              f"fade=t=in:st=0:d=0.35,fade=t=out:st={SD[i]-0.35:.3f}:d=0.35,setsar=1[v{i}]")
fc.append("".join(f"[v{i}]" for i in range(7)) + f"concat=n=7:v=1:a=0[vb]")
fc.append(f"[vb][15:v]overlay=0:0:enable='between(t,0.4,{SD[0]-0.3:.2f})'[vc]")
fc.append(f"[vc][16:v]overlay=0:0:enable='between(t,{t7start+0.3:.2f},{TOTAL:.2f})'[vout]")
off = 0.0
for i in range(7):
    fc.append(f"[{7+i}:a]adelay={int(off*1000)}|{int(off*1000)},apad=whole_dur={TOTAL+1:.2f}[a{i}]")
    off += SD[i]
fc.append("".join(f"[a{i}]" for i in range(7)) + "amix=inputs=7:normalize=0[voice]")
fc.append(f"[14:a]volume=0.9[mus]")
fc.append(f"[voice][mus]amix=inputs=2:normalize=0,afade=t=out:st={TOTAL-1.2:.2f}:d=1.2[aout]")

cmd = [FF, "-y"] + inp + ["-filter_complex", ";".join(fc),
         "-map", "[vout]", "-map", "[aout]",
         "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "medium", "-crf", "21",
         "-c:a", "aac", "-b:a", "160k", "-t", f"{TOTAL:.2f}", "pharaoh-year-one.mp4"]
r = subprocess.run(cmd, capture_output=True, text=True)
print(r.stderr[-1500:] if r.returncode else "FFMPEG OK")
raise SystemExit(r.returncode)
