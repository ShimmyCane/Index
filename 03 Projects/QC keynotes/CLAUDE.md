# QC keynotes — Claude Code pointer

Purpose: a first-pass quality-control web page for architectural drawing PDFs. It checks keynotes and general notes against a keynote guideline and marks them green (matches), yellow (questionable) or red (breaks a rule), then exports a marked-up, unflattened PDF.

- Design: `schematic.md`
- Q&A history: `convo/` (never compact; start a new version instead)
- AI notes: `04 AI/QC keynotes/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (Index repo, public, privacy rules)
- Track: B. Studio design

How to run: serve the folder (`python3 -m http.server`) and open `index.html`, once it exists.

Project rules:
- Client drawings are never committed. The uploaded PDF stays in the browser.
- Sample guidelines and sample sheets are synthetic (fictional client, fictional keynote numbers).
- No client, project or person names in any file (public repo).
