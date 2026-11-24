# Felix Stickers — lessons

## 2026-11-23, first build (0.1.0)
- Put the sheet data in a classic script (`js/sheet.js`), not a JSON fetch: it works from file:// and offline, and matches the nursery's no-build rule.
- Keep stickers as snapshots for undo, not action logs: Reset, opening a creation and the peel can all be undone with one stack.
- Update the drawing during a gesture, rebuild the DOM only on a discrete action (peel, commit, undo). Rebuilding during a drag breaks the pointer.
- A plain pointer test (Playwright mouse) catches the peel → float → tap-to-commit → undo path; it does not prove the feel, which needs a real iPad.
- Two places for settings (top button and gear) came from two answers in the convo; they open the same panel. Ask Jimmy before adding a third.

## 2026-11-24 to 2026-11-25, lift, hold, carry, apply (rounds 15-17)

- Build the test before the feel. A headless run in 5 px steps catches state bugs (stuck at the wrong edge, a canvas left behind, a sticker that never sticks). Judge the motion from a GIF, not from numbers or a contact sheet.
- Orientation has to be carried through the stick: when the roll direction flips past the edge, keep the angle from just before the edge, or a sticker laid straight back comes out turned 180 degrees.
- A stick that jumps is a bug to the eye. Play the last of the unroll (about 0.3 s) before settling.
- A dashed footprint should be the sticker's own outline (its picture's edge), not a box. Read the outline from the picture's alpha.
- A touch that brings a held piece back should put it under the finger, not where it was lifted.
- Opacity: "95% opaque" and "solid white" are different asks. Set the alpha to what is asked and say which value was set; screenshots cannot measure it.
- When Jimmy says he cannot see something, the first check is whether the file reached him in a form he can open. Send GIFs as files (attach), and say what the GIF shows.
- The GIF tools now live in `02 Refs/Skills/scripts/` and the skill is `/anim-gif`.
