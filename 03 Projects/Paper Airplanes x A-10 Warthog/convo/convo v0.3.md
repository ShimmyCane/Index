# Convo v0.3 — Jimmy's answers, and what they change

Date: 2026-11-18. Answers to Q1–Q9 in `convo v0.1.md` and `convo v0.2.md` (Jimmy answered inline there; this round records them in one place and sets the build).

## Answers

- **Q1 (reference page access):** skip.
- **Q2 (floppy game):** yes, it's **A-10 Tank Killer**. There were missions and timing, but the fun part was free play: flying around shooting targets.
- **Q3 (who plays, score):** single player first. Score is not important.
- **Q4 (glider):** yes. A glider mode with no shooting and no killing is fine. Later, other models will be imported; for now, the classic paper airplane.
- **Q5 (view):** a third-person (chase) shooter mode.
- **Q6 (remix skill home):** run from the Index nursery as its own sub-project; move it out later.
- **Q7 (view for this version):** chase mode only.
- **Q8 (32 KB):** not important. It was only a way to find the repo.
- **Q9 (remix seen on Reddit):** https://github.com/Icy-Cat/fighter-jet-eject (the earlier LeePillWoo repo is not the one).

## Controls (Jimmy's spec, saved as the skill `game-controls`)

- iPad first. Default: **drag relative to the centre** of the screen. Hold above the middle and the nose goes up; left of the middle and the plane turns left. A setting turns this off and shows a **joystick in the lower left**, sized as a percentage of the width.
- Actions (fire, boost, and later loop or missile) are **buttons in the lower right**, just above the settings button.
- When there are action buttons, the **settings button moves to the upper right** and **fades out after two seconds**. Tapping the upper right brings it back.

## Facts about the reference (fighter-jet-eject)

- Standalone export of the **UI8 Forge** fighter component (`fighterv2`). Its README links the original (remix.ui8.ai/fly) and the announcement.
- **No LICENSE file.** The game code and sound files are UI8's, and the README says they are unchanged from the Forge project. So nothing from it is copied: no code, no sound, no art. It is a reference for what to build.
- Technique seen (from its README and `src/lib/voxel-sprite.ts`): software renderer on a Canvas 2D pixel buffer, sprites built from stacked slices, post-processing, WebGL only for flame, touch and gamepad support.

## What this round builds (Q7: chase mode)

- Third-person chase camera behind the plane, with a perspective ground.
- Drag-relative steering with the joystick alternative; FIRE and BOOST buttons lower right; gear moves to the upper right and fades.
- Free play: targets keep coming, no mission end. Score shown small.
- Glider mode: rings, no guns, same chase camera.
- Still to come: the plane drawn as stacked slices (the flat rear-view sprite stays for now), and imported models.
