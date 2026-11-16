# Better Parenting — Schematic

Status: MVP 0.1.0 (headless-tested; not device-tested; family tables written, not yet applied)
Track: A. Family play, used by a parent. It follows the family look and keeps everything secondary in ⚙️, but it carries more words than a child's game because the reader is an adult.

## Purpose
A place for a parent to practise and refresh parenting skills for children from kindergarten to grade 5. Each year the child changes and the skills must be relearned. The page offers many concrete scenarios, the general approach for each topic by developmental stage, a toolkit of named skills from published programmes, and a way to write a scenario of your own as specifically as you like.

## Track defaults
| Setting | Value |
|---|---|
| Words on screen | short cards; one idea per coloured block |
| Options visible | grade chips, search, Saved |
| ⚙️ holds | my kids' grades, practice size, text size, errors, notes, family sign-in, practice record, version |
| Panels | six collapsible panels; Practice and Scenarios open, the rest closed |
| Palette | Family Habits look: ink, paper and sun; offset shadows; asymmetric corners; polka dots |
| Database | Family project, family sign-in |
| Private data | grades, answers and own scenarios stay on the device or in the family database; never in the repo |

## Content model (`data/`)
- **Stages** (3): Kindergarten, Grades 1 to 2, Grades 3 to 5. Each has what is changing, what they need, what is hard, and the parent's shift. A grade maps to one stage.
- **Topics** (16): big feelings, listening, mornings, bedtime, school, friends, siblings, screens, worries, honesty, responsibility, body/food/safety, hard news, out and about, confidence, you the parent. Each has a general plan and one note per stage.
- **Skills** (18): each from a named source (emotion coaching, Plan B, labeled praise, SPACE, growth mindset, the 5 Cs, repair, the parent pause...).
- **Scenarios** (144): title, stages, topic, situation, what is going on, three steps for the moment, what to say, what to avoid, what to do later, skills.
- **Library** (31 links): videos and articles tied to skills and topics, plus a YouTube search link per scenario, skill and topic.
- Sources and how the content was gathered: `research/sources.md`.

## Screens
1. **Filters**: grade chips (All, ★ Mine, K, G1 to G5), search, ⭐ Saved.
2. **🎯 Practice**: a set of 1, 3 or 5 scenarios from the current filter. Read the situation, write (or think) your answer, compare with the coach card, rate yourself (not yet / close / got it). Not yet returns in 2 days, close in a week, got it in a month. Due ones come first, then unseen ones.
3. **🔎 Scenarios by topic**: topic tiles; a chosen topic shows its general approach by stage; the scenario list; a scenario opens as a sheet.
4. **✍️ My own scenario**: title, what happened, grade, topic. A plan is built from the topic and the stage. An AI prompt can be copied; the pasted reply is checked before it replaces the plan, with undo (`02 Refs/Skills/ai_json_loop.md`). The page never calls an AI service.
5. **🧰 Toolkit**, **🌱 Stages**, **📺 Watch and read**.
6. **🫁 One minute for you** (lower left): a breathing circle and three steps, for when patience is gone.
7. **⚙️** (lower right).

## Feedback notes
"Notes for improvement" in ⚙️ (`02 Refs/Skills/feedback_notes.md`). Each note is saved with the scenario or skill on screen. Device first; also to `bp_notes` when signed in.

## Data storage
- Device (local storage, try/catch): settings, saved scenarios, practice record, own scenarios, notes, panel states, session.
- Family database (Family project), when signed in: `bp_notes`, `bp_scenarios` (own scenarios, newer copy wins), `bp_practice` (append-only). RLS on, anon revoked, family sign-in only. SQL in `supabase/`.

## Open questions
See `convo/convo v0.1.md`.
