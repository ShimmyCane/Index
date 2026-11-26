# Colores Azules: convo v0.1

Round 1: clarifying questions. Jimmy answers inline under each question (write after the arrow).

## Idea

A Tinder-style swipe through shades of blue. Each blue shows its official name, a corner photo of a real object in that blue (zoomed in), and you swipe right to keep it. Kept blues form a palette you like.

## Questions

1. **Who will use this?** Only you, or family too (for example a child trying it on iPad)?
   → For myself, but the architecture database is the place to store things.

2. **Track:** this reads as Track A (family play, pastel, big buttons, everything else in ⚙️). Is that right, or do you want a more formal studio look?
   → Formal studio look.

3. **Batch size:** start with a grid of 16 and then go one by one, or go straight to one card at a time? Is "64" the total you want to reach, or a batch size?
   → 16 at a time. I select a few from each 16. A batch of 64 is the batch size. Then a tournament-style round picks the winners.

4. **Name source:** which list of official names do you prefer?
   - (a) Wikipedia's colour lists (lots of names, open licence)
   - (b) Crayola's crayon names
   - (c) A colour-name dictionary (for example the open "ntc" name list, about 1,500 names)
   - (d) A mix, with the source shown on each card
   → Mix. Take inspiration from many traditions: cultures, pastels, oils, digital, Japanese, Spanish, French.

5. **Photos:** should the real-life photo be fetched from an open source (Wikimedia Commons or Unsplash) with credit shown, or should we store copies in the project? Photos are copied only if their licence allows it.
   → Online and Instagram. (Fetch and link, do not copy into the repo, unless the licence allows it. Credit shown.)

6. **Keepers:** where should the kept palette be saved? Device only (it stays on this iPad), or a database so it also appears on other devices? Device only is the simplest first build.
   → Local devices for now.

7. **Swipe on desktop:** should left and right arrow keys (or buttons) work too, not only swipe or drag?
   → Yes.

8. **Output:** after keeping, should the palette show as swatches with names and hex codes, and be exportable (copy list, or a simple text or CSS file)?
   → Yes. Holding the image down for a while auto-copies the hex.

## Notes for Jimmy

- Track B (studio) is chosen from answer 2. The architecture database is the planned home for kept palettes later. Answer 1 says it is for you, and the first build keeps palettes on this device, so the database link waits for the next round.
- Name confirmed by Jimmy: Colores Azules (2026-11-26).
- No controls for a game (it's a swipe, not a moving game).
- No feedback box yet; we can add `/feedback-notes` once the first page works.
