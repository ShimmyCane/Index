# Felix Stickers — AI brief

Status: MVP 0.1.0 (2026-11-23). Built from `03 Projects/Felix Stickers/schematic.md` after round 1 answers (`convo/convo v0.1.md`). Headless-tested at three sizes; not yet device-tested.

Key decisions:
- Track A, family play. One sheet, title "Felix Stickers – <sheet name, 3+ words>".
- Peel pulls 26px to lift; release floats; a tap commits.
- Undo next to the settings button, on by default; Reset in ⚙️ with an "Are you sure?" tap.
- Save My Creature keeps the composition on the device; My Creations lists, opens and deletes.
- Gear in the lower right, above the tray; the top settings button opens the same panel.
- Gesture lock for iPad; the edge swipe in Safari cannot be blocked by a page, so the page recommends Home Screen mode.
- Uploaded sheets are for local testing only (convo Q10). Art in the repo is hand-drawn SVG.
- Test sheets from the planned ChatGPT core prompt are named Test# (not built).

- 2026-11-25: test sheet "Thanksgiving Table Test 1" (private, in `private/thanksgiving/`, opened with `?sheet=thanksgiving`). Its 12 features are above the 5–10 rule, by Jimmy's request. The sheet's art is in its own `native` block; `mainFirst` draws the body under the features.
- Peel is blocked on file://: Chromium will not read the cut-out's pixels there. Test over HTTP (a local server).
- `/make-sticker <name>` adds one sticker from a picture (`02 Refs/Skills/make_sticker.md`); cutting uses `02 Refs/Skills/scripts/sticker_cut.py`.
- 2026-11-25 (round 20, centroid): the sticker turns about its centroid (from its cut-out's alpha), not a corner; the placed position is the centroid. GIF checked by eye.
- 2026-11-25 (round 20): rotation by a circle in the middle of the play area, after the sticker has been moved; click 0.5 s after let go; the roll only rolls (old 180° flip on reverse slide fixed). Headless: turn +30° → 25°, no turn → 0°, −45° → −45°.
- 2026-11-25: orientation by aim drag, then roll-on (two touches). Test: peel, wait 1.3 s, aim up-right (sticker turns to 36.9°), roll back: placed at rotate(36.87deg), committed. GIF checked by eye.
- 2026-11-25: held-curl wait 1 s; two-finger turn damped (15° → 5°, 1:1 from 45°). Rotation was not driven in headless tests; check on a device.
- 2026-11-25: bottom-bar sheet pager (◀ n / N ▶), shown when more than one sheet is loaded; top ⚙️ removed. Sticker pack page waits for more than 20 stickers.
- 2026-11-26 (publish): the Thanksgiving and Motor Home sheets are public: pictures in `art/sheets/`, data in `js/sheets/`, loaded by `index.html`. Jimmy confirmed the pictures are ChatGPT-generated and free to publish.
- 2026-11-26: settings > Sheets from this device loads a sheet's files from the device (no upload). Tested on a copy without private/: Woods, then Thanksgiving and Motor Home from the picker, pager reaches all three, no errors.
- 2026-11-25: family database wired (Family project, `fs_creations`, `fs_notes`). SQL written, **not pasted** (Jimmy pastes `test_001_fs`, then `001_fs_family`, then `verify_001_fs`). App tested against a mocked database only: sign-in, note sent with the family token, a failed write shows in errors, sign-out. Close Family sign-up before anyone signs in.
Next: device test on a real iPad (peel feel, two-finger twist, edge swipe), then the ChatGPT core prompt round.
