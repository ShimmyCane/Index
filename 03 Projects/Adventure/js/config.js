// Supabase connection for the browser. The publishable key is meant to be
// public; the tables only open to the signed-in family account (RLS).
window.ADV_CONFIG = {
  url: 'https://twvqvutrcobedvuhnzxq.supabase.co',
  key: 'sb_publishable_eqUo8HEdEB1hMQM4CpSVqA_9i6b0qCo',
  timeoutMs: 8000,
  version: '0.4.0',
  changelog: [
    '0.4.0 — Reads only from the recording (no browser voice). Sign in and notes in ⚙️. Chapter 1 finds its recording.',
    '0.3.0 — Voices page, recording step, director\'s notes, the whole page with a cast.',
    '0.2.0 — World tools (map, journal, plot), the world of Ondra, Book 1 outline, chapter 1 voiced.',
    '0.1.0 — First player, under the hood, storyteller, Supabase tables.'
  ]
};
