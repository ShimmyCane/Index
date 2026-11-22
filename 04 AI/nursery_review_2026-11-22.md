# Nursery AI projects: metadata, lessons, and a best-practice comparison (2026-11-22)

Scope: the six projects in the **Nursery** section of `index.html` after Living Room Scene was removed on 2026-11-22 at Jimmy's request (its lessons are kept). Method: each project's `schematic.md`, `CLAUDE.md`, `04 AI/<Project>/brief.md` and `lessons.md`, the convo and git history, the SQL checked read-only against the Supabase Architecture and Family projects, and the READMEs of the ten linked repos (default branch, read on 2026-11-22). Nothing was run, installed, or changed in the projects beyond the corrections listed in §5.

**Not covered yet:** Jimmy asked for every repo on `index.html` (48 tiles; 42 are outside the Nursery). Those repos are outside this repo's GitHub scope, so they need `add_repo` access or Jimmy's go-ahead. See §6.

Status key (from `03 projects_schematic.md`): idea → MVP → device-tested → in use → graduated → retired.

---
## 1. Metadata per project

| Project | Track | Status (current, per schematic) | Purpose, in one line | Structure | Database | Checks in repo | Convo / commits | Device-tested? |
|---|---|---|---|---|---|---|---|---|
| **Drafting** | B | MVP 0.2 (2026-11-18) | Makes DXF blocks, `.LIN` line types and `.PAT` hatches for AutoCAD and Revit from library details, with a legibility linter and a DXF viewer | Plain JS, one page `index.html`, `js/` (writer, reader, linter, pipeline), `samples/` (synthetic), `tests/` | Architecture DB planned, owner only; no SQL in repo | 19 Node tests; ezdxf audit clean; headless at iPad and phone widths | 4 convo, 4 commits | No. Not opened in AutoCAD or Revit |
| **Make-3D x Construct** | B | **V2** (round 7, 2026-11-18). Latest in the folder; no separate repo applies | A Southern Cheyenne camp move in the 1870s, built with Construct's method (checks with fix hints, certainty per fact, flags, defect ledger). Draft only; display waits for consultation | `index.html`, `studio.html`, `index_summary.html`, `js/core` (model, rounds, review, loft), `js/library`, `js/cloud`, `js/viewer`, vendored three.js and supabase.js, `samples/`, `worlds/`, `exhibit/`, `tests/` (6 files), `tools/`, `research/`, `archive/` (an earlier copy, kept at Jimmy's request) | `m3dxc_certainty` and `m3dxc_scenes` **applied** (checked 2026-11-22) | 43 Node tests (brief; the AI index says 33) | 7 convo, 10 commits | No |
| **Mind Palace** | A | **0.3.1** (2026-11-18). Latest in the folder; no separate repo applies | A memory palace to walk through, one per family member: memories as objects in rooms, search, two kinds of recall practice, a Gaussian-splat view | `index.html` (Build page), `splat.html`, `css/`, `js/` (three layers: `model.js` database, `layout.js` scene, `view.js` renderer), `build.html`, `godot/` (written, never run), `tools/` | Device storage only; family sync planned, nothing written | 54 headless checks at phone and tablet widths | 5 convo, 6 commits | No. Not yet tried on an iPad |
| **Salmon Leap** | B | V1 to V5 built; V10 and V15 planned | A bronze statue of a leaping Atlantic salmon, built in five cumulative versions | `index.html`, `js/core` (loft, model), `js/viewer`, `tools/` (parts, build), `samples/` (five versions), `research/`, `tests/test_versions.js` | None | Part-count audit per version; no dropped parts | 2 convo, 2 commits | No |
| **Athena's Piano Companion** | A | 0.2.0 (2026-11-21); 0.1.0 used on an iPad | A hands-free recorder for free piano play: voice or tap start and stop, library, browse with a recycle bin, four-layer compose | Six pages (`index`, `record`, `player`, `library`, `browse`, `compose`), five CSS files, 19 JS files | SQL 001 and 002 **applied** (002 checked 2026-11-22) | Headless tests; SQL test and verify files | 6 convo, 6 commits | Partly. 0.1.0 on a real iPad; 0.2.0 headless only |
| **QC keynotes** | B | v0.2.0, four steps built; notes box built | First-pass check of keynote notes against a guideline (green, yellow, red), with a marked-up PDF export and a CSV | `index.html`, `js/` (core, guideline, scan, markup, feedback, config), vendored pdf.js 3.11.174 and pdf-lib 1.17.1, `test/` (smoke test and synthetic generator), `samples/` | `qk_notes` **applied** (checked 2026-11-22; 7 rows) | `test/smoke.js` headless on synthetic data: 4 green, 5 yellow, 4 red | 4 convo, 8 commits | No. No real drawing set yet |

