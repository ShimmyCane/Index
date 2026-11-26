# Feedback Loop (capture, process, consolidate)

**Purpose:** let the person testing a page leave a note on the exact thing on screen while they use it, turn those notes into project work, then keep the lessons. One file for the whole loop. Merged on 2026-11-25 from `feedback_notes.md`, `read_notes_and_update.md` and `Workflow/feedback_loop.md` (the first two are in `deprecated/`).

| Stage | Command | Section |
|---|---|---|
| Plan | part of `new project workflow.md` step 4 | 1 |
| Capture: build the notes box | `/feedback-notes` | 2 |
| Process: turn notes into work | `/review-notes-and-update <project>` | 3 |
| Consolidate: keep the lessons | `/ai-consolidate` | 4 |

`/feedback-loop` runs this whole file; ask which stage if it is not clear.

---

## 1. Plan

Does the project have a page that people will test or play? If no, skip the loop. If yes, record in `schematic.md`:
- where testers leave notes (the ⚙️ panel);
- what a note can point to (a map, a level, a card, a screen, a step);
- storage: this device only, or also the database when signed in.

---

## 2. Capture: build the notes box

Design
- A **"Notes for improvement"** box in the ⚙️ panel (see `04 AI/Skills/settings_gear.md`): a text box, a Save button, and a list of saved notes with a filter for open and done.
- Each note is saved with the item it is about, the page, the time and the app version. The tester does not type that context.
- **Device first.** Notes are saved in local storage under one key per app, inside a try/catch. They stay after the browser closes. The page works without storage or a network.
- **Database only when it must persist** across devices (follow `04 AI/Skills/supabase_setup.md`). Sent only when signed in. Row-level security on; owner or family only.
- Notes are never sent anywhere else, and never auto-posted.

Note shape (the same in local storage and in a table)
```json
{ "id": "n-<time>-<random>", "at": "2026-11-04T10:12:00Z", "status": "open", "text": "...",
  "where": { "page": "play.html", "item": "map-03", "label": "Forest, step 3" }, "version": "1.2.0" }
```
`id`, `at`, `status` and `text` are the fields the review needs. Never change an `id` or an `at`.

### General notes table (2026-11-18): use this for new projects

Notes from every project go to one general table in the **Family** project, so they can be sorted by project and sub-project in one place. The architecture project can use the same shape later.

- **Table `gen_notes`:** `identifier` (N-0001, never changed), `project`, `sub_project`, `status` (`open`, `done` or `closed`), `description`, `item` (what was on screen), `identifiers` (JSON, one value per code), `version`, `noted_at` (never changed).
- **Index table `gen_notes_index`:** one row per identifier code (`code`, `project` or `all`, `name`, `meaning`, `unit`, `sort_order`). A project may add its own codes; old notes keep the values they were written with.
- **Identifiers are per note.** Each project picks its own codes (for a game: health `HP`, time played `TIME`, height `ALT`). The note stores the values at the moment it was written.
- **Sorting:** by project, sub-project, status or time. Status order: open, then done, then closed.
- **Check the live table list before relying on it.** The SQL (`supabase/001_gen_notes.sql`) was recorded as not applied, and that file is not in this repo now.
- The ⚙️ panel shows the notes with sort buttons, status buttons and an identifier index.

### Steps
1. Name the items a note can point to (section 1).
2. Build the box in the ⚙️ panel from the starter below. Each page passes its own `where` context.
3. Read back: open notes first, with label and time. Done notes stay visible under the filter.
4. Optional: a "Copy notes" button puts the JSON on the clipboard for pasting into a chat.
5. Test with `/smoke-test`: save a note, reload, it is still there; the label matches the item; zero console errors.

Starter (copy into the app; classic script, no build)
```html
<section id="notesBox" class="notesBox">
  <h3>Notes for improvement</h3>
  <textarea id="noteText" rows="3" placeholder="What would make this better?"></textarea>
  <div class="row"><button id="noteSave" type="button">Save note</button>
    <button id="noteCopy" type="button">Copy notes</button>
    <select id="noteFilter"><option value="open">Open</option><option value="all">All</option></select></div>
  <ul id="noteList"></ul>
</section>
```
```js
(function () {
  var KEY = 'app.notes';           // one key per app; rename it for each app
  var VERSION = '0.1.0';           // the app's version
  var where = { page: location.pathname.split('/').pop() || 'index.html', item: '', label: '' };
  var notes = [];
  try { notes = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { notes = []; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(notes)); } catch (e) { /* storage full or blocked */ } }
  function setContext(ctx) { where = Object.assign({}, where, ctx); }   // call when the user moves to another item
  function render() {
    var filter = document.getElementById('noteFilter').value, list = document.getElementById('noteList');
    list.textContent = '';
    notes.filter(function (n) { return filter === 'all' || n.status === 'open'; })
      .sort(function (a, b) { return a.at < b.at ? 1 : -1; })
      .forEach(function (n) {
        var li = document.createElement('li');
        li.textContent = (n.status === 'done' ? '✅ ' : '📝 ') + (n.where && n.where.label ? n.where.label + ' · ' : '') +
          new Date(n.at).toLocaleString() + '\n' + n.text;
        list.appendChild(li);
      });
  }
  function addNote() {
    var box = document.getElementById('noteText'), text = box.value.trim();
    if (!text) return;
    notes.push({ id: 'n-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      at: new Date().toISOString(), status: 'open', text: text, where: where, version: VERSION });
    box.value = ''; save(); render();
  }
  document.getElementById('noteSave').addEventListener('click', addNote);
  document.getElementById('noteFilter').addEventListener('change', render);
  document.getElementById('noteCopy').addEventListener('click', function () {
    var out = JSON.stringify(notes, null, 2);
    if (navigator.clipboard) navigator.clipboard.writeText(out).catch(function () {});
    else window.prompt('Copy the notes:', out);
  });
  window.AppNotes = { setContext: setContext, add: addNote, all: function () { return notes.slice(); } };
  render();
})();
```

