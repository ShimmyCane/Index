# Felix Stickers — schematic

**Track: A. Family play** (proposed, to confirm in `convo/convo v0.1.md` Q2)
**Status: MVP 0.1.0** (built 2026-11-23 after round 1 answers; headless-tested at three sizes, not yet device-tested). Answers in `convo/convo v0.1.md`. Written 2026-11-23 from Jimmy's concept ("Creature Lab – Sticker Playground") and three reference images.

## Purpose

A warm, tactile sticker playground for young children on an iPad. One central creature, a single sticker at a time, placed playfully: peel it from the sheet card, drag it, twist it, press it down. It should feel like playing with real stickers, not like dragging pictures around.

The first build tests one question only: **does peel → move → rotate → press feel magical, or like dragging images?**

## Scope of the first build (proposed)

In:
- One full-screen page with one creature (drawn in SVG; see `convo v0.1.md` Q3).
- About 20 stickers, one at a time on the sheet card (round 2: no row or bank).
- Peel, drag, two-finger rotate, press to stick. Overlap allowed.
- Undo (kid-friendly, no penalty) and Reset (in ⚙️).
- A simple Save: the composition is kept on the device and listed in My Creations (Q6).
- ⚙️ gear (lower right) with options, the Notes for improvement box, and the error panel (opt-in).
- Locked gestures (see below).

Out (parked on purpose):
- AI sticker generation, accounts, sound, the family database, 3-D decals, sticker-sheet detection from photos.

## Functional flow

```mermaid
flowchart TD
    A[Source Images] --> B[Page Processor]
    B --> C[Background / Main Creature]
    B --> D[Sticker Detection & Masks]
    D --> E[Individual Sticker Assets]
    C --> F[Game Page Package]
    E --> F
    F --> G[Creature Lab Engine]
    G --> H[Peel Gesture]
    H --> I[Move / Rotate]
    I --> J[Press / Place]
    J --> K[Finished Creature]
    K --> L[Save Locally]
    L --> M[Future Family Database]
    M --> N[Future 3D Decal App]
```

For the first build, the page processor is replaced by hand-made assets (a JSON list of stickers with image path, mask path and size). Detection comes later.

## Screen layout

| Area | Contents |
|---|---|
| Top | Title "Felix Stickers – [sheet name, 3+ words]" (convo Q1, Q4, Q11), then the ⚙️ settings button, then the Undo button next to it. Undo is on by default; a toggle in ⚙️ hides it. |
| Play area | Background + creature. Free placement, overlap allowed. Takes most of the screen. |
| Sheet | Walking Through the Woods, shown as the reference picture itself (same layout, same pixels), fitted to the play area. Each piece sits on its box in the picture. Peel a piece (its cutout is used only when peeled) and paste it back onto the body, on the same sheet; a peeled piece leaves a white empty space. Reset puts them back. (convo v0.6–v0.8) |
| Save | "Save My Creature" (large purple button) and My Creations, on the bottom bar (convo Q6a). |
| ⚙️ | Lower right, fades after a while, shows on a circle stroke (convo Q8). Undo toggle, Reset (with "Are you sure?"), Notes for improvement, errors (opt-in), the home-screen note, database check later. |

Track A rules: few words, icons with short labels, large touch targets (48–68px), warm pastel palette (vanilla, sage, peach, mint, coral), 2.5–3.5px dark lines, offset shadows.

## Interaction rules

| Action | Result |
|---|---|
| Pull a sticker corner | Sticker lifts from the sheet with a small curl |
| Keep pulling | Sticker detaches and follows the finger |
| Drag | Moves across the scene |
| Two fingers twist | Rotates |
| Release on canvas | **Sticker floats** (stays movable, can be picked up again) |
| Press (tap) on a floating sticker | **Commits**: it sticks for this session |
| Overlap another sticker | Allowed |
| Sticker used up | Empty space remains on the sheet |
| Undo | Removes the last action (peel, move, rotate, press) |

