// Sound cues made in the page (Web Audio only, no files): the count-in before a take and the "saved" chime.
// Every count-in is four beats, 0.7 s apart; the take starts on beat 4 (the high one). Beat 4 is short,
// so the speaker does not leak into the first note.
(function () {
  'use strict';
  var GAP = 0.7;
  function vol() { return (PC.settings.volume / 100) * 0.9; }
  function tone(c, t, freq, dur, type, peak) {
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, peak * vol()), t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  function click(c, t, freq, peak) {                       // wood block: a short noise burst through a band filter
    var len = Math.floor(c.sampleRate * 0.05), b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 6; g.gain.value = peak * vol() * 2.2;
    s.buffer = b; s.connect(f); f.connect(g); g.connect(c.destination); s.start(t);
  }
  function kick(c, t, hi) {
    var o = c.createOscillator(), g = c.createGain();
    o.frequency.setValueAtTime(hi ? 320 : 150, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(vol(), t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.16);
  }
  var NOTES = [523.25, 659.25, 783.99, 1046.5];
  var KINDS = {
    beeps: function (c, t, i) { tone(c, t, i < 3 ? 440 : 880, i < 3 ? 0.16 : 0.12, 'sine', 0.5); },
    chime: function (c, t, i) { tone(c, t, NOTES[i], i < 3 ? 0.45 : 0.14, 'triangle', 0.45); },
    wood: function (c, t, i) { click(c, t, i < 3 ? 900 : 1700, 0.6); },
    drum: function (c, t, i) { if (i < 3) kick(c, t, false); else { kick(c, t, true); click(c, t, 2500, 0.4); } },
    voice: function (c, t, i) {
      if (!window.speechSynthesis) { KINDS.beeps(c, t, i); return; }
      var words = ['three', 'two', 'one', 'play'], u = new SpeechSynthesisUtterance(words[i]);
      u.volume = vol(); u.rate = 1.15; speechSynthesis.speak(u);
    },
    lights: function () { }                                // silent: the dots and colours do the work
  };
  window.Cues = {
    kinds: [
      { v: 'beeps', label: 'Beeps', hint: 'three low, one high' },
      { v: 'chime', label: 'Chimes', hint: 'a rising run' },
      { v: 'wood', label: 'Wood clicks', hint: 'click click click CLICK' },
      { v: 'drum', label: 'Drum', hint: 'thump thump thump hit' },
      { v: 'voice', label: 'Voice', hint: 'says "three, two, one, play"' },
      { v: 'lights', label: 'Lights only', hint: 'no sound, dots fill up' }
    ],
    // Plays the count-in; calls onBeat(0..3) on each beat; resolves at beat 4 (the moment to start recording).
    countIn: function (kind, onBeat, token) {
      var c = PC.ctx(), play = KINDS[kind] || KINDS.beeps, t0 = c.currentTime + 0.12;
      return new Promise(function (resolve) {
        for (var i = 0; i < 4; i++) (function (i) {
          var at = t0 + i * GAP;
          try { play(c, at, i); } catch (e) { PC.err('Cue', e); }
          setTimeout(function () {
            if (token && token.cancelled) return;
            onBeat(i); if (i === 3) resolve();
          }, Math.max(0, (at - c.currentTime) * 1000));
        })(i);
      });
    },
    preview: function (kind) { window.Cues.countIn(kind, function () { }); },
    saved: function () {                                    // a small two-note chime when a take is kept
      var c = PC.ctx(), t = c.currentTime + 0.02;
      tone(c, t, 784, 0.25, 'triangle', 0.4); tone(c, t + 0.13, 1175, 0.4, 'triangle', 0.4);
    },
    tick: function () { var c = PC.ctx(); tone(c, c.currentTime + 0.01, 660, 0.08, 'sine', 0.25); },
    gap: GAP
  };
})();
