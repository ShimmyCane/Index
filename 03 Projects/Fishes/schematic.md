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
- **Being eaten:** a non-docile hunter or ambusher that is at least 1.1× your size costs one life. You shrink to 75% of your size (not below the level's start) and respawn in the middle with 3 seconds of protection.
- **Lives:** 3.
- **Pufferfish** (spines): eating one costs size. Other fish learn to avoid it by appearance, not by rule.
- **Lock-on:** an *aggressive* hunter that is bigger than you and within sense range can lock on (chance per second rises with tension). A red ring marks it and a warning shows at the top. The lock lasts 7–9 seconds, or until you are out of range (twice the sense range) or no longer its prey. Then the hunter cools down for 4 seconds.
- **Ambushers** (grouper, moray, anglerfish) wait, then lunge when you are smaller and close.
- **Harmless** fish (sunfish, oarfish, megamouth, whale shark) drift. You can eat them when you are big enough.
- **Tension:** 0 until 2:30, rising to full at 5:00. Hunters and ambushers become more numerous, and locks are more likely.

## Tiers, evolution and the food chain

Twenty tiers (one per level), in five depth zones. The play area grows with each tier, from 1600 × 1000 to 6540 × 4040. The camera zooms out as you grow.

- **Evolution:** each tier has a lead species. On reaching a tier you take its form (banner: "Evolved into …"). Tier 1 is a guppy; tier 20 is a basking shark.
- **Several species per tier**, each with a temper:
  - **docile** never attacks and never locks on. It flees bigger fish. (Guppy, herring, angelfish, sunfish.)
  - **wary** hunts smaller fish, ignores you when you are smaller, and flees when you are bigger. It does not lock on. (Dottyback, cleaner wrasse, sailfish, goblin shark.)
  - **aggressive** hunts smaller fish and locks on to you when you are smaller. (Bonito, barracuda, bluefin tuna, reef shark, great white, blue marlin.)
- **Fish eat fish.** A non-docile fish at least 1.25× bigger eats a smaller fish it touches, plankton included. Docile fish are never eaten by the player's rule, but they can still be eaten by a bigger predator.

| Tier | Zone | Size to leave | Species (temper) |
|---|---|---|---|
| 1 Sunny Cove | Shallows | 2 | guppy (docile) · neon tetra (docile) · plankton (food) |
| 2 Sea-grass Flats | Shallows | 3 | clownfish (docile) · goby (docile) · dottyback (wary hunter) · krill (food) |
| 3 Rock Pool Edge | Shallows | 4 | cleaner wrasse (wary) · herring (docile) |
| 4 Sandy Shelf | Shallows | 5 | anchovy (docile) · pufferfish (docile, spiny) · butterflyfish (docile) |
| 5 Coral Gardens | Reef | 7 | parrotfish (docile) · blue damselfish (wary) · moray eel (aggressive ambusher) |
| 6 Anemone Bay | Reef | 9 | angelfish (docile) · blue tang (docile) · lionfish (wary, spiny) |
| 7 Reef Wall | Reef | 11 | mackerel (wary) · triggerfish (docile) · bonito (aggressive hunter) |
| 8 Parrot Lagoon | Reef | 14 | grey mullet (docile) · red snapper (wary) · grouper (wary ambusher) |
| 9 Open Blue | Open Blue | 17 | jack (wary) · trevally (wary hunter) · barracuda (aggressive hunter) |
| 10 Tuna Run | Open Blue | 21 | mahi-mahi (wary) · bluefin tuna (aggressive hunter) |
| 11 Shark Lane | Open Blue | 25 | rainbow runner (docile) · reef shark (aggressive) · sailfish (wary) |
| 12 Wide Water | Open Blue | 30 | sea bream (docile) · wahoo (aggressive) · striped marlin (wary) |
| 13 Twilight Shoal | Twilight | 36 | lanternfish (docile) · hatchetfish (wary) · opah (docile) |
| 14 Lantern Drift | Twilight | 43 | escolar (wary hunter) · ocean sunfish (docile, harmless) · anglerfish (aggressive ambusher) |
| 15 Angler Shelf | Twilight | 50 | pomfret (docile) · swordfish (aggressive) |
| 16 Slope Edge | Twilight | 58 | oilfish (docile) · gulper eel (aggressive) |
| 17 Deep Trench | Deep | 67 | viperfish (wary) · coelacanth (docile, harmless) · oarfish (docile, harmless) |
| 18 Abyss Mouth | Deep | 77 | goblin shark (wary) · megamouth (docile, harmless) · great white (aggressive) |
| 19 Whale Ocean | Deep | 88 | greenland shark (wary) · blue marlin (aggressive) |
| 20 Whale Ocean | Deep | 100 | basking shark (docile, harmless) · whale shark (docile, harmless, the goal) |

Each species' real-fish note is in `js/species.js`.

## Difficulty: the predator:prey ratio

The sea adapts to your size. Each new fish is sized against you:
- **Predator** = a non-docile hunter or ambusher at least 1.1× your size (it can eat you).
- **Prey** = a fish at most 0.87× your size (you can eat it).
- Threats spawn at 1.15–1.9× your size. Edible fish at 0.25–0.85× your size. Harmless fish are a small share.

| Setting | Ratio (predator : prey) | Share of new fish that are predators |
|---|---|---|
| Easy | 1 : 4 | 20% |
| Medium | 1 : 2 | 33% |
| Hard | 1 : 1 | 50% |

From 2:30 the predator share rises by up to 50% (capped at 70%) as the game gets harder. Pick the setting on the title screen. Measured headless: the threat share was 0.23 on easy, 0.32 on medium and 0.51 on hard, at tier 10.

## Files

- `index.html`: the page (title, HUD, sprint, ⚙️ panel, end card, error strip).
- `css/style.css`: pastel look, bold outlines, offset shadows, big targets.
- `js/species.js`: 20 tiers and their species (`SPECIES` with `tier`, `temper`), zones, `GOALS`, `DIFFICULTY`, `leadOf()`, config (lives, time limit, tension, database keys).
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
- Saved progress across visits (only the best score on this device).
- Sound files, music, story, Quick Game, and a high-score list.

## Open

- See `convo/convo v0.1.md`. The defaults above are built in and can be changed there.
