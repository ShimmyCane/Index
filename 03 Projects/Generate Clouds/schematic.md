# Generate Clouds — schematic

**Track: B. Studio design** (a 3-D sky study and backdrop maker for renderings). Palette: sky-blue ink on cloud-white paper, because the subject is the sky. Panels collapsible, open on a large screen, closed on a phone.

Status: MVP 0.5.1 (2026-11-18). Headless-tested with made-up weather replies. Not yet run against the live weather service, and not yet on an iPad.

## Purpose

Pick any point on Earth and any moment. The page reads the weather for that point (cloud amounts by height, wind, storm activity, temperature, humidity, air pollution), and generates a 3-D sky with volume: the sun where it really is, clouds lit by it, drifting and changing over a 15-minute time lapse. Look around in 360°, rise through the clouds, and save a view or a whole-sky panorama as a backdrop for renderings. The second purpose is to learn about the sky: the page explains each decision in plain words, and `research/` holds the background.

## Track defaults

| Setting | This project |
|---|---|
| Words on screen | Full labels and units, in panels; the sky fills the screen |
| Panels | Map · Place and time · How to read this sky · Cloud atlas · Weather maker · Adjust · Save pictures. ☰ hides all of them |
| Under the scene | Play, back to start, time slider; camera height slider; Ground, Inside, Above, Space, Orbit, Turn |
| ⚙️ holds | Picture quality, time-lapse speed, autoplay, compass line, data check, notes, Show errors, version |
| Database | Architecture project, owner only: notes (`gc_notes`) after sign-in. Everything else on the device |
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
| `js/terrain.js` | The height map: loading, smoothing, what kind of spot it is, where the water is |
| `js/map.js` | The map panel (tiles, pin, markers), no library |
| `js/audio.js` | Thunder, made with Web Audio |
| `js/config.js` | The database address and the publishable key (nothing else) |
| `js/cloud.js` | Sign-in, notes sync, database check |
| `js/notes.js` | Notes for improvement (device first, merged with the database) |
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

## Zoom and sharpness (0.2.0)

