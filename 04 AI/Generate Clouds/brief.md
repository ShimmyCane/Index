# Generate Clouds — brief

**Goal.** Any place, any moment → a 3-D volumetric sky from weather data, with a 15-minute time lapse, a 360° look-around, height from ground to above the clouds, and PNG exports (view, equirectangular panorama). Also a learning tool about clouds. Track B.

**State (2026-11-15): MVP 0.1.0**, merged the same day at Jimmy's request, questions after.

**Architecture.** Plain HTML/CSS/JS, classic scripts, three.js r128 vendored. One fragment shader on a full-screen quad draws air (Rayleigh, Mie, ozone, single scattering + a blue second-bounce fill), two marched cloud volumes in spherical shells, a flat cirrus sheet, sun and stars. `skymodel.js` turns one hour of Open-Meteo data into layer types, heights, cover, wind, haze and a plain-words reading. `sun.js` repeats the air model on the CPU for per-layer sunlight colour and auto-exposure. Export renders the same shader in 512 px tiles (perspective or equirectangular). Three-tier data: live → saved copy → bundled sample.

**Verified (headless Chromium, software GL, made-up API replies):** 50 checks pass at 1180 × 820, 768 × 1024, 390 × 844: zero errors, no horizontal scroll, touch targets ≥ 48 px, gear clear of controls, autoplay twice then pause, scrub, drag and pinch, height chips, adjust and reset, sunset chip, place search, atlas, panorama 2048 × 1024 and view 1920 × 1080 PNG, data check, note saved and kept after reload, errors panel opt-in at the bottom, print hides chrome, offline falls back to the sample sky. Sun position checked against four known cases.

**Not verified:** a live Open-Meteo call (sandbox blocks the host); the pressure-level wind names and `past_days` (from memory, not confirmed by search); real iPad speed, real fingers, saving files on iPad; geolocation; the archive path for old dates.

**Decisions made without asking (in convo v0.1):** Track B with a sky palette; Open-Meteo; physical look; three layers; device storage only; no home-page tile.

**0.2.0 (2026-11-15, round 2, merged at Jimmy's request):** zoom to 2° with a sharpening pass for still views (full resolution, 320 steps, 12 strips) and three close-up erosion layers; adaptive stepping (long in clear air, short in cloud); height to 400 km with a Space chip, so the Earth's curve shows; "Skies right now" (72 cities in one call, nine groups); nursery tile. 57 headless checks pass. Still unverified: any live Open-Meteo call, including the multi-city one; iPad.

**0.2.1 (2026-11-15):** Open-Meteo hosts added to the session environment. Live results: air quality, geocoding and archive calls work with the names used. The forecast host answered 429 "Daily API request limit exceeded" for the sandbox's shared address, so the forecast call, the pressure-level wind names and the multi-city call remain unverified. Fixes from the live run: timeout 9 s → 15 s (the long forecast request timed out before its refusal arrived), and a plain message for 429.

**Next.** Answers to `03 Projects/Generate Clouds/convo/convo v0.1.md`; candidates in `todo.md`.
