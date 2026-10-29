// Browser smoke test (headless Chromium via the pre-installed Playwright).
// Usage: node tools/smoke.js [screenshotDir]
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const SHOTS = process.argv[2] || process.env.SS_SHOTS || null;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('nf'); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

let failures = 0;
function check(name, ok, extra) {
  console.log((ok ? 'ok   ' : 'FAIL ') + name + (extra && !ok ? '  ' + extra : ''));
  if (!ok) failures++;
}

(async () => {
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + server.address().port + '/';
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') pageErrors.push('console: ' + m.text()); });
  const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true }); };

  try {
    await page.goto(base + '#/start');
    await page.waitForSelector('text=Load sample project', { timeout: 10000 });
    check('start page renders', true);

    await page.click('[data-act="load-sample"]');
    await page.waitForSelector('text=Project survey');
    check('sample loads and opens the survey', true);
    await shot('01-survey');

    await page.goto(base + '#/import');
    await page.waitForSelector('text=Text dump');
    const hits = await page.locator('[data-act="hit-accept"]').count();
    check('import shows keyword hits from the sample text', hits >= 3, 'hits=' + hits);

    await page.goto(base + '#/sections');
    await page.waitForSelector('text=Recommended from the drivers');
    const rows = await page.locator('tbody tr').count();
    check('sections page lists recommendations', rows >= 20, 'rows=' + rows);
    await shot('02-sections');

    // Accept the keynote-driven roofing section, then add the demo section from the library.
    await page.locator('tr', { hasText: '07 54 23' }).locator('[data-act="sec-accept"]').click();
    await page.waitForFunction(() => document.querySelector('tr.accepted') !== null);
    check('accepting a section puts it in the book', true);
    await page.selectOption('#addSec', '00 00 00');
    await page.click('[data-act="sec-add"]');
    await page.waitForSelector('nav a.book[href="#/section/00%2000%2000"]').catch(() => {});
    const bookLinks = await page.locator('nav a.book').count();
    check('book list in the nav has the accepted and added sections', bookLinks >= 2, 'links=' + bookLinks);

    // Demo workspace: answer the membrane question, then check the bracket chip and the impact flag.
    await page.goto(base + '#/section/00 00 00');
    await page.waitForSelector('text=Membrane thickness (demo)');
    await page.check('input[name="q-thk"][value="080"]');
    await page.waitForSelector('text=Long-life note');
    check('option C shows the cascaded long-life paragraph', true);
    await shot('03-workspace');

    await page.goto(base + '#/flags');
    await page.waitForSelector('text=Flags');
    const flagRows = await page.locator('tbody tr').count();
    check('an impact on a section not in the book raises a flag', flagRows >= 1, 'rows=' + flagRows);

    // Hand edit, then change the answer behind it: a review flag should appear and keep the edit.
    await page.goto(base + '#/section/00 00 00');
    await page.waitForSelector('text=Membrane:');
    await page.click('button[data-act="edit-para"][data-key="2.0.0"]');
    await page.fill('#edit-2\\.0\\.0', 'Membrane: hand-written, reviewed by Jimmy (test).');
    await page.click('button[data-act="save-para"][data-key="2.0.0"]');
    await page.check('input[name="q-thk"][value="045"]');
    await page.goto(base + '#/flags');
    await page.waitForSelector('text=Generated text changed under a hand edit');
    check('a changed answer behind a hand edit raises a review flag', true);
    await shot('04-flags');

    await page.goto(base + '#/decisions');
    await page.waitForSelector('text=Decisions');
    const decRows = await page.locator('tbody tr').count();
    check('decisions log records every change', decRows >= 3, 'rows=' + decRows);

    await page.goto(base + '#/outputs');
    await page.waitForSelector('text=Outline specification');
    const outlineText = await page.locator('pre').nth(1).innerText();
    check('outline output includes the hand-edited paragraph', outlineText.includes('hand-written'));
    check('outline output contains no hidden paragraphs', !outlineText.includes('Seams:'));

    // ⚙️ drawer and error panel
    await page.click('.gear');
    await page.waitForSelector('.drawer');
    check('⚙️ drawer opens', true);
    await page.click('.drawer [data-act="toggle-drawer"]');

    // Layout: menu and notes minimize, panels reorder, status light says device-only without a database.
    await page.goto(base + '#/section/00 00 00');
    await page.waitForSelector('.ws-cols');
    check('status light says device only when no database is set up', (await page.locator('#syncPill').innerText()).includes('database not set up'));
    await page.click('[data-act="toggle-nav"]');
    check('menu minimizes', (await page.locator('.layout.nav-hidden').count()) === 1);
    await page.click('[data-act="toggle-nav"]');
    check('menu restores', (await page.locator('.layout.nav-hidden').count()) === 0);
    await page.click('[data-act="toggle-side"]');
    check('notes minimize', (await page.locator('.ws-cols.side-hidden').count()) === 1);
    await page.click('[data-act="toggle-side"]');
    const firstBefore = await page.locator('aside.side summary').first().innerText();
    await page.locator('aside.side [data-act="side-move"][data-dir="1"]').first().click();
    const firstAfter = await page.locator('aside.side summary').first().innerText();
    check('notes panels reorder', firstBefore.split('\n')[0] !== firstAfter.split('\n')[0]);
    const sideWidth = await page.evaluate(() => document.querySelector('.layout').style.getPropertyValue('--side-w'));
    check('notes panel has a resize handle', (await page.locator('[data-splitter]').count()) === 1 && sideWidth.endsWith('px'));

    // Reload keeps the project (localStorage)
    await page.reload();
    await page.waitForSelector('nav');
    await page.goto(base + '#/decisions');
    await page.waitForSelector('text=Decisions');
    check('project survives a reload', (await page.locator('tbody tr').count()) >= 3);

    check('no page errors', pageErrors.length === 0, pageErrors.join(' | '));
  } catch (e) {
    check('smoke run completed', false, e.message);
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'failure.png'), fullPage: true }).catch(() => {});
  } finally {
    await browser.close();
    server.close();
  }
  console.log(failures ? failures + ' failed' : 'all smoke checks passed');
  process.exit(failures ? 1 : 0);
})();
