/* Mind Palace: recognisable objects made from simple shapes (three.js).
   Each builder returns a group about 1.2 tall, standing on y = 0, facing +z.
   To add an object: add a row to KINDS and a builder with the same id. */
(function () {
  'use strict';
  var MP = window.MP = window.MP || {};
  var T = window.THREE;

  var KINDS = [
    ['star', 'Star', '⭐'], ['heart', 'Heart', '❤️'], ['book', 'Books', '📚'], ['lamp', 'Idea bulb', '💡'], ['key', 'Key', '🔑'], ['clock', 'Clock', '⏰'],
    ['tree', 'Tree', '🌳'], ['flower', 'Flower', '🌸'], ['apple', 'Apple', '🍎'], ['fish', 'Fish', '🐟'], ['cat', 'Cat', '🐱'], ['mountain', 'Mountain', '⛰️'],
    ['house', 'House', '🏠'], ['castle', 'Castle', '🏰'], ['boat', 'Boat', '⛵'], ['car', 'Car', '🚗'], ['rocket', 'Rocket', '🚀'], ['robot', 'Robot', '🤖'],
    ['globe', 'Earth', '🌍'], ['planet', 'Planet', '🪐'], ['sun', 'Sun', '☀️'], ['telescope', 'Telescope', '🔭'], ['gear', 'Gear', '⚙️'], ['desk', 'Drawing desk', '📐'],
    ['crown', 'Crown', '👑'], ['chest', 'Chest', '🧰'], ['drum', 'Drum', '🥁'], ['note', 'Music note', '🎵'], ['cup', 'Cup', '☕']
  ].map(function (k) { return { id: k[0], label: k[1], emoji: k[2] }; });
  var COLORS = ['#ff9f8a', '#ffb37a', '#ffd76a', '#bfe8d2', '#8fd3b0', '#9fc5e8', '#c4e3f7', '#b9a6e8', '#f7b6d2', '#f3d9a0', '#ffffff', '#8a8fa3'];
  var DEFAULT = { star: '#ffd76a', heart: '#ff8fa3', book: '#9fc5e8', lamp: '#ffe27a', key: '#f2c14e', clock: '#ff9f8a', tree: '#8fd3b0', flower: '#f7b6d2',
    apple: '#ff7b6b', fish: '#ffb37a', cat: '#f3d9a0', mountain: '#b7b3d6', house: '#ffd9a0', castle: '#d9d4ea', boat: '#c4e3f7', car: '#ff9f8a',
    rocket: '#ff9f8a', robot: '#bfe8d2', globe: '#7fb8e6', planet: '#f2a48c', sun: '#ffd76a', telescope: '#b9a6e8', gear: '#9fc5e8', desk: '#f3d9a0',
    crown: '#f2c14e', chest: '#c49a6c', drum: '#ff9f8a', note: '#b9a6e8', cup: '#ffffff' };

  var mats = {};
  function lin(c) { return new T.Color(c).convertSRGBToLinear(); }
  function mat(c, glow) {
    var k = c + (glow ? 'g' : '');
    if (!mats[k]) {
      var col = lin(c);     // colours are written as screen colours; the renderer works in linear light
      mats[k] = glow ? new T.MeshLambertMaterial({ color: col, emissive: col, emissiveIntensity: 0.55 }) : new T.MeshLambertMaterial({ color: col });
    }
    return mats[k];
  }
  function add(g, geo, c, x, y, z, rx, ry, rz, glow) {
    var m = new T.Mesh(geo, mat(c, glow));
    m.position.set(x || 0, y || 0, z || 0); m.rotation.set(rx || 0, ry || 0, rz || 0);
    m.castShadow = true; g.add(m); return m;
  }
  function box(g, c, w, h, d, x, y, z, rx, ry, rz) { return add(g, new T.BoxGeometry(w, h, d), c, x, y, z, rx, ry, rz); }
  function cyl(g, c, rt, rb, h, x, y, z, rx, ry, rz, seg) { return add(g, new T.CylinderGeometry(rt, rb, h, seg || 20), c, x, y, z, rx, ry, rz); }
  function sph(g, c, r, x, y, z, sx, sy, sz, glow) { var m = add(g, new T.SphereGeometry(r, 20, 14), c, x, y, z, 0, 0, 0, glow); m.scale.set(sx || 1, sy || 1, sz || 1); return m; }
  function cone(g, c, r, h, x, y, z, rx, ry, rz, seg) { return add(g, new T.ConeGeometry(r, h, seg || 18), c, x, y, z, rx, ry, rz); }
  function tor(g, c, R, r, x, y, z, rx, ry, rz) { return add(g, new T.TorusGeometry(R, r, 10, 28), c, x, y, z, rx, ry, rz); }
  function extrude(g, c, shape, depth, x, y, z, s) {
    var geo = new T.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 });
    geo.translate(0, 0, -depth / 2);
    var m = add(g, geo, c, x, y, z); m.scale.set(s, s, s); return m;
  }
  var INK = '#4a4860', WOOD = '#c49a6c', CREAM = '#fff6e0', GREEN = '#8fd3b0', GOLD = '#f2c14e', WHITE = '#ffffff', GREY = '#aeb4c6';

  var B = {
    star: function (g, c) {
      var s = new T.Shape(); for (var i = 0; i < 10; i++) { var a = i * Math.PI / 5 + Math.PI / 2, r = i % 2 ? 0.2 : 0.48; s[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); }
      cyl(g, WOOD, 0.04, 0.04, 0.35, 0, 0.17, 0); extrude(g, c, s, 0.16, 0, 0.8, 0, 1);
    },
    heart: function (g, c) {
      var s = new T.Shape(); s.moveTo(0, -0.42); s.bezierCurveTo(-0.7, 0.05, -0.38, 0.52, 0, 0.2); s.bezierCurveTo(0.38, 0.52, 0.7, 0.05, 0, -0.42);
      cyl(g, WOOD, 0.04, 0.04, 0.3, 0, 0.15, 0); extrude(g, c, s, 0.2, 0, 0.72, 0, 1);
    },
    book: function (g, c) {
      box(g, c, 0.82, 0.16, 0.6, 0, 0.08, 0); box(g, CREAM, 0.76, 0.1, 0.56, 0.03, 0.08, 0.03);
      box(g, '#ff9f8a', 0.74, 0.16, 0.54, 0, 0.26, 0, 0, 0.25, 0); box(g, '#bfe8d2', 0.66, 0.14, 0.5, 0, 0.42, 0, 0, -0.2, 0);
      box(g, '#ffd76a', 0.14, 0.62, 0.48, -0.1, 0.8, 0, 0, 0, 0.25);
    },
    lamp: function (g, c) {
      cyl(g, GREY, 0.14, 0.17, 0.22, 0, 0.11, 0); cyl(g, GREY, 0.16, 0.14, 0.08, 0, 0.26, 0);
      sph(g, c, 0.36, 0, 0.66, 0, 1, 1.05, 1, true);
      for (var i = 0; i < 6; i++) { var a = i * Math.PI / 3; box(g, GOLD, 0.05, 0.16, 0.05, Math.cos(a) * 0.52, 0.72 + Math.sin(a) * 0.1, Math.sin(a) * 0.52, 0, 0, Math.cos(a) * -1.2); }
    },
    key: function (g, c) {
      tor(g, c, 0.2, 0.07, 0, 0.92, 0); box(g, c, 0.1, 0.62, 0.1, 0, 0.42, 0);
      box(g, c, 0.2, 0.08, 0.1, 0.12, 0.2, 0); box(g, c, 0.16, 0.08, 0.1, 0.1, 0.36, 0); cyl(g, WOOD, 0.2, 0.24, 0.1, 0, 0.05, 0);
    },
    clock: function (g, c) {
      cyl(g, c, 0.44, 0.44, 0.18, 0, 0.6, 0, Math.PI / 2); cyl(g, WHITE, 0.36, 0.36, 0.2, 0, 0.6, 0, Math.PI / 2);
      box(g, INK, 0.05, 0.26, 0.04, 0, 0.72, 0.11); box(g, INK, 0.2, 0.05, 0.04, 0.09, 0.6, 0.11);
      sph(g, c, 0.1, -0.3, 1.02, 0); sph(g, c, 0.1, 0.3, 1.02, 0); box(g, INK, 0.08, 0.2, 0.1, -0.22, 0.12, 0, 0, 0, 0.3); box(g, INK, 0.08, 0.2, 0.1, 0.22, 0.12, 0, 0, 0, -0.3);
    },
    tree: function (g, c) {
      cyl(g, WOOD, 0.09, 0.14, 0.55, 0, 0.27, 0); sph(g, c, 0.4, 0, 0.85, 0); sph(g, c, 0.28, 0.26, 0.68, 0.05); sph(g, c, 0.27, -0.25, 0.72, -0.05); sph(g, c, 0.22, 0.05, 1.15, 0);
    },
    flower: function (g, c) {
      cyl(g, '#e0a57c', 0.2, 0.15, 0.24, 0, 0.12, 0); cyl(g, GREEN, 0.03, 0.03, 0.6, 0, 0.52, 0);
      sph(g, GREEN, 0.1, 0.12, 0.45, 0, 1.4, 0.4, 0.8); sph(g, '#ffd76a', 0.13, 0, 0.92, 0.04);
      for (var i = 0; i < 6; i++) { var a = i * Math.PI / 3; sph(g, c, 0.13, Math.cos(a) * 0.22, 0.92 + Math.sin(a) * 0.22, 0, 1, 1, 0.5); }
    },
    apple: function (g, c) {
      sph(g, c, 0.4, 0, 0.42, 0, 1, 0.92, 1); cyl(g, WOOD, 0.025, 0.035, 0.2, 0.02, 0.86, 0, 0, 0, -0.2); sph(g, GREEN, 0.12, 0.14, 0.9, 0, 1.3, 0.35, 0.7);
    },
    fish: function (g, c) {
      cyl(g, WOOD, 0.03, 0.03, 0.4, 0, 0.2, 0); sph(g, c, 0.34, 0, 0.7, 0, 1.45, 0.95, 0.55);
      cone(g, c, 0.26, 0.34, -0.6, 0.7, 0, 0, 0, -Math.PI / 2, 4); cone(g, c, 0.14, 0.24, 0, 1.03, 0, 0, 0, -0.5, 4);
      sph(g, WHITE, 0.07, 0.3, 0.78, 0.15); sph(g, INK, 0.035, 0.33, 0.78, 0.2);
    },
    cat: function (g, c) {
      sph(g, c, 0.32, 0, 0.32, 0, 1, 1, 1.15); sph(g, c, 0.25, 0, 0.78, 0.12);
      cone(g, c, 0.09, 0.18, -0.14, 1.04, 0.12); cone(g, c, 0.09, 0.18, 0.14, 1.04, 0.12);
      sph(g, INK, 0.035, -0.09, 0.82, 0.34); sph(g, INK, 0.035, 0.09, 0.82, 0.34); sph(g, '#ff8fa3', 0.03, 0, 0.74, 0.37);
      cyl(g, c, 0.045, 0.05, 0.5, 0.2, 0.42, -0.36, 0.5, 0, -0.4);
    },
    mountain: function (g, c) {
      cone(g, c, 0.55, 0.95, 0, 0.47, 0, 0, 0.4, 0, 6); cone(g, WHITE, 0.2, 0.34, 0, 0.79, 0, 0, 0.4, 0, 6);
      cone(g, c, 0.34, 0.55, 0.42, 0.27, 0.12, 0, 0.2, 0, 6); sph(g, GREEN, 0.12, -0.4, 0.1, 0.3);
    },
    house: function (g, c) {
      box(g, c, 0.8, 0.52, 0.7, 0, 0.26, 0); cone(g, '#ff9f8a', 0.68, 0.46, 0, 0.75, 0, 0, Math.PI / 4, 0, 4);
      box(g, WOOD, 0.18, 0.3, 0.04, 0, 0.15, 0.36); box(g, '#c4e3f7', 0.16, 0.16, 0.04, 0.24, 0.32, 0.36); box(g, '#e0a57c', 0.12, 0.3, 0.12, 0.22, 0.86, -0.1);
    },
    castle: function (g, c) {
      box(g, c, 0.7, 0.5, 0.5, 0, 0.25, 0); box(g, WOOD, 0.18, 0.28, 0.04, 0, 0.14, 0.26);
      [-0.38, 0.38].forEach(function (x) { cyl(g, c, 0.16, 0.16, 0.8, x, 0.4, 0); cone(g, '#ff9f8a', 0.2, 0.3, x, 0.95, 0); });
      for (var i = -1; i <= 1; i++) box(g, c, 0.12, 0.12, 0.5, i * 0.22, 0.56, 0);
      cyl(g, INK, 0.012, 0.012, 0.3, 0.38, 1.22, 0); box(g, '#ffd76a', 0.16, 0.1, 0.02, 0.46, 1.3, 0);
    },
    boat: function (g, c) {
      box(g, WOOD, 0.9, 0.18, 0.36, 0, 0.14, 0); cone(g, WOOD, 0.18, 0.3, 0.6, 0.14, 0, 0, 0, -Math.PI / 2, 4);
      cyl(g, INK, 0.025, 0.025, 0.9, 0, 0.66, 0); var s = cone(g, c, 0.36, 0.72, 0.16, 0.68, 0, 0, 0, 0, 3); s.scale.z = 0.12;
      sph(g, '#c4e3f7', 0.5, 0, 0.02, 0, 1.2, 0.08, 0.9);
    },
    car: function (g, c) {
      box(g, c, 0.95, 0.24, 0.46, 0, 0.3, 0); box(g, '#c4e3f7', 0.48, 0.22, 0.4, -0.04, 0.52, 0);
      [[-0.3, 0.25], [0.3, 0.25], [-0.3, -0.25], [0.3, -0.25]].forEach(function (p) { cyl(g, INK, 0.14, 0.14, 0.08, p[0], 0.14, p[1], Math.PI / 2); });
      sph(g, '#ffe27a', 0.05, 0.48, 0.32, 0.14); sph(g, '#ffe27a', 0.05, 0.48, 0.32, -0.14);
    },
    rocket: function (g, c) {
      cyl(g, WHITE, 0.2, 0.22, 0.66, 0, 0.6, 0); cone(g, c, 0.2, 0.34, 0, 1.1, 0); sph(g, '#7fb8e6', 0.09, 0, 0.72, 0.17);
      for (var i = 0; i < 3; i++) { var a = i * Math.PI * 2 / 3; box(g, c, 0.05, 0.34, 0.24, Math.sin(a) * 0.27, 0.34, Math.cos(a) * 0.27, 0, a, 0); }
      cone(g, '#ffb37a', 0.13, 0.26, 0, 0.14, 0, Math.PI, 0, 0).material = mat('#ffb37a', true);
    },
    robot: function (g, c) {
      box(g, c, 0.5, 0.46, 0.34, 0, 0.5, 0); box(g, GREY, 0.4, 0.32, 0.3, 0, 0.92, 0);
      sph(g, '#ffe27a', 0.06, -0.1, 0.95, 0.15, 1, 1, 1, true); sph(g, '#ffe27a', 0.06, 0.1, 0.95, 0.15, 1, 1, 1, true);
      cyl(g, INK, 0.015, 0.015, 0.16, 0, 1.16, 0); sph(g, '#ff9f8a', 0.05, 0, 1.26, 0);
      box(g, GREY, 0.1, 0.36, 0.1, -0.33, 0.5, 0); box(g, GREY, 0.1, 0.36, 0.1, 0.33, 0.5, 0); box(g, INK, 0.14, 0.28, 0.16, -0.13, 0.14, 0); box(g, INK, 0.14, 0.28, 0.16, 0.13, 0.14, 0);
    },
    globe: function (g, c) {
      cyl(g, WOOD, 0.22, 0.26, 0.08, 0, 0.04, 0); cyl(g, WOOD, 0.03, 0.03, 0.22, 0, 0.18, 0); sph(g, c, 0.38, 0, 0.66, 0);
      [[0.2, 0.2, 0.26, 0.17], [-0.24, 0.05, 0.25, 0.15], [0.05, -0.2, 0.3, 0.14], [-0.1, 0.25, -0.24, 0.16], [0.28, -0.05, -0.2, 0.15]].forEach(function (p) { sph(g, GREEN, p[3], p[0], 0.66 + p[1], p[2], 1, 1, 0.6); });
      tor(g, GOLD, 0.44, 0.02, 0, 0.66, 0, 0, 0, 0.4);
    },
    planet: function (g, c) {
      cyl(g, INK, 0.02, 0.02, 0.34, 0, 0.17, 0); sph(g, c, 0.36, 0, 0.68, 0);
      var r = tor(g, '#fff6e0', 0.56, 0.035, 0, 0.68, 0, Math.PI / 2 - 0.35, 0.2, 0); r.scale.set(1, 1, 0.5); sph(g, WHITE, 0.07, 0.5, 0.98, -0.2);
    },
    sun: function (g, c) {
      cyl(g, INK, 0.02, 0.02, 0.3, 0, 0.15, 0); sph(g, c, 0.34, 0, 0.72, 0, 1, 1, 1, true);
      for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4; cone(g, '#ffb37a', 0.07, 0.2, Math.cos(a) * 0.5, 0.72 + Math.sin(a) * 0.5, 0, 0, 0, a - Math.PI / 2, 8); }
    },
    telescope: function (g, c) {
      for (var i = 0; i < 3; i++) { var a = i * Math.PI * 2 / 3; cyl(g, WOOD, 0.025, 0.025, 0.7, Math.sin(a) * 0.17, 0.32, Math.cos(a) * 0.17, Math.cos(a) * 0.5, 0, -Math.sin(a) * 0.5); }
      cyl(g, c, 0.12, 0.08, 0.8, 0, 0.82, 0, 0, 0, -0.95); cyl(g, GOLD, 0.13, 0.13, 0.08, 0.32, 1.05, 0, 0, 0, -0.95);
    },
    gear: function (g, c) {
      box(g, WOOD, 0.3, 0.12, 0.24, 0, 0.06, 0); cyl(g, c, 0.36, 0.36, 0.16, 0, 0.66, 0, Math.PI / 2);
      for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4; box(g, c, 0.16, 0.16, 0.16, Math.cos(a) * 0.42, 0.66 + Math.sin(a) * 0.42, 0, 0, 0, a); }
      cyl(g, INK, 0.11, 0.11, 0.18, 0, 0.66, 0, Math.PI / 2);
    },
    desk: function (g, c) {
      [[-0.36, -0.2], [0.36, -0.2], [-0.36, 0.2], [0.36, 0.2]].forEach(function (p) { box(g, WOOD, 0.06, 0.56, 0.06, p[0], 0.28, p[1]); });
      box(g, c, 0.9, 0.06, 0.62, 0, 0.66, 0, 0.42); box(g, WHITE, 0.6, 0.02, 0.42, -0.06, 0.71, 0.01, 0.42);
      box(g, '#9fc5e8', 0.5, 0.03, 0.06, 0.05, 0.75, 0.12, 0.42, 0.3); box(g, '#ff9f8a', 0.04, 0.04, 0.3, 0.38, 0.72, 0, 0.42);
    },
    crown: function (g, c) {
      cyl(g, '#f7b6d2', 0.36, 0.4, 0.14, 0, 0.07, 0); cyl(g, c, 0.32, 0.3, 0.26, 0, 0.3, 0);
      for (var i = 0; i < 6; i++) { var a = i * Math.PI / 3; cone(g, c, 0.09, 0.26, Math.cos(a) * 0.27, 0.54, Math.sin(a) * 0.27); sph(g, '#ff8fa3', 0.045, Math.cos(a) * 0.31, 0.3, Math.sin(a) * 0.31); }
    },
    chest: function (g, c) {
      box(g, c, 0.86, 0.4, 0.54, 0, 0.2, 0); var l = cyl(g, c, 0.27, 0.27, 0.86, 0, 0.4, 0, 0, 0, Math.PI / 2); l.scale.set(0.75, 1, 1);
      [-0.28, 0.28].forEach(function (x) { box(g, GOLD, 0.07, 0.42, 0.56, x, 0.2, 0); }); box(g, GOLD, 0.12, 0.14, 0.05, 0, 0.36, 0.28);
    },
    drum: function (g, c) {
      cyl(g, c, 0.38, 0.34, 0.44, 0, 0.3, 0); cyl(g, CREAM, 0.39, 0.39, 0.05, 0, 0.54, 0); tor(g, GOLD, 0.37, 0.025, 0, 0.1, 0, Math.PI / 2);
      cyl(g, WOOD, 0.02, 0.02, 0.6, -0.12, 0.74, 0.05, 0, 0, 0.9); cyl(g, WOOD, 0.02, 0.02, 0.6, 0.12, 0.76, -0.05, 0, 0, -0.9);
      sph(g, WOOD, 0.045, -0.36, 0.92, 0.05); sph(g, WOOD, 0.045, 0.36, 0.94, -0.05);
    },
    note: function (g, c) {
      cyl(g, WOOD, 0.2, 0.24, 0.08, 0, 0.04, 0); sph(g, c, 0.17, -0.18, 0.3, 0, 1.25, 0.9, 1); sph(g, c, 0.17, 0.3, 0.4, 0, 1.25, 0.9, 1);
      box(g, c, 0.05, 0.78, 0.05, -0.02, 0.68, 0); box(g, c, 0.05, 0.78, 0.05, 0.46, 0.78, 0); box(g, c, 0.52, 0.14, 0.05, 0.22, 1.08, 0, 0, 0, 0.2);
    },
    cup: function (g, c) {
      cyl(g, '#c4e3f7', 0.42, 0.36, 0.05, 0, 0.03, 0); cyl(g, c, 0.28, 0.2, 0.44, 0, 0.28, 0); cyl(g, '#8b5e3c', 0.25, 0.25, 0.02, 0, 0.5, 0);
      tor(g, c, 0.12, 0.035, 0.32, 0.3, 0); sph(g, WHITE, 0.07, -0.05, 0.72, 0); sph(g, WHITE, 0.055, 0.06, 0.9, 0); sph(g, WHITE, 0.04, -0.02, 1.05, 0);
    }
  };

  function emojiSprite(glyph) {
    var cv = document.createElement('canvas'); cv.width = cv.height = 192;
    var x = cv.getContext('2d');
    x.fillStyle = '#fffdf7'; x.beginPath(); x.arc(96, 96, 88, 0, 7); x.fill();
    x.lineWidth = 10; x.strokeStyle = '#2b2a33'; x.stroke();
    x.font = '110px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = '#2b2a33'; x.fillText(glyph, 96, 104);
    var tex = new T.CanvasTexture(cv); tex.encoding = T.sRGBEncoding;
    var sp = new T.Sprite(new T.SpriteMaterial({ map: tex })); sp.userData.own = true;
    sp.scale.set(1, 1, 1); sp.position.y = 0.8; return sp;
  }

  function build(asset) {
    var g = new T.Group();
    if (asset && asset.representation === 'emoji' && asset.glyph) {
      cyl(g, WOOD, 0.04, 0.04, 0.35, 0, 0.17, 0); g.add(emojiSprite(asset.glyph)); return g;
    }
    var kind = asset && B[asset.kind] ? asset.kind : 'star';          // a missing object falls back to a star
    B[kind](g, (asset && asset.color) || DEFAULT[kind]);
    return g;
  }

  MP.Objects = { KINDS: KINDS, COLORS: COLORS, DEFAULT: DEFAULT, build: build, mat: mat, lin: lin };
})();
