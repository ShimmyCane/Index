/* Voice — Kokoro live: the same open voice model, run inside this browser.
   Loaded only when someone picks "Kokoro · live". The first time it downloads the model
   (about 92 MB small, 326 MB fast) from huggingface.co; the browser keeps it for next time.
   The model runs in a worker (js/live_worker.js) so the page never freezes.
   Library: lib/kokoro.web.js (kokoro-js 1.2.1, Apache 2.0). English only (its phonemizer is English). */
(function () {
  'use strict';
  var worker = null, seq = 0, waiting = {}, ready = false, engine = '', loading = null, onProgress = null, files = {};

  function start() {
    if (worker) return worker;
    worker = new Worker(new URL('js/live_worker.js', document.baseURI).href, { type: 'module' });
    worker.onmessage = function (e) {
      var m = e.data;
      if (m.type === 'progress') {
        files[m.file] = [m.loaded, m.total];
        var got = 0, all = 0;
        for (var f in files) { got += files[f][0]; all += files[f][1]; }
        if (onProgress) onProgress(got, all);
        return;
      }
      var w = waiting[m.id]; if (!w) return;
      delete waiting[m.id];
      if (m.type === 'error') w.reject(new Error(m.message)); else w.resolve(m);
    };
    worker.onerror = function (e) {
      var msg = (e && e.message) || 'The live voice worker stopped.';
      Object.keys(waiting).forEach(function (k) { waiting[k].reject(new Error(msg)); delete waiting[k]; });
      worker = null; ready = false; loading = null;
    };
    return worker;
  }
  function ask(msg) {
    return new Promise(function (resolve, reject) {
      msg.id = ++seq; waiting[msg.id] = { resolve: resolve, reject: reject };
      start().postMessage(msg);
    });
  }

  function load(device, progress) {
    onProgress = progress;
    if (ready && engine === device) return Promise.resolve();
    if (loading && engine === device) return loading;
    engine = device; ready = false; files = {};
    loading = ask({ type: 'load', device: device }).then(function () { ready = true; }, function (err) { loading = null; throw err; });
    return loading;
  }

  // Resolves to { audio: Float32Array, rate: sampling rate }.
  function generate(text, voice, speed) {
    if (!ready) return Promise.reject(new Error('Live voice is not loaded yet.'));
    return ask({ type: 'generate', text: text, voice: voice, speed: speed || 1 }).then(function (m) { return { audio: m.audio, rate: m.rate }; });
  }

  window.VoiceLive = {
    load: load,
    generate: generate,
    ready: function () { return ready; },
    canWebGPU: function () { return !!navigator.gpu; }
  };
})();
