# Athena's Piano Companion — Convo v0.2

**Project:** Athena's Piano Companion
**Round:** the first build, 2026-11-20 (version 0.1.0). Your answers to v0.1 are filled in there. You said "please just do all", and also asked for a composing page (four layers) once a few takes exist. Everything below is built and headless-tested; nothing has been tried on a real iPad or a real piano.

## What I built from your answers

| Page | What it does |
|---|---|
| `index.html` (Record) | One big circle. One tap wakes the microphone. Say **let's record / please record / start recording / start**, or tap the circle. Count-in, then recording. Ends by **a 5-second pause** (blinks, then a big 3-2-1 for the last three seconds; playing again cancels), by your **stop notes**, by saying **stop recording / stop recording please**, or by tapping the circle. The take is trimmed (a little lead-in kept, a natural fade-out), named "Take N", labelled with the player (Athena or Felix, chips at the top) and the date, saved on the device, and the page is ready again. |
| `library.html` (Library) | Every take: play, rename, change artist, album, rating, description and file name. Filter by person, rating or source. |
| `player.html` (Listen) | The "mini Spotify": browse by album, artist or rating; playlists you make, rename, order and delete; rating from the player bar; shuffle and repeat. |
| `compose.html` (Compose) | Four layers. Snip, cut (split), transform (speed, reverse, volume, fades), extend, repeat and shift clips, by dragging or with buttons. Undo and redo. Saves the piece, and saves the mix back as a take. |
| `supabase/` | Five `pc_` tables and a private bucket `pc-takes`, written, tested as a file, **not applied**. |

## Choices I made (tell me if you want any changed)

1. **Count-in styles** (⚙️ → Recording): Beeps (default), Chimes, Wood clicks, Drum, Voice ("three, two, one, play") and Lights only. Each plays a preview when tapped.
2. **Stop notes** are learned the first time you wake the page: play 3 to 5 notes, wait, then play them again to check. I compare the rhythm and a rough pitch of each note. The stop notes only count when they come after a pause of about a second, so a similar run in the middle of playing is not mistaken for them. The stop notes are cut from the end of the take.
3. **Voice "stop recording"** is on by default because you gave phrases for it. Its words may end up in the take, so the page cuts back to the last quiet moment before you spoke.
4. **Take cards** show colour, a small picture of the sound and "Take N". Each can be switched off in ⚙️ → Take cards to compare.
5. **Albums** default to "Free play 2026-11" (the month). You can set an album name for new takes in ⚙️.
6. **Compose "extend"** keeps the last moment of a clip going (like holding the pedal), by looping its tail with a soft join. It does not stretch time without changing pitch; **speed** changes pitch and length together, like a tape.
7. **Sync** runs about every 20 seconds, only while the page is waiting (not recording or playing, and not within 8 seconds of the last sound), and also right after you sign in. Takes stay on the device too.
8. The database stores takes in the Family project. Anyone signed in to the family login can read and change takes. Takes cannot be deleted from the pages (only playlist entries and pieces).

## Questions for you (answer inline)

1. **Real test on the piano.** Please try it on the iPad with the digital piano. Things I cannot check from here: does the microphone hear the piano well enough (⚙️ → "How the page hears you" shows a live bar)? Does the voice start work in Safari? Is the 5-second pause comfortable? Write what you see in ⚙️ → Notes for improvement.
   - Answer:
2. **Paste the SQL.** Next step for syncing: paste `supabase/test_001_pc.sql`, then `001_pc_family.sql`, then `verify_001_pc.sql` (in that order, in the Family project's SQL editor) and paste the verify result back. Until then takes stay on the device only.
   - Answer:
3. **Stop on voice vs piano.** If the voice words are heard while she is playing loud, the page can miss them. Should I add a "hold the circle for 1 second" way to stop as well, or is a tap enough?
   - Answer:
4. **Players.** Athena and Felix are fixed chips. Do you want a third (a guest), or the names editable?
   - Answer:
5. **Albums.** Should an album be per month ("Free play 2026-11") as now, or per day, or one per sitting (a new album each time she wakes the page)?
   - Answer:
6. **MIDI.** When you want to try the MIDI adapter, say so. It needs a laptop browser (Chrome) because iPad Safari has no Web MIDI.
   - Answer:
7. **Compose.** Four layers is the cap. Do you want snapping to a beat grid (needs a tempo), or free placement as now?
   - Answer:
8. **Use in other web apps.** The family database now holds `pc_takes` (file name, length, rating, description, album, artist, a loudness picture) and the audio in a private bucket `pc-takes`. Which app do you want to read it first? I can add a small example snippet to the project notes.
   - Answer:
