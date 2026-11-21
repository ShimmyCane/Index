"use strict";
// Shared numbers for the whole game. Change a number here, rebuild, reload.
var PA;
(function (PA) {
    PA.VERSION = '0.1.0';
    // Internal resolution. The canvas is small on purpose: every pixel is a
    // "pixel-art pixel", and the page scales it up with no smoothing.
    PA.W = 480;
    PA.H = 270;
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
    PA.SEA_X = 1300; // the coast runs north near here; east of it is the sea
    PA.ROAD_X = -120; // the main road runs north along this line
    PA.ROAD_W = 7; // half its width, metres
    // One gentle wind for the whole world (metres a second): smoke and flags lean with it.
    PA.WIND = { X: 2.2, Z: -1.2 };
    PA.RAIL_X = -320; // the railway runs north along this line
    // The ground is flat (the land is shaped by colour, not height), so every object sits
    // exactly on what is drawn. The sea is at the same level.
    function groundAt(_X, _Z) {
        return 0;
    }
    PA.groundAt = groundAt;
    // A repeatable pseudo-random number from a cell (so the same place always looks the same).
    function cellNoise(i, j, salt) {
        let h = (i * 374761393 + j * 668265263 + salt * 2246822519) | 0;
        h = Math.imul(h ^ (h >>> 13), 1274126177);
        return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    }
    PA.cellNoise = cellNoise;
    // Integer hash of a grid point, 0 up to 1.
    function hash2(ix, iz) {
        let h = (ix * 374761393 + iz * 668265263) | 0;
        h = Math.imul(h ^ (h >>> 13), 1274126177);
        return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    }
    PA.hash2 = hash2;
    // Smooth value noise, 0 up to 1: the same place always gives the same value.
    function noise2(x, z) {
        const ix = Math.floor(x), iz = Math.floor(z);
        const fx = x - ix, fz = z - iz;
        const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
        const a = hash2(ix, iz), b = hash2(ix + 1, iz), c = hash2(ix, iz + 1), d = hash2(ix + 1, iz + 1);
        return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
    }
    PA.noise2 = noise2;
    // The coastline wanders a little east and west as it runs north.
    function coastX(Z) {
        return PA.SEA_X - 45 + 90 * noise2(Z / 380, 13.7);
    }
    PA.coastX = coastX;
    function isSea(X, Z = 0) {
        return X > coastX(Z);
    }
    PA.isSea = isSea;
    // One field shapes both lakes and forests: lakes at its peaks, forests on the slopes round them.
    function wildValue(X, Z) {
        return noise2(X / 300 + 31.1, Z / 300 - 7.3) * 0.72 + noise2(X / 90 + 3.7, Z / 90 + 1.9) * 0.28;
    }
    PA.wildValue = wildValue;
    // The kind of country: farms where it is low, towns where it is high, open grass between.
    function regionValue(X, Z) {
        return noise2(X / 900 + 50.5, Z / 900 - 20.25);
    }
    PA.regionValue = regionValue;
    PA.LAKE_LEVEL = 0.74; // wildValue above this is a lake
    PA.FOREST_LEVEL = 0.6; // between this and the lake level is forest
    function isLake(X, Z) {
        if (isSea(X, Z) || Math.abs(X - PA.ROAD_X) < 30 || Math.abs(X - PA.RAIL_X) < 20)
            return false;
        return wildValue(X, Z) > PA.LAKE_LEVEL;
    }
    PA.isLake = isLake;
    function isForest(X, Z) {
        if (isSea(X, Z) || Math.abs(X - PA.ROAD_X) < 16 || Math.abs(X - PA.RAIL_X) < 10)
            return false;
        const w = wildValue(X, Z);
        return w > PA.FOREST_LEVEL && w < PA.LAKE_LEVEL - 0.02;
    }
    PA.isForest = isForest;
    function biomeAt(X, Z) {
        if (isSea(X, Z))
            return 'sea';
        if (isLake(X, Z))
            return 'lake';
        if (isForest(X, Z))
            return 'forest';
        const r = regionValue(X, Z);
        if (r < 0.42)
            return 'farm';
        if (r > 0.66)
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
                const X = PA.RAIL_X;
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
// Voxel models and sprite stacking.
//
// Each object is a small 3-D grid of coloured cubes (voxels): x across (left to right),
// y along (the nose or front at y = 0, the back at the far end), z up from the ground.
// The model is baked once into horizontal slices, one image per layer of voxels. To draw
// it, the slices are stacked from the bottom up, each turned to the camera and squashed
// by the viewing angle. The stack reads as a solid 3-D object from any direction, and it
// changes as you fly round it. This is "sprite stacking".
var PA;
(function (PA) {
    class Voxels {
        // w, l, h: size in voxels. size: metres per voxel.
        constructor(w, l, h, size) {
            this.w = w;
            this.l = l;
            this.h = h;
            this.size = size;
            this.data = new Uint32Array(w * l * h);
        }
        at(x, y, z) {
            return (z * this.l + y) * this.w + x;
        }
        inside(x, y, z) {
            return x >= 0 && y >= 0 && z >= 0 && x < this.w && y < this.l && z < this.h;
        }
        set(x, y, z, rgb) {
            x = Math.floor(x);
            y = Math.floor(y);
            z = Math.floor(z);
            if (this.inside(x, y, z))
                this.data[this.at(x, y, z)] = (rgb & 0xffffff) | 0x1000000;
        }
        clear(x, y, z) {
            x = Math.floor(x);
            y = Math.floor(y);
            z = Math.floor(z);
            if (this.inside(x, y, z))
                this.data[this.at(x, y, z)] = 0;
        }
        get(x, y, z) {
            if (!this.inside(x, y, z))
                return 0;
            return this.data[this.at(x, y, z)];
        }
        // A solid box, from (x0, y0, z0) up to but not including (x1, y1, z1).
        box(x0, y0, z0, x1, y1, z1, rgb) {
            for (let z = Math.floor(z0); z < z1; z++)
                for (let y = Math.floor(y0); y < y1; y++)
                    for (let x = Math.floor(x0); x < x1; x++)
                        this.set(x, y, z, rgb);
            return this;
        }
        // Remove a box of voxels (to shape a slope, a notch or a gap).
        cut(x0, y0, z0, x1, y1, z1) {
            for (let z = Math.floor(z0); z < z1; z++)
                for (let y = Math.floor(y0); y < y1; y++)
                    for (let x = Math.floor(x0); x < x1; x++)
                        this.clear(x, y, z);
            return this;
        }
        // An ellipsoid centred at (cx, cy, cz) with radii rx, ry, rz (in voxels).
        ellipsoid(cx, cy, cz, rx, ry, rz, rgb) {
            for (let z = Math.floor(cz - rz); z <= cz + rz; z++)
                for (let y = Math.floor(cy - ry); y <= cy + ry; y++)
                    for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
                        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, dz = (z + 0.5 - cz) / rz;
                        if (dx * dx + dy * dy + dz * dz <= 1)
                            this.set(x, y, z, rgb);
                    }
            return this;
        }
        // A tube running along y (front to back), with an elliptical cross-section.
        tubeY(cx, cz, y0, y1, rx, rz, rgb) {
            for (let y = Math.floor(y0); y < y1; y++)
                for (let z = Math.floor(cz - rz); z <= cz + rz; z++)
                    for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
                        const dx = (x + 0.5 - cx) / rx, dz = (z + 0.5 - cz) / rz;
                        if (dx * dx + dz * dz <= 1)
                            this.set(x, y, z, rgb);
                    }
            return this;
        }
        // A tube running along x (side to side).
        tubeX(cy, cz, x0, x1, ry, rz, rgb) {
            for (let x = Math.floor(x0); x < x1; x++)
                for (let z = Math.floor(cz - rz); z <= cz + rz; z++)
                    for (let y = Math.floor(cy - ry); y <= cy + ry; y++) {
                        const dy = (y + 0.5 - cy) / ry, dz = (z + 0.5 - cz) / rz;
                        if (dy * dy + dz * dz <= 1)
                            this.set(x, y, z, rgb);
                    }
            return this;
        }
        // A round column or cone standing on the ground, radius r0 at the bottom and r1 at the top.
        cone(cx, cy, z0, z1, r0, r1, rgb) {
            for (let z = Math.floor(z0); z < z1; z++) {
                const t = (z - z0) / Math.max(1, z1 - z0 - 1);
                const r = r0 + (r1 - r0) * t;
                for (let y = Math.floor(cy - r); y <= cy + r; y++)
                    for (let x = Math.floor(cx - r); x <= cx + r; x++) {
                        const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
                        if (dx * dx + dy * dy <= r * r)
                            this.set(x, y, z, rgb);
                    }
            }
            return this;
        }
        // A pitched roof over the rectangle x0..x1, y0..y1, starting at height z0.
        // The ridge runs along x when alongX, otherwise along y.
        roof(x0, y0, x1, y1, z0, alongX, rgb, ridge) {
            const span = alongX ? y1 - y0 : x1 - x0;
            const layers = Math.ceil(span / 2);
            for (let k = 0; k < layers; k++) {
                const z = z0 + k;
                const col = k === layers - 1 && ridge !== undefined ? ridge : rgb;
                if (alongX)
                    this.box(x0, y0 + k, z, x1, y1 - k, z + 1, col);
                else
                    this.box(x0 + k, y0, z, x1 - k, y1, z + 1, col);
            }
            return this;
        }
        // Change the colour of every voxel by a rule (for patterns: windows, camouflage, stripes).
        paint(rule) {
            for (let z = 0; z < this.h; z++)
                for (let y = 0; y < this.l; y++)
                    for (let x = 0; x < this.w; x++) {
                        const v = this.data[this.at(x, y, z)];
                        if (!v)
                            continue;
                        const next = rule(x, y, z, v & 0xffffff);
                        if (next === null)
                            this.data[this.at(x, y, z)] = 0;
                        else
                            this.data[this.at(x, y, z)] = (next & 0xffffff) | 0x1000000;
                    }
            return this;
        }
    }
    PA.Voxels = Voxels;
    function shadeRGB(rgb, f) {
        const r = Math.min(255, ((rgb >> 16) & 255) * f);
        const g = Math.min(255, ((rgb >> 8) & 255) * f);
        const b = Math.min(255, (rgb & 255) * f);
        return [r, g, b];
    }
    // Bake the voxels into slices. Light is baked in: top faces bright, sides darker, the
    // lower layers a little darker again (shade under the body), a soft lit side on the left,
    // and a tiny variation per voxel so surfaces are not flat.
    function bake(v) {
        const slices = [];
        let top = 0, sr = 0, sg = 0, sb = 0, n = 0;
        for (let z = 0; z < v.h; z++) {
            let any = false;
            const img = new ImageData(v.w, v.l);
            for (let y = 0; y < v.l; y++) {
                for (let x = 0; x < v.w; x++) {
                    const c = v.get(x, y, z);
                    if (!c)
                        continue;
                    any = true;
                    const rgb = c & 0xffffff;
                    const exposedTop = !v.get(x, y, z + 1);
                    let f = exposedTop ? 1.1 : 0.8;
                    f *= 0.82 + 0.18 * (z / Math.max(1, v.h - 1));
                    if (!v.get(x - 1, y, z))
                        f *= 1.05;
                    if (!v.get(x + 1, y, z))
                        f *= 0.93;
                    if (!v.get(x, y - 1, z))
                        f *= 1.02;
                    if (!v.get(x, y + 1, z))
                        f *= 0.95;
                    f *= 0.97 + 0.06 * PA.hash2(x * 7 + z * 131, y * 13 + z * 17);
                    const [r, g, b] = shadeRGB(rgb, f);
                    const o = (y * v.w + x) * 4;
                    img.data[o] = r;
                    img.data[o + 1] = g;
                    img.data[o + 2] = b;
                    img.data[o + 3] = 255;
                    if (exposedTop) {
                        sr += r;
                        sg += g;
                        sb += b;
                        n++;
                    }
                }
            }
            if (!any) {
                slices.push(null);
                continue;
            }
            top = z;
            const cv = document.createElement('canvas');
            cv.width = v.w;
            cv.height = v.l;
            const cx = cv.getContext('2d');
            if (cx)
                cx.putImageData(img, 0, 0);
            slices.push(cv);
        }
        const avg = n ? 'rgb(' + Math.round(sr / n) + ',' + Math.round(sg / n) + ',' + Math.round(sb / n) + ')' : '#888';
        return { w: v.w, l: v.l, h: v.h, size: v.size, slices, top, avg };
    }
    PA.bake = bake;
    // The 2-D part of the placement, shared by the drawing and by modelToScreen.
    function frame(m, p) {
        const sinE = Math.max(0.14, Math.sin(p.elev));
        const cosE = Math.cos(Math.min(Math.PI / 2, Math.max(0, p.elev)));
        const cr = Math.cos(p.roll), sr = Math.sin(p.roll);
        const cy = Math.cos(p.yaw), sy = Math.sin(p.yaw);
        // Linear map: rotate by yaw, squash by the viewing angle, roll, scale.
        const a = (cr * cy - sr * sinE * sy) * p.px;
        const b = (sr * cy + cr * sinE * sy) * p.px;
        const c = (-cr * sy - sr * sinE * cy) * p.px;
        const d = (-sr * sy + cr * sinE * cy) * p.px;
        const step = p.px * cosE; // screen pixels from one layer to the next
        return { a, b, c, d, cr, sr, step };
    }
    // Where a point of the model (in voxels) lands on the screen.
    function modelToScreen(m, p, mx, my, mz) {
        const f = frame(m, p);
        const lx = mx - m.w / 2, ly = my - m.l / 2;
        const off = mz * f.step;
        return [p.sx + f.a * lx + f.c * ly + f.sr * off, p.sy + f.b * lx + f.d * ly - f.cr * off];
    }
    PA.modelToScreen = modelToScreen;
    // Draw the stack. Far away it becomes a few layers, then a single dot.
    function drawModel(ctx, m, p) {
        const wide = Math.max(m.w, m.l) * p.px;
        if (wide < 2.5) {
            ctx.fillStyle = m.avg;
            ctx.fillRect(Math.round(p.sx - 1), Math.round(p.sy - 2), 2, 2);
            return;
        }
        const f = frame(m, p);
        const ex = -(f.a * (m.w / 2) + f.c * (m.l / 2));
        const ey = -(f.b * (m.w / 2) + f.d * (m.l / 2));
        const sub = Math.min(5, Math.max(1, Math.ceil(f.step)));
        const skip = wide < 9 ? 2 : 1;
        const sway = p.sway || 0;
        for (let z = 0; z <= m.top; z += skip) {
            const slice = m.slices[z];
            if (!slice)
                continue;
            // The higher the layer, the further it leans (the sway grows with the square of the height).
            const k = m.top > 0 ? (z / m.top) * (z / m.top) * sway : 0;
            for (let s = 0; s < sub; s++) {
                const off = (z + s / sub) * f.step;
                ctx.setTransform(f.a, f.b, f.c, f.d, p.sx + ex + f.sr * off + f.cr * k, p.sy + ey - f.cr * off + f.sr * k);
                ctx.drawImage(slice, 0, 0);
            }
        }
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    PA.drawModel = drawModel;
    const stackCache = new Map();
    const CACHE_MAX = 320;
    const SIZES = [32, 64, 128, 256]; // square canvases, reused, never resized
    const spare = SIZES.map(() => []);
    PA.cacheStats = { hits: 0, misses: 0 };
    const NEW_PER_FRAME = 8; // at most this many new stacks a frame; the rest draw layer by layer
    let madeThisFrame = 0;
    function cacheFrame() { madeThisFrame = 0; }
    PA.cacheFrame = cacheFrame;
    function drawModelCached(ctx, m, id, p) {
        const wide = Math.max(m.w, m.l) * p.px;
        if (wide < 9) {
            drawModel(ctx, m, p);
            return;
        } // small ones are cheap already
        const eb = Math.round(Math.max(0, Math.min(Math.PI / 2, p.elev)) / 0.05);
        const pb = Math.round(Math.log(p.px) / Math.log(1.1));
        const yb = Math.round((((p.yaw % 6.2832) + 6.2832) % 6.2832) / (Math.PI / 2)) % 4;
        const key = id + '|' + yb + '|' + eb + '|' + pb;
        let e = stackCache.get(key);
        if (e) {
            stackCache.delete(key);
            stackCache.set(key, e); // keep the most used at the end
            PA.cacheStats.hits++;
        }
        else {
            if (madeThisFrame >= NEW_PER_FRAME) {
                drawModel(ctx, m, p);
                return;
            }
            const px = Math.pow(1.1, pb);
            const q = { sx: 0, sy: 0, px, yaw: yb * (Math.PI / 2), elev: eb * 0.05, roll: 0 };
            const f = frame(m, q);
            let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
            for (const [lx, ly] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
                const x = f.a * lx * m.w / 2 + f.c * ly * m.l / 2, y = f.b * lx * m.w / 2 + f.d * ly * m.l / 2;
                x0 = Math.min(x0, x);
                x1 = Math.max(x1, x);
                y0 = Math.min(y0, y);
                y1 = Math.max(y1, y);
            }
            const lift = (m.top + 1) * f.step;
            const need = Math.max(x1 - x0, y1 - y0 + lift) + 4;
            const cls = SIZES.findIndex(n => n >= need);
            if (cls < 0) {
                drawModel(ctx, m, p);
                return;
            } // too big to keep: draw it directly
            madeThisFrame++;
            PA.cacheStats.misses++;
            if (stackCache.size >= CACHE_MAX) {
                const old = stackCache.keys().next().value;
                const o = stackCache.get(old);
                stackCache.delete(old);
                spare[o.cls].push(o.img);
            }
            let img = spare[cls].pop();
            if (!img) {
                img = document.createElement('canvas');
                img.width = img.height = SIZES[cls];
            }
            const g = img.getContext('2d');
            g.setTransform(1, 0, 0, 1, 0, 0);
            g.clearRect(0, 0, img.width, img.height);
            g.imageSmoothingEnabled = false;
            const ox = Math.ceil(-x0) + 2, oy = Math.ceil(-y0 + lift) + 2;
            q.sx = ox;
            q.sy = oy;
            drawModel(g, m, q);
            e = { img, cls, ox, oy, px, lift };
            stackCache.set(key, e);
        }
        // Place it: scale to the exact size, turn by the roll, and lean the top by the sway.
        const s = p.px / e.px;
        const cr = Math.cos(p.roll), sr = Math.sin(p.roll);
        const lean = e.lift > 1 ? -(p.sway || 0) / (e.lift * s) : 0; // sideways per pixel of height
        // Matrix = translate(sx,sy) * rotate(roll) * scale(s) * shear(lean)
        ctx.setTransform(cr * s, sr * s, (cr * lean - sr) * s, (sr * lean + cr) * s, p.sx, p.sy);
        ctx.drawImage(e.img, -e.ox, -e.oy);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    PA.drawModelCached = drawModelCached;
})(PA || (PA = {}));
// The 3-D models, each built from voxels in code (no image files). Every model faces its
// front toward y = 0. Colours are a warm, modern palette; light is baked in by bake().
var PA;
(function (PA) {
    // Pick one of a few colours by a repeatable hash, for natural variation.
    function pick(list, x, y, z) {
        return list[Math.floor(PA.hash2(x * 31 + z * 7, y * 17 + z * 3) * list.length) % list.length];
    }
    const A10_GREY = 0xa6b0b8, A10_DARK = 0x7d878f, A10_CAMO = 0x8e9a8c, GLASS = 0x7fd0f5, EXHAUST = 0xffb347;
    // The A-10 Warthog: a straight high wing, twin tails, two engines high on the back, and
    // the long nose with its gun. 18 m across.
    function a10() {
        const v = new PA.Voxels(36, 34, 12, 0.5);
        // Fuselage: thick in the middle, tapering to the nose and the tail.
        for (let y = 1; y < 32; y++) {
            let r = 2.4;
            if (y < 6)
                r = 1.1 + (y - 1) * 0.28;
            if (y > 25)
                r = 2.4 - (y - 25) * 0.24;
            v.tubeY(18, 3.6, y, y + 1, r, r * 0.9, A10_GREY);
        }
        v.box(17, 0, 3, 19, 1, 4, 0x3a3f44); // the gun at the nose
        v.ellipsoid(18, 8.5, 5.6, 1.6, 2.8, 1.4, GLASS); // canopy
        v.set(18, 7, 6, 0xd4f3ff); // a glint on the glass
        // Wing, with darker tips and stores hanging under it.
        v.box(1, 12, 3, 35, 17, 4, A10_GREY);
        for (const x of [1, 2, 33, 34])
            v.cut(x, 16, 3, x + 1, 17, 4);
        v.box(1, 12, 3, 2, 16, 4, 0x929ca4).box(34, 12, 3, 35, 16, 4, 0x929ca4);
        for (const x of [9, 27])
            v.box(x, 13, 2, x + 1, 16, 3, 0x7b848b);
        // Engines high on the back, each with a dark intake and a hot exhaust.
        for (const cx of [13.5, 22.5]) {
            v.tubeY(cx, 6.8, 18, 26, 1.8, 1.7, 0x8d969e);
            v.tubeY(cx, 6.8, 18, 19, 1.2, 1.1, 0x40464c);
            v.tubeY(cx, 6.8, 25, 26, 1.2, 1.1, EXHAUST);
        }
        v.box(14, 20, 4, 23, 24, 6, 0x8d969e); // engine pylons
        // Tailplane and the two fins.
        v.box(8, 27, 4, 28, 30, 5, A10_GREY);
        for (const x0 of [8, 26]) {
            v.box(x0, 25, 4, x0 + 2, 31, 11, A10_GREY);
            v.box(x0, 25, 10, x0 + 2, 31, 11, A10_DARK);
        }
        // Two-tone camouflage on the top surfaces, and a roundel on each wing.
        v.paint((x, y, z, c) => (c === A10_GREY && PA.noise2(x / 4, y / 4 + z) > 0.62) ? A10_CAMO : c);
        for (const cx of [7, 29]) {
            v.ellipsoid(cx, 14.5, 3.5, 1.6, 1.6, 0.6, 0x3d6db5);
            v.set(cx, 14, 3, 0xf4f4f4);
        }
        return v;
    }
    // The classic paper dart: a pointed sheet folded down the middle, the wings tilted up a little.
    function glider() {
        const v = new PA.Voxels(27, 30, 6, 0.45);
        for (let y = 0; y < 30; y++) {
            const half = Math.min(12.5, (y / 29) * 13);
            for (let d = 0; d <= half; d++) {
                const z = 2 + Math.floor(d * 0.2);
                const edge = d > half - 1.2;
                const fold = Math.abs(d - half * 0.5) < 0.6;
                const col = edge && y > 20 ? 0xf07c6a : fold ? 0xe6e0d2 : 0xfbf8f0;
                v.set(13 + d, y, z, col);
                v.set(13 - d, y, z, col);
            }
            if (y > 5)
                v.box(13, y, 0, 14, y + 1, 2, 0xefe9dc); // the folded keel underneath
        }
        return v;
    }
    // A fighter jet: delta wings, two canted fins, and a glowing exhaust.
    function fighter(body, dark, glass) {
        const v = new PA.Voxels(22, 26, 8, 0.5);
        for (let y = 1; y < 25; y++) {
            const r = y < 6 ? 0.6 + (y - 1) * 0.22 : 1.7;
            v.tubeY(11, 3, y, y + 1, r, r, body);
        }
        for (let y = 10; y < 23; y++) {
            const half = (y - 10) * 0.75;
            v.box(11 - half, y, 3, 11 + half + 1, y + 1, 4, body);
        }
        for (const x of [8, 13])
            v.box(x, 19, 4, x + 1, 25, 8, dark);
        v.ellipsoid(11, 7, 4.4, 1.1, 2.2, 1, glass);
        v.tubeY(11, 3, 24, 25, 1, 1, EXHAUST);
        return v;
    }
    // Main battle tank: tracks, a sloped hull, a round turret and a long gun.
    function tankMbt() {
        const v = new PA.Voxels(14, 24, 8, 0.42);
        v.box(0, 5, 0, 3, 23, 2, 0x4c5157).box(11, 5, 0, 14, 23, 2, 0x4c5157);
        v.paint((x, y, z, c) => (c === 0x4c5157 && y % 2 === 0 && z === 1) ? 0x5e646b : c);
        v.box(2, 6, 1, 12, 22, 4, 0x7d8a55);
        v.cut(2, 6, 3, 12, 7, 4); // the sloped front
        v.paint((x, y, z, c) => c === 0x7d8a55 && PA.noise2(x / 3 + 5, y / 3) > 0.66 ? 0x66733f : c);
        return v;
    }
    // The main tank's turret and gun, drawn on its own so it can turn toward the plane.
    // The turret ring sits at the middle of the model; the gun points to the front (y = 0).
    function turretMbt() {
        const v = new PA.Voxels(10, 20, 4, 0.42);
        v.ellipsoid(5, 10, 0.8, 3.6, 4.4, 1.7, 0x8a9862);
        v.box(4, 11, 2, 6, 13, 3, 0x5f6b40); // hatch
        v.tubeY(5, 1, 0, 8, 0.6, 0.6, 0x4f5a36);
        v.box(4, 0, 0, 6, 1, 2, 0x3a4228); // muzzle
        v.paint((x, y, z, c) => c === 0x8a9862 && PA.noise2(x / 3 + 9, y / 3) > 0.66 ? 0x66733f : c);
        return v;
    }
    function tankLight() {
        const v = new PA.Voxels(12, 20, 7, 0.4);
        v.box(0, 4, 0, 2, 19, 2, 0x4c5157).box(10, 4, 0, 12, 19, 2, 0x4c5157);
        v.box(1, 5, 1, 11, 18, 3, 0xc9b27a);
        return v;
    }
    function turretLight() {
        const v = new PA.Voxels(8, 16, 3, 0.4);
        v.ellipsoid(4, 8, 0.8, 2.8, 3.2, 1.3, 0xd6c08a);
        v.tubeY(4, 1, 0, 7, 0.5, 0.5, 0x6b5f3e);
        return v;
    }
    // Armoured carrier: a boxy hull on eight wheels, a hatch and an aerial.
    function apc() {
        const v = new PA.Voxels(12, 20, 9, 0.42);
        for (const y of [4, 8, 12, 16]) {
            v.tubeX(y, 1.4, 0, 1.6, 1.4, 1.4, 0x33383d);
            v.tubeX(y, 1.4, 10.4, 12, 1.4, 1.4, 0x33383d);
        }
        v.box(1, 2, 1, 11, 19, 5, 0x6f8f5a);
        v.cut(1, 2, 4, 11, 4, 5);
        v.box(4, 10, 5, 8, 13, 6, 0x5d7a4a);
        v.box(9, 15, 5, 10, 16, 9, 0x2f3438);
        return v;
    }
    // Cargo truck: an orange cab and a covered load.
    function truck(cab, load) {
        const v = new PA.Voxels(10, 21, 9, 0.4);
        for (const y of [3, 13, 17]) {
            v.tubeX(y, 1.2, 0, 1.2, 1.2, 1.2, 0x2f3438);
            v.tubeX(y, 1.2, 8.8, 10, 1.2, 1.2, 0x2f3438);
        }
        v.box(1, 0, 1, 9, 5, 6, cab);
        v.box(2, 0, 4, 8, 1, 5, 0x9fd8f0); // windscreen
        v.box(1, 6, 1, 9, 20, 2, 0x6b5440);
        v.tubeY(5, 4.2, 6, 20, 4, 3, load);
        v.paint((x, y, z, c) => (z < 2 ? (c === load ? null : c) : c));
        return v;
    }
    function fuelTruck() {
        const v = new PA.Voxels(10, 21, 9, 0.4);
        for (const y of [3, 13, 17]) {
            v.tubeX(y, 1.2, 0, 1.2, 1.2, 1.2, 0x2f3438);
            v.tubeX(y, 1.2, 8.8, 10, 1.2, 1.2, 0x2f3438);
        }
        v.box(1, 0, 1, 9, 5, 6, 0xe07b53);
        v.box(2, 0, 4, 8, 1, 5, 0x9fd8f0);
        v.tubeY(5, 4.6, 6, 20, 3.8, 3.4, 0xe9edf0);
        v.paint((x, y, z, c) => (c === 0xe9edf0 && z === 4 ? 0xe05a4a : c));
        return v;
    }
    // SAM launcher: a carrier with four white missiles tilted up, and a radar dish on a mast.
    function sam() {
        const v = new PA.Voxels(14, 20, 13, 0.45);
        for (const y of [4, 10, 16]) {
            v.tubeX(y, 1.3, 0, 1.4, 1.3, 1.3, 0x2f3438);
            v.tubeX(y, 1.3, 12.6, 14, 1.3, 1.3, 0x2f3438);
        }
        v.box(1, 2, 1, 13, 19, 4, 0x7d8a55);
        v.box(3, 9, 4, 11, 16, 5, 0x66733f);
        for (const x of [3, 5, 8, 10]) {
            for (let k = 0; k < 9; k++)
                v.set(x, 15 - k, 5 + k * 0.75, k > 6 ? 0xe05555 : 0xf2f2f2);
        }
        v.cone(11.5, 4, 4, 9, 0.6, 0.5, 0x5f676d);
        return v;
    }
    // The SAM's radar dish: a thin upright disc that spins on its mast.
    function samDish() {
        const v = new PA.Voxels(6, 4, 5, 0.45);
        v.ellipsoid(3, 2, 2.5, 2.8, 0.8, 2.4, 0xdde1e4);
        v.set(3, 1, 2, 0x8e979d);
        return v;
    }
    // What is left of something destroyed: charred, broken blocks with a few glowing embers.
    function wreck() {
        const v = new PA.Voxels(14, 14, 5, 0.5);
        v.ellipsoid(7, 7, 0, 6.5, 6, 1.2, 0x2f2a28); // scorched patch
        v.box(3, 4, 1, 9, 9, 3, 0x3b3735); // the hull, burnt out
        v.box(6, 2, 1, 11, 6, 2, 0x4a4542);
        v.box(4, 9, 1, 7, 12, 4, 0x332f2d); // a broken piece standing up
        v.box(9, 8, 1, 12, 10, 2, 0x55504c);
        v.paint((x, y, z, c) => ((x * 7 + y * 13 + z * 5) % 11 === 0 ? 0xe8742c : (x + y) % 3 === 0 ? c - 0x080808 : c));
        return v;
    }
    // A flag pole at each base. The flag itself is drawn waving in the wind.
    function flagpole() {
        const v = new PA.Voxels(4, 4, 30, 0.5);
        v.box(0, 0, 0, 4, 4, 1, 0x9aa0a6); // base
        v.box(1, 1, 1, 3, 3, 29, 0xd8dde2); // pole
        v.box(1, 1, 29, 3, 3, 30, 0xf2c94c); // gold top
        return v;
    }
    // A windmill on the farms: a white tower with a red cap. Its sails are drawn turning.
    function windmill() {
        const v = new PA.Voxels(10, 10, 22, 0.7);
        v.cone(5, 5, 0, 18, 3.8, 2.2, 0xf2ede3);
        v.paint((x, y, z, c) => (z % 5 === 0 ? 0xe2dccf : c));
        v.box(4, 2, 5, 6, 3, 9, 0x8a5a3c); // door
        v.cone(5, 5, 18, 22, 2.8, 0.5, 0xc4473d); // cap
        return v;
    }
    // Flak gun in a ring of sandbags, two barrels raised.
    function flak() {
        const v = new PA.Voxels(13, 13, 8, 0.45);
        for (let y = 0; y < 13; y++)
            for (let x = 0; x < 13; x++) {
                const d = Math.hypot(x + 0.5 - 6.5, y + 0.5 - 6.5);
                if (d > 4.6 && d < 6.4)
                    v.box(x, y, 0, x + 1, y + 1, 2, pick([0xcbb37b, 0xbfa66d, 0xd6bf88], x, y, 0));
            }
        v.box(5, 5, 0, 8, 8, 3, 0x6b7378);
        for (const x of [5, 7])
            for (let k = 0; k < 7; k++)
                v.set(x, 6 - k * 0.8, 3 + k * 0.65, 0x3f454b);
        return v;
    }
    // A farm house: cream walls, windows, a door, a red pitched roof and a chimney.
    function house(wall, roof) {
        const v = new PA.Voxels(16, 14, 14, 0.6);
        v.box(1, 1, 0, 15, 13, 7, wall);
        v.paint((x, y, z, c) => {
            const face = x === 1 || x === 14 || y === 1 || y === 12;
            if (face && z >= 3 && z <= 4 && ((x + y) % 4 === 1))
                return 0x8ccfe8;
            return c;
        });
        v.box(7, 1, 0, 9, 2, 4, 0x8a5a3c); // door
        v.roof(0, 0, 16, 14, 7, true, roof, shade(roof, 0.8));
        v.box(11, 4, 8, 13, 6, 13, 0xb85c45); // chimney
        return v;
    }
    function shade(rgb, f) {
        const r = Math.min(255, Math.round(((rgb >> 16) & 255) * f));
        const g = Math.min(255, Math.round(((rgb >> 8) & 255) * f));
        const b = Math.min(255, Math.round((rgb & 255) * f));
        return (r << 16) | (g << 8) | b;
    }
    // A red barn with white trim, big doors and a grey roof.
    function barn() {
        const v = new PA.Voxels(16, 20, 15, 0.6);
        v.box(1, 1, 0, 15, 19, 8, 0xc4473d);
        v.paint((x, y, z, c) => ((x === 1 || x === 14) && (y === 1 || y === 18)) ? 0xf5f0e6 : c);
        v.box(5, 1, 0, 11, 2, 6, 0xa53a32);
        v.paint((x, y, z, c) => (y === 1 && x >= 5 && x < 11 && z < 6 && (x - 5 === z || 10 - x === z)) ? 0xf5f0e6 : c);
        v.roof(0, 0, 16, 20, 8, false, 0x6f7d7a, 0x5c6866);
        return v;
    }
    // A city tower block: a pale body, rows of windows (some lit), and a roof with machinery.
    function tower(storeys, body) {
        const h = storeys * 3 + 3;
        const v = new PA.Voxels(12, 12, h, 0.9);
        v.box(1, 1, 0, 11, 11, h - 2, body);
        v.box(1, 1, 0, 11, 11, 2, 0xc96f5a); // shop fronts at street level
        v.paint((x, y, z, c) => {
            const face = x === 1 || x === 10 || y === 1 || y === 10;
            if (!face || z < 3 || z >= h - 2 || z % 3 !== 1)
                return c;
            if ((x + y) % 2 !== 0)
                return c;
            return PA.hash2(x * 11 + z, y * 5 + z * 3) > 0.8 ? 0xffe39a : 0x8fc6e8;
        });
        v.box(1, 1, h - 2, 11, 11, h - 1, shade(body, 0.75));
        v.box(3, 3, h - 1, 6, 6, h, 0x9aa3ab);
        v.box(7, 6, h - 1, 9, 8, h, 0x9aa3ab);
        return v;
    }
    function barracks() {
        const v = new PA.Voxels(24, 12, 9, 0.6);
        v.box(1, 1, 0, 23, 11, 5, 0x8a9a6a);
        v.paint((x, y, z, c) => ((y === 1 || y === 10) && z === 3 && x % 3 === 1) ? 0x8ccfe8 : c);
        v.box(11, 1, 0, 13, 2, 3, 0x5a4632);
        v.roof(0, 0, 24, 12, 5, true, 0x6e7a72, 0x5d6862);
        return v;
    }
    // An aircraft hangar: an arched roof with ribs, and a wide dark door.
    function hangar() {
        const v = new PA.Voxels(22, 26, 12, 0.8);
        for (let y = 1; y < 25; y++)
            for (let z = 0; z < 12; z++)
                for (let x = 0; x < 22; x++) {
                    const dx = (x + 0.5 - 11) / 11, dz = (z + 0.5) / 11.5;
                    if (dx * dx + dz * dz <= 1)
                        v.set(x, y, z, y % 4 === 0 ? 0x9aa4ad : 0xb7c0c8);
                }
        v.paint((x, y, z, c) => (y === 1 && Math.abs(x + 0.5 - 11) < 7 && z < 8) ? 0x545b62 : c);
        return v;
    }
    // A warship: a pointed grey hull with a red waterline, a bridge, a funnel, a mast and a gun.
    function ship() {
        const v = new PA.Voxels(12, 42, 12, 0.7);
        for (let y = 0; y < 42; y++) {
            let hw = 5.5;
            if (y < 11)
                hw = 0.8 + y * 0.45;
            if (y > 36)
                hw = 5.5 - (y - 36) * 0.4;
            v.box(6 - hw, y, 0, 6 + hw, y + 1, 3, 0x6f7a84);
            v.box(6 - hw, y, 0, 6 + hw, y + 1, 1, 0xb64a42);
            v.box(6 - hw, y, 3, 6 + hw, y + 1, 4, 0x9aa5ad);
        }
        v.box(3, 18, 4, 9, 28, 7, 0xc8cfd5);
        v.paint((x, y, z, c) => (c === 0xc8cfd5 && z === 6 && (x === 3 || x === 8) && y % 2 === 0) ? 0x3e4a55 : c);
        v.box(4, 16, 7, 8, 21, 9, 0xd6dce1);
        v.cone(6, 20, 9, 12, 0.5, 0.4, 0x5f676d);
        v.box(5, 28, 4, 7, 32, 9, 0x3e4a55);
        v.ellipsoid(6, 9, 4.3, 1.7, 1.7, 0.9, 0xb0b9c0);
        v.tubeY(6, 4.6, 4, 9, 0.4, 0.4, 0x4f5860);
        return v;
    }
    function wagon() {
        const v = new PA.Voxels(8, 20, 8, 0.45);
        for (const y of [3, 16])
            v.box(1, y - 2, 0, 7, y + 2, 2, 0x33383d);
        v.box(0, 1, 2, 8, 19, 7, 0x8a5a3c);
        v.paint((x, y, z, c) => (c === 0x8a5a3c && y % 3 === 0) ? 0x744a30 : c);
        v.box(0, 1, 7, 8, 19, 8, 0x6f4a32);
        return v;
    }
    // Trees: a round one, a pine, an autumn one, a blossom tree and a bush.
    function roundTree(colors) {
        const v = new PA.Voxels(10, 10, 12, 0.8);
        v.cone(5, 5, 0, 5, 0.8, 0.7, 0x7a5236);
        v.ellipsoid(5, 5, 7.5, 4.2, 4.2, 3.8, colors[0]);
        v.paint((x, y, z, c) => (c === colors[0] ? pick(colors, x, y, z) : c));
        return v;
    }
    function pine() {
        const v = new PA.Voxels(10, 10, 14, 0.8);
        v.cone(5, 5, 0, 3, 0.7, 0.7, 0x6e4a30);
        v.cone(5, 5, 2, 14, 4.4, 0.4, 0x3f8f58);
        v.paint((x, y, z, c) => (c === 0x3f8f58 ? pick([0x3f8f58, 0x357d4d, 0x4ea066], x, y, z) : c));
        return v;
    }
    function bush() {
        const v = new PA.Voxels(8, 8, 6, 0.7);
        v.ellipsoid(4, 4, 2.5, 3.6, 3.6, 2.6, 0x6cbf5c);
        v.paint((x, y, z, c) => pick([0x6cbf5c, 0x5aae52, 0x86cf6c], x, y, z));
        return v;
    }
    // Every model by name. City towers and trees have several versions.
    PA.MODEL_BUILDERS = {
        plane: a10,
        glider,
        fighter: () => fighter(0xc4515a, 0x8e3640, 0x2f3b4a),
        ally: () => fighter(0x4f8fe0, 0x2e5d9e, 0xffd77a),
        jet: () => fighter(0xc9ced3, 0x9aa1a8, 0x3a4652),
        tank_mbt: tankMbt,
        turret_mbt: turretMbt,
        tank_light: tankLight,
        turret_light: turretLight,
        samdish: samDish,
        windmill,
        wreck,
        flagpole,
        apc,
        truck: () => truck(0xe07b53, 0xc9b07e),
        fuel: fuelTruck,
        sam,
        flak,
        farm: () => house(0xf4e7cc, 0xd65a4a),
        house1: () => house(0xe8eef2, 0x5b8fbf),
        house2: () => house(0xf6dcc4, 0x7aa86a),
        barn,
        city: () => tower(6, 0xe9e4da),
        city1: () => tower(8, 0xd6e1ea),
        city2: () => tower(10, 0xf0d6c6),
        barracks,
        hangar,
        ship,
        rail: wagon,
        tree0: () => roundTree([0x6cbf5c, 0x5aae52, 0x7fcd6a]),
        tree1: pine,
        tree2: () => roundTree([0xe9a043, 0xd9822f, 0xf2b85a]),
        tree3: () => roundTree([0xf3a7c4, 0xf7c6d8, 0xe98fb3]),
        tree4: bush,
    };
    const baked = {};
    // The baked model by name (built and baked the first time it is asked for).
    function model(name) {
        if (!baked[name])
            baked[name] = PA.bake(PA.MODEL_BUILDERS[name]());
        return baked[name];
    }
    PA.model = model;
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
    const WRECK_LIFE = 50; // seconds a wreck burns and smokes
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
            this.wrecks = []; // burning remains
            this.bases = []; // where each base's flag stands
            this.marks = [];
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
            this.wrecks = [];
            this.bases = [];
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
            this.burnWrecks(dt);
            this.updateMarks(dt);
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
        // Dust is kicked up when the plane is low and moving fast.
        emitDust() {
            const p = this.plane;
            const agl = p.h - PA.groundAt(p.X, p.Z);
            if (agl > 6 || p.speed < 40 || this.rand() > 0.35)
                return;
            this.puffs.push({
                X: p.X + (this.rand() - 0.5) * 10, Z: p.Z + (this.rand() - 0.5) * 10, h: PA.groundAt(p.X, p.Z) + 0.5,
                vX: (this.rand() - 0.5) * 6, vY: 2 + this.rand() * 3, vZ: (this.rand() - 0.5) * 6,
                life: 0.6, max: 0.6, color: '#e6dcc0', size: 2 + this.rand() * 2, kind: 'dust',
            });
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
                // Felix (easy) has a quarter of the fighters; normal has half as many again.
                const wave = this.settings.enemyWave === 0 ? 0
                    : this.felix ? Math.max(1, Math.round(this.settings.enemyWave * 0.25))
                        : Math.round(this.settings.enemyWave * 1.5);
                for (let i = 0; i < wave; i++) {
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
            this.bases.push({ X: X + 22, Z: z - 2 });
            if (this.bases.length > 8)
                this.bases.shift();
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
                this.trail(m.X, m.h, m.Z);
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
                this.trail(m.X, m.h, m.Z);
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
            // Ground targets leave a wreck that burns and smokes for a while.
            if (t.h === undefined && t.kind !== 'ship') {
                this.wrecks.push({ X: t.X, Z: t.Z, size: PA.KINDS[t.kind].height > 5 ? 1.6 : 1, age: 0 });
                if (this.wrecks.length > 14)
                    this.wrecks.shift();
            }
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
        // An explosion: a fireball that flares and fades, smoke that rolls up and spreads, and sparks.
        explode(X, h, Z, n) {
            const fire = Math.max(3, Math.round(n * 0.5)), smoke = Math.max(3, Math.round(n * 0.45)), sparks = Math.round(n * 0.4);
            for (let i = 0; i < fire; i++) {
                const a = this.rand() * Math.PI * 2, sp = 3 + this.rand() * 10;
                this.puffs.push({
                    X, h, Z, vX: Math.cos(a) * sp, vY: 2 + this.rand() * 6, vZ: Math.sin(a) * sp,
                    life: 0.35 + this.rand() * 0.35, max: 0.7, color: '#ffb02e', size: 2.5 + this.rand() * 3, kind: 'fire',
                });
            }
            for (let i = 0; i < smoke; i++) {
                const a = this.rand() * Math.PI * 2, sp = 1 + this.rand() * 4;
                this.puffs.push({
                    X, h, Z, vX: Math.cos(a) * sp, vY: 2 + this.rand() * 3, vZ: Math.sin(a) * sp,
                    life: 1.4 + this.rand() * 1.2, max: 2.6, color: '#777777', size: 2.5 + this.rand() * 2.5, kind: 'smoke',
                });
            }
            for (let i = 0; i < sparks; i++) {
                const a = this.rand() * Math.PI * 2, sp = 14 + this.rand() * 22;
                this.puffs.push({
                    X, h, Z, vX: Math.cos(a) * sp, vY: 6 + this.rand() * 14, vZ: Math.sin(a) * sp,
                    life: 0.4 + this.rand() * 0.4, max: 0.8, color: '#fff1b8', size: 0.6, kind: 'spark',
                });
            }
            if (this.puffs.length > 700)
                this.puffs.splice(0, this.puffs.length - 700);
        }
        // A thin smoke trail behind a missile.
        trail(X, h, Z) {
            this.puffs.push({
                X, h, Z, vX: 0, vY: 0.6, vZ: 0, life: 1.1, max: 1.1, color: '#cccccc', size: 0.9, kind: 'smoke',
            });
        }
        dust(X, h, Z) {
            for (let i = 0; i < 4; i++) {
                this.puffs.push({
                    X, h, Z,
                    vX: (this.rand() - 0.5) * 10, vY: 4 + this.rand() * 4, vZ: (this.rand() - 0.5) * 10,
                    life: 0.4, max: 0.4, color: '#e6e0c8', size: 1.2, kind: 'dust',
                });
            }
        }
        // Smoke rises and slows; fire slows; sparks and dust fall.
        // A wreck burns for a while, then only smokes, then goes out. Its smoke drifts with the wind.
        burnWrecks(dt) {
            const p = this.plane;
            for (const w of this.wrecks) {
                w.age += dt;
                if (w.age > WRECK_LIFE || this.puffs.length > 640)
                    continue;
                if (Math.hypot(w.X - p.X, w.Z - p.Z) > 1600)
                    continue;
                const left = 1 - w.age / WRECK_LIFE;
                if (this.rand() < dt * 7 * left) {
                    const g = 0.16 + this.rand() * 0.1;
                    const shade = Math.round(g * 255).toString(16).padStart(2, '0');
                    this.puffs.push({
                        X: w.X + (this.rand() - 0.5) * 3, Z: w.Z + (this.rand() - 0.5) * 3, h: 1.5,
                        vX: PA.WIND.X * 0.5, vY: 3 + this.rand() * 2, vZ: PA.WIND.Z * 0.5,
                        life: 5, max: 5, color: '#' + shade + shade + shade, size: (2.2 + this.rand()) * w.size, kind: 'smoke',
                    });
                }
                if (w.age < WRECK_LIFE * 0.45 && this.rand() < dt * 9) {
                    this.puffs.push({
                        X: w.X + (this.rand() - 0.5) * 3 * w.size, Z: w.Z + (this.rand() - 0.5) * 3 * w.size, h: 0.8,
                        vX: 0, vY: 2.5 + this.rand() * 2, vZ: 0,
                        life: 0.6, max: 0.6, color: this.rand() < 0.5 ? '#ffb347' : '#ff7a3c', size: 1.2 * w.size, kind: 'fire',
                    });
                }
            }
            this.wrecks = this.wrecks.filter(w => w.age < WRECK_LIFE + 20);
        }
        updatePuffs(dt) {
            for (const p of this.puffs) {
                if (p.kind === 'smoke') {
                    p.vY += 1.5 * dt;
                    const drag = Math.max(0, 1 - 1.5 * dt);
                    p.vX = PA.WIND.X + (p.vX - PA.WIND.X) * drag;
                    p.vZ = PA.WIND.Z + (p.vZ - PA.WIND.Z) * drag;
                }
                else if (p.kind === 'fire') {
                    const drag = Math.max(0, 1 - 3 * dt);
                    p.vX *= drag;
                    p.vZ *= drag;
                    p.vY *= drag;
                }
                else {
                    p.vY -= PA.GRAVITY * 0.5 * dt;
                }
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
            life: 0.9, max: 0.9, color: '#fff1b8', size: 0.8, kind: 'spark',
        };
    }
    function clamp(v) {
        return Math.max(-1, Math.min(1, v));
    }
})(PA || (PA = {}));
// Drawing the world: a modern 2.5D look.
//
//  1. The sky and the ground are painted pixel by pixel. Each screen pixel casts a ray from
//     the camera; rays that go up colour the sky (a gradient, the sun, far mountains), rays
//     that go down hit the flat ground and take its colour there (fields, towns, roads,
//     rails, lakes, forest floor, the sea with surf), with drifting cloud shadows, and fade
//     into the haze with distance.
//  2. Clouds are soft billboards high in the air.
//  3. Every object is a voxel model drawn by sprite stacking (see voxel.ts), sorted far to
//     near, each with a shadow of its own shape cast away from the sun.
//  4. Effects on top: fire, smoke, sparks, tracers, engine glow, then the plane, a lens
//     flare when the sun is in view, and a soft vignette.
var PA;
(function (PA) {
    const FOCAL = 240; // pixels: how big a metre looks at distance one
    const CAM_BACK = 26; // metres behind the plane
    const CAM_UP = 8; // metres above the plane
    const TILT = 0.2; // radians the camera looks down
    const ROLL_FOLLOW = 0.4; // the camera follows this share of the bank; the plane shows the rest
    const PLANE_SCREEN_Y = 0.72;
    const FOG = 1150; // metres: how quickly distance fades into the haze
    const OBJECT_SCALE = 1.5; // models are drawn half again larger than life, so they read well
    const FAR_LOD = 450; // beyond this the ground is painted every other pixel
    const DETAIL_NEAR = 260; // fine ground detail fades out by this distance
    const TREE_RANGE = 11; // forest squares drawn each way (40 m squares)
    // The sun: low in the south-west sky, behind and to the left when flying north, so
    // things are lit from the front, shadows fall ahead, and the light is warm.
    const SUN = (() => {
        const x = -0.5, y = 0.45, z = -0.74, l = Math.hypot(x, y, z);
        return { x: x / l, y: y / l, z: z / l };
    })();
    // Shadow direction per metre of height (away from the sun, along the ground).
    const SHADOW_X = -SUN.x / SUN.y, SHADOW_Z = -SUN.z / SUN.y;
    // Colours (red, green, blue).
    const ZENITH = [78, 152, 222];
    const HORIZON = [246, 226, 206];
    const HAZE = [236, 226, 212];
    const HAZE_PACKED = (0xff000000 | (212 << 16) | (226 << 8) | 236) >>> 0;
    // Camera placement for each view: how far behind the plane, how high, how far it looks down.
    const VIEWS = {
        chase: { back: CAM_BACK, up: CAM_UP, tilt: TILT },
        top: { back: 4, up: 110, tilt: 1.35 },
        cockpit: { back: -1.5, up: 1.4, tilt: 0.02 },
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
        // Look down by the view's tilt, then roll with part of the bank (a right bank rolls the
        // camera right, so the land tips the other way). The top view stays level.
        const roll = g.settings.view === 'top' ? 0 : -ROLL_FOLLOW * p.bank;
        const ct = Math.cos(v.tilt), st = Math.sin(v.tilt);
        const fx = hx * ct, fy = -st, fz = hz * ct;
        const u0x = hx * st, u0y = ct, u0z = hz * st;
        const cb = Math.cos(roll), sb = Math.sin(roll);
        const rx = rhx * cb + u0x * sb, ry = u0y * sb, rz = rhz * cb + u0z * sb;
        const ux = u0x * cb - rhx * sb, uy = u0y * cb, uz = u0z * cb - rhz * sb;
        return { px, py, pz, rx, ry, rz, ux, uy, uz, fx, fy, fz, roll, yaw: p.yaw };
    }
    // World point → screen point and depth, or null if it is behind the camera.
    function project(c, X, h, Z) {
        const dx = X - c.px, dy = h - c.py, dz = Z - c.pz;
        const zc = dx * c.fx + dy * c.fy + dz * c.fz;
        if (zc < 1)
            return null;
        const xc = dx * c.rx + dy * c.ry + dz * c.rz;
        const yc = dx * c.ux + dy * c.uy + dz * c.uz;
        return [PA.W / 2 + (FOCAL * xc) / zc, PA.H / 2 - (FOCAL * yc) / zc, zc];
    }
    // ---- 1. Sky and ground, pixel by pixel ----------------------------------------------
    // The slow-changing fields (wild land, region, a little variation) are kept on an 8 m grid
    // around the camera, so each pixel reads four stored corners instead of working them out.
    const GRID = 8, GN = 512, GMASK = 511;
    const gTagX = new Int32Array(GN * GN).fill(0x7fffffff);
    const gTagZ = new Int32Array(GN * GN);
    const gWild = new Float32Array(GN * GN);
    const gRegion = new Float32Array(GN * GN);
    const gVar = new Float32Array(GN * GN);
    function gridCell(ix, iz) {
        const k = (ix & GMASK) + ((iz & GMASK) << 9);
        if (gTagX[k] !== ix || gTagZ[k] !== iz) {
            gTagX[k] = ix;
            gTagZ[k] = iz;
            const X = ix * GRID, Z = iz * GRID;
            gWild[k] = PA.wildValue(X, Z);
            gRegion[k] = PA.regionValue(X, Z);
            gVar[k] = PA.hash2(ix, iz);
        }
        return k;
    }
    // The coast, stored every 8 m of Z.
    const cTag = new Int32Array(4096).fill(0x7fffffff);
    const cVal = new Float32Array(4096);
    function coastAt(Z) {
        const iz = Math.floor(Z / 8), f = Z / 8 - iz;
        const k0 = iz & 4095, k1 = (iz + 1) & 4095;
        if (cTag[k0] !== iz) {
            cTag[k0] = iz;
            cVal[k0] = PA.coastX(iz * 8);
        }
        if (cTag[k1] !== iz + 1) {
            cTag[k1] = iz + 1;
            cVal[k1] = PA.coastX((iz + 1) * 8);
        }
        return cVal[k0] + (cVal[k1] - cVal[k0]) * f;
    }
    // Haze by distance, worked out once (every 4 m up to 8 km).
    const FOG_LUT = (() => {
        const t = new Float32Array(2001);
        for (let i = 0; i <= 2000; i++)
            t[i] = 1 - Math.exp(-(i * 4) / FOG);
        return t;
    })();
    function fogAt(dist) {
        const i = dist * 0.25;
        return i >= 2000 ? FOG_LUT[2000] : FOG_LUT[i | 0];
    }
    function pack(r, g, b) {
        return (0xff000000 | ((b & 255) << 16) | ((g & 255) << 8) | (r & 255)) >>> 0;
    }
    // The fields at one point, smoothly between the stored grid corners.
    let fWild = 0, fRegion = 0, fVar = 0;
    function readFields(X, Z) {
        const gx = X / GRID, gz = Z / GRID;
        const ix = Math.floor(gx), iz = Math.floor(gz);
        const tx = gx - ix, tz = gz - iz;
        const a = gridCell(ix, iz);
        const b = gTagX[(a & ~GMASK) | ((ix + 1) & GMASK)] === ix + 1 && gTagZ[(a & ~GMASK) | ((ix + 1) & GMASK)] === iz ? (a & ~GMASK) | ((ix + 1) & GMASK) : gridCell(ix + 1, iz);
        const c = gridCell(ix, iz + 1);
        const d = gTagX[(c & ~GMASK) | ((ix + 1) & GMASK)] === ix + 1 && gTagZ[(c & ~GMASK) | ((ix + 1) & GMASK)] === iz + 1 ? (c & ~GMASK) | ((ix + 1) & GMASK) : gridCell(ix + 1, iz + 1);
        const w00 = (1 - tx) * (1 - tz), w10 = tx * (1 - tz), w01 = (1 - tx) * tz, w11 = tx * tz;
        fWild = gWild[a] * w00 + gWild[b] * w10 + gWild[c] * w01 + gWild[d] * w11;
        fRegion = gRegion[a] * w00 + gRegion[b] * w10 + gRegion[c] * w01 + gRegion[d] * w11;
        fVar = gVar[a] * w00 + gVar[b] * w10 + gVar[c] * w01 + gVar[d] * w11;
    }
    function mod(a, n) {
        return a - Math.floor(a / n) * n;
    }
    // The ground's colour at (X, Z), seen along the unit ray (dx, dy, dz) from distance dist.
    function groundColor(X, Z, dist, dx, dy, dz, t) {
        const fog = fogAt(dist);
        if (fog > 0.985)
            return HAZE_PACKED;
        const near = Math.max(0, 1 - dist / DETAIL_NEAR);
        let r = 0, g = 0, b = 0;
        let water = false;
        const coast = coastAt(Z);
        const seaD = X - coast;
        if (seaD > -24) {
            // The coast: a sand beach, then surf, shallows and the deep sea.
            if (seaD < 0) {
                r = 238;
                g = 222;
                b = 172;
            }
            else {
                water = true;
                const deep = Math.min(1, seaD / 90);
                r = 112 - 62 * deep;
                g = 200 - 62 * deep;
                b = 228 - 22 * deep;
                if (seaD < 5 && Math.sin(t * 2.2 + Z * 0.08 + seaD * 0.9) > -0.2) {
                    r = 248;
                    g = 250;
                    b = 246;
                    water = false;
                }
            }
        }
        else {
            readFields(X, Z);
            const roadD = Math.abs(X - PA.ROAD_X), railD = Math.abs(X - PA.RAIL_X);
            if (roadD < PA.ROAD_W + 1.6) {
                if (roadD > PA.ROAD_W) {
                    r = 196;
                    g = 184;
                    b = 160;
                }
                else {
                    r = 116;
                    g = 121;
                    b = 130;
                    if (roadD > PA.ROAD_W - 1.2 && roadD < PA.ROAD_W - 0.6) {
                        r = 236;
                        g = 236;
                        b = 230;
                    }
                    if (roadD < 0.35 && mod(Z, 16) < 8) {
                        r = 244;
                        g = 214;
                        b = 112;
                    }
                }
            }
            else if (railD < 2.4) {
                r = 172;
                g = 162;
                b = 146;
                if (railD < 1.8 && mod(Z, 1.5) < 0.55) {
                    r = 118;
                    g = 90;
                    b = 68;
                }
                if (railD > 0.62 && railD < 0.86) {
                    r = 88;
                    g = 94;
                    b = 100;
                }
            }
            else if (fWild > PA.LAKE_LEVEL && roadD > 30 && railD > 20) {
                water = true;
                const deep = Math.min(1, (fWild - PA.LAKE_LEVEL) / 0.06);
                r = 104 - 40 * deep;
                g = 196 - 50 * deep;
                b = 222 - 10 * deep;
                if (fWild < PA.LAKE_LEVEL + 0.006 && Math.sin(t * 2 + X * 0.21 + Z * 0.17) > 0) {
                    r = 246;
                    g = 249;
                    b = 244;
                    water = false;
                }
            }
            else if (fWild > PA.LAKE_LEVEL - 0.018 && roadD > 30 && railD > 20) {
                r = 236;
                g = 220;
                b = 168; // lake shore sand
            }
            else if (fWild > PA.FOREST_LEVEL && roadD > 16 && railD > 10) {
                // Forest floor: deep green, mottled.
                const m = 0.88 + 0.24 * fVar;
                r = 112 * m;
                g = 170 * m;
                b = 92 * m;
            }
            else if (fRegion < 0.42) {
                // Farm fields: patches on a tilted grid, each its own crop, sown in rows, with hedges.
                const pu = (X * 0.94 + Z * 0.34) / 70, pv = (Z * 0.94 - X * 0.34) / 46;
                const iu = Math.floor(pu), iv = Math.floor(pv);
                const fu = pu - iu, fv = pv - iv;
                const crop = PA.hash2(iu + 977, iv - 311);
                if (crop < 0.24) {
                    r = 236;
                    g = 208;
                    b = 118;
                } // wheat
                else if (crop < 0.46) {
                    r = 150;
                    g = 206;
                    b = 104;
                } // green crop
                else if (crop < 0.62) {
                    r = 182;
                    g = 134;
                    b = 92;
                } // ploughed earth
                else if (crop < 0.8) {
                    r = 170;
                    g = 216;
                    b = 128;
                } // meadow
                else if (crop < 0.9) {
                    r = 244;
                    g = 214;
                    b = 86;
                } // sunflowers
                else {
                    r = 186;
                    g = 166;
                    b = 222;
                } // lavender
                if (near > 0 && mod(fu * 26, 1) < 0.45) {
                    r *= 0.9;
                    g *= 0.9;
                    b *= 0.9;
                }
                if (fu < 0.03 || fv < 0.045) {
                    r = 92;
                    g = 150;
                    b = 84;
                } // hedges
                const far = Math.min(1, Math.max(0, (dist - 380) / 320)); // far away: an even field colour
                r += (186 - r) * far;
                g += (196 - g) * far;
                b += (120 - b) * far;
            }
            else if (fRegion > 0.66) {
                // Town: streets every 36 m, pavements, and lots of paving, gardens or car parks.
                const lx = mod(X, 36), lz = mod(Z, 36);
                if (lx < 5 || lz < 5) {
                    r = 128;
                    g = 132;
                    b = 140;
                    if ((lx < 5 && Math.abs(lx - 2.5) < 0.25 && mod(Z, 8) < 4) || (lz < 5 && Math.abs(lz - 2.5) < 0.25 && mod(X, 8) < 4)) {
                        r = 236;
                        g = 236;
                        b = 228;
                    }
                }
                else if (lx < 6.4 || lz < 6.4) {
                    r = 210;
                    g = 204;
                    b = 194;
                }
                else {
                    const lot = PA.hash2(Math.floor(X / 36) + 401, Math.floor(Z / 36) - 77);
                    if (lot < 0.45) {
                        r = 214;
                        g = 206;
                        b = 192;
                    }
                    else if (lot < 0.8) {
                        r = 150;
                        g = 202;
                        b = 118;
                    }
                    else {
                        r = 172;
                        g = 172;
                        b = 178;
                    }
                }
                const far = Math.min(1, Math.max(0, (dist - 380) / 320));
                r += (180 - r) * far;
                g += (180 - g) * far;
                b += (172 - b) * far;
            }
            else {
                // Open grass, gently varied.
                const m = 0.9 + 0.2 * fVar;
                r = 150 * m;
                g = 206 * m;
                b = 112 * m;
            }
            // Fine speckle near the camera (grass blades, gravel, crops).
            if (near > 0 && !water) {
                const s = (PA.hash2(Math.floor(X * 0.8), Math.floor(Z * 0.8)) - 0.5) * 0.14 * near;
                r *= 1 + s;
                g *= 1 + s;
                b *= 1 + s;
            }
        }
        if (water) {
            // Waves, the sky reflected at a low angle, and the sun glittering on the water.
            const wave = Math.sin(X * 0.11 + t * 1.3) * Math.sin(Z * 0.09 - t * 0.9) * 0.5 + Math.sin((X + Z) * 0.05 + t * 0.7) * 0.5;
            const k = 1 + wave * 0.06;
            r *= k;
            g *= k;
            b *= k;
            const q = 1 + dy, q2 = q * q, fres = q2 * q2 * q;
            r += (HORIZON[0] - r) * fres * 0.7;
            g += (HORIZON[1] - g) * fres * 0.7;
            b += (HORIZON[2] - b) * fres * 0.7;
            const refl = dx * SUN.x - dy * SUN.y + dz * SUN.z;
            if (refl > 0.94) {
                const u = (refl - 0.94) / 0.06, u2 = u * u;
                const glint = u2 * u2 * u2 * (0.5 + 0.5 * Math.sin(X * 1.7 + Z * 1.3 + t * 6));
                r += 255 * glint;
                g += 245 * glint;
                b += 220 * glint;
            }
        }
        else if (dist < 900) {
            // Cloud shadows drifting across the land.
            const cs = PA.noise2((X + t * 6) / 340, Z / 340);
            if (cs > 0.56) {
                const s = 1 - Math.min(1, (cs - 0.56) / 0.12) * 0.2;
                r *= s;
                g *= s;
                b *= s;
            }
        }
        r += (HAZE[0] - r) * fog;
        g += (HAZE[1] - g) * fog;
        b += (HAZE[2] - b) * fog;
        return pack(Math.min(255, r), Math.min(255, g), Math.min(255, b));
    }
    // The sky along the unit ray: a gradient, a glow round the sun, the sun itself, far mountains.
    function skyColor(dx, dy, dz) {
        const k = Math.min(1, Math.max(0, dy / 0.55));
        const s = k * k * (3 - 2 * k);
        let r = HORIZON[0] + (ZENITH[0] - HORIZON[0]) * s;
        let g = HORIZON[1] + (ZENITH[1] - HORIZON[1]) * s;
        let b = HORIZON[2] + (ZENITH[2] - HORIZON[2]) * s;
        const sun = dx * SUN.x + dy * SUN.y + dz * SUN.z;
        if (sun > 0.3) {
            const s2 = sun * sun, s6 = s2 * s2 * s2, s12 = s6 * s6, s48 = s12 * s12 * s12 * s12;
            const wide = s6 * 0.22, glow = s48 * 0.55;
            r += (255 - r) * (wide + glow);
            g += (236 - g) * (wide + glow);
            b += (196 - b) * (wide + glow) * 0.7;
            if (sun > 0.9993) {
                r = 255;
                g = 252;
                b = 236;
            }
        }
        if (dy < 0.08) {
            // Mountain ridges far away on the horizon: a pale far ridge, a bluer near one.
            const az = Math.atan2(dx, dz);
            const far = 0.032 + 0.014 * Math.sin(3 * az + 1.3) + 0.01 * Math.sin(7 * az + 0.4) + 0.005 * Math.sin(17 * az + 2);
            const nearR = 0.016 + 0.01 * Math.sin(5 * az + 2.2) + 0.007 * Math.sin(11 * az + 1) + 0.003 * Math.sin(29 * az);
            if (dy < nearR) {
                r = 150;
                g = 172;
                b = 186;
            }
            else if (dy < far) {
                if (dy > far - 0.006) {
                    r = 232;
                    g = 238;
                    b = 244;
                } // snow on the peaks
                else {
                    r = 182;
                    g = 198;
                    b = 214;
                }
            }
            else {
                return pack(r, g, b);
            }
            const hz = 0.45;
            r += (HAZE[0] - r) * hz;
            g += (HAZE[1] - g) * hz;
            b += (HAZE[2] - b) * hz;
        }
        return pack(r, g, b);
    }
    let bg = null;
    let bg32 = new Uint32Array(0);
    let halfGround = false; // set when a device is too slow: the ground is painted every other column
    function paintBackground(ctx, g, c) {
        if (!bg) {
            bg = ctx.createImageData(PA.W, PA.H);
            bg32 = new Uint32Array(bg.data.buffer);
        }
        const t = g.time;
        const camY = Math.max(1, c.py);
        const sunScreen = project(c, c.px + SUN.x * 8000, c.py + SUN.y * 8000, c.pz + SUN.z * 8000);
        for (let y = 0; y < PA.H; y++) {
            const by = (PA.H / 2 - (y + 0.5)) / FOCAL;
            const r0x = c.fx + by * c.ux, r0y = c.fy + by * c.uy, r0z = c.fz + by * c.uz;
            let prev = 0;
            const row = y * PA.W;
            for (let x = 0; x < PA.W; x++) {
                const ax = (x + 0.5 - PA.W / 2) / FOCAL;
                const dx = r0x + ax * c.rx, dy = r0y + ax * c.ry, dz = r0z + ax * c.rz;
                let col;
                if (dy < -0.0004) {
                    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    const tt = -camY / dy;
                    const dist = tt * len;
                    if ((x & 1) === 1 && (halfGround || dist > FAR_LOD)) {
                        bg32[row + x] = prev;
                        continue;
                    }
                    col = groundColor(c.px + tt * dx, c.pz + tt * dz, dist, dx / len, dy / len, dz / len, t);
                }
                else {
                    // The open sky is smooth: work out one pixel in four, except near the horizon and the sun.
                    const nearSun = sunScreen !== null && Math.abs(x - sunScreen[0]) < 70 && Math.abs(y - sunScreen[1]) < 70;
                    if (dy > 0.1 && !nearSun && ((x & 1) === 1 || (y & 1) === 1)) {
                        bg32[row + x] = (x & 1) === 1 ? prev : bg32[row - PA.W + x];
                        prev = bg32[row + x];
                        continue;
                    }
                    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    col = skyColor(dx / len, dy / len, dz / len);
                }
                bg32[row + x] = col;
                prev = col;
            }
        }
        ctx.putImageData(bg, 0, 0);
    }
    // ---- Soft textures, made once -------------------------------------------------------
    function softDisc(size, stops) {
        const cv = document.createElement('canvas');
        cv.width = cv.height = size;
        const x = cv.getContext('2d');
        if (!x)
            return cv;
        const grad = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        for (const [o, col] of stops)
            grad.addColorStop(o, col);
        x.fillStyle = grad;
        x.fillRect(0, 0, size, size);
        return cv;
    }
    let TEX = null;
    function cloudTexture(seed) {
        const cv = document.createElement('canvas');
        cv.width = 160;
        cv.height = 80;
        const x = cv.getContext('2d');
        if (!x)
            return cv;
        const rnd = PA.random(seed);
        const blobs = [];
        for (let i = 0; i < 9; i++)
            blobs.push([30 + rnd() * 100, 34 + rnd() * 18, 14 + rnd() * 16]);
        // Shaded underside first, then the lit tops.
        for (const [bx, by, br] of blobs) {
            const g1 = x.createRadialGradient(bx, by + 6, 0, bx, by + 6, br);
            g1.addColorStop(0, 'rgba(206,214,228,0.9)');
            g1.addColorStop(1, 'rgba(206,214,228,0)');
            x.fillStyle = g1;
            x.fillRect(0, 0, 160, 80);
        }
        for (const [bx, by, br] of blobs) {
            const g2 = x.createRadialGradient(bx - 3, by - 4, 0, bx - 3, by - 4, br * 0.9);
            g2.addColorStop(0, 'rgba(255,255,255,0.95)');
            g2.addColorStop(0.6, 'rgba(255,252,246,0.7)');
            g2.addColorStop(1, 'rgba(255,252,246,0)');
            x.fillStyle = g2;
            x.fillRect(0, 0, 160, 80);
        }
        return cv;
    }
    function textures() {
        if (TEX)
            return TEX;
        const vig = document.createElement('canvas');
        vig.width = PA.W;
        vig.height = PA.H;
        const vx = vig.getContext('2d');
        if (vx) {
            const grad = vx.createRadialGradient(PA.W / 2, PA.H / 2, PA.H * 0.35, PA.W / 2, PA.H / 2, PA.W * 0.62);
            grad.addColorStop(0, 'rgba(20,24,40,0)');
            grad.addColorStop(1, 'rgba(20,24,40,0.32)');
            vx.fillStyle = grad;
            vx.fillRect(0, 0, PA.W, PA.H);
        }
        TEX = {
            mist: softDisc(64, [[0, 'rgba(255,255,255,0.85)'], [0.5, 'rgba(255,255,255,0.35)'], [1, 'rgba(255,255,255,0)']]),
            glow: softDisc(64, [[0, 'rgba(255,255,255,1)'], [0.25, 'rgba(255,240,200,0.6)'], [1, 'rgba(255,200,120,0)']]),
            fire: softDisc(64, [[0, 'rgba(255,255,230,1)'], [0.3, 'rgba(255,200,90,0.9)'], [0.65, 'rgba(240,96,40,0.5)'], [1, 'rgba(200,40,20,0)']]),
            smoke: softDisc(64, [[0, 'rgba(120,118,124,0.75)'], [0.55, 'rgba(140,138,146,0.35)'], [1, 'rgba(150,150,156,0)']]),
            dust: softDisc(64, [[0, 'rgba(214,196,160,0.7)'], [1, 'rgba(214,196,160,0)']]),
            shadow: softDisc(64, [[0, 'rgba(24,30,46,0.45)'], [0.6, 'rgba(24,30,46,0.25)'], [1, 'rgba(24,30,46,0)']]),
            clouds: [cloudTexture(3), cloudTexture(11), cloudTexture(29), cloudTexture(47)],
            vignette: vig,
        };
        return TEX;
    }
    // A model's footprint as a soft dark shape (for its shadow on the ground).
    const silhouettes = {};
    function silhouette(name) {
        if (silhouettes[name])
            return silhouettes[name];
        const m = PA.model(name);
        const cv = document.createElement('canvas');
        cv.width = m.w;
        cv.height = m.l;
        const x = cv.getContext('2d');
        if (x) {
            for (const s of m.slices)
                if (s)
                    x.drawImage(s, 0, 0);
            x.globalCompositeOperation = 'source-in';
            x.fillStyle = 'rgb(24,30,46)';
            x.fillRect(0, 0, m.w, m.l);
        }
        silhouettes[name] = cv;
        return cv;
    }
    // ---- 2. Clouds ----------------------------------------------------------------------
    function clouds(ctx, g, c) {
        const tex = textures();
        const cell = 420;
        const i0 = Math.floor(c.px / cell) - 5, j0 = Math.floor(c.pz / cell) - 5;
        const list = [];
        for (let i = i0; i <= i0 + 10; i++) {
            for (let j = j0; j <= j0 + 10; j++) {
                if (PA.cellNoise(i, j, 23) < 0.42)
                    continue;
                const X = i * cell + PA.cellNoise(i, j, 29) * 300 + g.time * 4;
                const Z = j * cell + PA.cellNoise(i, j, 31) * 300;
                const h = 190 + PA.cellNoise(i, j, 37) * 90;
                const p = project(c, X, h, Z);
                if (!p || p[2] < 80)
                    continue;
                list.push([p[0], p[1], p[2], 100 + PA.cellNoise(i, j, 41) * 90, Math.floor(PA.cellNoise(i, j, 43) * 4)]);
            }
        }
        list.sort((a, b) => b[2] - a[2]);
        for (const [x, y, zc, size, v] of list) {
            const w = (size * FOCAL) / zc;
            if (w < 4)
                continue;
            ctx.globalAlpha = Math.max(0, 1 - (1 - Math.exp(-zc / (FOG * 1.6))) * 0.9);
            ctx.drawImage(tex.clouds[v], x - w / 2, y - w / 4, w, w / 2);
        }
        ctx.globalAlpha = 1;
    }
    // Which model a target uses, and which way it faces.
    function modelOf(t) {
        if (t.kind === 'city')
            return ['city', 'city1', 'city2'][Math.floor(PA.hash2(Math.round(t.X), Math.round(t.Z)) * 3) % 3];
        return t.kind;
    }
    function yawOf(t) {
        if (t.faction === 'enemy' && t.vH !== undefined)
            return t.vH;
        if (t.faction === 'ally' && t.orbit)
            return Math.atan2(-Math.sin(t.orbit.ang), Math.cos(t.orbit.ang));
        if (t.vZ !== undefined && t.vZ !== 0)
            return t.vZ > 0 ? 0 : Math.PI;
        if (t.kind === 'rail')
            return 0;
        const h = PA.hash2(Math.round(t.X * 3), Math.round(t.Z * 3));
        if (t.kind === 'ship')
            return h < 0.5 ? 0 : Math.PI;
        return Math.floor(h * 4) * (Math.PI / 2) + (h - 0.5) * 0.2;
    }
    // Everything to stack this frame: targets, trees in the forests, houses in the towns.
    function collect(g, c) {
        const out = [];
        const add = (name, X, base, Z, yaw, air, t, age) => {
            const dx = X - c.px, dz = Z - c.pz;
            const zc = dx * c.fx + (base - c.py) * c.fy + dz * c.fz;
            if (zc < 2 || zc > FOG * 1.6)
                return;
            out.push({ name, X, Z, base, yaw, zc, air, phase: PA.hash2(Math.round(X * 7), Math.round(Z * 7)) * 6.28, t, age });
        };
        const p = g.plane;
        for (const t of g.mission.targets) {
            if (!t.alive)
                continue;
            let yaw = yawOf(t);
            // Flak guns and SAM launchers swing round to face the plane when it is near.
            if ((t.kind === 'flak' || t.kind === 'sam') && Math.hypot(p.X - t.X, p.Z - t.Z) < 900)
                yaw = Math.atan2(p.X - t.X, p.Z - t.Z);
            add(modelOf(t), t.X, PA.altOf(t), t.Z, yaw, t.h !== undefined, t);
        }
        for (const w of g.wrecks)
            add('wreck', w.X, 0, w.Z, w.X * 0.37, false, undefined, w.age);
        for (const b of g.bases)
            add('flagpole', b.X, 0, b.Z, 0, false);
        const CELL = 40;
        const ci = Math.floor(c.px / CELL), cj = Math.floor(c.pz / CELL);
        for (let i = ci - TREE_RANGE; i <= ci + TREE_RANGE; i++) {
            for (let j = cj - TREE_RANGE; j <= cj + TREE_RANGE; j++) {
                const cx = (i + 0.5) * CELL, cz = (j + 0.5) * CELL;
                if ((cx - c.px) * c.fx + (cz - c.pz) * c.fz < -CELL)
                    continue; // behind the camera
                const biome = PA.biomeAt(cx, cz);
                if (biome === 'forest') {
                    const close = Math.hypot(cx - c.px, cz - c.pz) < 220;
                    for (let k = 0; k < (close ? 4 : 3); k++) {
                        const X = i * CELL + PA.cellNoise(i, j, 41 + k) * CELL, Z = j * CELL + PA.cellNoise(i, j, 47 + k) * CELL;
                        if (!PA.isForest(X, Z))
                            continue;
                        const v = PA.cellNoise(i, j, 53 + k);
                        const name = v < 0.5 ? 'tree0' : v < 0.75 ? 'tree1' : v < 0.85 ? 'tree2' : v < 0.93 ? 'tree3' : 'tree4';
                        add(name, X, 0, Z, v * 6.28, false);
                    }
                }
                else if (biome === 'town' && PA.cellNoise(i, j, 61) < 0.45) {
                    const v = PA.cellNoise(i, j, 67);
                    const name = v < 0.4 ? 'house1' : v < 0.7 ? 'house2' : v < 0.85 ? 'city1' : 'city';
                    add(name, cx + 4, 0, cz + 4, Math.floor(v * 4) * (Math.PI / 2), false);
                }
                else if (biome === 'farm' && PA.cellNoise(i, j, 89) < 0.035) {
                    add('windmill', cx - 6, 0, cz + 3, PA.cellNoise(i, j, 91) * 6.28, false);
                }
                else if (biome === 'farm' && PA.cellNoise(i, j, 71) < 0.05) {
                    add(PA.cellNoise(i, j, 73) < 0.5 ? 'farm' : 'barn', cx, 0, cz, PA.cellNoise(i, j, 79) * 6.28, false);
                }
                else if ((biome === 'army' || biome === 'farm') && PA.cellNoise(i, j, 83) < 0.08) {
                    add('tree4', cx + 7, 0, cz - 5, 0, false);
                }
            }
        }
        out.sort((a, b) => b.zc - a.zc);
        PA.renderStats.things = out.length;
        return out;
    }
    function fogAlpha(zc) {
        return Math.max(0, 1 - (1 - Math.exp(-zc / FOG)) * 0.9);
    }
    // The pose of a model standing at (X, base, Z), seen from the camera.
    function poseOf(c, m, X, base, Z, yaw) {
        const p = project(c, X, base, Z);
        if (!p)
            return null;
        const horiz = Math.hypot(X - c.px, Z - c.pz);
        const elev = Math.atan2(c.py - (base + m.h * m.size * 0.5), horiz);
        return { sx: p[0], sy: p[1], px: (FOCAL * m.size * OBJECT_SCALE) / p[2], yaw: yaw - c.yaw, elev, roll: c.roll };
    }
    // A shadow the shape of the model, laid on the ground away from the sun.
    function drawShadow(ctx, c, name, X, base, Z, yaw) {
        const m = PA.model(name);
        const lift = base + m.h * m.size * OBJECT_SCALE * 0.35;
        const sx = X + SHADOW_X * lift, sz = Z + SHADOW_Z * lift;
        const pose = poseOf(c, m, sx, 0, sz, yaw);
        if (!pose)
            return;
        pose.elev = Math.atan2(c.py, Math.hypot(sx - c.px, sz - c.pz));
        const flat = { w: m.w, l: m.l, h: 1, size: m.size, slices: [silhouette(name)], top: 0, avg: 'rgba(24,30,46,0.3)' };
        const zc = (FOCAL * m.size * OBJECT_SCALE) / Math.max(0.001, pose.px);
        ctx.globalAlpha = (base > 2 ? 0.16 : 0.26) * fogAlpha(zc);
        PA.drawModel(ctx, flat, pose);
        ctx.globalAlpha = 1;
    }
    function objects(ctx, g, c) {
        var _a, _b;
        const things = collect(g, c);
        for (const th of things)
            drawShadow(ctx, c, th.name, th.X, th.base, th.Z, th.yaw);
        const time = g.time;
        const p = g.plane;
        for (const th of things) {
            const m = PA.model(th.name);
            const ship = th.name === 'ship';
            const base = ship ? th.base + Math.sin(time * 0.9 + th.phase) * 0.25 : th.base;
            const pose = poseOf(c, m, th.X, base, th.Z, th.yaw);
            if (!pose)
                continue;
            const alpha = fogAlpha(th.zc);
            ctx.globalAlpha = alpha;
            if (th.name.startsWith('tree'))
                pose.sway = Math.sin(time * 1.3 + th.phase) * pose.px * 0.8;
            if (ship)
                pose.roll += Math.sin(time * 0.7 + th.phase) * 0.04;
            if (th.air && th.t)
                pose.roll += bankOf(th.t, pose.yaw);
            if (th.name.startsWith('tree'))
                PA.drawModelCached(ctx, m, th.name, { ...pose, yaw: th.yaw }); // a tree looks the same from every side
            else
                PA.drawModel(ctx, m, pose);
            if (pose.px < 0.5)
                continue;
            if (th.name === 'tank_mbt' || th.name === 'tank_light') {
                // The turret turns to track the plane when it is near.
                const mbt = th.name === 'tank_mbt';
                const tm = PA.model(mbt ? 'turret_mbt' : 'turret_light');
                const [tx, ty] = PA.modelToScreen(m, pose, mbt ? 7 : 6, mbt ? 14 : 11, mbt ? 4 : 3);
                const near = Math.hypot(p.X - th.X, p.Z - th.Z) < 900;
                const aim = near ? Math.atan2(p.X - th.X, p.Z - th.Z) : th.yaw;
                PA.drawModel(ctx, tm, { ...pose, sx: tx, sy: ty, yaw: aim - c.yaw });
            }
            else if (th.name === 'sam') {
                // The radar dish spins on its mast.
                const [dx, dy] = PA.modelToScreen(m, pose, 11.5, 4, 9);
                PA.drawModel(ctx, PA.model('samdish'), { ...pose, sx: dx, sy: dy, yaw: time * 2.2 + th.phase - c.yaw });
            }
            else if (th.name === 'farm' || th.name === 'house1' || th.name === 'house2') {
                const [hx, hy] = PA.modelToScreen(m, pose, 12, 5, 13);
                chimneySmoke(ctx, hx, hy, pose.px, time + th.phase, alpha, (PA.WIND.X * c.rx + PA.WIND.Z * c.rz) / Math.hypot(PA.WIND.X, PA.WIND.Z));
            }
            else if (th.name === 'windmill') {
                const [wx, wy] = PA.modelToScreen(m, pose, 5, 2, 19);
                sails(ctx, wx, wy, pose.px, time * 1.4 + th.phase, pose.roll, alpha);
            }
            else if (th.name === 'wreck' && ((_a = th.age) !== null && _a !== void 0 ? _a : 99) < 22) {
                // Embers flicker in the wreck while it burns.
                const [ex, ey] = PA.modelToScreen(m, pose, 7, 7, 2);
                const f = 0.6 + 0.4 * Math.sin(time * 13 + th.phase) * Math.sin(time * 7.3 + th.phase * 2);
                ctx.globalAlpha = alpha * f * (1 - ((_b = th.age) !== null && _b !== void 0 ? _b : 0) / 22);
                glow(ctx, ex, ey, pose.px * 9);
                ctx.globalAlpha = alpha;
            }
            else if (th.name === 'flagpole') {
                const [fx, fy] = PA.modelToScreen(m, pose, 2, 2, 28.5);
                flag(ctx, c, fx, fy, pose.px, time + th.phase, pose.roll);
            }
            else if (th.air) {
                // Fighters and allies show their exhaust as a small glow.
                const [ex, ey] = PA.modelToScreen(m, pose, m.w / 2, m.l - 1, 3);
                glow(ctx, ex, ey, 4 + pose.px * 3);
            }
        }
        ctx.globalAlpha = 1;
    }
    // A fighter banks into its turn: worked out from how fast its heading changes.
    const lastYaw = new WeakMap();
    const bankNow = new WeakMap();
    let bankClock = 0;
    function bankOf(t, yawRel) {
        var _a, _b, _c;
        const now = performance.now();
        const dt = Math.min(0.1, Math.max(0.001, (now - bankClock) / 1000));
        bankClock = now;
        const yaw = t.faction === 'ally' && t.orbit ? Math.atan2(-Math.sin(t.orbit.ang), Math.cos(t.orbit.ang)) : ((_a = t.vH) !== null && _a !== void 0 ? _a : 0);
        const prev = (_b = lastYaw.get(t)) !== null && _b !== void 0 ? _b : yaw;
        lastYaw.set(t, yaw);
        let d = yaw - prev;
        while (d > Math.PI)
            d -= 2 * Math.PI;
        while (d < -Math.PI)
            d += 2 * Math.PI;
        const want = Math.max(-0.9, Math.min(0.9, (d / dt) * 0.9));
        const was = (_c = bankNow.get(t)) !== null && _c !== void 0 ? _c : 0;
        const b = was + (want - was) * Math.min(1, dt * 4);
        bankNow.set(t, b);
        // Seen from the front, a right bank turns the other way on screen.
        return Math.cos(yawRel) >= 0 ? b : -b;
    }
    // Smoke curling up from a chimney: three puffs that rise, grow and fade, over and over.
    function chimneySmoke(ctx, x, y, px, t, alpha, lean) {
        const tex = textures();
        for (let k = 0; k < 3; k++) {
            const a = (t * 0.35 + k / 3) % 1;
            const r = px * (1.5 + a * 4);
            ctx.globalAlpha = alpha * (1 - a) * 0.55;
            ctx.drawImage(tex.mist, x - r + (Math.sin(t + k) * 1.5 + lean * 9) * px * a, y - r - a * px * 14, r * 2, r * 2);
        }
        ctx.globalAlpha = alpha;
    }
    // A flag streaming out with the wind: two bands that ripple in a travelling wave.
    function flag(ctx, c, x, y, px, t, roll) {
        const wind = Math.hypot(PA.WIND.X, PA.WIND.Z);
        const side = (PA.WIND.X * c.rx + PA.WIND.Z * c.rz) / wind; // how much the wind blows across the screen
        const dir = side >= 0 ? 1 : -1;
        const L = 13 * px * Math.max(0.3, Math.abs(side));
        const Hh = 8 * px;
        const N = 7;
        const top = [], mid = [], bot = [];
        for (let i = 0; i <= N; i++) {
            const u = i / N;
            const wave = Math.sin(t * 6 - u * 5) * px * 1.6 * u;
            const fx = dir * u * L, sag = u * px * 1.2;
            top.push([fx, wave + sag]);
            mid.push([fx, Hh / 2 + wave + sag * 1.4]);
            bot.push([fx, Hh + wave * 0.9 + sag * 1.8]);
        }
        const cr = Math.cos(roll), sr = Math.sin(roll);
        ctx.setTransform(cr, sr, -sr, cr, x, y);
        const band = (a, b, col) => {
            ctx.fillStyle = col;
            ctx.beginPath();
            ctx.moveTo(a[0][0], a[0][1]);
            for (const q of a)
                ctx.lineTo(q[0], q[1]);
            for (let i = b.length - 1; i >= 0; i--)
                ctx.lineTo(b[i][0], b[i][1]);
            ctx.closePath();
            ctx.fill();
        };
        band(top, mid, '#ef7f6a');
        band(mid, bot, '#fff4d6');
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    // A windmill's four sails, turning in the breeze.
    function sails(ctx, x, y, px, angle, roll, alpha) {
        const len = px * 9;
        ctx.globalAlpha = alpha;
        for (let k = 0; k < 4; k++) {
            const a = angle + roll + k * (Math.PI / 2);
            const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
            ctx.strokeStyle = '#6b4a32';
            ctx.lineWidth = Math.max(1, px * 0.5);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(ex, ey);
            ctx.stroke();
            // The canvas on the outer part of each sail.
            const sx = x + Math.cos(a) * len * 0.3, sy = y + Math.sin(a) * len * 0.3;
            ctx.strokeStyle = '#f7f2e8';
            ctx.lineWidth = Math.max(1, px * 1.6);
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(ex, ey);
            ctx.stroke();
        }
        ctx.fillStyle = '#6b4a32';
        ctx.fillRect(Math.round(x - px * 0.6), Math.round(y - px * 0.6), Math.max(1, px * 1.2), Math.max(1, px * 1.2));
    }
    // Flocks of birds flapping across the sky in a V.
    function birds(ctx, g, c) {
        const cell = 700;
        const ci = Math.floor(c.px / cell), cj = Math.floor(c.pz / cell);
        ctx.strokeStyle = 'rgba(52,56,72,0.85)';
        for (let i = ci - 3; i <= ci + 3; i++) {
            for (let j = cj - 3; j <= cj + 3; j++) {
                if (PA.cellNoise(i, j, 97) < 0.5)
                    continue;
                const dir = PA.cellNoise(i, j, 101) * 6.28, sp = 9;
                const travel = ((g.time * sp + PA.cellNoise(i, j, 103) * 1400) % 1400) - 700;
                const bx = i * cell + PA.cellNoise(i, j, 107) * cell + Math.sin(dir) * travel;
                const bz = j * cell + PA.cellNoise(i, j, 109) * cell + Math.cos(dir) * travel;
                const bh = 55 + PA.cellNoise(i, j, 113) * 55;
                const n = 5 + Math.floor(PA.cellNoise(i, j, 127) * 5);
                for (let k = 0; k < n; k++) {
                    const rank = Math.ceil(k / 2), side = k % 2 ? 1 : -1;
                    const X = bx - Math.sin(dir) * rank * 3 + Math.cos(dir) * side * rank * 3;
                    const Z = bz - Math.cos(dir) * rank * 3 - Math.sin(dir) * side * rank * 3;
                    const q = project(c, X, bh, Z);
                    if (!q)
                        continue;
                    const size = (0.9 * FOCAL) / q[2];
                    if (size < 0.7)
                        continue;
                    const flap = Math.sin(g.time * 9 + k * 1.7 + i) * size * 0.7;
                    ctx.globalAlpha = fogAlpha(q[2]);
                    ctx.lineWidth = Math.max(1, size * 0.35);
                    ctx.beginPath();
                    ctx.moveTo(q[0] - size, q[1] - flap);
                    ctx.lineTo(q[0], q[1]);
                    ctx.lineTo(q[0] + size, q[1] - flap);
                    ctx.stroke();
                }
            }
        }
        ctx.globalAlpha = 1;
    }
    // ---- 4. Effects ---------------------------------------------------------------------
    // An additive glow centred at (x, y).
    function glow(ctx, x, y, r) {
        const tex = textures();
        const prev = ctx.globalCompositeOperation;
        ctx.globalCompositeOperation = 'lighter';
        ctx.drawImage(tex.glow, x - r, y - r, r * 2, r * 2);
        ctx.globalCompositeOperation = prev;
    }
    function puffs(ctx, g, c) {
        const tex = textures();
        // Smoke and dust first (normal blending), fire and sparks after (adding light).
        for (const pass of [0, 1]) {
            ctx.globalCompositeOperation = pass === 0 ? 'source-over' : 'lighter';
            for (const p of g.puffs) {
                const kind = p.kind || 'fire';
                const isLight = kind === 'fire' || kind === 'spark';
                if ((pass === 1) !== isLight)
                    continue;
                const q = project(c, p.X, p.h, p.Z);
                if (!q)
                    continue;
                const life = Math.max(0, p.life / p.max);
                const age = 1 - life;
                let size = (p.size * FOCAL) / q[2];
                let img = tex.fire;
                let alpha = life;
                if (kind === 'smoke') {
                    img = tex.smoke;
                    size *= 1 + age * 2.2;
                    alpha = Math.min(1, life * 1.4) * 0.8;
                }
                else if (kind === 'dust') {
                    img = tex.dust;
                    size *= 1 + age * 1.5;
                    alpha = life * 0.8;
                }
                else if (kind === 'spark') {
                    img = tex.glow;
                    size = Math.max(2, size * 0.6);
                }
                else {
                    size *= 0.8 + age * 0.8;
                }
                if (size < 0.8)
                    continue;
                ctx.globalAlpha = Math.min(1, alpha) * fogAlpha(q[2]);
                ctx.drawImage(img, q[0] - size, q[1] - size, size * 2, size * 2);
            }
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
    }
    // Bullets are tracers: a bright streak along their path.
    function tracers(ctx, c, list, color, width) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = color;
        ctx.lineCap = 'round';
        for (const s of list) {
            const a = project(c, s.X, s.h, s.Z);
            const b = project(c, s.X - s.vX * 0.025, s.h - s.vY * 0.025, s.Z - s.vZ * 0.025);
            if (!a || !b)
                continue;
            ctx.lineWidth = Math.max(1, (width * FOCAL) / a[2]);
            ctx.beginPath();
            ctx.moveTo(b[0], b[1]);
            ctx.lineTo(a[0], a[1]);
            ctx.stroke();
        }
        ctx.globalCompositeOperation = 'source-over';
    }
    function missiles(ctx, g, c) {
        for (const m of g.missiles) {
            const p = project(c, m.X, m.h, m.Z);
            if (!p)
                continue;
            glow(ctx, p[0], p[1], Math.max(3, 900 / p[2]));
            ctx.fillStyle = m.enemy ? '#ff5a5a' : '#ffffff';
            ctx.fillRect(Math.round(p[0]) - 1, Math.round(p[1]) - 1, 3, 3);
        }
        for (const d of g.decoys) {
            const p = project(c, d.X, d.h, d.Z);
            if (p)
                glow(ctx, p[0], p[1], Math.max(3, 1200 / p[2]));
        }
    }
    // Glider rings: glowing hoops standing across the heading.
    function rings(ctx, g, c) {
        const rhx = Math.cos(g.plane.yaw), rhz = -Math.sin(g.plane.yaw);
        for (const ring of g.mission.hoops) {
            const pts = [];
            let depth = 0;
            for (let a = 0; a < 32; a++) {
                const t = (a / 32) * Math.PI * 2;
                const p = project(c, ring.X + rhx * Math.cos(t) * ring.r, ring.h + Math.sin(t) * ring.r, ring.Z + rhz * Math.cos(t) * ring.r);
                if (!p)
                    break;
                pts.push([p[0], p[1]]);
                depth = p[2];
            }
            if (pts.length < 32)
                continue;
            const w = Math.max(1.5, 2.2 * FOCAL / depth);
            const path = () => {
                ctx.beginPath();
                ctx.moveTo(pts[0][0], pts[0][1]);
                for (let k = 1; k < pts.length; k++)
                    ctx.lineTo(pts[k][0], pts[k][1]);
                ctx.closePath();
            };
            ctx.globalAlpha = fogAlpha(depth);
            ctx.globalCompositeOperation = 'lighter';
            ctx.lineWidth = w * 3;
            ctx.strokeStyle = ring.passed ? 'rgba(120,230,150,0.25)' : 'rgba(255,170,120,0.3)';
            path();
            ctx.stroke();
            ctx.globalCompositeOperation = 'source-over';
            ctx.lineWidth = w;
            ctx.strokeStyle = ring.passed ? '#7fe0a0' : '#ffb08a';
            path();
            ctx.stroke();
            ctx.lineWidth = Math.max(1, w * 0.35);
            ctx.strokeStyle = 'rgba(255,255,255,0.8)';
            path();
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }
    const streams = [];
    let streamClock = 0;
    const ribbons = [[], []];
    const RIBBON_LIFE = 0.5;
    const CURVE = 260; // screen pixels the trail drifts per radian of turn (for a point a quarter second old)
    let lastPlaneYaw = null;
    // The older a point, the further behind the plane it is, so the more a turn swings it out:
    // the drift grows with age, and the trail bends into a curve.
    function driftTrails(dx, dy) {
        for (const s of streams) {
            const k = (s.max - s.life) * 4;
            s.x += dx * k;
            s.y += dy * k;
        }
        for (const r of ribbons)
            for (const q of r) {
                const k = (RIBBON_LIFE - q.life) * 4;
                q.x += dx * k;
                q.y += dy * k;
            }
    }
    function updateRibbons(dt) {
        for (const r of ribbons) {
            for (const q of r) {
                q.x += q.vx * dt;
                q.y += q.vy * dt;
                q.life -= dt;
            }
            while (r.length && r[0].life <= 0)
                r.shift();
        }
    }
    function drawRibbons(ctx) {
        ctx.lineWidth = 1.3;
        ctx.lineCap = 'round';
        for (const r of ribbons) {
            for (let i = 1; i < r.length; i++) {
                const q = r[i], o = r[i - 1];
                ctx.strokeStyle = `rgba(255,255,255,${(q.a * q.life / RIBBON_LIFE).toFixed(3)})`;
                ctx.beginPath();
                ctx.moveTo(o.x, o.y);
                ctx.lineTo(q.x, q.y);
                ctx.stroke();
            }
        }
    }
    function updateStreams(dt) {
        for (const s of streams) {
            s.x += s.vx * dt;
            s.y += s.vy * dt;
            s.r += s.grow * dt;
            s.life -= dt;
        }
        for (let k = streams.length - 1; k >= 0; k--)
            if (streams[k].life <= 0)
                streams.splice(k, 1);
    }
    function drawStreams(ctx) {
        const tex = textures();
        for (const s of streams) {
            ctx.globalAlpha = Math.max(0, s.alpha * (s.life / s.max));
            ctx.drawImage(tex.mist, s.x - s.r, s.y - s.r, s.r * 2, s.r * 2);
        }
        ctx.globalAlpha = 1;
    }
    // The plane sits in the same place on the screen; the world moves past it. It is a voxel
    // model too, a quarter to a third of the screen wide as the turn tightens, banked with the
    // part of the roll the camera does not take, with glowing engines, a muzzle flash when the
    // gun fires, smoke where it was hit, and a blink after a loss.
    function plane(ctx, g, c) {
        const p = g.plane;
        const glider = g.settings.mode === 'glider';
        const name = glider ? 'glider' : 'plane';
        const m = PA.model(name);
        const v = VIEWS[g.settings.view];
        // Its shadow, the shape of the plane, on the ground.
        drawShadow(ctx, c, name, p.X, p.h, p.Z, p.yaw);
        if (g.phase === 'crashed' && Math.floor(g.blink * 8) % 2 === 0)
            return;
        const tight = Math.min(1, Math.abs(p.bank) / PA.AIR.bankMax);
        // Seen from a little higher than the camera really is, so the plane's shape reads.
        const viewElev = g.settings.view === 'top' ? 1.5 : 0.52;
        const pose = {
            sx: PA.W / 2,
            sy: PA.H * PLANE_SCREEN_Y,
            px: (PA.W * (0.25 + 0.08 * tight)) / m.w,
            yaw: 0,
            elev: Math.max(0.25, Math.min(1.5, viewElev - p.pitch * 0.4)),
            roll: g.settings.view === 'top' ? p.bank : p.bank * (1 - ROLL_FOLLOW),
        };
        PA.drawModel(ctx, m, pose);
        // Streams: the air rushes back past the plane, from nose to tail on the screen.
        const now = performance.now();
        const dt = Math.min(0.05, Math.max(0, (now - streamClock) / 1000));
        streamClock = now;
        if (!g.paused) {
            updateStreams(dt);
            updateRibbons(dt);
            // As the plane turns, the air it left behind slides out of the turn on the screen.
            let dYaw = lastPlaneYaw === null ? 0 : p.yaw - lastPlaneYaw;
            while (dYaw > Math.PI)
                dYaw -= 2 * Math.PI;
            while (dYaw < -Math.PI)
                dYaw += 2 * Math.PI;
            lastPlaneYaw = p.yaw;
            {
                const [lx, ly] = PA.modelToScreen(m, pose, 0, m.l / 2, 3);
                const [rx, ry] = PA.modelToScreen(m, pose, m.w, m.l / 2, 3);
                const ll = Math.hypot(rx - lx, ry - ly) || 1;
                const k = -dYaw * CURVE / ll;
                if (Math.abs(dYaw) < 0.2)
                    driftTrails((rx - lx) * k, (ry - ly) * k);
            }
            if (g.phase === 'flying') {
                const [nx, ny] = PA.modelToScreen(m, pose, m.w / 2, 0, 3);
                const [bx2, by2] = PA.modelToScreen(m, pose, m.w / 2, m.l, 3);
                const bl = Math.hypot(bx2 - nx, by2 - ny) || 1;
                const backX = (bx2 - nx) / bl, backY = (by2 - ny) / bl;
                // Vapour from both wing tips in a tight turn.
                if (tight > 0.4) {
                    const tips = glider ? [[0.5, 28, 4.5], [m.w - 0.5, 28, 4.5]] : [[1.5, 14.5, 3.5], [34.5, 14.5, 3.5]];
                    const n = tight > 0.7 ? 3 : 2;
                    tips.forEach(([tx, ty, tz], side) => {
                        const [sx, sy] = PA.modelToScreen(m, pose, tx, ty, tz);
                        for (let k = 0; k < n; k++) {
                            const sp = 120 + Math.random() * 60;
                            streams.push({ x: sx + (Math.random() - 0.5) * 2, y: sy + (Math.random() - 0.5) * 2, vx: backX * sp, vy: backY * sp, life: 0.6, max: 0.6, r: 1.2, grow: 9, alpha: 0.4 + 0.4 * tight });
                        }
                        const r = ribbons[side];
                        const fresh = { x: sx, y: sy, vx: backX * 150, vy: backY * 150, life: RIBBON_LIFE, a: 0.6 * tight };
                        // After a gap, start a new line instead of joining it to the old one.
                        if (r.length && r[r.length - 1].life < RIBBON_LIFE - 0.1)
                            r.push({ ...fresh, a: 0 });
                        r.push(fresh);
                    });
                }
                // Heat from the engines: a soft shimmer behind each, stronger with the boost.
                if (!glider) {
                    const boost = g.held.boost;
                    for (const ex of [13.5, 22.5]) {
                        if (!boost && Math.random() > 0.35)
                            continue;
                        const [sx, sy] = PA.modelToScreen(m, pose, ex, 26.5, 6.8);
                        const sp = 90 + Math.random() * 40;
                        streams.push({ x: sx, y: sy, vx: backX * sp + (Math.random() - 0.5) * 10, vy: backY * sp, life: boost ? 0.6 : 0.35, max: boost ? 0.6 : 0.35, r: 2, grow: boost ? 16 : 9, alpha: boost ? 0.35 : 0.18 });
                    }
                }
            }
        }
        drawStreams(ctx);
        drawRibbons(ctx);
        const tex = textures();
        if (!glider) {
            // Engine glow, bigger with the boost.
            const boost = g.held.boost && g.phase === 'flying';
            for (const ex of [13.5, 22.5]) {
                const [x, y] = PA.modelToScreen(m, pose, ex, 26, 6.8);
                const r = (boost ? 7 : 3.5) + Math.random() * 1.5;
                ctx.globalCompositeOperation = 'lighter';
                ctx.drawImage(tex.fire, x - r, y - r, r * 2, r * 2);
                if (boost)
                    ctx.drawImage(tex.fire, x - r * 0.7, y + r * 0.4, r * 1.4, r * 2.4);
                ctx.globalCompositeOperation = 'source-over';
            }
            // Muzzle flash at the nose while the gun fires.
            if (g.held.fire && g.ammo >= 1 && g.fireCool > 0.03) {
                const [x, y] = PA.modelToScreen(m, pose, 18, 0, 3);
                glow(ctx, x, y, 8 + Math.random() * 6);
            }
        }
        // Damage: smoke rising from the wing where each hit landed.
        for (const mk of g.marks) {
            const [x, y] = PA.modelToScreen(m, pose, m.w / 2 + mk.x * 1.5, m.l * 0.45, 4);
            for (let k = 0; k < 3; k++) {
                const a = (mk.age * 1.6 + k / 3) % 1;
                const r = 4 + a * 10;
                ctx.globalAlpha = (1 - a) * 0.7;
                ctx.drawImage(tex.smoke, x - r + a * 4, y - r + a * 10, r * 2, r * 2);
            }
        }
        ctx.globalAlpha = 1;
    }
    // ---- Screen overlays ----------------------------------------------------------------
    // A lens flare when the sun is in front of the camera.
    function lensFlare(ctx, c) {
        const s = project(c, c.px + SUN.x * 8000, c.py + SUN.y * 8000, c.pz + SUN.z * 8000);
        if (!s || s[0] < -40 || s[0] > PA.W + 40 || s[1] < -40 || s[1] > PA.H + 40)
            return;
        ctx.globalAlpha = 0.6;
        glow(ctx, s[0], s[1], 36);
        ctx.globalAlpha = 1;
        const cx = PA.W / 2, cy = PA.H / 2;
        const steps = [[0.4, 8, 'rgba(255,220,160,0.12)'], [0.7, 5, 'rgba(180,220,255,0.12)'], [1.3, 13, 'rgba(255,190,220,0.09)']];
        ctx.globalCompositeOperation = 'lighter';
        for (const [k, r, col] of steps) {
            const x = s[0] + (cx - s[0]) * k, y = s[1] + (cy - s[1]) * k;
            ctx.fillStyle = col;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
    }
    function lockRing(ctx, g, c) {
        const t = g.lock.target;
        if (!t || g.lock.progress <= 0)
            return;
        const q = project(c, t.X, PA.altOf(t), t.Z);
        if (!q)
            return;
        const r = 30 - g.lock.progress * 16;
        ctx.strokeStyle = 'rgba(20,24,40,0.7)';
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
    // The tag: a ring round the plane that closes in as the enemy missile nears.
    function warnRing(ctx, g) {
        if (!g.tagged)
            return;
        const flash = Math.floor(g.time * 8) % 2 === 0;
        const k = Math.max(0, Math.min(1, g.tagDist / 900));
        const r = 22 + k * 84;
        ctx.strokeStyle = flash ? '#ff3b3b' : 'rgba(20,24,40,0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(PA.W / 2, PA.H * PLANE_SCREEN_Y, r, 0, Math.PI * 2);
        ctx.stroke();
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
        ctx.font = 'bold 10px system-ui, sans-serif';
        ctx.fillStyle = PA.INK;
        ctx.fillText(label, ex + 4, ey + 3);
    }
    function forces(ctx, g) {
        const p = g.plane;
        const x = PA.W / 2, y = PA.H * PLANE_SCREEN_Y - 12;
        const k = 1.9;
        arrow(ctx, x, y, 0, p.lift[1] * k, PA.COL.lift, 'lift');
        arrow(ctx, x, y, 0, p.weight[1] * k, PA.COL.weight, 'weight');
        arrow(ctx, x, y, 0, p.thrust[1] * k, PA.COL.thrust, 'thrust');
        arrow(ctx, x, y, p.drag[0] * k, 0, PA.COL.drag, 'drag');
    }
    // The cockpit: canopy struts and an instrument panel along the bottom.
    function cockpit(ctx, g) {
        const panelTop = PA.H * 0.84;
        const grad = ctx.createLinearGradient(0, panelTop, 0, PA.H);
        grad.addColorStop(0, '#45435a');
        grad.addColorStop(1, '#2a2938');
        ctx.fillStyle = grad;
        ctx.fillRect(0, panelTop, PA.W, PA.H - panelTop);
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(0, panelTop, PA.W, 2);
        const gx = PA.W / 2, gy = panelTop + 16;
        ctx.strokeStyle = '#fffdfa';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(gx, gy, 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.save();
        ctx.translate(gx, gy);
        ctx.rotate(-g.plane.bank);
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(10, 0);
        ctx.stroke();
        ctx.restore();
        ctx.strokeStyle = '#2a2938';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(0, panelTop);
        ctx.lineTo(PA.W * 0.22, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(PA.W, panelTop);
        ctx.lineTo(PA.W * 0.78, 0);
        ctx.stroke();
    }
    // How long each stage took on the last frame, in milliseconds (for tuning).
    PA.renderStats = { background: 0, objects: 0, total: 0, things: 0 };
    function render(ctx, g) {
        const t0 = performance.now();
        PA.cacheFrame();
        ctx.imageSmoothingEnabled = false;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const c = makeCam(g);
        paintBackground(ctx, g, c);
        const t1 = performance.now();
        clouds(ctx, g, c);
        objects(ctx, g, c);
        birds(ctx, g, c);
        const t2 = performance.now();
        if (g.settings.view !== 'cockpit' && g.mission.mode === 'glider')
            rings(ctx, g, c);
        tracers(ctx, c, g.shots, 'rgba(255,236,150,0.95)', 0.35);
        tracers(ctx, c, g.shells, 'rgba(255,150,90,0.9)', 0.5);
        missiles(ctx, g, c);
        puffs(ctx, g, c);
        lockRing(ctx, g, c);
        if (g.settings.view !== 'cockpit')
            plane(ctx, g, c);
        lensFlare(ctx, c);
        warnRing(ctx, g);
        if (g.settings.view === 'cockpit')
            cockpit(ctx, g);
        if (g.settings.forces)
            forces(ctx, g);
        ctx.drawImage(textures().vignette, 0, 0);
        const t3 = performance.now();
        PA.renderStats.background = PA.renderStats.background * 0.9 + (t1 - t0) * 0.1;
        // A slow device paints the ground every other column; a fast one goes back to every pixel.
        if (!halfGround && PA.renderStats.background > 15)
            halfGround = true;
        else if (halfGround && PA.renderStats.background < 6)
            halfGround = false;
        PA.renderStats.objects = PA.renderStats.objects * 0.9 + (t2 - t1) * 0.1;
        PA.renderStats.total = PA.renderStats.total * 0.9 + (t3 - t0) * 0.1;
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
        mode: 'glider', control: 'drag', view: 'chase', difficulty: 'felix', sound: 1,
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
            : g.settings.mode === 'glider' ? ''
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
