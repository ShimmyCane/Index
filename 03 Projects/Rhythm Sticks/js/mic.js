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

  M.start = function () {
    M.want = true;
    if (M.state === 'on' || M.state === 'starting') return Promise.resolve();
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      M.state = 'unsupported';
      RS.err('Microphone is not available here (it needs https or localhost)');
      return Promise.resolve();
    }
    M.state = 'starting';
    return navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } })
      .then(function (s) {
        if (!M.want) { s.getTracks().forEach(function (t) { t.stop(); }); M.state = 'off'; return; }
        stream = s;
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
      })
      .catch(function (e) {
        M.state = 'denied';
        RS.err('Microphone unavailable', e);
      });
  };

  M.stop = function () {
    M.want = false;
    cancelAnimationFrame(raf); raf = 0;
    if (src) { try { src.disconnect(); } catch (e) { /* already gone */ } src = null; }
    if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    M.analyser = null; M.freqData = null; M.level = 0;
    if (M.state !== 'denied' && M.state !== 'unsupported') M.state = 'off';
  };

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
