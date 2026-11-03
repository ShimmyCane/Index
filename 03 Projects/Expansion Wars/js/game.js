// Expansion Wars — game rules, computer players, drawing and input.
(function () {
  'use strict';

  var M = window.ExpansionMap;
  var SPEED = 120;   // map units per second for marching soldiers
  var HIT = 46;      // how close a tap must be to a spot (map units)
  var LEVELS = {
    easy:   { every: 3.0, fraction: 0.4, threshold: 10 },
    normal: { every: 1.8, fraction: 0.6, threshold: 7 }
  };
  var ICON = { factory: '🍄', city: '🏰' };
  var SVG_NS = 'http://www.w3.org/2000/svg';

  function $(id) { return document.getElementById(id); }

  var els = {
    board: $('board'),
    roads: $('roads'),
    nodes: $('nodes'),
    armies: $('armies'),
    status: $('status'),
    overlay: $('overlay'),
    winTitle: $('win-title'),
    winText: $('win-text'),
    panel: $('panel'),
    gear: $('gear'),
    errors: $('errors'),
    errorsToggle: $('errors-toggle'),
    sound: $('sound'),
    newmap: $('newmap'),
    again: $('again')
  };

  var g = {
    players: 2,
    ai: 'normal',
    map: null,
    nodes: [],
    lakes: [],
    armies: [],
    drag: null,     // { from: node }
    pointer: null,  // { x, y } in map units
    target: null,   // node under the pointer during a drag
    over: false,
    aiClock: 0,
    statusTimer: null
  };

  // ---------- helpers ----------

  function svgEl(name, attrs) {
    var el = document.createElementNS(SVG_NS, name);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }

  function ownerClass(owner) { return owner < 0 ? 'neutral' : 'o' + owner; }

  function linked(a, b) { return a.links.indexOf(b.id) !== -1; }

  function setStatus(msg, temp) {
    els.status.textContent = msg;
    clearTimeout(g.statusTimer);
    if (temp) {
      g.statusTimer = setTimeout(function () {
        els.status.textContent = 'Drag from your mushroom to a connected one';
      }, 1800);
    }
  }

  function logError(msg) {
    var row = document.createElement('div');
    row.textContent = String(msg);
    els.errors.appendChild(row);
    while (els.errors.children.length > 20) els.errors.removeChild(els.errors.firstChild);
  }

  function toMap(e) {
    var r = els.board.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) / r.width * M.W,
      y: (e.clientY - r.top) / r.height * M.H
    };
  }

  // Nearest spot within the tap radius.
  function hit(p) {
    var best = null, bestD = HIT;
    g.nodes.forEach(function (n) {
      var d = Math.hypot(n.x - p.x, n.y - p.y);
      if (d < bestD) { bestD = d; best = n; }
    });
    return best;
  }

  // ---------- building the board ----------

  function buildBoard() {
    els.nodes.innerHTML = '';
    els.roads.innerHTML = '';
    els.armies.innerHTML = '';

    // Lakes
    g.lakes.forEach(function (l) {
      var d = document.createElement('div');
      d.className = 'lake';
      d.style.left = (l.x / M.W * 100) + '%';
      d.style.top = (l.y / M.H * 100) + '%';
      els.nodes.appendChild(d);
    });

    // Roads (each pair once)
    g.nodes.forEach(function (a) {
      a.links.forEach(function (id) {
        if (id <= a.id) return;
        var b = g.nodes[id];
        els.roads.appendChild(svgEl('line', {
          x1: a.x, y1: a.y, x2: b.x, y2: b.y, 'class': 'road'
        }));
      });
    });

    // Drag line (hidden until a drag starts)
    g.dragLine = svgEl('line', { 'class': 'drag', x1: 0, y1: 0, x2: 0, y2: 0 });
    g.dragLine.style.display = 'none';
    els.armies.appendChild(g.dragLine);

    // Spots
    g.nodes.forEach(function (n) {
      var d = document.createElement('div');
      d.className = 'node';
      d.style.left = (n.x / M.W * 100) + '%';
      d.style.top = (n.y / M.H * 100) + '%';
      d.innerHTML = '<span class="ico">' + ICON[n.type] + '</span><span class="num"></span>';
      n.el = d;
      n.num = d.querySelector('.num');
      n.shownCount = null;
      if (n.type === 'city') d.classList.add('city');
      els.nodes.appendChild(d);
    });
  }

  // ---------- starting a game ----------

  function newGame() {
    try {
      g.map = M.generate(g.players);
    } catch (err) {
      logError(err.message);
      setStatus('Could not make a map. Try New map.');
      return;
    }
    g.nodes = g.map.nodes;
    g.lakes = g.map.lakes;
    g.armies = [];
    g.drag = null;
    g.target = null;
    g.over = false;
    g.aiClock = 0;
    els.overlay.hidden = true;
    buildBoard();
    setStatus('Drag from your mushroom to a connected one');
  }

  // ---------- the rules ----------

  // Send soldiers from one spot to another along a road.
  function launch(from, to, count, owner) {
    count = Math.min(Math.floor(count), Math.floor(from.count));
    if (count <= 0) return false;
    from.count -= count;
    var a = {
      from: from,
      to: to,
      owner: owner,
      count: count,
      len: Math.max(1, Math.hypot(to.x - from.x, to.y - from.y)),
      p: 0,
      done: false,
      el: null
    };
    a.el = svgEl('g', { 'class': 'army ' + ownerClass(owner) });
    a.el.appendChild(svgEl('circle', { r: 13 }));
    var label = svgEl('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central' });
    label.textContent = String(count);
    a.el.appendChild(label);
    els.armies.appendChild(a.el);
    g.armies.push(a);
    if (owner === 0) Sound.send();
    return true;
  }

  // Soldiers reach a spot: friends join, enemies fight.
  function arrive(a) {
    var n = a.to;
    a.done = true;
    if (n.owner === a.owner) {
      n.count += a.count;
      return;
    }
    n.count -= a.count;
    if (n.count < 0) {
      var before = n.owner;
      n.owner = a.owner;
      n.count = -n.count;
      if (a.owner === 0) Sound.capture();
      else if (before === 0) Sound.lost();
    }
  }

  function step(dt) {
    if (g.over) return;

    g.nodes.forEach(function (n) {
      if (n.owner >= 0) n.count += n.rate * dt;
    });

    g.armies.forEach(function (a) {
      if (a.done) return;
      a.p += SPEED * dt / a.len;
      if (a.p >= 1) arrive(a);
    });
    g.armies = g.armies.filter(function (a) {
      if (a.done) { a.el.parentNode && a.el.parentNode.removeChild(a.el); return false; }
      return true;
    });

    g.aiClock -= dt;
    if (g.aiClock <= 0) {
      aiThink(LEVELS[g.ai]);
      g.aiClock = LEVELS[g.ai].every;
    }

    checkWin();
  }

  // Computer players: each spot with enough soldiers sends part of them
  // to the best linked neighbour (low garrison, short road).
  function aiThink(level) {
    for (var p = 1; p < g.players; p++) {
      var ready = g.nodes.filter(function (n) {
        return n.owner === p && n.count >= level.threshold;
      });
      ready.forEach(function (n) {
        var best = null, bestScore = Infinity;
        n.links.forEach(function (id) {
          var t = g.nodes[id];
          if (t.owner === p) return;
          var score = t.count + M.dist(n, t) / 40;
          if (score < bestScore) { bestScore = score; best = t; }
        });
        if (best) launch(n, best, Math.floor(n.count * level.fraction), p);
      });
    }
  }

  function checkWin() {
    // Neutral spots still left: the game goes on.
    if (g.nodes.some(function (n) { return n.owner === -1; })) return;

    var owners = {};
    g.nodes.forEach(function (n) { if (n.owner >= 0) owners[n.owner] = true; });
    g.armies.forEach(function (a) { if (!a.done) owners[a.owner] = true; });
    var list = Object.keys(owners).map(Number);

    // You are out when you hold nothing and nothing is marching.
    if (!owners[0]) return endGame(false);
    if (list.length === 1) endGame(true);
  }

  function endGame(won) {
    if (g.over) return;
    g.over = true;
    g.drag = null;
    g.dragLine.style.display = 'none';
    if (won) Sound.win(); else Sound.lost();
    els.winTitle.textContent = won ? 'You grew the whole meadow! 🎉' : 'The other mushrooms won this time 🍄';
    els.winText.textContent = won ? 'Ready for another map?' : 'Want to try again?';
    els.overlay.hidden = false;
  }

  // ---------- drawing ----------

  function render() {
    g.nodes.forEach(function (n) {
      var label = Math.floor(n.count);
      var cls = 'node' + (n.type === 'city' ? ' city' : '') + ' ' + ownerClass(n.owner);
      if (g.drag && g.drag.from === n) cls += ' source';
      if (g.target === n) cls += ' target';
      n.el.className = cls;
      if (n.shownCount !== label) {
        n.num.textContent = String(label);
        n.shownCount = label;
      }
    });

    g.armies.forEach(function (a) {
      var x = a.from.x + (a.to.x - a.from.x) * a.p;
      var y = a.from.y + (a.to.y - a.from.y) * a.p;
      a.el.setAttribute('transform', 'translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ')');
    });

    if (g.drag && g.pointer) {
      var end = g.target || g.pointer;
      var ok = g.target && linked(g.drag.from, g.target);
      g.dragLine.setAttribute('x1', g.drag.from.x);
      g.dragLine.setAttribute('y1', g.drag.from.y);
      g.dragLine.setAttribute('x2', end.x);
      g.dragLine.setAttribute('y2', end.y);
      g.dragLine.setAttribute('class', 'drag' + (g.target ? (ok ? ' ok' : ' bad') : ''));
      g.dragLine.style.display = '';
    } else {
      g.dragLine.style.display = 'none';
    }
  }

  // ---------- input ----------

  els.board.addEventListener('pointerdown', function (e) {
    if (g.over) return;
    var p = toMap(e);
    var n = hit(p);
    if (!n || n.owner !== 0 || n.count < 1) return;
    e.preventDefault();
    els.board.setPointerCapture(e.pointerId);
    g.drag = { from: n };
    g.pointer = p;
    g.target = null;
    Sound.tap();
  });

  els.board.addEventListener('pointermove', function (e) {
    if (!g.drag) return;
    var p = toMap(e);
    g.pointer = p;
    var t = hit(p);
    g.target = (t && t !== g.drag.from) ? t : null;
  });

  function endDrag(e) {
    if (!g.drag) return;
    var from = g.drag.from;
    var to = hit(toMap(e));
    g.drag = null;
    g.target = null;
    g.pointer = null;
    if (!to || to === from) return;
    if (!linked(from, to)) {
      setStatus('Not connected. Try a nearby mushroom.', true);
      return;
    }
    var sent = launch(from, to, Math.max(1, Math.floor(from.count / 2)), 0);
    if (sent) setStatus('Sent soldiers!', true);
  }

  els.board.addEventListener('pointerup', endDrag);
  els.board.addEventListener('pointercancel', function () {
    g.drag = null;
    g.target = null;
    g.pointer = null;
  });

  // ---------- settings (⚙️) ----------

  function markSeg(container, attr, value) {
    container.querySelectorAll('button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset[attr] === String(value)));
    });
  }

  els.gear.addEventListener('click', function () {
    els.panel.hidden = !els.panel.hidden;
  });

  $('seg-players').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    g.players = Number(b.dataset.players);
    markSeg($('seg-players'), 'players', g.players);
    newGame();
  });

  $('seg-ai').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    g.ai = b.dataset.ai;
    markSeg($('seg-ai'), 'ai', g.ai);
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

  els.newmap.addEventListener('click', newGame);
  els.again.addEventListener('click', newGame);

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

  newGame();
  requestAnimationFrame(frame);
})();
