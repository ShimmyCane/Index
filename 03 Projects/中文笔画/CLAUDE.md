# 中文笔画 — Claude Code pointer

Purpose: a kids' iPad game for practising the characters on the weekly 中文 worksheet. The child sees the pinyin and writes the character with a finger or Apple Pencil, stroke by stroke. A wrong stroke is corrected at once; after a set number of misses the right answer is shown and its stroke order plays.

- Design: `schematic.md`
- Q&A history: `convo/` (in Chinese, traditional; never compact; start a new version instead)
- AI notes: `04 AI/中文笔画/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (Index repo, public, privacy rules) and `02 Refs/Skills/ipad_website.md`
- Track: A. Family play

How to run: serve the folder (`python3 -m http.server`) and open `index.html`. It also works when opened as a file, because the data is in classic scripts.

Weekly upload (the one file to edit):
- Add a batch to `data/batches.json`: `{ "date": "YYYY-MM-DD", "lesson": "第二課", "items": [{ "ch": "字", "py": "pinyin" }] }`. Each upload date becomes its own tab, newest first.
- Run `python3 tools/build_batches.py path/to/hanzi-writer-data/package` (writes `data/batches.js` and `data/strokes.js`; see its docstring to get the package).
- Run `node tools/test_data.js` (checks one character per item, pinyin, no repeats in a batch, and stroke data for every character).
- Recordings: `python3 -I tools/make_audio.py path/to/kokoro-folder` makes `audio/u<hex>.mp3` for every character (Kokoro zf_xiaoxiao, speed 0.8). Needs the kokoro-onnx model and voice files from the GitHub release (see the script header). The iPad voice is the fallback.
- Stroke names: only names checked against a source go in an item's `names` in `data/batches.json` (言 is checked; see `stroke.md`). Unchecked characters say the stroke number, not a guessed name.
- If a new character is added, run `python3 tools/build_font.py path/to/lxgw-wenkai-webfont/files` so the big character uses the Kai font (`tools/build_font.py` needs `pip install fonttools brotli`).

Project rules:
- Characters come from the worksheet photos only (traditional). Readings are checked by Jimmy before they go in.
- All page text is traditional Chinese.
- The answer is shown after the set number of misses (default 2). Never leave a child stuck without the right answer.
- Hints match 汉字数独 3.0 (💡 next stroke, 🙋 stroke name, ▶ 筆順 whole animation).
- No names, scores or school details in any file (public repo). The worksheet photo is not committed.
- Bump `APP_VERSION` and add a `CHANGELOG` line in `js/app.js` for each user-visible change.
