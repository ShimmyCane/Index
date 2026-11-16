# Felix Gear Wars: balance report (MVP 0.1.0)

Made by `node tools/balance_sim.js all 10` (the same rules the game uses, played by a simple bot). Re-run it after any change to `js/data.js` or `js/sim.js`.

```

Unit against unit, 6 against 6 at level 1. Number = share of the ROW team left alive (health fraction). Above 0.5 the row wins.
          spearma archer  fighter assassi knight  tank    mage    catapul 
spearman  +0.10   -0.88   -0.51   -0.76   -0.31   -0.84   -1.00   -1.00   
archer    +0.88   -0.00   -0.61   -0.45   -0.78   -0.83   -0.57   -0.99   
fighter   +0.49   +0.61   -0.16   -0.25   -0.58   -0.72   -0.61   +0.02   
assassin  +0.79   +0.47   +0.25   +0.08   -0.78   -0.84   -0.83   -0.84   
knight    +0.47   +0.78   +0.38   +0.81   -0.26   -0.74   -0.52   +0.05   
tank      +0.84   +0.83   +0.72   +0.84   +0.74   -0.00   -1.00   +0.04   
mage      +1.00   +0.57   +0.61   +0.83   +0.52   +1.00   -0.00   -1.00   
catapult  +1.00   +0.99   -0.03   +0.84   -0.06   +0.33   +1.00   -0.00   

One merged level-2 unit against two level-1 units of the same kind (survivor health fraction, row side first):
  spearman 0.45 vs 0.00
  archer   0.11 vs 0.00
  fighter  0.38 vs 0.00
  assassin 0.17 vs 0.00
  knight   0.41 vs 0.00
  tank     0.44 vs 0.00
  mage     0.78 vs 0.00
  catapult 0.64 vs 0.00

Bot campaign test: 10 runs per level. A simple bot buys and merges, never repositions.
level  win%  avgLeaks/lives  avg stars  avg secs
c1l1   100%     0.0/20        3.00        81
c1l2   100%     2.6/21        2.60        78
c1l3   100%     0.0/22        3.00        71
c2l1   100%     1.7/23        2.80        95
c2l2   100%     2.1/24        2.80       106
c2l3   100%     2.1/25        2.80       105
c3l1   100%     1.2/26        2.80       107
c3l2    70%     8.1/27        3.00       121
c3l3   100%     0.0/28        3.00        93
c4l1   100%     0.0/29        3.00        61
c4l2   100%     0.0/30        3.00        80
c4l3   100%     0.0/31        3.00        78
c5l1   100%     0.3/32        3.00        94
c5l2    80%     8.1/33        2.75        95
c5l3    80%     9.0/34        2.75       110
c6l1    50%    18.0/35        2.80       143
c6l2   100%     0.0/36        3.00        93
c6l3    70%    11.7/37        3.00       123
c7l1    80%     7.6/38        3.00       125
c7l2   100%     0.0/39        3.00       110
c7l3   100%     0.0/40        3.00       107
c8l1    80%     8.2/41        3.00       152
c8l2   100%     0.0/42        3.00       125
c8l3    90%     7.7/43        2.78       136
```

## How to read it

- **Unit against unit.** Six against six at level 1, spaced out. A number above 0 means the row team won. The counters show: archers beat spearmen, knights beat archers, assassins beat archers and mages, mages and catapults beat groups, tanks beat nearly everything but mages. Spearmen are the cheapest answer to knights (cost 30 against 65).
- **Merged against side by side.** One level-2 gear unit against two level-1 units: the merged one wins every time except archers, where both sides die. That is the intended reward for merging, balanced against the strategic value of keeping gears side by side to extend a chain.
- **Bot campaign.** The bot never moves a gear and buys the first affordable thing, so it is a weak player. If it wins most levels, a child who uses counters and merges should win comfortably. Levels where it loses sometimes (about c3l2, c5l2, c8l3) are the ones to watch in a real test.

## Knobs

`js/data.js`: unit stats and `vs` counters, `SM` (merge strength), `tick0` (ticks per fighter), wave budget (`levelConfig`: `base`, `perLevel`, `perWave`), `enemyScale`, lives, coins, `HEART_PERIOD`.
