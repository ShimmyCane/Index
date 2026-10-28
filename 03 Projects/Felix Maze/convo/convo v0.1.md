# Felix Maze — Convo v0.1

**Project:** Felix Maze
**Round:** 1 of clarifying questions (started by `/start-project`)
**Read first:** `inspirations.md` (100 maze types), `maze_research.md` (what makes a good maze), `variations.md` (knobs to turn), `todo.md`

Answer inline under each number. Leave a question blank if you don't know yet.

## What Jimmy asked for (summary)

- Felix loves drawing mazes, and his are free-flowing and organic. Make mazes for him without boxing him into one idea of what a maze is: give him many different styles and experiences.
- Start from inspiration: art and great artists across eras, nature of all kinds (animals, geometry, geography, geology), systems, networks and patterns, music and frequencies, and famous and classical mazes (English hedge mazes and others).
- Files: inspirations (a list of 100 maze types, sorted and filtered by geometry, line work, density and pattern), research on what makes a good maze, and variations (line weight, color, solid walls, bridges, twists, interactive).
- Interactive mazes: in the back pocket for now (`todo.md`).
- First goal: 10 good mazes, printed black and white on 11×17 and handed out like worksheets. Long-term threshold: 365.
- Each sheet: the title "Felix Maze" and a number, plus a snippet at the bottom on where it's from and who inspired it.
- Later: a page where Felix doodles a few lines (like Quick Detail), the computer makes a few mazes, he picks one and it's saved as another numbered maze.
- Data in the Family Supabase project as a set of tables for this project.
- Graphics welcome: mouse and cheese, goblins, and other characters and approaches.

## Felix and privacy (public repo)

1. Felix's first name is in the project name and every sheet. Is it OK for it to be public here, as with Felix Checkers?

> **Jimmy:** Ok

2. Can his age appear in public files? I've left it out so far and written "young solver".

> **Jimmy:** Not ok

3. Is it OK to store photos or scans of his own hand-drawn mazes? They would go in `private/` (not committed) unless you say they can be public.

> **Jimmy:** Yes


## How he solves

4. Does he solve with a pencil, crayon, marker or finger? (Sets path width.)

> **Jimmy:** Took _(unclear; read as pencil, see convo v0.2)_

5. Can he read yet? Should sheets use words, or pictures only, with words for you to read to him?

> **Jimmy:** _(grade level left out: age stays private, per question 2)_ Minimize words, unless they are part of the maze or puzzle.

6. Roughly how long should one maze take him: 2 minutes, 10, 30?

> **Jimmy:** Different difficulty. Group them by time to solve.

7. Should the 10 sheets get harder from #001 to #010, or be mixed?

> **Jimmy:** Mixed bag.


## Choosing the first 10

