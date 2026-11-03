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

- [ ] **Cities: tiers and unlocks.** Tiers are set (round 4 below). Still open: what each tier unlocks beyond growth and the cap.
- [ ] **Team mode.** Teams are set up by level, fair, up to 5 teams (round 4 below). Still open: team colours and team badges.
- [ ] **Baby-animal avatars** instead of the fungi for each team. Decide: which animals, and whether the avatars replace the map icons or appear only on the team card.
- [x] **Dragon drop through unlinked spots.** Decided yes: a drop routes along roads through your own spots. Built, and Jimmy confirmed it works well (2026-11-03).
- [ ] **AI strategy in team games.** Decide after team mode exists.

## Round 4: notes read 2026-11-03 (18 open notes on 13 map records)

Checked against `js/game.js` and `js/store.js`. Notes stay `open` in the table until Jimmy confirms which are handled (convo v0.3).

Built in round 3 and confirmed in code: drop anywhere on a region, multi-drag, routes through own spots, reinforce, the 3-2-1-Go countdown, the population line with send %, team mode with a red divider, hard level and move caps, the Done- prefix.

Decisions from convo v0.3 (not built yet):

- [ ] **Five more maps.** Levels 5 to 9, with more spots and cities each step; scrollable on the field. Still open: spot counts (example 12, 14, 16, 18, 20), and whether the field pans or shrinks. The level list in `js/map.js` stops at level 4.
- [ ] **Fortresses.** A new spot type, the "castle" in the reinforce note. Players can reinforce it. Still open: what it does beyond that.
- [ ] **City tiers.** Village 20, town 40, city 60, metropolis 80 garrison caps. Each upgrade costs 50% of the next tier's cap (my reading: 20, 30, 40 soldiers). Please confirm the cost reading.
- [ ] **Teams by level.** Some levels give teams. Teams are fair, up to 5 teams. Still open: colours and badges, and how the teams are made (assumed balanced and automatic).
- [ ] **Zoom.** Inward zoom at level 10. Still planning.
- [ ] **Test note** (`Test note 1`, Level 4 Valley). Nothing to build. Mark done when Jimmy confirms.

## Later

- [ ] **Village and country zoom.** Inward zoom at level 10 (see round 4). Outward country view is still unplanned.
- [ ] **Balance pass.** Hard mode beat a player who did nothing in about 20 seconds in testing. Play a few full games and tune the rates, garrisons and move caps.
- [ ] **Speed and defense boosts, towers, spells, Quick Game** (already listed on the Shop page as coming soon).
