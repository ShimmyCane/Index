/* Felix Continents common parts (classic script): settings, errors, notes, Family sign-in.
 * Used by index.html, v2.html and v3.html. The page works without the Family database:
 * notes always stay on this device, and are also sent to the family table when signed in. */
(function () {
  var DB = { url: 'https://twvqvutrcobedvuhnzxq.supabase.co', key: 'sb_publishable_eqUo8HEdEB1hMQM4CpSVqA_9i6b0qCo' };
  var TABLE = '/rest/v1/fc_notes', SESSION_KEY = 'felixContinents.session', NKEY = 'felixContinents.notes';
  var VERSION = '0.2.0';

  function $(id) { return document.getElementById(id); }
  function readJSON(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } catch (e) { return fallback; } }
  function writeJSON(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* storage blocked */ } }

  function init(opts) {
    var page = location.pathname.split('/').pop() || 'index.html';
    var defaults = opts.defaults || {};
    var S = Object.assign({}, defaults, readJSON(opts.settingsKey, {}));
    var errors = [];
    var where = { page: page, item: opts.startItem || '', label: opts.startLabel || '' };
    var notes = readJSON(NKEY, []);
    var session = readJSON(SESSION_KEY, null);

    function saveSettings() { writeJSON(opts.settingsKey, S); }
    function renderErrors() {
      var box = $('errorsPanel');
      if (!box) return;
      box.hidden = !S.showErrors;
      box.textContent = errors.length ? errors.join('\n') : 'No problems so far.';
    }
    function logError(msg) { errors.push(new Date().toLocaleTimeString() + '  ' + msg); renderErrors(); }
    window.addEventListener('error', function (e) { logError(e.message); });

    // settings: segmented buttons, drawer, errors checkbox
    function renderSettings() {
      document.querySelectorAll('.seg').forEach(function (seg) {
        var v = String(S[seg.dataset.key]);
        seg.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === v); });
      });
      if ($('showErrors')) $('showErrors').checked = !!S.showErrors;
      renderErrors();
    }
    function setOpen(open) {
      if (!$('drawer')) return;
      $('drawer').hidden = !open;
      $('gear').setAttribute('aria-expanded', String(open));
    }
    if ($('gear')) $('gear').addEventListener('click', function () { setOpen($('drawer').hidden); });
    if ($('closeDrawer')) $('closeDrawer').addEventListener('click', function () { setOpen(false); });
    document.querySelectorAll('.seg button').forEach(function (b) {
      b.addEventListener('click', function () {
        S[b.parentElement.dataset.key] = +b.dataset.v;
        saveSettings(); renderSettings();
        if (opts.onSetting) opts.onSetting(b.parentElement.dataset.key, S);
      });
    });
    if ($('showErrors')) $('showErrors').addEventListener('change', function (e) {
      S.showErrors = e.target.checked ? 1 : 0; saveSettings(); renderErrors();
    });

    // notes for improvement
    function nrender() {
      var list = $('noteList'), f = $('noteFilter') ? $('noteFilter').value : 'open';
      if (!list) return;
      list.textContent = '';
      notes.filter(function (n) { return f === 'all' || n.status === 'open'; })
        .sort(function (a, b) { return a.at < b.at ? 1 : -1; })
        .forEach(function (n) {
          var li = document.createElement('li');
          li.textContent = (n.status === 'done' ? '✅ ' : '📝 ') + (n.where && n.where.label ? n.where.label + ' · ' : '') +
            new Date(n.at).toLocaleString() + '\n' + n.text;
          list.appendChild(li);
        });
    }
    function addNote() {
      var box = $('noteText'), text = box ? box.value.trim() : '';
      if (!text) return;
      var n = { id: 'n-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        at: new Date().toISOString(), status: 'open', text: text, where: Object.assign({}, where), version: VERSION };
      notes.push(n);
      box.value = ''; writeJSON(NKEY, notes); nrender();
      if (session) sendNotes([n]).catch(function (e) { logError('Could not send the note to the family database: ' + e.message); });
    }
    if ($('noteSave')) $('noteSave').addEventListener('click', addNote);
    if ($('noteFilter')) $('noteFilter').addEventListener('change', nrender);
    if ($('noteCopy')) $('noteCopy').addEventListener('click', function () {
      var out = JSON.stringify(notes, null, 2);
      if (navigator.clipboard) navigator.clipboard.writeText(out).catch(function () {});
      else window.prompt('Copy the notes:', out);
    });

    // Family sign-in and the notes table (publishable key only)
    function saveSession(s) { session = s; writeJSON(SESSION_KEY, s); }
    function withTimeout(ms) {
      var c = new AbortController(), t = setTimeout(function () { c.abort(); }, ms);
      return { signal: c.signal, done: function () { clearTimeout(t); } };
    }
    function newSession(j, email) {
      return { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Date.now() + j.expires_in * 1000, email: email };
    }
    function signOut() { saveSession(null); renderFamily(); }
    function refresh() {
      return fetch(DB.url + '/auth/v1/token?grant_type=refresh_token', {
        method: 'POST', headers: { apikey: DB.key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: session.refresh_token })
      }).then(function (res) {
        return res.json().then(function (j) {
          if (!res.ok) { signOut(); throw new Error('Sign in again: the login has expired.'); }
          saveSession(newSession(j, session.email));
        });
      });
    }
    function dbFetch(method, path, body, prefer, retried) {
      var t = withTimeout(8000);
      return fetch(DB.url + path, {
        method: method, signal: t.signal,
        headers: Object.assign({ apikey: DB.key, 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + (session ? session.access_token : DB.key) }, prefer ? { Prefer: prefer } : {}),
        body: body === undefined ? undefined : JSON.stringify(body)
      }).then(function (res) {
        t.done();
        if (res.status === 401 && session && !retried) return refresh().then(function () { return dbFetch(method, path, body, prefer, true); });
        return res.text().then(function (text) {
          var data = text ? JSON.parse(text) : null;
          if (!res.ok) throw new Error((data && (data.message || data.msg || data.error_description)) || ('HTTP ' + res.status));
          return data;
        });
      }, function (e) { t.done(); throw e; });
    }
    function signIn(email, password) {
      var t = withTimeout(10000);
      return fetch(DB.url + '/auth/v1/token?grant_type=password', {
        method: 'POST', signal: t.signal, headers: { apikey: DB.key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
      }).then(function (res) {
        t.done();
        return res.json().then(function (j) {
          if (!res.ok) throw new Error(j.error_description || j.msg || j.message || 'Sign in failed');
          saveSession(newSession(j, email));
        });
      }, function (e) { t.done(); throw e; });
    }
    function noteRow(n) {
      var w = n.where || {};
      return { id: n.id, text: n.text, page: w.page || '', item: w.item || '', label: w.label || '',
        version: n.version || '', status: n.status || 'open', noted_at: n.at };
    }
    function sendNotes(list) {
      if (!session || !list || !list.length) return Promise.resolve();
      var rows = list.map(noteRow), chain = Promise.resolve();
      for (var i = 0; i < rows.length; i += 200) {
        (function (batch) { chain = chain.then(function () { return dbFetch('POST', TABLE, batch, 'resolution=ignore-duplicates'); }); })(rows.slice(i, i + 200));
      }
      return chain;
    }
    function renderFamily() {
      if ($('famStatus')) $('famStatus').textContent = session
        ? 'Signed in as ' + session.email + '. Notes are also saved to the family database.'
        : 'Not signed in. Notes stay on this device only.';
      if ($('famForm')) $('famForm').hidden = !!session;
      if ($('famOut')) $('famOut').hidden = !session;
    }
    if ($('famSignIn')) $('famSignIn').addEventListener('click', function () {
      var email = $('famEmail').value.trim(), pass = $('famPass').value;
      if (!email || !pass) { $('famStatus').textContent = 'Type the email and password.'; return; }
      $('famStatus').textContent = 'Signing in…';
      signIn(email, pass).then(function () {
        $('famPass').value = '';
        renderFamily();
        return sendNotes(notes).then(function () { $('famStatus').textContent = 'Signed in. Your notes are now in the family database.'; });
      }).catch(function (e) { $('famStatus').textContent = 'Could not sign in: ' + e.message; logError('Sign in failed: ' + e.message); });
    });
    if ($('famSignOut')) $('famSignOut').addEventListener('click', signOut);
    if ($('famCheck')) $('famCheck').addEventListener('click', function () {
      var out = $('dbCheck');
      if (!session) { out.textContent = 'This device only. Sign in to check the family database.'; return; }
      out.textContent = 'Checking…';
      dbFetch('GET', TABLE + '?select=id&limit=1').then(function () {
        out.textContent = '✅ The family database answers (fc_notes).';
      }).catch(function (e) { out.textContent = '⚠️ The family database gave an error: ' + e.message; logError('Database check failed: ' + e.message); });
    });

    renderSettings();
    nrender();
    renderFamily();

    return {
      S: S,
      setContext: function (ctx) { where = Object.assign({}, where, ctx); },
      logError: logError,
      renderSettings: renderSettings
    };
  }

  window.FCCommon = { init: init, DB: DB };
})();
