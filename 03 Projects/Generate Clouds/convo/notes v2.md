# Generate Clouds — notes v2 (archived 2026-11-18)

Read from `gc_notes` (Architecture project, read-only) on 2026-11-18. Six database rows, all open, written against version 0.5.0. Nothing built or marked done yet; see `convo v0.10.md` for the plan and questions.

Place names are kept as city names or "a coastal point" (the raw coordinates of a private place are not written here).

1. **Coastal point, time lapse.** The time lapse feels different near the ocean. Keep the timeline, but extend it to a full 24 hours. Show the tide rising and falling. Add a separate setting to just watch the waves come in, with speeds 1x, 0.5x and 2x. Use a slider that snaps to those speeds instead of speed buttons.

2. **Coastal point, navigation.** Change the controls by height:
   - High in the air: **pan** moves across the Earth to change places; **look** is roughly today's "pan" (turn the view).
   - On the ground: **walk** and **look**.
   - In the clouds: **orbit** and **look**. In orbit, select a cloud and hover around it.

3. **Moscow, zoom and weather.** Above about 5x zoom, the rain, snow, thunderstorm and tornado features are removed. Also: for looking at geography from high up, add a button in settings to hide the cloud cover.

4. **Space view, clouds.** From space the clouds do not look right. They should reflect general wind patterns from live data, and their density should match real satellite information. Right now the same weather is projected everywhere on the globe, however far you zoom. Jimmy calls this "just wrong".

(The six rows make four items: the coastal time lapse, the coastal navigation, the Moscow note with its two requests, and the space view.)

Open from earlier rounds, not in this set: note 2 of `notes v1.md` (constellations) and note 4 of `notes v1.md` (real ground cover), both waiting on `convo v0.8.md`.
