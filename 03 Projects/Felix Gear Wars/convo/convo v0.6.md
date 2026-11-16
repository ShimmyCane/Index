# Felix Gear Wars — convo v0.6

**Date:** 2026-11-16
**Asked by:** Claude · **Answers:** Jimmy, inline after each `A:`

Round 6 is built (version 0.6.0). Your answers to `convo v0.4.md` are built too (champions, castle strength, tower rebuild, no early towers). How I read your list:

1. **Prices and the end of the level.** A level starts with a fixed purse. Every gear on the board makes the next gear dearer, so the number of gears you can afford grows with the size of the Horde's last wave (about 0.8 gears per opponent: 4 gears in level 1, 22 in the last level). Merging or selling brings the price down.
2. **Waves that anticipate.** Each wave is sized when it launches from how strong Felix is at that moment plus what his gears will make before the wave arrives. Ten gears on the pegboard means a bigger, tougher wave; three gears, a small one. The ratio between the wave and Felix follows the fun curve (below). There is no fixed wave list any more.
3. **The fun curve (the Candy Crush idea).** A level is a hill: gentle waves at the start, the most exciting wave at the **fun peak, 3 minutes**, easing off, and at the **fade time, 7 minutes**, waves stop and the Horde loses heart (its fortress loses 2% of its health every second), so a level is over by about 7 minutes. ⚙️ **Fun curve** has sliders for the peak (1 to 6 minutes), the fade (4 to 12 minutes) and Challenge (softer to harder), with a plot and a plain-words explanation; a small curve at the bottom left of the game shows where Felix is. Boss levels put the boss at the peak.
4. **Champions.** The boss gear now makes a random champion: **Dragon** (flies, breathes fire), **King** (rallies fighters, +30% attack, heals them), **Felix the Cart** (rolls through the enemy and knocks it back), **Griffin** (flies, dives on the back line), **Golem** (stomps and slows), **Unicorn** (heals everyone near it). Details in `research/champions.md`.
5. **Castles.** They shoot as hard as 5 fighters on level 1 and 10 on the last level. Their range shrinks on short maps.
6. **Towers** only from chapter 4, and a fallen tower is rebuilt only when its owner has pushed the enemy back more than 320 px beyond it (then 45 seconds).

## Questions

1. Is the level the right length (about 3 to 5 minutes for a bot, 7 minutes at most)? Move the peak and fade in ⚙️ to try; what feels best for Felix?
   A:
2. Should the level also *end* by itself at the fade time (win), instead of the fortress crumbling over about a minute?
   A:
3. More champions? Ideas: Phoenix (comes back once), Yeti, Wizard King, a Robot, a Whale cart. Which powers sound best?
   A:
4. Should the price rise be visible (a small "+3" on the gear price), or hidden?
   A:
