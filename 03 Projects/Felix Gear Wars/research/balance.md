# Felix Gear Wars: balance report (version 0.5.0)

Made by `node tools/balance_sim.js all 8`: the same rules the game uses, played by a simple bot (it buys the first gear it can afford, merges into the better-connected gear, never moves a gear, never uses the boss gear). Re-run it after any change to `js/data.js` or `js/sim.js`. A real player, who moves gears, uses multipliers and counters, does better than this bot.

## What changed in 0.5.0

- **Every gear is balanced by power.** Power = sqrt(effective health × damage per second), times a range, splash and siege modifier. The spearman is the reference (12 quarter turns of the heart for a fighter, 9.6 s on one heart side at normal speed). Power per minute is within about 10% for all eight gears. The catapult takes three times as long as the spearman, the tank two and a half times, the knight 1.7, the mage 1.5, the fighter 1.4, the assassin 1.3, the archer the same. Compared with 0.3.0 the spearman gear is four times slower, and the others four to ten times.
- **Multipliers.** A ×2 gear first in a chain still doubles what is behind it (23 fighters a minute became 50), but a chain makes far fewer fighters to begin with, and the 50-soldier cap holds. See the stress test below.
- **Waves, fortresses and maps retuned** (`F.TUNE`): wave strength × 0.65 on a one-screen map and × 0.85 on one and a half, enemy health +9% and attack +5.5% per level, fortress `700 + 80·idx`.

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
  no multiplier: 23 fighters;  with a x2 gear first in the chain: 50 fighters
  6 spearman gears around the heart for two minutes: 50 fighters (the cap is 50)

Difficulty test, 8 runs each. The bot buys, merges, never moves a gear and never uses the boss gear.
level                                   win%  leaks/lives  fortress at (s)  peak army  army each minute
level 1 (chapter 1)                      100%       0.0/25              45          8  0
level 8 (the eighth level, chapter 3)    100%       2.6/35              94         50  0 3
chapter 8, first level                   100%      13.4/60             186         50  0 17 22 50
chapter 8, boss level                    100%       0.0/60             174         50  0 21

Unit against unit, 6 against 6 at level 1. Number = share of the ROW team left alive (health fraction). Above 0.5 the row wins.
          spearma archer  fighter assassi knight  tank    mage    catapul 
spearman  -0.25   -0.71   -0.65   -0.83   -0.81   -0.95   -1.00   -0.89   
archer    -0.39   -0.52   -0.78   -0.60   -0.82   -0.91   -0.67   -0.85   
fighter   +0.41   +0.76   -0.55   -0.30   -0.70   -0.78   -0.55   +0.49   
assassin  +0.05   +0.48   -0.76   -0.60   -0.67   -0.93   -0.83   +0.33   
knight    -0.23   +0.05   +0.46   +0.59   -0.34   -0.80   -1.00   -0.19   
tank      +0.78   +0.23   +0.65   +0.80   +0.70   -0.26   -1.00   -0.48   
mage      +0.98   +0.83   +0.83   +0.98   +0.83   +0.96   +0.65   +0.48   
catapult  +0.99   +0.91   +0.17   +0.83   -0.47   +0.46   +0.62   +0.50   

One merged level-2 unit against two level-1 units of the same kind (survivor health fraction, row side first):
  spearman 0.18 vs 0.00
  archer   0.00 vs 0.26
  fighter  0.33 vs 0.00
  assassin 0.00 vs 0.09
  knight   0.33 vs 0.00
  tank     0.35 vs 0.00
  mage     0.45 vs 0.00
  catapult 0.40 vs 0.00

Bot campaign test: 8 runs per level. A simple bot buys and merges, never repositions.
level  win%  avgLeaks/lives  avg stars  avg secs
c1l1   100%     0.0/25        3.00        58
c1l2   100%     1.1/25        2.88        61
c1l3   100%     3.3/25        2.50        96
c2l1   100%     1.0/30        2.88        83
c2l2   100%     1.5/30        2.88       139
c2l3    88%     5.1/30        2.71       150
c3l1   100%     3.9/35        2.63        94
c3l2   100%     5.8/35        2.38        89
c3l3   100%     0.0/35        3.00        61
c4l1   100%     0.0/40        3.00        75
c4l2   100%     0.0/40        3.00        96
c4l3   100%     0.0/40        3.00        97
c5l1   100%     0.0/45        3.00        99
c5l2    88%    11.8/45        2.43       116
c5l3    50%    27.0/45        2.50       112
c6l1    38%    36.9/50        2.33       165
c6l2   100%     0.0/50        3.00       138
c6l3    75%    12.6/50        3.00       153
c7l1   100%     5.9/55        2.50       161
c7l2   100%     0.0/55        3.00        88
c7l3    75%    13.8/55        3.00       110
c8l1    88%    22.5/60        2.14       155
c8l2   100%     3.9/60        2.75       192
c8l3   100%     0.0/60        3.00       134
```

## Reading the test runs

- **Level 1** (chapter 1, level 1): the bot wins every time and loses no lives; the fortress falls at about 45 seconds with an army of 8. This is the "start easy" setting.
- **Level 8** (the eighth level, chapter 3 level 2): the bot wins every time and loses about 3 of 35 lives; the army peaks at the cap of 50.
- **Chapter 8, first level**: the bot wins 7 times in 8 and loses about 22 of 60 lives; the army reaches the cap of 50 around minute 4. This is where the lives are meant to be spent. Chapter 8 level 3 (the boss) is easy for the bot (no lives lost) because that map's board suits it; the boss level is not harder than the first level yet.
- **Spikes for the weak bot:** c5l3 (50%), c6l1 (38%), c6l3 (75%), c7l3 (75%). These are board layouts with holes next to the heart. A player who moves gears does better. Watch them when Felix plays.
- **Unit against unit** compares equal numbers, not equal build time, so mages and catapults look strong; a catapult gear takes three times as long as a spearman gear, so an equal-time army has three spearmen for each catapult.
- A run that does not bring down the fortress within 10 minutes counts as not won.

## Knobs

`js/data.js`: `F.TUNE` (`base 30`, `perLevel 26`, `perWave 0.5`, `hp 0.09`, `atk 0.055`, `fort 700`, `fortPer 80`, `short 0.65`, `mid 0.85`), `HEART_PERIOD` (3.2 s per turn, ⚙️ ×0.5 to ×4), `BOSS_REVS` (100, ⚙️ 10 to 200), `MAX_UNITS` (50 per side), unit `tick0` and stats, `SM` (merge strength), `LEVEL_SPEED` (0.92 per level), `SPECIALTY_BONUS` (1.25), lives `20 + 5·chapter`.
`js/sim.js` (`buildStructures`): castle and fortress weapons, tower health `220 + 40·idx`, `TOWER_REBUILD` 45 s.
Sweep a setting without editing the file: `node tools/balance_sim.js sweep 6 '{"perLevel":30,"fort":900}'`.
