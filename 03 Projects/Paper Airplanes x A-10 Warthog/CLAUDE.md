# Paper Airplanes × A-10 Warthog — Claude Code pointer

A remix: a small TypeScript + Canvas 2.5D pixel-art flight game, inspired by the no-asset game at remix.ui8.ai/fly, a 1990s floppy A-10 flight game, and the Paper Airplanes project (forces, glider mode). Track A, family play.

- Design: `schematic.md` · Questions: `convo/` (never compact; start a new version)
- AI notes: `04 AI/Paper Airplanes x A-10 Warthog/brief.md` and `lessons.md`
- Shared conventions: the Index repo's root `CLAUDE.md` (public repo, privacy, ⚙️ and iPad rules)

How to run: open `index.html` (works from the file or GitHub Pages). No server.
Build: `npm install` once, then `npm run build` (compiles `src/` to `js/game.js`). Commit both. Each release: bump `VERSION` in `src/config.ts` and the `?v=` on the script and CSS links in `index.html`, so browsers load the new code.
Test: `npm test` (flight model, mission seeds, headless, no browser). The browser smoke test is in the Index skills (`smoke-test`).

Rules:
- Source is TypeScript in `src/`; `js/game.js` is the only script the page loads. Never edit `js/game.js` by hand.
- No image files. Every object is a voxel model in `src/assets/models.ts`, drawn by sprite stacking (`src/voxel.ts`); the land and sky are painted per pixel in `src/render.ts`.
- Change flight numbers only in `src/flight.ts` (`AIR`), and run `npm test` after.
- Do not copy code or art from the reference page (remix.ui8.ai/fly) or from any game; re-make ideas from the physics.
- Felix's first name only if at all; no photos, no school or location details.
- No database for now (nothing persists). If scores later need to be kept, follow `supabase-link` and the family conventions.
- Self-contained folder, so it can become its own repo later.
