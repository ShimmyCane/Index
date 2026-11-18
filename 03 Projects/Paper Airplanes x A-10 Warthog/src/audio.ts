// Sound made in the page with the Web Audio API. No sound files.
namespace PA {
  export class Sound {
    private ctx: AudioContext | null = null;
    private noise: AudioBuffer | null = null;
    private engine: OscillatorNode | null = null;
    private engineGain: GainNode | null = null;
    enabled = true;

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

      // The engine is one low sawtooth whose pitch follows the throttle.
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 60;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      this.engine = osc;
      this.engineGain = gain;
    }

    setThrottle(t: number, on: boolean): void {
      if (!this.ctx || !this.engine || !this.engineGain) return;
      const now = this.ctx.currentTime;
      this.engine.frequency.setTargetAtTime(55 + t * 70, now, 0.05);
      this.engineGain.gain.setTargetAtTime(on && this.enabled ? 0.03 + t * 0.03 : 0, now, 0.1);
    }

    play(name: SoundName): void {
      if (!this.ctx || !this.enabled) return;
      const ctx = this.ctx;
      const t = ctx.currentTime;
      switch (name) {
        case 'gun':
          this.burst(0.05, 0.12, 2400, t);
          break;
        case 'boom':
          this.burst(0.6, 0.35, 500, t);
          this.tone(90, 0.4, 0.2, t, 'sine', 40);
          break;
        case 'thud':
          this.tone(140, 0.12, 0.12, t, 'triangle', 80);
          break;
        case 'chime':
          this.tone(660, 0.25, 0.15, t, 'sine');
          this.tone(990, 0.35, 0.15, t + 0.12, 'sine');
          break;
        case 'land':
          this.tone(392, 0.2, 0.15, t, 'triangle');
          this.tone(523, 0.3, 0.15, t + 0.15, 'triangle');
          break;
        case 'crash':
          this.burst(0.9, 0.4, 300, t);
          this.tone(70, 0.6, 0.25, t, 'sawtooth', 30);
          break;
      }
    }

    private tone(freq: number, dur: number, vol: number, at: number, type: OscillatorType, slideTo?: number): void {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, at);
      if (slideTo !== undefined) osc.frequency.exponentialRampToValueAtTime(slideTo, at + dur);
      gain.gain.setValueAtTime(vol, at);
      gain.gain.exponentialRampToValueAtTime(0.001, at + dur);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(at);
      osc.stop(at + dur + 0.02);
    }

    private burst(dur: number, vol: number, cutoff: number, at: number): void {
      if (!this.ctx || !this.noise) return;
      const src = this.ctx.createBufferSource();
      src.buffer = this.noise;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = cutoff;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol, at);
      gain.gain.exponentialRampToValueAtTime(0.001, at + dur);
      src.connect(filter).connect(gain).connect(this.ctx.destination);
      src.start(at, Math.random() * 0.3, dur);
    }
  }
}
