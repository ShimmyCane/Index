// The land, the targets and the glider rings. Same seed, same start.
namespace PA {
  export type Mode = 'jet' | 'glider';
  export type TargetKind = 'tank' | 'truck' | 'flak';

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

  // Height of the ground in metres at ground position (X, Z).
  export function groundAt(X: number, Z: number): number {
    return Math.max(0, 4 + 3.5 * Math.sin(X / 210) + 1.5 * Math.sin(Z / 61 + 2));
  }

  export interface Target {
    kind: TargetKind;
    X: number;
    Z: number;
    alive: boolean;
    points: number;
    cool: number;      // flak only: seconds until the next shot
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

  // Ground size of each target (radius to hit, height), in metres.
  export const SIZE: { [k in TargetKind]: { r: number; height: number } } = {
    tank: { r: 2.6, height: 2.6 },
    truck: { r: 2.2, height: 2.6 },
    flak: { r: 2.0, height: 3.0 },
  };

  // A group of ground targets in front of (baseZ). Every third one has an anti-aircraft gun.
  export function spawnTargets(rand: () => number, baseZ: number, count: number): Target[] {
    const out: Target[] = [];
    for (let i = 0; i < count; i++) {
      const X = (rand() - 0.5) * 260;
      const Z = baseZ + i * 110 + rand() * 60;
      const kind: TargetKind = rand() < 0.6 ? 'tank' : 'truck';
      out.push({ kind, X, Z, alive: true, points: kind === 'tank' ? 100 : 60, cool: 0 });
      if (i % 3 === 0) {
        out.push({ kind: 'flak', X: X + 8, Z: Z + 8, alive: true, points: 80, cool: 1 + rand() * 1.5 });
      }
    }
    return out;
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
