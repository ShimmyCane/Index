# Salmon Leap: lessons learned

## References (2026-11-18)

- A salmon's body is spindle-shaped, with depth about a quarter of its length; the head is small. Fins: dorsal and anal for stability, pectoral and pelvic for steering, the tail for drive. Sources and strengths are in `03 Projects/Salmon Leap/research/salmon-references.md`.
- There is no measured source for fin shape in a leap. Mark fin shapes as design choices, not facts.

## Lessons from the five versions

- **The backdrop hides the back view.** A wall behind the arc is right from the front, but from behind it fills the view. The viewer now hides the painted wall for the back view. Test each view after adding a background.
- **Put the ground at zero.** A slab or a rock below z = 0 fails the check, and the audit found it. The slab sits on 0 to 1 and the rocks rest on the slab.
- **Texture repeats are a choice.** One repeat over the whole body reads as blotches. Scales repeat about five times round and fourteen along.
- **A version is cumulative.** Each version rebuilds from the same generator, and a test checks that no part is dropped. Keep it that way.
- **Keep the statue's colour in the light.** The warm sun and the image light make a pale tan from bronze. Choose the darker bronze for the surface and check it in the render.
