/* Generate Clouds — from weather numbers to a sky.
   GC.Sky.build(wx, place, utcMs, overrides) reads one hour of weather and decides:
   which cloud type sits in each of three layers, how high, how much, how it moves,
   how hazy the air is. model.at(simSeconds) gives the numbers for one frame.
   model.reading is the same decision in plain words. */
(function () {
  'use strict';
  var GC = window.GC = window.GC || {};
  var clamp = GC.clamp, lerp = GC.lerp;

  // thick km, cell km, soft bottom, top taper, anvil, density /km, detail
  var LOW = {
    cumulus:       { name: 'Cumulus',           thick: 0.9, cell: 1.3, soft: 0.08, taper: 0.75, anvil: 0,   dens: 22, detail: 0.85 },
    congestus:     { name: 'Cumulus congestus', thick: 3.5, cell: 2.3, soft: 0.06, taper: 0.60, anvil: 0,   dens: 11, detail: 0.80 },
    cumulonimbus:  { name: 'Cumulonimbus',      thick: 10,  cell: 5.0, soft: 0.04, taper: 0.45, anvil: 1.0, dens: 5, detail: 0.60 },
    stratocumulus: { name: 'Stratocumulus',     thick: 0.6, cell: 1.6, soft: 0.25, taper: 0.25, anvil: 0,   dens: 16, detail: 0.60 },
    stratus:       { name: 'Stratus',           thick: 0.4, cell: 3.5, soft: 0.30, taper: 0,    anvil: 0,   dens: 10, detail: 0.25 },
    nimbostratus:  { name: 'Nimbostratus',      thick: 3.0, cell: 5.0, soft: 0.30, taper: 0,    anvil: 0,   dens: 9, detail: 0.30 }
  };
  var MID = {
    altocumulus:   { name: 'Altocumulus', thick: 0.5, cell: 0.7, soft: 0.30, taper: 0.30, anvil: 0, dens: 9, detail: 0.50 },
    altostratus:   { name: 'Altostratus', thick: 1.2, cell: 5.0, soft: 0.35, taper: 0,    anvil: 0, dens: 5, detail: 0.20 }
  };
  var HIGH = {
    cirrus:        { name: 'Cirrus',       stretch: 0.16, scale: 2.4,  opacity: 0.45 },
    cirrostratus:  { name: 'Cirrostratus', stretch: 0.60, scale: 14.0, opacity: 0.45 },
    cirrocumulus:  { name: 'Cirrocumulus', stretch: 1.00, scale: 1.2,  opacity: 0.60 }
  };
  GC.LOW_TYPES = LOW;

  function pct(x) { return Math.round(x * 100) + '%'; }
  function km(x) { return (x < 1 ? Math.round(x * 1000) + ' m' : x.toFixed(1) + ' km'); }
  function seedFrom(place, utcMs, shuffle) {
    var h = Math.floor(utcMs / 3600000) + (shuffle || 0) * 7919, a = Math.sin(place.lat * 12.9898 + place.lon * 78.233 + h * 0.618) * 43758.5453;
    var f = a - Math.floor(a), g = Math.sin(f * 91.7 + h) * 1000; g = g - Math.floor(g);
    return [f * 40, g * 40, (f + g) * 20];
  }
  // Wind blows FROM dir (degrees from north). Clouds move the other way. Returns km per second, east and south (+z).
  function vel(w) { var d = GC.rad(w.d); return [-Math.sin(d) * w.s / 1000, Math.cos(d) * w.s / 1000]; }
  function toward(w) { return GC.compass(w.d + 180); }

  GC.Sky = {};
  GC.Sky.build = function (wx, place, utcMs, ov) {
    ov = ov || {};
    var R = [];                                  // the reading, line by line
    var code = wx.code || 0;
    var cape = wx.cape == null ? (code >= 95 ? 2000 : code >= 80 && code <= 82 ? 900 : 100) : wx.cape;
    var td = wx.td == null ? wx.t - (100 - wx.rh) / 5 : wx.td;
    var spread = Math.max(wx.t - td, 0);
    var lcl = clamp(0.125 * spread, 0.25, 3.5);
    var covLow = ov.low != null ? ov.low : wx.low, covMid = ov.mid != null ? ov.mid : wx.mid, covHigh = ov.high != null ? ov.high : wx.high;
    var nxt = wx.next || { low: wx.low, mid: wx.mid, high: wx.high };
    var storm = code >= 95, steady = (code >= 51 && code <= 67) || (code >= 71 && code <= 77), showers = code >= 80 && code <= 86, fog = code === 45 || code === 48;

    // ----- low layer -----
    var lowKey, why;
    if (storm || (cape > 1800 && wx.precip > 1)) { lowKey = 'cumulonimbus'; why = 'a thunderstorm is reported and the air is very unstable (CAPE ' + Math.round(cape) + ' J/kg)'; }
    else if (steady && covLow > 0.6) { lowKey = 'nimbostratus'; why = 'steady rain or snow is falling from a full layer'; }
    else if (showers || cape > 800) { lowKey = 'congestus'; why = 'the air is unstable (CAPE ' + Math.round(cape) + ' J/kg), so heaps grow tall'; }
    else if (fog) { lowKey = 'stratus'; why = 'fog is reported'; }
    else if (covLow >= 0.85) {
      if (wx.wind.s < 3 || spread < 2) { lowKey = 'stratus'; why = 'the layer is full, the air is calm and nearly saturated'; }
      else { lowKey = 'stratocumulus'; why = 'the layer is nearly full and wind stirs it into lumps'; }
    }
    else if (covLow >= 0.6) { lowKey = 'stratocumulus'; why = 'more than half the low sky is covered, without strong lift'; }
    else { lowKey = 'cumulus'; why = 'the low sky is partly covered and the air is only mildly unstable'; }
    if (ov.lowType && LOW[ov.lowType]) { lowKey = ov.lowType; why = 'chosen by hand in Adjust'; }
    var lowT = LOW[lowKey];
    if ((lowKey === 'cumulonimbus' || lowKey === 'congestus') && ov.low == null) covLow = Math.max(covLow, lowKey === 'cumulonimbus' ? 0.6 : 0.35);
    var lowBase = fog ? 0.03 : lowKey === 'nimbostratus' ? Math.max(0.3, lcl * 0.6) : lowKey === 'stratus' ? Math.min(lcl, 0.6) : lcl;
    var tropo = 8.5 + 7 * Math.pow(Math.cos(GC.rad(place.lat)), 2);          // rough top of the weather, km
    var lowTop = lowKey === 'cumulonimbus' ? tropo - 2 : lowBase + lowT.thick + (lowKey === 'cumulus' ? clamp(cape / 1500, 0, 0.6) : 0);

    // ----- mid layer -----
    var midKey = covMid >= 0.7 ? 'altostratus' : 'altocumulus', midT = MID[midKey];
    var midBase = clamp((wx.frz == null ? 3.2 : wx.frz) + 0.5, 2.5, 5.5);
    var midOn = covMid > 0.02;
    if (midOn && lowTop > midBase - 0.3) {
      if (lowKey === 'cumulonimbus' || lowKey === 'nimbostratus') midOn = false;      // the deep cloud already fills the mid levels
      else lowTop = Math.max(lowBase + 0.4, midBase - 0.3);
    }
    var midTop = midBase + midT.thick;

    // ----- high layer -----
    var w300 = wx.w300 || { s: wx.wind.s * 4, d: wx.wind.d + 30 };
    var highKey = covHigh >= 0.8 ? 'cirrostratus' : (covHigh >= 0.5 && w300.s < 15) ? 'cirrocumulus' : 'cirrus', highT = HIGH[highKey];
    var highH = Math.max(tropo - 2.5, (midOn ? midTop : lowTop) + 0.8);
    if (lowKey === 'cumulonimbus') highH = lowTop + 0.8;

    // ----- wind per layer -----
    var wLow = wx.w850 || wx.w100 || { s: wx.wind.s * 1.5, d: wx.wind.d + 15 };
    var wMid = wx.w500 || { s: wx.wind.s * 2.5, d: wx.wind.d + 25 };
    if (ov.windS != null) { var k = ov.windS / Math.max(wLow.s, 0.1); wLow = { s: ov.windS, d: wLow.d }; wMid = { s: wMid.s * k, d: wMid.d }; w300 = { s: w300.s * k, d: w300.d }; }
    if (ov.windD != null) { var turn = ov.windD - wLow.d; wLow = { s: wLow.s, d: ov.windD }; wMid = { s: wMid.s, d: wMid.d + turn }; w300 = { s: w300.s, d: w300.d + turn }; }
    var vLow = vel(wLow), vMid = vel(wMid), vHigh = vel(w300);

    // ----- haze -----
    var hz = 1, hzWhy = 'no air-quality reading, a clean sky is assumed';
    if (wx.aod != null) { hz = 0.6 + wx.aod * 6.5; hzWhy = 'aerosol optical depth ' + wx.aod.toFixed(2); }
    else if (wx.pm25 != null) { hz = 0.7 + wx.pm25 / 12; hzWhy = 'PM2.5 ' + Math.round(wx.pm25) + ' µg/m³'; }
    else if (wx.vis != null) { hz = clamp(40 / Math.max(wx.vis, 1), 0.8, 12); hzWhy = 'visibility ' + Math.round(wx.vis) + ' km'; }
    if (wx.rh > 85) hz *= 1 + (wx.rh - 85) / 20;
    if (fog) hz = Math.max(hz, 18);
    if (ov.haze != null) { hz = ov.haze; hzWhy = 'set by hand in Adjust'; }
    hz = clamp(hz, 0.4, 30);
    var dirty = clamp((wx.pm25 == null ? 0 : wx.pm25) / 90, 0, 1), dusty = clamp((wx.dust == null ? 0 : wx.dust) / 150, 0, 1);
    var tint = [1, lerp(lerp(1, 0.92, dirty), 0.85, dusty), lerp(lerp(1, 0.80, dirty), 0.62, dusty)];
    var rain = (lowKey === 'nimbostratus' || lowKey === 'cumulonimbus') ? clamp(wx.precip / 4, 0.3, 1) : (wx.precip > 0.5 ? 0.25 : 0);

    var seed = seedFrom(place, utcMs, ov.shuffle);
    function rnd(k) { var a = Math.sin(seed[0] * 12.9898 + seed[1] * 78.233 + k * 37.719) * 43758.5453; return a - Math.floor(a); }   // repeatable dice
    // ----- a mixed sky: some low cells taller than the rest, ripples among the high streaks -----
    var vary = [0, 1], mixNote = '';
    if (lowKey === 'cumulus' && cape > 250) {
      var tall = Math.min(lowT.thick * (1.6 + cape / 700), 3.2), share = clamp((cape - 150) / 2500, 0.06, 0.3) * (0.7 + 0.6 * rnd(1));
      vary = [share, (lowTop - lowBase) / tall]; lowTop = lowBase + tall; mixNote = ', with about ' + pct(share) + ' of the heaps growing taller';
    } else if (lowKey === 'stratocumulus') { vary = [0.2 + 0.15 * rnd(2), 0.7]; lowTop = lowBase + (lowTop - lowBase) / 0.7; mixNote = ', thicker in places'; }
    else if (lowKey === 'congestus') { vary = [0.35 + 0.2 * rnd(3), 0.38]; mixNote = ', towers among smaller cumulus'; }
    else if (lowKey === 'cumulonimbus') { vary = [0.32 + 0.16 * rnd(4), 0.28]; mixNote = ', storm towers among lower cumulus'; }
    if (midOn && lowTop > midBase - 0.3 && lowKey !== 'cumulonimbus' && lowKey !== 'congestus') lowTop = Math.max(lowBase + 0.4, midBase - 0.3);
    if (midOn && lowTop > midBase - 0.3) midOn = false;
    highH = Math.max(highH, (midOn ? midTop : lowTop) + 0.8);
    var cmix = (highKey === 'cirrus' && covHigh > 0.3 && rnd(5) < 0.6) ? 0.5 + 0.4 * rnd(6) : 0;

    // ----- what falls: rain, snow or sleet -----
    var pKind = 0, pWhy = '';
    if (ov.precip === 'none') pKind = 0;
    else if (ov.precip === 'rain') { pKind = 1; pWhy = 'set by hand'; }
    else if (ov.precip === 'snow') { pKind = 2; pWhy = 'set by hand'; }
    else if (ov.precip === 'sleet') { pKind = 3; pWhy = 'set by hand'; }
    else if (wx.precip > 0.05 || steady || showers || storm) {
      if ((code >= 71 && code <= 77) || code === 85 || code === 86) { pKind = 2; pWhy = 'the report says snow'; }
      else if (code === 56 || code === 57 || code === 66 || code === 67) { pKind = 3; pWhy = 'the report says freezing rain'; }
      else if (wx.t <= 0.5) { pKind = 2; pWhy = 'the air at the ground is ' + wx.t.toFixed(0) + '°C'; }
      else if (wx.t < 2.5) { pKind = 3; pWhy = 'the air at the ground is just above freezing (' + wx.t.toFixed(0) + '°C)'; }
      else { pKind = 1; pWhy = 'the air at the ground is ' + wx.t.toFixed(0) + '°C'; }
    }
    var pStrength = ov.precipI != null ? ov.precipI : clamp(0.3 + wx.precip / 6, 0.3, 1);
    var pShare = (lowKey === 'nimbostratus' || lowKey === 'stratus') ? 1 : (lowKey === 'cumulonimbus' || lowKey === 'congestus') ? 0.45 : 0.6;
    if (pKind && covLow < 0.05) { covLow = 0.5; }                 // something has to carry the rain
    var snowLine = pKind === 2 ? -1 : (wx.frz != null ? wx.frz : Math.max(wx.t, 0) / 6.5) + 0.2;
    var arid = clamp((52 - wx.rh) / 40, 0, 1);
    // Sea state: the marine model when it has this spot (waves, period, direction, tide), otherwise the wind alone (0.022 x wind squared).
    var mar = (wx.marine && wx.marine.wave != null && !ov.noMarine) ? wx.marine : null;
    var waveM = mar ? clamp(mar.wave, 0.05, 14) : clamp(0.022 * wx.wind.s * wx.wind.s, 0.15, 5);    // significant wave height, metres
    var seaFrom = wx.wind.d;
    if (mar) { var sw = mar.swell && mar.swell.h != null ? mar.swell.h : 0, ww = mar.windwave && mar.windwave.h != null ? mar.windwave.h : 0;
      seaFrom = (sw >= ww && mar.swell && mar.swell.dir != null) ? mar.swell.dir : (mar.dir != null ? mar.dir : wx.wind.d); }
    var seaPeriod = mar && mar.period ? mar.period : (mar && mar.swell && mar.swell.period ? mar.swell.period : 0);
    var seaFreq = seaPeriod > 1 ? 2 * Math.PI / (1.56 * seaPeriod * seaPeriod) : 0;          // radians per metre: deep-water wavelength = 1.56 T squared
    var tideM = mar && mar.tide != null ? mar.tide : 0;
    var v10 = vel({ s: 1, d: seaFrom }), windHeading = Math.atan2(v10[1], v10[0]);

    var flashy = lowKey === 'cumulonimbus' || !!ov.lightning;

    // ----- the reading -----
    var sp = GC.Sun.pos(utcMs, place.lat, place.lon);
    R.push({ icon: '☀️', head: 'Sun', text: (sp.el >= 0 ? Math.abs(sp.el).toFixed(0) + '° above' : Math.abs(sp.el).toFixed(0) + '° below') + ' the horizon, toward ' + GC.compass(sp.az) + ' (' + Math.round(sp.az) + '°). ' + GC.Sun.phase(sp.el) + '.' });
    if (covLow > 0.02) R.push({ icon: '☁️', head: 'Low: ' + lowT.name, text: pct(covLow) + ' of the sky' + mixNote + ', from ' + km(lowBase) + ' to ' + km(lowTop) + '. Why this type: ' + why + '. Base height: air ' + wx.t.toFixed(0) + '°C and dew point ' + td.toFixed(0) + '°C are ' + spread.toFixed(0) + '° apart, × 125 m ≈ ' + km(0.125 * spread) + '.' });
    else R.push({ icon: '☁️', head: 'Low', text: 'No low cloud in the data.' });
    if (midOn) R.push({ icon: '🌥️', head: 'Mid: ' + midT.name, text: pct(covMid) + ' at ' + km(midBase) + '. ' + (midKey === 'altostratus' ? 'Over 70% reads as one sheet.' : 'Under 70% reads as broken clumps.') });
    else if (covMid > 0.02) R.push({ icon: '🌥️', head: 'Mid', text: pct(covMid) + ' in the data, already inside the deep ' + lowT.name.toLowerCase() + '.' });
    if (covHigh > 0.02) R.push({ icon: '🪶', head: 'High: ' + highT.name, text: pct(covHigh) + ' at ' + km(highH) + ', ice crystals. Wind up there ' + Math.round(w300.s) + ' m/s.' });
    R.push({ icon: '💨', head: 'Wind', text: 'Low clouds drift toward ' + toward(wLow) + ' at ' + wLow.s.toFixed(0) + ' m/s' + (wx.w850 ? ' (measured near 1.5 km)' : ' (estimated from the ground wind)') + '. In 15 minutes they move ' + (wLow.s * 0.9).toFixed(1) + ' km; the high layer moves ' + (w300.s * 0.9).toFixed(0) + ' km.' });
    R.push({ icon: '🌫️', head: 'Haze', text: hzWhy + (wx.pm25 != null && wx.aod != null ? ', PM2.5 ' + Math.round(wx.pm25) + ' µg/m³' : '') + '. Haze is ' + hz.toFixed(1) + '× a clean sky' + (dirty > 0.3 ? ', tinted brown by pollution.' : dusty > 0.3 ? ', tinted by dust.' : '.') });
    if (wx.precip > 0.1 || storm) R.push({ icon: storm ? '⛈️' : '🌧️', head: storm ? 'Storm' : 'Rain', text: wx.precip.toFixed(1) + ' mm in the hour' + (storm ? ', thunderstorm reported. Lightning flickers while the time lapse plays. Rotation inside a storm, wall clouds and tornado funnels are not in the data and are not drawn.' : '.') });
    if (pKind) R.push({ icon: pKind === 2 ? '🌨️' : '🌧️', head: ['', 'Rain', 'Snow', 'Sleet'][pKind] + ' is drawn', text: 'Why this kind: ' + pWhy + '. It falls under ' + (pShare >= 1 ? 'the whole layer' : 'the thicker parts of the cloud') + ', slanted by the wind.' });
    if (cmix > 0) R.push({ icon: '🪶', head: 'High mix', text: 'Patches of small ripples (cirrocumulus) sit among the cirrus streaks.' });
    if (ov.feature) R.push({ icon: '🌪️', head: 'Made-up: ' + ({ tornado: 'tornado', waterspout: 'waterspout', microburst: 'microburst' })[ov.feature.kind], text: 'Placed by hand from the Weather maker. No weather feed reports these, so this one is drawn from how they are described, not from data.' });
    function f1(x) { return x == null ? '?' : x.toFixed(1); }
    if (mar) R.push({ icon: '🌊', head: 'Sea (marine model)', text: 'Waves ' + f1(mar.wave) + ' m' + (mar.period ? ', one every ' + Math.round(mar.period) + ' s, about ' + Math.round(1.56 * mar.period * mar.period) + ' m apart' : '') +
      (mar.dir != null ? ', coming from ' + GC.compass(mar.dir) : '') + '. Swell ' + f1(mar.swell && mar.swell.h) + ' m' + (mar.swell && mar.swell.dir != null ? ' from ' + GC.compass(mar.swell.dir) : '') + ', wind waves ' + f1(mar.windwave && mar.windwave.h) + ' m. ' +
      (mar.tide != null ? 'Tide ' + (mar.tide >= 0 ? '+' : '') + mar.tide.toFixed(2) + ' m against mean sea level: the water is drawn that much higher or lower. ' : 'No tide value for this spot; the water stays at mean sea level. ') +
      'One wave train is drawn (' + (seaFrom === wx.wind.d ? 'from the wind' : (GC.compass(seaFrom) + ', the stronger of swell and wind waves')) + '). Model cells are a few km wide, so a small bay is not told apart from open water.' });
    else R.push({ icon: '🌊', head: 'Sea', text: 'Wind ' + wx.wind.s.toFixed(0) + ' m/s at the ground gives waves about ' + waveM.toFixed(1) + ' m high (0.022 × wind²). No marine-model data here (inland, or not loaded), so tide and swell are not drawn.' });
    R.push({ icon: '🌡️', head: 'Air', text: wx.t.toFixed(0) + '°C, humidity ' + Math.round(wx.rh) + '%' + (wx.frz != null ? ', freezing level ' + km(wx.frz) : '') + '.' });

    var model = {
      wx: wx, place: place, utcMs: utcMs, reading: R,
      types: { low: lowKey, mid: midKey, high: highKey }, precipKind: ['none', 'rain', 'snow', 'sleet'][pKind], vary: vary, cmix: cmix,
      summary: { low: covLow, mid: midOn ? covMid : 0, high: covHigh, lowBase: lowBase, lowTop: lowTop, midBase: midBase, highH: highH, haze: hz, windS: wLow.s, windD: ((wLow.d % 360) + 360) % 360 }
    };

    model.at = function (simT, camAlt) {
      var ms = utcMs + simT * 1000, p = GC.Sun.pos(ms, place.lat, place.lon), s = GC.Sun.dir(p), f = simT / 3600;
      var cl = ov.low != null ? covLow : clamp(covLow + (nxt.low - wx.low) * f, 0, 1);
      var cm = !midOn ? 0 : ov.mid != null ? covMid : clamp(covMid + (nxt.mid - wx.mid) * f, 0, 1);
      var ch = ov.high != null ? covHigh : clamp(covHigh + (nxt.high - wx.high) * f, 0, 1);
      var grey = function (c, k) { var l = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; return c.map(function (v) { return v + (l - v) * k; }); };
      var sun0 = grey(GC.Atmo.sunAt((lowBase + Math.min(lowTop, lowBase + 2)) / 2, s, hz), 0.6 * cl * cl).map(function (v) { return v * (1 - 0.45 * cm) * (1 - 0.25 * ch); });
      var sun1 = GC.Atmo.sunAt(midBase, s, hz).map(function (v) { return v * (1 - 0.25 * ch); });
      var sunC = GC.Atmo.sunAt(highH, s, hz);
      var amb = GC.Atmo.ambient(1.0, s, hz, tint);
      var night = clamp((-4 - p.el) / 10, 0, 1);
      var hor = [0, 0, 0];
      for (var hk = 0; hk < 4; hk++) { var ha = hk * Math.PI / 2 + 0.6, hc = GC.Atmo.sky(0.002, [Math.sin(ha) * 0.9945, 0.1045, -Math.cos(ha) * 0.9945], s, hz, tint); hor[0] += hc[0] / 4; hor[1] += hc[1] / 4; hor[2] += hc[2] / 4; }
      var up = Math.max(s[1], 0);
      var overcast = 1 - 0.5 * Math.max(cl, cm * 0.7);
      var ambTop = amb.map(function (v, i) { return v * 1.15 * overcast + sun0[i] * 0.012 + [0.00022, 0.0004, 0.0008][i]; });
      var ambBot = amb.map(function (v, i) { return v * 0.5 * overcast + sun0[i] * up * 0.02 + night * dirty * dirty * [0.002, 0.0012, 0.0005][i] + [0.00015, 0.0002, 0.00035][i]; });
      var lum = function (c) { return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
      var scene = lum(amb) + 0.035 * lum(sun0) * (0.15 + up) + 0.0012;
      var fall = Math.exp(-(camAlt || 0) / 6);
      return {
        sunEl: p.el, sunAz: p.az, sunDir: s, sun0: sun0, sun1: sun1, sunC: sunC, ambTop: ambTop, ambBot: ambBot,
        haze: hz, tint: tint, fogK: [(0.0040 + 0.0030 * hz) * fall, (0.0065 + 0.0031 * hz) * fall, (0.0110 + 0.0033 * hz) * fall], ms: GC.Atmo.ms(s),
        L0a: [lowBase, lowTop, cl > 0.02 ? Math.pow(cl, 0.85) : 0, lowT.dens], L0b: [lowT.cell, lowT.soft, lowT.taper, lowT.anvil], L0w: [vLow[0] * simT, vLow[1] * simT, 0, lowT.detail],
        L1a: [midBase, midTop, cm > 0.02 ? Math.pow(cm, 0.85) : 0, midT.dens], L1b: [midT.cell, midT.soft, midT.taper, midT.anvil], L1w: [vMid[0] * simT, vMid[1] * simT, 0, midT.detail],
        C: [highH, ch > 0.02 ? ch : 0, highT.stretch, highT.opacity], Cw: [vHigh[0] * simT, vHigh[1] * simT, highT.scale, Math.atan2(vHigh[1], vHigh[0])],
        regionMix: (ov.low == null && ov.mid == null && ov.high == null && !ov.noRegion) ? 1 : 0, midOn: midOn,
        vary: vary, cmix: cmix, precip: [pKind, pKind ? pStrength : 0, pShare, clamp(wx.wind.s / 12, 0, 1.2)],
        terr: [snowLine, arid], sea: [waveM / 1000, windHeading, wx.wind.s, seaFreq, tideM / 1000],
        skyZen: GC.Atmo.sky(0.002, [0, 1, 0], s, hz, tint), skyHor: hor,
        seed: seed, evolve: simT / 900 * 0.55, exposure: clamp(0.26 / scene, 0.35, 110), night: night, rain: rain, flashy: flashy
      };
    };
    return model;
  };
})();
