# Detail critique: Low-slope roof parapet section

- Input: `inputs/detail_sample.png` (1600 x 1200 px)
- Rulebook: `div_07_thermal_moisture/roof_parapet`
- Mode: mock (hand-written fixture detail_sample.mock.json)
- Run: 2026-11-14T12:14:04Z
- Project: Sample Library Annex (synthetic), IBC 2021, climate zone 5A

> **Mock run.** No model looked at this drawing.

## Summary

The parapet is shown as a single uninsulated block wall with a flat coping and a 4 in membrane upturn. Three items would let water in; two more fail the project mandates.

**3 critical, 2 major, 1 advisory**

## Step 1. Completeness

- Scale shown: no
- Primary materials labelled: yes
- Geometry clear: yes
- Missing: scale bar or stated scale
- Missing: dimensions for parapet height and coping overhang

## Findings

### CRITICAL (water entry or structural failure)

**1. Membrane upturn is 4 in, not terminated** `RP-2`

The roof membrane turns up the parapet only 4 in and ends with no termination bar or counter-flashing. Ponding water or wind-driven rain gets behind it.

*Fix:* Carry the base flashing at least 8 in above the finished roof, fasten it with a termination bar and cover it with counter-flashing, or run the membrane up and over the parapet.

*See:* OT-07-01 Typical parapet with metal coping (placeholder); MS-07-01 Generic single-ply membrane parapet termination (placeholder)

**2. Coping is flat and has no drip edge** `RP-1`

The coping is drawn level and flush with both wall faces. Water sits on it and runs down the cladding and the block.

*Fix:* Slope the coping to the roof side (about 1:12), extend it past both faces and add drip edges. Show the continuous cleat.

*See:* OT-07-01 Typical parapet with metal coping (placeholder); MS-07-01 Generic single-ply membrane parapet termination (placeholder)

**3. No membrane under the coping** `RP-3`

The coping sits directly on open block. Every coping joint is a leak path into the cores of the wall.

*Fix:* Add a continuous membrane over wood blocking on top of the parapet, lapped down both faces, before the coping.

*See:* OT-07-01 Typical parapet with metal coping (placeholder); MS-07-01 Generic single-ply membrane parapet termination (placeholder)

### MAJOR (building code or project mandate non-compliance)

**4. Parapet is an uninsulated thermal bridge** `RP-5`

Exterior insulation stops at the roof slab. The parapet above it is bare block, which breaks the project mandate for continuous exterior insulation and the energy code intent in zone 5A.

*Fix:* Continue the exterior insulation up the outside face and across the top of the parapet, or add a structural thermal break at the roof line.

*See:* OT-07-01 Typical parapet with metal coping (placeholder)

**5. Air and water barrier not shown across the roof-to-wall line** `RP-4`

No wall air barrier is drawn, so there is nothing for the roof membrane to tie into.

*Fix:* Draw the wall air and water barrier and show it lapped to the roof membrane over the parapet.

### ADVISORY (lesson learned or best practice)

**6. No scale, cleat, blocking or cant** `RP-6`

The detail has no scale and leaves out the coping cleat, the wood blocking and the cant at the roof edge.

*Fix:* Add the scale and tag each item. See lesson L-004.

## Checklist

| Item | Result | Note |
|---|---|---|
| RP-1 | fail | Coping drawn flat with no drip. |
| RP-2 | fail | Upturn labelled 4 in; no termination or counter-flashing. |
| RP-3 | fail | Nothing drawn between coping and block. |
| RP-4 | not_shown | No air or water barrier drawn on the wall. |
| RP-5 | fail | Wall insulation stops at the roof slab. |
| RP-6 | fail | No cleat, blocking, cant or scale. |

Markup: `outputs/markups/detail_sample_markup.png`

_A model review is a second pair of eyes, not a sign-off. Box positions are approximate._
