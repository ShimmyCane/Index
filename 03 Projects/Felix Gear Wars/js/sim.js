// Felix Gear Wars: the game rules. No DOM and no drawing, so tools/balance_sim.js can run it in Node.
// The screen reads sim.units / sim.gears / sim.proj and drains sim.events (pops, hits, coins...) each frame.
(function () {
  'use strict';
  var F = globalThis.FGW;
  var DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];   // heart sides: E, S, W, N (clockwise from east)
  var STEP = 1 / 30;
  var MAX_ALLIES = 90;

  function Sim(cfg, o) {
    o = o || {};
    this.cfg = cfg; this.o = o;
    this.rnd = F.rng(o.seed || cfg.seed || 1);
    this.noEvents = !!o.noEvents;
    this.t = 0; this.acc = 0; this.speed = 1; this.nid = 1; this.events = [];
    this.cols = cfg.board.cols; this.rows = cfg.board.rows;
    this.heart = { c: cfg.board.heart.c, r: cfg.board.heart.r };
    this.heartA = -0.35;                       // total angle turned (radians); the mark ticks every quarter turn
    this.lastBoundary = Math.floor(this.heartA / (Math.PI / 2));
    this.heartPeriod = o.heartPeriod || F.HEART_PERIOD;
    this.holes = {}; cfg.board.holes.forEach(function (h) { this.holes[h[0] + ',' + h[1]] = true; }, this);
    this.grid = {}; this.gears = []; this.units = []; this.proj = [];
    this.coins = cfg.coins; this.maxLives = cfg.lives; this.lives = cfg.lives;
    this.status = 'build';                     // build | running | won | lost
    this.waveIdx = -1; this.queue = []; this.waveTimer = Infinity; this.waveCount = cfg.free ? Infinity : cfg.waves.length;
    this.baseMax = cfg.baseHp; this.baseHp = cfg.baseHp;
    this.leaks = 0; this.kills = 0; this.earned = 0; this.spent = 0; this.undo = [];
    this.es = F.enemyScale(cfg.idx);
    this.pool = cfg.pool.concat(cfg.specials || []);
    this.pool.push('mult');
    this.tray = [null, null, null];
    this.sideGain = [{}, {}, {}, {}];
    this.rollTray();
    var self = this;
    cfg.board.dormant.forEach(function (d) { self.addGear(d.type, d.level, d.c, d.r, true); });
    this.recompute();
  }

  var P = Sim.prototype;
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
    var pool = this.pool, w = pool.map(function (t) { return t === 'mult' ? 0.7 : F.UNITS[t] ? 1 : 0.8; });
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
    if (boss) { hp *= 9; atk *= 2.2; def *= 1.6; spd *= 0.85; sc = 2.8; }
    var u = { id: this.nid++, side: side, type: type, level: level, boss: !!boss, x: x, y: this.rnd() * 52, hp: hp, max: hp, atk: atk, def: def,
      range: d.range * (boss ? 1.25 : 1), minRange: d.minRange || 0, speed: spd, cdMax: d.cd, cd: 0.3 + this.rnd() * 0.4, state: 'fall', t: 0,
      anim: 'fall', at: 0, hitDone: false, tgt: 0, dir: side === 'ally' ? 1 : -1, scale: sc, charged: false, flash: 0, phase: this.rnd() * 6.28, dead: false, vx: 0 };
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
    var baseTarget = false;
    if (!target && u.side === 'ally') {
      var bd = F.ENEMY_BASE_X - u.x;
      if (bd <= u.range && this.baseHp > 0 && !(u.minRange && bd < u.minRange)) baseTarget = true;
    }
    if (target || baseTarget) {
      dist = baseTarget ? F.ENEMY_BASE_X - u.x : Math.abs(target.x - u.x);
      if (dist > u.range && !baseTarget) {
        u.x += dir * u.speed * dt; u.anim = 'walk';
      } else if (u.cd <= 0) {
        u.anim = 'attack'; u.at = 0; u.hitDone = false; u.tgt = baseTarget ? -1 : target.id; u.cd = u.cdMax;
      } else u.anim = 'idle';
      if (target) u.facing = Math.sign(target.x - u.x) || u.dir;
    } else {
      if (this.tooClose(u)) { u.x -= dir * u.speed * 0.6 * dt; u.anim = 'walk'; }
      else if (u.side === 'ally' && u.x >= F.ENEMY_BASE_X - 30) u.anim = 'idle';
      else { u.x += dir * u.speed * dt; u.anim = 'walk'; }
    }
    if (u.side === 'enemy' && u.x <= F.BASE_X) {         // got through: one life
      var cost = u.boss ? 5 : 1; this.lives -= cost; this.leaks += cost; u.dead = true;
      this.emit({ k: 'leak', x: u.x, n: cost, boss: u.boss });
      if (this.lives <= 0) { this.lives = 0; this.status = 'lost'; this.emit({ k: 'end', win: false }); }
    }
    if (u.x < 40) u.x = 40; if (u.x > F.WORLD - 20) u.x = F.WORLD - 20;
  };

  // the moment of a hit or a shot
  P.fire = function (u) {
    var D = F.UNITS[u.type], t = null, i;
    if (u.tgt > 0) for (i = 0; i < this.units.length; i++) if (this.units[i].id === u.tgt) t = this.units[i];
    var base = u.tgt === -1;
    if (!t && !base) return;
    if (t && (t.dead || t.state === 'dying')) return;
    var power = u.atk * (D.charge && !u.charged ? D.charge : 1);
    if (D.charge) u.charged = true;
    if (D.kind === 'ranged') {
      var tx = base ? F.ENEMY_BASE_X : t.x, ty = base ? 0 : t.y;
      var dist = Math.abs(tx - u.x);
      var kind = u.type === 'archer' ? 'arrow' : u.type === 'mage' ? 'bolt' : 'stone';
      var speed = kind === 'arrow' ? 520 : kind === 'bolt' ? 420 : 300;
      this.proj.push({ id: this.nid++, kind: kind, x0: u.x, y0: u.y, x1: tx, y1: ty, t: 0, dur: Math.max(0.2, dist / speed), side: u.side,
        owner: { type: u.type, atk: power, magic: !!D.magic }, tgt: t ? t.id : 0, base: base, splash: (D.splash || 0) * (u.boss ? 1.4 : 1), boss: u.boss });
      this.emit({ k: 'shot', kind: kind, x: u.x, y: u.y, side: u.side });
      return;
    }
    if (base) { this.hitBase(power * (D.siege || 1)); this.emit({ k: 'slash', x: F.ENEMY_BASE_X, y: 0, side: u.side }); return; }
    var dm = dmgFrom(power, { type: u.type }, t);
    this.hurt(t, dm, u);
    this.emit({ k: 'slash', x: t.x, y: t.y, from: u.x, side: u.side, type: u.type });
  };
  P.hitBase = function (amount) {
    if (this.baseHp <= 0 || this.cfg.free) return;
    this.baseHp -= amount; this.emit({ k: 'basehit', n: amount });
    if (this.baseHp <= 0) {
      this.baseHp = 0; this.emit({ k: 'basefall' });
      if (this.status === 'running') { this.status = 'won'; this.emit({ k: 'end', win: true, base: true }); }
    }
  };

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
      if (p.x0 >= F.ENEMY_BASE_X - 40 && !p.hitBase) { p.hitBase = true; this.hitBase(p.dmg * 3); }
      if (p.life <= 0 || p.x0 >= F.ENEMY_BASE_X - 30) p.done = true;
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
      if (p.side === 'ally' && Math.abs(F.ENEMY_BASE_X - p.x1) <= p.splash + 60) this.hitBase(p.owner.atk * (F.UNITS[p.owner.type].siege || 1));
    } else {
      var tu = null; for (var m = 0; m < this.units.length; m++) if (this.units[m].id === p.tgt) tu = this.units[m];
      if (tu && !tu.dead && tu.state !== 'dying') this.hurt(tu, dmgFrom(p.owner.atk, p.owner, tu), null);
      else if (p.base) this.hitBase(p.owner.atk);
      this.emit({ k: 'arrowhit', x: p.x1, y: p.y1, kind: p.kind });
    }
  };

  // ---- gears produce things -----------------------------------------------------------------
  P.heartTick = function (side) {
    var gain = this.sideGain[side], id, g;
    this.emit({ k: 'tick', side: side });
    for (id in gain) {
      g = this.gearById(+id); if (!g) continue;
      g.pulse = 1;
      if (g.type === 'mult') continue;
      g.charge += gain[id];
    }
    for (id in gain) { g = this.gearById(+id); if (g) this.produce(g); }
  };
  P.produce = function (g) {
    var need = F.ticksNeeded(g.type, g.level); if (!need) return;
    var allies = 0; for (var i = 0; i < this.units.length; i++) if (this.units[i].side === 'ally') allies++;
    var guard = 0;
    while (g.charge >= need && guard++ < 6) {
      if (F.UNITS[g.type]) {
        if (allies >= MAX_ALLIES) { g.charge = need; return; }
        var x = this.dropX(g.c) + (this.rnd() - 0.5) * 24;
        var u = this.makeUnit('ally', g.type, g.level, x, false);
        u.gc = g.c; u.gr = g.r; allies++;
        this.emit({ k: 'pop', gear: g.id, c: g.c, r: g.r, unit: u.id, type: g.type, level: g.level });
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
      this.proj.push({ id: this.nid++, kind: 'shuriken', x0: this.dropX(g.c), y0: 0, t: 0, life: 9, dmg: S.dmg * sm, hit: {}, scale: 1 + (g.level - 1) * 0.25, side: 'ally' });
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
    // the heart turns and ticks (even before the first wave, so Felix sees it work)
    this.heartA += dt * 2 * Math.PI / this.heartPeriod;
    var b = Math.floor(this.heartA / (Math.PI / 2));
    while (this.lastBoundary < b) { this.lastBoundary++; this.heartTick(((this.lastBoundary % 4) + 4) % 4); }
    for (i = 0; i < this.gears.length; i++) { var g = this.gears[i]; if (g.pulse > 0) g.pulse -= dt * 3; }
    if (this.status === 'running') {
      this.waveTimer -= dt;
      if (this.waveTimer <= 0 && this.waveIdx + 1 < this.waveCount) this.launchWave();
      for (i = this.queue.length - 1; i >= 0; i--) {
        var q = this.queue[i];
        if (this.t >= q.at) {
          var e = this.makeUnit('enemy', q.type, 1, F.ENEMY_BASE_X + 20, q.boss);
          e.state = 'go'; e.anim = 'walk'; this.queue.splice(i, 1);
          this.emit({ k: 'enemy', unit: e.id, boss: q.boss });
        }
      }
    }
    for (i = 0; i < this.units.length; i++) this.updateUnit(this.units[i], dt);
    for (i = 0; i < this.proj.length; i++) this.updateProj(this.proj[i], dt);
    this.units = this.units.filter(function (u) { return !u.dead; });
    this.proj = this.proj.filter(function (p) { return !p.done; });
    if (this.status === 'running' && this.waveIdx + 1 >= this.waveCount && !this.queue.length && this.waveTimer === Infinity) {
      var enemies = this.units.some(function (u) { return u.side === 'enemy'; });
      if (!enemies) { this.status = 'won'; this.emit({ k: 'end', win: true }); }
    }
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
