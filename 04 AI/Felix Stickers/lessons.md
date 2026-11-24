# Felix Stickers — lessons

## 2026-11-23, first build (0.1.0)
- Put the sheet data in a classic script (`js/sheet.js`), not a JSON fetch: it works from file:// and offline, and matches the nursery's no-build rule.
- Keep stickers as snapshots for undo, not action logs: Reset, opening a creation and the peel can all be undone with one stack.
- Update the drawing during a gesture, rebuild the DOM only on a discrete action (peel, commit, undo). Rebuilding during a drag breaks the pointer.
- A plain pointer test (Playwright mouse) catches the peel → float → tap-to-commit → undo path; it does not prove the feel, which needs a real iPad.
- Two places for settings (top button and gear) came from two answers in the convo; they open the same panel. Ask Jimmy before adding a third.

## 2026-11-24, peel and drop (rounds 10–13)

- Judge motion by frames, not by the test. Headless tests show direction, errors and sizes; they cannot show whether a peel feels right. Before calling a motion done, produce a short frame strip and ask for a look, or say it is untested on a real iPad.
- "Drag direction inverted" came from a model where the lifted part folded toward the press point. Check which way the lifted part moves relative to the finger, using the pixel test, before changing the maths.
- A roll that moves from the press point down the drag needs the peeled part to lie ahead of the roll, back side up. Drawing the whole peel on a sheet-sized canvas lets the peeled part sit outside its own box; a box-sized canvas clips it.
- Canvas pixel reads fail on `file://` (tainted canvas). Serve the project over `http://localhost` for any test that reads pixels.
- Sticking is the reverse of peeling. A single scale bump is not the reverse. Plan the drop as the same roll run backwards, with rotation, before coding it.
- Placed stickers must use the sheet's on-screen size (sized from the sheet picture's width), or pieces shrink or grow when lifted.
- Trim edges only for placed stickers; keep the sheet's picture as in the reference.
- A PR's merge is final: new commits after a merge need a new PR. Create it, mark it ready, merge when Jimmy asks.
- AI-generated art was used without a licence question until Jimmy answered. Ask about licences at the start of any round that uses a reference image.
