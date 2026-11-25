# Cheetah Simulator — convo v0.1 (2026-11-25)

## Jimmy's brief (summarised)

A game with a choice of how to control, and a splat approach like Mind Palace, but about learning how animals really live. Start with a cheetah. In ⚙️, a series of time periods the child plays through: a playful cub, learning the world; siblings; adolescent, learning the ways of life; then leaving the group. It depends on who plays (family database): a male Felix-type cheetah, because males form outside groups, while females stay with Mum (to check). Branching paths. Skills: identify prey from a distance, sneak up, strip and go for the kill. Defend territory. Find a mate, maybe fight for one. Have cubs; leave or care for them; hunt for them; protect them from other males and the elements; choose a good home; the cycle continues. Do not cover anything up, but give an option to minimise. Research it, in a research folder. About ten minutes per stage, saved; after ten minutes a Next stage option. At the end, pick any stage (levels unlocked). Different storylines, depending on where they live: a world that changes (more or less food, drought, people). Graphical and cuddly when young, rough and mean and precise when older; the game itself evolves with the phase. Build the steps in the schematic, then he reviews and implements separately. Come back with a series of ideas to discuss.

## What the research found (full notes: `research/cheetah-life-cycle.md`)

1. **One correction.** The brief says females stay with Mum. The sources say the opposite for the sibling group: **females leave their siblings first, at about 2 years, and live alone; males usually stay with their brothers for life** (a *coalition* of 2 to 3). Nobody stays with Mum past about 18 months; she leaves, sometimes suddenly, to breed again. So the branch is: **female = alone, then mother alone; male = brothers, floater, territory.**
2. **Males are floaters first.** A young male roams a very large range, then may win a territory (often older males). That gives male stages 6 and 7 a real story.
3. **Males do not raise cubs.** Gestation is about 90 to 98 days, then the mother raises 2 to 4 cubs alone and moves them between hiding places. So "protect the cubs from other males" is a *female* stage; the male stage 9 needs another goal (question 6).
4. **The hunt is short.** About 38 seconds a chase; sprints are brief, then the cheetah is out of breath. Success is better in open grass. About one kill in ten is stolen by lions and hyenas. These become the hunt's rules.
5. **Cub deaths are mostly from big predators**, so the cub stages carry real, visible danger.
6. **Unchecked (⚑):** top speed, mantle fur, exact ages at first kill, lifespan. Marked in the notes.

## Ideas to discuss (pick, merge or drop)

**1. The look grows up: fuzziness is age.** Mind Palace's splat fuzziness slider becomes the cheetah's age. A cub is a glowing, fuzzy cloud of splats; each stage the splats sharpen until the adult is crisp and precise. This is the most distinctive idea and uses what is already in the nursery. Risk: splats are heavy on an iPad (see idea 2).

**2. A cheaper way to the same feeling.** 2-D paper cut-outs (parallax) that change from soft pastel to ink-and-ochre. Reliable on iPad and quick to review. Hybrid: splat-fuzzy early stages, 2-D or low-poly for the hunting stages.

**3. The camera is a character.** Cub: low to the ground, bouncy, tall grass fills the screen. Adult: climb a mound and scan the herd like a binocular. The camera change *is* the growing up.

**4. Read the herd, don't just chase.** The adult hunt starts with reading: young, old, sick, separated, alert. Tap to read each animal. Choosing well is the skill; the chase is only the last 10 seconds. It teaches real cheetah behaviour.

**5. Energy is the main character.** One short sprint, then breathless. A stamina bar that the child must respect, and a recovery wait (a real fact) while a hyena walks up. Every hunt becomes a decision, not a race.

**6. A year of weather, in words.** Each stage opens with a plain note of the rolled world: "This year is dry. Fewer gazelles. Hunts take longer." A "How to read this" panel with the numbers worked out (your §2b).

**7. Life map as a family tree.** After finishing, a map of every cheetah each player has lived: tap any unlocked stage to replay it with a new world roll. The siblings or the cubs of one life can become playable lives in another.

