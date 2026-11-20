// Headless check of all four steps with the synthetic sheet and guideline.
// Usage: node test/smoke.js <outDir>   (server must serve this folder on PORT, default 8765)
// Needs playwright (global) and Chromium at /opt/pw-browsers/chromium.
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const out = path.resolve(process.argv[2] || '/tmp/qc-test');
const base = `http://localhost:${process.env.PORT || 8765}/index.html`;
fs.mkdirSync(out, { recursive: true });

const EXPECT = { // keynote text -> colour (numbering is off, so rows are matched by their text)
  'REMOVE EXISTING CERAMIC WALL TILE AT RESTROOM WALLS': 'green',
  'remove existing lavatory faucet and supply lines': 'yellow',
  'REMOVE EXISTING PARTITION AND DOOR': 'green',
  'REMOVE EXISTING TOWEL DISPENSER': 'yellow',
  'REMOVE EXISTING FIRE-RATED DOOR ASSEMBLY': 'red',
  'Remove existing partition and door.': 'yellow',
  'REMOVE EXISTING WALL TILES AT SHOWER AREA': 'yellow',
  'INSTALL NEW ACCESSIBLE LAVATORY, SEE DETAIL': 'yellow',
  'INSTALL NEW GRAB BAR, 36 INCH LONG': 'green',
  'INSTALL NEW 1-HR FIRE-RATED PARTITION': 'green',
  'install new towel holder': 'yellow',
  'INSTALL NEW DOOR HARDWARE': 'yellow',
  'INSTALL NEW SIGNAGE': 'yellow',
};
const fails = [];
const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fails.push(msg); };

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 900 }, acceptDownloads: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });

  await page.goto(base, { waitUntil: 'load' });
  await page.screenshot({ path: path.join(out, '1-start.png'), fullPage: true });

  // Step 1: import the synthetic guideline
  await page.setInputFiles('#importG', path.join(root, 'test/synthetic_guideline.json'));
  await page.waitForFunction(() => document.getElementById('tag1').textContent.includes('SYNTHETIC'));
  check(true, 'step 1: guideline imported');
  await page.screenshot({ path: path.join(out, '2-guideline.png'), fullPage: true });

  // Step 2: upload the synthetic PDF
  await page.setInputFiles('#pdfIn', path.join(root, 'test/synthetic_restroom_set.pdf'));
  await page.waitForFunction(() => document.getElementById('fileInfo').textContent.includes('1 page'));
  check(true, 'step 2: PDF loaded: ' + (await page.textContent('#fileInfo')));

  // Step 3: scan
  // the scan runs on upload; 'Scan again' runs it once more
  await page.waitForFunction(() => !document.getElementById('chips').hidden);
  await page.click('#scanBtn');
  await page.waitForFunction(() => !document.getElementById('scanBtn').disabled);
  const chips = await page.$$eval('#chips .chip', els => els.map(e => e.textContent.trim()));
  console.log('chips:', chips.join(' | '));
  check(chips[0] === 'Green: 4', 'green count 4');
  check(chips[1] === 'Yellow: 8', 'yellow count 8');
  check(chips[2] === 'Red: 1', 'red count 1 (fire rating)');
  check(chips[3] === 'Undefined callouts: 0', 'no undefined callouts (numbering off)');

  const rows = await page.$$eval('#findBody tr[data-id]', trs => trs.map(tr => {
    const cells = tr.querySelectorAll('td');
    const desc = cells[2].querySelector('div').textContent.trim();
    return { colour: cells[0].textContent.trim(), desc, why: cells[3].textContent.trim() };
  }));
  const got = {};
  for (const r of rows) got[r.desc] = r.colour;
  for (const [text, colour] of Object.entries(EXPECT)) {
    check(got[text] === colour, `"${text}" is ${colour} (got ${got[text]})`);
  }
  check(rows.length === 13, `13 marks (keynote rows; "Note 5" is not a keynote type and is not read) (got ${rows.length})`);

  // Click a red row: the preview should move to page 1 with that row picked
  await page.click('#findBody tr[data-id] >> nth=0');
  check(await page.$eval('#findBody tr.pick', e => !!e), 'row click picks the row');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(out, '3-scan.png'), fullPage: true });

  // Step 4: export with CSV on (set in ⚙️)
  await page.click('#gear');
  await page.check('#optFindings');
  await page.click('#closeDrawer');
  const downloads = [];
  page.on('download', d => downloads.push(d));
  await page.click('#exportBtn');
  await page.waitForFunction(() => document.getElementById('exportInfo').textContent.startsWith('Exported'));
  await page.waitForTimeout(500);
  check(downloads.length === 2, `two downloads: PDF and CSV (got ${downloads.length})`);
  for (const d of downloads) await d.saveAs(path.join(out, d.suggestedFilename()));
  console.log('downloads:', downloads.map(d => d.suggestedFilename()).join(', '));
  const pdfName = downloads.map(d => d.suggestedFilename()).find(n => n.endsWith('.pdf'));
  await page.screenshot({ path: path.join(out, '4-export.png'), fullPage: true });

  // Visual check of the exported file: render it with pdf.js in the browser (annotations on)
  const exported = fs.readFileSync(path.join(out, pdfName)).toString('base64');
  const annotInfo = await page.evaluate(async b64 => {
    const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const doc = await pdfjsLib.getDocument({ data: bin }).promise;
    const pg = await doc.getPage(1);
    const annots = await pg.getAnnotations();
    const tc = await pg.getTextContent();
    const text = tc.items.map(i => i.str).join(' ');
    const vp = pg.getViewport({ scale: 1.6 });
    const canvas = document.createElement('canvas');
    canvas.width = vp.width; canvas.height = vp.height; canvas.id = 'exportedView';
    document.body.appendChild(canvas);
    await pg.render({ canvasContext: canvas.getContext('2d'), viewport: vp, annotationMode: pdfjsLib.AnnotationMode.ENABLE_STORAGE }).promise;
    return { annots: annots.map(a => ({ subtype: a.subtype, contents: a.contentsObj && a.contentsObj.str || a.contents || '' })), hasText: text.includes('Demo') && text.includes('REMOVE EXISTING') };
  }, exported);
  console.log('annotations in exported file:', annotInfo.annots.length, annotInfo.annots.map(a => a.subtype).join(','));
  check(annotInfo.annots.length === 13, `13 annotations (got ${annotInfo.annots.length})`);
  check(annotInfo.hasText, 'exported PDF keeps selectable text (not flattened)');
  const sampleComment = annotInfo.annots.find(a => a.contents.includes('RED'));
  check(!!sampleComment, 'annotations carry a comment with the colour');
  const cv = await page.$('#exportedView');
  await cv.screenshot({ path: path.join(out, '5-exported-page.png') });
  await page.evaluate(() => document.getElementById('exportedView').remove()); // test-only canvas, would widen the page

  // Mobile width: no horizontal scroll, and the ⚙️ does not hide the scan controls
  for (const [w, h] of [[390, 844], [768, 1024]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(300);
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    check(scroll <= 0, `no horizontal scroll at ${w}px (overflow ${scroll})`);
    await page.screenshot({ path: path.join(out, `6-mobile-${w}.png`), fullPage: false });
  }

  // Notes for improvement: saved on this device, kept after reload, and the database check says so when signed out
  await page.click('#gear');
  await page.fill('#noteText', 'Test note: make the scan button bigger');
  await page.click('#noteSave');
  check((await page.textContent('#noteCount')).includes('1 note'), 'note saved on this device');
  await page.click('#dbCheck');
  await page.waitForFunction(() => document.getElementById('dbCheckOut').textContent.includes('this device only'));
  check(true, 'database check says this device only when signed out');
  await page.click('#closeDrawer');

  // Reload keeps the guideline (saved in this browser)
  await page.setViewportSize({ width: 1180, height: 900 });
  await page.reload({ waitUntil: 'load' });
  check((await page.inputValue('#gName')).includes('SYNTHETIC'), 'guideline name kept after reload');
  await page.click('#gear');
  check((await page.textContent('#noteCount')).includes('1 note'), 'note kept after reload');
  await page.click('#closeDrawer');

  // The sandbox browser gets a 401 from the live database health check (curl gets 200). It is the
  // one expected network message; anything else is a failure.
  const real = errs.filter(e => !/Failed to load resource: the server responded with a status of 401/.test(e));
  check(real.length === 0, 'no console or page errors' + (real.length ? ': ' + real.join(' | ') : '') + ` (${errs.length - real.length} known sandbox 401 from the database check)`);
  await browser.close();
  console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
