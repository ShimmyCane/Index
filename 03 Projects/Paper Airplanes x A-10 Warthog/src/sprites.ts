// Sprites are painted in code. Each one is a short list of little rectangles
// (a "painter"). The builder draws the shapes once in ink, shifted one pixel in
// each direction, which makes the dark outline, then draws the colours on top.
// The painters live in src/assets/ (one file per family of things). No image
// files are loaded anywhere in the game.
namespace PA {
  interface Op { x: number; y: number; w: number; h: number; c: string; }

  export class Painter {
    ops: Op[] = [];
    // A rectangle of one colour. Later rectangles cover earlier ones.
    r(x: number, y: number, w: number, h: number, c: string): this {
      this.ops.push({ x, y, w, h, c });
      return this;
    }
    // One pixel.
    p(x: number, y: number, c: string): this {
      return this.r(x, y, 1, 1, c);
    }
  }

  export type Paint = (g: Painter) => void;

  // Every sprite by name. The asset files add their painters here.
  export const PAINT: { [name: string]: Paint } = {};

  export function buildSprite(paint: Paint): HTMLCanvasElement {
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
    if (!ctx) throw new Error('2D canvas is not available');
    const ox = 1 - minX, oy = 1 - minY;

    ctx.fillStyle = INK;
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

  // Shade a hex colour toward dark (f = 1 is unchanged).
  export function shadeHex(hex: string, f: number): string {
    const n = parseInt(hex.slice(1), 16);
    const ch = (v: number) => Math.round(v * f);
    const r = ch((n >> 16) & 255), g = ch((n >> 8) & 255), b = ch(n & 255);
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }

  const stackCache: { [name: string]: HTMLCanvasElement } = {};

  // The same sprite built as a stack: four slices, each one pixel lower than the one above,
  // the lower slices darker. The top slice is the full colour, so the edge of the stack shows.
  export function stackedSprite(name: string, layers = 4, step = 1): HTMLCanvasElement {
    const key = name + ':' + layers + ':' + step;
    if (stackCache[key]) return stackCache[key];
    const paint = PAINT[name];
    if (!paint) throw new Error('no sprite named ' + name);
    const base = new Painter();
    paint(base);
    const stacked: Paint = g => {
      for (let l = 0; l < layers; l++) {
        const top = l === layers - 1;
        const f = top ? 1 : 0.45 + 0.45 * (l / (layers - 1));
        const dy = (layers - 1 - l) * step;
        for (const o of base.ops) g.r(o.x, o.y + dy, o.w, o.h, shadeHex(o.c, f));
      }
    };
    const s = buildSprite(stacked);
    stackCache[key] = s;
    return s;
  }

  const cache: { [name: string]: HTMLCanvasElement } = {};

  // Built the first time it is needed (so the file also loads without a page).
  export function sprite(name: string): HTMLCanvasElement {
    if (cache[name]) return cache[name];
    const paint = PAINT[name];
    if (!paint) throw new Error('no sprite named ' + name);
    const s = buildSprite(paint);
    cache[name] = s;
    return s;
  }
}
