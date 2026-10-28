# Felix Maze — Convo v0.4

**Project:** Felix Maze
**Round:** 4, feedback after round 3

## What Jimmy said (summary)

- 330-00A has a solution, but the current solution is wrong. Add a flag button that saves to the database, noted on another page as puzzles to rework, so a `fix_puzzles` skill can look at them again now and then, and decide on a different solution or a replacement.
- That puzzle's difficulty was right, and it is a **level 2**. Make the bank a **bell curve around level 2.5**.
- Create **200 puzzles**. Check the red line against the walls first; filter out the ones that fail, for future repair. Flagged puzzles must not show up as the puzzle of the day or the top five.
- A **print pack of 10 puzzles**, printed correctly double-sided (front and back).
- Merge the front end first, then update the puzzle generation. Work through the to-do list, with goals, in **batches of 50**.

## What changed

1. **330-00A.** The version that was merged drew the red answer line *over* a bridge it should pass *under*, so it looked like the answer crossed a wall. Fixed in the renderer for every bridge maze: the bridge is drawn on top of the answer again. The current 320-00A (new code) doesn't pass under any bridge and passes both checks.
2. **New pixel check** (`tools/verify_raster.js`): renders each maze without and with the answer and measures what you'd see: red pixels sitting on wall ink, and any shorter white route than the red line.
3. **Levels recalibrated** so that maze (0.54 in cells) is level 2. Boundaries on the effort measure moved; the generator's cell sizes are 0.88 / 0.54 / 0.42 / 0.35 / 0.30 in. The first ten were re-picked, so their codes changed again (before anything was printed). The plan for 200 is a bell curve: 40 / 70 / 56 / 24 / 10 across levels 1–5 (mean 2.5), 10 / 17 / 14 / 6 / 3 per batch.
4. **🚩 Flag** on each sheet (reason + note). Saved on the device and, once you sign in with the family account in ⚙️, in the database. The table `fmz_flags` is **live** in the Family project (tested in a rolled-back transaction first, RLS on, registered, no advisor findings for it).
5. **🔧 To rework** page: flagged puzzles, puzzles the generator couldn't finish, and what's been closed. Copy or download the list for the skill.
6. **fix_puzzles** skill: `02 Refs/Skills/fix_puzzles.md` with the `/fix-puzzles` wrapper (you asked for the skill, so I added it to `02 Refs`; I also listed it in `index.md` and the root `CLAUDE.md`).
7. **⭐ Puzzle of the day, 🏆 top five** on the home page. Flagged puzzles are never picked.
8. **🖨️ Print a pack** (`pack.html`): 10 puzzles = 5 sheets, double-sided, front and back paired in page order, no blank pages. A flip setting (short edge or long edge) and a test sheet for finding out how your printer flips.

## Questions

1. **Duplex:** try the 🧪 test sheet. Which flip did your printer need (short edge or long edge)? If it's always the same one, I'll make it the default.
2. Flags made on a device that isn't signed in stay on that device. Is it OK that you sign in once in ⚙️ (the same family login as Adventure) so they sync?
3. **Batch size and review:** I plan to generate each batch of 50, run every check, review the pictures myself, and open one pull request for all four (each batch its own commit). Do you want a PR per batch instead?
4. **Variety plan for 200:** about 50 designs with 4 variants each (different seed, level, entrances and a new "fun line"), plus new shapes (fish, snail, rocket, heart, house, moon, tree, butterfly, turtle shell and more) beyond the first ten. Anything you'd rather not see, or want more of?
5. The footers will state facts (about artists, places, animals). I'll keep them short and checkable, and list their sources in a file so you can spot-check. OK?

---

_Next round: `convo/convo v0.5.md`._
