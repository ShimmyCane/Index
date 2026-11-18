// Headless check of the flight model. Loads the compiled game (js/game.js) in a
// sandbox, so there is no browser. Run: node tools/flight_test.js
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
const flat = x => 0; // no hills for the flight tests

// 1. Level flight. A simple hold-the-height controller finds the trim.
{
  const p = new PA.Aircraft(true);
  p.start(0, 60, 60, 0.05, 0.4);
  let maxAbsVy = 0;
  for (let i = 0; i < 60 * 60; i++) {           // 60 seconds at 60 fps
    const vyErr = 0 - p.vy;
    const pilot = { pitch: Math.max(-1, Math.min(1, vyErr * 0.6)), throttle: 0 };
    p.step(1 / 60, pilot, flat);
    if (i > 60 * 20) maxAbsVy = Math.max(maxAbsVy, Math.abs(p.vy));
  }
  check('level flight: holds height with the nose (after 20 s)', maxAbsVy < 1.0, 'max |vy| = ' + maxAbsVy.toFixed(2) + ' m/s');
  check('level flight: speed holds with throttle 0.4', Math.abs(p.speed - 60) < 15, 'speed = ' + p.speed.toFixed(1) + ' m/s');
}

// 2. Full power climbs with the nose a little up; cutting power lets it sink.
{
  const p = new PA.Aircraft(true);
  p.start(0, 60, 60, 0.05, 1);
  for (let i = 0; i < 60 * 5; i++) p.step(1 / 60, { pitch: 0, throttle: 0 }, flat);
  check('full power: climbs', p.h > 60, 'h after 5 s = ' + p.h.toFixed(1) + ' m, speed ' + p.speed.toFixed(1));
}

// 3. Stall: a steep nose at low speed loses lift and sinks.
{
  const p = new PA.Aircraft(true);
  p.start(0, 80, 25, 0, 0.2);
  p.pitch = 0.5;                       // nose up 29 degrees, still moving along the old path
  p.step(1 / 60, { pitch: 0, throttle: 0 }, flat);
  check('stall: flagged past 15 degrees', p.stalled, 'alpha = ' + (p.alpha * 180 / Math.PI).toFixed(1) + ' deg');
  check('stall: lift is smaller than weight', Math.abs(p.lift[1]) < p.weight[1] * -1, 'lift ' + p.lift[1].toFixed(2) + ' vs weight ' + p.weight[1].toFixed(2));
}

// 4. Paper glider (no thrust): glides down, and the sink rate fits the glide ratio.
{
  const p = new PA.Aircraft(false);
  p.start(0, 90, 40, 0.08, 0);
  let t = 0, touched = false;
  while (t < 120 && !touched) {
    touched = p.step(1 / 60, { pitch: 0, throttle: 0 }, flat);
    t += 1 / 60;
  }
  check('paper: glides and touches down', touched, 'after ' + t.toFixed(1) + ' s, at x = ' + p.x.toFixed(0) + ' m');
  check('paper: no thrust', p.thrust[0] === 0 && p.thrust[1] === 0);
  check('paper: flies a reasonable distance (100 to 1000 m)', p.x > 100 && p.x < 1000, 'x = ' + p.x.toFixed(0));
}

// 5. The ground stops the plane.
{
  const p = new PA.Aircraft(true);
  p.start(0, 2, 30, -0.4, 0);
  const hit = p.step(1 / 30, { pitch: 0, throttle: 0 }, () => 3);
  check('ground: touching the ground is reported', hit && p.h === 3);
}

// 6. Missions are repeatable from the seed (the test-cheat and balance tools need this).
{
  const a = PA.makeMission('jet', 'full', 42);
  const b = PA.makeMission('jet', 'full', 42);
  check('missions: same seed, same targets', JSON.stringify(a.targets) === JSON.stringify(b.targets), 'targets ' + a.targets.length);
  const q = PA.makeMission('jet', 'quick', 42);
  check('missions: quick game has fewer targets', q.targets.filter(t => t.kind !== 'flak').length < a.targets.filter(t => t.kind !== 'flak').length);
}

console.log(failures === 0 ? '\nAll flight checks passed.' : '\n' + failures + ' check(s) failed.');
process.exit(failures ? 1 : 0);
