// Game state and rules: guns and their aim, limited ammo that recharges, missiles, enemy
// waves and allies, anti-aircraft fire, rings, the safe-flight floor, invincibility,
// damage marks, the blink and carry-on after a loss, and free play.
namespace PA {
  export type Phase = 'flying' | 'crashed' | 'landed';
  export type SoundName = 'gun' | 'boom' | 'thud' | 'chime' | 'land' | 'crash' | 'warn';
  export type Control = 'drag' | 'stick';
  export type View = 'chase' | 'top' | 'cockpit';

  export interface Settings {
    mode: Mode;
    control: Control;
    view: View;
    sound: number;        // 1 = sound on (kept for the old switch; the sliders below set each part)
    volMusic: number;     // 0-100
    volGun: number;
    volTurn: number;
    volWarn: number;
    forces: number;
    safeFlight: number;   // 1 = a floor above the ground: the plane levels out and pulls up
    invincible: number;   // 1 = hits do no harm (the damage still shows)
    autoReload: number;   // 1 = missiles come back over time
    enemyWave: number;    // enemy fighters per wave, one wave about every minute (0-6)
    allies: number;       // allied fighters that fly around (0-4)
    showErrors: number;
  }

  // Held action buttons (fire, boost, missile) and the steering axes from the drag, the joystick or the keys.
  export interface Held {
    fire: boolean;
    boost: boolean;
    missile: boolean;
  }

  export interface Axes {
    yaw: number;      // -1 left … +1 right
    pitch: number;    // -1 down … +1 up
  }

  // A homing missile. It turns toward its target at a limited rate.
  export interface Missile {
    X: number;
    Z: number;
    h: number;
    vX: number;
    vY: number;
    vZ: number;
    life: number;
    target: Target | null;
  }

  export interface Shot {
    X: number;
    Z: number;
    h: number;
    vX: number;
    vY: number;
    vZ: number;
    life: number;
    warn?: boolean;     // a shell from an enemy fighter (plays the warning)
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

  // A mark where the plane was hit: x and y in plane units (x across, y up from the centre).
  export interface Mark {
    x: number;
    y: number;
    age: number;
  }

  // The gun's aim: which way it points, and why (for the HUD).
  export interface Aim {
    yaw: number;
    pitch: number;        // radians; negative is down (the declination)
    mode: 'straight' | 'ground' | 'air';
  }

  export const MISSILE_MAX = 6;
  export const AMMO_MAX = 240;
  const AMMO_RECHARGE = 4;       // rounds per second, always coming back
  const SHOT_SPEED = 260;        // m/s, the gun, relative to the plane
  const CRUISE_THROTTLE = 0.6;
  const BULLET_LIFE = 1.6;
  const SHELL_LIFE = 4;
  const BLINK_SECONDS = 1.2;     // the blink after a loss, then the flight carries on
  const MISSILE_COOL = 1;        // seconds between missiles
  const MISSILE_RELOAD = 3;      // seconds for one missile to come back (auto reload)
  const MISSILE_SPEED = 180;     // m/s
  const MISSILE_TURN = 2.2;      // radians per second at most
  const MISSILE_RANGE = 900;     // metres
  const MISSILE_CONE = 0.45;     // radians either side of the nose to lock on
  const FLOOR = 30;              // safe flight: below this height above ground the plane pulls up
  const FLOOR_MIN = 8;           // safe flight: below this it must not sink any further
  const AIR_RANGE = 900;         // the gun aims straight at aircraft within this range
  const GROUND_RANGE = 700;      // the gun depresses toward ground targets within this range
  const WAVE_SECONDS = 60;       // enemy waves come about every minute
  const FIGHTER_SPEED = 120;     // m/s
  const FIGHTER_TURN = 0.7;      // radians per second
  const FIGHTER_FIRE_RANGE = 380;
  const SHELL_WARN_RANGE = 300;  // a shell this close sounds the warning
  const FRIEND_RESPAWN = 40;     // seconds before a lost ally is replaced
  const MARK_LIFE = 999;         // damage marks stay until the flight is restarted

