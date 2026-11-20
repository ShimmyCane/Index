/* QC keynotes: read the text layer of a vector PDF and run the guideline checks.
   Keynote entry  = a line that starts with a code (letters + digits, e.g. D3) and has words after it.
   Callout        = a line that is only a code (a bubble on the sheet).
   Scanned pages (no text) are reported as "cannot read". */
(function () {
  'use strict';
  const QC = window.QC;
  const CODE_RE = /^([A-Za-z]{1,3})(\d{1,3})$/;
  const RANK = { red: 2, yellow: 1, green: 0 };

  // Lines of text with their position, in PDF points (origin bottom-left).
  QC.extractPage = async page => {
    const vp = page.getViewport({ scale: 1 });
    const tc = await page.getTextContent();
    const items = tc.items.filter(it => it.str && it.str.trim()).map(it => {
      const [, , c, d, e, f] = it.transform;
      const h = it.height || Math.hypot(c, d) || 8;
      return { str: it.str.trim(), x0: e, x1: e + (it.width || 0), y0: f - 0.2 * h, y1: f + 0.8 * h, yb: f, h };
    });
    items.sort((p, q) => q.yb - p.yb || p.x0 - q.x0);
    // Group by height, then split each row where the horizontal gap is wide,
    // so a plan callout and a keynote entry at the same height stay apart.
    const rows = [];
    for (const it of items) {
      const r = rows[rows.length - 1];
      if (r && Math.abs(r.yb - it.yb) < Math.max(2, it.h * 0.5)) r.items.push(it);
      else rows.push({ yb: it.yb, items: [it] });
    }
    const segments = [];
    for (const r of rows) {
      r.items.sort((p, q) => p.x0 - q.x0);
      let cur = [];
      for (const it of r.items) {
        const prev = cur[cur.length - 1];
        if (prev && it.x0 - prev.x1 > Math.max(12, 6 * it.h)) { segments.push(cur); cur = []; }
        cur.push(it);
      }
      if (cur.length) segments.push(cur);
    }
    const lines = segments.map(seg => ({
      text: seg.map(i => i.str).join(' ').replace(/\s+/g, ' ').trim(),
      rect: [Math.min(...seg.map(i => i.x0)), Math.min(...seg.map(i => i.y0)),
        Math.max(...seg.map(i => i.x1)), Math.max(...seg.map(i => i.y1))],
    }));
    return { width: vp.width, height: vp.height, lines };
  };

  QC.scanDocument = async (pdfDoc, guide, strictness) => {
    const pages = [];
    for (let n = 1; n <= pdfDoc.numPages; n++) {
      const page = await pdfDoc.getPage(n);
      pages.push({ num: n, ...(await QC.extractPage(page)) });
    }
    return QC.analyse(pages, guide, strictness);
  };

  // Pure function: pages (from extractPage) + guideline -> findings. Tested without a browser.
  QC.analyse = (pages, guide, strictness) => {
    const C = guide.checks;
    const sev = k => C[k] || 'off';
    const findings = [];
    const entries = [];
    const callouts = [];

    // Colour an item by its reasons. Strict mode turns yellow into red.
    const colourOf = reasons => {
      let worst = 'green';
      for (const r of reasons) {
        const c = strictness === 'strict' && r.colour === 'yellow' ? 'red' : r.colour;
        if (RANK[c] > RANK[worst]) worst = c;
      }
      return worst;
    };

    // Pass 1: find entries and callouts
    for (const pg of pages) {
      if (!pg.lines.length) {
        const colour = sev('noText');
        if (colour !== 'off') findings.push({
          kind: 'page', page: pg.num, code: '', desc: '', colour: colourOf([{ colour }]),
          reasons: [{ check: 'noText', label: QC.CHECK_LABEL.noText, colour, detail: 'No text on this page. It may be a scan: cannot read.' }],
          rect: [0, 0, pg.width, pg.height],
        });
        continue;
      }
      for (const ln of pg.lines) {
        const toks = ln.text.split(' ');
        const m = CODE_RE.exec(toks[0]);
        if (!m) continue;
        if (toks.length === 1) callouts.push({ code: toks[0], page: pg.num, rect: ln.rect });
        else entries.push({ code: toks[0], prefix: m[1], numText: m[2], num: +m[2], desc: toks.slice(1).join(' '), page: pg.num, rect: ln.rect });
      }
    }

    // Pass 2: checks on entries
    const allowed = new Set(QC.splitList(`${guide.prefixes.demolition}, ${guide.prefixes.newWork}`).map(s => s.toUpperCase()));
    const scopeRes = guide.scopes
      .flatMap(s => QC.splitList(guide.scopeWords[s]))
      .map(w => new RegExp('\\b' + QC.escRe(QC.norm(w)) + '\\b'));
    const fireRes = QC.splitList(guide.fireWords).map(w => new RegExp('\\b' + QC.escRe(QC.norm(w)) + '\\b'));
    const approved = guide.approved.map(QC.norm);
    const calloutCodes = new Set(callouts.map(c => c.code));
    const seen = {};
    const lastNum = {};

    for (const e of entries) {
      const reasons = [];
      const add = (check, detail) => {
        const colour = sev(check);
        if (colour !== 'off') reasons.push({ check, label: QC.CHECK_LABEL[check], colour, detail });
      };
      const nd = QC.norm(e.desc);

      if (!allowed.has(e.prefix)) add('badPrefix', `Prefix "${e.prefix}" is not in the guideline`);
      if (e.numText.length < guide.numberDigits.min || e.numText.length > guide.numberDigits.max)
        add('badNumber', `${e.numText} has ${e.numText.length} digit(s); the guideline allows ${guide.numberDigits.min} to ${guide.numberDigits.max}`);

      seen[e.code] = (seen[e.code] || 0) + 1;
      if (seen[e.code] > 1) add('duplicate', `${e.code} is used more than once`);

      if (lastNum[e.prefix] !== undefined && e.num < lastNum[e.prefix])
        add('sequence', `${e.code} comes after ${e.prefix}${lastNum[e.prefix]}`);
      lastNum[e.prefix] = Math.max(lastNum[e.prefix] ?? -1, e.num);

      const words = QC.wordCount(e.desc);
      if (words > guide.maxWords) add('tooLong', `${words} words; the maximum is ${guide.maxWords}`);
      if (guide.upperCase && /[a-z]/.test(e.desc)) add('caseIssue', 'Has lower-case letters; the guideline asks for upper case');

      if (scopeRes.length && !scopeRes.some(r => r.test(nd))) add('missingScopeWord', 'None of the scope words for the selected scopes');
      if (/\bFIRE\b/.test(nd) && fireRes.length && !fireRes.some(r => r.test(nd)))
        add('fireMissing', 'Mentions FIRE but no rating word (e.g. HR or HOUR)');

      if (approved.length && !approved.includes(nd)) {
        let best = { s: 0, t: '' };
        for (const a of approved) {
          const s = QC.similarity(a, nd);
          if (s > best.s) best = { s, t: a };
        }
        if (best.s >= guide.similarity) add('nearApproved', `Close to "${best.t}" (${Math.round(best.s * 100)}% alike)`);
        else add('notApproved', 'Not in the approved phrase list');
      }

      if (!calloutCodes.has(e.code)) add('unusedKeynote', 'No callout on the sheet');

      const colour = colourOf(reasons);
      findings.push({ kind: 'entry', page: e.page, code: e.code, desc: e.desc, colour, reasons, rect: e.rect });
    }

    // Pass 3: callouts with no entry
    const entryCodes = new Set(entries.map(e => e.code));
    for (const c of callouts) {
      if (entryCodes.has(c.code)) continue;
      const colour = sev('undefinedKeynote');
      if (colour === 'off') continue;
      findings.push({
        kind: 'callout', page: c.page, code: c.code, desc: '', colour: colourOf([{ colour }]),
        reasons: [{ check: 'undefinedKeynote', label: QC.CHECK_LABEL.undefinedKeynote, colour, detail: `${c.code} is called out but has no keynote entry` }],
        rect: c.rect,
      });
    }

    findings.forEach((f, i) => f.id = i + 1);
    const summary = {
      pages: pages.length,
      entries: entries.length,
      callouts: callouts.length,
      green: findings.filter(f => f.kind === 'entry' && f.colour === 'green').length,
      yellow: findings.filter(f => f.kind === 'entry' && f.colour === 'yellow').length,
      red: findings.filter(f => f.kind === 'entry' && f.colour === 'red').length,
      undefinedCallouts: findings.filter(f => f.kind === 'callout').length,
      unreadPages: findings.filter(f => f.kind === 'page').length,
    };
    return { findings, summary };
  };
})();
