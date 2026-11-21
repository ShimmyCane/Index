// The 3-D models, each built from voxels in code (no image files). Every model faces its
// front toward y = 0. Colours are a warm, modern palette; light is baked in by bake().
namespace PA {
  type Build = () => Voxels;

  // Pick one of a few colours by a repeatable hash, for natural variation.
  function pick(list: number[], x: number, y: number, z: number): number {
    return list[Math.floor(hash2(x * 31 + z * 7, y * 17 + z * 3) * list.length) % list.length];
  }

  const A10_GREY = 0xa6b0b8, A10_DARK = 0x7d878f, A10_CAMO = 0x8e9a8c, GLASS = 0x7fd0f5, EXHAUST = 0xffb347;

  // The A-10 Warthog: a straight high wing, twin tails, two engines high on the back, and
  // the long nose with its gun. 18 m across.
  function a10(): Voxels {
    const v = new Voxels(36, 34, 12, 0.5);
    // Fuselage: thick in the middle, tapering to the nose and the tail.
    for (let y = 1; y < 32; y++) {
      let r = 2.4;
      if (y < 6) r = 1.1 + (y - 1) * 0.28;
      if (y > 25) r = 2.4 - (y - 25) * 0.24;
      v.tubeY(18, 3.6, y, y + 1, r, r * 0.9, A10_GREY);
    }
    v.box(17, 0, 3, 19, 1, 4, 0x3a3f44);                        // the gun at the nose
    v.ellipsoid(18, 8.5, 5.6, 1.6, 2.8, 1.4, GLASS);             // canopy
    v.set(18, 7, 6, 0xd4f3ff);                                   // a glint on the glass
    // Wing, with darker tips and stores hanging under it.
    v.box(1, 12, 3, 35, 17, 4, A10_GREY);
    for (const x of [1, 2, 33, 34]) v.cut(x, 16, 3, x + 1, 17, 4);
    v.box(1, 12, 3, 2, 16, 4, 0x929ca4).box(34, 12, 3, 35, 16, 4, 0x929ca4);
    for (const x of [9, 27]) v.box(x, 13, 2, x + 1, 16, 3, 0x7b848b);
    // Engines high on the back, each with a dark intake and a hot exhaust.
    for (const cx of [13.5, 22.5]) {
      v.tubeY(cx, 6.8, 18, 26, 1.8, 1.7, 0x8d969e);
      v.tubeY(cx, 6.8, 18, 19, 1.2, 1.1, 0x40464c);
      v.tubeY(cx, 6.8, 25, 26, 1.2, 1.1, EXHAUST);
    }
    v.box(14, 20, 4, 23, 24, 6, 0x8d969e);                       // engine pylons
    // Tailplane and the two fins.
    v.box(8, 27, 4, 28, 30, 5, A10_GREY);
    for (const x0 of [8, 26]) {
      v.box(x0, 25, 4, x0 + 2, 31, 11, A10_GREY);
      v.box(x0, 25, 10, x0 + 2, 31, 11, A10_DARK);
    }
    // Two-tone camouflage on the top surfaces, and a roundel on each wing.
    v.paint((x, y, z, c) => (c === A10_GREY && noise2(x / 4, y / 4 + z) > 0.62) ? A10_CAMO : c);
    for (const cx of [7, 29]) {
      v.ellipsoid(cx, 14.5, 3.5, 1.6, 1.6, 0.6, 0x3d6db5);
      v.set(cx, 14, 3, 0xf4f4f4);
    }
    return v;
  }

  // The classic paper dart: a pointed sheet folded down the middle, the wings tilted up a little.
  function glider(): Voxels {
    const v = new Voxels(27, 30, 6, 0.45);
    for (let y = 0; y < 30; y++) {
      const half = Math.min(12.5, (y / 29) * 13);
      for (let d = 0; d <= half; d++) {
        const z = 2 + Math.floor(d * 0.2);
        const edge = d > half - 1.2;
        const fold = Math.abs(d - half * 0.5) < 0.6;
        const col = edge && y > 20 ? 0xf07c6a : fold ? 0xe6e0d2 : 0xfbf8f0;
        v.set(13 + d, y, z, col);
        v.set(13 - d, y, z, col);
      }
      if (y > 5) v.box(13, y, 0, 14, y + 1, 2, 0xefe9dc);      // the folded keel underneath
    }
    return v;
  }

