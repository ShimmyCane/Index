# Ole Bar Glide — AI brief

**Updated:** 2026-11-09
**What it is:** an original arcade bar game in the early-80s bartender genre (pour, slide, catch the empties, three breaks and the owner comes). Jimmy's nostalgia project; track A with a saloon mood.
**Status:** 0.3.0 (renamed Ole Bar Glide; shifts Morning→Night with 2→4 bars; X2 orders; 250 ms edge wobble and 100 ms early catch; Sound lab `synth.html`). Earlier: 0.2.0 (tips and SHOW TIME, bonus round every second round, looping tune, nursery link). Earlier: MVP 0.1.0. Headless smoke test passed (three sizes, zero console errors, no horizontal scroll, settings and notes survive reload, print hides ⚙️). A bot played nine rounds with no errors. Not tested on an iPad, with a real finger or with sound.

## Decisions
- Original name (Bar Glide), sprites and sound; genre mechanics only. Jimmy's working title named the original game.
- 320 × 200 canvas, sprites as text rows, a 3x5 pixel font, two themes (saloon, pastel). No images or sound files.
- Spank ending as asked, with a "telling off" option in ⚙️.
- A full mug that reaches the doorway is caught by a customer still in it (first version broke the glass, which felt unfair).

## Database
- Family project, prefix `bglide_`: `bglide_scores`, `bglide_notes`. Names were free on 2026-11-09 (read-only check). Rolled-back test passed on the live project (`RESULT: tables=2 scores=1 notes=1`). **Not applied**: Jimmy pastes `001` and sends back `verify_001`.
- Sign-in from the app not tested with a real account.

## Jimmy's answers (v0.1)
- He plays it himself; beer stays. Customer reaching the end stays a strike. Tips and bonus: yes. Slow + 5 glasses replace undo. Wants it energetic.
- Name answer "Old barb glide" read as "OK, Bar Glide"; confirmation asked in `convo v0.2.md`.

## Jimmy's answers (v0.2)
- Name Ole Bar Glide. Played round 1 on a device: big smile, but too fast to reach a tip. Wants 30 s relaxed start, a 250 ms grace on the empty mug, 2 bars to start, shifts through the day, two-drink orders, and a synth page for metallic sounds.

## Next
- Answers in `convo v0.3.md`; cut-off customers when he has thought it through.
