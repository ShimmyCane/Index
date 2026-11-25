# Cheetah Simulator — convo v0.2 (2026-11-25)

Built in 0.1 (cub stages, cumulative clock, settings, notes). See `schematic.md` §Decisions.

## Questions (answer inline)

**1. Wiggle.** Jimmy was not sure how wiggling works. Proposal for cub stages: a finger held anywhere moves the cub toward it (Felix drag from the centre). Wiggle is a small playful shake that runs while the finger is still. A big "chirp" button calls the mother. Is that right?
> 

**2. Joystick.** Joystick in the lower left (game_controls). Is the joystick option the one choice in ⚙️ that turns off Felix drag?
> 

**3. Mature fight.** Mature fights are "accurate" (timing, distance, cover). Proposal: a short timing bar for attack and a bite landing when the bar is in the green. Is that fair for adults?
> 

**4. Gentle fight.** Rock-paper-scissors style for young children: claw, bite, run. Is three moves enough?
> 

**5. Age-appropriate facts.** Gentle mode shows short lessons with no death detail; mature mode shows the real facts. Should there be a third level ("older children") or just the two?
> 

**6. AI toggle.** Jimmy wrote "ANC". Assumed to mean "AI" and marked under development. Correct?
> 

**7. Restart rule.** Confirm the rule: a stage's target is 10 + 5 × restarts minutes of play.
> 

## Round 2 idea: a set of animal mini-games (Jimmy, 2026-11-25)

Jimmy's idea: each animal has its own mini-game built around how it actually lives. The cheetah's mini-game is the hunt. An anteater counts how many ants it eats. A gibbon counts how many branches it can swing from. A bat uses echolocation in the dark. Include unusual animals: a turtle race, an eagle's hunt, a mountain goat leaping and balancing on cliffs.

### Proposed engine: a few mechanic families, many skins

Build one small engine per family, then add animals as data (which family, which numbers, which picture, which facts):

| Family | How it plays | Animals |
|---|---|---|
| **Chase and strike** | Read, stalk, burst, catch | Cheetah, lion pride, hyena (steal a kill), frog or chameleon tongue |
| **Tongue and feast** | Count what you eat in a timed patch; timing matters | Giant anteater (ants, termites), aardvark, echidna, pangolin |
| **Swing and jump** | Momentum arcs, release timing, landing on thinner perches | Gibbon, spider monkey, squirrel, flying fox |
| **Climb and balance** | Ledges, stamina, a balance meter | Mountain goat, snow leopard, ibex, sure-footed sheep |
| **Soar and dive** | Ride rising air to height, pick a target, dive (stoop) at speed | Golden eagle, vulture (rides warm air), osprey |
| **Race** | Get from start to goal past risks | Sea turtle hatchlings (beach to sea), ostrich, sloth (the slow race) |
| **Echo in the dark** | Screen darkens; sound is the map (see below) | Bat, dolphin, oilbird, shrew |
| **Hover and feed** | Hold a steady position, time the sip | Hummingbird (feeds from flowers), sunbird |
| **Camouflage and change** | Match the colour and texture to hide; many fingers at once | Octopus, cuttlefish, chameleon |
| **Watch and share** | Take turns on sentry duty; balance a group | Meerkat (sentry), emperor penguin (huddle that rotates to share the cold) |
| **Build to attract** | Place objects in a pattern | Bowerbird (blue objects), spider (web) |
| **Memory and route** | Remember a path to water or fruit in a dry year | Elephant, bear (salmon routes), monarch butterfly |
| **Steer by sky** | Keep a straight line with a compass | Dung beetle (uses the Milky Way ⚑), sea turtle at night |

### The dark bat game (Jimmy's idea)

- The screen goes dark. The child sends a click (a tap or a held press), and the sound comes back as an echo. The **delay** of the echo says how far an object is; the **pitch and loudness** say how big it is and what it is made of.
- Map the cave with clicks. Catch moths (they are quiet and fly off when the bat is near).
- Sound is the main channel. Visual fallback: a "light on" in ⚙️ shows faint ripples for children who need it. Audio is made with Web Audio (no sound files), per Jimmy's rule.
- Facts ⚑: bats call at high frequencies, often above human hearing; the echoes give them a picture of the dark.

### Animals to research for the list (unchecked ⚑ facts marked)

- **Giant anteater:** eats large numbers of ants and termites a day ⚑ (common figure around tens of thousands; check). Tongue moves fast ⚑.
- **Gibbon:** swings from branch to branch, called brachiation ⚑.
- **Golden eagle:** rises on warm air and dives at high speed to catch prey such as hares ⚑.
- **Mountain goat:** split hooves with hard rims and soft centre pads for grip ⚑.
- **Sea turtle hatchlings:** crawl from the nest to the sea, and many are taken by birds and crabs. Most do not reach adulthood ⚑ (check the survival figure before showing a number).
- **Hummingbird:** wings beat very fast; hovers to feed ⚑ (rate varies a lot by species; show a range).
- **Octopus:** changes colour and texture to match rocks ⚑; three hearts ⚑ (a common fact).
- **Sloth:** very slow movement to save energy ⚑.
- **Dung beetle:** navigates by the Milky Way ⚑ (a 2013 study; cite it).
- **Meerkat:** takes turns on sentry duty ⚑.
- **Emperor penguin:** huddles and rotates so that each bird spends time on the cold edge ⚑.

### Gentle and mature modes for the animal games

- **Gentle:** a predator that misses, a bird that gets away, a hatchling that reaches the sea. No close-up kills.
- **Mature:** real losses (a hatchling taken by a crab, a kill stolen by a hyena), with the facts shown plainly. Same rule as the cheetah: the facts never change, only the telling.

## Questions for Jimmy (round 2 animals)

**A1. Which families first?** Suggest "Chase and strike" (done as the cheetah hunt), then "Swing and jump" (gibbon), then "Echo in the dark" (bat). The bat is the riskiest but the most original.
> 

**A2. Are animal games part of the cheetah project, or a separate project per family?** Option 1: one project, "Animal Lives", with the cheetah as the first life. Option 2: each animal its own small project. Option 1 is what the engine idea needs.
> 

**A3. Which of the unusual animals do you want on the first list?** Suggest: sea turtle race, golden eagle dive, mountain goat climb, bat echo, giant anteater count.
> 

**A4. The dark bat screen with no light:** full dark with audio only (riskiest, most original), or a faint light option in ⚙️ on by default?
> 