  // A fighter jet: delta wings, two canted fins, and a glowing exhaust.
  function fighter(body: number, dark: number, glass: number): Voxels {
    const v = new Voxels(22, 26, 8, 0.5);
    for (let y = 1; y < 25; y++) {
      const r = y < 6 ? 0.6 + (y - 1) * 0.22 : 1.7;
      v.tubeY(11, 3, y, y + 1, r, r, body);
    }
    for (let y = 10; y < 23; y++) {
      const half = (y - 10) * 0.75;
      v.box(11 - half, y, 3, 11 + half + 1, y + 1, 4, body);
    }
    for (const x of [8, 13]) v.box(x, 19, 4, x + 1, 25, 8, dark);
    v.ellipsoid(11, 7, 4.4, 1.1, 2.2, 1, glass);
    v.tubeY(11, 3, 24, 25, 1, 1, EXHAUST);
    return v;
  }

  // Main battle tank: tracks, a sloped hull, a round turret and a long gun.
  function tankMbt(): Voxels {
    const v = new Voxels(14, 24, 8, 0.42);
    v.box(0, 5, 0, 3, 23, 2, 0x4c5157).box(11, 5, 0, 14, 23, 2, 0x4c5157);
    v.paint((x, y, z, c) => (c === 0x4c5157 && y % 2 === 0 && z === 1) ? 0x5e646b : c);
    v.box(2, 6, 1, 12, 22, 4, 0x7d8a55);
    v.cut(2, 6, 3, 12, 7, 4);                                    // the sloped front
    v.ellipsoid(7, 14, 4.8, 3.6, 4.4, 1.7, 0x8a9862);
    v.box(6, 15, 6, 8, 17, 7, 0x5f6b40);                         // hatch
    v.tubeY(7, 5, 0, 11, 0.6, 0.6, 0x4f5a36);
    v.box(6, 0, 4, 8, 1, 6, 0x3a4228);                           // muzzle
    v.paint((x, y, z, c) => (c === 0x7d8a55 || c === 0x8a9862) && noise2(x / 3 + 5, y / 3) > 0.66 ? 0x66733f : c);
    return v;
  }

  function tankLight(): Voxels {
    const v = new Voxels(12, 20, 7, 0.4);
    v.box(0, 4, 0, 2, 19, 2, 0x4c5157).box(10, 4, 0, 12, 19, 2, 0x4c5157);
    v.box(1, 5, 1, 11, 18, 3, 0xc9b27a);
    v.ellipsoid(6, 11, 3.8, 2.8, 3.2, 1.3, 0xd6c08a);
    v.tubeY(6, 4, 1, 9, 0.5, 0.5, 0x6b5f3e);
    return v;
  }

  // Armoured carrier: a boxy hull on eight wheels, a hatch and an aerial.
  function apc(): Voxels {
    const v = new Voxels(12, 20, 9, 0.42);
    for (const y of [4, 8, 12, 16]) {
      v.tubeX(y, 1.4, 0, 1.6, 1.4, 1.4, 0x33383d);
      v.tubeX(y, 1.4, 10.4, 12, 1.4, 1.4, 0x33383d);
    }
    v.box(1, 2, 1, 11, 19, 5, 0x6f8f5a);
    v.cut(1, 2, 4, 11, 4, 5);
    v.box(4, 10, 5, 8, 13, 6, 0x5d7a4a);
    v.box(9, 15, 5, 10, 16, 9, 0x2f3438);
    return v;
  }