**8. Cubs you meet again.** As a mother in stage 9, the cubs you raise appear as the cubs in another player's (or your own next) stage 1. The cycle becomes a real loop, not just a restart.

**9. Honest, with a soft setting.** Gentle mode changes the telling (no blood, "gone away"), not the facts. Default to be set by you. A "How it really is" panel always says the real thing.

**10. Real places as settings.** Serengeti plains, bushveld, farmland, desert edge. Each changes cover, prey and who is nearby. A "map of where cheetahs live" panel with the numbers.

**11. A sound you earn.** Lullaby and soft chirps as a cub; spare wind, breath and heartbeat as a hunter. All made with Web Audio in the page.

**12. A balance test that runs without playing.** Simulate a stage's world 500 times and report how often a cub reaches adulthood and how often a hunt works, so you can tune it without a long session. (From Gear Wars.)

**13. A second animal later.** Keep the life-stage engine generic (stage list, world, style layer) so the next animal (an elephant, an owl, a penguin) is mostly data and art. The nursery gets a template, not just one game.

## Questions (answer inline)

**1. Track and name.** Family play (a child plays it, ⚙️ holds the rest). Right? Is the name "Cheetah Simulator" final?
> 

**2. Who plays and who chooses the sex?** Does the child pick male or female, or is it set by the family database (for example, Felix is male, others pick)? Can one player live several cheetahs?
> 

**3. The look.** A (fuzzy splats, like Mind Palace), B (paper cut-outs), C (low-poly 3-D) or D (hybrid: A for cubs, B or C for adults)? I suggest **B for the first build** (cheap to review) and splats later. OK?
> 

**4. Gentle mode.** On by default, or off by default? What should it hide: blood, death of a cub, a mother leaving, a fight over a mate?
> 

**5. Ten minutes.** Is ten minutes the *play* clock (paused when you leave the page) or wall-clock? After ten minutes, should the child be asked "Next stage?" once, or should the button simply glow? Is Next stage ever *required*?
> 

**6. Males and cubs.** Males do not raise cubs. For stage 9 (male path) should the child (a) defend the territory so the mother can raise cubs nearby, (b) skip to the next stage, or (c) switch to playing one of the cubs? (c) fits the cycle idea well.
> 

**7. Mating scene.** Keep it a short, gentle, factual scene (males stay with a female for a few days; scent, calls), or leave it out of the play and put it in "How it really is"?
> 

**8. Fights.** Fights between males for territory are real. Show them as a head-to-head game (timing), a chase-off (the loser runs), or just a result card?
> 

**9. People.** Rangers, farmers, tourists' vehicles and roads as helpers and hazards, or keep people to a few events (a road, a fence)? Poaching and the pet trade: leave them out of play and put them in "How it really is"?
> 

**10. Controls.** Felix control (drag from the centre) by default, joystick in ⚙️. For a hunt, is a tap-to-pounce and a hold-to-sprint right? Should a cub be controlled by one finger wiggling toward a target?
> 

**11. Real facts and sources.** You said you do not know the lifestyle well. Do you want a **"How it really is"** panel on each stage with the short facts and the source (I would use the CCF, Panthera, IZW and the papers listed in `research/`)? Should anything in the research be double-checked with someone who knows cheetahs (a zoo or the CCF)?
> 

**12. Scope of the first build.** I propose: stages 1 and 2 only, saved, ten-minute clock, Next stage, ⚙️ with notes (0.1). Then the guided hunt (0.2). Or would you prefer to see the **adult hunt** first (the core loop) and fill in the cub stages after?
> 

**13. Family database.** Put it in from the start (player, cheetah, unlocks, notes in the Family project, like Felix Stickers) or device-only first and add sync in 0.6?
> 

**14. Second animal.** Keep the engine generic so a second animal is cheap, or do the cheetah as a one-off?
> 

## Decisions made without asking

- Treated the sibling-group fact as the sources state it (females leave first; males stay together) and wrote the branch that way, flagging it above.
- No page, so no tile on the Nursery list yet. `/start-project` adds one with the first build.
- Planned (not built): ⚙️ with a notes box, Felix control and joystick (`game_controls`), family sign-in in a later increment.
