/* Generate Clouds — "Notes for improvement" in the ⚙️ panel.
   Notes stay on this device (local storage). They are never sent anywhere. */
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
        li.textContent = (n.status === 'done' ? '✅ ' : '📝 ') + (n.where && n.where.label ? n.where.label + ' · ' : '') +
          new Date(n.at).toLocaleString() + '\n' + n.text;
        list.appendChild(li);
      });
    GC.$('noteWhere').textContent = where.label ? 'This note will be about: ' + where.label : '';
  }
  function add() {
    var box = GC.$('noteText'), text = box.value.trim();
    if (!text) return;
    notes.push({ id: 'n-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7), at: new Date().toISOString(), status: 'open',
      text: text, where: { page: where.page, item: where.item, label: where.label }, version: GC.VERSION });
    box.value = ''; save(); render();
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
    all: function () { return notes.slice(); }
  };
})();
