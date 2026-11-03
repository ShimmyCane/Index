/* Fishes — species, zones, levels and settings.
   Plain script, no build step. Real fish are the inspiration; the sizes are
   game sizes (1 = a baby fish, 100 = the largest fish ever). */
(function () {
  'use strict';

  // kind: food (never a threat) | prey (flees bigger fish, may school)
  //       ambush (waits and lunges) | hunter (roams, locks on) | harmless (drifts)
  // shape: round | slim | torpedo | puff | lantern | eel | lure | krill | plankton | oar | whale
  var SPECIES = [
    { id: 'plankton', name: 'Plankton', kind: 'food', shape: 'plankton', size: 0.25, speed: 14, col: '#fff3b0', minL: 1, base: 45,
      real: 'Copepods and other drifting animals. Most of the sea starts here.' },
    { id: 'krill', name: 'Krill', kind: 'food', shape: 'krill', hr: 0.35, size: 0.5, speed: 30, col: '#ffb3a7', minL: 3, base: 14,
      real: 'Shrimp-like krill, food for many fish and whales.' },

    { id: 'guppy', name: 'Guppy', kind: 'prey', shape: 'round', hr: 0.55, size: 0.8, speed: 85, col: '#ffd96e', fin: '#ff9fbe', minL: 1, base: 8, school: true,
      real: 'Guppy: small, bright, live-bearing fish.' },
    { id: 'neon', name: 'Neon tetra', kind: 'prey', shape: 'slim', hr: 0.32, size: 0.9, speed: 90, col: '#7cc3ff', stripe: '#ff6f8e', tail: '#b5e0ff', minL: 1, base: 8, school: true,
      real: 'Neon tetra: a glowing blue stripe over a red one.' },
    { id: 'clownfish', name: 'Clownfish', kind: 'prey', shape: 'round', hr: 0.6, size: 1.6, speed: 70, col: '#ff9d5c', fin: '#ff9d5c', bands: [-0.35, 0.4], bandCol: '#ffffff', minL: 2, base: 5,
      real: 'Clownfish: lives in sea anemones and is shielded by their stings.' },
    { id: 'damsel', name: 'Damselfish', kind: 'prey', shape: 'round', hr: 0.55, size: 1.3, speed: 90, col: '#5aa8ff', fin: '#2d4f8a', minL: 5, base: 6, school: true,
      real: 'Damselfish: small reef fish that guard their patch.' },
    { id: 'puffer', name: 'Pufferfish', kind: 'prey', shape: 'puff', hr: 0.85, size: 1.4, speed: 50, col: '#ffe38f', fin: '#f2c75c', spots: true, spotCol: '#9a7a33', spiky: true, minL: 4, base: 3,
      real: 'Pufferfish: swells with water and has spines. Poisonous to eat.' },
    { id: 'herring', name: 'Herring', kind: 'prey', shape: 'slim', hr: 0.3, size: 2.4, speed: 95, col: '#c4d9ef', fin: '#a7c4e0', minL: 4, base: 10, school: true,
      real: 'Herring: huge shoals keep predators busy.' },
    { id: 'parrot', name: 'Parrotfish', kind: 'prey', shape: 'round', hr: 0.5, size: 3.2, speed: 45, col: '#7fd6b0', fin: '#ffd3a1', minL: 5, base: 3,
      real: 'Parrotfish: grinds coral with fused, beak-like teeth.' },
    { id: 'angel', name: 'Angelfish', kind: 'prey', shape: 'round', hr: 0.9, size: 4, speed: 60, col: '#ffd98f', fin: '#ffb36b', bands: [-0.3, 0.1, 0.5], bandCol: '#5fb7ff', minL: 6, base: 3,
      real: 'Angelfish: tall and flat, built for weaving through reefs.' },
    { id: 'tang', name: 'Blue tang', kind: 'prey', shape: 'round', hr: 0.6, size: 3.4, speed: 130, col: '#3fa9e0', fin: '#2d8fd0', tail: '#ffd34d', minL: 6, base: 4, school: true,
      real: 'Blue tang (the fish in Finding Nemo): darts about the reef.' },
    { id: 'moray', name: 'Moray eel', kind: 'ambush', shape: 'eel', size: 7, speed: 40, col: '#9db57a', minL: 5, base: 2, range: 150,
      real: 'Moray eel: hides in crevices and lunges out.' },
    { id: 'mackerel', name: 'Mackerel', kind: 'prey', shape: 'slim', hr: 0.3, size: 6, speed: 110, col: '#4f8fb8', fin: '#7fb0d0', stripe: '#1f4f70', minL: 8, base: 6, school: true,
      real: 'Mackerel: fast schooling fish with dark wavy lines.' },
    { id: 'grouper', name: 'Grouper', kind: 'ambush', shape: 'round', hr: 0.6, size: 16, speed: 70, col: '#c99dd8', fin: '#b084c4', spots: true, spotCol: '#ffe2b0', minL: 8, base: 2, range: 190,
      real: 'Grouper: sits still on the reef and ambushes passing fish.' },
    { id: 'snapper', name: 'Snapper', kind: 'prey', shape: 'round', hr: 0.5, size: 11, speed: 100, col: '#ff8f7a', fin: '#ff6f5c', minL: 10, base: 4, school: true,
      real: 'Red snapper: sturdy reef fish that travel in groups.' },
    { id: 'barracuda', name: 'Barracuda', kind: 'hunter', shape: 'torpedo', hr: 0.26, size: 26, speed: 150, col: '#a8b7d6', fin: '#8fa0c4', stripe: '#6b7ba0', minL: 9, base: 2, sense: 280,
      real: 'Barracuda: fast ambush hunter with a mouthful of teeth.' },
    { id: 'tuna', name: 'Bluefin tuna', kind: 'hunter', shape: 'torpedo', hr: 0.3, size: 32, speed: 140, col: '#7eb0e6', fin: '#ffd99c', belly: '#eef4ff', minL: 10, base: 2, sense: 300,
      real: 'Bluefin tuna: a fast, warm-blooded cruiser.' },
    { id: 'reefshark', name: 'Reef shark', kind: 'hunter', shape: 'torpedo', hr: 0.3, size: 38, speed: 115, col: '#bcc8d8', belly: '#fbfdff', finH: 1.6, minL: 11, base: 2, sense: 300,
      real: 'Reef shark: patrols the reef edge.' },
    { id: 'trevally', name: 'Trevally', kind: 'prey', shape: 'torpedo', hr: 0.35, size: 18, speed: 120, col: '#9fd0c8', fin: '#e4f5f1', minL: 12, base: 3, school: true,
      real: 'Trevally: strong swimmers that chase schools of bait.' },
    { id: 'anglerfish', name: 'Anglerfish', kind: 'ambush', shape: 'lure', hr: 0.8, size: 44, speed: 40, col: '#6f6aa6', fin: '#58528c', minL: 13, base: 2, range: 230,
      real: 'Anglerfish: a glowing lure on a stalk draws prey in.' },
    { id: 'lanternfish', name: 'Lanternfish', kind: 'prey', shape: 'lantern', hr: 0.35, size: 2, speed: 75, col: '#8fe0ee', fin: '#6fc8da', glow: true, minL: 13, base: 14, school: true,
      real: 'Lanternfish: schools that glow with light spots to hide from below.' },
    { id: 'opah', name: 'Opah', kind: 'prey', shape: 'round', hr: 0.9, size: 26, speed: 80, col: '#e2a25c', fin: '#e8553e', spots: true, spotCol: '#fff1d0', minL: 15, base: 2,
      real: 'Opah: deep-sea fish with red fins and a warm body.' },
    { id: 'sunfish', name: 'Ocean sunfish', kind: 'harmless', shape: 'round', hr: 0.95, size: 40, speed: 25, col: '#b9c6d6', fin: '#9aa9bd', minL: 15, base: 2,
      real: 'Ocean sunfish: huge and flat, drifting near the top.' },
    { id: 'gulper', name: 'Gulper eel', kind: 'hunter', shape: 'eel', size: 75, speed: 90, col: '#8c8fd1', minL: 16, base: 1, sense: 320,
      real: 'Gulper eel: a deep-sea eel with a huge jaw.' },
    { id: 'oarfish', name: 'Oarfish', kind: 'harmless', shape: 'oar', hr: 0.07, size: 50, speed: 22, col: '#e6e9f7', fin: '#ff9e9e', minL: 17, base: 2,
      real: 'Oarfish: one of the longest bony fish, drifting in the deep.' },
    { id: 'whiteshark', name: 'Great white', kind: 'hunter', shape: 'torpedo', hr: 0.3, size: 85, speed: 130, col: '#c4d2e6', belly: '#ffffff', finH: 1.6, minL: 18, base: 1, sense: 340,
      real: 'Great white shark: a top predator of the open ocean.' },
    { id: 'megamouth', name: 'Megamouth shark', kind: 'harmless', shape: 'round', hr: 0.4, size: 60, speed: 30, col: '#7c8ec0', belly: '#eef2ff', minL: 18, base: 1,
      real: 'Megamouth shark: a rare filter feeder with a huge open mouth.' },
    { id: 'whaleshark', name: 'Whale shark', kind: 'harmless', shape: 'whale', hr: 0.3, size: 100, speed: 35, col: '#7f9fc7', belly: '#eef6ff', spots: true, spotCol: '#ffffff', minL: 19, base: 1,
      real: 'Whale shark: the largest fish alive. It filter-feeds on plankton, the same food you start on.' }
  ];

  // Depth zones: the sea gets deeper, bigger and darker level by level.
  var ZONES = [
    { name: 'Sunny Shallows', top: '#dff8f1', bottom: '#b8ead8', sand: '#f7e6bf', rays: true },
    { name: 'Coral Reef', top: '#d6f3f7', bottom: '#a9e1ec', sand: '#f4dcc8', rays: true },
    { name: 'Open Blue', top: '#c6e4fb', bottom: '#8fc3ec', sand: '#d9e7f3', rays: false },
    { name: 'Twilight', top: '#c9c8f0', bottom: '#8d8fd0', sand: '#b9b6dc', rays: false },
    { name: 'Deep Trench', top: '#6f73b5', bottom: '#333b74', sand: '#2a3163', rays: false }
  ];

  var LEVEL_NAMES = [
    'Sunny Cove', 'Sea-grass Flats', 'Rock Pool Edge', 'Sandy Shelf',
    'Coral Gardens', 'Anemone Bay', 'Reef Wall', 'Parrot Lagoon',
    'Open Blue', 'Tuna Run', 'Shark Lane', 'Wide Water',
    'Twilight Shoal', 'Lantern Drift', 'Angler Shelf', 'Slope Edge',
    'Deep Trench', 'Oar Valley', 'Abyss Mouth', 'Whale Ocean'
  ];

  // Size needed to leave each level (level 20 = 100 = the largest fish ever).
  var GOALS = [2, 3, 4, 5, 7, 9, 11, 14, 17, 21, 25, 30, 36, 43, 50, 58, 67, 77, 88, 100];

  function zoneIndex(n) { return n <= 4 ? 0 : n <= 8 ? 1 : n <= 12 ? 2 : n <= 16 ? 3 : 4; }

  function levelInfo(n) {
    return {
      n: n,
      name: LEVEL_NAMES[n - 1],
      zone: ZONES[zoneIndex(n)],
      zoneIndex: zoneIndex(n),
      W: 1600 + (n - 1) * 260,       // the water world scales out as you go deeper
      H: 1000 + (n - 1) * 160,
      goal: GOALS[n - 1],
      enterSize: n === 1 ? 1 : GOALS[n - 2]
    };
  }

  var CONFIG = {
    TIME_LIMIT: 900,                 // hard stop at 15 minutes
    LIVES: 3,
    TENSION: { start: 150, full: 300 }, // harder from 2:30, full by 5:00
    // Database (Family Supabase project). Leave blank until the migration in
    // supabase/001_fish_notes.sql has been applied and a publishable key is
    // added here. Publishable keys only, never the service-role key.
    supabaseUrl: '',
    supabaseKey: '',
    notesTable: 'fish_notes'
  };

  window.FishData = {
    SPECIES: SPECIES,
    ZONES: ZONES,
    GOALS: GOALS,
    LEVEL_NAMES: LEVEL_NAMES,
    levelInfo: levelInfo,
    CONFIG: CONFIG
  };
})();
