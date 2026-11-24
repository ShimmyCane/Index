# Felix Continents — brief

**Updated:** 2026-11-24
**Status:** Planning round 1. Folders, schematic, pointer `CLAUDE.md` and questions in `03 Projects/Felix Continents/convo/convo v0.1.md` exist. Nothing is built. No page yet, so no tile on the Nursery list.

## Current state

- Track A. Family play (`schematic.md`).
- V1 scope: spinning three.js globe, today's continents, ⚙️ time-travel slider with named moments, drift, mountains, volcanoes, oceans, and a simple climate.
- Open questions: convo v0.1, questions 3 to 14.

## Architecture (planned)

- Plain HTML, CSS and vanilla JS, no build step. three.js from cdnjs at one exact version at least two weeks old.
- Data: bundled JSON for today's outlines and each moment's positions. Source and licence noted next to each.
- Feedback notes stored on the device (⚙️).

## Verified vs. unverified

- Verified: nothing yet (no code).
- Unverified: map data sources and licences; the past positions; the climate model; the three.js version to pin.

## Next steps

1. Jimmy answers convo v0.1.
2. Confirm map data source and licence (before committing any data file).
3. Build the first increment: the spinning globe, today's continents, ⚙️ with feedback notes, and the time slider with the first moment.
4. Smoke test (`smoke-test`), then add the Nursery tile in the same change.
