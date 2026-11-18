# Generate Clouds — convo v0.11 (2026-11-18)

Jimmy asked for all of round 7 (`convo v0.10.md`) and the stars and ground from `convo v0.8.md`. Version 0.7.0 builds them. Everything was tested in a headless browser against made-up replies from the outside services (the sandbox cannot reach the forecast or the satellite picture), so the live results are still to check on a real device.

## What was built

1. **Time lapse for 24 hours from now**, using the forecast. The sun, the cloud layers, the wind, the sea and the cloud grids all move through the day. The bar spans 24 hours; the setting "24 hours takes" is 1, 2 or 4 minutes. Each hour has its own model; the cloud shapes stay the same all day and the winds carry the layers on across the hours.
2. **Tide** rises and falls along the time bar (sea levels from the marine model for every hour, gliding between hours).
3. **Waves clip** (new mode): a short loop of the sea and the clouds at a real speed. Clip length 15, 30 or 60 seconds (default 15). Speed slider snaps to 0.5×, 1× or 2×; the clouds and the waves both move at that speed. The clip repeats (the clouds jump back at each repeat).
4. **Navigation, as in a map**:
   - High up: one finger pans the Earth; when the drag ends, the centre becomes the new place (the weather and the ground reload there).
   - On the ground: one finger walks (the view moves like a map); the place follows at the release.
   - In the clouds: one finger orbits; tap a cloud to choose it and orbit around it. The label gives the cloud type, base, top and distance.
   - Two fingers (or Shift-drag): look around. In orbit, look turns the view while it circles.
   - Pinch or scroll: zoom.
5. **Hide clouds**: the setting already existed; a one-tap "☁️ Clouds on / off" chip now sits in the bottom bar too.
6. **Weather above 5× zoom**: withdrawn by Jimmy; not changed.
7. **Space view clouds**: the NASA GIBS true-colour picture of the day (public domain), turned into a cloud-cover map. Bright, colourless pixels count as cloud. Used from space, and it sets the cover of the clouds seen from above. The picture is daily, not hourly.
8. **Stars and constellations**: 288 bright stars (magnitude 3.5 and brighter) drawn at night from the place's sky at the moment; fifteen constellations as dashed lines and names, off by default (⚙️ → Constellations → Lines and names). Star positions from d3-celestial's data (BSD licence); checked against seven well-known stars (all within 0.01°).
9. **Ground colours from map tiles** near the place (about 12 km square): the OpenStreetMap map colours as the ground colour (woods, grass, water, streets). Light use: 25 tiles per place. Attribution is in ⚙️.

## Not built, or only part of it

- **A worldwide wind grid for the space clouds** (the second half of option B): not built. The clouds still drift with one wind for the whole view, so the drift from space is not yet real. Only the cloud pattern comes from the satellite picture. This needs a shader change that moves each point by its own wind, which I have not built.
- **Cloud picking** chooses a point inside the cloud layer under the tap; the clouds are generated from noise, so there is no single cloud object to select.
- **Satellite picture appearance** is not checked against the real picture (GIBS is not reachable from the sandbox). The reader and the mapping were checked with a test picture only.

## Checks run

- 22 interaction checks pass in the headless browser (24-hour lapse rate, 24-hour bar, clip mode and its speed and length, the clouds chip, figures on and off, satellite cover from space, pan moves the place and keeps the view, shift-look, tap-to-orbit with label, walk on the ground and the place following at release, no page errors, no horizontal scroll at 390 px).
- Star altitudes checked: Betelgeuse at 40° N in mid-January is 57° high due south, which is correct for its declination.
- The satellite reader turns a white cloud pixel into white and an ocean pixel into black.

## Not yet checked on a device

- The live forecast, marine, grid and elevation answers (the mock replies have the same shape, but the real values have not been seen).
- The live satellite picture and its clouds.
- Ground colours from real tiles on the page.
- Speed and smoothness on an iPad, with real fingers.

## Questions for Jimmy

1. The waves clip: is 15 seconds at 1× the right default, or should the default be 30?
2. The space clouds drift with one wind for now. Should I build the worldwide wind grid next, or first check the satellite look on your device?
3. Commercial use (still open from v0.8) decides whether the satellite and map pictures can be used for backdrops.

## Answers (Jimmy, 2026-11-18)

1. **Waves clip default:** 15 seconds at 1×. (Already the default in 0.7.0.)
2. **Wind:** build the worldwide wind grid next. Expect winds to differ at each altitude, so the space clouds need a wind per height as well as per place (the low, mid and high layers already use three different winds at one place; the grid must give each layer its own wind at every point).
3. **Commercial use:** yes, the satellite and map pictures can be used for backdrops. The Earth picture's CC BY-SA credit stays in ⚙️.

**Merge:** Jimmy said "merge when done". The wind grid (answer 2) is not built yet, so PR #202 stays a draft until it is.
