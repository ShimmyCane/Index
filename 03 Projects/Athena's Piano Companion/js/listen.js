// The ear: microphone in, level, onsets (a note starts), a rough pitch for each onset, and a capture buffer.
// All timing uses the audio clock (samples), so a test can feed made-up sound with Listen.feed().
(function () {
  'use strict';
  var CHUNK = 1024;                                        // samples per analysis step
  var MIN_THR = { low: 0.02, mid: 0.01, high: 0.005 };     // quietest sound that counts as playing
  var L = window.Listen = {
    sr: 44100, t: 0, level: 0, floor: 0.002, thr: 0.01, active: false, lastActiveAt: -99,
    onsets: [],                                            // { t, midi } since capture began (or the last clear)
    capturing: false, chunks: [], capStart: 0, mode: 'off', ready: false, error: ''
  };
  var ring = new Float32Array(8192), rp = 0, prevRms = [0, 0, 0, 0], lastOnset = -9, pendingPitch = [], totalSamples = 0;

  function rmsOf(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i] * a[i]; return Math.sqrt(s / a.length); }

  // Rough pitch by autocorrelation over the last 4096 samples: returns a MIDI note or null.
  L.pitch = function (buf, sr) {
    var n = buf.length, minLag = Math.floor(sr / 1000), maxLag = Math.min(Math.floor(sr / 55), n >> 1), best = 0, bestLag = 0, i, lag;
    var e0 = 0; for (i = 0; i < n; i++) e0 += buf[i] * buf[i];
    if (e0 < 1e-6) return null;
    var corr = new Float32Array(maxLag + 2);
    for (lag = minLag; lag <= maxLag + 1; lag++) {
      var s = 0, m = n - lag;
      for (i = 0; i < m; i += 2) s += buf[i] * buf[i + lag];       // every other sample: fast enough
      corr[lag] = s * 2 / (e0 * (m / n));
    }
    for (lag = minLag + 1; lag <= maxLag; lag++) {                  // first strong local peak, to avoid octave-down errors
      if (corr[lag] > 0.6 && corr[lag] >= corr[lag - 1] && corr[lag] >= corr[lag + 1]) { bestLag = lag; best = corr[lag]; break; }
    }
    if (!bestLag) { for (lag = minLag; lag <= maxLag; lag++) if (corr[lag] > best) { best = corr[lag]; bestLag = lag; } if (best < 0.5) return null; }
    var f = sr / bestLag;
    return Math.round(69 + 12 * Math.log(f / 440) / Math.LN2);
  };

  // One analysis step on CHUNK samples.
  function step(chunk) {
    var dt = chunk.length / L.sr;
    L.t += dt; totalSamples += chunk.length;
    for (var i = 0; i < chunk.length; i++) { ring[rp] = chunk[i]; rp = (rp + 1) & 8191; }
    var r = rmsOf(chunk);
    L.level = r > L.level ? r : L.level * 0.85 + r * 0.15;           // quick up, slower down
    if (!L.active || r < L.floor) L.floor = Math.max(0.0005, L.floor * 0.995 + r * 0.005);   // learn the room while quiet
    L.thr = Math.max(MIN_THR[PC.settings.sens] || MIN_THR.mid, L.floor * 3);
    var prev = (prevRms[0] + prevRms[1] + prevRms[2] + prevRms[3]) / 4;
    var wasActive = L.active;
    L.active = r > L.thr;
    if (L.active) L.lastActiveAt = L.t;
    // a note starts: clearly louder than the last few steps, and above the threshold
    if (r > L.thr * 1.4 && r > prev * 2.2 && (L.t - lastOnset) > 0.09) {
      lastOnset = L.t;
      var o = { t: L.t, midi: null };
      L.onsets.push(o); if (L.onsets.length > 400) L.onsets.shift();
      pendingPitch.push({ o: o, at: totalSamples + Math.floor(L.sr * 0.07) });   // read the pitch once the attack settles
      PC.emit('onset', o);
    }
    prevRms.shift(); prevRms.push(r);
    while (pendingPitch.length && pendingPitch[0].at <= totalSamples) {
      var p = pendingPitch.shift(), win = new Float32Array(4096);
      for (var k = 0; k < 4096; k++) win[k] = ring[(rp - 4096 + k + 16384) & 8191];
      try { p.o.midi = L.pitch(win, L.sr); } catch (e) { p.o.midi = null; }
      PC.emit('pitch', p.o);
    }
    if (L.capturing) L.chunks.push(chunk);
    PC.emit('chunk', L, wasActive);
  }
  // Feed arbitrary-length samples (the worklet sends 2048 at a time; tests send whatever they like).
  var carry = new Float32Array(0);
  L.feed = function (samples) {
    var all = new Float32Array(carry.length + samples.length);
    all.set(carry); all.set(samples, carry.length);
    var i = 0;
    for (; i + CHUNK <= all.length; i += CHUNK) step(all.subarray(i, i + CHUNK).slice());
    carry = all.slice(i);
  };
  L.beginCapture = function () { L.chunks = []; L.capturing = true; L.capStart = L.t; L.onsets = []; L.lastActiveAt = L.t; };
  L.endCapture = function () {
    L.capturing = false;
    var n = 0, i; L.chunks.forEach(function (c) { n += c.length; });
    var out = new Float32Array(n), o = 0;
    L.chunks.forEach(function (c) { out.set(c, o); o += c.length; });
    L.chunks = [];
    return { data: out, sr: L.sr, start: L.capStart, onsets: L.onsets.slice() };
  };
  L.reset = function () { L.onsets = []; carry = new Float32Array(0); };

  var WORKLET = 'class P extends AudioWorkletProcessor{constructor(){super();this.b=new Float32Array(2048);this.n=0}' +
    'process(i){var x=i[0]&&i[0][0];if(!x)return true;for(var k=0;k<x.length;k++){this.b[this.n++]=x[k];' +
    'if(this.n===2048){this.port.postMessage(this.b.slice(0));this.n=0}}return true}}registerProcessor("pc-tap",P)';
  var stream = null, node = null;
  L.start = async function () {
    if (L.ready) return;
    var c = PC.ctx();
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('This browser cannot use the microphone here (it needs https).');
    // music, not speech: switch off echo cancelling, noise suppression and auto volume, which chew up piano notes
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    L.sr = c.sampleRate;
    var src = c.createMediaStreamSource(stream), mute = c.createGain(); mute.gain.value = 0; mute.connect(c.destination);
    if (c.audioWorklet && window.AudioWorkletNode) {
      var url = URL.createObjectURL(new Blob([WORKLET], { type: 'application/javascript' }));
      await c.audioWorklet.addModule(url);
      node = new AudioWorkletNode(c, 'pc-tap');
      node.port.onmessage = function (ev) { L.feed(ev.data); };
    } else {                                                    // older Safari
      node = c.createScriptProcessor(2048, 1, 1);
      node.onaudioprocess = function (ev) { L.feed(new Float32Array(ev.inputBuffer.getChannelData(0))); };
    }
    src.connect(node); node.connect(mute);
    L.ready = true;
  };
  L.stop = function () {
    if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
    stream = null; if (node) { try { node.disconnect(); } catch (e) { /* done */ } node = null; }
    L.ready = false;
  };

  // ---- the stop note: a short run of notes the player chooses (rhythm and rough pitch)
  L.signature = function (onsets) {
    var s = { n: onsets.length, midi: onsets.map(function (o) { return o.midi; }), ioi: [] };
    for (var i = 1; i < onsets.length; i++) s.ioi.push(onsets[i].t - onsets[i - 1].t);
    return s;
  };
  // Does the end of this onset list match the signature? Pitch within a semitone (octave slips allowed), rhythm within 35%.
  L.matches = function (list, sig) {
    if (!sig || list.length < sig.n) return false;
    var tail = list.slice(list.length - sig.n), known = 0, ok = 0, i;
    for (i = 0; i < sig.n; i++) {
      var a = tail[i].midi, b = sig.midi[i];
      if (a == null || b == null) continue;
      known++;
      var d = ((a - b) % 12 + 12) % 12;
      if (d <= 1 || d === 11) ok++;
    }
    if (known >= 2 && ok < known) return false;
    for (i = 1; i < sig.n; i++) {
      var got = tail[i].t - tail[i - 1].t, want = sig.ioi[i - 1];
      if (Math.abs(got - want) > Math.max(0.12, want * 0.35)) return false;
    }
    return true;
  };
})();
