# Mind Palace — brief

**Goal.** A memory palace to walk through, for Felix and Jimmy: memories as recognisable objects in rooms in worlds; search and walk there; practise recall; move, connect and grow. Track A (to confirm, convo v0.1 question 1).

**State (2026-11-17): MVP 0.1.0**, on a draft PR, not merged.

**Architecture.** Plain HTML/CSS/JS, classic scripts, three.js r128 vendored. Three layers: `model.js` (database, repair, undo, search, practice; no DOM) → `layout.js` (scene description, routes; no DOM) → `view.js` + `objects.js` (three.js). `app.js` is the page. Device storage (`localStorage`). A node's topic (`parent_id`) and room (`place_id`) are separate.

**Built.** Sample palace (3 worlds, 6 rooms, 19 memories, 10 connections); orbit, pinch, pan, spin; walk with keys or stick, tap a floor to walk there, first person when zoomed all the way in; search with a walked route and beacons; card with topic, room, connections and two practice meters; practice rounds (what, where, both) with spaced boxes; add and change worlds, rooms and memories (29 objects, emoji, colours); connect; drag to move objects, rooms and worlds; raise a room by floors; rooms grow by count; undo and redo; save a copy, open a copy with repair; ⚙️ with notes, storage check and opt-in errors.

**Verified (headless Chromium, software GL):** 54 checks at 1180 × 820 and 390 × 844 plus a load at 768 × 1024: zero errors, no sideways scroll, buttons ≥ 48 px, gear clear of the bar, search and arrival, link across worlds, build and grow, drag a room, undo, orbit, wheel, pinch, spin, walk, first person, both practice kinds recorded apart, settings, note kept after reload, export, reload, import, repair of a broken file, print. Model, search, routes and repair also checked in Node.

**Not verified:** a real iPad (speed, fingers, the stick, drag in Move), colour emoji objects, sound on device, saving a file on iPad.

**Not built:** AI collaborator, Godot, SDF, splats, collisions, stairs and portals, saved routes, pictures and sounds, several palaces, sync.

**Decisions made without asking:** in `03 Projects/Mind Palace/convo/convo v0.1.md`.

**Next.** Answers to convo v0.1; candidates in `todo.md`.
