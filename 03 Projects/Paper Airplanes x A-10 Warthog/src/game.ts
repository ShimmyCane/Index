// Game state and rules. Two modes: "normal" (limited ammo and missiles, three hits and the
// plane is down, mission objectives restock it) and "felix" (easy: never goes down, unlimited
// supplies). Targeting takes a moment to lock. Enemy fighters fire homing missiles; a tag
// warns of them, and a tight turn or chaff can break them off.
namespace PA {
  export type Phase = 'flying' | 'crashed' | 'landed';
  export type SoundName = 'gun' | 'boom' | 'thud' | 'chime' | 'land' | 'crash' | 'warn' | 'beep' | 'chaff' | 'lock';
  export type Control = 'drag' | 'stick';
  export type View = 'chase' | 'top' | 'cockpit';
  export type Difficulty = 'normal' | 'felix';

  export interface Settings {
    mode: Mode;
    control: Control;
    view: View;
    difficulty: Difficulty;
    sound: number;
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

  export interface Held {
    fire: boolean;
    boost: boolean;
    missile: boolean;
  }

  export interface Axes {
    yaw: number;      // -1 left … +1 right
    pitch: number;    // -1 down … +1 up
  }

  // A homing missile. The player's ones home on a target; an enemy's on the plane (or a chaff decoy).
  export interface Missile {
    X: number;
    Z: number;
    h: number;
    vX: number;
    vY: number;
    vZ: number;
    life: number;
    target: Target | null;   // the player's: a ground or air target
    enemy?: boolean;         // the enemy's: aims at the plane or a decoy
    broken?: boolean;        // the lock was broken: it flies on and dies
  }

  export interface Shot {
    X: number;
    Z: number;
    h: number;
    vX: number;
    vY: number;
    vZ: number;
    life: number;
    warn?: boolean;
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

  // Chaff: a decoy that draws missiles away from the plane for a few seconds.
  export interface Decoy {
    X: number;
    Z: number;
    h: number;
    vX: number;
    vY: number;
    vZ: number;
    life: number;
  }

  export interface Aim {
    yaw: number;
    pitch: number;
    mode: 'straight' | 'ground' | 'air';
    dir: [number, number, number];   // the unit direction the gun fires in
  }

  // The player's lock: the target and how far the lock has got (0 to 1).
  export interface Lock {
    target: Target | null;
    progress: number;
  }

  export const MISSILE_MAX = 6;
  export const AMMO_MAX = 240;
  export const CHAFF_MAX = 4;
  export const HITS_TO_DOWN = 3;         // normal mode: three hits and the plane is down
  const HIT_DAMAGE = 100 / HITS_TO_DOWN; // each hit takes a third of the hull
  const AMMO_RECHARGE = 4;               // rounds per second, always coming back
  const RESUPPLY_COOL = 45;              // seconds between reloads from ⚙️
  const SHOT_SPEED = 260;
  const CRUISE_THROTTLE = 0.6;
  const BULLET_LIFE = 1.6;
  const SHELL_LIFE = 4;
  const BLINK_SECONDS = 1.2;
  const MISSILE_COOL = 1;
  const MISSILE_RELOAD = 3;
  const MISSILE_SPEED = 180;
  const MISSILE_TURN = 2.2;
  const MISSILE_RANGE = 900;
  const MISSILE_CONE = 0.45;
  const LOCK_TIME = 1.2;                 // seconds of steady aim before a missile locks
  const ENEMY_MISSILE_SPEED = 170;
  const ENEMY_MISSILE_TURN = 2.5;
  const ENEMY_MISSILE_RANGE = 1000;
  const ENEMY_MISSILE_COOL = 7;
  const BREAK_TURN = 0.6;                // a yaw this hard, held this long, breaks the enemy's lock
  const BREAK_TIME = 0.6;
  const CHAFF_LIFE = 4;
  const CHAFF_DECOY_RANGE = 320;
  const FLOOR = 30;
  const FLOOR_MIN = 8;
  const AIR_RANGE = 900;
  const GROUND_RANGE = 700;
  const WAVE_SECONDS = 60;
  const FIGHTER_SPEED = 120;
  const FIGHTER_TURN = 0.7;
  const FIGHTER_FIRE_RANGE = 380;
  const SHELL_WARN_RANGE = 300;
  const FRIEND_RESPAWN = 40;
  const WISP_LIFE = 1.4;
  const KEEP_AHEAD = 6;
  const OBJECTIVE_GROUND = [4, 5, 6];    // ground targets to destroy for a mission (cycles)

