// Drawing the scene. Layers from back to front, each scrolling at its own speed
// (parallax) so the land looks deep even though the view is a side view.
namespace PA {
  function sy(h: number): number {
    return GROUND_Y - h * PPM_Y;
  }

  function sx(g: Game, x: number): number {
    return (x - g.camX) * PPM_X;
  }

  function sky(ctx: CanvasRenderingContext2D): void {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, COL.skyTop);
    grad.addColorStop(1, COL.skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = COL.sun;
    ctx.beginPath();
    ctx.arc(330, 36, 16, 0, Math.PI * 2);
    ctx.fill();
  }

  function clouds(ctx: CanvasRenderingContext2D, g: Game): void {
    ctx.fillStyle = COL.cloud;
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
  function ridge(ctx: CanvasRenderingContext2D, g: Game, speed: number, base: number, amp: number, color: string, freq: number): void {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let px = 0; px <= W; px += 2) {
      const wx = (px / PPM_X) + g.camX * speed;
      const y = base - amp * (0.6 + 0.4 * Math.sin(wx * freq)) * (0.7 + 0.3 * Math.sin(wx * freq * 2.7 + 1));
      ctx.lineTo(px, y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();
  }

  function ground(ctx: CanvasRenderingContext2D, g: Game): void {
    ctx.fillStyle = COL.ground;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let px = 0; px <= W; px += 2) {
      const x = g.camX + px / PPM_X;
      ctx.lineTo(px, sy(groundAt(x)));
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();

    // Stripes (fields) that scroll at full speed: the closest layer.
    ctx.fillStyle = COL.groundDark;
    for (let k = 0; k < 40; k++) {
      const x = ((k * 46 - g.camX * PPM_X) % 1840 + 1840) % 1840 - 40;
      const y = H - 22 + (k % 3) * 6;
      ctx.fillRect(Math.round(x), y, 22, 2);
    }
  }

  function targets(ctx: CanvasRenderingContext2D, g: Game): void {
    for (const t of g.mission.targets) {
      if (!t.alive) continue;
      const img = sprite(t.kind === 'flak' ? 'flak' : t.kind);
      const scale = t.far ? 0.5 : 1;
      const x = sx(g, t.x);
      if (x < -40 || x > W + 40) continue;
      // Far targets stand a little higher on the screen, as they would in depth.
      const base = sy(groundAt(t.x)) + 1 - (t.far ? 6 : 0);
      const w = img.width * scale, h = img.height * scale;
      ctx.drawImage(img, Math.round(x - w / 2), Math.round(base - h), w, h);
    }
  }

  function hoops(ctx: CanvasRenderingContext2D, g: Game): void {
    for (const hoop of g.mission.hoops) {
      const x = sx(g, hoop.x);
      if (x < -30 || x > W + 30) continue;
      const y = sy(hoop.h);
      ctx.lineWidth = 4;
      ctx.strokeStyle = INK;
      ctx.beginPath();
      ctx.ellipse(x, y, hoop.r * PPM_X + 1, hoop.r * PPM_Y + 1, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.strokeStyle = hoop.passed ? COL.hoopDone : COL.hoop;
      ctx.stroke();
    }
  }

  function shots(ctx: CanvasRenderingContext2D, g: Game): void {
    ctx.fillStyle = COL.bullet;
    for (const s of g.shots) {
      const x = sx(g, s.x), y = sy(s.h);
      ctx.fillRect(Math.round(x) - 2, Math.round(y), 4, 1);
    }
    ctx.fillStyle = COL.shell;
    for (const s of g.shells) {
      const x = sx(g, s.x), y = sy(s.h);
      ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
    }
  }

  function puffs(ctx: CanvasRenderingContext2D, g: Game): void {
    for (const p of g.puffs) {
      const k = Math.max(0, p.life / p.max);
      ctx.globalAlpha = Math.min(1, k * 1.4);
      ctx.fillStyle = p.color;
      const s = Math.max(1, Math.round(p.size * (0.5 + k)));
      ctx.fillRect(Math.round(sx(g, p.x)), Math.round(sy(p.h)), s, s);
    }
    ctx.globalAlpha = 1;
  }

  function plane(ctx: CanvasRenderingContext2D, g: Game): void {
    const p = g.plane;
    const img = sprite('plane');
    const px = sx(g, p.x), py = sy(p.h);

    // Shadow on the ground: smaller and softer the higher the plane flies.
    const gy = sy(groundAt(p.x));
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

  // Arrows for the four forces, drawn from the plane's centre. One unit of force is 1.6 px.
  function forces(ctx: CanvasRenderingContext2D, g: Game): void {
    const p = g.plane;
    const x = sx(g, p.x), y = sy(p.h);
    const k = 1.6;
    const f = (v: Vec) => [v[0] * k, v[1] * k] as Vec;
    const t = f(p.thrust), l = f(p.lift), d = f(p.drag), w = f(p.weight);
    arrow(ctx, x, y, t[0], t[1], COL.thrust, 'thrust');
    arrow(ctx, x, y, l[0], l[1], COL.lift, 'lift');
    arrow(ctx, x, y, d[0], d[1], COL.drag, 'drag');
    arrow(ctx, x, y, w[0], w[1], COL.weight, 'weight');
  }

  export function render(ctx: CanvasRenderingContext2D, g: Game): void {
    ctx.imageSmoothingEnabled = false;
    sky(ctx);
    clouds(ctx, g);
    ridge(ctx, g, 0.35, 120, 34, COL.hillFar, 0.05);
    ridge(ctx, g, 0.7, 150, 18, COL.hillMid, 0.09);
    ground(ctx, g);
    if (g.mission.mode === 'paper') hoops(ctx, g);
    targets(ctx, g);
    shots(ctx, g);
    plane(ctx, g);
    puffs(ctx, g);
    if (g.settings.forces) forces(ctx, g);
  }
}
