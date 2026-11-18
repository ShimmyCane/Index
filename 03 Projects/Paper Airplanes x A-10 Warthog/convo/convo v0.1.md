# Convo v0.1 — Paper Airplanes × A-10 Warthog

Date: 2026-11-18. Round 1 is Claude's reading of the request, with the choices made so far. Jimmy answers inline under each question.

## What was asked

- A browser 2.5D pixel-art flight shooter in TypeScript and HTML Canvas.
- A remix of two things: the small no-asset browser game at remix.ui8.ai/fly (the reference: "No 3D engine, no polygons, 32 KB of code", from social posts), and the floppy-disk A-10 game of the 1990s that taught flight.
- Inspiration from the Paper Airplanes project (the four forces, lift from the wing's angle, balance, trim).
- Purpose: see how sprite-based games work.

## What was done in this round (choices Claude made)

1. **Reference page not read.** The container could not reach `remix.ui8.ai` (the proxy refused the connection, 403). Search results only give the social-post claims above. The game does **not** copy its code or sprites. Next time, add the host to the allowed list, or paste the page's source into the project folder (`research/private/`). See Q1.
2. **Which A-10 game.** The search could not confirm a single floppy 2D shooter. The likeliest reading is **A-10 Tank Killer** (Dynamix, 1990), a flight game that teaches flight on floppy disks. Its look (blocky, learning-first) is the reference, not its code. See Q2.
3. **TypeScript without a build at play time.** The source is in `src/` (TypeScript, strict). The compiled file `js/game.js` is committed, so `index.html` runs from disk or GitHub Pages with no server and no bundler. The house rule is "no build pipeline"; this keeps that for the page and adds a build step only for the source. `npm run build` compiles it (TypeScript 5.6.3, pinned).
4. **2.5D** means: a side view with three layers that scroll at different speeds (sky and clouds, hills, ground), targets drawn smaller and higher when they are "far", and a shadow under the plane that gets smaller as it climbs. Hits are side-on: a far target is half-size, and it is hit the same way. A true sideways-depth shooter is a later round (Q5).
5. **Sprites are code.** Each sprite is a list of coloured rectangles (`src/sprites.ts`); the outline is added by the builder. No image files. This is the main thing to learn from the project.
6. **Flight model.** Four forces (`src/flight.ts`): lift grows with speed² and with the angle of attack, drag grows with speed² and with lift, thrust is along the nose, weight is down. Past about 15° the wing stalls and lift falls off. A cambered wing gives some lift with the nose level. The tail pulls the nose back toward the path, so the plane needs a nose-up input to hold height.
7. **Paper glider mode** (from the Paper Airplanes project): no engine and no gun. The plane starts at 90 m and glides through rings; a ground touch ends the glide ("Landed!"). This is the Paper Airplanes lesson in play.
8. **⚙️** lower right, the family-play drawer: Plane, Mission (full / quick), Force arrows, Sound, "How it is built", Show errors. Errors stay hidden until turned on, and sit at the bottom.
9. **Track A, family play**: pastel palette, bold ink outlines, large touch buttons, the same controls on keyboard (↑↓ nose, ←→ power, Space fire).
10. **Not built**: no database (nothing needs to persist; the best score per device is local only, later if wanted).

## Open questions for Jimmy

- **Q1.** Can the container reach `remix.ui8.ai`? If you want the real game's code studied, add the host (`remix.ui8.ai`) to the environment's allowed hosts, or paste its source (or the link to its repo) here. Claude will not copy it without a licence check.
- **Q2.** Is the floppy game **A-10 Tank Killer**? Or another one (name, platform, year)? The screen to match: blocky 3-D, or a flat 2-D side view?
- **Q3.** Who plays: Felix alone, or with you? Should the game have a score that carries across missions?
- **Q4.** Is paper glider mode the right companion (rings and landings)? Should it link to the Paper Airplanes sheets (folded and flown for real)?
- **Q5.** 2.5D: is the side view with depth shading enough, or do you want a real top-down "behind the plane" view later (the classic shooter look)?
- **Q6.** The remix skill: should it run from this repo's `/remix` only, or also be published as a Claude skill in the Paper Airplanes repo?

## Next

- Play it with Felix on an iPad; note what is confusing in the ⚙️ notes (the feedback box is a later round).
- Answer Q1–Q6; the next convo round goes in `convo v0.2.md`.
