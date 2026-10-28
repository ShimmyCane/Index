# Chapter 302 — UniFormat and the PPD

Written in our own words. Points marked verify still need checking against a current CSI publication.

## 3. UniFormat and the PPD

- **UniFormat** organizes a building by **elements** (systems and assemblies) rather than products:
  - **A** Substructure · **B** Shell · **C** Interiors · **D** Services · **E** Equipment and Furnishings · **F** Special Construction and Demolition · **G** Building Sitework · (**Z** General) **(verify letters/titles for current edition)**
  - e.g. `B2010 Exterior Walls`, `B3010 Roof Coverings`, `D3050 Terminal and Package Units`.
- **PPD (Preliminary Project Description):** written at schematic design, by UniFormat element. For each element: what it is, how it must perform, and the likely materials. It supports early cost estimates and records design intent.
- **Why it matters for this app:** a PPD is the bridge from *the project* to *the sections*. Each UniFormat element maps to one or more MasterFormat sections. Example: `B2010 Exterior Walls: brick veneer on CMU backup, cavity insulation, air barrier` → `04 20 00`, `04 05 19` (anchors/reinforcing), `07 21 00`, `07 27 00`, `07 62 00`, `07 92 00`.
