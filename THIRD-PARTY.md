# Third-party code and data

A **running record** of third-party code, fonts, data and services used by projects built in this nursery. A row stays after its project graduates. Updated 2026-11-25.

## Hub and spoke: what the licence covers

This repository is a hub. Its home page (`index.html`) links out to many separate sites and repositories (the spokes).

- The GNU General Public License v3.0 in `LICENSE` applies to **this repository**.
- It **does not necessarily apply to the linked repositories or sites**, including projects that started here and moved out. Each one is governed by whatever licence and notices it carries itself. A link from this page grants no licence, and a repo with no licence file should not be assumed to be open for reuse. Check that repo.
- Third-party components keep their own licences wherever they are. Where a file is third-party, its licence applies to that file. Per-file licence headers are not added to every file.
- Files copied from this repository stay under the terms they had here (git history is part of this repository).

This list covers components that passed through the nursery. It does not cover what a linked repo added after it left, or linked sites that were never built here.

**Where** gives the folder under `03 Projects/`. **Now** is "Nursery" if the files are here today, otherwise the repo the project moved to. The last nursery copy is in git history.

## Bundled code, fonts and data

| Component | Licence | Source | Where | Now |
|---|---|---|---|---|
| three.js r160 (0.160.0) | MIT | https://github.com/mrdoob/three.js | `Salmon Leap/vendor/three` | Nursery |
| three.js r160 (0.160.0) | MIT | same | `Make 3D/vendor/three` and `V1/`; `Make-3D x Construct/vendor/three` and an archived copy; `Growth/vendor`; `Paper Again/vendor` | `ShimmyCane/Make-3D`, `ShimmyCane/Make-3D-x-Construct`, `ShimmyCane/Growth` (with Paper Again) |
| three.js r128 | MIT | same | `Athena's world/lib`; `Generate Clouds/js/vendor`; `Mind Palace/js/vendor` | `ShimmyCane/Athena-s-world`, `ShimmyCane/Generate-Clouds`, `ShimmyCane/Mind-Palace` |
| supabase-js 2.45.4 (bundled) | MIT | https://github.com/supabase/supabase-js | `Make 3D/vendor/supabase`; `Make-3D x Construct/vendor/supabase` | `ShimmyCane/Make-3D`, `ShimmyCane/Make-3D-x-Construct` |
| marked 12.0.2 | MIT | https://github.com/markedjs/marked | `Adventure/lib` | `ShimmyCane/Adventure` |
| Hanzi Writer 3.7.3 | MIT | https://github.com/chanind/hanzi-writer | `Chinese Character Sudoku/js/vendor`; `中文笔画/js/vendor` | `ShimmyCane/Chinese-Character-Sudoku`, `ShimmyCane/Chinese-Character-Strokes` |
| Stroke data from `hanzi-writer-data` 2.0.1 (Make Me a Hanzi, derived from Arphic fonts) | Arphic Public License | https://github.com/chanind/hanzi-writer-data | The same two projects, subsets only | the same two repos |
| LXGW WenKai 1.7.0 (font subset) | SIL OFL 1.1 | https://github.com/lxgw/LxgwWenKai | The same two projects, `assets/fonts` | the same two repos |
| kokoro-js 1.2.1 | Apache-2.0 | https://github.com/hexgrad/kokoro | `Voice/lib` (the bundle includes its own dependencies) | `ShimmyCane/Voice` |
| pdf.js (pdfjs-dist) 3.11.174 | Apache-2.0 | https://github.com/mozilla/pdf.js | `QC keynotes/vendor` | `ShimmyCane/QC-keynotes` |
| pdf-lib 1.17.1 | MIT | https://github.com/Hopding/pdf-lib | `QC keynotes/vendor` | `ShimmyCane/QC-keynotes` |
| Natural Earth 1:50m land (via `world-atlas` 2.0.2) | Public domain (Natural Earth); `world-atlas` is ISC | https://www.naturalearthdata.com and https://github.com/topojson/world-atlas | `Felix Continents/js/coast.js` | `ShimmyCane/Felix-Continents` |
| Historical boundaries (aourednik/historical-basemaps) | GPL-3.0 | https://github.com/aourednik/historical-basemaps | `Felix Continents/js/history_geo.js` | `ShimmyCane/Felix-Continents` |
| Gray's Anatomy 1918 plates 444, 409 and 437 (scans, by Henry Vandyke Carter) | Public domain | https://commons.wikimedia.org/wiki/File:Gray444.png, File:Gray409.png, File:Gray437.png | `Massage Map/plates/` (credits in `plates/CREDITS.md`) | Nursery |

## Loaded from the internet when a page runs (not stored here)

| Component | Licence or terms | Used by | Now |
|---|---|---|---|
| Google Fonts: Quicksand | SIL OFL 1.1 | Massage Map | Nursery |
| Google Fonts: Quicksand, Orbitron, Patrick Hand (not every page uses all three) | SIL OFL 1.1 | Adventure, Better Parenting, Felix Maze, Felix Stickers, Mind Palace, Our Family Compass | each project's own repo |
| three.js 0.170.0 (unpkg) | MIT | Felix Continents | `ShimmyCane/Felix-Continents` |
| supabase-js 2.45.4 (jsDelivr) | MIT | Adventure, Expansion Wars, Felix Maze | each project's own repo |
| Open-Meteo APIs (weather, air, marine, archive, geocoding) | The provider's terms; credit required (https://open-meteo.com) | Generate Clouds | `ShimmyCane/Generate-Clouds` |
| OpenStreetMap tiles | Data under ODbL; tile usage policy and credit apply | Generate Clouds | `ShimmyCane/Generate-Clouds` |
| NASA GIBS Earth imagery | NASA's data use terms (https://earthdata.nasa.gov) | Generate Clouds | `ShimmyCane/Generate-Clouds` |

Projects that sign in also call a hosted Supabase service.

## Models used to make files

| Model | Licence | Used for | Now |
|---|---|---|---|
| Kokoro-82M (weights not stored here) | Apache-2.0 | Recorded narration in Voice, Adventure and Felix Gear Wars | each project's own repo |

## Ideas and methods credited (no code copied)

| Source | Their licence | Used by | Now |
|---|---|---|---|
| Construct, by Artyom Andreyev (https://github.com/rtmandreyev/construct) | Apache-2.0 | Make-3D x Construct: working method | `ShimmyCane/Make-3D-x-Construct` |
| sprite-stack-fighter (https://github.com/LeePillWoo/sprite-stack-fighter) | No licence found | Paper Airplanes x A-10 Warthog: ideas only | `ShimmyCane/Paper-Airplanes-x-A-10-Warthog` |

| The wooden ship-building toy by Alma Siedhoff-Buscher (Bauhaus, 1923; the designer died in 1944) | Design reference only | Home page, Bauhaus Blocks style (`Index/js/bauhaus.js`) | Nursery |
| Photos of Inca stonework in Cusco, The Peru Channel (https://theperuchannel.com/cuscos-12-angled-stone-reality-and-mythology/) | The site's own rights; looked at only, none copied or stored | Home page, Polygonal Masonry style (`Index/js/masonry.js`) | Nursery |

Test and build tools that are not shipped in a page (for example Playwright, ezdxf, Pillow and the TypeScript compiler) are not listed.

## Keeping this list

- Add a row in the same change that brings a component in. Keep the licence file with vendored code.
- Never delete a row. When a project graduates, change **Now** to its repo (`/graduate-project` step 8).
- Versions and licences are recorded from the files and credits in this repo's history; terms for the online services are summaries. Check the source before relying on them.
