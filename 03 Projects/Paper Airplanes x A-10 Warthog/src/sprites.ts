// Sprites are painted in code. Each one is a short list of little rectangles
// (a "painter"). The builder draws the shapes once in ink, shifted one pixel in
// each direction, which makes the dark outline, then draws the colours on top.
// No image files are loaded anywhere in the game.
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

  export function buildSprite(paint: (g: Painter) => void): HTMLCanvasElement {
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

  const cache: { [name: string]: HTMLCanvasElement } = {};

  // Built the first time it is needed (so the file also loads without a page).
  export function sprite(name: 'plane' | 'tank' | 'truck' | 'flak'): HTMLCanvasElement {
    if (cache[name]) return cache[name];
    let s: HTMLCanvasElement;
    if (name === 'plane') {
      // A-10 Warthog, side view, facing right: twin tails, high wing, the
      // canopy up front, two engines under the back.
      s = buildSprite(g => {
        g.r(2, 1, 2, 5, '#c8cfd6').p(2, 0, '#c8cfd6')             // tail fin
         .r(4, 6, 22, 4, '#c8cfd6')                              // fuselage
         .r(6, 6, 16, 1, '#f5fbff')                              // top light
         .r(26, 7, 2, 2, '#c8cfd6').p(28, 7, '#6b7480')          // nose
         .r(6, 10, 18, 1, '#6b7480')                             // belly shade
         .r(19, 3, 5, 3, '#8fd3f0').r(20, 2, 3, 1, '#8fd3f0')    // canopy
         .r(11, 9, 8, 2, '#c8cfd6').r(12, 11, 6, 1, '#6b7480')   // wing
         .p(10, 9, '#6b7480').p(19, 9, '#6b7480')                // wing tips
         .r(7, 10, 4, 2, '#6b7480')                              // engine
         .p(5, 11, '#ffb02e').p(6, 11, '#ffb02e');               // exhaust glow
      });
    } else if (name === 'tank') {
      s = buildSprite(g => {
        g.r(0, 5, 15, 2, '#6b7480')                              // tracks
         .p(2, 6, '#f5fbff').p(6, 6, '#f5fbff').p(10, 6, '#f5fbff')
         .r(1, 3, 12, 3, '#a9b67e')                              // hull
         .r(4, 1, 6, 2, '#a9b67e')                               // turret
         .r(9, 1, 6, 1, '#6b7480');                              // gun
      });
    } else if (name === 'truck') {
      s = buildSprite(g => {
        g.r(0, 1, 9, 4, '#e6c48a')                               // cargo
         .r(9, 2, 5, 3, '#e6c48a')                               // cab
         .p(11, 3, '#8fd3f0')                                    // window
         .r(2, 5, 2, 2, '#6b7480').r(10, 5, 2, 2, '#6b7480');    // wheels
      });
    } else {
      s = buildSprite(g => {
        g.r(0, 5, 6, 3, '#e89a9a')                               // mount
         .r(1, 0, 1, 6, '#6b7480').r(3, 0, 1, 6, '#6b7480');     // twin barrels
      });
    }
    cache[name] = s;
    return s;
  }
}
