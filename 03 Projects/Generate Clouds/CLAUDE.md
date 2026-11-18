# Generate Clouds — Claude Code pointer

Purpose: pick a place and a moment; the page reads the weather there and generates a 3-D volumetric sky (sun, three cloud layers, haze) with a 15-minute time lapse, a 360° look-around, and PNG exports (view and equirectangular panorama) for use as rendering backdrops. Also a way to learn about clouds.

Track: B. Studio design

- Design: `schematic.md` · Background reading: `research/` · Open work: `todo.md`
- Q&A history: `convo/` (never compact; start a new version instead)
- AI notes: `04 AI/Generate Clouds/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (public repo, privacy)

How to run: open `index.html` (no server or build). `index.html#atlas=cumulonimbus` opens a sample sky. "Use where I am" needs https or localhost.
Zoom: a still view is redrawn sharp in strips (`R.fineStart/fineStep` in `js/renderer.js`); wait for `GC.debug().sharp` before a screenshot.
Code map: `js/skymodel.js` (weather → sky; the rules), `js/shader.js` (the picture), `js/renderer.js` (three.js, export), `js/weather.js` (Open-Meteo, saved copies, fallback), `js/sun.js` (sun position, air model), `js/presets.js` (atlas content), `js/terrain.js` (height map), `js/map.js` (map panel), `js/audio.js` (thunder), `js/config.js` + `js/cloud.js` (studio database: owner sign-in, notes sync), `js/app.js` (page).
Check: headless Chromium with the WebGL flags (`/smoke-test`). Route the `open-meteo.com` hosts to made-up replies with Playwright `page.route`: the forecast host refuses the sandbox's shared address (daily limit), and a session without those hosts allowed cannot reach them at all. Read state with `GC.debug()`. Keep test scripts out of the repo.

Project rules:
- Public repo. No home or family locations in code, notes or convo files; the place chips are well-known cities.
- Database: Architecture project (studio), table `gc_notes`, owner only through `public.platform_is_owner()`. Publishable key only. SQL in `supabase/` (`test_001_gc`, `001_gc_notes`, `verify_001_gc`), pasted by hand; nothing is applied until Jimmy confirms. Never put an email, password or user id in a file. Sign-ups are open on that project (checked 2026-11-18), so never relax the rule to "any signed-in user": keep it owner-only.
- Only latitude, longitude and a date go to Open-Meteo. No keys. Credit Open-Meteo (CC BY 4.0) in ⚙️.
- The look is physical (measured light and air), not a cartoon and not an imitation of any film's or living artist's style.
- Tornadoes, waterspouts and microbursts are never in the data: keep them labelled "Made-up" in the reading panel.
- Map tiles come from OpenStreetMap: keep the credit line, and keep the plain-grid fallback.
- Say what the picture is not: the reading panel keeps its "What this is not" note.
- The numbers in `js/sun.js` (air model) and `js/shader.js` must stay the same; change both together.