  export class Game {
    phase: Phase = 'flying';
    paused = false;
    plane!: Aircraft;
    mission!: Mission;
    seed = 1;
    score = 0;
    kills = 0;
    hull = 100;
    hoopsPassed = 0;
    time = 0;
    fireCool = 0;
    blink = 0;
    ammo = AMMO_MAX;
    missileStock = MISSILE_MAX;
    missileCool = 0;
    reloadTimer = 0;
    waveTimer = 0;
    allyTimers: number[] = [];
    aim: Aim = { yaw: 0, pitch: 0, mode: 'straight' };
    floorActive = false;
    shots: Shot[] = [];
    shells: Shot[] = [];
    missiles: Missile[] = [];
    puffs: Puff[] = [];
    marks: Mark[] = [];
    warned = false;
    held: Held = { fire: false, boost: false, missile: false };
    axes: Axes = { yaw: 0, pitch: 0 };
    onSound: (name: SoundName) => void = () => {};
    private rand = random(1);

    constructor(public settings: Settings) {
      this.newFlight(Math.floor(Math.random() * 100000));
    }

    // A new flight: new targets, full health, full ammo and missiles. Score carries on when keepScore is set.
    newFlight(seed: number, keepScore = false): void {
      const score = this.score, kills = this.kills;
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
      this.score = keepScore ? score : 0;
      this.kills = keepScore ? kills : 0;
      this.hull = 100;
      this.hoopsPassed = 0;
      this.time = 0;
      this.fireCool = 0;
      this.blink = 0;
      this.ammo = AMMO_MAX;
      this.missileStock = MISSILE_MAX;
      this.missileCool = 0;
      this.reloadTimer = 0;
      this.waveTimer = 8;                        // the first wave comes soon after take-off
      this.allyTimers = [];
      for (let i = 0; i < this.settings.allies; i++) {
        this.mission.targets.push(spawnAir(this.rand, 0, 0, false));
      }
      this.shots = [];
      this.shells = [];
      this.missiles = [];
      this.puffs = [];
      this.marks = [];
    }

