# Felix Gear Wars: balance report (version 0.6.0)

Made by `node tools/balance_sim.js all 5`: the same rules the game uses, played by a simple bot (it buys the first gear it can afford, merges into the better-connected gear, never moves a gear, never uses the boss gear). Re-run it after any change to `js/data.js` or `js/sim.js`. A real player, who moves gears, uses multipliers and counters, does better than this bot.

## What changed in 0.6.0

- **A fun curve shapes every level.** Waves are no longer a fixed list: each wave is sized when it launches, from Felix's strength (the fighters alive plus what his gears will make before the wave arrives) times a target ratio that follows a hill: gentle at the start (0.4), most exciting at the **fun peak** (3 minutes, 1.1), easing off to nothing at the **fade time** (7 minutes). After the fade the Horde loses heart (the fortress loses 2% of its health a second), so a level ends at about 7 minutes. Both times and a Challenge multiplier are in ⚙️ (Fun curve). Pressure also rises with the level (`rIdx`).
- **Prices.** A level starts with a fixed purse, and every gear on the board makes the next one dearer (`creep`), so the number of gears you can afford by the end follows the size of the expected last wave (about 0.8 gears per opponent in the last wave: 4 gears on level 1, 22 on the last level). Merging and selling bring the price down.
- **Castles** shoot as hard as 5 fighters on the first level and 10 on the last (arrows and stones); towers (chapter 4 on) as hard as a quarter and a third of that. A fallen tower is rebuilt only after its owner has pushed the enemy back more than 320 px beyond it, and then takes 45 s.
- **Champions.** The boss gear makes a random champion: Dragon, King, Felix the Cart, Griffin, Golem or Unicorn, each with its own power.

## Test runs

```
Power per minute of one level-1 gear on one heart side (heart at 3.2 s a turn). Power = sqrt(effective health x damage per second), times a range, splash and siege modifier.
type       ticks  secs/fighter  power  power/min  slower than spearman
spearman     12           9.6    28.1        175          1.00x
archer       12           9.6    28.4        177          1.00x
fighter      17          13.6    38.6        170          1.42x
assassin     16          12.8    38.1        178          1.33x
knight       20          16.0    46.2        173          1.67x
tank         30          24.0    64.0        160          2.50x
mage         18          14.4    43.7        182          1.50x
catapult     36          28.8    90.1        188          3.00x

Multiplier stress test (one heart side, a chain of up to 4 spearman gears, one minute at normal speed):
  no multiplier: 24 fighters;  with a x2 gear first in the chain: 50 fighters
  6 spearman gears around the heart for two minutes: 50 fighters (the cap is 50)

Difficulty test, 5 runs each. The bot buys, merges, never moves a gear and never uses the boss gear.
level                                   win%  leaks/lives  fortress at (s)  peak army  army each minute
level 1 (chapter 1)                      100%       0.0/25             176         50  0 1
level 8 (the eighth level, chapter 3)    100%       4.2/35             225         50  0 2 2 3 4
chapter 8, first level                   100%      15.4/60             273         50  0 11 2 5 1 7 12
chapter 8, boss level                    100%       0.0/60             187         50  0 26 32 48 50 50

Unit against unit, 6 against 6 at level 1. Number = share of the ROW team left alive (health fraction). Above 0.5 the row wins.
          spearma archer  fighter assassi knight  tank    mage    catapul 
spearman  +0.10   -0.88   -0.51   -0.76   -0.31   -0.84   -1.00   -1.00   
archer    +0.88   -0.00   -0.61   -0.45   -0.78   -0.83   -0.57   -0.99   
fighter   +0.49   +0.61   -0.16   -0.25   -0.58   -0.72   -0.61   +0.03   
assassin  +0.79   +0.47   +0.25   +0.08   -0.78   -0.84   -0.83   -0.84   
knight    +0.47   +0.78   +0.38   +0.81   -0.26   -0.74   -0.52   +0.06   
tank      +0.84   +0.83   +0.72   +0.84   +0.74   -0.00   -1.00   +0.04   
mage      +1.00   +0.57   +0.61   +0.83   +0.52   +1.00   -0.00   -1.00   
catapult  +1.00   +0.99   -0.02   +0.84   -0.07   +0.33   +1.00   -0.00   

One merged level-2 unit against two level-1 units of the same kind (survivor health fraction, row side first):
  spearman 0.45 vs 0.00
  archer   0.11 vs 0.00
  fighter  0.38 vs 0.00
  assassin 0.17 vs 0.00
  knight   0.41 vs 0.00
  tank     0.44 vs 0.00
  mage     0.78 vs 0.00
  catapult 0.64 vs 0.00

Bot campaign test: 5 runs per level. A simple bot buys and merges, never repositions.
level  win%  avgLeaks/lives  avg stars  avg secs
c1l1   100%     0.0/25        3.00       349
c1l2   100%     1.0/25        2.80       364
c1l3   100%     3.2/25        2.40       392
c2l1   100%     0.0/30        3.00       247
c2l2   100%     0.0/30        3.00       265
c2l3   100%     2.0/30        2.60       273
c3l1   100%     5.8/35        2.40       208
c3l2   100%     3.4/35        2.80       266
c3l3   100%     3.4/35        2.60       207
c4l1   100%     1.6/40        2.80       218
c4l2   100%     0.0/40        3.00       170
c4l3   100%     0.0/40        3.00       258
c5l1   100%     0.0/45        3.00       158
c5l2   100%     0.0/45        3.00       245
c5l3   100%     0.0/45        3.00       131
c6l1    80%    16.8/50        2.25       319
c6l2   100%     0.0/50        3.00       326
c6l3    80%    16.0/50        2.50       276
c7l1   100%     6.0/55        2.40       256
c7l2   100%     0.0/55        3.00       274
c7l3   100%     0.0/55        3.00       257
c8l1    80%    26.2/60        2.00       459
c8l2   100%     3.2/60        2.80       306
c8l3   100%     0.0/60        3.00       185
```

