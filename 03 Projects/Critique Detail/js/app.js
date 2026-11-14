/* Critique Detail viewer. Classic script, no build. Opens from file:// and from GitHub Pages.
   Data, in order: database (owner signed in) -> this device's cache -> the bundled sample. */
(function () {
  'use strict';
  var CFG = window.DC_CONFIG, SAMPLE = window.DC_SAMPLE;
  var SEV = ['CRITICAL', 'MAJOR', 'ADVISORY'];
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function load(key, fallback) { try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; } }
  function store(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage blocked or full */ } }

  // ---------- state
  var DEFAULTS = { boxes: 1, sheet: 'clean', showErrors: false };
  var settings = Object.assign({}, DEFAULTS, load('dc.settings', {}));
  var statuses = load('dc.status', {});            // "<slug>#<n>" -> open | accepted | dismissed
  var errors = [];
  var session = null;                              // { token, email }; kept in memory only
  var entries = [];                                // { id, source, report, image, markup, reviewId }
  var current = null, selected = null, filter = 'ALL';

  function logError(msg) { errors.push(new Date().toLocaleTimeString() + '  ' + msg); renderErrors(); }
  function renderErrors() {
    var box = $('errorsPanel');
    box.hidden = !settings.showErrors;
    box.textContent = errors.length ? errors.join('\n') : 'No problems so far.';
  }
  window.addEventListener('error', function (e) { logError(e.message); });
  window.addEventListener('unhandledrejection', function (e) { logError(String(e.reason && e.reason.message || e.reason)); });

  // ---------- collapsible panels (project_track.md)
  (function () {
    var saved = load('dc.panels', {});
    function apply(section, open) {
      section.dataset.collapsed = String(!open);
      section.querySelector('.panelHead').setAttribute('aria-expanded', String(open));
    }
    document.querySelectorAll('.panel').forEach(function (section) {
      var id = section.dataset.panel;
      var open = id in saved ? saved[id] : section.dataset.open !== 'false';
      apply(section, open);
      section.querySelector('.panelHead').addEventListener('click', function () {
        open = section.dataset.collapsed === 'true';
        apply(section, open); saved[id] = open; store('dc.panels', saved);
      });
    });
  })();

  // ---------- entries
  function addEntry(entry) {
    entries = entries.filter(function (e) { return e.id !== entry.id; });
    entries.push(entry);
  }
  function seedEntries() {
    entries = [];
    addEntry({ id: 'sample', source: 'sample', report: SAMPLE.report, image: SAMPLE.image, markup: SAMPLE.report.markup });
    load('dc.cache', []).forEach(function (c) {
      addEntry({ id: 'db:' + c.slug, source: 'cache', report: c.report, image: '', markup: '', reviewId: c.reviewId });
    });
  }

  // ---------- render
  function renderList() {
    var ul = $('detailList'); ul.textContent = '';
    var label = { sample: 'bundled sample', cache: 'saved copy, no image', database: 'database', file: 'opened file' };
    entries.forEach(function (e) {
      var li = el('li'), b = el('button', 'pick' + (current && e.id === current.id ? ' on' : ''));
      var c = e.report.counts || {};
      b.type = 'button';
      b.textContent = e.report.detail.title + '\n' + label[e.source] + ' · ' + (c.CRITICAL || 0) + ' critical, ' + (c.MAJOR || 0) + ' major, ' + (c.ADVISORY || 0) + ' advisory';
      b.addEventListener('click', function () { show(e.id); });
      li.appendChild(b); ul.appendChild(li);
    });
  }

  function statusOf(f) { return statuses[current.report.detail.slug + '#' + f.n] || f.status || 'open'; }

  function renderSheet() {
    var r = current.report, img = $('sheetImg');
    var src = settings.sheet === 'markup' && current.markup ? current.markup : current.image;
    $('sheetTitle').textContent = r.detail.title;
    $('sheet').hidden = !src;
    if (src && img.getAttribute('src') !== src) img.src = src;
    $('mockBanner').hidden = !/^mock/.test(r.mode || '');
    $('sheetMeta').textContent = (src ? '' : 'No image on this device for this detail. Sign in to load it. ') +
      r.detail.input + ' · ' + r.detail.width + ' × ' + r.detail.height + ' px · ' + r.mode + ' · ' + new Date(r.run_at).toLocaleString();
    var svg = $('overlay'), bubbles = $('bubbles');
    svg.textContent = ''; bubbles.textContent = '';
    if (!settings.boxes || settings.sheet === 'markup' || !src) return;
    var sheet = $('sheet'), placed = [];
    var gapX = 38 / (sheet.clientWidth || 800) * 100, gapY = 38 / (sheet.clientHeight || 600) * 100;
    r.findings.forEach(function (f) {
      if (!f.box_2d || statusOf(f) === 'dismissed') return;
      var b = f.box_2d, rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', b[1]); rect.setAttribute('y', b[0]);
      rect.setAttribute('width', b[3] - b[1]); rect.setAttribute('height', b[2] - b[0]); rect.setAttribute('rx', 6);
      if (selected === f.n) rect.setAttribute('class', 'on');
      svg.appendChild(rect);
      var dot = el('button', 'bubble' + (selected === f.n ? ' on' : ''), String(f.n));
      dot.type = 'button'; dot.setAttribute('aria-label', 'Finding ' + f.n + ': ' + f.title);
      // number sits on the box's top-left corner; slide right along the top edge if another number is already there
      var x = Math.max(gapX / 2, b[1] / 10), y = Math.max(gapY / 2, b[0] / 10);
      while (placed.some(function (q) { return Math.abs(q[0] - x) < gapX && Math.abs(q[1] - y) < gapY; })) x += gapX;
      placed.push([x, y]);
      dot.style.left = x + '%'; dot.style.top = y + '%';
      dot.addEventListener('click', function () { select(f.n, true); });
      bubbles.appendChild(dot);
    });
  }

  function renderFindings() {
    var r = current.report, c = r.counts || {}, box = $('findingList');
    $('counts').textContent = '· ' + (c.CRITICAL || 0) + ' critical · ' + (c.MAJOR || 0) + ' major · ' + (c.ADVISORY || 0) + ' advisory';
    $('summary').textContent = r.summary;
    document.querySelectorAll('#sevFilter button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === filter); });
    box.textContent = '';
    var rows = r.findings.filter(function (f) { return filter === 'ALL' || f.severity === filter; });
    if (!rows.length) box.appendChild(el('p', 'meta', 'No findings at this level.'));
    rows.forEach(function (f) {
      var st = statusOf(f), card = el('article', 'finding ' + f.severity + (selected === f.n ? ' on' : '') + (st === 'dismissed' ? ' dismissed' : ''));
      card.id = 'finding-' + f.n;
      var h = el('h3');
      h.appendChild(el('span', 'num', String(f.n)));
      h.appendChild(el('span', 'sev ' + f.severity, f.severity));
      h.appendChild(el('span', '', f.title));
      h.appendChild(el('code', '', f.checklist_id));
      card.appendChild(h);
      card.appendChild(el('p', '', f.issue));
      var fix = el('p'); fix.appendChild(el('b', '', 'Fix: ')); fix.appendChild(document.createTextNode(f.recommendation)); card.appendChild(fix);
      if (f.references && f.references.length) {
        card.appendChild(el('p', 'meta', 'See: ' + f.references.map(function (x) { return x.id + ' ' + x.title; }).join('; ')));
      }
      if (!f.box_2d) card.appendChild(el('p', 'meta', 'No location on the drawing.'));
      var seg = el('div', 'seg small');
      [['open', 'Open'], ['accepted', 'Accepted'], ['dismissed', 'Dismissed']].forEach(function (o) {
        var b = el('button', st === o[0] ? 'on' : '', o[1]); b.type = 'button';
        b.addEventListener('click', function (ev) { ev.stopPropagation(); setStatus(f, o[0]); });
        seg.appendChild(b);
      });
      card.appendChild(seg);
      card.addEventListener('click', function () { select(f.n, false); });
      box.appendChild(card);
    });
  }

  function renderSteps() {
    var r = current.report, c = r.completeness, ol = $('steps'); ol.textContent = '';
    var yn = function (v) { return v ? 'yes' : 'no'; };
    var ctx = r.context || {};
    [
      'Completeness: scale shown ' + yn(c.scale_shown) + ', materials labelled ' + yn(c.materials_labelled) + ', geometry clear ' + yn(c.geometry_clear) + '.' +
        (c.missing.length ? ' Missing: ' + c.missing.join('; ') + '.' : '') + (r.warnings.length ? ' Warnings: ' + r.warnings.join(' ') : ''),
      'Context: ' + [ctx.project, ctx.building_code, ctx.energy_code, ctx.ashrae_climate_zone && 'climate zone ' + ctx.ashrae_climate_zone].filter(Boolean).join(', ') +
        '. ' + (ctx.mandates || []).length + ' mandates and ' + (r.lessons || []).length + ' lessons were given to the review.',
      'Audit: one pass against rulebook ' + r.schema.key + (r.schema.generated ? ' (new, written this run)' : '') + '. Mode: ' + r.mode + '.',
      'Priorities: ' + SEV.map(function (s) { return (r.counts[s] || 0) + ' ' + s.toLowerCase(); }).join(', ') + '.',
      'Output: report ' + r.detail.slug + '.json and .md, redline ' + r.markup + '.'
    ].forEach(function (t) { ol.appendChild(el('li', '', t)); });
  }

  function renderChecklist() {
    var r = current.report, t = $('checkTable'), res = {};
    (r.checklist_results || []).forEach(function (x) { res[x.id] = x; });
    $('checkTitle').textContent = 'Rulebook: ' + r.schema.title + ' (division ' + r.schema.csi_division + ')';
    t.textContent = '';
    var head = el('tr'); ['Item', 'A correct detail shows', 'Result'].forEach(function (h) { head.appendChild(el('th', '', h)); }); t.appendChild(head);
    var words = { pass: '✓ pass', fail: '✗ fail', not_shown: '? not shown' };
    r.schema.checklist.forEach(function (c) {
      var tr = el('tr'), x = res[c.id] || { status: 'not_shown', note: '' };
      var a = el('td'); a.appendChild(el('code', '', c.id)); a.appendChild(document.createElement('br')); a.appendChild(el('span', 'sev ' + c.default_severity, c.default_severity));
      var b = el('td', '', c.item); b.appendChild(el('div', 'meta', c.why));
      var d = el('td'); d.appendChild(el('span', 'res ' + x.status, words[x.status] || x.status)); d.appendChild(el('div', 'meta', x.note));
      tr.appendChild(a); tr.appendChild(b); tr.appendChild(d); t.appendChild(tr);
    });
  }

  function renderRulebooks() {
    var box = $('rulebookList'); box.textContent = '';
    SAMPLE.schemas.forEach(function (s) {
      var d = el('details'); d.appendChild(el('summary', '', 'Division ' + s.csi_division + ' · ' + s.title + ' (' + s.source + ')'));
      var ol = el('ol'); s.checklist.forEach(function (c) { ol.appendChild(el('li', '', c.id + ' [' + c.default_severity + '] ' + c.item)); });
      d.appendChild(ol); box.appendChild(d);
    });
    var d = el('details'); d.appendChild(el('summary', '', 'Lessons learned (' + SAMPLE.lessons.length + ')'));
    var ul = el('ul'); SAMPLE.lessons.forEach(function (l) { ul.appendChild(el('li', '', l.id + ' · ' + l.category + ' · ' + l.text)); });
    d.appendChild(ul); box.appendChild(d);
  }

  function renderAll() { renderList(); renderSheet(); renderFindings(); renderSteps(); renderChecklist(); renderNotesWhere(); }

  function show(id) {
    current = entries.filter(function (e) { return e.id === id; })[0] || entries[0];
    selected = null; store('dc.last', current.id);
    renderAll();
    if (current.source === 'database' && !current.image) loadImages(current);
  }
  function select(n, scroll) {
    selected = selected === n ? null : n;
    renderSheet(); renderFindings(); renderNotesWhere();
    var card = $('finding-' + n);
    if (scroll && selected && card) card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function setStatus(f, status) {
    statuses[current.report.detail.slug + '#' + f.n] = status; store('dc.status', statuses);
    renderSheet(); renderFindings();
    if (session && current.reviewId) {
      api('PATCH', '/rest/v1/dc_findings?review_id=eq.' + current.reviewId + '&n=eq.' + f.n, { status: status })
        .catch(function (e) { logError('Could not save the status: ' + e.message); setPill('⚠️ check'); });
    }
  }
  document.querySelectorAll('#sevFilter button').forEach(function (b) {
    b.addEventListener('click', function () { filter = b.dataset.v; renderFindings(); });
  });

  // ---------- open a local report
  var pending = { report: null, image: null };
  function tryOpenLocal() {
    if (!pending.report) return;
    addEntry({ id: 'file:' + pending.report.detail.slug, source: 'file', report: pending.report, image: pending.image || '', markup: '' });
    show('file:' + pending.report.detail.slug);
  }
  $('openReport').addEventListener('change', function (ev) {
    var file = ev.target.files[0]; if (!file) return;
    file.text().then(function (text) {
      var r = JSON.parse(text);
      if (!r.detail || !r.findings || !r.schema) throw new Error('This file is not a Critique Detail report.');
      pending.report = r; tryOpenLocal();
    }).catch(function (e) { logError('Could not open the report: ' + e.message); alert('Could not open that report. ' + e.message); });
  });
  $('openImage').addEventListener('change', function (ev) {
    var file = ev.target.files[0]; if (!file) return;
    pending.image = URL.createObjectURL(file); tryOpenLocal();
  });

  // ---------- database (owner sign-in; publishable key only)
  function setPill(text) { $('statusPill').textContent = text; }
  function api(method, path, body, token) {
    var headers = { apikey: CFG.key, Authorization: 'Bearer ' + (token || (session && session.token) || CFG.key) };
    if (body) headers['Content-Type'] = 'application/json';
    return fetch(CFG.url + path, { method: method, headers: headers, body: body ? JSON.stringify(body) : undefined }).then(function (res) {
      return res.text().then(function (text) {
        var data = null; try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
        if (!res.ok) throw new Error((data && (data.msg || data.message || data.error_description)) || ('HTTP ' + res.status));
        return data;
      });
    });
  }
  function renderDb() {
    $('signInBox').hidden = !!session; $('dbSignOut').hidden = !session;
    $('dbStatus').textContent = session ? 'Signed in as ' + session.email + '.' : 'This device only. Sign in to load details from the database.';
  }
  function signIn() {
    var email = $('dbEmail').value.trim(), password = $('dbPassword').value;
    if (!email || !password) return;
    $('dbStatus').textContent = 'Signing in…';
    api('POST', '/auth/v1/token?grant_type=password', { email: email, password: password }).then(function (d) {
      session = { token: d.access_token, email: email }; $('dbPassword').value = '';
      renderDb(); return loadFromDb();
    }).catch(function (e) {
      session = null; renderDb(); $('dbStatus').textContent = 'Sign-in did not work: ' + e.message;
      logError('Sign-in: ' + e.message);
    });
  }
  function loadFromDb() {
    return api('GET', '/rest/v1/dc_details?select=slug,image_path,dc_reviews(id,run_at,markup_path,report)&order=created_at.desc').then(function (rows) {
      var cache = [];
      rows.forEach(function (d) {
        var reviews = (d.dc_reviews || []).sort(function (a, b) { return a.run_at < b.run_at ? 1 : -1; });
        if (!reviews.length) return;
        var rv = reviews[0];
        addEntry({ id: 'db:' + d.slug, source: 'database', report: rv.report, image: '', markup: '', reviewId: rv.id, imagePath: d.image_path, markupPath: rv.markup_path });
        cache.push({ slug: d.slug, reviewId: rv.id, report: rv.report });
      });
      store('dc.cache', cache);
      setPill('☁️ database');
      $('dbStatus').textContent = 'Signed in as ' + session.email + '. ' + cache.length + ' detail(s) in the database.' +
        (rows.length ? '' : ' An empty list can also mean this account is not the owner (row-level security).');
      renderList();
      if (cache.length) show('db:' + cache[0].slug);
    }).catch(function (e) { setPill('⚠️ check'); logError('Database: ' + e.message); $('dbStatus').textContent = 'Could not read the database: ' + e.message; });
  }
  function fetchBlob(path) {
    if (!path) return Promise.resolve('');
    return fetch(CFG.url + '/storage/v1/object/authenticated/' + CFG.bucket + '/' + path, { headers: { apikey: CFG.key, Authorization: 'Bearer ' + session.token } })
      .then(function (res) { if (!res.ok) throw new Error('image HTTP ' + res.status); return res.blob(); })
      .then(function (b) { return URL.createObjectURL(b); });
  }
  function loadImages(entry) {
    Promise.all([fetchBlob(entry.imagePath), fetchBlob(entry.markupPath)]).then(function (urls) {
      entry.image = urls[0]; entry.markup = urls[1];
      if (current === entry) renderSheet();
    }).catch(function (e) { logError('Could not load the image: ' + e.message); });
  }
  function checkDatabase() {
    var out = $('dbCheckOut');
    if (!session) { out.textContent = 'This device only. Sign in to check the tables.'; return; }
    out.textContent = 'Checking…';
    Promise.all(CFG.tables.map(function (t) {
      return api('GET', '/rest/v1/' + t + '?select=*&limit=1')
        .then(function (rows) { return '✅ ' + t + (rows.length ? '' : ' (no rows visible; empty, or row-level security)'); })
        .catch(function (e) { return '❌ ' + t + ': ' + e.message; });
    })).then(function (lines) {
      out.textContent = lines.join('\n');
      if (lines.some(function (l) { return l.charAt(0) === '❌'; })) { setPill('⚠️ check'); lines.forEach(function (l) { if (l.charAt(0) === '❌') logError(l); }); }
    });
  }
  $('dbSignIn').addEventListener('click', signIn);
  $('dbCheck').addEventListener('click', checkDatabase);
  $('dbSignOut').addEventListener('click', function () { session = null; setPill('💾 this device'); renderDb(); seedEntries(); show('sample'); });

  // ---------- notes for improvement (feedback_notes.md): device first, database when signed in
  var notes = load('dc.notes', []);
  function noteWhere() {
    var r = current.report, f = selected && r.findings.filter(function (x) { return x.n === selected; })[0];
    return { page: 'index.html', item: r.detail.slug + (f ? '#' + f.n : ''), label: r.detail.title + (f ? ', finding ' + f.n : '') };
  }
  function renderNotesWhere() { if (current) $('noteWhere').textContent = 'About: ' + noteWhere().label; }
  function renderNotes() {
    var mode = $('noteFilter').value, list = $('noteList'); list.textContent = '';
    notes.filter(function (n) { return mode === 'all' || n.status === 'open'; })
      .sort(function (a, b) { return a.at < b.at ? 1 : -1; })
      .forEach(function (n) {
        list.appendChild(el('li', '', (n.status === 'done' ? '✅ ' : '📝 ') + (n.where && n.where.label ? n.where.label + ' · ' : '') + new Date(n.at).toLocaleString() + '\n' + n.text));
      });
  }
  $('noteSave').addEventListener('click', function () {
    var box = $('noteText'), text = box.value.trim(); if (!text) return;
    var n = { id: 'n-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7), at: new Date().toISOString(), status: 'open', text: text, where: noteWhere(), version: CFG.version };
    notes.push(n); box.value = ''; store('dc.notes', notes); renderNotes();
    if (session) {
      api('POST', '/rest/v1/dc_notes', { id: n.id, text: n.text, page: n.where.page, item: n.where.item, label: n.where.label, version: n.version, status: n.status, noted_at: n.at })
        .catch(function (e) { logError('Note kept on this device; the database refused it: ' + e.message); });
    }
  });
  $('noteFilter').addEventListener('change', renderNotes);
  $('noteCopy').addEventListener('click', function () {
    var out = JSON.stringify(notes, null, 2);
    if (navigator.clipboard) navigator.clipboard.writeText(out).catch(function () {}); else window.prompt('Copy the notes:', out);
  });

  // ---------- settings drawer (settings_gear.md)
  var gear = $('gear'), drawer = $('drawer');
  function setOpen(open) { drawer.hidden = !open; gear.setAttribute('aria-expanded', String(open)); }
  function renderSettings() {
    document.querySelectorAll('.seg[data-key]').forEach(function (seg) {
      var v = String(settings[seg.dataset.key]);
      seg.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === v); });
    });
    $('showErrors').checked = !!settings.showErrors; renderErrors();
  }
  gear.addEventListener('click', function () { setOpen(drawer.hidden); });
  $('closeDrawer').addEventListener('click', function () { setOpen(false); });
  $('statusPill').addEventListener('click', function () { setOpen(true); });
  document.querySelectorAll('.seg[data-key] button').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.dataset.v;
      settings[b.parentElement.dataset.key] = (v === '0' || v === '1') ? +v : v;
      store('dc.settings', settings); renderSettings(); renderSheet();
    });
  });
  $('showErrors').addEventListener('change', function (e) { settings.showErrors = e.target.checked; store('dc.settings', settings); renderErrors(); });

  $('sheetImg').addEventListener('load', function () { renderSheet(); });
  window.addEventListener('resize', function () { if (current) renderSheet(); });

  // ---------- start
  seedEntries();
  $('info').textContent = 'Critique Detail ' + CFG.version + ' · ' + SAMPLE.schemas.length + ' rulebooks · ' + SAMPLE.lessons.length + ' lessons';
  renderSettings(); renderDb(); renderRulebooks(); renderNotes();
  show(load('dc.last', 'sample'));
  window.DC = { state: function () { return { current: current.id, selected: selected, filter: filter, entries: entries.length, boxes: document.querySelectorAll('#overlay rect').length,
    cards: document.querySelectorAll('.finding').length, notes: notes.length, errors: errors.slice(), settings: settings }; } };
})();
