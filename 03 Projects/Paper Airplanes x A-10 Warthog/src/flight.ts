// The four forces, in plain numbers. No drawing here, so it can be tested in Node.
//
//   lift    pushes across the flight path; grows with speed² and with the angle
//           of attack (alpha = nose angle minus flight-path angle)
//   drag    pushes against the flight path; grows with speed² and with lift
//   thrust  pushes along the nose (the A-10 engines; zero for a paper plane)
//   weight  pulls down: mass × gravity
//
// The vertical plane (forward speed vx, climb vy, altitude h) is worked out as a
// side view. Yaw turns that plane round the vertical axis, so the plane can
// turn left and right over the ground: X and Z are the ground position.
// Past the stall angle, lift falls away, so the plane sinks.
namespace PA {
  export const AIR = {
    mass: 1,
    kq: 0.012,        // lift and drag per unit of speed²
    cd0: 0.06,        // drag with no lift
    kInduced: 0.03,   // extra drag from lift
    clAlpha: 4.5,     // lift per radian of angle of attack
    camber: 0.22,     // lift with the nose exactly on the flight path (a curved wing)
    stall: 0.26,      // radians, about 15 degrees
    maxThrust: 6,
    pitchRate: 1.1,   // radians per second when the nose is moved
    turnRate: 1.0,    // radians per second of yaw at full steering
    bankMax: 0.6,     // radians of bank at full steering (the wings tilt into the turn)
    stability: 0.5,   // the tail pulls the nose back toward the flight path
  };

  export interface Pilot {
    pitch: number;    // -1 nose down … +1 nose up
    yaw: number;      // -1 turn left … +1 turn right
    throttle: number; // 0 … 1 (engine plane only)
  }

  export type Vec = [number, number];

  export class Aircraft {
    X = 0;            // ground position, metres (east)
    Z = 0;            // ground position, metres (north, the start heading)
    h = 0;            // altitude, metres
    vx = 0;           // forward speed in the vertical plane
    vy = 0;           // climb speed
    pitch = 0;        // nose angle (radians)
    yaw = 0;          // heading (radians, 0 = north, positive = turned right)
    bank = 0;         // wing tilt for drawing (radians, positive = right wing down)
    throttle = 0;
    alpha = 0;
    stalled = false;
    thrust: Vec = [0, 0];
    lift: Vec = [0, 0];
    drag: Vec = [0, 0];
    weight: Vec = [0, 0];

    constructor(public readonly engine: boolean) {}

    get speed(): number {
      return Math.hypot(this.vx, this.vy);
    }

    start(X: number, Z: number, h: number, speed: number, pitch: number, yaw: number, throttle: number): void {
      this.X = X;
      this.Z = Z;
      this.h = h;
      this.vx = speed * Math.cos(pitch);
      this.vy = speed * Math.sin(pitch);
      this.pitch = pitch;
      this.yaw = yaw;
      this.bank = 0;
      this.throttle = throttle;
    }

    // Moves the plane by dt seconds. Returns true if it touched the ground.
    step(dtIn: number, pilot: Pilot, groundAt: (X: number, Z: number) => number): boolean {
      const dt = Math.min(dtIn, 1 / 30);
      this.pitch += pilot.pitch * AIR.pitchRate * dt;
      this.yaw += pilot.yaw * AIR.turnRate * dt;
      this.bank += (pilot.yaw * AIR.bankMax - this.bank) * Math.min(1, dt * 4);
      if (this.engine) this.throttle = clamp01(pilot.throttle);

      const v = this.speed;
      const gamma = v > 0.01 ? Math.atan2(this.vy, this.vx) : this.pitch;
      this.pitch -= AIR.stability * (this.pitch - gamma) * dt;
      const alpha = this.pitch - gamma;
      this.alpha = alpha;

      const a = Math.abs(alpha);
      this.stalled = a > AIR.stall;
      let cl = AIR.camber + AIR.clAlpha * alpha;
      if (this.stalled) {
        const sign = Math.sign(alpha);
        cl = sign * AIR.clAlpha * AIR.stall * Math.max(0.3, 1 - (a - AIR.stall) * 3);
      }

      const q = AIR.kq * v * v;
      const liftMag = v > 1 ? q * cl : 0;
      const dragMag = q * (AIR.cd0 + AIR.kInduced * cl * cl);

      const ux = v > 0.01 ? this.vx / v : Math.cos(this.pitch);
      const uy = v > 0.01 ? this.vy / v : Math.sin(this.pitch);

      const thrustMag = this.engine ? this.throttle * AIR.maxThrust : 0;
      this.thrust = [Math.cos(this.pitch) * thrustMag, Math.sin(this.pitch) * thrustMag];
      this.lift = [-uy * liftMag, ux * liftMag];
      this.drag = [-ux * dragMag, -uy * dragMag];
      this.weight = [0, -AIR.mass * GRAVITY];

      const ax = (this.thrust[0] + this.lift[0] + this.drag[0]) / AIR.mass;
      const ay = (this.thrust[1] + this.lift[1] + this.drag[1] + this.weight[1]) / AIR.mass;
      this.vx += ax * dt;
      this.vy += ay * dt;

      // Move along the heading, and climb or sink.
      const run = this.vx * dt;
      this.X += run * Math.sin(this.yaw);
      this.Z += run * Math.cos(this.yaw);
      this.h += this.vy * dt;

      const ground = groundAt(this.X, this.Z);
      if (this.h <= ground) {
        this.h = ground;
        return true;
      }
      return false;
    }
  }

  function clamp01(v: number): number {
    return Math.max(0, Math.min(1, v));
  }
}
