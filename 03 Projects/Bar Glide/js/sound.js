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

  SOUNDS.tip = t => { [1319, 1568, 2093].forEach((f, i) => tone(f, t + i * 0.06, 0.1, 'triangle', 0.14)); };
  SOUNDS.show = t => { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, t + i * 0.07, 0.1, 'square', 0.09)); };
  SOUNDS.swap = t => { noise(t, 0.08, 0.12, 'bandpass', 900, 1600); };
  SOUNDS.jackpot = t => { [784, 988, 1175, 1568, 1175, 1568, 2093].forEach((f, i) => tone(f, t + i * 0.08, 0.14, 'square', 0.11)); };
  SOUNDS.splash = t => { noise(t, 0.6, 0.3, 'lowpass', 3000, 300); tone(300, t, 0.3, 'sine', 0.15, 120); };

  // ---- Music: a looping, upbeat honky-tonk tune (written here, 4 bars: C F G C). ----
  const NOTE = n => 440 * Math.pow(2, ({ C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 }[n[0]] + (+n.slice(1) - 4) * 12) / 12);
  const MELODY = ['E5 G5 C6 G5 E5 G5 A5 G5', 'F5 A5 C6 A5 F5 A5 C6 D6', 'D6 B5 G5 B5 D6 B5 A5 G5', 'E5 G5 C6 E6 D6 C6 G5 -']
    .join(' ').split(' ').map(n => n === '-' ? 0 : NOTE(n));
  const BASS = [['C3', 'G2'], ['F2', 'C3'], ['G2', 'D3'], ['C3', 'G2']];
  const STABS = [['E4', 'G4'], ['F4', 'A4'], ['D4', 'B4'], ['E4', 'G4']];
  let musicOn = true, musicWanted = false, tempo = 1, step = 0, nextTime = 0, timerId = null, lastBeatAt = 0;
  function schedule() {
    if (!ctx || ctx.state !== 'running') return;
    while (nextTime < ctx.currentTime + 0.12) {
      const bar = Math.floor(step / 8) % 4, i = step % 8, t = nextTime;
      if (MELODY[step % 32]) tone(MELODY[step % 32], t, 0.11, 'square', 0.045);
      if (i % 2 === 0) { tone(NOTE(BASS[bar][(i / 2) % 2]), t, 0.18, 'triangle', 0.16); if (i % 4 === 0) lastBeatAt = t; }
      else STABS[bar].forEach(n => tone(NOTE(n), t, 0.06, 'square', 0.022));
      noise(t, 0.03, i % 2 ? 0.05 : 0.025, 'highpass', 7000);
      step++;
      nextTime += 60 / (150 * tempo) / 2;
    }
  }
  function syncMusic() {
    const go = enabled && musicOn && musicWanted && ctx;
    if (go && !timerId) { nextTime = ctx.currentTime + 0.05; step = 0; timerId = setInterval(schedule, 25); }
    if (!go && timerId) { clearInterval(timerId); timerId = null; }
  }

  BG.sound = {
    unlock() { unlock(); syncMusic(); },
    setMusic(on) { musicOn = !!on; syncMusic(); },
    music(want, speed) { musicWanted = !!want; if (speed) tempo = speed; syncMusic(); },
    // 1 right on a beat, fading to 0 before the next: used to pulse the neon sign.
    pulse() { if (!timerId || !ctx) return 0; const d = ctx.currentTime - lastBeatAt; return d < 0 ? 0 : Math.max(0, 1 - d * 3 * tempo); },
    setEnabled(on) { enabled = !!on; syncMusic(); },
    play(name, arg) {
      if (!enabled || !ctx || ctx.state !== 'running' || !SOUNDS[name]) return;
      try { SOUNDS[name](ctx.currentTime + 0.01, arg || 0); } catch (e) { /* audio is optional */ }
    }
  };
})(window.BG);
