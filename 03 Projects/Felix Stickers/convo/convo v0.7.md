# Felix Stickers — Convo v0.7

**Project:** Felix Stickers
**Round:** 7 (after 0.4.0, 2026-11-23)

## Jimmy's note

> No!!! I want you to use the jpg or png file, natively, without vectorizing, throughout the sticker process.

## What changed (0.4.1)

- The woods sheet now uses the **native pixels** of the reference PNG. Each element is cut out of the file with a background mask, one PNG per piece, and placed as an image. Nothing is traced or redrawn.
- The nine pieces (plain body and eight features) are in `private/cutouts/` (gitignored). `private/native.js` maps each sticker id to its PNG. The app uses it when present and falls back to the SVG lookalike when not.
- The public build (committed code) still shows the SVG lookalikes, because the reference art is not ours to publish (convo v0.1 Q10: uploaded sheets for testing only).

## Question for Jimmy

- For the public GitHub Pages build, may the native cutouts (from the reference) be published? If yes, confirm the licence or permission and I'll commit them. If no, the public build stays on the lookalikes.
  - Answer: **Yes. The licence is settled: the art is AI-generated and free to use (see convo v0.9).**
