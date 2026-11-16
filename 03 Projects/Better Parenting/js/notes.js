// Notes for improvement: the feedback box in the ⚙️ panel (from 02 Refs/Skills/feedback_notes.md).
// Device first, under one key, inside try/catch. Also sent to the family table bp_notes when signed in (family.js).
(function () {
  var KEY = 'bp.notes';
  var where = { page: 'index.html', item: '', label: '' };
  var notes = [];
  try { notes = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { notes = []; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(notes)); } catch (e) { /* storage full or blocked */ } }
  function setContext(ctx) { where = Object.assign({}, where, ctx); }   // called when a scenario or skill opens
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
    var note = { id: 'n-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      at: new Date().toISOString(), status: 'open', text: text, where: Object.assign({}, where), version: window.APP_VERSION || '' };
    notes.push(note);
    box.value = ''; save(); render();
    if (window.Family && Family.signedIn()) {
      Family.pushNotes([note]).catch(function (e) { if (typeof logError === 'function') logError('Note was not sent to the family database', e); });
    }
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
