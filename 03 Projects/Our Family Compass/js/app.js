/* Our Family Compass: the palace map, room sheets, dated thoughts, settings and notes.
   Classic script, no build. All page text is set with textContent. */
(function () {
  'use strict';
  var APP_VERSION = '0.1.0';
  var CHANGELOG = ['0.1.0 (2026-11-17): the framework as a palace of nine rooms, dated thoughts, six panels, notes.'];
  var D = window.OFC;
  var K = { settings: 'ofc.settings', thoughts: 'ofc.thoughts', notes: 'ofc.notes', panels: 'ofc.panels' };
  var SVG = 'http://www.w3.org/2000/svg';

  /* ---------- small helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function svg(tag, attrs, text) {
    var n = document.createElementNS(SVG, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    return n;
  }
  function load(key, fallback) {
    try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; }
  }
  var storageOk = true;
  function store(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); storageOk = true; }
    catch (e) { storageOk = false; logError('Could not save on this device: ' + e.message); }
    renderStoreLine();
  }
  function newId(p) { return p + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7); }
  function when(iso) {
    var d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }
  function roomById(id) { for (var i = 0; i < D.rooms.length; i++) if (D.rooms[i].id === id) return D.rooms[i]; return null; }

  /* ---------- state ---------- */
  var DEFAULTS = { large: 0, motion: 1, showErrors: false, author: '' };
  var settings = Object.assign({}, DEFAULTS, load(K.settings, {}));
  var thoughts = load(K.thoughts, []);
  if (!Array.isArray(thoughts)) thoughts = [];
  var notes = load(K.notes, []);
  if (!Array.isArray(notes)) notes = [];
  var errors = [];
  var current = null;      // room on screen
  var about = '';          // question being answered
  var revises = '';        // id of the thought being changed

  /* ---------- errors (opt-in, at the bottom) ---------- */
  function logError(msg) { errors.push(new Date().toLocaleTimeString() + '  ' + msg); renderErrors(); }
  function renderErrors() {
    var box = $('errorsPanel');
    box.hidden = !settings.showErrors;
    box.textContent = errors.length ? errors.join('\n') : 'No problems so far.';
  }
  window.addEventListener('error', function (e) { logError(e.message); });

  /* ---------- the palace map ---------- */
  var PLACES = {
    sky:        { x: 40,  y: 16,  w: 720, h: 96,  rx: 44 },
    principles: { x: 290, y: 134, w: 220, h: 156, rx: 18 },
    workshop:   { x: 70,  y: 290, w: 244, h: 150, rx: 18 },
    library:    { x: 486, y: 290, w: 244, h: 150, rx: 18 },
    village:    { x: 290, y: 440, w: 220, h: 156, rx: 18 },
    gate:       { x: 70,  y: 476, w: 170, h: 120, rx: 18 },
    roots:      { x: 40,  y: 640, w: 350, h: 116, rx: 22 },
    foundation: { x: 410, y: 640, w: 350, h: 116, rx: 22 },
    courtyard:  { cx: 400, cy: 365, r: 88 }
  };
  var ORDER = ['sky', 'principles', 'workshop', 'library', 'village', 'gate', 'roots', 'foundation', 'courtyard'];

  function countFor(id) { return thoughts.filter(function (t) { return t.room === id; }).length; }

  function drawMap() {
    var root = svg('svg', { viewBox: '0 0 800 772', role: 'group', 'aria-label': 'Map of the palace' });
    root.appendChild(svg('text', { x: 46, y: 130, 'class': 'band' }, 'THE ROOMS · LEVEL 2'));
    root.appendChild(svg('text', { x: 46, y: 630, 'class': 'band' }, 'THE GROUND'));
    // a dotted path from the gate into the village, and garden marks in the corners
    root.appendChild(svg('path', { d: 'M240 536 H290', 'class': 'deco', 'stroke-dasharray': '2 9' }));
    [[600, 200], [640, 230], [570, 236], [610, 520], [660, 550], [580, 566], [170, 200], [210, 236], [140, 240]].forEach(function (p) {
      root.appendChild(svg('path', { d: 'M' + p[0] + ' ' + p[1] + ' q6 -14 12 0 M' + (p[0] + 6) + ' ' + p[1] + ' v-12', 'class': 'deco' }));
    });
    ORDER.forEach(function (id) {
      var r = roomById(id), p = PLACES[id];
      var g = svg('g', { 'class': 'room', 'data-room': id, tabindex: 0, role: 'button', 'aria-label': r.name + ', ' + r.sub });
      var cx, cy, bx, by;
      if (p.r) {
        cx = p.cx; cy = p.cy; bx = cx + 62; by = cy - 62;
        g.appendChild(svg('circle', { cx: cx + 5, cy: cy + 6, r: p.r, 'class': 'drop' }));
        g.appendChild(svg('circle', { cx: cx, cy: cy, r: p.r, 'class': 'shape', fill: r.color }));
        g.appendChild(svg('circle', { cx: cx, cy: cy - 14, r: 46, fill: '#fffdf7', stroke: '#2b2a33', 'stroke-width': 3 }));
        var needle = svg('g', { 'class': 'needle' });
        needle.appendChild(svg('circle', { cx: cx, cy: cy - 14, r: 42, fill: 'none' }));   // keeps the turning point at the centre
        needle.appendChild(svg('polygon', { points: cx + ',' + (cy - 54) + ' ' + (cx + 11) + ',' + (cy - 14) + ' ' + (cx - 11) + ',' + (cy - 14), fill: '#e8604c', stroke: '#2b2a33', 'stroke-width': 3, 'stroke-linejoin': 'round' }));
        needle.appendChild(svg('polygon', { points: cx + ',' + (cy + 26) + ' ' + (cx + 11) + ',' + (cy - 14) + ' ' + (cx - 11) + ',' + (cy - 14), fill: '#fff', stroke: '#2b2a33', 'stroke-width': 3, 'stroke-linejoin': 'round' }));
        g.appendChild(needle);
        g.appendChild(svg('circle', { cx: cx, cy: cy - 14, r: 5, fill: '#2b2a33' }));
        g.appendChild(svg('text', { x: cx, y: cy + 62, 'class': 'nm', style: 'font-size:24px' }, r.name));
      } else {
        cx = p.x + p.w / 2; cy = p.y + p.h / 2; bx = p.x + p.w - 8; by = p.y + 8;
        g.appendChild(svg('rect', { x: p.x + 5, y: p.y + 6, width: p.w, height: p.h, rx: p.rx, 'class': 'drop' }));
        g.appendChild(svg('rect', { x: p.x, y: p.y, width: p.w, height: p.h, rx: p.rx, 'class': 'shape', fill: r.color }));
        var wide = p.w > 300;     // sky and ground bands: icon to the left of the name
        var dy = id === 'principles' ? -12 : id === 'village' ? 12 : 0;   // keep clear of the courtyard
        if (wide) {
          g.appendChild(svg('text', { x: cx - 110, y: cy + 14, 'class': 'em' }, r.icon));
          g.appendChild(svg('text', { x: cx + 20, y: cy + 2, 'class': 'nm' }, r.name));
          g.appendChild(svg('text', { x: cx + 20, y: cy + 26, 'class': 'sb' }, r.sub));
        } else {
          g.appendChild(svg('text', { x: cx, y: cy - 14 + dy, 'class': 'em' }, r.icon));
          g.appendChild(svg('text', { x: cx, y: cy + 22 + dy, 'class': 'nm' }, r.name));
          g.appendChild(svg('text', { x: cx, y: cy + 44 + dy, 'class': 'sb' }, r.sub));
        }
      }
      var badge = svg('g', { 'class': 'badge', 'data-badge': id });
      badge.appendChild(svg('circle', { cx: bx, cy: by, r: 17 }));
      badge.appendChild(svg('text', { x: bx, y: by + 6 }, ''));
      g.appendChild(badge);
      g.addEventListener('click', function () { openRoom(id); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openRoom(id); } });
      root.appendChild(g);
    });
    $('map').appendChild(root);

    // the same rooms as buttons, for small screens and screen readers
    var row = $('roomRow');
    D.rooms.forEach(function (r) {
      var b = el('button', 'chip', r.icon + ' ' + r.name);
      b.type = 'button'; b.dataset.room = r.id;
      b.appendChild(el('b'));
      b.addEventListener('click', function () { openRoom(r.id); });
      row.appendChild(b);
    });
  }

  function renderCounts() {
    D.rooms.forEach(function (r) {
      var n = countFor(r.id);
      var badge = document.querySelector('[data-badge="' + r.id + '"]');
      if (badge) { badge.style.display = n ? '' : 'none'; badge.querySelector('text').textContent = n > 99 ? '99+' : String(n); }
      var chip = document.querySelector('.chip[data-room="' + r.id + '"] b');
      if (chip) { chip.hidden = !n; chip.textContent = String(n); }
    });
  }

  /* ---------- thoughts: dated, never overwritten ---------- */
  function thoughtItem(t, opts) {
    var li = el('li', isRevised(t.id) ? 'older' : '');
    var room = roomById(t.room);
    var meta = [when(t.at), t.author || 'unsigned'];
    if (opts.showRoom && room) meta.unshift(room.icon + ' ' + room.name);
    if (isRevised(t.id)) meta.push('an earlier view');
    li.appendChild(el('div', 'meta', meta.join(' · ')));
    if (t.about) li.appendChild(el('div', 'about', t.about));
    li.appendChild(el('div', 'body', t.text));
    if (t.revises) {
      var old = thoughts.filter(function (x) { return x.id === t.revises; })[0];
      if (old) li.appendChild(el('div', 'meta', '↳ changes the view of ' + when(old.at)));
    }
    if (opts.canRevise && !isRevised(t.id)) {
      var b = el('button', 'link', 'I see it differently now');
      b.type = 'button';
      b.addEventListener('click', function () { startRevision(t); });
      li.appendChild(b);
    }
    return li;
  }
  function isRevised(id) { return thoughts.some(function (x) { return x.revises === id; }); }
  function byNewest(a, b) { return a.at < b.at ? 1 : a.at > b.at ? -1 : 0; }

  function renderRoomThoughts() {
    var list = $('roomThoughts'); list.textContent = '';
    if (!current) return;
    var mine = thoughts.filter(function (t) { return t.room === current.id; }).sort(byNewest);
    if (!mine.length) list.appendChild(el('li', 'empty', 'Nothing here yet. The first thought does not have to be right.'));
    mine.forEach(function (t) { list.appendChild(thoughtItem(t, { canRevise: true })); });
  }
  function renderAllThoughts() {
    var list = $('allThoughts'); list.textContent = '';
    if (!thoughts.length) list.appendChild(el('li', 'empty', 'Nothing written yet. Walk into a room and leave a first thought.'));
    thoughts.slice().sort(byNewest).forEach(function (t) { list.appendChild(thoughtItem(t, { showRoom: true })); });
  }
  function renderAbout() {
    var line = revises ? 'Changing an earlier view. The earlier one stays, with its date.' :
      about ? 'About: ' + about : 'A free thought about this room. Or tap a question above.';
    $('aboutLine').textContent = line;
    $('thoughtCancel').hidden = !revises;
    document.querySelectorAll('#sheetAsks .ask').forEach(function (b) { b.classList.toggle('on', b.textContent === about); });
  }
  function startRevision(t) {
    revises = t.id; about = t.about || '';
    renderAbout();
    $('thoughtText').focus();
  }
  function saveThought() {
    var box = $('thoughtText'), text = box.value.trim();
    if (!text || !current) { box.focus(); return; }
    settings.author = $('authorName').value.trim();
    store(K.settings, settings);
    var t = { id: newId('t'), at: new Date().toISOString(), room: current.id, author: settings.author, about: about, text: text };
    if (revises) t.revises = revises;
    thoughts.push(t);
    store(K.thoughts, thoughts);
    box.value = ''; revises = '';
    renderAbout(); renderRoomThoughts(); renderAllThoughts(); renderCounts();
  }

  /* ---------- room sheet ---------- */
  var lastFocus = null;
  function openRoom(id) {
    var r = roomById(id); if (!r) return;
    current = r; about = ''; revises = '';
    lastFocus = document.activeElement;
    $('sheetHead').style.background = r.color;
    $('sheetIcon').textContent = r.icon;
    $('sheetName').textContent = r.name;
    $('sheetSub').textContent = r.sub;
    $('sheetWhat').textContent = r.what;
    var holds = $('sheetHolds'); holds.textContent = '';
    r.holds.forEach(function (h) { holds.appendChild(el('li', '', h)); });
    var asks = $('sheetAsks'); asks.textContent = '';
    r.ask.forEach(function (q) {
      var b = el('button', 'ask', q); b.type = 'button';
      b.addEventListener('click', function () {
        about = about === q ? '' : q; revises = '';
        renderAbout();
        if (about) $('thoughtText').focus();
      });
      asks.appendChild(b);
    });
    $('authorName').value = settings.author || '';
    $('thoughtText').value = '';
    renderAbout(); renderRoomThoughts();
    $('veil').hidden = false;
    document.body.classList.add('sheetOpen');
    document.querySelector('.sheetBody').scrollTop = 0;
    $('sheetClose').focus();
    setNoteContext();
  }
  function closeRoom() {
    if ($('veil').hidden) return;
    var draft = $('thoughtText').value.trim();
    if (draft && !window.confirm('Leave without keeping this thought?')) return;
    $('veil').hidden = true;
    document.body.classList.remove('sheetOpen');
    current = null;
    setNoteContext();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ---------- panels below the map ---------- */
  function buildPanels() {
    $('ideaLine').textContent = D.idea.line;
    $('sheetClose').addEventListener('click', closeRoom);
    $('veil').addEventListener('click', function (e) { if (e.target === $('veil')) closeRoom(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (!$('veil').hidden) closeRoom(); else setDrawer(false); } });
    $('thoughtSave').addEventListener('click', saveThought);
    $('thoughtCancel').addEventListener('click', function () { revises = ''; about = ''; renderAbout(); });

    var path = $('pathList');
    D.path.forEach(function (s) {
      var li = el('li'), txt = el('div', 'txt');
      txt.appendChild(el('b', '', s.name)); txt.appendChild(el('span', '', s.text));
      var r = roomById(s.room), go = el('button', 'btn small', r.icon + ' ' + r.name);
      go.type = 'button'; go.addEventListener('click', function () { openRoom(s.room); });
      li.appendChild(txt); li.appendChild(go); path.appendChild(li);
    });

    var kinds = $('kindCards');
    D.kinds.forEach(function (k) {
      var c = el('div', 'card');
      c.appendChild(el('span', 'ci', k.icon)); c.appendChild(el('b', '', k.name));
      c.appendChild(el('small', '', k.size)); c.appendChild(el('em', '', '“' + k.eg + '”'));
      kinds.appendChild(c);
    });

    var an = $('anatomy-body');
    an.appendChild(el('p', 'hint', 'Every piece has a front the child meets and a back the author writes first.'));
    function sides(frontNode, backPairs) {
      var wrap = el('div', 'sides');
      var f = el('div', 'side front'); f.appendChild(el('h3', '', '🎈 Front: what the child meets')); f.appendChild(frontNode);
      var b = el('div', 'side back'); b.appendChild(el('h3', '', '📐 Back: what the author writes first'));
      var dl = el('dl', 'kv');
      backPairs.forEach(function (p) { dl.appendChild(el('dt', '', p[0])); dl.appendChild(el('dd', '', p[1])); });
      b.appendChild(dl); wrap.appendChild(f); wrap.appendChild(b);
      return wrap;
    }
    var ul = el('ul'); D.anatomy.front.forEach(function (x) { ul.appendChild(el('li', '', x)); });
    an.appendChild(sides(ul, D.anatomy.back));
    an.appendChild(el('p', 'sampleTitle', 'Worked example: “' + D.anatomy.sample.title + '” (' + D.anatomy.sample.kind + ')'));
    an.appendChild(sides(el('p', '', D.anatomy.sample.front), D.anatomy.sample.back));

    var layers = $('layerCards');
    D.layers.forEach(function (l) {
      var c = el('div', 'card');
      c.appendChild(el('span', 'ci', l.icon)); c.appendChild(el('b', '', l.name)); c.appendChild(el('span', '', l.text));
      layers.appendChild(c);
    });

    var risks = $('riskList');
    D.risks.forEach(function (r) { risks.appendChild(el('dt', '', r[0])); risks.appendChild(el('dd', '', r[1])); });

    // collapsible panels, remembered per device
    var saved = load(K.panels, {});
    var narrow = window.matchMedia('(max-width: 700px)').matches;
    document.querySelectorAll('.panel').forEach(function (section) {
      var id = section.dataset.panel, head = section.querySelector('.panelHead');
      var open = id in saved ? !!saved[id] : (section.dataset.open !== 'false' && !narrow);
      function apply() { section.dataset.collapsed = String(!open); head.setAttribute('aria-expanded', String(open)); }
      apply();
      head.addEventListener('click', function () { open = !open; apply(); saved[id] = open; store(K.panels, saved); });
    });
  }

  /* ---------- save a copy / load a copy ---------- */
  function downloadThoughts() {
    var out = JSON.stringify({ app: 'our-family-compass', version: APP_VERSION, saved: new Date().toISOString(), thoughts: thoughts }, null, 2);
    try {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([out], { type: 'application/json' }));
      a.download = 'family-compass-thoughts-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
      $('loadResult').textContent = 'Saved a copy with ' + thoughts.length + ' thoughts. Keep the file somewhere private.';
    } catch (e) { logError('Could not save a copy: ' + e.message); }
  }
  function mergeThoughts(text) {
    var data;
    try { data = JSON.parse(text); } catch (e) { return 'That file is not a saved copy (it could not be read).'; }
    var list = Array.isArray(data) ? data : data && data.thoughts;
    if (!Array.isArray(list)) return 'That file is not a saved copy (no thoughts in it).';
    var have = {}, added = 0, skipped = 0;
    thoughts.forEach(function (t) { have[t.id] = 1; });
    list.forEach(function (t) {
      var ok = t && typeof t.id === 'string' && typeof t.text === 'string' && typeof t.at === 'string' && roomById(t.room) && !isNaN(new Date(t.at));
      if (!ok || have[t.id]) { skipped++; return; }
      var clean = { id: t.id, at: t.at, room: t.room, author: String(t.author || '').slice(0, 40), about: String(t.about || ''), text: t.text };
      if (typeof t.revises === 'string') clean.revises = t.revises;
      thoughts.push(clean); have[t.id] = 1; added++;
    });
    if (added) { store(K.thoughts, thoughts); renderAllThoughts(); renderCounts(); renderRoomThoughts(); }
    return 'Added ' + added + '. Skipped ' + skipped + ' (already here, or not readable). Nothing was replaced.';
  }

  /* ---------- settings drawer ---------- */
  function setDrawer(open) { $('drawer').hidden = !open; $('gear').setAttribute('aria-expanded', String(open)); }
  function renderStoreLine() {
    var line = $('storeLine'); if (!line) return;
    line.textContent = storageOk ? thoughts.length + ' thoughts and ' + notes.length + ' notes, on this device only. Not sent anywhere.' :
      'This device is not saving right now (storage is blocked or full). Save a copy before closing the page.';
    $('statusPill').textContent = storageOk ? '💾 this device' : '⚠️ not saving';
  }
  function renderSettings() {
    document.querySelectorAll('.seg').forEach(function (seg) {
      var v = String(settings[seg.dataset.key]);
      seg.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === v); b.setAttribute('aria-pressed', String(b.dataset.v === v)); });
    });
    document.body.classList.toggle('large', !!settings.large);
    document.body.classList.toggle('still', !settings.motion);
    $('showErrors').checked = !!settings.showErrors;
    $('versionLine').textContent = 'Version ' + CHANGELOG[0];
    renderErrors(); renderStoreLine();
  }
  function buildSettings() {
    $('gear').addEventListener('click', function () { setDrawer($('drawer').hidden); });
    $('closeDrawer').addEventListener('click', function () { setDrawer(false); });
    $('statusPill').addEventListener('click', function () { setDrawer(true); });
    document.querySelectorAll('.seg button').forEach(function (b) {
      b.addEventListener('click', function () { settings[b.parentElement.dataset.key] = +b.dataset.v; store(K.settings, settings); renderSettings(); });
    });
    $('showErrors').addEventListener('change', function (e) { settings.showErrors = e.target.checked; store(K.settings, settings); renderErrors(); });
    $('thoughtsDownload').addEventListener('click', downloadThoughts);
    $('thoughtsLoad').addEventListener('click', function () { $('thoughtsFile').click(); });
    $('thoughtsFile').addEventListener('change', function (e) {
      var f = e.target.files && e.target.files[0]; if (!f) return;
      var reader = new FileReader();
      reader.onload = function () { $('loadResult').textContent = mergeThoughts(String(reader.result)); };
      reader.onerror = function () { $('loadResult').textContent = 'The file could not be read.'; };
      reader.readAsText(f); e.target.value = '';
    });
  }

  /* ---------- notes for improvement (02 Refs/Skills/feedback_notes.md) ---------- */
  var where = { page: 'index.html', item: 'map', label: 'Palace map' };
  function setNoteContext() {
    where = current ? { page: 'index.html', item: current.id, label: 'Room: ' + current.name } : { page: 'index.html', item: 'map', label: 'Palace map' };
    $('noteWhere').textContent = 'This note will be about: ' + where.label;
  }
  function renderNotes() {
    var filter = $('noteFilter').value, list = $('noteList');
    list.textContent = '';
    notes.filter(function (n) { return filter === 'all' || n.status === 'open'; }).sort(byNewest).forEach(function (n) {
      list.appendChild(el('li', '', (n.status === 'done' ? '✅ ' : '📝 ') + (n.where && n.where.label ? n.where.label + ' · ' : '') +
        new Date(n.at).toLocaleString() + '\n' + n.text));
    });
  }
  function addNote() {
    var box = $('noteText'), text = box.value.trim();
    if (!text) return;
    notes.push({ id: newId('n'), at: new Date().toISOString(), status: 'open', text: text, where: where, version: APP_VERSION });
    box.value = ''; store(K.notes, notes); renderNotes();
  }
  function buildNotes() {
    $('noteSave').addEventListener('click', addNote);
    $('noteFilter').addEventListener('change', renderNotes);
    $('noteCopy').addEventListener('click', function () {
      var out = JSON.stringify(notes, null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(out).catch(function () { window.prompt('Copy the notes:', out); });
      else window.prompt('Copy the notes:', out);
    });
    setNoteContext(); renderNotes();
  }

  /* ---------- start ---------- */
  try {
    drawMap(); buildPanels(); buildSettings(); buildNotes();
    renderSettings(); renderCounts(); renderAllThoughts();
  } catch (e) { logError('Start failed: ' + e.message); }

  // for the smoke test
  window.OFCApp = {
    info: function () { return { version: APP_VERSION, rooms: D.rooms.length, thoughts: thoughts.length, notes: notes.length, errors: errors.slice(), storageOk: storageOk }; },
    open: openRoom, merge: mergeThoughts
  };
})();
