// The sample scene: a Southern Cheyenne camp move on the North Fork of the Canadian, Indian Territory, 1870s.
// A DRAFT for consultation: the Cheyenne and Arapaho Tribes have not reviewed it. Not for display until the
// consultation flags are closed (see research/consultation-plan.md and the gate in ⚙️).
// It shows no named person, no particular family or event, and no ceremonial or sacred object.
// Scale 1:24 (1 in = 2 ft). Run: node tools/build_sample.js (never hand-edit samples/ or js/sample_bundle.js).
//
// Layout is generated with a fixed seed, so every build is the same. Narrative pieces sit at fixed places;
// the rest is placed by rejection sampling so nothing overlaps.
// Certainty percent = how sure we are the size and shape are right as drawn (0-100).
// Basis = where the number came from: measured | cited | user | inferred | placeholder | decorative.

const header = {
  name: 'Southern Cheyenne camp move, Indian Territory, 1870s (draft for consultation)',
  model_id: 'plains-diorama-v03',
  description: 'A draft diorama of a camp move on a river terrace, with bones on the ground. Figures and horses are placeholders. Not reviewed by the Cheyenne and Arapaho Tribes; not for display.',
  scale: '1:24 (1 in = 2 ft)',
  units: 'in',
  up: 'z',
  world: 'plains-diorama-world'
};

// ---------- seeded random numbers (same every build) ----------
function rng(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const R = rng(20261118);
const r1 = (x) => Math.round(x * 10) / 10;
const between = (a, b) => r1(a + (b - a) * R());

// ---------- footprints: circles, so nothing is placed on top of anything else ----------
const placed = [];   // { x, y, r }
const fits = (x, y, r) => {
  if (x - r < -14.5 || x + r > 14.5 || y - r < -9.5 || y + r > 9.5) return false;
  return placed.every(c => Math.hypot(c.x - x, c.y - y) >= c.r + r);
};
// Marks a long or wide piece as one or more circles along its length (dx by dy, in inches).
function reserve(x, y, dx, dy) {
  const len = Math.max(dx, dy), w = Math.min(dx, dy);
  const n = Math.max(1, Math.ceil(len / 1.2));
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : (i / (n - 1) - 0.5) * (len - w);
    placed.push({ x: dx >= dy ? x + t : x, y: dx >= dy ? y : y + t, r: w / 2 + 0.2 });
  }
}
function findSpot(dx, dy, zone, pad) {
  const r = Math.max(dx, dy) / 2 + (pad === undefined ? 0.05 : pad);
  for (let k = 0; k < 120; k++) {
    let x, y;
    if (zone) {
      const a = R() * Math.PI * 2, d = Math.sqrt(R()) * zone.R;
      x = zone.x + Math.cos(a) * d; y = zone.y + Math.sin(a) * d * 0.8;
    } else { x = -14 + R() * 28; y = -9 + R() * 18; }
    x = r1(x); y = r1(y);
    if (fits(x, y, r)) { placed.push({ x, y, r }); return { x, y }; }
  }
  return null;
}

// ---------- object helpers ----------
const objects = [];
const flags = [];
const groupsWithLow = new Set();
const add = (o) => { objects.push(o); return o; };
const group = (uuid, name, parent, description) => add({ uuid, name, type: 'group', parent, ...(description ? { description } : {}) });
const solid = (uuid, name, type, parent, dims, pos, material, cert, description) =>
  add({ uuid, name, type, parent, dimensions: dims, position: pos, material, certainty: cert, ...(description ? { description } : {}) });
const low = (parent, pct) => { if (pct < 50) groupsWithLow.add(parent); };
const ph = (note) => ({ percent: 15, basis: 'placeholder', note });

// Horse silhouette, standing on the ground at (x, y), facing +x.
function horse(id, name, x, y, parent) {
  group(id, name, parent, 'Placeholder silhouette. No breed, tack or colour is claimed.');
  const c = { percent: 20, basis: 'placeholder', note: 'Silhouette only.' };
  solid(id + '-body', 'Horse body', 'box', id, { x: 6, y: 2, z: 2.6 }, [x, y, 4.8], 'placeholder grey', c);
  solid(id + '-neck', 'Horse neck', 'box', id, { x: 1, y: 1, z: 2 }, [x + 2.5, y, 6.3], 'placeholder grey', c);
  [[2.2, -0.7], [2.2, 0.7], [-2.2, -0.7], [-2.2, 0.7]].forEach((o, i) =>
    solid(id + '-leg-' + i, 'Horse leg ' + (i + 1), 'cylinder', id, { x: 0.4, y: 0.4, z: 2.5 }, [x + o[0], y + o[1], 2.25], 'placeholder grey', c));
  low(parent, 20);
}

