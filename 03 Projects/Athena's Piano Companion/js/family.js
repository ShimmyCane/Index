// Family database (Family project, Supabase): sign-in, table calls, and the private bucket pc-takes.
// Publishable key only (safe in browser code). No email or password is stored in the repo;
// the session lives in this device's storage only. The pages work without it.
(function () {
  'use strict';
  var DB = {
    url: 'https://twvqvutrcobedvuhnzxq.supabase.co',
    key: 'sb_publishable_eqUo8HEdEB1hMQM4CpSVqA_9i6b0qCo'
  };
  var BUCKET = 'pc-takes';
  var session = null;
  try { session = JSON.parse(localStorage.getItem('pc.session') || 'null'); } catch (e) { session = null; }

  function saveSession(s) {
    session = s;
    try { localStorage.setItem('pc.session', JSON.stringify(s)); } catch (e) { /* signed in for this page only */ }
    PC.emit('family');
  }
  function timeout(ms) {
    var c = new AbortController(), t = setTimeout(function () { c.abort(); }, ms);
    return { signal: c.signal, done: function () { clearTimeout(t); } };
  }
  function newSession(j, email) {
    return { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Date.now() + j.expires_in * 1000, email: email };
  }
  async function refresh() {
    var res = await fetch(DB.url + '/auth/v1/token?grant_type=refresh_token', {
      method: 'POST', headers: { apikey: DB.key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: session.refresh_token })
    });
    var j = await res.json();
    if (!res.ok) { signOut(); throw new Error('Sign-in expired. Please sign in again.'); }
    saveSession(newSession(j, session.email));
  }
  // One fetch for tables and storage: adds the key and the session, refreshes once on 401.
  async function call(method, path, opts, retried) {
    opts = opts || {};
    var t = timeout(opts.timeout || 12000);
    try {
      var headers = Object.assign({ apikey: DB.key, Authorization: 'Bearer ' + (session ? session.access_token : DB.key) }, opts.headers || {});
      var body = opts.raw !== undefined ? opts.raw : (opts.body === undefined ? undefined : JSON.stringify(opts.body));
      if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
      if (opts.prefer) headers.Prefer = opts.prefer;
      var res = await fetch(DB.url + path, { method: method, headers: headers, body: body, signal: t.signal });
      if (res.status === 401 && session && !retried) { await refresh(); return call(method, path, opts, true); }
      if (opts.blob) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return await res.blob();
      }
      var text = await res.text(), data = null;
      try { data = text ? JSON.parse(text) : null; } catch (e) { data = { message: text }; }
      if (!res.ok) throw new Error((data && (data.message || data.msg || data.error_description || data.error)) || ('HTTP ' + res.status));
      return data;
    } finally { t.done(); }
  }
  async function signIn(email, password) {
    var t = timeout(10000);
    try {
      var res = await fetch(DB.url + '/auth/v1/token?grant_type=password', {
        method: 'POST', signal: t.signal, headers: { apikey: DB.key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
      });
      var j = await res.json();
      if (!res.ok) throw new Error(j.error_description || j.msg || j.message || 'Sign-in failed');
      saveSession(newSession(j, email));
    } finally { t.done(); }
  }
  function signOut() { saveSession(null); }

  window.Family = {
    signedIn: function () { return !!session; },
    email: function () { return session ? session.email : ''; },
    signIn: signIn, signOut: signOut,
    rest: function (method, table, query, body, prefer) {
      return call(method, '/rest/v1/' + table + (query ? '?' + query : ''), { body: body, prefer: prefer });
    },
    upload: function (path, blob) {
      return call('POST', '/storage/v1/object/' + BUCKET + '/' + path, {
        raw: blob, headers: { 'Content-Type': blob.type || 'audio/wav', 'x-upsert': 'true' }, timeout: 120000 });
    },
    download: function (path) {
      return call('GET', '/storage/v1/object/authenticated/' + BUCKET + '/' + path, { blob: true, timeout: 120000 });
    },
    // Ask each table and the bucket whether they answer; used by the database check in the gear panel.
    check: async function () {
      if (!session) return 'This device only. Sign in to check the family database.';
      var tables = ['pc_takes', 'pc_playlists', 'pc_playlist_items', 'pc_projects', 'pc_notes'], out = [];
      for (var i = 0; i < tables.length; i++) {
        try { await this.rest('GET', tables[i], 'select=id&limit=1'); out.push('✅ ' + tables[i]); }
        catch (e) { out.push('❌ ' + tables[i] + ': ' + e.message); PC.err('Database check ' + tables[i], e); }
      }
      try { await call('POST', '/storage/v1/object/list/' + BUCKET, { body: { prefix: '', limit: 1 } }); out.push('✅ bucket ' + BUCKET); }
      catch (e) { out.push('❌ bucket ' + BUCKET + ': ' + e.message); PC.err('Database check bucket', e); }
      return out.join('\n') + (out.some(function (l) { return l[0] === '❌'; })
        ? '\nAn empty or failed table usually means the SQL in supabase/ has not been pasted yet.' : '');
    }
  };
})();
