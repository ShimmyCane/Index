# Massage Map: schematic

**Status:** build 0.1.0 (increment 1: foot map with EN and 中文 sets, films, stars, notes) · **Updated:** 2026-11-25 · **Track:** A. Family play
**Based on:** Jimmy's request (2026-11-25): learn about massage through pictures, videos and reading; tap a body part, zoom in, see a technique played back, and let Ying and Jimmy give thumbs up. Questions are in `convo/convo v0.1.md`.

## Concept

A picture-first guide to foot massage, growing to the whole body. A child or adult taps a part of the body, zooms in, picks a technique, and watches a short looping film of where and how hard to press. Each technique has a wiki page of research with links. Family members mark what they like.

Foot first: sole, top of the foot, side, and ankle. Later: hand, back, neck, legs.

Not medical advice. Each page says this in one short line. Massage is general wellness. Do not press on injuries, swelling, broken skin, varicose veins, or where a clot may be. Ask a professional first if there is a condition or pregnancy.

## Screens

| Screen | What it does |
|---|---|
| 1. Body map | A simple flat figure (drawn in SVG, pastel). Tap a region to zoom in. First build: the foot with four areas (sole, top, side, ankle). Two-finger pinch zooms on iPad. A back button. |
| 2. Technique | Pick a technique for the zoomed area (a list of cards). Opens a film. |
| 3. Film | An animated foot (or hand) in the same drawn style. Press points are dots. Arrows show direction. Heat shows pressure: pale to warm to deep red. A time line with play, back to start, and a speed control. Loops. Autoplays twice, then pauses and waits for ▶. |
| 4. Wiki | One page per area and per technique: what it is, how to do it, sources (videos and articles with links), and a note on how strong the evidence is. |
| 5. Favourites | Thumbs up per person (Ying, Jimmy) for each technique and area. A simple table: which area and technique each person likes most. |

Gear (⚙️, lower right): speed, autoplay on or off, heat on or off, show errors, family sign-in and database check, feedback notes.

## Figure and film

- First build: flat SVG drawings, bold 2.5 to 3.5 px dark lines, pastel fill, tactile shadow. Drawn by hand in the page; no photos of real people.
- Press points and paths are data: each technique has a list of steps (point, direction, pressure 1 to 5, duration). The film reads the list, so new techniques are data, not new code.
- Later option (asked): a 3-D foot that can be turned. Not in the first build.

## Techniques and research

- Starter list (to confirm with Jimmy): thumb walking, knuckle press, palm circles, heel rotation, toe pull, ankle circles, sole stripping, side squeeze.
- Each technique entry in a data file (`js/data/`): name, areas, steps, sources, evidence level, and a short plain-words description.
- Research: a `research/` folder with one note per source (video or article), with link, date seen, a one-line summary, and what it claims. Claims with no source are marked "unverified". A single summary per technique goes in the wiki.
- No copyrighted video is copied. Videos are linked, not embedded or saved.

## Family data (planned, not built)

Family project database, with the prefix `mm_` (to confirm). Family login from ⚙️ follows `04 AI/Skills/supabase_setup.md` and the 中文笔画 pattern. Publishable key only.

| Table | Columns (plan) |
|---|---|
| `mm_thumbs` | `id`, `person` (Ying or Jimmy), `technique_id`, `area_id`, `liked` (true or false), `created_at` |
| `mm_notes` | `id`, `text`, `page`, `item`, `label`, `version`, `status` (open or done), `noted_at` |

Rules:
- One thumb per person per technique and area. Changing the mind updates the row.
- Row-level security on. `anon` revoked. Family sign-in may insert, read and update.
- Until sign-in works, thumbs are stored on the device only, and ⚙️ says "this device only".
- Registered in `app_table_registry`.

## Feedback notes

Built with the first build (`02 Refs/Skills/feedback_loop.md`). A notes box in ⚙️ labelled "Notes for improvement". Each note saved with the screen or technique it is about, and the time. Stored on the device first; sent to `mm_notes` only when signed in.

