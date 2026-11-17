/* Mind Palace: small sounds made in the page with Web Audio. No sound files. */
(function () {
  'use strict';
  var MP = window.MP = window.MP || {};
  var ctx = null;
  function ac() {
    if (!ctx) { var C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, at, len, type, gain) {
    var c = ac(); if (!c) return;
    var o = c.createOscillator(), g = c.createGain(), t = c.currentTime + at;
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain || 0.12, t + 0.015); g.gain.exponentialRampToValueAtTime(0.001, t + len);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + len + 0.05);
  }
  var SOUNDS = {
    tap: function () { tone(660, 0, 0.08, 'triangle', 0.08); },
    go: function () { tone(392, 0, 0.12, 'triangle'); tone(523, 0.1, 0.16, 'triangle'); },
    arrive: function () { tone(523, 0, 0.16); tone(659, 0.12, 0.16); tone(784, 0.24, 0.3); },
    good: function () { tone(659, 0, 0.14); tone(880, 0.12, 0.3); },
    almost: function () { tone(523, 0, 0.2, 'triangle'); },
    miss: function () { tone(330, 0, 0.16, 'triangle'); tone(262, 0.14, 0.3, 'triangle'); },
    build: function () { tone(294, 0, 0.1, 'square', 0.05); tone(440, 0.08, 0.14, 'square', 0.05); },
    undo: function () { tone(440, 0, 0.1, 'triangle'); tone(330, 0.08, 0.14, 'triangle'); }
  };
  MP.sound = function (name) {
    if (!MP.settings.sound || !SOUNDS[name]) return;
    try { SOUNDS[name](); } catch (e) { /* sound is never required */ }
  };
})();
