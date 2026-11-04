# Lessons Pool

Consolidated lessons learned across seed projects. Each lesson names the projects it came from only as a source, not as a link to their private data. Read this before starting a project. Add to it with `/update-lessons-learned`.

Companion files: `patterns.md` (reusable patterns and template candidates), `Personal Preferences/jimmy_preferences.md` (design and workflow preferences), `Tools/` (environment notes).

---

## 1. Process

1. **Clarify before building.** Numbered questions in a convo file, answered in one or two rounds, got a seed to an MVP in one pass. Projects built without a Q&A round needed the most rework. _(Moment)_
2. **Verify on the real thing before calling it done.** Check the live data schema, the real browser and the real device. "Not browser-tested" is the most common open item across briefs. Every "it doesn't work" round traced back to an unchecked assumption. _(Allowances, Moment, Coins, Family Habits)_
3. **Say what was not verified.** A brief should separate verified from unverified. A synthetic-data test can't prove a real login works. _(Allowances, Family Accounting)_
4. **Feedback works best as numbered wishes and bugs**, one convo file per round. _(Moment)_
5. **Q&A in versioned convo files, never compacted.** When a decision is superseded, mark it in the brief rather than rewriting history. Keep one current schematic or brief so outdated requirements don't come back. _(Family Accounting)_
6. **Seeds feed seeds.** Reuse style and lessons from the closest earlier project on purpose. _(Family Habits → Moment, Allowances → Family Habits)_
7. **Respect dropped features.** If the user removed something, don't re-add it. _(Allowances)_
8. **Don't merge a draft silently.** Mark drafts as drafts until the owner confirms the merge. _(Speech Therapy)_
9. **Finish line for seeds.** Give each project one status: idea → MVP → device-tested → in use → spun out or retired. Without this, open loops pile up. _(Planning reviews)_
10. **Keep the seed small.** Projects leave the nursery when mature. Don't grow a seed into a second product here.
11. **Ask "What should never happen in this tool?"** in every first convo round. It surfaces privacy and IP limits early. _(Shimmy Specs)_
12. **Lessons from past work, never the past work.** When Jimmy draws on an old or office project, commit only the general lesson. Nothing that identifies the project goes in text, scripts, GitHub or a database. Sketch/test projects and Jimmy's own projects are the exception. _(Shimmy Specs)_
13. **Hand-off lists for a smaller model.** When a cheaper model will build from a plan, split it into a design file plus an ordered task list with a check per task, rules up front, a "don't invent content" line, and a place to park questions. _(Shimmy Specs)_
14. **Keep a disliked mechanic, and add alternatives behind a switch.** The first one stays, and Jimmy can compare. _(Chinese Character Sudoku)_
15. **Ask which unit the user means before building a bias.** "Recently learned" meant the last 60 characters, not words. _(Chinese Character Sudoku)_

## 2. Designing for kids on iPad

