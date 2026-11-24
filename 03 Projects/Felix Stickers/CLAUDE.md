# Felix Stickers — Claude Code pointer

Purpose: a warm, tactile sticker playground for young children on an iPad. One central creature; peel a sticker from the sheet, drag it, twist it, press it down. The first build tests whether the peel-move-rotate-press feel is magical.

Track: A. Family play (proposed; confirm in `convo/convo v0.1.md`)

- Design: `schematic.md`
- Q&A history: `convo/` (never compact; start a new version instead)
- AI notes: `04 AI/Felix Stickers/brief.md` and `lessons.md` (created at the first build)
- Shared conventions: root `CLAUDE.md` (public repo, privacy)

How to run: open `index.html` (no server or build). Test on an iPad or in a headless browser at iPad sizes.

Code map: `index.html` (page and inline creature SVG), `css/app.css` (palette, gesture lock, the sheet, gear, panels), `js/sheet.js` (the sheet: name, one plain body and ten features, redrawn from the reference elements; slot positions; edit or swap art here), `js/app.js` (engine, one IIFE), `js/native.js` (the art paths), `art/` (the sheet picture and cutouts, AI-generated). Smoke test lives outside the repo (headless Chromium over HTTP; a peel does nothing on file://). Test sheets: `private/<sheet>/` (git-ignored), opened with `index.html?sheet=<key>` through `js/sheet_select.js`. Add a sticker with `/make-sticker`.

Track: A. Family play. Version 0.1.0.

Project rules:
- Public repo. Art in `art/` is AI-generated (ChatGPT), used freely per Jimmy (convo v0.9); the ⚙️ panel credits it. Do not commit other people's artwork or photos.
- No accounts, no sound, no database in the first build.
- Gestures are locked for iPad: no pinch zoom, double-tap zoom, pull-to-refresh or long-press menus (see `schematic.md`, Gesture lock).
- Web Audio API only if sound is added later; no audio files.
- The gear stays lower right; the ⚙️ panel holds Reset, the notes box and the error panel.
