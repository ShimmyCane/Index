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
