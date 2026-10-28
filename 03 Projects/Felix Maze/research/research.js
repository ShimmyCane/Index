/* Felix Maze research explainer: a small live maze lab showing how each algorithm feels. */
(() => {
  "use strict";

  // ---------- errors (bottom panel, opt-in from ⚙️) ----------
  const errBox = document.getElementById("errors");
  const errList = [];
  function logError(msg) {
    errList.push(new Date().toLocaleTimeString() + "  " + msg);
    errBox.textContent = errList.join("\n");
  }
  window.addEventListener("error", e => logError(e.message));

  // ---------- seeded random ----------
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---------- grid: openE[y][x] / openS[y][x] say whether the wall east / south of a cell is gone ----------
  function grid(n, open) {
    const g = { n, E: [], S: [] };
    for (let y = 0; y < n; y++) {
      g.E.push(Array.from({ length: n }, (_, x) => open && x < n - 1));
      g.S.push(Array.from({ length: n }, () => open && y < n - 1));
    }
    return g;
  }
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const inside = (g, x, y) => x >= 0 && y >= 0 && x < g.n && y < g.n;
  function isOpen(g, x, y, dx, dy) {
    if (dx === 1) return g.E[y][x];
    if (dx === -1) return x > 0 && g.E[y][x - 1];
    if (dy === 1) return g.S[y][x];
    return y > 0 && g.S[y - 1][x];
  }
  function carve(g, x, y, dx, dy) {
    if (dx === 1) g.E[y][x] = true;
    else if (dx === -1) g.E[y][x - 1] = true;
    else if (dy === 1) g.S[y][x] = true;
    else g.S[y - 1][x] = true;
  }
  function shuffle(a, r) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  // Growing tree: mix 0 = always grow from the newest cell (wanderer), 1 = from a random cell (spreader).
  function growingTree(n, r, mix) {
    const g = grid(n, false);
    const seen = Array.from({ length: n }, () => Array(n).fill(false));
    const active = [[Math.floor(r() * n), Math.floor(r() * n)]];
    seen[active[0][1]][active[0][0]] = true;
    while (active.length) {
      const i = r() < mix ? Math.floor(r() * active.length) : active.length - 1;
      const [x, y] = active[i];
      const next = shuffle(DIRS.slice(), r).find(([dx, dy]) => inside(g, x + dx, y + dy) && !seen[y + dy][x + dx]);
      if (!next) { active.splice(i, 1); continue; }
      carve(g, x, y, next[0], next[1]);
      seen[y + next[1]][x + next[0]] = true;
      active.push([x + next[0], y + next[1]]);
    }
    return g;
  }

  // Coin flip (binary tree): every cell opens north or east.
  function binaryTree(n, r) {
    const g = grid(n, false);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const opts = [];
      if (y > 0) opts.push([0, -1]);
      if (x < n - 1) opts.push([1, 0]);
      if (opts.length) { const [dx, dy] = opts[Math.floor(r() * opts.length)]; carve(g, x, y, dx, dy); }
    }
    return g;
  }

  // Joiner (Kruskal): knock down random walls between cells that aren't connected yet.
  function kruskal(n, r) {
    const g = grid(n, false);
    const parent = Array.from({ length: n * n }, (_, i) => i);
    const find = i => (parent[i] === i ? i : (parent[i] = find(parent[i])));
    const edges = [];
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      if (x < n - 1) edges.push([x, y, 1, 0]);
      if (y < n - 1) edges.push([x, y, 0, 1]);
    }
    for (const [x, y, dx, dy] of shuffle(edges, r)) {
      const a = find(y * n + x), b = find((y + dy) * n + x + dx);
      if (a !== b) { parent[a] = b; carve(g, x, y, dx, dy); }
    }
    return g;
  }

  // Room splitter (recursive division): start open, add a wall with one door, repeat inside each half.
  function division(n, r) {
    const g = grid(n, true);
    (function split(x0, y0, w, h) {
      if (w < 2 || h < 2) return;
      const horizontal = w < h ? true : h < w ? false : r() < 0.5;
      if (horizontal) {
        const wy = y0 + Math.floor(r() * (h - 1));
        const door = x0 + Math.floor(r() * w);
        for (let x = x0; x < x0 + w; x++) if (x !== door) g.S[wy][x] = false;
        split(x0, y0, w, wy - y0 + 1);
        split(x0, wy + 1, w, y0 + h - wy - 1);
      } else {
        const wx = x0 + Math.floor(r() * (w - 1));
        const door = y0 + Math.floor(r() * h);
        for (let y = y0; y < y0 + h; y++) if (y !== door) g.E[y][wx] = false;
        split(x0, y0, wx - x0 + 1, h);
        split(wx + 1, y0, x0 + w - wx - 1, h);
      }
    })(0, 0, n, n);
    return g;
  }

  const degree = (g, x, y) => DIRS.filter(([dx, dy]) => inside(g, x + dx, y + dy) && isOpen(g, x, y, dx, dy)).length;

  // Braid: knock out a share of the dead ends to make loops.
  function braid(g, r, share) {
    let loops = 0;
    for (let y = 0; y < g.n; y++) for (let x = 0; x < g.n; x++) {
      if (degree(g, x, y) !== 1 || r() >= share) continue;
      const closed = DIRS.filter(([dx, dy]) => inside(g, x + dx, y + dy) && !isOpen(g, x, y, dx, dy));
      if (!closed.length) continue;
      const pick = closed.find(([dx, dy]) => degree(g, x + dx, y + dy) === 1) || closed[Math.floor(r() * closed.length)];
      carve(g, x, y, pick[0], pick[1]);
      loops++;
    }
    return loops;
  }

  function solve(g) {
    const n = g.n, prev = new Map(), q = [[0, 0]];
    prev.set("0,0", null);
    while (q.length) {
      const [x, y] = q.shift();
      if (x === n - 1 && y === n - 1) break;
      for (const [dx, dy] of DIRS) {
        const k = (x + dx) + "," + (y + dy);
        if (inside(g, x + dx, y + dy) && isOpen(g, x, y, dx, dy) && !prev.has(k)) { prev.set(k, [x, y]); q.push([x + dx, y + dy]); }
      }
    }
    const path = [];
    for (let c = [n - 1, n - 1]; c; c = prev.get(c[0] + "," + c[1])) path.unshift(c);
    return path;
  }

  // ---------- drawing ----------
  const svg = document.getElementById("board");
  const NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs, text) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text) e.textContent = text;
    return e;
  }
  function wallPath(x1, y1, x2, y2, hand, r) {
    if (!hand) return `M${x1} ${y1}L${x2} ${y2}`;
    const j = () => (r() - 0.5) * 0.12;
    const mx = (x1 + x2) / 2 + j() * 1.4, my = (y1 + y2) / 2 + j() * 1.4;
    return `M${x1 + j()} ${y1 + j()}Q${mx} ${my} ${x2 + j()} ${y2 + j()}`;
  }

  function draw(g, path, opts) {
    const n = g.n, r = rng(opts.seed ^ 0x9e3779b9);
    svg.setAttribute("viewBox", `-0.3 -0.3 ${n + 0.6} ${n + 0.6}`);
    svg.replaceChildren();
    const w = Math.max(0.07, 1.4 / n + 0.03);
    if (opts.showDead) {
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++)
        if (degree(g, x, y) === 1 && !(x === 0 && y === 0) && !(x === n - 1 && y === n - 1))
          svg.append(el("rect", { class: "dead", x: x + 0.12, y: y + 0.12, width: 0.76, height: 0.76, rx: 0.2 }));
    }
    const walls = [];
    walls.push([0, 0, n, 0], [0, n, n, n], [0, 1, 0, n], [n, 0, n, n - 1]); // border, with gaps at start and finish
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      if (x < n - 1 && !g.E[y][x]) walls.push([x + 1, y, x + 1, y + 1]);
      if (y < n - 1 && !g.S[y][x]) walls.push([x, y + 1, x + 1, y + 1]);
    }
    for (const [x1, y1, x2, y2] of walls) {
      const sw = opts.hand ? w * (0.75 + r() * 0.6) : w;
      svg.append(el("path", { class: "wall", d: wallPath(x1, y1, x2, y2, opts.hand, r), "stroke-width": sw.toFixed(3) }));
    }
    if (opts.showPath) {
      svg.append(el("path", { class: "sol", d: "M-0.3 0.5 " + path.map(([x, y]) => `L${x + 0.5} ${y + 0.5}`).join(" ") + ` L${n + 0.3} ${n - 0.5}` }));
    }
    const s = Math.min(0.8, 0.55 + 4 / n);
    svg.append(el("text", { class: "mark", x: 0.5, y: 0.5, style: `font-size:${s}px` }, "🐭"));
    svg.append(el("text", { class: "mark", x: n - 0.5, y: n - 0.5, style: `font-size:${s}px` }, "🧀"));
  }

  // ---------- state + controls ----------
  const ALGOS = {
    wanderer: { name: "Wanderer", make: (n, r) => growingTree(n, r, 0),
      say: "wanders as far as it can, then backs up. Long winding halls and few dead ends. It feels hand-drawn." },
    mix: { name: "Mix", make: (n, r) => growingTree(n, r, 0.5),
      say: "is half Wanderer, half Spreader. This one knob is how the generator will set difficulty." },
    spreader: { name: "Spreader", make: (n, r) => growingTree(n, r, 1),
      say: "grows outward from many places at once (like Prim's). Lots of short dead ends: busy and harder." },
    joiner: { name: "Joiner", make: kruskal,
      say: "knocks down random walls between rooms that aren't joined yet (Kruskal's). Also many short dead ends." },
    coin: { name: "Coin flip", make: binaryTree,
      say: "flips a coin in every square: open up or open right (binary tree). See the long empty top row and right side? That's the giveaway." },
    rooms: { name: "Room splitter", make: division,
      say: "splits the box with a wall and one door, again and again (recursive division). Long straight walls, like a building." }
  };
  const state = { algo: "wanderer", size: 12, loops: 0, seed: 1 + Math.floor(Math.random() * 1e6), showPath: false, showDead: false, hand: true };

  const algoRow = document.getElementById("algos");
  for (const key in ALGOS) {
    const b = document.createElement("button");
    b.className = "btn"; b.textContent = ALGOS[key].name; b.dataset.algo = key;
    b.addEventListener("click", () => { state.algo = key; render(); });
    algoRow.append(b);
  }
  const bind = (id, key, fn) => document.getElementById(id).addEventListener("input", e => { state[key] = fn(e.target); render(); });
  bind("size", "size", t => +t.value);
  bind("loops", "loops", t => +t.value / 100);
  const toggle = (id, key) => {
    const b = document.getElementById(id);
    b.addEventListener("click", () => { state[key] = !state[key]; render(); });
    return b;
  };
  const tPath = toggle("showPath", "showPath"), tDead = toggle("showDead", "showDead"), tHand = toggle("hand", "hand");
  document.getElementById("again").addEventListener("click", () => { state.seed = 1 + Math.floor(Math.random() * 1e6); render(); });

  function render() {
    try {
      const r = rng(state.seed);
      const g = ALGOS[state.algo].make(state.size, r);
      const loops = braid(g, r, state.loops);
      const path = solve(g);
      let dead = 0;
      for (let y = 0; y < g.n; y++) for (let x = 0; x < g.n; x++) if (degree(g, x, y) === 1) dead++;
      dead -= (degree(g, 0, 0) === 1) + (degree(g, g.n - 1, g.n - 1) === 1);
      draw(g, path, state);

      const cells = state.size * state.size, pct = Math.round((100 * path.length) / cells);
      document.getElementById("stats").innerHTML =
        `Right path: <b>${path.length}</b> of ${cells} squares (${pct}%) · Dead ends: <b>${dead}</b> · Loops added: <b>${loops}</b>`;
      document.getElementById("howto").innerHTML =
        `<b>How to read this:</b> the mouse starts top-left; the cheese is bottom-right. ` +
        `This is a ${state.size} × ${state.size} maze, so ${cells} squares. The <b>${ALGOS[state.algo].name}</b> ${ALGOS[state.algo].say} ` +
        `The right way covers ${path.length} squares, about ${pct} out of every 100. ` +
        `${dead} branches stop at a wall (turn on “Dead ends” to see them in purple). ` +
        (loops ? `${loops} dead ends were opened up into loops, which makes it kinder.` : `No loops: there is exactly one way through.`);

      algoRow.querySelectorAll(".btn").forEach(b => b.classList.toggle("on", b.dataset.algo === state.algo));
      tPath.classList.toggle("on", state.showPath);
      tDead.classList.toggle("on", state.showDead);
      tHand.classList.toggle("on", state.hand);
      document.getElementById("sizeVal").textContent = state.size;
      document.getElementById("loopsVal").textContent = Math.round(state.loops * 100) + "%";
    } catch (e) { logError("render: " + e.message); }
  }

  // ---------- gear ----------
  const gear = document.getElementById("gear"), drawer = document.getElementById("drawer");
  gear.addEventListener("click", () => { drawer.hidden = !drawer.hidden; });
  document.getElementById("showErrors").addEventListener("change", e => { errBox.hidden = !e.target.checked; });
  document.getElementById("openAll").addEventListener("change", e => {
    document.querySelectorAll(".side details").forEach(d => { d.open = e.target.checked; });
  });

  render();
})();
