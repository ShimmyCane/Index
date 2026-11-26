# Felix Gear Wars — brief

**Updated:** 2026-11-16
**Status:** MVP 0.6.0 (a fun curve sizes each wave, gear prices creep up, castles worth 5 to 10 fighters, tower rebuild rule, six champions from the boss gear; 0.5.0: eight cultures with a ★ specialty fighter +25%, gears slowed and balanced by power, retuned difficulty; 0.4.0: boss gear, smooth heart and gears, 50-soldier cap, level flourishes, castle and tower defences, one-screen early maps; before that eight art styles with culture fighters and story narration), headless-tested, not device-tested. `convo v0.1` and the quick answers of `convo v0.2` are built (fortress wins, lives +5 per chapter, easier start, heart speed slider). Round 3 added Persian, Egyptian and Chinese styles, culture names/headgear/blades, and narrated story cards (75 Kokoro clips).

## Goal

A gear-powered lane defense game for Felix on the iPad. A heart gear drives gears on a pegboard; each gear makes a fighter that drops to the battlefield and fights the Rust Horde. 8 chapters × 3 levels, a boss on each level 3, a free-for-all level, five historical art styles, a story card per level in three reading tiers. Track A.

## Architecture

Plain HTML/CSS/JS, one canvas, no build, `file://` works. `js/sim.js` holds every rule and has no DOM, so `tools/balance_sim.js` runs the same code in Node. The screen (`js/game.js`) reads sim state and drains `sim.events` (pop, hit, boom, coin, wave, end...) to make particles and sound. `js/art.js` draws everything; every colour goes through `Art.C()`, so an art style is a filter plus a border and a line weight. Fighters are jointed figures drawn from parts, with walk, attack, fall, get-up and death poses. Sound is Web Audio only (`js/audio.js`), including a procedural looping tune. Settings and progress live in localStorage (`fgw.settings`, `fgw.progress`, `fgw.notes`). Notes also go to `fgw_notes` when signed in to the Family project (SQL written, not applied).

## Rules in numbers (see `research/balance.md` for the report)

Heart: 3.2 s per turn (⚙️ ×0.5 to ×4); a quarter turn is one tick, shared out continuously. Gear ticks for one level-1 fighter: spearman 12, archer 12, fighter 17, assassin 16, knight 20, mage 18, tank 30, catapult 36; each merge level ×0.92 (stats ×2.2). Power per minute is about equal for every gear. Multiplier gears ×1/2/4/8. Boss gear: 100 heart turns (⚙️ 10 to 200). 50 soldiers per side. Lives `20 + 5·chapter`. Coins `120 + 7·idx`. Culture star fighter: +25% attack and health.
Waves are made when they launch (`makeWave`): Felix's power (fighters alive + what the gears will make in the next wave gap) × a ratio on the fun curve (`rLow 0.4`, `rPeak 1.1` at the 3 minute peak, 0, eased to nothing at the 7 minute fade, × `1 + 1.1·level/23`, × 0.6 on one screen, × 0.85 on one and a half, × Challenge). After the fade the fortress loses 2% a second. Prices: `F.economy` gives the purse (`45 × max(3, ceil(0.35·G))`) and `creep = 1.5/G` where `G = 0.8 × (5 + level)`; each gear on the board adds `creep` to the price multiplier. Castles: `F.castleUnits` 5 to 10 fighters of damage; towers from chapter 4. Fortress `700 + 80·idx`; the fortress falling wins.

## Verified (headless Chromium, 2026-11-16)

Three sizes (1180×820, 768×1024, 390×844) from `file://`: zero page errors, no horizontal scroll; touch drag of a card onto a peg buys and places a gear; touch pan of the battlefield does not scroll the page; ⚙️ drawer, Show errors panel at the bottom clear of the gear; notes save and survive a reload; all 25 sounds run without error; levels c1l3, c6l3 and free-for-all run to the end; star result screen; eight cultures and three storybook looks render with the right names, headgear and star marks; story cards; map unlocks; Free-for-all fortress cannot fall.

## Not verified

Real iPad touch and speed over a long battle; sound by ear; the family sign-in and `fgw_notes` (SQL not run); balance with a real child (the bot is the only player so far); the portrait layout is letterboxed (small), landscape is the target.

## Next steps

1. Jimmy plays it and answers `convo v0.2.md`.
2. Read the first notes, tune the knobs.
3. Apply the SQL when asked.
