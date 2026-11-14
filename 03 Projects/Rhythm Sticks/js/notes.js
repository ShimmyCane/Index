// Notes for improvement (from 02 Refs/Skills/feedback_notes.md).
// Saved on this device first. When signed in to the family database they are also sent there (see family.js).
// Each note carries the mode it is about, the time, and the app version.
(function () {
  'use strict';
  var KEY = 'rs.notes';
  var where = { page: 'index.html', item: '', label: '' };
  var notes = [];
  try { notes = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { notes = []; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(notes)); } catch (e) { /* storage full or blocked */ } }
  function $(id) { return document.getElementById(id); }
  function setContext(ctx) { where = Object.assign({}, where, ctx); }

  function render() {
    var filter = $('noteFilter').value, list = $('noteList');
    list.textContent = '';
    notes.filter(function (n) { return filter === 'all' || n.status === 'open'; })
      .sort(function (a, b) { return a.at < b.at ? 1 : -1; })
      .forEach(function (n) {
        var li = document.createElement('li');
        li.className = n.status === 'done' ? 'done' : '';
        var btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'doneBtn';
        btn.textContent = n.status === 'done' ? 'Reopen' : 'Done';
        btn.addEventListener('click', function () { setStatus(n.id, n.status === 'done' ? 'open' : 'done'); });
        var text = document.createElement('div');
        text.textContent = (n.status === 'done' ? '✅ ' : '📝 ') + (n.where && n.where.label ? n.where.label + ' · ' : '') +
          new Date(n.at).toLocaleString() + '\n' + n.text;
        li.appendChild(btn); li.appendChild(text);
        list.appendChild(li);
      });
  }
  function setStatus(id, status) {
    notes.forEach(function (n) { if (n.id === id) n.status = status; });
    save(); render();
    if (window.Family && Family.signedIn()) Family.setStatus(id, status).catch(function (e) { RS.err('Could not update the note in the family database', e); });
  }
  function addNote() {
    var box = $('noteText'), text = box.value.trim();
    if (!text) return;
    var note = { id: 'n-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      at: new Date().toISOString(), status: 'open', text: text, where: where, version: RS.version };
    notes.push(note);
    box.value = ''; save(); render();
    if (window.Family && Family.signedIn()) {
      Family.pushNotes([note]).catch(function (e) { RS.err('Note not sent to the family database', e); });
    }
  }
  // Rows from the family table: update the status of notes we have, and add notes we do not (saved on another device).
  function merge(rows) {
    var byId = {}, changed = false;
    notes.forEach(function (n) { byId[n.id] = n; });
    rows.forEach(function (r) {
      var n = byId[r.id];
      if (n) {
        if (r.status && n.status !== r.status) { n.status = r.status; changed = true; }
        if (r.status === 'done' && r.text && n.text !== r.text && /^Done- /.test(r.text)) { n.text = r.text; changed = true; }
      } else {
        notes.push({ id: r.id, at: new Date(r.noted_at).toISOString(), status: r.status || 'open', text: r.text,
          where: { page: r.page || '', item: r.item || '', label: r.label || '' }, version: r.version || '' });
        changed = true;
      }
    });
    if (changed) { save(); render(); }
  }
  document.addEventListener('DOMContentLoaded', function () {
    $('noteSave').addEventListener('click', addNote);
    $('noteFilter').addEventListener('change', function () {
      render();
      if (window.Family && Family.signedIn()) Family.pullNotes().catch(function (e) { RS.err('Could not read the family notes', e); });
    });
    $('noteCopy').addEventListener('click', function () {
      var out = JSON.stringify(notes, null, 2);
      if (navigator.clipboard) navigator.clipboard.writeText(out).catch(function () { window.prompt('Copy the notes:', out); });
      else window.prompt('Copy the notes:', out);
    });
    render();
  });
  window.AppNotes = { setContext: setContext, add: addNote, merge: merge, all: function () { return notes.slice(); } };
})();
