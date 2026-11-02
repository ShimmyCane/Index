# Living Room Scene: brief

## Goal and boundaries
Build a flat scene from one living-room photo over 10 iterations (V1 to V10). Each version is saved as its own file with a PNG render, and the render is compared with the photo before the next version is made.

Boundaries: deliverables stay in `03 Projects/Living Room Scene/`. No build step. The photo is not in the repo.

## Current state
- 10 versions built. `living_room_v10.html` is the current one.
- Renders for each version are in `03 Projects/Living Room Scene/renders/`, with a contact sheet at `renders/progress_sheet.png`.
- Style follows Jimmy's pastel preferences (bold outlines, offset shadows). This is a stylistic choice, not a photographic match.

## Verified vs unverified
- Verified: each version was rendered in headless Chromium at 1000x750 with no page errors, and each render was looked at against the photo.
- Unverified: how it looks on an iPad, and how Jimmy judges the likeness. Nobody has checked it against the photo except Claude.

## Version log
| Version | File | What changed | Main gaps left |
|---|---|---|---|
| V1 | `living_room_v1.html` | First trace from the photo's pixel grid: TV, two yellow shelves, books, plants, windows, futon, table, chairs, blue chair, rug, shoes, bin | Table top too thin, chairs without white frames, futon boxy, floor flat, monstera has no stems |
| V2 | `living_room_v2.html` | Thicker table top, white chair rails, futon back lowered with seams, monstera stems, floor plank seams | Floor seams read as bricks |
| V3 | `living_room_v3.html` | Long laminate planks (dashed grain lines), darker blinds, ceiling line | Monstera leaves too small compared with the photo |
| V4 | `living_room_v4.html` | Larger, fuller monstera leaves; darker futon | Chair slats missing; little on the shelf tops |
| V5 | `living_room_v5.html` | White slats on the chair backs; small items added (bottle, box, speaker, card) | Table top still flat |
| V6 | `living_room_v6.html` | Soft floor shadows under furniture; white window sills | Corner plant sparse |
| V7 | `living_room_v7.html` | Fuller corner plant; table top shown in perspective | Table legs thin |
| V8 | `living_room_v8.html` | Rounded, thicker table legs; TV cable; small cup on the table | Speaker and cable placement approximate |
| V9 | `living_room_v9.html` | Soft window light on the wall; gentle shade toward the front of the floor | Chair proportions still a simplification |
| V10 | `living_room_v10.html` | Rug border; shoes in darker tones | Chairs, futon shape and small item positions are simplified |

## Next steps
- Jimmy compares the photo with `renders/progress_sheet.png` and says which version is closest, and what to change next.
- Answer the open question in `04 AI/Living Room Scene/lessons.md` (detail per version).
