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
PA.PAINT = vm.runInContext('PA.PAINT', ctx);

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
  const ahead = { kind: 'tank_mbt', X: g.plane.X, Z: g.plane.Z + 200, alive: true, points: 100, hp: 2, cool: 0 };
  g.mission.targets = [ahead];
  g.held.missile = true;
  for (let i = 0; i < 2 * 30; i++) g.update(1 / 30);   // hold: the lock takes about a second and a bit
  g.held.missile = false;
  for (let i = 0; i < 12 * 30 && ahead.alive; i++) g.update(1 / 30);
  check('missile: a steady hold locks on and destroys the target ahead', !ahead.alive && g.kills >= 1, 'kills = ' + g.kills);
}

// 9. A loss: the plane blinks once, then carries on with full health and a new flight; the score stays.
{
  const settings = { mode: 'jet', control: 'drag', view: 'chase', sound: 0, forces: 0, showErrors: 0, safeFlight: 0, invincible: 0, autoReload: 1, volMusic: 0, volGun: 0, volTurn: 0, volWarn: 0, enemyWave: 0, allies: 0 };
  const g = new PA.Game(settings);
  g.onSound = () => {};
  g.score = 500;
  g.hull = 0;
  g.update(1 / 30);
  check('loss: the plane blinks instead of ending the flight', g.phase === 'crashed' && g.blink > 0);
  for (let i = 0; i < 2 * 30; i++) g.update(1 / 30);
  check('loss: the flight carries on at full health, score kept', g.phase === 'flying' && g.hull === 100 && g.score === 500, 'score ' + g.score);
}

// 9b. Pause: nothing moves while the game is paused.
{
  const settings = { mode: 'jet', control: 'drag', view: 'chase', sound: 0, forces: 0, showErrors: 0, safeFlight: 0, invincible: 0, autoReload: 1, volMusic: 0, volGun: 0, volTurn: 0, volWarn: 0, enemyWave: 0, allies: 0 };
  const g = new PA.Game(settings);
  g.onSound = () => {};
  g.paused = true;
  const x0 = g.plane.X, t0 = g.time;
  for (let i = 0; i < 60; i++) g.update(1 / 30);
  check('pause: the plane and the clock stand still', g.plane.X === x0 && g.time === t0);
}

// 9c. Ammo: limited, and it comes back over time.
{
  const settings = { mode: 'jet', control: 'drag', view: 'chase', sound: 0, forces: 0, showErrors: 0, safeFlight: 0, invincible: 0, autoReload: 1, volMusic: 0, volGun: 0, volTurn: 0, volWarn: 0, enemyWave: 0, allies: 0 };
  const g = new PA.Game(settings);
  g.onSound = () => {};
  g.mission.targets = [];
  g.ammo = 10;
  g.held.fire = true;
  for (let i = 0; i < 3 * 30; i++) g.update(1 / 30);
  g.held.fire = false;
  check('ammo: firing uses it up to zero and no further', g.ammo <= 1 && g.ammo >= 0, 'ammo ' + g.ammo.toFixed(1));
  const before = g.ammo;
  for (let i = 0; i < 5 * 30; i++) g.update(1 / 30);
  check('ammo: it comes back over time', g.ammo > before + 5, 'ammo ' + g.ammo.toFixed(1));
}

// 9d. Enemy waves come about every minute; allies fly and do not shoot.
{
  const settings = { mode: 'jet', control: 'drag', view: 'chase', difficulty: 'felix', sound: 0, forces: 0, showErrors: 0, safeFlight: 0, invincible: 0, autoReload: 1, volMusic: 0, volGun: 0, volTurn: 0, volWarn: 0, enemyWave: 2, allies: 1 };
  const g = new PA.Game(settings);
  g.onSound = () => {};
  g.mission.targets = g.mission.targets.filter(t => t.faction === 'ally');
  const enemies0 = g.mission.targets.filter(t => t.faction === 'enemy').length;
  for (let i = 0; i < 10 * 30; i++) g.update(1 / 30);
  const enemies1 = g.mission.targets.filter(t => t.faction === 'enemy').length;
  check('waves: the first wave arrives soon after take-off (Felix: a quarter of the setting, at least one)', enemies1 >= 1 && enemies0 === 0, 'enemies ' + enemies1);
  const ally = g.mission.targets.find(t => t.faction === 'ally');
  const a0 = ally.X;
  for (let i = 0; i < 2 * 30; i++) g.update(1 / 30);
  check('allies: they fly around (they move)', ally.X !== a0);
  check('allies: they do not shoot', !g.shells.some(s => s.warn === undefined && Math.hypot(s.X - ally.X, s.Z - ally.Z) < 2));
}

