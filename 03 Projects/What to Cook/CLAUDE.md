# What to Cook — Claude Code pointer

Purpose: a household website that catalogues pantry and fridge stock from voice or typed transcripts, keeps a recipe book (favourites, ingredients, photo, cook time), plans meals (a quick plan or a week calendar), and turns wish-list recipes into a shopping list.

- Design: `schematic.md`
- Q&A history: `convo/` (never compact; start a new version instead)
- AI notes: `04 AI/What to Cook/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (public repo, privacy rules), `04 AI/Supabase/brief.md` (table prefix `wtc_`, registry)
- Track: to confirm (leaning A. Family play)

Rules:
- Pantry, recipes, photos and transcripts stay in Supabase or in `private/`, never in this repo.
- No secret keys in browser code. The publishable key only.
- Database SQL is pasted by hand (`02 Refs/Skills/supabase_link.md`).

How to run: open `index.html` from GitHub Pages or a local web server once the MVP exists. Not built yet.
