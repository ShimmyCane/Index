# Felix Maze — Convo v0.5

**Project:** Felix Maze
**Round:** 5, after the flags from round 4

## What Jimmy said (summary)

- Flags showed the puzzles were far too easy (2 s, 8 s, 10 s, about 30 s). The answer line of one puzzle ran under a tunnel it should not cross.
- Delete the puzzles and start again. Make a batch of 10 at five levels, from 2 to 7, each step about a doubling of solve time. Two of each. Bring the old "double five" down to level 2.
- Use the solution-driven generator, and make the puzzles more complicated.
- Merge.

## What changed

1. Old bank deleted (in git history). Flags closed as `replaced`.
2. Batch 10: ten puzzles at levels 2, 4, 5, 6, 7 (320-009 to 370-002), made solution-first. All pass the answer-line and pixel checks.
3. Counters restart at 001 (nothing was printed).

## Questions

1. **Which puzzle is the "old double five"?** I could not find a puzzle with that name or level in the bank. Tell me its title or code, and I'll rebuild it at level 2.
2. **Which five levels?** I used 2, 4, 5, 6, 7 (about 3, 10, 20, 40, 80 minutes). Level 3 and 6 are both gaps between those. Should it be 2, 3, 4, 5, 6 instead?
3. **Merge:** do you want the PR merged once checks pass, or do you want to review it first?

---

_Next round: `convo/convo v0.6.md`._
