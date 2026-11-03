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

## Open a project by link (like Make 3D's ?model=)
- `viewer.html?set=<name>`: a data file in this folder (`data/<name>.js`).
- `viewer.html?world=<id>`: a Growth world, loaded from `../Growth/worlds/<id>.js` and turned into items by `../Growth/js/growth_model.js` (`toReview`). Only letters, digits and underscores are allowed in `<id>`.
- `&step=<n>` on either: open on step n (1-based). The slideshow then waits for Play. As you step, the address changes to the step you are on, so the link can be shared.
- `#draft=<base64 of a world>`: an unsaved world sent from the Growth page. It is data, shown only as text. Pictures in a draft are ignored, so a link cannot pull images from elsewhere.
- Items with no `image` but a `card` (`kicker`, `bars` of label, value, max, colour, and a `note`) show a state card. Without either, the frame says "No picture for this step."

## Scene drop-down
`data/sets.js` lists every review for the drop-down in the header (the Growth worlds from `../Growth/worlds/index.js` are added to it as "Growth: …"): `window.REVIEW_SETS = [{ id, label }]`. `id` is the data file name without `.js`; `label` is what the drop-down shows. If `sets.js` is missing, the drop-down is hidden and `?set=` still works.

**One data file per project.** Each project appears once in the drop-down, and its full run (all versions, in order) lives in that one file. When a project gets new versions, add their items to its existing file and update the title and label. Do not start a new file for a later time span. Add a new file only for a new project.

**Archive.** `data/archive/` keeps the old split pieces (for example the pre-merge `earth_views_v11.js`). They are not in the drop-down and cannot be opened with `?set=`, because set names may not contain folders.

## Behaviour
- Slideshow: all views are stacked in one box and cross-fade. Back, Play/Pause and Next buttons. Dots jump to a view. Arrow keys work too. Auto-advance every 4 seconds.
- Running log: every item in order, scrollable on its own. The active item is highlighted and kept in view. Clicking an item jumps to it.
- Phone widths stack the log under the slideshow.
- Missing image: shows the path in the frame instead of a broken image.
- Data file missing: the subtitle says so.

## Out of scope (for now)
- No saving of notes or ratings in the browser. Data lives in the data file.
- No build step. No dependencies.
