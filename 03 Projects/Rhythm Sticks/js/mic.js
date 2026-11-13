// Microphone: looked at, never played back, stored or sent.
// Gives a level, frequency data, a pitch (for humming) and an onset detector that reacts to a sharp attack
// (a clap, a tap, a drum) and ignores the slow rise and fall of speech.
// The onset detector runs on the audio thread (in blocks of about 3 ms) and tells the page the moment it hears one.
// If the browser can't do that, the page listens through an analyser once per screen frame instead.
(function () {
  'use strict';
  var M = RS.mic = { state: 'off', level: 0, want: false, analyser: null, freqData: null, perm: 'unknown', engine: 'none' };
  var stream = null, src = null, raf = 0, listeners = [], tdata = null, fbuf = null;
  var held = null, node = null, nodeAt = 0, workletPromise = null;
  var base = 0.01, prev = 0, lastOnset = 0, lastFire = 0;

  M.onOnset = function (fn) {
    listeners.push(fn);
    return function () { listeners = listeners.filter(function (f) { return f !== fn; }); };
  };
  function fire(strength) {
    var now = performance.now();
    if (now < RS.audio.maskUntil) return;                  // the app's own noisy sound, heard again
    lastFire = now;
    listeners.slice().forEach(function (fn) { try { fn(strength); } catch (e) { RS.err('Onset handler', e); } });
  }
  M._fakeOnset = function (s) { lastFire = performance.now(); listeners.slice().forEach(function (fn) { fn(s == null ? 1 : s); }); };   // for tests
  M.lastFire = function () { return lastFire; };

  // The browser decides whether to remember a "yes" (Chrome and Firefox do, Safari may ask again each visit).
  // What the page can do: ask as seldom as possible.
  //  - It never asks again after a refusal (the gear has a button to try again).
  //  - Where the browser reports the permission as saved ("granted"), leaving a microphone mode releases the
  //    microphone, and coming back starts it silently.
  //  - Where it cannot tell (Safari), the stream is kept switched off for the rest of the visit, so changing
  //    modes does not ask again. It is switched on only in the modes that listen, and released when the page closes.
  M.perm = 'unknown';
  try {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' }).then(function (p) {
        M.perm = p.state;
        p.onchange = function () { M.perm = p.state; };
      }).catch(function () { /* not supported for the microphone */ });
    }
  } catch (e) { /* not supported */ }

  // ---- The onset detector on the audio thread ----
  var WORKLET = [
    'class Onset extends AudioWorkletProcessor {',
    '  constructor() { super(); this.lp = 0; this.fast = 0; this.mid = 0; this.base = 0.0005; this.cool = 0; this.n = 0; this.sens = 0.5; this.h = [0, 0, 0, 0]; this.k = 0;',
    '    this.port.onmessage = (e) => { if (e.data.sens != null) this.sens = e.data.sens; }; }',
    '  process(inputs) {',
    '    const ch = inputs[0] && inputs[0][0]; if (!ch) return true;',
    '    let e = 0;',
    '    for (let i = 0; i < ch.length; i++) { const x = ch[i]; this.lp += 0.2 * (x - this.lp); const y = x - this.lp; e += y * y; }',
    '    e = Math.sqrt(e / ch.length);                       // loudness of the high part of the sound in this block',
    '    this.fast += 0.5 * (e - this.fast);                  // follows within a few milliseconds',
    '    this.mid += 0.06 * (this.fast - this.mid);           // follows within about 50 ms: speech rises slowly enough to keep up with it',
    '    this.base += 0.004 * (Math.min(this.fast, this.base * 2 + 0.002) - this.base);   // the room',
    '    const past = this.h[this.k]; this.h[this.k] = this.fast; this.k = (this.k + 1) & 3;   // the loudness about 12 ms ago',
    '    this.cool -= ch.length / sampleRate;',
    '    const s = this.sens, thr = this.base * (2.5 + (1 - s) * 4) + 0.004 + (1 - s) * 0.03;',
    '    // A clap jumps up within a few milliseconds; speech and breath climb slowly, so they do not jump enough.',
    '    if (this.fast > thr && this.fast - past > thr * 0.6 && this.fast > this.mid * 1.8 && this.cool <= 0) {',
    '      this.cool = 0.12; this.port.postMessage({ o: Math.min(1, Math.max(0.3, (this.fast - thr) * 8 + 0.4)) });',
    '    }',
    '    if ((++this.n & 31) === 0) this.port.postMessage({ l: e });',
    '    return true;',
    '  }',
    '}',
    "registerProcessor('rs-onset', Onset);",
  ].join('\n');

  function ensureWorklet(c) {
    if (workletPromise) return workletPromise;
    if (!c.audioWorklet || typeof AudioWorkletNode === 'undefined') return (workletPromise = Promise.resolve(false));
    var url = URL.createObjectURL(new Blob([WORKLET], { type: 'application/javascript' }));
    workletPromise = c.audioWorklet.addModule(url).then(function () { return true; }).catch(function (e) {
      RS.err('Fast microphone listening unavailable, using the slower way', e);
      return false;
    });
    return workletPromise;
  }
  RS.onSet(function (k, v) { if (k === 'sens' && node) node.port.postMessage({ sens: v }); });

  function attach(s) {
    stream = s;
    s.getTracks().forEach(function (t) { t.enabled = true; });
    var c = RS.audio.ensure();
    if (!c) { M.state = 'unsupported'; return; }
    src = c.createMediaStreamSource(stream);
    M.analyser = c.createAnalyser();
    M.analyser.fftSize = 2048;
    M.analyser.smoothingTimeConstant = 0;
    src.connect(M.analyser);               // not connected to the speakers
    M.freqData = new Uint8Array(M.analyser.frequencyBinCount);
    tdata = new Uint8Array(M.analyser.fftSize);
    fbuf = new Float32Array(M.analyser.fftSize);
    base = 0.01; prev = 0;
    M.engine = 'analyser';
    M.state = 'on';
    loop();
    ensureWorklet(c).then(function (ok) {
      if (!ok || stream !== s || !src) return;
      try {
        node = new AudioWorkletNode(c, 'rs-onset', { numberOfInputs: 1, numberOfOutputs: 0 });
        node.port.onmessage = function (e) { nodeAt = performance.now(); if (e.data.o != null) fire(e.data.o); };
        node.port.postMessage({ sens: RS.settings.sens });
        src.connect(node);
        nodeAt = performance.now();
        M.engine = 'worklet';
      } catch (e) { RS.err('Fast microphone listening unavailable', e); node = null; }
    });
  }
  function live(s) { return s && s.getTracks().some(function (t) { return t.readyState === 'live'; }); }

  M.start = function () {
    M.want = true;
    if (M.state === 'on' || M.state === 'starting') return Promise.resolve();
    if (M.state === 'denied' || M.state === 'unsupported') return Promise.resolve();   // no nagging after a refusal
    if (live(held)) { var h = held; held = null; attach(h); return Promise.resolve(); }  // already allowed this visit
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      M.state = 'unsupported';
      RS.err('Microphone is not available here (it needs https or localhost)');
      return Promise.resolve();
    }
    M.state = 'starting';
    return navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } })
      .then(function (s) {
        try { localStorage.setItem('rs.micOk', '1'); } catch (e) { /* storage blocked */ }
        if (!M.want) { s.getTracks().forEach(function (t) { t.stop(); }); M.state = 'off'; return; }
        attach(s);
      })
      .catch(function (e) {
        if (!RS.touched && e && e.name === 'NotAllowedError') { M.state = 'off'; return; }   // some browsers want a touch first: retry on the first touch
        M.state = 'denied';
        RS.err('Microphone unavailable', e);
      });
  };
  M.again = function () { if (M.state === 'denied') M.state = 'off'; return M.start(); };
  M._attachTest = function (s) { M.want = true; M.state = 'starting'; attach(s); };   // for tests: a made-up sound instead of a real microphone

  M.stop = function () {
    M.want = false;
    cancelAnimationFrame(raf); raf = 0;
    if (node) { try { node.disconnect(); node.port.onmessage = null; } catch (e) { /* already gone */ } node = null; }
    if (src) { try { src.disconnect(); } catch (e) { /* already gone */ } src = null; }
    if (stream) {
      if (M.perm === 'granted') { stream.getTracks().forEach(function (t) { t.stop(); }); }
      else { stream.getTracks().forEach(function (t) { t.enabled = false; }); held = stream; }
      stream = null;
    }
    M.analyser = null; M.freqData = null; M.level = 0; M.engine = 'none';
    if (M.state !== 'denied' && M.state !== 'unsupported') M.state = 'off';
  };
  window.addEventListener('pagehide', function () {
    if (held) { held.getTracks().forEach(function (t) { t.stop(); }); held = null; }
    if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
  });

  // ---- Once per screen frame: the level, and the slower detector if the audio-thread one is not running ----
  function loop() {
    raf = requestAnimationFrame(loop);
    var an = M.analyser;
    if (!an) return;
    an.getByteFrequencyData(M.freqData);
    an.getByteTimeDomainData(tdata);
    var sum = 0, k;
    for (k = 0; k < tdata.length; k++) { var x = (tdata[k] - 128) / 128; sum += x * x; }
    M.level = Math.sqrt(sum / tdata.length);
    if (M.engine === 'worklet' && performance.now() - nodeAt < 700) return;   // the fast detector is alive
    var bh = an.context.sampleRate / an.fftSize;
    var lo = Math.floor(700 / bh), hi = Math.min(M.freqData.length - 1, Math.floor(9000 / bh));
    var e = 0;
    for (k = lo; k <= hi; k++) { var v = M.freqData[k] / 255; e += v * v; }
    e /= (hi - lo + 1);
    var s = RS.settings.sens;
    var thr = base * (2.2 + (1 - s) * 3) + 0.01 + (1 - s) * 0.06;
    var now = performance.now();
    if (e > thr && e > prev * 1.4 && now - lastOnset > 140) {
      lastOnset = now;
      fire(Math.max(0.3, Math.min(1, (e - thr) / 0.25 + 0.4)));
    }
    base += (Math.min(e, base * 2 + 0.02) - base) * 0.03;
    prev = e;
  }

  // ---- Pitch of a hum or a voice: autocorrelation of the latest sound. Returns null when there is no steady pitch. ----
  M.pitch = function () {
    var an = M.analyser;
    if (!an) return null;
    an.getFloatTimeDomainData(fbuf);
    var n = fbuf.length, W = 1024, i, lag;
    var rms = 0;
    for (i = 0; i < n; i++) rms += fbuf[i] * fbuf[i];
    rms = Math.sqrt(rms / n);
    if (rms < 0.006 + (1 - RS.settings.sens) * 0.02) return null;
    var sr = an.context.sampleRate, minLag = Math.floor(sr / 900), maxLag = Math.min(n - W - 1, Math.floor(sr / 70));
    var e0 = 0;
    for (i = 0; i < W; i++) e0 += fbuf[i] * fbuf[i];
    var best = -1, bestLag = 0, rs = new Float32Array(maxLag + 2);
    var eLag = 0;
    for (i = 0; i < W; i++) eLag += fbuf[i + minLag] * fbuf[i + minLag];
    for (lag = minLag; lag <= maxLag; lag++) {
      var c = 0;
      for (i = 0; i < W; i++) c += fbuf[i] * fbuf[i + lag];
      var r = c / (Math.sqrt(e0 * eLag) + 1e-9);
      rs[lag] = r;
      if (r > best) { best = r; bestLag = lag; }
      eLag += fbuf[lag + W] * fbuf[lag + W] - fbuf[lag] * fbuf[lag];     // slide the window one sample
    }
    if (best < 0.8) return null;
    // Take the shortest lag that is nearly as good (a whole number of periods repeats equally well).
    for (lag = minLag + 1; lag < bestLag; lag++) {
      if (rs[lag] >= best * 0.93 && rs[lag] >= rs[lag - 1] && rs[lag] >= rs[lag + 1]) { bestLag = lag; break; }
    }
    var a = rs[bestLag - 1] || 0, b = rs[bestLag], d = rs[bestLag + 1] || 0, shift = 0, den = a - 2 * b + d;
    if (den) shift = 0.5 * (a - d) / den;
    return { hz: sr / (bestLag + shift), clarity: best, rms: rms };
  };
})();