## Reading the test runs

- **Level 1** (chapter 1 level 1): the bot wins every time and loses no lives; the level lasts about 3 minutes. **Level 8** (the eighth level, chapter 3 level 2): wins, loses a few of its 35 lives, about 4 minutes. **Chapter 8, first level**: wins 4 or 5 times in 5 and loses a quarter of its 60 lives, about 4.5 minutes. The chapter 8 boss level is easier for the bot (its board suits it).
- **Spikes for the weak bot:** c6l1 and c6l3 (80% wins, 16 leaks), c8l1 (80%). Boards with holes beside the heart. Watch them when Felix plays.
- The army shown for each minute is small on short maps because the castle and fortress guns kill fighters that arrive one at a time; a bigger group breaks through. The army reaches the cap of 50 in the late levels.
- A run that does not bring down the fortress within 10 minutes counts as not won. With the fade, levels end by about 8 minutes.
- Unit against unit compares equal numbers, not equal build time (so mages and catapults look strong; they take 1.5 and 3 times as long to build as a spearman).

## Knobs

`js/data.js`: `F.TUNE` (`rLow 0.4`, `rPeak 1.1`, `rIdx 1.1`, `short 0.6`, `mid 0.85`, `gearsPerLast 0.8`, `fort 700`, `fortPer 80`, `hp 0.09`, `atk 0.055`), `F.FUN` (3 and 7 minutes), `F.economy` (expected last wave `5 + level`), `F.castleUnits` (5 to 10), `HEART_PERIOD`, `BOSS_REVS`, `MAX_UNITS`, unit `tick0` and stats, `F.CHAMPS`, `SM`, `SPECIALTY_BONUS`.
`js/sim.js`: `makeWave` (the wave model), `priceOf`, `buildStructures` (castle and tower guns), `TOWER_REBUILD` 45 s, the fade (2% of fortress health a second).
Sweep a setting without editing the file: `node tools/balance_sim.js sweep 6 '{"rPeak":1.2,"rIdx":1.0}'`.
