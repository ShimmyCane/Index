# Generate Clouds — convo v0.12 (2026-11-18)

Version 0.7.1: the worldwide wind grid for the space clouds, which Jimmy asked for in `convo v0.11.md` (answer 2). PR #202 (0.7.0) was merged first, as he asked; this round is a new branch from `main`.

## What was built

- **Wind grid:** 9 × 7 points over the whole Earth (longitude every 45°, latitude every 30°), at 850, 500 and 300 hPa, for each hour of the 24-hour sky. One forecast call per place (63 points), from `W.windSeries` in `js/weather.js`.
- **Different winds at each height:** the low, mid and high cloud layers each use their own level's wind (850, 500, 300 hPa), so the upper clouds can move differently from the lower ones.
- **How the clouds move:** each cloud point moves with the wind at its own place, minus the wind at the place you are looking at. The place keeps the same drift as before, and the difference grows with distance. The change is switched on from 10 km up and is full from 30 km, so the ground view is unchanged.
- **Time:** the hour's wind is blended into the next hour, like the regional cover. The drift is the current wind times the time elapsed, so a wind that changes during the day is an approximation, not a full history.

## Checks

- The 22 interaction checks pass with no page errors.
- The wind grid loads and turns on from space (checked in the headless browser with made-up replies).
- One shader bug found and fixed on the way: a texture was chosen with a ternary, which the compiler rejects, and a variable was used before it was declared. Both fixed.

## Not yet checked

- Real wind values from the forecast service (the sandbox uses made-up replies).
- How the drift looks on a device; the difference between heights is correct in principle but not yet seen with real data.
- The grid is coarse (45° × 30°): the variation between points is smooth, not the finer weather systems.
