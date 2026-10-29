// Shimmy Specs — accounts and cloud projects. Calls only the ss_* functions, through the REST RPC endpoint.
// Reads the connection from window.SS_CONFIG (index.html, config block). No DOM except the status hooks in app.js.
(function (root) {
  'use strict';
  var SS = root.SS = root.SS || {};
  var SESSION_KEY = 'ss.session';
  var SAVE_DELAY = 2000;
  var timer = null;
  var pending = null;
  var state = { status: 'device', message: '', at: null };

  function config() { return root.SS_CONFIG || {}; }

  function configured() {
    var c = config();
    return !!c.supabaseUrl && c.supabaseUrl.indexOf('<') !== 0 && !!c.publishableKey && c.publishableKey.indexOf('<') !== 0;
  }

  function session() {
    try {
      var raw = root.localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function setSession(s) {
    try {
      if (s) root.localStorage.setItem(SESSION_KEY, JSON.stringify(s));
      else root.localStorage.removeItem(SESSION_KEY);
    } catch (e) { if (SS.errors) SS.errors.log(e); }
  }

  function setStatus(status, message) {
    state = { status: status, message: message || '', at: new Date().toISOString() };
    if (root.SS && SS.app && SS.app.refreshStatus) SS.app.refreshStatus();
  }

  // One RPC call. Errors from Postgres come back as { message }.
  function rpc(fn, body) {
    if (!configured()) return Promise.reject(new Error('Database not set up: fill in the config block in index.html'));
    var c = config();
    return fetch(c.supabaseUrl.replace(/\/+$/, '') + '/rest/v1/rpc/' + fn, {
      method: 'POST',
      headers: {
        'apikey': c.publishableKey,
        'Authorization': 'Bearer ' + c.publishableKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body || {})
    }).then(function (r) {
      return r.text().then(function (text) {
        var data = null;
        try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
        if (!r.ok) {
          var msg = (data && (data.message || data.hint)) || ('HTTP ' + r.status);
          var err = new Error(msg);
          err.sessionExpired = /session expired|not signed in/.test(msg);
          throw err;
        }
        return data;
      });
    });
  }

  function requireToken() {
    var s = session();
    if (!s || !s.token) throw new Error('Not signed in');
    return s.token;
  }

  function handleAuthError(err) {
    if (err && err.sessionExpired) {
      setSession(null);
      setStatus('device', 'Signed out: the session expired. Sign in again.');
    }
    throw err;
  }

  var cloud = {
    configured: configured,
    session: session,
    status: function () { return Object.assign({}, state, { configured: configured(), signedIn: !!session() }); },

    signIn: function (username, password) {
      return rpc('ss_sign_in', { p_username: username, p_password: password }).then(function (res) {
        if (!res || res.ok !== true) throw new Error((res && res.error) || 'Sign-in failed');
        setSession({ token: res.token, username: res.username });
        setStatus('idle', 'Signed in');
        return res;
      });
    },

    signOut: function () {
      var s = session();
      setSession(null);
      setStatus('device', 'Signed out');
      if (!s || !configured()) return Promise.resolve();
      return rpc('ss_sign_out', { p_token: s.token }).catch(function () { /* the session ends either way */ });
    },

    list: function () {
      return rpc('ss_list_projects', { p_token: requireToken() }).catch(handleAuthError);
    },

    load: function (id) {
      return rpc('ss_load_project', { p_token: requireToken(), p_id: id }).catch(handleAuthError);
    },

    remove: function (id) {
      return rpc('ss_delete_project', { p_token: requireToken(), p_id: id }).catch(handleAuthError);
    },

    // Saves the project to the account. Sets project.cloudId on first save.
    saveNow: function (project) {
      var token = requireToken();
      setStatus('saving', 'Saving to account…');
      return rpc('ss_save_project', {
        p_token: token,
        p_id: project.cloudId || null,
        p_name: project.name || 'Untitled sketch',
        p_kind: project.kind || 'sketch',
        p_state: project
      }).then(function (id) {
        project.cloudId = id;
        // Write locally without queuing another cloud save.
        if (SS.store) SS.store.saveNow();
        setStatus('saved', 'Saved to account');
        return id;
      }).catch(function (err) {
        setStatus('error', 'Not saved to account: ' + err.message);
        return handleAuthError(err);
      });
    },

    // Debounced: called by store.save() after every change.
    schedule: function (project) {
      if (!configured() || !session()) return;
      pending = project;
      if (timer) root.clearTimeout(timer);
      timer = root.setTimeout(function () {
        timer = null;
        var p = pending;
        pending = null;
        if (p) cloud.saveNow(p).catch(function (err) { if (SS.errors) SS.errors.log(err); });
      }, SAVE_DELAY);
    },

    // Checks that the database answers and the ss_ functions exist. Used by ⚙️ "Check database".
    health: function () {
      return rpc('ss_sign_out', { p_token: 'health-check' }).then(function () {
        return 'Database reachable and the Shimmy Specs functions answer.';
      });
    }
  };

  SS.cloud = cloud;
  if (typeof module !== 'undefined' && module.exports) module.exports = cloud;
})(typeof window !== 'undefined' ? window : globalThis);
