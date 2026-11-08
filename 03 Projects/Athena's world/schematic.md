# Athena's world — Schematic

**Status:** MVP with five houses, level menu, sign-in, bag of bought things (v0.8.0), MVPs of the Learning center, Retail therapy and Get a job, not yet device-tested
**Owner:** Jimmy
**Platform:** iPad web app, landscape first (portrait stacks the room above the buttons)
**Conversations:** `convo/convo v0.1.md` (questions), `convo/convo v0.2.md` (visibility answers), `convo/convo v0.3.md` (purpose, MVP, assumptions), `convo/convo v0.4.md` (five houses, ready pop-up, open questions)

## Purpose

A decorating game. Athena picks who a house or workplace is for, then decorates a blank white room with things like a bed, a window, a picture, a sofa and a plant. When a house is finished she moves on to the next one.

## How it plays

- **Left:** the white room. Walls above the line, floor below. A line of hint text sits above it.
- **Right:** "Who is it for?" buttons (locked houses show 🔒, finished ones ⭐). Under it, "Decorate" buttons for the things the chosen house needs (✓ once placed), then ↩️ Undo.
- **Gear ⚙️ (lower right):** sound on or off, and "Empty this house".
- **Placing:** tap a decoration and it appears up top. Tap the room and it moves there straight away. Tap a placed thing to pick it up, tap the room to move it, or tap it again to put it down where it is.
- **Wall things (window, picture)** stay on the wall. **Floor things (bed, sofa, plant)** stay on the floor.
- **Finishing:** when all the listed things are placed, a celebration card appears and the next house unlocks.
- **Five houses** (v0.4.0): Athena's cottage 🏡, Beach hut 🏖️, Treehouse 🌳, City flat 🏙️, Farmhouse 🚜. Each has its own list of things. The workplace shop is no longer a house.
- **Ready pop-up:** after the fifth house, "Are you ready for the next experience?" **Yes** opens Retail therapy (a placeholder screen for now). **Not yet** shows a **Replay** button, which starts again at the first house. Everything decorated stays.
- **Assets** are emoji only (no image files): 4 wall things and 10 floor things, listed in the script.

## Settings, notes and version

- **⚙️ (lower right)** opens the Settings drawer: Sound on or off, "Empty this house", Show errors, Notes for improvement, and About (version and changelog). Follows `02 Refs/Skills/settings_gear.md`.
- **Show errors** is off by default. Errors are always recorded, and turning the switch on shows the bottom panel with any that already happened.
- **Notes for improvement** save on this device only, under `athena.notes`. Each note records the house and the thing picked (for example "Athena's house · bed"), the time and the version. Copy notes puts them on the clipboard. Nothing is sent anywhere. Follows `02 Refs/Skills/feedback_notes.md`.
- **Version** is `VERSION` at the top of the script. Add a line to the changelog in the drawer when it changes.
- **Family sign-in:** the drawer has the family email and password. Signed in, the saved game (unlocked houses and rooms) and the notes go to the Family project's database (`athena_saves`, `athena_notes`). Signed out, everything stays on this device.
- **Sync pill** (top of the play area): `💾 this device`, `☁️ synced`, `☁️ syncing…`, `⚠️ check`. Check database lists each table in the drawer.
- Settings are kept on the device only. The publishable key is in the script; the service-role key is never used.
- The SQL lives in `supabase/`: `test_001` (rolled back, run first), `001_athena_family` (the tables), `verify_001` (read-only, paste the result back). Not applied until pasted by hand.

## The three MVPs (v0.8.0)

- **Learning center:** a round of 4 questions from `content.js` (`QUESTIONS`). A right answer on the first try earns 5 credits; a right answer after a wrong try earns 2. Credits show as 🪙 on the front page and in every level.
- **Retail therapy:** 12 shops (`SHOPS` in `content.js`), each selling things by id with a price. Buying puts the thing in the bag, so it becomes a decorate button in every house. A trip home needs every shop visited and 20 credits spent (`TRIP`). Shop names are generic until Jimmy answers convo v0.5.
- **Get a job:** the job board holds all 37 jobs (`JOBS`, from `jobs.md`). Architect, Pilot and Artist have full steps (`JOB_STEPS`): two learn pages, a three-question quiz, a scenario to ask a real worker (with choices and a sentence starter, saved as the answer), a first-pass task, then Hired ⭐. The other 34 show their card; their steps come later.
- Saved on the device, and in `athena_saves` when signed in: credits, the trip, hired jobs, and the challenge answers.

## Front page (v0.7.0)

- The front page is the landing screen. On the left, a small read-only picture of the current house (the home room as it is now). On the right, the sections as tabs: Home decor, Learning center, Retail therapy, Get a job, then Family life, Making friends, Exploring the world (coming soon).
- Home decor opens the full room. The side panel's bottom button, 🏠 Front page, brings you back. Other sections open their own screen with 🏠 Back to front page.
- The sync pill sits at the top of every screen.

## The bag (v0.6.0)

- Things bought in the shops go into the bag with `addToBag(id)`. Each bag item becomes a decorate button in every house, and can be placed in any house.
- The house's own list comes first, then the rest of the bag.
- The bag is saved with the game (on the device, and in `athena_saves` when signed in).
- To add a new thing, add one line to `ITEMS` in the script (emoji, label, zone: `wall` or `floor`). A shop then sells it by its id.
- Example things in v0.6.0: vase 🏺, candle 🕯️, cactus 🌵, balloon 🎈 (floor); rainbow 🌈, kite 🪁 (wall).

## Levels (v0.5.0)

A level menu floats above the home room. Home is always level 1, underneath, and always reachable.

| # | Level | Opens when |
|---|-------|------------|
| 1 | Home decor | Always |
| 2 | Learning center (Test Bank) | Always, so credits can be earned |
| 3 | Retail therapy | The first house is finished |
| 4 | Get a job | All five houses are finished |
| 5 | Family life | Coming soon (locked) |
| 6 | Making friends | Coming soon (locked) |
| 7 | Exploring the world | Coming soon (locked) |

Levels 2–4 open as placeholder screens for now. Lock rules are a suggestion, see convo v0.6.

## Jobs (planned, not built)

- After the houses and the shops, Athena can **buy a job** from the job board. There are 37 jobs (see `jobs.md`).
- Flow: job board → job card → Apply → learn (two or three pages) → quiz → challenge for a real person (scaffolded scenario) → work on it (first pass) → Hired! badge.
- Each job is developed on its own later.

## Files

- `index.html` — the whole game (HTML, CSS, JS, Web Audio). The house and item lists are at the top of the script.
- `mockups/` — pages to see the project at a glance: `index.html` (front page with links), `project-map.html` (every file and what it is for), `game-flow.html` (the steps of play, with a picture of the room).
- `jobs.md` — the 37 jobs to explore, with the job flow.
- `convo/` — Q&A history, one file per round, never compacted (convo v0.6 holds the level plan).
- `CLAUDE.md` — pointer for Claude Code.

## Open

- Athena's age and what she can do on her own (convo v0.3, Q4).
- Whether houses and decorations should be saved between visits (Q9). Answered in code: yes, through the family sign-in.
- Whether anyone else plays (Q5).
- What comes next (Q16).
- Retail therapy and the economy: credits from questions, a shop trip of 12+ shops, going home to decorate, and buying a job (convo v0.5, planned, awaiting answers).
- What Replay should go back to (convo v0.4, Q2).

Details go in `convo/` as they are answered. Do not compact old convo files.
