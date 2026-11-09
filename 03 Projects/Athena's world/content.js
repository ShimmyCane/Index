// Athena's world: the content for the Learning center, Retail therapy and Get a job.
// Edit the lists here to change the game. The game code is in index.html.

// ---- Learning center: the dessert round. Source: bank/desserts_round1.json (keep the two in step).
// Core questions are 1 point, bonus 2 points, challenge 5 points. Each question has a Test Bank style shape.
const QUESTIONS = [
  {
    "id": "DSRT-001",
    "question_type": "multiple_choice",
    "category": "Baking desserts",
    "subcategory": "Cakes and rising",
    "topic": "Leavening",
    "difficulty": 1,
    "source_authority": "Baking basics (general cooking knowledge)",
    "question_text": "Which ingredient makes a cake rise by giving off gas in the oven?",
    "choices": [
      "Baking powder",
      "Salt",
      "Sugar",
      "Vanilla"
    ],
    "correct_answer": "Baking powder",
    "accepted_answers": [],
    "explanation": "Baking powder releases gas when it is wet and heated, so the batter puffs up.",
    "traps": [
      "Salt and sugar do not make a cake rise."
    ],
    "points": 1,
    "section": "core"
  },
  {
    "id": "DSRT-002",
    "question_type": "true_false",
    "category": "Baking desserts",
    "subcategory": "Cakes and sweetness",
    "topic": "Sugar's jobs",
    "difficulty": 1,
    "source_authority": "Baking basics (general cooking knowledge)",
    "question_text": "Sugar in a cake only adds sweetness and does nothing else.",
    "choices": [
      "True",
      "False"
    ],
    "correct_answer": "False",
    "accepted_answers": [],
    "explanation": "Sugar also helps the cake brown, keeps it moist and makes it tender.",
    "traps": [
      "Sugar does more than sweeten."
    ],
    "points": 1,
    "section": "core"
  },
  {
    "id": "DSRT-003",
    "question_type": "multiple_choice",
    "category": "Baking desserts",
    "subcategory": "Meringue",
    "topic": "Main ingredient",
    "difficulty": 1,
    "source_authority": "Baking basics (general cooking knowledge)",
    "question_text": "What is the main ingredient in a meringue?",
    "choices": [
      "Egg whites",
      "Butter",
      "Flour",
      "Milk"
    ],
    "correct_answer": "Egg whites",
    "accepted_answers": [],
    "explanation": "Whisked egg whites hold air bubbles, which makes a meringue light and crisp.",
    "traps": [
      "Butter and flour are not used in a plain meringue."
    ],
    "points": 1,
    "section": "core"
  },
  {
    "id": "DSRT-004",
    "question_type": "true_false",
    "category": "Baking desserts",
    "subcategory": "Cookies",
    "topic": "Chilling dough",
    "difficulty": 1,
    "source_authority": "Baking basics (general cooking knowledge)",
    "question_text": "Chilling cookie dough before baking can help the cookies keep their shape.",
    "choices": [
      "True",
      "False"
    ],
    "correct_answer": "True",
    "accepted_answers": [],
    "explanation": "Cold butter melts more slowly, so the cookies spread less.",
    "traps": [
      "Chilling does not make the dough rise."
    ],
    "points": 1,
    "section": "core"
  },
  {
    "id": "DSRT-005",
    "question_type": "multiple_choice",
    "category": "Baking desserts",
    "subcategory": "Cakes and air",
    "topic": "Creaming",
    "difficulty": 1,
    "source_authority": "Baking basics (general cooking knowledge)",
    "question_text": "What does beating butter and sugar together until fluffy do?",
    "choices": [
      "Traps air in the mixture",
      "Cooks the butter",
      "Removes the sweetness",
      "Makes the sugar melt"
    ],
    "correct_answer": "Traps air in the mixture",
    "accepted_answers": [],
    "explanation": "Creaming traps tiny air bubbles, which help the cake rise and feel light.",
    "traps": [
      "The sugar does not melt at this stage."
    ],
    "points": 1,
    "section": "core"
  },
  {
    "id": "DSRT-006",
    "question_type": "true_false",
    "category": "Baking desserts",
    "subcategory": "Flavourings",
    "topic": "Vanilla",
    "difficulty": 1,
    "source_authority": "Baking basics (general cooking knowledge)",
    "question_text": "Vanilla flavouring comes from the pods of a type of orchid.",
    "choices": [
      "True",
      "False"
    ],
    "correct_answer": "True",
    "accepted_answers": [],
    "explanation": "Vanilla beans are the cured pods of an orchid, Vanilla planifolia.",
    "traps": [
      "Vanilla is not made from a bean of coffee."
    ],
    "points": 1,
    "section": "core"
  },
  {
    "id": "DSRT-007",
    "question_type": "multiple_choice",
    "category": "Baking desserts",
    "subcategory": "Ice cream",
    "topic": "Churning",
    "difficulty": 1,
    "source_authority": "Baking basics (general cooking knowledge)",
    "question_text": "Ice cream is made by freezing a sweet cream mixture while doing what?",
    "choices": [
      "Stirring it",
      "Shaking it still",
      "Heating it to boiling",
      "Leaving it alone"
    ],
    "correct_answer": "Stirring it",
    "accepted_answers": [],
    "explanation": "Stirring, or churning, breaks up ice crystals and keeps the ice cream smooth.",
    "traps": [
      "Leaving ice cream still makes it icy."
    ],
    "points": 1,
    "section": "core"
  },
  {
    "id": "DSRT-008",
    "question_type": "true_false",
    "category": "Baking desserts",
    "subcategory": "Baking soda",
    "topic": "Acid needed",
    "difficulty": 1,
    "source_authority": "Baking basics (general cooking knowledge)",
    "question_text": "Baking soda needs an acid, such as buttermilk or lemon juice, to make bubbles.",
    "choices": [
      "True",
      "False"
    ],
    "correct_answer": "True",
    "accepted_answers": [],
    "explanation": "Baking soda is a base. It makes gas only when an acid is present.",
    "traps": [
      "Baking soda on its own does not make a cake rise well."
    ],
    "points": 1,
    "section": "core"
  },
  {
    "id": "DSRT-009",
    "question_type": "multiple_choice",
    "category": "Baking desserts",
    "subcategory": "Custards",
    "topic": "Main ingredients",
    "difficulty": 1,
    "source_authority": "Baking basics (general cooking knowledge)",
    "question_text": "What is a custard mainly made of?",
    "choices": [
      "Eggs, milk or cream, and sugar",
      "Flour, butter and water",
      "Oil, sugar and cocoa",
      "Rice, milk and salt"
    ],
    "correct_answer": "Eggs, milk or cream, and sugar",
    "accepted_answers": [],
    "explanation": "Eggs thicken the milk or cream as they gently cook.",
    "traps": [
      "Flour is not the base of a classic custard."
    ],
    "points": 1,
    "section": "core"
  },
  {
    "id": "DSRT-010",
    "question_type": "multiple_choice",
    "category": "Baking desserts",
    "subcategory": "Sugar types",
    "topic": "Granulated sugar",
    "difficulty": 1,
    "source_authority": "Baking basics (general cooking knowledge)",
    "question_text": "Which sugar is the plain white sugar most often used in baking?",
    "choices": [
      "Granulated sugar",
      "Brown sugar",
      "Icing sugar",
      "Maple sugar"
    ],
    "correct_answer": "Granulated sugar",
    "accepted_answers": [],
    "explanation": "Granulated sugar is the everyday white sugar in most recipes.",
    "traps": [
      "Brown sugar has molasses in it."
    ],
    "points": 1,
    "section": "core"
  },
  {
    "id": "DSRT-011",
    "question_type": "true_false",
    "category": "Baking desserts",
    "subcategory": "Sugar types",
    "topic": "Brown sugar",
    "difficulty": 1,
    "source_authority": "Baking basics (general cooking knowledge)",
    "question_text": "Brown sugar contains molasses.",
    "choices": [
      "True",
      "False"
    ],
    "correct_answer": "True",
    "accepted_answers": [],
    "explanation": "Molasses is what gives brown sugar its colour and a soft, rich taste.",
    "traps": [
      "Brown sugar is not just white sugar with colour added."
    ],
    "points": 1,
    "section": "core"
  },
  {
    "id": "DSRT-012",
    "question_type": "multiple_choice",
    "category": "Baking desserts",
    "subcategory": "Mixing",
    "topic": "Folding",
    "difficulty": 1,
    "source_authority": "Baking basics (general cooking knowledge)",
    "question_text": "What does folding mean in baking?",
    "choices": [
      "Gently mixing with a spatula to keep the air in",
      "Beating very hard with a whisk",
      "Heating the mixture until it boils",
      "Pressing the dough flat"
    ],
    "correct_answer": "Gently mixing with a spatula to keep the air in",
    "accepted_answers": [],
    "explanation": "Folding moves ingredients together slowly, so the air stays in a light batter.",
    "traps": [
      "Beating hard knocks the air out."
    ],
    "points": 1,
    "section": "core"
  },
  {
    "id": "DSRT-013",
    "question_type": "multiple_choice",
    "category": "Baking desserts",
    "subcategory": "Tarts",
    "topic": "Tarte Tatin",
    "difficulty": 1,
    "source_authority": "Baking basics (general cooking knowledge)",
    "question_text": "Which fruit is used in the classic French upside-down tart, the tarte Tatin?",
    "choices": [
      "Apples",
      "Bananas",
      "Cherries",
      "Lemons"
    ],
    "correct_answer": "Apples",
    "accepted_answers": [],
    "explanation": "Apples are cooked in butter and sugar, then the pastry is placed on top and the tart is turned out.",
    "traps": [
      "Lemons are used in lemon curd, not in tarte Tatin."
    ],
    "points": 1,
    "section": "core"
  },
  {
    "id": "DSRT-014",
    "question_type": "true_false",
    "category": "Baking desserts",
    "subcategory": "Meringues",
    "topic": "Pavlova",
    "difficulty": 1,
    "source_authority": "Baking basics (general cooking knowledge)",
    "question_text": "A pavlova is a dessert built around a meringue base.",
    "choices": [
      "True",
      "False"
    ],
    "correct_answer": "True",
    "accepted_answers": [],
    "explanation": "A pavlova is a crisp meringue shell, often topped with cream and fruit.",
    "traps": [
      "A pavlova is not a sponge cake."
    ],
    "points": 1,
    "section": "core"
  },
  {
    "id": "DSRT-015",
    "question_type": "multiple_choice",
    "category": "Baking desserts",
    "subcategory": "Crumbles",
    "topic": "Topping",
    "difficulty": 1,
    "source_authority": "Baking basics (general cooking knowledge)",
    "question_text": "What is a crumble topping usually made from?",
    "choices": [
      "Flour, butter and sugar",
      "Eggs, milk and cocoa",
      "Cream and gelatine",
      "Rice and honey"
    ],
    "correct_answer": "Flour, butter and sugar",
    "accepted_answers": [],
    "explanation": "Rubbing cold butter into flour and sugar makes the crumbly topping.",
    "traps": [
      "Crumble is not made with eggs."
    ],
    "points": 1,
    "section": "core"
  },
  {
    "id": "DSRT-016",
    "question_type": "true_false",
    "category": "Baking desserts",
    "subcategory": "Muffins",
    "topic": "Overmixing",
    "difficulty": 1,
    "source_authority": "Baking basics (general cooking knowledge)",
    "question_text": "Mixing a muffin batter too much can make the muffins tough.",
    "choices": [
      "True",
      "False"
    ],
    "correct_answer": "True",
    "accepted_answers": [],
    "explanation": "Too much mixing builds up gluten, which makes baked goods chewy and tough.",
    "traps": [
      "Muffins should be mixed only until just combined."
    ],
    "points": 1,
    "section": "core"
  },
  {
    "id": "DSRT-017",
    "question_type": "multiple_choice",
    "category": "Baking desserts",
    "subcategory": "Chocolate",
    "topic": "Ganache",
    "difficulty": 1,
    "source_authority": "Baking basics (general cooking knowledge)",
    "question_text": "What is a ganache made from?",
    "choices": [
      "Melted chocolate and cream",
      "Sugar and water",
      "Eggs and flour",
      "Butter and milk only"
    ],
    "correct_answer": "Melted chocolate and cream",
    "accepted_answers": [],
    "explanation": "Stirring hot cream into chocolate makes a smooth, glossy ganache.",
    "traps": [
      "Ganache is not made with flour."
    ],
    "points": 1,
    "section": "core"
  },
  {
    "id": "DSRT-018",
    "question_type": "multiple_choice",
    "category": "Baking desserts",
    "subcategory": "Baking basics",
    "topic": "Preheating",
    "difficulty": 1,
    "source_authority": "Baking basics (general cooking knowledge)",
    "question_text": "Why do recipes often say to preheat the oven?",
    "choices": [
      "So the oven is at the right heat when the food goes in",
      "So the oven can cool down first",
      "So the light turns on",
      "So the tray gets wet"
    ],
    "correct_answer": "So the oven is at the right heat when the food goes in",
    "accepted_answers": [],
    "explanation": "A hot oven starts the rising and setting straight away, which gives a better bake.",
    "traps": [
      "Preheating is not for cooling the oven."
    ],
    "points": 1,
    "section": "core"
  },
  {
    "id": "DSRT-019",
    "question_type": "true_false",
    "category": "Baking desserts",
    "subcategory": "Lemon curd",
    "topic": "Ingredients",
    "difficulty": 1,
    "source_authority": "Baking basics (general cooking knowledge)",
    "question_text": "Lemon curd is made from eggs, sugar, butter and lemon juice.",
    "choices": [
      "True",
      "False"
    ],
    "correct_answer": "True",
    "accepted_answers": [],
    "explanation": "Lemon curd is cooked gently until thick, using eggs, sugar, butter and lemon.",
    "traps": [
      "Lemon curd does not need flour."
    ],
    "points": 1,
    "section": "core"
  },
  {
    "id": "DSRT-020",
    "question_type": "multiple_choice",
    "category": "Baking desserts",
    "subcategory": "Layered desserts",
    "topic": "Tiramisu",
    "difficulty": 1,
    "source_authority": "Baking basics (general cooking knowledge)",
    "question_text": "Which Italian dessert is made with layers of ladyfinger biscuits and mascarpone cream?",
    "choices": [
      "Tiramisu",
      "Pavlova",
      "Crème brûlée",
      "Sorbet"
    ],
    "correct_answer": "Tiramisu",
    "accepted_answers": [],
    "explanation": "Tiramisu is soaked in coffee and layered with a creamy mascarpone mixture.",
    "traps": [
      "A pavlova is made with meringue, not ladyfingers."
    ],
    "points": 1,
    "section": "core"
  },
  {
    "id": "DSRT-021",
    "question_type": "true_false",
    "category": "Baking desserts",
    "subcategory": "Cheesecake",
    "topic": "Chilling",
    "difficulty": 1,
    "source_authority": "Baking basics (general cooking knowledge)",
    "question_text": "A cheesecake is never chilled after it is baked.",
    "choices": [
      "True",
      "False"
    ],
    "correct_answer": "False",
    "accepted_answers": [],
    "explanation": "Many cheesecakes are baked, then cooled and chilled so they set firmly.",
    "traps": [
      "Cheesecake is often chilled to set it."
    ],
    "points": 1,
    "section": "core"
  },
  {
    "id": "DSRT-022",
    "question_type": "multiple_choice",
    "category": "Baking desserts",
    "subcategory": "Cakes",
    "topic": "Resting",
    "difficulty": 1,
    "source_authority": "Baking basics (general cooking knowledge)",
    "question_text": "Why is a cake often left to rest before it is sliced?",
    "choices": [
      "It firms up so it does not crumble",
      "It makes the cake sweeter",
      "It stops the cake rising",
      "It cools the oven"
    ],
    "correct_answer": "It firms up so it does not crumble",
    "accepted_answers": [],
    "explanation": "As it cools, the cake sets, so it holds together when cut.",
    "traps": [
      "Resting does not add sweetness."
    ],
    "points": 1,
    "section": "core"
  },
  {
    "id": "DSRT-023",
    "question_type": "multiple_choice",
    "category": "Baking desserts",
    "subcategory": "Sorbet",
    "topic": "Ingredients",
    "difficulty": 1,
    "source_authority": "Baking basics (general cooking knowledge)",
    "question_text": "What is sorbet mainly made of?",
    "choices": [
      "Fruit, sugar and water",
      "Milk, cream and eggs",
      "Butter and flour",
      "Chocolate and nuts"
    ],
    "correct_answer": "Fruit, sugar and water",
    "accepted_answers": [],
    "explanation": "Sorbet is a fruit ice with no milk or cream.",
    "traps": [
      "Sorbet does not contain milk."
    ],
    "points": 1,
    "section": "core"
  },
  {
    "id": "DSRT-024",
    "question_type": "true_false",
    "category": "Baking desserts",
    "subcategory": "Brownies",
    "topic": "Chocolate base",
    "difficulty": 1,
    "source_authority": "Baking basics (general cooking knowledge)",
    "question_text": "Brownies are usually made with cocoa or chocolate.",
    "choices": [
      "True",
      "False"
    ],
    "correct_answer": "True",
    "accepted_answers": [],
    "explanation": "Cocoa or melted chocolate gives brownies their rich flavour.",
    "traps": [
      "Brownies are not usually made with vanilla alone."
    ],
    "points": 1,
    "section": "core"
  },
  {
    "id": "DSRT-025",
    "question_type": "multiple_choice",
    "category": "Baking desserts",
    "subcategory": "Custards",
    "topic": "Water bath",
    "difficulty": 1,
    "source_authority": "Baking basics (general cooking knowledge)",
    "question_text": "Why are baked custards often cooked in a water bath?",
    "choices": [
      "It cooks them gently so they do not curdle",
      "It makes them cold",
      "It adds flavour",
      "It makes them rise"
    ],
    "correct_answer": "It cooks them gently so they do not curdle",
    "accepted_answers": [],
    "explanation": "The water keeps the heat gentle and even, so the eggs set smoothly.",
    "traps": [
      "A water bath does not make custard rise."
    ],
    "points": 1,
    "section": "core"
  },
  {
    "id": "DSRT-B01",
    "question_type": "multiple_choice",
    "category": "Baking desserts",
    "subcategory": "Leavening",
    "topic": "Timing",
    "difficulty": 2,
    "source_authority": "Baking basics (general cooking knowledge)",
    "question_text": "Why should a cake batter go into the oven soon after the baking powder is stirred in?",
    "choices": [
      "Baking powder starts making bubbles as soon as it is wet",
      "Baking powder stops working in the oven",
      "Baking powder needs to be cooked first",
      "The batter goes flat if it is stirred"
    ],
    "correct_answer": "Baking powder starts making bubbles as soon as it is wet",
    "accepted_answers": [],
    "explanation": "Once wet, baking powder begins releasing gas, so waiting too long wastes some of its lift.",
    "traps": [
      "It is not that the cake needs to sit first."
    ],
    "points": 2,
    "section": "bonus"
  },
  {
    "id": "DSRT-B02",
    "question_type": "multiple_choice",
    "category": "Baking desserts",
    "subcategory": "Soufflé",
    "topic": "Why it falls",
    "difficulty": 2,
    "source_authority": "Baking basics (general cooking knowledge)",
    "question_text": "A soufflé falls if the oven door is opened too early. Why?",
    "choices": [
      "Cold air rushes in and the rising air bubbles collapse",
      "The sugar turns to water",
      "The eggs are cooked too much",
      "The soufflé gets too heavy to stand"
    ],
    "correct_answer": "Cold air rushes in and the rising air bubbles collapse",
    "accepted_answers": [],
    "explanation": "Sudden cold air shrinks the hot air and steam inside, so the soufflé loses its rise.",
    "traps": [
      "Eggs are not the reason it falls when the door is opened early."
    ],
    "points": 2,
    "section": "bonus"
  },
  {
    "id": "DSRT-B03",
    "question_type": "true_false",
    "category": "Baking desserts",
    "subcategory": "Caramel",
    "topic": "Browning",
    "difficulty": 2,
    "source_authority": "Baking basics (general cooking knowledge)",
    "question_text": "Caramel turns brown because sugar breaks down and changes colour as it is heated.",
    "choices": [
      "True",
      "False"
    ],
    "correct_answer": "True",
    "accepted_answers": [],
    "explanation": "As sugar heats past its melting point, it changes chemically and turns golden then brown.",
    "traps": [
      "Caramel does not turn brown from milk alone."
    ],
    "points": 2,
    "section": "bonus"
  },
  {
    "id": "DSRT-C01",
    "question_type": "multiple_choice",
    "category": "Baking desserts",
    "subcategory": "Problem solving",
    "topic": "Flat cake",
    "difficulty": 3,
    "source_authority": "Baking basics (general cooking knowledge)",
    "question_text": "Sam's cake came out flat and sank in the middle. The baking powder was fresh, the flour was measured, and the oven was working. Which change would most likely fix it?",
    "choices": [
      "Bake it a little longer and keep the oven door closed until it is nearly set",
      "Open the oven door every minute to check it",
      "Add more baking soda without any acid",
      "Beat the batter for much longer"
    ],
    "correct_answer": "Bake it a little longer and keep the oven door closed until it is nearly set",
    "accepted_answers": [],
    "explanation": "A cake that sinks in the middle is often underbaked or was disturbed while rising, so a longer, undisturbed bake helps it set.",
    "traps": [
      "Opening the door early can make a cake sink, and so can beating it too long."
    ],
    "points": 5,
    "section": "challenge"
  },
  {
    "id": "DSRT-C02",
    "question_type": "multiple_choice",
    "category": "Baking desserts",
    "subcategory": "Ice cream",
    "topic": "Smooth texture",
    "difficulty": 3,
    "source_authority": "Baking basics (general cooking knowledge)",
    "question_text": "Which two steps together make homemade ice cream smoother and less icy?",
    "choices": [
      "Churn while it freezes, and add a little sugar or alcohol to keep ice crystals small",
      "Freeze it still and never stir it",
      "Add extra water and freeze it solid",
      "Heat it to boiling before freezing"
    ],
    "correct_answer": "Churn while it freezes, and add a little sugar or alcohol to keep ice crystals small",
    "accepted_answers": [],
    "explanation": "Churning breaks up ice crystals, and sugar or alcohol lowers the freezing point, so fewer large icy crystals form.",
    "traps": [
      "Standing still freezing makes icier ice cream."
    ],
    "points": 5,
    "section": "challenge"
  }
];

