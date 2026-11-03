/* Fishes — tiers, species, zones and settings.
   Plain script, no build step. Real fish are the inspiration; sizes are game
   sizes (1 = a baby fish, 100 = the largest fish ever).

   20 tiers (one per level). Each tier has several species. The first species
   listed for a tier is the form the player evolves into on reaching it.

   temper:
     docile      never attacks, never locks on, flees bigger fish
     wary        hunts smaller fish, ignores you when you are smaller, flees when you are bigger
     aggressive  hunts smaller fish and locks on to you when you are smaller
   kind (movement):
     food        plankton and krill, drift and get eaten
     prey        small fish that flee bigger fish; some school
     ambush      sits near a spot and lunges
     hunter      roams and chases
     harmless    drifts; never attacks
   shape: round | slim | torpedo | puff | lantern | eel | lure | krill | plankton | oar | whale
*/
(function () {
  'use strict';

  var SPECIES = [
    // Tier 1 — Sunny Cove
    { id: 'guppy', name: 'Guppy', tier: 1, kind: 'prey', temper: 'docile', shape: 'round', hr: 0.55, size: 0.8, speed: 85, col: '#ffd96e', fin: '#ff9fbe', school: true,
      real: 'Guppy: small, bright, live-bearing freshwater fish.' },
    { id: 'neon', name: 'Neon tetra', tier: 1, kind: 'prey', temper: 'docile', shape: 'slim', hr: 0.32, size: 0.9, speed: 90, col: '#7cc3ff', stripe: '#ff6f8e', tail: '#b5e0ff', school: true,
      real: 'Neon tetra: a glowing blue stripe over a red one.' },
    { id: 'plankton', name: 'Plankton', tier: 1, kind: 'food', temper: 'docile', shape: 'plankton', size: 0.25, speed: 14, col: '#fff3b0', base: 40,
      real: 'Copepods and other drifting animals. Most of the sea starts here.' },

    // Tier 2 — Sea-grass Flats
    { id: 'clownfish', name: 'Clownfish', tier: 2, kind: 'prey', temper: 'docile', shape: 'round', hr: 0.6, size: 1.6, speed: 70, col: '#ff9d5c', fin: '#ff9d5c', bands: [-0.35, 0.4], bandCol: '#ffffff',
      real: 'Clownfish: lives among sea anemone tentacles, shielded by their sting.' },
    { id: 'goby', name: 'Goby', tier: 2, kind: 'prey', temper: 'docile', shape: 'round', hr: 0.45, size: 1.1, speed: 75, col: '#c9a46b', fin: '#e0c08a',
      real: 'Goby: small bottom-dwelling fish that sit on the sand.' },
    { id: 'dottyback', name: 'Dottyback', tier: 2, kind: 'hunter', temper: 'wary', shape: 'round', hr: 0.5, size: 2.0, speed: 100, col: '#b06bd6', fin: '#8e4fb8',
      real: 'Dottyback: a small, feisty reef fish that chases off rivals.' },
    { id: 'krill', name: 'Krill', tier: 2, kind: 'food', temper: 'docile', shape: 'krill', hr: 0.35, size: 0.5, speed: 30, col: '#ffb3a7', base: 12,
      real: 'Shrimp-like krill, food for many fish and whales.' },

    // Tier 3 — Rock Pool Edge
    { id: 'wrasse', name: 'Cleaner wrasse', tier: 3, kind: 'prey', temper: 'wary', shape: 'slim', hr: 0.36, size: 2.0, speed: 110, col: '#ffd34d', tail: '#ffd34d', stripe: '#2d6fd0', school: true,
      real: 'Cleaner wrasse: picks parasites off bigger fish, and is usually left alone.' },
    { id: 'herring', name: 'Herring', tier: 3, kind: 'prey', temper: 'docile', shape: 'slim', hr: 0.3, size: 2.4, speed: 95, col: '#c4d9ef', fin: '#a7c4e0', school: true,
      real: 'Herring: huge shoals keep predators busy.' },

    // Tier 4 — Sandy Shelf
    { id: 'anchovy', name: 'Anchovy', tier: 4, kind: 'prey', temper: 'docile', shape: 'slim', hr: 0.28, size: 2.8, speed: 100, col: '#b8d8e8', school: true,
      real: 'Anchovy: tiny schooling fish, a major food for bigger fish.' },
    { id: 'pufferfish', name: 'Pufferfish', tier: 4, kind: 'prey', temper: 'docile', shape: 'puff', hr: 0.85, size: 1.4, speed: 50, col: '#ffe38f', fin: '#f2c75c', spots: true, spotCol: '#9a7a33', spiky: true,
      real: 'Pufferfish: swells with water and has spines. Poisonous to eat.' },
    { id: 'butterflyfish', name: 'Butterflyfish', tier: 4, kind: 'prey', temper: 'docile', shape: 'round', hr: 0.6, size: 2.6, speed: 95, col: '#ffe36b', fin: '#ffd23a', bands: [-0.2, 0.5], bandCol: '#3a3a3a',
      real: 'Butterflyfish: pairs on the reef, often bright yellow with a dark eye band.' },

    // Tier 5 — Coral Gardens
    { id: 'parrotfish', name: 'Parrotfish', tier: 5, kind: 'prey', temper: 'docile', shape: 'round', hr: 0.5, size: 3.2, speed: 45, col: '#7fd6b0', fin: '#ffd3a1',
      real: 'Parrotfish: grinds coral with fused, beak-like teeth.' },
    { id: 'damsel', name: 'Blue damselfish', tier: 5, kind: 'prey', temper: 'wary', shape: 'round', hr: 0.55, size: 4.5, speed: 90, col: '#5aa8ff', fin: '#2d4f8a', school: true,
      real: 'Damselfish: small reef fish that guard their patch and chase off intruders.' },
    { id: 'moray', name: 'Moray eel', tier: 5, kind: 'ambush', temper: 'aggressive', shape: 'eel', size: 7, speed: 40, col: '#9db57a', range: 150,
      real: 'Moray eel: hides in crevices and lunges out.' },

    // Tier 6 — Anemone Bay
    { id: 'angelfish', name: 'Angelfish', tier: 6, kind: 'prey', temper: 'docile', shape: 'round', hr: 0.9, size: 4, speed: 60, col: '#ffd98f', fin: '#ffb36b', bands: [-0.3, 0.1, 0.5], bandCol: '#5fb7ff',
      real: 'Angelfish: tall and flat, built for weaving through reefs.' },
    { id: 'tang', name: 'Blue tang', tier: 6, kind: 'prey', temper: 'docile', shape: 'round', hr: 0.6, size: 3.4, speed: 130, col: '#3fa9e0', fin: '#2d8fd0', tail: '#ffd34d', school: true,
      real: 'Blue tang (the fish in Finding Nemo): darts about the reef.' },
    { id: 'lionfish', name: 'Lionfish', tier: 6, kind: 'prey', temper: 'wary', shape: 'round', hr: 0.6, size: 5.0, speed: 50, col: '#d9775a', fin: '#f0a07a', bands: [-0.4, 0, 0.4], bandCol: '#fff3e6', spiky: true,
      real: 'Lionfish: venomous spines and a slow, showy swim. Spiny to eat.' },

    // Tier 7 — Reef Wall
    { id: 'mackerel', name: 'Mackerel', tier: 7, kind: 'prey', temper: 'wary', shape: 'slim', hr: 0.3, size: 6, speed: 110, col: '#4f8fb8', fin: '#7fb0d0', stripe: '#1f4f70', school: true,
      real: 'Mackerel: fast schooling fish with dark wavy lines.' },
    { id: 'triggerfish', name: 'Triggerfish', tier: 7, kind: 'prey', temper: 'docile', shape: 'round', hr: 0.7, size: 5.5, speed: 60, col: '#7fa6c9', fin: '#5f86b8',
      real: 'Triggerfish: a locking spine on the back keeps it wedged in the reef.' },
    { id: 'bonito', name: 'Bonito', tier: 7, kind: 'hunter', temper: 'aggressive', shape: 'torpedo', hr: 0.28, size: 8, speed: 170, col: '#5f86b8', fin: '#3f6a9f', sense: 240,
      real: 'Bonito: a fast, striped relative of the tuna that hunts schools.' },

    // Tier 8 — Parrot Lagoon
    { id: 'mullet', name: 'Grey mullet', tier: 8, kind: 'prey', temper: 'docile', shape: 'slim', hr: 0.3, size: 9, speed: 90, col: '#b9b3a8', fin: '#c9c4bb', school: true,
      real: 'Grey mullet: grazes on the bottom in big, calm schools.' },
    { id: 'snapper', name: 'Red snapper', tier: 8, kind: 'prey', temper: 'wary', shape: 'round', hr: 0.5, size: 11, speed: 100, col: '#ff8f7a', fin: '#ff6f5c', school: true,
      real: 'Red snapper: sturdy reef fish that travel in groups.' },
    { id: 'grouper', name: 'Grouper', tier: 8, kind: 'ambush', temper: 'wary', shape: 'round', hr: 0.6, size: 16, speed: 70, col: '#c99dd8', fin: '#b084c4', spots: true, spotCol: '#ffe2b0', range: 190,
      real: 'Grouper: sits still on the reef and ambushes passing fish.' },

    // Tier 9 — Open Blue
    { id: 'jack', name: 'Jack', tier: 9, kind: 'prey', temper: 'wary', shape: 'torpedo', hr: 0.35, size: 13, speed: 120, col: '#9fd0c8', fin: '#e4f5f1', school: true,
      real: 'Jack: a strong swimmer that moves in tight schools.' },
    { id: 'trevally', name: 'Trevally', tier: 9, kind: 'hunter', temper: 'wary', shape: 'torpedo', hr: 0.35, size: 18, speed: 120, col: '#8fc7bd', fin: '#e4f5f1',
      real: 'Trevally: strong swimmers that chase schools of bait.' },
    { id: 'barracuda', name: 'Barracuda', tier: 9, kind: 'hunter', temper: 'aggressive', shape: 'torpedo', hr: 0.26, size: 26, speed: 150, col: '#a8b7d6', fin: '#8fa0c4', stripe: '#6b7ba0', sense: 280,
      real: 'Barracuda: fast ambush hunter with a mouthful of teeth.' },

    // Tier 10 — Tuna Run
    { id: 'mahi', name: 'Mahi-mahi', tier: 10, kind: 'prey', temper: 'wary', shape: 'torpedo', hr: 0.3, size: 15, speed: 160, col: '#ffd84d', fin: '#7ad0a0', school: true,
      real: 'Mahi-mahi: bright, fast surface swimmers that follow floating debris.' },
    { id: 'bluefin', name: 'Bluefin tuna', tier: 10, kind: 'hunter', temper: 'aggressive', shape: 'torpedo', hr: 0.3, size: 32, speed: 140, col: '#7eb0e6', fin: '#ffd99c', belly: '#eef4ff', sense: 300,
      real: 'Bluefin tuna: a fast, warm-blooded cruiser.' },

    // Tier 11 — Shark Lane
    { id: 'rainbowrunner', name: 'Rainbow runner', tier: 11, kind: 'prey', temper: 'docile', shape: 'torpedo', hr: 0.32, size: 12, speed: 120, col: '#6fb9d8', fin: '#f2d66b', school: true,
      real: 'Rainbow runner: a colourful open-water fish that travels in schools.' },
    { id: 'reefshark', name: 'Reef shark', tier: 11, kind: 'hunter', temper: 'aggressive', shape: 'torpedo', hr: 0.3, size: 38, speed: 115, col: '#bcc8d8', belly: '#fbfdff', finH: 1.6, sense: 300,
      real: 'Reef shark: patrols the reef edge.' },
    { id: 'sailfish', name: 'Sailfish', tier: 11, kind: 'hunter', temper: 'wary', shape: 'torpedo', hr: 0.3, size: 30, speed: 170, col: '#5d7fb8', fin: '#2f5a9a', finH: 1.8,
      real: 'Sailfish: the fastest swimmer in the ocean, with a huge sail-like fin.' },

    // Tier 12 — Wide Water
    { id: 'seabream', name: 'Sea bream', tier: 12, kind: 'prey', temper: 'docile', shape: 'round', hr: 0.5, size: 22, speed: 90, col: '#d8b08a', fin: '#c99a72', school: true,
      real: 'Sea bream: a common, calm shoaling fish.' },
    { id: 'wahoo', name: 'Wahoo', tier: 12, kind: 'hunter', temper: 'aggressive', shape: 'torpedo', hr: 0.25, size: 26, speed: 180, col: '#5fb0c8', stripe: '#1d4f70', sense: 280,
      real: 'Wahoo: very fast, with a toothy mouth. Strikes at lures.' },
    { id: 'marlin', name: 'Striped marlin', tier: 12, kind: 'hunter', temper: 'wary', shape: 'torpedo', hr: 0.3, size: 34, speed: 170, col: '#3d6fa8', fin: '#2b5a92', finH: 1.6,
      real: 'Striped marlin: a long-billed open-water hunter.' },

    // Tier 13 — Twilight Shoal
    { id: 'lanternfish', name: 'Lanternfish', tier: 13, kind: 'prey', temper: 'docile', shape: 'lantern', hr: 0.35, size: 2, speed: 75, col: '#8fe0ee', fin: '#6fc8da', glow: true, school: true,
      real: 'Lanternfish: schools that glow with light spots to hide from below.' },
    { id: 'hatchetfish', name: 'Hatchetfish', tier: 13, kind: 'prey', temper: 'wary', shape: 'slim', hr: 0.4, size: 4, speed: 90, col: '#c8d4c0', fin: '#a9b8a0', school: true,
      real: 'Hatchetfish: flat, silver and deep, with light organs under the belly.' },
    { id: 'opah', name: 'Opah', tier: 13, kind: 'prey', temper: 'docile', shape: 'round', hr: 0.9, size: 26, speed: 80, col: '#e2a25c', fin: '#e8553e', spots: true, spotCol: '#fff1d0',
      real: 'Opah: a deep-sea fish with red fins and a warm body.' },

    // Tier 14 — Lantern Drift
    { id: 'escolar', name: 'Escolar', tier: 14, kind: 'hunter', temper: 'wary', shape: 'torpedo', hr: 0.3, size: 28, speed: 110, col: '#7a5c8a', fin: '#4d3a5c',
      real: 'Escolar: a deep-water fish with an oily body that hunts in the dark.' },
    { id: 'sunfish', name: 'Ocean sunfish', tier: 14, kind: 'harmless', temper: 'docile', shape: 'round', hr: 0.95, size: 40, speed: 25, col: '#b9c6d6', fin: '#9aa9bd',
      real: 'Ocean sunfish: huge and flat, drifting near the top.' },
    { id: 'anglerfish', name: 'Anglerfish', tier: 14, kind: 'ambush', temper: 'aggressive', shape: 'lure', hr: 0.8, size: 46, speed: 40, col: '#6f6aa6', fin: '#58528c', range: 230,
      real: 'Anglerfish: a glowing lure on a stalk draws prey in.' },

    // Tier 15 — Angler Shelf
    { id: 'pomfret', name: 'Pomfret', tier: 15, kind: 'prey', temper: 'docile', shape: 'round', hr: 0.6, size: 36, speed: 100, col: '#c7d6e8', fin: '#a8bfd8', school: true,
      real: 'Pomfret: a flat, silvery fish that shoals in deep, open water.' },
    { id: 'swordfish', name: 'Swordfish', tier: 15, kind: 'hunter', temper: 'aggressive', shape: 'torpedo', hr: 0.26, size: 60, speed: 180, col: '#3d5f8a', fin: '#2b4a70', finH: 1.4, sense: 300,
      real: 'Swordfish: a fast hunter with a long, flat bill.' },

    // Tier 16 — Slope Edge
    { id: 'oilfish', name: 'Oilfish', tier: 16, kind: 'prey', temper: 'docile', shape: 'torpedo', hr: 0.25, size: 48, speed: 80, col: '#9aa6c8', fin: '#7b88b0',
      real: 'Oilfish: a long, soft, oily fish of the deep slope.' },
    { id: 'gulper', name: 'Gulper eel', tier: 16, kind: 'hunter', temper: 'aggressive', shape: 'eel', size: 75, speed: 90, col: '#8c8fd1', sense: 320,
      real: 'Gulper eel: a deep-sea eel with a huge, stretchy jaw.' },

    // Tier 17 — Deep Trench
    { id: 'viperfish', name: 'Viperfish', tier: 17, kind: 'prey', temper: 'wary', shape: 'slim', hr: 0.3, size: 22, speed: 80, col: '#b8c8d8', fin: '#8fa0b8', glow: true,
      real: 'Viperfish: long teeth and light organs along its sides.' },
    { id: 'coelacanth', name: 'Coelacanth', tier: 17, kind: 'harmless', temper: 'docile', shape: 'round', hr: 0.45, size: 60, speed: 20, col: '#7f6bb0', fin: '#5f4e90',
      real: 'Coelacanth: a "living fossil" with lobed fins, slow and deep.' },
    { id: 'oarfish', name: 'Oarfish', tier: 17, kind: 'harmless', temper: 'docile', shape: 'oar', hr: 0.07, size: 50, speed: 22, col: '#e6e9f7', fin: '#ff9e9e',
      real: 'Oarfish: one of the longest bony fish, drifting in the deep.' },

    // Tier 18 — Abyss Mouth
    { id: 'goblin', name: 'Goblin shark', tier: 18, kind: 'hunter', temper: 'wary', shape: 'torpedo', hr: 0.3, size: 70, speed: 90, col: '#e8a0a8', fin: '#d8828c',
      real: 'Goblin shark: a deep shark with a long, flat snout and jaws that shoot out.' },
    { id: 'megamouth', name: 'Megamouth shark', tier: 18, kind: 'harmless', temper: 'docile', shape: 'round', hr: 0.4, size: 60, speed: 30, col: '#7c8ec0', belly: '#eef2ff',
      real: 'Megamouth shark: a rare filter feeder with a huge open mouth.' },
    { id: 'whiteshark', name: 'Great white', tier: 18, kind: 'hunter', temper: 'aggressive', shape: 'torpedo', hr: 0.3, size: 85, speed: 130, col: '#c4d2e6', belly: '#ffffff', finH: 1.6, sense: 340,
      real: 'Great white shark: a top predator of the open ocean.' },

    // Tier 19 — Whale Ocean
    { id: 'greenland', name: 'Greenland shark', tier: 19, kind: 'hunter', temper: 'wary', shape: 'torpedo', hr: 0.3, size: 80, speed: 70, col: '#6f7d8c', fin: '#58646f',
      real: 'Greenland shark: a very long-lived, slow deep-water shark.' },
    { id: 'bluemarlin', name: 'Blue marlin', tier: 19, kind: 'hunter', temper: 'aggressive', shape: 'torpedo', hr: 0.28, size: 88, speed: 170, col: '#2e5fa0', fin: '#1f4580', finH: 1.8, sense: 330,
      real: 'Blue marlin: one of the largest bony fish, with a spear-like bill.' },

    // Tier 20 — the top
    { id: 'basking', name: 'Basking shark', tier: 20, kind: 'harmless', temper: 'docile', shape: 'torpedo', hr: 0.32, size: 85, speed: 30, col: '#8f9db0', belly: '#e8eef4',
      real: 'Basking shark: the second-largest fish, a calm filter feeder.' },
    { id: 'whaleshark', name: 'Whale shark', tier: 20, kind: 'harmless', temper: 'docile', shape: 'whale', hr: 0.3, size: 100, speed: 35, col: '#7f9fc7', belly: '#eef6ff', spots: true, spotCol: '#ffffff',
      real: 'Whale shark: the largest fish alive. It filter-feeds on plankton, the same food you start on.' }
  ];

  // Depth zones: the sea gets deeper, bigger and darker tier by tier.
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

  // Size needed to leave each tier (tier 20 = 100 = the largest fish ever).
  var GOALS = [2, 3, 4, 5, 7, 9, 11, 14, 17, 21, 25, 30, 36, 43, 50, 58, 67, 77, 88, 100];

  // Difficulty is the predator:prey ratio of the fish the sea sends you.
  // "Predator" = a non-docile fish at least 1.1x your size (it can eat you).
  // "Prey" = a fish you can eat (at most 0.87x your size).
  var DIFFICULTY = {
    easy:   { label: 'Easy',   ratio: '1 predator : 4 prey', share: 0.2 },
    medium: { label: 'Medium', ratio: '1 predator : 2 prey', share: 1 / 3 },
    hard:   { label: 'Hard',   ratio: '1 predator : 1 prey', share: 0.5 }
  };

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

  // The player's form on a tier: the first species listed for that tier.
  function leadOf(n) {
    for (var i = 0; i < SPECIES.length; i++) if (SPECIES[i].tier === n) return SPECIES[i];
    return SPECIES[0];
  }

  var CONFIG = {
    TIME_LIMIT: 900,                    // hard stop at 15 minutes
    LIVES: 3,
    TENSION: { start: 150, full: 300 }, // harder from 2:30, full by 5:00 (raises the predator share by up to 50%)
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
    DIFFICULTY: DIFFICULTY,
    levelInfo: levelInfo,
    leadOf: leadOf,
    CONFIG: CONFIG
  };
})();
