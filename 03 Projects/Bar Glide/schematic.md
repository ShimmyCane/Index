# Ole Bar Glide — schematic

**Player:** Jimmy (convo v0.1). **Track:** A. Family play. Graphic, few words, everything secondary in ⚙️. The default room is a late-night saloon (Jimmy: "the mood is the color… it's nostalgic"), so it breaks the pastel rule on purpose; ☀️ Pastel day is one tap away in ⚙️.
**Status:** 0.3.0 (headless-tested; Jimmy played round 1 on a device for 0.2.0). Linked from the nursery home page.
**Name:** Ole Bar Glide (convo v0.2). Jimmy first asked for "Beer Tapper". The original 1983 arcade game is a trademarked title, so this seed uses its own name, characters and art and keeps only the genre's mechanics.

## A day of shifts (0.3.0, convo v0.2)
Each round is a shift. The numbers are the `SHIFTS` table in `js/game.js`.

| Shift | Bars | Customers | Pace | Two drinks |
|---|---|---|---|---|
| Morning (tutorial) | 2 | 6, slow, 30 easy seconds | 0.75 | none |
| Lunch rush ("speeding up") | 2 | 14, streaming in | 0.9 | 30% |
| Afternoon | 3 | 10, quieter | 0.9 | 30% |
| Dinner rush | 4 | 14 | 1.0 | 35% |
| Night | 4 | 20 | 1.15 | 45% |
| Night 2, 3… | 4 | +3 each | +0.07 each | up to 60% |

- Inside a shift it starts easy (Morning: 30 s; others: a few seconds) and ramps up over a minute.
- **Two drinks:** an X2 customer keeps the first mug ("ONE MORE!") and waits for a second; then drinks both and sends two empties back.
- **Forgiving catch:** an empty mug wobbles on the edge (a "!") for 250 ms before it falls, and arriving at the bar catches it up to 100 ms early.
- ⚙️ **Start the day at** Morning, Afternoon or Night replaces the old 4/3 bars choice.
- Later (Jimmy is thinking about it): cut-off customers or jokers you must not serve.

## The game
- 2 to 4 bars stacked down the screen, by shift. Doors on the left, taps on the right wall, the bartender at the right end.
- Customers come in through the doors and walk toward the bartender in steps (walk, pause, walk).
- **Touch a bar** to run there. **Hold** to pour (half a second fills a mug). **Let go** to slide it down the bar.
- A customer who catches a mug slides back a little. If they slide out of the door they are served (+50). Otherwise they drink, then slide the empty back (catch it at the right end: +25).
- A miss is one broken glass, with a falling mug, shards, a beer puddle and an "UH-OH!":
  - a full mug slides off the left end with nobody to catch it;
  - an empty mug reaches the right end and the bartender is on another bar;
  - a customer reaches the bartender ("HEY!").
- After a miss everyone goes out and the round carries on. Three broken glasses (five in ⚙️) and the owner stomps in, bends the bartender over the bar and spanks him (or, in ⚙️, just tells him off). Little pixel tears. Then "Closing time": score, initials (three letters, arcade style), top five, Pour again.
- Rounds get longer and faster. Round bonus 100 × round.
- **Tips** (0.2.0): sometimes a customer who catches a mug leaves a coin on the bar. Tap it and the bartender dashes down the bar to grab it (+150). While he's away he can't pour or catch empties. Grabbing it starts **SHOW TIME**: spotlights sweep the room, music notes float up, the tune speeds up, and every customer stops to watch for 3.5 s.
- **Bonus round** (0.2.0) after every second round: a gold coin goes under one of three big mugs, the mugs shuffle (more swaps and faster each time), and you tap the one with the coin. Right: JACKPOT +500 + 100 × round, with confetti. Wrong: SPLASH, a spray of foam. Keys 1–3 work too.
- **Energy** (convo v0.1: "thematically very energetic"): a looping honky-tonk tune written here (C F G C, square-wave lead, triangle bass, offbeat stabs, hi-hat). It speeds up each round and during the show, and the neon sign pulses on the beat. 🎵 Music on/off in ⚙️.

| Setting | Here |
|---|---|
| Words on screen | three-line how-to on the title card; HUD in a 3x5 pixel font |
| Options visible | the bar itself, ▲ ▼, 🍺 Hold to pour, ⏸ |
| ⚙️ holds | start shift, speed, glasses, boss ending, room, old-TV lines, sound, music, notes, top scores, family database, show errors, version |
| Panels | collapsible in ⚙️; on a small screen only Game starts open |
| Palette | saloon night by default, pastel day in ⚙️ |
| Database | Family project, family login |
| Private data | none; initials only |

## Screen
- A 320 × 200 canvas scaled up with crisp pixels (16:10), centred; controls under it; ⚙️ lower right.
- Keyboard: ↑ ↓ to move, Space to pour, P to pause.
- Pauses itself when ⚙️ opens or the tab is hidden.

## Mood (research)
- The genre's look: a dark wooden saloon, brass rails, a row of taps, bottles on shelves, warm hanging lamps, a neon sign, swinging doors, chunky pixel people, cheerful square-wave sound.
- All drawn here in code: no images, no sound files.
- "Jedno čepované" (Czech, roughly "one on tap") did not turn up in an App Store search; noted for later.

## Sound lab (`synth.html`, 0.3.0)
- ⚙️ → Pages → 🎛️ Sound lab. A Web Audio synthesizer to play with, aimed at dialling in metallic sounds.
- Hold-to-play pad, eight Do–Do keys, twelve starting sounds (bell, clink, metal pipe, cowbell, break, whap, laser, gulp, robot, twang, drum, chip).
- Panels: Wave (sine, square, saw, triangle, noise; pitch; slide), Metal (inharmonic overtones, FM ratio and depth, ring), Shape over time (attack, decay, sustain, release), Filter, Echo and volume. Each panel says in plain words what it does.
- Oscilloscope of the wave as it plays. Save sounds on this device; Copy settings as JSON.

## Feedback notes
- ⚙️ → Notes for improvement. Each note saves the round, number of bars and room automatically (`item` = `title` or `round-N`). Device first; copied up to `bglide_notes` once signed in.

## Database (Family project, prefix `bglide_`)
- `bglide_scores`: id, initials (1–3), score, round, version, played_at.
- `bglide_notes`: same shape as other nursery notes (id, text, item, label, version, status, noted_at).
- RLS on, anon revoked, signed-in family can read and write. Registered under app `bar-glide`.

## Version control
- `BG.VERSION` and `BG.CHANGES` in `js/config.js`, shown in ⚙️ → Version. Git is the history.
