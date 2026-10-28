# Chinese Character Sudoku — Lessons

## 2026-10-27 — MVP

- **Word-grid density decides what's possible.** With ~1,100 two-character words, a 3×3 grid where all 12 neighbour pairs are words has only ~780 solutions over ~53 characters, and random search keeps finding the same dozen. Enumerating all grids once and sampling fixed variety. 4×4 was only feasible after letting a 4-cell line be two words (AB|CD) instead of a chain.
- **Plant hard content where it has fewest constraints.** Lesson words never fit in the top-left of a 3×3 (needs partners in all directions); planting them on the bottom row or right column works for 2×2 and 4×4.
- **Look ahead to pre-placed cells** in row-major backtracking, or the search wastes its budget discovering a conflict late.
- **Tie the rule to the generator honestly.** Easy and challenge use different rules, so they also need different generators: easy only requires row words, which gives far more variety.
- **Pinyin and traditional forms depend on the word, not just the character** (还书 huán, 头发 頭髮, 面条 麵條). Store per-word overrides and look up the word a cell is part of.
- **Pointer events, not HTML5 drag-and-drop,** for iPad dragging: a ghost tile follows the finger, `elementFromPoint` finds the drop cell, and a small movement threshold separates tap from drag.
- Tools: `wordfreq`'s `top_n_list('zh', …)` works without jieba and is a good source of candidate words to curate; `pypinyin` and `opencc` (s2tw) give pinyin and Taiwan traditional forms.

## 2026-10-28 — character bank from photos

- **Cross-check hand transcription against totals printed on the page.** The photos print "60字", "100个字", "240字"; matching those counts, and noticing that the 60-character poster equals the first five rows of the 240 table, caught transcription errors without needing a second reader.
- **Restricting the vocabulary to a given character set is cheap if generation is word-based.** Filtering 1,311 words down to 612 still generated every size and mode with plenty of variety; adding poster examples and kid words brought it to 976. Check generation before assuming a smaller list needs a smarter engine.
- **Keep two sets: characters that appear in words, and the whole bank.** Generation needs the first; distractors can use the second so every character in the textbook gets practice even before it has a word.
- **Saved game state needs the data version.** Changing the word list can leave a restored puzzle containing characters that are now out of scope; store the data version with the save and drop it on mismatch.
- **A lesson word can sit outside the bank** (叫声: 声 is on none of the photos). Surface it as a question rather than silently widening or shrinking the bank.

## 2026-10-28 — 超纲 characters and lesson words

- **Treat "add it but mark the pinyin" as a display rule.** Characters the child hasn't been taught (the booklet's 超纲字, and 声) always show pinyin, independent of the pinyin toggle. Stated in `convo v0.4` so Jimmy can say if only a data entry was meant.
- **A bigger lesson list trades variety for relevance.** Going from 8 to 78 lesson words kept every puzzle on-topic but cut distinct 3×3 challenge boards (about 20 → 15 per 30 tries), because the generator prefers boards containing lesson words. The recent-solutions list covers repeats in real play.
- **Give an out-of-bank character a few ordinary words**, not only the lesson word that needed it (叫声 plus 大声 小声 笑声 哭声), so it can appear in more puzzles.

## 2026-10-28 — "recently learned" is a set of characters

- **Jimmy defines the current lesson by characters (the last 60 in the textbook table), not by words.** Favouring a character set needs different machinery than favouring a word list: plant words that contain them, try them first in the search, and score boards per cell. Ask which unit the user means before building lesson bias.
- **Some recent characters had no words at all** (为, 干, 呢) and several had one or two. Count words per target character before relying on a bias; add short everyday words for the thin ones.
- **Preferring characters made the search 10× slower until restarts were capped.** A planted word that cannot fit burned 12 restarts × 3,000 steps; 4 restarts × 800 steps for planted attempts (free search keeps more) brought 4×4 from ~800 ms back to ~100 ms with the same recent-character share. Time the generator after changing its bias.
- **Check the date.** I labelled a change log entry with tomorrow's date; read the current date from the session, not from habit.

## 2026-10-28 — 2.0 lines and 3.0 tracing

- **When a user dislikes a mechanic, keep it and add alternatives behind a switch.** 1.0 stayed; 2.0 and 3.0 are links in ⚙️ (`#v1/#v2/#v3`), so Jimmy can compare. Hash links also let a game be bookmarked.
- **Reuse the board by changing its shape and rule, not the code.** A 2.0 puzzle is an n×2 board with a row rule; drag, undo, win and saving didn't change. Adding `kind`, `rows`, `cols` to the puzzle and generalizing four functions was enough.
- **"Decoys" can teach order.** For a blank after 白, 明 is tempting (明白) but wrong (白明). Wrong-order decoys came free from the word index and suit a game about word order; also exclude any decoy that would be a second right answer.
- **Don't write stroke-order logic from scratch.** Hanzi Writer (MIT) plus hanzi-writer-data (Arphic PL) gives outlines, stroke order, matching, hints and animation. Bundle both and a custom loader so it works offline; keep the licence texts and a credits file.
- **Network allowlists differ per host.** jsDelivr was blocked but the npm registry worked, so `npm pack` fetched the library, the stroke data and the font. Try the registry before concluding a package is unreachable.
- **Subsetting a calligraphy font to the characters used** (359 glyphs, 78 KB woff2) makes a Kai font work offline on every iPad, where system Kai fonts are uncertain. Check the licence (SIL OFL: keep the licence, don't claim a reserved name) and ship the build tool.
- **Test touch input with real touch events** (`Input.dispatchTouchEvent` over CDP), not only the mouse, and check the page doesn't scroll while drawing.
- **Draw test strokes from the data itself** (stroke medians mapped through the library's positioner maths) to drive a tracing game in a headless browser.
- **Grading rule used:** ⭐⭐⭐ = no mistakes and no hints; ⭐⭐ = at most two combined; ⭐ otherwise; best stars per character stored. Probably needs tuning with real children.
