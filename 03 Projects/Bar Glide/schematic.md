# Bar Glide — schematic

**Track:** A. Family play. Graphic, few words, everything secondary in ⚙️. The default room is a late-night saloon (Jimmy: "the mood is the color… it's nostalgic"), so it breaks the pastel rule on purpose; ☀️ Pastel day is one tap away in ⚙️.
**Status:** MVP 0.1.0 (headless-tested, not yet device-tested).
**Name:** Jimmy asked for "Beer Tapper". The original 1983 arcade game is a trademarked title, so this seed uses its own name, characters and art and keeps only the genre's mechanics.

## The game
- 4 bars stacked down the screen (3 in a quick game). Doors on the left, taps on the right wall, the bartender at the right end.
- Customers come in through the doors and walk toward the bartender in steps (walk, pause, walk).
- **Touch a bar** to run there. **Hold** to pour (half a second fills a mug). **Let go** to slide it down the bar.
- A customer who catches a mug slides back a little. If they slide out of the door they are served (+50). Otherwise they drink, then slide the empty back (catch it at the right end: +25).
- A miss is one broken glass, with a falling mug, shards, a beer puddle and an "UH-OH!":
  - a full mug slides off the left end with nobody to catch it;
  - an empty mug reaches the right end and the bartender is on another bar;
  - a customer reaches the bartender ("HEY!").
- After a miss everyone goes out and the round carries on. Three broken glasses (five in ⚙️) and the owner stomps in, bends the bartender over the bar and spanks him (or, in ⚙️, just tells him off). Little pixel tears. Then "Closing time": score, initials (three letters, arcade style), top five, Pour again.
- Rounds get longer and faster. Round bonus 100 × round.

| Setting | Here |
|---|---|
| Words on screen | three-line how-to on the title card; HUD in a 3x5 pixel font |
| Options visible | the bar itself, ▲ ▼, 🍺 Hold to pour, ⏸ |
| ⚙️ holds | bars (4 / 3 quick), speed, glasses, boss ending, room, old-TV lines, sound, notes, top scores, family database, show errors, version |
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

## Feedback notes
- ⚙️ → Notes for improvement. Each note saves the round, number of bars and room automatically (`item` = `title` or `round-N`). Device first; copied up to `bglide_notes` once signed in.

## Database (Family project, prefix `bglide_`)
- `bglide_scores`: id, initials (1–3), score, round, version, played_at.
- `bglide_notes`: same shape as other nursery notes (id, text, item, label, version, status, noted_at).
- RLS on, anon revoked, signed-in family can read and write. Registered under app `bar-glide`.

## Version control
- `BG.VERSION` and `BG.CHANGES` in `js/config.js`, shown in ⚙️ → Version. Git is the history.
