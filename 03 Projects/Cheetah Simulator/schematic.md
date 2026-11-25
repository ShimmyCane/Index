# Cheetah Simulator — schematic

**Track: A. Family play** (one player at a time; a family database for who is playing). Studio-level facts live in collapsed panels ("How it really is").

Status (2026-11-25): **0.2.0 built** (skills, canvas first; 0.1 was the first increment) (cub stages 1 and 2, cumulative clock, ⚙️ with gentle mode, notes, AI toggle, Felix and joystick controls). Decisions below come from `convo/convo v0.1.md`. Jimmy asked for the whole thing to be built incrementally, merged step by step.

## Decisions (convo v0.2 round 4, 2026-11-25)

- The canvas is kept as open as possible. Only the stage pill, Next (when ready), ⚙️, Chirp, the joystick and short toasts are on screen. All panels are inside ⚙️.
- Stages are skills learned from the animals, by doing (skill tokens in ⚙️). Cubs nibble grass (⚑ to check). Stage 1 skills: Move, Stay hidden, Listen for Mum, Follow Mum, Nibble grass. Stage 2: Pounce, Freeze, Play together. "Bees" is open (convo v0.2 R4-1).

## Decisions (convo v0.1, 2026-11-25)

- Cheetah's sex chosen up front; random by default. Tap the sex symbol to toggle; tap the name to rename.
- Gentle mode on by default (⚙️). Mature mode is the other setting. Gentle: simple, no gore. Mature: accurate hunts, fights and kills, growing up with the look.
- Stage clock is cumulative: target = 10 + 5 × restarts minutes. After the target, Next stage appears.
- Male path is about territory, fights with other males, exploration. In mature mode a male may kill another female's cubs and mate again.
- Meeting scene: simple in gentle mode, more graphic in mature.
- Gentle fights: rock-paper-scissors style. Mature fights: accurate timing.
- Threats include poaching, snares, roads and vehicles (age-appropriate wording).
- Look: 2-D layered (option B). AI toggle in ⚙️, marked under development.
- Controls: Felix drag and joystick. Wiggle is proposed in convo v0.2.
- Facts per mode are age-appropriate.
- A second animal is planned later (the engine stays generic).

## Purpose

A game where a child lives a cheetah's whole life, one stage at a time, and learns how cheetahs really live. The game itself grows up with the cheetah: soft and cuddly as a cub, sharp and precise as a hunter. The cheetah's world (place, weather, prey, other animals, people) changes how each life goes, so no two lives are the same.

Source: Jimmy's concept (2026-11-25), recorded in `convo/convo v0.1.md`. Facts: `research/cheetah-life-cycle.md`.

## Guiding rules

1. **Honest.** Nothing is covered up (hunting, death, cub loss, being driven out). A ⚙️ switch, **Gentle mode**, softens the telling (no blood, losses shown as "gone away"); it never changes the facts in the "How it really is" panel. Default: to be set by Jimmy (convo question).
2. **The life is the level list.** Each stage is a level. Ten minutes of play per stage, saved, then a **Next stage** button appears. Nothing forces the move.
3. **The game grows up.** Look, sound, controls and goals change with the stage (see "Growing up").
4. **The world matters.** A born-in place and a yearly weather roll change food, danger and people.
5. **Learn by doing.** Every skill is something the child does (spot, stalk, sprint, guard), then a plain-words note says what real cheetahs do ("How to read this", per `jimmy_preferences.md` §2b).
6. **Each player has their own cheetah and path.** Branches depend on the cheetah's sex, which a player chooses or is set by the family database.

## Track defaults

| Setting | This project |
|---|---|
| Words on screen | Few, with icons. A short line of "what I learned" at stage end. Full words in collapsed panels |
| Panels | Collapsible (▸/▾): My cheetah · Map · What I learned · How it really is. Closed on a small screen |
| ⚙️ holds | Sound, music, Gentle mode, controls (Felix drag or joystick), world seed, difficulty, test cheats, notes, family sign-in, database check, Show errors, version |
| Palette | Starts pastel (soft vanilla, sage, peach, mint). Hardens by stage (see below) |
| Database | Family project, family sign-in; device storage first |
| Private data | None in the repo. Player names are first names only; saves are device-first |

