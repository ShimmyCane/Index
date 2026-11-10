# 中文筆畫 — Lessons

- Start-project: copy only the general shell from the source repo (style, font, vendor). Leave game logic and data for after the questions are answered.
- Worksheet photos contain a child's name and a score. Never copy either into a project file.
- Put the weekly data in one JSON file and generate the browser scripts from it. Classic scripts (`data/*.js`) work when the page is opened as a file; `fetch` of JSON does not.
- Stroke data for the characters comes from `hanzi-writer-data` (npm). The Sudoku repo held stroke data for only one of these 12, so check coverage with `tools/test_data.js` before building.
- The font subset must be rebuilt when new characters arrive: the 12 characters were missing 4 glyphs in the copied subset (朵, 言, 請, 就).
- Teaching tool: when a child misses, show the right answer and let them write it again. Do not leave them stuck.
- Family database: the notes table and the family sign-in are live (zhbh_notes). Notes save on the device first and are sent when signed in. The 家庭登入 block is in ⚙️. A real sign-in on a device has not been tested by Claude; only the form and the notes path were tested headless.
- The start-project skill now includes the notes-to-database step (step 8), using this project as the reference.
