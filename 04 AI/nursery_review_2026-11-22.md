# Nursery AI projects: metadata, lessons, and a best-practice comparison (2026-11-22)

Scope: the seven projects in the **Nursery** section of `index.html` (Drafting, Living Room Scene, Make-3D x Construct, Mind Palace, Salmon Leap, Athena's Piano Companion, QC keynotes). Method: read each project's `schematic.md`, `CLAUDE.md`, `04 AI/<Project>/brief.md` and `lessons.md`, the convo and git history, and the READMEs of the ten linked repos (default branch, read on 2026-11-22). Nothing was run, installed, or changed in the projects. `index.html`, `02 Refs/` and the project folders are untouched.

Status key (from `03 projects_schematic.md`): idea → MVP → device-tested → in use → graduated → retired.

---

## 1. Metadata per project

| Project | Track | Status (schematic) | Purpose, in one line | Structure | Database | Checks in repo | Convo / commits | Device-tested? |
|---|---|---|---|---|---|---|---|---|
| **Drafting** | B | MVP 0.2 (2026-11-18) | Makes DXF blocks, `.LIN` line types and `.PAT` hatches for AutoCAD and Revit from library details, with a legibility linter and a DXF viewer | Plain JS, one page `index.html`, `js/` (writer, reader, linter, pipeline), `samples/` (synthetic), `tests/` | Architecture DB planned, owner only; no SQL in repo | 19 Node tests; ezdxf audit clean; headless at iPad and phone widths | 4 convo, 4 commits | No. Not opened in AutoCAD or Revit |
| **Living Room Scene** | not stated | MVP, V1 to V10 | A flat pastel scene rebuilt from one living-room photo over ten versions (the photo is not in the repo) | Ten single-file SVG pages (`living_room_v1.html` to `v10`), `renders/` with a progress sheet | None | Headless render at 1000×750, compared with the photo by eye | 1 convo, 1 commit | No. Likeness checked only by Claude |
| **Make-3D x Construct** | B | "V2 built" (schematic); "MVP 0.3" (brief); "MVP 0.1" (AI index) | A Southern Cheyenne camp move in the 1870s, built with Construct's method (checks with fix hints, certainty per fact, flags, defect ledger). Draft only; display waits for consultation | `index.html`, `studio.html`, `index_summary.html`, `js/core` (model, rounds, review, loft), `js/library`, `js/cloud`, `js/viewer`, vendored three.js and supabase.js, `samples/`, `worlds/`, `exhibit/`, `tests/` (6 files), `tools/`, `research/`, `archive/` | Two SQL files (001 certainty, 002 scenes), **not applied**; cloud copy off | 43 Node tests (brief; the AI index says 33); headless desktop and phone checks | 7 convo, 10 commits | No |
| **Mind Palace** | A | 0.3.1 (schematic); "MVP 0.1.0, draft PR" (brief); "0.2.0 round 3" (AI index) | A memory palace to walk through, one per family member: memories as objects in rooms, search, two kinds of recall practice, a Gaussian-splat view | `index.html` (Build page), `splat.html`, `css/`, `js/` (three layers: `model.js` database, `layout.js` scene, `view.js` renderer), `build.html`, `godot/` (written, never run), `tools/` | Device storage only; family sync planned, nothing applied | 54 headless checks at phone and tablet widths | 5 convo, 6 commits | No. Not yet tried on an iPad |
| **Salmon Leap** | B | V1 to V5 built; V10 and V15 planned | A bronze statue of a leaping Atlantic salmon, built in five cumulative versions | `index.html`, `js/core` (loft, model), `js/viewer`, `tools/` (parts, build), `samples/` (five versions), `research/`, `tests/test_versions.js` | None | Part-count audit per version; no dropped parts | 2 convo, 2 commits | No |
| **Athena's Piano Companion** | A | 0.2.0 (2026-11-21); 0.1.0 used on an iPad | A hands-free recorder for free piano play: voice or tap start and stop, library, browse with a recycle bin, four-layer compose | Six pages (`index`, `record`, `player`, `library`, `browse`, `compose`), five CSS files, 19 JS files | SQL 001 **applied**; 002 (recycle bin, sessions) written, **not applied**; test and verify files for both | Headless tests; SQL test and verify files | 6 convo, 6 commits | Partly. 0.1.0 on a real iPad; 0.2.0 headless only |
| **QC keynotes** | B | v0.2.0, four steps built; notes box built | First-pass check of keynote notes against a guideline (green, yellow, red), with a marked-up PDF export and a CSV | `index.html`, `js/` (core, guideline, scan, markup, feedback, config), vendored pdf.js 3.11.174 and pdf-lib 1.17.1, `test/` (smoke test and synthetic generator), `samples/` | `qk_notes` SQL written, **not pasted** | `test/smoke.js` headless on synthetic data: 4 green, 5 yellow, 4 red | 4 convo, 8 commits | No. No real drawing set yet |

Common structure across all seven: `CLAUDE.md` pointer, `schematic.md`, `convo/` (one file per round), a brief and lessons in `04 AI/`, plain HTML, CSS and JS with no build step, vendored libraries, synthetic samples, and Node tests. The schematics mostly share the same sections (purpose, track, status, decisions from convo, files, open questions). Migrations are numbered (`001_`, `002_`), and two projects also have `test_` and `verify_` files beside them.

---

## 2. What the audit found

1. **Device testing is the real gap.** Six of the seven projects are "headless-tested, not device-tested." Athena's 0.1.0 was the only one used on an iPad, and that test found real faults: a browser cache served an old script, the microphone heard the count-in and the piano, and the stop phrase leaked into the take. Headless checks missed all of them.
2. **Four projects have database work written but not applied** (Make-3D x Construct, Athena's Piano Companion 002, QC keynotes, Mind Palace family sync). Their pages still call for it, so the offline or local fallback is the only thing running.
3. **Status drifts between files.** Make-3D x Construct has three versions in three places. Mind Palace has three. The test count is 43 in one file and 33 in another. Each project needs one status line, matched to the version that actually exists.
4. **Archive copies.** `Make-3D x Construct/archive/Oklahoma diorama V1/` is a full earlier copy. The root `CLAUDE.md` says not to create copy folders unless Jimmy asks. Either the copy is wanted (then say so in the schematic) or it moves out of the repo.
5. **Track is missing** for Living Room Scene.
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

## 5. Open questions for Jimmy

1. **Make-3D x Construct:** is `archive/Oklahoma diorama V1/` kept, or moved out of the repo?
2. **Versions:** which is current for Make-3D x Construct (V2, MVP 0.3, or MVP 0.1), and for Mind Palace (0.3.1 or 0.2.0)? Once you say, the schematic and brief get one status line each.
3. **Living Room Scene:** which track is it, A (family play) or B (studio)?
4. **Migrations:** should Athena's 002 and Make-3D x Construct's 001 and 002 be pasted next, or held?
5. **Contrast and control states:** add to `smoke_test.md` (your call, since `02 Refs/` is yours)?
6. **Device test:** which project gets an iPad check first? Athena's 0.2.0 has three open notes waiting for your go.