Skills to apply at build: `ipad-website`, `settings-gear`, `game-controls`, `feedback-notes`, `smoke-test`, `project-track`.

## The life: stages

Ten minutes of play each. A stage has a **goal** (a few things to do) and a **lesson** (what real cheetahs do). The minutes are a *play* clock (paused when the page is hidden).

### Shared start (both sexes)

| # | Stage | Real age | Play | What the child learns | Mood and look |
|---|---|---|---|---|---|
| 1 | **Den** | 0 to 8 weeks | Wiggle, mew, find mother, stay hidden when she moves the cubs; first tastes of the world through a gap in the grass | Cubs hide; the mother moves them; chirping calls her | Plush toy look, huge eyes, round shapes, warm light, lullaby |
| 2 | **Little explorer** | 2 to 6 months | Follow mother, play with siblings, pounce on grass and tails, hide from eagles and lions, weaning | Play is practice; follow; stay silent near danger | Soft cartoon, bold outlines, bright |
| 3 | **Watching and trying** | 6 to 12 months | Watch mother hunt; practise on a live hare she brings; first spot-and-stalk | The hunt has steps; cubs learn by trying | Cartoon sharpens; textures appear |
| 4 | **Almost grown** | 12 to 18 months | Join real hunts; mother can leave at any time (a story beat: she goes) | Independence; survive without her | Realistic proportions; muted colours |

### The branch (decided at the end of stage 4 by the cheetah's sex)

**Female path**

| # | Stage | Real age | Play |
|---|---|---|---|
| 5F | **Sisters, then alone** | 18 to 24 months | Hunt with siblings; at about 2 years walk away alone and find a home range |
| 6F | **Home range** | 2 to 3 years | Find prey, avoid lions and hyenas, learn the land; males' scent marks tell you whose land it is |
| 7F | **Finding a mate** | adult | Visited by males; accept or leave; (a short, gentle, factual scene) |
| 8F | **Expecting** | about 3 months | Choose a good den; stock up on food; avoid danger while heavy |
| 9F | **Mother** | cubs 0 to 18 months | Hide and move cubs; hunt for the family; guard against lions, hyenas, eagles, males, weather. The child sees the cubs grow (a nod to stages 1 to 4 from the other side) |
| 10F | **Legacy** | late years | Teach the cubs; the mother leaves; the story ends or the cycle restarts as a daughter or son |

**Male path**

| # | Stage | Real age | Play |
|---|---|---|---|
| 5M | **Brothers** | 18 to 30 months | Stay together; learn to hunt bigger prey as a team; the band is the strength |
| 6M | **Floater** | 2 to 3 years | Roam a very large range; avoid territory holders; scent-mark; look for a vacant territory |
| 7M | **Winning ground** | adult | Challenge a territory holder as a coalition; fight or find an empty patch; mark and patrol |
| 8M | **Holding ground** | adult | Patrol and defend; females pass through; find a mate (males stay with her for a few days) |
| 9M | **Father, from afar** | adult | The player learns the cubs are raised by the mother alone; the player can *defend the territory* and *share kills if the mother appears*; the game says so plainly |
| 10M | **Legacy** | late years | An older cheetah; a younger coalition arrives; hand over or be driven off; the story ends or restarts |

Stage 9 for males is a design question (convo v0.1 question 6): males do not raise cubs, so the child needs a goal that is true and still fun.

### Unlocking and replay

- Progress and the **ten-minute clock** are saved per cheetah.
- When the clock passes ten minutes, **Next stage** lights up. The child can keep playing.
- When a stage is finished, it is **unlocked for ever**. A **Life map** lets the child jump to any unlocked stage of any of their cheetahs (replay it, with a new world roll).
- A stage can be replayed as the **other sex's** path only if both paths are unlocked at their shared stages; the family database holds each player's unlocks.

