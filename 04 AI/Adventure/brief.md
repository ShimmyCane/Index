# Adventure — AI Brief

**Updated:** 2026-10-27
**Status:** idea. Design outlined in `03 Projects/Adventure/schematic.md`. Awaiting answers in `convo/convo v0.1.md`.

## Goal

A family story game played like correspondence chess: roles instead of players, a page per role, a nightly Claude storyteller, and Jimmy as dungeon master under the hood.

## Architecture (planned)

- Supabase tables with the `adv_` prefix (books, roles, chapters, moves, world, facts, dm_notes, runs).
- A nightly scheduled Claude task does the writing. No LLM in the browser and no API key in the page.
- A small player page (listen and answer) and an under-the-hood console.
- Later: a rules engine with prepared scenes for daytime play.

## Verified vs. unverified

- Nothing built yet.
- Unverified: whether the scheduled task can reach Supabase through the connector; read-aloud voices on iPad Safari.

## Next steps

1. Jimmy answers convo v0.1.
2. Set up Supabase with `/supabase-project`.
3. Build the MVP.
