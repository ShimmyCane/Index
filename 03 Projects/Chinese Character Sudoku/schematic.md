# Chinese Character Sudoku — Schematic

**Status:** MVP, three games (browser-tested in headless Chromium, including touch input; not yet tested on an iPad)
**Owner:** Jimmy
**Platform:** iPad web app (plain HTML/CSS/JS, no build step, GitHub Pages)
**Conversation:** `convo/convo v0.1.md` to `convo/convo v0.6.md` (v0.6: the 2.0 and 3.0 games)

## Purpose

Games for two children (5 and 7) built on the characters they are learning, based on a printed Chinese word-grid card (汉字数独). Three games share one page, one word list and one set of settings. Switch between them from ⚙️ at any time.

## The three games (⚙️ → 玩法版本, or the links `#v1`, `#v2`, `#v3`)

### 1.0 格子 (the original grid)
- Board 2×2 to 4×4 drawn like 田字格 paper. Drag characters from the bank (right) into the blanks so the rows (left→right) and columns (top→bottom) make words.
- **Easy:** each character must make a word with at least one neighbour; tiles turn green at once. **Challenge:** every character must make a word in its row and column; ✅ 检查 at the end.
- Jimmy found the grid awkward: the words don't always interlock both ways. That is why 2.0 exists. 1.0 stays available.

### 2.0 填词 (lines)
- 2 to 5 lines (⚙️ 行数). Each line is **one two-character word with one character blank**. Choose the missing character from the bank (right). Lines don't affect each other, so nothing has to interlock.
- Easy: the tile turns green as soon as its line is a word. Challenge: ✅ 检查 at the end, then 💡 答案.
- Any bank character that makes a word with the shown one, in the right order, is accepted.
- Decoys include **wrong-order traps**: with 白 shown before a blank, 明 is tempting because 明白 is a word, but 白明 is not.

### 3.0 描红 (tracing)
- A large 米字格 board shows a faint **Kai-style** character from the 60 recently learned ones. Trace it with a finger or Apple Pencil, **stroke by stroke in the right order**. A stroke written out of order is refused and counted; after two misses the right stroke flashes; after five it is filled in.
- **Grade at the end:** ⭐⭐⭐ for every stroke right first time with no hints, ⭐⭐ for up to two slips or hints, ⭐ otherwise. The card shows how many strokes were written right first time. Best stars per character are remembered and shown in the picker.
- **▶ 笔顺** (lower-left corner, mirroring the gear) animates the strokes one by one ("第 3 笔"), then hands over to the child.
- 💡 提示 flashes the next stroke (counted for the grade), ↩️ 重写 restarts, ⏭ 下一个字 picks a character with fewer stars, and the picker lets the child choose any of the 60.
- ⚙️ 描红提示 off hides the faint character, so the child writes from pinyin and the example words.
- Simplified characters only (the stroke data is simplified).

## Shared
- **Word list and bank:** the 字库 is 267 characters (three photos plus 超纲字). **Recently learned** = the last 60 characters of the 第4级总字表 (page 29): 1.0 and 2.0 favour them, 3.0 is made of them.
- **超纲字** (outside the textbook lists) always show pinyin, even with the pinyin setting off.
- **Calligraphy:** the characters in 1.0 and 2.0 use LXGW WenKai (霞鹜文楷), a Kai-style font, subset to the characters used and bundled. 3.0 draws stroke outlines from a Kai typeface.
- ⭐ counts finished puzzles and characters. A win plays 一闪一闪亮晶晶 with confetti (Web Audio, no files).

## Settings (⚙️, lower right)

Game version (links) · size (1.0) · lines (2.0) · mode · givens (1.0) · bank size · tracing hint (3.0) · pinyin · simplified/traditional · sound · add words (stored on this device) · word-bank stats · finished count · show errors · version and change log. Settings that don't apply to the current game are hidden.

## Files

- `index.html`, `css/style.css` — page and theme; `js/app.js` — shared UI, 1.0 and 2.0 (drag, settings, audio, saving, game switching); `js/trace.js` — 3.0; `js/engine.js` — word index, 1.0 and 2.0 generators, checks (no DOM; runs under Node).
- `js/vendor/hanzi-writer.min.js` — Hanzi Writer 3.7.3 (MIT): draws strokes, matches what the child writes, animates.
- `assets/phrases.json` — **edit this to add words.** `lessonChars` = recently learned characters; `phrases` = two-character words made only from the 字库.
- `assets/characters.json` — the 字库 with `[pinyin, traditional]` per character and per-word overrides (还书 huán, 头发 頭髮).
- `assets/strokes.json` — stroke outlines and order for the 60 recent characters. `assets/fonts/wenkai-subset.woff2` — the font subset. Licences and credits: `assets/CREDITS.md`.
- `tools/build_data.py` (pinyin/traditional), `tools/build_strokes.py` (stroke data), `tools/build_font.py` (font subset), `tools/test_engine.js` (`node tools/test_engine.js`).

## Generators

- **1.0:** a grid of distinct characters where the required neighbour pairs are words. 3×3 challenge lists all ~780 valid grids once and samples; other sizes use randomized backtracking. Recent characters are planted, tried first and scored per cell. The last 150 puzzles are avoided.
- **2.0:** picks N words with all characters distinct, weighted heavily toward words with recent characters; blanks the recent character when only one is recent. Decoys: wrong-order traps first, then recent characters, then any bank character, never one that would also be right.

## Saved on the device (localStorage)

Settings (including the last game), the current puzzle per game, ⭐ count, recent puzzles, tracing stars per character, words added in ⚙️, and cached copies of the JSON files (used if they can't load).

## Open

See the questions at the end of `convo/convo v0.6.md`. Later: read-aloud with a better voice.
