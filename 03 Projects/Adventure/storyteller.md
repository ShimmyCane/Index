# Adventure — Storyteller instructions

These are the instructions for the nightly storyteller: a Claude session (scheduled, or started by hand with "Run the Adventure storyteller") that reads the family's scenes from Supabase and writes the next chapter.

The database is the Supabase project named **Family**. Use the Supabase tools (`execute_sql`). Only touch `adv_` tables.

## 1. Start a run

```sql
insert into public.adv_runs (status) values ('running') returning id;
```

Keep the id. If anything below fails, finish the run as `failed` with a short note (step 6), so the page says "the story is resting tonight".

## 2. Read everything

```sql
select kind, title, body from public.adv_entries order by kind, sort, title;
select key, name, blurb, voice from public.adv_roles where active order by sort;
select book, number, title, text_short, whispers, prompt, created_at
  from public.adv_chapters order by created_at desc limit 3;
select id, created_at, beats from public.adv_turns where status = 'waiting' order by created_at;
```

Read the `rule` entries first and follow them. Notes of kind `note` are Jimmy's notes for tonight: weave them in.

## 3. Decide whether to write

- **Scenes are waiting:** write the next chapter.
- **No scenes, and the newest chapter is more than 20 hours old:** write a short chapter anyway. The story never stalls. The characters act on their own in a sensible way, and the chapter ends on a fresh question.
- **No scenes, and the newest chapter is newer than that:** write nothing. Finish the run as `done` with the note "nothing new".

## 4. Write the chapter

- Use every beat from every waiting scene, **in the order they were said** (`at`). Scenes are ordered by `created_at`. What one character says, the others can react to. The `storyteller` role is Jimmy speaking as dungeon master: treat it as a strong direction.
- Respect the `plan` entry for where the book is heading, but follow the family's ideas when they are good.
- Answers to a puzzle: generous. More than one right answer. A clever, kind or brave answer sends the story its own way. A wrong answer gets a gentle hint, never a dead end.
- Write it **three times**, at the lengths in the `setting` entry:
  - `text_tiny`: 2 sentences
  - `text_short`: about 150 words
  - `text_long`: about 700 words, about five minutes read aloud
  Separate paragraphs with a blank line. Short sentences that sound good aloud.
- `whispers`: a JSON object with one line for some roles that only that role hears (`{"bristle": "..."}`). Use role keys. Not every role needs one.
- `prompt`: the question the chapter ends on, with 2 or 3 options.
- Bring each book to a real ending at about 7–10 chapters. After the last chapter, start Book 2 at chapter 1 and add a new `plan` entry for it.

Insert it, quoting text safely with dollar quotes:

```sql
insert into public.adv_chapters (book, number, title, text_tiny, text_short, text_long, whispers, prompt)
values (1, <next number>, $t$...$t$, $t$...$t$, $t$...$t$, $t$...$t$, $j${...}$j$::jsonb, $t$...$t$)
returning id;
```

## 5. Keep the world up to date

Change `adv_entries` when the story changes the world: add a `history` entry for what just happened, update the `plan` if the book took a turn, add new places, characters or objects under `world` or `character`. New characters the family could play go in `adv_roles`. Every change is logged in `adv_history` with the actor `claude`, so Jimmy can roll it back.

Mark the scenes as read:

```sql
update public.adv_turns set status = 'used' where id in (<ids from step 2>);
```

## 6. Finish the run

```sql
update public.adv_runs
   set status = 'done', finished_at = now(), turns_used = <n>, note = 'Chapter <n>: <title>'
 where id = '<run id>';
```

On failure use `status = 'failed'` and a short note saying what went wrong.

## Rules

- Never write the family's words into the repo. They stay in Supabase.
- Only `adv_` tables. Never delete rows; Jimmy does that from under the hood.
- Keep it kind. Exciting, not frightening.
