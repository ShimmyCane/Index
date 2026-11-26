# Remix

Build a nursery version of something that already exists (a linked website, a GitHub repo, or a set of ideas), and combine it with another repo or set of ideas. The result is a seed project in `03 Projects/<Remix name>/`, named "<A> x <B>" (like "Make-3D x Construct").

Use when Jimmy says: remix, build a version of this link or repo, combine this with that, "X x Y".

## Inputs (ask once if missing)

1. **Source**: a URL or `owner/repo`. Write the link in the convo.
2. **Second source** (optional): another repo or idea list to combine with.
3. **What to take**: the mechanics, look, physics, sound or data idea. Default: ideas only.
4. **Name** for the remix, in the form "A x B".

If a source cannot be read, stop and say so in the convo. Do not guess its contents. Ask Jimmy to allow the host (environment network settings) or paste the source into `03 Projects/<Name>/research/private/` (not committed).

## Steps

1. **Read the source** (in this order): the page or the repo README, then the main source files, the licence, and any build notes. Use the web-fetch agent or the GitHub tools for public pages; `gh api` only for search. Record exactly what was read, with links and commit, in `04 AI/<Name>/brief.md`.
2. **Licence check.** If the source has no licence, copy no code: re-make the idea from its behaviour. If it is permissive (MIT, Apache-2.0, BSD), code may be used with credit in `schematic.md` and the page's About panel. Other licences: ideas only.
3. **Set up the seed** with `/start-project` rules: `03 Projects/<Name>/` (`schematic.md`, `CLAUDE.md`, `convo/`), `04 AI/<Name>/` (`brief.md`, `lessons.md`).
4. **Write the convo round 1**: what was read, what was not, the choices made, and the questions for Jimmy. Build anyway when the request is clear; name the choices in the final message.
5. **Build a version in the nursery's style**: plain HTML, CSS and JavaScript by default, no build step. If TypeScript is asked for, keep `src/` as the source and commit the compiled script the page loads (the page itself never needs a build). Keep all files inside the project folder.
6. **Combine** with the second source by making its ideas or code a separate module, with its own note in `schematic.md` saying where each piece came from.
7. **Check**: a headless browser run (`smoke-test`) for errors, scroll and the ⚙️ drawer; any unit or physics tests written as `tools/*.js` that run in Node.
8. **Nursery pointers**: a row in `03 Projects/03 projects_schematic.md`; a tile in the Nursery list of the root `index.html` (the standing exception for a first build); `04 AI/04 ai_schematic.md` if it indexes folders.
9. **Lessons**: record what the source was, what could not be read, and what was reused, in `04 AI/<Name>/lessons.md`. Promote anything reusable to `04 AI/lessons_pool.md`.
10. **Privacy**: run `privacy-check` before the commit. No personal details in convo or research files.

## Output

- A seed project that runs from `index.html`, with the source named and credited.
- A final message listing: what was read (and what was not), the licence, the choices made, and the open questions.

## Rules

- Do not copy code or art from a source with no licence or a non-permissive one.
- Do not add the source's credentials, keys or hosts to the project.
- Ask only when the source cannot be reached or the request is unclear; otherwise build and report.
- Keep attribution on the page (short) and in the schematic.
