# Project Track — decision guide

**Choose once at the start. It decides screen density, what goes in ⚙️, database, and private-data rules.**

## Decide: Family play (A) or Studio design (B)?

Read the clarifying questions from your project:
- Who will use this? (family/children, or client/design team)
- What is the core action? (play, build, design, solve, review)

Then:
- **Track A: Family play** — games, activities for family and children. Light, graphical, iPad-first.
- **Track B: Studio design** — architecture, 3-D, specs, design work. Dense, formal, keyboard/pointer.

If the project does both, pick the main user's track.

## Then follow the specific guidance

- **Track A:** Read `02 Refs/Workflow/family_project_track.md` for UI defaults, palette, database, and skills
- **Track B:** Read `02 Refs/Workflow/architecture_project_track.md` for UI defaults, palette, database, and skills

## Shared: Collapsible panels

Both tracks use the same collapsible panel code. Copy this into every app:

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
  var KEY = 'app.panels';
  var saved = {}; try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
  function apply(section, open) {
    section.dataset.collapsed = String(!open);
    section.querySelector('.panelHead').setAttribute('aria-expanded', String(open));
  }
  document.querySelectorAll('.panel').forEach(function (section) {
    var id = section.dataset.panel;
    var open = id in saved ? saved[id] : section.dataset.open !== 'false';
    apply(section, open);
    section.querySelector('.panelHead').addEventListener('click', function () {
      open = section.dataset.collapsed === 'true';
      apply(section, open); saved[id] = open;
      try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {}
    });
  });
})();
```

**Panel rules (both tracks):**
- Collapsed is the default only for track A on small screen (iPad portrait). On large screens, open by default for track B.
- A collapsed panel must still show its header; never hide a panel entirely.
- Remember each panel's state per device (localStorage with try/catch); the page works if storage is blocked.
- Do not nest panels more than one level deep.
