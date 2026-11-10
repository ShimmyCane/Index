# Adventure — Convo v0.4

**Project:** Adventure
**Round:** The world of Ondra, Book 1 outline, chapter 1, voices (2026-11-10)

## Request (summary)

There has been no story yet, so make one. You wake in a forest in a far-away world and time; your name and purpose are forgotten, to be found together. Nearby: a World Tree, a small village and an ancient village; further off, deserts, lakes and great cities. The world is at peace, but war is rumbling; factions, daily struggles, and real injustice. All of it leads to the Reckoning, which will turn the world upside down, making heroes of peasants and bringing kings to their knees. For young children to explore, and to grow up hearing of hard things while trying to do their best. Many modes later; for the first chapters, learning how the player responds and acts.

1. A world file: cultures, backgrounds, regions and their histories and relations, local creatures, spirits and tribes, present and forgotten. A world that breathes and changes with the players, with many players and many lives at different times woven together. Bravery, might and loyalty beside treachery and dark poisons.
2. A few chapter outlines as the characters explore their neighbourhood and meet the lore. Inspiration from cultures across the world, deeply.
3. Write chapter 1, and borrow from Voice to give the framework narration.
4. Merge.

## What Claude made

- **World bible** in `world/` (also readable on `lore.html`):
  - `bible.md`: Ondra; Brother Sun and Sister Moon and the World Tree Vael; the Giving Law ("Take with one hand, give with the other"); the ages (Song, Roots, Crowns, the Great Forgetting, the Night Without Moon, the Breaking, the Concord, Embers); the Hush and the Seedlings (why you have forgotten); the Twin Keys; the Reckoning; how dark it gets; how the world lives (Leaves, Rings, Echoes, Clocks, Standing, Seasons); inspirations and care.
  - `regions.md`: the Greenhollow (Vael, the Waking Hollow, Mossbrook, Aun), the Mirrorlakes, the Ashen Reach, Solvane, Ferrow, the Tallgrass, the Stairstep Mountains, the far edges.
  - `peoples.md`: Mossbrook, the Keepers of the Root, the Tallenai, the Lumai, Solvane, Ferrow, the Tallgrass Clans and more; hidden factions (the Ash Hand, the Glass Remnant, the Unlanterned); forgotten peoples (the Rootkin, the Moon's Children, the Green House); a table of who thinks what of whom; eight injustices and how a child first meets each.
  - `creatures.md`: the seven Wardens and the Hush, creatures and spirits of each land, dark things (nightbloom and the grey sleep), the forgotten.
  - `book1.md`: Book 1, *The Waking*, 8 chapters with puzzles (brave, clever, kind answers), branches and lore; Books 2–5 sketched.
- **Your old car-ride story is woven in:** the Sun and Moon key is in your hand when you wake, Bristle guarded your sleep, the Old Lady is Granny Wren, and the Sun and Moon Chest waits in Aun (chapter 4).
- **Chapter 1, "Who? Who?"**: three lengths, whispers for the Wanderer, Bristle and Granny Wren, and a voiced script with a 4½-minute recording in four Kokoro voices.
- **Narration from Voice:** script format, recorded cast, iPad-voice fallback with a pitch per character, sound effects, a new forest tune, director's notes, tap a line to read from there.
- **Database:** new roles (The Wanderer replaces Athena; Granny Wren replaces the Old Lady), the world in 13 short entries, World clocks, 21 places in three levels of maps, 7 planned chapters, and a `script` column (`004_script.sql`). Tested on a local Postgres.

## Questions for Jimmy (answer inline)

1. **The Wanderer or Athena?** The role is now "The Wanderer", with a name chosen in the story. Should Athena keep a role of her own as well (two Seedlings waking together?), or is the Wanderer hers to name?
   - Answer: This is, as they say, Athena's story.
2. **The Reckoning.** It is the Tree's thousand-year bloom: everything forgotten returns and every promise made under the Tree comes due. Does that feel right, or did you have a different reckoning in mind (a war, a god, a comet, the sky turning over)?
   - Answer: Hmm, I love it, but I would want there to be some sort of conflict as well, manmade. But it should also have moments of levity.
3. **How dark?** The rule for now: terrible things are told, not shown; poison brings sleep, never death on the page. Is that the right dial for Book 1? When should it turn up?
   - Answer: For now, things are light. The reckoning will be a manual toggle. It will take another 10 chapters to kick in. But there should be teasers within 25 chapters.
4. **Voices.** Listen to chapter 1. Keep the Storyteller as `bm_fable` (British, warm), or try another? Is the owl too slow?
   - Answer: Sure, give me a setting/testing page where I can try multiple voices for the storyteller.
5. **Chapters the storyteller writes** are read by the iPad voice (no recording). Worth adding a recording step (Kokoro on a computer, or live in the page from Voice), or is the iPad voice enough?
   - Answer: Let's use the Voice repo/borrowing from Kokoro recording step.
6. **Book 2's road.** Book 1 ends on three roads: the lakes, the desert, the iron city. Let the family choose, or do you want to steer?
   - Answer: Plan roughly 10 books for now; I'd imagine that there must be many sub versions as stories fragment over time.
7. **Other lives.** A later mode where you play someone in another age (a Rootkin child in Aun, long ago) whose deeds echo into the present. Interested, and when?
   - Answer: Yes, those will be options for Athena to explore.
