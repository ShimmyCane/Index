// Mode 5: Two-finger span. Big side (3/5): the distance between two fingers sets the note.
// Small side (2/5): the distance between two fingers sets the loudness. Lift your fingers and the note stays on.
// The note has an attack when you press and a decay while you hold.
(function () {
  'use strict';
  var M = RS.modes.span = { id: 'span', name: 'Two fingers', icon: '✌️' };
  var S, ptr = {}, voices = null, freq = 220, amp = 0.5, held = false, env0 = 0, lastMid = null, sparks = [], pulses = [], lastPulse = 0, prevBig = 0;
  var SPLIT = 0.6;

  M.start = function (stage) { S = stage; ptr = {}; voices = null; held = false; sparks = []; pulses = []; lastMid = null; prevBig = 0; amp = 0.5; freq = 220; };
  M.stop = function () { stopSound(0.4); ptr = {}; };
  function stopSound(r) { if (voices) { voices.a.release(r || 0.6); voices.b.release(r || 0.6); voices = null; } held = false; lastMid = null; }
  M.stopNote = function () { stopSound(0.5); };

  function zone(x) { return x < S.w * SPLIT ? 'big' : 'small'; }
  function pair(z) {
    var ids = Object.keys(ptr).filter(function (id) { return zone(ptr[id].x) === z; }).sort();
    return ids.length >= 2 ? [ptr[ids[0]], ptr[ids[1]]] : null;
  }
  M.down = function (id, x, y) { ptr[id] = { x: x, y: y }; };
  M.move = function (id, x, y) { if (ptr[id]) { ptr[id].x = x; ptr[id].y = y; } };
  M.up = function (id) { delete ptr[id]; };

  function pitchFrom(d) {
    var u = Math.max(0, Math.min(1, (d - 50) / (S.w * SPLIT * 0.75)));
    if (RS.settings.glide === 'glide') return 130.81 * Math.pow(2, u * 3);          // C3 up three octaves, smooth
    return RS.audio.mtof(RS.audio.midiFromUnit(u, 3, 48));                          // steps on the chosen scale
  }
  function ampFrom(d) { return Math.max(0, Math.min(1, (d - 30) / (Math.min(S.h, S.w * (1 - SPLIT) * 1.6) * 0.7))); }

  M.draw = function (g, w, h, dt) {
    var now = performance.now() / 1000, sp = RS.speed();
    g.fillStyle = RS.pal.vanilla; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(198,236,217,0.5)'; g.fillRect(w * SPLIT, 0, w * (1 - SPLIT), h);
    g.strokeStyle = RS.pal.ink; g.globalAlpha = 0.3; g.lineWidth = 3; g.setLineDash([10, 12]);
    g.beginPath(); g.moveTo(w * SPLIT, 0); g.lineTo(w * SPLIT, h); g.stroke(); g.setLineDash([]); g.globalAlpha = 1;

    var big = pair('big'), small = pair('small'), mid = null;
    if (big) {
      var d = Math.hypot(big[0].x - big[1].x, big[0].y - big[1].y);
      freq = pitchFrom(d);
      mid = { x: (big[0].x + big[1].x) / 2, y: (big[0].y + big[1].y) / 2 };
      lastMid = mid;
      if (!prevBig) env0 = now;                                // a new two-finger press: attack again
      if (!voices) {
        voices = { a: RS.audio.voice(freq, { type: 'triangle', gain: 0.0001, attack: 0.01 }), b: RS.audio.voice(freq * 2, { type: 'sine', gain: 0.0001, attack: 0.01 }) };
        env0 = now;
      }
      held = true;
    }
    prevBig = big ? 1 : 0;
    if (small) amp = ampFrom(Math.hypot(small[0].x - small[1].x, small[0].y - small[1].y));

    if (voices) {
      var decay = Math.exp(-(now - env0) / 1.2);               // loud attack, decay while held, then it settles
      var level = amp * (0.3 + 0.7 * decay);
      voices.a.setFreq(freq, 0.04); voices.b.setFreq(freq * 2, 0.04);
      voices.a.setGain(level * 0.45, 0.02); voices.b.setGain(level * 0.12, 0.02);
      if (amp < 0.03) stopSound(0.4);                          // fingers drawn together on the small side: quiet
    }

    var hue = ((Math.log(freq / 130) / Math.log(2)) / 3) * 300;
    var col = 'hsl(' + hue + ',88%,62%)';

    // The note: a glowing line between the fingers with sparks.
    if (big) {
      g.lineCap = 'round';
      g.strokeStyle = RS.pal.ink; g.lineWidth = 12; g.beginPath(); g.moveTo(big[0].x, big[0].y); g.lineTo(big[1].x, big[1].y); g.stroke();
      g.strokeStyle = col; g.shadowColor = col; g.shadowBlur = 26; g.lineWidth = 6;
      g.beginPath(); g.moveTo(big[0].x, big[0].y); g.lineTo(big[1].x, big[1].y); g.stroke(); g.shadowBlur = 0;
      for (var s = 0; s < 3; s++) {
        var u = Math.random();
        sparks.push({ x: big[0].x + (big[1].x - big[0].x) * u, y: big[0].y + (big[1].y - big[0].y) * u,
          vx: (Math.random() - 0.5) * 220, vy: (Math.random() - 0.5) * 220, life: 1, hue: hue + Math.random() * 40 });
      }
    }
    // The loudness: a circle between the small-side fingers.
    if (small) {
      var cx = (small[0].x + small[1].x) / 2, cy = (small[0].y + small[1].y) / 2;
      var rr = Math.hypot(small[0].x - small[1].x, small[0].y - small[1].y) / 2;
      g.strokeStyle = RS.pal.ink; g.lineWidth = 5; g.fillStyle = 'rgba(255,224,138,0.6)';
      g.beginPath(); g.arc(cx, cy, Math.max(8, rr), 0, Math.PI * 2); g.fill(); g.stroke();
    }
    // A held note keeps pulsing where it was left.
    if (voices && !big && lastMid) {
      if (now - lastPulse > 0.6 / sp) { pulses.push({ x: lastMid.x, y: lastMid.y, age: 0, col: col }); lastPulse = now; }
      var pr = 22 + amp * 24 + Math.sin(now * 5) * 4;
      g.fillStyle = col; g.shadowColor = col; g.shadowBlur = 24;
      g.beginPath(); g.arc(lastMid.x, lastMid.y, pr, 0, Math.PI * 2); g.fill(); g.shadowBlur = 0;
      g.strokeStyle = RS.pal.ink; g.lineWidth = 4; g.stroke();
    }
    for (var i = pulses.length - 1; i >= 0; i--) {
      var p = pulses[i]; p.age += dt * sp;
      if (p.age > 2) { pulses.splice(i, 1); continue; }
      g.globalAlpha = 1 - p.age / 2; g.strokeStyle = p.col; g.lineWidth = 4; g.shadowColor = p.col; g.shadowBlur = 16;
      g.beginPath(); g.arc(p.x, p.y, 30 + p.age * 130, 0, Math.PI * 2); g.stroke(); g.shadowBlur = 0; g.globalAlpha = 1;
    }
    for (i = sparks.length - 1; i >= 0; i--) {
      var q = sparks[i]; q.life -= dt * 1.6 * sp;
      if (q.life <= 0) { sparks.splice(i, 1); continue; }
      q.x += q.vx * dt; q.y += q.vy * dt;
      g.globalAlpha = q.life; g.fillStyle = 'hsl(' + q.hue + ',95%,68%)'; g.shadowColor = g.fillStyle; g.shadowBlur = 12;
      g.beginPath(); g.arc(q.x, q.y, 3 + q.life * 5, 0, Math.PI * 2); g.fill(); g.shadowBlur = 0; g.globalAlpha = 1;
    }
    if (sparks.length > 250) sparks.splice(0, sparks.length - 250);
    // Fingers.
    Object.keys(ptr).forEach(function (id) {
      g.strokeStyle = RS.pal.ink; g.lineWidth = 4; g.fillStyle = RS.pal.paper;
      g.beginPath(); g.arc(ptr[id].x, ptr[id].y, 20, 0, Math.PI * 2); g.fill(); g.stroke();
    });
  };
  M.info = function () { return { held: !!voices, freq: Math.round(freq), amp: Math.round(amp * 100) / 100, fingers: Object.keys(ptr).length }; };
})();
