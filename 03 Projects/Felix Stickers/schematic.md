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

Not in the first build. When notes or creations must persist across devices, plan it with `02 Refs/Skills/supabase_link.md` (Family project, prefix `fs_`, RLS on, publishable key only, SQL written first and applied only when Jimmy asks).

## Files (planned)

`index.html` (page, creature drawn inline as SVG), `css/app.css` (palette, gesture lock, sheet card, gear, panels), `js/sheet.js` (the sheet), `js/app.js` (engine: peel, move, two-finger rotate, press, undo, save, notes, errors, gear), `schematic.md`, `CLAUDE.md`, `convo/`.

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
- 2026-11-23: round 1 answers recorded in `convo v0.1.md`. Single sheet, title with sheet name, settings and undo at the top. Q11 answered: each sheet has its own name (3+ words) in its data file; test sheets also carry a Test# id. Q10 answered: the uploaded sheets are for testing only, never published. Later: a core prompt for ChatGPT that turns an idea into a sticker sheet; its test outputs are named Test# (not built yet). No build yet.
