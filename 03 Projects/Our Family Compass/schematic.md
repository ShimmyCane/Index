# Our Family Compass — Schematic

Status: MVP 0.1.0, the framework only (headless-tested; not device-tested; no database yet)
Track: A. Family play, used first by a parent. It keeps the family look and puts everything secondary in ⚙️, but room sheets carry more words than a child's game because the reader is an adult doing the thinking. The children's side comes later and will be short on words. (To confirm in `convo/convo v0.1.md`.)

## Purpose
A long project: give the children a way to find their way back to themselves, with roots, wings and a compass. The end products are small pieces (narrated stories, open questions, small readings, plain explanations, moral games), each with a fun front and a clear objective and lesson on the back. Before any piece is written, the framework has to hold. This round builds the framework and draws it as a mind palace: rooms that hold parts of the compass, not facts.

The framework in words is `framework.md`. This file describes the page.

## Track defaults
| Setting | Value |
|---|---|
| Words on screen | the map has a name and one line per room; the words are inside each room's sheet |
| Options visible | the nine rooms |
| ⚙️ holds | text size, compass needle moving or still, notes for improvement, where my writing is kept, errors, version |
| Panels | six collapsible panels under the map; The path open on a large screen, the rest closed |
| Palette | Family Habits look: ink, paper and sun; offset shadows; asymmetric corners; polka dots |
| Database | none yet. Planned: Family project, family sign-in |
| Private data | thoughts stay on the device (with a save-a-copy file). Never in the repo |

## The palace (`data/framework.js`)
Nine rooms, drawn as a plan with a sky above and the ground below:
- **Courtyard** (centre): the one idea and its two tests.
- **Principles** (north), **Library** (east), **Village** (south), **Workshop** (west): the four parts of the compass. These are level 2: how the values are lived now.
- **Gate** (the way in): the four questions to answer first.
- **Roots** and **Foundation** (the ground): where the family came from; level 1 values.
- **Open sky** (above): level 3, what is the children's to choose.

Each room has: what it is, what lives there, and questions to walk with.

## Screens
1. **The map.** Tap a room. A badge counts the thoughts left there. The same rooms are listed as buttons under the map.
2. **A room sheet.** What the room is, what lives there, questions. Tap a question to write about it. A thought is saved with the room, the question, who wrote it and today's date.
3. **A change of mind.** "I see it differently now" adds a new dated thought that points to the old one. The old one stays, marked as an earlier view. Nothing is ever overwritten.
4. **Panels:** 🪜 The path (six steps, each opens its room) · 🧩 Kinds of pieces (eight) · 🔬 Anatomy of a piece (front and back, with one worked example) · 🧱 Two layers · 🛡️ What could go wrong (ten risks, one guard each) · ✍️ Everything I have written (all thoughts by date; save a copy, load a copy).
5. **⚙️** (lower right).

## Feedback notes
"Notes for improvement" in ⚙️ (`02 Refs/Skills/feedback_notes.md`). A note is saved with the room on screen, or "Palace map" when no room is open. Device only for now.

## Data storage
- Device (local storage, try/catch): `ofc.settings`, `ofc.thoughts`, `ofc.notes`, `ofc.panels`.
- Thought: `{ id, at, room, author, about, text, revises? }`. `id` and `at` never change.
- Save a copy writes a JSON file. Load a copy adds thoughts that are not already here and replaces nothing.
- If the device cannot save, the header pill says "⚠️ not saving".

## Planned, not built
- **Family database** (Family project, family sign-in, `02 Refs/Skills/supabase_link.md`): `ofc_notes` (the standard notes table), `ofc_thoughts` (append-only, same shape as above), later `ofc_pieces` and `ofc_voices`. Row-level security on, anon revoked. Recordings in a private bucket, as Adventure does.
- **A piece record** with the fields in "Anatomy of a piece" (`framework.md` §4).
- **The values sorting board** (three levels), the **village list**, and the **children's rooms** (the experience layer).
- **Narration** in a parent's own voice.

## Open questions
See `convo/convo v0.1.md`.
