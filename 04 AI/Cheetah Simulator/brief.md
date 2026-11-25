# Cheetah Simulator — brief

**Goal.** A game where a child lives a cheetah's whole life, ten minutes a stage, learning how cheetahs really live. The look and the verbs grow up with the cheetah (cuddly cub to precise hunter). The world (place, weather, prey, rivals, people) changes each life. Track A.

**State (2026-11-25): plan only.** `schematic.md`, `research/cheetah-life-cycle.md`, `convo/convo v0.1.md` (13 ideas and 14 questions) written. No page, no code, no tile on the Nursery list.

**Architecture (planned).** Plain HTML/CSS/JS, no build. Layers: data (world, life, save; no DOM) → scene description → renderer (style layer separate). Device storage first; Family project later (`ch_` tables).

**Key facts that shaped the plan.** Females leave the sibling group first (about 2 years) and live alone; males stay with brothers for life (coalition) and start as floaters. Males do not raise cubs. A chase is short (about 38 s). About one kill in ten is stolen. Cub deaths are mostly from big predators. ⚑ items in `research/` are unchecked.

**Not verified.** Everything. Research was read from search summaries, not the full papers.

**Decisions made without asking.** Branch written per sources (corrects the brief's "females stay with Mum"); first build proposed as stages 1 and 2 in a cheap 2-D look.

**Next.** Jimmy answers convo v0.1; then build 0.1.
