# Athena's world — Claude Code pointer

Purpose: a decorating game. Athena decorates a white room for a house or workplace, one house after another. Nursery seed project, now at MVP.

- Design: `schematic.md`
- Mock-ups for viewing the project: `mockups/index.html`
- Q&A history: `convo/` (never compact; start a new version instead)
- AI notes: `04 AI/Athena's world/` (`brief.md` and `lessons.md`)
- Shared conventions: root `CLAUDE.md` (public repo, privacy rules)

How to run: open `index.html` in a browser (no build step). For iPad, host it on GitHub Pages or open the file directly. Edit `HOUSES` at the top of the script to change houses; things (3-D models) are in `models.js` (`ITEMS`); the 3-D world (rooms, scenery, touch) is in `world3d.js`. Three.js r128 is vendored in `lib/` so it works offline.

`v1/` is the frozen V1 (flat emoji room). Don't change it except to keep it from overwriting V2 save data.
