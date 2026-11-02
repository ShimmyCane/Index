# Increment Viewer: schematic

Status: MVP (template). Built and checked with the Living Room Scene data.

## Purpose
A subject-neutral browser page for carefully reviewing a series of increments. It shows the versions as a stacked slideshow and lists each one in a running log, with what changed and what still needs work. The page knows nothing about the subject. A subject is just a data file.

## Use
Open `viewer.html` in a browser. The page loads `data/living_room.js` by default.
To view another review: `viewer.html?set=<name>`, which loads `data/<name>.js`.
Only letters, digits and underscores are allowed in `<name>`.

## Data format (`data/<name>.js`)
The file sets one global:

```js
window.REVIEW_DATA = {
  title: "Name shown in the header",
  subtitle: "One line about the review",
  items: [
    {
      id: "V1",                  // short label
      title: "Short name",       // optional
      image: "path/to/render.png", // relative to viewer.html
      description: "What this version is",
      changes: ["What changed", "..."],
      gaps: ["Still to fix", "..."]   // optional
    }
  ]
};
```

Images are read relative to `viewer.html`. The Living Room data reaches its renders with `../Living Room Scene/renders/`.

## Scene drop-down
`data/sets.js` lists every review for the drop-down in the header: `window.REVIEW_SETS = [{ id, label }]`. `id` is the data file name without `.js`; `label` is what the drop-down shows. Add one line per new data file. If `sets.js` is missing, the drop-down is hidden and `?set=` still works.

## Behaviour
- Slideshow: all views are stacked in one box and cross-fade. Back, Play/Pause and Next buttons. Dots jump to a view. Arrow keys work too. Auto-advance every 4 seconds.
- Running log: every item in order, scrollable on its own. The active item is highlighted and kept in view. Clicking an item jumps to it.
- Phone widths stack the log under the slideshow.
- Missing image: shows the path in the frame instead of a broken image.
- Data file missing: the subtitle says so.

## Out of scope (for now)
- No saving of notes or ratings in the browser. Data lives in the data file.
- No build step. No dependencies.
