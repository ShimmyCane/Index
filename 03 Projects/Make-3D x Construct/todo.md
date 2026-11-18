# Make 3D x Construct — To-do

Status key: `[ ]` open · `[~]` in progress · `[x]` done · `[?]` waiting on Jimmy

## V2 (round 7, 2026-11-18)

- [x] V1 archived: `archive/Oklahoma diorama V1/` (a copy of the round 6 state), commit `f8d87b8` kept in history; PR #195 closed unmerged. A git tag could not be pushed (the proxy refuses tags), so no tag.
- [x] Display gate removed (header pill, Display check panel, settings).
- [x] Loft geometry (`js/core/loft.js`), engine check, build fields, viewer, 7 tests.
- [x] Horses: lofted barrel, neck, mane, head, legs, tail.
- [x] People: lofted torso, head, neck, limbs, feet, skirts with a banded pattern; approximate general facial features (eyes, brows, nose, mouth, ears); no hair detail, no portraits.
- [x] Lighting: image-based room light, key, fill, soft shadows.
- [x] Homepage (`index.html`), studio (`studio.html`), library on this device, cloud client (`m3dxc_scenes`), sign-in with an existing account only, Supabase library vendored with its licence.
- [x] `supabase/002_m3dxc_scenes.sql` written with its rolled-back test; NOT applied (Jimmy copies it).
- [ ] Sign-in and cloud save tested live (needs a code from email).
- [ ] Device test on an iPad.
- [ ] Jimmy: skin tone (convo v0.7 Q1), lighting references (Q2), next density step (Q3).

## Round 6: planes, bones, posed figures (2026-11-18)

- [x] Three planes as groups: foreground, midground, background; detail by plane.
- [x] Bluff in four layers, lighter for distance, placed behind the lodges.
- [x] Struck cover (folded panels, fold strip, three poles, strap); travois loads (bundle, rolled hide, straps, pot).
- [x] Bones back: one skull with horns and three vertebrae, midground, on clear terrace.
- [x] People: torso, arms, hands, legs, feet, walking poses, skirt for women; no hair parts; no faces (see convo v0.6).
- [x] Lessons file for scene craft: `04 AI/3d_scene_craft_lessons.md`.
- [x] Close up starts from the oblique view.
- [ ] Jimmy's decision on faces (A generic camp, B keep faceless, C after review).
- [ ] Jimmy's decision on the display gate.
- [ ] Next density pass: choose the plane first (convo v0.6 Q3).

## Round 5: rollback and density (2026-11-18)

- [x] Rolled back the round 4 fillers (grass, scrub, stones, creek, cottonwoods, bones, goods). Layout is the round 3 layout.
- [x] Scale corrected to real sizes at 1 in = 2 ft (horses and people had been giants).
- [x] Lodges: cover, four leaning poles, door. Horses: barrel, neck, mane, head, muzzle, ears, tail, four legs. People: torso, arms, head, hair, skirt or legs.
- [x] Rotation in the engine (checked) and the viewer; Close up on any selected part.
- [x] Story v0.3 refers only to objects in the scene.
- [ ] Next density pass, only when asked: bluff, struck cover, travois loads.
- [ ] Your answers in `convo/convo v0.5.md`.

## Round 4: drawer, two panels, scene, story (2026-11-18)

- [x] Settings drawer: items keep their height, the drawer scrolls (touch too), room at the bottom for the gear.
- [x] Two panels: Selected part moved to the left column; the 3-D view is the right panel.
- [x] Scene: 388 parts, seeded layout, warm late sun with soft shadows, sky gradient, material colours with variation, creek and cottonwoods, bones on the terrace.
- [x] Colour modes: material (default), certainty, paper and ink; the button cycles.
- [x] Story v0.2: six steps, seven sources, two scene choices; bones and bone-trade claim (S6).
- [x] Summary page line numbers updated.
- [ ] Your answers in `convo/convo v0.4.md` (bones, lighting, public repo, next detail).
- [ ] Device test on an iPad.

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
