# Salmon Leap: schematic

**Status:** V1 to V5 built · **Updated:** 2026-11-18 · **Track:** B. Studio design
**Based on:** the request (a statue of an Atlantic salmon leaping up; five versions; references saved to lessons learned), and `research/salmon-references.md`.

## Concept

A bronze statue of an Atlantic salmon in mid-leap. The body bends into one arc; the tail drives; the head reaches up and forward; the fins spread. It stands on a stepped granite base, held by a pillar under the belly and a prop under the tail. In V5 it stands in a shallow pool on a granite slab.

Scale: about 25 in from tail to nose (a statue; not a real fish). Units inches, Z up, the fish in the x-z plane with the nose at +x.

## The five versions

| Version | Focus | What is added |
|---|---|---|
| V1 | Narrative and rough massing | Body (lofted spine and rings), tail lobes, dorsal and pectoral fins, granite base, pillar and tail prop |
| V2 | Narrative refined; light, colour, texture, background set-up | Patina on the fins and tail; a pale backdrop wall; the narrative is told as one moment |
| V3 | Concept and details; viewed from every side | Eyes, gill cover, mouth, adipose and anal fins, pelvic fins |
| V4 | Details increment | Scale texture on the body, fin rays in the tail, a lateral line |
| V5 | The ground | Granite slab, a shallow pool, five rocks at the edge |
| V10 (later) | Movement, rendering and atmosphere | Not yet |
| V15 (later) | Sound | Not yet |

Each version is cumulative and built from one generator (`tools/build_versions.js`, `defsFor(v)`). A test checks that no part is dropped.

## Method

- Build each object from its real parts (lofts for the body and fins; boxes and cylinders for the base).
- Check the audit after each version; render from front, back and oblique; check the back view shows the statue (the backdrop is hidden from behind).
- Refine the narrative in each version's convo and in the page's narrative panel.

## Growth rule (Jimmy, 2026-11-18)

V1 starts with 25 to 100 objects or meshes. Each later version may grow up to 4x in mesh faces or objects, and the growth decays over later versions. Refining or replacing a part may also shrink a count.

Measured by `tools/build_versions.js` (triangles, approximate: lofts from their resolution, primitives at fixed counts):

| Version | Objects | Triangles | Growth in triangles | Limit |
|---|---|---|---|---|
| V1 | 26 | 1,972 | (start) | 25 to 100 objects |
| V2 | 33 | 7,456 | ×3.78 | ×4 |
| V3 | 43 | 22,096 | ×2.96 | ×3 |
| V4 | 49 | 43,536 | ×1.97 | ×2 |
| V5 | 57 | 63,340 | ×1.45 | ×1.5 |

Loft resolution (`sides` × `samples`) per version: V1 8×10, V2 12×20, V3 20×23, V4 25×31, V5 30×32. Objects grow 1.14× to 1.3× a step. `tests/test_versions.js` checks the rule.

## Open

See `convo/convo v0.1.md`.
