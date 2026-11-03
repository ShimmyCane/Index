# Read Notes and Update

Purpose
Read the feedback notes that a nursery app saved to its Supabase table, turn them into project work (todo items, questions, a new convo round), and mark the handled notes as done. Built first for Expansion Wars, whose notes live in `xw_maps.notes` in the Family project (see `04 AI/Expansion Wars/brief.md`). The notes are the owner's feedback, so this skill reads them and never edits the app's code without asking.

Input
- Project name (the folder in `03 Projects/`). If none is given, ask. Don't guess.
- Optional: a status filter (`open` by default), or specific note ids.

Actions
1. Read the project's `schematic.md`, `todo.md` (if it exists), and the latest file in `convo/`. Read `04 AI/<Project>/brief.md` for the table name and where notes are stored.
2. Read the notes from the live project with the Supabase tools (`execute_sql`, project `twvqvutrcobedvuhnzxq`). Never trust a copy in the repo. For Expansion Wars:
   ```sql
   select m.id as map_id, m.title, n->>'id' as note_id, n->>'status' as status,
          n->>'at' as at, n->>'text' as text
   from public.xw_maps m, jsonb_array_elements(m.notes) n
   where coalesce(n->>'status', 'open') = 'open'
   order by m.title, n->>'at';
   ```
   If the Supabase tools are not connected, ask Jimmy to run that query in the SQL editor and paste the result, and carry on from the pasted rows.
3. Group the notes by map or screen, and for each one say:
   - what it asks for, in one sentence;
   - whether it is already built (check `todo.md` and the code), a bug, a new feature, or a design question;
   - any conflict with another note or with the current rules (for example, "send half" versus "send 25%"), and any ambiguity, with the choice you would make.
4. Write the result into the project, without changing old files:
   - Add the new items to `todo.md` under a new heading for this round (dated). Mark built items as done only if the code shows it.
   - Start a new convo file (`convo/convo vX.Y.md`, next version) with the questions that need Jimmy's answer. Never compact or rewrite an old convo.
   - Update `04 AI/<Project>/brief.md` with the round's status.
5. Report: how many notes were read, how many are built, how many need an answer, and the convo file to answer in.
6. Update the table only after Jimmy confirms which notes are handled. Show the exact `update` (below) with the note ids, and wait for a yes. Then run it and read the rows back to confirm.

   ```sql
   update public.xw_maps m
      set notes = (
            select jsonb_agg(
              case when x->>'id' = any (array['<note id>', '<note id>'])
                   then jsonb_set(
                          jsonb_set(x, '{status}', '"done"'),
                          '{text}',
                          to_jsonb(case when x->>'text' like 'Done- %' then x->>'text'
                                        else 'Done- ' || (x->>'text') end))
                   else x end
              order by ordinality)
            from jsonb_array_elements(m.notes) with ordinality as t(x, ordinality)),
          updated_at = timezone('utc', now())
    where m.id = '<map id>';
   ```
   Replace the map id and note ids. Marking a note done sets its status to `done` and prefixes its text with `Done- ` (the owner's convention: "When notes are addressed, prefix them with Done-"). The time and id stay the same. A note already prefixed is left as it is.

Rules
- Read is free; update needs Jimmy's yes each time. Keep an update to the notes listed in the confirmation.
- Never delete notes. Never edit a note's `at` or `id`. The only text change is the `Done- ` prefix when a note is marked done.
- Don't put keys, project refs or personal data in the repo. Note text is the owner's feedback: copy it into convo or todo only as written, and leave out anything that looks personal.
- If the table can't be reached, say so and do steps 3–5 from any pasted rows. Don't guess at notes you haven't seen.
- Convo files are public. Summarise notes; don't paste anything private that a note might include.
