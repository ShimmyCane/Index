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

## Database link (0.5.0): DONE on 2026-11-18 (table pasted by Jimmy; owner row added by Claude after Jimmy's go-ahead). Kept for reference
(Remaining: sign in on the page once so the notes on the device are sent; then read them.)
(Owner row first or last, either works, but the page shows no rows until it exists. `supabase/000_owner_row.sql` has the ready-to-paste steps; the id you copy is never committed.)
1. Architecture project → SQL Editor: paste `supabase/test_001_gc.sql` → Run. Expect an **error** starting `RESULT: tables=1 rls=1 policies=1 index=1 owner_sees=1 stranger_sees=0 stranger_insert=blocked anon=blocked done_check=blocked` (that error is the pass).
2. Paste `supabase/001_gc_notes.sql` → Run. Expect "Success".
3. Paste `supabase/verify_001_gc.sql` → Run; paste the result back. `owner_rows` of 0 means no sign-in sees data yet.
4. If `owner_rows` is 0: paste `supabase/000_owner_row.sql`. Step A lists the newest accounts (copy yours), step B inserts it (uncomment the line and put the id in), step C should say `owner_rows = 1`. Never commit the id.
5. Open the page → ⚙️ → Studio database → Sign in. Your notes on the device are sent and the status line says how many are in the database.
6. Then ask me to read the notes (`/read-notes-and-update`): archive them as V1, review, update.

## Round 6 (0.6.0): to confirm on a real device
- [ ] The marine call returns waves and tide (the variable names were confirmed from documentation for waves; the tide name `sea_level_height_msl` was not).
- [ ] The elevation service returns the fine map (4 more calls per place); the 81-place wide weather call works; neither was reachable from the build sandbox, so only mocked replies were tested.
- [ ] The Earth picture looks right from space on the iPad, and the far ground is not too slow.
- [ ] Mark notes done in the database after Jimmy confirms which (see `convo/notes v1.md`).

## Next: stars and ground cover (waiting on `convo v0.8`)
- [ ] Stars and constellations in the night sky (note 2).
- [ ] Real ground cover near the camera (note 4).

## Next round (agreed 2026-11-17)
- [ ] Read the saved notes (`/read-notes-and-update` style, table `gc_notes` in the Architecture project), copy them into `convo/notes v1.md` summarised as the V1 set, review them, and update. Mark notes done only after Jimmy confirms which.
- [ ] `gc_spots`: kept map spots saved to the database (new SQL file `002_gc_spots.sql` with its test and verify; the page sends and merges them the way it does notes).

## Added in 0.4.0, to confirm on a real device
- [ ] The elevation service returns 576 heights (6 calls) and a real coast looks right at a known beach.
- [ ] The 25-point regional call works; the view from Space shows different cover in different parts.
- [ ] Map tiles load from the Pages site; tap-to-pin with a finger.
- [ ] Speed on iPad with terrain and waves; thunder sound after pressing play.

## Next candidates
- [ ] Finer ground near the camera (a second, closer height grid), rivers and lakes, buildings for a city view.
- [ ] Rain and surf sound; rainbow; wet ground.
- [ ] Storm structure: a rotating updraught, wall cloud and funnel as a drawn sample (made-up, labelled as such); radar as the map of real cells. (waiting on convo v0.1)
- [ ] Rounder cumulus: baked Perlin-Worley 3-D noise.
- [ ] HDR panorama (.hdr) for lighting a render.
- [ ] Flight path / fly-through camera.
- [ ] Whole-day time lapse; frame sequence export.
- [ ] Satellite image as the cloud map.
- [ ] Moon and moonlight; cloud shadows on the ground; terrain.
- [ ] Saved skies as recipes with links.
- [ ] `index_summary.html` (`/summarize-code`).
