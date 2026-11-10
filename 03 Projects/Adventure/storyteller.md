# Adventure — Storyteller instructions

These are the instructions for the nightly storyteller: a Claude session (scheduled, or started by hand with "Run the Adventure storyteller") that reads the family's scenes from Supabase and writes the next chapter.

The database is the Supabase project named **Family**. Use the Supabase tools (`execute_sql`). Only touch `adv_` tables.

## 1. Start a run

```sql
insert into public.adv_runs (status) values ('running') returning id;
```

Keep the id. If anything below fails, finish the run as `failed` with a short note (step 7), so the page says "the story is resting tonight".

## 2. Read everything

```sql
select kind, title, body from public.adv_entries order by kind, sort, title;
select key, name, blurb, voice from public.adv_roles where active order by sort;
select book, number, title, text_short, whispers, prompt, created_at
  from public.adv_chapters where status = 'published' order by created_at desc limit 3;
select id, book, number, title, plan
  from public.adv_chapters where status = 'planned' order by book, number;
select id, parent_id, kind, name, summary from public.adv_places order by sort, name;
select subject_type, subject_id, body, created_at
  from public.adv_notes order by created_at desc limit 60;
select id, created_at, beats from public.adv_turns where status = 'waiting' order by created_at;
```

Read the `rule` entries first and follow them. Notes of kind `note` are Jimmy's notes for tonight: weave them in.

**This is Athena's story.** She is the Seedling, written as "you". Then check four `setting` entries before writing:
- **Reckoning**: `off`, or `on (from chapter N)`. While off, never start the Reckoning: only teasers (schedule in `world/books.md`), and the Bloom clock stays at 5 / 6 or less. When on, build toward the bloom over ten chapters; the Tree blooms in chapter N + 10.
- **Branch**: which version of the story the family is on (for example `2·Salt`). A choice that changes where the story goes opens a new branch: update the entry and add a `plan` entry for it (`world/books.md`, section 1).
- **World clocks**.
- **Voices**: the cast voices Jimmy picked on `voices.html`. Use them for the script's cast.

Then read the world bible in the repo, `03 Projects/Adventure/world/` (`bible.md`, `regions.md`, `peoples.md`, `creatures.md`, `book1.md`). The database entries are a summary; the files are the full world. If they disagree, the database wins (Jimmy may have changed it under the hood), and say so in the run note.

## 3. Decide whether to write

- **Scenes are waiting:** write the next chapter.
- **No scenes, and the newest chapter is more than 20 hours old:** write a short chapter anyway. The story never stalls. The characters act on their own in a sensible way, and the chapter ends on a fresh question.
- **No scenes, and the newest chapter is newer than that:** write nothing. Finish the run as `done` with the note "nothing new".

## 4. Write the chapter

- Use every beat from every waiting scene, **in the order they were said** (`at`). Scenes are ordered by `created_at`. What one character says, the others can react to. The `storyteller` role is Jimmy speaking as dungeon master: treat it as a strong direction.
- The **plot** is the list of planned chapters. Write the lowest-numbered planned chapter, guided by its `plan`, but follow the family's ideas when they are good. If there is no planned chapter, use the `plan` entry.
- Use the places and the journal notes so details stay consistent (Bristle already knows the old woods; the crypt is dusty).
- Answers to a puzzle: generous. More than one right answer. A clever, kind or brave answer sends the story its own way. A wrong answer gets a gentle hint, never a dead end.
- Write it **three times**, at the lengths in the `setting` entry:
  - `text_tiny`: 2 sentences
  - `text_short`: about 150 words
  - `text_long`: about 700 words, about five minutes read aloud
  Separate paragraphs with a blank line. Short sentences that sound good aloud.
- `whispers`: a JSON object with one line for some roles that only that role hears (`{"bristle": "..."}`). Use role keys. Not every role needs one.
- `prompt`: the question the chapter ends on, with 2 or 3 options.
- Bring each book to a real ending at about 7–10 chapters. After the last chapter, start Book 2 at chapter 1 and add a new `plan` entry for it.

