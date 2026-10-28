// The 50 designs behind the 200 puzzles: 4 variants each. Batch k of the generator makes variant k of every design.
// A design is a theme with a way of drawing it (style + p); a variant is one puzzle: its own title, start and finish,
// footer line and small changes. `inspired` is the "who or where from" part of the footer; `fun` is one gentle fact.
// Facts are meant to be short and checkable; sources for the less common ones are in tools/designs_sources.md.
// `existing: n` marks variant 1 of the first ten designs, which already live in data/catalog.js.
"use strict";

const V = (title, fun, chars, p = {}, extra = {}) => Object.assign({ title, fun, chars, p }, extra);

module.exports = [
  // ===== the first ten (variant 1 already exists) =====
  { id: "mouse", family: 8, levels: [1, 3], existing: 1, style: "mouse", inspired: "Inspired by the classic mouse-in-a-maze puzzle", tags: ["squares", "bold lines"], variants: [
    null,
    V("Mouse Goes Home", "Mice build cozy nests out of paper, cloth and grass.", ["mouse", "house"]),
    V("Cat and Mouse", "Felix would like to make a new friend.", ["cat", "mouse"]),
    V("Mouse and the Moon", "Some people say the Moon is made of cheese. It isn't, but it's a fun idea.", ["mouse", "moon"], {}, { inspired: "Inspired by the old saying that the Moon is made of cheese" })
  ] },
  { id: "starry", family: 3, levels: [2, 5], existing: 2, style: "starry", inspired: "Inspired by Vincent van Gogh, The Starry Night, 1889", tags: ["swirls", "painting"], variants: [
    null,
    V("Swirling Sky", "Van Gogh painted with thick, curling brushstrokes.", ["cat", "star"], { v: 1 }, { inspired: "Inspired by the swirling skies of Vincent van Gogh" }),
    V("Night Wind", "The swirls make the painted sky look like it is moving.", ["cat", "moon"], { v: 2 }),
    V("Village Under the Stars", "There is a little village under the swirling sky in the painting.", ["cat", "house"], { v: 3 })
  ] },
  { id: "haring", family: 3, levels: [2, 4], existing: 5, style: "haring", inspired: "Inspired by Keith Haring's bold dancing figures, 1980s", tags: ["shape maze", "painting"], variants: [
    null,
    V("Jumping Figure", "Keith Haring first drew in subway stations, with chalk on empty black panels.", ["cat", "star"], { shape: "haringB", look: { outline: 13 } }, { style: "shape", inspired: "Inspired by Keith Haring (1958–1990)", tags: ["shape maze", "painting", "dancing"] }),
    V("Dancing Dog", "Dogs and dancing figures were some of his favorite things to draw.", ["cat", "heart"], { shape: "dog", look: { outline: 13 } }, { style: "shape", tags: ["dog", "shape maze", "painting"] }),
    V("Radiant Baby", "He drew a crawling baby with rays around it, called the Radiant Baby.", ["cat", "sun"], { shape: "baby", look: { outline: 13 } }, { style: "shape", tags: ["baby", "shape maze", "painting"] })
  ] },
  { id: "hampton", family: 2, levels: [2, 5], existing: 7, style: "hampton", inspired: "Inspired by the hedge maze at Hampton Court, England, planted about 1690", tags: ["hedges", "famous maze"], variants: [
    null,
    V("Villa Pisani Tower", "A little tower stands in the middle of this old Italian hedge maze.", ["cat", "house"], { look: "hedge", core: 2.2, R: 255 }, { style: "rings", inspired: "Inspired by the hedge maze at Villa Pisani, Italy, planted in the early 1700s", tags: ["hedges", "famous maze", "rings"] }),
    V("Glendurgan Maze", "Laurel leaves stay green all year, so this maze is leafy in winter too.", ["cat", "leaf"], { shape: "oval", look: { hedge: true, wall: 16 } }, { style: "shape", inspired: "Inspired by the laurel maze at Glendurgan Garden, Cornwall, planted in 1833", tags: ["hedges", "famous maze"] }),
    V("Longleat Hedges", "Longleat's hedge maze has wooden bridges you can climb for a view.", ["cat", "tree"], { shape: "rect", look: { hedge: true, wall: 16 } }, { style: "shape", inspired: "Inspired by the Longleat hedge maze in England, which has bridges", tags: ["hedges", "famous maze"] })
  ] },
  { id: "honeycomb", family: 4, levels: [1, 4], existing: 3, style: "honeycomb", inspired: "Inspired by honeybees, who build six-sided cells", tags: ["hexagons", "nature"], variants: [
    null,
    V("Honey Drop", "Bees make honey from the sweet nectar of flowers.", ["bee", "drop"]),
    V("Back to the Hive", "A hive is home to thousands of bees.", ["bee", "house"]),
    V("Bee Dance", "Bees dance to tell their friends where the flowers are.", ["bee", "flower"])
  ] },
  { id: "spider", family: 4, levels: [1, 4], existing: 8, style: "spider", inspired: "Inspired by orb-weaver spiders and their wheel-shaped webs", tags: ["rings", "thin lines", "nature"], variants: [
    null,
    V("Dewdrop Web", "Morning dew makes a spider's web sparkle.", ["spider", "drop"]),
    V("Web in the Garden", "Spiders make their silk inside their own bodies.", ["spider", "star"]),
    V("After the Rain", "Spider silk is strong and stretchy.", ["spider", "sun"])
  ] },
  { id: "ants", family: 4, levels: [2, 4], existing: 9, style: "ants", inspired: "Inspired by ant colonies digging rooms under the ground", tags: ["tunnels", "nature"], variants: [
    null,
    V("Leaf Delivery", "Leafcutter ants carry leaf pieces home to grow food.", ["ant", "leaf"]),
    V("Home Sweet Hole", "Ants live in big families called colonies.", ["ant", "house"]),
    V("Crumb Trail", "Ants leave a scent trail so their friends can follow.", ["ant", "crumb"])
  ] },
  { id: "celtic", family: 3, levels: [2, 5], existing: 10, style: "celtic", inspired: "Inspired by the knotwork in the Book of Kells, Ireland, about 800", tags: ["bridges", "painting"], variants: [
    null,
    V("Over and Under", "A Celtic knot has no beginning and no end.", ["cat", "yarn"], {}, { inspired: "Inspired by Celtic knotwork from Ireland and Britain" }),
    V("Knot Garden", "Knot patterns were used to decorate crosses, jewelry and books.", ["cat", "flower"]),
    V("Kells Knot", "Monks made the Book of Kells by hand, with ink and paint.", ["cat", "heart"])
  ] },
  { id: "subway", family: 5, levels: [1, 4], existing: 6, style: "subway", inspired: "Inspired by Harry Beck's London Underground map, 1933", tags: ["lines", "map"], variants: [
    null,
    V("Metro Lines", "Many subway maps use straight lines and bends of 45 degrees.", ["train", "star"], {}, { inspired: "Inspired by subway maps from around the world" }),
    V("Transfer Station", "A station where lines meet is called an interchange.", ["train", "house"], {}, { inspired: "Inspired by subway maps from around the world" }),
    V("Last Stop", "The first underground railway opened in London in 1863.", ["train", "flower"], {}, { inspired: "Inspired by the first underground railway, London, 1863" })
  ] },
  { id: "chartres", family: 1, levels: [2, 5], existing: 4, style: "chartres", inspired: "Inspired by the floor labyrinth of Chartres Cathedral, France, about 1200", tags: ["rings", "double lines"], variants: [
    null,
    V("Cathedral Rings", "People walked these paths slowly, to think and to rest.", ["cat", "star"], {}, { inspired: "Inspired by labyrinths in medieval cathedrals" }),
    V("Walking Labyrinth", "Some labyrinths are big enough to walk through.", ["cat", "heart"], {}, { inspired: "Inspired by walking labyrinths" }),
    V("Rose in the Middle", "The Chartres labyrinth is almost 13 meters (42 feet) across.", ["cat", "rosette"])
  ] },

  // ===== new designs =====
  { id: "stones", family: 1, levels: [1, 4], style: "rings", base: { look: "dots" }, inspired: "Inspired by stone labyrinths laid out on beaches in Scandinavia", tags: ["rings", "dots", "stones"], variants: [
    V("Stone Circle", "Each wall is a row of stones.", ["cat", "star"]),
    V("Pebble Path", "Coins from Knossos, on the island of Crete, show a labyrinth.", ["cat", "heart"], { decor: "ticks", R: 255 }, { inspired: "Inspired by the labyrinth on ancient coins from Crete" }),
    V("Seashore Stones", "Many old stone labyrinths sit close to the sea.", ["cat", "sun"], { rot: 0 }),
    V("Garden Labyrinth", "A labyrinth can be a quiet place to walk and think.", ["cat", "flower"], { core: 1.9 }, { inspired: "Inspired by garden labyrinths" })
  ] },
  { id: "pyramid", family: 1, levels: [1, 4], style: "shape", base: { shape: "pyramid" }, inspired: "Inspired by the Great Pyramid of Giza, Egypt", tags: ["pyramid", "shape maze", "Egypt"], variants: [
    V("Pyramid Passages", "It was the world's tallest building for ages.", ["cat", "star"]),
    V("Sandy Steps", "Egypt's pyramids were built as tombs for kings called pharaohs.", ["cat", "sun"], { flip: true }),
    V("Triangle Trail", "A pyramid has a square base and four triangle sides.", ["cat", "heart"]),
    V("Hidden Rooms", "Inside the Great Pyramid there are narrow passages and rooms.", ["cat", "star"], { flip: true })
  ] },
  { id: "castle", family: 8, levels: [1, 4], style: "shape", base: { shape: "castle" }, inspired: "Inspired by storybook castles", tags: ["castle", "shape maze"], variants: [
    V("Castle Gate", "Castle gates were closed at night with big wooden doors.", ["cat", "star"]),
    V("Drawbridge Day", "A drawbridge was raised and lowered with chains.", ["cat", "heart"]),
    V("Tower Climb", "Tall towers let castle watchers see visitors far away.", ["cat", "sun"]),
    V("Castle Garden", "Many castles had gardens inside their walls.", ["cat", "flower"])
  ] },
  { id: "corn", family: 2, levels: [2, 4], style: "shape", base: { shape: "pumpkin", look: { wall: 8, outline: 11 } }, inspired: "Inspired by fall corn mazes", tags: ["pumpkin", "shape maze", "fall"], variants: [
    V("Pumpkin Corn Maze", "Some corn mazes are cut as giant pictures you can see from the sky.", ["cat", "pumpkin"]),
    V("Harvest Maze", "Corn mazes are cut while the corn is still growing.", ["cat", "leaf"], { flip: true }),
    V("Fall Festival", "Farms often open their corn mazes in the autumn.", ["cat", "sun"]),
    V("Pumpkin Patch", "Pumpkins grow on long vines along the ground.", ["cat", "pumpkin"], { flip: true })
  ] },
  { id: "pineapple", family: 2, levels: [2, 4], style: "shape", base: { shape: "pineapple" }, inspired: "Inspired by the pineapple garden maze in Hawaii", tags: ["pineapple", "shape maze"], variants: [
    V("Pineapple Maze", "A pineapple plant grows one fruit at a time.", ["cat", "star"]),
    V("Tropical Garden", "Pineapples grow close to the ground, not on trees.", ["cat", "sun"]),
    V("Sweet Treat", "A pineapple takes well over a year to grow.", ["cat", "heart"]),
    V("Leafy Crown", "The leafy top of a pineapple can grow into a new plant.", ["cat", "leaf"])
  ] },
  { id: "mondrian", family: 3, levels: [1, 4], style: "mondrian", inspired: "Inspired by Piet Mondrian's grid paintings", tags: ["rooms", "thick lines", "painting"], variants: [
    V("Mondrian Rooms", "He used black lines, white, and just a few bright colors.", ["cat", "star"]),
    V("Big Squares", "Mondrian painted with straight lines and right angles.", ["cat", "heart"], { startAt: 0.25, finishAt: 0.75 }),
    V("Lines and Doors", "Mondrian was Dutch, and he started out painting trees.", ["cat", "star"], { startAt: 0.75, finishAt: 0.25 }),
    V("Broadway Boogie", "He loved jazz and the busy streets of New York.", ["cat", "note"], {}, { inspired: "Inspired by Mondrian's Broadway Boogie Woogie, 1942–43" })
  ] },
  { id: "wave", family: 3, levels: [2, 4], style: "wave", inspired: "Inspired by Hokusai's Great Wave, about 1831", tags: ["waves", "sea", "painting"], variants: [
    V("The Great Wave", "Tiny Mount Fuji sits far behind the giant wave.", ["boat", "mountain"], { v: 0 }),
    V("Rolling Sea", "Hokusai was still painting when he was in his eighties.", ["boat", "star"], { v: 1 }, { inspired: "Inspired by the waves of Katsushika Hokusai" }),
    V("Wave Rider", "The wave's foamy tips look like fingers.", ["boat", "sun"], { v: 2 }),
    V("Ocean Journey", "Hokusai was a Japanese artist who made thousands of prints.", ["boat", "house"], { v: 3 })
  ] },
  { id: "spirals", family: 3, levels: [2, 4], style: "spirals", inspired: "Inspired by Klimt's Tree of Life, about 1909", tags: ["spirals", "painting"], variants: [
    V("Golden Spirals", "Klimt used real gold leaf in many of his paintings.", ["cat", "heart"], { v: 0 }),
    V("Tree of Life", "In the painting, branches curl into big spirals.", ["cat", "leaf"], { v: 1 }),
    V("Swirl Garden", "Klimt also painted gardens full of flowers.", ["bee", "flower"], { v: 2 }, { inspired: "Inspired by the flowers and gardens of Gustav Klimt" }),
    V("Gold Leaf", "Gold leaf is gold pounded into sheets thinner than paper.", ["cat", "star"], { v: 3 })
  ] },
  { id: "matisse", family: 3, levels: [2, 4], style: "shape", base: { shape: "matisse" }, inspired: "Inspired by Henri Matisse's paper cutouts, 1940s–50s", tags: ["cutout", "shape maze", "painting"], variants: [
    V("Paper Cut Leaf", "He cut shapes from paper painted in bright colors.", ["cat", "star"]),
    V("Seaweed Dance", "One of his famous cutouts is called The Snail.", ["cat", "fish"], { flip: true }),
    V("Scissor Painting", "Matisse said he was drawing with scissors.", ["cat", "heart"]),
    V("Blue Shapes", "Late in life he made art from his chair, with scissors and paper.", ["cat", "star"], { flip: true })
  ] },
  { id: "kusama", family: 3, levels: [2, 4], style: "kusama", inspired: "Inspired by Yayoi Kusama's polka dots and pumpkins", tags: ["dots", "tunnels", "painting"], variants: [
    V("Polka Dot Path", "Kusama has covered whole rooms in dots.", ["cat", "pumpkin"]),
    V("Dot Garden", "Yayoi Kusama was born in Japan in 1929.", ["cat", "flower"]),
    V("Pumpkin Dots", "Her pumpkin sculptures are covered in dots.", ["cat", "pumpkin"]),
    V("Infinity Dots", "She makes mirror rooms that look like they go on forever.", ["cat", "sun"])
  ] },
  { id: "seurat", family: 3, levels: [2, 5], style: "seurat", inspired: "Inspired by Georges Seurat's dot paintings, 1880s", tags: ["dots", "painting"], variants: [
    V("Dot Painting", "He painted with tiny dots of color that blend together.", ["cat", "sun"]),
    V("Sunday in the Park", "A Sunday on La Grande Jatte took him two years to paint.", ["cat", "flower"], {}, { inspired: "Inspired by A Sunday on La Grande Jatte, 1884–86" }),
    V("Pointillism", "This style of painting with dots is called pointillism.", ["cat", "star"]),
    V("River Dots", "La Grande Jatte is an island in the Seine, in Paris.", ["boat", "sun"])
  ] },
  { id: "startile", family: 3, levels: [2, 4], style: "hexshape", base: { shape: "startile" }, inspired: "Inspired by star tiles in the Alhambra, Spain", tags: ["star", "hexagons", "tiles"], variants: [
    V("Star Tiles", "Tile makers built patterns out of stars and shapes.", ["cat", "star"]),
    V("Tile Garden", "Many of these patterns can repeat forever without gaps.", ["cat", "flower"]),
    V("Eight-Point Star", "This star has eight points.", ["cat", "star"]),
    V("Palace Floor", "The Alhambra is a palace in Granada, Spain.", ["cat", "heart"])
  ] },
  { id: "rosewindow", family: 3, levels: [1, 4], style: "rings", base: { look: "double", decor: "petals", R: 235, core: 1.7 }, inspired: "Inspired by round rose windows in Gothic cathedrals", tags: ["rings", "petals", "double lines"], variants: [
    V("Rose Window", "Light shines through colored glass to make a flower.", ["cat", "rosette"]),
    V("Stained Glass", "Stained glass is glass colored with tiny bits of metal.", ["cat", "star"], { rot: 0 }),
    V("Cathedral Flower", "Chartres Cathedral has beautiful rose windows.", ["cat", "flower"], { core: 1.4 }),
    V("Petal Maze", "A rose window can look like a flower or a wheel.", ["cat", "heart"], { rot: 1.2 })
  ] },
  { id: "fish", family: 4, levels: [2, 5], style: "shape", base: { shape: "fish" }, inspired: "Inspired by fish swimming in the sea", tags: ["fish", "sea", "shape maze"], variants: [
    V("Fish in the Sea", "Fish breathe underwater through their gills.", ["cat", "fish"]),
    V("Fishy Friends", "Most fish have no eyelids.", ["cat", "drop"], { flip: true }),
    V("Big Fish", "Fish swim by moving their tails from side to side.", ["cat", "star"]),
    V("Fish Tale", "The whale shark is a huge fish, about as long as a bus.", ["cat", "heart"], { flip: true })
  ] },
  { id: "whale", family: 4, levels: [2, 5], style: "shape", base: { shape: "whale" }, inspired: "Inspired by the blue whale, the biggest animal ever", tags: ["whale", "sea", "shape maze"], variants: [
    V("Blue Whale", "A blue whale's tongue can weigh as much as an elephant.", ["cat", "star"]),
    V("Whale Song", "Whales sing songs that travel far underwater.", ["cat", "note"], { flip: true }, { inspired: "Inspired by whale songs" }),
    V("Whale Spout", "A whale breathes air through a blowhole on top of its head.", ["cat", "drop"]),
    V("Whale Tail", "Each humpback whale has a tail with its own pattern.", ["cat", "heart"], { flip: true }, { inspired: "Inspired by humpback whales" })
  ] },
  { id: "turtle", family: 4, levels: [2, 4], style: "hexshape", base: { shape: "turtle" }, inspired: "Inspired by sea turtle shells", tags: ["turtle", "hexagons", "shape maze"], variants: [
    V("Turtle Shell", "The plates on a turtle's shell fit together like tiles.", ["cat", "leaf"]),
    V("Sea Turtle", "Sea turtles can stay underwater for a long time on one breath.", ["cat", "sun"], { flip: true }),
    V("Slow and Steady", "Turtles have lived on Earth for over 200 million years.", ["cat", "star"]),
    V("Hatchlings", "Baby sea turtles hatch on the beach and race to the sea.", ["cat", "heart"], { flip: true })
  ] },
  { id: "butterfly", family: 4, levels: [2, 5], style: "shape", base: { shape: "butterfly" }, inspired: "Inspired by the wings of butterflies", tags: ["butterfly", "shape maze", "nature"], variants: [
    V("Butterfly Wings", "Butterflies taste with their feet.", ["butterfly", "flower"]),
    V("Garden Visitor", "A butterfly's wings are covered in tiny scales.", ["cat", "flower"]),
    V("Wing Pattern", "Monarch butterflies fly thousands of miles each year.", ["butterfly", "sun"], {}, { inspired: "Inspired by monarch butterflies" }),
    V("Caterpillar Dream", "Every butterfly starts out as a caterpillar.", ["cat", "leaf"])
  ] },
  { id: "snail", family: 4, levels: [2, 5], style: "shape", base: { shape: "snail" }, inspired: "Inspired by the spiral shell of a garden snail", tags: ["snail", "shape maze", "nature"], variants: [
    V("Garden Snail", "A snail's shell grows bigger as the snail grows.", ["cat", "leaf"]),
    V("Slow Mail", "Snails glide along on a trail of slime.", ["cat", "star"], { flip: true }),
    V("Spiral Home", "A snail can pull its whole body inside its shell.", ["cat", "house"]),
    V("Rainy Day Snail", "Snails come out when it is wet.", ["cat", "drop"], { flip: true })
  ] },
  { id: "treering", family: 4, levels: [1, 4], style: "rings", base: { look: "thin", decor: "ticks", R: 250 }, inspired: "Inspired by the rings inside a tree trunk", tags: ["rings", "tree", "thin lines", "nature"], variants: [
    V("Tree Rings", "A tree usually grows one new ring each year.", ["cat", "tree"]),
    V("Old Tree", "Wide rings mean a year with lots of rain.", ["cat", "leaf"], { rot: 0 }),
    V("Stump Maze", "Some trees live for thousands of years.", ["cat", "star"], { core: 1.9 }),
    V("Forest Floor", "A tree trunk is covered by bark to protect it.", ["cat", "heart"], { rot: 1 })
  ] },
  { id: "sunflower", family: 4, levels: [1, 4], style: "rings", base: { look: "dots", decor: "petals", R: 235, core: 1.8 }, inspired: "Inspired by sunflower heads, packed with seeds", tags: ["rings", "dots", "flower", "nature"], variants: [
    V("Sunflower", "Sunflower seeds grow in curving spirals.", ["bee", "sun"]),
    V("Sun Seeds", "Young sunflowers turn to face the sun.", ["bee", "star"], { rot: 0 }),
    V("Big Bloom", "Some sunflowers grow taller than a grown-up.", ["cat", "flower"], { core: 1.5 }),
    V("Seed Spiral", "Birds love to eat sunflower seeds.", ["bee", "sun"], { rot: 1 })
  ] },
  { id: "snowflake", family: 4, levels: [2, 4], style: "hexshape", base: { shape: "snowflake" }, inspired: "Inspired by the six arms of a snowflake", tags: ["snowflake", "hexagons", "shape maze", "winter"], variants: [
    V("Snowflake", "Snow crystals have six sides or six arms.", ["cat", "star"]),
    V("Winter Star", "Snow crystals form high up in cold clouds.", ["cat", "star"], { flip: true }),
    V("Frosty Path", "Snowflakes can look different from each other.", ["cat", "sun"]),
    V("Cold Crystal", "Wilson Bentley took the first photo of a snowflake in 1885.", ["cat", "heart"], { flip: true })
  ] },
  { id: "bird", family: 4, levels: [2, 4], style: "shape", base: { shape: "bird" }, inspired: "Inspired by small songbirds", tags: ["bird", "shape maze", "nature"], variants: [
    V("Little Bird", "Many birds sing to say, this is my home.", ["bird", "leaf"]),
    V("Bird Song", "Many birds have hollow bones that keep them light.", ["bird", "note"], { flip: true }),
    V("Nest Time", "Birds build nests out of twigs, grass and feathers.", ["bird", "house"]),
    V("Sky Flight", "Some birds fly thousands of miles each year.", ["bird", "sun"], { flip: true })
  ] },
  { id: "rainbow", family: 4, levels: [2, 4], style: "shape", base: { shape: "rainbow" }, inspired: "Inspired by rainbows after the rain", tags: ["rainbow", "shape maze", "sky"], variants: [
    V("Rainbow", "A rainbow is really a circle; from the ground we see half.", ["cat", "sun"], { bands: 1 }),
    V("Double Rainbow", "In a double rainbow, the second one has its colors flipped.", ["cat", "star"], { bands: 2 }),
    V("Rainbow Bridge", "A rainbow is sunlight split into colors by raindrops.", ["cat", "heart"], { bands: 1, flip: true }),
    V("Three Bands", "Red is on the outside of a rainbow.", ["cat", "sun"], { bands: 3 })
  ] },
  { id: "moon", family: 4, levels: [2, 4], style: "shape", base: { shape: "moon" }, inspired: "Inspired by the crescent moon", tags: ["moon", "shape maze", "sky"], variants: [
    V("Crescent Moon", "The Moon takes about a month to go through its phases.", ["cat", "star"]),
    V("Night Sky", "The Moon shines by reflecting sunlight.", ["cat", "star"], { flip: true }),
    V("Moon Rise", "The same side of the Moon always faces us.", ["cat", "heart"]),
    V("Silver Sliver", "A thin crescent moon is only a small part of the Moon lit up.", ["cat", "star"], { flip: true })
  ] },
  { id: "circuit", family: 5, levels: [1, 4], style: "circuit", inspired: "Inspired by circuit boards inside computers", tags: ["lines", "map"], variants: [
    V("Circuit Board", "Thin copper lines carry electricity between the parts.", ["cat", "star"]),
    V("Tiny Roads", "A computer chip can hold billions of tiny switches.", ["cat", "heart"]),
    V("Robot Brain", "Electricity moves through wires very fast.", ["cat", "star"]),
    V("Power Path", "The first computers were as big as whole rooms.", ["cat", "sun"])
  ] },
  { id: "streets", family: 5, levels: [1, 4], style: "streets", inspired: "Inspired by the street grid of Manhattan, New York", tags: ["streets", "double lines", "map"], variants: [
    V("City Streets", "New York's grid of streets was planned in 1811.", ["cat", "house"]),
    V("Neighborhood", "Many cities are laid out in rows of blocks.", ["cat", "house"], {}, { inspired: "Inspired by city blocks" }),
    V("One-Way Town", "On a one-way street, cars can only go in one direction.", ["train", "house"], {}, { inspired: "Inspired by one-way streets" }),
    V("Delivery Day", "Street names and numbers help us find our way.", ["cat", "house"], {}, { inspired: "Inspired by city maps" })
  ] },
  { id: "canals", family: 5, levels: [2, 5], style: "canals", inspired: "Inspired by the canals and bridges of Venice, Italy", tags: ["canals", "bridges", "map"], variants: [
    V("Canal City", "Venice has hundreds of bridges over its canals.", ["boat", "house"]),
    V("Gondola Ride", "Gondolas are long, narrow boats pushed with one oar.", ["boat", "heart"]),
    V("Bridge Hop", "Venice is built on more than 100 small islands.", ["boat", "star"]),
    V("Water Streets", "In Venice, many of the streets are made of water.", ["boat", "house"])
  ] },
  { id: "rocket", family: 5, levels: [2, 4], style: "shape", base: { shape: "rocket" }, inspired: "Inspired by rockets that carry people to space", tags: ["rocket", "shape maze", "space"], variants: [
    V("Rocket Ship", "Apollo 11 landed people on the Moon in 1969.", ["cat", "moon"]),
    V("Blast Off", "To circle Earth, a rocket must travel about 28,000 km an hour.", ["cat", "star"], { flip: true }),
    V("Moon Mission", "The Moon is about 384,000 kilometers away.", ["cat", "moon"]),
    V("Star Traveler", "Our Sun is a star, and the closest one to us.", ["cat", "sun"], { flip: true })
  ] },
  { id: "balloon", family: 5, levels: [2, 4], style: "shape", base: { shape: "balloon" }, inspired: "Inspired by the first hot air balloons, France 1783", tags: ["balloon", "shape maze", "sky"], variants: [
    V("Hot Air Balloon", "First passengers: a sheep, a duck and a rooster.", ["cat", "sun"]),
    V("Up, Up and Away", "Hot air rises, and that lifts the balloon.", ["cat", "star"], { flip: true }),
    V("Sky Ride", "A burner heats the air inside the balloon.", ["cat", "heart"]),
    V("Floating Home", "Balloons drift with the wind, so pilots go where it blows.", ["cat", "house"], { flip: true })
  ] },
  { id: "sierpinski", family: 6, levels: [2, 5], style: "shape", base: { shape: "sierpinski" }, inspired: "Inspired by the Sierpiński triangle, 1915", tags: ["triangle", "shape maze", "pattern"], variants: [
    V("Triangle Trail", "Inside each triangle are smaller triangles with holes.", ["cat", "star"]),
    V("Triangles in Triangles", "Zoom in, and the same pattern repeats.", ["cat", "heart"], { flip: true }),
    V("Fractal Path", "A pattern that repeats smaller and smaller is called a fractal.", ["cat", "star"]),
    V("Pascal's Triangle", "The odd numbers in Pascal's triangle make this pattern.", ["cat", "sun"], { flip: true })
  ] },
  { id: "letters", family: 6, levels: [2, 4], style: "shape", base: { look: { outline: 10 } }, inspired: "Inspired by the first letter of Felix's name", tags: ["letter", "shape maze"], variants: [
    V("F is for Felix", "F is for Felix, for fun and for friends.", ["cat", "star"], { shape: "letterF" }),
    V("E is for Explore", "E is for explore: every maze is a little adventure.", ["cat", "star"], { shape: "letterE" }, { inspired: "Inspired by the letter E" }),
    V("L is for Labyrinth", "A labyrinth is a path that winds its way to the center.", ["cat", "heart"], { shape: "letterL" }, { inspired: "Inspired by the letter L" }),
    V("I is for Imagine", "I is for imagine: what will you draw next?", ["cat", "star"], { shape: "letterI" }, { inspired: "Inspired by the letter I" })
  ] },
  { id: "checker", family: 6, levels: [1, 4], style: "checker", inspired: "Inspired by the checkerboard, used for checkers and chess", tags: ["checkerboard", "squares"], variants: [
    V("Checkerboard", "A checkers board has 64 squares.", ["cat", "star"]),
    V("Chess Board", "Chess is more than 1,500 years old.", ["cat", "star"]),
    V("Black and White", "A checkerboard pattern repeats two colors in turn.", ["cat", "heart"]),
    V("Big Board", "Some checkers boards have 10 squares on each side.", ["cat", "star"])
  ] },
  { id: "kite", family: 6, levels: [2, 4], style: "shape", base: { shape: "kite" }, inspired: "Inspired by kites, flown in China for over 2,000 years", tags: ["kite", "shape maze", "sky"], variants: [
    V("Kite in the Sky", "A kite needs wind to fly.", ["cat", "sun"]),
    V("Windy Day", "Kites can look like birds, fish or dragons.", ["cat", "star"], { flip: true }),
    V("Diamond Kite", "A diamond kite has four straight sides.", ["cat", "heart"]),
    V("Tail Wag", "A kite's tail helps keep it steady in the wind.", ["cat", "sun"], { flip: true })
  ] },
  { id: "record", family: 7, levels: [1, 5], style: "rings", base: { look: "thin", decor: "ticks", R: 255, core: 1.3 }, inspired: "Inspired by vinyl records", tags: ["rings", "music", "thin lines"], variants: [
    V("Record Player", "A record's song is one long groove that spirals inward.", ["cat", "note"]),
    V("Spin Cycle", "Records spin 33 or 45 times every minute.", ["cat", "note"], { rot: 0 }),
    V("Groove Maze", "A needle follows the groove to make the sound.", ["cat", "star"], { rot: 1.4 }),
    V("Dance Floor", "Thomas Edison made the first record player in 1877.", ["cat", "heart"], { rot: 2.2 })
  ] },
  { id: "soundwave", family: 7, levels: [1, 4], style: "soundwave", inspired: "Inspired by sound waves", tags: ["waves", "music"], variants: [
    V("Sound Waves", "Sound is air wiggling back and forth.", ["cat", "note"], { v: 0 }),
    V("Loud and Soft", "Louder sounds make bigger waves.", ["cat", "note"], { v: 2 }),
    V("High and Low", "Quick wiggles make high sounds, slow ones make low sounds.", ["cat", "note"], { v: 1 }),
    V("Echo", "An echo is a sound bouncing back to you.", ["cat", "star"], { v: 3 })
  ] },
  { id: "piano", family: 7, levels: [1, 4], style: "piano", inspired: "Inspired by piano keys", tags: ["piano", "music", "squares"], variants: [
    V("Piano Keys", "A piano has 88 keys.", ["cat", "note"]),
    V("Black and White Keys", "The black keys come in groups of two and three.", ["cat", "note"]),
    V("Little Song", "Piano hammers are tiny, and they strike the strings inside.", ["cat", "star"]),
    V("Duet", "Two people can play one piano together. It's called a duet.", ["cat", "heart"])
  ] },
  { id: "island", family: 8, levels: [1, 4], style: "shape", base: { shape: "island" }, inspired: "Inspired by treasure maps and islands", tags: ["island", "shape maze", "map"], variants: [
    V("Treasure Island", "On treasure maps, X marks the spot.", ["boat", "star"]),
    V("Palm Island", "An island is land with water all around it.", ["boat", "sun"], { flip: true }),
    V("Secret Cove", "A cove is a small bay with calm water.", ["boat", "heart"]),
    V("Sailing Home", "Sailors used the stars to find their way.", ["boat", "house"], { flip: true })
  ] },
  { id: "dino", family: 8, levels: [2, 5], style: "shape", base: { shape: "dino" }, inspired: "Inspired by long-necked dinosaurs", tags: ["dinosaur", "shape maze"], variants: [
    V("Long-Neck Dino", "Some dinosaurs ate leaves from the tops of tall trees.", ["cat", "leaf"]),
    V("Dino Stroll", "Birds are the living relatives of dinosaurs.", ["cat", "leaf"], { flip: true }),
    V("Fossil Hunt", "We learn about dinosaurs from their fossils.", ["cat", "star"]),
    V("Gentle Giant", "Dinosaurs lived millions of years before people.", ["cat", "heart"], { flip: true })
  ] },
  { id: "catface", family: 8, levels: [1, 4], style: "shape", base: { shape: "catface" }, inspired: "Inspired by Felix the cat", tags: ["cat", "shape maze"], variants: [
    V("Felix's Face", "Cats use their whiskers to feel the world around them.", ["cat", "yarn"]),
    V("Whisker Walk", "Cats can see well in dim light.", ["mouse", "cheese"], {}, { inspired: "Inspired by a mouse exploring a cat's face" }),
    V("Yarn Ball", "Cats love to chase things that move.", ["cat", "yarn"], { flip: true }),
    V("Cat Nap", "Cats sleep for most of the day.", ["cat", "moon"])
  ] },
  { id: "warren", family: 8, levels: [2, 5], style: "ants", inspired: "Inspired by rabbit burrows, called warrens", tags: ["tunnels", "rabbit", "nature"], variants: [
    V("Rabbit Warren", "Rabbits dig underground homes called warrens.", ["rabbit", "carrot"]),
    V("Carrot Patch", "Rabbits like leafy greens even more than carrots.", ["rabbit", "carrot"]),
    V("Bunny Home", "Baby rabbits are born in a nest of fur and grass.", ["rabbit", "house"]),
    V("Garden Visit", "A rabbit's teeth never stop growing.", ["rabbit", "flower"])
  ] }
];
