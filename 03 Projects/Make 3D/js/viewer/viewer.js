/* Make 3D — viewer engine (Three.js). Reads a model; never changes it.
   File axes -> scene axes:  Z-up file: (x, y, z) -> (x, z, -y).  Y-up file: identity.
   Orbit and zoom with mouse, trackpad or touch. Tap an object to select it. */
(function (root) {
  const CANVAS_BG = 0xfbf6ea, INK = 0x2d2a26, SELECT = 0x2f6fdd, GROUND = 0x8fc98a;

  function createViewer(canvas) {
    const THREE = root.THREE;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(root.devicePixelRatio || 1, 2));
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(CANVAS_BG);
    const camera = new THREE.PerspectiveCamera(35, 1, 0.5, 5000);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d2c0, 0.95));
    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(-1, 2, 1.2);
    scene.add(sun);

    const modelRoot = new THREE.Group();
    const originMarker = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 8), new THREE.MeshBasicMaterial({ color: INK }));
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(480, 480),
      new THREE.MeshStandardMaterial({ color: GROUND, side: THREE.DoubleSide }));
    ground.rotation.x = -Math.PI / 2;
    ground.visible = false;
    const grid = new THREE.GridHelper(480, 48, INK, 0xc9c1ad);
    grid.material.transparent = true; grid.material.opacity = 0.35;
    grid.visible = false;
    scene.add(modelRoot, originMarker, ground, grid);

    let up = 'z', display = 'solid', selected = null, selectionHelper = null;
    let target = new THREE.Vector3(), theta = 0.6, phi = 1.0, radius = 180;
    let onSelect = () => {};
    let lastModel = null;

    const toScene = (v) => (up === 'y' ? [v[0], v[1], v[2]] : [v[0], v[2], -v[1]]);
    const sceneSizes = (type, d) => {
      if (type === 'box') return up === 'y' ? [d[0], d[1], d[2]] : [d[0], d[2], d[1]];
      return null;
    };
    const modelYAxis = () => new THREE.Vector3(...toScene([0, 1, 0]));

    function makeGeometry(o) {
      const d = o.dimensions || [];
      const ok = d.every((x) => Number.isFinite(x) && x > 0);
      if (!ok) return null;
      switch (o.type) {
        case 'box': { const s = sceneSizes('box', d); return new THREE.BoxGeometry(s[0], s[1], s[2]); }
        case 'cylinder': return new THREE.CylinderGeometry(d[0], d[0], d[1], 24);
        case 'cone': return new THREE.CylinderGeometry(0, d[0], d[1], 24);
        case 'sphere': return new THREE.SphereGeometry(d[0], 24, 16);
        default: return null; // group
      }
    }

    function materialFor(o, model) {
      const m = (model.materials || {})[o.material] || { color: '#c9c3b5', opacity: 1 };
      const opts = { color: m.color, transparent: m.opacity < 1, opacity: m.opacity };
      if (display === 'wire') return new THREE.MeshBasicMaterial({ ...opts, wireframe: true });
      return new THREE.MeshStandardMaterial({ ...opts, roughness: 0.75, metalness: 0 });
    }

    function buildModel(model) {
      while (modelRoot.children.length) {
        const c = modelRoot.children.pop();
        c.traverse((x) => { if (x.geometry) x.geometry.dispose(); if (x.material) x.material.dispose(); });
      }
      selectionHelper = null; selected = null;
      for (const o of model.objects || []) {
        const geo = makeGeometry(o);
        if (!geo || !Array.isArray(o.position) || o.position.some((v) => !Number.isFinite(v))) continue;
        const mesh = new THREE.Mesh(geo, materialFor(o, model));
        mesh.position.set(...toScene(o.position));
        mesh.quaternion.setFromAxisAngle(modelYAxis(), ((o.rotation_y || 0) * Math.PI) / 180);
        mesh.userData.uuid = o.uuid;
        if (display === 'edges') {
          const lines = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 20),
            new THREE.LineBasicMaterial({ color: INK }));
          mesh.add(lines);
        }
        modelRoot.add(mesh);
      }
      if (selected) setSelected(selected);
    }

    // Ground height is a file coordinate along the vertical axis. In the scene that is always y.
    function placeGround(z) {
      ground.position.set(0, z, 0);
      grid.position.set(0, z + 0.05, 0);
    }

    function fitTo(origin, extent) {
      target.set(...toScene(origin));
      radius = Math.max(40, extent * 1.9);
    }

    function setModel(model, info) {
      lastModel = model;
      buildModel(model);
      const o = info && info.origin ? info.origin : [0, 0, 0];
      originMarker.position.set(...toScene(o));
      if (info && info.fullBox) {
        const f = info.fullBox;
        const ext = Math.max(f.max[0] - f.min[0], f.max[1] - f.min[1], f.max[2] - f.min[2], 24);
        if (info.fit) fitTo(o, ext);
      }
    }

    function setOptions(opts) {
      if (opts.up && opts.up !== up) { up = opts.up; if (lastModel) buildModel(lastModel); }
      if (opts.display && opts.display !== display) { display = opts.display; if (lastModel) buildModel(lastModel); }
      if (opts.ground) {
        ground.visible = !!opts.ground.on; grid.visible = !!opts.ground.on;
        if (opts.ground.z !== undefined) placeGround(opts.ground.z);
      }
    }

    function setSelected(uuid) {
      selected = uuid;
      if (selectionHelper) { scene.remove(selectionHelper); selectionHelper.dispose(); selectionHelper = null; }
      const mesh = modelRoot.children.find((c) => c.userData.uuid === uuid);
      if (mesh) {
        selectionHelper = new THREE.BoxHelper(mesh, SELECT);
        scene.add(selectionHelper);
      }
    }

    // --- camera
    function updateCamera() {
      phi = Math.min(Math.max(phi, 0.08), Math.PI / 2 - 0.02);
      radius = Math.min(Math.max(radius, 4), 3000);
      camera.position.set(
        target.x + radius * Math.sin(phi) * Math.sin(theta),
        target.y + radius * Math.cos(phi),
        target.z + radius * Math.sin(phi) * Math.cos(theta));
      camera.lookAt(target);
    }

    function resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    // --- pointer: one finger or mouse drag orbits, two fingers pinch, wheel zooms, a tap selects
    const pointers = new Map();
    let downAt = null, pinchDist = null;
    canvas.style.touchAction = 'none';
    canvas.addEventListener('pointerdown', (e) => {
      canvas.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 1) downAt = { x: e.clientX, y: e.clientY, moved: 0 };
      if (pointers.size === 2) pinchDist = pinchGap();
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!pointers.has(e.pointerId)) return;
      const prev = pointers.get(e.pointerId);
      const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 1) {
        theta -= dx * 0.008; phi -= dy * 0.008;
        if (downAt) downAt.moved += Math.abs(dx) + Math.abs(dy);
      } else if (pointers.size === 2 && pinchDist) {
        const gap = pinchGap();
        radius *= pinchDist / gap; pinchDist = gap;
      }
      render();
    });
    const endPointer = (e) => {
      const wasSingle = pointers.size === 1;
      pointers.delete(e.pointerId);
      if (wasSingle && downAt && downAt.moved < 8 && e.type === 'pointerup') pick(e.clientX, e.clientY);
      if (pointers.size < 2) pinchDist = null;
      if (pointers.size === 0) downAt = null;
    };
    canvas.addEventListener('pointerup', endPointer);
    canvas.addEventListener('pointercancel', endPointer);
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      radius *= Math.exp(e.deltaY * 0.0015);
      render();
    }, { passive: false });
    function pinchGap() {
      const [a, b] = [...pointers.values()];
      return Math.hypot(a.x - b.x, a.y - b.y) || 1;
    }
    const raycaster = new THREE.Raycaster();
    function pick(x, y) {
      const r = canvas.getBoundingClientRect();
      const ndc = new THREE.Vector2(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObjects(modelRoot.children, false)[0];
      onSelect(hit ? hit.object.userData.uuid : null);
    }

    function render() {
      resize();
      updateCamera();
      renderer.render(scene, camera);
    }
    let raf = null;
    function loop() { render(); raf = requestAnimationFrame(loop); }
    loop();

    return {
      setModel, setOptions, setSelected, render, resize,
      onSelect(fn) { onSelect = fn; },
      resetView(origin, extent) { theta = 0.6; phi = 1.0; fitTo(origin, extent); },
      stop() { cancelAnimationFrame(raf); },
    };
  }

  root.M3D = Object.assign(root.M3D || {}, { createViewer });
})(typeof self !== 'undefined' ? self : globalThis);