Common structure across all six: `CLAUDE.md` pointer, `schematic.md`, `convo/` (one file per round), a brief and lessons in `04 AI/`, plain HTML, CSS and JS with no build step, vendored libraries, synthetic samples, and Node tests. Migrations are numbered (`001_`, `002_`), and two projects also have `test_` and `verify_` files beside them.

---

## 2. What the audit found

1. **Device testing is the real gap.** Five of the six projects are "headless-tested, not device-tested." Athena's 0.1.0 was the only one used on an iPad, and that test found real faults: a browser cache served an old script, the microphone heard the count-in and the piano, and the stop phrase leaked into the take. Headless checks missed all of them.
2. **No nursery SQL is pending.** My first pass said four projects had SQL not applied. That was wrong: the schematics were stale. The read-only check shows Make-3D x Construct's two tables, Athena's 002 objects (`pc_sessions`, `deleted_at`, `session_id`) and QC keynotes' `qk_notes` (7 rows) are all live, and Jimmy confirmed he had pasted them. Still open: Mind Palace's family sync is planned and not written, and Drafting has no SQL in the repo. Generate Clouds (`gc_notes`) is not applied, but it is outside the Nursery section.
3. **Status drift.** Make-3D x Construct and Mind Palace had several version strings each. Resolved on 2026-11-22: the latest version in the folder applies (no separate graduated repo for either), so they are V2 and 0.3.1, and their briefs and the AI index now match. The other projects still need a status line checked against their version files.
4. **Archive copy.** `Make-3D x Construct/archive/Oklahoma diorama V1/` is kept, at Jimmy's request. It breaks the root "no copy folders" rule, so the schematic should say why it is there.
5. **Living Room Scene removed** from the nursery, the home page tile, and the folder (in git history). `04 AI/Living Room Scene/lessons.md` is kept.
6. **Privacy.** Convo files are public. The QC keynotes and Drafting schematics say client drawings are never committed. Keep that rule and check the convo files before any graduation.

---

## 3. General lessons learned

Each lesson is marked **new** (not yet in `04 AI/lessons_pool.md`) or **in pool** (already there, cited).

1. **Test the rendered page, not only the engine.** Make-3D x Construct's 43 engine tests passed while the viewer was blank: the render was never called after the model loaded. A headless screenshot after each change caught it. *(New as a general rule; the project lesson is in `Make-3D x Construct/lessons.md`.)*
2. **A rule that never fires is not a test.** Drafting's 80% warning passed for a while with no warning reaching it. A constructed case with known deductions (exactly 75%) was the only real proof. *(New.)*
3. **Refuse, do not half-apply.** Make-3D x Construct replays every edit before it is saved. A refused edit shows its fix hint and changes nothing. AI replies are checked against known ids before anything is applied. *(New as a pool entry.)*
4. **Keep the verified and judgment split in every brief.** Each brief lists what was checked and what was not. This is the best habit in the set. *(In pool §1, item 3.)*
5. **One status line per project, tied to the version file.** Drift like the cases above happens within days. *(New.)*
6. **Render, compare, keep every version.** Living Room Scene and Salmon Leap both build a new file per version, never overwrite, and check each render against the reference. Salmon Leap's test checks that no part is dropped between versions. *(In pool: "Model iteration".)*
7. **Keep an "applied / written / not applied" line for every migration** in the schematic, and never edit an applied file. *(In pool §6 and item 18. Extend it with the fallback each page uses while the SQL is not applied.)*
8. **Sound for music: turn off echo cancellation, noise suppression and auto gain** in `getUserMedia`. They distort piano notes. The count-in leaks into the take through the speaker. *(New.)*
9. **Cache-bust when a device runs an old build.** Athena's iPad ran a cached script. *(In pool §8, item 3. Add a visible version stamp on each page so a tester can see which build is running.)*
10. **Check the dark mode and text contrast before shipping.** *(In pool item 20. No project currently runs a contrast check; see §4.)*

