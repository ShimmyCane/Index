// Makes the synthetic test sheet and guideline used by the smoke test.
// Nothing here is real project data. Run: node test/make_synthetic.js
const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts, rgb } = require('../vendor/pdf-lib.min.js');

const here = __dirname;

// Callouts are drawn in a circle-like box; key entries are text lines in the KEYNOTES block.
const KEY = [
  'D1 REMOVE EXISTING CERAMIC WALL TILE AT RESTROOM WALLS',
  'D2 Remove existing lavatory faucet and supply lines',   // lower case -> yellow
  'D3 REMOVE EXISTING PARTITION AND DOOR',
  'D3 REMOVE EXISTING TOWEL DISPENSER',                    // duplicate number -> red
  'X5 REMOVE EXISTING GRAB BAR',                           // unknown prefix -> red
  'D4 REMOVE EXISTING FIRE-RATED DOOR ASSEMBLY',           // no rating -> red
  'D6 REMOVE EXISTING WALL TILES AT SHOWER AREA AND ALSO THE ADJACENT FLOOR TRANSITION STRIPS', // too long -> yellow
  'N1 INSTALL NEW ACCESSIBLE LAVATORY, SEE DETAIL',
  'N2 INSTALL NEW GRAB BAR, 36 INCH LONG',
  'N4 INSTALL NEW 1-HR FIRE-RATED PARTITION',
  'N5 install new towel holder',                           // lower case -> yellow
  'N9 INSTALL NEW DOOR HARDWARE',                          // no callout on sheet -> yellow
];

// Callouts placed on the plan: code and position on page (x, y in points from bottom-left).
const CALLOUTS = [
  ['D1', 120, 500], ['D2', 200, 470], ['D3', 260, 430], ['X5', 320, 400],
  ['D4', 380, 370], ['D8', 430, 340],   // D8 has no key entry -> red
  ['N1', 120, 300], ['N2', 200, 270], ['N4', 280, 240], ['N5', 340, 210], ['D6', 400, 180],
];

async function main() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([792, 612]);
  const ink = rgb(0.17, 0.16, 0.2);

  page.drawText('A-101  RESTROOM DEMOLITION AND NEW WORK PLAN (SYNTHETIC TEST SHEET)', { x: 36, y: 580, size: 12, font: bold, color: ink });
  // A rough plan outline
  page.drawRectangle({ x: 60, y: 90, width: 420, height: 440, borderColor: ink, borderWidth: 1.5 });
  page.drawText('RESTROOM', { x: 230, y: 300, size: 14, font: bold, color: ink });
  for (const [code, x, y] of CALLOUTS) {
    page.drawCircle({ x: x + 8, y: y + 4, size: 9, borderColor: ink, borderWidth: 1 });
    page.drawText(code, { x: x + (code.length > 2 ? 0 : 3), y, size: 8, font: bold, color: ink });
  }

  // KEYNOTES block on the right
  let y = 540;
  page.drawText('KEYNOTES', { x: 510, y, size: 11, font: bold, color: ink });
  y -= 22;
  for (const line of KEY) {
    // split the code from its description so the code is its own text item, like most CAD exports
    const [code, ...rest] = line.split(' ');
    page.drawText(code, { x: 510, y, size: 7.5, font: bold, color: ink });
    page.drawText(rest.join(' '), { x: 540, y, size: 7.5, font, color: ink });
    y -= 13;
  }

  // General notes block (not checked yet: stub)
  page.drawText('GENERAL NOTES', { x: 510, y: y - 10, size: 9, font: bold, color: ink });
  page.drawText('1. VERIFY EXISTING CONDITIONS BEFORE DEMOLITION.', { x: 510, y: y - 22, size: 7, font, color: ink });

  const bytes = await doc.save();
  fs.writeFileSync(path.join(here, 'synthetic_restroom_set.pdf'), bytes);

  const guideline = {
    version: 2,
    name: 'SYNTHETIC restroom and accessibility keynotes (test)',
    cloud: 'local',
    scopes: ['restroom', 'access', 'walls', 'partitions', 'fixtures', 'doors', 'fire'],
    prefixes: { demolition: 'D', newWork: 'N' },
    numberDigits: { min: 1, max: 2 },
    maxWords: 12,
    upperCase: true,
    scopeWords: {
      restroom: 'RESTROOM, TOILET, LAVATORY',
      access: 'ACCESSIBLE, GRAB BAR, BARRIER',
      walls: 'WALL TILE, CERAMIC, WALL',
      partitions: 'PARTITION',
      fixtures: 'FAUCET, TOWEL, ACCESSORY, HOLDER',
      doors: 'DOOR, HARDWARE',
      fire: 'FIRE',
    },
    fireWords: 'HR, HOUR',
    approved: [
      'REMOVE EXISTING CERAMIC WALL TILE AT RESTROOM WALLS',
      'INSTALL NEW GRAB BAR, 36 INCH LONG',
      'INSTALL NEW 1-HR FIRE-RATED PARTITION',
      'REMOVE EXISTING PARTITION AND DOOR',
      'INSTALL NEW TOWEL HOLDERS',
    ],
    similarity: 0.8,
    checks: {
      badPrefix: 'red', badNumber: 'red', duplicate: 'red', undefinedKeynote: 'red',
      unusedKeynote: 'yellow', sequence: 'yellow', tooLong: 'yellow', caseIssue: 'yellow',
      missingScopeWord: 'yellow', fireMissing: 'red', nearApproved: 'yellow', notApproved: 'yellow',
    },
    generalNotes: 'stub',
  };
  fs.writeFileSync(path.join(here, 'synthetic_guideline.json'), JSON.stringify(guideline, null, 2) + '\n');
  console.log('wrote synthetic_restroom_set.pdf and synthetic_guideline.json');
}
main().catch(e => { console.error(e); process.exit(1); });
