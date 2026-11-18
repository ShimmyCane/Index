// Game state and rules: guns, anti-aircraft shells, rings, crashes and free play.
namespace PA {
  export type Phase = 'flying' | 'crashed' | 'landed';
  export type SoundName = 'gun' | 'boom' | 'thud' | 'chime' | 'land' | 'crash';
  export type Control = 'drag' | 'stick';

  export interface Settings {
    mode: Mode;
    control: Control;
    sound: number;
    forces: number;
    showErrors: number;
  }

  // Held action buttons (fire, boost) and the steering axes from the drag, the joystick or the keys.
  export interface Held {
    fire: boolean;
    boost: boolean;
  }

  export interface Axes {
    yaw: number;      // -1 left … +1 right
    pitch: number;    // -1 down … +1 up
  }

  export interface Shot {
    X: number;
    Z: number;
    h: number;
    vX: number;
    vY: number;
    vZ: number;
    life: number;
  }

  export interface Puff {
    X: number;
    Z: number;
    h: number;
    vX: number;
    vY: number;
    vZ: number;
    life: number;
    max: number;
    color: string;
    size: number;
  }

  const SHOT_SPEED = 260;     // m/s, the gun, relative to the plane
  const FLAK_SPEED = 120;     // m/s
  const CRUISE_THROTTLE = 0.6;
  const BULLET_LIFE = 1.6;
  const SHELL_LIFE = 4;
  const RESPAWN_SECONDS = 2.5;
  const KEEP_AHEAD = 6;       // free play keeps this many targets in front of the plane

  export class Game {
    phase: Phase = 'flying';
    plane!: Aircraft;
    mission!: Mission;
    seed = 1;
    score = 0;
    kills = 0;
    hull = 100;
    hoopsPassed = 0;
    time = 0;
    fireCool = 0;
    respawnIn = 0;
    shots: Shot[] = [];
    shells: Shot[] = [];
    puffs: Puff[] = [];
    held: Held = { fire: false, boost: false };
    axes: Axes = { yaw: 0, pitch: 0 };
    onSound: (name: SoundName) => void = () => {};
    private rand = random(1);

    constructor(public settings: Settings) {
      this.newFlight(Math.floor(Math.random() * 100000));
    }

    newFlight(seed: number): void {
      this.seed = seed;
      this.mission = makeMission(this.settings.mode, seed);
      this.rand = random(seed + 7);
      this.plane = new Aircraft(this.settings.mode === 'jet');
      if (this.settings.mode === 'glider') {
        this.plane.start(0, 0, 90, 40, 0.08, 0, 0);
      } else {
        this.plane.start(0, 0, groundAt(0, 0) + 10, 60, 0.05, 0, CRUISE_THROTTLE);
      }
      this.phase = 'flying';
      this.score = 0;
      this.kills = 0;
      this.hull = 100;
      this.hoopsPassed = 0;
      this.time = 0;
      this.fireCool = 0;
      this.respawnIn = 0;
      this.shots = [];
      this.shells = [];
      this.puffs = [];
    }

    update(dtIn: number): void {
      const dt = Math.min(dtIn, 1 / 30);
      this.updatePuffs(dt);

      if (this.phase === 'crashed') {
        this.respawnIn -= dt;
        if (this.respawnIn <= 0) this.newFlight(this.seed + 1);
        return;
      }
      if (this.phase !== 'flying') return;

      this.time += dt;
      const jet = this.settings.mode === 'jet';
      const pilot: Pilot = {
        pitch: clamp(this.axes.pitch),
        yaw: clamp(this.axes.yaw),
        throttle: jet ? (this.held.boost ? 1 : CRUISE_THROTTLE) : 0,
      };
      const touched = this.plane.step(dt, pilot, groundAt);
      if (touched) {
        if (jet) {
          this.crash();
        } else {
          this.phase = 'landed';
          this.onSound('land');
        }
        return;
      }

      if (jet) {
        this.updateGuns(dt);
        this.updateShots(dt);
        this.updateShells(dt);
        this.updateFlak(dt);
        this.keepTargets();
        if (this.hull <= 0) this.crash();
      } else {
        this.checkRings();
      }
    }

    private crash(): void {
      this.phase = 'crashed';
      this.hull = 0;
      this.respawnIn = RESPAWN_SECONDS;
      this.explode(this.plane.X, this.plane.h, this.plane.Z, 26);
      this.onSound('crash');
    }

    // Free play: when the ground targets run low, more appear ahead of the plane.
    private keepTargets(): void {
      const m = this.mission;
      m.targets = m.targets.filter(t => t.alive || t.Z > this.plane.Z - 150);
      const left = m.targets.filter(t => t.alive && t.kind !== 'flak').length;
      if (left < KEEP_AHEAD) {
        m.targets.push(...spawnTargets(this.rand, this.plane.Z + 240, 6));
      }
    }

    private checkRings(): void {
      for (const ring of this.mission.hoops) {
        if (ring.passed) continue;
        const dx = this.plane.X - ring.X, dz = this.plane.Z - ring.Z, dh = this.plane.h - ring.h;
        if (dx * dx + dz * dz + dh * dh < ring.r * ring.r) {
          ring.passed = true;
          this.hoopsPassed++;
          this.score += 100;
          this.onSound('chime');
        }
      }
    }

