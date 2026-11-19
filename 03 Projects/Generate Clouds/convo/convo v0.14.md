# Generate Clouds — convo v0.14 (2026-11-18)

Notes v3 (six open rows saved on the database, written against 0.7.2) are archived in this round. Version 0.7.3 answers the globe and cloud notes. The city list and the beaches and landmarks are not built yet; see the questions at the end.

## The six notes, and what was done

1. **A square follows the camera from space.** The detailed ground patch near the place (about 11 km, and a 120 km coarse patch around it) was drawn as made-up land with a hard edge. From about 8 km up the page now uses the real Earth picture for land and sea, so the patch fades out and no square moves with the camera. Fixed in code; checked headless.
2. **Interesting cities, a top-100 list, and natural beaches and landmarks.** Not built this round (see the questions).
3. **Cloud cover from space is one type covering the sky.** The cover came from a satellite picture that the page could not read in practice, so the sky looked the same everywhere. It is replaced by the live model's cloud cover on a worldwide grid of 13 × 7 points, for low, mid and high cloud at each hour. Fallbacks: if the live model cannot be reached, the last saved copy is shown, with its date; if there is no saved copy, the sky's own cover is used. The data line says which one is on screen.
4. **From space, the continents are not visible.** The view was in night (the sun was below the horizon) and the land was almost black. The night side now has a faint floor, so the continents read, and from about 30 km up the land and sea come from the real picture. Checked headless in daylight with clouds off: the coastline and continent are the real picture's shape.
5. **Zoomed out, the globe loses landmass and goes generated.** Same cause as 4 and 1: the made-up ground took over. The globe now uses the real picture from space.
6. **Shanghai pin works; the zoom-out loses land.** As 5.

Notes 1 and 5 are one fix, and 3 and 6 are also one fix.

## Checks

- Headless interaction checks: 20 pass, no page errors.
- Wind check passes.
- Fallback: with the live cloud request failing and a saved copy present, the page shows the saved copy, its date, and logs the failure.
- Daylight globe from space, clouds off: the continent and coastline come from the real picture.

## Not checked yet

- The live cloud model's values and what the globe looks like with real cloud (the sandbox answers with made-up numbers).
- The night floor's brightness on a device.

## Questions for Jimmy

1. **The top 100 cities.** Do you want me to draft the list from the cities already in the app plus well-known cities, with the coordinates checked against a geocoding service at build time, or do you have a list you want used? (I won't type coordinates from memory without a check.)
2. **Beaches and landmarks.** Which ones (name and place), and how many? I'd suggest about ten.
3. **Higher-resolution ground for each place.** Should the fine ground map (elevation and map colours) load on demand when someone picks a city, not all at once? That keeps the first load quick.
