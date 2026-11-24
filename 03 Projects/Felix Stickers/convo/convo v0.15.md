# Felix Stickers — Convo v0.15

**Project:** Felix Stickers
**Round:** 15 (after 0.6.1 merge, 2026-11-24)

## Jimmy's note

> The pick up is improving. Test headlessly, five pixels at a time. There are still issues with the first touch. You need to peel from the edge, not from 5% in from the edge. When we pick it up, it shouldn't fall flat again. It should keep the curled look, with the thumb still dragging it. When you find a good place and put it down, you're still dragging from that point; you click again, and that's when you apply force and roll it back over the background (a sticker, another sticker, the main, or something else). It should slowly roll back until the finger moves past the edge, and then it stays. Maybe a dashed outline: when you peel it, you still see the previous location; when you shift it, a dashed line shows where the sticker would sit. As you roll it back, if you change the angle of the roll the sticker rotates. The sticker should move and paste intuitively onto the background.

## Headless check (five-pixel steps, first touch)

- Press just inside the left edge (about 4px), then drag right in 5px steps.
- Result now: the roll starts at the press point and sweeps right as a hard vertical band. It does not start at the edge, and there is a visible seam at the roll.

## Claude's reading (to confirm)

Stages:
1. **Peel:** the roll starts at the piece's edge nearest the press, not at the press point, and moves with the drag.
2. **Hold:** on release the piece stays curled in the air, still following the finger. It does not fall flat.
3. **Apply:** a second click. The finger drags the held piece back toward the origin edge; the roll unrolls over whatever is underneath (sheet, sticker, body). Rotation follows the roll angle.
4. **Settle:** once the finger passes the origin edge, the piece lies flat and stays.
5. **Ghost:** a dashed outline of the piece's old place stays while it is held; a second dashed outline marks where it would land.

## Questions

1. Once lifted, does the piece follow the finger all the time (until the second click), or only while the finger is down?
   - Answer:
2. Dashed outlines: the old place only, or also a dashed outline where it would land under the finger?
   - Answer:
3. On the second click, must the finger move back to the edge to lay it down, or can you lay it down at any point along the way?
   - Answer:
