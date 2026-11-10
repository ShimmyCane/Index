// 家庭資料庫 (Family project, Supabase): sign-in and the notes table.
// The page works without it: notes always stay on this device, and they are also sent here when signed in.
// Publishable key only (safe in browser code). Table: zhbh_notes (see supabase/001_zhbh_notes.sql).
(function () {
  var DB = {
    url: 'https://twvqvutrcobedvuhnzxq.supabase.co',
    key: 'sb_publishable_eqUo8HEdEB1hMQM4CpSVqA_9i6b0qCo',
  };
  var TABLE = '/rest/v1/zhbh_notes';
  var SESSION_KEY = 'zhbh.session';
  var session = null;
  try { session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch (e) { session = null; }

  function saveSession(s) {
    session = s;
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch (e) { /* storage blocked: stays signed in for this page only */ }
  }
  function withTimeout(ms) {
    var c = new AbortController();
    var t = setTimeout(function () { c.abort(); }, ms);
    return { signal: c.signal, done: function () { clearTimeout(t); } };
  }
  function $(id) { return document.getElementById(id); }
  function failure(msg, err) { if (typeof logError === 'function') logError(msg, err); }

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
    if (!res.ok) { signOut(); throw new Error('登入已過期，請再登入一次'); }
    saveSession(newSession(j, session.email));
  }
  async function dbFetch(method, path, body, prefer, retried) {
    var t = withTimeout(8000);
    try {
      var res = await fetch(DB.url + path, {
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
      if (!res.ok) throw new Error(j.error_description || j.msg || j.message || '登入失敗');
      saveSession(newSession(j, email));
    } finally { t.done(); }
  }
  function signOut() { saveSession(null); render(); }

  function render() {
    var status = $('familyStatus');
    if (status) status.textContent = session
      ? '已登入：' + session.email + '。意見會存到家庭資料庫。'
      : '還沒登入。意見只存在這台裝置上。';
    if ($('familyForm')) $('familyForm').hidden = !!session;
    if ($('familyOut')) $('familyOut').hidden = !session;
  }

  // One row per note. Field names follow the table; the note's own id and time stay the same.
  function noteRow(n) {
    var w = n.where || {};
    return {
      id: n.id, text: n.text, page: w.page || '', item: w.item || '', label: w.label || '',
      version: n.version || '', status: n.status || 'open', noted_at: n.at,
    };
  }
  async function pushNotes(list) {
    if (!session || !list || !list.length) return;
    // Batches of 200, duplicates ignored: a note sent twice is still one row.
    for (var i = 0; i < list.length; i += 200) {
      await dbFetch('POST', TABLE, list.slice(i, i + 200).map(noteRow), 'resolution=ignore-duplicates');
    }
  }
  function sendAll() {
    if (!session || !window.AppNotes) return Promise.resolve();
    return pushNotes(AppNotes.all()).then(function () {
      var el = $('familyStatus');
      if (el) el.textContent = '已登入：' + session.email + '。這台裝置上的意見都已送到家庭資料庫。';
    });
  }

  async function checkDb() {
    var out = $('dbCheck');
    if (!session) { out.textContent = '這台裝置只存在這裡。登入後才會檢查家庭資料庫。'; return; }
    out.textContent = '檢查中…';
    try {
      await dbFetch('GET', TABLE + '?select=id&limit=1');
      out.textContent = '✅ 家庭資料庫連得上（zhbh_notes）。';
    } catch (e) {
      out.textContent = '⚠️ 家庭資料庫出錯：' + e.message;
      failure('家庭資料庫檢查失敗', e);
    }
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
        await sendAll();
      } catch (e) {
        failure('登入失敗', e);
        $('familyStatus').textContent = '登入失敗：' + e.message;
      } finally { btn.disabled = false; }
    });
    if ($('familyOut')) $('familyOut').addEventListener('click', signOut);
    if ($('familyCheck')) $('familyCheck').addEventListener('click', checkDb);
    if (session) sendAll().catch(function (e) { failure('意見沒有送到家庭資料庫', e); });
  });

  window.Family = {
    signedIn: function () { return !!session; },
    pushNotes: pushNotes,
    checkDb: checkDb,
  };
})();
