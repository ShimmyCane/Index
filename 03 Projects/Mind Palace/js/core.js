/* Mind Palace: version, settings, error list, storage helpers. No 3-D here. */
(function () {
  'use strict';
  var root = typeof window !== 'undefined' ? window : globalThis;
  var MP = root.MP = root.MP || {};

  MP.VERSION = '0.1.0';
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

  MP.DEFAULTS = { sound: 1, labels: 'all', links: 'selected', shadows: 1, speed: 'normal', showErrors: false };
  MP.settings = Object.assign({}, MP.DEFAULTS);
  (function () {
    var saved = MP.store.get(MP.KEYS.settings, {}) || {};
    Object.keys(MP.DEFAULTS).forEach(function (k) { if (k in saved) MP.settings[k] = saved[k]; });
  })();
  MP.saveSettings = function () { MP.store.set(MP.KEYS.settings, MP.settings); };

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
