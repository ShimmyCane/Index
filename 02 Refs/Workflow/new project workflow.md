# New Project Workflow

After `/start-project` creates the folders and scaffold, follow this workflow to plan the project. Record everything in `convo/convo v0.1.md` as you go. Update `schematic.md` as decisions are made.

## 1. Ask clarifying questions

Review `02 Refs/Workflow/` and `04 AI/` for relevant past projects. Ask Jimmy:

- **Who will use this?** (the family, a child, a client, the design team)
- **What is the core action?** (play a game, build a 3-D model, solve a puzzle, store data, review notes)
- **Is there a data persistence need?** (device storage only, family database, client archive)
- **Are there special interactions?** (gestures on iPad, keyboard for CAD, voice input, multiplayer)

Record answers in the convo. If anything is unclear, ask a follow-up round.

## 2. Choose the track

Read `02 Refs/Workflow/project_track.md` (decision guide). Decide one:

- **Track A. Family play** (games, activities): bold graphics, few words, main action centered, everything secondary in ⚙️, pastel palette
  - Then read `02 Refs/Workflow/family_project_track.md` for UI defaults, palette, database, and skills
- **Track B. Studio design** (architecture, 3-D, specs): dense information, full labels, keyboard/pointer, paper-and-ink palette
  - Then read `02 Refs/Workflow/architecture_project_track.md` for UI defaults, palette, database, and skills

If the project does both, pick the main user's track. Record the choice in `schematic.md` and the convo.

## 3. Plan the database (if needed)

If the project stores data beyond the device:

- **Family projects (Track A):** link to Family Supabase project. Use `/supabase-setup` to design tables, policies, and test migrations. Reference: `03 Projects/中文笔画/supabase/001_zhbh_notes.sql`.
- **Architecture projects (Track B):** link to Architecture Supabase project. Use `/supabase-setup`.
- **No database:** storage stays on device only (localStorage, IndexedDB).

Record the plan in `schematic.md` and in `04 AI/<Project>/brief.md`.

## 4. Plan feedback notes (if page is interactive)

If the project is something the family or a user will play/interact with, plan feedback capture:

- Read `02 Refs/Skills/feedback_notes.md`.
- Decide: device storage first, or database (for multi-device sync).
- Add feedback notes box to ⚙️ in the first build.
- Record in `schematic.md`.

## 5. Plan game controls (if it's a game)

If the project has movement, steering, or aiming:

- Read `02 Refs/Skills/game_controls.md`.
- Apply: drag relative to center (or joystick option), action buttons lower right, ⚙️ upper right and faded.
- Record in `schematic.md`.

## 6. Fill in the schematic

Update `03 Projects/<Project>/schematic.md` with:

- **Track:** A or B
- **Purpose:** one sentence from the clarifying questions
- **Status:** idea (now), MVP (after first working build), device-tested, in use, graduated
- **Main pages:** what the user sees and does
- **Database plan:** if any
- **Feedback plan:** if any
- **Controls plan:** if applicable
- **Palette & defaults** (from track choice)
- **Open questions:** anything still unclear

## 7. Ready to build

The project is ready when:

- Clarifying questions are answered
- Track is chosen
- Database (if any) is planned
- Schematic has the main pages and status set

Start with the MVP: the minimum page that lets the user do the core action once. Leave everything else for later. Use `/consolidate-knowledge` after each build round to log lessons and update briefs.

