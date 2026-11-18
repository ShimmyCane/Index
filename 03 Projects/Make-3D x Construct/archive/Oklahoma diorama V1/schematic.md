# Make-3D x Construct — Schematic

**Status:** MVP 0.5 built: Southern Cheyenne camp move, 146 parts in three planes, real scale, bones and posed figures (draft, not for display until consultation) · round 6 answers in `convo/convo v0.6.md` · **Updated:** 2026-11-18
**Track:** B. Studio design (`02 Refs/Skills/project_track.md`)
**Based on:** a review of Construct (`rtmandreyev/construct`, commit `7ea702e`, toolkit version 1.3.2), the Make-3D schematic and to-do list (graduated to `ShimmyCane/Make-3D`), and the nursery's new-project workflow. Nothing is built yet. The first build waits for Jimmy's answers.

## 0. Attribution

Construct is by **Artyom Andreyev (rtmandreyev)**, licensed under **Apache-2.0**. Source: https://github.com/rtmandreyev/construct. Its NOTICE says its working method is inspired by **Anatomy** (github.com/wheresryan22/anatomy, MIT).

- This project takes Construct's **processes** (how a description is checked, how facts carry certainty, how a build is reviewed in rounds). It copies **no code, text, images or assets** so far.
- Every page or file in this project that uses a Construct idea names its author and links to the repo (this section is the reference).
- If any Construct file is ever copied or adapted into this project, its `LICENSE` and `NOTICE` go in the same folder, with the copyright line and a note of what changed, as Apache-2.0 requires.
- If the new version shows credits in the app (an About panel), it names Construct, its author and the licence. Jimmy decides the wording (convo Q9).

## 1. Purpose

A new version of Make 3D, built with the working method Construct uses. Make 3D stays a browser 3-D sandbox where the **JSON file is the model**: objects are operations with stable IDs, a world file holds the rules, and a viewer renders and inspects the result. Construct adds the discipline around it:

1. **Check before build.** A model description is checked, and every problem comes back with its path, a code and a fix hint, before anything is drawn.
2. **Say how each thing is known.** Each fact and part carries a certainty (verified, user-supplied, inferred, decorative). Unknown values are left out, never written as `null`.
3. **Work in small rounds with a ledger.** Defects are logged with IDs, at most four are worked per round, and each round is judged against the best version kept so far.
4. **Look at it from several angles** before calling a change done.

## 2. What Construct does (reviewed)

| Construct process | Where it lives | What it means for Make 3D |
|---|---|---|
| A **contract**: the author writes a scene (data); a compiler makes geometry; renderers only read geometry | `CONTRACT.md` | Make 3D already has this shape: `history.json` (author) → replay → `model.json` (read by the viewer). Keep it, and write the contract version into each file. |
| **Same input, same bytes**: the compiler is deterministic | `CONTRIBUTING.md`, principles | Replaying the same history must give the same `model.json`. Add a hash of the history to the model, so a stale model is spotted. |
| **`check` returns every problem** with a path, a code and a repair hint (`diagnostics`, `repair_text`) | `SKILL.md`, `diagnose.py` | Extend the rules engine so reject and warn results carry the same three things. |
| **Audit runs to zero**: any warning left must be explained | `CONTRIBUTING.md` | A test that fails on any unexplained warning in the sample models. |
| **Provenance**: sources with rights, facts with certainty, a part's shape and size known apart (`certainty_axes`) | `references/provenance.md` | A part can say its size is measured and its shape is inferred. Sources are optional on the first build. |
| **Requirements**: what the user asked for is a fact, and the part that realises it names it | `provenance.md` | A world rule can say "the planter holds soil" and a part can point at it. Later, not in the first build. |
| **Masterpiece rounds**: a ledger of defects (open, fixed, regressed, known limit); at most four worked per round; every edit tagged with its ledger ID | `references/rounds.md` | How new versions get built: each increment is a round, each defect is one ledger line in `todo.md`. |
| **Blind critic**: a fresh reviewer sees only the renders, the references and the request, then compares the new version with the best one (unlabelled, A/B order shuffled) | `rounds.md` | Optional. Make 3D needs no model to run (`CLAUDE.md`). A human review from the same packet of renders is the first step; a model critic is a later option (convo Q2). |
| **Stop rules**: two rounds in a row that do not beat the best; every criterion at its top score; a round cap; an active-time cap | `rounds.md` | Adopt the first two. The caps are set by Jimmy (convo Q7). |
| **Known limits** are reported as skill gaps, not hidden | `rounds.md` | The final note for each version lists what the tools cannot do yet. Jimmy's "show the limits with the result" (`jimmy_preferences.md` §6). |
| **Honest shading**: a guess looks different from a measured thing | `provenance.md` (the provenance view) | A provenance view in the viewer, with the same colours as the certainty levels (convo Q4). |
| **One house style**: the renderer owns colour; scenes never choose it | `CONTRACT.md` §4 | Make 3D already fixes its look (Quick Detail paper and ink). Materials stay as the user sets them (convo Q6). |
| **Renders from several views**: the first view can hide the layout | `references/review.md`, `jimmy_preferences.md` §7 | Viewer snapshots from at least four angles for every review. |

