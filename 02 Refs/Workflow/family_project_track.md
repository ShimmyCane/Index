# Track A: Family play

For games and activities the family and children will play. iPad-first, graphical, touch-friendly, minimal text.

## Screen density & interactions

- **Main area:** one clear action or game board, centered
- **UI:** large touch targets (48–68px minimum), bold lines (2.5–3.5px), icons + short labels
- **Text:** few words; explain complex ideas in a "How to read this" note inside a collapsed panel, never on the main screen
- **Secondary features:** hide in ⚙️ (settings gear, lower right)
- **Errors:** at the bottom, opt-in, behind ⚙️

## Defaults table

| Setting | Track A |
|---|---|
| Palette | Pastel (soft vanilla, sage, peach, mint) or family look (Quicksand, Orbitron, Patrick Hand; ink, paper, sun) |
| Panel defaults | Collapsed on small screen (iPad portrait), open on large screen. Keep header visible always. |
| ⚙️ holds | Audio settings, volume, speed, difficulty, game modes, database check, any test cheats |
| Database | Family Supabase project (`twvqvutrcobedvuhnzxq`), family login for multi-device sync |
| Private data | Family photos in `private/`; never committed to repo |
| Touch targets | Minimum 48px; aim for 68px for children. No pinch/double-tap zoom unless intentional. |
| Tactile feedback | Web Audio API for clicks and wins; box-shadow for depth (offset shadows); asymmetric border radius |
| Offline first | 3-tier fallback: live API → localStorage cache → bundled JSON. Show visible error panel if offline. |

## Skills to use

- `/ipad-website` — iPad/tablet design guide and conventions
- `/settings-gear` — standard ⚙️ drawer pattern, database check
- `/feedback-notes` — in-⚙️ notes box for user improvement ideas
- `/game-controls` — if the project has movement, steering, or aiming (drag center-relative, joystick option, action buttons lower right)

## Examples

Fishes, Expansion Wars, Chinese Character Sudoku, Felix Maze, Adventure, Athena's Piano Companion.
