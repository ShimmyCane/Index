# Living Room Scene: schematic

Status: MVP. Ten versions built (V1 to V10). `living_room_v10.html` is the current one. Version log in `04 AI/Living Room Scene/brief.md`.

## Purpose
Rebuild one living-room photo as a flat, playful scene so Jimmy can see how close a generated picture gets to a real room. This is a practice exercise in building from a photo. It is not a game.

## Source
One photo of a living room (not stored in this repo). A rough description from Jimmy:
- Cabinets with books along the back wall, one with a TV on top.
- A TV.
- Several plants.
- A table with small chairs for children, and one small blue chair.
- A couch (grey futon) in the distance.
- Several windows with blinds.
- Small items on the countertops.

## Layout (from the photo, in photo pixels, viewBox 0 0 2000 1500)
- Back-left wall: TV on a black base, yellow cube shelves under it, books in the cubbies.
- Back-middle: a second yellow shelf with plants (terracotta pot, monstera-type leaves) and two small fans.
- Back-right: two windows with blinds. Tall plant in the corner.
- Right: grey futon along the right wall, door on the far right.
- Centre: light-wood children's table with three small wooden chairs and one blue chair in front.
- Floor: warm wood laminate.
- Bottom-left: white waste bin. Bottom-right: grey-green rug with shoes.

## Style
Jimmy's preferences: pastel palette, bold 2.5–3.5px dark outlines, tactile offset shadows, no harsh black and white (see `04 AI/Personal Preferences/jimmy_preferences.md`). The TV is the one black item, kept dark but not pure black.

## Files
- `living_room_v1.html` … `living_room_v10.html`: one self-contained page per version, no build step.
- `renders/living_room_v#.png`: Chromium render of each version.
- Each version is a separate file, not an edit in place, so any two can be compared.

## Out of scope
- No interactivity, sound, or game logic.
- The photo itself is not committed. Only the drawn reconstruction is.
