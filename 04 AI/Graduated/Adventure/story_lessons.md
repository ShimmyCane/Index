# Adventure — story lessons

Process lessons for planning the story. Written by `gather-story-lessons-learned` (see `02 Refs/Skills/gather_story_lessons_learned.md`). Role keys only (`athena`, `bristle`, `old_lady`, `storyteller`). No scene text, no names of the people who play, no personal details. Family profiles and the family's pacing rule live in Supabase (`adv_entries`, kinds `character` and `rule`).

## 2026-11-10: setup, before the first family turn

- **Pacing:** no family scenes yet and no storyteller run. Nothing to read yet, so plan for a steady start: one main path, lighter tone until the family shows how they play.
- **Plot:** the only published chapter is chapter 1 (the peek is a poem; the whole page has a recording). Chapter 2 is the next planned one. No plan changes yet.
- **Process:** check the live database before pasting seed SQL. The seed was already in (counts matched: 4 roles, 24 entries, 8 chapters, 21 places), so pasting it again was not needed.
- **Process:** the recorder is deterministic. Re-running it with the same model and voices gives the same file. A new sound needs a different model or voice, or a different recording approach, not a re-run.
- **Process:** a fade at the start and end of each line did not change the chapter 1 recording (line edges were already near silence). The cause of the machined sound is still open: the compressed model, or a line-level problem. Test by ear before changing the model.
- **Process:** the browser's own voice is removed. A chapter with no recording says so; 🔊 reads only from the recording.
- **Process:** a multi-step change touching the family's live data should be confirmed first, then applied one statement at a time, with a read-back of the result.
