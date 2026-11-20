// Makes the sample set used by the "Load sample" button: a two-page synthetic drawing and a
// synthetic guideline. Every name is fictional. Run: node test/make_sample.js
const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts, rgb } = require('../vendor/pdf-lib.min.js');

const out = path.resolve(__dirname, '..', 'samples');
const INK = rgb(0.17, 0.16, 0.2), GREY = rgb(0.5, 0.5, 0.5);

// Keynote rows: type, number, CSI, description (matrix on sheet A-101 only).
const ROWS = [
  ['Demo', '1', '02 00', 'REMOVE EXISTING CERAMIC WALL TILE AT RESTROOM WALLS'],
  ['Demo', '2', '10 00', 'REMOVE EXISTING LAVATORY FAUCET AND SUPPLY LINES'],
  ['Demo', '3', '10 00', 'REMOVE EXISTING PARTITION AND DOOR'],
  ['Demo', '4', '08 10', 'REMOVE EXISTING FIRE-RATED DOOR ASSEMBLY'],
  ['Demo', '5', '10 00', 'REMOVE EXISTING TOWEL DISPENSER AND BACKING'],
  ['New', '11', '09 30', 'INSTALL NEW ACCESSIBLE LAVATORY, SEE DETAIL'],
  ['New', '12', '10 00', 'INSTALL NEW GRAB BAR, 36 INCH LONG'],
  ['New', '14', '09 30', 'INSTALL NEW 1-HR FIRE-RATED PARTITION'],
  ['New', '15', '10 00', 'INSTALL NEW TOWEL HOLDERS'],
  ['New', '16', '10 00', 'INSTALL NEW FAUCET WITH LEVER HANDLE'],
  ['New', '17', '08 10', 'INSTALL NEW DOOR HARDWARE'],
  ['New', '18', '', 'INSTALL NEW SIGNAGE'],
];
// Callouts: page, type (drives the symbol), number, x, y (points from bottom-left).
const CALLOUTS = [
  [1, 'Demo', '1', 170, 470], [1, 'Demo', '2', 250, 420], [1, 'Demo', '3', 330, 380], [1, 'Demo', '5', 200, 300],
  [1, 'New', '11', 150, 230], [1, 'New', '12', 260, 190], [1, 'New', '14', 360, 160], [1, 'New', '15', 430, 330],
  [1, 'New', '16', 470, 240], [1, 'New', '18', 300, 110],
  [2, 'Demo', '4', 170, 420], [2, 'Existing', '30', 330, 300],   // 30 has no keynote row -> red
];

// Draw a symbol centred on (cx, cy): hexagon = demo, square = new work, circle = existing.
function symbol(page, font, type, num, cx, cy) {
  const r = 11;
  if (type === 'New') {
    page.drawRectangle({ x: cx - r, y: cy - r, width: 2 * r, height: 2 * r, borderColor: INK, borderWidth: 1 });
  } else if (type === 'Demo') {
    const pts = [0, 1, 2, 3, 4, 5].map(i => [cx + r * Math.cos(i * Math.PI / 3), cy + r * Math.sin(i * Math.PI / 3)]);
    for (let i = 0; i < 6; i++) {
      const a = pts[i], b = pts[(i + 1) % 6];
      page.drawLine({ start: { x: a[0], y: a[1] }, end: { x: b[0], y: b[1] }, thickness: 1, color: INK });
    }
  } else {
    page.drawCircle({ x: cx, y: cy, size: r, borderColor: INK, borderWidth: 1 });
  }
  const w = font.widthOfTextAtSize(num, 8);
  page.drawText(num, { x: cx - w / 2, y: cy - 3, size: 8, font, color: INK });
}

function titleBlock(page, font, bold, sheet, title) {
  const x = 700, y = 20, w = 300, h = 90;
  page.drawRectangle({ x, y, width: w, height: h, borderColor: INK, borderWidth: 1.2 });
  page.drawLine({ start: { x, y: y + 50 }, end: { x: x + w, y: y + 50 }, thickness: 0.8, color: INK });
  page.drawLine({ start: { x: x + 180, y: y + 50 }, end: { x: x + 180, y: y + h }, thickness: 0.8, color: INK });
  page.drawText('SAMPLE PROJECT (FICTIONAL)', { x: x + 8, y: y + 72, size: 9, font: bold, color: INK });
  page.drawText('RESTROOM RENOVATION, SYNTHETIC', { x: x + 8, y: y + 58, size: 7.5, font, color: INK });
  page.drawText(title, { x: x + 8, y: y + 30, size: 9, font: bold, color: INK });
  page.drawText('SHEET ' + sheet, { x: x + 8, y: y + 8, size: 11, font: bold, color: INK });
  page.drawText('SCALE 1/4" = 1\'-0"', { x: x + 188, y: y + 30, size: 7, font, color: INK });
  page.drawText('DATE 2026-11-20', { x: x + 188, y: y + 8, size: 7, font, color: INK });
}

