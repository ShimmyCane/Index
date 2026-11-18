/* Generate Clouds — the page: place and time, panels, the 24-hour time lapse or the waves clip, camera
   (pan, walk, look, orbit), saving pictures, ⚙️. */
(function () {
  'use strict';
  var GC = window.GC, $ = GC.$, R = GC.Renderer, W = GC.Weather;
  var DAY = 86400;                                  // the time lapse covers 24 hours of sky
  var S = {
    place: GC.PLACES[0], when: { now: true }, data: null, preset: null, ov: {}, model: null, frame: null,
    simT: 0, playing: false, autoLeft: 0, loops: 0, dirty: true, flash: 0, loading: false, clock: 0, spot: null, pendingCam: null,
    thunder: null, wideKey: '', nav: 'look', zone: '', regKey: '', starKey: '', satDone: false, satBusy: false, satRetry: 0, moveTimer: 0, pick: null
  };
  GC.state = S;

  // ---------- small UI helpers ----------
  function setPill(src, text) { var p = $('statusPill'); p.dataset.src = src; p.textContent = text; }
  function placeLabel() { return S.place.name + (S.place.region ? ', ' + S.place.region : ''); }
  function fmtDur(sec) { sec = Math.max(0, Math.round(sec)); return Math.floor(sec / 60) + ':' + GC.pad(sec % 60); }
  function localAt(simT) { return S.data ? W.msToLocal(S.data.utcMs + S.data.offsetSec * 1000 + simT * 1000) : ''; }
  function fileStem() { return 'clouds_' + S.place.name.replace(/[^A-Za-z0-9]+/g, '-').toLowerCase() + '_' + localAt(S.simT).replace(/[:T]/g, '-'); }

  // ---------- playback: how much sky the time lapse covers, and how long one run takes ----------
  // The sky span is what the time lapse shows (15 s to 24 h); the playback is how long one run takes in real
  // time (15 s to 5 min). Speed = sky span / playback: 1 is real time, 0.5 is half time.
  var SPANS = [15, 60, 900, 3600, 7200, 28800, 86400], PLAYS = [15, 60, 120, 180, 240, 300];   // seconds
  var SPAN_LABELS = ['15 s', '1 min', '15 min', '1 h', '2 h', '8 h', '24 h'], PLAY_LABELS = ['15 s', '1 min', '2 min', '3 min', '4 min', '5 min'];
  function spanSec() { return +GC.settings.span || 60; }
  function playSec() { return +GC.settings.play || 60; }
  function rate() { return spanSec() / playSec(); }                         // sky seconds per real second
  function rateText(r) {
    if (Math.abs(r - 1) < 1e-6) return '1× · real time';
    if (r < 1) return (Math.round(r * 100) / 100) + '× · ' + (Math.abs(r - 0.5) < 1e-6 ? 'half time' : (1 / r).toFixed(1) + ' times slower');
    return Math.round(r) + '× · faster than real time';
  }

  // ---------- panels (collapsible, remembered per device) ----------
  function initPanels() {
    var KEY = 'gc.panels', saved = GC.store.get(KEY, {}) || {}, small = window.innerWidth < 700;
    document.querySelectorAll('.panel').forEach(function (sec) {
      var id = sec.dataset.panel, head = sec.querySelector('.panelHead');
      var open = (id in saved) ? saved[id] : (sec.dataset.open !== 'false' && !small);
      function apply(o) { sec.dataset.collapsed = String(!o); head.setAttribute('aria-expanded', String(o)); }
      apply(open);
      head.addEventListener('click', function () { open = sec.dataset.collapsed === 'true'; apply(open); saved[id] = open; GC.store.set(KEY, saved); });
    });
    var on = GC.store.get('gc.panelsOn', !small);
    function show(v) { document.body.dataset.panels = v ? 'on' : 'off'; $('panelsToggle').setAttribute('aria-expanded', String(v)); }
    show(on);
    $('panelsToggle').addEventListener('click', function () { on = document.body.dataset.panels !== 'on'; show(on); GC.store.set('gc.panelsOn', on); });
  }

  // ---------- the model: the 24 hours of sky, from the weather and the overrides by hand ----------
  function rebuild() {
    if (!S.data || !S.data.tl) return;
    S.model = GC.Sky.timeline(S.data.tl, S.place, S.ov);
    var ul = $('reading'); ul.textContent = '';
    S.model.reading.forEach(function (r) {
      var li = document.createElement('li'), b = document.createElement('b');
      b.textContent = r.icon + ' ' + r.head; li.appendChild(b); li.appendChild(document.createTextNode(r.text)); ul.appendChild(li);
    });
    syncAdjust();
    var label = (S.preset ? 'Atlas: ' + S.preset.name + ' · ' : '') + placeLabel() + ' · ' + S.data.localStr.replace('T', ' ');
    GC.Notes.setContext({ item: (S.preset ? S.preset.id + '@' : '') + S.place.lat.toFixed(2) + ',' + S.place.lon.toFixed(2) + '@' + S.data.localStr, label: label });
    S.regKey = ''; S.starKey = ''; S.dirty = true;
  }
  function restart(autoplay) {
    S.simT = 0; S.loops = 0;
    S.autoLeft = (autoplay && +GC.settings.autoplay) ? 2 : 0;
    setPlaying(S.autoLeft > 0);
    S.dirty = true;
  }
  function setPlaying(on) {
    if (on) GC.Audio.unlock();
    S.playing = on; $('play').classList.toggle('playing', on); if (!on) S.autoLeft = 0; S.dirty = true;
  }

  // A loaded timeline (live, saved, sample or atlas) becomes the sky on the page.
  function showData(tl) {
    S.data = { tl: tl, source: tl.source, note: tl.note || '', archive: !!tl.archive, offsetSec: tl.offsetSec, utcMs: tl.startMs, localStr: tl.hours[0].localStr };
    $('when').value = S.data.localStr;
    showSpot();
    $('lat').value = S.place.lat.toFixed(2); $('lon').value = S.place.lon.toFixed(2);
    var src = S.preset ? 'atlas' : tl.source;
    setPill(src, { live: '🛰️ Live data', cache: '💾 Saved copy', sample: '📦 Sample sky', atlas: '🗂️ Atlas sample' }[src] || src);
    $('loadNote').textContent = S.preset ? 'Made-up weather for "' + S.preset.name + '". Press Generate this sky for the real data.' : (tl.note || (tl.archive ? 'From the long-term archive: no pressure-level wind, storm energy or air quality that far back.' : ''));
    $('dataLine').textContent = (S.preset ? 'Atlas sample (made-up weather). ' : { live: 'Live from Open-Meteo: 24 hours from the start time. ', cache: 'Saved copy on this device. ', sample: 'Bundled sample sky. ' }[tl.source]) + (tl.note || '') + (tl.cloudNote ? ' ' + tl.cloudNote : '');
    document.querySelectorAll('#atlas button').forEach(function (b) { b.classList.toggle('on', !!S.preset && b.dataset.id === S.preset.id); });
    R.feature = null;
    if (S.pendingCam && !S.preset) { var c = S.pendingCam; S.pendingCam = null; R.cam.yaw = c.yaw; R.cam.pitch = c.pitch; R.cam.fov = c.fov; R.cam.alt = c.alt; R.cam.x = c.x || 0; R.cam.z = c.z || 0; setAltSlider(R.cam.alt); }
    rebuild(); syncMaker();
  }

  // The cloud grids (near the place, and wide) glide from hour to hour; the picture is redrawn only when it changes.
  function setGlide(set, cellsByHour, h, f) {
    var a = cellsByHour[h], b = cellsByHour[Math.min(h + 1, cellsByHour.length - 1)];
    if (!a) { set(null); return; }
    set(a.map(function (c, i) { var d = (b && b[i]) || c; return [GC.lerp(c[0], d[0], f), GC.lerp(c[1], d[1], f), GC.lerp(c[2], d[2], f)]; }));
  }
  // The wind over the Earth for the hour on screen, gliding between hours (three layers, each its own picture).
  function lerpWind(a, b, f) {
    var out = {};
    ['L', 'M', 'H'].forEach(function (k) {
      var x = a[k], y = (b && b[k]) || x, z = new Float32Array(x.length);
      for (var i = 0; i < x.length; i++) z[i] = GC.lerp(x[i], y[i], f);
      out[k] = z;
    });
    return out;
  }
  function applyRegional(force) {
    var tl = S.data && S.data.tl; if (!tl) return;
    var last = tl.hours.length - 1, h = GC.clamp(Math.floor(S.simT / 3600), 0, last), f = GC.clamp(S.simT / 3600 - h, 0, 1);
    var key = h + ':' + Math.round(f * 20) + ':' + (tl.wide ? 1 : 0) + ':' + (tl.series && tl.series.wind ? 1 : 0) + ':' + (tl.series && tl.series.cloud && tl.series.cloud.hours ? 1 : 0);
    if (key === S.regKey && !force) return;
    S.regKey = key;
    if (tl.series && tl.series.region) setGlide(R.setRegion, tl.series.region, h, f); else if (R.regionOn) R.setRegion(null);
    if (tl.wide) setGlide(R.setRegion2, tl.wide, h, f); else if (R.region2On) R.setRegion2(null);
    if (tl.series && tl.series.cloud && tl.series.cloud.hours) setGlide(R.setCloudGrid, tl.series.cloud.hours, h, f); else if (R.cloudGOn) R.setCloudGrid(null);
    if (tl.series && tl.series.wind && tl.series.wind[h]) R.setWind(lerpWind(tl.series.wind[h], tl.series.wind[Math.min(h + 1, last)], f), S.place);
    else if (R.windOn) R.setWind(null, null);
  }
  // The wide region (2000 km) is fetched only when the camera is high enough to see that far.
  function maybeWide() {
    var tl = S.data && S.data.tl;
    if (!tl || S.preset || tl.source === 'sample' || R.cam.alt < 15 || tl.wideAsked) return;
    tl.wideAsked = true; var place = S.place;
    W.gridSeries(place, tl.startMs, W.REGION_WIDE).then(function (cells) { if (S.place === place && S.data && S.data.tl === tl && cells) { tl.wide = cells; S.regKey = ''; S.dirty = true; } });
  }

  // The night sky: the bright stars for the hour on screen (redrawn at each hour, as the sky turns).
  function applyStars() {
    if (!S.data) return;
    var hour = S.data.utcMs + Math.floor(S.simT / 3600) * 3600000, key = S.place.lat.toFixed(2) + ',' + S.place.lon.toFixed(2) + '@' + Math.floor(hour / 3600000);
    if (key === S.starKey) return;
    S.starKey = key; R.setStars(GC.Stars.setSky(S.place, hour));
  }
  // ---------- the ground and the map colours around the place ----------
  function loadMapColours(place) {
    if (!GC.Terrain.fineSpan) { R.clearOsm(); return; }
    GC.Osm.load(place, GC.Terrain.fineSpan).then(function (data) {
      if (S.place !== place) return;
      if (data) R.setOsm(data, GC.Osm.T); else R.clearOsm();
      S.dirty = true;
    });
  }

  function loadSky() {
    if (S.loading) return;
    S.loading = true; S.preset = null; S.ov = {}; orbitOff(); R.cam.x = 0; R.cam.z = 0;
    setPill('loading', '⏳ Loading');
    GC.store.set('gc.last', { place: S.place, when: S.when });
    return W.timeline(S.place, S.when).then(function (tl) {
      S.loading = false;
      if (tl.source !== 'live' && tl.note) GC.logError('Weather: ' + tl.note);
      showData(tl); restart(true);
      R.place = S.place; S.onGround = false;
      S.groundJob = loadGround().then(function () { loadMapColours(S.place); });
    }, function (e) { S.loading = false; GC.logError('Weather: ' + e.message); setPlaying(false); setPill('sample', '⚠️ Check'); });
  }
  GC.loadSky = loadSky;

  function setPlace(p) {
    var place = { name: p.name || 'Chosen point', region: p.region || '', lat: GC.clamp(+p.lat, -89.9, 89.9), lon: ((+p.lon + 540) % 360) - 180, city: !!p.city };
    S.place = place; R.place = place;
    $('searchResults').textContent = ''; $('mapGo').hidden = true; GC.Map.setPlace(S.place);
    return loadSky();
  }

  // Start the 24 hours at the atlas sample's sun time, with the same made-up weather each hour.
  function usePreset(p) {
    var off = S.data ? S.data.offsetSec : W.guessOffset(S.place.lon);
    var day = (S.data ? S.data.localStr : W.msToLocal(Date.now() + off * 1000)).slice(0, 10);
    var dayStart = W.localToMs(day + 'T00:00') - off * 1000;
    var kind = p.sun === 'day' ? 'noon' : p.sun, ms = GC.Sun.find(kind, dayStart, S.place.lat, S.place.lon) || GC.Sun.find('noon', dayStart, S.place.lat, S.place.lon);
    if (p.sun === 'day') ms -= 2.5 * 3600000;        // mid-morning light shows the shapes better than high noon
    S.preset = p; S.ov = JSON.parse(JSON.stringify(p.ov || {})); R.setRegion(null); R.setRegion2(null); R.regionOn = 0; R.region2On = 0;
    orbitOff(); R.cam.x = 0; R.cam.z = 0;
    R.cam.alt = p.cam.alt; R.cam.pitch = p.cam.pitch; R.cam.fov = 70;
    var sp = GC.Sun.pos(ms, S.place.lat, S.place.lon);
    R.cam.yaw = p.cam.toward === 'sun' ? sp.az : (sp.az + 110) % 360;
    setAltSlider(R.cam.alt);
    showData(W.sampleTimeline(p.wx, ms, off));
    restart(true);
    if (p.cam.orbit) { orbitOn(p.cam.orbit); if (+GC.settings.autoplay) setTurning(true); }
  }
  GC.usePreset = function (id) { var p = GC.PRESETS.filter(function (x) { return x.id === id; })[0]; if (p) usePreset(p); };

  // ---------- the ground and the region around the place ----------
  function showSpot() {
    var sp = S.spot, T = GC.Terrain;
    $('placeNow').textContent = placeLabel();
    $('spotKind').textContent = !sp ? '' : sp.kind + (sp.kind === 'Open water' ? '' : ' · ground ' + Math.round(sp.height * 1000) + ' m') + (T.source === 'made-up' ? ' · made-up land (no ground data)' : '');
    var w = T.source === 'data' ? T.bearing('water', R.cam.x, R.cam.z) : null, h = T.source === 'data' ? T.bearing('high', R.cam.x, R.cam.z) : null;
    $('faceWater').hidden = !w; $('faceHigh').hidden = !h || !sp || sp.kind === 'Open water';
    if (w) $('faceWater').textContent = 'Face the water (' + (w.dist < 1 ? 'here' : Math.round(w.dist) + ' km ' + GC.compass(w.deg)) + ')';
  }
  function loadGround() {
    var place = S.place, key = place.lat.toFixed(2) + ',' + place.lon.toFixed(2);
    if (GC.Terrain.key === key && GC.Terrain.source === 'data') { S.spot = GC.Terrain.classify(); showSpot(); return GC.Terrain.fineTex ? Promise.resolve() : GC.Terrain.loadFine(place).then(function (f) { if (f && S.place === place) { R.setTerrainFine(f); S.spot = f.classify(); showSpot(); S.dirty = true; } }); }
    var stand = S.onGround;                              // a camera standing on the ground follows the ground when it changes
    GC.Terrain.clearFine(); R.setTerrainFine(null);
    GC.Terrain.flat(place); R.setTerrain(GC.Terrain); S.spot = null; showSpot(); if (stand) R.cam.alt = 0;
    return GC.Terrain.load(place).then(function (T) {
      if (S.place !== place) return;
      if (S.onGround) R.cam.alt = 0;
      R.setTerrain(T); S.spot = T.classify(); showSpot(); S.dirty = true;
      return GC.Terrain.loadFine(place);
    }).then(function (f) {
      if (!f || S.place !== place) return;
      R.setTerrainFine(f); S.spot = f.classify(); showSpot(); S.dirty = true;
    });
  }
  // ---------- orbit: circle a point in the clouds ----------
  // The camera sits D km from a centre point, phi degrees above it, on bearing th from it, and looks at it.
  // Look (two fingers) turns the view while it orbits: yawOff and pitchOff.
  var O = { on: false, fx: 0, fz: 0, hF: 2, D: 20, phi: 20, th: 180, turning: false, turned: 0, yawOff: 0, pitchOff: 0 };
  GC.orbit = O;
  function orbitApply() {
    var ph = GC.rad(O.phi), th = GC.rad(O.th), r = O.D * Math.cos(ph);
    R.cam.alt = Math.max(0.01, O.hF + O.D * Math.sin(ph));
    R.cam.x = O.fx + r * Math.sin(th); R.cam.z = O.fz - r * Math.cos(th);
    R.cam.yaw = (O.th + 180 + O.yawOff + 360) % 360; R.cam.pitch = GC.clamp(-O.phi + O.pitchOff, -89, 89);
    setAltSlider(R.cam.alt); S.dirty = true;
  }
  function orbitButtons() {
    $('orbitBtn').classList.toggle('on', O.on); $('orbitBtn').setAttribute('aria-pressed', String(O.on));
    $('turnBtn').hidden = !O.on; $('turnBtn').classList.toggle('on', O.turning); $('turnBtn').setAttribute('aria-pressed', String(O.turning));
    $('turnBtn').textContent = O.turning ? 'Stop' : 'Turn';
  }
  function setTurning(on) { O.turning = on && O.on; O.turned = 0; orbitButtons(); S.dirty = true; }
  function orbitOn(fixed) {
    var m = S.model && S.model.hourAt(S.simT).summary;
    O.hF = fixed ? fixed.hF : m ? m.lowBase + Math.min(m.lowTop - m.lowBase, 3) / 2 : 2;
    if (fixed) { O.fx = fixed.fx; O.fz = fixed.fz; O.D = fixed.D; O.phi = fixed.phi; O.th = (R.cam.yaw + 180) % 360; }
    else {
      var top = m ? Math.min(m.lowTop, m.lowBase + 4) : 3;
      if (R.cam.alt < top + 1) R.cam.alt = top + 4;                       // orbiting is for the air: start above the low cloud
      var up = R.cam.alt - O.hF, r0 = R.cam.pitch < -3 ? up / Math.tan(GC.rad(-R.cam.pitch)) : 2.5 * up;
      r0 = GC.clamp(r0, 6, 220);
      var y = GC.rad(R.cam.yaw);
      O.fx = R.cam.x + r0 * Math.sin(y); O.fz = R.cam.z - r0 * Math.cos(y);
      O.th = (R.cam.yaw + 180) % 360; O.D = Math.hypot(r0, up); O.phi = GC.clamp(GC.deg(Math.atan2(up, r0)), 2, 88);
    }
    O.yawOff = 0; O.pitchOff = 0;
    O.on = true; O.turning = false; orbitApply(); orbitButtons();
  }
  function orbitOff() { O.on = false; O.turning = false; O.yawOff = 0; O.pitchOff = 0; orbitButtons(); }
  // Orbit a point that is already known (a tapped cloud): fx, fz in km from the place, hF its height in km.
  function orbitTo(fx, fz, hF) {
    var dx = fx - R.cam.x, dz = fz - R.cam.z, dh = R.cam.alt - hF, r = Math.hypot(dx, dz);
    O.fx = fx; O.fz = fz; O.hF = hF; O.D = GC.clamp(Math.hypot(r, dh), 0.5, 600);
    O.phi = GC.clamp(GC.deg(Math.atan2(dh, Math.max(r, 1e-6))), 2, 88);
    O.th = (GC.deg(Math.atan2(dx, -dz)) + 360) % 360;
    O.yawOff = 0; O.pitchOff = 0; O.on = true; O.turning = false;
    orbitApply(); orbitButtons(); S.dirty = true;
  }

  // In the clouds: the air between a cloud layer's base and top (with a little margin).
  function inCloudBand() {
    var m = S.model && S.model.hourAt(S.simT).summary; if (!m) return false;
    var a = R.cam.alt, bands = [];
    if (m.low > 0.02) bands.push([m.lowBase - 0.3, m.lowTop + 0.3]);
    if (m.mid > 0.02) bands.push([m.midBase - 0.3, m.midBase + 1.8]);
    if (m.high > 0.02) bands.push([m.highH - 0.5, m.highH + 0.5]);
    return bands.some(function (b) { return a >= b[0] && a <= b[1]; });
  }
  // What one finger does here: orbit in the clouds, walk on the ground, pan across the Earth high up.
  // The mode is chosen with the buttons in the bar: look (the default), walk (on the ground), orbit (a cloud) or pan (high up).
  // Which buttons show depends on the height: ground, air (in the atmosphere) or space.
  function zoneOf() { return S.onGround ? 'ground' : R.cam.alt >= 40 ? 'space' : 'air'; }
  function gestureMode() { return S.nav; }
  function setNav(m) {
    if (m !== 'orbit' && O.on) orbitOff();
    S.nav = m; syncNav(); S.dirty = true;
  }
  // The buttons for the current height: look everywhere; walk on the ground; orbit in the air; pan and clouds in space.
  function syncNav() {
    var z = zoneOf();
    if (z !== S.zone) { S.zone = z; S.nav = z === 'space' ? 'pan' : 'look'; if (S.nav !== 'orbit' && O.on) orbitOff(); }
    document.querySelectorAll('[data-zones]').forEach(function (b) {
      b.hidden = b.dataset.zones.split(' ').indexOf(z) < 0;
      if (b.dataset.nav) { b.classList.toggle('on', b.dataset.nav === S.nav); b.setAttribute('aria-pressed', String(b.dataset.nav === S.nav)); }
    });
    $('orbitBtn').classList.toggle('on', O.on || S.nav === 'orbit');
    $('cloudChip').classList.toggle('on', !!+GC.settings.clouds);
    $('cloudChip').textContent = +GC.settings.clouds ? '☁️ Clouds on' : '☁️ Clouds off';
  }

  // Tap a cloud: the point where the tap's direction meets the cloud layer. Orbit around it and say what it is.
  var TYPE_NAMES = { altocumulus: 'Altocumulus', altostratus: 'Altostratus', cirrus: 'Cirrus', cirrostratus: 'Cirrostratus', cirrocumulus: 'Cirrocumulus' };
  function pickAt(px, py) {
    var m = S.model && S.model.hourAt(S.simT); if (!m) return;
    var s = m.summary, t = m.types, layer = null;
    if (s.low > 0.02) layer = { H: (s.lowBase + s.lowTop) / 2, base: s.lowBase, top: s.lowTop, name: GC.LOW_TYPES[t.low].name };
    else if (s.mid > 0.02) layer = { H: s.midBase + 0.6, base: s.midBase, top: s.midBase + 1.2, name: TYPE_NAMES[t.mid] || 'Mid cloud' };
    else if (s.high > 0.02) layer = { H: s.highH, base: s.highH - 0.2, top: s.highH + 0.2, name: TYPE_NAMES[t.high] || 'High cloud' };
    if (!layer) { S.pick = 'No cloud in the data at this hour. Turn on the clouds, or move to where there is some.'; setPickText(); return; }
    // Where the tap's direction meets the layer; when it misses (the tap is above or below a layer the camera is in),
    // a point 4 km along the direction, held inside the layer.
    var d = R.ray(px, py), k = (layer.H - R.cam.alt) / d[1], H = layer.H;
    if (!(k > 0.05 && k < 400)) {
      k = 4; H = GC.clamp(R.cam.alt + d[1] * k, layer.base, layer.top);
      if (H === layer.base || H === layer.top) H = (layer.base + layer.top) / 2;
    }
    var fx = R.cam.x + d[0] * k, fz = R.cam.z + d[2] * k;
    orbitTo(fx, fz, H);
    layer = Object.assign({}, layer, { H: H });
    S.pick = layer.name + ' · base ' + km(layer.base) + ', top ' + km(layer.top) + ' · ' + km(k) + ' away. Drag to go around it.';
    setPickText();
  }
  function km(x) { return x < 1 ? Math.round(x * 1000) + ' m' : x.toFixed(1) + ' km'; }
  function setPickText() { var el = $('pick'); el.hidden = !S.pick; el.textContent = S.pick || ''; }

  // ---------- walk and pan: drag the world, as in a map ----------
  // Walking on the ground moves the camera across the ground (metres a pixel, scaled by the zoom).
  // High up, the drag moves the view across the Earth; when the drag ends, the new centre becomes the place.
  function moveBy(dx, dy, perPx) {
    var y = GC.rad(R.cam.yaw), fx = Math.sin(y), fz = -Math.cos(y), rx = Math.cos(y), rz = Math.sin(y);
    R.cam.x += (fx * dy - rx * dx) * perPx; R.cam.z += (fz * dy - rz * dx) * perPx;
  }
  function walkBy(dx, dy) { moveBy(dx, dy, 0.003 * (R.cam.fov / 70)); }
  function panBy(dx, dy) {
    var h = Math.max(document.getElementById('sky').clientHeight, 1);
    moveBy(dx, dy, Math.max(R.cam.alt, 0.3) * 2 * Math.tan(GC.rad(R.cam.fov) / 2) / h);
  }
  // The place follows the view: the centre becomes the new place, and the view stays where it is.
  function commitMove() {
    clearTimeout(S.moveTimer); S.moveTimer = 0;
    var dx = R.cam.x, dz = R.cam.z; if (Math.hypot(dx, dz) < 0.3) return;
    var lat = GC.clamp(S.place.lat - dz / 111.2, -89.9, 89.9), lon = ((S.place.lon + dx / (111.2 * Math.max(Math.cos(GC.rad(lat)), 0.05)) + 540) % 360) - 180;
    R.cam.x = 0; R.cam.z = 0;
    setPlace({ name: 'Point ' + lat.toFixed(2) + ', ' + lon.toFixed(2), lat: lat, lon: lon });
  }
  function scheduleCommit(ms) { clearTimeout(S.moveTimer); S.moveTimer = setTimeout(commitMove, ms); }

  // ---------- time bar and camera height ----------
  function altText(a) { return '✈️ ' + (a < 1 ? Math.round(a * 1000) + ' m' : a < 20 ? a.toFixed(1) + ' km' : Math.round(a) + ' km'); }
  // The height slider runs 0..1 and maps to 0..400 km on a cube curve, so the first third covers the weather.
  var ALT_MAX = 400;
  function altFromSlider(s) { return Math.max(0.002, ALT_MAX * s * s * s); }
  function setAltSlider(a) { $('alt').value = Math.cbrt(Math.max(a, 0) / ALT_MAX); }
  function syncPlayback() {
    var tm = $('time'); tm.max = spanSec(); tm.step = Math.max(0.1, spanSec() / 600);
    if (S.simT > spanSec()) S.simT = 0;
    $('speedLabel').textContent = rateText(rate());
  }
  function initBar() {
    $('play').addEventListener('click', function () { setPlaying(!S.playing); });
    $('rewind').addEventListener('click', function () { S.simT = 0; S.loops = 0; S.dirty = true; });   // Restart: back to the start of the sky
    $('time').addEventListener('input', function () { S.simT = +$('time').value; if (S.playing) setPlaying(false); S.dirty = true; });
    document.querySelectorAll('[data-nav]').forEach(function (b) {
      b.addEventListener('click', function () {
        var m = b.dataset.nav;
        if (m === 'orbit') { if (!O.on) orbitOn(null); setNav('orbit'); }
        else setNav(m);
        S.dirty = true;
      });
    });
    $('alt').addEventListener('input', function () {
      R.cam.alt = altFromSlider(+$('alt').value);
      if (O.on) { var r = O.D * Math.cos(GC.rad(O.phi)), up = Math.max(R.cam.alt - O.hF, r * 0.035); O.phi = GC.clamp(GC.deg(Math.atan2(up, r)), 2, 88); O.D = Math.hypot(r, up); R.cam.pitch = -O.phi + O.pitchOff; }
      S.dirty = true;
    });
    document.querySelectorAll('[data-alt]').forEach(function (b) {
      b.addEventListener('click', function () {
        var m = S.model && S.model.hourAt(S.simT).summary, k = b.dataset.alt;
        orbitOff();
        var a = k === 'ground' ? 0.002 : k === 'space' ? 250 : !m ? 2 : k === 'inside' ? (m.lowBase + Math.min(m.lowTop, m.lowBase + 1.2)) / 2 : Math.min(12.5, Math.min(m.lowTop, m.lowBase + 3) + 1.2);
        R.cam.alt = a; setAltSlider(a);
        if (k === 'space') { R.cam.pitch = -38; R.cam.fov = 75; syncAdjust(); }
        else if (k === 'above') R.cam.pitch = Math.min(R.cam.pitch, -6); else if (k === 'ground' && R.cam.pitch < 5) R.cam.pitch = 15;
        S.dirty = true;
      });
    });
    $('cloudChip').addEventListener('click', function () { GC.settings.clouds = +GC.settings.clouds ? 0 : 1; GC.saveSettings(); R.cloudsOn = +GC.settings.clouds; renderSettings(); S.dirty = true; });
    syncPlayback();
  }

  // ---------- look: one finger moves (pan, walk, orbit), two fingers turn the view, pinch zooms ----------
  function initLook() {
    var cv = $('sky'), pts = {}, pinch = 0, moved = 0, tapStart = 0, mouseLook = false;
    function n() { return Object.keys(pts).length; }
    function dist() { var k = Object.keys(pts), a = pts[k[0]], b = pts[k[1]]; return Math.hypot(a.x - b.x, a.y - b.y); }
    function local(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    cv.addEventListener('pointerdown', function (e) {
      pts[e.pointerId] = { x: e.clientX, y: e.clientY }; try { cv.setPointerCapture(e.pointerId); } catch (x) { /* synthetic pointer */ }
      cv.classList.add('drag');
      if (n() === 1) { moved = 0; tapStart = Date.now(); mouseLook = e.shiftKey || e.button === 2; }
      if (n() === 2) { pinch = dist(); }
    });
    cv.addEventListener('pointermove', function (e) {
      var p = pts[e.pointerId]; if (!p) return;
      var dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
      var k = R.cam.fov / Math.max(cv.clientHeight, 1);
      var mode = (n() === 2 || mouseLook) ? 'look' : gestureMode();
      if (mode === 'orbit') { if (!O.on) orbitOn(null); O.th = (O.th - dx * 0.3 + 360) % 360; O.phi = GC.clamp(O.phi + dy * 0.2, 2, 88); orbitApply(); }
      else if (mode === 'walk' && S.onGround) { walkBy(dx, dy); scheduleCommit(900); }
      else if (mode === 'pan') { panBy(dx, dy); scheduleCommit(500); }
      else {                                                    // look: turn the view
        if (O.on) { O.yawOff = (O.yawOff - dx * k + 360) % 360; O.pitchOff = GC.clamp(O.pitchOff + dy * k, -60, 60); orbitApply(); }
        else { R.cam.yaw = (R.cam.yaw - dx * k + 360) % 360; R.cam.pitch = GC.clamp(R.cam.pitch + dy * k, -89, 89); }
      }
      if (n() === 2) {
        var d = dist();
        if (pinch > 0 && d > 0) {
          if (O.on) { O.D = GC.clamp(O.D * pinch / d, 0.5, 600); orbitApply(); }      // pinch comes closer
          else { R.cam.fov = GC.clamp(R.cam.fov * pinch / d, 2, 110); syncAdjust(); }
        }
        pinch = d;
      }
      S.dirty = true;
    });
    function up(e) {
      var was = n(), p = pts[e.pointerId]; delete pts[e.pointerId]; pinch = 0;
      if (was === 1 && e.type === 'pointerup' && moved < 8 && Date.now() - tapStart < 450 && p) {
        var q = local(e); if (S.nav === 'orbit') pickAt(q.x, q.y);
      }
      if (!n()) { cv.classList.remove('drag'); if (S.moveTimer) commitMove(); }
    }
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    cv.addEventListener('wheel', function (e) {
      e.preventDefault(); var f = e.deltaY > 0 ? 1.06 : 0.94;
      if (O.on) { O.D = GC.clamp(O.D * f, 0.5, 600); orbitApply(); } else { R.cam.fov = GC.clamp(R.cam.fov * f, 2, 110); syncAdjust(); }
      S.dirty = true;
    }, { passive: false });
    cv.addEventListener('gesturestart', function (e) { e.preventDefault(); });
    window.addEventListener('resize', function () { R.resize(); S.dirty = true; });
    $('turnBtn').addEventListener('click', function () { setTurning(!O.turning); });
    orbitButtons();
  }

  // ---------- skies right now: cities grouped by their current weather ----------
  function loadNow(force) {
    $('nowNote').textContent = 'Looking at ' + GC.CITIES.length + ' cities…';
    return W.conditions(force).then(function (res) {
      var box = $('nowSkies'); box.textContent = '';
      S.now = res;
      res.groups.forEach(function (g) {
        if (res.source === 'none' && g.id !== 'golden') return;
        var d = document.createElement('div'); d.className = 'grp'; d.dataset.group = g.id;
        var h = document.createElement('div'); h.className = 'grpName'; h.textContent = g.icon + ' ' + g.name; d.appendChild(h);
        if (!g.cities.length) { var n = document.createElement('div'); n.className = 'none'; n.textContent = 'None of the ' + res.count + ' cities right now.'; d.appendChild(n); }
        else {
          var row = document.createElement('div'); row.className = 'chips';
          g.cities.forEach(function (c) {
            var b = document.createElement('button'); b.className = 'chip'; b.type = 'button'; b.textContent = c.place.name;
            var sm = document.createElement('small'); sm.textContent = c.info; b.appendChild(sm);
            b.addEventListener('click', function () { S.when = { now: true }; c.place.city = true; setPlace(c.place); }); row.appendChild(b);
          });
          d.appendChild(row);
        }
        box.appendChild(d);
      });
      if (res.source === 'none') {
        var d2 = document.createElement('div'); d2.className = 'grp'; var h2 = document.createElement('div'); h2.className = 'grpName'; h2.textContent = '📍 Cities'; d2.appendChild(h2);
        var row2 = document.createElement('div'); row2.className = 'chips';
        GC.PLACES.forEach(function (p) { var b = document.createElement('button'); b.className = 'chip'; b.type = 'button'; b.textContent = p.name; b.addEventListener('click', function () { p.city = true; setPlace(p); }); row2.appendChild(b); });
        d2.appendChild(row2); box.appendChild(d2);
      }
      $('nowNote').textContent = res.source === 'live' ? 'The strongest of each kind among ' + res.count + ' cities, as of ' + new Date(res.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '. Tap one to generate its sky now.'
        : res.source === 'cache' ? 'The weather service is not reachable. This list is from ' + new Date(res.at).toLocaleString() + '.'
        : 'The weather service is not reachable, so cities cannot be sorted by weather. The sun group needs no connection.';
    });
  }
  GC.loadNow = loadNow;

  // ---------- place and time panel ----------
  function initPlace() {
    $('nowRefresh').addEventListener('click', function () { loadNow(true); });
    loadNow(false);
    $('searchForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var q = $('searchText').value.trim(), ul = $('searchResults'); if (!q) return;
      ul.textContent = 'Searching…';
      W.search(q).then(function (list) {
        ul.textContent = '';
        if (!list.length) { ul.textContent = 'No place found with that name.'; return; }
        list.forEach(function (p) {
          var li = document.createElement('li'), b = document.createElement('button'); b.type = 'button';
          b.textContent = p.name + (p.region ? ' · ' + p.region : '') + '  (' + p.lat.toFixed(2) + ', ' + p.lon.toFixed(2) + ')';
          b.addEventListener('click', function () { p.city = true; setPlace(p); }); li.appendChild(b); ul.appendChild(li);
        });
      }, function (e2) { ul.textContent = 'Place search is not reachable. Type a latitude and longitude below.'; GC.logError('Place search: ' + e2.message); });
    });
    $('goLatLon').addEventListener('click', function () {
      var la = parseFloat($('lat').value), lo = parseFloat($('lon').value);
      if (isNaN(la) || isNaN(lo) || Math.abs(la) > 90 || Math.abs(lo) > 180) { $('loadNote').textContent = 'Latitude is −90 to 90, longitude −180 to 180.'; return; }
      setPlace({ name: 'Point ' + la.toFixed(2) + ', ' + lo.toFixed(2), lat: la, lon: lo });
    });
    $('myLocation').addEventListener('click', function () {
      if (!navigator.geolocation) { $('loadNote').textContent = 'This browser does not share a location.'; return; }
      $('loadNote').textContent = 'Asking the device where it is…';
      navigator.geolocation.getCurrentPosition(function (pos) {
        setPlace({ name: 'Where I am', lat: pos.coords.latitude, lon: pos.coords.longitude });
      }, function () { $('loadNote').textContent = 'The location was not shared. Search for a place or type a latitude and longitude.'; }, { timeout: 10000, maximumAge: 600000 });
    });
    $('when').addEventListener('change', function () { if ($('when').value) S.when = { local: $('when').value.slice(0, 16) }; });
    $('loadSky').addEventListener('click', function () { if ($('when').value && !S.when.now) S.when = { local: $('when').value.slice(0, 16) }; loadSky(); });
    document.querySelectorAll('[data-time]').forEach(function (b) {
      b.addEventListener('click', function () {
        var kind = b.dataset.time;
        if (kind === 'now') { S.when = { now: true }; loadSky(); return; }
        var off = S.data ? S.data.offsetSec : W.guessOffset(S.place.lon);
        var day = ($('when').value || W.msToLocal(Date.now() + off * 1000)).slice(0, 10);
        var ms = GC.Sun.find(kind, W.localToMs(day + 'T00:00') - off * 1000, S.place.lat, S.place.lon);
        if (ms == null) { $('loadNote').textContent = 'The sun does not reach that point on this day at this latitude.'; return; }
        S.when = { local: W.msToLocal(ms + off * 1000) }; $('when').value = S.when.local; loadSky();
      });
    });
    var at = $('atlas');
    GC.PRESETS.forEach(function (p) {
      var b = document.createElement('button'); b.type = 'button'; b.dataset.id = p.id;
      var t = document.createElement('b'); t.textContent = p.icon + ' ' + p.name;
      var s = document.createElement('small'); s.textContent = p.level;
      b.appendChild(t); b.appendChild(s); b.appendChild(document.createElement('br')); b.appendChild(document.createTextNode(p.text));
      b.addEventListener('click', function () { usePreset(p); }); at.appendChild(b);
    });
  }

  // ---------- adjust panel ----------
  var ADJ = [
    ['ovLow', 'low', function (v) { return v / 100; }, function (m) { return m.summary.low * 100; }, function (v) { return Math.round(v) + '%'; }],
    ['ovMid', 'mid', function (v) { return v / 100; }, function (m) { return (S.ov.mid != null ? S.ov.mid : m.wx.mid) * 100; }, function (v) { return Math.round(v) + '%'; }],
    ['ovHigh', 'high', function (v) { return v / 100; }, function (m) { return m.summary.high * 100; }, function (v) { return Math.round(v) + '%'; }],
    ['ovWindS', 'windS', function (v) { return v; }, function (m) { return m.summary.windS; }, function (v) { return Math.round(v) + ' m/s'; }],
    ['ovWindD', 'windD', function (v) { return v; }, function (m) { return m.summary.windD; }, function (v) { return GC.compass(v) + ' ' + Math.round(v) + '°'; }],
    ['ovHaze', 'haze', function (v) { return v; }, function (m) { return m.summary.haze; }, function (v) { return (+v).toFixed(1) + '×'; }]
  ];
  function syncAdjust() {
    if (!S.model) return;
    ADJ.forEach(function (a) {
      var v = a[3](S.model); if (document.activeElement !== $(a[0])) $(a[0]).value = v;
      $(a[0] + 'V').textContent = a[4](v) + (S.ov[a[1]] != null ? ' ✎' : '');
    });
    $('ovType').value = S.ov.lowType || '';
    $('fov').value = R.cam.fov; $('fovV').textContent = (70 / R.cam.fov).toFixed(1) + '× · ' + Math.round(R.cam.fov) + '°';
  }
  function initAdjust() {
    ADJ.forEach(function (a) { $(a[0]).addEventListener('input', function () { S.ov[a[1]] = a[2](parseFloat($(a[0]).value)); rebuild(); }); });
    $('ovType').addEventListener('change', function () { S.ov.lowType = $('ovType').value || null; rebuild(); });
    $('fov').addEventListener('input', function () { R.cam.fov = +$('fov').value; $('fovV').textContent = (70 / R.cam.fov).toFixed(1) + '× · ' + Math.round(R.cam.fov) + '°'; S.dirty = true; });
    $('ovReset').addEventListener('click', function () { S.ov = {}; rebuild(); syncMaker(); });
  }

  // What a note is about, taken at the moment it is saved: place, time, and the elevation marker.
  GC.Notes.contextNow = function () {
    if (!S.data) return null;
    var T = GC.Terrain, over = T.isSea(R.cam.x, R.cam.z), gm = T.source === 'data' ? T.heightAt(R.cam.x, R.cam.z) * 1000 : null;
    var altM = Math.round(R.cam.alt * 1000), up = gm == null ? null : altM - Math.round(gm);
    var elev = 'camera ' + (altM < 1000 ? altM + ' m' : (altM / 1000).toFixed(1) + ' km') + ' above sea level' +
      (over ? ', over water' : gm != null ? ', ground ' + Math.round(gm) + ' m' + (up != null && up > 3 ? ' (' + (up < 1000 ? up + ' m' : (up / 1000).toFixed(1) + ' km') + ' above it)' : '') : '');
    return { page: 'index.html', item: S.place.lat.toFixed(2) + ',' + S.place.lon.toFixed(2) + '@' + S.data.localStr + ';alt_m=' + altM + (gm != null ? ';ground_m=' + Math.round(gm) : ''),
      label: (S.preset ? 'Atlas: ' + S.preset.name + ' · ' : '') + placeLabel() + ' · ' + S.data.localStr.replace('T', ' ') + ' · ' + elev };
  };

  // ---------- the map: pick the exact spot, keep the ones you like ----------
  var favs = GC.store.get('gc.favs', []); if (!Array.isArray(favs)) favs = [];
  function renderFavs() {
    var ul = $('favList'); ul.textContent = '';
    favs.forEach(function (f, i) {
      var li = document.createElement('li'), go = document.createElement('button'), del = document.createElement('button');
      go.type = 'button'; go.className = 'go'; go.textContent = '★ ' + f.name;
      var sm = document.createElement('small'); sm.textContent = (f.kind || 'Spot') + ' · ' + f.lat.toFixed(2) + ', ' + f.lon.toFixed(2); go.appendChild(sm);
      go.addEventListener('click', function () { S.pendingCam = f.cam || null; setPlace({ name: f.name, region: '', lat: f.lat, lon: f.lon, city: f.city }); });
      del.type = 'button'; del.className = 'btn square'; del.textContent = '✖'; del.setAttribute('aria-label', 'Remove ' + f.name);
      del.addEventListener('click', function () { favs.splice(i, 1); GC.store.set('gc.favs', favs); renderFavs(); });
      li.appendChild(go); li.appendChild(del); ul.appendChild(li);
    });
    GC.Map.setFavs(favs);
  }
  function initMap() {
    GC.Map.init($('map'));
    GC.Map.onPick = function (pin) {
      $('mapGo').hidden = false;
      $('mapNote').textContent = 'Pin at ' + pin.lat.toFixed(3) + ', ' + pin.lon.toFixed(3) + '. Zoom in and tap again to be more exact.';
    };
    $('mapIn').addEventListener('click', function () { GC.Map.zoomBy(1); });
    $('mapOut').addEventListener('click', function () { GC.Map.zoomBy(-1); });
    $('mapWorld').addEventListener('click', function () { GC.Map.setView(20, S.place.lon, 1); });
    $('mapHere').addEventListener('click', function () { GC.Map.setView(S.place.lat, S.place.lon, 11); });
    $('mapGo').addEventListener('click', function () {
      var p = GC.Map.pin; if (!p) return;
      setPlace({ name: 'Point ' + p.lat.toFixed(2) + ', ' + p.lon.toFixed(2), lat: p.lat, lon: p.lon });
    });
    $('faceWater').addEventListener('click', function () { var b = GC.Terrain.bearing('water', R.cam.x, R.cam.z); if (!b) return; orbitOff(); R.cam.yaw = b.deg; R.cam.pitch = b.dist < 1 ? 4 : 2; S.dirty = true; });
    $('faceHigh').addEventListener('click', function () { var b = GC.Terrain.bearing('high', R.cam.x, R.cam.z); if (!b) return; orbitOff(); R.cam.yaw = b.deg; R.cam.pitch = 4; S.dirty = true; });
    $('favSave').addEventListener('click', function () {
      var name = $('favName').value.trim() || (S.place.name + (S.spot ? ' · ' + S.spot.kind.toLowerCase() : ''));
      favs.unshift({ name: name.slice(0, 40), lat: S.place.lat, lon: S.place.lon, city: !!S.place.city, kind: S.spot ? S.spot.kind : '',
        cam: { yaw: R.cam.yaw, pitch: R.cam.pitch, fov: R.cam.fov, alt: R.cam.alt, x: R.cam.x, z: R.cam.z } });
      if (favs.length > 30) favs.pop();
      GC.store.set('gc.favs', favs); $('favName').value = ''; renderFavs();
    });
    renderFavs();
  }

  // ---------- weather maker: add weather by hand ----------
  function syncMaker() {
    $('mkPrecip').value = S.ov.precip || '';
    $('mkStrength').value = S.ov.precipI != null ? S.ov.precipI : 0.6; $('mkStrengthV').textContent = Math.round(+$('mkStrength').value * 100) + '%' + (S.ov.precipI != null ? ' ✎' : '');
    $('mkLightning').checked = !!S.ov.lightning;
    document.querySelectorAll('[data-feature]').forEach(function (b) { b.classList.toggle('on', !!b.dataset.feature && !!S.ov.feature && S.ov.feature.kind === b.dataset.feature); });
  }
  function placeFeature(kind) {
    var T = GC.Terrain, y = GC.rad(R.cam.yaw), dist = kind === 'microburst' ? 9 : 5, x, z, found = false;
    if (kind === 'waterspout') {
      for (var d = 3; d <= 26 && !found; d += 1.5) for (var k = 0; k < 9 && !found; k++) {
        var a = y + GC.rad([0, -12, 12, -25, 25, -40, 40, -60, 60][k]); x = R.cam.x + Math.sin(a) * d; z = R.cam.z - Math.cos(a) * d;
        if (T.isSea(x, z) && T.maskAt(x, z) < 0.2) found = true;
      }
      if (!found) { $('mkNote').textContent = 'No open water within 26 km of this view. Pick a coast or a spot at sea on the map, face the water, and try again.'; return false; }
    } else { x = R.cam.x + Math.sin(y) * dist; z = R.cam.z - Math.cos(y) * dist; }
    var sea = T.isSea(x, z);
    if (kind === 'tornado' && sea) kind = 'waterspout';
    S.ov.feature = { kind: kind, x: x, z: z, strength: kind === 'waterspout' ? 0.8 : 1, seed: 1 + Math.random() * 50, ground: T.heightAt(x, z), sea: sea };
    var lt = S.model && S.model.types.low;
    if (lt !== 'cumulonimbus' && !(kind === 'waterspout' && lt === 'congestus')) { S.ov.lowType = kind === 'waterspout' ? 'congestus' : 'cumulonimbus'; S.ov.forcedType = true; }
    if (kind === 'microburst' && !S.ov.precip && S.model && S.model.precipKind === 'none') { S.ov.precip = 'rain'; S.ov.forcedRain = true; }
    $('mkNote').textContent = { tornado: 'A tornado', waterspout: 'A waterspout', microburst: 'A microburst' }[kind] + ' stands ' + Math.round(Math.hypot(x - R.cam.x, z - R.cam.z)) + ' km away' + (sea ? ', over water' : '') +
      '. Press play to see it turn. Made-up: no weather feed reports these.';
    return true;
  }
  function initMaker() {
    $('mkPrecip').addEventListener('change', function () { S.ov.precip = $('mkPrecip').value || null; S.ov.forcedRain = false; rebuild(); syncMaker(); });
    $('mkStrength').addEventListener('input', function () { S.ov.precipI = +$('mkStrength').value; rebuild(); syncMaker(); });
    $('mkLightning').addEventListener('change', function () { S.ov.lightning = $('mkLightning').checked; rebuild(); });
    document.querySelectorAll('[data-feature]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (S.ov.forcedType) { S.ov.lowType = null; S.ov.forcedType = false; }
        if (S.ov.forcedRain) { S.ov.precip = null; S.ov.forcedRain = false; }
        S.ov.feature = null;
        if (b.dataset.feature) { rebuild(); placeFeature(b.dataset.feature); }
        else $('mkNote').textContent = 'Cleared.';
        rebuild(); syncMaker();
      });
    });
    $('shuffle').addEventListener('click', function () { S.ov.shuffle = (S.ov.shuffle || 0) + 1; rebuild(); });
    syncMaker();
  }
  GC.placeFeature = function (k) { var ok = placeFeature(k); rebuild(); syncMaker(); return ok; };

  // ---------- saving pictures ----------
  function initExport() {
    function run(btn, job) {
      if (R.busy || !S.model) return;
      var was = S.playing; setPlaying(false);
      R.fineStop(); S.still = 0;
      S.frame = S.model.at(S.simT, R.cam.alt); R.apply(S.frame);
      btn.disabled = true; $('exportNote').textContent = 'Drawing… 0%';
      job(function (f) { $('exportNote').textContent = 'Drawing… ' + Math.round(f * 100) + '%'; }).then(function (info) {
        $('exportNote').textContent = 'Saved ' + info.name + ' (' + info.width + ' × ' + info.height + ', ' + (info.bytes / 1048576).toFixed(1) + ' MB). Look in Downloads or Files.';
        GC.lastExport = info;
      }, function (e) { $('exportNote').textContent = 'Could not save: ' + e.message; GC.logError('Save picture: ' + e.message); })
        .then(function () { btn.disabled = false; S.dirty = true; if (was) setPlaying(true); });
    }
    $('saveView').addEventListener('click', function () {
      var wh = $('viewSize').value.split('x'); run($('saveView'), function (p) { return R.exportView(+wh[0], +wh[1], fileStem() + '_view.png', p); });
    });
    $('savePano').addEventListener('click', function () {
      var w = +$('panoSize').value; run($('savePano'), function (p) { return R.exportPano(w, fileStem() + '_360.png', p); });
    });
  }

  // ---------- ⚙️ ----------
  function renderErrors() {
    var box = $('errorsPanel'); box.hidden = !GC.settings.showErrors;
    box.textContent = GC.errors.length ? GC.errors.join('\n') : 'No problems so far.';
  }
  function renderSettings() {
    document.querySelectorAll('.seg').forEach(function (seg) {
      var v = String(GC.settings[seg.dataset.key]);
      seg.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === v); });
    });
    var si = SPANS.indexOf(spanSec()), pi = PLAYS.indexOf(playSec());
    $('spanSlider').value = si < 0 ? 1 : si; $('playSlider').value = pi < 0 ? 1 : pi;
    $('spanV').textContent = SPAN_LABELS[si < 0 ? 1 : si]; $('playV').textContent = PLAY_LABELS[pi < 0 ? 1 : pi];
    $('timeLapseNote').textContent = 'Sky covered: ' + SPAN_LABELS[si < 0 ? 1 : si] + ', playback ' + PLAY_LABELS[pi < 0 ? 1 : pi] + ' → ' + rateText(rate()) + '.';
    syncNav();
    $('showErrors').checked = !!GC.settings.showErrors;
    $('hud').hidden = !+GC.settings.compass;
    $('bar').hidden = !+GC.settings.bar; document.body.dataset.bar = +GC.settings.bar ? 'on' : 'off';
    syncPlayback();
    renderErrors();
  }
  // Relief exaggeration: heights of the ground (not of the sea) times 1, 2 or 4.
  function applyRelief() {
    GC.Terrain.exag = R.exag = +GC.settings.relief || 1;
    R.setTerrain(GC.Terrain); if (GC.Terrain.fineTex) R.setTerrainFine(GC.Terrain); S.dirty = true;
  }
  function initGear() {
    var gear = $('gear'), drawer = $('drawer');
    function setOpen(o) { drawer.hidden = !o; gear.setAttribute('aria-expanded', String(o)); }
    gear.addEventListener('click', function () { setOpen(drawer.hidden); });
    $('closeDrawer').addEventListener('click', function () { setOpen(false); });
    $('statusPill').addEventListener('click', function () { setOpen(true); });
    document.querySelectorAll('.seg button').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.parentElement.dataset.key, v = b.dataset.v;
        GC.settings[k] = /^\d+$/.test(v) ? +v : v; GC.saveSettings();
        if (k === 'quality') R.setQuality(v);
        if (k === 'relief') applyRelief();
        if (k === 'clouds') R.cloudsOn = +GC.settings.clouds;
        renderSettings(); S.dirty = true;
      });
    });
    $('spanSlider').addEventListener('input', function () {
      GC.settings.span = SPANS[+$('spanSlider').value] || 60; GC.saveSettings(); syncPlayback(); renderSettings(); S.dirty = true;
    });
    $('playSlider').addEventListener('input', function () {
      GC.settings.play = PLAYS[+$('playSlider').value] || 60; GC.saveSettings(); syncPlayback(); renderSettings(); S.dirty = true;
    });
    $('showErrors').addEventListener('change', function (e) { GC.settings.showErrors = e.target.checked; GC.saveSettings(); renderErrors(); });
    $('checkData').addEventListener('click', function () {
      var ul = $('checkList'); ul.textContent = 'Checking…';
      W.check().then(function (list) {
        ul.textContent = '';
        list.forEach(function (c) { var li = document.createElement('li'); li.textContent = (c.ok ? '✅ ' : '❌ ') + c.name + ': ' + c.msg; ul.appendChild(li); });
        if (list.some(function (c) { return !c.ok; })) { var li = document.createElement('li'); li.textContent = 'Without the link the page shows the saved copy, or a sample sky.'; ul.appendChild(li); }
      });
    });
    $('info').textContent = 'Generate Clouds ' + GC.VERSION + ' · Weather and air quality: Open-Meteo.com (CC BY 4.0), no key. Only a latitude, a longitude and a date are sent. · Earth picture: NASA Visible Earth (Blue Marble), via Wikimedia Commons, CC BY-SA 3.0 · Cloud cover from space: Open-Meteo (the live model), with the last saved copy if it cannot be reached · Map colours: © OpenStreetMap contributors (ODbL), a few tiles per place · Stars and figures: d3-celestial data (BSD) · Ground heights: Open-Meteo elevation (Copernicus DEM) · Sea: Open-Meteo marine · 3-D: three.js r128 (MIT).';
    GC.onError = renderErrors;
    renderSettings();
  }

  // ---------- the frame loop ----------
  var last = 0, acc = 0, accN = 0, uiT = 0, figCv = null, figCtx = null;
  function tick(now) {
    requestAnimationFrame(tick);
    var dt = Math.min((now - last) / 1000, 0.25); if (!last) dt = 0; last = now;
    if (!S.model || R.busy) return;
    if (S.playing) {
      var r = rate();                                   // the sky moves at the chosen rate: 1 is real time
      S.simT += dt * r; S.clock += dt * Math.min(r, 2);  // waves, rain and funnels move at the rate, up to twice real speed
      if (S.simT >= spanSec()) { S.simT -= spanSec(); if (S.simT >= spanSec()) S.simT = 0; S.loops++; if (S.autoLeft > 0 && --S.autoLeft === 0) setPlaying(false); }
      S.dirty = true;
      acc += dt * 1000; accN++;
      if (accN >= 20) { R.adapt(acc / accN); acc = 0; accN = 0; }
      if (S.frame && S.frame.flashy && S.flash < 0.05 && Math.random() < 0.012) {
        var ft = R.feature, cx = ft ? ft.x : O.on ? O.fx : R.cam.x, cz = ft ? ft.z : O.on ? O.fz : R.cam.z, spread = ft ? 14 : 44;
        var bx = cx + (Math.random() - 0.5) * spread, bz = cz + (Math.random() - 0.5) * spread, km = Math.hypot(bx - R.cam.x, bz - R.cam.z, R.cam.alt);
        S.flash = 1.6 + Math.random() * 2; R.flash(S.flash, bx, bz, Math.random() * 90);
        var wait = GC.Audio.thunder(km); S.thunder = { km: km, at: now + wait * 1000 }; S.bolts = (S.bolts || 0) + 1;
      }
    }
    if (O.on && O.turning) {
      var step = dt * 360 / (+GC.settings.turn);
      O.th = (O.th + step) % 360; O.turned += step; orbitApply();
      if (O.turned >= 720) setTurning(false);            // twice around, then wait
      if (!S.playing) { acc += dt * 1000; accN++; if (accN >= 20) { R.adapt(acc / accN); acc = 0; accN = 0; } }
    }
    if (S.flash > 0.02) { S.flash *= 0.8; if (S.flash <= 0.02) S.flash = 0; R.flash(S.flash, R._fx || 0, R._fz || 0); S.dirty = true; }
    if (!S.dirty) {
      // Nothing is moving: after a short pause, redraw the still view sharp, one strip per frame.
      if (S.playing || S.sharp) return;
      if (!R.fineOn) { if (now - S.still > 450 && R.fineStart()) updateUi(); return; }
      if (R.fineStep()) S.sharp = true;
      updateUi();
      return;
    }
    S.dirty = false; S.still = now; S.sharp = false;
    R.fineStop();
    // never under the ground or the waves
    var onSea = GC.Terrain.isSea(R.cam.x, R.cam.z) && S.frame;
    var floor = GC.Terrain.ceilAt(R.cam.x, R.cam.z) + 0.002 + (onSea ? (S.frame.sea[4] || 0) + S.frame.sea[0] * 0.75 : 0);   // over water: 2 m above the highest crest, and above the tide
    S.onGround = R.cam.alt <= floor + 1e-6;
    if (R.cam.alt < floor) R.cam.alt = floor;
    if (zoneOf() !== S.zone) syncNav();                 // the buttons follow the height
    R.clock = S.clock; R.city = S.place.city ? 1 : 0;
    maybeWide(); R.satW = GC.clamp((R.cam.alt - 8) / 22, 0, 1);      // from about 8 km up, the real Earth shows; from space, the model's cloud grid too
    applyRegional(); applyStars();
    R.windW = GC.clamp((R.cam.alt - 10) / 20, 0, 1); R.windT = S.simT;     // the wind grid counts from 10 km up, fully from 30 km
    var ftr = S.ov.feature; R.feature = ftr || null;
    S.frame = S.model.at(S.simT, R.cam.alt);
    R.apply(S.frame); R.render();
    drawFigures();
    if (now - uiT > 120) { uiT = now; updateUi(); }
  }
  function drawFigures() {
    if (!figCv) { figCv = $('figures'); figCtx = figCv.getContext('2d'); }
    var size = R.canvasSize(), w = size.w, h = size.h;
    if (figCv.width !== w || figCv.height !== h) { figCv.width = w; figCv.height = h; }
    if (!+GC.settings.figures) { if (S.figOn) { figCtx.clearRect(0, 0, w, h); S.figOn = false; } return; }
    S.figOn = true;
    GC.Stars.draw(figCtx, w, h, R.basis(), S.frame ? S.frame.night : 0);
  }
  function updateUi() {
    if (document.activeElement !== $('time')) $('time').value = S.simT;
    $('clock').textContent = fmtDur(S.simT) + ' of ' + fmtDur(spanSec()) + ' · ' + localAt(S.simT).slice(11, 16);
    $('speedLabel').textContent = rateText(rate());
    $('altLabel').textContent = altText(R.cam.alt);
    var th = S.thunder && performance.now() < S.thunder.at + 1500 ? ' · ⚡ ' + S.thunder.km.toFixed(0) + ' km away, thunder ' + (performance.now() < S.thunder.at ? 'in ' + Math.ceil((S.thunder.at - performance.now()) / 1000) + ' s' : 'now') : '';
    var f = S.frame; if (!f) return;
    var where = O.on ? 'Orbiting · ' + Math.round(O.D) + ' km out · ' : S.onGround ? 'On the ground · ' : '';
    $('hud').textContent = where + 'Looking ' + GC.compass(R.cam.yaw) + ', ' + Math.abs(Math.round(R.cam.pitch)) + '° ' + (R.cam.pitch >= 0 ? 'up' : 'down') +
      ' · Sun ' + GC.compass(f.sunAz) + ' ' + Math.round(f.sunEl) + '°' + (R.cam.fov < 60 ? ' · zoom ' + (70 / R.cam.fov).toFixed(1) + '×' : '') +
      (S.sharp ? ' · sharp' : R.fineOn ? ' · sharpening ' + Math.round(R.fineProgress() * 100) + '%' : '') + th;
  }
  // keep R.flash position between frames
  var _flash = R.flash; R.flash = function (a, x, z) { R._fx = x; R._fz = z; _flash(a, x, z); };

  GC.debug = function () {
    var tl = S.data && S.data.tl;
    return { version: GC.VERSION, simT: S.simT, playing: S.playing, span: spanSec(), play: playSec(), rate: rate(), nav: S.nav, zone: zoneOf(), loops: S.loops, autoLeft: S.autoLeft,
      source: tl && (S.preset ? 'atlas' : tl.source), hours: tl && tl.hours.length, hour: S.model && S.model.hourIndex(S.simT), place: S.place, local: S.data && S.data.localStr,
      types: S.model && S.model.types, summary: S.model && S.model.hourAt(S.simT).summary,
      cam: { yaw: R.cam.yaw, pitch: R.cam.pitch, fov: R.cam.fov, alt: R.cam.alt }, orbit: { on: O.on, turning: O.turning, turned: O.turned, D: O.D, phi: O.phi, th: O.th, fx: O.fx, fz: O.fz, hF: O.hF, yawOff: O.yawOff, pitchOff: O.pitchOff },
      camXZ: [R.cam.x, R.cam.z], world: R.worldOn, fineMap: R.fineSpan, region2: R.region2On, region: R.regionOn, marine: !!(tl && tl.hours[0].wx.marine), sea: S.frame && S.frame.sea,
      relief: R.exag, bar: !+GC.settings.bar ? 'hidden' : 'shown', spot: S.spot, terrain: { source: GC.Terrain.source, max: GC.Terrain.max },
      precip: S.model && S.model.precipKind, vary: S.model && S.model.vary, feature: S.ov.feature || null, bolts: S.bolts || 0, favs: favs.length, mapPin: GC.Map.pin, mapTiles: GC.Map.tilesOk,
      onGround: !!S.onGround, gesture: S.model ? gestureMode() : null, inCloud: S.model ? inCloudBand() : null, pick: S.pick,
      mapColours: !!R.osmOn, cloudGrid: !!R.cloudGOn, satW: R.satW, wind: !!R.windOn, windW: R.windW, stars: !!R.starsOn, figures: +GC.settings.figures, clouds: R.cloudsOn, clock: S.clock, sound: GC.Audio.ready(),
      frames: R.frames, scale: R.scale, ok: R.ok, sharp: !!S.sharp, fine: R.fineProgress(), now: S.now && { source: S.now.source, groups: S.now.groups.map(function (g) { return [g.id, g.cities.length]; }) },
      sunEl: S.frame && S.frame.sunEl, exposure: S.frame && S.frame.exposure, ov: S.ov, notes: GC.Notes.all().length };
  };

  function start() {
    initPanels(); GC.Notes.init(); initGear(); GC.Cloud.init(); initPlace(); initMap(); initMaker(); initAdjust(); initBar(); initExport();
    if (!R.init($('sky'))) { $('noGl').hidden = false; setPill('sample', '⚠️ No 3-D'); return; }
    initLook(); applyRelief(); R.cloudsOn = +GC.settings.clouds; R.onWorld = function () { S.dirty = true; };
    var lastUsed = GC.store.get('gc.last', null);
    if (lastUsed && lastUsed.place && typeof lastUsed.place.lat === 'number') { S.place = lastUsed.place; if (lastUsed.when && (lastUsed.when.now || lastUsed.when.local)) S.when = lastUsed.when; }
    var m = /[#&]atlas=([a-z]+)/.exec(location.hash);
    GC.Map.setPlace(S.place, 3);
    requestAnimationFrame(tick);
    var first = loadSky();
    if (m && first) first.then(function () { GC.usePreset(m[1]); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
