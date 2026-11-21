# Convo v0.16 — a modern 2.5D look

Date: 2026-11-21. Follows `convo v0.15.md`. Jimmy will paste the notes SQL later.

## Built

- **True sprite stacking.** Every object is now a small 3-D voxel model (`src/assets/models.ts`), baked into layers and drawn stacked and turned to the camera (`src/voxel.ts`). It looks solid from every side and changes as you fly round it. The old flat sprites are gone.
- **Models:** the A-10 (twin tails, high engines, canopy, camouflage, roundels), a paper dart with tilted wings, enemy and allied fighters, tanks, an armoured carrier, a truck, a fuel tanker, a SAM launcher with its radar dish, flak in sandbags, houses with pitched roofs and chimneys, a barn, three city towers with lit windows, barracks, an arched hangar, a warship, railway wagons, and five trees (round, pine, autumn, blossom, bush).
- **The land and sky, pixel by pixel:** farm fields sown in rows with hedges, town streets, a striped road, a railway, organic lakes with sand shores and surf, forests, a wandering coast, water that reflects the sky and glitters in the sun, drifting cloud shadows, haze with distance, a sun with a glow, and mountain ridges on the horizon.
- **Light and effects:** shadows the shape of each object, cast away from a low sun behind you; fire, rolling smoke and sparks in explosions; smoke trails behind missiles; tracers; a glowing exhaust; a muzzle flash; soft vapour from the wing tips; a gentle lens flare; a vignette.
- **Turns:** the camera follows part of the bank, now the right way (a right bank tips the land to the left); the plane shows the rest.
- **Sharper picture:** 480×270 inside (it was 400×225).
- **Flat ground:** the ground has no hills now, so every object sits exactly on what is drawn.

## Checks

- 58 flight and rule checks pass (`npm test`).
- Browser: no page errors; a frame takes about 11–13 ms (background about 8 ms) in headless Chromium after warming up. A slower device switches the ground to every other column by itself.

## Not done yet

- A real iPad check of speed and look.
- Night or weather.