1. **Explain in plain words, with the real numbers.** A "how to read this" note with worked arithmetic beats a clever chart or a terse label. _(Coins, Primes 01)_
2. **Show the whole solution space**, not a slice with variables held fixed. Pick two axes and solve the rest, so every solution shows as a point. _(Coins)_
3. **Don't spoil the answer in prompt text.** Keep prompts neutral until the child has done the reasoning. _(Primes 01)_
4. **Keep frequent actions in fixed positions.** A consistent spot for common actions (for example, the escape option on the right) gives children a reliable mental map. _(Primes 01)_
5. **Animate to explain change.** Sorting, growing, or a clear cause-and-effect animation (for example, a predator taking prey) makes the rule visible. Leave the result on screen afterwards. _(Coins, Primes 01, Row Boat)_
6. **Undo as a core mechanic.** A prominent Undo built on full state snapshots makes experimenting safe. _(Felix Checkers, Row Boat)_
7. **Fewer, more distinct options.** When the user prunes choices, cut them literally. Don't bring back dropped options. _(Coins)_
8. **Panels toggle, they don't replace.** Stacked, multi-open panels with +/− beat tabs that overwrite each other. _(Coins)_
9. **Lock the size of swapping content** so layouts don't jump. A fixed card or deck height fixed a "cards don't update" report. _(Coins, Primes 01, Moment)_
10. **Use short, distinct labels.** Long names clutter small chips. Pair an emoji with a short tag. _(Row Boat)_
11. **Fix small wording for children:** plurals ("1 coin"), visible counts, and visible states. _(Coins)_
12. **Use Web Audio for sound effects** instead of audio files that can fail to load. _(Felix Checkers, Family Habits)_
13. **Touch and layout basics:** targets at least 48px, safe-area insets, `touch-action: manipulation`, no pinch-zoom on the game surface. _(Felix Checkers, Family Habits)_
14. **Use the right layout for the device.** Vertical river flow gave a boat more horizontal room; a 70–75% stage width kept multi-seat puzzles from feeling cramped. _(Row Boat)_
15. **Balance mechanics symmetrically.** When adding a special piece to one side, give the other side a matching piece in a rotated position. _(Felix Checkers)_
16. **Keep the answer visible** after a game ends, and give a clear "Try again". _(Row Boat, Felix Checkers)_
17. **Keep the controls sticky in a two-column layout.** Auto-scrolling a column to the bottom pushed the character buttons out of view. Make the controls sticky and scroll only the new item into view. _(Adventure)_
18. **Use pointer events, not HTML5 drag-and-drop, on iPad.** A ghost tile follows the finger, `elementFromPoint` finds the drop cell, and a small threshold separates a tap from a drag. _(Chinese Character Sudoku)_
19. **Update a status in place.** Re-drawing a whole panel on each save drops focus from text being typed; update only the status light. _(Shimmy Specs)_

## 3. Layout, SVG and CSS

1. **Use `viewBox` only, and size SVG with CSS on a wrapper.** Never also scale coordinates in JS, which double-scales. _(Primes 01, Moment)_
2. **Compute geometry once and reveal parts of it.** Quiz or reveal modes should toggle visibility of pre-computed nodes, so nothing moves. _(Primes 01)_
3. **Anchor the root element at a fixed point** so partial and full views line up. _(Primes 01)_
4. **Rotate SVG groups around their center** with `transform-box: fill-box; transform-origin: center`. Keep fixed pointers outside the rotating group. _(Moment)_
5. **A pointer inside the SVG** can be a plain polygon after the rotating group, so it doesn't rotate with the wheel. Keep points inside the clip circle. _(Moment)_
6. **CSS beats SVG presentation attributes.** Color through classes or `style.fill`, or the CSS rule silently wins. _(Primes 01)_
7. **CSS grid columns need `minmax(0, 1fr)`**, and inputs need `width: 100%`, or wide content pushes the track off the screen. _(Quick Detail)_
8. **Use CSS `transform` for animated movement**, not the SVG `transform` attribute, so it can transition. _(Coins)_
9. **Hide controls with `[hidden]{display:none}`** too, because `display:flex` overrides the `hidden` attribute. _(Coin Club in Coins)_
10. **Hand-written SVG charts are enough** for dependency-free dashboards. Check both empty and non-empty data in a browser. _(Family Accounting)_
11. **Draw all faces of 3D canvas shapes**, tinting back faces, instead of culling. Culling leaves holes in spiky shapes. _(Coins)_
12. **Check the whole page, not just the picture.** Start and finish marks outside a maze pushed into the title and footer. Run a layout check in the generator. _(Felix Maze)_
13. **In a fixed-height flex column, set `flex-shrink: 0`** on children or text boxes, or they clip. _(Felix Maze)_
14. **Decode hash routes.** A route with spaces arrives percent-encoded (`%20`); decode it in the router. _(Shimmy Specs)_

## 4. Structure and content

