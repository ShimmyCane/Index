# Feedback Loop Workflow

Capture → Process → Consolidate. Use this workflow when a project page needs user feedback during early testing.

## Overview

The feedback loop has three stages:

1. **Capture** — testers use the page and leave notes (`/feedback-notes` UI in the app)
2. **Process** — Claude reads notes and turns them into project work (`/review-notes-and-update`)
3. **Consolidate** — log lessons and decisions (`/consolidate-knowledge`)

Each stage is a separate skill; run them in order.

---

## Stage 1: Plan & Build (in new project workflow)

Before testing starts, include feedback planning in `02 Refs/Workflow/new project workflow.md` step 4.

**Decision:** Does the project have a page that users will test?
- Yes → plan feedback capture below
- No → skip this workflow

**Capture plan in schematic:**
- Where will testers click to leave notes? (in ⚙️ panel)
- What items can they tag notes to? (a level, a card, a screen, a feature)
- Storage: device only, or sync to database when signed in?

---

## Stage 2: Capture — Build the feedback notes UI

**Run:** `/feedback-notes` (reference skill)

**What it does:**
- Builds an in-⚙️ "Notes for improvement" box for the app
- Saves notes to device (localStorage) with metadata (item, page, time, version)
- Optional: syncs to Supabase table for multi-device or family sign-in

**Copy the code:**
1. HTML form + textarea (in the schematic, under ⚙️ panel)
2. JS helper (saves/reads/filters notes per app)
3. CSS styles

**Test with `/smoke-test`:**
- Save a note, reload, note is still there
- Label matches the item
- Zero console errors

**Testers use:**
- Leave notes while using the page (don't guess later)
- Tag each note to the thing on screen it refers to
- Save and move on

---

## Stage 3: Process — Read notes and turn into work

**Run:** `/review-notes-and-update <project-name>` (after testers have finished)

**What it does:**
1. Reads all open notes from the Supabase table
2. Groups by item (level, card, screen)
3. For each note: decides if it's built, a bug, a feature, or a question
4. Writes results without changing old files:
   - New items in `todo.md`
   - Unanswered questions in `convo/convo vX.Y.md` (new round)
   - Status update in `04 AI/<Project>/brief.md`

**Input:**
- Project name (required)
- Status filter: `open` (default) or `all`

**Output:**
- Summary: how many notes read, how many are built, how many need an answer
- Convo file with questions for Jimmy
- Updated brief

**After review:**
- Jimmy says yes/no to each question
- Claude marks handled notes as done in the database
- Notes stay forever (never deleted) with status `done` and `Done- ` prefix

---

## Stage 4: Consolidate — Log lessons and patterns

**Run:** `/consolidate-knowledge` (after processing is done and work is built)

**What it does:**
1. Reviews what changed since the last round
2. Logs lessons: patterns that worked, surprises, decisions made
3. Promotes reusable patterns to `04 AI/patterns.md`
4. Archives or supersedes old notes

**Input:**
- Project folder (required)
- Notes on what changed, what surprised you

**Output:**
- Updated `brief.md` with verified facts
- Updated `lessons.md` with new lessons
- Promoted patterns in `04 AI/patterns.md` (if any)

---

## Full example: Expansion Wars feedback loop

1. **Plan** (new project workflow): feedback in ⚙️ panel; tag notes to map names
2. **Build** (`/feedback-notes`): HTML box + JS helper; test with smoke_test
3. **Test round 1:** testers play, leave notes on confusing maps
4. **Process** (`/review-notes-and-update xw_maps`): 12 notes, 3 built, 2 bugs, 7 feature requests
5. **Fix & merge:** work on bugs; plan features for later
6. **Consolidate** (`/consolidate-knowledge`): log that "early testers miss the goal description" → add hint in next round
7. **Test round 2:** testers play again, leave more notes; repeat

---

## Rules

- **Device first:** notes stay on device until the tester closes the browser or signs in. Network failures don't lose notes.
- **Never delete.** Notes stay in the table forever with status `done` and `Done- ` prefix. Deletion only happens if Jimmy asks in writing for specific rows.
- **Never auto-mark.** Only mark a note done when Jimmy confirms it's handled.
- **Testers' words.** Copy note text into convo/todo exactly as written. Don't edit, summarize, or guess.
- **Privacy:** notes are feedback from the tester; keep personal details out of convo and todo items.

---

## Related skills

- `/feedback-notes` — build the UI
- `/review-notes-and-update` — read and process notes
- `/consolidate-knowledge` — log lessons
- `/settings-gear` — the ⚙️ panel that holds the notes box
- `/smoke-test` — test that notes save and reload
