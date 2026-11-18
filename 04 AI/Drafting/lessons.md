# Drafting — lessons

Project-specific lessons, newest first. Generic ones go to `04 AI/lessons_pool.md`.

## 2026-11-18 — research and start

1. **Read the request's words as the user's words first.** Several words came through as sound-alikes: "cat" (AutoCAD), "rabbit" (Revit), "litter" (linter), and a garbled sentence about where the project sits. Put each reading in the convo and ask one short question, instead of guessing silently.
2. **Check what already exists in every sibling repo before saying "none".** A first search of Make-3D found no DXF code, and the note "nothing exists" was wrong for the nursery as a whole. Quick Detail's v1 folder has an R12 DXF writer, and the lessons pool records it as viable. Search all repos, `history/` folders included, before writing a "not built" claim.
3. **Mark each format claim as confirmed, partly confirmed or open.** Search snippets often give one example and not the rule. The research note says which is which, so the next session does not build on a guess.
4. **Real inches, not scaled inches.** Quick Detail draws in real inches and uses the scale only for paper size. An export that multiplies by the scale factor would be four times too big at 3"=1'-0". Write the unit rule into the schematic before any code.
5. **A Revit family is not a mesh.** An imported DXF is geometry, not a parametric family. Make-3D's own convo already asks Jimmy this, so the answer decides the 3-D path before any writer is built.
