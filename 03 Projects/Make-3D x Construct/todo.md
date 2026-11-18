# Make 3D x Construct — To-do

Status key: `[ ]` open · `[~]` in progress · `[x]` done · `[?]` waiting on Jimmy

## Round 2: MVP 0.1 (built 2026-11-18)

- [x] Engine: replay with checks before each operation; 30 diagnostic codes with path and fix (`js/core/model.js`).
- [x] Certainty percent per part, with basis and note; sort and edit; unknown values left out (E110 refuses null).
- [x] Flags: open flags explain the warnings they cover (a group's flag covers its parts). Closed flags stay in the history.
- [x] History hash in the model; replay is deterministic (`tests/test_model.js`).
- [x] Rounds: ledger, four items per round, keep the best, two rounds without a win stop the run, no time cap, optional round cap (`js/core/rounds.js`, `tests/test_rounds.js`).
- [x] Review packet: four fixed views (PNG) and a JSON file with the request and open defects; no history, no notes.
- [x] Viewer: three.js r160, Z up, inches; drag, pinch, wheel, tap to select; provenance colour.
- [x] Page: Model, Certainty, Flags, Ledger and rounds, Selected part; ⚙️ drawer with Show errors (bottom), How rounds work, Notes for improvement, Database check, About (bottom).
- [x] Sample: generic plains camp diorama, 32 objects, 6 flags, placeholders marked (`tools/diorama_scene.js`, `tools/build_sample.js`).
- [x] Research folder: `research/plains-diorama.md` with sources and open questions.
- [x] Nursery home page tile (one `<li>`, in the same change).
- [x] Headless smoke test: loads with no console errors at 1280 and 390 px; no horizontal scroll; edit saves and re-checks.
- [~] Database: `supabase/001_m3dxc_certainty.sql` written with its rolled-back test. NOT applied (waiting on Jimmy).
- [ ] Device test on an iPad (touch, pinch, the drawer, the bottom errors).
- [ ] `summarize_code` page for `index.html` (`index_summary.html`), as the nursery convention asks for core HTML. [?] Jimmy: do it now?
- [ ] Round scoring in the page: the four criteria (0–3) so the "every criterion at the top" stop can run. [?] Jimmy: score by hand, or leave it to the critic?
- [ ] Model critic (blind, on the packet). [?] Later, after the first human rounds.
- [ ] Cloud save of certainty to `m3dxc_certainty` (after the SQL is applied and tested).
- [ ] Replace the placeholder figures and horse only after consultant review (`research/plains-diorama.md` §7).

## Round 1 (done)

- [x] Answers recorded in `convo/convo v0.1.md`; decisions in `schematic.md` §7.