1. **Separate content from the engine.** Keep questions, scenarios and catalogs in JSON next to a generic engine, so new content doesn't need new code. _(Test Bank, Moment, Row Boat, Family Habits)_
2. **Keep question content separate from the knowledge map**, linked by stable IDs in both directions. Topic names can change; IDs shouldn't. _(Test Bank)_
3. **Content QA is its own discipline.** Validate JSON, unique IDs, answer keys, and sources. A question app can look polished while holding weak content. _(Test Bank, Reader Level Test)_
4. **Make every answer key traceable to the passage or reasoning** behind it. _(Reader Level Test)_
5. **Use short, separate passages** rather than one long passage with many questions, for early readers. _(Reader Level Test)_
6. **Keep relative paths** in repo-facing docs. Absolute machine paths don't work on other machines. _(Test Bank)_
7. **Split single-file apps into css and js** once they grow. Top-level registries that reference functions must live in the last-loaded script. Replace blocks by exact line ranges with a script, and re-run every renderer afterwards, because block splices can silently drop small helpers. _(Coins)_
8. **Save the source of a finished decision at import time.** Store statement or observation evidence when it arrives, rather than rebuilding it later. _(Family Accounting)_
9. **Test the full path, not just parsers.** Ingestion through to the report catches missing persistence and carry-forward errors. _(Family Accounting)_
10. **Be explicit about sign and coverage semantics** in any chart of totals. State what counts, what is excluded, and how partial data is shown. _(Family Accounting)_
11. **Pick the chart for the question.** A pie answers "what made up this year?"; grouped bars or lines answer "how did it change?" _(Family Accounting)_
12. **Make decisions on a single source of truth.** A PDF or DXF writer or other output should come from one primitive list in real units, so every output matches. _(Quick Detail)_
13. **Record relationships when they're created**, not guessed later. A leader tip that records its exact target beats a proximity guess. _(Quick Detail)_
14. **Create the shared namespace in every file that uses it** (`NS = NS || {}`). A file that copies a namespace at load time sees `undefined` if it loads first. Browser smoke tests catch it; Node tests do not. _(Shimmy Specs)_
15. **Store the data version with saved state.** A restored game can hold items no longer in the data; drop the save on a version mismatch. _(Chinese Character Sudoku)_

## 5. Errors, offline and data

1. **Surface errors on screen, opt-in.** A visible error panel at the bottom, behind a settings toggle, with a header status pill. Don't rely on the console. _(Allowances, Moment, Family Habits, Speech Therapy)_
2. **Diagnostics for empty results.** An empty result with no error usually means a permissions filter. Show a diagnostic check that pings each table. _(Allowances, Family Habits)_
3. **Go offline-first when data is remote:** live (with a timeout) → local cache (with TTL) → bundled JSON. _(Moment)_
4. **Guard against duplicates from the browser.** If the browser creates records, add a database unique rule and ignore the duplicate-error code in the app. _(Allowances)_
5. **A form option implies a database rule.** "Adjustment (+/−)" means negative amounts are valid. Read what the UI promises before writing constraints. _(Allowances)_
6. **Client-side scheduled work depends on someone opening the app.** A database function or scheduled job is the robust follow-up. _(Allowances)_
7. **Test a changed front end with a stand-in client that enforces the real schema**, in a headless browser. Say that a real login was not tested. _(Allowances)_
8. **Offline is not an error.** A page that can't reach the database should say "this device only", not add an error on every load. _(Felix Maze)_
9. **Keep AI keys out of the browser.** Run storyteller or model calls as a background job between sessions, not in the page. The output was also steadier. _(Adventure)_

## 6. Supabase (any static app with a database)

Full detail, with the registry rules, is in `04 AI/Supabase/lessons.md`. Use `/supabase-project` when starting one.

