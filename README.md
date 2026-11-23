# Ember Court — a duel of suits and cunning

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made with HTML5](https://img.shields.io/badge/Made%20with-HTML5%20%2B%20CSS%20%2B%20JS-orange.svg)](https://developer.mozilla.org/en-US/docs/Web)
[![No dependencies](https://img.shields.io/badge/Dependencies-none-brightgreen.svg)](#)

A turn-based card duel against **Lady Cinder**, Queen of Embers. You and Cinder
start at **30 life** with **3 energy** per turn. Play cards from your hand to
deal damage — play two cards of the same suit in one turn for a **COMBO ×2**,
and **Court cards** (Queen / King) hit twice as hard. Reduce Cinder to 0 life
to claim the court.

## Suits

| Suit | Glyph | Flavor |
|------|-------|--------|
| Ember | ✦ | Burns bright, hits hard |
| Tide | ≋ | The sea takes back its own |
| Thorn | ✿ | Roots rise where you stand |
| Gale | ❖ | The wind finds every crack |

## Controls

| Key / Click | Action |
|-------------|--------|
| `1–5` or click | Select a card in hand (click again to play) |
| `Enter` | Play the selected card |
| `Esc` | Cancel selection / back to title |
| `E` | End turn — Cinder answers |
| `R` | Restart the duel |

## Play locally

```bash
node serve.mjs        # serves on http://localhost:8901
```

No build step, no libraries, no network requests, no external images — every
visual (portraits, card art, flames, confetti) is pure CSS.

## Screenshots

Deterministic 1280×800 shots via `?shot=title|table|win|loss`:

```bash
python3 shots.py     # needs Playwright + Chromium; writes shots/*.jpg
```

- `shots/title.jpg` — title screen with a fanned 3-card preview
- `shots/table.jpg` — mid-duel table, combo on the board
- `shots/win.jpg` — victory: Court Champion
- `shots/loss.jpg` — defeat: Fallen Challenger

## Files

- `index.html` — screens: title, table, victory/defeat
- `styles.css` — all visuals: CSS portraits, per-suit card bands, phase accents
- `game.js` — rules: deck, combo, court doubling, Cinder AI
- `render.js` — DOM rendering
- `main.js` — input, keyboard, deterministic `?shot=` presets
- `serve.mjs` — zero-dependency static server
- `shots.py` — deterministic screenshot + smoke-test script
- `shots.json` — screenshot report (sizes + smoke-test result)

## License

MIT
