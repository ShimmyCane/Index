# Detail critique: Low-slope roof parapet section

**REVISE.** 3 critical finding(s). Not ready to issue.

- Input: `inputs/detail_sample.png` (1600 x 1200 px)
- Rulebook: `div_07_thermal_moisture/077100_roof_parapet` (07 71 00 Roof Specialties)
- Reviewer: Claude, in a Claude Code session (2026-11-14)
- Run: 2026-11-14T12:55:10Z
- Project: Sample Library Annex (synthetic); 2025 California Building Code (Title 24, Part 2); California climate zone 3

## Step 1. Gate: PASS

- Scale shown: no
- Primary materials labelled: yes
- Geometry clear: yes
- Missing: scale bar or stated scale
- Missing: dimensions for parapet height and coping overhang
- Warning: No scale is shown.

## Summary

The parapet is a single uninsulated block wall with a flat coping and a 4 in membrane upturn. Three items would let water in. Three more fail the code or the project mandates.

**3 critical, 3 major, 1 advisory**

## Findings

### CRITICAL (water entry or structural failure)

**1. Membrane upturn is 4 in, not terminated** `RP-2`

The roof membrane turns up the parapet only 4 in and ends with no termination bar or counter-flashing. Ponding water or wind-driven rain gets behind it.

*Fix:* Carry the base flashing at least 8 in above the finished roof, fasten it with a termination bar and cover it with counter-flashing, or run the membrane up and over the parapet.

**2. Coping is flat and has no drip edge** `RP-1`

The coping is drawn level and flush with both wall faces. Water sits on it and runs down the cladding and the block.

*Fix:* Slope the coping to the roof side, extend it past both faces and add drip edges. Show the continuous cleat.

**3. No membrane under the coping** `RP-3`

The coping sits directly on open block. Every coping joint is a leak path into the cores of the wall.

*Fix:* Add a continuous membrane over sloped wood blocking on top of the parapet, lapped down both faces, before the coping.

### MAJOR (building code or project mandate non-compliance)

**4. Parapet is an uninsulated thermal bridge** `RP-5`

Exterior insulation stops at the roof slab. The parapet above it is bare block. That breaks project mandate PM-1 (continuous exterior insulation, no uninsulated parapets).

*Fix:* Continue the exterior insulation up the outside face to the top of the parapet and insulate the roof side, or add a structural thermal break at the roof line.

**5. Air and water barrier not shown across the roof-to-wall line** `RP-4`

No wall air barrier is drawn, so there is nothing for the roof membrane to tie into.

*Fix:* Draw the wall air and water barrier and show it lapped to the roof membrane over the parapet.

**6. Parapet reinforcing or bracing not shown** `RP-7`

The block parapet has no reinforcing, bracing or structural reference. The project is in seismic design category D.

*Fix:* Show the reinforcing or reference the structural detail for the parapet.

### ADVISORY (lesson learned or best practice)

**7. No scale, cleat, blocking or cant** `L-004`

The detail has no scale and leaves out the coping cleat, the wood blocking and the cant at the roof edge.

*Fix:* Add the scale and tag each item.

## Proof: NOT PROVEN

1 of 13 claims proven on the drawing; 8 disproven; 3 not shown; 1 passed without evidence.

| Item | From | Severity | Result | Note |
|---|---|---|---|---|
| RP-1 | rulebook | CRITICAL | disproven | Coping drawn flat with no drip. |
| RP-2 | rulebook | CRITICAL | disproven | Upturn labelled 4 in; no termination or counter-flashing. |
| RP-3 | rulebook | CRITICAL | disproven | Nothing drawn between coping and block. |
| RP-4 | rulebook | MAJOR | unproven | No air or water barrier is drawn on the wall. |
| RP-5 | rulebook | MAJOR | disproven | Wall insulation stops at the roof slab. |
| RP-6 | rulebook | ADVISORY | disproven | No cleat, blocking, cant or scale. |
| RP-7 | condition | MAJOR | unproven | No reinforcing or bracing shown or referenced; project is seismic design category D. |
| PM-1 | mandate | MAJOR | disproven | Same as RP-5: the parapet has no exterior insulation. |
| PM-2 | mandate | MAJOR | proven | Coping is tagged prefinished aluminium. |
| PM-3 | mandate | MAJOR | claimed | No sealant joint is drawn as a water line, so there is nothing to point to. |
| L-001 | lesson | ADVISORY | disproven | Same as RP-3: no membrane under the coping. |
| L-002 | lesson | ADVISORY | unproven | Parapet height is not dimensioned, so the room for an 8 in base flashing cannot be checked. |
| L-004 | lesson | ADVISORY | disproven | No scale on the sheet. |

## Control layers

| Layer | Status | Note |
|---|---|---|
| water | broken | The roof membrane stops 4 in up the parapet. Nothing covers the top of the wall. |
| air | not_shown | No air barrier is drawn on the wall or across the roof line. |
| thermal | broken | Roof insulation and wall insulation do not meet: the parapet between them is bare block. |
| vapor | not_shown | No vapor control layer is drawn or named. |

Markup: `outputs/markups/detail_sample_markup.png`

_A review is a second pair of eyes, not a sign-off. Box positions are approximate._
