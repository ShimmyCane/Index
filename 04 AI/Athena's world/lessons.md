# Athena's world — Lessons

- Started from the seed with the purpose unanswered, then recorded the first description as answers in a new convo version. Convo first, then the build, kept both in step.
- Tap-to-place needs a "held" state with a visible cue (bobbing outline and a hint line) so a child knows the next tap moves something.
- Wall and floor items need clamping to their zones. A window dropped on the floor reads as wrong at once, and clamping avoids that without a message.
- Clamp wall items away from the room edge (12%, not 8%). At 8% the emoji clipped under the border.
- Tapping a placed item should pick it up, and tapping it again while held should put it down where it is. That gives "don't need to tap it again" without a confirm step.
- Keep the game working with no network: the device copy is written first, the database is an extra, and a failed sync shows `⚠️ check` instead of breaking play.
- The family database uses the publishable key only, and the table pattern matches What to Cook's notes table (RLS on, anon revoked, authenticated access, registry row).
- Archiving a version that shares a save: make the old copy keep fields and ids it doesn't know, or opening it once wipes the new version's data. Test by saving from the old copy.
- Cut-away rooms: drop the walls whose outward normal faces the camera, and sink outside scenery on the camera side, so the room reads from every angle.
- Toon pastels wash out to white under strong light. Keep hemisphere + directional near 0.5 each with a three-step gradient.
- Model a shelf as an open frame (back, sides, shelves); a solid box hides what is on it.
- Ease animations by time (`1 - exp(-rate*dt)`), not per frame, so slow devices and headless runs finish them.
- Save rooms by id, not by position in a list, before adding places in the middle. Keep a one-time map from the old order.
- Derive unlocks from what is done instead of saving an unlocked count; inserting a place then needs no migration.
- For a room in the middle of a building, lift the floors above like a doll's house lid (and turn off their shadow) instead of hiding them, so it still reads as mid-tower.
- Inside and outside are one camera: zooming past a threshold puts the walls, roof and upper floors back. Outside things then attach to the outer faces of the walls that face the camera.
