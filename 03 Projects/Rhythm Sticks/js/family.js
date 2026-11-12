// Family database (Family project, Supabase): sign-in and the notes table.
// The page works without it: notes always stay on this device, and are also sent here when signed in.
// Publishable key only (safe in browser code). Table: rs_notes (see supabase/001_rs_notes.sql).
// No email or password is stored in the repo; the session lives in this device's storage only.
(function () {
  'use strict';
  var DB = {
    url: 'https://twvqvutrcobedvuhnzxq.supabase.co',
    key: 'sb_publishable_eqUo8HEdEB1hMQM4CpSVqA_9i6b0qCo',
  };
  var TABLE = '/rest/v1/rs_notes';
  var SESSION_KEY = 'rs.session';
  var session = null;
  try { session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch (e) { session = null; }

  function saveSession(s) {
    session = s;
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch (e) { /* storage blocked: signed in for this page only */ }
  }
  function withTimeout(ms) {
    var c = new AbortController(), t = setTimeout(function () { c.abort(); }, ms);
    return { signal: c.signal, done: function () { clearTimeout(t); } };
  }
  function $(id) { return document.getElementById(id); }
  function newSession(j, email) {
    return { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Date.now() + j.expires_in * 1000, email: email };
  }
  async function refresh() {
    var res = await fetch(DB.url + '/auth/v1/token?grant_type=refresh_token', {
      method: 'POST', headers: { apikey: DB.key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });
    var j = await res.json();
    if (!res.ok) { signOut(); throw new Error('Sign-in expired. Please sign in again.'); }
    saveSession(newSession(j, session.email));
  }
  async function dbFetch(method, path, body, prefer, retried) {
    var t = withTimeout(8000);
    try {
      var res = await fetch(DB.url + path, {
        method: method, signal: t.signal,
        headers: Object.assign({ apikey: DB.key, 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + (session ? session.access_token : DB.key) }, prefer ? { Prefer: prefer } : {}),
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      if (res.status === 401 && session && !retried) { await refresh(); return dbFetch(method, path, body, prefer, true); }
      var text = await res.text();
      var data = text ? JSON.parse(text) : null;
      if (!res.ok) throw new Error((data && (data.message || data.msg || data.error_description)) || ('HTTP ' + res.status));
      return data;
    } finally { t.done(); }
  }
  async function signIn(email, password) {
    var t = withTimeout(10000);
    try {
      var res = await fetch(DB.url + '/auth/v1/token?grant_type=password', {
        method: 'POST', signal: t.signal, headers: { apikey: DB.key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password }),
      });
      var j = await res.json();
      if (!res.ok) throw new Error(j.error_description || j.msg || j.message || 'Sign-in failed');
      saveSession(newSession(j, email));
    } finally { t.done(); }
  }
  function signOut() { saveSession(null); render(); }

  function render() {
    if ($('familyStatus')) $('familyStatus').textContent = session
      ? 'Signed in as ' + session.email + '. Notes are also saved to the family database.'
      : 'Not signed in. Notes stay on this device only.';
    if ($('familyForm')) $('familyForm').hidden = !!session;
    if ($('familyOut')) $('familyOut').hidden = !session;
  }
  function noteRow(n) {
    var w = n.where || {};
    return { id: n.id, text: n.text, page: w.page || '', item: w.item || '', label: w.label || '',
      version: n.version || '', status: n.status || 'open', noted_at: n.at };
  }
  async function pushNotes(list) {
    if (!session || !list || !list.length) return;
    for (var i = 0; i < list.length; i += 200) {          // a note sent twice is still one row
      await dbFetch('POST', TABLE, list.slice(i, i + 200).map(noteRow), 'resolution=ignore-duplicates');
    }
  }
  async function setStatus(id, status) {
    if (!session) return;
    await dbFetch('PATCH', TABLE + '?id=eq.' + encodeURIComponent(id), { status: status });
  }
  function sendAll() {
    if (!session || !window.AppNotes) return Promise.resolve();
    return pushNotes(AppNotes.all()).then(function () {
      if ($('familyStatus')) $('familyStatus').textContent = 'Signed in as ' + session.email + '. Every note on this device is in the family database.';
    });
  }
  async function checkDb() {
    var out = $('dbCheck');
    if (!session) { out.textContent = 'This device only. Sign in to check the family database.'; return; }
    out.textContent = 'Checking…';
    try {
      await dbFetch('GET', TABLE + '?select=id&limit=1');
      out.textContent = '✅ The family database answers (rs_notes).';
    } catch (e) {
      out.textContent = '⚠️ Family database problem: ' + e.message;
      RS.err('Family database check failed', e);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    render();
    $('familyForm').addEventListener('submit', async function (ev) {
      ev.preventDefault();
      var btn = ev.submitter || this.querySelector('button');
      btn.disabled = true;
      try {
        await signIn($('familyEmail').value.trim(), $('familyPassword').value);
        $('familyPassword').value = '';
        render();
        await sendAll();
      } catch (e) {
        RS.err('Sign-in failed', e);
        $('familyStatus').textContent = 'Sign-in failed: ' + e.message;
      } finally { btn.disabled = false; }
    });
    $('familyOut').addEventListener('click', signOut);
    $('familyCheck').addEventListener('click', checkDb);
    if (session) sendAll().catch(function (e) { RS.err('Notes not sent to the family database', e); });
  });

  window.Family = { signedIn: function () { return !!session; }, pushNotes: pushNotes, setStatus: setStatus, checkDb: checkDb };
})();
