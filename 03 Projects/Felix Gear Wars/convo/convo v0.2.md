# Felix Gear Wars — convo v0.2

**Date:** 2026-11-16
**Asked by:** Claude · **Answers:** Jimmy, inline after each `A:`

Round 1 is answered and built (MVP 0.1.0). Where your answers left room, I chose; tell me what to change.

## What I decided

1. **Multiplier gears.** "Start at 1x, merge up to 8x": a ×1 gear is a plain connector that passes ticks on (it lets a chain reach a far peg), and merges go ×1 → ×2 → ×4 → ×8. Fighter gears also merge up to level 4.
2. **Real time with no pause between waves.** The first wave starts when Felix taps Start; later waves come on a timer (about 24 s) and ▶▶ calls the next one early.
3. **Fortress.** Reaching the second screen and knocking down the Rust fortress also wins the level. Free-for-all has an unbreakable fortress.
4. **Stars.** 3 stars for losing 10% of lives or fewer, 2 for 40% or fewer. "Adaptive" is built as: lives grow with the level, and after a lost try the next one starts with +20 coins (up to +60).
5. **Reading.** Pictures for levels 1–3, short sentences for 4–7, a paragraph from level 8. ⚙️ can force one.
6. **Utility gears.** Lightning arrives in chapter 3, Shuriken in chapter 5, Rockets in chapter 7. Free-for-all has all of them.
7. **Enemies leak, they do not fight the wall.** One that crosses the wall costs a life and vanishes; a boss costs 5 lives.

## Questions

1. Is the heart's pace right (one turn every 1.6 seconds, a spearman gear next to the heart every 3 turns)? Faster, slower, or fine?
   A:
2. Should the enemy fortress win the level when it falls, or should you have to hold every wave too?
   A:
3. Are bosses too hard or too easy? (The bot test says chapters 5 to 8 are tougher; a child with counters should do better than the bot.)
   A:
4. Lives grow by one a level (20 up to 43). Enough? Should a lost life sound as scary as it does now?
   A:
5. Which art style do you like best for the whole campaign? Should I add a sixth (for example Persian miniature or Japanese scroll)?
   A:
6. Should story cards be read aloud in a later round (the Adventure project has a voice recorder)?
   A:
7. Anything that felt wrong on the iPad (drag, size of buttons, speed, sound)?
   A:
