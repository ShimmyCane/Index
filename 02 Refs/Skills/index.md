Purpose
- This folder will be skills that we work on together.

Skills:
- start_project: Initializes a new project by setting up project folders, creating a schematic, and building an MVP.
- ipad_website: Guides the design of kid-friendly iPad web apps with light pastel colors, bold graphics, large touch targets, and minimal menus.
- summarize_code: Generates a visual summary file that maps out the main code structure and explains key variables.
- update_lessons_learned: Reviews and logs lessons learned across projects, personal preferences, and tools.
- simplify_code: Breaks large files into separate css/js/html and simplifies logic, then runs summarize_code.
- ai_consolidate: Pauses to consolidate knowledge, log recent changes, archive outdated notes, and condense information.
- claude_review_project: Brings an existing project up to current conventions (project CLAUDE.md, convo/ folder, brief, lessons) and extracts reusable patterns.
- supabase_project: Sets up or changes a Supabase project: inspects the live schema, prefixes and registers tables, enables RLS, and tests in a rolled-back transaction. Conventions in `04 AI/Supabase/`.

Claude Code:
- These files are the source of truth. Each one has a thin wrapper in `.claude/skills/<name-with-hyphens>/SKILL.md`, so it can be run as `/start-project`, `/ai-consolidate`, etc.
- When adding a skill here, also add its wrapper (or ask Claude to).
