---
name: fix-puzzles
description: "Review puzzles flagged for rework (🚩 on a Felix Maze sheet, or left unfinished by the generator): decide whether a different seed or setting fixes each one or it needs replacing, re-check, and close the flags in the database. Use when Jimmy asks to fix flagged puzzles or run fix_puzzles."
argument-hint: "[project name, default Felix Maze]"
---

The source of truth for this skill is `02 Refs/Skills/fix_puzzles.md`, which Jimmy maintains by hand.

1. Read `02 Refs/Skills/fix_puzzles.md` in full.
2. Follow it exactly, applying the conventions in the root `CLAUDE.md` and `04 AI/Supabase/brief.md`.
3. Arguments passed to this skill: $ARGUMENTS

Do not edit `02 Refs/Skills/fix_puzzles.md` unless Jimmy asks.