8. Look at "Proposed first 10" at the end of `inspirations.md`. Keep, swap or drop any? I took "keep hearing" to mean Keith Haring (#25). Right?
9. Any entries in the 100 you'd remove, or kinds I missed?
10. A recurring character for the whole series (a mouse, a goblin, a little explorer), or a new character on each sheet?

> **Jimmy:** That's a great question. Let's start with introducing some characters. Track via an md file. Felix the cat for one.


## The sheet

11. 11×17 portrait, landscape, or chosen per maze?

> **Jimmy:** 8.5×11 landscape.

12. Footer: "Felix Maze #001 · Starry Night · Inspired by Vincent van Gogh, *The Starry Night*, 1889" plus one fun line ("He painted it from his window at night"). Right amount, or more or less?

> **Jimmy:** Perfect.

13. Add a "Solved by ____ on ____" line and difficulty stars?

> **Jimmy:** No.

14. Answer key: a separate page, small and upside down on the sheet, or none?

> **Jimmy:** No answer key on print. The settings button will show the answer key (small) as a jpg within. Also give me a page in which I can type in the puzzle number, and it will display the answer as an animation.

15. Leave big blank shapes so the sheet becomes a coloring page after solving?

> **Jimmy:** No.


## How we make them

16. I suggest a generator web page in this folder (plain HTML/JS, no build). It draws each maze as SVG at real 11×17 size, you print it from the browser or save a PDF, and each maze's recipe (style, seed, settings) is saved so it can be remade. OK?

> **Jimmy:** Yes.

17. Do you want to tweak each maze by hand before printing (move the start, reroll, thicker walls), or just pick from a few generated options?

> **Jimmy:** Well, I do want you to create a bank of those places, but for those that are generated based on a seed sketch, yeah, I want to have some options to test out before publishing.

18. Numbering: one series shared by the mazes we make and the mazes Felix makes, or separate (e.g. #001 and F-001)?

> **Jimmy:** I will defer to you on how you want to organize the catalog. I think it'll be interesting if we use hex numbers with digits that represent categories, complexity, manual or automatic, and a counter.


## Doodle to maze (later)

19. When Felix doodles lines, what should they become? (a) the outline the maze fills, (b) the right path the maze hides, (c) walls or rivers the maze must keep, (d) let him choose each time.

> **Jimmy:** I don't know. I think the purpose of multiple iterations is maybe using the seed and viewing it, just like you said, as walls, as the solution, as major obstacles, as different approaches, and show the puzzles with different themes or optical guides.

20. iPad with a finger, Apple Pencil, or both?

> **Jimmy:** Both.

21. How many options should the computer offer: 3?

> **Jimmy:** Five. And the options shouldn't be complete. Think of them as spring, just a little bit past the seeds. Once I select one or two to bake, they will be fleshed out into more mature summer mazes. At that time, it would be logged to the database with its answer key and animation.


## Supabase (later)

22. Use the shared **Family** project with tables prefixed `fmz_` (for example `fmz_mazes`, `fmz_styles`, `fmz_doodles`) and registered as app `felix-maze`? Or a different prefix?

> **Jimmy:** I like it.

23. Should the mazes in the database also be visible from a simple gallery page (all mazes, by number)?

> **Jimmy:** Yes, I like that too. Maybe a page to browse like a library of all the mazes, with a minified version of the JPEG. Quick Detail has a detail library component pulling from the architecture database. I wonder if you can borrow that to display the mazes generated from the library, with tags based on difficulty and theme. I could use that as a way to improve the library functionality.


## Anything else

24. Anything that should be left out or never happen (scary goblins, certain themes)?

> **Jimmy:** This will be an elementary-school-level maze, so no sensitive topics, no age-inappropriate topics, no politics. We should have a pass at this. Add a to-do: a quality control pass where we eliminate potentially sensitive patterns or risky images generated.

25. Is there a date or occasion you'd like the first 10 ready for?

> **Jimmy:** I don't really have one. The first 10 is just a test. I'll probably run the first 200, with a couple of each theme, and then we will expand on the themes and the library over time. For now, start with 10 and give me a good range and variety to get a sense of it.


---

_Answers go in this file inline. Next round: `convo/convo v0.2.md`._

## Follow-up from Jimmy (same round)

- Save the research in a `research/` folder: copies of the pages (PDFs) to look at, and an HTML explainer in the same graphic style, to be linked later from the maze page's ⚙️ settings. It should show what Claude was thinking at the time and what else to explore, to help Jimmy branch out.
- Jimmy's thought: every kid has a soft spot for mazes. It's fun to get lost. Like a coloring book for grown-ups, it quiets the mind.

Done: `research/index.html` (explainer with a live maze lab, stacked panels, "Explore next", sources).

26. Saved copies of the papers and pages are other people's work, and this repo is public, so I planned to keep them in `research/private/` (not committed). Is that OK, or do you want them somewhere else (for example Google Drive)?
27. The cloud session's network blocked `cgl.uwaterloo.ca` and `dgp.toronto.edu`, so no copies were saved yet. Add those hosts to the environment's allowed domains, or download the two PDFs yourself?
