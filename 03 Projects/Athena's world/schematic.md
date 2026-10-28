# Athena's world — Schematic

**Status:** MVP (not yet device-tested)
**Owner:** Jimmy
**Platform:** iPad web app, landscape first (portrait stacks the room above the buttons)
**Conversations:** `convo/convo v0.1.md` (questions), `convo/convo v0.2.md` (visibility answers), `convo/convo v0.3.md` (purpose, MVP, assumptions, open questions)

## Purpose

A decorating game. Athena picks who a house or workplace is for, then decorates a blank white room with things like a bed, a window, a picture, a sofa and a plant. When a house is finished she moves on to the next one.

## How it plays

- **Left:** the white room. Walls above the line, floor below. A line of hint text sits above it.
- **Right:** "Who is it for?" buttons (locked houses show 🔒, finished ones ⭐). Under it, "Decorate" buttons for the things the chosen house needs (✓ once placed), then ↩️ Undo.
- **Gear ⚙️ (lower right):** sound on or off, and "Empty this house".
- **Placing:** tap a decoration and it appears up top. Tap the room and it moves there straight away. Tap a placed thing to pick it up, tap the room to move it, or tap it again to put it down where it is.
- **Wall things (window, picture)** stay on the wall. **Floor things (bed, sofa, plant)** stay on the floor.
- **Finishing:** when all the listed things are placed, a celebration card appears and the next house unlocks.

## Files

- `index.html` — the whole game (HTML, CSS, JS, Web Audio). The house and item lists are at the top of the script.
- `convo/` — Q&A history, one file per round, never compacted.
- `CLAUDE.md` — pointer for Claude Code.

## Open

- Athena's age and what she can do on her own (convo v0.3, Q4).
- Whether houses and decorations should be saved between visits (Q9).
- Whether anyone else plays (Q5).
- What comes next (Q16).

Details go in `convo/` as they are answered. Do not compact old convo files.
