# Salmon Leap: Claude Code pointer

Purpose: a bronze statue of an Atlantic salmon leaping up, built in five versions. V1 narrative and massing; V2 narrative, light, colour, texture and background set-up; V3 concept and details, seen from every side; V4 details increment; V5 the ground. Later: V10 movement, rendering and atmosphere; V15 sound.

- Track: B. Studio design.
- Schematic: `schematic.md`. Q&A: `convo/` (never compact; new version per round).
- References: `research/salmon-references.md`. Lessons learned: `04 AI/Salmon Leap/lessons.md` (in the nursery).
- Before a model or scene change: read `04 AI/Graduated/Make-3D x Construct/model_iteration_lessons.md` and `04 AI/Graduated/Make-3D x Construct/scene_craft_lessons.md` (in the Make-3D x Construct notes).

Run: open `index.html` (no server). Build the five versions: `node tools/build_versions.js`. Test: `node tests/test_versions.js`.
The engine (`js/core/model.js`, `js/core/loft.js`) is copied from Make-3D x Construct; the viewer (`js/viewer/viewer.js`) too.

Project rules:
- Public repo. The statue is an original design.
- Every change is an operation in the history. Never write `null`; unknown values are left out and flagged.
- Build from parts: lofts for the body and fins, boxes and cylinders for the base and supports. Check the size in inches before adding detail.
