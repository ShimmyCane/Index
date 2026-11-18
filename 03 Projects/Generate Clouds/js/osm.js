/* Generate Clouds — the ground colours near the place, from OpenStreetMap map tiles.
   The map's own colours already show the land: dark green woods, light green grass and parks, pale
   farmland, blue water, grey streets and built-up areas. Five by five tiles (zoom 14, about 12 km) are
   read and sampled onto the same 128 x 128 grid as the fine ground map, so the shader can tint the
   ground with them. Light use: one set of 25 tiles per place. Map data © OpenStreetMap contributors. */
(function () {
  'use strict';
  var GC = window.GC = window.GC || {};
  var Osm = GC.Osm = { ok: false, key: '', data: null, T: 128 };
  var Z = 14, TS = 256, NT = 5, KEY_PREFIX = 'osm';

  function wx(lon, z) { return (lon + 180) / 360 * TS * Math.pow(2, z); }
  function wy(lat, z) { var s = Math.sin(GC.rad(GC.clamp(lat, -85.05, 85.05))); return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * TS * Math.pow(2, z); }
  function tileImg(x, y) {
    var n = Math.pow(2, Z);
    return new Promise(function (resolve, reject) {
      var im = new Image(); im.crossOrigin = 'anonymous';
      var t = setTimeout(function () { im.src = ''; reject(new Error('map tiles did not answer in time')); }, 15000);
      im.onload = function () { clearTimeout(t); resolve({ im: im, x: x, y: y }); };
      im.onerror = function () { clearTimeout(t); reject(new Error('map tiles could not be loaded')); };
      im.src = 'https://tile.openstreetmap.org/' + Z + '/' + (((x % n) + n) % n) + '/' + y + '.png';
    });
  }

  // Load the colours for a place over a square of half-width span (km). Calls back with the data or null.
  Osm.load = function (place, span) {
    var key = place.lat.toFixed(2) + ',' + place.lon.toFixed(2) + '@' + span.toFixed(1);
    if (Osm.ok && Osm.key === key) return Promise.resolve(Osm.data);
    var cx = wx(place.lon, Z), cy = wy(place.lat, Z), x0 = Math.floor(cx / TS) - 2, y0 = Math.floor(cy / TS) - 2, jobs = [];
    for (var ty = 0; ty < NT; ty++) for (var tx = 0; tx < NT; tx++) jobs.push(tileImg(x0 + tx, y0 + ty));
    return Promise.all(jobs).then(function (tiles) {
      var W = TS * NT, cv = document.createElement('canvas'); cv.width = W; cv.height = W;
      var g = cv.getContext('2d');
      tiles.forEach(function (t) { g.drawImage(t.im, (t.x - x0) * TS, (t.y - y0) * TS); });
      var px = g.getImageData(0, 0, W, W).data, T = Osm.T, out = new Uint8Array(T * T * 4);
      for (var j = 0; j < T; j++) for (var i = 0; i < T; i++) {
        var dx = (i / (T - 1) * 2 - 1) * span, dz = (j / (T - 1) * 2 - 1) * span;      // east and south, km
        var lat = GC.clamp(place.lat - dz / 111.2, -85, 85), lon = place.lon + dx / (111.2 * Math.max(Math.cos(GC.rad(lat)), 0.05));
        var X = Math.floor(wx(lon, Z) - x0 * TS), Y = Math.floor(wy(lat, Z) - y0 * TS);
        X = GC.clamp(X, 0, W - 1); Y = GC.clamp(Y, 0, W - 1);
        var o = (Y * W + X) * 4, d = (j * T + i) * 4;
        out[d] = px[o]; out[d + 1] = px[o + 1]; out[d + 2] = px[o + 2]; out[d + 3] = 255;
      }
      Osm.data = out; Osm.ok = true; Osm.key = key;
      return out;
    }).catch(function (e) {
      Osm.ok = false; Osm.data = null;
      GC.logError('Map colours: ' + ((e && e.message) || 'no connection') + '. The ground keeps its made-up colours.');
      return null;
    });
  };
  Osm.clear = function () { Osm.ok = false; Osm.data = null; Osm.key = ''; };
})();