    private updateGuns(dt: number): void {
      this.fireCool -= dt;
      if (!this.held.fire || this.fireCool > 0) return;
      this.fireCool = 0.09;
      const p = this.plane;
      const cosP = Math.cos(p.pitch), sinP = Math.sin(p.pitch);
      const sinY = Math.sin(p.yaw), cosY = Math.cos(p.yaw);
      const hv = p.vx; // forward speed, horizontal part of the plane's motion
      this.shots.push({
        X: p.X + sinY * cosP * 2,
        Z: p.Z + cosY * cosP * 2,
        h: p.h + sinP * 2,
        vX: hv * sinY + SHOT_SPEED * cosP * sinY,
        vZ: hv * cosY + SHOT_SPEED * cosP * cosY,
        vY: p.vy + SHOT_SPEED * sinP,
        life: BULLET_LIFE,
      });
      this.onSound('gun');
    }

    private updateShots(dt: number): void {
      const keep: Shot[] = [];
      for (const s of this.shots) {
        s.vY -= GRAVITY * dt;
        s.X += s.vX * dt;
        s.Z += s.vZ * dt;
        s.h += s.vY * dt;
        s.life -= dt;
        const ground = groundAt(s.X, s.Z);
        if (s.life <= 0 || s.h <= ground) {
          if (s.h <= ground) this.dust(s.X, ground, s.Z);
          continue;
        }
        let hit = false;
        for (const t of this.mission.targets) {
          if (!t.alive) continue;
          const size = SIZE[t.kind];
          const dx = s.X - t.X, dz = s.Z - t.Z;
          const tg = groundAt(t.X, t.Z);
          if (dx * dx + dz * dz < size.r * size.r && s.h >= tg && s.h <= tg + size.height) {
            t.alive = false;
            this.kills++;
            this.score += t.points;
            this.explode(t.X, tg + 1, t.Z, t.kind === 'flak' ? 10 : 16);
            this.onSound('boom');
            hit = true;
            break;
          }
        }
        if (!hit) keep.push(s);
      }
      this.shots = keep;
    }

    private updateFlak(dt: number): void {
      const p = this.plane;
      for (const t of this.mission.targets) {
        if (t.kind !== 'flak' || !t.alive) continue;
        t.cool -= dt;
        const dist = Math.hypot(p.X - t.X, p.Z - t.Z);
        if (t.cool > 0 || dist > 260 || p.h > 120) continue;
        t.cool = 1.6 + this.rand() * 1.2;
        // Aim where the plane will be, with gravity allowed for.
        const gy = groundAt(t.X, t.Z) + 2;
        const T = Math.max(0.4, Math.hypot(dist, p.h - gy) / FLAK_SPEED);
        const sinY = Math.sin(p.yaw), cosY = Math.cos(p.yaw);
        const aimX = p.X + p.vx * sinY * T;
        const aimZ = p.Z + p.vx * cosY * T;
        const aimY = p.h + p.vy * T;
        this.shells.push({
          X: t.X, Z: t.Z, h: gy,
          vX: (aimX - t.X) / T,
          vZ: (aimZ - t.Z) / T,
          vY: (aimY - gy) / T + 0.5 * GRAVITY * T,
          life: SHELL_LIFE,
        });
        this.onSound('thud');
      }
    }

    private updateShells(dt: number): void {
      const keep: Shot[] = [];
      const p = this.plane;
      for (const s of this.shells) {
        s.vY -= GRAVITY * dt;
        s.X += s.vX * dt;
        s.Z += s.vZ * dt;
        s.h += s.vY * dt;
        s.life -= dt;
        if (s.life <= 0 || s.h <= groundAt(s.X, s.Z)) continue;
        const dx = s.X - p.X, dz = s.Z - p.Z, dh = s.h - p.h;
        if (dx * dx + dz * dz + dh * dh < 9) {
          this.hull = Math.max(0, this.hull - 12);
          this.explode(s.X, s.h, s.Z, 6);
          this.onSound('thud');
          continue;
        }
        keep.push(s);
      }
      this.shells = keep;
    }

    private explode(X: number, h: number, Z: number, n: number): void {
      const colors = ['#ffb02e', '#ff9e8a', '#ffe08a', '#ffd9c7'];
      for (let i = 0; i < n; i++) {
        const a = this.rand() * Math.PI * 2;
        const sp = 8 + this.rand() * 26;
        this.puffs.push({
          X, h, Z,
          vX: Math.cos(a) * sp, vY: Math.sin(a) * sp * 0.6 + 6, vZ: Math.sin(a) * sp,
          life: 0.5 + this.rand() * 0.6, max: 1.1,
          color: colors[i % colors.length], size: 2 + this.rand() * 3,
        });
      }
    }

    private dust(X: number, h: number, Z: number): void {
      for (let i = 0; i < 4; i++) {
        this.puffs.push({
          X, h, Z,
          vX: (this.rand() - 0.5) * 10, vY: 4 + this.rand() * 4, vZ: (this.rand() - 0.5) * 10,
          life: 0.4, max: 0.4, color: '#e6e0c8', size: 2,
        });
      }
    }

    private updatePuffs(dt: number): void {
      for (const p of this.puffs) {
        p.vY -= GRAVITY * 0.5 * dt;
        p.X += p.vX * dt;
        p.Z += p.vZ * dt;
        p.h += p.vY * dt;
        p.life -= dt;
      }
      this.puffs = this.puffs.filter(p => p.life > 0);
    }
  }

  function clamp(v: number): number {
    return Math.max(-1, Math.min(1, v));
  }
}
