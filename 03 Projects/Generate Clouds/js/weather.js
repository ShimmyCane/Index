/* Generate Clouds — weather data.
   Three tiers: live Open-Meteo → the copy saved on this device → a bundled sample sky.
   Open-Meteo needs no key. Only a latitude, a longitude and a date are sent. */
(function () {
  'use strict';
  var GC = window.GC = window.GC || {};
  var W = GC.Weather = {};

  var HOSTS = {
    forecast: 'https://api.open-meteo.com/v1/forecast',
    archive: 'https://archive-api.open-meteo.com/v1/archive',
    air: 'https://air-quality-api.open-meteo.com/v1/air-quality',
    geo: 'https://geocoding-api.open-meteo.com/v1/search',
    marine: 'https://marine-api.open-meteo.com/v1/marine'
  };
  var CORE = ['temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'precipitation', 'weather_code', 'cloud_cover',
    'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m'];
  var EXTRA = ['cape', 'freezing_level_height', 'visibility', 'wind_speed_850hPa', 'wind_direction_850hPa',
    'wind_speed_500hPa', 'wind_direction_500hPa', 'wind_speed_300hPa', 'wind_direction_300hPa'];
  var ARCH = ['wind_speed_100m', 'wind_direction_100m'];
  var AIR = ['pm2_5', 'pm10', 'aerosol_optical_depth', 'dust'];
  var CACHE_KEY = 'gc.wx.cache', CACHE_MAX = 10;

  W.status = { source: 'none', note: '' };
  W.REGION = { N: 5, STEP: 100 };          // cloud grid near the place: 5 x 5, 100 km apart (500 km across)
  W.REGION_WIDE = { N: 9, STEP: 250 };     // wide grid: 9 x 9, 250 km apart (2000 km across)

  function fetchJson(url, ms) {
    var ctl = ('AbortController' in window) ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, ms || 15000);
    return fetch(url, ctl ? { signal: ctl.signal } : {}).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok || j.error) {
          // 429: Open-Meteo counts requests per network address per day.
          var e = new Error(r.status === 429 ? 'The weather service has reached its daily limit for this network. Try again tomorrow, or from another connection' : 'HTTP ' + r.status + (j.reason ? ' ' + j.reason : ''));
          e.status = r.status; throw e;
        }
        return j;
      });
    }).finally(function () { clearTimeout(timer); });
  }

  function placeKey(p) { return p.lat.toFixed(2) + ',' + p.lon.toFixed(2); }
  function dayStr(ms) { var d = new Date(ms); return d.getUTCFullYear() + '-' + GC.pad(d.getUTCMonth() + 1) + '-' + GC.pad(d.getUTCDate()); }
  // A local wall-clock string 'YYYY-MM-DDTHH:MM' handled as if it were UTC.
  W.localToMs = function (s) { return Date.parse(s.slice(0, 16) + ':00Z'); };
  W.msToLocal = function (ms) { var d = new Date(ms); return dayStr(ms) + 'T' + GC.pad(d.getUTCHours()) + ':' + GC.pad(d.getUTCMinutes()); };
  W.guessOffset = function (lon) { return Math.round(lon / 15) * 3600; };

  function readCache() { var c = GC.store.get(CACHE_KEY, []); return Array.isArray(c) ? c : []; }
  function writeCache(rec) {
    var c = readCache().filter(function (r) { return !(r.place === rec.place && r.times[0] === rec.times[0]); });
    c.unshift(rec);
    while (c.length > CACHE_MAX) c.pop();
    if (!GC.store.set(CACHE_KEY, c)) GC.store.set(CACHE_KEY, [rec]);
  }
  function findCached(place, local) {
    var key = placeKey(place), c = readCache();
    for (var i = 0; i < c.length; i++) {
      if (c[i].place !== key) continue;
      var want = local || W.msToLocal(Date.now() + c[i].offset * 1000);
      if (c[i].times.indexOf(want.slice(0, 13) + ':00') >= 0) return { rec: c[i], local: want };
    }
    return null;
  }

  function buildUrl(host, place, vars, local) {
    var u = host + '?latitude=' + place.lat.toFixed(4) + '&longitude=' + place.lon.toFixed(4) +
      '&hourly=' + vars.join(',') + '&timezone=auto';
    if (host !== HOSTS.air) u += '&wind_speed_unit=ms';
    if (local) {
      var d0 = local.slice(0, 10), d1 = dayStr(W.localToMs(local) + 86400000);
      u += '&start_date=' + d0 + '&end_date=' + d1;
    } else u += '&past_days=1&forecast_days=2';
    return u;
  }

  function fetchRecord(place, local) {
    var ageDays = local ? (Date.now() - W.localToMs(local)) / 86400000 : 0;
    if (ageDays < -15) return Promise.reject(new Error('Forecasts reach about 15 days ahead. Pick an earlier date.'));
    var useArchive = ageDays > 85;
    var host = useArchive ? HOSTS.archive : HOSTS.forecast;
    var full = CORE.concat(useArchive ? ARCH : EXTRA);
    var main = fetchJson(buildUrl(host, place, full, local)).catch(function (e) {
      if (e.status !== 400) throw e;
      GC.logError('Weather: full request refused (' + e.message + '), trying the short list.');
      return fetchJson(buildUrl(host, place, CORE, local));
    });
    var air = fetchJson(buildUrl(HOSTS.air, place, AIR, local), 7000).catch(function () { return null; });
    return Promise.all([main, air]).then(function (res) {
      var j = res[0], a = res[1];
      if (!j.hourly || !j.hourly.time) throw new Error('Weather reply had no hourly data');
      var rec = { place: placeKey(place), offset: j.utc_offset_seconds || 0, times: j.hourly.time, h: {}, fetchedAt: Date.now(), archive: useArchive };
      Object.keys(j.hourly).forEach(function (k) { if (k !== 'time') rec.h[k] = j.hourly[k]; });
      if (a && a.hourly && a.hourly.time) {
        AIR.forEach(function (k) {
          if (!a.hourly[k]) return;
          rec.h[k] = rec.times.map(function (t) { var i = a.hourly.time.indexOf(t); return i < 0 ? null : a.hourly[k][i]; });
        });
      }
      writeCache(rec);
      return rec;
    });
  }

  // Turn one hour of a record into the numbers the sky model reads.
  function pick(rec, local) {
    var i = rec.times.indexOf(local.slice(0, 13) + ':00');
    if (i < 0) return null;
    var frac = (+local.slice(14, 16) || 0) / 60, j = Math.min(i + 1, rec.times.length - 1);
    function raw(k, idx) { var a = rec.h[k]; return (a && a[idx] != null) ? a[idx] : null; }
    function v(k, dflt) { var a = raw(k, i), b = raw(k, j); if (a == null) return dflt; return b == null ? a : GC.lerp(a, b, frac); }
    function wind(sk, dk) { var s = v(sk, null), d = raw(dk, i); return (s == null || d == null) ? null : { s: s, d: d }; }
    var frz = v('freezing_level_height', null), vis = v('visibility', null);
    return {
      t: v('temperature_2m', 15), td: v('dew_point_2m', null), rh: v('relative_humidity_2m', 60),
      precip: v('precipitation', 0), code: raw('weather_code', i) || 0,
      cover: v('cloud_cover', 0) / 100, low: v('cloud_cover_low', 0) / 100, mid: v('cloud_cover_mid', 0) / 100, high: v('cloud_cover_high', 0) / 100,
      wind: wind('wind_speed_10m', 'wind_direction_10m') || { s: 3, d: 270 }, gust: v('wind_gusts_10m', null),
      cape: v('cape', null), frz: frz == null ? null : frz / 1000, vis: vis == null ? null : vis / 1000,
      w850: wind('wind_speed_850hPa', 'wind_direction_850hPa'), w500: wind('wind_speed_500hPa', 'wind_direction_500hPa'),
      w300: wind('wind_speed_300hPa', 'wind_direction_300hPa'), w100: wind('wind_speed_100m', 'wind_direction_100m'),
      pm25: v('pm2_5', null), pm10: v('pm10', null), aod: v('aerosol_optical_depth', null), dust: v('dust', null),
      next: { low: (raw('cloud_cover_low', j) || 0) / 100, mid: (raw('cloud_cover_mid', j) || 0) / 100, high: (raw('cloud_cover_high', j) || 0) / 100 }
    };
  }

  // ---------- the 24-hour timeline: forecast hours, the sea, the cloud grids, from a start hour ----------
  var HOURS = 24;
  function hourKey(ms) { return new Date(ms).toISOString().slice(0, 13) + ':00'; }          // GMT, as the marine and grid calls return it
  function utcDay(ms) { return dayStr(ms); }
  function startLocalOf(when, off) {
    if (when && when.local) return when.local.slice(0, 13) + ':00';
    return W.msToLocal(Math.floor(Date.now() / 3600000) * 3600000 + off * 1000).slice(0, 13) + ':00';
  }
  // Build the hours from one forecast record. Returns null when the record does not hold the whole 24 hours.
  function hoursFrom(rec, startLocal, source, note) {
    var base = W.localToMs(startLocal), hours = [];
    for (var k = 0; k < HOURS; k++) {
      var L = W.msToLocal(base + k * 3600000), wx = pick(rec, L);
      if (!wx) return null;
      hours.push({ localStr: L, utcMs: base - rec.offset * 1000 + k * 3600000, wx: wx });
    }
    return { source: source, note: note || '', archive: !!rec.archive, offsetSec: rec.offset, startLocal: startLocal, startMs: base - rec.offset * 1000, hours: hours };
  }
  // Sea (waves and tide) for every hour: two calls, so a refusal of tide never costs the waves.
  W.marineSeries = function (place, startMs) {
    var none = []; for (var k = 0; k < HOURS; k++) none.push(null);
    var ageDays = (Date.now() - startMs) / 86400000;
    if (ageDays < -7 || ageDays > 85) return Promise.resolve(none);
    var q = '?latitude=' + place.lat.toFixed(3) + '&longitude=' + place.lon.toFixed(3) + '&timezone=GMT&start_date=' + utcDay(startMs) + '&end_date=' + utcDay(startMs + 25 * 3600000) + '&hourly=';
    function idx(j, name, key) { var k = j && j.hourly && j.hourly.time ? j.hourly.time.indexOf(key) : -1; return (k < 0 || !j.hourly[name]) ? null : (j.hourly[name][k] == null ? null : j.hourly[name][k]); }
    var waves = fetchJson(HOSTS.marine + q + 'wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period,wind_wave_height,wind_wave_direction,wind_wave_period,ocean_current_velocity,ocean_current_direction', 12000).catch(function (e) {
      GC.logError('Sea data: ' + ((e && e.name === 'AbortError') ? 'no answer in time' : (e && e.message) || 'no connection')); return null; });
    var tide = fetchJson(HOSTS.marine + q + 'sea_level_height_msl', 12000).catch(function () { return null; });
    return Promise.all([waves, tide]).then(function (r) {
      var w = r[0], t = r[1], out = [];
      for (var i = 0; i < HOURS; i++) {
        var key = hourKey(startMs + i * 3600000);
        if (!w || idx(w, 'wave_height', key) === null) { out.push(null); continue; }
        out.push({ wave: idx(w, 'wave_height', key), dir: idx(w, 'wave_direction', key), period: idx(w, 'wave_period', key),
          swell: { h: idx(w, 'swell_wave_height', key), dir: idx(w, 'swell_wave_direction', key), period: idx(w, 'swell_wave_period', key) },
          windwave: { h: idx(w, 'wind_wave_height', key), dir: idx(w, 'wind_wave_direction', key), period: idx(w, 'wind_wave_period', key) },
          current: { v: idx(w, 'ocean_current_velocity', key), dir: idx(w, 'ocean_current_direction', key) },
          tide: t ? idx(t, 'sea_level_height_msl', key) : null });
      }
      return out;
    });
  };
  // Cloud cover on a grid (5 x 5 near the place, 9 x 9 wide) for every hour: one call. Returns cells[hour][point] = [low, mid, high].
  W.gridSeries = function (place, startMs, spec) {
    spec = spec || W.REGION;
    var n = spec.N, half = (n - 1) / 2, kx = Math.max(111.2 * Math.cos(GC.rad(place.lat)), 5), lats = [], lons = [];
    var ageDays = (Date.now() - startMs) / 86400000;
    if (ageDays < -15) return Promise.resolve(null);
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) {
      lats.push(GC.clamp(place.lat - (r - half) * spec.STEP / 111.2, -89, 89).toFixed(3));
      lons.push((((place.lon + (c - half) * spec.STEP / kx + 540) % 360) - 180).toFixed(3));
    }
    var url = (ageDays > 85 ? HOSTS.archive : HOSTS.forecast) + '?latitude=' + lats.join(',') + '&longitude=' + lons.join(',') +
      '&hourly=cloud_cover_low,cloud_cover_mid,cloud_cover_high&timezone=GMT&start_date=' + utcDay(startMs) + '&end_date=' + utcDay(startMs + 25 * 3600000);
    return fetchJson(url, 14000).then(function (j) {
      var list = Array.isArray(j) ? j : [j];
      if (list.length !== n * n) throw new Error('Expected ' + (n * n) + ' places, got ' + list.length);
      var cells = [];
      for (var h = 0; h < HOURS; h++) {
        var key = hourKey(startMs + h * 3600000);
        cells.push(list.map(function (x) {
          var k = x.hourly && x.hourly.time ? x.hourly.time.indexOf(key) : -1;
          function v(name) { var a = x.hourly[name]; return (k < 0 || !a || a[k] == null) ? 0 : a[k] / 100; }
          return k < 0 ? [0, 0, 0] : [v('cloud_cover_low'), v('cloud_cover_mid'), v('cloud_cover_high')];
        }));
      }
      return cells;
    }).catch(function (e) { GC.logError('Regional cover: ' + ((e && e.name === 'AbortError') ? 'no answer in time' : (e && e.message) || 'no connection')); return null; });
  };
  // A sample sky for 24 hours, used when the service cannot be reached.
  function sampleTimeline(place, startLocal, why) {
    var off = W.guessOffset(place.lon), base = W.localToMs(startLocal) - off * 1000, hours = [];
    for (var k = 0; k < HOURS; k++) hours.push({ localStr: W.msToLocal(base + off * 1000 + k * 3600000), utcMs: base + k * 3600000, wx: JSON.parse(JSON.stringify(GC.SAMPLE_WX)) });
    W.status = { source: 'sample', note: why + '. Showing a sample sky, not this place.' };
    return { source: 'sample', note: W.status.note, archive: false, offsetSec: off, startLocal: startLocal, startMs: base, hours: hours, series: null };
  }
  // Attach the sea and the cloud grids to a timeline (each one optional).
  function attachSeries(tl, place) {
    return Promise.all([W.marineSeries(place, tl.startMs), W.gridSeries(place, tl.startMs, W.REGION)]).then(function (r) {
      tl.hours.forEach(function (h, k) { h.wx.marine = r[0][k]; });
      tl.series = { region: r[1] };
      return tl;
    });
  }
  // place {lat, lon}; when {now:true} or {local:'YYYY-MM-DDTHH:MM'}. Resolves to a 24-hour timeline.
  W.timeline = function (place, when) {
    var local = when && when.local ? when.local.slice(0, 16) : null, off = local ? W.guessOffset(place.lon) : 0;
    var startLocal = startLocalOf(when, off);
    return fetchRecord(place, local ? startLocal : null).then(function (rec) {
      var tl = hoursFrom(rec, startLocal, 'live', '');
      if (!tl) throw new Error('The weather reply does not hold the next 24 hours');
      return attachSeries(tl, place);
    }).catch(function (err) {
      var why = (err && err.name === 'AbortError') ? 'The weather service did not answer in time' : (err && err.message) || 'No connection';
      var hit = findCached(place, local);
      if (hit) {
        var tl2 = hoursFrom(hit.rec, startLocal, 'cache', why + '. Showing the copy saved on this device.');
        if (tl2) return attachSeries(tl2, place).then(function (t) { W.status = { source: 'cache', note: t.note }; return t; }, function () { return tl2; });
      }
      return sampleTimeline(place, startLocal, why);
    });
  };

  // Turn an atlas sample into a 24-hour timeline (the same weather, the sun moving).
  W.sampleTimeline = function (wx, startMs, off) {
    var hours = [];
    for (var k = 0; k < HOURS; k++) hours.push({ localStr: W.msToLocal(startMs + off * 1000 + k * 3600000), utcMs: startMs + k * 3600000, wx: JSON.parse(JSON.stringify(wx)) });
    return { source: 'sample', note: '', archive: false, offsetSec: off, startLocal: hours[0].localStr, startMs: startMs, hours: hours, series: null };
  };

  W.search = function (name) {
    return fetchJson(HOSTS.geo + '?count=6&language=en&format=json&name=' + encodeURIComponent(name), 8000).then(function (j) {
      return (j.results || []).map(function (r) {
        return { name: r.name, region: [r.admin1, r.country].filter(Boolean).join(', '), lat: r.latitude, lon: r.longitude };
      });
    });
  };

  // ---------- the ground: heights for a grid of points (metres; 0 means sea) ----------
  W.elevations = function (pts) {
    var calls = [];
    for (var i = 0; i < pts.length; i += 100) {
      var part = pts.slice(i, i + 100);
      calls.push(fetchJson('https://api.open-meteo.com/v1/elevation?latitude=' + part.map(function (p) { return p.lat.toFixed(4); }).join(',') +
        '&longitude=' + part.map(function (p) { return p.lon.toFixed(4); }).join(','), 15000));
    }
    return Promise.all(calls).then(function (res) {
      var out = [];
      res.forEach(function (j) { if (!j.elevation) throw new Error('Elevation reply had no heights'); out = out.concat(j.elevation); });
      if (out.length !== pts.length) throw new Error('Expected ' + pts.length + ' heights, got ' + out.length);
      return out.map(function (m) { return (m == null || isNaN(m)) ? 0 : Math.round(m); });
    });
  };

  // ---------- skies right now: one call for the current weather of many cities ----------
  var NOW_KEY = 'gc.now';
  var GROUPS = [
    ['storm', '⛈️', 'Thunderstorm'], ['rain', '🌧️', 'Rain'], ['snow', '❄️', 'Snow'], ['fog', '🌫️', 'Fog'], ['overcast', '☁️', 'Overcast'],
    ['broken', '⛅', 'Broken cloud'], ['wisps', '🪶', 'High wisps'], ['clear', '☀️', 'Clear'], ['golden', '🌇', 'Sunrise or sunset now']
  ];
  function classify(c) {
    var code = c.weather_code || 0, cover = c.cloud_cover || 0, pr = c.precipitation || 0, day = c.is_day ? 20 : 0;
    if (code >= 95) return ['storm', 100 + pr];
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return ['snow', 10 + pr];
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return ['rain', pr + (code >= 80 ? 1 : 0)];
    if (code === 45 || code === 48) return ['fog', 1];
    if (cover >= 88) return ['overcast', cover + day];
    if ((c.cloud_cover_high || 0) >= 50 && (c.cloud_cover_low || 0) < 25 && (c.cloud_cover_mid || 0) < 40) return ['wisps', c.cloud_cover_high + day];
    if (cover >= 30) return ['broken', 60 - Math.abs(cover - 55) + day];
    return ['clear', 100 - cover + day];
  }
  function group(cities, rows, when) {
    var out = GROUPS.map(function (g) { return { id: g[0], icon: g[1], name: g[2], cities: [] }; }), by = {};
    out.forEach(function (g) { by[g.id] = g; });
    cities.forEach(function (city, i) {
      var el = GC.Sun.pos(when, city.lat, city.lon).el;
      if (el > -6 && el < 7) by.golden.cities.push({ place: city, score: -Math.abs(el), info: 'sun ' + Math.round(el) + '°' });
      var c = rows && rows[i]; if (!c) return;
      var k = classify(c), info = k[0] === 'rain' || k[0] === 'snow' || k[0] === 'storm' ? (c.precipitation || 0).toFixed(1) + ' mm' : Math.round(c.cloud_cover || 0) + '% cloud';
      by[k[0]].cities.push({ place: city, score: k[1], info: info });
    });
    out.forEach(function (g) { g.cities.sort(function (a, b) { return b.score - a.score; }); g.cities = g.cities.slice(0, 3); });
    return out;
  }
  // Returns { groups, source: 'live' | 'cache' | 'none', count }. Without data only the sun group is filled (it needs no network).
  W.conditions = function (force) {
    var cities = GC.CITIES, saved = GC.store.get(NOW_KEY, null);
    if (!force && saved && saved.rows && saved.rows.length === cities.length && Date.now() - saved.at < 30 * 60000)
      return Promise.resolve({ groups: group(cities, saved.rows, Date.now()), source: 'live', count: cities.length, at: saved.at });
    var url = HOSTS.forecast + '?latitude=' + cities.map(function (c) { return c.lat; }).join(',') + '&longitude=' + cities.map(function (c) { return c.lon; }).join(',') +
      '&current=weather_code,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,precipitation,is_day';
    return fetchJson(url, 12000).then(function (j) {
      var list = Array.isArray(j) ? j : [j];
      if (list.length !== cities.length) throw new Error('Expected ' + cities.length + ' cities, got ' + list.length);
      var rows = list.map(function (x) { return x.current || null; });
      GC.store.set(NOW_KEY, { at: Date.now(), rows: rows });
      return { groups: group(cities, rows, Date.now()), source: 'live', count: cities.length, at: Date.now() };
    }).catch(function (e) {
      GC.logError('Skies right now: ' + ((e && e.name === 'AbortError') ? 'no answer in time' : (e && e.message) || 'no connection'));
      if (saved && saved.rows && saved.rows.length === cities.length) return { groups: group(cities, saved.rows, Date.now()), source: 'cache', count: cities.length, at: saved.at };
      return { groups: group(cities, null, Date.now()), source: 'none', count: cities.length, at: 0 };
    });
  };

  W.check = function () {
    var q = '?latitude=0&longitude=0';
    var tests = [
      ['Weather forecast', HOSTS.forecast + q + '&hourly=cloud_cover&forecast_days=1'],
      ['Air quality', HOSTS.air + q + '&hourly=pm2_5&forecast_days=1'],
      ['Place search', HOSTS.geo + '?name=Paris&count=1'],
      ['Ground heights', 'https://api.open-meteo.com/v1/elevation?latitude=0&longitude=0'],
      ['Sea waves and tide', HOSTS.marine + '?latitude=0&longitude=-30&hourly=wave_height&forecast_days=1']
    ];
    return Promise.all(tests.map(function (t) {
      return fetchJson(t[1], 7000).then(function () { return { name: t[0], ok: true, msg: 'reachable' }; },
        function (e) { return { name: t[0], ok: false, msg: (e && e.name === 'AbortError') ? 'no answer' : (e && e.message) || 'failed' }; });
    })).then(function (list) {
      list.push({ name: 'Saved on this device', ok: true, msg: readCache().length + ' day(s) of weather' });
      return list;
    });
  };
  // ---------- the whole Earth's cloud cover from a satellite picture (NASA GIBS, public domain, one picture a day) ----------
  // The picture is true colour from the Terra satellite (about 10:30 local time), 720 x 360, north at the top.
  // Bright, colourless pixels count as cloud: the result is a grey picture, white = full cover.
  W.SAT_URL = 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=MODIS_Terra_CorrectedReflectance_TrueColor&STYLES=&CRS=EPSG:4326&BBOX=-90,-180,90,180&WIDTH=720&HEIGHT=360&FORMAT=image/jpeg&TIME=';
  W.satellite = function (day) {
    return new Promise(function (resolve, reject) {
      var im = new Image(); im.crossOrigin = 'anonymous';
      var t = setTimeout(function () { im.src = ''; reject(new Error('the satellite picture did not answer in time')); }, 20000);
      im.onload = function () { clearTimeout(t); try { resolve(cloudMask(im)); } catch (e) { reject(new Error('the satellite picture could not be read')); } };
      im.onerror = function () { clearTimeout(t); reject(new Error('the satellite picture could not be loaded')); };
      im.src = W.SAT_URL + day;
    });
  };
  function cloudMask(im) {
    var w = 720, h = 360, c = document.createElement('canvas'); c.width = w; c.height = h;
    var g = c.getContext('2d'); g.drawImage(im, 0, 0, w, h);
    var px = g.getImageData(0, 0, w, h).data, out = document.createElement('canvas'); out.width = w; out.height = h;
    var o = out.getContext('2d'), od = o.createImageData(w, h);
    for (var i = 0; i < w * h; i++) {
      var r = px[i * 4], gg = px[i * 4 + 1], b = px[i * 4 + 2], mn = Math.min(r, gg, b), mx = Math.max(r, gg, b);
      var bright = GC.clamp((mn - 150) / 80, 0, 1), plain = 1 - GC.clamp((mx - mn - 20) / 50, 0, 1);
      var v = Math.round(255 * bright * bright * (3 - 2 * bright) * plain);
      od.data[i * 4] = v; od.data[i * 4 + 1] = v; od.data[i * 4 + 2] = v; od.data[i * 4 + 3] = 255;
    }
    o.putImageData(od, 0, 0);
    return out;
  }

  W.cacheCount = function () { return readCache().length; };
})();
