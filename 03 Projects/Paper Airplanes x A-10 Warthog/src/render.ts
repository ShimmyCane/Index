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
namespace PA {
  const FOCAL = 240;          // pixels: how big a metre looks at distance one
  const CAM_BACK = 26;        // metres behind the plane
  const CAM_UP = 8;           // metres above the plane
  const TILT = 0.2;           // radians the camera looks down
  const ROLL_FOLLOW = 0.4;    // the camera follows this share of the bank; the plane shows the rest
  const PLANE_SCREEN_Y = 0.72;
  const FOG = 1150;           // metres: how quickly distance fades into the haze
  const OBJECT_SCALE = 1.5;   // models are drawn half again larger than life, so they read well
  const FAR_LOD = 450;        // beyond this the ground is painted every other pixel
  const DETAIL_NEAR = 260;    // fine ground detail fades out by this distance
  const TREE_RANGE = 11;      // forest squares drawn each way (40 m squares)

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

  interface Cam {
    px: number; py: number; pz: number;           // camera position
    rx: number; ry: number; rz: number;           // right
    ux: number; uy: number; uz: number;           // up
    fx: number; fy: number; fz: number;           // forward
    roll: number;                                 // screen rotation of "up" (canvas, clockwise)
    yaw: number;                                  // the camera's heading
  }

