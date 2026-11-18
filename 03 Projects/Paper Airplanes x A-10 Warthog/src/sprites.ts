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
  export function sprite(name: 'plane' | 'glider' | 'tank' | 'truck' | 'flak'): HTMLCanvasElement {
    if (cache[name]) return cache[name];
    let s: HTMLCanvasElement;
    if (name === 'plane') {
      // A-10 Warthog seen from behind: wide wing, twin tails, the cockpit up top, two engines.
      s = buildSprite(g => {
        g.r(0, 7, 22, 2, '#c8cfd6')                              // wing
         .r(0, 8, 3, 1, '#6b7480').r(19, 8, 3, 1, '#6b7480')     // wing tips
         .r(9, 2, 4, 9, '#c8cfd6')                               // fuselage
         .r(9, 2, 1, 9, '#f5fbff')                               // light side
         .r(10, 1, 2, 2, '#8fd3f0')                              // canopy
         .r(5, 1, 2, 7, '#c8cfd6').r(15, 1, 2, 7, '#c8cfd6')     // twin tails
         .r(5, 0, 2, 1, '#6b7480').r(15, 0, 2, 1, '#6b7480')
         .r(7, 9, 2, 3, '#6b7480').r(13, 9, 2, 3, '#6b7480')     // engines
         .r(7, 12, 2, 1, '#ffb02e').r(13, 12, 2, 1, '#ffb02e');  // exhaust glow
      });
    } else if (name === 'glider') {
      // Classic paper dart seen from behind: a flat sheet with a folded nose.
      s = buildSprite(g => {
        g.r(0, 6, 20, 2, '#fffdfa')                              // wings
         .r(0, 6, 20, 1, '#f5fbff')
         .r(9, 2, 2, 9, '#fffdfa')                               // fold line
         .p(10, 1, '#fffdfa')
         .r(0, 8, 20, 1, '#d6d0f0');                             // shaded underside
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
