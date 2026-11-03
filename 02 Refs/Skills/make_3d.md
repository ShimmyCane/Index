# Make 3D: from a concept, a photo or other assets

Purpose
Build a 3-D test model of a real or imagined object or scene, in small increments, and review each increment. The model is data (inches, Z up, a history of operations), built in the Make 3D project, and reviewed in the Increment Viewer. Use it for a car, a room, a piece of furniture, a garden, a concept sketch: anything that can be described as a few boxes, cylinders, spheres and cones, and checked by eye.

Input
- A subject name (for example "Honda CR-V test model") and a one-line description.
- A mode, chosen at the start:
  - **Research mode:** use outside sources (web search) for published sizes and proportions, plus anything given. Every figure is recorded with its source.
  - **Assets-only mode:** use only what is provided: photos, sketches, measurements, notes. No outside research. Anything not given is an estimate, labelled as one.
- Optional assets: photos, sketches, dimensions, reference links. Note what each one is for.
- Sketches are looked up in Quick Detail on every run (step 1). The source of each sketch used is recorded: project id, table, row id and name, and the query.
- Number of increments (default 5).
- Whether it moves: what moves, how (walk a path, swing, slide, spin, bob), and from where (hinge, hip, axle). Default: no motion.

Ask only what you cannot tell from the request: the mode, and whether any photo shows a real home or a real person.

Rules that always apply
- The repo is public. Photos of a real home, a real room, a real family or a real person go in a `private/` folder under the project and are never committed. Public files hold synthetic or public-spec numbers only. If unsure, ask before committing.
- Every size is labelled as an estimate unless it is measured or comes from a named published source.
- Research mode: record each source (title and link) next to the numbers it gave. Use figures, not copied images or text. Where sources disagree, say so and use the more official one.
- Assets-only mode: do not search the web. Say which dimensions were missing and what was assumed.
- Units are inches, Z is up, and the ground is z = 0. Each object's position is the centre of its box. Primitives are `group`, `box`, `cylinder`, `sphere`, `cone`.
- Older increments are never deleted. Each increment is an `if (v >= N)` block in one `defsFor(v)` function, so every version stays reproducible.
- Motion (optional) is a separate file, `motion.json` (`make3d.motion/0.1`), never part of the model. Every animation is a loop: one `loop_s`, each motion a whole number of `cycles` per loop, and paths close on themselves. The first frame is the rest pose. Autoplay runs the loop twice, then pauses.

Steps
1. **Intake.** First, look for a sketch in Quick Detail, every time, even when the request doesn't mention one:
   - Query the Architecture Supabase project (`xabgankckrcuhcgdolrg`), table `sketch_details`, for rows with the tag `make3d` (any letter case; the old `make 3-D` tag is retired) and `deleted_at is null`. Match the subject by name, and list the other matches so none is missed.
   - Record in the brief, under the subject: the sketch's name, its `sketch_details` id, the project id and table it came from, its `updated_at`, and how it was found (the query used). If nothing matches, say so in the brief and in the report, and ask for the sketch rather than inventing its shape.
   - If the sketch is stored in the database and the build needs its points, note the rows read, not the full point data, unless you copy them into the project's source (for example a `tools/<subject>.js` header), with the id in a comment.
   
   Then write the subject, mode, assets and privacy notes into `04 AI/Make 3D/brief.md` (create the subject section if needed). Put any private asset in `private/`.
2. **Research (research mode only).** Search for the official spec sheet first, then reviews or dimension sites to check it. Save the figures and sources to `04 AI/Make 3D/research/<subject-slug>.md`. For assets-only mode, write down the list of assets and what they give.
3. **Plan the increments.** Five by default, each with one goal:
   - V01 blockout: the overall envelope and the main sizes (length, width, height, positions of the big parts).
   - V02 to V04: the next layer of shape, detail and parts, one theme per increment.
   - V05 finish: the small items, and a check against the reference images.
   - Motion, if asked: its own last increment, after the shape is settled. Put each moving part in its own group, with the pivot (hinge, hip, shoulder, axle) written down.
   Write the goal and the planned changes for each increment before building.
4. **Build.** Create `03 Projects/Make 3D/tools/<subject-slug>.js` with `defsFor(v)` and `sceneFor(v)`, following `tools/honda_crv.js`. Add the scenes to `tools/scenes.js`, then run `node tools/build_samples.js`. Every step must pass the rules check. Then run `node tests/test_core.js`.
4b. **Motion (if asked).** Give the scene a `motion(uuid)` function that returns the motion file, following `tools/robot_banana.js` (kinds `path`, `swing`, `bob`, `slide`, `spin`; see the project `schematic.md` §14). Time repeated motions to each other (steps to walking speed), so nothing slides. `node tools/build_samples.js` checks it and writes `models/<id>/motion.json`. Add tests like `tests/test_motion.js`: the loop has no jump, the first frame is the rest pose, attached parts stay attached, nothing sinks into the ground. Then run `node tools/anim_check.js <dir outside the repo>` and look at frames at several times.
5. **Render.** Run `node tools/render_versions.js <screenshot dir outside the repo> "<Subject> V01" ...`. Look at each render. If an increment has a flaw, fix it in the next increment, not by editing the old one. Copy the chosen renders to `03 Projects/Make 3D/renders/<subject-slug>/vNN.png`.
6. **Review document.** Create `03 Projects/Increment Viewer/data/<subject-slug>.js` (copy the format in `schematic.md`). For each increment: what it is, what changed, what is still to fix, and the image path. Add the set to `03 Projects/Increment Viewer/data/sets.js`. Check that the drop-down shows it and that it loads.
7. **Record.** Update `04 AI/Make 3D/brief.md`. Log anything new in `04 AI/Make 3D/lessons.md`. If a lesson applies to every subject, add it to `04 AI/lessons_pool.md`.
8. **Publish.** Work on a branch, open a draft pull request, and merge only when Jimmy asks.

Report
- Mode used and what the sources or assets were.
- The increments, each with what changed and what is still open.
- Which numbers are estimates, and any that disagree between sources.
- If it moves: the loop length, what moves, and what was checked.
- Links: the pull request, and the review page (`viewer.html?set=<subject-slug>`).
- Anything that needs Jimmy's decision.
