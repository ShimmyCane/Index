// Athena's world V2: the little isometric world. Places (an island, a farm, a tower) hold one or more
// cut-away rooms. Turn it, tip it, pinch to zoom, two fingers to pan. Zoom far out to see the outside.
// Classic script. Needs lib/three.min.js and models.js first.
//   World3D.init(container, onTap)            -> false when the browser has no WebGL
//   World3D.showPlace(place, roomInfo)        place = { id, ground, rooms: [{ id, theme, cx, cz, y }] }
//                                             roomInfo = { roomId: { big, siding } }
//   World3D.setActive(roomId)                 the room being decorated (the camera looks at it)
//   World3D.sync(posByRoom, heldId)           puts the things where the saved positions say
//   World3D.turn(rad), zoom(f), resetView(), setOutside(bool), bounce(roomId, id), snapshot(w, h), thumb(id)
(function () {
  const { C, box, cyl, ball, cone, prism, G } = window.Toon;
  const H = 5;          // wall height (one storey)
  const T = 0.45;       // wall thickness
  const SMALL = 5, BIG = 8; // half the inside of a room: 10 x 10, or 16 x 16 when made bigger
  const OUT_ZOOM = 0.62;    // zoomed out further than this: the outside view
  const LIFT = 9;           // how high a building's upper floors float while you look inside
  const WALLS = {       // outward direction, and how a wall thing faces into the room
    n: { nx: 0, nz: -1, ry: 0 },
    s: { nx: 0, nz: 1, ry: Math.PI },
    e: { nx: 1, nz: 0, ry: -Math.PI / 2 },
    w: { nx: -1, nz: 0, ry: Math.PI / 2 }
  };
  const THEMES = {
    cottage:   { floor: C.wood,  floor2: C.darkwood, wall: C.cream,  trim: C.peach, skin: C.peach,  roof: C.coral },
    beach:     { floor: C.cream, floor2: C.wood,     wall: C.white,  trim: C.sky,   skin: C.sky,    roof: C.butter, stripes: C.sky },
    treehouse: { floor: C.wood,  floor2: C.brown,    wall: C.butter, trim: C.darkwood, skin: C.wood, roof: C.leaf, planks: C.darkwood },
    farm:      { floor: C.wood,  floor2: C.brown,    wall: C.butter, trim: C.coral, skin: C.butter, roof: C.coral },
    barn:      { floor: C.hay,   floor2: C.gold,     wall: C.red,    trim: C.white, skin: C.red,    roof: C.white, planks: C.coral },
    city:      { floor: C.grey,  floor2: C.lilac,    wall: C.sky,    trim: C.white, skin: C.peach,  roof: null },
    tower:     { floor: C.mint,  floor2: C.teal,     wall: C.lilac,  trim: C.white, skin: C.white,  roof: null }
  };
  const SKY = { cottage: 0xDFF3FB, beach: 0xD5F1FA, treehouse: 0xE3F4DA, farm: 0xE6F5DA, city: 0xE8E2F8, tower: 0xD3ECFF };
  // Siding bought at the Home Depot: the colour of the outside walls, and its lines
  const SIDING = {
    sidingmint:  { color: C.mint,       lines: 'h' },
    sidingpink:  { color: C.pink,       lines: 'h' },
    sidingbrick: { color: C.terracotta, lines: 'brick' },
    sidingwood:  { color: C.wood,       lines: 'v' }
  };

  let renderer, scene, camera, container, onTap;
  let world = null, place = null, rooms = {}, decor = [], uppers = [], activeId = null;
  const view = { az: Math.PI / 4, el: 0.62, zoomK: 1, panX: 0, panZ: 0, outside: false };
  let heldKey = null, ringMesh = null, clock0 = performance.now(), last = performance.now();
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
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 400);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xcdbda6, 0.5));
    const sun = new THREE.DirectionalLight(0xffffff, 0.5);
    sun.position.set(9, 18, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 120 });
    sun.shadow.bias = -0.0008;
    scene.add(sun);
    scene.add(sun.target);
    scene.userData.sun = sun;
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
  const active = () => rooms[activeId];
  const isOutside = () => view.outside || view.zoomK < OUT_ZOOM;

  // Orthographic camera on a circle around the active room
  function placeCamera(cam, aspect, v) {
    v = v || view;
    const R = active();
    const scale = R ? R.half / SMALL : 1;
    const half = 10.5 * (0.6 + 0.4 * scale) / v.zoomK;
    cam.left = -half * aspect; cam.right = half * aspect; cam.top = half; cam.bottom = -half;
    const tx = (R ? R.cx : 0) + (v.panX || 0), tz = (R ? R.cz : 0) + (v.panZ || 0), ty = (R ? R.y : 0) + 1.2;
    const r = 120;
    cam.position.set(tx + Math.sin(v.az) * Math.cos(v.el) * r, ty + Math.sin(v.el) * r, tz + Math.cos(v.az) * Math.cos(v.el) * r);
    cam.lookAt(tx, ty, tz);
    cam.updateProjectionMatrix();
    if (cam === camera && scene) {          // keep the sun's shadow box on what we look at
      const sun = scene.userData.sun;
      sun.position.set(tx + 9, ty + 18, tz + 6);
      sun.target.position.set(tx, ty, tz);
    }
  }

  // ---- A place: its ground, its rooms and its outside world ----
  function showPlace(p, info) {
    if (world) { scene.remove(world); disposeTree(world); }
    world = G();
    place = p;
    rooms = {};
    decor = [];
    uppers = [];
    scene.background = new THREE.Color(SKY[p.ground] || SKY.cottage);
    p.rooms.forEach(r => {
      const ri = (info && info[r.id]) || {};
      rooms[r.id] = { id: r.id, theme: r.theme, cx: r.cx, cz: r.cz, y: r.y || 0, half: ri.big ? BIG : SMALL, siding: ri.siding || null, things: {} };
    });
    if (!rooms[activeId]) activeId = p.rooms[0].id;
    buildGround(p);
    Object.values(rooms).forEach(buildRoom);
    buildOutside(p);
    scene.add(world);
    resize();
  }
  function setActive(id) { if (rooms[id]) { activeId = id; view.panX = view.panZ = 0; resize(); } }

  // The extent of all the rooms, for sizing islands and buildings
  function bounds() {
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    Object.values(rooms).forEach(R => {
      x0 = Math.min(x0, R.cx - R.half - T); x1 = Math.max(x1, R.cx + R.half + T);
      z0 = Math.min(z0, R.cz - R.half - T); z1 = Math.max(z1, R.cz + R.half + T);
    });
    return { x0, x1, z0, z1, cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, w: x1 - x0, d: z1 - z0 };
  }

  function island(b, margin, top, side) {
    const w = b.w + margin * 2, d = b.d + margin * 2;
    box(world, w, 0.6, d, top, b.cx, -0.55, b.cz);
    box(world, w - 0.6, 2.2, d - 0.6, side, b.cx, -1.95, b.cz);
    return { w, d };
  }
  function buildGround(p) {
    const b = bounds();
    if (p.ground === 'cottage' || p.ground === 'farm') {
      island(b, 8, C.leaf, C.brown);
      box(world, 3, 0.62, 7.6, C.cream, b.cx, -0.54, b.z1 + 4, { outline: false }); // the path to the door
    } else if (p.ground === 'beach') {
      const s = island(b, 8, C.butter, C.peach);
      box(world, s.w + 20, 0.3, s.d + 20, C.blue, b.cx, -1.2, b.cz, { outline: false, opacity: 0.85 }); // the sea
      Object.values(rooms).forEach(R => [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, c]) =>
        cyl(world, 0.3, 0.3, 1.2, C.darkwood, R.cx + a * (R.half - 0.5), -0.6, R.cz + c * (R.half - 0.5), { seg: 8 })));
    } else if (p.ground === 'treehouse') {
      island(b, 8, C.leaf, C.brown);
      Object.values(rooms).forEach(R => {
        cyl(world, 1.6, 2.4, R.y + 0.3, C.brown, R.cx, (R.y - 0.3) / 2 - 0.25, R.cz);              // the trunk
        [[-1, 0.3], [1, -0.6]].forEach(([a, c]) => cyl(world, 0.4, 0.6, 4, C.brown, R.cx + a * 2.2, R.y - 2.2, R.cz + c, { rz: -a * 0.7 }));
        box(world, 0.25, R.y, 0.25, C.darkwood, R.cx + R.half + 1.2, R.y / 2 - 0.25, R.cz + R.half - 1); // the ladder
        box(world, 0.25, R.y, 0.25, C.darkwood, R.cx + R.half + 1.2, R.y / 2 - 0.25, R.cz + R.half - 2.2);
        for (let y = 0.5; y < R.y; y += 0.9) box(world, 0.15, 0.15, 1.2, C.wood, R.cx + R.half + 1.2, y, R.cz + R.half - 1.6, { outline: false });
        const leaves = G();                                    // the leafy top, off while you look inside
        [[0, 0, 3.4], [-3, 2, 2.6], [3, -2, 2.8], [2.5, 3, 2.3], [-3, -3, 2.4]].forEach(([a, c, r]) => ball(leaves, r, a % 2 ? C.darkleaf : C.leaf, R.cx + a, R.y + H + 2.4, R.cz + c));
        world.add(leaves);
        uppers.push({ obj: leaves, k: 0 });
      });
    } else if (p.ground === 'city' || p.ground === 'tower') {
      const tall = p.ground === 'tower';
      const below = tall ? 9 : 3, above = tall ? 6 : 3;       // storeys under and over the room
      Object.values(rooms).forEach(R => {
        R.y = below * H;
        const w = 2 * R.half + 2 * T + 3;
        box(world, w, R.y, w, tall ? C.white : C.peach, R.cx, R.y / 2 - 0.4, R.cz);
        box(world, w + 0.6, 0.4, w + 0.6, C.grey, R.cx, R.y - 0.2, R.cz);   // the balcony ledge
        windowsOn(world, R.cx, R.cz, w, R.y - 2.6, 0, tall ? C.lilac : C.sky);
        const up = G();
        box(up, w, above * H, w, tall ? C.white : C.peach, R.cx, R.y + H + (above * H) / 2, R.cz);
        windowsOn(up, R.cx, R.cz, w, R.y + H + 2.4, R.y + H + above * H, tall ? C.lilac : C.sky);
        box(up, w + 0.6, 0.6, w + 0.6, C.grey, R.cx, R.y + H + above * H + 0.3, R.cz);
        world.add(up);
        uppers.push({ obj: up, k: 0, lift: true });        // floors above float up while you look inside
      });
      box(world, 70, 0.4, 70, C.grey, b.cx, -0.6, b.cz, { outline: false });   // the street
    }
    // the floor of each room, with boards or tiles
    Object.values(rooms).forEach(R => {
      const th = THEMES[R.theme] || THEMES.cottage, s = 2 * R.half;
      box(world, s + 2 * T, 0.4, s + 2 * T, th.floor, R.cx, R.y - 0.2, R.cz);
      for (let i = 1; i < R.half; i++) box(world, s, 0.02, 0.12, th.floor2, R.cx, R.y + 0.005, R.cz - R.half + i * 2, { outline: false });
    });
  }

  // Rows of windows on the four sides of a building, from top down to bottom
  function windowsOn(parent, cx, cz, w, top, bottom, color) {
    for (let y = top; y > bottom + 0.8; y -= 3) {
      for (let k = -1; k <= 1; k++) {
        const a = k * w / 3.6;
        box(parent, 1.6, 1.4, 0.1, color, cx + a, y, cz + w / 2 + 0.05, { out: 0.05 });
        box(parent, 1.6, 1.4, 0.1, color, cx + a, y, cz - w / 2 - 0.05, { out: 0.05 });
        box(parent, 0.1, 1.4, 1.6, color, cx + w / 2 + 0.05, y, cz + a, { out: 0.05 });
        box(parent, 0.1, 1.4, 1.6, color, cx - w / 2 - 0.05, y, cz + a, { out: 0.05 });
      }
    }
  }

  // Four walls. A wall between the camera and the room drops to a stub, so you can see in.
  // Each wall has an outside skin (the siding) and two mount groups: things inside, things outside.
  function buildRoom(R) {
    const th = THEMES[R.theme] || THEMES.cottage;
    const sd = SIDING[R.siding];
    const skin = sd ? sd.color : th.skin;
    R.walls = {};
    Object.keys(WALLS).forEach(side => {
      const W = WALLS[side];
      const g = G();
      const along = W.nx === 0;
      const len = 2 * R.half + 2 * T;
      const bx = (w, d) => along ? [w, d] : [d, w];
      const [w1, d1] = bx(len, T);
      box(g, w1, H, d1, th.wall, 0, H / 2, 0);
      if (th.planks) for (let i = 1; i < 6; i++) { const [a, c] = bx(len, T + 0.04); box(g, a, 0.06, c, th.planks, 0, i * 0.85, 0, { outline: false }); }
      if (th.stripes) for (let i = 0; i < len / 1.2; i++) { const x = -len / 2 + 0.6 + i * 1.2; if (i % 2) box(g, along ? 0.6 : T + 0.03, H, along ? T + 0.03 : 0.6, th.stripes, along ? x : 0, H / 2, along ? 0 : x, { outline: false }); }
      // the outside skin
      const [w2, d2] = bx(len + 0.12, 0.12);
      const skinOff = T / 2 + 0.06;
      box(g, w2, H, d2, skin, along ? 0 : W.nx * skinOff, H / 2, along ? W.nz * skinOff : 0);
      if (sd) skinLines(g, sd, along, len, W, skinOff);
      const [w3, d3] = bx(len + 0.3, T + 0.4);
      box(g, w3, 0.3, d3, th.trim, 0, H, 0); // top trim
      g.position.set(R.cx + W.nx * (R.half + T / 2), R.y, R.cz + W.nz * (R.half + T / 2));
      world.add(g);
      const mounts = G(), outMounts = G();
      world.add(mounts); world.add(outMounts);
      R.walls[side] = { group: g, mounts, outMounts, cut: false, k: 1 };
    });
    // a roof, shown in the outside view
    if (th.roof) {
      const roof = G(), s = 2 * R.half + 2 * T + 0.8;
      prism(roof, s, 3.2 + R.half * 0.15, s, th.roof, R.cx, R.y + H + 0.15, R.cz);
      box(roof, 0.9, 1.6, 0.9, C.white, R.cx + R.half * 0.45, R.y + H + 2.0, R.cz - R.half * 0.3); // chimney
      world.add(roof);
      uppers.push({ obj: roof, k: 0 });
    }
    R.items = G();
    world.add(R.items);
  }
  function skinLines(g, sd, along, len, W, off) {
    const o = off + 0.08;
    if (sd.lines === 'h' || sd.lines === 'brick') {
      for (let y = 0.6; y < H; y += sd.lines === 'h' ? 0.6 : 0.5) box(g, along ? len : 0.04, 0.05, along ? 0.04 : len, C.white, along ? 0 : W.nx * o, y, along ? W.nz * o : 0, { outline: false });
    }
    if (sd.lines === 'v' || sd.lines === 'brick') {
      const step = sd.lines === 'v' ? 0.8 : 1.0;
      for (let x = -len / 2 + step; x < len / 2; x += step) box(g, along ? 0.05 : 0.04, H, along ? 0.04 : 0.05, sd.lines === 'v' ? C.darkwood : C.white, along ? x : W.nx * o, H / 2, along ? W.nz * o : x, { outline: false });
    }
  }

  // ---- Outside: trees, fences, palms, the city ----
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
  function palm(x, z) {
    const g = G();
    for (let i = 0; i < 5; i++) cyl(g, 0.32, 0.38, 1.0, C.wood, i * 0.12, 0.5 + i * 0.95, 0, { rz: -0.06 });
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; box(g, 2.6, 0.12, 0.7, C.leaf, 0.6 + Math.cos(a) * 1.2, 5.0, Math.sin(a) * 1.2, { ry: -a, rz: -0.35 }); }
    ball(g, 0.3, C.brown, 0.6, 4.8, 0.2); ball(g, 0.3, C.brown, 0.4, 4.8, -0.3);
    return addDecor(g, x, z);
  }
  function umbrella(x, z) {
    const g = G();
    cyl(g, 0.06, 0.06, 2.8, C.white, 0, 1.4, 0, { seg: 6 });
    cone(g, 1.8, 0.8, C.coral, 0, 3.0, 0, { seg: 8 });
    box(g, 1.2, 0.3, 2.2, C.sky, 1.4, 0.15, 0.3);
    return addDecor(g, x, z, true);
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
  function hay(x, z) { const g = G(); box(g, 2, 1.2, 1.3, C.hay, 0, 0.6, 0); return addDecor(g, x, z, true); }
  function silo(x, z) { const g = G(); cyl(g, 1.4, 1.4, 7, C.grey, 0, 3.5, 0); ball(g, 1.4, C.sky, 0, 7, 0); return addDecor(g, x, z); }
  function building(x, z, w, h, color, win) {
    const g = G();
    box(g, w, h, w, color, 0, h / 2 - 0.4, 0);
    for (let y = h - 2.5; y > 1.5; y -= 2.6) [-w / 4, w / 4].forEach(a => {
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
  function buildOutside(p) {
    const b = bounds(), mx = b.w / 2 + 4.5, mz = b.d / 2 + 4.5, cx = b.cx, cz = b.cz;
    if (p.ground === 'cottage') {
      tree(cx - mx, cz - mz, 1.1); tree(cx + mx, cz - mz + 1); tree(cx - mx, cz + mz - 1, 0.9); tree(cx + mx, cz + mz, 0.8);
      flowers(cx - mx + 2, cz + 2); flowers(cx + mx - 1, cz - 2); flowers(cx + 3, cz + mz - 1); flowers(cx - 3, cz - mz + 1);
      fence(cx, cz - mz - 2, b.w + 8, true);
    } else if (p.ground === 'beach') {
      palm(cx - mx, cz - mz); palm(cx + mx, cz - mz + 2); palm(cx - mx + 1, cz + mz - 1);
      umbrella(cx + mx - 1, cz + mz - 2); umbrella(cx - 2, cz + mz);
    } else if (p.ground === 'treehouse') {
      tree(cx - mx, cz - mz, 1.2); tree(cx + mx, cz + mz, 0.9); tree(cx + mx, cz - mz, 0.8);
      flowers(cx - mx + 1, cz + mz - 2); flowers(cx + 2, cz + mz);
    } else if (p.ground === 'farm') {
      silo(cx + mx, cz - mz);
      tree(cx - mx, cz - mz); tree(cx - mx, cz + mz - 1, 0.9);
      hay(cx + mx - 1, cz + 3); hay(cx + mx - 2, cz + 6); hay(cx - mx + 1, cz + 2);
      fence(cx, cz + mz + 2, b.w + 8, true); fence(cx + mx + 2, cz, b.d + 8, false);
      flowers(cx - 2, cz + mz);
    } else if (p.ground === 'city') {
      building(cx - 22, cz - 21, 11, 28, C.mint, C.white);
      building(cx + 21, cz - 22, 10, 40, C.butter, C.sky);
      building(cx - 22, cz + 21, 10, 22, C.pink, C.white);
      building(cx + 22, cz + 20, 11, 18, C.lilac, C.white);
      tree(cx - 12, cz + 13, 0.9); tree(cx + 13, cz - 12, 0.9);
    } else if (p.ground === 'tower') {
      const R = Object.values(rooms)[0];
      [[-15, -3, -13], [15, -6, -12], [-14, -9, 14], [14, -2, 14]].forEach(([x, y, z]) => cloud(cx + x, R.y + y, cz + z));
      building(cx - 24, cz - 22, 9, 62, C.sky, C.white);
      building(cx + 23, cz - 24, 8, 54, C.peach, C.white);
    }
  }

  // ---- The things in the rooms ----
  // posByRoom = { roomId: { itemId: pos } }. A thing's key is "roomId/itemId".
  function sync(posByRoom, held) {
    heldKey = held ? activeId + '/' + held : null;
    Object.values(rooms).forEach(R => {
      const pos = posByRoom[R.id] || {};
      for (const id in R.things) if (!pos[id]) removeThing(R, id);
      for (const id in pos) {
        const p = pos[id], info = window.ITEMS[id];
        if (!info || info.zone === 'siding') continue;
        let t = R.things[id];
        if (!t) {
          const obj = info.build();
          obj.traverse(o => { o.userData.itemId = id; o.userData.roomId = R.id; });
          t = R.things[id] = { obj, mount: undefined, bounce: 0 };
        }
        const mount = !p.placed ? 'items' : info.zone === 'wall' ? 'in:' + p.wall : info.zone === 'outside' ? 'out:' + p.wall : 'items';
        if (t.mount !== mount) {
          if (t.obj.parent) t.obj.parent.remove(t.obj);
          const [kind, side] = mount.split(':');
          (kind === 'in' ? R.walls[side].mounts : kind === 'out' ? R.walls[side].outMounts : R.items).add(t.obj);
          t.mount = mount;
        }
        t.home = homeOf(R, info, p);
      }
    });
  }
  function homeOf(R, info, p) {
    if (!p.placed) {
      const hover = info.zone === 'outside' ? H + 4 : H + 2.2;
      return { x: R.cx, y: R.y + hover, z: R.cz, ry: 0, floating: true };
    }
    if (info.zone === 'wall' || info.zone === 'outside') {
      const W = WALLS[p.wall];
      const off = info.zone === 'outside' ? R.half + T + 0.12 : R.half;
      const x = R.cx + (W.nx === 0 ? p.u : W.nx * off);
      const z = R.cz + (W.nx === 0 ? W.nz * off : p.u);
      return { x, y: R.y + (info.v || p.v), z, ry: info.zone === 'outside' ? W.ry + Math.PI : W.ry };
    }
    return { x: R.cx + p.x, y: R.y, z: R.cz + p.z, ry: p.rot || 0 };
  }
  function removeThing(R, id) {
    const t = R.things[id];
    if (t.obj.parent) t.obj.parent.remove(t.obj);
    disposeTree(t.obj);
    delete R.things[id];
  }
  function bounce(roomId, id) { const R = rooms[roomId]; if (R && R.things[id]) R.things[id].bounce = 1; }

  // ---- Every frame: walls, roofs, decor, the held thing ----
  function frontness(nx, nz) { return nx * Math.sin(view.az) + nz * Math.cos(view.az); }
  function loop(now) {
    requestAnimationFrame(loop);
    if (!world || !container.clientWidth) return;
    const t = (now - clock0) / 1000;
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    const ease = rate => 1 - Math.exp(-rate * dt);   // the same speed at any frame rate
    const out = isOutside();
    const A = active();
    Object.values(rooms).forEach(R => {
      for (const side in R.walls) {
        const P = R.walls[side], W = WALLS[side];
        const facing = frontness(W.nx, W.nz) > 0.12;
        P.cut = !out && facing;
        P.k += ((P.cut ? 0.1 : 1) - P.k) * ease(11);
        P.group.scale.y = P.k;
        P.mounts.visible = P.k > 0.6 && !out;
        P.outMounts.visible = P.k > 0.6 && facing;
      }
    });
    uppers.forEach(u => {
      u.k += ((out ? 1 : 0.001) - u.k) * ease(9);
      if (u.lift) {                                   // a building's upper floors: lifted off like a doll's house
        u.obj.visible = true;
        u.obj.position.y = (1 - u.k) * LIFT;
        const shade = u.k > 0.5;                      // no shadow into the room while lifted
        if (u.shade !== shade) { u.shade = shade; u.obj.traverse(o => { if (o.isMesh && !o.userData.outline) o.castShadow = shade; }); }
        return;
      }
      u.obj.visible = u.k > 0.02;
      u.obj.scale.y = u.k;
      // shrink towards its own base, not the ground
      const base = u.base === undefined ? (u.base = new THREE.Box3().setFromObject(u.obj).min.y) : u.base;
      u.obj.position.y = base * (1 - u.k);
    });
    decor.forEach(d => {
      const dx = d.x - A.cx, dz = d.z - A.cz, len = Math.hypot(dx, dz) || 1;
      const front = !out && !d.low && frontness(dx / len, dz / len) > 0.35;
      d.k += ((front ? 0.001 : 1) - d.k) * ease(9);
      d.obj.scale.y = d.k * d.base;
      d.obj.visible = d.k > 0.02;
    });
    ringMesh.visible = false;
    Object.values(rooms).forEach(R => {
      for (const id in R.things) {
        const th = R.things[id], h = th.home, o = th.obj;
        if (!h) continue;
        const held = R.id + '/' + id === heldKey;
        const lift = held ? 0.6 + Math.sin(t * 5) * 0.35 : 0;
        // things in a wall's mount group still use world positions (the groups sit at the origin)
        o.position.x += (h.x - o.position.x) * ease(14);
        o.position.z += (h.z - o.position.z) * ease(14);
        o.position.y += (h.y + lift - o.position.y) * ease(18);
        o.rotation.y += (shortAngle(o.rotation.y, h.floating ? view.az : h.ry)) * ease(14);
        if (th.bounce > 0) {
          th.bounce = Math.max(0, th.bounce - dt * 2.6);
          const s = Math.sin(th.bounce * Math.PI * 2) * th.bounce * 0.25;
          o.scale.set(1 + s, 1 - s, 1 + s);
        } else o.scale.set(1, 1, 1);
        if (o.parent === R.items) o.visible = !out || h.floating;   // the roof hides the inside
        const info = window.ITEMS[id];
        if (info.animate) info.animate(o, t);
        if (held && window.ITEMS[id].zone === 'floor' && !h.floating) {
          ringMesh.visible = true;
          ringMesh.position.set(h.x, R.y + 0.06, h.z);
        }
      }
    });
    renderer.render(scene, camera);
  }
  const shortAngle = (from, to) => { let d = (to - from) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; };

  // ---- Touch: one finger turns, two fingers pinch and pan, a tap places or picks ----
  function bindPointer() {
    const cv = renderer.domElement;
    cv.style.touchAction = 'none';
    cv.addEventListener('contextmenu', e => e.preventDefault());
    const pts = new Map();
    let start = null, moved = false, two = null;
    const mid = () => { const [a, b] = [...pts.values()]; return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, d: Math.hypot(a.x - b.x, a.y - b.y) }; };
    cv.addEventListener('pointerdown', e => {
      cv.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) start = { x: e.clientX, y: e.clientY, az: view.az, el: view.el, pan: e.button === 2 || e.shiftKey, px: view.panX, pz: view.panZ };
      moved = false;
      if (pts.size === 2) { const m = mid(); two = { ...m, zoom: view.zoomK, px: view.panX, pz: view.panZ }; moved = true; }
    });
    cv.addEventListener('pointermove', e => {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2 && two) {
        const m = mid();
        setZoom(two.zoom * m.d / Math.max(two.d, 1), true);
        panBy(two, m.x - two.x, m.y - two.y);
        resize();
      } else if (start && pts.size === 1) {
        const dx = e.clientX - start.x, dy = e.clientY - start.y;
        if (Math.hypot(dx, dy) > 8) moved = true;
        if (!moved) return;
        if (start.pan) panBy(start, dx, dy);
        else {
          view.az = start.az - dx * 0.01;
          view.el = Math.min(1.3, Math.max(0.25, start.el + dy * 0.006));
        }
        resize();
      }
    });
    const end = e => {
      if (!pts.has(e.pointerId)) return;
      pts.delete(e.pointerId);
      if (pts.size < 2) two = null;
      if (pts.size === 0) {
        if (!moved && start) tapAt(e.clientX, e.clientY);
        start = null;
      } else start = null;     // lifting one of two fingers: don't turn on the last one
    };
    cv.addEventListener('pointerup', end);
    cv.addEventListener('pointercancel', e => { pts.delete(e.pointerId); start = null; two = null; });
    cv.addEventListener('wheel', e => { e.preventDefault(); setZoom(view.zoomK * (e.deltaY < 0 ? 1.1 : 0.9)); }, { passive: false });
  }
  // Move the point we look at by a screen drag
  function panBy(from, dx, dy) {
    const wpp = (camera.top - camera.bottom) / container.clientHeight;
    const rx = Math.cos(view.az), rz = -Math.sin(view.az);          // screen right, on the ground
    const fx = -Math.sin(view.az), fz = -Math.cos(view.az);         // screen up, on the ground
    const k = 1 / Math.max(0.3, Math.sin(view.el));
    view.panX = clamp(from.px - rx * dx * wpp + fx * dy * wpp * k, -60, 60);
    view.panZ = clamp(from.pz - rz * dx * wpp + fz * dy * wpp * k, -60, 60);
  }
  function setZoom(k, quiet) { view.zoomK = Math.min(2.6, Math.max(0.22, k)); if (!quiet) resize(); }

  // What did the tap land on? A thing, another room, the floor, a wall inside or a wall outside.
  const ray = new THREE.Raycaster();
  function tapAt(cx, cy) {
    const r = renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const A = active();
    const pickable = [];
    let heldObj = null;
    Object.values(rooms).forEach(R => { for (const id in R.things) {
      const o = R.things[id].obj;
      if (R.id + '/' + id === heldKey) { heldObj = o; continue; }
      if (o.visible && o.parent && o.parent.visible !== false) pickable.push(o);
    } });
    const hit = ray.intersectObjects(pickable, true)[0];
    const heldHit = heldObj ? !!ray.intersectObject(heldObj, true)[0] : false;
    const fp = new THREE.Vector3();
    const onFloor = ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), -A.y), fp);
    const inside = A.half - 0.7;
    let floor = null, otherRoom = null;
    if (onFloor) {
      const lx = fp.x - A.cx, lz = fp.z - A.cz;
      if (Math.abs(lx) < A.half + 3 && Math.abs(lz) < A.half + 3) floor = { x: clamp(lx, -inside, inside), z: clamp(lz, -inside, inside) };
    }
    // a tap on another room switches to it
    Object.values(rooms).forEach(R => {
      if (R === A) return;
      const p = new THREE.Vector3();
      if (ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), -R.y), p) && Math.abs(p.x - R.cx) < R.half + T && Math.abs(p.z - R.cz) < R.half + T) otherRoom = R.id;
    });
    if (hit && hit.object.userData.roomId !== activeId) otherRoom = hit.object.userData.roomId;
    onTap({
      itemId: hit && hit.object.userData.roomId === activeId ? hit.object.userData.itemId : null,
      heldHit,
      otherRoom: floor && !hit ? null : otherRoom,
      floor,
      wall: wallHit(A, floor),
      outside: outsideHit(A)
    });
  }
  // The nearest standing wall the ray meets inside; or the standing wall nearest the floor spot
  function wallHit(A, floor) {
    let best = null;
    for (const side in A.walls) {
      if (A.walls[side].cut) continue;
      const W = WALLS[side];
      const plane = new THREE.Plane(new THREE.Vector3(-W.nx, 0, -W.nz), A.half + W.nx * A.cx + W.nz * A.cz);
      const p = new THREE.Vector3();
      if (!ray.ray.intersectPlane(plane, p)) continue;
      const u = W.nx === 0 ? p.x - A.cx : p.z - A.cz;
      if (Math.abs(u) > A.half + 0.5 || p.y < A.y || p.y > A.y + H + 1) continue;
      const d = p.distanceTo(ray.ray.origin);
      if (!best || d < best.d) best = { d, wall: side, u, v: p.y - A.y };
    }
    if (!best && floor) {
      let near = null;
      for (const side in A.walls) {
        if (A.walls[side].cut) continue;
        const W = WALLS[side];
        const dist = A.half - (W.nx * floor.x + W.nz * floor.z);
        if (!near || dist < near.dist) near = { dist, wall: side, u: W.nx === 0 ? floor.x : floor.z, v: 2.8 };
      }
      best = near;
    }
    if (!best) return null;
    return { wall: best.wall, u: clamp(best.u, -(A.half - 1.4), A.half - 1.4), v: clamp(best.v, 1.6, 3.6) };
  }
  // The outside face of a wall that faces the camera
  function outsideHit(A) {
    let best = null;
    for (const side in A.walls) {
      const W = WALLS[side];
      if (frontness(W.nx, W.nz) <= 0) continue;
      const off = A.half + T + 0.12;
      const plane = new THREE.Plane(new THREE.Vector3(W.nx, 0, W.nz), -(off + W.nx * A.cx + W.nz * A.cz));
      const p = new THREE.Vector3();
      if (!ray.ray.intersectPlane(plane, p)) continue;
      const u = W.nx === 0 ? p.x - A.cx : p.z - A.cz;
      if (Math.abs(u) > A.half + T + 0.5 || p.y < A.y - 0.5 || p.y > A.y + H + 0.5) continue;
      const d = p.distanceTo(ray.ray.origin);
      if (!best || d < best.d) best = { d, wall: side, u, v: p.y - A.y };
    }
    if (!best) return null;
    return { wall: best.wall, u: clamp(best.u, -(A.half - 1.2), A.half - 1.2), v: clamp(best.v, 1.4, 3.8) };
  }
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  // ---- View buttons ----
  function turn(rad) { view.az += rad; resize(); }
  function zoom(f) { setZoom(view.zoomK * f); }
  function resetView() { Object.assign(view, { az: Math.PI / 4, el: 0.62, zoomK: 1, panX: 0, panZ: 0, outside: false }); resize(); }
  function setOutside(on) {
    view.outside = !!on;
    if (on && view.zoomK > 0.75) view.zoomK = 0.55;
    if (!on && view.zoomK < OUT_ZOOM) view.zoomK = 1;
    resize();
  }

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
    const A = active();
    Object.values(rooms).forEach(R => { for (const id in R.things) { const th = R.things[id]; if (th.home) { th.obj.position.set(th.home.x, th.home.y, th.home.z); th.obj.rotation.y = th.home.ry; th.obj.visible = true; } } });
    const cam = camera.clone();
    const v = { az: Math.PI / 4, el: 0.62, zoomK: 1.15, panX: 0, panZ: 0 };
    placeCamera(cam, w / h, v);
    const saved = [];
    const cutNow = (nx, nz) => nx * Math.SQRT1_2 + nz * Math.SQRT1_2 > 0.12;
    Object.values(rooms).forEach(R => { for (const s in R.walls) {
      const P = R.walls[s], W = WALLS[s], cut = cutNow(W.nx, W.nz);
      saved.push([P, P.group.scale.y, P.mounts.visible, P.outMounts.visible]);
      P.group.scale.y = cut ? 0.1 : 1; P.mounts.visible = !cut; P.outMounts.visible = false;
    } });
    const savedU = uppers.map(u => [u.obj.visible, u.obj.position.y]);
    uppers.forEach(u => { if (u.lift) { u.obj.visible = true; u.obj.position.y = LIFT; } else u.obj.visible = false; });
    const savedDecor = decor.map(d => [d.obj.scale.y, d.obj.visible]);
    decor.forEach(d => { const dx = d.x - A.cx, dz = d.z - A.cz, len = Math.hypot(dx, dz) || 1; const front = !d.low && (dx + dz) / len * Math.SQRT1_2 > 0.35; d.obj.scale.y = front ? 0.001 : d.base; d.obj.visible = !front; });
    const rr = offscreen(w, h);
    rr.shadowMap.enabled = true;
    rr.render(scene, cam);
    saved.forEach(([P, k, a, b]) => { P.group.scale.y = k; P.mounts.visible = a; P.outMounts.visible = b; });
    uppers.forEach((u, i) => { u.obj.visible = savedU[i][0]; u.obj.position.y = savedU[i][1]; });
    decor.forEach((d, i) => { d.obj.scale.y = savedDecor[i][0]; d.obj.visible = savedDecor[i][1]; });
    return rr.domElement.toDataURL('image/png');
  }
  const thumbs = {};
  function thumb(id, time) {
    if (time === undefined && thumbs[id]) return thumbs[id];
    const info = window.ITEMS[id];
    if (!info) return '';
    const s = new THREE.Scene();
    s.add(new THREE.HemisphereLight(0xffffff, 0xcdbda6, 0.55));
    const d = new THREE.DirectionalLight(0xffffff, 0.45); d.position.set(5, 8, 6); s.add(d);
    const obj = info.build();
    if (info.zone === 'floor') obj.rotation.y = -Math.PI / 6;
    if (info.animate) info.animate(obj, time || 0);
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
    const url = rr.domElement.toDataURL('image/png');
    disposeTree(obj);
    if (time === undefined) thumbs[id] = url;
    return url;
  }

  // A few pictures through one loop of a moving thing, for the shop (shown one after another)
  function frames(id, n) {
    const info = window.ITEMS[id];
    if (!info || !info.animate) return [];
    const key = id + ':' + n;
    if (thumbs[key]) return thumbs[key];
    const out = [];
    for (let i = 0; i < n; i++) {
      delete thumbs[id];
      out.push(thumb(id, (info.loop || 1) * i / n));
    }
    delete thumbs[id];
    return (thumbs[key] = out);
  }

  // Geometries are made per thing; materials are shared, so only geometries are freed
  function disposeTree(root) { root.traverse(o => { if (o.geometry && !o.userData.outline) o.geometry.dispose(); }); }

  window.World3D = { init, showPlace, setActive, sync, bounce, turn, zoom, resetView, setOutside, isOutside, snapshot, thumb, frames, view, SIDING };
})();
