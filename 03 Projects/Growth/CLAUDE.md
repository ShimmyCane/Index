# Growth: Claude Code pointer

Purpose: an algorithmic way to age a model over time. A subject (first: a white paper sheet) carries a history of steps. Rules and the environment turn the history into a believable state at each age. Reviewed in the Increment Viewer, opened in the 3-D viewer, saved as JSON in the database.

- Design: `schematic.md`
- Q&A history: `convo/` (never compact; start a new version instead). Open questions: `convo/convo v0.1.md`
- AI notes: `04 AI/Growth/brief.md`, `lessons.md` (when created)
- Shared conventions: root `CLAUDE.md` (public repo, privacy)

Rules:
- The history (steps, seed) is the source of truth. Derived shapes are replayed from it, never hand-edited.
- Same inputs and seed must give the same result.
- Public repo: sample stories use synthetic subjects only. No family photos or private data.
- Database work goes through `/supabase-project`, with a rolled-back test first.