// Travois: two drag poles along y, a cross bar at the front, a load of bundles on the poles.
function travois(id, name, x, y, parent) {
  group(id, name, parent, 'A drag frame of two poles and a cross bar, with a load.');
  const c = { percent: 55, basis: 'inferred', note: 'Travois form from the research; length approximate.' };
  solid(id + '-pole-l', 'Pole (left)', 'box', id, { x: 0.4, y: 9, z: 0.4 }, [x - 0.4, y, 1.2], 'wood', c);
  solid(id + '-pole-r', 'Pole (right)', 'box', id, { x: 0.4, y: 9, z: 0.4 }, [x + 0.4, y, 1.2], 'wood', c);
  solid(id + '-bar', 'Cross bar', 'box', id, { x: 1.6, y: 0.4, z: 0.4 }, [x, y - 4.5, 1.2], 'wood', c);
  solid(id + '-load', 'Load of bundles', 'box', id, { x: 2.4, y: 2.6, z: 1.6 }, [x, y + 0.5, 2.2], 'hide and cloth',
    { percent: 30, basis: 'placeholder', note: 'A block for the load. What it holds is not confirmed.' });
  low(parent, 55); low(parent, 30);
  reserve(x, y - 0.5, 1.6, 9.5);
}

// ---------- the fixed narrative pieces ----------
group('camp', 'Camp move (draft)', undefined, 'Root group. A Southern Cheyenne camp move on a river terrace on the North Fork of the Canadian. Not reviewed by the tribes.');

// The ground, a low bluff at the back, the painted backdrop, and a creek with cottonwoods.
solid('ground', 'River terrace ground', 'box', 'camp', { x: 30, y: 20, z: 1 }, [0, 0, 0.5], 'prairie earth',
  { percent: 70, basis: 'inferred', note: 'Flat river terrace. No site survey; the shape is generic.' });
group('bluff', 'Bluff (layers)', 'camp', 'Three layers at the back of the camp, invented to frame it.');
solid('bluff-low', 'Bluff, lower layer', 'box', 'bluff', { x: 30, y: 3, z: 2 }, [0, 8.2, 2], 'prairie earth',
  { percent: 35, basis: 'inferred', note: 'Invented to frame the camp.' });
solid('bluff-stone', 'Bluff, stone layer', 'box', 'bluff', { x: 26, y: 2.5, z: 2.5 }, [0, 8.4, 4.25], 'stone',
  { percent: 35, basis: 'inferred', note: 'Invented to frame the camp.' });
solid('bluff-top', 'Bluff, top layer', 'box', 'bluff', { x: 22, y: 2, z: 2 }, [0, 8.5, 6.5], 'prairie earth',
  { percent: 35, basis: 'inferred', note: 'Invented to frame the camp.' });
low('bluff', 35);
solid('backdrop', 'Painted backdrop wall', 'box', 'camp', { x: 30, y: 0.5, z: 14 }, [0, 10.25, 8], 'painted',
  { percent: 100, basis: 'decorative', note: 'Flat wall of the diorama box. The painting is not modelled.' });
solid('water', 'Creek (North Fork side channel)', 'box', 'camp', { x: 6, y: 18, z: 0.2 }, [9, 0, 1.1], 'water',
  { percent: 60, basis: 'inferred', note: 'A shallow creek band. Its course and width are not from a survey.' });
reserve(9, 0, 6, 18);

// Lodges: three standing, one struck (cover folded on the ground with its poles).
group('lodges', 'Lodges (standing and struck)', 'camp', 'Three standing lodges and one struck lodge cover with its poles.');
solid('lodge-1', 'Lodge 1 (standing, large)', 'cone', 'lodges', { x: 7, y: 7, z: 8 }, [-9, 3, 5], 'hide',
  { percent: 60, basis: 'inferred', note: 'General tipi form. Diameter and height approximate.' });
solid('lodge-2', 'Lodge 2 (standing)', 'cone', 'lodges', { x: 6, y: 6, z: 7 }, [-12.5, -3, 4.5], 'hide',
  { percent: 55, basis: 'inferred', note: 'General tipi form. Size approximate.' });
