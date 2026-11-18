/* Generate Clouds — the renderer.
   A full-screen quad runs the sky shader (js/shader.js). The same shader draws the
   live view, a still at any size, and a 360° panorama (in tiles, so a big picture
   never needs one big draw). */
(function () {
  'use strict';
  var GC = window.GC = window.GC || {};
  var R = GC.Renderer = {};
  var QUALITY = {
    low:  { steps: 40, lsteps: 3, maxScale: 0.5, tsteps: 48, tgrow: 0.10 },
    med:  { steps: 64, lsteps: 4, maxScale: 0.75, tsteps: 64, tgrow: 0.085 },
    high: { steps: 96, lsteps: 6, maxScale: 1.0, tsteps: 90, tgrow: 0.07 }
  };
  var EXPORT_Q = { steps: 200, lsteps: 7, tsteps: 150, tgrow: 0.05 };
  var FINE_Q = { steps: 320, lsteps: 8, tsteps: 170, tgrow: 0.045 }, STRIPS = 12, FINE_PIXELS = 2600000;
  var renderer, scene, camera, mat, canvas, U;
  R.cam = { yaw: 0, pitch: 15, fov: 70, alt: 0.002, x: 0, z: 0 };     // x east, z south, km from the chosen place
  R.scale = 0.5; R.ok = false; R.frames = 0; R.busy = false;

  function noiseTexture() {
    var n = 256, g = new Uint8Array(n * n), data = new Uint8Array(n * n * 4), s = 1234567;
    for (var i = 0; i < n * n; i++) { s = (s * 1664525 + 1013904223) >>> 0; g[i] = s >>> 24; }
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      var o = (y * n + x) * 4;
      data[o] = g[((y + 17) & 255) * n + ((x + 37) & 255)];    // red = green shifted by (37,17)
      data[o + 1] = g[y * n + x]; data[o + 2] = 0; data[o + 3] = 255;
    }
    var t = new THREE.DataTexture(data, n, n, THREE.RGBAFormat);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.minFilter = t.magFilter = THREE.LinearFilter; t.generateMipmaps = false; t.needsUpdate = true;
    return t;
  }

  R.init = function (cv) {
    canvas = cv;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    } catch (e) { GC.logError('3-D could not start: ' + e.message); return false; }
    renderer.setPixelRatio(1);
    scene = new THREE.Scene(); camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    function v3() { return { value: new THREE.Vector3() }; } function v4() { return { value: new THREE.Vector4() }; }
    U = {
      uNoise: { value: noiseTexture() }, uProj: { value: 0 }, uTile: { value: new THREE.Vector4(0, 0, 1, 1) },
      uCamR: v3(), uCamU: v3(), uCamF: v3(), uTanFov: { value: 0.7 }, uAspect: { value: 1 }, uAlt: { value: 0.002 },
      uSunDir: v3(), uSunI: { value: GC.Atmo.SUN_I }, uSun0: v3(), uSun1: v3(), uSunC: v3(), uAmbTop: v3(), uAmbBot: v3(),
      uHaze: { value: 1 }, uHazeTint: v3(), uFogK: v3(),
      uL0a: v4(), uL0b: v4(), uL0w: v4(), uL1a: v4(), uL1b: v4(), uL1w: v4(), uC: v4(), uCw: v4(),
      uSeed: v3(), uEvolve: { value: 0 }, uExposure: { value: 1 }, uNight: { value: 0 }, uRain: { value: 0 },
      uFlash: { value: 0 }, uFlashPos: { value: new THREE.Vector2() }, uGain: { value: 0.32 },
      uSteps: { value: 44 }, uLSteps: { value: 4 }, uMS: { value: 0.28 }, uPix: { value: 0.002 }, uFar: { value: 260 }, uFineK: { value: 0.5 },
      uTerrain: { value: null }, uRegion: { value: null }, uCamXZ: { value: new THREE.Vector2() }, uSkyZen: v3(), uSkyHor: v3(), uBoltSeed: { value: 1 },
      uTerr: v4(), uCity: { value: new THREE.Vector2() }, uTSteps: { value: 64 }, uTGrow: { value: 0.085 }, uSea: v4(), uReg: v4(), uVar: { value: new THREE.Vector2(0, 1) },
      uCmix: { value: 0 }, uPrecip: v4(), uFeat: v4(), uFeatB: v4(),
      uTerrainF: { value: null }, uWorld: { value: null }, uRegion2: { value: null }, uFine: v4(), uReg2: v4(), uSea2: v4(), uWorldP: v3()
    };
    mat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: GC.VERT, fragmentShader: GC.FRAG, depthTest: false, depthWrite: false });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); R.ok = false; GC.logError('The 3-D view was lost (graphics memory). Reload the page.'); });
    R.setTerrain(GC.Terrain); R.setTerrainFine(null); R.setRegion(null); R.setRegion2(null); R.setWorld(window.GC_WORLD);
    R.ok = true;
    R.setQuality(GC.settings.quality);
    return true;
  };

  // The ground: a 128 x 128 half-float picture of height (red) and land or sea (green).
  var terrTex = null, regTex = null;
  R.terrMax = 0.3; R.clock = 0; R.city = 0; R.regionOn = 0; R.feature = null; R.groundAtFeature = 0;
  R.setTerrain = function (Tn) {
    if (terrTex) terrTex.dispose();
    terrTex = new THREE.DataTexture(Tn.tex, Tn.T, Tn.T, THREE.RGBAFormat, THREE.HalfFloatType);
    terrTex.wrapS = terrTex.wrapT = THREE.ClampToEdgeWrapping; terrTex.minFilter = terrTex.magFilter = THREE.LinearFilter; terrTex.generateMipmaps = false; terrTex.needsUpdate = true;
    U.uTerrain.value = terrTex; R.terrMax = Tn.max * R.exag; R.terrSpan = Tn.SPAN;
  };
  // The fine ground map around the place (about 11 km across), or null for none.
  R.cloudsOn = 1; R.fineSpan = 0; R.exag = 1; R.worldOn = 0; R.region2On = 0; R.place = { lat: 0, lon: 0 };
  function blank() { var t = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1, THREE.RGBAFormat); t.needsUpdate = true; return t; }
  var fineTex = null;
  R.setTerrainFine = function (Tn) {
    if (fineTex) { fineTex.dispose(); fineTex = null; }
    if (!Tn || !Tn.fineTex) { U.uTerrainF.value = blank(); R.fineSpan = 0; return; }
    fineTex = new THREE.DataTexture(Tn.fineTex, Tn.T, Tn.T, THREE.RGBAFormat, THREE.HalfFloatType);
    fineTex.wrapS = fineTex.wrapT = THREE.ClampToEdgeWrapping; fineTex.minFilter = fineTex.magFilter = THREE.LinearFilter; fineTex.generateMipmaps = false; fineTex.needsUpdate = true;
    U.uTerrainF.value = fineTex; R.fineSpan = Tn.fineSpan; R.terrMax = Math.max(R.terrMax, Tn.fineMax * R.exag);
  };
  // The whole Earth picture (a data address, so it also works from a file).
  var worldTex = null;
  R.setWorld = function (uri) {
    U.uWorld.value = blank();
    if (!uri) return;
    var img = new Image();
    img.onload = function () {
      worldTex = new THREE.Texture(img);
      worldTex.wrapS = THREE.RepeatWrapping; worldTex.wrapT = THREE.ClampToEdgeWrapping;
      worldTex.minFilter = worldTex.magFilter = THREE.LinearFilter; worldTex.generateMipmaps = false; worldTex.needsUpdate = true;
      U.uWorld.value = worldTex; R.worldOn = 1; if (R.onWorld) R.onWorld();
    };
    img.onerror = function () { GC.logError('The world map picture could not be decoded. The far ground is plain.'); };
    img.src = uri;
  };
  // The region: 5 x 5 cloud cover (low, mid, high) around the place, or null for none.
  R.setRegion = function (cells) {
    var n = 5, data = new Uint8Array(n * n * 4);
    for (var i = 0; i < n * n; i++) { var c = cells ? cells[i] : [0, 0, 0]; data[i * 4] = Math.round(c[0] * 255); data[i * 4 + 1] = Math.round(c[1] * 255); data[i * 4 + 2] = Math.round(c[2] * 255); data[i * 4 + 3] = 255; }
    if (regTex) regTex.dispose();
    regTex = new THREE.DataTexture(data, n, n, THREE.RGBAFormat);
    regTex.wrapS = regTex.wrapT = THREE.ClampToEdgeWrapping; regTex.minFilter = regTex.magFilter = THREE.LinearFilter; regTex.generateMipmaps = false; regTex.needsUpdate = true;
    U.uRegion.value = regTex; R.regionOn = cells ? 1 : 0;
  };

  // The wide region: 9 x 9 cloud cover, 250 km apart (2000 km across), or null.
  var reg2Tex = null;
  R.setRegion2 = function (cells) {
    var n = 9, data = new Uint8Array(n * n * 4);
    for (var i = 0; i < n * n; i++) { var c = cells ? cells[i] : [0, 0, 0]; data[i * 4] = Math.round(c[0] * 255); data[i * 4 + 1] = Math.round(c[1] * 255); data[i * 4 + 2] = Math.round(c[2] * 255); data[i * 4 + 3] = 255; }
    if (reg2Tex) reg2Tex.dispose();
    reg2Tex = new THREE.DataTexture(data, n, n, THREE.RGBAFormat);
    reg2Tex.wrapS = reg2Tex.wrapT = THREE.ClampToEdgeWrapping; reg2Tex.minFilter = reg2Tex.magFilter = THREE.LinearFilter; reg2Tex.generateMipmaps = false; reg2Tex.needsUpdate = true;
    U.uRegion2.value = reg2Tex; R.region2On = cells ? 1 : 0;
  };

  R.setQuality = function (q) {
    R.q = QUALITY[q] || QUALITY.med;
    R.scale = Math.min(R.scale, R.q.maxScale);
    if (R.scale < 0.25) R.scale = 0.25;
    R.resize();
  };
  R.resize = function () {
    if (!renderer) return;
    var w = Math.max(2, Math.round(canvas.clientWidth * R.scale)), h = Math.max(2, Math.round(canvas.clientHeight * R.scale));
    renderer.setSize(w, h, false);
  };
  // Keep the time lapse smooth: fewer pixels when frames are slow, more when there is room.
  R.adapt = function (ms) {
    var s = R.scale;
    if (ms > 55 && s > 0.25) s = Math.max(0.25, s * 0.82);
    else if (ms < 22 && s < R.q.maxScale) s = Math.min(R.q.maxScale, s * 1.12);
    if (s !== R.scale) { R.scale = s; R.resize(); }
  };

  function setCam() {
    var y = GC.rad(R.cam.yaw), p = GC.rad(R.cam.pitch);
    var f = new THREE.Vector3(Math.sin(y) * Math.cos(p), Math.sin(p), -Math.cos(y) * Math.cos(p));
    var r = new THREE.Vector3(Math.cos(y), 0, Math.sin(y));
    U.uCamF.value.copy(f); U.uCamR.value.copy(r); U.uCamU.value.crossVectors(r, f);
    U.uTanFov.value = Math.tan(GC.rad(R.cam.fov) / 2); U.uAlt.value = R.cam.alt;
    U.uFar.value = 260 + 14 * R.cam.alt;
  }
  R.apply = function (F) {
    function s3(u, a) { u.value.set(a[0], a[1], a[2]); } function s4(u, a) { u.value.set(a[0], a[1], a[2], a[3]); }
    s3(U.uSunDir, F.sunDir); s3(U.uSun0, F.sun0); s3(U.uSun1, F.sun1); s3(U.uSunC, F.sunC); s3(U.uAmbTop, F.ambTop); s3(U.uAmbBot, F.ambBot);
    U.uHaze.value = F.haze; s3(U.uHazeTint, F.tint); s3(U.uFogK, F.fogK);
    s4(U.uL0a, F.L0a); s4(U.uL0b, F.L0b); s4(U.uL0w, F.L0w); U.uL0w.value.x -= R.cam.x; U.uL0w.value.y -= R.cam.z; s4(U.uL1a, F.L1a); s4(U.uL1b, F.L1b); s4(U.uL1w, F.L1w); U.uL1w.value.x -= R.cam.x; U.uL1w.value.y -= R.cam.z; s4(U.uC, F.C); s4(U.uCw, F.Cw); U.uCw.value.x -= R.cam.x; U.uCw.value.y -= R.cam.z;
    s3(U.uSeed, F.seed); U.uEvolve.value = F.evolve; U.uExposure.value = F.exposure; U.uNight.value = F.night; U.uRain.value = F.rain; U.uMS.value = F.ms;
    U.uCamXZ.value.set(R.cam.x, R.cam.z); s3(U.uSkyZen, F.skyZen); s3(U.uSkyHor, F.skyHor);
    U.uTerr.value.set(R.terrSpan, R.terrMax, F.terr[0], F.terr[1]); U.uCity.value.set(R.city, 0);
    U.uFine.value.set(R.fineSpan, R.exag, 0, 0); U.uSea2.value.set(F.sea[3] || 0, F.sea[4] || 0, 0, 0);
    U.uReg2.value.set(F.regionMix * R.region2On, 1125, 0, 0);
    var lat0 = GC.clamp(R.place.lat - R.cam.z / 111.19, -89.9, 89.9), lon0 = R.place.lon + R.cam.x / (111.19 * Math.max(Math.cos(GC.rad(R.place.lat)), 0.05));
    U.uWorldP.value.set(GC.rad(lat0), GC.rad(lon0), R.worldOn);
    U.uSea.value.set(F.sea[0], R.clock, F.sea[1], F.sea[2]);
    // regional data is used unless the cover was set by hand; far-away variety always
    U.uReg.value.set(F.regionMix * R.regionOn, 250, 1, 0);
    if (F.regionMix * R.regionOn > 0) { U.uL0a.value.z = Math.max(U.uL0a.value.z, 0.004); U.uL1a.value.z = Math.max(U.uL1a.value.z, F.L1a[2] > 0 || F.midOn ? 0.004 : 0); U.uC.value.y = Math.max(U.uC.value.y, 0.004); }
    if (R.cloudsOn === 0) { U.uL0a.value.z = 0; U.uL1a.value.z = 0; U.uC.value.y = 0; U.uReg.value.x = 0; U.uReg2.value.x = 0; }      // clouds hidden by the setting (last, so nothing turns them back on)
    U.uVar.value.set(F.vary[0], F.vary[1]); U.uCmix.value = F.cmix;
    U.uPrecip.value.set(F.precip[0], F.precip[1], F.precip[2], F.precip[3]);
    var ft = R.feature;
    if (ft) { U.uFeat.value.set(ft.x - R.cam.x, ft.z - R.cam.z, ft.kind === 'microburst' ? 2 : 1, ft.strength || 1); U.uFeatB.value.set(F.L0a[0], ft.seed || 1, ft.ground || 0, ft.sea ? 1 : 0); }
    else U.uFeat.value.set(0, 0, 0, 0);
  };
  R.flash = function (amount, x, z, seed) { if (seed != null) U.uBoltSeed.value = seed; U.uFlash.value = amount; U.uFlashPos.value.set(x - R.cam.x, z - R.cam.z); };

  R.render = function () {
    if (!R.ok || R.busy) return;
    setCam();
    U.uProj.value = 0; U.uTile.value.set(0, 0, 1, 1);
    U.uAspect.value = canvas.clientWidth / Math.max(canvas.clientHeight, 1);
    U.uSteps.value = R.q.steps; U.uLSteps.value = R.q.lsteps;
    U.uPix.value = 2 * U.uTanFov.value / Math.max(renderer.domElement.height, 1); U.uFineK.value = 0.5;
    U.uTSteps.value = R.q.tsteps; U.uTGrow.value = R.q.tgrow;
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
    R.frames++;
  };

  // Sharpen a still view: full sharpness and many more steps, drawn one strip per frame
  // so the page stays responsive. Any change to the view stops it.
  R.fine = 0;                                      // 0 = off, 1..STRIPS = strips drawn so far
  R.fineStart = function () {
    if (!R.ok || R.busy) return false;
    var dpr = Math.min(window.devicePixelRatio || 1, 2), w = canvas.clientWidth * dpr, h = canvas.clientHeight * dpr;
    var k = Math.min(1, Math.sqrt(FINE_PIXELS / (w * h)));
    renderer.setSize(Math.max(2, Math.round(w * k)), Math.max(2, Math.round(h * k)), false);
    R.render();                                    // a quick full frame first, so nothing flashes
    R.fine = 0; R.fineOn = true;
    return true;
  };
  R.fineStep = function () {
    if (!R.fineOn || R.fine >= STRIPS) return true;
    var W = renderer.domElement.width, H = renderer.domElement.height, y0 = Math.floor(H * R.fine / STRIPS), y1 = Math.floor(H * (R.fine + 1) / STRIPS);
    U.uSteps.value = FINE_Q.steps; U.uLSteps.value = FINE_Q.lsteps; U.uFineK.value = 0.2;
    U.uTSteps.value = FINE_Q.tsteps; U.uTGrow.value = FINE_Q.tgrow;
    renderer.setScissorTest(true); renderer.setScissor(0, H - y1, W, y1 - y0);
    renderer.render(scene, camera);
    renderer.setScissorTest(false);
    R.fine++;
    return R.fine >= STRIPS;
  };
  R.fineStop = function () { if (!R.fineOn) return; R.fineOn = false; R.fine = 0; R.resize(); };
  R.fineProgress = function () { return R.fineOn ? R.fine / STRIPS : 0; };

  // Draw the picture in tiles into a 2-D canvas. proj 0 = current view, 1 = 360° panorama.
  function renderTiles(W, H, proj, onProgress) {
    var TILE = 512, out = document.createElement('canvas'); out.width = W; out.height = H;
    var ctx = out.getContext('2d');
    if (!ctx) return Promise.reject(new Error('This device cannot make a picture that large.'));
    var rt = new THREE.WebGLRenderTarget(TILE, TILE, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: false });
    var buf = new Uint8Array(TILE * TILE * 4), tiles = [];
    for (var ty = 0; ty < H; ty += TILE) for (var tx = 0; tx < W; tx += TILE) tiles.push([tx, ty]);
    setCam();
    U.uProj.value = proj; U.uAspect.value = W / H; U.uSteps.value = EXPORT_Q.steps; U.uLSteps.value = EXPORT_Q.lsteps;
    U.uPix.value = proj ? Math.PI / H : 2 * U.uTanFov.value / H; U.uFineK.value = 0.3;
    U.uTSteps.value = EXPORT_Q.tsteps; U.uTGrow.value = EXPORT_Q.tgrow;
    R.busy = true;
    var i = 0;
    function done() { R.busy = false; rt.dispose(); renderer.setRenderTarget(null); }
    return new Promise(function (resolve, reject) {
      function next() {
        try {
          if (i >= tiles.length) { done(); resolve(out); return; }
          var tx = tiles[i][0], ty = tiles[i][1], tw = Math.min(TILE, W - tx), th = Math.min(TILE, H - ty);
          // ty counts from the bottom of the picture (WebGL rows run upward).
          U.uTile.value.set(tx / W, ty / H, TILE / W, TILE / H);
          renderer.setRenderTarget(rt); renderer.render(scene, camera);
          renderer.readRenderTargetPixels(rt, 0, 0, TILE, TILE, buf);
          var img = ctx.createImageData(tw, th);
          for (var y = 0; y < th; y++) {
            var src = y * TILE * 4, dst = (th - 1 - y) * tw * 4;
            img.data.set(buf.subarray(src, src + tw * 4), dst);
          }
          ctx.putImageData(img, tx, H - ty - th);
          i++;
          if (onProgress) onProgress(i / tiles.length);
          setTimeout(next, 0);
        } catch (e) { done(); reject(e); }
      }
      next();
    });
  }
  function download(cv, name) {
    return new Promise(function (resolve, reject) {
      cv.toBlob(function (blob) {
        if (!blob) { reject(new Error('The picture could not be saved (too large for this device).')); return; }
        var a = document.createElement('a'), url = URL.createObjectURL(blob);
        a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        resolve({ name: name, width: cv.width, height: cv.height, bytes: blob.size });
      }, 'image/png');
    });
  }
  R.exportView = function (W, H, name, onProgress) { return renderTiles(W, H, 0, onProgress).then(function (cv) { return download(cv, name); }); };
  R.exportPano = function (W, name, onProgress) { return renderTiles(W, W / 2, 1, onProgress).then(function (cv) { return download(cv, name); }); };
  R._tiles = renderTiles;
  R.maxTexture = function () { return renderer ? renderer.capabilities.maxTextureSize : 0; };
})();
