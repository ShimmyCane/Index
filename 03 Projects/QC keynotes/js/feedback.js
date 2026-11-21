/* QC keynotes: notes for improvement, kept on this device first.
   The Architecture database gets notes and their done/reopen status only, and only after
   you sign in. Guidelines and drawings are never sent. Publishable key only; the password is
   never stored, the sign-in renewal token is (Sign out removes it). */
(function () {
  'use strict';
  const QC = window.QC;
  const CFG = window.QC_CLOUD || {};
  const $ = id => document.getElementById(id);
  const NOTES_KEY = 'qckeynotes.notes';
  const SESSION_KEY = 'qckeynotes.session';
  const VERSION = 'QC keynotes 0.2.0';
  let notes = [];
  let session = null;
  let busy = false;

  const uid = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  function readJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
    catch (e) { QC.logError('Could not read ' + key + ': ' + e.message); return fallback; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { QC.logError('Could not save ' + key + ': ' + e.message); return false; }
  }
  const persist = () => writeJSON(NOTES_KEY, notes);

  function api(method, path, body, opts) {
    opts = opts || {};
    const headers = { apikey: CFG.key, Authorization: 'Bearer ' + ((opts.anon || !session) ? CFG.key : session.token) };
    if (body) headers['Content-Type'] = 'application/json';
    if (opts.prefer) headers.Prefer = opts.prefer;
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 15000);
    return fetch(CFG.url + path, { method, headers, body: body ? JSON.stringify(body) : undefined, signal: ctl.signal })
      .then(res => res.text().then(text => {
        let data = null;
        try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
        if (!res.ok) { const err = new Error(plain(res.status, data, !!session)); err.status = res.status; throw err; }
        return data;
      }))
      .finally(() => clearTimeout(timer));
  }
  // The database's wording is for programmers: say what to do instead.
  function plain(status, d, signedIn) {
    const code = d && d.code, msg = (d && (d.msg || d.message || d.error_description)) || '';
    if (code === 'PGRST205' || code === '42P01' || /schema cache|does not exist/i.test(msg))
      return 'The notes table is not in the database yet. Paste supabase/001_qk_notes.sql in the SQL editor first.';
    if (status === 401 || status === 403 || code === '42501') {
      return signedIn
        ? 'This account is not allowed to keep notes yet, or the sign-in ran out. Sign in again.'
        : 'The database refused this request (HTTP ' + status + '). Check the publishable key in js/config.js.';
    }
    if (status === 400 && /invalid login/i.test(msg)) return 'The email or password is not right.';
    return msg || ('HTTP ' + status);
  }

  function setStatus(text) { $('dbStatus').textContent = text; }
  function renderAccount() {
    $('dbSignInBox').hidden = !!session;
    $('dbSignedIn').hidden = !session;
    if (!session) setStatus('This device only. Notes are saved here. Sign in to also keep them in the Architecture database.');
  }

  // ---------- sign-in ----------
  function start(d, email) {
    session = { token: d.access_token, email };
    writeJSON(SESSION_KEY, { refresh: d.refresh_token, email });
    renderAccount();
    return sync();
  }
  function signIn() {
    const email = $('dbEmail').value.trim(), password = $('dbPassword').value;
    if (!email || !password) { setStatus('Type the email and the password.'); return Promise.resolve(); }
    setStatus('Signing in…');
    return api('POST', '/auth/v1/token?grant_type=password', { email, password }, { anon: true })
      .then(d => { $('dbPassword').value = ''; return start(d, email); })
      .catch(e => { session = null; renderAccount(); setStatus('Sign-in did not work: ' + e.message); QC.logError('Sign-in: ' + e.message); });
  }
  function signOut() {
    session = null;
    try { localStorage.removeItem(SESSION_KEY); } catch (e) { /* blocked: nothing to remove */ }
    renderAccount();
  }
  function resume() {
    const saved = readJSON(SESSION_KEY, null);
    if (!saved || !saved.refresh) { renderAccount(); return Promise.resolve(); }
    return api('POST', '/auth/v1/token?grant_type=refresh_token', { refresh_token: saved.refresh }, { anon: true })
      .then(d => start(d, saved.email))
      .catch(() => { session = null; renderAccount(); setStatus('This device only. The saved sign-in could not be renewed. Sign in again to use the database.'); });
  }

  // ---------- sync: new notes go up, done/reopen changes go up ----------
  const row = n => ({ id: n.id, text: n.text, page: 'index.html', item: n.item || '', label: '', version: VERSION, status: n.status, noted_at: n.at });
  function sync() {
    if (!session || busy) return Promise.resolve();
    busy = true;
    setStatus('Syncing notes…');
    const fresh = notes.filter(n => !n.synced);
    const changed = notes.filter(n => n.synced && n.dirty);
    let sent = 0;
    const send = fresh.length
      ? api('POST', '/rest/v1/' + CFG.table + '?on_conflict=id', fresh.map(row), { prefer: 'resolution=ignore-duplicates,return=minimal' })
      : Promise.resolve();
    return send.then(() => {
      fresh.forEach(n => { n.synced = true; }); sent += fresh.length;
      return Promise.all(changed.map(n => api('PATCH', '/rest/v1/' + CFG.table + '?id=eq.' + encodeURIComponent(n.id), { status: n.status }, { prefer: 'return=minimal' })
        .then(() => { n.dirty = false; })));
    }).then(() => {
      persist();
      setStatus('Signed in as ' + session.email + '. ' + sent + ' note(s) sent, ' + changed.length + ' status change(s) sent.');
    }).catch(e => {
      persist();
      setStatus('Could not sync: ' + e.message + ' Notes are safe on this device.');
      QC.logError('Notes sync: ' + e.message);
    }).finally(() => { busy = false; renderNotes(); });
  }
  function check() {
    const out = $('dbCheckOut');
    out.textContent = '';
    const line = (ok, text) => { const li = document.createElement('li'); li.textContent = (ok ? '✅ ' : '❌ ') + text; out.appendChild(li); };
    return api('GET', '/auth/v1/health', null, { anon: true })
      .then(() => line(true, 'Database reachable'), e => line(false, 'Database not reachable: ' + e.message))
      .then(() => {
        if (!session) { line(true, 'Signed out: this device only'); return; }
        return api('GET', '/rest/v1/' + CFG.table + '?select=id&limit=1').then(
          rows => line(true, CFG.table + ': readable' + (rows && rows.length ? '' : ' (no rows yet)')),
          e => line(false, CFG.table + ': ' + e.message));
      });
  }

  // ---------- notes box ----------
  function renderNotes() {
    const list = $('noteList');
    const open = notes.filter(n => n.status === 'open').length;
    $('noteCount').textContent = notes.length ? `${notes.length} note(s), ${open} open` : 'No notes yet';
    list.innerHTML = notes.length ? notes.slice().reverse().map(n => `
      <li class="noteItem ${n.status}">
        <div><b>${QC.esc(n.item || 'General')}</b> <span class="muted">${new Date(n.at).toLocaleString()}</span>
          ${n.synced ? '' : ' <span class="muted">· device only</span>'}</div>
        <div class="noteText">${QC.esc(n.text)}</div>
        <button type="button" class="mini wide" data-toggle="${n.id}">${n.status === 'open' ? 'Mark done' : 'Reopen'}</button>
      </li>`).join('') : '';
  }
  function saveNote() {
    const text = $('noteText').value.trim();
    if (!text) { setStatus('Type a note first.'); return; }
    notes.push({ id: uid(), text, item: $('noteItem').value, status: 'open', at: new Date().toISOString(), synced: false, dirty: false });
    $('noteText').value = '';
    persist();
    renderNotes();
    setStatus(session ? 'Note saved. Sending…' : 'Note saved on this device.');
    if (session) sync();
  }
  function toggle(id) {
    const n = notes.find(x => x.id === id);
    if (!n) return;
    n.status = n.status === 'open' ? 'done' : 'open';
    n.dirty = n.synced;
    persist();
    renderNotes();
    if (session) sync();
  }
  function copyAll() {
    const text = notes.map(n => `[${n.status}] ${n.item || 'General'} (${new Date(n.at).toLocaleString()}): ${n.text}`).join('\n') || 'No notes.';
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => setStatus('Copied all notes.'), () => setStatus('Could not copy. Select the list and copy it.'));
    else setStatus('Could not copy here. Select the list and copy it.');
  }

  QC.Feedback = {
    init() {
      notes = readJSON(NOTES_KEY, []);
      if (!Array.isArray(notes)) notes = [];
      $('noteSave').addEventListener('click', saveNote);
      $('noteText').addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveNote(); });
      $('noteList').addEventListener('click', e => { const b = e.target.closest('[data-toggle]'); if (b) toggle(b.dataset.toggle); });
      $('noteCopy').addEventListener('click', copyAll);
      $('dbSignIn').addEventListener('click', signIn);
      $('dbPassword').addEventListener('keydown', e => { if (e.key === 'Enter') signIn(); });
      $('dbSignOut').addEventListener('click', signOut);
      $('dbSync').addEventListener('click', () => sync());
      $('dbCheck').addEventListener('click', check);
      renderAccount();
      renderNotes();
      resume().then(renderNotes);
    },
  };
})();
