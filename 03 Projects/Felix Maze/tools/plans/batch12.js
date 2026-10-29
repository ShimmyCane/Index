// Plan "batch12", made by tools/plan.js from briefs/batch12.json on 2026-10-29.
// Each entry: an inspiration's series item drawn with a ready template at a fixed level. Edit freely, then:
//   node tools/generate.js --plan tools/plans/batch12.js --batch N
"use strict";
module.exports = [
 {
  "id": "water-shape-lilypad",
  "family": 4,
  "level": 5,
  "levels": [
   5,
   5
  ],
  "style": "shape",
  "base": {
   "shape": "lilypad",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by ponds, tides, waves and sound",
  "tags": [
   "lilypad",
   "shape maze",
   "water and waves"
  ],
  "seedInspiration": "water",
  "seedTemplate": "shape-lilypad",
  "variants": [
   {
    "title": "Lily Pad",
    "fun": "A lily pad floats because its leaf spreads out flat on the water.",
    "chars": [
     "fish",
     "flower"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "plants-shape-daisy",
  "family": 4,
  "level": 5,
  "levels": [
   5,
   5
  ],
  "style": "shape",
  "base": {
   "shape": "daisy",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by leaves, flowers, trees and fungi",
  "tags": [
   "daisy",
   "shape maze",
   "plants and trees"
  ],
  "seedInspiration": "plants",
  "seedTemplate": "shape-daisy",
  "variants": [
   {
    "title": "Daisy Chain",
    "fun": "A daisy has many petals arranged in a circle around its centre.",
    "chars": [
     "flower",
     "bee"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "tilings-patchwork",
  "family": 6,
  "level": 5,
  "levels": [
   5,
   5
  ],
  "style": "klee",
  "base": {},
  "inspired": "Inspired by shapes that fit together with no gaps",
  "tags": [
   "squares",
   "color blocks",
   "tilings and tessellations"
  ],
  "seedInspiration": "tilings",
  "seedTemplate": "patchwork",
  "borrowedTemplate": true,
  "variants": [
   {
    "title": "Penrose Tiles",
    "fun": "Penrose tilings use just two shapes, and the pattern never repeats exactly.",
    "chars": [
     "star",
     "cat"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "curves-gold-spirals",
  "family": 6,
  "level": 4,
  "levels": [
   4,
   4
  ],
  "style": "spirals",
  "base": {
   "v": 1
  },
  "inspired": "Inspired by spirals, rings and round shapes in nature",
  "tags": [
   "spirals",
   "gold",
   "curves and spirals"
  ],
  "seedInspiration": "curves",
  "seedTemplate": "gold-spirals",
  "variants": [
   {
    "title": "Golden Spiral",
    "fun": "Each quarter turn of the golden spiral grows by about 1.618 times.",
    "chars": [
     "cat",
     "star"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "sky-shape-cloud",
  "family": 4,
  "level": 4,
  "levels": [
   4,
   4
  ],
  "style": "shape",
  "base": {
   "shape": "cloud",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by the Moon, Sun, stars and clouds",
  "tags": [
   "cloud",
   "shape maze",
   "sky and stars"
  ],
  "seedInspiration": "sky",
  "seedTemplate": "shape-cloud",
  "variants": [
   {
    "title": "Puffy Cloud",
    "fun": "A cloud can weigh as much as several elephants.",
    "chars": [
     "cat",
     "star"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "animals-land-shape-rhino",
  "family": 4,
  "level": 4,
  "levels": [
   4,
   4
  ],
  "style": "shape",
  "base": {
   "shape": "rhino",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by animals that live on land",
  "tags": [
   "rhino",
   "shape maze",
   "animals on land"
  ],
  "seedInspiration": "animals-land",
  "seedTemplate": "shape-rhino",
  "variants": [
   {
    "title": "Old Friend Dog",
    "fun": "Dogs were among the first animals people tamed, thousands of years ago.",
    "chars": [
     "cat",
     "bone"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "shapes-shape-octagon",
  "family": 5,
  "level": 4,
  "levels": [
   4,
   4
  ],
  "style": "shape",
  "base": {
   "shape": "octagon",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by the everyday shapes we see every day",
  "tags": [
   "octagon",
   "shape maze",
   "shapes everywhere"
  ],
  "seedInspiration": "shapes",
  "seedTemplate": "shape-octagon",
  "variants": [
   {
    "title": "Stop Sign",
    "fun": "A stop sign is an octagon, with eight sides.",
    "chars": [
     "cat",
     "star"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "nature-plants-shape-leaf",
  "family": 4,
  "level": 4,
  "levels": [
   4,
   4
  ],
  "style": "shape",
  "base": {
   "shape": "leaf",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by plants, roots and hills",
  "tags": [
   "leaf",
   "shape maze",
   "plants and the ground"
  ],
  "seedInspiration": "nature-plants",
  "seedTemplate": "shape-leaf",
  "variants": [
   {
    "title": "Desert Cactus",
    "fun": "Some cactus plants can live for more than 100 years.",
    "chars": [
     "cactus",
     "sun"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "sky-starry-sky",
  "family": 4,
  "level": 4,
  "levels": [
   4,
   4
  ],
  "style": "starry",
  "base": {
   "v": 0
  },
  "inspired": "Inspired by the Moon, Sun, stars and clouds",
  "tags": [
   "swirls",
   "night",
   "sky and stars"
  ],
  "seedInspiration": "sky",
  "seedTemplate": "starry-sky",
  "variants": [
   {
    "title": "Twinkle Stars",
    "fun": "Stars twinkle because moving air bends their light.",
    "chars": [
     "cat",
     "moon"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "curves-rings-dots",
  "family": 6,
  "level": 4,
  "levels": [
   4,
   4
  ],
  "style": "rings",
  "base": {
   "look": "dots",
   "decor": "seeds",
   "core": 1.4,
   "R": 255
  },
  "inspired": "Inspired by spirals, rings and round shapes in nature",
  "tags": [
   "circles",
   "dots",
   "curves and spirals"
  ],
  "seedInspiration": "curves",
  "seedTemplate": "rings-dots",
  "variants": [
   {
    "title": "Sunflower Seeds",
    "fun": "Sunflower seeds spiral in two directions, often 34 and 55 spirals.",
    "chars": [
     "bee",
     "sun"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "tilings-honeycomb",
  "family": 6,
  "level": 4,
  "levels": [
   4,
   4
  ],
  "style": "honeycomb",
  "base": {},
  "inspired": "Inspired by shapes that fit together with no gaps",
  "tags": [
   "hexagons",
   "tilings and tessellations"
  ],
  "seedInspiration": "tilings",
  "seedTemplate": "honeycomb",
  "variants": [
   {
    "title": "Honeycomb Hall",
    "fun": "Hexagons fit together with no gaps, which is why bees build them.",
    "chars": [
     "bee",
     "flower"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "nature-plants-shape-leaf",
  "family": 4,
  "level": 4,
  "levels": [
   4,
   4
  ],
  "style": "shape",
  "base": {
   "shape": "leaf",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by plants, roots and hills",
  "tags": [
   "leaf",
   "shape maze",
   "plants and the ground"
  ],
  "seedInspiration": "nature-plants",
  "seedTemplate": "shape-leaf",
  "variants": [
   {
    "title": "Green Hill",
    "fun": "Hills are shaped slowly by wind, water and time.",
    "chars": [
     "cat",
     "tree"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "water-calm-sea",
  "family": 4,
  "level": 4,
  "levels": [
   4,
   4
  ],
  "style": "wave",
  "base": {
   "v": 2,
   "thin": true
  },
  "inspired": "Inspired by ponds, tides, waves and sound",
  "tags": [
   "sea",
   "mist",
   "water and waves"
  ],
  "seedInspiration": "water",
  "seedTemplate": "calm-sea",
  "variants": [
   {
    "title": "Ocean Swell",
    "fun": "Waves are made by wind pushing on the surface of the water.",
    "chars": [
     "fish",
     "boat"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "shapes-shape-oval",
  "family": 5,
  "level": 4,
  "levels": [
   4,
   4
  ],
  "style": "shape",
  "base": {
   "shape": "oval",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by the everyday shapes we see every day",
  "tags": [
   "oval",
   "shape maze",
   "shapes everywhere"
  ],
  "seedInspiration": "shapes",
  "seedTemplate": "shape-oval",
  "variants": [
   {
    "title": "Egg Shape",
    "fun": "An egg is an oval, not a circle, so it does not roll straight.",
    "chars": [
     "cat",
     "bird"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "animals-land-shape-rhino",
  "family": 4,
  "level": 4,
  "levels": [
   4,
   4
  ],
  "style": "shape",
  "base": {
   "shape": "rhino",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by animals that live on land",
  "tags": [
   "rhino",
   "shape maze",
   "animals on land"
  ],
  "seedInspiration": "animals-land",
  "seedTemplate": "shape-rhino",
  "variants": [
   {
    "title": "Elephant Walk",
    "fun": "Elephants can recognize themselves in a mirror.",
    "chars": [
     "cat",
     "tree"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "objects-everyday-shape-car",
  "family": 5,
  "level": 3,
  "levels": [
   3,
   3
  ],
  "style": "shape",
  "base": {
   "shape": "car",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by everyday objects and machines",
  "tags": [
   "car",
   "shape maze",
   "things we use every day"
  ],
  "seedInspiration": "objects-everyday",
  "seedTemplate": "shape-car",
  "variants": [
   {
    "title": "Tea for Two",
    "fun": "Tea has been drunk for thousands of years, and teapots are many centuries old.",
    "chars": [
     "cat",
     "star"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "animals-sea-shape-duck",
  "family": 4,
  "level": 3,
  "levels": [
   3,
   3
  ],
  "style": "shape",
  "base": {
   "shape": "duck",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by animals that live in and near the sea",
  "tags": [
   "duck",
   "shape maze",
   "animals in the sea and by the water"
  ],
  "seedInspiration": "animals-sea",
  "seedTemplate": "shape-duck",
  "variants": [
   {
    "title": "Waddle Penguin",
    "fun": "Some penguins dive more than 500 metres deep to find fish.",
    "chars": [
     "fish",
     "boat"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "plants-shape-leaf",
  "family": 4,
  "level": 3,
  "levels": [
   3,
   3
  ],
  "style": "shape",
  "base": {
   "shape": "leaf",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by leaves, flowers, trees and fungi",
  "tags": [
   "leaf",
   "shape maze",
   "plants and trees"
  ],
  "seedInspiration": "plants",
  "seedTemplate": "shape-leaf",
  "variants": [
   {
    "title": "Leaf Veins",
    "fun": "Leaves catch sunlight and use it to make food for the plant.",
    "chars": [
     "leaf",
     "sun"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "animals-sea-shape-crab",
  "family": 4,
  "level": 3,
  "levels": [
   3,
   3
  ],
  "style": "shape",
  "base": {
   "shape": "crab",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by animals that live in and near the sea",
  "tags": [
   "crab",
   "shape maze",
   "animals in the sea and by the water"
  ],
  "seedInspiration": "animals-sea",
  "seedTemplate": "shape-crab",
  "variants": [
   {
    "title": "Eight-Arm Octopus",
    "fun": "An octopus has three hearts and blue blood.",
    "chars": [
     "fish",
     "star"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "objects-everyday-shape-submarine",
  "family": 5,
  "level": 3,
  "levels": [
   3,
   3
  ],
  "style": "shape",
  "base": {
   "shape": "submarine",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by everyday objects and machines",
  "tags": [
   "submarine",
   "shape maze",
   "things we use every day"
  ],
  "seedInspiration": "objects-everyday",
  "seedTemplate": "shape-submarine",
  "variants": [
   {
    "title": "Snow Friend",
    "fun": "People have been building snow figures for centuries.",
    "chars": [
     "cat",
     "star"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "animals-land-shape-hedgehog",
  "family": 4,
  "level": 3,
  "levels": [
   3,
   3
  ],
  "style": "shape",
  "base": {
   "shape": "hedgehog",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by animals that live on land",
  "tags": [
   "hedgehog",
   "shape maze",
   "animals on land"
  ],
  "seedInspiration": "animals-land",
  "seedTemplate": "shape-hedgehog",
  "variants": [
   {
    "title": "Tall Giraffe",
    "fun": "A giraffe’s tongue can be almost 50 centimetres long.",
    "chars": [
     "cat",
     "leaf"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "animals-sea-shape-duck",
  "family": 4,
  "level": 3,
  "levels": [
   3,
   3
  ],
  "style": "shape",
  "base": {
   "shape": "duck",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by animals that live in and near the sea",
  "tags": [
   "duck",
   "shape maze",
   "animals in the sea and by the water"
  ],
  "seedInspiration": "animals-sea",
  "seedTemplate": "shape-duck",
  "variants": [
   {
    "title": "Sideways Crab",
    "fun": "A crab can walk sideways, and its eyes sit on stalks.",
    "chars": [
     "fish",
     "sun"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "objects-everyday-shape-submarine",
  "family": 5,
  "level": 3,
  "levels": [
   3,
   3
  ],
  "style": "shape",
  "base": {
   "shape": "submarine",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by everyday objects and machines",
  "tags": [
   "submarine",
   "shape maze",
   "things we use every day"
  ],
  "seedInspiration": "objects-everyday",
  "seedTemplate": "shape-submarine",
  "variants": [
   {
    "title": "Sky Kite",
    "fun": "A kite flies because the wind pushes it up.",
    "chars": [
     "cat",
     "sun"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "water-sound-wave",
  "family": 4,
  "level": 3,
  "levels": [
   3,
   3
  ],
  "style": "soundwave",
  "base": {
   "v": 1
  },
  "inspired": "Inspired by ponds, tides, waves and sound",
  "tags": [
   "sound",
   "waves",
   "water and waves"
  ],
  "seedInspiration": "water",
  "seedTemplate": "sound-wave",
  "variants": [
   {
    "title": "Sound Waves",
    "fun": "Sound travels as waves of air pressure.",
    "chars": [
     "cat",
     "star"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "curves-rings-thin",
  "family": 6,
  "level": 3,
  "levels": [
   3,
   3
  ],
  "style": "rings",
  "base": {
   "look": "thin",
   "decor": "ticks",
   "core": 2.2,
   "R": 255
  },
  "inspired": "Inspired by spirals, rings and round shapes in nature",
  "tags": [
   "circles",
   "curves and spirals"
  ],
  "seedInspiration": "curves",
  "seedTemplate": "rings-thin",
  "variants": [
   {
    "title": "Ripple Rings",
    "fun": "A pebble dropped in water makes rings that spread outward.",
    "chars": [
     "fish",
     "star"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "plants-shape-leaf",
  "family": 4,
  "level": 3,
  "levels": [
   3,
   3
  ],
  "style": "shape",
  "base": {
   "shape": "leaf",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by leaves, flowers, trees and fungi",
  "tags": [
   "leaf",
   "shape maze",
   "plants and trees"
  ],
  "seedInspiration": "plants",
  "seedTemplate": "shape-leaf",
  "variants": [
   {
    "title": "Palm Fan",
    "fun": "Palm leaves fan out from one point, like the spokes of a wheel.",
    "chars": [
     "leaf",
     "sun"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "sky-starry-sky-2",
  "family": 4,
  "level": 3,
  "levels": [
   3,
   3
  ],
  "style": "starry",
  "base": {
   "v": 2
  },
  "inspired": "Inspired by the Moon, Sun, stars and clouds",
  "tags": [
   "swirls",
   "night",
   "sky and stars"
  ],
  "seedInspiration": "sky",
  "seedTemplate": "starry-sky-2",
  "variants": [
   {
    "title": "Star Map",
    "fun": "People long ago used the stars to find their way at night.",
    "chars": [
     "cat",
     "star"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "shapes-shape-rect",
  "family": 5,
  "level": 3,
  "levels": [
   3,
   3
  ],
  "style": "shape",
  "base": {
   "shape": "rect",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by the everyday shapes we see every day",
  "tags": [
   "rect",
   "shape maze",
   "shapes everywhere"
  ],
  "seedInspiration": "shapes",
  "seedTemplate": "shape-rect",
  "variants": [
   {
    "title": "Rounded Square",
    "fun": "A rounded square is halfway between a square and a circle.",
    "chars": [
     "cat",
     "star"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "nature-plants-shape-leaf",
  "family": 4,
  "level": 3,
  "levels": [
   3,
   3
  ],
  "style": "shape",
  "base": {
   "shape": "leaf",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by plants, roots and hills",
  "tags": [
   "leaf",
   "shape maze",
   "plants and the ground"
  ],
  "seedInspiration": "nature-plants",
  "seedTemplate": "shape-leaf",
  "variants": [
   {
    "title": "Under the Tree",
    "fun": "Tree roots can spread wider than the tree’s branches.",
    "chars": [
     "cat",
     "leaf"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "tilings-carpet",
  "family": 6,
  "level": 3,
  "levels": [
   3,
   3
  ],
  "style": "carpet",
  "base": {},
  "inspired": "Inspired by shapes that fit together with no gaps",
  "tags": [
   "borders",
   "pattern",
   "tilings and tessellations"
  ],
  "seedInspiration": "tilings",
  "seedTemplate": "carpet",
  "variants": [
   {
    "title": "Woven Rug",
    "fun": "Rugs are woven one knot at a time.",
    "chars": [
     "cat",
     "star"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "nature-plants-shape-leaf",
  "family": 4,
  "level": 3,
  "levels": [
   3,
   3
  ],
  "style": "shape",
  "base": {
   "shape": "leaf",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by plants, roots and hills",
  "tags": [
   "leaf",
   "shape maze",
   "plants and the ground"
  ],
  "seedInspiration": "nature-plants",
  "seedTemplate": "shape-leaf",
  "variants": [
   {
    "title": "Pineapple Patch",
    "fun": "A pineapple is many small berries grown together into one fruit.",
    "chars": [
     "cat",
     "star"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "plants-shape-daisy",
  "family": 4,
  "level": 3,
  "levels": [
   3,
   3
  ],
  "style": "shape",
  "base": {
   "shape": "daisy",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by leaves, flowers, trees and fungi",
  "tags": [
   "daisy",
   "shape maze",
   "plants and trees"
  ],
  "seedInspiration": "plants",
  "seedTemplate": "shape-daisy",
  "variants": [
   {
    "title": "Mushroom Ring",
    "fun": "Mushrooms are fungi, not plants.",
    "chars": [
     "cat",
     "leaf"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "sky-starry-sky-2",
  "family": 4,
  "level": 3,
  "levels": [
   3,
   3
  ],
  "style": "starry",
  "base": {
   "v": 2
  },
  "inspired": "Inspired by the Moon, Sun, stars and clouds",
  "tags": [
   "swirls",
   "night",
   "sky and stars"
  ],
  "seedInspiration": "sky",
  "seedTemplate": "starry-sky-2",
  "variants": [
   {
    "title": "Moon Phases",
    "fun": "The Moon takes about 29.5 days to go through all its phases.",
    "chars": [
     "cat",
     "moon"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "water-shape-island",
  "family": 4,
  "level": 3,
  "levels": [
   3,
   3
  ],
  "style": "shape",
  "base": {
   "shape": "island",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by ponds, tides, waves and sound",
  "tags": [
   "island",
   "shape maze",
   "water and waves"
  ],
  "seedInspiration": "water",
  "seedTemplate": "shape-island",
  "variants": [
   {
    "title": "Island Hop",
    "fun": "Some islands rise from the sea where volcanoes erupt.",
    "chars": [
     "boat",
     "palm"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "objects-everyday-shape-car",
  "family": 5,
  "level": 3,
  "levels": [
   3,
   3
  ],
  "style": "shape",
  "base": {
   "shape": "car",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by everyday objects and machines",
  "tags": [
   "car",
   "shape maze",
   "things we use every day"
  ],
  "seedInspiration": "objects-everyday",
  "seedTemplate": "shape-car",
  "variants": [
   {
    "title": "Ring Ring",
    "fun": "A bell rings when its clapper swings and hits the side.",
    "chars": [
     "cat",
     "star"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "curves-shape-donut",
  "family": 6,
  "level": 2,
  "levels": [
   2,
   2
  ],
  "style": "shape",
  "base": {
   "shape": "donut",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by spirals, rings and round shapes in nature",
  "tags": [
   "donut",
   "shape maze",
   "curves and spirals"
  ],
  "seedInspiration": "curves",
  "seedTemplate": "shape-donut",
  "variants": [
   {
    "title": "Donut Ring",
    "fun": "A donut is a shape with one hole, called a torus in maths.",
    "chars": [
     "cat",
     "star"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "animals-sea-shape-duck",
  "family": 4,
  "level": 2,
  "levels": [
   2,
   2
  ],
  "style": "shape",
  "base": {
   "shape": "duck",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by animals that live in and near the sea",
  "tags": [
   "duck",
   "shape maze",
   "animals in the sea and by the water"
  ],
  "seedInspiration": "animals-sea",
  "seedTemplate": "shape-duck",
  "variants": [
   {
    "title": "Pond Duck",
    "fun": "A duck’s feathers are kept waterproof with oil from a gland near its tail.",
    "chars": [
     "cat",
     "flower"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "shapes-shape-star5",
  "family": 5,
  "level": 2,
  "levels": [
   2,
   2
  ],
  "style": "shape",
  "base": {
   "shape": "star5",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by the everyday shapes we see every day",
  "tags": [
   "star5",
   "shape maze",
   "shapes everywhere"
  ],
  "seedInspiration": "shapes",
  "seedTemplate": "shape-star5",
  "variants": [
   {
    "title": "Five Points",
    "fun": "Five-pointed stars appear on the flags of many countries.",
    "chars": [
     "star",
     "cat"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "animals-land-shape-elephant",
  "family": 4,
  "level": 2,
  "levels": [
   2,
   2
  ],
  "style": "shape",
  "base": {
   "shape": "elephant",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by animals that live on land",
  "tags": [
   "elephant",
   "shape maze",
   "animals on land"
  ],
  "seedInspiration": "animals-land",
  "seedTemplate": "shape-elephant",
  "variants": [
   {
    "title": "Hopping Rabbit",
    "fun": "A rabbit’s long ears help it hear danger and cool its body.",
    "chars": [
     "cat",
     "flower"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "tilings-hex-startile",
  "family": 6,
  "level": 2,
  "levels": [
   2,
   2
  ],
  "style": "hexshape",
  "base": {
   "shape": "startile"
  },
  "inspired": "Inspired by shapes that fit together with no gaps",
  "tags": [
   "startile",
   "hexagons",
   "tilings and tessellations"
  ],
  "seedInspiration": "tilings",
  "seedTemplate": "hex-startile",
  "variants": [
   {
    "title": "Star Tiles Floor",
    "fun": "Tile makers in old palaces built patterns out of stars and shapes.",
    "chars": [
     "star",
     "cat"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "shapes-shape-heart",
  "family": 5,
  "level": 2,
  "levels": [
   2,
   2
  ],
  "style": "shape",
  "base": {
   "shape": "heart",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by the everyday shapes we see every day",
  "tags": [
   "heart",
   "shape maze",
   "shapes everywhere"
  ],
  "seedInspiration": "shapes",
  "seedTemplate": "shape-heart",
  "variants": [
   {
    "title": "Heart Card",
    "fun": "The heart shape has been a sign of love for hundreds of years.",
    "chars": [
     "cat",
     "flower"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "objects-everyday-shape-teapot",
  "family": 5,
  "level": 2,
  "levels": [
   2,
   2
  ],
  "style": "shape",
  "base": {
   "shape": "teapot",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by everyday objects and machines",
  "tags": [
   "teapot",
   "shape maze",
   "things we use every day"
  ],
  "seedInspiration": "objects-everyday",
  "seedTemplate": "shape-teapot",
  "variants": [
   {
    "title": "Wind Power",
    "fun": "Windmills use the wind to turn heavy stones that grind grain.",
    "chars": [
     "cat",
     "leaf"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "plants-shape-tree",
  "family": 4,
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
  "inspired": "Inspired by leaves, flowers, trees and fungi",
  "tags": [
   "tree",
   "shape maze",
   "plants and trees"
  ],
  "seedInspiration": "plants",
  "seedTemplate": "shape-tree",
  "variants": [
   {
    "title": "Oak Tree",
    "fun": "Some oak trees live for hundreds of years.",
    "chars": [
     "leaf",
     "cat"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "water-shape-whale",
  "family": 4,
  "level": 2,
  "levels": [
   2,
   2
  ],
  "style": "shape",
  "base": {
   "shape": "whale",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by ponds, tides, waves and sound",
  "tags": [
   "whale",
   "shape maze",
   "water and waves"
  ],
  "seedInspiration": "water",
  "seedTemplate": "shape-whale",
  "variants": [
   {
    "title": "Whale Song",
    "fun": "Whales sing, and their songs can travel a long way under water.",
    "chars": [
     "fish",
     "star"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "curves-rings-petals",
  "family": 6,
  "level": 2,
  "levels": [
   2,
   2
  ],
  "style": "rings",
  "base": {
   "look": "thin",
   "decor": "petals",
   "core": 1.6,
   "R": 240
  },
  "inspired": "Inspired by spirals, rings and round shapes in nature",
  "tags": [
   "flower",
   "circles",
   "curves and spirals"
  ],
  "seedInspiration": "curves",
  "seedTemplate": "rings-petals",
  "variants": [
   {
    "title": "Petal Circle",
    "fun": "Many flowers have their petals arranged in rings.",
    "chars": [
     "flower",
     "bee"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "animals-land-shape-hedgehog",
  "family": 4,
  "level": 2,
  "levels": [
   2,
   2
  ],
  "style": "shape",
  "base": {
   "shape": "hedgehog",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by animals that live on land",
  "tags": [
   "hedgehog",
   "shape maze",
   "animals on land"
  ],
  "seedInspiration": "animals-land",
  "seedTemplate": "shape-hedgehog",
  "variants": [
   {
    "title": "Rolling Hedgehog",
    "fun": "A hedgehog can roll into a ball to keep its soft belly safe.",
    "chars": [
     "cat",
     "leaf"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "sky-shape-sun",
  "family": 4,
  "level": 2,
  "levels": [
   2,
   2
  ],
  "style": "shape",
  "base": {
   "shape": "sun",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by the Moon, Sun, stars and clouds",
  "tags": [
   "sun",
   "shape maze",
   "sky and stars"
  ],
  "seedInspiration": "sky",
  "seedTemplate": "shape-sun",
  "variants": [
   {
    "title": "Sun Rays",
    "fun": "Sunlight takes about eight minutes to reach Earth.",
    "chars": [
     "cat",
     "sun"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "tilings-hex-snowflake",
  "family": 6,
  "level": 1,
  "levels": [
   1,
   1
  ],
  "style": "hexshape",
  "base": {
   "shape": "snowflake"
  },
  "inspired": "Inspired by shapes that fit together with no gaps",
  "tags": [
   "snowflake",
   "hexagons",
   "tilings and tessellations"
  ],
  "seedInspiration": "tilings",
  "seedTemplate": "hex-snowflake",
  "variants": [
   {
    "title": "Six Arms",
    "fun": "Snowflakes have six arms because ice freezes in a six-sided pattern.",
    "chars": [
     "star",
     "cat"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "animals-land-shape-lizard",
  "family": 4,
  "level": 1,
  "levels": [
   1,
   1
  ],
  "style": "shape",
  "base": {
   "shape": "lizard",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by animals that live on land",
  "tags": [
   "lizard",
   "shape maze",
   "animals on land"
  ],
  "seedInspiration": "animals-land",
  "seedTemplate": "shape-lizard",
  "variants": [
   {
    "title": "Sunning Lizard",
    "fun": "Some lizards can drop their tail and grow a new one.",
    "chars": [
     "cat",
     "sun"
    ],
    "p": {}
   }
  ]
 },
 {
  "id": "sky-shape-saturn",
  "family": 4,
  "level": 1,
  "levels": [
   1,
   1
  ],
  "style": "shape",
  "base": {
   "shape": "saturn",
   "look": {
    "outline": 11
   }
  },
  "inspired": "Inspired by the Moon, Sun, stars and clouds",
  "tags": [
   "saturn",
   "shape maze",
   "sky and stars"
  ],
  "seedInspiration": "sky",
  "seedTemplate": "shape-saturn",
  "variants": [
   {
    "title": "Ringed Planet",
    "fun": "Saturn's rings are made mostly of ice and rock.",
    "chars": [
     "cat",
     "star"
    ],
    "p": {}
   }
  ]
 }
];
