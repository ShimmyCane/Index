# Chinese Character Sudoku — Brief

**Goal:** an iPad word-grid game for two children (5 and 7) learning Chinese. Drag characters into a 2×2–4×4 grid so rows and columns form words, using recent lesson words.

**State (2026-10-27):** MVP v0.1.0 built from convo v0.1 answers. Waiting on the checks listed at the end of `convo v0.2.md`.

## Architecture

- Plain HTML/CSS/JS, no build. `js/engine.js` (pure, Node-testable) + `js/app.js` (UI).
- Data: `assets/phrases.json` (1,311 two-character words, 9 lesson words) and `assets/characters.json` (575 characters, pinyin and traditional, 85 per-word overrides). Load order: fetch JSON → localStorage cache → small built-in fallback.
- Rules: easy = each character makes a word with any neighbour (reading direction). Challenge = each character makes a word in its row and in its column. Any valid board wins.
- Generator: backtracking with per-line patterns (4-cell lines may be chain or 2+2); 3×3 challenge enumerates all grids once (~780) and samples; lesson words planted at the bottom row or right column; decoys from partial fits.

## Verified

- `node tools/test_engine.js`: every size/mode makes valid puzzles; bank size = blanks × 3, no repeats.
- Headless Chromium (1180×820 and 820×1180): drag-to-solve in easy mode → celebration and ⭐; tap-to-place in 3×3 challenge → check marks wrong cells, 💡 reveals an answer; 4×4 traditional renders; settings drawer; no console errors.

## Not verified

- Real iPad: touch drag, Kaiti font availability, audio unlock, safe areas.
- Content: the word list was curated by Claude from a frequency list plus hand-written kid words; a native-speaker skim would help. Some pinyin uses tone sandhi from pypinyin (一个 yí gè) and some doesn't (一路 yī lù).

## Next

1. Jimmy answers convo v0.2 checks; play-test on iPad.
2. Add a tile in the root `index.html` Nursery section (human-only file; Jimmy edits it).
3. Grow `phrases.json` around lesson characters so 3×3 challenge varies more.
4. Read-aloud once a good voice is chosen.
