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

38. **"Anyone who can log in" is only "only me" if sign-ups are closed.** Read `/auth/v1/settings` (public, read-only) and the account list (masked) before loosening a rule. Here sign-ups were open and a second account existed, so the owner-only rule stayed.
39. **Do the owner step for the owner when they ask, behind a guard.** A single insert that matches exactly one account (and checks the match count), read back afterwards, is less error-prone than asking someone to copy a uuid. Never write the id or email to the repo.
40. **Jargon in an error message caused real confusion.** "Owner list" meant nothing to the person it was shown to; say what the account may not do and what to run.

## 2026-11-18 (0.6.0, notes v1)

41. **Read the notes before the plan.** Nine short notes became seven builds and two decisions; two of the builds were the same fix (camera above water) written twice.
42. **A world picture embedded as a data address works from a file.** A texture loaded from a plain file path is blocked for the 3-D view on a double-click open. A 266 KB JPEG is about 360 KB as text.
43. **Work out the view direction on the globe from the camera's own frame.** Local east, up and south turned into longitude and latitude with the place's latitude and longitude as the only input; checked by looking straight down over two known cities.
44. **Do not average density to smooth far clouds.** Average the transparency (tau = -ln(1 - 0.85 cover), spread through the layer), or step to larger cloud shapes first. Averaging density made an opaque white sheet.
45. **Hide-a-layer overrides must run last.** Another step re-raised the cover and the layer came back.
46. **Ask for the tide separately.** One unknown variable name in a combined request fails the whole request.
47. **Two debug fields with one name hide each other.** The later key wins; check the name before reading a value you added.
48. **Decide the picture source with the licence in view.** Photographic satellite tiles are usually non-commercial only; ask whether backdrops are used commercially before choosing.

49. **When the owner says "I will reopen it from settings", check the control exists.** It did not; the notes box only listed notes. Say so and build it in the same turn.
50. **A change made while signed out must survive the next sync.** Keep a list of unsent changes (note ids) and let the database win only for notes not on it.

## 2026-11-18 (round 7, notes v2)

51. **Archive notes without private coordinates.** A note's label carries the point's latitude and longitude; when one point is a home or private place, write the city or "a coastal point" in the convo and keep the raw pair out of the repo.
52. **A "bug" note can hide inside a request.** "Above 5x the rain and tornado features get removed" reads as a data limit but is a visibility rule that should not exist; confirm the reading in the convo before building the fix.

## 2026-11-18 (0.7.0, round 7 build)

53. **Keep one cloud shape for a whole day.** A per-hour seed changes every cloud at each hour boundary; seed from the start hour and let the winds carry the layers.
54. **A GLSL function must be declared before it is called.** A forward call inside a helper fails to compile; add a prototype above the first use.
55. **Right ascension in the star file runs −180 to 180 degrees.** Wrap to 0–360 before comparing with a known star; check at least three well-known stars against the data.
56. **Software WebGL can starve a headless test.** Each frame takes long enough that clicks queue behind the render loop. Use a small viewport and low quality for interaction tests, and keep screenshots for a separate pass.
57. **A drag test must start on the sky itself.** A bottom bar that covers the middle of a small screen silently takes the pointer; find the first point where the sky is the hit target.

58. **Measure drift from the place, not from zero.** Adding the local wind to a layer that already moves with the place's wind changes the place itself; subtracting the place's wind keeps the place exact and only adds the difference.
59. **A shader ternary cannot pick between two textures.** Choose with if/else and call the lookup in each branch.

60. **A gesture the owner cannot see is not a control.** Pan worked, but nothing on screen said so; put each mode on a button that shows only where it applies.
61. **Cutting a block by its neighbours can remove code between them.** When replacing a section, check the section that sits between the two markers before writing the replacement, or the next start-up fails with "not defined".

62. **Check what the owner sees before changing the data.** "The continents are missing" was the night side at the time of the test; a daylight, clouds-off view showed the real coastline. Reproduce the exact view the note describes before changing code.
63. **A fallback must say which data is on screen.** The saved copy and the live model look alike; show the source and the date in the data line, or the owner cannot tell an old copy from live data.
64. **A test that overrides one network route must hand the rest to the mock.** Use the fallback call, not continue, or the unmatched requests go to the real network and the page reports a fake outage.
