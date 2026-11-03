# Fishes — Schematic

**Status:** MVP (not yet device-tested)
**Owner:** Jimmy
**Platform:** iPad web app (plain HTML/CSS/JS, canvas, no build step, GitHub Pages later)
**Conversation:** `convo/convo v0.1.md`

## Purpose

A game inside a fish tank that becomes the ocean. You start as a baby fish eating plankton, grow by eating smaller things, and finish as the largest fish ever (a whale shark). It is not realistic, but the fish are inspired by real fish. The sea goes deeper and bigger level by level. Other fish can lock on to you, and it gets harder after 2:30.

## Goal and ending

- Grow from size 1 to **size 100 on level 20** to win (the whale shark).
- **Lose** when you have no lives left (eaten three times).
- **Time's up** at 15:00 (hard stop).
- Typical run target: **8–15 minutes** (not yet measured; see `04 AI/Fishes/brief.md`).

## Controls

- **Swim:** hold your finger (or mouse) on the sea. The fish swims toward it. Arrow keys / WASD work on a computer.
- **Sprint:** hold 💨 (lower left), or Shift / Space. It doubles speed and uses stamina, which refills when you stop.
- **Settings and notes:** ⚙️ (lower right) — sound, show errors, notes, database status.

## Rules

- **Size** starts at 1. Plankton (+0.1 each) and other fish grow you by 40% of their size when you eat them. You can eat a fish that is at most 87% of your size (you must be 1.15× bigger).
- **Being eaten:** a hunter or ambusher that is at least 1.1× your size costs one life. You shrink to 75% of your size (not below the level's start) and respawn in the middle with 3 seconds of protection.
- **Lives:** 3.
- **Pufferfish** (spines): eating one costs size. Other fish learn to avoid it by appearance, not by rule.
- **Lock-on:** a hunter that is bigger than you and within sense range can lock on (chance per second rises with tension). A red ring marks it and a warning shows at the top. The lock lasts 7–9 seconds, or until you are out of range (twice the sense range) or no longer its prey. Then the hunter cools down for 4 seconds.
- **Ambushers** (grouper, moray, anglerfish) wait, then lunge when you are smaller and close.
- **Harmless** fish (sunfish, oarfish, megamouth, whale shark) drift. You can eat them when you are big enough.
- **Tension:** 0 until 2:30, rising to full at 5:00. Hunters and ambushers become more numerous, and locks are more likely.

## Levels and zones

Twenty levels in five depth zones. The world (play area) grows with each level, from 1600 × 1000 to 6540 × 4040. The camera zooms out as you grow.

| Levels | Zone | Size to leave | Notes |
|---|---|---|---|
| 1–4 | Sunny Shallows | 2, 3, 4, 5 | plankton, guppy, neon tetra, clownfish, herring, pufferfish |
| 5–8 | Coral Reef | 7, 9, 11, 14 | damselfish, parrotfish, angelfish, blue tang, moray, mackerel, grouper |
| 9–12 | Open Blue | 17, 21, 25, 30 | barracuda, snapper, bluefin tuna, reef shark, trevally |
| 13–16 | Twilight | 36, 43, 50, 58 | lanternfish, anglerfish, opah, ocean sunfish, gulper eel |
| 17–20 | Deep Trench | 67, 77, 88, 100 | oarfish, great white, megamouth, whale shark |

Level names and the full list are in `js/species.js`.

## Species (inspired by real fish)

Plankton and krill are food. Prey fish flee bigger fish; schoolers gather. Hunters and ambushers are the threats. Harmless fish drift. Full notes are on each species' `real` field in `js/species.js`.

## Files

- `index.html`: the page (title, HUD, sprint, ⚙️ panel, end card, error strip).
- `css/style.css`: pastel look, bold outlines, offset shadows, big targets.
- `js/species.js`: species, zones, the 20 levels (`GOALS`, `LEVEL_NAMES`), config (lives, time limit, tension, database keys).
- `js/game.js`: simulation (player, AI, eating, lock-on, levels), drawing and input. Test hook: `window.FishGame` (`state()`, `debugSetSize()`).
- `js/notes.js`: notes. Saved to a cookie (last 25 notes), then to the database when configured.
- `js/sound.js`: Web Audio tones, created on the first touch.
- `supabase/001_fish_notes.sql` and `supabase/test_001_fish_notes_rollback.sql`: the notes table (not yet applied).

## Notes and database

- Every note is saved in a cookie straight away (`fish_notes`, up to 25, 300 characters each), with the level, size and seconds into the run.
- The database table is `fish_notes` (Family project, app `fishes`, registered). It is **not connected yet**: `supabaseUrl` and `supabaseKey` in `js/species.js` are blank.
- The table allows only signed-in family members. The page has no sign-in yet, so writes will show "needs family sign-in" until that is added. The status shows in ⚙️ and on the title screen.
- Failures show on the page (the status line, and the error strip at the bottom when "Show errors" is on).

## Not in MVP

- Family sign-in and database writes.
- Saved progress across visits, and a high-score list (only the best score on this device).
- Sound files, music, more species, Quick Game, story, and fish eating fish.

## Open

- See `convo/convo v0.1.md`. The defaults above are built in and can be changed there.
