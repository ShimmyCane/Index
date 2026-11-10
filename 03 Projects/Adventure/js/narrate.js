// Adventure — narration for voiced chapters, borrowed from the Voice repo (ShimmyCane/Voice).
// A voiced chapter is a script story: { cast, script: [{ who, text, speed?, sfx?, notes? }], music? }.
// Bundled chapters live in story/<id>.js (window.ADV_SCRIPTS['book.number']); the storyteller can also
// write one into adv_chapters.script.
//
// Reading aloud plays only a prerecorded file: the Kokoro cast recording, if it matches the text:
//   story.recording (from the adv-audio bucket, made by tools/make_voice.py --db), or
//   story/<id>.audio.js + audio/<id>.cast.mp3 (bundled).
// There is no fallback to the browser's own voice. Sound cues (sfx) play when the reading reaches a
// line; a soft tune (js/sound.js) plays underneath.
(function () {
  const S = () => window.AdvSound || window.VoiceSound;
  let run = null;   // the current reading

  // The recording for this script, or null if there is none or it no longer matches the text.
  function recordingFor(story) {
    const a = (story.recording && story.recording.src && story.recording) || (story.id && window.ADV_AUDIO && window.ADV_AUDIO[story.id]);
    if (!a || !a.lines || a.lines.length !== story.script.length) return null;
    const same = story.script.every((l, i) => a.source[i] === l.text);
    return same ? a : null;
  }

  function stop() {
    if (!run) return;
    const r = run; run = null;
    if (r.audio) { r.audio.onerror = r.audio.onended = null; r.audio.pause(); r.audio.removeAttribute('src'); r.audio.load(); }
    if (r.raf) cancelAnimationFrame(r.raf);
    if (S()) S().stopMusic();
    r.opts.onEnd && r.opts.onEnd();
  }

  function cue(r, i) {
    if (i === r.line) return;
    r.line = i;
    const l = r.story.script[i];
    if (l && l.sfx && r.opts.sfx && S()) S().sfx(l.sfx);
    r.opts.onLine && r.opts.onLine(i);
  }

  // Word index inside a line from how far through it we are, weighted by word length.
  function wordAt(text, frac) {
    const words = text.split(/\s+/).filter(Boolean);
    const total = words.reduce((n, w) => n + w.length + 1, 0);
    let acc = 0;
    for (let k = 0; k < words.length; k++) {
      acc += words[k].length + 1;
      if (acc / total >= frac) return k;
    }
    return words.length - 1;
  }

  function playRecorded(r, rec, from) {
    const audio = new Audio(rec.src);
    r.audio = audio;
    const fail = msg => { if (run !== r) return; stop(); r.opts.onError && r.opts.onError(msg); };
    audio.onended = () => { if (run === r) stop(); };
    audio.onerror = () => fail('Could not play the recording');
    const tick = () => {
      if (run !== r) return;
      const t = audio.currentTime;
      let i = rec.lines.findIndex(([a, b]) => t >= a && t < b + 0.5);
      if (i >= 0) {
        cue(r, i);
        const [a, b] = rec.lines[i];
        r.opts.onWord && r.opts.onWord(i, wordAt(r.story.script[i].text, Math.min(1, (t - a) / (b - a))));
      }
      r.raf = requestAnimationFrame(tick);
    };
    // Seeking before the file has loaded is ignored, so seek once the metadata is in.
    if (from) audio.addEventListener('loadedmetadata', () => { audio.currentTime = rec.lines[from][0]; }, { once: true });
    audio.play().then(tick, e => fail(e.message || e));
  }

  // opts: { from: line, sfx, music, onLine, onWord, onEnd, onError }
  // Returns true when playback started, false when the chapter has no matching recording.
  function play(story, opts) {
    stop();
    const rec = recordingFor(story);
    if (!rec) { opts.onError && opts.onError('This chapter has no recording yet.'); return false; }
    const r = { story, opts, line: -1 };
    run = r;
    if (S()) { S().unlock(); if (opts.music && story.music) S().music(story.music); }
    playRecorded(r, rec, opts.from || 0);
    return true;
  }

  window.Narrate = { play, stop, recordingFor, playing: () => !!run };
})();