async function main() {
  fs.mkdirSync(out, { recursive: true });
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const pages = [doc.addPage([1008, 612]), doc.addPage([1008, 612])];

  // Page 1: floor plan A-101 with the keynote matrix and legend
  const p1 = pages[0];
  p1.drawText('RESTROOM DEMOLITION AND NEW WORK PLAN', { x: 40, y: 575, size: 13, font: bold, color: INK });
  p1.drawRectangle({ x: 60, y: 90, width: 480, height: 460, borderColor: INK, borderWidth: 1.5 });
  p1.drawLine({ start: { x: 320, y: 90 }, end: { x: 320, y: 300 }, thickness: 1, color: INK });
  p1.drawText('MEN', { x: 150, y: 480, size: 9, font: bold, color: GREY });
  p1.drawText('WOMEN', { x: 400, y: 480, size: 9, font: bold, color: GREY });
  for (const [pg, type, num, x, y] of CALLOUTS) if (pg === 1) symbol(p1, font, type, num, x, y);

  // Legend (top right) and keynote matrix (below it)
  let y = 555;
  p1.drawText('LEGEND', { x: 660, y, size: 10, font: bold, color: INK });
  y -= 22;
  symbol(p1, font, 'Existing', 'E', 672, y + 3);
  p1.drawText('EXISTING KEYNOTE (CIRCLE)', { x: 690, y, size: 7.5, font, color: INK });
  y -= 20;
  symbol(p1, font, 'Demo', 'D', 672, y + 3);
  p1.drawText('DEMOLITION KEYNOTE (HEXAGON)', { x: 690, y, size: 7.5, font, color: INK });
  y -= 20;
  symbol(p1, font, 'New', 'N', 672, y + 3);
  p1.drawText('NEW WORK KEYNOTE (SQUARE)', { x: 690, y, size: 7.5, font, color: INK });

  y = 440;
  p1.drawText('KEYNOTES', { x: 660, y, size: 10, font: bold, color: INK });
  y -= 18;
  for (const [h, x] of [['TYPE', 660], ['NO.', 710], ['CSI', 740], ['DESCRIPTION', 780]]) p1.drawText(h, { x, y, size: 6.5, font: bold, color: INK });
  y -= 13;
  for (const [type, num, csi, desc] of ROWS) {
    p1.drawText(type, { x: 660, y, size: 7, font, color: INK });
    p1.drawText(num, { x: 710, y, size: 7, font, color: INK });
    if (csi) p1.drawText(csi, { x: 740, y, size: 7, font, color: INK });
    p1.drawText(desc, { x: 780, y, size: 7, font, color: INK });
    y -= 12;
  }
  titleBlock(p1, font, bold, 'A-101', 'FLOOR PLAN AND KEYNOTES');

  // Page 2: details and general notes
  const p2 = pages[1];
  p2.drawText('RESTROOM DETAILS AND GENERAL NOTES', { x: 40, y: 575, size: 13, font: bold, color: INK });
  p2.drawRectangle({ x: 60, y: 90, width: 420, height: 420, borderColor: INK, borderWidth: 1.5 });
  p2.drawText('TOILET PARTITION ELEVATION (SCHEMATIC)', { x: 90, y: 480, size: 9, font: bold, color: GREY });
  for (const [pg, type, num, x, yy] of CALLOUTS) if (pg === 2) symbol(p2, font, type, num, x, yy);
  const notes = [
    'GENERAL NOTES',
    '1. VERIFY EXISTING CONDITIONS BEFORE DEMOLITION.',
    '2. PROTECT ADJACENT FINISHES DURING WORK.',
    '3. PATCH AND REPAIR WALLS TO MATCH EXISTING.',
    '4. NOTIFY THE OWNER BEFORE SHUTTING OFF WATER.',
  ];
  let ny = 520;
  notes.forEach((t, i) => { p2.drawText(t, { x: 520, y: ny, size: i === 0 ? 9 : 7.5, font: i === 0 ? bold : font, color: INK }); ny -= 16; });
  titleBlock(p2, font, bold, 'A-102', 'DETAILS AND GENERAL NOTES');

  fs.writeFileSync(path.join(out, 'sample_sheet.pdf'), await doc.save());

  // Synthetic guideline: same checks as the test guideline, with the approved phrases for this sheet.
  const g = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'synthetic_guideline.json'), 'utf8'));
  g.name = 'SYNTHETIC sample guideline (restroom keynotes)';
  g.approved = [
    'REMOVE EXISTING CERAMIC WALL TILE AT RESTROOM WALLS',
    'INSTALL NEW GRAB BAR, 36 INCH LONG',
    'INSTALL NEW 1-HR FIRE-RATED PARTITION',
    'REMOVE EXISTING PARTITION AND DOOR',
    'INSTALL NEW TOWEL HOLDERS',
  ];
  fs.writeFileSync(path.join(out, 'sample_guideline.json'), JSON.stringify(g, null, 2) + '\n');
  console.log('wrote samples/sample_sheet.pdf and samples/sample_guideline.json');
}
main().catch(e => { console.error(e); process.exit(1); });
