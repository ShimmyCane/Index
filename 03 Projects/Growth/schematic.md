# Growth: schematic

Status: MVP, planning mode (2026-11-03). The Growth page writes a world like a prompt; the Increment Viewer opens it by link. The 3-D run, the animation and the cloud save are next (see `todo.md`).

## Purpose

A world simulator, planned in words and numbers first. Jimmy states a starting object or place, the environment and its rules, how time works, and the AI proposes the steps that happen. It can be one object (a sheet of paper decaying) or a whole ecosystem (a hillside, a river, a pair of rabbits that multiply while hawks and coyotes arrive). The environment can be anything: a hillside, a city, a lake, a stomach.

The page is for understanding and tweaking the story. Once the story is right, it is saved and run in the viewers.

## The pipeline

1. **Plan** (this project's page): seed, environment, time rules, steps. Edit anything. Ask the AI to write or revise the steps.
2. **Look** (Increment Viewer): `viewer.html?world=<id>` shows each step as a state card with the story beside it.
3. **Keep**: download the JSON (today), save to the cloud (drafted, not applied).
4. **Run** (later): 3-D scenes per step, then animation.

## The page (`index.html`, `js/app.js`)

Written like a prompt, top to bottom. Each section is "Here is…":

1. **Start with**: name, kind (growth, decay or collaboration), the starting object or place, the things in it with starting amounts, scenery.
2. **The place and its rules**: the environment in a sentence, and the environmental variables (name, value, unit, what it does). Each has a token, like `{hawk_start}`.
3. **How time works**: the unit (season, day, year), the number of increments, a calendar if it has one, the rules in plain words (tokens show the current numbers), and what is not modelled yet.
4. **What happens**: a chart of the numbers (each line scaled to its own highest point, with a plain-words reading), then one story card per step: the story with numbers put in, the landscape, the numbers, and "Edit this step" folded away.
5. **Ask the AI**: a prompt built from sections 1 to 3 and the numbers for every step. Copy it into Claude, paste the JSON reply back, and "Use these steps".
6. **Then**: open in the Increment Viewer (a saved world, or the current draft), download or copy the JSON, save to the cloud (not yet), run in 3-D, animate.

Also: a world picker (rabbits, paper decay, a blank world), edits saved on this device, and a ⚙️ drawer lower right (show errors, reset to the example, import a world). Errors stay hidden until asked for. Deep link: `index.html?world=<id>`.

## The world (schema 2)

One JSON-like object, in `worlds/<id>.js`:

| Part | Holds |
|---|---|
| `kind` | growth, decay or collaboration |
| `seed` | `prompt`, `scene` (list), `entities` (id, name, start, unit, note) |
| `environment` | `prompt`, `variables` (id, name, value, unit, note) |
| `time` | `unit`, `increments`, `perStep`, `calendar` (optional), `rules` (text with `{tokens}`), `notModelled`, `model: { type }` |
| `chart` | which numbers to plot (key, name, colour) |
| `steps` | per step: `label`, `narrative`, `landscape`, `events`, `open`, and `state` for recorded worlds |
| `outputs` | where to look: `viewer` (`{ world }` or `{ set }`), `model3d` |

Tokens: `{rabbits}`, `{hawks}`, `{plants_pct}`, `{season}`, `{year}`, `{landscape}` and so on are replaced by the step's numbers, so the story stays true when a variable changes. An unknown token is left as written, so a typo shows.

## Time models (`js/growth_model.js`)

A time model turns the world into a state for every increment. New ones are added to `MODELS`.

- **ecosystem** (rabbits): plants regrow by season and keep their roots when grazed; rabbits eat, breed when fed, and starve when not; a hawk settles above a rabbit count and a coyote above a higher one; predators follow last season's rabbits; a few rabbits always survive in deep burrows. Every number comes from the variables and the calendar. Fixed formulas, no random numbers, so the same settings always give the same story.
- **recorded**: the numbers come from a run (Paper Again's pieces, triangles and tallest point) and are shown as they were.

## Increment Viewer links

- `viewer.html?world=<id>`: a world from `Growth/worlds/<id>.js`.
- `&step=<n>`: open on one step (the slideshow waits for Play). The address follows the step you are on.
- `#draft=<base64>`: an unsaved world from the Growth page. It is data and shown only as text; pictures in a draft are ignored.
- Steps with no picture show a state card (bars scaled to each series' highest value). `?set=<name>` still works as before.

## Cloud (drafted, not applied)

`supabase/001_grw_worlds.sql`: `grw_worlds` (current world as jsonb) and `grw_world_versions` (every saved version), owner-only RLS, anon revoked, registered in `table_index`. Test in a rolled-back transaction first, then apply with `/supabase-project`. The live Architecture project was listed read-only on 2026-11-03: no `grw_` tables yet.

## Files

- `index.html`, `js/app.js`: the page. `js/growth_model.js`: the world, the time models, the prompt and the reply reader (no DOM).
- `worlds/`: `rabbits_hillside.js`, `paper_decay.js`, `index.js` (the list).
- `tests/test_growth_model.js`: validation, the rabbit model (boom, predators, landscape, determinism, variable changes), text tokens, the AI loop, the review the viewer reads.
- `tools/check_pages.js`: browser check of the page and the viewer links (`node tools/check_pages.js <screenshotDir>`).
- `supabase/`, `todo.md`, `convo/`.
- First attempt, kept: `paper3d.html`, `js/paper_engine.js`, `js/paper_story.js`, `tests/test_paper_engine.js`, `renders/` (superseded by Paper Again for the 3-D version).

## Known limits

- The rabbit model is a simple discrete model, tuned by hand to give a believable arc. It is not fitted to real rabbit data.
- The river and the slope are in the story, not in the numbers. Weather is not modelled.
- The story's words were written for the numbers as they stand; a large change to a variable may need a rewrite (section 5).
- The AI loop is copy and paste; the page never calls a model.
- Ten steps is too short to see whether the rabbit cycle settles.

## Open decisions

See `convo/convo v0.2.md`.
