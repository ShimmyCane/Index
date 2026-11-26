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
2. **No nursery SQL is pending.** My first pass said four projects had SQL not applied. That was wrong: the schematics were stale. The read-only check shows Make-3D x Construct's two tables, Athena's 002 objects (`pc_sessions`, `deleted_at`, `session_id`) and QC keynotes' `qk_notes` (7 rows) are all live, and Jimmy confirmed he had pasted them. Still open: Mind Palace's family sync is planned and not written, and Drafting has no SQL in the repo. Generate Clouds' `gc_notes` is live (28 rows, Architecture project); an earlier line in the Supabase brief said not applied, and a later line in the same brief corrects it.
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

1. **All tiles reviewed.** The 41 separate repos were read (shallow anonymous clones in `/home/user/shimmycane/`; nothing pushed or changed). Shimmy Specs is a folder in this repo. Results are in §8 and §9.
2. **Device test:** not needed for now (per Jimmy, 2026-11-22).
3. **Smoke-test changes:** the contrast and control-state steps are in the working copy `04 AI/Skills/smoke_test.md`. Nothing has been run against a real page yet.
4. **Family project, `approve_allowance_withdrawal`:** it only checks that someone is signed in, so any signed-in user can approve a withdrawal and write a transaction. Restrict it to the owner or parent. This is a database change, so it needs your go-ahead.
5. **Architecture auth:** leaked-password protection is off, and sign-ups are open (see §9). Turn on the first; decide on the second.
6. **Allowances SQL:** the repo's SQL creates `children`, `parents`, `transactions` and `withdrawal_requests`, none of which are live. The Family project has `allowance_*` tables instead. Confirm which SQL is current.
7. **Privacy check in public repos:** `speech-therapy` states a child's age, `learning-kangaroo` names children with grade levels, `map-photos` mentions a campus walk, `proposal_drafter` may hold studio client material, and `adventure` holds family story content (the 2026-11-03 review asked whether it belongs in a private repo).
8. **Stale schematics:** several say "not applied" or give an old status (§8). Fix them in each repo, which needs a push to that repo; I have read access only.

---

## 7. Links to every tile on index.html

Repo links are `github.com/ShimmyCane/<name>`. Nursery and folder-only tiles link to their folder in this repo on `main`. The live page is the GitHub Pages address from the tile. All 41 repo names were confirmed by a clone on 2026-11-22.

