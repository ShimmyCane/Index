// Felix Gear Wars: all sound is made in the page with the Web Audio API (no audio files).
// Sound effects for gears, fighters, shots and coins, plus a looping medieval-sounding tune that
// is calm while Felix builds and drums in when the battle starts.
(function () {
  'use strict';
  var A = {}, ctx = null, master = null, sfxBus = null, musBus = null, ready = false;
  var vol = { sfx: 0.8, music: 0.5 };
  var mood = 'off', nextBar = 0, barNo = 0, timer = null, root = 50, chapter = 1;
  var noiseBuf = null;

  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  A.setVolumes = function (sfx, music) {
    vol.sfx = sfx; vol.music = music;
    if (sfxBus) { sfxBus.gain.value = vol.sfx; musBus.gain.value = vol.music * 0.7; }
  };
  A.init = function () {
    if (ready) { if (ctx && ctx.state === 'suspended') ctx.resume(); return; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.9;
      var comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
      master.connect(comp); comp.connect(ctx.destination);
      sfxBus = ctx.createGain(); sfxBus.gain.value = vol.sfx; sfxBus.connect(master);
      musBus = ctx.createGain(); musBus.gain.value = vol.music * 0.7; musBus.connect(master);
      var len = ctx.sampleRate; noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      var d = noiseBuf.getChannelData(0); for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      ready = true; if (ctx.state === 'suspended') ctx.resume();
      if (mood !== 'off') startMusic();
    } catch (e) { ready = false; }
  };
  A.ok = function () { return ready; };
  A.names = function () { return Object.keys(fx); };

  // ---- building blocks ---------------------------------------------------------------------
  function tone(f, t, dur, type, v, o) {
    o = o || {};
    var os = ctx.createOscillator(), g = ctx.createGain();
    os.type = type || 'sine'; os.frequency.setValueAtTime(f, t);
    if (o.slide) os.frequency.exponentialRampToValueAtTime(Math.max(20, o.slide), t + dur);
    var a = o.attack || 0.004;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    var node = g;
    if (o.lp) { var fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = o.lp; os.connect(fl); fl.connect(g); }
    else os.connect(g);
    g.connect(o.bus || sfxBus);
    if (o.vib) { var l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 5.5; lg.gain.value = f * 0.012; l.connect(lg); lg.connect(os.frequency); l.start(t); l.stop(t + dur + 0.05); }
    os.start(t); os.stop(t + dur + 0.05);
  }
  function noise(t, dur, type, f, v, o) {
    o = o || {};
    var s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    var fl = ctx.createBiquadFilter(); fl.type = type || 'bandpass'; fl.frequency.setValueAtTime(f, t); fl.Q.value = o.q || 1;
    if (o.sweep) fl.frequency.exponentialRampToValueAtTime(Math.max(40, o.sweep), t + dur);
    var g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + (o.attack || 0.003));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(o.bus || sfxBus); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  }
  function now() { return ctx.currentTime + 0.005; }
  var last = {};
  function gate(name, ms) { var n = performance.now(); if (last[name] && n - last[name] < ms) return false; last[name] = n; return true; }

  // ---- sound effects -----------------------------------------------------------------------
  var fx = {
    tick: function (side) { var t = now(); tone(520 + side * 60, t, 0.07, 'square', 0.05, { lp: 1800 }); noise(t, 0.03, 'highpass', 5000, 0.04); },
    gear: function () { var t = now(); noise(t, 0.05, 'bandpass', 2400, 0.05, { q: 6 }); tone(180, t, 0.05, 'triangle', 0.05); },
    place: function () { var t = now(); tone(300, t, 0.09, 'triangle', 0.14, { slide: 180 }); noise(t, 0.05, 'bandpass', 1800, 0.12, { q: 3 }); },
    merge: function () { var t = now(); [0, 4, 7, 12, 16].forEach(function (n, i) { tone(mtof(72 + n), t + i * 0.055, 0.35, 'triangle', 0.13); tone(mtof(84 + n), t + i * 0.055, 0.25, 'sine', 0.05); }); noise(t, 0.2, 'bandpass', 3500, 0.06, { sweep: 8000 }); },
    pop: function (type) {
      var t = now(); tone(260, t, 0.22, 'sine', 0.2, { slide: 760 }); tone(1040, t + 0.03, 0.12, 'triangle', 0.07);
      noise(t, 0.06, 'highpass', 3000, 0.06);
    },
    land: function () { var t = now(); noise(t, 0.12, 'lowpass', 500, 0.14); tone(90, t, 0.12, 'sine', 0.16, { slide: 50 }); },
    slash: function (type) {
      var t = now();
      if (type === 'tank') { tone(110, t, 0.18, 'square', 0.1, { slide: 55, lp: 600 }); noise(t, 0.12, 'lowpass', 900, 0.18); return; }
      noise(t, 0.09, 'highpass', 2200, 0.13, { sweep: 6500 });
      tone(900 + Math.random() * 250, t + 0.03, 0.1, 'square', 0.05, { slide: 420, lp: 3000 });
    },
    hit: function (big) { var t = now(); noise(t, 0.08, 'bandpass', 700, big ? 0.2 : 0.11, { q: 2 }); tone(big ? 130 : 180, t, 0.09, 'triangle', big ? 0.18 : 0.1, { slide: 70 }); },
    arrow: function () { var t = now(); noise(t, 0.28, 'bandpass', 2600, 0.07, { q: 4, sweep: 900 }); tone(1100, t, 0.06, 'triangle', 0.04, { slide: 700 }); },
    bolt: function () { var t = now(); tone(660, t, 0.4, 'sine', 0.12, { slide: 1500, vib: true }); tone(990, t + 0.02, 0.3, 'triangle', 0.06, { slide: 400 }); noise(t, 0.3, 'bandpass', 4500, 0.04, { q: 5 }); },
    stone: function () { var t = now(); tone(80, t, 0.25, 'sawtooth', 0.12, { slide: 40, lp: 500 }); noise(t, 0.2, 'lowpass', 300, 0.2); },
    boom: function () { var t = now(); noise(t, 0.5, 'lowpass', 900, 0.34, { sweep: 120 }); tone(70, t, 0.45, 'sine', 0.34, { slide: 28 }); },
    lightning: function () { var t = now(); noise(t, 0.35, 'highpass', 1500, 0.34, { attack: 0.001 }); tone(70, t, 0.4, 'sawtooth', 0.14, { slide: 38 }); noise(t + 0.08, 0.2, 'bandpass', 3000, 0.2, { q: 2 }); },
    launch: function () { var t = now(); noise(t, 0.55, 'bandpass', 700, 0.14, { q: 1, sweep: 3600 }); tone(180, t, 0.5, 'sawtooth', 0.06, { slide: 700, lp: 1200 }); },
    coin: function () { var t = now(); tone(1318, t, 0.1, 'square', 0.05, { lp: 4000 }); tone(1760, t + 0.07, 0.22, 'square', 0.05, { lp: 4000 }); },
    horn: function (boss) {
      var t = now(), base = boss ? 40 : 48;
      tone(mtof(base), t, 0.7, 'sawtooth', 0.14, { lp: 700, attack: 0.08 }); tone(mtof(base + 7), t + 0.35, 0.8, 'sawtooth', 0.14, { lp: 700, attack: 0.08 });
      if (boss) tone(mtof(base - 12), t, 1.4, 'square', 0.1, { lp: 300, attack: 0.1 });
    },
    leak: function () { var t = now(); tone(200, t, 0.35, 'sawtooth', 0.17, { slide: 70, lp: 700 }); noise(t, 0.2, 'lowpass', 400, 0.2); },
    base: function () { var t = now(); noise(t, 0.12, 'lowpass', 500, 0.14); tone(110, t, 0.14, 'triangle', 0.14, { slide: 70 }); },
    nope: function () { var t = now(); tone(150, t, 0.16, 'square', 0.1, { lp: 600 }); tone(120, t + 0.12, 0.2, 'square', 0.1, { lp: 600 }); },
    tap: function () { var t = now(); tone(700, t, 0.05, 'triangle', 0.1); },
    sell: function () { var t = now(); tone(900, t, 0.08, 'triangle', 0.09, { slide: 500 }); tone(600, t + 0.07, 0.1, 'triangle', 0.09, { slide: 300 }); },
    undo: function () { var t = now(); tone(600, t, 0.12, 'triangle', 0.1, { slide: 300 }); },
    win: function () {
      var t = now() + 0.02, seq = [0, 4, 7, 12, 7, 12, 16, 19];
      seq.forEach(function (n, i) { tone(mtof(67 + n), t + i * 0.13, 0.5, 'triangle', 0.16); tone(mtof(55 + n), t + i * 0.13, 0.45, 'sawtooth', 0.04, { lp: 900 }); });
      [0, 4, 7, 12].forEach(function (n) { tone(mtof(72 + n), t + 1.1, 1.4, 'triangle', 0.1); });
      noise(t + 1.1, 0.5, 'highpass', 6000, 0.05);
    },
    lose: function () { var t = now(); [0, -2, -5, -9].forEach(function (n, i) { tone(mtof(62 + n), t + i * 0.28, 0.6, 'triangle', 0.16, { lp: 1200 }); }); tone(mtof(38), t + 1, 1.2, 'sawtooth', 0.1, { lp: 300 }); },
    star: function (i) { var t = now(); tone(mtof(76 + i * 4), t, 0.5, 'triangle', 0.14); tone(mtof(88 + i * 4), t, 0.3, 'sine', 0.06); },
  };
  A.play = function (name, a) {
    if (!ready || !fx[name] || vol.sfx <= 0) return;
    var limit = { tick: 40, gear: 60, hit: 45, slash: 40, arrow: 50, coin: 60, pop: 50, land: 60, bolt: 80, stone: 80, boom: 80 }[name];
    if (limit && !gate(name, limit)) return;
    try { fx[name](a); } catch (e) { if (window.GW && GW.err) GW.err('Sound ' + name, e); }
  };

  // ---- music --------------------------------------------------------------------------------
  var DOR = [0, 2, 3, 5, 7, 9, 10, 12, 14, 15];
  var MOTIFS = [
    [4, -1, 2, 4, 5, 4, 2, -1], [2, 3, 4, -1, 5, 4, 3, 2], [0, 2, 4, -1, 7, -1, 5, 4], [5, 4, 3, 2, 3, -1, 2, 0],
    [7, -1, 5, 4, 5, 7, 8, -1], [4, 5, 7, 5, 4, 2, 4, -1],
  ];
  var CHORDS = [0, -2, 3, 5, 0, -2, 7, 5];             // bass roots per bar (semitones from root)
  var BEAT = 60 / 100;
  function bar(t, n) {
    var calm = mood === 'calm';
    var bassRoot = root - 12 + CHORDS[n % CHORDS.length];
    var motif = MOTIFS[(n * 5 + (n >> 2)) % MOTIFS.length];
    var step = BEAT / 2, i;
    // drone and bass
    tone(mtof(bassRoot), t, BEAT * 4, 'triangle', calm ? 0.07 : 0.1, { lp: 500, bus: musBus, attack: 0.05 });
    tone(mtof(bassRoot + 7), t, BEAT * 4, 'sine', 0.04, { bus: musBus, attack: 0.1 });
    if (!calm) {
      for (i = 0; i < 4; i++) tone(mtof(bassRoot + (i % 2 ? 7 : 0)), t + i * BEAT, BEAT * 0.5, 'sawtooth', 0.05, { lp: 420, bus: musBus });
    }
    // melody: plucked lute in battle, soft recorder when calm
    for (i = 0; i < 8; i++) {
      var d = motif[(i + (calm ? 0 : (n % 2))) % 8]; if (d < 0) continue;
      var f = mtof(root + 12 + DOR[d] + (CHORDS[n % CHORDS.length] > 4 ? 0 : 0));
      if (calm) { if (i % 2 === 0) tone(f, t + i * step, step * 1.9, 'sine', 0.07, { bus: musBus, attack: 0.04, vib: true }); }
      else {
        tone(f, t + i * step, step * 1.2, 'triangle', 0.09, { bus: musBus, lp: 2600 });
        tone(f * 2, t + i * step, step * 0.5, 'sine', 0.025, { bus: musBus });
      }
    }
    // a gentle arpeggio on the calm bars
    if (calm) for (i = 0; i < 4; i++) tone(mtof(root + [0, 7, 12, 7][i] + CHORDS[n % CHORDS.length]), t + i * BEAT, BEAT * 1.1, 'triangle', 0.035, { bus: musBus, lp: 1600 });
    // drums when the fight is on
    if (!calm) {
      for (i = 0; i < 4; i++) {
        var tt = t + i * BEAT;
        if (i % 2 === 0) { tone(110, tt, 0.18, 'sine', 0.22, { slide: 45, bus: musBus }); }
        else noise(tt, 0.1, 'bandpass', 1800, 0.1, { q: 1.2, bus: musBus });
        noise(tt + BEAT / 2, 0.03, 'highpass', 7000, 0.035, { bus: musBus });
      }
    }
  }
  function pump() {
    if (!ready || mood === 'off') return;
    while (nextBar < ctx.currentTime + 0.9) {
      if (nextBar < ctx.currentTime) nextBar = ctx.currentTime + 0.05;
      bar(nextBar, barNo++); nextBar += BEAT * 4;
    }
  }
  function startMusic() { if (!timer) { nextBar = ctx.currentTime + 0.1; timer = setInterval(pump, 200); } }
  A.mood = function (m, ch) {
    mood = m; if (ch) { chapter = ch; root = 48 + [0, 2, 3, 5, 7, -2, 1, 4, 0][ch % 9]; }
    if (!ready) return;
    if (m === 'off') { if (timer) { clearInterval(timer); timer = null; } } else startMusic();
  };
  A.stop = function () { A.mood('off'); };
  window.GAudio = A;
})();
