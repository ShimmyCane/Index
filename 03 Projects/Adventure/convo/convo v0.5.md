# Adventure — Convo v0.5

**Project:** Adventure
**Round:** Jimmy's answers to v0.4 (2026-11-10)

## What Jimmy asked (answers in `convo v0.4.md`)

1. It is Athena's story.
2. Keep the Reckoning as the bloom, but add a man-made conflict, and moments of levity.
3. Light for now. The Reckoning is a manual switch, takes 10 chapters to arrive once switched on, with teasers within the first 25 chapters.
4. A settings / test page to try several voices for the storyteller.
5. Record the storyteller's chapters with Kokoro, borrowing from Voice.
6. Plan about ten books, with many versions as the story branches.
7. Other lives are options for Athena to explore.

## What Claude made

- **Athena's story.** Her role replaces the Wanderer (`athena`). She still wakes with no name and chooses it at the Naming Bowl. `bible.md`, `book1.md`, the seed and the storyteller instructions all say so.
- **The war people make.** `bible.md` section 7: the War of the Broken Concord (Solvane wants sun-glass, Ferrow wants ironwood, the Concord renewal is the spark, the Ash Hand fans it). For children: closed roads, dear bread, refugees, a spy, not battles. The bloom doesn't end it; people must.
- **Levity.** A "Light in the dark" rule: at least one funny moment in every chapter (Pip, Tobin, the thornhog, the whisperfox, Bristle's eyebrows). In Ondra, the Hush can't hold a memory people laughed at together.
- **The Reckoning switch.** A `setting` entry **Reckoning** (`off`). Jimmy sets it to `on (from chapter N)` under the hood; the Tree blooms in chapter N + 10. While off, the story stays light and the Bloom clock stops at 5 / 6. Eight teasers are scheduled across chapters 1–24.
- **Ten books** in `world/books.md`: The Waking, The Road (three versions), The Concord (two versions), The Unforgetting, The Drums, The Bloom, The World Upside Down, The Glass King, The Far Shore, The Giving. How branches work (trunk events every version reaches; branches named like `2·Salt`; untaken branches kept "in the Tree"). A `setting` entry **Branch** tracks the current one.
- **Athena's other lives:** Moss-in-Hand (Aun, Age of Roots), the Glassmaker's Apprentice (Age of Crowns), the Night Without Moon, and After. Each unlocks after a book, and what she does there echoes into the present.
- **Voices page** (`voices.html`, in ⚙️ as 🎙️ Voices): 12 storyteller voices and a few each for You, the Whisperfox and Grandmother Owl, as recorded samples, plus the iPad's own voices. ▶ to listen, ✓ to pick, a speed slider per character. 💾 saves the picks to the **Voices** setting (it asks for the family sign-in only then).
- **Recording step.** `tools/make_voice.py --db` records each published chapter whose recording is missing or out of date, with your Voices picks, uploads it to a private bucket `adv-audio`, and saves its timings on the chapter. The page plays it with line and word highlight. It runs as step 6 of the nightly storyteller. Changing a voice re-records every chapter at the next run.
- **Database:** `005_audio.sql` (the `audio` column and the private bucket). Seed: Athena's role, 24 entries (new: the war, levity, the Reckoning switch, the ten books, settings for Reckoning, Branch and Voices).

## To paste (Family project, SQL editor)

001 and 003 are already in. Paste in this order: `supabase/004_script.sql`, `supabase/005_audio.sql`, `supabase/002_seed.sql`. Each ends with a check or is safe to run twice.

## Questions for Jimmy (answer inline)

1. **Voices.** Open 🎙️ Voices on the iPad, pick, and save. Is the speed slider enough, or do you want more voices to try (for example an older, slower grandmother voice for Granny Wren)?
   - Answer:
2. **Branches in the database.** Right now the game holds one version at a time (the current branch). To keep several versions side by side (so another family member could play `2·Iron` while Athena plays `2·Salt`), chapters need a `branch` column. Now, or when the first branch comes?
   - Answer:
3. **Other lives: who starts them?** Should Athena choose an other life from a menu when one unlocks, or should the story offer it (a dream, a ring of the Tree she touches)?
   - Answer:
4. **The war's first sign.** The first trace of the war could come in Book 1 (soldiers on the Sun Road on Market Day) or wait for Book 2. Which?
   - Answer:
5. **Granny Wren's voice.** She has no recorded voice yet (she only whispers in chapter 1). Shall I add her to the voices page now?
   - Answer:
