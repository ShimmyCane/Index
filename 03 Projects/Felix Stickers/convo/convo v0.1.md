# Felix Stickers — Convo v0.1

**Project:** Felix Stickers (page title proposed: Creature Lab)
**Round:** 1 (started by `/start-project`, 2026-11-23)

## What we've agreed so far

- **Purpose:** a warm, tactile sticker playground for young children. One central creature, a sticker tray, free placement, rotation, a simple save.
- **Tactile first:** peel → drag → twist → press. No zoom, no browser gestures.
- **Float, then press:** release floats the sticker; a press commits it. (Jimmy's edit to the concept.)
- **Local data first:** no database, no accounts, no AI, no sound in the first build.
- **Test question:** does it feel magical or like dragging images around?
- **Feedback notes** in ⚙️ from the first build, stored on the device.
- **Gesture lock:** no pinch zoom, double-tap zoom, pull-to-refresh or long-press menus; Home Screen app mode recommended. iOS's edge-swipe back in Safari cannot be disabled by a page; the page will say so.

## Questions

Answer inline under each number. Recommended answers are marked; "go with the recommendation" is a valid answer.

1. **Name.** The folder is "Felix Stickers"; the concept calls the page "Creature Lab – Sticker Playground".
   - (a) Folder "Felix Stickers", page title "Creature Lab" *(recommended)*
   - (b) Use "Felix Stickers" on the page too
   - (c) Other:
   - Answer:

2. **Track.** Family play (track A: few words, large touch targets, everything secondary in ⚙️)? *(recommended: yes, A)*
   - Answer:

3. **Artwork for the first build.** The reference sheets you attached (the PepperCut sticker sheet, the Scribble Stickers sheet, the "Create Your Monster" parts sheet) look like commercial or licensed artwork. This repo is public, so they cannot be committed here, and I will not trace them.
   - (a) I draw the creature and about 20 stickers as simple SVG shapes in the same warm pastel style; you supply your own cut-out PNGs later for the real version *(recommended)*
   - (b) You give me images you own or generated for this purpose, and I use them (kept out of git if they are not yours to share)
   - (c) Other:
   - Answer:

4. **Tray.** One tray, scrollable, with about 20 stickers *(recommended)*, or three tabs (Parts / Accessories / Decorations, as in the concept)?
   - Answer:

5. **Peel feel.** Build the peel (a visible corner that lifts with a curl, then detaches and follows the finger) in the first build *(recommended)*, or a simple press-and-drag from the sheet first and add the peel later?
   - Answer:

6. **Save.** What does "Save My Creature" do in the first build?
   - (a) Keeps the composition on the device and lists it in My Creations; can be reopened and edited *(recommended)*
   - (b) Makes a picture the child can keep or share
   - (c) Both
   - Answer:

7. **Gestures and Home Screen.** Accept the gesture lock as described in `schematic.md`, and ask the child's grown-up to add the page to the Home Screen (with a short note in ⚙️)? *(recommended: yes)*
   - Answer:

8. **Gear.** Keep the Rhythm Sticks behaviour: a small circle in the lower right shows the gear, and it fades after a while *(recommended)*, or keep the gear always visible but faint?
   - Answer:

9. **Undo and Reset.** Undo on the bottom bar (no penalty, one step back) *(recommended)*. Reset inside ⚙️ with a "Are you sure?" step? *(recommended: yes)*
   - Answer:

## Notes

- This is a playground, not a game (no score, no goal), so `game-controls` is not applied. The gear rule still follows `settings_gear.md`.
- Database, AI generation and sound are parked for later rounds.
