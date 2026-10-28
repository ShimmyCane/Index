# Felix Maze — Convo v0.3

**Project:** Felix Maze
**Round:** 3, feedback on the MVP

## What Jimmy said (summary)

- Quite a few mazes have answer lines that seem to cross walls. Find a quick way to check whether the red line crosses a wall, then tweak or reject. Hopefully not a high failure rate.
- Leave white space around the puzzles. It makes them more readable and less like sewing-machine stitching.
- Looking at the unsolved puzzle, doing it, and solving it should each bring some joy. Rank mazes by how pleasing they look, how hard they are, and what the payoff is (a surprise?). Find out how people judge puzzles; there must be a rubric.
- Check and test Felix's skills so he doesn't get puzzles that are too hard. Maybe difficulty 1 to 5. He makes mazes himself, so he probably has real skill.
- Make it enjoyable. Don't treat it as a scientific exercise.

## What changed

1. **Answer-line check.** The red line is checked against every wall as drawn, including Felix's lines and rivers in doodle mazes.
   - The ten catalog styles: 0 failures in 600 test mazes. The ten sheets pass.
   - The crossings came from doodle mazes: Felix's lines drawn on top of the maze (the "walls" and "river" readings). Fixed at the root (passages too close to his line are closed, a real gap opens where the maze must get through, doorways stay clear of his lines, his lines aren't swirled). That took the raw failure rate from 28–59% to about 1–2%.
   - Baking now grows several versions and keeps the best clean one, so a failure never reaches a sheet. The catalog check (`tools/check_sheets.js`) fails if any published maze touches a wall.
2. **White space.** Every maze sits well inside the page (about 7 × 5.5 inches at most), with fewer, bigger squares.
3. **Difficulty 1–5**, with target times (about 1, 3, 5, 10, 20+ minutes). The computer guesses each maze's level from research measures: right-path length, choices on the way, how deep the wrong turns go, and the confusion ratio. The sheet's level must match. The codes changed with this (nothing was printed yet).
4. **Joy rubric** (`rubric.md`): Looking, Doing, Solving. The computer's guess for each shows in a sheet's ⚙️; the picker uses them to choose the best seed.
5. **Treats along the way** (crumbs, drops, leaves, stars, hearts), three on the right path and two at the ends of wrong turns, so exploring pays off too.
6. **Felix's sweet spot.** Each sheet's ⚙️ has 😴 too easy, 😊 just right, 😣 too hard (plus minutes). The library has **Just right for Felix**, and Make a maze starts at his level.

## Questions

1. After printing a few: do the white space and path widths feel right now? Too roomy anywhere?
2. Do the treats add fun, or clutter? (Easy to turn off per style.)
3. Is level 1 too easy for Felix, given he makes his own mazes? We can start him at 2 or 3.
4. Should the faces stay in ⚙️ (for you), or would Felix like to tap them himself on the sheet page?

---

_Next round: `convo/convo v0.4.md`._