// 9e. Damage shows as a mark, even when invincible (and costs nothing then).
{
  const settings = { mode: 'jet', control: 'drag', view: 'chase', sound: 0, forces: 0, showErrors: 0, safeFlight: 0, invincible: 1, autoReload: 1, volMusic: 0, volGun: 0, volTurn: 0, volWarn: 0, enemyWave: 0, allies: 0 };
  const g = new PA.Game(settings);
  g.onSound = () => {};
  g.mission.targets = [];
  g.shells.push({ X: g.plane.X, Z: g.plane.Z, h: g.plane.h, vX: 0, vY: 0, vZ: 0, life: 2 });
  g.update(1 / 30);
  check('damage: a hit shows as a mark, invincible keeps the hull', g.marks.length === 1 && g.hull === 100, 'marks ' + g.marks.length);
}

// 10. Safe flight: a plane diving at the ground is pulled up and does not crash.
{
  const g = new PA.Game({ mode: 'jet', control: 'drag', view: 'chase', difficulty: 'felix', sound: 0, forces: 0, showErrors: 0, safeFlight: 1, invincible: 0, autoReload: 1 });
  g.onSound = () => {};
  g.mission.targets = [];
  g.plane.start(0, 0, PA.groundAt(0, 0) + 5, 60, -0.5, 0, 0.6);
  let crashed = false;
  for (let i = 0; i < 8 * 30; i++) { g.update(1 / 30); if (g.phase !== 'flying') { crashed = true; break; } }
  check('safe flight: a dive into the ground is pulled up, no crash', !crashed, 'phase = ' + g.phase + ', height above ground = ' + (g.plane.h - PA.groundAt(g.plane.X, g.plane.Z)).toFixed(1) + ' m');
}

// 11. Invincible: a crash with no hull does not end the flight.
{
  const g = new PA.Game({ mode: 'jet', control: 'drag', view: 'chase', sound: 0, forces: 0, showErrors: 0, safeFlight: 0, invincible: 1, autoReload: 1 });
  g.onSound = () => {};
  g.hull = 0;
  g.update(1 / 30);
  check('invincible: no crash with zero hull', g.phase === 'flying');
}

// 12. Missiles: six to start; with auto reload one comes back; without it none does.
{
  const on = new PA.Game({ mode: 'jet', control: 'drag', view: 'chase', sound: 0, forces: 0, showErrors: 0, safeFlight: 0, invincible: 0, autoReload: 1 });
  on.onSound = () => {};
  check('missiles: six to start', on.missileStock === 6);
  on.missileStock = 0;
  for (let i = 0; i < 3.2 * 30; i++) on.update(1 / 30);
  check('missiles: automatic reload brings one back', on.missileStock === 1, 'stock = ' + on.missileStock);
  const off = new PA.Game({ mode: 'jet', control: 'drag', view: 'chase', sound: 0, forces: 0, showErrors: 0, safeFlight: 0, invincible: 0, autoReload: 0 });
  off.onSound = () => {};
  off.missileStock = 0;
  for (let i = 0; i < 6 * 30; i++) off.update(1 / 30);
  check('missiles: no reload when it is off', off.missileStock === 0);
}

// 13. Gun aim: straight with nothing in front; down toward a ground target ahead.
{
  const g = new PA.Game({ mode: 'jet', control: 'drag', view: 'chase', sound: 0, forces: 0, showErrors: 0, safeFlight: 0, invincible: 0, autoReload: 1 });
  g.onSound = () => {};
  g.mission.targets = [];
  g.update(1 / 30);
  check('gun: straight with nothing in front', g.aim.mode === 'straight' && g.aim.pitch === 0);
  g.mission.targets = [{ kind: 'tank_mbt', X: g.plane.X, Z: g.plane.Z + 300, alive: true, points: 100, hp: 2, cool: 0 }];
  g.update(1 / 30);
  check('gun: depressed toward a tank ahead', g.aim.mode === 'ground' && g.aim.pitch < 0, 'pitch = ' + (g.aim.pitch * 180 / Math.PI).toFixed(2) + ' deg');
}

