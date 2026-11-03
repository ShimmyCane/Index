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
- City upgrades: tap your city to upgrade. Level 2 costs 15 soldiers (growth 2.0/s, cap 30); level 3 costs 30 (growth 2.6/s, cap 45). Cities stop growing at their cap. Stars show the level. Taking a city resets it to level 1. The "new functionality" a level unlocks is not decided yet.
- Countdown: 3, 2, 1, Go before soldiers move.
- Population line: territories:soldiers per player (per team in team mode), with the send % button above it.
- Team mode: Level 4 with Teams on. Players 0 and 1 are one team, 2 and 3 the other. A red divider separates them. The win is for the last team standing. Computers never attack their teammates and gang up on a player with more than half the soldiers.
- Avatars: 🐥 🦆 🐻 🐿️ 🐭 🦡 for the players, shown on the population line. Map icons are unchanged.
- "Mark done" in the game adds the `Done- ` prefix, as the skill does.

Still open after round 3: city upgrade functionality, team setup choices (convo v0.2 questions 1, 2 and 4), and zoom (todo).

## Needs a decision first (see convo v0.2)

- [ ] **Cities: size cap and upgrades.** Notes ask for a cap on how big cities get, and upgrades that raise growth rate. Decide: what the cap limits (soldiers stored, or the number of upgrades), what an upgrade costs, and what it unlocks.
- [ ] **Team mode.** Teams, team colours, a taller red line between teams, and team AI that gangs up on the leader. Decide: how teams are set up, and whether team members share a colour.
- [ ] **Baby-animal avatars** instead of the fungi for each team. Decide: which animals, and whether the avatars replace the map icons or appear only on the team card.
- [ ] **Dragon drop through unlinked spots.** Notes say a drop should work without landing on the city. Decide: when a region is not directly linked, should soldiers route along roads through your own spots? (Current behaviour: only directly linked regions take the drop.)
- [ ] **AI strategy in team games.** Decide after team mode exists.

## Later

- [ ] **Village and country zoom.** As maps get larger, zoom into a village view and out to a country view. (Added to the todo list at your request.)
- [ ] **Balance pass.** Hard mode beat a player who did nothing in about 20 seconds in testing. Play a few full games and tune the rates, garrisons and move caps.
- [ ] **Speed and defense boosts, towers, spells, Quick Game** (already listed on the Shop page as coming soon).
