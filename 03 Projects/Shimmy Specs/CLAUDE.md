# Shimmy Specs — Claude Code pointer

Purpose: a web app that teaches and guides the *process* of writing CSI specifications. It starts from the project (summary, code analysis, keynotes), recommends sections with reasons, walks each section through a schematic of questions, records every decision with its alternatives, and only then drafts the three-part section.

- Design: `schematic.md` · MVP: `mvp schematic.md` · Build steps and build notes: `mvp tasks.md` · Goals: `todo.md`
- Body of knowledge: `knowledge/index.md` (chapters 1xx–4xx, templates 5xx, `base sections.md`)
- Q&A history: `convo/` (never compact; start a new version instead)
- AI notes: `04 AI/Shimmy Specs/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (public repo, privacy)

How to run: open `index.html` (no server or build). It also works from GitHub Pages.

- After editing anything in `data/` or `samples/`: `node tools/bundle_data.js` (regenerates `js/data.bundle.js`, used when opened from `file://`).
- Checks, in order: `node tools/validate_data.js` (data, references, bundle fresh) · `node tools/test_engine.js` (engine, plain Node) · `node tools/test_cloud.js` (cloud client, fake network) · `node tools/smoke.js [screenshotDir]` (headless Chromium, uses the pre-installed Playwright; save screenshots outside the repo).
- Accounts and cloud saving: fill in `js/config.js` (placeholders until then, so the app saves on the device only). Database: run `supabase/002_shimmy_specs_accounts.sql` once, then `002_test_rollback.sql`. `001` is superseded; never run it. Open questions: `convo/convo v0.3.md`.
- Code map: `js/template.js` (conditions), `js/recommend.js` (drivers, recommender), `js/draft.js` (numbering, hashes), `js/decisions.js`, `js/flags.js`, `js/import.js`, `js/outputs.js`, `js/store.js` (state, localStorage, actions), `js/data.js`, `js/config.js` (database connection), `js/cloud.js` (accounts and cloud projects, via ss_ functions only), `js/screens.js`, `js/app.js` (header, layout, router, events).
- Build steps and rules: `mvp schematic.md` and `mvp tasks.md`.

Project rules:
- Public repo. Use synthetic sample projects only. Real project data, client names, addresses and drawings go in `private/`.
- Nothing project-specific in the repo or Supabase: office projects stay out; only the lessons drawn from them go in. Sketch/test projects and Jimmy's own projects are the exception (`kind: sketch|own`).
- Supabase: Architecture project, tables prefixed `ss_`, registered in `public.table_index`.
- Never commit copyrighted master-guide text (MasterSpec, SpecText, BSD SpecLink, institutional guide specs, CSI manuals). Paraphrase, cite, and keep any copies in `private/`.
- Knowledge files are written in our own words and marked where a fact still needs checking against a current CSI publication.
