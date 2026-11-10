# Adventure — Schematic

**Status:** MVP + world tools built. A world (Ondra), a Book 1 outline and a voiced chapter 1 added 2026-11-10. Not yet tried on the iPad. Database tables waiting to be applied (see `04 AI/Adventure/brief.md`).
**Owner:** Jimmy
**Conversation:** `convo/convo v0.1.md` (design), `convo/convo v0.2.md` (answers), `convo/convo v0.3.md` (world tools), `convo/convo v0.4.md` (the world of Ondra, chapter 1, voices)
**World bible:** `world/` (read `world/bible.md` first; also readable on the page `lore.html`)
**To-do:** `todo.md`

## Purpose

A family story game played like correspondence chess. The family takes roles in a shared world. Each person checks in when they can, catches up on the story, and adds to a scene. Overnight, an AI storyteller reads the scenes and writes the next chapter. Jimmy can step under the hood as dungeon master and change anything.

It grows out of the car-ride adventures Jimmy told with Athena using ChatGPT (the crypt, the Sun and Moon Chest, Bristle the dog).

## The world: Ondra

You wake in the moss at the roots of Vael, the World Tree, with no name and no memory, a humming key with a sun and a moon on it, and a scruffy grey dog (Bristle) who has guarded your sleep. Around the Tree: the Greenhollow forest, the small village of Mossbrook (Granny Wren, linden bells, hearthwisps) and Aun, a village grown from living roots, empty since the whole world was made to forget the Rootkin who lived there. Beyond: lakes made by the Moon's tears, a desert that was a forest, a city of gold domes and a city of iron. Three hundred years of peace are fraying. When the Tree blooms, once in a thousand years, everything forgotten comes back: the Reckoning.

| File | What |
|---|---|
| `world/bible.md` | Myths, ages, the Hush and the Seedlings, the Twin Keys, the Reckoning, how dark it gets, how the world lives (Leaves, Rings, Echoes, Clocks, Standing), inspirations |
| `world/regions.md` | The lands, with history, places, customs and hooks |
| `world/peoples.md` | Cultures and factions, people to meet, hidden and forgotten peoples, who thinks what of whom, the injustices |
| `world/creatures.md` | Wardens, creatures, spirits, dark things, the forgotten |
| `world/book1.md` | Book 1, *The Waking*: 8 chapter outlines with puzzles and branches; Books 2–5 sketched |

The database holds a summary (`adv_entries`, places, planned chapters) for the storyteller; the files hold the full world.

## Voiced chapters (borrowed from Voice)

A chapter can carry a **script**: who speaks each line, sound cues and hidden director's notes (the script-story format of `03 Projects/Voice`). On **The whole page**, the player page then shows a label for each speaker and 🔊 reads it with a cast:
1. **Recorded cast** (Kokoro voices, made ahead by `tools/make_voice.py`): `story/<id>.audio.js` + `audio/<id>.cast.mp3`, with line and word highlight. Used only while the recording matches the text.
2. **iPad voice**, one line at a time with each character's pitch and rate, when there is no recording or ⚙️ says so.
Sound effects and a soft forest tune (`js/sound.js`, copied from Voice, Web Audio, no files) play along. Tap a line to read from there. ⚙️: Story voices, 🔔 Sound effects, 🎵 Forest music, 🎬 Director's notes.

Chapter 1 ("Who? Who?") is bundled in `story/b1c1.js` with a 4½-minute recording (cast: Storyteller `bm_fable`, You `af_river`, Whisperfox `af_nicole`, Grandmother Owl `bf_alice`). Chapters the storyteller writes carry their script in `adv_chapters.script`.

## How it plays

