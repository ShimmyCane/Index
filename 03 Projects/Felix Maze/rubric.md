# Felix Maze — What makes a sheet a joy

A maze is three moments: **looking** at it before starting, **doing** it, and **solving** it. Each one should feel good. This rubric is how we judge a sheet, by eye and with the computer's help. It's a way to make the mazes more fun, not a test of Felix.

There's no single standard rubric for mazes. Researchers who study maze difficulty use a few measures again and again: how long the right path is, how many choices there are along it, how deep the wrong turns go, and how much wrong-turn there is compared with right path (the "confusion ratio"). They also point out that a long maze with no real choices is boring, and that dead ends have to be long enough not to be obvious. Those measures are in the Difficulty section. The joy parts come from puzzle-design common sense and from watching Felix.

## 👀 Looking: does it invite you in?

| Sign | Good | Not so good |
|---|---|---|
| Room to breathe | White space all around; the maze sits in the middle like a picture | Walls run to the edge of the page |
| Calm lines | Bold, friendly lines, a little hand-drawn | Dense stitching, "sewing machine" texture |
| A clear story | You can see who starts and where they're going | Start or goal hard to spot |
| Pencil room | Paths wide enough to draw in without touching the walls | Tight paths that make small hands squeeze |
| A picture worth looking at | The shape or theme is fun on its own (a web, swirls, a figure) | Just a box |

Computer's guess: how much of the page the maze covers, how wide the paths are, how much line per square inch, and whether the answer line stays clear of every wall.

## ✏️ Doing: is it fun to work through?

| Sign | Good | Not so good |
|---|---|---|
| Real choices | A fork every few steps, and both ways look possible | Long hallways with nothing to decide |
| Fair wrong turns | Wrong turns go somewhere for a while, then gently stop | Many tiny stubs, or wrong turns so long they wear you out |
| The path wanders | The way through visits the whole picture | It hugs one corner |
| Things to find | Treats on the way (crumbs, drops, leaves, stars), a bridge, a friend | Nothing to notice |
| No working backward | Tempting branches near the finish too | Starting at the goal makes it trivial |

Computer's guess: choices per step on the right path, confusion ratio, the longest dull stretch, and how much of the maze the path covers.

## 🎉 Solving: is there a payoff?

| Sign | Good | Not so good |
|---|---|---|
| A goal that belongs | The mouse gets the cheese, the bee gets the flower | An arrow to a dot |
| A surprise | Bridges, a shape revealed, a swirl that becomes a sky, treats he collected | Just "the end" |
| Pride | Hard enough that he says "I did it!" | Too easy to notice, or so hard he gives up |
| Something to tell | The footer has one fun fact for you to read to him | |

Computer's guess: does it have a story (start and goal), a special mechanic (bridges, a shape, rings, swirls), and treats.

## Difficulty, 1 to 5

| Level | Feel |
|---|---|
| 1 | A warm-up. Big paths, a few turns |
| 2 | A few real choices |
| 3 | Several forks, a loop or two |
| 4 | Long wrong turns, more loops |
| 5 | A big one, for a long quiet sit |

The computer measures: right-path length, choices along it, total and longest wrong turns, loops. It turns those into an "effort" number and a guessed level, and the sheet's level must match the guess (`tools/check_sheets.js`). The target times are guesses until Felix tries them.

**Calibration:** Jimmy judged the old 330-00A (0.54 in cells, effort about 2.2) to be a level 2. The level boundaries on effort are 1.35 / 2.65 / 3.75 / 4.9, so level 2 is the middle of the everyday range and level 2.5 is the middle of the whole bank. The bank is shaped as a bell curve around 2.5: about 20% level 1, 35% level 2, 28% level 3, 12% level 4 and 5% level 5.

## Felix's sweet spot

On each sheet, ⚙️ has three faces: 😴 too easy, 😊 just right, 😣 too hard, and an optional minutes box. The last five faces set his **sweet spot**. "Just right" keeps that level, "too easy" points one up, "too hard" one down. The Library's **Just right for Felix** button shows mazes at that level, and Make a maze starts there. Mix in an easier one now and then, just for the fun of zooming through.

## Using it

- Every new maze: the computer check must pass (answer clear of walls, level guess matches). Make a maze does this by itself: it grows several versions and keeps the best clean one.
- Then a look by eye: the three moments above, and `qc.md` for anything sensitive.
- After Felix tries it: tap a face. Over time, his reactions are what tunes the scores and the target times.

## Sources

- Maze metrics (dead ends, junctions, solution length; long solutions can still be boring): [perso.limos.fr](https://perso.limos.fr/~palafour/PAPERS/PDF/labyrinthe.pdf)
- Factors in solving time (solution length, paths crossing it, dead ends, longest dead end, size): [apps.dtic.mil](https://apps.dtic.mil/sti/pdfs/ADA170651.pdf)
- Trade-off between solution length and dead ends, which must not be obvious: [revk.uk](https://revk.uk/2019/01/maze-complexity.html)
- Decision points, dead-end density and the confusion ratio as difficulty knobs: [arXiv 2606.22219](https://arxiv.org/pdf/2606.22219)
- Difficulty is partly subjective; structure still matters: [earlham.edu](https://portfolios.cs.earlham.edu/wp-content/uploads/2022/01/MazeLitReview.pdf)
- Beyond solvability and distance, many features matter: [modelai.gettysburg.edu](https://modelai.gettysburg.edu/2010/rjmaze/evaluation2.html)
