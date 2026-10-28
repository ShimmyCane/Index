# Felix Maze — What Makes a Good Maze

**Status:** first pass of research, October 2026. Sources at the bottom.
**Purpose:** what we know about how mazes are made and what makes one fun, so the generator makes good mazes and not just correct ones.

## 1. Words we'll use

| Word | Meaning |
|---|---|
| **Labyrinth** | One path, no choices. You can't get lost; you walk it. (Cretan, Chartres) |
| **Maze** | Paths branch. You choose, and can go wrong. The 1922 split by W. H. Matthews: labyrinths are *unicursal*, mazes *multicursal*. |
| **Perfect maze** | Exactly one route between any two spots. No loops, no closed-off areas. |
| **Braid maze** | Has loops and few or no dead ends. You get lost by going around in circles, not by hitting walls. |
| **Dead end** | A branch that stops. Too many tire a young solver; too few make it easy. |
| **Decoy** | A wrong branch that looks right for a long time before it fails. |
| **River** | How long the corridors run before they branch. High river: long winding paths, few dead ends. Low river: many short stubs. |
| **Solution length** | How much of the maze the right path covers. |
| **Weave** | Paths that pass over and under each other (bridges). |

## 2. Seven ways to describe a maze

Walter Pullen's *Think Labyrinth* site sorts mazes along seven axes. It is the most thorough catalog of maze styles and algorithms.

1. **Dimension:** flat, flat with bridges (weave), or several floors.
2. **Hyperdimension:** whether the thing moving is a point or something bigger. Not needed for us.
3. **Topology:** a normal flat sheet, or one that wraps around (the left edge joins the right).
4. **Tessellation:** the cell shape: squares, hexagons, triangles, rings, or no cells at all (free curves, fractals).
5. **Routing:** perfect, braid, one path (unicursal), or sparse (with open areas).
6. **Texture:** the feel of the corridors: long and winding, short and spiky, or biased in one direction.
7. **Focus:** whether the design starts from the walls or from the paths.

The tags in `inspirations.md` follow axes 4, 5 and 6 (geometry, line, density) plus mechanics (axis 1 and extras).

## 3. How computers make mazes, and how each one feels

The algorithm decides the texture. This matters more than it sounds: the same grid looks and plays completely differently.

