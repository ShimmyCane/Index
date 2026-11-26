---
name: supabase-setup
description: "Set up or update a project's Supabase database: inspect live schema, design tables and policies, apply migration directly. No manual SQL paste. Use when a new project needs a database or when changing schema."
argument-hint: "<project name>"
---

The source of truth for this skill is `04 AI/Skills/supabase_setup.md`, which Claude keeps as a working copy.

1. Read `04 AI/Skills/supabase_setup.md` in full.
2. Follow it exactly, applying the conventions in the root `CLAUDE.md` and `04 AI/Supabase/brief.md`.
3. Arguments passed to this skill: $ARGUMENTS

Edit the 04 AI copy when improving the skill. The 02 Refs file is a stub.

Merged from supabase_link and supabase_project on 2026-11-25. Streamlined workflow:
- Inspect live tables and policies with Supabase MCP tools
- Design and write the migration SQL
- Apply it directly (no manual paste, no rollback tests)
- Check security advisors
- Report what was created
