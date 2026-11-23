# Felix Stickers — lessons

## 2026-11-23, first build (0.1.0)
- Put the sheet data in a classic script (`js/sheet.js`), not a JSON fetch: it works from file:// and offline, and matches the nursery's no-build rule.
- Keep stickers as snapshots for undo, not action logs: Reset, opening a creation and the peel can all be undone with one stack.
- Update the drawing during a gesture, rebuild the DOM only on a discrete action (peel, commit, undo). Rebuilding during a drag breaks the pointer.
- A plain pointer test (Playwright mouse) catches the peel → float → tap-to-commit → undo path; it does not prove the feel, which needs a real iPad.
- Two places for settings (top button and gear) came from two answers in the convo; they open the same panel. Ask Jimmy before adding a third.