    update(dtIn: number): void {
      if (this.paused) return;
      const dt = Math.min(dtIn, 1 / 30);
      this.updatePuffs(dt);
      this.updateMarks(dt);
      this.blink = Math.max(0, this.blink - dt);

      if (this.phase === 'crashed') {
        // Blink once, then carry on in a new flight with full health and new conditions.
        if (this.blink <= 0) this.newFlight(this.seed + 1, true);
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
      this.floorActive = false;
      if (jet && this.settings.safeFlight === 1) this.applyFloor(pilot);

      const touched = this.plane.step(dt, pilot, groundAt);
      if (touched) {
        if (!jet) {
          this.phase = 'landed';
          this.onSound('land');
          return;
        }
        if (this.settings.invincible === 1) {
          // Invincible: the ground only bounces the plane back up.
          this.plane.h = groundAt(this.plane.X, this.plane.Z) + 4;
          this.plane.vy = Math.max(this.plane.vy, 6);
        } else {
          this.crash();
          return;
        }
      }

      if (jet) {
        this.updateReload(dt);
        this.updateWaves(dt);
        this.updateAir(dt);
        this.updateGuns(dt);
        this.updateMissiles(dt);
        this.updateShots(dt);
        this.updateShells(dt);
        this.updateGunners(dt);
        this.keepTargets();
        if (this.hull <= 0 && this.settings.invincible !== 1) this.crash();
      } else {
        this.checkRings();
      }
    }

    // Safe flight: a floor above the ground. Near it the plane levels out and pulls up;
    // very close, it cannot sink any further.
    private applyFloor(pilot: Pilot): void {
      const p = this.plane;
      const agl = p.h - groundAt(p.X, p.Z);
      if (agl < FLOOR && p.vy < 0) {
        this.floorActive = true;
        const strength = Math.min(1, (FLOOR - agl) / (FLOOR - FLOOR_MIN));
        pilot.pitch = Math.max(pilot.pitch, 0.35 + 0.65 * strength);
        if (agl < FLOOR_MIN) p.vy = Math.max(p.vy, 0);
      }
    }

    // A loss: the plane blinks once, then the flight carries on (see update).
    private crash(): void {
      this.phase = 'crashed';
      this.hull = 0;
      this.blink = BLINK_SECONDS;
      this.explode(this.plane.X, this.plane.h, this.plane.Z, 26);
      this.onSound('crash');
    }

    // Damage shows as a mark on the wing (and a puff of smoke) whether or not the hit counts.
    private addMark(): void {
      this.marks.push({
        x: (this.rand() < 0.5 ? -1 : 1) * (5 + this.rand() * 6),
        y: -1 + this.rand() * 2,
        age: 0,
      });
      if (this.marks.length > 12) this.marks.shift();
    }

    private updateMarks(dt: number): void {
      for (const m of this.marks) m.age += dt;
      this.marks = this.marks.filter(m => m.age < MARK_LIFE);
    }

    // The ammo comes back all the time, slowly; firing uses it faster than that.
    private updateReload(dt: number): void {
      this.ammo = Math.min(AMMO_MAX, this.ammo + AMMO_RECHARGE * dt);
      if (this.settings.autoReload !== 1 || this.missileStock >= MISSILE_MAX) {
        this.reloadTimer = 0;
        return;
      }
      this.reloadTimer += dt;
      if (this.reloadTimer >= MISSILE_RELOAD) {
        this.reloadTimer = 0;
        this.missileStock++;
      }
    }

    // A wave of enemy fighters about every minute, and a replacement for each lost ally.
    private updateWaves(dt: number): void {
      this.waveTimer -= dt;
      if (this.waveTimer <= 0) {
        this.waveTimer = WAVE_SECONDS;
        for (let i = 0; i < this.settings.enemyWave; i++) {
          this.mission.targets.push(spawnAir(this.rand, this.plane.X, this.plane.Z, true));
        }
      }
      // One replacement timer per missing ally (never more timers than the setting asks for).
      const allies = this.mission.targets.filter(t => t.faction === 'ally' && t.alive).length;
      if (allies + this.allyTimers.length < this.settings.allies) {
        this.allyTimers.push(FRIEND_RESPAWN);
      }
      this.allyTimers = this.allyTimers.map(t => t - dt).filter(t => {
        if (t > 0) return true;
        this.mission.targets.push(spawnAir(this.rand, this.plane.X, this.plane.Z, false));
        return false;
      });
    }

    // Moves the flying things: enemy fighters turn toward the plane and fire; allies orbit.
    private updateAir(dt: number): void {
      const p = this.plane;
      for (const t of this.mission.targets) {
        if (!t.alive) continue;
        t.age = (t.age || 0) + dt;
        if (t.faction === 'enemy') {
          const dx = p.X - t.X, dz = p.Z - t.Z;
          const want = Math.atan2(dx, dz);
          const cur = t.vH || 0;
          let diff = want - cur;
          while (diff > Math.PI) diff -= 2 * Math.PI;
          while (diff < -Math.PI) diff += 2 * Math.PI;
          const turn = Math.max(-FIGHTER_TURN * dt, Math.min(FIGHTER_TURN * dt, diff));
          t.vH = cur + turn;
          t.X += Math.sin(t.vH) * FIGHTER_SPEED * dt;
          t.Z += Math.cos(t.vH) * FIGHTER_SPEED * dt;
          t.h = (t.h ?? p.h) + (p.h + 10 - (t.h ?? p.h)) * Math.min(1, dt * 0.4);
          const gun = KINDS.fighter.gun!;
          t.cool -= dt;
          const dist = Math.hypot(dx, dz);
          if (t.cool <= 0 && dist < FIGHTER_FIRE_RANGE) {
            t.cool = gun.cool * (0.8 + this.rand() * 0.4);
            this.fireAt(t, gun.speed, true);
          }
          if (t.age > 150 || Math.hypot(t.X - p.X, t.Z - p.Z) > 3000) t.alive = false;
        } else if (t.faction === 'ally' && t.orbit) {
          const o = t.orbit;
          o.ang += o.w * dt;
          t.X = o.cx + Math.cos(o.ang) * o.r;
          t.Z = o.cz + Math.sin(o.ang) * o.r;
          t.h = 90;
        }
      }
    }

    // One shell from a ground gun or a fighter, aimed where the plane will be.
    private fireAt(t: Target, speed: number, warn: boolean): void {
      const p = this.plane;
      const gy = altOf(t) + 2;
      const dist = Math.hypot(p.X - t.X, p.Z - t.Z);
      const T = Math.max(0.4, Math.hypot(dist, p.h - gy) / speed);
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
        warn,
      });
      this.onSound('thud');
    }

