/* Generate Clouds — the renderer.
   A full-screen quad runs the sky shader (js/shader.js). The same shader draws the
   live view, a still at any size, and a 360° panorama (in tiles, so a big picture
   never needs one big draw). */
(function () {
  'use strict';
  var GC = window.GC = window.GC || {};
  var R = GC.Renderer = {};
  var QUALITY = {
    low:  { steps: 40, lsteps: 3, maxScale: 0.5 },
    med:  { steps: 64, lsteps: 4, maxScale: 0.75 },
    high: { steps: 96, lsteps: 6, maxScale: 1.0 }
  };
  var EXPORT_Q = { steps: 200, lsteps: 7 };
  var FINE_Q = { steps: 320, lsteps: 8 }, STRIPS = 12, FINE_PIXELS = 2600000;
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
      uSteps: { value: 44 }, uLSteps: { value: 4 }, uMS: { value: 0.28 }, uPix: { value: 0.002 }, uFar: { value: 260 }, uFineK: { value: 0.5 }
    };
    mat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: GC.VERT, fragmentShader: GC.FRAG, depthTest: false, depthWrite: false });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); R.ok = false; GC.logError('The 3-D view was lost (graphics memory). Reload the page.'); });
    R.ok = true;
    R.setQuality(GC.settings.quality);
    return true;
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
  };
  R.flash = function (amount, x, z) { U.uFlash.value = amount; U.uFlashPos.value.set(x - R.cam.x, z - R.cam.z); };

  R.render = function () {
    if (!R.ok || R.busy) return;
    setCam();
    U.uProj.value = 0; U.uTile.value.set(0, 0, 1, 1);
    U.uAspect.value = canvas.clientWidth / Math.max(canvas.clientHeight, 1);
    U.uSteps.value = R.q.steps; U.uLSteps.value = R.q.lsteps;
    U.uPix.value = 2 * U.uTanFov.value / Math.max(renderer.domElement.height, 1); U.uFineK.value = 0.5;
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
