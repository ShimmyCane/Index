// Mode 11: Hum trail. Hum or sing and a glowing trail draws the height of your note as a hand sweeps across.
// It makes no sound of its own (the microphone would hear it), only the picture. Hold a steady note and a star appears.
(function () {
  'use strict';
  var M = RS.modes.hum = { id: 'hum', name: 'Hum trail', icon: '🎶', mic: true };
  var S, pts, sweep, lastPt, orb, stars, recent, steady, hz, voiced, raf;
  var FMIN = 80, FMAX = 800;
  var BANDS = [RS.pal.coral, RS.pal.sun, RS.pal.mint, RS.pal.sky, RS.pal.lilac];

  function now() { return performance.now() / 1000; }
  M.start = function (stage) {
    S = stage; pts = []; sweep = 0; lastPt = null; orb = { x: 0, y: stage.h * 0.5, glow: 0 }; stars = []; recent = []; steady = { hz: 0, since: 0, fired: false }; hz = 0; voiced = false;
    RS.mic.start();
  };
  M.stop = function () { RS.mic.stop(); };
  function yOf(f) { return S.h * (0.9 - 0.8 * (Math.log(f / FMIN) / Math.log(FMAX / FMIN))); }

  M.draw = function (g, w, h, dt) {
    var t = now(), sp = RS.speed(), i;
    sweep += dt * sp * w / 9;                                  // nine seconds across
    if (sweep > w) { sweep = 0; lastPt = null; }
    g.fillStyle = RS.pal.vanilla; g.fillRect(0, 0, w, h);
    // Soft bands: five notes, repeating up the screen.
    for (i = 0; i < 10; i++) {
      var y = h * (0.9 - 0.08 * i - 0.08);
      g.fillStyle = BANDS[i % 5]; g.globalAlpha = 0.22; g.fillRect(0, y, w, h * 0.08);
    }
    g.globalAlpha = 1;

    var p = RS.mic.state === 'on' ? RS.mic.pitch() : null;
    voiced = !!(p && p.hz > FMIN && p.hz < FMAX);
    if (voiced) {
      recent.push(p.hz); if (recent.length > 3) recent.shift();
      var sorted = recent.slice().sort(function (a, b) { return a - b; });
      hz = sorted[Math.floor(sorted.length / 2)];
      var yy = yOf(hz);
      orb.x = sweep; orb.y += (yy - orb.y) * Math.min(1, dt * 18);
      var pt = { x: sweep, y: orb.y, born: t, hue: ((Math.log(hz / FMIN) / Math.log(FMAX / FMIN)) * 280) };
      pt.joined = !!lastPt && sweep > lastPt.x;
      pts.push(pt); lastPt = pt;
      if (pts.length > 900) pts.shift();
      if (steady.hz && Math.abs(hz / steady.hz - 1) < 0.035) {
        if (!steady.fired && t - steady.since > 0.45) { steady.fired = true; stars.push({ x: sweep, y: orb.y, age: 0, hue: pt.hue }); if (stars.length > 20) stars.shift(); }
      } else { steady = { hz: hz, since: t, fired: false }; }
      orb.glow = Math.min(1, orb.glow + dt * 6);
    } else {
      recent = []; lastPt = null; steady = { hz: 0, since: 0, fired: false };
      orb.x = sweep; orb.glow = Math.max(0, orb.glow - dt * 3);
    }

    // The trail, fading with age.
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i], age = t - b.born;
      if (!b.joined || age > 9) continue;
      var al = Math.max(0, 1 - age / 9), col = 'hsl(' + b.hue + ',85%,62%)';
      g.globalAlpha = al * 0.7; g.strokeStyle = RS.pal.ink; g.lineWidth = 12;
      g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
      g.globalAlpha = al; g.strokeStyle = col; g.lineWidth = 7; g.shadowColor = col; g.shadowBlur = 14;
      g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); g.shadowBlur = 0;
    }
    g.globalAlpha = 1;
    // The sweep line and the glowing head.
    g.strokeStyle = RS.pal.ink; g.globalAlpha = 0.25; g.lineWidth = 3; g.setLineDash([8, 10]);
    g.beginPath(); g.moveTo(sweep, 0); g.lineTo(sweep, h); g.stroke(); g.setLineDash([]); g.globalAlpha = 1;
    var hc = 'hsl(' + (voiced ? ((Math.log(hz / FMIN) / Math.log(FMAX / FMIN)) * 280) : 40) + ',90%,68%)';
    g.beginPath(); g.arc(orb.x, orb.y, 14 + orb.glow * 8, 0, Math.PI * 2);
    g.fillStyle = voiced ? hc : RS.pal.paper; g.shadowColor = hc; g.shadowBlur = 8 + 30 * orb.glow; g.fill(); g.shadowBlur = 0;
    g.strokeStyle = RS.pal.ink; g.lineWidth = 3.5; g.stroke();
    // Stars for held notes.
    for (i = stars.length - 1; i >= 0; i--) {
      var s = stars[i]; s.age += dt * 0.5;
      if (s.age > 1) { stars.splice(i, 1); continue; }
      var sc = 1 + Math.sin(s.age * Math.PI) * 0.6, r = 16 * sc;
      g.save(); g.translate(s.x, s.y - 34 - s.age * 20); g.rotate(s.age * 2); g.globalAlpha = 1 - s.age;
      g.fillStyle = 'hsl(' + s.hue + ',90%,72%)'; g.shadowColor = g.fillStyle; g.shadowBlur = 16; g.strokeStyle = RS.pal.ink; g.lineWidth = 3;
      g.beginPath();
      for (var k = 0; k < 10; k++) { var rr = k % 2 ? r * 0.45 : r, an = (k / 10) * Math.PI * 2; g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); }
      g.closePath(); g.fill(); g.shadowBlur = 0; g.stroke(); g.restore();
    }
    // Microphone mark, lower left.
    var mx = 40, my = h - 46, ok = RS.mic.state === 'on';
    g.strokeStyle = RS.pal.ink; g.lineWidth = 3; g.fillStyle = ok ? RS.pal.mint : RS.pal.peach;
    g.beginPath(); g.rect(mx - 9, my - 18, 18, 28); g.fill(); g.stroke();
    if (!ok) { g.strokeStyle = RS.pal.coral; g.lineWidth = 4; g.beginPath(); g.moveTo(mx - 20, my - 22); g.lineTo(mx + 20, my + 24); g.stroke(); }
  };
  M.info = function () { return { hz: Math.round(hz), voiced: voiced, points: pts ? pts.length : 0, stars: stars ? stars.length : 0, mic: RS.mic.state }; };
})();
