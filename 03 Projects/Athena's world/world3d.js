// Athena's world V2: the little isometric world. A cut-away room on an island you can turn.
// Classic script. Needs lib/three.min.js and models.js first.
//   World3D.init(container, onTap)  -> false when the browser has no WebGL
//   World3D.showHouse(house)        builds the house and its outside world
//   World3D.sync(pos, held)         puts the things where the saved positions say
//   World3D.turn(rad), zoom(f), resetView(), bounce(id), snapshot(w, h), thumb(id)
(function () {
  const { C, box, cyl, ball, cone, prism, G } = window.Toon;
  const S = 5;          // half the inside of the room (the room is 10 x 10)
  const H = 5;          // wall height
  const T = 0.45;       // wall thickness
  const IN = 4.3;       // how far from the middle a floor thing may stand
  const WALLS = {       // outward direction, and how a wall thing faces into the room
    n: { nx: 0, nz: -1, ry: 0 },
    s: { nx: 0, nz: 1, ry: Math.PI },
    e: { nx: 1, nz: 0, ry: -Math.PI / 2 },
    w: { nx: -1, nz: 0, ry: Math.PI / 2 }
  };
  const THEMES = {
    cottage: { sky: 0xDFF3FB, floor: C.wood, floor2: C.darkwood, wall: C.cream, trim: C.peach, ground: 'grass' },
    farm:    { sky: 0xE6F5DA, floor: C.wood, floor2: C.brown,    wall: C.butter, trim: C.coral, ground: 'grass' },
    barn:    { sky: 0xFDF0DA, floor: C.hay,  floor2: C.gold,     wall: C.red,    trim: C.white, ground: 'grass', planks: true },
    city:    { sky: 0xE8E2F8, floor: C.grey, floor2: C.lilac,    wall: C.sky,    trim: C.white, ground: 'roof' },
    tower:   { sky: 0xD3ECFF, floor: C.mint, floor2: C.teal,     wall: C.lilac,  trim: C.white, ground: 'tower' }
  };

  let renderer, scene, camera, container, onTap;
  let world, wallParts = {}, decor = [], itemsGroup, things = {};
  const view = { az: Math.PI / 4, el: 0.62, zoomK: 1 };
  let heldId = null, ringMesh = null, clock0 = performance.now(), last = performance.now();
  let thumbRenderer = null;

  // ---- Start ----
  function init(el0, tapHandler) {
    container = el0;
    onTap = tapHandler;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    } catch (e) { return false; }
    if (!renderer.getContext()) return false;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xcdbda6, 0.5));
    const sun = new THREE.DirectionalLight(0xffffff, 0.5);
    sun.position.set(9, 18, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, near: 1, far: 50 });
    sun.shadow.bias = -0.0008;
    scene.add(sun);
    ringMesh = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.09, 8, 40), new THREE.MeshBasicMaterial({ color: C.coral }));
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.visible = false;
    scene.add(ringMesh);
    bindPointer();
    new ResizeObserver(resize).observe(container);
    resize();
    requestAnimationFrame(loop);
    return true;
  }

  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    placeCamera(camera, w / h);
  }

  // Orthographic camera on a circle around the room: az turns it, el tips it, zoomK zooms
  function placeCamera(cam, aspect, v) {
    v = v || view;
    const half = 10.5 / v.zoomK;
    cam.left = -half * aspect; cam.right = half * aspect; cam.top = half; cam.bottom = -half;
    const r = 60;
    cam.position.set(Math.sin(v.az) * Math.cos(v.el) * r, 1.5 + Math.sin(v.el) * r, Math.cos(v.az) * Math.cos(v.el) * r);
    cam.lookAt(0, 1.2, 0);
    cam.updateProjectionMatrix();
  }

  // ---- The house and its little world ----
  function showHouse(house) {
    if (world) { scene.remove(world); disposeTree(world); }
    world = G();
    decor = [];
    wallParts = {};
    things = {};
    const th = THEMES[house.theme] || THEMES.cottage;
    scene.background = new THREE.Color(th.sky);
    buildGround(th);
    buildRoom(th);
    buildOutside(house.theme);
    itemsGroup = G();
    world.add(itemsGroup);
    scene.add(world);
  }

  function buildGround(th) {
    if (th.ground === 'grass') {
      box(world, 26, 0.6, 26, C.leaf, 0, -0.55, 0);
      box(world, 25.4, 2.2, 25.4, C.brown, 0, -1.95, 0);
      box(world, 3, 0.62, 7.6, C.cream, 0, -0.54, 9.2, { outline: false }); // the path to the door
    } else if (th.ground === 'roof') {
      box(world, 16, 0.5, 16, C.grey, 0, -0.5, 0);
      box(world, 15, 24, 15, C.peach, 0, -12.75, 0);
      windowsOn(world, 15, -2.5, -24, C.sky);
    } else {
      box(world, 14, 0.5, 14, C.grey, 0, -0.5, 0);
      box(world, 12.5, 60, 12.5, C.white, 0, -30.75, 0);
      windowsOn(world, 12.5, -2.5, -60, C.lilac);
    }
    // the floor of the room, with boards or tiles
    box(world, 2 * S + 2 * T, 0.4, 2 * S + 2 * T, th.floor, 0, -0.2, 0);
    for (let i = 0; i < 5; i++) box(world, 2 * S, 0.02, 0.12, th.floor2, 0, 0.005, -S + 1 + i * 2, { outline: false });
  }

  // Rows of windows on the four sides of a tall building
  function windowsOn(parent, w, top, bottom, color) {
    for (let y = top; y > Math.max(bottom, -28); y -= 3) {
      for (let k = -1; k <= 1; k++) {
        const a = k * w / 3.6;
        box(parent, 1.6, 1.4, 0.1, color, a, y, w / 2 + 0.05, { out: 0.05 });
        box(parent, 1.6, 1.4, 0.1, color, a, y, -w / 2 - 0.05, { out: 0.05 });
        box(parent, 0.1, 1.4, 1.6, color, w / 2 + 0.05, y, a, { out: 0.05 });
        box(parent, 0.1, 1.4, 1.6, color, -w / 2 - 0.05, y, a, { out: 0.05 });
      }
    }
  }

  // Four walls. A wall between the camera and the room drops down to a stub, so you can see in.
  function buildRoom(th) {
    Object.keys(WALLS).forEach(side => {
      const W = WALLS[side];
      const g = G();
      const along = W.nx === 0;
      const len = 2 * S + 2 * T;
      const m = box(g, along ? len : T, H, along ? T : len, th.wall, 0, H / 2, 0);
      if (th.planks) for (let i = 1; i < 6; i++) box(g, along ? len : T + 0.04, 0.06, along ? T + 0.04 : len, C.coral, 0, i * 0.85, 0, { outline: false });
      box(g, along ? len + 0.1 : T + 0.2, 0.3, along ? T + 0.2 : len + 0.1, th.trim, 0, H, 0); // top trim
      g.position.set(W.nx * (S + T / 2), 0, W.nz * (S + T / 2));
      world.add(g);
      const mounts = G();          // wall things live here, so they hide with their wall
      world.add(mounts);
      wallParts[side] = { group: g, mesh: m, mounts, cut: false, k: 1 };
    });
  }

  // ---- Outside: trees, fences, the barn, the farmhouse, the city ----
  function addDecor(obj, x, z, low) {
    obj.position.x = x; obj.position.z = z;
    world.add(obj);
    decor.push({ obj, x, z, low, k: 1, base: obj.scale.y });
    return obj;
  }
  function tree(x, z, s) {
    const g = G();
    cyl(g, 0.35, 0.45, 2.0, C.brown, 0, 1.0, 0);
    ball(g, 1.5, C.leaf, 0, 2.9, 0);
    ball(g, 1.1, C.darkleaf, 0.7, 3.6, 0.3);
    g.scale.setScalar(s || 1);
    return addDecor(g, x, z);
  }
  function flowers(x, z) {
    const g = G();
    [[0, 0, C.pink], [0.5, 0.3, C.butter], [-0.4, 0.4, C.coral]].forEach(([a, b, c]) => {
      cyl(g, 0.04, 0.04, 0.6, C.darkleaf, a, 0.3, b, { outline: false, seg: 5 });
      ball(g, 0.2, c, a, 0.65, b);
    });
    return addDecor(g, x, z, true);
  }
  function fence(x, z, len, alongX) {
    const g = G();
    for (let i = 0; i <= len; i += 1.5) box(g, 0.25, 1.2, 0.25, C.white, alongX ? i - len / 2 : 0, 0.6, alongX ? 0 : i - len / 2);
    [0.45, 0.95].forEach(y => box(g, alongX ? len : 0.12, 0.15, alongX ? 0.12 : len, C.white, 0, y, 0));
    return addDecor(g, x, z, true);
  }
  function barnOutside(x, z, ry) {
    const g = G();
    box(g, 6, 4.5, 7, C.red, 0, 2.25, 0);
    prism(g, 6.6, 2.6, 7.4, C.white, 0, 4.5, 0, { ry: Math.PI / 2 });
    box(g, 2.6, 3.0, 0.15, C.white, 0, 1.5, 3.55);
    box(g, 0.2, 3.6, 0.1, C.white, 0, 1.5, 3.65, { rz: 0.7, outline: false });
    box(g, 0.2, 3.6, 0.1, C.white, 0, 1.5, 3.65, { rz: -0.7, outline: false });
    cyl(g, 1.3, 1.3, 7, C.grey, 4.3, 3.5, -1.5);   // the silo
    ball(g, 1.3, C.sky, 4.3, 7, -1.5);
    g.rotation.y = ry || 0;
    g.scale.setScalar(0.75);
    return addDecor(g, x, z);
  }
  function farmhouseOutside(x, z, ry) {
    const g = G();
    box(g, 6, 4, 5, C.butter, 0, 2, 0);
    prism(g, 5.8, 2.6, 6.6, C.coral, 0, 4, 0);
    box(g, 1.2, 2, 0.15, C.brown, 0, 1, 2.55);
    [-1.9, 1.9].forEach(a => box(g, 1.1, 1.1, 0.15, C.sky, a, 2.4, 2.55));
    box(g, 0.8, 1.5, 0.8, C.white, 1.8, 5.2, -0.8);
    g.rotation.y = ry || 0;
    g.scale.setScalar(0.8);
    return addDecor(g, x, z);
  }
  function hay(x, z) {
    const g = G();
    box(g, 2, 1.2, 1.3, C.hay, 0, 0.6, 0);
    return addDecor(g, x, z, true);
  }
  function building(x, z, w, h, color, win) {
    const g = G();
    box(g, w, h, w, color, 0, -h / 2 + 2, 0);
    for (let y = 0.5; y > -h + 2.5; y -= 2.6) [-w / 4, w / 4].forEach(a => {
      box(g, 1.2, 1.1, 0.1, win, a, y, w / 2 + 0.05, { out: 0.04 });
      box(g, 0.1, 1.1, 1.2, win, w / 2 + 0.05, y, a, { out: 0.04 });
      box(g, 1.2, 1.1, 0.1, win, a, y, -w / 2 - 0.05, { out: 0.04 });
      box(g, 0.1, 1.1, 1.2, win, -w / 2 - 0.05, y, a, { out: 0.04 });
    });
    return addDecor(g, x, z);
  }
  function cloud(x, y, z) {
    const g = G();
    ball(g, 1.4, C.white, 0, 0, 0); ball(g, 1.0, C.white, 1.4, -0.2, 0.2); ball(g, 1.1, C.white, -1.3, -0.1, -0.2);
    g.position.y = y;
    return addDecor(g, x, z);
  }
  function buildOutside(theme) {
    if (theme === 'cottage') {
      tree(-9, -9, 1.1); tree(9.5, -8); tree(-9.5, 7, 0.9); tree(9, 9.5, 0.8);
      flowers(-7, 2); flowers(7.5, -2); flowers(3, 8); flowers(-3, -8);
      fence(0, -11.5, 18, true);
    } else if (theme === 'farm') {
      barnOutside(-9, -9, Math.PI / 4);
      tree(9.5, -9); tree(-9.5, 8.5, 0.9);
      hay(8.5, 3); hay(7.5, 6);
      fence(11.5, 0, 18, false); fence(0, 11.5, 18, true);
      flowers(-7.5, 2.5);
    } else if (theme === 'barn') {
      farmhouseOutside(-9, -9, Math.PI / 4);
      tree(9.5, -9, 1.1);
      hay(8.5, 3); hay(8.5, -2); hay(-8, 6);
      fence(11.5, 0, 18, false); fence(-11.5, 0, 18, false);
      flowers(5, 9);
    } else if (theme === 'city') {
      building(-14, -13, 9, 18, C.mint, C.white);
      building(13, -14, 8, 26, C.butter, C.sky);
      building(-14, 13, 8, 20, C.pink, C.white);
      building(14, 12, 9, 14, C.lilac, C.white);
      [[-6.5, -6.5], [6.5, -6.5]].forEach(([x, z]) => { const g = G(); cyl(g, 0.6, 0.5, 0.8, C.terracotta, 0, 0.4, 0); ball(g, 0.7, C.leaf, 0, 1.2, 0); addDecor(g, x, z, true); });
    } else {
      cloud(-11, -2, -9); cloud(11, -5, -8); cloud(-10, -8, 10); cloud(10, -3, 10);
      building(-16, -15, 7, 50, C.sky, C.white);
      building(16, -16, 6, 44, C.peach, C.white);
      const g = G(); cyl(g, 0.12, 0.12, 4, C.dark, 0, 2, 0, { seg: 6 }); ball(g, 0.3, C.coral, 0, 4.1, 0, { glow: 0.6 });
      addDecor(g, -6, -6, true);
    }
  }

  // ---- The things in the room ----
  function sync(pos, held) {
    heldId = held;
    for (const id in things) if (!pos[id]) { removeThing(id); }
    for (const id in pos) {
      const p = pos[id];
      const info = window.ITEMS[id];
      if (!info) continue;
      let t = things[id];
      const wantWall = info.zone === 'wall' && p.placed ? p.wall : null;
      if (!t) {
        const obj = info.build();
        obj.traverse(o => { o.userData.itemId = id; });
        t = things[id] = { obj, wall: undefined, bounce: 0 };
      }
      if (t.wall !== wantWall) {               // move it between the room and a wall
        if (t.obj.parent) t.obj.parent.remove(t.obj);
        (wantWall ? wallParts[wantWall].mounts : itemsGroup).add(t.obj);
        t.wall = wantWall;
      }
      t.home = homeOf(info, p);
    }
  }
  function homeOf(info, p) {
    if (!p.placed) return { x: 0, y: H + 2.2, z: 0, ry: 0, floating: true };
    if (info.zone === 'wall') {
      const W = WALLS[p.wall];
      const u = p.u;
      const x = W.nx === 0 ? u : W.nx * S;
      const z = W.nx === 0 ? W.nz * S : u;
      return { x, y: p.v, z, ry: W.ry };
    }
    return { x: p.x, y: 0, z: p.z, ry: p.rot || 0 };
  }
  function removeThing(id) {
    const t = things[id];
    if (t.obj.parent) t.obj.parent.remove(t.obj);
    disposeTree(t.obj);
    delete things[id];
  }
  function bounce(id) { if (things[id]) things[id].bounce = 1; }

  // ---- Every frame: turn walls and decor, bob the held thing, draw ----
  function frontness(nx, nz) { return nx * Math.sin(view.az) + nz * Math.cos(view.az); }
  function loop(now) {
    requestAnimationFrame(loop);
    if (!world || !container.clientWidth) return;
    const t = (now - clock0) / 1000;
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    const ease = rate => 1 - Math.exp(-rate * dt);   // the same speed at any frame rate
    for (const side in wallParts) {
      const P = wallParts[side], W = WALLS[side];
      P.cut = frontness(W.nx, W.nz) > 0.12;
      P.k += ((P.cut ? 0.1 : 1) - P.k) * ease(11);
      P.group.scale.y = P.k;
      P.mounts.visible = P.k > 0.6;
    }
    decor.forEach(d => {
      const len = Math.hypot(d.x, d.z) || 1;
      const front = !d.low && frontness(d.x / len, d.z / len) > 0.35;
      d.k += ((front ? 0.001 : 1) - d.k) * ease(9);
      d.obj.scale.y = d.k * d.base;
      d.obj.visible = d.k > 0.02;
    });
    ringMesh.visible = false;
    for (const id in things) {
      const th = things[id], h = th.home, o = th.obj;
      if (!h) continue;
      const held = id === heldId;
      const lift = held ? 0.6 + Math.sin(t * 5) * 0.35 : 0;
      o.position.x += (h.x - o.position.x) * ease(14);
      o.position.z += (h.z - o.position.z) * ease(14);
      const ty = h.y + lift;
      o.position.y += (ty - o.position.y) * ease(18);
      o.rotation.y += (shortAngle(o.rotation.y, h.floating ? view.az : h.ry)) * ease(14);
      // a squash and stretch when something lands
      if (th.bounce > 0) {
        th.bounce = Math.max(0, th.bounce - dt * 2.6);
        const s = Math.sin(th.bounce * Math.PI * 2) * th.bounce * 0.25;
        o.scale.set(1 + s, 1 - s, 1 + s);
      } else o.scale.set(1, 1, 1);
      if (held && window.ITEMS[id].zone === 'floor' && !h.floating) {
        ringMesh.visible = true;
        ringMesh.position.set(h.x, 0.06, h.z);
      }
    }
    renderer.render(scene, camera);
  }
  const shortAngle = (from, to) => { let d = (to - from) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; };

  // ---- Touch: drag turns the world, two fingers pinch, a tap places or picks ----
  function bindPointer() {
    const cv = renderer.domElement;
    cv.style.touchAction = 'none';
    const pts = new Map();
    let start = null, moved = false, pinch0 = 0, zoom0 = 1;
    cv.addEventListener('pointerdown', e => {
      cv.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) { start = { x: e.clientX, y: e.clientY, az: view.az, el: view.el }; moved = false; }
      if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); zoom0 = view.zoomK; moved = true; }
    });
    cv.addEventListener('pointermove', e => {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        setZoom(zoom0 * Math.hypot(a.x - b.x, a.y - b.y) / Math.max(pinch0, 1));
      } else if (start) {
        const dx = e.clientX - start.x, dy = e.clientY - start.y;
        if (Math.hypot(dx, dy) > 8) moved = true;
        if (moved) {
          view.az = start.az - dx * 0.01;
          view.el = Math.min(1.25, Math.max(0.3, start.el + dy * 0.006));
          resize();
        }
      }
    });
    const end = e => {
      if (!pts.has(e.pointerId)) return;
      pts.delete(e.pointerId);
      if (pts.size === 0) {
        if (!moved && start) tapAt(e.clientX, e.clientY);
        start = null;
      }
    };
    cv.addEventListener('pointerup', end);
    cv.addEventListener('pointercancel', e => { pts.delete(e.pointerId); start = null; });
    cv.addEventListener('wheel', e => { e.preventDefault(); setZoom(view.zoomK * (e.deltaY < 0 ? 1.1 : 0.9)); }, { passive: false });
  }
  function setZoom(k) { view.zoomK = Math.min(2.6, Math.max(0.6, k)); resize(); }

  // What did the tap land on? A thing in the room, a spot on the floor, a spot on a wall.
  const ray = new THREE.Raycaster();
  function tapAt(cx, cy) {
    const r = renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const pickable = [];
    for (const id in things) if (id !== heldId && things[id].obj.visible && (!things[id].wall || wallParts[things[id].wall].mounts.visible)) pickable.push(things[id].obj);
    const hit = ray.intersectObjects(pickable, true)[0];
    const heldThing = heldId && things[heldId] ? ray.intersectObject(things[heldId].obj, true)[0] : null;
    const floorPt = new THREE.Vector3();
    const onFloor = ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), floorPt);
    const floor = onFloor && Math.abs(floorPt.x) < S + 3 && Math.abs(floorPt.z) < S + 3
      ? { x: clamp(floorPt.x, -IN, IN), z: clamp(floorPt.z, -IN, IN) } : null;
    onTap({
      itemId: hit ? hit.object.userData.itemId : null,
      heldHit: !!heldThing,
      floor,
      wall: wallHit(floor)
    });
  }
  // The nearest standing wall the ray meets; or, failing that, the standing wall nearest the floor spot
  function wallHit(floor) {
    let best = null;
    for (const side in wallParts) {
      if (wallParts[side].cut) continue;
      const W = WALLS[side];
      const plane = new THREE.Plane(new THREE.Vector3(-W.nx, 0, -W.nz), S); // inner face, facing into the room
      const p = new THREE.Vector3();
      if (!ray.ray.intersectPlane(plane, p)) continue;
      const u = W.nx === 0 ? p.x : p.z;
      if (Math.abs(u) > S + 0.5 || p.y < 0 || p.y > H + 1) continue;
      const d = p.distanceTo(ray.ray.origin);
      if (!best || d < best.d) best = { d, wall: side, u, v: p.y };
    }
    if (!best && floor) {
      let near = null;
      for (const side in wallParts) {
        if (wallParts[side].cut) continue;
        const W = WALLS[side];
        const dist = S - (W.nx * floor.x + W.nz * floor.z);
        if (!near || dist < near.dist) near = { dist, wall: side, u: W.nx === 0 ? floor.x : floor.z, v: 2.8 };
      }
      best = near;
    }
    if (!best) return null;
    return { wall: best.wall, u: clamp(best.u, -3.6, 3.6), v: clamp(best.v, 1.6, 3.6) };
  }
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  // ---- View buttons ----
  function turn(rad) { view.az += rad; resize(); }
  function zoom(f) { setZoom(view.zoomK * f); }
  function resetView() { view.az = Math.PI / 4; view.el = 0.62; view.zoomK = 1; resize(); }

  // ---- Pictures: the front-page preview and the button thumbnails ----
  function offscreen(w, h) {
    if (!thumbRenderer) {
      thumbRenderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
      thumbRenderer.setPixelRatio(1);
    }
    thumbRenderer.setSize(w, h, false);
    return thumbRenderer;
  }
  function snapshot(w, h) {
    if (!world) return '';
    // settle everything at its home first, so the picture is not mid-glide
    for (const id in things) { const th = things[id]; if (th.home) { th.obj.position.set(th.home.x, th.home.y, th.home.z); th.obj.rotation.y = th.home.ry; } }
    const cam = camera.clone();
    placeCamera(cam, w / h, { az: Math.PI / 4, el: 0.62, zoomK: 1.15 });
    const saved = Object.keys(wallParts).map(s => [s, wallParts[s].group.scale.y, wallParts[s].mounts.visible]);
    for (const s in wallParts) {
      const W = WALLS[s], cut = W.nx * Math.SQRT1_2 + W.nz * Math.SQRT1_2 > 0.12;
      wallParts[s].group.scale.y = cut ? 0.1 : 1;
      wallParts[s].mounts.visible = !cut;
    }
    const savedDecor = decor.map(d => [d.obj.scale.y, d.obj.visible]);
    decor.forEach(d => { const len = Math.hypot(d.x, d.z) || 1; const front = !d.low && (d.x + d.z) / len * Math.SQRT1_2 > 0.35; d.obj.scale.y = front ? 0.001 : d.base; d.obj.visible = !front; });
    const rr = offscreen(w, h);
    rr.shadowMap.enabled = true;
    rr.render(scene, cam);
    saved.forEach(([s, k, v]) => { wallParts[s].group.scale.y = k; wallParts[s].mounts.visible = v; });
    decor.forEach((d, i) => { d.obj.scale.y = savedDecor[i][0]; d.obj.visible = savedDecor[i][1]; });
    return rr.domElement.toDataURL('image/png');
  }
  const thumbs = {};
  function thumb(id) {
    if (thumbs[id]) return thumbs[id];
    const info = window.ITEMS[id];
    if (!info) return '';
    const s = new THREE.Scene();
    s.add(new THREE.HemisphereLight(0xffffff, 0xcdbda6, 0.55));
    const d = new THREE.DirectionalLight(0xffffff, 0.45); d.position.set(5, 8, 6); s.add(d);
    const obj = info.build();
    if (info.zone === 'floor') obj.rotation.y = -Math.PI / 6;
    s.add(obj);
    const b = new THREE.Box3().setFromObject(obj), c = new THREE.Vector3(), sz = new THREE.Vector3();
    b.getCenter(c); b.getSize(sz);
    const half = Math.max(sz.x, sz.y, sz.z) * 0.62;
    const cam = new THREE.OrthographicCamera(-half, half, half, -half, 0.1, 100);
    cam.position.set(c.x + 10, c.y + 7, c.z + 14);
    cam.lookAt(c);
    const rr = offscreen(96, 96);
    rr.shadowMap.enabled = false;
    rr.setClearColor(0x000000, 0);
    rr.render(s, cam);
    thumbs[id] = rr.domElement.toDataURL('image/png');
    disposeTree(obj);
    return thumbs[id];
  }

  // Geometries are made per thing; materials are shared, so only geometries are freed
  function disposeTree(root) { root.traverse(o => { if (o.geometry && !o.userData.outline) o.geometry.dispose(); }); }

  window.World3D = { init, showHouse, sync, bounce, turn, zoom, resetView, snapshot, thumb, view };
})();