---

## 4. Comparison with the ten linked repos

Evidence note: this comes from the READMEs only. None was installed or run. The benchmark figures are self-reported by each repo, and several say their sample is small. The star counts are from the list you gave.

| Repo (stars) | What it does | Evidence, as the repo states it | Relevance to the seven | Verdict |
|---|---|---|---|---|
| **codeswithroh/tastemaker** (562) | Generates a palette per project and checks every pairing with a WCAG contrast matrix. Reads colours from reference pixels. Keeps a decisions log. | The contrast maths is a computation. Taste is labelled as judgment, not proof. | High for pastel kids' UIs, where low contrast is the common fault. None of the seven runs a contrast check. | **Adopt the contrast check** (a small script or a smoke-test line). Skip the generator. |
| **dembrandt/dembrandt-skills** (197) | 45 UX and design-system skills. Lists six control states (rest, hover, active, focus, disabled, loading). Pulls tokens from a live site. | Skills are instructions; no measurements given. | Medium. Our smoke test checks touch and layout, not control states. | **Consider** the six-state checklist. Skip the 45-skill install and the live-site extraction. |
| **fatihaydost/brand-identity-skill** (424) | Builds logo, type and palette from one brief. Gates (contrast, licence, glyph coverage, file validity) stop the set; warnings are labelled as heuristics. | "The agent designs; the scripts measure." | Low to medium. Relevant only to future family look and kit work. | **Consider** the gate-versus-warning split. Skip the skill. |
| **bitjaru/styleseed** (1,023) | 74 craft rules and 22 workflows. Render, score, revise loop. | Self-reported: +5.3 points over 120 rendered cells. Rules alone were inconsistent (Codex +1.6, Claude Code −3.7). The author lists component-context tests and human evaluation as next steps, not done. | High in principle. It supports our render-and-check loop, which we already use. | **Adopt the principle** (enforce, then re-check). Skip the 22-workflow install; it overlaps our process. |
| **AThevon/genjutsu** (826) | Skills for animation, site building, and a static design and motion audit. | The author says tests are small (one brief, two to six runs) and graded by their own model. | Low to medium. Could check Salmon Leap and Athena's Compose motion. | **Consider** a trial of the static audit on one page. Do not rely on its benchmarks. |
| **charlie947/motion-graphics-skills** (756) | 15 skills for launch videos, animated charts and reels, written as code. | Not stated. | Low. Our outputs are interactive pages, not video. | **Skip** for now. |
| **Moh4696/open-3d-skills** (451) | three.js scenes, exploded views, cursor rigs, `site-check`, `frame-capture`. Some skills need an image or video generation service. | Not stated. | Medium for Make-3D x Construct and Salmon Leap: exploded views show internal parts; frame capture checks loops. | **Consider** the exploded-view and frame-capture ideas. Skip the image-generation skills (keys, cost, privacy). |
| **cloveric/claude-drawing-skill** (333) | Draws with code (numpy, Pillow) and no image model. 83 styles. | Not stated. | Low. Our illustration stack is SVG and three.js, and this makes raster PNG. | **Skip.** Its "no image model" stance matches ours. |
| **camilleroux/genart-skill** (168) | Generative art practice: hash-seeded determinism, trait tables, checks that a sketch repeats. | Honest about limits: it claims only same-machine reproducibility, not cross-machine. | Medium. Our generated samples (Drafting, Make-3D) and puzzle seeds elsewhere. | **Adopt the honesty rule:** say which determinism is verified. Skip the art-specific parts. |
| **isas1/forever-ai-components** (141, yours) | 600+ single-file animated components. `agents.json` and `llms.txt` for coding agents. Quality gates: touch-only components need a fallback, mobile needs a light performance tier, `needs-review` is excluded. | Structure and gates are documented. | High for iPad work. The gates match our rules (touch fallback, performance on phones). | **Adopt the gates** as a smoke-test checklist. **Consider** `llms.txt` at each public project root so agents find the schematic. |