// 14. The world: every kind of thing has a sprite painted for it, and the sea is at the east.
{
  const names = Object.keys(PA.KINDS);
  check('assets: every kind has a painter', names.every(k => PA.PAINT[k]), 'kinds: ' + names.length);
  check('world: the sea is at the east', PA.biomeAt(PA.SEA_X + 200, 0) === 'sea' && PA.groundAt(PA.SEA_X + 200, 0) === 0);
}

// 15. Notes: numbered, with a status, sorted, and each snapshot has every code in the index.
{
  const settings = { mode: 'jet', control: 'drag', view: 'chase', sound: 0, forces: 0, showErrors: 0, safeFlight: 1, invincible: 0, autoReload: 1 };
  const g = new PA.Game(settings);
  const ids = PA.snapshot(g, settings);
  check('notes: snapshot has every code in the index', PA.INDEX.every(e => e.code in ids), 'codes ' + PA.INDEX.length);
  const a = PA.addNote('Health bar is hard to read', 'Flying', PA.subProject(settings), ids);
  const b = PA.addNote('Tanks too far away', 'Flying', 'A-10 jet / top', ids);
  check('notes: numbered N-0001 and N-0002', a.identifier === 'N-0001' && b.identifier === 'N-0002', a.identifier + ', ' + b.identifier);
  PA.setStatus(a.identifier, 'done');
  const all = PA.loadNotes();
  check('notes: status changes and is kept', all.find(n => n.identifier === 'N-0001').status === 'done');
  check('notes: sorted by status puts open first', PA.sortNotes(all, 'status')[0].identifier === 'N-0002');
  check('notes: the project name is on every note', all.every(n => n.project === PA.NOTES_PROJECT));
}

// 16. Lock-on takes time: a quick tap fires nothing; a steady hold fires.
{
  const st = { mode: 'jet', control: 'drag', view: 'chase', difficulty: 'normal', sound: 0, forces: 0, showErrors: 0, safeFlight: 0, invincible: 0, autoReload: 1, volMusic: 0, volGun: 0, volTurn: 0, volWarn: 0, enemyWave: 0, allies: 0 };
  const g = new PA.Game(st);
  g.onSound = () => {};
  g.mission.targets = [{ kind: 'tank_mbt', X: g.plane.X, Z: g.plane.Z + 300, alive: true, points: 100, hp: 2, cool: 0 }];
  g.held.missile = true;
  for (let i = 0; i < 15; i++) g.update(1 / 30);
  g.held.missile = false;
  check('lock: a quick tap fires nothing', g.missiles.length === 0 && g.missileStock === 6);
}

// 17. Normal mode: three hits and the plane is down (blinks, carries on). Felix never goes down.
{
  const st = { mode: 'jet', control: 'drag', view: 'chase', difficulty: 'normal', sound: 0, forces: 0, showErrors: 0, safeFlight: 0, invincible: 0, autoReload: 1, volMusic: 0, volGun: 0, volTurn: 0, volWarn: 0, enemyWave: 0, allies: 0 };
  const g = new PA.Game(st);
  g.onSound = () => {};
  g.mission.targets = [];
  for (let i = 0; i < 3; i++) g.shells.push({ X: g.plane.X, Z: g.plane.Z, h: g.plane.h, vX: 0, vY: 0, vZ: 0, life: 2 }), g.update(1 / 30);
  check('normal: three hits take the plane down', g.phase === 'crashed' && g.hits >= 3, 'phase ' + g.phase + ', hits ' + g.hits);
  const f = new PA.Game(Object.assign({}, st, { difficulty: 'felix' }));
  f.onSound = () => {};
  f.mission.targets = [];
  for (let i = 0; i < 6; i++) f.shells.push({ X: f.plane.X, Z: f.plane.Z, h: f.plane.h, vX: 0, vY: 0, vZ: 0, life: 2 }), f.update(1 / 30);
  check('felix: hits never take the plane down', f.phase === 'flying' && f.hull === 100 && f.hits === 6);
}

