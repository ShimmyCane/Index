// Game state and rules: guns, flak, hoops, crashes and the mission end.
namespace PA {
  export type Phase = 'flying' | 'crashed' | 'landed' | 'won';
  export type SoundName = 'gun' | 'boom' | 'thud' | 'chime' | 'land' | 'win' | 'crash';

  export interface Settings {
    mode: Mode;
    size: Size;
    sound: number;
    forces: number;
    showErrors: number;
  }

  export interface Shot {
    x: number;
    h: number;
    vx: number;
    vy: number;
    life: number;
  }

  export interface Puff {
    x: number;
    h: number;
    vx: number;
    vy: number;
    life: number;
    max: number;
    color: string;
    size: number;
  }

  export interface Held {
    up: boolean;
    down: boolean;
    more: boolean;
    less: boolean;
    fire: boolean;
  }

  const SHOT_SPEED = 260;   // m/s, the gun, relative to the plane
  const FLAK_SPEED = 120;   // m/s
  const BULLET_LIFE = 1.6;
  const SHELL_LIFE = 4;

  export class Game {
    phase: Phase = 'flying';
    plane!: Aircraft;
    mission!: Mission;
    camX = 0;
    score = 0;
    kills = 0;
    ammo = 0;
    hull = 100;
    hoopsPassed = 0;
    time = 0;
    stars = 0;
    fireCool = 0;
    shots: Shot[] = [];
    shells: Shot[] = [];
    puffs: Puff[] = [];
    held: Held = { up: false, down: false, more: false, less: false, fire: false };
    onSound: (name: SoundName) => void = () => {};
    private rand = random(1);

    constructor(public settings: Settings) {
      this.newMission(Math.floor(Math.random() * 100000));
    }

    newMission(seed: number): void {
      this.mission = makeMission(this.settings.mode, this.settings.size, seed);
      const m = this.mission;
      this.plane = new Aircraft(m.mode === 'jet');
      this.plane.start(m.startX, m.startH, m.startSpeed, m.startPitch, m.startThrottle);
      this.phase = 'flying';
      this.camX = 0;
      this.score = 0;
      this.kills = 0;
      this.ammo = m.ammo;
      this.hull = 100;
      this.hoopsPassed = 0;
      this.time = 0;
      this.stars = 0;
      this.fireCool = 0;
      this.shots = [];
      this.shells = [];
      this.puffs = [];
      this.rand = random(seed + 7);
      this.snapCamera();
    }

    snapCamera(): void {
      this.camX = this.plane.x - (W * PLANE_X) / PPM_X;
    }

    targetsLeft(): number {
      return this.mission.targets.filter(t => t.alive).length;
    }

    update(dtIn: number): void {
      const dt = Math.min(dtIn, 1 / 30);
      this.updatePuffs(dt);
      if (this.phase !== 'flying') return;

      this.time += dt;
      const pilot: Pilot = {
        pitch: (this.held.up ? 1 : 0) - (this.held.down ? 1 : 0),
        throttle: this.mission.mode === 'jet' ? (this.held.more ? 1 : 0) - (this.held.less ? 1 : 0) : 0,
      };
      const touched = this.plane.step(dt, pilot, groundAt);
      this.camX += ((this.plane.x - (W * PLANE_X) / PPM_X) - this.camX) * Math.min(1, dt * 8);

      if (touched) {
        if (this.mission.mode === 'paper') {
          this.landed();
        } else {
          this.crash();
        }
        return;
      }

      this.checkHoops();
      if (this.mission.mode === 'jet') {
        this.updateGuns(dt);
        this.updateShots(dt);
        this.updateShells(dt);
        this.updateFlak(dt);
        if (this.hull <= 0) {
          this.crash();
          return;
        }
        if (this.targetsLeft() === 0) {
          this.finish();
        }
      }
    }

    private crash(): void {
      this.phase = 'crashed';
      this.hull = 0;
      this.explode(this.plane.x, this.plane.h, 26);
      this.onSound('crash');
    }

    private landed(): void {
      this.phase = 'landed';
      this.onSound('land');
    }

    private finish(): void {
      this.phase = 'won';
      this.stars = this.hull >= 70 ? 3 : this.hull >= 40 ? 2 : 1;
      this.onSound('win');
    }

    private checkHoops(): void {
      if (this.mission.mode !== 'paper') return;
      for (const hoop of this.mission.hoops) {
        if (hoop.passed) continue;
        if (Math.abs(this.plane.x - hoop.x) < 1.2 && Math.abs(this.plane.h - hoop.h) <= hoop.r) {
          hoop.passed = true;
          this.hoopsPassed++;
          this.score += 100;
          this.onSound('chime');
        }
      }
    }

