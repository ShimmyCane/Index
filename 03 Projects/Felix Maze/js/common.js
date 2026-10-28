/* Felix Maze shared page helpers: ⚙️ drawer, error panel, the maze bank, flags, picking, JPEG pictures.
   The bank is the published catalog (data/catalog.js) plus mazes baked on this device (localStorage).
   Flags (puzzles to rework) are kept on this device and synced to Supabase when signed in
   (table fmz_flags, supabase/001_felix_maze.sql). The page works fully without the database. */
(function (root) {
  "use strict";
  const S = root.FMZ.sheet;
  const SAVED = "fmz.saved", FLAGS = "fmz.flags", PRINTED = "fmz.printed", LOG = "fmz.log";
  const DEVICE_FIRST = 0x800; // counters 001–7FF are the published bank; mazes baked on a device start at 800

  // ---------- errors: opt-in panel at the bottom ----------
  const errors = [];
  function logError(msg) {
    errors.push(new Date().toLocaleTimeString() + "  " + msg);
    const box = document.getElementById("errors");
    if (box) box.textContent = errors.join("\n");
    setPill();
  }
  root.addEventListener("error", e => logError(e.message + (e.filename ? " (" + e.filename.split("/").pop() + ":" + e.lineno + ")" : "")));
  root.addEventListener("unhandledrejection", e => logError(String(e.reason)));

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { logError("Could not save on this device: " + e.message); return false; } }
  };

  const param = k => new URLSearchParams(location.search).get(k);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  // ---------- the bank ----------
  const saved = () => store.get(SAVED, []);
  // Retired puzzles (replaced by the fix_puzzles skill) stay in the catalog so their counter is never reused,
  // and can still be opened by code (a printed copy may exist), but they are not listed or picked.
  function allRecipes() {
    const scores = root.FMZ_SCORES || {};
    const all = (root.FMZ_CATALOG || []).map(r => Object.assign({ published: true }, r)).concat(saved());
    all.sort((a, b) => a.n - b.n);
    all.forEach(r => { r.code = S.code(r); r.score = scores[r.n] || null; });
    return all;
  }
  const bank = () => allRecipes().filter(r => !r.retired);
  function find(q) {
    const p = S.parseCode(q);
    if (!p) return null;
    const all = allRecipes();
    return all.find(r => r.n === p.n && (p.family === undefined || (r.family === p.family && r.level === p.level && (r.source || 0) === p.source))) || all.find(r => r.n === p.n) || null;
  }
  const nextNumber = () => Math.max(DEVICE_FIRST - 1, ...saved().map(r => r.n)) + 1;
  function saveRecipe(rc) {
    const list = saved();
    const copy = JSON.parse(JSON.stringify(rc));
    delete copy.growth; delete copy.code; delete copy.score;
    list.push(copy);
    return store.set(SAVED, list) ? copy : null;
  }
  const removeSaved = n => store.set(SAVED, saved().filter(r => r.n !== n));
  const sheetUrl = r => "sheet.html?code=" + encodeURIComponent(r.code || S.code(r));

  // ---------- flags: puzzles to rework ----------
  const REASONS = [
    ["answer", "🔴 The red answer looks wrong"],
    ["hard", "😣 Too hard for its level"],
    ["easy", "😴 Too easy for its level"],
    ["ugly", "🎨 Doesn't look good"],
    ["unsuitable", "🚫 Something not suitable"],
    ["other", "📝 Something else"]
  ];
  const flags = () => store.get(FLAGS, []);
  const openFlags = () => flags().filter(f => f.status === "open");
  const isFlagged = n => openFlags().some(f => f.n === n);
  function putFlag(f) {
    const list = flags().filter(x => !(x.n === f.n && x.status === "open" && f.status === "open"));
    list.push(f); store.set(FLAGS, list);
  }
  function addFlag({ n, code, reason, note }) {
    const now = new Date().toISOString();
    const old = openFlags().find(f => f.n === n);
    putFlag({ n, code, reason, note: note || "", status: "open", resolution: "", created_at: old ? old.created_at : now, updated_at: now, synced: false });
    syncSoon();
  }
  // status: fixed | replaced | kept (the flag was a mistake or the puzzle is fine as it is)
  function resolveFlag(n, status, resolution = "") {
    const now = new Date().toISOString();
    const list = flags().map(f => (f.n === n && f.status === "open" ? Object.assign({}, f, { status, resolution, resolved_at: now, updated_at: now, synced: false }) : f));
    store.set(FLAGS, list);
    syncSoon();
  }

  // ---------- the database (optional): load the library on demand, sign in with the family account ----------
  const sync = { sb: null, session: null, state: "device", message: "This device only." };
  const cfg = () => root.FMZ_CONFIG || null;
  const withTimeout = (p, ms = (cfg() && cfg().timeoutMs) || 8000) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("Timed out after " + ms / 1000 + "s")), ms))]);

  function loadScript(src) {
    return new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => rej(new Error("Could not load the database library (offline?)")); document.head.append(s); });
  }
  async function ensureSb() {
    if (sync.sb) return sync.sb;
    if (!cfg()) throw new Error("No database settings (js/config.js).");
    if (!root.supabase) await loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js");
    sync.sb = root.supabase.createClient(cfg().url, cfg().key);
    return sync.sb;
  }
  function setState(state, message) { sync.state = state; sync.message = message; setPill(); const el = document.getElementById("syncMsg"); if (el) el.textContent = message; }
  function setPill() {
    const el = document.getElementById("pill"); if (!el) return;
    el.textContent = errors.length ? "⚠️ " + errors.length + (errors.length === 1 ? " problem" : " problems") : sync.state === "ok" ? "☁️ synced" : sync.state === "busy" ? "☁️ …" : "💾 this device";
    el.classList.toggle("mint", !errors.length && sync.state === "ok");
  }

  let syncTimer = 0;
  function syncSoon() { clearTimeout(syncTimer); syncTimer = setTimeout(() => { if (sync.session) syncNow().catch(e => logError("Sync: " + e.message)); }, 600); }

  // Merge this device's flags with the table, newest change wins; then send what is only here.
  async function syncNow() {
    const sb = await ensureSb();
    setState("busy", "Syncing…");
    const { data: remote, error } = await withTimeout(sb.from("fmz_flags").select("*"));
    if (error) { setState("error", "Database: " + error.message); throw new Error(error.message); }
    const local = flags();
    const byKey = f => f.n + ":" + (f.created_at || "");
    const merged = new Map(local.map(f => [byKey(f), f]));
    const toSend = [];
    for (const r of remote) {
      const k = byKey({ n: r.n, created_at: r.created_at });
      const l = merged.get(k);
      if (!l || (l.synced && r.updated_at > l.updated_at)) merged.set(k, { n: r.n, code: r.code, reason: r.reason, note: r.note, status: r.status, resolution: r.resolution, created_at: r.created_at, updated_at: r.updated_at, resolved_at: r.resolved_at, synced: true });
      else if (!l.synced && l.updated_at >= r.updated_at) toSend.push(l);
    }
    for (const l of merged.values()) if (!l.synced && !remote.some(r => r.n === l.n && r.created_at === l.created_at)) toSend.push(l);
    for (const l of toSend) {
      const row = { n: l.n, code: l.code, reason: l.reason, note: l.note, status: l.status, resolution: l.resolution || "", created_at: l.created_at, updated_at: l.updated_at, resolved_at: l.resolved_at || null };
      const { error: e2 } = await withTimeout(sb.from("fmz_flags").upsert(row, { onConflict: "n,created_at" }));
      if (e2) { setState("error", "Database: " + e2.message); throw new Error(e2.message); }
      const m = merged.get(byKey(l)); if (m) m.synced = true;
    }
    store.set(FLAGS, [...merged.values()]);
    setState("ok", "Synced " + new Date().toLocaleTimeString() + ".");
    if (api.onFlags) api.onFlags();
  }

  async function connect() {
    if (!cfg()) return;
    try {
      const sb = await ensureSb();
      const { data } = await withTimeout(sb.auth.getSession());
      sync.session = data.session;
      if (data.session) await syncNow();
      else setState("device", "Not signed in. Flags stay on this device.");
    } catch (e) { setState("device", "Database not reachable (" + e.message + "). Flags stay on this device."); } // offline is normal: no error panel entry
  }
  async function signIn(email, password) {
    const sb = await ensureSb();
    const { data, error } = await withTimeout(sb.auth.signInWithPassword({ email, password }));
    if (error) throw new Error(error.message);
    sync.session = data.session;
    await syncNow();
  }
  async function signOut() { try { if (sync.sb) await sync.sb.auth.signOut(); } catch (e) { logError("Sign out: " + e.message); } sync.session = null; setState("device", "Not signed in. Flags stay on this device."); }

  async function dbCheck() {
    const out = document.getElementById("dbResult"); if (!out) return;
    out.textContent = "Checking…";
    try {
      const sb = await ensureSb();
      const lines = [];
      for (const t of ["fmz_flags", "fmz_mazes", "fmz_doodles", "fmz_characters"]) {
        const { count, error } = await withTimeout(sb.from(t).select("*", { count: "exact", head: true }));
        lines.push(error ? "❌ " + t + ": " + error.message : "✅ " + t + ": " + count);
        if (error) logError("Database check " + t + ": " + error.message);
      }
      out.innerHTML = lines.map(esc).join("<br>");
    } catch (e) { out.textContent = "❌ " + e.message; logError("Database check: " + e.message); }
  }

  // ---------- ⚙️ drawer ----------
  function init(extra = "") {
    const here = location.pathname.split("/").pop() || "index.html";
    const links = [["index.html", "🏠 Home"], ["library.html", "📚 Library"], ["pack.html", "🖨️ Print a pack"], ["make.html", "✏️ Make a maze"], ["answer.html", "🎬 Answers"], ["rework.html", "🔧 To rework"], ["research/index.html", "🔭 Research"]];
    document.body.insertAdjacentHTML("beforeend", `
      <button class="gear noprint" id="gear" aria-label="Settings">⚙️</button>
      <div class="drawer noprint" id="drawer" hidden>
        <h2>Settings</h2>
        <div id="drawerExtra">${extra}</div>
        <h3>Pages</h3>
        <ul>${links.filter(([h]) => h !== here).map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>
        <h3>Database</h3>
        <p><small id="syncMsg">${esc(sync.message)}</small></p>
        <form id="signForm" class="row" hidden>
          <input class="field" id="signEmail" type="email" autocomplete="username" placeholder="Email" style="width:100%">
          <input class="field" id="signPass" type="password" autocomplete="current-password" placeholder="Password" style="width:100%">
          <button class="btn mint" type="submit">Sign in</button>
        </form>
        <div class="row">
          <button class="btn" id="syncBtn" type="button">☁️ Sync</button>
          <button class="btn" id="dbCheck" type="button">Check database</button>
          <button class="btn" id="signOut" type="button" hidden>Sign out</button>
        </div>
        <div id="dbResult"><small></small></div>
        <label><input type="checkbox" id="showErrors"> Show errors</label>
      </div>
      <pre class="errors noprint" id="errors" hidden></pre>`);
    const top = document.querySelector(".top");
    if (top && !document.getElementById("pill")) top.insertAdjacentHTML("beforeend", `<span class="chip noprint" id="pill">💾 this device</span>`);
    const drawer = document.getElementById("drawer"), form = document.getElementById("signForm");
    const refreshForm = () => { form.hidden = !!sync.session || !cfg(); document.getElementById("signOut").hidden = !sync.session; };
    document.getElementById("gear").addEventListener("click", () => { drawer.hidden = !drawer.hidden; if (!drawer.hidden) { refreshForm(); if (api.onDrawer) api.onDrawer(); } });
    document.getElementById("showErrors").addEventListener("change", e => { document.getElementById("errors").hidden = !e.target.checked; });
    document.getElementById("errors").textContent = errors.join("\n");
    form.addEventListener("submit", async e => {
      e.preventDefault();
      try { await signIn(document.getElementById("signEmail").value.trim(), document.getElementById("signPass").value); refreshForm(); }
      catch (err) { setState("error", "Could not sign in: " + err.message); logError("Sign in: " + err.message); }
    });
    document.getElementById("syncBtn").addEventListener("click", () => { (sync.session ? syncNow() : connect()).catch(err => logError("Sync: " + err.message)); });
    document.getElementById("dbCheck").addEventListener("click", dbCheck);
    document.getElementById("signOut").addEventListener("click", async () => { await signOut(); refreshForm(); });
    setPill();
    connect();
  }

  // ---------- JPEG pictures (thumbnails, answer keys) ----------
  const jpgCache = new Map();
  function toJpeg(svgText, width = 440, quality = 0.82) {
    const key = width + ":" + svgText.length + ":" + svgText.slice(-200);
    if (jpgCache.has(key)) return Promise.resolve(jpgCache.get(key));
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const c = document.createElement("canvas");
          c.width = width; c.height = Math.round(width * S.H / S.W);
          const x = c.getContext("2d");
          x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height);
          x.drawImage(img, 0, 0, c.width, c.height);
          const url = c.toDataURL("image/jpeg", quality);
          jpgCache.set(key, url); resolve(url);
        } catch (e) { reject(e); }
      };
      img.onerror = () => reject(new Error("Could not draw the maze picture"));
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgText.replace(/width="11in" height="8.5in"/, `width="${S.W}" height="${S.H}"`));
    });
  }
  // Draw a card's picture only when it scrolls into view (the library has hundreds).
  const seen = new Map();
  let io = null;
  function lazyThumb(img, rc, width = 480) {
    if (seen.has(rc.code)) { img.src = seen.get(rc.code); return; }
    const go = () => {
      try { toJpeg(S.svg(rc).svg, width).then(url => { seen.set(rc.code, url); img.src = url; }).catch(e => logError("picture " + rc.code + ": " + e.message)); }
      catch (e) { logError("picture " + rc.code + ": " + e.message); }
    };
    if (!("IntersectionObserver" in root)) { go(); return; }
    if (!io) io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { io.unobserve(en.target); en.target._go(); } }), { rootMargin: "300px" });
    img._go = go; io.observe(img);
  }

  // ---------- Felix's log: how each maze went, to find his sweet spot ----------
  const log = () => store.get(LOG, []);
  function addLog(entry) { const l = log(); l.push(Object.assign({ at: new Date().toISOString() }, entry)); store.set(LOG, l); }
  /* Sweet spot: start at level 2. "Just right" holds a level, "too easy" points one up, "too hard" one down.
     The last five reactions count, newest most. */
  function sweetSpot() {
    const l = log().slice(-5);
    if (!l.length) return { level: 2, from: 0 };
    let sum = 0, wsum = 0;
    l.forEach((e, i) => { const w = i + 1, v = e.level + (e.mood === "easy" ? 1 : e.mood === "hard" ? -1 : 0); sum += w * v; wsum += w; });
    return { level: Math.max(1, Math.min(5, Math.round(sum / wsum))), from: l.length };
  }

  // Grow a few versions of a recipe and keep the best one that passes the check (the answer never touches a wall).
  function bestOf(rc, tries = 8) {
    const Q = root.FMZ.score;
    let best = null;
    for (let k = 0; k < tries; k++) {
      const r = Object.assign({}, rc, { seed: k === 0 ? rc.seed : 1 + Math.floor(Math.random() * 1e6) });
      const model = S.buildModel(r), sc = Q.score(model);
      if (!sc.ok) continue;
      const rank = sc.overall - Math.abs(sc.level - r.level) * 0.8;
      if (!best || rank > best.rank) best = { rc: r, model, sc, rank };
    }
    return best;
  }

  // ---------- picking: puzzle of the day, top five, packs. Flagged and unchecked puzzles are never picked. ----------
  const eligible = () => bank().filter(r => r.published && r.qc !== false && !isFlagged(r.n));
  const hash = s => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const dayKey = (d = new Date()) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");

  // Same puzzle all day on every device; walks forward from the day's hash to one near Felix's sweet spot.
  function potd(date = new Date()) {
    const list = eligible().sort((a, b) => a.n - b.n);
    if (!list.length) return null;
    const spot = sweetSpot().level, start = hash("fmz" + dayKey(date)) % list.length;
    for (let k = 0; k < list.length; k++) {
      const r = list[(start + k) % list.length];
      if (Math.abs(r.level - spot) <= 1) return r;
    }
    return list[start];
  }
  const overall = r => (r.score && r.score.overall) || 0;
  function topFive() {
    return eligible().sort((a, b) => overall(b) - overall(a) || Math.abs(a.level - 2.5) - Math.abs(b.level - 2.5) || a.n - b.n).slice(0, 5);
  }

  const printed = () => store.get(PRINTED, {});
  function markPrinted(list) { const p = printed(), day = dayKey(); list.forEach(r => { p[r.n] = day; }); store.set(PRINTED, p); }
  const clearPrinted = () => store.set(PRINTED, {});

  /* A pack of 10 for double-sided printing: not printed before, levels clustered around Felix's sweet spot
     (a bell curve), different themes next to each other, no two of the same design. Shuffle for another. */
  function pickPack(size = 10, seed = Math.random()) {
    const done = printed();
    let pool = eligible().filter(r => !done[r.n]);
    if (pool.length < size) pool = eligible();
    const spot = sweetSpot().level;
    const rnd = (() => { let a = Math.floor(seed * 4294967296) >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();
    const wt = d => (d === 0 ? 4 : d === 1 ? 2.5 : d === 2 ? 1 : 0.3);
    const pack = [];
    const design = r => r.design || r.style;
    while (pack.length < size && pool.length) {
      const last = pack[pack.length - 1];
      let best = null, bestW = -1;
      for (const r of pool) {
        let w = wt(Math.abs(r.level - spot)) * (0.4 + rnd());
        if (last && last.family === r.family) w *= 0.35;
        if (pack.some(p => design(p) === design(r))) w *= 0.1;
        if (pack.some(p => p.title === r.title)) w *= 0.2;
        if (w > bestW) { bestW = w; best = r; }
      }
      pack.push(best); pool = pool.filter(r => r !== best);
    }
    return pack;
  }

  const api = {
    init, logError, store, param, esc,
    bank, find, nextNumber, saveRecipe, removeSaved, saved, sheetUrl,
    REASONS, flags, openFlags, isFlagged, addFlag, resolveFlag, sync, connect, syncNow,
    toJpeg, lazyThumb, log, addLog, sweetSpot, bestOf,
    eligible, potd, topFive, pickPack, printed, markPrinted, clearPrinted, dayKey,
    onDrawer: null, onFlags: null
  };
  root.FMZ.app = api;
})(window);
