"use strict";
// Shared numbers for the whole game. Change a number here, rebuild, reload.
var PA;
(function (PA) {
    PA.VERSION = '0.1.0';
    // Internal resolution. The canvas is small on purpose: every pixel is a
    // "pixel-art pixel", and the page scales it up with no smoothing.
    PA.W = 400;
    PA.H = 225;
    // Side view, 2.5D: screen pixels per metre, across and up.
    PA.PPM_X = 2;
    PA.PPM_Y = 1.5;
    PA.GROUND_Y = 172; // screen row of altitude 0
    PA.PLANE_X = 0.3; // the plane sits at 30% of the width
    PA.GRAVITY = 9.8;
    PA.INK = '#2f2d3d';
    // Pastel palette (family look: soft, with dark outlines).
    PA.COL = {
        skyTop: '#ffd9c7',
        skyBottom: '#bfe6f2',
        sun: '#fff1b8',
        cloud: '#fffdfa',
        hillFar: '#d6d0f0',
        hillMid: '#bfe3c4',
        ground: '#b9dea6',
        groundDark: '#a3cd93',
        thrust: '#ffb02e',
        lift: '#2ec4a0',
        drag: '#ff6b6b',
        weight: '#3d8bff',
        hoop: '#ff9e8a',
        hoopDone: '#7bd389',
        bullet: '#fff17a',
        shell: '#ff9e4a',
    };
})(PA || (PA = {}));
// Sprites are painted in code. Each one is a short list of little rectangles
// (a "painter"). The builder draws the shapes once in ink, shifted one pixel in
// each direction, which makes the dark outline, then draws the colours on top.
// No image files are loaded anywhere in the game.
var PA;
(function (PA) {
    class Painter {
        constructor() {
            this.ops = [];
        }
        // A rectangle of one colour. Later rectangles cover earlier ones.
        r(x, y, w, h, c) {
            this.ops.push({ x, y, w, h, c });
            return this;
        }
        // One pixel.
        p(x, y, c) {
            return this.r(x, y, 1, 1, c);
        }
    }
    PA.Painter = Painter;
    function buildSprite(paint) {
        const g = new Painter();
        paint(g);
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const o of g.ops) {
            minX = Math.min(minX, o.x);
            minY = Math.min(minY, o.y);
            maxX = Math.max(maxX, o.x + o.w);
            maxY = Math.max(maxY, o.y + o.h);
        }
        const canvas = document.createElement('canvas');
        canvas.width = maxX - minX + 2; // one pixel of room for the outline
        canvas.height = maxY - minY + 2;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            throw new Error('2D canvas is not available');
        const ox = 1 - minX, oy = 1 - minY;
        ctx.fillStyle = PA.INK;
        for (const o of g.ops) {
            ctx.fillRect(o.x + ox - 1, o.y + oy, o.w + 2, o.h);
            ctx.fillRect(o.x + ox, o.y + oy - 1, o.w, o.h + 2);
        }
        for (const o of g.ops) {
            ctx.fillStyle = o.c;
            ctx.fillRect(o.x + ox, o.y + oy, o.w, o.h);
        }
        return canvas;
    }
    PA.buildSprite = buildSprite;
    const cache = {};
    // Built the first time it is needed (so the file also loads without a page).
    function sprite(name) {
        if (cache[name])
            return cache[name];
        let s;
        if (name === 'plane') {
            // A-10 Warthog, side view, facing right: twin tails, high wing, the
            // canopy up front, two engines under the back.
            s = buildSprite(g => {
                g.r(2, 1, 2, 5, '#c8cfd6').p(2, 0, '#c8cfd6') // tail fin
                    .r(4, 6, 22, 4, '#c8cfd6') // fuselage
                    .r(6, 6, 16, 1, '#f5fbff') // top light
                    .r(26, 7, 2, 2, '#c8cfd6').p(28, 7, '#6b7480') // nose
                    .r(6, 10, 18, 1, '#6b7480') // belly shade
                    .r(19, 3, 5, 3, '#8fd3f0').r(20, 2, 3, 1, '#8fd3f0') // canopy
                    .r(11, 9, 8, 2, '#c8cfd6').r(12, 11, 6, 1, '#6b7480') // wing
                    .p(10, 9, '#6b7480').p(19, 9, '#6b7480') // wing tips
                    .r(7, 10, 4, 2, '#6b7480') // engine
                    .p(5, 11, '#ffb02e').p(6, 11, '#ffb02e'); // exhaust glow
            });
        }
        else if (name === 'tank') {
            s = buildSprite(g => {
                g.r(0, 5, 15, 2, '#6b7480') // tracks
                    .p(2, 6, '#f5fbff').p(6, 6, '#f5fbff').p(10, 6, '#f5fbff')
                    .r(1, 3, 12, 3, '#a9b67e') // hull
                    .r(4, 1, 6, 2, '#a9b67e') // turret
                    .r(9, 1, 6, 1, '#6b7480'); // gun
            });
        }
        else if (name === 'truck') {
            s = buildSprite(g => {
                g.r(0, 1, 9, 4, '#e6c48a') // cargo
                    .r(9, 2, 5, 3, '#e6c48a') // cab
                    .p(11, 3, '#8fd3f0') // window
                    .r(2, 5, 2, 2, '#6b7480').r(10, 5, 2, 2, '#6b7480'); // wheels
            });
        }
        else {
            s = buildSprite(g => {
                g.r(0, 5, 6, 3, '#e89a9a') // mount
                    .r(1, 0, 1, 6, '#6b7480').r(3, 0, 1, 6, '#6b7480'); // twin barrels
            });
        }
        cache[name] = s;
        return s;
    }
    PA.sprite = sprite;
})(PA || (PA = {}));
// The four forces, in plain numbers. No drawing here, so it can be tested in Node.
//
//   lift    pushes across the flight path; grows with speed² and with the angle
//           of attack (alpha = nose angle minus flight-path angle)
//   drag    pushes against the flight path; grows with speed² and with lift
//   thrust  pushes along the nose (the A-10 engines; zero for a paper plane)
//   weight  pulls down: mass × gravity
//
// Past the stall angle, lift falls away, so the plane sinks.
var PA;
(function (PA) {
    PA.AIR = {
        mass: 1,
        kq: 0.012, // lift and drag per unit of speed²
        cd0: 0.06, // drag with no lift
        kInduced: 0.03, // extra drag from lift
        clAlpha: 4.5, // lift per radian of angle of attack
        camber: 0.22, // lift with the nose exactly on the flight path (a curved wing)
        stall: 0.26, // radians, about 15 degrees
        maxThrust: 6,
        pitchRate: 1.1, // radians per second when the nose is moved
        stability: 0.5, // the tail pulls the nose back toward the flight path
        throttleRate: 0.6,
    };
    class Aircraft {
        constructor(engine) {
            this.engine = engine;
            this.x = 0;
            this.h = 0;
            this.vx = 0;
            this.vy = 0;
            this.pitch = 0;
            this.throttle = 0;
            this.alpha = 0;
            this.stalled = false;
            this.thrust = [0, 0];
            this.lift = [0, 0];
            this.drag = [0, 0];
            this.weight = [0, 0];
        }
        get speed() {
            return Math.hypot(this.vx, this.vy);
        }
        start(x, h, speed, pitch, throttle) {
            this.x = x;
            this.h = h;
            this.vx = speed * Math.cos(pitch);
            this.vy = speed * Math.sin(pitch);
            this.pitch = pitch;
            this.throttle = throttle;
        }
        // Moves the plane by dt seconds. Returns true if it touched the ground.
        step(dtIn, pilot, groundAt) {
            const dt = Math.min(dtIn, 1 / 30);
            this.pitch += pilot.pitch * PA.AIR.pitchRate * dt;
            if (this.engine) {
                this.throttle = clamp01(this.throttle + pilot.throttle * PA.AIR.throttleRate * dt);
            }
            const v = this.speed;
            const gamma = v > 0.01 ? Math.atan2(this.vy, this.vx) : this.pitch;
            this.pitch -= PA.AIR.stability * (this.pitch - gamma) * dt;
            const alpha = this.pitch - gamma;
            this.alpha = alpha;
            const a = Math.abs(alpha);
            this.stalled = a > PA.AIR.stall;
            let cl = PA.AIR.camber + PA.AIR.clAlpha * alpha;
            if (this.stalled) {
                const sign = Math.sign(alpha);
                cl = sign * PA.AIR.clAlpha * PA.AIR.stall * Math.max(0.3, 1 - (a - PA.AIR.stall) * 3);
            }
            const q = PA.AIR.kq * v * v;
            const liftMag = v > 1 ? q * cl : 0;
            const dragMag = q * (PA.AIR.cd0 + PA.AIR.kInduced * cl * cl);
            const ux = v > 0.01 ? this.vx / v : Math.cos(this.pitch);
            const uy = v > 0.01 ? this.vy / v : Math.sin(this.pitch);
            const thrustMag = this.engine ? this.throttle * PA.AIR.maxThrust : 0;
            this.thrust = [Math.cos(this.pitch) * thrustMag, Math.sin(this.pitch) * thrustMag];
            this.lift = [-uy * liftMag, ux * liftMag];
            this.drag = [-ux * dragMag, -uy * dragMag];
            this.weight = [0, -PA.AIR.mass * PA.GRAVITY];
            const ax = (this.thrust[0] + this.lift[0] + this.drag[0]) / PA.AIR.mass;
            const ay = (this.thrust[1] + this.lift[1] + this.drag[1] + this.weight[1]) / PA.AIR.mass;
            this.vx += ax * dt;
            this.vy += ay * dt;
            this.x += this.vx * dt;
            this.h += this.vy * dt;
            const ground = groundAt(this.x);
            if (this.h <= ground) {
                this.h = ground;
                return true;
            }
            return false;
        }
    }
    PA.Aircraft = Aircraft;
    function clamp01(v) {
        return Math.max(0, Math.min(1, v));
    }
})(PA || (PA = {}));
// The land and the missions. Same seed, same mission: the balance test relies on it.
var PA;
(function (PA) {
    // A seeded random number generator (mulberry32). Returns 0 up to 1.
    function random(seed) {
        let s = seed >>> 0;
        return () => {
            s = (s + 0x6d2b79f5) >>> 0;
            let t = s;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    PA.random = random;
    // Height of the ground in metres at distance x (the same line is drawn).
    function groundAt(x) {
        return Math.max(0, 4 + 3.5 * Math.sin(x / 210) + 1.5 * Math.sin(x / 61 + 2));
    }
    PA.groundAt = groundAt;
    function makeMission(mode, size, seed) {
        const rand = random(seed);
        const full = size === 'full';
        if (mode === 'paper') {
            const count = full ? 24 : 12;
            const hoops = [];
            for (let i = 0; i < count; i++) {
                const x = 260 + i * 110 + rand() * 40;
                hoops.push({ x, h: groundAt(x) + 12 + rand() * 40, r: 6, passed: false });
            }
            return {
                mode, size, seed, targets: [], hoops,
                startX: 0, startH: 90, startSpeed: 40, startPitch: 0.08, startThrottle: 0, ammo: 0,
            };
        }
        const count = full ? 12 : 6;
        const targets = [];
        for (let i = 0; i < count; i++) {
            const x = 500 + i * 260 + rand() * 120;
            const far = rand() < 0.4;
            const kind = rand() < 0.6 ? 'tank' : 'truck';
            targets.push({
                kind, x, far,
                hp: kind === 'tank' ? 2 : 1,
                alive: true,
                points: (kind === 'tank' ? 100 : 60) * (far ? 2 : 1),
                cool: 0,
            });
            // Every third target has an anti-aircraft gun beside it.
            if (i % 3 === 0) {
                targets.push({
                    kind: 'flak', x: x + 22, far: false, hp: 1, alive: true,
                    points: 80, cool: 1 + rand() * 1.5,
                });
            }
        }
        return {
            mode, size, seed, targets, hoops: [],
            startX: 0, startH: groundAt(0) + 10, startSpeed: 60, startPitch: 0.05, startThrottle: 0.5,
            ammo: full ? 240 : 160,
        };
    }
    PA.makeMission = makeMission;
})(PA || (PA = {}));
// Sound made in the page with the Web Audio API. No sound files.
var PA;
(function (PA) {
    class Sound {
        constructor() {
            this.ctx = null;
            this.noise = null;
            this.engine = null;
            this.engineGain = null;
            this.enabled = true;
        }
        // Browsers need a tap before sound may start, so this runs on the first press.
        unlock() {
            if (this.ctx) {
                if (this.ctx.state === 'suspended')
                    void this.ctx.resume();
                return;
            }
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC)
                return;
            const ctx = new AC();
            this.ctx = ctx;
            const len = Math.floor(ctx.sampleRate * 0.6);
            const buf = ctx.createBuffer(1, len, ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < len; i++)
                data[i] = Math.random() * 2 - 1;
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
        setThrottle(t, on) {
            if (!this.ctx || !this.engine || !this.engineGain)
                return;
            const now = this.ctx.currentTime;
            this.engine.frequency.setTargetAtTime(55 + t * 70, now, 0.05);
            this.engineGain.gain.setTargetAtTime(on && this.enabled ? 0.03 + t * 0.03 : 0, now, 0.1);
        }
        play(name) {
            if (!this.ctx || !this.enabled)
                return;
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
                case 'win':
                    [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.3, 0.16, t + i * 0.12, 'square'));
                    break;
                case 'crash':
                    this.burst(0.9, 0.4, 300, t);
                    this.tone(70, 0.6, 0.25, t, 'sawtooth', 30);
                    break;
            }
        }
        tone(freq, dur, vol, at, type, slideTo) {
            if (!this.ctx)
                return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, at);
            if (slideTo !== undefined)
                osc.frequency.exponentialRampToValueAtTime(slideTo, at + dur);
            gain.gain.setValueAtTime(vol, at);
            gain.gain.exponentialRampToValueAtTime(0.001, at + dur);
            osc.connect(gain).connect(this.ctx.destination);
            osc.start(at);
            osc.stop(at + dur + 0.02);
        }
        burst(dur, vol, cutoff, at) {
            if (!this.ctx || !this.noise)
                return;
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
    PA.Sound = Sound;
})(PA || (PA = {}));
// Game state and rules: guns, flak, hoops, crashes and the mission end.
var PA;
(function (PA) {
    const SHOT_SPEED = 260; // m/s, the gun, relative to the plane
    const FLAK_SPEED = 120; // m/s
    const BULLET_LIFE = 1.6;
    const SHELL_LIFE = 4;
    class Game {
        constructor(settings) {
            this.settings = settings;
            this.phase = 'flying';
            this.camX = 0;
            this.score = 0;
            this.kills = 0;
            this.ammo = 0;
            this.hull = 100;
            this.hoopsPassed = 0;
            this.time = 0;
            this.stars = 0;
            this.fireCool = 0;
            this.shots = [];
            this.shells = [];
            this.puffs = [];
            this.held = { up: false, down: false, more: false, less: false, fire: false };
            this.onSound = () => { };
            this.rand = PA.random(1);
            this.newMission(Math.floor(Math.random() * 100000));
        }
        newMission(seed) {
            this.mission = PA.makeMission(this.settings.mode, this.settings.size, seed);
            const m = this.mission;
            this.plane = new PA.Aircraft(m.mode === 'jet');
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
            this.rand = PA.random(seed + 7);
            this.snapCamera();
        }
        snapCamera() {
            this.camX = this.plane.x - (PA.W * PA.PLANE_X) / PA.PPM_X;
        }
        targetsLeft() {
            return this.mission.targets.filter(t => t.alive).length;
        }
        update(dtIn) {
            const dt = Math.min(dtIn, 1 / 30);
            this.updatePuffs(dt);
            if (this.phase !== 'flying')
                return;
            this.time += dt;
            const pilot = {
                pitch: (this.held.up ? 1 : 0) - (this.held.down ? 1 : 0),
                throttle: this.mission.mode === 'jet' ? (this.held.more ? 1 : 0) - (this.held.less ? 1 : 0) : 0,
            };
            const touched = this.plane.step(dt, pilot, PA.groundAt);
            this.camX += ((this.plane.x - (PA.W * PA.PLANE_X) / PA.PPM_X) - this.camX) * Math.min(1, dt * 8);
            if (touched) {
                if (this.mission.mode === 'paper') {
                    this.landed();
                }
                else {
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
        crash() {
            this.phase = 'crashed';
            this.hull = 0;
            this.explode(this.plane.x, this.plane.h, 26);
            this.onSound('crash');
        }
        landed() {
            this.phase = 'landed';
            this.onSound('land');
        }
        finish() {
            this.phase = 'won';
            this.stars = this.hull >= 70 ? 3 : this.hull >= 40 ? 2 : 1;
            this.onSound('win');
        }
        checkHoops() {
            if (this.mission.mode !== 'paper')
                return;
            for (const hoop of this.mission.hoops) {
                if (hoop.passed)
                    continue;
                if (Math.abs(this.plane.x - hoop.x) < 1.2 && Math.abs(this.plane.h - hoop.h) <= hoop.r) {
                    hoop.passed = true;
                    this.hoopsPassed++;
                    this.score += 100;
                    this.onSound('chime');
                }
            }
        }
        updateGuns(dt) {
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
        updateShots(dt) {
            const keep = [];
            for (const s of this.shots) {
                s.vy -= PA.GRAVITY * dt;
                s.x += s.vx * dt;
                s.h += s.vy * dt;
                s.life -= dt;
                if (s.life <= 0 || s.h <= PA.groundAt(s.x)) {
                    if (s.h <= PA.groundAt(s.x))
                        this.dust(s.x, PA.groundAt(s.x));
                    continue;
                }
                let hit = false;
                for (const t of this.mission.targets) {
                    if (!t.alive)
                        continue;
                    const half = t.kind === 'truck' ? 1.6 : 2.2;
                    const scale = t.far ? 0.5 : 1;
                    const top = PA.groundAt(t.x) + (t.kind === 'truck' ? 2 : 2.5) * scale;
                    if (Math.abs(s.x - t.x) < half * scale && s.h >= PA.groundAt(t.x) && s.h <= top) {
                        t.hp--;
                        hit = true;
                        if (t.hp <= 0)
                            this.destroy(t);
                        else
                            this.onSound('thud');
                        break;
                    }
                }
                if (!hit)
                    keep.push(s);
            }
            this.shots = keep;
        }
        destroy(t) {
            t.alive = false;
            this.kills++;
            this.score += t.points;
            this.explode(t.x, PA.groundAt(t.x) + 1, t.kind === 'flak' ? 10 : 16);
            this.onSound('boom');
        }
        updateFlak(dt) {
            for (const t of this.mission.targets) {
                if (t.kind !== 'flak' || !t.alive)
                    continue;
                t.cool -= dt;
                const dist = Math.abs(this.plane.x - t.x);
                if (t.cool <= 0 && dist < 220 && this.plane.h < 90) {
                    t.cool = 1.6 + this.rand() * 1.2;
                    const gx = t.x, gy = PA.groundAt(t.x) + 2;
                    const T = Math.max(0.3, Math.hypot(this.plane.x - gx, this.plane.h - gy) / FLAK_SPEED);
                    const aimX = this.plane.x + this.plane.vx * T;
                    const aimY = this.plane.h + this.plane.vy * T;
                    const dx = aimX - gx, dy = aimY - gy;
                    const d = Math.hypot(dx, dy) || 1;
                    this.shells.push({
                        x: gx, h: gy,
                        vx: (dx / d) * FLAK_SPEED,
                        vy: (dy / d) * FLAK_SPEED + 0.5 * PA.GRAVITY * T,
                        life: SHELL_LIFE,
                    });
                    this.onSound('thud');
                }
            }
        }
        updateShells(dt) {
            const keep = [];
            for (const s of this.shells) {
                s.vy -= PA.GRAVITY * dt;
                s.x += s.vx * dt;
                s.h += s.vy * dt;
                s.life -= dt;
                if (s.life <= 0 || s.h <= PA.groundAt(s.x))
                    continue;
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
        explode(x, h, n) {
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
        dust(x, h) {
            for (let i = 0; i < 4; i++) {
                this.puffs.push({
                    x, h, vx: (this.rand() - 0.5) * 10, vy: 4 + this.rand() * 4,
                    life: 0.4, max: 0.4, color: '#e6e0c8', size: 2,
                });
            }
        }
        updatePuffs(dt) {
            for (const p of this.puffs) {
                p.vy -= PA.GRAVITY * 0.5 * dt;
                p.x += p.vx * dt;
                p.h += p.vy * dt;
                p.life -= dt;
            }
            this.puffs = this.puffs.filter(p => p.life > 0);
        }
    }
    PA.Game = Game;
})(PA || (PA = {}));
// Drawing the scene. Layers from back to front, each scrolling at its own speed
// (parallax) so the land looks deep even though the view is a side view.
var PA;
(function (PA) {
    function sy(h) {
        return PA.GROUND_Y - h * PA.PPM_Y;
    }
    function sx(g, x) {
        return (x - g.camX) * PA.PPM_X;
    }
    function sky(ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, PA.H);
        grad.addColorStop(0, PA.COL.skyTop);
        grad.addColorStop(1, PA.COL.skyBottom);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, PA.W, PA.H);
        ctx.fillStyle = PA.COL.sun;
        ctx.beginPath();
        ctx.arc(330, 36, 16, 0, Math.PI * 2);
        ctx.fill();
    }
    function clouds(ctx, g) {
        ctx.fillStyle = PA.COL.cloud;
        const span = 520;
        for (let i = 0; i < 5; i++) {
            const base = i * 130 + 40;
            const x = ((base - g.camX * 0.15) % span + span) % span - 60;
            const y = 22 + (i % 3) * 14;
            ctx.beginPath();
            ctx.arc(x, y, 9, 0, Math.PI * 2);
            ctx.arc(x + 11, y - 4, 11, 0, Math.PI * 2);
            ctx.arc(x + 24, y, 9, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    // A soft line of hills or bushes, drawn as one column at a time.
    function ridge(ctx, g, speed, base, amp, color, freq) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, PA.H);
        for (let px = 0; px <= PA.W; px += 2) {
            const wx = (px / PA.PPM_X) + g.camX * speed;
            const y = base - amp * (0.6 + 0.4 * Math.sin(wx * freq)) * (0.7 + 0.3 * Math.sin(wx * freq * 2.7 + 1));
            ctx.lineTo(px, y);
        }
        ctx.lineTo(PA.W, PA.H);
        ctx.closePath();
        ctx.fill();
    }
    function ground(ctx, g) {
        ctx.fillStyle = PA.COL.ground;
        ctx.beginPath();
        ctx.moveTo(0, PA.H);
        for (let px = 0; px <= PA.W; px += 2) {
            const x = g.camX + px / PA.PPM_X;
            ctx.lineTo(px, sy(PA.groundAt(x)));
        }
        ctx.lineTo(PA.W, PA.H);
        ctx.closePath();
        ctx.fill();
        // Stripes (fields) that scroll at full speed: the closest layer.
        ctx.fillStyle = PA.COL.groundDark;
        for (let k = 0; k < 40; k++) {
            const x = ((k * 46 - g.camX * PA.PPM_X) % 1840 + 1840) % 1840 - 40;
            const y = PA.H - 22 + (k % 3) * 6;
            ctx.fillRect(Math.round(x), y, 22, 2);
        }
    }
    function targets(ctx, g) {
        for (const t of g.mission.targets) {
            if (!t.alive)
                continue;
            const img = PA.sprite(t.kind === 'flak' ? 'flak' : t.kind);
            const scale = t.far ? 0.5 : 1;
            const x = sx(g, t.x);
            if (x < -40 || x > PA.W + 40)
                continue;
            // Far targets stand a little higher on the screen, as they would in depth.
            const base = sy(PA.groundAt(t.x)) + 1 - (t.far ? 6 : 0);
            const w = img.width * scale, h = img.height * scale;
            ctx.drawImage(img, Math.round(x - w / 2), Math.round(base - h), w, h);
        }
    }
    function hoops(ctx, g) {
        for (const hoop of g.mission.hoops) {
            const x = sx(g, hoop.x);
            if (x < -30 || x > PA.W + 30)
                continue;
            const y = sy(hoop.h);
            ctx.lineWidth = 4;
            ctx.strokeStyle = PA.INK;
            ctx.beginPath();
            ctx.ellipse(x, y, hoop.r * PA.PPM_X + 1, hoop.r * PA.PPM_Y + 1, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.lineWidth = 2;
            ctx.strokeStyle = hoop.passed ? PA.COL.hoopDone : PA.COL.hoop;
            ctx.stroke();
        }
    }
    function shots(ctx, g) {
        ctx.fillStyle = PA.COL.bullet;
        for (const s of g.shots) {
            const x = sx(g, s.x), y = sy(s.h);
            ctx.fillRect(Math.round(x) - 2, Math.round(y), 4, 1);
        }
        ctx.fillStyle = PA.COL.shell;
        for (const s of g.shells) {
            const x = sx(g, s.x), y = sy(s.h);
            ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
        }
    }
    function puffs(ctx, g) {
        for (const p of g.puffs) {
            const k = Math.max(0, p.life / p.max);
            ctx.globalAlpha = Math.min(1, k * 1.4);
            ctx.fillStyle = p.color;
            const s = Math.max(1, Math.round(p.size * (0.5 + k)));
            ctx.fillRect(Math.round(sx(g, p.x)), Math.round(sy(p.h)), s, s);
        }
        ctx.globalAlpha = 1;
    }
    function plane(ctx, g) {
        const p = g.plane;
        const img = PA.sprite('plane');
        const px = sx(g, p.x), py = sy(p.h);
        // Shadow on the ground: smaller and softer the higher the plane flies.
        const gy = sy(PA.groundAt(p.x));
        const rx = Math.max(3, 14 - p.h * 0.12);
        ctx.fillStyle = 'rgba(47,45,61,0.22)';
        ctx.beginPath();
        ctx.ellipse(px, gy + 1, rx, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // The sprite turns with the nose (a little, to keep it crisp).
        const angle = -Math.max(-0.6, Math.min(0.6, p.pitch));
        ctx.save();
        ctx.translate(Math.round(px), Math.round(py));
        ctx.rotate(angle);
        ctx.drawImage(img, -Math.round(img.width / 2), -Math.round(img.height / 2));
        ctx.restore();
    }
    function arrow(ctx, x, y, vx, vy, color, label) {
        const len = Math.hypot(vx, vy);
        if (len < 2)
            return;
        const ex = x + vx, ey = y - vy;
        ctx.strokeStyle = PA.INK;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        const a = Math.atan2(-(ey - y), ex - x);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - 7 * Math.cos(a - 0.45), ey + 7 * Math.sin(a - 0.45));
        ctx.lineTo(ex - 7 * Math.cos(a + 0.45), ey + 7 * Math.sin(a + 0.45));
        ctx.closePath();
        ctx.fill();
        ctx.font = 'bold 9px system-ui, sans-serif';
        ctx.fillStyle = PA.INK;
        ctx.fillText(label, ex + 4, ey + 3);
    }
    // Arrows for the four forces, drawn from the plane's centre. One unit of force is 1.6 px.
    function forces(ctx, g) {
        const p = g.plane;
        const x = sx(g, p.x), y = sy(p.h);
        const k = 1.6;
        const f = (v) => [v[0] * k, v[1] * k];
        const t = f(p.thrust), l = f(p.lift), d = f(p.drag), w = f(p.weight);
        arrow(ctx, x, y, t[0], t[1], PA.COL.thrust, 'thrust');
        arrow(ctx, x, y, l[0], l[1], PA.COL.lift, 'lift');
        arrow(ctx, x, y, d[0], d[1], PA.COL.drag, 'drag');
        arrow(ctx, x, y, w[0], w[1], PA.COL.weight, 'weight');
    }
    function render(ctx, g) {
        ctx.imageSmoothingEnabled = false;
        sky(ctx);
        clouds(ctx, g);
        ridge(ctx, g, 0.35, 120, 34, PA.COL.hillFar, 0.05);
        ridge(ctx, g, 0.7, 150, 18, PA.COL.hillMid, 0.09);
        ground(ctx, g);
        if (g.mission.mode === 'paper')
            hoops(ctx, g);
        targets(ctx, g);
        shots(ctx, g);
        plane(ctx, g);
        puffs(ctx, g);
        if (g.settings.forces)
            forces(ctx, g);
    }
    PA.render = render;
})(PA || (PA = {}));
// Boot: the page, the buttons, the keyboard, the settings drawer, and the frame loop.
var PA;
(function (PA) {
    const SETTINGS_KEY = 'pa_warthog.settings';
    const DEFAULTS = { mode: 'jet', size: 'full', sound: 1, forces: 0, showErrors: 0 };
    const $ = (id) => {
        const el = document.getElementById(id);
        if (!el)
            throw new Error('missing #' + id);
        return el;
    };
    const errors = [];
    function logError(message) {
        errors.push(new Date().toLocaleTimeString() + '  ' + message);
        renderErrors();
    }
    function renderErrors() {
        const box = $('errorsPanel');
        box.hidden = !settings.showErrors;
        box.textContent = errors.length ? errors.join('\n') : 'No problems so far.';
    }
    function loadSettings() {
        try {
            return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
        }
        catch (e) {
            return { ...DEFAULTS };
        }
    }
    function saveSettings() {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        }
        catch (e) {
            logError('Could not save settings on this device: ' + String(e));
        }
    }
    const settings = loadSettings();
    const sound = new PA.Sound();
    sound.enabled = settings.sound === 1;
    let game;
    function renderSettings() {
        document.querySelectorAll('.seg').forEach(seg => {
            const key = seg.dataset.key;
            const v = String(settings[key]);
            seg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
        });
        $('showErrors').checked = settings.showErrors === 1;
        document.body.classList.toggle('paper', settings.mode === 'paper');
        renderErrors();
    }
    function onSeg(key, value) {
        const restarts = key === 'mode' || key === 'size';
        if (key === 'mode' || key === 'size') {
            settings[key] = value;
        }
        else {
            settings[key] = +value;
        }
        if (key === 'sound')
            sound.enabled = settings.sound === 1;
        saveSettings();
        renderSettings();
        if (restarts) {
            game.settings = settings;
            newMission();
        }
    }
    function newMission() {
        game.settings = settings;
        game.onSound = name => sound.play(name);
        game.newMission(Math.floor(Math.random() * 100000));
        $('overlay').hidden = true;
    }
    // Keys and touch buttons both set the same held flags.
    const keyMap = {
        ArrowUp: 'up', KeyW: 'up',
        ArrowDown: 'down', KeyS: 'down',
        ArrowRight: 'more', KeyD: 'more',
        ArrowLeft: 'less', KeyA: 'less',
        Space: 'fire', KeyF: 'fire',
    };
    function setHeld(k, on) {
        if (on)
            sound.unlock();
        game.held[k] = on;
    }
    function bindInput() {
        window.addEventListener('keydown', e => {
            const k = keyMap[e.code];
            if (!k)
                return;
            e.preventDefault();
            setHeld(k, true);
        });
        window.addEventListener('keyup', e => {
            const k = keyMap[e.code];
            if (k)
                setHeld(k, false);
        });
        window.addEventListener('blur', () => {
            Object.keys(game.held).forEach(k => setHeld(k, false));
        });
        document.querySelectorAll('.controls button').forEach(b => {
            const k = b.dataset.k;
            const press = (e) => {
                e.preventDefault();
                b.setPointerCapture(e.pointerId);
                setHeld(k, true);
            };
            const release = () => setHeld(k, false);
            b.addEventListener('pointerdown', press);
            b.addEventListener('pointerup', release);
            b.addEventListener('pointercancel', release);
            b.addEventListener('lostpointercapture', release);
        });
    }
    function hud() {
        const g = game;
        const p = g.plane;
        $('score').textContent = String(g.score);
        $('kills').textContent = g.kills + ' / ' + g.mission.targets.length;
        $('ammo').textContent = g.mission.mode === 'jet' ? String(g.ammo) : '—';
        $('hoops').textContent = g.hoopsPassed + ' / ' + g.mission.hoops.length;
        $('hull').style.width = Math.max(0, g.hull) + '%';
        $('speed').textContent = Math.round(p.speed * 1.94) + ' kt';
        $('alt').textContent = Math.round(p.h - PA.groundAt(p.x)) + ' m';
        $('aoa').textContent = (p.alpha * 180 / Math.PI).toFixed(0) + '°';
        $('stall').hidden = !p.stalled || g.phase !== 'flying';
    }
    function message() {
        const g = game;
        const p = g.plane;
        if (g.phase !== 'flying')
            return '';
        if (p.stalled)
            return 'Too steep! Nose down to get the air flowing again.';
        if (g.mission.mode === 'paper') {
            return p.vy < -1 ? 'Gliding down. Fly through the rings.' : 'Let the wings carry you.';
        }
        if (p.vy < -2 && p.h - PA.groundAt(p.x) < 25)
            return 'Losing height: nose up or add power.';
        if (p.speed < 35)
            return 'Slow: add power (+) to keep the wings working.';
        return g.targetsLeft() > 0 ? 'Hold FIRE over the targets.' : '';
    }
    function overlay() {
        const g = game;
        const box = $('overlay');
        if (g.phase === 'flying') {
            box.hidden = true;
            return;
        }
        box.hidden = false;
        let title = '', text = '';
        if (g.phase === 'crashed') {
            title = 'Crashed!';
            text = g.mission.mode === 'paper'
                ? 'The glider touched down.'
                : 'Try again: keep the speed up and the nose level.';
        }
        else if (g.phase === 'landed') {
            title = 'Landed!';
            text = 'Rings flown: ' + g.hoopsPassed + ' of ' + g.mission.hoops.length + '. Score ' + g.score + '.';
        }
        else if (g.phase === 'won') {
            title = 'Mission complete';
            text = '★'.repeat(g.stars) + '☆'.repeat(3 - g.stars) + '  Score ' + g.score + ', hull ' + Math.round(g.hull) + '%.';
        }
        $('ovTitle').textContent = title;
        $('ovText').textContent = text;
    }
    let last = 0;
    let hudTimer = 0;
    function frame(now) {
        const dt = last ? (now - last) / 1000 : 0;
        last = now;
        try {
            game.update(dt);
            const scene = $('view');
            const ctx = scene.getContext('2d');
            if (ctx)
                PA.render(ctx, game);
            sound.setThrottle(game.plane.throttle, game.phase === 'flying' && game.mission.mode === 'jet');
            hudTimer += dt;
            if (hudTimer > 0.1) {
                hudTimer = 0;
                hud();
                overlay();
                $('msg').textContent = message();
            }
        }
        catch (e) {
            logError('Frame: ' + String(e));
        }
        requestAnimationFrame(frame);
    }
    function boot() {
        game = new PA.Game(settings);
        game.onSound = name => sound.play(name);
        renderSettings();
        window.addEventListener('error', e => logError(e.message));
        window.addEventListener('unhandledrejection', e => logError('Promise: ' + String(e.reason)));
        const gear = $('gear');
        const drawer = $('drawer');
        const setOpen = (open) => {
            drawer.hidden = !open;
            gear.setAttribute('aria-expanded', String(open));
        };
        gear.addEventListener('click', () => setOpen(drawer.hidden));
        $('closeDrawer').addEventListener('click', () => setOpen(false));
        document.querySelectorAll('.seg button').forEach(b => {
            b.addEventListener('click', () => onSeg(b.parentElement.dataset.key, b.dataset.v || '0'));
        });
        $('showErrors').addEventListener('change', e => {
            settings.showErrors = e.target.checked ? 1 : 0;
            saveSettings();
            renderErrors();
        });
        $('restart').addEventListener('click', () => { newMission(); setOpen(false); });
        $('again').addEventListener('click', () => newMission());
        $('version').textContent = 'Version ' + PA.VERSION;
        bindInput();
        renderErrors();
        requestAnimationFrame(frame);
    }
    // Only start the page in a browser (the flight test loads this file in Node).
    if (typeof document !== 'undefined')
        boot();
})(PA || (PA = {}));
