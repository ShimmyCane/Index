/* Generate Clouds — the ground under the sky.
   A coarse height map around the chosen place: 24 x 24 points, 5 km apart (120 km across),
   from Open-Meteo's elevation service (0 m means sea). It is smoothed up to 128 x 128 for
   the shader, which adds small made-up relief on top. This is a general shape of the land
   and the coast, not a survey: a 5 km grid cannot show a street, a cliff or a small bay.
   Without a connection the ground is made-up rolling land, and the page says so. */
(function () {
  'use strict';
  var GC = window.GC = window.GC || {};
  var N = 24, SPAN = 60, T = 128, KEY = 'gc.terrain', KEEP = 8;
  var Tn = GC.Terrain = { N: N, SPAN: SPAN, T: T, hi: new Float32Array(T * T), mk: new Float32Array(T * T), max: 0.3, source: 'none', key: '' };

  // The latitude and longitude of each grid point. Rows run north to south, columns west to east.
  Tn.points = function (place) {
    var pts = [], kx = 111.2 * Math.cos(GC.rad(place.lat));
    for (var j = 0; j < N; j++) for (var i = 0; i < N; i++) {
      var x = (i / (N - 1) * 2 - 1) * SPAN, z = (j / (N - 1) * 2 - 1) * SPAN;
      pts.push({ lat: GC.clamp(place.lat - z / 111.2, -89.9, 89.9), lon: ((place.lon + x / Math.max(kx, 5) + 540) % 360) - 180 });
    }
    return pts;
  };

  function madeUp(place) {
    // Rolling land from a few sine waves, seeded by the place. No sea: a made-up coast would mislead.
    var a = place.lat * 0.37, b = place.lon * 0.23, out = [];
    for (var j = 0; j < N; j++) for (var i = 0; i < N; i++) {
      var h = 140 + 90 * Math.sin(i * 0.55 + a) * Math.cos(j * 0.42 + b) + 60 * Math.sin((i + j) * 0.31 + a * 2) + 40 * Math.cos(i * 0.9 - j * 0.7 + b);
      out.push(Math.max(20, Math.round(h)));
    }
    return out;
  }
  function cubic(p0, p1, p2, p3, t) { return p1 + 0.5 * t * (p2 - p0 + t * (2 * p0 - 5 * p1 + 4 * p2 - p3 + t * (3 * (p1 - p2) + p3 - p0))); }
  function upsample(src, clampLo, clampHi) {
    var out = new Float32Array(T * T);
    function g(i, j) { return src[GC.clamp(j, 0, N - 1) * N + GC.clamp(i, 0, N - 1)]; }
    for (var y = 0; y < T; y++) for (var x = 0; x < T; x++) {
      var gx = (x + 0.5) / T * (N - 1), gy = (y + 0.5) / T * (N - 1), ix = Math.floor(gx), iy = Math.floor(gy), fx = gx - ix, fy = gy - iy, rows = [];
      for (var r = -1; r <= 2; r++) rows.push(cubic(g(ix - 1, iy + r), g(ix, iy + r), g(ix + 1, iy + r), g(ix + 2, iy + r), fx));
      out[y * T + x] = GC.clamp(cubic(rows[0], rows[1], rows[2], rows[3], fy), clampLo, clampHi);
    }
    return out;
  }
  function toHalf(v) {                       // a 32-bit number as a 16-bit half float
    if (v <= 0) return 0;
    var e = Math.floor(Math.log(v) / Math.LN2);
    if (e < -14) return 0;
    if (e > 15) return 0x7bff;
    return ((e + 15) << 10) | (Math.round((v / Math.pow(2, e) - 1) * 1024) & 0x3ff);
  }
  function build(metres, source, key) {
    var h = metres.map(function (m) { return Math.max(m, 0) / 1000; }), k = metres.map(function (m) { return m > 0 ? 1 : 0; });
    Tn.hi = upsample(h, 0, 9); Tn.mk = upsample(k, 0, 1);
    var mx = 0; for (var i = 0; i < T * T; i++) if (Tn.hi[i] > mx) mx = Tn.hi[i];
    Tn.max = mx + (0.02 + 0.2 * mx) * 0.65 + 0.01;
    Tn.source = source; Tn.key = key; Tn.metres = metres;
    var data = new Uint16Array(T * T * 4), one = toHalf(1);
    for (var p = 0; p < T * T; p++) { data[p * 4] = toHalf(Tn.hi[p]); data[p * 4 + 1] = toHalf(Tn.mk[p]); data[p * 4 + 2] = 0; data[p * 4 + 3] = one; }
    Tn.tex = data;
    return Tn;
  }
  function placeKey(p) { return p.lat.toFixed(2) + ',' + p.lon.toFixed(2); }

  // Load the ground for a place: saved copy, then the elevation service, then made-up land.
  Tn.load = function (place) {
    var key = placeKey(place), saved = GC.store.get(KEY, []);
    if (!Array.isArray(saved)) saved = [];
    for (var i = 0; i < saved.length; i++) if (saved[i].key === key && saved[i].m && saved[i].m.length === N * N) return Promise.resolve(build(saved[i].m, 'data', key));
    return GC.Weather.elevations(Tn.points(place)).then(function (m) {
      saved = saved.filter(function (s) { return s.key !== key; }); saved.unshift({ key: key, m: m });
      while (saved.length > KEEP) saved.pop();
      GC.store.set(KEY, saved);
      return build(m, 'data', key);
    }, function (e) {
      GC.logError('Ground: ' + ((e && e.name === 'AbortError') ? 'no answer in time' : (e && e.message) || 'no connection') + '. Showing made-up land.');
      return build(madeUp(place), 'made-up', key);
    });
  };
  Tn.flat = function (place) { return build(madeUp(place || { lat: 0, lon: 0 }), 'made-up', ''); };

  function sample(arr, x, z) {
    var u = GC.clamp((x / (2 * SPAN) + 0.5) * T - 0.5, 0, T - 1), v = GC.clamp((z / (2 * SPAN) + 0.5) * T - 0.5, 0, T - 1);
    var i = Math.min(Math.floor(u), T - 2), j = Math.min(Math.floor(v), T - 2), fu = u - i, fv = v - j;
    return GC.lerp(GC.lerp(arr[j * T + i], arr[j * T + i + 1], fu), GC.lerp(arr[(j + 1) * T + i], arr[(j + 1) * T + i + 1], fu), fv);
  }
  function land(m) { var x = GC.clamp((m - 0.5) / 0.14, 0, 1); return x * x * (3 - 2 * x); }
  Tn.maskAt = function (x, z) { return sample(Tn.mk, x, z); };
  Tn.isSea = function (x, z) { return sample(Tn.mk, x, z) < 0.5; };
  Tn.heightAt = function (x, z) { return sample(Tn.hi, x, z) * land(sample(Tn.mk, x, z)); };          // km, without the small relief
  // The highest the ground can be here (with the shader's small relief), so the camera never goes under it.
  Tn.ceilAt = function (x, z) { var h = sample(Tn.hi, x, z); return (h + (0.02 + 0.2 * h) * 0.65) * land(sample(Tn.mk, x, z)); };

  // What kind of spot is the centre? Used for labels and for the favourites list.
  Tn.classify = function () {
    var sea = 0, n = 0, lo = 9, hi2 = 0;
    for (var a = -3; a <= 3; a++) for (var b = -3; b <= 3; b++) { n++; if (Tn.isSea(a, b)) sea++; }
    for (a = -10; a <= 10; a += 2) for (b = -10; b <= 10; b += 2) { var h = Tn.heightAt(a, b); lo = Math.min(lo, h); hi2 = Math.max(hi2, h); }
    var here = Tn.heightAt(0, 0), nearSea = sea > 0;
    if (!nearSea) for (a = 0; a < 16 && !nearSea; a++) { var th = a * Math.PI / 8; if (Tn.isSea(Math.sin(th) * 7, -Math.cos(th) * 7)) nearSea = true; }
    var kind = sea / n > 0.9 ? 'Open water' : nearSea ? 'Coast' : (here > 1.2 || hi2 - lo > 0.7) ? 'Mountains' : hi2 - lo > 0.25 ? 'Hills' : 'Lowland';
    return { kind: kind, height: here, seaShare: sea / n };
  };
  // The compass bearing (degrees) from (x, z) toward the nearest water, or toward the highest ground.
  Tn.bearing = function (what, x, z) {
    var best = null, score = -1e9, hits = [];
    for (var a = 0; a < 36; a++) {
      var th = a * Math.PI / 18, sx = Math.sin(th), sz = -Math.cos(th);
      for (var d = 0.5; d <= 45; d += (d < 5 ? 0.5 : 2.5)) {
        var px = x + sx * d, pz = z + sz * d;
        if (Math.abs(px) > SPAN || Math.abs(pz) > SPAN) break;
        if (what === 'water') { if (Tn.isSea(px, pz)) { hits.push({ deg: a * 10, dist: d }); if (-d > score) { score = -d; best = { deg: a * 10, dist: d }; } break; } }
        else { var s = Tn.heightAt(px, pz) - d * 0.012; if (s > score) { score = s; best = { deg: a * 10, dist: d }; } }
      }
    }
    if (what === 'water' && best) {                       // several directions reach water equally soon: face the middle of them
      var sx2 = 0, sy2 = 0;
      hits.forEach(function (h) { if (h.dist <= best.dist + 0.26) { sx2 += Math.sin(GC.rad(h.deg)); sy2 += Math.cos(GC.rad(h.deg)); } });
      best.deg = (Math.round(GC.deg(Math.atan2(sx2, sy2))) + 360) % 360;
    }
    return best;
  };
  build(madeUp({ lat: 0, lon: 0 }), 'none', '');
})();