  function makeCam(g: Game): Cam {
    const p = g.plane;
    const v = VIEWS[g.settings.view];
    const sinY = Math.sin(p.yaw), cosY = Math.cos(p.yaw);
    const hx = sinY, hz = cosY;             // horizontal forward
    const rhx = cosY, rhz = -sinY;          // horizontal right
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
  function project(c: Cam, X: number, h: number, Z: number): [number, number, number] | null {
    const dx = X - c.px, dy = h - c.py, dz = Z - c.pz;
    const zc = dx * c.fx + dy * c.fy + dz * c.fz;
    if (zc < 1) return null;
    const xc = dx * c.rx + dy * c.ry + dz * c.rz;
    const yc = dx * c.ux + dy * c.uy + dz * c.uz;
    return [W / 2 + (FOCAL * xc) / zc, H / 2 - (FOCAL * yc) / zc, zc];
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

  function gridCell(ix: number, iz: number): number {
    const k = (ix & GMASK) + ((iz & GMASK) << 9);
    if (gTagX[k] !== ix || gTagZ[k] !== iz) {
      gTagX[k] = ix;
      gTagZ[k] = iz;
      const X = ix * GRID, Z = iz * GRID;
      gWild[k] = wildValue(X, Z);
      gRegion[k] = regionValue(X, Z);
      gVar[k] = hash2(ix, iz);
    }
    return k;
  }

  // The coast, stored every 8 m of Z.
  const cTag = new Int32Array(4096).fill(0x7fffffff);
  const cVal = new Float32Array(4096);
  function coastAt(Z: number): number {
    const iz = Math.floor(Z / 8), f = Z / 8 - iz;
    const k0 = iz & 4095, k1 = (iz + 1) & 4095;
    if (cTag[k0] !== iz) { cTag[k0] = iz; cVal[k0] = coastX(iz * 8); }
    if (cTag[k1] !== iz + 1) { cTag[k1] = iz + 1; cVal[k1] = coastX((iz + 1) * 8); }
    return cVal[k0] + (cVal[k1] - cVal[k0]) * f;
  }

  // Haze by distance, worked out once (every 4 m up to 8 km).
  const FOG_LUT = (() => {
    const t = new Float32Array(2001);
    for (let i = 0; i <= 2000; i++) t[i] = 1 - Math.exp(-(i * 4) / FOG);
    return t;
  })();
  function fogAt(dist: number): number {
    const i = dist * 0.25;
    return i >= 2000 ? FOG_LUT[2000] : FOG_LUT[i | 0];
  }

  function pack(r: number, g: number, b: number): number {
    return (0xff000000 | ((b & 255) << 16) | ((g & 255) << 8) | (r & 255)) >>> 0;
  }

  // The fields at one point, smoothly between the stored grid corners.
  let fWild = 0, fRegion = 0, fVar = 0;
  function readFields(X: number, Z: number): void {
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

  function mod(a: number, n: number): number {
    return a - Math.floor(a / n) * n;
  }

  // The ground's colour at (X, Z), seen along the unit ray (dx, dy, dz) from distance dist.
  function groundColor(X: number, Z: number, dist: number, dx: number, dy: number, dz: number, t: number): number {
    const fog = fogAt(dist);
    if (fog > 0.985) return HAZE_PACKED;
    const near = Math.max(0, 1 - dist / DETAIL_NEAR);
    let r = 0, g = 0, b = 0;
    let water = false;
    const coast = coastAt(Z);
    const seaD = X - coast;

    if (seaD > -24) {
      // The coast: a sand beach, then surf, shallows and the deep sea.
      if (seaD < 0) { r = 238; g = 222; b = 172; }
      else {
        water = true;
        const deep = Math.min(1, seaD / 90);
        r = 112 - 62 * deep; g = 200 - 62 * deep; b = 228 - 22 * deep;
        if (seaD < 5 && Math.sin(t * 2.2 + Z * 0.08 + seaD * 0.9) > -0.2) { r = 248; g = 250; b = 246; water = false; }
      }
    } else {
      readFields(X, Z);
      const roadD = Math.abs(X - ROAD_X), railD = Math.abs(X - RAIL_X);
      if (roadD < ROAD_W + 1.6) {
        if (roadD > ROAD_W) { r = 196; g = 184; b = 160; }
        else {
          r = 116; g = 121; b = 130;
          if (roadD > ROAD_W - 1.2 && roadD < ROAD_W - 0.6) { r = 236; g = 236; b = 230; }
          if (roadD < 0.35 && mod(Z, 16) < 8) { r = 244; g = 214; b = 112; }
        }
      } else if (railD < 2.4) {
        r = 172; g = 162; b = 146;
        if (railD < 1.8 && mod(Z, 1.5) < 0.55) { r = 118; g = 90; b = 68; }
        if (railD > 0.62 && railD < 0.86) { r = 88; g = 94; b = 100; }
      } else if (fWild > LAKE_LEVEL && roadD > 30 && railD > 20) {
        water = true;
        const deep = Math.min(1, (fWild - LAKE_LEVEL) / 0.06);
        r = 104 - 40 * deep; g = 196 - 50 * deep; b = 222 - 10 * deep;
        if (fWild < LAKE_LEVEL + 0.006 && Math.sin(t * 2 + X * 0.21 + Z * 0.17) > 0) { r = 246; g = 249; b = 244; water = false; }
      } else if (fWild > LAKE_LEVEL - 0.018 && roadD > 30 && railD > 20) {
        r = 236; g = 220; b = 168;                                      // lake shore sand
      } else if (fWild > FOREST_LEVEL && roadD > 16 && railD > 10) {
        // Forest floor: deep green, mottled.
        const m = 0.88 + 0.24 * fVar;
        r = 112 * m; g = 170 * m; b = 92 * m;
      } else if (fRegion < 0.42) {
        // Farm fields: patches on a tilted grid, each its own crop, sown in rows, with hedges.
        const pu = (X * 0.94 + Z * 0.34) / 70, pv = (Z * 0.94 - X * 0.34) / 46;
        const iu = Math.floor(pu), iv = Math.floor(pv);
        const fu = pu - iu, fv = pv - iv;
        const crop = hash2(iu + 977, iv - 311);
        if (crop < 0.24) { r = 236; g = 208; b = 118; }                 // wheat
        else if (crop < 0.46) { r = 150; g = 206; b = 104; }            // green crop
        else if (crop < 0.62) { r = 182; g = 134; b = 92; }             // ploughed earth
        else if (crop < 0.8) { r = 170; g = 216; b = 128; }             // meadow
        else if (crop < 0.9) { r = 244; g = 214; b = 86; }              // sunflowers
        else { r = 186; g = 166; b = 222; }                             // lavender
        if (near > 0 && mod(fu * 26, 1) < 0.45) { r *= 0.9; g *= 0.9; b *= 0.9; }
        if (fu < 0.03 || fv < 0.045) { r = 92; g = 150; b = 84; }        // hedges
        const far = Math.min(1, Math.max(0, (dist - 380) / 320));       // far away: an even field colour
        r += (186 - r) * far; g += (196 - g) * far; b += (120 - b) * far;
      } else if (fRegion > 0.66) {
        // Town: streets every 36 m, pavements, and lots of paving, gardens or car parks.
        const lx = mod(X, 36), lz = mod(Z, 36);
        if (lx < 5 || lz < 5) {
          r = 128; g = 132; b = 140;
          if ((lx < 5 && Math.abs(lx - 2.5) < 0.25 && mod(Z, 8) < 4) || (lz < 5 && Math.abs(lz - 2.5) < 0.25 && mod(X, 8) < 4)) { r = 236; g = 236; b = 228; }
        } else if (lx < 6.4 || lz < 6.4) { r = 210; g = 204; b = 194; }
        else {
          const lot = hash2(Math.floor(X / 36) + 401, Math.floor(Z / 36) - 77);
          if (lot < 0.45) { r = 214; g = 206; b = 192; }
          else if (lot < 0.8) { r = 150; g = 202; b = 118; }
          else { r = 172; g = 172; b = 178; }
        }
        const far = Math.min(1, Math.max(0, (dist - 380) / 320));
        r += (180 - r) * far; g += (180 - g) * far; b += (172 - b) * far;
      } else {
        // Open grass, gently varied.
        const m = 0.9 + 0.2 * fVar;
        r = 150 * m; g = 206 * m; b = 112 * m;
      }
      // Fine speckle near the camera (grass blades, gravel, crops).
      if (near > 0 && !water) {
        const s = (hash2(Math.floor(X * 0.8), Math.floor(Z * 0.8)) - 0.5) * 0.14 * near;
        r *= 1 + s; g *= 1 + s; b *= 1 + s;
      }
    }

    if (water) {
      // Waves, the sky reflected at a low angle, and the sun glittering on the water.
      const wave = Math.sin(X * 0.11 + t * 1.3) * Math.sin(Z * 0.09 - t * 0.9) * 0.5 + Math.sin((X + Z) * 0.05 + t * 0.7) * 0.5;
      const k = 1 + wave * 0.06;
      r *= k; g *= k; b *= k;
      const q = 1 + dy, q2 = q * q, fres = q2 * q2 * q;
      r += (HORIZON[0] - r) * fres * 0.7; g += (HORIZON[1] - g) * fres * 0.7; b += (HORIZON[2] - b) * fres * 0.7;
      const refl = dx * SUN.x - dy * SUN.y + dz * SUN.z;
      if (refl > 0.94) {
        const u = (refl - 0.94) / 0.06, u2 = u * u;
        const glint = u2 * u2 * u2 * (0.5 + 0.5 * Math.sin(X * 1.7 + Z * 1.3 + t * 6));
        r += 255 * glint; g += 245 * glint; b += 220 * glint;
      }
    } else if (dist < 900) {
      // Cloud shadows drifting across the land.
      const cs = noise2((X + t * 6) / 340, Z / 340);
      if (cs > 0.56) {
        const s = 1 - Math.min(1, (cs - 0.56) / 0.12) * 0.2;
        r *= s; g *= s; b *= s;
      }
    }

    r += (HAZE[0] - r) * fog; g += (HAZE[1] - g) * fog; b += (HAZE[2] - b) * fog;
    return pack(Math.min(255, r), Math.min(255, g), Math.min(255, b));
  }

  // The sky along the unit ray: a gradient, a glow round the sun, the sun itself, far mountains.
  function skyColor(dx: number, dy: number, dz: number): number {
    const k = Math.min(1, Math.max(0, dy / 0.55));
    const s = k * k * (3 - 2 * k);
    let r = HORIZON[0] + (ZENITH[0] - HORIZON[0]) * s;
    let g = HORIZON[1] + (ZENITH[1] - HORIZON[1]) * s;
    let b = HORIZON[2] + (ZENITH[2] - HORIZON[2]) * s;
    const sun = dx * SUN.x + dy * SUN.y + dz * SUN.z;
    if (sun > 0.3) {
      const s2 = sun * sun, s6 = s2 * s2 * s2, s12 = s6 * s6, s48 = s12 * s12 * s12 * s12;
      const wide = s6 * 0.22, glow = s48 * 0.55;
      r += (255 - r) * (wide + glow); g += (236 - g) * (wide + glow); b += (196 - b) * (wide + glow) * 0.7;
      if (sun > 0.9993) { r = 255; g = 252; b = 236; }
    }
    if (dy < 0.08) {
      // Mountain ridges far away on the horizon: a pale far ridge, a bluer near one.
      const az = Math.atan2(dx, dz);
      const far = 0.032 + 0.014 * Math.sin(3 * az + 1.3) + 0.01 * Math.sin(7 * az + 0.4) + 0.005 * Math.sin(17 * az + 2);
      const nearR = 0.016 + 0.01 * Math.sin(5 * az + 2.2) + 0.007 * Math.sin(11 * az + 1) + 0.003 * Math.sin(29 * az);
      if (dy < nearR) { r = 150; g = 172; b = 186; }
      else if (dy < far) {
        if (dy > far - 0.006) { r = 232; g = 238; b = 244; }        // snow on the peaks
        else { r = 182; g = 198; b = 214; }
      } else { return pack(r, g, b); }
      const hz = 0.45;
      r += (HAZE[0] - r) * hz; g += (HAZE[1] - g) * hz; b += (HAZE[2] - b) * hz;
    }
    return pack(r, g, b);
  }

  let bg: ImageData | null = null;
  let bg32 = new Uint32Array(0);
  let halfGround = false;     // set when a device is too slow: the ground is painted every other column

  function paintBackground(ctx: CanvasRenderingContext2D, g: Game, c: Cam): void {
    if (!bg) {
      bg = ctx.createImageData(W, H);
      bg32 = new Uint32Array(bg.data.buffer);
    }
    const t = g.time;
    const camY = Math.max(1, c.py);
    const sunScreen = project(c, c.px + SUN.x * 8000, c.py + SUN.y * 8000, c.pz + SUN.z * 8000);
    for (let y = 0; y < H; y++) {
      const by = (H / 2 - (y + 0.5)) / FOCAL;
      const r0x = c.fx + by * c.ux, r0y = c.fy + by * c.uy, r0z = c.fz + by * c.uz;
      let prev = 0;
      const row = y * W;
      for (let x = 0; x < W; x++) {
        const ax = (x + 0.5 - W / 2) / FOCAL;
        const dx = r0x + ax * c.rx, dy = r0y + ax * c.ry, dz = r0z + ax * c.rz;
        let col: number;
        if (dy < -0.0004) {
          const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const tt = -camY / dy;
          const dist = tt * len;
          if ((x & 1) === 1 && (halfGround || dist > FAR_LOD)) { bg32[row + x] = prev; continue; }
          col = groundColor(c.px + tt * dx, c.pz + tt * dz, dist, dx / len, dy / len, dz / len, t);
        } else {
          // The open sky is smooth: work out one pixel in four, except near the horizon and the sun.
          const nearSun = sunScreen !== null && Math.abs(x - sunScreen[0]) < 70 && Math.abs(y - sunScreen[1]) < 70;
          if (dy > 0.1 && !nearSun && ((x & 1) === 1 || (y & 1) === 1)) {
            bg32[row + x] = (x & 1) === 1 ? prev : bg32[row - W + x];
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

  function softDisc(size: number, stops: [number, string][]): HTMLCanvasElement {
    const cv = document.createElement('canvas');
    cv.width = cv.height = size;
    const x = cv.getContext('2d');
    if (!x) return cv;
    const grad = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    for (const [o, col] of stops) grad.addColorStop(o, col);
    x.fillStyle = grad;
    x.fillRect(0, 0, size, size);
    return cv;
  }

  let TEX: { mist: HTMLCanvasElement; glow: HTMLCanvasElement; fire: HTMLCanvasElement; smoke: HTMLCanvasElement; dust: HTMLCanvasElement; shadow: HTMLCanvasElement; clouds: HTMLCanvasElement[]; vignette: HTMLCanvasElement } | null = null;

  function cloudTexture(seed: number): HTMLCanvasElement {
    const cv = document.createElement('canvas');
    cv.width = 160; cv.height = 80;
    const x = cv.getContext('2d');
    if (!x) return cv;
    const rnd = random(seed);
    const blobs: [number, number, number][] = [];
    for (let i = 0; i < 9; i++) blobs.push([30 + rnd() * 100, 34 + rnd() * 18, 14 + rnd() * 16]);
    // Shaded underside first, then the lit tops.
    for (const [bx, by, br] of blobs) {
      const g1 = x.createRadialGradient(bx, by + 6, 0, bx, by + 6, br);
      g1.addColorStop(0, 'rgba(206,214,228,0.9)'); g1.addColorStop(1, 'rgba(206,214,228,0)');
      x.fillStyle = g1; x.fillRect(0, 0, 160, 80);
    }
    for (const [bx, by, br] of blobs) {
      const g2 = x.createRadialGradient(bx - 3, by - 4, 0, bx - 3, by - 4, br * 0.9);
      g2.addColorStop(0, 'rgba(255,255,255,0.95)'); g2.addColorStop(0.6, 'rgba(255,252,246,0.7)'); g2.addColorStop(1, 'rgba(255,252,246,0)');
      x.fillStyle = g2; x.fillRect(0, 0, 160, 80);
    }
    return cv;
  }

  function textures() {
    if (TEX) return TEX;
    const vig = document.createElement('canvas');
    vig.width = W; vig.height = H;
    const vx = vig.getContext('2d');
    if (vx) {
      const grad = vx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.62);
      grad.addColorStop(0, 'rgba(20,24,40,0)');
      grad.addColorStop(1, 'rgba(20,24,40,0.32)');
      vx.fillStyle = grad;
      vx.fillRect(0, 0, W, H);
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
  const silhouettes: { [name: string]: HTMLCanvasElement } = {};
  function silhouette(name: string): HTMLCanvasElement {
    if (silhouettes[name]) return silhouettes[name];
    const m = model(name);
    const cv = document.createElement('canvas');
    cv.width = m.w; cv.height = m.l;
    const x = cv.getContext('2d');
    if (x) {
      for (const s of m.slices) if (s) x.drawImage(s, 0, 0);
      x.globalCompositeOperation = 'source-in';
      x.fillStyle = 'rgb(24,30,46)';
      x.fillRect(0, 0, m.w, m.l);
    }
    silhouettes[name] = cv;
    return cv;
  }

  // ---- 2. Clouds ----------------------------------------------------------------------

  function clouds(ctx: CanvasRenderingContext2D, g: Game, c: Cam): void {
    const tex = textures();
    const cell = 420;
    const i0 = Math.floor(c.px / cell) - 5, j0 = Math.floor(c.pz / cell) - 5;
    const list: [number, number, number, number, number][] = [];
    for (let i = i0; i <= i0 + 10; i++) {
      for (let j = j0; j <= j0 + 10; j++) {
        if (cellNoise(i, j, 23) < 0.42) continue;
        const X = i * cell + cellNoise(i, j, 29) * 300 + g.time * 4;
        const Z = j * cell + cellNoise(i, j, 31) * 300;
        const h = 190 + cellNoise(i, j, 37) * 90;
        const p = project(c, X, h, Z);
        if (!p || p[2] < 80) continue;
        list.push([p[0], p[1], p[2], 100 + cellNoise(i, j, 41) * 90, Math.floor(cellNoise(i, j, 43) * 4)]);
      }
    }
    list.sort((a, b) => b[2] - a[2]);
    for (const [x, y, zc, size, v] of list) {
      const w = (size * FOCAL) / zc;
      if (w < 4) continue;
      ctx.globalAlpha = Math.max(0, 1 - (1 - Math.exp(-zc / (FOG * 1.6))) * 0.9);
      ctx.drawImage(tex.clouds[v], x - w / 2, y - w / 4, w, w / 2);
    }
    ctx.globalAlpha = 1;
  }

  // ---- 3. Objects ---------------------------------------------------------------------

  interface Thing {
    name: string;
    X: number;
    Z: number;
    base: number;          // height of the model's bottom
    yaw: number;           // world heading of the model's front
    zc: number;
    air: boolean;
  }

  // Which model a target uses, and which way it faces.
  function modelOf(t: Target): string {
    if (t.kind === 'city') return ['city', 'city1', 'city2'][Math.floor(hash2(Math.round(t.X), Math.round(t.Z)) * 3) % 3];
    return t.kind;
  }

  function yawOf(t: Target): number {
    if (t.faction === 'enemy' && t.vH !== undefined) return t.vH;
    if (t.faction === 'ally' && t.orbit) return Math.atan2(-Math.sin(t.orbit.ang), Math.cos(t.orbit.ang));
    if (t.vZ !== undefined && t.vZ !== 0) return t.vZ > 0 ? 0 : Math.PI;
    if (t.kind === 'rail') return 0;
    const h = hash2(Math.round(t.X * 3), Math.round(t.Z * 3));
    if (t.kind === 'ship') return h < 0.5 ? 0 : Math.PI;
    return Math.floor(h * 4) * (Math.PI / 2) + (h - 0.5) * 0.2;
  }

  // Everything to stack this frame: targets, trees in the forests, houses in the towns.
  function collect(g: Game, c: Cam): Thing[] {
    const out: Thing[] = [];
    const add = (name: string, X: number, base: number, Z: number, yaw: number, air: boolean) => {
      const dx = X - c.px, dz = Z - c.pz;
      const zc = dx * c.fx + (base - c.py) * c.fy + dz * c.fz;
      if (zc < 2 || zc > FOG * 1.6) return;
      out.push({ name, X, Z, base, yaw, zc, air });
    };
    for (const t of g.mission.targets) {
      if (!t.alive) continue;
      add(modelOf(t), t.X, altOf(t), t.Z, yawOf(t), t.h !== undefined);
    }
    const CELL = 40;
    const ci = Math.floor(c.px / CELL), cj = Math.floor(c.pz / CELL);
    for (let i = ci - TREE_RANGE; i <= ci + TREE_RANGE; i++) {
      for (let j = cj - TREE_RANGE; j <= cj + TREE_RANGE; j++) {
        const cx = (i + 0.5) * CELL, cz = (j + 0.5) * CELL;
        if ((cx - c.px) * c.fx + (cz - c.pz) * c.fz < -CELL) continue;   // behind the camera
        const biome = biomeAt(cx, cz);
        if (biome === 'forest') {
          const close = Math.hypot(cx - c.px, cz - c.pz) < 300;
          for (let k = 0; k < (close ? 6 : 3); k++) {
            const X = i * CELL + cellNoise(i, j, 41 + k) * CELL, Z = j * CELL + cellNoise(i, j, 47 + k) * CELL;
            if (!isForest(X, Z)) continue;
            const v = cellNoise(i, j, 53 + k);
            const name = v < 0.5 ? 'tree0' : v < 0.75 ? 'tree1' : v < 0.85 ? 'tree2' : v < 0.93 ? 'tree3' : 'tree4';
            add(name, X, 0, Z, v * 6.28, false);
          }
        } else if (biome === 'town' && cellNoise(i, j, 61) < 0.45) {
          const v = cellNoise(i, j, 67);
          const name = v < 0.4 ? 'house1' : v < 0.7 ? 'house2' : v < 0.85 ? 'city1' : 'city';
          add(name, cx + 4, 0, cz + 4, Math.floor(v * 4) * (Math.PI / 2), false);
        } else if (biome === 'farm' && cellNoise(i, j, 71) < 0.05) {
          add(cellNoise(i, j, 73) < 0.5 ? 'farm' : 'barn', cx, 0, cz, cellNoise(i, j, 79) * 6.28, false);
        } else if ((biome === 'army' || biome === 'farm') && cellNoise(i, j, 83) < 0.08) {
          add('tree4', cx + 7, 0, cz - 5, 0, false);
        }
      }
    }
    out.sort((a, b) => b.zc - a.zc);
    renderStats.things = out.length;
    return out;
  }

  function fogAlpha(zc: number): number {
    return Math.max(0, 1 - (1 - Math.exp(-zc / FOG)) * 0.9);
  }

  // The pose of a model standing at (X, base, Z), seen from the camera.
  function poseOf(c: Cam, m: Model, X: number, base: number, Z: number, yaw: number): Pose | null {
    const p = project(c, X, base, Z);
    if (!p) return null;
    const horiz = Math.hypot(X - c.px, Z - c.pz);
    const elev = Math.atan2(c.py - (base + m.h * m.size * 0.5), horiz);
    return { sx: p[0], sy: p[1], px: (FOCAL * m.size * OBJECT_SCALE) / p[2], yaw: yaw - c.yaw, elev, roll: c.roll };
  }

  // A shadow the shape of the model, laid on the ground away from the sun.
  function drawShadow(ctx: CanvasRenderingContext2D, c: Cam, name: string, X: number, base: number, Z: number, yaw: number): void {
    const m = model(name);
    const lift = base + m.h * m.size * OBJECT_SCALE * 0.35;
    const sx = X + SHADOW_X * lift, sz = Z + SHADOW_Z * lift;
    const pose = poseOf(c, m, sx, 0, sz, yaw);
    if (!pose) return;
    pose.elev = Math.atan2(c.py, Math.hypot(sx - c.px, sz - c.pz));
    const flat: Model = { w: m.w, l: m.l, h: 1, size: m.size, slices: [silhouette(name)], top: 0, avg: 'rgba(24,30,46,0.3)' };
    const zc = (FOCAL * m.size * OBJECT_SCALE) / Math.max(0.001, pose.px);
    ctx.globalAlpha = (base > 2 ? 0.16 : 0.26) * fogAlpha(zc);
    drawModel(ctx, flat, pose);
    ctx.globalAlpha = 1;
  }

  function objects(ctx: CanvasRenderingContext2D, g: Game, c: Cam): void {
    const things = collect(g, c);
    for (const th of things) drawShadow(ctx, c, th.name, th.X, th.base, th.Z, th.yaw);
    for (const th of things) {
      const m = model(th.name);
      const pose = poseOf(c, m, th.X, th.base, th.Z, th.yaw);
      if (!pose) continue;
      ctx.globalAlpha = fogAlpha(th.zc);
      drawModel(ctx, m, pose);
      // Fighters and allies show their exhaust as a small glow.
      if (th.air && pose.px > 0.6) {
        const [ex, ey] = modelToScreen(m, pose, m.w / 2, m.l - 1, 3);
        glow(ctx, ex, ey, 4 + pose.px * 3);
      }
    }
    ctx.globalAlpha = 1;
  }

  // ---- 4. Effects ---------------------------------------------------------------------

  // An additive glow centred at (x, y).
  function glow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
    const tex = textures();
    const prev = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(tex.glow, x - r, y - r, r * 2, r * 2);
    ctx.globalCompositeOperation = prev;
  }

  function puffs(ctx: CanvasRenderingContext2D, g: Game, c: Cam): void {
    const tex = textures();
    // Smoke and dust first (normal blending), fire and sparks after (adding light).
    for (const pass of [0, 1]) {
      ctx.globalCompositeOperation = pass === 0 ? 'source-over' : 'lighter';
      for (const p of g.puffs) {
        const kind = p.kind || 'fire';
        const isLight = kind === 'fire' || kind === 'spark';
        if ((pass === 1) !== isLight) continue;
        const q = project(c, p.X, p.h, p.Z);
        if (!q) continue;
        const life = Math.max(0, p.life / p.max);
        const age = 1 - life;
        let size = (p.size * FOCAL) / q[2];
        let img = tex.fire;
        let alpha = life;
        if (kind === 'smoke') { img = tex.smoke; size *= 1 + age * 2.2; alpha = Math.min(1, life * 1.4) * 0.8; }
        else if (kind === 'dust') { img = tex.dust; size *= 1 + age * 1.5; alpha = life * 0.8; }
        else if (kind === 'spark') { img = tex.glow; size = Math.max(2, size * 0.6); }
        else { size *= 0.8 + age * 0.8; }
        if (size < 0.8) continue;
        ctx.globalAlpha = Math.min(1, alpha) * fogAlpha(q[2]);
        ctx.drawImage(img, q[0] - size, q[1] - size, size * 2, size * 2);
      }
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  function wisps(ctx: CanvasRenderingContext2D, g: Game, c: Cam): void {
    const tex = textures();
    for (const w of g.wisps) {
      const q = project(c, w.X, w.h, w.Z);
      if (!q) continue;
      const k = Math.max(0, w.life / w.max);
      const r = Math.max(1, (w.size * (1.3 - k) * FOCAL * 0.5) / q[2]);
      ctx.globalAlpha = Math.min(0.5, k * 0.6);
      ctx.drawImage(tex.mist, q[0] - r, q[1] - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
  }

  // Bullets are tracers: a bright streak along their path.
  function tracers(ctx: CanvasRenderingContext2D, c: Cam, list: Shot[], color: string, width: number): void {
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    for (const s of list) {
      const a = project(c, s.X, s.h, s.Z);
      const b = project(c, s.X - s.vX * 0.025, s.h - s.vY * 0.025, s.Z - s.vZ * 0.025);
      if (!a || !b) continue;
      ctx.lineWidth = Math.max(1, (width * FOCAL) / a[2]);
      ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(a[0], a[1]); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function missiles(ctx: CanvasRenderingContext2D, g: Game, c: Cam): void {
    for (const m of g.missiles) {
      const p = project(c, m.X, m.h, m.Z);
      if (!p) continue;
      glow(ctx, p[0], p[1], Math.max(3, 900 / p[2]));
      ctx.fillStyle = m.enemy ? '#ff5a5a' : '#ffffff';
      ctx.fillRect(Math.round(p[0]) - 1, Math.round(p[1]) - 1, 3, 3);
    }
    for (const d of g.decoys) {
      const p = project(c, d.X, d.h, d.Z);
      if (p) glow(ctx, p[0], p[1], Math.max(3, 1200 / p[2]));
    }
  }

  // Glider rings: glowing hoops standing across the heading.
  function rings(ctx: CanvasRenderingContext2D, g: Game, c: Cam): void {
    const rhx = Math.cos(g.plane.yaw), rhz = -Math.sin(g.plane.yaw);
    for (const ring of g.mission.hoops) {
      const pts: [number, number][] = [];
      let depth = 0;
      for (let a = 0; a < 32; a++) {
        const t = (a / 32) * Math.PI * 2;
        const p = project(c, ring.X + rhx * Math.cos(t) * ring.r, ring.h + Math.sin(t) * ring.r, ring.Z + rhz * Math.cos(t) * ring.r);
        if (!p) break;
        pts.push([p[0], p[1]]);
        depth = p[2];
      }
      if (pts.length < 32) continue;
      const w = Math.max(1.5, 2.2 * FOCAL / depth);
      const path = () => {
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1]);
        ctx.closePath();
      };
      ctx.globalAlpha = fogAlpha(depth);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineWidth = w * 3;
      ctx.strokeStyle = ring.passed ? 'rgba(120,230,150,0.25)' : 'rgba(255,170,120,0.3)';
      path(); ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = w;
      ctx.strokeStyle = ring.passed ? '#7fe0a0' : '#ffb08a';
      path(); ctx.stroke();
      ctx.lineWidth = Math.max(1, w * 0.35);
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      path(); ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  // ---- The plane --------------------------------------------------------------------

  // The plane sits in the same place on the screen; the world moves past it. It is a voxel
  // model too, a quarter to a third of the screen wide as the turn tightens, banked with the
  // part of the roll the camera does not take, with glowing engines, a muzzle flash when the
  // gun fires, smoke where it was hit, and a blink after a loss.
  function plane(ctx: CanvasRenderingContext2D, g: Game, c: Cam): void {
    const p = g.plane;
    const glider = g.settings.mode === 'glider';
    const name = glider ? 'glider' : 'plane';
    const m = model(name);
    const v = VIEWS[g.settings.view];

    // Its shadow, the shape of the plane, on the ground.
    drawShadow(ctx, c, name, p.X, p.h, p.Z, p.yaw);

    if (g.phase === 'crashed' && Math.floor(g.blink * 8) % 2 === 0) return;
    const tight = Math.min(1, Math.abs(p.bank) / AIR.bankMax);
    // Seen from a little higher than the camera really is, so the plane's shape reads.
    const viewElev = g.settings.view === 'top' ? 1.5 : 0.52;
    const pose: Pose = {
      sx: W / 2,
      sy: H * PLANE_SCREEN_Y,
      px: (W * (0.25 + 0.08 * tight)) / m.w,
      yaw: 0,
      elev: Math.max(0.25, Math.min(1.5, viewElev - p.pitch * 0.4)),
      roll: g.settings.view === 'top' ? p.bank : p.bank * (1 - ROLL_FOLLOW),
    };
    drawModel(ctx, m, pose);

    const tex = textures();
    if (!glider) {
      // Engine glow, bigger with the boost.
      const boost = g.held.boost && g.phase === 'flying';
      for (const ex of [13.5, 22.5]) {
        const [x, y] = modelToScreen(m, pose, ex, 26, 6.8);
        const r = (boost ? 7 : 3.5) + Math.random() * 1.5;
        ctx.globalCompositeOperation = 'lighter';
        ctx.drawImage(tex.fire, x - r, y - r, r * 2, r * 2);
        if (boost) ctx.drawImage(tex.fire, x - r * 0.7, y + r * 0.4, r * 1.4, r * 2.4);
        ctx.globalCompositeOperation = 'source-over';
      }
      // Muzzle flash at the nose while the gun fires.
      if (g.held.fire && g.ammo >= 1 && g.fireCool > 0.03) {
        const [x, y] = modelToScreen(m, pose, 18, 0, 3);
        glow(ctx, x, y, 8 + Math.random() * 6);
      }
    }
    // Damage: smoke rising from the wing where each hit landed.
    for (const mk of g.marks) {
      const [x, y] = modelToScreen(m, pose, m.w / 2 + mk.x * 1.5, m.l * 0.45, 4);
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
  function lensFlare(ctx: CanvasRenderingContext2D, c: Cam): void {
    const s = project(c, c.px + SUN.x * 8000, c.py + SUN.y * 8000, c.pz + SUN.z * 8000);
    if (!s || s[0] < -40 || s[0] > W + 40 || s[1] < -40 || s[1] > H + 40) return;
    ctx.globalAlpha = 0.6;
    glow(ctx, s[0], s[1], 36);
    ctx.globalAlpha = 1;
    const cx = W / 2, cy = H / 2;
    const steps: [number, number, string][] = [[0.4, 8, 'rgba(255,220,160,0.12)'], [0.7, 5, 'rgba(180,220,255,0.12)'], [1.3, 13, 'rgba(255,190,220,0.09)']];
    ctx.globalCompositeOperation = 'lighter';
    for (const [k, r, col] of steps) {
      const x = s[0] + (cx - s[0]) * k, y = s[1] + (cy - s[1]) * k;
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function lockRing(ctx: CanvasRenderingContext2D, g: Game, c: Cam): void {
    const t = g.lock.target;
    if (!t || g.lock.progress <= 0) return;
    const q = project(c, t.X, altOf(t), t.Z);
    if (!q) return;
    const r = 30 - g.lock.progress * 16;
    ctx.strokeStyle = 'rgba(20,24,40,0.7)';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(q[0], q[1], r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = g.lock.progress >= 1 ? '#ff6b6b' : '#ffe08a';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(q[0], q[1], r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * g.lock.progress); ctx.stroke();
  }

  // The tag: a ring round the plane that closes in as the enemy missile nears.
  function warnRing(ctx: CanvasRenderingContext2D, g: Game): void {
    if (!g.tagged) return;
    const flash = Math.floor(g.time * 8) % 2 === 0;
    const k = Math.max(0, Math.min(1, g.tagDist / 900));
    const r = 22 + k * 84;
    ctx.strokeStyle = flash ? '#ff3b3b' : 'rgba(20,24,40,0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(W / 2, H * PLANE_SCREEN_Y, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  function arrow(ctx: CanvasRenderingContext2D, x: number, y: number, vx: number, vy: number, color: string, label: string): void {
    const len = Math.hypot(vx, vy);
    if (len < 2) return;
    const ex = x + vx, ey = y - vy;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey); ctx.stroke();
    const a = Math.atan2(-(ey - y), ex - x);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - 7 * Math.cos(a - 0.45), ey + 7 * Math.sin(a - 0.45));
    ctx.lineTo(ex - 7 * Math.cos(a + 0.45), ey + 7 * Math.sin(a + 0.45));
    ctx.closePath();
    ctx.fill();
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.fillStyle = INK;
    ctx.fillText(label, ex + 4, ey + 3);
  }

  function forces(ctx: CanvasRenderingContext2D, g: Game): void {
    const p = g.plane;
    const x = W / 2, y = H * PLANE_SCREEN_Y - 12;
    const k = 1.9;
    arrow(ctx, x, y, 0, p.lift[1] * k, COL.lift, 'lift');
    arrow(ctx, x, y, 0, p.weight[1] * k, COL.weight, 'weight');
    arrow(ctx, x, y, 0, p.thrust[1] * k, COL.thrust, 'thrust');
    arrow(ctx, x, y, p.drag[0] * k, 0, COL.drag, 'drag');
  }

  // The cockpit: canopy struts and an instrument panel along the bottom.
  function cockpit(ctx: CanvasRenderingContext2D, g: Game): void {
    const panelTop = H * 0.84;
    const grad = ctx.createLinearGradient(0, panelTop, 0, H);
    grad.addColorStop(0, '#45435a');
    grad.addColorStop(1, '#2a2938');
    ctx.fillStyle = grad;
    ctx.fillRect(0, panelTop, W, H - panelTop);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(0, panelTop, W, 2);
    const gx = W / 2, gy = panelTop + 16;
    ctx.strokeStyle = '#fffdfa';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(gx, gy, 10, 0, Math.PI * 2); ctx.stroke();
    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate(-g.plane.bank);
    ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = '#2a2938';
    ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(0, panelTop); ctx.lineTo(W * 0.22, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W, panelTop); ctx.lineTo(W * 0.78, 0); ctx.stroke();
  }

  // How long each stage took on the last frame, in milliseconds (for tuning).
  export const renderStats = { background: 0, objects: 0, total: 0, things: 0 };

  export function render(ctx: CanvasRenderingContext2D, g: Game): void {
    const t0 = performance.now();
    ctx.imageSmoothingEnabled = false;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const c = makeCam(g);
    paintBackground(ctx, g, c);
    const t1 = performance.now();
    clouds(ctx, g, c);
    objects(ctx, g, c);
    const t2 = performance.now();
    if (g.settings.view !== 'cockpit' && g.mission.mode === 'glider') rings(ctx, g, c);
    tracers(ctx, c, g.shots, 'rgba(255,236,150,0.95)', 0.35);
    tracers(ctx, c, g.shells, 'rgba(255,150,90,0.9)', 0.5);
    missiles(ctx, g, c);
    wisps(ctx, g, c);
    puffs(ctx, g, c);
    lockRing(ctx, g, c);
    if (g.settings.view !== 'cockpit') plane(ctx, g, c);
    lensFlare(ctx, c);
    warnRing(ctx, g);
    if (g.settings.view === 'cockpit') cockpit(ctx, g);
    if (g.settings.forces) forces(ctx, g);
    ctx.drawImage(textures().vignette, 0, 0);
    const t3 = performance.now();
    renderStats.background = renderStats.background * 0.9 + (t1 - t0) * 0.1;
    // A slow device paints the ground every other column; a fast one goes back to every pixel.
    if (!halfGround && renderStats.background > 15) halfGround = true;
    else if (halfGround && renderStats.background < 6) halfGround = false;
    renderStats.objects = renderStats.objects * 0.9 + (t2 - t1) * 0.1;
    renderStats.total = renderStats.total * 0.9 + (t3 - t0) * 0.1;
  }
}
