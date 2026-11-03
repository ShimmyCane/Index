/* Fishes — game rules, AI, drawing, input and the ⚙️ panel.
   Canvas 2D, no build step. World units are game units; the camera zooms out
   as the fish grows. See schematic.md for the rules and tuning constants. */
(function () {
  'use strict';

  var D = window.FishData;
  var SPECIES = D.SPECIES;
  var CFG = D.CONFIG;
  var OUT = '#2d3a4a';

  var $ = function (id) { return document.getElementById(id); };
  var canvas = $('view');
  var ctx = canvas.getContext('2d');

  var CW = 0, CH = 0, DPR = 1;
  var mode = 'title';         // title | play | over
  var run = null;
  var paused = false;
  var cam = { x: 0, y: 0, scale: 1 };
  var keys = {};
  var ptr = { down: false, x: 0, y: 0 };
  var sprintHeld = false;
  var bubbles = [];
  var hudTimer = 0;
  var best = 0;
  var showErrors = false;
  var errorLog = [];

  try { best = Number(localStorage.getItem('fish_best')) || 0; } catch (e) { best = 0; }
  try { showErrors = localStorage.getItem('fish_show_errors') === 'on'; } catch (e) { showErrors = false; }

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function mmss(sec) { sec = Math.floor(sec); return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); }

  // Length of a fish on screen (world units). Food is drawn smaller.
  function lenFor(size, shape) {
    if (shape === 'plankton') return 10 + size * 10;
    if (shape === 'krill') return 10 + size * 8;
    return 22 + size * 5;
  }

  function hexMix(a, b, t) {
    var pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    var r = Math.round(((pa >> 16) & 255) * (1 - t) + ((pb >> 16) & 255) * t);
    var g = Math.round(((pa >> 8) & 255) * (1 - t) + ((pb >> 8) & 255) * t);
    var bl = Math.round((pa & 255) * (1 - t) + (pb & 255) * t);
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
  }

  // Colour and shape of the player change as it grows: baby clownfish, then a
  // blue torpedo, then a whale shark at the top.
  function playerDesc(size) {
    var t = clamp((size - 1) / 99, 0, 1);
    var col = hexMix('#ffb27a', '#8fb8e8', t);
    var big = size >= 75;
    return {
      col: col,
      fin: hexMix(col, '#ffffff', 0.3),
      shape: big ? 'whale' : size >= 18 ? 'torpedo' : 'round',
      hr: big ? 0.3 : size >= 18 ? 0.36 : 0.6,
      bands: size < 6 ? [-0.35, 0.4] : null,
      bandCol: '#ffffff',
      spots: big,
      spotCol: '#ffffff',
      belly: size < 6 ? null : '#f7fbff'
    };
  }

  // ---------- canvas setup and background ----------
  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    CW = window.innerWidth;
    CH = window.innerHeight;
    canvas.width = Math.round(CW * DPR);
    canvas.height = Math.round(CH * DPR);
    canvas.style.width = CW + 'px';
    canvas.style.height = CH + 'px';
    bubbles = [];
    for (var i = 0; i < 28; i++) {
      bubbles.push({ x: Math.random(), y: Math.random(), r: rand(2, 7), s: rand(0.02, 0.07), p: Math.random() * 6 });
    }
  }

  function drawBackground(z, t) {
    var g = ctx.createLinearGradient(0, 0, 0, CH);
    g.addColorStop(0, z.top);
    g.addColorStop(1, z.bottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CW, CH);

    if (z.rays) {
      ctx.fillStyle = 'rgba(255,255,255,0.10)';
      for (var i = 0; i < 5; i++) {
        var x = CW * (0.12 + i * 0.2) + Math.sin(t * 0.4 + i) * 30;
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x + 50, 0); ctx.lineTo(x + 170, CH); ctx.lineTo(x + 110, CH);
        ctx.closePath(); ctx.fill();
      }
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 2;
    bubbles.forEach(function (b) {
      var y = (((b.y - t * b.s) % 1) + 1) % 1;
      ctx.beginPath();
      ctx.arc(b.x * CW + Math.sin(t + b.p) * 10, y * CH, b.r, 0, Math.PI * 2);
      ctx.stroke();
    });

    ctx.fillStyle = z.sand;
    ctx.beginPath();
    ctx.moveTo(0, CH);
    ctx.lineTo(0, CH * 0.94);
    for (var sx = 0; sx <= CW; sx += 40) ctx.lineTo(sx, CH * 0.94 + Math.sin(sx * 0.012) * 10);
    ctx.lineTo(CW, CH);
    ctx.closePath();
    ctx.fill();
  }

  // ---------- drawing fish (local coords: nose to the right, origin = centre) ----------
  function genericFish(len, hr, d, t, lw) {
    var L = len / 2, Hh = len * hr / 2;
    var col = d.col, fin = d.fin || col, tail = d.tail || fin;
    var fh = d.finH || 1;
    var wig = Math.sin(t * 9) * Hh * 0.22;

    ctx.lineWidth = lw;
    ctx.strokeStyle = OUT;
    ctx.lineJoin = 'round';

    ctx.fillStyle = tail;
    ctx.beginPath();
    ctx.moveTo(-L * 0.7, 0);
    ctx.quadraticCurveTo(-L * 1.05, -Hh * 0.9 + wig, -L * 1.4, -Hh * 1.1 + wig);
    ctx.quadraticCurveTo(-L * 1.2, wig * 0.2, -L * 1.4, Hh * 1.1 + wig);
    ctx.quadraticCurveTo(-L * 1.05, Hh * 0.9 + wig, -L * 0.7, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = fin;
    ctx.beginPath();
    ctx.moveTo(-L * 0.35, -Hh * 0.7);
    ctx.quadraticCurveTo(-L * 0.05, -Hh * (0.9 + 0.8 * fh), L * 0.3, -Hh * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    var g = ctx.createLinearGradient(0, -Hh, 0, Hh);
    g.addColorStop(0, hexMix(col, '#ffffff', 0.35));
    g.addColorStop(0.6, col);
    g.addColorStop(1, hexMix(col, OUT, 0.22));
    ctx.beginPath();
    ctx.ellipse(0, 0, L, Hh, 0, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    ctx.save();
    ctx.clip();
    if (d.belly) {
      ctx.fillStyle = d.belly;
      ctx.beginPath();
      ctx.ellipse(0, Hh * 0.8, L * 1.05, Hh * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (d.stripe) {
      ctx.fillStyle = d.stripe;
      ctx.fillRect(-L, -Hh * 0.12, len, Hh * 0.26);
    }
    if (d.bands) {
      ctx.fillStyle = d.bandCol || '#ffffff';
      d.bands.forEach(function (bx) { ctx.fillRect(bx * L - L * 0.09, -Hh * 1.2, L * 0.18, Hh * 2.4); });
    }
    if (d.spots) {
      ctx.fillStyle = d.spotCol || '#ffffff';
      for (var i = 0; i < 12; i++) {
        var sx = (-0.8 + (i % 4) * 0.5) * L + ((i * 37) % 7) * 0.02 * L;
        var sy = (-0.5 + Math.floor(i / 4) * 0.5) * Hh;
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(1.2, Hh * 0.12), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    ctx.beginPath();
    ctx.ellipse(0, 0, L, Hh, 0, 0, Math.PI * 2);
    ctx.lineWidth = lw;
    ctx.strokeStyle = OUT;
    ctx.stroke();

    ctx.fillStyle = fin;
    ctx.beginPath();
    ctx.ellipse(L * 0.1, Hh * 0.35, L * 0.22, Hh * 0.28, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (d.spiky) {
      ctx.lineWidth = lw * 0.8;
      for (var k = 0; k < 10; k++) {
        var a = k / 10 * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * L * 0.98, Math.sin(a) * Hh * 0.98);
        ctx.lineTo(Math.cos(a) * (L + 3), Math.sin(a) * (Hh + 3));
        ctx.stroke();
      }
    }

    var er = Math.max(2.2, Hh * 0.2), ex = L * 0.45, ey = -Hh * 0.18;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ex, ey, er, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = lw * 0.8;
    ctx.stroke();
    ctx.fillStyle = OUT;
    ctx.beginPath();
    ctx.arc(ex + er * 0.25, ey, er * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }

  function eelFish(len, d, t, lw) {
    var L = len / 2, th = Math.max(2.5, len * 0.075), pts = [];
    for (var i = 0; i <= 16; i++) {
      var u = i / 16;
      pts.push([-L + u * len, Math.sin(u * 5 - t * 6) * len * 0.07 * (0.3 + u)]);
    }
    var path = function () {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (var j = 1; j < pts.length; j++) ctx.lineTo(pts[j][0], pts[j][1]);
    };
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    path();
    ctx.strokeStyle = OUT;
    ctx.lineWidth = th + lw * 2;
    ctx.stroke();
    path();
    ctx.strokeStyle = d.col;
    ctx.lineWidth = th;
    ctx.stroke();
    var hx = pts[16][0], hy = pts[16][1], er = Math.max(2, th * 0.45);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(hx - th * 0.3, hy - th * 0.3, er, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = OUT;
    ctx.beginPath();
    ctx.arc(hx - th * 0.1, hy - th * 0.3, er * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  function lureFish(len, d, t, lw) {
    var L = len / 2, Hh = len * d.hr / 2;
    var lx = L * 0.35, ly = -Hh * 0.9;
    var tipx = L * 0.85, tipy = -Hh * 2.3 - len * 0.02 * Math.sin(t * 3);
    ctx.lineCap = 'round';
    ctx.strokeStyle = OUT;
    ctx.lineWidth = lw * 2.4;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.quadraticCurveTo(lx + L * 0.2, -Hh * 1.8, tipx, tipy);
    ctx.stroke();
    ctx.strokeStyle = '#e7dcff';
    ctx.lineWidth = lw;
    ctx.stroke();
    var gr = ctx.createRadialGradient(tipx, tipy, 0, tipx, tipy, len * 0.2);
    gr.addColorStop(0, 'rgba(255,246,190,1)');
    gr.addColorStop(1, 'rgba(255,246,190,0)');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.arc(tipx, tipy, len * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff6be';
    ctx.beginPath();
    ctx.arc(tipx, tipy, Math.max(2, len * 0.035), 0, Math.PI * 2);
    ctx.fill();
    genericFish(len, d.hr, d, t, lw);
    ctx.fillStyle = '#ffffff';
    for (var i = 0; i < 4; i++) {
      var tx = L * (0.72 + i * 0.07);
      ctx.beginPath();
      ctx.moveTo(tx, Hh * 0.15);
      ctx.lineTo(tx + L * 0.03, Hh * 0.5);
      ctx.lineTo(tx + L * 0.06, Hh * 0.15);
      ctx.fill();
    }
  }

  function lanternFish(len, d, t, lw) {
    genericFish(len, d.hr, d, t, lw);
    var L = len / 2, Hh = len * d.hr / 2;
    for (var i = 0; i < 6; i++) {
      var x = (-0.6 + i * 0.24) * L, y = Hh * 0.55, r = Math.max(2, Hh * 0.9);
      var gr = ctx.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, 'rgba(190,255,255,0.95)');
      gr.addColorStop(1, 'rgba(190,255,255,0)');
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function oarFish(len, d, t, lw) {
    var L = len / 2, Hh = Math.max(2, len * d.hr / 2), wv = Math.sin(t * 2) * Hh * 0.4;
    ctx.fillStyle = d.fin;
    ctx.lineWidth = lw * 0.8;
    ctx.strokeStyle = OUT;
    for (var i = 0; i < 16; i++) {
      var x = -L * 0.9 + i * (L * 1.8 / 16);
      ctx.beginPath();
      ctx.moveTo(x, -Hh * 0.6);
      ctx.lineTo(x + L * 0.04, -Hh * 2.2 + wv);
      ctx.lineTo(x + L * 0.08, -Hh * 0.6);
      ctx.closePath();
      ctx.fill();
    }
    ctx.beginPath();
    ctx.ellipse(0, 0, L, Hh, 0, 0, Math.PI * 2);
    ctx.fillStyle = d.col;
    ctx.fill();
    ctx.lineWidth = lw;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(L * 0.9, -Hh * 0.2, Math.max(2, Hh * 0.5), 0, Math.PI * 2);
    ctx.fill();
  }

  function planktonDraw(len, d) {
    var r = Math.max(2, len * 0.5);
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = d.col;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#a8d8ea';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  function drawEntity(e, t) {
    var d = e.desc || e.sp, len = lenFor(e.size, d.shape), lw = 2.4 / cam.scale;
    var f = e.facing || 1;
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.scale(f, 1);
    ctx.rotate(clamp((e.vy || 0) / 500, -0.3, 0.3) * f);
    var shape = d.shape;
    if (shape === 'plankton') planktonDraw(len, d);
    else if (shape === 'eel') eelFish(len, d, t, lw);
    else if (shape === 'lure') lureFish(len, d, t, lw);
    else if (shape === 'lantern') lanternFish(len, d, t, lw);
    else if (shape === 'oar') oarFish(len, d, t, lw);
    else genericFish(len, d.hr || 0.5, d, t, lw);
    ctx.restore();
  }

  // ---------- levels and populations ----------
  function enterLevel(n) {
    var r = run;
    r.info = D.levelInfo(n);
    r.level = n;
    r.npcs = [];
    r.parts = [];
    r.x = r.info.W / 2;
    r.y = r.info.H / 2;
    r.vx = 0;
    r.vy = 0;
    r.inv = 2.5;
    cam.x = r.x;
    cam.y = r.y;
    fillPopulations(true);
    showBanner('Level ' + n + ': ' + r.info.name, r.info.zone.name + '. Goal: size ' + r.info.goal, 3200);
  }

  function spawnNPC(sp, initial) {
    var r = run, W = r.info.W, H = r.info.H, x = 0, y = 0, tries = 0;
    do {
      x = rand(60, W - 60);
      y = rand(60, H - 60);
      tries++;
    } while (Math.hypot(x - r.x, y - r.y) < (initial ? 380 : 520) && tries < 12);
    r.npcs.push({
      sp: sp, x: x, y: y, vx: 0, vy: 0,
      size: sp.kind === 'food' ? sp.size : sp.size * rand(0.9, 1.12),
      spd: rand(0.9, 1.1), facing: Math.random() < 0.5 ? 1 : -1,
      t: rand(0, 6), anchor: { x: x, y: y }, tgt: null, tT: 0,
      cool: rand(0, 2), lunge: 0, lx: 0, ly: 0, locked: false, lockT: 0, dead: false
    });
  }

  function fillPopulations(initial) {
    var r = run, n = r.info.n, counts = {};
    r.npcs.forEach(function (o) { counts[o.sp.id] = (counts[o.sp.id] || 0) + 1; });
    SPECIES.forEach(function (sp) {
      if (sp.minL > n) return;
      var target = sp.base * (1 + 0.06 * (n - 1));
      if (sp.kind === 'hunter' || sp.kind === 'ambush') target *= (1 + 0.9 * r.tension);
      target = Math.round(target);
      var add = Math.min(target - (counts[sp.id] || 0), initial ? target : 2);
      for (var i = 0; i < add; i++) spawnNPC(sp, initial);
    });
  }

  // ---------- player ----------
  function speedFor(size) { return 200 * clamp(1.15 - 0.0045 * size, 0.62, 1.15); }

  function toWorld(sx, sy) {
    return { x: cam.x + (sx - CW / 2) / cam.scale, y: cam.y + (sy - CH / 2) / cam.scale };
  }

  function updatePlayer(dt) {
    var r = run, dx = 0, dy = 0;
    if (ptr.down) {
      var w = toWorld(ptr.x, ptr.y);
      var ex = w.x - r.x, ey = w.y - r.y, dist = Math.hypot(ex, ey);
      if (dist > 14) { dx = ex / dist; dy = ey / dist; }
    }
    var kx = (keys.ArrowRight || keys.d || keys.D ? 1 : 0) - (keys.ArrowLeft || keys.a || keys.A ? 1 : 0);
    var ky = (keys.ArrowDown || keys.s || keys.S ? 1 : 0) - (keys.ArrowUp || keys.w || keys.W ? 1 : 0);
    if (kx || ky) {
      var kl = Math.hypot(kx, ky);
      dx = kx / kl;
      dy = ky / kl;
    }
    var moving = dx !== 0 || dy !== 0;
    var sprint = (sprintHeld || keys.Shift || keys[' ']) && moving && r.stamina > 0;
    if (sprint) {
      r.stamina = Math.max(0, r.stamina - 38 * dt);
      r.sprintCd = 0.8;
    } else {
      r.sprintCd -= dt;
      if (r.sprintCd <= 0) r.stamina = Math.min(100, r.stamina + 24 * dt);
    }
    r.sprinting = sprint;
    var sp = speedFor(r.size) * (sprint ? 2.1 : 1);
    var k = Math.min(1, dt * 7);
    r.vx += (dx * sp - r.vx) * k;
    r.vy += (dy * sp - r.vy) * k;
    r.x = clamp(r.x + r.vx * dt, 0, r.info.W);
    r.y = clamp(r.y + r.vy * dt, 0, r.info.H);
    if (Math.abs(r.vx) > 6) r.facing = r.vx > 0 ? 1 : -1;
    if (r.inv > 0) r.inv -= dt;
  }

  // ---------- NPC behaviour ----------
  function wander(n, rad) {
    var r = run;
    if (n.tT <= 0 || !n.tgt) {
      n.tgt = {
        x: clamp(n.anchor.x + rand(-rad, rad), 0, r.info.W),
        y: clamp(n.anchor.y + rand(-rad * 0.6, rad * 0.6), 0, r.info.H)
      };
      n.tT = rand(2, 4);
    }
    return n.tgt;
  }

  function updateNPC(n, dt, predators) {
    var sp = n.sp, r = run;
    n.t += dt;
    n.cool = Math.max(0, n.cool - dt);
    n.tT -= dt;
    var dxp = r.x - n.x, dyp = r.y - n.y, dp = Math.hypot(dxp, dyp) || 1;
    var speed = sp.speed * n.spd;
    var tx = null, ty = null, s = 0, k = 2.5;

    if (sp.kind === 'food') {
      var fw = wander(n, 300);
      tx = fw.x; ty = fw.y; s = speed * 0.5;
    } else if (sp.kind === 'prey') {
      var fx = 0, fy = 0, threat = false, i, pr;
      if (r.size >= n.size * 1.15 && dp < 320) { threat = true; fx -= dxp / dp; fy -= dyp / dp; }
      for (i = 0; i < predators.length; i++) {
        pr = predators[i];
        if (pr.size < n.size * 1.15) continue;
        var ddx = n.x - pr.x, ddy = n.y - pr.y, dd = Math.hypot(ddx, ddy) || 1;
        if (dd < 280) { threat = true; fx += ddx / dd; fy += ddy / dd; }
      }
      if (threat) {
        var fl = Math.hypot(fx, fy) || 1;
        tx = n.x + fx / fl * 400; ty = n.y + fy / fl * 400; s = speed * 1.7; k = 6;
      } else if (sp.school) {
        var cx = 0, cy = 0, c = 0, j;
        for (j = 0; j < r.npcs.length; j++) {
          var o = r.npcs[j];
          if (o === n || o.sp !== sp || o.dead) continue;
          var ex = o.x - n.x, ey = o.y - n.y;
          if (ex * ex + ey * ey < 260 * 260) { cx += o.x; cy += o.y; c++; }
        }
        if (c > 0) { tx = cx / c; ty = cy / c; s = speed * 0.8; }
      }
      if (tx === null) { var pw = wander(n, 350); tx = pw.x; ty = pw.y; s = speed * 0.5; }
    } else if (sp.kind === 'ambush') {
      var range = sp.range || 160;
      if (n.lunge > 0) {
        n.lunge -= dt;
        tx = n.lx; ty = n.ly; s = speed * 3.2; k = 8;
      } else if (n.cool <= 0 && r.size * 1.1 < n.size && dp < range + n.size * 2) {
        n.lunge = 0.9; n.cool = 3.5;
        n.lx = r.x; n.ly = r.y;
        tx = n.lx; ty = n.ly; s = speed * 3.2; k = 8;
      } else {
        tx = n.anchor.x + Math.sin(n.t * 0.6) * 30; ty = n.anchor.y + Math.cos(n.t * 0.5) * 20; s = speed * 0.35;
      }
    } else if (sp.kind === 'hunter') {
      var canEat = r.size * 1.1 < n.size;      // the player is prey to this fish
      var playerBig = r.size > n.size * 1.25;  // a bigger fish scares it off
      if (n.locked) {
        n.lockT -= dt;
        if (!canEat || n.lockT <= 0 || dp > sp.sense * 2.2) {
          n.locked = false;
          n.cool = 4;
        } else {
          tx = r.x; ty = r.y; s = sp.speed * (1.1 + 0.3 * r.tension) * n.spd; k = 4;
        }
      }
      if (!n.locked) {
        if (playerBig && dp < 220) {
          tx = n.x - dxp / dp * 400; ty = n.y - dyp / dp * 400; s = speed * 1.2; k = 5;
        } else if (canEat && n.cool <= 0 && dp < sp.sense && Math.random() < (0.4 + 0.6 * r.tension) * dt) {
          n.locked = true;
          n.lockT = 7 + 2 * r.tension;
          tx = r.x; ty = r.y; s = sp.speed * (1.1 + 0.3 * r.tension) * n.spd; k = 4;
        } else {
          var hw = wander(n, 900);
          tx = hw.x; ty = hw.y; s = speed * 0.6;
        }
      }
    } else { // harmless
      var bw = wander(n, 600);
      tx = bw.x; ty = bw.y + Math.sin(n.t * 0.7) * 40; s = speed * 0.5;
    }

    var dvx = 0, dvy = 0;
    if (tx !== null) {
      var ddx2 = tx - n.x, ddy2 = ty - n.y, dd2 = Math.hypot(ddx2, ddy2);
      if (dd2 > 2) { dvx = ddx2 / dd2 * s; dvy = ddy2 / dd2 * s; }
    }
    n.vx += (dvx - n.vx) * Math.min(1, dt * k);
    n.vy += (dvy - n.vy) * Math.min(1, dt * k);
    n.x = clamp(n.x + n.vx * dt, 0, r.info.W);
    n.y = clamp(n.y + n.vy * dt, 0, r.info.H);
    if (Math.abs(n.vx) > 3) n.facing = n.vx > 0 ? 1 : -1;
  }

  // ---------- eating, being eaten, growing ----------
  function burst(x, y, col, count) {
    for (var i = 0; i < count; i++) {
      run.parts.push({ x: x, y: y, vx: rand(-120, 120), vy: rand(-120, 40), life: 0.6, max: 0.6, col: col, r: rand(2, 5) });
    }
  }

  function floatText(x, y, txt) {
    run.parts.push({ x: x, y: y, vx: 0, vy: -60, life: 0.9, max: 0.9, txt: txt });
  }

  function updateParts(dt) {
    run.parts.forEach(function (p) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.96;
    });
    run.parts = run.parts.filter(function (p) { return p.life > 0; });
  }

  function checkGrowth() {
    while (run && mode === 'play' && run.size >= run.info.goal) {
      if (run.info.n >= 20) { endRun('win'); return; }
      FishSound.play('levelup');
      enterLevel(run.info.n + 1);
    }
  }

  function eatNPC(n) {
    var r = run, gain;
    n.dead = true;
    if (n.sp.spiky) {
      r.size = Math.max(0.6, r.size - 2);
      floatText(n.x, n.y, 'Spines! -2');
      FishSound.play('hurt');
    } else {
      gain = n.size * 0.4;
      r.size += gain;
      floatText(n.x, n.y, '+' + gain.toFixed(1));
      FishSound.play('eat');
    }
    r.eaten++;
    burst(n.x, n.y, n.sp.col || '#ffffff', 6);
    checkGrowth();
  }

  function hurt() {
    var r = run;
    if (r.inv > 0) return;
    r.lives--;
    FishSound.play('hurt');
    r.size = Math.max(r.info.enterSize, r.size * 0.75);
    if (r.lives <= 0) { r.lives = 0; endRun('eaten'); return; }
    r.x = r.info.W / 2;
    r.y = r.info.H / 2;
    r.vx = 0;
    r.vy = 0;
    r.inv = 3;
    r.npcs.forEach(function (o) { o.locked = false; o.cool = 3; });
    r.npcs = r.npcs.filter(function (o) { return Math.hypot(o.x - r.x, o.y - r.y) > 420; });
    cam.x = r.x;
    cam.y = r.y;
    showBanner('Ouch!', r.lives + (r.lives === 1 ? ' life' : ' lives') + ' left. Swim on!', 2200);
  }

  function checkContact(n) {
    var r = run, sp = n.sp;
    var d = Math.hypot(n.x - r.x, n.y - r.y);
    var reach = (lenFor(r.size, 'round') + lenFor(n.size, sp.shape)) * 0.36;
    if (d > reach) return;
    var dangerous = sp.kind === 'hunter' || sp.kind === 'ambush';
    if (dangerous && n.size >= r.size * 1.1) { hurt(); return; }
    if (r.size >= n.size * 1.15) eatNPC(n);
  }

  // ---------- rules, timing, ending ----------
  function endRun(reason) {
    var r = run;
    if (!r || mode !== 'play') return;
    mode = 'over';
    var score = r.level * 100 + Math.floor(r.size * 10) + r.eaten * 2 + (reason === 'win' ? 500 : 0);
    r.score = score;
    if (score > best) {
      best = score;
      try { localStorage.setItem('fish_best', String(best)); } catch (e) { /* private mode */ }
    }
    var title, text;
    if (reason === 'win') {
      title = 'You are the largest fish ever!';
      text = 'From a baby fish to a whale shark in ' + mmss(r.t) + '. Plankton, to the very top.';
      FishSound.play('win');
    } else if (reason === 'eaten') {
      title = 'Eaten!';
      text = 'You reached level ' + r.level + ' (' + r.info.name + ') at size ' + r.size.toFixed(1) + '.';
      FishSound.play('lose');
    } else {
      title = "Time's up";
      text = 'Fifteen minutes in the sea. You reached level ' + r.level + ' (' + r.info.name + ').';
      FishSound.play('lose');
    }
    text += ' Score ' + score + '.';
    showCard(title, text);
  }

  function update(dt) {
    var r = run;
    r.t += dt;
    r.tension = clamp((r.t - CFG.TENSION.start) / (CFG.TENSION.full - CFG.TENSION.start), 0, 1);
    if (r.t >= CFG.TIME_LIMIT) { endRun('time'); return; }

    updatePlayer(dt);

    r.spawnT = (r.spawnT || 0) - dt;
    if (r.spawnT <= 0) { r.spawnT = 1.2; fillPopulations(false); }

    var predators = r.npcs.filter(function (o) {
      return !o.dead && (o.sp.kind === 'hunter' || o.sp.kind === 'ambush');
    });
    var i;
    for (i = 0; i < r.npcs.length; i++) {
      if (!r.npcs[i].dead) updateNPC(r.npcs[i], dt, predators);
    }

    var locks = 0;
    for (i = 0; i < r.npcs.length; i++) if (r.npcs[i].locked) locks++;
    if (locks > (r.lockedCount || 0)) FishSound.play('lock');
    r.lockedCount = locks;

    var list = r.npcs.slice();
    var lvl = r.info.n;
    for (i = 0; i < list.length; i++) {
      if (list[i].dead) continue;
      checkContact(list[i]);
      if (mode !== 'play' || run.info.n !== lvl) break;
    }
    if (mode === 'play') r.npcs = r.npcs.filter(function (o) { return !o.dead; });
    updateParts(dt);
    if (r.bannerT > 0) {
      r.bannerT -= dt;
      if (r.bannerT <= 0) hideBanner();
    }
  }

  // ---------- rendering ----------
  function render(t) {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var z = run ? run.info.zone : D.ZONES[0];
    drawBackground(z, t);
    if (!run) return;

    ctx.save();
    ctx.translate(CW / 2, CH / 2);
    ctx.scale(cam.scale, cam.scale);
    ctx.translate(-cam.x, -cam.y);

    ctx.setLineDash([12 / cam.scale, 10 / cam.scale]);
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 3 / cam.scale;
    ctx.strokeRect(0, 0, run.info.W, run.info.H);
    ctx.setLineDash([]);

    var list = run.npcs.slice();
    var playerVisible = !(run.inv > 0 && Math.floor(t * 10) % 2 === 0);
    if (playerVisible) {
      list.push({ x: run.x, y: run.y, vy: run.vy, facing: run.facing, size: run.size, desc: playerDesc(run.size), isPlayer: true });
    }
    list.sort(function (a, b) { return a.size - b.size; });
    list.forEach(function (e) { drawEntity(e, t + (e.t || 0)); });

    run.npcs.forEach(function (n) {
      if (!n.locked) return;
      var rad = lenFor(n.size, n.sp.shape) * 0.75 + 6 / cam.scale;
      ctx.setLineDash([8 / cam.scale, 6 / cam.scale]);
      ctx.strokeStyle = '#ff7a6b';
      ctx.lineWidth = 3 / cam.scale;
      ctx.beginPath();
      ctx.arc(n.x, n.y, rad, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    run.parts.forEach(function (p) {
      var a = Math.max(0, p.life / p.max);
      if (p.txt) {
        ctx.globalAlpha = a;
        ctx.fillStyle = OUT;
        ctx.font = 'bold ' + (18 / cam.scale) + 'px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.txt, p.x, p.y);
        ctx.globalAlpha = 1;
      } else {
        ctx.globalAlpha = a;
        ctx.fillStyle = p.col;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r / cam.scale * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    });
    ctx.restore();
  }

  function updateCamera(dt) {
    var r = run;
    var viewW = 900 + r.size * 10, viewH = 560 + r.size * 6;
    cam.scale = Math.min(CW / viewW, CH / viewH);
    var k = Math.min(1, dt * 4);
    cam.x += (r.x - cam.x) * k;
    cam.y += (r.y - cam.y) * k;
  }

  // ---------- HUD, banner and overlays ----------
  function showBanner(title, sub, ms) {
    run.bannerT = ms / 1000;
    var el = $('banner');
    $('banner-title').textContent = title;
    $('banner-sub').textContent = sub;
    el.hidden = false;
  }

  function hideBanner() { $('banner').hidden = true; }

  function updateHUD() {
    var r = run;
    if (!r) return;
    var span = Math.max(1, r.info.goal - r.info.enterSize);
    var pct = clamp((r.size - r.info.enterSize) / span, 0, 1);
    $('hud-level').textContent = 'Level ' + r.level + ' · ' + r.info.name;
    $('hud-zone').textContent = r.info.zone.name;
    $('size-fill').style.width = (pct * 100).toFixed(1) + '%';
    $('size-text').textContent = 'Size ' + r.size.toFixed(1) + ' / ' + r.info.goal;
    $('hud-lives').textContent = '❤️'.repeat(r.lives) || '—';
    $('hud-time').textContent = mmss(r.t) + ' / 15:00';
    $('sprint').style.setProperty('--stam', Math.round(r.stamina) + '%');
    $('lock-pill').hidden = !(r.lockedCount > 0);
  }

  function showCard(title, text) {
    $('card-title').textContent = title;
    $('card-text').textContent = text;
    $('card').hidden = false;
    document.body.setAttribute('data-mode', 'over');
  }

  function hideCard() { $('card').hidden = true; }

  function showTitle() {
    mode = 'title';
    run = null;
    paused = false;
    hideCard();
    hideBanner();
    $('lock-pill').hidden = true;
    $('title-best').textContent = best ? 'Best score: ' + best : 'No best score yet';
    $('title').hidden = false;
    $('panel').hidden = true;
    document.body.setAttribute('data-mode', 'title');
    refreshDbStatus();
  }

  function startRun() {
    FishSound.unlock();
    FishSound.play('click');
    hideCard();
    $('title').hidden = true;
    run = {
      level: 1, info: D.levelInfo(1), t: 0, tension: 0,
      lives: CFG.LIVES, eaten: 0, size: 1,
      x: 0, y: 0, vx: 0, vy: 0, facing: 1,
      stamina: 100, sprintCd: 0, sprinting: false, inv: 2.5,
      npcs: [], parts: [], spawnT: 0, bannerT: 0, lockedCount: 0, score: 0
    };
    run.x = run.info.W / 2;
    run.y = run.info.H / 2;
    cam.x = run.x;
    cam.y = run.y;
    mode = 'play';
    paused = false;
    fillPopulations(true);
    showBanner('Level 1: ' + run.info.name, 'Swim with your finger. Eat plankton to grow.', 3200);
    document.body.setAttribute('data-mode', 'play');
    updateHUD();
  }

  // ---------- panel (⚙️) and notes ----------
  function openPanel() {
    $('panel').hidden = false;
    paused = true;
    $('sound-toggle').setAttribute('aria-pressed', String(FishSound.enabled()));
    $('sound-toggle').textContent = FishSound.enabled() ? 'On' : 'Off';
    $('errors-toggle').setAttribute('aria-pressed', String(showErrors));
    $('errors-toggle').textContent = showErrors ? 'On' : 'Off';
    refreshNotes();
    refreshDbStatus();
  }

  function closePanel() {
    $('panel').hidden = true;
    paused = false;
  }

  function refreshDbStatus() {
    var s = FishNotes.status();
    var labels = {
      off: 'Database: not connected yet (keys not set in js/species.js)',
      ready: 'Database: ready',
      saving: 'Database: saving…',
      saved: 'Database: saved',
      'sign-in needed': 'Database: needs family sign-in',
      failed: 'Database: failed'
    };
    var el = $('db-status');
    el.textContent = labels[s.state] || 'Database: ' + s.state;
    el.setAttribute('data-state', s.state);
    if (s.message) el.title = s.message;
    $('title-db').textContent = labels[s.state] || '';
    $('title-db').setAttribute('data-state', s.state);
  }

  function refreshNotes() {
    var list = FishNotes.list().slice(0, 5);
    var box = $('note-list');
    box.innerHTML = '';
    if (!list.length) {
      var empty = document.createElement('p');
      empty.className = 'muted';
      empty.textContent = 'No notes yet.';
      box.appendChild(empty);
      return;
    }
    list.forEach(function (n) {
      var item = document.createElement('div');
      item.className = 'note-item';
      var meta = document.createElement('small');
      meta.textContent = 'Level ' + n.level + ' · size ' + Number(n.size).toFixed(1) + ' · ' + mmss(n.seconds || 0);
      var text = document.createElement('p');
      text.textContent = n.text;
      item.appendChild(meta);
      item.appendChild(text);
      box.appendChild(item);
    });
  }

  function saveNote() {
    var text = $('note-text').value;
    var status = $('note-status');
    var info = run ? { level: run.level, size: run.size, seconds: run.t } : { level: 0, size: 0, seconds: 0 };
    if (!FishNotes.clip(text)) { status.textContent = 'Write a note first.'; return; }
    status.textContent = 'Saving…';
    FishNotes.add(text, info).then(function (res) {
      if (res && res.ok) {
        $('note-text').value = '';
        status.textContent = 'Saved in this browser (cookie).';
      } else {
        status.textContent = 'Not saved. Write a note first.';
      }
      refreshNotes();
      refreshDbStatus();
    });
  }

  // ---------- errors (bottom of the page, only when opted in) ----------
  function reportError(msg) {
    errorLog.push(String(msg));
    errorLog = errorLog.slice(-5);
    renderErrors();
  }

  function renderErrors() {
    var box = $('errors');
    if (!showErrors || !errorLog.length) { box.hidden = true; return; }
    box.hidden = false;
    box.textContent = errorLog.join('\n');
  }

  window.addEventListener('error', function (e) { reportError(e.message || 'Script error'); });
  window.addEventListener('unhandledrejection', function (e) {
    reportError(e.reason && e.reason.message ? e.reason.message : 'Unhandled promise error');
  });

  // ---------- input ----------
  canvas.addEventListener('pointerdown', function (ev) {
    FishSound.unlock();
    if (mode !== 'play' || paused) return;
    ptr.down = true;
    ptr.x = ev.clientX;
    ptr.y = ev.clientY;
    try { canvas.setPointerCapture(ev.pointerId); } catch (e) { /* not supported */ }
    ev.preventDefault();
  });
  canvas.addEventListener('pointermove', function (ev) {
    if (ptr.down) { ptr.x = ev.clientX; ptr.y = ev.clientY; }
  });
  function pointerUp() { ptr.down = false; }
  canvas.addEventListener('pointerup', pointerUp);
  canvas.addEventListener('pointercancel', pointerUp);

  var sprintBtn = $('sprint');
  sprintBtn.addEventListener('pointerdown', function (ev) {
    ev.preventDefault();
    FishSound.unlock();
    sprintHeld = true;
    try { sprintBtn.setPointerCapture(ev.pointerId); } catch (e) { /* not supported */ }
  });
  ['pointerup', 'pointercancel'].forEach(function (name) {
    sprintBtn.addEventListener(name, function () { sprintHeld = false; });
  });

  window.addEventListener('keydown', function (e) {
    var k = e.key;
    keys[k] = true;
    if (k === ' ' || k.indexOf('Arrow') === 0) e.preventDefault();
    if (k === 'Escape' && mode === 'play') { if ($('panel').hidden) openPanel(); else closePanel(); }
  });
  window.addEventListener('keyup', function (e) { keys[e.key] = false; });
  window.addEventListener('blur', function () { keys = {}; sprintHeld = false; ptr.down = false; });

  // Buttons
  $('btn-play').addEventListener('click', startRun);
  $('btn-howto').addEventListener('click', function () { $('howto').hidden = !$('howto').hidden; });
  $('card-again').addEventListener('click', startRun);
  $('card-title-btn').addEventListener('click', showTitle);
  $('card-note').addEventListener('click', function () { hideCard(); openPanel(); });
  $('gear').addEventListener('click', function () { if ($('panel').hidden) openPanel(); else closePanel(); });
  $('panel-close').addEventListener('click', closePanel);
  $('panel-title').addEventListener('click', function () { closePanel(); showTitle(); });
  $('sound-toggle').addEventListener('click', function () {
    var on = !FishSound.enabled();
    FishSound.setEnabled(on);
    $('sound-toggle').setAttribute('aria-pressed', String(on));
    $('sound-toggle').textContent = on ? 'On' : 'Off';
    if (on) FishSound.play('click');
  });
  $('errors-toggle').addEventListener('click', function () {
    showErrors = !showErrors;
    try { localStorage.setItem('fish_show_errors', showErrors ? 'on' : 'off'); } catch (e) { /* private mode */ }
    $('errors-toggle').setAttribute('aria-pressed', String(showErrors));
    $('errors-toggle').textContent = showErrors ? 'On' : 'Off';
    renderErrors();
  });
  $('note-save').addEventListener('click', saveNote);

  window.addEventListener('resize', resize);

  // ---------- main loop ----------
  var last = 0;
  function frame(ts) {
    var secs = ts / 1000;
    var dt = Math.min(0.05, last ? (ts - last) / 1000 : 0);
    last = ts;
    try {
      if (mode === 'play' && !paused && run) {
        update(dt);
        if (mode === 'play') updateCamera(dt);
        hudTimer -= dt;
        if (hudTimer <= 0 && mode === 'play') { hudTimer = 0.1; updateHUD(); }
      } else if (run && mode === 'play' && !paused) {
        updateCamera(dt);
      }
      render(secs);
    } catch (err) {
      reportError(err && err.message ? err.message : 'Game loop error');
    }
    requestAnimationFrame(frame);
  }

  resize();
  showTitle();
  requestAnimationFrame(frame);
  // Test hook (used by the headless checks): jump to a size and apply the level rules.
  window.FishGame = {
    resize: resize,
    debugSetSize: function (s) { if (run && mode === 'play') { run.size = s; checkGrowth(); } },
    state: function () {
      return {
        mode: mode, level: run && run.level, size: run && run.size, npcs: run ? run.npcs.length : 0,
        locks: run ? run.lockedCount : 0, lives: run && run.lives,
        player: run && { x: run.x, y: run.y }, cam: { x: cam.x, y: cam.y, scale: cam.scale },
        hunters: run ? run.npcs.filter(function (o) { return o.sp.kind === 'hunter'; }).map(function (o) { return { x: o.x, y: o.y, size: o.size, locked: o.locked }; }) : []
      };
    }
  };
})();
