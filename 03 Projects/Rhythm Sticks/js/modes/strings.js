// Mode 4: Strings. Drag a finger across a string to pluck it; the string bounces, exaggerated.
// One string is just plucking. With two or three strings the right side has frets: touch a string there to press it,
// and slide left to raise the pitch.
(function () {
  'use strict';
  var M = RS.modes.strings = { id: 'strings', name: 'Strings', icon: '🎻' };
  var S, strs = [], n = 1, touches = {};
  var TUNING = { 1: [57], 2: [50, 57], 3: [45, 52, 60] };     // low to high; the top string is the highest
  var LADDER = [0, 2, 4, 7, 9, 12];                           // frets 0..5 climb a pentatonic ladder
  var COLS = [RS.pal.coral, RS.pal.sun, RS.pal.mint];
  var FRETS = 5;

  function geom() {
    var left = S.w * 0.07, right = S.w * 0.94, fretStart = S.w * 0.52;
    return { left: left, right: right, fretStart: fretStart, step: (right - fretStart - S.w * 0.04) / FRETS };
  }
  function fretX(f) { var G = geom(); return G.right - f * G.step; }
  function layout() {
    var tun = TUNING[n];
    strs = [];
    for (var k = 0; k < n; k++) {
      strs.push({ y: S.h * (k + 1) / (n + 1), midi: tun[n - 1 - k], amp: 0, t0: 0, fret: 0, color: COLS[k % 3], vis: 8 + k * 2 });
    }
  }
  M.start = function (stage) {
    S = stage; touches = {};
    var pick = RS.settings.strings;
    n = (pick === '1' || pick === '2' || pick === '3') ? +pick : 1 + Math.floor(Math.random() * 3);
    layout();
  };
  M.stop = function () { touches = {}; };
  M.resize = function () { layout(); };

  function pitch(k) { return RS.audio.mtof(strs[k].midi + LADDER[strs[k].fret]); }
  function pluck(k, v) {
    var s = strs[k];
    s.amp = (n === 1 ? Math.min(S.h * 0.16, 120) : Math.min(S.h * 0.09, 64)) * (0.55 + 0.45 * v);
    s.t0 = performance.now() / 1000;
    RS.audio.pluck(pitch(k), 0.5 + 0.5 * v);
  }
  function nearest(y) {
    var best = 0, bd = 1e9;
    strs.forEach(function (s, k) { var d = Math.abs(s.y - y); if (d < bd) { bd = d; best = k; } });
    return best;
  }
  function inFret(x) { return n >= 2 && x >= geom().fretStart; }
  function fretFor(x) { var G = geom(); return Math.max(0, Math.min(FRETS, Math.round((G.right - x) / G.step))); }

  M.down = function (id, x, y) {
    if (inFret(x)) {
      var k = nearest(y);
      strs[k].fret = fretFor(x);
      touches[id] = { mode: 'fret', k: k, x: x, y: y };
      pluck(k, 0.8);
    } else {
      touches[id] = { mode: 'pluck', x: x, y: y };
      var j = nearest(y);
      if (Math.abs(strs[j].y - y) < 36) pluck(j, 0.7);      // a tap on a string also plucks it
    }
  };
  M.move = function (id, x, y) {
    var t = touches[id];
    if (!t) return;
    if (t.mode === 'fret') {
      var k = nearest(y), f = fretFor(x);
      if (k !== t.k) { strs[t.k].fret = 0; t.k = k; strs[k].fret = f; pluck(k, 0.8); }
      else if (f !== strs[k].fret) { strs[k].fret = f; pluck(k, 0.8); }
    } else {
      var G = geom(), speed = Math.min(1, Math.hypot(x - t.x, y - t.y) / 60);
      strs.forEach(function (s, k) {
        if ((t.y < s.y) !== (y < s.y) && x > G.left && x < (n >= 2 ? G.fretStart : G.right)) pluck(k, 0.4 + 0.6 * speed);
      });
    }
    t.x = x; t.y = y;
  };
  M.up = function (id) {
    var t = touches[id];
    if (t && t.mode === 'fret') strs[t.k].fret = 0;
    delete touches[id];
  };

  M.draw = function (g, w, h, dt, ts) {
    var G = geom(), now = performance.now() / 1000;
    g.fillStyle = RS.pal.vanilla; g.fillRect(0, 0, w, h);
    if (n >= 2) {                                           // fret side: a soft tinted zone with fret marks
      g.fillStyle = 'rgba(198,236,217,0.55)';
      g.fillRect(G.fretStart, 0, w - G.fretStart, h);
      g.strokeStyle = RS.pal.ink; g.lineWidth = 3; g.globalAlpha = 0.35;
      strs.forEach(function (s) {
        for (var f = 1; f <= FRETS; f++) { var x = fretX(f); g.beginPath(); g.moveTo(x, s.y - 26); g.lineTo(x, s.y + 26); g.stroke(); }
      });
      g.globalAlpha = 1;
    }
    var sp = RS.speed();
    strs.forEach(function (s, k) {
      var x0 = G.left, x1 = s.fret ? fretX(s.fret) : G.right;
      var a = s.amp * Math.exp(-(now - s.t0) * 1.7 / sp);
      var thick = n === 1 ? 9 : 7;
      g.lineCap = 'round'; g.lineJoin = 'round';
      var draw = function (style, width) {
        g.strokeStyle = style; g.lineWidth = width; g.beginPath();
        if (a > 0.6) {
          var ph = Math.cos(2 * Math.PI * (s.vis + s.fret) * (now - s.t0) * sp);
          for (var x = x0; x <= x1; x += 8) {
            var y = s.y + a * ph * Math.sin(Math.PI * (x - x0) / (x1 - x0));
            if (x === x0) g.moveTo(x, y); else g.lineTo(x, y);
          }
          g.lineTo(x1, s.y);
        } else { g.moveTo(x0, s.y); g.lineTo(x1, s.y); }
        g.stroke();
      };
      draw(RS.pal.ink, thick + 6);
      if (a > 3) { g.shadowColor = s.color; g.shadowBlur = 16; }
      draw(s.color, thick); g.shadowBlur = 0;
      [x0, G.right].forEach(function (x) {                   // bridge and nut
        g.fillStyle = RS.pal.peach; g.beginPath(); g.arc(x, s.y, 13, 0, Math.PI * 2); g.fill();
        g.strokeStyle = RS.pal.ink; g.lineWidth = 3; g.stroke();
      });
      if (s.fret) {                                          // the pressed fret
        g.fillStyle = RS.pal.coral; g.beginPath(); g.arc(x1, s.y, 17, 0, Math.PI * 2); g.fill();
        g.strokeStyle = RS.pal.ink; g.lineWidth = 3.5; g.stroke();
      }
    });
  };
  M.info = function () { return { strings: n, frets: strs.map(function (s) { return s.fret; }), amps: strs.map(function (s) { return Math.round(s.amp); }) }; };
})();
