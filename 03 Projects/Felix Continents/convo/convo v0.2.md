# Felix Continents — convo v0.2

**Date:** 2026-11-24
**Asked by:** Claude · **Answers:** Jimmy, inline after each `A:`

Renamed in this round: the steps are now V1 (globe), V2 (drag the continents), V3 (human history), V4 (countries) and V5 (random worlds). Earlier notes below use the new names.

Built in this round: the timeline now runs from Pangaea (left) to today (right); V2 (drag the continents) and V5 (random worlds) is a separate page linked from ⚙️; a Family login and notes table are ready to paste (`supabase/`). Still to decide before V3 and V4 are built:

## 1. Human history (V3)

1. Which people and places should Felix see first? **Proposal:** a short list of about 8 regions with a few dates each (for example: Egypt, Mesopotamia, the Chinese dynasties, the Roman Empire, the Mongol spread, the Americas before 1492). Each region is a hand-sketched area, labelled "approximate" like the continents.
   A:
2. Should people's spread be shown as dots moving across the map, or as shaded areas that grow? **Proposal:** shaded areas that grow, with a dot where each city or capital is.
   A:

## 2. Countries over time (V4)

3. Milestones to snap to: modern, medieval, Roman, Asian dynasties (your list). **Proposal:** these five: 2000 (modern), 1200 (medieval), 100 (Roman), 1300 (Mongol era), 1800 (Qing China). Which others?
   A:
4. Zooming into a country: **Proposal:** tap a country area to zoom in on it, with a short story card for that country's time.
   A:

## 3. V2 puzzle

5. **Proposal:** pieces snap into place when they are within 3° of today's place, and a short sound-free ✓ shows. Yes?
   A:
6. **Proposal:** the dashed outline of today's map (on by default) stays on, so the puzzle has a guide. Keep it on for Felix, or off by default?
   A:

## 4. V5 random worlds

7. The sliders (continents, drift speed, years back) are in ⚙️ for now, so the time bar stays simple. **Proposal:** keep them in ⚙️ for Felix; move them into a visible panel later when you are building worlds yourself. Which do you want?
   A:
8. Each world is invented. **Proposal:** the page keeps the sentence "A made-up world" on screen, and never names real places in a random world.
   A:

## 5. Maps and sources

9. Rodinia (about 750 million years ago) is still missing. Which published reconstruction should we use for past shapes, and which open-licence map for today's coastlines? (Same question as convo v0.1, number 12.)
   A:

## 6. Family login and notes

10. The Family project needs `supabase/001_fc_notes.sql` pasted by hand (test first, then 001, then verify). After that, notes are also sent to the family table when signed in. Shall I plan a page that reads the notes back in the family (`review-notes-and-update`)? **Proposal:** yes, later.
    A:
