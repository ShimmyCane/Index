# Generate Clouds — lessons

## 2026-11-15 (MVP 0.1.0)

1. **One shader, two projections.** The live view and the 360° panorama are the same fragment shader with a different ray direction per pixel. A tile uniform (offset and scale) lets a big picture be drawn in 512 px pieces, so export never needs a large render target.
2. **3-D noise from one 2-D texture** (red = green shifted by 37, 17) gives a marched cloud for one texture read per octave, and works without 3-D texture support.
3. **Keep density × step near 1–2.** A 10 km thick cloud with 44 steps has 570 m steps; at 30 per km each step is opaque and the edges turn to grain. Thick types need a lower density, not more steps.
4. **Single scattering goes purple at twilight.** A small isotropic blue fill, scaled by the sun's height (power 7 below the horizon), brings the blue hour back without washing out the orange band. Power 3 turned dusk into day.
5. **Auto-exposure needs a ceiling.** Without one, night renders as a pale day. Cap it and give the night sky and cloud ambient a small floor.
6. **Tint fights:** a per-channel fog that is very blue-heavy reddens far clouds at night; a "city glow" term must scale with pollution squared or it colours clean nights brown.
7. **Overcast is neutral.** Pull the sunlight colour toward grey as cover rises, or a stratus deck looks beige.
8. **Compute sunlight per layer height.** Then high cloud stays lit after sunset with no special case.
9. **Blocked API host in the sandbox:** route the host with Playwright `page.route` and return generated hourly arrays; add a fallback request with fewer values so one wrong name cannot take the feature down. State in the brief that the live call is unverified.
10. **Interleaved-gradient noise** for the ray start looks cleaner at half resolution than white noise.
11. **Phone bar width:** a clock with three parts overflowed at 390 px; let it wrap to two lines.

## 2026-11-15 (0.2.0, zoom and space)

12. **Jitter the whole first step.** Jitter sized to the base step while the real step grows with distance leaves the samples on shared shells, which shows as horizontal streaks at cloud edges when zoomed. Jitter by the step actually taken.
13. **Step by what is there.** Long steps through clear air, then step back and cross the cloud in short steps. A fixed step either wastes the budget or bands.
14. **Cap the step by the path through the layer.** Looking straight down from 250 km, a distance-scaled step (3.5 km) skipped a 600 m deck entirely.
15. **Detail by pixel size.** Fade each finer noise layer in when one pixel covers less than its cell; far views pay nothing. Wrap noise coordinates (mod 256) so high frequencies keep float precision.
16. **Erosion needs contrast.** A ridged value-noise term sits near its mean and erodes evenly; a smoothstep around the middle gives visible wisps.
17. **Sharpen a still view in strips** with the scissor and a kept drawing buffer; draw a quick full frame first so a resize does not flash. In tests, wait for the flag, not a time.
18. **Jimmy expects the Earth's curve.** A correct flat horizon at ground level read as missing; give a way to go high enough to see it.

19. **A shared sandbox address can be over a free service's daily limit.** Open-Meteo counts per network address; the forecast host returned 429 from the sandbox while its other hosts worked. Probe each host separately, and do not read a 429 there as a bug in the app. Running the page on the real network still found one: the timeout was shorter than the service's slow refusal.

## 2026-11-15 (0.3.0, orbit)

20. **Move the world, not the camera.** The shader keeps the camera on one column of the planet; a camera position is a subtraction from each layer's wind offset. No shader change, and the sphere stays exact.
21. **Orbit as distance, angle above, bearing.** Three numbers and one function that sets position, heading and pitch. Drag changes bearing and angle, pinch changes distance, the height slider changes the angle.
22. **Check an orbit from four sides.** One of four views at 10 km sat inside a cloud and was white. Default the sample above the cloud tops.
23. **When Jimmy names something the data cannot give (tornadoes), say so in the page and in the reply,** and offer the nearest true thing (storm towers) plus a question about a drawn sample.

## 2026-11-16 (0.4.0, ground, sea, weather)

24. **Near-ground geometry needs local coordinates.** Planet-centred floats have about half a metre of error at 6371 km. Height above the round sea as y + (x² + z²) / 2R, in km from the camera's column, keeps waves and beaches exact, and the conjugate form of the quadratic (2c / (−b + √disc)) avoids cancellation for the sea hit.
25. **Half-float texture for heights.** WebGL2 filters RGBA16F without an extension; convert on the CPU. Eight bits would terrace the land.
26. **A placeholder ground must not strand the camera.** Made-up hills raised the camera 200 m, then the real coast loaded lower. A camera that stands on the ground follows the ground when it changes.
27. **Ties in a nearest-direction scan pick the first angle.** Average the directions that reach water equally soon.
28. **Regional data ends in a hard edge if clamped.** Fade the data's weight to zero past its grid and let slow noise carry on.
29. **Order under-cloud weather by the camera:** below the base it is in front of the clouds, above the base it is behind them.
30. **A funnel is darker than it first looks.** Lit like a cloud top it read as a white lens; ambient-from-below lighting made it read as a tornado.
31. **Lightning must scale by exposure,** or a flash that reads at dusk whites out a day scene; keep the bolt's sideways wander well under its height.
32. **Jimmy asks for whole worlds in one message.** Build every part to a working level, say which parts follow data and which are drawn from descriptions, and ask one question per part.

## 2026-11-17 (0.5.0, database link)

33. **"I added comments to the database" can mean there is no database yet.** The notes box was device-only, so nothing could have arrived. Search the live projects read-only first, say what was and was not found, and ask where the comments really are, instead of assuming.
34. **"Splusystudio database" is not a project name.** Resolve it from the track (studio = Architecture), say that it is an assumption, and make the project address one line in `js/config.js` so a wrong guess costs nothing.
35. **The database tool's confirmation can time out unanswered in a remote session.** Do not retry in the same turn. Write the SQL, run `sql_paste_check.py`, and hand over the paste order; build and test the app against a pretend database so it is ready the moment the table exists.
36. **A privacy sentence must be checked against the payload.** The hint said the place never leaves the page, but each note carries the place and moment it was about. Check what is in the request body before writing what is sent.
37. **A heavy still-picture pass blocks clicks in a headless test.** Turn the sharpening off (`GC.Renderer.fineStart = () => false`) in tests that are about the page, not the picture.
