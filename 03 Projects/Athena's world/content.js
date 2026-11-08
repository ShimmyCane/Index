// Athena's world: the content for the Learning center, Retail therapy and Get a job.
// Edit the lists here to change the game. The game code is in index.html.

// ---- Learning center: questions. Right answers earn credits. ----
const QUESTIONS = [
  { topic: 'Animals', q: 'Which animal says "moo"?', choices: ['Cow', 'Cat', 'Duck'], a: 'Cow' },
  { topic: 'Animals', q: 'Which animal lives in water and has fins?', choices: ['Fish', 'Horse', 'Bird'], a: 'Fish' },
  { topic: 'Animals', q: 'What do bees make?', choices: ['Honey', 'Milk', 'Bread'], a: 'Honey' },
  { topic: 'Counting', q: 'How many legs does a dog have?', choices: ['4', '2', '6'], a: '4' },
  { topic: 'Counting', q: 'What is 2 + 3?', choices: ['5', '4', '6'], a: '5' },
  { topic: 'Counting', q: 'What is 10 - 4?', choices: ['6', '5', '7'], a: '6' },
  { topic: 'Shapes', q: 'Which shape has 3 sides?', choices: ['Triangle', 'Square', 'Circle'], a: 'Triangle' },
  { topic: 'Shapes', q: 'Which shape is round like a ball?', choices: ['Circle', 'Square', 'Triangle'], a: 'Circle' },
  { topic: 'Space', q: 'What do we see in the sky at night?', choices: ['Stars', 'Sand', 'Grass'], a: 'Stars' },
  { topic: 'Space', q: 'What goes around the Earth?', choices: ['The Moon', 'A car', 'A tree'], a: 'The Moon' },
  { topic: 'Weather', q: 'What falls from clouds when it rains?', choices: ['Water', 'Sand', 'Sticks'], a: 'Water' },
  { topic: 'Weather', q: 'What do we wear when it rains?', choices: ['A raincoat', 'Sunglasses', 'A swimsuit'], a: 'A raincoat' }
];

// ---- Retail therapy: twelve shops. Each sells things by id (see ITEMS in index.html). ----
// Shop names are generic for now (see convo v0.5). Prices are in credits.
const SHOPS = [
  { id: 'korean-grocery', name: 'Korean grocery', icon: '🥢', stock: [['teapot', 4], ['lantern', 6], ['mushroom', 3]] },
  { id: 'warehouse', name: 'Warehouse club', icon: '📦', stock: [['sofa', 14], ['tv', 12], ['window', 9]] },
  { id: 'home-decor', name: 'Home decor shop', icon: '🏠', stock: [['vase', 4], ['picture', 6], ['sun', 6], ['rainbow', 5]] },
  { id: 'craft', name: 'Craft shop', icon: '🧶', stock: [['kite', 4], ['balloon', 3], ['basket', 4]] },
  { id: 'bakery', name: 'Bakery', icon: '🥐', stock: [['candle', 3], ['basket', 4]] },
  { id: 'toy', name: 'Toy shop', icon: '🧸', stock: [['teddy', 5], ['balloon', 3], ['kite', 4]] },
  { id: 'pet', name: 'Pet shop', icon: '🐠', stock: [['fishbowl', 8], ['basket', 4]] },
  { id: 'garden', name: 'Garden centre', icon: '🌱', stock: [['plant', 6], ['cactus', 4], ['tulip', 3]] },
  { id: 'bookshop', name: 'Bookshop', icon: '📚', stock: [['bookshelf', 10], ['lamp', 6]] },
  { id: 'furniture', name: 'Furniture shop', icon: '🪑', stock: [['bed', 16], ['chair', 8], ['clock', 5]] },
  { id: 'bathroom', name: 'Bathroom shop', icon: '🛁', stock: [['bath', 14], ['mirror', 6]] },
  { id: 'music', name: 'Music shop', icon: '🎹', stock: [['piano', 15], ['lamp', 6]] }
];
// A trip home needs every shop visited and this much spent in the trip.
const TRIP = { shopsNeeded: 12, spendNeeded: 20 };

