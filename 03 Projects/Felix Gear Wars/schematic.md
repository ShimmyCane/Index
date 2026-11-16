# Felix Gear Wars — schematic

**Track:** A. Family play (Felix plays on the iPad). To confirm in `convo/convo v0.1.md`.
**Status:** idea. Questions open in `convo/convo v0.1.md`.

## Track defaults

| Setting | Felix Gear Wars |
|---|---|
| Words on screen | few, with icons (gear values as numbers and pictures) |
| Options visible | the pegboard, the battlefield, Start wave, Undo |
| ⚙️ holds | sound, speed, Quick Game, chapter select, notes, database check, Show errors |
| Panels | collapsible; the gear tray and info panels close on a small screen |
| Palette | pastel / family look, rich and graphic |
| Database | device storage first; Family project only if progress must follow Felix across devices |
| Skills | `ipad_website`, `settings_gear`, `feedback_notes`, `smoke_test` |

## The idea (from Jimmy, 2026-11-16)

- **Defend the base.** Enemies come from one side of the screen toward the base on the other. Each enemy that gets through takes one life. Start with about 20 lives.
- **Pegboard up top.** Gears sit on pegs in an orthogonal grid. A **heart gear** turns on its own and drives the gears touching it; gears that touch each other turn together. No friction: adding gears to a chain never slows it.
- **Four touch points.** The heart has four sides (N, E, S, W). Each time the heart's mark passes a side with a gear, that gear (and its chain) gets a tick. A heart with gears on all four sides gives four ticks per turn.
- **Gears make fighters.** Each gear has a value: the number of heart ticks it needs to make its fighter. When it completes its turn, a fighter pops out of the gear, falls to the ground, gets up and marches toward the enemy side. A fighter that crosses the far edge disappears (an enemy base is optional).
- **Merging.** Two gears of the same kind and level, side by side, work together; dropped on each other they merge into a stronger gear: a stronger fighter, and fewer ticks per fighter, down to 1 tick at most.
- **Special gears.** Multiplier gears speed up their chain. Linking gears join chains (to confirm).
- **Fighters (first list):** spearman, archer, assassin, fighter, tank, mage, knight, catapult, and more.
- **Campaign:** 8 chapters × 3 levels. Each chapter introduces a new fighter for Felix, and the same kind on the enemy side.
- **Graphics come first.** Articulated, animated creatures: arrows that arc, knights that gallop, catapult stones, falling and getting up, hit sparks. Pretty and lively.

## Screen (first sketch, iPad landscape)

```
┌──────────────────────────────────────────────┐
│ ❤️ 20   ⚙ coins   Chapter 1·1   wave 2/5  ↶  │
│ ┌────────── pegboard (gears + heart) ──────┐ │
│ │  ○  ○  ⚙  ○  ○  ○                         │ │
│ │  ○  ⚙ ❤️ ⚙  ○  ○      [gear tray]         │ │
│ │  ○  ○  ⚙  ○  ○  ○                         │ │
│ └───────────────────────────────────────────┘ │
│ 🏰 ← ← ← ← battlefield (side view) ← ← ← 👹   │
└──────────────────────────────────────────────┘
                                          ⚙️
```

## Tech

Plain HTML/CSS/JS, one canvas for the battlefield and one for the pegboard (or one shared canvas), no build, GitHub Pages. Creatures drawn in code from jointed parts (body, head, limbs, weapon) with simple animation cycles (walk, attack, fall, get up, hit). Web Audio for gear clicks, pops, arrows, clashes, win fanfare.

## Feedback notes (first increment)

- "Notes for improvement" box in ⚙️. Each note saved with the level (chapter·level), the wave and the time.
- Read notes back in the same panel.
- Stored on the device first. A family table `fgw_notes` only if Jimmy wants notes across devices (`supabase_link.md`, model `03 Projects/中文笔画/supabase/001_zhbh_notes.sql`).

## Open questions

See `convo/convo v0.1.md`.
