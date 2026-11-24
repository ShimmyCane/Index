# Felix Stickers — Convo v0.12

**Project:** Felix Stickers
**Round:** 12 (after 0.5.3, 2026-11-24)

## Jimmy's notes

> Hmm, the peeling is weird. It should gradually peel at start point, down the direction of the drag. It shouldn't be a sharp crease, rather a soft roll. The sticker has a vinyl texture, so it curves slightly.

> Also, the drag direction was somehow inverted. Can you test it headlessly?

## What changed (0.6.0)

- **From the start point, down the drag:** a roll starts where the sticker was pressed and travels along the drag. The part already peeled lies beyond the roll, in the drag direction, with the back side up. The sheet keeps a hole where the peeled part was.
- **Soft roll:** the picture curls round the roll (shaded, lighter at the top), not a sharp crease.
- **Drag direction, tested headlessly:** dragging right puts the peeled part to the right of the roll; dragging left puts it to the left. The previous fold squeezed the lifted part back toward the press point, which read as inverted.
- The peel is drawn over the whole sheet, so a peeled part can lie beyond its own box.

## Claude's reading (to confirm)

- The roll is centred on the press point at the start and moves with the drag; "down the direction of the drag" means along the dominant drag axis (horizontal or vertical).

## Known limits

- The edges between the roll, the back and the picture are still a little hard. The next step is a smoother gradient across the roll.
- Diagonal drags use the dominant axis.
