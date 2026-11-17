# Our Family Compass — Schematic

Status: MVP 0.2.0 (headless-tested with a mocked database; not device-tested; family tables written, not applied)
Track: A. Family play, used first by a parent. It keeps the family look and puts everything secondary in ⚙️, but room sheets carry more words than a child's game because the reader is an adult doing the thinking. The children's side comes later and will be short on words. (To confirm in `convo/convo v0.1.md`.)

## Purpose
A long project: give the children a way to find their way back to themselves, with roots, wings and a compass. The end products are small pieces (narrated stories, open questions, small readings, plain explanations, moral games), each with a fun front and a clear objective and lesson on the back. Before any piece is written, the framework has to hold. This round builds the framework and draws it as a mind palace: rooms that hold parts of the compass, not facts.

The framework in words is `framework.md`. This file describes the page.

## Track defaults
| Setting | Value |
|---|---|
| Words on screen | the map has a name and one line per room; the words are inside each room's sheet |
| Options visible | the nine rooms |
| ⚙️ holds | text size, compass needle, voice notes on or off, notes for improvement, family sign-in and database check, where my writing is kept, errors, version |
| Panels | seven collapsible panels under the map; The path and Sample pieces open on a large screen, the rest closed |
| Palette | Family Habits look: ink, paper and sun; offset shadows; asymmetric corners; polka dots |
| Database | Family project, family sign-in (tables written, not applied) |
| Private data | thoughts, recordings and notes stay on the device and in the family database. Never in the repo |

## The palace (`data/framework.js`)
Nine rooms, drawn as a plan with a sky above and the ground below. The rooms, their places on the map and their connections are **data**: each has `at` (a box or a circle on an 800 x 772 map) and `links` (the rooms it connects to, and why). `OFC.updated` is the version stamp; a newer framework saved from the family database (`ofc_framework`) is kept on the device and used on the next opening, after the page checks its shape. A room with no `at` still appears in the room list, so rooms can be added without redrawing.
- **Courtyard** (centre): the one idea and its two tests.
- **Principles** (north), **Library** (east), **Village** (south), **Workshop** (west): the four parts of the compass. Level 2: how the values are lived now.
- **Gate** (the way in): the four questions to answer first.
- **Roots** and **Foundation** (the ground): where the family came from; level 1 values.
- **Open sky** (above): level 3, what is the children's to choose.
Each room has: what it is, what lives there, questions to walk with, and connections.

## Pieces (`data/pieces.js`)
Twelve sample pieces, at least one of every kind, drafted from the starting conversation. Each has a front (what the reader meets, with a choice list, steps, an open question or prompts for the teller) and a back (objective, lesson, ending, what it is not, level, author and date). "Turn it over" shows the back. Answering an open question keeps a dated thought tied to the piece. Pieces are placeholders; real ones will live in `ofc_pieces`.

## Screens
1. **The map.** Tap a room. A badge counts thoughts left there. The same rooms are listed as buttons under the map.
2. **A room sheet.** What it is, what lives there, the pieces in the room, questions, where it connects to, and "My thinking". A thought is saved with the room, the question, who wrote it and today's date. An optional voice note (⚙️ → Voice notes) records on the page.
3. **A piece sheet.** Front, one thing to do, and a "Turn it over" back.
4. **A change of mind.** "I see it differently now" adds a new dated thought that points to the old one. The old one stays, marked as an earlier view.
5. **Panels:** 🪜 The path · 🎈 Sample pieces · 🧩 Kinds of pieces (eight, with "The hammer") · 🔬 Anatomy of a piece · 🧱 Two layers · 🛡️ What could go wrong · ✍️ Everything I have written (save a copy, load a copy).
6. **⚙️** (lower right).

## Feedback notes
"Notes for improvement" in ⚙️ (`02 Refs/Skills/feedback_notes.md`). A note is saved with the room on screen, or "Palace map" when no room is open. Device only for now.

## Data storage
- Device (local storage, try/catch): `ofc.settings`, `ofc.thoughts`, `ofc.notes`, `ofc.panels`, `ofc.framework` (a newer palace from the database), `ofc.session`. Recordings are in IndexedDB (`ofc-voice`).
- Thought: `{ id, at, room, author, about, text, revises?, piece?, voice?, voice_path? }`. `id` and `at` never change.
- Save a copy writes a JSON file of thoughts (no audio). Load a copy adds thoughts that are not already here and replaces nothing.
- If the device cannot save, the header pill says "⚠️ not saving".

## Family database (Family project; SQL in `supabase/`, **not applied**)
`001_ofc_family.sql`, with the rolled-back `test_001_ofc.sql` and the read-only `verify_001_ofc.sql`. Row-level security on, anon revoked, family sign-in only. Registered under app `our-family-compass`.
| Object | Purpose | Family sign-in may |
|---|---|---|
| `ofc_notes` | notes for improvement | insert, read, update status |
| `ofc_thoughts` | dated thoughts, append-only, `compass`, `revises`, `piece`, `voice_path` | insert, read (no update, no delete) |
| `ofc_pieces` | pieces: `data` (front and back as JSON), `author`, `entered_by`, `for_whom`, `revises`, `voice_path`, `deleted` | insert, read, update |
| `ofc_framework` | the palace as JSON, one row per saved version; newest wins | insert, read |
| bucket `ofc-voice` (private) | voice notes at `main/<id>.m4a` or `.webm` | listen, add |
`compass` (default `main`) leaves room for several compasses or voices later.

## Planned, not built
- Applying the SQL (Jimmy pastes it; see `todo.md`).
- An editor for the palace and for pieces; moving the samples into `ofc_pieces`.
- A form to add a village voice that arrived by email or text.
- The children's mode: the same palace, with mini games and reading inside rooms.
- The values sorting board (three levels) and the village list.

## Research
`research/best_practices.md` (what research says, strength of evidence, Claude's thoughts) and `research/reading.md`.

## Open questions
See `convo/convo v0.1.md`.