| Algorithm | How it works | What the maze feels like | Fit for Felix |
|---|---|---|---|
| **Recursive backtracker** (depth-first) | Wander randomly; back up when stuck | Long winding corridors, few dead ends, high river | **Best starting point.** Feels drawn by hand. |
| **Growing tree** | General form of the above; a setting picks which cell to grow from | Tunable from winding (backtracker) to spiky (Prim's) | **Best overall:** one knob for difficulty |
| **Prim's** | Grow outward from a seed | Many short dead ends, low river | Harder; looks busy |
| **Kruskal's** | Join random cells until all connect | Many short dead ends | Harder |
| **Wilson's / Aldous-Broder** | Random walks; every maze equally likely | Even, unbiased | Good for variety, plain look |
| **Binary tree / Sidewinder** | Each cell opens north or east | Clear bias, a straight corridor along one edge | Too easy to spot; avoid |
| **Eller's** | Row by row | Even, can be endless | Good for very tall posters |
| **Recursive division** | Split a room with a wall and a door, repeat | Long straight walls, rooms | Good for castles, buildings, Mondrian |

**After generating, edit:**

- **Braiding:** remove some dead ends to make loops. Makes the maze kinder for young kids.
- **Path picking:** choose the start and finish so the solution is long and passes the interesting parts of the picture.
- **Decoy check:** make sure several branches near the start look promising, so working backward from the finish isn't a shortcut.

## 4. Mazes that aren't on a grid

This is where Felix's freehand style lives.

- **Organic labyrinths** (Pedersen and Singh, 2006): start with a curve and let it grow, wiggle and push away from itself, like a river meandering. The result looks like brain coral or a fingerprint. Spatial maps can make it wiggle more in some places and less in others.
- **Image-guided mazes** (Xu and Kaplan, 2007): split a picture into regions and give each region its own maze texture: swirls, spirals, or corridors that follow a direction. This is how a Starry Night maze can swirl where the sky swirls.
- **Mazes in a shape:** clip the cell grid to a silhouette (an animal, a letter), then generate inside it.
- **Tile mazes** (Truchet and others): each tile carries a bit of path; turning tiles changes the maze. Easy to make look decorative.
- **Space-filling curves** (Hilbert, dragon): one long path that fills a square; add cuts and branches to turn it into a maze.
- **Hand feel:** after any method, draw the walls as strokes with a little wobble and changing thickness, not as perfect straight lines. Round the corners. This keeps it from looking like a computer printout.

## 5. What makes a maze fun (not just correct)

Collected from the sources below.

1. **Looks good and plays well.** Master maze designers balance a beautiful picture with a real puzzle (Kaplan). If the picture wins, it isn't a maze; if the puzzle wins, it's boring.
2. **Many tempting branches in every direction.** Kids (and adults) learn to start from the finish. Good designers place branches near both ends.
3. **Fair difficulty.** Hard enough to make him think, solvable without help. Dead ends should cost a little, not a lot.
4. **A concrete goal.** A bunny going to a carrot beats an arrow going to a dot, especially for young kids.
5. **One clear theme per sheet.** The walls, the start, the goal and the decoration all belong to the same world.
6. **Something to discover.** A hidden picture, a bridge, a creature on the way, a fact at the bottom.
7. **Sense of direction.** Small cues (light, a river, stars) let the solver feel progress without giving the path away.

## 6. Young solvers

Rules of thumb from teacher and kids' maze sources. One source gave exact numbers; they vary between sources, so treat them as starting points and test with Felix.

- **Path width matters more than length.** Narrow paths make a young child grip the pencil hard and tire quickly. Start around ½ inch (about 12 mm) and go down to about ⅜ inch (10 mm) as he gets better.
- **Few dead ends at first:** a suggested 1–2 for the youngest solvers, and up to about 8 turns on the right path. Raise it as skill grows.
- **Grow difficulty by size**, not by giving more easy pages. One generator found an 8×8 easy maze took a 4-year-old 1–3 minutes.
- **Mistakes should be cheap:** a sheet protector or dry-erase pouch with a washable marker lets him try again.
- **Other forms for fun:** masking-tape mazes on the floor, play-dough mazes with a marble.

On an 11×17 sheet with ½-inch margins and about 2 inches kept for the title and footer, the drawing area is about 10×14 inches. A ½-inch path with bold walls makes a cell about ¾ inch, so roughly 13×18 cells; a ⅜-inch path makes a cell about ½ inch, so roughly 20×28. Start near the small end and test.

## 7. Printing

- **Draw in SVG** at real size (11×17 inches, portrait or landscape), then print from the browser or save as PDF. One drawing list feeds both outputs (see `04 AI/lessons_pool.md`, "single source of truth").
- **Black and white first:** shades become patterns (dots, stripes, crosshatch). Avoid big solid black areas, which waste toner and leave nothing to color.
- **Leave room to color.** Large white shapes in the theme (stars, waves, bees) make the sheet a coloring page after it's solved.
- **Footer on every sheet:** "Felix Maze #001", the maze name, and one or two lines on where it's from and who inspired it.
- **Solution:** keep a separate answer page, or print it small and upside down. To decide.

## Sources

- Walter D. Pullen, *Think Labyrinth* (maze classification and algorithms), as cited in Xu & Kaplan: [cgl.uwaterloo.ca/jiexu/paper/xu_siggraph07.pdf](https://cgl.uwaterloo.ca/jiexu/paper/xu_siggraph07.pdf)
- Jie Xu and Craig S. Kaplan, "Image-guided maze construction", SIGGRAPH 2007: [cgl.uwaterloo.ca/jiexu/paper/xu_siggraph07.pdf](https://cgl.uwaterloo.ca/jiexu/paper/xu_siggraph07.pdf), and the related poster [cgl.uwaterloo.ca/poster/jie_GI06.pdf](https://cgl.uwaterloo.ca/poster/jie_GI06.pdf)
- Hans Pedersen and Karan Singh, "Organic labyrinths and mazes", NPAR 2006: [dgp.toronto.edu/~karan/pdf/mazes.pdf](https://dgp.toronto.edu/%7Ekaran/pdf/mazes.pdf); course assignment based on it: [isohedral.ca/teaching/cs-791-spring-2015/assignment-2](https://isohedral.ca/teaching/cs-791-spring-2015/assignment-2/)
- Craig Kaplan, "Mathematics and aesthetics in maze design" (talk): [csclub.uwaterloo.ca](https://csclub.uwaterloo.ca/events/2010/fall/Mathematics-and-aesthetics-in-maze-design/)
- Jamis Buck, *Mazes for Programmers* (Pragmatic Bookshelf, 2015): [oreilly.com](https://www.oreilly.com/library/view/-/9781680501315/)
- Comparative studies of generation algorithms: [journals.rta.lv](https://journals.rta.lv/index.php/HET/article/view/3508), [scitepress.org](https://www.scitepress.org/PublishedPapers/2025/143608)
- Labyrinth Society, "Labyrinth Typology" (Matthews' labyrinth/maze split): [labyrinthsociety.org](https://labyrinthsociety.org/?p=211)
- "Solve mazes by starting at the exit" (decoys and working backward): [statmodeling.stat.columbia.edu](https://statmodeling.stat.columbia.edu/?p=11809)
- Structured maze design with templates and plugs: [clickmazes.com](https://clickmazes.com/mazes/mdesign.htm)
- Kids' maze generator (difficulty by grid size): [univers.studio/maze](https://univers.studio/maze/); preschool maze sheets: [kidsacademy.mobi](https://kidsacademy.mobi/printable-worksheets/age-4-5/logic-and-early-math/mazes), [twinkl.com](https://www.twinkl.com/resource/preschool-pencil-control-maze-fun-za-kps-1739781087)

Not yet read in full: the Pedersen–Singh and Xu–Kaplan papers (only their abstracts and descriptions), and Pullen's site directly. Read them before building the organic generator.
