// Shimmy Specs — accounts and cloud projects. Calls only the ss_* functions, through the REST RPC endpoint.
// Reads the connection from window.SS_CONFIG (index.html, config block). No DOM except the status hooks in app.js.
//
// Sync model. Each local project that is linked to a cloud project keeps a `cloudBase`:
//   { updatedAt: the cloud updated_at after the last sync, hash: fingerprint of the project then }.
// Compare the cloud row and the local project with that base:
//   only this device changed -> upload · only the cloud changed -> download
//   both changed             -> conflict (never overwritten silently)
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

  function settings() {
    return SS.store ? SS.store.settings() : { databaseManagement: true };
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

  // ---- fingerprint and comparison (no network) -----------------------------

  // Fingerprint of the project content. Sync bookkeeping and the timestamp are left out.
  function hashOf(p) {
    var copy = {};
    Object.keys(p).forEach(function (k) {
      if (k !== 'cloudId' && k !== 'cloudBase' && k !== 'updated') copy[k] = p[k];
    });
    var text = JSON.stringify(copy);
    var h = 5381;
    for (var i = 0; i < text.length; i++) h = (Math.imul(h, 33) ^ text.charCodeAt(i)) >>> 0;
    return h.toString(36) + ':' + text.length;
  }

  // What a sync of one cloud row would do: 'same' | 'upload' | 'download' | 'conflict'.
  // `local` is the linked local project, or undefined when this device has no copy.
  function syncStatus(row, local) {
    if (!local) return 'download';
    if (!local.cloudBase) return 'conflict';   // no shared starting point: ask the owner
    var localChanged = hashOf(local) !== local.cloudBase.hash;
    var cloudChanged = row.updated_at !== local.cloudBase.updatedAt;
    if (localChanged && cloudChanged) return 'conflict';
    if (localChanged) return 'upload';
    if (cloudChanged) return 'download';
    return 'same';
  }

  function findRow(rows, id) {
    return (rows || []).filter(function (r) { return r.id === id; })[0];
  }

  function normName(s) { return String(s || '').trim().toLowerCase(); }

  // ---- network steps ------------------------------------------------------

  // Writes the project to the account. If `expected` is given (the cloud updated_at we last synced),
  // first checks that the cloud copy has not changed; if it has, nothing is written and { conflict: true }.
  function push(project, expected) {
    var token = requireToken();
    var check = project.cloudId && expected
      ? cloud.list().then(function (rows) {
          var row = findRow(rows, project.cloudId);
          if (!row) throw new Error('This project was removed from the account.');
          return row.updated_at === expected;
        })
      : Promise.resolve(true);
    return check.then(function (ok) {
      if (!ok) return { conflict: true };
      return rpc('ss_save_project', {
        p_token: token,
        p_id: project.cloudId || null,
        p_name: project.name || 'Untitled sketch',
        p_kind: project.kind || 'sketch',
        p_state: project
      }).then(function (id) {
        return cloud.list().then(function (rows) {
          var row = findRow(rows, id);
          project.cloudId = id;
          project.cloudBase = { updatedAt: row ? row.updated_at : null, hash: hashOf(project) };
          return { conflict: false, id: id };
        });
      });
    });
  }

  // Loads the cloud copy into a local project. Keeps the local id when there is a local copy.
  function download(row, local) {
    return rpc('ss_load_project', { p_token: requireToken(), p_id: row.id }).then(function (state) {
      if (!state) throw new Error('That project was not found on the account.');
      state.id = local ? local.id : SS.store.newId();
      state.cloudId = row.id;
      state.cloudBase = { updatedAt: row.updated_at, hash: hashOf(state) };
      SS.store.writeProject(state);
      return state;
    });
  }

  var cloud = {
    configured: configured,
    session: session,
    status: function () { return Object.assign({}, state, { configured: configured(), signedIn: !!session() }); },
    syncStatus: syncStatus,
    hashOf: hashOf,

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

    // Saves the open project to the account. A changed cloud copy is not overwritten: the status
    // shows a conflict and the owner resolves it on the Database page.
    saveNow: function (project) {
      var expected = project.cloudId && project.cloudBase ? project.cloudBase.updatedAt : null;
      setStatus('saving', 'Saving to account…');
      return push(project, expected).then(function (res) {
        if (res.conflict) {
          setStatus('conflict', 'Changed on another device. Resolve it in Database management.');
          return null;
        }
        if (SS.store) SS.store.writeProject(project);
        setStatus('saved', 'Saved to account');
        return res.id;
      }).catch(function (err) {
        setStatus('error', 'Not saved to account: ' + err.message);
        return handleAuthError(err);
      });
    },

    // Debounced: called by store.save() after every change. Only when auto save is on.
    schedule: function (project) {
      if (!configured() || !session()) return;
      var cur = SS.store && SS.store.current;
      if (settings().databaseManagement === false || (cur && cur.autoSave === false)) return;
      pending = project;
      if (timer) root.clearTimeout(timer);
      timer = root.setTimeout(function () {
        timer = null;
        var p = pending;
        pending = null;
        if (p) cloud.saveNow(p).catch(function (err) { if (SS.errors) SS.errors.log(err); });
      }, SAVE_DELAY);
    },

    // Opens a cloud project on this device. An existing local copy is never overwritten here.
    adopt: function (id) {
      return cloud.list().then(function (rows) {
        var row = findRow(rows, id);
        if (!row) throw new Error('That project was not found on the account.');
        var local = SS.store.findByCloudId(id);
        if (local && syncStatus(row, local) !== 'download') return local;
        return download(row, local);
      });
    },

    // The Sync button: upload or download, whichever side changed. A conflict is returned, not forced.
    syncRow: function (row) {
      var local = SS.store.findByCloudId(row.id);
      var s = syncStatus(row, local);
      if (s === 'download') return download(row, local).then(function () { return 'download'; });
      if (s === 'upload') {
        return push(local, local.cloudBase.updatedAt).then(function (res) {
          if (res.conflict) return 'conflict';
          SS.store.writeProject(local);
          return 'upload';
        });
      }
      return Promise.resolve(s);
    },

    // Conflict choices:
    //   'cloud' -> replace this device's copy with the cloud copy
    //   'local' -> replace the cloud copy with this device's copy
    //   'both'  -> keep this device's copy as a second project, and take the cloud copy into the original
    resolve: function (row, choice) {
      var local = SS.store.findByCloudId(row.id);
      if (choice === 'cloud' || !local) return download(row, local).then(function () { return 'cloud'; });
      if (choice === 'local') {
        return push(local, null).then(function () { SS.store.writeProject(local); return 'local'; });
      }
      if (choice === 'both') {
        var copy = JSON.parse(JSON.stringify(local));
        copy.id = SS.store.newId();
        delete copy.cloudId;
        delete copy.cloudBase;
        copy.name = (local.name || 'Untitled sketch') + ' (device copy)';
        return push(copy, null).then(function () {
          SS.store.writeProject(copy);
          return download(row, local);
        }).then(function () { return 'both'; });
      }
      return Promise.reject(new Error('Unknown choice: ' + choice));
    },

    // Deletes the cloud copies of every project except the names in keepNames (comma-separated).
    // Local copies are kept; they just stop being linked to the cloud.
    deleteAll: function (keepNames) {
      var keep = String(keepNames || '').split(',').map(normName).filter(Boolean);
      return cloud.list().then(function (rows) {
        var removed = 0;
        var kept = 0;
        var chain = Promise.resolve();
        (rows || []).forEach(function (row) {
          if (keep.indexOf(normName(row.name)) >= 0) { kept++; return; }
          chain = chain.then(function () {
            return rpc('ss_delete_project', { p_token: requireToken(), p_id: row.id });
          }).then(function () {
            removed++;
            var local = SS.store.findByCloudId(row.id);
            if (local) {
              delete local.cloudId;
              delete local.cloudBase;
              SS.store.writeProject(local);
            }
          });
        });
        return chain.then(function () { return { removed: removed, kept: kept, listed: (rows || []).length }; });
      }).catch(handleAuthError);
    },

    // Saves the open project (saved text notes included) to the account, then reads it back and
    // compares it, so the owner can see it arrived. Creates the cloud copy if there is none yet.
    syncProject: function (project) {
      if (!configured() || !session()) return Promise.reject(new Error('Sign in on the Start page first.'));
      var expected = project.cloudId && project.cloudBase ? project.cloudBase.updatedAt : null;
      return push(project, expected).then(function (res) {
        if (res.conflict) return { status: 'conflict' };
        SS.store.writeProject(project);
        return rpc('ss_load_project', { p_token: requireToken(), p_id: res.id }).then(function (state) {
          var matches = !!state && hashOf(state) === hashOf(project);
          return {
            status: matches ? 'verified' : 'mismatch',
            notes: state && Array.isArray(state.textNotes) ? state.textNotes.length : 0
          };
        });
      });
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
