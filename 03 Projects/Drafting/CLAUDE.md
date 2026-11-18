# Drafting — Claude Code pointer

Purpose: an asset generator for drawings. It reads a detail or a Make-3D model from the architecture library (read only), interprets it as a 2-D drawing, exports DXF blocks, `.LIN` line types, `.PAT` hatch patterns and 3-D DXF meshes for AutoCAD and Revit, and checks each output with a linter (a legibility score) and a DXF viewer.

Track: B. Studio design

- Design: `schematic.md` · Background reading: `research/` (formats, library and 3-D sources) · Q&A: `convo/` (never compact; start a new version instead)
- Open questions: `convo/convo v0.1.md` (answers pending)
- AI notes: `04 AI/Drafting/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (public repo, privacy)

Rules for this project:
- Read only from the Architecture project's `sketch_details`. Owner-only policies use `public.platform_is_owner()`, never an email.
- Real drawings and their exports go in `private/` (ignored by git) or stay on the device. Synthetic samples only in the repo.
- Units are real inches. Do not multiply by the scale factor on export.
- Nothing is built yet (idea status). Build starts after `convo/convo v0.1.md` is answered, from increment 1 in `schematic.md` §7.
