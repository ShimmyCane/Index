// The sample scene: a Southern Cheyenne camp move on the North Fork of the Canadian, Indian Territory, 1870s.
// A DRAFT for consultation: the Cheyenne and Arapaho Tribes have not reviewed it. Not for display until the
// consultation flags are closed (see research/consultation-plan.md and the gate in ⚙️).
// It shows no named person, no particular family or event, and no ceremonial or sacred object.
//
// Scale 1:24, so 1 in = 2 ft. Sizes are real sizes halved: a 16 ft lodge is 8 in tall, a 5 ft horse
// stands 2.5 in at the shoulder, a 5.5 ft person is about 2.8 in tall.
//
// The layout is the round 3 layout. Nothing is added for its own sake: each existing object is built
// from its real parts (poles, door, legs, head) instead of one block. Run: node tools/build_sample.js.
//
// Certainty percent = how sure we are the size and shape are right as drawn (0-100).
// Basis = where the number came from: measured | cited | user | inferred | placeholder | decorative.

const header = {
  name: 'Southern Cheyenne camp move, Indian Territory, 1870s (draft for consultation)',
  model_id: 'plains-diorama-v04',
  description: 'A draft diorama of a camp move: lodges with poles and doors, a travois loaded for the move, two horses, three people as placeholder forms. Not reviewed by the Cheyenne and Arapaho Tribes; not for display.',
  scale: '1:24 (1 in = 2 ft)',
  units: 'in',
  up: 'z',
  world: 'plains-diorama-world'
};

const objects = [];
const flags = [];
const round = (v) => Math.round(v * 100) / 100;
const grp = (uuid, name, parent, description) =>
  objects.push({ uuid, name, type: 'group', parent, ...(description ? { description } : {}) });
// rot: optional { rotation_x, rotation_y, rotation_z } in degrees
const part = (uuid, name, type, parent, dims, pos, material, cert, rot) => {
  const o = { uuid, name, type, parent, dimensions: dims, position: pos.map(round), material, certainty: cert, ...(rot || {}) };
  objects.push(o);
  return o;
};
const C = (percent, note, basis) => ({ percent, basis: basis || 'inferred', note });
const PH = (note) => ({ percent: 15, basis: 'placeholder', note });
const SIL = (note) => ({ percent: 20, basis: 'placeholder', note });

// A lodge: a hide cover on a cone, four poles meeting at the top (N, S, E, W), and a door on the south side.
// Poles are tilted about one axis each, so they lean in exactly toward the apex.
function lodge(id, name, x, y, dia, h, parent) {
  const r = dia / 2;
  grp(id, name, parent, 'A lodge: hide cover on poles that meet at the top, with a door to the south. Size approximate.');
  part(id + '-cover', 'Hide cover', 'cone', id, { x: dia, y: dia, z: h }, [x, y, 1 + h / 2], 'hide',
    C(60, 'General tipi form. Diameter and height approximate.'));
  const len = Math.sqrt(r * r + h * h) + 0.2;             // pole length, from the ground to just past the top
  const tilt = Math.atan(r / h) * 180 / Math.PI;           // how far each pole leans from upright
  const poleC = C(55, 'Lodge pole. Length and angle approximate.');
  part(id + '-pole-n', 'Pole (north)', 'cylinder', id, { x: 0.2, y: 0.2, z: len }, [x, y + r / 2, 1 + h / 2], 'wood', poleC, { rotation_x: round(tilt) });
  part(id + '-pole-s', 'Pole (south)', 'cylinder', id, { x: 0.2, y: 0.2, z: len }, [x, y - r / 2, 1 + h / 2], 'wood', poleC, { rotation_x: round(-tilt) });
  part(id + '-pole-e', 'Pole (east)', 'cylinder', id, { x: 0.2, y: 0.2, z: len }, [x + r / 2, y, 1 + h / 2], 'wood', poleC, { rotation_y: round(-tilt) });
  part(id + '-pole-w', 'Pole (west)', 'cylinder', id, { x: 0.2, y: 0.2, z: len }, [x - r / 2, y, 1 + h / 2], 'wood', poleC, { rotation_y: round(tilt) });
  const doorZ = 1 + h * 0.225;                             // the door is the lower part of the south face
  const doorR = r * (1 - 0.225);                           // the cover's radius at that height
  part(id + '-door', 'Door opening', 'box', id, { x: dia * 0.22, y: 0.12, z: h * 0.45 }, [x, y - doorR - 0.04, doorZ], 'dark',
    C(40, 'The door opening. Its size and the flap are approximate.'));
}

