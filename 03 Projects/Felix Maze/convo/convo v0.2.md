# Felix Maze — Convo v0.2

**Project:** Felix Maze
**Round:** 2, after the MVP
**Read first:** `schematic.md`, then open `index.html`

Answer inline under each number. Leave a question blank if you don't know yet.

## What changed from v0.1

- Sheets are **Letter landscape (8.5 × 11)**, not 11 × 17.
- No answer key, solved-by line, stars or coloring space on print. The answer key is a small JPEG in ⚙️ on each sheet. `answer.html` plays the answer as an animation from a maze number.
- Difficulty is grouped by time to solve: about 2, 5, 10, and 20+ minutes. The ten are a mixed bag.
- Numbering is hex: family · level · source - counter, e.g. **810-001** (`catalog.md`).
- Characters start with **Felix the cat** (`characters.md`).
- Make a maze: 5 spring sprouts → pick 1–2 → bake into summer mazes → try options → save.
- The library borrows the Detail Library's search, tag buttons and cards, with grouped tags and generated pictures.
- A quality check list is in `qc.md` and on the to-do list.

## Open questions

1. Question 4 in v0.1 came through as "Took". I read it as **pencil**. Is that right, or did you mean something else (crayon, marker, finger)?
2. Question 8 and 9 in v0.1 weren't answered. The ten I built follow the proposed list, with the Keith Haring-style dancing figure as #320-005. Any you'd swap after seeing them?
3. **Felix the cat:** there is a famous 1920s cartoon called "Felix the Cat" (a trademarked black cat with a big white face). I drew our Felix as a striped kitten so he's clearly our own. OK, or would you rather he have a different name on the page (he's never named on the sheets now, only in the files)?
4. After printing: are the paths wide enough for his pencil at each time level? Which level felt right?
5. Doodle mazes are saved **on the device** for now. Should I set up the Supabase tables next (`supabase/001_felix_maze.sql`, Family project), so baked mazes, doodles and answers are shared across devices?
6. Publishing a doodle maze into the main bank: do you want a "Publish" button in the library that does it (needs the database), or is copying it in by hand (Claude does it when asked) fine for now?
7. The Detail Library: I borrowed the idea (search + tag buttons + cards), not the code, and added tag groups (any within a group, all across groups) and generated thumbnails. Want me to carry those improvements back into the Detail Library repo later?
8. Next batch toward 200: which themes first? Suggestions from `inspirations.md`: Great Wave, goblin caves, record groove, Truchet tiles, Hilbert curve, Greek key, river delta, snail shell.
9. Goblins: OK to add a silly, not-scary goblin (big ears, a lantern, looking for a lost sock)?

---

_Next round: `convo/convo v0.3.md`._
