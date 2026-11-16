# Felix Gear Wars — convo v0.5

**Date:** 2026-11-16
**Asked by:** Claude · **Answers:** Jimmy, inline after each `A:`

Round 5 is built (version 0.5.0). Your list, and how I read it:

1. **Cultures.** ⚙️ now has **Culture**: French (the default, illuminated manuscript), Spanish, Aztec, Indian (Mughal miniature), Japanese, Chinese, Persian and Egyptian. A culture sets the look, the fighters' names, headgear and weapons, and **one specialty fighter marked with a ★ that gets +25% attack and health**: French Knight, Spanish Tank (Conquistador), Aztec Fighter (Jaguar warrior), Indian Catapult (Mughal cannon), Japanese Assassin (Ninja), Chinese Archer (Crossbowman), Persian Mage (Magus), Egyptian Spearman. Each fighter is the star of exactly one culture. The star shows on the gear in the tray and on the board, above the fighter, and in the info card. The old tapestry, Art Nouveau and stained-glass looks are kept as three **storybook looks** with no culture and no star.
2. **Gears slower, and balanced by power.** The spearman is the reference; the archer matches it. Everything else takes as long as its power says: fighter 1.4×, assassin 1.3×, mage 1.5×, knight 1.7×, tank 2.5×, catapult 3× (`node tools/balance_sim.js power` shows power per minute is within about 10% for all eight). Against 0.3.0 the spearman gear is four times slower, and the others are four to ten times slower. Merging still gives 2.2× the stats for 8% less time per level, about 20% better than two gears side by side. A ×2 multiplier first in a chain still doubles what is behind it, but there are far fewer fighters to double, and the 50-soldier cap holds.
3. **Difficulty tests.** I ran the weak bot on level 1, level 8 (the eighth level, in chapter 3), and chapter 8; results in `research/balance.md`. Because gears are slower, I made the waves smaller (and gentler on the short early maps: ×0.65 on one screen), and set the fortress to 700 health in level 1 so a small army cannot rush it, rising by 80 a level. Result: level 1 and level 8 are easy for the weak test bot, chapter 8 costs it about a third of its lives.

## Questions

1. Which fighter should be a culture's star? I picked Egyptian Spearman, Chinese Archer, Persian Mage, Indian Catapult, Japanese Assassin, French Knight, Spanish Tank, Aztec Fighter so every type is covered once. Swap any you like.
   A:
2. Should the bonus also give the starred fighter a visible bigger look (a little larger) or is the star enough?
   A:
3. A spearman gear now makes a fighter every 10 seconds at normal speed (about 3 heart turns). Too slow, or right for a first try? The heart speed slider and multiplier gears can speed it.
   A:
4. Should the culture change the enemy too (the Rust Horde with that culture's hats), or stay the same rust-red army?
   A:
