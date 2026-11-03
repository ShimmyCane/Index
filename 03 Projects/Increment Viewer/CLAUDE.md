# Increment Viewer: Claude pointer

Purpose: a subject-neutral template for reviewing a series of increments (slideshow plus running log). It is reused for any subject by adding a data file.

- Design and data format: `schematic.md`
- Open: `viewer.html` (default data: `data/living_room.js`), or `viewer.html?set=<name>`
- Add a review: copy `data/living_room.js`, change the items, and open with `?set=<name>`
- Growth worlds: `viewer.html?world=<id>&step=<n>` loads `../Growth/worlds/<id>.js` (see `schematic.md`). A step with no picture shows a state card.
- Keep the viewer generic. Subject-specific text belongs in the data file only.
