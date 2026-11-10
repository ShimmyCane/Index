// Voice candidates for the voice test page (voices.html). tools/make_voice.py --samples bakes one short
// sample per candidate into audio/samples/<role>.<voice>.mp3. The pick is saved in the "Voices" setting
// entry (adv_entries), which the recorder uses for every chapter it records.
window.ADV_VOICE_SAMPLES = {
  roles: [
    { key: 'narrator', name: 'Storyteller', icon: '📜', speed: 0.92,
      text: 'Far away, in a different place and a different time, there is a forest so old that the trees have forgotten how young they once were. And in that forest, on a bed of soft green moss, you open your eyes.',
      candidates: [
        { voice: 'bm_fable', label: 'Fable', note: 'British, warm, a storyteller (now)' },
        { voice: 'bm_george', label: 'George', note: 'British, older, deep' },
        { voice: 'bm_lewis', label: 'Lewis', note: 'British, low and slow' },
        { voice: 'bm_daniel', label: 'Daniel', note: 'British, calm' },
        { voice: 'bf_emma', label: 'Emma', note: 'British, clear and kind' },
        { voice: 'bf_isabella', label: 'Isabella', note: 'British, soft' },
        { voice: 'bf_alice', label: 'Alice', note: 'British, bright' },
        { voice: 'bf_lily', label: 'Lily', note: 'British, young' },
        { voice: 'af_heart', label: 'Heart', note: 'American, warm' },
        { voice: 'af_bella', label: 'Bella', note: 'American, lively' },
        { voice: 'am_michael', label: 'Michael', note: 'American, friendly' },
        { voice: 'am_onyx', label: 'Onyx', note: 'American, deep' }
      ] },
    { key: 'you', name: 'You (Athena)', icon: '🌱', speed: 0.95,
      text: 'Hello? Is anybody there?',
      candidates: [
        { voice: 'af_river', label: 'River', note: 'American, unsure (now)' },
        { voice: 'af_sky', label: 'Sky', note: 'American, young' },
        { voice: 'bf_lily', label: 'Lily', note: 'British, young' },
        { voice: 'af_nova', label: 'Nova', note: 'American, clear' }
      ] },
    { key: 'fox', name: 'Whisperfox', icon: '🦊', speed: 1.08,
      text: 'Anybody there? Anybody there?',
      candidates: [
        { voice: 'af_nicole', label: 'Nicole', note: 'whispery (now)' },
        { voice: 'am_puck', label: 'Puck', note: 'playful' },
        { voice: 'af_kore', label: 'Kore', note: 'sly' }
      ] },
    { key: 'owl', name: 'Grandmother Owl', icon: '🦉', speed: 0.75,
      text: 'Who? Whooo? Who are you? Whooo?',
      candidates: [
        { voice: 'bf_alice', label: 'Alice, slow', note: 'speed 0.75 (now)' },
        { voice: 'bf_alice', speed: 0.9, label: 'Alice, quicker', note: 'speed 0.9' },
        { voice: 'bf_isabella', speed: 0.8, label: 'Isabella', note: 'soft, speed 0.8' },
        { voice: 'bf_emma', speed: 0.85, label: 'Emma', note: 'speed 0.85' }
      ] }
  ]
};
