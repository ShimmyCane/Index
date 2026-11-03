# Growth: lessons learned

Project-specific lessons, appended over time. Generic ones are promoted to `04 AI/lessons_pool.md` and `04 AI/patterns.md`.

## 2026-11-03: from "it looks just like the Increment Viewer" to a planning page

1. **"It looks like X" means it does not do something new.** The Growth link opened the viewer with a story. Jimmy wanted a place to author a world, not another place to look at one. Ask what he does on the page, not only what he sees.
2. **Split the world from the time model.** One generic format (seed, environment, time rules, steps, outputs) plus a model per world. A computed model (rabbits) and a recorded one (paper, numbers from a run) both fit, so a lake or a city is a new model, not a new page.
3. **Put tokens in the story, not numbers.** `{rabbits}`, `{plants_pct}`, `{season}` keep the text true when a variable changes. Leave an unknown token as written so a typo shows.
4. **Run a population model before writing the story.** The first parameter sets crashed to zero. Real damping rules fixed it: plants keep their roots when grazed, rabbits find other food (bark, roots) when grass runs short, a few survive in deep burrows. Then the arc was believable: boom, predators arrive, crash, partial recovery, a second wave.
5. **Write the story after the numbers.** Resolving the text against the model showed wording problems ("the slope is in bare patches", "thinned … thinning") that reading the source did not.
6. **The AI loop needs no server.** Build a prompt from the world and the numbers; accept the reply as JSON in a fence or among words; validate before applying; keep recorded numbers by position.
7. **A link can carry a draft.** `#draft=<base64>` lets the Growth page open unsaved edits in the viewer. Treat it as untrusted: render with `textContent` only, drop images, and check colours before using them in CSS.
8. **Show the story first, folds for editing.** Ten step cards with four fields each made the page 12,000 px tall. A readable story with "Edit this step" folded away read like a prompt.
9. **A long select can widen a whole grid.** A long option text pushed the header to 478 px on a 390 px phone. `minmax(0, 1fr)` and `min-width: 0` fixed it. Measure which element overflows instead of guessing.
10. **Normalising lines can mislead.** Each line to its own highest point makes one coyote look as big as 134 rabbits. Say "top of the line = N" in the legend, and list a second axis as a to-do.
11. **Check every existing page when a shared one changes.** Loading all 12 viewer scenes took seconds and also turned up an image that was already missing.
12. **Respect the repo's rule on `index.html`.** The root `CLAUDE.md` now allows only a new Nursery link, with Jimmy's confirmation. Repointing a tile is a question for him, not a fix to slip in.
13. **Draft the database, check it read-only, and wait.** Listing the live tables showed no clash and the registry pattern to follow. Creating tables waits for a go.
