// Felix Gear Wars: the game rules. No DOM and no drawing, so tools/balance_sim.js can run it in Node.
// The screen reads sim.units / sim.gears / sim.proj and drains sim.events (pops, hits, coins...) each frame.
(function () {
  'use strict';
  var F = globalThis.FGW;
  var DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];   // heart sides: E, S, W, N (clockwise from east)
  var STEP = 1 / 30;
  var TOWER_REBUILD = 45;           // seconds for a destroyed tower to be rebuilt

  function Sim(cfg, o) {
    o = o || {};
    this.cfg = cfg; this.o = o;
    this.rnd = F.rng(o.seed || cfg.seed || 1);
    this.noEvents = !!o.noEvents;
    this.t = 0; this.acc = 0; this.speed = 1; this.nid = 1; this.events = [];
    this.cols = cfg.board.cols; this.rows = cfg.board.rows;
    this.heart = { c: cfg.board.heart.c, r: cfg.board.heart.r };
    this.heartA = -0.35;                       // total angle turned (radians); gears fill smoothly as it turns
    this.world = cfg.world || F.WORLD; this.ebx = this.world - 160;   // width of the battlefield and the enemy fortress
    this.heartPeriod = o.heartPeriod || F.HEART_PERIOD / (o.heartSpeed || 1);
    this.holes = {}; cfg.board.holes.forEach(function (h) { this.holes[h[0] + ',' + h[1]] = true; }, this);
    this.grid = {}; this.gears = []; this.units = []; this.proj = [];
    this.coins = cfg.coins; this.maxLives = cfg.lives; this.lives = cfg.lives;
    this.status = 'build';                     // build | running | won | lost
    this.waveIdx = -1; this.queue = []; this.waveTimer = Infinity; this.waveCount = cfg.free ? Infinity : cfg.waves.length;
    this.leaks = 0; this.kills = 0; this.earned = 0; this.spent = 0; this.undo = [];
    this.es = F.enemyScale(cfg.idx);
    this.specialty = o.specialty || null;      // the culture's starred fighter (+25%); the screen sets it
    this.pool = cfg.pool.concat(cfg.specials || []);
    this.pool.push('mult');
    this.tray = [null, null, null];
    this.sideGain = [{}, {}, {}, {}];
    this.rollTray();
    var self = this;
    cfg.board.dormant.forEach(function (d) { self.addGear(d.type, d.level, d.c, d.r, true); });
    this.recompute();
    this.buildStructures();
  }

  var P = Sim.prototype;
  Object.defineProperty(P, 'baseHp', { get: function () { return this.fort.hp; } });
  Object.defineProperty(P, 'baseMax', { get: function () { return this.fort.max; } });

  // ---- castles, towers and the enemy fortress ------------------------------------------------
  // Each side has a castle that shoots arrows and stones. From chapter 4 each side also builds a tower at 10% and one at 25%
  // of the way across. Towers can be destroyed and are rebuilt slowly. The enemy fortress falling wins the level.
  P.buildStructures = function () {
    var cfg = this.cfg, idx = cfg.idx, pw = 1 + 0.1 * idx, es = this.es.atk, self = this;
    this.structs = [];
    function add(side, kind, x, hp, weapons, extra) {
      var k = side === 'enemy' ? es : 1;
      var s = Object.assign({ id: self.nid++, side: side, kind: kind, x: x, hp: hp, max: hp, alive: true, rebuild: 0, targetable: true, flash: 0, invuln: false,
        weapons: weapons.map(function (w) { return { kind: w.kind, range: w.range, min: w.min || 0, cd: w.cd, t: w.cd * (0.4 + self.rnd() * 0.6), dmg: w.dmg * pw * k, splash: w.splash || 0 }; }) }, extra || {});
      self.structs.push(s); return s;
    }
    var castleW = [{ kind: 'arrow', range: 440, cd: 1.6, dmg: 5 }, { kind: 'stone', range: 720, min: 180, cd: 6, dmg: 16, splash: 70 }];
    this.castle = add('ally', 'castle', 90, 1e9, castleW, { targetable: false, invuln: true });
    this.fort = add('enemy', 'fortress', this.ebx + 60, cfg.baseHp, castleW, { invuln: !!cfg.free });
    if (cfg.towers) {
      var thp = 220 + 40 * idx, a = Math.round(this.world * 0.10), b = Math.round(this.world * 0.25);
      [['ally', a, 'tower1'], ['ally', b, 'tower2'], ['enemy', this.world - a, 'tower1'], ['enemy', this.world - b, 'tower2']].forEach(function (t) {
        add(t[0], t[2], t[1], thp, t[2] === 'tower1' ? [{ kind: 'arrow', range: 360, cd: 1.1, dmg: 4 }] : [{ kind: 'stone', range: 520, min: 140, cd: 4.2, dmg: 20, splash: 65 }], { tower: true });
      });
    }
  };
  P.structById = function (id) { for (var i = 0; i < this.structs.length; i++) if (this.structs[i].id === id) return this.structs[i]; return null; };
  P.hurtStruct = function (s, amount) {
    if (!s || !s.alive || s.invuln) return;
    s.hp -= amount; s.flash = 0.15; this.emit({ k: 'structhit', id: s.id, x: s.x, kind: s.kind });
    if (s.hp <= 0) {
      s.hp = 0; s.alive = false; s.rebuild = 0; this.emit({ k: 'structdown', id: s.id, x: s.x, kind: s.kind, side: s.side });
      if (s.kind === 'fortress') {
        this.emit({ k: 'basefall' });
        if (this.status === 'running') { this.status = 'won'; this.emit({ k: 'end', win: true, base: true }); }
      }
    }
  };
  P.hurtStructsAt = function (x, r, amount, projSide) {
    for (var i = 0; i < this.structs.length; i++) {
      var s = this.structs[i];
      if (s.side !== projSide && s.alive && s.targetable && Math.abs(s.x - x) <= r + 30) this.hurtStruct(s, amount);
    }
  };
  P.pickStruct = function (u) {
    var best = null, bd = 1e9;
    for (var i = 0; i < this.structs.length; i++) {
      var s = this.structs[i]; if (s.side === u.side || !s.alive || !s.targetable) continue;
      var d = Math.abs(s.x - u.x);
      if (d <= u.range + 24 && !(u.minRange && d < u.minRange) && d < bd) { bd = d; best = s; }
    }
    return best;
  };
  P.updateStructs = function (dt) {
    for (var i = 0; i < this.structs.length; i++) {
      var s = this.structs[i];
      if (s.flash > 0) s.flash -= dt;
      if (!s.alive) {
        if (s.tower) { s.rebuild += dt / TOWER_REBUILD; if (s.rebuild >= 1) { s.alive = true; s.hp = s.max; s.rebuild = 0; this.emit({ k: 'structup', id: s.id, x: s.x, kind: s.kind }); } }
        continue;
      }
      for (var j = 0; j < s.weapons.length; j++) {
        var w = s.weapons[j]; w.t -= dt; if (w.t > 0) continue;
        var foe = null, bd = 1e9;
        for (var k = 0; k < this.units.length; k++) {
          var o = this.units[k]; if (o.side === s.side || o.state === 'dying' || o.state === 'fall' || o.dead) continue;
          var d = Math.abs(o.x - s.x); if (d <= w.range && d >= w.min && d < bd) { bd = d; foe = o; }
        }
        if (!foe) { w.t = 0.25; continue; }
        w.t = w.cd;
        var stone = w.kind === 'stone', dist = Math.abs(foe.x - s.x);
        this.proj.push({ id: this.nid++, kind: w.kind, x0: s.x, y0: s.tower ? -78 : -70, x1: foe.x, y1: foe.y, t: 0, dur: Math.max(0.25, dist / (stone ? 300 : 520)), side: s.side,
          owner: { type: stone ? 'catapult' : 'archer', atk: w.dmg, magic: false }, tgt: stone ? 0 : foe.id, base: false, splash: w.splash, fromStruct: s.id });
        this.emit({ k: 'shot', kind: w.kind, x: s.x, y: 0, side: s.side, struct: true });
      }
    }
  };
  P.emit = function (e) { if (!this.noEvents) { this.events.push(e); if (this.events.length > 400) this.events.shift(); } };
  P.key = function (c, r) { return c + ',' + r; };
  P.inBoard = function (c, r) { return c >= 0 && r >= 0 && c < this.cols && r < this.rows; };
  P.isHeart = function (c, r) { return c === this.heart.c && r === this.heart.r; };
  P.isHole = function (c, r) { return !!this.holes[c + ',' + r]; };
  P.gearAt = function (c, r) { var id = this.grid[c + ',' + r]; return id ? this.gearById(id) : null; };
  P.gearById = function (id) { for (var i = 0; i < this.gears.length; i++) if (this.gears[i].id === id) return this.gears[i]; return null; };
  P.isFree = function (c, r) { return this.inBoard(c, r) && !this.isHeart(c, r) && !this.isHole(c, r) && !this.grid[c + ',' + r]; };
  P.dropX = function (c) { return F.DROP_X0 + (c + 0.5) / this.cols * F.DROP_SPAN; };

  // ---- gears -------------------------------------------------------------------------------
  P.addGear = function (type, level, c, r, locked) {
    var g = { id: this.nid++, type: type, level: level, c: c, r: r, charge: 0, locked: !!locked, rate: 0, active: false, pulse: 0, ready: false };
    this.gears.push(g); this.grid[c + ',' + r] = g.id; return g;
  };
  P.removeGear = function (g) {
    this.gears.splice(this.gears.indexOf(g), 1); delete this.grid[g.c + ',' + g.r];
  };
  P.canMerge = function (a, b) {
    return a && b && a !== b && a.type === b.type && a.level === b.level && a.level < F.MAXLEVEL && !a.locked && !b.locked;
  };
  P.sellValue = function (g) { return Math.floor(F.gearCost(g.type) * Math.pow(2, g.level - 1) * 0.5); };

  // Which gears get ticks from which side of the heart, and how many (multiplier gears multiply what passes through).
  P.recompute = function () {
    var self = this;
    this.gears.forEach(function (g) { g.rate = 0; g.active = false; });
    for (var s = 0; s < 4; s++) {
      var gain = {}; this.sideGain[s] = gain;
      var first = this.gearAt(this.heart.c + DIRS[s][0], this.heart.r + DIRS[s][1]);
      if (!first) continue;
      gain[first.id] = 1;
      var queue = [first];
      while (queue.length) {
        var g = queue.shift();
        var out = gain[g.id] * (g.type === 'mult' ? F.MULTV[g.level - 1] : 1);
        for (var d = 0; d < 4; d++) {
          var nc = g.c + DIRS[d][0], nr = g.r + DIRS[d][1];
          if (self.isHeart(nc, nr)) continue;
          var h = self.gearAt(nc, nr);
          if (h && (gain[h.id] || 0) < out) { gain[h.id] = out; queue.push(h); }
        }
      }
      for (var id in gain) { var gg = this.gearById(+id); gg.rate += gain[id]; gg.active = true; }
    }
  };

  // ---- the tray and the shop ---------------------------------------------------------------
  P.rollOne = function () {
    var pool = this.pool, w = pool.map(function (t) { return t === 'mult' ? 0.7 : t === 'boss' ? 0.35 : F.UNITS[t] ? 1 : 0.8; });
    var tot = w.reduce(function (a, b) { return a + b; }, 0), x = this.rnd() * tot;
    for (var i = 0; i < pool.length; i++) { x -= w[i]; if (x <= 0) return pool[i]; }
    return pool[0];
  };
  P.rollTray = function () {
    for (var i = 0; i < 3; i++) this.tray[i] = this.rollOne();
    // always offer at least one fighter so a tray is never all specials
    if (!this.tray.some(function (t) { return F.UNITS[t]; })) this.tray[0] = this.cfg.pool[this.cfg.pool.length - 1];
  };
  P.refreshTray = function () {
    var cost = 10; if (this.coins < cost) return false;
    var old = this.tray.slice(); this.coins -= cost; this.spent += cost; this.rollTray();
    var self = this; this.undo.push(function () { self.tray = old; self.coins += cost; self.spent -= cost; });
    return true;
  };
  P.buy = function (slot, c, r) {
    var type = this.tray[slot];
    if (!type) return 'none';
    if (!this.isFree(c, r)) return 'blocked';
    var cost = F.gearCost(type);
    if (this.coins < cost) return 'poor';
    this.coins -= cost; this.spent += cost;
    var g = this.addGear(type, 1, c, r, false);
    var prev = type, self = this;
    this.tray[slot] = this.rollOne();
    this.recompute();
    this.emit({ k: 'place', id: g.id });
    this.undo.push(function () { self.removeGear(self.gearById(g.id) || g); self.coins += cost; self.spent -= cost; self.tray[slot] = prev; self.recompute(); });
    return 'ok';
  };
  // Move a gear; on a gear of the same kind it merges, on another it swaps. Returns 'moved' | 'merged' | 'swapped' | 'no'.
  P.moveGear = function (g, c, r) {
    if (!g || g.locked || !this.inBoard(c, r) || this.isHeart(c, r) || this.isHole(c, r)) return 'no';
    if (g.c === c && g.r === r) return 'no';
    var other = this.gearAt(c, r), self = this, oc = g.c, or = g.r;
    if (!other) {
      delete this.grid[g.c + ',' + g.r]; g.c = c; g.r = r; this.grid[c + ',' + r] = g.id; this.recompute();
      this.undo.push(function () { delete self.grid[g.c + ',' + g.r]; g.c = oc; g.r = or; self.grid[oc + ',' + or] = g.id; self.recompute(); });
      return 'moved';
    }
    if (this.canMerge(g, other)) {
      var oldLevel = other.level, oldCharge = other.charge, goldCharge = g.charge;
      var gc = g.c, gr = g.r, gid = g.id;
      this.removeGear(g); other.level++; other.charge = Math.min(other.charge, Math.max(0, F.ticksNeeded(other.type, other.level) - 1));
      this.recompute(); this.emit({ k: 'merge', id: other.id, level: other.level });
      this.undo.push(function () {
        other.level = oldLevel; other.charge = oldCharge;
        var back = { id: gid, type: other.type, level: oldLevel, c: gc, r: gr, charge: goldCharge, locked: false, rate: 0, active: false, pulse: 0, ready: false };
        self.gears.push(back); self.grid[gc + ',' + gr] = gid; self.recompute();
      });
      return 'merged';
    }
    if (other.locked) return 'no';
    // swap places
    this.grid[g.c + ',' + g.r] = other.id; this.grid[c + ',' + r] = g.id;
    other.c = g.c; other.r = g.r; g.c = c; g.r = r; this.recompute();
    this.undo.push(function () {
      self.grid[g.c + ',' + g.r] = other.id; self.grid[other.c + ',' + other.r] = g.id;
      var tc = g.c, tr = g.r; g.c = other.c; g.r = other.r; other.c = tc; other.r = tr; self.recompute();
    });
    return 'swapped';
  };
  P.sellGear = function (g) {
    if (!g || g.locked) return false;
    var v = this.sellValue(g), self = this, copy = Object.assign({}, g);
    this.removeGear(g); this.coins += v; this.recompute();
    this.undo.push(function () { self.gears.push(copy); self.grid[copy.c + ',' + copy.r] = copy.id; self.coins -= v; self.recompute(); });
    return true;
  };
  P.undoLast = function () { var u = this.undo.pop(); if (u) { u(); return true; } return false; };

  // ---- waves -------------------------------------------------------------------------------
  P.start = function () { if (this.status === 'build') { this.status = 'running'; this.waveTimer = 0; } };
  P.callNext = function () { if (this.status === 'running' && this.waveIdx + 1 < this.waveCount) this.waveTimer = 0; };
  P.waveAt = function (k) {
    if (this.cfg.free) {
      var w = this.cfg.genWave(k);
      if ((k + 1) % this.cfg.bossEvery === 0) {
        var t = this.cfg.pool[this.cfg.pool.length - 1 - (k % 3)];
        w.spawn.push({ type: t, boss: true, at: (w.spawn.length ? w.spawn[w.spawn.length - 1].at : 0) + 3 });
      }
      return w;
    }
    return this.cfg.waves[k];
  };
  P.launchWave = function () {
    this.waveIdx++;
    var w = this.waveAt(this.waveIdx), self = this;
    w.spawn.forEach(function (s) { self.queue.push({ at: self.t + s.at, type: s.type, boss: s.boss }); });
    this.emit({ k: 'wave', n: this.waveIdx + 1, total: this.waveCount, boss: w.spawn.some(function (s) { return s.boss; }) });
    this.waveTimer = this.waveIdx + 1 < this.waveCount ? F.waveGap(this.cfg.idx) * (this.cfg.quick ? 0.7 : 1) : Infinity;
  };

  // ---- units -------------------------------------------------------------------------------
  P.makeUnit = function (side, type, level, x, boss) {
    var d = F.UNITS[type], sm = F.SM[level - 1], es = side === 'enemy' ? this.es : { hp: 1, atk: 1, def: 1 };
    var hp = d.hp * sm * es.hp, atk = d.atk * sm * es.atk, def = d.def * (1 + 0.4 * (level - 1)) * es.def, spd = d.speed, sc = 1 + (level - 1) * 0.1;
    var special = side === 'ally' && this.specialty === type;
    if (special) { hp *= F.SPECIALTY_BONUS; atk *= F.SPECIALTY_BONUS; }
    if (boss) { hp *= 9; atk *= 2.2; def *= 1.6; spd *= 0.85; sc = 2.8; }
    var u = { id: this.nid++, side: side, type: type, level: level, boss: !!boss, x: x, y: this.rnd() * 52, hp: hp, max: hp, atk: atk, def: def,
      range: d.range * (boss ? 1.25 : 1), minRange: d.minRange || 0, speed: spd, cdMax: d.cd, cd: 0.3 + this.rnd() * 0.4, state: 'fall', t: 0,
      anim: 'fall', at: 0, hitDone: false, special: special, tgt: 0, dir: side === 'ally' ? 1 : -1, scale: sc, charged: false, flash: 0, phase: this.rnd() * 6.28, dead: false, vx: 0 };
    this.units.push(u); return u;
  };

  function dmgFrom(atk, a, t, d) {   // a = attacker spec {type, atk, magic}, t = target unit, d = data
    var A = F.UNITS[a.type], T = F.UNITS[t.type], m = 1;
    if (A.vs && A.vs[t.type]) m *= A.vs[t.type];
    if (A.kind === 'ranged' && T.shield) m *= T.shield;
    var def = t.def * (A.magic ? 0.4 : 1);
    return atk * m * 40 / (40 + def);
  }
  P.hurt = function (t, amount, src) {
    if (t.dead || t.state === 'dying') return;
    t.hp -= amount; t.flash = 0.18;
    this.emit({ k: 'hit', x: t.x, y: t.y, dmg: amount, side: t.side, type: t.type, big: amount > t.max * 0.25 });
    if (t.hp <= 0) this.kill(t);
  };
  P.kill = function (t) {
    t.state = 'dying'; t.anim = 'die'; t.t = 0; t.hp = 0;
    if (t.side === 'enemy') {
      var b = F.bounty(t.type, t.boss);
      this.coins += b; this.earned += b; this.kills++;
      this.emit({ k: 'coin', x: t.x, y: t.y, n: b });
    }
    this.emit({ k: 'die', x: t.x, y: t.y, side: t.side, type: t.type, boss: t.boss });
  };
  P.foes = function (u) { var s = u.side === 'ally' ? 'enemy' : 'ally'; return this.units.filter(function (o) { return o.side === s && o.state !== 'dying' && o.state !== 'fall' && !o.dead; }); };

  P.pickTarget = function (u) {
    var foes = this.foes(u), best = null, bs = 1e9, i, o, dx, score;
    var D = F.UNITS[u.type];
    for (i = 0; i < foes.length; i++) {
      o = foes[i]; dx = Math.abs(o.x - u.x);
      if (u.minRange && dx < u.minRange) continue;
      var reach = D.hunts ? 480 : Math.max(u.range, 150);
      if (dx > reach) continue;
      score = dx;
      if (D.hunts && F.UNITS[o.type].kind === 'ranged') score -= 400;
      if (score < bs) { bs = score; best = o; }
    }
    return best;
  };
  P.tooClose = function (u) {
    if (!u.minRange) return false;
    var foes = this.foes(u);
    for (var i = 0; i < foes.length; i++) if (Math.abs(foes[i].x - u.x) < u.minRange) return true;
    return false;
  };

  P.updateUnit = function (u, dt) {
    u.t += dt; u.cd -= dt; if (u.flash > 0) u.flash -= dt;
    if (u.state === 'dying') { if (u.t > 0.75) u.dead = true; return; }
    if (u.state === 'fall') { if (u.t >= 0.55) { u.state = 'getup'; u.t = 0; this.emit({ k: 'land', x: u.x, y: u.y, side: u.side }); } return; }
    if (u.state === 'getup') { u.anim = 'getup'; if (u.t >= 0.45) { u.state = 'go'; u.t = 0; } return; }
    var D = F.UNITS[u.type];
    if (u.anim === 'attack') {
      u.at += dt;
      var wind = Math.min(0.5, u.cdMax * 0.45) * 0.7;
      if (!u.hitDone && u.at >= wind) { u.hitDone = true; this.fire(u); }
      if (u.at >= Math.min(0.55, u.cdMax * 0.5)) { u.anim = 'idle'; }
      return;
    }
    var target = this.pickTarget(u), dir = u.dir, dist;
    var st = target ? null : this.pickStruct(u);
    if (target || st) {
      dist = st ? Math.abs(st.x - u.x) : Math.abs(target.x - u.x);
      if (!st && dist > u.range) {
        u.x += dir * u.speed * dt; u.anim = 'walk';
      } else if (u.cd <= 0) {
        u.anim = 'attack'; u.at = 0; u.hitDone = false; u.tgt = st ? 0 : target.id; u.tgtS = st ? st.id : 0; u.cd = u.cdMax;
      } else u.anim = 'idle';
      u.facing = Math.sign((st ? st.x : target.x) - u.x) || u.dir;
    } else {
      if (this.tooClose(u)) { u.x -= dir * u.speed * 0.6 * dt; u.anim = 'walk'; }
      else if (u.side === 'ally' && u.x >= this.ebx + 50) u.anim = 'idle';
      else { u.x += dir * u.speed * dt; u.anim = 'walk'; }
    }
    if (u.side === 'enemy' && u.x <= F.BASE_X) {         // got through: one life
      var cost = u.boss ? 5 : 1; this.lives -= cost; this.leaks += cost; u.dead = true;
      this.emit({ k: 'leak', x: u.x, n: cost, boss: u.boss });
      if (this.lives <= 0) { this.lives = 0; this.status = 'lost'; this.emit({ k: 'end', win: false }); }
    }
    if (u.x < 40) u.x = 40; if (u.x > this.world - 20) u.x = this.world - 20;
  };

  // the moment of a hit or a shot
  P.fire = function (u) {
    var D = F.UNITS[u.type], t = null, i;
    if (u.tgt > 0) for (i = 0; i < this.units.length; i++) if (this.units[i].id === u.tgt) t = this.units[i];
    var S2 = u.tgtS ? this.structById(u.tgtS) : null;
    if (!t && !S2) return;
    if (t && (t.dead || t.state === 'dying')) return;
    if (S2 && !S2.alive) return;
    var power = u.atk * (D.charge && !u.charged ? D.charge : 1);
    if (D.charge) u.charged = true;
    if (D.kind === 'ranged') {
      var tx = S2 ? S2.x : t.x, ty = S2 ? 0 : t.y;
      var dist = Math.abs(tx - u.x);
      var kind = u.type === 'archer' ? 'arrow' : u.type === 'mage' ? 'bolt' : 'stone';
      var speed = kind === 'arrow' ? 520 : kind === 'bolt' ? 420 : 300;
      this.proj.push({ id: this.nid++, kind: kind, x0: u.x, y0: u.y, x1: tx, y1: ty, t: 0, dur: Math.max(0.2, dist / speed), side: u.side,
        owner: { type: u.type, atk: power, magic: !!D.magic }, tgt: t ? t.id : 0, tgtS: S2 ? S2.id : 0, base: false, splash: (D.splash || 0) * (u.boss ? 1.4 : 1), boss: u.boss });
      this.emit({ k: 'shot', kind: kind, x: u.x, y: u.y, side: u.side });
      return;
    }
    if (S2) { this.hurtStruct(S2, power * (D.siege || 1.3)); this.emit({ k: 'slash', x: S2.x, y: 0, side: u.side }); return; }
    var dm = dmgFrom(power, { type: u.type }, t);
    this.hurt(t, dm, u);
    this.emit({ k: 'slash', x: t.x, y: t.y, from: u.x, side: u.side, type: u.type });
  };
  P.hitBase = function (amount) { this.hurtStruct(this.fort, amount); };

  P.updateProj = function (p, dt) {
    p.t += dt;
    if (p.kind === 'shuriken') {
      p.x0 += 210 * dt; p.life -= dt;
      var foes = this.units.filter(function (o) { return o.side === 'enemy' && o.state !== 'dying' && o.state !== 'fall' && !o.dead; });
      for (var i = 0; i < foes.length; i++) {
        var o = foes[i];
        if (Math.abs(o.x - p.x0) < 38 * (p.scale || 1) && (!p.hit[o.id] || this.t - p.hit[o.id] > 0.6)) {
          p.hit[o.id] = this.t; this.hurt(o, p.dmg * 40 / (40 + o.def), null); this.emit({ k: 'slash', x: o.x, y: o.y, side: 'ally', type: 'shuriken' });
        }
      }
      for (var si = 0; si < this.structs.length; si++) { var ss = this.structs[si]; if (ss.side === 'enemy' && ss.alive && ss.targetable && !p.hitS[ss.id] && Math.abs(ss.x - p.x0) < 50) { p.hitS[ss.id] = true; this.hurtStruct(ss, p.dmg * 3); } }
      if (p.life <= 0 || p.x0 >= this.world - 60) p.done = true;
      return;
    }
    if (p.tgt && p.kind !== 'stone') { for (var j = 0; j < this.units.length; j++) if (this.units[j].id === p.tgt && !this.units[j].dead && this.units[j].state !== 'dying') { p.x1 = this.units[j].x; p.y1 = this.units[j].y; } }
    if (p.t < p.dur) return;
    p.done = true;
    var L = this, foes2 = p.side === 'ally' ? 'enemy' : 'ally';
    if (p.splash) {
      this.emit({ k: 'boom', x: p.x1, y: p.y1, r: p.splash, kind: p.kind });
      var hits = this.units.filter(function (o) { return o.side === foes2 && o.state !== 'dying' && o.state !== 'fall' && !o.dead && Math.abs(o.x - p.x1) <= p.splash; });
      hits.forEach(function (o) {
        var fall = 1 - Math.abs(o.x - p.x1) / (p.splash * 1.4);
        L.hurt(o, dmgFrom(p.owner.atk, p.owner, o) * fall, null);
      });
      this.hurtStructsAt(p.x1, p.splash, p.owner.atk * (F.UNITS[p.owner.type].siege || 1) * (p.fromStruct ? 0.5 : 1), p.side);
    } else {
      var tu = null; for (var m = 0; m < this.units.length; m++) if (this.units[m].id === p.tgt) tu = this.units[m];
      if (tu && !tu.dead && tu.state !== 'dying') this.hurt(tu, dmgFrom(p.owner.atk, p.owner, tu), null);
      else if (p.tgtS) this.hurtStruct(this.structById(p.tgtS), p.owner.atk * (F.UNITS[p.owner.type].siege || 1));
      this.emit({ k: 'arrowhit', x: p.x1, y: p.y1, kind: p.kind });
    }
  };

  // ---- gears produce things -----------------------------------------------------------------
  // Gears fill smoothly as the heart turns: a quarter turn is one tick, and a gear gets `rate` ticks per quarter turn.
  P.fillGears = function (qt) {
    for (var i = 0; i < this.gears.length; i++) {
      var g = this.gears[i];
      if (g.rate > 0 && g.type !== 'mult') { g.charge += g.rate * qt; this.produce(g); }
    }
  };
  P.produce = function (g) {
    var need = F.ticksNeeded(g.type, g.level); if (!need) return;
    var allies = 0; for (var i = 0; i < this.units.length; i++) if (this.units[i].side === 'ally') allies++;
    var guard = 0;
    while (g.charge >= need && guard++ < 6) {
      if (F.UNITS[g.type]) {
        if (allies >= F.MAX_UNITS) { g.charge = need; return; }
        var x = this.dropX(g.c) + (this.rnd() - 0.5) * 24;
        var u = this.makeUnit('ally', g.type, g.level, x, false);
        u.gc = g.c; u.gr = g.r; allies++;
        this.emit({ k: 'pop', gear: g.id, c: g.c, r: g.r, unit: u.id, type: g.type, level: g.level });
        g.charge -= need;
      } else if (g.type === 'boss') {
        if (allies >= F.MAX_UNITS) { g.charge = need; return; }
        var ct = this.cfg.pool[this.cfg.pool.length - 1], bu = this.makeUnit('ally', ct, g.level, this.dropX(g.c), true);
        bu.champ = true; bu.scale = 2.4; bu.hp = bu.max = bu.max * 0.9; allies++;
        this.emit({ k: 'pop', gear: g.id, c: g.c, r: g.r, unit: bu.id, type: ct, level: g.level, champ: true });
        g.charge -= need;
      } else if (!this.special(g)) { g.charge = need; g.ready = true; return; }
      else { g.charge -= need; g.ready = false; }
    }
  };
  P.special = function (g) {
    var S = F.SPECIALS[g.type], sm = F.SM[g.level - 1];
    var foes = this.units.filter(function (o) { return o.side === 'enemy' && o.state !== 'dying' && o.state !== 'fall' && !o.dead; });
    if (!foes.length) return false;
    foes.sort(function (a, b) { return a.x - b.x; });
    if (g.type === 'lightning') {
      var n = Math.min(foes.length, S.strikes + g.level - 1);
      for (var i = 0; i < n; i++) {
        this.hurt(foes[i], S.dmg * sm * (foes[i].boss ? 0.6 : 1), null);
        this.emit({ k: 'bolt', x: foes[i].x, y: foes[i].y, c: g.c, r: g.r });
      }
      return true;
    }
    if (g.type === 'rocket') {
      var t = foes[0], rk = Math.min(foes.length, 1 + (g.level > 2 ? 1 : 0));
      for (var j = 0; j < rk; j++) {
        this.proj.push({ id: this.nid++, kind: 'rocket', x0: this.dropX(g.c), y0: -300, x1: foes[j].x, y1: foes[j].y, t: 0, dur: 0.7, side: 'ally',
          owner: { type: 'mage', atk: S.dmg * sm, magic: true }, tgt: 0, base: false, splash: S.splash, c: g.c, r: g.r, rocketOwner: true });
      }
      this.emit({ k: 'launch', c: g.c, r: g.r });
      return true;
    }
    if (g.type === 'shuriken') {
      this.proj.push({ id: this.nid++, kind: 'shuriken', x0: this.dropX(g.c), y0: 0, t: 0, life: 9, dmg: S.dmg * sm, hit: {}, hitS: {}, scale: 1 + (g.level - 1) * 0.25, side: 'ally' });
      this.emit({ k: 'launch', c: g.c, r: g.r });
      return true;
    }
    return false;
  };

  // ---- the main step -------------------------------------------------------------------------
  P.step = function (dt) {
    if (this.status === 'won' || this.status === 'lost') return;
    var i;
    this.t += dt;
    // the heart turns smoothly (even before the first wave, so Felix sees it work) and the gears fill as it turns
    var dA = dt * 2 * Math.PI / this.heartPeriod; this.heartA += dA;
    this.fillGears(dA / (Math.PI / 2));
    if (this.status === 'running') {
      this.waveTimer -= dt;
      if (this.waveTimer <= 0 && this.waveIdx + 1 < this.waveCount) this.launchWave();
      for (i = this.queue.length - 1; i >= 0; i--) {
        var q = this.queue[i];
        if (this.t >= q.at && this.enemiesAlive() < F.MAX_UNITS) {
          var e = this.makeUnit('enemy', q.type, 1, this.ebx + 20, q.boss);
          e.state = 'go'; e.anim = 'walk'; this.queue.splice(i, 1);
          this.emit({ k: 'enemy', unit: e.id, boss: q.boss });
        }
      }
    }
    this.updateStructs(dt);
    for (i = 0; i < this.units.length; i++) this.updateUnit(this.units[i], dt);
    for (i = 0; i < this.proj.length; i++) this.updateProj(this.proj[i], dt);
    this.units = this.units.filter(function (u) { return !u.dead; });
    this.proj = this.proj.filter(function (p) { return !p.done; });
  };
  P.update = function (dt) {
    this.acc += dt * this.speed;
    var n = 0;
    while (this.acc >= STEP && n++ < 12) { this.step(STEP); this.acc -= STEP; }
    if (n >= 12) this.acc = 0;
  };
  P.stars = function () {
    if (this.status !== 'won') return 0;
    var f = this.leaks / this.maxLives;
    return f <= 0.1 ? 3 : f <= 0.4 ? 2 : 1;
  };
  P.enemiesAlive = function () { return this.units.filter(function (u) { return u.side === 'enemy'; }).length; };
  P.alliesAlive = function () { return this.units.filter(function (u) { return u.side === 'ally'; }).length; };

  F.Sim = Sim;
})();
