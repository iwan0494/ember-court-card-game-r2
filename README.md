[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/iwan0494/ember-court-card-game-r2/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/iwan0494/ember-court-card-game-r2/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

# Ember Court — a duel of suits and cunning

A turn-based card duel against **Lady Cinder**, Queen of Embers. You and Cinder
start at **30 life** with **3 energy** per turn. Play cards from your hand to
deal damage — play two cards of the same suit in one turn for a **COMBO ×2**,
and **Court cards** (Queen / King) hit twice as hard. Reduce Cinder to 0 life
to claim the court.

Built for the [best-card-game-20261122-1826 bounty on make.fun](https://make.fun/bounty/best-card-game-20261122-1826).

## Suits

| Suit | Glyph | Flavor |
|------|-------|--------|
| Ember | ✦ | Burns bright, hits hard |
| Tide | ≋ | The sea takes back its own |
| Thorn | ✿ | Roots rise where you stand |
| Gale | ❖ | The wind finds every crack |

## How to run

Requires Node 22 (type stripping runs `main.ts` as-is — no build step, no
dependencies).

```bash
node main.ts
```

Then open <http://localhost:8901> in your browser.

## Controls

| Key / Click | Action |
|-------------|--------|
| `1–5` or click | Select a card in hand (click again to play) |
| `Enter` | Play the selected card |
| `Esc` | Cancel selection / back to title |
| `E` | End turn — Cinder answers |
| `R` | Restart the duel |

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
- `main.ts` — zero-dependency static server entrypoint (`node main.ts`)
- `serve.mjs` — zero-dependency static server
- `shots.py` — deterministic screenshot + smoke-test script
- `shots.json` — screenshot report (sizes + smoke-test result)

No build step, no libraries, no network requests, no external images — every
visual (portraits, card art, flames, confetti) is pure CSS.

## Bounty

This entry was built for the make.fun bounty **best-card-game-20261122-1826**:
<https://make.fun/bounty/best-card-game-20261122-1826>

## License

MIT
