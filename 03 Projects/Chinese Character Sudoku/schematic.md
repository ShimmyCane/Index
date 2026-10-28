# Chinese Character Sudoku — Schematic

**Status:** MVP (browser-tested in headless Chromium; not yet tested on an iPad)
**Owner:** Jimmy
**Platform:** iPad web app (plain HTML/CSS/JS, no build step, GitHub Pages)
**Conversation:** `convo/convo v0.1.md` (questions), `convo/convo v0.2.md` (answers + open checks), `convo/convo v0.3.md` (character bank from three photos), `convo/convo v0.4.md` (answers, 超纲字), `convo/convo v0.5.md` (recent characters = last 60 of the 第4级 table)

## Purpose

A digital version of a printed Chinese word-grid card (汉字数独). Some cells hold a character. The child drags characters from a bank on the right into the blanks so the rows (left→right) and columns (top→bottom) make real words. It uses the characters the children (5 and 7) are learning, so the game matches their level.

## How it plays

- **Board** on the left, 2×2 to 4×4, drawn like 田字格 writing paper. Givens are printed; blanks are dashed.
- **Bank** on the right: about 3× as many characters as blanks (2× on the smaller setting). Each character is used once. Drag a tile to a cell, drag it back or tap it to return it. Tap a tile, then a cell, also works.
- **Easy (简单):** each character must make a word with at least one neighbour. A placed tile turns green as soon as it does. The board is won when every blank is green.
- **Challenge (挑战):** every character must make a word in its row and in its column. Nothing changes colour until ✅ 检查. Wrong cells shake red and their lines are tinted; 💡 答案 then appears.
- Any valid board counts, not only the generated one. A character may appear only once per puzzle.
- **Undo** (↩️), **New** (🔄), and a celebration with confetti and a Web Audio tune (Twinkle Twinkle) on a win. ⭐ counts finished puzzles.
- **超纲字** (characters outside the three photos' lists) always show pinyin, even when the pinyin setting is off.
- **Words made** panel lists the words on the board with pinyin (live in easy mode; at the end in challenge mode). Words with a recently learned character show in yellow.

## Settings (⚙️, lower right)

Size · mode · number of givens · bank size · pinyin · simplified/traditional · sound · add words (stored on this device; can be marked as recently learned, which makes their characters count as recent) · word-bank stats · finished count · show errors · version and change log.

## Files

- `index.html`, `css/style.css`, `js/app.js` — page, theme, UI (drag, settings, audio, saving).
- `js/engine.js` — word index, puzzle generator, decoys, easy/challenge checks. No DOM; runs under Node.
- `assets/phrases.json` — **edit this to add words.** `lessonChars` = the recently learned characters: the last 60 of the 第4级总字表 (page 29), which puzzles favour; `phrases` = 1,037 two-character words, all made only from the 字库 characters (a word with another character gets that character added under 其他 by `tools/build_data.py`).
- `assets/characters.json` — **the 字库: 267 characters** — the three photos (第3级新增字表 60, 一年级上册写字表 100, 第4级总字表 240) plus 超纲字 (the booklet's 巨 棵 抱 放, and 声), listed as the photos show them, with `[pinyin, traditional]` per character and per-word overrides (还书 huán, 头发 頭髮).
- `tools/build_data.py` — optional: fills pinyin/traditional for new characters and tidies the JSON (needs `pypinyin`, `opencc-python-reimplemented`).
- `tools/test_engine.js` — `node tools/test_engine.js` generates puzzles at every size and checks them.

## Generator

- A solution is a grid of distinct characters where the required neighbour pairs are words from `phrases.json`.
- 3×3 challenge: all ~780 valid grids are listed once (about a second) and sampled. Other sizes use a randomized backtracking search.
- Recent characters: a word that uses them is planted on the bottom row or right column, the search tries them first, and boards score 2 per recent-character cell (1 more for a word made only of them). 3×3 challenge ranks all grids by recent characters and samples the best plus some random ones.
- Decoys are characters that make a word with one neighbour of a blank but are not in the solution (the 黑白 / 白马 idea), topped up with recent characters, then any character from the 字库 (even one with no word yet).
- The last 40 solutions are avoided.

## Saved on the device (localStorage)

Settings, current puzzle, ⭐ count, recent solutions, words added in ⚙️, and a cached copy of the JSON (used if the files can't load).

## Open

See the questions at the end of `convo/convo v0.2.md`. Later: read-aloud with a better voice.
