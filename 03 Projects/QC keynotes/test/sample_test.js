// "Load sample" check: the button loads the synthetic guideline and sheet and scans them.
// Usage: node test/sample_test.js <outDir>   (serve this folder on PORT, default 8765)
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const out = path.resolve(process.argv[2] || '/tmp/qc-sample');
const base = `http://localhost:${process.env.PORT || 8765}/index.html`;
fs.mkdirSync(out, { recursive: true });
const fails = [];
const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fails.push(msg); };

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1180, height: 900 }, deviceScaleFactor: 2 });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });

  await page.goto(base, { waitUntil: 'load' });
  await page.screenshot({ path: path.join(out, '0-top-right-button.png'), clip: { x: 800, y: 0, width: 380, height: 120 } });
  await page.click('#loadSample');
  await page.waitForFunction(() => !document.getElementById('chips').hidden, null, { timeout: 60000 });
  await page.waitForTimeout(800);

  const chips = await page.$$eval('#chips .chip', els => els.map(e => e.textContent.trim()));
  console.log('chips:', chips.join(' | '));
  check(chips[0] === 'Green: 5', 'green 5 (Demo 1, Demo 3, New 12, New 14, New 15)');
  check(chips[1] === 'Yellow: 5', 'yellow 5 (Demo 2, Demo 5, New 11, New 16, New 17)');
  check(chips[2] === 'Red: 3', 'red 3 (Demo 4 fire rating, New 18 no CSI, callout 30)');
  check(chips[3] === 'Undefined callouts: 1', 'one undefined callout (30)');
  check(/page 1 of|Page 1/i.test(await page.textContent('#pageSel').catch(() => '')) || (await page.$$eval('#pageSel option', o => o.length)) === 2, 'two pages in the page picker');

  const rows = await page.$$eval('#findBody tr[data-id]', trs => trs.map(tr => {
    const c = tr.querySelectorAll('td');
    return { code: c[2].childNodes[0].textContent.trim(), colour: c[0].textContent.trim() };
  }));
  const want = { 'Demo 1': 'green', 'Demo 2': 'yellow', 'Demo 3': 'green', 'Demo 4': 'red', 'Demo 5': 'yellow', 'New 11': 'yellow',
    'New 12': 'green', 'New 14': 'green', 'New 15': 'green', 'New 16': 'yellow', 'New 17': 'yellow', 'New 18': 'red', '#30': 'red' };
  for (const [code, colour] of Object.entries(want)) {
    const r = rows.find(x => x.code === code);
    check(!!r && r.colour === colour, `${code} is ${colour} (got ${r ? r.colour : 'missing'})`);
  }
  check(rows.length === 13, `13 marks: 12 keynote rows + 1 callout (got ${rows.length})`);

  await page.screenshot({ path: path.join(out, '1-sample-loaded.png'), fullPage: true });
  check(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await browser.close();
  console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
