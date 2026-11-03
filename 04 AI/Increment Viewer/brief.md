# Increment Viewer: brief

## Goal and boundaries
A subject-neutral page to review a series of increments: a stacked slideshow and a scrollable running log of descriptions and changes. The subject lives in a data file, so the viewer can be reused.

## Current state
- `viewer.html` plus one data file per project in `data/`, listed once each in `data/sets.js`.
- Merged the split Earth (V02 to V23), planet (V02 to V06) and Adventure Coaster Park (V01 to V16) files into one file each. The nine originals are in `data/archive/`.
- Verified in headless Chromium: ten drop-down entries, no page errors, and log entry counts of 22, 40 and 16 matching the data.
- Known gap: the Adventure Coaster V16 render (`Make 3D/renders/adventure_park_compact/v16.png`) does not exist yet, so its frame shows the path.
- Unverified: iPad and other browsers.

## Next steps
- Render Adventure Coaster V16 in Make 3D, or drop the item from its data file.
- Add a data file only for a new project, not a new time span of an existing one.
- Consider a link from the root `index.html` Architecture section (added in this change).
