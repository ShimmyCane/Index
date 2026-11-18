# Mind Palace — schematic

**Track: A. Family play** (a palace for each family member; Jimmy's first, for the others to walk through), with studio-level depth kept in collapsed panels.

Status (2026-11-18), version 0.3.1 (fog radius doubled; lantern and fireflies added), headless-tested, not yet tried on an iPad:
- **`index.html`** (the default page): the palace drawn with Gaussian splats in plain WebGL 2 (no three.js). Walk, search, walk-up pop-ups, Wander, a fuzziness slider, fog of war, moving things on loops.
- **`build.html`** (three.js): the Build page, where things are added, changed, connected and practised.
- **`godot/`**: a Godot 4.3 application, written and never run (`godot/schematic.md`). Jimmy tests it himself.

## Purpose

A memory palace you can walk through. Each thing to remember is a recognisable object, standing in a room, in a world. Search a word and little-me walks there. Practise recalling. Move things, connect them, and let the palace grow as more is kept in it.

Source: Jimmy's concept and specification 0.1 (November 2026), summarised in `convo/convo v0.1.md`.

## Guiding rule

The knowledge database is the substance. The palace is one drawing of it.

```
knowledge database  →  scene description  →  renderer
js/model.js            js/layout.js          js/scene.js → js/gauss.js → js/splatview.js   (web, Gaussian splats)
                                             js/view.js            (web Build page, three.js)
data/palace.json       palace_layout.gd      palace_renderer.gd    (Godot, solid look)
                       + palace_builder.gd   splat_cloud.gd        (Godot, Gaussian splats)
```

The two share the data schema and the object library: `tools/export_godot_data.js` writes `godot/data/objects.json` (the 29 objects as simple shapes) and `godot/data/palace.json` (the sample). Run it after changing `js/objects.js` or `js/sample.js`.

- `model.js` and `layout.js` use no DOM and no 3-D library. They run in Node. Search, the map and practice work with no renderer.
- `view.js` draws a scene description and never reads or changes the database. It reports taps and drops to the page.
- The layout rules exist twice for now (`js/layout.js` and `godot/scripts/palace_layout.gd`). Change both together until Godot owns editing (G3).

## Track defaults

| Setting | This project |
|---|---|
| Words on screen | Few on the scene (signs and name tags). Full words in the card and the panels |
| Panels (☰) | Find · Map of my mind · Practise · Build · Save and open. Collapsible. Hidden behind ☰ on a phone |
| Under the scene | All, Look, Walk, Move, Spin, Undo, Redo |
| ⚙️ holds | Sound, name tags, connection lines, walking speed, shadows, storage check, notes, Show errors, version |
| Database | Family database, planned (see Family sync). Device storage only today |
| Private data | None in the repo. The sample palace is made-up school facts. A real palace stays on the device |

## Data (schema 1)

One JSON object. `js/model.js` `validate()` repairs anything loaded from outside.

| Entity | Fields | Notes |
|---|---|---|
| World | `id, name, style, transform.position` | A big subject. Drawn as a floating island |
| Place | `id, name, type, parent_id, transform, style` | A room. `parent_id` is its world. Position is absolute |
| Node | `id, type, title, description, tags, question, answer, parent_id, place_id, asset_id, transform.position` | A memory. `parent_id` is the **logical** topic (a world or a node). `place_id` is the **physical** room. They are separate on purpose. Position is relative to the room |
| Relationship | `id, source, target, type, strength` | Types: goes with, leads to, is part of, is the opposite of, reminds me of |
| Asset | `id, type, representation, kind, glyph, color` | `procedural` (one of 29 built objects) or `emoji` |
| Recall record | `id, node_id, kind, result, at` | `kind`: what or where. `result`: knew, almost, forgot |
| Route, Design proposal | arrays, kept and passed through | Not used yet |

Differences from the specification's example: a world does not store `places` and a place does not store `node_ids`. Both are worked out from `parent_id` and `place_id`, so there is one source and they cannot disagree.

## Rules

- **Rooms grow by count:** Nook (0), Room (3), Hall (6), Library (10), Tower (16). Size shows how much is kept, not how well it is known. The room card says so.
- **Practice shows on the stand:** a bronze ring at box 2, a gold ring and a small star at box 4.
- **Two kinds of practice, counted apart:** *what* (at the object, say what it holds) and *where* (given the name, tap its room). Boxes 0 to 5 wait 0, 1, 2, 4, 8, 16 days. Knew moves up a box; forgot goes to 0; almost stays.
- **Routes:** object → room door → plaza → bridges → plaza → door → object. Bridges are the shortest set that joins every world, so there is always one way through.
- **Nothing is lost by moving or removing a space:** a room can be removed only when empty, a world only with no rooms. Moving a memory keeps its connections.
- **Undo and redo** cover every change (60 steps). Practice history is never undone.
- **Search** scores the title (5), tags (4), words (2), room (2), world (1) and object (1), and drops filler words such as "where did I put".

## Files

| File | What it does |
|---|---|
| `index.html`, `css/style.css` | The page |
| `js/core.js` | Version, settings, error list, storage |
| `js/model.js` | The database: schema, repair, editing, undo, search, practice |
| `js/sample.js` | The sample palace. Content only |
| `js/layout.js` | Database → scene description; routes; which room a point is in |
| `js/objects.js` | 29 objects made from simple shapes, and emoji cards |
| `js/view.js` | three.js: islands, rooms, bridges, little-me, camera, picking, dragging |
| `js/scene.js` | Layout → a flat list of simple shapes (box, cylinder, sphere, ring, prism) and signs; `decorate` adds trees, a windmill, birds, a balloon, a walker and a gear, the last five moving on loops. No DOM |
| `js/gauss.js` | Shapes → Gaussian splats (sampling, fuzz, `.ply`). No DOM |
| `js/splatview.js` | The splat renderer: WebGL 2; moves blocks, fog of war, sort far to near, blend |
| `js/splatpage.js`, `index.html`, `css/splat.css` | The splat page (default) |
| `js/objects_data.js` | The object library as simple shapes. Made by `tools/export_godot_data.js` |
| `js/audio.js` | Sounds made with Web Audio |
| `js/notes.js` | Notes for improvement |
| `js/app.js` | Panels, search, card, practice, forms, saving, ⚙️ |
| `js/vendor/three.min.js` | three.js r128 (MIT), copied in so the page opens from `file://` |
| `tools/export_godot_data.js` | Node script: writes the object library and the sample palace for Godot |
| `godot/` | The Godot 4.3 application. Its own schematic: `godot/schematic.md` |

## Feedback notes

"Notes for improvement" in ⚙️. Each note is saved with the thing selected (a memory, a room, a world, or the whole palace), the time and the version. Open and All filter, Copy notes. Device storage only, key `mindpalace.notes`. Sent nowhere. A family table is question 3.

## Moving things and fog of war (0.3.0)

| Thing | Motion (every splat of it moves together, rigidly) | Loop |
|---|---|---|
| Windmill blades | spin about the hub | 8 s |
| Birds (three) | fly a wide loop over the island, turning to face along the path | 14, 18, 22 s |
| Balloon | bobs up and down | 5 to 8 s |
| A walker | goes round the plaza, facing along the path | 22 s |
| A gear on a post | turns | 9 s |
| Little-me | follows her own position and heading | as you walk |

Each moving part is a block (1 is little-me; the rest from 2). A splat keeps its block in its texture. Every frame the page gives each block a rotation and a position; the shader moves the splats, and the CPU moves the same splats for the back-to-front sort. Trees (round, pine, blossom) are still.

Fog of war: within a radius around little-me the palace is lit; beyond it the splats fade to black, and their names go too. The radius is 6 + the "How far you can see" setting (10 to 100, times 0.45) + 0.35 times the camera distance, so zooming out reveals more. Settings: Fog of war on/off, How far you can see, Moving things Move/Still.

Not in Godot yet: the moving things and the fog exist only on the web splat view.

## Technique in use (2026-11-18)

| Part | Gaussian splats | SDF |
|---|---|---|
| Web splat view | yes | no |
| Build page | no (three.js meshes) | no |
| Godot project (never run) | yes (a port) | no |

SDF is a proposed next step for shaping rooms and objects (convo v0.5).

## Splats (how the splat view works)

| Step | File | What happens |
|---|---|---|
| Shapes | `scene.js` | The layout becomes about 460 simple shapes for the sample palace |
| Sample | `gauss.js` | Points are scattered over each surface. Memory objects get 5 times the density and keep it; islands get 0.3 times. Budget: 80,000, 170,000 or 300,000 |
| Make a Gaussian | `gauss.js` | Each point gets a middle, a spread (wide along the surface, thin across it), a colour with the light painted in, and a strength |
| Fuzz | `gauss.js` | Fuzz pushes points off the surface, swells them and weakens them. From the slider (0 to 100) times 0.1 to 1.0 by practice box for a memory, 0.3 for scenery |
| Store | `splatview.js` | One float texture, three texels per splat |
| Sort | `splatview.js` | Every drawn frame, a counting sort on distance from the eye |
| Draw | `splatview.js` | One rectangle per splat. The vertex shader projects the 3-D spread to a 2-D ellipse; the fragment shader fades it as a bell curve; blending is back to front |

Little-me is the last block of splats; the shader moves and turns that block. The page only redraws when something moved.

Not this: not trained from photos, no view-dependent colour, no walls in the way, no editing (use Build).

## Family sync (planned, nothing applied)

Jimmy's answers: sync with the family database; **a palace for each family member**; the others can walk through his.

| Table | Holds | Rule |
|---|---|---|
| `mp_palace` | One row per palace: `id`, `owner` (a family member), `name`, `data` (the JSON without practice), `version` (a counter), `updated_at` | Only the owner writes. Every family member reads. A save sends the version it started from; if the row has moved on, the newer save wins and the older one is kept in `mp_palace_copies` |
| `mp_recall` | One row per practice answer: `id`, `palace_id`, `node_id`, `kind`, `result`, `at`, `member` | Added only, never overwritten, so two devices can practise at once |
| `mp_notes` | Notes for improvement, in the shape `/start-project` step 8 gives | Same as the other family apps |

- Family project, family sign-in, row-level security on, `anon` revoked, registered in `app_table_registry`. Publishable key only.
- Device first: the palace always works signed out. Signed in, it pulls on open and pushes after a change.
- `member` on a practice answer lets each person have their own "known" rings (and their own fuzziness) in someone else's palace.
- Next step: write the paste files with `/supabase-link`, test in a rolled-back transaction, apply only when Jimmy says.
- A real palace (childhood) is personal. It lives in the database and on devices, never in this repo.

## Decisions from convo v0.1 (2026-11-17)

| Topic | Decision |
|---|---|
| Renderer | Godot now; three.js is a placeholder |
| Splats | Started in Godot (sampled from the palace) |
| Palaces | One, shared |
| Looks | Childish and grand |
| Sync | Family database, planned above |
| First content | Jimmy: childhood. Felix: to ask |
| AI architect | Copy and paste loop |
| Walking | Solid walls, ramps and stairs |
| Growth | Worlds change with rooms, bridges appear with connections, a landmark for the best-known memory |
| Practice | Rounds of five, plus a tour mode |
| Devices | All |

## Decisions from convo v0.2 (2026-11-17)

| Topic | Decision |
|---|---|
| Palaces | One per family member (replaces "one, shared"). Built on the device; sync planned |
| First content | Jimmy's childhood homes as floor plans: a rectangle first, then doors between rooms. Not built; questions in convo v0.3 |
| Splats | The point of the project. On the web, no three.js. Modelled or AI-made, no scans for now |
| Godot | Jimmy tests it himself; the engine is not run in build sessions |
| Tour | Free walking with walk-up pop-ups and "read more" (built), plus Wander |
| Looks | Residential now; libraries, the arcane and great halls later |

## What this is not (0.2.0)

- No AI collaborator yet. The data has a `proposals` list ready; the plan is the copy-and-paste loop (`02 Refs/Skills/ai_json_loop.md`) with preview, accept some, reject.
- Godot and splats exist only as an unrun first increment (`godot/`). No SDF yet.
- Not real architecture: rooms are open-topped boxes on floating islands. No stairs, hidden rooms, portals or changing scale yet.
- No collisions. Little-me walks through walls and floats over gaps.
- Device storage is `localStorage`, not IndexedDB. Enough for text; it changes when pictures or sounds are added.
- No sync between devices yet. Palaces are kept apart on one device.
- No floor plans yet: rooms are still squares that grow by count.
