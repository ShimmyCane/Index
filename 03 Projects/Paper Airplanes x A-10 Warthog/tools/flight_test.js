// Headless check of the flight model and the missions. Loads the compiled game
// (js/game.js) in a sandbox, so there is no browser. Run: node tools/flight_test.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'game.js'), 'utf8');
const ctx = { console, Math, Date };
vm.createContext(ctx);
vm.runInContext(code, ctx);
const PA = vm.runInContext('PA', ctx);

let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? '  ' + detail : ''));
  if (!ok) failures++;
}
const flat = () => 0; // no hills for the flight tests
const still = { pitch: 0, yaw: 0, throttle: 0 };

// 1. Level flight. A simple hold-the-height controller finds the trim.
{
  const p = new PA.Aircraft(true);
  p.start(0, 0, 60, 60, 0.05, 0, 0.4);
  let maxAbsVy = 0;
  for (let i = 0; i < 60 * 60; i++) {           // 60 seconds at 60 fps
    const pilot = { pitch: Math.max(-1, Math.min(1, (0 - p.vy) * 0.6)), yaw: 0, throttle: 0.4 };
    p.step(1 / 60, pilot, flat);
    if (i > 60 * 20) maxAbsVy = Math.max(maxAbsVy, Math.abs(p.vy));
  }
  check('level flight: holds height with the nose (after 20 s)', maxAbsVy < 1.0, 'max |vy| = ' + maxAbsVy.toFixed(2) + ' m/s');
  check('level flight: speed holds with throttle 0.4', Math.abs(p.speed - 60) < 15, 'speed = ' + p.speed.toFixed(1) + ' m/s');
}

// 2. Full power climbs with the nose a little up.
{
  const p = new PA.Aircraft(true);
  p.start(0, 0, 60, 60, 0.05, 0, 1);
  for (let i = 0; i < 60 * 5; i++) p.step(1 / 60, still, flat);
  check('full power: climbs', p.h > 60, 'h after 5 s = ' + p.h.toFixed(1) + ' m, speed ' + p.speed.toFixed(1));
}

// 3. Stall: a steep nose at low speed loses lift.
{
  const p = new PA.Aircraft(true);
  p.start(0, 0, 80, 25, 0, 0, 0.2);
  p.pitch = 0.5;                       // nose up 29 degrees, still moving along the old path
  p.step(1 / 60, still, flat);
  check('stall: flagged past 15 degrees', p.stalled, 'alpha = ' + (p.alpha * 180 / Math.PI).toFixed(1) + ' deg');
  check('stall: lift is smaller than weight', Math.abs(p.lift[1]) < Math.abs(p.weight[1]), 'lift ' + p.lift[1].toFixed(2) + ' vs weight ' + p.weight[1].toFixed(2));
}

// 4. Paper glider (no thrust): glides down and lands; the sink fits the glide ratio.
{
  const p = new PA.Aircraft(false);
  p.start(0, 0, 90, 40, 0.08, 0, 0);
  let t = 0, touched = false;
  while (t < 120 && !touched) {
    touched = p.step(1 / 60, still, flat);
    t += 1 / 60;
  }
  const dist = Math.hypot(p.X, p.Z);
  check('paper: glides and touches down', touched, 'after ' + t.toFixed(1) + ' s, ' + dist.toFixed(0) + ' m away');
  check('paper: no thrust', p.thrust[0] === 0 && p.thrust[1] === 0);
  check('paper: flies a reasonable distance (100 to 1000 m)', dist > 100 && dist < 1000, 'distance = ' + dist.toFixed(0));
}

// 5. The ground stops the plane.
{
  const p = new PA.Aircraft(true);
  p.start(0, 0, 2, 30, -0.4, 0, 0);
  const hit = p.step(1 / 30, still, () => 3);
  check('ground: touching the ground is reported', hit && p.h === 3);
}

// 6. Turning: steering right turns the heading right and moves the plane to the right (+X).
{
  const p = new PA.Aircraft(true);
  p.start(0, 0, 60, 60, 0, 0, 0.6);
  for (let i = 0; i < 60; i++) p.step(1 / 60, { pitch: 0, yaw: 1, throttle: 0.6 }, flat);
  check('turn: right steering turns the heading right', p.yaw > 0.5, 'yaw = ' + p.yaw.toFixed(2) + ' rad');
  check('turn: the plane moves to the right of its start', p.X > 10 && p.bank > 0, 'X = ' + p.X.toFixed(0) + ', bank = ' + p.bank.toFixed(2));
}

// 7. Missions: the same seed gives the same targets and rings; free play has ground targets.
{
  const a = PA.makeMission('jet', 42);
  const b = PA.makeMission('jet', 42);
  check('missions: same seed, same targets', JSON.stringify(a.targets) === JSON.stringify(b.targets), 'targets ' + a.targets.length);
  check('missions: free play starts with ground targets', a.targets.filter(t => t.kind !== 'flak').length >= 8);
  const g = PA.makeMission('glider', 42);
  check('missions: glider has 24 rings and no guns', g.hoops.length === 24 && g.targets.length === 0);
}

// 8. Missile: locks on to a target ahead and destroys it.
{
  const settings = { mode: 'jet', control: 'drag', view: 'chase', sound: 0, forces: 0, showErrors: 0 };
  const g = new PA.Game(settings);
  g.onSound = () => {};
  const ahead = { kind: 'tank', X: g.plane.X, Z: g.plane.Z + 200, alive: true, points: 100, cool: 0 };
  g.mission.targets = [ahead];
  g.held.missile = true;
  g.update(1 / 30);
  g.held.missile = false;
  for (let i = 0; i < 12 * 30 && ahead.alive; i++) g.update(1 / 30);
  check('missile: locks on and destroys the target ahead', !ahead.alive && g.kills >= 1, 'kills = ' + g.kills);
}

// 9. Ejection: a crash starts the eject sequence, then the flight restarts.
{
  const settings = { mode: 'jet', control: 'drag', view: 'chase', sound: 0, forces: 0, showErrors: 0 };
  const g = new PA.Game(settings);
  g.onSound = () => {};
  g.hull = 0;
  g.update(1 / 30);
  check('eject: a crash starts the sequence with a pilot in the air', g.phase === 'crashed' && g.jumpers.length === 1);
  for (let i = 0; i < 5 * 30; i++) g.update(1 / 30);
  check('eject: the flight restarts after the parachute', g.phase === 'flying' && g.hull === 100);
}

console.log(failures === 0 ? '\nAll flight checks passed.' : '\n' + failures + ' check(s) failed.');
process.exit(failures ? 1 : 0);
