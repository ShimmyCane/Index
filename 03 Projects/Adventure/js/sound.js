/* Adventure — copied from 03 Projects/Voice/js/sound.js (Voice 0.4), plus the forest tune and the hoot and hum effects.
   Voice — sound effects and background tunes, all made with the Web Audio API (no sound files).
   VoiceSound.sfx(name)            play one effect: knock door wind birds axe steps growl splash waves howl bell gulp magic hoot hum
   VoiceSound.music(style)         start a soft looping tune: japan korea china france spain italy netherlands australia forest
   VoiceSound.stopMusic()          stop the tune
   VoiceSound.setLevels(sfx, mus)  0..1 volumes
   The context is created on the first call, which must come from a tap (iPad rule). */
(function () {
  'use strict';
  var ctx = null, sfxBus = null, musBus = null, noiseBuf = null, levels = { sfx: 0.5, mus: 0.18 };
  function ac() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      sfxBus = ctx.createGain(); sfxBus.gain.value = levels.sfx; sfxBus.connect(ctx.destination);
      musBus = ctx.createGain(); musBus.gain.value = levels.mus; musBus.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      var d = noiseBuf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function env(g, t, a, peak, dec) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); }
  function osc(type, f, t, dur, peak, out, a) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    env(g, t, a || 0.005, peak, dur); o.connect(g); g.connect(out || sfxBus);
    o.start(t); o.stop(t + (a || 0.005) + dur + 0.05);
    return o;
  }
  function noise(t, dur, peak, type, freq, q, out, a) {
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = type || 'lowpass'; f.frequency.setValueAtTime(freq || 1000, t); f.Q.value = q || 0.7;
    env(g, t, a || 0.005, peak, dur); s.connect(f); f.connect(g); g.connect(out || sfxBus);
    s.start(t, Math.random()); s.stop(t + (a || 0.005) + dur + 0.05);
    return f;
  }

  var SFX = {
    knock: function (t) { [0, 0.22, 0.44].forEach(function (d) { noise(t + d, 0.09, 0.9, 'lowpass', 420, 2); osc('sine', 110, t + d, 0.08, 0.6); }); },
    door: function (t) { var o = osc('sawtooth', 190, t, 1.0, 0.12, null, 0.05); o.frequency.linearRampToValueAtTime(260, t + 0.4); o.frequency.linearRampToValueAtTime(170, t + 0.8); noise(t + 0.9, 0.12, 0.5, 'lowpass', 300); },
    wind: function (t) { var f = noise(t, 2.2, 0.35, 'bandpass', 300, 3, null, 0.6); f.frequency.linearRampToValueAtTime(900, t + 1.2); f.frequency.linearRampToValueAtTime(400, t + 2.6); },
    birds: function (t) { [0, 0.18, 0.5, 0.65, 1.1].forEach(function (d, i) { var o = osc('sine', 2600 + i * 150, t + d, 0.08, 0.18); o.frequency.exponentialRampToValueAtTime(4200 - i * 100, t + d + 0.07); }); },
    axe: function (t) { [0, 0.6].forEach(function (d) { noise(t + d, 0.12, 0.5, 'highpass', 1500); osc('sine', 180, t + d, 0.15, 0.4); }); },
    steps: function (t) { for (var i = 0; i < 4; i++) noise(t + i * 0.32, 0.07, 0.5, 'lowpass', 600 - i * 40, 1); },
    growl: function (t) { var o = osc('sawtooth', 72, t, 1.1, 0.35, null, 0.1), lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 23; lg.gain.value = 18; lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(t + 1.3); o.frequency.linearRampToValueAtTime(55, t + 1.1); },
    splash: function (t) { var f = noise(t, 0.7, 0.6, 'lowpass', 3500, 0.8); f.frequency.exponentialRampToValueAtTime(250, t + 0.7); },
    waves: function (t) { var f = noise(t, 2.4, 0.3, 'lowpass', 350, 0.5, null, 1.0); f.frequency.linearRampToValueAtTime(900, t + 1.2); f.frequency.linearRampToValueAtTime(300, t + 3.2); },
    howl: function (t) { var o = osc('sine', 320, t, 1.8, 0.25, null, 0.3); o.frequency.linearRampToValueAtTime(620, t + 0.6); o.frequency.linearRampToValueAtTime(480, t + 1.9); },
    bell: function (t) { [0, 0.45].forEach(function (d) { osc('sine', 1180, t + d, 1.0, 0.2); osc('sine', 2950, t + d, 0.5, 0.06); }); },
    gulp: function (t) { var o = osc('sine', 320, t, 0.18, 0.5); o.frequency.exponentialRampToValueAtTime(110, t + 0.16); },
    hoot: function (t) { [0, 0.55, 0.75].forEach(function (d, i) { var o = osc('sine', i ? 400 : 430, t + d, i ? 0.5 : 0.25, 0.3, null, 0.04); o.frequency.linearRampToValueAtTime(i ? 360 : 410, t + d + 0.3); }); },
    hum: function (t) { var o = osc('sine', 220, t, 2.2, 0.15, null, 0.4), o2 = osc('sine', 330.5, t, 2.2, 0.07, null, 0.6); void o; void o2; },
    magic: function (t) { [0, 4, 7, 12, 16, 19, 24].forEach(function (s, i) { osc('triangle', 784 * Math.pow(2, s / 12), t + i * 0.07, 0.4, 0.12); }); }
  };

  /* ---- tunes: [beat, semitones from root, length in beats] patterns, one bar loop each ---- */
  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function pluck(m, t, dur, type, peak, cut) {
    var o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = type || 'triangle'; o.frequency.value = mtof(m);
    f.type = 'lowpass'; f.frequency.setValueAtTime(cut || 3000, t); f.frequency.exponentialRampToValueAtTime(400, t + dur);
    env(g, t, 0.004, peak || 0.5, dur); o.connect(f); f.connect(g); g.connect(musBus); o.start(t); o.stop(t + dur + 0.1);
  }
  function pad(m, t, dur, type, peak, trem) {
    [0, 0.08].forEach(function (det) {
      var o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = type || 'sawtooth'; o.frequency.value = mtof(m) * (1 + det / 100);
      f.type = 'lowpass'; f.frequency.value = 1400;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak || 0.12, t + 0.05); g.gain.setValueAtTime(peak || 0.12, t + dur - 0.06); g.gain.linearRampToValueAtTime(0.0001, t + dur);
      if (trem) { var l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = trem; lg.gain.value = (peak || 0.12) * 0.4; l.connect(lg); lg.connect(g.gain); l.start(t); l.stop(t + dur); }
      o.connect(f); f.connect(g); g.connect(musBus); o.start(t); o.stop(t + dur + 0.05);
    });
  }
  function organ(m, t, dur, peak) { [1, 2, 4].forEach(function (h, i) { var o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = mtof(m) * h; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime((peak || 0.1) / (i + 1), t + 0.02); g.gain.linearRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(musBus); o.start(t); o.stop(t + dur + 0.05); }); }

  var STYLES = {
    // Forest (Adventure): slow kantele-like plucks in a D minor pentatonic over a soft drone, sparse like birdsong
    forest: { bpm: 58, beats: 16, root: 62, play: function (b, t, sec) {
      var mel = { 0: 0, 2: 3, 3: 5, 4: 7, 6: 10, 7: 7, 9: 5, 10: 3, 12: 5, 13: 3, 14: 0 };
      if (mel[b] !== undefined) pluck(62 + mel[b], t, sec * 2.4, 'triangle', 0.35, 2000);
      if (b === 0 || b === 8) pad(50, t, sec * 8, 'triangle', 0.05);
      if (b === 4 || b === 12) pluck(69 + (b === 4 ? 0 : -2), t, sec * 1.5, 'sine', 0.15, 3500); } },
    // Japanese in-scale (miyako-bushi) on a koto-like pluck, slow
    japan: { bpm: 66, beats: 8, root: 62, play: function (b, t, sec) {
      var mel = [[0, 12], [1, 8], [2, 7], [3, 5], [4, 7], [5, 3], [6, 1], [7, 0]], scale = [0, 1, 5, 7, 8, 12];
      mel.forEach(function (n) { if (n[0] === b) pluck(62 + n[1], t, sec * 1.8, 'triangle', 0.45, 2500); });
      if (b % 4 === 0) pluck(50, t, sec * 3, 'triangle', 0.3, 900); void scale; } },
    // Korean pentatonic, gayageum-like pluck with a bend
    korea: { bpm: 72, beats: 6, root: 60, play: function (b, t, sec) {
      var mel = [9, 7, 5, 7, 2, 0]; pluck(60 + mel[b], t, sec * 1.6, 'triangle', 0.45, 2200); if (b === 0 || b === 3) pluck(48, t, sec * 2.5, 'triangle', 0.3, 800); } },
    // Chinese major pentatonic, guzheng-like run
    china: { bpm: 76, beats: 8, root: 62, play: function (b, t, sec) {
      var mel = [0, 2, 4, 7, 9, 7, 4, 2]; pluck(62 + mel[b], t, sec * 1.4, 'triangle', 0.4, 2800); if (b % 4 === 0) pluck(50, t, sec * 3, 'triangle', 0.3, 900); } },
    // French musette waltz on an accordion-like reed with tremolo
    france: { bpm: 150, beats: 6, root: 60, play: function (b, t, sec) {
      var bass = [48, null, null, 43, null, null], chord = [[64, 67], [64, 67], [64, 67], [62, 65], [62, 65], [62, 65]], mel = [76, 74, 72, 71, 72, 74];
      if (bass[b]) pad(bass[b], t, sec * 0.9, 'sawtooth', 0.09);
      if (b % 3) chord[b].forEach(function (m) { pad(m, t, sec * 0.5, 'sawtooth', 0.04, 6); });
      pad(mel[b], t, sec * 0.95, 'square', 0.035, 6); } },
    // Spanish Phrygian guitar arpeggio
    spain: { bpm: 112, beats: 8, root: 52, play: function (b, t, sec) {
      var arp = [52, 59, 64, 65, 64, 59, 53, 57]; pluck(arp[b], t, sec * 2, 'sawtooth', 0.22, 1800); if (b === 0 || b === 6) pluck(40, t, sec * 3, 'sawtooth', 0.2, 600); } },
    // Italian mandolin tremolo
    italy: { bpm: 84, beats: 4, root: 67, play: function (b, t, sec) {
      var mel = [79, 76, 77, 74]; for (var i = 0; i < 6; i++) pluck(mel[b], t + i * sec / 6, sec / 5, 'triangle', 0.25, 3500); if (b % 2 === 0) pluck(55, t, sec * 1.8, 'triangle', 0.3, 900); } },
    // Dutch barrel organ march
    netherlands: { bpm: 104, beats: 8, root: 60, play: function (b, t, sec) {
      var mel = [72, 76, 79, 76, 77, 74, 71, 74], bass = [48, 55, 48, 55, 50, 55, 43, 55]; organ(mel[b], t, sec * 0.8, 0.08); organ(bass[b], t, sec * 0.5, 0.06); } },
    // Australian didgeridoo-like drone with clapsticks
    australia: { bpm: 96, beats: 8, root: 38, play: function (b, t, sec) {
      if (b === 0) { var o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(), l = ctx.createOscillator(), lg = ctx.createGain(), d = sec * 8;
        o.type = 'sawtooth'; o.frequency.value = mtof(38); f.type = 'lowpass'; f.frequency.value = 500; f.Q.value = 8;
        l.frequency.value = 1.5; lg.gain.value = 300; l.connect(lg); lg.connect(f.frequency);
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.12, t + 0.2); g.gain.setValueAtTime(0.12, t + d - 0.2); g.gain.linearRampToValueAtTime(0.0001, t + d);
        o.connect(f); f.connect(g); g.connect(musBus); o.start(t); o.stop(t + d + 0.05); l.start(t); l.stop(t + d); }
      if (b % 2 === 0 || b === 5) noise(t, 0.05, 0.4, 'bandpass', 2500, 5, musBus); } }
  };
  var tune = null;
  function music(style) {
    var st = STYLES[style]; if (!st) return;
    ac();
    if (tune && tune.style === style) return;
    stopMusic();
    var sec = 60 / st.bpm, next = ctx.currentTime + 0.1, beat = 0;
    tune = { style: style, timer: setInterval(function () {
      while (next < ctx.currentTime + 0.5) { st.play(beat, next, sec); next += sec; beat = (beat + 1) % st.beats; }
    }, 120) };
  }
  function stopMusic() { if (tune) { clearInterval(tune.timer); tune = null; } }

  window.AdvSound = {
    unlock: function () { try { ac(); } catch (e) { /* no Web Audio */ } },
    sfx: function (name) { if (!SFX[name]) return; ac(); SFX[name](ctx.currentTime + 0.02); },
    music: music,
    stopMusic: stopMusic,
    playing: function () { return tune ? tune.style : ''; },
    styles: Object.keys(STYLES),
    effects: Object.keys(SFX),
    setLevels: function (s, m) { levels.sfx = s; levels.mus = m; if (ctx) { sfxBus.gain.value = s; musBus.gain.value = m; } }
  };
})();
