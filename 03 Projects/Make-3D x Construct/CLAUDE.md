# Make 3D x Construct — Claude Code pointer

Purpose: a new version of Make 3D (`ShimmyCane/Make-3D`, graduated) built with Construct's working method (`rtmandreyev/construct`, Apache-2.0, by Artyom Andreyev). Credits: `schematic.md` §0 and the page's About panel.

- Track: B. Studio design.
- Design: `schematic.md` · Round 1 answers and round 2 questions: `convo/` (never compact; new version per round)
- To-do and ledger: `todo.md`
- Research (sample): `research/plains-diorama.md`
- Database SQL (NOT applied): `supabase/001_m3dxc_certainty.sql`
- AI notes: `04 AI/Make-3D x Construct/brief.md`, `lessons.md`
- Shared conventions: root `CLAUDE.md` (public repo, privacy)

Run: open `index.html` (no server, no build). Works from file://.
Build the sample: `node tools/build_sample.js` (writes `samples/` and `js/sample_bundle.js`; refuses if the audit is not clean).
Tests (plain Node): `node tests/test_model.js`, `node tests/test_rounds.js`, `node tests/test_sample.js`.
Browser check: headless Chromium via the pre-installed Playwright, from a script kept outside the repo (`/tmp` scratch is fine for screenshots).

Layout: `js/core/model.js` (replay, checks, hash, certainty; DOM-free) · `js/core/rounds.js` (ledger, rounds, packets; DOM-free) · `js/viewer/viewer.js` (three.js, reads only) · `js/app.js` (page) · `vendor/three/` (three.js r160, MIT) · `worlds/plains-diorama-world.json` (rules) · `tools/diorama_scene.js` (sample operations, edit here then build).

Project rules:
- Public repo. Sample models are synthetic and generic. Real drawings or client work go in `private/`.
- Rendering never modifies the model. Rules live in the world file. Every change is an operation in the history.
- Never write `null` into a model. Unknown values are left out and flagged.
- Construct's code is not copied in. If any is, its LICENSE and NOTICE go into this folder.
- Do not apply the SQL without Jimmy's go-ahead.
