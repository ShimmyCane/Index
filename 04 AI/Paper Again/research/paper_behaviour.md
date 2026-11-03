# Paper behaviour: research notes for Paper Again

Date: 2026-11-03. Web search, standard mode. Summaries, not quotes. Numbers are paper-specific; treat as ranges.

## Crumpling and creases

- A crumpled sheet keeps permanent creases through plastic deformation. Stress concentrates in small plastic regions along the creases, and those stay visible when the ball is unpacked. Source: UC / Wageningen paper, https://www.eng.uc.edu/~beaucag/Classes/Properties/Polymer%20Physics%20Quzzes%202021/Quiz%203%20Polymer%20Physics%202021/c6sm02817a.pdf
- Crumpled structure is a network of localised folds. Plastic deformation, self-contact and jamming all matter. Source: https://arxiv.org/pdf/1602.00562
- Creases are often elongated, joined by point defects (d-cones). Source: https://www.nature.com/articles/ncomms8232
- A crumpled ball is roughly 75 % air, yet it resists compression; its height keeps dropping over weeks under load. Source: https://www.scientificamerican.com/article/a-new-report-explains-the/

Design consequence: bending springs with a yield point and a rest length that drifts toward the bent shape. Creases persist. Self-contact (a repulsion between non-neighbouring particles) gives the folding.

## Tearing and edges

- Tearing pulls fibres apart along weakened bonds, so the edge shows fibre ends. A cut severs fibres in one pass. Source: patent-level summaries, https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/12521960
- Tear energy has a fibre fracture part and a fibre pull-out part. Pull-out leaves the frayed, fibrous edge. Source: papermaking research summary, https://bioresources.cnr.ncsu.edu/resources/evaluation-and-optimisation-of-the-in-plane-tearing-strength-of-paper/
- Lighter, thinner papers tear more cleanly; thick fibres give a rugged edge. Weak source (craft blog), not relied on.

Design consequence: a tear breaks springs along a random walk with irregular thresholds, so the edge is jagged at fibre scale. A cut is a straight line of broken springs, with no fibre fray. Fibre fray is added as small random displacement along tear edges.

## Moisture, softening, mould

- Rising moisture speeds up breakdown of hydrogen bonds, which weakens the sheet. Source: Springer accelerated-ageing study, https://link.springer.com/10.1186/s40494-021-00611-3
- Above about 65 % RH, swollen fibres make paper limp, with wavy edges. Source: https://www.polygongroup.com/en-US/blog/the-effects-of-humidity-in-paper-production/
- Mould digests cellulose and grows down into the fibres, so damage is not always visible at the surface. Source: https://www.nationalarchives.gov.uk/archives-sector/advice-and-guidance/managing-your-collection/mould-in-archive-collections/the-science-of-mould
- A mould colony can make its own water while it breaks paper down, so it can keep growing at RH lower than the ambient level. Source: same National Archives page.
- Thresholds disagree: below 65 % is the common safe limit; 70 % is also cited. Growth was greatest at 100 % RH in one lab study. Source: https://www.polygongroup.com/en-US/blog/why-does-mold-grow-on-your-documents/ and https://www.danthermgroup.com/uk/insights/the-impact-of-humidity-in-paper-production-and-printing

Design consequence: wetness spreads over the mesh and softens the springs (stiffness drops with wetness). Mould grows only where wetness stays above a threshold for several increments. Drying leaves a tide-line stain at the edge of the wet area.

## Dirt and burns (no strong source found; design judgement)

- Dirt settles in recesses. Modelled by counting neighbouring particles (a simple ambient-occlusion idea), so dirt builds up in folds and creases.
- A scorched edge darkens from brown to near-black toward the burn, and curls. Modelled by a burn field and a small lift of the burnt particles.

## What this changes from Growth

Growth replayed hand-written dents, one-cell cuts and per-vertex colour. Paper Again uses a particle-spring sheet with plastic creases, self-contact, breakable springs, a wetness field, mould and dirt. Crumpling comes from physics, not from a placed fold.