// A horse, standing, facing +x. Real proportions at 1:24: about 2.5 in at the shoulder, 3.6 in long.
// The barrel is a cylinder lying along the length; the neck and tail are tilted; the head tapers to a muzzle.
function horse(id, name, x, y, parent) {
  const legH = 1.75, bodyZ = 1 + legH + 0.55;
  grp(id, name, parent, 'A horse standing, facing right. A placeholder silhouette in real proportions; no breed, tack or colour is claimed.');
  part(id + '-barrel', 'Barrel (body)', 'cylinder', id, { x: 1.1, y: 1.1, z: 3.2 }, [x, y, bodyZ], 'horse bay',
    SIL('Body shape from a horse body plan.'), { rotation_y: 90 });
  part(id + '-neck', 'Neck', 'cylinder', id, { x: 0.6, y: 0.6, z: 1.9 }, [x + 1.9, y, bodyZ + 0.9], 'horse bay',
    SIL('Neck, raised.'), { rotation_y: 30 });
  part(id + '-mane', 'Mane', 'box', id, { x: 0.18, y: 0.18, z: 1.6 }, [x + 1.95, y, bodyZ + 1.25], 'horse dark',
    SIL('Mane along the neck.'), { rotation_y: 30 });
  part(id + '-head', 'Head', 'box', id, { x: 0.95, y: 0.5, z: 0.55 }, [x + 2.85, y, bodyZ + 1.7], 'horse dark',
    SIL('Head, lowered.'), { rotation_y: 40 });
  part(id + '-muzzle', 'Muzzle', 'box', id, { x: 0.7, y: 0.38, z: 0.4 }, [x + 3.45, y, bodyZ + 1.3], 'horse dark',
    SIL('Muzzle, narrower than the head.'), { rotation_y: 40 });
  part(id + '-ear-l', 'Ear (left)', 'cone', id, { x: 0.14, y: 0.14, z: 0.3 }, [x + 2.75, y - 0.14, bodyZ + 2.3], 'horse dark', SIL('Ear.'));
  part(id + '-ear-r', 'Ear (right)', 'cone', id, { x: 0.14, y: 0.14, z: 0.3 }, [x + 2.75, y + 0.14, bodyZ + 2.3], 'horse dark', SIL('Ear.'));
  part(id + '-tail', 'Tail', 'cylinder', id, { x: 0.28, y: 0.28, z: 1.6 }, [x - 2.2, y, bodyZ - 0.5], 'horse dark', SIL('Tail, hanging from the rump.'), { rotation_y: 24 });
  [[1.2, -0.36], [1.2, 0.36], [-1.2, -0.36], [-1.2, 0.36]].forEach((o, i) =>
    part(id + '-leg-' + (i + 1), 'Leg ' + (i + 1), 'cylinder', id, { x: 0.26, y: 0.26, z: legH }, [x + o[0], y + o[1], 1 + legH / 2], 'horse dark', SIL('Leg.')));
}

// A person, standing, facing the viewer. Real proportions at 1:24: about 2.8 in tall (5.5 ft).
// A woman has a skirt; a child is 0.7 of the height. No face, no hair detail, no regalia: a form only.
function person(id, name, x, y, parent, opts) {
  const s = opts.scale, cloth = opts.cloth || 'hide and cloth';
  grp(id, name, parent, 'A placeholder form in standing pose: no face, no hair detail, no clothing pattern, no regalia.');
  if (opts.skirt) {
    part(id + '-skirt', 'Skirt', 'cone', id, { x: 1.6 * s, y: 1.6 * s, z: 1.7 * s }, [x, y, 1 + 0.85 * s], cloth, PH('Skirt shape. Form only.'));
  } else {
    [-0.2, 0.2].forEach((dx, i) =>
      part(id + '-leg-' + (i + 1), 'Leg ' + (i + 1), 'cylinder', id, { x: 0.3 * s, y: 0.3 * s, z: 1.0 * s }, [x + dx * s, y, 1 + 0.5 * s], 'hide and cloth', PH('Leg. Form only.')));
  }
  part(id + '-torso', 'Torso', 'cylinder', id, { x: 0.85 * s, y: 0.85 * s, z: 0.9 * s }, [x, y, 1 + (opts.skirt ? 1.45 : 1.45) * s], cloth, PH('Torso. Form only.'));
  [-1, 1].forEach((side) =>
    part(id + '-arm-' + (side < 0 ? 'l' : 'r'), side < 0 ? 'Arm (left)' : 'Arm (right)', 'cylinder', id,
      { x: 0.22 * s, y: 0.22 * s, z: 0.95 * s }, [x + side * 0.56 * s, y, 1 + 1.4 * s], 'clay', PH('Arm. Form only.'),
      { rotation_y: round(side * 8) }));
  part(id + '-neck', 'Neck', 'cylinder', id, { x: 0.28 * s, y: 0.28 * s, z: 0.2 * s }, [x, y, 1 + 2.0 * s], 'clay', PH('Neck. Form only.'));
  part(id + '-head', 'Head', 'sphere', id, { x: 0.5 * s, y: 0.5 * s, z: 0.5 * s }, [x, y, 1 + 2.25 * s], 'clay', PH('Head. Form only. No face.'));
  part(id + '-hair', 'Hair', 'cylinder', id, { x: 0.5 * s, y: 0.5 * s, z: 0.12 * s }, [x, y + 0.02, 1 + 2.5 * s], 'dark', PH('Hair. Form only.'));
  if (opts.longHair) {
    part(id + '-hair-back', 'Hair (back)', 'cylinder', id, { x: 0.5 * s, y: 0.5 * s, z: 0.6 * s }, [x, y + 0.18 * s, 1 + 2.1 * s], 'dark', PH('Long hair at the back. Form only.'));
  }
}

// A travois: two drag poles along y, a cross bar at the front, and a load on the poles.
function travois(id, name, x, y, parent) {
  grp(id, name, parent, 'A drag frame of two poles and a cross bar, with a load. Lengths approximate.');
  const c = C(55, 'Travois form from the research; length approximate.');
  part(id + '-pole-l', 'Pole (left)', 'box', id, { x: 0.3, y: 7.5, z: 0.3 }, [x - 0.4, y, 1.15], 'wood', c);
  part(id + '-pole-r', 'Pole (right)', 'box', id, { x: 0.3, y: 7.5, z: 0.3 }, [x + 0.4, y, 1.15], 'wood', c);
  part(id + '-bar', 'Cross bar', 'box', id, { x: 1.6, y: 0.3, z: 0.3 }, [x, y - 3.75, 1.15], 'wood', c);
  part(id + '-load', 'Load of bundles', 'box', id, { x: 2.0, y: 2.2, z: 1.3 }, [x, y + 0.5, 1.3 + 0.65], 'hide and cloth',
    C(30, 'A block for the load. What it holds is not confirmed.', 'placeholder'));
}

// ---------- the scene (round 3 layout) ----------
grp('camp', 'Camp move (draft)', undefined, 'Root group. A Southern Cheyenne camp move on a river terrace on the North Fork of the Canadian. Not reviewed by the tribes.');
part('ground', 'River terrace ground', 'box', 'camp', { x: 30, y: 20, z: 1 }, [0, 0, 0.5], 'prairie earth',
  C(70, 'Flat river terrace. No site survey; the shape is generic.'));

grp('ridge', 'Low bluff (two layers)', 'camp', 'Two layers at the back of the camp, invented to frame it. Heights approximate.');
part('ridge-low', 'Bluff, lower layer', 'box', 'ridge', { x: 22, y: 5, z: 2 }, [0, 6, 2.0], 'prairie earth', C(35, 'Invented to frame the camp.'));
part('ridge-cap', 'Bluff, stone cap', 'box', 'ridge', { x: 18, y: 3.5, z: 1.5 }, [0, 6.6, 3.75], 'stone', C(35, 'Invented to frame the camp.'));

part('backdrop', 'Painted backdrop wall', 'box', 'camp', { x: 30, y: 0.5, z: 14 }, [0, 10.25, 8], 'painted',
  { percent: 100, basis: 'decorative', note: 'Flat wall of the diorama box. The painting is not modelled.' });

grp('lodges', 'Lodges (standing and struck)', 'camp', 'Two standing lodges and one struck lodge cover with its poles.');
lodge('lodge-1', 'Lodge 1 (standing, large)', -7, 3, 7, 8, 'lodges');
lodge('lodge-2', 'Lodge 2 (standing, small)', -11, -1, 6, 7, 'lodges');
part('struck-cover', 'Struck lodge cover (folded)', 'box', 'lodges', { x: 4.5, y: 3, z: 0.6 }, [-2, -4, 1.3], 'hide',
  C(50, 'The folded cover on the ground. Size approximate.'));
part('struck-poles', 'Struck lodge poles', 'box', 'lodges', { x: 0.3, y: 8, z: 0.3 }, [-2.6, -4, 1.15], 'wood',
  C(50, 'Poles laid beside the cover. Length approximate.'));

