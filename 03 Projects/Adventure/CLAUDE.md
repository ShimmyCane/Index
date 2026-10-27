# Adventure — Claude Code pointer

Purpose: a family story game played like correspondence chess. Family members take roles and build spoken scenes; a nightly AI storyteller writes the next chapter. Jimmy shapes the world under the hood.

- Design: `schematic.md`
- Q&A history: `convo/` (never compact; start a new version instead)
- AI notes: `04 AI/Adventure/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (public repo, privacy rules), `04 AI/Supabase/brief.md` (table prefix `adv_`, registry)

Rules:
- The family's moves and answers stay in Supabase, never in this repo.
- No secret keys in browser code.

- Storyteller run: follow `storyteller.md` ("Run the Adventure storyteller").
- To-do: `todo.md`

How to run: open `index.html` (player), `world.html` (map, journal, plot) or `hood.html` (under the hood) from GitHub Pages or a local web server, and sign in with the family account. Microphone and reading aloud need a real browser; the iPad is the target.
Database: Supabase project "Family", tables `adv_*`, SQL in `supabase/`.
