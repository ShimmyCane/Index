// Drawing the chase view (and the top-down and cockpit views). The camera sits
// behind the plane and turns with its heading and bank. The ground is a checkerboard
// in world space, with lakes, forests, a road with stripes, and clouds high up.
// Everything standing on the ground or flying is a sprite placed by perspective and
// sorted from far to near.
namespace PA {
  const FOCAL = 200;          // pixels: how big a metre looks at distance one
  const CAM_BACK = 26;        // metres behind the plane
  const CAM_UP = 8;           // metres above the plane
  const TILT = 0.2;           // radians the camera looks down
  const CELL = 40;            // metres per ground square
  const RANGE = 16;           // squares drawn each way from the camera
  const FOG_FAR = 900;        // metres where the ground fades into the sky
  const PLANE_SCREEN_Y = 0.72;
  const PX_PER_M = 0.6;       // sprite pixel size in metres (ground and air things), twice the first size
  const PLANE_SCALE = 2;      // the plane sprite is drawn at a whole-number scale
  const NEAR_BOOST_M = 220;   // closer than this, things grow up to three times
  const MIN_PX = 10;          // the smallest a thing is drawn (tall)
  const MAX_PX = 220;         // the largest, so nothing fills the whole screen

  // Camera placement for each view: where it sits behind the plane, how high, and how far it looks down.
  const VIEWS = {
    chase: { back: CAM_BACK, up: CAM_UP, tilt: TILT, range: RANGE },
    top: { back: 4, up: 110, tilt: 1.35, range: 26 },
    cockpit: { back: -1.5, up: 1.4, tilt: 0.02, range: RANGE },
  };

  interface Cam {
    px: number; py: number; pz: number;           // camera position
    rx: number; ry: number; rz: number;           // right
    ux: number; uy: number; uz: number;           // up
    fx: number; fy: number; fz: number;           // forward
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
  function project(c: Cam, X: number, h: number, Z: number, clampDepth = false): [number, number, number] | null {
    const dx = X - c.px, dy = h - c.py, dz = Z - c.pz;
    let zc = dx * c.fx + dy * c.fy + dz * c.fz;
    if (zc < 1) {
      if (!clampDepth) return null;
      zc = 1;
    }
    const xc = dx * c.rx + dy * c.ry + dz * c.rz;
    const yc = dx * c.ux + dy * c.uy + dz * c.uz;
    return [W / 2 + (FOCAL * xc) / zc, H / 2 - (FOCAL * yc) / zc, zc];
  }

  function mix(a: string, b: string, t: number): string {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const ch = (s: number) => Math.round(s);
    const r = ch(((pa >> 16) & 255) * (1 - t) + ((pb >> 16) & 255) * t);
    const gg = ch(((pa >> 8) & 255) * (1 - t) + ((pb >> 8) & 255) * t);
    const bb = ch((pa & 255) * (1 - t) + (pb & 255) * t);
    return '#' + ((1 << 24) | (r << 16) | (gg << 8) | bb).toString(16).slice(1);
  }

  function sky(ctx: CanvasRenderingContext2D): void {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, COL.skyTop);
    grad.addColorStop(0.6, COL.skyBottom);
    grad.addColorStop(1, COL.skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = COL.sun;
    ctx.beginPath();
    ctx.arc(330, 34, 14, 0, Math.PI * 2);
    ctx.fill();
  }

