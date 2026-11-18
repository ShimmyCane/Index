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
            // A-10 Warthog seen from behind: wide wing, twin tails, the cockpit up top, two engines.
            s = buildSprite(g => {
                g.r(0, 7, 22, 2, '#c8cfd6') // wing
                    .r(0, 8, 3, 1, '#6b7480').r(19, 8, 3, 1, '#6b7480') // wing tips
                    .r(9, 2, 4, 9, '#c8cfd6') // fuselage
                    .r(9, 2, 1, 9, '#f5fbff') // light side
                    .r(10, 1, 2, 2, '#8fd3f0') // canopy
                    .r(5, 1, 2, 7, '#c8cfd6').r(15, 1, 2, 7, '#c8cfd6') // twin tails
                    .r(5, 0, 2, 1, '#6b7480').r(15, 0, 2, 1, '#6b7480')
                    .r(7, 9, 2, 3, '#6b7480').r(13, 9, 2, 3, '#6b7480') // engines
                    .r(7, 12, 2, 1, '#ffb02e').r(13, 12, 2, 1, '#ffb02e'); // exhaust glow
            });
        }
        else if (name === 'glider') {
            // Classic paper dart seen from behind: a flat sheet with a folded nose.
            s = buildSprite(g => {
                g.r(0, 6, 20, 2, '#fffdfa') // wings
                    .r(0, 6, 20, 1, '#f5fbff')
                    .r(9, 2, 2, 9, '#fffdfa') // fold line
                    .p(10, 1, '#fffdfa')
                    .r(0, 8, 20, 1, '#d6d0f0'); // shaded underside
            });
        }
        else if (name === 'pilot') {
            // A pilot under a parachute canopy.
            s = buildSprite(g => {
                g.r(1, 0, 9, 3, '#ffb3a7') // canopy
                    .r(1, 0, 9, 1, '#ff9e8a')
                    .p(2, 3, '#6b7480').p(8, 3, '#6b7480') // lines
                    .r(4, 4, 3, 3, '#f5d7b0') // head and body
                    .r(4, 7, 3, 2, '#3d8bff');
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
// The vertical plane (forward speed vx, climb vy, altitude h) is worked out as a
// side view. Yaw turns that plane round the vertical axis, so the plane can
// turn left and right over the ground: X and Z are the ground position.
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
        turnRate: 1.0, // radians per second of yaw at full steering
        bankMax: 0.6, // radians of bank at full steering (the wings tilt into the turn)
        stability: 0.5, // the tail pulls the nose back toward the flight path
    };
    class Aircraft {
        constructor(engine) {
            this.engine = engine;
            this.X = 0; // ground position, metres (east)
            this.Z = 0; // ground position, metres (north, the start heading)
            this.h = 0; // altitude, metres
            this.vx = 0; // forward speed in the vertical plane
            this.vy = 0; // climb speed
            this.pitch = 0; // nose angle (radians)
            this.yaw = 0; // heading (radians, 0 = north, positive = turned right)
            this.bank = 0; // wing tilt for drawing (radians, positive = right wing down)
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
        start(X, Z, h, speed, pitch, yaw, throttle) {
            this.X = X;
            this.Z = Z;
            this.h = h;
            this.vx = speed * Math.cos(pitch);
            this.vy = speed * Math.sin(pitch);
            this.pitch = pitch;
            this.yaw = yaw;
            this.bank = 0;
            this.throttle = throttle;
        }
        // Moves the plane by dt seconds. Returns true if it touched the ground.
        step(dtIn, pilot, groundAt) {
            const dt = Math.min(dtIn, 1 / 30);
            this.pitch += pilot.pitch * PA.AIR.pitchRate * dt;
            this.yaw += pilot.yaw * PA.AIR.turnRate * dt;
            this.bank += (pilot.yaw * PA.AIR.bankMax - this.bank) * Math.min(1, dt * 4);
            if (this.engine)
                this.throttle = clamp01(pilot.throttle);
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
            // Move along the heading, and climb or sink.
            const run = this.vx * dt;
            this.X += run * Math.sin(this.yaw);
            this.Z += run * Math.cos(this.yaw);
            this.h += this.vy * dt;
            const ground = groundAt(this.X, this.Z);
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
// The land, the targets and the glider rings. Same seed, same start.
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
    // Height of the ground in metres at ground position (X, Z).
    function groundAt(X, Z) {
        return Math.max(0, 4 + 3.5 * Math.sin(X / 210) + 1.5 * Math.sin(Z / 61 + 2));
    }
    PA.groundAt = groundAt;
    // Ground size of each target (radius to hit, height), in metres.
    PA.SIZE = {
        tank: { r: 2.6, height: 2.6 },
        truck: { r: 2.2, height: 2.6 },
        flak: { r: 2.0, height: 3.0 },
    };
    // A group of ground targets in front of (baseZ). Every third one has an anti-aircraft gun.
    function spawnTargets(rand, baseZ, count) {
        const out = [];
        for (let i = 0; i < count; i++) {
            const X = (rand() - 0.5) * 260;
            const Z = baseZ + i * 110 + rand() * 60;
            const kind = rand() < 0.6 ? 'tank' : 'truck';
            out.push({ kind, X, Z, alive: true, points: kind === 'tank' ? 100 : 60, cool: 0 });
            if (i % 3 === 0) {
                out.push({ kind: 'flak', X: X + 8, Z: Z + 8, alive: true, points: 80, cool: 1 + rand() * 1.5 });
            }
        }
        return out;
    }
    PA.spawnTargets = spawnTargets;
    function makeMission(mode, seed) {
        const rand = random(seed);
        if (mode === 'glider') {
            const hoops = [];
            for (let i = 0; i < 24; i++) {
                const X = (rand() - 0.5) * 60;
                const Z = 220 + i * 110 + rand() * 30;
                hoops.push({ X, Z, h: groundAt(X, Z) + 12 + rand() * 40, r: 6, passed: false });
            }
            return { mode, targets: [], hoops };
        }
        return { mode, targets: spawnTargets(rand, 260, 10), hoops: [] };
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
// Game state and rules: guns, anti-aircraft shells, rings, crashes and free play.
var PA;
(function (PA) {
    const SHOT_SPEED = 260; // m/s, the gun, relative to the plane
    const FLAK_SPEED = 120; // m/s
    const CRUISE_THROTTLE = 0.6;
    const BULLET_LIFE = 1.6;
    const SHELL_LIFE = 4;
    const RESPAWN_SECONDS = 3.5;
    const MISSILE_COOL = 3; // seconds between missiles
    const MISSILE_SPEED = 180; // m/s
    const MISSILE_TURN = 2.2; // radians per second at most
    const MISSILE_RANGE = 900; // metres
    const MISSILE_CONE = 0.45; // radians either side of the nose to lock on
    const PARACHUTE_FALL = 4; // m/s, the pilot's sink rate under the parachute
    const KEEP_AHEAD = 6; // free play keeps this many targets in front of the plane
    class Game {
        constructor(settings) {
            this.settings = settings;
            this.phase = 'flying';
            this.seed = 1;
            this.score = 0;
            this.kills = 0;
            this.hull = 100;
            this.hoopsPassed = 0;
            this.time = 0;
            this.fireCool = 0;
            this.respawnIn = 0;
            this.shots = [];
            this.shells = [];
            this.missiles = [];
            this.jumpers = [];
            this.missileCool = 0;
            this.puffs = [];
            this.held = { fire: false, boost: false, missile: false };
            this.axes = { yaw: 0, pitch: 0 };
            this.onSound = () => { };
            this.rand = PA.random(1);
            this.newFlight(Math.floor(Math.random() * 100000));
        }
        newFlight(seed) {
            this.seed = seed;
            this.mission = PA.makeMission(this.settings.mode, seed);
            this.rand = PA.random(seed + 7);
            this.plane = new PA.Aircraft(this.settings.mode === 'jet');
            if (this.settings.mode === 'glider') {
                this.plane.start(0, 0, 90, 40, 0.08, 0, 0);
            }
            else {
                this.plane.start(0, 0, PA.groundAt(0, 0) + 10, 60, 0.05, 0, CRUISE_THROTTLE);
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
            this.missiles = [];
            this.jumpers = [];
            this.missileCool = 0;
        }
        update(dtIn) {
            const dt = Math.min(dtIn, 1 / 30);
            this.updatePuffs(dt);
            this.updateJumpers(dt);
            if (this.phase === 'crashed') {
                this.respawnIn -= dt;
                if (this.respawnIn <= 0)
                    this.newFlight(this.seed + 1);
                return;
            }
            if (this.phase !== 'flying')
                return;
            this.time += dt;
            const jet = this.settings.mode === 'jet';
            const pilot = {
                pitch: clamp(this.axes.pitch),
                yaw: clamp(this.axes.yaw),
                throttle: jet ? (this.held.boost ? 1 : CRUISE_THROTTLE) : 0,
            };
            const touched = this.plane.step(dt, pilot, PA.groundAt);
            if (touched) {
                if (jet) {
                    this.crash();
                }
                else {
                    this.phase = 'landed';
                    this.onSound('land');
                }
                return;
            }
            if (jet) {
                this.updateGuns(dt);
                this.updateMissiles(dt);
                this.updateShots(dt);
                this.updateShells(dt);
                this.updateFlak(dt);
                this.keepTargets();
                if (this.hull <= 0)
                    this.crash();
            }
            else {
                this.checkRings();
            }
        }
        // Ejection: the explosion, then the pilot drifts down on a parachute.
        crash() {
            this.phase = 'crashed';
            this.hull = 0;
            this.respawnIn = RESPAWN_SECONDS;
            this.explode(this.plane.X, this.plane.h, this.plane.Z, 26);
            this.jumpers.push({ X: this.plane.X, Z: this.plane.Z, h: Math.max(this.plane.h, 4), vY: 8, drift: this.plane.vx, life: RESPAWN_SECONDS });
            this.onSound('crash');
        }
        updateJumpers(dt) {
            for (const j of this.jumpers) {
                // Free fall for a moment, then the parachute slows the sink to a steady drift.
                j.vY = j.vY > -PARACHUTE_FALL ? Math.max(-PARACHUTE_FALL, j.vY - PA.GRAVITY * dt) : -PARACHUTE_FALL;
                j.h = Math.max(PA.groundAt(j.X, j.Z), j.h + j.vY * dt);
                j.X += j.drift * dt * 0.2;
                j.life -= dt;
            }
            this.jumpers = this.jumpers.filter(j => j.life > 0);
        }
        // The missile locks on to the nearest target in front, and turns to follow it.
        updateMissiles(dt) {
            this.missileCool -= dt;
            const p = this.plane;
            if (this.held.missile && this.missileCool <= 0) {
                const target = this.findLock();
                if (target) {
                    this.missileCool = MISSILE_COOL;
                    const sinY = Math.sin(p.yaw), cosY = Math.cos(p.yaw);
                    this.missiles.push({
                        X: p.X + sinY * 3, Z: p.Z + cosY * 3, h: p.h,
                        vX: p.vx * sinY + MISSILE_SPEED * sinY, vZ: p.vx * cosY + MISSILE_SPEED * cosY, vY: p.vy,
                        life: 6, target,
                    });
                    this.onSound('gun');
                }
            }
            const keep = [];
            for (const m of this.missiles) {
                m.life -= dt;
                if (m.target && m.target.alive) {
                    const tx = m.target.X, tz = m.target.Z, th = PA.groundAt(tx, tz) + 1;
                    const dx = tx - m.X, dy = th - m.h, dz = tz - m.Z;
                    const d = Math.hypot(dx, dy, dz) || 1;
                    const sp = Math.hypot(m.vX, m.vY, m.vZ) || MISSILE_SPEED;
                    const want = [dx / d * sp, dy / d * sp, dz / d * sp];
                    const cur = [m.vX, m.vY, m.vZ];
                    const step = MISSILE_TURN * dt * sp;
                    // Turn the velocity toward the target, by at most the turn rate.
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
                const target = m.target;
                if (target && target.alive) {
                    const size = PA.SIZE[target.kind];
                    const tg = PA.groundAt(target.X, target.Z);
                    const dx = m.X - target.X, dz = m.Z - target.Z;
                    if (dx * dx + dz * dz < size.r * size.r * 2.2 && m.h <= tg + size.height + 2 && m.h >= tg - 1) {
                        target.alive = false;
                        this.kills++;
                        this.score += target.points;
                        this.explode(target.X, tg + 1, target.Z, 22);
                        this.onSound('boom');
                        continue;
                    }
                }
                if (m.life <= 0 || m.h <= PA.groundAt(m.X, m.Z)) {
                    if (m.h <= PA.groundAt(m.X, m.Z))
                        this.explode(m.X, m.h, m.Z, 8);
                    continue;
                }
                keep.push(m);
            }
            this.missiles = keep;
        }
        // Nearest alive target within range and close to the nose.
        findLock() {
            const p = this.plane;
            const sinY = Math.sin(p.yaw), cosY = Math.cos(p.yaw);
            let best = null;
            let bestD = MISSILE_RANGE;
            for (const t of this.mission.targets) {
                if (!t.alive)
                    continue;
                const dx = t.X - p.X, dz = t.Z - p.Z;
                const d = Math.hypot(dx, dz);
                if (d > bestD || d < 1)
                    continue;
                const ahead = (dx * sinY + dz * cosY) / d;
                const side = Math.acos(Math.max(-1, Math.min(1, ahead)));
                if (ahead > 0 && side < MISSILE_CONE) {
                    best = t;
                    bestD = d;
                }
            }
            return best;
        }
        // Free play: when the ground targets run low, more appear ahead of the plane.
        keepTargets() {
            const m = this.mission;
            m.targets = m.targets.filter(t => t.alive || t.Z > this.plane.Z - 150);
            const left = m.targets.filter(t => t.alive && t.kind !== 'flak').length;
            if (left < KEEP_AHEAD) {
                m.targets.push(...PA.spawnTargets(this.rand, this.plane.Z + 240, 6));
            }
        }
        checkRings() {
            for (const ring of this.mission.hoops) {
                if (ring.passed)
                    continue;
                const dx = this.plane.X - ring.X, dz = this.plane.Z - ring.Z, dh = this.plane.h - ring.h;
                if (dx * dx + dz * dz + dh * dh < ring.r * ring.r) {
                    ring.passed = true;
                    this.hoopsPassed++;
                    this.score += 100;
                    this.onSound('chime');
                }
            }
        }
        updateGuns(dt) {
            this.fireCool -= dt;
            if (!this.held.fire || this.fireCool > 0)
                return;
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
        updateShots(dt) {
            const keep = [];
            for (const s of this.shots) {
                s.vY -= PA.GRAVITY * dt;
                s.X += s.vX * dt;
                s.Z += s.vZ * dt;
                s.h += s.vY * dt;
                s.life -= dt;
                const ground = PA.groundAt(s.X, s.Z);
                if (s.life <= 0 || s.h <= ground) {
                    if (s.h <= ground)
                        this.dust(s.X, ground, s.Z);
                    continue;
                }
                let hit = false;
                for (const t of this.mission.targets) {
                    if (!t.alive)
                        continue;
                    const size = PA.SIZE[t.kind];
                    const dx = s.X - t.X, dz = s.Z - t.Z;
                    const tg = PA.groundAt(t.X, t.Z);
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
                if (!hit)
                    keep.push(s);
            }
            this.shots = keep;
        }
        updateFlak(dt) {
            const p = this.plane;
            for (const t of this.mission.targets) {
                if (t.kind !== 'flak' || !t.alive)
                    continue;
                t.cool -= dt;
                const dist = Math.hypot(p.X - t.X, p.Z - t.Z);
                if (t.cool > 0 || dist > 260 || p.h > 120)
                    continue;
                t.cool = 1.6 + this.rand() * 1.2;
                // Aim where the plane will be, with gravity allowed for.
                const gy = PA.groundAt(t.X, t.Z) + 2;
                const T = Math.max(0.4, Math.hypot(dist, p.h - gy) / FLAK_SPEED);
                const sinY = Math.sin(p.yaw), cosY = Math.cos(p.yaw);
                const aimX = p.X + p.vx * sinY * T;
                const aimZ = p.Z + p.vx * cosY * T;
                const aimY = p.h + p.vy * T;
                this.shells.push({
                    X: t.X, Z: t.Z, h: gy,
                    vX: (aimX - t.X) / T,
                    vZ: (aimZ - t.Z) / T,
                    vY: (aimY - gy) / T + 0.5 * PA.GRAVITY * T,
                    life: SHELL_LIFE,
                });
                this.onSound('thud');
            }
        }
        updateShells(dt) {
            const keep = [];
            const p = this.plane;
            for (const s of this.shells) {
                s.vY -= PA.GRAVITY * dt;
                s.X += s.vX * dt;
                s.Z += s.vZ * dt;
                s.h += s.vY * dt;
                s.life -= dt;
                if (s.life <= 0 || s.h <= PA.groundAt(s.X, s.Z))
                    continue;
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
        explode(X, h, Z, n) {
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
        dust(X, h, Z) {
            for (let i = 0; i < 4; i++) {
                this.puffs.push({
                    X, h, Z,
                    vX: (this.rand() - 0.5) * 10, vY: 4 + this.rand() * 4, vZ: (this.rand() - 0.5) * 10,
                    life: 0.4, max: 0.4, color: '#e6e0c8', size: 2,
                });
            }
        }
        updatePuffs(dt) {
            for (const p of this.puffs) {
                p.vY -= PA.GRAVITY * 0.5 * dt;
                p.X += p.vX * dt;
                p.Z += p.vZ * dt;
                p.h += p.vY * dt;
                p.life -= dt;
            }
            this.puffs = this.puffs.filter(p => p.life > 0);
        }
    }
    PA.Game = Game;
    function clamp(v) {
        return Math.max(-1, Math.min(1, v));
    }
})(PA || (PA = {}));
// Drawing the chase view. The camera sits behind and above the plane and turns
// with its heading and bank. The ground is a checkerboard in world space, so it
// stays put while the plane turns. Everything else is a sprite placed by perspective.
var PA;
(function (PA) {
    const FOCAL = 200; // pixels: how big a metre looks at distance one
    const CAM_BACK = 26; // metres behind the plane
    const CAM_UP = 8; // metres above the plane
    const TILT = 0.2; // radians the camera looks down
    const CELL = 40; // metres per ground square
    const RANGE = 16; // squares drawn each way from the camera
    const FOG_FAR = 900; // metres where the ground fades into the sky
    const PLANE_SCREEN_Y = 0.72;
    const PX_PER_M = 0.3; // sprite pixel size in metres (ground targets)
    const PLANE_SCALE = 2; // the plane sprite is drawn at a whole-number scale
    // Camera placement for each view: where it sits behind the plane, how high, and how far it looks down.
    const VIEWS = {
        chase: { back: CAM_BACK, up: CAM_UP, tilt: TILT, range: RANGE },
        top: { back: 4, up: 110, tilt: 1.35, range: 26 },
        cockpit: { back: -1.5, up: 1.4, tilt: 0.02, range: RANGE },
    };
    function makeCam(g) {
        const p = g.plane;
        const v = VIEWS[g.settings.view];
        const sinY = Math.sin(p.yaw), cosY = Math.cos(p.yaw);
        // Horizontal forward and right of the heading.
        const hx = sinY, hz = cosY;
        const rhx = cosY, rhz = -sinY;
        const px = p.X - hx * v.back;
        const py = p.h + v.up;
        const pz = p.Z - hz * v.back;
        // Tilt the view down, then roll it with the bank (not in the top view, which stays level).
        const tilt = v.tilt;
        const bankUsed = g.settings.view === 'top' ? 0 : p.bank;
        const ct = Math.cos(tilt), st = Math.sin(tilt);
        const fx = hx * ct, fy = -st, fz = hz * ct;
        const u0x = hx * st, u0y = ct, u0z = hz * st;
        const cb = Math.cos(bankUsed), sb = Math.sin(bankUsed);
        const rx = rhx * cb + u0x * sb, ry = u0y * sb, rz = rhz * cb + u0z * sb;
        const ux = u0x * cb - rhx * sb, uy = u0y * cb, uz = u0z * cb - rhz * sb;
        return { px, py, pz, rx, ry, rz, ux, uy, uz, fx, fy, fz };
    }
    // World point → screen point, or null if it is behind the camera.
    // With clampDepth, points just behind the camera are pulled to the near plane,
    // so the ground right under the camera still reaches the bottom of the screen.
    function project(c, X, h, Z, clampDepth = false) {
        const dx = X - c.px, dy = h - c.py, dz = Z - c.pz;
        let zc = dx * c.fx + dy * c.fy + dz * c.fz;
        if (zc < 1) {
            if (!clampDepth)
                return null;
            zc = 1;
        }
        const xc = dx * c.rx + dy * c.ry + dz * c.rz;
        const yc = dx * c.ux + dy * c.uy + dz * c.uz;
        return [PA.W / 2 + (FOCAL * xc) / zc, PA.H / 2 - (FOCAL * yc) / zc, zc];
    }
    function mix(a, b, t) {
        const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
        const ch = (s) => Math.round(s);
        const r = ch(((pa >> 16) & 255) * (1 - t) + ((pb >> 16) & 255) * t);
        const gg = ch(((pa >> 8) & 255) * (1 - t) + ((pb >> 8) & 255) * t);
        const bb = ch((pa & 255) * (1 - t) + (pb & 255) * t);
        return '#' + ((1 << 24) | (r << 16) | (gg << 8) | bb).toString(16).slice(1);
    }
    function sky(ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, PA.H);
        grad.addColorStop(0, PA.COL.skyTop);
        grad.addColorStop(0.6, PA.COL.skyBottom);
        grad.addColorStop(1, PA.COL.skyBottom);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, PA.W, PA.H);
        ctx.fillStyle = PA.COL.sun;
        ctx.beginPath();
        ctx.arc(330, 34, 14, 0, Math.PI * 2);
        ctx.fill();
    }
    // Ground: squares of the world, far ones first, each faded toward the sky.
    function ground(ctx, g, c) {
        const range = VIEWS[g.settings.view].range;
        const ci = Math.round(c.px / CELL), cj = Math.round(c.pz / CELL);
        const cells = [];
        for (let i = ci - range; i < ci + range; i++) {
            for (let j = cj - range; j < cj + range; j++) {
                const corners = [];
                let ok = true;
                for (const [a, b] of [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]]) {
                    const p = project(c, a * CELL, PA.groundAt(a * CELL, b * CELL), b * CELL, true);
                    if (!p) {
                        ok = false;
                        break;
                    }
                    corners.push(p);
                }
                if (!ok)
                    continue;
                const depth = (corners[0][2] + corners[2][2]) / 2;
                const base = ((i + j) & 1) === 0 ? PA.COL.ground : PA.COL.groundDark;
                cells.push({
                    pts: corners.map(p => [p[0], p[1]]),
                    depth,
                    color: mix(base, PA.COL.skyBottom, Math.min(1, depth / FOG_FAR)),
                });
            }
        }
        cells.sort((a, b) => b.depth - a.depth);
        for (const cell of cells) {
            ctx.fillStyle = cell.color;
            ctx.beginPath();
            ctx.moveTo(cell.pts[0][0], cell.pts[0][1]);
            for (let k = 1; k < 4; k++)
                ctx.lineTo(cell.pts[k][0], cell.pts[k][1]);
            ctx.closePath();
            ctx.fill();
        }
    }
    // A sprite standing on the ground at (X, Z), drawn larger the closer it is.
    function billboard(ctx, c, img, X, Z, base) {
        const p = project(c, X, base, Z);
        if (!p)
            return;
        const [sx, sy, zc] = p;
        const k = (FOCAL * PX_PER_M) / zc;
        const w = Math.max(1, Math.round(img.width * k));
        const h = Math.max(1, Math.round(img.height * k));
        ctx.drawImage(img, Math.round(sx - w / 2), Math.round(sy - h), w, h);
    }
    function targets(ctx, g, c) {
        const list = g.mission.targets
            .filter(t => t.alive)
            .map(t => ({ t, zc: (t.X - c.px) * c.fx + (PA.groundAt(t.X, t.Z) - c.py) * c.fy + (t.Z - c.pz) * c.fz }))
            .filter(o => o.zc > 1 && o.zc < FOG_FAR * 1.5)
            .sort((a, b) => b.zc - a.zc);
        for (const { t } of list) {
            billboard(ctx, c, PA.sprite(t.kind), t.X, t.Z, PA.groundAt(t.X, t.Z));
        }
    }
    function jumpers(ctx, g, c) {
        const img = PA.sprite('pilot');
        for (const j of g.jumpers) {
            billboard(ctx, c, img, j.X, j.Z, j.h);
        }
    }
    function missiles(ctx, g, c) {
        for (const m of g.missiles) {
            const p = project(c, m.X, m.h, m.Z);
            if (!p)
                continue;
            // A short trail behind the missile, then the head.
            const tail = project(c, m.X - m.vX * 0.05, m.h - m.vY * 0.05, m.Z - m.vZ * 0.05);
            if (tail) {
                ctx.strokeStyle = PA.COL.shell;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(tail[0], tail[1]);
                ctx.lineTo(p[0], p[1]);
                ctx.stroke();
            }
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(Math.round(p[0]) - 1, Math.round(p[1]) - 1, 3, 3);
        }
    }
    function rings(ctx, g, c) {
        // A ring stands across the heading (level right, then up), so the plane flies through it.
        const rhx = Math.cos(g.plane.yaw), rhz = -Math.sin(g.plane.yaw);
        for (const ring of g.mission.hoops) {
            const pts = [];
            for (let a = 0; a < 24; a++) {
                const t = (a / 24) * Math.PI * 2;
                const p = project(c, ring.X + rhx * Math.cos(t) * ring.r, ring.h + Math.sin(t) * ring.r, ring.Z + rhz * Math.cos(t) * ring.r);
                if (p)
                    pts.push([p[0], p[1]]);
            }
            if (pts.length < 24)
                continue;
            ctx.beginPath();
            ctx.moveTo(pts[0][0], pts[0][1]);
            for (let k = 1; k < pts.length; k++)
                ctx.lineTo(pts[k][0], pts[k][1]);
            ctx.closePath();
            ctx.lineWidth = 4;
            ctx.strokeStyle = PA.INK;
            ctx.stroke();
            ctx.lineWidth = 2;
            ctx.strokeStyle = ring.passed ? PA.COL.hoopDone : PA.COL.hoop;
            ctx.stroke();
        }
    }
    function shots(ctx, c, list, color, size) {
        ctx.fillStyle = color;
        for (const s of list) {
            const p = project(c, s.X, s.h, s.Z);
            if (p)
                ctx.fillRect(Math.round(p[0]), Math.round(p[1]), size, size);
        }
    }
    function puffs(ctx, g, c) {
        for (const p of g.puffs) {
            const k = Math.max(0, p.life / p.max);
            const q = project(c, p.X, p.h, p.Z);
            if (!q)
                continue;
            ctx.globalAlpha = Math.min(1, k * 1.4);
            ctx.fillStyle = p.color;
            const s = Math.max(1, Math.round((p.size * (0.5 + k) * FOCAL) / (q[2] * 0.6)));
            ctx.fillRect(Math.round(q[0]), Math.round(q[1]), s, s);
        }
        ctx.globalAlpha = 1;
    }
    // The plane is always in the same place on the screen; the world moves past it.
    function plane(ctx, g, c) {
        const p = g.plane;
        const img = PA.sprite(g.settings.mode === 'glider' ? 'glider' : 'plane');
        const shadow = project(c, p.X, PA.groundAt(p.X, p.Z), p.Z);
        if (shadow) {
            const rx = Math.max(3, Math.min(14, 26 - p.h * 0.2));
            ctx.fillStyle = 'rgba(47,45,61,0.22)';
            ctx.beginPath();
            ctx.ellipse(shadow[0], shadow[1], rx, 3, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        const sx = PA.W / 2, sy = PA.H * PLANE_SCREEN_Y;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(p.bank);
        ctx.drawImage(img, -Math.round((img.width * PLANE_SCALE) / 2), -Math.round((img.height * PLANE_SCALE) / 2), img.width * PLANE_SCALE, img.height * PLANE_SCALE);
        ctx.restore();
    }
    // Arrows for the four forces, from the plane. Drawn on the screen, not in the world.
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
    function forces(ctx, g) {
        const p = g.plane;
        const x = PA.W / 2, y = PA.H * PLANE_SCREEN_Y - 10;
        const k = 1.6;
        // Forces in the vertical plane; the screen shows them as up and down, sideways is the nose.
        arrow(ctx, x, y, 0, p.lift[1] * k, PA.COL.lift, 'lift');
        arrow(ctx, x, y, 0, p.weight[1] * k, PA.COL.weight, 'weight');
        arrow(ctx, x, y, 0, p.thrust[1] * k, PA.COL.thrust, 'thrust');
        arrow(ctx, x, y, p.drag[0] * k, 0, PA.COL.drag, 'drag');
    }
    function render(ctx, g) {
        ctx.imageSmoothingEnabled = false;
        const c = makeCam(g);
        sky(ctx);
        ground(ctx, g, c);
        if (g.settings.view !== 'cockpit' && g.mission.mode === 'glider')
            rings(ctx, g, c);
        targets(ctx, g, c);
        shots(ctx, c, g.shots, PA.COL.bullet, 2);
        shots(ctx, c, g.shells, PA.COL.shell, 2);
        missiles(ctx, g, c);
        jumpers(ctx, g, c);
        puffs(ctx, g, c);
        if (g.settings.view !== 'cockpit')
            plane(ctx, g, c);
        if (g.settings.view === 'cockpit')
            cockpit(ctx, g);
        if (g.settings.forces)
            forces(ctx, g);
    }
    PA.render = render;
    // The cockpit: canopy struts and a dark instrument panel along the bottom.
    function cockpit(ctx, g) {
        const panelTop = PA.H * 0.84;
        ctx.fillStyle = '#3b3950';
        ctx.fillRect(0, panelTop, PA.W, PA.H - panelTop);
        ctx.fillStyle = '#5b5876';
        ctx.fillRect(0, panelTop, PA.W, 2);
        // Gauges: a horizon bar that tilts with the bank, and a heading tick.
        const gx = PA.W / 2, gy = panelTop + 14;
        ctx.strokeStyle = '#fffdfa';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(gx, gy, 9, 0, Math.PI * 2);
        ctx.stroke();
        ctx.save();
        ctx.translate(gx, gy);
        ctx.rotate(-g.plane.bank);
        ctx.beginPath();
        ctx.moveTo(-9, 0);
        ctx.lineTo(9, 0);
        ctx.stroke();
        ctx.restore();
        // Canopy struts at the edges.
        ctx.strokeStyle = '#2f2d3d';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(0, panelTop);
        ctx.lineTo(PA.W * 0.22, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(PA.W, panelTop);
        ctx.lineTo(PA.W * 0.78, 0);
        ctx.stroke();
    }
})(PA || (PA = {}));
// Boot: the page, the controls (drag or joystick, action buttons), the fading
// settings gear, the HUD, the settings drawer, opt-in errors, and the frame loop.
var PA;
(function (PA) {
    const SETTINGS_KEY = 'pa_warthog.settings';
    const DEFAULTS = { mode: 'jet', control: 'drag', view: 'chase', sound: 1, forces: 0, showErrors: 0 };
    const VIEW_ORDER = ['chase', 'top', 'cockpit'];
    const TUTORIAL_KEY = 'pa_warthog.tutorialSeen';
    const DEAD = 0.06; // a small dead zone around the centre
    const GEAR_SECONDS = 2000; // the settings gear fades after this long untouched
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
    // Input sources. The one in use wins: drag, then joystick, then keys.
    const keys = { up: false, down: false, left: false, right: false };
    let dragAxes = null;
    let stickAxes = null;
    let dragId = -1;
    let stickId = -1;
    function applyBodyClasses() {
        document.body.classList.toggle('glider', settings.mode === 'glider');
        document.body.classList.toggle('jet', settings.mode === 'jet');
        document.body.classList.toggle('joy', settings.control === 'stick');
    }
    function renderSettings() {
        document.querySelectorAll('.seg').forEach(seg => {
            const key = seg.dataset.key;
            const v = String(settings[key]);
            seg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
        });
        $('showErrors').checked = settings.showErrors === 1;
        applyBodyClasses();
        renderErrors();
    }
    function onSeg(key, value) {
        if (key === 'mode' || key === 'control' || key === 'view') {
            settings[key] = value;
        }
        else {
            settings[key] = +value;
        }
        if (key === 'sound')
            sound.enabled = settings.sound === 1;
        saveSettings();
        renderSettings();
        if (key === 'mode')
            restart();
        if (key === 'control') {
            dragAxes = null;
            stickAxes = null;
            dragId = -1;
            stickId = -1;
        }
    }
    function restart() {
        game.settings = settings;
        game.newFlight(Math.floor(Math.random() * 100000));
        $('overlay').hidden = true;
    }
    // Capture can fail for a pointer the browser no longer tracks; that is not a reason to stop.
    function capture(el, id) {
        try {
            el.setPointerCapture(id);
        }
        catch (e) {
            // Ignored: the pointer still reaches the element through its events.
        }
    }
    // ---- Keys -------------------------------------------------------------
    const keyMap = {
        ArrowUp: 'up', KeyW: 'up',
        ArrowDown: 'down', KeyS: 'down',
        ArrowLeft: 'left', KeyA: 'left',
        ArrowRight: 'right', KeyD: 'right',
        Space: 'fire',
        ShiftLeft: 'boost', ShiftRight: 'boost',
        KeyM: 'missile',
        KeyV: 'view',
    };
    function bindKeys() {
        window.addEventListener('keydown', e => {
            const k = keyMap[e.code];
            if (!k)
                return;
            e.preventDefault();
            if (k === 'view') {
                cycleView();
            }
            else if (k === 'fire' || k === 'boost' || k === 'missile') {
                sound.unlock();
                game.held[k] = true;
            }
            else {
                keys[k] = true;
            }
        });
        window.addEventListener('keyup', e => {
            const k = keyMap[e.code];
            if (!k)
                return;
            if (k === 'fire' || k === 'boost' || k === 'missile')
                game.held[k] = false;
            else
                keys[k] = false;
        });
        window.addEventListener('blur', () => {
            keys.up = keys.down = keys.left = keys.right = false;
            game.held.fire = game.held.boost = game.held.missile = false;
            dragAxes = null;
            stickAxes = null;
        });
    }
    // The camera views in turn: chase, top-down, cockpit (also the V key).
    function cycleView() {
        const next = VIEW_ORDER[(VIEW_ORDER.indexOf(settings.view) + 1) % VIEW_ORDER.length];
        settings.view = next;
        saveSettings();
        renderSettings();
    }
    // ---- Drag relative to the centre of the screen ------------------------
    const IGNORE = '.actions, .stick, #gear, .gearHot, .drawer, .errorsPanel, .tutorial, button, input, label';
    function dz(v) {
        if (Math.abs(v) < DEAD)
            return 0;
        return Math.sign(v) * (Math.abs(v) - DEAD) / (1 - DEAD);
    }
    function axesFromPoint(x, y) {
        const nx = Math.max(-1, Math.min(1, (x - window.innerWidth / 2) / (window.innerWidth / 2)));
        const ny = Math.max(-1, Math.min(1, (y - window.innerHeight / 2) / (window.innerHeight / 2)));
        return { yaw: dz(nx), pitch: dz(-ny) };
    }
    function bindDrag() {
        const play = $('play');
        play.addEventListener('pointerdown', e => {
            if (settings.control !== 'drag')
                return;
            if (e.target.closest(IGNORE))
                return;
            sound.unlock();
            dragId = e.pointerId;
            capture(play, e.pointerId);
            dragAxes = axesFromPoint(e.clientX, e.clientY);
        });
        play.addEventListener('pointermove', e => {
            if (e.pointerId === dragId)
                dragAxes = axesFromPoint(e.clientX, e.clientY);
        });
        const end = (e) => {
            if (e.pointerId === dragId) {
                dragId = -1;
                dragAxes = null;
            }
        };
        play.addEventListener('pointerup', end);
        play.addEventListener('pointercancel', end);
    }
    // ---- Joystick (lower left) --------------------------------------------
    function bindStick() {
        const stick = $('stick');
        const knob = $('knob');
        const move = (e) => {
            const r = stick.getBoundingClientRect();
            const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
            const radius = r.width / 2;
            let dx = (e.clientX - cx) / radius, dy = (e.clientY - cy) / radius;
            const len = Math.hypot(dx, dy);
            if (len > 1) {
                dx /= len;
                dy /= len;
            }
            knob.style.transform = `translate(${dx * radius * 0.6}px, ${dy * radius * 0.6}px)`;
            stickAxes = { yaw: dz(dx), pitch: dz(-dy) };
        };
        stick.addEventListener('pointerdown', e => {
            sound.unlock();
            stickId = e.pointerId;
            capture(stick, e.pointerId);
            move(e);
        });
        stick.addEventListener('pointermove', e => {
            if (e.pointerId === stickId)
                move(e);
        });
        const end = (e) => {
            if (e.pointerId !== stickId)
                return;
            stickId = -1;
            stickAxes = null;
            knob.style.transform = '';
        };
        stick.addEventListener('pointerup', end);
        stick.addEventListener('pointercancel', end);
    }
    // ---- Action buttons (lower right) -------------------------------------
    function bindActions() {
        document.querySelectorAll('.actions button').forEach(b => {
            const k = b.dataset.k;
            b.addEventListener('pointerdown', e => {
                e.preventDefault();
                sound.unlock();
                capture(b, e.pointerId);
                game.held[k] = true;
                wakeGear();
            });
            const release = () => { game.held[k] = false; };
            b.addEventListener('pointerup', release);
            b.addEventListener('pointercancel', release);
            b.addEventListener('lostpointercapture', release);
        });
    }
    // ---- Settings gear: fades in the jet view, after two seconds untouched ---
    let gearTimer = 0;
    function drawerOpen() {
        return !$('drawer').hidden;
    }
    function wakeGear() {
        const gear = $('gear');
        gear.classList.add('awake');
        window.clearTimeout(gearTimer);
        if (!drawerOpen()) {
            gearTimer = window.setTimeout(() => gear.classList.remove('awake'), GEAR_SECONDS);
        }
    }
    function bindGear() {
        const gear = $('gear');
        const drawer = $('drawer');
        const setOpen = (open) => {
            drawer.hidden = !open;
            gear.setAttribute('aria-expanded', String(open));
            if (open) {
                window.clearTimeout(gearTimer);
                gear.classList.add('awake');
            }
            else {
                wakeGear();
            }
        };
        gear.addEventListener('click', () => setOpen(drawer.hidden));
        $('closeDrawer').addEventListener('click', () => setOpen(false));
        $('gearHot').addEventListener('pointerdown', e => {
            e.preventDefault();
            wakeGear();
        });
        wakeGear();
    }
    // ---- HUD and messages -------------------------------------------------
    function hud() {
        const g = game;
        const p = g.plane;
        $('score').textContent = String(g.score);
        $('kills').textContent = String(g.kills);
        $('hoops').textContent = g.mission.hoops.length ? g.hoopsPassed + ' / ' + g.mission.hoops.length : '—';
        $('hull').style.width = Math.max(0, g.hull) + '%';
        $('missile').textContent = g.missileCool > 0 ? Math.ceil(g.missileCool) + 's' : 'ready';
        $('speed').textContent = Math.round(p.speed * 1.94) + ' kt';
        $('alt').textContent = Math.round(p.h - PA.groundAt(p.X, p.Z)) + ' m';
        $('aoa').textContent = (p.alpha * 180 / Math.PI).toFixed(0) + '°';
        $('stall').hidden = !p.stalled || g.phase !== 'flying';
    }
    function message() {
        const g = game;
        const p = g.plane;
        if (g.phase === 'crashed')
            return 'Ejected! The parachute is open. Back in the air soon.';
        if (g.phase !== 'flying')
            return '';
        if (p.stalled)
            return 'Too steep! Ease the nose down to get the air flowing.';
        if (g.settings.mode === 'glider')
            return 'Fly through the rings.';
        if (p.vy < -2 && p.h - PA.groundAt(p.X, p.Z) < 25)
            return 'Losing height: nose up or hold BOOST.';
        return 'Drag from the middle to steer. FIRE the gun, MISSILE for a target ahead.';
    }
    function overlay() {
        const g = game;
        const box = $('overlay');
        if (g.phase !== 'landed') {
            box.hidden = true;
            return;
        }
        box.hidden = false;
        $('ovTitle').textContent = 'Landed!';
        $('ovText').textContent = 'Rings flown: ' + g.hoopsPassed + ' of ' + g.mission.hoops.length + '.';
    }
    // ---- First-run tutorial (shown once per device) -----------------------
    function tutorialSeen() {
        try {
            return localStorage.getItem(TUTORIAL_KEY) === '1';
        }
        catch (e) {
            return true;
        }
    }
    function showTutorial() {
        if (tutorialSeen())
            return;
        const card = $('tutorial');
        card.hidden = false;
        card.addEventListener('pointerdown', () => {
            card.hidden = true;
            try {
                localStorage.setItem(TUTORIAL_KEY, '1');
            }
            catch (e) {
                // Not saved on this device: it may show again next time, which is fine.
            }
        }, { once: true });
    }
    // ---- Frame loop -------------------------------------------------------
    function resolveAxes() {
        if (dragAxes)
            return dragAxes;
        if (stickAxes)
            return stickAxes;
        const yaw = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
        const pitch = (keys.up ? 1 : 0) - (keys.down ? 1 : 0);
        return { yaw, pitch };
    }
    let last = 0;
    let hudTimer = 0;
    function frame(now) {
        const dt = last ? (now - last) / 1000 : 0;
        last = now;
        try {
            game.axes = resolveAxes();
            game.update(dt);
            const ctx = $('view').getContext('2d');
            if (ctx)
                PA.render(ctx, game);
            sound.setThrottle(game.plane.throttle, game.phase === 'flying' && game.settings.mode === 'jet');
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
        game.settings = settings;
        game.onSound = name => sound.play(name);
        renderSettings();
        window.addEventListener('error', e => logError(e.message));
        window.addEventListener('unhandledrejection', e => logError('Promise: ' + String(e.reason)));
        document.querySelectorAll('.seg button').forEach(b => {
            b.addEventListener('click', () => onSeg(b.parentElement.dataset.key, b.dataset.v || '0'));
        });
        $('showErrors').addEventListener('change', e => {
            settings.showErrors = e.target.checked ? 1 : 0;
            saveSettings();
            renderErrors();
        });
        $('restart').addEventListener('click', () => { restart(); $('drawer').hidden = true; });
        $('again').addEventListener('click', () => restart());
        $('version').textContent = 'Version ' + PA.VERSION;
        bindKeys();
        showTutorial();
        bindDrag();
        bindStick();
        bindActions();
        bindGear();
        renderErrors();
        requestAnimationFrame(frame);
    }
    // Only start the page in a browser (the flight test loads this file in Node).
    if (typeof document !== 'undefined')
        boot();
})(PA || (PA = {}));
