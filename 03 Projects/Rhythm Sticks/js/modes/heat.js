// Mode 6: How the machine hears. The microphone as a picture. Tap to freeze, tap again to carry on.
// Tap with two fingers to change the view:
//   Heat map: time runs left to right, high sounds are at the top, loud sounds are hot.
//   Pitch:    the note you are singing, as a line over the notes of the scale, with its name and how sharp or flat it is.
//   Chords:   the notes of a chord (three or more notes at once) drawn on a music staff.
// The chord view is the hardest to get right: clear piano or guitar chords work, a noisy room or many notes make mistakes,
// and the lowest notes are the least reliable.
(function () {
  'use strict';
  var M = RS.modes.heat = { id: 'heat', name: 'How the machine hears', icon: '🌡️', mic: true };
  var S, buf, bg, frozen = false, acc = 0, peak = 0, view = 0, fingers = {}, twoAt = 0, undone = false;
  var pitchPts = [], lastNote = null, chordHist = [], shown = [], shownAt = 0, chordBuf = null, lastChordAt = 0, prevHz = 0;
  var STOPS = [[0, 255, 243, 214], [0.3, 255, 208, 181], [0.55, 255, 158, 138], [0.8, 190, 80, 120], [1, 70, 40, 95]];
  var FMIN = 80, FMAX = 8000, COL_W = 3;
  var NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
  var VIEWS = ['heat', 'pitch', 'chords'];

  function heat(v) {
    for (var i = 1; i < STOPS.length; i++) {
      if (v <= STOPS[i][0]) {
        var a = STOPS[i - 1], b = STOPS[i], t = (v - a[0]) / (b[0] - a[0]);
        return 'rgb(' + Math.round(a[1] + (b[1] - a[1]) * t) + ',' + Math.round(a[2] + (b[2] - a[2]) * t) + ',' + Math.round(a[3] + (b[3] - a[3]) * t) + ')';
      }
    }
    return 'rgb(70,40,95)';
  }
  function makeBuf() {
    buf = document.createElement('canvas');
    buf.width = Math.round(S.w); buf.height = Math.round(S.h);
    bg = buf.getContext('2d');
    bg.fillStyle = RS.pal.vanilla; bg.fillRect(0, 0, buf.width, buf.height);
  }
  function fftFor(v) { return v === 2 ? 8192 : 2048; }
  function applyView() { if (RS.mic.analyser) RS.mic.setFft(fftFor(view)); chordHist = []; shown = []; pitchPts = []; makeBuf(); }
  M.start = function (stage) {
    S = stage; frozen = false; acc = 0; peak = 0; view = 0; fingers = {}; undone = false; pitchPts = []; chordHist = []; shown = []; lastNote = null; chordBuf = null;
    makeBuf(); RS.mic.start();
  };
  M.stop = function () { RS.mic.stop(); };
  M.resize = function () { makeBuf(); };
  M.setView = function (v) { view = v % 3; applyView(); };

  // One tap freezes. A second finger landing right after the first changes the view instead (and undoes that freeze).
  M.down = function (id) {
    var t = performance.now();
    var n = Object.keys(fingers).length;
    fingers[id] = t;
    if (n === 0) { frozen = !frozen; twoAt = t; undone = false; }
    else if (n === 1 && t - twoAt < 450 && !undone) { undone = true; frozen = !frozen; M.setView(view + 1); }
  };
  M.up = function (id) { delete fingers[id]; };

  // ---- notes ----
  function midiOf(hz) { return 69 + 12 * Math.log(hz / 440) / Math.LN2; }
  function nameOf(m) { var r = Math.round(m); return NAMES[((r % 12) + 12) % 12] + Math.floor(r / 12 - 1); }
  function hzOf(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  // Several notes at once: find the strongest note by its harmonics, take its harmonics away, and look again.
  function detectChord() {
    var an = RS.mic.analyser;
    if (!an) return [];
    var n = an.frequencyBinCount;
    if (!chordBuf || chordBuf.length !== n) chordBuf = new Float32Array(n);
    an.getFloatFrequencyData(chordBuf);
    var sr = an.context.sampleRate, bh = sr / an.fftSize, k, maxdb = -Infinity;
    for (k = 2; k < n; k++) if (chordBuf[k] > maxdb) maxdb = chordBuf[k];
    if (maxdb < -80) return [];
    var mag = new Float32Array(n);
    for (k = 0; k < n; k++) mag[k] = Math.pow(10, (chordBuf[k] - maxdb) / 20);
    function at(f) {
      var kk = Math.round(f / bh), m = 0;
      for (var j = kk - 1; j <= kk + 1; j++) if (j > 0 && j < n && mag[j] > m) m = mag[j];
      return m;
    }
    var notes = [], first = 0, round;
    for (round = 0; round < 6; round++) {
      var best = -1, bestSal = 0;
      for (var m = 48; m <= 84; m++) {
        var f = hzOf(m), p1 = at(f);
        if (p1 < 0.15) continue;
        var sal = 0;
        for (var h = 1; h <= 5; h++) { if (f * h > 4000) break; sal += at(f * h) / Math.sqrt(h); }
        if (sal > bestSal) { bestSal = sal; best = m; }
      }
      if (best < 0) break;
      if (!round) first = bestSal;
      if (bestSal < first * 0.4 || bestSal < 0.5) break;
      notes.push(best);
      var fb = hzOf(best);
      for (var hh = 1; hh <= 8; hh++) {                        // remove this note's harmonics so they are not counted again
        var kc = Math.round(fb * hh / bh);
        for (var j = kc - 2; j <= kc + 2; j++) if (j > 0 && j < n) mag[j] *= 0.1;
      }
    }
    return notes.sort(function (a, b) { return a - b; });
  }

  // ---- staff drawing ----
  var LETTER = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6], SHARP = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0];
  function diatonic(m) { return (Math.floor(m / 12) - 1) * 7 + LETTER[((m % 12) + 12) % 12]; }
  function drawStaff(g, w, h, notes) {
    var gap = Math.max(14, Math.min(28, h * 0.034)), cx0 = w * 0.1, cx1 = w * 0.9, yc = h * 0.5;       // yc: middle C
    function yOf(d) { return yc - (d - 28) * gap / 2; }
    g.strokeStyle = RS.pal.ink; g.lineWidth = 2.5; g.lineCap = 'round';
    [30, 32, 34, 36, 38, 18, 20, 22, 24, 26].forEach(function (d) { g.beginPath(); g.moveTo(cx0, yOf(d)); g.lineTo(cx1, yOf(d)); g.stroke(); });
    g.lineWidth = 4; g.beginPath(); g.moveTo(cx0, yOf(38)); g.lineTo(cx0, yOf(18)); g.stroke();
    // Treble clef (a drawn spiral) and bass clef (a drawn hook).
    g.lineWidth = 4; g.beginPath();
    var gx = cx0 + gap * 2.2, gy = yOf(32);
    g.moveTo(gx - gap * 0.2, yOf(27)); g.bezierCurveTo(gx + gap * 0.9, yOf(28), gx + gap * 0.9, yOf(33.5), gx, yOf(33.5));
    g.bezierCurveTo(gx - gap * 1.2, yOf(33.5), gx - gap * 1.2, yOf(29), gx + gap * 0.1, yOf(29.2)); g.bezierCurveTo(gx + gap * 0.8, yOf(29.4), gx + gap * 0.7, yOf(32.3), gx, yOf(32.3));
    g.moveTo(gx, yOf(39.5)); g.bezierCurveTo(gx + gap * 0.6, yOf(37), gx - gap * 0.2, yOf(35), gx - gap * 0.3, yOf(31)); g.lineTo(gx - gap * 0.3, yOf(26)); g.stroke();
    var bx = cx0 + gap * 2.2, by = yOf(24);                        // the bass clef starts on the F line
    g.beginPath(); g.moveTo(bx - gap * 1.0, by - gap * 0.35);
    g.bezierCurveTo(bx - gap * 0.4, by - gap * 1.5, bx + gap * 1.1, by - gap * 1.2, bx + gap * 0.7, by + gap * 0.2);
    g.bezierCurveTo(bx + gap * 0.4, by + gap * 1.4, bx - gap * 0.5, by + gap * 2.2, bx - gap * 1.0, by + gap * 2.9); g.stroke();
    g.fillStyle = RS.pal.ink; g.beginPath(); g.arc(bx + gap * 1.5, by - gap * 0.5, gap * 0.14, 0, Math.PI * 2); g.arc(bx + gap * 1.5, by + gap * 0.5, gap * 0.14, 0, Math.PI * 2); g.fill();
    // Notes, spread a little so close notes do not sit on top of each other.
    var nx = (cx0 + cx1) / 2 + gap * 2, lastD = -99, shift = 0;
    notes.forEach(function (m, i) {
      var d = diatonic(m), y = yOf(d), sharp = SHARP[((m % 12) + 12) % 12];
      shift = (d - lastD <= 1 && i) ? shift + 1 : 0; lastD = d;
      var x = nx + (shift % 2) * gap * 1.5;
      g.strokeStyle = RS.pal.ink; g.lineWidth = 2.5;
      if (d <= 28) for (var l = 28; l >= d; l -= 2) { g.beginPath(); g.moveTo(x - gap * 1.0, yOf(l)); g.lineTo(x + gap * 1.0, yOf(l)); g.stroke(); }
      if (d >= 40) for (var l2 = 40; l2 <= d; l2 += 2) { g.beginPath(); g.moveTo(x - gap * 1.0, yOf(l2)); g.lineTo(x + gap * 1.0, yOf(l2)); g.stroke(); }
      var col = 'hsl(' + ((m % 12) * 30) + ',85%,68%)';
      g.beginPath(); g.ellipse(x, y, gap * 0.62, gap * 0.46, -0.3, 0, Math.PI * 2);
      g.fillStyle = col; g.shadowColor = col; g.shadowBlur = 14; g.fill(); g.shadowBlur = 0; g.lineWidth = 3; g.stroke();
      if (sharp) { g.fillStyle = RS.pal.ink; g.font = 'bold ' + Math.round(gap * 1.4) + 'px "Quicksand", system-ui, sans-serif'; g.textAlign = 'right'; g.fillText('♯', x - gap * 0.8, y + gap * 0.5); g.textAlign = 'left'; }
    });
    // Names underneath.
    g.fillStyle = RS.pal.ink; g.font = 'bold ' + Math.round(Math.max(16, gap * 1.2)) + 'px "Quicksand", system-ui, sans-serif'; g.textAlign = 'center';
    g.fillText(notes.map(nameOf).join('   '), w / 2, yOf(10));
    g.textAlign = 'left';
  }

  // ---- views ----
  function drawHeat(g, w, h, dt) {
    var an = RS.mic.analyser, data = RS.mic.freqData;
    if (an && data && !frozen) {
      acc += dt * 60 * RS.speed();                              // columns per frame follow the visual speed
      while (acc >= 1) {
        acc -= 1;
        an.getByteFrequencyData(data);
        bg.drawImage(buf, -COL_W, 0);
        var bh = an.context.sampleRate / an.fftSize, x = buf.width - COL_W, step = 3;
        bg.fillStyle = RS.pal.vanilla; bg.fillRect(x, 0, COL_W, buf.height);
        for (var y = 0; y < buf.height; y += step) {
          var f = FMIN * Math.pow(FMAX / FMIN, 1 - (y + step / 2) / buf.height);
          var k = Math.min(data.length - 1, Math.round(f / bh));
          var v = data[k] / 255;
          v = Math.min(1, Math.max(0, (v - 0.12) / 0.78));
          if (v > 0.02) { bg.fillStyle = heat(v); bg.fillRect(x, y, COL_W, step); }
          if (v > peak) peak = v;
        }
      }
    }
    g.drawImage(buf, 0, 0, w, h);
    g.strokeStyle = RS.pal.ink; g.lineWidth = 3; g.globalAlpha = 0.45;
    [110, 220, 440, 880, 1760, 3520].forEach(function (f) {
      var y = h * (1 - Math.log(f / FMIN) / Math.log(FMAX / FMIN));
      g.beginPath(); g.moveTo(0, y); g.lineTo(14, y); g.stroke();
    });
    g.globalAlpha = 1;
  }
  var M0 = 45, M1 = 81;                                          // A2 to A5: a singing range
  function pitchY(m, h) { return h * (0.92 - 0.84 * (m - M0) / (M1 - M0)); }
  function drawPitch(g, w, h, dt, t) {
    g.fillStyle = RS.pal.vanilla; g.fillRect(0, 0, w, h);
    var m;
    for (m = M0; m <= M1; m++) {                                 // a band for every note, with the name of each C and its neighbours
      var pc = ((m % 12) + 12) % 12, nat = [0, 2, 4, 5, 7, 9, 11].indexOf(pc) >= 0;
      if (nat) { g.fillStyle = pc === 0 ? 'rgba(255,208,181,0.55)' : 'rgba(198,236,217,0.3)'; g.fillRect(0, pitchY(m + 0.5, h), w, pitchY(m - 0.5, h) - pitchY(m + 0.5, h)); }
    }
    g.fillStyle = RS.pal.ink; g.font = 'bold 15px "Quicksand", system-ui, sans-serif'; g.globalAlpha = 0.7;
    for (m = M0; m <= M1; m++) { var p = ((m % 12) + 12) % 12; if ([0, 2, 4, 5, 7, 9, 11].indexOf(p) >= 0) g.fillText(nameOf(m), w - 54, pitchY(m, h) + 5); }
    g.globalAlpha = 1;
    var p = !frozen && RS.mic.state === 'on' ? RS.mic.pitch() : null, speed = w / 8;
    if (!frozen) for (var i = 0; i < pitchPts.length; i++) pitchPts[i].x -= speed * dt;
    while (pitchPts.length && pitchPts[0].x < -20) pitchPts.shift();
    if (p && p.hz > 70 && p.hz < 1000) {
      var mm = midiOf(p.hz);
      if (!prevHz || Math.abs(Math.log(p.hz / prevHz)) < 0.2) { pitchPts.push({ x: w * 0.82, y: pitchY(mm, h), m: mm, t: t, join: !!prevHz }); }
      prevHz = p.hz; lastNote = { m: mm, t: t };
    } else prevHz = 0;
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (i = 1; i < pitchPts.length; i++) {
      var a = pitchPts[i - 1], b = pitchPts[i];
      if (!b.join || b.x - a.x > 40) continue;
      var col = 'hsl(' + (((b.m % 12) + 12) % 12 * 30) + ',85%,60%)';
      g.strokeStyle = RS.pal.ink; g.lineWidth = 12; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
      g.strokeStyle = col; g.lineWidth = 7; g.shadowColor = col; g.shadowBlur = 12; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); g.shadowBlur = 0;
    }
    // The note you are on: a big name, and a needle for sharp or flat.
    if (lastNote && t - lastNote.t < 0.6) {
      var r = Math.round(lastNote.m), cents = (lastNote.m - r) * 100, off = Math.abs(cents) < 12;
      g.fillStyle = off ? '#5bbf84' : RS.pal.ink; g.font = 'bold ' + Math.round(Math.min(w, h) * 0.12) + 'px "Quicksand", system-ui, sans-serif'; g.textAlign = 'center';
      g.fillText(nameOf(r), w * 0.5, h * 0.2);
      g.strokeStyle = RS.pal.ink; g.lineWidth = 4; g.globalAlpha = 0.35; g.beginPath(); g.moveTo(w * 0.5 - 80, h * 0.26); g.lineTo(w * 0.5 + 80, h * 0.26); g.stroke(); g.globalAlpha = 1;
      g.fillStyle = off ? '#5bbf84' : RS.pal.coral; g.beginPath(); g.arc(w * 0.5 + (cents / 50) * 80, h * 0.26, 10, 0, Math.PI * 2); g.fill(); g.strokeStyle = RS.pal.ink; g.lineWidth = 3; g.stroke();
      g.textAlign = 'left';
    }
  }
  function drawChords(g, w, h, dt, t) {
    g.fillStyle = RS.pal.vanilla; g.fillRect(0, 0, w, h);
    if (RS.mic.analyser && !frozen && t - lastChordAt > 0.1) {
      lastChordAt = t;
      var now = detectChord();
      chordHist.push(now); if (chordHist.length > 6) chordHist.shift();
      var count = {};
      chordHist.forEach(function (c) { c.forEach(function (m) { count[m] = (count[m] || 0) + 1; }); });
      var stable = Object.keys(count).filter(function (m) { return count[m] >= 3; }).map(Number).sort(function (a, b) { return a - b; });
      if (stable.length) { shown = stable; shownAt = t; }
    }
    if (t - shownAt > 1.8 && !frozen) shown = [];
    drawStaff(g, w, h, shown);
  }

  M.draw = function (g, w, h, dt) {
    var t = performance.now() / 1000;
    if (view === 0) drawHeat(g, w, h, dt);
    else if (view === 1) drawPitch(g, w, h, dt, t);
    else drawChords(g, w, h, dt, t);
    if (frozen) {                                               // pause mark
      g.fillStyle = RS.pal.paper; g.strokeStyle = RS.pal.ink; g.lineWidth = 3;
      [28, 52].forEach(function (x) { g.beginPath(); g.rect(x, 24, 14, 40); g.fill(); g.stroke(); });
    }
    for (var i = 0; i < 3; i++) {                               // which view: three dots at the top right
      g.beginPath(); g.arc(w - 130 + i * 22, 34, 7, 0, Math.PI * 2); g.fillStyle = i === view ? RS.pal.coral : 'rgba(255,255,255,0.8)'; g.fill();
      g.strokeStyle = RS.pal.ink; g.lineWidth = 2.5; g.globalAlpha = i === view ? 1 : 0.5; g.stroke(); g.globalAlpha = 1;
    }
    var ok = RS.mic.state === 'on';
    if (!ok) {                                                  // microphone off: crossed-out mic
      var mx = 40, my = h - 46;
      g.strokeStyle = RS.pal.ink; g.lineWidth = 3; g.fillStyle = RS.pal.peach;
      g.beginPath(); g.rect(mx - 9, my - 18, 18, 28); g.fill(); g.stroke();
      g.strokeStyle = RS.pal.coral; g.lineWidth = 4; g.beginPath(); g.moveTo(mx - 20, my - 22); g.lineTo(mx + 20, my + 24); g.stroke();
    }
  };
  M.info = function () {
    return { frozen: frozen, view: VIEWS[view], mic: RS.mic.state, peak: Math.round(peak * 100) / 100, notes: shown.map(nameOf), midi: shown.slice(),
      note: lastNote ? nameOf(lastNote.m) : '', hz: prevHz ? Math.round(prevHz) : 0 };
  };
})();
