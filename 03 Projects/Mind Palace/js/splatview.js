/* Mind Palace: a Gaussian splat renderer in plain WebGL 2. No library.
   How it draws:
   1. Every splat's numbers (middle, spread, colour) sit in one float texture, three texels per splat.
   2. Each frame the splats are sorted from far to near (a counting sort on the distance from the eye).
   3. Each splat is one small rectangle. The vertex shader squashes its 3-D spread onto the screen (a 2-D ellipse),
      and the fragment shader fades it out from the middle like a bell curve.
   4. Rectangles are blended back to front, so near splats cover far ones softly.
   Little-me is the last block of splats; the shader moves and turns that block, so walking costs nothing. */
(function () {
  'use strict';
  var MP = window.MP = window.MP || {};
  var PER_ROW = 682, TEX_W = PER_ROW * 3;

  var VERT = '#version 300 es\n' +
    'precision highp float; precision highp int; precision highp sampler2D;\n' +
    'uniform sampler2D uData; uniform mat4 uView; uniform mat4 uProj; uniform vec2 uFocal; uniform vec2 uViewport;\n' +
    'uniform int uAvStart; uniform mat3 uAvRot; uniform vec3 uAvPos; uniform float uSize;\n' +
    'in vec2 aQuad; in uint aIndex;\n' +
    'out vec4 vColor; out vec2 vPos;\n' +
    'void main() {\n' +
    '  int i = int(aIndex); ivec2 tc = ivec2((i % ' + PER_ROW + ') * 3, i / ' + PER_ROW + ');\n' +
    '  vec4 t0 = texelFetch(uData, tc, 0); vec4 t1 = texelFetch(uData, tc + ivec2(1, 0), 0); vec4 t2 = texelFetch(uData, tc + ivec2(2, 0), 0);\n' +
    '  vec3 c = t0.xyz;\n' +
    '  mat3 V = mat3(t1.x, t1.y, t1.z, t1.y, t2.x, t2.y, t1.z, t2.y, t2.z);\n' +
    '  if (i >= uAvStart) { c = uAvRot * c + uAvPos; V = uAvRot * V * transpose(uAvRot); }\n' +
    '  vec4 cam = uView * vec4(c, 1.0);\n' +
    '  float d = -cam.z;\n' +
    '  if (d < 0.25) { gl_Position = vec4(0.0, 0.0, 2.0, 1.0); return; }\n' +
    '  mat3 J = mat3(uFocal.x / d, 0.0, 0.0,  0.0, uFocal.y / d, 0.0,  uFocal.x * cam.x / (d * d), uFocal.y * cam.y / (d * d), 0.0);\n' +
    '  mat3 T = J * mat3(uView);\n' +
    '  mat3 S = T * (V * uSize * uSize) * transpose(T);\n' +
    '  float a = S[0][0] + 0.3; float b = S[0][1]; float e = S[1][1] + 0.3;\n' +
    '  float mid = 0.5 * (a + e); float rad = length(vec2(0.5 * (a - e), b));\n' +
    '  float l1 = mid + rad; float l2 = max(mid - rad, 0.1);\n' +
    '  vec2 v1 = abs(b) < 1e-6 ? (a >= e ? vec2(1.0, 0.0) : vec2(0.0, 1.0)) : normalize(vec2(b, l1 - a));\n' +
    '  vec2 major = min(sqrt(2.0 * l1), 1024.0) * v1; vec2 minor = min(sqrt(2.0 * l2), 1024.0) * vec2(v1.y, -v1.x);\n' +
    '  vec4 clip = uProj * cam;\n' +
    '  vPos = aQuad;\n' +
    '  float rgb = t0.w;\n' +
    '  vColor = vec4(mod(rgb, 256.0) / 255.0, mod(floor(rgb / 256.0), 256.0) / 255.0, floor(rgb / 65536.0) / 255.0, t1.w);\n' +
    '  gl_Position = vec4(clip.xy / clip.w + (aQuad.x * major + aQuad.y * minor) * 2.0 / uViewport, clip.z / clip.w, 1.0);\n' +
    '}\n';
  var FRAG = '#version 300 es\n' +
    'precision highp float;\n' +
    'in vec4 vColor; in vec2 vPos; out vec4 outColor;\n' +
    'void main() {\n' +
    '  float A = -dot(vPos, vPos);\n' +
    '  if (A < -4.0) discard;\n' +
    '  float B = exp(A) * vColor.a;\n' +
    '  outColor = vec4(vColor.rgb * B, B);\n' +     // colour already multiplied by its strength, for back-to-front blending
    '}\n';

  var gl, canvas, prog, loc = {}, vao, indexBuf, tex, data = null, order = null, sortCenter = null, depth = null, counts = new Uint32Array(65536), starts = new Uint32Array(65536);
  var view = new Float32Array(16), proj = new Float32Array(16), avPos = [0, 0, 0], avHeading = 0, size = 1;

  function shader(type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('shader: ' + gl.getShaderInfoLog(s));
    return s;
  }
  function init(cv) {
    canvas = cv;
    gl = cv.getContext('webgl2', { antialias: false, alpha: true, premultipliedAlpha: true });
    if (!gl) return false;
    prog = gl.createProgram(); gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link: ' + gl.getProgramInfoLog(prog));
    ['uData', 'uView', 'uProj', 'uFocal', 'uViewport', 'uAvStart', 'uAvRot', 'uAvPos', 'uSize'].forEach(function (n) { loc[n] = gl.getUniformLocation(prog, n); });
    vao = gl.createVertexArray(); gl.bindVertexArray(vao);
    var quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-2, -2, 2, -2, -2, 2, 2, 2]), gl.STATIC_DRAW);
    var aQuad = gl.getAttribLocation(prog, 'aQuad'); gl.enableVertexAttribArray(aQuad); gl.vertexAttribPointer(aQuad, 2, gl.FLOAT, false, 0, 0);
    indexBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, indexBuf);
    var aIndex = gl.getAttribLocation(prog, 'aIndex'); gl.enableVertexAttribArray(aIndex); gl.vertexAttribIPointer(aIndex, 1, gl.UNSIGNED_INT, 0, 0); gl.vertexAttribDivisor(aIndex, 1);
    tex = gl.createTexture();
    gl.disable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    return true;
  }

  /* g: { n, center, cov, rgba, split } where splats from `split` on are little-me. */
  function setData(g) {
    data = g;
    var rows = Math.max(1, Math.ceil(g.n / PER_ROW)), buf = new Float32Array(TEX_W * rows * 4);
    for (var i = 0; i < g.n; i++) {
      var o = i * 12;
      buf[o] = g.center[i * 3]; buf[o + 1] = g.center[i * 3 + 1]; buf[o + 2] = g.center[i * 3 + 2];
      buf[o + 3] = g.rgba[i * 4] + g.rgba[i * 4 + 1] * 256 + g.rgba[i * 4 + 2] * 65536;
      buf[o + 4] = g.cov[i * 6]; buf[o + 5] = g.cov[i * 6 + 1]; buf[o + 6] = g.cov[i * 6 + 2]; buf[o + 7] = g.rgba[i * 4 + 3] / 255;
      buf[o + 8] = g.cov[i * 6 + 3]; buf[o + 9] = g.cov[i * 6 + 4]; buf[o + 10] = g.cov[i * 6 + 5];
    }
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, TEX_W, rows, 0, gl.RGBA, gl.FLOAT, buf);
    order = new Uint32Array(g.n); depth = new Uint16Array(g.n); sortCenter = new Float32Array(g.center);
  }

  function sort() {
    var n = data.n, c = sortCenter, split = data.split == null ? n : data.split, i;
    // Little-me's splats move with little-me.
    var ch = Math.cos(avHeading), sh = Math.sin(avHeading), src = data.center;
    for (i = split; i < n; i++) {
      var x = src[i * 3], z = src[i * 3 + 2];
      c[i * 3] = ch * x + sh * z + avPos[0]; c[i * 3 + 1] = src[i * 3 + 1] + avPos[1]; c[i * 3 + 2] = -sh * x + ch * z + avPos[2];
    }
    var a = view[2], b = view[6], e = view[10], min = Infinity, max = -Infinity, zs = sort.z && sort.z.length === n ? sort.z : (sort.z = new Float32Array(n));
    for (i = 0; i < n; i++) { var zc = a * c[i * 3] + b * c[i * 3 + 1] + e * c[i * 3 + 2]; zs[i] = zc; if (zc < min) min = zc; if (zc > max) max = zc; }
    var k = 65535 / ((max - min) || 1);
    counts.fill(0);
    for (i = 0; i < n; i++) { var key = ((zs[i] - min) * k) | 0; depth[i] = key; counts[key]++; }      // far splats have the smallest key
    var run = 0; for (i = 0; i < 65536; i++) { starts[i] = run; run += counts[i]; }
    for (i = 0; i < n; i++) order[starts[depth[i]]++] = i;
  }

  function draw() {
    if (!data || !gl) return;
    var w = canvas.width, h = canvas.height;
    sort();
    gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog); gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, indexBuf); gl.bufferData(gl.ARRAY_BUFFER, order, gl.DYNAMIC_DRAW);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(loc.uData, 0);
    gl.uniformMatrix4fv(loc.uView, false, view); gl.uniformMatrix4fv(loc.uProj, false, proj);
    gl.uniform2f(loc.uFocal, proj[0] * w / 2, proj[5] * h / 2); gl.uniform2f(loc.uViewport, w, h);
    gl.uniform1i(loc.uAvStart, data.split == null ? data.n : data.split);
    var ch = Math.cos(avHeading), sh = Math.sin(avHeading);
    gl.uniformMatrix3fv(loc.uAvRot, false, new Float32Array([ch, 0, -sh, 0, 1, 0, sh, 0, ch]));
    gl.uniform3f(loc.uAvPos, avPos[0], avPos[1], avPos[2]); gl.uniform1f(loc.uSize, size);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, data.n);
  }

  /* ---------- camera maths ---------- */
  function perspective(fovY, aspect, near, far) {
    var f = 1 / Math.tan(fovY / 2); proj.fill(0);
    proj[0] = f / aspect; proj[5] = f; proj[10] = (far + near) / (near - far); proj[11] = -1; proj[14] = 2 * far * near / (near - far);
  }
  function lookAt(eye, target) {
    var zx = eye[0] - target[0], zy = eye[1] - target[1], zz = eye[2] - target[2], zl = Math.hypot(zx, zy, zz) || 1; zx /= zl; zy /= zl; zz /= zl;
    var xx = zz, xy = 0, xz = -zx, xl = Math.hypot(xx, xz); if (xl < 1e-5) { xx = 1; xz = 0; xl = 1; } xx /= xl; xz /= xl;     // x = up × z, with up = +y
    var yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    view[0] = xx; view[1] = yx; view[2] = zx; view[3] = 0; view[4] = xy; view[5] = yy; view[6] = zy; view[7] = 0; view[8] = xz; view[9] = yz; view[10] = zz; view[11] = 0;
    view[12] = -(xx * eye[0] + xy * eye[1] + xz * eye[2]); view[13] = -(yx * eye[0] + yy * eye[1] + yz * eye[2]); view[14] = -(zx * eye[0] + zy * eye[1] + zz * eye[2]); view[15] = 1;
  }
  /* A point in the world -> a point on the canvas in CSS pixels (null when behind the eye). */
  function toScreen(p, cssW, cssH) {
    var x = view[0] * p[0] + view[4] * p[1] + view[8] * p[2] + view[12], y = view[1] * p[0] + view[5] * p[1] + view[9] * p[2] + view[13], z = view[2] * p[0] + view[6] * p[1] + view[10] * p[2] + view[14];
    if (z > -0.3) return null;
    return { x: (proj[0] * x / -z + 1) / 2 * cssW, y: (1 - proj[5] * y / -z) / 2 * cssH, d: -z };
  }
  /* The ray under a canvas point, as an eye position and a direction. */
  function ray(px, py, cssW, cssH, eye) {
    var nx = (px / cssW * 2 - 1) / proj[0], ny = (1 - py / cssH * 2) / proj[5];
    var dx = view[0] * nx + view[1] * ny - view[2], dy = view[4] * nx + view[5] * ny - view[6], dz = view[8] * nx + view[9] * ny - view[10], l = Math.hypot(dx, dy, dz);
    return { o: eye, d: [dx / l, dy / l, dz / l] };
  }

  MP.Splat = {
    init: init, setData: setData, draw: draw, perspective: perspective, lookAt: lookAt, toScreen: toScreen, ray: ray,
    setAvatar: function (p, heading) { avPos = p; avHeading = heading; },
    setSize: function (s) { size = s; },
    count: function () { return data ? data.n : 0; },
    pixel: function (x, y) { var b = new Uint8Array(4); gl.readPixels(x, canvas.height - y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, b); return Array.prototype.slice.call(b); }
  };
})();
