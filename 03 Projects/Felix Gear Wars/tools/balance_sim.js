// Felix Gear Wars: balance test without playing the game. Run: node tools/balance_sim.js [matchups|levels|difficulty|stress|power|all] [runs]
// It loads the same rules the game uses (js/data.js, js/sim.js) and plays them with a simple bot.
'use strict';
require('../js/data.js'); require('../js/sim.js');
var F = globalThis.FGW;
var mode = process.argv[2] || 'all', RUNS = +(process.argv[3] || 8);

// ---- unit against unit ------------------------------------------------------------------
function duel(a, b, na, nb, la, lb) {
  var sim = new F.Sim(F.levelConfig(8, 1), { noEvents: true, seed: 5 });
  sim.structs.forEach(function (st) { st.weapons = []; });          // no castle or tower guns in a duel
  sim.es = { hp: 1, atk: 1, def: 1 }; sim.status = 'running'; sim.waveTimer = Infinity; sim.waveIdx = 99; sim.waveCount = 0;
  var i, u;
  for (i = 0; i < na; i++) { u = sim.makeUnit('ally', a, la || 1, 900 + i * 42, false); u.state = 'go'; u.anim = 'walk'; }
  for (i = 0; i < nb; i++) { u = sim.makeUnit('enemy', b, lb || 1, 1500 + i * 42, false); u.state = 'go'; u.anim = 'walk'; }
  sim.lives = 9999;
  for (var s = 0; s < 30 * 120; s++) {
    sim.step(1 / 30);
    var al = sim.alliesAlive(), en = sim.enemiesAlive();
    if (!al || !en) break;
  }
  return { a: sim.units.filter(function (x) { return x.side === 'ally' && x.state !== 'dying'; }).reduce(function (t, x) { return t + x.hp / x.max; }, 0) / na,
           b: sim.units.filter(function (x) { return x.side === 'enemy' && x.state !== 'dying'; }).reduce(function (t, x) { return t + x.hp / x.max; }, 0) / nb };
}
function matchups() {
  var T = F.UNIT_ORDER, pad = function (s, n) { s = String(s); while (s.length < n) s += ' '; return s; };
  console.log('\nUnit against unit, 6 against 6 at level 1. Number = share of the ROW team left alive (health fraction). Above 0.5 the row wins.');
  console.log(pad('', 10) + T.map(function (t) { return pad(t.slice(0, 7), 8); }).join(''));
  T.forEach(function (a) {
    console.log(pad(a, 10) + T.map(function (b) { var r = duel(a, b, 6, 6); return pad((r.a - r.b > 0 ? '+' : '-') + Math.abs(r.a - r.b).toFixed(2), 8); }).join(''));
  });
  console.log('\nOne merged level-2 unit against two level-1 units of the same kind (survivor health fraction, row side first):');
  T.forEach(function (t) { var r = duel(t, t, 1, 2, 2, 1); console.log('  ' + pad(t, 9) + r.a.toFixed(2) + ' vs ' + r.b.toFixed(2)); });
}

