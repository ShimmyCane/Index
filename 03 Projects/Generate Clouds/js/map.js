/* Generate Clouds — the map panel.
   A small world map to pick the exact spot: drag to move, + and − to zoom, tap to drop a pin.
   Map pictures are OpenStreetMap tiles; if they cannot load (no connection, or the page is
   opened as a file) the map still works on a plain grid with city dots. No library. */
(function () {
  'use strict';
  var GC = window.GC = window.GC || {};
  var M = GC.Map = { lat: 20, lon: 0, zoom: 1, pin: null, place: null, favs: [], onPick: null, tilesOk: null };
  var box, layer, marks, TS = 256;

  function wx(lon, z) { return (lon + 180) / 360 * TS * Math.pow(2, z); }
  function wy(lat, z) { var s = Math.sin(GC.rad(GC.clamp(lat, -85.05, 85.05))); return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * TS * Math.pow(2, z); }
  function lonOf(x, z) { return x / (TS * Math.pow(2, z)) * 360 - 180; }
  function latOf(y, z) { var n = Math.PI - 2 * Math.PI * y / (TS * Math.pow(2, z)); return GC.deg(Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))); }

  function mark(cls, lat, lon, text, title) {
    var w = box.clientWidth, h = box.clientHeight, world = TS * Math.pow(2, M.zoom);
    var x = wx(lon, M.zoom) - wx(M.lon, M.zoom), y = wy(lat, M.zoom) - wy(M.lat, M.zoom);
    x = ((x + world / 2) % world + world) % world - world / 2;          // the nearest copy of the world
    if (Math.abs(x) > w / 2 + 20 || Math.abs(y) > h / 2 + 20) return;
    var d = document.createElement('div'); d.className = 'mk ' + cls; d.textContent = text; if (title) d.title = title;
    d.style.left = (w / 2 + x) + 'px'; d.style.top = (h / 2 + y) + 'px'; marks.appendChild(d);
  }
  M.draw = function () {
    if (!box) return;
    var w = box.clientWidth, h = box.clientHeight, z = M.zoom, n = Math.pow(2, z);
    var cx = wx(M.lon, z), cy = wy(M.lat, z), x0 = Math.floor((cx - w / 2) / TS), x1 = Math.floor((cx + w / 2) / TS), y0 = Math.floor((cy - h / 2) / TS), y1 = Math.floor((cy + h / 2) / TS);
    var want = {};
    for (var ty = y0; ty <= y1; ty++) for (var tx = x0; tx <= x1; tx++) {
      if (ty < 0 || ty >= n) continue;
      var id = z + '/' + (((tx % n) + n) % n) + '/' + ty, key = id + '@' + tx;
      want[key] = true;
      var el = layer.querySelector('[data-k="' + key + '"]');
      if (!el) {
        el = document.createElement('div'); el.className = 'tile'; el.dataset.k = key;
        if (M.tilesOk !== false) {
          var img = new Image(); img.alt = ''; img.draggable = false;
          img.onload = function () { M.tilesOk = true; }; img.onerror = function () { if (M.tilesOk === null) { M.tilesOk = false; M.draw(); } this.remove(); };
          img.src = 'https://tile.openstreetmap.org/' + id + '.png'; el.appendChild(img);
        }
        layer.appendChild(el);
      }
      el.style.left = Math.round(tx * TS - cx + w / 2) + 'px'; el.style.top = Math.round(ty * TS - cy + h / 2) + 'px';
    }
    Array.prototype.slice.call(layer.children).forEach(function (el) { if (!want[el.dataset.k]) el.remove(); });
    marks.textContent = '';
    if (M.tilesOk === false && z <= 5) GC.CITIES.forEach(function (c) { mark('city', c.lat, c.lon, z >= 3 ? '· ' + c.name : '·'); });
    M.favs.forEach(function (f) { mark('fav', f.lat, f.lon, '★', f.name); });
    if (M.place) mark('here', M.place.lat, M.place.lon, '●', 'The sky is generated here');
    if (M.pin) mark('pin', M.pin.lat, M.pin.lon, '📍', 'Your pick');
    box.classList.toggle('plain', M.tilesOk === false);
  };
  M.setView = function (lat, lon, zoom) { M.lat = GC.clamp(lat, -85, 85); M.lon = ((lon + 540) % 360) - 180; if (zoom != null) M.zoom = GC.clamp(Math.round(zoom), 1, 15); M.draw(); };
  M.setPlace = function (p, zoom) { M.place = { lat: p.lat, lon: p.lon }; M.pin = null; M.setView(p.lat, p.lon, zoom == null ? Math.max(M.zoom, 9) : zoom); };
  M.setFavs = function (list) { M.favs = list || []; M.draw(); };
  M.zoomBy = function (d) { M.setView(M.lat, M.lon, M.zoom + d); };

  M.init = function (el) {
    box = el; layer = document.createElement('div'); layer.className = 'tiles'; marks = document.createElement('div'); marks.className = 'marks';
    box.appendChild(layer); box.appendChild(marks);
    var pts = {}, moved = 0, pinch = 0;
    function n() { return Object.keys(pts).length; }
    function dist() { var k = Object.keys(pts); return Math.hypot(pts[k[0]].x - pts[k[1]].x, pts[k[0]].y - pts[k[1]].y); }
    box.addEventListener('pointerdown', function (e) { pts[e.pointerId] = { x: e.clientX, y: e.clientY }; try { box.setPointerCapture(e.pointerId); } catch (x) { /* synthetic */ } if (n() === 1) moved = 0; else pinch = dist(); });
    box.addEventListener('pointermove', function (e) {
      var p = pts[e.pointerId]; if (!p) return;
      var dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
      if (n() === 1) { M.lon = ((lonOf(wx(M.lon, M.zoom) - dx, M.zoom) + 540) % 360) - 180; M.lat = GC.clamp(latOf(wy(M.lat, M.zoom) - dy, M.zoom), -85, 85); M.draw(); }
      else if (n() === 2) { var d = dist(); if (pinch > 0 && d > pinch * 1.5) { M.zoomBy(1); pinch = d; } else if (pinch > 0 && d < pinch / 1.5) { M.zoomBy(-1); pinch = d; } }
    });
    function up(e) {
      var p = pts[e.pointerId]; delete pts[e.pointerId];
      if (!p || n() > 0 || moved > 8 || e.type === 'pointercancel') return;
      var r = box.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      M.pin = { lat: latOf(wy(M.lat, M.zoom) + y, M.zoom), lon: ((lonOf(wx(M.lon, M.zoom) + x, M.zoom) + 540) % 360) - 180 };
      M.draw(); if (M.onPick) M.onPick(M.pin);
    }
    box.addEventListener('pointerup', up); box.addEventListener('pointercancel', up);
    box.addEventListener('wheel', function (e) { e.preventDefault(); M.zoomBy(e.deltaY > 0 ? -1 : 1); }, { passive: false });
    window.addEventListener('resize', M.draw);
    M.draw();
  };
})();
