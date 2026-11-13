// Mode 5: Two fingers.
//   Big side (3/5): two fingers; how far apart they are sets the note, and the whole screen takes its colour from it.
//   Right side (2/5): one finger slides up to raise the volume and down to lower it; two fingers make the note pulse,
//   faster the farther apart they are. Lift your fingers and the note and the pulse stay.
// The note has an attack when you press and a decay while you hold.
(function () {
  'use strict';
  var M = RS.modes.span = { id: 'span', name: 'Two fingers', icon: '✌️' };
  var S, ptr = {}, voice1 = null, voice2 = null, freq = 220, vol = 0.6, held = false, env0 = 0, lastMid = null, sparks = [], pulses = [], lastPulse = 0, prevBig = 0;
  var pulseRate = 0, pulseDepth = 0, hue = 200, bright = 0.5;
  var SPLIT = 0.6;

  M.start = function (stage) {
    S = stage; ptr = {}; voice1 = voice2 = null; held = false; sparks = []; pulses = []; lastMid = null; prevBig = 0;
    vol = 0.6; freq = 220; pulseRate = 0; pulseDepth = 0; hue = 200; bright = 0.5;
  };
  M.stop = function () { stopSound(0.4); ptr = {}; };
  function stopSound(r) { if (voice1) { voice1.release(r || 0.6); voice2.release(r || 0.6); voice1 = voice2 = null; } held = false; lastMid = null; pulseRate = 0; pulseDepth = 0; }
  M.stopNote = function () { stopSound(0.5); };

  function zone(x) { return x < S.w * SPLIT ? 'big' : 'small'; }
  function pair(z) {
    var ids = Object.keys(ptr).filter(function (id) { return zone(ptr[id].x) === z; }).sort();
    return ids.length >= 2 ? [ptr[ids[0]], ptr[ids[1]]] : null;
  }
  function single(z) {
    var ids = Object.keys(ptr).filter(function (id) { return zone(ptr[id].x) === z; }).sort();
    return ids.length === 1 ? ptr[ids[0]] : null;
  }
  M.down = function (id, x, y) { ptr[id] = { x: x, y: y }; };
  M.move = function (id, x, y) { if (ptr[id]) { ptr[id].x = x; ptr[id].y = y; } };
  M.up = function (id) { delete ptr[id]; };

  function pitchFrom(d) {
    var u = Math.max(0, Math.min(1, (d - 50) / (S.w * SPLIT * 0.75)));
    if (RS.settings.glide === 'glide') return 130.81 * Math.pow(2, u * 3);          // C3 up three octaves, smooth
    return RS.audio.mtof(RS.audio.midiFromUnit(u, 3, 48));                          // steps on the chosen scale
  }
  function hueOf(f) { return ((Math.log(f / 130) / Math.log(2)) / 3) * 300; }

  M.draw = function (g, w, h, dt) {
    var now = performance.now() / 1000, sp = RS.speed(), i;
    var big = pair('big'), one = single('small'), two = pair('small'), mid = null;

    // ---- the note: two fingers on the big side ----
    if (big) {
      var d = Math.hypot(big[0].x - big[1].x, big[0].y - big[1].y);
      freq = pitchFrom(d);
      mid = { x: (big[0].x + big[1].x) / 2, y: (big[0].y + big[1].y) / 2 };
      lastMid = mid;
      if (!prevBig) env0 = now;                                // a new two-finger press: attack again
      if (!voice1) {
        voice1 = RS.audio.voice(freq, { type: 'triangle', gain: 0.0001, attack: 0.01, trem: true });
        voice2 = RS.audio.voice(freq * 2, { type: 'sine', gain: 0.0001, attack: 0.01, trem: true });
        env0 = now;
      }
      held = true;
    }
    prevBig = big ? 1 : 0;

    // ---- the volume: one finger slides on the right (up is louder) ----
    if (one) vol = Math.max(0, Math.min(1, 1 - (one.y - h * 0.08) / (h * 0.84)));
    // ---- the pulse: two fingers on the right ----
    if (two) {
      var dd = Math.hypot(two[0].x - two[1].x, two[0].y - two[1].y);
      var u2 = Math.max(0, Math.min(1, (dd - 40) / (Math.min(h, w * (1 - SPLIT) * 1.8) * 0.8)));
      pulseRate = 1 + u2 * 9; pulseDepth = 0.85;
    }
    if (voice1) {
      var decay = Math.exp(-(now - env0) / 1.2);               // loud attack, decay while held, then it settles
      var level = vol * (0.3 + 0.7 * decay);
      voice1.setFreq(freq, 0.04); voice2.setFreq(freq * 2, 0.04);
      voice1.setGain(level * 0.45, 0.02); voice2.setGain(level * 0.12, 0.02);
      voice1.setTrem(pulseRate || 1, pulseRate ? pulseDepth : 0); voice2.setTrem(pulseRate || 1, pulseRate ? pulseDepth : 0);
    }

    // ---- colour: the whole screen follows the note and the volume ----
    var th = hueOf(freq), tb = voice1 ? 0.35 + 0.6 * vol : 0.45;
    var dh = ((th - hue + 540) % 360) - 180;
    hue = (hue + dh * Math.min(1, dt * 8) + 360) % 360;
    bright += (tb - bright) * Math.min(1, dt * 6);
    var L = 90 - 10 * bright, Lr = 86 - 14 * bright;
    var gr = g.createLinearGradient(0, 0, w * SPLIT, h);
    gr.addColorStop(0, 'hsl(' + hue + ',' + (voice1 ? 75 : 40) + '%,' + L + '%)');
    gr.addColorStop(1, 'hsl(' + ((hue + 40) % 360) + ',' + (voice1 ? 70 : 35) + '%,' + (L + 3) + '%)');
    g.fillStyle = gr; g.fillRect(0, 0, w * SPLIT, h);
    g.fillStyle = 'hsl(' + ((hue + 150) % 360) + ',' + (voice1 ? 55 : 30) + '%,' + Lr + '%)'; g.fillRect(w * SPLIT, 0, w * (1 - SPLIT), h);
    g.strokeStyle = RS.pal.ink; g.globalAlpha = 0.3; g.lineWidth = 3; g.setLineDash([10, 12]);
    g.beginPath(); g.moveTo(w * SPLIT, 0); g.lineTo(w * SPLIT, h); g.stroke(); g.setLineDash([]); g.globalAlpha = 1;

    var col = 'hsl(' + hue + ',90%,58%)';
    // The volume fader on the right: a glowing bar with a thumb that holds where you left it.
    var fx = w * (SPLIT + (1 - SPLIT) * 0.5), fy0 = h * 0.08, fy1 = h * 0.92, ty = fy1 - (fy1 - fy0) * vol;
    g.lineCap = 'round';
    g.strokeStyle = 'rgba(47,45,61,0.25)'; g.lineWidth = 16; g.beginPath(); g.moveTo(fx, fy0); g.lineTo(fx, fy1); g.stroke();
    g.strokeStyle = col; g.lineWidth = 10; g.shadowColor = col; g.shadowBlur = 14; g.beginPath(); g.moveTo(fx, fy1); g.lineTo(fx, ty); g.stroke(); g.shadowBlur = 0;
    g.beginPath(); g.arc(fx, ty, 22 + (one ? 6 : 0), 0, Math.PI * 2); g.fillStyle = RS.pal.paper; g.fill(); g.strokeStyle = RS.pal.ink; g.lineWidth = 4; g.stroke();

    // The note: a glowing line between the fingers with sparks.
    if (big) {
      g.strokeStyle = RS.pal.ink; g.lineWidth = 12; g.beginPath(); g.moveTo(big[0].x, big[0].y); g.lineTo(big[1].x, big[1].y); g.stroke();
      g.strokeStyle = col; g.shadowColor = col; g.shadowBlur = 26; g.lineWidth = 6;
      g.beginPath(); g.moveTo(big[0].x, big[0].y); g.lineTo(big[1].x, big[1].y); g.stroke(); g.shadowBlur = 0;
      for (var s = 0; s < 3; s++) {
        var u = Math.random();
        sparks.push({ x: big[0].x + (big[1].x - big[0].x) * u, y: big[0].y + (big[1].y - big[0].y) * u,
          vx: (Math.random() - 0.5) * 220, vy: (Math.random() - 0.5) * 220, life: 1, hue: hue + Math.random() * 40 });
      }
    }
    // The pulse: rings that beat at the pulse speed between the two right-hand fingers, and keep beating when lifted.
    if (two) {
      var cx = (two[0].x + two[1].x) / 2, cy = (two[0].y + two[1].y) / 2;
      g.strokeStyle = RS.pal.ink; g.lineWidth = 4; g.setLineDash([5, 8]); g.beginPath(); g.moveTo(two[0].x, two[0].y); g.lineTo(two[1].x, two[1].y); g.stroke(); g.setLineDash([]);
    }
    if (voice1 && pulseRate) {
      var px = lastMid ? lastMid.x : w * 0.3, py = lastMid ? lastMid.y : h * 0.5;
      if (now - lastPulse > 1 / pulseRate) { pulses.push({ x: px, y: py, age: 0, col: col, r: 0.7 + vol * 0.6 }); lastPulse = now; if (pulses.length > 40) pulses.shift(); }
    }
    // A held note keeps glowing where it was left.
    if (voice1 && !big && lastMid) {
      var pr = 22 + vol * 24 + Math.sin(now * 5) * 4;
      g.fillStyle = col; g.shadowColor = col; g.shadowBlur = 24;
      g.beginPath(); g.arc(lastMid.x, lastMid.y, pr, 0, Math.PI * 2); g.fill(); g.shadowBlur = 0;
      g.strokeStyle = RS.pal.ink; g.lineWidth = 4; g.stroke();
      if (!pulseRate && now - lastPulse > 0.6 / sp) { pulses.push({ x: lastMid.x, y: lastMid.y, age: 0, col: col, r: 1 }); lastPulse = now; }
    }
    for (i = pulses.length - 1; i >= 0; i--) {
      var p = pulses[i]; p.age += dt * sp * (pulseRate ? Math.max(1, pulseRate * 0.35) : 1);
      if (p.age > 2) { pulses.splice(i, 1); continue; }
      g.globalAlpha = 1 - p.age / 2; g.strokeStyle = p.col; g.lineWidth = 4; g.shadowColor = p.col; g.shadowBlur = 16;
      g.beginPath(); g.arc(p.x, p.y, 30 + p.age * 130 * p.r, 0, Math.PI * 2); g.stroke(); g.shadowBlur = 0; g.globalAlpha = 1;
    }
    for (i = sparks.length - 1; i >= 0; i--) {
      var q = sparks[i]; q.life -= dt * 1.6 * sp;
      if (q.life <= 0) { sparks.splice(i, 1); continue; }
      q.x += q.vx * dt; q.y += q.vy * dt;
      g.globalAlpha = q.life; g.fillStyle = 'hsl(' + q.hue + ',95%,68%)'; g.shadowColor = g.fillStyle; g.shadowBlur = 12;
      g.beginPath(); g.arc(q.x, q.y, 3 + q.life * 5, 0, Math.PI * 2); g.fill(); g.shadowBlur = 0; g.globalAlpha = 1;
    }
    if (sparks.length > 250) sparks.splice(0, sparks.length - 250);
    // Fingers take the colour of the note.
    Object.keys(ptr).forEach(function (id) {
      g.strokeStyle = RS.pal.ink; g.lineWidth = 4; g.fillStyle = 'hsl(' + hue + ',90%,82%)';
      g.beginPath(); g.arc(ptr[id].x, ptr[id].y, 20, 0, Math.PI * 2); g.fill(); g.stroke();
    });
  };
  M.info = function () { return { held: !!voice1, freq: Math.round(freq), vol: Math.round(vol * 100) / 100, amp: Math.round(vol * 100) / 100, pulse: Math.round(pulseRate * 10) / 10, hue: Math.round(hue), fingers: Object.keys(ptr).length }; };
})();
