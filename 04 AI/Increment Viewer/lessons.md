# Increment Viewer: lessons

Project-specific lessons, appended over time. Generic lessons go to `04 AI/lessons_pool.md`.

## 2026-11-04: merging split data files
- Several split files for one subject (Earth V02–V23, planets V02–V06, Adventure Coaster V01–V16) were merged into one data file each. The originals are kept in `data/archive/`, so the history stays and the page reads one file.
- The viewer knows nothing about the subject. Keep subject words in the data file only, never in `viewer.html`. This is the rule that makes the page reusable.
- Check the log counts after a merge: 22, 40 and 16 entries matched the data in a headless run. A count that does not match points to a dropped item.

## Open
- The Adventure Coaster V16 render does not exist yet (`Make 3D/renders/adventure_park_compact/v16.png`). The frame shows the path. Render it, or drop the item.
- Not tested on iPad or other browsers.
