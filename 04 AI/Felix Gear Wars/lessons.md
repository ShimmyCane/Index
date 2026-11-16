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

## 2026-11-16 (round 3: cultures, narration, quick answers)

- **A style can be more than colours.** A table per culture (names, headgear kind, blade kind) plus two small functions (`cultHead`, `blade`) re-dressed all eight fighters in four cultures without touching the rules. A fighter keeps its role; only its name and look change. Say so in the research, so a "Ninja" is not mistaken for a new unit.
- **Be careful with names for historical groups.** The Persian assassin is a "Shadow scout", not the name of a real sect. Say in the research what the searches did not cover (kabuto, ninja, tomb-painting conventions) and mark those as general knowledge.
- **Narration is cheap with the Adventure recipe.** Kokoro runs in the cloud container (pip and npm registries are reachable); 25 cards × 3 reading tiers took a few minutes and 3 MB. Record every tier so the voice reads exactly what the card shows; keep a text hash in the manifest so only changed texts are re-recorded.
- **Test audio with the element, not `fetch`.** `fetch()` of a `file://` mp3 fails; `new Audio(src)` plays. Check `currentTime` advances.
- **Parents and children answer in a different order than you ask.** Jimmy's first message asked for the link, a merge and quick fixes before the bigger items; doing the quick items, merging, then the rest let him test while the rest was built.

## 2026-11-16 (round 4: boss gear, smooth gears, defences)

- **Smooth beats ticks.** Moving production from "a tick every quarter turn" to a continuous fill (`g.rate × quarter-turns`) made the rings fill smoothly, removed the heart's jerk and the tick sound, and kept the averages the same. The bot results barely moved.
- **Show level on both the gear and the fighter.** A flourish per level (rim and studs, jewels, rays and twinkles) and the same on the fighter (ring, glow, stars) make an upgrade readable at a glance. Stars above the head are the clearest cue.
- **Structures are targets, not special cases.** Giving the fortress, castles and towers one `struct` record (side, x, health, weapons, rebuild) let units, projectiles and shuriken all hit them with one function, and gave towers a rebuild timer for free. Do this before writing a second special case.
- **A cap needs a queue.** The 50-soldier cap holds a full gear's charge and holds enemy spawns back; nothing is lost, and the screen stays readable.
- **Test fixtures must use real names.** A headless test that put a fake gear name in the tray made the draw loop throw every frame, which looked like a missing HUD and frame. A blank frame can mean an exception in the loop; read `GW.errors` first.
- **The late game was easy for the bot even after the changes.** The castle and towers help the player as much as the enemy. Tune with the bot after any rule that helps both sides.
