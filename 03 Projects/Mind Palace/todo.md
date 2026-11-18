# Mind Palace — to do

## Done in 0.3.0 (2026-11-17)
- [x] The splat view is the default page (`index.html`); the Build page is `build.html`.
- [x] Fog of war: beyond little-me's sight the palace fades to black (setting: on/off and how far).
- [x] More life: trees (round, pine, blossom), a windmill, three birds, a balloon, a walker and a gear, the moving ones on loops.

## 0.3.1 (2026-11-18)
- [x] Fog radius doubled. Lantern glow in little-me's hand. Fireflies circling each island.

## Next (convo v0.5)
- [ ] SDF shapes for rooms and objects in the web splat view (rounded rooms, a dome), if Jimmy agrees.
- [ ] Animals, boats and cars on loops (Jimmy's choice, convo v0.5).
- [ ] Glowing windows on rooms, if wanted (convo v0.5).
- [x] Godot 4.3 starts and loads the project; the main scene runs 240 frames with no script errors (2026-11-18). Its 465 mesh errors come from the headless dummy renderer. Still to do on a machine with a screen: look at the picture and check the splat look.

## Next (waiting on convo v0.3)
- [ ] Explored memory: places little-me has seen stay dim after she moves on (a second, slower fog).
- [ ] Richer look: more colour, a glow from little-me's lantern, the sky at night with stars.
- [ ] Moving things in Godot too (the same motions, as rigid blocks).
- [ ] Floor plans: a room as a rectangle with its own width and depth; doors that join rooms; a home as a world. Jimmy's childhood homes.
- [ ] Solid walls on the splat page, once rooms are plans.
- [ ] Editing on the splat page, so the three.js page can retire.
- [ ] AI-made objects: describe a thing, get simple shapes back, see them as splats, accept or reject.
- [ ] Family sync: `mp_palace` (owner writes, family reads), `mp_recall`, `mp_notes` paste files; apply only on Jimmy's word.
- [ ] Try `index.html` (the splat view) on a real iPad: speed at each "Number of splats", pinch, the stick.

## First (blocked on running Godot)
- [ ] Open `godot/` in Godot 4.3. Fix whatever the Output panel reports. It has never been run.
- [ ] Look at the solid look and the splat look from several angles; check ring and object facing against the web page.
- [ ] Open `palace_splats.ply` in a splat viewer to check the file (it may need the up axis flipped).
- [ ] Walk: walls stop you, the ramp to the Music Loft works, the bridges hold, falling off returns you.

## Next, from Jimmy's answers (convo v0.1)
- [ ] Godot G3: editing, undo, saving, repair on load.
- [ ] Godot G4: practice and a tour mode.
- [ ] Two looks: childish and grand.
- [ ] Family sync: write the `mp_palace`, `mp_recall`, `mp_notes` paste files (`/supabase-link`); apply only on Jimmy's word.
- [ ] Growth: worlds change with rooms, a bridge appears with many connections, a landmark for the best-known memory.
- [ ] AI architect by copy and paste.
- [ ] Ask Felix what he wants to remember.

## To try on a real device
- [ ] iPad: speed with shadows on, one-finger turn, two-finger pinch and slide, the walking stick, drag in Move.
- [ ] Emoji objects (the whale) on iPad. Headless Chromium has no colour emoji font.
- [ ] Saving after closing the tab, and "Save a copy" on iPad.
- [ ] Sound on device.

## Next candidates (order to be set by `convo/convo v0.1.md`)
- [ ] AI architect: copy-and-paste loop, proposal preview, accept all or some, reject, undo.
- [ ] Routes you save and replay (a tour), and reconstructing a sequence in order.
- [ ] More architecture: stairs, towers with floors, hidden rooms, portals, a style per world.
- [ ] Tap an object to start a motion; a landmark for a much-practised memory.
- [ ] Collisions and doors that matter when walking.
- [ ] Pictures and sounds on a memory (moves storage to IndexedDB).
- [ ] Combine or split rooms; move a whole collection at once.
