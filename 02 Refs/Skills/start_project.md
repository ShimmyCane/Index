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
6. Create a schematic.md file based on the project info.

Rules:
- Do not explain your reasoning.
- Do not infer a project name.
- Do not invent missing paths.
- Do not create files unrelated to these instructions.
- If any required information is unclear, ask the user.
- Execute the steps directly; do not describe hypothetical tool calls.