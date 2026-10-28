# Felix Maze — Quality check

Run this before a maze is published (moved into `data/catalog.js`), and once over the whole bank before each big print run. These are elementary-school worksheets: no sensitive topics, nothing age-inappropriate, no politics.

## Content

- [ ] Characters are friendly and on the list in `characters.md`. No scary faces, blood, weapons, fire hurting anyone, or anything that eats another character.
- [ ] No brands, logos, TV or book characters. "Inspired by" artists are named for their style; nothing is traced.
- [ ] Cultural and religious designs are named with respect, described plainly, and not copied exactly.
- [ ] No politics, flags, news events, money, or adult topics. No personal details about Felix or the family (first name only).
- [ ] The footer facts are true and gentle. Check dates and places.

## Pictures made by the computer

The maze lines are random, so look at each sheet as a picture, not just as a puzzle.

- [ ] No accidental shapes or letters that spell or suggest something rude, in the walls, the swirls or the doodle overlays. Look at it full size and from across the room.
- [ ] No symbols that look like hate symbols (for example, square mazes can make hooked crosses). If a maze has one, change the seed.
- [ ] Felix's doodles: check the shape he drew before saving a maze made from it as an outline or river.

## Puzzle

- [ ] `node tools/check_sheets.js` passes: a way through, **the red answer line never touches a wall** (checked against the lines as drawn, including Felix's lines and rivers), and the level guess matches.
- [ ] `node tools/verify_raster.js` passes: a pixel check of the picture itself. The answer line doesn't sit on any wall ink, and the picture has no shorter white route than the red line (no visual gap or merge). Bridge mazes only get the ink check, because a tunnel passes under the bridge's edge lines.
- [ ] Where the answer goes **under a bridge**, the bridge is drawn on top of it (the red disappears under the bridge and comes out the other side).
- [ ] There is exactly one start and one finish, and the right path exists (the Answers page plays it).
- [ ] Paths are wide enough for a pencil at that level, and no walls touch or blur when printed.
- [ ] The start and finish characters don't cover walls.
- [ ] Prints on one Letter landscape page with nothing cut off.

## Record

Note each pass here (date, codes checked, what changed).

| Date | Codes | Result |
|---|---|---|
| 2026-10-28 | 810-001 … 330-00A | Claude checked the first ten on screen for layout and content; nothing found. Jimmy's print check still to do. |
| 2026-10-28 | 810-001 … 320-00A (recalibrated) | Pixel check added (`verify_raster.js`). Found no problem in the current 320-00A. The earlier merged 330-00A showed the red line over a bridge it should pass under; fixed in the renderer so every bridge maze draws the bridge on top of the answer. |
| 2026-10-28 | 810-001 … 340-00A (new codes) | Answer-line check added. The ten pass. Doodle mazes: the wall and river readings could cross Felix's lines; fixed at the root, and baking now keeps only clean versions. |
