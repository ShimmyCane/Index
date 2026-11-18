/* Generate Clouds — the studio database link (Architecture project, owner sign-in).
   Only notes for improvement go there, and only after you sign in. The page works without it:
   notes stay on this device first. The password is never stored; the sign-in renewal token is
   (Sign out removes it). Publishable key only. */
(function () {
  'use strict';
  var GC = window.GC = window.GC || {};
  var CFG = window.GC_CLOUD || {}, SESSION = 'gc.session', SYNCED = 'gc.notes.synced';
  var session = null, synced = GC.store.get(SYNCED, {}) || {}, busy = false;
  var C = GC.Cloud = { state: 'device', last: '' };

  function api(method, path, body, opts) {
    opts = opts || {};
    var headers = { apikey: CFG.key, Authorization: 'Bearer ' + (opts.anon ? CFG.key : (session && session.token) || CFG.key) };
    if (body) headers['Content-Type'] = 'application/json';
    if (opts.prefer) headers.Prefer = opts.prefer;
    var ctl = ('AbortController' in window) ? new AbortController() : null, timer = setTimeout(function () { if (ctl) ctl.abort(); }, 15000);
    return fetch(CFG.url + path, { method: method, headers: headers, body: body ? JSON.stringify(body) : undefined, signal: ctl ? ctl.signal : undefined }).then(function (res) {
      return res.text().then(function (text) {
        var data = null; try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
        if (!res.ok) { var e = new Error(plain(res.status, data)); e.status = res.status; e.code = data && data.code; throw e; }
        return data;
      });
    }).finally(function () { clearTimeout(timer); });
  }
  // The database's own wording is for programmers: say what to do.
  function plain(status, d) {
    var code = d && d.code, msg = d && (d.msg || d.message || d.error_description) || '';
    if (code === 'PGRST205' || code === '42P01' || /schema cache|does not exist/i.test(msg)) return 'The notes table is not in the database yet. Paste supabase/001_gc_notes.sql in the SQL editor first.';
    if (status === 401 || status === 403 || code === '42501') return 'This account is not allowed to keep notes yet, or the sign-in ran out. Sign in again. If it still fails, run supabase/000_owner_row.sql once in the database (it allows your account only).';
    if (status === 400 && /invalid login/i.test(msg)) return 'The email or password is not right.';
    return msg || ('HTTP ' + status);
  }
  function setStatus(text) { var el = GC.$('dbStatus'); if (el) el.textContent = text; C.last = text; }
  function render() {
    GC.$('dbSignInBox').hidden = !!session;
    GC.$('dbSignOut').hidden = !session; GC.$('dbSync').hidden = !session;
    C.state = session ? 'signed-in' : 'device';
    if (!session) setStatus('This device only. Notes are saved here. Sign in to also keep them in the studio database.');
    if (GC.Notes && GC.Notes.render) GC.Notes.render();
  }
  function start(d, email) {
    session = { token: d.access_token, refresh: d.refresh_token, email: email };
    GC.store.set(SESSION, { refresh: d.refresh_token, email: email });
    render(); return C.sync();
  }
  C.signIn = function () {
    var email = GC.$('dbEmail').value.trim(), password = GC.$('dbPassword').value;
    if (!email || !password) { setStatus('Type the email and the password.'); return Promise.resolve(); }
    setStatus('Signing in…');
    return api('POST', '/auth/v1/token?grant_type=password', { email: email, password: password }, { anon: true }).then(function (d) {
      GC.$('dbPassword').value = ''; return start(d, email);
    }).catch(function (e) { session = null; render(); setStatus('Sign-in did not work: ' + e.message); GC.logError('Sign-in: ' + e.message); });
  };
  C.signOut = function () { session = null; GC.store.set(SESSION, null); try { localStorage.removeItem(SESSION); } catch (e) { /* blocked */ } render(); };
  C.resume = function () {
    var saved = GC.store.get(SESSION, null);
    if (!saved || !saved.refresh) { render(); return Promise.resolve(); }
    return api('POST', '/auth/v1/token?grant_type=refresh_token', { refresh_token: saved.refresh }, { anon: true })
      .then(function (d) { return start(d, saved.email); })
      .catch(function () { render(); setStatus('This device only. The saved sign-in could not be renewed (offline, or it ran out). Sign in again when you want the database.'); });
  };

  function row(n) {
    return { id: n.id, text: n.text, page: (n.where && n.where.page) || 'index.html', item: (n.where && n.where.item) || '', label: (n.where && n.where.label) || '', version: n.version || '', status: n.status || 'open', noted_at: n.at };
  }
  // Send what the database has not seen, then take back what it knows (done marks, notes from another device).
  C.sync = function () {
    if (!session || busy) return Promise.resolve();
    busy = true; setStatus('Syncing notes…');
    var local = GC.Notes.all(), todo = local.filter(function (n) { return !synced[n.id]; });
    var send = todo.length ? api('POST', '/rest/v1/' + CFG.table + '?on_conflict=id', todo.map(row), { prefer: 'resolution=ignore-duplicates,return=minimal' }) : Promise.resolve();
    return send.then(function () {
      todo.forEach(function (n) { synced[n.id] = true; }); GC.store.set(SYNCED, synced);
      // done / reopen changes made on this device that the database has not seen yet
      var changes = GC.Notes.dirtyIds().map(function (id) { return local.filter(function (n) { return n.id === id; })[0] || GC.Notes.all().filter(function (n) { return n.id === id; })[0]; }).filter(Boolean);
      return Promise.all(changes.map(function (n) { return patchNote(n); }));
    }).then(function () {
      return api('GET', '/rest/v1/' + CFG.table + '?select=id,text,page,item,label,version,status,noted_at&order=noted_at.asc&limit=1000');
    }).then(function (rows) {
      var changed = GC.Notes.merge(rows || []);
      (rows || []).forEach(function (r) { synced[r.id] = true; }); GC.store.set(SYNCED, synced);
      setStatus('Signed in as ' + session.email + '. ' + (rows || []).length + ' note(s) in the studio database' + (todo.length ? ', ' + todo.length + ' just sent' : '') +
        (changed ? ', ' + changed + ' updated from it' : '') + '. ' + ((rows || []).length ? '' : 'An empty list with no error can also mean this account is not allowed yet (row-level security).'));
    }).catch(function (e) { setStatus('Could not sync: ' + e.message + ' Notes are safe on this device.'); GC.logError('Notes sync: ' + e.message); })
      .finally(function () { busy = false; if (GC.Notes.render) GC.Notes.render(); });
  };
  function patchNote(n) {
    return api('PATCH', '/rest/v1/' + CFG.table + '?id=eq.' + encodeURIComponent(n.id), { status: n.status, text: n.text }, { prefer: 'return=minimal' }).then(function () { GC.Notes.clearDirty(n.id); });
  }
  // A note marked done or reopened: sent straight away when signed in; otherwise it waits for the next sync.
  C.noteChanged = function (n) {
    if (!session) return;
    patchNote(n).catch(function (e) { setStatus('Could not update that note in the database: ' + e.message + ' It is changed on this device and will be sent at the next sync.'); GC.logError('Note update: ' + e.message); });
  };
  // A new note: sent straight away when signed in.
  C.noteAdded = function () { if (session) C.sync(); };
  C.isSynced = function (id) { return !!synced[id]; };
  C.signedIn = function () { return !!session; };

  C.check = function () {
    var out = GC.$('dbCheckOut'); out.textContent = '';
    function line(ok, text) { var li = document.createElement('li'); li.textContent = (ok ? '✅ ' : '❌ ') + text; out.appendChild(li); }
    return api('GET', '/auth/v1/health', null, { anon: true }).then(function () { line(true, 'Database reachable'); }, function (e) { line(false, 'Database not reachable: ' + e.message); })
      .then(function () {
        if (!session) { line(true, 'Signed out: this device only'); return; }
        return api('GET', '/rest/v1/' + CFG.table + '?select=id&limit=1').then(function (rows) {
          line(true, CFG.table + ': readable' + (rows && rows.length ? '' : ' (no rows; if you have saved notes, check the owner row)'));
        }, function (e) { line(false, CFG.table + ': ' + e.message); });
      });
  };

  C.init = function () {
    GC.$('dbSignIn').addEventListener('click', C.signIn);
    GC.$('dbPassword').addEventListener('keydown', function (e) { if (e.key === 'Enter') C.signIn(); });
    GC.$('dbSignOut').addEventListener('click', C.signOut);
    GC.$('dbSync').addEventListener('click', C.sync);
    GC.$('dbCheck').addEventListener('click', C.check);
    render(); C.resume();
  };
})();