  // Cargo truck: an orange cab and a covered load.
  function truck(cab: number, load: number): Voxels {
    const v = new Voxels(10, 21, 9, 0.4);
    for (const y of [3, 13, 17]) {
      v.tubeX(y, 1.2, 0, 1.2, 1.2, 1.2, 0x2f3438);
      v.tubeX(y, 1.2, 8.8, 10, 1.2, 1.2, 0x2f3438);
    }
    v.box(1, 0, 1, 9, 5, 6, cab);
    v.box(2, 0, 4, 8, 1, 5, 0x9fd8f0);                           // windscreen
    v.box(1, 6, 1, 9, 20, 2, 0x6b5440);
    v.tubeY(5, 4.2, 6, 20, 4, 3, load);
    v.paint((x, y, z, c) => (z < 2 ? (c === load ? null : c) : c));
    return v;
  }

  function fuelTruck(): Voxels {
    const v = new Voxels(10, 21, 9, 0.4);
    for (const y of [3, 13, 17]) {
      v.tubeX(y, 1.2, 0, 1.2, 1.2, 1.2, 0x2f3438);
      v.tubeX(y, 1.2, 8.8, 10, 1.2, 1.2, 0x2f3438);
    }
    v.box(1, 0, 1, 9, 5, 6, 0xe07b53);
    v.box(2, 0, 4, 8, 1, 5, 0x9fd8f0);
    v.tubeY(5, 4.6, 6, 20, 3.8, 3.4, 0xe9edf0);
    v.paint((x, y, z, c) => (c === 0xe9edf0 && z === 4 ? 0xe05a4a : c));
    return v;
  }

  // SAM launcher: a carrier with four white missiles tilted up, and a radar dish on a mast.
  function sam(): Voxels {
    const v = new Voxels(14, 20, 13, 0.45);
    for (const y of [4, 10, 16]) {
      v.tubeX(y, 1.3, 0, 1.4, 1.3, 1.3, 0x2f3438);
      v.tubeX(y, 1.3, 12.6, 14, 1.3, 1.3, 0x2f3438);
    }
    v.box(1, 2, 1, 13, 19, 4, 0x7d8a55);
    v.box(3, 9, 4, 11, 16, 5, 0x66733f);
    for (const x of [3, 5, 8, 10]) {
      for (let k = 0; k < 9; k++) v.set(x, 15 - k, 5 + k * 0.75, k > 6 ? 0xe05555 : 0xf2f2f2);
    }
    v.cone(11.5, 4, 4, 9, 0.6, 0.5, 0x5f676d);
    v.ellipsoid(11.5, 4, 10, 2.6, 0.7, 2.2, 0xdde1e4);
    return v;
  }

  // Flak gun in a ring of sandbags, two barrels raised.
  function flak(): Voxels {
    const v = new Voxels(13, 13, 8, 0.45);
    for (let y = 0; y < 13; y++)
      for (let x = 0; x < 13; x++) {
        const d = Math.hypot(x + 0.5 - 6.5, y + 0.5 - 6.5);
        if (d > 4.6 && d < 6.4) v.box(x, y, 0, x + 1, y + 1, 2, pick([0xcbb37b, 0xbfa66d, 0xd6bf88], x, y, 0));
      }
    v.box(5, 5, 0, 8, 8, 3, 0x6b7378);
    for (const x of [5, 7]) for (let k = 0; k < 7; k++) v.set(x, 6 - k * 0.8, 3 + k * 0.65, 0x3f454b);
    return v;
  }

  // A farm house: cream walls, windows, a door, a red pitched roof and a chimney.
  function house(wall: number, roof: number): Voxels {
    const v = new Voxels(16, 14, 14, 0.6);
    v.box(1, 1, 0, 15, 13, 7, wall);
    v.paint((x, y, z, c) => {
      const face = x === 1 || x === 14 || y === 1 || y === 12;
      if (face && z >= 3 && z <= 4 && ((x + y) % 4 === 1)) return 0x8ccfe8;
      return c;
    });
    v.box(7, 1, 0, 9, 2, 4, 0x8a5a3c);                           // door
    v.roof(0, 0, 16, 14, 7, true, roof, shade(roof, 0.8));
    v.box(11, 4, 8, 13, 6, 13, 0xb85c45);                        // chimney
    return v;
  }

  function shade(rgb: number, f: number): number {
    const r = Math.min(255, Math.round(((rgb >> 16) & 255) * f));
    const g = Math.min(255, Math.round(((rgb >> 8) & 255) * f));
    const b = Math.min(255, Math.round((rgb & 255) * f));
    return (r << 16) | (g << 8) | b;
  }

