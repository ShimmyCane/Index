# Track B: Studio design

For architecture, 3-D modelling, specifications, design work, and design documentation. Desktop-first, formal, keyboard/pointer, full information.

## Screen density & interactions

- **Main area:** 3-D viewport, drawing canvas, or specification table
- **UI:** full labels with units, keyboard shortcuts, precise inputs, grouped panels
- **Text:** complete sentences, explain every abbreviation, link to reference material
- **Secondary features:** collapsed panels with clear headers on a large screen, never removed
- **Errors:** at the bottom, always visible (not opt-in), error panel with actionable details

## Defaults table

| Setting | Track B |
|---|---|
| Palette | Paper and ink (black text, light paper background, strong contrast), or Quick Detail look |
| Panel defaults | Open on large screen by default. Collapsible but visible. Each has a clear header and icon. |
| Panels hold | Grouped options (materials, lighting, dimensions, viewport controls); each section has a toggle |
| Database | Architecture Supabase project (`xabgankckrcuhcgdolrg`), owner-only access rules |
| Private data | Client or practice material in `private/`; never committed. Synthetic samples only. |
| Keyboard | Full keyboard support; Tab cycles through inputs, Escape closes modals, arrow keys pan/zoom |
| Pointer | Click to select, drag to move/draw, right-click for context menu, scroll to zoom or pan |
| Orthographic precision | Every dimension is exact; no guessing. Show current values and units at all times. |

## Skills to use

- `/summarize-code` — visual code summary, architecture overview, table of contents with line numbers
- `/simplify-code` — break large files into separate css/js/html, simplify logic
- `/smoke-test` — headless test at three screen sizes, check orthographic layouts and dimensions
- `/bake-cache` — precompute slow 3-D or complex calculations into cacheable script blocks

## Rules

- **Never put real client or practice work in the repo.** Use synthetic samples. Keep the real work in `private/`.
- **Owner-only rules use `public.platform_is_owner()`**, never email addresses (see `04 AI/Supabase/platform_owner.sql`).
- **Design for desktop first**, not mobile. Keyboard and large screens are the working environment.
- **Show all information by default.** Users of design tools expect full control, not hidden options.

## Examples

Make 3D, Shimmy Specs, Living Room Scene, Paper Again, Critique Detail, Salmon Leap.
