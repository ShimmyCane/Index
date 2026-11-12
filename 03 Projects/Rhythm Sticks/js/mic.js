// Microphone: looked at, never played back, stored or sent.
// Gives a level, frequency data, and an onset detector that reacts to a sharp attack
// (a clap, a tap, a drum) and ignores the slow rise and fall of speech.
(function () {
  'use strict';
  var M = RS.mic = { state: 'off', level: 0, want: false, analyser: null, freqData: null };
  var stream = null, src = null, raf = 0, listeners = [], tdata = null;
  var base = 0.01, prev = 0, lastOnset = 0;

  M.onOnset = function (fn) {
    listeners.push(fn);
    return function () { listeners = listeners.filter(function (f) { return f !== fn; }); };
  };
  function fire(strength) {
    listeners.slice().forEach(function (fn) { try { fn(strength); } catch (e) { RS.err('Onset handler', e); } });
  }
  M._fakeOnset = function (s) { fire(s == null ? 1 : s); };   // for tests

  // The browser decides whether to remember a "yes" (Chrome and Firefox do, Safari may ask again each visit).
  // What the page can do: ask as seldom as possible.
  //  - It never asks again after a refusal (the gear has a button to try again).
  //  - Where the browser reports the permission as saved ("granted"), leaving a microphone mode releases the
  //    microphone, and coming back starts it silently.
  //  - Where it cannot tell (Safari), the stream is kept switched off for the rest of the visit, so changing
  //    modes does not ask again. It is switched on only in Beads and Heat, and released when the page closes.
  var held = null;
  M.perm = 'unknown';
  try {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' }).then(function (p) {
        M.perm = p.state;
        p.onchange = function () { M.perm = p.state; };
      }).catch(function () { /* not supported for the microphone */ });
    }
  } catch (e) { /* not supported */ }

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
    base = 0.01; prev = 0;
    M.state = 'on';
    loop();
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

  M.stop = function () {
    M.want = false;
    cancelAnimationFrame(raf); raf = 0;
    if (src) { try { src.disconnect(); } catch (e) { /* already gone */ } src = null; }
    if (stream) {
      if (M.perm === 'granted') { stream.getTracks().forEach(function (t) { t.stop(); }); }
      else { stream.getTracks().forEach(function (t) { t.enabled = false; }); held = stream; }
      stream = null;
    }
    M.analyser = null; M.freqData = null; M.level = 0;
    if (M.state !== 'denied' && M.state !== 'unsupported') M.state = 'off';
  };
  window.addEventListener('pagehide', function () {
    if (held) { held.getTracks().forEach(function (t) { t.stop(); }); held = null; }
    if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
  });

  function loop() {
    raf = requestAnimationFrame(loop);
    var an = M.analyser;
    if (!an) return;
    an.getByteFrequencyData(M.freqData);
    an.getByteTimeDomainData(tdata);
    var bh = an.context.sampleRate / an.fftSize;
    var lo = Math.floor(700 / bh), hi = Math.min(M.freqData.length - 1, Math.floor(9000 / bh));
    var e = 0, k;
    for (k = lo; k <= hi; k++) { var v = M.freqData[k] / 255; e += v * v; }
    e /= (hi - lo + 1);
    var sum = 0;
    for (k = 0; k < tdata.length; k++) { var x = (tdata[k] - 128) / 128; sum += x * x; }
    M.level = Math.sqrt(sum / tdata.length);

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
})();