**Change from the concept (Jimmy's own edit, kept):** placement is not irreversible on release. Release floats the sticker; a press commits it. This is what real sticker play feels like.

## Gesture lock (iPad)

The tactile play must not be taken over by the browser. The page:
- sets `touch-action: none` on the play area and sheet card, and `overscroll-behavior: none` on the page;
- uses a viewport with `user-scalable=no` and `maximum-scale=1`;
- blocks `gesturestart`, `gesturechange`, `gestureend` (iOS pinch zoom), double-tap zoom, long-press callouts, text selection, the context menu and pull-to-refresh;
- runs as a Home Screen app (`apple-mobile-web-app-capable`), which removes most of Safari's chrome.

**Limit to show, not hide:** iOS Safari's left-edge swipe to go back cannot be turned off by a web page. In a Home Screen app it is much less likely to fire, and the page keeps its touches on the canvas near the edges. The page will say so in ⚙️ ("Add to Home Screen for the full experience").

## Data architecture

Three systems, kept apart:

**A. Content** — background, creature, sticker images, masks, sizes, metadata. One sheet in `js/sheet.js` (a classic script, so it works from file:// and offline): the sheet name and 20 hand-drawn SVG stickers, each with a label. Read-only.

**B. Game state** — available stickers (per sheet), placed stickers (id, x, y, rotation, scale, z-order), undo history (last 50 actions), saved composition. Held in memory; saved creations in device storage (localStorage, in a try/catch; the page works if storage is blocked).

**C. Family library (later)** — read/write for saving creations; read-only for other apps to fetch sticker assets and compositions. Not in the first build. The save and load functions go through one small interface (`library.save(composition)`, `library.list()`, `library.load(id)`) so the database can be plugged in later.

## Feedback notes

Per the nursery convention, the first build includes:
- a notes box in ⚙️ labelled "Notes for improvement", saving each note with the item it is about (which sticker or screen), the version and the time;
- a way to read the notes back in ⚙️;
- notes stored on the device only (no database in this round). Built from `02 Refs/Skills/feedback_notes.md`.

## Database

Round 19 (2026-11-25): the Family project gets `fs_creations` and `fs_notes` (SQL in `supabase/`: `test_001_fs`, `001_fs_family`, `verify_001_fs`, pasted by Jimmy). Signed-in saves send a copy; the device copy is always kept first. Sign-in is in the ⚙️ panel, with the family login (publishable key only, in `js/config.js`). **Before anyone signs in: close open sign-up in the Family project** (see `04 AI/Supabase/access/README.md`), because the policies let any signed-in account read and write.

First build (for reference): not in the first build. When notes or creations must persist across devices, plan it with `02 Refs/Skills/supabase_link.md` (Family project, prefix `fs_`, RLS on, publishable key only, SQL written first and applied only when Jimmy asks).

## Files (planned)

`index.html` (page, creature drawn inline as SVG), `css/app.css` (palette, gesture lock, sheet card, gear, panels), `js/sheet.js` (the sheet), `js/app.js` (engine: peel, move, two-finger rotate, press, undo, save, notes, errors, gear), `schematic.md`, `CLAUDE.md`, `convo/`.

## Test sheets (round 18, 2026-11-25)

A test sheet is one uploaded picture cut into a sheet. It is for Jimmy's device only (convo v0.1 Q10), so its files live in a git-ignored `private/<sheet>/` folder and the public page never asks for them.

- **Thanksgiving Table Test 1**: `private/thanksgiving/`. A gingham tablecloth as the main body, and 12 features: two plates, a roast turkey, a pumpkin pie, a glass of juice, an autumn bouquet, a cornucopia, a knife, a fork, a napkin, a pilgrim hat and a maple leaf. This is 12 features, above the 5–10 rule above, because Jimmy asked to use what is on the picture. The tablecloth is drawn under the features (`mainFirst`), so a feature on its edge can still be tapped.
- **Open it**: `index.html?sheet=thanksgiving`. `js/sheet_select.js` loads `private/thanksgiving/sheet.js` only when that address is used. Without it, the page is the Woods sheet, as before.
- **Files**: `base.png` (the picture with every piece painted white), `pieces/pNN.png` (one transparent cut-out per piece), `pieces.json`, `overlay.png` (boxes to check by eye), `sheet.js` (the sheet data, with a `native` block for its art).
- **Cut by**: `02 Refs/Skills/scripts/sticker_cut.py`. Add a sticker with `/make-sticker <Sticker Name>` (`02 Refs/Skills/make_sticker.md`).
- **Peel needs HTTP.** On a `file://` page Chromium blocks the pixel read a peel uses, so the peel does nothing. Serve the project folder from a local server, for example `python3 -m http.server 8765` in `03 Projects/Felix Stickers/`, and open `http://<computer>:8765/index.html?sheet=thanksgiving`. An iPad on the same Wi-Fi can open the same address. The Pages site does not carry `private/`.

App changes this round: sheets can carry their own art (`sheet.native`), and a sheet can draw its main body first (`mainFirst`). Woods is unchanged.

## Round 9 change (Jimmy, convo v0.9)

The art is AI-generated and free to use, so it is committed in `art/`. The ⚙️ panel credits ChatGPT (pictures) and Claude (framework).

## Round 8 change (Jimmy, convo v0.8)

The sheet looks exactly like the reference picture, not a grid of cutouts. Cutouts are used only when a piece is peeled.

## Round 6 change (Jimmy, convo v0.6)

New sheet: Walking Through the Woods (replaces the Little Monster Tea Party sheet). Plain sage body; eight woods features.

## Round 5 change (Jimmy, convo v0.5)

The features are the elements identified on the reference sheet, redrawn as lookalike cutouts (not traced; the reference stays out of the repo). Ten features, within Jimmy's 5–10. The body starts on the sheet.

## Round 4 change (Jimmy, convo v0.4)

One sticker sheet, no bank. The whole play area is the sheet: peel a feature and paste it back onto the body on the same sheet.

## Round 3 change (Jimmy, convo v0.3)

The main sticker is a plain body. Eyes, noses, mouths and the rest are small features on the sheet, peeled onto the body. The pre-drawn creature with its face is gone. A grabbed sticker comes to the front. (The dashed outline was removed in round 4.)

## Round 2 change (2026-11-23, Jimmy)

No row or bank of stickers below. Each sheet is one sheet: a main sticker and 5–10 smaller ones, on one card in the play area. Peeled stickers land playfully tilted; an empty space stays on the sheet. See `convo/convo v0.2.md`.

## Build notes (0.1.0)

- Peel: a pull of 26px lifts any sticker on the sheet; it follows the finger. A release floats it, at a playful random tilt of up to 12°; a tap commits it. The space it leaves stays empty on the sheet.
- Undo: snapshots of the whole composition (last 50), so every action, including Reset and opening a creation, can be undone.
- Gear: lower right; shown on load and when the corner is touched; fades after 2.5s. The top-bar settings button opens the same panel.
- Storage: localStorage in a try/catch; the page shows "blocked" in ⚙️ Info and still plays.
- Gesture lock: touchmove, pinch, double-tap and the context menu are cancelled outside the panels; `touch-action: none` on the play area and sheet.
- Tests: headless Chromium at iPad landscape, iPad portrait and phone; no JS errors, no horizontal scroll, peel/press/undo/save/notes all pass. Not yet on a real iPad. Shared AI notes in `04 AI/Felix Stickers/`.

## Open questions

See `convo/convo v0.1.md`. Nothing is built until those are answered.

## Changes

- 2026-11-23: schematic written from the concept. Status idea.
- 2026-11-25 (round 20, centroid): the sticker turns about its centroid, found from its cut-out's alpha (the middle of the box if the pixels cannot be read). The turn keeps that point where it is, and the placed position is the centroid.
- 2026-11-25 (round 20, Jimmy's correction): the sticker must be moved before anything else. A tap does nothing and starts no countdown. Once it has been moved, a circle appears in the middle of the play area; a finger going round it turns the sticker (the same fuzz: 15° gives 5°, 1:1 from 45°). Letting go starts the half second; then the circle goes (the click) and the sticker can be brought down by a swipe. The swipe only rolls: it never turns the sticker, so sliding back along the way it was picked up leaves it unrotated (the old roll turned it 180°). Touching and letting go on the circle with no turn confirms it. Undo covers the whole portion. The circle's centre is the middle of the play area as asked; it can be moved to the sticker's own centre if that feels better.
- 2026-11-25: orientation is set first, then the roll. After the 1-second window, the first touch on the held curl is an aim drag: start to end sets the sticker's top (the curl turns live while you drag). The second touch only rolls it on: the angle is already set by the aim and stays put, however long the wait before the second touch. A drag under 12 px does not aim.
- 2026-11-26: settings > Sheets from this device. Pick one sheet's sheet.js and its .png files; they are read in the browser, never uploaded, and the sheet joins the bottom ◀ ▶ until the page is left. This is how the extra sheets reach the public Pages copy on Jimmy's device.
- 2026-11-26 (publish): Jimmy confirmed the Thanksgiving and Motor Home pictures are AI-generated (ChatGPT) and free to publish. Their pictures moved to `art/sheets/`, their sheet data to `js/sheets/`, and `index.html` loads them directly. `js/sheet_select.js` is removed. The public Pages copy now shows all three sheets.
- 2026-11-26: test mode removed. `index.html` always loads the extra sheets from `private/` (through `js/sheet_select.js`); the bottom ◀ ▶ leafs through Woods, Thanksgiving and Motor Home. The public Pages copy lacks the private files and shows Woods only.
- 2026-11-25: opening any test sheet (`?sheet=...`) now loads every test sheet too, so the bottom ◀ n / N ▶ can leaf through all of them. The plain page still has only Woods, so it shows no buttons.
- 2026-11-25: the held curl waits 0.5 second (was 1, then 3) before a touch carries it on; the aim and the roll-on follow straight after the aim.
- 2026-11-25: test sheet Motor Home Decoration added (private, `?sheet=motor-home`): a motor home as the main body and 20 features (bed, lantern, popcorn, guitar, sunglasses, map, cool box, picture, campfire, plant, camp chair, cat, sleeping mat, flamingo ring, pot, pan, mug, flashlight, books, pillow). Three stray slivers dropped; the mat and flamingo were split apart by eroding the mask.
- 2026-11-25: the held curl waits 1 second (was 3) before a touch carries it on. Two-finger turns are damped for small angles: 15° turns the sticker 5°, the ramp reaches 1:1 at 45°, and it is 1:1 beyond that (`fuzzTurn` in `js/app.js`).
- 2026-11-25: bottom bar gets ◀ n / N ▶ to leaf through the sheets (each sheet keeps its own stickers and undo; a held sticker blocks the switch with a short note). The ⚙️ button in the top bar is removed; the lower-right gear stays. A sticker pack page is planned for when there are more than 20 stickers; not built yet.
- 2026-11-25: Thanksgiving Table Test 1 added as a private test sheet (see Test sheets). `/make-sticker` skill added. Sheet art now comes from the sheet's own data. `js/sheet_select.js` added.
- 2026-11-23: round 1 answers recorded in `convo v0.1.md`. Single sheet, title with sheet name, settings and undo at the top. Q11 answered: each sheet has its own name (3+ words) in its data file; test sheets also carry a Test# id. Q10 answered: the uploaded sheets are for testing only, never published. Later: a core prompt for ChatGPT that turns an idea into a sticker sheet; its test outputs are named Test# (not built yet). No build yet.
