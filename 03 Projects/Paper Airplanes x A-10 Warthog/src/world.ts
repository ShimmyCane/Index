// The land and the missions. Same seed, same mission: the balance test relies on it.
namespace PA {
  export type Mode = 'jet' | 'paper';
  export type Size = 'full' | 'quick';

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

  // Height of the ground in metres at distance x (the same line is drawn).
  export function groundAt(x: number): number {
    return Math.max(0, 4 + 3.5 * Math.sin(x / 210) + 1.5 * Math.sin(x / 61 + 2));
  }

  export type TargetKind = 'tank' | 'truck' | 'flak';

  export interface Target {
    kind: TargetKind;
    x: number;
    far: boolean;      // drawn half size, higher on the screen: further away
    hp: number;
    alive: boolean;
    points: number;
    cool: number;      // flak only: seconds until the next shot
  }

  export interface Hoop {
    x: number;
    h: number;
    r: number;
    passed: boolean;
  }

  export interface Mission {
    mode: Mode;
    size: Size;
    seed: number;
    targets: Target[];
    hoops: Hoop[];
    startX: number;
    startH: number;
    startSpeed: number;
    startPitch: number;
    startThrottle: number;
    ammo: number;
  }

  export function makeMission(mode: Mode, size: Size, seed: number): Mission {
    const rand = random(seed);
    const full = size === 'full';

    if (mode === 'paper') {
      const count = full ? 24 : 12;
      const hoops: Hoop[] = [];
      for (let i = 0; i < count; i++) {
        const x = 260 + i * 110 + rand() * 40;
        hoops.push({ x, h: groundAt(x) + 12 + rand() * 40, r: 6, passed: false });
      }
      return {
        mode, size, seed, targets: [], hoops,
        startX: 0, startH: 90, startSpeed: 40, startPitch: 0.08, startThrottle: 0, ammo: 0,
      };
    }

    const count = full ? 12 : 6;
    const targets: Target[] = [];
    for (let i = 0; i < count; i++) {
      const x = 500 + i * 260 + rand() * 120;
      const far = rand() < 0.4;
      const kind: TargetKind = rand() < 0.6 ? 'tank' : 'truck';
      targets.push({
        kind, x, far,
        hp: kind === 'tank' ? 2 : 1,
        alive: true,
        points: (kind === 'tank' ? 100 : 60) * (far ? 2 : 1),
        cool: 0,
      });
      // Every third target has an anti-aircraft gun beside it.
      if (i % 3 === 0) {
        targets.push({
          kind: 'flak', x: x + 22, far: false, hp: 1, alive: true,
          points: 80, cool: 1 + rand() * 1.5,
        });
      }
    }
    return {
      mode, size, seed, targets, hoops: [],
      startX: 0, startH: groundAt(0) + 10, startSpeed: 60, startPitch: 0.05, startThrottle: 0.5,
      ammo: full ? 240 : 160,
    };
  }
}
