// Family database (Family project, Supabase): sign-in and the compass tables.
// The page works without it: everything stays on this device, and is also kept here when signed in.
// Publishable key only (safe in browser code). Tables: see supabase/001_ofc_family.sql.
(function () {
  var DB = {
    url: 'https://twvqvutrcobedvuhnzxq.supabase.co',
    key: 'sb_publishable_eqUo8HEdEB1hMQM4CpSVqA_9i6b0qCo',
  };
  var TABLES = ['ofc_notes', 'ofc_thoughts', 'ofc_pieces', 'ofc_framework'];
  var COMPASS = 'main';                 // one main compass for now; other voices can have their own later
  var SESSION_KEY = 'ofc.session';
  var session = null;
  try { session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch (e) { session = null; }

  function App() { return window.OFCApp; }
  function $(id) { return document.getElementById(id); }
  function saveSession(s) {
    session = s;
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch (e) { /* storage blocked: signed in for this page only */ }
  }
  function withTimeout(ms) {
    var c = new AbortController();
    var t = setTimeout(function () { c.abort(); }, ms);
    return { signal: c.signal, done: function () { clearTimeout(t); } };
  }
  function failure(msg, err) {
    if (App()) { App().logError(msg + ': ' + (err && err.message ? err.message : err)); App().setStatus('check'); }
  }
  function newSession(j, email) {
    return { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Date.now() + j.expires_in * 1000, email: email };
  }
  async function refresh() {
    var res = await fetch(DB.url + '/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      headers: { apikey: DB.key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });
    var j = await res.json();
    if (!res.ok) { signOut(); throw new Error('The sign-in has expired. Please sign in again.'); }
    saveSession(newSession(j, session.email));
  }
  async function dbFetch(method, path, body, prefer, retried) {
    var t = withTimeout(8000);
    try {
      var res = await fetch(DB.url + '/rest/v1/' + path, {
        method: method,
        signal: t.signal,
        headers: Object.assign({
          apikey: DB.key,
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + (session ? session.access_token : DB.key),
        }, prefer ? { Prefer: prefer } : {}),
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
        method: 'POST',
        signal: t.signal,
        headers: { apikey: DB.key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password }),
      });
      var j = await res.json();
      if (!res.ok) throw new Error(j.error_description || j.msg || j.message || 'Sign-in failed');
      saveSession(newSession(j, email));
    } finally { t.done(); }
  }
  function signOut() { saveSession(null); render(); }

  function render(extra) {
    var status = $('familyStatus');
    if (status) status.textContent = session
      ? 'Signed in as ' + session.email + '. ' + (extra || 'Thoughts and notes are also kept in the family database.')
      : 'Not signed in. Everything stays on this device only.';
    if ($('familyForm')) $('familyForm').hidden = !!session;
    if ($('familyOut')) $('familyOut').hidden = !session;
    if ($('familySync')) $('familySync').hidden = !session;
    if (App()) App().setStatus(session ? 'family' : 'device');
  }

  // Rows follow the tables. A row's own id and time never change. Thoughts and notes are append-only.
  function noteRow(n) {
    var w = n.where || {};
    return { id: n.id, text: n.text, page: w.page || '', item: w.item || '', label: w.label || '',
      version: n.version || '', status: n.status || 'open', noted_at: n.at };
  }
  function thoughtRow(t, voicePath) {
    return { id: t.id, compass: COMPASS, room: t.room, author: t.author || '', about: t.about || '', text: t.text,
      revises: t.revises || null, piece: t.piece || null, voice_path: voicePath || null, thought_at: t.at };
  }
  // Voice notes live in the private bucket ofc-voice, under the compass name.
  async function storageFetch(method, path, body, type, retried) {
    var t = withTimeout(60000);
    try {
      var res = await fetch(DB.url + '/storage/v1/object/' + path, {
        method: method, signal: t.signal, body: body,
        headers: Object.assign({ apikey: DB.key, Authorization: 'Bearer ' + (session ? session.access_token : DB.key) }, type ? { 'Content-Type': type } : {}),
      });
      if (res.status === 401 && session && !retried) { await refresh(); return storageFetch(method, path, body, type, true); }
      return res;
    } finally { t.done(); }
  }
  async function uploadVoice(path, blob) {
    var res = await storageFetch('POST', 'ofc-voice/' + path, blob, blob.type || 'audio/webm');
    if (res.ok) return;
    var msg = ''; try { var j = await res.json(); msg = j.message || j.error || ''; } catch (e) { /* no body */ }
    if (res.status === 409 || /already exists|Duplicate/i.test(msg)) return;     // sent before: the clip is already there
    throw new Error(msg || ('HTTP ' + res.status));
  }
  async function fetchVoice(path) {
    var res = await storageFetch('GET', 'authenticated/ofc-voice/' + path);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.blob();
  }
  async function post(table, rows, prefer) {
    if (!session || !rows || !rows.length) return;
    for (var i = 0; i < rows.length; i += 200) await dbFetch('POST', table, rows.slice(i, i + 200), prefer);
  }
  function pushNotes(list) { return post('ofc_notes', (list || []).map(noteRow), 'resolution=ignore-duplicates'); }
  async function pushThoughts(list) {
    if (!session || !list || !list.length) return;
    var rows = [];
    for (var i = 0; i < list.length; i++) {
      var t = list[i], vp = t.voice_path || null;
      if (t.voice && !vp && App() && App().voiceBlob) {
        var blob = await App().voiceBlob(t.id);
        if (blob) {
          var path = COMPASS + '/' + t.id + (String(blob.type).indexOf('mp4') >= 0 ? '.m4a' : '.webm');
          try { await uploadVoice(path, blob); vp = path; App().setVoicePath(t.id, path); }
          catch (e) { failure('The voice note for one thought could not be sent; it will be tried again at the next sync', e); continue; }
        }
      }
      rows.push(thoughtRow(t, vp));
    }
    await post('ofc_thoughts', rows, 'resolution=ignore-duplicates');
  }

  async function sync() {
    if (!session || !App()) return;
    // Pull first: thoughts written on another device are added here. Nothing is ever replaced.
    var remote = await dbFetch('GET', 'ofc_thoughts?select=id,room,author,about,text,revises,piece,voice_path,thought_at&compass=eq.' + COMPASS + '&order=thought_at.desc&limit=5000');
    App().mergeList((remote || []).map(function (r) {
      return { id: r.id, at: r.thought_at, room: r.room, author: r.author, about: r.about, text: r.text, revises: r.revises || '', piece: r.piece || '', voice_path: r.voice_path || '' };
    }));
    await pushThoughts(App().thoughts());
    await pushNotes(App().notes());
    // The newest framework saved in the database, if it is newer than the one in this page, is kept for the next opening.
    var extra = '';
    var fw = await dbFetch('GET', 'ofc_framework?select=data,saved_at&compass=eq.' + COMPASS + '&order=saved_at.desc&limit=1');
    if (fw && fw[0] && fw[0].data && App().keepFramework(fw[0].data)) extra = ' A newer framework was found; reload the page to see it.';
    render('Synced ' + new Date().toLocaleTimeString() + '.' + extra);
  }

  async function checkDb() {
    var out = $('dbCheck');
    if (!session) { out.textContent = 'This device only. Sign in to check the family database.'; return; }
    out.textContent = 'Checking…';
    var lines = [], ok = true;
    for (var i = 0; i < TABLES.length; i++) {
      try {
        var rows = await dbFetch('GET', TABLES[i] + '?select=id&limit=1');
        lines.push('✅ ' + TABLES[i] + (rows && rows.length ? '' : ' (reachable, no rows yet; if rows are expected, check row-level security)'));
      } catch (e) { ok = false; lines.push('❌ ' + TABLES[i] + ': ' + e.message); failure('Database check failed for ' + TABLES[i], e); }
    }
    out.textContent = lines.join('\n');
    if (ok && App()) App().setStatus('family');
  }

  function start() {
    render();
    if ($('familyForm')) $('familyForm').addEventListener('submit', async function (ev) {
      ev.preventDefault();
      var btn = ev.submitter || this.querySelector('button');
      btn.disabled = true;
      try {
        await signIn($('familyEmail').value.trim(), $('familyPassword').value);
        $('familyPassword').value = '';
        render();
        await sync();
      } catch (e) {
        failure('Sign-in or first sync failed', e);
        $('familyStatus').textContent = 'Problem: ' + e.message;
      } finally { btn.disabled = false; }
    });
    if ($('familyOut')) $('familyOut').addEventListener('click', signOut);
    if ($('familyCheck')) $('familyCheck').addEventListener('click', checkDb);
    if ($('familySync')) $('familySync').addEventListener('click', function () { sync().catch(function (e) { failure('Sync failed', e); }); });
    // Offline is not an error on load: say so quietly in the status line.
    if (session) sync().catch(function (e) {
      render('Could not reach the family database just now; this device still has everything.');
      if (App()) App().logError('Sync on load failed: ' + e.message);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

  window.Family = {
    signedIn: function () { return !!session; },
    pushNotes: pushNotes, pushThoughts: pushThoughts, fetchVoice: fetchVoice, sync: sync, checkDb: checkDb,
  };
})();
