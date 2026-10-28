/* Felix Maze shared page helpers: ⚙️ drawer, error panel, the maze bank, JPEG pictures of sheets.
   The bank is the published catalog (data/catalog.js) plus mazes baked on this device (localStorage).
   Later the bank also comes from Supabase (supabase/001_felix_maze.sql), with these two as fallbacks. */
(function (root) {
  "use strict";
  const S = root.FMZ.sheet;
  const SAVED = "fmz.saved";

  // ---------- errors: opt-in panel at the bottom ----------
  const errors = [];
  function logError(msg) {
    errors.push(new Date().toLocaleTimeString() + "  " + msg);
    const box = document.getElementById("errors");
    if (box) box.textContent = errors.join("\n");
  }
  root.addEventListener("error", e => logError(e.message + (e.filename ? " (" + e.filename.split("/").pop() + ":" + e.lineno + ")" : "")));
  root.addEventListener("unhandledrejection", e => logError(String(e.reason)));

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { logError("Could not save on this device: " + e.message); return false; } }
  };

  // ---------- ⚙️ drawer ----------
  function init(extra = "") {
    const here = location.pathname.split("/").pop() || "index.html";
    const links = [["index.html", "🏠 Home"], ["library.html", "📚 Library"], ["make.html", "✏️ Make a maze"], ["answer.html", "🎬 Answers"], ["research/index.html", "🔭 Research"]];
    document.body.insertAdjacentHTML("beforeend", `
      <button class="gear noprint" id="gear" aria-label="Settings">⚙️</button>
      <div class="drawer noprint" id="drawer" hidden>
        <h2>Settings</h2>
        <div id="drawerExtra">${extra}</div>
        <h3>Pages</h3>
        <ul>${links.filter(([h]) => h !== here).map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>
        <label><input type="checkbox" id="showErrors"> Show errors</label>
      </div>
      <pre class="errors noprint" id="errors" hidden></pre>`);
    const drawer = document.getElementById("drawer");
    document.getElementById("gear").addEventListener("click", () => { drawer.hidden = !drawer.hidden; if (!drawer.hidden && api.onDrawer) api.onDrawer(); });
    document.getElementById("showErrors").addEventListener("change", e => { document.getElementById("errors").hidden = !e.target.checked; });
    document.getElementById("errors").textContent = errors.join("\n");
  }

  // ---------- the bank ----------
  function saved() { return store.get(SAVED, []); }
  function bank() {
    const all = (root.FMZ_CATALOG || []).map(r => Object.assign({ published: true }, r)).concat(saved());
    all.sort((a, b) => a.n - b.n);
    all.forEach(r => { r.code = S.code(r); });
    return all;
  }
  function find(q) {
    const p = S.parseCode(q);
    if (!p) return null;
    const all = bank();
    return all.find(r => r.n === p.n && (p.family === undefined || (r.family === p.family && r.level === p.level && (r.source || 0) === p.source))) || all.find(r => r.n === p.n) || null;
  }
  const nextNumber = () => bank().reduce((m, r) => Math.max(m, r.n), 0) + 1;
  function saveRecipe(rc) {
    const list = saved();
    const copy = JSON.parse(JSON.stringify(rc));
    delete copy.growth; delete copy.code;
    list.push(copy);
    return store.set(SAVED, list) ? copy : null;
  }
  function removeSaved(n) { store.set(SAVED, saved().filter(r => r.n !== n)); }

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

  const param = k => new URLSearchParams(location.search).get(k);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const sheetUrl = r => "sheet.html?code=" + encodeURIComponent(r.code || S.code(r));

  const api = { init, logError, store, bank, find, nextNumber, saveRecipe, removeSaved, saved, toJpeg, param, esc, sheetUrl, onDrawer: null };
  root.FMZ.app = api;
})(window);