**Do these bring benefits?** Yes, in three cheap places: a WCAG contrast check (tastemaker), the six control states (dembrandt), and the iPad and mobile gates (forever-ai-components). The larger suites (45 skills, 22 workflows, 74 rules) mostly repeat what we already do: render, check, state what is verified. Their numbers are self-reported and small, so treat them as hypotheses to test on one of our pages, not as proof. The biggest improvement available is still device testing (§2, item 1), which none of these repos replaces.

Changes to `02 Refs/Skills/smoke_test.md` (adding a contrast check and the six control states) are Jimmy's to make, since `02 Refs/` is edited only when he asks.

---

## 5. Decisions and changes from Jimmy's answers (2026-11-22)

1. **Archive kept** (`Make-3D x Construct/archive/`).
2. **Versions:** the latest version in the folder applies when there is no separate repo. Make-3D x Construct is V2; Mind Palace is 0.3.1. Briefs and the AI index updated.
3. **Living Room Scene removed:** tile removed from `index.html`, folder deleted (in git history), `lessons.md` kept with a note, `brief.md` deleted (its version log is in git history). Both schematics updated.
4. **SQL:** checked read-only against the live projects; all nursery SQL is applied. Stale "not applied" lines fixed in the schematics, CLAUDE.md, todo and briefs. Convo files left as history.
5. **Skills:** six most-used skills moved to `04 AI/Skills/`, with an index there: smoke_test (now with a WCAG contrast check and a six-state control check), summarize_code, supabase_project, supabase_link, game_controls, settings_gear. `02 Refs/Skills/` keeps a stub for each. Wrappers and the root `CLAUDE.md` now point to the working copies. No new skills were created.
6. **Monthly re-run:** added to `04 AI/ai_task_tracker.md` as a to-do. **Not scheduled**, because the scheduling request was denied.
7. **Commit language:** Jimmy is fine with the model name in commit trailers, so future commits use `Co-Authored-By: Claude Haiku 5.5`. The earlier commit (`f00d0f9`) keeps its generic trailer.

---

## 6. Open items

1. **All tiles on `index.html`.** Links for all 48 are now in §7. Reading the 42 repos' contents still needs `add_repo` (read access) because they are outside this repo's GitHub scope. Want me to attach them and review each, or only the ones you name?
2. **Device test:** which project gets an iPad check first? Athena's 0.2.0 has three open notes waiting for your go.
3. **Smoke-test changes:** the contrast and control-state steps are in the working copy `04 AI/Skills/smoke_test.md`. Nothing has been run against a real page yet; the first run should be on one Nursery project.

---

## 7. Links to every tile on index.html

Repo links are `github.com/ShimmyCane/<name>`. Nursery and folder-only tiles link to their folder in this repo on `main`. The live page is the GitHub Pages address from the tile. Rows marked "not checked" have a repo name taken from the Pages address; the repo was not opened to confirm it.

