# Jimmy's Personal Preferences & Design Principles

**Context**: Workspace Global AI Reference  
**Last Updated**: October 22, 2026  

---

## 1. UI & Visual Design (iPad / Tablet Focus)
* **Target Audience & Tone**: Games and tools are often intended as a "play thing for the kids on iPad".
* **Color Palette**: Light pastel color schemes (e.g. soft vanilla, sage, peach, mint, coral). Avoid harsh high-contrast black/white or neon tones unless specifically asked.
* **Graphics & Styling**: Simple, bold lines (2.5px – 3.5px solid dark borders) with tactile depth (`box-shadow: 0 4px 0 ...`). Avoid stark wireframes; make it graphically rich, cute, and engaging.
* **Focus & Simplicity**: Minimize text, nested menus, and clutter. Keep the primary activity / game board front and center.
* **Settings & Extensions Anchor**: Place a dedicated **floating gear button (`⚙️`) in the lower-right corner** that opens a clean drawer or modal for options and extensions.
* **Errors at the bottom**: Error messages should appear at the bottom of the page (not as top banners), behind a "Show errors" toggle in the gear panel. Never force errors on screen — users should opt in.
* **Large Buttons**: Generous touch targets suited for tablet fingers (minimum 48px to 68px heights).
* **Layout details** (two-column play/reference layout, decluttering into settings, no layout jumps): see `02 Refs/Skills/ipad_website.md`.
* **Offline-first caching is valued**: Jimmy explicitly praised the 3-tier offline fallback pattern (live API → localStorage cache → bundled JSON). Preserve and honor this pattern in web apps that load remote data.

---

## 2. Gameplay & Interaction Mechanics
* **Kid-Friendly Options**:
  - Provide a **Quick Game** option (e.g. 2 rows of pieces instead of 3) to enable faster, dynamic sessions suitable for young attention spans.
  - Implement a prominent, easily accessible **Undo** button so children can learn and experiment without penalty.
* **Symmetry & Balance**:
  - When introducing custom pieces or special mechanics (e.g. Queen and Bishops in Felix Mode), ensure the opposing player / team receives a balanced, geometrically symmetric counterpart (e.g. 180° rotation on the board).
* **Piece Persistence**:
  - Attacking/capturing pieces (like Queens and Bishops) must remain on the board at the destination square after taking an opponent's piece.

---

## 2b. Educational Visualizations
* **Explain in plain words**: every graph/diagram needs a "how to read this" note with the current numbers worked out; terse labels confuse a child.
* **Show the full solution space**, not a slice with variables held fixed.
* **Toggleable stacked panels (+/−)** instead of tabs that replace each other.
* **Animate organizing** (e.g. Sort into piles of 5/10) so structure is visible.

## 3. Architecture & Code Structure
* **Zero Server / All Client-Side**:
  - Keep web applications completely self-contained in HTML, CSS, and vanilla JavaScript without requiring Node servers or build pipelines.
* **Self-Contained Audio**:
  - Use the native browser **Web Audio API** to synthesize playful sound effects (tactile clicks, capture chimes, royal arpeggios, win fanfares) rather than relying on external MP3/WAV files that can fail to load.
* **Strict Project Boundaries**:
  - Keep all project deliverables inside that specific project's directory (`03 Projects/<Project Name>/`). Do not create or scatter files outside the project unless explicitly directed.

---

## 4. Recurring Workspace Skills
* **`summarize_code`** (`/summarize-code`):
  - For any core HTML file, create an adjacent `MAIN_CODE_FILE_summary.html` containing:
    1. A graphical system architecture overview.
    2. A line-by-line Table of Contents with functional descriptions.
    3. A comprehensive reference table of adjacent variables (CSS & JS) explaining what they do and how to tweak them.
* **`update_lessons_learned`** (`/update-lessons-learned`):
  - Review and log lessons learned in `04 AI/<Project Name>/lessons.md`.
  - Capture global preferences here in `04 AI/Personal Preferences/jimmy_preferences.md`.
  - Promote cross-project patterns to `04 AI/patterns.md`; update `04 AI/04 ai_schematic.md` and `04 AI/ai_task_tracker.md`.
* **All skills** live in `02 Refs/Skills/` (source) and run in Claude Code as `/name` (see root `CLAUDE.md`).


## 5. Family Apps (added in consolidation)
* **Reuse the Family Habits look** for any new family app: Quicksand, Orbitron and Patrick Hand; ink, paper and sun palette; offset shadows; asymmetric radii; polka dots.
* **Visible failures on the page** for any app that talks to a database: an error panel, a header status pill and a database check in ⚙️. Don't rely on DevTools.
* **Publish the family apps where they actually run.** Artifacts can't run the microphone or the database, so use GitHub Pages for those.
