// Notes for improvement (02 Refs/Skills/feedback_notes.md). Device first; sent to pc_notes when signed in.
(function () {
  'use strict';
  var KEY = 'pc.notes', notes = [], where = { page: 'index.html', item: '', label: '' };
  try { notes = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { notes = []; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(notes)); } catch (e) { /* blocked */ } }
  function row(n) {
    var w = n.where || {};
    return { id: n.id, text: n.text, page: w.page || '', item: w.item || '', label: w.label || '',
      version: n.version || '', status: n.status || 'open', noted_at: n.at };
  }
  async function push(list) {
    if (!Family.signedIn() || !list.length) return;
    await Family.rest('POST', 'pc_notes', 'on_conflict=id', list.map(row), 'resolution=ignore-duplicates');
  }
  async function pull() {
    if (!Family.signedIn()) return;
    var rows = await Family.rest('GET', 'pc_notes', 'select=*&order=noted_at.desc&limit=500');
    var byId = {}, changed = false; notes.forEach(function (n) { byId[n.id] = n; });
    (rows || []).forEach(function (r) {
      var n = byId[r.id];
      if (n) { if (r.status && n.status !== r.status) { n.status = r.status; changed = true; } }
      else { notes.push({ id: r.id, at: new Date(r.noted_at).toISOString(), status: r.status || 'open', text: r.text,
        where: { page: r.page, item: r.item, label: r.label }, version: r.version || '' }); changed = true; }
    });
    if (changed) { save(); PC.emit('notes'); }
  }
  window.Notes = {
    setContext: function (c) { where = Object.assign({}, where, c); },
    all: function () { return notes.slice(); },
    add: function (text) {
      text = (text || '').trim(); if (!text) return null;
      var n = { id: 'n-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7), at: new Date().toISOString(),
        status: 'open', text: text, where: Object.assign({}, where), version: PC.version };
      notes.push(n); save(); PC.emit('notes');
      push([n]).catch(function (e) { PC.err('Note not sent to the family database', e); });
      return n;
    },
    setStatus: function (id, status) {
      notes.forEach(function (n) { if (n.id === id) n.status = status; }); save(); PC.emit('notes');
      if (Family.signedIn()) Family.rest('PATCH', 'pc_notes', 'id=eq.' + encodeURIComponent(id), { status: status })
        .catch(function (e) { PC.err('Could not update the note in the family database', e); });
    },
    sync: function () { return push(notes).then(pull); }
  };
  PC.on('family', function () { Notes.sync().catch(function (e) { PC.err('Notes sync', e); }); });
})();
