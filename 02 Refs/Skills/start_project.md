# Start Project

When the user asks to initialize a project:

1. Extract the project name from the user's request.
2. If not already there, Create:
   - `03 Projects/<PROJECT NAME>/`
   - `04 AI/<PROJECT NAME>/`
   - `03 Projects/<PROJECT NAME>/convo/`
   - If already present, review project files.
3. Create:
   - `03 Projects/<PROJECT NAME>/schematic.md`
   - `03 Projects/<PROJECT NAME>/CLAUDE.md`: short pointer file (purpose, where the schematic/convo/brief/lessons live, how to run it). See `02 Refs/Skills/claude_review_project.md` step 2.
4. If there's no file already. Create or append to the appropriate `03 Projects/<PROJECT NAME>/convo/convo v#.md`.
5. Review `02 Refs/Workflow/new project workflow.md`, and any project documents from 01 plan or the 03 projects/<PROJECT NAME> folder. Ask the user the clarifying questions required to proceed, use `convo/convo v#.#.md` as a way to record our conversations.
   - For a kids' or web app, ask whether it needs a ⚙️ settings button (options, error panel, database check). If yes, follow `02 Refs/Skills/settings_gear.md`.
6. Create a schematic.md file based on the project info.
7. Feedback notes: if the project has a page that the user plays or uses, plan the feedback feature in the schematic. It has three parts:
   - A notes box in the settings (⚙️) panel, labelled "Notes for improvement". Each note is saved with the item it is about (a map, a level, a screen) and the time.
   - A way to read the notes back, in the same panel or on a saved-items page, so the user can review them.
   - Notes are stored with the project's other data (device storage first; a database table only when the data must persist). Notes are never sent anywhere else.
   Add the feedback feature to the project's first increment, so feedback can start on the first build. Build it from `02 Refs/Skills/feedback_notes.md`.

Rules:
- Do not explain your reasoning.
- Do not infer a project name.
- Do not invent missing paths.
- Do not create files unrelated to these instructions.
- If any required information is unclear, ask the user.
- Execute the steps directly; do not describe hypothetical tool calls.