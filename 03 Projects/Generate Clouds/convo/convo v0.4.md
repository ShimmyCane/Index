# Generate Clouds — convo v0.4 (2026-11-16)

Jimmy's round 4, and what was done (0.4.0). Earlier questions (v0.1 to v0.3) are still open.

## Asked

1. Terrain as a general projection on the ground. Zoomed out, the view should show terrain and different weather in different parts, not one repeated pattern.
2. On water, waves and water movement, as in the ocean or at a beach, as real as possible.
3. A world map panel on the left that follows the chosen city and lets me pick exactly: a beach view, an ocean view, a city view, and keep favourite spots.
4. Generate weather too: rain, snow, sleet, microburst, thunder and lightning, tornadoes, waterspouts. And randomness: a reasonable mix of cloud types for the weather data.

## Done

All four, described in `schematic.md` under "The ground, the sea and the map", "Weather across the region, and mixed skies" and "Weather maker".

## Said plainly

- The ground is one height every 5 km, smoothed, with made-up small relief. A coast is right to a few kilometres. A "city view" is a grey patch with night lights, not buildings.
- Tornadoes, waterspouts and microbursts are drawn from descriptions and placed by hand. Rain, snow, sleet and lightning do follow the data when the data has them.
- None of the new data calls (heights, 25-point region, map tiles from the Pages site) has been made from a real device yet.

## Questions

1. **Ground detail.** Is the general shape enough for now, or is the next step a finer grid near the camera (about 500 m), so a real bay or ridge shows?
2. **City view.** What should a city be: simple block shapes from a density guess, or leave cities as a patch and spend the effort elsewhere?
3. **Water.** Which matters more next: waves breaking on the beach as moving shapes, or the open sea in a storm (large swell, spray)?
4. **Made-up weather.** Should the Weather maker let you drag a funnel or microburst to a spot, and choose its size?
5. **Sound.** Thunder is in. Rain and surf too?
6. **Merge.** This round is on a pull request, not merged. Say "merge" when you have looked.