| Section | Project | Repo | Live page | Note |
|---|---|---|---|---|
| Games | Snake Cube | <https://github.com/ShimmyCane/Snake-Cube> | <https://shimmycane.github.io/Snake-Cube/> | Repo name derived from the Pages address; not checked |
| Games | Felix Checkers | <https://github.com/ShimmyCane/Felix-Checkers> | <https://shimmycane.github.io/Felix-Checkers/> | Repo name derived from the Pages address; not checked |
| Games | Moment | <https://github.com/ShimmyCane/Moment> | <https://shimmycane.github.io/Moment/> | Repo name derived from the Pages address; not checked |
| Games | Expansion Wars | <https://github.com/ShimmyCane/Expansion-Wars> | <https://shimmycane.github.io/Expansion-Wars/> |  |
| Games | Fishes | <https://github.com/ShimmyCane/Fishes> | <https://shimmycane.github.io/Fishes/> |  |
| Games | Felix Maze | <https://github.com/ShimmyCane/Felix-Maze> | <https://shimmycane.github.io/Felix-Maze/> |  |
| Games | Athena's World | <https://github.com/ShimmyCane/Athena-s-world> | <https://shimmycane.github.io/Athena-s-world/> |  |
| Games | Ole Bar Glide | <https://github.com/ShimmyCane/Bar-Glide> | <https://shimmycane.github.io/Bar-Glide/> |  |
| Games | Adventure | <https://github.com/ShimmyCane/Adventure> | <https://shimmycane.github.io/Adventure/> | Repo name derived from the Pages address; not checked |
| Games | Felix Gear Wars | <https://github.com/ShimmyCane/Felix-Gear-Wars> | <https://shimmycane.github.io/Felix-Gear-Wars/> | Repo name derived from the Pages address; not checked |
| Games | Paper Airplanes x A-10 Warthog | <https://github.com/ShimmyCane/Paper-Airplanes-x-A-10-Warthog> | <https://shimmycane.github.io/Paper-Airplanes-x-A-10-Warthog/> | Repo name derived from the Pages address; not checked |
| Games | StoryTime | <https://github.com/ShimmyCane/StoryTime> | <https://shimmycane.github.io/StoryTime/> | Repo name derived from the Pages address; not checked |
| Games | Rhythm Sticks | <https://github.com/ShimmyCane/Rhythm-Sticks> | <https://shimmycane.github.io/Rhythm-Sticks/> |  |
| Games | Generate Clouds | <https://github.com/ShimmyCane/Generate-Clouds> | <https://shimmycane.github.io/Generate-Clouds/> | Repo name derived from the Pages address; not checked |
| Learning | Test Bank | <https://github.com/ShimmyCane/Test-Bank> | <https://shimmycane.github.io/Test-Bank/> | Repo name derived from the Pages address; not checked |
| Learning | Multiply | <https://github.com/ShimmyCane/Multiply> | <https://shimmycane.github.io/Multiply/> | Repo name derived from the Pages address; not checked |
| Learning | Roman Numerals | <https://github.com/ShimmyCane/Roman-Numerals> | <https://shimmycane.github.io/Roman-Numerals/> | Repo name derived from the Pages address; not checked |
| Learning | Exponents | <https://github.com/ShimmyCane/Exponents> | <https://shimmycane.github.io/Exponents/> | Repo name derived from the Pages address; not checked |
| Learning | Primes | <https://github.com/ShimmyCane/Primes> | <https://shimmycane.github.io/Primes/> | Repo name derived from the Pages address; not checked |
| Learning | Coins | <https://github.com/ShimmyCane/Coins> | <https://shimmycane.github.io/Coins/> | Repo name derived from the Pages address; not checked |
| Learning | Row Boat | <https://github.com/ShimmyCane/Row-Boat> | <https://shimmycane.github.io/Row-Boat/> | Repo name derived from the Pages address; not checked |
| Learning | Speech Therapy | <https://github.com/ShimmyCane/Speech-Therapy> | <https://shimmycane.github.io/Speech-Therapy/> | Repo name derived from the Pages address; not checked |
| Learning | Chinese Character Sudoku | <https://github.com/ShimmyCane/Chinese-Character-Sudoku> | <https://shimmycane.github.io/Chinese-Character-Sudoku/> |  |
| Learning | Voice | <https://github.com/ShimmyCane/Voice> | <https://shimmycane.github.io/Voice/> |  |
| Learning | Learning to Draw | <https://github.com/ShimmyCane/Learning-to-Draw> | <https://shimmycane.github.io/Learning-to-Draw/> | Repo name derived from the Pages address; not checked |
| Learning | Learning Kangaroo | <https://github.com/ShimmyCane/Learning-Kangaroo> | <https://shimmycane.github.io/Learning-Kangaroo/> | Repo name derived from the Pages address; not checked |
| Learning | Chinese Character Strokes | <https://github.com/ShimmyCane/Chinese-Character-Strokes> | <https://shimmycane.github.io/Chinese-Character-Strokes/> | Repo name derived from the Pages address; not checked |
| Family | Family Habits | <https://github.com/ShimmyCane/Family-Habits> | <https://shimmycane.github.io/Family-Habits/> | Repo name derived from the Pages address; not checked |
| Family | Allowances | <https://github.com/ShimmyCane/Allowances> | <https://shimmycane.github.io/Allowances/> | Repo name derived from the Pages address; not checked |
| Family | How Far Is It? | <https://github.com/ShimmyCane/How-Far-Is-It> | <https://shimmycane.github.io/How-Far-Is-It/> | Repo name derived from the Pages address; not checked |
| Family | What to Cook | <https://github.com/ShimmyCane/What-to-Cook> | <https://shimmycane.github.io/What-to-Cook/> |  |
| Family | Better Parenting | <https://github.com/ShimmyCane/Better-Parenting> | <https://shimmycane.github.io/Better-Parenting/> | Repo name derived from the Pages address; not checked |
| Family | Our Family Compass | <https://github.com/ShimmyCane/Our-Family-Compass> | <https://shimmycane.github.io/Our-Family-Compass/> | Repo name derived from the Pages address; not checked |
| Architecture | Detail Library | <https://github.com/ShimmyCane/Detail-Library> | <https://shimmycane.github.io/Detail-Library/> | Repo name derived from the Pages address; not checked |
| Architecture | Quick Detail | <https://github.com/ShimmyCane/Quick-Detail> | <https://shimmycane.github.io/Quick-Detail/> | Repo name derived from the Pages address; not checked |
| Architecture | Proposal Drafter | <https://github.com/ShimmyCane/Proposal_Drafter> | <https://shimmycane.github.io/Proposal_Drafter/> | Repo name derived from the Pages address; not checked |
| Architecture | Shimmy Specs | <https://github.com/ShimmyCane/Index/tree/main/03%20Projects/Shimmy%20Specs> | <https://shimmycane.github.io/Index/03%20Projects/Shimmy%20Specs/> | Folder in this repo; not a Nursery tile |
| Architecture | Growth | <https://github.com/ShimmyCane/Growth> | <https://shimmycane.github.io/Growth/> |  |
| Architecture | Make 3D | <https://github.com/ShimmyCane/Make-3D> | <https://shimmycane.github.io/Make-3D/> |  |
| Architecture | Increment Viewer | <https://github.com/ShimmyCane/Increment-Viewer> | <https://shimmycane.github.io/Increment-Viewer/> |  |
| Architecture | Critique Detail | <https://github.com/ShimmyCane/Critique-Detail> | <https://shimmycane.github.io/Critique-Detail/> | Repo name derived from the Pages address; not checked |
| Architecture | Map Photos | <https://github.com/ShimmyCane/Map-Photos> | <https://shimmycane.github.io/Map-Photos/> | Repo name derived from the Pages address; not checked |
| Nursery | Drafting | <https://github.com/ShimmyCane/Index/tree/main/03%20Projects/Drafting> | <https://shimmycane.github.io/Index/03%20Projects/Drafting/> | Nursery folder (no repo of its own yet) |
| Nursery | Make 3D x Construct | <https://github.com/ShimmyCane/Index/tree/main/03%20Projects/Make-3D%20x%20Construct> | <https://shimmycane.github.io/Index/03%20Projects/Make-3D%20x%20Construct/> | Nursery folder (no repo of its own yet) |
| Nursery | Mind Palace | <https://github.com/ShimmyCane/Index/tree/main/03%20Projects/Mind%20Palace> | <https://shimmycane.github.io/Index/03%20Projects/Mind%20Palace/> | Nursery folder (no repo of its own yet) |
| Nursery | Salmon Leap | <https://github.com/ShimmyCane/Index/tree/main/03%20Projects/Salmon%20Leap> | <https://shimmycane.github.io/Index/03%20Projects/Salmon%20Leap/> | Nursery folder (no repo of its own yet) |
| Nursery | Athena's Piano Companion | <https://github.com/ShimmyCane/Index/tree/main/03%20Projects/Athena%27s%20Piano%20Companion> | <https://shimmycane.github.io/Index/03%20Projects/Athena%27s%20Piano%20Companion/> | Nursery folder (no repo of its own yet) |
| Nursery | QC keynotes | <https://github.com/ShimmyCane/Index/tree/main/03%20Projects/QC%20keynotes> | <https://shimmycane.github.io/Index/03%20Projects/QC%20keynotes/> | Nursery folder (no repo of its own yet) |
