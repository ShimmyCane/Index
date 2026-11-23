/* Felix Stickers – Creature Lab, first build (0.1.0).
   Plain browser JS, no build. Data: js/sheet.js. Everything stays on the device. */
(function () {
  'use strict';

  var VERSION = '0.1.0';
  var SHEET = window.FS_SHEET;
  var KEYS = { prefs: 'fs.prefs.v1', creations: 'fs.creations.v1', notes: 'fs.notes.v1' };
  var MAX_UNDO = 50;
  var PEEL_PULL = 26;   // px a finger must pull a sticker before it lifts off the sheet
  var TAP_SLOP = 8;     // px a press may wander and still count as a press

  var stickerById = {};
  SHEET.stickers.concat([SHEET.main]).forEach(function (s) { stickerById[s.id] = s; });

  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function dist(a, b) { return Math.hypot(b.x - a.x, b.y - a.y); }
  function round(v) { return Math.round(v * 10) / 10; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- device storage (blocked storage must never break play) ---------- */
  var storeOK = true;
  function load(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { storeOK = false; return fallback; }
  }
  function store(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { storeOK = false; reportError('Could not save on this device: ' + e.message); return false; }
  }

  /* ---------- state ---------- */
  var prefs = Object.assign({ undoOn: true, showErrors: false }, load(KEYS.prefs, {}));
  var state = { placed: [], used: [] };   // placed: {uid, stickerId, x, y, rot, committed}; used: sticker ids off the sheet
  var undoStack = [];
  var nextUid = 1;
  var lastItem = 'the whole screen';
  var errors = [];
  var pointers = new Map();               // pointerId -> {x, y}
  var gesture = null;                     // {kind:'peel'|'move'|'rotate', ...}
  var gearTimer = null;

  function snapshot() { return JSON.parse(JSON.stringify(state)); }
  function pushUndo(before) {
    if (!before) return;
    undoStack.push(before);
    if (undoStack.length > MAX_UNDO) undoStack.shift();
    updateUndo();
  }
  function undo() {
    if (!undoStack.length) return;
    gesture = null; pointers.clear();
    state = undoStack.pop();
    render();
  }
  function updateUndo() {
    var b = $('#btnUndo');
    b.disabled = !undoStack.length;
    b.hidden = !prefs.undoOn;
    $('#tgUndo').checked = prefs.undoOn;
  }

  function findItem(uid) {
    for (var i = 0; i < state.placed.length; i++) if (state.placed[i].uid === uid) return state.placed[i];
    return null;
  }
  function elFor(uid) { return document.querySelector('.ps[data-uid="' + uid + '"]'); }
  function stageRect() { return $('#placed').getBoundingClientRect(); }
  function toPercent(pt) {
    var r = stageRect();
    return { x: clamp((pt.x - r.left) / r.width * 100, 0, 100), y: clamp((pt.y - r.top) / r.height * 100, 0, 100) };
  }
  function angleOf(pids) {
    var a = pointers.get(pids[0]), b = pointers.get(pids[1]);
    if (!a || !b) return 0;
    return Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
  }
  function setLast(label) { lastItem = label; }

  /* ---------- rendering ---------- */
  function render() {
    renderStage();
    renderTray();
    updateUndo();
  }
  function placeStyle(node, item) {
    node.style.left = item.x + '%';
    node.style.top = item.y + '%';
    node.style.transform = 'translate(-50%,-50%) rotate(' + item.rot + 'deg)';
  }
  function renderStage() {
    var host = $('#placed');
    host.innerHTML = '';
    state.placed.forEach(function (item) {
      var s = stickerById[item.stickerId];
      var n = el('div', 'ps ' + (item.committed ? 'committed' : 'floating'));
      n.dataset.uid = item.uid;
      n.setAttribute('role', 'button');
      n.setAttribute('aria-label', 'Sticker: ' + s.label + (item.committed ? ', stuck' : ', tap to stick'));
      n.innerHTML = '<div class="stk">' + artFor(s) + '</div>';
      placeStyle(n, item);
      host.appendChild(n);
    });
  }
  // The sheet is the reference picture itself. Each piece sits on its box in the picture;
  // a peeled piece leaves its spot empty, so the sheet shows the same picture with holes.
  function renderTray() {
    var card = $('#sheetCard');
    card.innerHTML = '';
    var page = el('div', 'sheetPage');
    var base = window.FS_NATIVE_BASE;
    if (base) page.appendChild(el('img', 'base', null)).src = base;
    var W = SHEET.ref.w, H = SHEET.ref.h;
    SHEET.stickers.concat([SHEET.main]).forEach(function (s) {
      var gone = state.used.indexOf(s.id) !== -1;
      var n = el('div', 'slot' + (s.id === SHEET.main.id ? ' main' : '') + (gone ? ' empty' : ''));
      n.dataset.sid = s.id;
      n.style.left = (s.box.x / W * 100) + '%';
      n.style.top = (s.box.y / H * 100) + '%';
      n.style.width = (s.box.w / W * 100) + '%';
      n.style.height = (s.box.h / H * 100) + '%';
      n.setAttribute('aria-label', gone ? 'Empty space: ' + s.label : 'Sticker: ' + s.label + '. Pull a corner to peel it.');
      if (!gone) n.innerHTML = '<div class="stk">' + artFor(s) + '</div>';
      page.appendChild(n);
    });
    card.appendChild(page);
  }

  // Native art when provided (private/native.js, local only); otherwise the SVG in sheet.js.
  function artFor(s) {
    var src = window.FS_NATIVE_ART && window.FS_NATIVE_ART[s.id];
    return src ? '<img class="art" src="' + src + '" alt="" draggable="false">' : s.svg;
  }

  // A small random tilt, so every placed sticker looks hand-stuck.
  function playfulAngle() { return Math.round((Math.random() * 24 - 12) * 10) / 10; }

  /* ---------- gestures: peel, move, rotate, press ---------- */
  function onTrayDown(e) {
    var tile = e.target.closest && e.target.closest('.slot');
    if (!tile || tile.classList.contains('empty')) return;
    e.preventDefault();
    if (gesture) return;
    var pt = { x: e.clientX, y: e.clientY };
    pointers.set(e.pointerId, pt);
    var sid = tile.dataset.sid;
    setLast(stickerById[sid].label);
    gesture = { kind: 'peel', pid: e.pointerId, sid: sid, start: pt, before: snapshot(), tile: tile, detached: false };
    tile.classList.add('lifting');
  }

  function onPlacedDown(e) {
    var node = e.target.closest && e.target.closest('.ps');
    if (!node) return;
    e.preventDefault();
    var uid = Number(node.dataset.uid);
    var item = findItem(uid);
    if (!item) return;
    var pt = { x: e.clientX, y: e.clientY };
    pointers.set(e.pointerId, pt);
    setLast(stickerById[item.stickerId].label);

    // a second finger on a sticker you are moving turns it
    if (gesture && gesture.kind === 'move' && gesture.uid === uid && gesture.pids.length === 1 && !item.committed) {
      gesture.kind = 'rotate';
      gesture.pids.push(e.pointerId);
      gesture.angle0 = angleOf(gesture.pids);
      gesture.rot0 = item.rot;
      node.classList.add('turning');
      return;
    }
    if (gesture) return;

    if (item.committed) {
      node.classList.add('nudge');
      setTimeout(function () { node.classList.remove('nudge'); }, 300);
      return;
    }
    var before = snapshot();
    // bring the grabbed sticker to the front, so a feature lands on top of the body
    if (state.placed[state.placed.length - 1] !== item) {
      state.placed.splice(state.placed.indexOf(item), 1);
      state.placed.push(item);
      renderStage();
      node = elFor(uid);
    }
    gesture = {
      kind: 'move', uid: uid, pids: [e.pointerId], start: pt,
      origX: item.x, origY: item.y, moved: false, fromPeel: false, before: before
    };
    if (node) node.classList.add('dragging');
  }

  function detachFromSheet(pt) {
    var p = toPercent(pt);
    var item = { uid: nextUid++, stickerId: gesture.sid, x: p.x, y: p.y, rot: playfulAngle(), committed: false };
    state.placed.push(item);
    if (state.used.indexOf(gesture.sid) === -1) state.used.push(gesture.sid);
    renderStage();
    renderTray();
    var n = elFor(item.uid);
    if (n) { n.classList.add('dragging', 'popped'); }
    gesture.kind = 'move';
    gesture.uid = item.uid;
    gesture.pids = [gesture.pid];
    gesture.start = pt;
    gesture.origX = item.x;
    gesture.origY = item.y;
    gesture.moved = true;
    gesture.fromPeel = true;
    gesture.detached = true;
    var t = document.querySelector('.slot.lifting');
    if (t) t.classList.remove('lifting');
  }

  function onMove(e) {
    if (!pointers.has(e.pointerId)) return;
    var pt = { x: e.clientX, y: e.clientY };
    pointers.set(e.pointerId, pt);
    if (!gesture) return;
    e.preventDefault();

    if (gesture.kind === 'peel') {
      if (e.pointerId !== gesture.pid) return;
      if (dist(gesture.start, pt) < PEEL_PULL) return;
      detachFromSheet(pt);
    }

    if (gesture.kind === 'move' && gesture.pids.indexOf(e.pointerId) !== -1) {
      var item = findItem(gesture.uid);
      var r = stageRect();
      var dx = (pt.x - gesture.start.x) / r.width * 100;
      var dy = (pt.y - gesture.start.y) / r.height * 100;
      item.x = clamp(gesture.origX + dx, 0, 100);
      item.y = clamp(gesture.origY + dy, 0, 100);
      if (!gesture.moved && dist(gesture.start, pt) > TAP_SLOP) gesture.moved = true;
      var n = elFor(item.uid);
      if (n) placeStyle(n, item);
    } else if (gesture.kind === 'rotate') {
      var it = findItem(gesture.uid);
      it.rot = gesture.rot0 + (angleOf(gesture.pids) - gesture.angle0);
      var node = elFor(it.uid);
      if (node) placeStyle(node, it);
    }
  }

  function onUp(e) {
    var wasDown = pointers.delete(e.pointerId);
    if (!gesture || !wasDown) return;

    if (gesture.kind === 'peel' && e.pointerId === gesture.pid) {
      // pressed the sheet and let go before it lifted: nothing happens
      var t = document.querySelector('.slot.lifting');
      if (t) t.classList.remove('lifting');
      gesture = null;
      return;
    }

    if (gesture.kind === 'rotate' && gesture.pids.indexOf(e.pointerId) !== -1) {
      var it = findItem(gesture.uid);
      var node = elFor(it.uid);
      if (node) { node.classList.remove('turning'); node.classList.remove('dragging'); }
      if (Math.abs(it.rot - gesture.rot0) > 0.5) pushUndo(gesture.before);
      gesture = null;
      return;
    }

    if (gesture.kind === 'move' && gesture.pids.indexOf(e.pointerId) !== -1) {
      var item = findItem(gesture.uid);
      var n = elFor(item.uid);
      if (n) n.classList.remove('dragging', 'popped');
      if (!gesture.moved && !gesture.fromPeel && !item.committed) {
        // a press on a floating sticker sticks it for this session
        item.committed = true;
        pushUndo(gesture.before);
        renderStage();
        setLast(stickerById[item.stickerId].label + ' (stuck)');
      } else if (gesture.moved) {
        pushUndo(gesture.before);
      }
      gesture = null;
    }
  }

  /* ---------- actions ---------- */
  function resetSheet() {
    pushUndo(snapshot());
    state = { placed: [], used: [] };
    render();
    toast('Sheet is back. Undo can bring it back.');
  }

  function creationsList() { return load(KEYS.creations, []); }

  function saveCreation() {
    if (!state.placed.length) { toast('Add a sticker first'); return; }
    var list = creationsList();
    var c = {
      id: 'c' + Date.now(), sheetId: SHEET.id, sheetName: SHEET.name, version: VERSION,
      savedAt: new Date().toISOString(),
      items: state.placed.map(function (i) {
        return { stickerId: i.stickerId, x: round(i.x), y: round(i.y), rot: round(i.rot), committed: !!i.committed };
      })
    };
    list.unshift(c);
    if (store(KEYS.creations, list)) toast('Saved to My Creations');
    else toast('Could not save on this device');
    renderCreations();
  }

  function openCreation(id) {
    var c = creationsList().filter(function (x) { return x.id === id; })[0];
    if (!c) return;
    pushUndo(snapshot());
    gesture = null; pointers.clear();
    state = {
      placed: c.items.map(function (it) {
        return { uid: nextUid++, stickerId: it.stickerId, x: it.x, y: it.y, rot: it.rot, committed: !!it.committed };
      }),
      used: c.items.map(function (it) { return it.stickerId; })
    };
    render();
    closeSheet('#mine');
    toast('Opened. Tap Undo to go back.');
  }

  function deleteCreation(id) {
    store(KEYS.creations, creationsList().filter(function (x) { return x.id !== id; }));
    renderCreations();
  }

  function renderCreations() {
    var ul = $('#creationList');
    var list = creationsList();
    ul.innerHTML = '';
    if (!list.length) {
      ul.appendChild(el('li', '', 'No creations yet. Make one and tap “Save My Creature”.'));
      return;
    }
    list.forEach(function (c) {
      var li = el('li', '');
      var when = new Date(c.savedAt).toLocaleString();
      li.innerHTML = '<strong>' + esc(c.sheetName) + '</strong><div class="meta">' + esc(when) + ' · ' + c.items.length + ' stickers</div>';
      var row = el('div', 'row');
      var open = el('button', 'btn pill small', 'Open'); open.type = 'button';
      open.addEventListener('click', function () { openCreation(c.id); });
      var del = el('button', 'btn pill small', 'Delete'); del.type = 'button';
      del.addEventListener('click', function () { deleteCreation(c.id); });
      row.appendChild(open); row.appendChild(del);
      li.appendChild(row);
      ul.appendChild(li);
    });
  }

  function renderNotes() {
    var ul = $('#noteList');
    var notes = load(KEYS.notes, []);
    ul.innerHTML = '';
    if (!notes.length) { ul.appendChild(el('li', '', 'No notes yet.')); return; }
    notes.forEach(function (n) {
      var li = el('li', '');
      li.innerHTML = '<div>' + esc(n.text) + '</div><div class="meta">About: ' + esc(n.item) +
        ' · v' + esc(n.version) + ' · ' + esc(new Date(n.noted_at).toLocaleString()) + '</div>';
      var del = el('button', 'btn pill small', 'Delete'); del.type = 'button';
      del.addEventListener('click', function () {
        store(KEYS.notes, load(KEYS.notes, []).filter(function (x) { return x.id !== n.id; }));
        renderNotes();
      });
      var row = el('div', 'row'); row.appendChild(del); li.appendChild(row);
      ul.appendChild(li);
    });
  }

  function addNote() {
    var box = $('#noteText');
    var text = box.value.trim();
    if (!text) { toast('Write a short note first'); return; }
    var notes = load(KEYS.notes, []);
    notes.unshift({
      id: 'n' + Date.now(), text: text, item: lastItem, label: SHEET.name,
      version: VERSION, noted_at: new Date().toISOString()
    });
    if (store(KEYS.notes, notes)) { box.value = ''; toast('Note saved on this device'); }
    renderNotes();
  }

  /* ---------- errors (opt-in, shown at the bottom) ---------- */
  function reportError(msg) {
    errors.unshift({ msg: String(msg).slice(0, 200), at: new Date().toLocaleTimeString() });
    if (errors.length > 20) errors.length = 20;
    renderErrors();
  }
  function renderErrors() {
    $('#errCount').textContent = String(errors.length);
    var ul = $('#errList');
    ul.innerHTML = '';
    errors.slice(0, 5).forEach(function (e) { ul.appendChild(el('li', '', esc(e.at + ' · ' + e.msg))); });
    var bar = $('#errorBar');
    if (prefs.showErrors && errors.length) {
      bar.hidden = false;
      bar.textContent = 'Error (tap to hide): ' + errors[0].msg;
    } else {
      bar.hidden = true;
    }
  }

  /* ---------- sheets, gear and toast ---------- */
  function toast(text) {
    var t = $('#toast');
    t.textContent = text;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  function openSheet(sel) {
    $(sel).hidden = false;
    wakeGear(true);
  }
  function closeSheet(sel) {
    $(sel).hidden = true;
    wakeGear(false);
  }
  function wakeGear(keep) {
    var g = $('#gear');
    g.classList.add('show');
    clearTimeout(gearTimer);
    if (keep) return;
    gearTimer = setTimeout(function () {
      if ($('#drawer').hidden && $('#mine').hidden) g.classList.remove('show');
    }, 2500);
  }

  function setupPanels() {
    document.querySelectorAll('#drawer .panel').forEach(function (section) {
      var head = section.querySelector('.panelHead');
      function apply(open) {
        section.dataset.collapsed = String(!open);
        head.setAttribute('aria-expanded', String(open));
      }
      apply(section.dataset.open !== 'false');
      head.addEventListener('click', function () {
        apply(section.dataset.collapsed === 'true');
      });
    });
  }

  /* ---------- wiring ---------- */
  function wire() {
    // gesture lock: no pinch zoom, no double-tap zoom, no pull-to-refresh, no long-press menus
    ['gesturestart', 'gesturechange', 'gestureend'].forEach(function (t) {
      document.addEventListener(t, function (e) { e.preventDefault(); }, { passive: false });
    });
    document.addEventListener('touchmove', function (e) {
      if (!(e.target.closest && e.target.closest('.allow-scroll'))) e.preventDefault();
    }, { passive: false });
    document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    document.addEventListener('dblclick', function (e) { e.preventDefault(); });

    $('#sheetCard').addEventListener('pointerdown', onTrayDown);
    $('#placed').addEventListener('pointerdown', onPlacedDown);
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    // the lower-right corner brings the gear back
    window.addEventListener('pointerdown', function (e) {
      if (e.clientX > window.innerWidth - 150 && e.clientY > window.innerHeight - 200) wakeGear(false);
    });

    $('#btnUndo').addEventListener('click', undo);
    $('#btnSave').addEventListener('click', saveCreation);
    $('#btnMy').addEventListener('click', function () { renderCreations(); openSheet('#mine'); });
    $('#btnMineClose').addEventListener('click', function () { closeSheet('#mine'); });
    $('#gear').addEventListener('click', function () { openSheet('#drawer'); });
    $('#btnSettingsTop').addEventListener('click', function () { openSheet('#drawer'); });
    $('#btnClose').addEventListener('click', function () { closeSheet('#drawer'); });

    $('#tgUndo').addEventListener('change', function (e) {
      prefs.undoOn = e.target.checked; store(KEYS.prefs, prefs); updateUndo();
    });
    $('#tgErrors').checked = prefs.showErrors;
    $('#tgErrors').addEventListener('change', function (e) {
      prefs.showErrors = e.target.checked; store(KEYS.prefs, prefs); renderErrors();
    });

    var resetBtn = $('#btnReset');
    var resetArmed = null;
    resetBtn.addEventListener('click', function () {
      if (!resetArmed) {
        resetBtn.textContent = 'Are you sure? Tap again';
        resetArmed = setTimeout(function () { resetArmed = null; resetBtn.textContent = 'Reset the sheet'; }, 4000);
        return;
      }
      clearTimeout(resetArmed); resetArmed = null;
      resetBtn.textContent = 'Reset the sheet';
      resetSheet();
      closeSheet('#drawer');
    });

    $('#btnNote').addEventListener('click', addNote);
    $('#errorBar').addEventListener('click', function () { prefs.showErrors = false; store(KEYS.prefs, prefs); $('#tgErrors').checked = false; renderErrors(); });

    window.addEventListener('error', function (e) { reportError(e.message || 'Script error'); });
    window.addEventListener('unhandledrejection', function (e) { reportError('Promise: ' + (e.reason && e.reason.message || e.reason)); });
  }

  function start() {
    $('#title').textContent = 'Felix Stickers – ' + SHEET.name;
    document.title = 'Felix Stickers – ' + SHEET.name;
    $('#ver').textContent = VERSION;
    $('#storeState').textContent = storeOK ? 'working' : 'blocked (play still works)';
    setupPanels();
    wire();
    render();
    renderNotes();
    renderCreations();
    renderErrors();
    wakeGear(false);
  }

  start();
})();
