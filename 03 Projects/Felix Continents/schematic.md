# Felix Continents — schematic

**Track:** A. Family play (Felix learns about continents by turning a globe; the family plays it, the grown-ups set it up).
**Status:** Round 2 (2026-11-24): V1 timeline runs Pangaea → today; V2 (drag the continents) and V5 (random worlds) built as pages; Family login and `fc_notes` SQL written, not pasted. V3 (human history) and V4 (countries) not built (questions in `convo/convo v0.2.md`). Earlier: V1 first build 0.1.0 (2026-11-24). `index.html` with the spinning globe, today's continents, the ⚙️ Time travel slider with five moments, climate colours, and notes for improvement. Headless-tested in Chromium, not yet on an iPad. Answers from `convo/convo v0.1.md` (proposals taken as recommended; two deviations recorded there: no Rodinia, and hand-drawn sketch outlines).

## Idea

A 3-D globe in three.js that Felix can spin, showing the continents as they are today. A settings (⚙️) switch turns on a time slider that takes him back through geological history in animated **moments**, not in a straight line: Pangaea forming, the mountains that rose and wore away, volcanoes, continental drift, and the oceans opening and closing.

Teaching aim: each moment says what happened, in plain words, with its date and the numbers worked out. Dates are approximate and say so.

## Versions

| Version | What it adds |
|---|---|
| **V1** | Spinning globe. Today's continents. ⚙️ **Time travel** switch shows a slider with named moments. Each moment animates: drift, mountains, volcanoes, sea level. A simple climate on the land (deserts, wet forests, woodland, grassland, ice) that follows from latitude, wind and mountains. |
| **V2** | Drag a continent on the globe to fit it against its neighbours (a puzzle). |
| **V3** | Human settlement animated on the timeline: spread, maps, early civilisations, dynasties, conflicts. |
| **V4** | Countries over time. Zoom into a country. Milestones to snap to (modern, medieval, Roman, Asian dynasties). Civilisations grow one nation or people at a time. |
| **V5** | Random worlds: sliders (in ⚙️ or a panel) and a Generate button. Animate the random world over eons; civilisations grow and spread. |

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

## Moments (V1 as built)

