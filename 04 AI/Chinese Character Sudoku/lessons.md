# Chinese Character Sudoku — Lessons

## 2026-10-27 — MVP

- **Word-grid density decides what's possible.** With ~1,100 two-character words, a 3×3 grid where all 12 neighbour pairs are words has only ~780 solutions over ~53 characters, and random search keeps finding the same dozen. Enumerating all grids once and sampling fixed variety. 4×4 was only feasible after letting a 4-cell line be two words (AB|CD) instead of a chain.
- **Plant hard content where it has fewest constraints.** Lesson words never fit in the top-left of a 3×3 (needs partners in all directions); planting them on the bottom row or right column works for 2×2 and 4×4.
- **Look ahead to pre-placed cells** in row-major backtracking, or the search wastes its budget discovering a conflict late.
- **Tie the rule to the generator honestly.** Easy and challenge use different rules, so they also need different generators: easy only requires row words, which gives far more variety.
- **Pinyin and traditional forms depend on the word, not just the character** (还书 huán, 头发 頭髮, 面条 麵條). Store per-word overrides and look up the word a cell is part of.
- **Pointer events, not HTML5 drag-and-drop,** for iPad dragging: a ghost tile follows the finger, `elementFromPoint` finds the drop cell, and a small movement threshold separates tap from drag.
- Tools: `wordfreq`'s `top_n_list('zh', …)` works without jieba and is a good source of candidate words to curate; `pypinyin` and `opencc` (s2tw) give pinyin and Taiwan traditional forms.
