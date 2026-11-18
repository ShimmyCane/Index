// The A-10 Warthog, drawn at its own detail: seen from behind, on a 66-unit grid.
// The drawing is painted at several crisp sizes (not stretched), and each size is
// stacked: thin slices one above another, the lower ones shaded darker, so the body reads solid.
namespace PA {
  const DESIGN_W = 66;
  const DESIGN_H = 40;
  const LAYERS = 4;           // slices in the stack
  const LIGHT = 2;            // how far each slice steps down (design units, before scaling)

  // Shade a hex colour toward dark (f = 1 is unchanged).
  const shade = shadeHex;

  // The drawing itself, in design units: x across (0 … 66), y down (0 … 40).
  // The A-10 from behind: a broad body, a thick high wing, two fins set wide apart, and
  // the two engines under the wing, each with its exhaust.
  function design(g: Painter, dy: number, f: number): void {
    const c = (hex: string) => shade(hex, f);
    const body = c('#c8cfd6'), light = c('#eef3f6'), mid = c('#9aa4ae'), dark = c('#4d5560');
    const glass = c('#9fdcf5'), hot = c('#ffb02e'), tail = c('#b8c1ca');
    const R = (x: number, y: number, w: number, h: number, col: string) => g.r(x, y + dy, w, h, col);
    // Fins: two tall, leaning out, with dark tips.
    R(14, 7, 5, 13, tail);     R(13, 4, 4, 4, dark);     R(15, 6, 2, 1, light);
    R(47, 7, 5, 13, tail);     R(49, 4, 4, 4, dark);     R(49, 6, 2, 1, light);
    // Wing: a thick, straight, high wing with dark tips.
    R(3, 18, 60, 6, body);     R(3, 18, 60, 1, light);
    R(3, 22, 60, 2, mid);      R(2, 19, 2, 5, dark);     R(62, 19, 2, 5, dark);
    // Fuselage: a broad body, lit on the left, shaded on the right, with a dark belly.
    R(26, 6, 14, 24, body);    R(26, 6, 4, 24, light);   R(37, 6, 3, 24, mid);
    R(27, 28, 12, 2, dark);
    // Cockpit canopy.
    R(28, 8, 10, 5, glass);    R(29, 9, 3, 2, light);
    // Camouflage: a few darker patches on the body and the wing.
    R(31, 15, 3, 2, mid);      R(34, 19, 2, 1, mid);     R(8, 20, 4, 1, mid);   R(55, 20, 4, 1, mid);
    // Engine nacelles, each with a dark intake and a glowing exhaust.
    R(20, 24, 7, 11, dark);    R(39, 24, 7, 11, dark);
    R(21, 25, 5, 3, mid);      R(40, 25, 5, 3, mid);
    R(22, 33, 5, 2, hot);      R(41, 33, 5, 2, hot);
    // The nose underneath, a dark line.
    R(29, 30, 8, 1, mid);
  }

  // The design at a whole-size scale k, stacked. Each layer is the same drawing; lower
  // layers sit a little lower and are shaded darker.
  function stackedAt(k: number): Paint {
    return (g: Painter) => {
      for (let layer = 0; layer < LAYERS; layer++) {
        const top = layer === LAYERS - 1;
        const sub = new Painter();
        const f = top ? 1 : 0.42 + 0.5 * (layer / (LAYERS - 1));
        design(sub, (LAYERS - 1 - layer) * LIGHT, f);
        for (const o of sub.ops) {
          const x0 = Math.round(o.x * k), y0 = Math.round(o.y * k);
          const x1 = Math.round((o.x + o.w) * k), y1 = Math.round((o.y + o.h) * k);
          g.r(x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0), o.c);
        }
      }
    };
  }

  // The four whole-step sizes: about 25% of the screen width (about 100 px) up to 33% (about 132 px).
  export const PLANE_SCALES = [1.6, 1.78, 1.94, 2.1];
  const planeCache: HTMLCanvasElement[] = [];

  // The plane sprite for a turn tightness of 0 (straight) to 1 (hardest turn).
  export function planeSprite(tight: number): { img: HTMLCanvasElement; k: number } {
    const i = Math.max(0, Math.min(PLANE_SCALES.length - 1, Math.round(tight * (PLANE_SCALES.length - 1))));
    if (!planeCache[i]) planeCache[i] = buildSprite(stackedAt(PLANE_SCALES[i]));
    return { img: planeCache[i], k: PLANE_SCALES[i] };
  }
}