Each moment is a set of plate positions (a move and a turn from today's place), with the mountains, the volcanoes and the sea level for that time. Built in `js/data.js`:

1. Today
2. The last ice age (about 20,000 years ago): the sea is lower, a sandy shelf appears, and ice covers the north
3. The end of the dinosaurs (about 66 million years ago): India is further south, and the Deccan traps volcanoes show
4. Pangaea starts to break (about 175 million years ago)
5. Pangaea (about 250 million years ago)

Rodinia (about 750 million years ago) is not in V1: there is no checked source for its shapes yet. It comes with the source choice.

Loops: an animation always loops and closes on itself (`jimmy_preferences.md` §2c). Each moment plays twice, then pauses and waits for ▶.

## Climate (simple, shown as simple)

- Land colour follows latitude (cold at the poles, warm at the equator), then wind belts, then mountains. Wind sides that face the ocean are wet; the far side of a mountain range is dry (rain shadow). Interiors far from the sea are dry.
- Colours: ice, tundra, grassland, woodland, wet forest, desert.
- A line on the page says this is a simplified model, not a weather forecast (`jimmy_preferences.md` §6: show the limits with the result).

## Data

- **Today and past:** the outlines are rough sketches drawn by hand (nine plates, about 30 points each), in `js/data.js`. They are not from a checked source. The page's About panel says so.
- **Next:** choose an open-licence source for today's coastlines and a published reconstruction for the past, check the licence, then replace the sketches. Each moment gets its source note.
- All data loads with the three-tier offline pattern where it comes from a remote source: live, then cached, then the bundled JSON. In V1 everything is bundled, so the page works offline from `file://` once built.

## Stack

- Plain HTML, CSS and vanilla JavaScript. No build step, no Node server (`CLAUDE.md`).
- three.js 0.170.0 as an ES module from unpkg (`https://unpkg.com/three@0.170.0/build/three.module.js`). The module code sits inline in `index.html`, so the page still opens from `file://`. `js/data.js` is a classic script.
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

## Built so far (2026-11-24, round 3)

- **V1** `index.html`: the globe with the time slider (Pangaea left, today right).
- **V2** `v2.html`: drag the continents; snap within 3°; no dashed outline by default.
- **V3** `v3.html`: peoples over time, year slider from 3500 BCE to 1900 CE. Shaded areas grow, then fade. Hand sketches, approximate.
- **V4** `v4.html`: countries at milestones (500 BCE to 2000). Snap bar, play, and tap a country to zoom in and read its story. Modern milestone shows today's continents (modern countries not drawn yet).
- **V5** `v5.html`: random worlds with drift, mountains and volcanoes.
- Every page has a V1 to V5 strip at the top. Data in `js/data.js` and `js/history.js`; shared code in `js/engine.js` and `js/common.js`.
- Limits: all shapes are rough sketches. The V3 and V4 shapes are not checked by historians.

## Decisions from convo v0.2 (answered 2026-11-24)

- **V2:** a piece let go within 3° of its place snaps to it, with a ✓ (done). The dashed outline of today's map is off by default; ⚙️ can turn it on (done).
- **V3 human history:** about 8 regions with a few dates each, hand-sketched and marked "approximate". Spread is shown as shaded areas that grow, with a dot at each city or capital (go with the recommendations).
- **V4 countries:** milestones 2000, 1200, 100, 1300 and 1800, plus Greek, Mayan, Incan, African kingdoms, Indonesian and Aleutian. A "country" can be a group, tribe or collective, not a modern state name. Tapping an area zooms in with a short story card.
- **V5 random worlds:** sliders stay in ⚙️. The "made-up world" sentence stays on screen (done). Jimmy also asked for a hex code: meaning not yet confirmed.
- **Maps and events (planned, not built):** show Rodinia once a source is chosen. Future animations: the Moon-forming impact, tectonic shifts, volcanic eruptions, and ice ages.
- **Family login and notes:** done. `fc_notes` is live in the Family project: row-level security on, 3 policies, 1 registry row, nothing unregistered (read-only check, 2026-11-24).

## Round 4 (2026-11-25): saved notes acted on

- **Notes 1 and 3, features (done):** named mountains, volcanoes and natural features (waterfalls, the Grand Canyon, the Great Barrier Reef) on every continent, each shown only in its years (`js/data.js`). ⚙️ "Mountains and features" turns them on and off.
- **Note 1, legend (done):** the legend is in ⚙️ ("Legend", off by default). When on, it sits in a line at the bottom-left of the globe, so the globe stays large.
- **Note 2, bar (done):** V1, V3 and V4 buttons are "« Past", "▶ Play" and "Now »". V3 now runs to 2000 CE.
- **Note 3, play (partly done):** Play moves the slider and sweeps from the oldest moment to today, one transition after another. Still open: continents that deform, rather than moving as rigid shapes. Real deformation needs reconstruction data for the in-between shapes, which we don't have yet. The overlaps you saw are rigid sketches overlapping.
- **Note 4, V2 (done):** no top panel. The status line and Reset sit in one line at the bottom-left.
- **Note 5, V5 (done):** Play uses the V1 method: forward to today, back, then forward again. The world's number is shown as a hex code (for example "World 41C98").
- **Source decision (chosen by Claude, 2026-11-25):** today's coastlines will come from Natural Earth through the npm package `world-atlas` 2.0.2 (Natural Earth data, public domain; the package is ISC). Not swapped in yet: the sketches are still the outlines. Past shapes: no licence-checked reconstruction chosen yet, so Rodinia stays out.
- **Planned, not built:** the Moon-forming impact, tectonic shifts, volcanic eruptions, and ice ages as animated events (convo v0.2, Q9).

## Round 5 (2026-11-25): countries and peoples hold still

- **V4 outlines and zoom:** countries have thicker outlines. Tapping a country zooms in and tilts the globe to its latitude, so the whole country is in view.
- **V4 Play:** the globe no longer turns at each milestone. A manual pick still turns it. Each milestone's countries fade in together, while the previous ones fade out (about 0.8 s).
- **V3 peoples:** each people fades in over its first 60 years and out over its last 60, and grows gradually, so nothing pops in or out.
- Still open: continental deformation (note 3), the swap to Natural Earth outlines, and a reconstruction source for the past.
