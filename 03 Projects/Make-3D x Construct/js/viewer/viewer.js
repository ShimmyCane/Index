/*
 * Make 3D x Construct: the 3-D viewer. Reads a replayed model; never changes it.
 * Needs the global THREE (vendor/three/three.min.js, r160, MIT). Classic script, works from file://.
 * Z is up, units are inches. Colour by certainty (provenance view) or by the paper-and-ink look.
 * Orbit: drag to turn, wheel or two-finger pinch to zoom, tap to select.
 */
(function (root) {
  'use strict';

  var PAPER = 0xfbf6ea, INK = 0x2b2a33;
  var LOW = [0.88, 0.647, 0.549], HIGH = [0.184, 0.365, 0.314]; // coral (low certainty) -> sage ink (high)
  var VIEWS = {
    front:   { theta: -Math.PI / 2, phi: Math.PI / 2 - 0.25 },
    side:    { theta: 0,            phi: Math.PI / 2 - 0.25 },
    top:     { theta: -Math.PI / 2, phi: 0.02 },
    oblique: { theta: -Math.PI / 4 - 0.5, phi: 0.95 }
  };

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
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(35, 1, 0.1, 2000);
    camera.up.set(0, 0, 1);
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    var sun = new THREE.DirectionalLight(0xffffff, 0.6);
    sun.position.set(40, -60, 90);
    scene.add(sun);

    var group = new THREE.Group();
    scene.add(group);
    var meshes = {};
    var mode = 'provenance';
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

    function setModel(model) {
      clearModel();
      var min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
      model.objects.forEach(function (obj) {
        if (obj.type === 'group') return;
        var geo = geometryFor(obj);
        var color = mode === 'provenance' ? lerpColor(obj.certainty.percent) : new THREE.Color(0xe9dcc2);
        var mat = new THREE.MeshLambertMaterial({ color: color });
        var mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(obj.position[0], obj.position[1], obj.position[2]);
        mesh.userData.uuid = obj.uuid;
        var edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo),
          new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.55 }));
        edges.position.copy(mesh.position);
        group.add(mesh);
        group.add(edges);
        meshes[obj.uuid] = mesh;
        var h = [obj.dimensions.x / 2, obj.dimensions.y / 2, obj.dimensions.z / 2];
        for (var i = 0; i < 3; i++) {
          min[i] = Math.min(min[i], obj.position[i] - h[i]);
          max[i] = Math.max(max[i], obj.position[i] + h[i]);
        }
      });
      if (min[0] !== Infinity) {
        target.set((min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2);
        orbit.radius = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]) * 1.9 + 4;
      }
      if (selected && meshes[selected]) select(selected);
      render();
    }

    function setMode(next, model) { mode = next; if (model) setModel(model); }

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

    return { setModel: setModel, setMode: setMode, select: select, setView: setView, render: render,
      resize: resize, snapshotViews: snapshotViews, onSelect: onSelect, start: start,
      getMode: function () { return mode; } };
  }

  var api = { create: create, VIEWS: VIEWS, lerpColor: lerpColor };
  root.M3DXC = Object.assign(root.M3DXC || {}, { viewer: api });
})(typeof window !== 'undefined' ? window : this);
