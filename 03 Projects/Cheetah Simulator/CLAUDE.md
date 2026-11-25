# Cheetah Simulator — Claude Code pointer

Purpose: a game where a child lives a cheetah's whole life, ten minutes a stage, and learns how cheetahs really live. The game's look and verbs grow up with the cheetah: cuddly cub to precise hunter. The world (place, weather, prey, rivals, people) changes each life.

Track: A. Family play

- Design: `schematic.md` · Facts: `research/cheetah-life-cycle.md`
- Q&A history: `convo/` (never compact; start a new version instead)
- AI notes: `04 AI/Cheetah Simulator/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (public repo, privacy)

Status: 0.3.0 (2026-11-25): Mum walks ahead and wags after a reunion (no reset); stage 1 zoomed with edge blur and slower movement. Next items are in `todo.md`. Earlier: 0.2.0. stages 1 (Den) and 2 (Little explorer) playable; skills to master per stage; cumulative stage clock; canvas first, all panels in ⚙️; Other games menu; gentle mode, notes, storage check. Later stages, the wiggle control and the AI helper are in `schematic.md` and `convo/convo v0.2.md`. Jimmy reviews each merged step.

How to run: `index.html` opens with a double-click (plain HTML/CSS/JS, no build). Felix control (drag from the middle) by default; joystick in ⚙️. Keyboard arrows or WASD also work. State for checks: `localStorage` key `cheetahSim.v1`.

Project rules:
- Facts marked ⚑ in `research/` are unchecked; verify before showing a number on screen. Show ranges, not exact figures.
- Honest about hunting, loss and death; Gentle mode only softens the telling.
- Public repo: first names only, no family details, no real saves. Notes and unlocks are device-first.
- Keep the style layer separate from the world and life rules, so the look can change without changing the game.
