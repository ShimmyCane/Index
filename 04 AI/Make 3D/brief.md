# Make 3D — AI Brief

**Updated:** 2026-11-01
**Status:** idea. Set up with `/start-project`. MVP design drafted in `03 Projects/Make 3D/schematic.md` with proposed defaults; awaiting Jimmy's answers in `convo/convo v0.1.md`.

## Goal

A structured, cumulative geometry repository with a visual inspection engine. Three things kept apart:
- **Model** — what physically exists (`model.json`, objects with stable IDs).
- **Rules** — what is allowed to exist (`world.json`).
- **Evidence** — drawings, images and instructions that explain how the model was made (`history.json`, later `drawing.json` + `drawing.png`).

Four independent engines: input, geometry, rules, viewer. Three.js only renders; it can be replaced without touching the format.

## Decisions so far (from Jimmy's brief)

- Plain HTML/CSS/JS + Three.js + JSON, GitHub Pages. No backend, database or LLM.
- Roadmap v0.1–v0.8 (see `todo.md`). Drawings come last.
- Every object gets a persistent ID; every model a schema version; units and axes explicit; changes recorded as operations; validation outcomes accept / accept-with-warnings / reject; overlap is not automatically an error; rules configurable.
- No CAD kernel until booleans are truly needed.

## Open (convo v0.1)

Audience and look, device, up-axis, position anchor, ID style, history-as-source-of-truth, overlap method, editing style, Three.js hosting, MVP stopping point.

## Next steps

1. Jimmy answers convo v0.1.
2. Fix the schema (schematic §3–5) and write sample files.
3. Build v0.1 → v0.2 and prompt Jimmy before going further.
