# Cheetah Simulator — brief

**Goal.** A game where a child lives a cheetah's whole life, ten minutes a stage, learning how cheetahs really live. The look and the verbs grow up with the cheetah (cuddly cub to precise hunter). The world (place, weather, prey, rivals, people) changes each life. Track A.

**State (2026-11-25): 0.3.0.** Mum leads after a reunion (wag, no reset); stage 1 zoomed, edge blur, slower. Next work: `todo.md`. **0.2.0 built, sky cycle added.** Time is the sky (three cycles per stage), fast-forward ×4 in ⚙️, night with zz, drifting clouds. Canvas first (only the pill, Next, ⚙️, Chirp and the joystick on screen); all panels in ⚙️; stage skills with tokens; cubs nibble grass (⚑). 0.1.0 before it. `index.html`: stages 1 (Den) and 2 (Little explorer); cumulative stage clock (10 + 5 per restart); Felix drag and joystick; Chirp; ⚙️ with gentle mode, look, controls, AI toggle (disabled, under development), notes, storage check, opt-in errors, test skip. Home tile added. Answers to convo v0.1 are in that file; questions for v0.2 are in `convo/convo v0.2.md`.

**Architecture (planned).** Plain HTML/CSS/JS, no build. Layers: data (world, life, save; no DOM) → scene description → renderer (style layer separate). Device storage first; Family project later (`ch_` tables).

**Key facts that shaped the plan.** Females leave the sibling group first (about 2 years) and live alone; males stay with brothers for life (coalition) and start as floaters. Males do not raise cubs. A chase is short (about 38 s). About one kill in ten is stolen. Cub deaths are mostly from big predators. ⚑ items in `research/` are unchecked.

**Not verified.** Everything. Research was read from search summaries, not the full papers.

**Decisions made without asking.** Branch written per sources (corrects the brief's "females stay with Mum"); first build proposed as stages 1 and 2 in a cheap 2-D look.

**Next.** Jimmy answers convo v0.2 (wiggle, mature fight, age facts, AI toggle, restart rule). Then stages 3 and 4 and the branch.

**Known:** on desktop the left HUD column covers part of the play area; collapse the panels or move them in a later increment.
