/* Make 3D x Construct: the library of scenes kept on this device. Pure logic with a small storage adapter.
   Browser: localStorage (in try/catch; a blocked store is a message, not an error). Node: a plain object for tests.
   A scene is { model_id, name, updated, history, world, model }. Newest first. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.M3DXC = Object.assign(root.M3DXC || {}, { library: api });
})(typeof self !== 'undefined' ? self : globalThis, function () {
  const KEY = 'm3dxc.library.v1';

  function memoryStore() {
    let data = null;
    return { get() { return data; }, set(v) { data = v; return true; } };
  }
  function browserStore(storage) {
    return {
      get() { try { const raw = storage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } },
      set(v) { try { storage.setItem(KEY, JSON.stringify(v)); return true; } catch (e) { return false; } },
    };
  }

  function createLibrary(store) {
    const read = () => (store.get() || []);
    return {
      list() { return read().slice().sort((a, b) => (b.updated || '').localeCompare(a.updated || '')); },
      get(id) { return read().find((s) => s.model_id === id) || null; },
      // Saves a scene by model_id: a new one is added; an existing one is replaced.
      save(scene, now = new Date().toISOString()) {
        const m = scene.model || {};
        const row = { model_id: m.model_id || scene.model_id, name: m.name || scene.name || m.model_id, updated: now,
          history: scene.history, world: scene.world, model: m };
        const rows = read().filter((s) => s.model_id !== row.model_id);
        rows.push(row);
        return store.set(rows) ? { ok: true, row } : { ok: false, error: 'This browser will not save. Changes last until the page is reloaded.' };
      },
      remove(id) { return store.set(read().filter((s) => s.model_id !== id)); },
      count() { return read().length; },
    };
  }

  return { KEY, memoryStore, browserStore, createLibrary };
});
