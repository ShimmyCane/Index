# Adventure — Lessons

- 2026-10-27: Jimmy prefers AI working in the background (nightly, between turns) over a live AI in the page. It keeps keys out of the browser and gives better, more consistent stories.
- 2026-10-27: Supabase `apply_migration` can stop for a user confirmation in a remote session; if no one answers it times out after 60 s with nothing applied. Check `pg_class` before retrying, and build the rest in the meantime.
- 2026-10-27: For "edit anything, roll back anything", one generic trigger that copies `to_jsonb(old)`/`to_jsonb(new)` into a history table, plus a restore function using `jsonb_populate_record` with `on conflict (id) do update`, covers every table with no per-table code.
- 2026-10-27: In a two-column layout, auto-scrolling a column to the bottom pushed the character buttons out of view. Make the controls sticky and scroll only the new item into view.
- 2026-10-27: World-building tools that scale: places as a tree where every place is the map of its children (boxes in percent), an append-only journal per subject, and planned chapters as rows with a status, so the plot, the storyteller and the player page share one table.
- 2026-10-27: The root `index.html` lists only projects with their own repos; nursery projects need their own section with relative links (`03%20Projects/...`).
