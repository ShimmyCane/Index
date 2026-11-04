# Project Track (family play or studio design)

Purpose
Most projects fall into one of two directions. Set the track at the start, because it decides the density of the screen, the amount of text, what is hidden in ⚙️, and which database and private-data rules apply.

The two tracks
- **A. Family play** (games and activities for the family and children): bold, graphic, large touch targets, few words, icons with a short label, one main play area, and everything secondary inside ⚙️. A child can use it without reading much. Palette: pastel or the family look (`jimmy_preferences.md` §5). Family database. Examples: Fishes, Expansion Wars, Chinese Character Sudoku, Felix Maze, Adventure.
- **B. Studio design** (architecture, 3-D modelling, specifications, design in space): more information on screen, more options, more words, precise labels and units, keyboard and pointer, dense but orderly panels. Still collapsible. Palette: paper and ink (the Quick Detail look). Architecture database, strict private-data rules. Examples: Make 3D, Living Room Scene, Shimmy Specs, Paper Again, Growth (to confirm).

Both tracks
- **Every panel is collapsible, and the default is visible.** Each section has a header with an icon, a short name and a ▸/▾ marker. Collapsed sections keep their header, so the screen stays graphically clear. Lessons: "Panels toggle, they don't replace" (Coins).
- Anything not needed on screen goes inside ⚙️ for track A; for track B it goes in a collapsed panel with a clear header, never removed.
- Errors at the bottom, opt-in, behind ⚙️ (`settings_gear.md`). Feedback notes in ⚙️ for the first tests (`feedback_notes.md`).
- Gear in the lower right, same as every app.

Input
- The project folder and its `schematic.md`, or a one-line description from Jimmy.

Steps
1. **Classify.** Read the schematic. Decide the track from who uses it and what it is for: a child or the family plays it (A); it designs, models, specifies or documents something for a client or a built space (B). If it does both, pick the track of the main user and note the other.
2. **Confirm with one question** if it is not clear from the schematic: "Is this for the family to play, or for design work?" Record the answer in the schematic's first lines.
3. **Set the defaults** for the track in the schematic (one table):
   | Setting | A. Family play | B. Studio design |
   |---|---|---|
   | Words on screen | few, with icons | full labels and units |
   | Options visible | the main action and one choice | the working set, grouped in panels |
   | ⚙️ holds | everything secondary | secondary and advanced options |
   | Panels | collapsible, closed when space is tight | collapsible, open by default on a large screen |
   | Palette | pastel / family look | paper and ink |
   | Database | Family project, family login | Architecture project, owner only |
   | Private data | family photos in `private/` | client or practice material in `private/`, never committed |
   | Skills | `ipad_website`, `settings_gear`, `feedback_notes` | `make_3d`, `simulate_decay`, `summarize_code` |
4. **Build the panels** with the collapsible pattern below, in the track's defaults.
5. **Record the track** in `CLAUDE.md` (one line: "Track: A. Family play") and in the projects schematic.

Collapsible panel (copy into the app; classic script, no build)
```html
<section class="panel" data-panel="notes">
  <button class="panelHead" type="button" aria-expanded="true" aria-controls="notes-body">
    <span class="panelIcon">📝</span><span class="panelTitle">Notes</span><span class="panelMark">▾</span>
  </button>
  <div class="panelBody" id="notes-body">…</div>
</section>
```
```css
.panel { border: 3px solid #2f2d3d; border-radius: 18px; background: #fffdf7; margin: 10px 0; overflow: hidden; }
.panelHead { width: 100%; min-height: 52px; display: flex; align-items: center; gap: 10px; padding: 0 14px;
  border: 0; background: #ffe9a8; font: 700 18px system-ui, sans-serif; color: #2f2d3d; cursor: pointer; text-align: left; }
.panelTitle { flex: 1; }
.panelBody { padding: 12px 14px; }
.panel[data-collapsed="true"] .panelBody { display: none; }
.panel[data-collapsed="true"] .panelMark { transform: rotate(-90deg); }
[hidden] { display: none !important; }
```
```js
(function () {
  var KEY = 'app.panels';                                   // one key per app
  var saved = {}; try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
  function apply(section, open) {
    section.dataset.collapsed = String(!open);
    section.querySelector('.panelHead').setAttribute('aria-expanded', String(open));
  }
  document.querySelectorAll('.panel').forEach(function (section) {
    var id = section.dataset.panel;
    var open = id in saved ? saved[id] : section.dataset.open !== 'false';  // data-open="false" starts closed
    apply(section, open);
    section.querySelector('.panelHead').addEventListener('click', function () {
      open = section.dataset.collapsed === 'true';                  // currently collapsed, so open it
      apply(section, open); saved[id] = open;
      try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {}
    });
  });
})();
```
Rules
- Collapsed is the default only for track A on a small screen (phone or iPad portrait). On a large screen, open by default for track B.
- A collapsed panel must still show its name and icon; never hide a panel with no header.
- Remember each panel's state per device (local storage, in a try/catch); the page works if storage is blocked.
- Do not put a panel inside another more than one level deep. A deep tree is harder to read on a small screen.
- Keep text short in track A. Put the longer explanation in a "How to read this" note inside its panel, not on the main screen (`jimmy_preferences.md` §2b).

Current projects (proposed; confirm with Jimmy)
- Track A (family play): Fishes, Expansion Wars, Chinese Character Sudoku, Felix Maze, Adventure, Athena's world (confirm).
- Track B (studio design): Make 3D, Living Room Scene, Shimmy Specs, Paper Again.
- To confirm: Growth (planning and simulation), Increment Viewer (a shared viewer for both tracks; it stays neutral).
