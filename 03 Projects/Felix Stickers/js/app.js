/* Felix Stickers – Creature Lab, first build (0.1.0).
   Plain browser JS, no build. Data: js/sheet.js. Everything stays on the device. */
(function () {
  'use strict';

  var VERSION = '0.1.0';
  // All sheets on the page: Woods, plus any test sheets that were loaded (see js/sheet_select.js).
  var SHEETS = [window.FS_SHEET].concat(window.FS_EXTRA_SHEETS || []);
  var startKey = '';
  try { startKey = (new URLSearchParams(window.location.search).get('sheet') || '').toLowerCase(); } catch (e) { startKey = ''; }
  var sheetIdx = Math.max(0, SHEETS.findIndex(function (s) { return s.key === startKey; }));
  var SHEET = SHEETS[sheetIdx];
  var sheetMemo = {};   // per sheet key: its placed stickers and undo history, kept while you leaf through
  var KEYS = { prefs: 'fs.prefs.v1', creations: 'fs.creations.v1', notes: 'fs.notes.v1' };
  var MAX_UNDO = 50;
  var PEEL_PULL = 0.9;  // a sticker comes away after the finger pulls 90% of its own (shorter) size
  var PEEL_TURN = 180;  // degrees the lifted flap turns over while it is pulled
  var TAP_SLOP = 8;     // px a press may wander and still count as a press

  var stickerById = {};
  function indexStickers() {
    stickerById = {};
    SHEET.stickers.concat([SHEET.main]).forEach(function (s) { stickerById[s.id] = s; });
  }
  indexStickers();

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
  // Two-finger turns are damped for small angles, so a light twist does not spin the sticker.
  // Turn 0–15°: one third (15° gives 5°). 15–45°: a smooth ramp from 5° up to 45°. Past 45°: one to one.
  function fuzzTurn(d) {
    var a = Math.abs(d);
    var out = a < 15 ? a / 3 : (a < 45 ? 5 + (a - 15) * (40 / 30) : a);
    return d < 0 ? -out : out;
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
    var base = nat().base;
    if (base) page.appendChild(el('img', 'base', null)).src = base;
    var W = SHEET.ref.w, H = SHEET.ref.h;
    // Sheets may draw the main body first (mainFirst), so features sit on top of it.
    var order = SHEET.mainFirst ? [SHEET.main].concat(SHEET.stickers) : SHEET.stickers.concat([SHEET.main]);
    order.forEach(function (s) {
      var gone = state.used.indexOf(s.id) !== -1;
      var n = el('div', 'slot' + (s.id === SHEET.main.id ? ' main' : '') + (gone ? ' empty' : '') +
        (gone && lift && lift.sid === s.id ? ' lifted' : ''));
      n.dataset.sid = s.id;
      n.style.left = (s.box.x / W * 100) + '%';
      n.style.top = (s.box.y / H * 100) + '%';
      n.style.width = (s.box.w / W * 100) + '%';
      n.style.height = (s.box.h / H * 100) + '%';
      n.setAttribute('aria-label', gone ? 'Empty space: ' + s.label : 'Sticker: ' + s.label + '. Pull a corner to peel it.');
      if (!gone) n.innerHTML = '<div class="stk">' + artFor(s) + '</div>';
      page.appendChild(n);
    });
    if (lift && lift.canvas && lift.canvas.parentNode) page.appendChild(lift.canvas);
    card.appendChild(page);
  }

  // Art for the current sheet: its own `native` block when it has one (test sheets in private/),
  // otherwise the Woods art in js/native.js.
  function nat() {
    return SHEET.native || { base: window.FS_NATIVE_BASE, art: window.FS_NATIVE_ART, placed: window.FS_NATIVE_PLACED };
  }
  // Native art when provided; otherwise the SVG in sheet.js.
  function artFor(s, placed) {
    var map = placed ? nat().placed : nat().art;
    var src = map && map[s.id];
    return src ? '<img class="art" src="' + src + '" alt="" draggable="false">' : s.svg;
  }

  // A small random tilt, so every placed sticker looks hand-stuck.
  function playfulAngle() { return Math.round((Math.random() * 24 - 12) * 10) / 10; }

  /* ---------- gestures: peel, move, rotate, press ---------- */
  function onTrayDown(e) {
    e.preventDefault();
    if (gesture) return;
    if (lift && lift.phase !== 'lifting') return liftPress(e);
    var tile = e.target.closest && e.target.closest('.slot');
    if (!tile || tile.classList.contains('empty') || lift) return;
    var pt = { x: e.clientX, y: e.clientY };
    pointers.set(e.pointerId, pt);
    var sid = tile.dataset.sid;
    setLast(stickerById[sid].label);
    gesture = { kind: 'peel', pid: e.pointerId, sid: sid, start: pt, pagePress: pageOf(pt),
      before: snapshot(), tile: tile };
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
  // The picture point (x, y) in its own box, mapped to the sheet: it turns by phi about the pivot.
  function mapPic(L, x, y) {
    var c = Math.cos(L.phi), sn = Math.sin(L.phi);
    var Pm = L.Pm || L.Pv;
    var qx = L.Box0.x + x - L.Ta.x, qy = L.Box0.y + y - L.Ta.y;
    return { x: Pm.x + c * qx - sn * qy, y: Pm.y + sn * qx + c * qy };
  }

  // The picture is drawn once into the drag's frame (t along the drag from the pivot, a across it),
  // then read back as pixels.
  function buildFrame(st) {
    var d = st.dpr;
    var ux = st.u.x, uy = st.u.y, nx = -uy, ny = ux;
    function tOf(x, y) {
      var P = mapPic(st, x, y);
      var X = P.x - st.gp.x, Y = P.y - st.gp.y;
      return { t: X * ux + Y * uy, a: X * nx + Y * ny };
    }
    var corners = [[0, 0], [st.W, 0], [st.W, st.H], [0, st.H]];
    var tA = Infinity, tB = -Infinity, aA = Infinity, aB = -Infinity;
    corners.forEach(function (c) {
      var r = tOf(c[0], c[1]);
      tA = Math.min(tA, r.t); tB = Math.max(tB, r.t); aA = Math.min(aA, r.a); aB = Math.max(aB, r.a);
    });
    tA = Math.floor(tA) - 2; aA = Math.floor(aA) - 2;
    var wO = Math.ceil(tB - tA) + 4, hO = Math.ceil(aB - aA) + 4;
    var O = document.createElement('canvas');
    O.width = Math.round(wO * d); O.height = Math.round(hO * d);
    var oc = O.getContext('2d');
    var o = tOf(0, 0), ex = tOf(1, 0), ey = tOf(0, 1);
    oc.setTransform(d * (ex.t - o.t), d * (ex.a - o.a), d * (ey.t - o.t), d * (ey.a - o.a),
      d * (o.t - tA), d * (o.a - aA));
    oc.drawImage(st.src, 0, 0, st.W, st.H);
    var px = oc.getImageData(0, 0, O.width, O.height);
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
          // it is curled, not flat: darker where it leaves the roll, lighter toward its free end,
          // with a soft sheen across the curve
          var q = Math.min(1, Math.max(0, (t - S - R) / Math.max(1, S - R)));
          shade = 0.72 + 0.28 * smooth(q);
          hi = 0.10 * Math.exp(-Math.pow(q - 0.45, 2) / 0.04);
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
          var k = 0.7;
          out[o] = Math.min(255, (px[0] * (1 - k) + 255 * k) * shade + 255 * hi);
          out[o + 1] = Math.min(255, (px[1] * (1 - k) + 252 * k) * shade + 255 * hi);
          out[o + 2] = Math.min(255, (px[2] * (1 - k) + 244 * k) * shade + 255 * hi);
          out[o + 3] = 255;                                   // solid: the back is white, with only a faint picture
        }
      }
    }
    ctx.putImageData(img, Math.round(F.bx0 * dpr), Math.round(F.by0 * dpr));
    if (st.ghost) {
      // dashed footprint where the sticker will sit flat if it is applied here
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = 'rgba(47,59,74,.7)';
      (st.edge || []).forEach(function (q) {
        var P = mapPic(st, q[0] * st.W, q[1] * st.H);
        ctx.fillRect(P.x - 0.7, P.y - 0.7, 1.4, 1.4);
      });
    }
  }

  /* ---- lift (see convo v0.15) ----
     phase 'lifting': the finger peels from the sticker's edge; the roll follows the finger.
     phase 'held':    released; the curl stays where it is, with its dashed outline. For a few
                      seconds a touch slides it about (free move); after that a touch unfurls it.
     phase 'apply':   a touch puts it down from its pivot, at the roll; dragging back past the
                      edge lays it down and it sticks. Letting go early leaves it held, as it is. */
  var lift = null;
  var edgeCache = {};
  // the sticker's own outline: boundary pixels of its picture, thinned into dashes; in box fractions
  function edgePoints(img) {
    var key = img.src;
    if (edgeCache[key]) return edgeCache[key];
    var w = img.naturalWidth, h = img.naturalHeight;
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var cx = c.getContext('2d'); cx.drawImage(img, 0, 0);
    var d = cx.getImageData(0, 0, w, h).data, pts = [];
    function op(x, y) { return x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 110; }
    for (var y = 0; y < h; y += 2) for (var x = 0; x < w; x += 2) {
      if (!op(x, y)) continue;
      if (!op(x - 2, y) || !op(x + 2, y) || !op(x, y - 2) || !op(x, y + 2)) {
        if (((x + y) / 2) % 3 === 0) pts.push([x / w, y / h]);
      }
    }
    edgeCache[key] = pts;
    return pts;
  }

  function pageOf(pt) {
    var r = $('.sheetPage').getBoundingClientRect();
    return { x: pt.x - r.left, y: pt.y - r.top };
  }
  function liftCanvas(L) {
    if (L.canvas && L.canvas.parentNode) return L.canvas;
    var page = $('.sheetPage');
    var dpr = window.devicePixelRatio || 1;
    var c = document.createElement('canvas');
    c.className = 'peel';
    c.width = Math.round(page.clientWidth * dpr);
    c.height = Math.round(page.clientHeight * dpr);
    page.appendChild(c);
    L.canvas = c; L.PW = page.clientWidth; L.PH = page.clientHeight;
    return c;
  }
  function liftDraw(L) {
    liftCanvas(L);
    L.gp = { x: L.Pv.x, y: L.Pv.y };
    L.frame = null;
    drawPeel(L);
  }
  function liftHide(L) {
    if (L.canvas) { L.canvas.remove(); }
  }
  function liftClear() {
    if (lift) liftHide(lift);
    lift = null;
  }
  function liftLen(L) {
    // how far the picture reaches along the drag from the pivot
    var m = 0;
    [[0, 0], [L.W, 0], [L.W, L.H], [0, L.H]].forEach(function (c) {
      var P = mapPic(L, c[0], c[1]);
      m = Math.max(m, (P.x - L.Pv.x) * L.u.x + (P.y - L.Pv.y) * L.u.y);
    });
    return m;
  }

  function startLift(gesture, f) {
    // called once the finger has moved a little from the tray: the edge is the sticker's back edge
    var img = cutoutImage(nat().placed && nat().placed[gesture.sid]);
    if (!img) return null;
    var page = $('.sheetPage');
    var tile = gesture.tile;
    var ox = tile.offsetLeft, oy = tile.offsetTop;
    var W = tile.offsetWidth, H = tile.offsetHeight;
    var u = { x: f.x - gesture.pagePress.x, y: f.y - gesture.pagePress.y };
    var du = Math.hypot(u.x, u.y) || 1; u = { x: u.x / du, y: u.y / du };
    // the back edge of the picture, along the drag: the peel starts there
    var t0 = Infinity;
    [[0, 0], [W, 0], [W, H], [0, H]].forEach(function (c) {
      t0 = Math.min(t0, (ox + c[0]) * u.x + (oy + c[1]) * u.y);
    });
    var pp = gesture.pagePress;
    var E = { x: pp.x - ((pp.x * u.x + pp.y * u.y) - t0) * u.x, y: pp.y - ((pp.x * u.x + pp.y * u.y) - t0) * u.y };
    var L = {
      sid: gesture.sid, src: img, W: W, H: H, Box0: { x: ox, y: oy }, Ta: E, Pv: E, Pm: E, phi: 0,
      uL: u, u: u, S: 0, R: Math.max(3, 0.08 * Math.min(W, H)), phase: 'lifting',
      before: gesture.before, canvas: null, frame: null, ghost: false,
      PW: page.clientWidth, PH: page.clientHeight, dpr: Math.min(window.devicePixelRatio || 1, 1.5)
    };
    L.len = liftLen(L);
    L.edge = edgePoints(img);
    if (state.used.indexOf(gesture.sid) === -1) state.used.push(gesture.sid);
    renderTray();
    return L;
  }

  function updatePeel(L, f) {
    // the roll sits at the finger; the sticker's edge stays where the peel started
    var d = { x: f.x - L.Pv.x, y: f.y - L.Pv.y };
    var r = Math.hypot(d.x, d.y);
    if (r > 4) L.u = { x: d.x / r, y: d.y / r };
    L.len = liftLen(L);
    L.S = clamp(r, 0, L.len);
    liftDraw(L);
  }

  var FREE_MOVE_MS = 1000;   // after it is let go, the curl can be slid about for this long

  function liftPress(e) {
    var pt = { x: e.clientX, y: e.clientY };
    var f = pageOf(pt);
    if (lift.phase === 'held' && Date.now() - (lift.heldAt || 0) < FREE_MOVE_MS) {
      // free move: the curl comes along with the finger, keeping its roll
      var tipC = { x: lift.Pv.x + lift.S * lift.u.x, y: lift.Pv.y + lift.S * lift.u.y };
      gesture = { kind: 'carry', pid: e.pointerId, o: { x: f.x - tipC.x, y: f.y - tipC.y } };
      lift.phase = 'carry';
      lift.ghost = true;
      liftDraw(lift);
      pointers.set(e.pointerId, pt);
      return;
    }
    // after the free move: it is put down from its pivot, at the roll
    var tipA = { x: lift.Pv.x + lift.S * lift.u.x, y: lift.Pv.y + lift.S * lift.u.y };
    // the rolldown turns the sticker about the point it starts from: the roll itself
    var c0 = Math.cos(lift.phi), s0 = Math.sin(lift.phi);
    var dx0 = tipA.x - lift.Pm.x, dy0 = tipA.y - lift.Pm.y;
    lift.Ta = { x: lift.Ta.x + c0 * dx0 + s0 * dy0, y: lift.Ta.y - s0 * dx0 + c0 * dy0 };
    lift.Pm = { x: tipA.x, y: tipA.y };
    gesture = { kind: 'apply', pid: e.pointerId, E: { x: lift.Pv.x, y: lift.Pv.y },
      o: { x: f.x - tipA.x, y: f.y - tipA.y } };
    lift.phase = 'apply';
    lift.ghost = true;
    liftDraw(lift);
    pointers.set(e.pointerId, pt);
  }

  function moveCarry(f) {
    var tip = { x: f.x - gesture.o.x, y: f.y - gesture.o.y };
    lift.Pv = { x: tip.x - lift.S * lift.u.x, y: tip.y - lift.S * lift.u.y };
    lift.Pm = { x: lift.Pv.x, y: lift.Pv.y };
    liftDraw(lift);
  }

  function moveApply(f) {
    var tip = { x: f.x - gesture.o.x, y: f.y - gesture.o.y };
    var E = gesture.E;
    var d = { x: tip.x - E.x, y: tip.y - E.y };
    var r = Math.hypot(d.x, d.y);
    var past = d.x * lift.uL.x + d.y * lift.uL.y <= 0;
    if (past) {
      // past the edge: the rest of the sticker unrolls onto the sheet, then it stays
      lift.Pv = E;
      lift.u = lift.lastU || lift.uL;
      lift.phi = lift.lastPhi || 0;
      lift.S = clamp(lift.lastS || 0, 0, lift.len || 0);
      gesture = null;
      return unrollToStick(lift);
    }
    var uNew = r > 3 ? { x: d.x / r, y: d.y / r } : lift.uL;
    lift.Pv = E;
    lift.u = uNew;
    lift.phi = Math.atan2(uNew.y, uNew.x) - Math.atan2(lift.uL.y, lift.uL.x);
    lift.len = liftLen(lift);
    lift.S = clamp(r, 0, lift.len);
    lift.lastU = uNew; lift.lastPhi = lift.phi; lift.lastS = lift.S;
    liftDraw(lift);
  }

  function unrollToStick(L) {
    if (L.unrolling) return;
    L.unrolling = true;
    var from = L.S, t0 = performance.now(), dur = 320;
    function step(now) {
      var k = Math.min(1, (now - t0) / dur);
      L.S = from * (1 - smooth(k));
      liftDraw(L);
      if (k < 1) requestAnimationFrame(step); else stickLift();
    }
    requestAnimationFrame(step);
  }

  function stickLift() {
    var L = lift;
    var c = mapPic(L, L.W / 2, L.H / 2);
    var sheet = $('.sheetPage').getBoundingClientRect();
    var p = toPercent({ x: sheet.left + c.x, y: sheet.top + c.y });
    var item = { uid: nextUid++, stickerId: L.sid, x: p.x, y: p.y, rot: L.phi * 180 / Math.PI, committed: true };
    liftClear();
    state.placed.push(item);
    gesture = null;
    renderStage();
    var n = elFor(item.uid);
    if (n) n.classList.add('stick');
    pushUndo(L.before);
    renderTray();
    setLast(stickerById[item.stickerId].label + ' (stuck)');
  }

  // True when the point is over the empty spot this sticker came from on the sheet.
  function overSpot(pt, sid) {
    var spot = document.querySelector('.slot[data-sid="' + sid + '"]');
    if (!spot) return false;
    var b = spot.getBoundingClientRect();
    return pt.x >= b.left && pt.x <= b.right && pt.y >= b.top && pt.y <= b.bottom;
  }

  function onMove(e) {
    if (!pointers.has(e.pointerId)) return;
    var pt = { x: e.clientX, y: e.clientY };
    pointers.set(e.pointerId, pt);
    if (!gesture) return;
    e.preventDefault();

    if (gesture.kind === 'peel') {
      if (e.pointerId !== gesture.pid) return;
      var f = pageOf(pt);
      if (!lift) {
        if (dist(gesture.start, pt) < 6) return;
        lift = startLift(gesture, f);
        if (!lift) return;
      }
      updatePeel(lift, f);
      return;
    }
    if (gesture.kind === 'carry' && gesture.pid === e.pointerId) { moveCarry(pageOf(pt)); return; }
    if (gesture.kind === 'apply' && gesture.pid === e.pointerId) { moveApply(pageOf(pt)); return; }

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
      it.rot = gesture.rot0 + fuzzTurn(angleOf(gesture.pids) - gesture.angle0);
      var node = elFor(it.uid);
      if (node) placeStyle(node, it);
    }
  }

  function onUp(e) {
    var wasDown = pointers.delete(e.pointerId);
    if (!gesture || !wasDown) return;
    var pt = { x: e.clientX, y: e.clientY };

    if (gesture.kind === 'peel' && e.pointerId === gesture.pid) {
      if (lift && lift.phase === 'lifting') {
        if (lift.S >= 8) {
          // let go: the curl stays where it is, with its dashed outline; the next touch puts it down
          lift.phase = 'held';
          lift.heldAt = Date.now();
          lift.ghost = true;
          liftDraw(lift);
        } else {
          // only a touch: nothing was lifted
          var before = lift.before;
          liftClear();
          state.used = before.used;
          renderTray();
        }
      }
      gesture = null;
      return;
    }
    if (gesture.kind === 'carry' && gesture.pid === e.pointerId) {
      // let go: it stays where it was put; the free-move window starts again
      if (lift) { lift.phase = 'held'; lift.heldAt = Date.now(); lift.ghost = true; liftDraw(lift); }
      gesture = null;
      return;
    }
    if (gesture.kind === 'apply' && gesture.pid === e.pointerId) {
      // let go before it sticks: it stays as it is, and the next touch carries on from here
      if (lift) { lift.phase = 'held'; lift.heldAt = Date.now(); lift.ghost = true; liftDraw(lift); }
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
    liftClear();
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
    pushFamily('Creation', function () { return FSFamily.saveCreation(c); });
  }

  // When signed in to the family, a copy also goes to the family database. The device copy is always kept first.
  function pushFamily(what, send) {
    if (!(window.FSFamily && FSFamily.signedIn())) return;
    send().then(function () { toast('Also saved to the family'); },
      function (e) { reportError(what + ' not sent to the family: ' + e.message); });
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
    var note = {
      id: 'n' + Date.now(), text: text, item: lastItem, label: SHEET.name, sheetId: SHEET.id,
      version: VERSION, noted_at: new Date().toISOString()
    };
    notes.unshift(note);
    if (store(KEYS.notes, notes)) { box.value = ''; toast('Note saved on this device'); }
    renderNotes();
    pushFamily('Note', function () { return FSFamily.saveNote(note); });
  }

  // Family sign-in panel: sign in or out, and say what the page is connected to.
  function updateFamilyStatus() {
    var st = $('#famStatus');
    if (!st) return;
    if (!window.FSFamily) { st.textContent = 'not set up in this copy'; return; }
    var signed = FSFamily.signedIn();
    $('#famSignedOut').hidden = signed;
    $('#btnFamOut').hidden = !signed;
    st.textContent = 'checking';
    FSFamily.check().then(function (r) {
      st.textContent = r.text;
      if (r.state === 'error') reportError('Family database: ' + r.text);
    });
  }
  function wireFamily() {
    if (!window.FSFamily) return;
    $('#btnFamIn').addEventListener('click', function () {
      var email = $('#famEmail').value.trim(), pass = $('#famPass').value;
      if (!email || !pass) { toast('Type the family email and password'); return; }
      FSFamily.signIn(email, pass).then(function () {
        $('#famPass').value = '';
        toast('Signed in to the family');
        updateFamilyStatus();
      }, function (e) {
        reportError('Sign-in: ' + e.message);
        toast('Could not sign in');
      });
    });
    $('#btnFamOut').addEventListener('click', function () {
      FSFamily.signOut();
      toast('Signed out. Saving on this device only.');
      updateFamilyStatus();
    });
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
    $('#btnPrev').addEventListener('click', function () { goSheet((sheetIdx - 1 + SHEETS.length) % SHEETS.length); });
    $('#btnNext').addEventListener('click', function () { goSheet((sheetIdx + 1) % SHEETS.length); });
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
    wireFamily();
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

  // Leaf through the sheets. Each sheet keeps its own stickers and undo history.
  function updatePager() {
    var pager = $('#pager');
    pager.hidden = SHEETS.length < 2;
    $('#pagerPos').textContent = (sheetIdx + 1) + ' / ' + SHEETS.length;
  }
  function goSheet(i) {
    if (i === sheetIdx || i < 0 || i >= SHEETS.length) return;
    if (gesture || lift) { toast('Put the sticker down first'); return; }
    sheetMemo[SHEET.key] = { state: state, undo: undoStack };
    sheetIdx = i;
    SHEET = SHEETS[i];
    var memo = sheetMemo[SHEET.key];
    state = memo ? memo.state : { placed: [], used: [] };
    undoStack = memo ? memo.undo : [];
    indexStickers();
    $('#title').textContent = 'Felix Stickers – ' + SHEET.name;
    document.title = 'Felix Stickers – ' + SHEET.name;
    sizePage();
    render();
    updateUndo();
    updatePager();
  }

  function start() {
    sizePage();
    window.addEventListener('resize', sizePage);
    $('#title').textContent = 'Felix Stickers – ' + SHEET.name;
    document.title = 'Felix Stickers – ' + SHEET.name;
    updatePager();
    updateFamilyStatus();
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
