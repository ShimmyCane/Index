# Adventure — Convo v0.3

**Project:** Adventure
**Round:** Jimmy's requests after the MVP

## Requests

1. A settings button that links between the pages (story, under the hood, and back).
2. Under the hood, world-building tools:
   - Append descriptions to each character and each setting, sorted by the most recent stories.
   - The overarching plot set up as chapters.
   - A map of rough regions, with secondary maps for scenes like towns or crypts.
   - "With an expansive story, you need a set of great tools to manage the world-building."
3. Register the tables this project owns in the Family database's table registry.
4. Make sure every project in the Index repo shows on the root `index.html`.
5. Merge when done.

## What Claude built

- **Menu in ⚙️ on every page:** Story, World, Under the hood, All projects.
- **World page (`world.html`):**
  - **Map:** places are a tree (world → region → town → building → room). Each place opens its own map of what's inside. Drag to move, drag the corner to resize, tap to edit name, emoji, kind, color and description.
  - **Characters & places:** every character (playable roles and other characters) and every place, most recent in the story first. Each has a description, an append-only journal (optionally tied to a chapter), and the chapters it appears in.
  - **Plot:** chapters by book. Planned chapters carry a plan the storyteller follows; written ones show as done.
- **Database:** `adv_places`, `adv_notes`, and `status` / `plan` on chapters, all logged and restorable. All `adv_` tables are registered under app `adventure` in `app_table_registry`.
- **Root page:** a new Nursery section with Adventure and Athena's World.

## Open

- The database setup is still waiting on Supabase's confirmation (see `04 AI/Adventure/brief.md`).
