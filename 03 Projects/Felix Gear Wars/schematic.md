# Felix Gear Wars — schematic

**Track:** A. Family play (Felix plays on the iPad, landscape).
**Status:** MVP 0.6.0 (headless-tested, not device-tested). Version 0.6.0: a fun curve that sizes every wave, gear prices that creep up, stronger castles and towers with a rebuild rule, six champions from the boss gear. Version 0.5.0: eight cultures with a ★ specialty fighter (+25%), gears slowed and balanced by power, new difficulty tuning. (0.4.0: boss gear, smooth heart and gears, 50-soldier cap, level flourishes, castles and towers.) Answers from `convo/convo v0.1.md` and `convo v0.2.md` are built, including eight art styles with culture fighters and narrated story cards.

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

- **Goal.** Enemies (the Rust Horde) walk from their fortress on the right toward our wall on the left. Each enemy that gets through costs a life (a boss costs 5). Lives are 20 plus 5 per chapter (25 in chapter 1, 60 in chapter 8), and the waves expect you to lose a good share of them. **The level is won when the enemy fortress falls**; waves keep coming until then. Free-for-all has an unbreakable fortress and ends only when the lives run out. The game starts easy (smaller waves, weaker foes).
- **Screen.** A pegboard on top (7×3 growing to 9×4), a tray of three gears beside it, the battlefield below. The battlefield is one screen wide in chapters 1 to 3, one and a half in chapters 4 and 5, and two from chapter 6 (drag to pan, a minimap to jump, and the view follows the fight). The fortress is at the far end. At most 50 soldiers fight on each side.
- **The heart.** Fixed at one spot per level. It turns smoothly, once every 3.2 s (⚙️ has a Heart speed slider, ×0.5 to ×4). Each quarter turn is one tick, shared out continuously: every gear that touches the heart on a side, or is chained to it, fills a little all the time, and its ring shows how full. A gear reached from two sides (a loop) gets two ticks per turn. Gaps (holes) and dormant bonus gears (greyed, locked) force the layout; a dormant gear wakes when a chain reaches it.
- **Gears.** A fighter gear needs quarter turns of the heart (the spearman 12, the archer 12, the fighter 17, the assassin 16, the knight 20, the mage 18, the tank 30, the catapult 36; each merge level needs 8% fewer) and then a fighter pops out, tumbles to the ground, gets up and marches. Two same gears side by side each make their own fighter. Dropped on each other they merge: a stronger fighter (2.2× per level) a little sooner, which is about 20% better than two gears side by side. Levels 1 to 4. **Every gear is balanced by power:** attack, defence and health per minute are about the same for every fighter, so the catapult is three times slower than the spearman, the tank two and a half times (`node tools/balance_sim.js power`). Gears are four to ten times slower than in 0.3.0, so a multiplier no longer floods the screen. Multiplier gears make nothing: they pass ticks on, times 1, 2, 4 or 8. Special gears: Lightning, Shuriken, Rockets. **Boss gear** (from chapter 2, 120 coins): a purple gear with a crown that needs 100 heart turns (⚙️ ratio 10 to 200), then a champion, a giant of the newest fighter, steps out. **Level flourishes:** level 2 a gold rim and studs, level 3 jewels and a golden tint, level 4 golden rays and twinkles; the fighters wear the matching ring, glow and stars.
- **The fun curve (0.6.0).** Each wave is sized when it launches: Felix's strength now (fighters alive plus what his gears will make before the wave arrives) times a target ratio on a hill: 0.4 at the start, 1.1 at the **fun peak (default 3 minutes)**, then easing off to nothing at the **fade time (default 7 minutes)**, after which the Horde loses heart and its fortress crumbles, so a level lasts about 7 minutes at most. With 10 gears on the board the waves are big enough to be a challenge; with 3 they are small. The boss comes at the peak. ⚙️ **Fun curve** has Fun peak, Level fades and Challenge sliders, an explanation, and a small plot; a little curve at the bottom left of the game shows where Felix is on the hill. Free-for-all keeps growing instead.
- **Prices (0.6.0).** A level starts with a fixed purse (135 coins on level 1, 360 on the last), and each gear on the board raises the next gear's price (`creep`), so the number of gears you can afford by the end follows the expected size of the Horde's last wave (about 0.8 gears per opponent: 4 gears on level 1, 22 on the last level). Merging or selling lowers the price again.
- **Champions (0.6.0).** The boss gear makes a random champion: Dragon (flies, breathes fire), King (rallies and heals), Felix the Cart (rolls through the enemy), Griffin (flies, dives on the back line), Golem (stomps and slows), Unicorn (heals). `research/champions.md`.
- **Defences.** Each castle shoots arrows and stones at the other side, as hard as 5 fighters on the first level and 10 on the last (ranges shrink on short maps). From chapter 4 each side also has a tower at 10% (arrows) and at 25% (stones) of the way across (not in chapters 1 to 3). Soldiers stop to attack towers. A destroyed tower is rubble; it is rebuilt (a growing scaffold, 45 s) only once its owner has pushed the enemy back more than 320 px beyond it. Your castle cannot be destroyed (enemies cost lives instead).
- **Coins.** A level starts with coins. Every gear costs coins; every enemy beaten pays coins. A refresh of the tray costs 10. Selling a gear gives half its price. Undo reverses placing, moving, merging, selling and refreshing.
- **Fighters and counters.** Spearman (beats knights), Archer (beats spearmen and fighters from far away), Fighter (shield, beats archers and mages), Assassin (hunts the back line), Knight (charges, beats archers and mages), Tank (armour; magic fears nothing less), Mage (burns armour, hits groups), Catapult (huge range, hits groups, cannot hit close). The battle is a free-for-all once it starts; gears are the only strategy.
- **Campaign.** 8 chapters × 3 levels. Each chapter brings one fighter; the third level ends with a boss, a 3× scale enemy with far more health and attack. Specials arrive in chapters 3, 5 and 7.
- **Stars.** 3 stars for losing 10% of lives or fewer, 2 for 40% or fewer, else 1. After a failed try, the next try gives +20 coins (up to +60). Unlock: a level opens when the one before has at least one star.
- **Story and reading.** Each level opens with a story card in three reading tiers (picture and caption; short sentences; a paragraph). Auto picks the tier by level; ⚙️ can force one.
- **Cultures.** ⚙️ Culture: French (default, illuminated manuscript), Spanish, Aztec, Indian (Mughal miniature), Japanese (woodblock), Chinese, Persian, Egyptian. A culture sets the look (colour filter, line weight, border, texture), the fighters' names, headgear and blades (assassins become ninjas in Japan), and one **★ specialty fighter with +25% attack and health**: French Knight, Spanish Tank, Aztec Fighter, Indian Catapult, Japanese Assassin, Chinese Archer, Persian Mage, Egyptian Spearman. The star shows on the gear (tray and board), above the fighter, and in the info card. Three **storybook looks** (tapestry, Art Nouveau, stained glass) have no culture and no star. Research in `research/art_styles.md`.
- **Story narration.** A narrator (Kokoro, the voice Adventure uses) reads each story card in the tier shown; ⚙️ Read aloud: Auto, Tap or Off; a Listen button on the card. 75 clips in `audio/` (8.5 minutes, 3 MB), made by `tools/make_voice.py`.
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
