# Cross-Project Patterns

Reusable lessons distilled from the seed projects, so a new project can start from what already worked. Each pattern points to the project lessons where it was learned. Project-specific detail stays in `<Project>/lessons.md`.

## UI for kids on iPad

- **Two tracks, one set of defaults:** family play (simple, graphic, settings in ⚙️) and studio design (denser, formal, still collapsible). Set the track first; the track decides the screen density, the palette and the database. See `02 Refs/Workflow/project_track.md` (decision guide) and `family_project_track.md` / `architecture_project_track.md` (specific defaults). _(Fishes, Expansion Wars, Make 3D, Shimmy Specs)_
- **Collapsible panels by default:** a header with an icon and name, a ▸/▾ marker, state remembered per device. _(Coins, project_track snippet)_
- **One ⚙️ settings button everywhere:** lower-right gear, segmented options, opt-in errors at the bottom, database check. Build it from `02 Refs/Skills/settings_gear.md` (`/settings-gear`). _(Adventure, Felix Maze, Make 3D, Chinese Character Sudoku)_
- **Layout and look:** follow `02 Refs/Skills/ipad_website.md` and `Personal Preferences/jimmy_preferences.md`: pastel colors, bold outlines, two-column play/reference layout, gear in the lower right, touch targets ≥ 48px.
- **Lock the size of swapping content** so the layout doesn't jump. _(Coins I, Primes 01 A)_
- **Stacked +/− panels instead of tabs** that replace each other. _(Coins C)_
- **Explain each visual in plain words, with the current numbers worked out.** _(Coins B)_
- **Animate to explain change** (sorting, growing, eating/slash on failure), then leave the result visible. _(Coins D/H, Primes 01 C, Row Boat C)_
- **Don't spoil the answer in prompt text**; keep frequent actions in fixed positions. _(Primes 01 C)_
- **Prominent Undo** using full state snapshots. _(Felix Checkers C, Row Boat D)_
- **Fewer, more distinct options**: when Jimmy prunes choices, cut them literally. _(Coins F)_
- **Web Audio synthesized sounds** instead of audio files. _(Felix Checkers C, Family Habits)_

## SVG and graphics

- Use `viewBox` only, and size the SVG with CSS on a wrapper. Never also scale coordinates in JS (that double-scales). _(Primes 01 B, Moment C)_
- Compute the full geometry once and reveal parts of it, so nodes don't jump. _(Primes 01 A)_
- CSS rules beat SVG presentation attributes. Color through classes or `style.fill`. _(Primes 01 D)_
- Rotate SVG groups with `transform-box: fill-box; transform-origin: center`. Keep fixed overlays (pointers) outside the rotating group. _(Moment A/B)_
- Hand-written SVG charts are enough for dependency-free dashboards. Browser-check both empty and non-empty data. _(Family Accounting)_

## Supabase web apps (static site + Supabase)

- **Check the live schema** before trusting `schema.sql` (ask for a screenshot or query `information_schema`). _(Allowances)_
- **Empty results without an error usually mean RLS filtering.** Make sure the user's `parents`/family row exists. _(Allowances)_
- **Errors on screen, opt-in:** a shared `_logError` plus a bottom error panel toggled from the gear. _(Moment D/E, Allowances, Family Habits)_
- **Offline fallback in 3 tiers:** live API (with timeout) → localStorage cache (TTL) → bundled JSON. Jimmy values this. _(Moment H)_
- Only the publishable key goes in browser code; never the service-role key.
- Add an in-app diagnostics check that pings each table. _(Family Habits)_
- **One shared Family Supabase project:** family apps reuse its login and `family_members`. Each app prefixes its own tables (`allowance_*`, `storytime_*`, `speech_*`) and registers them in `app_table_registry`. Rules and template SQL are in `Supabase Registry/`. _(Allowances, StoryTime, Speech Therapy)_
- **One paste file per table, applied files never edited.** A new table or feature goes in its own SQL file with its own check row; the applied setup stays untouched. _(What to Cook)_
- **Feedback is marked done, not deleted.** Done items are ignored in later reviews; deletion is a written request only. _(What to Cook)_
- **Host apps that need a microphone, database or downloads on GitHub Pages, not Artifacts.** See `Tools/artifacts.md`. _(Speech Therapy)_

