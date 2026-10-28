# Chinese Character Sudoku — Claude Code pointer

Purpose: kids' iPad games built on the characters the children are learning. Three games on one page, switched from ⚙️ (`#v1`, `#v2`, `#v3`): 1.0 grid (rows and columns make words), 2.0 lines (one word per line, fill the blank), 3.0 tracing (write a character in stroke order with a finger or Apple Pencil, graded).

- Design: `schematic.md`
- Q&A history: `convo/` (in Chinese; never compact; start a new version instead)
- AI notes: `04 AI/Chinese Character Sudoku/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (public repo, privacy rules) and `02 Refs/Skills/ipad_website.md`

How to run: serve the folder (`python3 -m http.server`) and open `index.html`; GitHub Pages works as is. Opening the file directly can't load the JSON, so it falls back to a small built-in list.
Test the engine: `node tools/test_engine.js`. Everything is bundled (no network needed at run time). Rebuild helpers in `tools/`: `build_data.py` (pinyin/traditional), `build_strokes.py` (3.0 stroke data from the recent characters), `build_font.py` (font subset); credits and licences in `assets/CREDITS.md`.

Project rules:
- Words live in `assets/phrases.json` (two-character words only). Jimmy adds words there by hand; keep the one-entry-per-line layout (`tools/build_data.py` rewrites it).
- The character bank is the characters from Jimmy's three photos plus the 超纲字 (`assets/characters.json` categories). Build words only from them; a new character in a word goes into 其他 when you run `python3 tools/build_data.py`. 超纲字 (categories 本册超纲字 and 其他) always show pinyin. `node tools/test_engine.js` checks that no word or puzzle goes outside the bank.
- Recently learned characters are `lessonChars` in `assets/phrases.json` (the last 60 of the 第4级总字表, page 29). Puzzles favour them; change that string when the class moves on.
- 3.0 is made of `lessonChars`; after changing that string, run `tools/build_strokes.py` (see its docstring) so every character has stroke data, and `tools/build_font.py` if new characters appear.
- Keep word content kid-appropriate. No names or school details (public repo).
- Bump `APP_VERSION` and add a `CHANGELOG` line in `js/app.js` for each user-visible change.
