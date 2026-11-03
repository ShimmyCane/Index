# Fishes — Lessons

- Keep the data shape the same for every entity the draw loop touches. NPCs carry `sp` and the player carries `desc`; the draw code read `desc` for both, so every NPC threw an error each frame. A try/catch hid it, so check the error strip after each render change.
- Keep predators well above the size a level's player starts at. If a hunter is only about 1.3× the player, it stops being a threat after one or two meals.
- Eating growth (40% of prey size) makes levels pass in a few bites. Tune this before tuning anything else, because it sets the run length.
- Plankton should be a visible colour on pale water (pale yellow worked; pale blue vanished).
- Headless checks: drive with `window.FishGame.debugSetSize` and the state hook, not by waiting for random encounters. Random wandering rarely brings a hunter within sense range.
- A `file://` page can't store cookies in headless Chromium. Serve the folder over HTTP to test cookie notes.
