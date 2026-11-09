/* Bar Glide — version and database settings.
 * Publishable key only: safe in browser code, protected by row-level security.
 * Never put a service-role or secret key in this file or anywhere in the repo. */
window.BG = window.BG || {};
window.BG.VERSION = '0.1.0';
window.BG.CHANGES = [
  '0.1.0 · First pour: 4 bars (3 for a quick game), customers in steps, sliding mugs, empties to catch, breaks with an uh-oh, the owner’s ending, ⚙️ with notes, scores and the family database.'
];
window.BG.DB = {
  url: 'https://twvqvutrcobedvuhnzxq.supabase.co',
  key: 'sb_publishable_eqUo8HEdEB1hMQM4CpSVqA_9i6b0qCo',
  tables: ['bglide_scores', 'bglide_notes']
};
