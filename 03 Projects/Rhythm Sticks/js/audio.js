// Audio: Web Audio synthesis only. No sound files.
// Voices (held notes), a plucked string, bells and drums made of noise and short tones.
// Built for low lag: the audio engine is created before the first touch, woken inside that touch,
// and every sound is scheduled for "now" with nothing computed on the way (string sounds are cached).
(function () {
  'use strict';
  var A = RS.audio = { maskUntil: 0 };
  var ctx = null, master = null, noiseBuf = null, primed = false, echo = null;

  A.ensure = function () {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { RS.err('Web Audio is not available in this browser'); return null; }
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* not on every browser */ }   // iPad: play even when the side switch is on mute
    try { ctx = new AC({ latencyHint: 'interactive' }); } catch (e) { ctx = new AC(); }
    echo = null; primed = false;
    ctx.onstatechange = function () { if (RS.onAudioState) RS.onAudioState(ctx ? ctx.state : 'closed'); };
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
    if (c.state !== 'running' && c.state !== 'closed') c.resume().catch(function (e) { RS.err('Audio could not start', e); });   // also wakes an "interrupted" engine (iPad, after a screen lock)
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
  A.running = function () { return !!ctx && ctx.state === 'running'; };
  A.state = function () { return ctx ? ctx.state : 'none'; };
  // Wake the engine whenever the page comes back; let go of it when the page is left (a refresh must not pile up engines).
  document.addEventListener('visibilitychange', function () { if (!document.hidden) A.wake(); });
  window.addEventListener('pageshow', function () { A.ensure(); });
  window.addEventListener('pagehide', function () { try { if (ctx) ctx.close(); } catch (e) { /* already closed */ } ctx = null; });
  A.meter = function () { var c = A.ensure(), an = c.createAnalyser(); an.fftSize = 2048; master.connect(an); return an; };   // for tests
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
  // Options: type, gain, attack, filter (low-pass Hz), vibrato (cents), echo (0..1 send), trem (true = it can pulse).
  function echoBus() {
    if (echo) return echo;
    var d = ctx.createDelay(1); d.delayTime.value = 0.27;
    var fb = ctx.createGain(); fb.gain.value = 0.38;
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200;
    var wet = ctx.createGain(); wet.gain.value = 0.7;
    d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(wet); wet.connect(master);
    echo = d;
    return echo;
  }
  A.voice = function (freq, o) {
    o = o || {};
    var c = A.ensure();
    if (!c) return null;
    var t = c.currentTime, stops = [];
    var osc = c.createOscillator();
    osc.type = o.type || 'sine';
    osc.frequency.value = freq;
    var g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(o.gain == null ? 0.25 : o.gain, t + (o.attack || 0.012));
    var filt = null, lfoG = null, send = null, trem = null, tremLfo = null, tremDepth = null, node = osc;
    if (o.filter) { filt = c.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = o.filter; filt.Q.value = 0.7; osc.connect(filt); node = filt; }
    node.connect(g);
    if (o.vibrato != null) {
      var lfo = c.createOscillator(); lfo.frequency.value = 5.5; lfoG = c.createGain(); lfoG.gain.value = o.vibrato;
      lfo.connect(lfoG); lfoG.connect(osc.detune); lfo.start(t); stops.push(lfo);
    }
    var out = g;
    if (o.trem) {
      trem = c.createGain(); trem.gain.value = 1;
      tremLfo = c.createOscillator(); tremLfo.frequency.value = 4; tremDepth = c.createGain(); tremDepth.gain.value = 0;
      tremLfo.connect(tremDepth); tremDepth.connect(trem.gain); tremLfo.start(t); stops.push(tremLfo);
      g.connect(trem); out = trem;
    }
    out.connect(master);
    if (o.echo != null) { send = c.createGain(); send.gain.value = o.echo; out.connect(send); send.connect(echoBus()); }
    osc.start(t); stops.push(osc);
    var done = false;
    return {
      osc: osc, gain: g,
      setFreq: function (f, tc) { if (!done) osc.frequency.setTargetAtTime(f, c.currentTime, tc || 0.03); },
      setGain: function (v, tc) { if (!done) g.gain.setTargetAtTime(Math.max(0.0001, v), c.currentTime, tc || 0.03); },
      setFilter: function (hz) { if (!done && filt) filt.frequency.setTargetAtTime(hz, c.currentTime, 0.03); },
      setVibrato: function (cents) { if (!done && lfoG) lfoG.gain.setTargetAtTime(cents, c.currentTime, 0.05); },
      setEcho: function (v) { if (!done && send) send.gain.setTargetAtTime(v, c.currentTime, 0.05); },
      setTrem: function (rate, depth) {                              // depth 0..1: how far the loudness dips
        if (done || !trem) return;
        tremLfo.frequency.setTargetAtTime(Math.max(0.1, rate), c.currentTime, 0.05);
        tremDepth.gain.setTargetAtTime(depth * 0.5, c.currentTime, 0.05);
        trem.gain.setTargetAtTime(1 - depth * 0.5, c.currentTime, 0.05);
      },
      release: function (r) {
        if (done) return;
        done = true;
        r = r || 0.8;
        var n = c.currentTime, cur = g.gain.value;
        g.gain.cancelScheduledValues(n);
        g.gain.setValueAtTime(Math.max(cur, 0.0001), n);
        g.gain.setTargetAtTime(0.0001, n, r / 4);
        stops.forEach(function (x) { try { x.stop(n + r + 0.2); } catch (e) { /* already stopped */ } });
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

  // Arcade sounds
  A.coin = function (v) { v = v == null ? 1 : v; tone('square', 988, 988, 0.08, 0.16 * v); tone('square', 1319, 1319, 0.32, 0.16 * v, 0.08); };
  A.laser = function (v) { v = v == null ? 1 : v; tone('sawtooth', 1900, 180, 0.26, 0.2 * v); };
  A.jump = function (v) { v = v == null ? 1 : v; tone('square', 260, 760, 0.2, 0.18 * v); };
  A.powerup = function (v) { v = v == null ? 1 : v; [392, 523, 659, 784].forEach(function (f, i) { tone('square', f, f, 0.1, 0.15 * v, i * 0.07); }); };
  A.blip = function (v) { v = v == null ? 1 : v; tone('square', 880, 880, 0.07, 0.16 * v); };
  // Other interesting sounds
  A.wood = function (v) { v = v == null ? 1 : v; tone('sine', 900, 650, 0.07, 0.6 * v); burst('bandpass', 1800, 2, 0.002, 0.03, 0.3 * v); };
  A.tink = function (v) { v = v == null ? 1 : v; tone('sine', 2400, 2380, 0.55, 0.25 * v); tone('sine', 3700, 3680, 0.3, 0.12 * v); };
  A.cowbell = function (v) { v = v == null ? 1 : v; tone('square', 540, 540, 0.4, 0.14 * v); tone('square', 800, 800, 0.4, 0.14 * v); };
  A.bubble = function (v) { v = v == null ? 1 : v; tone('sine', 300, 900, 0.14, 0.5 * v); };
  A.whistle = function (v) { v = v == null ? 1 : v; tone('sine', 1100, 1900, 0.4, 0.3 * v, 0, 0.05); };
  A.clap = function (v) { v = v == null ? 1 : v; mask(); [0, 0.012, 0.026].forEach(function (d) { burst('bandpass', 1600, 0.9, 0.001, 0.02, 0.5 * v, d); }); burst('bandpass', 1500, 0.8, 0.002, 0.12, 0.3 * v, 0.03); };
  // For the desert objects
  A.chirp = function (v) { v = v == null ? 1 : v; tone('sine', 2200, 3200, 0.07, 0.25 * v); tone('sine', 2600, 3500, 0.08, 0.22 * v, 0.1); tone('sine', 2400, 3000, 0.06, 0.2 * v, 0.2); };
  A.horn = function (v) { v = v == null ? 1 : v; [0, 0.24].forEach(function (d) { tone('square', 330, 330, 0.18, 0.12 * v, d); tone('square', 415, 415, 0.18, 0.12 * v, d); }); };
  A.rustle = function (v) { v = v == null ? 1 : v; burst('bandpass', 2600, 0.6, 0.05, 0.3, 0.2 * v); };
  // A sung "ooh": a buzzy tone through two vowel resonances with a little wobble. The microphone hardly hears it.
  A.voiceNote = function (freq, v, dur, vowel) {
    var c = A.ensure();
    if (!c) return;
    v = v == null ? 1 : v; dur = dur || 0.5;
    var t = c.currentTime, F = vowel === 'ah' ? [700, 1220] : vowel === 'ee' ? [310, 2200] : [330, 900];
    var osc = c.createOscillator(); osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq * 0.97, t); osc.frequency.linearRampToValueAtTime(freq, t + 0.06);
    var lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 5.2; lg.gain.value = freq * 0.012; lfo.connect(lg); lg.connect(osc.frequency);
    var sum = c.createGain(); sum.gain.value = 5;
    F.forEach(function (f, i) {
      var b = c.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = f; b.Q.value = 5;
      var gg = c.createGain(); gg.gain.value = i ? 0.5 : 1; osc.connect(b); b.connect(gg); gg.connect(sum);
    });
    var env = c.createGain();
    env.gain.setValueAtTime(0.0001, t); env.gain.linearRampToValueAtTime(0.5 * v, t + 0.05);
    env.gain.setTargetAtTime(0.0001, t + dur * 0.7, dur * 0.15 + 0.02);
    sum.connect(env); env.connect(master);
    osc.start(t); lfo.start(t); osc.stop(t + dur + 0.5); lfo.stop(t + dur + 0.5);
  };
  // The pad sounds, by family (see the shake pads).
  A.padSounds = ['shaker', 'snare', 'rattle', 'kick', 'tom', 'coin', 'laser', 'jump', 'powerup', 'blip', 'wood', 'tink', 'cowbell', 'bubble', 'whistle'];

  // One drum per beads layer.
  A.layerSounds = ['kick', 'snare', 'hat', 'tom', 'click'];
  A.layer = function (i, v) { A[A.layerSounds[i % A.layerSounds.length]](v); };
})();
