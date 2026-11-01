# Make 3D — Claude Code pointer

Purpose: a browser-based 3D sandbox where the **JSON file is the model**. Objects are appended as operations with stable IDs, a separate world file holds the rules they are checked against, and a Three.js viewer renders and inspects the result. No backend, no database, no LLM required. Later destination: three-view drawings → deterministic geometry.

- Design (MVP): `schematic.md`
- To-do log: `todo.md`
- Q&A history: `convo/` (never compact; start a new version instead). Open questions: `convo/convo v0.1.md`.
- AI notes: `04 AI/Make 3D/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (public repo, privacy)

How to run: not built yet. Planned: open `index.html` (no server or build), also from GitHub Pages.

Project rules:
- Public repo. Sample models are synthetic. Real architectural details or client drawings go in `private/`.
- Rendering never modifies the model. Rules live outside the geometry. Every change is an operation in the history.
