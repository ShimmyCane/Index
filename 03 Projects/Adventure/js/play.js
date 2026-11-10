// Adventure — player page: catch up on the story, then build a scene by
// tapping characters and talking, then send it to the storyteller.
(function () {
  const { store, esc, q, status, error } = Adv;
  const HOUR = 3600e3;

  const state = {
    roles: [],
    chapters: [],      // oldest first
    waiting: 0,        // scenes sent but not yet read by the storyteller
    lastWaitingAt: null,
    lastRun: null,
    source: 'live',
    length: null,      // 'tiny' | 'short' | 'long'
    active: null,      // role key being spoken for
    draft: store.get('adv.draft', { beats: [] }),
    recordings: {},    // chapter id → recording with a signed link, so a replay doesn't ask again
    listening: false
  };

  // ---------------------------------------------------------------- loading
  // Live database (with timeout) → last good copy on this device → bundled file.
  async function load() {
    try {
      const [roles, chapters, waiting, runs] = await Promise.all([
        q(Adv.sb.from('adv_roles').select('*').eq('active', true).order('sort')),
        q(Adv.sb.from('adv_chapters').select('*').eq('status', 'published').order('created_at', { ascending: false }).limit(12)),
        q(Adv.sb.from('adv_turns').select('created_at').eq('status', 'waiting').order('created_at', { ascending: false })),
        q(Adv.sb.from('adv_runs').select('*').order('started_at', { ascending: false }).limit(1))
      ]);
      Object.assign(state, {
        roles, chapters: chapters.reverse(), waiting: waiting.length,
        lastWaitingAt: waiting[0] ? waiting[0].created_at : null,
        lastRun: runs[0] || null, source: 'live'
      });
      store.set('adv.cache', { roles: state.roles, chapters: state.chapters });
      status('ok', '● Connected');
    } catch (e) {
      error('Loading the story', e);
      const cache = store.get('adv.cache', null);
      if (cache && cache.chapters && cache.chapters.length) {
        Object.assign(state, cache, { source: 'cache' });
        status('cache', '● Saved copy');
      } else {
        try {
          const res = await fetch('data/fallback.json');
          Object.assign(state, await res.json(), { source: 'bundled' });
          status('cache', '● Offline copy');
        } catch (e2) {
          error('Loading the offline copy', e2);
        }
      }
    }
  }

  // ---------------------------------------------------------------- story
  const newest = () => state.chapters[state.chapters.length - 1];

  function lengthFor(gapMs) {
    if (gapMs >= 12 * HOUR) return 'long';
    if (gapMs >= HOUR) return 'short';
    return 'tiny';
  }

  // Fall back to a shorter or longer version when one is empty.
  function textOf(ch, len) {
    const order = { tiny: ['tiny', 'short', 'long'], short: ['short', 'long', 'tiny'], long: ['long', 'short', 'tiny'] }[len];
    for (const l of order) if (ch['text_' + l]) return ch['text_' + l];
    return '';
  }

  function sinceLabel(gapMs) {
    if (!isFinite(gapMs)) return 'Welcome to the story!';
    const h = Math.floor(gapMs / HOUR);
    if (h >= 24) return 'It has been ' + Math.floor(h / 24) + (h >= 48 ? ' days' : ' day') + '…';
    if (h >= 1) return 'It has been ' + h + (h === 1 ? ' hour' : ' hours') + '…';
    return 'Back so soon!';
  }

  function renderStory() {
    const ch = newest();
    if (!ch) {
      document.getElementById('chTitle').textContent = 'The story has not started yet';
      return;
    }
    const lastSeen = state.lastSeen;
    const gap = lastSeen ? Date.now() - new Date(lastSeen).getTime() : Infinity;
    if (!state.length) state.length = lengthFor(gap);

    document.getElementById('since').textContent = sinceLabel(gap);
    document.getElementById('chTitle').textContent = 'Chapter ' + ch.number + ': ' + ch.title;
    const script = scriptOf(ch);
    document.getElementById('chText').innerHTML = script && state.length === 'long'
      ? scriptHtml(script)
      : textOf(ch, state.length).split(/\n\s*\n/).map(p => '<p>' + esc(p) + '</p>').join('');
    // The peek is a poem: keep its line breaks.
    document.getElementById('chText').classList.toggle('poem', state.length === 'tiny');
    document.getElementById('chText').classList.toggle('show-notes', store.get('adv.notes', false));
    document.getElementById('chPrompt').textContent = ch.prompt || '';

    // Earlier chapters missed since the last visit: one line each.
    const missed = state.chapters.slice(0, -1)
      .filter(c => !lastSeen || new Date(c.created_at) > new Date(lastSeen));
    document.getElementById('recap').innerHTML = missed.map(c =>
      '<div><b>Chapter ' + c.number + ':</b> ' + esc(textOf(c, 'tiny')) + '</div>').join('');

    document.querySelectorAll('#lengths .chip').forEach(b =>
      b.classList.toggle('on', b.dataset.len === state.length));
  }

  function renderSleep() {
    const box = document.getElementById('sleep');
    const ch = newest();
    let msg = '';
    if (state.lastRun && state.lastRun.status === 'running') {
      msg = '✍️ The storyteller is writing the next page right now…';
    } else if (state.lastRun && state.lastRun.status === 'failed') {
      msg = '🌙 The story is resting tonight. It will pick up again soon.';
    } else if (state.waiting && (!ch || new Date(state.lastWaitingAt) > new Date(ch.created_at))) {
      msg = '😴 The storyteller is asleep. ' + state.waiting + (state.waiting === 1 ? ' scene is' : ' scenes are') +
        ' tucked in, waiting for tonight. You can still add more!';
    }
    box.textContent = msg;
    box.classList.toggle('hidden', !msg);
  }

  // ---------------------------------------------------------------- voiced chapters
  // A chapter is voiced when it has a script: written by the storyteller (adv_chapters.script)
  // or bundled in story/<id>.js. "The whole page" then shows who is speaking and reads with a cast.
  function scriptOf(ch) {
    if (ch.script && ch.script.script && ch.script.script.length) {
      // A chapter from the database finds its bundled recording by book and number (b1c1 for Book 1, Chapter 1).
      const bundled = (window.ADV_AUDIO || {})['b' + ch.book + 'c' + ch.number] || null;
      const rec = ch.audio ? Object.assign({}, ch.audio) : bundled;
      return Object.assign({ id: 'db-' + ch.id }, ch.script, { recording: rec });
    }
    return (window.ADV_SCRIPTS || {})[ch.book + '.' + ch.number] || null;
  }

  const NOTE_ICON = { motivation: '💭', acting: '🎭', sound: '🔔', blocking: '👣', gesture: '✋', thought: '💬' };

  function scriptHtml(script) {
    return script.script.map((l, i) => {
      const c = script.cast[l.who] || { name: l.who, icon: '🙂' };
      const who = l.who === 'narrator' ? '' : '<span class="who-tag">' + esc(c.icon + ' ' + c.name) + '</span> ';
      const notes = (l.notes || []).map(n => '<span class="note">' + (NOTE_ICON[n.kind] || '📝') + ' ' + esc(n.text) + '</span>').join('');
      const words = l.text.split(/\s+/).filter(Boolean).map(w => '<span class="w">' + esc(w) + '</span>').join(' ');
      return '<p class="line ' + (l.who === 'narrator' ? 'narr' : 'said') + '" data-i="' + i + '">' +
        (notes ? '<span class="notes">' + notes + '</span>' : '') + who + words + '</p>';
    }).join('');
  }

  function markLine(i) {
    document.querySelectorAll('#chText .line').forEach(p => p.classList.toggle('now', +p.dataset.i === i));
    const p = document.querySelector('#chText .line.now');
    if (p && p.scrollIntoView) p.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function markWord(i, k) {
    const old = document.querySelector('#chText .w.on');
    const p = document.querySelector('#chText .line[data-i="' + i + '"]');
    const w = p && p.querySelectorAll('.w')[k];
    if (old && old !== w) old.classList.remove('on');
    if (w) w.classList.add('on');
  }

  // A recording in the private bucket needs a short-lived link before it can play.
  async function linkRecording(script) {
    const rec = script.recording;
    if (!rec || rec.src || !rec.path || !Adv.sb) return;
    try {
      const { data, error: e } = await Adv.withTimeout(Adv.sb.storage.from('adv-audio').createSignedUrl(rec.path, 3 * 3600));
      if (e) throw new Error(e.message);
      rec.src = data.signedUrl;
    } catch (e) { error('Finding the recording', e); }
  }

  // Reads the newest chapter aloud from its recording only (the whole page).
  async function narrate(from) {
    const ch = newest();
    const script = ch && scriptOf(ch);
    if (!script) { error('Reading aloud', 'This chapter has no recording yet.'); return false; }
    script.recording = state.recordings[ch.id] || script.recording;
    await linkRecording(script);
    state.recordings[ch.id] = script.recording;
    if (state.length !== 'long') { state.length = 'long'; renderStory(); }
    const started = Narrate.play(script, {
      from: from || 0,
      sfx: store.get('adv.sfx', true), music: store.get('adv.music', true),
      onLine: markLine, onWord: markWord,
      onEnd: () => { setReading(false); markLine(-1); markWord(-1, -1); },
      onError: e => error('Reading aloud', e)
    });
    if (!started) return false;
    setReading(true);
    document.getElementById('castNote').textContent = '🎙️ Recorded cast voices';
    return true;
  }

  // ---------------------------------------------------------------- reading aloud
  function setReading(on) {
    document.getElementById('readBtn').textContent = on ? '⏹ Stop' : '🔊 Read';
    state.reading = on;
  }

  // 🔊 always reads the whole page from its recording. A chapter without one says so.
  function toggleRead() {
    if (state.reading) { Narrate.stop(); setReading(false); return; }
    if (!newest()) return;
    narrate(0);
  }

  // ---------------------------------------------------------------- characters
  const roleOf = key => state.roles.find(r => r.key === key) || { key, name: key, emoji: '🙂', color: '#fff' };

  function renderRoles() {
    document.getElementById('roles').innerHTML = state.roles.map(r =>
      '<button class="role' + (r.key === state.active ? ' on' : '') + '" data-key="' + esc(r.key) +
      '" style="background:' + esc(r.color) + '"><span class="face">' + esc(r.emoji) + '</span>' + esc(r.name) + '</button>'
    ).join('');
  }

  function pickRole(key) {
    stopMic();
    state.active = key;
    state.openBeat = null;   // a new beat starts with the first words
    const r = roleOf(key);
    const ch = newest();
    const whisper = ch && ch.whispers ? ch.whispers[key] : '';
    document.getElementById('spEmoji').textContent = r.emoji;
    document.getElementById('spName').textContent = r.name;
    const w = document.getElementById('spWhisper');
    w.textContent = whisper ? '🤫 Only you know: ' + whisper : '';
    w.classList.toggle('hidden', !whisper);
    document.getElementById('heard').textContent = '';
    document.getElementById('speak').classList.remove('hidden');
    renderRoles();
  }

  function doneRole() {
    stopMic();
    state.active = null;
    state.openBeat = null;
    document.getElementById('speak').classList.add('hidden');
    renderRoles();
  }

  // Add words to the current character's beat. Words are never edited or removed.
  function addWords(text) {
    text = text.trim();
    if (!text || !state.active) return;
    const beats = state.draft.beats;
    const open = state.openBeat != null ? beats[state.openBeat] : null;
    if (open && open.role === state.active) {
      open.text += ' ' + text;
    } else {
      beats.push({ role: state.active, text, at: new Date().toISOString() });
      state.openBeat = beats.length - 1;
    }
    if (!state.draft.chapter_id && newest()) state.draft.chapter_id = newest().id;
    store.set('adv.draft', state.draft);
    renderBeats();
  }

  function renderBeats() {
    const beats = state.draft.beats;
    document.getElementById('beats').innerHTML = beats.map(b => {
      const r = roleOf(b.role);
      const t = new Date(b.at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      return '<li class="beat" style="background:' + esc(r.color) + '"><div class="who">' + esc(r.emoji + ' ' + r.name) +
        '<time>' + esc(t) + '</time></div><div class="said">' + esc(b.text) + '</div></li>';
    }).join('');
    const send = document.getElementById('sendBtn');
    send.disabled = !beats.length;
    send.textContent = '📮 Send the scene' + (beats.length ? ' (' + beats.length + ')' : '');
    send.classList.remove('confirm');
    const last = document.querySelector('#beats .beat:last-child');
    if (last && last.scrollIntoView) last.scrollIntoView({ block: 'nearest' });
  }

  // ---------------------------------------------------------------- microphone
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null;

  function startMic() {
    if (!SR) {
      document.getElementById('heard').textContent = 'Talking is not available here. Tap the box below and use the 🎤 on the keyboard.';
      document.getElementById('typed').focus();
      return;
    }
    rec = new SR();
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = ev => {
      let interim = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const t = ev.results[i][0].transcript;
        if (ev.results[i].isFinal) addWords(t); else interim += t;
      }
      document.getElementById('heard').textContent = interim ? '…' + interim : '';
    };
    rec.onerror = ev => {
      if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
        document.getElementById('heard').textContent = 'The microphone is blocked. Allow it in Settings, or type below.';
      } else if (ev.error !== 'no-speech' && ev.error !== 'aborted') {
        error('Microphone', ev.error);
      }
    };
    rec.onend = () => setListening(false);
    try { rec.start(); setListening(true); } catch (e) { error('Microphone', e); }
  }

  function stopMic() {
    if (rec) { try { rec.stop(); } catch (e) { /* already stopped */ } }
    setListening(false);
  }

  function setListening(on) {
    state.listening = on;
    const b = document.getElementById('micBtn');
    b.classList.toggle('listening', on);
    b.textContent = on ? '👂 Listening… tap to stop' : '🎤 Tap and talk';
  }

  // ---------------------------------------------------------------- sending
  let confirmTimer = null;

  async function send() {
    const btn = document.getElementById('sendBtn');
    const msg = document.getElementById('sendMsg');
    if (!btn.classList.contains('confirm')) {
      btn.classList.add('confirm');
      btn.textContent = 'Tap again to send it for good';
      clearTimeout(confirmTimer);
      confirmTimer = setTimeout(renderBeats, 4000);
      return;
    }
    clearTimeout(confirmTimer);
    doneRole();
    btn.disabled = true;
    msg.textContent = 'Sending…';
    try {
      await q(Adv.sb.from('adv_turns').insert({ chapter_id: state.draft.chapter_id || null, beats: state.draft.beats }));
      state.draft = { beats: [] };
      store.set('adv.draft', state.draft);
      state.waiting += 1;
      state.lastWaitingAt = new Date().toISOString();
      msg.textContent = '🌙 Tucked in! The storyteller will read it tonight.';
      renderBeats();
      renderSleep();
    } catch (e) {
      error('Sending the scene', e);
      msg.textContent = 'Could not send yet. The scene is saved on this iPad, so try again later.';
      renderBeats();
    }
  }

  // ---------------------------------------------------------------- settings
  function setupSettings() {
    const size = px => {
      store.set('adv.size', px);
      document.documentElement.style.setProperty('--story-size', px + 'px');
    };
    size(store.get('adv.size', 20));
    document.getElementById('smaller').onclick = () => size(Math.max(15, store.get('adv.size', 20) - 2));
    [['sfxOn', 'adv.sfx', true], ['musicOn', 'adv.music', true], ['notesOn', 'adv.notes', false]].forEach(([id, key, def]) => {
      const box = document.getElementById(id);
      box.checked = store.get(key, def);
      box.onchange = () => {
        store.set(key, box.checked);
        if (key === 'adv.notes') document.getElementById('chText').classList.toggle('show-notes', box.checked);
        if (key === 'adv.music' && !box.checked && window.AdvSound) AdvSound.stopMusic();
      };
    });
    document.getElementById('bigger').onclick = () => size(Math.min(32, store.get('adv.size', 20) + 2));
  }

  // ---------------------------------------------------------------- start
  async function start() {
    Adv.buildChrome();
    setupSettings();
    renderBeats();

    document.getElementById('readBtn').onclick = toggleRead;
    document.getElementById('lengths').onclick = ev => {
      const len = ev.target.dataset && ev.target.dataset.len;
      if (len) { if (state.reading) toggleRead(); state.length = len; renderStory(); }
    };
    // Tap a line of a voiced chapter to read from there.
    document.getElementById('chText').onclick = ev => {
      const p = ev.target.closest('.line');
      if (p) narrate(+p.dataset.i);
    };
    document.getElementById('roles').onclick = ev => {
      const b = ev.target.closest('.role');
      if (b) pickRole(b.dataset.key);
    };
    document.getElementById('spDone').onclick = doneRole;
    document.getElementById('micBtn').onclick = () => (state.listening ? stopMic() : startMic());
    document.getElementById('addBtn').onclick = () => {
      const t = document.getElementById('typed');
      addWords(t.value);
      t.value = '';
    };
    document.getElementById('sendBtn').onclick = send;

    await Adv.signIn();
    await load();
    // Remember when this device last looked, so the next catch-up fits the gap.
    state.lastSeen = store.get('adv.lastSeen', null);
    store.set('adv.lastSeen', new Date().toISOString());
    renderStory();
    renderSleep();
    renderRoles();
  }

  start();
})();
