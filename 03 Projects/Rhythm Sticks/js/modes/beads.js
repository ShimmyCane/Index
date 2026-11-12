// Mode 2: Beads, a beat looper.
// The microphone hears sharp sounds; each becomes a bead on a ring and is played back as a soft synth drum.
// Screen taps: tap = record, tap = loop it, tap = add a layer, double tap = wipe and record anew.
(function () {
  'use strict';
  var M = RS.modes.beads = { id: 'beads', name: 'Beads', icon: '🥁' };
  var S, unsub = null;
  var state, layers, overlay, loopLen, loopStart, recStart, curLayer, lastPhase;
  var pops, pulse, tapDown, tapTimer, lastTapUp;
  var COLORS = [RS.pal.coral, RS.pal.mint, RS.pal.sun, RS.pal.sky, RS.pal.lilac];
  var PREVIEW = 4;                                    // seconds per turn of the ring while the first recording runs

  function now() { return performance.now() / 1000; }
  function reset() {
    state = 'idle'; layers = []; overlay = null; loopLen = 0; loopStart = 0; recStart = 0; curLayer = null; lastPhase = 0;
    pops = []; pulse = []; tapDown = null; lastTapUp = 0;
  }

  M.start = function (stage) {
    S = stage; reset();
    clearTimeout(tapTimer);
    RS.mic.start();
    unsub = RS.mic.onOnset(onset);
  };
  M.stop = function () {
    clearTimeout(tapTimer);
    if (unsub) unsub(); unsub = null;
    RS.mic.stop();
  };

  function phase(t) { return (((t - loopStart) % loopLen) + loopLen) % loopLen; }

  function onset(strength) {
    var t = now(), p, hit;
    if (state === 'rec') {
      p = t - recStart;
      hit = { p: p, v: strength };
      curLayer.hits.push(hit);
      RS.audio.layer(0, 0.5 + 0.5 * strength);
      pops.push({ layer: 0, p: p, born: t });
    } else if (state === 'loop' && overlay) {
      p = phase(t);
      hit = { p: p, v: strength };
      overlay.layer.hits.push(hit);
      RS.audio.layer(overlay.layer.voice, 0.5 + 0.5 * strength);
      pops.push({ layer: overlay.layer.voice, p: p, born: t });
    } else {                                           // idle or plain loop: a free bead and a kick
      RS.audio.layer(0, 0.5 + 0.5 * strength);
      pops.push({ free: true, x: 0.15 + Math.random() * 0.7, y: 0.5 + Math.random() * 0.3, born: t });
    }
    if (pops.length > 80) pops.shift();
  }

  function singleTap() {
    var t = now();
    if (state === 'idle') {
      state = 'rec'; recStart = t; curLayer = { hits: [], voice: 0 };
    } else if (state === 'rec') {
      var len = t - recStart;
      if (len < 0.4 || !curLayer.hits.length) { state = 'idle'; curLayer = null; return; }   // nothing heard
      loopLen = len; loopStart = recStart; layers = [curLayer]; curLayer = null;
      state = 'loop'; lastPhase = phase(t);
    } else if (state === 'loop') {
      if (overlay) commitOverlay();
      else overlay = { start: t, layer: { hits: [], voice: layers.length % 5 } };
    }
  }
  function commitOverlay() {
    if (overlay.layer.hits.length) layers.push(overlay.layer);
    overlay = null;
  }
  function doubleTap() {
    layers = []; overlay = null; loopLen = 0; pops = []; pulse = [];
    state = 'rec'; recStart = now(); curLayer = { hits: [], voice: 0 };
  }

  M.down = function (id, x, y) { tapDown = { id: id, x: x, y: y, t: now() }; };
  M.move = function () {};
  M.up = function (id, x, y) {
    if (!tapDown || tapDown.id !== id) return;
    var moved = Math.hypot(x - tapDown.x, y - tapDown.y), dur = now() - tapDown.t;
    tapDown = null;
    if (moved > 24 || dur > 0.5) return;               // a drag or a long press is not a tap
    var t = now();
    if (t - lastTapUp < 0.32) { clearTimeout(tapTimer); lastTapUp = 0; doubleTap(); return; }
    lastTapUp = t;
    clearTimeout(tapTimer);
    tapTimer = setTimeout(function () { lastTapUp = 0; try { singleTap(); } catch (e) { RS.err('Beads tap', e); } }, 330);
  };

  function ringCenter(w, h) { return { x: w / 2, y: h / 2, r: Math.min(w, h) * 0.3 }; }
  function beadAt(g, c, ang, rad, size, col, glow) {
    var x = c.x + Math.cos(ang) * c.r, y = c.y + Math.sin(ang) * c.r;
    g.beginPath(); g.arc(x, y, size, 0, Math.PI * 2);
    g.fillStyle = col;
    if (glow > 0) { g.shadowColor = col; g.shadowBlur = 24 * glow; }
    g.fill(); g.shadowBlur = 0;
    g.strokeStyle = RS.pal.ink; g.lineWidth = 3; g.stroke();
  }

  M.draw = function (g, w, h, dt) {
    var t = now(), c = ringCenter(w, h), i, j, lay, hit;
    g.fillStyle = RS.pal.vanilla; g.fillRect(0, 0, w, h);

    // The mic level breathes in the middle.
    var lv = Math.min(1, RS.mic.level * 4);
    g.fillStyle = 'rgba(198,236,217,0.8)';
    g.beginPath(); g.arc(c.x, c.y, c.r * (0.18 + lv * 0.5), 0, Math.PI * 2); g.fill();

    // The ring.
    g.lineCap = 'round';
    g.strokeStyle = RS.pal.ink; g.lineWidth = 16 + 4;
    g.globalAlpha = 0.25; g.beginPath(); g.arc(c.x, c.y, c.r, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
    g.strokeStyle = RS.pal.peach; g.lineWidth = 14;
    if (state === 'idle') g.setLineDash([2, 22]);
    g.beginPath(); g.arc(c.x, c.y, c.r, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);

    // Recording: a breathing coral ring and beads laid out by time.
    if (state === 'rec' || overlay) {
      var br = 0.5 + 0.5 * Math.sin(t * 6);
      g.strokeStyle = RS.pal.coral; g.lineWidth = 5 + br * 5; g.globalAlpha = 0.9;
      g.beginPath(); g.arc(c.x, c.y, c.r + 26, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
    }
    if (state === 'rec') {
      var el = t - recStart;
      var a0 = -Math.PI / 2 + (el % PREVIEW) / PREVIEW * Math.PI * 2;
      g.strokeStyle = RS.pal.ink; g.lineWidth = 4;
      g.beginPath(); g.moveTo(c.x, c.y); g.lineTo(c.x + Math.cos(a0) * c.r, c.y + Math.sin(a0) * c.r); g.stroke();
      curLayer.hits.forEach(function (hh) {
        var age = Math.max(0, 1 - (t - (recStart + hh.p)) / 0.4);
        beadAt(g, c, -Math.PI / 2 + (hh.p % PREVIEW) / PREVIEW * Math.PI * 2, c.r, 15 + age * 10, COLORS[0], age);
      });
    }

    // Loop: play the layers and draw the beads.
    if (state === 'loop') {
      var ph = phase(t);
      var wrapped = ph < lastPhase;
      for (i = 0; i < layers.length; i++) {
        lay = layers[i];
        for (j = 0; j < lay.hits.length; j++) {
          hit = lay.hits[j];
          var crossed = wrapped ? (hit.p > lastPhase || hit.p <= ph) : (hit.p > lastPhase && hit.p <= ph);
          if (crossed) { RS.audio.layer(lay.voice, 0.45 + 0.4 * hit.v); hit.flash = t; }
        }
      }
      lastPhase = ph;
      if (overlay && t - overlay.start >= loopLen) commitOverlay();
      var all = layers.slice();
      if (overlay) all.push(overlay.layer);
      all.forEach(function (L) {
        L.hits.forEach(function (hh) {
          var f = Math.max(0, 1 - (t - (hh.flash || -9)) / 0.35);
          beadAt(g, c, -Math.PI / 2 + hh.p / loopLen * Math.PI * 2, c.r, 14 + f * 12, COLORS[L.voice % 5], f);
        });
      });
      var ang = -Math.PI / 2 + ph / loopLen * Math.PI * 2;
      g.strokeStyle = RS.pal.ink; g.lineWidth = 4;
      g.beginPath(); g.moveTo(c.x + Math.cos(ang) * (c.r - 34), c.y + Math.sin(ang) * (c.r - 34));
      g.lineTo(c.x + Math.cos(ang) * (c.r + 34), c.y + Math.sin(ang) * (c.r + 34)); g.stroke();
    }

    // Free beads float up when nothing is being recorded.
    var sp = RS.speed();
    pops = pops.filter(function (pp) { return t - pp.born < 1.6; });
    pops.forEach(function (pp) {
      if (!pp.free) return;
      var age = (t - pp.born) * sp, al = Math.max(0, 1 - age / 1.4);
      g.globalAlpha = al;
      var x = pp.x * w, y = pp.y * h - age * 90;
      g.beginPath(); g.arc(x, y, 20, 0, Math.PI * 2);
      g.fillStyle = COLORS[(Math.floor(pp.born * 7)) % 5]; g.shadowColor = g.fillStyle; g.shadowBlur = 18; g.fill(); g.shadowBlur = 0;
      g.strokeStyle = RS.pal.ink; g.lineWidth = 3; g.stroke();
      g.globalAlpha = 1;
    });

    // A small microphone mark in the lower-left; crossed out when the microphone is off.
    var mx = 40, my = h - 46, ok = RS.mic.state === 'on';
    g.strokeStyle = RS.pal.ink; g.lineWidth = 3; g.fillStyle = ok ? RS.pal.mint : RS.pal.peach;
    g.beginPath(); g.roundRect ? g.roundRect(mx - 9, my - 18, 18, 28, 9) : g.rect(mx - 9, my - 18, 18, 28); g.fill(); g.stroke();
    g.beginPath(); g.arc(mx, my - 2, 16, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
    g.beginPath(); g.moveTo(mx, my + 14); g.lineTo(mx, my + 22); g.stroke();
    if (!ok) { g.strokeStyle = RS.pal.coral; g.lineWidth = 4; g.beginPath(); g.moveTo(mx - 20, my - 22); g.lineTo(mx + 20, my + 24); g.stroke(); }
  };

  M.info = function () {
    return { state: state, layers: layers.length, hits: layers.map(function (l) { return l.hits.length; }), loopLen: loopLen, overlay: !!overlay };
  };
})();
