// Expansion Wars — map generation.
// Coordinates are in a fixed 1000 x 640 space; the board scales them with CSS.
(function (global) {
  'use strict';

  var W = 1000, H = 640;
  var NODE_R = 34;      // spot radius (map units)
  var LAKE_R = 40;      // lake radius
  var MAX_LINK = 270;   // farthest two spots can be and still share a road

  // rate = soldiers per second when owned; garrison = [min, max] when neutral
  var TYPES = {
    factory: { rate: 1.0, garrison: [4, 7] },
    city:    { rate: 1.5, garrison: [13, 16] }
  };

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

  // Distance from point (px, py) to the segment a-b.
  function segDist(px, py, a, b) {
    var dx = b.x - a.x, dy = b.y - a.y;
    var len2 = dx * dx + dy * dy || 1;
    var t = ((px - a.x) * dx + (py - a.y) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(a.x + t * dx - px, a.y + t * dy - py);
  }

  function pathClear(a, b, lakes) {
    for (var i = 0; i < lakes.length; i++) {
      if (segDist(lakes[i].x, lakes[i].y, a, b) < LAKE_R + 8) return false;
    }
    return true;
  }

  // Every spot must be reachable from spot 0 by roads.
  function connected(nodes) {
    if (!nodes.length) return false;
    var seen = {};
    seen[0] = true;
    var stack = [nodes[0]];
    var count = 1;
    while (stack.length) {
      var n = stack.pop();
      n.links.forEach(function (id) {
        if (!seen[id]) {
          seen[id] = true;
          count++;
          stack.push(nodes[id]);
        }
      });
    }
    return count === nodes.length;
  }

  function build(playerCount) {
    var cols = 9, rows = 5, mx = 90, my = 90;
    var cw = (W - 2 * mx) / (cols - 1);
    var ch = (H - 2 * my) / (rows - 1);
    var raw = [], lakes = [];

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var p = { x: mx + c * cw + rnd(-22, 22), y: my + r * ch + rnd(-22, 22) };
        var roll = Math.random();
        if (roll < 0.14) {
          lakes.push(p);
        } else if (roll < 0.26) {
          continue; // empty ground
        } else {
          raw.push({ x: p.x, y: p.y, type: Math.random() < 0.3 ? 'city' : 'factory' });
        }
      }
    }

    // Keep spots clear of lakes.
    var nodes = raw.filter(function (n) {
      return lakes.every(function (l) { return dist(n, l) > LAKE_R + NODE_R + 6; });
    });

    nodes.forEach(function (n, i) {
      n.id = i;
      n.owner = -1;
      n.links = [];
      n.count = 0;
    });

    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var a = nodes[i], b = nodes[j];
        if (dist(a, b) <= MAX_LINK && pathClear(a, b, lakes)) {
          a.links.push(b.id);
          b.links.push(a.id);
        }
      }
    }

    if (!connected(nodes)) return null;

    var factories = nodes.filter(function (f) { return f.type === 'factory'; });
    if (factories.length < playerCount) return null;

    // Spread the flags: each new start is as far as possible from the others.
    var starts = [factories[Math.floor(Math.random() * factories.length)]];
    while (starts.length < playerCount) {
      var best = null, bestD = -1;
      factories.forEach(function (f) {
        if (starts.indexOf(f) !== -1) return;
        var d = Math.min.apply(null, starts.map(function (s) { return dist(s, f); }));
        if (d > bestD) { bestD = d; best = f; }
      });
      starts.push(best);
    }

    nodes.forEach(function (n) {
      var t = TYPES[n.type];
      n.rate = t.rate;
      n.count = Math.round(rnd(t.garrison[0], t.garrison[1]));
    });
    starts.forEach(function (s, owner) {
      s.owner = owner;
      s.count = 10;
      s.start = true;
    });

    return { nodes: nodes, lakes: lakes, playerCount: playerCount };
  }

  function generate(playerCount) {
    for (var t = 0; t < 300; t++) {
      var m = build(playerCount);
      if (m) return m;
    }
    throw new Error('Could not make a connected map. Try New map.');
  }

  global.ExpansionMap = {
    W: W,
    H: H,
    NODE_R: NODE_R,
    LAKE_R: LAKE_R,
    MAX_LINK: MAX_LINK,
    TYPES: TYPES,
    generate: generate,
    dist: dist
  };
})(window);
