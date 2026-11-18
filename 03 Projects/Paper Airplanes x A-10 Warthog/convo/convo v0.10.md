# Convo v0.10 — settings tap, and the gun lead

Date: 2026-11-18. Follows `convo v0.9.md`.

## Reported

- **The settings button did not open.** When the gear had faded, the first tap in the upper-right corner only woke it, so it took a second tap. Now one tap in the corner brings the gear back and opens the settings.
- **Bullets overshot.** The gun aimed at where a target was, and ignored the plane's speed (the bullets inherit it) and the drop of the bullet. Now the gun predicts where the target will be when the bullet arrives, allows for the plane's speed and the drop, and fires along that line. Moving vehicles and fighters are led too.

## Also changed

- "Planes nearby" for the gun (straight ahead) now means aircraft that are in the air. Parked jets on the airfield are ground targets.

## Checks

- 52 flight and rule checks (exit code 0), run five times in a row with no change. Added: a gun hit on a still tank 200 m ahead at flying speed, and a hit on a tank moving along the road.
- Browser: one tap in the corner opens the settings at 1180×820 and 390×844; no page errors.
