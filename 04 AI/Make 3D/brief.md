# Make 3D — AI Brief

**Updated:** 2026-11-01
**Status:** idea, round 2 answered (`03 Projects/Make 3D/convo/convo v0.2.md`). Schematic updated (§0 lists the changes). Waiting on Jimmy to confirm the open items.

## Goal

A structured, cumulative geometry repository with a visual inspection engine, for Jimmy and his family, used on iPad and iPhone. Three things kept apart:
- **Model**: what exists (`model.json`, objects with stable IDs).
- **Rules**: what is allowed (`world.json`).
- **Evidence**: drawings and instructions that explain how the model was made (`history.json`; later `drawing.json` + `drawing.png`).

Four independent engines: input, geometry, rules, viewer. Three.js only renders.

## Decisions (round 2)

- MVP test model: the garden planter only. Outdoor table and kitchen are future.
- Users: family. Devices: iPad and iPhone, touch first.
- Position: origin is the centre of the major bounding box, refined by volume weighting when most elements are much smaller than the full box (convo v0.3 Q1–Q3 to confirm thresholds). Ground plane is a viewer setting, never stored.
- Z-up with a Y-up toggle. Rotation about Y only for now.
- Each object has `name`, `uuid` and `description`.
- Overlap allowed by default; a world rule `mode: flag` turns on a model-check flag.
- Reject: editor stays open, delete offending objects, or preview.
- Viewer MVP: orbit and zoom. Everything else future.
- Storage: local + cloud in the architecture database (`m3d_`), cloud from v0.4.
- Drawings are drawn in the app (Quick Detail is the reference).
- Look: Quick Detail palette, adapted as needed (confirmed).
- Units: imperial. Files store inches; display feet and inches (convo v0.3 Q4–Q5).
- History is the source of truth (confirmed).
- Editing: form and paste box (a + c), confirmed.

## Open

- Round 3 open: convo v0.3 Q1–Q6 (origin thresholds, weighting, inches storage, display precision, table length).

## Reference: Quick Detail

`shimmycane/quick-detail` (public, read-only clone used for review). Plain HTML/CSS/JS, no build. Pure logic in `sketch/` runs in Node; tests in `tests/`; code map in `docs/code-map/`. Palette: paper `#fbf6ea`, ink `#2d2a26`, pastel mint, sage, sky, peach, butter. 2.5 px ink lines. Cloud copy in Supabase. Lessons already in `lessons_pool.md` (single source of truth in real units; record relationships when created; `minmax(0, 1fr)` for grid columns).

## Next steps

1. Jimmy answers convo v0.3.
2. Freeze schema 0.1 and write the planter sample.
3. Prompt Jimmy before building v0.1.
