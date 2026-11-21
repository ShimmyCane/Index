# Athena's Piano Companion — Convo v0.6

**Project:** Athena's Piano Companion
**Round:** three more notes read from the family table on 2026-11-21 (all on the Record page, version 0.2.0, so the new build is the one loaded on the iPad). Nothing is built. This round goes with `convo/convo v0.5.md` (the silent 3-2-1 and the soft reset). Note ids are kept so the table can be updated when you say.

## The three notes

1. `n-1795231464900-qob70` (Record, Take 17): "When a recording is happening, the actual card doesn't show up and animate the recording as it goes. And when it's done, then you'll have a moment and the card will be saved."
   - *Reading:* a card for the take should appear the moment recording starts and move while you play (a picture of the sound growing, a running time). When the take ends it holds for a moment, then becomes the saved card.
   - *Plan:* a "recording" card at the left of the strip with a red dot, a running time and a picture that grows with the sound (the same picture style as the saved cards). On stop it shows "Saving..." for a moment, then settles into the normal "Take N" card. If nothing is kept (no real playing heard), the card goes away with a short message.
2. `n-1795231477979-d1sql` (Record, Take 17): "When playing back a card from the same screen, I have a little red line that moves so you can kind of see where you are during your playback."
   - *Plan:* a thin red line moves across the picture on the card while that take plays, from the start to the end, and disappears when it stops. Only the card you tapped has it.
3. `n-1795231522249-7xhma` (Record, Take 17): "OK, so when there is a gap, wait for Mississippi's or four seconds before you start counting from 3-2-1, and again no sounds so it doesn't mess up the recording."
   - *Reading:* "three or four seconds" of quiet first, and only then the (silent) 3, 2, 1. Today the pause setting is 5 seconds with the 3-2-1 starting 2 seconds in, so the take ends at 5 seconds of quiet. Under your rule the take would end at about 6 to 7 seconds of quiet (the wait plus the three counts).
   - *Plan:* ⚙️ → Recording → "Quiet before the countdown": 3, 4, 5 or 6 seconds (default 4), then a silent 3, 2, 1. Playing again at any point cancels it. The take still keeps only 2 seconds of pause at the end, so a longer wait does not make a longer take.

## Questions (answer inline)

1. **The wait.** Is **4 seconds of quiet, then a silent 3-2-1** right (the take ends 7 seconds after your last sound)? Or 3 seconds (ends at 6)? *(recommended: 4)*
   - Answer:
2. **The live card.** Right as described: a card at the left of the strip with a red dot, a running time and a growing picture, "Saving..." for about a second after the stop, then the normal card? *(recommended: yes)*
   - Answer:
3. **The red line.** Only on the Record screen's cards, or also on the take rows in Library, Browse and Listen? And should touching the picture jump to that spot? *(recommended: the red line on every page that plays a take; no touch-to-jump for now)*
   - Answer:
4. **Order of work.** With v0.5's items, the list for 0.2.1 is: silent 3-2-1 (bug), the wait before it, the live card, the red line, ending reasons and Restart listening, and the version stamp on script links. Shall I build all of it in one go once you answer?
   - Answer:

## Still open

The seven round-2 notes are built in 0.2.0 and still marked open in the table; tell me which are handled and I will mark them (`Done- `) on your yes. SQL 002 is still waiting for your paste.
