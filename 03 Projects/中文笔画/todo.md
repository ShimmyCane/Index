# 中文筆畫 — To do

## Round 1 — notes from the family database (2026-11-10)

Source: `zhbh_notes` (9 open notes, all on version 0.1.0). Each item below says whether the code already does it.

| # | Character | Note (summary) | Kind | Status |
|---|---|---|---|---|
| 1 | 請 | Pronunciation wrong; read the character before writing and again after | Bug | Partly built: the page reads before and after (⚙️ 朗讀字音 on). The voice is not Mandarin. See #3. |
| 2 | 請 | 言 radical: first stroke is 點, then 橫橫橫豎橫豎橫. The stroke name was wrong | Bug | Open. The stroke names are a shape guess. See #5. |
| 3 | 黃, 就 | Pronunciation wrong; use the voice repository | Bug | Open. Needs a decision on the voice source (convo v0.3, Q1). |
| 4 | 羊 | Use a female voice | Feature | Open. Needs a voice choice (convo v0.3, Q2). |
| 5 | 請 (and all) | Stroke names for each character, written by Jimmy | Feature | Open. Needs names from Jimmy (convo v0.3, Q3). |
| 6 | 請 | A visible English toggle on the main screen | Design question | Open. Conflicts with the traditional-only brief (convo v0.3, Q4). |
| 7 | 就 | Under each character, show how the character evolved | Feature | Open. Needs content (convo v0.3, Q5). |
| 8 | 羊 | Under each character, a few common two-character words that contain it | Feature | Open. Needs words (convo v0.3, Q6). |

Done (not from the notes)
- [x] `family.js`: "status is not a function" after sign-in, caused by a missing helper in the sync step. Fixed in the working tree (not yet committed). Check it on the iPad: sign in, then the status line should say 已登入.

## Next after answers
- Build the items Jimmy answers in convo v0.3, with a new version number.
- Mark each row done only after the code shows it and a device check passes.
