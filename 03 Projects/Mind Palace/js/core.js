/* Mind Palace: version, settings, error list, storage helpers. No 3-D here. */
(function () {
  'use strict';
  var root = typeof window !== 'undefined' ? window : globalThis;
  var MP = root.MP = root.MP || {};

  MP.VERSION = '0.2.0';
  MP.KEYS = { palace: 'mindpalace.palace', settings: 'mindpalace.settings', notes: 'mindpalace.notes', panels: 'mindpalace.panels' };

  // Storage: every call is guarded, so the page works when storage is blocked.
  MP.store = {
    ok: true,
    get: function (key, fallback) {
      try { var s = root.localStorage.getItem(key); return s == null ? fallback : JSON.parse(s); }
      catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { root.localStorage.setItem(key, JSON.stringify(value)); MP.store.ok = true; return true; }
      catch (e) { MP.store.ok = false; return false; }
    }
  };

  MP.DEFAULTS = { sound: 1, labels: 'all', links: 'selected', shadows: 1, speed: 'normal', showErrors: false, quality: 'medium', fuzz: 20, fuzzByPractice: 1, fog: 1, sight: 60, animate: 1 };
  MP.settings = Object.assign({}, MP.DEFAULTS);
  (function () {
    var saved = MP.store.get(MP.KEYS.settings, {}) || {};
    Object.keys(MP.DEFAULTS).forEach(function (k) { if (k in saved) MP.settings[k] = saved[k]; });
  })();
  MP.saveSettings = function () { MP.store.set(MP.KEYS.settings, MP.settings); };

  /* Palaces: each family member has their own. The list and the choice are kept on this device.
     Each palace is saved under its own key, so one never overwrites another. */
  MP.palaces = {
    list: function () {
      var l = MP.store.get('mindpalace.palaces', null);
      if (!Array.isArray(l) || !l.length) {
        l = [{ id: 'p1', name: 'My palace' }];
        var old = MP.store.get(MP.KEYS.palace, null);          // a palace saved by version 0.1.0
        if (old && old.worlds) MP.store.set('mindpalace.palace.p1', old);
        MP.store.set('mindpalace.palaces', l);
      }
      return l;
    },
    current: function () {
      var l = MP.palaces.list(), id = MP.store.get('mindpalace.current', l[0].id);
      return l.filter(function (p) { return p.id === id; })[0] || l[0];
    },
    key: function () { return 'mindpalace.palace.' + MP.palaces.current().id; },
    choose: function (id) { MP.store.set('mindpalace.current', id); },
    add: function (name) {
      var l = MP.palaces.list(), p = { id: 'p' + Date.now().toString(36), name: name || 'New palace' };
      l.push(p); MP.store.set('mindpalace.palaces', l); MP.palaces.choose(p.id); return p;
    },
    rename: function (name) {
      var l = MP.palaces.list(), cur = MP.palaces.current();
      l.forEach(function (p) { if (p.id === cur.id) p.name = name; }); MP.store.set('mindpalace.palaces', l);
    },
    load: function () { return MP.store.get(MP.palaces.key(), null); }
  };

  MP.errors = [];
  MP.onError = null;
  MP.logError = function (msg) {
    MP.errors.push(new Date().toLocaleTimeString() + '  ' + msg);
    if (MP.onError) MP.onError();
  };

  MP.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
})();
