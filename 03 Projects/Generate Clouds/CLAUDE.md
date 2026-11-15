# Generate Clouds — Claude Code pointer

Purpose: pick a place and a moment; the page reads the weather there and generates a 3-D volumetric sky (sun, three cloud layers, haze) with a 15-minute time lapse, a 360° look-around, and PNG exports (view and equirectangular panorama) for use as rendering backdrops. Also a way to learn about clouds.

Track: B. Studio design

- Design: `schematic.md` · Background reading: `research/` · Open work: `todo.md`
- Q&A history: `convo/` (never compact; start a new version instead)
- AI notes: `04 AI/Generate Clouds/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (public repo, privacy)

How to run: open `index.html` (no server or build). `index.html#atlas=cumulonimbus` opens a sample sky. "Use where I am" needs https or localhost.
Code map: `js/skymodel.js` (weather → sky; the rules), `js/shader.js` (the picture), `js/renderer.js` (three.js, export), `js/weather.js` (Open-Meteo, saved copies, fallback), `js/sun.js` (sun position, air model), `js/presets.js` (atlas content), `js/app.js` (page).
Check: headless Chromium with the WebGL flags (`/smoke-test`). The sandbox cannot reach `open-meteo.com`, so route those hosts to made-up replies with Playwright `page.route`. Read state with `GC.debug()`. Keep test scripts out of the repo.

Project rules:
- Public repo. No home or family locations in code, notes or convo files; the place chips are well-known cities.
- Only latitude, longitude and a date go to Open-Meteo. No keys. Credit Open-Meteo (CC BY 4.0) in ⚙️.
- The look is physical (measured light and air), not a cartoon and not an imitation of any film's or living artist's style.
- Say what the picture is not: the reading panel keeps its "What this is not" note.
- The numbers in `js/sun.js` (air model) and `js/shader.js` must stay the same; change both together.
