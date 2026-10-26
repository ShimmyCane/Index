# Cross-Project Patterns

Reusable lessons distilled from the seed projects, so a new project can start from what already worked. Each pattern points to the project lessons where it was learned. Project-specific detail stays in `<Project>/lessons.md`.

## UI for kids on iPad

- **Layout and look:** follow `02 Refs/Skills/ipad_website.md` and `Personal Preferences/jimmy_preferences.md`: pastel colors, bold outlines, two-column play/reference layout, gear in the lower right, touch targets ≥ 48px.
- **Lock the size of swapping content** so the layout doesn't jump. _(Coins I, Primes 01 A)_
- **Stacked +/− panels instead of tabs** that replace each other. _(Coins C)_
- **Explain each visual in plain words, with the current numbers worked out.** _(Coins B)_
- **Animate to explain change** (sorting, growing, eating/slash on failure), then leave the result visible. _(Coins D/H, Primes 01 C, Row Boat C)_
- **Don't spoil the answer in prompt text**; keep frequent actions in fixed positions. _(Primes 01 C)_
- **Prominent Undo** using full state snapshots. _(Felix Checkers C, Row Boat D)_
- **Fewer, more distinct options**: when Jimmy prunes choices, cut them literally. _(Coins F)_
- **Web Audio synthesized sounds** instead of audio files. _(Felix Checkers C, Family Habits)_

## SVG and graphics

- Use `viewBox` only, and size the SVG with CSS on a wrapper. Never also scale coordinates in JS (that double-scales). _(Primes 01 B, Moment C)_
- Compute the full geometry once and reveal parts of it, so nodes don't jump. _(Primes 01 A)_
- CSS rules beat SVG presentation attributes. Color through classes or `style.fill`. _(Primes 01 D)_
- Rotate SVG groups with `transform-box: fill-box; transform-origin: center`. Keep fixed overlays (pointers) outside the rotating group. _(Moment A/B)_
- Hand-written SVG charts are enough for dependency-free dashboards. Browser-check both empty and non-empty data. _(Family Accounting)_

## Supabase web apps (static site + Supabase)

- **Check the live schema** before trusting `schema.sql` (ask for a screenshot or query `information_schema`). _(Allowances)_
- **Empty results without an error usually mean RLS filtering.** Make sure the user's `parents`/family row exists. _(Allowances)_
- **Errors on screen, opt-in:** a shared `_logError` plus a bottom error panel toggled from the gear. _(Moment D/E, Allowances, Family Habits)_
- **Offline fallback in 3 tiers:** live API (with timeout) → localStorage cache (TTL) → bundled JSON. Jimmy values this. _(Moment H)_
- Only the publishable key goes in browser code; never the service-role key.
- Add an in-app diagnostics check that pings each table. _(Family Habits)_
- **One shared Family Supabase project:** family apps reuse its login and `family_members`. Each app prefixes its own tables (`allowance_*`, `storytime_*`, `speech_*`) and registers them in `app_table_registry`. Rules and template SQL are in `Supabase Registry/`. _(Allowances, StoryTime, Speech Therapy)_
- **Host apps that need a microphone, database or downloads on GitHub Pages, not Artifacts.** See `Tools/artifacts.md`. _(Speech Therapy)_

## Content and data projects

- **Content-driven apps:** keep content in JSON next to a generic engine, so new content doesn't need new code. Seen in Test Bank banks, Moment's game catalog, Row Boat's `scenario.json` and Family Habits' `affirmations.json`. _(Test Bank, Moment, Row Boat, Family Habits)_
- Keep question content separate from the knowledge map, linked by stable IDs in both directions. _(Test Bank A/B)_
- Content QA is its own discipline: validate JSON, unique IDs, answer keys, and source quality. _(Test Bank C, Reader Level Test)_
- Store evidence at import time (e.g. statement balances) rather than reconstructing it later. _(Family Accounting)_
- Test the full path from ingestion to report, not just parsers. _(Family Accounting)_

## Process

The ten recurring lessons are summarized in `profile_and_directions.md` §4. Process-level ones:

- **Clarify before building:** two rounds of numbered questions in a convo file got Moment to an MVP in one pass. _(Moment v6.1–v6.2)_
- **Verify on the real thing before calling it done:** live schema, real browser, real iPad. "Not browser-tested" is the most common open item across briefs. _(Allowances, Moment, Coins)_
- **Feedback rounds work best as numbered wishes and bugs**, one convo file per round. _(Moment v6.3–v6.5)_
- **Seeds feed seeds:** reuse style and lessons from the closest earlier project on purpose (Family Habits → Moment, Allowances → Family Habits). _(Moment, Family Habits)_
- **Q&A in versioned convo files, never compacted.** When a decision is superseded, mark it in the brief, not by rewriting history. _(Family Accounting)_
- **Split single-file apps** into css/js once they grow. Top-level registries that reference later functions must live in the last-loaded script. _(Coins tech notes)_
- **Respect dropped features.** Don't re-add something Jimmy removed. _(Allowances)_

## Template candidates

Patterns that repeat often enough to become a template in `02 Refs/Templates/` or a skill (Jimmy decides):

1. **Kids' iPad app starter:** `index.html` + `css/style.css` + `js/app.js` + `js/ui.js` (gear, settings, error panel), pastel theme variables, two-column layout. Sources: Moment, Coins, Row Boat.
2. **Supabase static-app starter:** `config.js`, `db.js` with 3-tier fallback and `_logError`, `schema.sql` with RLS template, diagnostics panel. Sources: Moment, Family Habits, Allowances.
3. **Question bank JSON + schema:** from `03 Projects/Test Bank/schema for test bank json.md`.
4. **Project brief template:** goal and boundaries · current implementation · data facts · validation (verified/unverified) · next steps. Source: Allowances and Family Accounting briefs.
