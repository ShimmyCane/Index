/* Fishes — notes for feedback.
   Every note is saved in a cookie (and localStorage if cookies are blocked).
   When the database is configured in js/species.js, the note is also sent to
   the fish_notes table. Failures are shown on the page, never hidden. */
(function () {
  'use strict';

  var CFG = window.FishData.CONFIG;
  var COOKIE = 'fish_notes';
  var LS_KEY = 'fish_notes_v1';
  var MAX_NOTES = 25;       // keeps the cookie well under the ~4 KB limit
  var MAX_TEXT = 300;

  var db = {
    configured: !!(CFG.supabaseUrl && CFG.supabaseKey),
    state: 'off',           // off | ready | saving | saved | sign-in needed | failed
    message: ''
  };
  db.state = db.configured ? 'ready' : 'off';

  function readCookie() {
    try {
      var parts = document.cookie ? document.cookie.split('; ') : [];
      for (var i = 0; i < parts.length; i++) {
        if (parts[i].indexOf(COOKIE + '=') === 0) {
          return JSON.parse(decodeURIComponent(parts[i].slice(COOKIE.length + 1)));
        }
      }
    } catch (e) { /* bad cookie: start again */ }
    return null;
  }

  function writeCookie(list) {
    var value = encodeURIComponent(JSON.stringify(list));
    document.cookie = COOKIE + '=' + value + '; max-age=31536000; path=/; SameSite=Lax';
  }

  function load() {
    var list = readCookie();
    if (!Array.isArray(list)) {
      try { list = JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch (e) { list = []; }
    }
    return Array.isArray(list) ? list : [];
  }

  function save(list) {
    try { writeCookie(list); } catch (e) { /* cookie blocked */ }
    try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch (e) { /* private mode */ }
  }

  function clip(text) {
    return String(text || '').replace(/\s+/g, ' ').trim().slice(0, MAX_TEXT);
  }

  function signInNeeded() {
    db.state = 'sign-in needed';
    db.message = 'Sign in to the family database in ⚙️ to save notes there. This note is kept in the cookie.';
  }

  function post(token, note, canRetry) {
    var url = CFG.supabaseUrl.replace(/\/+$/, '') + '/rest/v1/' + CFG.notesTable;
    db.state = 'saving';
    db.message = '';
    return fetch(url, {
      method: 'POST',
      headers: {
        'apikey': CFG.supabaseKey,
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        note: note.text,
        level: note.level,
        size: Math.round(note.size * 10) / 10,
        seconds: note.seconds
      })
    }).then(function (res) {
      if (res.ok) { db.state = 'saved'; db.message = 'Saved to the family database.'; return; }
      if ((res.status === 401 || res.status === 403) && canRetry) {
        return window.FishFamily.refresh().then(function (fresh) {
          if (fresh) return post(fresh, note, false);
          signInNeeded();
        });
      }
      if (res.status === 401 || res.status === 403) { signInNeeded(); return; }
      db.state = 'failed';
      db.message = 'Database returned ' + res.status + '. The note is in the cookie.';
    }).catch(function (err) {
      db.state = 'failed';
      db.message = 'Could not reach the database (' + (err && err.message || 'network') + '). The note is in the cookie.';
    });
  }

  function sendToDatabase(note) {
    if (!db.configured) return Promise.resolve();
    return window.FishFamily.token().then(function (token) {
      if (!token) { signInNeeded(); return; }
      return post(token, note, true);
    });
  }

  window.FishNotes = {
    list: load,

    // info: { level, size, seconds }
    add: function (text, info) {
      var clean = clip(text);
      if (!clean) return Promise.resolve({ ok: false, reason: 'empty' });
      var note = {
        at: new Date().toISOString(),
        text: clean,
        level: info.level,
        size: info.size,
        seconds: Math.round(info.seconds)
      };
      var list = load();
      list.unshift(note);
      list = list.slice(0, MAX_NOTES);
      save(list);
      return sendToDatabase(note).then(function () { return { ok: true, db: db.state }; });
    },

    status: function () { return { state: db.state, message: db.message, configured: db.configured }; },
    clip: clip
  };
})();
