// The sample scene: a Southern Cheyenne camp move on the North Fork of the Canadian, Indian Territory, 1870s.
// A DRAFT. Consultation notes are on the flags (research/consultation-plan.md).
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
  description: 'A draft diorama of a camp move in three planes: horses in front, lodges and travois and people in the middle, a layered bluff behind. Figures are placeholder forms. Not reviewed by the Cheyenne and Arapaho Tribes.',
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

// A lofted surface: a smooth spine (joints) with cross-sections (rings: [t, w, h]). The part's position and size
// are the bounding box of the surface, so the rules and the certainty checks still work.
function loftPart(uuid, name, parent, joints, rings, facing, material, cert, description) {
  const maxR = Math.max(...rings.map(q => Math.max(q[1], q[2])));
  const lo = [0, 1, 2].map(k => Math.min(...joints.map(p => p[k])) - maxR);
  const hi = [0, 1, 2].map(k => Math.max(...joints.map(p => p[k])) + maxR);
  const obj = {
    uuid, name, type: 'loft', parent,
    joints: joints.map(p => p.map(round)),
    rings: rings.map(q => q.map(round)),
    dimensions: { x: round(hi[0] - lo[0]), y: round(hi[1] - lo[1]), z: round(hi[2] - lo[2]) },
    position: [0, 1, 2].map(k => round((lo[k] + hi[k]) / 2)),
    material, certainty: cert
  };
  if (facing) obj.facing = facing;
  if (description) obj.description = description;
  objects.push(obj);
  return obj;
}

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
// The barrel, neck, head, mane, tail and legs are lofted surfaces with the horse's own shapes.
function horse(id, name, x, y, parent) {
  grp(id, name, parent, 'A horse standing, facing right. A placeholder in real proportions; no breed, tack or colour is claimed.');
  const side = [0, 1, 0];
  loftPart(id + '-barrel', 'Barrel (body)', id,
    [[x - 1.7, y, 3.0], [x - 0.6, y, 3.2], [x + 0.8, y, 3.1], [x + 1.6, y, 2.9]],
    [[0, 0.32, 0.4], [0.3, 0.55, 0.5], [0.6, 0.55, 0.52], [1, 0.42, 0.42]], side, 'horse bay', SIL('Barrel from a horse body plan.'));
  loftPart(id + '-neck', 'Neck', id,
    [[x + 1.3, y, 3.1], [x + 1.9, y, 3.7], [x + 2.4, y, 4.4]],
    [[0, 0.32, 0.34], [0.5, 0.24, 0.26], [1, 0.2, 0.22]], side, 'horse bay', SIL('Neck, raised.'));
  loftPart(id + '-mane', 'Mane', id,
    [[x + 1.2, y, 3.7], [x + 1.75, y, 4.3], [x + 2.2, y, 5.0]],
    [[0, 0.06, 0.1], [1, 0.05, 0.08]], side, 'horse dark', SIL('Mane along the crest of the neck.'));
  loftPart(id + '-head', 'Head', id,
    [[x + 2.4, y, 4.3], [x + 2.9, y, 4.2], [x + 3.5, y, 3.6]],
    [[0, 0.22, 0.27], [0.5, 0.2, 0.22], [1, 0.13, 0.14]], side, 'horse dark', SIL('Head, lowered, tapering to the muzzle.'));
  part(id + '-ear-l', 'Ear (left)', 'cone', id, { x: 0.12, y: 0.12, z: 0.28 }, [x + 2.75, y - 0.12, 4.75], 'horse dark', SIL('Ear.'));
  part(id + '-ear-r', 'Ear (right)', 'cone', id, { x: 0.12, y: 0.12, z: 0.28 }, [x + 2.75, y + 0.12, 4.75], 'horse dark', SIL('Ear.'));
  loftPart(id + '-tail', 'Tail', id,
    [[x - 1.6, y, 3.1], [x - 2.0, y, 2.4], [x - 2.2, y, 1.4]],
    [[0, 0.1, 0.12], [0.6, 0.14, 0.14], [1, 0.07, 0.08]], side, 'horse dark', SIL('Tail, hanging from the rump.'));
  [[1.2, -0.36], [1.2, 0.36], [-1.2, -0.36], [-1.2, 0.36]].forEach((o, i) =>
    loftPart(id + '-leg-' + (i + 1), 'Leg ' + (i + 1), id,
      [[x + o[0], y + o[1], 2.9], [x + o[0], y + o[1], 2.05], [x + o[0] + 0.1, y + o[1], 1.22]],
      [[0, 0.22, 0.22], [0.5, 0.13, 0.13], [0.85, 0.12, 0.12], [1, 0.17, 0.13]], [1, 0, 0], 'horse dark', SIL('Leg with a hoof.')));
}

