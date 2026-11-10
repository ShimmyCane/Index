# 中文筆畫 — Stroke research (round 3)

Status: partial. Only the stroke counts and 言 are checked. The stroke names for the other characters are not yet sourced. Nothing here is applied to the app yet.

## Sources and why they were limited
- zdic.net and the Taiwan MOE stroke-order site (stroke-order.learningweb.moe.edu.tw) both failed to resolve from this session, so their stroke-by-stroke pages could not be read.
- Search results gave stroke counts and a few stroke sequences. The sources are listed per row below.

## Stroke counts (checked)
The counts match the stroke data in `data/strokes.js` (hanzi-writer-data) for all 12 characters.

| 字 | 拼音 | 畫數 | Check |
|---|---|---|---|
| 黃 | huáng | 12 | [strokeorder.com](https://strokeorder.com/chinese/黃) via search, plus data file |
| 朵 | duǒ | 6 | [writechinese.com](https://www.writechinese.com/en/hanzi/朵) via search, plus data file |
| 想 | xiǎng | 13 | [strokeorder.com](https://strokeorder.com/chinese/想) via search, plus data file |
| 言 | yán | 7 | [hanzipi](https://www.hanzipi.com/%E8%A8%80.html) and [strokeorder.com](https://strokeorder.com/%E8%A8%80.html), plus data file |
| 要 | yào | 9 | [kangxizidian](https://kangxizidian.org/en/hanzi/yao/%E8%A6%81.html), plus data file |
| 青 | qīng | 8 | data file only |
| 吃 | chī | 6 | [writechinese.com](https://www.writechinese.com/en/hanzi/吃), plus data file |
| 羊 | yáng | 6 | [writechinese.com](https://www.writechinese.com/en/hanzi/羊), plus data file |
| 請 | qǐng | 15 | [dong-chinese](https://www.dong-chinese.com/wiki/請) via search, plus data file (traditional form) |
| 找 | zhǎo | 7 | [strokeorder.com](https://strokeorder.com/chinese/找), plus data file |
| 說 | shuō | 14 | [dong-chinese](https://dong-chinese.com/wiki/說) via search, plus data file |
| 就 | jiù | 12 | data file only (the search for 就 did not return a count) |

## 言 (in 請 and 說): checked
Sequence, from two sources (hanzipi and a stroke-order dictionary): 點、橫、橫、橫、豎、橫折、橫 (7 strokes).

**Discrepancy:** Jimmy's note says 點 橫橫橫豎橫豎橫 (8 items). That list has one more stroke than 言 has. The sources give 橫折 as the sixth stroke, not 橫 + 豎. The 8-item version is probably the note's mistake, not the character's, but please confirm with the child's worksheet or a stroke-order video before we use it.

## Not yet sourced
Stroke names for 黃, 朵, 想, 要, 青, 吃, 羊, 請 (other than 言), 找, 說, 就. The search results did not give stroke-by-stroke names for these. The one sequence offered for 朵 (撇 豎 點 橫 撇 捺) is Jimmy's, and no source confirmed it.

## Applied
- 言 names (點、橫、橫、橫、豎、橫折、橫) are in `data/batches.json` and shown on the page. The shape-based guess has been removed, so unchecked characters show only the stroke number.

## Next steps
- Retry the stroke pages once zdic.net or the MOE host is allowed for this session. Or Jimmy can paste the stroke names from the MOE stroke-order page for each character.
- Until then, the other characters show only their stroke number. Names are added to `data/batches.json` as they are checked.

## The algorithm (round 3, from research)
Sources: the basic-stroke rules in [笔画 (Wikipedia zh-tw)](https://zh.wikipedia.org/zh-tw/%E7%AC%94%E7%94%BB), the five-class system of the 現代漢語通用字表 (橫、豎、撇、點、折), and the 永字八法 terms in [Basic Chinese Strokes (ecj.hk)](https://ecj.hk/guides/basic-chinese-strokes/). The rules are applied to the centre line of each stroke in `data/strokes.js` (hanzi-writer medians).

1. Simplify the centre line to its main corners (Ramer–Douglas–Peucker, tolerance 18). Small wobbles disappear.
2. Each straight edge between corners is a piece with a direction. Edges under 40 units are dropped.
3. Direction classes (screen coordinates, y down):
   - 橫: rightward, nearly level (vertical part under 45% of the horizontal).
   - 提: rising to the right.
   - 豎: downward, nearly vertical.
   - 撇: down to the left.
   - 點 or 捺: down to the right. 點 when the piece is 220 units or less, 捺 when longer.
   - flick: leftward or upward. A last flick of 60 units or more is a 鉤.
4. Neighbouring downward pieces that point within 80° of each other are merged (a 豎 that bends is one stroke), then classified again.
5. Drop any piece shorter than a fifth of the stroke. These are lead-ins and tails.
6. Name: one piece gives its name. Two pieces give a pair name: 橫+豎 = 橫折, 豎+橫 = 豎折, 橫+撇 = 橫撇, 撇+橫 = 撇折. A flick at the end adds 鉤. A stroke under 220 units in total is 點.

Implemented in `tools/stroke_names.js` (run `node tools/stroke_names.js 言 請`). The output goes into each item's `names` in `data/batches.json`.

## How far the algorithm is checked
- 言: 7 of 7 match the sequence from the sources (點 橫 橫 橫 豎 橫折 橫). This is the only character with a sourced sequence.
- 羊, 找: the names follow the usual order as I know it, but no source here confirmed it, so they are not checked.
- 黃, 朵, 想, 要, 青, 吃, 請, 說, 就: names from the algorithm only. Known doubtful spots: 朵 starts 豎 (the 几 part usually starts 撇); 想 and 說 have several 點 in a row, which may be a 捺 or a 點 misread; 請 and 說 have 橫撇 where the 言 radical is 點 橫 橫 橫 豎 橫折 橫.
- Next check: Jimmy to compare the names for each character with a stroke-order video, and send corrections. Any corrected name goes in `names` by hand, and then the algorithm is not used for that character.
