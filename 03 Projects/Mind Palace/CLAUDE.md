# Mind Palace — Claude Code pointer

Purpose: a memory palace to walk through. Each memory is a recognisable object in a room, in a world. Search a word and little-me walks there; practise recall; move, connect and grow the palace.

Track: A. Family play (studio depth in collapsed panels)

- Design: `schematic.md` · Open work: `todo.md`
- Q&A history: `convo/` (never compact; start a new version instead)
- AI notes: `04 AI/Mind Palace/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (public repo, privacy)

Direction (Jimmy, 2026-11-17): Gaussian splats on the web, without three.js, are the point. A palace for each family member; Jimmy's first (his childhood homes as floor plans), for the others to walk through. Family sync planned. Jimmy tests Godot himself; do not run the engine in a session.

How to run: `index.html` is the splat view and the default page (plain WebGL 2, the nursery tile opens it); `build.html` is the Build page (three.js). Both open with a double-click, no server or build. Godot: import `godot/` in Godot 4.3 and press ▶ (`godot/schematic.md`). **The Godot project has never been run**; the first job on it is to run it and fix what the Output panel reports.
Code map (splats): `js/scene.js` (layout → simple shapes; `decorate` adds trees and the moving things), `js/gauss.js` (shapes → splats, fuzz, `.ply`; each splat keeps its moving block), `js/splatview.js` (the WebGL 2 renderer: moves blocks, fog of war, sort), `js/splatpage.js` (the page: motions, fog, controls). State for checks: `MP.debug()`, `MP.debugScreen(id)`. Software GL is very slow with splats: set `mindpalace.settings` to `{quality:'low'}` in tests and wait on `traveling`.
Code map: `js/model.js` (the database; no DOM), `js/layout.js` (database → scene description, routes; no DOM), `js/view.js` (three.js), `js/objects.js` (the object library), `js/app.js` (the Build page), `js/sample.js` (content).
Check: `model.js`, `sample.js` and `layout.js` load in Node (`require` them after `core.js`). The page: headless Chromium with the WebGL flags (`/smoke-test`); read state with `MP.debug()`, find a thing on screen with `MP.View.screenOf(id)`. Wait for `MP.debug().view.traveling` to be false before a screenshot. Keep test scripts out of the repo.

Shared data: `node tools/export_godot_data.js` rewrites `js/objects_data.js`, `godot/data/objects.json` and `godot/data/palace.json` from `js/objects.js` and `js/sample.js`. Shape rules live in both `js/scene.js` and `godot/scripts/palace_builder.gd`. Layout rules live in both `js/layout.js` and `godot/scripts/palace_layout.gd`; change both.

Project rules:
- Public repo. The sample palace holds made-up school facts only. Never commit a real exported palace, a scanned splat of a real place, or anything from Jimmy's childhood palace.
- The database is the source of truth. `view.js` never reads or writes it. Keep `model.js` and `layout.js` free of DOM and three.js, so another renderer (Godot) can use them.
- A memory's topic (`parent_id`) and its room (`place_id`) stay separate.
- Room size means "how much is kept", never "how well known". Keep that sentence on the room card.
- Nothing is lost by a structural change: empty-only removal for rooms and worlds, undo for everything else.
- The card, drawer and form keep a slightly see-through background (see the comment in `css/style.css`).
