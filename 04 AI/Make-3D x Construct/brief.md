# Make-3D x Construct — Brief

**Status (2026-11-18):** MVP 0.3 built (388-part camp scene, two-panel layout, fixed drawer) and checked headless (not device-tested). The sample is now a Southern Cheyenne camp move, as a draft for consultation (not for display). Round 3 questions in `03 Projects/Make-3D x Construct/convo/convo v0.3.md`.

## Goal

A new version of Make 3D (`ShimmyCane/Make-3D`), built with Construct's working method. Construct is by Artyom Andreyev (rtmandreyev), Apache-2.0, https://github.com/rtmandreyev/construct. Credits: `schematic.md` §0, and the page's About panel.

## What was read (verified)

- Construct at commit `7ea702e754c70cbd22157378cbde95be112b32c8`, toolkit 1.3.2. Read: `CONTRACT.md`, `CONTRIBUTING.md`, `skills/construct/SKILL.md`, `references/rounds.md`, `references/provenance.md`, `references/method.md`. Clone is outside the repo: `/home/user/rtmandreyev/construct`.
- Its tests and CLI were not run. Its method was re-implemented in plain JavaScript, with no code copied.

## What exists now (verified by running)

- `js/core/model.js`, `js/core/rounds.js`, `js/core/review.js`: 43 Node tests pass (`tests/`). Sample and story build clean.
- `index.html` in headless Chromium (desktop 1280 px, phone 390 px): no console or page errors, no horizontal scroll, the 3-D view renders, selection works, an edit saves and re-checks, the ⚙️ drawer opens and Show errors works.
- The viewer had a bug (blank until the first interaction). Fixed by rendering after `setModel`. A second bug (number step blocking the inspector's save) fixed with `step="any"`.

## Not verified

- A real iPad (touch, pinch, the bottom errors panel).
- The database: `supabase/001_m3dxc_certainty.sql` is test SQL only, not run against the project.
- The model critic: not built.
- Research: sources from search results; the Anadarko diorama date is unresolved (1949 vs 1950); the Cheyenne and Arapaho contact details conflict across sources and must be confirmed by phone; the museum-studies claims need a book-length source before they are quoted publicly.
- The story's claims are sourced or marked as scene choices; claim c2 (women packing camp) is applied by analogy from a Colorado Ute source and needs checking.

## Decisions (see schematic §7–9)

- Track B, paper and ink. Inches, Z up. Certainty as a percent per part.
- Round limits: 4 per round; stop after 2 rounds without a win; no time cap; round cap optional.
- Terminology: "Native nations" or the nation's name, not "Indians", in new text.

## Next

1. Jimmy confirms the tribes' contact, sends the draft letter, and answers `convo v0.3.md`.
2. Reviewers' answers go to `private/`; close each consultation flag with its note.
3. Jimmy copies the SQL by hand; device test on an iPad.

## Round 5 (2026-11-18): rollback and the rule for density

- Jimmy: no objects added for the sake of adding objects. Roll back the round 4 fillers. Density means more detail in the existing objects. The diorama must read correctly first (lodge, horse, person).
- Found: the scale was wrong (horses about 11 ft, people about 12 ft at 1 in = 2 ft). Fixed to real sizes.
- Built: lodges from cover, four leaning poles and a door; horses from a barrel body, neck, head, muzzle, ears, tail and four legs; people from torso, arms, head and hair; travois and fire ring with more parts.
- Engine and viewer now support rotation, and the lowest point of a rotated part is checked.
- Next pass (only when asked): bluff, struck cover and travois loads from more parts.

## V2 (round 7, 2026-11-18)

- Archived V1 (`archive/Oklahoma diorama V1/`, commit f8d87b8). Closed PR #195 unmerged. A tag could not be pushed (proxy refuses tags).
- Gate removed. Lofted meshes for horses and people (`js/core/loft.js`, 7 tests). Faces: approximate general features, no portraits (Jimmy's decision, round 6).
- Home (`index.html`), studio (`studio.html`), library on this device, cloud client for `m3dxc_scenes` (owner only, sign-in by email code to existing accounts). SQL not applied.
- Not tested live: the cloud sign-in and save (needs a code from email). Not tested on an iPad.
