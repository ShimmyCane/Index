#!/usr/bin/env node
/* anim_capture: record a drag-based interaction as PNG frames, headless.
   Usage: node anim_capture.js <plan.json> <out_dir>
   The plan (JSON) says where to load the page, what to crop, and the gestures to play:
   {
     "url": "http://localhost:8765/index.html",   // serve the project over http (file:// taints canvases)
     "viewport": { "width": 1180, "height": 820 },
     "clip": { "selector": ".sheetPage" },          // crop every frame to this element's box
     "setup": "localStorage.clear()",               // optional JS run before the page is used
     "steps": [
       { "type": "drag", "from": { "selector": "#sheetCard .slot", "nth": 3, "fx": 0.02, "fy": 0.5 },
         "to": { "fx": 0.9, "fy": 0.5 }, "stepPx": 5, "shotEvery": 1 },   // move in steps of stepPx
       { "type": "release" },
       { "type": "wait", "ms": 300 },
       { "type": "shot" },
       { "type": "drag", "from": { "fx": 0.6, "fy": 0.5 }, "to": { "fx": 0.2, "fy": 0.5 },
         "stepPx": 5, "shotEvery": 1, "untilSelector": ".ps.committed" },  // stop early when this appears
       { "type": "wait", "ms": 400 }, { "type": "shot", "n": 4 }
     ]
   }
   Gesture points are either absolute {"x","y"} (page px) or relative to a box: {"selector","nth","fx","fy"}
   (nth picks which match, 0-based; fx, fy in 0..1 of that element's box). "from" starts the drag (mouse down) and the drag ends
   with a release unless a later "release" step is given. Frames are numbered in order. */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

async function point(page, p) {
  if (p.selector) {
    const box = await page.locator(p.selector).nth(p.nth ?? 0).boundingBox();
    if (!box) throw new Error('no box for selector ' + p.selector);
    return { x: box.x + box.width * (p.fx ?? 0.5), y: box.y + box.height * (p.fy ?? 0.5) };
  }
  return { x: p.x, y: p.y };
}

(async () => {
  const [planPath, outDir] = process.argv.slice(2);
  if (!planPath || !outDir) { console.error('usage: anim_capture.js plan.json out_dir'); process.exit(2); }
  const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: plan.viewport || { width: 1180, height: 820 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(plan.url);
  if (plan.setup) { await page.evaluate(plan.setup); await page.reload(); }
  await page.waitForTimeout(400);
  let clip;
  if (plan.clip && plan.clip.selector) {
    const b = await page.locator(plan.clip.selector).first().boundingBox();
    clip = { x: b.x, y: b.y, width: b.width, height: b.height };
  }
  let n = 0;
  const shot = async () => {
    await page.screenshot({ path: path.join(outDir, `f${String(n++).padStart(4, '0')}.png`), clip });
  };
  let down = false;
  for (const s of plan.steps) {
    if (s.type === 'drag') {
      // a "to" with only fx/fy is measured on the same element as "from"
      const to = (s.to.selector || s.to.x !== undefined) ? s.to : Object.assign({}, s.from, s.to);
      const a = await point(page, s.from), b = await point(page, to);
      if (![a.x, a.y, b.x, b.y].every(Number.isFinite)) throw new Error('drag points are not finite: ' + JSON.stringify({ a, b }));
      const step = s.stepPx || 5, dist = Math.hypot(b.x - a.x, b.y - a.y), k = Math.max(1, Math.round(dist / step));
      await page.mouse.move(a.x, a.y);
      await page.mouse.down(); down = true;
      for (let i = 1; i <= k; i++) {
        await page.mouse.move(a.x + (b.x - a.x) * i / k, a.y + (b.y - a.y) * i / k);
        if (s.shotEvery && i % s.shotEvery === 0) await shot();
        if (s.untilSelector && (await page.locator(s.untilSelector).count()) > 0) break;
      }
      if (s.untilSelector && (await page.locator(s.untilSelector).count()) > 0) {
        for (let j = 0; j < 8; j++) { await page.waitForTimeout(60); await shot(); }
      }
    } else if (s.type === 'release') {
      if (down) { await page.mouse.up(); down = false; }
    } else if (s.type === 'wait') {
      await page.waitForTimeout(s.ms || 100);
    } else if (s.type === 'shot') {
      for (let i = 0; i < (s.n || 1); i++) await shot();
    }
  }
  if (down) await page.mouse.up();
  await shot();
  console.log(JSON.stringify({ frames: n, out: outDir, errors }));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
