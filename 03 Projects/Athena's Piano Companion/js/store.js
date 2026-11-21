// Takes, playlists and projects: kept on this device first (IndexedDB, audio included),
// and synced to the family database when signed in and idle. Never overwrites an unsynced local edit.
(function () {
  'use strict';
  var COLLS = { takes: 'pc_takes', sessions: 'pc_sessions', playlists: 'pc_playlists', items: 'pc_playlist_items', projects: 'pc_projects' };
  var NEW_COLS = ['session_id', 'deleted_at'];   // from 002; left out if that SQL is not pasted yet
  var noSql = false;
  var db = null, memory = {};                         // memory is the fallback when IndexedDB is blocked
  var syncing = false, status = 'device';

  function open() {
    if (db) return Promise.resolve(db);
    return new Promise(function (res) {
      if (!window.indexedDB) return res(null);
      var rq = indexedDB.open('pc', 2);
      rq.onupgradeneeded = function () {
        var d = rq.result;
        Object.keys(COLLS).forEach(function (c) { if (!d.objectStoreNames.contains(c)) d.createObjectStore(c, { keyPath: 'id' }); });
        if (!d.objectStoreNames.contains('deletes')) d.createObjectStore('deletes', { keyPath: 'key' });
      };
      rq.onsuccess = function () { db = rq.result; res(db); };
      rq.onerror = function () { PC.err('Device storage', rq.error); res(null); };
    });
  }
  function tx(store, mode, fn) {
    return open().then(function (d) {
      if (!d) return fn(null);
      return new Promise(function (res, rej) {
        var t = d.transaction(store, mode), s = t.objectStore(store), out = fn(s);
        t.oncomplete = function () { res(out && out.result !== undefined ? out.result : out); };
        t.onerror = function () { rej(t.error); };
      });
    });
  }
  function mem(c) { return memory[c] = memory[c] || {}; }
  function all(c) {
    return open().then(function (d) {
      if (!d) return Object.keys(mem(c)).map(function (k) { return mem(c)[k]; });
      return new Promise(function (res, rej) {
        var rq = d.transaction(c).objectStore(c).getAll();
        rq.onsuccess = function () { res(rq.result); }; rq.onerror = function () { rej(rq.error); };
      });
    });
  }
  function get(c, id) {
    return open().then(function (d) {
      if (!d) return mem(c)[id] || null;
      return new Promise(function (res, rej) {
        var rq = d.transaction(c).objectStore(c).get(id);
        rq.onsuccess = function () { res(rq.result || null); }; rq.onerror = function () { rej(rq.error); };
      });
    });
  }
  function put(c, rec) {
    return open().then(function (d) {
      if (!d) { mem(c)[rec.id] = rec; return rec; }
      return new Promise(function (res, rej) {
        var t = d.transaction(c, 'readwrite'); t.objectStore(c).put(rec);
        t.oncomplete = function () { res(rec); }; t.onerror = function () { rej(t.error); };
      });
    });
  }
  function del(c, id) {
    return open().then(function (d) {
      if (!d) { delete mem(c)[id]; return; }
      return new Promise(function (res, rej) {
        var t = d.transaction([c, 'deletes'], 'readwrite');
        t.objectStore(c).delete(id);
        t.objectStore('deletes').put({ key: c + ':' + id, coll: c, id: id });
        t.oncomplete = function () { res(); }; t.onerror = function () { rej(t.error); };
      });
    });
  }

  // A saved record: meta fields (the table columns) plus local-only: blob, _dirty, _up (audio uploaded).
  var LOCAL = { blob: 1, _dirty: 1, _up: 1 };
  function row(rec) { var r = {}; Object.keys(rec).forEach(function (k) { if (!LOCAL[k]) r[k] = rec[k]; }); return r; }
  function save(c, rec, extra) {                      // use for every create and edit
    rec.updated_at = new Date().toISOString();
    rec._dirty = 1;
    Object.assign(rec, extra || {});
    return put(c, rec).then(function (r) { PC.emit('store', c); return r; });
  }

  function setStatus(s, detail) { status = s; PC.emit('syncstatus', s, detail || ''); }
  var busyFn = function () { return false; };

  // Write rows; if the database does not have the 002 columns yet, write them without those (and say so in the pill).
  async function upsert(table, rows) {
    try { await Family.rest('POST', table, 'on_conflict=id', rows, 'resolution=merge-duplicates'); }
    catch (e) {
      if (table !== 'pc_takes' || !/session_id|deleted_at|schema cache|column/i.test(e.message)) throw e;
      noSql = true;
      await Family.rest('POST', table, 'on_conflict=id', rows.map(function (r) { var o = Object.assign({}, r); NEW_COLS.forEach(function (k) { delete o[k]; }); return o; }), 'resolution=merge-duplicates');
    }
  }
  async function push() {
    var takes = await all('takes');
    for (var i = 0; i < takes.length; i++) {
      var t = takes[i];
      if (!t._dirty && t._up) continue;
      if (!t._up && t.blob) {
        var path = t.id + '.wav';
        await Family.upload(path, t.blob);
        t.file_path = path; t._up = 1;
      }
      await upsert('pc_takes', [row(t)]);
      t._dirty = 0; await put('takes', t);
    }
    for (var c of ['sessions', 'playlists', 'items', 'projects']) {
      var list = await all(c), dirty = list.filter(function (r) { return r._dirty; });
      if (c === 'sessions' && noSql) continue;
      if (dirty.length) {
        try { await upsert(COLLS[c], dirty.map(row)); }
        catch (e) { if (c === 'sessions' && /pc_sessions|relation|does not exist|schema cache/i.test(e.message)) { noSql = true; continue; } throw e; }
        for (var j = 0; j < dirty.length; j++) { dirty[j]._dirty = 0; await put(c, dirty[j]); }
      }
    }
    var dels = await all('deletes');
    for (var k = 0; k < dels.length; k++) {
      await Family.rest('DELETE', COLLS[dels[k].coll], 'id=eq.' + encodeURIComponent(dels[k].id));
      await tx('deletes', 'readwrite', function (s) { return s.delete(dels[k].key); });
    }
  }
  async function pull() {
    for (var c in COLLS) {
      var rows;
      try { rows = await Family.rest('GET', COLLS[c], 'select=*&order=updated_at.desc&limit=2000'); }
      catch (e) { if (c === 'sessions') { noSql = true; continue; } throw e; }
      var local = {}; (await all(c)).forEach(function (r) { local[r.id] = r; });
      var dels = {}; (await all('deletes')).forEach(function (d) { dels[d.key] = 1; });
      var remote = {};
      for (var i = 0; i < (rows || []).length; i++) {
        var r = rows[i]; remote[r.id] = 1;
        if (dels[c + ':' + r.id]) continue;
        var l = local[r.id];
        if (l && l._dirty) continue;                         // never overwrite an unsynced local edit
        if (!l) { r._dirty = 0; r._up = 1; await put(c, r); }
        else if (!l.updated_at || r.updated_at > l.updated_at) { r._dirty = 0; r._up = 1; if (l.blob) r.blob = l.blob; await put(c, r); }
      }
      if (c === 'items') {                                   // an item removed elsewhere disappears here (only if synced)
        for (var id in local) if (!remote[id] && !local[id]._dirty) await open().then(function (d) { return d && new Promise(function (res) { var t = d.transaction(c, 'readwrite'); t.objectStore(c).delete(id); t.oncomplete = res; }); });
      }
    }
  }
  async function sync(force) {
    if (!Family.signedIn()) { setStatus('device'); return; }
    if (syncing) return;
    if (!force && busyFn()) return;                          // not while she plays
    syncing = true; setStatus('syncing');
    try { await push(); await pull(); setStatus('synced'); PC.emit('store', 'pulled'); }
    catch (e) { setStatus('problem', e.message); PC.err('Sync', e); }
    finally { syncing = false; }
  }

  async function blobFor(take) {                              // the audio: this device first, else the family bucket
    if (take.blob) return take.blob;
    var local = await get('takes', take.id);
    if (local && local.blob) return local.blob;
    if (!Family.signedIn() || !take.file_path) throw new Error('Audio is not on this device and you are not signed in');
    var b = await Family.download(take.file_path);
    if (local) { local.blob = b; await put('takes', local); }
    return b;
  }

  // Takes not in the recycle bin.
  function live(list) { return list.filter(function (t) { return !t.deleted_at; }); }
  // Takes that have sat in the recycle bin for 30 days are removed for good (audio file first), when signed in.
  async function purgeOld() {
    if (!Family.signedIn()) return 0;
    var limit = Date.now() - 30 * 86400000, n = 0;
    var old = (await all('takes')).filter(function (t) { return t.deleted_at && new Date(t.deleted_at).getTime() < limit; });
    for (var i = 0; i < old.length; i++) {
      try { if (old[i].file_path) await Family.remove(old[i].file_path); await del('takes', old[i].id); n++; }
      catch (e) { PC.err('Purging ' + old[i].name, e); }
    }
    if (n) PC.emit('store', 'takes');
    return n;
  }
  window.Store = {
    live: live, purgeOld: purgeOld, needsSql: function () { return noSql; },
    all: all, get: get, save: save, del: del, sync: sync, blobFor: blobFor, row: row,
    status: function () { return status; },
    idleWhen: function (fn) { busyFn = fn; },
    pending: async function () {
      var n = 0;
      for (var c in COLLS) (await all(c)).forEach(function (r) { if (r._dirty || (c === 'takes' && !r._up)) n++; });
      return n;
    }
  };
  PC.on('family', function () { sync(); });
  setInterval(function () { sync(); }, 20000);
  document.addEventListener('DOMContentLoaded', function () { setTimeout(function () { sync(); }, 1500); });
})();
