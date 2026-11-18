// The land and the sea, and what is on them. Same seed, same start.
namespace PA {
  export type Mode = 'jet' | 'glider';

  // A seeded random number generator (mulberry32). Returns 0 up to 1.
  export function random(seed: number): () => number {
    let s = seed >>> 0;
    return () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  export const SEA_X = 1300;   // east of this is the sea
  export const ROAD_X = -120;  // the main road runs north along this line
  export const ROAD_W = 7;     // half its width, metres

  // Height of the ground in metres at ground position (X, Z). The sea is at zero.
  export function groundAt(X: number, Z: number): number {
    if (X > SEA_X) return 0;
    return Math.max(0, 4 + 3.5 * Math.sin(X / 210) + 1.5 * Math.sin(Z / 61 + 2));
  }

  export function isSea(X: number): boolean {
    return X > SEA_X;
  }

  // What the ground looks like: farm fields, town, army land, or the sea.
  // A repeatable pseudo-random number from a cell (so the same place always looks the same).
  export function cellNoise(i: number, j: number, salt: number): number {
    let h = (i * 374761393 + j * 668265263 + salt * 2246822519) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  // Lakes: some 200 m cells on land are water.
  export function isLake(X: number, Z: number): boolean {
    if (X > SEA_X) return false;
    const i = Math.floor(X / 200), j = Math.floor(Z / 200);
    return cellNoise(i, j, 7) > 0.86 && Math.abs(X - ROAD_X) > 30;
  }

  // Forest: some cells of farm and army land have trees.
  export function isForest(X: number, Z: number): boolean {
    const i = Math.floor(X / 120), j = Math.floor(Z / 120);
    return cellNoise(i, j, 11) > 0.7 && Math.abs(X - ROAD_X) > 14;
  }

  export function biomeAt(X: number, Z: number): 'sea' | 'lake' | 'farm' | 'town' | 'army' | 'forest' {
    if (X > SEA_X) return 'sea';
    if (isLake(X, Z)) return 'lake';
    if (isForest(X, Z)) return 'forest';
    const cell = Math.floor((X + 900) / 320) + Math.floor(Z / 260) * 3;
    const k = ((cell % 4) + 4) % 4;
    if (k === 0) return 'farm';
    if (k === 1) return 'town';
    return 'army';
  }

  // Where a thing is in the air, or its ground height when it is on the ground.
  export function altOf(t: { X: number; Z: number; h?: number }): number {
    return t.h !== undefined ? t.h : groundAt(t.X, t.Z);
  }

  // Every kind of thing that can be hit.
  //   r, height: the hit box in metres; hp: hits to destroy; points: score
  //   gun: it shoots at the plane (range in m, seconds between shots, shell speed)
  export interface KindInfo {
    r: number; height: number; hp: number; points: number;
    gun?: { range: number; cool: number; speed: number };
    group: 'army' | 'farm' | 'town' | 'airfield' | 'port' | 'rail' | 'air';
  }

  export const KINDS: { [k: string]: KindInfo } = {
    tank_mbt:   { r: 2.6, height: 2.6, hp: 2, points: 100, group: 'army' },
    tank_light: { r: 2.2, height: 2.0, hp: 1, points: 60, group: 'army' },
    apc:        { r: 2.4, height: 2.2, hp: 1, points: 50, group: 'army' },
    truck:      { r: 2.0, height: 2.6, hp: 1, points: 40, group: 'farm' },
    fuel:       { r: 2.6, height: 2.6, hp: 1, points: 60, group: 'airfield' },
    sam:        { r: 3.0, height: 3.5, hp: 2, points: 150, group: 'army', gun: { range: 520, cool: 4, speed: 150 } },
    flak:       { r: 2.0, height: 3.0, hp: 1, points: 80, group: 'army', gun: { range: 260, cool: 2, speed: 120 } },
    farm:       { r: 4.0, height: 4.0, hp: 1, points: 30, group: 'farm' },
    barn:       { r: 4.0, height: 3.5, hp: 1, points: 40, group: 'farm' },
    city:       { r: 3.0, height: 12, hp: 3, points: 120, group: 'town' },
    barracks:   { r: 5.0, height: 3.0, hp: 2, points: 120, group: 'army' },
    hangar:     { r: 6.0, height: 5.0, hp: 3, points: 200, group: 'airfield' },
    jet:        { r: 3.0, height: 2.5, hp: 1, points: 150, group: 'airfield' },
    ship:       { r: 6.0, height: 3.0, hp: 4, points: 250, group: 'port' },
    rail:       { r: 2.5, height: 2.5, hp: 1, points: 40, group: 'rail' },
    fighter:    { r: 3.0, height: 2.5, hp: 1, points: 200, group: 'air', gun: { range: 380, cool: 2.6, speed: 230 } },
    ally:       { r: 3.0, height: 2.5, hp: 1, points: -300, group: 'air' },
  };

  // Which kinds drive along the road (and how fast, metres per second).
  export const DRIVES: { [k: string]: number } = { tank_mbt: 3, tank_light: 6, apc: 6, truck: 9, fuel: 7 };

  // Is this a mission target? Ground places and vehicles count; ships, rail and the air do not.
  export function isObjective(t: { kind: string; faction?: string }): boolean {
    if (t.faction) return false;
    const group = KINDS[t.kind].group;
    return group === 'army' || group === 'farm' || group === 'town';
  }

  export interface Target {
    kind: string;
    X: number;
    Z: number;
    alive: boolean;
    points: number;
    hp: number;
    cool: number;      // gun: seconds until the next shot
    vZ?: number;       // a vehicle on the road moves this fast
    h?: number;        // in the air: the altitude (undefined on the ground)
    vX?: number;       // in the air: flight velocity
    vZa?: number;
    vH?: number;       // in the air: the path it flies (for allies: an orbit)
    orbit?: { cx: number; cz: number; r: number; ang: number; w: number };
    faction?: 'enemy' | 'ally';
    age?: number;
  }

  export interface Hoop {
    X: number;
    Z: number;
    h: number;
    r: number;
    passed: boolean;
  }

  export interface Mission {
    mode: Mode;
    targets: Target[];
    hoops: Hoop[];
  }

  function target(kind: string, X: number, Z: number, rand: () => number): Target {
    const info = KINDS[kind];
    return {
      kind, X, Z, alive: true, points: info.points, hp: info.hp,
      cool: info.gun ? 1 + rand() * info.gun.cool : 0,
    };
  }

  // Clusters of things in front of baseZ. Each cluster is one kind of place.
  export function spawnTargets(rand: () => number, baseZ: number, count: number): Target[] {
    const out: Target[] = [];
    for (let i = 0; i < count; i++) {
      const Z = baseZ + i * 120 + rand() * 60;
      const roll = rand();
      const landX = (rand() - 0.5) * 900;
      // Some vehicles drive along the road, north or south.
      const driver = (kind: string, X: number, Z: number): Target => {
        const t = target(kind, X, Z, rand);
        if (DRIVES[kind] !== undefined && rand() < 0.5) t.vZ = (rand() < 0.5 ? -1 : 1) * DRIVES[kind];
        return t;
      };
      if (roll < 0.32) {
        // Army: tanks, carriers, a SAM site or a flak gun.
        const X = landX;
        out.push(driver('tank_mbt', ROAD_X + 4, Z));
        out.push(driver(rand() < 0.5 ? 'tank_light' : 'apc', ROAD_X - 6, Z + 4));
        if (rand() < 0.5) out.push(target('sam', X - 10, Z + 10, rand));
        else out.push(target('flak', X + 14, Z - 6, rand));
      } else if (roll < 0.5) {
        // Farm: houses, barns and a lorry.
        const X = landX;
        out.push(target('farm', X, Z, rand));
        out.push(target('barn', X + 12, Z + 9, rand));
        out.push(driver('truck', ROAD_X + 3, Z + 6));
      } else if (roll < 0.66) {
        // Town: towers, barracks and a SAM site.
        const X = landX;
        out.push(target('city', X, Z, rand));
        out.push(target('city', X + 8, Z + 6, rand));
        out.push(target('city', X - 7, Z + 9, rand));
        out.push(target('sam', X + 14, Z - 4, rand));
      } else if (roll < 0.78) {
        // Airfield: a hangar, parked jets and a fuel tanker.
        const X = Math.min(SEA_X - 120, landX);
        out.push(target('hangar', X, Z, rand));
        out.push(target('jet', X + 12, Z + 8, rand));
        out.push(target('jet', X + 18, Z + 8, rand));
        out.push(target('fuel', X - 10, Z + 10, rand));
      } else if (roll < 0.9) {
        // Port: a ship on the sea, with a flak gun on the coast.
        const X = SEA_X + 80 + rand() * 300;
        out.push(target('ship', X, Z, rand));
        out.push(target('flak', SEA_X - 30, Z, rand));
      } else {
        // Railway: wagons on the line.
        const X = -320;
        out.push(target('rail', X, Z, rand));
        out.push(target('rail', X, Z + 6, rand));
        out.push(target('barracks', X + 40, Z + 12, rand));
      }
    }
    return out;
  }

  // An enemy fighter or an ally, flying in from far off.
  export function spawnAir(rand: () => number, px: number, pz: number, enemy: boolean): Target {
    const bearing = (rand() - 0.5) * 1.2;           // radians either side of the nose
    const dist = 1100 + rand() * 200;
    const X = px + Math.sin(bearing) * dist;
    const Z = pz + Math.cos(bearing) * dist;
    const h = 80 + rand() * 40;
    if (enemy) {
      return { kind: 'fighter', X, Z, h, alive: true, points: KINDS.fighter.points, hp: 1,
        cool: 1 + rand() * 2, faction: 'enemy', age: 0 };
    }
    // Allies orbit a point near the front, at a steady height.
    const cx = px + (rand() - 0.5) * 600, cz = pz + 500 + rand() * 500;
    return { kind: 'ally', X: cx + 900, Z: cz, h: 90, alive: true, points: KINDS.ally.points, hp: 1, cool: 0,
      faction: 'ally', orbit: { cx, cz, r: 900, ang: rand() * Math.PI * 2, w: 0.09 }, age: 0 };
  }

  export function makeMission(mode: Mode, seed: number): Mission {
    const rand = random(seed);
    if (mode === 'glider') {
      const hoops: Hoop[] = [];
      for (let i = 0; i < 24; i++) {
        const X = (rand() - 0.5) * 60;
        const Z = 220 + i * 110 + rand() * 30;
        hoops.push({ X, Z, h: groundAt(X, Z) + 12 + rand() * 40, r: 6, passed: false });
      }
      return { mode, targets: [], hoops };
    }
    return { mode, targets: spawnTargets(rand, 260, 10), hoops: [] };
  }
}
