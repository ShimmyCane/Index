// Mode 3: Shake pads. A hidden 3x3 grid. Each pad has a sound drawn from fifteen: drums and shakers, arcade beeps, and other
// interesting sounds. Tap and drag to find them; rattle pads sound as you drag across them. Which sounds sit where comes from a seed
// number (see the gear panel), so a layout you love can be brought back. Dashed outlines in the gear panel show the pads.
(function () {
  'use strict';
  var M = RS.modes.pads = { id: 'pads', name: 'Shake pads', icon: '🪘' };
  var S, cells = [], flash = [], parts = [], touches = {};
  var FAMILY = { shaker: 0, snare: 0, rattle: 0, kick: 0, tom: 0, coin: 1, laser: 1, jump: 1, powerup: 1, blip: 1, wood: 2, tink: 2, cowbell: 2, bubble: 2, whistle: 2 };
  var COL = { shaker: RS.pal.sun, snare: RS.pal.coral, rattle: RS.pal.sky, kick: RS.pal.lilac, tom: RS.pal.peach,
    coin: RS.pal.sun, laser: RS.pal.coral, jump: RS.pal.mint, powerup: RS.pal.lilac, blip: RS.pal.sky,
    wood: RS.pal.peach, tink: RS.pal.sky, cowbell: RS.pal.sun, bubble: RS.pal.mint, whistle: RS.pal.lilac };

  function layout() {
    var rnd = RS.rng(RS.seed), pool = RS.audio.padSounds.slice(), i, j, t;
    for (i = pool.length - 1; i > 0; i--) { j = Math.floor(rnd() * (i + 1)); t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
    cells = pool.slice(0, 9);
    // Every layout has at least one arcade sound and one other interesting sound, so it is never all drums.
    var rest = pool.slice(9);
    [1, 2].forEach(function (f) {
      if (cells.some(function (c) { return FAMILY[c] === f; })) return;
      var pick = rest.filter(function (c) { return FAMILY[c] === f; })[0];
      var counts = [0, 0, 0]; cells.forEach(function (c) { counts[FAMILY[c]]++; });
      var big = counts.indexOf(Math.max(counts[0], counts[1], counts[2]));
      var slot = []; cells.forEach(function (c, k) { if (FAMILY[c] === big) slot.push(k); });
      if (pick && slot.length) cells[slot[Math.floor(rnd() * slot.length)]] = pick;
    });
    flash = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  }
  M.shuffle = function () { RS.setSeed(RS.newSeedNumber()); };
  RS.onSeed(function () { if (RS.curId === 'pads' && S) layout(); });
  M.start = function (stage) { S = stage; parts = []; touches = {}; layout(); };
  M.stop = function () { touches = {}; parts = []; };

  function cellAt(x, y) {
    var c = Math.max(0, Math.min(2, Math.floor(x / S.w * 3))), r = Math.max(0, Math.min(2, Math.floor(y / S.h * 3)));
    return r * 3 + c;
  }
  function burst(i, x, y, n, speed) {
    var col = COL[cells[i]];
    for (var k = 0; k < n; k++) {
      var a = Math.random() * Math.PI * 2, s = (0.3 + Math.random()) * speed;
      parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, col: col, r: 6 + Math.random() * 9, sq: FAMILY[cells[i]] === 1 });
    }
    if (parts.length > 300) parts.splice(0, parts.length - 300);
  }
  function trigger(i, x, y, how, v) {
    var type = cells[i];
    if (type === 'rattle') {
      RS.audio.rattle(how === 'drag' ? v : 0.5); flash[i] = Math.max(flash[i], 0.6); burst(i, x, y, how === 'drag' ? 4 : 6, 160);
    } else {
      RS.audio[type](v); flash[i] = 1; burst(i, x, y, 14, 260);
    }
  }

  M.down = function (id, x, y) {
    var i = cellAt(x, y);
    touches[id] = { cell: i, x: x, y: y, acc: 0 };
    trigger(i, x, y, 'down', 1);
  };
  M.move = function (id, x, y) {
    var t = touches[id];
    if (!t) return;
    var i = cellAt(x, y), d = Math.hypot(x - t.x, y - t.y);
    t.x = x; t.y = y;
    if (i !== t.cell) { t.cell = i; t.acc = 0; trigger(i, x, y, cells[i] === 'rattle' ? 'drag' : 'enter', 0.7); return; }
    if (cells[i] === 'rattle') {
      t.acc += d;
      if (t.acc > 26) { t.acc = 0; trigger(i, x, y, 'drag', Math.min(1, 0.4 + d / 40)); }
    }
  };
  M.up = function (id) { delete touches[id]; };

  function glyph(g, type, cx, cy) {
    g.strokeStyle = RS.pal.ink; g.fillStyle = COL[type]; g.lineWidth = 3;
    var fam = FAMILY[type];
    if (type === 'shaker') { [-22, 0, 22].forEach(function (dx) { g.beginPath(); g.arc(cx + dx, cy + (dx ? 0 : -10), 8, 0, Math.PI * 2); g.fill(); g.stroke(); }); }
    else if (type === 'snare') { g.beginPath(); g.arc(cx, cy, 26, 0, Math.PI * 2); g.fill(); g.stroke(); g.beginPath(); g.arc(cx, cy, 12, 0, Math.PI * 2); g.stroke(); }
    else if (type === 'rattle') { g.beginPath(); g.moveTo(cx - 36, cy); for (var k = 0; k < 6; k++) g.lineTo(cx - 36 + 12 * (k + 1), cy + (k % 2 ? 14 : -14)); g.stroke(); }
    else if (type === 'kick' || type === 'tom') { g.beginPath(); g.arc(cx, cy, type === 'kick' ? 20 : 14, 0, Math.PI * 2); g.fill(); g.stroke(); }
    else if (fam === 1) { g.beginPath(); g.rect(cx - 18, cy - 18, 36, 36); g.fill(); g.stroke(); g.fillStyle = RS.pal.ink; g.fillRect(cx - 8, cy - 8, 8, 8); g.fillRect(cx + 2, cy + 2, 8, 8); }
    else { g.beginPath(); g.moveTo(cx, cy - 24); g.lineTo(cx + 22, cy); g.lineTo(cx, cy + 24); g.lineTo(cx - 22, cy); g.closePath(); g.fill(); g.stroke(); }
  }

  M.draw = function (g, w, h, dt) {
    g.fillStyle = RS.pal.vanilla; g.fillRect(0, 0, w, h);
    var cw = w / 3, ch = h / 3, i;
    for (i = 0; i < 9; i++) {                              // a pad lights up softly after it sounds
      if (flash[i] > 0.01) {
        flash[i] = Math.max(0, flash[i] - dt * 2.2);
        g.globalAlpha = flash[i] * 0.7; g.fillStyle = COL[cells[i]];
        g.fillRect((i % 3) * cw, Math.floor(i / 3) * ch, cw, ch);
        g.globalAlpha = 1;
      }
    }
    if (RS.settings.outlines) {
      g.setLineDash([16, 10]); g.strokeStyle = RS.pal.ink; g.lineWidth = 3; g.globalAlpha = 0.65;
      for (i = 0; i < 9; i++) {
        var x = (i % 3) * cw + 14, y = Math.floor(i / 3) * ch + 14;
        g.beginPath();
        if (g.roundRect) g.roundRect(x, y, cw - 28, ch - 28, 26); else g.rect(x, y, cw - 28, ch - 28);
        g.stroke();
      }
      g.setLineDash([]); g.globalAlpha = 1;
      for (i = 0; i < 9; i++) glyph(g, cells[i], (i % 3) * cw + cw / 2, Math.floor(i / 3) * ch + ch / 2);
    }
    var sp = RS.speed();
    for (i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.life -= dt * 1.4 * sp;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      p.x += p.vx * dt * sp; p.y += p.vy * dt * sp; p.vx *= 0.97; p.vy = p.vy * 0.97 + 60 * dt;
      g.globalAlpha = p.life; g.fillStyle = p.col; g.shadowColor = p.col; g.shadowBlur = 14;
      var r = p.r * (0.5 + p.life * 0.5);
      g.beginPath(); if (p.sq) g.rect(p.x - r, p.y - r, r * 2, r * 2); else g.arc(p.x, p.y, r, 0, Math.PI * 2); g.fill(); g.shadowBlur = 0;
      g.strokeStyle = RS.pal.ink; g.lineWidth = 2.5; g.stroke();
    }
    g.globalAlpha = 1;
  };
  M.info = function () { return { cells: cells.slice(), parts: parts.length, seed: RS.seed }; };
  M.cellCenter = function (i) { return { x: (i % 3 + 0.5) / 3 * S.w, y: (Math.floor(i / 3) + 0.5) / 3 * S.h }; };
})();
