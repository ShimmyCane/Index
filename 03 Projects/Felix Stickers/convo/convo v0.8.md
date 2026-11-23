# Felix Stickers — Convo v0.8

**Project:** Felix Stickers
**Round:** 8 (after 0.4.1, 2026-11-23)

## Jimmy's note

> Nope, I want the sticker sheet to look exactly like the reference image, not contact sheet (unless used for peeling stickers).

## What changed (0.4.2)

- The sheet is the reference picture itself, fitted to the play area at its own proportions. Nothing is laid out in a grid.
- Each piece sits on its box in the picture (pixel positions from the reference). The pieces are the same pixels as the picture.
- A peeled piece leaves its spot empty (white), so the sheet looks like the reference with holes.
- The cutouts are used only when a piece is peeled and placed on the body.
- Sheet background and piece layers are cut from the picture in `private/cutouts/` (gitignored). The public build falls back to the lookalike SVGs, placed on the same boxes.

## Claude's reading (to confirm)

- "Exactly like the reference" means the same layout and the same pixels on the sheet, with pieces leaving empty spaces when peeled.

## Question for Jimmy

- The public build still needs the licence answer from convo v0.7 before the reference picture can be published. Until then the public sheet is the lookalike layout.
  - Answer: **Yes.** The public build now shows the reference picture (see convo v0.9).
