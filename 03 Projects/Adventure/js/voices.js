// Adventure — voice test page. Plays baked Kokoro samples (audio/samples/, made by
// tools/make_voice.py --samples from story/voice_samples.js).
// Picks are saved on this device and in the "Voices" setting entry, which the recorder
// (tools/make_voice.py --db) uses for every chapter.
(function () {
  const { store, esc, q, error, status } = Adv;
  const ROLES = window.ADV_VOICE_SAMPLES.roles;
  const recorded = (window.ADV_AUDIO && ADV_AUDIO.b1c1) || {};
  // picks: { cast: { role: { voice, speed } } }
  let picks = store.get('adv.voices', null) || { cast: {} };
  let player = null, playingCard = null;

  const sampleFile = (role, c) => 'audio/samples/' + role.key + '.' + c.voice + (c.speed ? '.' + c.speed : '') + '.mp3';
  const baseSpeed = (role, c) => c.speed || role.speed;
  const pickOf = role => picks.cast[role.key] || { voice: (recorded.voices || {})[role.key], speed: (recorded.speeds || {})[role.key] };
  const rateOf = role => store.get('adv.voices.rate.' + role.key, 1);

  function isPicked(role, c) {
    const p = pickOf(role);
    return p.voice === c.voice && Math.abs((p.speed || 0) - baseSpeed(role, c) * rateOf(role)) < 0.011;
  }

  function render() {
    document.getElementById('panels').innerHTML = ROLES.map((role, ri) => {
      const open = ri === 0;
      const now = pickOf(role);
      return '<section class="panel card" data-id="' + role.key + '"><button class="panel-head"><h2>' + esc(role.icon + ' ' + role.name) +
        '</h2><span class="pm">' + (open ? '▾' : '▸') + '</span></button><div class="panel-body' + (open ? '' : ' hidden') + '">' +
        '<p class="sample-text">“' + esc(role.text) + '”</p>' +
        '<p class="muted">Picked: <b>' + esc(now.voice || '—') + '</b>' + (now.speed ? ' at speed ' + (+now.speed).toFixed(2) : '') + '</p>' +
        '<label class="speed">🐢 <input type="range" min="0.7" max="1.3" step="0.05" value="' + rateOf(role) + '" data-rate="' + ri + '"> 🐇 <span>×' + rateOf(role).toFixed(2) + '</span></label>' +
        '<div class="cands">' + role.candidates.map((c, ci) =>
          '<div class="cand' + (isPicked(role, c) ? ' picked' : '') + '" data-r="' + ri + '" data-c="' + ci + '">' +
          '<b>' + esc(c.label) + '</b><span class="muted">' + esc(c.note || c.voice) + '</span>' +
          '<div class="row"><button class="btn mint" data-act="play">▶</button><button class="btn" data-act="pick">✓</button></div></div>').join('') +
        '</div></div></section>';
    }).join('');
  }

  function stopPlaying() {
    if (player) { player.onended = null; player.pause(); player = null; }
    if (playingCard) playingCard.classList.remove('playing');
    playingCard = null;
  }

  function play(card, role, c) {
    const again = playingCard === card;
    stopPlaying();
    if (again) return;
    player = new Audio(sampleFile(role, c));
    player.playbackRate = rateOf(role);
    player.preservesPitch = true;
    player.onended = stopPlaying;
    player.play().catch(e => { error('Playing ' + c.voice, e); stopPlaying(); });
    playingCard = card;
    card.classList.add('playing');
  }

  function pick(role, c) {
    picks.cast[role.key] = { voice: c.voice, speed: Math.round(baseSpeed(role, c) * rateOf(role) * 100) / 100 };
    store.set('adv.voices', picks);
    document.getElementById('saveMsg').textContent = 'Not saved yet.';
    render();
  }

  // ---------------------------------------------------------------- saving
  async function save() {
    const msg = document.getElementById('saveMsg');
    store.set('adv.voices', picks);
    msg.textContent = 'Saving…';
    try {
      if (!(await Adv.ready)) Adv.ready = Adv.signIn();   // ask for the family sign-in only now
      if (!(await Adv.ready)) throw new Error('not signed in');
      const body = JSON.stringify(picks, null, 2);
      const rows = await q(Adv.sb.from('adv_entries').select('id').eq('kind', 'setting').eq('title', 'Voices').limit(1));
      if (rows.length) await q(Adv.sb.from('adv_entries').update({ body }).eq('id', rows[0].id));
      else await q(Adv.sb.from('adv_entries').insert({ kind: 'setting', title: 'Voices', body, sort: 52 }));
      msg.textContent = '✅ Saved. The next recording run uses these voices.';
      status('ok', '● Saved');
    } catch (e) {
      error('Saving the picks', e);
      msg.textContent = 'Saved on this iPad only (the database could not be reached).';
    }
  }

  async function loadSaved() {
    try {
      if (!(await Adv.ready)) return;
      const rows = await q(Adv.sb.from('adv_entries').select('body').eq('kind', 'setting').eq('title', 'Voices').limit(1));
      if (rows.length && !store.get('adv.voices', null)) {
        picks = JSON.parse(rows[0].body);
        if (!picks.cast) picks.cast = {};
        render();
      }
      status('ok', '● Connected');
    } catch (e) { error('Loading the saved picks', e); }
  }

  // ---------------------------------------------------------------- start
  Adv.buildChrome();
  render();

  document.querySelector('main').addEventListener('click', ev => {
    const head = ev.target.closest('.panel-head');
    if (head) {
      const body = head.parentElement.querySelector('.panel-body');
      head.querySelector('.pm').textContent = body.classList.toggle('hidden') ? '▸' : '▾';
      return;
    }
    const btn = ev.target.closest('button[data-act]');
    if (!btn) return;
    const card = btn.closest('.cand');
    const role = ROLES[+card.dataset.r], c = role.candidates[+card.dataset.c];
    if (btn.dataset.act === 'play') play(card, role, c); else pick(role, c);
  });
  document.querySelector('main').addEventListener('input', ev => {
    const ri = ev.target.dataset.rate;
    if (ri === undefined) return;
    const role = ROLES[+ri], r = parseFloat(ev.target.value);
    store.set('adv.voices.rate.' + role.key, r);
    ev.target.parentElement.querySelector('span').textContent = '×' + r.toFixed(2);
    if (player) player.playbackRate = r;
  });
  document.getElementById('saveBtn').onclick = save;

  // Listening works without signing in; the form only appears on Save.
  Adv.ready = Adv.signIn({ quiet: true });
  loadSaved();
})();
