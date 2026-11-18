// Drawing the chase view. The camera sits behind and above the plane and turns
// with its heading and bank. The ground is a checkerboard in world space, so it
// stays put while the plane turns. Everything else is a sprite placed by perspective.
namespace PA {
  const FOCAL = 200;          // pixels: how big a metre looks at distance one
  const CAM_BACK = 26;        // metres behind the plane
  const CAM_UP = 8;           // metres above the plane
  const TILT = 0.2;           // radians the camera looks down
  const CELL = 40;            // metres per ground square
  const RANGE = 16;           // squares drawn each way from the camera
  const FOG_FAR = 900;        // metres where the ground fades into the sky
  const PLANE_SCREEN_Y = 0.72;
  const PX_PER_M = 0.3;       // sprite pixel size in metres (ground targets)
  const PLANE_SCALE = 2;      // the plane sprite is drawn at a whole-number scale

  interface Cam {
    px: number; py: number; pz: number;           // camera position
    rx: number; ry: number; rz: number;           // right
    ux: number; uy: number; uz: number;           // up
    fx: number; fy: number; fz: number;           // forward
  }

  function makeCam(g: Game): Cam {
    const p = g.plane;
    const sinY = Math.sin(p.yaw), cosY = Math.cos(p.yaw);
    // Horizontal forward and right of the heading.
    const hx = sinY, hz = cosY;
    const rhx = cosY, rhz = -sinY;
    const px = p.X - hx * CAM_BACK;
    const py = p.h + CAM_UP;
    const pz = p.Z - hz * CAM_BACK;
    // Tilt the view down, then roll it with the bank.
    const ct = Math.cos(TILT), st = Math.sin(TILT);
    const fx = hx * ct, fy = -st, fz = hz * ct;
    const u0x = hx * st, u0y = ct, u0z = hz * st;
    const cb = Math.cos(p.bank), sb = Math.sin(p.bank);
    const rx = rhx * cb + u0x * sb, ry = u0y * sb, rz = rhz * cb + u0z * sb;
    const ux = u0x * cb - rhx * sb, uy = u0y * cb, uz = u0z * cb - rhz * sb;
    return { px, py, pz, rx, ry, rz, ux, uy, uz, fx, fy, fz };
  }

  // World point → screen point, or null if it is behind the camera.
  // With clampDepth, points just behind the camera are pulled to the near plane,
  // so the ground right under the camera still reaches the bottom of the screen.
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

  // Ground: squares of the world, far ones first, each faded toward the sky.
  function ground(ctx: CanvasRenderingContext2D, g: Game, c: Cam): void {
    const ci = Math.round(c.px / CELL), cj = Math.round(c.pz / CELL);
    type Cell = { pts: [number, number][]; depth: number; color: string };
    const cells: Cell[] = [];
    for (let i = ci - RANGE; i < ci + RANGE; i++) {
      for (let j = cj - RANGE; j < cj + RANGE; j++) {
        const corners: [number, number, number][] = [];
        let ok = true;
        for (const [a, b] of [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]] as [number, number][]) {
          const p = project(c, a * CELL, groundAt(a * CELL, b * CELL), b * CELL, true);
          if (!p) { ok = false; break; }
          corners.push(p);
        }
        if (!ok) continue;
        const depth = (corners[0][2] + corners[2][2]) / 2;
        const base = ((i + j) & 1) === 0 ? COL.ground : COL.groundDark;
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

  // A sprite standing on the ground at (X, Z), drawn larger the closer it is.
  function billboard(ctx: CanvasRenderingContext2D, c: Cam, img: HTMLCanvasElement, X: number, Z: number, base: number): void {
    const p = project(c, X, base, Z);
    if (!p) return;
    const [sx, sy, zc] = p;
    const k = (FOCAL * PX_PER_M) / zc;
    const w = Math.max(1, Math.round(img.width * k));
    const h = Math.max(1, Math.round(img.height * k));
    ctx.drawImage(img, Math.round(sx - w / 2), Math.round(sy - h), w, h);
  }

  function targets(ctx: CanvasRenderingContext2D, g: Game, c: Cam): void {
    const list = g.mission.targets
      .filter(t => t.alive)
      .map(t => ({ t, zc: (t.X - c.px) * c.fx + (groundAt(t.X, t.Z) - c.py) * c.fy + (t.Z - c.pz) * c.fz }))
      .filter(o => o.zc > 1 && o.zc < FOG_FAR * 1.5)
      .sort((a, b) => b.zc - a.zc);
    for (const { t } of list) {
      billboard(ctx, c, sprite(t.kind), t.X, t.Z, groundAt(t.X, t.Z));
    }
  }

  function rings(ctx: CanvasRenderingContext2D, g: Game, c: Cam): void {
    // A ring stands across the heading (level right, then up), so the plane flies through it.
    const rhx = Math.cos(g.plane.yaw), rhz = -Math.sin(g.plane.yaw);
    for (const ring of g.mission.hoops) {
      const pts: [number, number][] = [];
      for (let a = 0; a < 24; a++) {
        const t = (a / 24) * Math.PI * 2;
        const p = project(
          c,
          ring.X + rhx * Math.cos(t) * ring.r,
          ring.h + Math.sin(t) * ring.r,
          ring.Z + rhz * Math.cos(t) * ring.r,
        );
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

  function shots(ctx: CanvasRenderingContext2D, c: Cam, list: Shot[], color: string, size: number): void {
    ctx.fillStyle = color;
    for (const s of list) {
      const p = project(c, s.X, s.h, s.Z);
      if (p) ctx.fillRect(Math.round(p[0]), Math.round(p[1]), size, size);
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

  // The plane is always in the same place on the screen; the world moves past it.
  function plane(ctx: CanvasRenderingContext2D, g: Game, c: Cam): void {
    const p = g.plane;
    const img = sprite(g.settings.mode === 'glider' ? 'glider' : 'plane');
    const shadow = project(c, p.X, groundAt(p.X, p.Z), p.Z);
    if (shadow) {
      const rx = Math.max(3, Math.min(14, 26 - p.h * 0.2));
      ctx.fillStyle = 'rgba(47,45,61,0.22)';
      ctx.beginPath();
      ctx.ellipse(shadow[0], shadow[1], rx, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    const sx = W / 2, sy = H * PLANE_SCREEN_Y;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(p.bank);
    ctx.drawImage(img, -Math.round((img.width * PLANE_SCALE) / 2), -Math.round((img.height * PLANE_SCALE) / 2),
      img.width * PLANE_SCALE, img.height * PLANE_SCALE);
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
    // Forces in the vertical plane; the screen shows them as up and down, sideways is the nose.
    arrow(ctx, x, y, 0, p.lift[1] * k, COL.lift, 'lift');
    arrow(ctx, x, y, 0, p.weight[1] * k, COL.weight, 'weight');
    arrow(ctx, x, y, 0, p.thrust[1] * k, COL.thrust, 'thrust');
    arrow(ctx, x, y, p.drag[0] * k, 0, COL.drag, 'drag');
  }

  export function render(ctx: CanvasRenderingContext2D, g: Game): void {
    ctx.imageSmoothingEnabled = false;
    const c = makeCam(g);
    sky(ctx);
    ground(ctx, g, c);
    if (g.mission.mode === 'glider') rings(ctx, g, c);
    targets(ctx, g, c);
    shots(ctx, c, g.shots, COL.bullet, 2);
    shots(ctx, c, g.shells, COL.shell, 2);
    puffs(ctx, g, c);
    plane(ctx, g, c);
    if (g.settings.forces) forces(ctx, g);
  }
}
