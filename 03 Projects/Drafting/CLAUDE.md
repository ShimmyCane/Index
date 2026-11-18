# Drafting — Claude Code pointer

Purpose: an asset generator for drawings. It reads a detail or a Make-3D model from the architecture library (read only), interprets it as a 2-D drawing, exports DXF blocks, `.LIN` line types, `.PAT` hatch patterns and 3-D DXF meshes for AutoCAD and Revit, and checks each output with a linter (a legibility score) and a DXF viewer.

Track: B. Studio design

- Design: `schematic.md` · Background reading: `research/` (formats, library and 3-D sources) · Q&A: `convo/` (never compact; start a new version instead)
- Open questions: `convo/convo v0.1.md` (answers pending)
- AI notes: `04 AI/Drafting/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (public repo, privacy)

Rules for this project:
- Read only from the Architecture project's `sketch_details`. Owner-only policies use `public.platform_is_owner()`, never an email.
- Exports are downloads only: they stay on the device and are never saved to the repo or a database (convo v0.2, Q14). Real details are read from the library; synthetic samples are the only files in `samples/`.
- Run: open `index.html` (no server). Tests: `node tests/test_dxf.js`. Optional ezdxf audit (test-only) runs when ezdxf is installed.
- Code: `js/` (`primitives.js`, `dxf_write.js`, `dxf_read.js`, `linter.js`, `pipeline.js`, `app.js`). Bundled samples in `js/samples.js` (generated from `samples/*.json`), so the page works from `file://`.
- Units are real inches. Do not multiply by the scale factor on export.
- Status: MVP 0.1 (increment 1). Next: increment 2 (blocks, line types, hatch patterns), which needs Jimmy's AutoCAD test (convo v0.2).
