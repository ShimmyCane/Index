/* Bar Glide — every sound is made with the Web Audio API (no sound files to fail).
 * BG.sound.unlock() must run inside a tap; after that, call BG.sound.play('name'). */
window.BG = window.BG || {};
(function (BG) {
  'use strict';
  let ctx = null, master = null, noiseBuf = null;
  let enabled = true;

  function unlock() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.35;
      master.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
  }

  function tone(freq, start, dur, type, vol, slideTo) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, start);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
    g.gain.setValueAtTime(vol || 0.2, start);
    g.gain.exponentialRampToValueAtTime(0.001, start + dur);
    o.connect(g); g.connect(master);
    o.start(start); o.stop(start + dur + 0.02);
  }
  function noise(start, dur, vol, filterType, freq, freqTo) {
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noiseBuf;
    f.type = filterType || 'lowpass';
    f.frequency.setValueAtTime(freq || 1200, start);
    if (freqTo) f.frequency.exponentialRampToValueAtTime(freqTo, start + dur);
    g.gain.setValueAtTime(vol || 0.2, start);
    g.gain.exponentialRampToValueAtTime(0.001, start + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(start, Math.random() * 0.5); src.stop(start + dur + 0.02);
  }

  const SOUNDS = {
    pour(t, level) { tone(260 + level * 420, t, 0.06, 'sine', 0.12, 200 + level * 380); },
    slide(t) { noise(t, 0.45, 0.18, 'bandpass', 2400, 500); },
    catch(t) { tone(1760, t, 0.08, 'triangle', 0.18); tone(2640, t + 0.04, 0.1, 'triangle', 0.1); },
    serve(t) { tone(523, t, 0.08, 'square', 0.1); tone(784, t + 0.07, 0.12, 'square', 0.1); },
    gulp(t) { tone(220, t, 0.12, 'sine', 0.2, 110); tone(200, t + 0.16, 0.12, 'sine', 0.18, 100); },
    break(t) {
      noise(t, 0.35, 0.35, 'highpass', 3000);
      for (let i = 0; i < 6; i++) tone(2000 + Math.random() * 2500, t + i * 0.035, 0.08, 'triangle', 0.08);
    },
    uhoh(t) { tone(440, t, 0.18, 'square', 0.14); tone(330, t + 0.22, 0.32, 'square', 0.14, 300); },
    hey(t) { tone(300, t, 0.12, 'sawtooth', 0.12, 380); },
    whap(t) { noise(t, 0.12, 0.5, 'lowpass', 1800, 300); tone(140, t, 0.1, 'sine', 0.3, 60); },
    sob(t) { tone(700, t, 0.25, 'sine', 0.08, 500); tone(650, t + 0.3, 0.3, 'sine', 0.08, 450); },
    stomp(t) { tone(90, t, 0.1, 'sine', 0.3, 50); },
    clear(t) { [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.09, 0.16, 'square', 0.1)); },
    start(t) {
      // A short honky-tonk walk-in tune.
      const notes = [392, 494, 587, 659, 587, 494, 523, 659, 784];
      notes.forEach((f, i) => tone(f, t + i * 0.11, 0.12, 'square', 0.08));
      [196, 247, 262].forEach((f, i) => tone(f, t + i * 0.33, 0.3, 'triangle', 0.12));
    },
    over(t) { [392, 370, 349, 330].forEach((f, i) => tone(f, t + i * 0.25, 0.28, 'square', 0.1)); }
  };

  BG.sound = {
    unlock,
    setEnabled(on) { enabled = !!on; },
    play(name, arg) {
      if (!enabled || !ctx || ctx.state !== 'running' || !SOUNDS[name]) return;
      try { SOUNDS[name](ctx.currentTime + 0.01, arg || 0); } catch (e) { /* audio is optional */ }
    }
  };
})(window.BG);
