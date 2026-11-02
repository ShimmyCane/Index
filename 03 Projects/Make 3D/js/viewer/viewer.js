/* Make 3D — viewer engine (Three.js). Reads a model; never changes it.
   File axes -> scene axes:  Z-up file: (x, y, z) -> (x, z, -y).  Y-up file: identity.
   Orbit and zoom with mouse, trackpad or touch (one finger orbits, two fingers pinch to zoom). Tap to select.
   Scene graph: every object gets a node; children sit inside their parent group's node. At rest every node
   is the identity, so parts keep their file positions. A motion pose (js/core/motion.js) sets the node
   matrices, so a group carries its children (the banana travels with the hand). Stop puts nodes back to rest.
   Redraws only when something changed, or every frame while an animation plays (saves iPad battery). */
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
    const ZOOM_MIN = 4, ZOOM_MAX = 3000;
    let lastModel = null;
    let nodes = new Map();           // uuid -> THREE.Group (motion node)
    let meshes = [];                 // pickable meshes
    let skins = new Map();           // uuid -> { geo, o, posed } for skeleton meshes
    let dirty = true;                // redraw on the next frame
    const requestRender = () => { dirty = true; };
    // animation clock
    const anim = { motion: null, t: 0, playing: false, speed: 1, playsLeft: 0, lastNow: null, onTick: () => {} };

    const toScene = (v) => (up === 'y' ? [v[0], v[1], v[2]] : [v[0], v[2], -v[1]]);
    const sceneSizes = (type, d) => {
      if (type === 'box') return up === 'y' ? [d[0], d[1], d[2]] : [d[0], d[2], d[1]];
      return null;
    };
    const modelAxis = (i) => { const v = [0, 0, 0]; v[i] = 1; return new THREE.Vector3(...toScene(v)); };

    // Skeleton meshes (loft, sheet): vertices are absolute model coordinates, converted to scene axes.
    function skinGeometry(o) {
      const M = root.M3D;
      if (!M || !M.buildMesh || !o.shape || M.shapeIssues(o).length) return null;
      const geo = new THREE.BufferGeometry();
      const { positions, indices } = M.buildMesh(o.shape, o.type, null);
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions.length), 3));
      geo.setIndex(indices);
      writeSkin(geo, positions);
      return geo;
    }
    function writeSkin(geo, p) {
      const a = geo.attributes.position.array;
      for (let i = 0; i < p.length; i += 3) { const s = toScene([p[i], p[i + 1], p[i + 2]]); a[i] = s[0]; a[i + 1] = s[1]; a[i + 2] = s[2]; }
      geo.attributes.position.needsUpdate = true;
      geo.computeVertexNormals(); geo.computeBoundingSphere(); geo.computeBoundingBox();
    }

    function makeGeometry(o) {
      if (o.type === 'loft' || o.type === 'sheet') return skinGeometry(o);
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
      if (o.type === 'sheet') opts.side = THREE.DoubleSide;   // leaves, grass and flags show from both sides
      if (display === 'wire') return new THREE.MeshBasicMaterial({ ...opts, wireframe: true });
      return new THREE.MeshStandardMaterial({ ...opts, roughness: 0.75, metalness: 0 });
    }

    function buildModel(model) {
      while (modelRoot.children.length) {
        const c = modelRoot.children.pop();
        c.traverse((x) => { if (x.geometry) x.geometry.dispose(); if (x.material) x.material.dispose(); });
      }
      selectionHelper = null;
      nodes = new Map(); meshes = []; skins = new Map();
      const objects = (model.objects || []).filter((o) => o.uuid);
      // one node per object (groups too), identity at rest
      for (const o of objects) {
        const node = new THREE.Group();
        node.matrixAutoUpdate = false;
        node.userData.uuid = o.uuid;
        nodes.set(o.uuid, node);
        const geo = makeGeometry(o);
        if (!geo || !Array.isArray(o.position) || o.position.some((v) => !Number.isFinite(v))) continue;
        const mesh = new THREE.Mesh(geo, materialFor(o, model));
        if (o.type === 'loft' || o.type === 'sheet') {
          mesh.frustumCulled = false;
          skins.set(o.uuid, { geo, o, posed: false });
          mesh.userData.uuid = o.uuid;
          node.add(mesh); meshes.push(mesh);
          continue;
        }
        mesh.position.set(...toScene(o.position));
        // model axes: X, then Y, then Z (same order as origin.rotateVector)
        const qX = new THREE.Quaternion().setFromAxisAngle(modelAxis(0), ((o.rotation_x || 0) * Math.PI) / 180);
        const qY = new THREE.Quaternion().setFromAxisAngle(modelAxis(1), ((o.rotation_y || 0) * Math.PI) / 180);
        const qZ = new THREE.Quaternion().setFromAxisAngle(modelAxis(2), ((o.rotation_z || 0) * Math.PI) / 180);
        mesh.quaternion.copy(qZ).multiply(qY).multiply(qX);
        mesh.userData.uuid = o.uuid;
        if (display === 'edges') {
          const lines = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 20),
            new THREE.LineBasicMaterial({ color: INK }));
          mesh.add(lines);
        }
        node.add(mesh);
        meshes.push(mesh);
      }
      // attach each node to its parent group's node; a missing parent or a loop falls back to the root
      const byId = new Map(objects.map((o) => [o.uuid, o]));
      for (const o of objects) {
        let p = o.parent && nodes.has(o.parent) ? o.parent : null;
        const seen = new Set([o.uuid]);
        for (let q = p; q; q = (byId.get(q) || {}).parent) { if (seen.has(q)) { p = null; break; } seen.add(q); }
        (p ? nodes.get(p) : modelRoot).add(nodes.get(o.uuid));
      }
      applyPose();
      if (selected) setSelected(selected);
    }

    // ---------- animation: model-space matrix -> scene-space matrix (axis change S * M * S^-1)
    const axisMat = () => (up === 'y' ? new THREE.Matrix4()
      : new THREE.Matrix4().set(1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1));
    function applyPose() {
      const poseAt = root.M3D && root.M3D.poseAt;
      const pose = anim.motion && lastModel && poseAt ? poseAt(lastModel, anim.motion, anim.t) : {};
      const S = axisMat(), Si = S.clone().invert(), m = new THREE.Matrix4();
      for (const [uuid, node] of nodes) {
        const p = pose[uuid];
        if (p) { m.set(...p); node.matrix.copy(S).multiply(m).multiply(Si); }
        else node.matrix.identity();
        node.matrixWorldNeedsUpdate = true;
      }
      // skeleton meshes: move the vertices to follow their bent joints; back to rest when nothing bends them
      const skinAt = root.M3D && root.M3D.skinAt;
      const bent = anim.motion && lastModel && skinAt ? skinAt(lastModel, anim.motion, anim.t) : {};
      for (const [uuid, sk] of skins) {
        const G = bent[uuid];
        if (G) { writeSkin(sk.geo, root.M3D.meshPositions(sk.o.shape, sk.o.type, G)); sk.posed = true; }
        else if (sk.posed) { writeSkin(sk.geo, root.M3D.meshPositions(sk.o.shape, sk.o.type, null)); sk.posed = false; }
      }
      if (selectionHelper) { modelRoot.updateMatrixWorld(true); selectionHelper.update(); }
      requestRender();
    }

    function setMotion(motion, opts = {}) {
      anim.motion = motion && Array.isArray(motion.motions) ? motion : null;
      anim.t = 0; anim.playing = false; anim.lastNow = null;
      anim.playsLeft = 0;
      if (anim.motion && opts.autoplay) play(opts.plays || 1);
      applyPose(); tick();
    }
    const loopS = () => (anim.motion && anim.motion.loop_s > 0 ? anim.motion.loop_s : 1);
    // plays = how many loops to run, then pause at the start pose (the end of a loop is the start)
    function play(plays) {
      if (!anim.motion) return;
      anim.playsLeft = plays || Infinity;
      anim.playing = true; anim.lastNow = null;
      tick();
    }
    function pause() { anim.playing = false; anim.lastNow = null; tick(); requestRender(); }
    function seek(t) { anim.t = Math.max(0, Math.min(t, loopS())); applyPose(); tick(); }
    function tick() {
      anim.onTick({ t: anim.t, loop_s: loopS(), playing: anim.playing, has: !!anim.motion });
    }
    function step(now) {
      if (!anim.playing) return;
      if (anim.lastNow === null) { anim.lastNow = now; return; }
      const dt = Math.min((now - anim.lastNow) / 1000, 0.1);   // a hidden tab doesn't jump ahead
      anim.lastNow = now;
      anim.t += dt * anim.speed;
      if (anim.t >= loopS()) {
        anim.playsLeft -= 1;
        if (anim.playsLeft <= 0) { anim.t = 0; anim.playing = false; anim.lastNow = null; }
        else anim.t -= loopS();
      }
      applyPose(); tick();
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
        if (info.fit) {
          if (info.azimuth_deg !== undefined) theta = (info.azimuth_deg * Math.PI) / 180;
          fitTo(o, ext);
        }
      }
      requestRender();
    }

    function setOptions(opts) {
      if (opts.speed) anim.speed = opts.speed;
      if (opts.up && opts.up !== up) { up = opts.up; if (lastModel) buildModel(lastModel); }
      if (opts.display && opts.display !== display) { display = opts.display; if (lastModel) buildModel(lastModel); }
      if (opts.ground) {
        ground.visible = !!opts.ground.on; grid.visible = !!opts.ground.on;
        if (opts.ground.z !== undefined) placeGround(opts.ground.z);
      }
      requestRender();
    }

    function setSelected(uuid) {
      selected = uuid;
      if (selectionHelper) { scene.remove(selectionHelper); selectionHelper.dispose(); selectionHelper = null; }
      const mesh = meshes.find((c) => c.userData.uuid === uuid);
      if (mesh) {
        modelRoot.updateMatrixWorld(true);
        selectionHelper = new THREE.BoxHelper(mesh, SELECT);
        scene.add(selectionHelper);
      }
      requestRender();
    }

    // --- camera
    function updateCamera() {
      phi = Math.min(Math.max(phi, 0.08), Math.PI / 2 - 0.02);
      radius = Math.min(Math.max(radius, ZOOM_MIN), ZOOM_MAX);
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

    // --- input. Mouse and pen: drag orbits, wheel (or trackpad pinch) zooms, click selects.
    // Touch: one finger orbits, two fingers pinch to zoom, a tap selects. Touch uses touch events, which
    // iPad Safari delivers reliably for two fingers; the page's own pinch-zoom is blocked over the canvas.
    const zoomBy = (f) => { radius = Math.min(Math.max(radius * f, ZOOM_MIN), ZOOM_MAX); requestRender(); };
    const orbitBy = (dx, dy) => { theta -= dx * 0.008; phi -= dy * 0.008; requestRender(); };
    canvas.style.touchAction = 'none';

    let mouse = null;
    canvas.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return;
      canvas.setPointerCapture(e.pointerId);
      mouse = { x: e.clientX, y: e.clientY, moved: 0 };
    });
    canvas.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch' || !mouse) return;
      const dx = e.clientX - mouse.x, dy = e.clientY - mouse.y;
      mouse.x = e.clientX; mouse.y = e.clientY; mouse.moved += Math.abs(dx) + Math.abs(dy);
      orbitBy(dx, dy);
    });
    const endMouse = (e) => {
      if (e.pointerType === 'touch' || !mouse) return;
      if (mouse.moved < 8 && e.type === 'pointerup') pick(e.clientX, e.clientY);
      mouse = null;
    };
    canvas.addEventListener('pointerup', endMouse);
    canvas.addEventListener('pointercancel', endMouse);
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      zoomBy(Math.exp(e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)));   // ctrlKey = trackpad pinch
    }, { passive: false });

    let touch = null;   // { x, y, moved, gap, multi }
    const gapOf = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY) || 1;
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const t = e.touches;
      if (t.length === 1) touch = { x: t[0].clientX, y: t[0].clientY, moved: 0, gap: null, multi: false };
      else if (t.length >= 2) touch = Object.assign(touch || { moved: 0 }, { gap: gapOf(t), multi: true });
    }, { passive: false });
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const t = e.touches;
      if (!touch) return;
      if (t.length >= 2) {
        const gap = gapOf(t);
        if (touch.gap) zoomBy(touch.gap / gap);   // fingers apart = closer (zoom in)
        touch.gap = gap; touch.multi = true;
      } else if (t.length === 1 && !touch.multi) {
        const dx = t[0].clientX - touch.x, dy = t[0].clientY - touch.y;
        touch.x = t[0].clientX; touch.y = t[0].clientY; touch.moved += Math.abs(dx) + Math.abs(dy);
        orbitBy(dx, dy);
      }
    }, { passive: false });
    const endTouch = (e) => {
      e.preventDefault();
      if (!touch) return;
      if (e.touches.length === 0) {
        const c = e.changedTouches[0];
        if (e.type === 'touchend' && !touch.multi && touch.moved < 8 && c) pick(c.clientX, c.clientY);
        touch = null;
      } else if (e.touches.length === 1) {
        // one finger left after a pinch: don't jump into an orbit
        touch.gap = null;
        touch.x = e.touches[0].clientX; touch.y = e.touches[0].clientY;
      }
    };
    canvas.addEventListener('touchend', endTouch, { passive: false });
    canvas.addEventListener('touchcancel', endTouch, { passive: false });
    // Safari's own pinch gesture would zoom the whole page
    for (const g of ['gesturestart', 'gesturechange', 'gestureend']) {
      canvas.addEventListener(g, (e) => e.preventDefault(), { passive: false });
    }
    const raycaster = new THREE.Raycaster();
    function pick(x, y) {
      const r = canvas.getBoundingClientRect();
      const ndc = new THREE.Vector2(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObjects(meshes, false)[0];
      onSelect(hit ? hit.object.userData.uuid : null);
    }

    function render() {
      resize();
      updateCamera();
      renderer.render(scene, camera);
    }
    let raf = null;
    function loop(now) {
      step(now);
      if (dirty) { dirty = false; render(); }
      raf = requestAnimationFrame(loop);
    // the canvas can change size without a window resize (panels opening, rotation)
    if (root.ResizeObserver) new root.ResizeObserver(() => requestRender()).observe(canvas);
    }
    raf = requestAnimationFrame(loop);

    return {
      setModel, setOptions, setSelected, render, resize: () => { resize(); requestRender(); },
      onSelect(fn) { onSelect = fn; },
      resetView(origin, extent) { theta = 0.6; phi = 1.0; fitTo(origin, extent); requestRender(); },
      stop() { cancelAnimationFrame(raf); },
      // animation
      setMotion, play, pause, seek,
      onTick(fn) { anim.onTick = fn || (() => {}); tick(); },
      animState: () => ({ t: anim.t, loop_s: loopS(), playing: anim.playing, has: !!anim.motion, playsLeft: anim.playsLeft }),
      viewState: () => ({ radius, theta, phi }),
      setView(v) { if (v.target) target.set(...toScene(v.target)); if (v.radius) radius = v.radius; if (v.theta !== undefined) theta = v.theta; if (v.phi !== undefined) phi = v.phi; requestRender(); },
    };
  }

  root.M3D = Object.assign(root.M3D || {}, { createViewer });
})(typeof self !== 'undefined' ? self : globalThis);