| Section | Project | Repo | Live page | Note |
|---|---|---|---|---|
| Games | Snake Cube | <https://github.com/ShimmyCane/Snake-Cube> | <https://shimmycane.github.io/Snake-Cube/> | |
| Games | Felix Checkers | <https://github.com/ShimmyCane/Felix-Checkers> | <https://shimmycane.github.io/Felix-Checkers/> | |
| Games | Moment | <https://github.com/ShimmyCane/Moment> | <https://shimmycane.github.io/Moment/> | |
| Games | Expansion Wars | <https://github.com/ShimmyCane/Expansion-Wars> | <https://shimmycane.github.io/Expansion-Wars/> |  |
| Games | Fishes | <https://github.com/ShimmyCane/Fishes> | <https://shimmycane.github.io/Fishes/> |  |
| Games | Felix Maze | <https://github.com/ShimmyCane/Felix-Maze> | <https://shimmycane.github.io/Felix-Maze/> |  |
| Games | Athena's World | <https://github.com/ShimmyCane/Athena-s-world> | <https://shimmycane.github.io/Athena-s-world/> |  |
| Games | Ole Bar Glide | <https://github.com/ShimmyCane/Bar-Glide> | <https://shimmycane.github.io/Bar-Glide/> |  |
| Games | Adventure | <https://github.com/ShimmyCane/Adventure> | <https://shimmycane.github.io/Adventure/> | |
| Games | Felix Gear Wars | <https://github.com/ShimmyCane/Felix-Gear-Wars> | <https://shimmycane.github.io/Felix-Gear-Wars/> | |
| Games | Paper Airplanes x A-10 Warthog | <https://github.com/ShimmyCane/Paper-Airplanes-x-A-10-Warthog> | <https://shimmycane.github.io/Paper-Airplanes-x-A-10-Warthog/> | |
| Games | StoryTime | <https://github.com/ShimmyCane/StoryTime> | <https://shimmycane.github.io/StoryTime/> | |
| Games | Rhythm Sticks | <https://github.com/ShimmyCane/Rhythm-Sticks> | <https://shimmycane.github.io/Rhythm-Sticks/> |  |
| Games | Generate Clouds | <https://github.com/ShimmyCane/Generate-Clouds> | <https://shimmycane.github.io/Generate-Clouds/> | |
| Learning | Test Bank | <https://github.com/ShimmyCane/Test-Bank> | <https://shimmycane.github.io/Test-Bank/> | |
| Learning | Multiply | <https://github.com/ShimmyCane/Multiply> | <https://shimmycane.github.io/Multiply/> | |
| Learning | Roman Numerals | <https://github.com/ShimmyCane/Roman-Numerals> | <https://shimmycane.github.io/Roman-Numerals/> | |
| Learning | Exponents | <https://github.com/ShimmyCane/Exponents> | <https://shimmycane.github.io/Exponents/> | |
| Learning | Primes | <https://github.com/ShimmyCane/Primes> | <https://shimmycane.github.io/Primes/> | |
| Learning | Coins | <https://github.com/ShimmyCane/Coins> | <https://shimmycane.github.io/Coins/> | |
| Learning | Row Boat | <https://github.com/ShimmyCane/Row-Boat> | <https://shimmycane.github.io/Row-Boat/> | |
| Learning | Speech Therapy | <https://github.com/ShimmyCane/Speech-Therapy> | <https://shimmycane.github.io/Speech-Therapy/> | |
| Learning | Chinese Character Sudoku | <https://github.com/ShimmyCane/Chinese-Character-Sudoku> | <https://shimmycane.github.io/Chinese-Character-Sudoku/> |  |
| Learning | Voice | <https://github.com/ShimmyCane/Voice> | <https://shimmycane.github.io/Voice/> |  |
| Learning | Learning to Draw | <https://github.com/ShimmyCane/Learning-to-Draw> | <https://shimmycane.github.io/Learning-to-Draw/> | |
| Learning | Learning Kangaroo | <https://github.com/ShimmyCane/Learning-Kangaroo> | <https://shimmycane.github.io/Learning-Kangaroo/> | |
| Learning | Chinese Character Strokes | <https://github.com/ShimmyCane/Chinese-Character-Strokes> | <https://shimmycane.github.io/Chinese-Character-Strokes/> | |
| Family | Family Habits | <https://github.com/ShimmyCane/Family-Habits> | <https://shimmycane.github.io/Family-Habits/> | |
| Family | Allowances | <https://github.com/ShimmyCane/Allowances> | <https://shimmycane.github.io/Allowances/> | |
| Family | How Far Is It? | <https://github.com/ShimmyCane/How-Far-Is-It> | <https://shimmycane.github.io/How-Far-Is-It/> | |
| Family | What to Cook | <https://github.com/ShimmyCane/What-to-Cook> | <https://shimmycane.github.io/What-to-Cook/> |  |
| Family | Better Parenting | <https://github.com/ShimmyCane/Better-Parenting> | <https://shimmycane.github.io/Better-Parenting/> | |
| Family | Our Family Compass | <https://github.com/ShimmyCane/Our-Family-Compass> | <https://shimmycane.github.io/Our-Family-Compass/> | |
| Architecture | Detail Library | <https://github.com/ShimmyCane/Detail-Library> | <https://shimmycane.github.io/Detail-Library/> | |
| Architecture | Quick Detail | <https://github.com/ShimmyCane/Quick-Detail> | <https://shimmycane.github.io/Quick-Detail/> | |
| Architecture | Proposal Drafter | <https://github.com/ShimmyCane/Proposal_Drafter> | <https://shimmycane.github.io/Proposal_Drafter/> | |
| Architecture | Shimmy Specs | <https://github.com/ShimmyCane/Index/tree/main/03%20Projects/Shimmy%20Specs> | <https://shimmycane.github.io/Index/03%20Projects/Shimmy%20Specs/> | Folder in this repo; not a Nursery tile |
| Architecture | Growth | <https://github.com/ShimmyCane/Growth> | <https://shimmycane.github.io/Growth/> |  |
| Architecture | Make 3D | <https://github.com/ShimmyCane/Make-3D> | <https://shimmycane.github.io/Make-3D/> |  |
| Architecture | Increment Viewer | <https://github.com/ShimmyCane/Increment-Viewer> | <https://shimmycane.github.io/Increment-Viewer/> |  |
| Architecture | Critique Detail | <https://github.com/ShimmyCane/Critique-Detail> | <https://shimmycane.github.io/Critique-Detail/> | |
| Architecture | Map Photos | <https://github.com/ShimmyCane/Map-Photos> | <https://shimmycane.github.io/Map-Photos/> | |
| Nursery | Drafting | <https://github.com/ShimmyCane/Index/tree/main/03%20Projects/Drafting> | <https://shimmycane.github.io/Index/03%20Projects/Drafting/> | Nursery folder (no repo of its own yet) |
| Nursery | Make 3D x Construct | <https://github.com/ShimmyCane/Index/tree/main/03%20Projects/Make-3D%20x%20Construct> | <https://shimmycane.github.io/Index/03%20Projects/Make-3D%20x%20Construct/> | Nursery folder (no repo of its own yet) |
| Nursery | Mind Palace | <https://github.com/ShimmyCane/Index/tree/main/03%20Projects/Mind%20Palace> | <https://shimmycane.github.io/Index/03%20Projects/Mind%20Palace/> | Nursery folder (no repo of its own yet) |
| Nursery | Salmon Leap | <https://github.com/ShimmyCane/Index/tree/main/03%20Projects/Salmon%20Leap> | <https://shimmycane.github.io/Index/03%20Projects/Salmon%20Leap/> | Nursery folder (no repo of its own yet) |
| Nursery | Athena's Piano Companion | <https://github.com/ShimmyCane/Index/tree/main/03%20Projects/Athena%27s%20Piano%20Companion> | <https://shimmycane.github.io/Index/03%20Projects/Athena%27s%20Piano%20Companion/> | Nursery folder (no repo of its own yet) |
| Nursery | QC keynotes | <https://github.com/ShimmyCane/Index/tree/main/03%20Projects/QC%20keynotes> | <https://shimmycane.github.io/Index/03%20Projects/QC%20keynotes/> | Nursery folder (no repo of its own yet) |


