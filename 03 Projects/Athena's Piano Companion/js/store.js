// Takes, playlists and projects: kept on this device first (IndexedDB, audio included),
// and synced to the family database when signed in and idle. Never overwrites an unsynced local edit.
(function () {
  'use strict';
  var COLLS = { takes: 'pc_takes', playlists: 'pc_playlists', items: 'pc_playlist_items', projects: 'pc_projects' };
  var db = null, memory = {};                         // memory is the fallback when IndexedDB is blocked
  var syncing = false, status = 'device';

  function open() {
    if (db) return Promise.resolve(db);
    return new Promise(function (res) {
      if (!window.indexedDB) return res(null);
      var rq = indexedDB.open('pc', 1);
      rq.onupgradeneeded = function () {
        var d = rq.result;
        Object.keys(COLLS).forEach(function (c) { d.createObjectStore(c, { keyPath: 'id' }); });
        d.createObjectStore('deletes', { keyPath: 'key' });
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
      await Family.rest('POST', 'pc_takes', 'on_conflict=id', [row(t)], 'resolution=merge-duplicates');
      t._dirty = 0; await put('takes', t);
    }
    for (var c of ['playlists', 'items', 'projects']) {
      var list = await all(c), dirty = list.filter(function (r) { return r._dirty; });
      if (dirty.length) {
        await Family.rest('POST', COLLS[c], 'on_conflict=id', dirty.map(row), 'resolution=merge-duplicates');
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
      var rows = await Family.rest('GET', COLLS[c], 'select=*&order=updated_at.desc&limit=2000');
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

  window.Store = {
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
