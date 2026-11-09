# Voice — Convo v0.1

**Project:** Voice
**Round:** 1 of clarifying questions (started by `/start-project`, 2026-11-09)

Answer inline under each number. Leave a blank if you don't know yet. This repo is public, so keep family details (names beyond a first name, school, health, places) out of answers and out of the stories saved here.

## What you asked (summary)

A home page with a series of stories we write together. Tap one and it plays in a natural AI voice instead of the iPad's robot voice. The audio is made once and saved with the story in the family database, and made again when the story changes. Sign-in and version control sit in the settings. While a story shows, a toggle switches to a speed-reading mode: one word at a time in one spot, a red mark on the focus letter, and a speed slider you drag.

My answer: yes, it is feasible, and making the audio ahead of time is the right way to do it (cheap, sounds real, no key in the browser). Details in `schematic.md` §2.

## The voice

1. Which voice service should we try first? My recommendation is **ElevenLabs**, because it returns the time of each word with the audio, which drives the word highlight. Alternatives: OpenAI voices (good, cheaper, no word times so we add a timing step), Google or Azure neural voices. Or: try two and compare the same story side by side in 0.2.
2. Do you already have an account and key with any of these? (Don't paste the key here. It goes in the Supabase dashboard as a secret.)
3. What should the narrator sound like: warm grown-up storyteller, a younger voice, British or American, calm bedtime pace or lively? One narrator for every story, or a voice per story?
4. Character voices (the bear speaks lower, the mouse higher): wanted now, later, or never?
5. Who makes the audio? My recommendation is a **✨ Make voice button** in the grown-up corner that calls a Supabase Edge Function, so you can do it from the iPad. The other route is a script that runs on your computer.

## The stories

6. Who are the listeners and roughly how old? (Ages only, no names needed.) This sets story length, words per minute and text size.
7. How long is a story: 2–3 minutes, 5–10 minutes, or chapters over several nights?
8. How do we write them? My recommendation: we draft in a Claude chat, I save them into the database through the grown-up corner (paste), or I add them as files that you then load. Should the kids be able to suggest a story idea in the app?
9. "As the story changes over time": do you mean you edit a story and its voice is remade (versions), or a story that grows with new chapters, or both?
10. Covers: emoji, a simple drawing made in code, or pictures you add later?

## Speed read

11. I read your note as: one word at a time, the word stays in the same spot, a red mark over the focus letter, and a drag slider for speed. Is that right? Should the word "jitter" (a small bounce to keep the eye on it), or stay perfectly still? My recommendation is still, with a red tick above and below the focus letter.
12. Speed range and start: 100–600 words a minute, starting at 200? Lower for younger readers?
13. Keep a "best speed" per reader on the device, or no scores?

## Sign-in and version control

14. Use the Family login (same as Fishes and Athena's world)? Should the kids be able to play stories without signing in (my recommendation: yes, from the cache and the bundled samples), with sign-in only for the grown-up corner?
15. Version control: is "every save makes a new version, old ones can be restored" enough, or do you also want to see what changed between two versions?

## Settings and feedback

16. ⚙️ settings button in the lower right with voice, text size, speed-read default, Notes for improvement, sign-in, the grown-up corner, a database check and opt-in errors at the bottom. Anything to add or remove?
17. Notes for improvement are saved with the story, its version and the mode. Keep notes on the device first and in a `voice_notes` table once the database is set up?

## Next step

18. Shall I build increment 0.1 now (shelf, story screen, speed read, ⚙️ with notes, two sample stories read by the iPad's best voice, nothing external)? It needs none of the answers above except 11 and 12, which have defaults.