## 3. What to adopt in round 1 (proposed, not yet confirmed)

- **P1 Schema and contract version** in every file (`make3d.model/x.y`, and the same for history and world).
- **P2 Deterministic replay** with a hash of the history stored in `model.json`. The viewer shows a warning when the two do not match.
- **P3 Check with fix hints.** Each rule result gives `code`, `path` (object ID and field), `message` and `fix`. Reject and warn results show them under the Reject flow (`todo.md` v0.3).
- **P4 Unknown means absent.** A missing measurement is left out. No `null` anywhere in the model.
- **P5 Certainty per part**, on two axes where they differ: size and shape. Values: `verified`, `user_supplied`, `inferred`, `decorative`.
- **P6 Defect ledger.** `todo.md` lists defects with IDs, status (open, fixed, regressed, known-limit) and the round they were first seen. Each change names its ID.
- **P7 Four-angle review.** A review snapshot set (front, side, top, and one oblique) for each version, kept with the version.
- **P8 Keep best.** A version that loses to the best in review is reverted, and the next round tries a different fix.

## 4. What not to take over

- **The hologram look and the line and point geometry.** Make 3D stays solid meshes with the Quick Detail look. Construct's holographic renderer is not used.
- **The Python toolkit.** Make 3D stays JavaScript: vanilla, no build, Node tests, no backend (`CLAUDE.md`). Construct's ideas are ported, not its code.
- **A model that writes the description on its own.** The LLM is optional (`schematic.md` §1 of Make 3D). Construct's agent-first flow is not the default.
- **Metres and Y-up.** Make 3D keeps inches and Z-up unless Jimmy asks to change it (convo Q8).
- **Construct's export paths** (glTF, FreeCAD, STEP, print, kits). Make 3D already exports GLB. Others are out of scope for now.

## 5. Track B defaults (`project_track.md`)

| Setting | Value for this project |
|---|---|
| Words on screen | full labels and units |
| Options visible | the working set, grouped in panels |
| ⚙️ holds | secondary and advanced options (convo Q10) |
| Panels | collapsible, open by default on a large screen |
| Palette | paper and ink (Quick Detail look) |
| Database | Architecture project, owner only (the existing `m3d_` tables), local storage first (convo Q11) |
| Private data | client or practice drawings in `private/`, never committed |
| Skills | `make_3d`, `summarize_code`, `privacy_check` |

## 6. Feedback, settings and database plan

- **⚙️ settings (step 5 of the skill):** the project is a web app, so the question is open (convo Q10). If yes, `settings_gear.md` applies: lower-right gear, options, opt-in errors at the bottom, a database check.
- **Feedback notes (step 7):** the viewer is a page Jimmy uses, so the feature is planned for the first increment: a "Notes for improvement" box in ⚙️, saved on the device with the item it is about and the time. Built from `feedback_notes.md`.
- **Family database (step 8):** not applicable. This is track B, and the database is the Architecture project's owner-only one.
- **Home page tile (step 9):** no page exists yet, so no tile is added now. The first build adds one in the same change, as the workflow requires.

## 7. Decisions from round 1 (`convo/convo v0.1.md`, answered)