  export class Game {
    phase: Phase = 'flying';
    paused = false;
    plane!: Aircraft;
    mission!: Mission;
    seed = 1;
    score = 0;
    kills = 0;
    hull = 100;
    hits = 0;
    hoopsPassed = 0;
    time = 0;
    fireCool = 0;
    blink = 0;
    ammo = AMMO_MAX;
    missileStock = MISSILE_MAX;
    missileCool = 0;
    reloadTimer = 0;
    chaff = CHAFF_MAX;
    resupplyCool = 0;
    waveTimer = 0;
    enemyMissileCool = 0;
    allyTimers: number[] = [];
    aim: Aim = { yaw: 0, pitch: 0, mode: 'straight', dir: [0, 0, 1] };
    lock: Lock = { target: null, progress: 0 };
    tagged = false;            // an enemy missile is after the plane
    tagDist = 0;              // its distance, metres
    breakTimer = 0;
    beepTimer = 0;
    objectiveGoal = 0;
    objectiveDone = 0;
    missionNumber = 1;
    resupplied = 0;            // seconds left of the "resupplied" banner
    missionCard = 0;           // seconds left of the mission pop-up card
    floorActive = false;
    shots: Shot[] = [];
    shells: Shot[] = [];
    missiles: Missile[] = [];
    decoys: Decoy[] = [];
    puffs: Puff[] = [];
    marks: Mark[] = [];
    wisps: Puff[] = [];
    warned = false;
    held: Held = { fire: false, boost: false, missile: false };
    axes: Axes = { yaw: 0, pitch: 0 };
    onSound: (name: SoundName) => void = () => {};
    private rand = random(1);

    constructor(public settings: Settings) {
      this.newFlight(Math.floor(Math.random() * 100000));
    }

    get felix(): boolean {
      return this.settings.difficulty === 'felix';
    }

    // A new flight or mission: new targets, full health; supplies are kept (or refilled).
    newFlight(seed: number, keepScore = false, refill = true): void {
      const score = this.score, kills = this.kills;
      const ammo = this.ammo, missiles = this.missileStock, chaff = this.chaff;
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
      this.hits = 0;
      this.hoopsPassed = 0;
      this.time = 0;
      this.fireCool = 0;
      this.blink = 0;
      this.ammo = refill || this.felix ? AMMO_MAX : ammo;
      this.missileStock = refill || this.felix ? MISSILE_MAX : missiles;
      this.chaff = refill || this.felix ? CHAFF_MAX : chaff;
      this.missileCool = 0;
      this.reloadTimer = 0;
      this.waveTimer = 8;
      this.enemyMissileCool = 6;
      this.allyTimers = [];
      this.lock = { target: null, progress: 0 };
      this.tagged = false;
      this.breakTimer = 0;
      this.objectiveGoal = OBJECTIVE_GROUND[(this.missionNumber - 1) % OBJECTIVE_GROUND.length];
      this.objectiveDone = 0;
      this.missionCard = this.settings.mode === 'jet' ? 5 : 0;
      for (let i = 0; i < this.settings.allies; i++) {
        this.mission.targets.push(spawnAir(this.rand, 0, 0, false));
      }
      this.shots = [];
      this.shells = [];
      this.missiles = [];
      this.decoys = [];
      this.puffs = [];
      this.marks = [];
      this.wisps = [];
    }

    // A reload from ⚙️ (normal mode only): the gun and missiles come back, with a cooldown.
    reloadFromSettings(): boolean {
      if (this.felix || this.resupplyCool > 0) return false;
      this.ammo = AMMO_MAX;
      this.missileStock = Math.min(MISSILE_MAX, this.missileStock + 2);
      this.resupplyCool = RESUPPLY_COOL;
      this.onSound('chime');
      return true;
    }

    fireChaff(): void {
      if (this.phase !== 'flying' || this.settings.mode !== 'jet') return;
      if (!this.felix && this.chaff < 1) return;
      if (!this.felix) this.chaff--;
      const p = this.plane;
      for (let i = 0; i < 2; i++) {
        this.decoys.push({
          X: p.X - Math.sin(p.yaw) * 6 + (i ? 3 : -3), Z: p.Z - Math.cos(p.yaw) * 6, h: p.h,
          vX: p.vx * Math.sin(p.yaw) * 0.5, vY: -3, vZ: p.vx * Math.cos(p.yaw) * 0.5, life: CHAFF_LIFE,
        });
      }
      for (let i = 0; i < 12; i++) this.puffs.push(sparkle(this.rand, p.X, p.h, p.Z));
      this.onSound('chaff');
    }

