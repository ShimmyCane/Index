/* Generate Clouds — the night sky: bright stars and the figures of fifteen constellations, in the sky
   of the chosen place at the chosen moment (js/stars_data.js holds the positions).
   GC.Stars.setSky(place, utcMs) works out where each star is (altitude and azimuth from the place's
   latitude and longitude and the sidereal time) and draws them into a 2048 x 1024 picture, north at the
   left and right edges and the zenith at the top. The shader reads that picture for the stars.
   GC.Stars.draw(ctx, w, h, view, night) draws the figure lines and names on a 2-D layer, only when
   the Figures setting is on. Figures are drawn as lines between the catalogue's own points. */
(function () {
  'use strict';
  var GC = window.GC = window.GC || {};
  var St = GC.Stars = { ready: false, figs: [], dirs: [], canvas: null, key: '' };
  var PW = 2048, PH = 1024;

  // Greenwich mean sidereal time in degrees (standard formula, good to a fraction of a degree here).
  function gmst(ms) {
    var d = ms / 86400000 + 2440587.5 - 2451545.0, t = d / 36525;
    return ((280.46061837 + 360.98564736629 * d + 0.000387933 * t * t) % 360 + 360) % 360;
  }
  // Altitude and azimuth (degrees, azimuth from north through east) of a star for a place and moment.
  St.altaz = function (raDeg, decDeg, lat, lon, ms) {
    var H = GC.rad(((gmst(ms) + lon - raDeg) % 360 + 360) % 360), d = GC.rad(decDeg), p = GC.rad(lat);
    var alt = Math.asin(GC.clamp(Math.sin(d) * Math.sin(p) + Math.cos(d) * Math.cos(p) * Math.cos(H), -1, 1));
    var azS = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(p) - Math.tan(d) * Math.cos(p));   // from south, westward
    return { alt: GC.deg(alt), az: (GC.deg(azS) + 180 + 360) % 360 };
  };
  // A unit direction in the shader's frame: x east, y up, z south.
  function dirOf(alt, az) { var a = GC.rad(alt), z = GC.rad(az); return [Math.sin(z) * Math.cos(a), Math.sin(a), -Math.cos(z) * Math.cos(a)]; }
  // Colour of a star from its B-V index (Ballesteros' temperature formula, then a black-body colour).
  function colourOf(bv) {
    var b = isNaN(bv) ? 0.65 : GC.clamp(bv, -0.4, 2.0);
    var T = 4600 * (1 / (0.92 * b + 1.7) + 1 / (0.92 * b + 0.62)) / 100, r, g, bl;
    if (T <= 66) { r = 255; g = 99.47 * Math.log(T) - 161.12; bl = T <= 19 ? 0 : 138.52 * Math.log(T - 10) - 305.04; }
    else { r = 329.7 * Math.pow(T - 60, -0.1332); g = 288.12 * Math.pow(T - 60, -0.0755); bl = 255; }
    function c(v) { return Math.round(GC.clamp(v, 0, 255)); }
    return [c(r), c(g), c(bl)];
  }

  // Work out the sky for a place and moment. Returns the picture (a canvas) and keeps the figure points for drawing.
  St.setSky = function (place, utcMs) {
    var hour = Math.floor(utcMs / 3600000), key = place.lat.toFixed(2) + ',' + place.lon.toFixed(2) + '@' + hour;
    if (key === St.key && St.canvas) return St.canvas;
    St.key = key;
    if (!St.canvas) { St.canvas = document.createElement('canvas'); St.canvas.width = PW; St.canvas.height = PH; }
    var g = St.canvas.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, PW, PH);
    var stars = GC.STARS || [];
    stars.forEach(function (s) {
      var a = St.altaz(s[0], s[1], place.lat, place.lon, utcMs);
      if (a.alt < -4) return;                                        // below the horizon for good: not drawn
      var x = a.az / 360 * PW, y = (90 - a.alt) / 180 * PH, mag = s[2];
      var rad = GC.clamp(0.9 - 0.1 * mag, 0.45, 1.5), I = GC.clamp(1.2 - 0.2 * mag, 0.25, 1.0), c = colourOf(s[3]);
      var xs = [x]; if (x < rad * 3) xs.push(x + PW); if (x > PW - rad * 3) xs.push(x - PW);
      xs.forEach(function (xx) {
        var gr = g.createRadialGradient(xx, y, 0, xx, y, rad * 2.6);
        gr.addColorStop(0, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + I + ')');
        gr.addColorStop(0.4, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (I * 0.55) + ')');
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(xx, y, rad * 2.6, 0, Math.PI * 2); g.fill();
      });
    });
    // figures: the points as unit directions, one list per line, and a middle point for the name
    St.figs = (GC.FIGURES || []).map(function (f) {
      var all = [], lines = f.lines.map(function (ln) {
        return ln.map(function (p) { var a = St.altaz(p[0], p[1], place.lat, place.lon, utcMs); var v = dirOf(a.alt, a.az); all.push(v); return v; });
      });
      var m = [0, 0, 0]; all.forEach(function (v) { m[0] += v[0]; m[1] += v[1]; m[2] += v[2]; });
      var L = Math.hypot(m[0], m[1], m[2]) || 1;
      return { name: f.name, lines: lines, centre: [m[0] / L, m[1] / L, m[2] / L] };
    });
    St.ready = true;
    return St.canvas;
  };

  // Draw the figures on a 2-D layer. view = { f, r, u, tan, aspect } (the camera's frame, from the renderer).
  St.draw = function (ctx, w, h, view, night) {
    ctx.clearRect(0, 0, w, h);
    if (!+GC.settings.figures || !St.ready || night < 0.05) return;
    function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
    function project(v) {
      var c = dot(v, view.f); if (c < 0.02) return null;
      var nx = dot(v, view.r) / (c * view.tan * view.aspect), ny = dot(v, view.u) / (c * view.tan);
      return [(nx + 1) / 2 * w, (1 - ny) / 2 * h];
    }
    ctx.save(); ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(214,232,255,' + (0.55 * night) + ')';
    ctx.setLineDash([6, 5]);
    St.figs.forEach(function (f) {
      f.lines.forEach(function (ln) {
        ctx.beginPath(); var pen = false;
        ln.forEach(function (v) {
          var p = project(v);
          if (!p) { pen = false; return; }
          if (pen) {
            var q = ctx.__last; if (Math.abs(q[0] - p[0]) < w * 0.4 && Math.abs(q[1] - p[1]) < h * 0.4) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]);
          } else ctx.moveTo(p[0], p[1]);
          pen = true; ctx.__last = p;
        });
        ctx.stroke();
      });
      var c = project(f.centre);
      if (c && c[0] > 0 && c[0] < w && c[1] > 0 && c[1] < h) {
        ctx.setLineDash([]);
        ctx.font = '600 15px Quicksand, system-ui, sans-serif'; ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(230,240,255,' + (0.85 * night) + ')'; ctx.fillText(f.name, c[0], c[1]);
        ctx.setLineDash([6, 5]);
      }
    });
    ctx.restore();
  };
})();
