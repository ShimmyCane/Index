There are a bunch of files inside 04 AI folder. start with 04 ai_schematic.md.

Purpose of this skill/ action is for you to take a beat and consolidate your knowledge, log changes, archive old facts, and condense information.

## Consolidation workflow

1. Start with `04 AI/04 ai_schematic.md` to understand the existing AI notes and project organization. Inspect the active project's schematic, README, current implementation, and relevant lessons before writing a handoff.
2. Treat the project's current schematic/brief and verified implementation as the source of truth. Preserve conversation notes as historical records rather than deleting useful decisions.
3. When a later decision or implementation supersedes an earlier one, mark the earlier statement as historical/superseded and link or point to the current source of truth. Keep unresolved items distinct from decisions already made.
4. Update `04 AI/<Project Name>/brief.md`. Record verified current behavior, important architecture and data boundaries, latest validation evidence, known limitations, and actionable next steps. Label anything unverified; do not promote assumptions into facts.
5. Add project-specific implementation lessons to `04 AI/<Project Name>/lessons.md`. Only add global user preferences to `04 AI/Personal Preferences/`; place tool-specific lessons in `04 AI/Tools/`. Promote patterns that are reusable across projects to `04 AI/patterns.md`.
6. Update `04 AI/04 ai_schematic.md` when adding or moving AI reference files, and update `04 AI/ai_task_tracker.md` when the consolidation completes or changes tracked work.
7. Keep consolidation concise and avoid duplicating full project documentation. Do not delete or archive source notes unless the user requests it; make supersession clear in place.

Action - run other skills
summarize_code
update_lessons_learned