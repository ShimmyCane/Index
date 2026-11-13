// Mode 10: Footsteps. Tap the left and right halves in turn and a small creature walks at your pace. Tap faster and it
// runs; tap one side twice and it hops; stop and it sits down, then dozes. Flowers grow where its feet land,
// and every fourth step rings a bell that climbs.
(function () {
  'use strict';
  var M = RS.modes.footsteps = { id: 'footsteps', name: 'Footsteps', icon: '🐾' };
  var S, taps, foot, lastSide, lastTap, speed, target, wx, flowers, dust, hop, steps, rate, blink, nextBlink, bellStep;
  var FCOL = [RS.pal.coral, RS.pal.sun, RS.pal.lilac, RS.pal.sky, RS.pal.peach, RS.pal.mint];

  function now() { return performance.now() / 1000; }
  M.start = function (stage) {
    S = stage; taps = []; foot = { L: { lift: 0 }, R: { lift: 0 } }; lastSide = ''; lastTap = 0; speed = 0; target = 0; wx = 0;
    flowers = []; dust = []; hop = 0; steps = 0; rate = 0; blink = 0; nextBlink = now() + 2; bellStep = 0;
  };
  M.stop = function () {};

  M.down = function (id, x, y) {
    var side = x < S.w / 2 ? 'L' : 'R', t = now();
    RS.audio.thud(0.7, side === 'L' ? 105 : 135);                  // the footstep, at once
    var again = side === lastSide && t - lastTap < 0.7;
    if (again) { hop = 1; RS.audio.pop(0.6, 520); }
    foot[side].lift = 1; lastSide = side; lastTap = t; steps++;
    taps.push(t); if (taps.length > 6) taps.shift();
    if (taps.length >= 2) {
      var gaps = [];
      for (var i = 1; i < taps.length; i++) if (taps[i] - taps[i - 1] < 1.4) gaps.push(taps[i] - taps[i - 1]);
      if (gaps.length) { gaps.sort(function (a, b) { return a - b; }); rate = 1 / gaps[Math.floor(gaps.length / 2)]; }
    } else rate = 1.5;
    target = Math.min(rate, 7) * S.w * 0.075;
    if (steps % 4 === 0) { RS.audio.bell(RS.audio.mtof(RS.audio.midiFromStep(bellStep++ % 10 + 2, 60)), 0.7, 0.9); }
    var fx = S.w * 0.35 + (side === 'L' ? -S.w * 0.02 : S.w * 0.02);
    flowers.push({ wx: wx + fx, age: 0, col: FCOL[Math.floor(Math.random() * FCOL.length)], h: 22 + Math.random() * 26 });
    if (flowers.length > 40) flowers.shift();
    if (rate > 4) for (var k = 0; k < 4; k++) dust.push({ wx: wx + fx, y: 0, vx: -60 - Math.random() * 80, vy: -30 - Math.random() * 50, age: 0 });
  };

  function hill(g, w, h, off, amp, base, col, par) {
    g.fillStyle = col; g.beginPath(); g.moveTo(0, h);
    for (var x = 0; x <= w; x += 10) {
      var u = (x + off * par) / 160;
      g.lineTo(x, base - amp * (0.6 * Math.sin(u) + 0.4 * Math.sin(u * 2.3 + 1)));
    }
    g.lineTo(w, h); g.closePath(); g.fill();
    g.strokeStyle = RS.pal.ink; g.globalAlpha = 0.35; g.lineWidth = 3; g.stroke(); g.globalAlpha = 1;
  }

  M.draw = function (g, w, h, dt) {
    var t = now(), sp = RS.speed(), idle = t - lastTap;
    if (idle > 0.9) target = 0;
    speed += (target - speed) * Math.min(1, dt * 5);
    wx += speed * dt * sp;
    hop = Math.max(0, hop - dt * 3.2);
    foot.L.lift = Math.max(0, foot.L.lift - dt * 5); foot.R.lift = Math.max(0, foot.R.lift - dt * 5);

    g.fillStyle = RS.pal.vanilla; g.fillRect(0, 0, w, h);
    var gy = h * 0.74;
    g.fillStyle = RS.pal.sun; g.globalAlpha = 0.5; g.beginPath(); g.arc(w * 0.82, h * 0.18, Math.min(w, h) * 0.07, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
    hill(g, w, h, wx, h * 0.12, h * 0.55, RS.pal.mint, 0.2);
    hill(g, w, h, wx, h * 0.09, h * 0.64, RS.pal.sage, 0.45);
    g.fillStyle = RS.pal.peach; g.fillRect(0, gy, w, h - gy);
    g.strokeStyle = RS.pal.ink; g.lineWidth = 3.5; g.beginPath(); g.moveTo(0, gy); g.lineTo(w, gy); g.stroke();
    g.globalAlpha = 0.35; g.setLineDash([22, 30]); g.lineDashOffset = wx % 52; g.beginPath(); g.moveTo(0, gy + (h - gy) * 0.5); g.lineTo(w, gy + (h - gy) * 0.5); g.stroke(); g.setLineDash([]); g.lineDashOffset = 0; g.globalAlpha = 1;

    // Flowers where the feet landed.
    flowers.forEach(function (f) {
      f.age += dt * 2.5;
      var x = f.wx - wx, grow = Math.min(1, f.age), hh = f.h * grow;
      if (x < -40) return;
      g.strokeStyle = RS.pal.ink; g.lineWidth = 3; g.beginPath(); g.moveTo(x, gy + 8); g.lineTo(x, gy + 8 - hh); g.stroke();
      g.beginPath(); g.arc(x, gy + 8 - hh, 9 * grow, 0, Math.PI * 2); g.fillStyle = f.col; g.fill(); g.stroke();
    });
    for (var i = dust.length - 1; i >= 0; i--) {
      var d = dust[i]; d.age += dt * 2; d.wx += d.vx * dt; d.y += d.vy * dt;
      if (d.age > 1) { dust.splice(i, 1); continue; }
      g.globalAlpha = (1 - d.age) * 0.6; g.fillStyle = RS.pal.paper;
      g.beginPath(); g.arc(d.wx - wx + wx * 0, gy + d.y - 6, 6 + d.age * 8, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
    }

    // The creature.
    var R = Math.min(w, h) * 0.085, cx = w * 0.35, running = rate > 4 && idle < 0.9, walking = speed > 8;
    var phase = wx / (R * 1.2), bounce = walking ? Math.abs(Math.sin(phase)) * R * (running ? 0.28 : 0.14) : 0;
    var sitting = idle > 1.6, dozing = idle > 5;
    var squash = sitting ? 0.82 : 1, by = gy - R * (sitting ? 0.9 : 1.38) - bounce - Math.sin(hop * Math.PI) * R * 1.6;
    // feet
    [['L', -1], ['R', 1]].forEach(function (pr) {
      var side = pr[0], dir = pr[1], lift = Math.sin(foot[side].lift * Math.PI);
      var fx = cx + dir * R * 0.5 + (walking ? Math.sin(phase + (dir > 0 ? Math.PI : 0)) * R * 0.35 : 0);
      var fy = gy - R * 0.2 - lift * R * 0.55;
      g.beginPath(); g.ellipse(fx, fy, R * 0.34, R * 0.2, 0, 0, Math.PI * 2);
      g.fillStyle = RS.pal.sun; g.fill(); g.strokeStyle = RS.pal.ink; g.lineWidth = 3.5; g.stroke();
    });
    g.beginPath(); g.ellipse(cx, by, R * (sitting ? 1.1 : 1), R * squash, 0, 0, Math.PI * 2);
    g.fillStyle = RS.pal.coral; g.shadowColor = RS.pal.coral; g.shadowBlur = running ? 18 : 6; g.fill(); g.shadowBlur = 0;
    g.strokeStyle = RS.pal.ink; g.lineWidth = 4; g.stroke();
    // face
    if (t > nextBlink) { blink = 0.15; nextBlink = t + 2 + Math.random() * 3; }
    blink = Math.max(0, blink - dt);
    var ey = by - R * 0.12, ex = R * 0.34, shut = blink > 0 || dozing;
    g.fillStyle = RS.pal.ink; g.strokeStyle = RS.pal.ink; g.lineWidth = 3;
    if (shut) { g.beginPath(); g.moveTo(cx - ex - 7, ey); g.lineTo(cx - ex + 7, ey); g.moveTo(cx + ex - 7, ey); g.lineTo(cx + ex + 7, ey); g.stroke(); }
    else { g.beginPath(); g.arc(cx - ex, ey, R * 0.1, 0, Math.PI * 2); g.arc(cx + ex, ey, R * 0.1, 0, Math.PI * 2); g.fill(); }
    g.beginPath();
    if (running || hop > 0) { g.ellipse(cx, by + R * 0.3, R * 0.2, R * 0.16, 0, 0, Math.PI * 2); g.fill(); }
    else { g.arc(cx, by + R * 0.12, R * 0.28, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); }
    if (dozing) {                                            // zzz
      g.font = 'bold ' + Math.round(R * 0.6) + 'px "Quicksand", system-ui, sans-serif'; g.fillStyle = RS.pal.ink;
      var zz = (t * 0.8) % 1;
      g.globalAlpha = 1 - zz; g.fillText('z', cx + R * 1.1 + zz * 20, by - R * 0.8 - zz * 30); g.globalAlpha = 1;
    }
    // Left and right halves: a hint that fades, just footprints at the bottom corners.
    var hint = Math.max(0, 1 - steps / 4) * 0.5 + (sitting ? 0.35 : 0);
    if (hint > 0.02) {
      g.globalAlpha = hint; g.fillStyle = RS.pal.ink;
      [w * 0.25, w * 0.75].forEach(function (x, k) {
        g.beginPath(); g.ellipse(x, h * 0.92, R * 0.28, R * 0.42, k ? 0.2 : -0.2, 0, Math.PI * 2); g.fill();
      });
      g.globalAlpha = 1;
    }
  };
  M.info = function () { return { steps: steps, rate: Math.round(rate * 10) / 10, speed: Math.round(speed), x: Math.round(wx), flowers: flowers.length, state: (now() - lastTap > 1.6) ? 'sitting' : (rate > 4 ? 'running' : 'walking') }; };
})();
