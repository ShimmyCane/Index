// Mode 10: Footsteps, in the desert.
//   Rhythm road: stones roll along the road: a small stone is a short tap, a long stone is a press and hold, a gap is a pause.
//   Tap them as they arrive. Get a rhythm right twice in a row and the creature carries on by itself, a new object joins the road and the
//   next of 15 rhythms opens. A mistake never loses anything; the same rhythm just comes round again.
//   Free walk: tap left and right to walk, tap fast to run, tap one side twice to hop.
// In both: tap the cactus, birds, palm trees, bus, tumbleweed and rocks to hear them. Progress is kept on this device only.
(function () {
  'use strict';
  var M = RS.modes.footsteps = { id: 'footsteps', name: 'Footsteps', icon: '🐾' };
  var BEAT = 0.5, TOL = 0.175, HOLD = 0.4;
  // S = short tap (one beat), L = long press (two beats), _ = pause (one beat).
  var PATTERNS = [
    { n: 'Walk', p: 'S S S S' }, { n: 'Stroll', p: 'L L' }, { n: 'Skip', p: 'S S L' }, { n: 'Gallop', p: 'L S S' }, { n: 'Tiptoe', p: 'S _ S _' },
    { n: 'Hop-pause', p: 'S S S _' }, { n: 'Slow-quick', p: 'L S _' }, { n: 'Catch', p: 'S _ L' }, { n: 'Stumble', p: 'S S _ S' }, { n: 'Late step', p: '_ S S S' },
    { n: 'Waltz', p: 'L S S L S S' }, { n: 'Parade', p: 'S S L S S L' }, { n: 'Rolling', p: 'S S S _ S S L' }, { n: 'Heartbeat', p: 'S S _ L S S _' }, { n: 'Stomp', p: 'L _ S S L _' },
  ];
  M.patterns = PATTERNS;
  var OBJ_TYPES = ['cactus', 'bird', 'palm', 'bus', 'tumbleweed', 'rock'];
  var FCOL = [RS.pal.coral, RS.pal.sun, RS.pal.lilac, RS.pal.sky, RS.pal.peach, RS.pal.mint];

  var S, taps, foot, lastSide, lastTap, speed, target, wx, flowers, dust, hop, steps, rate, blink, nextBlink, bellStep, stumble;
  var objs, nextObjX, objCount, prog, road, held, holdVoice;

  function now() { return performance.now() / 1000; }
  function loadProg() {
    var p = { level: 0, solved: 0 };
    try { var j = JSON.parse(localStorage.getItem('rs.foot') || 'null'); if (j) p = { level: Math.min(14, j.level | 0), solved: j.solved | 0 }; } catch (e) { /* storage blocked */ }
    return p;
  }
  function saveProg() { try { localStorage.setItem('rs.foot', JSON.stringify(prog)); } catch (e) { /* storage blocked */ } }
  function poolSize() { return Math.min(OBJ_TYPES.length, 3 + Math.floor(prog.solved / 2)); }   // three objects at first, one more for every two rhythms solved

  M.start = function (stage) {
    S = stage; taps = []; foot = { L: { lift: 0 }, R: { lift: 0 } }; lastSide = ''; lastTap = 0; speed = 0; target = 0; wx = 0;
    flowers = []; dust = []; hop = 0; steps = 0; rate = 0; blink = 0; nextBlink = now() + 2; bellStep = 0; stumble = 0;
    objs = []; nextObjX = S.w * 0.7; objCount = 0; held = {}; holdVoice = null; prog = loadProg();
    road = { state: 'wait', t0: now() + 1.2, stones: [], extra: 0, clean: 0, result: '', resultAt: 0, nextBeat: 0, auto: false, autoIdx: 0, lastResult: '', rounds: 0, showOff: 0 };
    spawnObjects();
  };
  M.stop = function () { if (holdVoice) { holdVoice.release(0.2); holdVoice = null; } };

  // ---------- the road ----------
  function parse(p) { return p.split(' ').map(function (c) { return c; }); }
  function buildRound(start) {
    var pat = PATTERNS[prog.level], toks = parse(pat.p), slot = 0, stones = [];
    toks.forEach(function (tk) {
      if (tk === 'S') stones.push({ t: start + slot * BEAT, kind: 'S', hit: false, ok: false });
      if (tk === 'L') stones.push({ t: start + slot * BEAT, kind: 'L', hit: false, ok: false, down: 0 });
      slot += tk === 'L' ? 2 : 1;
    });
    road.stones = stones; road.slots = slot; road.pStart = start; road.pEnd = start + slot * BEAT; road.extra = 0; road.auto = false; road.autoIdx = 0;
    road.nextBeat = start - 2 * BEAT;
    road.state = 'play';
  }
  function finishRound(t) {
    var ok = road.stones.every(function (s) { return s.hit && (s.kind === 'S' || s.ok); }) && road.extra === 0;
    road.rounds++;
    if (road.auto) { road.state = 'wait'; road.t0 = t + 1.0; return; }              // the creature has played this one by itself
    if (ok) {
      road.clean++; road.lastResult = 'good'; road.result = 'good'; road.resultAt = t;
      RS.audio.bell(RS.audio.mtof(RS.audio.midiFromStep(road.clean * 2 + 2, 60)), 0.7, 1.0);
      if (road.clean >= 2) {                                                         // solved: it carries on by itself for a bar
        road.clean = 0; prog.solved++; prog.level = (prog.level + 1) % PATTERNS.length; saveProg();
        road.showOff = t; road.lastResult = 'solved';
        RS.audio.powerup(0.5);
        addNewObject();
        road.state = 'wait'; road.t0 = t + 0.9; road.autoNext = true;
        return;
      }
    } else {
      road.clean = 0; road.lastResult = 'miss'; road.result = 'miss'; road.resultAt = t; stumble = 1;
      RS.audio.tick(0.5, 220);
    }
    road.state = 'wait'; road.t0 = t + 1.1;
  }
  function roadUpdate(dt, t) {
    if (road.state === 'wait' && t >= road.t0) {
      var lead = road.autoNext ? 0 : 0;
      buildRound(t + 2 * BEAT);                                // two beats of lead-in, the stones roll in meanwhile
      if (road.autoNext) { road.auto = true; road.autoNext = false; }
    }
    if (road.state !== 'play') return;
    // The beat: a soft tick, a little higher on the first beat of the round.
    while (t >= road.nextBeat) {
      if (RS.settings.roadBeat) RS.audio.tick(0.22, road.nextBeat === road.pStart ? 360 : 250);
      road.nextBeat += BEAT;
      if (road.nextBeat > road.pEnd + BEAT) break;
    }
    if (road.auto) {                                           // the creature plays the bar by itself
      while (road.autoIdx < road.stones.length && t >= road.stones[road.autoIdx].t) {
        var st = road.stones[road.autoIdx++]; st.hit = true; st.ok = true; autoStep(st.kind === 'L');
      }
    }
    if (t > road.pEnd + 0.45) {
      var pending = road.stones.some(function (s) { return s.kind === 'L' && s.hit && !s.ok && s.down && !s.released; });
      if (!pending || t > road.pEnd + 1.6) finishRound(t);
    }
  }
  function autoStep(long) {
    var side = steps % 2 ? 'R' : 'L';
    RS.audio.thud(0.6, side === 'L' ? 105 : 135); foot[side].lift = 1; steps++;
    rate = 2.2; target = S.w * 0.16;
    lastTap = now(); flowers.push({ wx: wx + S.w * 0.35, age: 0, col: FCOL[steps % FCOL.length], h: 22 + (steps % 4) * 7 });
    if (long) { hop = 0.7; RS.audio.pop(0.4, 520); }
  }

  // ---------- touches ----------
  function objectAt(x, y) {
    for (var i = 0; i < objs.length; i++) {
      var o = objs[i], sx = o.wx - wx, gy = S.h * 0.74, R = Math.min(S.w, S.h) * 0.085;
      var top = o.type === 'bird' ? gy - R * 3.6 : gy - R * (o.type === 'palm' ? 3.2 : o.type === 'cactus' ? 2.2 : o.type === 'bus' ? 1.6 : 1.1);
      var bottom = o.type === 'bird' ? gy - R * 2.2 : gy + R * 0.5;
      var half = R * (o.type === 'bus' ? 1.6 : o.type === 'palm' ? 1.2 : 0.9);
      if (x > sx - half && x < sx + half && y > top - 10 && y < bottom + 10) return o;
    }
    return null;
  }
  function triggerObject(o) {
    var t = now(); o.hit = t;
    switch (o.type) {
      case 'cactus': RS.audio.pop(0.7, 320 + (o.wx % 5) * 40); flowers.push({ wx: o.wx, age: 0, col: RS.pal.coral, h: 70 }); break;
      case 'bird': RS.audio.chirp(0.8); o.fly = t; break;
      case 'palm': RS.audio.rustle(0.8); RS.audio.bell(RS.audio.mtof(72 + (o.wx % 3) * 2), 0.5, 0.8); break;
      case 'bus': RS.audio.horn(0.7); break;
      case 'tumbleweed': RS.audio.swish(0.9); o.roll = t; break;
      case 'rock': RS.audio.thud(0.8, 85); break;
    }
  }
  M.down = function (id, x, y) {
    var o = objectAt(x, y);
    if (o) { triggerObject(o); return; }
    var side = x < S.w / 2 ? 'L' : 'R', t = now();
    RS.audio.thud(0.7, side === 'L' ? 105 : 135);                     // the footstep, at once
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
    if (steps % 4 === 0) RS.audio.bell(RS.audio.mtof(RS.audio.midiFromStep(bellStep++ % 10 + 2, 60)), 0.7, 0.9);
    var fx = S.w * 0.35 + (side === 'L' ? -S.w * 0.02 : S.w * 0.02);
    flowers.push({ wx: wx + fx, age: 0, col: FCOL[Math.floor(Math.random() * FCOL.length)], h: 22 + Math.random() * 26 });
    if (flowers.length > 40) flowers.shift();
    if (rate > 4) for (var k = 0; k < 4; k++) dust.push({ wx: wx + fx, y: 0, vx: -60 - Math.random() * 80, vy: -30 - Math.random() * 50, age: 0 });
    // The road judges it.
    held[id] = { t: t, stone: -1 };
    if (RS.settings.footMode === 'road' && road.state === 'play' && !road.auto) {
      var best = -1, bd = TOL;
      road.stones.forEach(function (s, i) { var d = Math.abs(s.t - t); if (!s.hit && d <= bd) { bd = d; best = i; } });
      if (best >= 0) {
        var st = road.stones[best]; st.hit = true; held[id].stone = best;
        if (st.kind === 'L') { st.down = t; st.released = false; if (!holdVoice) holdVoice = RS.audio.voice(98, { type: 'sine', gain: 0.18, attack: 0.03 }); }
      } else if (t > road.pStart - TOL * 1.5 && t < road.pEnd + TOL) road.extra++;
    }
  };
  M.move = function () {};
  M.up = function (id) {
    var h = held[id]; delete held[id];
    if (!h) return;
    if (holdVoice && Object.keys(held).every(function (k) { return held[k].stone < 0 || road.stones[held[k].stone].kind !== 'L'; })) { holdVoice.release(0.25); holdVoice = null; }
    if (h.stone >= 0 && road && road.stones[h.stone]) {
      var st = road.stones[h.stone];
      if (st.kind === 'L') { st.released = true; st.ok = now() - st.down >= HOLD; }
    }
  };

  // ---------- the world ----------
  function spawnObjects() {
    while (nextObjX < wx + S.w * 1.7) {
      var pool = poolSize(), type = OBJ_TYPES[Math.floor(Math.random() * pool)];
      objs.push({ type: type, wx: nextObjX, hit: -9, fly: -9, roll: -9 });
      nextObjX += S.w * (0.32 + Math.random() * 0.28);
      objCount++;
    }
    while (objs.length && objs[0].wx - wx < -S.w * 0.3) objs.shift();
  }
  function addNewObject() {
    var type = OBJ_TYPES[Math.min(OBJ_TYPES.length - 1, 2 + Math.floor(prog.solved / 2))];
    objs.push({ type: type, wx: wx + S.w * 0.95, hit: -9, fly: -9, roll: -9, fresh: now() });
  }

  function hill(g, w, h, off, amp, base, col, par) {
    g.fillStyle = col; g.beginPath(); g.moveTo(0, h);
    for (var x = 0; x <= w; x += 10) {
      var u = (x + off * par) / 170;
      g.lineTo(x, base - amp * (0.6 * Math.sin(u) + 0.4 * Math.sin(u * 2.1 + 1)));
    }
    g.lineTo(w, h); g.closePath(); g.fill();
    g.strokeStyle = RS.pal.ink; g.globalAlpha = 0.35; g.lineWidth = 3; g.stroke(); g.globalAlpha = 1;
  }
  function ink(g, w) { g.strokeStyle = RS.pal.ink; g.lineWidth = w || 3.5; g.lineJoin = 'round'; g.lineCap = 'round'; }

  function drawObj(g, o, gy, R, t) {
    var x = o.wx - wx, hit = Math.max(0, 1 - (t - o.hit) / 0.5), wob = Math.sin((t - o.hit) * 30) * hit * 0.12;
    g.save();
    switch (o.type) {
      case 'cactus': {
        g.translate(x, gy + 4); g.rotate(wob); ink(g);
        g.fillStyle = '#a9dba0';
        g.beginPath(); g.roundRect ? g.roundRect(-R * 0.3, -R * 2.1, R * 0.6, R * 2.1, R * 0.3) : g.rect(-R * 0.3, -R * 2.1, R * 0.6, R * 2.1); g.fill(); g.stroke();
        g.beginPath(); g.roundRect ? g.roundRect(-R * 0.85, -R * 1.5, R * 0.45, R * 0.9, R * 0.22) : g.rect(-R * 0.85, -R * 1.5, R * 0.45, R * 0.9); g.fill(); g.stroke();
        g.beginPath(); g.roundRect ? g.roundRect(R * 0.4, -R * 1.2, R * 0.45, R * 0.8, R * 0.22) : g.rect(R * 0.4, -R * 1.2, R * 0.45, R * 0.8); g.fill(); g.stroke();
        g.fillStyle = RS.pal.coral; g.beginPath(); g.arc(0, -R * 2.15, R * (0.16 + 0.12 * hit), 0, Math.PI * 2); g.fill(); g.stroke();
        break;
      }
      case 'bird': {
        var fly = Math.max(0, 1 - (t - o.fly) / 1.6), by = gy - R * 3 - Math.sin(t * 2 + o.wx) * 6 - (1 - fly) * 0;
        var flap = Math.sin(t * (fly > 0 ? 28 : 6)) * (fly > 0 ? 0.9 : 0.25), dx = fly > 0 ? (1 - fly) * R * 3 : 0, dy = fly > 0 ? -(1 - fly) * R * 1.2 : 0;
        g.translate(x + dx, by + dy); ink(g);
        g.fillStyle = RS.pal.sky; g.beginPath(); g.ellipse(0, 0, R * 0.45, R * 0.32, 0, 0, Math.PI * 2); g.fill(); g.stroke();
        g.beginPath(); g.moveTo(-R * 0.1, -R * 0.1); g.quadraticCurveTo(-R * 0.1, -R * (0.7 + flap), -R * 0.6, -R * (0.3 + flap * 0.5)); g.quadraticCurveTo(-R * 0.3, -R * 0.1, -R * 0.1, -R * 0.1); g.fill(); g.stroke();
        g.fillStyle = RS.pal.sun; g.beginPath(); g.moveTo(R * 0.42, -R * 0.04); g.lineTo(R * 0.68, R * 0.04); g.lineTo(R * 0.42, R * 0.12); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = RS.pal.ink; g.beginPath(); g.arc(R * 0.22, -R * 0.08, R * 0.05, 0, Math.PI * 2); g.fill();
        break;
      }
      case 'palm': {
        g.translate(x, gy + 4); g.rotate(wob * 1.5 + Math.sin(t * 0.8 + o.wx) * 0.02); ink(g);
        g.strokeStyle = RS.pal.ink; g.lineWidth = R * 0.34 + 6; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(R * 0.25, -R * 1.6, R * 0.1, -R * 3); g.stroke();
        g.strokeStyle = '#d9b48a'; g.lineWidth = R * 0.34; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(R * 0.25, -R * 1.6, R * 0.1, -R * 3); g.stroke();
        ink(g); g.fillStyle = '#a9dba0';
        for (var k = -2; k <= 2; k++) {
          g.save(); g.translate(R * 0.1, -R * 3); g.rotate(k * 0.55 - 0.1 + wob);
          g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(R * 0.4, -R * 0.9, R * 1.3, -R * 0.4 + Math.abs(k) * R * 0.15); g.quadraticCurveTo(R * 0.5, -R * 0.35, 0, 0); g.fill(); g.stroke(); g.restore();
        }
        g.fillStyle = '#d9a35c'; g.beginPath(); g.arc(R * 0.1, -R * 2.95, R * 0.17, 0, Math.PI * 2); g.fill(); g.stroke();
        break;
      }
      case 'bus': {
        g.translate(x, gy + 6 - hit * 6); ink(g);
        g.fillStyle = RS.pal.sun; g.beginPath(); g.roundRect ? g.roundRect(-R * 1.6, -R * 1.5, R * 3.2, R * 1.35, R * 0.25) : g.rect(-R * 1.6, -R * 1.5, R * 3.2, R * 1.35); g.fill(); g.stroke();
        g.fillStyle = RS.pal.sky;
        for (var w = 0; w < 4; w++) { g.beginPath(); g.rect(-R * 1.4 + w * R * 0.7, -R * 1.3, R * 0.55, R * 0.5); g.fill(); g.stroke(); }
        g.fillStyle = RS.pal.paper; [-R * 1.0, R * 1.0].forEach(function (wxl) { g.beginPath(); g.arc(wxl, -R * 0.1, R * 0.3, 0, Math.PI * 2); g.fill(); g.stroke(); });
        if (hit > 0) { g.globalAlpha = hit; g.strokeStyle = RS.pal.coral; g.lineWidth = 4; for (var a = 1; a <= 2; a++) { g.beginPath(); g.arc(R * 1.7, -R * 1.0, R * 0.3 * a, -0.8, 0.8); g.stroke(); } g.globalAlpha = 1; }
        break;
      }
      case 'tumbleweed': {
        var roll = Math.max(0, 1 - (t - o.roll) / 1.4), rx = (1 - roll) * R * 2.5 * (o.roll > 0 ? 1 : 0);
        g.translate(x - rx, gy - R * 0.45); g.rotate(-(t - o.roll < 1.4 ? (t - o.roll) * 6 : 0) - o.wx * 0.01); ink(g, 3);
        g.fillStyle = '#e8cfa0'; g.beginPath(); g.arc(0, 0, R * 0.5, 0, Math.PI * 2); g.fill(); g.stroke();
        for (var q = 0; q < 6; q++) { g.beginPath(); g.arc(0, 0, R * (0.15 + q * 0.06), q, q + 3.2); g.stroke(); }
        break;
      }
      case 'rock': {
        g.translate(x, gy + 6 - hit * 5); ink(g);
        g.fillStyle = '#d9cfc2'; g.beginPath(); g.moveTo(-R * 0.7, 0); g.lineTo(-R * 0.45, -R * 0.7); g.lineTo(R * 0.2, -R * 0.95); g.lineTo(R * 0.7, -R * 0.2); g.lineTo(R * 0.6, 0); g.closePath(); g.fill(); g.stroke();
        break;
      }
    }
    g.restore();
    if (o.fresh && t - o.fresh < 1.5) {                           // a new object just joined the road
      g.globalAlpha = Math.max(0, 1 - (t - o.fresh) / 1.5); g.strokeStyle = RS.pal.sun; g.lineWidth = 6; g.shadowColor = RS.pal.sun; g.shadowBlur = 16;
      g.beginPath(); g.arc(x, gy - R, R * (1.4 + (t - o.fresh)), 0, Math.PI * 2); g.stroke(); g.shadowBlur = 0; g.globalAlpha = 1;
    }
  }

  M.draw = function (g, w, h, dt) {
    var t = now(), sp = RS.speed(), idle = t - lastTap, roadMode = RS.settings.footMode === 'road';
    if (roadMode) roadUpdate(dt, t); else { road.state = 'wait'; road.t0 = t + 1; }
    if (idle > 0.9 && !(roadMode && road.auto)) target = 0;
    speed += (target - speed) * Math.min(1, dt * 5);
    wx += speed * dt * sp;
    hop = Math.max(0, hop - dt * 3.2); stumble = Math.max(0, stumble - dt * 2.5);
    foot.L.lift = Math.max(0, foot.L.lift - dt * 5); foot.R.lift = Math.max(0, foot.R.lift - dt * 5);
    spawnObjects();

    // Sky, sun and dunes.
    var sky = g.createLinearGradient(0, 0, 0, h * 0.7); sky.addColorStop(0, '#fff3d6'); sky.addColorStop(1, '#ffe2c4');
    g.fillStyle = sky; g.fillRect(0, 0, w, h);
    var gy = h * 0.74, R = Math.min(w, h) * 0.085;
    g.fillStyle = RS.pal.sun; g.shadowColor = RS.pal.sun; g.shadowBlur = 30; g.beginPath(); g.arc(w * 0.82, h * 0.2, Math.min(w, h) * 0.075, 0, Math.PI * 2); g.fill(); g.shadowBlur = 0;
    g.strokeStyle = RS.pal.ink; g.globalAlpha = 0.4; g.lineWidth = 3; g.stroke(); g.globalAlpha = 1;
    hill(g, w, h, wx, h * 0.12, h * 0.56, '#f7d9b4', 0.2);
    hill(g, w, h, wx, h * 0.09, h * 0.65, '#f3c99a', 0.45);
    g.fillStyle = '#f6d6a4'; g.fillRect(0, gy, w, h - gy);
    g.strokeStyle = RS.pal.ink; g.lineWidth = 3.5; g.beginPath(); g.moveTo(0, gy); g.lineTo(w, gy); g.stroke();
    g.globalAlpha = 0.3; g.setLineDash([22, 30]); g.lineDashOffset = wx % 52; g.beginPath(); g.moveTo(0, gy + (h - gy) * 0.6); g.lineTo(w, gy + (h - gy) * 0.6); g.stroke(); g.setLineDash([]); g.lineDashOffset = 0; g.globalAlpha = 1;

    // Objects, then flowers where the feet landed.
    objs.forEach(function (o) { if (o.wx - wx > -R * 3 && o.wx - wx < w + R * 3) drawObj(g, o, gy, R, t); });
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
      g.beginPath(); g.arc(d.wx - wx, gy + d.y - 6, 6 + d.age * 8, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
    }

    // The rhythm road: stones roll in along the road toward the creature.
    var cx = w * 0.35, tx = cx + R * 1.7, ry = gy + (h - gy) * 0.42, pps = w * 0.34;
    if (roadMode && road.state === 'play') {
      g.strokeStyle = RS.pal.ink; g.globalAlpha = 0.5; g.lineWidth = 4; g.setLineDash([6, 8]);
      g.beginPath(); g.arc(tx, ry, R * 0.55, 0, Math.PI * 2); g.stroke(); g.setLineDash([]); g.globalAlpha = 1;      // the place to tap
      road.stones.forEach(function (s) {
        var x = tx + (s.t - t) * pps;
        if (x > w + 80 || x < tx - 260) return;
        var done = s.hit, al = done ? Math.max(0, 1 - (t - s.t) / 0.5) : 1;
        if (!done && t > s.t + TOL) al = Math.max(0.15, 1 - (t - s.t - TOL) / 0.4);
        g.globalAlpha = al;
        var col = s.kind === 'L' ? RS.pal.lilac : RS.pal.coral;
        if (s.kind === 'S') { g.beginPath(); g.arc(x, ry, R * 0.4, 0, Math.PI * 2); }
        else { g.beginPath(); g.roundRect ? g.roundRect(x - R * 0.4, ry - R * 0.4, R * 2.1, R * 0.8, R * 0.4) : g.rect(x - R * 0.4, ry - R * 0.4, R * 2.1, R * 0.8); }
        g.fillStyle = done ? '#a9dba0' : col; g.shadowColor = col; g.shadowBlur = done ? 0 : 10; g.fill(); g.shadowBlur = 0;
        g.strokeStyle = RS.pal.ink; g.lineWidth = 3.5; g.stroke(); g.globalAlpha = 1;
      });
      // A small row of dots: how many of the 15 rhythms are open.
      for (var k = 0; k < PATTERNS.length; k++) {
        g.beginPath(); g.arc(w / 2 - 7 * 18 + k * 18, 30, 6, 0, Math.PI * 2);
        g.fillStyle = k < prog.level ? RS.pal.sun : (k === prog.level ? RS.pal.coral : 'rgba(255,255,255,0.7)'); g.fill();
        g.strokeStyle = RS.pal.ink; g.lineWidth = 2; g.globalAlpha = k <= prog.level ? 1 : 0.4; g.stroke(); g.globalAlpha = 1;
      }
      if (road.result && t - road.resultAt < 1.0) {
        var a = 1 - (t - road.resultAt) / 1.0;
        g.globalAlpha = a; g.strokeStyle = road.result === 'good' ? '#7fd49a' : RS.pal.coral; g.lineWidth = 6; g.shadowColor = g.strokeStyle; g.shadowBlur = 14;
        g.beginPath(); g.arc(tx, ry, R * (0.6 + (1 - a) * 1.2), 0, Math.PI * 2); g.stroke(); g.shadowBlur = 0; g.globalAlpha = 1;
      }
    } else if (roadMode && road.state === 'wait') {
      g.globalAlpha = 0.4; g.strokeStyle = RS.pal.ink; g.lineWidth = 4; g.setLineDash([6, 8]); g.beginPath(); g.arc(tx, ry, R * 0.55, 0, Math.PI * 2); g.stroke(); g.setLineDash([]); g.globalAlpha = 1;
    }

    // The creature.
    var running = rate > 4 && idle < 0.9, walking = speed > 8;
    var phase = wx / (R * 1.2), bounce = walking ? Math.abs(Math.sin(phase)) * R * (running ? 0.28 : 0.14) : 0;
    var sitting = idle > 1.6 && !(roadMode && road.state === 'play'), dozing = idle > 5 && !roadMode;
    var squash = sitting ? 0.82 : 1 - stumble * 0.18, by = gy - R * (sitting ? 0.9 : 1.38) - bounce - Math.sin(hop * Math.PI) * R * 1.6;
    var tilt = Math.sin(stumble * Math.PI * 3) * stumble * 0.25;
    g.save(); g.translate(cx, gy); g.rotate(tilt); g.translate(-cx, -gy);
    [['L', -1], ['R', 1]].forEach(function (pr) {
      var side = pr[0], dir = pr[1], lift = Math.sin(foot[side].lift * Math.PI);
      var fx = cx + dir * R * 0.5 + (walking ? Math.sin(phase + (dir > 0 ? Math.PI : 0)) * R * 0.35 : 0);
      var fy = gy - R * 0.2 - lift * R * 0.55;
      g.beginPath(); g.ellipse(fx, fy, R * 0.34, R * 0.2, 0, 0, Math.PI * 2);
      g.fillStyle = RS.pal.sun; g.fill(); g.strokeStyle = RS.pal.ink; g.lineWidth = 3.5; g.stroke();
    });
    g.beginPath(); g.ellipse(cx, by, R * (sitting ? 1.1 : 1), R * squash, 0, 0, Math.PI * 2);
    g.fillStyle = RS.pal.coral; g.shadowColor = RS.pal.coral; g.shadowBlur = running || (roadMode && road.auto) ? 18 : 6; g.fill(); g.shadowBlur = 0;
    g.strokeStyle = RS.pal.ink; g.lineWidth = 4; g.stroke();
    if (t > nextBlink) { blink = 0.15; nextBlink = t + 2 + Math.random() * 3; }
    blink = Math.max(0, blink - dt);
    var ey = by - R * 0.12, ex = R * 0.34, shut = blink > 0 || dozing;
    g.fillStyle = RS.pal.ink; g.strokeStyle = RS.pal.ink; g.lineWidth = 3;
    if (shut) { g.beginPath(); g.moveTo(cx - ex - 7, ey); g.lineTo(cx - ex + 7, ey); g.moveTo(cx + ex - 7, ey); g.lineTo(cx + ex + 7, ey); g.stroke(); }
    else { g.beginPath(); g.arc(cx - ex, ey, R * 0.1, 0, Math.PI * 2); g.arc(cx + ex, ey, R * 0.1, 0, Math.PI * 2); g.fill(); }
    g.beginPath();
    if (running || hop > 0) { g.ellipse(cx, by + R * 0.3, R * 0.2, R * 0.16, 0, 0, Math.PI * 2); g.fill(); }
    else if (stumble > 0.3) { g.moveTo(cx - R * 0.2, by + R * 0.3); g.quadraticCurveTo(cx, by + R * 0.12, cx + R * 0.2, by + R * 0.3); g.stroke(); }
    else { g.arc(cx, by + R * 0.12, R * 0.28, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); }
    g.restore();
    if (dozing) {
      g.font = 'bold ' + Math.round(R * 0.6) + 'px "Quicksand", system-ui, sans-serif'; g.fillStyle = RS.pal.ink;
      var zz = (t * 0.8) % 1;
      g.globalAlpha = 1 - zz; g.fillText('z', cx + R * 1.1 + zz * 20, by - R * 0.8 - zz * 30); g.globalAlpha = 1;
    }
    if (!roadMode) {                                          // free walk: footprints at the bottom corners until you have tapped a few times
      var hint = Math.max(0, 1 - steps / 4) * 0.5 + (sitting ? 0.35 : 0);
      if (hint > 0.02) {
        g.globalAlpha = hint; g.fillStyle = RS.pal.ink;
        [w * 0.25, w * 0.75].forEach(function (x, k) { g.beginPath(); g.ellipse(x, h * 0.92, R * 0.28, R * 0.42, k ? 0.2 : -0.2, 0, Math.PI * 2); g.fill(); });
        g.globalAlpha = 1;
      }
    }
  };
  M.info = function () {
    var t = now();
    return { mode: RS.settings.footMode, steps: steps, rate: Math.round(rate * 10) / 10, speed: Math.round(speed), x: Math.round(wx), flowers: flowers.length,
      state: (t - lastTap > 1.6) ? 'sitting' : (rate > 4 ? 'running' : 'walking'),
      level: prog ? prog.level : 0, solved: prog ? prog.solved : 0, roadState: road ? road.state : '', clean: road ? road.clean : 0, lastResult: road ? road.lastResult : '',
      auto: road ? road.auto : false, stones: road && road.state === 'play' ? road.stones.map(function (s) { return { t: s.t, kind: s.kind, hit: s.hit }; }) : [],
      pattern: prog ? PATTERNS[prog.level].p : '', objects: objs ? objs.map(function (o) { return o.type; }) : [], pool: prog ? poolSize() : 0 };
  };
  M._clear = function () { objs.length = 0; };
  M._spawn = function (type, sx) { objs.push({ type: type, wx: wx + sx, hit: -9, fly: -9, roll: -9 }); };
  M._objectScreen = function () { return objs.map(function (o) { return { type: o.type, x: o.wx - wx }; }); };
  M._level = function (n) { prog.level = n; saveProg(); };
  M.now = now;
})();