    // Missiles lock on to any enemy or ground target in front. Allies are never locked.
    private findLock(): Target | null {
      const p = this.plane;
      const sinY = Math.sin(p.yaw), cosY = Math.cos(p.yaw);
      let best: Target | null = null;
      let bestD = MISSILE_RANGE;
      for (const t of this.mission.targets) {
        if (!t.alive || t.faction === 'ally') continue;
        const dx = t.X - p.X, dz = t.Z - p.Z;
        const d = Math.hypot(dx, dz);
        if (d > bestD || d < 1) continue;
        const ahead = (dx * sinY + dz * cosY) / d;
        const side = Math.acos(Math.max(-1, Math.min(1, ahead)));
        if (ahead > 0 && side < MISSILE_CONE) {
          best = t;
          bestD = d;
        }
      }
      return best;
    }

    private updateMissiles(dt: number): void {
      this.missileCool -= dt;
      const p = this.plane;
      if (this.held.missile && this.missileCool <= 0 && this.missileStock > 0) {
        const target = this.findLock();
        if (target) {
          this.missileCool = MISSILE_COOL;
          this.missileStock--;
          const sinY = Math.sin(p.yaw), cosY = Math.cos(p.yaw);
          this.missiles.push({
            X: p.X + sinY * 3, Z: p.Z + cosY * 3, h: p.h,
            vX: p.vx * sinY + MISSILE_SPEED * sinY, vZ: p.vx * cosY + MISSILE_SPEED * cosY, vY: p.vy,
            life: 6, target,
          });
          this.onSound('gun');
        }
      }
      const keep: Missile[] = [];
      for (const m of this.missiles) {
        m.life -= dt;
        const target = m.target;
        if (target && target.alive) {
          const tg = altOf(target) + 1;
          const dx = target.X - m.X, dy = tg - m.h, dz = target.Z - m.Z;
          const d = Math.hypot(dx, dy, dz) || 1;
          const sp = Math.hypot(m.vX, m.vY, m.vZ) || MISSILE_SPEED;
          const want = [dx / d * sp, dy / d * sp, dz / d * sp];
          const cur = [m.vX, m.vY, m.vZ];
          const step = MISSILE_TURN * dt * sp;
          const diff = [want[0] - cur[0], want[1] - cur[1], want[2] - cur[2]];
          const dl = Math.hypot(diff[0], diff[1], diff[2]) || 1;
          const k = Math.min(1, step / dl);
          m.vX = cur[0] + diff[0] * k;
          m.vY = cur[1] + diff[1] * k;
          m.vZ = cur[2] + diff[2] * k;
        }
        m.X += m.vX * dt;
        m.Z += m.vZ * dt;
        m.h += m.vY * dt;
        if (target && target.alive) {
          const info = KINDS[target.kind];
          const tg = altOf(target);
          const dx = m.X - target.X, dz = m.Z - target.Z;
          if (dx * dx + dz * dz < info.r * info.r * 2.2 && m.h <= tg + info.height + 2 && m.h >= tg - 1) {
            this.hitTarget(target, 2, tg);
            continue;
          }
        }
        if (m.life <= 0 || m.h <= groundAt(m.X, m.Z)) {
          if (m.h <= groundAt(m.X, m.Z)) this.explode(m.X, m.h, m.Z, 8);
          continue;
        }
        keep.push(m);
      }
      this.missiles = keep;
    }

    // The gun aims straight when there are aircraft about, and points down toward a
    // ground target (with a declination for the bullet's drop) when one is in front.
    private computeAim(): Aim {
      const p = this.plane;
      const sinY = Math.sin(p.yaw), cosY = Math.cos(p.yaw);
      let airborne = false;
      let best: Target | null = null;
      let bestD = GROUND_RANGE;
      for (const t of this.mission.targets) {
        if (!t.alive) continue;
        const dx = t.X - p.X, dz = t.Z - p.Z;
        const d = Math.hypot(dx, dz);
        if (d < 1 || (dx * sinY + dz * cosY) <= 0) continue;
        if (t.h !== undefined && d < AIR_RANGE) airborne = true;
        if (t.kind === 'jet' && d < AIR_RANGE) airborne = true;
        if (t.h === undefined && t.kind !== 'jet' && d < bestD) {
          best = t;
          bestD = d;
        }
      }
      if (airborne || !best) return { yaw: p.yaw, pitch: 0, mode: airborne ? 'air' : 'straight' };
      const tg = altOf(best) + 1;
      const dh = tg - p.h;
      const dd = Math.hypot(best.X - p.X, best.Z - p.Z);
      const flight = dd / SHOT_SPEED;
      const drop = 0.5 * GRAVITY * flight * flight;
      const pitch = Math.atan2(dh + drop, dd);
      return { yaw: Math.atan2(best.X - p.X, best.Z - p.Z), pitch, mode: 'ground' };
    }

