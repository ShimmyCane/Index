# Felix Maze — To-do

## Done

- [x] Inspirations: 100 maze types, tagged and sorted (`inspirations.md`)
- [x] Research: what makes a good maze (`maze_research.md`) and the explainer page (`research/index.html`)
- [x] Variations menu (`variations.md`)
- [x] MVP: ten sheets, library, sheet view with answer key in ⚙️, answer animation, print all, doodle → spring → summer
- [x] Numbering (`catalog.md`), characters (`characters.md`), quality check (`qc.md`)
- [x] `tools/check_sheets.js` keeps published mazes from changing

## Done this round

- [x] Answer-line check (`FMZ.sheet.lint`): the red line must never touch a wall; doodle mazes fixed at the root; baking keeps the best clean version; catalog check fails on any touch
- [x] Difficulty 1–5 with a computer level guess; joy scores (Looking, Doing, Solving) in `rubric.md` and each sheet's ⚙️
- [x] More white space; treats along the way
- [x] Felix's faces in ⚙️ → sweet spot → "Just right for Felix" in the library, and Make a maze starts there

## Now

- [ ] Jimmy prints the ten on Letter landscape and tries them with Felix: path width, time per level, which styles he likes
- [ ] Jimmy answers `convo/convo v0.2.md`
- [ ] **Quality-control pass** (`qc.md`) on paper: sensitive shapes or risky images in walls, swirls and doodle overlays
- [ ] Try Make a maze with Felix on the iPad (finger and Apple Pencil)

## Next

- [ ] Supabase: apply `supabase/001_felix_maze.sql` to the Family project (test in a rolled-back transaction first), then save baked mazes, doodles, answer paths and thumbnails there; keep this device + `data/catalog.js` as fallbacks
- [ ] Publish flow: move a device-saved maze into the bank from the Library (today: copy its recipe into `data/catalog.js` by hand)
- [ ] More styles from `inspirations.md`: Great Wave, goblin caves, record groove, Truchet tiles, Hilbert curve, Greek key, river delta, snail shell
- [ ] Toward 200: a couple of mazes per theme, then grow the themes
- [ ] True organic mazes (curve growth, Pedersen–Singh) once the papers are read
- [ ] Library improvements to carry back to the Detail Library (tag groups, any-within-group / all-across-groups, generated thumbnails)
- [ ] Save copies of sources to `research/private/` (blocked: network policy denied the paper hosts)

## Back pocket (interactive, not now)

- [ ] Finger-trace on iPad, with a trail and Undo
- [ ] Web Audio sounds: footsteps, a chime at the goal
- [ ] Moving parts: rotating rings, bridges that raise, doors that open with a key
- [ ] Two-player race on one screen
- [ ] Color versions for screen
