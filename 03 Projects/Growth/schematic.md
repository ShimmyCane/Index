# Growth: schematic

Status: idea. Started 2026-11-03 with `/start-project growth`. Questions are in `convo/convo v0.1.md`.

## Purpose

An algorithmic way to age a model. Instead of scaling a young model up to look old, a **subject** carries a history of **steps** (time). Each step applies rules to the model and the environment, so the model changes in a believable way over time. The first subject is a sheet of white paper that is stepped on, blown, torn, wet, cut and nested in.

The project links the other nursery tools into one loop:

- **Growth engine** (this project): the rules and the history. The source of truth.
- **Increment Viewer**: reviews the steps in order, as a slideshow and running log. Fast overview.
- **3-D viewer (Make 3D)**: opens one step as a live model. Snapshot in time.
- **Database (Supabase)**: stores the history as JSON, so no merge step is needed.

## Core idea: history, then replay

Same pattern as Make 3D (`history.json` is the source, `model.json` is the replayed result):

1. **Base**: the starting subject (a flat white sheet, dimensions, colour).
2. **Environment**: where it lives (outdoors, subway, damp, indoors). A set of rules: wind strength, wetness, traffic, pests.
3. **Steps**: `age 1..N`. Each step lists events. An event is a named operation with parameters, for example `crease`, `stamp`, `wind`, `tear`, `wet`, `pick_up`, `cut`, `nest`.
4. **Replay**: base + steps, in order, gives the state at any age. Same inputs and seed always give the same result.

Nothing is stored as a derived shape alone. The steps and seed are the record. Snapshots can be cached later, but they can always be rebuilt.

## Draft data shape (not final, to confirm in convo v0.1)

```json
{
  "schema": 1,
  "subject": { "id": "paper-sheet", "name": "White paper", "base": { "w": 8.5, "h": 11, "unit": "in" } },
  "environment": { "id": "outdoor", "rules": { "wind": 0.6, "wet": 0.2, "traffic": 0.5 } },
  "seed": 1234,
  "steps": [
    { "age": 1, "label": "Floating in the air", "events": [ { "op": "float", "params": {} } ] },
    { "age": 2, "label": "Stepped on", "events": [ { "op": "stamp", "params": { "shape": "boot" } } ] }
  ]
}
```

## Stages (from Jimmy's first narrative, to confirm)

| Steps | Stage | Events |
|---|---|---|
| 1–2 | Arrival | Floating in the air, a stamp (boot), a truck, a big crease |
| 3–4 | Weather | Blown by wind, a tear |
| 5+ | Life | Picks up junk, gets wet and fluffy, cut into two or more pieces, a nest with insects and animals |

Environment can be given by Jimmy or proposed by Claude from a place (outdoor, subway).

## Views

- **Increment Viewer**: one data file per story (`data/<name>.js`, `?set=<name>`). Each step has a render image, a description and the changes. Reuse the existing format.
- **3-D viewer**: one step opened as a model. Renders per step are made from the 3-D viewer and saved to `renders/`.
- **Quick view (⚙️ or a control)**: a time slider over the steps, so Jimmy can scrub. Layout follows the nursery iPad rules.

## Database (proposed, not built)

- Store the whole story as one `jsonb` row (history and environment), like `m3d_scenes`. The row is the record, so no merge.
- Table prefix `grw_` in the Architecture Supabase project, the same project Make 3D uses. Owner-only RLS, anon revoked, registered in `table_index`.
- Apply only after a rolled-back test, following `/supabase-project`.
- The public repo holds the rules and sample stories with synthetic data. The database holds the live story.

## Open decisions

See `convo/convo v0.1.md`. Current questions: total number of steps, the base sheet and its size, the environment, the 3-D look (mesh or flat with bends), whether each step gets a render, the database choice, and whether the engine should be general (for trees and objects later) or paper only at first.

## Out of scope (for now)

- Real physics or simulation.
- Any private family data or photos.
- Multiple subjects in one page.