// ---- Get a job: the list (from jobs.md). Full steps are written for some jobs below. ----
const JOBS = [
  {
    "id": "architect",
    "name": "Architect",
    "icon": "📐",
    "desc": "Draws the plans for buildings and houses."
  },
  {
    "id": "flight-attendant",
    "name": "Flight attendant",
    "icon": "✈️",
    "desc": "Looks after people on a plane and keeps everyone safe."
  },
  {
    "id": "pilot",
    "name": "Pilot",
    "icon": "🛫",
    "desc": "Flies the plane and checks the weather before take-off."
  },
  {
    "id": "artist",
    "name": "Artist",
    "icon": "🎨",
    "desc": "Makes pictures and paintings to share how they feel."
  },
  {
    "id": "dancer",
    "name": "Dancer",
    "icon": "💃",
    "desc": "Moves to music and tells stories with the body."
  },
  {
    "id": "singer",
    "name": "Singer",
    "icon": "🎤",
    "desc": "Sings songs for people to hear and sing along to."
  },
  {
    "id": "builder",
    "name": "Builder",
    "icon": "🧱",
    "desc": "Puts up walls, roofs and floors to make buildings."
  },
  {
    "id": "doctor",
    "name": "Doctor",
    "icon": "🩺",
    "desc": "Checks people when they are sick and helps them get better."
  },
  {
    "id": "nurse",
    "name": "Nurse",
    "icon": "🩹",
    "desc": "Looks after patients and helps doctors in the hospital."
  },
  {
    "id": "veterinarian",
    "name": "Veterinarian",
    "icon": "🐾",
    "desc": "Helps sick and hurt animals get better."
  },
  {
    "id": "teacher",
    "name": "Teacher",
    "icon": "🍎",
    "desc": "Helps children learn to read, count and make friends."
  },
  {
    "id": "firefighter",
    "name": "Firefighter",
    "icon": "🚒",
    "desc": "Puts out fires and helps people in emergencies."
  },
  {
    "id": "police-officer",
    "name": "Police officer",
    "icon": "🚓",
    "desc": "Keeps people safe and helps find lost things and people."
  },
  {
    "id": "chef",
    "name": "Chef",
    "icon": "🍳",
    "desc": "Cooks meals in a restaurant and makes new recipes."
  },
  {
    "id": "baker",
    "name": "Baker",
    "icon": "🥐",
    "desc": "Makes bread, cakes and biscuits early in the morning."
  },
  {
    "id": "farmer",
    "name": "Farmer",
    "icon": "🌾",
    "desc": "Grows food and looks after animals on a farm."
  },
  {
    "id": "gardener",
    "name": "Gardener",
    "icon": "🌻",
    "desc": "Plants, waters and trims flowers and trees."
  },
  {
    "id": "zookeeper",
    "name": "Zookeeper",
    "icon": "🦁",
    "desc": "Feeds and looks after the animals at the zoo."
  },
  {
    "id": "scientist",
    "name": "Scientist",
    "icon": "🔬",
    "desc": "Asks questions and tests them to find out how things work."
  },
  {
    "id": "astronaut",
    "name": "Astronaut",
    "icon": "🚀",
    "desc": "Flies to space and does experiments on a space station."
  },
  {
    "id": "bus-driver",
    "name": "Bus driver",
    "icon": "🚌",
    "desc": "Drives people safely around the town."
  },
  {
    "id": "train-driver",
    "name": "Train driver",
    "icon": "🚂",
    "desc": "Drives trains with lots of people on board."
  },
  {
    "id": "sailor",
    "name": "Sailor",
    "icon": "⛵",
    "desc": "Sails boats and keeps the ship working on the sea."
  },
  {
    "id": "lifeguard",
    "name": "Lifeguard",
    "icon": "🏊",
    "desc": "Watches swimmers and keeps them safe at the pool or beach."
  },
  {
    "id": "mail-carrier",
    "name": "Mail carrier",
    "icon": "📮",
    "desc": "Delivers letters and parcels to every house."
  },
  {
    "id": "librarian",
    "name": "Librarian",
    "icon": "📖",
    "desc": "Helps people find books and loves stories."
  },
  {
    "id": "photographer",
    "name": "Photographer",
    "icon": "📷",
    "desc": "Takes pictures of people, places and moments."
  },
  {
    "id": "author",
    "name": "Author",
    "icon": "🖋️",
    "desc": "Writes books and stories for people to read."
  },
  {
    "id": "musician",
    "name": "Musician",
    "icon": "🎸",
    "desc": "Plays instruments and makes music with others."
  },
  {
    "id": "actor",
    "name": "Actor",
    "icon": "🎭",
    "desc": "Pretends to be different people in plays and films."
  },
  {
    "id": "engineer",
    "name": "Engineer",
    "icon": "🔧",
    "desc": "Designs and fixes machines, bridges and gadgets."
  },
  {
    "id": "coder",
    "name": "Coder",
    "icon": "💻",
    "desc": "Writes instructions that make apps and games work."
  },
  {
    "id": "electrician",
    "name": "Electrician",
    "icon": "⚡",
    "desc": "Puts in and fixes the wires that bring power to buildings."
  },
  {
    "id": "hairdresser",
    "name": "Hairdresser",
    "icon": "💇",
    "desc": "Cuts, washes and styles hair."
  },
  {
    "id": "florist",
    "name": "Florist",
    "icon": "💐",
    "desc": "Makes bunches of flowers for people to give."
  },
  {
    "id": "tailor",
    "name": "Tailor",
    "icon": "🧵",
    "desc": "Sews and mends clothes so they fit well."
  },
  {
    "id": "beekeeper",
    "name": "Beekeeper",
    "icon": "🐝",
    "desc": "Looks after bees and collects their honey."
  }
];

