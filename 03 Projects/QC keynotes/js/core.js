/* QC keynotes: shared helpers. Plain script, no build step, no network. */
(function () {
  'use strict';
  const QC = (window.QC = window.QC || {});

  QC.norm = s => String(s || '').replace(/\s+/g, ' ').trim().toUpperCase();
  QC.wordCount = s => String(s || '').trim().split(/\s+/).filter(Boolean).length;
  QC.lines = s => String(s || '').split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  QC.splitList = s => String(s || '').split(/[,\n]+/).map(x => x.trim()).filter(Boolean);
  QC.escRe = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  QC.esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  QC.levenshtein = (a, b) => {
    const m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[n];
  };
  // 1 = identical, 0 = nothing alike. Case and extra spaces are ignored.
  QC.similarity = (a, b) => {
    const A = QC.norm(a), B = QC.norm(b);
    const max = Math.max(A.length, B.length);
    return max ? 1 - QC.levenshtein(A, B) / max : 1;
  };

  // Replaced by app.js once the error panel exists.
  QC.logError = msg => console.warn('[QC]', msg);
})();
