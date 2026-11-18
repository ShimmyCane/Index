# Make 3D x Construct — To-do

Status key: `[ ]` open · `[~]` in progress · `[x]` done · `[?]` waiting on Jimmy

## Round 3: the Southern Cheyenne camp move (draft), reviews, consultation

- [x] Specific sample: a Southern Cheyenne camp move, 1870s, Indian Territory (48 objects, 8 flags, 5 open for consultation).
- [x] Story (`exhibit/story.json`): six steps, linked to objects, seven claims with sources or *scene choice*.
- [x] Consultation flag kind; display gate in the header and ⚙️ (blocked while any consultation flag is open).
- [x] Closing a consultation flag asks for a note (role and date; no personal names).
- [x] Review switches in ⚙️ (six items, each with who does it).
- [x] AI critic: prompt, paste, validated reply (A/B mapped to won or lost; scores 0–3).
- [x] AI fact-check of the story: prompt, paste, validated reply.
- [x] Scores selects when round scores are on; the stop rule needs scores.
- [x] `index_summary.html` (summarize-code convention).
- [x] Consultation plan, draft letter (not sent), research update §9.
- [x] `private/` is git-ignored by the root `.gitignore`: the tribes' written answers go there.
- [ ] Call the Cheyenne and Arapaho Tribes' Historic Preservation Office (Jimmy). Confirm the contact first.
- [ ] Send the draft letter (Jimmy). Nothing is sent by the page.
- [ ] Decide the public-repo question (convo v0.3 Q3).
- [ ] Apply `supabase/001_m3dxc_certainty.sql` (Jimmy copies it by hand).
- [ ] Device test on an iPad.

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
- [x] `summarize_code` page for `index.html` (`index_summary.html`).
- [x] Round scoring in the page (0–3 per criterion); the stop rule needs scores.
- [x] Model critic: a copy-and-paste loop (no server, no key).
- [ ] Cloud save of certainty to `m3dxc_certainty` (after the SQL is applied and tested).
- [ ] Replace the placeholder figures and horses only after the consultation (`research/consultation-plan.md`).

## Round 1 (done)

- [x] Answers recorded in `convo/convo v0.1.md`; decisions in `schematic.md` §7.
