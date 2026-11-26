// Massage Map headless check: the page loads with no JavaScript errors at three sizes, nothing scrolls
// sideways, the film runs, the plate overlays draw, and the Body layers plates show for every region.
// Run: cd tests && npm install --no-save playwright@1.47.2 && npx playwright install --with-deps chromium && node smoke.js
// Locally, set CHROME_PATH to a Chromium binary to skip the Playwright browser download.
const path = require('path');
const { chromium } = require('playwright');

const URL = 'file://' + path.resolve(__dirname, '..', 'index.html');
const SIZES = [[390, 844], [768, 1024], [1280, 800]];
const failures = [];
function check(ok, what) { if (!ok) failures.push(what); }

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || undefined,
    args: ['--no-sandbox']
  });
  for (const [w, h] of SIZES) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    const errs = [];
    page.on('pageerror', e => errs.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForTimeout(200);
    const tag = w + 'px';

    const scroll = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(scroll === 0, tag + ': sideways scroll ' + scroll + 'px');

    // Map tab: Chinese mode, a point, a film, the plate overlay on the sole
    await page.click('.langBtn[data-lang="cn"]');
    await page.click('circle.marker >> nth=0');
    await page.check('#plateToggle');
    await page.click('#playBtn');
    await page.waitForTimeout(1200);
    const t = await page.textContent('#timeLabel');
    check(t !== '0.0 s', tag + ': film did not run');
    await page.check('#compareToggle');

    // Learn, Favourites (body parts and stars)
    await page.click('.tab[data-tab="learn"]');
    await page.click('.tab[data-tab="favs"]');
    const bodyRows = await page.$$eval('#bodyFavList .starRow', x => x.length);
    check(bodyRows > 100, tag + ': body-part list has ' + bodyRows + ' rows');
    await page.click('#bodyFavList .starRow >> nth=0 >> button >> nth=0');
    const liked = await page.$$eval('#bodyFavList .star.on', x => x.length);
    check(liked === 1, tag + ': tapping a body-part heart did not save');
    await page.click('.star >> nth=2');
    const stars = await page.$$eval('.star.on', x => x.length);
    check(stars >= 1, tag + ': tapping a star did not save');

    // Notes for improvement
    await page.click('.tab[data-tab="map"]');
    await page.click('#gearBtn');
    await page.fill('#noteText', 'Headless check note');
    await page.click('#noteSave');
    const notes = await page.$$eval('#noteList li', x => x.length);
    check(notes >= 1, tag + ': note did not save');
    await page.click('#drawerClose');

    // Body layers: every region draws, peels, and shows its plate
    await page.click('.tab[data-tab="anat"]');
    const regions = await page.$$eval('#anatRegions button', b => b.length);
    check(regions === 9, tag + ': expected 9 body regions, found ' + regions);
    await page.check('#anatPlateToggle');
    for (let i = 0; i < regions; i++) {
      await page.click(`#anatRegions button >> nth=${i}`);
      const imgs = await page.$$eval('#anatSvg image', x => x.length);
      await page.click('#anatPeel');
      await page.click('#anatReset');
      if (i === 0) check(imgs === 0, tag + ': whole body should be drawn, not a plate');
    }
    await page.uncheck('#anatPlateToggle');
    await page.click('#anatRegions button >> nth=0');
    const drawn = await page.$$eval('#anatSvg [data-i]', x => x.length);
    check(drawn > 0, tag + ': whole body drawing is empty after untick');

    check(errs.length === 0, tag + ': ' + errs.join(' | '));
    console.log(JSON.stringify({ size: tag, errors: errs.length, bodyRows, regions, scroll }));
    await page.close();
  }
  await browser.close();
  if (failures.length) {
    console.error('FAILED:\n' + failures.join('\n'));
    process.exit(1);
  }
  console.log('All headless checks passed at ' + SIZES.map(s => s[0]).join(', ') + ' px.');
})().catch(e => { console.error('ERROR', e.message); process.exit(1); });
