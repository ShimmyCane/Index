# Felix Stickers — Convo v0.1

**Project:** Felix Stickers
**Round:** 1 (started by `/start-project`, 2026-11-23; answers added by Jimmy, same day)

## What we've agreed so far

- **Purpose:** a warm, tactile sticker playground for young children. One central creature, a sticker sheet, free placement, rotation, a simple save.
- **Tactile first:** peel → drag → twist → press. No zoom, no browser gestures.
- **Float, then press:** release floats the sticker; a press commits it. (Jimmy's edit to the concept.)
- **Track A, family play.** Yes.
- **One sheet, not tabs.** Title and settings at the top, undo next to settings, the sheet of stickers, the creature, a lower-right gear.
- **Local data first:** no database, no accounts, no AI, no sound in the first build.
- **Test question:** does it feel magical or like dragging images around?
- **Feedback notes** in ⚙️ from the first build, stored on the device.
- **Gesture lock:** no pinch zoom, double-tap zoom, pull-to-refresh or long-press menus; Home Screen app mode. iOS's edge-swipe back in Safari cannot be disabled by a page; the page will say so.

## Questions

Answer inline under each number. Recommended answers are marked; "go with the recommendation" is a valid answer.

1. **Name.** The folder is "Felix Stickers"; the concept calls the page "Creature Lab – Sticker Playground".
   - (a) Folder "Felix Stickers", page title "Creature Lab" *(recommended)*
   - (b) Use "Felix Stickers" on the page too
   - (c) Other:
   - Answer: **(b) Use "Felix Stickers" on the page too.** Name recorded; the page title is "Felix Stickers".

2. **Track.** Family play (track A: few words, large touch targets, everything secondary in ⚙️)? *(recommended: yes, A)*
   - Answer: **Yes, track A.**

3. **Artwork for the first build.** The reference sheets you attached (the PepperCut sticker sheet, the Scribble Stickers sheet, the "Create Your Monster" parts sheet) look like commercial or licensed artwork. This repo is public, so they cannot be committed here, and I will not trace them.
   - (a) I draw the creature and about 20 stickers as simple SVG shapes in the same warm pastel style; you supply your own cut-out PNGs later for the real version *(recommended)*
   - (b) You give me images you own or generated for this purpose, and I use them (kept out of git if they are not yours to share)
   - (c) Other:
   - Answer: **"Use those uploaded images first."** Recorded, but it conflicts with the public-repo rule. See question 10 before I use them.

4. **Tray.** One tray, scrollable, with about 20 stickers *(recommended)*, or three tabs (Parts / Accessories / Decorations, as in the concept)?
   - Answer: **A single sheet of stickers, no tabs.** Top of the screen: a title "Felix Stickers – [sticker sheet name, 3 or more words]", then a settings button, then an undo button next to it. Undo is on by default; a toggle in ⚙️ can turn it off.

5. **Peel feel.** Build the peel (a visible corner that lifts with a curl, then detaches and follows the finger) in the first build *(recommended)*, or a simple press-and-drag from the sheet first and add the peel later?
   - Answer: **Yes, build the peel in the first build.**

6. **Save.** What does "Save My Creature" do in the first build?
   - (a) Keeps the composition on the device and lists it in My Creations; can be reopened and edited *(recommended)*
   - (b) Makes a picture the child can keep or share
   - (c) Both
   - Answer: **(a).**

7. **Gestures and Home Screen.** Accept the gesture lock as described in `schematic.md`, and ask the child's grown-up to add the page to the Home Screen (with a short note in ⚙️)? *(recommended: yes)*
   - Answer: **Yes.**

8. **Gear.** Keep the Rhythm Sticks behaviour: a small circle in the lower right shows the gear, and it fades after a while *(recommended)*, or keep the gear always visible but faint?
   - Answer: **Yes, lower right, Rhythm Sticks behaviour.**

9. **Undo and Reset.** Undo on the bottom bar (no penalty, one step back) *(recommended)*. Reset inside ⚙️ with a "Are you sure?" step? *(recommended: yes)*
   - Answer: **Undo moves to the top bar, next to settings (see question 4), not the bottom bar.** Reset: "See above" was read as the placement change only, so Reset takes the recommendation: inside ⚙️ with an "Are you sure?" step. *(Jimmy to confirm if wrong.)*

10. **Using the uploaded sheets on a public page.** Your answer to question 3 is to use the uploaded images first. The repo and its GitHub Pages site are public, so anything in the page is published to everyone. These sheets look like other artists' work (PepperCut, Diane Alber, a monster parts pack), and I do not know their licences.
    - (a) Use them only on your own device for testing; they are not committed or published, and the public build uses lookalike art I draw *(recommended)*
    - (b) Publish them on the public page anyway; you confirm the licence or permission first
    - (c) Other:
    - Answer: **(a), only for testing.** The uploaded sheets stay on Jimmy's device for tests. They are not committed, not published and not in the public build. The public build uses lookalike art.
    - Later (new request, 2026-11-23): a core prompt Jimmy can paste into ChatGPT with an idea, to produce a sticker-sheet concept for testing. Its test outputs are named **Test#** (reading: Test1, Test2, … each one a test sheet made from the core prompt). Not built yet; the prompt will be written in a later round. Claude's reading to confirm: "Test#" names the test outputs, not the prompt itself.

11. **Sheet names for the title.** The title reads "Felix Stickers – [sticker sheet name, 3 or more words]".
    - (a) One name per sheet, written in the sheet's data file, so each sheet can have its own name *(recommended)*
    - (b) One fixed name for the first build
    - (c) Other:
    - Answer:

## Notes

- This is a playground, not a game (no score, no goal), so `game-controls` is not applied. The gear rule still follows `settings_gear.md`.
- Database, AI generation and sound are parked for later rounds.
