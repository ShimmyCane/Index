/* Generate Clouds — "Notes for improvement" in the ⚙️ panel.
   Notes are saved on this device first (local storage). When you sign in to the studio database
   (js/cloud.js) they are also kept there, with the same id and time. Never sent anywhere else. */
(function () {
  'use strict';
  var GC = window.GC = window.GC || {};
  var KEY = 'gc.notes';
  var where = { page: 'index.html', item: '', label: '' };
  var notes = GC.store.get(KEY, []);
  if (!Array.isArray(notes)) notes = [];
  function save() { GC.store.set(KEY, notes); }
  function render() {
    var filter = GC.$('noteFilter').value, list = GC.$('noteList');
    list.textContent = '';
    notes.filter(function (n) { return filter === 'all' || n.status === 'open'; })
      .sort(function (a, b) { return a.at < b.at ? 1 : -1; })
      .forEach(function (n) {
        var li = document.createElement('li');
        li.textContent = (n.status === 'done' ? '✅ ' : '📝 ') + (GC.Cloud && GC.Cloud.isSynced(n.id) ? '☁️ ' : '') + (n.where && n.where.label ? n.where.label + ' · ' : '') +
          new Date(n.at).toLocaleString() + '\n' + n.text;
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
  // Notes the database knows: add the ones this device lacks, and take its done marks.
  function merge(rows) {
    var by = {}, changed = 0; notes.forEach(function (n) { by[n.id] = n; });
    rows.forEach(function (r) {
      var n = by[r.id];
      if (!n) { notes.push({ id: r.id, at: r.noted_at, status: r.status, text: r.text, where: { page: r.page, item: r.item, label: r.label }, version: r.version }); changed++; }
      else if (r.status === 'done' && n.status !== 'done') { n.status = 'done'; n.text = r.text; changed++; }
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
    render: function () { if (GC.$('noteList')) render(); }
  };
})();
