// Expansion Wars — screens, game rules, computer players, drawing, input,
// progression, scoring, notes, the family sync panel and the saved-maps list.
(function () {
  'use strict';

  var M = window.ExpansionMap;
  var S = window.XWStore;
  var SPEED = 120;   // map units per second for marching soldiers
  var HIT = 46;      // tap radius around a spot (map units)
  var SEND_STEPS = [0.1, 0.25, 0.5, 1];   // share of a spot's soldiers sent per drop
  var LEVELS_AI = {
    easy:   { every: 3.0, fraction: 0.4, threshold: 10, perMinute: 6 },
    normal: { every: 1.8, fraction: 0.6, threshold: 7,  perMinute: 10 },
    hard:   { every: 1.0, fraction: 0.7, threshold: 5,  perMinute: 16 }
  };
  // City levels: growth rate (soldiers per second), garrison cap, and the soldiers needed to reach the level.
  var CITY_LEVELS = [
    { rate: 1.5, cap: 16, cost: 0 },
    { rate: 2.0, cap: 30, cost: 15 },
    { rate: 2.6, cap: 45, cost: 30 }
  ];
  var AVATARS = ['🐥', '🦆', '🐻', '🐿️', '🐭', '🦡'];   // one per player: chick, duckling, bear, gopher, mouse, badger
  var ICON = { factory: '🍄', city: '🏰' };
  var SVG_NS = 'http://www.w3.org/2000/svg';

  var SHOP = [
    { name: 'Cities 🏰', desc: 'Bigger garrisons and faster soldiers. Found from Level 1.', status: 'in' },
    { name: 'City upgrades', desc: 'Tap your city to upgrade it: faster growth and a bigger garrison cap.', status: 'in' },
    { name: 'Lakes 💧', desc: 'Water that soldiers cannot cross. Found from Level 2.', status: 'in' },
    { name: 'Voronoi maps', desc: 'Every map is a new layout of regions.', status: 'in' },
    { name: 'Send 10 to 100%', desc: 'Choose how much of a spot sends at once.', status: 'in' },
    { name: 'Routes through your own spots', desc: 'Soldiers march through your spots to reach a far target or reinforce one.', status: 'in' },
    { name: 'Fights on the road', desc: 'Soldiers marching toward each other fight when they meet.', status: 'in' },
    { name: 'Team mode', desc: 'Level 4 with Teams on: two teams of two.', status: 'in' },
    { name: 'Speed boosts', desc: 'Regions that send soldiers faster.', status: 'soon' },
    { name: 'Defense boosts', desc: 'Regions with stronger garrisons.', status: 'soon' },
    { name: 'Towers that shoot', desc: 'Defenders that hit marching soldiers.', status: 'soon' },
    { name: 'Spells', desc: 'One-time powers for a sudden push.', status: 'soon' },
    { name: 'Quick Game', desc: 'A smaller map for a short game.', status: 'soon' }
  ];

  function $(id) { return document.getElementById(id); }

  var els = {
    board: $('board'), roads: $('roads'), nodes: $('nodes'), armies: $('armies'),
    status: $('status'), overlay: $('overlay'), winTitle: $('win-title'), winText: $('win-text'),
    winStars: $('win-stars'), winNext: $('win-next'), winRetry: $('win-retry'), winMap: $('win-map'),
    panel: $('panel'), gear: $('gear'), errors: $('errors'), errorsToggle: $('errors-toggle'),
    sound: $('sound'), newmap: $('newmap'), segAi: $('seg-ai'), teamsToggle: $('teams-toggle'),
    noteText: $('note-text'), noteSave: $('note-save'), noteStatus: $('note-status'),
    openMaps: $('open-maps'), maps: $('maps'), mapsList: $('maps-list'), mapsClose: $('maps-close'),
    btnPlay: $('btn-play'), btnMap: $('btn-map'), btnShop: $('btn-shop'), btnScores: $('btn-scores'),
    btnHome: $('btn-home'), path: $('path'), mapNote: $('map-note'),
    shopList: $('shop-list'), bestLevels: $('best-levels'), scoreList: $('score-list'),
    syncPill: $('sync-pill'), syncMsg: $('sync-msg'), familyForm: $('family-form'),
    familyEmail: $('family-email'), familyPass: $('family-pass'), familySync: $('family-sync'),
    familyCheck: $('family-check'), familySignout: $('family-signout'), familyResult: $('family-result'),
    pctBtn: $('pct-btn'), popBar: $('pop-bar'), countdown: $('countdown')
  };

  var g = {
    level: 1,
    ai: 'normal',
    teams: false,      // the Teams setting (used on Level 4, with four players)
    teamMode: false,   // on for the current game
    players: 2,
    screen: 'home',
    nodes: [],
    armies: [],
    drag: null,        // { sources: [spot, ...], start, pointer, target, moved }
    dragLines: [],
    sendPct: 0.25,     // share of a spot's soldiers sent per drop (10, 25, 50 or 100%)
    over: false,
    paused: true,
    elapsed: 0,        // seconds of play in this game
    countdown: 0,      // 3, 2, 1 before the soldiers move
    goT: 0,            // time the countdown reached zero (for the "Go!" flash)
    cdText: '',
    aiClock: 0,
    aiLog: {},         // per computer player: game times of its recent moves
    recordId: null,    // saved map record for the current game
    statusTimer: null
  };

  var popKey = '';

  // ---------- helpers ----------

  function svgEl(name, attrs) {
    var el = document.createElementNS(SVG_NS, name);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  // Team of a player. Without team mode every player is their own team.
  function teamOf(owner) {
    if (!g.teamMode) return owner;
    return owner < 2 ? 0 : 1;
  }

  // Colour class for a spot or army: per player, or per team in team mode.
  function colourClass(owner) {
    if (owner === -2) return 'lake';
    if (owner < 0) return 'neutral';
    return g.teamMode ? 't' + teamOf(owner) : 'o' + owner;
  }

  function linked(a, b) { return a.links.indexOf(b.id) !== -1; }

  function mmss(sec) {
    var s = Math.max(0, Math.round(sec));
    return Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60);
  }

  function starText(n) { return '★'.repeat(n) + '☆'.repeat(3 - n); }

  function starsFor(seconds) {
    if (seconds <= 90) return 3;
    if (seconds <= 180) return 2;
    return 1;
  }

  function setStatus(msg, temp) {
    els.status.textContent = msg;
    clearTimeout(g.statusTimer);
    if (temp) g.statusTimer = setTimeout(restoreStatus, 1800);
  }

  function restoreStatus() {
    var rec = currentRecord();
    els.status.textContent = rec
      ? rec.title + ' · up to ' + rec.max_opponents + (rec.max_opponents === 1 ? ' opponent' : ' opponents')
      : 'Drag from your mushroom to a connected one';
  }

  function currentRecord() {
    if (!g.recordId) return null;
    var list = S.list();
    for (var i = 0; i < list.length; i++) if (list[i].id === g.recordId) return list[i];
    return null;
  }

  // Errors are shown only when "Show errors" is on (see the ⚙️ panel).
  function logError(msg) {
    els.errors.appendChild(el('div', '', String(msg)));
    while (els.errors.children.length > 20) els.errors.removeChild(els.errors.firstChild);
  }

  function toMap(e) {
    var r = els.board.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) / r.width * M.W,
      y: (e.clientY - r.top) / r.height * M.H
    };
  }

  // Nearest land spot within the tap radius (lakes cannot be tapped).
  function hit(p) {
    var best = null, bestD = HIT;
    g.nodes.forEach(function (n) {
      if (n.type === 'lake') return;
      var d = Math.hypot(n.x - p.x, n.y - p.y);
      if (d < bestD) { bestD = d; best = n; }
    });
    return best;
  }

  // Point-in-polygon (ray casting), used to find the region under a drop.
  function inPoly(p, poly) {
    var inside = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i].x, yi = poly[i].y, xj = poly[j].x, yj = poly[j].y;
      if (((yi > p.y) !== (yj > p.y)) && (p.x < (xj - xi) * (p.y - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  }

  // The land region (Voronoi cell) under a point. A drop anywhere inside a region counts.
  function regionAt(p) {
    for (var i = 0; i < g.nodes.length; i++) {
      var n = g.nodes[i];
      if (n.type !== 'lake' && inPoly(p, n.poly)) return n;
    }
    return null;
  }

  // How many soldiers a spot sends in one drop: a share of its soldiers, at least two when it has them.
  function amountFor(s) {
    var c = Math.floor(s.count);
    if (c < 1) return 0;
    return Math.min(c, Math.max(2, Math.floor(c * g.sendPct)));
  }

  // Shortest route from one spot to another through your own spots. Returns the spots
  // after `from`, ending with `to`, or null when there is no such route.
  function routeTo(from, to) {
    if (from === to) return null;
    var prev = {};
    prev[from.id] = null;
    var queue = [from];
    var found = false;
    while (queue.length && !found) {
      var n = queue.shift();
      n.links.forEach(function (id) {
        if (found) return;
        var t = g.nodes[id];
        if (prev[t.id] !== undefined) return;
        if (t !== to && t.owner !== 0) return;   // a route may pass only through your own spots
        prev[t.id] = n;
        if (t === to) { found = true; return; }
        queue.push(t);
      });
    }
    if (!found) return null;
    var path = [];
    for (var c = to; c !== from; c = prev[c.id]) path.unshift(c);
    return path;
  }

  // ---------- screens ----------

  function show(name) {
    g.screen = name;
    ['home', 'map', 'shop', 'scores', 'game'].forEach(function (s) {
      $('screen-' + s).hidden = (s !== name);
    });
    g.paused = name !== 'game';
    els.overlay.hidden = true;
    els.maps.hidden = true;
    if (name !== 'game') els.panel.hidden = true;
    if (name === 'map') renderPath();
    if (name === 'shop') renderShop();
    if (name === 'scores') renderScores();
    window.scrollTo(0, 0);
  }

  function startLevel(n) {
    g.level = n;
    show('game');
    newGame();
  }

  // ---------- building the board ----------

  function buildBoard() {
    els.nodes.innerHTML = '';
    els.roads.innerHTML = '';
    els.armies.innerHTML = '';
    g.dragLines = [];

    // Regions (Voronoi cells). Lakes are drawn as water.
    g.nodes.forEach(function (n) {
      n.polyEl = svgEl('polygon', {
        points: n.poly.map(function (p) { return p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' ')
      });
      n.shownOwner = undefined;
      els.roads.appendChild(n.polyEl);
    });

    // Roads between neighbouring land spots (each pair once)
    g.nodes.forEach(function (a) {
      if (a.type === 'lake') return;
      a.links.forEach(function (id) {
        if (id <= a.id) return;
        var b = g.nodes[id];
        els.roads.appendChild(svgEl('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, 'class': 'road' }));
      });
    });

    // Spot labels (land only). Cities also show their level as stars.
    g.nodes.forEach(function (n) {
      if (n.type === 'lake') return;
      var d = el('div', 'node');
      d.style.left = (n.x / M.W * 100) + '%';
      d.style.top = (n.y / M.H * 100) + '%';
      var num = el('span', 'num');
      d.appendChild(el('span', 'ico', ICON[n.type]));
      d.appendChild(num);
      n.lvlEl = el('span', 'lvl', '');
      d.appendChild(n.lvlEl);
      n.el = d;
      n.num = num;
      n.shownCount = null;
      n.shownLevel = null;
      if (n.type === 'city') d.classList.add('city');
      els.nodes.appendChild(d);
    });
  }

  // ---------- starting a game ----------

  function newGame() {
    var map;
    try {
      map = M.generate(g.level);
    } catch (err) {
      logError(err.message);
      setStatus('Could not make a map. Try again.');
      return;
    }

    // Save every generated map, with its features and description.
    var rec = S.add({
      level: map.level,
      players: map.players,
      max_opponents: map.maxOpponents,
      title: map.title,
      description: map.description,
      features: map.features,
      rank: null,
      notes: [],
      times_played: 0,
      wins: 0,
      losses: 0,
      map: {
        nodes: map.nodes.map(function (n) {
          return { id: n.id, x: n.x, y: n.y, type: n.type, links: n.links, poly: n.poly };
        })
      }
    });
    if (S.lastError()) logError(S.lastError());

    map.nodes.forEach(function (n) {
      if (n.type === 'city') {
        n.level = 1;
        n.rate = CITY_LEVELS[0].rate;
        n.cap = CITY_LEVELS[0].cap;
      } else {
        n.level = 0;
        n.cap = Infinity;
      }
    });

    g.recordId = rec.id;
    g.players = map.players;
    g.teamMode = g.teams && map.players === 4;
    g.nodes = map.nodes;
    g.armies = [];
    g.drag = null;
    g.aiLog = {};
    g.over = false;
    g.paused = false;
    g.elapsed = 0;
    g.aiClock = 0;
    g.countdown = 3;
    g.goT = 0;
    g.cdText = '';
    popKey = '';
    els.overlay.hidden = true;
    buildBoard();
    restoreStatus();
  }

  // ---------- the rules ----------

  // Create a marching army. Soldiers do not leave `from` (used for passing through your own spots).
  function spawn(from, to, count, owner) {
    var a = {
      from: from,
      to: to,
      owner: owner,
      count: count,
      len: Math.max(1, Math.hypot(to.x - from.x, to.y - from.y)),
      p: 0,
      done: false,
      route: null,   // spots still to pass through, for a longer march
      el: null
    };
    a.el = svgEl('g', { 'class': 'army ' + colourClass(owner) });
    a.el.appendChild(svgEl('circle', { r: 13 }));
    var label = svgEl('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central' });
    label.textContent = String(count);
    a.el.appendChild(label);
    els.armies.appendChild(a.el);
    g.armies.push(a);
    return a;
  }

  function launch(from, to, count, owner) {
    count = Math.min(Math.floor(count), Math.floor(from.count));
    if (count <= 0) return null;
    from.count -= count;
    var a = spawn(from, to, count, owner);
    if (owner === 0) Sound.send();
    return a;
  }

  // Send soldiers along a route of your spots, ending at path[last].
  function sendAlong(from, path, count) {
    var a = launch(from, path[0], count, 0);
    if (!a) return false;
    a.route = path.slice(1);
    return true;
  }

  function setArmyCount(a, c) {
    a.count = c;
    var t = a.el && a.el.querySelector('text');
    if (t) t.textContent = String(c);
  }

  // Soldiers marching toward each other on the same road fight when they meet.
  // The larger force survives with the difference.
  function clashOnRoads() {
    var live = g.armies.filter(function (a) { return !a.done; });
    for (var i = 0; i < live.length; i++) {
      for (var j = i + 1; j < live.length; j++) {
        var a = live[i], b = live[j];
        if (a.done || b.done || a.owner === b.owner) continue;
        if (a.from !== b.to || a.to !== b.from) continue;   // must be on the same road, facing each other
        if (a.p + b.p < 1) continue;                         // not met yet
        var diff = a.count - b.count;
        if (diff > 0) { setArmyCount(a, diff); b.done = true; }
        else if (diff < 0) { setArmyCount(b, -diff); a.done = true; }
        else { a.done = true; b.done = true; }
      }
    }
  }

  function arrive(a) {
    var n = a.to;
    a.done = true;
    // Passing through one of your own spots on a longer march: keep going, the garrison is unchanged.
    if (a.route && a.route.length && n.owner === a.owner) {
      var next = spawn(n, a.route[0], a.count, a.owner);
      next.route = a.route.slice(1);
      return;
    }
    if (n.owner === a.owner) {
      n.count += a.count;
      return;
    }
    n.count -= a.count;
    if (n.count < 0) {
      var before = n.owner;
      n.owner = a.owner;
      n.count = -n.count;
      if (n.type === 'city') { n.level = 1; n.rate = CITY_LEVELS[0].rate; n.cap = CITY_LEVELS[0].cap; }
      if (a.owner === 0) Sound.capture();
      else if (before === 0) Sound.lost();
    }
  }

  // Spend soldiers to raise a city's level: faster growth, a bigger garrison cap.
  function tryUpgrade(city) {
    if (city.owner !== 0 || city.type !== 'city') return;
    var lvl = city.level || 1;
    if (lvl >= CITY_LEVELS.length) { setStatus('This city is fully upgraded.', true); return; }
    var cost = CITY_LEVELS[lvl].cost;
    if (Math.floor(city.count) < cost) {
      setStatus('Upgrading needs ' + cost + ' soldiers in the city.', true);
      return;
    }
    city.count -= cost;
    city.level = lvl + 1;
    city.rate = CITY_LEVELS[lvl].rate;
    city.cap = CITY_LEVELS[lvl].cap;
    Sound.tap();
    setStatus('City upgraded to level ' + city.level + '.', true);
  }

  function step(dt) {
    if (g.over || g.paused || !g.nodes.length) return;

    if (g.countdown > 0) {
      g.countdown -= dt;
      if (g.countdown <= 0) { g.countdown = 0; g.goT = performance.now(); }
      return;
    }
    g.elapsed += dt;

    g.nodes.forEach(function (n) {
      if (n.owner < 0) return;
      if (n.count >= n.cap) return;   // cities stop growing at their garrison cap
      n.count += n.rate * dt;
      if (n.count > n.cap) n.count = n.cap;
    });

    g.armies.forEach(function (a) {
      if (a.done) return;
      a.p += SPEED * dt / a.len;
    });
    clashOnRoads();
    g.armies.forEach(function (a) {
      if (!a.done && a.p >= 1) arrive(a);
    });
    g.armies = g.armies.filter(function (a) {
      if (a.done) {
        if (a.el.parentNode) a.el.parentNode.removeChild(a.el);
        return false;
      }
      return true;
    });

    g.aiClock -= dt;
    if (g.aiClock <= 0) {
      for (var p = 1; p < g.players; p++) aiThink(LEVELS_AI[g.ai], p);
      g.aiClock = LEVELS_AI[g.ai].every;
    }

    checkWin();
  }

  // Soldiers and spots per player, with armies in flight counted as soldiers.
  function totals() {
    var t = [];
    for (var p = 0; p < g.players; p++) t[p] = { spots: 0, soldiers: 0 };
    g.nodes.forEach(function (n) {
      if (n.owner >= 0) { t[n.owner].spots++; t[n.owner].soldiers += Math.floor(n.count); }
    });
    g.armies.forEach(function (a) { if (!a.done) t[a.owner].soldiers += a.count; });
    return t;
  }

  // True when a spot touches a spot of another team (a front line).
  function borders(n, p) {
    return n.links.some(function (id) {
      var t = g.nodes[id];
      return t.owner >= 0 && teamOf(t.owner) !== teamOf(p);
    });
  }

  // Computer players: spots away from the front send reinforcements to the front;
  // spots on the front attack the best linked neighbour from another team.
  // A player with more than half the soldiers is ganged up on. Moves per minute are capped by level.
  function aiThink(level, p) {
    var log = (g.aiLog[p] || []).filter(function (t) { return g.elapsed - t < 60; });
    g.aiLog[p] = log;

    var tot = totals();
    var sum = tot.reduce(function (x, t) { return x + t.soldiers; }, 0);
    var leaderTeam = -1;
    tot.forEach(function (t, o) {
      if (sum && t.soldiers / sum > 0.5 && teamOf(o) !== teamOf(p)) leaderTeam = teamOf(o);
    });

    var ready = g.nodes.filter(function (n) {
      return n.type !== 'lake' && n.owner === p && n.count >= level.threshold;
    });
    ready.forEach(function (n) {
      if (log.length >= level.perMinute) return;
      var target = null;
      if (!borders(n, p)) {
        n.links.forEach(function (id) {
          var t = g.nodes[id];
          if (t.owner === p && borders(t, p) && (!target || t.count < target.count)) target = t;
        });
      }
      if (!target) {
        var bestScore = Infinity;
        n.links.forEach(function (id) {
          var t = g.nodes[id];
          if (t.owner >= 0 && teamOf(t.owner) === teamOf(p)) return;   // never attack a teammate
          var score = t.count + M.dist(n, t) / 40;
          if (leaderTeam !== -1 && t.owner >= 0 && teamOf(t.owner) === leaderTeam) score -= 8;
          if (score < bestScore) { bestScore = score; target = t; }
        });
      }
      if (target && launch(n, target, Math.floor(n.count * level.fraction), p)) log.push(g.elapsed);
    });
  }

  // The game is won when only one team is left with spots or soldiers. Neutral spots may remain.
  function checkWin() {
    var alive = {};
    g.nodes.forEach(function (n) { if (n.type !== 'lake' && n.owner >= 0) alive[teamOf(n.owner)] = true; });
    g.armies.forEach(function (a) { if (!a.done) alive[teamOf(a.owner)] = true; });

    if (!alive[teamOf(0)]) return endGame(false);
    if (Object.keys(alive).length === 1) endGame(true);
  }

  function endGame(won) {
    if (g.over) return;
    g.over = true;
    g.drag = null;
    if (won) Sound.win(); else Sound.lost();

    var secs = Math.round(g.elapsed);
    var mine = g.nodes.filter(function (n) { return n.type !== 'lake' && n.owner === 0; });
    var soldiers = 0;
    mine.forEach(function (n) { soldiers += Math.floor(n.count); });
    var score = won ? Math.round(1000 + Math.max(0, 600 - secs) * 2 + mine.length * 50 + soldiers) : 0;

    var rec = S.recordGame(g.recordId, won);
    if (S.lastError()) logError(S.lastError());
    var rate = rec ? S.winRate(rec) : null;
    var mapStats = rec ? 'Map played ' + rec.times_played + ' · win rate ' + (rate === null ? '—' : rate + '%') : '';

    var stars = 0;
    var hasNext = g.level < S.LEVEL_COUNT;
    if (won) {
      stars = starsFor(secs);
      S.completeLevel(g.level, secs, score);
      S.addScore({ score: score, level: g.level, seconds: secs });
      if (S.lastError()) logError(S.lastError());
      els.winTitle.textContent = hasNext ? 'You grew the whole meadow! 🎉' : 'All four levels done! 🏆';
      els.winText.textContent = 'Time ' + mmss(secs) + ' · Score ' + score + '. ' + mapStats;
      els.winStars.textContent = starText(stars);
    } else {
      els.winTitle.textContent = 'The other mushrooms won this time 🍄';
      els.winText.textContent = 'Try again, you can do it! ' + mapStats;
      els.winStars.textContent = '';
    }
    els.winNext.hidden = !(won && hasNext);
    els.winRetry.textContent = won ? 'Play again' : 'Try again';
    els.overlay.hidden = false;
  }

  // ---------- drawing ----------

  // Lines from each dragged spot to the pointer, or to the target region when over one.
  function renderDrag() {
    var d = g.drag;
    var want = d ? d.sources.length : 0;
    while (g.dragLines.length < want) {
      var ln = svgEl('line', { 'class': 'drag' });
      els.armies.insertBefore(ln, els.armies.firstChild);
      g.dragLines.push(ln);
    }
    while (g.dragLines.length > want) {
      var old = g.dragLines.pop();
      if (old.parentNode) old.parentNode.removeChild(old);
    }
    var end = d && (d.target || d.pointer);
    g.dragLines.forEach(function (ln, i) {
      if (!end) { ln.style.display = 'none'; return; }
      var s = d.sources[i];
      var ok = d.target && routeTo(s, d.target);
      ln.setAttribute('x1', s.x);
      ln.setAttribute('y1', s.y);
      ln.setAttribute('x2', end.x);
      ln.setAttribute('y2', end.y);
      ln.setAttribute('class', 'drag' + (d.target ? (ok ? ' ok' : ' bad') : ''));
      ln.style.display = '';
    });
  }

  // The population line: territories:soldiers for each player, or for each team in team mode.
  // A red divider separates the two teams.
  function renderPop() {
    var tot = totals();
    var groups = g.teamMode ? [[0, 1], [2, 3]] : [];
    if (!g.teamMode) for (var p = 0; p < g.players; p++) groups.push([p]);
    var stats = groups.map(function (members) {
      var s = { members: members, spots: 0, soldiers: 0 };
      members.forEach(function (m) {
        if (m < g.players) { s.spots += tot[m].spots; s.soldiers += tot[m].soldiers; }
      });
      return s;
    });

    var key = stats.map(function (s) { return s.spots + ':' + s.soldiers; }).join('|');
    if (key === popKey) return;
    popKey = key;

    var sum = stats.reduce(function (x, s) { return x + s.soldiers; }, 0);
    els.popBar.innerHTML = '';
    stats.forEach(function (s, i) {
      if (g.teamMode && i === 1) els.popBar.appendChild(el('div', 'pop-div'));
      if (!s.spots && !s.soldiers) return;
      var share = sum ? s.soldiers / sum * 100 : 100 / stats.length;
      var label = s.members.map(function (m) { return AVATARS[m]; }).join('') + ' ' + s.spots + ':' + s.soldiers;
      var seg = el('div', 'pop-seg ' + (g.teamMode ? 't' + i : 'o' + s.members[0]), label);
      seg.style.width = share + '%';
      seg.title = (g.teamMode ? (i === 0 ? 'Your team' : 'Other team') : (s.members[0] === 0 ? 'You' : 'Player ' + (s.members[0] + 1))) +
        ': ' + s.spots + ' territories, ' + s.soldiers + ' soldiers';
      els.popBar.appendChild(seg);
    });
  }

  // The "Go!" countdown in the middle of the board.
  function renderCountdown() {
    var txt = '';
    if (g.countdown > 0) txt = String(Math.ceil(g.countdown));
    else if (g.goT && performance.now() - g.goT < 700) txt = 'Go!';
    if (txt !== g.cdText) {
      g.cdText = txt;
      els.countdown.textContent = txt;
      els.countdown.hidden = !txt;
    }
  }

  function render() {
    g.nodes.forEach(function (n) {
      if (n.polyEl && n.shownOwner !== n.owner) {
        n.polyEl.setAttribute('class', 'cell ' + colourClass(n.owner));
        n.shownOwner = n.owner;
      }
      if (n.type === 'lake' || !n.el) return;

      var label = Math.floor(n.count);
      var cls = 'node' + (n.type === 'city' ? ' city' : '') + ' ' + colourClass(n.owner);
      if (g.drag && g.drag.sources.indexOf(n) !== -1) cls += ' source';
      if (g.drag && g.drag.target === n) cls += ' target';
      n.el.className = cls;
      if (n.shownCount !== label) {
        n.num.textContent = String(label);
        n.shownCount = label;
      }
      if (n.type === 'city' && n.shownLevel !== n.level) {
        n.lvlEl.textContent = n.level > 1 ? '★'.repeat(n.level - 1) : '';
        n.shownLevel = n.level;
      }
    });

    g.armies.forEach(function (a) {
      var x = a.from.x + (a.to.x - a.from.x) * a.p;
      var y = a.from.y + (a.to.y - a.from.y) * a.p;
      a.el.setAttribute('transform', 'translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ')');
    });

    renderDrag();
    renderPop();
    renderCountdown();
    els.pctBtn.textContent = 'Send ' + Math.round(g.sendPct * 100) + '%';
  }

  // ---------- input ----------

  els.board.addEventListener('pointerdown', function (e) {
    if (g.over || g.paused || g.countdown > 0) return;
    var p = toMap(e);
    var n = hit(p);
    if (!n || n.owner !== 0 || n.count < 1) return;
    e.preventDefault();
    els.board.setPointerCapture(e.pointerId);
    g.drag = { sources: [n], start: p, pointer: p, target: null, moved: false };
    Sound.tap();
  });

  // Moving over your own regions adds them to the group; over another region it targets it.
  els.board.addEventListener('pointermove', function (e) {
    if (!g.drag) return;
    var p = toMap(e);
    var d = g.drag;
    d.pointer = p;
    if (Math.hypot(p.x - d.start.x, p.y - d.start.y) > 12) d.moved = true;
    var r = regionAt(p) || hit(p);
    if (r && r.owner === 0 && r.count >= 1 && d.sources.indexOf(r) === -1) d.sources.push(r);
    d.target = (r && d.sources.indexOf(r) === -1 && r.type !== 'lake') ? r : null;
  });

  // Release: a tap on a city upgrades it. A drop on a region sends every dragged spot that can
  // reach it, by road or through your own spots. A drop on your own spot reinforces it.
  function endDrag(e) {
    var d = g.drag;
    if (!d) return;
    g.drag = null;
    var p = toMap(e);
    if (!d.moved && d.sources.length === 1 && d.sources[0].type === 'city') {
      tryUpgrade(d.sources[0]);
      return;
    }
    var t = regionAt(p) || hit(p);
    if (!t) return;
    var group = d.sources.filter(function (s) { return s !== t; });
    var sent = 0, blocked = 0;
    group.forEach(function (s) {
      var path = routeTo(s, t);
      if (!path) { blocked++; return; }
      var amt = amountFor(s);
      if (amt > 0 && sendAlong(s, path, amt)) sent++;
    });
    if (!group.length) return;
    if (sent) {
      var reinforce = t.owner === 0;
      setStatus(reinforce ? 'Reinforcements sent.' : (sent === 1 ? 'Sent soldiers!' : 'Sent from ' + sent + ' spots!'), true);
    } else if (blocked) {
      setStatus('No route. Your spots must be connected by roads.', true);
    }
  }

  els.board.addEventListener('pointerup', endDrag);
  els.board.addEventListener('pointercancel', function () { g.drag = null; });

  els.pctBtn.addEventListener('click', function () {
    var i = SEND_STEPS.indexOf(g.sendPct);
    g.sendPct = SEND_STEPS[(i + 1) % SEND_STEPS.length];
    els.pctBtn.textContent = 'Send ' + Math.round(g.sendPct * 100) + '%';
  });

  // ---------- home, progress, shop, scores ----------

  function markSeg(container, attr, value) {
    container.querySelectorAll('button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset[attr] === String(value)));
    });
  }

  $('btn-play').addEventListener('click', function () { startLevel(S.highestOpen()); });
  $('btn-map').addEventListener('click', function () { show('map'); });
  $('btn-shop').addEventListener('click', function () { show('shop'); });
  $('btn-scores').addEventListener('click', function () { show('scores'); });
  document.querySelectorAll('[data-go]').forEach(function (b) {
    b.addEventListener('click', function () { show(b.dataset.go); });
  });
  els.btnHome.addEventListener('click', function () { show('map'); });

  function renderPath() {
    els.path.innerHTML = '';
    var prog = S.progress();
    M.LEVELS.forEach(function (cfg) {
      if (cfg.level > S.LEVEL_COUNT) return;
      var status = S.levelStatus(cfg.level);
      var entry = prog.completed[String(cfg.level)];
      var btn = el('button', 'lvl-node ' + status);
      btn.appendChild(el('span', 'lvl-num', String(cfg.level)));
      btn.appendChild(el('span', 'lvl-name', cfg.name));
      var state;
      if (status === 'locked') state = '🔒 Win level ' + (cfg.level - 1) + ' to unlock';
      else if (status === 'done') state = starText(entry.stars) + ' · best ' + entry.bestScore;
      else state = 'Tap to play';
      btn.appendChild(el('span', 'lvl-state', state));
      btn.disabled = status === 'locked';
      btn.addEventListener('click', function () { startLevel(cfg.level); });
      els.path.appendChild(btn);
      els.path.appendChild(el('div', 'lvl-link'));
    });
    var soon = el('div', 'lvl-node soon');
    soon.appendChild(el('span', 'lvl-num', '🌱'));
    soon.appendChild(el('span', 'lvl-name', 'More levels'));
    soon.appendChild(el('span', 'lvl-state', 'Coming soon'));
    els.path.appendChild(soon);

    var done = Object.keys(prog.completed).length;
    els.mapNote.textContent = done + ' of ' + S.LEVEL_COUNT + ' levels won.';
  }

  function renderShop() {
    els.shopList.innerHTML = '';
    SHOP.forEach(function (item) {
      var li = el('li', 'card-item ' + item.status);
      var head = el('div', 'card-head');
      head.appendChild(el('h3', '', item.name));
      head.appendChild(el('span', 'tag-pill ' + item.status, item.status === 'in' ? 'In game' : 'Coming soon'));
      li.appendChild(head);
      li.appendChild(el('p', '', item.desc));
      els.shopList.appendChild(li);
    });
  }

  function renderScores() {
    var prog = S.progress();
    els.bestLevels.innerHTML = '';
    M.LEVELS.forEach(function (cfg) {
      if (cfg.level > S.LEVEL_COUNT) return;
      var entry = prog.completed[String(cfg.level)];
      var card = el('div', 'card-item ' + (entry ? 'in' : 'soon'));
      var head = el('div', 'card-head');
      head.appendChild(el('h3', '', 'Level ' + cfg.level + ' · ' + cfg.name));
      head.appendChild(el('span', 'tag-pill ' + (entry ? 'in' : 'soon'), entry ? starText(entry.stars) : 'Not won'));
      card.appendChild(head);
      card.appendChild(el('p', '', entry ? 'Best score ' + entry.bestScore + ' · best time ' + mmss(entry.bestSeconds) : 'Win this level to set a score.'));
      els.bestLevels.appendChild(card);
    });

    els.scoreList.innerHTML = '';
    var top = S.scores();
    if (!top.length) {
      els.scoreList.appendChild(el('li', 'muted', 'No wins yet.'));
      return;
    }
    top.forEach(function (s) {
      var li = el('li', 'score-row');
      li.appendChild(el('span', 'score-num', String(s.score)));
      li.appendChild(el('span', '', 'Level ' + s.level + ' · ' + mmss(s.seconds)));
      els.scoreList.appendChild(li);
    });
  }

  // ---------- win / lose buttons ----------

  els.winNext.addEventListener('click', function () { startLevel(g.level + 1); });
  els.winRetry.addEventListener('click', function () { startLevel(g.level); });
  els.winMap.addEventListener('click', function () { show('map'); });

  // ---------- settings (⚙️) ----------

  els.gear.addEventListener('click', function () {
    els.panel.hidden = !els.panel.hidden;
  });

  els.segAi.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    g.ai = b.dataset.ai;
    markSeg(els.segAi, 'ai', g.ai);
  });

  els.teamsToggle.addEventListener('click', function () {
    var on = els.teamsToggle.getAttribute('aria-pressed') !== 'true';
    els.teamsToggle.setAttribute('aria-pressed', String(on));
    els.teamsToggle.textContent = on ? 'On' : 'Off';
    g.teams = on;
    setStatus(on ? 'Teams apply on Level 4.' : 'Teams off.', true);
  });

  els.sound.addEventListener('click', function () {
    var on = els.sound.getAttribute('aria-pressed') !== 'true';
    els.sound.setAttribute('aria-pressed', String(on));
    els.sound.textContent = on ? 'On' : 'Off';
    Sound.setEnabled(on);
  });

  els.errorsToggle.addEventListener('click', function () {
    var on = els.errorsToggle.getAttribute('aria-pressed') !== 'true';
    els.errorsToggle.setAttribute('aria-pressed', String(on));
    els.errorsToggle.textContent = on ? 'On' : 'Off';
    els.errors.hidden = !on;
  });

  els.noteSave.addEventListener('click', function () {
    var text = els.noteText.value.trim();
    if (!g.recordId) return;
    if (!text) {
      els.noteStatus.textContent = 'Write a note first.';
      return;
    }
    var rec = S.addNote(g.recordId, text);
    if (!rec) {
      els.noteStatus.textContent = 'Could not save the note.';
      logError(S.lastError() || 'Note not saved');
      return;
    }
    els.noteText.value = '';
    els.noteStatus.textContent = 'Note saved for this map.';
  });

  els.newmap.addEventListener('click', function () { newGame(); });

  // ---------- saved maps list (description, features, ranking, win rate, notes) ----------

  function renderMaps() {
    var list = S.list().slice().sort(function (a, b) {
      var ra = a.rank || 0, rb = b.rank || 0;
      if (rb !== ra) return rb - ra;
      var wa = S.winRate(a) || 0, wb = S.winRate(b) || 0;
      if (wb !== wa) return wb - wa;
      return (b.times_played || 0) - (a.times_played || 0);
    });

    els.mapsList.innerHTML = '';
    if (!list.length) {
      els.mapsList.appendChild(el('p', 'muted', 'No maps yet.'));
      return;
    }

    list.forEach(function (r) {
      var row = el('div', 'map-row');
      row.appendChild(el('h3', '', r.title));
      row.appendChild(el('p', 'desc', r.description || ''));

      var chips = el('div', 'chips');
      (r.features || []).forEach(function (f) { chips.appendChild(el('span', 'chip', f)); });
      row.appendChild(chips);

      var rate = S.winRate(r);
      row.appendChild(el('p', 'stats',
        'Played ' + (r.times_played || 0) + ' · wins ' + (r.wins || 0) +
        ' · win rate ' + (rate === null ? '—' : rate + '%') +
        ' · opponents ' + r.max_opponents));

      var stars = el('div', 'stars');
      for (var s = 1; s <= 5; s++) {
        var b = el('button', 'star', s <= (r.rank || 0) ? '★' : '☆');
        b.setAttribute('aria-label', 'Rate ' + s + ' star' + (s > 1 ? 's' : ''));
        b.addEventListener('click', (function (id, n) {
          return function () {
            S.setRank(id, n);
            if (S.lastError()) logError(S.lastError());
            renderMaps();
          };
        })(r.id, s));
        stars.appendChild(b);
      }
      row.appendChild(stars);

      // Every note, with its status. "Mark done" moves it between open and done.
      (r.notes || []).forEach(function (note) {
        var box = el('div', 'note-row ' + (note.status === 'done' ? 'done' : 'open'));
        box.appendChild(el('p', 'note', '📝 ' + note.text));
        box.appendChild(el('span', 'chip', note.status === 'done' ? 'done' : 'open'));
        if (note.id) {
          var next = note.status === 'done' ? 'open' : 'done';
          var nb = el('button', 'note-toggle', next === 'done' ? 'Mark done' : 'Reopen');
          nb.addEventListener('click', (function (mapId, noteId, status) {
            return function () {
              S.setNoteStatus(mapId, noteId, status);
              renderMaps();
            };
          })(r.id, note.id, next));
          box.appendChild(nb);
        }
        row.appendChild(box);
      });

      els.mapsList.appendChild(row);
    });
  }

  els.openMaps.addEventListener('click', function () {
    renderMaps();
    els.maps.hidden = false;
  });
  els.mapsClose.addEventListener('click', function () { els.maps.hidden = true; });

  // ---------- family database: sync pill, ⚙️ Family section ----------

  function renderCloud(s) {
    var label = s.state === 'busy' ? '☁️ …' : s.state === 'ok' ? '☁️ synced' : s.state === 'error' ? '⚠️ sync' : '💾 device';
    els.syncPill.textContent = label;
    els.syncPill.classList.toggle('mint', s.state === 'ok');
    els.syncPill.classList.toggle('warn', s.state === 'error');
    els.syncMsg.textContent = s.message;
    els.familyForm.hidden = s.signedIn;
    els.familySignout.hidden = !s.signedIn;
  }

  els.syncPill.addEventListener('click', function () { els.panel.hidden = false; });

  els.familyForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = els.familyEmail.value.trim();
    var pass = els.familyPass.value;
    if (!email || !pass) {
      els.familyResult.textContent = 'Enter the family email and password.';
      return;
    }
    els.familyResult.textContent = 'Signing in…';
    XWCloud.signIn(S, email, pass).then(function () {
      els.familyPass.value = '';
      els.familyResult.textContent = 'Signed in. Maps and notes are synced.';
    }).catch(function () {
      els.familyResult.textContent = 'Could not sign in. Check the email and password.';
    });
  });

  els.familySync.addEventListener('click', function () {
    if (!XWCloud.isSignedIn()) {
      els.familyResult.textContent = 'Sign in first, then the maps and notes can be sent.';
      return;
    }
    var count = S.list().length;
    XWCloud.syncAll(S).then(function () {
      els.familyResult.textContent = 'Sent ' + count + (count === 1 ? ' map' : ' maps') + ' with their notes.';
    }).catch(function () {
      els.familyResult.textContent = 'Not sent. See the sync message, or turn on Show errors.';
    });
  });

  els.familyCheck.addEventListener('click', function () {
    els.familyResult.textContent = 'Checking…';
    XWCloud.dbCheck().then(function (text) {
      els.familyResult.textContent = text;
    }).catch(function () {
      els.familyResult.textContent = '❌ Database check failed. Turn on Show errors for details.';
    });
  });

  els.familySignout.addEventListener('click', function () {
    XWCloud.signOut().then(function () {
      els.familyResult.textContent = 'Signed out. Maps stay on this device.';
    });
  });

  // Errors are logged quietly; they only show when "Show errors" is on.
  window.addEventListener('error', function (e) { logError(e.message || e.error); });
  window.addEventListener('unhandledrejection', function (e) { logError(e.reason); });

  // ---------- frame loop ----------

  var last = performance.now();
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    try {
      step(dt);
      render();
    } catch (err) {
      logError(err.message);
    }
    requestAnimationFrame(frame);
  }

  // Start-up: the landing page is shown; the game starts when Play is tapped.
  XWCloud.onState(renderCloud);
  XWCloud.init(S, logError);

  markSeg(els.segAi, 'ai', g.ai);
  show('home');
  requestAnimationFrame(frame);
})();