// ---- Retail therapy: the shops. Each sells things by id (see ITEMS in models.js). ----
// Shops Athena knows from home (convo v0.8). Prices are in credits.
// Prices are set by time (convo v1.0): about 10 credits is 5 minutes of questions.
//   small things  3–5   (two of them for 5 minutes, like a chair or the pony)
//   furniture     8–12  (about 5 minutes)
//   special beds  14–18 (10–15 minutes)
//   things that move, like the windmill: 60 (save up for it)
const SHOPS = [
  { id: 'korean-grocery', name: 'H Mart', icon: '🥢', stock: [['teapot', 4], ['lantern', 5], ['mushroom', 4], ['mushroomblue', 6]] },
  { id: 'warehouse', name: 'Costco', icon: '📦', stock: [['sofa', 10], ['tv', 10], ['window', 6]] },
  { id: 'home-decor', name: 'Target', icon: '🎯', stock: [['vase', 3], ['picture', 4], ['sun', 4], ['rainbow', 4]] },
  { id: 'craft', name: 'Craft shop', icon: '🧶', stock: [['kite', 3], ['balloon', 3], ['basket', 4]] },
  { id: 'bakery', name: 'Bakery', icon: '🥐', stock: [['candle', 3], ['basket', 4]] },
  { id: 'toy', name: 'Toy shop', icon: '🧸', stock: [['pony', 5], ['teddy', 5], ['balloon', 3], ['kite', 3], ['mushroomstool', 5]] },
  { id: 'pet', name: 'Pet shop', icon: '🐠', stock: [['fishbowl', 6], ['basket', 4]] },
  { id: 'garden', name: 'Garden centre', icon: '🌱', stock: [['windmill', 60], ['plant', 4], ['cactus', 3], ['tulip', 3], ['mushroomtall', 4], ['mushroomtrio', 6], ['haybale', 3]] },
  { id: 'bookshop', name: 'Bookshop', icon: '📚', stock: [['bookshelf', 9], ['lamp', 5]] },
  { id: 'furniture', name: 'Furniture shop', icon: '🪑', stock: [['bed', 12], ['bunkbed', 16], ['canopybed', 18], ['carbed', 18], ['haybed', 8], ['chair', 5], ['clock', 4]] },
  { id: 'bathroom', name: 'Bathroom shop', icon: '🛁', stock: [['bath', 10], ['mirror', 4]] },
  { id: 'music', name: 'Music shop', icon: '🎹', stock: [['piano', 14], ['lamp', 5]] },
  { id: 'home-depot', name: 'Home Depot', icon: '🔨', stock: [['frontdoor', 6], ['shutters', 5], ['flowerbox', 4], ['porchlamp', 4], ['awning', 5], ['sidingmint', 10], ['sidingpink', 10], ['sidingbrick', 12], ['sidingwood', 12]] }
];
// A trip home needs every shop visited and this much spent in the trip.
const TRIP = { shopsNeeded: SHOPS.length, spendNeeded: 20 };

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

