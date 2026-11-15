# Generate Clouds — convo v0.2 (2026-11-15)

Jimmy's round 2, and what was done (0.2.0). The questions in `convo v0.1.md` are still open.

## Asked

1. The Earth has a curvature; I expect to see it.
2. Zoom into a few clouds and have that cloud regenerated at very high fidelity, with wisps.
3. Add a link in the nursery home page.
4. Instead of a fixed list of cities, offer top cities by condition (thunderstorm, sunny, overcast…).
5. Merge.

## Done

1. Height now goes to 400 km, with a Space chip at 250 km. The model was already a sphere; from the ground the horizon is flat, as in life, so the curve shows from high up.
2. Zoom to 2° (35×). A still view is redrawn sharp with three finer layers of wispy detail.
3. Tile added to the Nursery list in the root `index.html` (that one line only).
4. "Skies right now": 72 cities sorted by their current weather, three per group, plus "Sunrise or sunset now".

## Questions

1. **Curvature from the ground.** Did you also mean the cloud deck should visibly bend down toward the horizon at ground level? It does, by the true amount, which is small. I can exaggerate it as an option if the true amount reads as flat.
2. **Fidelity.** At the deepest zoom, is the wisp detail the right character, or do you want rounder "cauliflower" tops (needs a different noise, baked once)?
3. **Conditions list.** Are the nine groups the right ones? Others possible: hazy or polluted, windy, hot, tropical towers.
