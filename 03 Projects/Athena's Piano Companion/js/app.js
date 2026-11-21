// Shared core: settings, errors, small helpers, WAV encoding, audio context.
// No build step. Every page loads this first.
(function () {
  'use strict';
  var PC = window.PC = { version: '0.2.0' };

  // ---- events
  var handlers = {};
  PC.on = function (name, fn) { (handlers[name] = handlers[name] || []).push(fn); };
  PC.emit = function (name) {
    var args = Array.prototype.slice.call(arguments, 1);
    (handlers[name] || []).forEach(function (fn) { try { fn.apply(null, args); } catch (e) { PC.err('Handler for ' + name, e); } });
  };

  // ---- settings (device storage, in a try/catch; the page works if storage is blocked)
  var DEFAULTS = {
    player: 'Athena',
    cue: 'beeps',            // beeps | chime | wood | drum | voice | lights
    cardColor: 1, cardWave: 1, cardNumber: 1,
    pause: 5,                // seconds of quiet that end a take
    sens: 'mid',             // low | mid | high microphone sensitivity
    stopPause: 1, stopNote: 1, stopVoice: 1,
    voice: 1,
    startPhrases: "let's record, please record, start recording, start",
    stopPhrases: "stop recording, stop recording please, stop, I'm done",
    startNote: 0,            // start by playing the learned start notes
    tailSec: 2,              // seconds of pause kept at the end of a take
    album: '',
    volume: 80,
    showErrors: 0
  };
  PC.settings = Object.assign({}, DEFAULTS);
  try { PC.settings = Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem('pc.settings') || '{}')); } catch (e) { /* blocked */ }
  // Phrase lists saved by an older version get the newer phrases added once.
  (function () {
    try {
      if (!localStorage.getItem('pc.mig.stop2')) {
        var have = PC.settings.stopPhrases.split(',').map(function (x) { return x.trim().toLowerCase(); });
        ['stop', "i'm done"].forEach(function (ph) { if (have.indexOf(ph) < 0) PC.settings.stopPhrases += ', ' + (ph === "i'm done" ? "I'm done" : ph); });
        localStorage.setItem('pc.settings', JSON.stringify(PC.settings)); localStorage.setItem('pc.mig.stop2', '1');
      }
    } catch (e) { /* blocked */ }
  })();
  PC.save = function () { try { localStorage.setItem('pc.settings', JSON.stringify(PC.settings)); } catch (e) { /* blocked */ } };
  PC.set = function (key, value) { PC.settings[key] = value; PC.save(); PC.emit('setting', key, value); };
  PC.store = {                                   // small per-device values (stop gesture, last page...)
    get: function (k, d) { try { var v = localStorage.getItem('pc.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('pc.' + k, JSON.stringify(v)); } catch (e) { /* blocked */ } }
  };

  // ---- errors (kept always; shown only when "Show errors" is on)
  PC.errors = [];
  PC.err = function (msg, e) {
    var line = new Date().toLocaleTimeString() + '  ' + msg + (e ? ': ' + (e.message || e) : '');
    PC.errors.push(line);
    if (PC.errors.length > 80) PC.errors.shift();
    PC.emit('error', line);
    if (window.console) console.warn(line);
  };
  window.addEventListener('error', function (ev) { PC.err('Page error', ev.message); });
  window.addEventListener('unhandledrejection', function (ev) { PC.err('Promise', ev.reason); });

  // ---- helpers
  PC.uid = function (p) { return p + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); };
  PC.fmt = function (sec) {
    sec = Math.max(0, Math.round(sec));
    return Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2);
  };
  PC.pad = function (n) { return ('0' + n).slice(-2); };
  PC.stamp = function (d) {
    return d.getFullYear() + '-' + PC.pad(d.getMonth() + 1) + '-' + PC.pad(d.getDate()) + '-' + PC.pad(d.getHours()) + PC.pad(d.getMinutes());
  };
  PC.h = function (tag, attrs, kids) {
    var el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') el.textContent = attrs[k];
      else if (k === 'html') el.innerHTML = attrs[k];
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== false && attrs[k] != null) el.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
    });
    [].concat(kids || []).forEach(function (c) { if (c != null) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return el;
  };
  // The people who play, in the order the button cycles through them.
  PC.PLAYERS = ['Athena', 'Felix', 'Ying', 'Jimmy', 'Guest'];
  PC.ICONS = { Athena: '🎹', Felix: '🎸', Ying: '🎵', Jimmy: '🎺', Guest: '👋' };
  // A session is one day of playing: the first take of a new day is take 1 again.
  PC.sessionId = function (d) { d = d instanceof Date ? d : new Date(d); return 's-' + d.getFullYear() + '-' + PC.pad(d.getMonth() + 1) + '-' + PC.pad(d.getDate()); };
  PC.sessionOf = function (t) { return t.session_id || PC.sessionId(t.taken_at); };
  PC.colorFor = function (n) { return 'hsl(' + ((n * 47 + 20) % 360) + ' 72% 82%)'; };   // pastel, never harsh

  // ---- audio context (iPad: create or resume it only inside a tap)
  var actx = null;
  PC.ctx = function () {
    if (!actx) { var AC = window.AudioContext || window.webkitAudioContext; actx = new AC(); }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  };

  // ---- audio files: 16-bit mono WAV (plays everywhere, decodes everywhere)
  PC.encodeWav = function (f32, sr) {
    var n = f32.length, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
    function str(o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
    str(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); str(8, 'WAVE'); str(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    str(36, 'data'); v.setUint32(40, n * 2, true);
    for (var i = 0; i < n; i++) {
      var s = Math.max(-1, Math.min(1, f32[i]));
      v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return new Blob([buf], { type: 'audio/wav' });
  };
  PC.decode = function (blob) {                      // Blob -> { data: Float32Array (mono), sr }
    return blob.arrayBuffer().then(function (ab) {
      var c = PC.ctx();
      return new Promise(function (res, rej) { c.decodeAudioData(ab, res, rej); });
    }).then(function (b) {
      var ch = b.numberOfChannels, out = new Float32Array(b.length);
      for (var c = 0; c < ch; c++) { var d = b.getChannelData(c); for (var i = 0; i < out.length; i++) out[i] += d[i] / ch; }
      return { data: out, sr: b.sampleRate };
    });
  };
  PC.peaks = function (f32, n) {                     // n loudness bars, 0..1, for the card picture
    var out = [], step = Math.max(1, Math.floor(f32.length / n)), max = 0.0001, i, j;
    for (i = 0; i < n; i++) {
      var m = 0;
      for (j = i * step; j < Math.min(f32.length, (i + 1) * step); j++) { var a = Math.abs(f32[j]); if (a > m) m = a; }
      out.push(m); if (m > max) max = m;
    }
    return out.map(function (x) { return Math.round(x / max * 100) / 100; });
  };
  PC.drawPeaks = function (canvas, peaks, color) {
    var g = canvas.getContext('2d'), w = canvas.width, hgt = canvas.height;
    g.clearRect(0, 0, w, hgt); g.fillStyle = color || '#2f2d3d';
    var n = peaks.length, bw = w / n;
    for (var i = 0; i < n; i++) {
      var bh = Math.max(2, peaks[i] * (hgt - 4));
      g.fillRect(i * bw + 1, (hgt - bh) / 2, Math.max(1, bw - 2), bh);
    }
  };

  // ---- playing a stored take (one at a time, so two never overlap)
  var audioEl = null, audioUrl = null;
  PC.playBlob = function (blob, onEnd) {
    PC.stopPlayback();
    audioUrl = URL.createObjectURL(blob);
    audioEl = new Audio(audioUrl);
    audioEl.volume = PC.settings.volume / 100;
    audioEl.onended = function () { PC.stopPlayback(); if (onEnd) onEnd(); };
    audioEl.play().catch(function (e) { PC.err('Playback', e); });
    PC.emit('playing', true);
    return audioEl;
  };
  PC.stopPlayback = function () {
    if (audioEl) { audioEl.onended = null; audioEl.pause(); audioEl = null; }
    if (audioUrl) { URL.revokeObjectURL(audioUrl); audioUrl = null; }
    PC.emit('playing', false);
  };
  PC.isPlaying = function () { return !!audioEl && !audioEl.paused; };
})();
