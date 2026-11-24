# Felix Stickers — Convo v0.14

**Project:** Felix Stickers
**Round:** 14 (after 0.6.0 and lessons, 2026-11-24)

## Jimmy's answers (to v0.13)

1. Pick-up: **the roll edges**, and **diagonal rolls don't work**.
2. Drop-down: **it should roll back from the last point we had when picking it up**, like sticking it back.

## What changed (0.6.1)

- **Diagonal drags:** the peel runs along the drag in any direction. The piece is drawn in the drag's own frame, so the roll follows the finger on diagonals too.
- **Roll edges:** the edges between hole, roll and back are faded, not hard. Still a first pass: the boundaries are softer but not yet a smooth gradient.
- **Drop-down:** plays the pick-up in reverse with a turn into place (rotation). Rolls along the pick-up direction (stored at pick-up).

## Round 14 follow-up

- Jimmy: the roll showed artifacts (seams between strips). Fixed by rendering the peel per pixel, so nothing is drawn in strips. Peel canvas capped at 1.5x for speed.

## Limits (honest)

- The drop animation scales about the piece's centre. It does not yet start from the exact last pick-up point; that needs the roll drawn on the placed piece.
- Edges still show some banding on a real iPad; not device-tested.

## Questions

1. Is the roll edge soft enough now, or should the boundary blend further?
   - Answer:
2. On the drop, should the roll start from the exact last point and travel back to the spot, or is the turn-into-place enough?
   - Answer:
