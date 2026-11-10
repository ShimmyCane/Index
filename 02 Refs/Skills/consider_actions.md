# Consider actions (Adventure storyteller)

**Purpose:** before any story step, look at everything Jimmy and the family have done, judge the earlier decisions with hindsight, and work out the questions to ask. This skill is **read-only**. It changes nothing in the database or the repo. It ends with a report in chat.

Use it before `update-story`, at the start of a session on the Adventure project, or whenever Jimmy asks what the story needs.

## 1. Read everything

Use the Family project (`twvqvutrcobedvuhnzxq`), `execute_sql`, and touch only `adv_` tables. Read; do not write.

```sql
-- Jimmy's notes, the rules, settings and the world (read them all, rules first)
select kind, title, body, updated_at from public.adv_entries order by kind, sort, title;
-- Every journal note (what happened to a role or place, and why)
select subject_type, subject_id, body from public.adv_notes;
-- The family's scenes (waiting and used), in the order they were said
select id, status, beats, created_at from public.adv_turns order by created_at desc limit 20;
-- Chapters: the published story and the planned line
select book, number, title, status, plan, prompt, created_at from public.adv_chapters order by book, number;
-- Storyteller runs and their notes
select status, note, started_at, finished_at from public.adv_runs order by started_at desc limit 20;
-- Recent changes and who made them (family or claude)
select table_name, action, actor, at from public.adv_history order by at desc limit 50;
```

If a column name differs, read the columns first (`information_schema.columns`) and adjust. Note any column you could not read.

Also read, in the repo: `03 Projects/Adventure/world/books.md`, `world/book1.md`, `storyteller.md`, `04 AI/Adventure/brief.md`, `04 AI/Adventure/story_lessons.md` (if it exists).

## 2. Inventory the decisions

Make a table of every decision that shaped the story so far:

| When | Who (role, Jimmy, or storyteller) | What was decided or done | Why (from a note, a rule or a setting) | Outcome so far |

Include: each published chapter and its prompt, each setting change (Reckoning, Branch, World clocks, Voices), each run and its note, each planned chapter that was changed, and each family scene.

## 3. Judge with hindsight

For each decision, mark it **kept**, **reconsider**, or **missed**. Check these in particular:

- **Rules kept?** Reckoning still `off` unless Jimmy switched it on; the Bloom clock at 5/6 or less while off; a light moment in every chapter; "How dark it gets" respected; the teasers on schedule.
- **Prompts answerable?** Did the family have a clear choice? Were the options fair, and did a clever, kind or brave answer each have a route?
- **Beats used?** Did every waiting scene get used, in order? Was any family beat dropped?
- **Runs on time?** Did the storyteller run when scenes were waiting? A chapter more than 20 hours late, with scenes waiting, is a miss.
- **Matches?** Does each published chapter's recording still match its text? Does the peek poem (`text_tiny`) follow `research/poem structure.md`?
- **Drift?** Has the world drifted from the seed, and was that deliberate? Check the history entries that Jimmy and the family changed.
- **Missed?** Anything Jimmy asked for in a note that never reached the story. Anything the storyteller invented without a reason.

Give the reason for each mark. Do not judge a decision by its outcome alone; judge it by what was known then.

## 4. Anticipate

From the roles that have acted, the open prompt and the planned chapter, write the **likely next moves**: what the family will probably do, which roles will likely act, and which branch of `world/books.md` that points to. Say how confident you are (high, medium, low), and what would change the guess.

Also list the **risks**: a role that has gone quiet, a puzzle that is too hard or too easy, a scare that is too dark, a plan point that a likely move would skip.

## 5. Propose corrections

List the fixes you would make, one line each, with the rule or file they touch. Do **not** apply them. Examples: retitle a planned chapter, move a teaser, tick a world clock, fix a stale plan line, correct a repo file that still describes the iPad voice.

## 6. Ask Jimmy

Write a numbered list of questions. Each should be answerable in a word or a line. Mark the ones that **block** the next chapter. Ask about:

- any decision marked **reconsider** or **missed** (do you want it changed?)
- any change to the planned line you expect (a branch, a new character, a bigger or smaller war beat)
- how the family is feeling about the story (tough time, or really into it?), because this sets the difficulty and the mood
- anything that only Jimmy knows (an off-screen plan, a family event that will shape a scene)

## 7. Report

Put the report in chat with these headings, in this order:

1. **What I read** (tables and rows counted; anything I could not read)
2. **Decisions and how they look now** (the table, with marks)
3. **Likely next moves and risks** (with confidence)
4. **Proposed corrections** (not applied)
5. **Questions for Jimmy** (blocking ones first)

Then stop. Do not write the next chapter here; that is `update-story`.

## Privacy

- The report stays in chat. Do not commit family scene text or family details to the repo.
- Use role keys (`athena`, `bristle`, `old_lady`, `storyteller`) and the characters' names in the world. Do not add real names of the people who play them.
