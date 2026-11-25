/* Felix Stickers: family sign-in and the family database (tables fs_creations and fs_notes).
   Everything is also kept on the device; the database is an extra copy when signed in.
   Classic script, no build. Failures are returned as errors for the page to show. */
(function () {
  'use strict';
  var KEY = 'fs.session.v1';
  var cfg = window.FS_CONFIG || {};
  var session = null;

  function readSession() {
    try { var raw = window.localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  function writeSession(s) {
    try {
      if (s) window.localStorage.setItem(KEY, JSON.stringify(s)); else window.localStorage.removeItem(KEY);
    } catch (e) { /* blocked storage: the session lasts only for this visit */ }
  }
  session = readSession();

  function ready() { return !!(cfg.url && cfg.key); }
  function signedIn() { return !!(session && session.access_token); }
  function who() { return session ? session.email : ''; }

  function parse(r) {
    return r.text().then(function (t) {
      var data = null;
      try { data = t ? JSON.parse(t) : null; } catch (e) { data = t; }
      if (!r.ok) {
        var msg = (data && (data.msg || data.message || data.error_description || data.error)) || ('HTTP ' + r.status);
        throw new Error(String(msg));
      }
      return data;
    });
  }

  function storeTokens(d, email) {
    session = {
      access_token: d.access_token,
      refresh_token: d.refresh_token,
      email: (d.user && d.user.email) || email,
      expires_at: Date.now() + (d.expires_in || 3600) * 1000
    };
    writeSession(session);
    return session;
  }

  function signIn(email, password) {
    if (!ready()) return Promise.reject(new Error('database not set up in this copy'));
    return fetch(cfg.url + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: { apikey: cfg.key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password })
    }).then(parse).then(function (d) { return storeTokens(d, email); });
  }

  function signOut() { session = null; writeSession(null); }

  // Refresh the token a minute before it runs out; if the refresh fails, the family must sign in again.
  function fresh() {
    if (!signedIn() || !session.refresh_token) return Promise.resolve();
    if (session.expires_at - Date.now() > 60000) return Promise.resolve();
    return fetch(cfg.url + '/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      headers: { apikey: cfg.key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: session.refresh_token })
    }).then(parse).then(function (d) { storeTokens(d, session.email); }, function () {
      signOut();
      throw new Error('sign in again to keep saving to the family');
    });
  }

  function call(method, path, body, extra) {
    if (!signedIn()) return Promise.reject(new Error('not signed in'));
    return fresh().then(function () {
      var h = { apikey: cfg.key, Authorization: 'Bearer ' + session.access_token };
      if (body) h['Content-Type'] = 'application/json';
      if (extra) Object.keys(extra).forEach(function (k) { h[k] = extra[k]; });
      return fetch(cfg.url + path, { method: method, headers: h, body: body ? JSON.stringify(body) : undefined }).then(parse);
    });
  }

  function saveCreation(c) {
    var now = new Date().toISOString();
    return call('POST', '/rest/v1/fs_creations?on_conflict=id', [{
      id: c.id, sheet_id: c.sheetId || '', sheet_name: c.sheetName || '', version: c.version || '',
      data: c, saved_at: c.savedAt || now, updated_at: now
    }], { Prefer: 'resolution=merge-duplicates,return=minimal' });
  }

  function saveNote(n) {
    return call('POST', '/rest/v1/fs_notes', [{
      id: n.id, text: n.text, sheet_id: n.sheetId || '', item: n.item || '', label: n.label || '',
      version: n.version || '', noted_at: n.noted_at || new Date().toISOString()
    }], { Prefer: 'return=minimal' });
  }

  // Database check for the ⚙️ panel: says what state the page is in, in plain words.
  function check() {
    if (!ready()) return Promise.resolve({ state: 'off', text: 'not set up in this copy' });
    if (!signedIn()) return Promise.resolve({ state: 'signed-out', text: 'this device only' });
    return call('GET', '/rest/v1/fs_creations?select=id&limit=1').then(function () {
      return { state: 'ok', text: 'connected as ' + who() };
    }, function (e) {
      return { state: 'error', text: e.message };
    });
  }

  window.FSFamily = {
    ready: ready, signedIn: signedIn, who: who,
    signIn: signIn, signOut: signOut,
    saveCreation: saveCreation, saveNote: saveNote, check: check
  };
})();
