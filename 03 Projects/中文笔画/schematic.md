# 中文笔画 — Schematic

Status: idea (planning, no page built yet)
Track: A. Family play (for the children; the ⚙️ holds everything secondary)

## Purpose
A kids' iPad game for the characters on the weekly 中文 worksheet. The child sees a pinyin (拼音) and a box, then writes the character with a finger or Apple Pencil, stroke by stroke. It follows the same kind of 3.0 tracing as Chinese Character Sudoku, so the two can share code later.

## Worksheet pattern (from the photo)
- Numbered boxes, each with the pinyin on top and the character below.
- The character is the answer to the pinyin.
- The worksheet is marked with a score out of ten.

## The first character bank (from the photo, traditional)
| # | 拼音 | 字 | Strokes in the photo |
|---|---|---|---|
| 1 | huáng | 黃 | (check the photo: 廿 + 由 + 八) |
| 2 | duǒ | 朵 | 几 + 木 |
| 3 | xiǎng | 想 | 相 + 心 |
| 4 | yán | 言 | |
| 5 | yào | 要 | |
| 6 | qīng | 青 | |
| 7 | chī | 吃 | 口 + 乞 |
| 8 | yáng | 羊 | |
| 9 | qǐng | 請 | 言 + 青 (check the reading) |
| 10 | zhǎo | 找 | |
| 11 | shuō | 說 | 言 + 兌 |
| 12 | jiù | 就 | 京 + 尤 |

Pinyin and characters are from the photo and are still to be confirmed by Jimmy (see `convo/convo v0.1.md`).

## Planned screens
1. **Play** (main screen): one big pinyin, one big writing box, a Hint button (stroke order animation), Undo, and Next. Nothing else on screen.
2. **Stroke guide** (inside ⚙️): the stroke-order animation, replayed on demand.
3. **Score** (small, on the main screen after a character): a star or a check, read from the stroke check, not a number.

## ⚙️ (settings gear, lower right)
- Stroke animation speed.
- Show the pinyin on every box, or only the first try.
- Choose which numbered boxes to practise (from the photo set).
- Errors at the bottom, behind "Show errors".
- Feedback notes ("Notes for improvement") from the first build (`02 Refs/Skills/feedback_notes.md`).

## Data and storage
- No database for the first build. Progress stays on the device (local storage, in a try/catch).
- Character data: `assets/characters.json` (pinyin, traditional character, stroke data), built from the photo list.
- Stroke data: from `hanzi-writer` (copied in `js/vendor/`, licence kept).
- Fonts: `assets/fonts/wenkai-subset.woff2` (OFL, copied from the Chinese Character Sudoku repo).

## Shared from Chinese Character Sudoku (copied for now)
- `css/style.css` (the general look and layout).
- `js/vendor/hanzi-writer.min.js` and its licence.
- `assets/fonts/` and `assets/CREDITS.md`.
- The game logic is not copied yet; it will be written here after the questions are answered.

## Open questions
See `convo/convo v0.1.md`.

## Style
Kids' iPad look (`02 Refs/Skills/ipad_website.md`): light pastel, bold 2.5–3.5px borders, big touch targets (48–68px), one main area on screen, gear in the lower right.
