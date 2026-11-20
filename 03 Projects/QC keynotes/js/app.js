/* QC keynotes: wiring for the four steps, the ⚙️ panel and the error panel. */
(function () {
  'use strict';
  const QC = window.QC;
  const $ = id => document.getElementById(id);
  const SETTINGS_KEY = 'qckeynotes.settings';
  const GUIDE_KEY = 'qckeynotes.guideline';
  const DEFAULTS = { strictness: 'standard', findings: false, comments: true, dark: false, showErrors: false, cloud: 'local' };

  // ---------- errors (bottom panel, opt-in) ----------
  const errors = [];
  let settings = { ...DEFAULTS };
  function renderErrors() {
    const box = $('errorsPanel');
    box.hidden = !settings.showErrors;
    box.textContent = errors.length ? errors.join('\n') : 'No problems so far.';
  }
  QC.logError = msg => { errors.push(new Date().toLocaleTimeString() + '  ' + msg); renderErrors(); };
  window.addEventListener('error', e => QC.logError(e.message));
  window.addEventListener('unhandledrejection', e => QC.logError(String((e.reason && e.reason.message) || e.reason)));

  // ---------- settings ----------
  try { settings = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') }; }
  catch (e) { QC.logError('Settings could not be read: ' + e.message); }
  const saveSettings = () => {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }
    catch (e) { QC.logError('Settings could not be saved: ' + e.message); }
  };
  function applyTheme() { document.documentElement.setAttribute('data-theme', settings.dark ? 'dark' : 'light'); }
  function renderSettings() {
    document.querySelectorAll('.seg[data-key]').forEach(seg => {
      const v = String(settings[seg.dataset.key]);
      seg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
    });
    document.querySelectorAll('#cloudSeg button').forEach(b => b.classList.toggle('on', b.dataset.v === settings.cloud));
    $('showErrors').checked = !!settings.showErrors;
    $('optFindings').checked = !!settings.findings;
    $('optComments').checked = !!settings.comments;
    $('optDark').checked = !!settings.dark;
    renderErrors();
  }

  // ---------- state ----------
  let pdfBytes = null;   // Uint8Array of the loaded PDF, memory only
  let pdfDoc = null;     // pdf.js document
  let fileName = '';
  let findings = [];
  let summary = null;
  let previewPage = 1;
  let guide = null;
  let keepRects = [];   // symbols and legend, kept at full strength in the preview

  // ---------- step 1: guideline ----------
  QC.buildGuideForm();
  let saveTimer = null;
  function currentGuide() { return QC.readForm(settings.cloud); }
  function saveGuide(msg) {
    guide = currentGuide();
    try { localStorage.setItem(GUIDE_KEY, JSON.stringify(guide)); $('saveMsg').textContent = msg || 'Saved in this browser.'; }
    catch (e) { QC.logError('Guideline could not be saved: ' + e.message); $('saveMsg').textContent = 'Not saved: browser storage is blocked. Use Export guideline file.'; }
    $('tag1').textContent = QC.guideSummary(guide);
  }
  function queueSave() { clearTimeout(saveTimer); saveTimer = setTimeout(() => saveGuide(), 350); }
  function loadGuide() {
    try {
      const raw = localStorage.getItem(GUIDE_KEY);
      guide = QC.normalizeGuide(raw ? JSON.parse(raw) : null);
    } catch (e) {
      QC.logError('Saved guideline could not be read: ' + e.message);
      guide = QC.normalizeGuide(null);
    }
    QC.writeForm(guide);
    $('tag1').textContent = QC.guideSummary(guide);
  }
  document.querySelectorAll('#step1 input, #step1 textarea, #step1 select').forEach(el => {
    el.addEventListener('input', queueSave);
    el.addEventListener('change', queueSave);
  });
  $('saveG').addEventListener('click', () => { clearTimeout(saveTimer); saveGuide(); });
  $('exportG').addEventListener('click', () => {
    try {
      const g = currentGuide();
      const safe = (g.name || 'keynote-guideline').replace(/[^\w\- ]+/g, '').trim() || 'keynote-guideline';
      download(new Blob([JSON.stringify(g, null, 2)], { type: 'application/json' }), safe + '.json');
      $('saveMsg').textContent = 'Exported. Keep the file on this computer unless it is marked safe to cloud.';
    } catch (e) { QC.logError('Export failed: ' + e.message); }
  });
  $('importG').addEventListener('change', e => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const g = QC.normalizeGuide(JSON.parse(reader.result));
        QC.writeForm(g);
        settings.cloud = g.cloud; saveSettings(); renderSettings();
        saveGuide('Imported and saved.');
      } catch (err) { QC.logError('Import failed: ' + err.message); $('saveMsg').textContent = 'That file is not a keynote guideline.'; }
    };
    reader.readAsText(f);
  });
  $('clearG').addEventListener('click', () => {
    if (!confirm('Clear the guideline form? The saved copy is replaced when you save.')) return;
    QC.writeForm(QC.normalizeGuide(null));
    saveGuide('Form cleared and saved.');
  });
  document.querySelectorAll('#cloudSeg button').forEach(b => b.addEventListener('click', () => {
    settings.cloud = b.dataset.v; saveSettings(); renderSettings(); saveGuide();
  }));

  // ---------- step 2: upload ----------
  // One path for an uploaded file and the sample: read the PDF, then scan it.
  async function loadPdf(bytes, name) {
    if (!window.pdfjsLib) throw new Error('the PDF reader did not load (vendor/pdf.min.js)');
    pdfDoc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
    pdfBytes = bytes;
    fileName = name;
    findings = []; summary = null;
    const withText = await countPagesWithText(pdfDoc);
    $('fileInfo').textContent = `${fileName}: ${pdfDoc.numPages} page(s), ${withText} with a readable text layer`;
    $('tag2').textContent = `${pdfDoc.numPages} page(s) loaded`;
    $('scanBtn').disabled = false;
    $('tag3').textContent = 'reading…';
    $('exportBtn').disabled = true; $('csvBtn').disabled = true;
    $('results').hidden = true; $('chips').hidden = true; $('howto').hidden = true;
    $('tag4').textContent = 'after a scan';
    document.getElementById('step2').open = false;
    document.getElementById('step3').open = true;
    await runScan();
  }

  $('pdfIn').addEventListener('change', async e => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    try {
      await loadPdf(new Uint8Array(await f.arrayBuffer()), f.name);
    } catch (err) {
      QC.logError('Could not open the PDF: ' + err.message);
      $('fileInfo').textContent = 'That file could not be opened as a PDF.';
    }
  });

  // "Load sample": the synthetic guideline and sheet from samples/, then the scan.
  $('loadSample').addEventListener('click', async () => {
    const msg = $('sampleMsg');
    msg.textContent = 'Loading the sample…';
    try {
      const [gRes, pRes] = await Promise.all([fetch('samples/sample_guideline.json'), fetch('samples/sample_sheet.pdf')]);
      if (!gRes.ok || !pRes.ok) throw new Error('the sample files could not be fetched (open the page over http, not as a file)');
      const g = QC.normalizeGuide(await gRes.json());
      QC.writeForm(g);
      settings.cloud = g.cloud; saveSettings(); renderSettings();
      saveGuide('Sample guideline loaded and saved.');
      await loadPdf(new Uint8Array(await pRes.arrayBuffer()), 'sample_sheet.pdf');
      msg.textContent = 'Sample loaded: a fictional two-page sheet against a fictional guideline.';
    } catch (err) {
      QC.logError('Sample: ' + err.message);
      msg.textContent = 'The sample did not load: ' + err.message;
    }
  });

  async function countPagesWithText(doc) {
    let n = 0;
    for (let i = 1; i <= doc.numPages; i++) {
      const tc = await (await doc.getPage(i)).getTextContent();
      if (tc.items.some(it => it.str && it.str.trim())) n++;
    }
    return n;
  }

  // ---------- step 3: scan (runs on upload, and again on request) ----------
  async function runScan() {
    if (!pdfDoc) return;
    try {
      guide = currentGuide();
      const live = Object.values(guide.checks).some(v => v.status === 'approved' && v.colour !== 'off');
      if (!live) {
        $('scanInfo').textContent = 'No rule is approved yet. Approve rules in step 1 to mark the drawing.';
        return;
      }
      $('scanBtn').disabled = true;
      $('scanInfo').textContent = 'Reading the drawing…';
      const result = await QC.scanDocument(pdfDoc, guide, settings.strictness);
      findings = result.findings;
      summary = result.summary;
      keepRects = result.keep;
      renderResults();
      $('scanInfo').textContent = `Done. ${summary.entries} keynote rows, ${summary.callouts} callouts.`;
    } catch (err) {
      QC.logError('Scan failed: ' + err.message);
      $('scanInfo').textContent = 'The scan failed. See the errors panel.';
    } finally {
      $('scanBtn').disabled = false;
    }
  }
  $('scanBtn').addEventListener('click', runScan);

  function renderResults() {
    $('results').hidden = false;
    $('chips').hidden = false;
    $('howto').hidden = false;
    $('cG').textContent = `Green: ${summary.green}`;
    $('cY').textContent = `Yellow: ${summary.yellow}`;
    $('cR').textContent = `Red: ${summary.red + summary.undefinedCallouts}`;
    $('cC').textContent = `Undefined callouts: ${summary.undefinedCallouts}`;
    $('howto').innerHTML = `<b>How to read this:</b> ${summary.entries} keynote entries were found. ` +
      `${summary.green} match the guideline (green), ${summary.yellow} are questionable (yellow), ` +
      `${summary.red} break a rule (red). ${summary.undefinedCallouts} callout(s) on the sheet have no keynote entry (red box). ` +
      `${summary.unreadPages} page(s) had no text layer and cannot be read (yellow box). ` +
      `Each row lists the reasons. Click a row to see it on the sheet.`;

    const order = { red: 0, yellow: 1, green: 2 };
    const sorted = [...findings].sort((a, b) => a.page - b.page || order[a.colour] - order[b.colour]);
    $('findBody').innerHTML = sorted.map(f => {
      const why = f.reasons.map(r => `<div><span class="muted">${QC.esc(r.label)}:</span> ${QC.esc(r.detail)}</div>`).join('') || 'Matches the guideline';
      const words = f.words ? f.words.map(w => `<span class="w${w.c === 'green' ? 'g' : (w.c === 'yellow' ? 'y' : 'r')}">${QC.esc(w.t)}</span>`).join(' ') : QC.esc(f.desc);
      const item = f.kind === 'page' ? 'Page' : QC.esc(f.code);
      return `<tr data-id="${f.id}"><td><span class="dot ${f.colour}"></span>${f.colour}</td><td>${f.page}</td><td>${item}<div>${words}</div></td><td>${why}</td></tr>`;
    }).join('') || '<tr><td colspan="4">Nothing found to mark.</td></tr>';

    const pageSel = $('pageSel');
    pageSel.innerHTML = Array.from({ length: pdfDoc.numPages }, (_, i) => `<option value="${i + 1}">Page ${i + 1}</option>`).join('');
    const firstMarked = findings.find(f => f.colour === 'red') || findings.find(f => f.colour === 'yellow') || findings[0];
    previewPage = firstMarked ? firstMarked.page : 1;
    showPreview();

    $('exportBtn').disabled = false;
    $('csvBtn').disabled = false;
    document.getElementById('step3').open = true;
    document.getElementById('step4').open = true;
    $('tag3').textContent = `${summary.green} green · ${summary.yellow} yellow · ${summary.red + summary.undefinedCallouts} red`;
    $('tag4').textContent = 'ready';
    $('exportInfo').textContent = `${findings.length} mark(s) ready.`;
  }

  async function showPreview() {
    if (!pdfDoc) return;
    $('pageSel').value = String(previewPage);
    const count = findings.filter(f => f.page === previewPage).length;
    $('pageInfo').textContent = `${count} mark(s) on this page`;
    const size = Math.min(760, ($('preview').parentElement.clientWidth || 700) - 16);
    await QC.renderPreview(pdfDoc, previewPage, $('preview'), findings, size, true, keepRects);
  }
  $('pageSel').addEventListener('change', e => { previewPage = +e.target.value; showPreview(); });
  $('findBody').addEventListener('click', e => {
    const tr = e.target.closest('tr[data-id]');
    if (!tr) return;
    const f = findings.find(x => x.id === +tr.dataset.id);
    if (!f) return;
    document.querySelectorAll('#findBody tr').forEach(r => r.classList.remove('pick'));
    tr.classList.add('pick');
    previewPage = f.page;
    showPreview();
    $('preview').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  window.addEventListener('resize', () => { if (summary) showPreview(); });

  // ---------- step 4: export ----------
  function download(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  const baseName = () => (fileName.replace(/\.pdf$/i, '').replace(/[^\w\- ]+/g, '').trim() || 'drawing');

  $('exportBtn').addEventListener('click', async () => {
    try {
      $('exportBtn').disabled = true;
      $('exportInfo').textContent = 'Writing the marked-up PDF…';
      const { bytes, count } = await QC.exportMarked(pdfBytes, findings, { comments: settings.comments });
      download(new Blob([bytes], { type: 'application/pdf' }), baseName() + '_QC_marked.pdf');
      $('exportInfo').textContent = `Exported ${count} mark(s).`;
      if (settings.findings) downloadCSV();
    } catch (err) {
      QC.logError('Export failed: ' + err.message);
      $('exportInfo').textContent = 'The export failed. See the errors panel.';
    } finally {
      $('exportBtn').disabled = false;
    }
  });
  function downloadCSV() {
    download(new Blob([QC.findingsCSV(findings, fileName)], { type: 'text/csv' }), baseName() + '_QC_findings.csv');
  }
  $('csvBtn').addEventListener('click', downloadCSV);

  // ---------- ⚙️ ----------
  const gear = $('gear'), drawer = $('drawer');
  const setOpen = open => { drawer.hidden = !open; gear.setAttribute('aria-expanded', String(open)); };
  gear.addEventListener('click', () => setOpen(drawer.hidden));
  $('closeDrawer').addEventListener('click', () => setOpen(false));
  document.querySelectorAll('.seg[data-key] button').forEach(b => b.addEventListener('click', () => {
    settings[b.parentElement.dataset.key] = b.dataset.v; saveSettings(); renderSettings();
    if (summary) { /* strictness changes the colours: scan again to apply it */ $('scanInfo').textContent = 'Strictness changed. Scan again to apply it.'; }
  }));
  $('showErrors').addEventListener('change', e => { settings.showErrors = e.target.checked; saveSettings(); renderErrors(); });
  $('optFindings').addEventListener('change', e => { settings.findings = e.target.checked; saveSettings(); });
  $('optComments').addEventListener('change', e => { settings.comments = e.target.checked; saveSettings(); });
  $('optDark').addEventListener('change', e => { settings.dark = e.target.checked; saveSettings(); applyTheme(); });

  // ---------- start ----------
  if (window.pdfjsLib) pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdf.worker.min.js';
  else QC.logError('PDF reader missing: vendor/pdf.min.js did not load.');
  applyTheme();
  renderSettings();
  loadGuide();
  QC.Feedback.init();
  setOpen(false);
})();
