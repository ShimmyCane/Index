/* Generate Clouds — the sky shader.
   One fragment shader draws the whole picture for one pixel:
   1. the ground: land from a height map, or sea with waves,
   2. the air (Rayleigh + haze + ozone, single scattering),
   3. weather under the clouds: rain or snow, a funnel or microburst, lightning,
   4. two cloud volumes (low and mid) marched through spherical shells, and a thin high layer,
   5. sun disc, stars, tone mapping.
   Units are kilometres. The planet centre is the origin for the air and the clouds;
   the ground works in km from the camera's own column, which keeps metres exact. */
(function () {
  'use strict';
  var GC = window.GC = window.GC || {};

  GC.VERT = [
    'varying vec2 vUv;',
    'void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }'
  ].join('\n');

  GC.FRAG = `precision highp float;
varying vec2 vUv;
uniform sampler2D uNoise;
uniform sampler2D uTerrain;      // red = height km, green = land (1) or sea (0), smoothed
uniform sampler2D uRegion;       // 5 x 5 cloud cover around the place: red low, green mid, blue high
uniform int uProj;               // 0 = camera view, 1 = 360 panorama (equirectangular)
uniform vec4 uTile;              // offset.xy, scale.zw of this tile inside the full picture
uniform vec3 uCamR; uniform vec3 uCamU; uniform vec3 uCamF;
uniform float uTanFov; uniform float uAspect; uniform float uAlt;
uniform vec2 uCamXZ;             // camera, km east and south of the chosen place
uniform vec3 uSunDir; uniform float uSunI;
uniform vec3 uSun0; uniform vec3 uSun1; uniform vec3 uSunC;      // sunlight reaching each layer
uniform vec3 uAmbTop; uniform vec3 uAmbBot;
uniform vec3 uSkyZen; uniform vec3 uSkyHor;                      // sky colours for water reflections
uniform float uHaze; uniform vec3 uHazeTint; uniform vec3 uFogK;
uniform vec4 uL0a; uniform vec4 uL0b; uniform vec4 uL0w;         // low layer
uniform vec4 uL1a; uniform vec4 uL1b; uniform vec4 uL1w;         // mid layer
uniform vec4 uC; uniform vec4 uCw;                               // high layer
uniform vec3 uSeed; uniform float uEvolve;
uniform float uExposure; uniform float uNight; uniform float uRain;
uniform float uFlash; uniform vec2 uFlashPos; uniform float uGain; uniform float uBoltSeed;
uniform float uPix; uniform float uFar; uniform float uFineK;    // size of one pixel (radians); how far clouds are drawn (km)
uniform int uSteps; uniform int uLSteps; uniform float uMS;
uniform vec4 uTerr;              // half-width of the terrain map km, highest point km, snow line km, dryness 0..1
uniform vec2 uCity;              // how built-up the place is 0..1, (unused)
uniform int uTSteps; uniform float uTGrow;                       // terrain: steps, growth of the step with distance
uniform vec4 uSea;               // wave height km, clock s, wind heading (radians), wind m/s
uniform vec4 uReg;               // weight of the regional data, half-width km, far-away variety, (unused)
uniform vec2 uVar;               // low layer: share of tall cells, short / tall height
uniform float uCmix;             // high layer: share of rippled patches
uniform vec4 uPrecip;            // 0 none 1 rain 2 snow 3 sleet, strength 0..1, share of sky raining, slant
uniform vec4 uFeat;              // x, z km from the camera, 0 none 1 funnel 2 microburst, strength
uniform vec4 uFeatB;             // cloud base km, seed, ground km, over water 0/1
uniform sampler2D uTerrainF;     // the same kind of map, finer, around the place (about 11 km across)
uniform sampler2D uWorld;        // the whole Earth, 2048 x 1024 (NASA Blue Marble)
uniform sampler2D uRegion2;      // 9 x 9 cloud cover, 250 km apart
uniform vec4 uFine;              // half-width of the fine map km (0 = none), relief exaggeration
uniform vec4 uReg2;              // weight, half-width km
uniform vec4 uSea2;              // wave frequency rad/m (0 = from the wind), tide km
uniform vec3 uWorldP;            // camera column: latitude, longitude (radians), world map ready 0 or 1
uniform sampler2D uStars;        // the bright stars now: north at the left and right edges, zenith at the top, 2048 x 1024
uniform float uStarsOn;          // 1 when the star picture is loaded
uniform sampler2D uSat;          // cloud cover of the whole Earth from a satellite picture, 720 x 360, north at the top, red = cover
uniform float uSatW;             // how much the satellite cover counts: 0 near the ground, 1 from space
uniform sampler2D uOsm;          // ground colours from map tiles, on the fine map's grid (row 0 = north)
uniform float uOsmOn;            // 1 when the map colours are loaded

const float PI = 3.14159265;
const float RE = 6371.0;
const float RA = 6471.0;
const vec3 BR = vec3(5.802e-3, 13.558e-3, 33.1e-3);
const vec3 BO = vec3(0.650e-3, 1.881e-3, 0.085e-3);
const float BM = 3.996e-3;
float gHn; float gT; float gLay; float gMask; float gRaw;

float hash12(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float hash13(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }

// 3-D value noise from one 2-D texture: the red channel is the green one shifted by (37,17).
float noise(vec3 x) {
  x = mod(x, 256.0);                 // the texture repeats every 256, and small numbers keep fine detail exact
  vec3 p = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  vec2 uv = (p.xy + vec2(37.0, 17.0) * p.z) + f.xy;
  vec2 rg = texture2D(uNoise, (uv + 0.5) / 256.0).yx;
  return mix(rg.x, rg.y, f.z);
}
float fbm4(vec3 q) {
  float s = 0.5 * noise(q); q = q * 2.02 + 7.1;
  s += 0.25 * noise(q); q = q * 2.03 + 3.3;
  s += 0.125 * noise(q); q = q * 2.01 + 5.7;
  s += 0.0625 * noise(q);
  return s / 0.9375;
}
float fbm2(vec3 q) { float s = 0.5 * noise(q); q = q * 2.02 + 7.1; s += 0.25 * noise(q); return s / 0.75; }

vec2 sph(vec3 ro, vec3 rd, float r) {
  float b = dot(ro, rd); float c = dot(ro, ro) - r * r; float h = b * b - c;
  if (h < 0.0) return vec2(1.0e9, -1.0e9);
  h = sqrt(h); return vec2(-b - h, -b + h);
}

// ---------- the air ----------
vec3 airDens(float h) { return vec3(exp(-max(h, 0.0) / 8.0), exp(-max(h, 0.0) / 1.2), max(0.0, 1.0 - abs(h - 25.0) / 15.0)); }
vec3 airExt(vec3 od) { return BR * od.x + vec3(BM * uHaze * 1.15) * od.y + BO * od.z; }
float planetShadow(vec3 p) {
  float b = dot(p, uSunDir); if (b > 0.0) return 1.0;
  float d = sqrt(max(dot(p, p) - b * b, 0.0));
  return smoothstep(RE - 3.0, RE + 9.0, d);
}
vec3 sunOD(vec3 p) {
  vec2 ta = sph(p, uSunDir, RA); float dt = ta.y / 6.0; vec3 od = vec3(0.0);
  for (int i = 0; i < 6; i++) { vec3 q = p + uSunDir * ((float(i) + 0.5) * dt); od += airDens(length(q) - RE) * dt; }
  return od;
}

// The air between the camera and tHit (or to the top of the air when tHit < 0).
vec3 sky(vec3 ro, vec3 rd, out vec3 trans, float tHit) {
  vec2 ta = sph(ro, rd, RA);
  float t0 = max(ta.x, 0.0); float t1 = ta.y;
  if (tHit > 0.0) t1 = min(t1, tHit);
  trans = vec3(1.0);
  if (t1 <= t0) return vec3(0.0);
  float mu = dot(rd, uSunDir);
  float pR = 3.0 / (16.0 * PI) * (1.0 + mu * mu);
  float g = 0.76;
  float pM = 3.0 / (8.0 * PI) * ((1.0 - g * g) * (1.0 + mu * mu)) / ((2.0 + g * g) * pow(1.0 + g * g - 2.0 * g * mu, 1.5));
  vec3 od = vec3(0.0); vec3 sumR = vec3(0.0); vec3 sumM = vec3(0.0); vec3 sumS = vec3(0.0); float prev = 0.0;
  for (int i = 0; i < 16; i++) {
    float f = (float(i) + 1.0) / 16.0; float tn = f * f * (t1 - t0); float dt = tn - prev;
    vec3 p = ro + rd * (t0 + prev + dt * 0.5); prev = tn;
    vec3 d = airDens(length(p) - RE) * dt;
    vec3 T = exp(-airExt(od + 0.5 * d + sunOD(p))) * planetShadow(p);
    sumR += T * d.x; sumM += T * d.y; sumS += exp(-airExt(od + 0.5 * d)) * d.x; od += d;
  }
  trans = exp(-airExt(od));
  // second-order light: a soft blue fill that keeps the zenith blue at twilight
  return uSunI * (sumR * BR * pR + sumM * BM * uHaze * pM * uHazeTint + sumS * BR * vec3(0.55, 0.8, 1.0) * uMS / (4.0 * PI));
}

float satCover(vec2 xz);                       // defined with the world lookups below

// ---------- cloud volumes ----------
// A = base km, top km, cover 0..1, density per km
// B = cell size km, soft bottom, top taper, anvil
// W = wind offset x, wind offset z, (unused), detail erosion
float cloudD(vec3 p, vec4 A, vec4 B, vec4 W, int cheap) {
  float h = length(p) - RE;
  float hn = (h - A.x) / (A.y - A.x); gHn = hn;
  if (hn < 0.0 || hn > 1.0) return 0.0;
  vec3 q = vec3(p.x - W.x, h + uEvolve * B.x, p.z - W.y) / B.x + uSeed;
  vec2 w = p.xz + uCamXZ;                       // km from the chosen place
  // A mixed sky: some cells of the low layer are tall, the rest stop lower.
  float lt = 1.0;
  if (gLay < 0.5 && uVar.x > 0.0) {
    float tw = noise(vec3(q.x * 0.19 + 5.0, uSeed.z, q.z * 0.19));
    lt = mix(uVar.y, 1.0, smoothstep(1.0 - uVar.x - 0.07, 1.0 - uVar.x + 0.07, tw));
    hn /= lt; gHn = hn;
    if (hn > 1.0) return 0.0;
  }
  // Cover changes across the region (weather data around the place), and with distance beyond it.
  float az = A.z;
  if (uReg2.x > 0.0) {                         // the wide data (2000 km, 250 km apart); beyond it, back to the place's own cover
    vec4 rg2 = texture2D(uRegion2, w / (2.0 * uReg2.y) + 0.5);
    az = mix(az, pow(gLay < 0.5 ? rg2.r : rg2.g, 0.85), uReg2.x * (1.0 - smoothstep(uReg2.y * 0.8, uReg2.y * 1.7, max(abs(w.x), abs(w.y)))));
  }
  if (uReg.x > 0.0) {                          // the close data covers 500 km; beyond it, fade back
    vec4 rg = texture2D(uRegion, w / (2.0 * uReg.y) + 0.5);
    az = mix(az, pow(gLay < 0.5 ? rg.r : rg.g, 0.85), uReg.x * (1.0 - smoothstep(uReg.y * 0.8, uReg.y * 1.7, max(abs(w.x), abs(w.y)))));
  }
  if (uReg.z > 0.0) az = clamp(az * mix(1.0, 0.15 + 1.9 * noise(vec3(w * 0.0023 + uSeed.xy, uSeed.z)), uReg.z * smoothstep(60.0, 420.0, length(w))), 0.0, 1.0);
  if (uSatW > 0.0) az = mix(az, pow(satCover(p.xz), 0.85), uSatW);      // from space, the satellite picture sets the cover
  if (uFeat.z > 0.5 && gLay < 0.5) { vec2 fd = p.xz - uFeat.xy; az = max(az, 0.95 * smoothstep(64.0, 9.0, dot(fd, fd))); }   // a storm stands over a funnel
  float wxm = noise(vec3(q.x * 0.11, uEvolve * 0.25 + uSeed.z, q.z * 0.11));
  float cov = mix(az * mix(0.45, 1.55, wxm), 1.0, smoothstep(0.82, 1.0, az));
  cov = clamp(cov * (1.0 - B.z * hn) + B.w * cov * smoothstep(0.55, 0.9, hn), 0.0, 1.0);
  float prof = smoothstep(0.0, B.y, hn) * smoothstep(1.0, 0.82, hn);
  float n = (cheap == 1) ? fbm2(q) : fbm4(q);
  float thr = mix(0.80, 0.30, cov);
  float d = clamp((n - thr) * 5.0, 0.0, 1.0) * prof * (0.45 + 1.1 * n);
  if (cheap == 0 && d > 0.0) {
    float e = abs(2.0 * fbm2(q * 4.3 + vec3(0.0, uEvolve * 3.0, 0.0)) - 1.0);
    d = clamp(d - W.w * (1.0 - e) * (1.0 - d) * 0.55, 0.0, 1.0);
    // Close-up detail: finer and finer erosion, added only when one pixel is small enough to show it.
    float fp = gT * uPix / B.x;
    float w1 = 1.0 - smoothstep(0.3, 1.2, fp * 13.0);
    if (w1 > 0.0 && d > 0.0) {
      vec3 qw = q + (vec3(noise(q * 3.1 + 3.0), noise(q * 3.1 + 17.0), noise(q * 3.1 + 31.0)) - 0.5) * 0.24;   // bend the detail into wisps
      d -= W.w * w1 * 0.55 * smoothstep(0.32, 0.68, noise(qw * 13.0 + vec3(0.0, uEvolve * 6.0, 0.0))) * (1.0 - d * 0.7);
      float w2 = 1.0 - smoothstep(0.3, 1.2, fp * 41.0);
      if (w2 > 0.0) {
        d -= W.w * w2 * 0.40 * smoothstep(0.32, 0.68, noise(qw * 41.0)) * (1.0 - d * 0.7);
        float w3 = 1.0 - smoothstep(0.3, 1.2, fp * 127.0);
        if (w3 > 0.0) d -= W.w * w3 * 0.28 * smoothstep(0.32, 0.68, noise(qw * 127.0)) * (1.0 - d * 0.7);
      }
      d = clamp(d, 0.0, 1.0);
    }
  }
  if (cheap == 0) {                              // far away a pixel is wider than a cell: use bigger and bigger cloud shapes, then the average
    float fp = gT * uPix / B.x;
    if (fp > 0.35) {
      float l1 = smoothstep(0.35, 1.5, fp); float l2 = smoothstep(2.5, 9.0, fp); float l3 = smoothstep(14.0, 40.0, fp);
      float nA = fbm2(q * 0.2 + 40.0);                                   // cells five times wider
      float nB = 0.6 * noise(q * 0.04 + 80.0) + 0.4 * noise(q * 0.08 + 12.0);   // systems tens of km wide
      float dA = clamp((nA - thr) * 5.0, 0.0, 1.0) * prof * (0.45 + 1.1 * nA);
      float dB = clamp((nB - thr) * 5.0, 0.0, 1.0) * prof * (0.45 + 1.1 * nB);
      float tau = -log(max(1.0 - 0.85 * cov, 0.05));                      // the average transparency of this cover, spread evenly through the layer
      float dC = tau / (A.w * (A.y - A.x) * 0.6) * prof;
      d = mix(d, dA, l1); d = mix(d, dB, l2); d = mix(d, dC, l3);
    }
  }
  return d * mix(1.0, 1.0 / lt, 0.6);            // short cells are denser, so they stay solid
}
float hg(float mu, float g) { float g2 = g * g; return (1.0 - g2) / (4.0 * PI * pow(1.0 + g2 - 2.0 * g * mu, 1.5)); }

// The first stretch of the ray that lies inside the shell [base, top].
vec2 shellSpan(vec3 ro, vec3 rd, float base, float top, float tMax) {
  float r = length(ro); vec2 o = sph(ro, rd, RE + top); vec2 n = sph(ro, rd, RE + base);
  bool hitN = n.y > n.x && n.x > 0.0;
  float t0; float t1;
  if (r < RE + base) { t0 = n.y; t1 = o.y; }
  else if (r <= RE + top) { t0 = 0.0; t1 = hitN ? n.x : o.y; }
  else { if (!(o.y > o.x) || o.x < 0.0) return vec2(1.0e9, -1.0e9); t0 = o.x; t1 = hitN ? n.x : o.y; }
  t1 = min(min(t1, tMax), uFar);
  if (t1 <= t0) return vec2(1.0e9, -1.0e9);
  return vec2(t0, t1);
}

vec4 marchVol(vec3 ro, vec3 rd, vec2 span, vec4 A, vec4 B, vec4 W, vec3 sunC, vec3 bg, float jit, float lay) {
  gLay = lay;
  float thick = A.y - A.x; float mu = dot(rd, uSunDir);
  float ph = mix(hg(mu, 0.75), hg(mu, -0.25), 0.3) * 4.0 * PI;
  float dtBase = thick / float(uSteps) * 2.5;
  float dtCap = max((span.y - span.x) / float(uSteps) * 4.0, dtBase * 0.25);
  float t = span.x + min(max(dtBase, span.x * 0.014 * (uFineK < 0.25 ? 0.4 : 1.0)), dtCap) * jit; float T = 1.0; vec3 L = vec3(0.0);
  // Long steps through clear air; on touching cloud, step back and cross it in short steps.
  int fineLeft = 0; int fineN = int(1.0 / uFineK) + 1;
  for (int i = 0; i < 320; i++) {
    if (i >= uSteps || t > span.y || T < 0.02) break;
    float dtC = min(max(dtBase, t * 0.014 * (uFineK < 0.25 ? 0.4 : 1.0)), dtCap);
    float dt = fineLeft > 0 ? dtC * uFineK : dtC;
    vec3 p = ro + rd * t;
    gT = t;
    float d = cloudD(p, A, B, W, 0) * (1.0 - smoothstep(0.65 * uFar, 0.96 * uFar, t));
    float hn = clamp(gHn, 0.0, 1.0);
    if (fineLeft == 0 && d > 0.002 && uFineK < 0.99) { fineLeft = fineN; t = max(t - dtC * (1.0 - uFineK * jit), span.x); continue; }
    if (fineLeft > 0) { if (d > 0.002) fineLeft = fineN; else fineLeft -= 1; }
    if (d > 0.002) {
      float od = 0.0; float ls = thick * 0.07; vec3 lp = p;
      for (int j = 0; j < 8; j++) { if (j >= uLSteps) break; lp += uSunDir * ls; od += cloudD(lp, A, B, W, 1) * ls; ls *= 1.7; }
      od *= A.w;
      float beer = exp(-od); float soft = exp(-od * 0.22) * 0.55;
      vec3 S = sunC * (beer * ph + soft) * uGain;
      S += mix(uAmbBot, uAmbTop, hn) * (0.45 + 0.55 * hn);
      S *= mix(1.0, 0.55 + 0.45 * hn, uRain);
      vec2 fd = p.xz - uFlashPos; S += uFlash * vec3(0.75, 0.85, 1.0) * exp(-dot(fd, fd) / 30.0) * 0.2 / max(uExposure, 0.3);
      vec3 fog = exp(-t * uFogK);
      S = S * fog + bg * (1.0 - fog);
      float sT = exp(-d * A.w * dt);
      L += T * (1.0 - sT) * S; T *= sT;
    }
    t += dt;
  }
  return vec4(L, T);
}


// ---------- thin high layer ----------
vec4 cirrus(vec3 ro, vec3 rd, float t, vec3 bg) {
  vec3 p = ro + rd * t; vec2 u0 = p.xz - uCw.xy; vec2 w = p.xz + uCamXZ;
  float cs = cos(uCw.w); float sn = sin(uCw.w);
  vec2 u = vec2(cs * u0.x + sn * u0.y, -sn * u0.x + cs * u0.y) / uCw.z;
  u.x *= uC.z;
  vec3 q = vec3(u, uEvolve * 0.6) + uSeed.zxy;
  float warp = noise(q * 0.5 + 11.0);
  float n = fbm4(q + vec3(warp * 1.6, warp * 0.4, 0.0));
  // A mixed sky: patches of small ripples among the streaks.
  if (uCmix > 0.0) {
    float pm = smoothstep(0.52, 0.68, noise(vec3(u0 * 0.035, uSeed.y))) * uCmix;
    if (pm > 0.0) n = mix(n, 0.35 + 0.5 * fbm2(vec3(u0 * 0.9, uEvolve) + uSeed), pm);
  }
  float cover = uC.y;
  if (uReg2.x > 0.0) cover = mix(cover, texture2D(uRegion2, w / (2.0 * uReg2.y) + 0.5).b, uReg2.x * (1.0 - smoothstep(uReg2.y * 0.8, uReg2.y * 1.7, max(abs(w.x), abs(w.y)))));
  if (uReg.x > 0.0) cover = mix(cover, texture2D(uRegion, w / (2.0 * uReg.y) + 0.5).b, uReg.x * (1.0 - smoothstep(uReg.y * 0.8, uReg.y * 1.7, max(abs(w.x), abs(w.y)))));
  if (uReg.z > 0.0) cover = clamp(cover * mix(1.0, 0.15 + 1.9 * noise(vec3(w * 0.0019 + uSeed.yx, 4.0)), uReg.z * smoothstep(60.0, 420.0, length(w))), 0.0, 1.0);
  if (uSatW > 0.0) cover = mix(cover, satCover(p.xz), uSatW);
  float thr = mix(0.78, 0.28, cover);
  float a = smoothstep(thr, thr + 0.32, n) * uC.w;
  float wf = 1.0 - smoothstep(0.02, 0.2, t * uPix / uCw.z);
  if (wf > 0.0) a *= 1.0 - wf * 0.55 * abs(2.0 * fbm2(q * 9.0 + warp) - 1.0) * (1.0 - a * 0.5);
  a *= 1.0 - smoothstep(0.7 * uFar, 1.6 * uFar, t);
  float mu = dot(rd, uSunDir);
  vec3 S = uSunC * (0.22 + hg(mu, 0.6) * 5.0) * uGain + uAmbTop * 0.7;
  vec3 fog = exp(-t * uFogK * 0.35);
  S = S * fog + bg * (1.0 - fog);
  return vec4(S * a, 1.0 - a);
}

// the bright stars from the star picture (see js/stars.js): the ray's azimuth across, its altitude up
vec3 starMap(vec3 rd) {
  float az = atan(rd.x, -rd.z); float alt = asin(clamp(rd.y, -1.0, 1.0));
  return texture2D(uStars, vec2(fract(az / (2.0 * PI) + 1.0), alt / PI + 0.5)).rgb;
}
vec3 stars(vec3 rd) {
  vec3 d = rd * 190.0; vec3 c = floor(d); float h = hash13(c);
  if (h < 0.9975) return vec3(0.0);
  vec3 f = fract(d) - 0.5; float b = (h - 0.9975) / 0.0025;
  return vec3(1.0, 0.95, 0.85 + 0.15 * b) * b * smoothstep(0.45, 0.05, length(f));
}


// ---------- the ground: land from a height map, sea with waves ----------
// Positions here are km from the camera's own column: x east, y up from sea level, z south.
float hsOf(vec3 pl) { return pl.y + (pl.x * pl.x + pl.z * pl.z) / (2.0 * RE); }       // height above the round sea
vec3 toPlanet(vec2 xz, float hs) { return vec3(xz.x, sqrt(max((RE + hs) * (RE + hs) - dot(xz, xz), 0.0)), xz.y); }
// ---- the whole Earth, for the ground far from the place and for the view from space ----
vec2 worldLL(vec2 xz) {                                           // longitude, latitude of a ground point (km from the camera's column)
  float y = sqrt(max(RE * RE - dot(xz, xz), 1.0)); vec3 u = normalize(vec3(xz.x, y, xz.y));
  float sp = sin(uWorldP.x); float cp = cos(uWorldP.x); float sl = sin(uWorldP.y); float cl = cos(uWorldP.y);
  vec3 east = vec3(-sl, cl, 0.0); vec3 north = vec3(-sp * cl, -sp * sl, cp); vec3 up = vec3(cp * cl, cp * sl, sp);
  vec3 wv = u.x * east + u.y * up - u.z * north;                  // local z points south
  return vec2(atan(wv.y, wv.x), asin(clamp(wv.z, -1.0, 1.0)));
}
vec3 worldTex(vec2 xz) { vec2 ll = worldLL(xz); return texture2D(uWorld, vec2(ll.x / (2.0 * PI) + 0.5, ll.y / PI + 0.5)).rgb; }
float satCover(vec2 xz) { vec2 ll = worldLL(xz); return texture2D(uSat, vec2(ll.x / (2.0 * PI) + 0.5, ll.y / PI + 0.5)).r; }   // satellite cloud cover under a point
float worldWater(vec2 xz) {                                       // 1 for ocean and lakes in the picture, 0 for land and ice
  vec3 c = worldTex(xz);
  return smoothstep(0.0, 0.07, c.b - max(c.r, c.g * 0.9)) * (1.0 - smoothstep(0.55, 0.8, min(c.r, min(c.g, c.b))));
}
// Ground texture at a point: x = height km above the sea, y = land (1) or water (0). Coarse map, fine map near the place, the world beyond.
vec2 groundTex(vec2 xz) {
  vec2 w = xz + uCamXZ; vec4 tx = texture2D(uTerrain, w / (2.0 * uTerr.x) + 0.5);
  float edge = max(abs(w.x), abs(w.y));
  if (uFine.x > 0.0) {
    float wf = 1.0 - smoothstep(0.7 * uFine.x, uFine.x, edge);
    if (wf > 0.0) { vec4 tf = texture2D(uTerrainF, w / (2.0 * uFine.x) + 0.5); tx.r = mix(tx.r, tf.r, wf); tx.g = mix(tx.g, tf.g, wf); }
  }
  if (uWorldP.z > 0.5) {
    float far = smoothstep(0.85 * uTerr.x, uTerr.x * 1.02, edge);
    if (far > 0.0) { tx.g = mix(tx.g, 1.0 - worldWater(xz), far); tx.r *= 1.0 - far; }
  }
  return tx.rg;
}
float terrainH(vec2 xz) {
  vec2 w = xz + uCamXZ; vec2 g = groundTex(xz);
  gMask = g.y; gRaw = g.x;
  float m = smoothstep(0.5, 0.64, g.y);
  if (m <= 0.0) return 0.0;
  float A = 0.02 + 0.2 * g.x;                                     // rougher where it is higher
  float dn = fbm2(vec3(w * 0.33, 3.7)) - 0.5 + 0.3 * (noise(vec3(w * 1.7, 9.1)) - 0.5);
  return (max(g.x * uFine.y + A * dn, 0.004) - uSea2.y) * m;
}
float seaOct(vec2 uv, float ch) {
  uv += noise(vec3(uv, 0.0)) * 2.0 - 1.0;
  vec2 wv = 1.0 - abs(sin(uv)); vec2 sw = abs(cos(uv)); wv = mix(wv, sw, wv);
  return pow(1.0 - pow(wv.x * wv.y, 0.65), ch);
}
// Wave height 0..1 at a point (metres from the chosen place). More octaves give finer chop.
float waveH(vec2 m, int it) {
  float c = cos(uSea.z); float s = sin(uSea.z);
  vec2 uv = vec2(c * m.x + s * m.y, -s * m.x + c * m.y); uv.x *= 0.75;
  float freq = uSea2.x > 0.0 ? uSea2.x : 0.05 / (1.0 + uSea.w * 0.1); float amp = 0.6; float ch = 4.0; float T = uSea.y * 5.0; float h = 0.0;
  for (int i = 0; i < 5; i++) {
    if (i >= it) break;
    float d = seaOct((uv + T) * freq, ch) + seaOct((uv - T) * freq, ch);
    h += d * amp;
    uv = mat2(1.6, 1.2, -1.2, 1.6) * uv; freq *= 1.9; amp *= 0.22; ch = mix(ch, 1.0, 0.2);
  }
  return h;
}
float seaH(vec2 xz, int it) {                                     // km; waves flatten toward the shore
  float m = groundTex(xz).y;
  return (waveH((xz + uCamXZ) * 1000.0, it) - 0.55) * uSea.x * clamp(1.0 - m * 1.5, 0.35, 1.0);
}
// Where the ray meets the ground. Returns the distance (or -1) and whether it is water.
float groundTrace(vec3 rd, float jit, out float isSea) {
  isSea = 0.0;
  float ga = uAlt - uSea2.y;                                     // the sea sits at the tide; the ground works in a frame where it is at 0
  float Hm = uTerr.y + 0.02 - uSea2.y;
  float dH = rd.y * rd.y + 2.0 * (Hm - ga) / RE;
  float tS = 0.0;
  if (ga > Hm) { if (rd.y >= 0.0 || dH < 0.0) return -1.0; tS = 2.0 * (ga - Hm) / (-rd.y + sqrt(dH)); }
  float d0 = rd.y * rd.y - 2.0 * ga / RE;
  float tSea = (rd.y < 0.0 && d0 >= 0.0) ? 2.0 * ga / (-rd.y + sqrt(d0)) : -1.0;
  float tEnd = tSea > 0.0 ? tSea : RE * (-rd.y + sqrt(max(dH, 0.0)));
  tEnd = min(tEnd, tS + 420.0);
  if (uTerr.y > 0.006 && uAlt < 40.0) {                           // from very high up the relief is flat to the eye: go straight to the sea level hit
    float t = tS + 0.03 * jit; float prev = tS;
    for (int i = 0; i < 200; i++) {
      if (i >= uTSteps || t > tEnd) break;
      vec3 pl = vec3(rd.x * t, ga + rd.y * t, rd.z * t);
      float f = hsOf(pl) - terrainH(pl.xz);
      if (f < 0.0) {
        float a = prev; float b = t;
        for (int k = 0; k < 6; k++) { float m = 0.5 * (a + b); vec3 pm = vec3(rd.x * m, ga + rd.y * m, rd.z * m); if (hsOf(pm) - terrainH(pm.xz) < 0.0) b = m; else a = m; }
        return 0.5 * (a + b);
      }
      prev = t; t += max(max(0.03, 0.45 * f), uTGrow * t);
    }
  }
  if (tSea < 0.0) return -1.0;
  vec3 ps = vec3(rd.x * tSea, 0.0, rd.z * tSea); terrainH(ps.xz);
  isSea = gMask < 0.5 ? 1.0 : 0.0;
  return tSea;
}
float cloudShadow(vec3 pl) {
  if (uL0a.z < 0.003 || uSunDir.y < 0.03) return 1.0;
  float hm = mix(uL0a.x, uL0a.y, 0.3); float k = (hm - pl.y) / uSunDir.y;
  if (k < 0.0) return 1.0;
  vec3 q = pl + uSunDir * k; gLay = 0.0;
  float d = cloudD(toPlanet(q.xz, hm), uL0a, uL0b, uL0w, 1);
  return mix(1.0, exp(-d * uL0a.w * (uL0a.y - uL0a.x) * 0.3), 0.85);
}
vec3 landColor(vec3 pl, float t) {
  float e = max(0.02, t * 0.004);
  float h = terrainH(pl.xz); float mask = gMask;
  vec3 n = normalize(vec3(terrainH(pl.xz - vec2(e, 0.0)) - terrainH(pl.xz + vec2(e, 0.0)), 2.0 * e, terrainH(pl.xz - vec2(0.0, e)) - terrainH(pl.xz + vec2(0.0, e))));
  float slope = 1.0 - n.y; vec2 w = pl.xz + uCamXZ;
  float v = noise(vec3(w * 0.8, 1.3)); float v2 = noise(vec3(w * 7.0, 4.4));
  vec3 c = mix(vec3(0.10, 0.17, 0.05), vec3(0.22, 0.24, 0.09), v);                               // grass
  c = mix(c, vec3(0.04, 0.09, 0.035), smoothstep(0.45, 0.7, noise(vec3(w * 0.25, 7.0))) * (1.0 - uTerr.w));   // woods
  c = mix(c, vec3(0.32, 0.26, 0.16), uTerr.w * (0.6 + 0.4 * v));                                 // dry ground
  c = mix(c, mix(vec3(0.22, 0.21, 0.20), vec3(0.34, 0.31, 0.27), v2), smoothstep(0.16, 0.42, slope + (h - (uTerr.z - 1.5)) * 0.15));   // rock
  c = mix(c, vec3(0.82, 0.85, 0.90), smoothstep(-0.25, 0.25, h - uTerr.z + (v - 0.5) * 0.5) * (1.0 - smoothstep(0.45, 0.7, slope)));    // snow
  c = mix(c, vec3(0.62, 0.55, 0.38), (1.0 - smoothstep(0.008, 0.04, h)) * (1.0 - smoothstep(0.64, 0.86, mask)));                        // beach
  if (uOsmOn > 0.5 && uFine.x > 0.0) {                              // the map's own colours near the place (woods, grass, water, streets)
    float wf = 1.0 - smoothstep(0.7 * uFine.x, uFine.x, max(abs(w.x), abs(w.y)));
    if (wf > 0.0) c = mix(c, pow(texture2D(uOsm, w / (2.0 * uFine.x) + 0.5).rgb, vec3(2.2)) * 0.5, wf);
  }
  // a built-up patch around a city, with lights at night
  float urban = uCity.x * smoothstep(8.0, 2.5, length(w)) * smoothstep(0.6, 0.8, mask) * (1.0 - smoothstep(0.1, 0.3, slope));
  vec2 blk = floor(w * 9.0);
  c = mix(c, vec3(0.20, 0.20, 0.21) * (0.7 + 0.6 * hash12(blk)), urban * (0.55 + 0.35 * step(0.35, hash12(blk + 7.0))));
  c *= (0.72 + 0.56 * noise(vec3(w * 2.6, 2.0))) * (0.86 + 0.28 * noise(vec3(w * 31.0, 8.0)));      // fields and scrub, so the land is not one flat colour
  float sh = cloudShadow(pl);
  vec3 col = c * 1.2 * (uSun0 * max(dot(n, uSunDir), 0.0) * sh * 0.32 + uAmbTop * (0.55 + 0.45 * n.y));
  col += vec3(1.0, 0.72, 0.38) * 0.0035 * urban * uNight * step(0.82, hash12(floor(w * 46.0)));
  float outside = smoothstep(0.7 * uTerr.x, uTerr.x, max(abs(w.x), abs(w.y)));
  if (outside > 0.0 && uWorldP.z > 0.5) {                          // far from the place: the real Earth, lit by the sun
    vec3 wc = pow(worldTex(pl.xz), vec3(2.2)) * (0.86 + 0.28 * noise(vec3(w * 0.45, 5.0)));
    float yy = sqrt(max(RE * RE - dot(pl.xz, pl.xz), 1.0)); vec3 uu = normalize(vec3(pl.x, yy, pl.z));
    vec3 wl = wc * 1.2 * (uSun0 * max(dot(uu, uSunDir), 0.0) * sh * 0.32 + uAmbTop * 0.7);
    col = mix(col, wl, outside);
  }
  return col;
}
vec3 seaColor(vec3 pl, vec3 rd, float t) {
  float m = groundTex(pl.xz).y;
  vec3 n = vec3(0.0, 1.0, 0.0);
  float near = 1.0 - smoothstep(3.0, 40.0, t);
  if (near > 0.0 && uSea.x > 0.0) {
    float e = max(0.0002, t * 0.0012);
    vec3 nw = normalize(vec3(seaH(pl.xz - vec2(e, 0.0), 5) - seaH(pl.xz + vec2(e, 0.0), 5), 2.0 * e, seaH(pl.xz - vec2(0.0, e), 5) - seaH(pl.xz + vec2(0.0, e), 5)));
    n = normalize(mix(n, nw, near));
  }
  vec2 w = pl.xz + uCamXZ;
  float rough = clamp(0.08 + uSea.w * 0.03 + smoothstep(3.0, 60.0, t) * 0.35, 0.0, 1.0);        // far water averages many wave faces
  float fres = 0.02 + 0.98 * pow(1.0 - max(dot(n, -rd), 0.0), 5.0);
  fres = mix(fres, 0.35, smoothstep(10.0, 120.0, t) * 0.5);
  vec3 r = reflect(rd, n); r.y = abs(r.y);
  float over = clamp(max(uL0a.z, uL1a.z * 0.7), 0.0, 1.0);
  vec3 skyR = mix(uSkyHor, uSkyZen, pow(r.y, 0.45));
  skyR = mix(skyR, (uAmbTop + uAmbBot) * 0.7, over * 0.75);
  float sh = cloudShadow(pl);
  float up = max(uSunDir.y, 0.0);
  vec3 deep = mix(vec3(0.004, 0.035, 0.07), vec3(0.03, 0.13, 0.12), smoothstep(0.2, 0.5, m));  // turquoise in the shallows
  vec3 body = deep * (uSun0 * up * sh * 0.5 + uAmbTop * 1.2);
  vec3 col = mix(body, skyR, fres);
  float sp = pow(max(dot(r, uSunDir), 0.0), mix(900.0, 28.0, rough));
  col += uSun0 * sp * mix(9.0, 0.5, rough) * sh * step(0.0, uSunDir.y);
  // foam: breakers running in to the shore, and whitecaps in strong wind
  float surf = smoothstep(0.30, 0.47, m) * smoothstep(0.52, 0.47, m);
  float band = smoothstep(0.86, 0.99, sin(m * 190.0 - uSea.y * 0.9 + noise(vec3(w * 2.2, 0.0)) * 9.0) * 0.5 + 0.5);
  float foam = surf * band * (0.4 + 0.6 * noise(vec3(w * 40.0, uSea.y * 0.3)));
  foam += smoothstep(7.0, 16.0, uSea.w) * smoothstep(0.62, 0.8, noise(vec3(w * 25.0 + uSea.y * 0.02, uSea.y * 0.15))) * near * (1.0 - smoothstep(0.2, 0.45, m)) * 0.8;
  col = mix(col, vec3(0.85) * (uSun0 * up * sh * 0.3 + uAmbTop), clamp(foam, 0.0, 1.0));
  return col;
}

// ---------- weather under the clouds ----------
float rainCell(vec2 xz) {                                         // 0..1: is precipitation falling on this spot?
  if (uPrecip.z >= 0.99) return 1.0;
  vec2 q = (xz - uL0w.xy) / uL0b.x + uSeed.xz;
  float wxm = noise(vec3(q.x * 0.11, uEvolve * 0.25 + uSeed.z, q.y * 0.11));
  float thr = mix(0.78, 0.22, uPrecip.z);
  float c = smoothstep(thr - 0.02, thr + 0.1, wxm);
  if (uFeat.z > 1.5) { vec2 fd = xz - uFeat.xy; c = max(c, smoothstep(9.0, 2.0, dot(fd, fd))); }
  return c;
}
vec4 precipVeil(vec3 rd, float tMax, vec3 bg, float jit) {
  float base = uL0a.x + 0.12; float t0 = 0.0; float t1 = tMax;
  if (uAlt < base) { if (rd.y > 0.0) t1 = min(t1, (base - uAlt) / rd.y); }
  else { if (rd.y >= -0.001) return vec4(0.0, 0.0, 0.0, 1.0); t0 = (uAlt - base) / (-rd.y); }
  t1 = min(t1, t0 + 70.0);
  if (t1 <= t0) return vec4(0.0, 0.0, 0.0, 1.0);
  float dt = (t1 - t0) / 12.0; float od = 0.0; float tw = 0.0;
  vec2 wdir = vec2(cos(uSea.z), sin(uSea.z));
  for (int i = 0; i < 12; i++) {
    float t = t0 + (float(i) + jit) * dt;
    vec3 pl = vec3(rd.x * t, uAlt + rd.y * t, rd.z * t);
    float h = hsOf(pl);
    vec2 s = pl.xz - wdir * uPrecip.w * max(base - h, 0.0);       // the drop left the cloud upwind of here
    float c = rainCell(s);
    if (c > 0.0) {
      float streak = (0.35 + 1.3 * noise(vec3(s * 2.3, 3.0))) * (0.6 + 0.8 * noise(vec3(s * 8.0, 5.0)));
      float d = c * streak * smoothstep(base, base - 0.35, h) * dt;
      od += d; tw += d * t;
    }
  }
  if (od <= 0.0) return vec4(0.0, 0.0, 0.0, 1.0);
  float snowy = uPrecip.x > 1.5 ? (uPrecip.x > 2.5 ? 0.5 : 1.0) : 0.0;
  float a = 1.0 - exp(-od * uPrecip.y * mix(0.42, 0.85, snowy));
  float mu = dot(rd, uSunDir);
  vec3 S = (uAmbBot * 0.9 + uAmbTop * 0.55) * mix(1.0, 1.3, snowy) + uSun0 * 0.03 * (1.0 + 7.0 * hg(mu, 0.7));
  vec3 fog = exp(-(tw / od) * uFogK);
  S = S * fog + bg * (1.0 - fog);
  return vec4(S * a, 1.0 - a);
}
// A funnel (tornado over land, waterspout over water) or a microburst, as a small volume under the cloud base.
vec4 feature(vec3 rd, float tMax, vec3 bg, float jit) {
  vec4 none = vec4(0.0, 0.0, 0.0, 1.0);
  float kind = uFeat.z; float base = uFeatB.x; float g = uFeatB.z; float clk = uSea.y; float seed = uFeatB.y;
  float Rb = kind < 1.5 ? 2.6 : 4.4;
  vec2 o = -uFeat.xy; vec2 d2 = rd.xz; float a = dot(d2, d2);
  if (a < 1.0e-6) return none;
  float b = dot(o, d2); float c = dot(o, o) - Rb * Rb; float disc = b * b - a * c;
  if (disc < 0.0) return none;
  float sq = sqrt(disc); float t0 = max((-b - sq) / a, 0.0); float t1 = min((-b + sq) / a, tMax);
  if (t1 <= t0) return none;
  float dt = (t1 - t0) / 28.0; float T = 1.0; vec3 L = vec3(0.0);
  vec3 lit = uSun0 * 0.028 + uAmbTop * 0.17 + uAmbBot * 0.6;      // a funnel hangs in the storm's shade
  for (int i = 0; i < 28; i++) {
    float t = t0 + (float(i) + jit) * dt;
    vec3 pl = vec3(rd.x * t, uAlt + rd.y * t, rd.z * t);
    float h = hsOf(pl); float u = (h - g) / (base - g);
    if (u > 0.0 && u < 1.12 && T > 0.02) {
      vec2 rel = pl.xz - uFeat.xy; float dens = 0.0; vec3 tint = vec3(1.0); float uu = clamp(u, 0.0, 1.0);
      if (kind < 1.5) {
        vec2 ax = (vec2(noise(vec3(uu * 2.2 + clk * 0.07, seed, 1.0)), noise(vec3(uu * 2.2 + clk * 0.07, seed, 7.0))) - 0.5) * 1.3 * (1.0 - uu) * uFeat.w;
        vec2 rr = rel - ax; float r = length(rr); float ang = atan(rr.y, rr.x);
        float rf = (0.07 + 0.75 * pow(uu, 2.4)) * uFeat.w * (uFeatB.w > 0.5 ? 0.55 : 1.0);         // waterspouts are thinner
        float sw = noise(vec3(sin(ang) * 2.0 + clk * 1.6 - uu * 7.0, uu * 9.0, cos(ang) * 2.0 + r * 5.0 + seed));
        dens = smoothstep(rf, rf * 0.45, r) * (0.55 + 0.9 * sw) * 22.0;
        dens += smoothstep(0.86, 1.0, u) * smoothstep(1.7, 0.8, r) * (0.3 + 0.9 * noise(vec3(rr * 1.3, clk * 0.05 + seed))) * 6.0;     // wall cloud
        float deb = smoothstep(0.16, 0.0, uu) * smoothstep(1.1 * uFeat.w, 0.15, r) * (0.3 + 1.2 * noise(vec3(sin(ang) * 3.0 - clk * 2.2, uu * 20.0, cos(ang) * 3.0 + r * 4.0)));
        dens += deb * 5.0;
        tint = mix(vec3(1.0), uFeatB.w > 0.5 ? vec3(1.3) : vec3(0.62, 0.5, 0.38), clamp(deb * 2.0, 0.0, 1.0));                         // spray or dust
      } else {
        float r = length(rel);
        float rs = 1.0 + 2.2 * pow(1.0 - uu, 3.0);                                                // the shaft spreads at the ground
        dens = smoothstep(rs, rs * 0.5, r) * (0.5 + 0.8 * noise(vec3(rel * 2.5, h * 0.6 + clk * 0.8))) * 1.4 * uFeat.w;
        float dh = h - g - 0.22;
        dens += exp(-((r - 2.9) * (r - 2.9) + dh * dh * 6.0) / 0.25) * (0.5 + noise(vec3(rel * 3.0, clk * 0.5))) * 2.2 * uFeat.w;   // the curl at the outflow edge
        tint = vec3(0.8, 0.82, 0.86);
      }
      if (dens > 0.001) {
        float sT = exp(-dens * dt); vec3 fog = exp(-t * uFogK);
        vec3 S = lit * tint; S = S * fog + bg * (1.0 - fog);
        L += T * (1.0 - sT) * S; T *= sT;
      }
    }
  }
  return vec4(L, T);
}
// A lightning bolt from the cloud base to the ground at the flash position.
vec3 bolt(vec3 rd, float tMax) {
  vec2 d2 = rd.xz; float a = dot(d2, d2);
  if (a < 1.0e-6) return vec3(0.0);
  float tb = dot(uFlashPos, d2) / a;
  if (tb <= 0.0 || tb > tMax) return vec3(0.0);
  vec3 pl = vec3(rd.x * tb, uAlt + rd.y * tb, rd.z * tb); float h = hsOf(pl);
  float u = h / (uL0a.x + 0.3);
  if (u < 0.0 || u > 1.0) return vec3(0.0);
  vec2 off = (vec2(noise(vec3(u * 7.0, uBoltSeed, 1.0)), noise(vec3(u * 7.0, uBoltSeed, 6.0))) - 0.5) * 0.45 * u
           + (vec2(noise(vec3(u * 31.0, uBoltSeed, 2.0)), noise(vec3(u * 31.0, uBoltSeed, 9.0))) - 0.5) * 0.1;
  float dist = length(pl.xz - (uFlashPos + off));
  float wdt = 0.004 + tb * uPix * 1.2;
  float glow = exp(-dist * dist / (wdt * wdt)) + 0.05 * exp(-dist * dist / (wdt * wdt * 40.0));
  return vec3(0.8, 0.86, 1.0) * glow * uFlash * 5.0 / max(uExposure, 0.3);
}
// Drops and flakes close to the lens.
float nearDrops(vec2 sp) {
  float a = 0.0; float snowy = uPrecip.x > 1.5 ? 1.0 : 0.0;
  for (int L = 0; L < 2; L++) {
    float fl = float(L);
    if (snowy < 0.5 || (uPrecip.x > 2.5 && L == 0)) {
      float sc = 34.0 + 36.0 * fl;
      vec2 g = vec2(sp.x * sc + sp.y * sc * uPrecip.w * 0.5, sp.y * sc * 0.07 + uSea.y * (5.0 + 3.0 * fl));
      vec2 id = floor(g); vec2 f = fract(g);
      a += step(0.80 - 0.4 * uPrecip.y, hash12(id + fl * 17.0)) * smoothstep(0.09, 0.0, abs(f.x - 0.5)) * smoothstep(0.0, 0.3, f.y) * smoothstep(1.0, 0.5, f.y) * 0.5;
    } else {
      float sc = 16.0 + 18.0 * fl;
      vec2 g = vec2(sp.x * sc + sin(uSea.y * 0.7 + sp.y * 6.0 + fl) * 0.35, sp.y * sc + uSea.y * (1.1 + 0.8 * fl));
      vec2 id = floor(g); vec2 f = fract(g); float hh = hash12(id + fl * 31.0);
      a += step(0.72 - 0.4 * uPrecip.y, hh) * smoothstep(0.13, 0.03, length(f - 0.5 - (vec2(hh, fract(hh * 7.3)) - 0.5) * 0.5)) * 0.8;
    }
  }
  return a;
}

void main() {
  vec2 s = vUv * uTile.zw + uTile.xy;
  vec3 rd;
  if (uProj == 0) {
    vec2 ndc = s * 2.0 - 1.0;
    rd = normalize(uCamR * (ndc.x * uTanFov * uAspect) + uCamU * (ndc.y * uTanFov) + uCamF);
  } else {
    float lon = (s.x * 2.0 - 1.0) * PI; float lat = (s.y - 0.5) * PI;
    rd = vec3(sin(lon) * cos(lat), sin(lat), -cos(lon) * cos(lat));
  }
  vec3 ro = vec3(0.0, RE + uAlt, 0.0);
  vec2 fc = gl_FragCoord.xy + uTile.xy * 4096.0;
  float jit = hash12(fc);
  float mu = dot(rd, uSunDir);

  // the ground first: it ends the view and the air in front of it
  float isSea; float tG = groundTrace(rd, jit, isSea);
  vec3 gcol = vec3(0.0);
  if (tG > 0.0) {
    if (isSea > 0.5) {
      // close water: find the wave surface itself
      if (tG < 6.0 && uSea.x > 0.0) {
        float amp = uSea.x * 1.3; float gA = uAlt - uSea2.y;
        float ta = gA > amp ? 2.0 * (gA - amp) / (-rd.y + sqrt(max(rd.y * rd.y - 2.0 * (gA - amp) / RE, 0.0))) : 0.0;
        float tb = tG * 1.6 + 0.02;
        vec3 pa = vec3(rd.x * ta, gA + rd.y * ta, rd.z * ta); float hm = hsOf(pa) - seaH(pa.xz, 4);
        vec3 pb = vec3(rd.x * tb, gA + rd.y * tb, rd.z * tb); float hx = hsOf(pb) - seaH(pb.xz, 4);
        if (hm > 0.0 && hx < 0.0) {
          float tm = ta;
          for (int i = 0; i < 8; i++) {
            tm = mix(ta, tb, hm / (hm - hx));
            vec3 pm = vec3(rd.x * tm, gA + rd.y * tm, rd.z * tm); float hmid = hsOf(pm) - seaH(pm.xz, 4);
            if (hmid < 0.0) { tb = tm; hx = hmid; } else { ta = tm; hm = hmid; }
          }
          tG = tm;
        }
      }
      vec3 pl = vec3(rd.x * tG, 0.0, rd.z * tG);
      gcol = seaColor(pl, rd, tG);
    } else {
      vec3 pl = vec3(rd.x * tG, uAlt + rd.y * tG, rd.z * tG);
      gcol = landColor(pl, tG);
    }
  }
  vec3 trans;
  vec3 bg = sky(ro, rd, trans, tG);
  if (tG > 0.0) bg += gcol * trans;
  else {
    bg += trans * uSunI * 60.0 * smoothstep(0.99996, 0.99999, mu);
    bg += trans * stars(rd) * uNight * 0.012;
    bg += trans * starMap(rd) * uNight * 0.9 * uStarsOn;
    bg += uNight * vec3(0.00016, 0.00026, 0.00060) * (0.6 + 0.4 * (1.0 - max(rd.y, 0.0)));
  }
  float tMax = tG > 0.0 ? tG : 1.0e9;

  // weather under the cloud base: rain or snow, a funnel or microburst, a bolt
  vec3 ucol = vec3(0.0); float utr = 1.0;
  if (uFeat.z > 0.5) { vec4 f = feature(rd, tMax, bg, jit); ucol += utr * f.rgb; utr *= f.a; }
  if (uPrecip.x > 0.5 && uPrecip.y > 0.0) { vec4 pv = precipVeil(rd, tMax, bg, jit); ucol += utr * pv.rgb; utr *= pv.a; }
  if (uFlash > 0.05) ucol += bolt(rd, tMax);

  vec2 s0 = uL0a.z > 0.003 ? shellSpan(ro, rd, uL0a.x, uL0a.y, tMax) : vec2(1.0e9, -1.0e9);
  vec2 s1 = uL1a.z > 0.003 ? shellSpan(ro, rd, uL1a.x, uL1a.y, tMax) : vec2(1.0e9, -1.0e9);
  float tc = 1.0e9;
  if (uC.y > 0.003) {
    vec2 hc = sph(ro, rd, RE + uC.x);
    if (hc.y > hc.x) { float tt = (length(ro) < RE + uC.x) ? hc.y : hc.x; if (tt > 0.0 && tt < tMax) tc = tt; }
  }
  vec3 col = vec3(0.0); float tr = 1.0;
  bool under = uAlt < uL0a.x;                     // below the cloud base the weather is in front of the clouds
  if (under) { col = ucol; tr = utr; }
  bool d0 = false; bool d1 = false; bool d2 = false;
  for (int k = 0; k < 3; k++) {
    float a0 = d0 ? 2.0e9 : s0.x; float a1 = d1 ? 2.0e9 : s1.x; float a2 = d2 ? 2.0e9 : tc;
    vec4 r = vec4(0.0, 0.0, 0.0, 1.0);
    if (a0 <= a1 && a0 <= a2) { d0 = true; if (a0 < 1.0e8 && tr > 0.02) r = marchVol(ro, rd, s0, uL0a, uL0b, uL0w, uSun0, bg, jit, 0.0); }
    else if (a1 <= a2) { d1 = true; if (a1 < 1.0e8 && tr > 0.02) r = marchVol(ro, rd, s1, uL1a, uL1b, uL1w, uSun1, bg, jit, 1.0); }
    else { d2 = true; if (a2 < 1.0e8 && tr > 0.02) r = cirrus(ro, rd, tc, bg); }
    col += tr * r.rgb; tr *= r.a;
  }
  if (!under) { col += tr * ucol; tr *= utr; }
  col += tr * bg;

  // drops and flakes on the way past the lens, when the camera stands in the rain or snow
  if (uProj == 0 && uPrecip.x > 0.5 && under && uPrecip.y > 0.0) {
    float here = rainCell(vec2(0.0));
    if (here > 0.05) col += (uAmbTop + uAmbBot) * 0.55 * nearDrops(vec2(s.x * uAspect, s.y)) * here * uPrecip.y;
  }

  col *= uExposure;
  col = clamp((col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14), 0.0, 1.0);
  col = pow(col, vec3(1.0 / 2.2));
  col += (jit - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`;
})();
