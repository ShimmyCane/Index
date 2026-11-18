# Make-3D x Construct — Brief

**Status (2026-11-18):** MVP 0.1 built and checked headless (not device-tested). Round 2 questions open in `03 Projects/Make-3D x Construct/convo/convo v0.2.md`.

## Goal

A new version of Make 3D (`ShimmyCane/Make-3D`), built with Construct's working method. Construct is by Artyom Andreyev (rtmandreyev), Apache-2.0, https://github.com/rtmandreyev/construct. Credits: `schematic.md` §0, and the page's About panel.

## What was read (verified)

- Construct at commit `7ea702e754c70cbd22157378cbde95be112b32c8`, toolkit 1.3.2. Read: `CONTRACT.md`, `CONTRIBUTING.md`, `skills/construct/SKILL.md`, `references/rounds.md`, `references/provenance.md`, `references/method.md`. Clone is outside the repo: `/home/user/rtmandreyev/construct`.
- Its tests and CLI were not run. Its method was re-implemented in plain JavaScript, with no code copied.

## What exists now (verified by running)

- `js/core/model.js`, `js/core/rounds.js`: 33 Node tests pass (`tests/`). Sample builds clean.
- `index.html` in headless Chromium (desktop 1280 px, phone 390 px): no console or page errors, no horizontal scroll, the 3-D view renders, selection works, an edit saves and re-checks, the ⚙️ drawer opens and Show errors works.
- The viewer had a bug (blank until the first interaction). Fixed by rendering after `setModel`. A second bug (number step blocking the inspector's save) fixed with `step="any"`.

## Not verified

- A real iPad (touch, pinch, the bottom errors panel).
- The database: `supabase/001_m3dxc_certainty.sql` is test SQL only, not run against the project.
- The model critic: not built.
- Research: 10 sources from search results; the Anadarko diorama date is unresolved (1949 vs 1950); the museum-studies claims need a book-length source before they are quoted publicly.

## Decisions (see schematic §7–8)

- Track B, paper and ink. Inches, Z up. Certainty as a percent per part.
- Round limits: 4 per round; stop after 2 rounds without a win; no time cap; round cap optional.
- Terminology: "Native nations" or the nation's name, not "Indians", in new text.

## Next

1. Jimmy answers `convo v0.2.md`.
2. Device test on an iPad.
3. Decide on the database apply and the model critic.
