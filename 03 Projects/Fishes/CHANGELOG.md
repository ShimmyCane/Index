# Fishes — Changelog

Every version the team can open, newest first. The version shows on the title screen and at the top of ⚙️ Settings. If you see a different version there than below, you are looking at an older copy.

## 0.3 — 2026-11-03 (not yet merged)
- Family sign-in is in ⚙️ only; removed from the front page.
- Settings sections (sound and errors, family database, notes) start collapsed; tap to open.
- Notes go to the cloud database: each note is kept on the device with an unsent flag, sent when you save while signed in, and sent automatically when you sign in. ⚙️ and the title screen show how many notes are still only on the device.

## 0.2 — 2026-11-03 (PR #90, merged)
- 20 tiers, now 88 species (3–8 per tier, food included). Each tier mixes docile, wary and aggressive fish.
- The player evolves into its tier's lead species.
- Fish eat fish: a non-docile fish ≥1.25× bigger eats a smaller fish it touches.
- The sea adapts: predators come from 1–3 tiers above the player, prey from 0–3 tiers below.
- Difficulty on the title screen is the predator:prey ratio: Easy 1:4, Medium 1:2, Hard 1:1.
- Family database: `fish_notes` applied to the Family project. Family sign-in in ⚙️ → Family database, also reachable from the title screen. Notes save to the cookie first, then to the family table.

## 0.1 — 2026-11-03 (PR #88, merged)
- First playable MVP: 20 levels, one species per level, lock-on hunters, three lives, 15-minute cap.
- Notes saved to a cookie. Database SQL written but not applied.
