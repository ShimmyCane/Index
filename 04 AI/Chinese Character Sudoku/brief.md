# Chinese Character Sudoku — Brief

**Goal:** an iPad word-grid game for two children (5 and 7) learning Chinese. Drag characters into a 2×2–4×4 grid so rows and columns form words, using the recently learned characters.

**State (2026-10-28):** v0.4.0. The 字库 is the characters from Jimmy's three photos plus 超纲字 (巨 棵 抱 放 声): 267 characters. 超纲字 always show pinyin. Recently learned = the last 60 characters of the 第4级总字表 (page 29), `lessonChars` in `phrases.json`. Open items are at the end of `convo v0.5.md` (and the earlier checks in `convo v0.2.md`).

## Architecture

- Plain HTML/CSS/JS, no build. `js/engine.js` (pure, Node-testable) + `js/app.js` (UI).
- Data: `assets/phrases.json` (1,037 two-character words, 60 recent characters) and `assets/characters.json` (267 characters in 5 source lists, pinyin and traditional, 64 per-word overrides). Every word uses only bank characters; decoys come from the whole bank (`idx.pool`). Load order: fetch JSON → localStorage cache → small built-in fallback.
- Rules: easy = each character makes a word with any neighbour (reading direction). Challenge = each character makes a word in its row and in its column. Any valid board wins.
- Generator: backtracking with per-line patterns (4-cell lines may be chain or 2+2); 3×3 challenge enumerates all grids once (~780) and samples; words with recent characters planted at the bottom row or right column, recent characters tried first and scored per cell; decoys from partial fits.

## Verified

- `node tools/test_engine.js`: every word and every puzzle/bank tile stays inside the 267-character bank; every bank character has pinyin; every size/mode makes valid, varied puzzles; bank size = blanks × 3, no repeats.
- Photo transcription cross-checks: counts match the printed 60 / 100 / 240; the 60 new characters equal the first five rows of the 240 table. Not checked against the photos by anyone but Claude.
- Headless Chromium: an old saved puzzle with characters outside the bank is discarded on load; no off-bank characters on screen in 2×2, 3×3, 4×4; (v0.1.0) drag-to-solve in easy mode → celebration and ⭐; tap-to-place in 3×3 challenge → check marks wrong cells, 💡 reveals an answer; 4×4 traditional renders; settings drawer; no console errors.

## Not verified

- Real iPad: touch drag, Kaiti font availability, audio unlock, safe areas.
- Content: the word list was curated by Claude from a frequency list, the poster's example words and hand-written kid words, then filtered to the bank; a native-speaker skim would help. 声 was added as a 超纲 character so 叫声 works. Some pinyin uses tone sandhi from pypinyin (一个 yí gè) and some doesn't (一路 yī lù).

## Next

1. Jimmy answers convo v0.2 checks; play-test on iPad.
2. Add a tile in the root `index.html` Nursery section (human-only file; Jimmy edits it).
3. Grow `phrases.json` around the recent characters: challenge boards are only about 30–40% recent characters (easy: 75–80%), limited by which grids exist.
4. Read-aloud once a good voice is chosen.
