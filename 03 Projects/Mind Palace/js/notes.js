/* Mind Palace: "Notes for improvement" in the ⚙️ panel (02 Refs/Skills/feedback_notes.md).
   Notes stay on this device. They are sent nowhere. */
(function () {
  'use strict';
  var MP = window.MP = window.MP || {};
  var where = { page: location.pathname.split('/').pop() || 'index.html', item: '', label: 'Whole palace' };
  var notes = MP.store.get(MP.KEYS.notes, []) || [];
  if (!Array.isArray(notes)) notes = [];
  function save() { MP.store.set(MP.KEYS.notes, notes); }
  function render() {
    var list = document.getElementById('noteList'); if (!list) return;
    var filter = document.getElementById('noteFilter').value;
    document.getElementById('noteWhere').textContent = 'About: ' + where.label;
    list.textContent = '';
    notes.filter(function (n) { return filter === 'all' || n.status === 'open'; })
      .sort(function (a, b) { return a.at < b.at ? 1 : -1; })
      .forEach(function (n) {
        var li = document.createElement('li');
        li.textContent = (n.status === 'done' ? '✅ ' : '📝 ') + (n.where && n.where.label ? n.where.label + ' · ' : '') + new Date(n.at).toLocaleString() + '\n' + n.text;
        list.appendChild(li);
      });
  }
  function add() {
    var box = document.getElementById('noteText'), text = box.value.trim(); if (!text) return;
    notes.push({ id: 'n-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7), at: new Date().toISOString(), status: 'open', text: text,
      where: Object.assign({}, where), version: MP.VERSION });
    box.value = ''; save(); render();
  }
  MP.Notes = {
    setContext: function (ctx) { where = Object.assign({ page: where.page }, ctx); render(); },
    all: function () { return notes.slice(); },
    init: function () {
      document.getElementById('noteSave').addEventListener('click', add);
      document.getElementById('noteFilter').addEventListener('change', render);
      document.getElementById('noteCopy').addEventListener('click', function () {
        var out = JSON.stringify(notes, null, 2);
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(out).catch(function () {});
        else window.prompt('Copy the notes:', out);
      });
      render();
    }
  };
})();
