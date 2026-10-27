# Chinese Character Sudoku — Schematic

**Status:** idea. Waiting for answers in `convo/convo v0.1.md`.
**Owner:** Jimmy
**Platform:** iPad web app (plain HTML/CSS/JS, no build step, GitHub Pages)
**Conversation:** `convo/convo v0.1.md`

## Purpose

A digital version of a printed Chinese word-grid card ("汉字数独"). Some cells hold a printed character and the rest are blank. The child fills each blank from a character bank so that every row and every column reads as a meaningful word. The characters come from what the child is learning in class, so the game matches the child's level.

## Known so far

- Reference card A (2×2): left column 爸 / 妈, right column blank. One answer: 爸爸 / 妈妈, which also makes 爸妈 down both columns.
- Reference card B (3×3, "2级"): 阳 · _ · _ / 白 · 雪 · _ / 蝴 · _ · 飞.
- 2×2 is the easiest level. 3×3 and up are harder.
- Each cell can be tapped and filled from a character bank.
- Difficulty is set from the ⚙️ button in the lower-right corner.
- Character set: the family's recent lesson characters.
- Kids' iPad style: pastel colors, large buttons, Undo, errors hidden behind a toggle in ⚙️.

## Open (see `convo/convo v0.1.md`)

- Exact rule: whole rows/columns as words, or every adjacent pair as a word?
- How the game checks answers: built-in word list, parent check, or both.
- Who makes puzzles: auto-generated from a word list, hand-entered, or both.
- How lesson characters and words get into the app.
- Pinyin, audio, rewards, saving progress.

## Planned files

- `index.html` — the game (to be built after the MVP questions are answered).
- `words.js` or `words.json` — the lesson word list (synthetic or lesson-only content; no personal data).
