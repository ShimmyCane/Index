// Shimmy Specs — shell: boot, router, navigation, ⚙️ drawer, error panel, and event wiring.
(function (root) {
  'use strict';
  var SS = root.SS = root.SS || {};
  var doc = root.document;
  var ui = SS.ui = SS.ui || {};
  var store = SS.store;
  var UI = { focus: null, editing: null, flagFilter: 'open', decSection: '', decKind: '', drawer: false };

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
    var show = store.settings().showErrors;
    panel.hidden = !show;
    panel.innerHTML = '<strong>Errors</strong> <button class="btn small" data-act="clear-errors">Clear</button>' +
      (errorLog.length ? '<ul>' + errorLog.map(function (e) { return '<li>' + e.at + ' ' + ui.esc(e.msg) + '</li>'; }).join('') + '</ul>' : '<p class="muted">None.</p>');
  }

  root.addEventListener('error', function (e) { SS.errors.log(e.error || e.message); });
  root.addEventListener('unhandledrejection', function (e) { SS.errors.log(e.reason || 'Unhandled promise rejection'); });

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
        return '<a class="book ' + ui.divClass(s.number) + '" href="#/section/' + ui.esc(s.number) + '"' +
          (current === 'section' && UI.focus && UI.focus.num === s.number ? ' class="on"' : '') + '>' + ui.esc(s.number) + ' ' + ui.esc((SS.recommend.sectionEntry(store.data, s.number) || {}).title || '') + '</a>';
      }).join('') : '') + '</nav>';
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
        '<p class="muted">Data is kept in this browser. Export a project from Start.</p>' +
        '<button class="btn" data-act="toggle-drawer">Close</button></div>' : '');
  }

  function render() {
    if (!doc) return;
    var r = route();
    var main;
    var side = '';
    var screens = SS.screens;
    if (!store.data) { main = '<p>Loading data…</p>'; }
    else if (r.name === 'section') { main = screens.section(r.arg, UI); }
    else if (screens[r.name] && typeof screens[r.name] === 'function') {
      main = (r.name === 'flags') ? screens.flags(UI) : (r.name === 'decisions') ? screens.decisions(UI) : screens[r.name]();
    } else { main = '<h1>Not found</h1><p><a href="#/start">Start</a></p>'; }
    var root2 = doc.getElementById('app');
    root2.innerHTML = '<div class="layout">' + nav(r.name) + '<main class="main">' + main + '</main></div>' + drawer();
    doc.documentElement.dataset.theme = store.settings().theme === 'auto' ? '' : store.settings().theme;
    renderErrors();
  }

  // ---- actions --------------------------------------------------------------
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
      render();
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

  var handlers = {
    'new-project': function () {
      var name = (doc.getElementById('newName').value || '').trim() || 'Untitled sketch';
      var kind = doc.getElementById('newKind').value;
      store.create(name, kind);
      root.location.hash = '#/import';
    },
    'load-sample': function () {
      var sample = JSON.parse(JSON.stringify(store.data.sample));
      store.create(sample.name, 'sketch');
      SS.importer.applyFile(store.current, sample, store.data);
      store.current.textDump = sample.text_dump || '';
      store.readDump(store.current.textDump);
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
    'read-dump': function () {
      store.readDump(doc.getElementById('dump').value);
    },
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
      var text = doc.getElementById('edit-' + el.dataset.key).value;
      store.setEdit(num, el.dataset.key, text);
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
    'keep-edit': function (el) {
      store.resolveFlag(el.dataset.id, 'dismissed', 'Kept the hand edit');
    },
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
      var text = outputText(el.dataset.type);
      if (root.navigator && root.navigator.clipboard) {
        root.navigator.clipboard.writeText(text).catch(function (e) { SS.errors.log(e); });
      }
    },
    'toggle-drawer': function () { UI.drawer = !UI.drawer; render(); },
    'clear-errors': function () { errorLog = []; renderErrors(); }
  };

  function outputText(type) {
    var s = store.settings();
    var p = store.current, d = store.data;
    if (type === 'ppd') return SS.outputs.ppd(p, d, s.showNotes);
    if (type === 'outline') return SS.outputs.outline(p, d, s.showNotes);
    return SS.outputs.full(p, d, s.showNotes);
  }

  doc && doc.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-act]');
    if (!el || !handlers[el.dataset.act]) return;
    e.preventDefault();
    try { handlers[el.dataset.act](el, e); }
    catch (err) { SS.errors.log(err); }
    if (el.dataset.act !== 'focus' && el.dataset.act !== 'edit-para') {
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
        var value;
        if (el.dataset.type === 'many') {
          value = Array.from(doc.querySelectorAll('input[name="' + qid + '"]:checked')).map(function (x) { return x.value; });
        } else {
          value = el.value;
        }
        store.setSurvey(qid, value);
      } else if (kind === 'choice') {
        var reason = (doc.getElementById('reason-' + el.dataset.q) || {}).value || '';
        store.setChoice(el.dataset.num, el.dataset.q, el.value, reason.trim());
        UI.focus = { num: el.dataset.num, qid: el.dataset.q };
      } else if (kind === 'keynotes') {
        store.setKeynotes(el.value);
      } else if (kind === 'import-file') {
        var f = el.files && el.files[0];
        if (f) return readFile(f);
      } else if (kind === 'setting') {
        var key = el.dataset.set;
        var val = el.type === 'checkbox' ? el.checked : el.value;
        store.setSetting(key, val);
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

  // ---- boot -----------------------------------------------------------------
  function boot() {
    renderErrors();
    SS.data.load().then(function (data) {
      store.data = data;
      store.resume();
      render();
      root.addEventListener('hashchange', function () { UI.editing = null; render(); });
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
  SS.app = { render: render, UI: UI };
})(typeof window !== 'undefined' ? window : globalThis);
