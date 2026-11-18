// Sound made in the page with the Web Audio API. No sound files.
// Four channels, each with its own slider: music (with the engine hum), guns,
// turns (the rush of a hard bank) and the incoming warning.
namespace PA {
  export interface Volumes {
    music: number;   // 0-1
    gun: number;
    turn: number;
    warn: number;
  }

  // A soft pentatonic melody, one note every half second, looping. Gentle on purpose.
  const MELODY = [392, 440, 523, 587, 523, 440, 392, 330, 392, 523, 659, 523, 440, 392, 330, 294];

  export class Sound {
    private ctx: AudioContext | null = null;
    private noise: AudioBuffer | null = null;
    private engine: OscillatorNode | null = null;
    private busMusic: GainNode | null = null;
    private busGun: GainNode | null = null;
    private busWarn: GainNode | null = null;
    private busTurn: GainNode | null = null;
    private turnGain: GainNode | null = null;
    private engineGain: GainNode | null = null;
    private musicTimer = 0;
    private noteAt = 0;
    private step = 0;
    enabled = true;
    private volumes: Volumes = { music: 0.3, gun: 0.35, turn: 0.3, warn: 0.7 };

    // Browsers need a tap before sound may start, so this runs on the first press.
    unlock(): void {
      if (this.ctx) {
        if (this.ctx.state === 'suspended') void this.ctx.resume();
        return;
      }
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      this.ctx = ctx;
      const len = Math.floor(ctx.sampleRate * 0.6);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.noise = buf;

      const out = ctx.destination;
      this.busMusic = ctx.createGain();
      this.busGun = ctx.createGain();
      this.busWarn = ctx.createGain();
      this.busTurn = ctx.createGain();
      this.busMusic.connect(out);
      this.busGun.connect(out);
      this.busWarn.connect(out);
      this.busTurn.connect(out);

      // The engine hum is part of the music channel: one low, soft sawtooth.
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 55;
      this.engineGain = ctx.createGain();
      this.engineGain.gain.value = 0;
      osc.connect(this.engineGain).connect(this.busMusic);
      osc.start();
      this.engine = osc;

      // The turn channel: a noise rush through a band-pass filter, opened by the turn.
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const band = ctx.createBiquadFilter();
      band.type = 'bandpass';
      band.frequency.value = 600;
      this.turnGain = ctx.createGain();
      this.turnGain.gain.value = 0;
      src.connect(band).connect(this.turnGain).connect(this.busTurn);
      src.start();

      this.applyVolumes();
      this.startMusic();
    }

    // Set each channel. 0-1 values; a channel at zero is silent.
    setVolumes(v: Volumes): void {
      this.volumes = v;
      this.applyVolumes();
    }

    // Pause the music and the engine while the settings are open.
    setPaused(paused: boolean): void {
      this.paused = paused;
      this.applyVolumes();
    }
    private paused = false;

    private applyVolumes(): void {
      if (!this.ctx) return;
      const on = this.enabled && !this.paused ? 1 : 0;
      const t = this.ctx.currentTime;
      const set = (node: GainNode | null, value: number) => {
        if (node) node.gain.setTargetAtTime(value, t, 0.05);
      };
      set(this.busMusic, on * this.volumes.music);
      set(this.busGun, this.enabled ? this.volumes.gun : 0);
      set(this.busWarn, this.enabled ? this.volumes.warn : 0);
      set(this.busTurn, this.enabled ? this.volumes.turn : 0);
    }

    // The engine and the turn rush follow the flight.
    setFlight(throttle: number, flying: boolean, turnAmount: number): void {
      if (!this.ctx || !this.engine || !this.engineGain || !this.turnGain) return;
      const now = this.ctx.currentTime;
      this.engine.frequency.setTargetAtTime(50 + throttle * 40, now, 0.1);
      this.engineGain.gain.setTargetAtTime(flying ? 0.05 + throttle * 0.03 : 0, now, 0.2);
      // A hard turn is a soft rush of air: quiet until the stick is pushed well over.
      const rush = flying ? Math.max(0, Math.min(1, (turnAmount - 0.35) / 0.65)) * 0.12 : 0;
      this.turnGain.gain.setTargetAtTime(rush, now, 0.15);
    }

