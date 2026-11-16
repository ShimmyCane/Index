// Felix Gear Wars: game data (units, gears, chapters, levels, stories). No DOM, so Node can load it for the balance tests.
(function () {
  'use strict';
  var F = globalThis.FGW = globalThis.FGW || {};
  F.version = '0.1.0';

  // ---- the world --------------------------------------------------------------------------
  F.VIEW_W = 1280;             // logical width of the screen
  F.WORLD = 2560;              // the battlefield is two screens wide
  F.BASE_X = 150;              // our wall: enemies that cross it cost a life
  F.ENEMY_BASE_X = 2400;       // the enemy fortress
  F.DROP_X0 = 130; F.DROP_SPAN = 860;   // pegboard columns map onto this stretch of ground
  F.HEART_PERIOD = 3.2;        // seconds for one turn of the heart (half the first pace; the slider scales it)
  F.BOSS_REVS = 100;           // heart turns one boss-gear turn takes (⚙️ can change it): 1 to 100 against other gears
  // difficulty knobs, used by levelConfig and enemyScale (tools/balance_sim.js sweeps them)
  F.TUNE = { base: 30, perLevel: 26, perWave: 0.5, hp: 0.09, atk: 0.055, fort: 700, fortPer: 80, short: 0.6, mid: 0.85, rLow: 0.4, rPeak: 1.1, rIdx: 1.1, gearsPerLast: 0.8 };   // rLow, rPeak: wave power against Felix's power at the start and at the fun peak; rIdx: extra pressure by the last level   // short, mid: wave size on a one-screen and a one-and-a-half-screen map
  F.MAX_UNITS = 50;            // soldiers on each side at once

  F.SM = [1, 2.2, 4.6, 9.4];   // stat multiplier per gear level (more than double per merge)
  F.SPECIALTY_BONUS = 1.25;    // a culture's starred fighter gets +25% attack and health
  F.LEVEL_SPEED = 0.92;        // each merge level needs this much of the ticks: stats x2.2 for 8% less time, about 20% better than two side by side
  F.MULTV = [1, 2, 4, 8];      // multiplier gear values
  F.MAXLEVEL = 4;

  // ---- fighters ---------------------------------------------------------------------------
  // tick0 = quarter turns of the heart one gear needs for one level-1 fighter. The spearman is the reference (12). The others follow
  // their power, so every gear makes about the same amount of attack, defence and health per minute: the archer matches the spearman,
  // the fighter, assassin, knight and mage take 1.4 to 1.7 times as long, the tank 2.5 times and the catapult 3 times.
  // kind: melee | ranged. vs = damage multiplier against a type. shield = multiplier on incoming ranged damage.
  F.UNITS = {
    spearman: { name: 'Spearman', cost: 30, tick0: 12, hp: 70, atk: 10, def: 5, range: 46, speed: 46, cd: 1.0, kind: 'melee',
      vs: { knight: 2.6 }, order: 1 },
    archer:   { name: 'Archer', cost: 40, tick0: 12, hp: 40, atk: 9, def: 1, range: 330, speed: 40, cd: 1.1, kind: 'ranged',
      vs: { spearman: 1.4, fighter: 1.1, tank: 0.6, knight: 0.9 }, order: 2 },
    fighter:  { name: 'Fighter', cost: 45, tick0: 17, hp: 105, atk: 11, def: 9, range: 46, speed: 42, cd: 0.95, kind: 'melee',
      vs: { archer: 1.5, mage: 1.4, catapult: 1.3 }, shield: 0.55, order: 3 },
    assassin: { name: 'Assassin', cost: 50, tick0: 16, hp: 46, atk: 18, def: 2, range: 40, speed: 98, cd: 0.6, kind: 'melee',
      vs: { archer: 2.0, mage: 2.0, catapult: 2.0, fighter: 0.6, tank: 0.4 }, hunts: true, order: 4 },
    knight:   { name: 'Knight', cost: 65, tick0: 20, hp: 125, atk: 15, def: 10, range: 56, speed: 92, cd: 1.1, kind: 'melee',
      vs: { archer: 1.6, mage: 1.5, catapult: 1.6, assassin: 1.2, spearman: 0.8, tank: 0.6 }, charge: 1.8, order: 5 },
    tank:     { name: 'Tank', cost: 70, tick0: 30, hp: 290, atk: 12, def: 26, range: 50, speed: 26, cd: 1.4, kind: 'melee',
      vs: {}, order: 6 },
    mage:     { name: 'Mage', cost: 70, tick0: 18, hp: 44, atk: 22, def: 1, range: 280, speed: 36, cd: 1.7, kind: 'ranged',
      vs: { tank: 1.6, knight: 1.3 }, magic: true, splash: 70, order: 7 },
    catapult: { name: 'Catapult', cost: 90, tick0: 36, hp: 95, atk: 30, def: 6, range: 560, minRange: 170, speed: 22, cd: 3.2, kind: 'ranged',
      vs: { tank: 1.3 }, splash: 80, siege: 2.2, order: 8 },
  };
  F.UNIT_ORDER = ['spearman', 'archer', 'fighter', 'assassin', 'knight', 'tank', 'mage', 'catapult'];

  // ---- champions: what a boss gear makes. Each is a different awesome unit with its own power --------------------
  F.CHAMPS = {
    dragon:  { name: 'Dragon', hp: 420, atk: 36, def: 10, range: 300, speed: 70, cd: 2.4, kind: 'ranged', fly: true, power: 'breath', scale: 1.5, info: 'Flies and breathes fire on everything in front of it.' },
    king:    { name: 'King', hp: 620, atk: 30, def: 22, range: 56, speed: 50, cd: 1.0, kind: 'melee', power: 'rally', scale: 1.5, info: 'Rallies fighters near him: +30% attack and he heals them.' },
    cart:    { name: 'Felix the Cart', hp: 520, atk: 26, def: 28, range: 40, speed: 140, cd: 0.5, kind: 'melee', power: 'pierce', scale: 1.35, info: 'Rolls straight through the enemy and knocks them back.' },
    griffin: { name: 'Griffin', hp: 300, atk: 40, def: 6, range: 50, speed: 150, cd: 0.9, kind: 'melee', fly: true, hunts: true, charge: 1.6, scale: 1.35, power: 'dive', info: 'Flies over spears and dives on the back line.' },
    golem:   { name: 'Golem', hp: 1100, atk: 34, def: 40, range: 52, speed: 28, cd: 1.8, kind: 'melee', power: 'quake', scale: 1.9, info: 'Stomps the ground and slows every enemy near it.' },
    unicorn: { name: 'Unicorn', hp: 360, atk: 20, def: 14, range: 220, speed: 70, cd: 1.4, kind: 'ranged', magic: true, power: 'heal', scale: 1.25, info: 'Heals the fighters near it with a rainbow.' },
  };
  F.CHAMP_ORDER = ['dragon', 'king', 'cart', 'griffin', 'golem', 'unicorn'];
  Object.keys(F.CHAMPS).forEach(function (k) { F.UNITS[k] = Object.assign({ cost: 0, tick0: 0, vs: {}, champ: true }, F.CHAMPS[k]); });

  // ---- how much power is a fighter? sqrt(effective health x damage per second) with range, splash and siege modifiers.
  var powerCache = {};
  F.unitPower = function (type) {
    if (powerCache[type]) return powerCache[type];
    var u = F.UNITS[type], ehp = u.hp * (1 + u.def / 40), dps = u.atk / u.cd, rm = u.kind === 'ranged' ? 1 + u.range / 600 : 1, sp = u.splash ? 1 + u.splash / 300 : 1, sg = u.siege ? 1.15 : 1;
    return (powerCache[type] = Math.sqrt(ehp * dps) * rm * sp * sg);
  };
  // ---- the fun curve: a level is a hill. Calm start, most exciting at the peak, easing off to the fade time. Minutes in, 0 to 1 out.
  F.FUN = { peak: 3, fade: 7 };
  F.funCurve = function (t, peak, fade) {
    if (t >= fade) return 0;
    if (t <= peak) { var x = Math.max(0, t / peak); return 0.25 + 0.75 * (x * x * (3 - 2 * x)); }
    var y = (t - peak) / (fade - peak); return 1 - y * y * (3 - 2 * y);
  };
  // ---- castles, fortresses and towers: the castle is worth 5 fighters on the first level and 10 on the last
  F.castleUnits = function (idx) { return 5 + 5 * Math.min(1, idx / 23); };
  // ---- gear economy: a level starts with a fixed purse, and every gear you own makes the next one dearer, so the number of gears
  // you can have at the end follows the size of the enemy's last wave.
  F.economy = function (idx) {
    var lastWave = Math.round(5 + idx);                           // opponents in the expected last wave
    var target = Math.max(4, Math.round(F.TUNE.gearsPerLast * lastWave));
    return { lastWave: lastWave, gearTarget: target, creep: 1.5 / target, coins: 45 * Math.max(3, Math.ceil(0.35 * target)) };   // the target-th gear costs 2.5 times the first
  };

  // ---- gears that are not fighters --------------------------------------------------------
  F.SPECIALS = {
    mult:      { name: 'Multiplier', cost: 15, icon: 'mult', note: 'Passes ticks on, times 1, 2, 4 or 8' },
    boss:      { name: 'Boss gear', cost: 120, icon: 'boss', note: 'Turns very slowly, then a champion steps out' },
    lightning: { name: 'Lightning', cost: 60, tick0: 20, icon: 'lightning', dmg: 30, strikes: 2 },
    rocket:    { name: 'Rockets', cost: 70, tick0: 24, icon: 'rocket', dmg: 40, splash: 95 },
    shuriken:  { name: 'Shuriken', cost: 60, tick0: 20, icon: 'shuriken', dmg: 22 },
  };
  F.gearInfo = function (type) { return F.UNITS[type] || F.SPECIALS[type]; };
  F.gearCost = function (type) { return F.gearInfo(type).cost; };
  F.ticksNeeded = function (type, level) {
    if (type === 'boss') return Math.max(1, Math.ceil(4 * F.BOSS_REVS * Math.pow(0.75, level - 1)));   // a quarter turn of the heart = 1
    var g = F.gearInfo(type); if (!g.tick0) return 0;
    return Math.max(1, Math.round(g.tick0 * Math.pow(F.LEVEL_SPEED, level - 1)));
  };
  F.bounty = function (type, boss) {
    var u = F.UNITS[type]; var b = Math.ceil(u.cost * 0.24);
    return boss ? b * 6 : b;
  };

  // ---- chapters ---------------------------------------------------------------------------
  F.CHAPTERS = [
    { n: 1, screens: 1, title: 'The Waking Heart',    fighter: 'spearman', cols: 7, rows: 3, biome: 'meadow',   boss: 'Rust Pike Lord',  special: null },
    { n: 2, screens: 1, title: 'The Whistling Wood',  fighter: 'archer',   cols: 7, rows: 3, biome: 'forest',   boss: 'The Whistle Thief', special: null },
    { n: 3, screens: 1, title: 'Brass and Shield',    fighter: 'fighter',  cols: 8, rows: 3, biome: 'hills',    boss: 'Baron Brassback', special: 'lightning' },
    { n: 4, screens: 1.5, title: 'Shadows in the Mist', fighter: 'assassin', cols: 8, rows: 3, biome: 'marsh',    boss: 'Fogblade',        special: null },
    { n: 5, screens: 1.5, title: 'The Iron Gallop',     fighter: 'knight',   cols: 8, rows: 4, biome: 'plains',   boss: 'Captain Clatter', special: 'shuriken' },
    { n: 6, screens: 2, title: 'The Mountain Wall',   fighter: 'tank',     cols: 8, rows: 4, biome: 'mountain', boss: 'The Walking Wall', special: null },
    { n: 7, screens: 2, title: 'Tower of Stars',      fighter: 'mage',     cols: 9, rows: 4, biome: 'night',    boss: 'The Ash Wizard',  special: 'rocket' },
    { n: 8, screens: 2, title: 'The Rust Throne',     fighter: 'catapult', cols: 9, rows: 4, biome: 'fortress', boss: 'The Rust King',   special: null },
  ];

  // Colours per place (the art style filters them). sky top, sky bottom, far hills, near hills, ground, accent.
  F.BIOMES = {
    meadow:   ['#9fd3f0', '#f6efc8', '#a8c8a0', '#7cb872', '#5fa15a', '#f2c94c'],
    forest:   ['#a8d6c4', '#e9f0cf', '#6f9f84', '#4c8466', '#3f7358', '#e8a33d'],
    hills:    ['#b9c9ee', '#f8e6c4', '#b3a6c9', '#8f9a6e', '#7a8a58', '#d9893a'],
    marsh:    ['#a9b9c4', '#dfe6d8', '#8aa095', '#6a8774', '#58765f', '#c9d36a'],
    plains:   ['#8ec6ee', '#fbeec2', '#d1c48a', '#b9b062', '#a39a4e', '#d95f3a'],
    mountain: ['#b4c7e6', '#eef0f5', '#8f9bb8', '#6f7d97', '#76806a', '#c9d3e6'],
    night:    ['#2d2f6e', '#7b6bb0', '#4a4a8c', '#37386f', '#2f3a5c', '#ffe08a'],
    fortress: ['#c97a6a', '#f4d4a6', '#8c5a52', '#6c4440', '#5a4a46', '#ff9a3c'],
  };

  // ---- stories: caption (picture tier), short (one or two sentences), story (a paragraph) ---
  F.STORIES = [
    // chapter 1
    { cap: 'The Heart wakes!', short: 'The Great Heart of Cogsworth ticks. Add a gear next to it and a spearman pops out!',
      story: 'For a hundred years the Great Heart of Cogsworth slept. This morning it gave one tiny tick. Gears began to turn, and out of the very first gear tumbled a brave spearman. The rust-red scouts of the Rust Horde saw the light from far away. Keeper, hold the road!' },
    { cap: 'Two gears, two spears', short: 'Gears side by side each make a spearman. Drop one gear on another to merge them into a stronger gear.',
      story: 'The scouts came back, and this time they brought friends. Old Cogsworth wisdom says two gears side by side make two spearmen, but two gears merged into one make a stronger spearman, a little faster. Choose your way, Keeper.' },
    { cap: 'The Rust Pike Lord!', short: 'A giant rusty pike lord marches down the road. Stop him before he reaches the wall!',
      story: 'The Rust Pike Lord is three times the size of any spearman and as stubborn as old iron. He stamps down the road toward the wall, and his scarf drags in the dust. The Heart ticks faster than ever. Build, merge, and do not let him through!' },
    // chapter 2
    { cap: 'Archers in the Wood', short: 'The Whistling Wood sings to the Heart. Archers join you. They shoot far, so keep them safe.',
      story: 'Beyond the meadow lies the Whistling Wood, where the trees hum along with the Heart. Its archers have been waiting for the first tick. They shoot from far away, but they are fragile. Rust Horde assassins and knights would love to reach them.' },
    { cap: 'Arrows on the wind', short: 'Archers beat spearmen and fighters, but not tanks or knights. Mix your army.',
      story: 'The Horde brings its own bows now. Archers are fierce against spearmen and shields, but a knight at a gallop can sweep over them. A good Keeper always has a counter in the next gear.' },
    { cap: 'The Whistle Thief!', short: 'The Whistle Thief stole the forest song. Take it back from this giant thief!',
      story: 'Someone has stolen the song of the wood. The Whistle Thief, three times as tall as a common archer, hides the Horde march behind a tune that is not his own. Break his bow, return the song, and let the forest sing again.' },
    // chapter 3
    { cap: 'Brass and shields', short: 'Fighters carry big shields. Arrows bounce off them. Lightning gears are in the old tower!',
      story: 'In the Brass Hills the smiths hammered the first shields, and the first fighters marched out from behind them. Arrows bounce from their shields, and swords bite archers and mages. In an old tower you find a new kind of gear that calls down lightning.' },
    { cap: 'Zap! A lightning gear', short: 'A lightning gear does not make a fighter. It zaps enemies from the sky when it turns.',
      story: 'Lightning gears fill with sparks while they turn, then call a bolt to strike the enemies closest to your wall. They can only strike when there is someone to hit, so they wait, crackling, until the Horde appears.' },
    { cap: 'Baron Brassback!', short: 'Baron Brassback wears stolen shields. Show him who owns brass.',
      story: 'Baron Brassback has hung the stolen shields of three villages on his back. He is slow but very hard to hurt. Arrows will not help, but magic and lightning might. Keep your gears turning!' },
    // chapter 4
    { cap: 'Fog on the marsh', short: 'Fog hides the marsh road. Assassins join you. They are fast and dive on archers.',
      story: 'The marsh road is full of fog, so thick that you hear the Horde before you see it. Your new assassins slip through the mist like cats. They love to jump on archers and mages. Armour makes them think twice, though.' },
    { cap: 'Cats in the mist', short: 'Assassins hunt the back line. Heavy fighters and tanks stop them.',
      story: 'The Horde have assassins too, and they are hunting your archers. A shield or two in the front lines can save the soft ones behind. The Heart ticks, and the fog drips.' },
    { cap: 'Fogblade appears!', short: 'Fogblade is a giant shadow with two long daggers. Keep your armour in front.',
      story: 'Out of the fog steps Fogblade, three times the size of an assassin and nearly as quiet. He wants to cut the chain of gears that feeds the Heart. Hold him with armour and strike him down before he reaches your back line.' },
    // chapter 5
    { cap: 'Horses on the plain', short: 'Knights gallop fast and hit hard. Spearmen stop horses. Shuriken gears are rolling!',
      story: 'The plains are wide and flat, a good place for horses. Your knights charge with a mighty first strike, and they run down archers and mages. Spearmen are their only fear. A shuriken gear rolls its spinning blade across the field to clear the path.' },
    { cap: 'Spinning blades!', short: 'A shuriken gear rolls a huge blade along the ground. It hurts everything it touches.',
      story: 'A shuriken gear spins up, then lets go a huge blade that rolls along the ground and slices through anyone in its path. It cannot tell friend from foe, so Cogsworth has taught it to wait for the Horde to show. Use it when the lane is crowded.' },
    { cap: 'Captain Clatter!', short: 'Captain Clatter leads a rusty cavalry. Bring spears!',
      story: 'You hear him before you see him: clang, clatter, clang. Captain Clatter rides a horse three times the size of any, and his armour is held together with string. Spears will stop him. Stack them up and hold!' },
    // chapter 6
    { cap: 'The Mountain Wall', short: 'Tanks arrive. Slow, tough and heavy. Arrows and swords barely scratch them.',
      story: 'High in the mountains lies the pass called the Wall. The tanks come from here, wrapped in heavy plate and slow as glaciers. Arrows barely scratch them and swords only chip the paint. Magic is what armour fears most.' },
    { cap: 'Armour everywhere', short: 'Mages burn through armour. Assassins and knights are poor against tanks.',
      story: 'The Horde has learned to wrap its warriors in armour too. Your knights and assassins find the plates hard to cut. A Keeper who has been paying attention knows what to do with armour: hit it with magic and lightning, or wear it down with many hands.' },
    { cap: 'The Walking Wall!', short: 'A moving wall of armour blocks the pass. Break it down!',
      story: 'The Walking Wall is a boss like no other: a tank three times the size, so heavy the ground shakes. It cannot be rushed or surprised. Be patient, build up your gears, and bring everything you have.' },
    // chapter 7
    { cap: 'The Tower of Stars', short: 'Mages join you, in the Tower of Stars. Their fire burns armour and hits many at once.',
      story: 'The Tower of Stars stands above the clouds. Its mages read the sky, and their fire spreads wide and burns right through armour. They are as fragile as paper, so keep them behind your line. Rockets, fireworks of war, are ready to light.' },
    { cap: 'Fireworks of war', short: 'Rocket gears fire bursting rockets at the front of the Horde.',
      story: 'The tower\'s old rocket gears still work. Each time they turn they fire a bursting rocket at the very front of the Horde. They love a crowd. A Keeper with rockets and mages can melt a wall of enemies from far away.' },
    { cap: 'The Ash Wizard!', short: 'The Ash Wizard wants to put out the stars. Stop the giant wizard!',
      story: 'The Ash Wizard has been blowing out the stars one at a time. He is three times the size of a mage and his fire burns hot. Strike him quickly with knights and assassins, before his big spells reach your gears.' },
    // chapter 8
    { cap: 'The Rust Throne', short: 'Catapults throw huge stones. They fire far, but not at things up close.',
      story: 'The last road leads to the Rust Throne, an old castle eaten by rust. Your catapults throw huge stones that splash across the Horde and smash gates, but they cannot fire at anything close. Keep them guarded.' },
    { cap: 'Stones and thunder', short: 'Catapults wreck groups and the enemy fortress. Guard them well.',
      story: 'Catapults are slow but terrible. One stone can flatten a whole squad, and they are very good against walls. Send your sturdy fighters out in front, and let the stones fly over their heads.' },
    { cap: 'The Rust King!', short: 'The Rust King sits on his throne of old gears. Break through and turn the last gear!',
      story: 'The Rust King was once the Great Heart\'s first keeper, until he tried to stop it ticking. Rust has taken everything but his crown. Three times your size, he marches out of his gate. Break his army, topple his fortress, and turn the very last gear.' },
  ];

  // ---- tiny seeded random numbers ---------------------------------------------------------
  F.rng = function (seed) {
    var a = (seed >>> 0) || 1;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  };

  F.levelIndex = function (ch, lv) { return (ch - 1) * 3 + (lv - 1); };
  F.unlockedFighters = function (ch) {
    var c = F.CHAPTERS[ch - 1], res = [];
    for (var i = 0; i < F.UNIT_ORDER.length; i++) { res.push(F.UNIT_ORDER[i]); if (F.UNIT_ORDER[i] === c.fighter) break; }
    return res;
  };
  F.unlockedSpecials = function (ch) {
    var res = ch >= 2 ? ['boss'] : [];
    for (var i = 0; i < ch; i++) if (F.CHAPTERS[i].special) res.push(F.CHAPTERS[i].special);
    return res;
  };
  F.tierFor = function (idx, setting) {
    if (setting === '0' || setting === '1' || setting === '2') return +setting;
    return idx < 3 ? 0 : idx < 7 ? 1 : 2;
  };

  // ---- pegboard layout for a level --------------------------------------------------------
  function layout(cols, rows, idx, rnd) {
    var hc = Math.min(cols - 3, Math.max(2, 2 + Math.floor(rnd() * (cols - 4))));
    var hr = Math.floor(rnd() * rows);
    if (idx === 0) { hc = 2; hr = 1; }
    var heart = { c: hc, r: hr };
    var holes = [], dormant = [];
    var nHoles = idx < 2 ? 0 : Math.min(9, Math.floor(idx * 0.45) + 1);
    var near = [[1, 0], [0, 1], [-1, 0], [0, -1]].map(function (d) { return (hc + d[0]) + ',' + (hr + d[1]); });
    var blockedNear = idx >= 7 ? 1 : 0;
    var guard = 0;
    while (holes.length < nHoles && guard++ < 300) {
      var c = Math.floor(rnd() * cols), r = Math.floor(rnd() * rows);
      var key = c + ',' + r;
      if (c === hc && r === hr) continue;
      if (holes.some(function (h) { return h[0] === c && h[1] === r; })) continue;
      if (near.indexOf(key) >= 0) { if (blockedNear > 0) { blockedNear--; } else continue; }
      holes.push([c, r]);
    }
    return { heart: heart, holes: holes, dormantSpots: null };
  }

  // ---- a level's full configuration -------------------------------------------------------
  function weightedPick(rnd, types) {
    var tot = 0, i; for (i = 0; i < types.length; i++) tot += types[i].w;
    var x = rnd() * tot;
    for (i = 0; i < types.length; i++) { x -= types[i].w; if (x <= 0) return types[i].t; }
    return types[types.length - 1].t;
  }
  function makeWave(rnd, k, idx, pool, opts) {
    var budget = (opts.base + opts.perLevel * idx) * (1 + opts.perWave * k) * (opts.quick ? 0.6 : 1) * (opts.len || 1);
    var types = pool.map(function (t, i) { return { t: t, w: 1 + i * 0.35 + (t === pool[pool.length - 1] ? 1.2 : 0) }; });
    var list = [], spent = 0, guard = 0;
    while (spent < budget && guard++ < 60) {
      var t = weightedPick(rnd, types);
      list.push({ type: t, boss: false });
      spent += F.UNITS[t].cost;
    }
    // spread spawns out in time, a little jittered
    var at = 0;
    list.forEach(function (s) { s.at = at; at += 0.8 + rnd() * 0.9; });
    return { spawn: list, size: list.length };
  }
  F.waveGap = function (idx) { return Math.max(18, 32 - idx * 0.5); };

  F.levelConfig = function (ch, lv, o) {
    o = o || {};
    var C = F.CHAPTERS[ch - 1], idx = F.levelIndex(ch, lv);
    var seed = 1000 + idx * 77 + (o.seedOffset || 0);
    var rnd = F.rng(seed);
    var lay = layout(C.cols, C.rows, idx, rnd);
    var pool = F.unlockedFighters(ch);
    var eco = F.economy(idx);
    // dormant bonus gears, far from the heart, wake when a chain reaches them
    var dorm = [];
    var nd = idx < 3 ? 0 : Math.min(4, 1 + Math.floor((idx - 3) / 5));
    var tries = 0;
    while (dorm.length < nd && tries++ < 200) {
      var c = Math.floor(rnd() * C.cols), r = Math.floor(rnd() * C.rows);
      if (Math.abs(c - lay.heart.c) + Math.abs(r - lay.heart.r) < 3) continue;
      if (lay.holes.some(function (h) { return h[0] === c && h[1] === r; })) continue;
      if (dorm.some(function (d) { return d.c === c && d.r === r; })) continue;
      dorm.push({ type: pool[Math.floor(rnd() * pool.length)], level: idx > 12 ? 2 : 1, c: c, r: r });
    }
    return {
      id: 'c' + ch + 'l' + lv, ch: ch, lv: lv, idx: idx, seed: seed, free: false, world: Math.round(F.VIEW_W * C.screens), towers: idx >= 9, biome: C.biome, title: C.title,
      board: { cols: C.cols, rows: C.rows, heart: lay.heart, holes: lay.holes, dormant: dorm },
      lives: 20 + 5 * ch, coins: eco.coins, creep: eco.creep, gearTarget: eco.gearTarget, lastWave: eco.lastWave, dynamic: true, len: C.screens <= 1 ? F.TUNE.short : C.screens < 2 ? F.TUNE.mid : 1, waves: [], bossName: lv === 3 ? C.boss : null, bossType: lv === 3 ? C.fighter : null,
      baseHp: F.TUNE.fort + F.TUNE.fortPer * idx, pool: pool, specials: F.unlockedSpecials(ch), quick: !!o.quick,
      story: F.STORIES[idx],
    };
  };

  // Free-for-all: every fighter and gear, a 9 x 4 board, waves that never stop growing.
  F.freeConfig = function (o) {
    o = o || {};
    var idx = 20, rnd = F.rng(o.seed || (Date.now() % 100000));
    var lay = layout(9, 4, 8, rnd);
    var pool = F.UNIT_ORDER.slice();
    var eco = F.economy(idx);
    return {
      id: 'free', ch: 0, lv: 0, idx: idx, seed: 7, free: true, world: F.WORLD, towers: true, biome: 'fortress', title: 'Free-for-all',
      board: { cols: 9, rows: 4, heart: lay.heart, holes: lay.holes, dormant: [] },
      lives: 60, coins: eco.coins, creep: eco.creep, gearTarget: eco.gearTarget, lastWave: eco.lastWave, dynamic: true, len: 1, waves: [],
      bossEvery: 5, bossName: null, baseHp: 99999, pool: pool, specials: ['boss', 'lightning', 'shuriken', 'rocket'],
      quick: !!o.quick,
      story: { cap: 'Free-for-all!', short: 'Every fighter, every gear. The Horde never stops. How long can you hold?',
        story: 'No chapter, no rules, no end. Every fighter and every gear is ready, and so is the Horde. Waves keep coming and keep growing. How many can you hold back?' },
    };
  };

  F.weightedPick = weightedPick;
  F.enemyScale = function (idx) {
    return { hp: 1 + F.TUNE.hp * idx, atk: 1 + F.TUNE.atk * idx, def: 1 + 0.03 * idx };
  };
})();
