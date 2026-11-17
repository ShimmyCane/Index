# Mind Palace — lessons

## 2026-11-17, MVP 0.1.0

1. **Three layers kept the 3-D honest.** With the database and the layout free of DOM and three.js, search, routes, undo and repair were proven in Node before any picture existed. The renderer then only had to draw.
2. **Screen colours must be converted for three.js r128.** With `outputEncoding = sRGBEncoding`, hex colours given straight to materials come out washed pale. Convert each with `new THREE.Color(c).convertSRGBToLinear()`, and set `encoding = sRGBEncoding` on canvas textures.
3. **Signs need a size tied to distance.** A sprite with a fixed world size is unreadable from far and fills the screen up close. Scale it each frame by distance, between a low and a high limit, and fold the small name tags away in the far view.
4. **A solid scrolling box over a see-through WebGL canvas can blank part of the canvas** (headless Chromium): a strip the size of the scrolled-off content showed the page background. `readPixels` proved the canvas was drawn. A background of `rgba(..., .985)` on the scrolling box stops it.
5. **Move the picture, not the camera, to clear the panels.** `camera.setViewOffset` shifts the scene into the free part of the screen (right of the panels, above the card on a phone). Picking and projecting still work.
6. **Nest groups the way things move.** World group > room group > object group: dragging a room carries its objects for free. Paths and connection lines are in a separate group, hidden during a drag and rebuilt on drop.
7. **Zooming all the way in is first person.** One camera model (target, turn, tilt, distance); under 1.5 units little-me is hidden and the tilt is levelled. No second control scheme.
8. **Software GL runs slow motion.** A walk that takes 3 seconds on a device took over 9 in the sandbox. Wait on a state flag (`traveling`), not on a time.
9. **Store what you can derive in one place only.** The specification's example had `world.places` and `place.node_ids`; they are worked out from `parent_id` and `place_id` so a move cannot leave them disagreeing.

## 2026-11-17, round 2 (Godot and splats)

10. **Ask how far "later" is.** The specification put Godot and splats in phase 5 and I built to that. Jimmy wanted them now. When a specification and the spoken request differ on order, ask before building the long way round.
11. **Export the object library, don't port it.** Build each web object with the real three.js in Node, read back each mesh's shape, place and colour, and write simple shapes as JSON. A marker colour finds the parts a chosen colour repaints. One library for two renderers.
12. **Sample splats from triangles, not from shape formulas.** `Mesh.get_faces()` gives triangles for any mesh, so one sampler covers boxes, cylinders, prisms and later imported models.
13. **Say plainly when code has never been run.** The engine could not be started in the session. The project, its schematic, the to-do list and the PR all say so in the first lines.
14. **Check that a tool can run before planning around it.** The download worked; running it was refused. Try the smallest run (`--version`) first.

