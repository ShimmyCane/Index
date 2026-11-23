# Felix Stickers — Convo v0.10

**Project:** Felix Stickers
**Round:** 10 (after 0.4.3, 2026-11-23)

## Jimmy's note

> The peeling motion isn't nice. It requires a significant pull back, animate it well (a circle shape should show a semi circle as you pull) and then to stick it down, you drag it back on (as discussed before).

## What changed (0.5.0)

- **Peel animation:** pulling a piece now folds its pulled part back over a fold line, like paper. A round piece shows a semicircle as it turns. The fold turns to the back of the sticker past the midpoint. The pull needed is 56 px, down from 26 px in the first build's interaction.
- **Let go early:** the piece springs back flat.
- **Sticking:** a floating piece sticks when you (a) tap it, as in the original concept, or (b) drag it back onto the empty spot it came from. Releasing it elsewhere on the sheet leaves it floating and movable.
- A stuck piece gives a small press-down bump.

## Claude's reading (to confirm)

- "Drag it back on" means returning the piece to its own spot on the sheet. Dropping it anywhere else on the sheet leaves it floating, so it can still be moved onto the body.
- The tap-to-stick from the original concept is kept.

## Questions

1. Is the 56 px pull about right? Too far, or too short?
   - Answer:
2. Should dropping a floating piece on the body stick it too (not only its own spot)?
   - Answer:
