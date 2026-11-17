/* Mind Palace: knowledge database -> scene description.
   The scene description is plain numbers and names. Any renderer can draw it (three.js today, Godot later).
   No DOM and no 3-D library here. */
(function () {
  'use strict';
  var root = typeof window !== 'undefined' ? window : globalThis;
  var MP = root.MP = root.MP || {};
  var PLAZA = 3.2;

  function dist2(a, b) { var dx = a[0] - b[0], dz = a[2] - b[2]; return Math.sqrt(dx * dx + dz * dz); }
  function lerp3(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }

  function build(data) {
    var M = MP.Model, desc = { worlds: [], rooms: [], objects: [], paths: [], bridges: [], links: [], byId: {} };

    data.worlds.forEach(function (w) {
      var pos = w.transform.position.slice(), radius = 12;
      data.places.forEach(function (p) {
        if (p.parent_id !== w.id) return;
        var count = data.nodes.filter(function (n) { return n.place_id === p.id; }).length;
        radius = Math.max(radius, dist2(pos, p.transform.position) + M.TIERS[M.tierFor(count)].half * 1.45 + 1.5);
      });
      var item = { id: w.id, name: w.name, style: w.style, pos: pos, radius: radius, plaza: PLAZA };
      desc.worlds.push(item); desc.byId[w.id] = item;
    });

    data.places.forEach(function (p) {
      var w = desc.byId[p.parent_id]; if (!w) return;
      var inside = data.nodes.filter(function (n) { return n.place_id === p.id; });
      var tier = M.tierFor(inside.length), half = M.TIERS[tier].half, pos = p.transform.position.slice();
      // The door faces the plaza of the room's world.
      var dx = w.pos[0] - pos[0], dz = w.pos[2] - pos[2], side = Math.abs(dx) >= Math.abs(dz) ? [dx >= 0 ? 1 : -1, 0] : [0, dz >= 0 ? 1 : -1];
      var door = [pos[0] + side[0] * half, pos[1], pos[2] + side[1] * half];
      var room = { id: p.id, name: p.name, worldId: w.id, style: p.style, pos: pos, half: half, tier: tier, tierName: M.TIERS[tier].name,
        count: inside.length, level: Math.round((pos[1] - w.pos[1]) / 3), side: side, door: door };
      desc.rooms.push(room); desc.byId[p.id] = room;
      // Path from the plaza edge to the door (a ramp when the room is on another level).
      var d = dist2(w.pos, door) || 1, start = [w.pos[0] + (door[0] - w.pos[0]) / d * PLAZA, w.pos[1], w.pos[2] + (door[2] - w.pos[2]) / d * PLAZA];
      desc.paths.push({ roomId: p.id, worldId: w.id, points: [start, door] });
      inside.forEach(function (n) {
        var l = n.transform.position || [0, 0, 0], lim = half - 0.8;
        var local = [Math.max(-lim, Math.min(lim, l[0])), 0, Math.max(-lim, Math.min(lim, l[2]))];
        var a = M.asset(n.asset_id) || { representation: 'procedural', kind: 'star' };
        var obj = { id: n.id, roomId: p.id, worldId: w.id, title: n.title, local: local, pos: [pos[0] + local[0], pos[1], pos[2] + local[2]],
          asset: { representation: a.representation, kind: a.kind, glyph: a.glyph, color: a.color },
          level: M.recallState(n.id, 'what').box };
        desc.objects.push(obj); desc.byId[n.id] = obj;
      });
    });

    // Bridges: the shortest set that joins every world (a spanning tree), so there is always one way through.
    var done = desc.worlds.length ? [desc.worlds[0]] : [], todo = desc.worlds.slice(1);
    while (todo.length) {
      var best = null;
      done.forEach(function (a) { todo.forEach(function (b) { var d = dist2(a.pos, b.pos); if (!best || d < best.d) best = { a: a, b: b, d: d }; }); });
      var A = best.a, B = best.b, pts = [], ux = (B.pos[0] - A.pos[0]) / best.d, uz = (B.pos[2] - A.pos[2]) / best.d;
      var ra = Math.min(A.radius, best.d * 0.45), rb = Math.min(B.radius, best.d * 0.45);
      var ea = [A.pos[0] + ux * ra, A.pos[1], A.pos[2] + uz * ra], eb = [B.pos[0] - ux * rb, B.pos[1], B.pos[2] - uz * rb];
      for (var i = 0; i <= 10; i++) { var t = i / 10, q = lerp3(ea, eb, t); q[1] += Math.sin(Math.PI * t) * Math.min(3, dist2(ea, eb) * 0.15); pts.push(q); }
      desc.bridges.push({ a: A.id, b: B.id, points: pts });
      done.push(B); todo.splice(todo.indexOf(B), 1);
    }

    data.relationships.forEach(function (r) {
      var a = desc.byId[r.source], b = desc.byId[r.target];
      if (a && b) desc.links.push({ id: r.id, source: r.source, target: r.target, type: r.type, strength: r.strength,
        a: [a.pos[0], a.pos[1] + 1.6, a.pos[2]], b: [b.pos[0], b.pos[1] + 1.6, b.pos[2]], cross: a.roomId !== b.roomId });
    });
    return desc;
  }

  function roomAt(desc, x, z, y) {
    var best = null;
    desc.rooms.forEach(function (r) {
      if (Math.abs(x - r.pos[0]) <= r.half && Math.abs(z - r.pos[2]) <= r.half) {
        if (!best || (y != null && Math.abs(r.pos[1] - y) < Math.abs(best.pos[1] - y))) best = r;
      }
    });
    return best;
  }
  function worldAt(desc, x, z) {
    var best = null, bd = Infinity;
    desc.worlds.forEach(function (w) { var d = dist2(w.pos, [x, 0, z]); if (d <= w.radius && d < bd) { best = w; bd = d; } });
    return best;
  }
  function nearestWorld(desc, p) {
    var best = null, bd = Infinity;
    desc.worlds.forEach(function (w) { var d = dist2(w.pos, p); if (d < bd) { best = w; bd = d; } });
    return best;
  }
  /* Height of the floor under a point, or null over open sky. */
  function groundAt(desc, x, z, y) {
    var r = roomAt(desc, x, z, y); if (r) return r.pos[1];
    var w = worldAt(desc, x, z); return w ? w.pos[1] : null;
  }

  /* Worlds to pass through, from one world to another, along the bridges. */
  function worldChain(desc, fromId, toId) {
    var prev = {}, queue = [fromId]; prev[fromId] = null;
    while (queue.length) {
      var cur = queue.shift(); if (cur === toId) break;
      desc.bridges.forEach(function (b) {
        var next = b.a === cur ? b.b : b.b === cur ? b.a : null;
        if (next && !(next in prev)) { prev[next] = { from: cur, bridge: b }; queue.push(next); }
      });
    }
    var steps = [];
    for (var at = toId; prev[at]; at = prev[at].from) steps.unshift({ to: at, from: prev[at].from, bridge: prev[at].bridge });
    return steps;
  }

  /* A walking route from a point to a room door, a memory object, or a world plaza: a list of [x, y, z] points. */
  function route(desc, from, targetId) {
    var t = desc.byId[targetId]; if (!t) return [];
    var isObj = !!t.roomId && !t.half, room = isObj ? desc.byId[t.roomId] : (t.half ? t : null);
    var world = desc.byId[room ? room.worldId : t.id];
    var pts = [from.slice()];
    var here = roomAt(desc, from[0], from[2], from[1]);
    var endPoint = null;
    if (isObj) {
      // Stand a step away from the object, on the side nearest the middle of the room.
      var dx = room.pos[0] - t.pos[0], dz = room.pos[2] - t.pos[2], d = Math.sqrt(dx * dx + dz * dz);
      if (d < 0.3) { dx = room.side[0]; dz = room.side[1]; d = 1; }
      endPoint = [t.pos[0] + dx / d * 1.5, t.pos[1], t.pos[2] + dz / d * 1.5];
    }
    if (room && here && here.id === room.id) { pts.push(endPoint || room.pos.slice()); return pts; }
    var startWorld = here ? desc.byId[here.worldId] : nearestWorld(desc, from);
    if (here) pts.push(here.door.slice());
    if (startWorld) pts.push(startWorld.pos.slice());
    if (startWorld && startWorld.id !== world.id) {
      worldChain(desc, startWorld.id, world.id).forEach(function (s) {
        var bp = s.bridge.points.slice(); if (s.bridge.a !== s.from) bp.reverse();
        bp.forEach(function (p) { pts.push(p.slice()); });
        pts.push(desc.byId[s.to].pos.slice());
      });
    }
    if (room) { pts.push(room.door.slice()); pts.push(endPoint || room.pos.slice()); }
    // Drop points that sit on top of each other.
    return pts.filter(function (p, i) { return i === 0 || dist2(p, pts[i - 1]) > 0.05 || Math.abs(p[1] - pts[i - 1][1]) > 0.05; });
  }
  function routeLength(pts) {
    var s = 0; for (var i = 1; i < pts.length; i++) { var a = pts[i - 1], b = pts[i]; s += Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2) + Math.pow(b[2] - a[2], 2)); }
    return s;
  }

  MP.Layout = { build: build, route: route, routeLength: routeLength, roomAt: roomAt, worldAt: worldAt, groundAt: groundAt, nearestWorld: nearestWorld, PLAZA: PLAZA };
})();
