/* Generate Clouds — "Notes for improvement" in the ⚙️ panel.
   Notes are saved on this device first (local storage). When you sign in to the studio database
   (js/cloud.js) they are also kept there, with the same id and time. Never sent anywhere else. */
(function () {
  'use strict';
  var GC = window.GC = window.GC || {};
  var KEY = 'gc.notes', DIRTY = 'gc.notes.dirty';
  var where = { page: 'index.html', item: '', label: '' };
  var notes = GC.store.get(KEY, []);
  if (!Array.isArray(notes)) notes = [];
  var dirty = GC.store.get(DIRTY, {}) || {};                  // notes whose done / reopen change the database has not seen yet
  function save() { GC.store.set(KEY, notes); }
  function saveDirty() { GC.store.set(DIRTY, dirty); }
  function render() {
    var filter = GC.$('noteFilter').value, list = GC.$('noteList');
    list.textContent = '';
    notes.filter(function (n) { return filter === 'all' || n.status === filter; })
      .sort(function (a, b) { return a.at < b.at ? 1 : -1; })
      .forEach(function (n) {
        var li = document.createElement('li');
        li.textContent = (n.status === 'done' ? '✅ ' : '📝 ') + (GC.Cloud && GC.Cloud.isSynced(n.id) ? '☁️ ' : '') + (n.where && n.where.label ? n.where.label + ' · ' : '') +
          new Date(n.at).toLocaleString() + '\n' + n.text;
        var b = document.createElement('button'); b.type = 'button'; b.className = 'btn noteBtn';
        b.textContent = n.status === 'done' ? '↺ Reopen' : '✓ Done'; b.setAttribute('aria-label', (n.status === 'done' ? 'Reopen' : 'Mark done') + ': ' + n.text.slice(0, 40));
        b.addEventListener('click', function () { setStatus(n.id, n.status === 'done' ? 'open' : 'done'); });
        li.appendChild(document.createElement('br')); li.appendChild(b);
        list.appendChild(li);
      });
    GC.$('noteWhere').textContent = where.label ? 'This note will be about: ' + where.label : '';
  }
  function add() {
    var box = GC.$('noteText'), text = box.value.trim();
    if (!text) return;
    var ctx = (GC.Notes && GC.Notes.contextNow && GC.Notes.contextNow()) || where;
    notes.push({ id: 'n-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7), at: new Date().toISOString(), status: 'open',
      text: text, where: { page: ctx.page || where.page, item: ctx.item, label: ctx.label }, version: GC.VERSION });
    box.value = ''; save(); render();
    if (GC.Cloud) GC.Cloud.noteAdded();
  }
  // Done / Reopen. A done note has status done and the text starts with "Done- " (the owner's convention); reopening removes both.
  function setStatus(id, status) {
    var n = null; notes.forEach(function (x) { if (x.id === id) n = x; });
    if (!n || n.status === status) return;
    n.status = status;
    if (status === 'done' && !/^Done- /.test(n.text)) n.text = 'Done- ' + n.text;
    if (status === 'open') n.text = n.text.replace(/^Done- /, '');
    dirty[id] = true; save(); saveDirty(); render();
    if (GC.Cloud) GC.Cloud.noteChanged(n);
  }
  // Notes the database knows: add the ones this device lacks, and take its done marks.
  function merge(rows) {
    var by = {}, changed = 0; notes.forEach(function (n) { by[n.id] = n; });
    rows.forEach(function (r) {
      var n = by[r.id];
      if (!n) { notes.push({ id: r.id, at: r.noted_at, status: r.status, text: r.text, where: { page: r.page, item: r.item, label: r.label }, version: r.version }); changed++; }
      else if (!dirty[r.id] && (r.status !== n.status || r.text !== n.text)) { n.status = r.status; n.text = r.text; changed++; }       // the database wins unless this device has a change it has not sent
    });
    if (changed) { save(); render(); }
    return changed;
  }
  GC.Notes = {
    init: function () {
      GC.$('noteSave').addEventListener('click', add);
      GC.$('noteFilter').addEventListener('change', render);
      GC.$('noteCopy').addEventListener('click', function () {
        var out = JSON.stringify(notes, null, 2);
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(out).catch(function () { window.prompt('Copy the notes:', out); });
        else window.prompt('Copy the notes:', out);
      });
      render();
    },
    setContext: function (ctx) { where = { page: 'index.html', item: ctx.item || '', label: ctx.label || '' }; if (GC.$('noteWhere')) render(); },
    all: function () { return notes.slice(); },
    merge: merge,
    setStatus: setStatus,
    dirtyIds: function () { return Object.keys(dirty); },
    clearDirty: function (id) { delete dirty[id]; saveDirty(); },
    render: function () { if (GC.$('noteList')) render(); }
  };
})();
