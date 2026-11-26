Purpose:
The nursery for small programs. Each one is a seed that starts here. When it matures, Jimmy copies it into its own repo by hand and builds it up there. Projects are independent of each other.

Per-project layout:
- schematic.md — design and requirements
- convo/ — clarifying Q&A, one file per round (`convo vX.Y.md`), never compacted
- CLAUDE.md — short pointer file for Claude Code (added by `/start-project` or `/claude-review-project`)
- the app or code itself
- AI notes live in `04 AI/<Project>/`

Status key (set one per project):
idea → MVP → device-tested → in use → graduated (copied to its own repo) → retired

Schematic (updated 2026-11-25):

Main website (not a seed):
- Index/: this project folder is for the main website. Styles and scripts of the home page (root `index.html`), its code summary, and rules for changing it. (`schematic.md`, `CLAUDE.md`, `css/`, `js/`, `index_summary.html`)

Nursery projects:
- Shimmy Specs/ — status: MVP built (phases 0–4 and P2–P4 in `mvp tasks.md`; P1 summary page not run); accounts and cloud saving built (convo v0.3). A web app that guides the process of writing CSI specs: project summary, code analysis, keynotes and PPD drive the section list; each section gets a schematic of questions; decisions keep their alternatives and impacts; then a three-part draft. Database: Architecture project, six `ss_` tables, all indexed in `table_index`. Open: first section template (roofing), Jimmy's config values in `index.html`, Google/Microsoft sign-in later. Body of knowledge in `knowledge/`, goals in `todo.md`, MVP design in `mvp schematic.md`, build list in `mvp tasks.md`, questions in `convo/convo v0.3.md`. (`schematic.md`, `CLAUDE.md`, `convo/`, `supabase/`)
- Cheetah Simulator/: status: MVP 0.4.0 (2026-11-26; stages 1 and 2 playable). Track A. A game where a child lives a cheetah's whole life, ten minutes a stage, with a world roll that changes each life and a look that grows up with the cheetah. Female and male paths are designed, not built. Research in `research/`; questions in `convo/convo v0.2.md`; next items in `todo.md`. (`index.html`, `schematic.md`, `CLAUDE.md`, `todo.md`, `research/`, `convo/`)
  - V2 Gibbon Swing/: idea; started 2026-11-25, nothing built. Track A. Swing and jump through the canopy.
  - V3 Sea Turtle Race/: idea; nothing built. Track A. Hatchlings race from nest to sea.
  - V4 Golden Eagle Dive/: idea; nothing built. Track A. Ride rising air, aim and dive.
  - Each has `schematic.md`, `CLAUDE.md` and `convo/` (no research folder yet).
- Massage Map/ — status: MVP, build 0.1.0 (2026-11-25; foot map, EN and 中文 technique sets; placeholder drawing). A picture-first massage guide: tap a body part (foot first: sole, top, side, ankle), zoom in, watch a looping film of press points, direction and heat, read a wiki of research with links, and 1 to 5 star ratings for Ying and Jimmy. Track A. Not medical advice. Questions in `convo/convo v0.1.md`. (`schematic.md`, `CLAUDE.md`, `convo/`)
- Salmon Leap/ — status: V1 to V5 built (2026-11-18). A bronze statue of an Atlantic salmon leaping up, in five versions: narrative and massing, refined narrative and set-up, concept and details seen from every side, details, the ground. V10 (movement, rendering, atmosphere) and V15 (sound) are planned. Track B. Questions in `convo/convo v0.1.md`. (`index.html`, `js/`, `tools/`, `samples/`, `research/`, `schematic.md`, `CLAUDE.md`, `todo.md`, `convo/`)
- Drafting/ — status: MVP 0.2 (2026-11-18; DXF blocks, line types (.LIN), hatch patterns (.PAT), ortho dimensions, linter, separate line-type and hatch viewers; 19 Node tests and ezdxf audit pass; not opened in AutoCAD or Revit yet). Tile on the Nursery list. An asset generator for drawings: reads a detail or a Make-3D model from the architecture library (read only), interprets it as 2-D, and exports DXF blocks, `.LIN` line types, `.PAT` hatch patterns and 3-D DXF meshes for AutoCAD and Revit, with a linter (legibility score) and a DXF viewer. Track B. Research on DXF, LIN, PAT and Revit import in `research/`. Questions in `convo/convo v0.1.md`. (`schematic.md`, `CLAUDE.md`, `research/`, `convo/`)

Notes:
- Graduated to their own repos (history stays in git). All are under `ShimmyCane/`.
  - 2026-11-10 and earlier: Athena-s-world, Bar-Glide, Chinese-Character-Sudoku, Voice, What-to-Cook, Expansion-Wars, Felix-Maze, Fishes, Make-3D, Growth (with Paper Again), Increment-Viewer.
  - 2026-11-24: Adventure, Better-Parenting, Critique-Detail, Felix-Gear-Wars, Generate-Clouds, Our-Family-Compass, Paper-Airplanes-x-A-10-Warthog, Rhythm-Sticks, Chinese-Character-Strokes (中文笔画).
  - 2026-11-25: Athena-s-Piano-Companion, Felix-Continents, Felix-Stickers, Make-3D-x-Construct, Mind-Palace, QC-keynotes.
  - Steps for the next one: `/graduate-project`. Their AI notes: `04 AI/Graduated/`. Their third-party parts stay listed in `THIRD-PARTY.md`.
- Home page: the six 2026-11-25 graduates now link to their own sites, under Games, Learning and Architecture.
- The root `index.html` lists nursery projects in its Nursery section. Add a tile when a project gets a page.
- This repo is public. Keep private data out of every project. See `CLAUDE.md`.
- When new projects are added, add an entry here describing their intent and location.
