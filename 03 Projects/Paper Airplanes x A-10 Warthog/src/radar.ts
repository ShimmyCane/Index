// The radar: a circle centred on the plane, turned to the heading. Each dot is a
// thing in the world, coloured by what it is. Range rings at 400, 800 and 1200 m.
namespace PA {
  const RANGE = 1200;

  const DOT: { [group: string]: string } = {
    army: '#ff6b6b',
    farm: '#b9dea6',
    town: '#8fd3f0',
    airfield: '#b48cf0',
    port: '#3d8bff',
    rail: '#8a6a4a',
    air: '#8fe0bd',
  };

  export function radar(ctx: CanvasRenderingContext2D, g: Game, size: number): void {
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
    const place = (X: number, Z: number): [number, number] | null => {
      const dx = X - p.X, dz = Z - p.Z;
      const f = dx * sinY + dz * cosY;   // ahead
      const r = dx * cosY - dz * sinY;   // to the right
      if (Math.hypot(f, r) > RANGE) return null;
      return [c + (r / RANGE) * R, c - (f / RANGE) * R];
    };

    for (const t of g.mission.targets) {
      if (!t.alive) continue;
      const q = place(t.X, t.Z);
      if (!q) continue;
      const info = KINDS[t.kind];
      const gunner = info && info.gun;
      ctx.fillStyle = t.faction === 'enemy' ? '#ff6b6b' : gunner ? '#ffb02e' : DOT[info ? info.group : 'army'];
      ctx.fillRect(Math.round(q[0]) - 2, Math.round(q[1]) - 2, 4, 4);
    }
    for (const h of g.mission.hoops) {
      if (h.passed) continue;
      const q = place(h.X, h.Z);
      if (q) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(Math.round(q[0]) - 1, Math.round(q[1]) - 1, 3, 3);
      }
    }

    // The plane: a point at the centre, pointing up (the heading).
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.moveTo(c, c - 7);
    ctx.lineTo(c - 5, c + 5);
    ctx.lineTo(c + 5, c + 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(c, c, R, 0, Math.PI * 2);
    ctx.stroke();
  }
}
