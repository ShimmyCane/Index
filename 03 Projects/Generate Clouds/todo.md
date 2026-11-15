# Generate Clouds — todo

## Checked against the live service on 2026-11-15
- [x] Air quality, place search and the archive service answer with the value names the page uses.
- [ ] The forecast service refused every call from the build sandbox ("Daily API request limit exceeded": the limit is per network address, and the sandbox shares one). So the forecast call, its upper-wind names and the 72-city call are still unconfirmed.

## To confirm on a real device
- [ ] Live Open-Meteo call returns data (pill says 🛰️ Live data; ⚙️ → Check the data link shows three ✅).
- [ ] The upper-wind values arrive (the Wind line in the reading says "measured near 1.5 km").
- [ ] Speed on iPad at Medium quality; pinch and drag with real fingers.
- [ ] Saving a 4096 panorama on iPad (Files / Photos).

## Added in 0.2.0, to confirm on a real device
- [ ] The multi-city call for "Skies right now" returns 72 rows (one request, comma-separated coordinates).
- [ ] Sharpening time on iPad when zoomed in; no lost 3-D view.

## Added in 0.3.0, to confirm on a real device
- [ ] Orbit with real fingers: drag around, pinch closer; speed while turning.

## Next candidates
- [ ] Storm structure: a rotating updraught, wall cloud and funnel as a drawn sample (made-up, labelled as such); radar as the map of real cells. (waiting on convo v0.1)
- [ ] Rounder cumulus: baked Perlin-Worley 3-D noise.
- [ ] HDR panorama (.hdr) for lighting a render.
- [ ] Flight path / fly-through camera.
- [ ] Whole-day time lapse; frame sequence export.
- [ ] Satellite image as the cloud map.
- [ ] Moon and moonlight; cloud shadows on the ground; terrain.
- [ ] Saved skies as recipes with links.
- [ ] `index_summary.html` (`/summarize-code`).
