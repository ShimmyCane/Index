// Mode 8: Marbles. Tap or drag across the top to drop marbles. They fall through a field of pegs; each peg
// is a bell tuned to a note and glows when a marble strikes it. Drop a few, and a tune falls out of the physics.
(function () {
  'use strict';
  var M = RS.modes.marbles = { id: 'marbles', name: 'Marbles', icon: '🔮' };
  var S, pegs = [], marbles = [], rings = [], held = {}, hits = 0, lastDrop = 0;
  var COLS = [RS.pal.coral, RS.pal.sun, RS.pal.mint, RS.pal.sky, RS.pal.lilac, RS.pal.peach];
  var G = 1000, REST = 0.62;

  function layout() {
    pegs = [];
    var rows = 6, cols = 7, top = S.h * 0.22, bottom = S.h * 0.86;
    var pr = Math.max(14, Math.min(S.w, S.h) * 0.032);
    for (var r = 0; r < rows; r++) {
      var y = top + (bottom - top) * (r / (rows - 1)), off = (r % 2) * 0.5, n = r % 2 ? cols - 1 : cols;
      for (var c = 0; c < n; c++) {
        var x = S.w * ((c + 0.5 + off) / cols);
        pegs.push({ x: x, y: y, r: pr, glow: 0, step: 0, col: COLS[(r + c) % COLS.length] });
      }
    }
    // Low notes on the left, high on the right, with a little rise toward the top.
    pegs.forEach(function (p) {
      var u = p.x / S.w;
      p.midi = RS.audio.midiFromUnit(u, 2, 55);
    });
  }
  M.start = function (stage) { S = stage; marbles = []; rings = []; held = {}; hits = 0; layout(); };
  M.stop = function () { held = {}; marbles = []; };
  M.resize = function () { layout(); };

  function drop(x) {
    if (marbles.length > 28) marbles.shift();
    marbles.push({ x: x, y: S.h * 0.05, vx: (Math.random() - 0.5) * 40, vy: 0, r: Math.max(9, Math.min(S.w, S.h) * 0.02), col: COLS[Math.floor(Math.random() * COLS.length)], life: 0 });
    RS.audio.pop(0.5, 420 + (x / S.w) * 500);                 // a little sound the moment you drop one
    lastDrop = performance.now();
  }
  M.down = function (id, x, y) { held[id] = { x: x }; drop(x); };
  M.move = function (id, x, y) {
    if (!held[id]) return;
    held[id].x = x;
    if (performance.now() - lastDrop > 150) drop(x);
  };
  M.up = function (id) { delete held[id]; };

  M.draw = function (g, w, h, dt) {
    var sp = RS.speed(), steps = 3, i, j, d = dt * sp / steps;
    g.fillStyle = RS.pal.vanilla; g.fillRect(0, 0, w, h);
    // A soft hint of the drop zone along the top.
    g.fillStyle = 'rgba(255,224,138,0.35)'; g.fillRect(0, 0, w, h * 0.1);

    for (var s = 0; s < steps; s++) {
      for (i = marbles.length - 1; i >= 0; i--) {
        var m = marbles[i];
        m.vy += G * d; m.x += m.vx * d; m.y += m.vy * d; m.life += d;
        if (m.x < m.r) { m.x = m.r; m.vx = Math.abs(m.vx) * REST; }
        if (m.x > w - m.r) { m.x = w - m.r; m.vx = -Math.abs(m.vx) * REST; }
        for (j = 0; j < pegs.length; j++) {
          var p = pegs[j], dx = m.x - p.x, dy = m.y - p.y, dist = Math.hypot(dx, dy), min = m.r + p.r;
          if (dist < min && dist > 0.001) {
            var nx = dx / dist, ny = dy / dist, vn = m.vx * nx + m.vy * ny;
            m.x = p.x + nx * min; m.y = p.y + ny * min;
            if (vn < 0) {
              m.vx -= (1 + REST) * vn * nx; m.vy -= (1 + REST) * vn * ny;
              m.vx += (Math.random() - 0.5) * 20;
              var vel = Math.min(1, -vn / 700);
              if (-vn > 60) {
                RS.audio.bell(RS.audio.mtof(p.midi), 0.35 + 0.65 * vel, 0.9);
                p.glow = 1; hits++;
                rings.push({ x: p.x, y: p.y, age: 0, col: p.col });
                if (rings.length > 40) rings.shift();
              }
            }
          }
        }
        if (m.y > h + 40) { marbles.splice(i, 1); }
      }
    }

    // Pegs.
    pegs.forEach(function (p) {
      p.glow = Math.max(0, p.glow - dt * 2.2 * sp);
      var gl = p.glow;
      g.beginPath(); g.arc(p.x, p.y, p.r * (1 + gl * 0.25), 0, Math.PI * 2);
      g.fillStyle = gl > 0.02 ? p.col : 'rgba(255,255,255,0.55)';
      if (gl > 0.02) { g.shadowColor = p.col; g.shadowBlur = 28 * gl; }
      g.fill(); g.shadowBlur = 0;
      g.strokeStyle = RS.pal.ink; g.globalAlpha = 0.45 + 0.55 * gl; g.lineWidth = 3; g.stroke(); g.globalAlpha = 1;
    });
    for (i = rings.length - 1; i >= 0; i--) {
      var r = rings[i]; r.age += dt * 1.8 * sp;
      if (r.age > 1) { rings.splice(i, 1); continue; }
      g.globalAlpha = 1 - r.age; g.strokeStyle = r.col; g.lineWidth = 4; g.shadowColor = r.col; g.shadowBlur = 14;
      g.beginPath(); g.arc(r.x, r.y, 20 + r.age * 70, 0, Math.PI * 2); g.stroke(); g.shadowBlur = 0; g.globalAlpha = 1;
    }
    // Marbles.
    marbles.forEach(function (m) {
      g.beginPath(); g.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      g.fillStyle = m.col; g.shadowColor = m.col; g.shadowBlur = 14; g.fill(); g.shadowBlur = 0;
      g.strokeStyle = RS.pal.ink; g.lineWidth = 3; g.stroke();
      g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.arc(m.x - m.r * 0.3, m.y - m.r * 0.3, m.r * 0.25, 0, Math.PI * 2); g.fill();
    });
    Object.keys(held).forEach(function (id) {                     // a held finger shows where the next marble will fall
      g.strokeStyle = RS.pal.ink; g.lineWidth = 3; g.globalAlpha = 0.5; g.setLineDash([6, 8]);
      g.beginPath(); g.moveTo(held[id].x, h * 0.05); g.lineTo(held[id].x, h * 0.2); g.stroke(); g.setLineDash([]); g.globalAlpha = 1;
    });
  };
  M.info = function () { return { marbles: marbles.length, pegs: pegs.length, hits: hits }; };
  M._dropAt = function (x) { drop(x); };
})();
