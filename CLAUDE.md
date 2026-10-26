# Index — Claude Code guide

## What this repo is

A **public nursery** for small programs. Each project starts in `03 Projects/<Project>/` as a seed. When one matures, it is copied out by hand into its own repo and built up there. The nursery keeps lessons, skills and templates in one place so the next project starts faster.

This repo is public. Anything committed here can be seen by anyone, so treat every commit as published.

Its private counterpart is `ShimmyAI`, a private repo where family and personal work happens. Skills and lessons were pulled over from there. Private material stays there.

## Folder map

| Folder | Purpose | Who edits |
|---|---|---|
| `02 Refs/` | Human-curated skills (`Skills/`) and workflow notes (`Workflow/`). Source of truth for skills. | Jimmy. Claude edits **only when asked** |
| `03 Projects/<Project>/` | Nursery projects: code, `schematic.md` (design), `convo/` (Q&A history), `CLAUDE.md` (pointer) | Claude + Jimmy |
| `04 AI/` | Claude's working folder: `lessons_pool.md` (consolidated lessons), `patterns.md`, preferences, tools notes, per-project `brief.md` + `lessons.md` | Claude |
| `.claude/skills/` | Thin wrappers pointing to `02 Refs/Skills/*.md`, so skills run as `/name` | Claude, when a skill is added in 02 |

`readme.md` and `index.html` are human-only. Never edit them.

## Before starting work on a project

1. Read `03 Projects/<Project>/schematic.md` and the latest file in `03 Projects/<Project>/convo/`.
2. Read `04 AI/<Project>/brief.md` and `lessons.md` if they exist.
3. Skim `04 AI/lessons_pool.md` and `04 AI/patterns.md` for reusable lessons.

## Conventions

- **Conversations:** ask clarifying questions in `03 Projects/<Project>/convo/convo vX.Y.md`. Jimmy answers inline. Never compact or rewrite an old convo; start a new version instead.
- **Project boundaries:** deliverables stay inside `03 Projects/<Project>/`. AI notes go in `04 AI/<Project>/`.
- **Briefs and lessons:** after meaningful work, update `04 AI/<Project>/brief.md` and append to `lessons.md`. Promote anything reusable across projects to `04 AI/lessons_pool.md`.
- **Indexes:** when adding or moving files, update the folder's schematic (`02 refs_schematic.md`, `03 projects_schematic.md`, `04 ai_schematic.md`).
- **Versions:** git is the history. Don't create `V1/`, `V2/` copy folders unless Jimmy asks.
- **Maturing a project:** when a project is ready to leave the nursery, Jimmy copies it into its own repo by hand. Claude does not create new repos unless asked.
- **Stack defaults for kids' web apps:** plain HTML/CSS/JS, no build step, GitHub Pages. Add Supabase only when data must persist. See `02 Refs/Skills/ipad_website.md` and the preferences below.
- **New projects:** `/start-project` sets up the folders, including a project `CLAUDE.md`. `/claude-review-project` brings an existing project up to these conventions.

## Privacy (public repo)

- **Never commit** family or financial data, real names with personal details beyond a first name, school or location details, health details, credentials, or private documents. Use synthetic or redacted samples.
- Never commit secret keys. Supabase *publishable* keys may appear in browser code. Service-role keys and passwords may not appear anywhere in the repo.
- Convo files are public too. Keep personal details out of them.
- If a project needs private data, put it in a folder named `private/` under its project folder. `.gitignore` excludes those folders.
- If unsure whether something is private, ask Jimmy before committing.

## Skills

Run as `/name`. Each wraps `02 Refs/Skills/<name>.md`, which is the version to edit.

`start-project` · `ipad-website` · `summarize-code` · `simplify-code` · `update-lessons-learned` · `ai-consolidate` · `claude-review-project`

## Jimmy's preferences (always loaded)

@04\ AI/Personal\ Preferences/jimmy_preferences.md
