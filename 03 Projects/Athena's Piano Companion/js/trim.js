// Trimming a recorded take: cut the lead-in and the quiet tail, keep a short natural decay, fade the edges.
// Pure functions (no page needed), so they can be tested alone.
(function (root) {
  'use strict';
  var Trim = {};
  var WIN = 0.01;                                          // analysis window, seconds

  function envelope(data, sr) {
    var w = Math.max(1, Math.round(sr * WIN)), n = Math.floor(data.length / w), env = new Float32Array(n), peak = 0;
    for (var i = 0; i < n; i++) {
      var s = 0, o = i * w;
      for (var j = 0; j < w; j++) s += data[o + j] * data[o + j];
      env[i] = Math.sqrt(s / w); if (env[i] > peak) peak = env[i];
    }
    return { env: env, w: w, peak: peak };
  }
  // The quietest sound that counts as playing, for this take: the listener's threshold, but never above a
  // fraction of this take's own loudness (a soft player still gets her quiet notes kept).
  function threshold(e, opt) {
    var base = (opt && opt.thr) || 0.01;
    return Math.max(Math.min(base, e.peak * 0.25), e.peak * 0.03, 0.0008);
  }

  // Latest quiet gap (>= 0.3 s) that ends before `heardSec - 0.4`, looking back 6 s. Returns its start (seconds) or null.
  Trim.voiceCut = function (data, sr, heardSec, thr) {
    var e = envelope(data, sr), t = threshold(e, { thr: thr }), idx = Math.floor((heardSec - 0.4) / WIN), lo = Math.max(0, idx - 600), run = 0;
    if (idx >= e.env.length) idx = e.env.length - 1;
    for (var i = idx; i >= lo; i--) {
      if (e.env[i] <= t) { run++; if (run >= 30) { var j = i; return j * WIN; } }
      else if (run > 0 && run < 30) run = 0;
      else if (run === 0) { /* inside sound */ }
    }
    return Math.max(0, heardSec - 2.0);
  };

  // opt: { cut: seconds (do not keep anything after this), thr: listener threshold, ignore: seconds of count-in leakage to skip,
  //        pre: lead-in kept, tail: seconds of pause kept after the music ends (default 2), heard: how loud (share of the take's
  //        peak) still counts as music (default 0.08) }
  // The music "ends" when the sound last rises above both the listener threshold and `heard` of the peak. The pause after it
  // (a piano's fading ring and the quiet that followed) is trimmed back to `tail` seconds, with a cosine fade over the end.
  // Returns { data, startSec, endSec } or null when no real playing was heard (or under minSec).
  Trim.run = function (data, sr, opt) {
    opt = opt || {};
    var e = envelope(data, sr), t = threshold(e, opt), ignore = Math.ceil((opt.ignore != null ? opt.ignore : 0.2) / WIN);
    var tHeard = Math.max(t, e.peak * (opt.heard != null ? opt.heard : 0.08));
    var cutIdx = opt.cut != null ? Math.min(e.env.length, Math.floor(opt.cut / WIN)) : e.env.length;
    var first = -1, last = -1, i;
    for (i = ignore; i < cutIdx; i++) if (e.env[i] > t) { first = i; break; }
    for (i = cutIdx - 1; i >= ignore; i--) if (e.env[i] > tHeard) { last = i; break; }
    if (first < 0 || last < first || (last - first) * WIN < (opt.minSec != null ? opt.minSec : 0.4)) return null;
    var pre = Math.round((opt.pre != null ? opt.pre : 0.15) * sr), tail = Math.round((opt.tail != null ? opt.tail : 2.0) * sr);
    var start = Math.max(Math.round(ignore * e.w * 0.9), first * e.w - pre);
    var end = Math.min(data.length, (last + 1) * e.w + tail);
    if (opt.cut != null) end = Math.min(end, Math.round(opt.cut * sr));
    if (end - start < sr * 0.3) return null;
    var out = data.slice(start, end);
    var fi = Math.min(Math.round(0.02 * sr), out.length >> 2), fo = Math.min(Math.round(0.8 * sr), out.length >> 1), k;
    for (k = 0; k < fi; k++) out[k] *= 0.5 - 0.5 * Math.cos(Math.PI * k / fi);
    for (k = 0; k < fo; k++) out[out.length - 1 - k] *= 0.5 - 0.5 * Math.cos(Math.PI * k / fo);   // cosine: no click, no abrupt stop
    return { data: out, startSec: start / sr, endSec: end / sr, musicEndSec: (last + 1) * e.w / sr };
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Trim; else root.Trim = Trim;
})(typeof window !== 'undefined' ? window : this);