  // A red barn with white trim, big doors and a grey roof.
  function barn(): Voxels {
    const v = new Voxels(16, 20, 15, 0.6);
    v.box(1, 1, 0, 15, 19, 8, 0xc4473d);
    v.paint((x, y, z, c) => ((x === 1 || x === 14) && (y === 1 || y === 18)) ? 0xf5f0e6 : c);
    v.box(5, 1, 0, 11, 2, 6, 0xa53a32);
    v.paint((x, y, z, c) => (y === 1 && x >= 5 && x < 11 && z < 6 && (x - 5 === z || 10 - x === z)) ? 0xf5f0e6 : c);
    v.roof(0, 0, 16, 20, 8, false, 0x6f7d7a, 0x5c6866);
    return v;
  }

  // A city tower block: a pale body, rows of windows (some lit), and a roof with machinery.
  function tower(storeys: number, body: number): Voxels {
    const h = storeys * 3 + 3;
    const v = new Voxels(12, 12, h, 0.9);
    v.box(1, 1, 0, 11, 11, h - 2, body);
    v.box(1, 1, 0, 11, 11, 2, 0xc96f5a);                         // shop fronts at street level
    v.paint((x, y, z, c) => {
      const face = x === 1 || x === 10 || y === 1 || y === 10;
      if (!face || z < 3 || z >= h - 2 || z % 3 !== 1) return c;
      if ((x + y) % 2 !== 0) return c;
      return hash2(x * 11 + z, y * 5 + z * 3) > 0.8 ? 0xffe39a : 0x8fc6e8;
    });
    v.box(1, 1, h - 2, 11, 11, h - 1, shade(body, 0.75));
    v.box(3, 3, h - 1, 6, 6, h, 0x9aa3ab);
    v.box(7, 6, h - 1, 9, 8, h, 0x9aa3ab);
    return v;
  }

  function barracks(): Voxels {
    const v = new Voxels(24, 12, 9, 0.6);
    v.box(1, 1, 0, 23, 11, 5, 0x8a9a6a);
    v.paint((x, y, z, c) => ((y === 1 || y === 10) && z === 3 && x % 3 === 1) ? 0x8ccfe8 : c);
    v.box(11, 1, 0, 13, 2, 3, 0x5a4632);
    v.roof(0, 0, 24, 12, 5, true, 0x6e7a72, 0x5d6862);
    return v;
  }

  // An aircraft hangar: an arched roof with ribs, and a wide dark door.
  function hangar(): Voxels {
    const v = new Voxels(22, 26, 12, 0.8);
    for (let y = 1; y < 25; y++)
      for (let z = 0; z < 12; z++)
        for (let x = 0; x < 22; x++) {
          const dx = (x + 0.5 - 11) / 11, dz = (z + 0.5) / 11.5;
          if (dx * dx + dz * dz <= 1) v.set(x, y, z, y % 4 === 0 ? 0x9aa4ad : 0xb7c0c8);
        }
    v.paint((x, y, z, c) => (y === 1 && Math.abs(x + 0.5 - 11) < 7 && z < 8) ? 0x545b62 : c);
    return v;
  }

  // A warship: a pointed grey hull with a red waterline, a bridge, a funnel, a mast and a gun.
  function ship(): Voxels {
    const v = new Voxels(12, 42, 12, 0.7);
    for (let y = 0; y < 42; y++) {
      let hw = 5.5;
      if (y < 11) hw = 0.8 + y * 0.45;
      if (y > 36) hw = 5.5 - (y - 36) * 0.4;
      v.box(6 - hw, y, 0, 6 + hw, y + 1, 3, 0x6f7a84);
      v.box(6 - hw, y, 0, 6 + hw, y + 1, 1, 0xb64a42);
      v.box(6 - hw, y, 3, 6 + hw, y + 1, 4, 0x9aa5ad);
    }
    v.box(3, 18, 4, 9, 28, 7, 0xc8cfd5);
    v.paint((x, y, z, c) => (c === 0xc8cfd5 && z === 6 && (x === 3 || x === 8) && y % 2 === 0) ? 0x3e4a55 : c);
    v.box(4, 16, 7, 8, 21, 9, 0xd6dce1);
    v.cone(6, 20, 9, 12, 0.5, 0.4, 0x5f676d);
    v.box(5, 28, 4, 7, 32, 9, 0x3e4a55);
    v.ellipsoid(6, 9, 4.3, 1.7, 1.7, 0.9, 0xb0b9c0);
    v.tubeY(6, 4.6, 4, 9, 0.4, 0.4, 0x4f5860);
    return v;
  }

