# Salmon Leap: Convo v0.2

**Round:** 2. Jimmy asked to redo the five versions under a growth rule.

## The rule

- V1 starts with 25 to 100 objects or meshes.
- Each later version may grow up to 4x in mesh faces or objects. The growth decays: 4x, then 3x, then 2x, then 1.5x. Refining or deleting and replacing may shrink a count.

## What changed

- V1 now has 26 objects: the body in four sections (a loft each), two tail lobes, a dorsal and two pectoral fins, the stepped base built from nine blocks, and the supports.
- Growth in triangles: V2 ×3.78, V3 ×2.96, V4 ×1.97, V5 ×1.45. Objects grow 1.14× to 1.3× a step.
- Each loft has its own resolution (sides and samples), set per version, so the viewer shows the faces that are counted.
- The test (`tests/test_versions.js`) checks V1's range, the limits and the decay.

## Notes

- The seams between the V1 body sections are visible. Acceptable for massing; they'll be smoothed in a later pass.
- The V3 body reads more like a generic creature than a salmon. That's the concept pass, next.

## Questions

1. Is the growth rule right as I've read it (each step's cap, the decay)?
2. Scale and material, the pose and the base: the questions from v0.1 still stand.
