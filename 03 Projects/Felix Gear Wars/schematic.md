# Felix Gear Wars — schematic

**Track:** A. Family play (Felix plays on the iPad, landscape).
**Status:** MVP 0.1.0 (headless-tested, not device-tested). All answers from `convo/convo v0.1.md` are built. Open questions in `convo/convo v0.2.md`.

## Track defaults

| Setting | Felix Gear Wars |
|---|---|
| Words on screen | few, with icons; story card words rise with the level (reading tiers) |
| Options visible | pegboard, tray of three gears, battlefield, Start, Undo, speed, pause |
| ⚙️ holds | sound and music, speed, Quick game, follow camera, reading, art style, levels, testing (+25 coins), notes, family sign-in, errors |
| Panels | collapsible with ▸/▾ (⚙️ sections) |
| Palette | rich colour in five historical styles, manuscript by default |
| Database | device first; family table `fgw_notes` for notes only (SQL written, not applied) |
| Skills used | `ipad_website`, `settings_gear`, `feedback_notes`, `smoke_test`, `project_track` |

## The game (as built)

- **Goal.** Enemies (the Rust Horde) walk from their fortress on the right toward our wall on the left. Each enemy that gets through costs a life (a boss costs 5). Lives start at 20 and grow by one per level. Win by holding the road through every wave, or by knocking down the enemy fortress with the fighters that reach it. Free-for-all has no end except losing.
- **Screen.** A pegboard on top (7×3 growing to 9×4), a tray of three gears beside it, the battlefield below. The battlefield is two screens wide (drag to pan, a minimap to jump, and the view follows the fight). The fortress is on the second screen.
- **The heart.** Fixed at one spot per level. It turns once every 1.6 s. A mark passes its four sides (east, south, west, north); each side that touches a gear gives that gear and its whole chain one tick. A gear reached from two sides (a loop) gets two ticks per turn. Gaps (holes) and dormant bonus gears (greyed, locked) force the layout; a dormant gear wakes when a chain reaches it.
- **Gears.** A fighter gear needs a few ticks (3 to 6, down by one per merge level, never below 1) and then a fighter pops out, tumbles to the ground, gets up and marches. Two same gears side by side each make their own fighter. Dropped on each other they merge: a stronger fighter (about 2.2× per level) and fewer ticks. Levels 1 to 4. Multiplier gears make nothing: they pass ticks on, times 1, 2, 4 or 8. Special gears: Lightning, Shuriken, Rockets.
- **Coins.** A level starts with coins. Every gear costs coins; every enemy beaten pays coins. A refresh of the tray costs 10. Selling a gear gives half its price. Undo reverses placing, moving, merging, selling and refreshing.
- **Fighters and counters.** Spearman (beats knights), Archer (beats spearmen and fighters from far away), Fighter (shield, beats archers and mages), Assassin (hunts the back line), Knight (charges, beats archers and mages), Tank (armour; magic fears nothing less), Mage (burns armour, hits groups), Catapult (huge range, hits groups, cannot hit close). The battle is a free-for-all once it starts; gears are the only strategy.
- **Campaign.** 8 chapters × 3 levels. Each chapter brings one fighter; the third level ends with a boss, a 3× scale enemy with far more health and attack. Specials arrive in chapters 3, 5 and 7.
- **Stars.** 3 stars for losing 10% of lives or fewer, 2 for 40% or fewer, else 1. After a failed try, the next try gives +20 coins (up to +60). Unlock: a level opens when the one before has at least one star.
- **Story and reading.** Each level opens with a story card in three reading tiers (picture and caption; short sentences; a paragraph). Auto picks the tier by level; ⚙️ can force one.
- **Art styles.** Illuminated manuscript (default), Bayeux tapestry, woodblock print, Art Nouveau, stained glass. A style is a colour filter, line weight, border and texture. Research in `research/art_styles.md`.
- **Sound.** Web Audio only: gear ticks, pops, thuds, clangs, arrows, bolts, stones, booms, lightning, rockets, coins, horns, fanfares; a looping tune that is calm while building and drums in for battle.

## Screen (iPad landscape)

```
┌ ♥ 20  ● 96   Chapter 1 · Level 1   next wave ▬▬   [Start][↶][×1][⏸][⌂] ┐
│ ┌──── pegboard (gears + heart) ────┐ ┌ tray: [gear][gear][gear] ───────┐ │
│ │  ○  ○  ⚙  ○  ○  ○  ○             │ │ [↻10]  tips on the selection     │ │
│ │  ○  ⚙ ❤  ⚙  ○  ○  ○             │ └──────────────────────────────────┘ │
│ └──────────────────────────────────┘                                      │
│ 🏰 fighters march → ← the Rust Horde            (two screens wide) 🏯     │
│ [minimap]                                                              ⚙️ │
└───────────────────────────────────────────────────────────────────────────┘
```

## Files

`index.html`, `css/style.css`, `js/data.js` (units, chapters, stories, levels), `js/sim.js` (rules, no DOM), `js/art.js` (all drawing and styles), `js/audio.js`, `js/game.js` (screen, input, camera, map, story, results, ⚙️), `js/notes.js`, `js/family.js`, `tools/balance_sim.js`, `research/`, `supabase/`.

## Feedback notes

⚙️ → Notes for improvement. Each note is saved with the level, the wave and the time on the device, and is also sent to `fgw_notes` when signed in to the family database. SQL: `supabase/001_fgw_notes.sql` with `test_` and `verify_` files; nothing is applied until Jimmy asks.

## Testing

- `node tools/balance_sim.js all 10`: unit-against-unit matrix and a bot playing all 24 levels. Report: `research/balance.md`.
- ⚙️ → Testing → +25 coins per tap.
- Headless browser check (see `04 AI/Felix Gear Wars/brief.md`).