grp('travois', 'Travois (two frames, loaded)', 'camp', 'Two drag frames loaded for the move.');
travois('travois-a', 'Travois A', 1.5, -3, 'travois');
travois('travois-b', 'Travois B', 5.5, 0, 'travois');

grp('horses', 'Horses (placeholder)', 'camp', 'Two horses, placeholder silhouettes in real proportions. No breed, tack or colour is claimed.');
horse('horse-1', 'Horse 1 (front)', 6, -8.5, 'horses');
horse('horse-2', 'Horse 2 (by the cover)', -5, -8.5, 'horses');

grp('figures', 'People (placeholder forms)', 'camp', 'Three placeholder forms: two women and a child. No faces, hair detail, clothing pattern or regalia.');
person('woman-a', 'Woman A (placeholder)', -5, -2, 'figures', { scale: 1, skirt: true, longHair: true, cloth: 'hide and cloth' });
person('child-a', 'Child (placeholder)', -1, 1.5, 'figures', { scale: 0.7, cloth: 'red cloth' });
person('woman-b', 'Woman B (placeholder)', 9, 3, 'figures', { scale: 1, skirt: true, longHair: false, cloth: 'hide and cloth' });

grp('fire-ring', 'Fire ring (cold)', 'camp', 'A ring of stones around cold ash.');
part('fire-ash', 'Cold ash', 'cylinder', 'fire-ring', { x: 1.8, y: 1.8, z: 0.05 }, [-8, -6, 1.03], 'ash',
  C(40, 'Cold ash. Size approximate.'));
for (let i = 0; i < 8; i++) {
  const a = i * Math.PI / 4;
  part('fire-stone-' + (i + 1), 'Fire stone ' + (i + 1), 'cylinder', 'fire-ring',
    { x: 0.45, y: 0.45, z: 0.3 }, [-8 + Math.cos(a) * 1.15, -6 + Math.sin(a) * 1.15, 1.15], 'stone',
    C(40, 'Typical stone. Size approximate.'));
}

grp('tufts', 'Grass tufts (decorative)', 'camp', 'Clumps of grass. Decoration; sizes are not measured.');
[[9, 6], [11, 3], [-12, -6]].forEach((p, i) => {
  // each tuft is a few blades of different heights, not one cone
  [[0, 0, 0.5, 0.8], [0.25, -0.15, 0.35, 0.6], [-0.2, 0.2, 0.4, 0.7]].forEach((b, k) =>
    part('tuft-' + (i + 1) + '-' + (k + 1), 'Tuft ' + (i + 1) + ' blade ' + (k + 1), 'cone', 'tufts',
      { x: b[2], y: b[2], z: b[3] }, [p[0] + b[0], p[1] + b[1], 1 + b[3] / 2], 'grass',
      { percent: 30, basis: 'decorative', note: 'Decoration. Size not measured.' }));
});

part('label-plate', 'Label plate', 'box', 'camp', { x: 6, y: 0.3, z: 1.2 }, [0, -9.8, 1.6], 'brass',
  { percent: 100, basis: 'decorative', note: 'Label carrier.' },
  undefined);

// ---------- flags ----------
// Consultation: the people, horses, lodges and travois (and the camp as a whole). Uncertain: the rest.
const flagFor = [
  ['camp', 'consultation', 'Display needs review by the Cheyenne and Arapaho Tribes (see research/consultation-plan.md). The whole camp is a draft until then.'],
  ['lodges', 'consultation', 'The lodge shapes, the pole angles, the door and how the cover is folded need checking against Cheyenne practice.'],
  ['travois', 'consultation', 'The travois sizes and the load are approximate. Check the load and how it was packed.'],
  ['horses', 'consultation', 'The horses are placeholder silhouettes in real proportions. Breed, tack and colour are not claimed. Check with consultants before any display.'],
  ['figures', 'consultation', 'The people are placeholder forms only: no faces, hair detail, clothing or regalia. They must not stand in for real people. Review before any display.'],
  ['ridge', 'uncertain', 'The bluff is invented to frame the camp. It has no source.'],
  ['fire-ring', 'uncertain', 'The fire ring size is typical, and the cold ash is an assumption.'],
  ['tufts', 'uncertain', 'The grass tufts are decoration; their size is not measured.']
];
flagFor.forEach(([target, kind, text], i) => flags.push({ id: 'F' + (i + 1), kind, target, text }));

module.exports = { header, objects, flags };
