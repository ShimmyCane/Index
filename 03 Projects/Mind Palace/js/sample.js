/* Mind Palace: the sample palace. Made-up school facts only; nothing personal.
   Content only. It is loaded the first time, and from "Start again with the sample". */
(function () {
  'use strict';
  var root = typeof window !== 'undefined' ? window : globalThis;
  var MP = root.MP = root.MP || {};

  var worlds = [
    { id: 'w_space', name: 'Space', style: 'moon', pos: [0, 0, 0] },
    { id: 'w_life', name: 'Living Things', style: 'grass', pos: [58, 3, 0] },
    { id: 'w_make', name: 'Making Things', style: 'beach', pos: [29, -2, 52] }
  ];
  var rooms = [
    { id: 'p_planets', w: 'w_space', name: 'Planet Room', style: 'night', pos: [13, 0, 5] },
    { id: 'p_rockets', w: 'w_space', name: 'Rocket Workshop', style: 'peach', pos: [-12, 0, 7] },
    { id: 'p_ocean', w: 'w_life', name: 'Ocean Room', style: 'sky', pos: [58, 3, -14] },
    { id: 'p_forest', w: 'w_life', name: 'Forest Den', style: 'meadow', pos: [70, 3, 8] },
    { id: 'p_studio', w: 'w_make', name: 'Drawing Studio', style: 'lilac', pos: [17, -2, 58] },
    { id: 'p_music', w: 'w_make', name: 'Music Loft', style: 'sand', pos: [41, 1, 60] }
  ];
  // id, room, object kind (or emoji), colour, title, description, tags, question, answer, logical parent
  var nodes = [
    ['n_mars', 'p_planets', 'planet', '#f2a48c', 'Mars is the red planet', 'Mars looks red because its dust is full of rust.', 'planet, mars, red', 'Which planet is red, and why?', 'Mars. Its dust is rusty.', 'w_space'],
    ['n_saturn', 'p_planets', 'planet', '#f3d9a0', 'Saturn has rings', 'The rings are made of ice and rock, from dust size to house size.', 'planet, saturn, rings', 'What are Saturn\'s rings made of?', 'Ice and rock.', 'w_space'],
    ['n_sun', 'p_planets', 'sun', '', 'The Sun is a star', 'It is the closest star. Its light takes about 8 minutes to reach us.', 'sun, star, light', 'How long does sunlight take to reach Earth?', 'About 8 minutes.', 'w_space'],
    ['n_earth', 'p_planets', 'globe', '', 'Earth spins once a day', 'One spin is a day. One trip around the Sun is a year.', 'earth, day, year, spin', 'What makes a day? What makes a year?', 'One spin is a day. One trip around the Sun is a year.', 'w_space'],
    ['n_rocket', 'p_rockets', 'rocket', '#ff9f8a', 'Rockets push down to go up', 'Hot gas shoots down, so the rocket is pushed up. Every push has a push back.', 'rocket, force, push', 'Why does a rocket go up?', 'Gas pushes down, so the rocket is pushed up.', 'w_space'],
    ['n_gears', 'p_rockets', 'gear', '#9fc5e8', 'Gears trade speed for strength', 'A small gear turning a big gear makes it slower and stronger.', 'gear, machine, force', 'A small gear turns a big gear. What changes?', 'The big gear turns slower, with more strength.', 'w_make'],
    ['n_robot', 'p_rockets', 'robot', '#bfe8d2', 'Robots explore first', 'Rovers drive on Mars and send pictures home before any person goes.', 'robot, rover, mars', 'Who explores Mars today?', 'Robot rovers.', 'w_space'],
    ['n_fish', 'p_ocean', 'fish', '#ffb37a', 'Fish breathe with gills', 'Gills take the oxygen out of water.', 'fish, gills, water, breathe', 'How does a fish breathe?', 'With gills, which take oxygen out of the water.', 'w_life'],
    ['n_whale', 'p_ocean', '🐋', '', 'Whales breathe air', 'A whale is a mammal. It comes up to breathe through its blowhole.', 'whale, mammal, air, breathe', 'Is a whale a fish?', 'No. It is a mammal and breathes air.', 'w_life'],
    ['n_boat', 'p_ocean', 'boat', '#c4e3f7', 'Boats float by pushing water away', 'A boat floats when the water it pushes away weighs as much as the boat.', 'boat, float, water', 'Why does a heavy boat float?', 'It pushes away water that weighs as much as it does.', 'w_make'],
    ['n_tree', 'p_forest', 'tree', '', 'Trees drink through roots', 'Roots pull water up. Leaves use sunlight to make food.', 'tree, roots, leaves, sunlight', 'What do the roots and the leaves do?', 'Roots drink water. Leaves make food from sunlight.', 'w_life'],
    ['n_bees', 'p_forest', 'flower', '#f7b6d2', 'Bees help flowers make seeds', 'Bees carry pollen from flower to flower.', 'bee, flower, pollen, seed', 'What do bees carry between flowers?', 'Pollen.', 'w_life'],
    ['n_apple', 'p_forest', 'apple', '', 'A seed can become a tree', 'An apple holds seeds. Each one can grow into a new apple tree.', 'apple, seed, grow', 'What is inside an apple that can grow?', 'Seeds.', 'w_life'],
    ['n_cat', 'p_forest', 'cat', '#f3d9a0', 'Cats see in dim light', 'Their eyes open wide and bounce light back, so a little light goes a long way.', 'cat, eyes, night', 'Why do cats see well at night?', 'Their eyes open wide and reflect light.', 'w_life'],
    ['n_plan', 'p_studio', 'desk', '', 'Plan before you build', 'Draw it first. A mistake on paper is cheap to fix.', 'plan, draw, design', 'Why draw before building?', 'Mistakes on paper are cheap to fix.', 'w_make'],
    ['n_triangle', 'p_studio', 'house', '#ffd9a0', 'Triangles make things strong', 'A triangle cannot be pushed out of shape, so roofs and bridges use them.', 'triangle, shape, strong, bridge', 'Which shape keeps a bridge stiff?', 'The triangle.', 'w_make'],
    ['n_idea', 'p_studio', 'lamp', '', 'Test an idea early', 'Build a small one, try it, and change it.', 'idea, test, try', 'What do you do with a new idea?', 'Build a small one and try it.', 'w_make'],
    ['n_beat', 'p_music', 'drum', '#ff9f8a', 'A beat is a steady pulse', 'Clap evenly, like a clock ticking. That is the beat.', 'beat, rhythm, music', 'What is a beat?', 'A steady pulse, like a ticking clock.', 'w_make'],
    ['n_pitch', 'p_music', 'note', '#b9a6e8', 'High notes shake fast', 'A short string shakes faster and sounds higher.', 'note, pitch, sound, string', 'Which sounds higher: a short or a long string?', 'The short one. It shakes faster.', 'w_make']
  ];
  var links = [
    ['n_rocket', 'n_mars', 'leads_to', 0.8], ['n_robot', 'n_mars', 'related_to', 0.9], ['n_gears', 'n_plan', 'related_to', 0.6],
    ['n_bees', 'n_apple', 'leads_to', 0.8], ['n_apple', 'n_tree', 'part_of', 0.7], ['n_sun', 'n_tree', 'leads_to', 0.7],
    ['n_fish', 'n_whale', 'opposite_of', 0.8], ['n_beat', 'n_earth', 'reminds_me_of', 0.4], ['n_triangle', 'n_boat', 'related_to', 0.4],
    ['n_idea', 'n_rocket', 'related_to', 0.5]
  ];

  MP.sample = function () {
    var d = { project: 'Mind Palace', schema: 1, worlds: [], places: [], nodes: [], relationships: [], assets: [], routes: [], recall: [], proposals: [] };
    worlds.forEach(function (w) { d.worlds.push({ id: w.id, name: w.name, style: w.style, transform: { position: w.pos.slice() } }); });
    rooms.forEach(function (r) {
      d.places.push({ id: r.id, name: r.name, type: 'room', parent_id: r.w, style: r.style,
        transform: { position: r.pos.slice(), rotation: [0, 0, 0], scale: [1, 1, 1] } });
    });
    nodes.forEach(function (n) {
      var emoji = n[2].length <= 4 && !/^[a-z]+$/.test(n[2]);
      d.assets.push({ id: 'a_' + n[0], type: 'object', representation: emoji ? 'emoji' : 'procedural', kind: emoji ? 'star' : n[2], glyph: emoji ? n[2] : '', color: n[3] });
      d.nodes.push({ id: n[0], type: 'concept', title: n[4], description: n[5], tags: n[6].split(/,\s*/), question: n[7], answer: n[8],
        parent_id: n[9], place_id: n[1], asset_id: 'a_' + n[0] });
    });
    links.forEach(function (l, i) { d.relationships.push({ id: 'r_' + i, source: l[0], target: l[1], type: l[2], strength: l[3] }); });
    return d;
  };
})();