  function wagon(): Voxels {
    const v = new Voxels(8, 20, 8, 0.45);
    for (const y of [3, 16]) v.box(1, y - 2, 0, 7, y + 2, 2, 0x33383d);
    v.box(0, 1, 2, 8, 19, 7, 0x8a5a3c);
    v.paint((x, y, z, c) => (c === 0x8a5a3c && y % 3 === 0) ? 0x744a30 : c);
    v.box(0, 1, 7, 8, 19, 8, 0x6f4a32);
    return v;
  }

  // Trees: a round one, a pine, an autumn one, a blossom tree and a bush.
  function roundTree(colors: number[]): Voxels {
    const v = new Voxels(10, 10, 12, 0.8);
    v.cone(5, 5, 0, 5, 0.8, 0.7, 0x7a5236);
    v.ellipsoid(5, 5, 7.5, 4.2, 4.2, 3.8, colors[0]);
    v.paint((x, y, z, c) => (c === colors[0] ? pick(colors, x, y, z) : c));
    return v;
  }

  function pine(): Voxels {
    const v = new Voxels(10, 10, 14, 0.8);
    v.cone(5, 5, 0, 3, 0.7, 0.7, 0x6e4a30);
    v.cone(5, 5, 2, 14, 4.4, 0.4, 0x3f8f58);
    v.paint((x, y, z, c) => (c === 0x3f8f58 ? pick([0x3f8f58, 0x357d4d, 0x4ea066], x, y, z) : c));
    return v;
  }

  function bush(): Voxels {
    const v = new Voxels(8, 8, 6, 0.7);
    v.ellipsoid(4, 4, 2.5, 3.6, 3.6, 2.6, 0x6cbf5c);
    v.paint((x, y, z, c) => pick([0x6cbf5c, 0x5aae52, 0x86cf6c], x, y, z));
    return v;
  }

  // Every model by name. City towers and trees have several versions.
  export const MODEL_BUILDERS: { [name: string]: Build } = {
    plane: a10,
    glider,
    fighter: () => fighter(0xc4515a, 0x8e3640, 0x2f3b4a),
    ally: () => fighter(0x4f8fe0, 0x2e5d9e, 0xffd77a),
    jet: () => fighter(0xc9ced3, 0x9aa1a8, 0x3a4652),
    tank_mbt: tankMbt,
    tank_light: tankLight,
    apc,
    truck: () => truck(0xe07b53, 0xc9b07e),
    fuel: fuelTruck,
    sam,
    flak,
    farm: () => house(0xf4e7cc, 0xd65a4a),
    house1: () => house(0xe8eef2, 0x5b8fbf),
    house2: () => house(0xf6dcc4, 0x7aa86a),
    barn,
    city: () => tower(6, 0xe9e4da),
    city1: () => tower(8, 0xd6e1ea),
    city2: () => tower(10, 0xf0d6c6),
    barracks,
    hangar,
    ship,
    rail: wagon,
    tree0: () => roundTree([0x6cbf5c, 0x5aae52, 0x7fcd6a]),
    tree1: pine,
    tree2: () => roundTree([0xe9a043, 0xd9822f, 0xf2b85a]),
    tree3: () => roundTree([0xf3a7c4, 0xf7c6d8, 0xe98fb3]),
    tree4: bush,
  };

  const baked: { [name: string]: Model } = {};

  // The baked model by name (built and baked the first time it is asked for).
  export function model(name: string): Model {
    if (!baked[name]) baked[name] = bake(MODEL_BUILDERS[name]());
    return baked[name];
  }
}
