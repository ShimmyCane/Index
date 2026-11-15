# The sea above: what clouds are and how to tell them apart

Research note for Generate Clouds, 2026-11-15. Written from standard meteorology references; the level table was checked against the WMO International Cloud Atlas pages (links at the end). Treat heights as typical, not exact.

## What a cloud is

A cloud is air that has cooled until some of its water vapour turns into droplets or ice crystals around tiny particles (dust, salt, smoke). The droplets are about 0.01 mm across, small enough to float. Air cools mostly by rising: it expands as pressure drops, and expanding air cools by about 10 °C per kilometre while dry and about 6 °C per kilometre once cloud forms.

Four things lift air:
1. **Convection.** The ground warms the air; bubbles of it rise. Gives heaped clouds (cumulus).
2. **Fronts.** Warm air slides up over cold air. Gives wide sheets (stratus family) in a known order.
3. **Hills and mountains.** Air is pushed up the slope. Gives cap and lens-shaped clouds.
4. **Convergence.** Winds meet and the air has nowhere to go but up.

## Why cumulus bases are flat

Rising air reaches its dew point at one height, the **lifting condensation level**. Every bubble condenses at that same height, so the bases line up. A rule of thumb (Espy): base height ≈ 125 m × (air temperature − dew point, in °C). On a day with 24 °C air and a 15 °C dew point the bases sit near 125 × 9 ≈ 1.1 km. The app uses this rule for the low layer.

## Three levels, ten types

The WMO atlas sorts clouds into ten basic types (genera) by height and shape. The levels overlap and move with latitude: everything sits lower near the poles and higher in the tropics.

| Level | Polar | Temperate | Tropical | Types |
|---|---|---|---|---|
| High | 3–8 km | 5–13 km | 6–18 km | Cirrus, Cirrocumulus, Cirrostratus |
| Middle | 2–4 km | 2–7 km | 2–8 km | Altocumulus, Altostratus (Nimbostratus spreads into other levels) |
| Low | ground–2 km | ground–2 km | ground–2 km | Stratus, Stratocumulus, Cumulus, Cumulonimbus (the last two grow upward through all levels) |

| Type | Looks like | Made of | What it tells you |
|---|---|---|---|
| **Cirrus** | White wisps, hooks, "mares' tails" | Ice | Fast wind high up; often the first sign of a front a day away |
| **Cirrocumulus** | Tiny ripples or grains, no shading | Ice | Rare, short-lived; unstable air at height |
| **Cirrostratus** | Thin milky veil, halo around the sun | Ice | A warm front approaching |
| **Altocumulus** | Rows of rounded clumps with shading ("mackerel sky") | Water, some ice | Mid-level moisture; on a warm morning, storms later |
| **Altostratus** | Grey-blue sheet, sun as through frosted glass | Water and ice | Rain within hours |
| **Nimbostratus** | Thick dark layer, ragged base, steady rain | Water and ice | Hours of rain or snow |
| **Stratocumulus** | Lumpy sheet with gaps, grey and white | Water | The most common cloud on Earth; cool sea air under an inversion |
| **Stratus** | Flat grey blanket, drizzle at most | Water | Lifted fog, calm moist air |
| **Cumulus** | Heaps with flat bases and sharp tops | Water | Fair weather while small (humilis); growing (congestus) means showers |
| **Cumulonimbus** | Mountain of cloud with an anvil top | Water below, ice above | Thunder, hail, strong gusts |

Size rule for the three "clumpy" types, with your arm held out: cirrocumulus clumps are smaller than a finger's width, altocumulus about a thumb, stratocumulus about a fist.

## How clouds move, grow and fade in 15 minutes

- **Drift.** A cloud moves with the wind at its own height. Wind usually gets stronger and turns with height, so layers slide over one another. Low cloud in a 10 m/s wind covers 9 km in 15 minutes; cirrus in a 35 m/s jet covers 30 km but looks slow because it is 10 km away.
- **Life of one cumulus.** A fair-weather cumulus lives 5 to 30 minutes. It grows while its thermal feeds it, then the edges mix with dry air and evaporate from the outside in.
- **Sheets** change slowly; a stratus deck can sit for a day and burn off from the edges by late morning.
- **Storms** build over 20 to 60 minutes: tower, anvil, rain shaft, collapse.

## Why the anvil is flat

A cumulonimbus rises until it meets the tropopause, where the air above is warmer (the stratosphere). The updraught cannot go further and spreads sideways. The tropopause is near 8 km at the poles and 16 km at the equator; the app uses 8.5 + 7·cos²(latitude) km.

## Words used on the page

- **Cloud cover** as a percentage of sky. Weather reports also use eighths (oktas).
- **CAPE** (J/kg): how much energy a rising bubble can gain. Under about 300 is calm, 1000 means showers, above 2000 means strong storms are possible.
- **Dew point**: the temperature at which the air would be saturated.
- **Freezing level**: the height where the air is 0 °C.

## Sources

- WMO International Cloud Atlas, levels: https://cloudatlas.wmo.int/en/some-useful-concepts-levels.html and https://cloudatlas.wmo.int/en/useful-concepts.html
- WMO, Classifying clouds: https://wmo.int/node/21339
- Stull, Practical Meteorology, 6.4 Cloud Classification: https://geo.libretexts.org/Bookshelves/Meteorology_and_Climate_Science/Practical_Meteorology_(Stull)/06%3A_Clouds/6.04%3A_Cloud_Classification
- Encyclopédie de l'environnement (level table by latitude): https://encyclopedie-environnement.org/?p=12536
