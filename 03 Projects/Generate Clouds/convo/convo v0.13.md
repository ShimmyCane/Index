# Generate Clouds — convo v0.13 (2026-11-18)

Version 0.7.2: the controls are reworked as Jimmy described them. The time lapse has its own settings panel, and the bottom bar and the mode buttons follow the height.

## Status of the six items in `notes v2.md`

All six are built in code, and all are tested headless with made-up replies. None is checked on live data or on a device yet, so none is marked done in the database.

1. **24-hour time lapse, tide, speed:** built. The speed control is now the sky-covered and playback sliders (see below), and the speed is shown in the bar.
2. **Pan, look, walk, orbit by height:** built. Jimmy could not see the pan control because it was a gesture, so these are now buttons (see below).
3. **Hide cloud cover:** built (the Clouds setting, and a Clouds on/off chip that shows high up). The "above 5×" weather note was withdrawn.
4. **Space clouds with wind and satellite data:** built (satellite cover in 0.7.0, the wind grid in 0.7.1). Real data not yet seen.

The two items from `notes v1.md` (constellations and the real ground) were built in 0.7.0.

## What changed in the controls

- **Time lapse panel (⚙️):** two horizontal sliders.
  - *Sky covered:* 15 s, 1 min, 15 min, 1 h, 2 h, 8 h, 24 h. Default 1 min.
  - *Playback takes:* 15 s, 1 min, 2 min, 3 min, 4 min, 5 min. Default 1 min.
  - Speed is the sky covered divided by the playback time: 1× is real time, 0.5× is half time. The bar shows it in words.
- **Bottom bar:** Restart, Play, the speed label, the time bar, and the time. Restart is the old "back to start" button, renamed.
- **Mode buttons, by height:**
  - On the ground: **Look** (the default) and **Walk**.
  - In the air: **Look** (the default) and **Orbit a cloud**. Tap a cloud to circle it.
  - High up (space): **Pan** (the default) and **Look**, plus **Clouds on/off**.
  - Two fingers turn the view at any height. Pinch or scroll zooms.
- The separate "What plays" choice (24 hours or the waves clip) and the old waves speed slider are gone; the two sliders replace them. Waves at 1× are now a 15-second sky span over a 15-second playback.

## How I read the ambiguous parts (please check)

- I read the first slider as the sky covered and the second as how long one run takes. Jimmy's note asked for a 1-minute default on both.
- The waves clip was replaced by the same controls: a 15 s sky span over a 15 s playback gives 1× real-time waves.
- In space the default mode is Pan, since Jimmy's note named pan first. Say if Look should be the default there too.
- "High" is taken as 40 km and up. The Space button sets 250 km.

## Other changes

- The old skill name `read-notes-and-update` is kept as a deprecated stub that points to `review-notes-and-update`, with the reason and date in `02 Refs/Skills/deprecated/`.

## Checks

- 20 interaction checks pass with no page errors: defaults, the speed maths, restart, the mode buttons by height, orbit a cloud, pan in space, and the clouds chip.

## Not yet checked

- Live forecast, live satellite and wind values, and the controls on an iPad or phone with real fingers.