---

## 8. All tiles: metadata (41 repos plus Shimmy Specs)

From shallow clones of each repo (default branch, read on 2026-11-22). "Live" means the table exists in the Family or Architecture project (read-only check). Status is what each repo states; "not stated" means it has no schematic status line. The Nursery six are in §1.

| Section | Project | Repo | Last commit | Status (as stated) | Purpose | Files | Database (SQL, live check) | Tests / convo | Flags |
|---|---|---|---|---|---|---|---|---|---|
| Games | Snake Cube | [snake-cube](https://github.com/ShimmyCane/snake-cube) | 2026-11-21 | Version 4.1.0 (page title); no schematic | Felix's snake-cube puzzle with a map builder | 65 files; process, lessons and map-builder pages | None in repo; uses Family `snake_maps` and `snake_highscores` (live) | 8 test files; no convo | — |
| Games | Felix Checkers | [felix-checkers](https://github.com/ShimmyCane/felix-checkers) | 2026-11-03 | Idea (schematic is the first prompt) | Checkers in the browser; later, chess pieces on light squares with new rules | 15 files | None | No convo | Schematic is a prompt, not a design |
| Games | Moment | [moment](https://github.com/ShimmyCane/moment) | 2026-11-08 | Not stated | Family-play companion: short Mario-Party-style moments for downtime | 30 files; index, game and end pages | 9 SQL files; 6 of 7 tables live; `project_notes` **not live** | No convo | Table not applied |
| Games | Expansion Wars | [expansion-wars](https://github.com/ShimmyCane/expansion-wars) | 2026-11-09 | MVP, not device-tested | iPad strategy game: maps, replays, worlds | 155 files | 8 SQL files; all 4 tables live (`xw_*`) | 7 tests; 21 convo | — |
| Games | Fishes | [fishes](https://github.com/ShimmyCane/fishes) | 2026-11-21 | MVP, not device-tested | Fish game with AI notes | 34 files | 4 SQL files; tables live | 6 convo | — |
| Games | Felix Maze | [felix-maze](https://github.com/ShimmyCane/felix-maze) | 2026-11-09 | Bank restarted in batch 10; not printed or tried | Solution-first maze puzzles, printable sheets | 79 files | 2 SQL files; `fmz_flags` live; `fmz_mazes`, `fmz_characters`, `fmz_doodles` **not live** | 5 convo | Three tables not applied |
| Games | Athena's World | [athena-s-world](https://github.com/ShimmyCane/athena-s-world) | 2026-11-09 | V2 (2.2.0); partly tested on iPad (2.0.0) | 3-D home-decor world for Athena | 29 files | 3 SQL files; `athena_saves`, `athena_notes` live | 10 convo | — |
| Games | Ole Bar Glide | [bar-glide](https://github.com/ShimmyCane/bar-glide) | 2026-11-21 | Not stated (Track A) | Late-night saloon glide game with a pastel-day option | 26 files | 3 SQL files; `bglide_scores`, `bglide_notes` live | 5 convo | — |
| Games | Adventure | [adventure](https://github.com/ShimmyCane/adventure) | 2026-11-18 | MVP and world tools; not tried on iPad | Family story game with a nightly AI storyteller | 71 files | 6 SQL files; 8 `adv_*` tables live | 5 convo | Family story content in a public repo |
| Games | Felix Gear Wars | [felix-gear-wars](https://github.com/ShimmyCane/felix-gear-wars) | 2026-11-21 | MVP 0.6.0, headless-tested | Gear-powered lane defence game | 111 files | 3 SQL files; `fgw_notes` live | 6 convo | — |
| Games | Paper Airplanes × A-10 Warthog | [paper-airplanes-x-a-10-warthog](https://github.com/ShimmyCane/paper-airplanes-x-a-10-warthog) | 2026-11-21 | MVP 0.7 (round 6) | Flight game with missions and a paper-plane mode | 141 files | 6 SQL files; `pa_flights` live | 22 convo | — |
| Games | StoryTime | [storytime](https://github.com/ShimmyCane/storytime) | 2026-10-25 | Not stated | Story spinner, narration and recording, levels K to G6 | 32 files | 2 SQL files; `storytime_*` live | 1 convo | — |
| Games | Rhythm Sticks | [rhythm-sticks](https://github.com/ShimmyCane/rhythm-sticks) | 2026-11-21 | MVP 0.3.1, not device-tested | Wordless rhythm toy | 44 files | 3 SQL files; `rs_notes` live | 14 convo | — |
| Games | Generate Clouds | [generate-clouds](https://github.com/ShimmyCane/generate-clouds) | 2026-11-21 | MVP 0.6.1 | 3-D sky from real weather, time-lapse, panoramas | 52 files | 4 SQL files; `gc_notes` live in Architecture (28 rows) | 18 convo | Owner-only policy; see §9 |
| Learning | Test Bank | [test-bank](https://github.com/ShimmyCane/test-bank) | 2026-10-19 | Not stated | Modular quiz app; questions as JSON, knowledge map kept apart | 83 files | None | No convo | — |
| Learning | Multiply | [multiply](https://github.com/ShimmyCane/multiply) | 2026-10-26 | Not stated | Addition and multiplication practice | 3 files | None | No convo | Small |
| Learning | Roman Numerals | [roman-numerals](https://github.com/ShimmyCane/roman-numerals) | 2026-11-10 | MVP, revised after first look (convo v0.5) | Letters, quiz, build and break, add and subtract, fix it | 35 files | None | 1 test; 17 convo | — |
| Learning | Exponents | [exponents](https://github.com/ShimmyCane/exponents) | 2026-10-27 | Not stated | Exponent visualizer (number line, up-arrow) | 5 files | None | No convo | Small |
| Learning | Primes | [primes](https://github.com/ShimmyCane/primes) | 2026-10-10 | Not stated; schematic is a prompt | Factor-tree visualizer | 5 files | None | No convo | — |
| Learning | Coins | [coins](https://github.com/ShimmyCane/coins) | 2026-10-08 | Not stated | Coin combinations | 130 files | None | No convo | — |
| Learning | Row Boat | [row-boat](https://github.com/ShimmyCane/row-boat) | 2026-10-24 | Not stated | River-crossing puzzle, scenarios, solver test | 9 files | None | 1 test | — |
| Learning | Speech Therapy | [speech-therapy](https://github.com/ShimmyCane/speech-therapy) | 2026-11-21 | Schematic v0.2 says "No code yet"; repo has 36 files | Speech practice for one child: S sounds in English and Mandarin | 36 files | 2 SQL files; 12 tables live | No convo | Stale schematic; child's age in schematic (privacy) |
| Learning | Chinese Character Sudoku | [chinese-character-sudoku](https://github.com/ShimmyCane/chinese-character-sudoku) | 2026-11-12 | MVP, three games; not on iPad | Sudoku with Chinese characters | 26 files | None | No convo | — |
| Learning | Voice | [voice](https://github.com/ShimmyCane/voice) | 2026-11-10 | MVP 0.5.1, not device-tested | Shelf of family stories narrated in three languages | 137 files | None | 7 convo | — |
| Learning | Learning to Draw | [learning-to-draw](https://github.com/ShimmyCane/learning-to-draw) | 2026-11-12 | Round 1: template and 50 sheets; not printed | Drawing worksheets with review pages | 53 files | 2 SQL files; `ltd_reviews` live | No convo | — |
| Learning | Learning Kangaroo | [learning-kangaroo](https://github.com/ShimmyCane/learning-kangaroo) | 2026-11-12 | Round 2: 12 worksheets, 48 questions | Worksheets that check, print and record results | 32 files | 2 SQL files; `lkg_reviews` live | 1 convo | Schematic names children and grade levels (privacy) |
| Learning | Chinese Character Strokes | [chinese-character-strokes](https://github.com/ShimmyCane/chinese-character-strokes) | 2026-11-18 | MVP 0.1.0; not device-tested by a child | Stroke-writing game for worksheet characters | 27 files | 3 SQL files; tables live | 3 convo | — |
| Family | Family Habits | [family-habits](https://github.com/ShimmyCane/family-habits) | 2026-11-09 | Not stated | Family habit tracker | 17 files | 10 SQL files; 10 of 11 tables live; `week_task_snapshots` **not live** | No convo | Table not applied |
| Family | Allowances | [allowances](https://github.com/ShimmyCane/allowances) | 2026-11-02 | Not stated | Allowance tracker | 8 files | Repo SQL creates `children`, `parents`, `transactions`, `withdrawal_requests`: **none live**; Family has `allowance_*` tables instead | No convo | SQL does not match the live project |
| Family | How Far Is It? | [how-far-is-it](https://github.com/ShimmyCane/how-far-is-it) | 2026-10-10 | Not stated | Distance comparison between locations | 30 files | None | No convo | — |
| Family | What to Cook | [what-to-cook](https://github.com/ShimmyCane/what-to-cook) | 2026-11-12 | MVP-1 on device; pantry v0.2.0 | Pantry, use-soon cards, meal ideas | 44 files | 7 SQL files; 15 tables live | 9 convo | Schematic says not applied; it is live |
| Family | Better Parenting | [better-parenting](https://github.com/ShimmyCane/better-parenting) | 2026-11-18 | MVP 0.1.0, headless-tested | Parenting scenarios and practice | 17 files | 3 SQL files; `bp_*` live (0 rows) | 1 convo | Schematic says not applied; it is live |
| Family | Our Family Compass | [our-family-compass](https://github.com/ShimmyCane/our-family-compass) | 2026-11-18 | MVP 0.2.0, headless-tested | Family compass: rooms, sample pieces, dated thoughts | 17 files | 3 SQL files; `ofc_*` live | 2 convo | Schematic says not applied; it is live |
| Architecture | Detail Library | [detail-library](https://github.com/ShimmyCane/detail-library) | 2026-11-12 | Not stated; schematic is a pasted chat reply | Detail database: images as the source, tags for retrieval | 248 files | No SQL in repo; uses Architecture project (3 references) | No convo | Schematic is not a design; no SQL for what it uses |
| Architecture | Quick Detail (Wall Sketch) | [quick-detail](https://github.com/ShimmyCane/quick-detail) | 2026-11-07 | Not stated | Sketching app for construction details, in real inches | 371 files | 1 SQL file; 5 `sketch_*` tables live | 16 tests | — |
| Architecture | Proposal Drafter | [proposal_drafter](https://github.com/ShimmyCane/proposal_drafter) | 2026-10-25 | Schematic V1.02 | S+Y Studio proposal tools | 71 files | None (one Supabase reference) | No convo | Check for client material in a public repo |
| Architecture | Shimmy Specs | Folder in this repo: `03 Projects/Shimmy Specs/` | — | MVP built (framework); not device- or publish-tested | Spec-writing process app | Folder: schematic, convo, supabase, knowledge notes | 3 SQL files; 6 `ss_*` tables live | Convo v0.3 | Advisor items in §9 |
| Architecture | Growth | [growth](https://github.com/ShimmyCane/growth) | 2026-11-03 | MVP, planning mode | Describe a world, then watch time pass | 56 files | 1 SQL file; `grw_worlds`, `grw_world_versions` **not live** | 2 convo; 3 tests | Tables not applied |
| Architecture | Make 3D | [make-3d](https://github.com/ShimmyCane/make-3d) | 2026-11-17 | Schematic says "idea, round 2" (2026-11-02): stale; repo is MVP 0.x | 3-D test models built in increments | 844 files | 3 SQL files; `m3d_*` live | 7 convo; 25 tests | Stale schematic; 844 files, check for vendored data |
| Architecture | Increment Viewer | [increment-viewer](https://github.com/ShimmyCane/increment-viewer) | 2026-11-12 | Database-backed; read only | Viewer for a series of increments | 73 files | No SQL; reads Supabase tables | No convo | — |
| Architecture | Critique Detail | [critique-detail](https://github.com/ShimmyCane/critique-detail) | 2026-11-18 | MVP 0.2.0, round 2 | Written review of one architectural detail | 103 files | 7 SQL files; 7 `dc_*` tables live | 2 convo | — |
| Architecture | Map Photos | [map-photos](https://github.com/ShimmyCane/map-photos) | 2026-11-21 | Not stated | Photos placed on a map | 49 files | None | 1 convo | Schematic mentions a campus walk (location, privacy) |

## 9. Security and data findings (read-only advisors, 2026-11-22)

**Architecture project** (sign-ups open, per the Supabase brief):
- Leaked-password protection is **off**. Turn it on.
- `platform_is_owner()` can be called by anonymous users (SECURITY DEFINER). It returns owner status only, so the risk is low. Revoke anonymous execute if nothing needs it.
- Shimmy Specs' `ss_*` functions (sign-in, list, load, save, delete) can be called anonymously with a token. Each one needs to reject a bad or expired token. That was not tested in this pass.
- The `ss_*` tables have RLS on and no policies. That is by design (access only through those functions), but confirm no grants are open to anonymous or signed-in users.

**Family project:**
- `approve_allowance_withdrawal` checks only that the caller is signed in (`auth.uid() is not null`). Any signed-in user can approve a withdrawal and create a transaction. **Fix before relying on it:** check for the owner or parent role.
- `storytime_ai_key` has RLS on and no policies, which is right for a secret. Confirm no grant exposes it.
- Leaked-password protection is off here too.

**Repo-level privacy items** are listed in §6, item 7. Nothing was changed in any repo.
