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
  check(chips[0] === 'Green: 5', 'green 5 (exact approved phrases)');
  check(chips[1] === 'Yellow: 6', 'yellow 6 (not approved, or no scope word)');
  check(chips[2] === 'Red: 2', 'red 2 (FIRE with no rating, BASH is not an approved verb)');
  check(chips[3] === 'Undefined callouts: 0', 'no undefined callouts (numbering is off by default)');
  check((await page.$$eval('#pageSel option', o => o.length)) === 2, 'two pages in the page picker');

  // Rows are matched by their keynote text (the sheet has no numbers)
  const rows = await page.$$eval('#findBody tr[data-id]', trs => trs.map(tr => {
    const c = tr.querySelectorAll('td');
    return { text: c[2].querySelector('div').textContent.trim(), colour: c[0].textContent.trim() };
  }));
  const want = {
    'REMOVE EXISTING CERAMIC WALL TILE AT RESTROOM WALLS': 'green',
    'REMOVE EXISTING LAVATORY FAUCET AND SUPPLY LINES': 'yellow',
    'REMOVE EXISTING PARTITION AND DOOR': 'green',
    'REMOVE EXISTING FIRE-RATED DOOR ASSEMBLY': 'red',
    'REMOVE EXISTING TOWEL DISPENSER AND BACKING': 'yellow',
    'BASH OUT EXISTING GRAB BAR': 'red',
    'INSTALL NEW ACCESSIBLE LAVATORY, SEE DETAIL': 'yellow',
    'INSTALL NEW GRAB BAR, 36 INCH LONG': 'green',
    'INSTALL NEW 1-HR FIRE-RATED PARTITION': 'green',
    'INSTALL NEW TOWEL HOLDERS': 'green',
    'INSTALL NEW FAUCET WITH LEVER HANDLE': 'yellow',
    'INSTALL NEW DOOR HARDWARE': 'yellow',
    'INSTALL NEW SIGNAGE': 'yellow',
  };
  for (const [text, colour] of Object.entries(want)) {
    const r = rows.find(x => x.text === text);
    check(!!r && r.colour === colour, `"${text}" is ${colour} (got ${r ? r.colour : 'missing'})`);
  }
  check(rows.length === 13, `13 keynote rows marked (got ${rows.length})`);
  // Word marks: the exact phrase is highlighted green; the bad verb and the FIRE word are underlined red
  const marks = await page.$$eval('#findBody tr[data-id]', trs => trs.map(tr => {
    const div = tr.querySelectorAll('td')[2].querySelector('div');
    return { text: div.textContent.trim(), hg: div.querySelectorAll('.hg').length, wr: [...div.querySelectorAll('.wr')].map(e => e.textContent) };
  }));
  const exact = marks.find(m => m.text === 'INSTALL NEW GRAB BAR, 36 INCH LONG');
  check(exact && exact.hg === 'INSTALL NEW GRAB BAR, 36 INCH LONG'.split(' ').length, 'exact phrase: every word highlighted green (' + (exact && exact.hg) + ' of 7)');
  const bash = marks.find(m => m.text === 'BASH OUT EXISTING GRAB BAR');
  check(bash && bash.wr.join(' ') === 'BASH', 'BASH underlined red');
  const fire = marks.find(m => m.text === 'REMOVE EXISTING FIRE-RATED DOOR ASSEMBLY');
  check(fire && fire.wr.includes('FIRE-RATED'), 'FIRE-RATED underlined red (no rating word)');

  await page.screenshot({ path: path.join(out, '1-sample-loaded.png'), fullPage: true });
  check(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await browser.close();
  console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
