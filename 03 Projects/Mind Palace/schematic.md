# Mind Palace — schematic

**Track: A. Family play** (a memory game for Felix and Jimmy), with studio-level depth kept in collapsed panels. The 3-D palace fills the screen. Family look: ink, paper and sun, over a pastel sky. This choice is question 1 in `convo/convo v0.1.md`.

Status: MVP 0.1.0 (2026-11-17). Headless-tested at three screen sizes. Not yet tried on an iPad.

## Purpose

A memory palace you can walk through. Each thing to remember is a recognisable object, standing in a room, in a world. Search a word and little-me walks there. Practise recalling. Move things, connect them, and let the palace grow as more is kept in it.

Source: Jimmy's concept and specification 0.1 (November 2026), summarised in `convo/convo v0.1.md`.

## Guiding rule

The knowledge database is the substance. The palace is one drawing of it.

```
knowledge database  →  scene description  →  renderer
js/model.js            js/layout.js          js/view.js (three.js today; Godot, SDF or splats later)
```

- `model.js` and `layout.js` use no DOM and no 3-D library. They run in Node. Search, the map and practice work with no renderer.
- `view.js` draws a scene description and never reads or changes the database. It reports taps and drops to the page.
- A second renderer replaces `view.js` and `objects.js` only.

## Track defaults

| Setting | This project |
|---|---|
| Words on screen | Few on the scene (signs and name tags). Full words in the card and the panels |
| Panels (☰) | Find · Map of my mind · Practise · Build · Save and open. Collapsible. Hidden behind ☰ on a phone |
| Under the scene | All, Look, Walk, Move, Spin, Undo, Redo |
| ⚙️ holds | Sound, name tags, connection lines, walking speed, shadows, storage check, notes, Show errors, version |
| Database | None. Device storage only (question 3) |
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
| `js/audio.js` | Sounds made with Web Audio |
| `js/notes.js` | Notes for improvement |
| `js/app.js` | Panels, search, card, practice, forms, saving, ⚙️ |
| `js/vendor/three.min.js` | three.js r128 (MIT), copied in so the page opens from `file://` |

## Feedback notes

"Notes for improvement" in ⚙️. Each note is saved with the thing selected (a memory, a room, a world, or the whole palace), the time and the version. Open and All filter, Copy notes. Device storage only, key `mindpalace.notes`. Sent nowhere. A family table is question 3.

## What this is not (0.1.0)

- No AI collaborator yet. The data has a `proposals` list ready; the plan is the copy-and-paste loop (`02 Refs/Skills/ai_json_loop.md`) with preview, accept some, reject.
- No Godot, no SDF, no Gaussian splats. The specification puts these in phase 5. The split above is what makes them possible later.
- Not real architecture: rooms are open-topped boxes on floating islands. No stairs, hidden rooms, portals or changing scale yet.
- No collisions. Little-me walks through walls and floats over gaps.
- Device storage is `localStorage`, not IndexedDB. Enough for text; it changes when pictures or sounds are added.
- One palace per device. No sync between devices.