---

## 3. Process: turn notes into work

The notes are the owner's feedback. This stage reads them and never edits the app's code without asking.

Input
- Project name (the folder in `03 Projects/`, or a graduated project's repo). If none is given, ask. Don't guess.
- Optional: a status filter (`open` by default), or specific note ids.

Actions
1. Read the project's `schematic.md`, `todo.md` (if it exists) and the latest file in `convo/`. Read `04 AI/<Project>/brief.md` for the table name and where notes are stored.
2. Read the notes from the live project with the Supabase tools (`execute_sql`; Family project `twvqvutrcobedvuhnzxq`). Never trust a copy in the repo. Pasted "Copy notes" JSON also works. If the tools are not connected, ask Jimmy to run the query and paste the rows.

   New projects use `gen_notes`:
   ```sql
   select identifier, project, sub_project, status, noted_at, item, version, description
   from public.gen_notes
   where status = 'open' and project = '<project>'
   order by noted_at;
   ```
   Older apps keep their own tables. One row per note (for example `public.wtc_notes`):
   ```sql
   select id, page, version, status, noted_at, text
   from public.wtc_notes
   where status = 'open' and text not like 'Done- %'
   order by noted_at;
   ```
   Notes held as JSON on another row (Expansion Wars, `xw_maps.notes`):
   ```sql
   select m.id as map_id, m.title, n->>'id' as note_id, n->>'status' as status,
          n->>'at' as at, n->>'text' as text
   from public.xw_maps m, jsonb_array_elements(m.notes) n
   where coalesce(n->>'status', 'open') = 'open'
     and n->>'text' not like 'Done- %'
   order by m.title, n->>'at';
   ```
3. Group the notes by item or screen. For each, say:
   - what it asks for, in one sentence;
   - whether it is already built (check `todo.md` and the code), a bug, a new feature or a design question;
   - any conflict with another note or a current rule, and any ambiguity, with the choice you would make.
4. Write the result into the project, without changing old files:
   - Add new items to `todo.md` under a dated heading. Mark built items done only if the code shows it.
   - Start a new convo file (`convo/convo vX.Y.md`) with the questions that need Jimmy's answer. Never compact or rewrite an old convo.
   - Update `04 AI/<Project>/brief.md` with the round's status.
5. Report: how many notes were read, how many are built, how many need an answer, and the convo file to answer in.

### Marking notes done

Follow `jimmy_preferences.md` §10 (2026-11-21), which replaced the earlier wait for a per-note yes:
- **After a build,** mark every note from that round done. Jimmy reopens any that are still a problem.
- **A review with no build** marks nothing.
- Update only the ids that were read, read the rows back, and say what was marked.
- Questions and unbuilt ideas stay in the convo, so a done mark loses nothing.

How to mark, by table:
- `gen_notes`: set `status = 'done'` for those `identifier` values. No text prefix.
- Older tables: set `status` to `done` and prefix the text with `Done- ` (the owner's earlier convention). A note already prefixed is left as it is. With one row per note, update `status` and `text` for those ids. For JSON notes (replace the map id and note ids):
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

---

## 4. Consolidate

Run `/ai-consolidate` after the round's work is built. It updates the brief and lessons, marks superseded decisions and promotes reusable patterns.

---

## Rules
- **Never delete notes.** Delete rows only if Jimmy asks in writing for those exact rows, and say it cannot be undone.
- **Keep the tester's words.** Never edit a note's id or time. The only text change is the `Done- ` prefix on the older tables.
- On older tables, notes whose text starts with `Done- ` are handled and skipped, even if their status is still `open`.
- **Privacy:** convo files are public. Copy note text only as written, and leave out anything that looks personal. Never commit a local-storage export or note dump. Run `/privacy-check` before a commit that touches notes.
- No service-role keys, passwords or personal data in the repo. Browser code gets the publishable key only.
- If the table can't be reached, say so and work from pasted rows. Don't guess at notes you haven't seen.
- Say what was not tested (real finger, real device storage limits).

## Lessons this comes from
- Expansion Wars: notes stored with the map; the "Done- " prefix marked handled notes.
- Fishes and Felix Maze: feedback and flags saved with the item they were about, device first, then to the family table once signed in.