solid('lodge-3', 'Lodge 3 (standing, small)', 'cone', 'lodges', { x: 5, y: 5, z: 6 }, [-5, -4, 4], 'hide',
  { percent: 55, basis: 'inferred', note: 'General tipi form. Size approximate.' });
solid('struck-cover', 'Struck lodge cover (folded)', 'box', 'lodges', { x: 4.5, y: 3, z: 0.6 }, [-1, -1, 1.3], 'hide',
  { percent: 50, basis: 'inferred', note: 'The folded cover on the ground. Size approximate.' });
solid('struck-poles', 'Struck lodge poles', 'box', 'lodges', { x: 0.3, y: 8, z: 0.3 }, [-1.9, -1, 1.15], 'wood',
  { percent: 50, basis: 'inferred', note: 'Poles laid beside the cover. Length approximate.' });
[[-9, 3, 7], [-12.5, -3, 6], [-5, -4, 5], [-1, -1, 4.5]].forEach(p => reserve(p[0], p[1], p[2], p[2]));
reserve(-1.9, -1, 0.3, 8);
low('lodges', 50); low('lodges', 55);

// Travois: three frames heading across the creek toward the bluff.
group('travois', 'Travois (three frames, loaded)', 'camp', 'Three drag frames loaded for the move.');
travois('travois-1', 'Travois 1', 3, -4, 'travois');
travois('travois-2', 'Travois 2', 6, 0.5, 'travois');
travois('travois-3', 'Travois 3', 9.5, -1, 'travois');

// Horses: four, two of them hitched near the travois.
group('horses', 'Horses (placeholder)', 'camp', 'Four placeholder horse silhouettes. No breed, tack or colour is claimed.');
const travoisAt = [[3, -4], [6, 0.5], [9.5, -1]];
horse('horse-1', 'Horse 1', 7.5, -7.5, 'horses'); reserve(7.5, -7.5, 6.2, 2);
horse('horse-2', 'Horse 2', -3.5, -7.5, 'horses'); reserve(-3.5, -7.5, 6.2, 2);
horse('horse-3', 'Horse 3', -4.5, 5.5, 'horses'); reserve(-4.5, 5.5, 6.2, 2);
horse('horse-4', 'Horse 4', 4.5, 7.2, 'horses'); reserve(4.5, 7.2, 6.2, 2);

// People: placeholder forms only, near the travois and lodges.
group('figures', 'People (placeholder forms)', 'camp', 'Placeholder forms: women, a child and an older woman. No faces, hair, clothing or regalia.');
const people = [
  ['woman-1', 'Woman 1', 1.6, 4.5, [-6.5, -1]], ['child-1', 'Child 1', 1.0, 2.8, [-1, 2]],
  ['woman-2', 'Woman 2', 1.6, 4.5, [1.5, -7]], ['older-1', 'Older woman 1', 1.5, 4.2, [-10, -7.5]],
  ['woman-3', 'Woman 3', 1.6, 4.5, [11.5, 3]], ['child-2', 'Child 2', 1.0, 2.6, [-0.5, -10.5]]
];
people.forEach(([id, name, dia, h, p]) => {
  const at = findSpot(dia + 0.3, dia + 0.3, { x: p[0], y: p[1], R: 2 }) || { x: p[0], y: p[1] };
  group(id, name + ' (placeholder)', 'figures');
  solid(id + '-body', name + ' body', 'cylinder', id, { x: dia, y: dia, z: h }, [at.x, at.y, 1 + h / 2], 'placeholder grey', ph('Form only.'));
  solid(id + '-head', name + ' head', 'sphere', id, { x: 0.9, y: 0.9, z: 0.9 }, [at.x, at.y, 1 + h + 0.45], 'placeholder grey', ph('Form only.'));
  low(id, 15);
});

// The fire: a ring of stones, cold ash, a few sticks.
group('fire', 'Cold fire', 'camp', 'A ring of stones with cold ash.');
solid('fire-ring', 'Fire ring', 'cylinder', 'fire', { x: 2.4, y: 2.4, z: 0.5 }, [-7.5, -7.5, 1.25], 'stone',
  { percent: 40, basis: 'inferred', note: 'Typical size. The fire is out.' });
reserve(-7.5, -7.5, 2.4, 2.4);
solid('fire-ash', 'Cold ash', 'cylinder', 'fire', { x: 1.8, y: 1.8, z: 0.05 }, [-7.5, -7.5, 1.03], 'stone',
  { percent: 40, basis: 'inferred', note: 'Ash, cold. Size approximate.' });
