# Felix Continents — schematic

**Track:** A. Family play (Felix learns about continents by turning a globe; the family plays it, the grown-ups set it up).
**Status:** Planning, round 1 (2026-11-24). No page yet. Questions in `convo/convo v0.1.md`. Nothing is built until those are answered.

## Idea

A 3-D globe in three.js that Felix can spin, showing the continents as they are today. A settings (⚙️) switch turns on a time slider that takes him back through geological history in animated **moments**, not in a straight line: Pangaea forming, the mountains that rose and wore away, volcanoes, continental drift, and the oceans opening and closing.

Teaching aim: each moment says what happened, in plain words, with its date and the numbers worked out. Dates are approximate and say so.

## Versions

| Version | What it adds |
|---|---|
| **V1** | Spinning globe. Today's continents. ⚙️ **Time travel** switch shows a slider with named moments. Each moment animates: drift, mountains, volcanoes, sea level. A simple climate on the land (deserts, wet forests, woodland, grassland, ice) that follows from latitude, wind and mountains. |
| **V2** | Drag a continent on the globe to fit it against its neighbours (a puzzle). |
| **V2.5** | Human settlement animated on the timeline: spread, maps, early civilisations, dynasties, conflicts. |
| **V2.8 / V2.9** | Countries over time. Zoom into a country. Milestones to snap to (modern, medieval, Roman, Asian dynasties). Civilisations grow one nation or people at a time. |
| **V3** | Random worlds: sliders (in ⚙️ or a panel) and a Generate button. Animate the random world over eons; civilisations grow and spread. |

Only V1 is in scope for the first build. Later versions are kept here so the V1 data fits them.

## Track defaults (A. Family play)

| Setting | Felix Continents |
|---|---|
| Words on screen | few: the globe, a moment's name and date, a one-line note |
| Options visible | the globe, the ▶ / back-to-start buttons and slider when time travel is on |
| ⚙️ holds | Time travel switch, moment list, speed, autoplay, climate colours, labels, notes, errors, database check |
| Panels | collapsible with ▸/▾ |
| Palette | pastel (see `jimmy_preferences.md` §1), or the family look (§5). Felix to choose — see convo |
| Database | none in V1 (device storage only). See convo question on notes |
| Skills | `ipad-website`, `settings-gear`, `feedback-notes`, `smoke-test`, `project-track` |

## Screen (iPad, landscape)

```
┌ Felix Continents      [moment name · about 66 million years ago] ┐
│                                                                  │
│                 ( spinning globe )                               │
│                                                                  │
│  ◀ slider ▶  [⏮] [▶]  (time travel on only)                  ⚙️ │
└──────────────────────────────────────────────────────────────────┘
```

- Drag to spin. Tap a continent to see its name.
- ⚙️ (lower right, the same as every app) opens the drawer: Time travel switch, moment list, speed, autoplay, labels, climate, notes for improvement, errors (bottom, opt-in).
- The slider sits under the globe only when Time travel is on. Its moments snap; it does not move in a straight line.

## Moments (V1 plan, to be confirmed)

Each moment is a set of positions for the continents, the mountains, the volcanoes and the sea level, with a short animated move from the moment before. Proposed list (a convo question):

1. Today
2. The last ice age (about 20,000 years ago): lower sea, bigger ice
3. The end of the dinosaurs (about 66 million years ago): volcanoes in India (Deccan traps) and the land bridges
4. Pangaea breaking up (about 175 million years ago)
5. Pangaea whole (about 250 million years ago)
6. Rodinia (about 750 million years ago), an older supercontinent

Loops: an animation always loops and closes on itself (`jimmy_preferences.md` §2c). Each moment plays twice, then pauses and waits for ▶.

## Climate (simple, shown as simple)

- Land colour follows latitude (cold at the poles, warm at the equator), then wind belts, then mountains. Wind sides that face the ocean are wet; the far side of a mountain range is dry (rain shadow). Interiors far from the sea are dry.
- Colours: ice, tundra, grassland, woodland, wet forest, desert.
- A line on the page says this is a simplified model, not a weather forecast (`jimmy_preferences.md` §6: show the limits with the result).

## Data

- **Today:** continent outlines from an open-licence world dataset, stored in the repo as a small JSON file. Licence to be checked before it is committed.
- **Past positions:** approximate outlines from published reconstructions. Source and licence are open (convo question). Every moment carries its source note.
- All data loads with the three-tier offline pattern where it comes from a remote source: live, then cached, then the bundled JSON. In V1 everything is bundled, so the page works offline from `file://` once built.

## Stack

- Plain HTML, CSS and vanilla JavaScript. No build step, no Node server (`CLAUDE.md`).
- three.js from cdnjs, one exact version at least two weeks old (named when built).
- Web Audio for any sound (optional; not in V1 unless asked).

## Feedback notes (planned; built in the first increment)

- A notes box in ⚙️ labelled "Notes for improvement". Each note saves the moment or view it is about, and the time.
- A way to read the notes back in the same panel.
- Stored on the device first. Notes are never sent anywhere else. A family database table only if Felix's or the family's notes must follow them across devices (convo question).

## Settings gear

Yes. ⚙️ in the lower right holds the options and extensions. Errors appear at the bottom and show only when opened from ⚙️ (`settings-gear.md`).

## Open

- See the questions in `convo/convo v0.1.md`.
- Home page tile: not yet. It goes on the Nursery list in the same change as the first page that opens (step 9 of `start_project.md`).