## Content and data projects

- **Content-driven apps:** keep content in JSON next to a generic engine, so new content doesn't need new code. Seen in Test Bank banks, Moment's game catalog, Row Boat's `scenario.json` and Family Habits' `affirmations.json`. _(Test Bank, Moment, Row Boat, Family Habits)_
- **Seeded generators: store the recipe, not the output.** One small record (style, seed, settings) rebuilds the picture, answer key, thumbnail and animation; fingerprint published recipes so code changes can't silently change them. _(Felix Maze)_
- Keep question content separate from the knowledge map, linked by stable IDs in both directions. _(Test Bank A/B)_
- Content QA is its own discipline: validate JSON, unique IDs, answer keys, and source quality. _(Test Bank C, Reader Level Test)_
- Store evidence at import time (e.g. statement balances) rather than reconstructing it later. _(Family Accounting)_
- Test the full path from ingestion to report, not just parsers. _(Family Accounting)_

## Process

The recurring lessons are consolidated in `lessons_pool.md`. Process-level ones:

- **Clarify before building:** two rounds of numbered questions in a convo file got Moment to an MVP in one pass. _(Moment v6.1–v6.2)_
- **Verify on the real thing before calling it done:** live schema, real browser, real iPad. "Not browser-tested" is the most common open item across briefs. _(Allowances, Moment, Coins)_
- **Feedback rounds work best as numbered wishes and bugs**, one convo file per round. _(Moment v6.3–v6.5)_
- **Seeds feed seeds:** reuse style and lessons from the closest earlier project on purpose (Family Habits → Moment, Allowances → Family Habits). _(Moment, Family Habits)_
- **Q&A in versioned convo files, never compacted.** When a decision is superseded, mark it in the brief, not by rewriting history. _(Family Accounting)_
- **Split single-file apps** into css/js once they grow. Top-level registries that reference later functions must live in the last-loaded script. _(Coins tech notes)_
- **Respect dropped features.** Don't re-add something Jimmy removed. _(Allowances)_
- **Render, look, then change (for visual work).** Build a page, render it to PNG with headless Chromium, compare the render with the reference, list the gaps, then make the next version as a new file (V1, V2, …). Keep the reference's pixel grid as the SVG `viewBox` so positions compare directly. About five changes per round. _(Living Room Scene)_
- **Keep a disliked mechanic behind a switch.** Keep the first version and add the alternative as a choice in ⚙️, so Jimmy can compare. _(Chinese Character Sudoku)_

## Template candidates

Patterns that repeat often enough to become a template in `02 Refs/Templates/` or a skill (Jimmy decides):

1. **Kids' iPad app starter:** `index.html` + `css/style.css` + `js/app.js` + `js/ui.js` (gear, settings, error panel; the ⚙️ block is in `02 Refs/Skills/settings_gear.md`), pastel theme variables, two-column layout. Sources: Moment, Coins, Row Boat.
2. **Supabase static-app starter:** `config.js`, `db.js` with 3-tier fallback and `_logError`, `schema.sql` with RLS template, diagnostics panel. Sources: Moment, Family Habits, Allowances.
3. **Question bank JSON + schema:** from `03 Projects/Test Bank/schema for test bank json.md`.
4. **Project brief template:** goal and boundaries · current implementation · data facts · validation (verified/unverified) · next steps. Source: Allowances and Family Accounting briefs.

## Versioned increments (2026-11-02, from Make 3D)

- **One function, numbered versions.** `defsFor(v)` builds each version from the same code. Each review adds an `if (v >= N)` block, so older versions can be rebuilt. A later version removes a part by key, not by deleting the code that built it.
- **Check that old versions do not change** after each new version (a diff of the generated files).
- **Each increment is one visible step** (shell, then counters, then stove, and so on), so a review can say what changed and why.

## Animation and long lists (2026-11-02, from Make 3D)