## The world

A world is a **seed** plus a few dials. Born in one world; moves between worlds happen in the story (a drought, a dispersal, a territory loss), not by menu.

| Part | Dials |
|---|---|
| **Place** | Serengeti plains (open, many lions) · Bushveld (thick cover, harder chases) · Farmland (people, livestock, fences) · Desert edge (sparse, rare) |
| **Season and weather** | Wet and dry; a yearly roll: good, ordinary, **drought** (less prey, more danger), **flood** (dens lost) |
| **Prey** | Density and kind: hares, guineafowl, gazelle fawns, adult gazelles, impala, young wildebeest. A herd has sick, young, old and separated animals |
| **Competition** | Lions, hyenas, wild dogs, eagles, other cheetahs (the other sex, rivals, floaters) |
| **People** | None, conservancy rangers, farmers, tourists' vehicles, a road. Helpers and hazards |
| **Events** | A flood, a fire, a lion pride moves in, a brother is hurt, a hyena steals a kill |

Each stage reads the world: the same hunt is easier on open savanna than in bush; a drought stretches the hunt and thins the cubs.

### The world roll (a plain-words panel)

At the start of each stage the game says what it rolled and why ("This year is **dry**. There are fewer gazelles, so hunts take longer."), in a "How to read this" note with the current numbers.

## Growing up

The game's engine is the same; the **style layer** and the **verbs** change.

| Dimension | Cub (1 to 3) | Adolescent (4 to 5) | Adult (6 to 10) |
|---|---|---|---|
| Look | Plush, round, bold outline, pastel | Cartoon with texture | Hard-edged, precise, muted and warm light; **ink-and-ochre** |
| Camera | Low and close, bouncy | Mid, follows | Wide, can climb a mound to scan |
| Verbs | Wiggle, pounce, follow, hide | Follow, spot, stalk (guided) | Spot, choose prey, stalk, burst, trip, bite, guard, mark |
| Hunt | Tutorial play: pounce on a bug or tail | Guided: mother does the hard part; child times the pounce | Full hunt (below) |
| Speech | Mother's chirp; tiny lessons in icons | Short lessons | Short lessons plus numbers (distance, wind, energy) |
| Sound | Lullaby, soft chirps | Chase beats | Spare: wind, grass, breath, heartbeat in the sprint |
| Fail state | Cannot fail; mother always returns | Hungry bar; mother helps | Real stakes: hunger, injury, lost kills, lost cubs (softened by Gentle mode) |

The change is gradual within a stage, and a **Style** ⚙️ switch lets the child pick "Always cuddly" or "Match my age" (default).

### The adult hunt (the core loop)

1. **Spot.** From a mound, scan the herd. Tap an animal to **read** it (young, old, sick, alone, alert). Wind and cover show as simple icons.
2. **Choose.** Pick prey. The game shows a "chance" meter built from distance, cover, wind and energy, explained in words.
3. **Stalk.** Move low, use cover, freeze when the prey's head is up. Too close too soon: it bolts.
4. **Burst.** A short sprint (tens of seconds at most; a stamina bar). The prey zigzags.
5. **Trip and hold.** Time the trip; then hold the bite.
6. **Recover.** The cheetah is out of breath. A small pause the child must wait through (a real fact).
7. **Eat or defend.** Eat fast; watch for lions, hyenas, vultures. Drag the kill to cover if possible. A kill can be lost.

Failed chases are normal; the lesson card says "A cheetah misses often, and that is OK."

## Systems (to build, in this order)

1. **Clock and save:** per-stage play minutes, stage state, life log (device storage first).
2. **World:** seed, place, season roll, events. A pure data layer, no DOM, so it can be tested in Node.
3. **Animals:** a simple state machine for prey, lions, hyenas, mother, siblings (wander, graze, alert, flee, hunt, steal).
4. **Needs:** hunger, energy, safety. Visible as icons, not numbers, for cubs.
5. **Stage scenes:** one scene per stage, built from the same engine.
6. **Style layer:** the look changes by stage (see Rendering).
7. **Life map and unlocks.**
8. **Family:** player, cheetah, path, unlocks.

