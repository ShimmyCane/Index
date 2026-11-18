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

## Open

See `convo/convo v0.1.md`.
