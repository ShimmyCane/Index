# Generate Clouds — convo v0.10 (2026-11-18)

Jimmy's new notes (`notes v2.md`) are archived and reviewed. Nothing is built or marked done yet. Some items are clear enough to build now; others need a decision first. Open questions from `convo v0.8.md` (stars, ground cover, licence) still stand.

## What I plan to build once you answer

- **Hide cloud cover** (note 3): a button in Clouds settings that hides every cloud layer and keeps the ground, sea, map and Earth picture. Clear enough to build now.
- **Speed slider** (note 1): one slider that snaps to 0.5x, 1x and 2x, plus a "waves only" setting. Clear enough to build now.
- **Keep weather above 5x zoom** (note 3): this reads as a bug. The features are data-driven and should stay at every zoom; I would fix it rather than add a setting. Confirm below.
- **24-hour timeline and tide** (note 1): needs the sea-level line for the full day from the marine data.
- **Navigation by height** (note 2): a larger change to the controls. Needs answers below.
- **Space clouds** (note 4): needs a decision on the data source.

## Questions

1. **Time lapse, 24 hours.** Should the timeline run from midnight to midnight for the chosen day (so the sun, the cloud layers and the tide all show on one line), or a rolling 24 hours from now? I suggest midnight to midnight, with the tide as a line under the scrub bar.

2. **"Watch the waves come in."** Does this setting only change the sea (the time lapse keeps the clouds still), with the 0.5x, 1x and 2x speeds applying to the waves? I suggest yes.

3. **Navigation: what does drag do on the ground?** Options:
   - **A.** Drag to walk, and the view turns with a second finger (simple, no extra buttons). *(Recommended for an iPad, short on words.)*
   - **B.** A joystick in the lower left for walking, drag to look (the game-controls skill's standard for kids' games).

4. **"Pan" high up.** Dragging moves the view across the Earth (the place changes), and a separate "look" control turns the view. Is that right, or should "look" be the two-finger turn only?

5. **Clouds: orbit around a selected cloud.** Tap a cloud to choose it, then drag to hover around it. Does a selected cloud need a name or a label (for example "cumulus, 3 km up")? I suggest a small label that shows its type and height.

6. **Moscow note, "5X".** I read this as "above about 5x zoom, the weather features disappear". Confirm: is that the bug you saw, and should rain, snow, thunder and the tornado stay at every zoom? (I would fix it, not add a setting.)

7. **Space clouds: which data?** Two options, and I would combine them:
   - **A.** A real satellite cloud picture (NASA GIBS, public domain, about 250–500 m) drawn as the cloud cover in the space view. It is not reachable from this build sandbox, so I can only test it with made-up replies.
   - **B.** Wind and cover from a worldwide grid of live forecast points (the 81-place wide grid already built, pushed out to the whole globe), so the pattern changes from place to place.
   *Recommended: A for the look, B for the wind. Is that OK, or do you want only one?*

8. **Licence reminder.** The satellite picture (option A) is public domain, so it needs no credit beyond the page note. Still open from v0.8: whether backdrops are used commercially, and the Earth picture's credit (CC BY-SA 3.0).

## Not yet asked (waiting from earlier)

- Constellations and the real ground (`convo v0.8.md`, questions 1–6). Please answer those when you can; they are still the two open notes from v1.

## Answers (Jimmy, 2026-11-18)

1. **Time lapse:** not midnight to midnight. Run from now through 24 hours ahead, using the weather report's forecast.
2. **Watch the waves:** no. The clouds shift too. The processing cost is unknown, so start at 15 seconds for one loop, with a setting that goes up to 60 seconds.
3. **Ground navigation:** like Google Maps or Apple Maps. Drag moves the world, and the centre point becomes the new location to start from. (Option A.)
4. **Pan high up:** yes. The new point is also the focus of the look feature. Hiding clouds is wanted so the globe can be seen.
5. **Cloud label:** OK, a small label with type and height.
6. **"5X" weather features:** withdrawn. Jimmy will address this in the future. Not part of this round.
7. **Space clouds:** option A, a real satellite cloud picture (NASA GIBS).
8. **Licence:** yes. Commercial use and the Earth picture credit are still open from v0.8.

**Constellations and real ground (convo v0.8):** "Proceed". Build with the recommended defaults in v0.8, and ask again only where a default is not safe.
