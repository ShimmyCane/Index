# Paper Airplanes × A-10 Warthog — Lessons

## 2026-11-18

- **A fetch can fail as a DNS error or a proxy 403.** The subagent saw ENOTFOUND; a direct curl got a CONNECT 403. Check the proxy status (`$HTTPS_PROXY/__agentproxy/status`) before writing a reference off, and say in the convo which source was not read.
- **Global `tsc` may be a newer major.** Pin the TypeScript version in the project and use `npx tsc`; v6 deprecated `module: none` and `outFile`.
- **A physics model with no lift at zero angle sinks with no input.** A stability term that pulls the nose to the flight path needs a camber (base) lift, or the plane never climbs.
- **Test a stall with the nose set after `start()`.** `start()` aims velocity along the nose, so the angle of attack starts at zero.
- **The drawer's button margins double** inside a group with side margins. Use a calc width, not 100% plus margin.
- **Node tests can load the compiled script in `vm`** if the page boot is guarded by `typeof document`.

## 2026-11-18 (round 2)

- **A class name on `<body>` can hide the whole page.** `body.stick` picked up the base `.stick { display:none }` rule meant for the joystick pad. Use names that no component uses (`joy`).
- **Ground squares under the camera vanish if they are dropped when a corner is behind the near plane.** Clamp the depth for ground corners instead.
- **Synthetic pointer events from a test can have no active pointer.** Guard `setPointerCapture` in a try/catch.
- **Drive drawer buttons with direct clicks in tests** when a gear is mid-fade; a real tap is needed only for the wake.

## 2026-11-18 (round 8, convo v0.13)

- **A stack must show.** A one-unit step with a light shade reads as a dark edge. Use a visible step (two design units) and a strong shade for the lower slices, then look at it zoomed in.
- **Enemies that chase at a fixed turn rate orbit.** Give them a phase: approach, attack run, break away, return.
- **Lead every moving shot, including allies'.** A shot aimed at where a target was misses it. Include the target's motion, and its climb or descent.
- **Test for the mechanic, not the random outcome.** The ally test failed twice for reasons in the fighter's altitude, not the gun. Trace the frames before changing the code.
- **Felix mode is for seeing things.** Radar markers should be bigger and clearer there.
- **A tap command in a shell can hide a failure.** Read the exit code of the test run itself, not of the pipe after it.

## 2026-11-21 (round 9, graphics)

- **True sprite stacking needs voxel models,** not 2-D sprites with a darker copy underneath. Bake each layer once; draw each layer with one setTransform (yaw, squash by the viewing angle, roll) and drawImage.
- **Clearing voxels needs its own call.** Writing colour 0 left black voxels (black wing tips, a black tank front). Use `cut()`.
- **A per-pixel ground is affordable at 480×270** with a field cache, a haze lookup table, no `pow` in the loop, a 2×2 sky away from the horizon, and every other column far away.
- **Size the cache to the view.** A 2 km cache under a 3 km view made near and far cells evict each other every frame.
- **Check the camera roll's sign.** A right bank must tip the land to the left.
- **Put the sun behind the player** when shadows should be seen: they then fall ahead and objects are lit from the front.

## 2026-11-21 (round 10, vapour and animations)

- **Attach effects to the drawn model, not the world.** Vapour placed in world space drifted off the wing tips because the plane is drawn with an extra bank and size. Use `modelToScreen` on the model's tip and spawn on the screen.
- **A single frame's timing lies.** The canvas defers its drawing, so the cost lands wherever it flushes. Time many frames and force a flush (`getImageData` of one pixel) at the end.
- **Profile both the stress case and normal play.** A stack cache halved a dense forest but slowed normal flight, because it kept creating canvases. Reuse fixed-size canvases from a pool, cap new entries per frame, and only cache what is expensive to draw.
- **Things that look the same from every side can be cached by size and viewing angle only.** Roll and sway then become a turn and a shear of one image.
- **Check where a test click lands.** A drag started at the right edge hit the CHAFF button, so the "turn" screenshot showed level flight.

## 2026-11-21 (round 11, curved trail, mood)

- **A constant sideways drift makes a straight trail, not a curve.** Make the drift grow with each point's age, as a point further behind a turning plane swings further.
- **Mood comes from consequence and one shared wind.** Burning wrecks show what the player did; one wind for smoke and flags ties the scene together.
- **Bridge gaps in ribbons.** When a ribbon trail restarts, insert an invisible point so it does not join the old end with a straight line.
