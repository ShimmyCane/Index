// Headless browser run of index.html from file://. Needs Playwright with Chromium.
// Run: node tools/smoke.js [screenshotDir]   (save screenshots outside the repo)
const path = require('path');
const { chromium } = require('playwright');
const shotDir = process.argv[2];
const url = 'file://' + path.join(__dirname, '..', 'index.html');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium',
    args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  await page.goto(url);
  await page.waitForFunction(() => document.querySelectorAll('#objectList li').length > 0);
  const count = await page.locator('#objectList li').count();
  const title = await page.textContent('#modelTitle');
  console.log(`loaded "${title}" with ${count} objects in the list`);
  if (shotDir) await page.screenshot({ path: path.join(shotDir, '1-loaded.png') });

  // select an object from the list
  await page.click('#objectList li >> nth=0');
  console.log('selected:', await page.textContent('#selFacts'));

  // a valid add through the form
  await page.fill('#fName', 'Stone marker');
  await page.fill('#fX', "2' 6\"");
  await page.fill('#fZ', '6');
  await page.selectOption('#fType', 'box');
  await page.click('#addForm button[type=submit]');
  const after = await page.locator('#objectList li').count();
  console.log(`after add: ${after} objects, step ${await page.textContent('#stepLabel')}`);

  // a paste that the rules reject (bad coordinates), then preview it
  await page.click('#tabPaste');
  await page.fill('#pasteBox', JSON.stringify({ op: 'add', object: { name: 'Bad', type: 'box', dimensions: [4, 4, 4], position: ['x', 0, 0] } }));
  await page.click('#pasteApply');
  console.log('reject panel visible:', await page.isVisible('#rejectCard'));
  if (shotDir) await page.screenshot({ path: path.join(shotDir, '2-rejected.png') });
  await page.click('#rejectPreview');
  console.log('preview banner visible:', await page.isVisible('#previewBanner'));
  await page.click('#previewDiscard');

  // settings drawer: Y-up, ground on and slider, feet and inches vs inches
  await page.click('#gearBtn');
  await page.selectOption('#displaySel', 'edges');
  await page.check('#groundOn');
  await page.click('#checkBtn');
  await page.check('#showErrors');
  console.log('bottom errors visible:', await page.isVisible('#errorsArea'));
  if (shotDir) await page.screenshot({ path: path.join(shotDir, '3-settings.png') });
  await page.selectOption('#upSel', 'y');
  await page.selectOption('#upSel', 'z');
  await page.click('#closeGear');

  // history scrubber back to step 0, then back to latest
  await page.fill('#scrub', '0');
  await page.dispatchEvent('#scrub', 'input');
  console.log('scrubbed to:', await page.textContent('#stepLabel'), 'objects shown:', await page.locator('#objectList li').count());
  await page.click('#latestBtn');
  console.log('back at:', await page.textContent('#stepLabel'));
  if (shotDir) await page.screenshot({ path: path.join(shotDir, '4-latest.png') });

  // view interaction: drag to orbit, wheel to zoom, no crash
  await page.mouse.move(640, 400); await page.mouse.down(); await page.mouse.move(700, 380, { steps: 5 }); await page.mouse.up();
  await page.mouse.wheel(0, -300);

  // reload keeps the saved model
  await page.reload();
  await page.waitForFunction(() => document.querySelectorAll('#objectList li').length > 0);
  console.log('after reload objects:', await page.locator('#objectList li').count());

  // iPad portrait: the layout stacks and the view still draws
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.waitForTimeout(300);
  if (shotDir) await page.screenshot({ path: path.join(shotDir, '5-ipad-portrait.png') });

  console.log('console errors:', errors.length ? errors : 'none');
  await browser.close();
  if (errors.length) process.exit(1);
})().catch((e) => { console.error(e); process.exit(1); });