  // Clouds high in the air: soft puffs at fixed places in the world, drifting slowly.
  function clouds(ctx: CanvasRenderingContext2D, g: Game, c: Cam): void {
    const i0 = Math.floor(c.px / 300) - 4, i1 = i0 + 9;
    const j0 = Math.floor(c.pz / 300) - 4, j1 = j0 + 9;
    const drift = g.time * 4;
    ctx.fillStyle = 'rgba(255,253,250,0.85)';
    for (let i = i0; i <= i1; i++) {
      for (let j = j0; j <= j1; j++) {
        if (cellNoise(i, j, 23) < 0.45) continue;
        const X = i * 300 + cellNoise(i, j, 29) * 240 + drift;
        const Z = j * 300 + cellNoise(i, j, 31) * 240;
        const h = 140 + cellNoise(i, j, 37) * 60;
        const p = project(c, X, h, Z);
        if (!p) continue;
        const r = (46 * FOCAL) / p[2];
        if (r < 2) continue;
        ctx.beginPath();
        ctx.ellipse(p[0], p[1], r * 1.6, r * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Ground: squares of the world, far ones first, each faded toward the sky.
  function ground(ctx: CanvasRenderingContext2D, g: Game, c: Cam): void {
    const range = VIEWS[g.settings.view].range;
    const ci = Math.round(c.px / CELL), cj = Math.round(c.pz / CELL);
    type Cell = { pts: [number, number][]; depth: number; color: string };
    const cells: Cell[] = [];
    for (let i = ci - range; i < ci + range; i++) {
      for (let j = cj - range; j < cj + range; j++) {
        const corners: [number, number, number][] = [];
        for (const [a, b] of [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]] as [number, number][]) {
          const p = project(c, a * CELL, groundAt(a * CELL, b * CELL), b * CELL, true);
          if (p) corners.push(p);
        }
        if (corners.length < 4) continue;
        const depth = (corners[0][2] + corners[2][2]) / 2;
        const cx = (i + 0.5) * CELL, cz = (j + 0.5) * CELL;
        const biome = biomeAt(cx, cz);
        const light = ((i + j) & 1) === 0;
        const base = biome === 'sea' ? (light ? '#9fd3ea' : '#8cc6e2')
          : biome === 'lake' ? (light ? '#86c9e6' : '#74bddf')
          : biome === 'farm' ? (light ? '#cfe3a2' : '#e6d9a0')
          : biome === 'town' ? (light ? '#cfd3d8' : '#bcc2c9')
          : biome === 'forest' ? (light ? '#a6d69a' : '#93c888')
          : (light ? COL.ground : COL.groundDark);
        cells.push({
          pts: corners.map(p => [p[0], p[1]] as [number, number]),
          depth,
          color: mix(base, COL.skyBottom, Math.min(1, depth / FOG_FAR)),
        });
      }
    }
    cells.sort((a, b) => b.depth - a.depth);
    for (const cell of cells) {
      ctx.fillStyle = cell.color;
      ctx.beginPath();
      ctx.moveTo(cell.pts[0][0], cell.pts[0][1]);
      for (let k = 1; k < 4; k++) ctx.lineTo(cell.pts[k][0], cell.pts[k][1]);
      ctx.closePath();
      ctx.fill();
    }
  }

  // The main road: a grey band with a dashed white centre stripe, drawn in world space.
  function road(ctx: CanvasRenderingContext2D, g: Game, c: Cam): void {
    const z0 = Math.floor(c.pz / 25) * 25 - 50;
    const z1 = c.pz + 900;
    const edge = (X: number, z: number): [number, number] | null => {
      const p = project(c, X, groundAt(ROAD_X, z) + 0.05, z, true);
      return p ? [p[0], p[1]] : null;
    };
    ctx.fillStyle = '#8a8f99';
    for (let z = z0; z < z1; z += 25) {
      const a = edge(ROAD_X - ROAD_W, z), b = edge(ROAD_X + ROAD_W, z);
      const c2 = edge(ROAD_X + ROAD_W, z + 25), d = edge(ROAD_X - ROAD_W, z + 25);
      if (!a || !b || !c2 || !d) continue;
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c2[0], c2[1]); ctx.lineTo(d[0], d[1]);
      ctx.closePath();
      ctx.fill();
    }
    // Stripes: a white dash every 50 m along the centre.
    ctx.fillStyle = '#fffdfa';
    for (let z = z0; z < z1; z += 50) {
      const a = edge(ROAD_X - 0.6, z + 6), b = edge(ROAD_X + 0.6, z + 6);
      const c2 = edge(ROAD_X + 0.6, z + 26), d = edge(ROAD_X - 0.6, z + 26);
      if (!a || !b || !c2 || !d) continue;
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c2[0], c2[1]); ctx.lineTo(d[0], d[1]);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Things standing on the ground or flying: sprites placed by perspective.
  // Drawn as one list, far to near, so trees, vehicles and planes overlap correctly.
  interface Thing { zc: number; img: HTMLCanvasElement; X: number; base: number; Z: number; facing: number; flip: boolean; }

  // Which way a thing faces, in the ground plane (0 = east, the way the sprites face).
  function facingOf(t: Target): number {
    if (t.faction === 'enemy' && t.vH !== undefined) return Math.atan2(Math.cos(t.vH), Math.sin(t.vH));
    if (t.vZ !== undefined && t.vZ !== 0) return t.vZ > 0 ? Math.PI / 2 : -Math.PI / 2;
    return 0;
  }

  function collect(g: Game, c: Cam): Thing[] {
    const things: Thing[] = [];
    const range = VIEWS[g.settings.view].range;
    // Trees: a few in each forest square near the camera.
    const ci = Math.round(c.px / CELL), cj = Math.round(c.pz / CELL);
    const tree = stackedSprite('tree', 4, 1);
    for (let i = ci - range; i < ci + range; i++) {
      for (let j = cj - range; j < cj + range; j++) {
        const cx0 = i * CELL, cz0 = j * CELL;
        if (biomeAt(cx0 + CELL / 2, cz0 + CELL / 2) !== 'forest') continue;
        for (let k = 0; k < 4; k++) {
          const X = cx0 + cellNoise(i, j, 41 + k) * CELL;
          const Z = cz0 + cellNoise(i, j, 47 + k) * CELL;
          const p = project(c, X, groundAt(X, Z), Z);
          if (p) things.push({ zc: p[2], img: tree, X, base: groundAt(X, Z), Z, facing: 0, flip: false });
        }
      }
    }
    for (const t of g.mission.targets) {
      if (!t.alive) continue;
      const p = project(c, t.X, altOf(t), t.Z);
      if (!p) continue;
      if (p[2] > FOG_FAR * 1.5) continue;
      // Fighters and allies are stacked like the plane; ground things are single sprites for now.
      const air = t.h !== undefined;
      // Every object is stacked. Air things stack finely; ground things stack deeper.
      const img = air ? stackedSprite(t.kind, 4, 1) : stackedSprite(t.kind, 4, 2);
      things.push({ zc: p[2], img, X: t.X, base: altOf(t), Z: t.Z, facing: facingOf(t), flip: false });
    }
    things.sort((a, b) => b.zc - a.zc);
    return things;
  }

  // Draws one sprite standing at (X, base, Z), larger the closer it is.
  // The sprite is mirrored when the camera sees its front, so things change as you pass them.
  function billboard(ctx: CanvasRenderingContext2D, c: Cam, img: HTMLCanvasElement, X: number, Z: number, base: number, facing = 0): void {
    const p = project(c, X, base, Z);
    if (!p) return;
    const [sx, sy, zc] = p;
    const toCam = Math.atan2(c.px - X, c.pz - Z);
    const seesFront = Math.cos(toCam - facing) > 0;
    // Size by distance: true perspective, plus a boost when close (up to three times
    // larger inside 220 m), and a floor so anything far off still shows as a few pixels.
    const near = Math.max(0, Math.min(1, (NEAR_BOOST_M - zc) / NEAR_BOOST_M));
    let k = ((FOCAL * PX_PER_M) / zc) * (1 + 2 * near);
    k = Math.max(k, MIN_PX / img.height);
    k = Math.min(k, MAX_PX / img.height);
    const w = Math.max(1, Math.round(img.width * k));
    const h = Math.max(1, Math.round(img.height * k));
    if (seesFront) {
      ctx.save();
      ctx.translate(Math.round(sx), 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, Math.round(-w / 2), Math.round(sy - h), w, h);
      ctx.restore();
    } else {
      ctx.drawImage(img, Math.round(sx - w / 2), Math.round(sy - h), w, h);
    }
  }

  function shots(ctx: CanvasRenderingContext2D, c: Cam, list: Shot[], color: string, size: number): void {
    ctx.fillStyle = color;
    for (const s of list) {
      const p = project(c, s.X, s.h, s.Z);
      if (p) ctx.fillRect(Math.round(p[0]), Math.round(p[1]), size, size);
    }
  }

  function missiles(ctx: CanvasRenderingContext2D, g: Game, c: Cam): void {
    for (const m of g.missiles) {
      const p = project(c, m.X, m.h, m.Z);
      if (!p) continue;
      // A short trail behind the missile, then the head.
      const tail = project(c, m.X - m.vX * 0.05, m.h - m.vY * 0.05, m.Z - m.vZ * 0.05);
      if (tail) {
        ctx.strokeStyle = COL.shell;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(tail[0], tail[1]); ctx.lineTo(p[0], p[1]); ctx.stroke();
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.round(p[0]) - 1, Math.round(p[1]) - 1, 3, 3);
    }
  }

  function puffs(ctx: CanvasRenderingContext2D, g: Game, c: Cam): void {
    for (const p of g.puffs) {
      const k = Math.max(0, p.life / p.max);
      const q = project(c, p.X, p.h, p.Z);
      if (!q) continue;
      ctx.globalAlpha = Math.min(1, k * 1.4);
      ctx.fillStyle = p.color;
      const s = Math.max(1, Math.round((p.size * (0.5 + k) * FOCAL) / (q[2] * 0.6)));
      ctx.fillRect(Math.round(q[0]), Math.round(q[1]), s, s);
    }
    ctx.globalAlpha = 1;
  }

  function rings(ctx: CanvasRenderingContext2D, g: Game, c: Cam): void {
    // A ring stands across the heading (level right, then up), so the plane flies through it.
    const rhx = Math.cos(g.plane.yaw), rhz = -Math.sin(g.plane.yaw);
    for (const ring of g.mission.hoops) {
      const pts: [number, number][] = [];
      for (let a = 0; a < 24; a++) {
        const t = (a / 24) * Math.PI * 2;
        const p = project(c, ring.X + rhx * Math.cos(t) * ring.r, ring.h + Math.sin(t) * ring.r, ring.Z + rhz * Math.cos(t) * ring.r);
        if (p) pts.push([p[0], p[1]]);
      }
      if (pts.length < 24) continue;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1]);
      ctx.closePath();
      ctx.lineWidth = 4;
      ctx.strokeStyle = INK;
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.strokeStyle = ring.passed ? COL.hoopDone : COL.hoop;
      ctx.stroke();
    }
  }

  // Ring of the lock and the collapsing warning ring are drawn in screen space.
  function lockRing(ctx: CanvasRenderingContext2D, g: Game, c: Cam): void {
    const t = g.lock.target;
    if (!t || g.lock.progress <= 0) return;
    const q = project(c, t.X, altOf(t), t.Z);
    if (!q) return;
    const r = 26 - g.lock.progress * 14;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(q[0], q[1], r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = g.lock.progress >= 1 ? '#ff6b6b' : '#ffe08a';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(q[0], q[1], r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * g.lock.progress); ctx.stroke();
  }

  // The tag: a ring around the plane that collapses as the enemy missile closes in.
  function warnRing(ctx: CanvasRenderingContext2D, g: Game): void {
    if (!g.tagged) return;
    const flash = Math.floor(g.time * 8) % 2 === 0;
    const k = Math.max(0, Math.min(1, g.tagDist / 900));
    const r = 18 + k * 70;
    ctx.strokeStyle = flash ? '#ff3b3b' : INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(W / 2, H * PLANE_SCREEN_Y, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Enemy missiles: a red streak with a bright head.
  function enemyMissiles(ctx: CanvasRenderingContext2D, g: Game, c: Cam): void {
    for (const m of g.missiles) {
      if (!m.enemy) continue;
      const p = project(c, m.X, m.h, m.Z);
      if (!p) continue;
      const tail = project(c, m.X - m.vX * 0.08, m.h - m.vY * 0.08, m.Z - m.vZ * 0.08);
      if (tail) {
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(tail[0], tail[1]); ctx.lineTo(p[0], p[1]); ctx.stroke();
      }
      ctx.fillStyle = '#fffdfa';
      ctx.fillRect(Math.round(p[0]) - 2, Math.round(p[1]) - 2, 4, 4);
    }
  }

  function wisps(ctx: CanvasRenderingContext2D, g: Game, c: Cam): void {
    for (const w of g.wisps) {
      const q = project(c, w.X, w.h, w.Z);
      if (!q) continue;
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
  function plane(ctx: CanvasRenderingContext2D, g: Game, c: Cam): void {
    const p = g.plane;
    const shadow = project(c, p.X, groundAt(p.X, p.Z), p.Z);
    if (shadow) {
      const rx = Math.max(3, Math.min(14, 26 - p.h * 0.2));
      ctx.fillStyle = 'rgba(47,45,61,0.22)';
      ctx.beginPath();
      ctx.ellipse(shadow[0], shadow[1], rx, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    const blinkOff = g.phase === 'crashed' && Math.floor(g.blink * 8) % 2 === 0;
    const sx = W / 2, sy = H * PLANE_SCREEN_Y;
    const glider = g.settings.mode === 'glider';
    const tight = Math.min(1, Math.abs(p.bank) / AIR.bankMax);
    // The jet is drawn at its own detail, at one of four crisp sizes (25% to 33% of the width).
    // The paper glider is drawn at its own size.
    const plane2 = glider ? null : planeSprite(tight);
    const img = plane2 ? plane2.img : sprite('glider');
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
          ctx.moveTo(x0 - 2, y0); ctx.lineTo(x0 + 2, y0); ctx.lineTo(x0, y0 + len);
          ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#fff1b8';
          ctx.beginPath();
          ctx.moveTo(x0 - 1, y0); ctx.lineTo(x0 + 1, y0); ctx.lineTo(x0, y0 + len * 0.5);
          ctx.closePath(); ctx.fill();
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
    ctx.font = 'bold 9px system-ui, sans-serif';
    ctx.fillStyle = INK;
    ctx.fillText(label, ex + 4, ey + 3);
  }

  function forces(ctx: CanvasRenderingContext2D, g: Game): void {
    const p = g.plane;
    const x = W / 2, y = H * PLANE_SCREEN_Y - 10;
    const k = 1.6;
    arrow(ctx, x, y, 0, p.lift[1] * k, COL.lift, 'lift');
    arrow(ctx, x, y, 0, p.weight[1] * k, COL.weight, 'weight');
    arrow(ctx, x, y, 0, p.thrust[1] * k, COL.thrust, 'thrust');
    arrow(ctx, x, y, p.drag[0] * k, 0, COL.drag, 'drag');
  }

  // The cockpit: canopy struts and a dark instrument panel along the bottom.
  function cockpit(ctx: CanvasRenderingContext2D, g: Game): void {
    const panelTop = H * 0.84;
    ctx.fillStyle = '#3b3950';
    ctx.fillRect(0, panelTop, W, H - panelTop);
    ctx.fillStyle = '#5b5876';
    ctx.fillRect(0, panelTop, W, 2);
    const gx = W / 2, gy = panelTop + 14;
    ctx.strokeStyle = '#fffdfa';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(gx, gy, 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate(-g.plane.bank);
    ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(9, 0); ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = '#2f2d3d';
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(0, panelTop); ctx.lineTo(W * 0.22, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W, panelTop); ctx.lineTo(W * 0.78, 0); ctx.stroke();
  }

  export function render(ctx: CanvasRenderingContext2D, g: Game): void {
    ctx.imageSmoothingEnabled = false;
    const c = makeCam(g);
    sky(ctx);
    clouds(ctx, g, c);
    ground(ctx, g, c);
    road(ctx, g, c);
    if (g.settings.view !== 'cockpit' && g.mission.mode === 'glider') rings(ctx, g, c);
    for (const th of collect(g, c)) billboard(ctx, c, th.img, th.X, th.Z, th.base, th.facing);
    shots(ctx, c, g.shots, COL.bullet, 2);
    shots(ctx, c, g.shells, COL.shell, 2);
    missiles(ctx, g, c);
    enemyMissiles(ctx, g, c);
    wisps(ctx, g, c);
    puffs(ctx, g, c);
    lockRing(ctx, g, c);
    if (g.settings.view !== 'cockpit') plane(ctx, g, c);
    warnRing(ctx, g);
    if (g.settings.view === 'cockpit') cockpit(ctx, g);
    if (g.settings.forces) forces(ctx, g);
  }
}
