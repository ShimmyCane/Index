/* QC keynotes: read the text layer of a vector PDF and run the approved guideline checks.
   Keynote row  = Type  Number  CSI  Description, e.g. "Demo 1 02 00 Demolish existing roofing".
                  The CSI code is four digits, written 02 00 or 0200.
   Callout      = a line that is only a number (a bubble on the sheet). Its shape (circle,
                  hexagon, square) is NOT read in this version.
   Scanned pages (no text) are reported as "cannot read". */
(function () {
  'use strict';
  const QC = window.QC;
  const ROW_RE = /^([A-Za-z]+)\s+(\d{1,3})\s+(\d{2}\s?\d{2})\s+(.+)$/;
  const ROW_START_RE = /^([A-Za-z]+)\s+(\d{1,3})(\s|$)/;
  const CALLOUT_RE = /^(\d{1,3})$/;
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
    // Group by height, then split each row where the horizontal gap is wide, so a plan
    // callout and a keynote row at the same height stay apart.
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

  // Longest common subsequence of two word lists; returns a flag per word of `a`.
  QC.alignWords = (a, b) => {
    const n = a.length, m = b.length;
    const L = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++)
      L[i][j] = a[i - 1] === b[j - 1] ? L[i - 1][j - 1] + 1 : Math.max(L[i - 1][j], L[i][j - 1]);
    const same = new Array(n).fill(false);
    let i = n, j = m;
    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) { same[i - 1] = true; i--; j--; }
      else if (L[i - 1][j] >= L[i][j - 1]) i--; else j--;
    }
    return same;
  };

  // Pure function: pages (from extractPage) + guideline -> findings. Tested without a browser.
  QC.analyse = (pages, guide, strictness) => {
    const sev = k => {
      const c = guide.checks[k];
      if (!c || c.status !== 'approved') return 'off';      // drafts never run
      return c.colour || 'off';
    };
    const colourOf = reasons => {
      let worst = 'green';
      for (const r of reasons) {
        const c = strictness === 'strict' && r.colour === 'yellow' ? 'red' : r.colour;
        if (RANK[c] > RANK[worst]) worst = c;
      }
      return worst;
    };
    const findings = [];
    const rows = [];
    const callouts = [];

    // Pass 1: find keynote rows and callouts
    for (const pg of pages) {
      if (!pg.lines.length) {
        const colour = sev('noText');
        if (colour !== 'off') findings.push({
          kind: 'page', page: pg.num, code: '', desc: '', words: null, colour: colourOf([{ colour }]),
          reasons: [{ check: 'noText', label: QC.CHECK_LABEL.noText, colour, detail: 'No text on this page. It may be a scan: cannot read.' }],
          rect: [0, 0, pg.width, pg.height],
        });
        continue;
      }
      for (const ln of pg.lines) {
        const t = ln.text;
        if (CALLOUT_RE.test(t)) { callouts.push({ number: t, page: pg.num, rect: ln.rect }); continue; }
        const full = ROW_RE.exec(t);
        if (full) {
          rows.push({ type: full[1], number: full[2], csi: full[3].replace(/\s/g, ''), desc: full[4], page: pg.num, rect: ln.rect, csiOk: true });
          continue;
        }
        const start = ROW_START_RE.exec(t);
        if (start) // a keynote row that has no CSI code
          rows.push({ type: start[1], number: start[2], csi: '', desc: t.slice(start[0].length).trim(), page: pg.num, rect: ln.rect, csiOk: false });
      }
    }

    // Pass 2: checks on keynote rows
    const types = guide.types.map(t => t.toLowerCase());
    const scopeRes = guide.scopes.flatMap(s => QC.splitList(guide.scopeWords[s]))
      .map(w => new RegExp('\\b' + QC.escRe(QC.norm(w)) + '\\b'));
    const fireRes = QC.splitList(guide.fireWords).map(w => new RegExp('\\b' + QC.escRe(QC.norm(w)) + '\\b'));
    const approvedRaw = guide.approved.map(QC.squash);
    const approvedLoose = guide.approved.map(a => ({ raw: QC.squash(a), loose: QC.loose(a), words: QC.squash(a).split(' ') }));
    const calloutNums = new Set(callouts.map(c => c.number));
    const rowNums = new Set(rows.map(r => r.number));
    const seen = {};
    const lastNum = {};

    for (const r of rows) {
      const reasons = [];
      const add = (check, detail) => {
        const colour = sev(check);
        if (colour !== 'off') reasons.push({ check, label: QC.CHECK_LABEL[check], colour, detail });
      };
      const typeKey = r.type.toLowerCase();
      const code = `${r.type} ${r.number}`;
      const desc = r.desc;

      if (!types.includes(typeKey)) add('badType', `"${r.type}" is not a keynote type in the guideline`);
      if (r.number.length < guide.numberDigits.min || r.number.length > guide.numberDigits.max)
        add('badNumber', `${r.number} has ${r.number.length} digit(s); the guideline allows ${guide.numberDigits.min} to ${guide.numberDigits.max}`);
      if (!r.csiOk || r.csi.length !== 4) add('csi', 'No 4-digit CSI code in the third column');

      const key = typeKey + ' ' + r.number;
      seen[key] = (seen[key] || 0) + 1;
      if (seen[key] > 1) add('duplicate', `${code} is used more than once`);

      if (lastNum[typeKey] !== undefined && +r.number < lastNum[typeKey])
        add('sequence', `${code} comes after ${r.type} ${lastNum[typeKey]}`);
      lastNum[typeKey] = Math.max(lastNum[typeKey] ?? -1, +r.number);

      const words = QC.wordCount(desc);
      if (words > guide.maxWords) add('tooLong', `${words} words; the maximum is ${guide.maxWords}`);
      if (guide.upperCase && /[a-z]/.test(desc)) add('caseIssue', 'Has lower-case letters; the guideline asks for upper case');

      const nd = QC.norm(desc);
      if (scopeRes.length && !scopeRes.some(x => x.test(nd))) add('missingScopeWord', 'None of the scope words for the selected scopes');
      if (/\bFIRE\b/.test(nd) && fireRes.length && !fireRes.some(x => x.test(nd)))
        add('fireMissing', 'Mentions FIRE but no rating word (e.g. HR or HOUR)');

      // Word colours: how much of the wording agrees with the nearest approved phrase.
      let wordMarks = null;
      if (approvedRaw.length) {
        const raw = QC.squash(desc);
        if (approvedRaw.includes(raw)) {
          wordMarks = raw.split(' ').map(t => ({ t, c: 'green' }));
        } else {
          const loose = QC.loose(desc);
          const hit = approvedLoose.find(a => a.loose === loose);
          if (hit) add('punctCase', `Approved as "${hit.raw}": check the capitals and punctuation`);
          let best = { s: 0, a: null };
          for (const a of approvedLoose) {
            const s = QC.similarity(a.loose, loose);
            if (s > best.s) best = { s, a };
          }
          if (!hit) {
            if (best.a && best.s >= guide.similarity) add('nearApproved', `Close to "${best.a.raw}" (${Math.round(best.s * 100)}% alike)`);
            else add('notApproved', 'Not in the approved phrase list');
          }
          const own = raw.split(' ');
          const agree = best.a ? QC.alignWords(own.map(w => QC.loose(w)), best.a.words.map(w => QC.loose(w))) : own.map(() => false);
          wordMarks = own.map((t, i) => ({ t, c: agree[i] ? 'green' : 'yellow' }));
        }
      }

      if (!calloutNums.has(r.number)) add('unusedKeynote', 'No callout with this number on the sheet');

      const colour = colourOf(reasons);
      findings.push({ kind: 'entry', page: r.page, code, number: r.number, type: r.type, csi: r.csi, desc, words: wordMarks, colour, reasons, rect: r.rect });
    }

    // Pass 3: callouts with no keynote row
    for (const c of callouts) {
      if (rowNums.has(c.number)) continue;
      const colour = sev('undefinedKeynote');
      if (colour === 'off') continue;
      findings.push({
        kind: 'callout', page: c.page, code: '#' + c.number, desc: '', words: null, colour: colourOf([{ colour }]),
        reasons: [{ check: 'undefinedKeynote', label: QC.CHECK_LABEL.undefinedKeynote, colour, detail: `Callout ${c.number} has no keynote row` }],
        rect: c.rect,
      });
    }

    findings.forEach((f, i) => f.id = i + 1);
    const summary = {
      pages: pages.length,
      entries: rows.length,
      callouts: callouts.length,
      green: findings.filter(f => f.kind === 'entry' && f.colour === 'green').length,
      yellow: findings.filter(f => f.kind === 'entry' && f.colour === 'yellow').length,
      red: findings.filter(f => f.kind === 'entry' && f.colour === 'red').length,
      undefinedCallouts: findings.filter(f => f.kind === 'callout').length,
      unreadPages: findings.filter(f => f.kind === 'page').length,
    };
    return { findings, summary, calloutRects: callouts };
  };
})();
