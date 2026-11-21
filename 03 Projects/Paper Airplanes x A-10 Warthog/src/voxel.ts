// Voxel models and sprite stacking.
//
// Each object is a small 3-D grid of coloured cubes (voxels): x across (left to right),
// y along (the nose or front at y = 0, the back at the far end), z up from the ground.
// The model is baked once into horizontal slices, one image per layer of voxels. To draw
// it, the slices are stacked from the bottom up, each turned to the camera and squashed
// by the viewing angle. The stack reads as a solid 3-D object from any direction, and it
// changes as you fly round it. This is "sprite stacking".
namespace PA {
  export class Voxels {
    readonly data: Uint32Array;

    // w, l, h: size in voxels. size: metres per voxel.
    constructor(public readonly w: number, public readonly l: number, public readonly h: number, public readonly size: number) {
      this.data = new Uint32Array(w * l * h);
    }

    private at(x: number, y: number, z: number): number {
      return (z * this.l + y) * this.w + x;
    }

    inside(x: number, y: number, z: number): boolean {
      return x >= 0 && y >= 0 && z >= 0 && x < this.w && y < this.l && z < this.h;
    }

    set(x: number, y: number, z: number, rgb: number): void {
      x = Math.floor(x); y = Math.floor(y); z = Math.floor(z);
      if (this.inside(x, y, z)) this.data[this.at(x, y, z)] = (rgb & 0xffffff) | 0x1000000;
    }

    clear(x: number, y: number, z: number): void {
      x = Math.floor(x); y = Math.floor(y); z = Math.floor(z);
      if (this.inside(x, y, z)) this.data[this.at(x, y, z)] = 0;
    }

    get(x: number, y: number, z: number): number {
      if (!this.inside(x, y, z)) return 0;
      return this.data[this.at(x, y, z)];
    }

    // A solid box, from (x0, y0, z0) up to but not including (x1, y1, z1).
    box(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, rgb: number): this {
      for (let z = Math.floor(z0); z < z1; z++)
        for (let y = Math.floor(y0); y < y1; y++)
          for (let x = Math.floor(x0); x < x1; x++) this.set(x, y, z, rgb);
      return this;
    }

    // Remove a box of voxels (to shape a slope, a notch or a gap).
    cut(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): this {
      for (let z = Math.floor(z0); z < z1; z++)
        for (let y = Math.floor(y0); y < y1; y++)
          for (let x = Math.floor(x0); x < x1; x++) this.clear(x, y, z);
      return this;
    }

    // An ellipsoid centred at (cx, cy, cz) with radii rx, ry, rz (in voxels).
    ellipsoid(cx: number, cy: number, cz: number, rx: number, ry: number, rz: number, rgb: number): this {
      for (let z = Math.floor(cz - rz); z <= cz + rz; z++)
        for (let y = Math.floor(cy - ry); y <= cy + ry; y++)
          for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
            const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, dz = (z + 0.5 - cz) / rz;
            if (dx * dx + dy * dy + dz * dz <= 1) this.set(x, y, z, rgb);
          }
      return this;
    }

