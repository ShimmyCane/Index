// Core: the RS namespace, settings, error list, the canvas stage, pointer routing, and the corner-circle gesture.
(function () {
  'use strict';
  var RS = window.RS = {
    version: '0.1.1',
    modes: {},
    order: ['ripples', 'beads', 'pads', 'strings', 'span', 'heat'],
    cur: null,
    curId: '',
    pal: { ink: '#2f2d3d', vanilla: '#fff3d6', peach: '#ffd0b5', mint: '#c6ecd9', sage: '#cfe3c3',
      coral: '#ff9e8a', sun: '#ffe08a', sky: '#bfe3f5', lilac: '#dcc9f0', paper: '#fffdf7' },
  };

  // ---- Settings (one object, saved on this device, always inside try/catch) ----
  var DEFAULTS = { keepGear: false, volume: 0.8, scale: 'penta', sens: 0.5, speed: 'normal',
    strings: 'auto', outlines: false, glide: 'steps', showErrors: false };
  RS.settings = Object.assign({}, DEFAULTS);
  try { Object.assign(RS.settings, JSON.parse(localStorage.getItem('rs.settings') || '{}')); } catch (e) { /* storage blocked */ }
  var setListeners = [];
  RS.set = function (key, value) {
    RS.settings[key] = value;
    try { localStorage.setItem('rs.settings', JSON.stringify(RS.settings)); } catch (e) { /* storage blocked */ }
    setListeners.forEach(function (fn) { try { fn(key, value); } catch (e) { RS.err('Setting handler', e); } });
  };
  RS.onSet = function (fn) { setListeners.push(fn); };
  RS.speed = function () { return { slow: 0.6, normal: 1, fast: 1.6 }[RS.settings.speed] || 1; };

  // ---- Errors: collected here, shown at the bottom only when the toggle in the gear panel is on ----
  RS.errors = [];
  RS.err = function (msg, e) {
    var line = msg + (e ? ': ' + (e.message || e) : '');
    RS.errors.push({ at: new Date().toISOString(), msg: line });
    if (RS.errors.length > 50) RS.errors.shift();
    if (window.console && console.warn) console.warn('[Rhythm Sticks] ' + line);
    if (RS.onErr) RS.onErr();
  };
  window.logError = RS.err;
  window.addEventListener('error', function (ev) { RS.err('Script error', ev.error || ev.message); });
  window.addEventListener('unhandledrejection', function (ev) { RS.err('Unhandled promise', ev.reason); });

  // ---- Mode change callbacks ----
  var modeListeners = [];
  RS.onMode = function (fn) { modeListeners.push(fn); };

  // ---- The stage: one full-screen canvas ----
  var S = RS.stage = { w: 0, h: 0, dpr: 1, canvas: null, g: null };
  function resize() {
    var c = S.canvas;
    S.dpr = Math.min(window.devicePixelRatio || 1, 2);
    S.w = window.innerWidth;
    S.h = window.innerHeight;
    c.width = Math.round(S.w * S.dpr);
    c.height = Math.round(S.h * S.dpr);
    S.g.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
    if (RS.cur && RS.cur.resize) { try { RS.cur.resize(S); } catch (e) { RS.err('Resize', e); } }
  }

  RS.setMode = function (id) {
    if (!RS.modes[id]) return;
    if (RS.cur && RS.cur.stop) { try { RS.cur.stop(); } catch (e) { RS.err('Stop ' + RS.curId, e); } }
    S.g.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
    RS.cur = RS.modes[id];
    RS.curId = id;
    RS._drawErr = false;
    try { RS.cur.start(S); } catch (e) { RS.err('Start ' + id, e); }
    try { localStorage.setItem('rs.last', id); } catch (e) { /* storage blocked */ }
    modeListeners.forEach(function (fn) { try { fn(id); } catch (e) { RS.err('Mode handler', e); } });
  };
  RS.restart = function () { if (RS.curId) RS.setMode(RS.curId); };

  // ---- The circle gesture in the lower-right corner brings the gear back ----
  var CORNER = 120;
  var cornerPts = {};                   // pointerId -> [{x,y}]
  var trail = [];                       // drawn while the stroke is in progress
  var trailFade = 0;
  function inCorner(x, y) { return x > S.w - CORNER && y > S.h - CORNER; }
  function isCircle(pts) {
    if (pts.length < 8) return false;
    var cx = 0, cy = 0;
    pts.forEach(function (p) { cx += p.x; cy += p.y; });
    cx /= pts.length; cy /= pts.length;
    var sum = 0, net = 0, prev = null, rmin = 1e9, rmax = 0;
    pts.forEach(function (p) {
      var a = Math.atan2(p.y - cy, p.x - cx), r = Math.hypot(p.x - cx, p.y - cy);
      rmin = Math.min(rmin, r); rmax = Math.max(rmax, r);
      if (prev !== null) {
        var d = a - prev;
        while (d > Math.PI) d -= 2 * Math.PI;
        while (d < -Math.PI) d += 2 * Math.PI;
        sum += Math.abs(d); net += d;
      }
      prev = a;
    });
    return rmax > 14 && rmax < 220 && rmin > rmax * 0.3 && Math.abs(net) > 1.7 * Math.PI && Math.abs(net) > 0.8 * sum;
  }

  // ---- Pointer routing ----
  var woke = false;
  function pos(e) {
    var r = S.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function onDown(e) {
    var p = pos(e);
    if (!woke) {                         // browsers start audio only after a first touch
      woke = true; RS.touched = true;
      if (RS.audio) RS.audio.wake();
      if (RS.mic && RS.mic.want && RS.mic.state === 'off') RS.mic.start();   // once: browsers that wanted a touch before asking
    }
    try { S.canvas.setPointerCapture(e.pointerId); } catch (err) { /* synthetic events */ }
    if (inCorner(p.x, p.y)) { cornerPts[e.pointerId] = [p]; trail = [p]; trailFade = 1; return; }
    if (RS.cur && RS.cur.down) { try { RS.cur.down(e.pointerId, p.x, p.y, e); } catch (err) { RS.err('Touch', err); } }
  }
  function onMove(e) {
    var p = pos(e);
    if (cornerPts[e.pointerId]) { cornerPts[e.pointerId].push(p); trail.push(p); return; }
    if (RS.cur && RS.cur.move) { try { RS.cur.move(e.pointerId, p.x, p.y, e); } catch (err) { RS.err('Touch', err); } }
  }
  function onUp(e) {
    var p = pos(e);
    var pts = cornerPts[e.pointerId];
    if (pts) {
      delete cornerPts[e.pointerId];
      if (isCircle(pts) && RS.gear) RS.gear.show();
      return;
    }
    if (RS.cur && RS.cur.up) { try { RS.cur.up(e.pointerId, p.x, p.y, e); } catch (err) { RS.err('Touch', err); } }
  }
  RS._isCircle = isCircle;              // for tests

  // ---- Frame loop ----
  var last = 0;
  function frame(ts) {
    requestAnimationFrame(frame);
    var dt = Math.min(0.05, (ts - last) / 1000 || 0.016);
    last = ts;
    var g = S.g;
    if (RS.cur && RS.cur.draw) {
      try { RS.cur.draw(g, S.w, S.h, dt, ts / 1000); }
      catch (e) { if (!RS._drawErr) { RS._drawErr = true; RS.err('Draw ' + RS.curId, e); } }
    }
    g.globalAlpha = 1; g.shadowBlur = 0; g.setLineDash([]);
    if (trail.length > 1) {              // soft trail while a circle is being drawn
      if (!Object.keys(cornerPts).length) trailFade -= dt * 2.5;
      if (trailFade <= 0) { trail = []; }
      else {
        g.save();
        g.globalAlpha = Math.max(0, Math.min(1, trailFade)) * 0.7;
        g.strokeStyle = RS.pal.ink; g.lineWidth = 4; g.lineCap = 'round'; g.lineJoin = 'round';
        g.beginPath();
        trail.forEach(function (q, i) { if (i) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); });
        g.stroke();
        g.restore();
      }
    }
  }

  RS.init = function () {
    S.canvas = document.getElementById('stage');
    S.g = S.canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', function () { setTimeout(resize, 200); });
    S.canvas.addEventListener('pointerdown', onDown);
    S.canvas.addEventListener('pointermove', onMove);
    S.canvas.addEventListener('pointerup', onUp);
    S.canvas.addEventListener('pointercancel', onUp);
    S.canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    requestAnimationFrame(frame);
  };
})();