// 18. Supplies: normal mode runs out; Felix never does; a reload from the settings refills, with a cooldown.
{
  const st = { mode: 'jet', control: 'drag', view: 'chase', difficulty: 'normal', sound: 0, forces: 0, showErrors: 0, safeFlight: 0, invincible: 0, autoReload: 0, volMusic: 0, volGun: 0, volTurn: 0, volWarn: 0, enemyWave: 0, allies: 0 };
  const g = new PA.Game(st);
  g.onSound = () => {};
  g.mission.targets = [];
  g.ammo = 0;
  g.update(1 / 30);
  check('normal: the gun runs out when the ammo is gone', g.ammo < 1);
  check('reload: refills the gun from the settings', g.reloadFromSettings() === true && g.ammo === PA.AMMO_MAX);
  check('reload: a second one waits (cooldown)', g.reloadFromSettings() === false);
  const f = new PA.Game(Object.assign({}, st, { difficulty: 'felix' }));
  f.onSound = () => {};
  f.ammo = 0; f.chaff = 0; f.update(1 / 30);
  check('felix: nothing runs out', f.ammo === PA.AMMO_MAX && f.chaff === PA.CHAFF_MAX);
}

// 19. The tag: an enemy missile after the plane is tagged; a hard turn breaks it; chaff makes decoys.
{
  const st = { mode: 'jet', control: 'drag', view: 'chase', difficulty: 'normal', sound: 0, forces: 0, showErrors: 0, safeFlight: 0, invincible: 0, autoReload: 1, volMusic: 0, volGun: 0, volTurn: 0, volWarn: 0, enemyWave: 0, allies: 0 };
  const g = new PA.Game(st);
  g.onSound = () => {};
  g.mission.targets = [];
  g.missiles.push({ X: g.plane.X + 50, Z: g.plane.Z + 200, h: g.plane.h, vX: 0, vY: 0, vZ: -100, life: 5, target: null, enemy: true });
  g.update(1 / 30);
  check('tag: an enemy missile tags the plane', g.tagged === true && g.tagDist > 0, 'distance ' + Math.round(g.tagDist));
  g.axes = { yaw: 1, pitch: 0 };
  for (let i = 0; i < 2 * 30; i++) g.update(1 / 30);
  check('tag: a hard turn breaks the lock', g.missiles.every(m => !m.enemy || m.broken));
  g.fireChaff();
  check('chaff: two decoys come out and one is used', g.decoys.length === 2 && g.chaff === PA.CHAFF_MAX - 1);
}

// 20. Objective: finishing it restocks everything (normal mode).
{
  const st = { mode: 'jet', control: 'drag', view: 'chase', difficulty: 'normal', sound: 0, forces: 0, showErrors: 0, safeFlight: 0, invincible: 0, autoReload: 1, volMusic: 0, volGun: 0, volTurn: 0, volWarn: 0, enemyWave: 0, allies: 0 };
  const g = new PA.Game(st);
  g.onSound = () => {};
  g.ammo = 5; g.missileStock = 1; g.chaff = 0;
  g.objectiveDone = g.objectiveGoal;
  g.update(1 / 30);
  check('objective: finishing it restocks gun, missiles and chaff', g.ammo === PA.AMMO_MAX && g.missileStock === PA.MISSILE_MAX && g.chaff === PA.CHAFF_MAX && g.missionNumber === 2);
}

// 21. A loss in normal mode is a full reset: restocked, and the mission starts again.
{
  const st = { mode: 'jet', control: 'drag', view: 'chase', difficulty: 'normal', sound: 0, forces: 0, showErrors: 0, safeFlight: 0, invincible: 0, autoReload: 0, volMusic: 0, volGun: 0, volTurn: 0, volWarn: 0, enemyWave: 0, allies: 0 };
  const g = new PA.Game(st);
  g.onSound = () => {};
  g.ammo = 3; g.missileStock = 0; g.chaff = 0;
  g.hull = 0;
  g.update(1 / 30);
  for (let i = 0; i < 2 * 30; i++) g.update(1 / 30);
  check('loss: a full reset restocks the gun, missiles and chaff', g.ammo === PA.AMMO_MAX && g.missileStock === PA.MISSILE_MAX && g.chaff === PA.CHAFF_MAX && g.phase === 'flying');
}

