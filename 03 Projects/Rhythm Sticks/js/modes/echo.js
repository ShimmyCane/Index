// Mode 7: Echo. Clap or tap a short pattern. After a pause, the screen answers with it, changed:
// the same, faster, climbing, with one beat added, or backwards. Nothing says so; you find out by playing.
(function () {
  'use strict';
  var M = RS.modes.echo = { id: 'echo', name: 'Echo', icon: '🗣️', mic: true };
  var S, unsub, hits, state, lastHit, answer, answerStart, answerEnd, kind, lastKind, born;
  var KINDS = ['same', 'fast', 'up', 'plus', 'rev'];
  var GAP = 1.0;                                          // seconds of quiet before the answer

  function now() { return performance.now() / 1000; }
  function reset() { hits = []; state = 'listen'; lastHit = 0; answer = []; answerStart = 0; answerEnd = 0; kind = ''; born = now(); }

  M.start = function (stage) {
    S = stage; lastKind = ''; reset();
    RS.mic.start();
    unsub = RS.mic.onOnset(function (s) { hit(s); });
  };
  M.stop = function () { if (unsub) unsub(); unsub = null; RS.mic.stop(); };

  function hit(strength) {
    var t = now();
    if (state === 'answer') reset();                       // you can interrupt the answer at any time
    if (hits.length >= 12) hits.shift();
    hits.push({ t: t, v: strength, pulse: t });
    lastHit = t;
    RS.audio.tick(0.5 + 0.5 * strength, 440 + Math.min(6, hits.length) * 30);   // a soft answer right away
  }
  M.down = function () { hit(0.9); };

  function makeAnswer() {
    var t0 = hits[0].t, offs = hits.map(function (h) { return h.t - t0; }), n = offs.length, i;
    var pool = KINDS.filter(function (k) { return k !== lastKind; });
    kind = pool[Math.floor(Math.random() * pool.length)]; lastKind = kind;
    var base = 2 + Math.floor(Math.random() * 3), items = [], avg = n > 1 ? offs[n - 1] / (n - 1) : 0.4;
    if (kind === 'same') offs.forEach(function (o) { items.push({ at: o, step: base }); });
    else if (kind === 'fast') offs.forEach(function (o) { items.push({ at: o * 0.6, step: base + 3 }); });
    else if (kind === 'up') offs.forEach(function (o, k) { items.push({ at: o, step: base + k }); });
    else if (kind === 'plus') { offs.forEach(function (o, k) { items.push({ at: o, step: base + k }); }); items.push({ at: offs[n - 1] + avg, step: base + n + 1 }); }
    else {
      var gaps = []; for (i = 1; i < n; i++) gaps.push(offs[i] - offs[i - 1]);
      gaps.reverse();
      var at = 0; items.push({ at: 0, step: base + n });
      gaps.forEach(function (g, k) { at += g; items.push({ at: at, step: base + n - 1 - k }); });
    }
    answer = items.map(function (it) { return { at: it.at, step: it.step, done: false, pulse: -9 }; });
    answerStart = now() + 0.12;
    answerEnd = answerStart + answer[answer.length - 1].at + 0.9;
    state = 'answer';
  }

  function face(g, x, y, r, col, open, glow, sleepy) {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2);
    g.fillStyle = col;
    if (glow > 0) { g.shadowColor = col; g.shadowBlur = 26 * glow; }
    g.fill(); g.shadowBlur = 0;
    g.strokeStyle = RS.pal.ink; g.lineWidth = 3.5; g.stroke();
    g.fillStyle = RS.pal.ink;
    var ey = y - r * 0.15, ex = r * 0.34;
    if (sleepy) {
      g.lineWidth = 3; g.beginPath();
      g.arc(x - ex, ey, r * 0.13, 0.1 * Math.PI, 0.9 * Math.PI); g.stroke();
      g.beginPath(); g.arc(x + ex, ey, r * 0.13, 0.1 * Math.PI, 0.9 * Math.PI); g.stroke();
    } else {
      g.beginPath(); g.arc(x - ex, ey, r * 0.12, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(x + ex, ey, r * 0.12, 0, Math.PI * 2); g.fill();
    }
    g.lineWidth = 3; g.beginPath();
    if (open > 0.15) { g.ellipse(x, y + r * 0.35, r * 0.2, r * (0.08 + 0.2 * open), 0, 0, Math.PI * 2); g.fillStyle = RS.pal.ink; g.fill(); }
    else { g.arc(x, y + r * 0.2, r * 0.25, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); }
  }

  M.draw = function (g, w, h, dt) {
    var t = now(), i, sp = RS.speed();
    g.fillStyle = RS.pal.vanilla; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(198,236,217,0.35)'; g.fillRect(0, 0, w, h * 0.5);       // the echo's side, above
    var yCall = h * 0.74, yEcho = h * 0.27, R = Math.max(26, Math.min(w, h) * 0.055);

    if (state === 'listen' && hits.length && t - lastHit > GAP) makeAnswer();

    // Waiting: a sleeping pair invites a clap.
    if (!hits.length && state === 'listen') {
      var bob = Math.sin(t * 1.6) * 6;
      face(g, w * 0.5, yCall + bob, R * 1.5, RS.pal.coral, 0, 0.3, true);
      face(g, w * 0.5, yEcho - bob, R * 1.5, RS.pal.mint, 0, 0.3, true);
    }

    // What you did.
    var span = 1.2;
    if (hits.length > 1) span = Math.max(1.2, hits[hits.length - 1].t - hits[0].t);
    var x0 = w * 0.12, x1 = w * 0.88;
    hits.forEach(function (hh) {
      var x = hits.length === 1 ? w / 2 : x0 + (x1 - x0) * ((hh.t - hits[0].t) / span);
      var age = Math.max(0, 1 - (t - hh.pulse) / 0.35);
      face(g, x, yCall - age * 18, R * (1 + age * 0.35), RS.pal.coral, age, age, false);
    });

    // The answer.
    if (state === 'answer') {
      var aspan = Math.max(1.2, answer[answer.length - 1].at);
      for (i = 0; i < answer.length; i++) {
        var it = answer[i];
        if (!it.done && t >= answerStart + it.at) {
          it.done = true; it.pulse = t;
          RS.audio.bell(RS.audio.mtof(RS.audio.midiFromStep(it.step, 60)), 0.8, 0.8);
        }
      }
      answer.forEach(function (it) {
        var x = answer.length === 1 ? w / 2 : x0 + (x1 - x0) * (it.at / aspan);
        if (!it.done) { g.globalAlpha = 0.35; face(g, x, yEcho, R * 0.8, RS.pal.mint, 0, 0, true); g.globalAlpha = 1; return; }
        var age = Math.max(0, 1 - (t - it.pulse) / 0.5), col = 'hsl(' + ((it.step * 37) % 360) + ',70%,78%)';
        g.strokeStyle = col; g.lineWidth = 5; g.globalAlpha = age;
        g.beginPath(); g.arc(x, yEcho, R + (1 - age) * 90, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
        face(g, x, yEcho + age * 14, R * (1 + age * 0.4), col, age, age + 0.2, false);
      });
      if (t > answerEnd) reset();
    }

    // A little quiet timer: a ring fills as the echo gets ready.
    if (state === 'listen' && hits.length) {
      var p = Math.min(1, (t - lastHit) / GAP);
      g.strokeStyle = RS.pal.ink; g.lineWidth = 4; g.globalAlpha = 0.5;
      g.beginPath(); g.arc(w / 2, h * 0.5, 16, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); g.stroke(); g.globalAlpha = 1;
    }
    // Microphone mark, lower left.
    var mx = 40, my = h - 46, ok = RS.mic.state === 'on';
    g.strokeStyle = RS.pal.ink; g.lineWidth = 3; g.fillStyle = ok ? RS.pal.mint : RS.pal.peach;
    g.beginPath(); g.rect(mx - 9, my - 18, 18, 28); g.fill(); g.stroke();
    if (!ok) { g.strokeStyle = RS.pal.coral; g.lineWidth = 4; g.beginPath(); g.moveTo(mx - 20, my - 22); g.lineTo(mx + 20, my + 24); g.stroke(); }
  };
  M.info = function () { return { state: state, hits: hits.length, answer: answer.length, kind: kind, played: answer.filter(function (a) { return a.done; }).length }; };
})();
