# 🏺 PHARAOH QUEST — Pharaoh on AVAX: The Liquidity Mission

A Mario-style HTML5 platformer made to celebrate the **1-Year Anniversary of Pharaoh on AVAX** —
the native liquidity layer on Avalanche.

**BY : SASAM**

> Fan-made tribute game. Not affiliated with Pharaoh Exchange or Ava Labs.

## 🎮 Play

Open **`pharaoh-quest.html`** in any browser — the whole game (sprites, music, fonts) is
embedded in that single file. No server, no internet, no dependencies.

### Controls

| Key | Action |
|---|---|
| ← → / A D | move |
| SPACE | jump (tap again mid-air = double jump) |
| J / X | energy blast |
| K / C (hold) | Avalanche-triangle shield (blocks enemies) |
| P / M / R | pause / music / retry level |

On mobile, on-screen buttons appear automatically.

## 🐫 Story

The **Bear Market** stole the kingdom's liquidity! Run through the *Liquidity Dunes*,
the *Temple of x(3,3)* and the *Pyramid Vault*; collect **PHAR tokens** and **AVAX crystals**,
grab the **Stake Ankh** to enter **xPHAR MODE**, stomp scarabs & mummies, and remember:
the **BEAR MARKET cannot be stomped** — shoot it or block it.

## ✨ Features

- 3 themed levels (desert / sunset ruins / torch-lit tomb) with moving platforms, spikes, pits
- AI-generated 3D-cartoon hero with 6 scene poses (idle, run, attack, defend, super, hurt)
- AI-generated enemies: scarab, mummy and the Bear Market
- Brand murals on the road walls: PHARAOH EXCHANGE billboards, pharaoh.gg signs, AVAX icons
- A bird occasionally flies by carrying a **PHARAOH.GG** banner
- Synthesized Middle-Eastern-flavored chiptune soundtrack + SFX (WebAudio, no audio files)
- Embedded *Cinzel Decorative* title font; score / best-score persistence
- Fully English UI

## 🛠 Build from source

```bash
pip install pillow numpy
python3 prepare_assets2.py   # process hero sprites + title art
python3 prepare_assets3.py   # process enemy sprites
python3 build.py             # assemble single-file pharaoh-quest.html
node harness.js              # run the 37 gameplay/render logic tests
```

Source modules live in `src/` (core, levels, sprites, game, screens, main).

## License / Credit

© 2026 **SASAM** — *BY : SASAM*.
Made to celebrate the 1-Year Anniversary of Pharaoh on AVAX.
Character & enemy art generated with AI; game code by SASAM.

**PHAR.GG** · The native liquidity layer on AVAX
