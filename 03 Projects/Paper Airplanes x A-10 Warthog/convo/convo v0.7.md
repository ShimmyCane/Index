# Convo v0.7 — the world, the air, the sound, and the blink

Date: 2026-11-18. Follows `convo v0.6.md`. Q16 and Q17 answered in chat (see below).

## Answers

- **Q16 (notes table):** the family project for all games; the architecture project for modelling and architectural work. Anything needing higher-level security goes to architecture, flagged.
- **Q17 (identifiers):** up to five identifiers per note. The first notes will be generic, so the five do not need to be perfect.

## Built this round

- **Moving targets:** some vehicles drive along the road (north or south), at different speeds.
- **Air:** clouds at height, drifting slowly. Enemy fighters and allied fighters fly in the sky (see below).
- **Stripes:** the main road is grey with white dashes down its centre.
- **Lakes:** blue patches on the land (they look like water; they are not a crash zone).
- **Trees:** forest squares with round trees, drawn in depth order with the other things.
- **Enemy fighters:** a wave about every minute. Setting: fighters per wave, 0 to 6 (default 2). They turn toward you and fire shells; a close shell sounds the warning.
- **Allied fighters:** they fly orbits and do not shoot. Setting: 0 to 4 (default 1). Hitting one costs points; a lost ally is replaced after about 40 s.
- **Pause:** the game and the music stop while the settings panel is open. The picture stays.
- **Sound:** four sliders (music and engine, guns, big turns, incoming-missile warning). The music is a soft melody that loops. A hard turn gives a quiet rush of air.
- **Ammo:** the gun has 240 rounds. Firing uses them; they come back slowly, all the time. The HUD shows the count.
- **Damage:** every hit leaves a puff of smoke on the wing, even when invincible. Invincible means the hits do no harm to the hull.
- **A loss:** the plane blinks once and carries on in a new flight with full health and new targets. The score is kept. (This replaces the parachute.)

## Open questions

- **Q10.** Is the merge of PR #190 approved? (It was merged on your instruction earlier. Say if you want it reverted.)
- **Q11.** Should the stacked-slice plane (the reference's look) be the next build, or is the flat sprite good enough for testing?
- **Q12.** Do you want the loop manoeuvre and a second missile slot now, or later?
- **Q13.** Should the family login use the same account as the Paper Airplanes flights table, or a separate account?
- **Q14.** Is a 30 m safe-flight floor right, or should it be lower for a harder game?
- **Q15.** For the next art iteration, which first: better sprites, more moving aircraft and ships, or railways and roads in more detail?
- **Q18.** "The most should be limited and rechargeable over time": is that the gun ammo (built that way)? Or did you mean something else?
- **Q19.** After a loss, should the score be kept (as now), or should the score start again too?