- **Motion is its own file, beside the model.** The model says what exists; the motion file says how it moves, by part id. The viewer applies a pose on top of the rest pose and never changes the model.
- **Loops by construction.** One loop length per file; each motion repeats a whole number of times per loop; paths close on themselves. Make the first frame the rest pose, so editing and export need no special case. Prove both in a test.
- **Groups as scene nodes** so a moving group carries its parts; at rest every node is the identity, so still scenes don't change.
- **Long lists of versions fold by project**, newest project first. Keep the dates and a content hash in a file the build maintains, so the order only changes when the content does.

## Test part, several views, then compose (2026-11-02, from Make 3D; Jimmy's praise)

- **Test one part alone.** A scratch scene with one of each part, at two headings, finds orientation and attachment mistakes before a thousand copies exist.
- **Several views of the whole.** Render the full scene from the front, behind and the side, zoomed and dragged by a small script, and review each view. Put the scratch scripts in the scratchpad, not the repo.
- **Then put them together.** The final increment image is chosen from these views; the review page says which view it is.

## Physics replay for objects that change over time (Paper Again)

- **The record is the story, not the shape.** An ordered list of operations plus a seed; every frame is replayed from it. Deterministic seeded random numbers only. _(Paper Again, Growth)_
- **Plastic memory:** bend springs with a yield, whose rest length follows the bent shape, keep creases after the force is gone. _(Paper Again)_
- **Cuts and tears on the material's coordinates,** breaking every spring that crosses the line. _(Paper Again)_
- **Contact friction and a stand-in hold** for shapes that must stay together, listed as a known limit. _(Paper Again)_
- **Baked cache with a fingerprint,** loaded by a script tag, with live fallback and progress. _(Paper Again)_
- **Template candidate:** `02 Refs/Skills/simulate_decay.md` (run as `/simulate-decay`).

## Sweep a profile without a sweep object (Cornice, Make 3D)

- **Slice the outline into horizontal bands,** each as wide as the outline is at that height. Place each band along the path: straights as single boxes, arcs as short boxes rotated about Z so their local x runs along the inward normal. Use it when the engine has no sweep and the piece must turn corners. _(Cornice)_

## Prompt-style planning page for a simulation (Growth)

- **Sections written as "Here is…":** the start, the environment and its variables, how time works, what happens, ask the AI, then (look, keep, run). The page edits one world object; the numbers recalculate as you type. _(Growth)_
- **World format plus time models:** one JSON-like world, a model per world (`ecosystem` computed, `recorded` from a run) chosen by `time.model.type`. _(Growth)_
- **Story tokens** (`{rabbits}`), resolved from each step's state. _(Growth)_
- **Copy-and-paste AI loop** and a tolerant reply reader. _(Growth)_
- **Open by link:** `?world=<id>&step=<n>`, and `#draft=` for unsaved edits (untrusted data). _(Growth, Increment Viewer)_
- **State card** for a step that has no picture: bars scaled to each series' highest value. _(Increment Viewer)_
- **Template candidate:** a skill that starts from this page (the `/simulate-decay` questions and sign-off are sections 1 to 3). Not written; needs Jimmy's go-ahead to edit `02 Refs/Skills/`.

## Game with a rules core and a balance bot (Felix Gear Wars)

- **Rules in a DOM-free file** (`sim.js`) with a fixed step, seeded random numbers and an event list that the screen drains for particles and sound. The same file runs in Node, so a bot plays every level and a matrix checks every counter. _(Felix Gear Wars)_
- **Counters as data:** each unit has `vs: {type: multiplier}`, `shield`, `magic`, `hunts`; damage = attack × counter × 40/(40 + defence). Balance by editing numbers, not code. _(Felix Gear Wars)_
- **Meshing gears on a grid:** tip = pitch + 4, root = pitch − 4, 12 teeth, neighbours alternate direction, odd parity gets a 15° phase. _(Felix Gear Wars)_
- **Heart and chains:** ticks fan out over the gear graph with the best-path multiplier; a gear reached from several sides sums them. _(Felix Gear Wars)_
- **Art styles by one colour filter:** `Art.C(hex)` (saturation, lightness, tint), a line weight, a pre-painted frame; the UI colours are CSS variables set by the same switch. _(Felix Gear Wars)_
- **Jointed figures from parts in code:** legs, torso, head, arms with two segments, weapon; poses from a walk phase and an attack progress; team look by palette, hat, scarf and boots. _(Felix Gear Wars)_
- **Canvas HUD with hit-tested buttons** and pointer capture for drag; pan, buy and sell are one pointer path. _(Felix Gear Wars)_
- **Template candidate:** a skill for "game with a balance bot" (sim file, matrix, campaign bot). Not written; needs Jimmy's go-ahead to edit `02 Refs/Skills/`.

