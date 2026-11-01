# Make 3D — Claude Code pointer

Purpose: a browser-based 3D sandbox where the **JSON file is the model**. Objects are appended as operations with stable IDs, a separate world file holds the rules they are checked against, and a Three.js viewer renders and inspects the result. No backend, no database, no LLM required. Later destination: three-view drawings → deterministic geometry.

- Design (MVP): `schematic.md`
- To-do log: `todo.md`
- Q&A history: `convo/` (never compact; start a new version instead). Open questions: `convo/convo v0.1.md`.
- AI notes: `04 AI/Make 3D/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (public repo, privacy)

How to run: open `index.html` in a browser (no server or build). Also works from GitHub Pages.

- Tests: `node tests/test_core.js` (engine, plain Node).
- Sample: the planter is generated. Edit the operation list in `tools/build_samples.js`, then run `node tools/build_samples.js`. Never hand-edit `model.json` or `js/samples.bundle.js`.
- Browser check: `node tools/smoke.js <screenshotDir>` (headless Chromium via pre-installed Playwright; save screenshots outside the repo).
- Units are inches. Files: `model.json` (replayed result), `history.json` (source of truth), `worlds/default-world.json` (rules).

Project rules:
- Public repo. Sample models are synthetic. Real architectural details or client drawings go in `private/`.
- Rendering never modifies the model. Rules live outside the geometry. Every change is an operation in the history.
