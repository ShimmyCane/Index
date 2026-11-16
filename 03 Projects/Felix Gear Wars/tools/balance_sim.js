// Felix Gear Wars: balance test without playing the game. Run: node tools/balance_sim.js [matchups|levels|all] [runs]
// It loads the same rules the game uses (js/data.js, js/sim.js) and plays them with a simple bot.
'use strict';
require('../js/data.js'); require('../js/sim.js');
var F = globalThis.FGW;
var mode = process.argv[2] || 'all', RUNS = +(process.argv[3] || 8);

// ---- unit against unit ------------------------------------------------------------------
function duel(a, b, na, nb, la, lb) {
  var sim = new F.Sim(F.levelConfig(1, 1), { noEvents: true, seed: 5 });
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
  outer: for (i = 0; i < g.length; i++) for (j = i + 1; j < g.length; j++) if (sim.canMerge(g[i], g[j])) { sim.moveGear(g[i], g[j].c, g[j].r); break outer; }
  // buy the best affordable thing
  var order = [0, 1, 2].sort(function () { return rnd() - 0.5; });
  for (var k = 0; k < order.length; k++) {
    var slot = order[k], type = sim.tray[slot]; if (!type || type === 'boss') continue;
    if (sim.coins < F.gearCost(type)) continue;
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
  for (var s = 0; s < 30 * 420 && sim.status === 'running'; s++) {
    if (s % 20 === 0) bot(sim, rnd);
    sim.step(1 / 30);
  }
  return { status: sim.status, leaks: sim.leaks, stars: sim.stars(), time: sim.t, gears: sim.gears.length, coins: sim.coins, kills: sim.kills };
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
if (mode === 'matchups' || mode === 'all') matchups();
if (mode === 'levels' || mode === 'all') levels();
