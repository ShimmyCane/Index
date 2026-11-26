# Colores Azules

Track: B. Studio design (formal look, dense panels, full labels, keyboard and pointer). Chosen in convo v0.1, answer 2.

Purpose: A swipe-through palette builder for shades of blue, where each blue has its official name and a real-life photo, and the keepers collect into a personal palette.

Status: MVP 0.1 (2026-11-26; grid of 16, swipe, palette, hex copy; photo search links only, tournament not built)

## Plan (from convo v0.1)

- **Users:** for myself (answer 1).
- **Name list:** a mix of traditions: cultures, pastels, oils, digital, Japanese, Spanish, French (answer 4).
- **Rounds:** show 16 blues at a time. Select a few from each 16. A batch of 64 is the batch size. A tournament-style round then picks the winners (answer 3).
- **Photos:** fetched online and from Instagram, with credit shown. Linked, not copied into the repo, unless the licence allows it (answer 5).
- **Keepers:** saved on local devices for now (answer 6). The architecture database is the planned home later.
- **Desktop:** arrow keys and buttons work as well as swipe and drag (answer 7).
- **Output:** swatches with names and hex codes. Holding an image down auto-copies the hex (answer 8).

## Main pages

- Round view: 16 blues in a grid, with names. Select a few.
- Swipe view: one card at a time, with name, corner photo and hex.
- Batch and tournament: the 64 batch and the winners.
- Palette: kept blues as swatches with names and hex codes.

## Database plan

None in the first build (local device storage). Architecture Supabase project later, via `/supabase-setup`.

## Feedback plan

None yet. Add `/feedback-notes` once the first page works.

## Controls plan

Not a game. Swipe, drag and arrow keys.

## Palette & defaults

Track B: paper-and-ink palette, toned-down colours, simple outlines, menus, pc-website rules. The blues themselves are the content.

## Open questions

- Photos: real photos are linked (Wikimedia search), not yet shown inline. Pick sources before adding images.
- Photo licences: which sources to start with (Wikimedia Commons, Unsplash, Instagram accounts).
- Tournament rules: how many winners per batch.
