// Shimmy Specs — shell: boot, header, router, navigation, layout (minimize, resize, reorder),
// ⚙️ drawer, error panel, account actions, and event wiring.
(function (root) {
  'use strict';
  var SS = root.SS = root.SS || {};
  var doc = root.document;
  var ui = SS.ui = SS.ui || {};
  var store = SS.store;
  var LAYOUT_KEY = 'ss.layout';
  var DEFAULT_LAYOUT = { navHidden: false, sideHidden: false, sideWidth: 340, sideOrder: ['explain', 'perspectives', 'decisions'] };
  SS.layoutDefaults = DEFAULT_LAYOUT;

  function loadLayout() {
    var out = Object.assign({}, DEFAULT_LAYOUT, { sideOrder: DEFAULT_LAYOUT.sideOrder.slice() });
    try {
      var saved = JSON.parse(root.localStorage.getItem(LAYOUT_KEY) || '{}');
      Object.keys(DEFAULT_LAYOUT).forEach(function (k) { if (saved[k] !== undefined) out[k] = saved[k]; });
      var ok = Array.isArray(out.sideOrder) && out.sideOrder.length === 3 && DEFAULT_LAYOUT.sideOrder.every(function (k) { return out.sideOrder.indexOf(k) >= 0; });
      if (!ok) out.sideOrder = DEFAULT_LAYOUT.sideOrder.slice();
      // On a phone, start with the menu folded away unless the user chose otherwise.
      if (saved.navHidden === undefined && root.innerWidth < 900) out.navHidden = true;
    } catch (e) { /* keep defaults */ }
    return out;
  }

  var UI = {
    focus: null, editing: null, flagFilter: 'open', decSection: '', decKind: '', drawer: false,
    layout: loadLayout(), cloudList: null, cloudError: '', cloudLoading: false, authError: '', dbMessage: ''
  };

  function saveLayout() {
    try { root.localStorage.setItem(LAYOUT_KEY, JSON.stringify(UI.layout)); } catch (e) { SS.errors.log(e); }
  }

  ui.LEVELS = ['auto', 'review', 'decision'];
  ui.esc = function (s) {
    return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  ui.levelBadge = function (level) { return '<span class="badge lvl-' + ui.esc(level) + '">' + ui.esc(level) + '</span>'; };
  ui.divClass = function (num) {
    var d = parseInt(String(num).slice(0, 2), 10);
    return d === 0 ? 'div-00' : d === 1 ? 'div-01' : d <= 5 ? 'div-02' : d <= 9 ? 'div-06' : 'div-10';
  };

  // ---- errors ---------------------------------------------------------------
  var errorLog = [];
  SS.errors = {
    log: function (err) {
      var msg = err && err.message ? err.message : String(err);
      errorLog.unshift({ at: new Date().toISOString().slice(11, 19), msg: msg });
      errorLog = errorLog.slice(0, 50);
      if (root.console) root.console.error(err);
      renderErrors();
    }
  };

  function renderErrors() {
    var panel = doc && doc.getElementById('errors');
    if (!panel) return;
    panel.hidden = !store.settings().showErrors;
    panel.innerHTML = '<strong>Errors</strong> <button class="btn small" data-act="clear-errors">Clear</button>' +
      (errorLog.length ? '<ul>' + errorLog.map(function (e) { return '<li>' + e.at + ' ' + ui.esc(e.msg) + '</li>'; }).join('') + '</ul>' : '<p class="muted">None.</p>');
  }

  root.addEventListener('error', function (e) { SS.errors.log(e.error || e.message); });
  root.addEventListener('unhandledrejection', function (e) { SS.errors.log(e.reason || 'Unhandled promise rejection'); });

  // ---- status light (header pill) --------------------------------------------
  function statusInfo() {
    var c = SS.cloud.status();
    if (!c.configured) return { cls: 'device', text: 'On this device · database not set up' };
    if (!c.signedIn) return { cls: 'device', text: 'On this device · not signed in' };
    if (root.navigator && root.navigator.onLine === false) return { cls: 'device', text: 'Offline · saved on this device' };
    if (c.status === 'saving') return { cls: 'saving', text: 'Saving to account…' };
    if (c.status === 'error') return { cls: 'error', text: 'Not saved to account' };
    return { cls: 'saved', text: 'Saved to account · ' + SS.cloud.session().username };
  }

  function refreshStatus() {
    var el = doc && doc.getElementById('syncPill');
    if (!el || !SS.cloud) return;
    var info = statusInfo();
    el.className = 'pill pill-' + info.cls;
    el.textContent = info.text;
    el.title = SS.cloud.status().message || info.text;
  }
  SS.app = { refreshStatus: refreshStatus, UI: UI };

  // ---- router ---------------------------------------------------------------
  function route() {
    var h = (root.location.hash || '#/start').replace(/^#\/?/, '');
    var parts = h.split('/');
    return { name: parts[0] || 'start', arg: decodeURIComponent(parts.slice(1).join('/')) };
  }

  function nav(current) {
    var p = store.current;
    var book = p ? SS.recommend.bookSections(p) : [];
    var open = p ? (p.flags || []).filter(function (f) { return f.status === 'open'; }).length : 0;
    var decs = p ? (p.decisions || []).length : 0;
    var links = [
      ['start', 'Start', ''],
      ['import', 'Import', ''],
      ['survey', 'Survey', ''],
      ['sections', 'Sections', p ? book.length + ' in book' : ''],
      ['flags', 'Flags', open ? String(open) : ''],
      ['decisions', 'Decisions', decs ? String(decs) : ''],
      ['outputs', 'Outputs', '']
    ];
    return '<nav class="nav"><div class="proj">' + (p ? ui.esc(p.name) : 'No project') + '</div>' +
      links.map(function (l) {
        return '<a href="#/' + l[0] + '"' + (current === l[0] ? ' class="on"' : '') + '>' + l[1] +
          (l[2] ? ' <span class="count">' + ui.esc(l[2]) + '</span>' : '') + '</a>';
      }).join('') +
      (book.length ? '<div class="sub">Book</div>' + book.map(function (s) {
        var on = current === 'section' && UI.focus && UI.focus.num === s.number;
        return '<a class="book ' + ui.divClass(s.number) + (on ? ' on' : '') + '" href="#/section/' + ui.esc(s.number) + '">' +
          ui.esc(s.number) + ' ' + ui.esc((SS.recommend.sectionEntry(store.data, s.number) || {}).title || '') + '</a>';
      }).join('') : '') + '</nav>';
  }

  function topbar(r) {
    var p = store.current;
    var notes = r.name === 'section'
      ? '<button class="btn small" data-act="toggle-side">' + (UI.layout.sideHidden ? 'Show notes' : 'Hide notes') + '</button>'
      : '';
    return '<header class="topbar">' +
      '<button class="btn small" data-act="toggle-nav" aria-label="Show or hide the menu" aria-pressed="' + (UI.layout.navHidden ? 'false' : 'true') + '">☰ Menu</button>' +
      '<a class="brand" href="#/start">Shimmy Specs</a>' +
      '<span class="proj">' + (p ? ui.esc(p.name) : '') + '</span>' +
      '<span id="syncPill" class="pill"></span>' + notes + '</header>';
  }

  function drawer() {
    var s = store.settings();
    return '<button class="gear" data-act="toggle-drawer" aria-label="Settings" title="Settings">⚙️</button>' +
      (UI.drawer ? '<div class="drawer" role="dialog" aria-label="Settings">' +
        '<h2>Settings</h2>' +
        '<label>Your name (for decisions) <input type="text" value="' + ui.esc(s.name) + '" data-chg="setting" data-set="name" /></label>' +
        '<label>Theme <select data-chg="setting" data-set="theme">' +
        ['auto', 'light', 'dark'].map(function (t) { return '<option value="' + t + '"' + (s.theme === t ? ' selected' : '') + '>' + t + '</option>'; }).join('') +
        '</select></label>' +
        '<label><input type="checkbox" data-chg="setting" data-set="showNotes"' + (s.showNotes ? ' checked' : '') + ' /> Show decision notes</label>' +
        '<label><input type="checkbox" data-chg="setting" data-set="showErrors"' + (s.showErrors ? ' checked' : '') + ' /> Show errors</label>' +
        '<h3>Database</h3>' +
        '<p class="muted">' + (SS.cloud.configured() ? 'Connection set in index.html.' : 'Not set up: the two values in index.html still have placeholders.') + '</p>' +
        '<p><button class="btn small" data-act="check-db"' + (SS.cloud.configured() ? '' : ' disabled') + '>Check database</button></p>' +
        (UI.dbMessage ? '<p class="hint">' + ui.esc(UI.dbMessage) + '</p>' : '') +
        '<p class="muted">Projects also stay on this device.</p>' +
        '<button class="btn" data-act="toggle-drawer">Close</button></div>' : '');
  }

  function ensureCloudList() {
    if (!SS.cloud.configured() || !SS.cloud.session() || UI.cloudList !== null || UI.cloudLoading) return;
    UI.cloudLoading = true;
    SS.cloud.list().then(function (rows) {
      UI.cloudList = rows || [];
      UI.cloudError = '';
    }).catch(function (err) {
      UI.cloudList = [];
      UI.cloudError = err.message;
      SS.errors.log(err);
    }).then(function () {
      UI.cloudLoading = false;
      render();
    });
  }

  function render() {
    if (!doc) return;
    var r = route();
    var main;
    var screens = SS.screens;
    if (!store.data) main = '<p>Loading data…</p>';
    else if (r.name === 'section') main = screens.section(r.arg, UI);
    else if (r.name === 'flags') main = screens.flags(UI);
    else if (r.name === 'decisions') main = screens.decisions(UI);
    else if (typeof screens[r.name] === 'function') main = screens[r.name](UI);
    else main = '<h1>Not found</h1><p><a href="#/start">Start</a></p>';
    var layoutClass = 'layout' + (UI.layout.navHidden ? ' nav-hidden' : '');
    doc.getElementById('app').innerHTML = topbar(r) +
      '<div class="' + layoutClass + '" style="--side-w:' + UI.layout.sideWidth + 'px">' +
      nav(r.name) + '<main class="main">' + main + '</main></div>' + drawer();
    doc.documentElement.dataset.theme = store.settings().theme === 'auto' ? '' : store.settings().theme;
    refreshStatus();
    renderErrors();
    if (r.name === 'start') ensureCloudList();
  }

  // ---- files ----------------------------------------------------------------
  function readFile(file) {
    return file.text().then(function (txt) {
      var obj = JSON.parse(txt);
      if (obj && obj.format === 'shimmy-state/1') {
        store.restoreState(obj);
      } else {
        if (!store.current) store.create(obj.name || 'Imported project', obj.kind || 'sketch');
        SS.importer.applyFile(store.current, obj, store.data);
        store.touch();
      }
      root.location.hash = '#/import';
    });
  }

  function downloadText(name, text, mime) {
    var blob = new Blob([text], { type: mime || 'text/plain' });
    var a = doc.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    doc.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }

  function outputText(type) {
    var s = store.settings();
    var p = store.current, d = store.data;
    if (type === 'ppd') return SS.outputs.ppd(p, d, s.showNotes);
    if (type === 'outline') return SS.outputs.outline(p, d, s.showNotes);
    return SS.outputs.full(p, d, s.showNotes);
  }

  // ---- actions --------------------------------------------------------------
  var handlers = {
    'new-project': function () {
      var name = (doc.getElementById('newName').value || '').trim() || 'Untitled sketch';
      store.create(name, doc.getElementById('newKind').value);
      root.location.hash = '#/import';
    },
    'load-sample': function () {
      var sample = JSON.parse(JSON.stringify(store.data.sample));
      store.create(sample.name, 'sketch');
      SS.importer.applyFile(store.current, sample, store.data);
      store.readDump(sample.text_dump || '');
      store.touch();
      root.location.hash = '#/survey';
    },
    'open-project': function (el) {
      store.open(el.dataset.id);
      root.location.hash = '#/survey';
    },
    'export-state': function () {
      downloadText((store.current.name || 'project').replace(/\W+/g, '-') + '.shimmy.json', store.exportState(), 'application/json');
    },
    'read-dump': function () { store.readDump(doc.getElementById('dump').value); },
    'hit-accept': function (el) { store.setHitStatus(Number(el.dataset.idx), 'accepted'); },
    'hit-reject': function (el) { store.setHitStatus(Number(el.dataset.idx), 'rejected'); },
    'sec-accept': function (el) { store.setSection(el.dataset.num, 'accepted', ''); },
    'sec-reject': function (el) {
      var why = root.prompt('Why is this section not needed? (kept on the record)', '');
      if (why === null) return;
      store.setSection(el.dataset.num, 'rejected', why);
    },
    'sec-reset': function (el) { store.setSection(el.dataset.num, 'reset', ''); },
    'sec-add': function () {
      var num = doc.getElementById('addSec').value;
      if (num) store.setSection(num, 'added', 'added by hand');
    },
    'focus': function (el) {
      UI.focus = { num: el.dataset.num, qid: el.dataset.q };
      render();
    },
    'edit-para': function (el) { UI.editing = el.dataset.key; render(); },
    'cancel-edit': function () { UI.editing = null; render(); },
    'save-para': function (el) {
      var num = route().arg;
      store.setEdit(num, el.dataset.key, doc.getElementById('edit-' + el.dataset.key).value);
      UI.editing = null;
    },
    'revert-para': function (el) {
      store.revertEdit(route().arg, el.dataset.key);
      UI.editing = null;
    },
    'take-new': function (el) {
      var f = store.current.flags.find(function (x) { return x.id === el.dataset.id; });
      if (!f) return;
      store.revertEdit(f.section, String(f.key).split('|')[2]);
      store.resolveFlag(f.id, 'done', 'Took the new generated text');
    },
    'keep-edit': function (el) { store.resolveFlag(el.dataset.id, 'dismissed', 'Kept the hand edit'); },
    'flag-done': function (el) { store.resolveFlag(el.dataset.id, 'done', ''); },
    'flag-dismiss': function (el) {
      var note = root.prompt('Why dismiss this flag? (kept on the record)', '');
      if (note === null) return;
      store.resolveFlag(el.dataset.id, 'dismissed', note);
    },
    'export-decisions': function () {
      downloadText((store.current.name || 'project').replace(/\W+/g, '-') + '.decisions.json',
        JSON.stringify(store.current.decisions || [], null, 2), 'application/json');
    },
    'download-output': function (el) {
      var text = outputText(el.dataset.type);
      var name = (store.current.name || 'project').replace(/\W+/g, '-') + '.' + el.dataset.type + '.' + el.dataset.ext;
      downloadText(name, el.dataset.ext === 'md' ? '# ' + el.dataset.type + '\n\n```\n' + text + '\n```\n' : text, 'text/plain');
    },
    'copy-output': function (el) {
      if (root.navigator && root.navigator.clipboard) {
        root.navigator.clipboard.writeText(outputText(el.dataset.type)).catch(function (e) { SS.errors.log(e); });
      }
    },
    'toggle-drawer': function () { UI.drawer = !UI.drawer; render(); },
    'clear-errors': function () { errorLog = []; renderErrors(); },

    // layout: minimize, resize, reorder
    'toggle-nav': function () { UI.layout.navHidden = !UI.layout.navHidden; saveLayout(); },
    'toggle-side': function () { UI.layout.sideHidden = !UI.layout.sideHidden; saveLayout(); },
    'side-move': function (el) {
      var order = UI.layout.sideOrder.slice();
      var i = order.indexOf(el.dataset.key);
      var j = i + Number(el.dataset.dir);
      if (i < 0 || j < 0 || j >= order.length) return;
      order.splice(j, 0, order.splice(i, 1)[0]);
      UI.layout.sideOrder = order;
      saveLayout();
    },

    // accounts and cloud projects
    'sign-in': function () {
      var user = doc.getElementById('authUser').value;
      var pass = doc.getElementById('authPass').value;
      UI.authError = '';
      return SS.cloud.signIn(user, pass).then(function () {
        UI.cloudList = null;
        if (store.current) return SS.cloud.saveNow(store.current).catch(function (err) { SS.errors.log(err); });
      }).catch(function (err) {
        UI.authError = err.message;
        SS.errors.log(err);
      });
    },
    'sign-out': function () {
      return SS.cloud.signOut().then(function () { UI.cloudList = null; UI.authError = ''; });
    },
    'cloud-open': function (el) {
      return SS.cloud.load(el.dataset.id).then(function (state) {
        if (!state) throw new Error('That project was not found on the account.');
        state.cloudId = el.dataset.id;
        store.current = state;
        store.saveNow();
        root.location.hash = '#/survey';
      }).catch(function (err) { SS.errors.log(err); UI.cloudError = err.message; });
    },
    'cloud-delete': function (el) {
      if (!root.confirm('Delete this project from the account? Copies on this device stay.')) return;
      return SS.cloud.remove(el.dataset.id).then(function () { UI.cloudList = null; })
        .catch(function (err) { SS.errors.log(err); UI.cloudError = err.message; });
    },
    'cloud-save-now': function () {
      if (store.current) return SS.cloud.saveNow(store.current).catch(function (err) { SS.errors.log(err); });
    },
    'check-db': function () {
      UI.dbMessage = 'Checking…';
      return SS.cloud.health().then(function (msg) { UI.dbMessage = msg; })
        .catch(function (err) { UI.dbMessage = 'Not reachable: ' + err.message; SS.errors.log(err); });
    }
  };

  // Clicks. A handler that returns a promise is re-drawn when it settles.
  doc && doc.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-act]');
    if (!el || !handlers[el.dataset.act]) return;
    e.preventDefault();
    var act = el.dataset.act;
    var result;
    try { result = handlers[act](el, e); }
    catch (err) { SS.errors.log(err); }
    if (result && typeof result.then === 'function') {
      result.then(render, function (err) { SS.errors.log(err); render(); });
      return;
    }
    if (act !== 'focus' && act !== 'edit-para') {
      if (store.current) store.save();
      render();
    }
  });

  function onChange(e) {
    var el = e.target;
    var kind = el.dataset && el.dataset.chg;
    if (!kind) return;
    try {
      if (kind === 'survey') {
        var qid = el.dataset.q;
        var value = el.dataset.type === 'many'
          ? Array.from(doc.querySelectorAll('input[name="' + qid + '"]:checked')).map(function (x) { return x.value; })
          : el.value;
        store.setSurvey(qid, value);
      } else if (kind === 'choice') {
        var reason = (doc.getElementById('reason-' + el.dataset.q) || {}).value || '';
        store.setChoice(el.dataset.num, el.dataset.q, el.value, reason.trim());
        UI.focus = { num: el.dataset.num, qid: el.dataset.q };
      } else if (kind === 'keynotes') {
        store.setKeynotes(el.value);
      } else if (kind === 'import-file') {
        var f = el.files && el.files[0];
        if (f) return readFile(f).then(render, function (err) { SS.errors.log(err); render(); });
      } else if (kind === 'setting') {
        store.setSetting(el.dataset.set, el.type === 'checkbox' ? el.checked : el.value);
      } else if (kind === 'filter-flags') {
        UI.flagFilter = el.value;
      } else if (kind === 'filter-dec-section') {
        UI.decSection = el.value.trim();
      } else if (kind === 'filter-dec-kind') {
        UI.decKind = el.value;
      }
    } catch (err) { SS.errors.log(err); }
    if (store.current) store.save();
    render();
  }
  doc && doc.addEventListener('change', onChange);

  // Splitter: drag (mouse or finger) to resize the notes panel.
  var drag = null;
  doc && doc.addEventListener('pointerdown', function (e) {
    var el = e.target.closest && e.target.closest('[data-splitter]');
    if (!el) return;
    drag = { x: e.clientX, w: UI.layout.sideWidth };
    e.preventDefault();
  });
  doc && doc.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var w = Math.round(drag.w - (e.clientX - drag.x));
    UI.layout.sideWidth = Math.max(240, Math.min(w, Math.round(root.innerWidth * 0.7)));
    var layout = doc.querySelector('.layout');
    if (layout) layout.style.setProperty('--side-w', UI.layout.sideWidth + 'px');
  });
  function endDrag() { if (drag) { drag = null; saveLayout(); } }
  doc && doc.addEventListener('pointerup', endDrag);
  doc && doc.addEventListener('pointercancel', endDrag);

  // ---- boot -----------------------------------------------------------------
  function boot() {
    renderErrors();
    SS.data.load().then(function (data) {
      store.data = data;
      store.resume();
      render();
      root.addEventListener('hashchange', function () { UI.editing = null; render(); });
      root.addEventListener('online', refreshStatus);
      root.addEventListener('offline', refreshStatus);
      root.addEventListener('beforeunload', function () { if (store.current) store.saveNow(); });
    }).catch(function (err) {
      SS.errors.log(err);
      render();
    });
  }

  if (doc) {
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
    else boot();
  }
})(typeof window !== 'undefined' ? window : globalThis);