    // The background tune: a few soft notes, scheduled ahead, repeating.
    private startMusic(): void {
      if (this.musicTimer) return;
      this.noteAt = this.ctx ? this.ctx.currentTime + 0.1 : 0;
      this.musicTimer = window.setInterval(() => this.scheduleMusic(), 200);
    }

    private scheduleMusic(): void {
      const ctx = this.ctx;
      if (!ctx || !this.busMusic) return;
      while (this.noteAt < ctx.currentTime + 0.6) {
        const f = MELODY[this.step % MELODY.length];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = f;
        gain.gain.setValueAtTime(0, this.noteAt);
        gain.gain.linearRampToValueAtTime(0.06, this.noteAt + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0005, this.noteAt + 0.45);
        osc.connect(gain).connect(this.busMusic);
        osc.start(this.noteAt);
        osc.stop(this.noteAt + 0.5);
        this.noteAt += 0.5;
        this.step++;
      }
    }

    play(name: SoundName): void {
      if (!this.ctx || !this.enabled) return;
      const t = this.ctx.currentTime;
      switch (name) {
        case 'gun':
          this.burst(0.04, 0.5, 1800, t, this.busGun!);
          break;
        case 'boom':
          this.burst(0.6, 0.5, 450, t, this.busGun!);
          this.tone(90, 0.4, 0.2, t, 'sine', 40, this.busGun!);
          break;
        case 'thud':
          this.tone(140, 0.12, 0.08, t, 'triangle', 80, this.busGun!);
          break;
        case 'warn':
          // Two soft beeps: an incoming shell.
          this.tone(880, 0.12, 0.25, t, 'sine', undefined, this.busWarn!);
          this.tone(880, 0.12, 0.25, t + 0.2, 'sine', undefined, this.busWarn!);
          break;
        case 'beep':
          // Beep, beep: the tag. Speed comes from the game, pitch rises a little.
          this.tone(1100, 0.07, 0.3, t, 'square', undefined, this.busWarn!);
          break;
        case 'lock':
          this.tone(1500, 0.04, 0.12, t, 'sine', undefined, this.busWarn!);
          break;
        case 'chaff':
          this.burst(0.35, 0.4, 3500, t, this.busGun!);
          break;
        case 'chime':
          this.tone(660, 0.25, 0.1, t, 'sine', undefined, this.busMusic!);
          this.tone(990, 0.35, 0.1, t + 0.12, 'sine', undefined, this.busMusic!);
          break;
        case 'land':
          this.tone(392, 0.2, 0.1, t, 'triangle', undefined, this.busMusic!);
          this.tone(523, 0.3, 0.1, t + 0.15, 'triangle', undefined, this.busMusic!);
          break;
        case 'crash':
          this.burst(0.9, 0.5, 300, t, this.busGun!);
          this.tone(70, 0.6, 0.2, t, 'sawtooth', 30, this.busGun!);
          break;
      }
    }

    private tone(freq: number, dur: number, vol: number, at: number, type: OscillatorType, slideTo: number | undefined, bus: GainNode): void {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, at);
      if (slideTo !== undefined) osc.frequency.exponentialRampToValueAtTime(slideTo, at + dur);
      gain.gain.setValueAtTime(vol, at);
      gain.gain.exponentialRampToValueAtTime(0.001, at + dur);
      osc.connect(gain).connect(bus);
      osc.start(at);
      osc.stop(at + dur + 0.02);
    }

    private burst(dur: number, vol: number, cutoff: number, at: number, bus: GainNode): void {
      if (!this.ctx || !this.noise) return;
      const src = this.ctx.createBufferSource();
      src.buffer = this.noise;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = cutoff;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol, at);
      gain.gain.exponentialRampToValueAtTime(0.001, at + dur);
      src.connect(filter).connect(gain).connect(bus);
      src.start(at, Math.random() * 0.3, dur);
    }
  }
}
