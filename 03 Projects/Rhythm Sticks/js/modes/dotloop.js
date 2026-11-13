// Mode 9: Dot loop. Rings of dots, one ring for each sound, and a hand that sweeps round. Tap a dot to switch it on or off.
// A new ring appears only when the one before it has a beat, up to eight. Tap a ring and it slides to the front, large and easy
// to edit, while the others shrink behind it so you can still see them all. The middle circle clears everything.
// Tempo follows the visual speed setting.
(function () {
  'use strict';
  var M = RS.modes.dotloop = { id: 'dotloop', name: 'Dot loop', icon: '⭕' };
  var STEPS = 16, MAXR = 8, PERIOD = 4;                   // dots per ring, rings, seconds per turn at normal speed
  var TRACKS = [
    { name: 'kick', col: RS.pal.coral, play: function (v) { RS.audio.kick(v); } },
    { name: 'snare', col: RS.pal.sun, play: function (v) { RS.audio.snare(v); } },
    { name: 'hat', col: RS.pal.sky, play: function (v) { RS.audio.hat(v); } },
    { name: 'tom', col: RS.pal.lilac, play: function (v) { RS.audio.tom(v); } },
    { name: 'clap', col: RS.pal.peach, play: function (v) { RS.audio.clap(v); } },
    { name: 'click', col: RS.pal.mint, play: function (v) { RS.audio.click(v); } },
    { name: 'low bell', col: '#c9e8a6', play: function (v) { RS.audio.bell(RS.audio.mtof(48), v, 1.0); } },
    { name: 'high bell', col: '#f6c6e0', play: function (v) { RS.audio.bell(RS.audio.mtof(76), v, 0.9); } },
  ];
  var S, rings, sel, tot, lastTot, ang, flashes, bursts, clearT, nVis;

  function reset(seed) {
    rings = TRACKS.map(function (t, k) {
      var on = []; for (var i = 0; i < STEPS; i++) on.push(0);
      return { on: on, slot: k, appear: k === 0 ? 1 : 0 };
    });
    if (seed) { rings[0].on[0] = 1; rings[0].on[8] = 1; }
    sel = 0; tot = -0.001; lastTot = -0.001; ang = 0; flashes = {}; bursts = []; clearT = 0; nVis = 1;
  }
  M.start = function (stage) { S = stage; reset(true); };
  M.stop = function () {};
  M.clear = function () { reset(false); clearT = performance.now() / 1000; RS.audio.swish(0.8); };

  function has(r) { return rings[r].on.some(Boolean); }
  function visibleCount() {
    var n = 1;
    for (var k = 1; k < MAXR; k++) { if (has(k - 1) || has(k)) n = k + 1; else break; }
    return n;
  }
  function geom() {
    var m = Math.min(S.w, S.h), Rsel = m * 0.4, Rc0 = Rsel * 0.8, floor = m * 0.115, n = Math.max(1, nVis);
    var dstep = n > 2 ? Math.min(m * 0.05, (Rc0 - floor) / (n - 2)) : m * 0.05;
    return { cx: S.w / 2, cy: S.h / 2, m: m, Rsel: Rsel, Rc0: Rc0, dstep: dstep, centre: m * 0.07, big: m * 0.036, small: Math.max(5, Math.min(m * 0.016, dstep * 0.38)) };
  }
  function radiusOf(G, slot) { return slot <= 1 ? G.Rsel + (G.Rc0 - G.Rsel) * slot : G.Rc0 - (slot - 1) * G.dstep; }
  function dotR(G, slot) { return G.big + (G.small - G.big) * Math.min(1, slot); }
  function dotPos(G, ring, i) {
    var a = -Math.PI / 2 + (i / STEPS) * Math.PI * 2, r = radiusOf(G, ring.slot);
    return { x: G.cx + Math.cos(a) * r, y: G.cy + Math.sin(a) * r, a: a, r: dotR(G, ring.slot) };
  }
  // Where each ring should be: the selected one in front, the rest behind it in order.
  function targetSlot(k) {
    if (k === sel) return 0;
    var rank = 1;
    for (var j = 0; j < nVis; j++) { if (j === sel || j === k) { if (j === k) break; continue; } rank++; }
    return rank;
  }

  M.down = function (id, x, y) {
    var G = geom();
    if (Math.hypot(x - G.cx, y - G.cy) < G.centre * 1.3) { M.clear(); return; }
    var best = null, bd = 1e9;
    for (var k = 0; k < nVis; k++) {
      for (var i = 0; i < STEPS; i++) {
        var p = dotPos(G, rings[k], i), d = Math.hypot(x - p.x, y - p.y);
        if (d < bd) { bd = d; best = { k: k, i: i, r: p.r }; }
      }
    }
    if (!best || bd > Math.max(best.r * 2.4, 26)) return;
    if (best.k !== sel) {                                       // a tap on a shrunken ring brings it to the front
      sel = best.k; TRACKS[sel].play(0.7);
      var q = dotPos(G, rings[best.k], best.i); bursts.push({ x: q.x, y: q.y, age: 0, col: TRACKS[sel].col });
      return;
    }
    var ring = rings[sel];
    ring.on[best.i] = ring.on[best.i] ? 0 : 1;
    if (ring.on[best.i]) TRACKS[sel].play(0.9); else RS.audio.tick(0.4, 300);   // you hear what you just woke, at once
    var p2 = dotPos(G, ring, best.i);
    bursts.push({ x: p2.x, y: p2.y, age: 0, col: TRACKS[sel].col });
    flashes[sel + ':' + best.i] = performance.now() / 1000;
  };

  M.draw = function (g, w, h, dt) {
    var t = performance.now() / 1000, sp = RS.speed(), i, k;
    nVis = visibleCount();
    if (sel >= nVis) sel = nVis - 1;
    var G = geom();
    g.fillStyle = RS.pal.vanilla; g.fillRect(0, 0, w, h);

    // The hand, and the dots it passes.
    lastTot = tot;
    tot += dt * sp * (Math.PI * 2 / PERIOD);
    ang = tot % (Math.PI * 2);
    var T = Math.PI * 2;
    for (k = 0; k < nVis; k++) {
      for (i = 0; i < STEPS; i++) {
        if (!rings[k].on[i]) continue;
        var a = (i / STEPS) * T;
        if (Math.floor((tot - a) / T) > Math.floor((lastTot - a) / T)) { TRACKS[k].play(k === sel ? 0.85 : 0.7); flashes[k + ':' + i] = t; }
      }
    }

    // Rings slide to their places; a new ring grows in.
    var minSlotChange = 0;
    for (k = 0; k < MAXR; k++) {
      var r = rings[k], vis = k < nVis;
      r.appear += ((vis ? 1 : 0) - r.appear) * Math.min(1, dt * 8);
      var ts = vis ? targetSlot(k) : nVis;
      r.slot += (ts - r.slot) * Math.min(1, dt * 9);
    }
    // Track lines, back to front so the selected ring is on top.
    var order = rings.map(function (r, k) { return k; }).filter(function (k) { return rings[k].appear > 0.02; }).sort(function (a, b) { return rings[b].slot - rings[a].slot; });
    order.forEach(function (k) {
      var r = rings[k], rad = radiusOf(G, r.slot), isSel = k === sel;
      g.globalAlpha = r.appear;
      g.strokeStyle = isSel ? TRACKS[k].col : 'rgba(47,45,61,0.18)'; g.lineWidth = isSel ? 14 : 5; g.lineCap = 'round';
      if (isSel) { g.shadowColor = TRACKS[k].col; g.shadowBlur = 12; }
      g.beginPath(); g.arc(G.cx, G.cy, rad, 0, Math.PI * 2); g.stroke(); g.shadowBlur = 0;
      if (isSel) { g.strokeStyle = 'rgba(47,45,61,0.22)'; g.lineWidth = 3; g.beginPath(); g.arc(G.cx, G.cy, rad + 9, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(G.cx, G.cy, rad - 9, 0, Math.PI * 2); g.stroke(); }
      for (i = 0; i < STEPS; i++) {
        var p = dotPos(G, r, i), on = r.on[i] > 0, f = Math.max(0, 1 - (t - (flashes[k + ':' + i] || -9)) / 0.35), dr = p.r * (1 + f * 0.5);
        g.beginPath(); g.arc(p.x, p.y, dr, 0, Math.PI * 2);
        g.fillStyle = on ? TRACKS[k].col : 'rgba(255,255,255,0.75)';
        if (on) { g.shadowColor = TRACKS[k].col; g.shadowBlur = 6 + 22 * f; }
        g.fill(); g.shadowBlur = 0;
        g.strokeStyle = RS.pal.ink; g.globalAlpha = r.appear * (on ? 1 : (isSel ? 0.5 : 0.3)); g.lineWidth = isSel ? 3 : 2; g.stroke();
        g.globalAlpha = r.appear;
      }
      g.globalAlpha = 1;
    });

    // The middle: clears everything.
    var cs = Math.max(0, 1 - (t - clearT) / 0.5);
    g.beginPath(); g.arc(G.cx, G.cy, G.centre * (1 + cs * 0.4), 0, Math.PI * 2);
    g.fillStyle = RS.pal.peach; g.fill(); g.strokeStyle = RS.pal.ink; g.lineWidth = 3.5; g.stroke();
    g.beginPath(); g.moveTo(G.cx - G.centre * 0.4, G.cy - G.centre * 0.2); g.lineTo(G.cx + G.centre * 0.4, G.cy - G.centre * 0.2);
    g.moveTo(G.cx - G.centre * 0.4, G.cy + G.centre * 0.2); g.lineTo(G.cx + G.centre * 0.4, G.cy + G.centre * 0.2); g.stroke();

    // The hand.
    var ha = -Math.PI / 2 + ang;
    g.strokeStyle = RS.pal.ink; g.lineWidth = 5;
    g.beginPath(); g.moveTo(G.cx + Math.cos(ha) * G.centre * 1.2, G.cy + Math.sin(ha) * G.centre * 1.2);
    g.lineTo(G.cx + Math.cos(ha) * (G.Rsel + G.big * 1.5), G.cy + Math.sin(ha) * (G.Rsel + G.big * 1.5)); g.stroke();

    for (i = bursts.length - 1; i >= 0; i--) {
      var b = bursts[i]; b.age += dt * 2.2;
      if (b.age > 1) { bursts.splice(i, 1); continue; }
      g.globalAlpha = 1 - b.age; g.strokeStyle = b.col; g.lineWidth = 4;
      g.beginPath(); g.arc(b.x, b.y, G.big + b.age * 50, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
    }
  };
  M.info = function () {
    return { visible: nVis, selected: sel, beats: rings ? rings.map(function (r) { return r.on.filter(Boolean).length; }) : [],
      slots: rings ? rings.map(function (r) { return Math.round(r.slot * 100) / 100; }) : [], angle: Math.round(ang * 100) / 100 };
  };
  M._pos = function (k, i) { return dotPos(geom(), rings[k], i); };
  M._select = function (k) { sel = k; };
})();
