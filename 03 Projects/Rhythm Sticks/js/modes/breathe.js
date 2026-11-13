// Hidden mode: the breathing garden. It listens for the sound of your breath (or a held finger, which means "breathing out")
// and the longer and steadier your breaths, the calmer the garden gets. Three gardens:
//   Sand rake:  a long breath out draws a rake through the sand in a spiral around the stones.
//   Fountain:   a long breath out fills a bamboo spout until it tips with a knock and rings the pond. The spout asks a little more each time.
//   Blossom:    a bonsai breathes with a pacer that slowly lengthens; stay with it and the tree blooms.
// Not a medical tool. It hears breath sounds only; a quiet nose breath may not register, so the pacer and the finger always work.
(function () {
  'use strict';
  var M = RS.modes.breathe = { id: 'breathe', name: 'Breathing garden', icon: '🌿', mic: true, hidden: true };
  var S, kind = 'sand', calm = 0, stars = [], best = 0, session = { exhales: [], longest: 0 };
  var sense, touching = {}, ignoreUntil = 0;
  var sand, fountain, blossom;

  function now() { return performance.now() / 1000; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }

  // ---- Sensing: breath sound present? out or in? ----
  function resetSense() {
    sense = { floor: 0.002, sm: 0, active: false, start: 0, lastLoud: 0, ratio: 0.5, type: '', last: 'in', out: false, outStart: 0, outT: 0, lastLen: 0, src: 'mic', completed: null };
  }
  function updateSense(dt, t) {
    var an = RS.mic.analyser, anyTouch = Object.keys(touching).length > 0, active = false, fromTouch = anyTouch;
    if (an && RS.mic.state === 'on' && t > ignoreUntil) {
      var lvl = RS.mic.level, fd = RS.mic.freqData, bh = an.context.sampleRate / an.fftSize;
      sense.sm += (lvl - sense.sm) * Math.min(1, dt * 12);
      var kLow = Math.floor(500 / bh), kHi = Math.floor(3500 / bh), lo = 0, mid = 0, k;
      for (k = 1; k <= kHi && k < fd.length; k++) { var v = fd[k] / 255; if (k <= kLow) lo += v * v; else mid += v * v; }
      sense.ratio += ((lo / (lo + mid + 1e-6)) - sense.ratio) * Math.min(1, dt * 6);
      var s = RS.settings.sens, onT = sense.floor * (2.8 - 1.4 * s) + 0.003 + 0.006 * (1 - s), offT = onT * 0.7;
      active = sense.active ? sense.sm > offT : sense.sm > onT;
      if (!active && !sense.active) sense.floor += (sense.sm - sense.floor) * Math.min(1, dt * 0.8);   // learn the room when quiet
      if (active) sense.lastLoud = t;
      if (sense.active && !active && t - sense.lastLoud < 0.22) active = true;                          // a short dip is not the end of a breath
    } else if (t <= ignoreUntil) { active = sense.active; }
    if (active && !sense.active) { sense.active = true; sense.start = t; sense.type = ''; }
    if (sense.active && active && !sense.type && t - sense.start > 0.3) {
      // Classify: a breath out is warmer (more low sound); a breath in is hissier. If unsure, they take turns.
      sense.type = sense.ratio > 0.62 ? 'out' : sense.ratio < 0.35 ? 'in' : (sense.last === 'in' ? 'out' : 'in');
    }
    if (!active && sense.active) {
      sense.active = false;
      var len = t - sense.start - 0.2;
      if (sense.type) { sense.last = sense.type; if (sense.type === 'out' && len > 0.4 && !fromTouch) sense.completed = { len: len, at: t, src: 'mic' }; }
    }
    var wasOut = sense.out;
    sense.out = fromTouch || (sense.active && sense.type === 'out');
    sense.src = fromTouch ? 'touch' : 'mic';
    if (sense.out && !wasOut) { sense.outStart = fromTouch ? t : sense.start; sense.outSrc = fromTouch ? 'touch' : 'mic'; }
    sense.outT = sense.out ? t - sense.outStart : 0;
    if (!sense.out && wasOut && sense.outSrc === 'touch') sense.completed = { len: t - sense.outStart, at: t, src: 'touch' };
  }
  function takeCompleted() { var c = sense.completed; sense.completed = null; return c; }
  function exhaleEnded(len) {
    if (len < 0.6) return;
    session.exhales.push(len); if (session.exhales.length > 12) session.exhales.shift();
    session.longest = Math.max(session.longest, len);
    if (len > best) { best = len; try { localStorage.setItem('rs.breathBest', String(Math.round(best * 10) / 10)); } catch (e) { /* storage blocked */ } }
  }
  function avgLast(n) { var a = session.exhales.slice(-n); return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : 0; }
  function chime(step, v) { ignoreUntil = now() + 0.9; RS.audio.bell(RS.audio.mtof(RS.audio.midiFromStep(step, 52)), v == null ? 0.6 : v, 1.6); }

  M.start = function (stage) {
    S = stage; kind = RS.settings.garden || 'sand'; calm = 0; touching = {}; ignoreUntil = 0;
    session = { exhales: [], longest: 0 };
    try { best = parseFloat(localStorage.getItem('rs.breathBest') || '0') || 0; } catch (e) { best = 0; }
    stars = [3, 5, 7, 9, 11].map(function (sec) { return { sec: sec, lit: 0 }; });
    resetSense(); build();
    RS.mic.start();
  };
  M.stop = function () { RS.mic.stop(); touching = {}; };
  M.resize = function () { build(); };
  M.setKind = function (k) { kind = k; build(); };
  RS.onSet(function (key, v) { if (key === 'garden' && RS.curId === 'breathe') M.setKind(v); });
  M.down = function (id) { touching[id] = true; };
  M.up = function (id) { delete touching[id]; };

  function build() { if (!S) return; if (kind === 'fountain') buildFountain(); else if (kind === 'blossom') buildBlossom(); else buildSand(); }

  // ---- Sky, hills and the little meters shared by all three gardens ----
  function sky(g, w, h) {
    var gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, 'hsl(' + lerp(265, 195, calm) + ',' + lerp(45, 60, calm) + '%,' + lerp(86, 90, calm) + '%)');
    gr.addColorStop(1, 'hsl(' + lerp(20, 50, calm) + ',' + lerp(80, 85, calm) + '%,' + lerp(88, 93, calm) + '%)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    var sx = w * lerp(0.12, 0.8, calm), sy = h * lerp(0.28, 0.14, calm), sr = Math.min(w, h) * lerp(0.05, 0.075, calm);
    g.fillStyle = 'hsl(' + lerp(30, 48, calm) + ',95%,75%)'; g.shadowColor = g.fillStyle; g.shadowBlur = 30 + 40 * calm;
    g.beginPath(); g.arc(sx, sy, sr, 0, Math.PI * 2); g.fill(); g.shadowBlur = 0;
    g.strokeStyle = RS.pal.ink; g.lineWidth = 3; g.globalAlpha = 0.5; g.stroke(); g.globalAlpha = 1;
  }
  function hills(g, w, h, base) {
    [[0.1, RS.pal.lilac, 0.0], [0.07, RS.pal.mint, 1.7]].forEach(function (L, i) {
      g.fillStyle = L[1]; g.globalAlpha = 0.8; g.beginPath(); g.moveTo(0, h);
      for (var x = 0; x <= w; x += 12) g.lineTo(x, base - h * L[0] * (0.6 + 0.4 * Math.sin(x / (w * 0.18) + L[2])) - i * 14);
      g.lineTo(w, h); g.closePath(); g.fill(); g.globalAlpha = 0.35; g.strokeStyle = RS.pal.ink; g.lineWidth = 3; g.stroke(); g.globalAlpha = 1;
    });
  }
  function meters(g, w, h, t) {
    // Stars: one lights for each breath out of 3, 5, 7, 9 and 11 seconds this visit.
    var n = stars.length, x0 = w / 2 - (n - 1) * 24;
    stars.forEach(function (st, i) {
      var lit = session.longest >= st.sec ? 1 : 0;
      st.lit += (lit - st.lit) * 0.1;
      var x = x0 + i * 48, y = 34, r = 14 + st.lit * 3;
      g.save(); g.translate(x, y); g.globalAlpha = 0.3 + 0.7 * st.lit;
      g.fillStyle = st.lit > 0.5 ? RS.pal.sun : RS.pal.paper; if (st.lit > 0.5) { g.shadowColor = RS.pal.sun; g.shadowBlur = 14; }
      g.strokeStyle = RS.pal.ink; g.lineWidth = 3; g.beginPath();
      for (var k = 0; k < 10; k++) { var rr = k % 2 ? r * 0.45 : r, an = (k / 10) * Math.PI * 2 - Math.PI / 2; g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); }
      g.closePath(); g.fill(); g.shadowBlur = 0; g.stroke(); g.restore();
    });
    // The breath arc: fills while you breathe out, and shows 12 seconds all the way round.
    var cx = w - 60, cy = h - 150, R = 24;
    g.lineCap = 'round'; g.lineWidth = 7; g.strokeStyle = 'rgba(47,45,61,0.18)';
    g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
    if (sense.out) {
      g.strokeStyle = RS.pal.coral; g.beginPath(); g.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + clamp(sense.outT / 12, 0, 1) * Math.PI * 2); g.stroke();
    }
    // Microphone mark.
    var mx = 40, my = h - 46, ok = RS.mic.state === 'on';
    g.strokeStyle = RS.pal.ink; g.lineWidth = 3; g.fillStyle = ok ? RS.pal.mint : RS.pal.peach;
    g.beginPath(); g.rect(mx - 9, my - 18, 18, 28); g.fill(); g.stroke();
    if (!ok) { g.strokeStyle = RS.pal.coral; g.lineWidth = 4; g.beginPath(); g.moveTo(mx - 20, my - 22); g.lineTo(mx + 20, my + 24); g.stroke(); }
    if (sense.active) { g.fillStyle = RS.pal.coral; g.beginPath(); g.arc(mx + 24, my - 16, 5, 0, Math.PI * 2); g.fill(); }
  }
  function petals(list, g, w, h, dt) {
    for (var i = list.length - 1; i >= 0; i--) {
      var p = list[i]; p.age += dt * 0.35; p.x += p.vx * dt + Math.sin(p.age * 6 + p.ph) * 14 * dt; p.y += p.vy * dt;
      if (p.age > 1 || p.y > h) { list.splice(i, 1); continue; }
      g.save(); g.translate(p.x, p.y); g.rotate(p.age * 5 + p.ph); g.globalAlpha = 1 - p.age * 0.6;
      g.fillStyle = p.col; g.beginPath(); g.ellipse(0, 0, 7, 4, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = RS.pal.ink; g.lineWidth = 1.5; g.stroke(); g.restore();
    }
  }
  function spawnPetals(list, x, y, n, col) {
    for (var i = 0; i < n; i++) list.push({ x: x + (Math.random() - 0.5) * 60, y: y + (Math.random() - 0.5) * 30, vx: (Math.random() - 0.5) * 50, vy: 20 + Math.random() * 40, age: 0, ph: Math.random() * 6, col: col || [RS.pal.coral, RS.pal.peach, RS.pal.lilac][i % 3] });
    if (list.length > 120) list.splice(0, list.length - 120);
  }

  // ======================= Sand rake =======================
  function buildSand() {
    var d = Math.min(window.devicePixelRatio || 1, 2), c = document.createElement('canvas');
    c.width = Math.round(S.w * d); c.height = Math.round(S.h * d);
    var m = Math.min(S.w, S.h);
    sand = { c: c, g: c.getContext('2d'), d: d, s: 0, theta: 0, cx: S.w * 0.5, cy: S.h * 0.55, r0: m * 0.1, pos: null, heading: 0, lift: 1, petals: [], rings: [], marks: [0, 0, 0, 0],
      stones: [{ x: S.w * 0.5, y: S.h * 0.55, r: m * 0.085 }, { x: S.w * 0.22, y: S.h * 0.7, r: m * 0.05 }, { x: S.w * 0.8, y: S.h * 0.42, r: m * 0.06 }] };
    sand.g.scale(d, d);
    smooth();
  }
  function smooth() {
    var g = sand.g, w = S.w, h = S.h;
    g.fillStyle = '#fbf0d4'; g.fillRect(0, 0, w, h);
    g.globalAlpha = 0.05; g.fillStyle = RS.pal.ink;
    for (var i = 0; i < 900; i++) g.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    g.globalAlpha = 1; sand.pos = null;
  }
  function sandPoint(s) {
    var a = 38 / (2 * Math.PI), th = sand.theta, r = sand.r0 + a * th;
    return { x: sand.cx + Math.cos(th) * r, y: sand.cy + Math.sin(th) * r * 0.8, r: r };
  }
  function nearStone(x, y) { return sand.stones.some(function (s) { return Math.hypot(x - s.x, y - s.y) < s.r + 10; }); }
  function sandUpdate(dt, t) {
    var g = sand.g, sp = (90 + 50 * calm) * RS.speed();
    sand.lift += ((sense.out ? 0 : 1) - sand.lift) * Math.min(1, dt * 8);
    if (sense.out) {
      var p0 = sandPoint(), ds = sp * dt, rr = Math.max(40, p0.r);
      sand.theta += ds / rr; sand.s += ds;
      var p1 = sandPoint(), hx = p1.x - p0.x, hy = p1.y - p0.y, hl = Math.hypot(hx, hy) || 1, nx = -hy / hl, ny = hx / hl;
      sand.heading = Math.atan2(hy, hx);
      if (p1.r > Math.min(S.w, S.h) * 0.52) { sand.theta = 0; sand.cx = S.w * (0.3 + 0.4 * Math.random()); sand.cy = S.h * (0.4 + 0.3 * Math.random()); sand.r0 = Math.min(S.w, S.h) * 0.08; smooth(); }
      else if (sand.pos) {
        for (var k = -2; k <= 2; k++) {
          var ax = sand.pos.x + nx * k * 7, ay = sand.pos.y + ny * k * 7, bx = p1.x + nx * k * 7, by = p1.y + ny * k * 7;
          if (nearStone(ax, ay) || nearStone(bx, by)) continue;
          g.lineCap = 'round'; g.strokeStyle = 'rgba(47,45,61,0.28)'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
          g.strokeStyle = 'rgba(255,253,247,0.9)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(ax + 2, ay + 1.5); g.lineTo(bx + 2, by + 1.5); g.stroke();
        }
      }
      sand.pos = p1;
      sand.marks.forEach(function (m, i) {                       // bells as the breath gets longer
        var need = [4, 6, 8, 10][i];
        if (!m && sense.outT >= need) { sand.marks[i] = 1; chime(i * 2, 0.5 + 0.1 * i); }
      });
    } else { if (sand.marks.some(Boolean)) { sand.marks = [0, 0, 0, 0]; } sand.pos = null; }
  }
  function sandDraw(g, w, h, dt, t) {
    sky(g, w, h); hills(g, w, h, h * 0.38);
    g.drawImage(sand.c, 0, h * 0.34 * sand.d, w * sand.d, h * 0.66 * sand.d, 0, h * 0.34, w, h * 0.66);          // the sand below the hills
    g.strokeStyle = RS.pal.ink; g.lineWidth = 3.5; g.beginPath(); g.moveTo(0, h * 0.34); g.lineTo(w, h * 0.34); g.stroke();
    // Stones with a soft ring around them that deepens with calm.
    sand.stones.forEach(function (s, i) {
      g.strokeStyle = 'rgba(47,45,61,' + (0.1 + 0.2 * calm) + ')'; g.lineWidth = 3;
      for (var k = 1; k <= 2; k++) { g.beginPath(); g.ellipse(s.x, s.y + s.r * 0.25, s.r * (1 + k * 0.45), s.r * (0.55 + k * 0.25), 0, 0, Math.PI * 2); g.stroke(); }
      g.beginPath(); g.ellipse(s.x, s.y, s.r, s.r * 0.78, 0, 0, Math.PI * 2);
      g.fillStyle = i === 0 ? '#cfd2e6' : '#d9e4cf'; g.fill(); g.lineWidth = 4; g.strokeStyle = RS.pal.ink; g.stroke();
      g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.ellipse(s.x - s.r * 0.25, s.y - s.r * 0.25, s.r * 0.3, s.r * 0.16, -0.5, 0, Math.PI * 2); g.fill();
    });
    // The rake, hovering when you breathe in.
    if (sand.pos || sand.lift > 0.05) {
      var p = sand.pos || sandPoint(), a = sand.heading, lift = sand.lift * 14;
      g.save(); g.translate(p.x, p.y - lift); g.rotate(a);
      g.fillStyle = RS.pal.sun; g.strokeStyle = RS.pal.ink; g.lineWidth = 3.5;
      g.beginPath(); g.rect(-5, -17, 10, 34); g.fill(); g.stroke();
      for (var k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(-5, k * 7); g.lineTo(-13, k * 7); g.stroke(); }
      g.restore();
      if (sand.lift > 0.2) { g.fillStyle = 'rgba(47,45,61,0.12)'; g.beginPath(); g.ellipse(p.x, p.y + 6, 12, 5, 0, 0, Math.PI * 2); g.fill(); }
    }
    petals(sand.petals, g, w, h, dt);
  }
  function sandEnded(len) { if (len >= 6) spawnPetals(sand.petals, sand.stones[0].x, sand.stones[0].y - sand.stones[0].r, 6 + Math.round(len), null); }

  // ======================= Fountain =======================
  function buildFountain() {
    fountain = { fill: 0, T: 5, tip: 0, tipping: false, drops: [], ripples: [], lilies: 0, flies: [], petals: [], tips: 0, level: 0 };
  }
  function fountainUpdate(dt, t) {
    var f = fountain;
    if (f.tipping) {
      f.tip += dt / 1.3;
      if (f.tip >= 1) { f.tipping = false; f.tip = 0; f.fill = 0; }
    } else if (sense.out) {
      f.fill += dt / f.T;
      if (Math.random() < dt * 40) f.drops.push({ x: S.w * 0.37 - 30 + Math.random() * 6, y: S.h * 0.28 + 14, vy: 40, kind: 0 });
      if (f.fill >= 1) {
        f.fill = 1; f.tipping = true; f.tip = 0; f.tips++;
        f.T = Math.min(12, f.T + 0.75);
        RS.audio.tick(1, 190); RS.audio.thud(0.6, 150); ignoreUntil = t + 0.9;       // the knock
        var px = S.w * 0.45, py = S.h * 0.78;
        for (var i = 0; i < 3; i++) f.ripples.push({ x: px + (i - 1) * 40, y: py, age: -i * 0.15 });
        calm = Math.min(1, calm + 0.12);
        f.lilies = Math.min(9, f.lilies + 1);
        setTimeout(function () { chime(f.tips % 5 * 2, 0.7); }, 200);
        for (var k = 0; k < 8; k++) f.drops.push({ x: S.w * 0.42 + Math.random() * 30, y: S.h * 0.5, vy: 80 + Math.random() * 120, kind: 1 });
      }
    } else { f.fill = Math.max(0, f.fill - dt * 0.05); }
  }
  function fountainDraw(g, w, h, dt, t) {
    var f = fountain;
    sky(g, w, h); hills(g, w, h, h * 0.55);
    // The pond.
    var py = h * 0.66;
    var gr = g.createLinearGradient(0, py, 0, h); gr.addColorStop(0, '#bfe3f5'); gr.addColorStop(1, '#a9d4ea');
    g.fillStyle = gr; g.fillRect(0, py, w, h - py);
    g.strokeStyle = RS.pal.ink; g.lineWidth = 3.5; g.beginPath(); g.moveTo(0, py); g.lineTo(w, py); g.stroke();
    // Ripples.
    for (var i = f.ripples.length - 1; i >= 0; i--) {
      var r = f.ripples[i]; r.age += dt * 0.5;
      if (r.age > 1) { f.ripples.splice(i, 1); continue; }
      if (r.age < 0) continue;
      g.globalAlpha = 1 - r.age; g.strokeStyle = '#ffffff'; g.lineWidth = 3;
      g.beginPath(); g.ellipse(r.x, r.y, 20 + r.age * 160, 6 + r.age * 40, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
    }
    // Lily pads and flowers grow with the number of knocks.
    for (i = 0; i < f.lilies; i++) {
      var lx = w * (0.58 + 0.38 * ((i * 0.37) % 1)), ly = py + (h - py) * (0.25 + 0.55 * ((i * 0.53) % 1)), bob = Math.sin(t * 0.8 + i) * 2;
      g.fillStyle = '#b7e0a6'; g.beginPath(); g.ellipse(lx, ly + bob, 30, 11, 0, 0.25, Math.PI * 2 - 0.1); g.lineTo(lx, ly + bob); g.fill(); g.strokeStyle = RS.pal.ink; g.lineWidth = 3; g.stroke();
      if (i % 2 === 0) { g.fillStyle = RS.pal.coral; g.beginPath(); g.arc(lx, ly + bob - 8, 8, 0, Math.PI * 2); g.fill(); g.stroke(); }
    }
    // The bamboo spout and the tipping tube.
    var sx = w * 0.14, sy = h * 0.28;
    g.strokeStyle = RS.pal.ink; g.lineWidth = 3.5; g.fillStyle = '#d9e4a8';
    g.beginPath(); g.rect(sx - 8, sy - 80, 16, 80 + 6); g.fill(); g.stroke();
    var px = w * 0.37, pyv = h * 0.45;                                 // pivot
    g.beginPath(); g.rect(sx - 8, sy, (px - 30) - sx + 8, 14); g.fill(); g.stroke();   // the spout runs over the tube
    var tilt = f.tipping ? Math.sin(Math.min(1, f.tip * 1.6) * Math.PI * 0.5) * 0.9 * (f.tip > 0.7 ? 1 - (f.tip - 0.7) / 0.3 : 1) : 0;
    g.save(); g.translate(px, pyv); g.rotate(-0.28 + tilt);
    var L = Math.min(w, h) * 0.34, TH = 40;
    g.fillStyle = '#e4eebc'; g.beginPath(); g.rect(-L * 0.3, -TH / 2, L, TH); g.fill(); g.stroke();
    g.save(); g.beginPath(); g.rect(-L * 0.3 + 3, -TH / 2 + 3, L - 6, TH - 6); g.clip();
    g.fillStyle = '#9bd3ee'; var fl = f.tipping ? 1 - f.tip : f.fill; g.fillRect(-L * 0.3 + 3, TH / 2 - 3 - (TH - 6) * clamp(fl, 0, 1), L - 6, (TH - 6) * clamp(fl, 0, 1) + 1); g.restore();
    for (var k = 0; k < 3; k++) { g.beginPath(); g.moveTo(-L * 0.3 + L * (0.25 + k * 0.25), -TH / 2); g.lineTo(-L * 0.3 + L * (0.25 + k * 0.25), TH / 2); g.stroke(); }   // bamboo joints
    g.restore();
    g.fillStyle = RS.pal.paper; g.beginPath(); g.arc(px, pyv, 7, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = '#d9e4a8'; g.beginPath(); g.rect(px - 7, pyv + 4, 14, py - pyv - 4); g.fill(); g.stroke();   // the post
    // Water drops.
    for (i = f.drops.length - 1; i >= 0; i--) {
      var d = f.drops[i]; d.vy += 700 * dt; d.y += d.vy * dt;
      if (d.kind === 0 && d.y > pyv - 10) { f.drops.splice(i, 1); continue; }
      if (d.y > py + 8) { f.drops.splice(i, 1); f.ripples.push({ x: d.x + 20, y: py + 10 + Math.random() * 20, age: 0.4 }); if (f.ripples.length > 30) f.ripples.shift(); continue; }
      g.fillStyle = '#7cc3e8'; g.beginPath(); g.ellipse(d.x, d.y, 3, 5, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = RS.pal.ink; g.lineWidth = 1.5; g.stroke();
    }
    // Dragonflies, when it is calm.
    var nFlies = Math.floor(calm * 4);
    for (i = 0; i < nFlies; i++) {
      var fx = w * (0.5 + 0.3 * Math.sin(t * 0.4 + i * 2)), fy = py - 60 - 30 * Math.sin(t * 0.7 + i * 3);
      g.strokeStyle = RS.pal.ink; g.lineWidth = 3; g.beginPath(); g.moveTo(fx - 10, fy); g.lineTo(fx + 10, fy); g.stroke();
      g.fillStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.ellipse(fx, fy - 5, 9, 3, 0.3, 0, Math.PI * 2); g.ellipse(fx, fy + 5, 9, 3, -0.3, 0, Math.PI * 2); g.fill();
    }
    // The size of the next breath: a small tick on the tube shows how full it must get (always the same, the time is what grows).
    petals(f.petals, g, w, h, dt);
  }
  function fountainEnded(len) { /* the tube keeps what it has; nothing else to do */ }

  // ======================= Blossom =======================
  function buildBlossom() {
    var tips = [];
    function branch(x, y, len, ang, depth) {
      var x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
      var b = { x: x, y: y, x2: x2, y2: y2, w: depth * 2.6 + 1.5 };
      blossom.branches.push(b);
      if (depth === 0) { tips.push({ x: x2, y: y2 }); return; }
      branch(x2, y2, len * 0.72, ang - 0.5 + (Math.sin(depth * 7 + len) * 0.12), depth - 1);
      branch(x2, y2, len * 0.72, ang + 0.5 + (Math.cos(depth * 5 + len) * 0.12), depth - 1);
    }
    blossom = { branches: [], tips: tips, bloom: 0, streak: 0, phase: 'in', phaseT: 0, inT: 4, outT: 6, soundT: 0, petals: [], pulse: 0, cycles: 0, good: false };
    var m = Math.min(S.w, S.h);
    branch(S.w * 0.3, S.h * 0.86, m * 0.2, -Math.PI / 2 - 0.12, 5);
    blossom.tips.sort(function (a, b) { return a.y - b.y; });
  }
  function blossomUpdate(dt, t) {
    var b = blossom;
    b.phaseT += dt * RS.speed();
    var dur = b.phase === 'in' ? b.inT : b.outT;
    if (b.phase === 'out' && sense.out) b.soundT += dt * RS.speed();
    if (b.phaseT >= dur) {
      if (b.phase === 'in') { b.phase = 'out'; b.phaseT = 0; b.soundT = 0; }
      else {
        var ok = b.soundT / b.outT >= 0.6;                           // breathed out for most of the pacer's out-breath
        b.cycles++;
        if (ok) {
          b.streak++; b.bloom = Math.min(b.tips.length, b.bloom + 3);
          if (b.streak % 2 === 0) { b.outT = Math.min(10, b.outT + 0.5); b.inT = Math.min(6, b.inT + 0.25); }
          spawnPetals(b.petals, S.w * 0.3, S.h * 0.3, 10, null); chime(Math.min(8, b.streak), 0.7);
        } else { b.streak = 0; b.bloom = Math.max(0, b.bloom - 2); }
        b.good = ok; b.pulse = 1; b.phase = 'in'; b.phaseT = 0;
      }
    }
    b.pulse = Math.max(0, b.pulse - dt * 1.2);
    calm += (clamp(b.streak / 8 + (b.outT - 6) / 8, 0, 1) - calm) * Math.min(1, dt * 0.3);
  }
  function blossomDraw(g, w, h, dt, t) {
    var b = blossom, m = Math.min(w, h);
    sky(g, w, h); hills(g, w, h, h * 0.8);
    g.fillStyle = RS.pal.sage; g.fillRect(0, h * 0.86, w, h * 0.14); g.strokeStyle = RS.pal.ink; g.lineWidth = 3.5; g.beginPath(); g.moveTo(0, h * 0.86); g.lineTo(w, h * 0.86); g.stroke();
    // The tree sways a little.
    g.save(); g.translate(w * 0.3, h * 0.86); g.rotate(Math.sin(t * 0.5) * 0.012 * (1 + calm)); g.translate(-w * 0.3, -h * 0.86);
    g.lineCap = 'round';
    b.branches.forEach(function (br) {
      g.strokeStyle = RS.pal.ink; g.lineWidth = br.w + 4; g.beginPath(); g.moveTo(br.x, br.y); g.lineTo(br.x2, br.y2); g.stroke();
    });
    b.branches.forEach(function (br) {
      g.strokeStyle = '#c9a98a'; g.lineWidth = br.w; g.beginPath(); g.moveTo(br.x, br.y); g.lineTo(br.x2, br.y2); g.stroke();
    });
    b.tips.forEach(function (tp, i) {
      var open = clamp(b.bloom - i, 0, 1);
      var leaf = 1 - open;
      g.fillStyle = '#b7e0a6'; g.beginPath(); g.arc(tp.x, tp.y, 7 + 3 * leaf, 0, Math.PI * 2); g.fill(); g.strokeStyle = RS.pal.ink; g.lineWidth = 2.5; g.stroke();
      if (open > 0) {
        for (var k = 0; k < 5; k++) {
          var a = (k / 5) * Math.PI * 2 + t * 0.1, r = 9 * open;
          g.fillStyle = k % 2 ? RS.pal.peach : RS.pal.coral; g.shadowColor = RS.pal.coral; g.shadowBlur = 8 * open;
          g.beginPath(); g.arc(tp.x + Math.cos(a) * r, tp.y + Math.sin(a) * r, 6 * open, 0, Math.PI * 2); g.fill(); g.shadowBlur = 0;
          g.lineWidth = 2; g.stroke();
        }
        g.fillStyle = RS.pal.sun; g.beginPath(); g.arc(tp.x, tp.y, 4 * open, 0, Math.PI * 2); g.fill();
      }
    });
    g.restore();
    // The pacer: a lotus that opens as you breathe in and closes as you breathe out.
    var px = w * 0.72, py = h * 0.52, dur = b.phase === 'in' ? b.inT : b.outT, u = clamp(b.phaseT / dur, 0, 1);
    var e = 0.5 - 0.5 * Math.cos(u * Math.PI), size = b.phase === 'in' ? e : 1 - e;
    var R = m * (0.09 + 0.1 * size);
    g.strokeStyle = 'rgba(47,45,61,0.2)'; g.lineWidth = 3; g.setLineDash([4, 10]); g.beginPath(); g.arc(px, py, m * 0.19, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
    var hl = b.phase === 'out' && sense.out;
    for (var k = 0; k < 8; k++) {
      var a = (k / 8) * Math.PI * 2 - Math.PI / 2;
      g.save(); g.translate(px, py); g.rotate(a);
      g.fillStyle = hl ? 'hsl(' + (150 + k * 6) + ',70%,78%)' : (k % 2 ? RS.pal.lilac : RS.pal.peach);
      if (hl) { g.shadowColor = '#8fe0bd'; g.shadowBlur = 16; }
      g.beginPath(); g.ellipse(R * 0.55, 0, R * 0.55, R * (0.22 + 0.1 * size), 0, 0, Math.PI * 2); g.fill(); g.shadowBlur = 0;
      g.strokeStyle = RS.pal.ink; g.lineWidth = 3; g.stroke(); g.restore();
    }
    g.fillStyle = RS.pal.sun; g.beginPath(); g.arc(px, py, R * 0.22, 0, Math.PI * 2); g.fill(); g.strokeStyle = RS.pal.ink; g.lineWidth = 3; g.stroke();
    if (b.pulse > 0) { g.globalAlpha = b.pulse; g.strokeStyle = b.good ? '#8fe0bd' : RS.pal.coral; g.lineWidth = 6; g.beginPath(); g.arc(px, py, m * 0.2 + (1 - b.pulse) * 60, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
    // A thin arc under the lotus: how long this phase has left.
    g.strokeStyle = RS.pal.ink; g.lineWidth = 4; g.globalAlpha = 0.5; g.beginPath(); g.arc(px, py, m * 0.215, -Math.PI / 2, -Math.PI / 2 + u * Math.PI * 2); g.stroke(); g.globalAlpha = 1;
    petals(b.petals, g, w, h, dt);
  }
  function blossomEnded() {}

  // ---- Frame ----
  M.draw = function (g, w, h, dt) {
    var t = now();
    updateSense(dt, t);
    var c = takeCompleted();
    if (c) {
      exhaleEnded(c.len);
      if (kind === 'sand') sandEnded(c.len); else if (kind === 'fountain') fountainEnded(c.len); else blossomEnded(c.len);
    }
    if (kind !== 'blossom') calm += (clamp(avgLast(3) / 10, 0, 1) - calm) * Math.min(1, dt * 0.4);
    if (kind === 'sand') { sandUpdate(dt, t); sandDraw(g, w, h, dt, t); }
    else if (kind === 'fountain') { fountainUpdate(dt, t); fountainDraw(g, w, h, dt, t); }
    else { blossomUpdate(dt, t); blossomDraw(g, w, h, dt, t); }
    meters(g, w, h, t);
  };
  M.info = function () {
    return { kind: kind, out: !!(sense && sense.out), outT: sense ? Math.round(sense.outT * 10) / 10 : 0, active: !!(sense && sense.active), calm: Math.round(calm * 100) / 100,
      exhales: session.exhales.map(function (x) { return Math.round(x * 10) / 10; }), longest: Math.round(session.longest * 10) / 10, best: best,
      fill: fountain && kind === 'fountain' ? Math.round(fountain.fill * 100) / 100 : null, tips: fountain && kind === 'fountain' ? fountain.tips : null,
      bloom: blossom && kind === 'blossom' ? blossom.bloom : null, streak: blossom && kind === 'blossom' ? blossom.streak : null,
      pacer: blossom && kind === 'blossom' ? { phase: blossom.phase, inT: blossom.inT, outT: blossom.outT } : null,
      sandS: sand && kind === 'sand' ? Math.round(sand.s) : null };
  };
})();