    private updateGuns(dt: number): void {
      this.fireCool -= dt;
      if (this.held.fire && this.ammo > 0 && this.fireCool <= 0) {
        this.fireCool = 0.09;
        this.ammo--;
        const p = this.plane;
        const dx = Math.cos(p.pitch), dy = Math.sin(p.pitch);
        this.shots.push({
          x: p.x + dx * 2,
          h: p.h + dy * 2,
          vx: p.vx + dx * SHOT_SPEED,
          vy: p.vy + dy * SHOT_SPEED,
          life: BULLET_LIFE,
        });
        this.onSound('gun');
      }
    }

    private updateShots(dt: number): void {
      const keep: Shot[] = [];
      for (const s of this.shots) {
        s.vy -= GRAVITY * dt;
        s.x += s.vx * dt;
        s.h += s.vy * dt;
        s.life -= dt;
        if (s.life <= 0 || s.h <= groundAt(s.x)) {
          if (s.h <= groundAt(s.x)) this.dust(s.x, groundAt(s.x));
          continue;
        }
        let hit = false;
        for (const t of this.mission.targets) {
          if (!t.alive) continue;
          const half = t.kind === 'truck' ? 1.6 : 2.2;
          const scale = t.far ? 0.5 : 1;
          const top = groundAt(t.x) + (t.kind === 'truck' ? 2 : 2.5) * scale;
          if (Math.abs(s.x - t.x) < half * scale && s.h >= groundAt(t.x) && s.h <= top) {
            t.hp--;
            hit = true;
            if (t.hp <= 0) this.destroy(t);
            else this.onSound('thud');
            break;
          }
        }
        if (!hit) keep.push(s);
      }
      this.shots = keep;
    }

    private destroy(t: Target): void {
      t.alive = false;
      this.kills++;
      this.score += t.points;
      this.explode(t.x, groundAt(t.x) + 1, t.kind === 'flak' ? 10 : 16);
      this.onSound('boom');
    }

    private updateFlak(dt: number): void {
      for (const t of this.mission.targets) {
        if (t.kind !== 'flak' || !t.alive) continue;
        t.cool -= dt;
        const dist = Math.abs(this.plane.x - t.x);
        if (t.cool <= 0 && dist < 220 && this.plane.h < 90) {
          t.cool = 1.6 + this.rand() * 1.2;
          const gx = t.x, gy = groundAt(t.x) + 2;
          const T = Math.max(0.3, Math.hypot(this.plane.x - gx, this.plane.h - gy) / FLAK_SPEED);
          const aimX = this.plane.x + this.plane.vx * T;
          const aimY = this.plane.h + this.plane.vy * T;
          const dx = aimX - gx, dy = aimY - gy;
          const d = Math.hypot(dx, dy) || 1;
          this.shells.push({
            x: gx, h: gy,
            vx: (dx / d) * FLAK_SPEED,
            vy: (dy / d) * FLAK_SPEED + 0.5 * GRAVITY * T,
            life: SHELL_LIFE,
          });
          this.onSound('thud');
        }
      }
    }

    private updateShells(dt: number): void {
      const keep: Shot[] = [];
      for (const s of this.shells) {
        s.vy -= GRAVITY * dt;
        s.x += s.vx * dt;
        s.h += s.vy * dt;
        s.life -= dt;
        if (s.life <= 0 || s.h <= groundAt(s.x)) continue;
        if (Math.abs(s.x - this.plane.x) < 2.2 && Math.abs(s.h - this.plane.h) < 1.8) {
          this.hull = Math.max(0, this.hull - 12);
          this.explode(s.x, s.h, 6);
          this.onSound('thud');
          continue;
        }
        keep.push(s);
      }
      this.shells = keep;
    }

    private explode(x: number, h: number, n: number): void {
      const colors = ['#ffb02e', '#ff9e8a', '#ffe08a', '#ffd9c7'];
      for (let i = 0; i < n; i++) {
        const a = this.rand() * Math.PI * 2;
        const sp = 8 + this.rand() * 26;
        this.puffs.push({
          x, h, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.6 + 6,
          life: 0.5 + this.rand() * 0.6, max: 1.1,
          color: colors[i % colors.length], size: 2 + this.rand() * 3,
        });
      }
    }

    private dust(x: number, h: number): void {
      for (let i = 0; i < 4; i++) {
        this.puffs.push({
          x, h, vx: (this.rand() - 0.5) * 10, vy: 4 + this.rand() * 4,
          life: 0.4, max: 0.4, color: '#e6e0c8', size: 2,
        });
      }
    }

    private updatePuffs(dt: number): void {
      for (const p of this.puffs) {
        p.vy -= GRAVITY * 0.5 * dt;
        p.x += p.vx * dt;
        p.h += p.vy * dt;
        p.life -= dt;
      }
      this.puffs = this.puffs.filter(p => p.life > 0);
    }
  }
}