## Track A defaults

| Setting | Value |
|---|---|
| Words on screen | few, with icons and short labels |
| Options visible | the body map, the technique cards, the film controls |
| ⚙️ holds | speed, autoplay, heat, errors, sign-in, notes |
| Panels | collapsible; wiki panels closed on a small screen |
| Palette | pastel and the family look (ink, paper, sun) |
| Database | Family project, family sign-in |
| Private data | none planned. Photos of family, if ever added, go in `private/` |
| Skills | `ipad_website`, `settings_gear`, `feedback_notes`, `smoke_test`, `supabase_setup` |

## Build plan (after questions are answered)

1. **Increment 1:** body map (foot, four areas), one technique (knuckle press) as a film, favourites on device, feedback notes, ⚙️. Smoke test at three sizes.
2. **Increment 2:** the full starter list of techniques, each with a wiki page and sources.
3. **Increment 3:** family sign-in and the `mm_thumbs` table, with the rolled-back test.
4. **Increment 4:** more body areas (hand, back, legs), a summary table of thumbs.

## Revisions from convo v0.1 (2026-11-25)

- **Figure:** realistic, physical look (not cartoon). Separate male and female bodies. Asian body proportions as the reference. Drawing studies come first, to show Jimmy the target look before building (`jimmy_preferences.md` §6). Front, top and sole, side, and other views as needed.
- **Film:** 20 seconds per loop. A side-by-side view of two techniques or two hands is part of the screen.
- **Colour:** the body map is colour-coded by technique. A separate Techniques page teaches each technique, with links and videos (well-known sources only).
- **Rating:** 1 to 5 stars per person per technique and area. Changing the rating is allowed. Stars show a progression.
- **Kids:** the children's figures are hidden by a settings toggle (off by default). Not part of the first build's adult view.
- **Language:** a toggle for English and 中文. Order not decided.
- **Safety:** one line on the front page only: "This is massage, not medicine." No per-page disclaimer.
- **Name:** "Massage Map" for the home tile.
- **Existing apps** (for reference, `convo/convo v0.1.md`): Sole Massage Guide, Massage Maps • Reflexology, Pressure Points Guide, Massage Techniques (Real Bodywork), Massage: Lessons & Techniques. None has animated press-direction film with pressure heat plus family ratings. Gap confirmed.

## Open questions

See `convo/convo v0.1.md`.

## Build 0.1.0 (2026-11-25)

Built: `index.html`, `css/app.css`, `js/data.js`, `js/app.js`.
- Body map: foot views (sole, top, outer side, ankle), tap a point for where it is, zoom in and reset.
- Two sets. EN: eight touch techniques on areas. 中文: eight Tui Na handling methods (按 揉 推 拿 捏 擦 叩 搓) on acupoints (KI1, LR3, ST44, SP6 and others), named with the WHO-style code.
- Film: 20-second loop, press dots, direction arrows, heat by pressure 1 to 5, numbers, speed, autoplay twice then pause, time slider, compare two side by side.
- Learn tab: each technique with its description and sources (well-known sites only).
- Favourites: 1 to 5 stars for Ying and Jimmy, saved on this device, with a summary table.
- ⚙️: language, speed, autoplay, heat, numbers, children's figures toggle (no figures yet), who is rating, show errors, notes for improvement, database line.
- Front-page line: "This is massage, not medicine."
- Home page tile in the Nursery list.

Not built yet:
- Realistic figures (male and female, Asian body reference). The current foot is a placeholder drawing. Drawing studies come first.
- Children's figures (the toggle is in place, nothing shows yet).
- Family sign-in and the `mm_thumbs` and `mm_notes` tables. Ratings stay on the device.
- Sources for the EN techniques. Videos are not linked yet.
- Verification of acupoint positions against the WHO standard. The positions are approximate and marked as such.
