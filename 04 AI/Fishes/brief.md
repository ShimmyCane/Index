# Fishes — Brief (AI notes)

**Updated:** 2026-11-03

## Current state

- Plain HTML/CSS/JS canvas game in `03 Projects/Fishes/`. No build step. Not device-tested on iPad.
- **20 tiers** (one per level, five depth zones). Each tier has 2–3 species, each with a **temper**: docile (never attacks or locks on), wary (hunts smaller fish, ignores you when smaller, no lock-on), aggressive (hunts smaller fish, locks on to you when smaller). 58 species in total, including food and harmless giants.
- **Evolution:** the player takes its tier's lead species (first listed for that tier). Banner "Evolved into …" on reaching a tier.
- **Fish eat fish:** a non-docile fish ≥1.25× bigger eats a smaller fish it touches, and hunters actively hunt smaller fish nearby.
- **Adaptive sea:** populations are sized against the player. Threats spawn at 1.15–1.9× your size, edible prey at 0.25–0.85×, harmless fish are a small share.
- **Difficulty = predator:prey ratio** (set on the title screen): Easy 1:4 (20% predators), Medium 1:2 (33%), Hard 1:1 (50%). Rises by up to 50% from 2:30 (capped at 70%).
- Win at size 100 on tier 20. Ends on three lives lost, win, or 15:00. The end card says what ate you.
- Notes: cookie first (25 kept), database when `supabaseUrl`/`supabaseKey` are set. Status in ⚙️ and on the title screen.
- Database: `supabase/001_fish_notes.sql` written (app `fishes`, registered). **Not applied.** No family sign-in on the page yet, so writes will be refused (401/403) until sign-in exists.

## Architecture

- `js/species.js`: `FishData` (SPECIES with `tier`/`temper`/`kind`, ZONES, GOALS, LEVEL_NAMES, DIFFICULTY, levelInfo, leadOf, CONFIG).
- `js/game.js`: simulation (player, populations `fillPopulations`/`census`/`pickSpecies`/`pickRole`, NPC AI in `updateNPC`, `findPrey`, fish-eat-fish in `update`), drawing, input, panel. Test hook `window.FishGame.state()` (includes `census`, `npcEaten`, `form`, `difficulty`) and `debugSetSize(n)`.
- `js/notes.js`: `FishNotes`. Cookie plus localStorage fallback.
- `js/sound.js`: `FishSound`. Created on first touch.

## Verified vs. unverified

- Verified (headless Chromium, 1194 × 834, served over HTTP, no page errors):
  - Predator share matches the setting at tier 10: easy 0.23, medium 0.32, hard 0.51 (target 0.20 / 0.33 / 0.50).
  - Fish eat fish in play: 54 eaten in 25 seconds at medium (plankton included).
  - Evolution: forms change per tier (clownfish, wrasse, parrotfish, mackerel, mahi, lanternfish, greenland, basking). Size 100 ends the run as a win.
  - Earlier: level jumps, lock-on, a hit costs a life, cookie notes.
- Unverified: pacing (the 8–15 minute target is still unmeasured); balance of predator sizes per tier; whether docile fish are readable as docile on iPad; touch feel; the SQL test; the database write path.
- Not tested: the lock-on by aggressive fish specifically at each tier. The code path is the same as before, now gated to aggressive temper.

## Next steps

1. Jimmy answers `convo/convo v0.2.md`.
2. Play one full run per difficulty on iPad; time it against 8–15 minutes and note where it feels unfair.
3. Tune: prey gain (0.4 of prey size), predator size bands (1.15–1.9×), fish target (22 + 2×tier), threat cap (70%).
4. Run the rolled-back test in the Family project, then apply `001_fish_notes.sql` by hand. Add family sign-in before filling in the keys.
