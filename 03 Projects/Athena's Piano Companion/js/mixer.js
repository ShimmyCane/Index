// Composer engine (pure functions, testable without a page): turn a clip into samples, and mix layers.
// A clip: { take_id, start, in, out, rate, gain, reverse, fadeIn, fadeOut, repeat, extend }
//   snip     = in / out (which part of the take is used)
//   transform= rate (speed, pitch follows), reverse, gain, fades
//   repeat   = the snipped part played N times in a row
//   extend   = N extra seconds made by looping the last moment of the clip, so a held note keeps going
//   shift    = start (where on the timeline the clip begins)
(function (root) {
  'use strict';
  var Mixer = {};

  function cosFade(buf, n, fadeIn) {                       // smooth edge: no clicks
    n = Math.min(n, buf.length >> 1);
    for (var i = 0; i < n; i++) {
      var g = 0.5 - 0.5 * Math.cos(Math.PI * i / n);
      if (fadeIn) buf[i] *= g; else buf[buf.length - 1 - i] *= g;
    }
  }
  // Extra seconds by overlap-adding copies of the clip's last moment (60 ms joins).
  function extendTail(seg, extra, sr) {
    var tailLen = Math.min(Math.floor(sr * 0.9), seg.length >> 1), out = new Float32Array(extra);
    if (tailLen < 64 || extra <= 0) return out;
    var tail = seg.slice(seg.length - tailLen), xf = Math.min(Math.floor(sr * 0.06), tailLen >> 2), hop = tailLen - xf;
    for (var pos = 0; pos < extra; pos += hop) {
      for (var i = 0; i < tailLen && pos + i < extra; i++) {
        var w = i < xf ? 0.5 - 0.5 * Math.cos(Math.PI * i / xf) : (i >= tailLen - xf ? 0.5 + 0.5 * Math.cos(Math.PI * (i - (tailLen - xf)) / xf) : 1);
        out[pos + i] += tail[i] * w;
      }
    }
    return out;
  }

  // src: Float32Array of the whole take at sample rate sr. Returns the clip's samples (mono).
  Mixer.renderClip = function (src, sr, c) {
    var a = Math.max(0, Math.floor(c.in * sr)), b = Math.min(src.length, Math.floor(c.out * sr));
    if (b - a < 16) return new Float32Array(0);
    var seg = src.slice(a, b);
    if (c.reverse) seg.reverse();
    var reps = Math.max(1, Math.round(c.repeat || 1)), extra = Math.max(0, Math.round((c.extend || 0) * sr));
    var body = new Float32Array(seg.length * reps + extra), r;
    for (r = 0; r < reps; r++) body.set(seg, r * seg.length);
    if (extra) body.set(extendTail(c.reverse ? seg.slice().reverse() : seg, extra, sr), seg.length * reps);   // tail of what is heard last
    var rate = Math.max(0.25, Math.min(4, c.rate || 1)), out = body;
    if (Math.abs(rate - 1) > 1e-4) {                       // speed: linear resampling, pitch follows speed like a tape
      var n = Math.floor(body.length / rate); out = new Float32Array(n);
      for (var i = 0; i < n; i++) {
        var p = i * rate, k = Math.floor(p), f = p - k;
        out[i] = body[k] * (1 - f) + (body[k + 1] !== undefined ? body[k + 1] : body[k]) * f;
      }
    } else out = body.slice();
    var g = c.gain == null ? 1 : c.gain; if (g !== 1) for (var j = 0; j < out.length; j++) out[j] *= g;
    cosFade(out, Math.floor((c.fadeIn == null ? 0.02 : c.fadeIn) * sr), true);
    cosFade(out, Math.floor((c.fadeOut == null ? 0.05 : c.fadeOut) * sr), false);
    return out;
  };
  Mixer.clipSeconds = function (rendered, sr) { return rendered.length / sr; };

  // layers: [{ vol, mute, clips: [{ start }] }]; rendered(clip) gives its samples. Returns { data, sr, peak }.
  Mixer.mix = function (layers, sr, rendered) {
    var end = 0, items = [];
    layers.forEach(function (L) {
      if (L.mute) return;
      L.clips.forEach(function (c) {
        var s = rendered(c); if (!s || !s.length) return;
        items.push({ s: s, at: Math.max(0, Math.floor(c.start * sr)), v: L.vol == null ? 1 : L.vol });
        end = Math.max(end, Math.max(0, Math.floor(c.start * sr)) + s.length);
      });
    });
    var out = new Float32Array(end), peak = 0;
    items.forEach(function (it) { for (var i = 0; i < it.s.length; i++) out[it.at + i] += it.s[i] * it.v; });
    for (var k = 0; k < out.length; k++) { var a = Math.abs(out[k]); if (a > peak) peak = a; }
    if (peak > 0.98) { var sc = 0.98 / peak; for (var m = 0; m < out.length; m++) out[m] *= sc; }   // never clip: turn it down
    return { data: out, sr: sr, peak: peak };
  };
  Mixer.newClip = function (take, start, id) {
    return { id: id, take_id: take.id, take_name: take.name, start: start, 'in': 0, out: take.duration_ms / 1000, rate: 1, gain: 1,
      reverse: false, fadeIn: 0.02, fadeOut: 0.05, repeat: 1, extend: 0 };
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Mixer; else root.Mixer = Mixer;
})(typeof window !== 'undefined' ? window : this);
