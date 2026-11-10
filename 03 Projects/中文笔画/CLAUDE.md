# 中文笔画 — Claude Code pointer

Purpose: a kids' iPad game for practising the characters on the weekly 中文 worksheet. The child sees the pinyin and writes the character with a finger or Apple Pencil, stroke by stroke.

- Design: `schematic.md`
- Q&A history: `convo/` (in Chinese, traditional; never compact; start a new version instead)
- AI notes: `04 AI/中文笔画/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (Index repo, public, privacy rules) and `02 Refs/Skills/ipad_website.md`
- Track: A. Family play

How to run: not built yet. When built, serve the folder (`python3 -m http.server`) and open `index.html`.

Project rules:
- Characters come from the worksheet photo only (traditional). Add new characters by hand in `assets/characters.json`.
- Keep the one-entry-per-line layout in the data files.
- No names, scores or school details in any file (public repo). The worksheet photo is not committed.
- Bump the app version and add a changelog line for each user-visible change.
