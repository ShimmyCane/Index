# Felix Stickers — lessons

## 2026-11-23, first build (0.1.0)
- Put the sheet data in a classic script (`js/sheet.js`), not a JSON fetch: it works from file:// and offline, and matches the nursery's no-build rule.
- Keep stickers as snapshots for undo, not action logs: Reset, opening a creation and the peel can all be undone with one stack.
- Update the drawing during a gesture, rebuild the DOM only on a discrete action (peel, commit, undo). Rebuilding during a drag breaks the pointer.
- A plain pointer test (Playwright mouse) catches the peel → float → tap-to-commit → undo path; it does not prove the feel, which needs a real iPad.
- Two places for settings (top button and gear) came from two answers in the convo; they open the same panel. Ask Jimmy before adding a third.

## 2026-11-25, test sheet from an uploaded picture (round 18)

- Check where the peel's pixels come from before blaming the gesture. On file:// the cut-out cannot be read, so the peel fails with no error; the same page over HTTP lifts. A sheet that "does nothing" on file:// is this.
- A sheet's art must be in its own data. The app read only the Woods art map, so a second sheet looked empty until the `native` block (base, art and placed) was added. Test every map a sheet needs: base, art and placed.
- Cut a picture by flood fill from the edge: light pixels connected to the border are background (the cream halo), and light areas enclosed by the outline stay. A plate's cream centre survives; a halo does not. Read the overlay before naming pieces.
- A free-spot search on a sheet's background must also skip the existing boxes: the sheet's stickers are erased to white, so white alone is not free.
- The put-down step (drag the held piece back past the origin edge) did not register in headless mouse tests on either sheet, including the Woods baseline. Treat it as unverified until Jimmy tries it on an iPad.

## 2026-11-24 to 2026-11-25, lift, hold, carry, apply (rounds 15-17)

- Build the test before the feel. A headless run in 5 px steps catches state bugs (stuck at the wrong edge, a canvas left behind, a sticker that never sticks). Judge the motion from a GIF, not from numbers or a contact sheet.
- Orientation has to be carried through the stick: when the roll direction flips past the edge, keep the angle from just before the edge, or a sticker laid straight back comes out turned 180 degrees.
- A stick that jumps is a bug to the eye. Play the last of the unroll (about 0.3 s) before settling.
- A dashed footprint should be the sticker's own outline (its picture's edge), not a box. Read the outline from the picture's alpha.
- A touch that brings a held piece back should put it under the finger, not where it was lifted.
- Opacity: "95% opaque" and "solid white" are different asks. Set the alpha to what is asked and say which value was set; screenshots cannot measure it.
- When Jimmy says he cannot see something, the first check is whether the file reached him in a form he can open. Send GIFs as files (attach), and say what the GIF shows.
- The GIF tools now live in `02 Refs/Skills/scripts/` and the skill is `/anim-gif`.

## 2026-11-25, rotation, centroids and the next ideas (round 20)

- Rotation must not come from the drag direction. The roll took its turn from the drag, so sliding back along the pick-up line turned the sticker 180°. Now the roll only rolls and the turn comes from a separate circle.
- A turn about a corner feels wrong; turn about the centroid. The centroid comes from the cut-out's alpha. When the turn changes, move the pivot so the centroid stays put, and the placed position is the centroid too.
- A rotation that starts without a move feels like a mistake. The circle appears only after the sticker has been moved, and a tap does nothing.
- A timing window (half a second, a second) is easy to misjudge. Name the wait in the code (`CLICK_MS`) so it is easy to change after a device test.
- Judge a turn by a GIF and a contact sheet, not by numbers alone. The first aim drag looked right in numbers and felt wrong to the hand.

### Ideas for next week (not built)

- **Three sheets, three pictures.** Each sheet keeps its own placed stickers, as now.
- **A gallery behind a secret gesture.** A little hidden control near the lower middle: tapping left, left, left, right, right, right opens a repeating gallery of the sheets. Choosing one loads it; the old stickers stay remembered.
- **Carry across sets, and the Easter egg.** A sticker picked up from one set can be dropped on another. The first time someone does it, the page says "Good job, you found an Easter egg!". Jimmy wants this encouraged: it is part of the fun, not a bug.
- The sticker pack page (for more than 20 stickers) can be the gallery.
