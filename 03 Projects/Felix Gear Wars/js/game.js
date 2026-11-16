// Felix Gear Wars: the screen. Layout, input (drag gears, tap buttons, pan the battlefield), effects, camera, HUD,
// the campaign map, story cards and results. The rules live in sim.js; the pictures in art.js; the sounds in audio.js.
(function () {
  'use strict';
  var F = globalThis.FGW, Art = window.Art, Au = window.GAudio, TAU = Math.PI * 2;
  var GW = window.GW = { version: F.version, errors: [], err: null, sim: function () { return sim; } };
  function $(id) { return document.getElementById(id); }

  // ---- errors (opt-in panel at the bottom) ---------------------------------------------------
  GW.err = function (msg, e) {
    var line = new Date().toLocaleTimeString() + '  ' + msg + (e ? ': ' + (e.message || e) : '');
    GW.errors.push(line); if (GW.errors.length > 80) GW.errors.shift(); renderErrors();
  };
  function renderErrors() {
    var p = $('errorsPanel'); if (!p) return;
    p.textContent = GW.errors.length ? GW.errors.join('\n') : 'No problems so far.';
    p.hidden = !S.showErrors;
  }
  window.addEventListener('error', function (ev) { GW.err('Page error', ev.error || ev.message); });
  window.addEventListener('unhandledrejection', function (ev) { GW.err('Promise error', ev.reason); });

  // ---- settings and progress (device storage, always in try/catch) -----------------------------
  var DEF = { funPeak: 3, funFade: 7, challenge: 1, bossRevs: 100, voice: 'auto', heartSpeed: 1, theme: 'manuscript', sfx: 0.8, music: 0.5, speed: 1, quick: 0, follow: 1, reading: 'auto', showErrors: 0 };
  var S = Object.assign({}, DEF);
  try { var raw = JSON.parse(localStorage.getItem('fgw.settings') || '{}'); Object.keys(DEF).forEach(function (k) { if (raw[k] !== undefined) S[k] = raw[k]; }); } catch (e) { /* storage blocked */ }
  function saveSettings() { try { localStorage.setItem('fgw.settings', JSON.stringify(S)); } catch (e) { /* ignore */ } }
  var P = { stars: {}, fails: {}, freeBest: 0 };
  try { var pr = JSON.parse(localStorage.getItem('fgw.progress') || '{}'); P.stars = pr.stars || {}; P.fails = pr.fails || {}; P.freeBest = pr.freeBest || 0; } catch (e) { /* ignore */ }
  function saveProgress() { try { localStorage.setItem('fgw.progress', JSON.stringify(P)); } catch (e) { /* ignore */ } }
  GW.settings = S; GW.progress = P;

  // ---- canvas and layout -----------------------------------------------------------------------
  var cv = $('cv'), ctx = cv.getContext('2d'), CW = 1, CH = 1, SC = 1, OX = 0, OY = 0, W = F.VIEW_W, H = 720, DPR = 1;
  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    CW = window.innerWidth; CH = window.innerHeight;
    var h0 = CH / (CW / W); H = Math.max(600, Math.min(1000, h0));
    SC = Math.min(CW / W, CH / H); OX = (CW - W * SC) / 2; OY = (CH - H * SC) / 2;
    cv.width = Math.round(CW * DPR); cv.height = Math.round(CH * DPR); cv.style.width = CW + 'px'; cv.style.height = CH + 'px';
    layout();
  }
  var L = {};
  function layout() {
    var cols = sim ? sim.cols : 7, rows = sim ? sim.rows : 3;
    var cs = Math.min(80, Math.floor((H * 0.4 - 24) / rows)); cs = Math.max(52, cs);
    L.cs = cs; L.bx = 24; L.by = 84; L.bw = cols * cs + 24; L.bh = rows * cs + 24;
    var tx = L.bx + L.bw + 16; L.tray = { x: tx, y: L.by, w: W - 22 - tx, h: L.bh };
    var top = L.by + L.bh + 12; L.bf = { x: 0, y: top, w: W, h: H - top };
    L.mini = { x: 360, y: H - 38, w: 560, h: 20 };
  }
  function cellX(c) { return L.bx + 12 + c * L.cs + L.cs / 2; }
  function cellY(r) { return L.by + 12 + r * L.cs + L.cs / 2; }
  function cellAt(x, y) {
    var c = Math.floor((x - L.bx - 12) / L.cs), r = Math.floor((y - L.by - 12) / L.cs);
    if (!sim || c < 0 || r < 0 || c >= sim.cols || r >= sim.rows) return null; return [c, r];
  }

  // ---- state -----------------------------------------------------------------------------------
  var sim = null, cfg = null, scroll = 0, manualUntil = 0, paused = false, screen = 'map', tAnim = 0, last = 0;
  var parts = [], bolts = [], falls = {}, banner = null, shake = 0, redFlash = 0, beat = 0, selSlot = -1, selGear = 0, info = null, toast = null, endTimer = 0, ended = false;
  var drag = null, hudBtns = [], pointers = {};
  function makeSim(c) {
    cfg = c; sim = new F.Sim(c, { seed: (Math.random() * 1e9) | 0, heartSpeed: +S.heartSpeed || 1, specialty: Art.specialty(), funPeak: +S.funPeak || 3, funFade: +S.funFade || 7, challenge: +S.challenge || 1 });
    sim.speed = +S.speed; scroll = 0; parts = []; bolts = []; falls = {}; banner = null; selSlot = -1; selGear = 0; info = null; ended = false; endTimer = 0; paused = false;
    layout();
  }

  // ---- text and small shapes -------------------------------------------------------------------
  var SERIF = 'Georgia, "Times New Roman", serif', SANS = '"Trebuchet MS", "Segoe UI", system-ui, sans-serif';
  function txt(c, s, x, y, size, col, align, font) {
    c.font = (font || '700') + ' ' + size + 'px ' + SANS; c.fillStyle = col || Art.theme.text; c.textAlign = align || 'left'; c.textBaseline = 'middle'; c.fillText(s, x, y);
  }
  function panel(c, x, y, w, h, fill, r) {
    c.save(); c.fillStyle = 'rgba(0,0,0,0.22)'; Art.rr(c, x + 2, y + 5, w, h, r || 16); c.fill(); c.restore();
    Art.rr(c, x, y, w, h, r || 16); c.fillStyle = fill || Art.theme.panel; c.fill(); c.lineWidth = Art.lw; c.strokeStyle = Art.ink; c.stroke();
  }
  function coinIcon(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = Art.C(Art.theme.gold2); c.fill(); c.lineWidth = 2; c.strokeStyle = Art.ink; c.stroke(); c.beginPath(); c.arc(x, y, r * 0.6, 0, TAU); c.strokeStyle = Art.C(Art.theme.gold); c.stroke(); }
  function heartIcon(c, x, y, s) {
    c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(0, 8); c.bezierCurveTo(-14, -2, -9, -11, 0, -5); c.bezierCurveTo(9, -11, 14, -2, 0, 8); c.closePath();
    c.fillStyle = Art.C('#d63a4a'); c.fill(); c.lineWidth = 2 / s; c.strokeStyle = Art.ink; c.stroke(); c.restore();
  }
  function button(c, b, active) {
    var hot = b.down; panel(c, b.x, b.y + (hot ? 3 : 0), b.w, b.h - (hot ? 3 : 0), b.fill || Art.C(Art.theme.btn), 14);
    c.save(); c.translate(b.x + b.w / 2 + (b.label ? -30 : 0), b.y + b.h / 2 + (hot ? 2 : 0)); c.strokeStyle = Art.ink; c.fillStyle = Art.ink; c.lineWidth = 3.2; c.lineCap = 'round'; c.lineJoin = 'round';
    if (b.icon === 'pause') { c.fillRect(-9, -10, 6, 20); c.fillRect(3, -10, 6, 20); }
    else if (b.icon === 'play') { c.beginPath(); c.moveTo(-8, -11); c.lineTo(11, 0); c.lineTo(-8, 11); c.closePath(); c.fill(); }
    else if (b.icon === 'next') { c.beginPath(); c.moveTo(-14, -10); c.lineTo(0, 0); c.lineTo(-14, 10); c.closePath(); c.fill(); c.beginPath(); c.moveTo(0, -10); c.lineTo(14, 0); c.lineTo(0, 10); c.closePath(); c.fill(); }
    else if (b.icon === 'undo') { c.beginPath(); c.arc(0, 2, 10, Math.PI * 1.15, Math.PI * 2.05); c.stroke(); c.beginPath(); c.moveTo(-14, -3); c.lineTo(-9, -12); c.lineTo(-3, -4); c.closePath(); c.fill(); }
    else if (b.icon === 'home') { c.beginPath(); c.moveTo(-12, 0); c.lineTo(0, -12); c.lineTo(12, 0); c.stroke(); c.strokeRect(-8, 0, 16, 11); }
    else if (b.icon === 'speed') { c.font = '900 22px ' + SANS; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('×' + sim.speed, 0, 1); }
    c.restore();
    if (b.label) txt(c, b.label, b.x + b.w / 2 - 6, b.y + b.h / 2 + 1, 22, Art.ink, 'left', '900');
  }

  // ---- particles and effects -------------------------------------------------------------------
  function puff(x, y, n, col, spread, up) {
    for (var i = 0; i < n; i++) parts.push({ k: 'dot', x: x + (Math.random() - 0.5) * spread, y: y, vx: (Math.random() - 0.5) * 70, vy: -(Math.random() * 50 + (up || 20)), g: 90, life: 0.6 + Math.random() * 0.4, max: 1, r: 4 + Math.random() * 6, col: col || '#d9cdb4' });
  }
  function sparks(x, y, n, col) {
    for (var i = 0; i < n; i++) { var a = Math.random() * TAU, v = 80 + Math.random() * 160; parts.push({ k: 'spark', x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, g: 300, life: 0.3 + Math.random() * 0.25, max: 1, r: 2 + Math.random() * 2, col: col || '#fff2a0' }); }
  }
  function ring(x, y, r, col) { parts.push({ k: 'ring', x: x, y: y, vx: 0, vy: 0, g: 0, life: 0.45, max: 1, r: r, col: col || '#fff2a0' }); }
  function floatText(x, y, s, col) { parts.push({ k: 'text', x: x, y: y, vx: 0, vy: -50, g: 0, life: 1.0, max: 1, s: s, col: col || '#fff' }); }
  function ux(u) { return u.x - scroll + L.bf.x; }
  function uy(u) { return Art.groundY(L.bf) + 14 + u.y; }
  function coinFly(x, y, n) {
    var cnt = Math.min(5, 1 + Math.floor(n / 6));
    for (var i = 0; i < cnt; i++) parts.push({ k: 'coin', x: x, y: y, vx: (Math.random() - 0.5) * 120, vy: -120 - Math.random() * 80, g: 400, life: 1.1, max: 1, r: 7, t: 0 });
  }
  function gearPos(c, r) { return [cellX(c), cellY(r)]; }

  function handleEvents() {
    var ev = sim.events; sim.events = [];
    for (var i = 0; i < ev.length; i++) {
      var e = ev[i], p;
      switch (e.k) {
        
        case 'place': Au.play('place'); break;
        case 'merge': Au.play('merge'); var gm = sim.gearById(e.id); if (gm) { p = gearPos(gm.c, gm.r); sparks(p[0], p[1], 22, '#fff2a0'); ring(p[0], p[1], 50); } break;
        case 'pop': if (e.champ) { banner = { text: 'A champion!', t: 0, boss: false }; Au.play('horn', false); } p = gearPos(e.c, e.r); falls[e.unit] = { sx: p[0], sy: p[1] }; Au.play('pop', e.type); sparks(p[0], p[1] + 20, 8, '#fff7c8'); puff(p[0], p[1] + 28, 4, '#fff7e0', 20, 10); break;
        case 'land': puff(e.x - scroll, Art.groundY(L.bf) + 14 + e.y, 7, '#cdbf9e', 28, 10); Au.play('land'); break;
        case 'slash': sparks(e.x - scroll, Art.groundY(L.bf) - 30 + (e.y || 0), 6, e.side === 'ally' ? '#fff2a0' : '#ffb0a0'); Au.play('slash', e.type); break;
        case 'hit': if (e.x - scroll > -60 && e.x - scroll < W + 60) { if (e.dmg > 6 && parts.length < 120 && Math.random() < 0.5) floatText(e.x - scroll, Art.groundY(L.bf) - 80 + e.y, String(Math.round(e.dmg)), e.side === 'enemy' ? '#fff3b0' : '#ffb3a8'); } Au.play('hit', e.big); break;
        case 'shot': if (!e.struct || (e.x - scroll > -100 && e.x - scroll < W + 100)) Au.play(e.kind === 'arrow' ? 'arrow' : e.kind === 'bolt' ? 'bolt' : 'stone'); break;
        case 'arrowhit': sparks(e.x - scroll, Art.groundY(L.bf) - 24 + (e.y || 0), 4, '#ffffff'); break;
        case 'boom': var bx = e.x - scroll, by = Art.groundY(L.bf) + 10; ring(bx, by - 20, e.r * 0.7, '#ffcf70'); puff(bx, by - 10, 10, '#8b7d6a', e.r, 30); sparks(bx, by - 20, 14, '#ffb050'); Au.play('boom'); shake = Math.max(shake, e.kind === 'rocket' ? 5 : 8); break;
        case 'bolt': p = gearPos(e.c, e.r); bolts.push({ x1: e.x - scroll + (Math.random() - 0.5) * 30, y1: L.bf.y - 20, x2: e.x - scroll, y2: Art.groundY(L.bf) + 10 + e.y, t: 0 }); Au.play('lightning'); ring(e.x - scroll, Art.groundY(L.bf), 40, '#fffbc0'); sparks(e.x - scroll, Art.groundY(L.bf) - 20, 10, '#fffbc0'); break;
        case 'launch': p = gearPos(e.c, e.r); sparks(p[0], p[1], 10, '#ffd070'); Au.play('launch'); break;
        case 'coin': coinFly(e.x - scroll, Art.groundY(L.bf) - 40 + e.y, e.n); floatText(e.x - scroll, Art.groundY(L.bf) - 100, '+' + e.n, '#ffe27a'); Au.play('coin'); break;
        case 'die': puff(e.x - scroll, Art.groundY(L.bf) - 20, e.boss ? 18 : 6, '#e8dfc8', 30, 30); if (e.boss) { shake = 12; Au.play('boom'); } break;
        case 'leak': redFlash = 1; shake = Math.max(shake, 6); Au.play('leak'); floatText(F.BASE_X, Art.groundY(L.bf) - 60, '-' + e.n, '#ff8a80'); break;
        case 'wave': banner = { text: e.boss ? 'Boss wave!' : 'Wave ' + e.n + ' of ' + (e.total === Infinity ? '∞' : e.total), t: 0, boss: e.boss }; Au.play('horn', e.boss); if (window.AppNotes) AppNotes.setContext({ label: cfg.title + ' ' + levelLabel() + ', wave ' + e.n }); Au.mood('battle', cfg.ch); break;
        case 'breath': for (var bi = 0; bi < 30; bi++) parts.push({ k: 'spark', x: e.x - scroll + e.dir * (24 + Math.random() * e.range * 0.9), y: Art.groundY(L.bf) - 70 + Math.random() * 60, vx: e.dir * (50 + Math.random() * 120), vy: -10 - Math.random() * 40, g: -30, life: 0.5 + Math.random() * 0.4, max: 1, r: 5 + Math.random() * 8, col: ['#ffb02e', '#ff6a2e', '#ffe27a'][bi % 3] }); shake = Math.max(shake, 4); Au.play('launch'); break;
        case 'heal': for (var hi = 0; hi < 14; hi++) parts.push({ k: 'spark', x: e.x - scroll + (Math.random() - 0.5) * e.r * 1.4, y: Art.groundY(L.bf) - 30 - Math.random() * 60, vx: 0, vy: -40 - Math.random() * 50, g: 0, life: 0.7, max: 1, r: 4, col: ['#6be07a', '#ffd24a', '#7ad0ff'][hi % 3] }); ring(e.x - scroll, Art.groundY(L.bf) - 20, e.r * 0.5, '#8be89a'); Au.play('merge'); break;
        case 'quake': ring(e.x - scroll, Art.groundY(L.bf) + 10, e.r, '#d9c9a0'); puff(e.x - scroll, Art.groundY(L.bf), 12, '#a89878', e.r * 1.6, 20); shake = Math.max(shake, 7); Au.play('boom'); break;
        case 'fade': banner = { text: 'The Horde loses heart!', t: 0, boss: false }; Au.play('horn', false); say('Break the fortress to finish!'); break;
        case 'structhit': if (e.kind === 'fortress' || e.kind.indexOf('tower') === 0) { sparks(e.x - scroll, Art.groundY(L.bf) - 50, 4, '#ffd090'); } Au.play('base'); break;
        case 'structdown': if (e.kind !== 'fortress') { puff(e.x - scroll, Art.groundY(L.bf) - 30, 22, '#8a7a68', 90, 40); sparks(e.x - scroll, Art.groundY(L.bf) - 40, 16, '#ffb050'); shake = Math.max(shake, 8); Au.play('boom'); say(e.side === 'enemy' ? 'An enemy tower fell!' : 'Your tower fell. It will be rebuilt.'); } break;
        case 'structup': ring(e.x - scroll, Art.groundY(L.bf) - 40, 60, '#fff2a0'); sparks(e.x - scroll, Art.groundY(L.bf) - 40, 12, '#fff2a0'); Au.play('merge'); break;
        case 'basehit': Au.play('base'); sparks(sim.ebx - scroll + 60, Art.groundY(L.bf) - 40, 6, '#ffd090'); break;
        case 'basefall': shake = 14; Au.play('boom'); puff(sim.ebx - scroll + 80, Art.groundY(L.bf) - 50, 30, '#7a6a60', 160, 40); break;
        case 'end': ended = true; endTimer = 1.2; Au.mood('off'); Au.play(e.win ? 'win' : 'lose'); break;
      }
    }
  }
  function levelLabel() { return cfg.free ? '' : (cfg.ch + '·' + cfg.lv); }

  // ---- drawing: HUD ----------------------------------------------------------------------------
  function drawHUD(c) {
    var T = Art.theme; hudBtns = [];
    var hy = 18; panel(c, 22, hy, W - 44, 56, Art.C(T.panel), 16);
    heartIcon(c, 54, hy + 28, 1.4); txt(c, String(sim.lives), 76, hy + 29, 28, T.text);
    c.fillStyle = 'rgba(0,0,0,0.15)'; Art.rr(c, 76, hy + 43, 70, 6, 3); c.fill();
    c.fillStyle = Art.C('#d63a4a'); Art.rr(c, 76, hy + 43, Math.max(2, 70 * sim.lives / sim.maxLives), 6, 3); c.fill();
    coinIcon(c, 196, hy + 28, 13); txt(c, String(Math.floor(sim.coins)), 216, hy + 29, 28, T.text);
    var title = cfg.free ? 'Free-for-all' : 'Chapter ' + cfg.ch + ' · Level ' + cfg.lv;
    txt(c, title, 340, hy + 17, 18, T.text, 'left', '800'); txt(c, cfg.free ? 'Wave ' + Math.max(0, sim.waveIdx + 1) + '  (best ' + P.freeBest + ')' : 'Wave ' + Math.max(0, sim.waveIdx + 1) + ' / ' + sim.waveCount, 340, hy + 39, 16, T.text, 'left', '600');
    var army = sim.alliesAlive(); txt(c, 'Army ' + army + '/' + F.MAX_UNITS, 450, hy + 39, 16, army >= F.MAX_UNITS ? Art.C('#c0392b') : T.text, 'left', '700');
    var bx = W - 34 - 68;
    function add(id, icon, w, fill) { var b = { id: id, icon: icon, x: bx - (w - 64), y: hy + 4, w: w, h: 48, fill: fill }; bx -= w + 8; hudBtns.push(b); return b; }
    add('home', 'home', 64); add('pause', paused ? 'play' : 'pause', 64); add('speed', 'speed', 64); add('undo', 'undo', 64);
    if (sim.status === 'build') add('go', 'play', 124, Art.C('#8fd18a')).label = 'Start';
    else if (sim.status === 'running' && sim.waveIdx + 1 < sim.waveCount && sim.waveTimer > 2) add('next', 'next', 96, Art.C('#8fd18a'));
    hudBtns.forEach(function (b) { button(c, b); });
    // pace of the next wave
    if (sim.status === 'running' && sim.waveIdx + 1 < sim.waveCount && isFinite(sim.waveTimer)) {
      var wt = Math.max(0, sim.waveTimer), fr = 1 - Math.min(1, wt / sim.gap);
      c.fillStyle = 'rgba(0,0,0,0.15)'; Art.rr(c, 560, 44, 150, 8, 4); c.fill(); c.fillStyle = Art.C('#e0a43a'); Art.rr(c, 560, 44, Math.max(3, 150 * fr), 8, 4); c.fill();
      txt(c, 'next wave', 560, 29, 14, Art.theme.text, 'left', '600');
    }
  }

  // ---- drawing: pegboard and tray ---------------------------------------------------------------
  function gearAngle(g) {
    var par = (g.c + g.r + sim.heart.c + sim.heart.r) % 2, th = sim.heartA;
    var a = par ? -th + Math.PI / 12 : th;
    if (g.type === 'boss' && g.active) { g.rot = (par ? Math.PI / 12 : 0) + TAU * Math.min(1, (g.charge || 0) / Math.max(1, F.ticksNeeded('boss', g.level))); return g.rot; }
    if (g.rot === undefined) g.rot = par ? Math.PI / 12 : 0;
    if (g.active) { var d = Math.atan2(Math.sin(a - g.rot), Math.cos(a - g.rot)); g.rot += d * Math.min(1, 0.25 + Math.abs(d)); }
    return g.rot;
  }
  function drawBoard(c) {
    var T = Art.theme;
    panel(c, L.bx, L.by, L.bw, L.bh, Art.C(T.panel2), 18);
    // pegs
    var r, cc;
    for (r = 0; r < sim.rows; r++) for (cc = 0; cc < sim.cols; cc++) {
      var x = cellX(cc), y = cellY(r);
      if (sim.isHole(cc, r)) {
        c.beginPath(); c.arc(x, y, L.cs * 0.4, 0, TAU); c.fillStyle = 'rgba(30,20,10,0.55)'; c.fill(); c.lineWidth = 2; c.strokeStyle = Art.ink; c.stroke();
        c.beginPath(); c.moveTo(x - 12, y - 12); c.lineTo(x + 12, y + 12); c.moveTo(x + 12, y - 12); c.lineTo(x - 12, y + 12); c.lineWidth = 3; c.stroke();
      } else if (!sim.isHeart(cc, r)) { c.beginPath(); c.arc(x, y, 4, 0, TAU); c.fillStyle = Art.C(T.gold); c.fill(); c.lineWidth = 1.5; c.strokeStyle = Art.ink; c.stroke(); }
    }
    // drop-target hints while dragging
    if (drag && (drag.kind === 'gear' || drag.kind === 'card') && drag.moved) {
      for (r = 0; r < sim.rows; r++) for (cc = 0; cc < sim.cols; cc++) {
        var g0 = sim.gearAt(cc, r), ok = false;
        if (drag.kind === 'card') ok = sim.isFree(cc, r);
        else { if (!sim.isHole(cc, r) && !sim.isHeart(cc, r)) { var s = drag.gear; ok = !g0 ? true : sim.canMerge(s, g0) ? 'merge' : !g0.locked; if (g0 === s) ok = false; } }
        if (ok) { c.beginPath(); c.arc(cellX(cc), cellY(r), L.cs * 0.42, 0, TAU); c.lineWidth = 3; c.setLineDash([6, 6]); c.strokeStyle = ok === 'merge' ? Art.C('#ffd24a') : 'rgba(255,255,255,0.8)'; c.stroke(); c.setLineDash([]); }
      }
    }
    var cs = L.cs / 2, i;
    Art.drawHeart(c, cellX(sim.heart.c), cellY(sim.heart.r), cs, sim.heartA, 0);
    for (i = 0; i < sim.gears.length; i++) {
      var g = sim.gears[i]; if (drag && drag.kind === 'gear' && drag.gear === g && drag.moved) continue;
      g.need = F.ticksNeeded(g.type, g.level);
      Art.drawGear(c, g, cellX(g.c), cellY(g.r), cs, gearAngle(g), { glow: g.ready || (selGear === g.id), star: g.type === Art.specialty() });
    }
  }
  function cardRects() {
    var t = L.tray, cardW = (t.w - 24 - 16) / 3, ch = t.h - 112, out = [];
    for (var i = 0; i < 3; i++) out.push({ x: t.x + 12 + i * (cardW + 8), y: t.y + 12, w: cardW, h: ch });
    return out;
  }
  function drawTray(c) {
    var T = Art.theme, t = L.tray; panel(c, t.x, t.y, t.w, t.h, Art.C(T.panel), 18);
    var cards = cardRects(), i;
    for (i = 0; i < 3; i++) {
      var r = cards[i], type = sim.tray[i], cost = type ? sim.priceOf(type) : 0, can = type && sim.coins >= cost, sel = selSlot === i;
      if (drag && drag.kind === 'card' && drag.slot === i && drag.moved) { c.globalAlpha = 0.4; }
      panel(c, r.x, r.y, r.w, r.h, sel ? Art.C(T.gold2) : Art.C(T.panel2), 14);
      if (type) {
        var fake = { type: type, level: 1, charge: 0, need: F.ticksNeeded(type, 1), active: false, locked: false, pulse: 0 };
        var gr = Math.min(r.w * 0.3, 34);
        c.save(); if (!can) c.globalAlpha *= 0.55;
        Art.drawGear(c, fake, r.x + r.w / 2, r.y + 14 + gr + 6, gr, tAnim * 0.6 * (i % 2 ? -1 : 1), { star: type === Art.specialty() });
        c.restore();
        var nm = Art.unitName(type); txt(c, nm, r.x + r.w / 2, r.y + r.h - 44, 15, T.text, 'center', '800');
        coinIcon(c, r.x + r.w / 2 - 20, r.y + r.h - 20, 10); txt(c, String(cost), r.x + r.w / 2 - 6, r.y + r.h - 19, 20, can ? T.text : Art.C('#c0392b'), 'left', '900');
      }
      c.globalAlpha = 1;
    }
    // refresh + sell hint + info
    var by = t.y + t.h - 88;
    var rb = { id: 'refresh', x: t.x + 12, y: by + 10, w: 120, h: 52 };
    panel(c, rb.x, rb.y + (rb.down ? 3 : 0), rb.w, rb.h, Art.C(T.btn), 14);
    c.save(); c.translate(rb.x + 30, rb.y + 26); c.strokeStyle = Art.ink; c.lineWidth = 3.2; c.lineCap = 'round'; c.beginPath(); c.arc(0, 0, 10, 0.3, Math.PI * 1.6); c.stroke(); c.beginPath(); c.moveTo(8, -12); c.lineTo(13, -3); c.lineTo(3, -3); c.closePath(); c.fillStyle = Art.ink; c.fill(); c.restore();
    coinIcon(c, rb.x + 70, rb.y + 26, 9); txt(c, '10', rb.x + 84, rb.y + 27, 20, T.text, 'left', '900');
    hudBtns.push(rb);
    var ix = t.x + 144, iw = t.w - 156;
    if (info && info.until > tAnim) { txt(c, info.a, ix, by + 16, 17, T.text, 'left', '800'); txt(c, info.b, ix, by + 40, 14, T.text, 'left', '600'); txt(c, info.c, ix, by + 62, 14, T.text, 'left', '600'); }
    else { txt(c, 'Drag a gear to a peg. Same kind on same kind: merge!', ix, by + 24, 14, T.text, 'left', '600'); txt(c, 'Drag a gear here to sell it.', ix, by + 50, 14, T.text, 'left', '600'); }
    if (drag && drag.kind === 'gear' && drag.moved) { c.lineWidth = 4; c.setLineDash([8, 6]); c.strokeStyle = Art.C('#c0392b'); Art.rr(c, t.x + 4, t.y + 4, t.w - 8, t.h - 8, 16); c.stroke(); c.setLineDash([]); txt(c, 'Sell for ' + sim.sellValue(drag.gear), t.x + t.w / 2, t.y + t.h / 2, 24, Art.C('#c0392b'), 'center', '900'); }
  }
  function setInfoFor(type, level, extra) {
    var D = F.UNITS[type], nm = Art.unitName(type);
    if (D && D.champ) { info = { until: tAnim + 6, a: 'Champion: ' + nm, b: D.info, c: extra || '' }; return; }
    if (!D) { info = { until: tAnim + 4, a: nm + (type === 'mult' ? ' ×' + F.MULTV[(level || 1) - 1] : ''), b: type === 'mult' ? 'Passes ticks on, times its number.' : type === 'boss' ? 'A crown gear: one champion every ' + Math.max(1, Math.round(F.ticksNeeded('boss', level || 1) / 4)) + ' heart turns.' : 'Special gear: acts when it fills.', c: extra || '' }; return; }
    var strong = [], weak = [];
    F.UNIT_ORDER.forEach(function (o) { if (D.vs && D.vs[o] >= 1.3) strong.push(Art.unitName(o)); if (F.UNITS[o].vs && F.UNITS[o].vs[type] >= 1.3) weak.push(Art.unitName(o)); });
    if (D.hunts) strong.push('back line');
    info = { until: tAnim + 5, a: (type === Art.specialty() ? '★ ' : '') + nm + (level ? '  level ' + level : '') + (type === Art.specialty() ? '  +25%' : ''), b: 'Strong against: ' + (strong.join(', ') || 'none'), c: 'Beaten by: ' + (weak.join(', ') || 'few') };
    if (extra) info.c = extra;
  }

  // ---- drawing: battlefield --------------------------------------------------------------------
  function drawBattle(c) {
    var bf = L.bf, gy = Art.groundY(bf), i;
    Art.drawBattlefield(c, bf, scroll, cfg.biome, tAnim, { hpFrac: cfg.free ? 1 : sim.baseHp / sim.baseMax, ebx: sim.ebx, world: sim.world, towers: sim.structs.filter(function (s) { return s.tower; }) });
    c.save(); c.beginPath(); c.rect(bf.x, bf.y, bf.w, bf.h); c.clip();
    var list = sim.units.slice().sort(function (a, b) { return uy(a) - uy(b); });
    for (i = 0; i < list.length; i++) {
      var u = list[i], sx = ux(u), sy = uy(u);
      if (sx < -120 || sx > W + 120) continue;
      if (u.state === 'fall') {
        var f = falls[u.id], pr = Math.min(1, u.t / 0.55), land = sy - 38 * u.scale * 1.3;
        if (!f) f = { sx: sx, sy: bf.y - 50 };
        var x = f.sx + (sx - f.sx) * ease(pr), y = f.sy + (land - f.sy) * (pr * pr);
        Art.drawFalling(c, u, x, y, u.t);
        continue;
      }
      Art.drawUnit(c, u, sx, sy, tAnim);
      if (u.state !== 'dying' && (u.hp < u.max || u.boss)) {
        var bw = (u.boss || u.champ) ? 100 : 34 + u.scale * 6, bx = sx - bw / 2, by = sy - 80 * u.scale * 1.3 - 4 + Art.flyY(u, tAnim);
        c.fillStyle = 'rgba(0,0,0,0.45)'; Art.rr(c, bx - 1.5, by - 1.5, bw + 3, 8, 4); c.fill();
        c.fillStyle = u.side === 'enemy' ? Art.C('#d9443a') : Art.C('#4caf50'); Art.rr(c, bx, by, Math.max(2, bw * u.hp / u.max), 5, 2.5); c.fill();
      }
    }
    for (i = 0; i < sim.proj.length; i++) {
      var p = sim.proj[i], px, py;
      if (p.kind === 'shuriken') { px = p.x0 - scroll; py = gy - 6; }
      else {
        var pr2 = Math.min(1, p.t / p.dur); px = (p.x0 + (p.x1 - p.x0) * pr2) - scroll;
        if (p.kind === 'rocket') py = (L.bf.y - 20) + ((gy - 30 + p.y1) - (L.bf.y - 20)) * pr2 * pr2;
        else { var arc = p.kind === 'stone' ? 150 : p.kind === 'arrow' ? 50 : 8; py = gy - 44 + p.y0 + (p.y1 - p.y0) * pr2 - Math.sin(pr2 * Math.PI) * arc; }
      }
      Art.drawProj(c, p, px, py, tAnim);
    }
    // lightning
    for (i = 0; i < bolts.length; i++) {
      var b = bolts[i], a = 1 - b.t / 0.28; c.save(); c.globalAlpha = Math.max(0, a); c.lineJoin = 'round';
      var segs = 9, pts = [[b.x1, b.y1]];
      for (var k = 1; k < segs; k++) pts.push([b.x1 + (b.x2 - b.x1) * k / segs + (Math.sin(k * 12.9 + b.x2) * 26), b.y1 + (b.y2 - b.y1) * k / segs]);
      pts.push([b.x2, b.y2]);
      [[12, 'rgba(255,255,200,0.35)'], [5, '#fffbd0'], [2, '#ffffff']].forEach(function (s) { c.lineWidth = s[0]; c.strokeStyle = s[1]; c.beginPath(); pts.forEach(function (q, j) { if (j) c.lineTo(q[0], q[1]); else c.moveTo(q[0], q[1]); }); c.stroke(); });
      c.restore();
    }
    // particles
    for (i = 0; i < parts.length; i++) {
      var q = parts[i], al = Math.max(0, q.life / (q.k === 'coin' ? 1.1 : q.k === 'text' ? 1 : 0.6));
      c.save(); c.globalAlpha = Math.min(1, al * 1.4);
      if (q.k === 'dot') { c.fillStyle = q.col; c.beginPath(); c.arc(q.x, q.y, q.r * (0.6 + (1 - al) * 0.8), 0, TAU); c.fill(); }
      else if (q.k === 'spark') { c.fillStyle = q.col; c.fillRect(q.x - q.r / 2, q.y - q.r / 2, q.r, q.r); }
      else if (q.k === 'ring') { c.strokeStyle = q.col; c.lineWidth = 4 * al; c.beginPath(); c.arc(q.x, q.y, q.r * (1 - al) + 6, 0, TAU); c.stroke(); }
      else if (q.k === 'coin') { coinIcon(c, q.x, q.y, q.r * (0.7 + 0.3 * Math.abs(Math.sin(q.t * 10)))); }
      else if (q.k === 'text') { c.lineWidth = 4; c.strokeStyle = Art.ink; c.font = '900 18px ' + SANS; c.textAlign = 'center'; c.strokeText(q.s, q.x, q.y); c.fillStyle = q.col; c.fillText(q.s, q.x, q.y); }
      c.restore();
    }
    // the two bases' health
    if (!cfg.free) {
      var ex = sim.ebx - scroll + 70;
      if (ex > -80 && ex < W + 80) { var fr = sim.baseHp / sim.baseMax; c.fillStyle = 'rgba(0,0,0,0.5)'; Art.rr(c, ex - 62, gy - 262 + (1 - fr) * 55 - 8, 124, 14, 7); c.fill(); c.fillStyle = Art.C('#d9443a'); Art.rr(c, ex - 59, gy - 259 + (1 - fr) * 55 - 8, Math.max(3, 118 * fr), 8, 4); c.fill(); }
    }
    c.restore();
  }
  function ease(t) { return t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t); }
  // The small fun hill at the bottom left: where we are on the curve of this level.
  function drawFunCurve(c, x, y, w, h, peak, fade, nowMin, label) {
    var span = fade * 1.1, i, T = Art.theme;
    c.save(); c.lineJoin = 'round';
    c.beginPath(); for (i = 0; i <= 60; i++) { var tm = span * i / 60, v = F.funCurve(tm, peak, fade), px = x + 10 + (w - 20) * i / 60, py = y + h - 8 - (h - 18) * v; if (i) c.lineTo(px, py); else c.moveTo(px, py); }
    c.lineTo(x + 10 + (w - 20) * (fade / span), y + h - 8); c.lineTo(x + 10, y + h - 8); c.closePath(); c.fillStyle = 'rgba(255,200,60,0.28)'; c.fill();
    c.beginPath(); for (i = 0; i <= 60; i++) { var tm2 = span * i / 60, v2 = F.funCurve(tm2, peak, fade), qx = x + 10 + (w - 20) * i / 60, qy = y + h - 8 - (h - 18) * v2; if (i) c.lineTo(qx, qy); else c.moveTo(qx, qy); }
    c.lineWidth = 3; c.strokeStyle = Art.C(T.gold); c.stroke(); c.lineWidth = 1.6; c.strokeStyle = Art.ink; c.stroke();
    if (nowMin !== null) { var nx = x + 10 + (w - 20) * Math.min(1, nowMin / span), nv = F.funCurve(nowMin, peak, fade), ny = y + h - 8 - (h - 18) * nv; c.beginPath(); c.arc(nx, ny, 5, 0, TAU); c.fillStyle = Art.C('#d63a4a'); c.fill(); c.lineWidth = 2; c.strokeStyle = Art.ink; c.stroke(); }
    c.fillStyle = Art.theme.text; c.font = '700 11px ' + SANS; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    c.fillText(label || '', x + 10, y + 11); c.textAlign = 'right'; c.fillText(peak + ' min peak · ' + fade + ' min fade', x + w - 8, y + 11);
    c.restore();
  }
  function drawFun(c) {
    if (!sim || cfg.free) return;
    var x = 34, y = H - 50, w = 306, h = 40; panel(c, x, y, w, h, Art.C(Art.theme.panel), 10);
    drawFunCurve(c, x, y, w, h, sim.fun.peak / 60, sim.fun.fade / 60, sim.status === 'build' ? 0 : Math.max(0, (sim.t - sim.startT) / 60), 'fun');
  }
  function drawFunPlot() {
    var cv2 = $('funPlot'); if (!cv2) return; var c = cv2.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv2.width, cv2.height);
    c.fillStyle = Art.C(Art.theme.paper); c.fillRect(0, 0, cv2.width, cv2.height);
    drawFunCurve(c, 0, 0, cv2.width, cv2.height, +S.funPeak, +S.funFade, null, 'fun over the level');
  }
  function drawMini(c) {
    var m = L.mini, k = m.w / sim.world; panel(c, m.x - 8, m.y - 6, m.w + 16, m.h + 12, Art.C(Art.theme.panel), 10);
    c.fillStyle = Art.C('#7cb872'); c.fillRect(m.x, m.y + 6, m.w, m.h - 8);
    c.fillStyle = Art.C('#2f55b5'); c.fillRect(m.x, m.y - 2, 12, m.h + 4); c.fillStyle = Art.C('#8a2f24'); c.fillRect(m.x + m.w - 14, m.y - 2, 14, m.h + 4);
    sim.structs.forEach(function (s) { if (!s.tower) return; c.fillStyle = s.alive ? (s.side === 'ally' ? '#2d6cdf' : '#d9302a') : '#777'; c.fillRect(m.x + s.x * k - 2, m.y - 4, 4, m.h + 8); });
    sim.units.forEach(function (u) { if (u.state === 'dying') return; c.fillStyle = u.side === 'ally' ? '#2d6cdf' : '#d9302a'; c.fillRect(m.x + u.x * k - 2, m.y + (u.side === 'ally' ? 4 : 10), u.boss ? 6 : 4, 5); });
    c.strokeStyle = Art.ink; c.lineWidth = 2.5; c.strokeRect(m.x + scroll * k, m.y - 3, W * k, m.h + 6);
  }

  // ---- the frame of drawing a whole picture -----------------------------------------------------
  function drawAll() {
    var c = ctx; c.setTransform(DPR, 0, 0, DPR, 0, 0);
    var T = Art.theme, bg = c.createLinearGradient(0, 0, 0, CH); bg.addColorStop(0, Art.C(T.paper)); bg.addColorStop(1, Art.C(T.paper2)); c.fillStyle = bg; c.fillRect(0, 0, CW, CH);
    c.setTransform(DPR * SC, 0, 0, DPR * SC, DPR * OX, DPR * OY);
    var sh = shake > 0.3 ? [(Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake] : [0, 0]; c.translate(sh[0], sh[1]);
    if (sim) {
      hudBtns = [];
      drawBattle(c); drawBoard(c); drawTray(c); drawHUD(c); drawMini(c); drawFun(c);
      if (drag && drag.moved) {
        if (drag.kind === 'gear') { var g = drag.gear; g.need = F.ticksNeeded(g.type, g.level); Art.drawGear(c, g, drag.x, drag.y - 12, L.cs / 2 * 1.08, gearAngle(g), { glow: true }); }
        else if (drag.kind === 'card') { var ty = sim.tray[drag.slot]; if (ty) Art.drawGear(c, { type: ty, level: 1, charge: 0, need: F.ticksNeeded(ty, 1), active: false, locked: false, pulse: 0 }, drag.x, drag.y - 12, L.cs / 2 * 1.08, tAnim, { glow: true }); }
      }
      if (banner) { var bt = banner.t, al = bt < 0.3 ? bt / 0.3 : bt > 2 ? Math.max(0, 1 - (bt - 2) / 0.6) : 1; c.save(); c.globalAlpha = al; var yy = L.bf.y + 56 - (1 - Math.min(1, bt / 0.3)) * 20; panel(c, W / 2 - 190, yy - 34, 380, 68, banner.boss ? Art.C('#e86a5a') : Art.C(T.panel), 20); txt(c, banner.text, W / 2, yy, 34, banner.boss ? '#fff' : T.text, 'center', '900'); c.restore(); }
      if (redFlash > 0) { var gr = c.createLinearGradient(0, 0, 220, 0); gr.addColorStop(0, 'rgba(220,40,40,' + (redFlash * 0.5).toFixed(2) + ')'); gr.addColorStop(1, 'rgba(220,40,40,0)'); c.fillStyle = gr; c.fillRect(0, L.bf.y, 260, L.bf.h); }
      if (paused) { c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(0, 70, W, H - 70); panel(c, W / 2 - 150, H / 2 - 56, 300, 112, Art.C(T.panel), 24); txt(c, 'Paused', W / 2, H / 2 - 14, 40, T.text, 'center', '900'); txt(c, 'Tap ▶ to go on', W / 2, H / 2 + 28, 18, T.text, 'center', '600'); }
      if (toast && toast.until > tAnim) { panel(c, W / 2 - 170, H - 120, 340, 44, Art.C(T.panel), 14); txt(c, toast.s, W / 2, H - 98, 18, T.text, 'center', '800'); }
    }
    c.setTransform(DPR * SC, 0, 0, DPR * SC, DPR * OX, DPR * OY);
    var fr = Art.frame(Math.round(W), Math.round(H)); c.drawImage(fr, 0, 0, W, H);
  }
  function say(s) { toast = { s: s, until: tAnim + 1.6 }; }

  // ---- the loop -----------------------------------------------------------------------------------
  function frame(ts) {
    var dt = Math.min(0.05, (ts - last) / 1000 || 0); last = ts; tAnim += dt;
    try {
      if (sim) {
        if (!paused && screen === 'play') sim.update(dt);
        handleEvents(); updateFx(dt); updateCamera(dt);
        if (ended && screen === 'play') { endTimer -= dt; if (endTimer <= 0) showResult(); }
      }
      drawAll();
    } catch (e) { GW.err('Draw error', e); }
    requestAnimationFrame(frame);
  }
  function updateFx(dt) {
    var i, q;
    for (i = parts.length - 1; i >= 0; i--) {
      q = parts[i]; q.life -= dt;
      if (q.k === 'coin') { q.t += dt; q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; if (q.life < 0.6) { q.x += (206 - q.x) * Math.min(1, dt * 6); q.y += (36 - q.y) * Math.min(1, dt * 6); } if (q.life < 0.12) q.life = 0; }
      else { q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; }
      if (q.life <= 0) parts.splice(i, 1);
    }
    for (i = bolts.length - 1; i >= 0; i--) { bolts[i].t += dt; if (bolts[i].t > 0.28) bolts.splice(i, 1); }
    if (banner) { banner.t += dt; if (banner.t > 2.6) banner = null; }
    shake = Math.max(0, shake - dt * 30); redFlash = Math.max(0, redFlash - dt * 1.8); beat = Math.max(0, beat - dt * 4);
    if (cfg && cfg.free && sim.waveIdx + 1 > P.freeBest) { P.freeBest = sim.waveIdx + 1; }
  }
  function updateCamera(dt) {
    if (drag && drag.kind === 'pan') return;
    if (!+S.follow || tAnim < manualUntil) return;
    var allies = sim.units.filter(function (u) { return u.side === 'ally' && u.state !== 'fall'; }), foes = sim.units.filter(function (u) { return u.side === 'enemy'; });
    var ma = allies.reduce(function (m, u) { return Math.max(m, u.x); }, 0), me = foes.reduce(function (m, u) { return Math.min(m, u.x); }, 1e9), center = 640;
    if (allies.length && foes.length) center = me - ma > 1000 ? ma + 420 : (ma + me) / 2;
    else if (allies.length) center = ma + 300;
    else if (foes.length) center = Math.max(640, Math.min(me, 1400));
    var target = Math.max(0, Math.min(sim.world - W, center - W / 2));
    scroll += (target - scroll) * Math.min(1, dt * 2.2);
  }

  // ---- input --------------------------------------------------------------------------------------
  function toLogical(e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left - OX) / SC, (e.clientY - r.top - OY) / SC]; }
  function hit(b, x, y) { return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h; }
  cv.addEventListener('pointerdown', function (e) {
    if (!sim || screen !== 'play') return; Au.init();
    var p = toLogical(e), x = p[0], y = p[1], i;
    try { cv.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ }
    for (i = 0; i < hudBtns.length; i++) if (hit(hudBtns[i], x, y)) { hudBtns[i].down = true; drag = { kind: 'btn', btn: hudBtns[i], x: x, y: y }; return; }
    if (paused) return;
    var cards = cardRects();
    for (i = 0; i < 3; i++) if (sim.tray[i] && hit(cards[i], x, y)) { drag = { kind: 'card', slot: i, x: x, y: y, sx: x, sy: y, moved: false }; return; }
    var cell = cellAt(x, y);
    if (cell) { var g = sim.gearAt(cell[0], cell[1]); if (g) { drag = { kind: 'gear', gear: g, x: x, y: y, sx: x, sy: y, moved: false }; return; } drag = { kind: 'cell', cell: cell, x: x, y: y, sx: x, sy: y, moved: false }; return; }
    if (y >= L.bf.y && y < L.mini.y - 8) {   // pick a unit or pan the battlefield
      var best = null, bd = 40;
      sim.units.forEach(function (u) { var d = Math.abs(ux(u) - x) + Math.abs(uy(u) - 40 + Art.flyY(u, tAnim) - y) * 0.6; if (d < bd && u.state !== 'dying' && u.state !== 'fall') { bd = d; best = u; } });
      drag = { kind: 'pan', x: x, y: y, sx: x, sy: y, scroll0: scroll, moved: false, unit: best }; return;
    }
    if (hit({ x: L.mini.x - 8, y: L.mini.y - 8, w: L.mini.w + 16, h: L.mini.h + 16 }, x, y)) { scroll = Math.max(0, Math.min(sim.world - W, (x - L.mini.x) / L.mini.w * sim.world - W / 2)); manualUntil = tAnim + 4; }
  });
  cv.addEventListener('pointermove', function (e) {
    if (!drag) return; var p = toLogical(e); drag.x = p[0]; drag.y = p[1];
    if (drag.kind === 'btn') return;
    if (!drag.moved && Math.hypot(drag.x - drag.sx, drag.y - drag.sy) > 9) drag.moved = true;
    if (drag.kind === 'pan' && drag.moved) { scroll = Math.max(0, Math.min(sim.world - W, drag.scroll0 - (drag.x - drag.sx))); manualUntil = tAnim + 4; }
  });
  function endDrag(e) {
    if (!drag) return; var d = drag; drag = null; var p = toLogical(e), x = p[0], y = p[1];
    if (d.kind === 'btn') { d.btn.down = false; if (hit(d.btn, x, y)) onButton(d.btn.id); return; }
    var cell = cellAt(x, y), tray = L.tray, inTray = x >= tray.x && x <= tray.x + tray.w && y >= tray.y && y <= tray.y + tray.h;
    if (d.kind === 'card') {
      if (!d.moved) { selSlot = selSlot === d.slot ? -1 : d.slot; selGear = 0; Au.play('tap'); if (selSlot >= 0) setInfoFor(sim.tray[selSlot], 1, 'Tap a free peg to place it.'); return; }
      if (cell) buyAt(d.slot, cell[0], cell[1]);
    } else if (d.kind === 'gear') {
      if (!d.moved) { selGear = selGear === d.gear.id ? 0 : d.gear.id; selSlot = -1; Au.play('tap'); if (selGear) setInfoFor(d.gear.type, d.gear.level, d.gear.type === 'mult' ? 'Locked gears can only pass ticks.' : (d.gear.locked ? 'A sleeping gear: link a chain to wake it.' : 'ticks: ' + Math.floor(d.gear.charge) + ' / ' + F.ticksNeeded(d.gear.type, d.gear.level) + ' · per turn ' + d.gear.rate)); return; }
      if (inTray) { if (sim.sellGear(d.gear)) { Au.play('sell'); say('Sold'); } else say('This gear is locked'); }
      else if (cell) { var res = sim.moveGear(d.gear, cell[0], cell[1]); if (res === 'no' && sim.gearAt(cell[0], cell[1]) && sim.gearAt(cell[0], cell[1]).locked) say('Locked'); if (res === 'moved' || res === 'swapped') Au.play('place'); }
    } else if (d.kind === 'cell') {
      if (!d.moved && selSlot >= 0) buyAt(selSlot, d.cell[0], d.cell[1]);
      else if (!d.moved) { selGear = 0; }
    } else if (d.kind === 'pan') {
      if (!d.moved && d.unit) { var u = d.unit, D = F.UNITS[u.type]; setInfoFor(u.type, u.level, 'HP ' + Math.max(0, Math.round(u.hp)) + '/' + Math.round(u.max) + '   ATK ' + Math.round(u.atk) + '   DEF ' + Math.round(u.def)); info.a = (u.side === 'enemy' ? 'Rust ' : '') + info.a; if (u.boss) info.a = 'BOSS ' + info.a; }
    }
  }
  cv.addEventListener('pointerup', endDrag);
  cv.addEventListener('pointercancel', function () { if (drag && drag.btn) drag.btn.down = false; drag = null; });
  function buyAt(slot, c, r) {
    var res = sim.buy(slot, c, r);
    if (res === 'ok') { selSlot = -1; var g = sim.gearAt(c, r); var p = gearPos(c, r); puff(p[0], p[1] + 20, 5, '#fff', 30, 10); }
    else if (res === 'poor') { Au.play('nope'); say('Not enough coins'); }
    else if (res === 'blocked') { Au.play('nope'); say('That peg is taken'); }
  }
  function onButton(id) {
    Au.init(); Au.play('tap');
    if (id === 'go') { sim.start(); Au.mood('calm', cfg.ch); if (sim.status === 'running') Au.mood('battle', cfg.ch); }
    else if (id === 'next') sim.callNext();
    else if (id === 'pause') { paused = !paused; }
    else if (id === 'speed') { sim.speed = sim.speed >= 3 ? 1 : sim.speed + 1; S.speed = sim.speed; saveSettings(); syncSettings(); }
    else if (id === 'undo') { if (sim.undoLast()) Au.play('undo'); else say('Nothing to undo'); }
    else if (id === 'refresh') { if (!sim.refreshTray()) { Au.play('nope'); say('Not enough coins'); } else Au.play('tap'); }
    else if (id === 'home') { leaveLevel(); showMap(); }
  }

  // ---- screens (campaign map, story card, result) --------------------------------------------------
  function show(name) {
    screen = name;
    ['screenMap', 'screenStory', 'screenResult'].forEach(function (id) { $(id).hidden = true; });
    if (name === 'map') $('screenMap').hidden = false; else if (name === 'story') $('screenStory').hidden = false; else if (name === 'result') $('screenResult').hidden = false;
    document.body.setAttribute('data-screen', name);
  }
  function unlocked(ch, lv) { var idx = F.levelIndex(ch, lv); if (idx === 0) return true; var pc = Math.floor((idx - 1) / 3) + 1, pl = (idx - 1) % 3 + 1; return (P.stars['c' + pc + 'l' + pl] || 0) > 0; }
  function portrait(canvas, ch, w, h, extra) {
    var c = canvas.getContext('2d'); canvas.width = w * 2; canvas.height = h * 2; c.setTransform(2, 0, 0, 2, 0, 0);
    var C = F.CHAPTERS[ch - 1], bf = { x: 0, y: 0, w: w, h: h };
    var oldGy = Art.groundY;
    Art.drawBattlefield(c, bf, 300 + ch * 400, C.biome, tAnim, null);
    var fighter = { type: C.fighter, side: 'ally', id: ch, level: 1, scale: 1.15, hp: 1, max: 1, speed: 40, phase: 0, anim: 'idle', cdMax: 1, at: 0, t: 0, state: 'go', dir: 1 };
    var gy = h - 16;
    fighter.scale = 0.78; fighter.noZoom = true;
    Art.drawUnit(c, fighter, w * 0.34, gy, tAnim);
    var foe = Object.assign({}, fighter, { side: 'enemy', id: ch + 2, dir: -1, scale: extra ? 1.7 : 0.78, noZoom: true });
    Art.drawUnit(c, foe, w * 0.7, gy, tAnim);
  }
  function showMap() {
    Au.stopSay(); Au.mood('off'); sim = null; paused = false;
    var box = $('mapGrid'); box.textContent = '';
    F.CHAPTERS.forEach(function (C) {
      var card = document.createElement('section'); card.className = 'chapter';
      var cvs = document.createElement('canvas'); cvs.className = 'chPic'; card.appendChild(cvs);
      var h = document.createElement('h3'); h.textContent = C.n + '. ' + C.title; card.appendChild(h);
      var row = document.createElement('div'); row.className = 'lvRow';
      for (var lv = 1; lv <= 3; lv++) (function (lv) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'lvBtn'; var id = 'c' + C.n + 'l' + lv, st = P.stars[id] || 0, ok = unlocked(C.n, lv);
        b.disabled = !ok; b.setAttribute('aria-label', 'Chapter ' + C.n + ' level ' + lv);
        b.innerHTML = '<span class="lvNum">' + (lv === 3 ? '♛' : lv) + '</span><span class="lvStars">' + (ok ? '★'.repeat(st) + '☆'.repeat(3 - st) : '🔒') + '</span>';
        b.addEventListener('click', function () { Au.init(); Au.play('tap'); showStory(F.levelConfig(C.n, lv, { quick: +S.quick })); });
        row.appendChild(b);
      })(lv);
      card.appendChild(row); box.appendChild(card);
      requestAnimationFrame(function () { try { portrait(cvs, C.n, 260, 120, false); } catch (e) { GW.err('Portrait', e); } });
    });
    $('freeBest').textContent = P.freeBest ? 'best: wave ' + P.freeBest : '';
    show('map'); if (window.AppNotes) AppNotes.setContext({ item: 'map', label: 'Campaign map' });
  }
  function showStory(c) {
    cfg = c; var tier = F.tierFor(c.idx, S.reading), st = c.story;
    $('storyTitle').textContent = c.free ? 'Free-for-all' : 'Chapter ' + c.ch + ' · Level ' + c.lv;
    $('storySub').textContent = c.free ? 'every fighter, every gear' : c.title;
    var box = $('storyText'); box.textContent = '';
    var p = document.createElement('p'); p.className = 'tier' + tier; p.textContent = tier === 0 ? st.cap : tier === 1 ? st.short : st.story; box.appendChild(p);
    var tag = $('storyTags'); tag.textContent = '';
    function chip(t) { var s = document.createElement('span'); s.className = 'chip'; s.textContent = t; tag.appendChild(s); }
    if (!c.free) { if (c.lv === 1) chip('New fighter: ' + Art.unitName(F.CHAPTERS[c.ch - 1].fighter)); if (c.bossName) chip('Boss: ' + c.bossName); var sp = F.CHAPTERS[c.ch - 1].special; if (sp && c.lv === 1) chip('New gear: ' + F.SPECIALS[sp].name); chip('Lives ' + c.lives); chip('Coins ' + c.coins); }
    else chip('Lives ' + c.lives);
    var tkey = ['cap', 'short', 'story'][tier], clip = window.FGW_AUDIO && FGW_AUDIO[c.id] && FGW_AUDIO[c.id][tkey];
    narr = clip ? clip.src : null; listenState(false); Au.stopSay();
    $('storyListen').hidden = !narr || S.voice === 'off';
    if (narr && S.voice === 'auto') { Au.init(); setTimeout(function () { if (screen === 'story' && cfg === c) playNarration(); }, 350); }
    var cp = $('storyPic');
    requestAnimationFrame(function () { try { c.free ? portrait(cp, 8, 340, 200, true) : portrait(cp, c.ch, 340, 200, !!c.bossName); } catch (e) { GW.err('Story picture', e); } });
    show('story'); if (window.AppNotes) AppNotes.setContext({ item: c.id, label: c.title + ' ' + levelLabel() });
  }
  var narr = null;
  function listenState(on) { var b = $('storyListen'); if (b) { b.setAttribute('aria-pressed', String(on)); b.querySelector('span').textContent = on ? 'Stop' : 'Listen'; } }
  function playNarration() { if (!narr) return; Au.init(); listenState(true); Au.say(narr, function () { listenState(false); }); }
  function startLevel() {
    Au.stopSay();
    var c = cfg; var bonus = Math.min(60, (P.fails[c.id] || 0) * 20);
    var fresh = c.free ? F.freeConfig({ quick: +S.quick }) : F.levelConfig(c.ch, c.lv, { quick: +S.quick }); fresh.coins += bonus; fresh.story = c.story;
    makeSim(fresh); show('play'); Au.init(); Au.mood('calm', fresh.ch);
    if (bonus) say('A few extra coins this time: +' + bonus);
    if (window.AppNotes) AppNotes.setContext({ item: fresh.id, label: fresh.title + ' ' + levelLabel() });
  }
  function leaveLevel() { Au.mood('off'); }
  function showResult() {
    ended = false; var win = sim.status === 'won', stars = sim.stars(), id = cfg.id;
    if (win && !cfg.free) { P.stars[id] = Math.max(P.stars[id] || 0, stars); P.fails[id] = 0; }
    if (!win && !cfg.free) P.fails[id] = (P.fails[id] || 0) + 1;
    if (cfg.free) P.freeBest = Math.max(P.freeBest, sim.waveIdx + 1);
    saveProgress();
    var R = $('screenResult');
    $('resTitle').textContent = cfg.free ? 'Waves held: ' + Math.max(0, sim.waveIdx) : win ? 'The fortress falls!' : 'The Horde got through';
    $('resStars').textContent = win ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '';
    $('resStars').hidden = !win;
    $('resText').textContent = cfg.free ? 'Best: wave ' + P.freeBest : win ? 'Lives left ' + sim.lives + ' of ' + sim.maxLives + ' · Coins earned ' + sim.earned + ' · Enemies beaten ' + sim.kills
      : 'Next time you start with a few extra coins. Try other gears, or merge to make stronger fighters.';
    var nxt = $('resNext'), idx = cfg.idx;
    nxt.hidden = !(win && !cfg.free && idx < 23);
    $('resRetry').textContent = win ? 'Play again' : 'Try again';
    show('result');
    if (win && !cfg.free) setTimeout(function () { for (var i = 0; i < stars; i++) (function (i) { setTimeout(function () { Au.play('star', i); }, i * 260); })(i); }, 200);
  }

  // ---- settings drawer ---------------------------------------------------------------------------
  var VOL = { '0': 'Off', '0.4': 'Low', '0.8': 'Medium', '1': 'High' };
  function syncSettings() {
    document.querySelectorAll('.seg').forEach(function (seg) {
      var k = seg.getAttribute('data-key'); var cur = String(S[k]);
      seg.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === cur)); });
    });
    var er = $('showErrors'); if (er) er.checked = !!+S.showErrors;
    var fp = $('funPeak'); if (fp) { fp.value = S.funPeak; $('funFade').value = S.funFade; $('challenge').value = S.challenge; if (GW.applyFun) GW.applyFun(); }
    var br2 = $('bossRevs'); if (br2) { br2.value = S.bossRevs; $('bossRevsVal').textContent = '1 : ' + S.bossRevs; }
    F.BOSS_REVS = +S.bossRevs || 100;
    var hs = $('heartSpeed'); if (hs) { hs.value = S.heartSpeed; $('heartSpeedVal').textContent = '×' + (+S.heartSpeed).toFixed(2).replace(/0$/, ''); }
    Art.setTheme(S.theme); Au.setVolumes(+S.sfx, +S.music);
    if (sim) sim.specialty = Art.specialty();
    var ch = $('cultureHint');
    if (ch) { var lab = Art.cultureLabel(), st = Art.specialty(); ch.textContent = lab && st ? lab + ': ★ ' + Art.unitName(st) + ' gets +25% attack and health.' : 'A storybook look: no culture, no star fighter.'; }
    renderErrors();
  }
  function bindSettings() {
    document.querySelectorAll('.seg button').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.parentNode.getAttribute('data-key'), v = b.getAttribute('data-v'); S[k] = (k === 'theme' || k === 'reading' || k === 'voice') ? v : +v; saveSettings(); syncSettings();
        if (k === 'speed' && sim) sim.speed = +S.speed; Au.init(); Au.play('tap');
        if (k === 'theme') { if (screen === 'map') showMap(); }
        if (k === 'voice' && S.voice === 'off') Au.stopSay();
        if (k === 'quick') say(+S.quick ? 'Quick game: shorter waves' : 'Normal waves');
      });
    });
    function applyFun() {
      if (+S.funFade < +S.funPeak + 1) S.funFade = +S.funPeak + 1;
      $('funFade').value = S.funFade; $('funPeakVal').textContent = S.funPeak; $('funFadeVal').textContent = S.funFade;
      var ch = +S.challenge; $('challengeVal').textContent = ch < 0.9 ? 'softer (' + ch.toFixed(2) + ')' : ch > 1.1 ? 'harder (' + ch.toFixed(2) + ')' : 'normal';
      saveSettings(); drawFunPlot();
      if (sim) { var qk = cfg.quick ? 0.6 : 1; sim.fun.peak = S.funPeak * 60 * qk; sim.fun.fade = S.funFade * 60 * qk; sim.fun.ch = ch; if (!cfg.free) sim.waveCount = Math.max(sim.waveIdx + 1, Math.floor(sim.fun.fade / sim.gap)); }
    }
    ['funPeak', 'funFade', 'challenge'].forEach(function (k) { $(k).addEventListener('input', function () { S[k] = +this.value; applyFun(); }); });
    GW.applyFun = applyFun;
    var br = $('bossRevs');
    br.addEventListener('input', function () { S.bossRevs = +br.value; F.BOSS_REVS = S.bossRevs; saveSettings(); $('bossRevsVal').textContent = '1 : ' + S.bossRevs; });
    var hs = $('heartSpeed');
    hs.addEventListener('input', function () { S.heartSpeed = +hs.value; saveSettings(); $('heartSpeedVal').textContent = '×' + (+hs.value).toFixed(2).replace(/0$/, ''); if (sim) sim.heartPeriod = F.HEART_PERIOD / S.heartSpeed; });
    $('showErrors').addEventListener('change', function () { S.showErrors = this.checked ? 1 : 0; saveSettings(); renderErrors(); });
    $('gear').addEventListener('click', function () { var d = $('drawer'); d.hidden = !d.hidden; drawFunPlot(); this.setAttribute('aria-expanded', String(!d.hidden)); Au.init(); });
    $('closeDrawer').addEventListener('click', function () { $('drawer').hidden = true; $('gear').setAttribute('aria-expanded', 'false'); });
    document.querySelectorAll('.pHead').forEach(function (h) {
      h.addEventListener('click', function () { var sec = h.parentNode, open = sec.getAttribute('data-collapsed') === 'true'; sec.setAttribute('data-collapsed', String(!open)); h.setAttribute('aria-expanded', String(open)); h.querySelector('.mark').textContent = open ? '▾' : '▸'; });
    });
    $('btnFree').addEventListener('click', function () { $('drawer').hidden = true; Au.init(); showStory(F.freeConfig({ quick: +S.quick })); });
    $('btnMap').addEventListener('click', function () { $('drawer').hidden = true; leaveLevel(); showMap(); });
    $('btnCheat').addEventListener('click', function () { if (sim && screen === 'play') { sim.coins += 25; Au.play('coin'); } else say('Start a level first'); });
    $('btnReset').addEventListener('click', function () {
      if (!window.confirm('Erase all stars and progress on this device?')) return;
      P.stars = {}; P.fails = {}; P.freeBest = 0; saveProgress(); $('drawer').hidden = true; showMap();
    });
    $('storyPlay').addEventListener('click', function () { Au.init(); startLevel(); });
    $('storyBack').addEventListener('click', function () { Au.stopSay(); showMap(); });
    $('storyListen').addEventListener('click', function () { if (Au.speaking()) { Au.stopSay(); listenState(false); } else playNarration(); });
    $('resNext').addEventListener('click', function () { var i = cfg.idx + 1, ch = Math.floor(i / 3) + 1, lv = i % 3 + 1; showStory(F.levelConfig(ch, lv, { quick: +S.quick })); });
    $('resRetry').addEventListener('click', function () { showStory(cfg.free ? F.freeConfig({ quick: +S.quick }) : F.levelConfig(cfg.ch, cfg.lv, { quick: +S.quick })); });
    $('resMap').addEventListener('click', function () { showMap(); });
    $('mapFree').addEventListener('click', function () { Au.init(); showStory(F.freeConfig({ quick: +S.quick })); });
    $('verInfo').textContent = 'Felix Gear Wars ' + F.version;
  }
  GW.say = say;

  // ---- start up ------------------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', function () {
    try {
      bindSettings(); syncSettings(); resize(); window.addEventListener('resize', resize); window.addEventListener('orientationchange', resize);
      showMap(); requestAnimationFrame(frame);
      document.addEventListener('pointerdown', function () { Au.init(); }, { once: true });
      document.addEventListener('visibilitychange', function () { if (document.hidden && sim && screen === 'play') paused = true; });
      GW.test = { showStory: showStory, startLevel: startLevel, cfg: function () { return cfg; }, sim: function () { return sim; }, screen: function () { return screen; }, layout: function () { return L; }, cellXY: function (c, r) { return [cellX(c), cellY(r)]; }, view: function () { return { SC: SC, OX: OX, OY: OY, H: H }; }, scroll: function () { return scroll; }, showResult: showResult, paused: function () { return paused; }, cards: cardRects, hud: function () { return hudBtns; } };
    } catch (e) { GW.err('Start-up failed', e); }
  });
})();