    // A tube running along y (front to back), with an elliptical cross-section.
    tubeY(cx: number, cz: number, y0: number, y1: number, rx: number, rz: number, rgb: number): this {
      for (let y = Math.floor(y0); y < y1; y++)
        for (let z = Math.floor(cz - rz); z <= cz + rz; z++)
          for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
            const dx = (x + 0.5 - cx) / rx, dz = (z + 0.5 - cz) / rz;
            if (dx * dx + dz * dz <= 1) this.set(x, y, z, rgb);
          }
      return this;
    }

    // A tube running along x (side to side).
    tubeX(cy: number, cz: number, x0: number, x1: number, ry: number, rz: number, rgb: number): this {
      for (let x = Math.floor(x0); x < x1; x++)
        for (let z = Math.floor(cz - rz); z <= cz + rz; z++)
          for (let y = Math.floor(cy - ry); y <= cy + ry; y++) {
            const dy = (y + 0.5 - cy) / ry, dz = (z + 0.5 - cz) / rz;
            if (dy * dy + dz * dz <= 1) this.set(x, y, z, rgb);
          }
      return this;
    }

    // A round column or cone standing on the ground, radius r0 at the bottom and r1 at the top.
    cone(cx: number, cy: number, z0: number, z1: number, r0: number, r1: number, rgb: number): this {
      for (let z = Math.floor(z0); z < z1; z++) {
        const t = (z - z0) / Math.max(1, z1 - z0 - 1);
        const r = r0 + (r1 - r0) * t;
        for (let y = Math.floor(cy - r); y <= cy + r; y++)
          for (let x = Math.floor(cx - r); x <= cx + r; x++) {
            const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
            if (dx * dx + dy * dy <= r * r) this.set(x, y, z, rgb);
          }
      }
      return this;
    }

    // A pitched roof over the rectangle x0..x1, y0..y1, starting at height z0.
    // The ridge runs along x when alongX, otherwise along y.
    roof(x0: number, y0: number, x1: number, y1: number, z0: number, alongX: boolean, rgb: number, ridge?: number): this {
      const span = alongX ? y1 - y0 : x1 - x0;
      const layers = Math.ceil(span / 2);
      for (let k = 0; k < layers; k++) {
        const z = z0 + k;
        const col = k === layers - 1 && ridge !== undefined ? ridge : rgb;
        if (alongX) this.box(x0, y0 + k, z, x1, y1 - k, z + 1, col);
        else this.box(x0 + k, y0, z, x1 - k, y1, z + 1, col);
      }
      return this;
    }

    // Change the colour of every voxel by a rule (for patterns: windows, camouflage, stripes).
    paint(rule: (x: number, y: number, z: number, rgb: number) => number | null): this {
      for (let z = 0; z < this.h; z++)
        for (let y = 0; y < this.l; y++)
          for (let x = 0; x < this.w; x++) {
            const v = this.data[this.at(x, y, z)];
            if (!v) continue;
            const next = rule(x, y, z, v & 0xffffff);
            if (next === null) this.data[this.at(x, y, z)] = 0;
            else this.data[this.at(x, y, z)] = (next & 0xffffff) | 0x1000000;
          }
      return this;
    }
  }

  // A baked model: one image per layer, ready to stack.
  export interface Model {
    w: number;
    l: number;
    h: number;
    size: number;              // metres per voxel
    slices: (HTMLCanvasElement | null)[];
    top: number;               // the highest layer with anything in it
    avg: string;               // the average colour, for tiny far-away dots
  }

  function shadeRGB(rgb: number, f: number): [number, number, number] {
    const r = Math.min(255, ((rgb >> 16) & 255) * f);
    const g = Math.min(255, ((rgb >> 8) & 255) * f);
    const b = Math.min(255, (rgb & 255) * f);
    return [r, g, b];
  }

  // Bake the voxels into slices. Light is baked in: top faces bright, sides darker, the
  // lower layers a little darker again (shade under the body), a soft lit side on the left,
  // and a tiny variation per voxel so surfaces are not flat.
  export function bake(v: Voxels): Model {
    const slices: (HTMLCanvasElement | null)[] = [];
    let top = 0, sr = 0, sg = 0, sb = 0, n = 0;
    for (let z = 0; z < v.h; z++) {
      let any = false;
      const img = new ImageData(v.w, v.l);
      for (let y = 0; y < v.l; y++) {
        for (let x = 0; x < v.w; x++) {
          const c = v.get(x, y, z);
          if (!c) continue;
          any = true;
          const rgb = c & 0xffffff;
          const exposedTop = !v.get(x, y, z + 1);
          let f = exposedTop ? 1.1 : 0.8;
          f *= 0.82 + 0.18 * (z / Math.max(1, v.h - 1));
          if (!v.get(x - 1, y, z)) f *= 1.05;
          if (!v.get(x + 1, y, z)) f *= 0.93;
          if (!v.get(x, y - 1, z)) f *= 1.02;
          if (!v.get(x, y + 1, z)) f *= 0.95;
          f *= 0.97 + 0.06 * hash2(x * 7 + z * 131, y * 13 + z * 17);
          const [r, g, b] = shadeRGB(rgb, f);
          const o = (y * v.w + x) * 4;
          img.data[o] = r; img.data[o + 1] = g; img.data[o + 2] = b; img.data[o + 3] = 255;
          if (exposedTop) { sr += r; sg += g; sb += b; n++; }
        }
      }
      if (!any) { slices.push(null); continue; }
      top = z;
      const cv = document.createElement('canvas');
      cv.width = v.w;
      cv.height = v.l;
      const cx = cv.getContext('2d');
      if (cx) cx.putImageData(img, 0, 0);
      slices.push(cv);
    }
    const avg = n ? 'rgb(' + Math.round(sr / n) + ',' + Math.round(sg / n) + ',' + Math.round(sb / n) + ')' : '#888';
    return { w: v.w, l: v.l, h: v.h, size: v.size, slices, top, avg };
  }

  // How a stack is placed on the screen.
  //   sx, sy: the screen point under the middle of the model, on the ground
  //   px: screen pixels per voxel
  //   yaw: which way the model faces, measured from straight ahead (away from the camera),
  //        positive turned to the right
  //   elev: the angle the camera looks down at it (0 = side on, PI/2 = straight down)
  //   roll: the screen rotation of "up" (the camera's bank)
  export interface Pose {
    sx: number;
    sy: number;
    px: number;
    yaw: number;
    elev: number;
    roll: number;
  }

  // The 2-D part of the placement, shared by the drawing and by modelToScreen.
  function frame(m: Model, p: Pose) {
    const sinE = Math.max(0.14, Math.sin(p.elev));
    const cosE = Math.cos(Math.min(Math.PI / 2, Math.max(0, p.elev)));
    const cr = Math.cos(p.roll), sr = Math.sin(p.roll);
    const cy = Math.cos(p.yaw), sy = Math.sin(p.yaw);
    // Linear map: rotate by yaw, squash by the viewing angle, roll, scale.
    const a = (cr * cy - sr * sinE * sy) * p.px;
    const b = (sr * cy + cr * sinE * sy) * p.px;
    const c = (-cr * sy - sr * sinE * cy) * p.px;
    const d = (-sr * sy + cr * sinE * cy) * p.px;
    const step = p.px * cosE;   // screen pixels from one layer to the next
    return { a, b, c, d, cr, sr, step };
  }

  // Where a point of the model (in voxels) lands on the screen.
  export function modelToScreen(m: Model, p: Pose, mx: number, my: number, mz: number): [number, number] {
    const f = frame(m, p);
    const lx = mx - m.w / 2, ly = my - m.l / 2;
    const off = mz * f.step;
    return [p.sx + f.a * lx + f.c * ly + f.sr * off, p.sy + f.b * lx + f.d * ly - f.cr * off];
  }

  // Draw the stack. Far away it becomes a few layers, then a single dot.
  export function drawModel(ctx: CanvasRenderingContext2D, m: Model, p: Pose): void {
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
    for (let z = 0; z <= m.top; z += skip) {
      const slice = m.slices[z];
      if (!slice) continue;
      for (let s = 0; s < sub; s++) {
        const off = (z + s / sub) * f.step;
        ctx.setTransform(f.a, f.b, f.c, f.d, p.sx + ex + f.sr * off, p.sy + ey - f.cr * off);
        ctx.drawImage(slice, 0, 0);
      }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}
