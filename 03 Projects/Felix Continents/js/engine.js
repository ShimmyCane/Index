/* Felix Continents engine (classic script, no three.js here).
 * Geometry in degrees (lon, lat). Plates move by offsets [dLon, dLat, spin].
 * Used by index.html (V1), v2.html (draggable plates) and v3.html (random worlds). */
(function () {
  var COLS = 180, ROWS = 90;               // climate grid: 2 degrees per cell
  var SHELF = 1, ICE = 2, TUNDRA = 3, WOOD = 4, WET = 5, GRASS = 6, DESERT = 7, ALPINE = 8, PLAIN = 9;
  var COL = { 0: '#a9dcec', 1: '#f2e2b3', 2: '#f7fbff', 3: '#d9e4d0', 4: '#9cc79a', 5: '#5fae83',
    6: '#d7e9a0', 7: '#f5d28c', 8: '#cbbde8', 9: '#cfe3a6' };
  var OCEAN = COL[0], LAND = COL[9], INK = '#2f2d3d';
  var LEGEND = [[DESERT, '🏜️ Desert'], [GRASS, '🌾 Grassland'], [WOOD, '🌲 Woodland'], [WET, '🌴 Wet forest'],
    [TUNDRA, '🥶 Tundra'], [ICE, '🧊 Ice'], [ALPINE, '⛰️ Mountains']];

  function bbox(pts) {
    var a = 1e9, b = -1e9, c = 1e9, d = -1e9;
    pts.forEach(function (p) { a = Math.min(a, p[0]); b = Math.max(b, p[0]); c = Math.min(c, p[1]); d = Math.max(d, p[1]); });
    return [a, b, c, d];
  }
  function pip(x, y, pts) {
    var inside = false;
    for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      var xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  function insidePts(lon, lat, pts, bb) {
    var ks = [0, -360, 360];
    for (var n = 0; n < ks.length; n++) {
      var x = lon + ks[n];
      if (x < bb[0] || x > bb[1] || lat < bb[2] || lat > bb[3]) continue;
      if (pip(x, lat, pts)) return true;
    }
    return false;
  }
  function dlon(a, b) { return ((a - b + 540) % 360) - 180; }
  function toPx(lon, lat) { return [(lon + 180) / 360 * 2048, (90 - lat) / 180 * 1024]; }

  /* A geo object for one list of plates: centroids and transforms. */
  function makeGeo(plates) {
    var cen = {};
    plates.forEach(function (p) {
      var sx = 0, sy = 0;
      p.poly.forEach(function (q) { sx += q[0]; sy += q[1]; });
      cen[p.id] = [sx / p.poly.length, sy / p.poly.length];
    });
    function xf(id, lon, lat, off) {
      var c = cen[id], a = off[2] * Math.PI / 180, dx = lon - c[0], dy = lat - c[1];
      return [c[0] + dx * Math.cos(a) - dy * Math.sin(a) + off[0], c[1] + dx * Math.sin(a) + dy * Math.cos(a) + off[1]];
    }
    function plateTransformed(p, off) { return p.poly.map(function (q) { return xf(p.id, q[0], q[1], off); }); }
    function plateAt(lon, lat, offs) {
      for (var i = 0; i < plates.length; i++) {
        var pts = plateTransformed(plates[i], offs[plates[i].id] || [0, 0, 0]);
        if (insidePts(lon, lat, pts, bbox(pts))) return plates[i];
      }
      return null;
    }
    return { plates: plates, cen: cen, xf: xf, plateTransformed: plateTransformed, plateAt: plateAt };
  }

  function bfs(sources) {
    var d = new Int16Array(ROWS * COLS).fill(-1), q = [];
    for (var i = 0; i < sources.length; i++) if (sources[i]) { d[i] = 0; q.push(i); }
    for (var h = 0; h < q.length; h++) {
      var k = q[h], r = (k / COLS) | 0, c = k % COLS;
      var nb = [];
      if (r > 0) nb.push(k - COLS);
      if (r < ROWS - 1) nb.push(k + COLS);
      nb.push(r * COLS + ((c + 1) % COLS), r * COLS + ((c + COLS - 1) % COLS));
      for (var n = 0; n < nb.length; n++) { var j = nb[n]; if (d[j] < 0) { d[j] = d[k] + 1; q.push(j); } }
    }
    return d;
  }

  /* Climate codes for one moment. m = { age, sea (cells: <0 exposes shelf, >0 floods), ice (bool) }.
   * offs = { plateId: [dLon, dLat, spin] } at that moment. features = list (kind, plate, lon, lat, from, to). */
  function computeWorld(geo, features, offs, m) {
    var tp = geo.plates.map(function (p) { var pts = geo.plateTransformed(p, offs[p.id] || [0, 0, 0]); return { pts: pts, bb: bbox(pts) }; });
    var land = new Uint8Array(ROWS * COLS), i, r, c;
    for (r = 0; r < ROWS; r++) for (c = 0; c < COLS; c++) {
      var lon = -179 + 2 * c, lat = 89 - 2 * r;
      for (var t = 0; t < tp.length; t++) if (insidePts(lon, lat, tp[t].pts, tp[t].bb)) { land[r * COLS + c] = 1; break; }
    }
    var shelf = new Uint8Array(ROWS * COLS);
    if (m.sea < 0) {
      var dl = bfs(land);
      for (i = 0; i < land.length; i++) if (!land[i] && dl[i] >= 0 && dl[i] <= -m.sea) shelf[i] = 1;
    } else if (m.sea > 0) {
      var dsea = bfs(land.map(function (v) { return v ? 0 : 1; }));
      for (i = 0; i < land.length; i++) if (land[i] && dsea[i] >= 0 && dsea[i] <= m.sea) land[i] = 0;
    }
    var seaSources = new Uint8Array(ROWS * COLS);
    for (i = 0; i < land.length; i++) seaSources[i] = (!land[i] && !shelf[i]) ? 1 : 0;
    var dOcean = bfs(seaSources);
    var mtn = new Uint8Array(ROWS * COLS), near = new Uint8Array(ROWS * COLS);
    features.forEach(function (f) {
      if (f.kind !== 'mountain' || !(f.to <= m.age && m.age <= f.from)) return;
      var p = geo.xf(f.plate, f.lon, f.lat, offs[f.plate] || [0, 0, 0]);
      var cc = Math.floor((p[0] + 180) / 2), rr0 = Math.floor((90 - p[1]) / 2);
      if (rr0 < 0 || rr0 >= ROWS) return;
      for (var dr = -1; dr <= 1; dr++) for (var dc = -1; dc <= 1; dc++) {
        var rr = rr0 + dr; if (rr < 0 || rr >= ROWS) continue;
        near[rr * COLS + ((cc + dc + COLS) % COLS)] = 1;
      }
      mtn[rr0 * COLS + cc] = 1;
    });
    var codes = new Uint8Array(ROWS * COLS);
    for (r = 0; r < ROWS; r++) for (c = 0; c < COLS; c++) {
      i = r * COLS + c;
      if (!land[i] && !shelf[i]) { codes[i] = 0; continue; }
      if (shelf[i]) { codes[i] = SHELF; continue; }
      var lat2 = 89 - 2 * r, a = Math.abs(lat2), wind = false, lee = false;
      for (var k = 1; k <= 4; k++) for (var dr2 = -1; dr2 <= 1; dr2++) {
        var r2 = r + dr2; if (r2 < 0 || r2 >= ROWS) continue;
        if (mtn[r2 * COLS + ((c - k + COLS) % COLS)]) wind = true;
        if (mtn[r2 * COLS + ((c + k) % COLS)]) lee = true;
      }
      var inland = dOcean[i];
      if (m.ice && a >= 50) codes[i] = ICE;
      else if (a >= 72) codes[i] = ICE;
      else if (m.ice && a >= 40) codes[i] = TUNDRA;
      else if (a >= 60) codes[i] = TUNDRA;
      else if (near[i] && a >= 25) codes[i] = ALPINE;
      else if (a < 12) codes[i] = (inland > 10 && !wind) ? WOOD : WET;
      else if (a < 33) codes[i] = (lee || (inland > 8 && !wind)) ? DESERT : (wind ? WET : GRASS);
      else codes[i] = wind ? WET : (lee ? GRASS : (inland > 10 ? GRASS : WOOD));
    }
    return { codes: codes };
  }

  function drawGrid(ctx, codes, climateOn) {
    ctx.fillStyle = OCEAN; ctx.fillRect(0, 0, 2048, 1024);
    var cw = 2048 / COLS, ch = 1024 / ROWS;
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
      var code = codes[r * COLS + c];
      if (!code) continue;
      if (!climateOn && code !== SHELF) code = PLAIN;
      ctx.fillStyle = COL[code];
      ctx.fillRect(c * cw, r * ch, cw + 0.6, ch + 0.6);
    }
  }
  function polyPath(ctx, pts, k) {
    ctx.beginPath();
    pts.forEach(function (p, i) { var xy = toPx(p[0] + k, p[1]); if (i) ctx.lineTo(xy[0], xy[1]); else ctx.moveTo(xy[0], xy[1]); });
    ctx.closePath();
  }
  function drawPlates(ctx, geo, offs, fillIt) {
    ctx.lineJoin = 'round'; ctx.lineWidth = 5; ctx.strokeStyle = INK;
    geo.plates.forEach(function (p) {
      var pts = geo.plateTransformed(p, offs[p.id] || [0, 0, 0]);
      [-360, 0, 360].forEach(function (k) {
        polyPath(ctx, pts, k);
        if (fillIt) { ctx.fillStyle = LAND; ctx.fill(); }
        ctx.stroke();
      });
    });
  }
  function drawFeatures(ctx, geo, features, age, offs) {
    features.forEach(function (f) {
      if (!(f.to <= age && age <= f.from)) return;
      var p = geo.xf(f.plate, f.lon, f.lat, offs[f.plate] || [0, 0, 0]);
      [-360, 0, 360].forEach(function (k) {
        var xy = toPx(p[0] + k, p[1]), x = xy[0], y = xy[1];
        if (x < -40 || x > 2088) return;
        ctx.lineWidth = 4; ctx.strokeStyle = INK;
        if (f.kind === 'volcano') {
          ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI * 2); ctx.fillStyle = '#ff8a65'; ctx.fill(); ctx.stroke();
        } else {
          ctx.beginPath(); ctx.moveTo(x, y - 24); ctx.lineTo(x + 22, y + 14); ctx.lineTo(x - 22, y + 14); ctx.closePath();
          ctx.fillStyle = '#8e7cc3'; ctx.fill(); ctx.stroke();
        }
      });
    });
  }

  window.FCEngine = {
    COLS: COLS, ROWS: ROWS, COL: COL, LAND: LAND, OCEAN: OCEAN, INK: INK, LEGEND: LEGEND, PLAIN: PLAIN,
    bbox: bbox, pip: pip, insidePts: insidePts, dlon: dlon, toPx: toPx,
    makeGeo: makeGeo, bfs: bfs, computeWorld: computeWorld,
    drawGrid: drawGrid, drawPlates: drawPlates, drawFeatures: drawFeatures
  };
})();
