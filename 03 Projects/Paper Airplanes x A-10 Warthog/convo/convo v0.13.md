# Convo v0.13 — stacking, enemies, allies, bases, radar

Date: 2026-11-18. Follows `convo v0.12.md`.

## Questions answered by the build

- **"I'm not seeing the stacked sprites."** Honest answer: the slices were only one design unit apart and barely shaded, so the stack read as a dark underside. Now each slice is two units lower, the lower ones are much darker, and the fighters and allies are stacked too.
- **"Why do the opponents circle me?"** They turned toward you at a fixed rate and could not stop, so they overshot and orbited. Now they fly an attack run: approach, fire, break away for a few seconds, then come back.
- **Radar:** flying things are triangles with the sharp point on their heading. Enemies are red, allies blue, and in Felix mode they are bigger.
- **Allies defend:** allies fire at enemy fighters that come within 700 m, and their shots lead the target.
- **Towns and bases:** a defended base comes up every 1,400 m of route: three towns, a SAM site, flak guns, and two allies circling it. The world is endless: the ground is computed from position, so there is no edge.

## For the record

- The fighter's hit box is 4.5 m, and flying targets have 3 m of vertical slack. Dogfights are hard to aim, and the fun is in the chase.
- Fighters settle toward your altitude slowly, so a shot can be led.

## Open

- **Q24.** Enemy count, ally count and the base spacing feel right to you, or should the fights be bigger?
- **Q25.** Should the other sprites (tanks, buildings, aircraft on the ground) be stacked too, in the next art pass?