- **Scope:** implement as much of Construct's method as possible, in JavaScript (Q1: c).
- **Judging:** a person and a model critic, both (Q2: c). The model critic is not built yet.
- **Order:** all the pieces in one first increment (Q3: doesn't matter).
- **Certainty:** a percentage per part, sortable and editable, saved to the Architecture database (Q4).
- **Unknown values:** left out and flagged, never `null` (Q5).
- **Look:** paper and ink, the user's materials (Q6).
- **Round limits:** at most four per round; stop after two rounds without a win; no time cap; explained in ⚙️ (Q7).
- **Units:** inches and Z up, as Make 3D (Q8).
- **Credit:** an About panel in ⚙️, near the bottom (Q9).
- **⚙️:** yes, with Notes for improvement (Q10).
- **Database:** table prefix `m3dxc_`, owner only, local first (Q11).
- **Start:** build fresh here, with a generic plains camp diorama as the sample (Q12).

## 8. Built in round 2 (2026-11-18)

- **Engine** (`js/core/model.js`): history replay, each operation checked before it is applied, 30 diagnostic codes with path and fix hint, certainty percent 0–100 with a basis, flags that explain warnings, FNV-1a history hash, world rules in `worlds/`.
- **Rounds** (`js/core/rounds.js`): ledger, four items per round, keep the best, stop rules, a packet with renders and open defects only (no history, no notes).
- **Viewer** (`js/viewer/viewer.js`): three.js r160, Z up, certainty colour (provenance view), drag, pinch, wheel, tap to select, four fixed views for a packet.
- **Page** (`index.html`, `js/app.js`, `css/app.css`): Model, Certainty, Flags, Ledger and rounds, Selected part; ⚙️ drawer with Show errors, How rounds work, Notes for improvement, Database check, About and credits (bottom). Errors shown at the bottom only when Show errors is on.
- **Sample** (`tools/diorama_scene.js` → `samples/plains-diorama/`): 32 objects, 6 open flags, placeholders marked. Research in `research/plains-diorama.md`.
- **Database** (`supabase/001_m3dxc_certainty.sql`): written and test SQL, **not applied**.
- **Tests:** 18 model tests, 14 rounds tests, 1 sample test: all pass.

Not built yet: the cloud save to `m3dxc_certainty`; the model critic; the Show errors and round scoring in the page beyond the rules; the summary page (`summarize_code`) for `index.html`; any device test.

## 9. Round 3 (2026-11-18): specific draft, reviews, consultation

- **Sample:** a Southern Cheyenne camp move on the North Fork of the Canadian, Indian Territory, 1870s. A draft. No named person, family, event, ceremony or sacred object. Placeholders for people and horses. See `research/plains-diorama.md` §9.
- **Story:** `exhibit/story.json`, six steps linked to objects; claims carry sources or are marked *scene choice*. The build checks every link and source.
- **Consultation:** a flag kind of its own. Open consultation flags block display (header pill and ⚙️ → Display check). Closing one needs a note: role, date, outcome. Plan in `research/consultation-plan.md`.
- **Reviews in ⚙️:** six switches, each with who does it: your verdict, your scores, an AI critic, an AI fact-check, the consultation gate, and the close note. AI reviews are copy and paste; replies are validated first.
- **Summary page:** `index_summary.html`.
- **Database:** `supabase/001_m3dxc_certainty.sql`, not applied. Jimmy copies it by hand after the merge.

## 10. Round 4 (2026-11-18): drawer, panels, scene, story

- **Drawer:** the items keep their height and the drawer scrolls. The earlier overlap made the taps land on the wrong item.
- **Panels:** two, the controls (Selected part first) and the 3-D view.
- **Scene:** 388 parts, seeded layout (`tools/diorama_scene.js`), warm late sun, shadows, sky, material colours. Colour modes: material, certainty, paper and ink.
- **Story:** `exhibit/story.json` v0.2, six steps, seven sources, two scene choices.

## 10b. Open questions

See `convo/convo v0.4.md`.

## 10. Open questions

See `convo/convo v0.3.md`.

## 11. Next steps (round 4)

1. Jimmy confirms the contact at the Cheyenne and Arapaho Tribes and sends the draft letter.
2. The reviewers' answers go to `private/`; each consultation flag is closed with its note.
3. Jimmy copies the database SQL by hand; then the cloud save can be wired.
4. Device test on an iPad before any display.

## 12. Round 5 (2026-11-18): rollback and density

- The round 4 fillers are removed. No object is added for its own sake.
- Density is detail in the existing objects. The scale is fixed to real sizes (1 in = 2 ft).
- Objects are built from real parts: lodges (cover, four leaning poles, door), horses (barrel, neck, head, legs), people (torso, arms, head, hair).
- Next density pass only when asked: bluff, struck cover, travois loads. See `convo/convo v0.5.md`.

## 13. Round 6 (2026-11-18): planes, bones, posed figures

- Three planes: background (ground, layered bluff, backdrop, back tufts), midground (lodges, struck cover, travois, people, fire ring, bones), foreground (horses, front tuft, label).
- Detail by plane. The lessons for any scene are in `04 AI/3d_scene_craft_lessons.md`.
- Figures: body, feet and poses. No faces (a decision for Jimmy: see `convo/convo v0.6.md`).
- Display gate stays on until Jimmy decides.
