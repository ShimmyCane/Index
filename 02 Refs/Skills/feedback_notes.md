# Feedback Notes (in-page notes for initial testing)

Purpose
Let the person testing a page leave a note on the exact thing on screen (a map, a level, a screen, a step) while they use it, so feedback is gathered during the first tests, not from memory afterwards. The notes are read back in the page, and later pulled into project work with `read-notes-and-update`.

This is the writing side. Reading and turning notes into todo items is `02 Refs/Skills/read_notes_and_update.md` (`/read-notes-and-update`).

Design
- A **"Notes for improvement"** box in the ⚙️ panel (see `settings_gear.md`): a text box, a Save button, and a list of saved notes with a filter for open and done.
- Each note is saved with the item it is about (a map name, a level, a screen), the page, the time, and the app version. The tester does not have to type that context.
- **Device first.** Notes are saved in the browser's local storage under one key per app, inside a try/catch. The page works without it.
- **Database only when it must persist.** If the app needs notes that survive a new device, write them to a table (follow `supabase_project`). Use the same shape as the existing tables (Expansion Wars' `xw_maps.notes`, Fishes' `fish_notes`), so `read-notes-and-update` reads them with the same query. The table is owner or family only, with row-level security on.
- Notes are never sent anywhere else, and never auto-posted.

Note shape (the same in local storage and in any table)
```json
{ "id": "n-<time>-<random>", "at": "2026-11-04T10:12:00Z", "status": "open", "text": "...",
  "where": { "page": "play.html", "item": "map-03", "label": "Forest, step 3" }, "version": "1.2.0" }
```
`id`, `at`, `status` and `text` are the fields the read query needs. Never change an `id` or an `at`. Marking a note done sets `status` to `done` and prefixes `text` with `Done- ` (the owner's convention).

Steps
1. **Plan it in the schematic** (the start-project skill asks for this on every page the user plays or uses). Name the items a note can point to.
2. **Build the box in the settings panel** using the snippet below. Each page passes its own `where` context when it opens.
3. **Read back.** The list shows open notes first, with the label and the time. Done notes stay visible under the filter.
4. **Export** (optional): a "Copy notes" button puts the JSON on the clipboard, so the tester can paste it into a chat.
5. **Test it** with `smoke_test` (save a note, reload, the note is still there; the label matches the item; zero console errors).
6. **Hand over.** The tester uses the page; Jimmy or Claude later runs `/read-notes-and-update`.

Rules
- Keep the tester's words as written. Do not edit a note's text, only mark it done.
- The notes file or table is data, not code: never commit a local-storage export or a note file that might contain personal details. Run `privacy_check` before any commit that touches notes.
- Say what was not tested (real finger, real device storage limits) in the report.

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

Lessons this comes from
- Expansion Wars: notes are stored with the map and read by `read-notes-and-update`; the "Done- " prefix marks handled notes.
- Fishes and Felix Maze: feedback and flags were saved with the item they were about, device first, then to the family table once signed in.
