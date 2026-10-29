// Plan "batch10", made by tools/plan.js from briefs/batch10.json on 2026-10-29.
// Each entry: an inspiration's series item drawn with a ready template at a fixed level. Edit freely, then:
//   node tools/generate.js --plan tools/plans/batch10.js --batch N
"use strict";
module.exports = [
 {
  "id": "rousseau-burrow",
  "family": 3,
  "level": 7,
  "levels": [
   7,
   7
  ],
  "style": "ants",
  "base": {},
  "inspired": "Inspired by Henri Rousseau's jungles",
  "tags": [
   "tunnels",
   "dens",
   "painting"
  ],
  "seedInspiration": "rousseau",
  "seedTemplate": "burrow",
  "variants": [
   {
    "title": "The Dream",
    "fun": "Rousseau's The Dream shows a jungle full of flowers and animals.",
    "chars": [
     "cat",
     "flower"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "matisse-patchwork",
  "family": 3,
  "level": 7,
  "levels": [
   7,
   7
  ],
  "style": "klee",
  "base": {},
  "inspired": "Inspired by Henri Matisse's cut-paper pictures",
  "tags": [
   "squares",
   "color blocks",
   "painting"
  ],
  "seedInspiration": "matisse",
  "seedTemplate": "patchwork",
  "variants": [
   {
    "title": "The Snail",
    "fun": "Matisse's The Snail is made of cut paper squares arranged in a spiral.",
    "chars": [
     "cat",
     "star"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "miro-rings-dots",
  "family": 3,
  "level": 6,
  "levels": [
   6,
   6
  ],
  "style": "rings",
  "base": {
   "look": "dots",
   "decor": "seeds",
   "core": 1.4,
   "R": 255
  },
  "inspired": "Inspired by Joan Miró's floating stars and shapes",
  "tags": [
   "circles",
   "dots",
   "painting"
  ],
  "seedInspiration": "miro",
  "seedTemplate": "rings-dots",
  "variants": [
   {
    "title": "Floating Stars",
    "fun": "Joan Miró filled his paintings with stars, moons and floating shapes.",
    "chars": [
     "cat",
     "star"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "kandinsky-sound-wave",
  "family": 3,
  "level": 6,
  "levels": [
   6,
   6
  ],
  "style": "soundwave",
  "base": {
   "v": 1
  },
  "inspired": "Inspired by Wassily Kandinsky",
  "tags": [
   "sound",
   "waves",
   "painting"
  ],
  "seedInspiration": "kandinsky",
  "seedTemplate": "sound-wave",
  "variants": [
   {
    "title": "Color Music",
    "fun": "Kandinsky gave his paintings musical names, like Composition and Improvisation.",
    "chars": [
     "cat",
     "note"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "escher-patchwork",
  "family": 3,
  "level": 5,
  "levels": [
   5,
   5
  ],
  "style": "klee",
  "base": {},
  "inspired": "Inspired by M. C. Escher",
  "tags": [
   "squares",
   "color blocks",
   "painting"
  ],
  "seedInspiration": "escher",
  "seedTemplate": "patchwork",
  "variants": [
   {
    "title": "Day and Night",
    "fun": "In Escher's Day and Night, white birds and black birds fly in opposite directions.",
    "chars": [
     "bird",
     "star"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "monet-calm-sea",
  "family": 3,
  "level": 5,
  "levels": [
   5,
   5
  ],
  "style": "wave",
  "base": {
   "v": 2,
   "thin": true
  },
  "inspired": "Inspired by Claude Monet",
  "tags": [
   "sea",
   "mist",
   "painting"
  ],
  "seedInspiration": "monet",
  "seedTemplate": "calm-sea",
  "variants": [
   {
    "title": "Japanese Bridge",
    "fun": "Monet built a Japanese-style bridge over his lily pond.",
    "chars": [
     "cat",
     "flower"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "mondrian-city-grid",
  "family": 3,
  "level": 4,
  "levels": [
   4,
   4
  ],
  "style": "streets",
  "base": {},
  "inspired": "Inspired by Piet Mondrian",
  "tags": [
   "streets",
   "grid",
   "painting"
  ],
  "seedInspiration": "mondrian",
  "seedTemplate": "city-grid",
  "variants": [
   {
    "title": "Victory Boogie",
    "fun": "Mondrian was still working on Victory Boogie Woogie when he died in 1944.",
    "chars": [
     "cat",
     "star"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "klee-dot-field",
  "family": 3,
  "level": 4,
  "levels": [
   4,
   4
  ],
  "style": "seurat",
  "base": {},
  "inspired": "Inspired by Paul Klee",
  "tags": [
   "dots",
   "painting"
  ],
  "seedInspiration": "klee",
  "seedTemplate": "dot-field",
  "variants": [
   {
    "title": "Fish Magic",
    "fun": "Klee painted Fish Magic, with fish floating in a dark blue night.",
    "chars": [
     "fish",
     "moon"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "calder-shape-balloon",
  "family": 3,
  "level": 2,
  "levels": [
   2,
   2
  ],
  "style": "shape",
  "base": {
   "shape": "balloon",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by Alexander Calder",
  "tags": [
   "balloon",
   "shape maze",
   "painting"
  ],
  "seedInspiration": "calder",
  "seedTemplate": "shape-balloon",
  "variants": [
   {
    "title": "Wire Circus",
    "fun": "Calder made a tiny circus from wire and cloth.",
    "chars": [
     "cat",
     "star"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "klimt-shape-tree",
  "family": 3,
  "level": 2,
  "levels": [
   2,
   2
  ],
  "style": "shape",
  "base": {
   "shape": "tree",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by Gustav Klimt",
  "tags": [
   "tree",
   "shape maze",
   "painting"
  ],
  "seedInspiration": "klimt",
  "seedTemplate": "shape-tree",
  "variants": [
   {
    "title": "The Kiss",
    "fun": "Klimt's painting The Kiss is covered in gold patterns.",
    "chars": [
     "cat",
     "heart"
    ],
    "p": {}
   }
  ]
 }
];
