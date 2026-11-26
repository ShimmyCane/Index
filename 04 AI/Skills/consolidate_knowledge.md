# Consolidate Knowledge (unified review and lesson logging)

Purpose
Take stock of work done: consolidate what was learned, update project briefs, record decisions, promote reusable patterns, and preserve history. Merged from `update_lessons_learned` + `ai_consolidate` for one streamlined workflow.

Steps

1. **Review the work done**
   - Start with `04 AI/04 ai_schematic.md` to understand current project organization
   - If project-specific work, read its `schematic.md`, `brief.md`, and latest convo file
   - Identify what changed, what was verified, what is still uncertain

2. **Update project brief** (if project-specific)
   - File: `04 AI/<Project Name>/brief.md`
   - Record: verified current behavior, architecture, data boundaries, validation evidence, known limitations, next steps
   - Label anything unverified; do not promote assumptions to facts
   - File: `04 AI/04 ai_schematic.md` — update if any AI reference files were added/moved
   - File: `04 AI/ai_task_tracker.md` — update if work is complete or tracked work changed

3. **Extract and file lessons learned**
   - **Project-specific:** append to `04 AI/<Project Name>/lessons.md`
   - **Global preferences:** save to `04 AI/Personal Preferences/jimmy_preferences.md`
   - **Tool-specific:** save to `04 AI/Tools/<tool>.md`
   - **Cross-project patterns:** promote reusable patterns to `04 AI/patterns.md` with reasoning and sources

4. **Archive and mark supersessions**
   - When a later decision supersedes an earlier one, mark it as historical/superseded in the source file
   - Link or point to the current source of truth
   - Keep unresolved items distinct from completed decisions
   - Never delete notes unless Jimmy requests it in writing

5. **Keep it concise**
   - Avoid duplicating full project documentation
   - Focus on decisions, changes, and next steps, not narrative

Input
- Project folder (under `03 Projects/`), or "nursery-wide" for cross-project consolidation
- Optionally: specific files to review or update

Report
- What was consolidated (projects, tools, patterns reviewed)
- Key decisions finalized
- Patterns promoted to `04 AI/patterns.md`
- Any changes to briefs or schematics
- Unresolved items remaining

Rules
- Preserve conversation notes as historical records; mark what supersedes them, don't delete
- Never promote assumptions to facts; label what is unverified
- One brief per project; keep it current, not archived
- Lessons flow up to pools and patterns; don't duplicate between files
