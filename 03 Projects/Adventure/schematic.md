# Adventure — Schematic

**Status:** idea (design outlined, awaiting answers in `convo/convo v0.1.md`)
**Owner:** Jimmy
**Conversation:** `convo/convo v0.1.md`

## Purpose

A family story game played like correspondence chess. The family takes roles in a shared world. Each person checks in when they can, hears their own part of the story, and answers. Overnight, an AI storyteller reads everyone's moves and writes the next page. Jimmy can step under the hood as dungeon master to shape the larger story.

It grows out of the car-ride adventures Jimmy told with Athena using ChatGPT (the crypt, the Sun and Moon Chest, Bristle the dog). The new game is for the whole family.

## How it plays

1. **Roles, not players.** The database keeps a list of roles (for example the explorer, Bristle the dog). Anyone in the family picks a role, and roles can be swapped at any time. The game never tracks who is playing.
2. **Each role has its own view.** A chapter is written once per role: the same events, seen from where that role stands. Some secrets reach only one role, so the family compares notes.
3. **Check in, listen, answer.** A player opens their role, hears the page read aloud (or reads it), and picks one of the offered options or answers in their own words.
4. **The story never stalls.** If a role doesn't answer by the nightly run, the story carries on without them, and that role's character acts on their own in a sensible way.
5. **Puzzles and values.** Some chapters end in a riddle or a choice about kindness, honesty or courage. More than one answer can be right. Different kinds of answers (clever, kind, brave) send the story different ways. Wrong answers bring a hint the next night, never a dead end.
6. **Short books.** Stories come in books of about 7–10 chapters, each with a real ending. A new book starts in the same world.

## The dungeon master, in three parts

| Part | When | Does |
|---|---|---|
| **Nightly storyteller** (a scheduled Claude task) | Once a night | Reads new moves, the world bible and the current facts. Writes the next chapter for each role, updates the facts, offers options. Saves the chapter as a draft or publishes it. |
| **Jimmy, under the hood** | Any time | Edits the world bible and the book outline, plants secrets or events, leaves notes for the next run, reviews or edits drafts. Can ask Claude to run the story right away. |
| **Rules engine** (later, plain code, no AI) | During the day | Handles small mechanics instantly: moving between known places, items and keys, riddles with known answers, hints. Serves small scenes the nightly run prepared. Anything outside its rules waits for the storyteller. |

## The nightly loop

1. Read moves since the last run, the facts, the world bible, the book outline and Jimmy's notes.
2. Decide what happens. Treat roles that didn't answer as acting on their own.
3. Write one page per role, plus the options for each.
4. Update the facts (places, items, who knows what, hidden traits like kindness to Bristle).
5. Save it as a draft or as published, depending on the setting. Mark the run done, or record the error so the page can say "the story is resting tonight".

## Surfaces

- **Player page** (small, iPad-friendly): pick a role, play the newest page aloud with the browser's speech, choose an option or type an answer. The game is mostly listening, so the page stays minimal.
- **Under the hood** (Jimmy's console): world bible, book outline, roles, drafts to approve, notes for tonight, run log.
- **No page at all** also works: Jimmy can read a chapter aloud at bedtime and type the family's answers to Claude.

## Data (Supabase, draft)

Tables use the `adv_` prefix and are registered per `04 AI/Supabase/brief.md`.

| Table | Holds |
|---|---|
| `adv_books` | Each book: title, outline, status, current chapter |
| `adv_roles` | The list of roles: name, description, voice, active |
| `adv_chapters` | One row per chapter per role: text, options, status (draft or published) |
| `adv_moves` | A role's answer to a chapter: picked option or free text, time |
| `adv_world` | World bible entries: places, characters, objects, rules, history |
| `adv_facts` | Current state: location, items, flags, hidden traits |
| `adv_dm_notes` | Jimmy's notes for the next run |
| `adv_runs` | Log of nightly runs: time, result, error |

## Privacy (public repo)

- Moves the family types live in Supabase only, never in this repo.
- The world bible can live in the repo only if it is made up. Anything personal goes in `private/`.
- No school, place or personal details in repo files or convo files.
- No secret keys in the browser. The nightly run uses Claude's own Supabase connection.

## MVP (proposed)

1. Supabase tables above, with row-level security.
2. A world bible and an outline for Book 1, seeded from the crypt story.
3. A nightly scheduled Claude task that writes the next chapter for each role.
4. The player page: pick a role, listen, answer.
5. A simple under-the-hood page: edit notes and the outline, approve drafts.

**Later:** the rules engine and prepared scenes, a map of places, spoken answers, recordings of bedtime readings.

## Open

See `convo/convo v0.1.md`.