    update(dtIn: number): void {
      if (this.paused) return;
      const dt = Math.min(dtIn, 1 / 30);
      this.updatePuffs(dt);
      this.updateMarks(dt);
      this.updateWisps(dt);
      this.blink = Math.max(0, this.blink - dt);
      this.resupplied = Math.max(0, this.resupplied - dt);
      this.missionCard = Math.max(0, this.missionCard - dt);
      this.resupplyCool = Math.max(0, this.resupplyCool - dt);

      if (this.phase === 'crashed') {
        // A full reset: the plane is restocked and the mission starts again.
        if (this.blink <= 0) this.newFlight(this.seed + 1, true, true);
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
        if (this.settings.invincible === 1 || this.felix) {
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
        this.updateLock(dt);
        this.updateMissiles(dt);
        this.updateEnemyMissiles(dt);
        this.updateDecoys(dt);
        this.updateShots(dt);
        this.updateShells(dt);
        this.updateGunners(dt);
        this.updateTag(dt);
        this.updateObjective();
        this.keepTargets();
        this.emitWisps(dt);
        this.emitDust();
        if (this.hull <= 0 && !this.felix && this.settings.invincible !== 1) this.crash();
      } else {
        this.checkRings();
      }
    }

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

    // Downed (normal mode): the plane blinks once, then carries on with full health.
    private crash(): void {
      this.phase = 'crashed';
      this.hull = 0;
      this.blink = BLINK_SECONDS;
      this.explode(this.plane.X, this.plane.h, this.plane.Z, 26);
      this.onSound('crash');
    }

    // A hit: the damage shows as a mark on the wing; in normal mode it takes a third of the hull.
    private takeHit(): void {
      this.marks.push({ x: (this.rand() < 0.5 ? -1 : 1) * (5 + this.rand() * 6), y: -1 + this.rand() * 2, age: 0 });
      if (this.marks.length > 12) this.marks.shift();
      this.hits++;
      if (this.settings.invincible !== 1 && !this.felix) {
        this.hull = Math.max(0, this.hull - HIT_DAMAGE);
      }
    }

    private updateMarks(dt: number): void {
      for (const m of this.marks) m.age += dt;
    }

    // Wisps stream from the wing tips in a tight turn; clouds come from the boost.
    private emitWisps(dt: number): void {
      const p = this.plane;
      const tight = Math.abs(p.bank) / AIR.bankMax;
      if (tight < 0.5 || this.phase !== 'flying') return;
      const count = Math.floor(tight * 5 * dt * 30) + (this.rand() < tight * dt * 6 ? 1 : 0);
      const cosY = Math.cos(p.yaw), sinY = Math.sin(p.yaw);
      for (let i = 0; i < count; i++) {
        const side = this.rand() < 0.5 ? -1 : 1;
        const span = 8;
        this.wisps.push({
          X: p.X + cosY * side * span, Z: p.Z - sinY * side * span, h: p.h,
          vX: 0, vY: 1, vZ: 0, life: WISP_LIFE, max: WISP_LIFE, color: '#ffffff', size: 2 + this.rand() * 2,
        });
      }
      if (this.held.boost && this.rand() < 0.4) {
        this.wisps.push({
          X: p.X - Math.sin(p.yaw) * 10, Z: p.Z - Math.cos(p.yaw) * 10, h: p.h - 1,
          vX: (this.rand() - 0.5) * 2, vY: 1.5, vZ: (this.rand() - 0.5) * 2,
          life: 1.2, max: 1.2, color: '#fffdfa', size: 4 + this.rand() * 3,
        });
      }
    }

    // Dust is kicked up when the plane is low and moving fast.
    private emitDust(): void {
      const p = this.plane;
      const agl = p.h - groundAt(p.X, p.Z);
      if (agl > 6 || p.speed < 40 || this.rand() > 0.35) return;
      this.puffs.push({
        X: p.X + (this.rand() - 0.5) * 10, Z: p.Z + (this.rand() - 0.5) * 10, h: groundAt(p.X, p.Z) + 0.5,
        vX: (this.rand() - 0.5) * 6, vY: 2 + this.rand() * 3, vZ: (this.rand() - 0.5) * 6,
        life: 0.6, max: 0.6, color: '#e6dcc0', size: 2 + this.rand() * 2,
      });
    }

    private updateWisps(dt: number): void {
      for (const w of this.wisps) {
        w.life -= dt;
        w.X += w.vX * dt;
        w.Z += w.vZ * dt;
        w.h += w.vY * dt;
      }
      this.wisps = this.wisps.filter(w => w.life > 0);
    }

    private updateReload(dt: number): void {
      if (this.felix) {
        this.ammo = AMMO_MAX;
        this.missileStock = MISSILE_MAX;
        this.chaff = CHAFF_MAX;
        return;
      }
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

    // Mission objective: destroy a number of ground targets. Finishing restocks everything.
    private updateObjective(): void {
      if (this.objectiveDone < this.objectiveGoal) return;
      this.missionNumber++;
      this.score += 500;
      this.ammo = AMMO_MAX;
      this.missileStock = MISSILE_MAX;
      this.chaff = CHAFF_MAX;
      this.hull = 100;
      this.hits = 0;
      this.resupplied = 4;
      this.onSound('chime');
      this.newFlight(this.seed + 1, true, true);
    }

    private updateWaves(dt: number): void {
      this.waveTimer -= dt;
      if (this.waveTimer <= 0) {
        this.waveTimer = WAVE_SECONDS;
        for (let i = 0; i < this.settings.enemyWave; i++) {
          this.mission.targets.push(spawnAir(this.rand, this.plane.X, this.plane.Z, true));
        }
      }
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
      // Enemy fighters also fire a homing missile now and then, when the plane is in front and near.
      this.enemyMissileCool -= dt;
      if (this.enemyMissileCool <= 0) {
        for (const t of this.mission.targets) {
          if (t.faction !== 'enemy' || !t.alive || t.h === undefined) continue;
          const d = Math.hypot(p.X - t.X, p.Z - t.Z);
          if (d < ENEMY_MISSILE_RANGE && d > 250) {
            this.enemyMissileCool = ENEMY_MISSILE_COOL;
            this.launchEnemyMissile(t);
            break;
          }
        }
      }
    }

    private launchEnemyMissile(t: Target): void {
      const p = this.plane;
      const dx = p.X - t.X, dz = p.Z - t.Z, dh = p.h - (t.h ?? p.h);
      const d = Math.hypot(dx, dz, dh) || 1;
      this.missiles.push({
        X: t.X, Z: t.Z, h: t.h ?? p.h,
        vX: dx / d * ENEMY_MISSILE_SPEED, vY: dh / d * ENEMY_MISSILE_SPEED, vZ: dz / d * ENEMY_MISSILE_SPEED,
        life: 9, target: null, enemy: true,
      });
    }

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

    // Targeting: hold MISSILE on a target in front for LOCK_TIME to lock; then a missile goes.
    private candidate(): Target | null {
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

    private updateLock(dt: number): void {
      this.missileCool -= dt;
      if (!this.held.missile) {
        this.lock = { target: null, progress: 0 };
        return;
      }
      const cand = this.missileStock > 0 && this.missileCool <= 0 ? this.candidate() : null;
      if (!cand) {
        this.lock = { target: null, progress: 0 };
        return;
      }
      if (this.lock.target !== cand) {
        this.lock = { target: cand, progress: 0 };
        this.onSound('lock');
      }
      this.lock.progress = Math.min(1, this.lock.progress + dt / LOCK_TIME);
      if (this.lock.progress >= 1) {
        this.fireMissile(cand);
        this.lock = { target: null, progress: 0 };
      }
    }

    private fireMissile(target: Target): void {
      const p = this.plane;
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

    private updateMissiles(dt: number): void {
      const keep: Missile[] = [];
      for (const m of this.missiles) {
        if (m.enemy) {
          keep.push(m);
          continue;
        }
        m.life -= dt;
        const target = m.target;
        if (target && target.alive) {
          const tg = altOf(target) + 1;
          const dx = target.X - m.X, dy = tg - m.h, dz = target.Z - m.Z;
          this.steer(m, dx, dy, dz, MISSILE_SPEED, MISSILE_TURN, dt);
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

    // Turns a missile's velocity toward (dx, dy, dz) at most at the turn rate.
    private steer(m: { vX: number; vY: number; vZ: number }, dx: number, dy: number, dz: number, speed: number, turn: number, dt: number): void {
      const d = Math.hypot(dx, dy, dz) || 1;
      const sp = Math.hypot(m.vX, m.vY, m.vZ) || speed;
      const want = [dx / d * sp, dy / d * sp, dz / d * sp];
      const cur = [m.vX, m.vY, m.vZ];
      const step = turn * dt * sp;
      const diff = [want[0] - cur[0], want[1] - cur[1], want[2] - cur[2]];
      const dl = Math.hypot(diff[0], diff[1], diff[2]) || 1;
      const k = Math.min(1, step / dl);
      m.vX = cur[0] + diff[0] * k;
      m.vY = cur[1] + diff[1] * k;
      m.vZ = cur[2] + diff[2] * k;
    }

    // Enemy missiles: home on the plane, or on a chaff decoy if one is nearer. A hard turn breaks the lock.
    private updateEnemyMissiles(dt: number): void {
      const p = this.plane;
      const keep: Missile[] = [];
      for (const m of this.missiles) {
        if (!m.enemy) {
          keep.push(m);
          continue;
        }
        m.life -= dt;
        let aimX = p.X, aimY = p.h, aimZ = p.Z;
        if (!m.broken) {
          let best: Decoy | null = null;
          let bestD = Math.hypot(m.X - p.X, m.h - p.h, m.Z - p.Z);
          for (const d of this.decoys) {
            const dd = Math.hypot(m.X - d.X, m.h - d.h, m.Z - d.Z);
            if (dd < bestD && dd < CHAFF_DECOY_RANGE * 2) { best = d; bestD = dd; }
          }
          if (best) { aimX = best.X; aimY = best.h; aimZ = best.Z; }
          this.steer(m, aimX - m.X, aimY - m.h, aimZ - m.Z, ENEMY_MISSILE_SPEED, ENEMY_MISSILE_TURN, dt);
        }
        m.X += m.vX * dt;
        m.Z += m.vZ * dt;
        m.h += m.vY * dt;
        const dp = Math.hypot(m.X - p.X, m.h - p.h, m.Z - p.Z);
        // A decoy caught it: it bursts there.
        const hitDecoy = this.decoys.find(d => Math.hypot(m.X - d.X, m.h - d.h, m.Z - d.Z) < 8);
        if (hitDecoy) {
          this.explode(m.X, m.h, m.Z, 14);
          this.onSound('boom');
          continue;
        }
        if (!m.broken && dp < 5) {
          this.takeHit();
          this.explode(m.X, m.h, m.Z, 14);
          this.onSound('boom');
          continue;
        }
        if (m.life <= 0 || m.h <= groundAt(m.X, m.Z)) {
          if (m.h <= groundAt(m.X, m.Z)) this.explode(m.X, m.h, m.Z, 8);
          continue;
        }
        keep.push(m);
      }
      this.missiles = keep;
    }

    private updateDecoys(dt: number): void {
      for (const d of this.decoys) {
        d.life -= dt;
        d.X += d.vX * dt;
        d.Z += d.vZ * dt;
        d.h += d.vY * dt;
        if (this.rand() < 0.3) this.puffs.push(sparkle(this.rand, d.X, d.h, d.Z));
      }
      this.decoys = this.decoys.filter(d => d.life > 0 && d.h > groundAt(d.X, d.Z));
    }

    // The tag: an enemy missile is after the plane. The beep speeds up as it closes; a hard turn breaks it.
    private updateTag(dt: number): void {
      const p = this.plane;
      let nearest = Infinity;
      let active = false;
      for (const m of this.missiles) {
        if (!m.enemy || m.broken) continue;
        active = true;
        nearest = Math.min(nearest, Math.hypot(m.X - p.X, m.h - p.h, m.Z - p.Z));
      }
      if (active && Math.abs(this.axes.yaw) > BREAK_TURN) {
        this.breakTimer += dt;
        if (this.breakTimer > BREAK_TIME) {
          for (const m of this.missiles) if (m.enemy) m.broken = true;
          this.breakTimer = 0;
          this.onSound('chime');
        }
      } else {
        this.breakTimer = Math.max(0, this.breakTimer - dt);
      }
      this.tagged = active;
      this.tagDist = active ? nearest : 0;
      if (active) {
        this.beepTimer -= dt;
        if (this.beepTimer <= 0) {
          this.beepTimer = 0.12 + Math.min(0.6, nearest / 1200);
          this.onSound('beep');
        }
      } else {
        this.beepTimer = 0;
      }
    }

    // Where a target is moving to, per second (vehicles on the road, fighters, allies on their orbit).
    private targetVelocity(t: Target): [number, number, number] {
      if (t.faction === 'enemy' && t.vH !== undefined) {
        return [Math.sin(t.vH) * FIGHTER_SPEED, 0, Math.cos(t.vH) * FIGHTER_SPEED];
      }
      if (t.faction === 'ally' && t.orbit) {
        const o = t.orbit;
        return [-Math.sin(o.ang) * o.r * o.w, 0, Math.cos(o.ang) * o.r * o.w];
      }
      return [0, 0, t.vZ ?? 0];
    }

    // The direction to fire so the bullet reaches where the target WILL be. The bullet starts
    // with the plane's own speed, and it falls under gravity, so both are allowed for.
    private leadDir(t: Target): [number, number, number] {
      const p = this.plane;
      const sinY = Math.sin(p.yaw), cosY = Math.cos(p.yaw);
      const vp: [number, number, number] = [p.vx * sinY, p.vy, p.vx * cosY];
      const vt = this.targetVelocity(t);
      const aimH = altOf(t) + (t.h === undefined ? 1 : 0);
      let tt = Math.hypot(t.X - p.X, aimH - p.h, t.Z - p.Z) / SHOT_SPEED;
      let dir: [number, number, number] = [0, 0, 1];
      for (let it = 0; it < 5; it++) {
        // Where the target is at time tt, lifted by the drop the bullet will have fallen.
        const tx = t.X + vt[0] * tt;
        const ty = aimH + vt[1] * tt + 0.5 * GRAVITY * tt * tt;
        const tz = t.Z + vt[2] * tt;
        // The muzzle velocity is the plane's velocity plus SHOT_SPEED along the gun,
        // so the gun must point at (target − plane − plane velocity × tt).
        const rx = tx - p.X - vp[0] * tt;
        const ry = ty - p.h - vp[1] * tt;
        const rz = tz - p.Z - vp[2] * tt;
        const d = Math.hypot(rx, ry, rz) || 1;
        dir = [rx / d, ry / d, rz / d];
        tt = d / SHOT_SPEED;
      }
      return dir;
    }

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
        if (t.h === undefined && t.kind !== 'jet' && d < bestD) {
          best = t;
          bestD = d;
        }
      }
      if (airborne || !best) {
        // Planes nearby: the gun points straight ahead, the way the plane is going.
        return { yaw: p.yaw, pitch: 0, mode: airborne ? 'air' : 'straight', dir: [sinY, 0, cosY] };
      }
      const dir = this.leadDir(best);
      return {
        yaw: Math.atan2(dir[0], dir[2]),
        pitch: Math.asin(Math.max(-1, Math.min(1, dir[1]))),
        mode: 'ground',
        dir,
      };
    }

    private updateGuns(dt: number): void {
      this.fireCool -= dt;
      this.aim = this.computeAim();
      if (!this.held.fire || this.fireCool > 0 || this.ammo < 1) return;
      this.fireCool = 0.09;
      this.ammo -= 1;
      const p = this.plane;
      const [dx, dy, dz] = this.aim.dir;
      // The bullet keeps the plane's speed and adds the gun's speed along the aim.
      const sinY = Math.sin(p.yaw), cosY = Math.cos(p.yaw);
      this.shots.push({
        X: p.X + dx * 2,
        Z: p.Z + dz * 2,
        h: p.h + dy * 2,
        vX: p.vx * sinY + SHOT_SPEED * dx,
        vZ: p.vx * cosY + SHOT_SPEED * dz,
        vY: p.vy + SHOT_SPEED * dy,
        life: BULLET_LIFE,
      });
      this.onSound('gun');
    }

    private hitTarget(t: Target, damage: number, tg: number): void {
      if (t.faction === 'ally') {
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
      // The mission objective counts ground places and vehicles (not ships, rail, or the air).
      if (isObjective(t)) this.objectiveDone++;
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
          this.takeHit();
          this.explode(s.X, s.h, s.Z, 6);
          this.onSound('thud');
          continue;
        }
        keep.push(s);
      }
      this.shells = keep;
      if (!this.shells.some(s => s.warn)) this.warned = false;
    }

    private keepTargets(): void {
      const m = this.mission;
      m.targets = m.targets.filter(t => (t.alive || t.Z > this.plane.Z - 150) && !(t.faction === 'enemy' && !t.alive));
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

  function sparkle(rand: () => number, X: number, h: number, Z: number): Puff {
    return {
      X, h, Z,
      vX: (rand() - 0.5) * 14, vY: 2 + rand() * 6, vZ: (rand() - 0.5) * 14,
      life: 0.9, max: 0.9, color: '#fff1b8', size: 2,
    };
  }

  function clamp(v: number): number {
    return Math.max(-1, Math.min(1, v));
  }
}
