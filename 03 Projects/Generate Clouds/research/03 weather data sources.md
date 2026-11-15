# Weather data: what is free, what it contains, what it cannot tell us

Research note for Generate Clouds, 2026-11-15.

## Chosen for the MVP: Open-Meteo

Free for non-commercial use, no key, works straight from a browser, data under CC BY 4.0 (credit Open-Meteo; the air-quality data also credits CAMS). They ask for fair use and publish no hard limit that this search found; check https://open-meteo.com/en/features#terms before any heavy use.

| Service | Address | Used for |
|---|---|---|
| Forecast | `api.open-meteo.com/v1/forecast` | From about 3 months back to 16 days ahead |
| Archive (ERA5 reanalysis) | `archive-api.open-meteo.com/v1/archive` | 1940 to about 5 days ago |
| Air quality (CAMS) | `air-quality-api.open-meteo.com/v1/air-quality` | PM2.5, PM10, aerosol optical depth, dust |
| Place search | `geocoding-api.open-meteo.com/v1/search` | Name → latitude and longitude |

Hourly values the app asks for:

| Value | What it drives |
|---|---|
| `cloud_cover_low`, `_mid`, `_high` (%) | Amount in each layer. Open-Meteo defines low as up to 3 km, mid as 3–8 km, high as above 8 km |
| `temperature_2m`, `dew_point_2m` | Height of the low cloud base (125 m per °C of spread) |
| `weather_code` | Thunderstorm, steady rain, showers, fog → cloud type |
| `cape` | How tall heaped clouds grow |
| `precipitation` | Rain veil, dark bases |
| `wind_speed_10m`, `wind_direction_10m`; `wind_speed_850hPa`, `_500hPa`, `_300hPa` and directions | Drift of the low, mid and high layers |
| `freezing_level_height` | Height of the mid layer |
| `visibility`, `relative_humidity_2m` | Haze when there is no air-quality reading |
| `pm2_5`, `aerosol_optical_depth`, `dust` | Haze amount and tint |

**Checked and not checked.** The cloud-layer, CAPE, freezing-level and air-quality names were confirmed in Open-Meteo's documentation by web search. The pressure-level wind names and the `past_days` parameter are from memory of the same documentation and were **not** confirmed, and the service could not be reached from the build sandbox, so no live call has been made yet. The app is written to survive a mistake: if the full request is refused it asks again with the short core list and estimates the upper winds from the ground wind.

## What this data cannot tell us

- **Where each cloud is.** A model grid cell is 2 to 25 km wide and gives one percentage per layer. The app invents the shapes; only the amounts, heights, winds and light follow the data.
- **Cloud type.** No free global feed names the type. The app infers it (see `schematic.md`, "From numbers to a sky").
- **Layers inside a level.** Two decks at 1 km and 2.5 km arrive as one "low" number.
- **The past before 1940,** and air quality before about 2022.
- **Model disagreement.** Some weather models estimate the three layers from humidity, so the layers can disagree with the total.

## Sources to add later (not in the MVP)

| Source | What it adds | Cost |
|---|---|---|
| **Satellite images** (GOES, Himawari, Meteosat; NASA GIBS tiles) | The real cloud field, every 10 minutes, as a picture from above | Free; needs tile handling and a way to turn a top view into height |
| **METAR** airport reports | Observed cloud base heights and amounts in layers, near airports | Free; many feeds do not allow browser calls |
| **Radiosonde soundings** | A real temperature and humidity profile, so layer heights are measured, not guessed | Free, twice a day, sparse |
| **Radar** (RainViewer and national services) | Where rain cells are, so a storm can sit in the right direction | Free tiers |
| **Lightning feeds** | Real strike positions | Mostly paid |
| **Open-Meteo model levels** | Cloud cover at each pressure level, for more than three layers | Free; more values per call |

## Privacy

Only a latitude, a longitude and a date leave the device, and only to Open-Meteo. A place name is sent only when the search box is used. "Use where I am" asks the browser for a position and keeps it on the device, in the saved last place.

## Sources

- Open-Meteo forecast docs: https://open-meteo.com/en/docs
- Open-Meteo air quality docs: https://open-meteo.com/en/docs/air-quality-api
- Open-Meteo README (licence, fair use): https://github.com/open-meteo/open-meteo/blob/main/README.md
