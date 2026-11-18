// The sample scene: a Southern Cheyenne camp move on the North Fork of the Canadian, Indian Territory, 1870s.
// A DRAFT for consultation: the Cheyenne and Arapaho Tribes have not reviewed it. Not for display until the
// consultation flags are closed (see research/consultation-plan.md and the gate in ⚙️).
// It shows no named person, no particular family or event, and no ceremonial or sacred object.
// Scale 1:24 (1 in = 2 ft). Run: node tools/build_sample.js (never hand-edit samples/ or js/sample_bundle.js).
//
// Certainty percent = how sure we are the size and shape are right as drawn (0-100).
// Basis = where the number came from: measured | cited | user | inferred | placeholder | decorative.

const header = {
  name: 'Southern Cheyenne camp move, Indian Territory, 1870s (draft for consultation)',
  model_id: 'plains-diorama-v02',
  description: 'A draft diorama of a camp move. Figures and horses are placeholders. Not reviewed by the Cheyenne and Arapaho Tribes; not for display.',
  scale: '1:24 (1 in = 2 ft)',
  units: 'in',
  up: 'z',
  world: 'plains-diorama-world'
};

const solid = (uuid, name, type, parent, dims, pos, material, cert, description) => {
  const o = { uuid, name, type, parent, dimensions: dims, position: pos, material, certainty: cert };
  if (description) o.description = description;
  return o;
};
const group = (uuid, name, parent, description) => {
  const o = { uuid, name, type: 'group', parent };
  if (description) o.description = description;
  return o;
};
const placeholder = (note) => ({ percent: 15, basis: 'placeholder', note });

// A horse as a silhouette. Centre (x, y); legs stand on the ground (z 1 to 3.5).
function horse(id, name, x, y, parent) {
  return [
    group(id, name, parent, 'Placeholder silhouette. No breed, tack or colour is claimed.'),
    solid(id + '-body', 'Horse body', 'box', id, { x: 6, y: 2, z: 2.6 }, [x, y, 4.8], 'placeholder grey',
      { percent: 20, basis: 'placeholder', note: 'Silhouette only.' }),
    solid(id + '-neck', 'Horse neck', 'box', id, { x: 1, y: 1, z: 2 }, [x + 2.5, y, 6.3], 'placeholder grey',
      { percent: 20, basis: 'placeholder', note: 'Silhouette only.' }),
    solid(id + '-leg-fl', 'Horse leg (front left)', 'cylinder', id, { x: 0.4, y: 0.4, z: 2.5 }, [x + 2.2, y - 0.7, 2.25], 'placeholder grey',
      { percent: 20, basis: 'placeholder', note: 'Silhouette only.' }),
    solid(id + '-leg-fr', 'Horse leg (front right)', 'cylinder', id, { x: 0.4, y: 0.4, z: 2.5 }, [x + 2.2, y + 0.7, 2.25], 'placeholder grey',
      { percent: 20, basis: 'placeholder', note: 'Silhouette only.' }),
    solid(id + '-leg-bl', 'Horse leg (back left)', 'cylinder', id, { x: 0.4, y: 0.4, z: 2.5 }, [x - 2.2, y - 0.7, 2.25], 'placeholder grey',
      { percent: 20, basis: 'placeholder', note: 'Silhouette only.' }),
    solid(id + '-leg-br', 'Horse leg (back right)', 'cylinder', id, { x: 0.4, y: 0.4, z: 2.5 }, [x - 2.2, y + 0.7, 2.25], 'placeholder grey',
      { percent: 20, basis: 'placeholder', note: 'Silhouette only.' })
  ];
}