    private updateGuns(dt: number): void {
      this.fireCool -= dt;
      this.aim = this.computeAim();
      if (!this.held.fire || this.fireCool > 0 || this.ammo < 1) return;
      this.fireCool = 0.09;
      this.ammo -= 1;
      const p = this.plane;
      const cosP = Math.cos(this.aim.pitch), sinP = Math.sin(this.aim.pitch);
      const sinY = Math.sin(this.aim.yaw), cosY = Math.cos(this.aim.yaw);
      this.shots.push({
        X: p.X + sinY * cosP * 2,
        Z: p.Z + cosY * cosP * 2,
        h: p.h + sinP * 2,
        vX: p.vx * sinY + SHOT_SPEED * cosP * sinY,
        vZ: p.vx * cosY + SHOT_SPEED * cosP * cosY,
        vY: p.vy + SHOT_SPEED * sinP,
        life: BULLET_LIFE,
      });
      this.onSound('gun');
    }

    private hitTarget(t: Target, damage: number, tg: number): void {
      if (t.faction === 'ally') {
        // Hitting an ally costs points; the ally is replaced later.
        t.alive = false;
        this.score += t.points;
        this.explode(t.X, tg + 1, t.Z, 14);
        this.onSound('boom');
        return;
      }
      t.hp -= damage;
      if (t.hp > 0) {
        this.explode(t.X, tg + 1, t.Z, 4);
        this.onSound('thud');
        return;
      }
      t.alive = false;
      this.kills++;
      this.score += t.points;
      this.explode(t.X, tg + 1, t.Z, KINDS[t.kind].height > 5 ? 26 : 16);
      this.onSound('boom');
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
          const info = KINDS[t.kind];
          const dx = s.X - t.X, dz = s.Z - t.Z;
          const tg = altOf(t);
          if (dx * dx + dz * dz < info.r * info.r && s.h >= tg && s.h <= tg + info.height) {
            this.hitTarget(t, 1, tg);
            hit = true;
            break;
          }
        }
        if (!hit) keep.push(s);
      }
      this.shots = keep;
    }

    // Anti-aircraft guns and SAM sites: each one aims at where the plane will be.
    private updateGunners(dt: number): void {
      const p = this.plane;
      for (const t of this.mission.targets) {
        const gun = KINDS[t.kind].gun;
        if (!gun || !t.alive || t.faction === 'enemy') continue;
        t.cool -= dt;
        const dist = Math.hypot(p.X - t.X, p.Z - t.Z);
        if (t.cool > 0 || dist > gun.range || p.h > gun.range * 0.5) continue;
        t.cool = gun.cool * (0.7 + this.rand() * 0.6);
        this.fireAt(t, gun.speed, false);
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
        const d = Math.hypot(dx, dz, dh);
        if (s.warn && d < SHELL_WARN_RANGE && !this.warned) {
          this.warned = true;
          this.onSound('warn');
        }
        if (d * d < 9) {
          // A hit: the damage shows; it only costs hull when not invincible.
          this.addMark();
          this.explode(s.X, s.h, s.Z, 6);
          if (this.settings.invincible !== 1) this.hull = Math.max(0, this.hull - 12);
          this.onSound('thud');
          continue;
        }
        keep.push(s);
      }
      this.shells = keep;
      if (!this.shells.some(s => s.warn)) this.warned = false;
    }

    // Free play: when the ground targets run low, more appear ahead of the plane.
    private keepTargets(): void {
      const m = this.mission;
      m.targets = m.targets.filter(t => (t.alive || t.Z > this.plane.Z - 150) && !(t.faction === 'enemy' && !t.alive));
      // Vehicles on the road drive; those that are left behind are removed.
      for (const t of m.targets) {
        if (t.vZ !== undefined && t.alive) t.Z += t.vZ * (1 / 30);
      }
      const left = m.targets.filter(t => t.alive && t.faction === undefined).length;
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

  const KEEP_AHEAD = 6;          // free play keeps this many ground targets in front of the plane

  function clamp(v: number): number {
    return Math.max(-1, Math.min(1, v));
  }
}
