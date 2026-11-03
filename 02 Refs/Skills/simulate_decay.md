# Simulate decay: an object that changes over time, from physics and a story

Purpose
Build a small physical model of an object (a sheet of paper, a leaf, a piece of fruit, a wooden board, a metal part) that changes over a series of increments of time. Each increment is run from the one before, so the damage follows from the physics and the story. Review it in the 3-D viewer and in the Increment Viewer. The model is a particle-spring simulation, written in plain JavaScript with no build step.

Use this when the look needs to come from the material (folds, tears, damp, mould, dirt, burns), not from hand-placed shapes. For a model built from primitives, use `make_3d.md` instead.

Trigger
Jimmy can start it with a shorthand line, for example:
"Simulate. Growth/decay/collaboration. Object. Environment. Possible actions. Number of increments."
Map the words to the input below: Growth, decay or collaboration sets the kind of change (collaboration means objects affecting each other, to be confirmed); Object is the subject; Environment is the place and its rules; Possible actions are the decay types and events; Number of increments is the count (default 10).

Input
- Subject name and a one-line description (for example "one sheet of white paper").
- Number of increments (default 10).
- Environment: where it lives (outdoors, subway, damp room). Default: outdoors, marked as a placeholder.
- Decay types to include (creases, tears, damp, mould, dirt, burns, cuts, insects, and others).
- Realism target: a reference photo, a description, or "physical, not cartoon".

Process

1. **Ask first.** Before the questions, check the shorthand: if "collaboration" is used, ask whether it means objects affecting each other or several things happening at once. Always ask for a realism target (reference photos, or "physical, not cartoon"). Ask whether the Make 3D version lives in the Make 3D project's viewer or stays a standalone page opened from the Increment Viewer. Then ask the rest. Put four or five questions to Jimmy in one round before building: how the object moves between increments (tumble, fixed pose, both), the look (realistic or stylised), the method (simulation or hand-authored operations), the story (keep or re-plan), and which decay types. Record the answers in `03 Projects/<Project>/convo/convo v0.1.md`.
1b. **Sign-off on the rules.** Write the rules as understood in one short page in the convo file: the environment rules, what each increment does, how the object moves, what counts as done, and the known limits. Jimmy approves it before any building starts. If he changes something, update the page and ask again only for what changed.
2. **Research the real behaviour.** Web search for how the material folds, tears, takes water and grows mould. Write `04 AI/<Project>/research/<topic>.md` with the source for each fact. Mark design judgement separately from sourced facts.
3. **Model it** (`js/<name>_sim.js`, no DOM, Node-testable):
   - Particles on a grid at real size (inches). Springs: structural, shear, and bend (two cells apart).
   - Bend springs are plastic: past a yield, the rest length moves toward the bent length. This is what makes creases stay.
   - Springs break only where a tear or cut removes them. Tears break springs along a random walk from the edge; cuts are defined on the flat sheet (material coordinates) and break every spring that crosses the line, including the two-cell bend springs.
   - Self-contact between particles that are not close on the sheet, with friction at contact. Without friction, layers slide and a ball flattens.
   - Colliders: a floor, moving spheres (stamps, rollers), and containers (a ball being formed).
   - Fields per particle: wetness (spreads and softens), mould (grows where it stays wet), dirt (collects where particles crowd), burn (darkens and lifts the edge).
   - Seeded random numbers only. Same story and seed, same result.
   - Export: `cleanSheet`, `startSheet`, `runIncrement`, `toPieces`, `stats`, `tumble`, `storyHash`.
4. **Write the story as the record** (`js/<name>_story.js`): a seed and an ordered list of increments, each a list of operations. End an increment with a tumble if the object should move.
5. **Smoke-test before writing the story.** Settle the object on the floor; check for NaN; time the longest operation; print a bounding box; look at one frame. Tune one constant at a time and write down the value and why. If the target shape does not hold, a shell or container may be needed. Record that as a known limit.
6. **Checks** (`tests/test_<name>_sim.js`): piece counts after each cut; each decay removes what it should (tears, holes, burns); the object stands up where it should; determinism (two runs match); a different seed changes the result; the cache fingerprint changes with the story.
7. **Bake the frames** (`tools/bake.js`, writes `data/<name>_cache.js`). Use a `<script>` tag so it works from `file://`. The page uses the cache only when its fingerprint matches the story; otherwise it builds the increments live, one at a time, with a progress note.
8. **Page** (`<name>.html`): Three.js r160 vendored in `vendor/`. Drag to orbit, pinch and scroll to zoom, a slider, back, play once through (no loop), next. Re-centre the object on the origin after each increment. Test hooks on `window`.
9. **Renders.** Headless Chromium with `--use-gl=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`. Hide the page chrome, fix the camera, screenshot the canvas for each increment into `renders/`. Look at every frame by eye before calling it done.
10. **Increment Viewer.** Add `data/<name>.js` (items with image, description, changes, gaps) and one line in `data/sets.js`. Write the gaps honestly.
11. **Docs.** `schematic.md`, `CLAUDE.md` pointer, `04 AI/<Project>/brief.md`, `lessons.md`. Update the 03 and 04 indexes. Promote general lessons to `04 AI/lessons_pool.md` and `04 AI/patterns.md`.
12. **Git.** Work on the designated branch. Commit, push, open a draft PR. Merge only when Jimmy asks.

Rules
- Never call a result realistic without a comparison to real references. Say "looks like X; differs in Y" instead.
- List the known limits in the schematic, the brief, the convo and the PR. Do not leave them out to make it look finished.
- Keep every constant that was tuned by hand at the top of the engine file, with a comment.
- The story is the record. Frames, caches and renders are derived; rebuild them, never hand-edit them.
- Deterministic only: no `Math.random`, no wall-clock time in the model.
- Synthetic subjects only in a public repo.

Output
- The project folder (schematic, CLAUDE pointer, js, tests, tools, vendor, renders, data).
- The convo record and the research note.
- A short report: what the model does, what the checks showed, the known limits, and the open questions for Jimmy.
