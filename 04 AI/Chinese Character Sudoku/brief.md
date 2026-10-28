# Chinese Character Sudoku — Brief

**Goal:** iPad games for two children (5 and 7) learning Chinese, built on the recently learned characters. Three games on one page, switched from ⚙️: 1.0 grid (rows and columns make words), 2.0 lines (one word per line, fill the blank), 3.0 tracing (write a character in stroke order, graded).

**State (2026-10-28):** v0.5.0. Jimmy found 1.0's grid awkward (words don't interlock both ways) and asked for 2.0 and 3.0 plus switching from ⚙️. Open items are at the end of `convo v0.6.md` (and the earlier checks in `convo v0.2.md`).

## Architecture

- **Games:** `S.settings.game` is `grid` | `lines` | `trace`, set by links `#v1/#v2/#v3` in ⚙️ (hashchange) and remembered. 1.0 and 2.0 share `js/app.js`: a 2.0 puzzle has `kind: 'lines'`, `rows: n`, `cols: 2`, so drag, undo, win and saving are shared; rules differ in `goodCells`, `check`, `wordAt`, `render`. Saved puzzles are per game (`game_grid`, `game_lines`). 3.0 is `js/trace.js` (`Trace`), driven by Hanzi Writer's quiz mode.
- **2.0 generator:** weighted word picks (heavy bias to recent characters), all characters distinct, blank the recent one; decoys = wrong-order traps, then recent, then any bank character, never one that would also be right.
- **3.0:** stroke data for the 60 recent characters (`assets/strokes.json`, from hanzi-writer-data), custom loader (no network), grade = stars from mistakes + hints, best stars per character in localStorage. Font: LXGW WenKai subset (OFL) for characters; stroke outlines are a Kai typeface.

- Plain HTML/CSS/JS, no build. `js/engine.js` (pure, Node-testable) + `js/app.js` (UI).
- Data: `assets/phrases.json` (1,037 two-character words, 60 recent characters) and `assets/characters.json` (267 characters in 5 source lists, pinyin and traditional, 64 per-word overrides). Every word uses only bank characters; decoys come from the whole bank (`idx.pool`). Load order: fetch JSON → localStorage cache → small built-in fallback.
- Rules: easy = each character makes a word with any neighbour (reading direction). Challenge = each character makes a word in its row and in its column. Any valid board wins.
- Generator: backtracking with per-line patterns (4-cell lines may be chain or 2+2); 3×3 challenge enumerates all grids once (~780) and samples; words with recent characters planted at the bottom row or right column, recent characters tried first and scored per cell; decoys from partial fits.

## Verified

- v0.5.0 (headless Chromium): switching 1.0/2.0/3.0 through the real links and `#v` URLs, with the right settings shown for each; 1.0 solved at 2×2/3×3/4×4 (easy) and 3×3 (challenge); 2.0 solved at 2/4/5 lines (challenge) and 3 lines (easy), wrong tiles go red on check, answer reveal, reload restores the puzzle; 3.0 traced with mouse and with touch events along the stroke medians (correct order → stars; stroke 2 written first → refused and counted; hint counted; animation steps "第 1 笔…第 6 笔" then restarts the quiz; guide off; picker; no page scroll); portrait layouts of 2.0 and 3.0; no console errors.
- `node tools/test_engine.js` also checks 2.0: every line is a word, no repeated character, decoys never right, bank size.

- `node tools/test_engine.js`: every word and every puzzle/bank tile stays inside the 267-character bank; every bank character has pinyin; every size/mode makes valid, varied puzzles; bank size = blanks × 3, no repeats.
- Photo transcription cross-checks: counts match the printed 60 / 100 / 240; the 60 new characters equal the first five rows of the 240 table. Not checked against the photos by anyone but Claude.
- Headless Chromium: an old saved puzzle with characters outside the bank is discarded on load; no off-bank characters on screen in 2×2, 3×3, 4×4; (v0.1.0) drag-to-solve in easy mode → celebration and ⭐; tap-to-place in 3×3 challenge → check marks wrong cells, 💡 reveals an answer; 4×4 traditional renders; settings drawer; no console errors.

## Not verified

- v0.5.0: real iPad and real Apple Pencil (palm resting on the screen, pressure, speed); how strict stroke matching feels to a 5-year-old (leniency 1.4, hint after 2 misses, auto-accept after 5); whether the 3.0 grade is too harsh; the interpretation of "page 60" as the 60 recent characters.

- Real iPad: touch drag, Kaiti font availability, audio unlock, safe areas.
- Content: the word list was curated by Claude from a frequency list, the poster's example words and hand-written kid words, then filtered to the bank; a native-speaker skim would help. 声 was added as a 超纲 character so 叫声 works. Some pinyin uses tone sandhi from pypinyin (一个 yí gè) and some doesn't (一路 yī lù).

## Next

1. Jimmy answers convo v0.2 checks; play-test on iPad.
2. Add a tile in the root `index.html` Nursery section (human-only file; Jimmy edits it).
3. Grow `phrases.json` around the recent characters: challenge boards are only about 30–40% recent characters (easy: 75–80%), limited by which grids exist.
4. Read-aloud once a good voice is chosen.
