# Convo v0.2 — the reference jet, found

Date: 2026-11-18. Follows up Q1 in `convo v0.1.md`, after the reference page could not be reached from the build container.

## What was found

- **Repo:** https://github.com/LeePillWoo/sprite-stack-fighter (owner shown as a handle, "LeePillWoo"; 6 commits; 0 stars). README (in Korean) says: a pixel-art jet dogfight, one HTML file, Canvas 2D, no 3D engine, no polygons, no external images, **sprite stacking** ("스프라이트 스태킹": 3-D shapes built from stacked 2-D cross-sections).
- **Live demo:** https://leepillwoo.github.io/sprite-stack-fighter/ (not opened yet).
- **Views (named in the README):** top-down, chase, cockpit (switch with keys 1 / 2 / 3).
- **Controls:** mouse steers; click or Space fires the cannon; right-click or F fires a lock-on missile; Shift accelerates; Q / E roll; W / S or wheel change altitude; C stabilises; T time of day; M sound. Phones and tablets in landscape have touch controls.
- **Build:** source in `src/` and `parts/`; `node tools/build.mjs` writes `fighter.html`. Node 18+, no packages.
- **Credit:** the README says the technique was written anew "with reference to the UI8 Forge fighter demo" at https://remix.ui8.ai/fly. So this repo is a separate re-make, not the UI8 original.
- **Not found:** a licence (no LICENSE file in the visible list), the "32 KB" figure, and any mention of Fable or of the roguelite or flight-sim remixes.

## What could not be checked

- The Creators Toolbox post and the remix.ui8.ai/fly page: both unreachable from the build container (DNS / proxy refusal).
- The "2.1 million views" and the other remix claims from the Reddit description: no source found.

## Use in this project

- **Sprite stacking** is a technique, and the ideas can be re-made from behaviour. This repo has no licence, so copy no code and no art from it. Study the live demo and the README to learn how the slices rotate together.
- Build the stacked-jet version as a new round here: the A-10 as stacked slices, with the top-down, chase and cockpit views. Keep the current side view as a separate mode, or drop it, once Jimmy answers Q2 and Q5.

## Questions for Jimmy

- **Q7.** Do you want the stacked top-down / chase / cockpit jet as the next build (it's the reference's look), or should the side view stay?
- **Q8.** Is the 32 KB figure important, or is a readable build more useful for learning sprite stacking?
- **Q9.** Can you say which remix you saw on Reddit (a flight sim? a roguelite?), or send a link? Then the search can target it.
