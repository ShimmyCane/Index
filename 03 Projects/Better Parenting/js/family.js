// Family database (Family project, Supabase): sign-in and three tables.
// The page works without it: everything stays on this device, and is also sent here when signed in.
// Publishable key only (safe in browser code). Tables: bp_notes, bp_scenarios, bp_practice (see supabase/001_bp_family.sql).
(function () {
  var DB = {
    url: 'https://twvqvutrcobedvuhnzxq.supabase.co',
    key: 'sb_publishable_eqUo8HEdEB1hMQM4CpSVqA_9i6b0qCo',
  };
  var TABLES = ['bp_notes', 'bp_scenarios', 'bp_practice'];
  var SESSION_KEY = 'bp.session';
  var session = null;
  try { session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch (e) { session = null; }

  function saveSession(s) {
    session = s;
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch (e) { /* storage blocked: signed in for this page only */ }
  }
  function withTimeout(ms) {
    var c = new AbortController();
    var t = setTimeout(function () { c.abort(); }, ms);
    return { signal: c.signal, done: function () { clearTimeout(t); } };
  }
  function $(id) { return document.getElementById(id); }
  function failure(msg, err) { if (typeof logError === 'function') logError(msg, err); if (window.BPApp) BPApp.setStatus('check'); }

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
      ? 'Signed in as ' + session.email + '. ' + (extra || 'Scenarios, practice and notes are also saved to the family database.')
      : 'Not signed in. Everything stays on this device only.';
    if ($('familyForm')) $('familyForm').hidden = !!session;
    if ($('familyOut')) $('familyOut').hidden = !session;
    if ($('familySync')) $('familySync').hidden = !session;
    if (window.BPApp) BPApp.setStatus(session ? 'family' : 'device');
  }

  // Rows follow the tables. A row's own id and time never change.
  function noteRow(n) {
    var w = n.where || {};
    return { id: n.id, text: n.text, page: w.page || '', item: w.item || '', label: w.label || '',
      version: n.version || '', status: n.status || 'open', noted_at: n.at };
  }
  function ownRow(o) { return { id: o.id, data: o, deleted: !!o.deleted, updated_at: o.updated || new Date().toISOString() }; }
  function practiceRow(p) { return { id: p.id, scenario_id: p.sid, rating: p.rating, reflection: p.text || '', practiced_at: p.at }; }
  async function post(table, rows, prefer) {
    if (!session || !rows || !rows.length) return;
    for (var i = 0; i < rows.length; i += 200) await dbFetch('POST', table, rows.slice(i, i + 200), prefer);
  }
  // Notes and practice are append-only (a row sent twice is still one row). A scenario can be edited, so the newer copy wins.
  function pushNotes(list) { return post('bp_notes', (list || []).map(noteRow), 'resolution=ignore-duplicates'); }
  function pushPractice(list) { return post('bp_practice', (list || []).map(practiceRow), 'resolution=ignore-duplicates'); }
  function pushOwn(list) { return post('bp_scenarios', (list || []).map(ownRow), 'resolution=merge-duplicates'); }

  async function sync() {
    if (!session || !window.BPApp) return;
    // Pull first, so a newer copy from another device is not overwritten by an older one here.
    var remoteOwn = await dbFetch('GET', 'bp_scenarios?select=id,data,deleted,updated_at&order=updated_at.desc&limit=1000');
    var remotePractice = await dbFetch('GET', 'bp_practice?select=id,scenario_id,rating,reflection,practiced_at&order=practiced_at.desc&limit=5000');
    BPApp.merge(
      (remoteOwn || []).map(function (r) { return Object.assign({}, r.data, { id: r.id, own: true, deleted: !!r.deleted, updated: r.updated_at }); }),
      (remotePractice || []).map(function (r) { return { id: r.id, sid: r.scenario_id, rating: r.rating, text: r.reflection || '', at: r.practiced_at }; })
    );
    var d = BPApp.data();
    await pushOwn(d.own); await pushPractice(d.practice);
    if (window.AppNotes) await pushNotes(AppNotes.all());
    render('Synced ' + new Date().toLocaleTimeString() + '.');
  }

  async function checkDb() {
    var out = $('dbCheck');
    if (!session) { out.textContent = 'This device only. Sign in to check the family database.'; return; }
    out.textContent = 'Checking…';
    var lines = [], ok = true;
    for (var i = 0; i < TABLES.length; i++) {
      try {
        var rows = await dbFetch('GET', TABLES[i] + '?select=id&limit=1');
        lines.push('✅ ' + TABLES[i] + (rows && rows.length ? '' : ' (reachable, no rows yet)'));
      } catch (e) { ok = false; lines.push('❌ ' + TABLES[i] + ': ' + e.message); failure('Database check failed for ' + TABLES[i], e); }
    }
    out.textContent = lines.join('\n');
    out.style.whiteSpace = 'pre-wrap';
    if (ok && window.BPApp) BPApp.setStatus('family');
  }

  document.addEventListener('DOMContentLoaded', function () {
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
    if (session) sync().catch(function (e) { render('Could not reach the family database just now; this device still has everything.'); if (typeof logError === 'function') logError('Sync on load failed', e); });
  });

  window.Family = {
    signedIn: function () { return !!session; },
    pushNotes: pushNotes, pushOwn: pushOwn, pushPractice: pushPractice, sync: sync, checkDb: checkDb,
  };
})();
