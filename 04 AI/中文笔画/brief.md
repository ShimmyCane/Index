# 中文筆畫 — AI brief

Status: MVP 0.1.0 (built, not yet device-tested by a child).

Current state
- Page in `03 Projects/中文笔画/`: `index.html`, `js/app.js`, `js/notes.js`, `css/style.css` (shared from Chinese Character Sudoku), `css/app.css`.
- Data: `data/batches.json` (edited each week) → `tools/build_batches.py` → `data/batches.js` and `data/strokes.js`.
- First batch: 2026-11-10 · 第一課, 12 characters (readings 黃, 青, 請 confirmed by Jimmy).
- Behaviour: date tabs; wrong strokes corrected on the spot; the answer is shown and its stroke order played after 2 misses (⚙️ can set 1–3); hints match 汉字数独 3.0; stars per character on the device; feedback box in ⚙️.
- Font subset rebuilt for these characters (31 of 31 in the font).

Verified
- `node tools/test_data.js` passes (12 characters, stroke data for each, pinyin present, no repeats).
- Headless Chromium: 3 sizes (phone, iPad portrait, iPad landscape), over HTTP and as a file. No console errors, no horizontal scroll, tabs, picker, board, reveal animation, drawer, and a saved note all work.

Database
- `zhbh_notes` applied to the Family project on 2026-11-10 (test passed, verify read-only). The page is not yet wired to it; notes still save on the device.

Unverified
- A real finger or Apple Pencil on a real iPad (the wrong-stroke path was not driven with real strokes).
- Stroke-name guesses for these characters.
- Speech voices on iPad (Say falls back silently).

Next steps
- Jimmy's device test; then add next week's batch in `data/batches.json`.
- Convo v0.2 has the assumptions to confirm (stars on device, animation speed default).

## Notes review, round 1 (2026-11-10)
- Read `zhbh_notes`: 9 open notes, all from 2026-11-10 on version 0.1.0.
- Logged in `03 Projects/中文笔画/todo.md` (8 rows) and `convo/convo v0.3.md` (6 questions for Jimmy). No app code changed for the notes.
- Fixed a bug reported on sign-in ("status is not a function") in `js/family.js`. Not yet committed.
- Waiting on: voice source (Q1), female voice (Q2), stroke names (Q3), English toggle (Q4), evolution text or images (Q5), two-character words (Q6).
