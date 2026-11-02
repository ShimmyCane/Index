# Living Room Scene: convo v0.1

## Request (2026-11-02)
- Build a scene from a photo of a living room. The photo is shared in the chat and is not stored in the repo.
- Rough description: cabinets with books, a TV, plants, a table with small chairs for children, a couch in the distance, several windows, and small items on the countertops.
- Build over 10 iterations. After each build, review the render and make the next version.
- Track versions as V1 to V10.
- Log the process as a lesson learned first.

## Decisions taken without asking
- Layout is traced from the photo's pixel grid (viewBox 0 0 2000 1500), so positions can be compared directly.
- Style follows Jimmy's pastel preferences: bold outlines, offset shadows. Colours are taken from the photo.
- Each version is a new file (`living_room_v#.html`), not an edit in place.
