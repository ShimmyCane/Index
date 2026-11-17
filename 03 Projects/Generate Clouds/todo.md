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

## Database link (0.5.0): Jimmy's steps, in order
1. Architecture project → SQL Editor: paste `supabase/test_001_gc.sql` → Run. Expect an **error** starting `RESULT: tables=1 rls=1 policies=1 index=1 owner_sees=1 stranger_sees=0 stranger_insert=blocked anon=blocked done_check=blocked` (that error is the pass).
2. Paste `supabase/001_gc_notes.sql` → Run. Expect "Success".
3. Paste `supabase/verify_001_gc.sql` → Run; paste the result back. `owner_rows` of 0 means no sign-in sees data yet.
4. If `owner_rows` is 0: sign in to the studio account once, copy your user id from Authentication → Users, and run `insert into public.platform_owners (user_id, note) values ('<your user id>', 'owner');` by hand. Never commit it.
5. Open the page → ⚙️ → Studio database → Sign in. Your notes on the device are sent and the status line says how many are in the database.
6. Then ask me to read the notes (`/read-notes-and-update`): archive them as V1, review, update.

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
