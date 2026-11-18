/* Drafting — bundled synthetic samples (invented for tests). Generated from samples/*.json; the page works from file:// with these. */
window.DRAFT_SAMPLES = [
 {
  "id": "synthetic-wall-section",
  "name": "Synthetic wall section (test)",
  "scale": "3\"=1'-0\"",
  "tags": [
   "export"
  ],
  "note": "Invented for tests. Not from a project. Sheet inches, y down, as Quick Detail draws.",
  "items": [
   {
    "id": "w1",
    "kind": "stroke",
    "pts": [
     [
      0,
      0,
      0.5,
      0
     ],
     [
      0,
      96,
      0.5,
      0
     ]
    ]
   },
   {
    "id": "w2",
    "kind": "stroke",
    "pts": [
     [
      8,
      0,
      0.5,
      0
     ],
     [
      8,
      96,
      0.5,
      0
     ]
    ]
   },
   {
    "id": "s1",
    "kind": "stroke",
    "pts": [
     [
      -12,
      0,
      0.5,
      0
     ],
     [
      20,
      0,
      0.5,
      0
     ]
    ]
   },
   {
    "id": "c1",
    "kind": "stroke",
    "lt": "dashed",
    "pts": [
     [
      -12,
      48,
      0.5,
      0
     ],
     [
      20,
      48,
      0.5,
      0
     ]
    ]
   },
   {
    "id": "h1",
    "kind": "hatch",
    "pattern": "steel",
    "pts": [
     [
      0,
      96
     ],
     [
      8,
      96
     ],
     [
      8,
      98
     ],
     [
      0,
      98
     ]
    ],
    "outline": true
   },
   {
    "id": "h2",
    "kind": "hatch",
    "pattern": "brick",
    "pts": [
     [
      -12,
      -6
     ],
     [
      20,
      -6
     ],
     [
      20,
      0
     ],
     [
      -12,
      0
     ]
    ],
    "outline": true
   },
   {
    "id": "n1",
    "kind": "note",
    "text": "CONTROL JOINT",
    "at": [
     12,
     40
    ],
    "size": 0.125,
    "width": 4
   },
   {
    "id": "n2",
    "kind": "note",
    "text": "STEEL PLATE\nSLAB ON GRADE",
    "at": [
     10,
     60
    ],
    "size": 0.125,
    "width": 4
   },
   {
    "id": "d1",
    "kind": "dim",
    "mode": "ortho",
    "p1": [
     0,
     100
    ],
    "p2": [
     8,
     100
    ],
    "at": [
     4,
     104
    ],
    "size": 0.125
   }
  ]
 },
 {
  "id": "synthetic-block-use",
  "name": "Synthetic block use (test)",
  "scale": "3\"=1'-0\"",
  "tags": [
   "export"
  ],
  "note": "Invented for tests. Places the synthetic wall section twice: full size and half size.",
  "items": [
   {
    "id": "b1",
    "kind": "block",
    "sourceId": "synthetic-wall-section",
    "at": [
     20,
     -40
    ],
    "k": 1
   },
   {
    "id": "b2",
    "kind": "block",
    "sourceId": "synthetic-wall-section",
    "at": [
     60,
     -40
    ],
    "k": 0.5
   },
   {
    "id": "f1",
    "kind": "stroke",
    "pts": [
     [
      0,
      -60,
      0.5,
      0
     ],
     [
      90,
      -60,
      0.5,
      0
     ]
    ]
   },
   {
    "id": "d2",
    "kind": "dim",
    "mode": "ortho",
    "p1": [
     20,
     -120
    ],
    "p2": [
     40,
     -120
    ],
    "at": [
     30,
     -126
    ],
    "size": 0.125
   }
  ]
 },
 {
  "id": "synthetic-small-label",
  "name": "Synthetic small label (test)",
  "scale": "1 1/2\"=1'-0\"",
  "tags": [
   "export"
  ],
  "note": "Invented for tests. Deliberately small, so the linter has warnings to show.",
  "items": [
   {
    "id": "a1",
    "kind": "stroke",
    "pts": [
     [
      0,
      0,
      0.5,
      0
     ],
     [
      0,
      12,
      0.5,
      0
     ],
     [
      12,
      12,
      0.5,
      0
     ]
    ]
   },
   {
    "id": "a2",
    "kind": "stroke",
    "pts": [
     [
      3,
      3,
      0.5,
      0
     ]
    ]
   },
   {
    "id": "a3",
    "kind": "note",
    "text": "TINY",
    "at": [
     2,
     6
    ],
    "size": 0.0625,
    "width": 2
   }
  ]
 }
];
