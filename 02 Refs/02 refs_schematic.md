Purpose:
This folder tracks preferences, references, sources and other human-based logic.

Updated 2026-11-25.

Schematic:
- 02 refs_schematic.md: this index.
- Skills/: skills we work on together. These files are the source of truth (eight are stubs that point to working copies in `04 AI/Skills/`). `.claude/skills/<name>/SKILL.md` wrappers run them as `/name`.
  - index.md: the full list. Start here.
  - Active here: ai_consolidate, ai_json_loop, bake_cache, claude_review_project, feedback_loop, graduate_project, ipad_website, pc_website, privacy_check, research_topic, simplify_code, start_project.
  - Stubs: access_requests, game_controls, monthly_checkup, remix, settings_gear, smoke_test, summarize_code, supabase_setup.
  - deprecated/: retired skills, listed in `deprecated/index.md`.
  - scripts/: privacy_scan.sh, sql_paste_check.py; anim_capture.js, frames_to_gif.py and sticker_cut.py (only retired skills use these).
- Workflow/: how to plan a project. Not runnable skills.
  - new project workflow.md: the planning steps after `/start-project`.
  - project_track.md: choose Track A or B; shared collapsible-panel code.
  - family_project_track.md: Track A defaults.
  - architecture_project_track.md: Track B defaults.
  - The feedback loop is now one skill, `Skills/feedback_loop.md`.
- Templates/: reserved for reusable templates (holds an empty `css/` folder). Candidates are tracked in `04 AI/patterns.md`.

Related elsewhere:
- Personal AI and design preferences: `04 AI/Personal Preferences/jimmy_preferences.md` (loaded automatically through the root `CLAUDE.md`).
- pm_check lives with its project: `03 Projects/Shimmy Specs/.claude/skills/pm_check.md`.

Notes:
- Keep human-written preferences and references here; use this folder for stable, manually curated material.
- Let's minimize AI actions here. Claude edits only when asked.
