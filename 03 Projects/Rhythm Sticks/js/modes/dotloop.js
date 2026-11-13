// Mode 9: Dot loop. Two rings of dots and a hand that sweeps around. Tap a dot to wake it: the outer ring cycles
// kick, snare, hat, off; the inner ring is bells that climb. The centre wipes it clean. It starts with two kicks asleep-awake
// so there is something to find. Tempo follows the visual speed setting.
(function () {
  'use strict';
  var M = RS.modes.dotloop = { id: 'dotloop', name: 'Dot loop', icon: '⭕' };
  var S, outer, inner, ang, tot, lastAng, flashes, clearT, bursts;
  var NO = 16, NI = 8, PERIOD = 4;                       // seconds per turn at normal speed
  var DRUMS = ['kick', 'snare', 'hat'], DCOL = [RS.pal.coral, RS.pal.sun, RS.pal.sky];

  function reset(seed) {
    outer = []; inner = [];
    for (var i = 0; i < NO; i++) outer.push(0);
    for (i = 0; i < NI; i++) inner.push(0);
    if (seed) { outer[0] = 1; outer[8] = 1; }
    ang = 0; tot = -0.001; lastAng = -0.001; flashes = {}; bursts = []; clearT = 0;
  }
  M.start = function (stage) { S = stage; reset(true); };
  M.stop = function () {};
  M.clear = function () { reset(false); clearT = performance.now() / 1000; RS.audio.swish(0.8); };

  function geom() { var m = Math.min(S.w, S.h); return { cx: S.w / 2, cy: S.h / 2, ro: m * 0.4, ri: m * 0.24, dr: Math.max(16, m * 0.037), centre: m * 0.08 }; }
  function pos(G, ring, i) { var n = ring === 'o' ? NO : NI, a = -Math.PI / 2 + (i / n) * Math.PI * 2, r = ring === 'o' ? G.ro : G.ri; return { x: G.cx + Math.cos(a) * r, y: G.cy + Math.sin(a) * r, a: a }; }

  function play(ring, i, v) {
    if (ring === 'o') RS.audio[DRUMS[outer[i] - 1]](v);
    else RS.audio.bell(RS.audio.mtof(RS.audio.midiFromStep(i, 57)), v, 0.9);
  }
  M.down = function (id, x, y) {
    var G = geom();
    if (Math.hypot(x - G.cx, y - G.cy) < G.centre) { M.clear(); return; }
    var best = null, bd = 1e9;
    for (var i = 0; i < NO; i++) { var p = pos(G, 'o', i), d = Math.hypot(x - p.x, y - p.y); if (d < bd) { bd = d; best = { ring: 'o', i: i }; } }
    for (i = 0; i < NI; i++) { p = pos(G, 'i', i); d = Math.hypot(x - p.x, y - p.y); if (d < bd) { bd = d; best = { ring: 'i', i: i }; } }
    if (!best || bd > G.dr * 2.4) return;
    if (best.ring === 'o') outer[best.i] = (outer[best.i] + 1) % 4; else inner[best.i] = inner[best.i] ? 0 : 1;
    var on = best.ring === 'o' ? outer[best.i] : inner[best.i];
    if (on) { play(best.ring, best.i, 0.9); }                    // you hear what you just woke, at once
    else RS.audio.tick(0.4, 300);
    var q = pos(G, best.ring, best.i);
    bursts.push({ x: q.x, y: q.y, age: 0, col: best.ring === 'o' ? (DCOL[outer[best.i] - 1] || RS.pal.paper) : RS.pal.mint });
    flashes[best.ring + best.i] = performance.now() / 1000;
  };

  M.draw = function (g, w, h, dt) {
    var t = performance.now() / 1000, G = geom(), i, sp = RS.speed();
    g.fillStyle = RS.pal.vanilla; g.fillRect(0, 0, w, h);
    lastAng = tot;
    tot += dt * sp * (Math.PI * 2 / PERIOD);
    ang = tot % (Math.PI * 2);
    // A dot sounds when the hand crosses it: the turn count of (hand - dot) goes up by one.
    function passed(i, n) { var a = (i / n) * Math.PI * 2, T = Math.PI * 2; return Math.floor((tot - a) / T) > Math.floor((lastAng - a) / T); }
    for (i = 0; i < NO; i++) if (outer[i] && passed(i, NO)) { play('o', i, 0.8); flashes['o' + i] = t; }
    for (i = 0; i < NI; i++) if (inner[i] && passed(i, NI)) { play('i', i, 0.8); flashes['i' + i] = t; }

    // Rings and the centre.
    g.strokeStyle = 'rgba(47,45,61,0.18)'; g.lineWidth = 12; g.lineCap = 'round';
    [G.ro, G.ri].forEach(function (r) { g.beginPath(); g.arc(G.cx, G.cy, r, 0, Math.PI * 2); g.stroke(); });
    var cs = Math.max(0, 1 - (t - clearT) / 0.5);
    g.beginPath(); g.arc(G.cx, G.cy, G.centre * (1 + cs * 0.4), 0, Math.PI * 2);
    g.fillStyle = RS.pal.peach; g.fill(); g.strokeStyle = RS.pal.ink; g.lineWidth = 3.5; g.stroke();
    g.beginPath(); g.moveTo(G.cx - G.centre * 0.4, G.cy - G.centre * 0.2); g.lineTo(G.cx + G.centre * 0.4, G.cy - G.centre * 0.2);
    g.moveTo(G.cx - G.centre * 0.4, G.cy + G.centre * 0.2); g.lineTo(G.cx + G.centre * 0.4, G.cy + G.centre * 0.2); g.stroke();

    // The hand.
    var ha = -Math.PI / 2 + ang;
    g.strokeStyle = RS.pal.ink; g.lineWidth = 5;
    g.beginPath(); g.moveTo(G.cx + Math.cos(ha) * G.centre * 1.2, G.cy + Math.sin(ha) * G.centre * 1.2);
    g.lineTo(G.cx + Math.cos(ha) * (G.ro + G.dr * 1.4), G.cy + Math.sin(ha) * (G.ro + G.dr * 1.4)); g.stroke();

    // Dots.
    function dot(ring, i, on, col) {
      var p = pos(G, ring, i), f = Math.max(0, 1 - (t - (flashes[ring + i] || -9)) / 0.35), r = G.dr * (ring === 'i' ? 0.9 : 0.8) * (1 + f * 0.5);
      g.beginPath(); g.arc(p.x, p.y, r, 0, Math.PI * 2);
      g.fillStyle = on ? col : 'rgba(255,255,255,0.7)';
      if (on) { g.shadowColor = col; g.shadowBlur = 8 + 24 * f; }
      g.fill(); g.shadowBlur = 0;
      g.strokeStyle = RS.pal.ink; g.globalAlpha = on ? 1 : 0.4; g.lineWidth = 3; g.stroke(); g.globalAlpha = 1;
    }
    for (i = 0; i < NO; i++) dot('o', i, outer[i] > 0, DCOL[outer[i] - 1]);
    for (i = 0; i < NI; i++) dot('i', i, inner[i] > 0, 'hsl(' + (150 + i * 28) + ',65%,76%)');
    for (i = bursts.length - 1; i >= 0; i--) {
      var b = bursts[i]; b.age += dt * 2.2;
      if (b.age > 1) { bursts.splice(i, 1); continue; }
      g.globalAlpha = 1 - b.age; g.strokeStyle = b.col; g.lineWidth = 4;
      g.beginPath(); g.arc(b.x, b.y, G.dr + b.age * 50, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
    }
  };
  M.info = function () {
    return { outer: outer.filter(Boolean).length, inner: inner.filter(Boolean).length, angle: Math.round(ang * 100) / 100 };
  };
  M._geom = function () { return geom(); };
  M._pos = function (ring, i) { return pos(geom(), ring, i); };
})();
