# Fix Puzzles

Purpose
Take another look at the puzzles that went wrong and decide, one by one, whether a different seed or setting fixes them, or whether the puzzle should be replaced. Run it now and then, after Jimmy has flagged some puzzles (🚩 on a sheet) or after a generation batch left some unfinished.

Input
- Project name (default: `Felix Maze`).
- Optionally a pasted or downloaded list from `rework.html` ("Copy the list for fix_puzzles"). Flags made on a device that never synced exist only in that list.

Actions
1. Read `03 Projects/Felix Maze/CLAUDE.md`, `rubric.md`, `qc.md` and `catalog.md`.
2. Gather the work:
   - Open flags in the database: `select * from public.fmz_flags where status = 'open' order by created_at;` (Family Supabase project, via the Supabase tools). Several rows for one `n` are one problem.
   - Any pasted list from `rework.html`.
   - `data/rework.js`: recipes the generator couldn't finish (each has its failure reasons and the seeds tried).
3. For each one, in this order: `unsuitable` first, then `answer`, then `hard` / `easy`, then `ugly`, then `other`:
   - Build it and look at it: `node tools/check_sheets.js`, `node tools/verify_raster.js <counter>`, and render the sheet with its answer to read it by eye.
   - Read Jimmy's note. Decide what is wrong: the answer line, the level, the look, the content, or the design itself.
   - Fix the cheapest thing that works:
     a. **Another seed:** `node tools/pick_seeds.js <counter> 80`.
     b. **Another level or setting** in the recipe (the code changes when the level changes: say so).
     c. **The design:** if the same failure could hit other puzzles of that style, fix the style in `js/sheet.js` or `js/designs.js` at the root, then rebuild every maze and confirm only the intended ones changed.
     d. **Replace:** a new design or variant in the same slot (same counter `n`), with its own footer text and QC. Mark the old recipe `retired: true` in `data/catalog.js`; never reuse a counter.
     e. **Leave it:** if it is fine as it is, close the flag as `kept` and say why.
4. Check again: `node tools/check_sheets.js` (answer clear of walls, level guess = sheet level), `node tools/verify_raster.js`, and the by-eye pass in `qc.md`. A fix that doesn't pass both checks is not a fix.
5. Record: `node tools/score_catalog.js`, then `node tools/check_sheets.js --update` only after confirming the fingerprints that changed are exactly the puzzles you fixed.
6. Close the flags in the database: `update public.fmz_flags set status = '<fixed|replaced|kept>', resolution = '<what you did>', resolved_at = now(), updated_at = now() where n = <n> and status = 'open';`. Flags that came only from a pasted list: tell Jimmy to press ✅ Fixed on `rework.html` on that device.
7. Remove finished items from `data/rework.js`. Add a line to the Record table in `qc.md`.
8. Update `04 AI/Felix Maze/brief.md` and `lessons.md` (what kept going wrong and why). If the same cause came up more than once, say what would stop it at the source.
9. Report: what was flagged, what each one turned out to be, what was done, anything still open, and anything that needs Jimmy's decision (especially anything retired).

Rules
- Never print or publish. Fix, check, report.
- Don't touch puzzles that weren't flagged or unfinished, unless the style fix in step 3c changes them. Then say which ones changed and why.
- Replace and retire only in the same slot. Never delete a recipe or reuse a counter.
- Add and update rows only in `fmz_flags`. Don't touch other tables.
- Keep the public repo clean: no names beyond Felix, no ages, no private details, even in resolution notes.
- Keep notes short and kind. This is for a child's worksheets.
