// Mode 1: Ripples. Tap: glowing rings grow while a soft note rings. Hold to sustain, slide to change the note.
(function () {
  'use strict';
  var M = RS.modes.ripples = { id: 'ripples', name: 'Ripples', icon: '💧' };
  var S, rings = [], touches = {}, bg = null, kind = 0;

  function makeBg(w, h) {
    var d = Math.min(window.devicePixelRatio || 1, 2);
    bg = document.createElement('canvas');
    bg.width = Math.round(w * d); bg.height = Math.round(h * d);
    var g = bg.getContext('2d');
    g.scale(d, d);
    g.fillStyle = RS.pal.vanilla; g.fillRect(0, 0, w, h);
    var pal = [RS.pal.peach, RS.pal.mint, RS.pal.sky, RS.pal.lilac, RS.pal.sage, RS.pal.sun];
    var pick = function () { return pal[Math.floor(Math.random() * pal.length)]; };
    var i, j;
    g.globalAlpha = 0.55;
    if (kind === 0) {                                   // dots
      var step = 60;
      for (j = 0; j * step < h + step; j++) for (i = 0; i * step < w + step; i++) {
        g.fillStyle = pick(); g.beginPath();
        g.arc(i * step + (j % 2) * step / 2, j * step, 15, 0, Math.PI * 2); g.fill();
      }
    } else if (kind === 1) {                            // diagonal stripes
      g.lineWidth = 24;
      for (i = -h; i < w + h; i += 52) {
        g.strokeStyle = pick(); g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke();
      }
    } else if (kind === 2) {                            // waves
      g.lineWidth = 16;
      for (j = 0; j * 44 < h + 44; j++) {
        g.strokeStyle = pick(); g.beginPath();
        for (i = 0; i <= w; i += 12) {
          var y = j * 44 + Math.sin(i / 60 + j) * 14;
          if (i) g.lineTo(i, y); else g.moveTo(i, y);
        }
        g.stroke();
      }
    } else {                                            // rings around a random point
      var cx = Math.random() * w, cy = Math.random() * h;
      g.lineWidth = 20;
      for (i = 30; i < Math.hypot(w, h) + 60; i += 48) {
        g.strokeStyle = pick(); g.beginPath(); g.arc(cx, cy, i, 0, Math.PI * 2); g.stroke();
      }
    }
    g.globalAlpha = 1;
  }
  M.newPattern = function () { kind = Math.floor(Math.random() * 4); makeBg(S.w, S.h); };

  M.start = function (stage) { S = stage; rings = []; touches = {}; M.newPattern(); };
  M.stop = function () {
    Object.keys(touches).forEach(function (id) { release(touches[id], 0.3); });
    touches = {}; rings = [];
  };
  M.resize = function () { makeBg(S.w, S.h); };

  function freqAt(x) { return RS.audio.mtof(RS.audio.midiFromUnit(x / S.w, 2, 60)); }
  function emit(x, y, hue) { rings.push({ x: x, y: y, age: 0, hue: hue }); if (rings.length > 60) rings.shift(); }
  function release(t, r) { if (t.a) t.a.release(r); if (t.b) t.b.release(r); }

  M.down = function (id, x, y) {
    var f = freqAt(x), hue = (x / S.w) * 300 + Math.random() * 40;
    var t = touches[id] = { x: x, y: y, hue: hue, lastRing: performance.now(), lx: x, ly: y };
    t.a = RS.audio.voice(f, { type: 'sine', gain: 0.22, attack: 0.03 });
    t.b = RS.audio.voice(f * 2, { type: 'triangle', gain: 0.05, attack: 0.05 });
    emit(x, y, hue);
  };
  M.move = function (id, x, y) {
    var t = touches[id];
    if (!t) return;
    t.x = x; t.y = y;
    var f = freqAt(x);
    if (t.a) t.a.setFreq(f, 0.05);
    if (t.b) t.b.setFreq(f * 2, 0.05);
    t.hue = (x / S.w) * 300;
    if (Math.hypot(x - t.lx, y - t.ly) > 70) { emit(x, y, t.hue); t.lx = x; t.ly = y; t.lastRing = performance.now(); }
  };
  M.up = function (id) {
    var t = touches[id];
    if (!t) return;
    release(t, 1.6);
    delete touches[id];
  };

  M.draw = function (g, w, h, dt) {
    var sp = RS.speed(), life = 3.4, now = performance.now();
    g.drawImage(bg, 0, 0, w, h);
    Object.keys(touches).forEach(function (id) {            // a held touch keeps dropping rings
      var t = touches[id];
      if (now - t.lastRing > 480 / sp) { emit(t.x, t.y, t.hue); t.lastRing = now; }
    });
    g.lineCap = 'round';
    for (var i = rings.length - 1; i >= 0; i--) {
      var r = rings[i];
      r.age += dt * sp;
      if (r.age > life) { rings.splice(i, 1); continue; }
      var radius = r.age * 270, a = Math.pow(1 - r.age / life, 1.3);
      var hue = (r.hue + r.age * 50) % 360, col = 'hsl(' + hue + ',88%,62%)';
      g.globalAlpha = a * 0.7; g.strokeStyle = RS.pal.ink; g.lineWidth = 10;
      g.beginPath(); g.arc(r.x, r.y, radius, 0, Math.PI * 2); g.stroke();
      g.globalAlpha = a; g.strokeStyle = col; g.lineWidth = 5.5; g.shadowColor = col; g.shadowBlur = 24;
      g.beginPath(); g.arc(r.x, r.y, radius, 0, Math.PI * 2); g.stroke();
      g.shadowBlur = 0;
      if (radius > 40) {
        g.globalAlpha = a * 0.8; g.strokeStyle = 'hsl(' + ((hue + 50) % 360) + ',90%,75%)'; g.lineWidth = 3;
        g.beginPath(); g.arc(r.x, r.y, radius * 0.72, 0, Math.PI * 2); g.stroke();
      }
    }
    g.globalAlpha = 1;
    Object.keys(touches).forEach(function (id) {            // glow under a held finger
      var t = touches[id], col = 'hsl(' + t.hue + ',90%,66%)';
      g.fillStyle = col; g.shadowColor = col; g.shadowBlur = 30;
      g.beginPath(); g.arc(t.x, t.y, 15, 0, Math.PI * 2); g.fill(); g.shadowBlur = 0;
      g.strokeStyle = RS.pal.ink; g.lineWidth = 3; g.stroke();
    });
  };
  M.info = function () { return { rings: rings.length, held: Object.keys(touches).length, pattern: kind }; };
})();