## Knowledge first, renderer last (Mind Palace)

- **Three layers:** a database file with no DOM (schema, repair, editing, undo, search), a layout file with no DOM (plain positions, sizes and routes), and a renderer that only draws and reports taps. The first two run in Node. _(Mind Palace)_
- **Repair on load, never refuse:** fill missing fields, drop broken links, give lost things a "Lost and found", and list what was fixed. _(Mind Palace)_
- **Logical parent and physical place as two fields,** so a thing can belong to one topic and stand in the room of another. _(Mind Palace)_
- **Practice counted in kinds** (what it is, where it is), each with its own spaced boxes. _(Mind Palace)_

## Gaussian splats from simple shapes, in the browser (Mind Palace)

- **Pipeline:** layout → flat list of simple shapes → points scattered over each surface → one Gaussian per point (middle, spread from the normal, colour with light painted in, strength) → float texture → counting sort far to near → instanced rectangles, blended. Plain WebGL 2, no library. _(Mind Palace `js/scene.js`, `js/gauss.js`, `js/splatview.js`)_
- **Detail weights and a budget,** so the things to recognise keep their splats. _(Mind Palace)_
- **Fuzz as a meaning:** vague when not practised, sharp when known. _(Mind Palace)_
- **One object library for two renderers:** build each object with the real library in Node, read back the meshes, write simple shapes as JSON. _(Mind Palace `tools/export_godot_data.js`)_


## Hands-free recorder (Athena's Piano Companion, 2026-11-20)
- **Audio-clock listener:** microphone → AudioWorklet (ScriptProcessor fallback) → `feed(samples)` → level with a learned noise floor, onsets (jump over the last four steps), rough pitch by autocorrelation, capture buffer. Testable by feeding arrays. _(`js/listen.js`)_
- **Trim a take:** envelope in 10 ms windows, threshold from the take's own peak, skip the count-in leak, keep a short lead-in and a natural decay, cosine fades. Pure function. _(`js/trim.js`)_
- **Learned stop gesture:** store rhythm and rough pitch; match the tail of the onset list; require a pause before it. _(`js/listen.js`, `js/recorder.js`)_
- **Local-first store with sync:** IndexedDB holds records and audio; `_dirty`, `_up` flags; push (audio first, then row, upsert), pull (never overwrite a dirty record); sync only when idle. _(`js/store.js`)_
- **Clip engine:** snip, repeat, extend by tail loop with overlap-add, speed by linear resampling, reverse, fades, mix with a limiter. Pure function. _(`js/mixer.js`)_
- Template candidates: the shared ⚙️ builder (`js/chrome.js`) and the sync store could become skills.

## Headless GIF of a motion (2026-11-25)
- Play a drag in fixed steps in headless Chromium, save a PNG per frame, and build a GIF with Pillow. Tools: `02 Refs/Skills/scripts/anim_capture.js` and `frames_to_gif.py`; skill `/anim-gif`.
- Serve pages over http for pixel tests: file:// canvases are tainted.

## iPad UI Components Library (2026-11-25, consolidated)

Shared patterns from settings_gear, game_controls, collapsible panels, and feedback_notes:

**Settings Gear (⚙️ button)**
- Lower-right corner, faded until hovered
- Drawer or modal with segmented options
- Error panel behind opt-in toggle at bottom
- Database health check
- Uses in: Adventure, Felix Maze, Make 3D, all family apps
- Build from: `02 Refs/Skills/settings_gear.md`

