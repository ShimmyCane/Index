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

## Answers (Jimmy, 2026-11-24)

- Lifted, it follows the finger only while the finger is down. Release and it disappears from view; touch down on it again and it follows until release. Press and release are the only events. Right-click is not used.
- Dashed lines: they follow the curl to show where it will be placed. They are guides for placing it, not a separate piece.
- Sticking needs the finger to drag it all the way back to the far edge. Until then it is still lifted and can be rolled back again; undo means rolling it back in parts.

## Build (0.7.0)

- Peel starts at the sticker's back edge, along the drag; the roll sits at the finger.
- Release: the sticker stays lifted but is not shown; its hole is dashed.
- Touch on the sheet: carried, its roll under the finger, with a dashed footprint where it would land.
- Release: the next touch applies it. The roll is rolled back toward the edge, and the sticker rotates with the roll's angle. It sticks when the finger passes the edge.
- Headless: lift, hold, carry and apply run in 5px steps with no errors; the sticker sticks after the finger passes the edge.

## Questions

1. Once lifted, does the piece follow the finger all the time (until the second click), or only while the finger is down?
   - Answer: **Only while the finger is down.** Lift it and it does not show. Touch down on it again and it follows the finger until you lift. Press and release are the two events; no right-click.
2. Dashed outlines: the old place only, or also a dashed outline where it would land under the finger?
   - Answer: **Both are useful, but mainly the dashed lines go where the curl goes.** They show where the piece will be, so you can place it; they are guides, not a separate piece.
3. On the second click, must the finger move back to the edge to lay it down, or can you lay it down at any point along the way?
   - Answer: **To stick, the finger must drag it all the way back to the far edge.** Until then it is still lifted: you can roll it back again, and undo by rolling it back in parts.
