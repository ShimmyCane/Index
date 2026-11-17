/* Generate Clouds — the page: place and time, panels, time lapse, camera, saving pictures, ⚙️. */
(function () {
  'use strict';
  var GC = window.GC, $ = GC.$, R = GC.Renderer, W = GC.Weather;
  var LOOP = 900;                                   // seconds of sky in one time lapse (15 minutes)
  var S = {
    place: GC.PLACES[0], when: { now: true }, data: null, preset: null, ov: {}, model: null, frame: null,
    simT: 0, playing: false, autoLeft: 0, loops: 0, dirty: true, flash: 0, loading: false, clock: 0, spot: null, pendingCam: null, thunder: null
  };
  GC.state = S;

  // ---------- small UI helpers ----------
  function setPill(src, text) { var p = $('statusPill'); p.dataset.src = src; p.textContent = text; }
  function placeLabel() { return S.place.name + (S.place.region ? ', ' + S.place.region : ''); }
  function fmtClock(sec) { sec = Math.round(sec); return GC.pad(Math.floor(sec / 60)) + ':' + GC.pad(sec % 60); }
  function localAt(simT) { return S.data ? W.msToLocal(S.data.utcMs + S.data.offsetSec * 1000 + simT * 1000) : ''; }
  function fileStem() { return 'clouds_' + S.place.name.replace(/[^A-Za-z0-9]+/g, '-').toLowerCase() + '_' + localAt(S.simT).replace(/[:T]/g, '-'); }

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

  // ---------- the model ----------
  function rebuild() {
    if (!S.data) return;
    S.model = GC.Sky.build(S.data.wx, S.place, S.data.utcMs, S.ov);
    var ul = $('reading'); ul.textContent = '';
    S.model.reading.forEach(function (r) {
      var li = document.createElement('li'), b = document.createElement('b');
      b.textContent = r.icon + ' ' + r.head; li.appendChild(b); li.appendChild(document.createTextNode(r.text)); ul.appendChild(li);
    });
    syncAdjust();
    var label = (S.preset ? 'Atlas: ' + S.preset.name + ' · ' : '') + placeLabel() + ' · ' + S.data.localStr.replace('T', ' ');
    GC.Notes.setContext({ item: (S.preset ? S.preset.id + '@' : '') + S.place.lat.toFixed(2) + ',' + S.place.lon.toFixed(2) + '@' + S.data.localStr, label: label });
    S.dirty = true;
  }
  function restart(autoplay) {
    S.simT = 0; S.loops = 0;
    S.autoLeft = (autoplay && +GC.settings.autoplay) ? 2 : 0;
    setPlaying(S.autoLeft > 0);
    S.dirty = true;
  }
  function setPlaying(on) { if (on) GC.Audio.unlock(); S.playing = on; $('play').classList.toggle('playing', on); if (!on) S.autoLeft = 0; S.dirty = true; }

  function showData(res) {
    S.data = res;
    $('when').value = res.localStr;
    showSpot();
    $('lat').value = S.place.lat.toFixed(2); $('lon').value = S.place.lon.toFixed(2);
    var src = S.preset ? 'atlas' : res.source;
    setPill(src, { live: '🛰️ Live data', cache: '💾 Saved copy', sample: '📦 Sample sky', atlas: '🗂️ Atlas sample' }[src] || src);
    $('loadNote').textContent = S.preset ? 'Made-up weather for "' + S.preset.name + '". Press Generate this sky for the real data.' : (res.note || (res.archive ? 'From the long-term archive: no pressure-level wind, storm energy or air quality that far back.' : ''));
    $('dataLine').textContent = (S.preset ? 'Atlas sample (made-up weather). ' : { live: 'Live from Open-Meteo. ', cache: 'Saved copy on this device. ', sample: 'Bundled sample sky. ' }[res.source]) + (res.note || '');
    document.querySelectorAll('#atlas button').forEach(function (b) { b.classList.toggle('on', !!S.preset && b.dataset.id === S.preset.id); });
    R.feature = null;
    if (S.pendingCam && !S.preset) { var c = S.pendingCam; S.pendingCam = null; R.cam.yaw = c.yaw; R.cam.pitch = c.pitch; R.cam.fov = c.fov; R.cam.alt = c.alt; R.cam.x = c.x || 0; R.cam.z = c.z || 0; setAltSlider(R.cam.alt); }
    rebuild(); syncMaker();
  }

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
    if (GC.Terrain.key === key && GC.Terrain.source === 'data') { S.spot = GC.Terrain.classify(); showSpot(); return Promise.resolve(); }
    var stand = S.onGround;                              // a camera standing on the ground follows the ground when it changes
    GC.Terrain.flat(place); R.setTerrain(GC.Terrain); S.spot = null; showSpot(); if (stand) R.cam.alt = 0;
    return GC.Terrain.load(place).then(function (T) {
      if (S.place !== place) return;
      if (S.onGround) R.cam.alt = 0;
      R.setTerrain(T); S.spot = T.classify(); showSpot(); S.dirty = true;
    });
  }
  function loadRegion(res) {
    R.setRegion(null);
    var place = S.place;
    if (res.source === 'sample') return Promise.resolve();
    return W.region(place, res.utcMs).then(function (cells) { if (S.place === place && !S.preset) { R.setRegion(cells); S.region = !!cells; S.dirty = true; } });
  }

  function loadSky() {
    if (S.loading) return;
    S.loading = true; S.preset = null; S.ov = {}; orbitOff(); R.cam.x = 0; R.cam.z = 0;
    setPill('loading', '⏳ Loading');
    GC.store.set('gc.last', { place: S.place, when: S.when });
    return W.load(S.place, S.when).then(function (res) {
      S.loading = false;
      if (res.source !== 'live' && res.note) GC.logError('Weather: ' + res.note);
      showData(res); restart(true);
      S.groundJob = loadGround(); S.regionJob = loadRegion(res);
    }, function (e) { S.loading = false; GC.logError('Weather: ' + e.message); setPill('sample', '⚠️ Check'); });
  }
  GC.loadSky = loadSky;

  function setPlace(p) {
    S.place = { name: p.name || 'Chosen point', region: p.region || '', lat: GC.clamp(+p.lat, -89.9, 89.9), lon: ((+p.lon + 540) % 360) - 180, city: !!p.city };
    $('searchResults').textContent = ''; $('mapGo').hidden = true; GC.Map.setPlace(S.place);
    return loadSky();
  }

  function usePreset(p) {
    var off = S.data ? S.data.offsetSec : W.guessOffset(S.place.lon);
    var day = (S.data ? S.data.localStr : W.msToLocal(Date.now() + off * 1000)).slice(0, 10);
    var dayStart = W.localToMs(day + 'T00:00') - off * 1000;
    var kind = p.sun === 'day' ? 'noon' : p.sun, ms = GC.Sun.find(kind, dayStart, S.place.lat, S.place.lon) || GC.Sun.find('noon', dayStart, S.place.lat, S.place.lon);
    if (p.sun === 'day') ms -= 2.5 * 3600000;        // mid-morning light shows the shapes better than high noon
    S.preset = p; S.ov = JSON.parse(JSON.stringify(p.ov || {})); R.setRegion(null);
    orbitOff(); R.cam.x = 0; R.cam.z = 0;
    R.cam.alt = p.cam.alt; R.cam.pitch = p.cam.pitch; R.cam.fov = 70;
    var sp = GC.Sun.pos(ms, S.place.lat, S.place.lon);
    R.cam.yaw = p.cam.toward === 'sun' ? sp.az : (sp.az + 110) % 360;
    setAltSlider(R.cam.alt);
    showData({ wx: JSON.parse(JSON.stringify(p.wx)), localStr: W.msToLocal(ms + off * 1000), offsetSec: off, utcMs: ms, source: 'sample', note: '', archive: false });
    restart(true);
    if (p.cam.orbit) { orbitOn(p.cam.orbit); if (+GC.settings.autoplay) setTurning(true); }
  }
  GC.usePreset = function (id) { var p = GC.PRESETS.filter(function (x) { return x.id === id; })[0]; if (p) usePreset(p); };

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

  // ---------- orbit: circle a point in the clouds ----------
  // The camera sits D km from a centre point, phi degrees above it, on bearing th from it, and always faces it.
  var O = { on: false, fx: 0, fz: 0, hF: 2, D: 20, phi: 20, th: 180, turning: false, turned: 0 };
  GC.orbit = O;
  function orbitApply() {
    var ph = GC.rad(O.phi), th = GC.rad(O.th), r = O.D * Math.cos(ph);
    R.cam.alt = Math.max(0.01, O.hF + O.D * Math.sin(ph));
    R.cam.x = O.fx + r * Math.sin(th); R.cam.z = O.fz - r * Math.cos(th);
    R.cam.yaw = (O.th + 180) % 360; R.cam.pitch = -O.phi;
    setAltSlider(R.cam.alt); S.dirty = true;
  }
  function orbitButtons() {
    $('orbitBtn').classList.toggle('on', O.on); $('orbitBtn').setAttribute('aria-pressed', String(O.on));
    $('turnBtn').hidden = !O.on; $('turnBtn').classList.toggle('on', O.turning); $('turnBtn').setAttribute('aria-pressed', String(O.turning));
    $('turnBtn').textContent = O.turning ? 'Stop' : 'Turn';
  }
  function setTurning(on) { O.turning = on && O.on; O.turned = 0; orbitButtons(); S.dirty = true; }
  function orbitOn(fixed) {
    var m = S.model && S.model.summary;
    O.hF = fixed ? fixed.hF : m ? m.lowBase + Math.min(m.lowTop - m.lowBase, 3) / 2 : 2;
    if (fixed) { O.fx = 0; O.fz = 0; O.D = fixed.D; O.phi = fixed.phi; O.th = (R.cam.yaw + 180) % 360; }
    else {
      var top = m ? Math.min(m.lowTop, m.lowBase + 4) : 3;
      if (R.cam.alt < top + 1) R.cam.alt = top + 4;                       // orbiting is for the air: start above the low cloud
      var up = R.cam.alt - O.hF, r0 = R.cam.pitch < -3 ? up / Math.tan(GC.rad(-R.cam.pitch)) : 2.5 * up;
      r0 = GC.clamp(r0, 6, 220);
      var y = GC.rad(R.cam.yaw);
      O.fx = R.cam.x + r0 * Math.sin(y); O.fz = R.cam.z - r0 * Math.cos(y);
      O.th = (R.cam.yaw + 180) % 360; O.D = Math.hypot(r0, up); O.phi = GC.clamp(GC.deg(Math.atan2(up, r0)), 2, 88);
    }
    O.on = true; O.turning = false; orbitApply(); orbitButtons();
  }
  function orbitOff() { O.on = false; O.turning = false; orbitButtons(); }
  function initOrbit() {
    $('orbitBtn').addEventListener('click', function () { if (O.on) orbitOff(); else orbitOn(null); S.dirty = true; });
    $('turnBtn').addEventListener('click', function () { setTurning(!O.turning); });
    orbitButtons();
  }

  // ---------- time bar and camera height ----------
  function altText(a) { return '✈️ ' + (a < 1 ? Math.round(a * 1000) + ' m' : a < 20 ? a.toFixed(1) + ' km' : Math.round(a) + ' km'); }
  // The height slider runs 0..1 and maps to 0..400 km on a cube curve, so the first third covers the weather.
  var ALT_MAX = 400;
  function altFromSlider(s) { return Math.max(0.002, ALT_MAX * s * s * s); }
  function setAltSlider(a) { $('alt').value = Math.cbrt(Math.max(a, 0) / ALT_MAX); }
  function initBar() {
    $('play').addEventListener('click', function () { setPlaying(!S.playing); });
    $('rewind').addEventListener('click', function () { S.simT = 0; S.dirty = true; });
    $('time').addEventListener('input', function () { S.simT = +$('time').value; if (S.playing) setPlaying(false); S.dirty = true; });
    $('alt').addEventListener('input', function () {
      R.cam.alt = altFromSlider(+$('alt').value);
      if (O.on) { var r = O.D * Math.cos(GC.rad(O.phi)), up = Math.max(R.cam.alt - O.hF, r * 0.035); O.phi = GC.clamp(GC.deg(Math.atan2(up, r)), 2, 88); O.D = Math.hypot(r, up); R.cam.pitch = -O.phi; }
      S.dirty = true;
    });
    document.querySelectorAll('[data-alt]').forEach(function (b) {
      b.addEventListener('click', function () {
        var m = S.model && S.model.summary, k = b.dataset.alt;
        orbitOff();
        var a = k === 'ground' ? 0.002 : k === 'space' ? 250 : !m ? 2 : k === 'inside' ? (m.lowBase + Math.min(m.lowTop, m.lowBase + 1.2)) / 2 : Math.min(12.5, Math.min(m.lowTop, m.lowBase + 3) + 1.2);
        R.cam.alt = a; setAltSlider(a);
        if (k === 'space') { R.cam.pitch = -38; R.cam.fov = 75; syncAdjust(); }
        else if (k === 'above') R.cam.pitch = Math.min(R.cam.pitch, -6); else if (k === 'ground' && R.cam.pitch < 5) R.cam.pitch = 15;
        S.dirty = true;
      });
    });
  }
  function initLook() {
    var cv = $('sky'), pts = {}, pinch = 0;
    function n() { return Object.keys(pts).length; }
    function dist() { var k = Object.keys(pts), a = pts[k[0]], b = pts[k[1]]; return Math.hypot(a.x - b.x, a.y - b.y); }
    cv.addEventListener('pointerdown', function (e) {
      pts[e.pointerId] = { x: e.clientX, y: e.clientY }; try { cv.setPointerCapture(e.pointerId); } catch (x) { /* synthetic pointer */ }
      cv.classList.add('drag'); if (n() === 2) pinch = dist();
    });
    cv.addEventListener('pointermove', function (e) {
      var p = pts[e.pointerId]; if (!p) return;
      var dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
      if (n() === 1) {
        if (O.on) {                                  // go around and over the centre
          O.th = (O.th - dx * 0.3 + 360) % 360; O.phi = GC.clamp(O.phi + dy * 0.2, 2, 88); orbitApply();
        } else {
          var k = R.cam.fov / Math.max(cv.clientHeight, 1);
          R.cam.yaw = (R.cam.yaw - dx * k + 360) % 360; R.cam.pitch = GC.clamp(R.cam.pitch + dy * k, -89, 89);
        }
      } else if (n() === 2) {
        var d = dist();
        if (pinch > 0 && d > 0) {
          if (O.on) { O.D = GC.clamp(O.D * pinch / d, 2, 600); orbitApply(); }      // pinch comes closer
          else { R.cam.fov = GC.clamp(R.cam.fov * pinch / d, 2, 110); syncAdjust(); }
        }
        pinch = d;
      }
      S.dirty = true;
    });
    function up(e) { delete pts[e.pointerId]; pinch = 0; if (!n()) cv.classList.remove('drag'); }
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', function (e) {
      e.preventDefault(); var f = e.deltaY > 0 ? 1.06 : 0.94;
      if (O.on) { O.D = GC.clamp(O.D * f, 2, 600); orbitApply(); } else { R.cam.fov = GC.clamp(R.cam.fov * f, 2, 110); syncAdjust(); }
      S.dirty = true;
    }, { passive: false });
    cv.addEventListener('gesturestart', function (e) { e.preventDefault(); });
    window.addEventListener('resize', function () { R.resize(); S.dirty = true; });
  }

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
    $('showErrors').checked = !!GC.settings.showErrors;
    $('hud').hidden = !+GC.settings.compass;
    renderErrors();
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
        renderSettings(); S.dirty = true;
      });
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
    $('info').textContent = 'Generate Clouds ' + GC.VERSION + ' · Weather and air quality: Open-Meteo.com (CC BY 4.0), no key. Only a latitude, a longitude and a date are sent. · 3-D: three.js r128 (MIT).';
    GC.onError = renderErrors;
    renderSettings();
  }

  // ---------- the frame loop ----------
  var last = 0, acc = 0, accN = 0, uiT = 0;
  function tick(now) {
    requestAnimationFrame(tick);
    var dt = Math.min((now - last) / 1000, 0.25); if (!last) dt = 0; last = now;
    if (!S.model || R.busy) return;
    if (S.playing) {
      S.clock += dt;                                    // waves, rain and funnels move in real seconds
      S.simT += dt * (+GC.settings.speed);
      if (S.simT >= LOOP) {
        S.simT = 0; S.loops++;
        if (S.autoLeft > 0 && --S.autoLeft === 0) setPlaying(false);
      }
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
    var floor = GC.Terrain.ceilAt(R.cam.x, R.cam.z) + 0.002 + (GC.Terrain.isSea(R.cam.x, R.cam.z) && S.frame ? S.frame.sea[0] * 0.9 : 0);
    S.onGround = R.cam.alt <= floor + 1e-6;
    if (R.cam.alt < floor) R.cam.alt = floor;
    R.clock = S.clock; R.city = S.place.city ? 1 : 0;
    var ftr = S.ov.feature; R.feature = ftr || null;
    S.frame = S.model.at(S.simT, R.cam.alt);
    R.apply(S.frame); R.render();
    if (now - uiT > 120) { uiT = now; updateUi(); }
  }
  function updateUi() {
    if (document.activeElement !== $('time')) $('time').value = S.simT;
    $('clock').textContent = fmtClock(S.simT) + ' / 15:00 · ' + localAt(S.simT).slice(11);
    $('altLabel').textContent = altText(R.cam.alt);
    var th = S.thunder && performance.now() < S.thunder.at + 1500 ? ' · ⚡ ' + S.thunder.km.toFixed(0) + ' km away, thunder ' + (performance.now() < S.thunder.at ? 'in ' + Math.ceil((S.thunder.at - performance.now()) / 1000) + ' s' : 'now') : '';
    var f = S.frame; if (!f) return;
    $('hud').textContent = (O.on ? 'Orbit ' + Math.round(O.D) + ' km out · ' : '') + 'Looking ' + GC.compass(R.cam.yaw) + ', ' + Math.abs(Math.round(R.cam.pitch)) + '° ' + (R.cam.pitch >= 0 ? 'up' : 'down') +
      ' · Sun ' + GC.compass(f.sunAz) + ' ' + Math.round(f.sunEl) + '°' + (R.cam.fov < 60 ? ' · zoom ' + (70 / R.cam.fov).toFixed(1) + '×' : '') +
      (S.sharp ? ' · sharp' : R.fineOn ? ' · sharpening ' + Math.round(R.fineProgress() * 100) + '%' : '') + th;
  }
  // keep R.flash position between frames
  var _flash = R.flash; R.flash = function (a, x, z) { R._fx = x; R._fz = z; _flash(a, x, z); };

  GC.debug = function () {
    return { version: GC.VERSION, simT: S.simT, playing: S.playing, loops: S.loops, autoLeft: S.autoLeft, source: S.data && (S.preset ? 'atlas' : S.data.source),
      place: S.place, local: S.data && S.data.localStr, types: S.model && S.model.types, summary: S.model && S.model.summary,
      cam: { yaw: R.cam.yaw, pitch: R.cam.pitch, fov: R.cam.fov, alt: R.cam.alt }, orbit: { on: O.on, turning: O.turning, turned: O.turned, D: O.D, phi: O.phi, th: O.th, fx: O.fx, fz: O.fz, hF: O.hF }, camXZ: [R.cam.x, R.cam.z], spot: S.spot, terrain: { source: GC.Terrain.source, max: GC.Terrain.max }, region: !!R.regionOn, precip: S.model && S.model.precipKind, vary: S.model && S.model.vary,
      feature: S.ov.feature || null, bolts: S.bolts || 0, favs: favs.length, mapPin: GC.Map.pin, mapTiles: GC.Map.tilesOk, onGround: !!S.onGround, clock: S.clock, sound: GC.Audio.ready(), frames: R.frames, scale: R.scale, ok: R.ok, sharp: !!S.sharp, fine: R.fineProgress(), now: S.now && { source: S.now.source, groups: S.now.groups.map(function (g) { return [g.id, g.cities.length]; }) },
      sunEl: S.frame && S.frame.sunEl, exposure: S.frame && S.frame.exposure, ov: S.ov, notes: GC.Notes.all().length };
  };

  function start() {
    initPanels(); GC.Notes.init(); initGear(); GC.Cloud.init(); initPlace(); initMap(); initMaker(); initAdjust(); initBar(); initOrbit(); initExport();
    if (!R.init($('sky'))) { $('noGl').hidden = false; setPill('sample', '⚠️ No 3-D'); return; }
    initLook();
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
