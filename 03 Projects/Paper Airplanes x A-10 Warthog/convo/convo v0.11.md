# Convo v0.11 — plane size, speed, and sound

Date: 2026-11-18. Follows `convo v0.10.md`.

## Done

- **Plane size:** measured in the page at 100 of 400 internal pixels, a quarter of the screen width in level flight, growing to a third in a hard turn. If it still looks small on a device, the browser may be showing an older cached copy: refresh.
- **Other assets scaled up:** trees, vehicles, buildings and aircraft are drawn at twice the earlier size (0.6 m per pixel), with a larger minimum and maximum.
- **Speed:** the cruise is gentler (about 104 knots on the display, down from about 117); full power is about 177 knots.
- **Sound:** the engine hum is gone. It is heard only faintly while BOOST is held. The beeps are sine tones, the guns and explosions are quieter, and the background tune is softer.

## Speed, checked against the real aircraft

- The real A-10 cruises at roughly 300 to 350 knots, and its top speed is around 380 knots.
- The game's display is not to true scale. A 16 m plane is drawn about 26 m behind the camera, so the land moves fast beside it. The displayed knots are game units, not real ones.
- To make the speed true, the world would need a much larger scale (the ground would look much further away). This is a choice for you; the game now cruises slower.

## Open

- **Q23.** Keep the game's arcade speed (as now), or match real A-10 speeds with a bigger world scale?
