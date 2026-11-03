// Browser check of the Growth page and the Increment Viewer's world links (headless Chromium, pre-installed Playwright).
// Run: node tools/check_pages.js [screenshotDir]      Save screenshots outside the repo (the scratchpad).
// Checks the page loads with no script errors, the numbers follow the variables, the AI loop works,
// the viewer opens a world, a step, a draft and rejects a bad name, and the phone layout does not scroll sideways.
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');

const root = path.join(__dirname, '..');
const GROWTH = pathToFileURL(path.join(root, 'index.html')).href;
const VIEWER = pathToFileURL(path.join(root, '..', 'Increment Viewer', 'viewer.html')).href;
const shots = process.argv[2];
if (shots) fs.mkdirSync(shots, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 1400 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  const shot = async name => { if (shots) await page.screenshot({ path: path.join(shots, name) }); };

  // ---------- the Growth page
  await page.goto(GROWTH + '?world=rabbits_hillside');
  await page.waitForSelector('.stepcard');
  const info = () => page.evaluate(() => ({
    sections: document.querySelectorAll('.sec').length,
    steps: document.querySelectorAll('.stepcard').length,
    lines: document.querySelectorAll('.chartbox polyline').length,
    step6: document.querySelectorAll('.stepcard')[5] ? [...document.querySelectorAll('.stepcard')[5].querySelectorAll('.nums span')].map(s => s.textContent) : [],
    status: document.querySelector('#status').textContent
  }));
  let i = await info();
  assert.strictEqual(i.sections, 6, 'six sections');
  assert.strictEqual(i.steps, 10, 'ten steps');
  assert.strictEqual(i.lines, 4, 'four chart lines');
  assert(/unchanged/.test(i.status), 'starts as the unchanged example');
  assert.strictEqual(i.step6[0], 'Rabbits: 134', 'step 6 has the computed rabbits');
  await shot('growth_top.png');

  const hawkRow = page.locator('.row', { has: page.locator('.tag', { hasText: '{hawk_start}' }) });
  await hawkRow.locator('input').nth(1).fill('10');
  await page.waitForTimeout(150);
  i = await info();
  assert.notStrictEqual(i.step6[0], 'Rabbits: 134', 'changing a variable changes the numbers');
  assert(/Edited/.test(i.status), 'status says edited');
  await hawkRow.locator('input').nth(1).fill('abc');
  assert(await hawkRow.locator('input').nth(1).evaluate(e => e.classList.contains('bad')), 'a non-number is marked');
  await hawkRow.locator('input').nth(1).fill('35');

  const replyBox = page.locator('textarea[aria-label="The AI\'s reply"]');
  const reply = JSON.stringify({ steps: [1, 2, 3, 4].map(n => ({ label: 'New ' + n, narrative: 'Rabbits: {rabbits} in {season}.', events: ['a'], landscape: '' })) });
  await replyBox.fill(reply);
  await page.getByRole('button', { name: 'Use these steps' }).click();
  await page.waitForTimeout(150);
  assert.strictEqual((await info()).steps, 4, 'the reply replaces the steps');
  await replyBox.fill('hello');
  await page.getByRole('button', { name: 'Use these steps' }).click();
  assert(/JSON/.test(await page.locator('.msg.err').first().textContent()), 'a bad reply is explained');
  const draftLink = await page.locator('.outs a.btn').first().getAttribute('href');
  assert(/viewer\.html\?world=rabbits_hillside#draft=/.test(draftLink), 'an edited world opens as a draft in the viewer');

  await page.selectOption('#worldPick', 'paper_decay');
  await page.waitForSelector('.stepcard');
  const links = await page.evaluate(() => [...document.querySelectorAll('.outs a.btn')].map(a => a.getAttribute('href')));
  assert(links.some(h => /set=paper_again/.test(h)) && links.some(h => /paper_again\.html/.test(h)), 'paper links to its frames and its 3-D page');
  await page.selectOption('#worldPick', 'my_world');
  await page.waitForSelector('.stepcard');
  assert.strictEqual(await page.locator('.needs').count(), 5, 'a blank world has five steps that need writing');

  await page.click('#gear');
  await page.check('#showErrors');
  assert(await page.evaluate(() => !document.querySelector('#errors').hidden), 'errors show only when asked');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(GROWTH + '?world=paper_decay');
  await page.waitForSelector('.stepcard');
  assert(!(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)), 'no sideways scroll on a phone');
  await shot('growth_phone.png');

  // ---------- the Increment Viewer
  await page.setViewportSize({ width: 1100, height: 760 });
  const read = () => page.evaluate(() => ({
    title: document.getElementById('title').textContent,
    subtitle: document.getElementById('subtitle').textContent,
    frames: document.querySelectorAll('.frame').length,
    cards: document.querySelectorAll('.frame .card').length,
    imgs: document.querySelectorAll('.frame img').length,
    cap: document.getElementById('cap-count').textContent,
    play: document.getElementById('play').textContent,
    search: location.search
  }));
  await page.goto(VIEWER + '?set=living_room');
  await page.waitForSelector('.frame');
  let v = await read();
  assert(v.imgs === 10 && v.cards === 0, 'a ?set= link still shows pictures');

  await page.goto(VIEWER + '?world=rabbits_hillside&step=6');
  await page.waitForSelector('.frame .card');
  v = await read();
  assert(v.cards === 10 && v.imgs === 0, 'a world shows state cards');
  assert.strictEqual(v.cap, '6 of 10', '&step opens on that step');
  assert.strictEqual(v.play, '▶ Play', 'and waits for Play');
  await page.click('#next');
  await page.waitForTimeout(100);
  assert(/step=7/.test((await read()).search), 'the address follows the step');
  await shot('viewer_world.png');

  const world = require(path.join(root, 'worlds', 'rabbits_hillside.js'));
  world.title = 'A draft';
  world.steps[0].narrative = 'Plain <b>text</b> with {rabbits}. <img src=x onerror=alert(1)>';
  world.steps[0].image = 'https://example.invalid/track.png';
  const hash = Buffer.from(unescape(encodeURIComponent(JSON.stringify(world)))).toString('base64');
  await page.goto(VIEWER + '?world=rabbits_hillside#draft=' + hash);
  await page.waitForSelector('.frame .card');
  v = await read();
  assert.strictEqual(v.title, 'A draft', 'a draft opens');
  assert.strictEqual(v.imgs, 0, 'a draft pulls no pictures');
  assert.strictEqual(await page.locator('.entry .desc b, .entry .desc img').count(), 0, 'draft text is shown as text, not as HTML');

  await page.goto(VIEWER + '?world=../../evil');
  await page.waitForSelector('.frame');
  assert(/Living Room/.test((await read()).title), 'a bad world name falls back to the default');
  await page.goto(VIEWER + '?world=no_such_world');
  await page.waitForTimeout(500);
  assert(/Could not load/.test((await read()).subtitle), 'a missing world is explained');
  errs.length = 0;   // the missing file above is expected to log one load error

  await page.goto(VIEWER + '?set=living_room');
  await page.waitForSelector('.frame');
  const worldOptions = await page.evaluate(() => [...document.querySelectorAll('#picker option')].map(o => o.value).filter(x => x.startsWith('world:')));
  assert(worldOptions.length >= 2, 'the Scene drop-down lists the Growth worlds');

  assert.deepStrictEqual(errs, [], 'no script errors: ' + errs.join(' | '));
  await browser.close();
  console.log('ok: Growth page and Increment Viewer world links passed');
})().catch(e => { console.error(e); process.exit(1); });