**Game Controls (iPad games)**
- Primary: center-relative drag (player-relative coordinate)
- Alternative: lower-left joystick (sized to width, transparent on iPad)
- Action buttons: lower-right, large touch targets (48px+)
- Settings gear: upper-right, faded
- Uses in: Felix Checkers, any game with motion or aim
- Build from: `02 Refs/Skills/game_controls.md`

**Feedback Notes (⚙️ inside)**
- In-page "Notes for improvement" box
- Tied to item on screen (map, card, detail)
- Saved to device first (localStorage), read back
- Copyable to share with team
- Workflow: app captures → `feedback_notes` UI ↔ Supabase → `/consolidate-knowledge` backend → convo & todo
- Uses in: Felix Maze, QC apps
- Build from: `02 Refs/Skills/feedback_notes.md`

**Collapsible Panels**
- Header: icon + name + ▸/▾ marker
- State saved per device (localStorage, try/catch safe)
- Default: closed on small screen (track A), open on large (track B)
- Never hide a panel; collapsed sections keep header visible
- Code: HTML pattern + CSS variables + vanilla JS toggle
- Uses in: all layout-heavy projects
- Build from: `02 Refs/Workflow/project_track.md` (shared code snippets)

**Next step: Extract shared component registry** (not yet done)
- One HTML template library for the common UI elements
- Could become a reusable starter or separate skill

---

## Feedback Loop Workflow (2026-11-25, linked)

Two-part workflow: capture → process

**Capture:** `feedback_notes` skill
- In-page UI for collecting "Notes for improvement"
- Tied to item on screen, saved to device, copyable
- Synced to Supabase `<app>_notes` table

**Process:** `read_notes_and_update` skill
- Reads feedback from Supabase table
- Turns into to-do items and convo rounds
- Marks handled notes as done after user confirms

**Used by:** Felix Maze, QC projects, any project with user feedback
**See also:** `/consolidate-knowledge` for consolidating the feedback into lessons

---

## Skill consolidation and working copies (2026-11-25)

**Merge similar skills to reduce duplication:**
- When two skills solve the same problem two ways (manual + programmatic), merge into one with both paths or choose the better one. Example: `supabase_link` (manual SQL paste) + `supabase_project` (programmatic) → `supabase_setup` (programmatic only, cleaner).

**Working copy architecture for iterating skills:**
- Frequently-improved skills live in `04 AI/Skills/` as working copies, with stubs in `02 Refs/Skills/` that point to them.
- Structure: `.claude/skills/<name>/SKILL.md` (wrapper) → `02 Refs/Skills/<name>.md` (stub) → `04 AI/Skills/<name>.md` (working copy).
- Current working copies (7): smoke_test, summarize_code, game_controls, settings_gear, supabase_setup, access_requests, monthly_checkup.
- Reference skills (maintained by Jimmy) stay in `02 Refs/` only: start_project, ipad_website, privacy_check. Workflow guides stay in `02 Refs/Workflow/`: project_track, family_project_track, architecture_project_track.

**Skill consolidation candidates:**
- `update_lessons_learned` + `ai_consolidate` are almost identical (review, log, archive); could unify with two modes.
- UI component patterns (settings_gear, game_controls, feedback_notes, collapsible panels) → extract shared HTML/CSS/JS patterns into `04 AI/patterns.md` or a "iPad UI Kit" reference (started in iPad UI Components Library section above).
- `read_notes_and_update` (backend) + `feedback_notes` (UI) are complementary; link them in documentation.
- Story workflow (consider_actions, update_story, gather_story_lessons_learned) is adventure-specific but pattern could apply to future narrative projects.

**Deprecation pattern:**
- When a skill becomes obsolete, move `.md` file to `deprecated/` with a note explaining why and what replaced it. Keep for historical reference.
- Deprecated skills this round: supabase_link, supabase_project (merged); anim_gif, simulate_decay, make_3d, make_sticker, fix_puzzles (project-specific to graduated projects).
