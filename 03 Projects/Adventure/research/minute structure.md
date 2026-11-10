# Minute: story structure, music and director's notes

**Project:** Adventure (Ondra, Athena's story)
**Status:** research and proposal, 2026-11-10. The format below is partly built (`story/b1c1.js`, `js/narrate.js`, `js/sound.js`) and partly proposed (marked).

## What a minute is

The minute is the middle catch-up: about one minute read aloud, about 150 words (`text_short`). The player shows it after an hour away. The peek is a poem (`poem structure.md`); the whole page is about five minutes (`text_long`, with its script). The minute sits between them: enough to say what happened and what the family must choose, not the whole chapter.

Target: **about 150 words, 60 to 75 seconds aloud** at the narrator's rate (0.92 in the Voice format).

## Shape (beats)

Each minute has five beats. Each beat is one or two script lines.

| # | Beat | Words (about) | Purpose |
|---|---|---|---|
| 1 | **Hook** | 15 | One sentence that puts a picture in the listener's head. |
| 2 | **What happened** | 45 | The family's scenes, told in order (`at`). Who did what. |
| 3 | **The turn** | 35 | The world changes a little: a sound, a sign, a new person. Ends the middle. |
| 4 | **Light** | 20 | The funny beat (rule "Light in the dark"). Keep it from the chapter's own characters. |
| 5 | **The question** | 35 | The chapter's `prompt`, with 2 or 3 options in plain words. Ends on the question. |

Rules:
- Only one turn per minute. More than that and the listener loses the thread.
- The question is always the last line, and it is read in a slower rate (the narrator's `rate` can drop 0.1 for that line only, via the cast or a `speed` on the line).
- No new names in the question. Options must be things the family can act on.

## Music

The player has one tune per chapter, set by the script's top-level `music` field. The tunes are in `js/sound.js`: `forest` is the one Adventure uses now; the others (japan, korea, china, france, spain, italy, netherlands, australia) are there from Voice but not in Ondra.

| Part of the minute | Music | Why |
|---|---|---|
| Hook and what happened | `forest` (soft, looping) | Sets the place. Quiet enough for the narrator. |
| The turn | `forest` (same tune, the sound effect carries the turn) | Keeps one tune, so the listener is not asked to adjust. |
| Light | `forest` | Keeps the mood light. |
| Question | `forest` (stops after the question, see below) | A short silence helps the family choose. |

Music rules:
- **One tune per minute.** Set `"music": "forest"` at the top of the script (already supported).
- **Stop before the question** when the minute ends on a choice: the tune fades out and the question is read alone. *Proposal:* a `"music": "stop"` line cue (not built; `narrate.js` plays one tune for the whole chapter now).
- **Sound effects, not music, mark the turn.** Use `sfx` on the turn line: `hoot`, `hum`, `bell`, `howl`, `wind`, `magic`. Keep to one per minute.
- **Volume.** Music stays under the narrator. Do not add a second tune for the Reckoning; a sound effect is enough.

## Sound effects allowed

`knock door wind birds axe steps growl splash waves howl bell gulp magic hoot hum` (`js/narrate.js` and `js/sound.js`). Pick from the list; do not invent new names.

## Director's notes

Director's notes are hidden notes on a script line: they show only when the family turns on 🎬 Director's notes in ⚙️, and are never read aloud. They help a parent or a child read the minute in character, and they record why the storyteller wrote it that way.

Note kinds (from the Voice format, `notes: [{ kind, text }]`):

| Kind | What it says | Example |
|---|---|---|
| `motivation` | Why the character does it | "Bristle wants to keep the family close." |
| `acting` | How to say the line | "slow, warm" |
| `sound` | What the sound should be doing | "the hoot comes from far off, then near" |
| `blocking` | Where the speaker is in the scene | "Granny Wren is at the door, not inside" |
| `gesture` | What the speaker does with their body | "Athena lifts the key to the light" |
| `thought` | A hidden thought of the character, never read aloud | "She has not told anyone about the bell." |

Rules for director's notes:
- **At most two notes per line**, and only on lines that need them. The minute has about six lines; most have none.
- **Keep them short** (one line, under 15 words).
- **Use the notes for the turn and the question.** The hook and light beats need only `acting`.
- **Never put a secret answer in a note** that a child could read before the question. `thought` notes are for the storyteller's continuity, not for puzzles.
- Notes are text only in the database and the script. They are not in the repo (family scenes stay in Supabase).

## Example (a sketch, about 90 words)

```json
{ "music": "forest",
  "cast": { "narrator": { "name": "Storyteller", "icon": "📜", "pitch": 1, "rate": 0.92 },
            "bristle": { "name": "Bristle", "icon": "🐕", "pitch": 0.9, "rate": 0.95 } },
  "script": [
    { "who": "narrator", "text": "The moss is wet under the Tree, and the bells are ringing." },
    { "who": "narrator", "text": "Athena walked to the old woods, and Bristle ran ahead.", "notes": [{ "kind": "blocking", "text": "Bristle goes first, then waits." }] },
    { "who": "bristle", "text": "Something is humming down there. Can you hear it?", "sfx": "hum",
      "notes": [{ "kind": "sound", "text": "the hum starts low and rises" }, { "kind": "motivation", "text": "He wants to be brave for her." }] },
    { "who": "narrator", "text": "Then a hoot, from the branches above. Bristle's eyebrows went up." , "sfx": "hoot" },
    { "who": "narrator", "text": "What do you do now?", "speed": 0.8 }
  ] }
```

The sketch is for shape only. It is not a real chapter.

## Checklist before a minute goes into `adv_chapters.text_short`

- [ ] About 150 words; read aloud it takes 60 to 75 seconds.
- [ ] Hook, what happened, one turn, one light moment, question.
- [ ] Question is last and has 2 or 3 options.
- [ ] One tune (`music`), one sound effect on the turn at most.
- [ ] Director's notes: two per line at most, short, no answer spoiled.
- [ ] Same chapter as `text_tiny` (poem) and `text_long` (whole page): the minute is a shorter cut of the same story, not a different one.

## What is built and what is not

| Thing | Status |
|---|---|
| `text_short` (about 150 words) | Built; storyteller writes it now. |
| `music` top-level | Built (`js/narrate.js` plays it). |
| `sfx` per line | Built. |
| `notes` per line, 🎬 Director's notes toggle | Built (chapter 1 uses them). |
| Music change or stop per line | **Not built.** Needs `narrate.js`. |
| The owner's own music from an asset/music folder | **Not built.** Requested 2026-11-10 for later. |
| Peek as poem (`text_tiny`) | Built 2026-11-10: `storyteller.md`, chapter 1 (seed and bundle), and the player keeps the poem's line breaks. |
| A `form` field for the peek | **Not built.** |

## Decisions (owner's answers, 2026-11-10)

1. **Every chapter has a poem peek.** Haiku when the mood is unclear (not iambic tetrameter, as first proposed).
2. **One tune per minute, for now.** The owner plans to use his own music later, taken from an asset/music folder and put in the tune slot. Not built. The stop before the question is also not built.
3. **Director's notes hidden by default** in ⚙️, as now. No short note on the minute.

## Sources and reference

- Poem forms the peek uses: see `poem structure.md`, Sources.
- The script format (cast, script, sfx, notes) and its note kinds are from the Voice repo (`ShimmyCane/Voice`), as used in `story/b1c1.js` and `storyteller.md`.
- Tunes and sound effects: `js/sound.js` (the list in its header).
