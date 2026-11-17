/* Our Family Compass: the palace map, room sheets, dated thoughts, settings and notes.
   Classic script, no build. All page text is set with textContent. */
(function () {
  'use strict';
  var APP_VERSION = '0.2.0';
  var CHANGELOG = ['0.2.0 (2026-11-17): twelve sample pieces, room connections, family sign-in, rooms drawn from data.',
    '0.1.0 (2026-11-17): the framework as a palace of nine rooms, dated thoughts, six panels, notes.'];
  var K = { settings: 'ofc.settings', thoughts: 'ofc.thoughts', notes: 'ofc.notes', panels: 'ofc.panels', framework: 'ofc.framework' };
  var PIECES = Array.isArray(window.OFC_PIECES) ? window.OFC_PIECES : [];
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
  function num(v, d) { return typeof v === 'number' && isFinite(v) ? v : d; }
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

  /* ---------- which framework: this file, or a newer copy kept from the family database ---------- */
  function strs(a) { return Array.isArray(a) && a.every(function (x) { return typeof x === 'string'; }); }
  function validFramework(f) {
    return !!f && typeof f.updated === 'string' && !isNaN(new Date(f.updated)) && Array.isArray(f.rooms) && f.rooms.length > 0 &&
      f.rooms.every(function (r) {
        return r && typeof r.id === 'string' && /^[a-z0-9-]+$/.test(r.id) && typeof r.name === 'string' && typeof r.icon === 'string' &&
          typeof r.what === 'string' && strs(r.holds) && strs(r.ask) && (r.color == null || /^#[0-9a-fA-F]{3,8}$/.test(r.color));
      });
  }
  function chooseFramework() {
    var base = window.OFC, kept = load(K.framework, null);
    if (!validFramework(kept) || kept.updated <= base.updated) return base;
    // rooms come from the kept copy; any section it leaves out comes from this file
    return Object.assign({}, base, kept);
  }
  var D = chooseFramework();

  /* ---------- state ----------*/
  var DEFAULTS = { large: 0, motion: 1, voice: 0, showErrors: false, author: '' };
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
  // boxes first, circles last, so a round courtyard sits on top of the rooms around it
  function mapOrder() {
    return D.rooms.filter(function (r) { return r.at && r.at.r == null; }).concat(D.rooms.filter(function (r) { return r.at && r.at.r != null; }));
  }

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
    mapOrder().forEach(function (r) {
      var id = r.id, a = r.at;
      var p = a.r != null ? { cx: num(a.cx, 400), cy: num(a.cy, 365), r: num(a.r, 80) } :
        { x: num(a.x, 0), y: num(a.y, 0), w: num(a.w, 200), h: num(a.h, 120), rx: num(a.w, 200) > 300 ? 30 : 18 };
      var color = r.color || '#fffdf7';
      var g = svg('g', { 'class': 'room', 'data-room': id, tabindex: 0, role: 'button', 'aria-label': r.name + (r.sub ? ', ' + r.sub : '') });
      var cx, cy, bx, by;
      if (p.r) {
        cx = p.cx; cy = p.cy; bx = cx + 62; by = cy - 62;
        g.appendChild(svg('circle', { cx: cx + 5, cy: cy + 6, r: p.r, 'class': 'drop' }));
        g.appendChild(svg('circle', { cx: cx, cy: cy, r: p.r, 'class': 'shape', fill: color }));
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
        g.appendChild(svg('rect', { x: p.x, y: p.y, width: p.w, height: p.h, rx: p.rx, 'class': 'shape', fill: color }));
        var wide = p.w > 300;     // sky and ground bands: icon to the left of the name
        var dy = id === 'principles' ? -12 : id === 'village' ? 12 : 0;   // keep clear of the courtyard
        if (wide) {
          g.appendChild(svg('text', { x: cx - 110, y: cy + 14, 'class': 'em' }, r.icon));
          g.appendChild(svg('text', { x: cx + 20, y: cy + 2, 'class': 'nm' }, r.name));
          g.appendChild(svg('text', { x: cx + 20, y: cy + 26, 'class': 'sb' }, r.sub || ''));
        } else {
          g.appendChild(svg('text', { x: cx, y: cy - 14 + dy, 'class': 'em' }, r.icon));
          g.appendChild(svg('text', { x: cx, y: cy + 22 + dy, 'class': 'nm' }, r.name));
          g.appendChild(svg('text', { x: cx, y: cy + 44 + dy, 'class': 'sb' }, r.sub || ''));
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

  /* ---------- voice notes: recorded on the page, kept on the device, sent to the private bucket when signed in ---------- */
  var VOICE_MAX_MS = 180000;
  function idb() {
    return new Promise(function (resolve, reject) {
      if (!window.indexedDB) { reject(new Error('This browser cannot keep recordings.')); return; }
      var req = indexedDB.open('ofc-voice', 1);
      req.onupgradeneeded = function () { req.result.createObjectStore('clips'); };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error || new Error('Could not open storage for recordings.')); };
    });
  }
  function putVoice(id, blob) {
    return idb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('clips', 'readwrite'); tx.objectStore('clips').put(blob, id);
        tx.oncomplete = function () { resolve(); }; tx.onerror = function () { reject(tx.error); };
      });
    });
  }
  function getVoice(id) {
    return idb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var r = db.transaction('clips').objectStore('clips').get(id);
        r.onsuccess = function () { resolve(r.result || null); }; r.onerror = function () { reject(r.error); };
      });
    }).catch(function () { return null; });
  }
  function voiceMime() {
    var want = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'];
    if (!window.MediaRecorder || !MediaRecorder.isTypeSupported) return '';
    for (var i = 0; i < want.length; i++) if (MediaRecorder.isTypeSupported(want[i])) return want[i];
    return '';
  }
  var rec = null, recStream = null, recChunks = [], recBlob = null, recTimer = null, recTick = null, recStart = 0;
  function recSay(msg) { $('voiceTime').textContent = msg; }
  function stopStream() { if (recStream) { recStream.getTracks().forEach(function (t) { t.stop(); }); recStream = null; } }
  function startRec() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) { recSay('This browser cannot record here.'); return; }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      recStream = stream; recChunks = [];
      var mime = voiceMime();
      rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      rec.ondataavailable = function (e) { if (e.data && e.data.size) recChunks.push(e.data); };
      rec.onstop = function () {
        clearTimeout(recTimer); clearInterval(recTick); stopStream();
        recBlob = recChunks.length ? new Blob(recChunks, { type: rec.mimeType || mime || 'audio/webm' }) : null;
        rec = null; renderVoice();
      };
      rec.start(); recStart = Date.now();
      recTimer = setTimeout(stopRec, VOICE_MAX_MS);
      recTick = setInterval(function () { recSay('Recording… ' + Math.round((Date.now() - recStart) / 1000) + ' s'); }, 500);
      $('voiceRec').textContent = '⏹ Stop'; recSay('Recording…');
    }).catch(function (e) { recSay('The microphone is not available: ' + e.message); logError('Microphone: ' + e.message); });
  }
  function stopRec() { if (rec && rec.state !== 'inactive') rec.stop(); }
  function clearRec() { recBlob = null; renderVoice(); }
  function renderVoice() {
    $('voiceRow').hidden = !settings.voice;
    var prev = $('voicePreview');
    if (prev.src) { URL.revokeObjectURL(prev.src); prev.removeAttribute('src'); }
    if (recBlob) { prev.src = URL.createObjectURL(recBlob); }
    prev.hidden = !recBlob; $('voiceClear').hidden = !recBlob;
    if (!rec) { $('voiceRec').textContent = recBlob ? '🎙️ Record again' : '🎙️ Record a voice note'; if (!recBlob) recSay(''); else recSay('Kept with this thought when you keep it.'); }
  }
  function playVoice(t, holder) {
    var player = el('audio'); player.controls = true; holder.appendChild(player);
    getVoice(t.id).then(function (blob) {
      if (blob) return blob;
      if (t.voice_path && window.Family && Family.signedIn()) return Family.fetchVoice(t.voice_path);
      return null;
    }).then(function (blob) {
      if (!blob) { player.remove(); holder.appendChild(el('span', 'hint', 'The recording is not on this device. Sign in to fetch it.')); return; }
      player.src = URL.createObjectURL(blob); player.play().catch(function () {});
    }).catch(function (e) { player.remove(); logError('Could not play the recording: ' + e.message); });
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
    if (t.voice || t.voice_path) {
      var vh = el('div', 'voiceLine'), vb = el('button', 'link', '▶ Listen to the voice note'); vb.type = 'button';
      vb.addEventListener('click', function () { vb.remove(); playVoice(t, vh); });
      vh.appendChild(vb); li.appendChild(vh);
    }
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
  function addThought(o) {
    var t = { id: newId('t'), at: new Date().toISOString(), room: o.room, author: settings.author || '', about: o.about || '', text: o.text };
    if (o.revises) t.revises = o.revises;
    if (o.piece) t.piece = o.piece;
    if (o.voiceBlob) t.voice = true;
    thoughts.push(t);
    store(K.thoughts, thoughts);
    renderRoomThoughts(); renderAllThoughts(); renderCounts();
    function send() {
      if (window.Family && Family.signedIn()) Family.pushThoughts([t]).catch(function (e) { logError('Could not send the thought to the family database: ' + e.message); setStatus('check'); });
    }
    if (o.voiceBlob) {
      putVoice(t.id, o.voiceBlob).then(send).catch(function (e) {
        t.voice = false; store(K.thoughts, thoughts); renderRoomThoughts();
        logError('The recording could not be kept on this device: ' + e.message);
        $('loadResult').textContent = 'The thought was kept, but its recording could not be.';
      });
    } else send();
    return t;
  }
  function saveThought() {
    var box = $('thoughtText'), text = box.value.trim();
    if (!text || !current) { box.focus(); return; }
    settings.author = $('authorName').value.trim();
    store(K.settings, settings);
    addThought({ room: current.id, about: about, text: text, revises: revises, voiceBlob: recBlob });
    box.value = ''; revises = ''; recBlob = null; renderVoice();
    renderAbout();
  }

  /* ---------- room sheet ---------- */
  var lastFocus = null;
  function openRoom(id) {
    var r = roomById(id); if (!r) return;
    current = r; about = ''; revises = '';
    lastFocus = document.activeElement;
    $('sheetHead').style.background = r.color || '';
    $('sheetIcon').textContent = r.icon;
    $('sheetName').textContent = r.name;
    $('sheetSub').textContent = r.sub || '';
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
    var links = $('sheetLinks'); links.textContent = '';
    (r.links || []).forEach(function (l) {
      var to = roomById(l[0]); if (!to) return;
      var b = el('button', 'ask', to.icon + ' ' + to.name + ': ' + (l[1] || '')); b.type = 'button';
      b.addEventListener('click', function () { if (leaveDraft()) openRoom(to.id); });
      links.appendChild(b);
    });
    $('sheetLinksHead').hidden = !links.childNodes.length;
    var here = PIECES.filter(function (p) { return p.room === r.id; });
    var pl = $('sheetPieces'); pl.textContent = '';
    here.forEach(function (p) { pl.appendChild(pieceCard(p)); });
    $('sheetPiecesHead').hidden = !here.length;
    $('authorName').value = settings.author || '';
    $('thoughtText').value = '';
    stopRec(); recBlob = null; renderVoice();
    renderAbout(); renderRoomThoughts();
    $('veil').hidden = false;
    document.body.classList.add('sheetOpen');
    document.querySelector('.sheetBody').scrollTop = 0;
    $('sheetClose').focus();
    setNoteContext();
  }
  function leaveDraft() {
    var draft = $('thoughtText').value.trim();
    if ((draft || recBlob) && !window.confirm('Leave without keeping this thought?')) return false;
    $('thoughtText').value = '';
    stopRec(); recBlob = null; renderVoice();
    return true;
  }
  function closeRoom() {
    if ($('veil').hidden) return;
    if (!leaveDraft()) return;
    $('veil').hidden = true;
    document.body.classList.remove('sheetOpen');
    current = null;
    setNoteContext();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ---------- pieces: a front the reader meets, a back the author wrote ---------- */
  function kindIcon(name) { var k = (D.kinds || []).filter(function (x) { return x.name === name; })[0]; return k ? k.icon : '🧩'; }
  function pieceCard(p) {
    var b = el('button', 'card pieceCard'); b.type = 'button';
    b.appendChild(el('span', 'ci', kindIcon(p.kind)));
    b.appendChild(el('b', '', p.title));
    b.appendChild(el('small', '', p.kind + ' · for ' + String(p.forWhom || '').toLowerCase()));
    b.addEventListener('click', function () { openPiece(p.id); });
    return b;
  }
  var pieceOn = null, pieceFocus = null;
  function openPiece(id) {
    var p = PIECES.filter(function (x) { return x.id === id; })[0]; if (!p) return;
    pieceOn = p; pieceFocus = document.activeElement;
    var room = roomById(p.room);
    $('pieceHead').style.background = room && room.color || '';
    $('pieceIcon').textContent = kindIcon(p.kind);
    $('pieceTitle').textContent = p.title;
    $('pieceMeta').textContent = p.kind + ' · for ' + String(p.forWhom || '').toLowerCase() + (room ? ' · ' + room.name : '');
    $('pieceFront').textContent = p.front;
    var act = $('pieceAct'); act.textContent = '';
    if (p.choices) {
      var out = el('p', 'then'); out.setAttribute('role', 'status');
      var row = el('div', 'asks');
      p.choices.forEach(function (c) {
        var b = el('button', 'ask', c[0]); b.type = 'button';
        b.addEventListener('click', function () {
          row.querySelectorAll('.ask').forEach(function (x) { x.classList.toggle('on', x === b); });
          out.textContent = c[1];
        });
        row.appendChild(b);
      });
      act.appendChild(row); act.appendChild(out);
    }
    if (p.steps) { var ol = el('ol', 'steps'); p.steps.forEach(function (q) { ol.appendChild(el('li', '', q)); }); act.appendChild(ol); }
    if (p.fill) {
      act.appendChild(el('p', 'hint', 'For the teller:'));
      var ul = el('ul', 'holds'); p.fill.forEach(function (q) { ul.appendChild(el('li', '', q)); }); act.appendChild(ul);
    }
    if (p.ask) {
      act.appendChild(el('p', 'bigAsk', p.ask));
      var ta = el('textarea'); ta.rows = 3; ta.id = 'pieceAnswer'; ta.placeholder = 'An answer, if you want to keep one.';
      ta.setAttribute('aria-label', 'Answer');
      var keep = el('button', 'btn small', 'Keep this answer'); keep.type = 'button';
      var said = el('p', 'hint'); said.setAttribute('role', 'status');
      keep.addEventListener('click', function () {
        var text = ta.value.trim(); if (!text) { ta.focus(); return; }
        addThought({ room: p.room, about: p.title + ': ' + p.ask, text: text, piece: p.id });
        ta.value = ''; said.textContent = 'Kept in ' + (room ? room.name : 'the room') + ', with today\u2019s date.';
      });
      act.appendChild(ta); act.appendChild(keep); act.appendChild(said);
    }
    var back = $('pieceBack'); back.textContent = '';
    var B = p.back || {};
    [['Objective', B.objective], ['Lesson', B.lesson], ['Level', p.level ? String(p.level) : ''], ['Ending', B.ending], ['What it is not', B.not],
      ['Author and date', (p.author || '') + ' · ' + when(p.date)], ['Voice', p.voice ? 'A recording is linked.' : 'No recording yet.']].forEach(function (kv) {
      if (!kv[1]) return; back.appendChild(el('dt', '', kv[0])); back.appendChild(el('dd', '', kv[1]));
    });
    setBack(false);
    $('pieceVeil').hidden = false; document.body.classList.add('sheetOpen');
    document.querySelector('#pieceSheet .sheetBody').scrollTop = 0;
    $('pieceClose').focus();
    setNoteContext();
  }
  function setBack(show) {
    $('pieceBackBox').hidden = !show;
    $('pieceTurn').textContent = show ? '🎈 Back to the front' : '📐 Turn it over';
    $('pieceTurn').setAttribute('aria-expanded', String(show));
  }
  function closePiece() {
    if ($('pieceVeil').hidden) return;
    var ta = $('pieceAnswer');
    if (ta && ta.value.trim() && !window.confirm('Leave without keeping this answer?')) return;
    $('pieceVeil').hidden = true; pieceOn = null;
    if ($('veil').hidden) document.body.classList.remove('sheetOpen');
    setNoteContext();
    if (pieceFocus && pieceFocus.focus) pieceFocus.focus();
  }

  /* ---------- panels below the map ---------- */
  function buildPanels() {
    $('ideaLine').textContent = D.idea.line;
    $('sheetClose').addEventListener('click', closeRoom);
    $('veil').addEventListener('click', function (e) { if (e.target === $('veil')) closeRoom(); });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (!$('pieceVeil').hidden) closePiece(); else if (!$('veil').hidden) closeRoom(); else setDrawer(false);
    });
    $('pieceClose').addEventListener('click', closePiece);
    $('pieceVeil').addEventListener('click', function (e) { if (e.target === $('pieceVeil')) closePiece(); });
    $('pieceTurn').addEventListener('click', function () { setBack($('pieceBackBox').hidden); });
    var pc = $('pieceCards');
    PIECES.forEach(function (p) { pc.appendChild(pieceCard(p)); });
    $('thoughtSave').addEventListener('click', saveThought);
    $('voiceRec').addEventListener('click', function () { if (rec && rec.state === 'recording') stopRec(); else startRec(); });
    $('voiceClear').addEventListener('click', clearRec);
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
      if (typeof t.revises === 'string' && t.revises) clean.revises = t.revises;
      if (typeof t.piece === 'string' && t.piece) clean.piece = t.piece;
      if (typeof t.voice_path === 'string' && /^[A-Za-z0-9_\-\/.]{1,200}$/.test(t.voice_path) && t.voice_path.indexOf('..') < 0) clean.voice_path = t.voice_path;
      thoughts.push(clean); have[t.id] = 1; added++;
    });
    if (added) { store(K.thoughts, thoughts); renderAllThoughts(); renderCounts(); renderRoomThoughts(); }
    return 'Added ' + added + '. Skipped ' + skipped + ' (already here, or not readable). Nothing was replaced.';
  }

  /* ---------- settings drawer ---------- */
  function setDrawer(open) { $('drawer').hidden = !open; $('gear').setAttribute('aria-expanded', String(open)); }
  function renderStoreLine() {
    var line = $('storeLine'); if (!line) return;
    line.textContent = storageOk ? thoughts.length + ' thoughts and ' + notes.length + ' notes on this device. Signed in, they are also kept in the family database.' :
      'This device is not saving right now (storage is blocked or full). Save a copy before closing the page.';
    renderPill();
  }
  var dbState = 'device';     // device | family | check
  function setStatus(s) { dbState = s; renderPill(); }
  function renderPill() {
    $('statusPill').textContent = !storageOk ? '⚠️ not saving' : dbState === 'family' ? '☁️ family' : dbState === 'check' ? '⚠️ check' : '💾 this device';
  }
  // a newer framework from the family database is kept for the next time the page opens
  function keepFramework(f) {
    if (!validFramework(f) || f.updated <= D.updated) return false;
    store(K.framework, f);
    return true;
  }
  function renderSettings() {
    document.querySelectorAll('.seg').forEach(function (seg) {
      var v = String(settings[seg.dataset.key]);
      seg.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === v); b.setAttribute('aria-pressed', String(b.dataset.v === v)); });
    });
    document.body.classList.toggle('large', !!settings.large);
    document.body.classList.toggle('still', !settings.motion);
    $('showErrors').checked = !!settings.showErrors;
    renderVoice();
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
    where = pieceOn ? { page: 'index.html', item: pieceOn.id, label: 'Piece: ' + pieceOn.title } :
      current ? { page: 'index.html', item: current.id, label: 'Room: ' + current.name } : { page: 'index.html', item: 'map', label: 'Palace map' };
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
    var n = { id: newId('n'), at: new Date().toISOString(), status: 'open', text: text, where: where, version: APP_VERSION };
    notes.push(n);
    box.value = ''; store(K.notes, notes); renderNotes();
    if (window.Family && Family.signedIn()) Family.pushNotes([n]).catch(function (e) { logError('Could not send the note to the family database: ' + e.message); setStatus('check'); });
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
    info: function () { return { version: APP_VERSION, framework: D.version, rooms: D.rooms.length, pieces: PIECES.length, thoughts: thoughts.length, notes: notes.length, errors: errors.slice(), storageOk: storageOk, status: dbState }; },
    open: openRoom, openPiece: openPiece, merge: mergeThoughts, mergeList: function (list) { return mergeThoughts(JSON.stringify(list || [])); },
    voiceBlob: getVoice,
    setVoicePath: function (id, path) { thoughts.forEach(function (t) { if (t.id === id) t.voice_path = path; }); store(K.thoughts, thoughts); renderAllThoughts(); renderRoomThoughts(); },
    thoughts: function () { return thoughts.slice(); }, notes: function () { return notes.slice(); },
    framework: function () { return D; }, keepFramework: keepFramework, setStatus: setStatus, logError: logError, validPieces: function () {
      var kinds = (D.kinds || []).map(function (k) { return k.name; }), seen = {};
      return PIECES.filter(function (p) { var ok = roomById(p.room) && kinds.indexOf(p.kind) >= 0 && !seen[p.id] && p.back && p.back.objective && p.back.ending && p.back.not; seen[p.id] = 1; return !ok; }).map(function (p) { return p.id; });
    }
  };
})();
