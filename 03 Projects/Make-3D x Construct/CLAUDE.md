# Make 3D x Construct — Claude Code pointer

Purpose: a new version of Make 3D (`ShimmyCane/Make-3D`, graduated) built with Construct's working method (`rtmandreyev/construct`, Apache-2.0, by Artyom Andreyev). Credits: `schematic.md` §0 and the page's About panel.

- Track: B. Studio design.
- Design: `schematic.md` · answers and questions: `convo/` (never compact; new version per round; now v0.3)
- To-do and ledger: `todo.md`
- Story and research (draft, for consultation): `exhibit/story.json`, `research/plains-diorama.md`
- Consultation: `research/consultation-plan.md` (the tribes' answers go in `private/`, which is not committed)
- Database SQL (NOT applied): `supabase/001_m3dxc_certainty.sql`
- AI notes: `04 AI/Make-3D x Construct/brief.md`, `lessons.md`
- Summary of the page (summarize-code): `index_summary.html`
- Shared conventions: root `CLAUDE.md` (public repo, privacy)

Run: open `index.html` (no server, no build). Works from file://.
Build the sample: `node tools/build_sample.js` (writes `samples/` and `js/sample_bundle.js`; refuses if the audit is not clean or a story link is broken).
Tests (plain Node): `node tests/test_model.js`, `node tests/test_rounds.js`, `node tests/test_review.js`, `node tests/test_sample.js`.
Browser check: headless Chromium via the pre-installed Playwright, from a script kept outside the repo (screenshots go to the scratch folder).

Layout: `js/core/model.js` (replay, checks, hash, certainty, flags; DOM-free) · `js/core/rounds.js` (ledger, rounds, packets; DOM-free) · `js/core/review.js` (AI prompts and reply checks; DOM-free) · `js/viewer/viewer.js` (three.js, reads only) · `js/app.js` (page) · `vendor/three/` (three.js r160, MIT) · `worlds/plains-diorama-world.json` (rules) · `tools/diorama_scene.js` (sample operations) · `exhibit/story.json` (story).

Project rules:
- Public repo. The sample is synthetic and generic in its figures. It depicts a specific nation, so it stays a draft until the Cheyenne and Arapaho Tribes have reviewed it. Real drawings, client work and the tribes' written answers go in `private/`.
- Rendering never modifies the model. Rules live in the world file. Every change is an operation in the history.
- Never write `null` into a model. Unknown values are left out and flagged.
- The page never calls an AI service. AI reviews are copy and paste, and each reply is checked first.
- Construct's code is not copied in. If any is, its LICENSE and NOTICE go into this folder.
- Do not apply the SQL without Jimmy's go-ahead.
