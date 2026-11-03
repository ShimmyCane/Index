// Expansion Wars — saved maps.
// Every generated map is saved as a record. For now records live in this
// browser's localStorage. The Family Supabase table (xw_maps) replaces this
// later behind the same functions; see supabase/001_xw_maps.sql.
window.XWStore = (function () {
  'use strict';

  var KEY = 'xw_maps_v1';
  var lastError = null;

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      lastError = 'Saved maps could not be read: ' + e.message;
      return [];
    }
  }

  function write(list) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      lastError = 'Saved maps could not be written: ' + e.message;
      return false;
    }
  }

  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function winRate(r) {
    return r.times_played ? Math.round(100 * r.wins / r.times_played) : null;
  }

  function list() {
    return read();
  }

  function add(rec) {
    var list = read();
    rec.id = rec.id || uid();
    rec.created_at = rec.created_at || new Date().toISOString();
    rec.updated_at = rec.created_at;
    list.push(rec);
    write(list);
    return rec;
  }

  // Apply fn to one record and save it. Returns the updated record or null.
  function update(id, fn) {
    var list = read();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        fn(list[i]);
        list[i].updated_at = new Date().toISOString();
        write(list);
        return list[i];
      }
    }
    return null;
  }

  function recordGame(id, won) {
    return update(id, function (r) {
      r.times_played = (r.times_played || 0) + 1;
      if (won) r.wins = (r.wins || 0) + 1;
      else r.losses = (r.losses || 0) + 1;
    });
  }

  function addNote(id, text) {
    return update(id, function (r) {
      r.notes = r.notes || [];
      r.notes.push({ at: new Date().toISOString(), text: String(text).slice(0, 500) });
    });
  }

  function setRank(id, stars) {
    return update(id, function (r) { r.rank = stars; });
  }

  function lastErr() { return lastError; }

  return {
    list: list,
    add: add,
    update: update,
    recordGame: recordGame,
    addNote: addNote,
    setRank: setRank,
    winRate: winRate,
    uid: uid,
    lastError: lastErr
  };
})();