low('fire', 40);

// Bones on the terrace: bleached skulls and fragments, the herds gone.
group('bones', 'Bones on the terrace', 'camp', 'Bleached bison skulls and fragments. Their number and placement are a scene choice.');
for (let i = 0; i < 6; i++) {
  const p = findSpot(1.5, 1.0, null) || { x: -13 + i * 4, y: 6.5 };
  solid('skull-' + (i + 1), 'Skull ' + (i + 1), 'box', 'bones', { x: 1.4, y: 0.8, z: 0.8 }, [p.x, p.y, 1.4], 'bone',
    { percent: 40, basis: 'inferred', note: 'Scene choice. Shape generic, not a particular skull.' });
}
for (let i = 0; i < 8; i++) {
  const d = between(0.2, 0.5), h = between(0.2, 0.4);
  const p = findSpot(d, d, null) || { x: 0, y: 0 };
  solid('bone-frag-' + (i + 1), 'Bone fragment ' + (i + 1), 'box', 'bones', { x: d, y: d, z: h }, [p.x, p.y, 1 + h / 2], 'bone',
    { percent: 40, basis: 'inferred', note: 'Scene choice.' });
}
low('bones', 40);

// Camp goods: bundles (parfleches) and cooking pots, near the travois and lodges.
group('goods', 'Camp goods (bundles and pots)', 'camp', 'Bundles and cooking pots by the lodges and travois.');
for (let i = 0; i < 12; i++) {
  const dx = between(0.8, 1.6), dy = between(0.8, 1.4), dz = between(0.5, 0.9);
  const p = findSpot(dx, dy, null) || { x: 0, y: 0 };
  solid('bundle-' + (i + 1), 'Bundle ' + (i + 1), 'box', 'goods', { x: dx, y: dy, z: dz }, [p.x, p.y, 1 + dz / 2], 'hide and cloth',
    { percent: 45, basis: 'inferred', note: 'Bundle shape generic; contents not known.' });
}
for (let i = 0; i < 6; i++) {
  const d = between(0.7, 1.0);
  const p = findSpot(d, d, null) || { x: 0, y: 0 };
  solid('pot-' + (i + 1), 'Cooking pot ' + (i + 1), 'cylinder', 'goods', { x: d, y: d, z: 0.5 }, [p.x, p.y, 1.25], 'iron',
    { percent: 45, basis: 'inferred', note: 'Pot shape generic.' });
}
low('goods', 45);

// Sage shrubs and grass tufts across the terrace, and stones.
group('stones', 'Stones (generic)', 'camp', 'Scattered stones on the terrace.');
for (let i = 0; i < 90; i++) {
  const dx = between(0.3, 0.8), dy = between(0.3, 0.8), dz = between(0.2, 0.5);
  const p = findSpot(dx, dy, null, 0.05);
  if (!p) continue;
  solid('stone-' + (i + 1), 'Stone ' + (i + 1), 'box', 'stones', { x: dx, y: dy, z: dz }, [p.x, p.y, 1 + dz / 2], 'stone',
    { percent: 40, basis: 'inferred', note: 'Shape generic.' });
}
low('stones', 40);

group('shrubs', 'Sage shrubs (generic)', 'camp', 'Generic shrub masses. Sizes are not measured.');
for (let i = 0; i < 90; i++) {
  const d = between(0.9, 1.8);
  const p = findSpot(d, d, null, 0.05);
  if (!p) continue;
  solid('shrub-' + (i + 1), 'Sage shrub ' + (i + 1), 'sphere', 'shrubs', { x: d, y: d, z: d }, [p.x, p.y, 1 + d / 2], 'sage',
    { percent: 40, basis: 'decorative', note: 'Generic shape. Size not measured.' });
}
for (let i = 0; i < 120; i++) {
  const d = between(0.4, 0.8);
  const p = findSpot(d, d, null, 0.03);
  if (!p) continue;
  solid('scrub-' + (i + 1), 'Sage scrub ' + (i + 1), 'sphere', 'shrubs', { x: d, y: d, z: d }, [p.x, p.y, 1 + d / 2], 'sage',
    { percent: 40, basis: 'decorative', note: 'Generic scrub. Size not measured.' });
}
low('shrubs', 40);