// A travois: two drag poles (9 in long along y), a cross bar at the front, and a load on the poles.
function travois(id, name, x, y, parent) {
  return [
    group(id, name, parent, 'A drag frame of two poles and a cross bar, with a load of bundles.'),
    solid(id + '-pole-l', 'Pole (left)', 'box', id, { x: 0.4, y: 9, z: 0.4 }, [x - 0.4, y, 1.2], 'wood',
      { percent: 55, basis: 'inferred', note: 'Travois form from the research; the length is approximate.' }),
    solid(id + '-pole-r', 'Pole (right)', 'box', id, { x: 0.4, y: 9, z: 0.4 }, [x + 0.4, y, 1.2], 'wood',
      { percent: 55, basis: 'inferred', note: 'As the left pole.' }),
    solid(id + '-bar', 'Cross bar', 'box', id, { x: 1.6, y: 0.4, z: 0.4 }, [x, y - 4.5, 1.2], 'wood',
      { percent: 55, basis: 'inferred', note: 'Joins the poles at the front.' }),
    solid(id + '-load', 'Load of bundles', 'box', id, { x: 2.4, y: 2.6, z: 1.6 }, [x, y + 0.5, 2.2], 'hide and cloth',
      { percent: 30, basis: 'placeholder', note: 'A block for the load. What it holds is not yet confirmed.' })
  ];
}

const objects = [
  group('camp', 'Camp move (draft)', undefined, 'Root group. A Southern Cheyenne camp move on the North Fork of the Canadian. Not reviewed by the tribes.'),

  solid('ground', 'River terrace ground', 'box', 'camp', { x: 30, y: 20, z: 1 }, [0, 0, 0.5], 'prairie earth',
    { percent: 70, basis: 'inferred', note: 'Flat river terrace. No site survey; the shape is generic.' }),
  solid('ridge', 'Low bluff', 'box', 'camp', { x: 22, y: 5, z: 3 }, [0, 6, 2.5], 'prairie earth',
    { percent: 35, basis: 'inferred', note: 'Invented to frame the camp. Not from a source.' }),
  solid('backdrop', 'Painted backdrop wall', 'box', 'camp', { x: 30, y: 0.5, z: 14 }, [0, 10.25, 8], 'painted',
    { percent: 100, basis: 'decorative', note: 'Flat wall of the diorama box. The painting is not modelled.' }),

  group('lodges', 'Lodges (standing and struck)', 'camp', 'Two standing lodges and one struck (taken down) lodge cover with its poles.'),
  solid('tipi-1', 'Lodge (standing, large)', 'cone', 'lodges', { x: 7, y: 7, z: 8 }, [-7, 3, 5], 'hide',
    { percent: 60, basis: 'inferred', note: 'General tipi form. Diameter and height approximate, not from a source.' }),
  solid('tipi-2', 'Lodge (standing, small)', 'cone', 'lodges', { x: 6, y: 6, z: 7 }, [-11, -1, 4.5], 'hide',
    { percent: 55, basis: 'inferred', note: 'General tipi form. Size approximate.' }),
  solid('struck-cover', 'Struck lodge cover (folded)', 'box', 'lodges', { x: 4.5, y: 3, z: 0.6 }, [-2, -4, 1.3], 'hide',
    { percent: 50, basis: 'inferred', note: 'The folded cover on the ground. Its size is approximate.' }),
  solid('struck-poles', 'Struck lodge poles', 'box', 'lodges', { x: 0.3, y: 8, z: 0.3 }, [-2.6, -4, 1.15], 'wood',
    { percent: 50, basis: 'inferred', note: 'Poles laid beside the cover. Length approximate.' }),

  group('travois', 'Travois (two frames, loaded)', 'camp', 'Two drag frames loaded for the move.'),
  ...travois('travois-a', 'Travois A', 1.5, -3, 'travois'),
  ...travois('travois-b', 'Travois B', 5.5, 0, 'travois'),

  group('horses', 'Horses (placeholder)', 'camp', 'Two placeholder horse silhouettes. No breed, tack or colour is claimed.'),
  ...horse('horse-1', 'Horse 1 (front)', 6, -8.5, 'horses'),
  ...horse('horse-2', 'Horse 2 (by the cover)', -5, -8.5, 'horses'),

  group('figures', 'People (placeholder forms)', 'camp', 'Three placeholder forms: an older woman, a child and a woman. No faces, hair, clothing or regalia.'),
  solid('figure-woman-a-body', 'Woman A body', 'cylinder', 'figures', { x: 1.6, y: 1.6, z: 4.5 }, [-5, -2, 3.25], 'placeholder grey', placeholder('Form only.')),
  solid('figure-woman-a-head', 'Woman A head', 'sphere', 'figures', { x: 1, y: 1, z: 1 }, [-5, -2, 6], 'placeholder grey', placeholder('Form only.')),
  solid('figure-child-body', 'Child body', 'cylinder', 'figures', { x: 1, y: 1, z: 2.8 }, [-1, 1.5, 2.4], 'placeholder grey', placeholder('Form only.')),
  solid('figure-child-head', 'Child head', 'sphere', 'figures', { x: 0.7, y: 0.7, z: 0.7 }, [-1, 1.5, 4.25], 'placeholder grey', placeholder('Form only.')),
  solid('figure-woman-b-body', 'Woman B body', 'cylinder', 'figures', { x: 1.6, y: 1.6, z: 4.5 }, [9, 3, 3.25], 'placeholder grey', placeholder('Form only.')),
  solid('figure-woman-b-head', 'Woman B head', 'sphere', 'figures', { x: 1, y: 1, z: 1 }, [9, 3, 6], 'placeholder grey', placeholder('Form only.')),

  solid('fire-ring', 'Cold fire ring', 'cylinder', 'camp', { x: 2.4, y: 2.4, z: 0.5 }, [-8, -6, 1.25], 'stone',
    { percent: 40, basis: 'inferred', note: 'Typical size. Not from a source. The fire is out.' }),

  group('tufts', 'Grass tufts (decorative)', 'camp'),
  solid('tuft-1', 'Grass tuft 1', 'cone', 'tufts', { x: 0.8, y: 0.8, z: 1 }, [9, 6, 1.5], 'grass',
    { percent: 30, basis: 'decorative', note: 'Decoration. Size not measured.' }),
  solid('tuft-2', 'Grass tuft 2', 'cone', 'tufts', { x: 0.8, y: 0.8, z: 1 }, [11, -2, 1.5], 'grass',
    { percent: 30, basis: 'decorative', note: 'Decoration. Size not measured.' }),
  solid('tuft-3', 'Grass tuft 3', 'cone', 'tufts', { x: 0.8, y: 0.8, z: 1 }, [-12, -6, 1.5], 'grass',
    { percent: 30, basis: 'decorative', note: 'Decoration. Size not measured.' }),

  solid('label-plate', 'Label plate', 'box', 'camp', { x: 6, y: 0.3, z: 1.2 }, [0, -9.8, 1.6], 'brass',
    { percent: 100, basis: 'decorative', note: 'Label carrier.' },
    'Label text: "Southern Cheyenne camp move, 1870s. Draft. Not reviewed by the Cheyenne and Arapaho Tribes."')
];

