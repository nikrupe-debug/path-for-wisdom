# The Path for Wisdom (שביל החוכמה)

2D platformer to teach English to a 2nd-grade absolute beginner (Hebrew-literate,
doesn't know English letters yet). Rescue-the-parents-from-evil-sorcerers story;
defeating enemies requires English drills.

## Status (2026-09-01)

Vertical slice working end-to-end: Boot → Story Intro → Avatar Creation → World 1
placeholder. No real platforming/enemies/drills yet — that's next.

## Stack

- Phaser 3 + TypeScript + Vite, single-file build (`vite-plugin-singlefile`), same
  shipping convention as `rulers-of-wasteland` (`npm run build` → `dist/index.html`).
- **Not** using React/Zustand-for-UI like the turn-based game — this needs real
  arcade physics (gravity, jump arcs, platform collision), which is what Phaser's
  built-in arcade physics engine is for.
- `gameState` (`src/game/gameState.ts`) is a plain persisted singleton (localStorage),
  not a React store — no React in this project at all.

## Design decisions locked in

- **Instructions/story/UI text: Hebrew.** English only appears inside drills —
  the game's own interface must never be an unintended literacy test.
- **Avatar is procedural** (`src/game/avatarRenderer.ts`, drawn with Phaser
  Graphics) — zero external art files needed for the MVP. Swapping in real
  sprite art (Kenney.nl packs recommended) later only means rewriting
  `drawAvatar()`; the `AvatarConfig` data model and every scene consuming it
  stay the same.
- **Curriculum is tiered by literacy level, not just vocabulary difficulty** —
  the *drill mechanic itself* changes across tiers (audio→picture match, at
  the very start, up through spelling and simple phrases much later). See the
  tier table from planning discussion — not yet written to a file, should be
  before World 2 content is built.
- **Content is data, not code.** Every level and every word-bank entry should
  be a JSON file, so vocabulary/level tuning doesn't require touching game logic.
- **Audio is not optional** — a pre-literate learner lives or dies on sound.
  Plan is to pre-generate a fixed set of neural-TTS audio clips (ElevenLabs or
  similar) for the closed Tier 0-2 vocabulary set (~150-250 words/letters) and
  ship them as static files rather than calling TTS live.

## World structure (planned, not yet built beyond World 1 placeholder)

| World | Theme | Tier | Teaches |
|---|---|---|---|
| 1 — Alphabet Valley | Easy, open ground | 0-1 | Letter shapes/sounds, audio→picture, upper/lowercase |
| 2 — Sound Forest | More platforms, first holes | 2 | CVC phonics blending |
| 3 — Word Kingdom | Traps introduced | 3 | Sight words, picture↔word matching |
| 4 — Spelling Castle | Full platforming complexity | 4 | Drag-letter spelling |
| 5 — Sentence Summit | Boss-style multi-enemy levels | 5 | Simple phrases, fill-in-the-blank |

Each level = one screen, 1-3 enemies, each enemy tied to one drill from that
tier's word bank. World-ending boss levels mix review content from the whole
tier as an informal spaced-repetition gate.

## Next steps

1. Build World 1 Level 1 for real: tilemap, gravity/jump platforming, one enemy
   with a Tier-0 audio→picture drill.
2. Pick a real art source (Kenney.nl recommended) and a TTS voice/provider.
3. Write the Tier 0-1 word/letter bank as JSON.
4. Get it in front of the actual kid early — before building all of World 1,
   not after.

## Commands

```
npm install
npm run dev      # local dev server
npm run build    # single-file dist/index.html
```
