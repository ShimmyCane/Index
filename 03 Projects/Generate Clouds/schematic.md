# Generate Clouds — schematic

**Track: B. Studio design** (a 3-D sky study and backdrop maker for renderings). Palette: sky-blue ink on cloud-white paper, because the subject is the sky. Panels collapsible, open on a large screen, closed on a phone.

Status: MVP 0.1.0 (2026-11-15). Headless-tested with made-up weather replies. Not yet run against the live weather service, and not yet on an iPad.

## Purpose

Pick any point on Earth and any moment. The page reads the weather for that point (cloud amounts by height, wind, storm activity, temperature, humidity, air pollution), and generates a 3-D sky with volume: the sun where it really is, clouds lit by it, drifting and changing over a 15-minute time lapse. Look around in 360°, rise through the clouds, and save a view or a whole-sky panorama as a backdrop for renderings. The second purpose is to learn about the sky: the page explains each decision in plain words, and `research/` holds the background.

## Track defaults

| Setting | This project |
|---|---|
| Words on screen | Full labels and units, in panels; the sky fills the screen |
| Panels | Place and time · How to read this sky · Cloud atlas · Adjust · Save pictures. ☰ hides all of them |
| Under the scene | Play, back to start, time slider; camera height slider |
| ⚙️ holds | Picture quality, time-lapse speed, autoplay, compass line, data check, notes, Show errors, version |
| Database | None. Device storage only |
| Private data | None in the repo. A chosen location stays on the device |

## Files

| File | What it does |
|---|---|
| `index.html`, `css/style.css` | The page |
| `js/core.js` | Version, settings, error list, helpers |
| `js/sun.js` | Sun position from place and time; the air model on the CPU (sunlight colour per height, sky light for exposure) |
| `js/presets.js` | Cloud atlas (13 sample skies) and the eight place chips. Content only |
| `js/weather.js` | Open-Meteo calls, saved copies, fallback, place search, data check |
| `js/skymodel.js` | Weather numbers → cloud types, heights, amounts, wind, haze, and the plain-words reading |
| `js/shader.js` | The sky shader (air, two cloud volumes, cirrus, sun, stars) |
| `js/renderer.js` | three.js set-up, camera, quality, tiled picture export |
| `js/notes.js` | Notes for improvement |
| `js/app.js` | Panels, time lapse, camera, saving, ⚙️ |
| `js/vendor/three.min.js` | three.js r128 (MIT), copied in so the page works from `file://` |
| `research/` | Four notes: clouds, light and colour, data sources, 3-D methods |

## From numbers to a sky (`js/skymodel.js`)

Three layers. Low and mid are volumes; high is a thin sheet.

**Low layer type**, first rule that matches:

| Rule | Type |
|---|---|
| Thunderstorm code (95–99), or CAPE > 1800 with rain > 1 mm | Cumulonimbus, base to about 2 km under the tropopause, anvil |
| Steady rain or snow code and low cover > 60% | Nimbostratus, 3 km thick |
| Shower code (80–86) or CAPE > 800 | Cumulus congestus, 3.5 km thick |
| Fog code (45, 48) | Stratus on the ground, heavy haze |
| Low cover ≥ 85%: wind < 3 m/s or spread < 2 °C | Stratus; otherwise Stratocumulus |
| Low cover ≥ 60% | Stratocumulus |
| Otherwise | Cumulus, 0.9 to 1.5 km thick by CAPE |

- **Low base** = 125 m × (temperature − dew point), kept between 250 m and 3.5 km.
- **Mid layer**: Altostratus at 70% or more, else Altocumulus; base = freezing level + 0.5 km (2.5 to 5.5 km). Dropped when a deep low cloud already fills that height.
- **High layer**: Cirrostratus at 80% or more; Cirrocumulus at 50–80% with wind under 15 m/s; else Cirrus. Height = tropopause − 2.5 km, where tropopause = 8.5 + 7·cos²(latitude) km.
- **Wind**: low layer from the 850 hPa wind, mid from 500 hPa, high from 300 hPa; if missing, estimated from the ground wind (× 1.5, × 2.5, × 4).
- **Haze** = 0.6 + 6.5 × aerosol optical depth (or 0.7 + PM2.5 / 12, or 40 / visibility km), raised above 85% humidity; tinted brown by PM2.5, tan by dust.
- **Time lapse**: 900 s of sky. Each layer drifts with its wind, shapes change slowly, cover moves toward the next hour's value, and the sun moves.
- **Same place and hour → same sky** (the noise seed comes from latitude, longitude and the hour).

## Data and fallback

1. Live Open-Meteo (9 s limit). If the full list of values is refused, it asks again with the core list.
2. The copy saved on this device (last 10 place-days).
3. A bundled sample sky. The pill says which one is showing: 🛰️ Live data · 💾 Saved copy · 📦 Sample sky · 🗂️ Atlas sample.

Dates more than 85 days back use the archive service (no upper winds, CAPE or air quality). Forecasts reach about 15 days ahead.

## Pictures

- **This view**: PNG at 1920 × 1080, 2560 × 1440, 3840 × 2160 or 2048 square.
- **360° panorama**: equirectangular PNG at 2048, 4096 or 8192 wide, north in the middle. Drawn in 512-pixel tiles at a higher quality than the live view. 8192 needs a computer (iPad limits canvas size).

## Feedback notes

"Notes for improvement" in ⚙️. Each note is saved with the place, the local time and the atlas sample if one is showing. Device storage only (`gc.notes`); read back in the same panel; Copy notes puts them on the clipboard.

## Test hooks

`GC.debug()` (state as numbers), `GC.usePreset(id)`, `GC.loadSky()`, `index.html#atlas=<id>`.

## What it is not (known limits)

- Not a photo of the real sky: amounts, heights, wind, sun and haze follow the data; each cloud's shape is generated.
- Three layers only. No moon, no terrain, no cloud shadows on the ground, no rain streaks.
- Pictures are 8-bit PNG backdrops, not HDR light sources.
- The live weather link has not been exercised yet (see `convo/convo v0.1.md`).
