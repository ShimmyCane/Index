# Fishes — Brief (AI notes)

**Updated:** 2026-11-03

## Current state

- MVP built in `03 Projects/Fishes/`: plain HTML/CSS/JS, canvas 2D, no build step. Not device-tested on iPad.
- Twenty levels in five zones (Sunny Shallows, Coral Reef, Open Blue, Twilight, Deep Trench). Win at size 100 on level 20 (whale shark). Ends on three lives lost, win, or 15:00.
- Species (22 incl. food) are inspired by real fish, each with a one-line real-fish note in `js/species.js`.
- Hunters and ambushers lock on (red ring and a warning pill). Tension rises from 2:30 to 5:00.
- Notes: cookie first (25 kept, `fish_notes`), database when `supabaseUrl`/`supabaseKey` are set. Status shows in ⚙️ and the title screen.
- Database: `supabase/001_fish_notes.sql` written for the Family project (app `fishes`, registered in the same migration). **Not applied.** The page has no family sign-in, so writes will be refused (401/403) until sign-in exists. The page reports "needs family sign-in" in that case.

## Architecture

- `js/species.js`: `FishData` (SPECIES, ZONES, GOALS, LEVEL_NAMES, levelInfo, CONFIG).
- `js/game.js`: simulation, drawing and input. Test hook `window.FishGame.state()` and `debugSetSize(n)`.
- `js/notes.js`: `FishNotes` (add, list, status). Cookie plus localStorage fallback.
- `js/sound.js`: `FishSound` (play, unlock, enabled/setEnabled). Created on the first touch.

## Verified vs. unverified

- Verified (headless Chromium, 1194 × 834, served over HTTP): page loads; title → play; growth from pointer input; no page errors after the fix below; level jumps (size 20 → level 10; size 100 → level 20 win); level 9 locks on and a hit costs a life; cookie notes saved over HTTP; deep-level screenshots show the species drawn.
- Bug caught and fixed during testing: NPCs were drawn with `desc` instead of `sp`, so every NPC threw each frame (the loop caught it, so the page kept running). Errors now show only when "Show errors" is on, and this one showed up there.
- Unverified: pacing (the 8–15 minute target has not been measured; no full-run bot yet); difficulty and hit balance (three hits in a few seconds is harsh); touch feel on iPad; the SQL test (not run against Supabase); the database write path (keys blank).

## Next steps

1. Jimmy answers `convo/convo v0.1.md`.
2. Play on iPad; note slow, fiddly or unfair moments with the ⚙️ notes.
3. Run the rolled-back test in the Family project, then apply `001_fish_notes.sql` by hand. Add the family sign-in before filling in the keys.
4. Measure the run length with a simple bot or by timed play; tune GOALS, prey gain (0.4) and hunter sizes.
5. Look at hit rules (one life per contact vs. a 3-second window).
