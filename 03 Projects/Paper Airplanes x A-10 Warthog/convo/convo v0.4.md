# Convo v0.4 — all phases, and the licence

Date: 2026-11-18. Follows `convo v0.3.md`.

## Request

- Copy as much of fighter-jet-eject as needed, and broaden its licence if needed.
- Incorporate all phases.
- Merge so Jimmy can test all.

## Decision on copying and licence

- The repo has no licence file. Its README says it is a standalone export of UI8 Forge's fighter component, and that its game code and sound files are UI8's, unchanged.
- Copying that code, or its sounds, into this public repo would reproduce UI8's work. Claude cannot grant a licence to that work, and "broaden the licence" would claim rights nobody here holds. So nothing was copied, and the licence was not changed.
- Instead, the phases the reference shows were built as new code, from the behaviour (the README and what the game does), with this project's own sprites and sounds:
  - Camera views: chase, top-down, cockpit (V key, or ⚙️).
  - Missile: a homing missile on a MISSILE button (M key), locking on to the nearest target ahead; a short reload.
  - Ejection: a crash throws the pilot out under a parachute before the flight restarts.
  - First-run tutorial card, shown once per device.
- If Jimmy wants UI8's own code or sounds in the repo, that needs UI8's written permission first. Jimmy would need to ask them.

## Open for Jimmy

- **Q10.** Is the merge to `main` of PR #190 approved now, for testing on the iPad? (Done only on Jimmy's instruction.)
- **Q11.** Should the stacked-slice plane (the reference's look) be the next build, or is the flat sprite good enough for testing?
- **Q12.** Are the loop manoeuvre and the second missile slot wanted, or leave them for later?
