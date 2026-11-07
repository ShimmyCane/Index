# Athena's world — Brief

**Status:** MVP with settings and family sign-in (v0.3.0), not yet device-tested or database-verified (see `03 Projects/Athena's world/schematic.md`).

## Goal

A decorating game for Athena. A white room, a choice of house or workplace, decoration buttons on the side, tap-to-place with tap-to-move, and the next house after each one is finished.

## Architecture

- One file: `03 Projects/Athena's world/index.html`. Inline CSS and JS, no build step, no server.
- Room items are absolutely positioned in % of the room, so they scale with the screen. They glide with a CSS transition.
- Wall items clamp to the wall zone, floor items to the floor zone. A new item appears at the top of the room (the "tray") until it is tapped into place.
- State per house: `pos` (placed items), `history` (snapshots for Undo), `done`. Only the unlocked house count is saved (`localStorage`, wrapped in try/catch).
- Sound: Web Audio oscillators, no files.

## Database

- Tables, RLS and registry: `03 Projects/Athena's world/supabase/` (written, not applied). Check the verify output before calling it verified.
- Offline and signed-out paths tested in headless Chromium. A signed-in run with no network shows `⚠️ check` and no crash.
- Not tested: a real family sign-in, and the tables in the live database.

## Verified

- Headless Chromium (Playwright): place, pick up, move, Undo, wall clamping, finishing a house shows the card, next house unlocks. No page errors.
- Screenshot of the landscape layout checked.

## Not verified

- A real iPad (Safari): touch, safe areas, `dvh` sizing, audio on first tap.
- Portrait layout.

## Assumptions to confirm (convo v0.3)

- The finish rule is "all listed things placed", with position up to Athena.
- Three houses in order, and the lists in the script.
- iPad landscape first.

## Next steps

1. Jimmy answers convo v0.3 (age, players, saving, next steps).
2. Device-test on iPad, then update the status in the schematic and the 03 projects schematic.
