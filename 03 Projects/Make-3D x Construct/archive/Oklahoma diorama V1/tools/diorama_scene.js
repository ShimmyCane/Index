// The sample scene: a Southern Cheyenne camp move on the North Fork of the Canadian, Indian Territory, 1870s.
// A DRAFT for consultation. Not for display until the consultation flags are closed (research/consultation-plan.md).
// It shows no named person, no particular family or event, and no ceremonial or sacred object.
//
// Scale 1:24, so 1 in = 2 ft: a 16 ft lodge is 8 in tall; a 5 ft horse is 2.5 in at the shoulder; a 5.5 ft person is 2.8 in.
//
// Three planes, each with its own detail budget (see 04 AI/3d_scene_craft_lessons.md):
//   Foreground: the horses, the label, the front tuft. Sharpest, most detailed, strongest contrast.
//   Midground:  the lodges, the struck cover, the travois, the people, the fire, the bones. Where the story happens.
//   Background: the bluff (layered, lighter, lower contrast), the backdrop, the ground, the back tufts.
// Certainty percent = how sure we are the size and shape are right as drawn (0-100).
// Basis = where the number came from: measured | cited | user | inferred | placeholder | decorative.

const header = {
  name: 'Southern Cheyenne camp move, Indian Territory, 1870s (draft)',
  model_id: 'plains-diorama-v05',
  description: 'A draft diorama of a camp move in three planes: horses in front, lodges and travois and people in the middle, a layered bluff behind. Figures are placeholder forms. Not reviewed by the Cheyenne and Arapaho Tribes; not for display.',
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

// A lodge: a hide cover on a cone, four poles meeting at the top (N, S, E, W), a door on the south side.
function lodge(id, name, x, y, dia, h, parent) {
  const r = dia / 2;
  grp(id, name, parent, 'A lodge: hide cover on poles that meet at the top, with a door to the south. Size approximate.');
  part(id + '-cover', 'Hide cover', 'cone', id, { x: dia, y: dia, z: h }, [x, y, 1 + h / 2], 'hide',
    C(60, 'General tipi form. Diameter and height approximate.'));
  const len = Math.sqrt(r * r + h * h) + 0.2;
  const tilt = Math.atan(r / h) * 180 / Math.PI;
  const poleC = C(55, 'Lodge pole. Length and angle approximate.');
  part(id + '-pole-n', 'Pole (north)', 'cylinder', id, { x: 0.2, y: 0.2, z: len }, [x, y + r / 2, 1 + h / 2], 'wood', poleC, { rotation_x: round(tilt) });
  part(id + '-pole-s', 'Pole (south)', 'cylinder', id, { x: 0.2, y: 0.2, z: len }, [x, y - r / 2, 1 + h / 2], 'wood', poleC, { rotation_x: round(-tilt) });
  part(id + '-pole-e', 'Pole (east)', 'cylinder', id, { x: 0.2, y: 0.2, z: len }, [x + r / 2, y, 1 + h / 2], 'wood', poleC, { rotation_y: round(-tilt) });
  part(id + '-pole-w', 'Pole (west)', 'cylinder', id, { x: 0.2, y: 0.2, z: len }, [x - r / 2, y, 1 + h / 2], 'wood', poleC, { rotation_y: round(tilt) });
  const doorZ = 1 + h * 0.225, doorR = r * (1 - 0.225);
  part(id + '-door', 'Door opening', 'box', id, { x: dia * 0.22, y: 0.12, z: h * 0.45 }, [x, y - doorR - 0.04, doorZ], 'dark',
    C(40, 'The door opening. Its size and the flap are approximate.'));
}

// The struck cover: two folded panels with a fold strip, the poles laid side by side and tied with a strap.
function struckLodge(parent) {
  const x = -2, y = -4;
  part('struck-cover-top', 'Folded cover (top panel)', 'box', parent, { x: 4.5, y: 3, z: 0.25 }, [x, y, 1.6], 'hide',
    C(50, 'The folded cover. Size approximate.'));
  part('struck-cover-bottom', 'Folded cover (under panel)', 'box', parent, { x: 4.5, y: 3, z: 0.25 }, [x, y, 1.3], 'hide',
    C(50, 'The folded cover, under panel. Size approximate.'));
  part('struck-cover-fold', 'Fold strip', 'box', parent, { x: 4.5, y: 0.2, z: 0.6 }, [x, y, 1.45], 'dark',
    C(40, 'The fold along the middle of the cover.'));
  [-0.45, 0, 0.45].forEach((dx, i) =>
    part('struck-pole-' + (i + 1), 'Struck pole ' + (i + 1), 'box', parent, { x: 0.28, y: 8, z: 0.28 }, [x - 2.4 + dx, y, 1.14], 'wood',
      C(50, 'Pole laid beside the cover. Length approximate.')));
  part('struck-strap', 'Tie strap', 'box', parent, { x: 1.6, y: 0.1, z: 0.1 }, [x - 2.4, y, 1.45], 'dark',
    C(40, 'The strap that ties the poles.'));
}

// A horse, standing, facing +x. Real proportions at 1:24: about 2.5 in at the shoulder, 3.6 in long.
function horse(id, name, x, y, parent) {
  const legH = 1.75, bodyZ = 1 + legH + 0.55;
  grp(id, name, parent, 'A horse standing, facing right. A placeholder silhouette in real proportions; no breed, tack or colour is claimed.');
  part(id + '-barrel', 'Barrel (body)', 'cylinder', id, { x: 1.1, y: 1.1, z: 3.2 }, [x, y, bodyZ], 'horse bay',
    SIL('Body shape from a horse body plan.'), { rotation_y: 90 });
  part(id + '-neck', 'Neck', 'cylinder', id, { x: 0.6, y: 0.6, z: 1.9 }, [x + 1.9, y, bodyZ + 0.9], 'horse bay', SIL('Neck, raised.'), { rotation_y: 30 });
  part(id + '-mane', 'Mane', 'box', id, { x: 0.18, y: 0.18, z: 1.6 }, [x + 1.95, y, bodyZ + 1.25], 'horse dark', SIL('Mane along the neck.'), { rotation_y: 30 });
  part(id + '-head', 'Head', 'box', id, { x: 0.95, y: 0.5, z: 0.55 }, [x + 2.85, y, bodyZ + 1.7], 'horse dark', SIL('Head, lowered.'), { rotation_y: 40 });
  part(id + '-muzzle', 'Muzzle', 'box', id, { x: 0.7, y: 0.38, z: 0.4 }, [x + 3.45, y, bodyZ + 1.3], 'horse dark', SIL('Muzzle.'), { rotation_y: 40 });
  part(id + '-ear-l', 'Ear (left)', 'cone', id, { x: 0.14, y: 0.14, z: 0.3 }, [x + 2.75, y - 0.14, bodyZ + 2.3], 'horse dark', SIL('Ear.'));
  part(id + '-ear-r', 'Ear (right)', 'cone', id, { x: 0.14, y: 0.14, z: 0.3 }, [x + 2.75, y + 0.14, bodyZ + 2.3], 'horse dark', SIL('Ear.'));
  part(id + '-tail', 'Tail', 'cylinder', id, { x: 0.28, y: 0.28, z: 1.6 }, [x - 2.2, y, bodyZ - 0.5], 'horse dark', SIL('Tail, hanging from the rump.'), { rotation_y: 24 });
  [[1.2, -0.36], [1.2, 0.36], [-1.2, -0.36], [-1.2, 0.36]].forEach((o, i) =>
    part(id + '-leg-' + (i + 1), 'Leg ' + (i + 1), 'cylinder', id, { x: 0.26, y: 0.26, z: legH }, [x + o[0], y + o[1], 1 + legH / 2], 'horse dark', SIL('Leg.')));
}

// A person, placeholder form, in a pose. Real proportions at 1:24 (5.5 ft = 2.8 in).
// No face: the head is a plain form. No hair or clothing pattern. Legs and feet on the ground; arms and hands in a pose.
// s = scale (1 for an adult, 0.7 for a child). Heights are in units of s above the ground (z = 1).
function person(id, name, x, y, parent, o) {
  const s = o.scale, z = (v) => 1 + v * s;
  grp(id, name, parent, 'A placeholder form in a pose: no face, no hair, no clothing pattern, no regalia.');
  // legs and feet (walking: one leg forward, one back)
  [[-0.2, o.walk ? 12 : 0], [0.2, o.walk ? -12 : 0]].forEach(([dx, tilt], i) => {
    part(id + '-leg-' + (i + 1), 'Leg ' + (i + 1), 'cylinder', id, { x: 0.3 * s, y: 0.3 * s, z: 1.1 * s },
      [x + dx * s, y, z(0.55)], 'hide and cloth', PH('Leg. Form only.'), tilt ? { rotation_x: tilt } : undefined);
    part(id + '-foot-' + (i + 1), 'Foot ' + (i + 1), 'box', id, { x: 0.36 * s, y: 0.6 * s, z: 0.2 * s },
      [x + dx * s, y + 0.5 * s, z(0.1)], 'dark', PH('Foot. Form only.'));
  });
  // a skirt for a woman: a cone, wide at the hem, from above the knees to the shoulders
  if (o.skirt) {
    part(id + '-skirt', 'Skirt', 'cone', id, { x: 1.1 * s, y: 1.1 * s, z: 1.4 * s }, [x, y, z(1.3)], o.cloth || 'hide and cloth',
      PH('Skirt shape. Form only.'));
  }
  // torso
  part(id + '-torso', 'Torso', 'cylinder', id, { x: 0.9 * s, y: 0.9 * s, z: 0.95 * s }, [x, y, z(1.575)], o.cloth || 'hide and cloth',
    PH('Torso. Form only.'));
  // arms with a pose: 'walk' swings them; 'rest' lets them hang
  [-1, 1].forEach((side) => {
    const swing = o.walk ? (side < 0 ? -18 : 18) : 0;
    part(id + '-arm-' + (side < 0 ? 'l' : 'r'), side < 0 ? 'Arm (left)' : 'Arm (right)', 'cylinder', id,
      { x: 0.22 * s, y: 0.22 * s, z: 0.95 * s }, [x + side * 0.56 * s, y, z(1.45)], 'clay', PH('Arm. Form only.'),
      { rotation_y: round(side * 8), rotation_x: swing });
    part(id + '-hand-' + (side < 0 ? 'l' : 'r'), side < 0 ? 'Hand (left)' : 'Hand (right)', 'sphere', id,
      { x: 0.24 * s, y: 0.24 * s, z: 0.24 * s }, [x + side * 0.6 * s, y, z(0.95)], 'clay', PH('Hand. Form only.'));
  });
  // neck and head (no face)
  part(id + '-neck', 'Neck', 'cylinder', id, { x: 0.28 * s, y: 0.28 * s, z: 0.2 * s }, [x, y, z(2.15)], 'clay', PH('Neck. Form only.'));
  part(id + '-head', 'Head', 'sphere', id, { x: 0.55 * s, y: 0.55 * s, z: 0.55 * s }, [x, y, z(2.52)], 'clay', PH('Head. Form only. No face.'));
}

// A travois: two drag poles along y, a cross bar at the front, a load on the poles. The load has
// a bundle, a rolled hide, two straps and (for the front frame) a cooking pot.
function travois(id, name, x, y, parent, front) {
  grp(id, name, parent, 'A drag frame of two poles and a cross bar, with a load. Lengths approximate.');
  const c = C(55, 'Travois form from the research; length approximate.');
  part(id + '-pole-l', 'Pole (left)', 'box', id, { x: 0.3, y: 7.5, z: 0.3 }, [x - 0.4, y, 1.15], 'wood', c);
  part(id + '-pole-r', 'Pole (right)', 'box', id, { x: 0.3, y: 7.5, z: 0.3 }, [x + 0.4, y, 1.15], 'wood', c);
  part(id + '-bar', 'Cross bar', 'box', id, { x: 1.6, y: 0.3, z: 0.3 }, [x, y - 3.75, 1.15], 'wood', c);
  part(id + '-load', 'Bundle', 'box', id, { x: 2.0, y: 2.2, z: 1.2 }, [x, y + 0.5, 1.2 + 0.6], 'hide and cloth',
    C(30, 'A block for the bundle. What it holds is not confirmed.', 'placeholder'));
  part(id + '-roll', 'Rolled hide', 'cylinder', id, { x: 0.7, y: 0.7, z: 2.0 }, [x, y + 0.5, 2.7], 'hide',
    C(30, 'A rolled hide on top of the bundle.', 'placeholder'), { rotation_y: 90 });
  [-0.5, 0.5].forEach((dy, i) =>
    part(id + '-strap-' + (i + 1), 'Strap ' + (i + 1), 'box', id, { x: 2.1, y: 0.1, z: 0.1 }, [x, y + 0.5 + dy * 2, 2.1], 'dark',
      C(40, 'A strap over the load.')));
  if (front) {
    part(id + '-pot', 'Cooking pot', 'cylinder', id, { x: 0.8, y: 0.8, z: 0.5 }, [x + 0.2, y + 2.0, 2.0 + 0.45], 'iron',
      C(45, 'Pot shape generic.'));
  }
}

// The bones: a bison skull with horns, and three vertebrae in a short line, on the midground terrace.
function bones(parent) {
  const x = 3.0, y = 0.5;
  grp('bones', 'Bison skull and vertebrae', parent, 'One bleached skull with horns and three vertebrae. A scene choice that carries the story: the herds are gone.');
  part('skull-cranium', 'Skull (cranium)', 'box', 'bones', { x: 1.1, y: 0.9, z: 0.8 }, [x, y, 1.4], 'bone',
    C(40, 'Scene choice. Shape generic, not a particular skull.'));
  part('skull-snout', 'Skull (snout)', 'box', 'bones', { x: 0.6, y: 0.6, z: 0.5 }, [x + 0.8, y, 1.3], 'bone',
    C(40, 'Scene choice.'));
  [-1, 1].forEach((side) =>
    part('skull-horn-' + (side < 0 ? 'l' : 'r'), side < 0 ? 'Horn (left)' : 'Horn (right)', 'cone', 'bones',
      { x: 0.22, y: 0.22, z: 0.8 }, [x - 0.1, y + side * 0.6, 1.9], 'bone', C(40, 'Horn, generic.'), { rotation_x: round(side * 60) }));
  [0, 1, 2].forEach((i) =>
    part('vertebra-' + (i + 1), 'Vertebra ' + (i + 1), 'cylinder', 'bones', { x: 0.35, y: 0.35, z: 0.25 }, [x, y - 1.3 - i * 0.5, 1.12], 'bone',
      C(40, 'Scene choice.')));
}

// Round the ridge into layers: a lower base, a stone band, a ledge, and a lighter far cap.
function bluff(parent) {
  grp('ridge', 'Bluff (layers, background)', parent, 'Layers at the back of the camp, invented to frame it. Heights approximate.');
  part('ridge-base', 'Bluff base', 'box', 'ridge', { x: 22, y: 3.5, z: 2 }, [0, 8.25, 2.0], 'haze', C(35, 'Invented to frame the camp. Set behind the lodges.'));
  part('ridge-band', 'Stone band', 'box', 'ridge', { x: 21, y: 3.2, z: 0.7 }, [0, 8.25, 3.35], 'stone', C(35, 'Invented to frame the camp.'));
  part('ridge-ledge', 'Ledge', 'box', 'ridge', { x: 19, y: 2.6, z: 0.5 }, [0, 8.25, 4.0], 'haze', C(35, 'Invented to frame the camp.'));
  part('ridge-cap', 'Bluff cap', 'box', 'ridge', { x: 17, y: 2.2, z: 1.0 }, [0, 8.3, 4.75], 'haze', C(35, 'Invented to frame the camp.'));
}

// ---------- the scene, in three planes ----------
grp('camp', 'Camp move (draft)', undefined, 'Root group. A Southern Cheyenne camp move on a river terrace on the North Fork of the Canadian. Not reviewed by the tribes.');
grp('back', 'Background: far ground, bluff, backdrop, back tufts', 'camp', 'The far plane: lower contrast, less detail, place and scale.');
grp('mid', 'Midground: lodges, travois, people, fire, bones', 'camp', 'The middle plane: where the story happens. The most useful detail.');
grp('fore', 'Foreground: horses, label, front tuft', 'camp', 'The near plane: sharpest, most detailed, strongest contrast.');

part('ground', 'River terrace ground', 'box', 'back', { x: 30, y: 20, z: 1 }, [0, 0, 0.5], 'prairie earth',
  C(70, 'Flat river terrace. No site survey; the shape is generic.'));
bluff('back');
part('backdrop', 'Painted backdrop wall', 'box', 'back', { x: 30, y: 0.5, z: 14 }, [0, 10.25, 8], 'painted',
  { percent: 100, basis: 'decorative', note: 'Flat wall of the diorama box. The painting is not modelled.' });
grp('tufts', 'Grass tufts (back)', 'back', 'Clumps of grass at the back. Decoration; sizes are not measured.');
[[9, 6], [11, 3]].forEach((p, i) => {
  [[0, 0, 0.5, 0.8], [0.25, -0.15, 0.35, 0.6], [-0.2, 0.2, 0.4, 0.7]].forEach((b, k) =>
    part('tuft-' + (i + 1) + '-' + (k + 1), 'Tuft ' + (i + 1) + ' blade ' + (k + 1), 'cone', 'tufts',
      { x: b[2], y: b[2], z: b[3] }, [p[0] + b[0], p[1] + b[1], 1 + b[3] / 2], 'grass',
      { percent: 30, basis: 'decorative', note: 'Decoration. Size not measured.' }));
});

grp('lodges', 'Lodges (standing and struck)', 'mid', 'Two standing lodges and one struck lodge cover with its poles.');
lodge('lodge-1', 'Lodge 1 (standing, large)', -7, 3, 7, 8, 'lodges');
lodge('lodge-2', 'Lodge 2 (standing, small)', -11, -1, 6, 7, 'lodges');
struckLodge('lodges');

grp('travois', 'Travois (two frames, loaded)', 'mid', 'Two drag frames loaded for the move.');
travois('travois-a', 'Travois A', 1.5, -3, 'travois', false);
travois('travois-b', 'Travois B', 5.5, 0, 'travois', false);

grp('figures', 'People (placeholder forms)', 'mid', 'Three placeholder forms in poses: two women and a child. No faces, no hair, no clothing pattern, no regalia.');
person('woman-a', 'Woman A (placeholder)', -5, -2, 'figures', { scale: 1, skirt: true, walk: true, cloth: 'hide and cloth' });
person('child-a', 'Child (placeholder)', -1, 1.5, 'figures', { scale: 0.7, walk: true, cloth: 'red cloth' });
person('woman-b', 'Woman B (placeholder)', 9, 3, 'figures', { scale: 1, skirt: true, walk: false, cloth: 'hide and cloth' });

grp('fire-ring', 'Fire ring (cold)', 'mid', 'A ring of stones around cold ash.');
part('fire-ash', 'Cold ash', 'cylinder', 'fire-ring', { x: 1.8, y: 1.8, z: 0.05 }, [-8, -6, 1.03], 'ash', C(40, 'Cold ash. Size approximate.'));
for (let i = 0; i < 8; i++) {
  const a = i * Math.PI / 4;
  part('fire-stone-' + (i + 1), 'Fire stone ' + (i + 1), 'cylinder', 'fire-ring',
    { x: 0.45, y: 0.45, z: 0.3 }, [-8 + Math.cos(a) * 1.15, -6 + Math.sin(a) * 1.15, 1.15], 'stone', C(40, 'Typical stone. Size approximate.'));
}

bones('mid');

grp('horses', 'Horses (placeholder)', 'fore', 'Two horses, placeholder silhouettes in real proportions. No breed, tack or colour is claimed.');
horse('horse-1', 'Horse 1 (front)', 6, -8.5, 'horses');
horse('horse-2', 'Horse 2 (by the cover)', -5, -8.5, 'horses');

grp('tuft-front', 'Grass tuft (front)', 'fore', 'A clump of grass at the front. Decoration; size not measured.');
[[0, 0, 0.5, 0.8], [0.25, -0.15, 0.35, 0.6], [-0.2, 0.2, 0.4, 0.7]].forEach((b, k) =>
  part('tuft-3-' + (k + 1), 'Tuft 3 blade ' + (k + 1), 'cone', 'tuft-front',
    { x: b[2], y: b[2], z: b[3] }, [-12 + b[0], -6 + b[1], 1 + b[3] / 2], 'grass',
    { percent: 30, basis: 'decorative', note: 'Decoration. Size not measured.' }));

part('label-plate', 'Label plate', 'box', 'fore', { x: 6, y: 0.3, z: 1.2 }, [0, -9.8, 1.6], 'brass',
  { percent: 100, basis: 'decorative', note: 'Label carrier.' });

// ---------- flags ----------
// Consultation: the people, horses, lodges and travois (and the camp as a whole). Uncertain: the rest.
const flagFor = [
  ['camp', 'consultation', 'Display needs review by the Cheyenne and Arapaho Tribes (see research/consultation-plan.md). The whole camp is a draft until then. Not for display.'],
  ['lodges', 'consultation', 'The lodge shapes, the pole angles, the door and the struck cover need checking against Cheyenne practice.'],
  ['travois', 'consultation', 'The travois sizes and the loads are approximate. Check the load and how it was packed.'],
  ['horses', 'consultation', 'The horses are placeholder silhouettes in real proportions. Breed, tack and colour are not claimed.'],
  ['figures', 'consultation', 'The people are placeholder forms in poses, with no faces, no hair and no clothing pattern. They must not stand in for real people.'],
  ['bones', 'uncertain', 'The skull and vertebrae are a scene choice. They are not a particular skull.'],
  ['ridge', 'uncertain', 'The bluff is invented to frame the camp. It has no source.'],
  ['fire-ring', 'uncertain', 'The fire ring size is typical, and the cold ash is an assumption.'],
  ['tufts', 'uncertain', 'The grass tufts are decoration; their size is not measured.'],
  ['tuft-front', 'uncertain', 'The grass tuft is decoration; its size is not measured.']
];
flagFor.forEach(([target, kind, text], i) => flags.push({ id: 'F' + (i + 1), kind, target, text }));

module.exports = { header, objects, flags };
