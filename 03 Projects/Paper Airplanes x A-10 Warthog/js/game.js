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
// The painters live in src/assets/ (one file per family of things). No image
// files are loaded anywhere in the game.
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
    // Every sprite by name. The asset files add their painters here.
    PA.PAINT = {};
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
    // Shade a hex colour toward dark (f = 1 is unchanged).
    function shadeHex(hex, f) {
        const n = parseInt(hex.slice(1), 16);
        const ch = (v) => Math.round(v * f);
        const r = ch((n >> 16) & 255), g = ch((n >> 8) & 255), b = ch(n & 255);
        return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
    }
    PA.shadeHex = shadeHex;
    const stackCache = {};
    // The same sprite built as a stack: four slices, each one pixel lower than the one above,
    // the lower slices darker. The top slice is the full colour, so the edge of the stack shows.
    function stackedSprite(name, layers = 4, step = 1) {
        if (stackCache[name])
            return stackCache[name];
        const paint = PA.PAINT[name];
        if (!paint)
            throw new Error('no sprite named ' + name);
        const base = new Painter();
        paint(base);
        const stacked = g => {
            for (let l = 0; l < layers; l++) {
                const top = l === layers - 1;
                const f = top ? 1 : 0.45 + 0.45 * (l / (layers - 1));
                const dy = (layers - 1 - l) * step;
                for (const o of base.ops)
                    g.r(o.x, o.y + dy, o.w, o.h, shadeHex(o.c, f));
            }
        };
        const s = buildSprite(stacked);
        stackCache[name] = s;
        return s;
    }
    PA.stackedSprite = stackedSprite;
    const cache = {};
    // Built the first time it is needed (so the file also loads without a page).
    function sprite(name) {
        if (cache[name])
            return cache[name];
        const paint = PA.PAINT[name];
        if (!paint)
            throw new Error('no sprite named ' + name);
        const s = buildSprite(paint);
        cache[name] = s;
        return s;
    }
    PA.sprite = sprite;
})(PA || (PA = {}));
// Aircraft: the player's plane, the paper glider, the pilot under a parachute, and parked jets.
var PA;
(function (PA) {
    PA.PAINT['plane'] = g => {
        // A-10 Warthog seen from behind: wide wing, twin tails, the cockpit up top, two engines.
        g.r(0, 7, 22, 2, '#c8cfd6') // wing
            .r(0, 8, 3, 1, '#6b7480').r(19, 8, 3, 1, '#6b7480') // wing tips
            .r(9, 2, 4, 9, '#c8cfd6') // fuselage
            .r(9, 2, 1, 9, '#f5fbff') // light side
            .r(10, 1, 2, 2, '#8fd3f0') // canopy
            .r(5, 1, 2, 7, '#c8cfd6').r(15, 1, 2, 7, '#c8cfd6') // twin tails
            .r(5, 0, 2, 1, '#6b7480').r(15, 0, 2, 1, '#6b7480')
            .r(7, 9, 2, 3, '#6b7480').r(13, 9, 2, 3, '#6b7480') // engines
            .r(7, 12, 2, 1, '#ffb02e').r(13, 12, 2, 1, '#ffb02e'); // exhaust glow
    };
    PA.PAINT['glider'] = g => {
        // Classic paper dart seen from behind: a flat sheet with a folded nose.
        g.r(0, 6, 20, 2, '#fffdfa')
            .r(0, 6, 20, 1, '#f5fbff')
            .r(9, 2, 2, 9, '#fffdfa')
            .p(10, 1, '#fffdfa')
            .r(0, 8, 20, 1, '#d6d0f0');
    };
    PA.PAINT['pilot'] = g => {
        // A pilot under a parachute canopy.
        g.r(1, 0, 9, 3, '#ffb3a7')
            .r(1, 0, 9, 1, '#ff9e8a')
            .p(2, 3, '#6b7480').p(8, 3, '#6b7480')
            .r(4, 4, 3, 3, '#f5d7b0')
            .r(4, 7, 3, 2, '#3d8bff');
    };
    // A parked fighter on the airfield, seen from the side and slightly from above.
    PA.PAINT['jet'] = g => {
        g.r(0, 4, 16, 2, '#e8eef2')
            .r(12, 2, 3, 2, '#e8eef2')
            .r(6, 5, 5, 2, '#b9c0c8')
            .r(3, 1, 2, 3, '#8fd3f0')
            .r(4, 6, 2, 1, '#6b7480')
            .r(14, 3, 2, 1, '#6b7480');
    };
})(PA || (PA = {}));
(function (PA) {
    // An enemy fighter, seen from the side: dark red, swept wings, a nose cone.
    PA.PAINT['fighter'] = g => {
        g.r(0, 4, 16, 2, '#7a3b44')
            .r(9, 2, 4, 3, '#a85560')
            .r(4, 5, 6, 2, '#c97080')
            .r(12, 3, 4, 1, '#7a3b44')
            .p(15, 4, '#2f2d3d')
            .r(2, 2, 2, 2, '#7a3b44')
            .p(12, 2, '#8fd3f0');
    };
    // An allied fighter: blue with a white star on the tail.
    PA.PAINT['ally'] = g => {
        g.r(0, 4, 16, 2, '#3d8bff')
            .r(9, 2, 4, 3, '#8fb8f5')
            .r(4, 5, 6, 2, '#5b9fff')
            .r(12, 3, 4, 1, '#3d8bff')
            .p(15, 4, '#2f2d3d')
            .r(2, 2, 2, 2, '#3d8bff')
            .p(3, 2, '#fffdfa');
    };
})(PA || (PA = {}));
// The A-10 Warthog, drawn at its own detail: seen from behind, on a 66-unit grid.
// The drawing is painted at several crisp sizes (not stretched), and each size is
// stacked: thin slices one above another, the lower ones shaded darker, so the body reads solid.
var PA;
(function (PA) {
    const DESIGN_W = 66;
    const DESIGN_H = 40;
    const LAYERS = 4; // slices in the stack
    const LIGHT = 2; // how far each slice steps down (design units, before scaling)
    // Shade a hex colour toward dark (f = 1 is unchanged).
    const shade = PA.shadeHex;
    // The drawing itself, in design units: x across (0 … 66), y down (0 … 40).
    // The A-10 from behind: a broad body, a thick high wing, two fins set wide apart, and
    // the two engines under the wing, each with its exhaust.
    function design(g, dy, f) {
        const c = (hex) => shade(hex, f);
        const body = c('#c8cfd6'), light = c('#eef3f6'), mid = c('#9aa4ae'), dark = c('#4d5560');
        const glass = c('#9fdcf5'), hot = c('#ffb02e'), tail = c('#b8c1ca');
        const R = (x, y, w, h, col) => g.r(x, y + dy, w, h, col);
        // Fins: two tall, leaning out, with dark tips.
        R(14, 7, 5, 13, tail);
        R(13, 4, 4, 4, dark);
        R(15, 6, 2, 1, light);
        R(47, 7, 5, 13, tail);
        R(49, 4, 4, 4, dark);
        R(49, 6, 2, 1, light);
        // Wing: a thick, straight, high wing with dark tips.
        R(3, 18, 60, 6, body);
        R(3, 18, 60, 1, light);
        R(3, 22, 60, 2, mid);
        R(2, 19, 2, 5, dark);
        R(62, 19, 2, 5, dark);
        // Fuselage: a broad body, lit on the left, shaded on the right, with a dark belly.
        R(26, 6, 14, 24, body);
        R(26, 6, 4, 24, light);
        R(37, 6, 3, 24, mid);
        R(27, 28, 12, 2, dark);
        // Cockpit canopy.
        R(28, 8, 10, 5, glass);
        R(29, 9, 3, 2, light);
        // Camouflage: a few darker patches on the body and the wing.
        R(31, 15, 3, 2, mid);
        R(34, 19, 2, 1, mid);
        R(8, 20, 4, 1, mid);
        R(55, 20, 4, 1, mid);
        // Engine nacelles, each with a dark intake and a glowing exhaust.
        R(20, 24, 7, 11, dark);
        R(39, 24, 7, 11, dark);
        R(21, 25, 5, 3, mid);
        R(40, 25, 5, 3, mid);
        R(22, 33, 5, 2, hot);
        R(41, 33, 5, 2, hot);
        // The nose underneath, a dark line.
        R(29, 30, 8, 1, mid);
    }
    // The design at a whole-size scale k, stacked. Each layer is the same drawing; lower
    // layers sit a little lower and are shaded darker.
    function stackedAt(k) {
        return (g) => {
            for (let layer = 0; layer < LAYERS; layer++) {
                const top = layer === LAYERS - 1;
                const sub = new PA.Painter();
                const f = top ? 1 : 0.42 + 0.5 * (layer / (LAYERS - 1));
                design(sub, (LAYERS - 1 - layer) * LIGHT, f);
                for (const o of sub.ops) {
                    const x0 = Math.round(o.x * k), y0 = Math.round(o.y * k);
                    const x1 = Math.round((o.x + o.w) * k), y1 = Math.round((o.y + o.h) * k);
                    g.r(x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0), o.c);
                }
            }
        };
    }
    // The four whole-step sizes: about 25% of the screen width (about 100 px) up to 33% (about 132 px).
    PA.PLANE_SCALES = [1.6, 1.78, 1.94, 2.1];
    const planeCache = [];
    // The plane sprite for a turn tightness of 0 (straight) to 1 (hardest turn).
    function planeSprite(tight) {
        const i = Math.max(0, Math.min(PA.PLANE_SCALES.length - 1, Math.round(tight * (PA.PLANE_SCALES.length - 1))));
        if (!planeCache[i])
            planeCache[i] = PA.buildSprite(stackedAt(PA.PLANE_SCALES[i]));
        return { img: planeCache[i], k: PA.PLANE_SCALES[i] };
    }
    PA.planeSprite = planeSprite;
})(PA || (PA = {}));
// Ground vehicles and guns: tanks, armoured carriers, trucks, a fuel tanker, a SAM launcher, flak.
var PA;
(function (PA) {
    // Main battle tank, side view, facing right.
    PA.PAINT['tank_mbt'] = g => {
        g.r(0, 8, 20, 2, '#4d5560') // tracks
            .p(2, 9, '#f5fbff').p(6, 9, '#f5fbff').p(10, 9, '#f5fbff').p(14, 9, '#f5fbff')
            .r(1, 5, 18, 3, '#8a9470') // hull
            .r(6, 2, 8, 3, '#9aa77a') // turret
            .p(9, 1, '#9aa77a') // hatch
            .r(13, 3, 9, 1, '#4d5560'); // long gun
    };
    // Light tank or scout vehicle.
    PA.PAINT['tank_light'] = g => {
        g.r(0, 6, 14, 2, '#4d5560')
            .p(2, 7, '#f5fbff').p(8, 7, '#f5fbff')
            .r(1, 3, 12, 3, '#b9c79a')
            .r(4, 1, 5, 2, '#c9d4a8')
            .r(8, 2, 5, 1, '#4d5560');
    };
    // Armoured personnel carrier: a boxy hull with wheels.
    PA.PAINT['apc'] = g => {
        g.r(0, 6, 16, 2, '#4d5560')
            .p(2, 7, '#f5fbff').p(12, 7, '#f5fbff')
            .r(0, 2, 16, 4, '#9aa77a')
            .r(2, 1, 5, 1, '#9aa77a')
            .r(10, 3, 3, 1, '#8fd3f0');
    };
    // Cargo truck, facing right.
    PA.PAINT['truck'] = g => {
        g.r(0, 1, 9, 4, '#e6c48a')
            .r(9, 2, 5, 3, '#e6c48a')
            .p(11, 3, '#8fd3f0')
            .r(2, 5, 2, 2, '#6b7480').r(10, 5, 2, 2, '#6b7480');
    };
    // Fuel tanker: a cab and a red tank trailer.
    PA.PAINT['fuel'] = g => {
        g.r(0, 3, 4, 4, '#e6c48a')
            .p(2, 4, '#8fd3f0')
            .r(4, 3, 12, 4, '#f5fbff')
            .r(4, 5, 12, 1, '#ff6b6b')
            .r(2, 6, 2, 2, '#6b7480').r(9, 6, 2, 2, '#6b7480').r(14, 6, 2, 2, '#6b7480');
    };
    // Surface-to-air missile launcher with a radar dish and four tubes.
    PA.PAINT['sam'] = g => {
        g.r(0, 9, 22, 3, '#8a9470') // carrier
            .r(2, 10, 3, 2, '#4d5560').r(15, 10, 3, 2, '#4d5560') // wheels
            .r(4, 5, 10, 4, '#b9c79a') // launcher body
            .p(5, 4, '#f5fbff').p(8, 4, '#f5fbff').p(11, 4, '#f5fbff').p(14, 4, '#f5fbff')
            .r(16, 1, 1, 8, '#4d5560') // radar mast
            .r(13, 0, 7, 2, '#f5fbff'); // dish
    };
    // Anti-aircraft gun on a mount.
    PA.PAINT['flak'] = g => {
        g.r(0, 5, 6, 3, '#e89a9a')
            .r(1, 0, 1, 6, '#6b7480').r(3, 0, 1, 6, '#6b7480');
    };
})(PA || (PA = {}));
// Buildings: farm houses and barns, town houses, city towers, barracks and a hangar.
var PA;
(function (PA) {
    // A farm house with a red roof, a door and a window.
    PA.PAINT['farm'] = g => {
        g.r(2, 7, 12, 6, '#f5d7b0')
            .r(3, 5, 10, 2, '#c85b4a')
            .r(4, 3, 8, 2, '#c85b4a')
            .r(5, 1, 6, 2, '#c85b4a')
            .r(7, 10, 2, 3, '#6b4a3a')
            .p(4, 8, '#8fd3f0');
    };
    // A barn: tall red walls with a grey roof.
    PA.PAINT['barn'] = g => {
        g.r(0, 6, 18, 7, '#c85b4a')
            .r(1, 3, 16, 3, '#6b7480')
            .r(2, 1, 14, 2, '#6b7480')
            .r(7, 8, 4, 5, '#f5d7b0');
    };
    // A city tower block with a grid of lit windows.
    PA.PAINT['city'] = g => {
        g.r(2, 2, 10, 20, '#c9d2dc')
            .r(2, 2, 2, 20, '#b0bcc8');
        for (let y = 4; y < 20; y += 3) {
            for (let x = 5; x < 11; x += 3)
                g.p(x, y, '#8fd3f0');
        }
    };
    // Army barracks: a long low building with a door row.
    PA.PAINT['barracks'] = g => {
        g.r(0, 4, 22, 6, '#8a9470')
            .r(0, 3, 22, 1, '#6b7480')
            .r(2, 6, 3, 2, '#4d5560').r(9, 6, 3, 2, '#4d5560').r(16, 6, 3, 2, '#4d5560')
            .p(5, 5, '#f5fbff').p(12, 5, '#f5fbff');
    };
    // Aircraft hangar: a curved roof over a large door.
    PA.PAINT['hangar'] = g => {
        g.r(0, 6, 24, 6, '#b9c0c8')
            .r(2, 4, 20, 2, '#b9c0c8')
            .r(5, 2, 14, 2, '#b9c0c8')
            .r(7, 7, 10, 5, '#6b7480');
    };
})(PA || (PA = {}));
// Ships on the sea and railway cars on the track.
var PA;
(function (PA) {
    // A warship seen from the side: a grey hull, a bridge and a mast.
    PA.PAINT['ship'] = g => {
        g.r(0, 6, 26, 3, '#6b7480')
            .r(1, 5, 24, 1, '#8a9470')
            .r(16, 2, 6, 4, '#f5fbff')
            .p(18, 3, '#8fd3f0').p(20, 3, '#8fd3f0')
            .r(19, 0, 1, 2, '#4d5560');
    };
    // A railway wagon.
    PA.PAINT['rail'] = g => {
        g.r(0, 2, 12, 4, '#8a6a4a')
            .r(0, 1, 12, 1, '#6b4a3a')
            .r(2, 6, 2, 2, '#4d5560').r(8, 6, 2, 2, '#4d5560');
    };
})(PA || (PA = {}));
// Things that are only to look at: trees. They have no hit box and cannot be shot.
var PA;
(function (PA) {
    // A round-topped tree with a trunk.
    PA.PAINT['tree'] = g => {
        g.r(3, 8, 2, 4, '#6b4a3a')
            .r(1, 3, 6, 6, '#7bd389')
            .r(2, 1, 4, 3, '#8fe0bd')
            .p(2, 6, '#5fb870').p(6, 4, '#5fb870');
    };
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
// The land and the sea, and what is on them. Same seed, same start.
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
    PA.SEA_X = 1300; // east of this is the sea
    PA.ROAD_X = -120; // the main road runs north along this line
    PA.ROAD_W = 7; // half its width, metres
    // Height of the ground in metres at ground position (X, Z). The sea is at zero.
    function groundAt(X, Z) {
        if (X > PA.SEA_X)
            return 0;
        return Math.max(0, 4 + 3.5 * Math.sin(X / 210) + 1.5 * Math.sin(Z / 61 + 2));
    }
    PA.groundAt = groundAt;
    function isSea(X) {
        return X > PA.SEA_X;
    }
    PA.isSea = isSea;
    // What the ground looks like: farm fields, town, army land, or the sea.
    // A repeatable pseudo-random number from a cell (so the same place always looks the same).
    function cellNoise(i, j, salt) {
        let h = (i * 374761393 + j * 668265263 + salt * 2246822519) | 0;
        h = Math.imul(h ^ (h >>> 13), 1274126177);
        return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    }
    PA.cellNoise = cellNoise;
    // Lakes: some 200 m cells on land are water.
    function isLake(X, Z) {
        if (X > PA.SEA_X)
            return false;
        const i = Math.floor(X / 200), j = Math.floor(Z / 200);
        return cellNoise(i, j, 7) > 0.86 && Math.abs(X - PA.ROAD_X) > 30;
    }
    PA.isLake = isLake;
    // Forest: some cells of farm and army land have trees.
    function isForest(X, Z) {
        const i = Math.floor(X / 120), j = Math.floor(Z / 120);
        return cellNoise(i, j, 11) > 0.7 && Math.abs(X - PA.ROAD_X) > 14;
    }
    PA.isForest = isForest;
    function biomeAt(X, Z) {
        if (X > PA.SEA_X)
            return 'sea';
        if (isLake(X, Z))
            return 'lake';
        if (isForest(X, Z))
            return 'forest';
        const cell = Math.floor((X + 900) / 320) + Math.floor(Z / 260) * 3;
        const k = ((cell % 4) + 4) % 4;
        if (k === 0)
            return 'farm';
        if (k === 1)
            return 'town';
        return 'army';
    }
    PA.biomeAt = biomeAt;
    // Where a thing is in the air, or its ground height when it is on the ground.
    function altOf(t) {
        return t.h !== undefined ? t.h : groundAt(t.X, t.Z);
    }
    PA.altOf = altOf;
    PA.KINDS = {
        tank_mbt: { r: 2.6, height: 2.6, hp: 2, points: 100, group: 'army' },
        tank_light: { r: 2.2, height: 2.0, hp: 1, points: 60, group: 'army' },
        apc: { r: 2.4, height: 2.2, hp: 1, points: 50, group: 'army' },
        truck: { r: 2.0, height: 2.6, hp: 1, points: 40, group: 'farm' },
        fuel: { r: 2.6, height: 2.6, hp: 1, points: 60, group: 'airfield' },
        sam: { r: 3.0, height: 3.5, hp: 2, points: 150, group: 'army', gun: { range: 520, cool: 4, speed: 150 } },
        flak: { r: 2.0, height: 3.0, hp: 1, points: 80, group: 'army', gun: { range: 260, cool: 2, speed: 120 } },
        farm: { r: 4.0, height: 4.0, hp: 1, points: 30, group: 'farm' },
        barn: { r: 4.0, height: 3.5, hp: 1, points: 40, group: 'farm' },
        city: { r: 3.0, height: 12, hp: 3, points: 120, group: 'town' },
        barracks: { r: 5.0, height: 3.0, hp: 2, points: 120, group: 'army' },
        hangar: { r: 6.0, height: 5.0, hp: 3, points: 200, group: 'airfield' },
        jet: { r: 3.0, height: 2.5, hp: 1, points: 150, group: 'airfield' },
        ship: { r: 6.0, height: 3.0, hp: 4, points: 250, group: 'port' },
        rail: { r: 2.5, height: 2.5, hp: 1, points: 40, group: 'rail' },
        fighter: { r: 4.5, height: 3.0, hp: 1, points: 200, group: 'air', gun: { range: 380, cool: 2.6, speed: 230 } },
        ally: { r: 3.0, height: 2.5, hp: 1, points: -300, group: 'air' },
    };
    // Which kinds drive along the road (and how fast, metres per second).
    PA.DRIVES = { tank_mbt: 3, tank_light: 6, apc: 6, truck: 9, fuel: 7 };
    // Is this a mission target? Ground places and vehicles count; ships, rail and the air do not.
    function isObjective(t) {
        if (t.faction)
            return false;
        const group = PA.KINDS[t.kind].group;
        return group === 'army' || group === 'farm' || group === 'town';
    }
    PA.isObjective = isObjective;
    function target(kind, X, Z, rand) {
        const info = PA.KINDS[kind];
        return {
            kind, X, Z, alive: true, points: info.points, hp: info.hp,
            cool: info.gun ? 1 + rand() * info.gun.cool : 0,
        };
    }
    PA.target = target;
    // Clusters of things in front of baseZ. Each cluster is one kind of place.
    function spawnTargets(rand, baseZ, count) {
        const out = [];
        for (let i = 0; i < count; i++) {
            const Z = baseZ + i * 120 + rand() * 60;
            const roll = rand();
            const landX = (rand() - 0.5) * 900;
            // Some vehicles drive along the road, north or south.
            const driver = (kind, X, Z) => {
                const t = target(kind, X, Z, rand);
                if (PA.DRIVES[kind] !== undefined && rand() < 0.5)
                    t.vZ = (rand() < 0.5 ? -1 : 1) * PA.DRIVES[kind];
                return t;
            };
            if (roll < 0.32) {
                // Army: tanks, carriers, a SAM site or a flak gun.
                const X = landX;
                out.push(driver('tank_mbt', PA.ROAD_X + 4, Z));
                out.push(driver(rand() < 0.5 ? 'tank_light' : 'apc', PA.ROAD_X - 6, Z + 4));
                if (rand() < 0.5)
                    out.push(target('sam', X - 10, Z + 10, rand));
                else
                    out.push(target('flak', X + 14, Z - 6, rand));
            }
            else if (roll < 0.5) {
                // Farm: houses, barns and a lorry.
                const X = landX;
                out.push(target('farm', X, Z, rand));
                out.push(target('barn', X + 12, Z + 9, rand));
                out.push(driver('truck', PA.ROAD_X + 3, Z + 6));
            }
            else if (roll < 0.66) {
                // Town: towers, barracks and a SAM site.
                const X = landX;
                out.push(target('city', X, Z, rand));
                out.push(target('city', X + 8, Z + 6, rand));
                out.push(target('city', X - 7, Z + 9, rand));
                out.push(target('sam', X + 14, Z - 4, rand));
            }
            else if (roll < 0.78) {
                // Airfield: a hangar, parked jets and a fuel tanker.
                const X = Math.min(PA.SEA_X - 120, landX);
                out.push(target('hangar', X, Z, rand));
                out.push(target('jet', X + 12, Z + 8, rand));
                out.push(target('jet', X + 18, Z + 8, rand));
                out.push(target('fuel', X - 10, Z + 10, rand));
            }
            else if (roll < 0.9) {
                // Port: a ship on the sea, with a flak gun on the coast.
                const X = PA.SEA_X + 80 + rand() * 300;
                out.push(target('ship', X, Z, rand));
                out.push(target('flak', PA.SEA_X - 30, Z, rand));
            }
            else {
                // Railway: wagons on the line.
                const X = -320;
                out.push(target('rail', X, Z, rand));
                out.push(target('rail', X, Z + 6, rand));
                out.push(target('barracks', X + 40, Z + 12, rand));
            }
        }
        return out;
    }
    PA.spawnTargets = spawnTargets;
    // An enemy fighter or an ally, flying in from far off.
    function spawnAir(rand, px, pz, enemy) {
        const bearing = (rand() - 0.5) * 1.2; // radians either side of the nose
        const dist = 1100 + rand() * 200;
        const X = px + Math.sin(bearing) * dist;
        const Z = pz + Math.cos(bearing) * dist;
        const h = 80 + rand() * 40;
        if (enemy) {
            return { kind: 'fighter', X, Z, h, alive: true, points: PA.KINDS.fighter.points, hp: 1,
                cool: 1 + rand() * 2, faction: 'enemy', age: 0 };
        }
        // Allies orbit a point near the front, at a steady height.
        const cx = px + (rand() - 0.5) * 600, cz = pz + 500 + rand() * 500;
        return { kind: 'ally', X: cx + 900, Z: cz, h: 90, alive: true, points: PA.KINDS.ally.points, hp: 1, cool: 0,
            faction: 'ally', orbit: { cx, cz, r: 900, ang: rand() * Math.PI * 2, w: 0.09 }, age: 0 };
    }
    PA.spawnAir = spawnAir;
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
// Four channels, each with its own slider: music (with the engine hum), guns,
// turns (the rush of a hard bank) and the incoming warning.
var PA;
(function (PA) {
    // A soft pentatonic melody, one note every half second, looping. Gentle on purpose.
    const MELODY = [392, 440, 523, 587, 523, 440, 392, 330, 392, 523, 659, 523, 440, 392, 330, 294];
    const BOOST_HUM = 0.025; // the engine is only heard, faintly, while boosting
    class Sound {
        constructor() {
            this.ctx = null;
            this.noise = null;
            this.engine = null;
            this.busMusic = null;
            this.busGun = null;
            this.busWarn = null;
            this.busTurn = null;
            this.turnGain = null;
            this.engineGain = null;
            this.musicTimer = 0;
            this.noteAt = 0;
            this.step = 0;
            this.enabled = true;
            this.volumes = { music: 0.3, gun: 0.35, turn: 0.3, warn: 0.7 };
            this.paused = false;
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
        setVolumes(v) {
            this.volumes = v;
            this.applyVolumes();
        }
        // Pause the music and the engine while the settings are open.
        setPaused(paused) {
            this.paused = paused;
            this.applyVolumes();
        }
        applyVolumes() {
            if (!this.ctx)
                return;
            const on = this.enabled && !this.paused ? 1 : 0;
            const t = this.ctx.currentTime;
            const set = (node, value) => {
                if (node)
                    node.gain.setTargetAtTime(value, t, 0.05);
            };
            set(this.busMusic, on * this.volumes.music);
            set(this.busGun, this.enabled ? this.volumes.gun : 0);
            set(this.busWarn, this.enabled ? this.volumes.warn : 0);
            set(this.busTurn, this.enabled ? this.volumes.turn : 0);
        }
        // The engine and the turn rush follow the flight.
        setFlight(boost, flying, turnAmount) {
            if (!this.ctx || !this.engine || !this.engineGain || !this.turnGain)
                return;
            const now = this.ctx.currentTime;
            this.engine.frequency.setTargetAtTime(60, now, 0.1);
            // No hum at all unless the boost is held: then a faint one.
            this.engineGain.gain.setTargetAtTime(flying && boost ? BOOST_HUM : 0, now, 0.15);
            // A hard turn is a soft rush of air: quiet until the stick is pushed well over.
            const rush = flying ? Math.max(0, Math.min(1, (turnAmount - 0.35) / 0.65)) * 0.07 : 0;
            this.turnGain.gain.setTargetAtTime(rush, now, 0.15);
        }
        // The background tune: a few soft notes, scheduled ahead, repeating.
        startMusic() {
            if (this.musicTimer)
                return;
            this.noteAt = this.ctx ? this.ctx.currentTime + 0.1 : 0;
            this.musicTimer = window.setInterval(() => this.scheduleMusic(), 200);
        }
        scheduleMusic() {
            const ctx = this.ctx;
            if (!ctx || !this.busMusic)
                return;
            while (this.noteAt < ctx.currentTime + 0.6) {
                const f = MELODY[this.step % MELODY.length];
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = f;
                gain.gain.setValueAtTime(0, this.noteAt);
                gain.gain.linearRampToValueAtTime(0.03, this.noteAt + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.0005, this.noteAt + 0.45);
                osc.connect(gain).connect(this.busMusic);
                osc.start(this.noteAt);
                osc.stop(this.noteAt + 0.5);
                this.noteAt += 0.5;
                this.step++;
            }
        }
        play(name) {
            if (!this.ctx || !this.enabled)
                return;
            const t = this.ctx.currentTime;
            switch (name) {
                case 'gun':
                    this.burst(0.04, 0.2, 1400, t, this.busGun);
                    break;
                case 'boom':
                    this.burst(0.6, 0.25, 400, t, this.busGun);
                    this.tone(90, 0.4, 0.12, t, 'sine', 40, this.busGun);
                    break;
                case 'thud':
                    this.tone(140, 0.1, 0.04, t, 'sine', 90, this.busGun);
                    break;
                case 'warn':
                    // Two soft beeps: an incoming shell.
                    this.tone(880, 0.12, 0.25, t, 'sine', undefined, this.busWarn);
                    this.tone(880, 0.12, 0.25, t + 0.2, 'sine', undefined, this.busWarn);
                    break;
                case 'beep':
                    // Beep, beep: the tag. Speed comes from the game, pitch rises a little.
                    this.tone(1000, 0.09, 0.14, t, 'sine', undefined, this.busWarn);
                    break;
                case 'lock':
                    this.tone(1300, 0.04, 0.06, t, 'sine', undefined, this.busWarn);
                    break;
                case 'chaff':
                    this.burst(0.35, 0.15, 2500, t, this.busGun);
                    break;
                case 'chime':
                    this.tone(660, 0.25, 0.1, t, 'sine', undefined, this.busMusic);
                    this.tone(990, 0.35, 0.1, t + 0.12, 'sine', undefined, this.busMusic);
                    break;
                case 'land':
                    this.tone(392, 0.2, 0.1, t, 'triangle', undefined, this.busMusic);
                    this.tone(523, 0.3, 0.1, t + 0.15, 'triangle', undefined, this.busMusic);
                    break;
                case 'crash':
                    this.burst(0.9, 0.3, 300, t, this.busGun);
                    this.tone(70, 0.6, 0.1, t, 'sine', 30, this.busGun);
                    break;
            }
        }
        tone(freq, dur, vol, at, type, slideTo, bus) {
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
            osc.connect(gain).connect(bus);
            osc.start(at);
            osc.stop(at + dur + 0.02);
        }
        burst(dur, vol, cutoff, at, bus) {
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
            src.connect(filter).connect(gain).connect(bus);
            src.start(at, Math.random() * 0.3, dur);
        }
    }
    PA.Sound = Sound;
})(PA || (PA = {}));
// The family database sign-in (Supabase Auth). Browser code uses only the
// publishable key. Email and password are sent to the sign-in endpoint and never kept.
var PA;
(function (PA) {
    PA.FAMILY_URL = 'https://twvqvutrcobedvuhnzxq.supabase.co';
    PA.FAMILY_KEY = 'sb_publishable_eqUo8HEdEB1hMQM4CpSVqA_9i6b0qCo';
    const SESSION_KEY = 'pa_warthog.family';
    function loadSession() {
        try {
            const raw = localStorage.getItem(SESSION_KEY);
            return raw ? JSON.parse(raw) : null;
        }
        catch (e) {
            return null;
        }
    }
    PA.loadSession = loadSession;
    function saveSession(s) {
        try {
            if (s)
                localStorage.setItem(SESSION_KEY, JSON.stringify(s));
            else
                localStorage.removeItem(SESSION_KEY);
        }
        catch (e) {
            // Not kept on this device: the user just signs in again next time.
        }
    }
    // Sign in with the family email and password. Throws with a plain message on failure.
    async function signIn(email, password) {
        const res = await fetch(PA.FAMILY_URL + '/auth/v1/token?grant_type=password', {
            method: 'POST',
            headers: { apikey: PA.FAMILY_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok || !body.access_token) {
            throw new Error(body.error_description || body.msg || 'Sign-in failed (' + res.status + ')');
        }
        const session = {
            access: body.access_token,
            refresh: body.refresh_token,
            email,
            expires: Math.floor(Date.now() / 1000) + (body.expires_in || 3600),
        };
        saveSession(session);
        return session;
    }
    PA.signIn = signIn;
    async function signOut() {
        const s = loadSession();
        saveSession(null);
        if (!s)
            return;
        try {
            await fetch(PA.FAMILY_URL + '/auth/v1/logout', {
                method: 'POST',
                headers: { apikey: PA.FAMILY_KEY, Authorization: 'Bearer ' + s.access },
            });
        }
        catch (e) {
            // Offline is fine: this device has already signed out.
        }
    }
    PA.signOut = signOut;
    // Asks the database whether the saved sign-in still works.
    async function checkSession() {
        const s = loadSession();
        if (!s)
            return { ok: false, message: 'Not signed in: this device only.' };
        try {
            const res = await fetch(PA.FAMILY_URL + '/auth/v1/user', {
                headers: { apikey: PA.FAMILY_KEY, Authorization: 'Bearer ' + s.access },
            });
            if (res.ok)
                return { ok: true, message: 'Signed in and the database answers.' };
            return { ok: false, message: 'The database refused the sign-in (' + res.status + '). Sign in again.' };
        }
        catch (e) {
            return { ok: false, message: 'The database could not be reached: ' + String(e) };
        }
    }
    PA.checkSession = checkSession;
})(PA || (PA = {}));
// Notes for improvement. Saved on this device first (never sent anywhere by itself).
// Each note has a project and sub-project, a status (open, done or closed), a
// description, an identifier (N-0001 …), and a snapshot of identifiers taken when
// it was written. The identifier index says what each code means.
var PA;
(function (PA) {
    PA.NOTES_PROJECT = 'Paper Airplanes x A-10 Warthog';
    const NOTES_KEY = 'pa_warthog.notes';
    // The identifier index: what each code in a note means. Values are stored with each note,
    // so this list can grow without changing old notes.
    PA.INDEX = [
        { code: 'HP', name: 'Health', meaning: 'Hull left, as a share of full', unit: '%' },
        { code: 'TIME', name: 'Time played', meaning: 'How long this flight has been going', unit: 'm:ss' },
        { code: 'ALT', name: 'Height', meaning: 'Height above the ground under the plane', unit: 'm' },
        { code: 'SPD', name: 'Speed', meaning: 'Airspeed in knots', unit: 'kt' },
        { code: 'AOA', name: 'Angle of attack', meaning: 'Nose angle against the flight path (over 15° stalls)', unit: '°' },
        { code: 'VIEW', name: 'Camera view', meaning: 'Chase, top-down or cockpit', unit: '' },
        { code: 'PLANE', name: 'Plane', meaning: 'A-10 jet or paper glider', unit: '' },
        { code: 'MISS', name: 'Missiles', meaning: 'Missiles in stock (of six)', unit: 'count' },
        { code: 'GUN', name: 'Gun aim', meaning: 'Straight, or how far down it points at a ground target', unit: '°' },
        { code: 'LEFT', name: 'Targets left', meaning: 'Ground targets still standing', unit: 'count' },
        { code: 'SCORE', name: 'Score', meaning: 'Points this flight', unit: 'pts' },
        { code: 'SAFE', name: 'Safe flight', meaning: 'Floor above the ground is on (1) or off (0)', unit: '' },
        { code: 'INV', name: 'Invincible', meaning: 'Hits do no harm (1) or they do (0)', unit: '' },
    ];
    // Memory copy, used when the device will not keep notes (and in the tests).
    let memory = null;
    function loadNotes() {
        if (memory)
            return memoryCopy();
        try {
            const raw = localStorage.getItem(NOTES_KEY);
            return raw ? JSON.parse(raw) : [];
        }
        catch (e) {
            return memoryCopy();
        }
    }
    PA.loadNotes = loadNotes;
    function memoryCopy() {
        return memory ? memory.slice() : [];
    }
    function saveNotes(list) {
        memory = list.slice();
        try {
            localStorage.setItem(NOTES_KEY, JSON.stringify(list));
        }
        catch (e) {
            // Kept in memory for this visit only.
        }
    }
    function nextIdentifier(list) {
        let top = 0;
        for (const n of list) {
            const m = /^N-(\d+)$/.exec(n.identifier);
            if (m)
                top = Math.max(top, +m[1]);
        }
        return 'N-' + String(top + 1).padStart(4, '0');
    }
    PA.nextIdentifier = nextIdentifier;
    function addNote(description, item, sub, ids, when = new Date()) {
        const list = loadNotes();
        const note = {
            identifier: nextIdentifier(list),
            time: when.toISOString(),
            project: PA.NOTES_PROJECT,
            sub,
            item,
            status: 'open',
            description: description.trim(),
            ids,
        };
        list.push(note);
        saveNotes(list);
        return note;
    }
    PA.addNote = addNote;
    function setStatus(identifier, status) {
        const list = loadNotes();
        for (const n of list)
            if (n.identifier === identifier)
                n.status = status;
        saveNotes(list);
    }
    PA.setStatus = setStatus;
    function sortNotes(list, by) {
        const order = { open: 0, done: 1, closed: 2 };
        return list.slice().sort((a, b) => {
            if (by === 'status')
                return order[a.status] - order[b.status] || a.identifier.localeCompare(b.identifier);
            if (by === 'sub')
                return a.sub.localeCompare(b.sub) || a.identifier.localeCompare(b.identifier);
            return a.identifier.localeCompare(b.identifier);
        });
    }
    PA.sortNotes = sortNotes;
    // The identifiers at this moment in the game. Each code is written with its value.
    function snapshot(g, settings) {
        const p = g.plane;
        const secs = Math.floor(g.time);
        return {
            HP: Math.round(Math.max(0, g.hull)),
            TIME: Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0'),
            ALT: Math.round(p.h - PA.groundAt(p.X, p.Z)),
            SPD: Math.round(p.speed * 1.94),
            AOA: Math.round((p.alpha * 180) / Math.PI),
            VIEW: settings.view,
            PLANE: settings.mode === 'glider' ? 'paper glider' : 'A-10 jet',
            MISS: g.missileStock,
            GUN: g.aim.mode === 'ground' ? Number(((Math.abs(g.aim.pitch) * 180) / Math.PI).toFixed(1)) : 0,
            LEFT: g.mission.targets.filter(t => t.alive).length,
            SCORE: g.score,
            SAFE: settings.safeFlight,
            INV: settings.invincible,
        };
    }
    PA.snapshot = snapshot;
    function subProject(settings) {
        return (settings.mode === 'glider' ? 'paper glider' : 'A-10 jet') + ' / ' + settings.view;
    }
    PA.subProject = subProject;
    function statusCount(list) {
        const c = { open: 0, done: 0, closed: 0 };
        for (const n of list)
            c[n.status]++;
        return c;
    }
    PA.statusCount = statusCount;
})(PA || (PA = {}));
// Game state and rules. Two modes: "normal" (limited ammo and missiles, three hits and the
// plane is down, mission objectives restock it) and "felix" (easy: never goes down, unlimited
// supplies). Targeting takes a moment to lock. Enemy fighters fire homing missiles; a tag
// warns of them, and a tight turn or chaff can break them off.
var PA;
(function (PA) {
    PA.MISSILE_MAX = 6;
    PA.AMMO_MAX = 240;
    PA.CHAFF_MAX = 4;
    PA.HITS_TO_DOWN = 3; // normal mode: three hits and the plane is down
    const HIT_DAMAGE = 100 / PA.HITS_TO_DOWN; // each hit takes a third of the hull
    const AMMO_RECHARGE = 4; // rounds per second, always coming back
    const RESUPPLY_COOL = 45; // seconds between reloads from ⚙️
    const SHOT_SPEED = 260;
    const CRUISE_THROTTLE = 0.36; // about 100 knots on the display: a gentler cruise
    const BULLET_LIFE = 1.6;
    const SHELL_LIFE = 4;
    const BLINK_SECONDS = 1.2;
    const MISSILE_COOL = 1;
    const MISSILE_RELOAD = 3;
    const MISSILE_SPEED = 180;
    const MISSILE_TURN = 2.2;
    const MISSILE_RANGE = 900;
    const MISSILE_CONE = 0.45;
    const LOCK_TIME = 1.2; // seconds of steady aim before a missile locks
    const ENEMY_MISSILE_SPEED = 170;
    const ENEMY_MISSILE_TURN = 2.5;
    const ENEMY_MISSILE_RANGE = 1000;
    const ENEMY_MISSILE_COOL = 7;
    const BREAK_TURN = 0.6; // a yaw this hard, held this long, breaks the enemy's lock
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
    const ATTACK_RANGE = 700; // a fighter starts its attack run inside this distance
    const BREAK_RANGE = 180; // and breaks off this close, or after BREAK_AFTER seconds
    const BREAK_AFTER = 3;
    const BREAK_FOR = 3.5; // it flies straight away this long, then comes back
    const ALLY_GUN_RANGE = 700; // allies shoot at enemy fighters inside this range
    const ALLY_COOL = 0.35;
    const BASE_SPACING = 1400; // a defended base every this many metres along the route
    const KEEP_AHEAD = 6;
    const OBJECTIVE_GROUND = [4, 5, 6]; // ground targets to destroy for a mission (cycles)
    class Game {
        constructor(settings) {
            this.settings = settings;
            this.phase = 'flying';
            this.paused = false;
            this.seed = 1;
            this.score = 0;
            this.kills = 0;
            this.hull = 100;
            this.hits = 0;
            this.hoopsPassed = 0;
            this.time = 0;
            this.fireCool = 0;
            this.blink = 0;
            this.ammo = PA.AMMO_MAX;
            this.missileStock = PA.MISSILE_MAX;
            this.missileCool = 0;
            this.reloadTimer = 0;
            this.chaff = PA.CHAFF_MAX;
            this.resupplyCool = 0;
            this.waveTimer = 0;
            this.nextBaseZ = BASE_SPACING;
            this.enemyMissileCool = 0;
            this.allyTimers = [];
            this.aim = { yaw: 0, pitch: 0, mode: 'straight', dir: [0, 0, 1] };
            this.lock = { target: null, progress: 0 };
            this.tagged = false; // an enemy missile is after the plane
            this.tagDist = 0; // its distance, metres
            this.breakTimer = 0;
            this.beepTimer = 0;
            this.objectiveGoal = 0;
            this.objectiveDone = 0;
            this.missionNumber = 1;
            this.resupplied = 0; // seconds left of the "resupplied" banner
            this.missionCard = 0; // seconds left of the mission pop-up card
            this.floorActive = false;
            this.shots = [];
            this.shells = [];
            this.missiles = [];
            this.decoys = [];
            this.puffs = [];
            this.marks = [];
            this.wisps = [];
            this.warned = false;
            this.held = { fire: false, boost: false, missile: false };
            this.axes = { yaw: 0, pitch: 0 };
            this.onSound = () => { };
            this.rand = PA.random(1);
            this.newFlight(Math.floor(Math.random() * 100000));
        }
        get felix() {
            return this.settings.difficulty === 'felix';
        }
        // A new flight or mission: new targets, full health; supplies are kept (or refilled).
        newFlight(seed, keepScore = false, refill = true) {
            const score = this.score, kills = this.kills;
            const ammo = this.ammo, missiles = this.missileStock, chaff = this.chaff;
            this.seed = seed;
            this.mission = PA.makeMission(this.settings.mode, seed);
            this.rand = PA.random(seed + 7);
            this.plane = new PA.Aircraft(this.settings.mode === 'jet');
            if (this.settings.mode === 'glider') {
                this.plane.start(0, 0, 90, 40, 0.08, 0, 0);
            }
            else {
                this.plane.start(0, 0, PA.groundAt(0, 0) + 10, 50, 0.05, 0, CRUISE_THROTTLE);
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
            this.ammo = refill || this.felix ? PA.AMMO_MAX : ammo;
            this.missileStock = refill || this.felix ? PA.MISSILE_MAX : missiles;
            this.chaff = refill || this.felix ? PA.CHAFF_MAX : chaff;
            this.missileCool = 0;
            this.reloadTimer = 0;
            this.waveTimer = 8;
            this.nextBaseZ = BASE_SPACING;
            this.enemyMissileCool = 6;
            this.allyTimers = [];
            this.lock = { target: null, progress: 0 };
            this.tagged = false;
            this.breakTimer = 0;
            this.objectiveGoal = OBJECTIVE_GROUND[(this.missionNumber - 1) % OBJECTIVE_GROUND.length];
            this.objectiveDone = 0;
            this.missionCard = this.settings.mode === 'jet' ? 5 : 0;
            for (let i = 0; i < this.settings.allies; i++) {
                this.mission.targets.push(PA.spawnAir(this.rand, 0, 0, false));
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
        reloadFromSettings() {
            if (this.felix || this.resupplyCool > 0)
                return false;
            this.ammo = PA.AMMO_MAX;
            this.missileStock = Math.min(PA.MISSILE_MAX, this.missileStock + 2);
            this.resupplyCool = RESUPPLY_COOL;
            this.onSound('chime');
            return true;
        }
        fireChaff() {
            if (this.phase !== 'flying' || this.settings.mode !== 'jet')
                return;
            if (!this.felix && this.chaff < 1)
                return;
            if (!this.felix)
                this.chaff--;
            const p = this.plane;
            for (let i = 0; i < 2; i++) {
                this.decoys.push({
                    X: p.X - Math.sin(p.yaw) * 6 + (i ? 3 : -3), Z: p.Z - Math.cos(p.yaw) * 6, h: p.h,
                    vX: p.vx * Math.sin(p.yaw) * 0.5, vY: -3, vZ: p.vx * Math.cos(p.yaw) * 0.5, life: CHAFF_LIFE,
                });
            }
            for (let i = 0; i < 12; i++)
                this.puffs.push(sparkle(this.rand, p.X, p.h, p.Z));
            this.onSound('chaff');
        }
        update(dtIn) {
            if (this.paused)
                return;
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
                if (this.blink <= 0)
                    this.newFlight(this.seed + 1, true, true);
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
            this.floorActive = false;
            if (jet && this.settings.safeFlight === 1)
                this.applyFloor(pilot);
            const touched = this.plane.step(dt, pilot, PA.groundAt);
            if (touched) {
                if (!jet) {
                    this.phase = 'landed';
                    this.onSound('land');
                    return;
                }
                if (this.settings.invincible === 1 || this.felix) {
                    this.plane.h = PA.groundAt(this.plane.X, this.plane.Z) + 4;
                    this.plane.vy = Math.max(this.plane.vy, 6);
                }
                else {
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
                if (this.hull <= 0 && !this.felix && this.settings.invincible !== 1)
                    this.crash();
            }
            else {
                this.checkRings();
            }
        }
        applyFloor(pilot) {
            const p = this.plane;
            const agl = p.h - PA.groundAt(p.X, p.Z);
            if (agl < FLOOR && p.vy < 0) {
                this.floorActive = true;
                const strength = Math.min(1, (FLOOR - agl) / (FLOOR - FLOOR_MIN));
                pilot.pitch = Math.max(pilot.pitch, 0.35 + 0.65 * strength);
                if (agl < FLOOR_MIN)
                    p.vy = Math.max(p.vy, 0);
            }
        }
        // Downed (normal mode): the plane blinks once, then carries on with full health.
        crash() {
            this.phase = 'crashed';
            this.hull = 0;
            this.blink = BLINK_SECONDS;
            this.explode(this.plane.X, this.plane.h, this.plane.Z, 26);
            this.onSound('crash');
        }
        // A hit: the damage shows as a mark on the wing; in normal mode it takes a third of the hull.
        takeHit() {
            this.marks.push({ x: (this.rand() < 0.5 ? -1 : 1) * (5 + this.rand() * 6), y: -1 + this.rand() * 2, age: 0 });
            if (this.marks.length > 12)
                this.marks.shift();
            this.hits++;
            if (this.settings.invincible !== 1 && !this.felix) {
                this.hull = Math.max(0, this.hull - HIT_DAMAGE);
            }
        }
        updateMarks(dt) {
            for (const m of this.marks)
                m.age += dt;
        }
        // Wisps stream from the wing tips in a tight turn; clouds come from the boost.
        emitWisps(dt) {
            const p = this.plane;
            const tight = Math.abs(p.bank) / PA.AIR.bankMax;
            if (tight < 0.5 || this.phase !== 'flying')
                return;
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
        emitDust() {
            const p = this.plane;
            const agl = p.h - PA.groundAt(p.X, p.Z);
            if (agl > 6 || p.speed < 40 || this.rand() > 0.35)
                return;
            this.puffs.push({
                X: p.X + (this.rand() - 0.5) * 10, Z: p.Z + (this.rand() - 0.5) * 10, h: PA.groundAt(p.X, p.Z) + 0.5,
                vX: (this.rand() - 0.5) * 6, vY: 2 + this.rand() * 3, vZ: (this.rand() - 0.5) * 6,
                life: 0.6, max: 0.6, color: '#e6dcc0', size: 2 + this.rand() * 2,
            });
        }
        updateWisps(dt) {
            for (const w of this.wisps) {
                w.life -= dt;
                w.X += w.vX * dt;
                w.Z += w.vZ * dt;
                w.h += w.vY * dt;
            }
            this.wisps = this.wisps.filter(w => w.life > 0);
        }
        updateReload(dt) {
            if (this.felix) {
                this.ammo = PA.AMMO_MAX;
                this.missileStock = PA.MISSILE_MAX;
                this.chaff = PA.CHAFF_MAX;
                return;
            }
            this.ammo = Math.min(PA.AMMO_MAX, this.ammo + AMMO_RECHARGE * dt);
            if (this.settings.autoReload !== 1 || this.missileStock >= PA.MISSILE_MAX) {
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
        updateObjective() {
            if (this.objectiveDone < this.objectiveGoal)
                return;
            this.missionNumber++;
            this.score += 500;
            this.ammo = PA.AMMO_MAX;
            this.missileStock = PA.MISSILE_MAX;
            this.chaff = PA.CHAFF_MAX;
            this.hull = 100;
            this.hits = 0;
            this.resupplied = 4;
            this.onSound('chime');
            this.newFlight(this.seed + 1, true, true);
        }
        updateWaves(dt) {
            this.waveTimer -= dt;
            if (this.waveTimer <= 0) {
                this.waveTimer = WAVE_SECONDS;
                for (let i = 0; i < this.settings.enemyWave; i++) {
                    this.mission.targets.push(PA.spawnAir(this.rand, this.plane.X, this.plane.Z, true));
                }
            }
            const allies = this.mission.targets.filter(t => t.faction === 'ally' && t.alive).length;
            if (allies + this.allyTimers.length < this.settings.allies) {
                this.allyTimers.push(FRIEND_RESPAWN);
            }
            this.allyTimers = this.allyTimers.map(t => t - dt).filter(t => {
                if (t > 0)
                    return true;
                this.mission.targets.push(PA.spawnAir(this.rand, this.plane.X, this.plane.Z, false));
                return false;
            });
        }
        updateAir(dt) {
            const p = this.plane;
            for (const t of this.mission.targets) {
                if (!t.alive)
                    continue;
                t.age = (t.age || 0) + dt;
                if (t.faction === 'enemy') {
                    this.flyFighter(t, dt);
                    if (t.age > 150 || Math.hypot(t.X - p.X, t.Z - p.Z) > 3000)
                        t.alive = false;
                }
                else if (t.faction === 'ally' && t.orbit) {
                    const o = t.orbit;
                    o.ang += o.w * dt;
                    t.X = o.cx + Math.cos(o.ang) * o.r;
                    t.Z = o.cz + Math.sin(o.ang) * o.r;
                    t.h = 90;
                    // Allies defend: they shoot at an enemy fighter that is close to them.
                    t.cool -= dt;
                    if (t.cool <= 0) {
                        const foe = this.nearestEnemy(t, ALLY_GUN_RANGE);
                        if (foe) {
                            t.cool = ALLY_COOL * (0.8 + this.rand() * 0.4);
                            this.friendlyShot(t, foe);
                        }
                    }
                }
            }
            // Enemy fighters also fire a homing missile now and then, when the plane is in front and near.
            this.enemyMissileCool -= dt;
            if (this.enemyMissileCool <= 0) {
                for (const t of this.mission.targets) {
                    if (t.faction !== 'enemy' || !t.alive || t.h === undefined)
                        continue;
                    const d = Math.hypot(p.X - t.X, p.Z - t.Z);
                    if (d < ENEMY_MISSILE_RANGE && d > 250) {
                        this.enemyMissileCool = ENEMY_MISSILE_COOL;
                        this.launchEnemyMissile(t);
                        break;
                    }
                }
            }
        }
        // An enemy fighter's flight: approach, make an attack run (firing), break off, come back.
        flyFighter(t, dt) {
            var _a, _b, _c, _d;
            const p = this.plane;
            const dx = p.X - t.X, dz = p.Z - t.Z;
            const dist = Math.hypot(dx, dz);
            t.stateT = ((_a = t.stateT) !== null && _a !== void 0 ? _a : 0) + dt;
            if (!t.state)
                t.state = 'approach';
            if (t.state === 'approach' && dist < ATTACK_RANGE) {
                t.state = 'attack';
                t.stateT = 0;
            }
            if (t.state === 'attack' && (dist < BREAK_RANGE || t.stateT > BREAK_AFTER)) {
                // Break away: the nose goes the way it came, and the fighter keeps going for a while.
                t.state = 'break';
                t.stateT = 0;
                t.vH = Math.atan2(-dx, -dz);
            }
            if (t.state === 'break' && t.stateT > BREAK_FOR) {
                t.state = 'approach';
                t.stateT = 0;
            }
            const cur = (_b = t.vH) !== null && _b !== void 0 ? _b : Math.atan2(dx, dz);
            let want = Math.atan2(dx, dz);
            let rate = FIGHTER_TURN;
            let speed = FIGHTER_SPEED * 0.85;
            if (t.state === 'attack') {
                rate = 1.6;
                speed = FIGHTER_SPEED;
            }
            if (t.state === 'break') {
                want = cur;
                rate = 0.4;
                speed = FIGHTER_SPEED;
            }
            let diff = want - cur;
            while (diff > Math.PI)
                diff -= 2 * Math.PI;
            while (diff < -Math.PI)
                diff += 2 * Math.PI;
            const turn = Math.max(-rate * dt, Math.min(rate * dt, diff));
            t.vH = cur + turn;
            t.X += Math.sin(t.vH) * speed * dt;
            t.Z += Math.cos(t.vH) * speed * dt;
            // Fighters settle toward the plane's height slowly, so a shot can be led.
            t.h = ((_c = t.h) !== null && _c !== void 0 ? _c : p.h) + (p.h + 10 - ((_d = t.h) !== null && _d !== void 0 ? _d : p.h)) * Math.min(1, dt * 0.15);
            const gun = PA.KINDS.fighter.gun;
            t.cool -= dt;
            if (t.state === 'attack' && t.cool <= 0 && dist < FIGHTER_FIRE_RANGE) {
                t.cool = gun.cool * (0.8 + this.rand() * 0.4);
                this.fireAt(t, gun.speed, true);
            }
        }
        nearestEnemy(from, range) {
            var _a, _b;
            let best = null;
            let bestD = range;
            for (const t of this.mission.targets) {
                if (!t.alive || t.faction !== 'enemy')
                    continue;
                const d = Math.hypot(t.X - from.X, t.Z - from.Z, ((_a = t.h) !== null && _a !== void 0 ? _a : 0) - ((_b = from.h) !== null && _b !== void 0 ? _b : 0));
                if (d < bestD) {
                    best = t;
                    bestD = d;
                }
            }
            return best;
        }
        // An ally's bullet toward an enemy fighter, led to where the fighter will be.
        friendlyShot(from, foe) {
            var _a, _b, _c;
            const sp = 260;
            const vf = this.targetVelocity(foe);
            const fromH = (_a = from.h) !== null && _a !== void 0 ? _a : 90;
            let tt = Math.hypot(foe.X - from.X, ((_b = foe.h) !== null && _b !== void 0 ? _b : 0) - fromH, foe.Z - from.Z) / sp;
            let dir = [0, 0, 1];
            for (let it = 0; it < 4; it++) {
                const rx = foe.X + vf[0] * tt - from.X;
                const ry = ((_c = foe.h) !== null && _c !== void 0 ? _c : 0) + vf[1] * tt - fromH + 0.5 * PA.GRAVITY * tt * tt;
                const rz = foe.Z + vf[2] * tt - from.Z;
                const d = Math.hypot(rx, ry, rz) || 1;
                dir = [rx / d, ry / d, rz / d];
                tt = d / sp;
            }
            this.shots.push({
                X: from.X, Z: from.Z, h: fromH,
                vX: dir[0] * sp, vY: dir[1] * sp, vZ: dir[2] * sp,
                life: 1.6, friendly: true,
            });
        }
        // A defended base: towns, guns and a SAM site, with allies circling it.
        spawnBase(z) {
            const X = (this.rand() - 0.5) * 600;
            const m = this.mission.targets;
            m.push(PA.target('city', X, z, this.rand), PA.target('city', X + 10, z + 7, this.rand), PA.target('city', X - 9, z + 10, this.rand));
            m.push(PA.target('sam', X + 14, z - 6, this.rand), PA.target('flak', X - 14, z - 8, this.rand), PA.target('flak', X + 6, z + 16, this.rand));
            for (let i = 0; i < 2; i++) {
                m.push({
                    kind: 'ally', X: X + 450, Z: z, h: 90, alive: true, points: PA.KINDS.ally.points, hp: 1, cool: 0,
                    faction: 'ally', orbit: { cx: X, cz: z, r: 450, ang: i * Math.PI, w: 0.12 }, age: 0,
                });
            }
        }
        launchEnemyMissile(t) {
            var _a, _b;
            const p = this.plane;
            const dx = p.X - t.X, dz = p.Z - t.Z, dh = p.h - ((_a = t.h) !== null && _a !== void 0 ? _a : p.h);
            const d = Math.hypot(dx, dz, dh) || 1;
            this.missiles.push({
                X: t.X, Z: t.Z, h: (_b = t.h) !== null && _b !== void 0 ? _b : p.h,
                vX: dx / d * ENEMY_MISSILE_SPEED, vY: dh / d * ENEMY_MISSILE_SPEED, vZ: dz / d * ENEMY_MISSILE_SPEED,
                life: 9, target: null, enemy: true,
            });
        }
        fireAt(t, speed, warn) {
            const p = this.plane;
            const gy = PA.altOf(t) + 2;
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
                vY: (aimY - gy) / T + 0.5 * PA.GRAVITY * T,
                life: SHELL_LIFE,
                warn,
            });
            this.onSound('thud');
        }
        // Targeting: hold MISSILE on a target in front for LOCK_TIME to lock; then a missile goes.
        candidate() {
            const p = this.plane;
            const sinY = Math.sin(p.yaw), cosY = Math.cos(p.yaw);
            let best = null;
            let bestD = MISSILE_RANGE;
            for (const t of this.mission.targets) {
                if (!t.alive || t.faction === 'ally')
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
        updateLock(dt) {
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
        fireMissile(target) {
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
        updateMissiles(dt) {
            const keep = [];
            for (const m of this.missiles) {
                if (m.enemy) {
                    keep.push(m);
                    continue;
                }
                m.life -= dt;
                const target = m.target;
                if (target && target.alive) {
                    const tg = PA.altOf(target) + 1;
                    const dx = target.X - m.X, dy = tg - m.h, dz = target.Z - m.Z;
                    this.steer(m, dx, dy, dz, MISSILE_SPEED, MISSILE_TURN, dt);
                }
                m.X += m.vX * dt;
                m.Z += m.vZ * dt;
                m.h += m.vY * dt;
                if (target && target.alive) {
                    const info = PA.KINDS[target.kind];
                    const tg = PA.altOf(target);
                    const dx = m.X - target.X, dz = m.Z - target.Z;
                    if (dx * dx + dz * dz < info.r * info.r * 2.2 && m.h <= tg + info.height + 2 && m.h >= tg - 1) {
                        this.hitTarget(target, 2, tg);
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
        // Turns a missile's velocity toward (dx, dy, dz) at most at the turn rate.
        steer(m, dx, dy, dz, speed, turn, dt) {
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
        updateEnemyMissiles(dt) {
            const p = this.plane;
            const keep = [];
            for (const m of this.missiles) {
                if (!m.enemy) {
                    keep.push(m);
                    continue;
                }
                m.life -= dt;
                let aimX = p.X, aimY = p.h, aimZ = p.Z;
                if (!m.broken) {
                    let best = null;
                    let bestD = Math.hypot(m.X - p.X, m.h - p.h, m.Z - p.Z);
                    for (const d of this.decoys) {
                        const dd = Math.hypot(m.X - d.X, m.h - d.h, m.Z - d.Z);
                        if (dd < bestD && dd < CHAFF_DECOY_RANGE * 2) {
                            best = d;
                            bestD = dd;
                        }
                    }
                    if (best) {
                        aimX = best.X;
                        aimY = best.h;
                        aimZ = best.Z;
                    }
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
                if (m.life <= 0 || m.h <= PA.groundAt(m.X, m.Z)) {
                    if (m.h <= PA.groundAt(m.X, m.Z))
                        this.explode(m.X, m.h, m.Z, 8);
                    continue;
                }
                keep.push(m);
            }
            this.missiles = keep;
        }
        updateDecoys(dt) {
            for (const d of this.decoys) {
                d.life -= dt;
                d.X += d.vX * dt;
                d.Z += d.vZ * dt;
                d.h += d.vY * dt;
                if (this.rand() < 0.3)
                    this.puffs.push(sparkle(this.rand, d.X, d.h, d.Z));
            }
            this.decoys = this.decoys.filter(d => d.life > 0 && d.h > PA.groundAt(d.X, d.Z));
        }
        // The tag: an enemy missile is after the plane. The beep speeds up as it closes; a hard turn breaks it.
        updateTag(dt) {
            const p = this.plane;
            let nearest = Infinity;
            let active = false;
            for (const m of this.missiles) {
                if (!m.enemy || m.broken)
                    continue;
                active = true;
                nearest = Math.min(nearest, Math.hypot(m.X - p.X, m.h - p.h, m.Z - p.Z));
            }
            if (active && Math.abs(this.axes.yaw) > BREAK_TURN) {
                this.breakTimer += dt;
                if (this.breakTimer > BREAK_TIME) {
                    for (const m of this.missiles)
                        if (m.enemy)
                            m.broken = true;
                    this.breakTimer = 0;
                    this.onSound('chime');
                }
            }
            else {
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
            }
            else {
                this.beepTimer = 0;
            }
        }
        // Where a target is moving to, per second (vehicles on the road, fighters, allies on their orbit).
        targetVelocity(t) {
            var _a, _b;
            if (t.faction === 'enemy' && t.vH !== undefined) {
                // A fighter also climbs or sinks toward the plane's height (see flyFighter).
                const climb = (this.plane.h + 10 - ((_a = t.h) !== null && _a !== void 0 ? _a : 0)) * 0.15;
                return [Math.sin(t.vH) * FIGHTER_SPEED, climb, Math.cos(t.vH) * FIGHTER_SPEED];
            }
            if (t.faction === 'ally' && t.orbit) {
                const o = t.orbit;
                return [-Math.sin(o.ang) * o.r * o.w, 0, Math.cos(o.ang) * o.r * o.w];
            }
            return [0, 0, (_b = t.vZ) !== null && _b !== void 0 ? _b : 0];
        }
        // The direction to fire so the bullet reaches where the target WILL be. The bullet starts
        // with the plane's own speed, and it falls under gravity, so both are allowed for.
        leadDir(t) {
            const p = this.plane;
            const sinY = Math.sin(p.yaw), cosY = Math.cos(p.yaw);
            const vp = [p.vx * sinY, p.vy, p.vx * cosY];
            const vt = this.targetVelocity(t);
            const aimH = PA.altOf(t) + (t.h === undefined ? 1 : 0);
            let tt = Math.hypot(t.X - p.X, aimH - p.h, t.Z - p.Z) / SHOT_SPEED;
            let dir = [0, 0, 1];
            for (let it = 0; it < 5; it++) {
                // Where the target is at time tt, lifted by the drop the bullet will have fallen.
                const tx = t.X + vt[0] * tt;
                const ty = aimH + vt[1] * tt + 0.5 * PA.GRAVITY * tt * tt;
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
        computeAim() {
            const p = this.plane;
            const sinY = Math.sin(p.yaw), cosY = Math.cos(p.yaw);
            let airborne = false;
            let best = null;
            let bestD = GROUND_RANGE;
            for (const t of this.mission.targets) {
                if (!t.alive)
                    continue;
                const dx = t.X - p.X, dz = t.Z - p.Z;
                const d = Math.hypot(dx, dz);
                if (d < 1 || (dx * sinY + dz * cosY) <= 0)
                    continue;
                if (t.h !== undefined && d < AIR_RANGE)
                    airborne = true;
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
        updateGuns(dt) {
            this.fireCool -= dt;
            this.aim = this.computeAim();
            if (!this.held.fire || this.fireCool > 0 || this.ammo < 1)
                return;
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
        hitTarget(t, damage, tg) {
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
            if (PA.isObjective(t))
                this.objectiveDone++;
            this.explode(t.X, tg + 1, t.Z, PA.KINDS[t.kind].height > 5 ? 26 : 16);
            this.onSound('boom');
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
                    // An ally's bullet only hits enemies; the player's never hit allies.
                    if (s.friendly ? t.faction !== 'enemy' : t.faction === 'ally')
                        continue;
                    const info = PA.KINDS[t.kind];
                    const dx = s.X - t.X, dz = s.Z - t.Z;
                    const tg = PA.altOf(t);
                    // Flying things get a few metres of vertical room: a dogfight is hard to aim exactly.
                    const slack = t.h !== undefined ? 3 : 0;
                    if (dx * dx + dz * dz < info.r * info.r && s.h >= tg - slack && s.h <= tg + info.height + slack) {
                        if (s.friendly) {
                            t.alive = false;
                            this.explode(t.X, tg + 1, t.Z, 10);
                            this.onSound('boom');
                        }
                        else {
                            this.hitTarget(t, 1, tg);
                        }
                        hit = true;
                        break;
                    }
                }
                if (!hit)
                    keep.push(s);
            }
            this.shots = keep;
        }
        updateGunners(dt) {
            const p = this.plane;
            for (const t of this.mission.targets) {
                const gun = PA.KINDS[t.kind].gun;
                if (!gun || !t.alive || t.faction === 'enemy')
                    continue;
                t.cool -= dt;
                const dist = Math.hypot(p.X - t.X, p.Z - t.Z);
                if (t.cool > 0 || dist > gun.range || p.h > gun.range * 0.5)
                    continue;
                t.cool = gun.cool * (0.7 + this.rand() * 0.6);
                this.fireAt(t, gun.speed, false);
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
            if (!this.shells.some(s => s.warn))
                this.warned = false;
        }
        keepTargets() {
            const m = this.mission;
            m.targets = m.targets.filter(t => (t.alive || t.Z > this.plane.Z - 150) && !(t.faction === 'enemy' && !t.alive));
            for (const t of m.targets) {
                if (t.vZ !== undefined && t.alive)
                    t.Z += t.vZ * (1 / 30);
            }
            const left = m.targets.filter(t => t.alive && t.faction === undefined).length;
            if (left < KEEP_AHEAD) {
                m.targets.push(...PA.spawnTargets(this.rand, this.plane.Z + 240, 6));
            }
            // Bases come up ahead of the plane, one every BASE_SPACING metres of route.
            while (this.plane.Z + 900 > this.nextBaseZ) {
                this.spawnBase(this.nextBaseZ);
                this.nextBaseZ += BASE_SPACING;
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
    function sparkle(rand, X, h, Z) {
        return {
            X, h, Z,
            vX: (rand() - 0.5) * 14, vY: 2 + rand() * 6, vZ: (rand() - 0.5) * 14,
            life: 0.9, max: 0.9, color: '#fff1b8', size: 2,
        };
    }
    function clamp(v) {
        return Math.max(-1, Math.min(1, v));
    }
})(PA || (PA = {}));
// Drawing the chase view (and the top-down and cockpit views). The camera sits
// behind the plane and turns with its heading and bank. The ground is a checkerboard
// in world space, with lakes, forests, a road with stripes, and clouds high up.
// Everything standing on the ground or flying is a sprite placed by perspective and
// sorted from far to near.
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
    const PX_PER_M = 0.6; // sprite pixel size in metres (ground and air things), twice the first size
    const PLANE_SCALE = 2; // the plane sprite is drawn at a whole-number scale
    const NEAR_BOOST_M = 220; // closer than this, things grow up to three times
    const MIN_PX = 10; // the smallest a thing is drawn (tall)
    const MAX_PX = 220; // the largest, so nothing fills the whole screen
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
        const hx = sinY, hz = cosY; // horizontal forward
        const rhx = cosY, rhz = -sinY; // horizontal right
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
    // World point → screen point and depth, or null if it is behind the camera.
    // With clampDepth, points just behind the camera are pulled to the near plane.
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
    // Clouds high in the air: soft puffs at fixed places in the world, drifting slowly.
    function clouds(ctx, g, c) {
        const i0 = Math.floor(c.px / 300) - 4, i1 = i0 + 9;
        const j0 = Math.floor(c.pz / 300) - 4, j1 = j0 + 9;
        const drift = g.time * 4;
        ctx.fillStyle = 'rgba(255,253,250,0.85)';
        for (let i = i0; i <= i1; i++) {
            for (let j = j0; j <= j1; j++) {
                if (PA.cellNoise(i, j, 23) < 0.45)
                    continue;
                const X = i * 300 + PA.cellNoise(i, j, 29) * 240 + drift;
                const Z = j * 300 + PA.cellNoise(i, j, 31) * 240;
                const h = 140 + PA.cellNoise(i, j, 37) * 60;
                const p = project(c, X, h, Z);
                if (!p)
                    continue;
                const r = (46 * FOCAL) / p[2];
                if (r < 2)
                    continue;
                ctx.beginPath();
                ctx.ellipse(p[0], p[1], r * 1.6, r * 0.7, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    // Ground: squares of the world, far ones first, each faded toward the sky.
    function ground(ctx, g, c) {
        const range = VIEWS[g.settings.view].range;
        const ci = Math.round(c.px / CELL), cj = Math.round(c.pz / CELL);
        const cells = [];
        for (let i = ci - range; i < ci + range; i++) {
            for (let j = cj - range; j < cj + range; j++) {
                const corners = [];
                for (const [a, b] of [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]]) {
                    const p = project(c, a * CELL, PA.groundAt(a * CELL, b * CELL), b * CELL, true);
                    if (p)
                        corners.push(p);
                }
                if (corners.length < 4)
                    continue;
                const depth = (corners[0][2] + corners[2][2]) / 2;
                const cx = (i + 0.5) * CELL, cz = (j + 0.5) * CELL;
                const biome = PA.biomeAt(cx, cz);
                const light = ((i + j) & 1) === 0;
                const base = biome === 'sea' ? (light ? '#9fd3ea' : '#8cc6e2')
                    : biome === 'lake' ? (light ? '#86c9e6' : '#74bddf')
                        : biome === 'farm' ? (light ? '#cfe3a2' : '#e6d9a0')
                            : biome === 'town' ? (light ? '#cfd3d8' : '#bcc2c9')
                                : biome === 'forest' ? (light ? '#a6d69a' : '#93c888')
                                    : (light ? PA.COL.ground : PA.COL.groundDark);
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
    // The main road: a grey band with a dashed white centre stripe, drawn in world space.
    function road(ctx, g, c) {
        const z0 = Math.floor(c.pz / 25) * 25 - 50;
        const z1 = c.pz + 900;
        const edge = (X, z) => {
            const p = project(c, X, PA.groundAt(PA.ROAD_X, z) + 0.05, z, true);
            return p ? [p[0], p[1]] : null;
        };
        ctx.fillStyle = '#8a8f99';
        for (let z = z0; z < z1; z += 25) {
            const a = edge(PA.ROAD_X - PA.ROAD_W, z), b = edge(PA.ROAD_X + PA.ROAD_W, z);
            const c2 = edge(PA.ROAD_X + PA.ROAD_W, z + 25), d = edge(PA.ROAD_X - PA.ROAD_W, z + 25);
            if (!a || !b || !c2 || !d)
                continue;
            ctx.beginPath();
            ctx.moveTo(a[0], a[1]);
            ctx.lineTo(b[0], b[1]);
            ctx.lineTo(c2[0], c2[1]);
            ctx.lineTo(d[0], d[1]);
            ctx.closePath();
            ctx.fill();
        }
        // Stripes: a white dash every 50 m along the centre.
        ctx.fillStyle = '#fffdfa';
        for (let z = z0; z < z1; z += 50) {
            const a = edge(PA.ROAD_X - 0.6, z + 6), b = edge(PA.ROAD_X + 0.6, z + 6);
            const c2 = edge(PA.ROAD_X + 0.6, z + 26), d = edge(PA.ROAD_X - 0.6, z + 26);
            if (!a || !b || !c2 || !d)
                continue;
            ctx.beginPath();
            ctx.moveTo(a[0], a[1]);
            ctx.lineTo(b[0], b[1]);
            ctx.lineTo(c2[0], c2[1]);
            ctx.lineTo(d[0], d[1]);
            ctx.closePath();
            ctx.fill();
        }
    }
    function collect(g, c) {
        const things = [];
        const range = VIEWS[g.settings.view].range;
        // Trees: a few in each forest square near the camera.
        const ci = Math.round(c.px / CELL), cj = Math.round(c.pz / CELL);
        const tree = PA.sprite('tree');
        for (let i = ci - range; i < ci + range; i++) {
            for (let j = cj - range; j < cj + range; j++) {
                const cx0 = i * CELL, cz0 = j * CELL;
                if (PA.biomeAt(cx0 + CELL / 2, cz0 + CELL / 2) !== 'forest')
                    continue;
                for (let k = 0; k < 4; k++) {
                    const X = cx0 + PA.cellNoise(i, j, 41 + k) * CELL;
                    const Z = cz0 + PA.cellNoise(i, j, 47 + k) * CELL;
                    const p = project(c, X, PA.groundAt(X, Z), Z);
                    if (p)
                        things.push({ zc: p[2], img: tree, X, base: PA.groundAt(X, Z), Z });
                }
            }
        }
        for (const t of g.mission.targets) {
            if (!t.alive)
                continue;
            const p = project(c, t.X, PA.altOf(t), t.Z);
            if (!p)
                continue;
            if (p[2] > FOG_FAR * 1.5)
                continue;
            // Fighters and allies are stacked like the plane; ground things are single sprites for now.
            const air = t.h !== undefined;
            things.push({ zc: p[2], img: air ? PA.stackedSprite(t.kind) : PA.sprite(t.kind), X: t.X, base: PA.altOf(t), Z: t.Z });
        }
        things.sort((a, b) => b.zc - a.zc);
        return things;
    }
    // Draws one sprite standing at (X, base, Z), larger the closer it is.
    function billboard(ctx, c, img, X, Z, base) {
        const p = project(c, X, base, Z);
        if (!p)
            return;
        const [sx, sy, zc] = p;
        // Size by distance: true perspective, plus a boost when close (up to three times
        // larger inside 220 m), and a floor so anything far off still shows as a few pixels.
        const near = Math.max(0, Math.min(1, (NEAR_BOOST_M - zc) / NEAR_BOOST_M));
        let k = ((FOCAL * PX_PER_M) / zc) * (1 + 2 * near);
        k = Math.max(k, MIN_PX / img.height);
        k = Math.min(k, MAX_PX / img.height);
        const w = Math.max(1, Math.round(img.width * k));
        const h = Math.max(1, Math.round(img.height * k));
        ctx.drawImage(img, Math.round(sx - w / 2), Math.round(sy - h), w, h);
    }
    function shots(ctx, c, list, color, size) {
        ctx.fillStyle = color;
        for (const s of list) {
            const p = project(c, s.X, s.h, s.Z);
            if (p)
                ctx.fillRect(Math.round(p[0]), Math.round(p[1]), size, size);
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
    // Ring of the lock and the collapsing warning ring are drawn in screen space.
    function lockRing(ctx, g, c) {
        const t = g.lock.target;
        if (!t || g.lock.progress <= 0)
            return;
        const q = project(c, t.X, PA.altOf(t), t.Z);
        if (!q)
            return;
        const r = 26 - g.lock.progress * 14;
        ctx.strokeStyle = PA.INK;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(q[0], q[1], r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = g.lock.progress >= 1 ? '#ff6b6b' : '#ffe08a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(q[0], q[1], r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * g.lock.progress);
        ctx.stroke();
    }
    // The tag: a ring around the plane that collapses as the enemy missile closes in.
    function warnRing(ctx, g) {
        if (!g.tagged)
            return;
        const flash = Math.floor(g.time * 8) % 2 === 0;
        const k = Math.max(0, Math.min(1, g.tagDist / 900));
        const r = 18 + k * 70;
        ctx.strokeStyle = flash ? '#ff3b3b' : PA.INK;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(PA.W / 2, PA.H * PLANE_SCREEN_Y, r, 0, Math.PI * 2);
        ctx.stroke();
    }
    // Enemy missiles: a red streak with a bright head.
    function enemyMissiles(ctx, g, c) {
        for (const m of g.missiles) {
            if (!m.enemy)
                continue;
            const p = project(c, m.X, m.h, m.Z);
            if (!p)
                continue;
            const tail = project(c, m.X - m.vX * 0.08, m.h - m.vY * 0.08, m.Z - m.vZ * 0.08);
            if (tail) {
                ctx.strokeStyle = '#ff6b6b';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(tail[0], tail[1]);
                ctx.lineTo(p[0], p[1]);
                ctx.stroke();
            }
            ctx.fillStyle = '#fffdfa';
            ctx.fillRect(Math.round(p[0]) - 2, Math.round(p[1]) - 2, 4, 4);
        }
    }
    function wisps(ctx, g, c) {
        for (const w of g.wisps) {
            const q = project(c, w.X, w.h, w.Z);
            if (!q)
                continue;
            const k = Math.max(0, w.life / w.max);
            ctx.globalAlpha = Math.min(0.9, k * 1.2);
            ctx.fillStyle = w.color;
            const r = Math.max(1, (w.size * (1.2 - k) * FOCAL) / (q[2] * 0.9));
            ctx.beginPath();
            ctx.arc(q[0], q[1], r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
    // The plane is always in the same place on the screen; the world moves past it.
    // It grows from a quarter to a third of the screen width as the turn tightens, blinks
    // after a loss, shows smoke on the wings where it has been hit, and trails flame when boosting.
    function plane(ctx, g, c) {
        const p = g.plane;
        const shadow = project(c, p.X, PA.groundAt(p.X, p.Z), p.Z);
        if (shadow) {
            const rx = Math.max(3, Math.min(14, 26 - p.h * 0.2));
            ctx.fillStyle = 'rgba(47,45,61,0.22)';
            ctx.beginPath();
            ctx.ellipse(shadow[0], shadow[1], rx, 3, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        const blinkOff = g.phase === 'crashed' && Math.floor(g.blink * 8) % 2 === 0;
        const sx = PA.W / 2, sy = PA.H * PLANE_SCREEN_Y;
        const glider = g.settings.mode === 'glider';
        const tight = Math.min(1, Math.abs(p.bank) / PA.AIR.bankMax);
        // The jet is drawn at its own detail, at one of four crisp sizes (25% to 33% of the width).
        // The paper glider is drawn at its own size.
        const plane2 = glider ? null : PA.planeSprite(tight);
        const img = plane2 ? plane2.img : PA.sprite('glider');
        const scale = plane2 ? plane2.k : 1.5;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(p.bank);
        if (!blinkOff) {
            const dw = img.width, dh = img.height;
            // Flame from the engines when boosting: two flickering tongues.
            if (g.held.boost && g.phase === 'flying' && !glider) {
                // The engine exhausts sit at design x 25 and 42, y 35 (centre 33, 20).
                for (const ex of [24.5, 43.5]) {
                    const len = (8 + Math.random() * 6) * scale / 2;
                    const x0 = (ex - 33) * scale, y0 = 35 * scale - 20 * scale;
                    ctx.fillStyle = '#ffb02e';
                    ctx.beginPath();
                    ctx.moveTo(x0 - 2, y0);
                    ctx.lineTo(x0 + 2, y0);
                    ctx.lineTo(x0, y0 + len);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = '#fff1b8';
                    ctx.beginPath();
                    ctx.moveTo(x0 - 1, y0);
                    ctx.lineTo(x0 + 1, y0);
                    ctx.lineTo(x0, y0 + len * 0.5);
                    ctx.closePath();
                    ctx.fill();
                }
            }
            ctx.drawImage(img, -Math.round(dw / 2), -Math.round(dh / 2));
        }
        // Damage: a cloud of smoke on each wing, slowly lifting.
        for (const m of g.marks) {
            const rise = Math.min(6, m.age * 2);
            const r = 2.5 + Math.sin(m.age * 3) * 0.6;
            ctx.fillStyle = 'rgba(255,253,250,0.85)';
            ctx.beginPath();
            ctx.arc(m.x * scale, (m.y - rise * 0.2) * scale, r * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(120,120,130,0.6)';
            ctx.beginPath();
            ctx.arc(m.x * scale + 2, (m.y - rise * 0.2 - 1) * scale, r * scale * 0.6, 0, Math.PI * 2);
            ctx.fill();
        }
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
        arrow(ctx, x, y, 0, p.lift[1] * k, PA.COL.lift, 'lift');
        arrow(ctx, x, y, 0, p.weight[1] * k, PA.COL.weight, 'weight');
        arrow(ctx, x, y, 0, p.thrust[1] * k, PA.COL.thrust, 'thrust');
        arrow(ctx, x, y, p.drag[0] * k, 0, PA.COL.drag, 'drag');
    }
    // The cockpit: canopy struts and a dark instrument panel along the bottom.
    function cockpit(ctx, g) {
        const panelTop = PA.H * 0.84;
        ctx.fillStyle = '#3b3950';
        ctx.fillRect(0, panelTop, PA.W, PA.H - panelTop);
        ctx.fillStyle = '#5b5876';
        ctx.fillRect(0, panelTop, PA.W, 2);
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
    function render(ctx, g) {
        ctx.imageSmoothingEnabled = false;
        const c = makeCam(g);
        sky(ctx);
        clouds(ctx, g, c);
        ground(ctx, g, c);
        road(ctx, g, c);
        if (g.settings.view !== 'cockpit' && g.mission.mode === 'glider')
            rings(ctx, g, c);
        for (const th of collect(g, c))
            billboard(ctx, c, th.img, th.X, th.Z, th.base);
        shots(ctx, c, g.shots, PA.COL.bullet, 2);
        shots(ctx, c, g.shells, PA.COL.shell, 2);
        missiles(ctx, g, c);
        enemyMissiles(ctx, g, c);
        wisps(ctx, g, c);
        puffs(ctx, g, c);
        lockRing(ctx, g, c);
        if (g.settings.view !== 'cockpit')
            plane(ctx, g, c);
        warnRing(ctx, g);
        if (g.settings.view === 'cockpit')
            cockpit(ctx, g);
        if (g.settings.forces)
            forces(ctx, g);
    }
    PA.render = render;
})(PA || (PA = {}));
// The radar: a circle centred on the plane, turned to the heading. Each dot is a
// thing in the world, coloured by what it is. Range rings at 400, 800 and 1200 m.
var PA;
(function (PA) {
    const RANGE = 1200;
    const DOT = {
        army: '#ff6b6b',
        farm: '#b9dea6',
        town: '#8fd3f0',
        airfield: '#b48cf0',
        port: '#3d8bff',
        rail: '#8a6a4a',
        air: '#8fe0bd',
    };
    function radar(ctx, g, size) {
        var _a;
        const c = size / 2, R = size / 2 - 3;
        ctx.clearRect(0, 0, size, size);
        ctx.save();
        ctx.beginPath();
        ctx.arc(c, c, R, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,253,247,0.92)';
        ctx.fill();
        ctx.clip();
        ctx.strokeStyle = 'rgba(47,45,61,0.25)';
        ctx.lineWidth = 1;
        for (const r of [400, 800, 1200]) {
            ctx.beginPath();
            ctx.arc(c, c, (r / RANGE) * R, 0, Math.PI * 2);
            ctx.stroke();
        }
        const p = g.plane;
        const sinY = Math.sin(p.yaw), cosY = Math.cos(p.yaw);
        const place = (X, Z) => {
            const dx = X - p.X, dz = Z - p.Z;
            const f = dx * sinY + dz * cosY; // ahead
            const r = dx * cosY - dz * sinY; // to the right
            if (Math.hypot(f, r) > RANGE)
                return null;
            return [c + (r / RANGE) * R, c - (f / RANGE) * R];
        };
        // Mission targets beyond the rim: an arrow on the rim pointing toward each one.
        for (const t of g.mission.targets) {
            if (!t.alive || !PA.isObjective(t) || place(t.X, t.Z))
                continue;
            const dx = t.X - p.X, dz = t.Z - p.Z;
            const f = dx * sinY + dz * cosY;
            const r = dx * cosY - dz * sinY;
            const ang = Math.atan2(r, f); // from straight ahead, clockwise
            const ex = c + Math.sin(ang) * (R - 8), ey = c - Math.cos(ang) * (R - 8);
            ctx.save();
            ctx.translate(ex, ey);
            ctx.rotate(ang);
            ctx.fillStyle = '#ffe08a';
            ctx.strokeStyle = PA.INK;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(7, 0);
            ctx.lineTo(-5, -5);
            ctx.lineTo(-5, 5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
        // A flying thing is a triangle with its sharp point on its heading, so you can read where it is going.
        const tri = g.felix ? 9 : 6;
        for (const t of g.mission.targets) {
            if (!t.alive || t.h === undefined)
                continue;
            const q = place(t.X, t.Z);
            if (!q)
                continue;
            let heading;
            if (t.faction === 'enemy')
                heading = (_a = t.vH) !== null && _a !== void 0 ? _a : 0;
            else if (t.orbit)
                heading = Math.atan2(-Math.sin(t.orbit.ang), Math.cos(t.orbit.ang));
            else
                heading = 0;
            // Turn the heading into a direction on the radar (up is the plane's nose).
            const rel = heading - p.yaw;
            const dx2 = Math.sin(rel), dy2 = -Math.cos(rel);
            const px = q[0], py = q[1];
            const tipX = px + dx2 * tri, tipY = py + dy2 * tri;
            const bx = px - dx2 * tri * 0.6, by = py - dy2 * tri * 0.6;
            const perpX = -dy2 * tri * 0.55, perpY = dx2 * tri * 0.55;
            ctx.fillStyle = t.faction === 'enemy' ? '#ff3b3b' : '#3d8bff';
            ctx.strokeStyle = PA.INK;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(tipX, tipY);
            ctx.lineTo(bx + perpX, by + perpY);
            ctx.lineTo(bx - perpX, by - perpY);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        for (const t of g.mission.targets) {
            if (!t.alive || t.h !== undefined)
                continue;
            const q = place(t.X, t.Z);
            if (!q)
                continue;
            const info = PA.KINDS[t.kind];
            const gunner = info && info.gun;
            ctx.fillStyle = t.faction === 'enemy' ? '#ff6b6b' : gunner ? '#ffb02e' : DOT[info ? info.group : 'army'];
            ctx.fillRect(Math.round(q[0]) - 2, Math.round(q[1]) - 2, 4, 4);
        }
        for (const h of g.mission.hoops) {
            if (h.passed)
                continue;
            const q = place(h.X, h.Z);
            if (q) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(Math.round(q[0]) - 1, Math.round(q[1]) - 1, 3, 3);
            }
        }
        // The plane: a point at the centre, pointing up (the heading).
        ctx.fillStyle = PA.INK;
        ctx.beginPath();
        ctx.moveTo(c, c - 7);
        ctx.lineTo(c - 5, c + 5);
        ctx.lineTo(c + 5, c + 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        ctx.strokeStyle = PA.INK;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(c, c, R, 0, Math.PI * 2);
        ctx.stroke();
    }
    PA.radar = radar;
})(PA || (PA = {}));
// Boot: the page, the controls (drag or joystick, action buttons), the fading
// settings gear, the HUD, the settings drawer, opt-in errors, and the frame loop.
var PA;
(function (PA) {
    const SETTINGS_KEY = 'pa_warthog.settings';
    const DEFAULTS = {
        mode: 'jet', control: 'drag', view: 'chase', difficulty: 'normal', sound: 1,
        volMusic: 20, volGun: 25, volTurn: 25, volWarn: 60,
        forces: 0, safeFlight: 1, invincible: 0, autoReload: 1,
        enemyWave: 2, allies: 1, showErrors: 0,
    };
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
    // The sound sliders, as 0-1 values for the audio channels.
    function applySound() {
        sound.enabled = settings.sound === 1;
        sound.setVolumes({
            music: settings.volMusic / 100,
            gun: settings.volGun / 100,
            turn: settings.volTurn / 100,
            warn: settings.volWarn / 100,
        });
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
        if (key === 'mode' || key === 'control' || key === 'view' || key === 'difficulty') {
            settings[key] = value;
        }
        else {
            settings[key] = +value;
        }
        if (key === 'sound')
            applySound();
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
        KeyC: 'chaff',
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
            else if (k === 'chaff') {
                if (!e.repeat)
                    game.fireChaff();
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
                wakeGear();
                if (k === 'chaff') {
                    game.fireChaff(); // one press, one burst of chaff
                    return;
                }
                game.held[k] = true;
            });
            const release = () => { if (k !== 'chaff')
                game.held[k] = false; };
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
            game.paused = open;
            sound.setPaused(open);
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
        // A tap in the upper-right corner brings the gear back and opens the settings in one go.
        $('gearHot').addEventListener('pointerdown', e => {
            e.preventDefault();
            wakeGear();
            if (drawer.hidden)
                setOpen(true);
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
        const stock = g.missileStock;
        $('ammo').textContent = g.felix ? '∞' : String(Math.floor(g.ammo));
        $('chaff').textContent = g.felix ? '∞' : String(g.chaff);
        $('tag').hidden = !g.tagged;
        $('tag').textContent = 'TAGGED ' + Math.round(g.tagDist) + ' m';
        const left = Math.max(0, g.objectiveGoal - g.objectiveDone);
        const card = $('missionCard');
        card.hidden = g.missionCard <= 0;
        $('missionTitle').textContent = 'Mission ' + g.missionNumber;
        $('missionBody').textContent = 'Destroy ' + g.objectiveGoal + ' ground targets. Arrows on the radar point to them.';
        $('objective').textContent = g.resupplied > 0
            ? 'Mission complete! Everything restocked.'
            : g.settings.mode === 'glider' ? 'Fly through the rings.'
                : 'Mission ' + g.missionNumber + ': destroy ' + left + ' more ground target' + (left === 1 ? '' : 's');
        const cool = Math.ceil(g.resupplyCool);
        $('reloadBtn').toggleAttribute('disabled', g.felix || cool > 0);
        $('reloadHint').textContent = g.felix ? 'Felix mode never runs out, so no reload is needed.'
            : cool > 0 ? 'The reload is ready again in ' + cool + ' s.'
                : 'Gun back to full, and two missiles back.';
        $('missile').textContent = stock + '/' + PA.MISSILE_MAX + (stock === 0 ? (settings.autoReload === 1 ? ' reloading' : ' empty') : '');
        const a = g.aim;
        $('gun').textContent = a.mode === 'air' ? 'air: straight'
            : a.mode === 'ground' ? (Math.abs(a.pitch) * 180 / Math.PI).toFixed(1) + '° down'
                : 'straight';
        $('speed').textContent = Math.round(p.speed * 1.94) + ' kt';
        $('alt').textContent = Math.round(p.h - PA.groundAt(p.X, p.Z)) + ' m';
        $('aoa').textContent = (p.alpha * 180 / Math.PI).toFixed(0) + '°';
        $('stall').hidden = !p.stalled || g.phase !== 'flying';
    }
    function message() {
        const g = game;
        const p = g.plane;
        if (g.phase === 'crashed')
            return 'Hit! The plane blinks and carries on with a full repair.';
        if (g.phase !== 'flying')
            return '';
        if (g.tagged)
            return 'Missile on you! Hard turn to break it, or drop CHAFF.';
        if (g.floorActive)
            return 'Safe flight: pulling up off the ground.';
        if (settings.invincible === 1)
            return 'Invincible: nothing can hurt you.';
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
    // ---- Notes for improvement (drawer) -----------------------------------
    let noteSort = 'time';
    function noteItem() {
        if (game.phase === 'crashed')
            return 'Hit and carried on';
        if (game.phase === 'landed')
            return 'Glider landed';
        if (game.plane.stalled)
            return 'Stalled';
        return game.settings.mode === 'glider' ? 'Gliding' : 'Flying';
    }
    function renderNotes() {
        const all = PA.loadNotes();
        const list = PA.sortNotes(all, noteSort);
        const c = PA.statusCount(all);
        $('noteCounts').textContent = 'Open ' + c.open + ' · done ' + c.done + ' · closed ' + c.closed + ' (' + all.length + ' in all)';
        document.querySelectorAll('#noteSort button').forEach(b => b.classList.toggle('on', b.dataset.sort === noteSort));
        const box = $('noteList');
        box.textContent = '';
        if (!list.length) {
            const empty = document.createElement('p');
            empty.className = 'hint';
            empty.textContent = 'No notes yet. Write one above while you play.';
            box.appendChild(empty);
            return;
        }
        for (const n of list) {
            const row = document.createElement('div');
            row.className = 'noteRow ' + n.status;
            const head = document.createElement('div');
            head.className = 'noteHead';
            head.textContent = n.identifier + ' · ' + n.sub + ' · ' + n.item;
            const body = document.createElement('p');
            body.className = 'noteBody';
            body.textContent = n.description;
            const ids = document.createElement('p');
            ids.className = 'noteIds';
            ids.textContent = Object.keys(n.ids).map(k => k + ' ' + n.ids[k]).join(' · ');
            const seg = document.createElement('div');
            seg.className = 'seg noteStatus';
            for (const st of ['open', 'done', 'closed']) {
                const b = document.createElement('button');
                b.type = 'button';
                b.textContent = st;
                b.dataset.id = n.identifier;
                b.dataset.status = st;
                b.classList.toggle('on', n.status === st);
                seg.appendChild(b);
            }
            row.append(head, body, ids, seg);
            box.appendChild(row);
        }
    }
    function renderNoteIndex() {
        const box = $('noteIndex');
        box.textContent = '';
        for (const e of PA.INDEX) {
            const p = document.createElement('p');
            p.textContent = e.code + ' · ' + e.name + ': ' + e.meaning + (e.unit ? ' (' + e.unit + ')' : '');
            box.appendChild(p);
        }
    }
    function saveNoteFromScreen() {
        const text = $('noteText');
        if (!text.value.trim()) {
            $('noteHint').textContent = 'Type what should change first.';
            return;
        }
        const note = PA.addNote(text.value, noteItem(), PA.subProject(settings), PA.snapshot(game, settings));
        text.value = '';
        $('noteHint').textContent = 'Saved as ' + note.identifier + ' on this device.';
        renderNotes();
    }
    async function copyNotes() {
        const lines = PA.loadNotes().map(n => [n.identifier, n.status, n.project, n.sub, n.item, n.time, n.description,
            Object.keys(n.ids).map(k => k + '=' + n.ids[k]).join(' ')].join(' | '));
        const text = lines.join('\n') || 'No notes yet.';
        try {
            await navigator.clipboard.writeText(text);
            $('noteHint').textContent = 'Copied ' + lines.length + ' note(s).';
        }
        catch (e) {
            $('noteHint').textContent = 'Could not copy here. Select the list and copy it by hand.';
        }
    }
    // Sliders: each one sets its setting at once and shows its value.
    function bindSliders() {
        document.querySelectorAll('input[type="range"][data-key]').forEach(input => {
            const key = input.dataset.key;
            const label = document.getElementById(input.id + 'Value');
            input.value = String(settings[key]);
            const show = () => { if (label)
                label.textContent = input.value + (input.dataset.unit || ''); };
            show();
            input.addEventListener('input', () => {
                settings[key] = +input.value;
                saveSettings();
                applySound();
                show();
            });
        });
    }
    function bindNotes() {
        $('noteSave').addEventListener('click', saveNoteFromScreen);
        $('noteCopy').addEventListener('click', () => void copyNotes());
        document.querySelectorAll('#noteSort button').forEach(b => {
            b.addEventListener('click', () => {
                noteSort = b.dataset.sort;
                renderNotes();
            });
        });
        $('noteList').addEventListener('click', e => {
            const t = e.target;
            if (t.tagName !== 'BUTTON' || !t.dataset.id)
                return;
            PA.setStatus(t.dataset.id, t.dataset.status);
            renderNotes();
        });
        renderNoteIndex();
        renderNotes();
        bindSliders();
    }
    // ---- Family database sign-in (drawer) ---------------------------------
    function setFamilyStatus(text, ok) {
        const el = $('familyStatus');
        el.textContent = text;
        el.classList.toggle('bad', !ok);
    }
    function renderFamily() {
        const s = PA.loadSession();
        $('familyIn').hidden = !!s;
        $('familyOut').hidden = !s;
        if (s)
            setFamilyStatus('Signed in as ' + s.email + '. Scores can be saved to the family database.', true);
        else
            setFamilyStatus('Not signed in: this device only.', true);
    }
    async function familySignIn() {
        const email = $('familyEmail').value.trim();
        const password = $('familyPassword').value;
        $('familyPassword').value = '';
        if (!email || !password) {
            setFamilyStatus('Type the family email and password first.', false);
            return;
        }
        setFamilyStatus('Signing in…', true);
        try {
            await PA.signIn(email, password);
            renderFamily();
        }
        catch (e) {
            setFamilyStatus(String(e.message || e), false);
        }
    }
    async function familyCheck() {
        setFamilyStatus('Checking…', true);
        const r = await PA.checkSession();
        setFamilyStatus(r.message, r.ok);
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
            const rc = $('radar').getContext('2d');
            if (rc)
                PA.radar(rc, game, 150);
            sound.setFlight(game.held.boost, game.phase === 'flying' && game.settings.mode === 'jet', Math.abs(game.axes.yaw));
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
        $('reloadBtn').addEventListener('click', () => {
            game.reloadFromSettings();
            hud();
        });
        $('familySignIn').addEventListener('click', () => void familySignIn());
        $('familyCheck').addEventListener('click', () => void familyCheck());
        $('familySignOut').addEventListener('click', () => void PA.signOut().then(renderFamily));
        $('familyPassword').addEventListener('keydown', e => { if (e.key === 'Enter')
            void familySignIn(); });
        renderFamily();
        $('again').addEventListener('click', () => restart());
        $('version').textContent = 'Version ' + PA.VERSION;
        applySound();
        bindKeys();
        showTutorial();
        bindDrag();
        bindStick();
        bindActions();
        bindGear();
        bindNotes();
        renderErrors();
        requestAnimationFrame(frame);
    }
    // Only start the page in a browser (the flight test loads this file in Node).
    if (typeof document !== 'undefined')
        boot();
})(PA || (PA = {}));