- **Zoom** from 110° down to 2° (35×) by pinch, wheel, or the Zoom slider in Adjust.
- **Moving view**: reduced sharpness, to stay smooth.
- **Still view**: 0.45 s after the last change the view is redrawn at full sharpness, 320 steps per ray, one of 12 strips per frame. The compass line says "sharpening 40%" and then "sharp". Any touch stops it.
- **Close-up detail**: three finer layers of erosion (13×, 41× and 127× the cloud's cell size, bent into wisps) fade in when one pixel is small enough to show them. From far away they are skipped.
- **Stepping**: long steps through clear air; on touching cloud the ray steps back and crosses it in short steps.

## Height and the curve of the Earth (0.2.0)

The planet has always been a sphere of 6371 km in the model. From the ground the horizon is flat, as in life. The height slider now runs to 400 km on a cube curve (the first third covers 0 to 13 km), and a **Space** chip jumps to 250 km looking down, where the limb, the thin blue line of air and the cloud deck wrapping the globe are visible. Clouds are drawn out to 260 km + 14 × height.

## The ground, the sea and the map (0.4.0)

- **Ground.** A height map of 24 × 24 points, 5 km apart (120 km across), from Open-Meteo's elevation service (6 calls, saved per place). 0 m means sea. It is smoothed for the shader, which adds small made-up relief. Colours by height and slope: beach, grass, woods, dry ground, rock, snow above the freezing level; a grey built-up patch with night lights around a named city. Cloud shadows fall on it. The camera cannot go under it. This is the general shape of land and coast, not a survey.
- **Sea.** Where the height is 0. Near the camera the waves are a real surface (five layers of moving swell and chop, height 0.022 × wind² metres, running with the wind); farther away they become a rougher mirror. The water reflects the sky colours, shows the sun's glitter path, goes paler in the shallows, breaks in lines near the shore and shows whitecaps above about 8 m/s. Waves, rain and funnels move in real seconds while the time lapse plays.
- **Without ground data** the land is made-up rolling hills with no sea, and the map panel says so.
- **Map panel** (top of the left column). OpenStreetMap tiles; drag, + and −, World, This spot. Tap to drop a pin, then "Generate the sky at the pin". If tiles cannot load, a plain grid with city dots. The panel names the spot (Open water, Coast, Lowland, Hills, Mountains) with its height, and offers "Face the water" and "Face the high ground".
- **Kept spots.** ⭐ Keep saves the place with the way you were looking (heading, tilt, zoom, height, position). Up to 30, on this device (`gc.favs`).

## Weather across the region, and mixed skies (0.4.0)

- **Region.** One call fetches low, mid and high cover for 25 points (5 × 5, 100 km apart) at the same hour. Cover varies across the view accordingly; beyond 500 km it fades back to the place's own value with slow made-up variation, so a view from high up is not one repeated pattern. Not used for atlas samples or when cover is set by hand.
- **Mixed low layer.** A share of the cells grows taller than the rest: cumulus with some taller heaps (share from CAPE), stratocumulus thicker in places, congestus towers among small cumulus, storm towers among lower cumulus.
- **Mixed high layer.** Patches of small ripples among the cirrus streaks, on some skies.
- **Shuffle** (Weather maker) keeps the weather and deals new shapes and a new mix. The same place, hour and shuffle count always give the same sky.

## Weather maker (0.4.0)

| Weather | From the data | By hand |
|---|---|---|
| Rain, snow, sleet | Yes: when the hour has precipitation. Kind from the weather code, else the ground temperature (snow at 0.5 °C or less, sleet under 2.5 °C) | "What falls" and "How hard" |
| Lightning and thunder | With a thunderstorm code | Tick box |
| Tornado, waterspout, microburst | Never: no feed reports them | Chips; placed 5 to 9 km ahead of the view |

- Rain and snow are a veil under the thicker cloud, slanted by the wind, plus drops or flakes close to the lens when the camera stands in it.
- A bolt is drawn from the cloud base to the ground; the cloud lights up; the top line counts down to the thunder (distance ÷ 0.343 km/s), which is made in the page.
- A funnel hangs from a lowered wall cloud, leans and turns, with dust at the ground or spray over water (a tornado placed over water becomes a waterspout). A microburst is a rain shaft that flares at the ground with a curl at its edge. Placing one puts a storm cloud above it.
- These three are **drawn from descriptions, not simulated**: no wind field, no damage, no size taken from data. The reading panel labels them "Made-up".

## Orbit (0.3.0)

- **Orbit** chip (beside the height chips): the camera circles a centre point in the clouds and always faces it. The centre is where the view was pointing, at the middle height of the low cloud. From the ground it first lifts the camera above the low cloud.
- Drag sideways to go around, drag up or down to go over or lower, pinch or wheel to come closer or back away. The height slider changes the angle.
- **Turn** goes around twice by itself, then waits (30, 60 or 120 s per turn, in ⚙️). A height chip or a new sky leaves orbit.
- The camera now has a position (km east and south of the place), so the clouds are passed, not just looked at.
- Atlas sample **Storm cells from the air**: separate thunderstorm towers (30% cover, CAPE 3200), opened in orbit at about 14 km and turning.
- **Not drawn:** rotation inside a storm, wall clouds and tornado funnels. No free feed gives them, and the model has no cell-scale wind. The reading panel says so on every storm.

## Skies right now (0.2.0)

One call asks Open-Meteo for the current weather of 72 well-known cities (`GC.CITIES` in `js/presets.js`). They are sorted into Thunderstorm, Rain, Snow, Fog, Overcast, Broken cloud, High wisps, Clear, and "Sunrise or sunset now" (from the sun's height, no network). Each group shows its three strongest; an empty group says so. Saved for 30 minutes; Refresh asks again. Without a connection, the last list is shown with its time, or the eight plain cities.

## Data and fallback

1. Live Open-Meteo (15 s limit; a daily-limit refusal is said in plain words). If the full list of values is refused, it asks again with the core list.
2. The copy saved on this device (last 10 place-days).
3. A bundled sample sky. The pill says which one is showing: 🛰️ Live data · 💾 Saved copy · 📦 Sample sky · 🗂️ Atlas sample.

Dates more than 85 days back use the archive service (no upper winds, CAPE or air quality). Forecasts reach about 15 days ahead.

## Pictures

- **This view**: PNG at 1920 × 1080, 2560 × 1440, 3840 × 2160 or 2048 square.
- **360° panorama**: equirectangular PNG at 2048, 4096 or 8192 wide, north in the middle. Drawn in 512-pixel tiles at a higher quality than the live view. 8192 needs a computer (iPad limits canvas size).

## Database (0.5.0): notes go to the studio database

- **Which database:** the Architecture project (studio, Track B; `xabgankckrcuhcgdolrg`), owner only, the same one Critique Detail uses. Table `gc_notes` (same columns as `dc_notes`: `id`, `text`, `page`, `item`, `label`, `version`, `status` open or done, `noted_at`). Registered in `table_index` under project "Generate Clouds".
- **Security:** row-level security on, anon has no access, one policy that calls `public.platform_is_owner()`: only accounts listed in `platform_owners` can read or write notes from the page. No email or user id in the repo. **Why not "any signed-in account":** sign-ups are open on this project (`disable_signup` is false, email provider on, confirmation required) and the publishable key is public, so anyone with an email address could create an account. Open sign-ups plus an any-account rule would let a stranger read the notes (each carries a place) and write to them. The project also holds a second, older account. Claude reads the notes through the database tool, which does not depend on this policy.
- **Live state (read-only check 2026-11-18):** `gc_notes` exists (columns as designed, RLS on, one owner policy, anon has no grants, registered in `table_index`), 0 notes; `platform_owners` had 0 rows until the owner's account was added the same day (the sign-in account, matched by its address prefix and checked to be the only match).
- **In the app (⚙️ → Studio database):** email and password, Sign in, Sync notes now, Sign out, Check the database. The password is never stored; a renewal token is kept on the device so you stay signed in (Sign out removes it). Publishable key only (`js/config.js`).
- **Flow:** a note is saved on the device first. Signed in, it is also sent with its own id and time; later notes are sent at once. Sync sends what the database has not seen, then takes back done marks and notes from other devices. A ☁️ on a note means the database has it. Signed out or offline: "This device only", no error on load.
- **What is sent:** only the notes, each with the place and moment it was about (so a note can say which sky). Not the weather, not the pictures.
- **Not synced yet:** kept map spots stay on the device (a `gc_spots` table is a small addition if wanted).
- **SQL** in `supabase/`: `test_001_gc.sql` (rolled back; expect an error starting `RESULT:`), `001_gc_notes.sql`, `verify_001_gc.sql`. Pasted by hand.

## Feedback notes

"Notes for improvement" in ⚙️. Each note is saved with the place, the local time and the atlas sample if one is showing. Device storage only (`gc.notes`); read back in the same panel; Copy notes puts them on the clipboard.

## Test hooks

`GC.debug()` (state as numbers), `GC.usePreset(id)`, `GC.loadSky()`, `index.html#atlas=<id>`.

## What it is not (known limits)

- Not a photo of the real sky: amounts, heights, wind, sun and haze follow the data; each cloud's shape is generated.
- Three layers only. No moon. The ground is a coarse height map: no buildings, trees, roads, rivers or lakes, and coasts are only right to a few kilometres. Below-sea-level land reads as sea.
- Tornadoes, waterspouts and microbursts are drawn from descriptions and placed by hand.
- Close-up detail is generated noise, not a simulation of real turbulence; at the deepest zoom, edges show some grain.
- "Skies right now" covers 72 cities, not the whole world; a storm elsewhere is not listed.
- Pictures are 8-bit PNG backdrops, not HDR light sources.
- The live weather link has not been exercised yet (see `convo/convo v0.1.md`).
