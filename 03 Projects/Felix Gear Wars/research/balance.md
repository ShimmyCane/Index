# Felix Gear Wars: balance report (version 0.4.0)

Made by `node tools/balance_sim.js all 8` (the same rules the game uses, played by a simple bot that never uses the boss gear). Re-run it after any change to `js/data.js` or `js/sim.js`.

```

Unit against unit, 6 against 6 at level 1. Number = share of the ROW team left alive (health fraction). Above 0.5 the row wins.
          spearma archer  fighter assassi knight  tank    mage    catapul 
spearman  -0.25   -0.71   -0.65   -0.83   -0.81   -0.95   -1.00   -0.89   
archer    -0.39   -0.52   -0.78   -0.60   -0.82   -0.91   -0.67   -0.85   
fighter   +0.41   +0.76   -0.55   -0.30   -0.70   -0.78   -0.55   +0.49   
assassin  +0.05   +0.48   -0.76   -0.60   -0.67   -0.93   -0.83   +0.33   
knight    -0.23   +0.13   +0.46   +0.59   -0.34   -0.80   -1.00   -0.33   
tank      +0.78   +0.18   +0.65   +0.80   +0.70   -0.26   -1.00   -0.58   
mage      +0.98   +0.83   +0.83   +0.98   +0.83   +0.96   +0.65   +0.48   
catapult  +0.99   +0.91   +0.40   +0.83   -0.47   +0.49   +0.62   +0.50   

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
c1l1   100%     0.0/25        3.00        38
c1l2    88%     4.5/25        2.71        92
c1l3    88%     3.1/25        3.00        46
c2l1    88%     3.8/30        3.00        56
c2l2    88%     3.8/30        3.00        62
c2l3    75%    11.1/30        2.67        74
c3l1   100%     0.0/35        3.00        46
c3l2    75%     9.4/35        2.83        94
c3l3   100%     0.0/35        3.00        48
c4l1   100%     0.0/40        3.00        89
c4l2   100%     0.0/40        3.00       130
c4l3   100%     0.0/40        3.00       112
c5l1   100%     0.0/45        3.00        64
c5l2   100%     0.0/45        3.00       105
c5l3   100%     0.0/45        3.00       103
c6l1   100%     0.0/50        3.00       148
c6l2   100%     0.0/50        3.00       108
c6l3   100%     0.0/50        3.00       134
c7l1   100%     6.4/55        2.75       108
c7l2   100%     0.0/55        3.00        88
c7l3   100%     0.0/55        3.00       102
c8l1   100%     0.0/60        3.00        96
c8l2   100%     0.0/60        3.00       157
c8l3   100%     0.0/60        3.00        92
```

## How to read it

- **Unit against unit** and **merged against side by side**: as in earlier reports (counters read as intended; a merged gear's fighter beats two level-1 fighters).
- **Bot campaign.** The bot buys the first affordable gear and merges, and never moves a gear, so it is a weak player. Since 0.4.0 the castles and towers shoot for both sides, the heart turns at half the old pace, and the world is shorter in chapters 1 to 3, so the numbers changed: early levels are easy on purpose (Jimmy's call), the middle sometimes costs the bot lives, and the last chapters are still easy for it. Raise `perLevel` or `enemyScale` in `js/data.js` to push the late game; 60 lives were meant to be mostly spent, and today they are not.
- A run that does not bring down the fortress within 7 minutes counts as not won.

## Knobs (0.4.0)

`js/data.js`: `HEART_PERIOD` (3.2 s per turn, ⚙️ scales ×0.5 to ×4), `BOSS_REVS` (100, ⚙️ 10 to 200), `MAX_UNITS` (50 per side), unit stats and counters, `SM` (merge strength), `tick0`, wave budget (`levelConfig`: `base 48`, `perLevel 60`, `perWave 0.5`), `enemyScale` (health +11% and attack +6.5% per level), `baseHp` (500 + 240·idx), lives `20 + 5·chapter`.
`js/sim.js` (`buildStructures`): castle and fortress weapons (arrow: range 440, every 1.6 s; stone: range 720, every 6 s), towers (arrow tower range 360; stone tower range 520), tower health `220 + 40·idx`, `TOWER_REBUILD` 45 s.
