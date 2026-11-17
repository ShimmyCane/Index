/* Mind Palace: the three.js renderer adapter.
   It draws a scene description (js/layout.js) and never reads or changes the knowledge database.
   It reports taps and drops to the page through MP.View.on. */
(function () {
  'use strict';
  var MP = window.MP = window.MP || {};
  var T = window.THREE;

  var ROOM = {
    meadow: { floor: '#cdeedd', wall: '#fff6e0', trim: '#8fd3b0' }, peach: { floor: '#ffe0cc', wall: '#fff6e0', trim: '#ff9f8a' },
    sky: { floor: '#d6ecfa', wall: '#ffffff', trim: '#7fb8e6' }, lilac: { floor: '#e6defa', wall: '#fff6e0', trim: '#b9a6e8' },
    sand: { floor: '#f6e7c4', wall: '#fffaf0', trim: '#e0a57c' }, night: { floor: '#6a6fa3', wall: '#9a9fce', trim: '#ffd76a' }
  };
  var WORLD = {
    grass: { top: '#c4ebb4', side: '#c9a377', under: '#a9825a', bush: '#8fd3b0' }, beach: { top: '#f7e3b0', side: '#e6c690', under: '#c9a377', bush: '#ffb37a' },
    snow: { top: '#f4f8ff', side: '#cbd9ec', under: '#a9b8d0', bush: '#c4e3f7' }, moon: { top: '#cfc8ea', side: '#b1abcf', under: '#8e88b0', bush: '#b9a6e8' },
    candy: { top: '#ffdfe6', side: '#f7b6d2', under: '#d99ab8', bush: '#ffd76a' }
  };
  var LINK = { related_to: '#b9a6e8', leads_to: '#ff9f8a', part_of: '#6cc39a', opposite_of: '#7fb8e6', reminds_me_of: '#f2c14e' };
  var FLOOR = 0.08, WALL_H = [1.1, 1.3, 1.5, 1.7, 1.9], SPEED = { slow: 5, normal: 8, fast: 14 };

  var renderer, scene, camera, canvas, sun, raycaster = new T.Raycaster();
  var content = null, overlay = null, marks = null, clouds = [];
  var groups = {};                    // id -> three group (world, room, node)
  var nodeLabels = {}, linkMeshes = [], sprites = [];
  var desc = null, flags = { hideNames: false, selected: null, beacons: [], main: null };
  var avatar = null, av = { pos: new T.Vector3(0, FLOOR, 4), heading: 0, phase: 0, moving: false, travel: null, input: [0, 0] };
  var cam = { target: new T.Vector3(), yaw: 0.6, pitch: 0.8, dist: 120 };
  var goal = { target: new T.Vector3(), yaw: 0.6, pitch: 0.8, dist: 120 };
  var inset = 0, insetB = 0, wasFirst = false, follow = false, walkMode = false, moveMode = false, spinLeft = 0, lastT = 0, time = 0;
  var handlers = { tap: null, drop: null, spinEnd: null, arrive: null };
  var mat = function (c, glow) { return MP.Objects.mat(c, glow); };
  var lin = function (c) { return MP.Objects.lin(c); };

  /* ---------- small builders ---------- */
  function mesh(parent, geo, color, x, y, z, opts) {
    var m = new T.Mesh(geo, typeof color === 'string' ? mat(color) : color);
    m.position.set(x || 0, y || 0, z || 0);
    opts = opts || {}; m.castShadow = opts.cast !== false; m.receiveShadow = !!opts.receive;
    parent.add(m); return m;
  }
  function label(text, height, opts) {
    opts = opts || {};
    text = String(text); if (text.length > 30) text = text.slice(0, 29) + '…';
    var cv = document.createElement('canvas'), x = cv.getContext('2d'), font = '700 46px Quicksand, "Avenir Next", system-ui, sans-serif';
    x.font = font; var w = Math.ceil(x.measureText(text).width) + 56; cv.width = w; cv.height = 84;
    x.font = font; x.textBaseline = 'middle'; x.textAlign = 'center';
    var r = 26; x.beginPath(); x.moveTo(r + 4, 4); x.arcTo(w - 4, 4, w - 4, 80, r); x.arcTo(w - 4, 80, 4, 80, r); x.arcTo(4, 80, 4, 4, r); x.arcTo(4, 4, w - 4, 4, r); x.closePath();
    x.fillStyle = opts.bg || '#fffdf7'; x.fill(); x.lineWidth = 6; x.strokeStyle = '#2b2a33'; x.stroke();
    x.fillStyle = '#2b2a33'; x.fillText(text, w / 2, 44);
    var tex = new T.CanvasTexture(cv); tex.encoding = T.sRGBEncoding;
    var sp = new T.Sprite(new T.SpriteMaterial({ map: tex, depthTest: !opts.onTop, transparent: true }));
    sp.scale.set(height * w / 84, height, 1); sp.userData.own = true; sp.raycast = function () {};
    sp.userData.h = height; sp.userData.ar = w / 84; sp.userData.ref = opts.ref || 17.5; sp.userData.lo = opts.lo || 0.15; sp.userData.hi = opts.hi || 2.2; sp.userData.show = true;
    sprites.push(sp);
    if (opts.onTop) sp.renderOrder = 10;
    return sp;
  }
  function strip(parent, a, b, width, thick, color, lift) {
    var va = new T.Vector3(a[0], a[1] + lift, a[2]), vb = new T.Vector3(b[0], b[1] + lift, b[2]), len = va.distanceTo(vb);
    if (len < 0.01) return null;
    var m = mesh(parent, new T.BoxGeometry(width, thick, len + 0.15), color, 0, 0, 0, { cast: false, receive: true });
    m.position.copy(va).add(vb).multiplyScalar(0.5); m.lookAt(vb); m.raycast = function () {};
    return m;
  }
  function hash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100003; return h; }

  /* ---------- the palace ---------- */
  function buildWorld(w) {
    var st = WORLD[w.style] || WORLD.grass, g = new T.Group();
    g.position.set(w.pos[0], w.pos[1], w.pos[2]); g.userData = { kind: 'world', id: w.id };
    mesh(g, new T.CylinderGeometry(w.radius, w.radius * 0.93, 1.2, 56), st.top, 0, -0.6, 0, { cast: false, receive: true });
    mesh(g, new T.CylinderGeometry(w.radius * 0.93, w.radius * 0.6, 2.6, 40), st.side, 0, -2.5, 0, { cast: false });
    var under = mesh(g, new T.ConeGeometry(w.radius * 0.6, w.radius * 0.7, 28), st.under, 0, -3.8 - w.radius * 0.35, 0, { cast: false }); under.rotation.x = Math.PI;
    mesh(g, new T.CylinderGeometry(w.plaza, w.plaza, 0.16, 36), '#fff6e0', 0, 0, 0, { cast: false, receive: true });
    // The landmark in the middle of the plaza. In Move, drag it to move the whole world.
    var h = new T.Group(); h.userData = { kind: 'worldHandle', id: w.id }; g.add(h);
    mesh(h, new T.CylinderGeometry(0.75, 0.9, 0.4, 24), st.side, 0, 0.28, 0);
    mesh(h, new T.CylinderGeometry(0.22, 0.28, 2.6, 16), '#fff6e0', 0, 1.7, 0);
    mesh(h, new T.SphereGeometry(0.55, 20, 14), mat(st.bush, true), 0, 3.3, 0);
    var sign = label(w.name, 2.4, { onTop: true, bg: '#ffe9a8', ref: 41, lo: 0.1, hi: 3.5 }); sign.position.set(0, 6, 0); g.add(sign);
    // Bushes round the rim, so each island has an edge you can read.
    var n = 9, seed = hash(w.id);
    for (var i = 0; i < n; i++) {
      var a = (i + (seed % 7) / 7) * Math.PI * 2 / n, r = w.radius * 0.9, s = 0.8 + ((seed >> (i % 5)) % 5) * 0.18;
      var b = mesh(g, new T.SphereGeometry(s, 12, 10), st.bush, Math.cos(a) * r, s * 0.55, Math.sin(a) * r); b.scale.y = 0.8;
    }
    return g;
  }

  function buildRoom(r, w) {
    var st = ROOM[r.style] || ROOM.meadow, g = new T.Group(), h = r.half, wh = WALL_H[r.tier], th = 0.3;
    g.position.set(r.pos[0] - w.pos[0], r.pos[1] - w.pos[1], r.pos[2] - w.pos[2]); g.userData = { kind: 'room', id: r.id };
    mesh(g, new T.BoxGeometry(h * 2 + 0.7, 0.4, h * 2 + 0.7), st.trim, 0, -0.16, 0, { cast: r.level > 0, receive: true });
    mesh(g, new T.BoxGeometry(h * 2, 0.16, h * 2), st.floor, 0, 0, 0, { cast: false, receive: true });
    if (r.level > 0) {     // a raised room stands on four legs
      var drop = r.pos[1] - w.pos[1];
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { mesh(g, new T.CylinderGeometry(0.28, 0.36, drop, 12), st.wall, c[0] * (h - 0.3), -drop / 2 - 0.3, c[1] * (h - 0.3)); });
    }
    // Four walls. The side that faces the plaza has the door; the side opposite is taller.
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (s) {
      var isDoor = s[0] === r.side[0] && s[1] === r.side[1], isBack = s[0] === -r.side[0] && s[1] === -r.side[1];
      var height = isBack ? wh * 1.8 : wh, along = s[0] ? 'z' : 'x';
      function seg(from, to) {
        var len = to - from, mid = (from + to) / 2;
        var geo = along === 'z' ? new T.BoxGeometry(th, height, len) : new T.BoxGeometry(len, height, th);
        mesh(g, geo, st.wall, s[0] ? s[0] * h : mid, height / 2 + FLOOR, s[1] ? s[1] * h : mid, { receive: true });
        var cap = along === 'z' ? new T.BoxGeometry(th + 0.14, 0.14, len) : new T.BoxGeometry(len, 0.14, th + 0.14);
        mesh(g, cap, st.trim, s[0] ? s[0] * h : mid, height + FLOOR + 0.07, s[1] ? s[1] * h : mid);
      }
      if (isDoor) {
        seg(-h, -1.15); seg(1.15, h);
        [-1.15, 1.15].forEach(function (o) { mesh(g, new T.BoxGeometry(0.36, 2.7, 0.36), st.trim, s[0] ? s[0] * h : o, 1.35 + FLOOR, s[1] ? s[1] * h : o); });
        mesh(g, along === 'z' ? new T.BoxGeometry(0.42, 0.36, 2.9) : new T.BoxGeometry(2.9, 0.36, 0.42), st.trim, s[0] * h, 2.85 + FLOOR, s[1] * h);
        var sign = label(r.name, 1.15, { onTop: true, ref: 26, lo: 0.12, hi: 3.2 }); sign.position.set(s[0] * h, 4.1, s[1] * h); g.add(sign);
      } else {
        seg(-h, h);
        if (isBack) for (var k = -1; k <= 1; k += 2) {
          var wg = along === 'z' ? new T.BoxGeometry(th + 0.06, wh * 0.55, 1) : new T.BoxGeometry(1, wh * 0.55, th + 0.06);
          mesh(g, wg, '#c4e3f7', s[0] ? s[0] * h : k * h * 0.45, wh * 1.15 + FLOOR, s[1] ? s[1] * h : k * h * 0.45, { cast: false });
        }
      }
    });
    // Corners grow with the room: posts, then columns, then turrets, then a flag.
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c, i) {
      var ph = [wh + 0.3, wh + 0.5, wh * 1.8 + 0.6, wh * 1.8 + 1.2, wh * 1.8 + 2][r.tier], pr = r.tier >= 3 ? 0.55 : 0.3;
      mesh(g, new T.CylinderGeometry(pr, pr * 1.1, ph, 16), st.wall, c[0] * h, ph / 2 + FLOOR, c[1] * h);
      if (r.tier >= 3) mesh(g, new T.ConeGeometry(pr * 1.35, 1.1, 16), st.trim, c[0] * h, ph + 0.55 + FLOOR, c[1] * h);
      else mesh(g, new T.SphereGeometry(pr * 1.15, 14, 10), st.trim, c[0] * h, ph + FLOOR + 0.1, c[1] * h);
      if (r.tier >= 4 && i === 0) { mesh(g, new T.CylinderGeometry(0.04, 0.04, 1.6, 8), '#4a4860', c[0] * h, ph + 1.9, c[1] * h); mesh(g, new T.BoxGeometry(0.8, 0.5, 0.04), '#ff9f8a', c[0] * h + 0.42, ph + 2.4, c[1] * h); }
    });
    return g;
  }

  function buildObject(o, room) {
    var g = new T.Group(); g.position.set(o.local[0], FLOOR, o.local[2]); g.userData = { kind: 'node', id: o.id };
    mesh(g, new T.CylinderGeometry(0.6, 0.68, 0.32, 24), '#fffdf7', 0, 0.16, 0, { receive: true });
    if (o.level >= 2) { var ring = mesh(g, new T.TorusGeometry(0.66, 0.06, 8, 28), o.level >= 4 ? '#f2c14e' : '#e0a57c', 0, 0.3, 0); ring.rotation.x = Math.PI / 2; }
    var body = MP.Objects.build(o.asset); body.scale.set(1.25, 1.25, 1.25); body.position.y = 0.32;
    body.rotation.y = Math.atan2(room.side[0], room.side[1]); g.add(body);
    if (o.level >= 4) { var st = MP.Objects.build({ kind: 'star' }); st.scale.set(0.45, 0.45, 0.45); st.position.set(0.55, 0.3, 0.55); g.add(st); }
    var l = label(o.title, 0.5); l.position.y = 2.35; g.add(l); nodeLabels[o.id] = l;
    return g;
  }

  function dispose(obj) {
    obj.traverse(function (c) {
      if (c.geometry) c.geometry.dispose();
      if (c.userData && c.userData.own && c.material) { if (c.material.map) c.material.map.dispose(); c.material.dispose(); }
    });
    if (obj.parent) obj.parent.remove(obj);
  }

  function setScene(d) {
    desc = d;
    if (content) dispose(content); if (overlay) dispose(overlay);
    content = new T.Group(); overlay = new T.Group(); scene.add(content); scene.add(overlay);
    groups = {}; nodeLabels = {}; linkMeshes = []; sprites = [];
    d.worlds.forEach(function (w) { groups[w.id] = buildWorld(w); content.add(groups[w.id]); });
    d.rooms.forEach(function (r) { var w = d.byId[r.worldId]; groups[r.id] = buildRoom(r, w); groups[w.id].add(groups[r.id]); });
    d.objects.forEach(function (o) { var r = d.byId[o.roomId]; groups[o.id] = buildObject(o, r); groups[r.id].add(groups[o.id]); });
    d.paths.forEach(function (p) { strip(overlay, p.points[0], p.points[1], 1.7, 0.1, '#fff6e0', 0.03); });
    d.bridges.forEach(function (b) {
      var A = d.byId[b.a], B = d.byId[b.b], pts = b.points;
      strip(overlay, A.pos, pts[0], 2, 0.1, '#fff6e0', 0.02); strip(overlay, pts[pts.length - 1], B.pos, 2, 0.1, '#fff6e0', 0.02);
      for (var i = 1; i < pts.length; i++) {
        var s = strip(overlay, pts[i - 1], pts[i], 2.1, 0.18, '#d9b48a', 0.02);
        if (s) [-1, 1].forEach(function (side) {
          var post = mesh(s, new T.CylinderGeometry(0.08, 0.08, 0.9, 8), '#c49a6c', side * 0.98, 0.5, 0); post.raycast = function () {};
          var ball = mesh(s, new T.SphereGeometry(0.14, 10, 8), '#ff9f8a', side * 0.98, 1, 0); ball.raycast = function () {};
        });
      }
    });
    d.links.forEach(function (l) {
      var a = new T.Vector3(l.a[0], l.a[1], l.a[2]), b = new T.Vector3(l.b[0], l.b[1], l.b[2]), mid = a.clone().add(b).multiplyScalar(0.5);
      mid.y += 2 + a.distanceTo(b) * 0.22;
      var curve = new T.QuadraticBezierCurve3(a, mid, b);
      var m = new T.Mesh(new T.TubeGeometry(curve, 28, 0.05 + 0.07 * l.strength, 6), new T.MeshBasicMaterial({ color: lin(LINK[l.type] || LINK.related_to), transparent: true, opacity: 0.85 }));
      m.userData = { own: true, link: l }; m.raycast = function () {}; overlay.add(m); linkMeshes.push(m);
    });
    refreshMarks();
    if (!desc.worlds.length) return;
    // Keep little-me on a floor after a change.
    var gy = MP.Layout.groundAt(desc, av.pos.x, av.pos.z, av.pos.y); if (gy != null && !av.travel) av.pos.y = gy + FLOOR;
  }

  /* Things that change with selection and settings, without rebuilding the palace. */
  function refreshMarks() {
    if (marks) dispose(marks);
    marks = new T.Group(); scene.add(marks);
    var S = MP.settings, sel = flags.selected, near = {};
    if (sel) { near[sel] = 1; desc.links.forEach(function (l) { if (l.source === sel) near[l.target] = 1; if (l.target === sel) near[l.source] = 1; }); }
    Object.keys(nodeLabels).forEach(function (id) {
      nodeLabels[id].userData.show = !flags.hideNames && (S.labels === 'all' || (S.labels === 'selected' && !!near[id]));
      nodeLabels[id].userData.tag = true;
    });
    linkMeshes.forEach(function (m) {
      var l = m.userData.link, touches = sel && (l.source === sel || l.target === sel);
      m.visible = !flags.hideNames && (S.links === 'all' || (S.links === 'selected' && touches));
      m.material.opacity = touches ? 1 : 0.55;
    });
    flags.beacons.forEach(function (id) {
      var o = desc.byId[id]; if (!o) return;
      var main = id === flags.main, top = o.half ? 4 : 1.2;
      var beam = new T.Mesh(new T.CylinderGeometry(main ? 0.5 : 0.3, main ? 0.5 : 0.3, 26, 16, 1, true),
        new T.MeshBasicMaterial({ color: lin(main ? '#ffcf4a' : '#ffe9a8'), transparent: true, opacity: main ? 0.5 : 0.3, depthWrite: false, side: T.DoubleSide }));
      beam.position.set(o.pos[0], o.pos[1] + 13 + top, o.pos[2]); beam.userData = { own: true, beam: true, main: main }; beam.raycast = function () {}; marks.add(beam);
    });
    if (sel && desc.byId[sel] && desc.byId[sel].roomId) {
      var o = desc.byId[sel];
      var ring = new T.Mesh(new T.TorusGeometry(0.95, 0.09, 8, 36), new T.MeshBasicMaterial({ color: lin('#ff7b6b') }));
      ring.rotation.x = Math.PI / 2; ring.position.set(o.pos[0], o.pos[1] + FLOOR + 0.06, o.pos[2]); ring.userData = { own: true, ring: true }; ring.raycast = function () {}; marks.add(ring);
    }
    if (flags.route && flags.route.length > 1) {
      var pts = flags.route, dotGeo = new T.SphereGeometry(0.16, 8, 6), dotMat = new T.MeshBasicMaterial({ color: lin('#ff7b6b') });
      for (var i = 1; i < pts.length; i++) {
        var a = new T.Vector3().fromArray(pts[i - 1]), b = new T.Vector3().fromArray(pts[i]), len = a.distanceTo(b), n = Math.max(1, Math.round(len / 1.3));
        for (var k = 1; k <= n; k++) { var dot = new T.Mesh(dotGeo, dotMat); dot.position.copy(a).lerp(b, k / n); dot.position.y += 0.3; dot.raycast = function () {}; marks.add(dot); }
      }
    }
    if (sun) sun.castShadow = !!S.shadows;
  }
  function setFlags(f) { Object.keys(f).forEach(function (k) { flags[k] = f[k]; }); if (desc) refreshMarks(); }

  /* ---------- little-me ---------- */
  function buildAvatar() {
    var g = new T.Group(), P = {};
    function limb(x, y, len, color) {
      var pivot = new T.Group(); pivot.position.set(x, y, 0); g.add(pivot);
      mesh(pivot, new T.CylinderGeometry(0.075, 0.085, len, 10), color, 0, -len / 2, 0); return pivot;
    }
    P.legL = limb(-0.11, 0.42, 0.42, '#5d6aa8'); P.legR = limb(0.11, 0.42, 0.42, '#5d6aa8');
    mesh(g, new T.CylinderGeometry(0.19, 0.24, 0.5, 14), '#ff9f8a', 0, 0.66, 0);
    P.armL = limb(-0.27, 0.86, 0.38, '#ff9f8a'); P.armR = limb(0.27, 0.86, 0.38, '#ff9f8a');
    mesh(g, new T.SphereGeometry(0.25, 18, 14), '#ffe0c2', 0, 1.13, 0);
    var hair = mesh(g, new T.SphereGeometry(0.265, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), '#6b4a3a', 0, 1.15, -0.02); hair.rotation.x = -0.25;
    mesh(g, new T.SphereGeometry(0.035, 8, 6), '#2b2a33', -0.09, 1.14, 0.23); mesh(g, new T.SphereGeometry(0.035, 8, 6), '#2b2a33', 0.09, 1.14, 0.23);
    mesh(g, new T.BoxGeometry(0.3, 0.34, 0.14), '#8fd3b0', 0, 0.7, -0.24);
    P.arrow = mesh(g, new T.ConeGeometry(0.22, 0.4, 4), mat('#ffcf4a', true), 0, 2, 0, { cast: false }); P.arrow.rotation.x = Math.PI;
    g.traverse(function (c) { c.raycast = function () {}; });
    g.userData.parts = P; return g;
  }

  function travel(points, onArrive, faceId) {
    if (!points || points.length < 2) { if (onArrive) onArrive(); return; }
    var len = MP.Layout.routeLength(points), base = SPEED[MP.settings.speed] || 8;
    av.travel = { pts: points, i: 1, speed: Math.max(base, len / 9), done: onArrive, face: faceId };
    follow = true; goal.dist = Math.min(Math.max(goal.dist, 8), 13); goal.pitch = Math.max(0.4, Math.min(goal.pitch, 0.75));
    cam.dist = Math.min(cam.dist, 60);
  }
  function stopTravel() { av.travel = null; }

  function stepAvatar(dt) {
    var moved = false, P = avatar.userData.parts;
    if (av.travel) {
      var tr = av.travel, left = tr.speed * dt;
      while (left > 0 && tr.i < tr.pts.length) {
        var to = new T.Vector3().fromArray(tr.pts[tr.i]); to.y += FLOOR;
        var d = av.pos.distanceTo(to);
        if (d > 0.001) av.heading = Math.atan2(to.x - av.pos.x, to.z - av.pos.z);
        if (d <= left) { av.pos.copy(to); left -= d; tr.i++; } else { av.pos.lerp(to, left / d); left = 0; }
      }
      moved = true;
      if (tr.i >= tr.pts.length) {
        av.travel = null;
        var f = tr.face && desc.byId[tr.face];
        if (f) {      // face the object, and look in through the door side so the tall wall is behind it
          av.heading = Math.atan2(f.pos[0] - av.pos.x, f.pos[2] - av.pos.z);
          var fr = desc.byId[f.roomId]; goal.yaw = nearestTurn(Math.atan2(fr.side[0], fr.side[1]) + 0.35); goal.pitch = 0.74; goal.dist = 10;
        }
        if (tr.done) tr.done();
        if (handlers.arrive) handlers.arrive();
      }
    } else if (walkMode && (av.input[0] || av.input[1])) {
      var fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw), rx = -fz, rz = fx;
      var mx = fx * -av.input[1] + rx * av.input[0], mz = fz * -av.input[1] + rz * av.input[0], ml = Math.sqrt(mx * mx + mz * mz) || 1;
      var sp = 6.5 * Math.min(1, ml);
      av.pos.x += mx / ml * sp * dt; av.pos.z += mz / ml * sp * dt; av.heading = Math.atan2(mx, mz);
      var gy = MP.Layout.groundAt(desc, av.pos.x, av.pos.z, av.pos.y - FLOOR);
      if (gy != null) av.pos.y += (gy + FLOOR - av.pos.y) * Math.min(1, dt * 10);   // over open sky, little-me keeps floating at the same height
      moved = true;
    }
    av.moving = moved;
    av.phase += dt * (moved ? 11 : 0);
    var sw = moved ? Math.sin(av.phase) * 0.7 : 0;
    P.legL.rotation.x = sw; P.legR.rotation.x = -sw; P.armL.rotation.x = -sw * 0.8; P.armR.rotation.x = sw * 0.8;
    avatar.position.copy(av.pos); avatar.position.y += moved ? Math.abs(Math.sin(av.phase)) * 0.06 : 0;
    var dh = av.heading - avatar.rotation.y; while (dh > Math.PI) dh -= Math.PI * 2; while (dh < -Math.PI) dh += Math.PI * 2;
    avatar.rotation.y += dh * Math.min(1, dt * 12);
    var far = Math.max(1, Math.min(9, cam.dist / 16));
    P.arrow.scale.set(far, far, far); P.arrow.position.y = 1.75 + far * 0.3 + Math.sin(time * 3) * 0.08 * far;
    avatar.visible = !(follow && cam.dist < 1.5);
  }

  /* ---------- camera ---------- */
  function aspectFit() {      // how much of the screen is free, so "All" fits beside the panels and above the card
    var w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    return Math.min(1, (w - inset) / h) * Math.max(0.5, (h - insetB) / h);
  }
  function frame(kind, id) {
    if (!desc) return;
    stopSpin();
    var o = id && desc.byId[id];
    if (kind === 'all' || !o) {
      if (!desc.worlds.length) return;
      var c = new T.Vector3(), R = 0;
      desc.worlds.forEach(function (w) { c.add(new T.Vector3().fromArray(w.pos)); }); c.multiplyScalar(1 / desc.worlds.length);
      desc.worlds.forEach(function (w) { R = Math.max(R, c.distanceTo(new T.Vector3().fromArray(w.pos)) + w.radius); });
      goal.target.copy(c); goal.dist = R * 2.05 / aspectFit(); goal.pitch = 0.8; follow = false; return;
    }
    follow = false;
    if (o.radius) { goal.target.set(o.pos[0], o.pos[1], o.pos[2]); goal.dist = o.radius * 2.5 / aspectFit(); goal.pitch = 0.8; }
    else if (o.half) { goal.target.set(o.pos[0], o.pos[1] + 1, o.pos[2]); goal.dist = (o.half * 3.4 + 4) / aspectFit(); goal.pitch = 0.75; goal.yaw = nearestTurn(Math.atan2(o.side[0], o.side[1])); }
    else { goal.target.set(o.pos[0], o.pos[1] + 1.2, o.pos[2]); goal.dist = 7.5; goal.pitch = 0.42; var r = desc.byId[o.roomId]; goal.yaw = nearestTurn(Math.atan2(r.side[0], r.side[1])); }
  }
  function nearestTurn(yaw) { while (yaw - goal.yaw > Math.PI) yaw -= Math.PI * 2; while (yaw - goal.yaw < -Math.PI) yaw += Math.PI * 2; return yaw; }
  function followAvatar(dist) { follow = true; if (dist) goal.dist = dist; }
  function stopSpin() { if (spinLeft > 0) { spinLeft = 0; if (handlers.spinEnd) handlers.spinEnd(); } }
  function spin(on) { if (on) spinLeft = Math.PI * 4; else stopSpin(); }

  function stepCamera(dt) {
    if (spinLeft > 0) { var s = Math.min(spinLeft, dt * 0.55); goal.yaw += s; spinLeft -= s; if (spinLeft <= 0 && handlers.spinEnd) handlers.spinEnd(); }
    if (follow) goal.target.set(av.pos.x, av.pos.y + 1.15, av.pos.z);
    var minD = follow ? 0.05 : 2.5;
    goal.dist = Math.max(minD, Math.min(700, goal.dist));
    var first = follow && goal.dist < 1.5;
    if (first && !wasFirst) goal.pitch = 0.03;      // through little-me's eyes: look ahead, not at the floor
    else if (!first && wasFirst) goal.pitch = Math.max(goal.pitch, 0.5);
    wasFirst = first;
    goal.pitch = Math.max(first ? -0.7 : 0.08, Math.min(1.5, goal.pitch));
    var k = 1 - Math.exp(-dt * 7);
    cam.target.lerp(goal.target, follow ? 1 - Math.exp(-dt * 12) : k);
    cam.yaw += (goal.yaw - cam.yaw) * k; cam.pitch += (goal.pitch - cam.pitch) * k; cam.dist += (goal.dist - cam.dist) * k;
    var cp = Math.cos(cam.pitch);
    camera.position.set(cam.target.x + cam.dist * cp * Math.sin(cam.yaw), cam.target.y + cam.dist * Math.sin(cam.pitch), cam.target.z + cam.dist * cp * Math.cos(cam.yaw));
    camera.lookAt(cam.target);
    scene.fog.near = cam.dist * 1.6 + 120; scene.fog.far = cam.dist * 6 + 700;
    sun.position.set(cam.target.x + 30, cam.target.y + 55, cam.target.z + 22); sun.target.position.copy(cam.target); sun.target.updateMatrixWorld();
    var ext = Math.max(25, Math.min(110, cam.dist * 0.8)), sc = sun.shadow.camera;
    if (Math.abs(sc.right - ext) > 2) { sc.left = sc.bottom = -ext; sc.right = sc.top = ext; sc.updateProjectionMatrix(); }
  }

  /* ---------- picking and pointers ---------- */
  function setRay(x, y) {
    var r = canvas.getBoundingClientRect();
    raycaster.setFromCamera(new T.Vector2((x - r.left) / r.width * 2 - 1, -((y - r.top) / r.height) * 2 + 1), camera);
  }
  function pick(x, y) {
    if (!content) return null;
    setRay(x, y);
    var hits = raycaster.intersectObjects(content.children, true);
    for (var i = 0; i < hits.length; i++) {
      for (var o = hits[i].object; o; o = o.parent) {
        if (o.visible === false) break;
        if (o.userData && o.userData.kind) return { kind: o.userData.kind, id: o.userData.id, point: hits[i].point.toArray() };
      }
    }
    return null;
  }
  function planeHit(x, y, height) {
    setRay(x, y);
    var out = new T.Vector3();
    return raycaster.ray.intersectPlane(new T.Plane(new T.Vector3(0, 1, 0), -height), out) ? out : null;
  }

  var pointers = {}, gesture = null;
  function count() { return Object.keys(pointers).length; }
  function onDown(e) {
    canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    stopSpin();
    if (count() === 1) {
      gesture = { type: 'orbit', x0: e.clientX, y0: e.clientY, t0: performance.now(), moved: false, pan: e.button === 2 || e.shiftKey };
      if (moveMode) {
        var hit = pick(e.clientX, e.clientY), kind = hit && (hit.kind === 'worldHandle' ? 'world' : hit.kind);
        if (hit && (hit.kind === 'node' || hit.kind === 'room' || hit.kind === 'worldHandle')) {
          var obj = groups[hit.id], wp = new T.Vector3(); obj.getWorldPosition(wp);
          var ph = planeHit(e.clientX, e.clientY, wp.y);
          if (ph) gesture = { type: 'drag', kind: kind, id: hit.id, obj: obj, y: wp.y, off: wp.clone().sub(ph), start: obj.position.clone(), x0: e.clientX, y0: e.clientY, t0: performance.now(), moved: false };
        }
      }
    } else if (count() === 2) {
      if (gesture && gesture.type === 'drag') { gesture.obj.position.copy(gesture.start); overlay.visible = true; }
      gesture = { type: 'pinch', moved: true, last: pinchState() };
    }
  }
  function pinchState() {
    var k = Object.keys(pointers), a = pointers[k[0]], b = pointers[k[1]];
    return { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
  }
  function pan(dx, dy) {
    var s = goal.dist * 0.0016, fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw), rx = -fz, rz = fx;
    goal.target.x += (-dx * rx + dy * fx) * s; goal.target.z += (-dx * rz + dy * fz) * s;
    if (!walkMode) follow = false;
  }
  function onMove(e) {
    var p = pointers[e.pointerId]; if (!p || !gesture) return;
    var dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
    if (gesture.type === 'pinch' && count() >= 2) {
      var now = pinchState();
      goal.dist *= gesture.last.d / now.d; pan(now.mx - gesture.last.mx, now.my - gesture.last.my); gesture.last = now; return;
    }
    if (!gesture.moved && Math.hypot(e.clientX - gesture.x0, e.clientY - gesture.y0) < 8) return;
    gesture.moved = true;
    if (gesture.type === 'drag') {
      var ph = planeHit(e.clientX, e.clientY, gesture.y); if (!ph) return;
      var want = ph.add(gesture.off), parent = new T.Vector3(); gesture.obj.parent.getWorldPosition(parent);
      gesture.obj.position.x = want.x - parent.x; gesture.obj.position.z = want.z - parent.z; gesture.world = [want.x, gesture.y, want.z];
      overlay.visible = false; marks.visible = false;
    } else if (gesture.pan) pan(dx, dy);
    else { goal.yaw -= dx * 0.0065; goal.pitch += dy * 0.005; }
  }
  function onUp(e) {
    if (!pointers[e.pointerId]) return;
    delete pointers[e.pointerId];
    var g = gesture;
    if (count() === 0) gesture = null; else if (count() === 1) { var k = Object.keys(pointers)[0]; gesture = { type: 'orbit', x0: pointers[k].x, y0: pointers[k].y, moved: true }; }
    if (!g || e.type === 'pointercancel') { if (g && g.type === 'drag') { g.obj.position.copy(g.start); overlay.visible = true; marks.visible = true; } return; }
    if (g.type === 'drag' && g.moved && g.world) {
      overlay.visible = true; marks.visible = true;
      if (handlers.drop) handlers.drop(g.kind, g.id, g.world, function () { g.obj.position.copy(g.start); });
      return;
    }
    if (!g.moved && performance.now() - g.t0 < 600) {
      var hit = pick(e.clientX, e.clientY);
      if (handlers.tap) handlers.tap(hit);
    }
  }
  function onWheel(e) { e.preventDefault(); stopSpin(); goal.dist *= Math.exp(e.deltaY * 0.0012); }

  /* ---------- start and loop ---------- */
  function resize() {
    var w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setSize(w, h, false);
    camera.aspect = w / h;
    if (inset || insetB) camera.setViewOffset(w, h, -inset / 2, insetB / 2, w, h); else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }
  function init(cv) {
    canvas = cv;
    renderer = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
    renderer.outputEncoding = T.sRGBEncoding; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    scene = new T.Scene(); scene.fog = new T.Fog(lin('#e4f3fb'), 160, 900);
    camera = new T.PerspectiveCamera(48, 1, 0.1, 1600);
    scene.add(new T.HemisphereLight('#ffffff', lin('#f3d9c0'), 0.95));
    sun = new T.DirectionalLight(lin('#fff4e0'), 0.7); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 220; sun.shadow.bias = -0.0015; scene.add(sun); scene.add(sun.target);
    avatar = buildAvatar(); scene.add(avatar);
    var puff = new T.MeshLambertMaterial({ color: '#ffffff', transparent: true, opacity: 0.9 });
    for (var i = 0; i < 16; i++) {
      var c = new T.Group(), s = 3 + (i * 7 % 5);
      [[0, 0, 0, 1], [1.1, -0.1, 0.2, 0.75], [-1.1, -0.15, -0.1, 0.7], [0.3, 0.35, -0.3, 0.6]].forEach(function (p) {
        var m = new T.Mesh(new T.SphereGeometry(p[3], 12, 10), puff); m.position.set(p[0], p[1], p[2]); m.raycast = function () {}; c.add(m);
      });
      c.scale.set(s, s * 0.6, s); c.position.set((i * 53 % 320) - 130, -14 - (i * 17 % 26), (i * 97 % 300) - 120); c.userData.v = 0.5 + (i % 4) * 0.25;
      scene.add(c); clouds.push(c);
    }
    cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointermove', onMove);
    cv.addEventListener('pointerup', onUp); cv.addEventListener('pointercancel', onUp);
    cv.addEventListener('wheel', onWheel, { passive: false });
    cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    window.addEventListener('resize', resize); resize();
    requestAnimationFrame(loop);
  }
  function loop(t) {
    requestAnimationFrame(loop);
    var dt = Math.min(0.05, (t - lastT) / 1000 || 0.016); lastT = t; time += dt;
    if (!desc) return;
    try {
      stepAvatar(dt); stepCamera(dt);
      clouds.forEach(function (c) { c.position.x += c.userData.v * dt; if (c.position.x > 200) c.position.x = -200; });
      if (marks) marks.children.forEach(function (m) {
        if (m.userData.beam) m.material.opacity = (m.userData.main ? 0.42 : 0.26) + Math.sin(time * 4) * 0.1;
        if (m.userData.ring) { var s = 1 + Math.sin(time * 5) * 0.08; m.scale.set(s, s, 1); }
      });
      // Signs keep a readable size: smaller when close, larger from far away. Name tags fold away in the far view.
      var wp = new T.Vector3();
      sprites.forEach(function (sp) {
        var u = sp.userData, d = sp.getWorldPosition(wp).distanceTo(camera.position), f = Math.max(u.lo, Math.min(u.hi, d / u.ref));
        sp.scale.set(u.h * u.ar * f, u.h * f, 1); sp.visible = u.show && !(u.tag && d > 85);
      });
      renderer.render(scene, camera);
    } catch (e) { MP.logError('draw: ' + e.message); desc = null; }
  }

  MP.View = {
    init: init, setScene: setScene, setFlags: setFlags, frame: frame, travel: travel, stopTravel: stopTravel, pick: pick,
    followAvatar: followAvatar, spin: spin, resize: resize,
    setInset: function (left, bottom) { if (left === inset && (bottom || 0) === insetB) return; inset = left; insetB = bottom || 0; resize(); },
    on: function (name, fn) { handlers[name] = fn; },
    setWalk: function (on) { walkMode = on; if (on) { follow = true; goal.dist = Math.min(goal.dist, 9); goal.pitch = Math.min(goal.pitch, 0.6); } else av.input = [0, 0]; },
    setMove: function (on) { moveMode = on; },
    input: function (x, y) { av.input = [x, y]; if (x || y) stopTravel(); },
    turn: function (d) { goal.yaw += d; },
    zoom: function (f) { goal.dist *= f; },
    avatarPos: function () { return [av.pos.x, av.pos.y - FLOOR, av.pos.z]; },
    placeAvatar: function (p) { av.pos.set(p[0], p[1] + FLOOR, p[2]); },
    screenOf: function (id) {       // where a thing is on screen, for tests
      var g = groups[id]; if (!g) return null;
      var v = new T.Vector3(); g.getWorldPosition(v); v.y += g.userData.kind === 'node' ? 0.9 : 0.1; v.project(camera);
      var r = canvas.getBoundingClientRect(); return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height, front: v.z < 1 };
    },
    debugScene: function () { return { scene: scene, content: content, overlay: overlay, marks: marks, sprites: sprites, clouds: clouds, avatar: avatar }; },
    state: function () {
      return { yaw: goal.yaw, pitch: goal.pitch, dist: goal.dist, camDist: cam.dist, target: goal.target.toArray(), avatar: av.pos.toArray(), traveling: !!av.travel,
        follow: follow, walk: walkMode, move: moveMode, spinning: spinLeft > 0, firstPerson: !avatar.visible,
        counts: { worlds: desc ? desc.worlds.length : 0, rooms: desc ? desc.rooms.length : 0, objects: desc ? desc.objects.length : 0, links: linkMeshes.length },
        labelsShown: Object.keys(nodeLabels).filter(function (k) { return nodeLabels[k].userData.show; }).length,
        linksShown: linkMeshes.filter(function (m) { return m.visible; }).length };
    }
  };
})();
