# Critique Detail — lessons

1. **A mock mode needs a labelled fixture, not invented findings.** `--mock` uses a hand-written fixture for the sample and otherwise lists the checklist as "not reviewed". The report, the redline and the page each say it is a mock.
2. **Number bubbles on neighbouring boxes overlap and block taps.** The smoke test caught bubble 3 covering bubble 2. Slide a bubble along the top edge when another is within one bubble width, and measure that width against the sheet's real size.
3. **The shared `platform_owner.sql` fails on the Architecture project** because it inserts into `app_table_registry`, which only the Family project has. Check which registry a project uses before copying the file.
4. **Structured output schemas take no array-length or number limits.** Ask for a box as an object with four named integers, then convert and clamp it in code.
5. **A rolled-back SQL test sent through the Supabase tool can time out on its confirmation.** Check afterwards, read-only, that nothing was left behind, and leave the test for the paste route.