// Who you meet for each job: a picture (person), a name (who) and a short hello (intro, 2-3 lines).
// About four in five of the people are women, with some men too (convo v0.8).
const JOB_PEOPLE = {
  "architect": { person: "👩‍💼", who: "Maya", intro: ["Hi, I'm Maya. I draw the plans for houses, schools and libraries.", "I measure every room and think about where the sun comes in.", "Then builders use my drawings to make it real!"] },
  "flight-attendant": { person: "💁‍♀️", who: "Grace", intro: ["Hi, I'm Grace. I look after everyone on the plane.", "I show how to stay safe and bring snacks and drinks.", "If someone feels worried, I help them feel calm."] },
  "pilot": { person: "👩‍✈️", who: "Captain Rosa", intro: ["Hi, I'm Captain Rosa. I fly big planes all over the world.", "Before take-off I check the weather and the plane, step by step.", "Up in the sky, I can see the tops of the clouds!"] },
  "artist": { person: "👩‍🎨", who: "Lily", intro: ["Hi, I'm Lily. I paint pictures with lots of colour.", "I look closely at things, then show how they make me feel.", "Some of my paintings hang in a gallery for everyone to see."] },
  "dancer": { person: "💃", who: "Sofia", intro: ["Hi, I'm Sofia. I tell stories by moving to music.", "I practise every day to make my body strong and bendy.", "On stage, the lights come on and I twirl and leap!"] },
  "singer": { person: "👩‍🎤", who: "Jade", intro: ["Hi, I'm Jade. I sing songs for people to enjoy.", "I warm up my voice with hums and silly sounds first.", "My favourite part is when everyone sings along."] },
  "builder": { person: "👷‍♂️", who: "Marcus", intro: ["Hi, I'm Marcus. I build walls, floors and roofs.", "I follow the architect's plans and wear a hard hat to stay safe.", "When we finish, a family gets a brand new home."] },
  "doctor": { person: "👩‍⚕️", who: "Dr. Priya", intro: ["Hi, I'm Dr. Priya. I help people when they feel sick.", "I listen to your heart and ask how you feel.", "Then I work out what will help you get better."] },
  "nurse": { person: "👨‍⚕️", who: "Daniel", intro: ["Hi, I'm Daniel. I look after patients in the hospital.", "I check temperatures, give medicine and cheer people up.", "Doctors and nurses work together as a team."] },
  "veterinarian": { person: "👩‍⚕️", who: "Dr. Hana", intro: ["Hi, I'm Dr. Hana. I'm a doctor for animals.", "I help puppies, kittens, bunnies and even horses feel better.", "Animals can't talk, so I watch them very carefully."] },
  "teacher": { person: "👩‍🏫", who: "Ms. Chen", intro: ["Hi, I'm Ms. Chen. I help children learn new things every day.", "We read stories, count, sing and do experiments.", "I love it when someone says, 'Oh! Now I get it!'"] },
  "firefighter": { person: "👩‍🚒", who: "Alex", intro: ["Hi, I'm Alex. I put out fires and help people in emergencies.", "When the alarm rings, I jump into my gear and onto the truck.", "I also teach kids how to stay safe at home."] },
  "police-officer": { person: "👮‍♀️", who: "Officer Kim", intro: ["Hi, I'm Officer Kim. I help keep our town safe.", "I help people who are lost and make sure traffic moves safely.", "If you need help, you can always ask a police officer."] },
  "chef": { person: "👨‍🍳", who: "Leo", intro: ["Hi, I'm Leo. I cook meals in a busy restaurant kitchen.", "I taste everything and invent new recipes.", "Making a plate look pretty is part of my job too!"] },
  "baker": { person: "👩‍🍳", who: "Mia", intro: ["Hi, I'm Mia. I bake bread, cakes and cookies.", "I start very early in the morning, before the sun comes up.", "The whole bakery smells sweet and warm."] },
  "farmer": { person: "👩‍🌾", who: "Ruth", intro: ["Hi, I'm Ruth. I grow vegetables and look after animals.", "I feed the chickens, milk the cows and water the crops.", "The food you eat might come from a farm like mine!"] },
  "gardener": { person: "👩‍🌾", who: "Ivy", intro: ["Hi, I'm Ivy. I plant flowers and trees and help them grow.", "I dig, water, trim and pull out weeds.", "Bees and butterflies love my gardens."] },
  "zookeeper": { person: "👩", who: "Nora", intro: ["Hi, I'm Nora. I look after the animals at the zoo.", "I make their food, clean their homes and give them toys.", "My favourite friend is a very hungry giraffe."] },
  "scientist": { person: "👩‍🔬", who: "Dr. Ada", intro: ["Hi, I'm Dr. Ada. I ask questions about how things work.", "Then I test my ideas with experiments and write down what happens.", "Sometimes I discover something nobody knew before!"] },
  "astronaut": { person: "👩‍🚀", who: "Commander Sally", intro: ["Hi, I'm Commander Sally. I fly into space on a rocket.", "On the space station everything floats, even my water!", "I do experiments and look down at the Earth."] },
  "bus-driver": { person: "👨", who: "Mr. Joe", intro: ["Hi, I'm Mr. Joe. I drive a big bus around town.", "I stop at every bus stop and say hello to everyone.", "I drive carefully so everyone gets there safely."] },
  "train-driver": { person: "👩‍🔧", who: "Bea", intro: ["Hi, I'm Bea. I drive a long train full of people.", "I follow the signals and keep the train on time.", "Choo choo! Next stop, the station."] },
  "sailor": { person: "👱‍♀️", who: "Marina", intro: ["Hi, I'm Marina. I sail boats across the sea.", "I tie strong knots and read the wind and the waves.", "At night, I can find my way by the stars."] },
  "lifeguard": { person: "🏊‍♀️", who: "Kai", intro: ["Hi, I'm Kai. I watch swimmers at the beach and the pool.", "I'm a strong swimmer, ready to help if someone needs it.", "I remind everyone to swim near a grown-up."] },
  "mail-carrier": { person: "🙋‍♀️", who: "Pam", intro: ["Hi, I'm Pam. I bring letters and parcels to every house.", "Rain or shine, I walk my route every day.", "I love seeing a smile when a birthday card arrives."] },
  "librarian": { person: "👩‍🏫", who: "Mrs. Patel", intro: ["Hi, I'm Mrs. Patel. I look after the books in the library.", "I help you find a story about dragons, space or anything you like.", "I also read stories aloud at story time."] },
  "photographer": { person: "🙆‍♀️", who: "Zoe", intro: ["Hi, I'm Zoe. I take photos of people, places and special days.", "I wait for the perfect light and the perfect smile.", "A photo saves a moment so you can keep it forever."] },
  "author": { person: "👵", who: "Elle", intro: ["Hi, I'm Elle. I write books and stories.", "I get ideas from my dreams, my walks and my cat.", "I write, then fix my words again and again until they shine."] },
  "musician": { person: "👨‍🎤", who: "Sam", intro: ["Hi, I'm Sam. I play the guitar and the drums.", "I practise a lot and play music with my band.", "Music can make people dance, smile or feel calm."] },
  "actor": { person: "👩‍🎤", who: "Ruby", intro: ["Hi, I'm Ruby. I pretend to be different people in plays and films.", "I learn my lines and practise how my character feels.", "When the audience claps, I take a big bow!"] },
  "engineer": { person: "👩‍🔧", who: "Eva", intro: ["Hi, I'm Eva. I design machines and bridges.", "I use maths to make sure they are strong and safe.", "If something breaks, I work out how to fix it."] },
  "coder": { person: "👩‍💻", who: "Lin", intro: ["Hi, I'm Lin. I write instructions that make apps and games work.", "Computers do exactly what I tell them, so I have to be very clear.", "When there's a bug, I hunt it down and fix it."] },
  "electrician": { person: "👨‍🔧", who: "Omar", intro: ["Hi, I'm Omar. I put in the wires that bring power to buildings.", "Thanks to me, the lights turn on when you flip a switch.", "Electricity can be dangerous, so I'm very careful."] },
  "hairdresser": { person: "👩‍🎨", who: "Bella", intro: ["Hi, I'm Bella. I cut, wash and style hair.", "I can do braids, bobs, curls and even bright colours.", "I help people feel happy when they look in the mirror."] },
  "florist": { person: "👩‍🌾", who: "Daisy", intro: ["Hi, I'm Daisy. I make beautiful bunches of flowers.", "I pick colours that go together, like a painting.", "People give my flowers for birthdays and to say 'I love you'."] },
  "tailor": { person: "👴", who: "Mr. Arturo", intro: ["Hi, I'm Arturo. I sew and fix clothes so they fit just right.", "I measure carefully, then cut and stitch the cloth.", "A new button or hem can make clothes feel like new."] },
  "beekeeper": { person: "👩‍🌾", who: "Honey", intro: ["Hi, I'm Honey. I look after bees in their hives.", "I wear a suit and veil so the bees don't sting me.", "The bees make honey, and they help flowers grow too."] }
};
JOBS.forEach(j => Object.assign(j, JOB_PEOPLE[j.id] || {}));

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