// A person, placeholder form, in a pose. Real proportions at 1:24 (5.5 ft = 2.8 in).
// Lofted torso, neck, head and limbs. Approximate general features on the face (eyes, brows, nose, mouth, ears):
// a general form, not a portrait of anyone. Clothing: a banded skirt for a woman, a cloth top, cloth sleeves.
// s = scale (1 adult, 0.7 child). Heights are in units of s above the ground (z = 1).
function person(id, name, x, y, parent, o) {
  const s = o.scale, z = (v) => 1 + v * s;
  const f = o.walk ? 1 : 0;                       // stride: the leading foot forward, the other back
  grp(id, name, parent, 'A placeholder person in a pose. Approximate general features; a form, not a portrait of anyone. Clothing is generic.');
  // legs and feet
  [[-0.2, 0.3 * f, 1], [0.2, -0.2 * f, -1]].forEach(([dx, fy], i) => {
    loftPart(id + '-leg-' + (i + 1), 'Leg ' + (i + 1), id,
      [[x + dx * s, y + fy * s * 0.5, z(1.15)], [x + dx * s, y + fy * s * 0.8, z(0.55)], [x + dx * s, y + fy * s, z(0.12)]],
      [[0, 0.16 * s, 0.16 * s], [0.5, 0.12 * s, 0.12 * s], [1, 0.1 * s, 0.1 * s]], [1, 0, 0], 'hide and cloth', PH('Leg. Form only.'));
    loftPart(id + '-foot-' + (i + 1), 'Foot ' + (i + 1), id,
      [[x + dx * s, y + fy * s - 0.15 * s, z(0.08)], [x + dx * s, y + fy * s + 0.3 * s, z(0.08)]],
      [[0, 0.1 * s, 0.09 * s], [1, 0.13 * s, 0.08 * s]], [1, 0, 0], 'dark', PH('Foot. Form only.'));
  });
  // skirt for a woman: from the waist down to the hem, banded pattern
  if (o.skirt) {
    loftPart(id + '-skirt', 'Skirt (banded)', id,
      [[x, y, z(1.45)], [x, y, z(1.0)], [x, y, z(0.45)]],
      [[0, 0.23 * s, 0.2 * s], [0.5, 0.32 * s, 0.28 * s], [1, 0.42 * s, 0.36 * s]], [1, 0, 0], 'pattern:bands', PH('Skirt with a band pattern. Generic.'));
  }
  // torso (a cloth top)
  loftPart(id + '-torso', 'Torso', id,
    [[x, y, z(1.15)], [x, y, z(1.5)], [x, y, z(1.8)], [x, y, z(2.02)]],
    [[0, 0.22 * s, 0.19 * s], [0.35, 0.19 * s, 0.16 * s], [0.7, 0.26 * s, 0.19 * s], [1, 0.3 * s, 0.16 * s]],
    [1, 0, 0], o.cloth || 'hide and cloth', PH('Torso. Form only.'));
  // arms: cloth sleeves, a pose with the leading arm forward
  [-1, 1].forEach((side) => {
    const ang = o.walk ? (side < 0 ? 1 : -1) : 0;
    loftPart(id + '-arm-' + (side < 0 ? 'l' : 'r'), side < 0 ? 'Arm (left)' : 'Arm (right)', id,
      [[x + side * 0.3 * s, y, z(1.95)], [x + side * 0.36 * s, y + ang * 0.2 * s, z(1.5)], [x + side * 0.4 * s, y + ang * 0.35 * s, z(1.08)]],
      [[0, 0.1 * s, 0.1 * s], [0.5, 0.09 * s, 0.09 * s], [1, 0.075 * s, 0.075 * s]], [1, 0, 0], o.cloth || 'hide and cloth', PH('Arm. Form only.'));
    part(id + '-hand-' + (side < 0 ? 'l' : 'r'), side < 0 ? 'Hand (left)' : 'Hand (right)', 'sphere', id,
      { x: 0.14 * s, y: 0.14 * s, z: 0.14 * s }, [x + side * 0.4 * s, y + ang * 0.35 * s, z(0.98)], 'skin', PH('Hand. Form only.'));
  });
  // neck and head
  loftPart(id + '-neck', 'Neck', id,
    [[x, y, z(2.0)], [x, y + 0.02 * s, z(2.2)]],
    [[0, 0.1 * s, 0.1 * s], [1, 0.09 * s, 0.09 * s]], [1, 0, 0], 'skin', PH('Neck. Form only.'));
  loftPart(id + '-head', 'Head', id,
    [[x, y, z(2.2)], [x, y, z(2.5)], [x, y, z(2.8)]],
    [[0, 0.14 * s, 0.16 * s], [0.35, 0.22 * s, 0.22 * s], [0.75, 0.22 * s, 0.24 * s], [1, 0.13 * s, 0.14 * s]],
    [1, 0, 0], 'skin', PH('Head with approximate general features. Not a portrait.'));
  // approximate general features on the front of the face (the front faces -y, toward the viewer)
  const zc = z(2.5), fy = y - 0.23 * s;
  [-1, 1].forEach((side) => {
    part(id + '-eye-' + (side < 0 ? 'l' : 'r'), 'Eye (' + (side < 0 ? 'left' : 'right') + ')', 'sphere', id,
      { x: 0.06, y: 0.06, z: 0.06 }, [x + side * 0.09 * s, fy, zc + 0.06 * s], 'dark', PH('Eye, a general form.'));
    part(id + '-brow-' + (side < 0 ? 'l' : 'r'), 'Brow (' + (side < 0 ? 'left' : 'right') + ')', 'box', id,
      { x: 0.13 * s, y: 0.05, z: 0.05 }, [x + side * 0.09 * s, fy - 0.01 * s, zc + 0.17 * s], 'dark', PH('Brow, a general form.'));
    part(id + '-ear-' + (side < 0 ? 'l' : 'r'), 'Ear (' + (side < 0 ? 'left' : 'right') + ')', 'sphere', id,
      { x: 0.08 * s, y: 0.08 * s, z: 0.08 * s }, [x + side * 0.23 * s, y, zc], 'skin', PH('Ear, a general form.'));
  });
  part(id + '-nose', 'Nose', 'cone', id, { x: 0.1 * s, y: 0.1 * s, z: 0.18 * s }, [x, fy - 0.02 * s, zc - 0.02 * s], 'skin',
    PH('Nose, a general form.'), { rotation_x: 90 });
  part(id + '-mouth', 'Mouth', 'box', id, { x: 0.14 * s, y: 0.05, z: 0.05 }, [x, fy, zc - 0.15 * s], 'dark', PH('Mouth, a general form.'));
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
  ['camp', 'consultation', 'Consultation note: the Cheyenne and Arapaho Tribes have not reviewed this camp (see research/consultation-plan.md).'],
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
