# Convo v0.18 — curved vapour, animations for mood

Date: 2026-11-21. Follows `convo v0.17.md`.

Jimmy: "Vapor trail should curve as well. Animations should help set mood. I'll let you prioritize. Merge"

## Built

- **The vapour trail curves.** The trail stays fixed to the wing tips and bends out of the turn, the way the air the plane left behind swings round when it turns. The older a part of the trail, the further it swings.
- **Mood, chosen in this order:**
  1. **Burning wrecks.** Anything destroyed on the ground leaves a charred wreck with flickering embers. It burns for about 20 seconds, then smokes, then goes out after about 50. The battle shows on the land behind you.
  2. **One wind for the world.** Wreck smoke, chimney smoke and the flags all lean the same way, so the world feels like one place.
  3. **Flags at every base,** rippling in the wind.
- Kept from before: turrets that track you, spinning radar, chimneys, windmills, birds, swaying trees, rocking ships.

## Checks

- 58 flight and rule checks pass (`npm test`).
- Browser: no page errors; screenshots of a hard turn (curved trails) and of a base flag with two burning wrecks. Normal flight about 17 ms a frame in the headless test browser.

## Ideas for later mood

- Weather: drifting rain, or a golden evening light.
- Sea spray and gulls along the coast.
- Searchlights and lit windows at night.
