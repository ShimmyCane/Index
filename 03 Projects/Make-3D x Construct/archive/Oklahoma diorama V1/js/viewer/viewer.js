/*
 * Make 3D x Construct: the 3-D viewer. Reads a replayed model; never changes it.
 * Needs the global THREE (vendor/three/three.min.js, r160, MIT). Classic script, works from file://.
 * Z is up, units are inches. Colour by certainty (provenance view) or by the paper-and-ink look.
 * Orbit: drag to turn, wheel or two-finger pinch to zoom, tap to select.
 */
(function (root) {
  'use strict';

  var PAPER = 0xfbf6ea, INK = 0x2b2a33, DEG = Math.PI / 180;
  var LOW = [0.88, 0.647, 0.549], HIGH = [0.184, 0.365, 0.314]; // coral (low certainty) -> sage ink (high)
  var VIEWS = {
    front:   { theta: -Math.PI / 2, phi: Math.PI / 2 - 0.25 },
    side:    { theta: 0,            phi: Math.PI / 2 - 0.25 },
    top:     { theta: -Math.PI / 2, phi: 0.02 },
    oblique: { theta: -Math.PI / 4 - 0.5, phi: 0.95 }
  };

  // Material look for the 'material' mode: colour (hex) and roughness, per the material name in the model.
  var PALETTE = {
    'prairie earth': [0xc7ad80, 0.95], 'grass': [0xa8975a, 0.95], 'sage': [0x7e8a5c, 0.95],
    'painted': [0xbfd3dc, 0.85], 'hide': [0xd7b98a, 0.85], 'hide and cloth': [0xc9a77a, 0.9],
    'wood': [0x8a6a45, 0.8], 'stone': [0x8f8a80, 0.9], 'bone': [0xe6dcc6, 0.7], 'iron': [0x5e5a57, 0.5],
    'brass': [0xb5893f, 0.4], 'water': [0x6f97a8, 0.2], 'placeholder grey': [0x9b9ba3, 0.9],
    'red cloth': [0xa5473a, 0.9], 'horse bay': [0x6e4a33, 0.8], 'horse dark': [0x2e241d, 0.85],
    'clay': [0xb9a58a, 0.9], 'haze': [0xd6c3a0, 0.9], 'dark': [0x2f2a26, 0.8], 'ash': [0x9a948c, 0.95], 'default': [0xb8a88a, 0.9]
  };

  // A stable 0..1 number from a string (the uuid), so each part varies a little, the same way every time.
  function hash01(text) {
    var h = 2166136261;
    for (var i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return (h % 1000) / 1000;
  }

  function lerpColor(pct) {
    var t = Math.max(0, Math.min(1, pct / 100));
    var c = [0, 1, 2].map(function (i) { return LOW[i] + (HIGH[i] - LOW[i]) * t; });
    return new THREE.Color(c[0], c[1], c[2]);
  }

  function geometryFor(obj) {
    var d = obj.dimensions;
    if (obj.type === 'box') return new THREE.BoxGeometry(d.x, d.y, d.z);
    if (obj.type === 'sphere') return new THREE.SphereGeometry(d.x / 2, 24, 16);
    var g;
    if (obj.type === 'cylinder') g = new THREE.CylinderGeometry(d.x / 2, d.x / 2, d.z, 32);
    else g = new THREE.CylinderGeometry(0, d.x / 2, d.z, 32); // cone: point up
    g.rotateX(Math.PI / 2); // the cylinder axis was Y; make it Z
    return g;
  }

  function create(canvas) {
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(root.devicePixelRatio || 1, 2));
    renderer.setClearColor(PAPER, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    var scene = new THREE.Scene();
    // A soft sky behind the diorama: pale blue at the top, warm light at the horizon.
    var sky = document.createElement('canvas');
    sky.width = 4; sky.height = 256;
    var sctx = sky.getContext('2d');
    var grad = sctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#9fb9c8'); grad.addColorStop(0.7, '#e9dcc0'); grad.addColorStop(1, '#f2e4c8');
    sctx.fillStyle = grad; sctx.fillRect(0, 0, 4, 256);
    scene.background = new THREE.CanvasTexture(sky);
    var camera = new THREE.PerspectiveCamera(35, 1, 0.1, 2000);
    camera.up.set(0, 0, 1);
    // Late-afternoon light: a warm low sun from the west, a cool sky light from above, soft shadows.
    var sky = new THREE.HemisphereLight(0xf2f6ff, 0x8a7356, 0.85);
    scene.add(sky);
    var sun = new THREE.DirectionalLight(0xffd6a0, 2.1);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.02;
    scene.add(sun);
    scene.add(sun.target);

    var group = new THREE.Group();
    scene.add(group);
    var meshes = {};
    var mode = 'material';
    var selected = null;
    var target = new THREE.Vector3(0, 0, 3);
    var orbit = { theta: VIEWS.oblique.theta, phi: VIEWS.oblique.phi, radius: 60 };
    var pointers = {};
    var pinchStart = null;
    var drag = null;

    function clearModel() {
      while (group.children.length) {
        var m = group.children.pop();
        if (m.geometry) m.geometry.dispose();
        if (m.material) m.material.dispose();
      }
      meshes = {};
    }

    // Colour for one part, by the current mode.
    function colourFor(obj) {
      if (mode === 'provenance') return { color: lerpColor(obj.certainty.percent), rough: 0.8 };
      if (mode === 'plain') return { color: new THREE.Color(0xe9dcc2), rough: 0.9 };
      var p = PALETTE[obj.material] || PALETTE['default'];
      var j = 0.92 + 0.16 * hash01(obj.uuid);
      return { color: new THREE.Color(p[0]).multiplyScalar(j), rough: p[1] };
    }

    function setModel(model) {
      clearModel();
      var min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
      model.objects.forEach(function (obj) {
        if (obj.type === 'group') return;
        var geo = geometryFor(obj);
        var cc = colourFor(obj);
        // The painted backdrop is drawn flat, so it reads as a painted sky, not as a lit wall.
        var mat = obj.material === 'painted' && mode === 'material'
          ? new THREE.MeshBasicMaterial({ color: 0xc4d6de })
          : new THREE.MeshStandardMaterial({ color: cc.color, roughness: cc.rough, metalness: 0 });
        var mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(obj.position[0], obj.position[1], obj.position[2]);
        mesh.rotation.set((obj.rotation_x || 0) * DEG, (obj.rotation_y || 0) * DEG, (obj.rotation_z || 0) * DEG);
        mesh.userData.uuid = obj.uuid;
        group.add(mesh);
        if (mode !== 'material') {
          var edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo),
            new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.55 }));
          edges.position.copy(mesh.position);
          edges.rotation.copy(mesh.rotation);
          group.add(edges);
        }
        meshes[obj.uuid] = mesh;
        var h = [obj.dimensions.x / 2, obj.dimensions.y / 2, obj.dimensions.z / 2];
        for (var i = 0; i < 3; i++) {
          min[i] = Math.min(min[i], obj.position[i] - h[i]);
          max[i] = Math.max(max[i], obj.position[i] + h[i]);
        }
      });
      if (min[0] !== Infinity) {
        target.set((min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2);
        orbit.radius = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]) * 1.4 + 4;
        // Shadow camera covers the model; the sun sits low in the west.
        var span = Math.max(max[0] - min[0], max[1] - min[1]) * 0.8 + 6;
        var sc = sun.shadow.camera;
        sc.left = -span; sc.right = span; sc.top = span; sc.bottom = -span; sc.near = 1; sc.far = 400;
        sc.updateProjectionMatrix();
        sun.target.position.copy(target);
        sun.position.set(target.x - 70, target.y - 35, target.z + 55);
      }
      if (selected && meshes[selected]) select(selected);
      render();
    }

    function setMode(next, model) { mode = next; if (model) setModel(model); }

    // Close-up: centre the view on one part and move in until it fills the view.
    // uuids: the part, or a group and every part inside it (the page passes the list).
    function focus(uuids) {
      var list = (Array.isArray(uuids) ? uuids : [uuids]).map(function (u) { return meshes[u]; }).filter(Boolean);
      if (!list.length) return;
      var box = new THREE.Box3();
      list.forEach(function (m) { box.union(new THREE.Box3().setFromObject(m)); });
      var size = box.getSize(new THREE.Vector3()).length();
      target.copy(box.getCenter(new THREE.Vector3()));
      orbit.radius = Math.max(2, size * 1.6);
      // start from the oblique angle, so the part is seen from the front, not from behind the scene
      orbit.theta = VIEWS.oblique.theta; orbit.phi = VIEWS.oblique.phi;
      render();
    }

    function select(uuid) {
      if (selected && meshes[selected]) meshes[selected].material.emissive.setHex(0x000000);
      selected = uuid || null;
      if (selected && meshes[selected]) meshes[selected].material.emissive.setHex(0x3a3320);
    }

    function place() {
      var sp = Math.sin(orbit.phi);
      camera.position.set(
        target.x + orbit.radius * sp * Math.cos(orbit.theta),
        target.y + orbit.radius * sp * Math.sin(orbit.theta),
        target.z + orbit.radius * Math.cos(orbit.phi));
      camera.lookAt(target);
    }

    function setView(name) {
      var v = VIEWS[name];
      if (!v) return;
      orbit.theta = v.theta; orbit.phi = v.phi;
    }

    function resize() {
      var w = canvas.clientWidth || 300, h = canvas.clientHeight || 300;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    function render() { place(); renderer.render(scene, camera); }

    // Four fixed views for a review packet. Returns [{ view, dataUrl }].
    function snapshotViews(names) {
      var out = [];
      var saved = { theta: orbit.theta, phi: orbit.phi };
      resize();
      (names || ['front', 'side', 'top', 'oblique']).forEach(function (name) {
        setView(name); render();
        out.push({ view: name, dataUrl: canvas.toDataURL('image/png') });
      });
      orbit.theta = saved.theta; orbit.phi = saved.phi;
      render();
      return out;
    }

    // Pointer: one pointer drags to turn; two pinch to zoom; a tap (no drag) selects.
    canvas.addEventListener('pointerdown', function (e) {
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
      var ids = Object.keys(pointers);
      if (ids.length === 1) drag = { x: e.clientX, y: e.clientY, moved: 0 };
      if (ids.length === 2) {
        var a = pointers[ids[0]], b = pointers[ids[1]];
        pinchStart = { dist: Math.hypot(a.x - b.x, a.y - b.y), radius: orbit.radius };
        drag = null;
      }
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!pointers[e.pointerId]) return;
      var p = pointers[e.pointerId];
      var ids = Object.keys(pointers);
      if (ids.length === 2 && pinchStart) {
        pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
        var a = pointers[ids[0]], b = pointers[ids[1]];
        var dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        orbit.radius = Math.max(2, Math.min(800, pinchStart.radius * pinchStart.dist / dist));
        render();
        return;
      }
      var dx = e.clientX - p.x, dy = e.clientY - p.y;
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (drag) {
        drag.moved += Math.abs(dx) + Math.abs(dy);
        orbit.theta -= dx * 0.008;
        orbit.phi = Math.max(0.05, Math.min(Math.PI - 0.05, orbit.phi - dy * 0.008));
        render();
      }
    });
    function endPointer(e) {
      var wasSingle = drag && Object.keys(pointers).length === 1;
      delete pointers[e.pointerId];
      if (wasSingle && drag.moved < 6 && e.type === 'pointerup') pick(e);
      if (Object.keys(pointers).length < 2) pinchStart = null;
      if (Object.keys(pointers).length === 0) drag = null;
    }
    canvas.addEventListener('pointerup', endPointer);
    canvas.addEventListener('pointercancel', endPointer);
    canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      orbit.radius = Math.max(2, Math.min(800, orbit.radius * Math.exp(e.deltaY * 0.001)));
      render();
    }, { passive: false });

    var ray = new THREE.Raycaster();
    var ndc = new THREE.Vector2();
    var listeners = [];
    function pick(e) {
      var rect = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      var hits = ray.intersectObjects(group.children.filter(function (c) { return c.isMesh; }));
      var uuid = hits.length ? hits[0].object.userData.uuid : null;
      select(uuid);
      listeners.forEach(function (fn) { fn(uuid); });
    }
    function onSelect(fn) { listeners.push(fn); }

    function start() { resize(); render(); }
    root.addEventListener && root.addEventListener('resize', function () { resize(); render(); });

    return { setModel: setModel, setMode: setMode, select: select, focus: focus, setView: setView, render: render,
      resize: resize, snapshotViews: snapshotViews, onSelect: onSelect, start: start,
      getMode: function () { return mode; } };
  }

  var api = { create: create, VIEWS: VIEWS, lerpColor: lerpColor };
  root.M3DXC = Object.assign(root.M3DXC || {}, { viewer: api });
})(typeof window !== 'undefined' ? window : this);
