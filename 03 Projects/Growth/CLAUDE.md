# Growth: Claude Code pointer

Purpose: an algorithmic way to age a model over time. A subject (first: a white paper sheet) carries a history of steps. Rules and the environment turn the history into a believable state at each age. Reviewed in the Increment Viewer, opened in the 3-D viewer, saved as JSON in the database.

- Design: `schematic.md`
- 3-D page: `paper3d.html` (open in a browser; no server or build). Engine `js/paper_engine.js` (replays steps 1..n from a clean sheet), story `js/paper_story.js` (the record), Three.js r160 in `vendor/`.
- Tests: `node tests/test_paper_engine.js` (plain Node).
- Review in the Increment Viewer: `viewer.html?set=growth_paper` (frames `renders/growth_3d_XX.png`).
- Q&A history: `convo/` (never compact; start a new version instead). Open questions: `convo/convo v0.1.md`
- AI notes: `04 AI/Growth/brief.md`, `lessons.md` (when created)
- Shared conventions: root `CLAUDE.md` (public repo, privacy)

Rules:
- The history (steps, seed) is the source of truth. Derived shapes are replayed from it, never hand-edited.
- Same inputs and seed must give the same result.
- Public repo: sample stories use synthetic subjects only. No family photos or private data.
- Database work goes through `/supabase-project`, with a rolled-back test first.
