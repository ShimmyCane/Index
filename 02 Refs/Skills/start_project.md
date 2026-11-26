# Start Project

Mechanical setup only. See `02 Refs/Workflow/new project workflow.md` for decisions.

When the user asks to initialize a project:

1. Extract the project name. If unclear, ask.
2. Create folder structure (if not already there):
   - `03 Projects/<PROJECT NAME>/`
   - `04 AI/<PROJECT NAME>/`
   - `03 Projects/<PROJECT NAME>/convo/`
3. Create `03 Projects/<PROJECT NAME>/CLAUDE.md` (pointer). Template:
   ```
   # <PROJECT NAME>
   
   - **Schematic:** `schematic.md` (design and requirements)
   - **Convo:** `convo/` (Q&A rounds, never compacted)
   - **AI notes:** `04 AI/<PROJECT NAME>/` (Claude's working folder)
   ```
4. Create `03 Projects/<PROJECT NAME>/schematic.md` (empty scaffold):
   ```
   # <PROJECT NAME>
   
   Track: (will be filled in during planning)
   
   Purpose: (one sentence)
   
   Status: idea
   ```
5. Create `03 Projects/<PROJECT NAME>/convo/convo v0.1.md` (empty, ready for Q&A).
6. Add a tile to `index.html` Nursery list (once there is a page that opens). Do this in the same change as the first build.

Rules:
- Do not create AI notes files; they live in `04 AI/` only when there is work to log.
- Do not add home page tile until the project has a runnable page.
- Do not infer project name; ask if unclear.