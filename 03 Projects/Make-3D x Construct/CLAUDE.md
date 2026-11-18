# Make-3D x Construct — Claude Code pointer

Purpose: a new version of Make 3D (`ShimmyCane/Make-3D`, graduated from the nursery) built with the working method of Construct (`rtmandreyev/construct`, Apache-2.0, by Artyom Andreyev). Construct's processes are reused: check before build, certainty per fact and part, a defect ledger worked in small rounds, and the best version kept. No code is copied from Construct yet.

- Design: `schematic.md` (attribution in §0)
- Q&A history: `convo/` (never compact; start a new version instead). Open questions: `convo/convo v0.1.md`.
- AI notes: `04 AI/Make-3D x Construct/brief.md` (and `lessons.md` once there are lessons)
- Track: B. Studio design
- Shared conventions: root `CLAUDE.md` (public repo, privacy)

How to run: not built yet. The first build will open as `index.html` in a browser, with no server or build, the same as Make 3D.

Project rules:
- Public repo. Sample models are synthetic. Real architectural details or client drawings go in `private/`.
- Construct's code and text are not copied in without the Apache-2.0 `LICENSE` and `NOTICE` beside them.
- Rendering never modifies the model. Rules live outside the geometry. Every change is an operation in the history.