group('grass', 'Grass tufts (generic)', 'camp', 'Generic grass tufts. Sizes are not measured.');
for (let i = 0; i < 300; i++) {
  const d = between(0.3, 0.6), h = r1(d * 1.6);
  const p = findSpot(d, d, null, 0.05);
  if (!p) continue;
  solid('grass-' + (i + 1), 'Grass tuft ' + (i + 1), 'cone', 'grass', { x: d, y: d, z: h }, [p.x, p.y, 1 + h / 2], 'grass',
    { percent: 35, basis: 'decorative', note: 'Decoration. Size not measured.' });
}
low('grass', 35);



// Cottonwoods along the creek: a trunk (on the ground) and a leafy crown above it.
group('trees', 'Cottonwoods along the creek (generic)', 'camp', 'Generic cottonwoods. Heights and crowns are not measured.');
[-8, -3, 2, 7].forEach((y, i) => {
  const trunkH = between(4.5, 5.5);
  solid('tree-' + (i + 1) + '-trunk', 'Cottonwood ' + (i + 1) + ' trunk', 'cylinder', 'trees', { x: 0.7, y: 0.7, z: trunkH }, [12.5, y, 1 + trunkH / 2], 'wood',
    { percent: 60, basis: 'inferred', note: 'Trunk approximate.' });
  solid('tree-' + (i + 1) + '-crown', 'Cottonwood ' + (i + 1) + ' crown', 'sphere', 'trees', { x: 4.2, y: 4.2, z: 4.2 }, [12.5, y, 1 + trunkH + 1.2], 'sage',
    { percent: 30, basis: 'decorative', note: 'Crown generic; not measured.' });
  reserve(12.5, y, 0.8, 0.8);
});
low('trees', 30);

// The label plate, at the front edge.
solid('label-plate', 'Label plate', 'box', 'camp', { x: 6, y: 0.3, z: 1.2 }, [0, -9.8, 1.6], 'brass',
  { percent: 100, basis: 'decorative', note: 'Label carrier.' },
  'Label text: "Southern Cheyenne camp move, 1870s. Draft. Not reviewed by the Cheyenne and Arapaho Tribes."');

// ---------- flags: consultation for the people, the animals, the lodges and the travois; uncertain for the rest ----------
const G = (uuid) => objects.find(o => o.uuid === uuid);
const flagText = {
  camp: ['consultation', 'Display needs review by the Cheyenne and Arapaho Tribes (see research/consultation-plan.md). The whole camp is a draft until then.'],
  lodges: ['consultation', 'The lodge shapes and the way the cover is folded need checking against Cheyenne practice.'],
  travois: ['consultation', 'The travois sizes and the load are approximate. Check the load and how it was packed.'],
  horses: ['consultation', 'The horses are placeholders. Breed, tack and colour are not claimed. Check with consultants before any display.'],
  figures: ['consultation', 'The people are placeholder forms only. They must not stand in for real people. Review before any display.'],
  bluff: ['uncertain', 'The bluff is invented to frame the camp. It has no source.'],
  shrubs: ['uncertain', 'Shrubs are generic. Their size and count are not measured.'],
  grass: ['uncertain', 'Grass tufts are decoration. Their size is not measured.'],
  stones: ['uncertain', 'Stones are generic. Their size is not measured.'],
  trees: ['uncertain', 'The cottonwoods are generic. Heights and crowns are not measured.'],
  fire: ['uncertain', 'The fire ring size is typical, and the cold ash is an assumption.'],
  bones: ['uncertain', 'The bones show the herds were gone. Their number and placement are a scene choice; sources give the bone trade, not this camp.'],
  goods: ['uncertain', 'Bundles and pots are generic. Their contents are not known.']
};
let n = 0;
const flagOrder = ['camp', 'lodges', 'travois', 'horses', 'figures', 'bluff', 'shrubs', 'grass', 'stones', 'trees', 'fire', 'bones', 'goods'];
flagOrder.forEach((uuid) => {
  const always = ['camp', 'lodges', 'travois', 'horses', 'figures'];
  if (always.indexOf(uuid) < 0 && !groupsWithLow.has(uuid)) return;
  if (!G(uuid)) return;
  n++;
  flags.push({ id: 'F' + n, kind: flagText[uuid][0], target: uuid, text: flagText[uuid][1] });
});
// Warnings in any group without its own flag would be left unexplained; the build reports them.

module.exports = { header, objects, flags };
