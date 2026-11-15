# Light and colour: why the sky is blue, and what happens at dusk

Research note for Generate Clouds, 2026-11-15. General atmospheric optics; the numbers are the ones the shader uses.

## Three things scatter sunlight

| What | Size against light | Effect | In the app |
|---|---|---|---|
| **Air molecules** (Rayleigh) | Far smaller | Scatter blue about 5.6× more than red (1/λ⁴), in all directions | Coefficients 5.8, 13.6, 33.1 per 1000 km for red, green, blue; thins out with a scale height of 8 km |
| **Haze: dust, smoke, salt, pollution** (Mie) | About the same | Scatters all colours, mostly forward: a white glow around the sun, a pale horizon | 4.0 per 1000 km × the haze multiplier; scale height 1.2 km |
| **Cloud droplets** | Far larger | Scatter all colours many times: white on top, grey below | Volume march with a forward-peaked phase function |

**Ozone** does not scatter; it absorbs orange light high up (around 25 km). It matters at twilight, when sunlight crosses a long path of ozone: it is one reason the zenith stays blue after sunset.

## The day, by sun height

| Sun height | Name | What you see | Why |
|---|---|---|---|
| Above 10° | Day | Blue above, paler at the horizon | Short path through air; the horizon is a long path where all colours add up to white |
| 0° to 10° | Golden hour | Warm light, long shadows, orange near the sun | The light crosses up to 38× more air than at noon; blue is scattered out of the beam |
| 0° to −6° | Civil twilight ("blue hour") | Orange band at the horizon, pink "Belt of Venus" opposite the sun above the blue-grey shadow of the Earth | Only the upper air is still lit |
| −6° to −12° | Nautical twilight | Deep blue, first stars | |
| −12° to −18° | Astronomical twilight | Almost night | |
| Below −18° | Night | Stars | |

**High clouds stay lit after sunset.** From 10 km up, the horizon is about 3° lower than from the ground, so cirrus catches red sunlight for 15 to 20 minutes after the ground is in shade. Low clouds go grey first. The app computes the sunlight colour separately at the height of each layer, so this happens on its own.

## What pollution and humidity do

- More particles mean more Mie scattering: the blue turns milky, distant clouds fade, and the horizon band widens.
- Sunsets through moderate haze are redder near the sun; through heavy smog they are dull, because the light is absorbed before it arrives.
- Smoke and soot absorb blue more than red, which tints the haze brown. Desert dust tints it yellow-tan.
- Humid air swells the particles, so the same pollution looks hazier at 90% humidity than at 40%.

The app turns aerosol optical depth (or PM2.5, or visibility) into the haze multiplier and tints it by PM2.5 and dust.

## Cloud light, in plain words

- **Bright top, dark base.** Light is scattered out as it goes deeper (Beer's law: brightness falls as e^(−thickness × density)).
- **Silver lining.** Droplets scatter strongly forward, so thin edges glow when the sun is behind them.
- **Soft inside.** Light bounces many times, so the shadowed side is never black. The shader adds a second, weaker term that fades four to five times more slowly to stand in for this.
- **Blue with distance.** Air between you and a far cloud adds blue light and removes the cloud's own. The shader blends far clouds toward the sky colour behind them.

## Known limits of the app's model

- Single scattering in the air, plus a soft blue fill for the second bounce. A full model (Bruneton 2008, Hillaire 2020) uses lookup tables; twilight colours here are approximate.
- No moon, no moonlight, no city lights from above, no rainbow, no halo, no crepuscular rays.
- Exposure is automatic, like a phone camera, so night looks brighter than it is.

## Sources to read further

- Hillaire, "A Scalable and Production Ready Sky and Atmosphere Rendering Technique", 2020: https://diglib.eg.org/handle/10.1111/cgf14050 (course slides: https://blog.selfshadow.com/publications/s2020-shading-course/hillaire/s2020_pbs_hillaire_slides.pdf)
- Bruneton and Neyret, "Precomputed Atmospheric Scattering", 2008.
- Minnaert, "Light and Colour in the Outdoors" (a classic field guide to sky optics).
