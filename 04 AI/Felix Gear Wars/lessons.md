# Felix Gear Wars — lessons

## 2026-11-16 (first build, MVP 0.1.0)

- **Put the rules in a file with no DOM.** `sim.js` ran unchanged in Node and in the page, so a bot could play all 24 levels in seconds. The first run found a catapult that beat everything; making its stone non-homing (fast units dodge) and trimming its attack fixed it.
- **Test balance two ways.** A unit-against-unit matrix shows whether the counters read as intended; a bot over the campaign shows difficulty. Space the test units out, or splash damage makes everything look broken.
- **Meshing gears need one geometry rule.** Tooth tip = pitch radius + 4 and root = pitch radius − 4; neighbours alternate direction and the odd ones get a half-tooth phase (15° with 12 teeth). Then every neighbour meshes in both directions.
- **Gear rules that reward play:** a gear reached from two sides of the heart gets two ticks, so loops beat lines; multiplier gears multiply what passes through, taken as the best path.
- **One filter makes a whole art style.** Route every colour through one function and pre-paint the frame and texture to an offscreen canvas. Five styles cost about 60 lines.
- **Draw the unit bigger than its logic.** The first screens felt empty because the art was drawn at 1×; a 1.3× draw scale (and a thicker ground band) made the battle read.
- **Log sound errors.** A try/catch around sound hid nothing only because errors now go to the opt-in error panel; test every effect by calling it.
- **A non-homing projectile is a counter.** Stones that land where the target was punish slow units and let assassins and knights escape.
- **A "win" that cannot happen.** Free-for-all inherited "knock down the fortress" and ended itself; make the base unbreakable when the mode must not end.
