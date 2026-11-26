> **Deprecated 2026-11-25.** Adventure story skill; the project graduated to `ShimmyCane/Adventure`. It depends on `consider_actions` and `gather_story_lessons_learned`, both in this folder; `03 Projects/Adventure/` paths now live in that repo.

# Update story (Adventure storyteller)

**Purpose:** plan the story that follows, then write the next pages of the chapter, and give the next page to the family for their next turn.

**Order is fixed.** Always run `consider-actions` first (`02 Refs/Skills/consider_actions.md`). Then consider the planned story line. Then write.

**Who is it for?** Athena's family: children around seven, and their grown-ups. Warm, exciting, never scary in a way that keeps someone up at night (rule "How the storyteller writes").

## 1. Consider actions first

Run `consider_actions` in full. Its report comes before anything else.

- If a **blocking** question is open and the family is waiting, do **not** publish. Show Jimmy the questions and stop there. The rest of this skill can still run in draft.
- If the questions are answered (or none are blocking), take Jimmy's answers into account and carry on.

## 2. Consider the planned story line

Read the plan as written, not from memory:

- Planned chapter rows in `adv_chapters` (`status = 'planned'`): their `title` and `plan`.
- `03 Projects/Adventure/world/books.md` (the ten books, the branches, the Reckoning teaser schedule) and `world/book1.md` (the Book 1 outline).
- The `plan` entries in `adv_entries`, the `Branch` setting and the `Reckoning` setting.

Write down, in two or three lines each: where the story is, where it is meant to go next, and which chapter is next.

## 3. Anticipate how the interactions will play out

Using the consider-actions report, write the **likely path** for the next two or three chapters, given what the family has done. For each likely move:

- what the family does,
- what the storyteller would write in return,
- how it bends the planned line, and whether it opens a branch (`2·Salt`, `2·Iron` and so on).

Keep **one main path** and **at most two side paths**. Name the main path so the storyteller can follow it.

## 4. Plan deviations

Compare the anticipated path with the plan. For each difference, choose one:

- **Keep the plan.** The family is following it; nothing to change.
- **Adjust the plan.** A planned chapter's `plan` text changes to fit what happened. Update the planned row.
- **Retitle.** Rewrite a future chapter headline (`title`) only when the plan changed enough that the old title would mislead. Keep titles short and readable aloud.
- **Insert or merge.** Add a chapter between two planned ones, or fold one into the next, only when the story needs room. Say so in the run note.

Never switch the Reckoning on. Never move a teaser earlier than its scheduled chapter without Jimmy's word.

Log each plan change: update the planned row, and add a `plan` entry in `adv_entries` that says what changed and why. The history trigger records every change.

## 5. Rewrite the next pages

Write the next chapter following `storyteller.md`, sections 2 to 5. In short:

- Use every waiting beat, in order. Keep the family's words in Supabase; the repo gets only the chapter's form and no quotes.
- **`text_tiny`: the peek, a poem** (`research/poem structure.md`). Pick the form from the mood. Iambic tetrameter couplets for wonder, a limerick for a laugh, a trochaic chant for a spell, and a haiku when the mood is unclear. Read it aloud and check the stresses before saving.
- **`text_short`**: about 150 words, one minute aloud. Hook, what happened, one turn, one light moment, then the question.
- **`text_long`**: about 700 words, the whole page. Its `script` lines must join to `text_long` exactly (see `storyteller.md`, format section).
- **`script`**: `"music": "forest"`, a cast (voices from the `Voices` setting), `sfx` on the turn, and **director's notes** (`notes`, at most two per line, short, never spoiling an answer; see `research/minute structure.md`).
- **`whispers`** and **`prompt`** (the question with two or three options).
- Light moment in every chapter. Keep it kind and exciting, not frightening.

Check before saving:

- [ ] `text_tiny` is a poem with the right form; each line scans.
- [ ] `text_short` is about 150 words; `text_long` about 700; `text_long` equals the script's lines joined.
- [ ] No Reckoning content beyond the teaser schedule; no iPad or browser-voice references.
- [ ] The prompt is answerable, and every option has a route.

## 6. Publish: the next page for the family

Publishing is outward-facing (the family sees it). Show Jimmy the peek, the prompt and the first lines first, and publish only when he says go in this session, or when a scheduled run has been set up and approved.

When approved:

```sql
update public.adv_chapters
   set title = $t$...$t$, text_tiny = $t$...$t$, text_short = $t$...$t$, text_long = $t$...$t$,
       whispers = $j${...}$j$::jsonb, prompt = $t$...$t$, script = $j${...}$j$::jsonb,
       status = 'published', created_at = now()
 where id = '<planned chapter id>';
```

`created_at = now()` matters: the player sizes the catch-up from it.

Then mark the scenes used (`adv_turns` status `used`), add the journal notes and any places, and log the run (`adv_runs`), as in `storyteller.md` sections 5 and 7.

## 7. Record the page (bake the audio)

Only after the page is published (step 6), bake its recording. The page plays `adv_chapters.audio` with line and word highlight.

1. **Model, once per session** (in the scratchpad, never in the repo): set up Kokoro as in the header of `03 Projects/Adventure/tools/make_voice.py` (venv, `kokoro-onnx`, `soundfile`, the `kokoro-q8-shards` weights, and `voices.npz`). Skip if `model_q8.onnx` and `voices.npz` already exist there.
2. **Dry run first:** `python3 -I tools/make_voice.py --model <scratchpad model dir> --db --dry-run`, run from `03 Projects/Adventure`. It should list this page (new or out of date) and nothing else that is unexpected.
3. **Bake and upload:** the same command without `--dry-run`. It records with the cast from the **Voices** setting, uploads the MP3 to the private bucket `adv-audio`, and saves the timings on the page.
4. **Check:** `select number, page, audio is not null as has_audio from public.adv_chapters where status = 'published' order by number desc, page desc limit 1;` should show `has_audio = true`.
5. **Run note:** if any step fails (the model will not install, the upload is refused, the check is false), keep the page published, say in the run note which step failed, and leave the page to show "no recording yet". Never publish a recording that does not match the text: re-bake after any text change.

Record it in the run note as "Recorded: yes" or "Recorded: no, <step>".

## 8. Hand over the next page

End with a short message for Jimmy to share with the family:

- the peek (the poem), as it will show on the page,
- the prompt and its options,
- the chapter number and title,
- whether the recording is ready, and any note that the family should know (for example, a new character).

Do not paste the whole chapter into chat unless Jimmy asks; the page is the place to read it.

## 9. Gather lessons

Run `gather-story-lessons-learned` (`02 Refs/Skills/gather_story_lessons_learned.md`) last. It keeps the planning faster next time.