Layered, as in Mind Palace: **data (world, life, save) → scene description → renderer**, so the look can change without changing the rules.

## Rendering options (for Jimmy to pick; see convo question 3)

| Option | Cub look | Adult look | Cost |
|---|---|---|---|
| **A. Splats** (from Mind Palace `splat.html`, plain WebGL 2) | *Fuzziness* is a feature: very fuzzy, glowing, soft | Fuzziness falls with age, so the cheetah and world get sharper as it grows up | Biggest idea, hardest on an iPad; software GL is slow; needs the baked splat sets (`bake-cache`) |
| **B. 2-D layered painting** (parallax paper cut-outs, sprites) | Cuddly and cheap | Hard edges, pencil-and-ink | Cheapest and most reliable on iPad; strongest control of the "cuddly to mean" shift |
| **C. three.js low-poly** | Soft shading, rounded | Facets and hard light | Medium; has a 3-D feel; well known in this repo |
| **D. Hybrid** | A for stages 1 to 3 (fuzzy dreamy), B or C for adult hunting | | Best story fit; most work |

The schematic keeps the **style layer separate**, so the choice can change later.

## Data (first sketch)

Device storage first. Family sync later (`02 Refs/Skills/supabase_link.md`; plan table prefix `ch_`; `ch_notes` as in the family reference).

| Entity | Fields | Notes |
|---|---|---|
| `player` | id, first name, colour | From the family database |
| `cheetah` | id, player id, name, sex, birth world seed, current stage, play minutes in stage, born at | One player can have several |
| `stage_state` | cheetah id, stage, minutes, unlocked at, lessons seen | Unlocks never expire |
| `world` | seed, place, year, weather, prey density, threats, people | Rolled per stage |
| `life_log` | cheetah id, at, event, text | A short readable story: "Year 2 was dry" |
| `notes` | id, text, page, item, label, version, status, noted_at | The `feedback-notes` box; later `ch_notes` |

## Controls

Follow `04 AI/Skills/game_controls.md`: drag relative to the centre by default, joystick setting in ⚙️ (lower left), action buttons lower right (pounce, sprint, bite, call), ⚙️ moves to the upper right and fades after two seconds. Each action button is at least 68 px high.

A cub's controls are simpler: one finger to wiggle toward, a big "chirp" button. Buttons grow in number as the cheetah grows.

## Feedback notes

A "Notes for improvement" box in ⚙️, built from `02 Refs/Skills/feedback_notes.md`, in the first increment. Each note saves with the stage and the time. Read back in ⚙️. Family sync follows the Mind Palace and Felix Stickers pattern.

## Increments (proposed)

| Version | What | Notes |
|---|---|---|
| 0.1 | Stage 1 (Den) and stage 2 (Little explorer), saved, 10-minute clock, Next stage, ⚙️ with notes. Option B look (cheapest to review) | First review on the Pages site |
| 0.2 | Stage 3 and 4 with the guided hunt; world roll (place, season) | Tests the "game grows up" idea |
| 0.3 | Branch: female and male paths (5 and 6); life map; unlocks | |
| 0.4 | Adult full hunt (stage 6 or 7) with the stalk and burst; competitors | The main loop |
| 0.5 | Mating, den and cubs (stages 7 to 9 for females); territory (7 and 8 for males) | |
| 0.6 | Legacy and the cycle; family sign-in and database | |
| 0.7+ | Style: splats for the early stages; sound and music; Gentle mode; art options | |

## Check and test

- `smoke-test` at three screen sizes after every page change.
- A **balance test that runs without playing** (per `jimmy_preferences.md` §8): simulate a stage's world a few hundred times and report how often a cub grows up and how often a hunt succeeds, so the world dials can be tuned from the numbers.
- A **test cheat** in ⚙️ (skip the ten minutes).
- Not tried on an iPad until Jimmy says so.

## Open decisions

See `convo/convo v0.1.md` (ideas to discuss and questions).