// Flags: what is uncertain (kind uncertain) or needs review by people outside the project (kind consultation).
// A flag on a group covers everything inside it. Consultation flags block display while the gate is on.
const flags = [
  { id: 'F1', kind: 'consultation', target: 'camp', text: 'Display needs review by the Cheyenne and Arapaho Tribes (see research/consultation-plan.md). The whole camp is a draft until then.' },
  { id: 'F2', kind: 'uncertain', target: 'ridge', text: 'The bluff is invented to frame the camp. It has no source.' },
  { id: 'F3', kind: 'consultation', target: 'horses', text: 'The horses are placeholders. Breed, tack and colour are not claimed. Check with consultants before any display.' },
  { id: 'F4', kind: 'consultation', target: 'figures', text: 'The people are placeholder forms only. They must not stand in for real people. Review before any display.' },
  { id: 'F5', kind: 'uncertain', target: 'fire-ring', text: 'The fire ring size is typical, not sourced.' },
  { id: 'F6', kind: 'uncertain', target: 'tufts', text: 'The grass tufts are decoration; their size is not measured.' },
  { id: 'F7', kind: 'consultation', target: 'lodges', text: 'The lodge shapes and the way the cover is folded need checking against Cheyenne practice.' },
  { id: 'F8', kind: 'consultation', target: 'travois', text: 'The travois sizes and the load are approximate. Check the load and how it was packed.' }
];

module.exports = { header, objects, flags };
