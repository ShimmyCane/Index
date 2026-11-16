# Felix Gear Wars — convo v0.1

**Date:** 2026-11-16
**Asked by:** Claude · **Answers:** Jimmy, inline after each `A:`

Your idea is recorded in `schematic.md`. I looked at other gear games: in most, gear placement decides how fast units spawn, meshing gears speeds production, and you merge equal gears to level them up. Ours stays original (our own names, fighters and art). Proposals are marked **Proposal**; answer "yes" or change them.

## 1. Screen and play

1. iPad in landscape, pegboard on top, battlefield along the bottom, enemies from the right, base on the left?
   A: Yes.
2. Does the game stop between waves so Felix can place and merge gears calmly (build, then fight), or can he move gears while a wave is running? **Proposal:** both: gears can move any time, and a ⏸ button pauses.
   A: Yes to both. Real time; gears can be moved any time and cost coins. Felix starts each level with an allotment of coins, and every enemy killed pays more coins so he can build more gears during the battle.
3. You mentioned towers. Are there towers on the battlefield as well, or are the fighters from the gears the only defense?
   A: The gears are the only generated defense. Some gears make things that are not units: a lightning tower, rockets, a big rolling shuriken.
4. Do enemies fight back (they stop and fight Felix's fighters, and fighters can die), or do they only walk to the base?
   A: Yes, enemies fight back. Track attack, defense and hit points per unit during the battle. Ranged units are very strong when stacked, but fighters and assassins counter them. It is a game about countering. Once the battle starts, gears do not sequence it strategically; it is a free-for-all.

## 2. The heart and the chains

5. **Proposal:** the heart has a mark that turns. Each time the mark passes a side (N, E, S, W) with a gear touching it, that gear and every gear chained to it get one tick. One heart turn takes about 2 seconds. Is that how you see it?
   A: That's about right.
6. Can Felix move the heart, or is it fixed in one spot each level? Could later levels have two hearts?
   A: The heart is fixed in one spot each level. Later levels can place it awkwardly, with gaps and pegs that force gears around them, and bonus gears far away that are inactive until a chain reaches them.
7. How big should the pegboard be? **Proposal:** 7 × 3 pegs in chapter 1, growing to 9 × 4.
   A: OK: 7 x 3 growing to 9 x 4.
8. Multiplier gear: **Proposal:** a gear that makes no fighter but doubles the ticks for every gear past it in the chain. Right?
   A: Yes. Multiplier gears start at 1x and merge up to 8x.
9. You wrote "gears that blocking to each other". Did you mean linking gears (they join two chains), or blocking gears (they stop a chain)?
   A: I mis-wrote. All gears should turn each other. On a perfect grid no gears should lock each other up.

## 3. Gears and merging

10. Gear value = heart ticks needed per fighter. **Proposal:** level 1 needs 4 ticks, level 2 needs 2 ticks and makes a stronger fighter, level 3 needs 1 tick and makes a champion. Merging past 1 tick only makes the fighter stronger.
    A: Fine. The first few gears take about three or four ticks to make a unit.
11. Two of the same gear side by side "work together". Is that a bonus without merging (for example, both turn a little faster), or only the step before merging?
    A: Side-by-side gears do not speed themselves up, but each makes its own unit when it turns fully, so two of the same unit. Merged gears turn out units about 20% faster than side by side. Side by side lets chains reach other things, so not merging can be a strategic choice.
12. Where do new gears come from? **Proposal:** coins from defeated enemies buy a random gear from a tray of three, between or during waves.
    A: Yes, buy from a tray of three.
13. Should a gear's fighter come out on its own lane spot (where the gear sits above the battlefield), or all from the base?
    A: One lane only, a horizontal screen for now. Fighters fall from the gear. Placing a gear nearer the base or nearer where the enemies start is the strategy.

## 4. Fighters and campaign

14. **Proposal** for the 8 chapters, one new fighter each: 1 Spearman, 2 Archer, 3 Fighter (sword and shield), 4 Assassin, 5 Knight (on horseback), 6 Tank (heavy armour), 7 Mage, 8 Catapult. Change the order or names freely.
    A: Start with these. Settings: an option for a free-for-all level with every unit, and harder opponents. Settings: a cheat button that adds 25 coins each tap, for testing.
15. Enemies: the same kinds as Felix's fighters but in a different colour, or their own creatures (goblins, beetles, robots…)? Does the third level of each chapter end with a boss?
    A: Enemies are the same kinds in a different colour, with different hats, scarves or shoes. A big boss after each chapter: a 3x scale version of one unit with much more attack, defense and hit points. Add a balance-test protocol or file that tests game balance without playing the game.
16. Should there be an enemy base at the far side to knock down, or do fighters just leave the screen?
    A: The battlefield scrolls sideways, about twice the screen width, with the enemy base on the second screen.
17. Losing and winning: 20 lives each level; 0 lives = try again. Stars (1–3) for lives kept?
    A: Yes, but lives grow over time as enemies get harder. Stars yes, and adaptive.

## 5. Look and sound

18. Graphics: pastel and cute (your usual), or richer storybook colour with shading for this one? Side view of the battlefield?
    A: Richer colour palette and side view.
19. Should the art borrow from a historical artist (for example Bruegel's crowds, or medieval manuscript illustrations), or our own style?
    A: Love it. Do research. Start with medieval manuscript illustration, and add a settings option to pick other art styles that restyle the whole campaign. Make it rich.
20. Sound by Web Audio: gear clicks, pops, arrow whistles, clangs, a short tune between waves. Any music?
    A: Yes. A full-fledged game, so make sound and music exciting.

## 6. Settings and saving

21. ⚙️ in the lower right with sound, game speed, Quick Game (shorter waves), chapter select, Undo, notes, database check and Show errors. Anything else?
    A: Yes, as always.
22. Save campaign progress on the iPad only, or in the family database so it follows Felix to another device?
    A: Progress on this device only. Settings can reset it.
23. Notes for improvement: on the iPad only, or also in the family database (`fgw_notes`)?
    A: Yes, also in the family database (fgw_notes).
24. Can Felix read the labels, or should everything be pictures and numbers?
    A: Make it adaptive. Level one is simple; from about level four and five the reading level goes up. Each level starts with a short story. Add a research folder with the plot line.

## 7. First build

25. **Proposal** for the first build: chapter 1 (three levels) playable end to end, with the heart, chains, merging, spearman vs. one enemy kind, full animation, ⚙️ and notes. Then one chapter per round. OK?
    A: No. For the first MVP do everything above.
