# Chinese Character Sudoku — Claude Code pointer

Purpose: a kids' iPad game based on a Chinese-character word-grid card. Drag characters from a bank into the blanks so rows and columns make real words. Uses characters from recent lessons.

- Design: `schematic.md`
- Q&A history: `convo/` (in Chinese; never compact; start a new version instead)
- AI notes: `04 AI/Chinese Character Sudoku/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (public repo, privacy rules) and `02 Refs/Skills/ipad_website.md`

How to run: serve the folder (`python3 -m http.server`) and open `index.html`; GitHub Pages works as is. Opening the file directly can't load the JSON, so it falls back to a small built-in list.
Test the engine: `node tools/test_engine.js`.

Project rules:
- Words live in `assets/phrases.json` (two-character words only). Jimmy adds words there by hand; keep the one-entry-per-line layout (`tools/build_data.py` rewrites it).
- The character bank is the 266 characters from Jimmy's three photos (`assets/characters.json` categories). Build words only from them; run `python3 tools/build_data.py` after editing, and `node tools/test_engine.js` checks that no word or puzzle goes outside the bank.
- Keep word content kid-appropriate. No names or school details (public repo).
- Bump `APP_VERSION` and add a `CHANGELOG` line in `js/app.js` for each user-visible change.
