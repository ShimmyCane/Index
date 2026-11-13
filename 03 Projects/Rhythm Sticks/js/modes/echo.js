// Mode 7: Echo. A call-and-response game that learns how well you play and never runs far ahead of you.
//   Level 1, tap along: the screen sings a steady beat and you tap with it.
//   Level 2, copy me:   it sings a short rhythm, then you copy it.
//   Level 3, repeat:    it sings the rhythm twice, and you play it twice.
//   Level 4, riff:      you play anything; after a pause it answers with your rhythm changed (same, faster, climbing, one more, backwards).
// Two good rounds in a row move up a level; two poor ones move down. The answers are sung ("ooh"), and the first note is longer.
// Taps and claps (through the microphone) both count. Taps get a soft sound at once.
(function () {
  'use strict';
  var M = RS.modes.echo = { id: 'echo', name: 'Echo', icon: '🗣️', mic: true };
  var S, unsub, level, good, poor, phase, round, hits, lastHit, demo, demoStart, demoEnd, playFrom, playUntil, score, scoreAt, kind, lastKind, pattern, answer, answerStart, answerEnd, waiting, fixed;
  var KINDS = ['same', 'fast', 'up', 'plus', 'rev'];
  var GAP = 1.0;                                            // seconds of quiet before a riff answer

  function now() { return performance.now() / 1000; }
  function loadLevel() { var l = 1; try { l = Math.max(1, Math.min(4, parseInt(localStorage.getItem('rs.echoLevel'), 10) || 1)); } catch (e) { /* storage blocked */ } return l; }
  function saveLevel() { try { localStorage.setItem('rs.echoLevel', String(level)); } catch (e) { /* storage blocked */ } }
  function setting() { var v = RS.settings.echoLevel; return v === 'auto' ? 0 : (parseInt(v, 10) || 0); }
  function step2freq(step) { return RS.audio.mtof(RS.audio.midiFromStep(step, 57)); }

  function resetRound() {
    hits = []; demo = []; demoStart = 0; demoEnd = 0; playFrom = 0; playUntil = 0; score = -1; scoreAt = 0; kind = ''; answer = []; answerStart = 0; answerEnd = 0; pattern = []; waiting = true;
    phase = 'idle'; lastHit = 0;
  }
  M.start = function (stage) {
    S = stage; level = loadLevel(); good = 0; poor = 0; round = 0; lastKind = ''; round = 0; resetRound();
    fixed = setting(); if (fixed) level = fixed;
    RS.mic.start();
    unsub = RS.mic.onOnset(function (s) { hit(s); });
  };
  M.stop = function () { if (unsub) unsub(); unsub = null; RS.mic.stop(); };
  RS.onSet(function (k) { if (k === 'echoLevel' && RS.curId === 'echo') { fixed = setting(); if (fixed) level = fixed; resetRound(); } });

  // ---------- rounds ----------
  function makePattern() {
    var n = level === 1 ? 4 : level === 2 ? 3 + (round % 2) : 4, base = 3 + Math.floor(Math.random() * 3), t = 0, items = [];
    var gaps = level === 1 ? [0.7, 0.7, 0.7] : null;
    for (var i = 0; i < n; i++) {
      items.push({ at: t, step: level === 1 ? base : base + [0, 2, 1, 3, 0][Math.floor(Math.random() * 5)], done: false, pulse: -9 });
      var g = gaps ? gaps[0] : [0.45, 0.7, 0.95][Math.floor(Math.random() * 3)];
      t += g;
    }
    return items;
  }
  function startRound() {
    var t = now();
    pattern = makePattern();
    var reps = level === 3 ? 2 : 1, len = pattern[pattern.length - 1].at + 0.9, items = [];
    for (var r = 0; r < reps; r++) pattern.forEach(function (p) { items.push({ at: p.at + r * (len + 0.2), step: p.step, done: false, pulse: -9, rep: r }); });
    demo = items; demoStart = t + 0.35; demoEnd = demoStart + items[items.length - 1].at + 0.8;
    hits = []; score = -1; waiting = false;
    if (level === 1) { phase = 'along'; playFrom = demoStart - 0.4; playUntil = demoEnd + 0.3; }
    else { phase = 'listen'; playFrom = 0; playUntil = 0; }
  }
  function judge() {
    var n = pattern.length, tol = 0.3, reps = level === 3 ? 2 : 1, sc = 0, total = 0, r, i;
    if (level === 1) {                                         // each beat: was there a tap within a third of a second?
      pattern.forEach(function (p) {
        var bt = demoStart + p.at; total++;
        if (hits.some(function (h) { return Math.abs(h.t - bt) < tol; })) sc++;
      });
      return total ? sc / total : 0;
    }
    for (r = 0; r < reps; r++) {                               // copy: compare the gaps between your taps with the gaps in the rhythm
      var seg = hits.slice(r * n, r * n + n);
      for (i = 1; i < n; i++) {
        total++;
        if (seg.length === n) {
          var want = pattern[i].at - pattern[i - 1].at, got = seg[i].t - seg[i - 1].t;
          if (Math.abs(got - want) <= Math.max(0.18, want * 0.35)) sc++;
        }
      }
    }
    return total ? sc / total : 0;
  }
  function endRound() {
    var t = now();
    score = judge(); scoreAt = t; round++;
    var ok = score >= 0.67;
    if (ok) { good++; poor = 0; RS.audio.bell(step2freq(9), 0.8, 1.2); } else { poor++; good = 0; RS.audio.tick(0.4, 240); }
    if (!fixed) {
      if (good >= 2 && level < 4) { level++; good = 0; saveLevel(); RS.audio.powerup(0.4); }
      else if (poor >= 2 && level > 1) { level--; poor = 0; saveLevel(); }
    }
    phase = 'result';
    M._last = { score: score, level: level, ok: ok };
  }

  // ---------- input ----------
  function hit(strength) {
    var t = now();
    RS.audio.tick(0.5 + 0.5 * strength, 440 + Math.min(6, hits.length) * 30);   // a soft answer right away
    if (level === 4) {
      if (phase === 'answer') resetRound();                    // you can interrupt the answer at any time
      phase = 'riff';
      if (hits.length >= 12) hits.shift();
      hits.push({ t: t, pulse: t }); lastHit = t; return;
    }
    if (phase === 'idle') { startRound(); return; }            // the first touch starts the game and is not counted
    if (phase === 'result') { return; }
    if (phase === 'along' || phase === 'play') { hits.push({ t: t, pulse: t }); lastHit = t; }
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
    answer = items.map(function (it, k) { return { at: it.at, step: it.step, done: false, pulse: -9, long: k === 0 }; });
    answerStart = now() + 0.12; answerEnd = answerStart + answer[answer.length - 1].at + 1.0;
    phase = 'answer';
  }

  // ---------- drawing ----------
  function face(g, x, y, r, col, open, glow, sleepy, sad) {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2);
    g.fillStyle = col;
    if (glow > 0) { g.shadowColor = col; g.shadowBlur = 26 * glow; }
    g.fill(); g.shadowBlur = 0;
    g.strokeStyle = RS.pal.ink; g.lineWidth = 3.5; g.stroke();
    g.fillStyle = RS.pal.ink;
    var ey = y - r * 0.15, ex = r * 0.34;
    if (sleepy) {
      g.lineWidth = 3; g.beginPath(); g.arc(x - ex, ey, r * 0.13, 0.1 * Math.PI, 0.9 * Math.PI); g.stroke();
      g.beginPath(); g.arc(x + ex, ey, r * 0.13, 0.1 * Math.PI, 0.9 * Math.PI); g.stroke();
    } else { g.beginPath(); g.arc(x - ex, ey, r * 0.12, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(x + ex, ey, r * 0.12, 0, Math.PI * 2); g.fill(); }
    g.lineWidth = 3; g.beginPath();
    if (open > 0.15) { g.ellipse(x, y + r * 0.35, r * 0.2, r * (0.08 + 0.2 * open), 0, 0, Math.PI * 2); g.fillStyle = RS.pal.ink; g.fill(); }
    else if (sad) { g.arc(x, y + r * 0.5, r * 0.25, 1.15 * Math.PI, 1.85 * Math.PI); g.stroke(); }
    else { g.arc(x, y + r * 0.2, r * 0.25, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); }
  }

  M.draw = function (g, w, h, dt) {
    var t = now(), i;
    g.fillStyle = RS.pal.vanilla; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(198,236,217,0.35)'; g.fillRect(0, 0, w, h * 0.5);       // the echo's side, above
    var yCall = h * 0.74, yEcho = h * 0.27, R = Math.max(26, Math.min(w, h) * 0.055), x0 = w * 0.12, x1 = w * 0.88;

    // The level, as dots at the top left.
    for (i = 1; i <= 4; i++) {
      g.beginPath(); g.arc(34 + i * 22, 34, 7, 0, Math.PI * 2); g.fillStyle = i <= level ? RS.pal.sun : 'rgba(255,255,255,0.7)'; g.fill();
      g.strokeStyle = RS.pal.ink; g.lineWidth = 2.5; g.globalAlpha = i <= level ? 1 : 0.4; g.stroke(); g.globalAlpha = 1;
    }

    // ---- timing of the round ----
    if (phase === 'listen') {
      demo.forEach(function (d) { if (!d.done && t >= demoStart + d.at) { d.done = true; d.pulse = t; RS.audio.voiceNote(step2freq(d.step), 0.8, d === demo[0] ? 0.8 : 0.4); } });
      if (t > demoEnd) { phase = 'play'; playFrom = t - 0.2; playUntil = t + (demo[demo.length - 1].at + 0.8) * (level === 3 ? 1.4 : 1.6) + 2.5; hits = []; }
    } else if (phase === 'along') {
      demo.forEach(function (d) { if (!d.done && t >= demoStart + d.at) { d.done = true; d.pulse = t; RS.audio.voiceNote(step2freq(d.step), 0.8, 0.45); } });
      if (t > playUntil) endRound();
    } else if (phase === 'play') {
      var need = pattern.length * (level === 3 ? 2 : 1);
      if (hits.length >= need || t > playUntil) endRound();
    } else if (phase === 'result') {
      if (t - scoreAt > 1.6) { resetRound(); if (level !== 4) startRound(); }
    } else if (phase === 'riff') {
      if (hits.length && t - lastHit > GAP) makeAnswer();
    }

    // ---- idle: a sleeping pair invites a touch ----
    if (phase === 'idle') {
      var bob = Math.sin(t * 1.6) * 6;
      face(g, w * 0.5, yCall + bob, R * 1.5, RS.pal.coral, 0, 0.3, true);
      face(g, w * 0.5, yEcho - bob, R * 1.5, RS.pal.mint, 0, 0.3, true);
    }

    // ---- the app's side (above): the rhythm it sings ----
    var list = phase === 'answer' ? answer : demo, base = phase === 'answer' ? answerStart : demoStart;
    if ((phase === 'listen' || phase === 'along' || phase === 'play' || phase === 'result' || phase === 'answer') && list.length) {
      var span = Math.max(1.2, list[list.length - 1].at);
      if (phase === 'answer') {
        for (i = 0; i < answer.length; i++) {
          var it = answer[i];
          if (!it.done && t >= answerStart + it.at) { it.done = true; it.pulse = t; RS.audio.voiceNote(step2freq(it.step), 0.8, it.long ? 0.8 : 0.4); }
        }
        if (t > answerEnd) resetRound();
      }
      list.forEach(function (it) {
        var x = list.length === 1 ? w / 2 : x0 + (x1 - x0) * (it.at / span);
        if (!it.done) { g.globalAlpha = 0.35; face(g, x, yEcho, R * 0.8, RS.pal.mint, 0, 0, true); g.globalAlpha = 1; return; }
        var age = Math.max(0, 1 - (t - it.pulse) / 0.5), col = 'hsl(' + ((it.step * 37) % 360) + ',70%,78%)';
        g.strokeStyle = col; g.lineWidth = 5; g.globalAlpha = age;
        g.beginPath(); g.arc(x, yEcho, R + (1 - age) * 90, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
        face(g, x, yEcho + age * 14, R * (1 + age * 0.4), col, age, age + 0.2, false);
      });
    }

    // ---- your side (below): what you tapped ----
    if (phase === 'riff' || phase === 'along' || phase === 'play' || phase === 'result' || phase === 'listen') {
      var hs = hits;
      if (phase === 'along') {                                  // your taps line up under the beats they belong to
        var spanA = Math.max(1.2, demo[demo.length - 1].at);
        hs.forEach(function (hh) {
          var u = Math.max(-0.08, Math.min(1.08, (hh.t - demoStart) / spanA)), x = x0 + (x1 - x0) * u, age = Math.max(0, 1 - (t - hh.pulse) / 0.35);
          face(g, x, yCall - age * 18, R * (1 + age * 0.35), RS.pal.coral, age, age, false);
        });
      } else {
        var spanH = hs.length > 1 ? Math.max(1.2, hs[hs.length - 1].t - hs[0].t) : 1.2;
        hs.forEach(function (hh, k) {
          var x = hs.length === 1 ? w / 2 : x0 + (x1 - x0) * ((hh.t - hs[0].t) / spanH), age = Math.max(0, 1 - (t - hh.pulse) / 0.35);
          face(g, x, yCall - age * 18, R * (1 + age * 0.35), RS.pal.coral, age, age, false);
        });
      }
    }
    // ---- the result: a happy ring or a gentle shake ----
    if (phase === 'result') {
      var a = Math.max(0, 1 - (t - scoreAt) / 1.4), ok = score >= 0.67;
      g.globalAlpha = a; g.strokeStyle = ok ? '#7fd49a' : RS.pal.coral; g.lineWidth = 7; g.shadowColor = g.strokeStyle; g.shadowBlur = 18;
      g.beginPath(); g.arc(w / 2, h * 0.5, 30 + (1 - a) * 70, 0, Math.PI * 2); g.stroke(); g.shadowBlur = 0;
      if (ok) { g.fillStyle = RS.pal.sun; for (i = 0; i < 6; i++) { var an = (i / 6) * Math.PI * 2 + t; g.beginPath(); g.arc(w / 2 + Math.cos(an) * (50 + (1 - a) * 80), h * 0.5 + Math.sin(an) * (50 + (1 - a) * 80), 7, 0, Math.PI * 2); g.fill(); } }
      g.globalAlpha = 1;
    }
    // A little quiet timer in the riff level: a ring fills as the echo gets ready.
    if (phase === 'riff' && hits.length) {
      var p = Math.min(1, (t - lastHit) / GAP);
      g.strokeStyle = RS.pal.ink; g.lineWidth = 4; g.globalAlpha = 0.5;
      g.beginPath(); g.arc(w / 2, h * 0.5, 16, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); g.stroke(); g.globalAlpha = 1;
    }
    // Microphone mark, lower left.
    var mx = 40, my = h - 46, okm = RS.mic.state === 'on';
    g.strokeStyle = RS.pal.ink; g.lineWidth = 3; g.fillStyle = okm ? RS.pal.mint : RS.pal.peach;
    g.beginPath(); g.rect(mx - 9, my - 18, 18, 28); g.fill(); g.stroke();
    if (!okm) { g.strokeStyle = RS.pal.coral; g.lineWidth = 4; g.beginPath(); g.moveTo(mx - 20, my - 22); g.lineTo(mx + 20, my + 24); g.stroke(); }
  };
  M.info = function () {
    return { level: level, phase: phase, round: round, score: Math.round(score * 100) / 100, good: good, poor: poor, hits: hits ? hits.length : 0, kind: kind,
      answer: answer ? answer.length : 0, played: answer ? answer.filter(function (a) { return a.done; }).length : 0, fixed: fixed,
      pattern: pattern ? pattern.map(function (p) { return Math.round(p.at * 1000) / 1000; }) : [], demoStart: demoStart, demoTimes: demo ? demo.map(function (d) { return d.at; }) : [], last: M._last || null };
  };
  M._setLevel = function (n) { level = n; fixed = 0; good = poor = 0; resetRound(); };
  M.now = now;
})();
