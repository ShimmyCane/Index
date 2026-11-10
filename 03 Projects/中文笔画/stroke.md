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
- Until then, the app keeps its shape-based stroke guess. 言 would still be named wrong in some places unless it is entered by hand.