// 22. The gun leads: at flying speed it hits a still target ahead, and a target moving along the road.
{
  const st = { mode: 'jet', control: 'drag', view: 'chase', difficulty: 'felix', sound: 0, forces: 0, showErrors: 0, safeFlight: 0, invincible: 0, autoReload: 1, volMusic: 0, volGun: 0, volTurn: 0, volWarn: 0, enemyWave: 0, allies: 0 };
  const still = new PA.Game(st);
  still.onSound = () => {};
  still.mission.targets = [{ kind: 'tank_mbt', X: 0, Z: still.plane.Z + 200, alive: true, points: 100, hp: 2, cool: 0 }];
  const t1 = still.mission.targets[0];
  still.held.fire = true;
  for (let i = 0; i < 3 * 30 && t1.alive; i++) still.update(1 / 30);
  check('gun: hits a still tank 200 m ahead at flying speed', !t1.alive || t1.hp < 2, 'hp ' + t1.hp + ', aim ' + still.aim.mode);

  const moving = new PA.Game(st);
  moving.onSound = () => {};
  moving.mission.targets = [{ kind: 'tank_mbt', X: 0, Z: moving.plane.Z + 250, alive: true, points: 100, hp: 2, cool: 0, vZ: 9 }];
  const t2 = moving.mission.targets[0];
  moving.held.fire = true;
  for (let i = 0; i < 3 * 30 && t2.alive; i++) moving.update(1 / 30);
  check('gun: leads a tank moving along the road', !t2.alive || t2.hp < 2, 'hp ' + t2.hp);
}

// 23. Fighters make attack runs and break off, instead of circling forever.
{
  const st = { mode: 'jet', control: 'drag', view: 'chase', difficulty: 'felix', sound: 0, forces: 0, showErrors: 0, safeFlight: 0, invincible: 0, autoReload: 1, volMusic: 0, volGun: 0, volTurn: 0, volWarn: 0, enemyWave: 0, allies: 0 };
  const g = new PA.Game(st);
  g.onSound = () => {};
  g.mission.targets = [];
  g.mission.targets.push({ kind: 'fighter', X: g.plane.X + 900, Z: g.plane.Z + 400, h: 90, alive: true, points: 200, hp: 1, cool: 0, faction: 'enemy', age: 0, vH: 0 });
  const f = g.mission.targets[0];
  const seen = new Set();
  for (let i = 0; i < 40 * 30 && f.alive; i++) { g.update(1 / 30); if (f.state) seen.add(f.state); }
  check('fighters: they go through approach, attack and break', seen.has('approach') && seen.has('attack') && seen.has('break'), 'states ' + [...seen].join(','));
}

// 24. Allies shoot at an enemy fighter that comes close to them.
{
  const st = { mode: 'jet', control: 'drag', view: 'chase', difficulty: 'felix', sound: 0, forces: 0, showErrors: 0, safeFlight: 0, invincible: 0, autoReload: 1, volMusic: 0, volGun: 0, volTurn: 0, volWarn: 0, enemyWave: 0, allies: 0 };
  const g = new PA.Game(st);
  g.onSound = () => {};
  g.mission.targets = [];
  const ally = { kind: 'ally', X: 0, Z: 1500, h: 90, alive: true, points: -300, hp: 1, cool: 0, faction: 'ally', orbit: { cx: 0, cz: 1500, r: 1, ang: 0, w: 0 }, age: 0 };
  const foe = { kind: 'fighter', X: 150, Z: 1500, h: 90, alive: true, points: 200, hp: 1, cool: 99, faction: 'enemy', age: 0, vH: 0, state: 'break', stateT: 0 };
  g.mission.targets.push(ally, foe);
  let fired = false;
  for (let i = 0; i < 3 * 30 && foe.alive; i++) { g.update(1 / 30); if (g.shots.some(s => s.friendly)) fired = true; }
  check('allies: they shoot at a fighter that comes close', fired && !foe.alive);
}

// 25. Bases: a defended base comes up as the plane passes each stretch of the route.
{
  const st = { mode: 'jet', control: 'drag', view: 'chase', difficulty: 'felix', sound: 0, forces: 0, showErrors: 0, safeFlight: 0, invincible: 0, autoReload: 1, volMusic: 0, volGun: 0, volTurn: 0, volWarn: 0, enemyWave: 0, allies: 0 };
  const g = new PA.Game(st);
  g.onSound = () => {};
  const cities0 = g.mission.targets.filter(t => t.kind === 'city').length;
  g.plane.Z = 900;
  g.update(1 / 30);
  const cities1 = g.mission.targets.filter(t => t.kind === 'city').length;
  const allies = g.mission.targets.filter(t => t.faction === 'ally' && t.orbit && t.orbit.r === 450).length;
  check('bases: a base comes up ahead with towns and defending allies', cities1 >= cities0 + 3 && allies === 2, 'cities ' + cities1 + ', base allies ' + allies);
}

console.log(failures === 0 ? '\nAll flight checks passed.' : '\n' + failures + ' check(s) failed.');
process.exit(failures ? 1 : 0);
