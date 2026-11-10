// 給我們的改進意見: the feedback box in the ⚙️ panel (from 02 Refs/Skills/feedback_notes.md).
// Notes are saved on this device only, under one key, inside try/catch. Nothing is sent anywhere.
(function () {
  var KEY = 'zhbh.notes';          // one key per app
  var VERSION = '0.1.0';           // the app's version (see app.js)
  var where = { page: location.pathname.split('/').pop() || 'index.html', item: '', label: '' };
  var notes = [];
  try { notes = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { notes = []; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(notes)); } catch (e) { /* storage full or blocked */ } }
  function setContext(ctx) { where = Object.assign({}, where, ctx); }   // called when the child moves to another character
  function render() {
    var filter = document.getElementById('noteFilter').value, list = document.getElementById('noteList');
    list.textContent = '';
    notes.filter(function (n) { return filter === 'all' || n.status === 'open'; })
      .sort(function (a, b) { return a.at < b.at ? 1 : -1; })
      .forEach(function (n) {
        var li = document.createElement('li');
        li.textContent = (n.status === 'done' ? '✅ ' : '📝 ') + (n.where && n.where.label ? n.where.label + ' · ' : '') +
          new Date(n.at).toLocaleString('zh-TW') + '\n' + n.text;
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
    else window.prompt('複製意見：', out);
  });
  window.AppNotes = { setContext: setContext, add: addNote, all: function () { return notes.slice(); } };
  render();
})();
