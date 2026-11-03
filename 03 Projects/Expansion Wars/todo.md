# Expansion Wars — todo

Built from the feedback notes (round 2). Each item says whether it is done, and what decision it still needs.

## Done in this round

- [x] Send 10 / 25 / 50 / 100%, default 25%, minimum two soldiers. Button in the top-left corner of the board.
- [x] Drag from several of your spots: moving over your own regions adds them; a drop on another region sends each one that has a road to it.
- [x] A drop anywhere inside a region counts, not only on the spot's centre.
- [x] The game ends as soon as the other players are gone; neutral spots may remain.
- [x] Soldiers marching toward each other on the same road fight when they meet (the larger force keeps the difference).
- [x] Population bar across the top: each player's share of soldiers.
- [x] Hard computer level. Computers are capped at moves per minute: Easy 6, Normal 10, Hard 16.
- [x] Computers move reinforcements from spots away from the front to their front line.
- [x] Feedback notes sync to the family table once signed in (see PR notes).

## Built in round 3 (from all open notes), with the decisions taken

- Routes: a drop on a region without a direct road sends soldiers through your own spots, one hop at a time. Soldiers pass through without joining the garrison.
- Reinforce: a drop on one of your own spots moves the dragged soldiers there, by road or through your spots.
- City upgrades: tap your city to upgrade. Level 2 costs 15 soldiers (growth 2.0/s, cap 30); level 3 costs 30 (growth 2.6/s, cap 45). Cities stop growing at their cap. Stars show the level. Taking a city resets it to level 1. The tier ladder and unlocks are set in round 4 below.
- Countdown: 3, 2, 1, Go before soldiers move.
- Population line: territories:soldiers per player (per team in team mode), with the send % button above it.
- Team mode: Level 4 with Teams on. Players 0 and 1 are one team, 2 and 3 the other. A red divider separates them. The win is for the last team standing. Computers never attack their teammates and gang up on a player with more than half the soldiers.
- Avatars: 🐥 🦆 🐻 🐿️ 🐭 🦡 for the players, shown on the population line. Map icons are unchanged.
- "Mark done" in the game adds the `Done- ` prefix, as the skill does.

## Needs a decision first (see convo v0.2 and v0.3)

- [x] **Cities: tiers.** Built: village 20, town 40, city 60, metropolis 80 (round 4 below). Still open: what each tier unlocks beyond growth and the cap.
- [x] **Team mode by level.** Built: Levels 4, 6 and 8 have fair teams, up to 3 here (round 4 below). Each team shares one colour.
- [ ] **Baby-animal avatars** instead of the fungi for each team. Decide: which animals, and whether the avatars replace the map icons or appear only on the team card.
- [x] **Dragon drop through unlinked spots.** Decided yes: a drop routes along roads through your own spots. Built, and Jimmy confirmed it works well (2026-11-03).
- [ ] **AI strategy in team games.** Decide after team mode exists.

## Round 4: notes read 2026-11-03 (18 open notes on 13 map records)

Checked against `js/game.js` and `js/store.js`. Notes stay `open` in the table until Jimmy confirms which are handled (convo v0.3).

Built in round 3 and confirmed in code: drop anywhere on a region, multi-drag, routes through own spots, reinforce, the 3-2-1-Go countdown, the population line with send %, team mode with a red divider, hard level and move caps, the Done- prefix.

Built from convo v0.3 answers. The defaults I picked are listed in convo v0.3 for Jimmy to check.

- [x] **Five more maps.** Levels 5 to 9: 12, 14, 16, 18 and 20 spots, with 3 to 5 cities and 1 to 3 fortresses. Each field is 1.5 screens wide and pans (drag on empty ground, or the mouse wheel). Level list in `js/map.js`.
- [x] **Fortresses.** New spot type (🏯). Neutral garrison 18 to 22, grows 0.5 a second once owned, stops at 40. Players reinforce them like any spot.
- [x] **City tiers.** Village 20, town 40, city 60, metropolis 80 garrison caps. Upgrade costs 50% of the next tier's cap: 20, 30 and 40 soldiers. Rates 1.5, 2.0, 2.6 and 3.2 a second (3.2 is my pick). Capture resets a city to village.
- [x] **Teams by level.** Level 4 and Level 6: 4 players in 2 teams of 2. Level 8: 6 players in 3 teams of 2. Each team shares one colour; no badges. The Teams setting is gone.
- [ ] **Zoom.** Inward zoom at level 10. Not built: Jimmy said he is still planning it.
- [ ] **Test note** (`Test note 1`, Level 4 Valley). Nothing to build. Mark done when Jimmy confirms.

## Later

- [ ] **Village and country zoom.** Inward zoom at level 10 (see round 4). Outward country view is still unplanned.
- [ ] **Balance pass.** Hard mode beat a player who did nothing in about 20 seconds in testing. Play a few full games and tune the rates, garrisons and move caps.
- [ ] **Speed and defense boosts, towers, spells, Quick Game** (already listed on the Shop page as coming soon).
