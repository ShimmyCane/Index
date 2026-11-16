// Felix Gear Wars: all drawing. Everything is painted in code (no image files).
// A style (illuminated manuscript, Bayeux tapestry, woodblock, Art Nouveau, stained glass) is a colour filter,
// a line weight, a page frame and a texture. Every colour goes through Art.C() so one switch restyles the game.
(function () {
  'use strict';
  var F = globalThis.FGW;
  var Art = {}, TAU = Math.PI * 2;

  // ---- styles ------------------------------------------------------------------------------
  var THEMES = {
    manuscript: { name: 'Illuminated manuscript', short: 'Manuscript', ink: '#2b1a12', line: 1, sat: 1.05, light: 0, tint: '#f1dfb0', tintAmt: 0.1,
      gold: '#d6a21e', gold2: '#f6dc78', paper: '#f4e7c4', paper2: '#e6d09a', panel: '#f8edd0', panel2: '#e8d29c', text: '#2b1a12', btn: '#f0c85a', dark: false,
      ally: '#2f55b5', enemy: '#b3402f' },
    tapestry: { name: 'Bayeux tapestry', short: 'Tapestry', ink: '#3a2a20', line: 1.15, sat: 0.62, light: -0.03, tint: '#d9c79b', tintAmt: 0.2,
      gold: '#b99a45', gold2: '#d8c06c', paper: '#e4d6b0', paper2: '#d2c094', panel: '#eadcb6', panel2: '#d6c598', text: '#3a2a20', btn: '#d9b866', dark: false,
      ally: '#3c6b8f', enemy: '#a2493a' },
    woodblock: { name: 'Woodblock print', short: 'Woodblock', ink: '#1c2748', line: 1.05, sat: 0.8, light: 0.02, tint: '#2c3d73', tintAmt: 0.09,
      gold: '#c98c2f', gold2: '#e6b858', paper: '#f1e6cf', paper2: '#e1d2b2', panel: '#f4ead6', panel2: '#dfd0ae', text: '#1c2748', btn: '#e8b95a', dark: false,
      ally: '#25498c', enemy: '#c5392c' },
    nouveau: { name: 'Art Nouveau', short: 'Nouveau', ink: '#5e4630', line: 0.85, sat: 0.8, light: 0.1, tint: '#f1dfc8', tintAmt: 0.16,
      gold: '#c79b3b', gold2: '#ecd38a', paper: '#f1e4d0', paper2: '#e4cfb2', panel: '#f6ebd9', panel2: '#e6d3b6', text: '#4d3826', btn: '#e8c98a', dark: false,
      ally: '#5f8f86', enemy: '#b5655a' },
    stained: { name: 'Stained glass', short: 'Glass', ink: '#0e0c14', line: 1.7, sat: 1.28, light: -0.04, tint: '#101030', tintAmt: 0.0,
      gold: '#e3b42c', gold2: '#ffe27a', paper: '#2b2540', paper2: '#3a3256', panel: '#352d52', panel2: '#241e3b', text: '#fdf1d4', btn: '#e3a12c', dark: true,
      ally: '#2a5fd1', enemy: '#c93a3a' },
  };
  THEMES.persian = { name: 'Persian miniature', short: 'Persian', ink: '#1f2a44', line: 1, sat: 1.15, light: 0, tint: '#f1d7a0', tintAmt: 0.08,
    gold: '#d9a521', gold2: '#f7dd7e', paper: '#f2e2b8', paper2: '#e0c88e', panel: '#f7ebc9', panel2: '#e5cf98', text: '#1f2a44', btn: '#e8bf55', dark: false,
    ally: '#1f8a8a', enemy: '#b0302f' };
  THEMES.egyptian = { name: 'Egyptian tomb painting', short: 'Egyptian', ink: '#3a2414', line: 1.15, sat: 0.95, light: 0.02, tint: '#e6c27a', tintAmt: 0.12,
    gold: '#c99a2e', gold2: '#efd078', paper: '#eedcae', paper2: '#dcc48c', panel: '#f3e6bf', panel2: '#e0cc92', text: '#3a2414', btn: '#e3b94f', dark: false,
    ally: '#2a6fb0', enemy: '#b6502a' };
  THEMES.chinese = { name: 'Chinese silk painting', short: 'Chinese', ink: '#232323', line: 0.9, sat: 0.6, light: 0.05, tint: '#d8d1b6', tintAmt: 0.2,
    gold: '#b8923a', gold2: '#dcc476', paper: '#f0e8d2', paper2: '#e0d6b8', panel: '#f4edd9', panel2: '#e2d8bb', text: '#232323', btn: '#e4c46e', dark: false,
    ally: '#2b7a70', enemy: '#b0302a' };
  THEMES.aztec = { name: 'Aztec codex', short: 'Aztec', ink: '#1b1b1b', line: 1.15, sat: 1.1, light: 0, tint: '#e6c88a', tintAmt: 0.1,
    gold: '#d4a021', gold2: '#f0cd6a', paper: '#e8d7b0', paper2: '#d6c08e', panel: '#efe0bb', panel2: '#ddc895', text: '#2a1c10', btn: '#e0b04a', dark: false,
    ally: '#1f8a7a', enemy: '#b8402a' };
  THEMES.indian = { name: 'Mughal miniature', short: 'Indian', ink: '#3a1f12', line: 0.95, sat: 1.2, light: 0.01, tint: '#f0c98a', tintAmt: 0.08,
    gold: '#d29a1e', gold2: '#f5d66c', paper: '#f3dfb4', paper2: '#e3c68c', panel: '#f8ebcb', panel2: '#e8cf96', text: '#3a1f12', btn: '#e9b94d', dark: false,
    ally: '#2a7f62', enemy: '#b32c3a' };
  THEMES.spanish = { name: 'Spanish illumination', short: 'Spanish', ink: '#2f1d14', line: 1.05, sat: 1.1, light: 0, tint: '#e8b878', tintAmt: 0.1,
    gold: '#cf9a22', gold2: '#f3d36a', paper: '#f0dcb4', paper2: '#e0c28a', panel: '#f6e8c8', panel2: '#e6cc96', text: '#2f1d14', btn: '#e8b84a', dark: false,
    ally: '#c9941a', enemy: '#a8342a' };
  // Each culture renames the fighters and changes headgear and blades, so the army looks like the place it comes from.
  var CULTURES = {
    france: { label: 'French', star: 'knight', names: { spearman: 'Pikeman', archer: 'Archer', fighter: 'Man-at-arms', assassin: 'Brigand', knight: 'Chevalier', tank: 'Armoured guard', mage: 'Alchemist', catapult: 'Trebuchet' }, head: {} },
    norman: { names: { spearman: 'Fyrdman', archer: 'Bowman', fighter: 'Housecarl', assassin: 'Scout', knight: 'Horseman', tank: 'Shield wall', mage: 'Seer', catapult: 'Siege engine' }, head: {} },
    spain: { label: 'Spanish', star: 'tank', names: { spearman: 'Peon', archer: 'Ballestero', fighter: 'Rodelero', assassin: 'Almogavar', knight: 'Caballero', tank: 'Conquistador', mage: 'Alquimista', catapult: 'Bombard' },
      head: { spearman: 'morion', archer: 'montera', fighter: 'morion', assassin: 'beret', knight: 'morion', tank: 'morionBig', mage: 'beret' } },
    aztec: { label: 'Aztec', star: 'fighter', names: { spearman: 'Spear warrior', archer: 'Atlatl thrower', fighter: 'Jaguar warrior', assassin: 'Eagle scout', knight: 'Eagle warrior', tank: 'Shield bearer', mage: 'Priest', catapult: 'Stone thrower' },
      head: { spearman: 'feather', archer: 'feather', fighter: 'jaguar', assassin: 'feather', knight: 'eagleHelm', tank: 'jaguar', mage: 'quetzal' }, blade: 'macuahuitl' },
    india: { label: 'Indian', star: 'catapult', names: { spearman: 'Bhala guard', archer: 'Dhanush archer', fighter: 'Talwar fighter', assassin: 'Swift scout', knight: 'Rajput rider', tank: 'Shield guard', mage: 'Yogi', catapult: 'Mughal cannon' },
      head: { spearman: 'pagri', archer: 'pagri', fighter: 'pagri', assassin: 'wrap', knight: 'aventail', tank: 'pagriBig', mage: 'yogi' }, blade: 'scimitar' },
    japan: { label: 'Japanese', star: 'assassin', names: { spearman: 'Ashigaru', archer: 'Yumi archer', fighter: 'Samurai', assassin: 'Ninja', knight: 'Mounted samurai', tank: 'Armoured guard', mage: 'Onmyoji', catapult: 'Siege cannon' },
      head: { spearman: 'jingasa', archer: 'jingasa', fighter: 'kabuto', assassin: 'ninja', knight: 'kabuto', tank: 'kabutoBig', mage: 'eboshi' }, blade: 'katana' },
    persia: { label: 'Persian', star: 'mage', names: { spearman: 'Nayza guard', archer: 'Kaman archer', fighter: 'Swordsman', assassin: 'Shadow scout', knight: 'Savar rider', tank: 'Armoured guard', mage: 'Magus', catapult: 'Manjaniq' },
      head: { spearman: 'kulah', archer: 'turban', fighter: 'turban', assassin: 'ninja', knight: 'kulah', tank: 'kulahHelm', mage: 'turban' }, blade: 'scimitar' },
    egypt: { label: 'Egyptian', star: 'spearman', names: { spearman: 'Spearman', archer: 'Bowman', fighter: 'Khopesh fighter', assassin: 'Desert scout', knight: 'Charioteer', tank: 'Shield bearer', mage: 'Priest', catapult: 'Stone hurler' },
      head: { spearman: 'khat', archer: 'khat', fighter: 'nemes', assassin: 'wrap', knight: 'nemes', tank: 'nemes', mage: 'priest' }, blade: 'khopesh' },
    china: { label: 'Chinese', star: 'archer', names: { spearman: 'Spear guard', archer: 'Crossbowman', fighter: 'Dao fighter', assassin: 'Shadow sword', knight: 'Cavalry', tank: 'Iron guard', mage: 'Taoist', catapult: 'Trebuchet' },
      head: { spearman: 'conical', archer: 'conical', fighter: 'topknot', assassin: 'ninja', knight: 'tangHelm', tank: 'tangHelmBig', mage: 'taoist' }, blade: 'dao' },
  };
  THEMES.manuscript.culture = CULTURES.france; THEMES.tapestry.culture = CULTURES.norman; THEMES.woodblock.culture = CULTURES.japan; THEMES.persian.culture = CULTURES.persia;
  THEMES.egyptian.culture = CULTURES.egypt; THEMES.chinese.culture = CULTURES.china; THEMES.aztec.culture = CULTURES.aztec; THEMES.indian.culture = CULTURES.india; THEMES.spanish.culture = CULTURES.spain;
  Art.specialty = function () { var cu = Art.theme.culture; return (cu && cu.star) || null; };
  Art.cultureLabel = function () { var cu = Art.theme.culture; return (cu && cu.label) || null; };
  Art.unitName = function (type) {
    var cu = Art.theme.culture, n = cu && cu.names && cu.names[type];
    return n || (F.gearInfo(type) || {}).name || type;
  };
  Art.THEMES = THEMES; Art.theme = THEMES.manuscript; Art.themeKey = 'manuscript';
  var cache = {};
  function hexRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]; return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
  function rgbHex(c) { return '#' + c.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  function mix(a, b, t) { var A = hexRgb(a), B = hexRgb(b); return rgbHex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]); }
  Art.mix = mix;
  function toHsl(c) {
    var r = c[0] / 255, g = c[1] / 255, b = c[2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), h = 0, s = 0, l = (mx + mn) / 2;
    if (mx !== mn) { var d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; }
    return [h, s, l];
  }
  function hsl2(p, q, t) { if (t < 0) t += 1; if (t > 1) t -= 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; }
  function fromHsl(h, s, l) {
    if (s === 0) return [l * 255, l * 255, l * 255];
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    return [hsl2(p, q, h + 1 / 3) * 255, hsl2(p, q, h) * 255, hsl2(p, q, h - 1 / 3) * 255];
  }
  // the colour filter of the current style
  Art.C = function (hex) {
    var key = Art.themeKey + hex, v = cache[key]; if (v) return v;
    var T = Art.theme, hsl = toHsl(hexRgb(hex));
    hsl[1] = Math.min(1, hsl[1] * T.sat); hsl[2] = Math.max(0, Math.min(1, hsl[2] + T.light));
    var out = rgbHex(fromHsl(hsl[0], hsl[1], hsl[2]));
    if (T.tintAmt) out = mix(out, T.tint, T.tintAmt);
    cache[key] = out; return out;
  };
  Art.setTheme = function (key) {
    Art.themeKey = THEMES[key] ? key : 'manuscript'; Art.theme = THEMES[Art.themeKey]; cache = {}; frames = {};
    Art.ink = Art.theme.ink; Art.lw = 2.6 * Art.theme.line;
    var r = document.documentElement.style, T = Art.theme;
    r.setProperty('--paper', T.paper); r.setProperty('--paper2', T.paper2); r.setProperty('--panel', T.panel); r.setProperty('--panel2', T.panel2);
    r.setProperty('--ink', T.text); r.setProperty('--gold', T.gold); r.setProperty('--gold2', T.gold2); r.setProperty('--btn', T.btn);
    r.setProperty('--line', Math.max(2, Math.round(3 * T.line)) + 'px');
  };
  Art.setTheme('manuscript');

  // ---- small helpers -----------------------------------------------------------------------
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  Art.rr = rr;
  function inkStyle(c) { c.strokeStyle = Art.ink; c.lineWidth = Art.lw; c.lineJoin = 'round'; c.lineCap = 'round'; }
  function fillStroke(c, col) { c.fillStyle = col; c.fill(); c.stroke(); }
  function seg(c, x1, y1, x2, y2, w, col) {
    c.lineCap = 'round'; c.strokeStyle = Art.ink; c.lineWidth = w + Art.lw * 1.5; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
    c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.strokeStyle = Art.ink; c.lineWidth = Art.lw;
  }
  function circ(c, x, y, r, col) { c.beginPath(); c.arc(x, y, r, 0, TAU); fillStroke(c, col); }
  function poly(c, pts, col) { c.beginPath(); c.moveTo(pts[0], pts[1]); for (var i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); fillStroke(c, col); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t); }

  // ---- fighters ----------------------------------------------------------------------------
  var HATS = ['#e7b53c', '#4b8f6a', '#7b4aa0', '#d87a35', '#2e8a99'];
  var SCARF = ['#f0d04a', '#e9709a', '#59b3d9', '#8ac35a', '#f2f0e8'];
  var BOOT = ['#6b4528', '#2d2d3a', '#8a3b2e', '#3c5a3a', '#4a3a6b'];
  function palette(u) {
    var C = Art.C, en = u.side === 'enemy', k = u.id % 5;
    return en ? { tunic: C(Art.theme.enemy), trim: C('#e0b34a'), skin: C(['#f1c9a0', '#e3b186', '#d79c72', '#f5d5b4', '#c98c66'][k]),
      hat: C(HATS[k]), scarf: C(SCARF[(k + 2) % 5]), boot: C(BOOT[k]), steel: C('#a8a4a0'), dark: C('#4a2420'), cloth: C('#7a2d24') }
      : { tunic: C(Art.theme.ally), trim: C('#e8b923'), skin: C(['#f3d0a8', '#e8b98d', '#d9a37a', '#f6dcc0'][u.id % 4]), lvl: u.level,
        hat: C('#e8b923'), scarf: C('#e8b923'), boot: C('#5a3a22'), steel: C(['#c3c9d4', '#e6ebf5', '#f0d98a', '#ffd75a'][Math.min(3, (u.level || 1) - 1)]), dark: C('#1f3777'), cloth: C('#2c4a9c') };
  }
  function arm(c, sx, sy, a, w, col) {      // two-segment arm, returns the hand
    var l1 = 11, l2 = 11, ex = sx + Math.cos(a) * l1, ey = sy + Math.sin(a) * l1, b = a + 0.5;
    var hx = ex + Math.cos(b) * l2, hy = ey + Math.sin(b) * l2;
    seg(c, sx, sy, ex, ey, w, col); seg(c, ex, ey, hx, hy, w - 0.5, col);
    return { x: hx, y: hy, a: b };
  }
  function legs(c, st, o) {
    o = o || {}; var hy = o.hip || -24, sw = st.walk ? Math.sin(st.w) * 0.8 : 0, i, a, fx, fy, hx;
    for (i = 0; i < 2; i++) {
      a = i ? -sw : sw; hx = i ? -3 : 3; fx = hx + Math.sin(a) * 23; fy = hy + Math.cos(a) * 23 - (st.walk ? Math.max(0, Math.sin(st.w + (i ? Math.PI : 0))) * 4 : 0);
      seg(c, hx, hy, fx, fy, o.legW || 7, i ? st.F(st.pal.dark) : st.F(o.legCol || st.pal.cloth));
      c.beginPath(); c.ellipse(fx + 3, fy, 6, 3.4, 0, 0, TAU); fillStroke(c, st.F(st.pal.boot));
    }
  }
  function torso(c, st, o) {
    o = o || {}; var w = o.w || 24, top = o.top || -52, bot = o.bot || -23, bob = st.bob;
    c.beginPath(); c.moveTo(-w / 2 + 2, top + bob); c.quadraticCurveTo(0, top - 3 + bob, w / 2 - 2, top + bob); c.lineTo(w / 2 + 2, bot); c.lineTo(-w / 2 - 2, bot); c.closePath();
    fillStroke(c, st.F(o.col || st.pal.tunic));
    c.beginPath(); c.moveTo(-w / 2 - 2, bot - 5); c.lineTo(w / 2 + 2, bot - 5); c.lineTo(w / 2 + 2, bot - 1); c.lineTo(-w / 2 - 2, bot - 1); c.closePath(); fillStroke(c, st.F(st.pal.trim));
    if (st.enemy) {   // scarf
      c.beginPath(); c.ellipse(1, top + 3 + bob, w / 2 - 2, 4, 0, 0, TAU); fillStroke(c, st.F(st.pal.scarf));
      var fl = Math.sin(st.t * 9 + st.id) * 4;
      c.beginPath(); c.moveTo(-6, top + 3 + bob); c.quadraticCurveTo(-18, top + 8 + fl + bob, -26, top + 4 + fl * 1.5 + bob); c.lineTo(-25, top + 11 + fl * 1.5 + bob); c.quadraticCurveTo(-16, top + 12 + fl + bob, -5, top + 8 + bob); c.closePath();
      fillStroke(c, st.F(st.pal.scarf));
    }
  }
  function head(c, st, x, y, r) {
    r = r || 9.6; circ(c, x, y + st.bob, r, st.F(st.pal.skin));
    c.fillStyle = Art.ink; c.beginPath(); c.arc(x + r * 0.42, y + st.bob - 1, 1.5, 0, TAU); c.fill();       // eye
    c.beginPath(); c.arc(x + r * 0.5, y + st.bob + 3.2, 2.1, 0.2, Math.PI - 0.2); c.lineWidth = 1.4; c.stroke(); c.lineWidth = Art.lw;   // smile
    return { x: x, y: y + st.bob, r: r };
  }
  function enemyHat(c, st, h) {
    if (!st.enemy) return;
    var k = st.id % 5, col = st.F(st.pal.hat), x = h.x, y = h.y, r = h.r;
    if (k === 0) { poly(c, [x - r * 0.9, y - r * 0.5, x + r * 0.2, y - r * 2.1, x + r * 0.95, y - r * 0.5], col); circ(c, x + r * 0.2, y - r * 2.15, 2.6, st.F('#f4f0e0')); }
    else if (k === 1) { [-1, 1].forEach(function (s) { c.beginPath(); c.moveTo(x + s * r * 0.7, y - r * 0.6); c.quadraticCurveTo(x + s * r * 1.9, y - r * 0.9, x + s * r * 1.5, y - r * 2); c.quadraticCurveTo(x + s * r * 1.2, y - r * 1.1, x + s * r * 0.4, y - r * 0.5); c.closePath(); fillStroke(c, st.F('#f1ead0')); }); }
    else if (k === 2) { c.beginPath(); c.moveTo(x - r, y - r * 0.2); c.quadraticCurveTo(x, y - r * 1.4, x + r, y - r * 0.2); c.lineTo(x + r, y - r * 0.6); c.quadraticCurveTo(x, y - r * 1.7, x - r, y - r * 0.6); c.closePath(); fillStroke(c, col); var f = Math.sin(st.t * 9) * 3; c.beginPath(); c.moveTo(x - r, y - r * 0.4); c.lineTo(x - r * 2.1, y - r * 0.2 + f); c.lineTo(x - r * 1.9, y - r * 1 + f); c.closePath(); fillStroke(c, col); }
    else if (k === 3) { c.beginPath(); c.moveTo(x - r * 0.3, y - r * 0.9); c.quadraticCurveTo(x - r * 1.2, y - r * 2.6, x + r * 0.9, y - r * 2.2); c.quadraticCurveTo(x - r * 0.2, y - r * 1.9, x + r * 0.1, y - r * 0.8); c.closePath(); fillStroke(c, col); }
    else { c.beginPath(); c.ellipse(x, y - r * 0.7, r * 1.15, r * 0.55, 0, 0, TAU); fillStroke(c, col); c.beginPath(); c.moveTo(x + r * 0.2, y - r * 0.7); c.quadraticCurveTo(x + r * 1.4, y - r * 0.5, x + r * 1.5, y + r * 0.4); c.lineTo(x + r * 0.9, y + r * 0.1); c.closePath(); fillStroke(c, col); }
  }
  function steelHelm(c, st, h, plume) {
    var col = st.F(st.pal.steel);
    c.beginPath(); c.arc(h.x, h.y - 1, h.r + 1.2, Math.PI, TAU); c.lineTo(h.x + h.r + 1.2, h.y + 1); c.lineTo(h.x - h.r - 1.2, h.y + 1); c.closePath(); fillStroke(c, col);
    c.beginPath(); c.moveTo(h.x + 3, h.y - h.r); c.lineTo(h.x + 3, h.y + 4); c.lineWidth = 2.4; c.stroke(); c.lineWidth = Art.lw;     // nasal bar
    if (plume) { c.beginPath(); c.moveTo(h.x - 2, h.y - h.r - 1); c.quadraticCurveTo(h.x - 10, h.y - h.r - 12 + Math.sin(st.t * 6) * 2, h.x - 18, h.y - h.r - 3 + Math.sin(st.t * 6 + 1) * 2); c.quadraticCurveTo(h.x - 8, h.y - h.r - 5, h.x + 2, h.y - h.r + 1); c.closePath(); fillStroke(c, st.F(plume)); }
  }

  // culture headgear: returns true when it drew the head, so the caller skips its own helmet
  function cultHead(c, st, h, type) {
    var cu = Art.theme.culture, kind = cu && cu.head && cu.head[type]; if (!kind) return false;
    var x = h.x, y = h.y, r = h.r, F2 = st.F, acc = F2(st.enemy ? st.pal.hat : '#e8b923'), iron = F2(st.enemy ? '#5a5560' : '#3b3d4a'), P = st.pal;
    var big = /Big$/.test(kind) ? 1.25 : 1, cloth = F2(st.enemy ? st.pal.hat : '#f2efe6'), k;
    switch (kind) {
      case 'kabuto': case 'kabutoBig':
        poly(c, [x - r - 1, y - 2, x - r - 9 * big, y + 10, x - 2, y + 8], iron);
        c.beginPath(); c.arc(x, y - 1, (r + 1.8) * big, Math.PI, TAU); c.lineTo(x + (r + 3) * big, y + 1); c.lineTo(x - (r + 1.8) * big, y + 1); c.closePath(); fillStroke(c, iron);
        c.beginPath(); c.moveTo(x + 2, y - r * big - 1); c.quadraticCurveTo(x - 8 * big, y - r * big - 14 * big, x - 14 * big, y - r * big - 10 * big); c.moveTo(x + 2, y - r * big - 1); c.quadraticCurveTo(x + 12 * big, y - r * big - 16 * big, x + 16 * big, y - r * big - 9 * big);
        c.lineWidth = 3.2; c.strokeStyle = acc; c.stroke(); c.strokeStyle = Art.ink; c.lineWidth = Art.lw; break;
      case 'jingasa': case 'conical':
        poly(c, [x - r * 1.8, y - r * 0.1, x + 1, y - r * 2.2, x + r * 1.8, y - r * 0.1], kind === 'conical' ? F2(st.enemy ? '#a8803a' : '#d8b868') : (st.enemy ? acc : F2('#2c2c3a')));
        c.beginPath(); c.moveTo(x - r * 1.1, y - r * 0.8); c.lineTo(x + r * 1.1, y - r * 0.8); c.lineWidth = 1.4; c.stroke(); c.lineWidth = Art.lw; break;
      case 'ninja':
        c.beginPath(); c.arc(x, y, r + 2.2, 0, TAU); fillStroke(c, F2(st.enemy ? P.dark : '#2e2a44'));
        c.fillStyle = F2(P.skin); c.fillRect(x - 1, y - 4, r + 1.5, 4.5); c.fillStyle = Art.ink; c.beginPath(); c.arc(x + r * 0.45, y - 2, 1.5, 0, TAU); c.fill();
        c.beginPath(); c.moveTo(x - r, y - 4); c.lineTo(x - r - 13, y - 2 + Math.sin(st.t * 9) * 3); c.lineTo(x - r - 12, y - 8 + Math.sin(st.t * 9) * 3); c.closePath(); fillStroke(c, acc); break;
      case 'eboshi':
        poly(c, [x - 6, y - r + 1, x - 4, y - r - 20, x + 6, y - r - 15, x + r - 1, y - r + 2], F2('#25252e'));
        c.beginPath(); c.moveTo(x - 5, y - r - 6); c.lineTo(x + 7, y - r - 5); c.lineWidth = 1.6; c.strokeStyle = acc; c.stroke(); c.strokeStyle = Art.ink; c.lineWidth = Art.lw; break;
      case 'turban':
        c.beginPath(); c.ellipse(x, y - r * 0.55, r * 1.35, r * 0.85, 0, 0, TAU); fillStroke(c, cloth);
        c.beginPath(); c.arc(x, y - r * 0.4, r * 1.05, Math.PI * 1.15, Math.PI * 1.85); c.lineWidth = 1.5; c.stroke(); c.lineWidth = Art.lw;
        circ(c, x + r * 0.5, y - r * 0.9, 2.4, F2('#d63a4a')); seg(c, x + r * 0.5, y - r, x + r * 0.2, y - r * 1.9, 2, F2('#f4f0e0')); break;
      case 'kulah': case 'kulahHelm':
        poly(c, [x - r, y - r * 0.4, x - 2, y - r * 2.9, x + r, y - r * 0.4], kind === 'kulah' ? acc : iron);
        c.beginPath(); c.ellipse(x, y - r * 0.5, r * 1.15, r * 0.4, 0, 0, TAU); fillStroke(c, cloth); if (kind === 'kulahHelm') seg(c, x - 2, y - r * 2.9, x - 2, y - r * 3.4, 2.4, F2(P.steel)); break;
      case 'khat': case 'wrap':
        c.beginPath(); c.arc(x, y - 1, r + 1.4, Math.PI, TAU); c.lineTo(x + r + 1, y - 1); c.lineTo(x - r - 1, y - 1); c.closePath(); fillStroke(c, kind === 'wrap' ? F2(st.enemy ? P.dark : '#3a6ea8') : F2('#f2efe6'));
        c.beginPath(); c.moveTo(x - r, y - 4); c.lineTo(x - r - 7, y + 8); c.lineTo(x - 2, y + 4); c.closePath(); fillStroke(c, kind === 'wrap' ? F2(st.enemy ? P.dark : '#3a6ea8') : F2('#f2efe6')); break;
      case 'nemes':
        poly(c, [x - 2, y - 3, x - r - 8, y + r + 9, x + 1, y + r + 6], F2(st.enemy ? '#8a3a2a' : '#2a6fb0'));
        c.beginPath(); c.arc(x, y - 1, r + 1.8, Math.PI, TAU); c.lineTo(x + r + 2, y + 0); c.lineTo(x - r - 2, y + 0); c.closePath(); fillStroke(c, F2(st.enemy ? '#8a3a2a' : '#2a6fb0'));
        for (k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(x + k * 4, y - r - 1); c.lineTo(x + k * 4 + 1, y); c.lineWidth = 1.6; c.strokeStyle = F2('#e8c14a'); c.stroke(); }
        c.strokeStyle = Art.ink; c.lineWidth = Art.lw; circ(c, x + r + 1, y - r * 0.6, 2.4, F2('#e8c14a')); break;
      case 'priest':
        c.beginPath(); c.arc(x, y - 1, r + 1.2, Math.PI * 1.05, TAU * 0.98); c.lineTo(x + r, y - r * 0.5); c.lineTo(x - r, y - r * 0.5); c.closePath(); fillStroke(c, F2('#2a2a30'));
        c.beginPath(); c.moveTo(x - r, y - r * 0.5); c.lineTo(x + r, y - r * 0.5); c.lineWidth = 3; c.strokeStyle = F2('#e8c14a'); c.stroke(); c.strokeStyle = Art.ink; c.lineWidth = Art.lw; circ(c, x + r * 0.9, y - r * 0.8, 2.4, F2('#d63a4a')); break;
      case 'topknot':
        c.beginPath(); c.arc(x, y - 1, r + 1.2, Math.PI * 1.05, TAU * 0.98); c.lineTo(x + r, y - r * 0.5); c.lineTo(x - r, y - r * 0.5); c.closePath(); fillStroke(c, F2('#26262c'));
        circ(c, x - 1, y - r - 4, r * 0.5, F2('#26262c')); seg(c, x - 7, y - r - 4, x + 5, y - r - 5, 2, F2('#e8c14a')); seg(c, x - r, y - r * 0.5, x - r - 10, y + 2 + Math.sin(st.t * 8) * 2, 3, acc); break;
      case 'tangHelm': case 'tangHelmBig':
        steelHelm(c, st, h, st.enemy ? st.pal.hat : '#c0392b'); poly(c, [x - r - 1, y - 1, x - r - 6, y + 8, x - r + 2, y + 6], F2(P.steel));
        seg(c, x, y - r * big - 2, x, y - r * big - 11, 2.4, F2(P.steel)); seg(c, x, y - r * big - 11, x - 3, y - r * big - 6, 2.4, acc); break;
      case 'taoist':
        c.beginPath(); c.rect(x - r * 0.85, y - r * 2.2, r * 1.8, r * 1.6); fillStroke(c, F2('#24242b'));
        c.beginPath(); c.moveTo(x - r * 0.85, y - r * 1.5); c.lineTo(x + r * 0.95, y - r * 1.5); c.lineWidth = 2; c.strokeStyle = F2('#e8c14a'); c.stroke(); c.strokeStyle = Art.ink; c.lineWidth = Art.lw;
        seg(c, x - r, y - r * 0.8, x + r, y - r * 0.9, 2.4, F2('#e8c14a')); break;
      case 'morion': case 'morionBig':
        c.beginPath(); c.arc(x, y - 1, (r + 1.6) * big, Math.PI, TAU); c.lineTo(x + (r + 6) * big, y + 1); c.lineTo(x - (r + 6) * big, y + 1); c.closePath(); fillStroke(c, F2(P.steel));
        c.beginPath(); c.moveTo(x - (r + 1) * big, y - r * 0.4 * big - 2); c.quadraticCurveTo(x, y - (r + 12) * big, x + (r + 1) * big, y - r * 0.4 * big - 2); c.lineWidth = 3; c.strokeStyle = acc; c.stroke(); c.strokeStyle = Art.ink; c.lineWidth = Art.lw;
        if (kind === 'morionBig') seg(c, x - 2, y - (r + 8) * big, x - 8, y - (r + 16) * big, 3, acc); break;
      case 'montera':
        c.beginPath(); c.ellipse(x, y - r * 0.6, r * 1.15, r * 0.8, 0, 0, TAU); fillStroke(c, F2(st.enemy ? P.dark : '#3a2b24')); c.beginPath(); c.ellipse(x, y - r * 0.15, r * 1.25, r * 0.35, 0, 0, TAU); fillStroke(c, acc); break;
      case 'beret':
        c.beginPath(); c.ellipse(x + 1, y - r * 0.75, r * 1.3, r * 0.6, -0.2, 0, TAU); fillStroke(c, F2(st.enemy ? P.dark : '#8a2f3a'));
        c.beginPath(); c.moveTo(x - 2, y - r); c.quadraticCurveTo(x - r * 1.6, y - r * 2.2, x - r * 2.3, y - r * 1.3 + Math.sin(st.t * 6) * 2); c.lineWidth = 3; c.strokeStyle = F2('#f4f0e0'); c.stroke(); c.strokeStyle = Art.ink; c.lineWidth = Art.lw; break;
      case 'feather': case 'headband':
        c.beginPath(); c.moveTo(x - r, y - r * 0.5); c.lineTo(x + r, y - r * 0.6); c.lineWidth = 4; c.strokeStyle = F2(st.enemy ? P.dark : '#1f8a7a'); c.stroke(); c.strokeStyle = Art.ink; c.lineWidth = Art.lw;
        if (kind === 'feather') for (k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(x + k * 5, y - r * 0.6); c.quadraticCurveTo(x + k * 10, y - r * 2, x + k * 14, y - r * 2.6); c.lineWidth = 4.5; c.strokeStyle = F2(['#2aa86a', '#e04a3a', '#2a8ad0'][k + 1]); c.stroke(); } c.strokeStyle = Art.ink; c.lineWidth = Art.lw; break;
      case 'jaguar':
        c.beginPath(); c.arc(x, y - 1, r + 2, Math.PI * 0.95, TAU * 1.03); c.lineTo(x + r, y - r * 0.3); c.lineTo(x - r, y - r * 0.3); c.closePath(); fillStroke(c, F2('#e0a03a'));
        [-1, 1].forEach(function (sg) { circ(c, x + sg * r * 0.8, y - r - 1, 3.4, F2('#e0a03a')); });
        for (k = 0; k < 5; k++) { c.fillStyle = Art.ink; c.beginPath(); c.arc(x - r * 0.7 + k * r * 0.35, y - r * (0.8 + (k % 2) * 0.35), 1.7, 0, TAU); c.fill(); } break;
      case 'eagleHelm':
        c.beginPath(); c.arc(x, y - 1, r + 2, Math.PI, TAU); c.lineTo(x + r + 2, y + 1); c.lineTo(x - r - 2, y + 1); c.closePath(); fillStroke(c, F2('#e8e0c8'));
        poly(c, [x + r * 0.2, y - r * 0.9, x + r + 9, y - r * 0.2, x + r * 0.4, y + r * 0.1], F2('#e0a03a'));
        for (k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(x - r * 0.4, y - r); c.quadraticCurveTo(x - r * 1.3 + k * 4, y - r * 2.2, x - r * 1.5 + k * 7, y - r * 1.8 + Math.abs(k) * 3); c.lineWidth = 4; c.strokeStyle = F2(k % 2 ? '#e8e0c8' : '#d8c8a0'); c.stroke(); } c.strokeStyle = Art.ink; c.lineWidth = Art.lw; break;
      case 'quetzal':
        c.beginPath(); c.moveTo(x - r, y - r * 0.5); c.lineTo(x + r, y - r * 0.6); c.lineWidth = 4; c.strokeStyle = F2('#e8c14a'); c.stroke();
        for (k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(x + k * 3.5, y - r * 0.6); c.quadraticCurveTo(x + k * 9, y - r * 2.2 - Math.abs(k) * -2, x + k * 12, y - r * 3 + Math.abs(k) * 4); c.lineWidth = 4; c.strokeStyle = F2(['#2aa86a', '#2a8ad0', '#2aa86a', '#e04a3a'][Math.abs(k)]); c.stroke(); } c.strokeStyle = Art.ink; c.lineWidth = Art.lw; break;
      case 'pagri': case 'pagriBig':
        c.beginPath(); c.ellipse(x, y - r * 0.55, r * 1.3 * big, r * 0.9 * big, 0, 0, TAU); fillStroke(c, F2(st.enemy ? st.pal.hat : '#e8863a'));
        c.beginPath(); c.arc(x, y - r * 0.4, r * 1.05 * big, Math.PI * 1.1, Math.PI * 1.9); c.lineWidth = 1.5; c.stroke(); c.lineWidth = Art.lw;
        circ(c, x + r * 0.2, y - r * 1.05, 2.6, F2('#d63a4a')); seg(c, x + r * 0.2, y - r * 1.2, x + r * 0.1, y - r * 2.1, 2.2, F2('#f4f0e0')); break;
      case 'aventail':
        poly(c, [x - r - 1, y - 1, x - r - 5, y + r + 6, x + r * 0.2, y + r + 4, x + r * 0.6, y + 2], F2('#b8bcc6'));
        c.beginPath(); c.arc(x, y - 1, r + 1.8, Math.PI, TAU); c.lineTo(x + r + 1.8, y + 1); c.lineTo(x - r - 1.8, y + 1); c.closePath(); fillStroke(c, F2(P.steel));
        seg(c, x, y - r - 1, x, y - r - 10, 2.4, F2(P.steel)); circ(c, x, y - r - 11, 2.4, acc); break;
      case 'yogi':
        c.beginPath(); c.arc(x, y - 1, r + 1.2, Math.PI * 1.05, TAU * 0.98); c.lineTo(x + r, y - r * 0.4); c.lineTo(x - r, y - r * 0.4); c.closePath(); fillStroke(c, F2('#2a2a30'));
        circ(c, x - 2, y - r - 4, r * 0.55, F2('#2a2a30')); c.beginPath(); c.moveTo(x - r, y - r * 0.4); c.lineTo(x + r, y - r * 0.5); c.lineWidth = 3.4; c.strokeStyle = F2('#e8863a'); c.stroke(); c.strokeStyle = Art.ink; c.lineWidth = Art.lw; break;
      default: return false;
    }
    return true;
  }
  // blades: straight by default, curved for katana, scimitar, dao and the khopesh's hooked sickle
  function blade(c, st, bx, by, ang, len) {
    var cu = Art.theme.culture, kind = cu && cu.blade, ux = Math.cos(ang), uy = Math.sin(ang), nx = -uy, ny = ux, col = st.F('#d9dde6');
    function stroke(w, color, path) { c.strokeStyle = color; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); path(); c.stroke(); }
    if (!kind) { seg(c, bx - ux * 6, by - uy * 6, bx + ux * len, by + uy * len, 4.4, col); }
    else if (kind === 'macuahuitl') {
      seg(c, bx - ux * 6, by - uy * 6, bx + ux * len * 0.95, by + uy * len * 0.95, 9, st.F('#a8794a'));
      for (var q = 1; q <= 5; q++) { var px = bx + ux * len * q * 0.17, py = by + uy * len * q * 0.17; [-1, 1].forEach(function (sg) { poly(c, [px - ux * 3 + nx * sg * 4, py - uy * 3 + ny * sg * 4, px + nx * sg * 9, py + ny * sg * 9, px + ux * 3 + nx * sg * 4, py + uy * 3 + ny * sg * 4], st.F('#2a2a30')); }); }
    }
    else {
      var L2 = kind === 'katana' ? len * 1.2 : kind === 'dao' ? len * 1.05 : len, w = kind === 'scimitar' ? 5.4 : kind === 'dao' ? 6 : kind === 'katana' ? 3.4 : 4;
      var path;
      if (kind === 'khopesh') path = function () { var p1x = bx + ux * L2 * 0.6, p1y = by + uy * L2 * 0.6; c.moveTo(bx - ux * 6, by - uy * 6); c.lineTo(p1x, p1y); c.bezierCurveTo(p1x + ux * L2 * 0.5 + nx * 16, p1y + uy * L2 * 0.5 + ny * 16, p1x + ux * L2 * 0.6 + nx * 4, p1y + uy * L2 * 0.6 + ny * 4, p1x + ux * L2 * 0.18 - nx * 12, p1y + uy * L2 * 0.18 - ny * 12); };
      else { var cv = kind === 'katana' ? 6 : 9; path = function () { c.moveTo(bx - ux * 6, by - uy * 6); c.quadraticCurveTo(bx + ux * L2 * 0.5 + nx * cv, by + uy * L2 * 0.5 + ny * cv, bx + ux * L2 + nx * cv * 0.4, by + uy * L2 + ny * cv * 0.4); }; }
      stroke(w + Art.lw * 1.5, Art.ink, path); stroke(w, kind === 'khopesh' ? st.F('#d8b050') : col, path);
      if (kind === 'dao') seg(c, bx - ux * 6, by - uy * 6, bx - ux * 12 - nx * 2, by - uy * 12 - ny * 2 + 4, 3, st.F(st.enemy ? st.pal.hat : '#d63a4a'));
      c.strokeStyle = Art.ink; c.lineWidth = Art.lw;
      if (kind === 'katana') circ(c, bx, by, 4.4, st.F('#2c2c3a'));
    }
    seg(c, bx - uy * 6, by + ux * 6, bx + uy * 6, by - ux * 6, 3, st.F(st.pal.trim));
  }

  var DRAW = {};
  DRAW.spearman = function (c, st) {
    var a = st.a, th = a >= 0 ? Math.sin(a * Math.PI) * 18 : 0;
    legs(c, st); var back = arm(c, -4, -46 + st.bob, 1.9, 6, st.F(st.pal.skin)); torso(c, st);
    var h = head(c, st, 1, -61); if (!cultHead(c, st, h, 'spearman')) { steelHelm(c, st, h); enemyHat(c, st, h); }
    var ay = a >= 0 ? -0.2 : 0.6, hand = arm(c, 6, -46 + st.bob, ay + (a >= 0 ? 0 : 0), 6.5, st.F(st.pal.skin));
    var ang = a >= 0 ? -0.1 : -0.55, sx = hand.x - 14 + th, sy = hand.y + 5;
    seg(c, sx, sy + 6, sx + Math.cos(ang) * 66, sy + Math.sin(ang) * 66 + 6, 3.6, st.F('#8a5a2e'));
    var tx = sx + Math.cos(ang) * 66, ty = sy + Math.sin(ang) * 66 + 6;
    poly(c, [tx - 2, ty - 4, tx + Math.cos(ang) * 16, ty + Math.sin(ang) * 16, tx - 2, ty + 5], st.F(st.pal.steel));
    circ(c, hand.x, hand.y, 3.6, st.F(st.pal.skin));
  };
  DRAW.archer = function (c, st) {
    var a = st.a, pull = a >= 0 ? (a < 0.7 ? a / 0.7 : 0) : 0.15;
    legs(c, st); torso(c, st, { col: st.enemy ? st.pal.tunic : st.F('#4e8f4a') });
    c.beginPath(); c.moveTo(-9, -52 + st.bob); c.lineTo(-17, -33 + st.bob); c.lineTo(-11, -31 + st.bob); c.lineTo(-5, -48 + st.bob); c.closePath(); fillStroke(c, st.F('#8a5a2e'));   // quiver
    [-15, -12].forEach(function (x, i) { seg(c, x, -52 + st.bob, x - 1 + i * 2, -58 + st.bob, 1.6, st.F('#f4f0e0')); });
    var h = head(c, st, 1, -61);
    if (!cultHead(c, st, h, 'archer')) {
    c.beginPath(); c.arc(h.x, h.y - 1, h.r + 1.4, Math.PI * 0.95, TAU * 1.02); c.lineTo(h.x + 2, h.y - 4); c.closePath(); fillStroke(c, st.F(st.enemy ? '#7a2d24' : '#4e8f4a'));
    seg(c, h.x - 3, h.y - h.r - 1, h.x - 12, h.y - h.r - 9, 2, st.F('#f4f0e0'));
    enemyHat(c, st, h);
    }
    var bx = 18, by = -45 + st.bob;
    var hand = arm(c, 6, -46 + st.bob, -0.05, 6, st.F(st.pal.skin));
    c.strokeStyle = Art.ink; c.lineWidth = 3; c.beginPath(); c.arc(bx - 9, by, 20, -1.1, 1.1); c.stroke();
    c.strokeStyle = st.F('#8a5a2e'); c.lineWidth = 2; c.beginPath(); c.arc(bx - 9, by, 20, -1.1, 1.1); c.stroke();
    var tipY = Math.sin(1.1) * 20, bx2 = bx - 9 + Math.cos(1.1) * 20, nockX = bx2 - pull * 14 - 4;
    c.strokeStyle = '#eee'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(bx2, by - tipY); c.lineTo(nockX, by); c.lineTo(bx2, by + tipY); c.stroke();
    if (a < 0.7 || a < 0) { seg(c, nockX, by, bx + 10, by, 1.8, st.F('#d8c9a0')); poly(c, [bx + 10, by - 3, bx + 17, by, bx + 10, by + 3], st.F(st.pal.steel)); }
    c.strokeStyle = Art.ink; c.lineWidth = Art.lw;
    circ(c, nockX + 2, by, 3.4, st.F(st.pal.skin));
  };
  DRAW.fighter = function (c, st) {
    var a = st.a, sw = a >= 0 ? lerp(-2.3, 0.7, ease(a * 1.4)) : -0.9;
    legs(c, st); torso(c, st, { w: 26 });
    var h = head(c, st, 1, -61); if (!cultHead(c, st, h, 'fighter')) { steelHelm(c, st, h, st.enemy ? st.pal.hat : '#d63a3a'); enemyHat(c, st, h); }
    var hand = arm(c, 7, -46 + st.bob, sw, 6.5, st.F(st.pal.skin));
    var bl = 36, bx = hand.x, by = hand.y;
    blade(c, st, bx, by, hand.a, bl);
    // round shield on the back arm
    var sh = arm(c, -2, -46 + st.bob, 0.3, 6, st.F(st.pal.skin));
    circ(c, sh.x + 8, sh.y - 2, 15, st.F(st.pal.tunic)); circ(c, sh.x + 8, sh.y - 2, 5.5, st.F(st.pal.trim));
    c.beginPath(); c.arc(sh.x + 8, sh.y - 2, 10.5, 0, TAU); c.lineWidth = 1.4; c.stroke(); c.lineWidth = Art.lw;
  };
  DRAW.assassin = function (c, st) {
    var a = st.a;
    if (st.walk) { c.save(); c.globalAlpha *= 0.22; c.translate(-16, 0); c.rotate(-0.12); legs(c, st); torso(c, st, { col: st.F('#3a3350') }); c.restore(); }
    c.save(); c.rotate(st.walk ? -0.14 : 0);
    var dark = st.enemy ? st.pal.dark : '#3a3350';
    legs(c, st, { legCol: dark, legW: 6 }); torso(c, st, { w: 20, col: dark });
    var h = head(c, st, 2, -60);
    if (!cultHead(c, st, h, 'assassin')) {
    c.beginPath(); c.arc(h.x - 1, h.y - 1, h.r + 2, Math.PI * 0.6, TAU * 1.15); c.lineTo(h.x + 6, h.y + 2); c.closePath(); fillStroke(c, st.F(dark));
    c.beginPath(); c.moveTo(h.x + 6, h.y + 0.5); c.lineTo(h.x - 8, h.y + 0.5); c.lineTo(h.x - 8, h.y + 8); c.lineTo(h.x + 7, h.y + 6); c.closePath(); fillStroke(c, st.F(st.enemy ? st.pal.scarf : '#9b4fc4'));
    enemyHat(c, st, { x: h.x, y: h.y - 3, r: h.r - 1 });
    }
    var fl = Math.sin(st.t * 12) * 5;      // long scarf
    c.beginPath(); c.moveTo(-3, -50 + st.bob); c.quadraticCurveTo(-22, -52 + fl, -40, -46 + fl * 1.6); c.lineTo(-38, -39 + fl * 1.6); c.quadraticCurveTo(-20, -44 + fl, -2, -43 + st.bob); c.closePath(); fillStroke(c, st.F(st.enemy ? st.pal.scarf : '#9b4fc4'));
    var s1 = a >= 0 ? lerp(-2.2, 0.9, ease(a * 1.5)) : -0.9, s2 = a >= 0 ? lerp(-1.8, 1.2, ease(a * 1.5 - 0.1)) : -0.2;
    [[-1, s2], [5, s1]].forEach(function (p) {
      var hd = arm(c, p[0], -46 + st.bob, p[1], 5.5, st.F(dark));
      seg(c, hd.x, hd.y, hd.x + Math.cos(hd.a) * 17, hd.y + Math.sin(hd.a) * 17, 3.2, st.F('#dfe3ea'));
    });
    c.restore();
  };
  function horse(c, st, rider) {
    var w = st.w, g = st.walk ? 1 : 0, i, bodyCol = st.enemy ? st.F('#6c4a3a') : st.F('#e3dfd2'), by = -36 + (g ? Math.sin(w * 2) * 2 : 0);
    var legsSet = [[-20, 0], [-12, 0.9], [14, 0.4], [22, 1.3]];
    for (i = 0; i < 4; i++) {
      var ph = legsSet[i][1], a = g ? Math.sin(w + ph * 2.4) * 0.9 : 0, hx = legsSet[i][0], hy = by + 6;
      var kx = hx + Math.sin(a) * 13, ky = hy + 13, fx = kx + Math.sin(a * 0.6 - 0.2) * 12 * (i < 2 ? -1 : 1) * (g ? 1 : 0), fy = Math.min(0, hy + 26 - (g ? Math.max(0, Math.sin(w + ph * 2.4 + 1)) * 6 : 0));
      seg(c, hx, hy, kx, ky, 6, i % 2 ? st.F(st.enemy ? '#4a3228' : '#c9c4b4') : bodyCol); seg(c, kx, ky, fx, fy, 5, i % 2 ? st.F(st.enemy ? '#4a3228' : '#c9c4b4') : bodyCol);
      c.beginPath(); c.ellipse(fx + 2, fy, 4.5, 2.6, 0, 0, TAU); fillStroke(c, st.F('#3b2a20'));
    }
    c.beginPath(); c.moveTo(-26, by - 2); c.quadraticCurveTo(-34, by + 8 + Math.sin(st.t * 8) * 3, -42, by + 16 + Math.sin(st.t * 8 + 1) * 5); c.quadraticCurveTo(-30, by + 12, -24, by + 8); c.closePath(); fillStroke(c, st.F(st.enemy ? '#2a1f1a' : '#c0bba8'));
    c.beginPath(); c.ellipse(0, by, 32, 14, 0, 0, TAU); fillStroke(c, bodyCol);
    c.beginPath(); c.moveTo(20, by - 8); c.quadraticCurveTo(34, by - 22, 38, by - 30); c.lineTo(48, by - 24); c.quadraticCurveTo(40, by - 10, 28, by + 4); c.closePath(); fillStroke(c, bodyCol);
    c.save(); c.translate(46, by - 28); c.rotate(0.55 + (st.a >= 0 ? -0.2 : 0));
    c.beginPath(); c.ellipse(4, 0, 13, 6.4, 0, 0, TAU); fillStroke(c, bodyCol); circ(c, 8, -2, 1.6, Art.ink); c.restore();
    c.beginPath(); c.moveTo(20, by - 12); c.quadraticCurveTo(26, by - 28, 36, by - 34 + Math.sin(st.t * 7) * 1.5); c.lineTo(34, by - 28); c.quadraticCurveTo(28, by - 20, 24, by - 8); c.closePath(); fillStroke(c, st.F(st.enemy ? '#2a1f1a' : '#a99f86'));
    c.beginPath(); c.moveTo(-12, by - 12); c.lineTo(14, by - 12); c.lineTo(14, by + 6); c.lineTo(-12, by + 6); c.closePath(); fillStroke(c, st.F(st.enemy ? st.pal.hat : st.pal.tunic));
    c.beginPath(); c.moveTo(-12, by + 1); c.lineTo(14, by + 1); c.lineWidth = 2; c.strokeStyle = st.F(st.pal.trim); c.stroke(); c.strokeStyle = Art.ink; c.lineWidth = Art.lw;
    return by;
  }
  DRAW.knight = function (c, st) {
    var by = horse(c, st), a = st.a;
    c.save(); c.translate(2, by - 8); st.bob = 0;
    c.beginPath(); c.moveTo(-9, -12); c.quadraticCurveTo(0, -17, 9, -12); c.lineTo(11, 8); c.lineTo(-11, 8); c.closePath(); fillStroke(c, st.F(st.enemy ? st.pal.tunic : '#d5dae5'));
    c.beginPath(); c.moveTo(-9, -4); c.lineTo(9, -4); c.lineTo(10, 3); c.lineTo(-10, 3); c.closePath(); fillStroke(c, st.F(st.pal.tunic));
    var h = head(c, st, 1, -25); if (!cultHead(c, st, h, 'knight')) { steelHelm(c, st, h, st.enemy ? st.pal.hat : '#2f55b5'); enemyHat(c, st, h); }
    var hand = arm(c, 5, -10, a >= 0 ? -0.1 : 0.15, 6, st.F(st.pal.skin));
    var lx = hand.x - 18 + (a >= 0 ? Math.sin(a * Math.PI) * 14 : 0), ly = hand.y + 4;
    seg(c, lx, ly, lx + 62, ly - 5, 3.6, st.F('#8a5a2e'));
    poly(c, [lx + 60, ly - 9, lx + 78, ly - 5, lx + 60, ly - 1], st.F(st.pal.steel));
    poly(c, [lx + 32, ly - 9, lx + 52, ly - 6, lx + 32, ly - 15 + 3], st.F(st.enemy ? st.pal.hat : '#e8b923'));
    c.restore();
  };
  DRAW.tank = function (c, st) {
    var a = st.a, sw = a >= 0 ? lerp(-2.0, 0.9, ease(a * 1.3)) : -0.7;
    legs(c, st, { legW: 9, legCol: st.pal.dark });
    torso(c, st, { w: 36, top: -54, col: st.F(st.enemy ? '#7d5a55' : '#8c95a8') });
    c.beginPath(); c.ellipse(-14, -52 + st.bob, 11, 8, 0, 0, TAU); fillStroke(c, st.F(st.pal.steel)); c.beginPath(); c.ellipse(14, -52 + st.bob, 11, 8, 0, 0, TAU); fillStroke(c, st.F(st.pal.steel));
    var h = head(c, st, 2, -64, 9);
    if (!cultHead(c, st, h, 'tank')) {
    c.beginPath(); c.arc(h.x, h.y - 1, h.r + 3.5, Math.PI, TAU); c.lineTo(h.x + h.r + 3.5, h.y + 6); c.lineTo(h.x - h.r - 3.5, h.y + 6); c.closePath(); fillStroke(c, st.F(st.enemy ? '#7d5a55' : '#9aa3b6'));
    c.beginPath(); c.moveTo(h.x + 1, h.y - 2); c.lineTo(h.x + h.r + 3, h.y - 2); c.lineWidth = 3.4; c.stroke(); c.lineWidth = Art.lw;
    poly(c, [h.x - 3, h.y - h.r - 3, h.x + 3, h.y - h.r - 3, h.x, h.y - h.r - 11], st.F(st.enemy ? st.pal.hat : '#e8b923')); enemyHat(c, st, { x: h.x, y: h.y - 4, r: h.r });
    }
    var hand = arm(c, 14, -48 + st.bob, sw, 8, st.F(st.pal.steel));
    seg(c, hand.x, hand.y, hand.x + Math.cos(hand.a) * 30, hand.y + Math.sin(hand.a) * 30, 5, st.F('#6b4528'));
    var mx = hand.x + Math.cos(hand.a) * 32, my = hand.y + Math.sin(hand.a) * 32;
    circ(c, mx, my, 9, st.F(st.pal.steel)); for (var i = 0; i < 6; i++) { var an = i * TAU / 6; seg(c, mx + Math.cos(an) * 8, my + Math.sin(an) * 8, mx + Math.cos(an) * 13, my + Math.sin(an) * 13, 3, st.F(st.pal.steel)); }
    c.beginPath(); c.moveTo(14, -56 + st.bob); c.lineTo(34, -52 + st.bob); c.lineTo(34, -12); c.quadraticCurveTo(24, -4, 14, -12); c.closePath(); fillStroke(c, st.F(st.enemy ? st.pal.cloth : '#4768b8'));
    circ(c, 25, -34, 6, st.F(st.pal.trim));
  };
  DRAW.mage = function (c, st) {
    var a = st.a, glow = a >= 0 ? Math.sin(a * Math.PI) : 0.25 + Math.sin(st.t * 4) * 0.1;
    var robe = st.enemy ? '#6a2f5c' : '#3b3f94';
    var bob = st.walk ? Math.sin(st.w * 2) * 1.5 : 0;
    c.beginPath(); c.moveTo(-10, -52 + st.bob); c.lineTo(10, -52 + st.bob); c.lineTo(20, -3 + bob); c.quadraticCurveTo(0, 2 + bob, -20, -3 + bob); c.closePath(); fillStroke(c, st.F(robe));
    c.beginPath(); c.moveTo(-17, -12); c.lineTo(17, -12); c.lineWidth = 2.4; c.strokeStyle = st.F(st.pal.trim); c.stroke(); c.strokeStyle = Art.ink; c.lineWidth = Art.lw;
    for (var i = 0; i < 4; i++) { c.fillStyle = st.F('#ffe69a'); c.beginPath(); c.arc(-9 + i * 6 + (i % 2) * 2, -30 + (i % 3) * 6, 1.6, 0, TAU); c.fill(); }
    var h = head(c, st, 2, -61);
    var ch = cultHead(c, st, h, 'mage');
    if (!ch) {
    c.beginPath(); c.ellipse(h.x - 1, h.y - h.r + 1, h.r + 8, 3.6, 0, 0, TAU); fillStroke(c, st.F(robe));
    poly(c, [h.x - h.r + 1, h.y - h.r + 1, h.x + h.r - 2, h.y - h.r + 1, h.x - 3 + Math.sin(st.t * 3) * 2, h.y - h.r - 24], st.F(robe));
    circ(c, h.x - 3, h.y - h.r - 10, 2, st.F('#ffe69a'));
    }
    c.beginPath(); c.moveTo(h.x + 2, h.y + 5); c.quadraticCurveTo(h.x + 3, h.y + 18, h.x - 3, h.y + 20); c.quadraticCurveTo(h.x - 8, h.y + 12, h.x - 4, h.y + 6); c.closePath(); fillStroke(c, st.F('#f0eee6'));
    if (!ch) enemyHat(c, st, { x: h.x, y: h.y - 4, r: h.r - 2 });
    var up = a >= 0 ? lerp(-0.2, -1.0, ease(a)) : -0.1, hand = arm(c, 8, -46 + st.bob, up, 6, st.F(st.pal.skin));
    var sx = hand.x + 4, sy = hand.y;
    seg(c, sx - 3, sy + 34, sx + 3, sy - 26, 3.6, st.F('#7a4e2a'));
    var g = c.createRadialGradient(sx + 3, sy - 32, 1, sx + 3, sy - 32, 12 + glow * 10);
    g.addColorStop(0, st.enemy ? '#ffd4ee' : '#e3f3ff'); g.addColorStop(1, st.enemy ? 'rgba(222,70,170,0)' : 'rgba(80,150,255,0)');
    c.fillStyle = g; c.beginPath(); c.arc(sx + 3, sy - 32, 12 + glow * 10, 0, TAU); c.fill();
    circ(c, sx + 3, sy - 32, 5, st.F(st.enemy ? '#e45db8' : '#5aa2ff'));
    circ(c, hand.x, hand.y, 3.5, st.F(st.pal.skin));
  };
  DRAW.catapult = function (c, st) {
    var a = st.a, wheelA = st.walk ? st.w * 0.6 : 0, rest = -2.45, ang = a >= 0 ? lerp(rest, -0.55, ease(a * 1.8)) : rest;
    var wood = st.F(st.enemy ? '#7a4a38' : '#a8794a'), dk = st.F(st.enemy ? '#4a2c24' : '#6e4a2a');
    // crew, pushing from behind
    c.save(); c.translate(-44, 0); c.scale(0.7, 0.7); legs(c, st); torso(c, st, { w: 22 }); var hh = head(c, st, 1, -61); enemyHat(c, st, hh); arm(c, 6, -46, 0.2, 6, st.F(st.pal.skin)); c.restore();
    poly(c, [-30, -22, 36, -22, 28, -34, -22, -34], wood);
    poly(c, [-6, -34, 10, -34, 6, -58, -2, -58], dk);
    // throwing arm
    var px = 4, py = -56, ax = px + Math.cos(ang) * 46, ay = py + Math.sin(ang) * 46;
    seg(c, px, py, ax, ay, 5.5, dk);
    var fired = a >= 0 && a > 0.45;
    if (!fired) { c.beginPath(); c.arc(ax, ay + 2, 9, 0, Math.PI); c.closePath(); fillStroke(c, wood); circ(c, ax, ay - 2, 6.5, st.F('#9a968c')); }
    else { c.beginPath(); c.arc(ax, ay + 2, 9, 0, Math.PI); c.closePath(); fillStroke(c, wood); }
    circ(c, px, py, 4, st.F(st.pal.trim));
    [[-18, -12], [24, -12]].forEach(function (p) {
      c.save(); c.translate(p[0], p[1]); c.rotate(wheelA); circ(c, 0, 0, 13, wood);
      for (var i = 0; i < 6; i++) { c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(i * TAU / 6) * 12, Math.sin(i * TAU / 6) * 12); c.lineWidth = 2; c.stroke(); }
      c.lineWidth = Art.lw; circ(c, 0, 0, 3.4, dk); c.restore();
    });
    if (st.enemy) { seg(c, -28, -34, -28, -56, 2, dk); poly(c, [-28, -56, -12, -52, -28, -46], st.F(st.pal.hat)); }
  };


  // ---- champions (what the boss gear makes) ---------------------------------------------------------------
  Art.flyY = function (u, t) { return u.fly ? -(24 * u.scale * 1.3 + 5 * Math.sin(t * 3 + u.phase)) : 0; };
  DRAW.dragon = function (c, st) {
    var fl = Math.sin(st.t * 7) * 0.45, a = st.a, G = st.F('#3f9a4f'), G2 = st.F('#9bd96a'), R = st.F('#c0392b'), tl = Math.sin(st.t * 4) * 5;
    c.beginPath(); c.moveTo(-24, -34); c.quadraticCurveTo(-56, -26, -70, -50 + tl); c.quadraticCurveTo(-52, -40, -22, -44); c.closePath(); fillStroke(c, G);
    poly(c, [-70, -50 + tl, -82, -58, -66, -62], R);
    c.save(); c.translate(-6, -54); c.rotate(-0.8 - fl); poly(c, [0, 0, -34, -52, -10, -66, 14, -52, 36, -40, 18, -14], R); c.restore();
    c.beginPath(); c.ellipse(0, -36, 32, 20, 0, 0, TAU); fillStroke(c, G); c.beginPath(); c.ellipse(4, -27, 24, 10, 0, 0, TAU); fillStroke(c, G2);
    [-12, 14].forEach(function (x) { seg(c, x, -22, x + 3, -8, 8, G); c.beginPath(); c.ellipse(x + 6, -6, 8, 3.6, 0, 0, TAU); fillStroke(c, G2); });
    for (var i = 0; i < 5; i++) poly(c, [-22 + i * 11, -53 + Math.abs(i - 2) * 2, -17 + i * 11, -64 + Math.abs(i - 2) * 2, -12 + i * 11, -53 + Math.abs(i - 2) * 2], R);
    c.beginPath(); c.moveTo(20, -48); c.quadraticCurveTo(44, -62, 48, -80); c.lineTo(62, -78); c.quadraticCurveTo(56, -52, 32, -34); c.closePath(); fillStroke(c, G);
    var open = a >= 0 ? Math.sin(a * Math.PI) : 0.12;
    poly(c, [46, -86, 76, -80, 74, -72, 50, -72], G); poly(c, [50, -72, 74, -72 + open * 14, 68, -64 + open * 14, 48, -66], G2);
    poly(c, [48, -88, 40, -104, 56, -90], st.F('#f4efe6')); circ(c, 56, -82, 3.4, st.F('#fff3a0')); circ(c, 57, -82, 1.4, Art.ink);
    c.save(); c.translate(8, -54); c.rotate(-0.4 + fl * 1.3); poly(c, [0, 0, -30, -50, -6, -62, 18, -48, 40, -36, 22, -12], st.F('#e0603c')); c.restore();
    if (a >= 0 && a < 0.95) {
      var len = Math.max(30, (st.range || 150) * Math.sin(a * Math.PI)), fy = -72;
      [['#ff7a2e', 1, 20], ['#ffb02e', 0.72, 13], ['#fff0a0', 0.42, 7]].forEach(function (f) { poly(c, [74, fy, 74 + len * f[1], fy - f[2] + 4, 74 + len * f[1] * 0.9, fy + f[2] + 6, 74, fy + 6], st.F(f[0])); });
    }
  };
  DRAW.king = function (c, st) {
    var a = st.a, robe = st.F('#7a2a8a'), gold = st.F('#f2c94c'), fur = st.F('#f4efe6');
    c.beginPath(); c.moveTo(-8, -54 + st.bob); c.quadraticCurveTo(-34, -30, -28 + Math.sin(st.t * 5) * 3, -4); c.lineTo(4, -8); c.closePath(); fillStroke(c, st.F('#b3263a'));
    legs(c, st, { legCol: st.pal.dark, legW: 8 });
    c.beginPath(); c.moveTo(-14, -56 + st.bob); c.lineTo(14, -56 + st.bob); c.lineTo(22, -18); c.lineTo(-22, -18); c.closePath(); fillStroke(c, robe);
    c.beginPath(); c.moveTo(-20, -30); c.lineTo(20, -30); c.lineWidth = 4; c.strokeStyle = gold; c.stroke(); c.strokeStyle = Art.ink; c.lineWidth = Art.lw;
    c.beginPath(); c.ellipse(0, -54 + st.bob, 18, 6.5, 0, 0, TAU); fillStroke(c, fur); for (var i = -2; i <= 2; i++) { c.fillStyle = Art.ink; c.fillRect(i * 6 - 1, -56 + st.bob, 2, 4); }
    var h = head(c, st, 2, -68);
    poly(c, [h.x - 7, h.y + 4, h.x + 8, h.y + 5, h.x + 2, h.y + 24], fur);
    poly(c, [h.x - 9, h.y - 6, h.x - 12, h.y - 24, h.x - 5, h.y - 16, h.x, h.y - 28, h.x + 5, h.y - 16, h.x + 12, h.y - 24, h.x + 9, h.y - 6], gold);
    circ(c, h.x, h.y - 12, 2.2, st.F('#d63a4a'));
    var hand = arm(c, 9, -52 + st.bob, a >= 0 ? lerp(-2.2, 0.9, ease(a * 1.4)) : -0.9, 7, st.F(st.pal.skin));
    seg(c, hand.x - Math.cos(hand.a) * 6, hand.y - Math.sin(hand.a) * 6, hand.x + Math.cos(hand.a) * 44, hand.y + Math.sin(hand.a) * 44, 5, st.F('#e6eaf2'));
    seg(c, hand.x - Math.sin(hand.a) * 8, hand.y + Math.cos(hand.a) * 8, hand.x + Math.sin(hand.a) * 8, hand.y - Math.cos(hand.a) * 8, 4, gold);
  };
  DRAW.cart = function (c, st) {
    var wood = st.F('#b8864a'), dk = st.F('#6e4a2a');
    if (st.walk) for (var i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-44 - i * 12, -40 + i * 8); c.lineTo(-64 - i * 14, -40 + i * 8); c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,0.7)'; c.stroke(); } c.strokeStyle = Art.ink; c.lineWidth = Art.lw;
    poly(c, [38, -40, 70, -34, 38, -28], st.F('#c3c9d4')); poly(c, [38, -52, 62, -46, 38, -44], st.F('#c3c9d4'));
    c.beginPath(); c.moveTo(-36, -56); c.lineTo(36, -56); c.lineTo(40, -22); c.lineTo(-40, -22); c.closePath(); fillStroke(c, wood);
    [-42, -32, -22].forEach(function (y) { c.beginPath(); c.moveTo(-37, y); c.lineTo(38, y); c.lineWidth = 1.6; c.stroke(); }); c.lineWidth = Art.lw;
    seg(c, -26, -56, -26, -92, 3.4, dk); poly(c, [-26, -92, -4, -86 + Math.sin(st.t * 6) * 3, -26, -77], st.F('#d63a4a'));
    c.beginPath(); c.arc(0, -56, 17, Math.PI, TAU); fillStroke(c, st.F('#c3c9d4'));
    circ(c, 8, -38, 6, '#ffffff'); circ(c, 24, -38, 6, '#ffffff'); circ(c, 10, -38, 2.6, Art.ink); circ(c, 26, -38, 2.6, Art.ink);
    c.beginPath(); c.arc(17, -31, 9, 0.15, Math.PI - 0.15); c.lineWidth = 2.4; c.stroke(); c.lineWidth = Art.lw;
    [-22, 24].forEach(function (x) { c.save(); c.translate(x, -16); c.rotate(st.w * 0.9); circ(c, 0, 0, 18, wood); for (var k = 0; k < 6; k++) { c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(k * TAU / 6) * 17, Math.sin(k * TAU / 6) * 17); c.lineWidth = 2; c.stroke(); } c.lineWidth = Art.lw; circ(c, 0, 0, 4, dk); c.restore(); });
  };
  DRAW.griffin = function (c, st) {
    var fl = Math.sin(st.t * 8) * 0.5, lion = st.F('#d9a441'), lion2 = st.F('#f0c76a'), wing = st.F('#f4efe6'), a = st.a;
    c.save(); c.translate(-4, -52); c.rotate(-0.9 - fl); poly(c, [0, 0, -30, -46, -6, -62, 14, -52, 34, -44, 20, -16], wing); c.restore();
    c.beginPath(); c.moveTo(-26, -34); c.quadraticCurveTo(-52, -34, -58, -54); c.quadraticCurveTo(-46, -50, -26, -42); c.closePath(); fillStroke(c, lion); circ(c, -58, -56, 6, st.F('#b3263a'));
    c.beginPath(); c.ellipse(0, -36, 30, 17, 0, 0, TAU); fillStroke(c, lion); c.beginPath(); c.ellipse(4, -29, 22, 8, 0, 0, TAU); fillStroke(c, lion2);
    [-14, 12].forEach(function (x, i) { seg(c, x, -26, x + (i ? 8 : -6), -10, 7, lion); poly(c, [x + (i ? 8 : -6) - 3, -10, x + (i ? 8 : -6) + 9, -9, x + (i ? 8 : -6) + 3, -3], st.F('#f2c94c')); });
    var dv = a >= 0 ? Math.sin(a * Math.PI) * 14 : 0;
    c.beginPath(); c.moveTo(18, -44); c.quadraticCurveTo(34, -58 + dv * 0.3, 40 + dv, -72 + dv); c.lineTo(54 + dv, -66 + dv); c.quadraticCurveTo(48, -46, 30, -30); c.closePath(); fillStroke(c, wing);
    circ(c, 48 + dv, -72 + dv, 11, wing); poly(c, [56 + dv, -74 + dv, 74 + dv, -66 + dv, 58 + dv, -62 + dv], st.F('#f2c94c')); circ(c, 50 + dv, -74 + dv, 2.6, Art.ink);
    poly(c, [42 + dv, -82 + dv, 38 + dv, -94 + dv, 50 + dv, -84 + dv], st.F('#d9a441'));
    c.save(); c.translate(8, -52); c.rotate(-0.5 + fl * 1.3); poly(c, [0, 0, -26, -42, -4, -58, 16, -46, 38, -38, 22, -12], wing); c.restore();
  };
  DRAW.golem = function (c, st) {
    var a = st.a, sw = a >= 0 ? lerp(-2.0, 1.2, ease(a * 1.3)) : -0.7, stone = st.F('#8a8f9a'), dk = st.F('#656a76'), moss = st.F('#6aa84f'), step = st.walk ? Math.sin(st.w) * 4 : 0;
    c.beginPath(); c.rect(-24, -34 + Math.max(0, step), 18, 34 - Math.max(0, step)); fillStroke(c, dk); c.beginPath(); c.rect(6, -34 + Math.max(0, -step), 18, 34 - Math.max(0, -step)); fillStroke(c, dk);
    c.beginPath(); c.moveTo(-30, -32); c.lineTo(-36, -80 + st.bob); c.lineTo(36, -80 + st.bob); c.lineTo(30, -32); c.closePath(); fillStroke(c, stone);
    [[-18, -70, -6, -50], [10, -76, 20, -48], [-4, -44, 12, -36]].forEach(function (k) { c.beginPath(); c.moveTo(k[0], k[1]); c.lineTo(k[2], k[3]); c.lineWidth = 2; c.stroke(); }); c.lineWidth = Art.lw;
    c.beginPath(); c.ellipse(-20, -78 + st.bob, 12, 5, 0, 0, TAU); fillStroke(c, moss); c.beginPath(); c.ellipse(16, -42, 8, 4, 0, 0, TAU); fillStroke(c, moss);
    c.beginPath(); Art.rr(c, -15, -108 + st.bob, 32, 28, 6); fillStroke(c, stone);
    var gl = 0.6 + 0.4 * Math.sin(st.t * 4); circ(c, -5, -96 + st.bob, 4, st.F('#ffb02e')); circ(c, 9, -96 + st.bob, 4, st.F('#ffb02e')); c.fillStyle = 'rgba(255,170,40,' + (0.25 * gl).toFixed(2) + ')'; c.beginPath(); c.arc(2, -96 + st.bob, 16, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(-6, -86 + st.bob); c.lineTo(10, -86 + st.bob); c.lineWidth = 3; c.strokeStyle = Art.ink; c.stroke(); c.lineWidth = Art.lw;
    seg(c, -30, -70, -44, -40, 16, dk); circ(c, -44, -36, 11, dk);
    var sx = 30, sy = -70; seg(c, sx, sy, sx + Math.cos(sw) * 36, sy + Math.sin(sw) * 36, 16, stone); circ(c, sx + Math.cos(sw) * 40, sy + Math.sin(sw) * 40, 12, stone);
  };
  DRAW.unicorn = function (c, st) {
    var by = horse(c, st), a = st.a;
    ['#e0405a', '#f2a03a', '#f2e04a', '#58c46a', '#4aa3e8', '#8a5ad6'].forEach(function (col, i) {
      c.beginPath(); c.moveTo(24, by - 16); c.quadraticCurveTo(12 - i * 2, by - 38, -2 - i * 3, by - 22 + Math.sin(st.t * 6 + i) * 3); c.lineWidth = 3.2; c.strokeStyle = st.F(col); c.stroke();
      c.beginPath(); c.moveTo(-26, by - 2); c.quadraticCurveTo(-40 - i * 2, by + 6 + Math.sin(st.t * 7 + i) * 3, -46 - i * 3, by + 18); c.stroke();
    }); c.strokeStyle = Art.ink; c.lineWidth = Art.lw;
    poly(c, [52, by - 32, 72, by - 60, 58, by - 26], st.F('#ffe27a'));
    var gl = a >= 0 ? Math.sin(a * Math.PI) : 0.25; c.fillStyle = 'rgba(255,240,170,' + (0.25 + gl * 0.4).toFixed(2) + ')'; c.beginPath(); c.arc(72, by - 60, 6 + gl * 10, 0, TAU); c.fill();
  };

  var DRAW_END = 0;
  // Draw one unit. (sx, sy) is where its feet are on screen.
  Art.drawUnit = function (c, u, sx, sy, t) {
    var fn = DRAW[u.type]; if (!fn) return;
    var pal = palette(u), flash = u.flash > 0 ? Math.min(1, u.flash / 0.18) * 0.7 : 0;
    var moving = u.anim === 'walk';
    var att = u.anim === 'attack' ? Math.min(1, u.at / Math.min(0.55, u.cdMax * 0.5)) : -1;
    var st = { pal: pal, enemy: u.side === 'enemy', id: u.id, range: u.range / (u.scale * 1.3), t: t + u.phase, w: (t + u.phase) * (u.speed / 8 + 4), walk: moving, a: att, bob: moving ? Math.sin((t + u.phase) * (u.speed / 8 + 4) * 2) * 1.6 : Math.sin((t + u.phase) * 2.2) * 0.8,
      F: function (col) { return flash ? mix(col, '#ffffff', flash) : col; } };
    var face = (u.facing || u.dir) < 0 ? -1 : 1, sc = u.scale * (u.noZoom ? 1 : 1.3), alpha = 1, rot = 0, dx = 0, dy = 0;
    if (u.anim === 'die') { var p = Math.min(1, u.t / 0.7); rot = -p * 1.35; alpha = 1 - p * p; dy = p * 4; }
    if (u.state === 'getup') { var q = Math.min(1, u.t / 0.45); rot = (1 - ease(q)) * -1.55; dy = (1 - ease(q)) * 6; st.walk = false; }
    var lvl = u.level || 1, tt = performance.now() / 1000;
    c.save(); c.translate(sx + dx, sy + dy);
    // shadow
    c.globalAlpha = 0.25 * alpha; c.fillStyle = '#000'; c.beginPath(); c.ellipse(0, 1, 20 * sc, 5 * sc, 0, 0, TAU); c.fill();
    if (lvl >= 2 && u.anim !== 'die') {      // each level of gear gives its fighter a new flourish: ring, glow, then golden sparkle
      c.globalAlpha = alpha; c.lineWidth = 3; c.strokeStyle = Art.C(['', '#d5dbe8', '#f2c94c', '#ffd75a'][lvl - 1]);
      c.beginPath(); c.ellipse(0, 1, 25 * sc, 7 * sc, 0, 0, TAU); c.stroke();
      if (lvl >= 3) { var gl = c.createRadialGradient(0, -34 * sc, 2, 0, -34 * sc, 46 * sc); gl.addColorStop(0, 'rgba(255,220,100,' + (lvl === 3 ? 0.3 : 0.42) + ')'); gl.addColorStop(1, 'rgba(255,220,100,0)'); c.fillStyle = gl; c.beginPath(); c.arc(0, -34 * sc, 46 * sc, 0, TAU); c.fill(); }
      if (lvl >= 4) { c.lineWidth = 2; c.globalAlpha = alpha * (0.5 + 0.4 * Math.sin(tt * 4)); c.beginPath(); c.ellipse(0, 1, (30 + 3 * Math.sin(tt * 4)) * sc, 9 * sc, 0, 0, TAU); c.stroke(); }
    }
    var fy = u.fly ? Art.flyY(u, t) : 0;
    c.globalAlpha = alpha; c.translate(0, fy); c.scale(face * sc, sc); c.rotate(rot * face);
    inkStyle(c); fn(c, st); c.restore();
    if (u.anim !== 'die' && (lvl >= 2 || u.champ || u.special)) {   // above the head: one gold star per gear level above the first, a bigger star for the culture's specialty, a crown on a champion
      c.save(); c.translate(sx, sy); inkStyle(c); var top = -80 * sc - 20 + (u.fly ? Art.flyY(u, t) : 0), n = lvl - 1, startX = -((n - 1) * 15) / 2 - (u.special ? 11 : 0);
      for (var si = 0; si < n; si++) { var sx2 = startX + si * 15, sz = 6.5; c.beginPath();
        for (var k = 0; k < 10; k++) { var rr2 = k % 2 ? sz * 0.42 : sz, an = -Math.PI / 2 + k * Math.PI / 5; c.lineTo(sx2 + Math.cos(an) * rr2, top + Math.sin(an) * rr2); }
        c.closePath(); c.fillStyle = Art.C(Art.theme.gold2); c.fill(); c.lineWidth = 1.6; c.stroke(); }
      if (u.special) Art.starBadge(c, n ? startX + n * 15 + 2 : 0, top - 1, 10);
      if (u.champ) { c.save(); c.translate(0, top - 14); c.scale(1.2, 1.2); Art.icon(c, 'boss', 0, 0, 1, Art.C('#ffd75a')); c.restore(); }
      c.restore();
    }
  };
  // a falling fighter, tumbling out of its gear
  Art.drawFalling = function (c, u, sx, sy, spin) {
    var fn = DRAW[u.type]; var pal = palette(u);
    var st = { pal: pal, enemy: false, id: u.id, t: spin, w: 0, walk: false, a: -1, bob: 0, F: function (x) { return x; } };
    c.save(); c.translate(sx, sy); c.scale(u.scale * 1.24, u.scale * 1.24); c.rotate(spin * 6); c.translate(0, 38);
    inkStyle(c); fn(c, st); c.restore();
  };

  // ---- gears -------------------------------------------------------------------------------
  var GEAR_COL = { spearman: '#c98d4b', archer: '#86b25c', fighter: '#b8bfc9', assassin: '#8d78b8', knight: '#d6aa3a', tank: '#8d97ab', mage: '#6586d4', catapult: '#b07a4e',
    mult: '#e3c675', boss: '#9b6bd1', lightning: '#f3dc52', rocket: '#e5785a', shuriken: '#a5b2c0' };
  Art.gearColor = function (type) { return Art.C(GEAR_COL[type] || '#c79a52'); };
  function teethPath(c, r, n, ang, depth) {
    var h = Math.PI / n; c.beginPath();
    for (var i = 0; i < n; i++) {
      var a = ang + i * 2 * h;
      var pts = [[r - depth, a - h * 0.95], [r + 4, a - h * 0.5], [r + 4, a + h * 0.5], [r - depth, a + h * 0.95]];
      pts.forEach(function (p, k) { var x = Math.cos(p[1]) * p[0], y = Math.sin(p[1]) * p[0]; if (i === 0 && k === 0) c.moveTo(x, y); else c.lineTo(x, y); });
    }
    c.closePath();
  }
  Art.icon = function (c, type, x, y, s, col) {
    c.save(); c.translate(x, y); c.scale(s, s); c.lineWidth = 2.2 / s * 1.0; c.strokeStyle = Art.ink; c.fillStyle = col || '#fff'; c.lineJoin = 'round'; c.lineCap = 'round';
    switch (type) {
      case 'spearman': c.beginPath(); c.moveTo(-9, 9); c.lineTo(8, -8); c.stroke(); c.beginPath(); c.moveTo(4, -12); c.lineTo(12, -12); c.lineTo(12, -4); c.closePath(); c.fill(); c.stroke(); break;
      case 'archer': c.beginPath(); c.arc(-3, 0, 11, -1.2, 1.2); c.stroke(); c.beginPath(); c.moveTo(-3 + Math.cos(1.2) * 11, Math.sin(1.2) * 11); c.lineTo(-3 + Math.cos(1.2) * 11, -Math.sin(1.2) * 11); c.stroke(); c.beginPath(); c.moveTo(-8, 0); c.lineTo(11, 0); c.stroke(); c.beginPath(); c.moveTo(11, 0); c.lineTo(6, -4); c.lineTo(6, 4); c.closePath(); c.fill(); break;
      case 'fighter': c.beginPath(); c.moveTo(-9, -9); c.lineTo(9, -9); c.lineTo(9, 1); c.quadraticCurveTo(9, 9, 0, 12); c.quadraticCurveTo(-9, 9, -9, 1); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.moveTo(0, -9); c.lineTo(0, 11); c.stroke(); break;
      case 'assassin': c.beginPath(); c.moveTo(0, -12); c.lineTo(5, 0); c.lineTo(0, 12); c.lineTo(-5, 0); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.moveTo(-7, 6); c.lineTo(7, 6); c.stroke(); break;
      case 'knight': c.beginPath(); c.moveTo(-8, 10); c.lineTo(-8, -2); c.quadraticCurveTo(-8, -11, 2, -11); c.lineTo(10, -4); c.lineTo(8, 0); c.lineTo(2, -1); c.lineTo(2, 10); c.closePath(); c.fill(); c.stroke(); break;
      case 'tank': c.beginPath(); c.arc(0, -1, 10, Math.PI, 0); c.lineTo(10, 10); c.lineTo(-10, 10); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.moveTo(-2, 0); c.lineTo(10, 0); c.stroke(); break;
      case 'mage': c.beginPath(); for (var i = 0; i < 10; i++) { var rr2 = i % 2 ? 4.5 : 11, an = -Math.PI / 2 + i * Math.PI / 5; c.lineTo(Math.cos(an) * rr2, Math.sin(an) * rr2); } c.closePath(); c.fill(); c.stroke(); break;
      case 'catapult': c.beginPath(); c.moveTo(-10, 10); c.lineTo(8, -10); c.stroke(); c.beginPath(); c.arc(9, -10, 4.5, 0, TAU); c.fill(); c.stroke(); c.beginPath(); c.arc(-6, 9, 4, 0, TAU); c.fill(); c.stroke(); break;
      case 'lightning': c.beginPath(); c.moveTo(3, -12); c.lineTo(-7, 2); c.lineTo(-1, 2); c.lineTo(-4, 12); c.lineTo(8, -3); c.lineTo(1, -3); c.closePath(); c.fill(); c.stroke(); break;
      case 'rocket': c.beginPath(); c.moveTo(0, -12); c.quadraticCurveTo(7, -3, 5, 8); c.lineTo(-5, 8); c.quadraticCurveTo(-7, -3, 0, -12); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.moveTo(-5, 8); c.lineTo(-9, 12); c.lineTo(-3, 9); c.moveTo(5, 8); c.lineTo(9, 12); c.lineTo(3, 9); c.stroke(); break;
      case 'shuriken': c.beginPath(); for (var j = 0; j < 8; j++) { var r3 = j % 2 ? 4 : 12, a3 = j * Math.PI / 4; c.lineTo(Math.cos(a3) * r3, Math.sin(a3) * r3); } c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.arc(0, 0, 2, 0, TAU); c.stroke(); break;
      case 'boss': c.beginPath(); c.moveTo(-11, 7); c.lineTo(-13, -8); c.lineTo(-5, -2); c.lineTo(0, -12); c.lineTo(5, -2); c.lineTo(13, -8); c.lineTo(11, 7); c.closePath(); c.fillStyle = '#ffd75a'; c.fill(); c.stroke();
        c.fillStyle = '#d63a4a'; c.beginPath(); c.arc(0, 1, 2.6, 0, TAU); c.fill(); c.beginPath(); c.moveTo(-11, 7); c.lineTo(11, 7); c.stroke(); break;
      case 'lock': c.beginPath(); c.arc(0, -3, 5, Math.PI, 0); c.stroke(); c.beginPath(); c.rect(-7, -3, 14, 11); c.fill(); c.stroke(); break;
    }
    c.restore();
  };
  // g: {type, level, charge, need, active, locked, pulse}; r is the pitch radius
  Art.drawGear = function (c, g, x, y, r, angle, opts) {
    opts = opts || {};
    var col = g.locked && !g.active ? Art.C('#9a948c') : Art.gearColor(g.type), dark = mix(col, '#000000', 0.35), light = mix(col, '#ffffff', 0.45);
    var lv = g.level || 1, gold = Art.C(Art.theme.gold2), tt = performance.now() / 1000, i, unlocked = !(g.locked && !g.active);
    if (lv >= 3 && unlocked) { col = mix(col, Art.C('#f2c94c'), lv === 3 ? 0.28 : 0.5); light = mix(col, '#ffffff', 0.45); dark = mix(col, '#000000', 0.35); }
    c.save(); c.translate(x, y); inkStyle(c);
    if (lv >= 4 && unlocked) {                       // level 4: a crown of golden rays behind the teeth
      c.fillStyle = gold; c.lineWidth = 1.6;
      for (i = 0; i < 12; i++) { var ra = angle + i * TAU / 12 + TAU / 24; c.beginPath(); c.moveTo(Math.cos(ra - 0.13) * (r + 3), Math.sin(ra - 0.13) * (r + 3)); c.lineTo(Math.cos(ra) * (r + 12), Math.sin(ra) * (r + 12)); c.lineTo(Math.cos(ra + 0.13) * (r + 3), Math.sin(ra + 0.13) * (r + 3)); c.closePath(); c.fill(); c.stroke(); }
    }
    if (g.active && g.pulse > 0) { c.fillStyle = 'rgba(255,240,170,' + (g.pulse * 0.5).toFixed(2) + ')'; c.beginPath(); c.arc(0, 0, r + 8 + g.pulse * 4, 0, TAU); c.fill(); }
    if (opts.glow) { c.shadowColor = Art.C('#fff1a8'); c.shadowBlur = 16; }
    teethPath(c, r, 12, angle, 4); var gr = c.createRadialGradient(-r * 0.3, -r * 0.3, 2, 0, 0, r + 4); gr.addColorStop(0, light); gr.addColorStop(1, col);
    c.fillStyle = gr; c.fill(); c.stroke(); c.shadowBlur = 0;
    if (lv >= 2 && unlocked) {                       // level 2: a gold rim and studs
      c.lineWidth = 2.4; c.strokeStyle = gold; teethPath(c, r, 12, angle, 4); c.stroke(); c.strokeStyle = Art.ink; c.lineWidth = Art.lw;
      for (i = 0; i < 12; i++) { var sa = angle + i * TAU / 12 + TAU / 24; c.beginPath(); c.arc(Math.cos(sa) * r * 0.84, Math.sin(sa) * r * 0.84, lv > 2 ? 2.4 : 1.9, 0, TAU); c.fillStyle = gold; c.fill(); }
    }
    if (lv >= 3 && unlocked) {                       // level 3: jewels around the hub
      var gems = ['#e0405a', '#4aa3e8', '#58c46a'];
      for (i = 0; i < 6; i++) { var ga = angle + i * TAU / 6, gx = Math.cos(ga) * r * 0.84, gy = Math.sin(ga) * r * 0.84;
        c.beginPath(); c.moveTo(gx, gy - 4.6); c.lineTo(gx + 3.6, gy); c.lineTo(gx, gy + 4.6); c.lineTo(gx - 3.6, gy); c.closePath(); c.fillStyle = Art.C(gems[i % 3]); c.fill(); c.lineWidth = 1.2; c.stroke(); }
      c.lineWidth = Art.lw;
    }
    c.beginPath(); c.arc(0, 0, r * 0.72, 0, TAU); c.fillStyle = dark; c.fill(); c.lineWidth = Art.lw * 0.7; c.stroke();
    // charge ring
    var need = g.need || 0;
    if (need) {
      c.lineWidth = 5; c.strokeStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.arc(0, 0, r * 0.62, 0, TAU); c.stroke();
      var fr = Math.max(0, Math.min(1, (g.charge || 0) / need));
      if (fr > 0) { c.strokeStyle = Art.theme.gold2; c.beginPath(); c.arc(0, 0, r * 0.62, -Math.PI / 2, -Math.PI / 2 + TAU * fr); c.stroke(); }
      c.strokeStyle = Art.ink; c.lineWidth = Art.lw;
    }
    c.beginPath(); c.arc(0, 0, r * 0.5, 0, TAU); c.fillStyle = col; c.fill(); c.lineWidth = Art.lw * 0.7; c.stroke(); c.lineWidth = Art.lw;
    if (g.type === 'mult') {
      c.fillStyle = Art.ink; c.font = '900 ' + Math.round(r * 0.62) + 'px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('×' + F.MULTV[g.level - 1], 0, 1);
    } else Art.icon(c, g.type, 0, 0, r / 28, Art.C('#fff7e0'));
    if (g.locked && !g.active) Art.icon(c, 'lock', r * 0.45, r * 0.5, r / 48, Art.C('#e0d8c8'));
    if (lv >= 4 && unlocked) {                       // level 4 also twinkles
      for (i = 0; i < 3; i++) { var ta = tt * 1.6 + i * 2.1, tw = 0.5 + 0.5 * Math.sin(tt * 5 + i * 2), tx = Math.cos(ta) * r * 0.92, ty = Math.sin(ta) * r * 0.92, sz = 2.5 + 3.5 * tw;
        c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(tx, ty - sz); c.lineTo(tx + sz * 0.3, ty - sz * 0.3); c.lineTo(tx + sz, ty); c.lineTo(tx + sz * 0.3, ty + sz * 0.3); c.lineTo(tx, ty + sz); c.lineTo(tx - sz * 0.3, ty + sz * 0.3); c.lineTo(tx - sz, ty); c.lineTo(tx - sz * 0.3, ty - sz * 0.3); c.closePath(); c.fill(); }
    }
    c.restore();
    // level pips are drawn upright, not turning
    c.save(); c.translate(x, y);
    if (opts.star) Art.starBadge(c, -r * 0.78, -r * 0.78, 9);
    for (var i = 0; i < g.level; i++) { var px = (i - (g.level - 1) / 2) * 9, py = r * 0.86; c.beginPath(); c.arc(px, py, 3.4, 0, TAU); c.fillStyle = Art.theme.gold2; c.fill(); c.strokeStyle = Art.ink; c.lineWidth = 1.4; c.stroke(); }
    if (g.type === 'mult' || !need) { /* no ticks to show */ }
    c.restore();
  };
  Art.drawHeart = function (c, x, y, r, a, beat) {
    var T = Art.theme; c.save(); c.translate(x, y); inkStyle(c);
    teethPath(c, r, 12, a, 4); var gr = c.createRadialGradient(-r * 0.3, -r * 0.3, 2, 0, 0, r + 4); gr.addColorStop(0, Art.C(T.gold2)); gr.addColorStop(1, Art.C(T.gold)); c.fillStyle = gr; c.fill(); c.stroke();
    c.beginPath(); c.arc(0, 0, r * 0.74, 0, TAU); c.fillStyle = Art.C('#7a1f2a'); c.fill(); c.lineWidth = Art.lw * 0.7; c.stroke();
    c.scale(r / 34, r / 34);
    c.beginPath(); c.moveTo(0, 22); c.bezierCurveTo(-34, -2, -22, -26, -2, -12); c.bezierCurveTo(-1, -14, 0, -15, 0, -13); c.bezierCurveTo(0, -15, 1, -14, 2, -12); c.bezierCurveTo(22, -26, 34, -2, 0, 22); c.closePath();
    var hg = c.createRadialGradient(-8, -8, 2, 0, 0, 30); hg.addColorStop(0, Art.C('#ff7a7a')); hg.addColorStop(1, Art.C('#c42b3c')); c.fillStyle = hg; c.fill(); c.lineWidth = 2.6; c.stroke();
    c.beginPath(); c.ellipse(-10, -9, 5.5, 3.4, -0.6, 0, TAU); c.fillStyle = 'rgba(255,255,255,0.55)'; c.fill();
    c.restore();
    // the turning mark at the edge of the heart
    c.save(); c.translate(x, y); c.rotate(a); inkStyle(c);
    c.beginPath(); c.moveTo(r + 7, 0); c.lineTo(r - 5, -6); c.lineTo(r - 5, 6); c.closePath(); fillStroke(c, Art.C('#fff1a8'));
    c.restore();
  };

  // ---- the battlefield ---------------------------------------------------------------------
  function noise1(i) { var s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
  function hills(c, bf, scroll, par, base, amp, freq, fill, seed, edge) {
    c.beginPath(); c.moveTo(bf.x, bf.y + bf.h);
    for (var x = 0; x <= bf.w + 20; x += 20) {
      var wx = (x + scroll * par) * freq, y = base - (Math.sin(wx + seed) * 0.5 + Math.sin(wx * 2.3 + seed * 2) * 0.3 + Math.sin(wx * 0.4 + seed) * 0.5) * amp;
      c.lineTo(bf.x + x, y);
    }
    c.lineTo(bf.x + bf.w, bf.y + bf.h); c.closePath(); c.fillStyle = fill; c.fill();
    if (edge) { c.strokeStyle = Art.ink; c.lineWidth = Art.lw * 0.7; c.stroke(); }
  }
  function tree(c, x, y, s, col, kind) {
    c.beginPath(); c.rect(x - 3 * s, y - 14 * s, 6 * s, 14 * s); c.fillStyle = Art.C('#7a5230'); c.fill(); c.stroke();
    if (kind === 'pine') { poly(c, [x - 15 * s, y - 12 * s, x + 15 * s, y - 12 * s, x, y - 44 * s], col); poly(c, [x - 12 * s, y - 28 * s, x + 12 * s, y - 28 * s, x, y - 56 * s], col); }
    else { c.beginPath(); c.arc(x, y - 30 * s, 17 * s, 0, TAU); fillStroke(c, col); c.beginPath(); c.arc(x - 10 * s, y - 22 * s, 11 * s, 0, TAU); fillStroke(c, col); c.beginPath(); c.arc(x + 10 * s, y - 22 * s, 11 * s, 0, TAU); fillStroke(c, col); }
  }
  Art.groundY = function (bf) { return bf.y + bf.h - 118; };
  Art.drawBattlefield = function (c, bf, scroll, biome, t, castle) {
    var B = F.BIOMES[biome] || F.BIOMES.meadow, C = Art.C, T = Art.theme, gy = Art.groundY(bf), i;
    c.save(); c.beginPath(); c.rect(bf.x, bf.y, bf.w, bf.h); c.clip(); inkStyle(c);
    var g = c.createLinearGradient(0, bf.y, 0, gy); g.addColorStop(0, C(B[0])); g.addColorStop(1, C(B[1])); c.fillStyle = g; c.fillRect(bf.x, bf.y, bf.w, bf.h);
    // sun or moon, gold in the manuscript
    var sx = bf.x + bf.w * 0.78 - scroll * 0.05, sy = bf.y + bf.h * 0.2;
    if (biome === 'night') {
      for (i = 0; i < 40; i++) { c.fillStyle = 'rgba(255,240,180,' + (0.4 + 0.5 * Math.abs(Math.sin(t * 1.5 + i))).toFixed(2) + ')'; c.fillRect(bf.x + noise1(i) * bf.w, bf.y + noise1(i + 90) * (gy - bf.y) * 0.8, 2, 2); }
      c.beginPath(); c.arc(sx, sy, 24, 0, TAU); fillStroke(c, C('#fff0b8')); c.beginPath(); c.arc(sx + 9, sy - 4, 20, 0, TAU); c.fillStyle = C(B[0]); c.fill();
    } else {
      var disc = Art.themeKey === 'woodblock' || Art.themeKey === 'chinese' || Art.themeKey === 'egyptian';
      c.beginPath(); c.arc(sx, sy, 26, 0, TAU); fillStroke(c, disc ? C('#d9402e') : C(T.gold2));
      if (Art.themeKey === 'egyptian') { c.beginPath(); c.arc(sx, sy, 34, 0, TAU); c.strokeStyle = C(T.gold); c.lineWidth = 3; c.stroke(); c.strokeStyle = Art.ink; c.lineWidth = Art.lw; }
      if (!disc) for (i = 0; i < 12; i++) { var a = i * TAU / 12 + t * 0.05; c.beginPath(); c.moveTo(sx + Math.cos(a) * 31, sy + Math.sin(a) * 31); c.lineTo(sx + Math.cos(a) * 40, sy + Math.sin(a) * 40); c.stroke(); }
    }
    // little clouds
    c.fillStyle = C('#ffffff'); c.globalAlpha = 0.7;
    for (i = 0; i < 5; i++) { var cx = ((noise1(i + 3) * 1600 - scroll * 0.12 - t * (4 + i)) % 1700 + 1700) % 1700 - 100; c.beginPath(); c.ellipse(bf.x + cx, bf.y + 30 + i * 22, 40, 11, 0, 0, TAU); c.ellipse(bf.x + cx + 22, bf.y + 25 + i * 22, 28, 12, 0, 0, TAU); c.fill(); }
    c.globalAlpha = 1;
    hills(c, bf, scroll, 0.25, gy - 70, 36, 0.006, C(B[2]), 1, true);
    if (biome === 'mountain') { for (i = 0; i < 8; i++) { var mx = bf.x + ((i * 340 - scroll * 0.4) % 2720 + 2720) % 2720 - 200; poly(c, [mx - 90, gy - 20, mx, gy - 150 - noise1(i) * 40, mx + 90, gy - 20], C('#9aa6c2')); poly(c, [mx - 22, gy - 120 - noise1(i) * 40, mx, gy - 150 - noise1(i) * 40, mx + 22, gy - 120 - noise1(i) * 40, mx, gy - 112 - noise1(i) * 40], C('#ffffff')); } }
    hills(c, bf, scroll, 0.5, gy - 28, 26, 0.009, C(B[3]), 5, true);
    for (i = 0; i < 14; i++) {
      var wx = i * 190 + noise1(i + 40) * 90, px = bf.x + wx - scroll * 0.7; px = ((px + 300) % 2700) - 300 + 0;
      if (px < bf.x - 80 || px > bf.x + bf.w + 80) continue;
      if (biome === 'forest') tree(c, px, gy - 6, 1.3, C('#3f7a52'), 'pine');
      else if (biome === 'meadow' || biome === 'plains') { if (i % 3 === 0) tree(c, px, gy - 6, 1.1, C('#5ea35a'), 'round'); }
      else if (biome === 'hills') { if (i % 3 === 0) tree(c, px, gy - 6, 1.0, C('#7a9a58'), 'round'); }
      else if (biome === 'marsh') { for (var k = 0; k < 4; k++) seg(c, px + k * 6, gy - 4, px + k * 6 + Math.sin(t + k + i) * 3, gy - 30 - k * 3, 3, C('#6a8c5a')); }
      else if (biome === 'fortress') { if (i % 2 === 0) { c.beginPath(); c.rect(px - 16, gy - 70, 32, 70); fillStroke(c, C('#6e4e4a')); for (var m = 0; m < 3; m++) { c.beginPath(); c.rect(px - 16 + m * 12, gy - 78, 8, 8); fillStroke(c, C('#6e4e4a')); } } }
      else if (biome === 'night') { if (i % 2 === 0) { c.beginPath(); c.rect(px - 10, gy - 90, 20, 90); fillStroke(c, C('#3d3d7a')); poly(c, [px - 14, gy - 90, px + 14, gy - 90, px, gy - 120], C('#5a4aa0')); c.fillStyle = C('#ffe08a'); c.fillRect(px - 2, gy - 70, 4, 7); } }
    }
    // ground
    var gg = c.createLinearGradient(0, gy - 10, 0, bf.y + bf.h); gg.addColorStop(0, C(B[4])); gg.addColorStop(1, C(mix(B[4], '#3a2a18', 0.45)));
    c.beginPath(); c.moveTo(bf.x, gy);
    for (var xx = 0; xx <= bf.w + 24; xx += 24) { c.lineTo(bf.x + xx, gy - 5 + Math.sin((xx + scroll) * 0.02) * 4); }
    c.lineTo(bf.x + bf.w, bf.y + bf.h); c.lineTo(bf.x, bf.y + bf.h); c.closePath(); c.fillStyle = gg; c.fill(); c.stroke();
    // grass, flowers, pebbles at world positions
    for (i = 0; i < 70; i++) {
      var gx = ((noise1(i + 7) * ((castle && castle.world) || F.WORLD)) - scroll), gyy = gy + 6 + noise1(i + 200) * (bf.y + bf.h - gy - 14);
      if (gx < -20 || gx > bf.w + 20) continue;
      if (i % 3 === 0) { seg(c, bf.x + gx, gyy, bf.x + gx - 4, gyy - 9, 2, C('#4c8b4c')); seg(c, bf.x + gx, gyy, bf.x + gx + 4, gyy - 8, 2, C('#4c8b4c')); }
      else if (i % 3 === 1) { seg(c, bf.x + gx, gyy, bf.x + gx, gyy - 9, 2, C('#4c8b4c')); circ(c, bf.x + gx, gyy - 11, 3.4, C(B[5])); }
      else { c.beginPath(); c.ellipse(bf.x + gx, gyy, 6, 3.4, 0, 0, TAU); fillStroke(c, C('#b4aa98')); }
    }
    // path
    c.fillStyle = 'rgba(120,90,50,0.16)'; c.fillRect(bf.x, gy + 12, bf.w, 38);
    if (castle) {
      Art.drawBase(c, bf, scroll, false, 1, t, castle.ebx);
      Art.drawBase(c, bf, scroll, true, castle.hpFrac, t, castle.ebx);
      (castle.towers || []).forEach(function (s) { Art.drawTower(c, bf, s.x - scroll + bf.x, s, t); });
    }
    c.restore();
  };
  // a small stone-thrower standing on a wall or tower
  function miniCatapult(c, x, y, flip, enemy, t, kick) {
    c.save(); c.translate(x, y); c.scale(flip, 1); inkStyle(c);
    var wood = Art.C(enemy ? '#7a4a38' : '#a8794a'), dk = Art.C(enemy ? '#4a2c24' : '#6e4a2a');
    poly(c, [-16, 0, 16, 0, 12, -9, -12, -9], wood);
    var ang = -2.3 + kick * 1.7; seg(c, 2, -14, 2 + Math.cos(ang) * 22, -14 + Math.sin(ang) * 22, 3.4, dk);
    circ(c, 2 + Math.cos(ang) * 22, -14 + Math.sin(ang) * 22, 3.6, Art.C('#8f8b82'));
    circ(c, -9, 3, 5, wood); circ(c, 10, 3, 5, wood); c.restore();
  }
  // a tower at 10% or 25% of the way across. A destroyed tower is rubble, then a scaffold that grows as it is rebuilt.
  Art.drawTower = function (c, bf, x, s, t) {
    if (x < bf.x - 120 || x > bf.x + bf.w + 120) return;
    var gy = Art.groundY(bf) + 18, C = Art.C, enemy = s.side === 'enemy', big = s.kind === 'tower2', w = big ? 62 : 48, h = big ? 138 : 100;
    var stone = C(enemy ? '#7d5a55' : '#d6c9a6'), dark = C(enemy ? '#5a3e3a' : '#b6a77f');
    c.save(); inkStyle(c);
    if (!s.alive) {
      var p = s.rebuild || 0;
      for (var i = 0; i < 7; i++) { var rx = x + (i - 3) * 9 + Math.sin(i * 7) * 3, rh = 6 + (i % 3) * 5; c.beginPath(); c.moveTo(rx - 7, gy); c.lineTo(rx - 3, gy - rh); c.lineTo(rx + 5, gy - rh * 0.8); c.lineTo(rx + 8, gy); c.closePath(); fillStroke(c, i % 2 ? stone : dark); }
      if (p > 0.02) {   // scaffold and the wall rising behind it
        var rh2 = h * p; c.beginPath(); c.rect(x - w / 2 + 4, gy - rh2, w - 8, rh2); fillStroke(c, stone);
        [-w / 2, w / 2].forEach(function (dx) { seg(c, x + dx, gy, x + dx, gy - Math.max(24, rh2 + 14), 3, C('#8a5a2e')); });
        seg(c, x - w / 2, gy - rh2 * 0.5, x + w / 2, gy - rh2 * 0.5, 2.6, C('#8a5a2e'));
        c.fillStyle = 'rgba(0,0,0,0.5)'; Art.rr(c, x - 24, gy + 6, 48, 7, 3.5); c.fill(); c.fillStyle = C('#e0a43a'); Art.rr(c, x - 22, gy + 8, 44 * p, 3.5, 2); c.fill();
      }
      c.restore(); return;
    }
    c.beginPath(); c.moveTo(x - w / 2, gy); c.lineTo(x - w / 2 + 3, gy - h); c.lineTo(x + w / 2 - 3, gy - h); c.lineTo(x + w / 2, gy); c.closePath(); fillStroke(c, stone);
    for (var j = 0; j < 4; j++) { c.beginPath(); c.rect(x - w / 2 + 1 + j * ((w - 2) / 4) + 1, gy - h - 11, (w - 2) / 4 - 3, 11); fillStroke(c, stone); }
    c.beginPath(); c.rect(x - 4, gy - h * 0.62, 8, 20); fillStroke(c, C('#2d1c18'));
    c.beginPath(); c.moveTo(x - 10, gy); c.lineTo(x - 10, gy - 22); c.arc(x, gy - 22, 10, Math.PI, 0); c.lineTo(x + 10, gy); c.closePath(); fillStroke(c, C('#4a2f1c'));
    seg(c, x, gy - h - 11, x, gy - h - 36, 2.6, C('#3a2a20'));
    var wv = Math.sin(t * 3 + x) * 3; poly(c, [x, gy - h - 35, x + 22, gy - h - 29 + wv, x, gy - h - 22], C(enemy ? '#b3402f' : Art.theme.ally));
    if (big) miniCatapult(c, x, gy - h - 11, enemy ? -1 : 1, enemy, t, (s.weapons[0] && s.weapons[0].t < 0.5) ? 1 : 0);
    else { c.fillStyle = C('#d9dde6'); c.beginPath(); c.moveTo(x - w / 2 + 4, gy - h - 14); c.lineTo(x - w / 2 + 12, gy - h - 22); c.stroke(); }
    if (s.flash > 0) { c.fillStyle = 'rgba(255,255,255,' + Math.min(0.6, s.flash * 4) + ')'; c.fillRect(x - w / 2, gy - h, w, h); }
    if (s.hp < s.max) { var bw = 56, by = gy - h - 52; c.fillStyle = 'rgba(0,0,0,0.5)'; Art.rr(c, x - bw / 2 - 1.5, by - 1.5, bw + 3, 9, 4); c.fill(); c.fillStyle = enemy ? C('#d9443a') : C('#4caf50'); Art.rr(c, x - bw / 2, by, Math.max(2, bw * s.hp / s.max), 6, 3); c.fill(); }
    c.restore();
  };
  Art.drawBase = function (c, bf, scroll, enemy, hpFrac, t, ebx) {
    var gy = Art.groundY(bf) + 14, C = Art.C, T = Art.theme, x = (enemy ? (ebx || F.ENEMY_BASE_X) : 0) - scroll + bf.x;
    if (x > bf.x + bf.w + 260 || x < bf.x - 300) return;
    c.save(); inkStyle(c);
    if (!enemy) {
      c.beginPath(); c.rect(x, gy - 78, 112, 78); fillStroke(c, C('#d9c9a4'));
      for (var i = 0; i < 4; i++) { c.beginPath(); c.rect(x + i * 30, gy - 92, 20, 15); fillStroke(c, C('#d9c9a4')); }
      c.beginPath(); c.rect(x + 80, gy - 128, 56, 128); fillStroke(c, C('#cdb98c'));
      poly(c, [x + 74, gy - 128, x + 142, gy - 128, x + 108, gy - 176], C('#2f55b5'));
      for (var j = 0; j < 3; j++) { c.beginPath(); c.rect(x + 88, gy - 118 + j * 34, 10, 18); fillStroke(c, C('#3a2a20')); }
      seg(c, x + 108, gy - 176, x + 108, gy - 210, 3, C('#3a2a20'));
      var w = Math.sin(t * 3) * 3; poly(c, [x + 108, gy - 208, x + 140, gy - 200 + w, x + 108, gy - 190], C(T.gold));
      c.beginPath(); c.moveTo(x + 18, gy); c.lineTo(x + 18, gy - 34); c.arc(x + 38, gy - 34, 20, Math.PI, 0); c.lineTo(x + 58, gy); c.closePath(); fillStroke(c, C('#5a3a22'));
      miniCatapult(c, x + 44, gy - 92, 1, false, t, 0);
      for (var sl = 0; sl < 3; sl++) { c.beginPath(); c.rect(x + 14 + sl * 30, gy - 66, 5, 14); fillStroke(c, C('#2d1c18')); }
    } else {
      var lean = 1 - hpFrac;
      c.beginPath(); c.moveTo(x + 6, gy); c.lineTo(x + 6, gy - 120 + lean * 50); c.lineTo(x + 26, gy - 130 + lean * 50); c.lineTo(x + 56, gy - 120 + lean * 50); c.lineTo(x + 56, gy); c.closePath(); fillStroke(c, C('#6e4a46'));
      c.beginPath(); c.rect(x + 56, gy - 90 + lean * 40, 100, 90 - lean * 40); fillStroke(c, C('#7a5650'));
      for (var m = 0; m < 5; m++) { c.beginPath(); c.rect(x + 56 + m * 22, gy - 102 + lean * 40, 14, 12); fillStroke(c, C('#7a5650')); }
      c.beginPath(); c.rect(x + 100, gy - 160 + lean * 60, 56, 160 - lean * 60); fillStroke(c, C('#6a4642'));
      poly(c, [x + 94, gy - 160 + lean * 60, x + 162, gy - 160 + lean * 60, x + 128, gy - 206 + lean * 60], C('#8a2f24'));
      c.beginPath(); c.moveTo(x + 66, gy); c.lineTo(x + 66, gy - 36); c.arc(x + 84, gy - 36, 18, Math.PI, 0); c.lineTo(x + 102, gy); c.closePath(); fillStroke(c, C('#2d1c18'));
      for (var r = 0; r < 6; r++) { c.fillStyle = 'rgba(180,90,40,0.55)'; c.beginPath(); c.ellipse(x + 20 + r * 24, gy - 40 - (r % 3) * 24, 7, 4, 0, 0, TAU); c.fill(); }   // rust patches
      miniCatapult(c, x + 88, gy - 100 + lean * 40, -1, true, t, 0);
      for (var sl2 = 0; sl2 < 3; sl2++) { c.beginPath(); c.rect(x + 66 + sl2 * 26, gy - 70 + lean * 40, 5, 14); fillStroke(c, C('#2d1c18')); }
      seg(c, x + 128, gy - 206 + lean * 60, x + 128, gy - 236 + lean * 60, 3, C('#3a2a20'));
      poly(c, [x + 128, gy - 234 + lean * 60, x + 98, gy - 224 + lean * 60 + Math.sin(t * 3) * 3, x + 128, gy - 214 + lean * 60], C('#e0b34a'));
      if (hpFrac < 0.5) { c.fillStyle = 'rgba(60,50,50,' + (0.5 - hpFrac).toFixed(2) + ')'; for (var s = 0; s < 4; s++) { c.beginPath(); c.arc(x + 60 + s * 30 + Math.sin(t * 2 + s) * 5, gy - 150 - ((t * 20 + s * 20) % 60), 10 + s * 3, 0, TAU); c.fill(); } }
    }
    c.restore();
  };

  // ---- projectiles and the shuriken ---------------------------------------------------------
  Art.drawProj = function (c, p, sx, sy, t) {
    inkStyle(c);
    if (p.kind === 'arrow') {
      var pr = Math.min(1, p.t / p.dur), dir = p.x1 >= p.x0 ? 1 : -1;
      c.save(); c.translate(sx, sy); c.scale(dir, 1); c.rotate((2 * pr - 1) * 0.9);
      seg(c, -14, 0, 8, 0, 2, Art.C('#8a5a2e')); poly(c, [8, -3, 15, 0, 8, 3], Art.C('#c3c9d4')); poly(c, [-14, 0, -19, -3, -17, 0, -19, 3], Art.C('#f4f0e0')); c.restore();
    } else if (p.kind === 'bolt') {
      var gr = c.createRadialGradient(sx, sy, 1, sx, sy, 16); gr.addColorStop(0, '#fff'); gr.addColorStop(0.4, p.side === 'enemy' ? '#ff7ad8' : '#7ad0ff'); gr.addColorStop(1, 'rgba(120,150,255,0)');
      c.fillStyle = gr; c.beginPath(); c.arc(sx, sy, 16, 0, TAU); c.fill();
    } else if (p.kind === 'stone') {
      c.save(); c.translate(sx, sy); c.rotate(t * 8); circ(c, 0, 0, 9, Art.C('#8f8b82')); c.beginPath(); c.moveTo(-4, -2); c.lineTo(3, 3); c.stroke(); c.restore();
    } else if (p.kind === 'rocket') {
      c.save(); c.translate(sx, sy); c.rotate(Math.atan2(p.y1 - p.y0 + 300, (p.x1 - p.x0) || 1) * 0 + Math.PI / 2 + (p.x1 > p.x0 ? -0.3 : 0.3));
      poly(c, [-5, 10, -5, -8, 0, -16, 5, -8, 5, 10], Art.C('#e5785a')); poly(c, [-5, 4, -11, 12, -5, 10], Art.C('#f2c94c')); poly(c, [5, 4, 11, 12, 5, 10], Art.C('#f2c94c'));
      c.fillStyle = Art.C('#ffd24a'); c.beginPath(); c.moveTo(-3, 11); c.lineTo(0, 24 + Math.random() * 6); c.lineTo(3, 11); c.fill(); c.restore();
    } else if (p.kind === 'shuriken') {
      var s = 22 * (p.scale || 1); c.save(); c.translate(sx, sy); c.rotate(t * 14);
      c.beginPath(); for (var i = 0; i < 8; i++) { var r = i % 2 ? s * 0.34 : s, a = i * Math.PI / 4; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath();
      fillStroke(c, Art.C('#c6d0dc')); circ(c, 0, 0, s * 0.18, Art.C('#6a7686')); c.restore();
    }
  };

  // ---- frames and textures ------------------------------------------------------------------
  var frames = {};
  Art.frame = function (w, h) {
    var k = w + 'x' + h; if (frames[k]) return frames[k];
    var cv = document.createElement('canvas'); cv.width = w; cv.height = h; var c = cv.getContext('2d'), T = Art.theme, key = Art.themeKey, m = 5, i;
    // speckle / grain
    var rnd = F.rng(5);
    for (i = 0; i < (key === 'tapestry' ? 0 : 280); i++) { c.fillStyle = 'rgba(' + (T.dark ? '255,255,255' : '90,60,20') + ',' + (0.03 + rnd() * 0.05).toFixed(3) + ')'; c.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 2); }
    if (key === 'tapestry') { c.strokeStyle = 'rgba(60,40,20,0.07)'; c.lineWidth = 1; for (i = 0; i < h; i += 4) { c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); } }
    if (key === 'woodblock') { c.strokeStyle = 'rgba(40,50,90,0.05)'; for (i = 0; i < h; i += 7) { c.beginPath(); c.moveTo(0, i + rnd() * 3); c.bezierCurveTo(w * 0.3, i + rnd() * 5, w * 0.6, i - rnd() * 5, w, i + rnd() * 3); c.stroke(); } }
    c.lineJoin = 'round'; c.lineCap = 'round';
    var C = Art.C;
    c.strokeStyle = T.ink; c.lineWidth = 3; c.strokeRect(m, m, w - m * 2, h - m * 2);
    c.strokeStyle = C(T.gold); c.lineWidth = key === 'stained' ? 8 : 4; c.strokeRect(m + 4, m + 4, w - m * 2 - 8, h - m * 2 - 8);
    c.strokeStyle = T.ink; c.lineWidth = 1.5; c.strokeRect(m + 9, m + 9, w - m * 2 - 18, h - m * 2 - 18);
    // border pattern
    var pat = [C('#2f55b5'), C('#b3402f'), C('#4c8b4c')];
    for (var side = 0; side < 4; side++) {
      var len = side % 2 ? h : w, step = 34;
      for (var s = 40; s < len - 40; s += step) {
        var x = side === 0 ? s : side === 2 ? s : side === 1 ? w - m - 2 : m + 2, y = side === 0 ? m + 2 : side === 2 ? h - m - 2 : s;
        c.fillStyle = pat[((s / step) | 0) % 3];
        if (key === 'manuscript') { c.beginPath(); c.ellipse(x, y, 5, 3, side % 2 ? 1.57 : 0, 0, TAU); c.fill(); c.fillStyle = C(T.gold); c.beginPath(); c.arc(x + (side % 2 ? 0 : step / 2), y + (side % 2 ? step / 2 : 0), 2.4, 0, TAU); c.fill(); }
        else if (key === 'tapestry') { c.fillRect(x - 3, y - 3, 6, 6); }
        else if (key === 'woodblock') { c.fillStyle = C('#c5392c'); if (((s / step) | 0) % 4 === 0) c.fillRect(x - 3, y - 3, 6, 6); }
        else if (key === 'aztec') { c.fillStyle = ((s / step) | 0) % 2 ? C('#1f8a7a') : C('#b8402a'); c.fillRect(x - 5, y - 2, 10, 4); c.fillRect(x - 2, y - 5, 4, 10); }
        else if (key === 'indian') { c.fillStyle = ((s / step) | 0) % 2 ? C('#b32c3a') : C(T.gold); for (var pt = 0; pt < 5; pt++) { c.beginPath(); c.arc(x + Math.cos(pt * 1.2566) * 3.6, y + Math.sin(pt * 1.2566) * 3.6, 2.2, 0, TAU); c.fill(); } }
        else if (key === 'spanish') { c.fillStyle = ((s / step) | 0) % 2 ? C('#2a6f8a') : C(T.gold); c.save(); c.translate(x, y); for (var sq = 0; sq < 2; sq++) { c.rotate(Math.PI / 4); c.fillRect(-3.5, -3.5, 7, 7); } c.restore(); }
        else if (key === 'persian') { c.fillStyle = ((s / step) | 0) % 2 ? C('#1f6f8a') : C(T.gold); c.save(); c.translate(x, y); c.rotate(Math.PI / 4); c.fillRect(-3.5, -3.5, 7, 7); c.restore(); }
        else if (key === 'egyptian') { c.fillStyle = [C('#b6502a'), C('#2a6fb0'), C(T.gold)][((s / step) | 0) % 3]; c.fillRect(x - 3, y - 6, 6, 12); }
        else if (key === 'chinese') { c.strokeStyle = C('#b0302a'); c.lineWidth = 1.8; c.beginPath(); c.arc(x, y, 4, 0, Math.PI * 1.5); c.arc(x + 4, y, 3, Math.PI, Math.PI * 2.4); c.stroke(); }
        else if (key === 'nouveau') { c.strokeStyle = C(T.gold); c.lineWidth = 1.6; c.beginPath(); c.arc(x, y, 5, 0, Math.PI * 1.3); c.stroke(); }
        else { c.fillRect(x - 5, y - 5, 10, 10); c.strokeStyle = T.ink; c.lineWidth = 2; c.strokeRect(x - 5, y - 5, 10, 10); }
      }
    }
    // corners
    [[m + 2, m + 2], [w - m - 2, m + 2], [m + 2, h - m - 2], [w - m - 2, h - m - 2]].forEach(function (p, ci) {
      c.fillStyle = C(T.gold); c.strokeStyle = T.ink; c.lineWidth = 2; c.beginPath(); c.arc(p[0], p[1], 13, 0, TAU); c.fill(); c.stroke();
      c.fillStyle = pat[ci % 3]; c.beginPath(); c.arc(p[0], p[1], 7, 0, TAU); c.fill(); c.stroke();
      c.fillStyle = C(T.gold2); c.beginPath(); c.arc(p[0] - 2, p[1] - 2, 2.2, 0, TAU); c.fill();
    });
    if (key === 'chinese') { c.fillStyle = C('#b0302a'); c.fillRect(w - 60, h - 70, 26, 26); c.fillStyle = '#f0e8d2'; c.font = '900 16px Georgia'; c.fillText('兵', w - 55, h - 50); }
    if (key === 'woodblock') { c.fillStyle = C('#c5392c'); c.fillRect(w - 60, h - 70, 26, 26); c.fillStyle = '#f1e6cf'; c.font = '900 16px Georgia'; c.fillText('ギ', w - 54, h - 50); }
    frames[k] = cv; return cv;
  };
  // the gold star that marks a culture's specialty fighter (+25%)
  Art.starBadge = function (c, x, y, size) {
    c.save(); c.translate(x, y); c.lineJoin = 'round'; c.beginPath();
    for (var k = 0; k < 10; k++) { var rr2 = k % 2 ? size * 0.45 : size, an = -Math.PI / 2 + k * Math.PI / 5; c.lineTo(Math.cos(an) * rr2, Math.sin(an) * rr2); }
    c.closePath(); c.fillStyle = Art.C('#ffd23c'); c.fill(); c.lineWidth = 2; c.strokeStyle = Art.ink; c.stroke(); c.restore();
  };
  Art.stars = function (c, x, y, n, size, filled) {
    for (var i = 0; i < 3; i++) {
      c.save(); c.translate(x + (i - 1) * size * 1.15, y); inkStyle(c); c.beginPath();
      for (var k = 0; k < 10; k++) { var r = k % 2 ? size * 0.22 : size * 0.5, a = -Math.PI / 2 + k * Math.PI / 5; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      c.closePath(); c.fillStyle = i < n ? Art.C(Art.theme.gold2) : 'rgba(0,0,0,0.18)'; c.fill(); c.stroke(); c.restore();
    }
  };

  window.Art = Art;
})();