// ---- a bot that plays a level -------------------------------------------------------------
function bot(sim, rnd) {
  // merge any pair that exists
  var g = sim.gears, i, j;
  outer: for (i = 0; i < g.length; i++) for (j = i + 1; j < g.length; j++) if (sim.canMerge(g[i], g[j])) {
    var keep = g[i].rate >= g[j].rate ? g[i] : g[j], other = keep === g[i] ? g[j] : g[i];      // keep the gear that is better connected to the heart
    sim.moveGear(other, keep.c, keep.r); break outer;
  }
  // buy the best affordable thing
  var order = [0, 1, 2].sort(function () { return rnd() - 0.5; });
  for (var k = 0; k < order.length; k++) {
    var slot = order[k], type = sim.tray[slot]; if (!type || type === 'boss') continue;
    if (sim.coins < sim.priceOf(type)) continue;
    var cell = bestCell(sim, type); if (!cell) return;
    sim.buy(slot, cell[0], cell[1]); return;
  }
}
function bestCell(sim, type) {
  var best = null, bs = -1;
  for (var c = 0; c < sim.cols; c++) for (var r = 0; r < sim.rows; r++) {
    if (!sim.isFree(c, r)) continue;
    var s = 0, adj = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    adj.forEach(function (d) {
      var nc = c + d[0], nr = r + d[1];
      if (sim.isHeart(nc, nr)) s += 6;
      else { var o = sim.gearAt(nc, nr); if (o) s += o.active ? 3 : 1; }
    });
    if (type === 'mult') s = s > 0 && sim.gears.length > 2 ? s : -1;
    if (s > bs) { bs = s; best = [c, r]; }
  }
  return best;
}
function playLevel(cfg, seed) {
  var sim = new F.Sim(cfg, { noEvents: true, seed: seed }), rnd = F.rng(seed * 31 + 7);
  sim.start();
  var peak = 0, army = [];
  for (var s = 0; s < 30 * 600 && sim.status === 'running'; s++) {
    if (s % 20 === 0) bot(sim, rnd);
    sim.step(1 / 30);
    if (s % 30 === 0) { var a = sim.alliesAlive(); if (a > peak) peak = a; if (s % (30 * 60) === 0) army.push(a); }
  }
  return { status: sim.status, leaks: sim.leaks, stars: sim.stars(), time: sim.t, gears: sim.gears.length, coins: sim.coins, kills: sim.kills, peak: peak, army: army };
}
function levels() {
  console.log('\nBot campaign test: ' + RUNS + ' runs per level. A simple bot buys and merges, never repositions.');
  console.log('level  win%  avgLeaks/lives  avg stars  avg secs');
  for (var ch = 1; ch <= 8; ch++) for (var lv = 1; lv <= 3; lv++) {
    var cfg = F.levelConfig(ch, lv), w = 0, leaks = 0, stars = 0, time = 0;
    for (var k = 0; k < RUNS; k++) { var r = playLevel(F.levelConfig(ch, lv), 100 + k); if (r.status === 'won') { w++; stars += r.stars; } leaks += r.leaks; time += r.time; }
    console.log(('c' + ch + 'l' + lv + '   ').slice(0, 6) + String(Math.round(w / RUNS * 100)).padStart(4) + '%  ' + (leaks / RUNS).toFixed(1).padStart(6) + '/' + String(cfg.lives).padEnd(5) +
      (w ? (stars / w).toFixed(2) : '  -').padStart(9) + String(Math.round(time / RUNS)).padStart(10));
  }
}
// ---- difficulty at the first and the last chapter ---------------------------------------------
function difficulty() {
  var picks = [[1, 1, 'level 1 (chapter 1)'], [3, 2, 'level 8 (the eighth level, chapter 3)'], [8, 1, 'chapter 8, first level'], [8, 3, 'chapter 8, boss level']];
  console.log('\nDifficulty test, ' + RUNS + ' runs each. The bot buys, merges, never moves a gear and never uses the boss gear.');
  console.log('level                                   win%  leaks/lives  fortress at (s)  peak army  army each minute');
  picks.forEach(function (p) {
    var cfg = F.levelConfig(p[0], p[1]), w = 0, leaks = 0, time = 0, peak = 0, armies = [];
    for (var k = 0; k < RUNS; k++) { var r = playLevel(F.levelConfig(p[0], p[1]), 200 + k); if (r.status === 'won') w++; leaks += r.leaks; time += r.time; peak = Math.max(peak, r.peak); if (k === 0) armies = r.army; }
    console.log((p[2] + '                                        ').slice(0, 40) + String(Math.round(w / RUNS * 100)).padStart(4) + '%  ' + ((leaks / RUNS).toFixed(1) + '/' + cfg.lives).padStart(11) + String(Math.round(time / RUNS)).padStart(16) + String(peak).padStart(11) + '  ' + armies.join(' '));
  });
}
// ---- a multiplier next to the heart must help, not explode the screen ---------------------------
function stress() {
  function run(withMult) {
    var sim = new F.Sim(F.levelConfig(1, 1), { noEvents: true, seed: 9 }); sim.fort.invuln = true; sim.structs.forEach(function (st) { st.weapons = []; }); sim.coins = 9999; var h = sim.heart, c = h.c + 1, r = h.r;
    var g0 = null;
    if (withMult) { sim.tray = ['mult', 'mult', 'mult']; sim.buy(0, c, r); g0 = sim.gearAt(c, r); g0.level = 2; sim.recompute(); }    // a x2 gear on the east side
    else { sim.tray = ['spearman', 'spearman', 'spearman']; sim.buy(0, c, r); }
    // a row of spearman gears behind it
    for (var i = 1; i <= 3; i++) { var cc = c + i; if (cc >= sim.cols) break; sim.tray = ['spearman', 'spearman', 'spearman']; sim.buy(0, cc, r); }
    var made = 0; sim.start(); sim.waveTimer = Infinity;
    for (var s = 0; s < 30 * 60; s++) { sim.step(1 / 30); } made = sim.alliesAlive() + 0; return made;
  }
  var a = run(false), b = run(true);
  console.log('\nMultiplier stress test (one heart side, a chain of up to 4 spearman gears, one minute at normal speed):');
  console.log('  no multiplier: ' + a + ' fighters;  with a x2 gear first in the chain: ' + b + ' fighters');
  var full = new F.Sim(F.levelConfig(1, 1), { noEvents: true, seed: 9 }); full.fort.invuln = true; full.structs.forEach(function (st) { st.weapons = []; }); full.coins = 9999; var hh = full.heart, n = 0;
  [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { for (var i = 1; i < 3; i++) { var cc = hh.c + d[0] * i, rr = hh.r + d[1] * i; if (full.isFree(cc, rr)) { full.tray = ['spearman', 'spearman', 'spearman']; if (full.buy(0, cc, rr) === 'ok') n++; } } });
  full.start(); full.waveTimer = Infinity; for (var s = 0; s < 30 * 120; s++) full.step(1 / 30);
  console.log('  ' + n + ' spearman gears around the heart for two minutes: ' + full.alliesAlive() + ' fighters (the cap is ' + F.MAX_UNITS + ')');
}
// ---- every gear should make about the same power per minute ------------------------------------
function power() {
  console.log('\nPower per minute of one level-1 gear on one heart side (heart at 3.2 s a turn). Power = sqrt(effective health x damage per second), times a range, splash and siege modifier.');
  console.log('type       ticks  secs/fighter  power  power/min  slower than spearman');
  F.UNIT_ORDER.forEach(function (t) {
    var u = F.UNITS[t], ehp = u.hp * (1 + u.def / 40), dps = u.atk / u.cd, rm = u.kind === 'ranged' ? 1 + u.range / 600 : 1, sp = u.splash ? 1 + u.splash / 300 : 1, sg = u.siege ? 1.15 : 1;
    var pw = Math.sqrt(ehp * dps) * rm * sp * sg, secs = F.ticksNeeded(t, 1) * 3.2 / 4;
    console.log((t + '          ').slice(0, 10) + String(F.ticksNeeded(t, 1)).padStart(5) + secs.toFixed(1).padStart(14) + pw.toFixed(1).padStart(8) + (pw / secs * 60).toFixed(0).padStart(11) + (F.ticksNeeded(t, 1) / F.ticksNeeded('spearman', 1)).toFixed(2).padStart(14) + 'x');
  });
}
function sweep() {
  // node tools/balance_sim.js sweep 4 '{"base":30,"perLevel":20}' ...   each JSON is tried on levels 1, 8, 22 and 24
  var tries = process.argv.slice(4).map(function (j) { return JSON.parse(j); });
  var picks = [[1, 1], [3, 2], [8, 1], [8, 3]], keep = Object.assign({}, F.TUNE);
  tries.forEach(function (t) {
    F.TUNE = Object.assign({}, keep, t); var row = [];
    picks.forEach(function (p) {
      var w = 0, leaks = 0, time = 0, lives = 0;
      for (var k = 0; k < RUNS; k++) { var cfg = F.levelConfig(p[0], p[1]); lives = cfg.lives; var r = playLevel(cfg, 300 + k); if (r.status === 'won') w++; leaks += r.leaks; time += r.time; }
      row.push('c' + p[0] + 'l' + p[1] + ' ' + Math.round(w / RUNS * 100) + '% leaks ' + (leaks / RUNS).toFixed(0) + '/' + lives + ' ' + Math.round(time / RUNS) + 's');
    });
    console.log(JSON.stringify(t) + '  ->  ' + row.join(' | '));
  });
}
if (mode === 'sweep') sweep();
if (mode === 'power' || mode === 'all') power();
if (mode === 'stress' || mode === 'all') stress();
if (mode === 'difficulty' || mode === 'all') difficulty();
if (mode === 'matchups' || mode === 'all') matchups();
if (mode === 'levels' || mode === 'all') levels();