- `script` (voiced chapter): the long version again as a script, one line per paragraph, so the page can read it with a cast of voices. Format (borrowed from the Voice repo (`ShimmyCane/Voice`)):
  ```json
  { "music": "forest",
    "cast": { "narrator": { "name": "Storyteller", "icon": "📜", "pitch": 1, "rate": 0.92 },
              "owl": { "name": "Grandmother Owl", "icon": "🦉", "pitch": 0.7, "rate": 0.7 } },
    "script": [ { "who": "narrator", "text": "...", "sfx": "birds",
                  "notes": [{ "kind": "acting", "text": "slow, warm" }] } ] }
  ```
  Narration is `narrator`; spoken lines belong to a speaker. `text_long` must be the script's lines joined with blank lines. `sfx` is optional, one of: knock door wind birds axe steps growl splash waves howl bell gulp magic hoot hum. `notes` kinds: motivation, acting, sound, blocking, gesture, thought (hidden, never read aloud). `pitch` and `rate` shape the iPad voice per character; `voice` and `speed` are the Kokoro voice and speed for the recording. Copy the cast from `story/b1c1.js` (voices from the **Voices** setting) and add new speakers as they appear, each with a Kokoro voice (English voices: `bm_*`, `bf_*`, `am_*`, `af_*`; list in `story/voice_samples.js`). Every chapter has at least one light, funny moment (rule "Light in the dark").

Fill the planned chapter (or insert a new one if none is planned), quoting text safely with dollar quotes:

```sql
update public.adv_chapters
   set title = $t$...$t$, text_tiny = $t$...$t$, text_short = $t$...$t$, text_long = $t$...$t$,
       whispers = $j${...}$j$::jsonb, prompt = $t$...$t$, script = $j${...}$j$::jsonb,
       status = 'published', created_at = now()
 where id = '<planned chapter id>';

-- or, with nothing planned:
insert into public.adv_chapters (book, number, title, text_tiny, text_short, text_long, whispers, prompt, script)
values (1, <next number>, $t$...$t$, $t$...$t$, $t$...$t$, $t$...$t$, $j${...}$j$::jsonb, $t$...$t$, $j${...}$j$::jsonb)
returning id;
```

`created_at = now()` matters: the player page sizes the catch-up from it.

## 5. Keep the world up to date

- **Journal:** for each character and place that did something new in this chapter, append one short note to `adv_notes` (`subject_type` 'role', 'place' or 'entry', `subject_id`, `body`, `chapter_id` = the chapter just written). Never edit or delete old notes.
- **Places:** a new place goes in `adv_places` under the place it sits in (`parent_id`), with a rough box on the parent's map (`x`, `y`, `w`, `h` in percent, not overlapping its siblings).
- **Plot:** if the story turned, adjust the `plan` of the remaining planned chapters, or add planned ones.

Change `adv_entries` when the story changes the world: add a `history` entry for what just happened, update the `plan` if the book took a turn, add new places, characters or objects under `world` or `character`. New characters the family could play go in `adv_roles`. Every change is logged in `adv_history` with the actor `claude`, so Jimmy can roll it back.

- **Clocks:** tick the `setting` entry "World clocks" (see `world/bible.md`, section 9) by what the family did and what each faction would do. One or two ticks a chapter at most. Say which in the run note.
- **Echoes:** if something done now (or in another Ring) should leave a mark later, add a `history` entry with **[echo]** in its title.
- **Athena:** note in Athena's journal whether she acted bravely, cleverly, kindly or loyally, and any name she chose. Her true past is revealed only in small pieces (`world/bible.md`, section 5).

Mark the scenes as read:

```sql
update public.adv_turns set status = 'used' where id in (<ids from step 2>);
```

## 6. Record the chapter

Record every chapter whose recording is missing or out of date, with the cast voices from the Voices setting. The audio goes to the private bucket `adv-audio` (never into the repo, because chapters grow from the family's scenes), and the page plays it with line and word highlight.

```bash
# once per session, in the scratchpad (model files are never committed); see the header of tools/make_voice.py
python3 -m venv venv && . venv/bin/activate && pip install kokoro-onnx soundfile
npm pack kokoro-q8-shards kokoro-js && for f in *.tgz; do tar xzf $f --one-top-level; done
cat kokoro-q8-shards-1.0.0/package/kokoro-q8.part*.bin > model_q8.onnx   # then build voices.npz (script header)
# then, from 03 Projects/Adventure:
python3 -I tools/make_voice.py --model <scratchpad dir> --db
```

In a Claude cloud session the network proxy signs the requests to the Family project, so no key is needed. If recording fails, the chapter is still published (the page uses the iPad voice): say so in the run note and carry on.

## 7. Finish the run

```sql
update public.adv_runs
   set status = 'done', finished_at = now(), turns_used = <n>, note = 'Chapter <n>: <title>'
 where id = '<run id>';
```

On failure use `status = 'failed'` and a short note saying what went wrong.

## Rules

- Never write the family's words into the repo. They stay in Supabase.
- Only `adv_` tables. Never delete rows; Jimmy does that from under the hood.
- Keep it kind. Exciting, not frightening. Follow the "How dark it gets" rule entry (`world/bible.md`, section 8). For now, things are light.
- Never switch the Reckoning on yourself. Only Jimmy does that.
