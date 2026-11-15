/* Generate Clouds — where the sun is, and what the air does to its light.
   GC.Sun.pos(utcMs, lat, lon) gives elevation and azimuth in degrees.
   GC.Atmo repeats the shader's air model on the CPU, to get the colour of
   sunlight at each cloud height and the average sky light (for exposure). */
(function () {
  'use strict';
  var GC = window.GC = window.GC || {};
  var rad = GC.rad, deg = GC.deg;

  var Sun = GC.Sun = {};
  Sun.pos = function (ms, lat, lon) {
    var d = ms / 86400000 + 2440587.5 - 2451545.0;
    var g = rad(357.529 + 0.98560028 * d);
    var q = 280.459 + 0.98564736 * d;
    var L = rad(q + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g));
    var e = rad(23.439 - 0.00000036 * d);
    var ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L));
    var dec = Math.asin(Math.sin(e) * Math.sin(L));
    var gmst = (18.697374558 + 24.06570982441908 * d) % 24;
    var ha = rad(gmst * 15 + lon) - ra;
    var la = rad(lat);
    var el = Math.asin(Math.sin(la) * Math.sin(dec) + Math.cos(la) * Math.cos(dec) * Math.cos(ha));
    var az = Math.atan2(-Math.sin(ha), Math.tan(dec) * Math.cos(la) - Math.sin(la) * Math.cos(ha));
    return { el: deg(el), az: (deg(az) + 360) % 360 };
  };
  // World axes: +X east, +Y up, -Z north.
  Sun.dir = function (p) {
    var el = rad(p.el), az = rad(p.az);
    return [Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)];
  };
  // Find a moment in the 24 hours after dayStartMs. kind: sunrise, noon, golden, sunset, dusk.
  Sun.find = function (kind, dayStartMs, lat, lon) {
    var step = 5 * 60000, best = null, bestEl = -99, prev = Sun.pos(dayStartMs, lat, lon).el;
    var target = { sunrise: 1, golden: 6, sunset: 0.5, dusk: -4 }[kind];
    for (var t = dayStartMs + step; t <= dayStartMs + 86400000; t += step) {
      var el = Sun.pos(t, lat, lon).el;
      if (kind === 'noon') { if (el > bestEl) { bestEl = el; best = t; } }
      else if (kind === 'sunrise') { if (prev < target && el >= target && best == null) best = t; }
      else if (prev > target && el <= target) best = t;      // last descending crossing = evening
      prev = el;
    }
    return best;
  };
  Sun.phase = function (el) {
    if (el > 10) return 'Day';
    if (el > 0) return 'Golden hour';
    if (el > -6) return 'Civil twilight (dusk or dawn)';
    if (el > -12) return 'Nautical twilight';
    if (el > -18) return 'Astronomical twilight';
    return 'Night';
  };

  // ---------- air model (same numbers as the shader) ----------
  var RE = 6371, RA = 6471, BR = [5.802e-3, 13.558e-3, 33.1e-3], BO = [0.650e-3, 1.881e-3, 0.085e-3], BM = 3.996e-3;
  var Atmo = GC.Atmo = { SUN_I: 22 };
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function sph(ro, rd, r) { var b = dot(ro, rd), c = dot(ro, ro) - r * r, h = b * b - c; if (h < 0) return null; h = Math.sqrt(h); return [-b - h, -b + h]; }
  function dens(h) { h = Math.max(h, 0); return [Math.exp(-h / 8), Math.exp(-h / 1.2), Math.max(0, 1 - Math.abs(h - 25) / 15)]; }
  function trans(od, haze) {
    var m = BM * haze * 1.15;
    return [0, 1, 2].map(function (i) { return Math.exp(-(BR[i] * od[0] + m * od[1] + BO[i] * od[2])); });
  }
  function shadow(p, s) {
    var b = dot(p, s); if (b > 0) return 1;
    var d = Math.sqrt(Math.max(dot(p, p) - b * b, 0));
    var x = GC.clamp((d - (RE - 3)) / 12, 0, 1); return x * x * (3 - 2 * x);
  }
  function sunOD(p, s, n) {
    var ta = sph(p, s, RA); if (!ta) return [0, 0, 0];
    var dt = ta[1] / n, od = [0, 0, 0];
    for (var i = 0; i < n; i++) {
      var t = (i + 0.5) * dt, q = [p[0] + s[0] * t, p[1] + s[1] * t, p[2] + s[2] * t];
      var d = dens(Math.sqrt(dot(q, q)) - RE); od[0] += d[0] * dt; od[1] += d[1] * dt; od[2] += d[2] * dt;
    }
    return od;
  }
  // Strength of the second-order (already scattered once) light, from the sun's height.
  Atmo.ms = function (s) { var el = deg(Math.asin(GC.clamp(s[1], -1, 1))), x = GC.clamp((el + 16) / 19, 0, 1); return 0.28 * Math.pow(x, 7); };
  // Colour of direct sunlight at a height (km), relative to the sun above the air.
  Atmo.sunAt = function (altKm, s, haze) {
    var p = [0, RE + altKm, 0], T = trans(sunOD(p, s, 24), haze), sh = shadow(p, s);
    return [T[0] * sh * Atmo.SUN_I, T[1] * sh * Atmo.SUN_I, T[2] * sh * Atmo.SUN_I];
  };
  // Sky light arriving from one direction, seen from a height (km).
  Atmo.sky = function (altKm, rd, s, haze, tint) {
    var ro = [0, RE + Math.max(altKm, 0.002), 0], ta = sph(ro, rd, RA), tg = sph(ro, rd, RE);
    if (!ta) return [0, 0, 0];
    var t0 = Math.max(ta[0], 0), t1 = ta[1]; if (tg && tg[0] > 0) t1 = Math.min(t1, tg[0]);
    if (t1 <= t0) return [0, 0, 0];
    var mu = dot(rd, s), pR = 3 / (16 * Math.PI) * (1 + mu * mu), g = 0.76;
    var pM = 3 / (8 * Math.PI) * ((1 - g * g) * (1 + mu * mu)) / ((2 + g * g) * Math.pow(1 + g * g - 2 * g * mu, 1.5));
    var od = [0, 0, 0], sR = [0, 0, 0], sM = [0, 0, 0], sS = [0, 0, 0], prev = 0, N = 16, ms = Atmo.ms(s), MSC = [0.55, 0.8, 1.0];
    for (var i = 0; i < N; i++) {
      var f = (i + 1) / N, tn = f * f * (t1 - t0), dt = tn - prev, tm = t0 + prev + dt * 0.5; prev = tn;
      var p = [ro[0] + rd[0] * tm, ro[1] + rd[1] * tm, ro[2] + rd[2] * tm];
      var d = dens(Math.sqrt(dot(p, p)) - RE), so = sunOD(p, s, 6);
      var T = trans([od[0] + 0.5 * d[0] * dt + so[0], od[1] + 0.5 * d[1] * dt + so[1], od[2] + 0.5 * d[2] * dt + so[2]], haze), sh = shadow(p, s);
      var Tv = trans([od[0] + 0.5 * d[0] * dt, od[1] + 0.5 * d[1] * dt, od[2] + 0.5 * d[2] * dt], haze);
      for (var k = 0; k < 3; k++) { sR[k] += T[k] * d[0] * dt * sh; sM[k] += T[k] * d[1] * dt * sh; sS[k] += Tv[k] * d[0] * dt; }
      od[0] += d[0] * dt; od[1] += d[1] * dt; od[2] += d[2] * dt;
    }
    return [0, 1, 2].map(function (k) { return Atmo.SUN_I * (sR[k] * BR[k] * pR + sM[k] * BM * haze * pM * tint[k] + sS[k] * BR[k] * MSC[k] * ms / (4 * Math.PI)); });
  };
  // Average light from the upper sky (for cloud ambient and for exposure).
  Atmo.ambient = function (altKm, s, haze, tint) {
    var dirs = [[0, 1, 0]], sum = [0, 0, 0];
    [35, 12].forEach(function (elDeg) {
      for (var a = 0; a < 6; a++) {
        var az = a * Math.PI / 3 + elDeg, el = rad(elDeg);
        dirs.push([Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)]);
      }
    });
    dirs.forEach(function (d) { var c = Atmo.sky(altKm, d, s, haze, tint); sum[0] += c[0]; sum[1] += c[1]; sum[2] += c[2]; });
    return sum.map(function (v) { return v / dirs.length; });
  };
})();
