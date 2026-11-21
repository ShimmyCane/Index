# Convo v0.17 — wing tip vapour and a world that moves

Date: 2026-11-21. Follows `convo v0.16.md`.

Jimmy: "It looks like when I'm turning the air wing tips aren't actually coming out of those wing tips can you double check please I like the graphics too. Maybe make some more animations as part of this."

## Fixed

- **Wing tip vapour now starts at the wing tips.** It used to be placed in the world and drift away from the drawn plane. Now each puff is placed on the screen, at the exact wing tip of the drawn model, and blows back from nose to tail. A thin bright line is fixed to each tip so the trail is clearly attached. The paper glider uses its own wing tips.
- **Engine heat:** a soft shimmer behind each engine, stronger on BOOST.

## New animations

- Tank turrets turn to follow the plane when it is near; flak guns and SAM launchers swing round to face it.
- The SAM radar dish spins.
- Smoke curls up from house and farm chimneys.
- Windmills on the farms, with turning sails.
- Flocks of birds fly across the sky in a V, flapping.
- Enemy and allied fighters bank into their turns.
- Trees sway in the breeze; ships bob and rock on the water.

## Speed

The animations and the extra trees made a dense forest slow (about 30 ms a frame). Big trees are now drawn once into a small picture and reused (a tree looks the same from any heading), so the forest is about twice as fast, and normal flight is the same speed as before (about 17–20 ms a frame in the headless test browser).

## Checks

- 58 flight and rule checks pass (`npm test`).
- Browser: no page errors; screenshots of a hard turn show the vapour leaving both wing tips; trees stand on their shadows when the view rolls.

## Questions

1. Should the vapour be stronger (thicker, longer), or is a light trail right?
2. More animation ideas for later: flags on the bases, trains moving on the railway, cars on the road, waves breaking on the coast. Any you want first?
