# Shimmy Specs — Claude Code pointer

Purpose: a web app that teaches and guides the *process* of writing CSI specifications. It starts from the project (summary, code analysis, keynotes), recommends sections with reasons, walks each section through a schematic of questions, records every decision with its alternatives, and only then drafts the three-part section.

- Design: `schematic.md` · MVP: `mvp schematic.md` · Build steps (Haiku): `mvp tasks.md` · Goals: `todo.md`
- Body of knowledge: `knowledge/` (Specs 101–501 and `base sections.md`)
- Q&A history: `convo/` (never compact; start a new version instead)
- AI notes: `04 AI/Shimmy Specs/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (public repo, privacy)

How to run: not built yet. The MVP will be a plain `index.html` (no build step).

Project rules:
- Public repo. Use synthetic sample projects only. Real project data, client names, addresses and drawings go in `private/`.
- Nothing project-specific in the repo or Supabase: office projects stay out; only the lessons drawn from them go in. Sketch/test projects and Jimmy's own projects are the exception (`kind: sketch|own`).
- Supabase: Architecture project, tables prefixed `ss_`, registered in `public.table_index`.
- Never commit copyrighted master-guide text (MasterSpec, SpecText, BSD SpecLink, institutional guide specs, CSI manuals). Paraphrase, cite, and keep any copies in `private/`.
- Knowledge files are written in our own words and marked where a fact still needs checking against a current CSI publication.
