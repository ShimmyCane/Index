// The sample scene: a generic plains camp in a science-diorama box, 1:24 (1 in = 2 ft).
// Synthetic and generic. It depicts no specific nation, family or real person.
// Every placeholder is flagged. Sources and the open questions are in research/plains-diorama.md.
// Run: node tools/build_sample.js   (never hand-edit samples/ or js/sample_bundle.js)
//
// Certainty percent = how sure we are that the size and shape are right as drawn (0-100).
// Basis = where the number came from: measured | cited | user | inferred | placeholder | decorative.

const header = {
  name: 'Plains camp diorama (generic)',
  model_id: 'plains-diorama-v01',
  description: 'A generic plains camp in a science-diorama box. Placeholder figures and horse; no specific nation depicted.',
  scale: '1:24 (1 in = 2 ft)',
  units: 'in',
  up: 'z',
  world: 'plains-diorama-world'
};

// Groups come before their children. Parents are referenced by uuid.
const objects = [
  { uuid: 'camp', name: 'Plains camp (generic)', type: 'group',
    description: 'Root group. Generic; no specific nation, family or place is depicted.' },

  { uuid: 'ground', name: 'Prairie ground', type: 'box', parent: 'camp',
    dimensions: { x: 30, y: 20, z: 1 }, position: [0, 0, 0.5], material: 'prairie earth',
    certainty: { percent: 70, basis: 'inferred', note: 'Flat dry ground. No site survey; the shape is generic.' } },

  { uuid: 'ridge', name: 'Low ridge', type: 'box', parent: 'camp',
    dimensions: { x: 22, y: 5, z: 3 }, position: [0, 6, 2.5], material: 'prairie earth',
    certainty: { percent: 35, basis: 'inferred', note: 'Invented to frame the camp. Not from a source.' } },

  { uuid: 'backdrop', name: 'Painted backdrop wall', type: 'box', parent: 'camp',
    dimensions: { x: 30, y: 0.5, z: 14 }, position: [0, 10.25, 8], material: 'painted',
    certainty: { percent: 100, basis: 'decorative', note: 'Flat wall of the diorama box. The painting on it is not modelled.' } },

  { uuid: 'tipi-large', name: 'Tipi (large)', type: 'cone', parent: 'camp',
    description: 'Conical hide dwelling. Generic form.',
    dimensions: { x: 7, y: 7, z: 8 }, position: [-6, 2, 5], material: 'hide',
    certainty: { percent: 60, basis: 'inferred', note: 'General tipi form. Diameter and height are approximate, not from a source.' } },

  { uuid: 'tipi-small', name: 'Tipi (small)', type: 'cone', parent: 'camp',
    description: 'Smaller conical dwelling, generic form.',
    dimensions: { x: 5, y: 5, z: 6 }, position: [-10, -2, 4], material: 'hide',
    certainty: { percent: 55, basis: 'inferred', note: 'General tipi form. Size approximate.' } },

  { uuid: 'travois-pole-left', name: 'Travois pole (left)', type: 'box', parent: 'camp',
    description: 'Drag pole of a travois, a sledge-like carrier pulled by a horse or dog.',
    dimensions: { x: 0.4, y: 9, z: 0.4 }, position: [-2.0, -1.5, 1.2], material: 'wood',
    certainty: { percent: 55, basis: 'inferred', note: 'Travois form from the research. Length approximate.' } },

  { uuid: 'travois-pole-right', name: 'Travois pole (right)', type: 'box', parent: 'camp',
    description: 'Drag pole of a travois.',
    dimensions: { x: 0.4, y: 9, z: 0.4 }, position: [-2.8, -1.5, 1.2], material: 'wood',
    certainty: { percent: 55, basis: 'inferred', note: 'As the left pole.' } },

  { uuid: 'travois-bar', name: 'Travois cross bar', type: 'box', parent: 'camp',
    dimensions: { x: 1.6, y: 0.4, z: 0.4 }, position: [-2.4, -6, 1.2], material: 'wood',
    certainty: { percent: 55, basis: 'inferred', note: 'Joins the two poles at their ends.' } },

  { uuid: 'fire-ring', name: 'Fire ring', type: 'cylinder', parent: 'camp',
    description: 'Ring of stones around a fire. Stones are not modelled one by one.',
    dimensions: { x: 2.4, y: 2.4, z: 0.5 }, position: [-8, -6, 1.25], material: 'stone',
    certainty: { percent: 40, basis: 'inferred', note: 'Typical size. Not from a source.' } },

  { uuid: 'horse', name: 'Horse (placeholder)', type: 'group', parent: 'camp',
    description: 'Placeholder silhouette. No breed, tack or colour is claimed.' },
  { uuid: 'horse-body', name: 'Horse body', type: 'box', parent: 'horse',
    dimensions: { x: 6, y: 2, z: 2.6 }, position: [4, -2, 4.8], material: 'placeholder grey',
    certainty: { percent: 20, basis: 'placeholder', note: 'Silhouette only.' } },
  { uuid: 'horse-neck', name: 'Horse neck', type: 'box', parent: 'horse',
    dimensions: { x: 1, y: 1, z: 2 }, position: [6.5, -2, 6.3], material: 'placeholder grey',
    certainty: { percent: 20, basis: 'placeholder', note: 'Silhouette only.' } },
  { uuid: 'horse-leg-fl', name: 'Horse leg (front left)', type: 'cylinder', parent: 'horse',
    dimensions: { x: 0.4, y: 0.4, z: 2.5 }, position: [6.2, -2.7, 2.25], material: 'placeholder grey',
    certainty: { percent: 20, basis: 'placeholder', note: 'Silhouette only.' } },
  { uuid: 'horse-leg-fr', name: 'Horse leg (front right)', type: 'cylinder', parent: 'horse',
    dimensions: { x: 0.4, y: 0.4, z: 2.5 }, position: [6.2, -1.3, 2.25], material: 'placeholder grey',
    certainty: { percent: 20, basis: 'placeholder', note: 'Silhouette only.' } },
  { uuid: 'horse-leg-bl', name: 'Horse leg (back left)', type: 'cylinder', parent: 'horse',
    dimensions: { x: 0.4, y: 0.4, z: 2.5 }, position: [1.8, -2.7, 2.25], material: 'placeholder grey',
    certainty: { percent: 20, basis: 'placeholder', note: 'Silhouette only.' } },
  { uuid: 'horse-leg-br', name: 'Horse leg (back right)', type: 'cylinder', parent: 'horse',
    dimensions: { x: 0.4, y: 0.4, z: 2.5 }, position: [1.8, -1.3, 2.25], material: 'placeholder grey',
    certainty: { percent: 20, basis: 'placeholder', note: 'Silhouette only.' } },

  { uuid: 'figures', name: 'Figures (placeholder)', type: 'group', parent: 'camp',
    description: 'Three placeholder forms. No faces, hair, clothing or regalia.' },

  { uuid: 'figure-a', name: 'Figure A (placeholder)', type: 'group', parent: 'figures' },
  { uuid: 'figure-a-body', name: 'Figure A body', type: 'cylinder', parent: 'figure-a',
    dimensions: { x: 1.6, y: 1.6, z: 4.5 }, position: [-5, -7, 3.25], material: 'placeholder grey',
    certainty: { percent: 15, basis: 'placeholder', note: 'Form only.' } },
  { uuid: 'figure-a-head', name: 'Figure A head', type: 'sphere', parent: 'figure-a',
    dimensions: { x: 1, y: 1, z: 1 }, position: [-5, -7, 6], material: 'placeholder grey',
    certainty: { percent: 15, basis: 'placeholder', note: 'Form only.' } },

  { uuid: 'figure-b', name: 'Figure B (placeholder)', type: 'group', parent: 'figures' },
  { uuid: 'figure-b-body', name: 'Figure B body', type: 'cylinder', parent: 'figure-b',
    dimensions: { x: 1.6, y: 1.6, z: 4.5 }, position: [-9.5, -9, 3.25], material: 'placeholder grey',
    certainty: { percent: 15, basis: 'placeholder', note: 'Form only.' } },
  { uuid: 'figure-b-head', name: 'Figure B head', type: 'sphere', parent: 'figure-b',
    dimensions: { x: 1, y: 1, z: 1 }, position: [-9.5, -9, 6], material: 'placeholder grey',
    certainty: { percent: 15, basis: 'placeholder', note: 'Form only.' } },

  { uuid: 'figure-c', name: 'Figure C (placeholder)', type: 'group', parent: 'figures' },
  { uuid: 'figure-c-body', name: 'Figure C body', type: 'cylinder', parent: 'figure-c',
    dimensions: { x: 1.6, y: 1.6, z: 4.5 }, position: [1.5, 2, 3.25], material: 'placeholder grey',
    certainty: { percent: 15, basis: 'placeholder', note: 'Form only.' } },
  { uuid: 'figure-c-head', name: 'Figure C head', type: 'sphere', parent: 'figure-c',
    dimensions: { x: 1, y: 1, z: 1 }, position: [1.5, 2, 6], material: 'placeholder grey',
    certainty: { percent: 15, basis: 'placeholder', note: 'Form only.' } },

  { uuid: 'tufts', name: 'Grass tufts (decorative)', type: 'group', parent: 'camp' },
  { uuid: 'tuft-1', name: 'Grass tuft 1', type: 'cone', parent: 'tufts',
    dimensions: { x: 0.8, y: 0.8, z: 1 }, position: [9, 6, 1.5], material: 'grass',
    certainty: { percent: 30, basis: 'decorative', note: 'Decoration. Size not measured.' } },
  { uuid: 'tuft-2', name: 'Grass tuft 2', type: 'cone', parent: 'tufts',
    dimensions: { x: 0.8, y: 0.8, z: 1 }, position: [11, 3, 1.5], material: 'grass',
    certainty: { percent: 30, basis: 'decorative', note: 'Decoration. Size not measured.' } },
  { uuid: 'tuft-3', name: 'Grass tuft 3', type: 'cone', parent: 'tufts',
    dimensions: { x: 0.8, y: 0.8, z: 1 }, position: [-12, -6, 1.5], material: 'grass',
    certainty: { percent: 30, basis: 'decorative', note: 'Decoration. Size not measured.' } },

  { uuid: 'label-plate', name: 'Label plate', type: 'box', parent: 'camp',
    description: 'Front label. Text: "Generic plains camp. Placeholder figures. Not a portrait of any people."',
    dimensions: { x: 6, y: 0.3, z: 1.2 }, position: [0, -9.6, 1.6], material: 'brass',
    certainty: { percent: 100, basis: 'decorative', note: 'Label carrier.' } }
];

// Open flags: what is uncertain or should not go on display yet. Each one explains the warnings
// for its object and everything inside it (a flag on a group covers its children).
const flags = [
  { id: 'F1', target: 'camp', text: 'The camp is generic. It shows no specific Oklahoma nation, family or place. Check the research folder before any nation-specific version.' },
  { id: 'F2', target: 'ridge', text: 'The ridge is invented to frame the camp. It has no source.' },
  { id: 'F3', target: 'horse', text: 'The horse is a placeholder. Breed, tack and colour are unknown and are not guessed. Check with consultants before any display.' },
  { id: 'F4', target: 'figures', text: 'The figures are placeholder forms only. They must not stand in for real people or nations. Review with Oklahoma consultants before any public display.' },
  { id: 'F5', target: 'fire-ring', text: 'The fire ring size is typical, not sourced.' },
  { id: 'F6', target: 'tufts', text: 'The grass tufts are decoration; their size is not measured.' }
];

module.exports = { header, objects, flags };