1. **Read the live schema, not the repo's schema file.** Repo files drift. Query the tables and policies, then diff. _(Allowances, Speech Therapy)_
2. **Empty results with no error usually mean row-level security.** Make sure the user's row in the access table exists. _(Allowances)_
3. **Create tables with RLS enabled in the same step.** If a later step fails, the table stays locked. _(Supabase Registry)_
4. **Revoke default grants from `anon` explicitly.** New tables are granted to anon and authenticated by default; RLS is the only guard until you revoke. _(Supabase Registry)_
5. **Re-list migrations and tables right before applying.** Another session may have changed the project since you last looked. Never touch objects you didn't create. _(Supabase Registry)_
6. **Prove a data copy with a checksum** over the same fields in both places, plus row counts, instead of eyeballing. Keep the old id in a column until sign-off. _(Supabase Registry)_
7. **Test security and logic inside a rolled-back transaction**, faking the role and the user id, and return the results in an error message so nothing persists. _(Supabase Registry)_
8. **Generate insert values from the source** with a quoting function, rather than retyping them. _(Supabase Registry)_
9. **A migration call can time out without applying anything.** Check what was created before retrying, and keep the full SQL in the repo. _(Supabase Registry, Speech Therapy)_
10. **Shared logins are a hidden dependency.** Check which account an app actually signs in with before switching it over. _(Supabase Registry)_
11. **Use a shared project with prefixed tables** when several apps share a database. Register which app owns which table. _(Supabase Registry)_
12. **Only the publishable key goes in browser code.** Never put a service-role key in a static app. _(Moment, Allowances)_
13. **Log every change with one generic trigger, and roll back with one function.** A trigger copies `to_jsonb(old)` and `to_jsonb(new)` into a history table; a restore uses `jsonb_populate_record` with `on conflict (id) do update`. No per-table code. _(Adventure)_
14. **Custom sign-in: let the database refuse everything except named functions.** RLS on with no policies, plus security-definer functions with a fixed `search_path`. Test the refusals (wrong password, injection-shaped name, another user's data, expired session) in a rolled-back block. _(Shimmy Specs)_

## 7. Hosting

1. **Use GitHub Pages for anything that needs the microphone, a database, or downloads.** Artifact previews can't do these. _(Speech Therapy)_
2. **Artifact limits:** no microphone, no outside fetches beyond the page's own files, inert download links, and full HTML documents get nested in the wrapper. Supporting files can be published alongside. _(Speech Therapy)_
3. **Publish from a single place.** Keep the public site root separate from working folders so they don't collide. _(Index)_
4. **Keep a bundled data copy for double-click use.** `fetch` fails from `file://`. A generated script with the same data lets the app run from a double-click, and a validator fails when it goes stale. _(Shimmy Specs, Make 3D)_

## 8. Environment and tools

1. **Windows and PowerShell can corrupt text.** Here-strings break JS template literals, pipes mangle non-ASCII characters, and `Get-Content` can mojibake UTF-8. Write edit scripts to a file and run them with Node. _(Coins, Allowances)_
2. **Validate edits.** Run `node --check` on JS after changes. _(Coins)_
3. **Cache-bust when testing in a browser.** Add a query string with a time stamp. _(Coins)_
4. **Playwright checks:** zero JS errors after each change, and assert the numbers (for example, dot count equals solution count). _(Coins)_
5. **Hand-written PDF and DXF are viable offline.** Helvetica with computed byte offsets, and R12 DXF with layer colors standing in for lineweights. Validate outputs with an external reader. _(Quick Detail)_
6. **Keep helper functions reachable.** When splitting code, re-run every panel renderer to catch missing helpers. _(Coins)_
7. **Deliver a verifiable result.** If a build or device test can't run here, make the change, say what was verified by reading, and say what remains.
8. **Check the date from the session, not from habit.** A change-log entry was labelled with tomorrow's date. _(Chinese Character Sudoku)_
9. **Try the package registry before calling a package unreachable.** One allowlist blocked the CDN but allowed the npm registry. Academic hosts can be blocked too; ask for the file. _(Chinese Character Sudoku, Felix Maze)_
10. **Subset an offline font to the characters used, and keep its licence.** 359 glyphs came to 78 KB as woff2. SIL OFL means keeping the licence and not claiming a reserved name. _(Chinese Character Sudoku)_
11. **Test touch with real touch events** (CDP `Input.dispatchTouchEvent`), not only the mouse, and check that the page doesn't scroll while drawing. _(Chinese Character Sudoku)_
12. **Headless WebGL needs flags.** Use `--no-sandbox --use-gl=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist` with the pre-installed Chromium. _(Make 3D)_

## 9. Open questions to revisit

- Should convo files ever be private? Right now they are public in this repo.
- When a project leaves the nursery, what goes with it: the lessons, the convo files, or only the code?
- Which projects hold family data and belong in a private repo rather than this public one? (Adventure, Shimmy Specs)

## 10. Settings button (⚙️)

Full build rules: `02 Refs/Skills/settings_gear.md` (run as `/settings-gear`).

1. **One gear everywhere.** Lower right, the same drawer in every app: options, page links, database check, Show errors last. _(Adventure, Felix Maze, Make 3D, Chinese Character Sudoku)_
2. **Hidden is not removed.** Anything taken off the screen to save room stays reachable in ⚙️. _(Chinese Character Sudoku, `ipad_website.md`)_
3. **Errors are opt-in, at the bottom, behind ⚙️.** Log them always, so turning the toggle on shows earlier ones. _(Felix Maze, Adventure)_
4. **Build every option from one settings object.** Render each segmented control from it, and save it in a try/catch. _(Chinese Character Sudoku)_
5. **Keep the gear clear of content.** Reserve footer padding, keep the error panel off the gear's corner, and hide the gear in print. _(Make 3D, Felix Maze)_
6. **Switch modes by hash link** (`#v1`, `#v2`), so a mode can be bookmarked. _(Chinese Character Sudoku)_

## Generated puzzles (Felix Maze)

1. **Validate generated output against what is drawn**, and reject or regrow failures automatically (best of several). Measure the failure rate over hundreds of seeds before trusting it. _(Felix Maze)_
2. **Store seeds/recipes, fingerprint published ones**, so later code changes can't silently alter something already printed. _(Felix Maze)_
3. **Check what is drawn, not only the model.** Record each drawn line while rendering and test the answer against those, not against the cell graph. _(Felix Maze)_
4. **Compare pixels with and without the answer**, to catch layering bugs that geometry checks miss. Layer by what the solver sees: under a bridge, redraw the bridge over the answer. _(Felix Maze)_
5. **Don't warp a child's drawing to fit the generator.** Turn an effect off where the child's own line sits on top. _(Felix Maze)_
6. **Calibrate levels from samples, anchored to a named reference.** Boundaries sit halfway between the typical effort of each level. One child's "that's a level 2" moved every boundary, so keep the scale anchored to a named maze. _(Felix Maze)_
7. **Scores that all read the same are useless.** Add measures that vary, and check the spread over real samples. _(Felix Maze)_
8. **Policy belongs in the data.** A `living: true` flag on a design stops the generator, so the rule can't be forgotten. _(Felix Maze)_
9. **Keep device-made and published counters apart** (for example 001–7FF and 800–FFF), so a later batch can't collide with something saved on a device. _(Felix Maze)_
10. **Enumerate small search spaces once, then sample.** Random search kept finding the same dozen boards; enumerating all grids once gave fixed variety. _(Chinese Character Sudoku)_
11. **Time the generator after any bias change.** A capped restart budget brought one size from about 800 ms back to about 100 ms. _(Chinese Character Sudoku)_

## File-based pages and generated samples (Make 3D)
- ES module imports don't load from `file://`. Use classic scripts and UMD builds so a double-click works. _(Make 3D)_
- Generate sample files from one operation list and test that replaying the history equals the saved model. _(Make 3D)_
- Mirror a layout once at the end when the first render comes out reversed (Z-up handedness: from the front, +x points left). _(Make 3D living room)_
- Add a group before its children, or a rules engine rejects them. Rotation about one axis means a piece can only face along that axis. _(Make 3D living room)_
- Animation: keep motion in its own file, make every motion a whole number of repeats per loop, and make the first frame the rest pose. Test the loop has no jump. _(Make 3D robot)_
- A swinging leg tips the foot into the ground: counter-turn the foot at the ankle and dip the body by the hip-to-ankle drop. _(Make 3D robot)_
- "Not on the website" usually means "not merged": GitHub Pages serves `main`. _(Make 3D)_

## Logs and databases (2026-11-02)
- Keep the log of record in a table, not in files in a repo. Notes and labels change without a merge or a rebuild. Keep the files as build output. _(Make 3D scene log)_
- Check the live project's registry convention first. The same workspace can use `table_index` in one project and `app_table_registry` in another. _(Architecture project)_
- Mirror an existing owner-only policy exactly for a new table, and test it in a rolled-back `do` block that raises the counts. _(Make 3D scene log)_
- Large JSON loads go through a script run with the owner's own session token, not through a chat tool. The publishable key and the owner token stay out of the repo. _(Make 3D scene log)_
- Flag a sign-in email that appears in a public repo's migration rather than repeating it. _(Make 3D scene log)_


## Photo to 3-D workflow (2026-11-02, from the living room)
1. **Read every photo before modelling**, and write a short scene list (walls, openings, big objects, small objects). Ask about any photo that contradicts another. _(Make 3D living room)_
2. **Plan and elevations first, in 2-D.** Draw the room from the photos, then one elevation per wall, before any 3-D. Generate them from the model data so the drawings and the 3-D scene cannot drift. _(Make 3D tools/drawings.js)_
3. **Largest objects first in 3-D:** room shell, openings, bookcase, sofa, table, then the small items. Check alignment against the plan after each tier. _(Make 3D)_
4. **Name the next tier of questions** after each pass (what is on the top of the bookcase, what sits on the table) and put them to the owner, not guessed. _(Make 3D)_
5. **Refine in increments, each reviewed against the photos and the plan.** Keep every version reproducible, and label it. Expect the first pass to need a re-layout when a new photo shows the room differently. _(Make 3D V01 to V15, V2.1 to V2.5)_
6. **Mirror-check the first render** (with Z up, from the front, +x is on the left). _(Make 3D)_
7. **Rotation about one axis only** means pieces can only face along that axis. Lay the room out to suit. _(Make 3D)_
8. **Log every version in a table, not files,** so notes and labels change without a merge. _(Make 3D scene log)_
9. **Keep the photos private.** They go in `private/` and are never committed. _(Make 3D)_

## Pull requests and merges (2026-11-02, from Make 3D)

- **Check mergeability before every merge.** A PR can show `dirty` (conflict) or `unknown` (not yet recomputed) after a push. Read it again before merging. Fetch the base and merge it into the branch. Do not rebase a shared branch.
- **Keep both sides of a documentation conflict.** When both branches add a new section to the same notes file, keep both sections, one after the other.
- **Merge with the head SHA you checked** (`expectedHeadSha`). A draft must be marked ready for review before it can merge.

## Skeleton meshes (Make 3D hawk, 2026-11-02)

- For anything that bends, build a closed mesh on a skeleton line (smooth tube, capped, watertight) instead of stacking extruded boxes; keep a separate open, double-sided type for truly thin things (leaves, grass, flags). Prove closure by counting: every edge in exactly two triangles, positive signed volume.
- Let separate parts ride a joint (`attach`) instead of copying motions; use eased, closed keyframes for one-off beats in a loop; derive banking and pitch from the path.
- Test a rig by sampling every vertex over the whole loop (ground clearance, reach, fold), not by looking at one frame.

## From Grand Ocean Aquarium (Make 3D, 2026-11-02)

- **See-through surfaces must not block taps.** In a 3-D viewer, make glass and water ignore picks (opacity under 0.4) so the object behind can be selected.
- **Plan the object budget before the detail.** Count parts per item (a fish is 4 to 10), then choose detail per increment so the counts land near the targets (100, 150, 200, 500, 1,000).
- **Group many movers.** Move a school or a crowd as one group with one motion and keep each member as a named child, so a thousand parts need only a few hundred motions.
- **Seed random layout by key.** Seeding each random choice by the object's key keeps earlier increments identical when later ones add objects.

## Small models and several views (Jimmy liked this, Make 3D, 2026-11-02)

- **Make a small test model of one part first** (one of each animal, one room), look at it close up, fix it, then build the full scene from it.
- **Look at every scene from several named views** (front, behind, side, inside) and at two times if it moves. Each view catches something the others hide.

## Making motion look real (Make 3D hawk V07, 2026-11-02)

- If a reviewer calls an animation diagrammatic, replace chosen speeds with energy: gravity, drag and a thrust that is solved so the loop closes. Draw the invisible cause (rising air, wind) so the motion has a reason.
- Scale gravity with the world. Cap roll and flapping near the ground, and test every vertex over the whole loop against the ground.

## From the Coastal Habitat Aquarium (Make 3D, 2026-11-02)

- **Fix the container before the contents** when a scene reads as a stage set. Define the shape once as a function and derive walls, rock, windows and bounds from it.
- **Rejection-sample motion paths against the shape** (distance to walls, obstacles), seeded by key, then prove them in a test at many times.
- **Rest spheres on the floor** instead of burying them, or parts hang below the ground.

## From the habitat's V05 to V07 (Make 3D, 2026-11-02)

- **Extruding a plan is still a box.** Add vertical variation: a lean that varies by angle, several floor levels, space underneath, bridges over and tunnels through.
- **Hash the old increments before changing a generator** and compare after, to prove the old versions did not change.
- **Test a group's spread, not only its centre path.** A school passed the centre check but its members crossed an obstacle.
- **Keep a cutaway scene for review** when opaque parts hide the structure.

## Physics-based decay models (Paper Again, 2026-11-03)

- Ask for the target look in a short round of questions before building. Growth was built from hand-placed shapes and looked like a mesh with pieces falling out; the fix was the target, not more detail.
- A particle-spring model needs plastic bend springs (creases stay), self-contact with friction (layers hold), and a stand-in shell for shapes that must stay together. Self-contact alone let a ball spread flat within a second of release.
- Define cuts on the material's own (flat) coordinates, and break every spring that crosses the line, including two-cell bend springs. A world-space cut missed the layers and bend springs reconnected the pieces.
- Count pieces by faces, not loose particles, or every cut looks like many pieces.
- Re-centre the object after each step, or it drifts off screen.
- Bake the frames once. A replay that takes 40 s cannot load on a page. A `<script>`-tag cache works from `file://`; check it against a fingerprint of the story.
- Smoke-test (settle, NaN check, timing, one frame) before writing the story, and record each tuned constant with its reason.
- Say what a result is not. Show limits next to every result.

## Planning pages and world formats (Growth, 2026-11-03)

- When Jimmy says a page "looks just like" another, ask what he wants to do on it. A viewer and an authoring page are different tools.
- One generic world format (seed, environment, time rules, steps, outputs) plus a time model per world. A computed model and a recorded one both fit.
- Put `{tokens}` in story text so it stays true when a number changes. Leave unknown tokens visible.
- Run a simulation's model on its own and tune it before writing the story. Add the damping a real system has (reserves, refuges, other food) before a boom-and-bust model collapses to zero.
- An AI loop without a server: build the prompt, copy it, paste the JSON reply back, validate before applying.
- A link can carry a draft in `#draft=…`. Treat it as untrusted: text only, no images, checked colours.
- Show the readable result first and fold the editing UI away. Measure the page height.
- Test the page at phone width and measure which element overflows.
- When a shared page changes, load every existing item once.

## Privacy, owner access and checks (2026-11-04)

- **Never put a sign-in email in a public migration.** A repo file is public forever, and rewriting history is disruptive and rarely removes every copy. Identify the owner by auth user id in an owner table that is filled by hand, and check policies with `public.platform_is_owner()`. _(Growth, Make 3D; `04 AI/Supabase/platform_owner.sql`)_
- **Check the live policies before deciding a repo fix is enough.** The repo copy and the live database can differ. The Architecture project had email-based policies live on eleven tables that the repo files didn't cover. _(Architecture, 2026-11-04)_
- **Read every result set of a multi-statement query.** Some clients show only the last result, so an empty-looking check can hide a live policy. _(Architecture, 2026-11-04)_
- **Test an owner rule in a rolled-back block** that returns the owner and non-owner results in the raise message. Create the table, function and policy inside the block, so the rollback removes all of them. _(Architecture, 2026-11-04)_
- **A pattern that starts with a dash needs `grep -e`.** Otherwise grep reads it as an option and reports nothing, so a scanner can pass with a real problem in place. Test every scanner on a fixture with planted problems. _(Privacy scan, 2026-11-04)_
- **Sandbox proxy errors are not app errors.** A `net::ERR_TUNNEL_CONNECTION_FAILED` to an outside host means the sandbox blocked it. Name the host and check the page still works without it. _(Expansion Wars smoke run, 2026-11-04)_
- **Feedback notes belong on the item, not in the page's head.** Save each note with the map, level or screen it is about, the page and the time, so the owner can act on it later without asking what it meant. _(Expansion Wars, Fishes, Felix Maze)_
- **A starter that hides its own box fails the first test.** Put the box inside the panel that opens it, and let the panel do the hiding. _(feedback_notes starter, 2026-11-04)_