1. **Catch up.** The page opens on the newest chapter, sized to how long it has been on this device: after 12+ hours the whole page (about five minutes aloud), after an hour a minute's worth, after a few minutes a peek of two sentences. Chips switch length. 🔊 reads it aloud. Chapters missed in between show as one line each.
2. **Roles, not players.** A row of character pictures. Anyone taps any character; the game never tracks who is playing.
3. **Talk.** Tapping a character opens its microphone. Speech is transcribed by the browser and appended. Typing (or the keyboard's own 🎤) works too. Words are added, never edited or removed. A character may have a 🤫 whisper from the chapter that only they hear.
4. **Build a scene.** Tap another character to have them answer. Beats keep their order and time: the dog, then the old lady, then the storyteller, then the dog again. The scene is saved on the device until sent.
5. **Send.** 📮 sends the whole scene as one package (second tap to confirm).
6. **Sleep.** Until the storyteller has run, the page says it is asleep and the scenes are tucked in. Then a new chapter appears.
7. **The story never stalls.** With no scenes for a day, the storyteller writes a short chapter anyway.
8. **Puzzles and values.** More than one right answer; clever, kind and brave answers branch differently; wrong answers bring hints. Books of about 7–10 chapters, each with a real ending.

## The dungeon master

| Part | When | Does |
|---|---|---|
| **Storyteller** (Claude, following `storyteller.md`) | Nightly (scheduled task, to set up) or on request | Reads all story notes, roles, recent chapters and waiting scenes. Writes the next chapter in three lengths with whispers and a closing question. Updates world, history and plan. Logs the run. |
| **Jimmy, under the hood** (`hood.html`) | Any time | Edits everything as text: story notes, characters, chapters, scenes. Sees every change with who made it, and rolls back one change or everything after a time. |
| **Jimmy, world builder** (`world.html`) | Any time | Map of places with nested maps, a journal for every character and place sorted by the latest story, and the plot as planned chapters. |
| **Rules engine** | Later | Daytime mechanics without AI. See `todo.md`. |

Every page has the same ⚙️ menu: Story, World, Under the hood, All projects.

## Files

| File | What |
|---|---|
| `index.html`, `play.css`, `js/play.js` | Player page |
| `hood.html`, `hood.css`, `js/hood.js` | Under the hood |
| `world.html`, `world.css`, `js/world.js` | World: map, characters & places, plot |
| `style.css`, `js/common.js`, `js/config.js` | Shared look, Supabase client, sign-in, gear, errors |
| `data/fallback.json` | Bundled copy of chapter 1 for offline |
| `lore.html` | Reads the world bible (`world/*.md`) in collapsible panels (`lib/marked.min.js`, MIT, vendored) |
| `world/*.md` | The world bible and Book 1 outline |
| `story/b1c1.js`, `story/b1c1.audio.js`, `audio/b1c1.cast.mp3` | Chapter 1 as a voiced script, its recording and timings |
| `js/narrate.js`, `js/sound.js` | Cast narration (recorded or iPad voice) and synthesized sound effects and tunes (from Voice) |
| `tools/make_voice.py` | Makes the recorded cast for `story/*.js` with Kokoro (model files stay outside the repo) |
| `supabase/004_script.sql` | `script` column on chapters (run after 003) |
| `supabase/001_adventure.sql` | Tables, change log, rollback functions, registry |
| `supabase/003_world.sql` | Places, journal, planned chapters (run after 001) |
| `supabase/002_seed.sql` | Book 1: roles, the world of Ondra in short, chapter 1 (voiced), places, planned plot, clocks (run last) |
| `storyteller.md` | Instructions for the storyteller run |
| `todo.md` | Next steps, later ideas, things to research |

## Data (Supabase **Family** project, prefix `adv_`)

| Table | Holds |
|---|---|
| `adv_roles` | Characters: key, name, emoji, color, blurb, voice, active |
| `adv_entries` | Everything else as text, by kind: world, character, history, plan, theme, rule, note, setting |
| `adv_chapters` | Book, number, title, `text_tiny` / `text_short` / `text_long`, `whispers` (role → text), `prompt`, `status` (planned / published), `plan`, `script` (voiced chapter, optional) |
| `adv_places` | A tree of places; each child has a box (`x`, `y`, `w`, `h` %) on its parent's map |
| `adv_notes` | Append-only journal about a role, place or story note, optionally tied to a chapter |
| `adv_turns` | A sent scene: ordered `beats` `[{role, text, at}]`, status waiting/used |
| `adv_runs` | Storyteller runs: status running/done/failed, note |
| `adv_history` | Every insert, update and delete on roles, entries, chapters, turns, places and notes, with before/after and actor (`family` or `claude`) |

Functions: `adv_restore(history_id)` puts one row back as it was before that change; `adv_restore_to(time, tables)` undoes everything after a time. Signed-in family account only; anon has no access.

## Privacy (public repo)

- The family's scenes live in Supabase only, never in this repo.
- Seed content is made up. Saved ChatGPT chats go in `private/` (git-ignored).
- The page holds only the publishable key; the tables open only to the signed-in family account.

## Later

Story-creation page, rules engine, recordings, an early-wake ping. See `todo.md`.
