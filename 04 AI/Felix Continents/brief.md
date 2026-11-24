# Felix Continents — brief

**Updated:** 2026-11-24
**Status:** V1 first build 0.1.0 is in `03 Projects/Felix Continents/index.html`, headless-tested in Chromium (no console errors at 1180×820 and 390×844; note save and reload persist; moment changes and tap names work). Not yet on an iPad. Nursery tile added.

## Current state

- Track A. Family play (`schematic.md`).
- V1 scope: spinning three.js globe, today's continents, ⚙️ time-travel slider with named moments, drift, mountains, volcanoes, oceans, and a simple climate.
- Open questions: convo v0.1, questions 3 to 14.

## Architecture (planned)

- Plain HTML, CSS and vanilla JS, no build step. three.js from cdnjs at one exact version at least two weeks old.
- Data: bundled JSON for today's outlines and each moment's positions. Source and licence noted next to each.
- Feedback notes stored on the device (⚙️).

## Verified vs. unverified

- Verified (headless Chromium, three.js 0.170.0 served locally): page loads from file:// with zero JS errors; today's continents, climate colours and mountains show; Pangaea and dinosaur moments render; tapping the globe names the plate or feature; notes save and survive reload; the globe resizes when the time bar appears.
- Unverified: a real iPad (touch, performance, the 3-D frame rate); the CDN load itself from GitHub Pages (the sandbox cannot reach unpkg, so the CDN path was not exercised, only the same file served locally); the map outlines (hand sketches); the climate model's realism; the moment rotations.

## Next steps

1. Jimmy reviews the Pages link and tweaks the answers in convo v0.1.
2. Pick the map sources and licences; replace the sketch outlines (`js/data.js`).
3. Add Rodinia once a source is chosen.
4. Then V2 (draggable continents), per `schematic.md`.
