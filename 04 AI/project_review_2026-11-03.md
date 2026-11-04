# Nursery Project Review — 2026-11-03

Scope: all six projects in `03 Projects/`, their `04 AI/` notes, the shared lessons, and the ⚙️ settings work. Done by reading the files; nothing was run on a device, and nothing was promoted or committed.

Status key (from `03 projects_schematic.md`): idea → MVP → device-tested → in use → graduated → retired.

## 1. Promotion readiness

No project has reached **device-tested** yet, so none meets the nursery's own bar for graduating. The two closest are below. Promotion is done by hand by Jimmy, so these are recommendations.

| Project | Status now | Ready to graduate? | What is needed first | Privacy / scope notes |
|---|---|---|---|---|
| Chinese Character Sudoku | MVP v0.5 | **Closest.** Static app, no database, offline data. Three games verified headless with no console errors. | Real iPad test (touch, Apple Pencil, audio, Kai font). Jimmy's open items in `convo v0.6.md`. | Convo files are public in this repo. Check them before moving them. Child details stay out. |
| Make 3D | MVP v0.1–v0.6 | **Close.** Works from `index.html` (file://), Node tests pass, no database needed for the MVP. | Real iPad check. Jimmy confirms convo v0.3 Q1–Q6 (several build choices are still unconfirmed). Leave the cloud copy out until the SQL is approved. | None found. |
| Felix Maze | MVP round 6, 244 active puzzles | Not yet. Large and well tested in Node, but nothing has been printed or tried with Felix. | Print the test pack, then QC on paper. Decide what happens to the family-database flags (`fmz_flags`), which the public version can't depend on. | `research/` holds copies of papers. Keep copies in `private/` (the rule is in `lessons.md` but not yet checked). The historical-artists-only rule is in the data. |
| Adventure | MVP, database not applied | No. Tables not applied; real sign-in and RLS unverified. | Apply migrations, test RLS and rollback, then device test. | **Family content** (story world, roles, the family login). Likely belongs in a private repo, not this public one. Jimmy to decide. |
| Shimmy Specs | MVP framework, Supabase SQL not applied | No. | Desktop and iPad checks, then GitHub Pages. Confirm the knowledge notes are our own wording (a sample is). Confirm no office project data. | Architect practice material. The `knowledge/` notes must stay in our own words, and any licensed text goes in `private/`. Jimmy to decide where it lives. |
| Athena's world | idea | No. | Questions in `convo/convo v0.1.md` are still unanswered. | Only convo and schematic; nothing to promote yet. |

Recommendation: after the iPad test, graduate **Chinese Character Sudoku** first, then **Make 3D**. Felix Maze follows its print test.

## 2. Combined lessons

Merged into `04 AI/lessons_pool.md` (new entries marked by source). The new **§10 Settings button (⚙️)** and the new Felix, Chinese Character Sudoku, Adventure, Shimmy Specs and Make 3D lessons are there. Patterns are in `04 AI/patterns.md`. The settings build rules are in `02 Refs/Skills/settings_gear.md`.

## 3. Changes made in this review

- New skill: `02 Refs/Skills/settings_gear.md`, with wrapper `.claude/skills/settings-gear/SKILL.md` (`/settings-gear`). The starter JS was syntax-checked with `node --check`. It was not run in a browser.
- `02 Refs/Skills/start_project.md`: step 5 asks about a ⚙️ settings button for kids' or web apps; step 6 builds the schematic's settings from `settings_gear.md`.
- Index and pointers: `02 Refs/Skills/index.md`, root `CLAUDE.md` skill list, `Personal Preferences/jimmy_preferences.md` (one pointer line), `patterns.md` (gear pattern and template candidate 1).
- `patterns.md`: fixed two broken pointers (`profile_and_directions.md`, which does not exist; the Supabase folder is `04 AI/Supabase/`).

## 4. Open items for Jimmy

1. Decide where Adventure and Shimmy Specs live: a private repo, or kept out of the public nursery.
2. Check the convo files of Chinese Character Sudoku before it graduates. They are public here.
3. Answer Make 3D convo v0.3 Q1–Q6, and approve or decline the cloud-copy SQL.
4. Felix Maze: check `research/` for copied papers, and say what happens to `fmz_flags` in a public copy.
5. Confirm `settings_gear.md` matches the look you want (the snippet uses a yellow gear and the same offset shadows as the other apps).
6. Nothing is committed yet. Say the word and it goes on a branch.