// Full steps. A job with no entry here shows its card, and its steps come later.
// learn: short pages. quiz: multiple choice (first-try rules as in the Learning center).
// challenge: a question for a real worker, scaffolded with choices and a sentence starter.
// task: the first-pass practice, with the right answer as `a`.
const JOB_STEPS = {
  architect: {
    learn: [
      { emoji: '📐', text: 'Architects draw plans. A plan is a picture from above that shows where every wall, door and window goes.' },
      { emoji: '📏', text: 'Architects measure first. They check how big a room is and where the sun comes in, before they draw anything.' }
    ],
    quiz: [
      { q: 'What does an architect draw?', choices: ['A plan', 'A song', 'A cake'], a: 'A plan' },
      { q: 'Why do architects measure first?', choices: ['To know how big things are', 'To find fish', 'To make music'], a: 'To know how big things are' },
      { q: 'What does a plan show?', choices: ['Where the walls and windows go', 'What the weather is', 'What to eat'], a: 'Where the walls and windows go' }
    ],
    challenge: {
      scene: 'A family wants a window in the kitchen, but the wall is short.',
      question: 'Ask someone who builds houses: what are some ways to solve this?',
      choices: ['Make the window smaller', 'Move the window up a little', 'Choose a different wall'],
      starter: 'I would ___ because ___.'
    },
    task: {
      prompt: 'First pass: where should the bed go in the plan, so it does not block the door?',
      choices: ['Next to the wall, away from the door', 'In front of the door', 'In the middle of the doorway'],
      a: 'Next to the wall, away from the door'
    }
  },
  pilot: {
    learn: [
      { emoji: '🛫', text: 'Pilots fly planes. Before take-off they check the plane and the weather.' },
      { emoji: '🗼', text: 'Pilots talk to air traffic control. They help planes stay apart and land safely.' }
    ],
    quiz: [
      { q: 'What do pilots check before take-off?', choices: ['The plane and the weather', 'The cake', 'The bus times'], a: 'The plane and the weather' },
      { q: 'Who helps planes stay apart?', choices: ['Air traffic control', 'The baker', 'The librarian'], a: 'Air traffic control' },
      { q: 'Where do pilots sit?', choices: ['In the cockpit', 'In the cabin with the seats', 'On the wing'], a: 'In the cockpit' }
    ],
    challenge: {
      scene: 'The airport is very foggy, and the plane cannot see the runway well.',
      question: 'Ask a pilot: what are some ways the plane could still land safely?',
      choices: ['Use the instruments to see the way down', 'Land without looking at anything', 'Wait for the fog to be a different colour'],
      starter: 'I would ___ because ___.'
    },
    task: {
      prompt: 'First pass: which of these should a pilot check before take-off?',
      choices: ['The fuel', 'Whether the cake is tasty', 'The weather'],
      a: 'The fuel'
    }
  },
  artist: {
    learn: [
      { emoji: '🎨', text: 'Artists make pictures to show feelings and ideas.' },
      { emoji: '🖌️', text: 'Artists mix colours. Mixing yellow and blue makes green.' }
    ],
    quiz: [
      { q: 'What colour do you get from red and yellow?', choices: ['Orange', 'Purple', 'Brown'], a: 'Orange' },
      { q: 'What do artists use to paint?', choices: ['A brush', 'A spoon', 'A ball'], a: 'A brush' },
      { q: 'Why do artists make pictures?', choices: ['To show feelings and ideas', 'To count the stars', 'To fix cars'], a: 'To show feelings and ideas' }
    ],
    challenge: {
      scene: 'You only have blue and yellow paint, and you want to paint a tree.',
      question: 'Ask an artist: what could you make, and how?',
      choices: ['Mix the blue and yellow to make green', 'Paint with only blue', 'Use no paint at all'],
      starter: 'I would ___ because ___.'
    },
    task: {
      prompt: 'First pass: which mix makes green?',
      choices: ['Blue and yellow', 'Red and blue', 'Red and yellow'],
      a: 'Blue and yellow'
    }
  }
};
