// Athena's world V2: chunky cartoon 3-D things, built from boxes, balls, cylinders and cones.
// Classic script (works from a double-click). Needs lib/three.min.js first.
// Each thing is a function that returns a THREE.Group:
//   floor things stand on y = 0, centred on x and z, front facing +z;
//   wall things are centred on their own middle, back flat at z = 0, facing +z.
// To add a thing: add a line to ITEMS below (emoji, label, zone, build).
(function () {
  const INK = 0x3b3a4a;
  const C = {
    wood: 0xE8B98A, darkwood: 0xB9845A, coral: 0xF08A7E, red: 0xEA7468, mint: 0xCDEFE0, sage: 0xB9D8A8,
    leaf: 0x8CCB7E, darkleaf: 0x6FB56A, butter: 0xFBE9A6, peach: 0xF9C8A8, sky: 0xBFE3F5, blue: 0x8EC5EA,
    lilac: 0xD9C8F0, purple: 0xB9A2E3, pink: 0xF7B8CF, white: 0xFFFDF7, cream: 0xFFF3D6, grey: 0xD3D4DE,
    dark: 0x5a5870, gold: 0xF4C95D, glass: 0xD8F0FF, hay: 0xF2D36B, brown: 0xC08A5E, terracotta: 0xE59A6E,
    orange: 0xF7A65A, teal: 0x8FD6CF
  };

  // ---- Toon look: three flat tones and a dark outline ----
  let gradient = null;
  function gradientMap() {
    if (!gradient) {
      gradient = new THREE.DataTexture(new Uint8Array([120, 190, 240]), 3, 1, THREE.LuminanceFormat);
      gradient.minFilter = gradient.magFilter = THREE.NearestFilter;
      gradient.generateMipmaps = false;
      gradient.needsUpdate = true;
    }
    return gradient;
  }
  const mats = {};
  function mat(color, opts) {
    const key = color + ':' + (opts ? JSON.stringify(opts) : '');
    if (!mats[key]) mats[key] = new THREE.MeshToonMaterial(Object.assign({ color, gradientMap: gradientMap() }, opts || {}));
    return mats[key];
  }
  const outlineMat = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });
  const OUT = 0.07; // outline thickness in world units

  // Add a mesh with an outline shell (the "inverted hull" cartoon trick)
  function add(parent, geo, color, x, y, z, o) {
    o = o || {};
    const material = o.glow ? mat(color, { emissive: color, emissiveIntensity: o.glow })
      : o.opacity ? mat(color, { transparent: true, opacity: o.opacity })
      : mat(color);
    const m = new THREE.Mesh(geo, material);
    m.position.set(x || 0, y || 0, z || 0);
    if (o.rx) m.rotation.x = o.rx;
    if (o.ry) m.rotation.y = o.ry;
    if (o.rz) m.rotation.z = o.rz;
    if (o.sx || o.sy || o.sz) m.scale.set(o.sx || 1, o.sy || 1, o.sz || 1);
    m.castShadow = !o.opacity;
    m.receiveShadow = true;
    if (o.outline !== false) {
      geo.computeBoundingBox();
      const size = new THREE.Vector3(), mid = new THREE.Vector3();
      geo.boundingBox.getSize(size);
      geo.boundingBox.getCenter(mid);
      const t = o.out === undefined ? OUT : o.out;
      const k = v => (v + 2 * t) / Math.max(v, 0.001);
      const shell = new THREE.Mesh(geo, outlineMat);
      shell.scale.set(k(size.x), k(size.y), k(size.z));
      // scale about the middle of the shape, not its origin
      shell.position.set(mid.x * (1 - shell.scale.x), mid.y * (1 - shell.scale.y), mid.z * (1 - shell.scale.z));
      shell.userData.outline = true;
      m.add(shell);
    }
    parent.add(m);
    return m;
  }
  const box = (p, w, h, d, c, x, y, z, o) => add(p, new THREE.BoxGeometry(w, h, d), c, x, y, z, o);
  const cyl = (p, rt, rb, h, c, x, y, z, o) => add(p, new THREE.CylinderGeometry(rt, rb, h, (o && o.seg) || 22), c, x, y, z, o);
  const ball = (p, r, c, x, y, z, o) => add(p, new THREE.SphereGeometry(r, 22, 16), c, x, y, z, o);
  const cone = (p, r, h, c, x, y, z, o) => add(p, new THREE.ConeGeometry(r, h, (o && o.seg) || 22), c, x, y, z, o);
  const dome = (p, r, c, x, y, z, o) => add(p, new THREE.SphereGeometry(r, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), c, x, y, z, o);
  const ring = (p, r, tube, c, x, y, z, o) => add(p, new THREE.TorusGeometry(r, tube, 10, 28, (o && o.arc) || Math.PI * 2), c, x, y, z, o);
  // A triangular prism (roofs): length along x
  const prism = (p, w, h, len, c, x, y, z, o) => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.lineTo(-w / 2, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: false });
    g.translate(0, 0, -len / 2);
    g.rotateY(Math.PI / 2);
    return add(p, g, c, x, y, z, o);
  };
  const G = () => new THREE.Group();

  // ---- Beds ----
  function bedBase(g, frame, blanket, opts) {
    opts = opts || {};
    [[-1.3, -1.9], [1.3, -1.9], [-1.3, 1.9], [1.3, 1.9]].forEach(([x, z]) => cyl(g, 0.22, 0.18, 0.5, frame, x, 0.25, z, { seg: 10 }));
    box(g, 3.1, 0.6, 4.4, frame, 0, 0.75, 0);
    box(g, 2.9, 0.6, 4.2, C.white, 0, 1.3, 0.05);
    box(g, 3.0, 0.35, 2.7, blanket, 0, 1.55, 0.8);
    ball(g, 0.75, C.white, 0, 1.75, -1.4, { sx: 1.5, sy: 0.55, sz: 0.85 });
    if (!opts.noHead) {
      box(g, 3.4, 2.6, 0.4, frame, 0, 1.3, -2.25);
      ball(g, 0.42, opts.heart || C.pink, 0, 2.25, -2.0, { sx: 1, sy: 1, sz: 0.4 });
    }
  }
  function bed() { const g = G(); bedBase(g, C.wood, C.coral); return g; }
  function bunkbed() {
    const g = G();
    [[-1.45, -2.05], [1.45, -2.05], [-1.45, 2.05], [1.45, 2.05]].forEach(([x, z]) => box(g, 0.32, 5.0, 0.32, C.teal, x, 2.5, z));
    [0.7, 3.2].forEach((y, i) => {
      box(g, 3.0, 0.4, 4.2, C.teal, 0, y, 0);
      box(g, 2.8, 0.5, 4.0, C.white, 0, y + 0.45, 0);
      box(g, 2.9, 0.3, 2.4, i ? C.butter : C.lilac, 0, y + 0.7, 0.7);
      ball(g, 0.6, C.white, 0, y + 0.85, -1.4, { sx: 1.6, sy: 0.55, sz: 0.85 });
    });
    box(g, 3.0, 0.5, 0.2, C.teal, 0, 4.25, 2.05);      // top rail
    for (let i = 0; i < 4; i++) box(g, 0.9, 0.16, 0.16, C.butter, 1.95, 0.9 + i * 0.8, 1.4); // ladder rungs
    box(g, 0.14, 3.8, 0.14, C.butter, 1.95, 2.0, 0.95);
    box(g, 0.14, 3.8, 0.14, C.butter, 1.95, 2.0, 1.85);
    return g;
  }
  function canopybed() {
    const g = G();
    bedBase(g, C.white, C.pink, { heart: C.lilac });
    [[-1.4, -2.05], [1.4, -2.05], [-1.4, 2.05], [1.4, 2.05]].forEach(([x, z]) => cyl(g, 0.12, 0.12, 4.6, C.white, x, 2.3, z, { seg: 10 }));
    box(g, 3.2, 0.3, 4.5, C.lilac, 0, 4.7, 0);
    cone(g, 2.0, 1.0, C.pink, 0, 5.35, 0, { seg: 4, ry: Math.PI / 4, sz: 1.35 });
    ball(g, 0.25, C.gold, 0, 5.95, 0);
    [-1.4, 1.4].forEach(x => box(g, 0.25, 2.6, 0.9, C.pink, x, 3.3, 2.0, { opacity: 0.85 }));
    return g;
  }
  function carbed() {
    const g = G();
    [[-1.65, -1.4], [1.65, -1.4], [-1.65, 1.5], [1.65, 1.5]].forEach(([x, z]) => {
      cyl(g, 0.75, 0.75, 0.5, C.dark, x, 0.75, z, { rz: Math.PI / 2 });
      cyl(g, 0.35, 0.35, 0.55, C.grey, x, 0.75, z, { rz: Math.PI / 2, outline: false });
    });
    box(g, 3.1, 1.2, 4.8, C.red, 0, 1.15, 0);
    box(g, 2.6, 0.45, 3.2, C.white, 0, 1.9, -0.2);
    box(g, 2.7, 0.3, 1.7, C.sky, 0, 2.15, 0.45);
    ball(g, 0.55, C.white, 0, 2.2, -1.25, { sx: 1.6, sy: 0.55, sz: 0.85 });
    box(g, 3.1, 1.5, 0.6, C.red, 0, 2.2, 2.1);           // bonnet
    box(g, 3.1, 1.9, 0.5, C.red, 0, 2.0, -2.25);         // back
    [-0.9, 0.9].forEach(x => cyl(g, 0.3, 0.3, 0.2, C.butter, x, 2.2, 2.45, { rx: Math.PI / 2, glow: 0.4 }));
    box(g, 1.6, 0.25, 0.1, C.white, 0, 1.55, 2.45);       // grille
    return g;
  }
  function haybed() {
    const g = G();
    box(g, 3.3, 0.4, 4.5, C.darkwood, 0, 0.2, 0);          // pallet
    box(g, 3.1, 1.1, 4.3, C.hay, 0, 0.95, 0);
    for (let i = 0; i < 9; i++) box(g, 0.1, 0.5, 0.1, C.gold, -1.4 + (i % 3) * 1.4 + (i % 2) * 0.3, 1.6, -1.8 + Math.floor(i / 3) * 1.6, { outline: false, rz: 0.4 });
    box(g, 3.2, 0.25, 2.4, C.sage, 0, 1.6, 0.9);
    for (let i = 0; i < 3; i++) box(g, 3.25, 0.27, 0.3, C.white, 0, 1.61, 0.1 + i * 0.75, { outline: false });
    ball(g, 0.6, C.cream, 0, 1.8, -1.4, { sx: 1.6, sy: 0.55, sz: 0.85 });
    return g;
  }

  // ---- Mushrooms (the big fat one is the original) ----
  function mushroomOne(g, capR, stemR, stemH, cap, spots, x, z, o) {
    o = o || {};
    cyl(g, stemR * 0.85, stemR, stemH, C.cream, x, stemH / 2, z);
    dome(g, capR, cap, x, stemH - 0.15, z, { sy: o.flat || 0.75, glow: o.glow });
    cyl(g, capR * 0.98, capR * 0.98, 0.12, C.cream, x, stemH - 0.15, z, { outline: false });
    const h = capR * (o.flat || 0.75);
    for (let i = 0; i < (o.spots || 6); i++) {
      const a = i * 2.4 + 0.5, r = capR * (i === 0 ? 0 : 0.55);
      const lift = Math.sqrt(Math.max(0, 1 - (r / capR) ** 2)) * h;
      ball(g, capR * 0.16, spots, x + Math.cos(a) * r, stemH - 0.12 + lift, z + Math.sin(a) * r, { sy: 0.5, outline: false, glow: o.glow ? 0.5 : 0 });
    }
  }
  function mushroom() { const g = G(); mushroomOne(g, 2.0, 0.95, 1.6, C.red, C.white, 0, 0); return g; }
  function mushroomtall() {
    const g = G();
    mushroomOne(g, 0.9, 0.35, 4.0, C.orange, C.cream, 0, 0, { flat: 1.1, spots: 4 });
    box(g, 0.08, 0.6, 0.6, C.leaf, 0.35, 0.3, 0, { outline: false, rz: -0.5 });
    return g;
  }
  function mushroomtrio() {
    const g = G();
    mushroomOne(g, 1.1, 0.5, 2.4, C.pink, C.white, -0.6, -0.4);
    mushroomOne(g, 0.8, 0.35, 1.5, C.lilac, C.white, 0.9, 0.2, { spots: 4 });
    mushroomOne(g, 0.55, 0.25, 0.9, C.butter, C.coral, -0.1, 1.0, { spots: 3 });
    return g;
  }
  function mushroomblue() {
    const g = G();
    mushroomOne(g, 1.5, 0.6, 2.2, C.blue, C.white, 0, 0, { glow: 0.35, spots: 5 });
    return g;
  }
  function mushroomstool() {
    const g = G();
    cyl(g, 0.7, 0.85, 1.4, C.cream, 0, 0.7, 0);
    cyl(g, 1.5, 1.5, 0.5, C.mint, 0, 1.6, 0);
    for (let i = 0; i < 6; i++) ball(g, 0.18, C.white, Math.cos(i) * 0.95, 1.86, Math.sin(i) * 0.95, { sy: 0.4, outline: false });
    return g;
  }

  // ---- Wall things (back at z = 0, facing +z, centred) ----
  function windowItem() {
    const g = G();
    box(g, 2.6, 2.6, 0.25, C.white, 0, 0, 0.12);
    box(g, 2.1, 2.1, 0.1, C.sky, 0, 0, 0.27, { outline: false });
    box(g, 0.14, 2.1, 0.1, C.white, 0, 0, 0.33, { outline: false });
    box(g, 2.1, 0.14, 0.1, C.white, 0, 0, 0.33, { outline: false });
    box(g, 3.0, 0.25, 0.5, C.white, 0, -1.4, 0.25);
    [-1.45, 1.45].forEach(x => box(g, 0.5, 2.9, 0.12, C.peach, x, 0.05, 0.45));
    box(g, 3.4, 0.3, 0.3, C.peach, 0, 1.45, 0.4);
    return g;
  }
  function picture() {
    const g = G();
    box(g, 2.6, 1.9, 0.2, C.gold, 0, 0, 0.1);
    box(g, 2.2, 1.5, 0.08, C.sky, 0, 0, 0.22, { outline: false });
    cone(g, 0.7, 0.9, C.sage, -0.4, -0.3, 0.27, { seg: 3, sz: 0.1 });
    cone(g, 0.55, 0.7, C.leaf, 0.4, -0.4, 0.29, { seg: 3, sz: 0.1 });
    ball(g, 0.25, C.butter, 0.65, 0.35, 0.28, { sz: 0.3, outline: false });
    return g;
  }
  function clock() {
    const g = G();
    cyl(g, 0.95, 0.95, 0.3, C.coral, 0, 0, 0.15, { rx: Math.PI / 2 });
    cyl(g, 0.78, 0.78, 0.1, C.cream, 0, 0, 0.32, { rx: Math.PI / 2, outline: false });
    box(g, 0.1, 0.55, 0.05, C.dark, 0, 0.22, 0.38, { outline: false });
    box(g, 0.42, 0.1, 0.05, C.dark, 0.18, 0, 0.38, { outline: false });
    ball(g, 0.18, C.gold, 0, 1.05, 0.15);
    return g;
  }
  function mirror() {
    const g = G();
    cyl(g, 0.95, 0.95, 0.2, C.lilac, 0, 0, 0.1, { rx: Math.PI / 2, sy: 1, sx: 1, sz: 1.45 });
    cyl(g, 0.78, 0.78, 0.08, C.glass, 0, 0, 0.22, { rx: Math.PI / 2, sz: 1.45, outline: false });
    box(g, 0.3, 0.6, 0.06, C.white, -0.3, 0.3, 0.27, { rz: 0.5, outline: false });
    return g;
  }
  function rainbow() {
    const g = G();
    [[1.3, C.coral], [1.05, C.butter], [0.8, C.mint], [0.55, C.sky]].forEach(([r, c], i) => ring(g, r, 0.13, c, 0, -0.6, 0.15 + i * 0.01, { arc: Math.PI, outline: i === 0 }));
    ball(g, 0.35, C.white, -1.15, -0.65, 0.3, { sx: 1.4 });
    ball(g, 0.35, C.white, 1.15, -0.65, 0.3, { sx: 1.4 });
    return g;
  }
  function kite() {
    const g = G();
    box(g, 1.4, 1.4, 0.12, C.pink, 0, 0.3, 0.1, { rz: Math.PI / 4, sy: 1.3 });
    box(g, 0.06, 1.9, 0.06, C.white, 0, 0.3, 0.2, { outline: false });
    [0, 1, 2].forEach(i => box(g, 0.32, 0.18, 0.08, [C.butter, C.mint, C.sky][i], 0.15 * (i % 2 ? -1 : 1), -0.9 - i * 0.4, 0.1, { rz: 0.6 }));
    return g;
  }
  function sun() {
    const g = G();
    ball(g, 0.8, C.butter, 0, 0, 0.3, { sz: 0.5 });
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      cone(g, 0.2, 0.5, C.gold, Math.cos(a) * 1.15, Math.sin(a) * 1.15, 0.2, { rz: a - Math.PI / 2 });
    }
    ball(g, 0.08, C.dark, -0.25, 0.15, 0.7, { outline: false });
    ball(g, 0.08, C.dark, 0.25, 0.15, 0.7, { outline: false });
    return g;
  }

  // ---- Floor things ----
  function sofa() {
    const g = G();
    box(g, 4.2, 1.1, 2.0, C.mint, 0, 0.75, 0);
    box(g, 4.2, 1.6, 0.6, C.mint, 0, 1.6, -0.75);
    [-2.0, 2.0].forEach(x => box(g, 0.6, 1.2, 2.0, C.teal, x, 1.2, 0));
    [-0.85, 0.85].forEach(x => box(g, 1.6, 0.35, 1.5, C.cream, x, 1.45, 0.15));
    ball(g, 0.45, C.pink, -1.2, 1.9, -0.25, { sz: 0.5 });
    [[-1.8, -0.8], [1.8, -0.8], [-1.8, 0.8], [1.8, 0.8]].forEach(([x, z]) => cyl(g, 0.12, 0.1, 0.3, C.darkwood, x, 0.15, z, { seg: 8 }));
    return g;
  }
  function plant() {
    const g = G();
    cyl(g, 0.8, 0.6, 1.2, C.terracotta, 0, 0.6, 0);
    cyl(g, 0.9, 0.9, 0.25, C.terracotta, 0, 1.2, 0);
    ball(g, 0.9, C.leaf, 0, 2.1, 0);
    ball(g, 0.7, C.darkleaf, -0.6, 1.8, 0.2);
    ball(g, 0.65, C.leaf, 0.55, 2.6, -0.1);
    ball(g, 0.55, C.darkleaf, 0.5, 1.7, 0.4);
    return g;
  }
  function chair() {
    const g = G();
    [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].forEach(([x, z]) => box(g, 0.2, 1.1, 0.2, C.darkwood, x, 0.55, z));
    box(g, 1.5, 0.25, 1.5, C.wood, 0, 1.2, 0);
    box(g, 1.3, 0.2, 1.3, C.coral, 0, 1.4, 0);
    box(g, 1.5, 1.6, 0.22, C.wood, 0, 2.1, -0.65);
    ball(g, 0.25, C.butter, 0, 2.3, -0.5, { sz: 0.4, outline: false });
    return g;
  }
  function lamp() {
    const g = G();
    cyl(g, 0.6, 0.7, 0.25, C.dark, 0, 0.12, 0);
    cyl(g, 0.08, 0.08, 3.0, C.dark, 0, 1.6, 0, { seg: 8 });
    ball(g, 0.3, C.butter, 0, 3.0, 0, { glow: 0.8, outline: false });
    cyl(g, 0.55, 1.0, 1.0, C.butter, 0, 3.3, 0, { glow: 0.25 });
    return g;
  }
  function tv() {
    const g = G();
    box(g, 3.0, 1.0, 1.2, C.wood, 0, 0.5, 0);
    box(g, 2.8, 1.8, 0.4, C.dark, 0, 2.0, -0.1);
    box(g, 2.4, 1.4, 0.05, C.sky, 0, 2.0, 0.12, { outline: false, glow: 0.2 });
    cyl(g, 0.04, 0.04, 1.0, C.dark, -0.4, 3.2, -0.1, { rz: 0.5, seg: 6 });
    cyl(g, 0.04, 0.04, 1.0, C.dark, 0.4, 3.2, -0.1, { rz: -0.5, seg: 6 });
    ball(g, 0.12, C.coral, -0.62, 3.62, -0.1, { outline: false });
    ball(g, 0.12, C.coral, 0.62, 3.62, -0.1, { outline: false });
    return g;
  }
  function teddy() {
    const g = G(), b = C.brown;
    ball(g, 0.85, b, 0, 0.95, 0, { sy: 1.05 });
    ball(g, 0.5, C.cream, 0, 0.95, 0.5, { sz: 0.5, outline: false });
    ball(g, 0.7, b, 0, 2.2, 0);
    [-0.55, 0.55].forEach(x => { ball(g, 0.28, b, x, 2.75, 0); ball(g, 0.14, C.pink, x, 2.75, 0.17, { outline: false }); });
    ball(g, 0.3, C.cream, 0, 2.05, 0.6, { sz: 0.6 });
    ball(g, 0.1, C.dark, 0, 2.15, 0.78, { outline: false });
    [-0.25, 0.25].forEach(x => ball(g, 0.08, C.dark, x, 2.4, 0.62, { outline: false }));
    [-0.85, 0.85].forEach(x => ball(g, 0.32, b, x, 1.15, 0.2));
    [-0.45, 0.45].forEach(x => ball(g, 0.36, b, x, 0.3, 0.45, { sz: 1.3 }));
    box(g, 0.9, 0.2, 0.2, C.coral, 0, 1.65, 0.45, { outline: false });
    return g;
  }
  function bookshelf() {
    const g = G();
    box(g, 2.8, 4.2, 0.2, C.darkwood, 0, 2.1, -0.45);                 // back
    [-1.3, 1.3].forEach(x => box(g, 0.2, 4.2, 1.1, C.wood, x, 2.1, 0)); // sides
    [0.1, 1.45, 2.8, 4.15].forEach(y => box(g, 2.8, 0.2, 1.1, C.wood, 0, y, 0));
    const cols = [C.coral, C.sky, C.butter, C.mint, C.lilac, C.pink, C.teal];
    [0.2, 1.55, 2.9].forEach((y, row) => {
      for (let i = 0; i < 6; i++) {
        const h = 0.8 + ((i + row) % 3) * 0.12;
        box(g, 0.3, h, 0.75, cols[(i + row * 2) % cols.length], -0.9 + i * 0.36, y + h / 2, 0.05, { out: 0.03, rz: i === 5 ? -0.25 : 0 });
      }
    });
    return g;
  }
  function bath() {
    const g = G();
    [[-1.5, -0.8], [1.5, -0.8], [-1.5, 0.8], [1.5, 0.8]].forEach(([x, z]) => ball(g, 0.25, C.gold, x, 0.25, z));
    box(g, 3.8, 1.3, 2.2, C.white, 0, 1.05, 0);
    box(g, 3.3, 0.1, 1.7, C.sky, 0, 1.74, 0, { outline: false });
    [[-0.8, 0.2], [-0.3, -0.3], [0.5, 0.3], [1.0, -0.2]].forEach(([x, z], i) => ball(g, 0.25 + (i % 2) * 0.1, C.white, x, 1.8, z, { opacity: 0.9, outline: false }));
    cyl(g, 0.1, 0.1, 0.8, C.grey, -1.75, 2.0, 0, { seg: 8 });
    box(g, 0.5, 0.12, 0.12, C.grey, -1.55, 2.35, 0, { outline: false });
    ball(g, 0.3, C.butter, 0.9, 1.85, -0.3, { sx: 1.2 }); // a rubber duck
    return g;
  }
  function piano() {
    const g = G();
    box(g, 4.0, 3.0, 1.4, C.purple, 0, 1.6, -0.3);
    box(g, 4.0, 0.3, 1.0, C.purple, 0, 1.6, 0.8);
    box(g, 3.6, 0.15, 0.7, C.white, 0, 1.82, 0.85, { outline: false });
    for (let i = 0; i < 9; i++) if (i % 7 !== 2 && i % 7 !== 6) box(g, 0.14, 0.12, 0.4, C.dark, -1.6 + i * 0.4, 1.95, 0.7, { outline: false });
    [-1.7, 1.7].forEach(x => box(g, 0.3, 1.5, 0.3, C.purple, x, 0.75, 0.9));
    box(g, 1.8, 0.4, 1.0, C.coral, 0, 1.1, 2.0);
    [-0.7, 0.7].forEach(x => box(g, 0.2, 0.9, 0.2, C.darkwood, x, 0.45, 2.0));
    return g;
  }
  function vase() {
    const g = G();
    ball(g, 0.75, C.sky, 0, 0.75, 0, { sy: 1.0 });
    cyl(g, 0.3, 0.4, 0.8, C.sky, 0, 1.7, 0);
    [[-0.3, 0], [0.3, 0.1], [0, -0.3]].forEach(([x, z], i) => {
      box(g, 0.06, 1.0, 0.06, C.darkleaf, x * 0.5, 2.4, z * 0.5, { outline: false, rz: -x });
      ball(g, 0.3, [C.coral, C.butter, C.pink][i], x, 2.95, z);
    });
    return g;
  }
  function candle() {
    const g = G();
    cyl(g, 0.7, 0.8, 0.25, C.gold, 0, 0.12, 0);
    cyl(g, 0.35, 0.35, 1.4, C.cream, 0, 0.95, 0);
    cone(g, 0.18, 0.5, C.orange, 0, 1.95, 0, { glow: 0.9, outline: false });
    ball(g, 0.15, C.butter, 0, 1.8, 0, { glow: 1, outline: false });
    return g;
  }
  function cactus() {
    const g = G();
    cyl(g, 0.7, 0.55, 0.9, C.terracotta, 0, 0.45, 0);
    cyl(g, 0.45, 0.45, 2.2, C.leaf, 0, 1.9, 0);
    ball(g, 0.45, C.leaf, 0, 3.0, 0);
    cyl(g, 0.22, 0.22, 0.8, C.leaf, -0.65, 2.1, 0);
    ball(g, 0.22, C.leaf, -0.65, 2.5, 0);
    box(g, 0.5, 0.3, 0.3, C.leaf, -0.4, 1.7, 0, { outline: false });
    cyl(g, 0.2, 0.2, 0.6, C.leaf, 0.6, 2.4, 0);
    ball(g, 0.2, C.leaf, 0.6, 2.7, 0);
    box(g, 0.4, 0.28, 0.28, C.leaf, 0.4, 2.1, 0, { outline: false });
    ball(g, 0.22, C.pink, 0, 3.45, 0);
    return g;
  }
  function balloon() {
    const g = G();
    cyl(g, 0.4, 0.5, 0.3, C.gold, 0, 0.15, 0);
    cyl(g, 0.02, 0.02, 3.0, C.dark, 0, 1.8, 0, { seg: 5, outline: false });
    ball(g, 0.95, C.pink, 0, 3.9, 0, { sy: 1.15 });
    cone(g, 0.15, 0.25, C.pink, 0, 2.8, 0, { rx: Math.PI });
    ball(g, 0.2, C.white, -0.35, 4.3, 0.6, { outline: false });
    return g;
  }
  function teapot() {
    const g = G();
    ball(g, 0.9, C.mint, 0, 0.9, 0, { sy: 0.85 });
    cyl(g, 0.5, 0.6, 0.2, C.mint, 0, 1.65, 0);
    ball(g, 0.18, C.coral, 0, 1.85, 0);
    cyl(g, 0.12, 0.2, 0.9, C.mint, 0.95, 1.1, 0, { rz: -0.9 });
    ring(g, 0.4, 0.1, C.mint, -0.9, 1.0, 0);
    for (let i = 0; i < 5; i++) ball(g, 0.12, C.pink, Math.cos(i * 1.25) * 0.86, 0.95, Math.sin(i * 1.25) * 0.86, { outline: false });
    return g;
  }
  function lantern() {
    const g = G();
    cyl(g, 0.6, 0.7, 0.2, C.dark, 0, 0.1, 0);
    cyl(g, 0.06, 0.06, 2.2, C.dark, 0, 1.2, 0, { seg: 6 });
    cyl(g, 0.4, 0.4, 0.2, C.gold, 0, 2.4, 0);
    ball(g, 0.95, C.red, 0, 3.2, 0, { sy: 0.85, glow: 0.3 });
    cyl(g, 0.4, 0.4, 0.2, C.gold, 0, 4.0, 0);
    [-0.4, 0, 0.4].forEach(y => ring(g, 0.92 - Math.abs(y) * 0.5, 0.03, C.gold, 0, 3.2 + y, 0, { rx: Math.PI / 2, outline: false }));
    box(g, 0.08, 0.5, 0.08, C.gold, 0, 2.05, 0.1, { outline: false });
    return g;
  }
  function fishbowl() {
    const g = G();
    cyl(g, 0.7, 0.9, 1.2, C.wood, 0, 0.6, 0);
    ball(g, 1.1, C.blue, 0, 2.15, 0, { sy: 0.9, opacity: 0.45, outline: false });
    ring(g, 0.6, 0.08, C.glass, 0, 3.0, 0, { rx: Math.PI / 2 });
    ball(g, 0.3, C.orange, 0.1, 2.1, 0.1, { sx: 1.5 });
    cone(g, 0.22, 0.35, C.orange, -0.4, 2.1, 0.1, { rz: -Math.PI / 2 });
    box(g, 0.08, 0.6, 0.08, C.leaf, -0.4, 1.7, -0.3, { outline: false });
    return g;
  }
  function tulip() {
    const g = G();
    box(g, 2.0, 0.9, 0.9, C.sky, 0, 0.45, 0);
    [-0.6, 0, 0.6].forEach((x, i) => {
      box(g, 0.08, 1.4, 0.08, C.darkleaf, x, 1.6, 0, { outline: false });
      box(g, 0.35, 0.6, 0.08, C.leaf, x + 0.15, 1.3, 0, { rz: -0.5, outline: false });
      cyl(g, 0.32, 0.18, 0.55, [C.coral, C.pink, C.butter][i], x, 2.5, 0);
      cone(g, 0.32, 0.3, [C.coral, C.pink, C.butter][i], x, 2.9, 0, { seg: 3, outline: false });
    });
    return g;
  }
  function basket() {
    const g = G();
    cyl(g, 1.1, 0.85, 1.1, C.wood, 0, 0.55, 0);
    [0.3, 0.7].forEach(y => ring(g, 0.9 + y * 0.2, 0.05, C.darkwood, 0, y, 0, { rx: Math.PI / 2, outline: false }));
    ring(g, 0.95, 0.09, C.darkwood, 0, 1.1, 0, { arc: Math.PI });
    [[-0.4, 0, C.red], [0.35, 0.2, C.leaf], [0, -0.4, C.orange], [0.3, -0.25, C.butter]].forEach(([x, z, c]) => ball(g, 0.35, c, x, 1.2, z));
    return g;
  }
  function haybale() {
    const g = G();
    box(g, 2.6, 1.6, 1.7, C.hay, 0, 0.8, 0);
    [-0.7, 0.7].forEach(x => box(g, 0.1, 1.66, 1.76, C.terracotta, x, 0.8, 0, { outline: false }));
    for (let i = 0; i < 6; i++) box(g, 0.08, 0.45, 0.08, C.gold, -1.0 + i * 0.4, 1.7, -0.5 + (i % 3) * 0.5, { outline: false, rz: i % 2 ? 0.5 : -0.4 });
    return g;
  }

  // A decorative pony: a plush pony on a little stand (cheap and cute)
  function pony() {
    const g = G();
    box(g, 2.2, 0.3, 1.0, C.wood, 0, 0.15, 0);
    [[-0.7, -0.3], [0.7, -0.3], [-0.7, 0.3], [0.7, 0.3]].forEach(([x, z]) => cyl(g, 0.18, 0.16, 1.0, C.white, x, 0.8, z, { seg: 10 }));
    [[-0.7, -0.3], [0.7, -0.3], [-0.7, 0.3], [0.7, 0.3]].forEach(([x, z]) => cyl(g, 0.2, 0.2, 0.15, C.lilac, x, 0.35, z, { seg: 10, outline: false }));
    ball(g, 0.75, C.white, 0, 1.65, 0, { sx: 1.45, sy: 0.85 });                   // body
    cyl(g, 0.3, 0.38, 0.9, C.white, 0.85, 2.15, 0, { rz: -0.6 });                 // neck
    ball(g, 0.45, C.white, 1.25, 2.6, 0, { sx: 1.25 });                            // head
    ball(g, 0.25, C.pink, 1.7, 2.5, 0, { sx: 1.1, outline: false });               // nose
    [-0.15, 0.15].forEach(z => cone(g, 0.12, 0.3, C.white, 1.1, 3.05, z));        // ears
    [-0.36, 0.36].forEach(z => ball(g, 0.07, C.dark, 1.4, 2.72, z * 0.9, { outline: false }));
    for (let i = 0; i < 5; i++) ball(g, 0.3, [C.pink, C.lilac, C.sky, C.butter, C.mint][i], 1.15 - i * 0.2, 3.0 - i * 0.25, 0); // mane
    box(g, 0.9, 0.2, 1.3, C.coral, -0.05, 2.35, 0);                               // saddle
    cone(g, 0.35, 1.1, C.pink, -1.2, 1.55, 0, { rz: 2.3 });                      // tail
    return g;
  }
  // A windmill whose sails turn (a big thing to save up for). animate() turns it; one turn every 4 seconds.
  function windmill() {
    const g = G();
    cyl(g, 0.9, 1.5, 4.2, C.cream, 0, 2.1, 0, { seg: 8 });
    cone(g, 1.25, 1.4, C.coral, 0, 4.9, 0, { seg: 8 });
    box(g, 0.9, 1.3, 0.15, C.darkwood, 0, 0.65, 1.38, { rx: -0.13 });             // door
    ball(g, 0.3, C.sky, 0, 2.8, 1.2, { sz: 0.4 });                                 // round window
    const hub = G();
    hub.position.set(0, 4.3, 1.3);
    cyl(hub, 0.25, 0.25, 0.4, C.dark, 0, 0, 0, { rx: Math.PI / 2 });
    for (let i = 0; i < 4; i++) {
      const arm = G();
      arm.rotation.z = i * Math.PI / 2;
      box(arm, 0.14, 2.6, 0.08, C.darkwood, 0, 1.35, 0.1);
      box(arm, 0.75, 2.0, 0.06, i % 2 ? C.white : C.butter, 0.42, 1.55, 0.12);
      hub.add(arm);
    }
    g.add(hub);
    g.userData.sails = hub;
    return g;
  }

  // ---- Outside things (Home Depot): on the outside of a wall, back at z = 0, facing +z ----
  function frontdoor() {
    const g = G();
    box(g, 2.2, 3.4, 0.25, C.white, 0, 0, 0.12);
    box(g, 1.7, 3.0, 0.2, C.coral, 0, -0.15, 0.3);
    [0.55, -0.55].forEach(y => box(g, 1.2, 0.9, 0.06, C.peach, 0, y - 0.1, 0.42, { out: 0.03 }));
    ball(g, 0.14, C.gold, 0.55, -0.3, 0.45);
    box(g, 2.8, 0.25, 1.0, C.grey, 0, -1.75, 0.5);                       // the step
    cyl(g, 0.45, 0.45, 0.12, C.butter, 0, 1.15, 0.42, { rx: Math.PI / 2, outline: false });
    return g;
  }
  function shutters() {
    const g = G();
    box(g, 2.2, 2.2, 0.2, C.white, 0, 0, 0.1);
    box(g, 1.8, 1.8, 0.08, C.sky, 0, 0, 0.22, { outline: false });
    box(g, 0.12, 1.8, 0.06, C.white, 0, 0, 0.28, { outline: false });
    [-1.6, 1.6].forEach(x => {
      box(g, 0.9, 2.4, 0.15, C.teal, x, 0, 0.12);
      for (let i = 0; i < 6; i++) box(g, 0.7, 0.06, 0.05, C.mint, x, -0.95 + i * 0.38, 0.22, { outline: false });
    });
    return g;
  }
  function flowerbox() {
    const g = G();
    box(g, 2.6, 0.7, 0.8, C.wood, 0, 0, 0.4);
    [-0.9, -0.3, 0.3, 0.9].forEach((x, i) => {
      ball(g, 0.35, C.leaf, x, 0.45, 0.4);
      ball(g, 0.2, [C.pink, C.butter, C.coral, C.lilac][i], x + 0.1, 0.7, 0.55);
    });
    return g;
  }
  function porchlamp() {
    const g = G();
    box(g, 0.5, 0.8, 0.12, C.dark, 0, 0, 0.06);
    box(g, 0.12, 0.12, 0.6, C.dark, 0, 0.2, 0.35);
    cyl(g, 0.3, 0.25, 0.7, C.butter, 0, -0.1, 0.65, { glow: 0.6 });
    cone(g, 0.4, 0.35, C.dark, 0, 0.45, 0.65, { seg: 6 });
    return g;
  }
  function awning() {
    const g = G();
    for (let i = 0; i < 6; i++) box(g, 0.5, 0.12, 1.4, i % 2 ? C.white : C.coral, -1.25 + i * 0.5, 0, 0.7, { rx: 0.45, outline: i === 0 || i === 5 });
    box(g, 3.1, 0.3, 0.12, C.coral, 0, -0.35, 1.32);
    return g;
  }
  // Siding: changes the colour of the outside walls of the room. The model is a sample board for the button.
  function sidingSample(color, lines) {
    return () => {
      const g = G();
      box(g, 2.4, 2.0, 0.2, color, 0, 1.0, 0);
      if (lines === 'v') for (let i = -2; i <= 2; i++) box(g, 0.06, 2.0, 0.05, C.darkwood, i * 0.45, 1.0, 0.12, { outline: false });
      else for (let y = 0.3; y < 2; y += lines === 'brick' ? 0.32 : 0.4) box(g, 2.4, 0.05, 0.05, C.white, 0, y, 0.12, { outline: false });
      return g;
    };
  }

  const ITEMS = {
    // On the wall
    window:  { emoji: '🪟', label: 'window',  zone: 'wall', build: windowItem },
    picture: { emoji: '🖼️', label: 'picture', zone: 'wall', build: picture },
    clock:   { emoji: '🕰️', label: 'clock',   zone: 'wall', build: clock },
    mirror:  { emoji: '🪞', label: 'mirror',  zone: 'wall', build: mirror },
    rainbow: { emoji: '🌈', label: 'rainbow', zone: 'wall', build: rainbow },
    kite:    { emoji: '🪁', label: 'kite',    zone: 'wall', build: kite },
    sun:     { emoji: '☀️', label: 'sun',     zone: 'wall', build: sun },
    // Beds: different kinds to buy over time
    bed:        { emoji: '🛏️', label: 'bed',        zone: 'floor', build: bed },
    bunkbed:    { emoji: '🛏️', label: 'bunk bed',   zone: 'floor', build: bunkbed },
    canopybed:  { emoji: '👑', label: 'canopy bed', zone: 'floor', build: canopybed },
    carbed:     { emoji: '🏎️', label: 'race car bed', zone: 'floor', build: carbed },
    haybed:     { emoji: '🌾', label: 'hay bed',    zone: 'floor', build: haybed },
    // Mushrooms: the big fat one, and more kinds to buy
    mushroom:      { emoji: '🍄', label: 'mushroom',       zone: 'floor', build: mushroom },
    mushroomtall:  { emoji: '🍄', label: 'tall mushroom',  zone: 'floor', build: mushroomtall },
    mushroomtrio:  { emoji: '🍄', label: 'mushroom trio',  zone: 'floor', build: mushroomtrio },
    mushroomblue:  { emoji: '💙', label: 'glow mushroom',  zone: 'floor', build: mushroomblue },
    mushroomstool: { emoji: '🪑', label: 'mushroom stool', zone: 'floor', build: mushroomstool },
    // Other floor things
    sofa:      { emoji: '🛋️', label: 'sofa',      zone: 'floor', build: sofa },
    plant:     { emoji: '🪴', label: 'plant',     zone: 'floor', build: plant },
    chair:     { emoji: '🪑', label: 'chair',     zone: 'floor', build: chair },
    lamp:      { emoji: '💡', label: 'lamp',      zone: 'floor', build: lamp },
    tv:        { emoji: '📺', label: 'TV',        zone: 'floor', build: tv },
    teddy:     { emoji: '🧸', label: 'teddy',     zone: 'floor', build: teddy },
    bookshelf: { emoji: '📚', label: 'bookshelf', zone: 'floor', build: bookshelf },
    bath:      { emoji: '🛁', label: 'bath',      zone: 'floor', build: bath },
    piano:     { emoji: '🎹', label: 'piano',     zone: 'floor', build: piano },
    vase:      { emoji: '🏺', label: 'vase',      zone: 'floor', build: vase },
    candle:    { emoji: '🕯️', label: 'candle',    zone: 'floor', build: candle },
    cactus:    { emoji: '🌵', label: 'cactus',    zone: 'floor', build: cactus },
    balloon:   { emoji: '🎈', label: 'balloon',   zone: 'floor', build: balloon },
    teapot:    { emoji: '🫖', label: 'teapot',    zone: 'floor', build: teapot },
    lantern:   { emoji: '🏮', label: 'lantern',   zone: 'floor', build: lantern },
    fishbowl:  { emoji: '🐠', label: 'fish bowl', zone: 'floor', build: fishbowl },
    tulip:     { emoji: '🌷', label: 'tulips',    zone: 'floor', build: tulip },
    basket:    { emoji: '🧺', label: 'basket',    zone: 'floor', build: basket },
    haybale:   { emoji: '🌾', label: 'hay bale',  zone: 'floor', build: haybale },
    pony:      { emoji: '🐴', label: 'decorative pony', zone: 'floor', build: pony },
    // Things that move: animate(obj, seconds) is called every frame; loop is the length of one full cycle.
    windmill:  { emoji: '🌬️', label: 'windmill', zone: 'floor', build: windmill, loop: 4,
                 animate: (o, t) => { if (o.userData.sails) o.userData.sails.rotation.z = -t * Math.PI / 2; } },
    // Outside things (Home Depot). v: how high the middle sits, when it must be fixed (a door stands on the floor).
    frontdoor: { emoji: '🚪', label: 'front door',  zone: 'outside', build: frontdoor, v: 1.85 },
    shutters:  { emoji: '🪟', label: 'shutters',    zone: 'outside', build: shutters },
    flowerbox: { emoji: '🌼', label: 'flower box',  zone: 'outside', build: flowerbox },
    porchlamp: { emoji: '🏮', label: 'porch lamp',  zone: 'outside', build: porchlamp },
    awning:    { emoji: '⛱️', label: 'awning',      zone: 'outside', build: awning },
    // Siding: one per room, the last one picked wins
    sidingmint:  { emoji: '🟩', label: 'mint siding',  zone: 'siding', build: sidingSample(C.mint, 'h') },
    sidingpink:  { emoji: '🟪', label: 'pink siding',  zone: 'siding', build: sidingSample(C.pink, 'h') },
    sidingbrick: { emoji: '🧱', label: 'brick',        zone: 'siding', build: sidingSample(C.terracotta, 'brick') },
    sidingwood:  { emoji: '🪵', label: 'wood siding',  zone: 'siding', build: sidingSample(C.wood, 'v') }
  };

  window.ITEMS = ITEMS;
  window.Toon = { C, INK, mat, add, box, cyl, ball, cone, dome, ring, prism, G };
})();
