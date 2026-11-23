# Felix Stickers — Convo v0.2

**Project:** Felix Stickers
**Round:** 2 (after the 0.1.0 first build, 2026-11-23)

## Jimmy's note

> I like everything to be a single sticker, placed playfully. I don't want a "row" type approach where there's a bank of the small stickers below.

## What changed (0.2.0)

- The row of stickers at the bottom is gone.
- One sticker at a time sits on a card in the lower left of the play area, with a faint stack of sheets behind it. Pull a corner to peel it; the next sticker pops up on the card.
- A peeled sticker lands with a small random tilt (up to 12°), so each one looks hand-stuck.
- When the sheet is empty, the card is an empty dashed outline. Reset brings the stickers back.

## Jimmy's answer (correction)

> Nope, one single sticker sheet will have a main sticker and 5-10 smaller ones.

So one sheet = one main sticker + 5–10 smaller ones, all on the same sheet. The one-at-a-time card was wrong and is replaced.

## What changed (0.2.1)

- The sheet is one card in the play area (lower left) with the main sticker large in the middle and eight smaller ones around it (within the 5–10 range).
- Peel any sticker from the sheet. Where it was, an empty dashed space stays, as on a real sheet.
- Peeled stickers land with a playful random tilt, as before. Reset puts them back.
- Sheet data: `js/sheet.js` (main sticker = a teapot; the eight small ones are cupcake, flower, heart, star, cloud, bow tie, balloon, shades). Slots are set as percentages of the card.
