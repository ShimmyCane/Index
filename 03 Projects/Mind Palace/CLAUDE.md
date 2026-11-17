# Mind Palace — Claude Code pointer

Purpose: a memory palace to walk through. Each memory is a recognisable object in a room, in a world. Search a word and little-me walks there; practise recall; move, connect and grow the palace.

Track: A. Family play (studio depth in collapsed panels)

- Design: `schematic.md` · Open work: `todo.md`
- Q&A history: `convo/` (never compact; start a new version instead)
- AI notes: `04 AI/Mind Palace/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (public repo, privacy)

How to run: open `index.html` (no server or build). The first run loads the sample palace.
Code map: `js/model.js` (the database; no DOM), `js/layout.js` (database → scene description, routes; no DOM), `js/view.js` (three.js), `js/objects.js` (the object library), `js/app.js` (the page), `js/sample.js` (content).
Check: `model.js`, `sample.js` and `layout.js` load in Node (`require` them after `core.js`). The page: headless Chromium with the WebGL flags (`/smoke-test`); read state with `MP.debug()`, find a thing on screen with `MP.View.screenOf(id)`. Wait for `MP.debug().view.traveling` to be false before a screenshot. Keep test scripts out of the repo.

Project rules:
- Public repo. The sample palace holds made-up school facts only. Never commit a real exported palace.
- The database is the source of truth. `view.js` never reads or writes it. Keep `model.js` and `layout.js` free of DOM and three.js, so another renderer (Godot) can use them.
- A memory's topic (`parent_id`) and its room (`place_id`) stay separate.
- Room size means "how much is kept", never "how well known". Keep that sentence on the room card.
- Nothing is lost by a structural change: empty-only removal for rooms and worlds, undo for everything else.
- The card, drawer and form keep a slightly see-through background (see the comment in `css/style.css`).
