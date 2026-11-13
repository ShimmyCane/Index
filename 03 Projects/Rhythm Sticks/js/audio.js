// Audio: Web Audio synthesis only. No sound files.
// Voices (held notes), a plucked string, bells and drums made of noise and short tones.
// Built for low lag: the audio engine is created before the first touch, woken inside that touch,
// and every sound is scheduled for "now" with nothing computed on the way (string sounds are cached).
(function () {
  'use strict';
  var A = RS.audio = { maskUntil: 0 };
  var ctx = null, master = null, noiseBuf = null, primed = false;

  A.ensure = function () {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { RS.err('Web Audio is not available in this browser'); return null; }
    try { ctx = new AC({ latencyHint: 'interactive' }); } catch (e) { ctx = new AC(); }
    var comp = ctx.createDynamicsCompressor();
    master = ctx.createGain();
    master.gain.value = RS.settings.volume;
    master.connect(comp);
    comp.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  };
  // Called inside a real touch: start the engine, and play one silent sound so the first real one is not late.
  A.wake = function () {
    var c = A.ensure();
    if (!c) return;
    if (c.state === 'suspended') c.resume().catch(function (e) { RS.err('Audio could not start', e); });
    if (!primed) {
      primed = true;
      try {
        var s = c.createBufferSource(), g = c.createGain();
        s.buffer = c.createBuffer(1, 256, c.sampleRate); g.gain.value = 0;
        s.connect(g); g.connect(master); s.start();
      } catch (e) { /* not needed everywhere */ }
    }
  };
  A.context = function () { return ctx; };
  A.now = function () { return ctx ? ctx.currentTime : 0; };
  A.info = function () {
    return ctx ? { state: ctx.state, sampleRate: ctx.sampleRate, base: ctx.baseLatency || 0, output: ctx.outputLatency || 0 } : null;
  };
  RS.onSet(function (k, v) {
    if (k === 'volume' && ctx) master.gain.setTargetAtTime(v, ctx.currentTime, 0.02);
  });
  // Sounds with a lot of high pitch can be heard again by the microphone; the detector ignores a short window after them.
  function mask(ms) { A.maskUntil = performance.now() + (ms || 140); }

  // ---- Notes and scales ----
  var SCALES = { penta: [0, 2, 4, 7, 9], major: [0, 2, 4, 5, 7, 9, 11], all: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] };
  A.scale = function () { return SCALES[RS.settings.scale] || SCALES.penta; };
  // u in 0..1 -> a MIDI note over `octs` octaves from `base`, on the chosen scale.
  A.midiFromUnit = function (u, octs, base) {
    var s = A.scale(), n = s.length * (octs || 2);
    var i = Math.max(0, Math.min(n - 1, Math.floor(u * n)));
    return (base || 60) + 12 * Math.floor(i / s.length) + s[i % s.length];
  };
  // The nth step of the chosen scale above `base` (n can be negative).
  A.midiFromStep = function (n, base) {
    var s = A.scale(), oct = Math.floor(n / s.length), i = ((n % s.length) + s.length) % s.length;
    return (base || 60) + 12 * oct + s[i];
  };
  A.mtof = function (m) { return 440 * Math.pow(2, (m - 69) / 12); };

  // ---- A held voice: attack, then it rings until release() ----
  A.voice = function (freq, o) {
    o = o || {};
    var c = A.ensure();
    if (!c) return null;
    var t = c.currentTime;
    var osc = c.createOscillator();
    osc.type = o.type || 'sine';
    osc.frequency.value = freq;
    var g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(o.gain == null ? 0.25 : o.gain, t + (o.attack || 0.012));
    osc.connect(g); g.connect(master);
    osc.start(t);
    var done = false;
    return {
      osc: osc, gain: g,
      setFreq: function (f, tc) { if (!done) osc.frequency.setTargetAtTime(f, c.currentTime, tc || 0.03); },
      setGain: function (v, tc) { if (!done) g.gain.setTargetAtTime(Math.max(0.0001, v), c.currentTime, tc || 0.03); },
      release: function (r) {
        if (done) return;
        done = true;
        r = r || 0.8;
        var n = c.currentTime, cur = g.gain.value;
        g.gain.cancelScheduledValues(n);
        g.gain.setValueAtTime(Math.max(cur, 0.0001), n);
        g.gain.setTargetAtTime(0.0001, n, r / 4);
        try { osc.stop(n + r + 0.2); } catch (e) { /* already stopped */ }
      },
    };
  };

  // ---- A plucked string (Karplus-Strong). Each pitch is built once and reused. ----
  var pluckCache = {};
  function pluckBuf(freq) {
    var key = Math.round(freq * 10);
    if (pluckCache[key]) return pluckCache[key];
    var sr = ctx.sampleRate, N = Math.max(2, Math.round(sr / freq)), len = Math.floor(sr * 2.0);
    var buf = ctx.createBuffer(1, len, sr), d = buf.getChannelData(0), i;
    for (i = 0; i < N; i++) d[i] = Math.random() * 2 - 1;
    for (i = N; i < len; i++) d[i] = 0.5 * (d[i - N] + (i - N - 1 >= 0 ? d[i - N - 1] : d[i - N])) * 0.9985;
    pluckCache[key] = buf;
    return buf;
  }
  A.warmPluck = function (freqs) { if (A.ensure()) freqs.forEach(pluckBuf); };
  A.pluck = function (freq, v) {
    var c = A.ensure();
    if (!c) return;
    var s = c.createBufferSource(), g = c.createGain();
    s.buffer = pluckBuf(freq); g.gain.value = 0.55 * (v == null ? 1 : v);
    s.connect(g); g.connect(master); s.start();
  };

  // ---- Sounds made of noise and short tones ----
  function burst(type, freq, q, attack, decay, peak, when) {
    var c = A.ensure();
    if (!c) return;
    var t = c.currentTime + (when || 0);
    var s = c.createBufferSource();
    s.buffer = noiseBuf; s.loop = true;
    var f = c.createBiquadFilter();
    f.type = type; f.frequency.value = freq; f.Q.value = q;
    var g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t, Math.random() * 0.8);
    s.stop(t + attack + decay + 0.05);
  }
  function tone(type, f0, f1, dur, peak, when, attack) {
    var c = A.ensure();
    if (!c) return;
    var t = c.currentTime + (when || 0);
    var o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur * 0.7);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + (attack || 0.004));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }
  A.shaker = function (v) { v = v == null ? 1 : v; mask(); burst('bandpass', 6200, 0.9, 0.004, 0.07, 0.5 * v); burst('bandpass', 5600, 0.9, 0.004, 0.09, 0.35 * v, 0.05); };
  A.snare = function (v) { v = v == null ? 1 : v; mask(); burst('highpass', 1800, 0.7, 0.002, 0.16, 0.6 * v); tone('triangle', 210, 110, 0.12, 0.5 * v); };
  A.rattle = function (v) { v = v == null ? 1 : v; mask(); for (var i = 0; i < 5; i++) burst('bandpass', 4200 + Math.random() * 1500, 1.2, 0.002, 0.03, 0.25 * v, i * 0.022); };
  A.kick = function (v) { v = v == null ? 1 : v; tone('sine', 150, 42, 0.3, 0.9 * v); };
  A.hat = function (v) { v = v == null ? 1 : v; mask(); burst('highpass', 7500, 0.7, 0.002, 0.05, 0.3 * v); };
  A.click = function (v) { v = v == null ? 1 : v; mask(); tone('triangle', 1500, 1200, 0.05, 0.4 * v); };
  A.tom = function (v) { v = v == null ? 1 : v; tone('sine', 230, 110, 0.25, 0.7 * v); };
  // Soft round sounds that the microphone hardly hears: for the games that listen while they play.
  A.tick = function (v, f) { v = v == null ? 1 : v; tone('sine', f || 520, (f || 520) * 0.8, 0.09, 0.5 * v); };
  A.bell = function (freq, v, dur) {                       // a marimba-like bell: a round tone plus a quick bright partner
    v = v == null ? 1 : v; dur = dur || 0.9;
    tone('sine', freq, freq * 0.998, dur, 0.4 * v);
    tone('sine', freq * 3.98, freq * 3.97, dur * 0.25, 0.12 * v);
  };
  A.thud = function (v, f) { v = v == null ? 1 : v; f = f || 120; tone('sine', f, f * 0.45, 0.2, 0.85 * v); };
  A.pop = function (v, f) { v = v == null ? 1 : v; f = f || 500; tone('sine', f, f * 1.8, 0.1, 0.5 * v); };
  A.swish = function (v) { v = v == null ? 1 : v; burst('bandpass', 1400, 0.5, 0.06, 0.28, 0.25 * v); };
  A.testBurst = function (delay) { mask(400); burst('highpass', 2500, 0.7, 0.002, 0.04, 1.0, delay || 0); burst('bandpass', 4000, 1, 0.002, 0.05, 0.9, delay || 0); };

  // One drum per beads layer.
  A.layerSounds = ['kick', 'snare', 'hat', 'tom', 'click'];
  A.layer = function (i, v) { A[A.layerSounds[i % A.layerSounds.length]](v); };
})();
