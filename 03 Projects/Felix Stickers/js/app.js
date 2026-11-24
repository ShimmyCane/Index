/* Felix Stickers – Creature Lab, first build (0.1.0).
   Plain browser JS, no build. Data: js/sheet.js. Everything stays on the device. */
(function () {
  'use strict';

  var VERSION = '0.1.0';
  var SHEET = window.FS_SHEET;
  var KEYS = { prefs: 'fs.prefs.v1', creations: 'fs.creations.v1', notes: 'fs.notes.v1' };
  var MAX_UNDO = 50;
  var PEEL_PULL = 0.9;  // a sticker comes away after the finger pulls 90% of its own (shorter) size
  var PEEL_TURN = 180;  // degrees the lifted flap turns over while it is pulled
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
      var art = stickerById[item.stickerId].box;   // same size as on the sheet
      n.style.width = 'calc(var(--pageW, 300px) * ' + (art.w / SHEET.ref.w) + ')';
      n.style.height = 'calc(var(--pageW, 300px) * ' + (art.h / SHEET.ref.w) + ')';
      n.style.setProperty('--rot', item.rot + 'deg');
      n.style.setProperty('--ang', (item.ang || 0) + 'deg');
      n.setAttribute('aria-label', 'Sticker: ' + s.label + (item.committed ? ', stuck' : ', tap to stick'));
      n.innerHTML = '<div class="stk">' + artFor(s, true) + '</div>';
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
  function artFor(s, placed) {
    var map = placed ? window.FS_NATIVE_PLACED : window.FS_NATIVE_ART;
    var src = map && map[s.id];
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
    var box = tile.getBoundingClientRect();
    gesture = { kind: 'peel', pid: e.pointerId, sid: sid, start: pt, before: snapshot(), tile: tile, detached: false,
      pull: PEEL_PULL * Math.min(box.width, box.height),
      grab: { x: pt.x - box.left, y: pt.y - box.top }, size: { w: box.width, h: box.height } };
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

  /* ---- peel: a soft roll starts at the click and travels down the drag direction ----
     Along the drag (t = distance from the click, + in the drag direction, S = roll centre):
       t < 0            stuck, unchanged
       t < S - R        already peeled: a hole on the sheet (it has moved)
       S - R .. S + R   the roll: the picture curls round it (soft, shaded, not a crease)
       S + R .. 2S      the peeled part, back side up, lying over the sheet ahead of the roll
       t > 2S           stuck, unchanged
     The sticker is drawn column by column (or row by row) into a canvas over its own spot. */
  var imgCache = {};
  var peelState = null;
  function cutoutImage(src) {
    if (!src) return null;
    var im = imgCache[src];
    if (!im) {
      im = new Image();
      im.onload = function () { if (peelState) drawPeel(peelState); };
      im.src = src;
      imgCache[src] = im;
    }
    return im.complete && im.naturalWidth ? im : null;
  }

  function smooth(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }

  /* The peel works in the drag's own frame: t runs along the drag from the press point,
     a runs across it. The piece is first drawn into that frame (canvas O), then the sheet is
     painted one t-column at a time, so the roll can run in any direction.
       t < 0            stuck, unchanged
       t < S - R        peeled away: a hole on the sheet
       S - R .. S + R   the roll: the picture curls round it, shaded, edges faded
       S + R .. 2S      the peeled part, back side up, lying ahead of the roll
       t > 2S           stuck, unchanged */
  // The piece is drawn once into the drag's frame, then read back as pixels.
  function buildFrame(st) {
    var d = st.dpr;
    var ux = st.u.x, uy = st.u.y, nx = -uy, ny = ux;
    var corners = [[0, 0], [st.W, 0], [st.W, st.H], [0, st.H]];
    var tA = Infinity, tB = -Infinity, aA = Infinity, aB = -Infinity;
    corners.forEach(function (c) {
      var X = st.ox + c[0] - st.gp.x, Y = st.oy + c[1] - st.gp.y;
      var t = X * ux + Y * uy, a = X * nx + Y * ny;
      tA = Math.min(tA, t); tB = Math.max(tB, t); aA = Math.min(aA, a); aB = Math.max(aB, a);
    });
    tA = Math.floor(tA) - 2; aA = Math.floor(aA) - 2;
    var wO = Math.ceil(tB - tA) + 4, hO = Math.ceil(aB - aA) + 4;
    var O = document.createElement('canvas');
    O.width = Math.round(wO * d); O.height = Math.round(hO * d);
    var oc = O.getContext('2d');
    var C1 = (st.ox - st.gp.x) * ux + (st.oy - st.gp.y) * uy - tA;
    var C2 = (st.ox - st.gp.x) * nx + (st.oy - st.gp.y) * ny - aA;
    oc.setTransform(d * ux, d * nx, d * uy, d * ny, d * C1, d * C2);
    oc.drawImage(st.src, 0, 0, st.W, st.H);
    var px = oc.getImageData(0, 0, O.width, O.height);
    // the box on the sheet that the peel can reach (the frame's corners, back in page space)
    st.frame = { data: px.data, wD: O.width, hD: O.height, d: d, tA: tA, tB: tB, aA: aA, aB: aB };
  }

  // Sample the drag-frame picture at (x, y) in CSS px of the frame; returns [r,g,b,a].
  function sampleFrame(F, x, y, out) {
    var fx = x * F.d - 0.5, fy = y * F.d - 0.5;
    if (fx < 0 || fy < 0 || fx >= F.wD - 1 || fy >= F.hD - 1) { out[3] = 0; return; }
    var x0 = Math.floor(fx), y0 = Math.floor(fy), wx = fx - x0, wy = fy - y0;
    var i00 = (y0 * F.wD + x0) * 4, i10 = i00 + 4, i01 = i00 + F.wD * 4, i11 = i01 + 4;
    var d = F.data, w00 = (1 - wx) * (1 - wy), w10 = wx * (1 - wy), w01 = (1 - wx) * wy, w11 = wx * wy;
    var A = d[i00 + 3] * w00 + d[i10 + 3] * w10 + d[i01 + 3] * w01 + d[i11 + 3] * w11;
    if (A < 1) { out[3] = 0; return; }
    for (var c = 0; c < 3; c++) {
      out[c] = (d[i00 + c] * d[i00 + 3] * w00 + d[i10 + c] * d[i10 + 3] * w10 + d[i01 + c] * d[i01 + 3] * w01 + d[i11 + c] * d[i11 + 3] * w11) / A;
    }
    out[3] = A;
  }

  /* Per pixel, so nothing is drawn in strips and no seams can show. The drag frame:
     t runs along the drag from the press point, a across it.
       t < 0            stuck, unchanged
       t < S - R        peeled away: a hole on the sheet
       S - R .. S + R   the roll: the picture curls round it; edges faded
       S + R .. 2S      the peeled part, back side up, lying ahead of the roll
       t > 2S           stuck, unchanged */
  function drawPeel(st) {
    if (!st.frame) buildFrame(st);
    var F = st.frame;
    // the area the peel can reach this frame: from the piece's back to where the lifted part ends
    var ux0 = st.u.x, uy0 = st.u.y, nx0 = -uy0, ny0 = ux0;
    var tEnd = Math.max(F.tB, 2 * st.S + st.R + 2), tStart = Math.min(F.tA, 0) - 2;
    var bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
    [[tStart, F.aA], [tEnd, F.aA], [tEnd, F.aB], [tStart, F.aB]].forEach(function (q) {
      var X = st.gp.x + q[0] * ux0 + q[1] * nx0, Y = st.gp.y + q[0] * uy0 + q[1] * ny0;
      bx0 = Math.min(bx0, X); by0 = Math.min(by0, Y); bx1 = Math.max(bx1, X); by1 = Math.max(by1, Y);
    });
    bx0 = Math.max(0, Math.floor(bx0)); by0 = Math.max(0, Math.floor(by0));
    bx1 = Math.min(st.PW, Math.ceil(bx1)); by1 = Math.min(st.PH, Math.ceil(by1));
    F.bx0 = bx0; F.by0 = by0; F.bw = Math.max(1, bx1 - bx0); F.bh = Math.max(1, by1 - by0);
    var ctx = st.canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, st.canvas.width, st.canvas.height);
    var img = ctx.createImageData(Math.round(F.bw * dpr), Math.round(F.bh * dpr));
    var out = img.data, sc = dpr;
    var ux = st.u.x, uy = st.u.y, gx = st.gp.x, gy = st.gp.y;
    var S = st.S, R = st.R, px = [0, 0, 0, 0];
    var paper = [240, 232, 218];
    for (var j = 0; j < img.height; j++) {
      var Y = F.by0 + (j + 0.5) / sc;
      for (var i = 0; i < img.width; i++) {
        var X = F.bx0 + (i + 0.5) / sc;
        var rx = X - gx, ry = Y - gy;
        var t = rx * ux + ry * uy, a = -rx * uy + ry * ux;
        var o = (j * img.width + i) * 4;
        var kind = 0, ts = t, shade = 1, alpha = 1, hi = 0;   // kind 0: picture, 1: lifted (vellum), 2: nothing
        if (t < S - R) {
          if (t >= 0) kind = 2;                              // peeled away: a hole
        } else if (t <= S + R) {
          var ph = Math.acos(Math.max(-1, Math.min(1, (S - t) / R)));
          ts = S - R + ph / Math.PI * 2 * R;                  // the picture curls round the roll
          shade = 0.5 + 0.5 * Math.sin(ph);                   // darker at the sides of the curl
          hi = 0.16 * Math.exp(-Math.pow(ph - Math.PI / 2, 2) / 0.18);   // a soft highlight on top
        } else if (t <= 2 * S) {
          kind = 1;
          ts = 2 * S - t;                                     // the lifted part, seen from its back
        }
        if (kind === 2) { out[o + 3] = 0; continue; }
        sampleFrame(F, ts - F.tA, a - F.aA, px);
        if (px[3] <= 0) { out[o + 3] = 0; continue; }
        if (kind === 0) {
          // the curl: opaque, shaded, with a soft highlight
          out[o] = Math.min(255, px[0] * shade + 255 * hi);
          out[o + 1] = Math.min(255, px[1] * shade + 255 * hi);
          out[o + 2] = Math.min(255, px[2] * shade + 255 * hi);
          out[o + 3] = px[3];
        } else {
          // vellum: the picture shows through a paper tint, fully opaque
          var k = 0.45;
          out[o] = px[0] * (1 - k) + 255 * k;
          out[o + 1] = px[1] * (1 - k) + 252 * k;
          out[o + 2] = px[2] * (1 - k) + 244 * k;
          out[o + 3] = 255;                                   // opaque: no see-through patches
        }
      }
    }
    ctx.putImageData(img, Math.round(F.bx0 * dpr), Math.round(F.by0 * dpr));
  }

  // The picture rolls from the press point along the drag, whatever its direction.
  function curl(tile, sid, g, sz, u, S) {
    if (S <= 0.5) return uncurl(tile);
    var img = cutoutImage(window.FS_NATIVE_PLACED && window.FS_NATIVE_PLACED[sid]);
    if (!img) return;
    var page = tile.parentNode;
    var base = tile.querySelector('.stk');
    var canvas = page.querySelector('canvas.peel');
    var dpr = window.devicePixelRatio || 1;
    var PW = page.clientWidth, PH = page.clientHeight;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'peel';
      page.appendChild(canvas);
    }
    canvas.width = Math.round(PW * dpr);
    canvas.height = Math.round(PH * dpr);
    base.style.visibility = 'hidden';
    tile.classList.remove('settle');
    var ox = tile.offsetLeft, oy = tile.offsetTop;
    peelState = {
      tile: tile, canvas: canvas, src: img, u: u, S: S,
      gp: { x: ox + g.x, y: oy + g.y }, ox: ox, oy: oy, W: sz.w, H: sz.h,
      R: Math.max(3, 0.08 * Math.min(sz.w, sz.h)), frame: null,
      PW: PW, PH: PH, dpr: Math.min(dpr, 1.5)
    };
    drawPeel(peelState);
  }

  // Let go before the piece comes away: it goes back flat.
  function uncurl(tile) {
    var page = tile.parentNode;
    var canvas = page && page.querySelector('canvas.peel');
    if (canvas) canvas.remove();
    var base = tile.querySelector('.stk');
    if (base) base.style.visibility = '';
    if (peelState && peelState.tile === tile) peelState = null;
  }

  // True when the point is over the empty spot this sticker came from on the sheet.
  function overSpot(pt, sid) {
    var spot = document.querySelector('.slot[data-sid="' + sid + '"]');
    if (!spot) return false;
    var b = spot.getBoundingClientRect();
    return pt.x >= b.left && pt.x <= b.right && pt.y >= b.top && pt.y <= b.bottom;
  }

  function detachFromSheet(pt) {
    // the piece comes away where the finger has pulled it, so it does not jump
    var r = gesture.tile.getBoundingClientRect();
    var p = toPercent({
      x: r.left + r.width / 2 + (pt.x - gesture.start.x),
      y: r.top + r.height / 2 + (pt.y - gesture.start.y)
    });
    var item = { uid: nextUid++, stickerId: gesture.sid, x: p.x, y: p.y, rot: playfulAngle(), committed: false };
    item.ang = gesture.u ? Math.atan2(gesture.u.y, gesture.u.x) * 180 / Math.PI : 0;
    peelState = null;
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
  }

  function onMove(e) {
    if (!pointers.has(e.pointerId)) return;
    var pt = { x: e.clientX, y: e.clientY };
    pointers.set(e.pointerId, pt);
    if (!gesture) return;
    e.preventDefault();

    if (gesture.kind === 'peel') {
      if (e.pointerId !== gesture.pid) return;
      var dx = pt.x - gesture.start.x, dy = pt.y - gesture.start.y;
      var dd = Math.hypot(dx, dy);                 // progress along the drag, any direction
      var uu = dd > 0.5 ? { x: dx / dd, y: dy / dd } : { x: 1, y: 0 };
      gesture.u = uu;
      curl(gesture.tile, gesture.sid, gesture.grab, gesture.size, uu, Math.min(dd, gesture.pull));
      if (dd < gesture.pull) return;
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
    var pt = { x: e.clientX, y: e.clientY };

    if (gesture.kind === 'peel' && e.pointerId === gesture.pid) {
      // let go before it came away: it springs back onto the sheet
      uncurl(gesture.tile);
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
      var pressed = !gesture.moved && !gesture.fromPeel;      // a press on a floating sticker
      var backOn = gesture.moved && overSpot(pt, item.stickerId); // dragged back onto its own spot
      if (!item.committed && (pressed || backOn)) {
        // it sticks down
        item.committed = true;
        pushUndo(gesture.before);
        renderStage();
        var m = elFor(item.uid);
        if (m) m.classList.add('stick');
        setLast(stickerById[item.stickerId].label + ' (stuck)');
      } else if (gesture.moved || gesture.fromPeel) {
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

  // The sheet picture's width on screen; placed stickers are sized from it.
  function sizePage() {
    var st = $('#stage');
    var w = Math.min(st.clientWidth, st.clientHeight * SHEET.ref.w / SHEET.ref.h);
    st.style.setProperty('--pageW', Math.round(w) + 'px');
  }

  function start() {
    sizePage();
    window.addEventListener('resize', sizePage);
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
