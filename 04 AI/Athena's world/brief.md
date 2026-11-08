# Athena's world — Brief

**Status:** level menu over the home room (v0.5.0); placeholders for levels 2–4, not yet device-tested or database-verified (see `03 Projects/Athena's world/schematic.md`).

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

## v0.4.0 (2026-11-08)

- Five houses with their own things (emoji assets). Finishing all five opens the ready pop-up. Yes opens a Retail therapy placeholder; No offers Replay, which goes to the first house and keeps all progress.
- Tested headless: all five houses, pop-up after the fifth, No → Replay keeps five stars, Yes → Retail therapy and back. No page errors.
- Not verified: iPad layout with five house buttons; the real Retail therapy content (not decided, convo v0.4).

## v0.5.0 (2026-11-08)

- Level menu (dock) floats over the home room: Home decor, Learning center, Retail therapy, Get a job, then Family life, Making friends, Exploring the world (coming soon). Lock rules: learning always open; retail after the first house; jobs after all five houses.
- Tested headless: locks at start, placeholder screens, Home returns from any screen, unlocks after five houses, pop-up Yes → Retail therapy. No page errors. Dock clears the sync pill; no page-level horizontal scroll at 1180 and 390 widths.
- Not verified: iPad touch on the dock; the real content for levels 2–4.
