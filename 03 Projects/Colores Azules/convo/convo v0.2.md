# Colores Azules: convo v0.2

Round 2: planning the next layer (position bias, repeats, time of day, place). Nothing is built yet. Jimmy answers inline after each arrow.

## What you asked for

1. **Left and right bias.** Check whether choices lean to one side of the grid or one side of a duel, and correct for it.
2. **Repeats.** Show some blues again, on purpose, so the page can see whether a choice holds or whether past examples are steering it.
3. **Time of day.** A choice may depend on the time it is made.
4. **Place (GPS).** The view of a blue may change with where you are.

## Proposed approach

**Position bias (1)**
- Every square and every duel side is recorded with its position: grid index (0 to 15) and, for duels, left or right.
- Each batch shuffles which square sits where, so position cannot line up with taste.
- The page measures the pick rate per position and per side. If one side wins well over half the time, the taste weights are corrected for it.

**Repeats (2)**
- Each batch carries a few repeats from earlier batches (proposal: 2 of 16 on iPad, 1 of 8 on iPhone).
- Each repeat is compared with its earlier choice. The share of consistent answers is the "steadiness" of your taste. Low steadiness means the page should trust its own past picks less.

**Time of day (3)**
- Each choice is tagged with the device's local hour, grouped into a band (for example morning, afternoon, evening, night).
- The taste weights are kept per band as well as overall, so a 9 am preference and a 9 pm preference can differ.

**Place (4)**
- Raw GPS is not stored. Storing exact coordinates would be personal data in a database that sits in a public repository's project. (The database itself is owner-only, but the principle in CLAUDE.md is to keep location out of the record.)
- Option A: you label the place yourself each session (for example Home, Studio, Outside). Simple, private, and easy to read.
- Option B: the page asks for location once and stores only a daylight band (for example full daylight, low light, dark), worked out from the time and the place on the device. The coordinates never leave the device.
- Option C: both.

## Questions for Jimmy

1. **Place:** A (your own labels), B (daylight band only, from GPS on the device), or C (both)?
2. **Time bands:** which split feels right? Proposal: morning 06:00 to 11:59, afternoon 12:00 to 16:59, evening 17:00 to 20:59, night 21:00 to 05:59.
3. **Repeats:** 2 of 16 on iPad and 1 of 8 on iPhone, or more?
4. **Shuffle:** is it fine for the squares to move around each batch so their position cannot matter?
5. **Storage:** should the new tags (side, position, time band, place label or daylight band) go into the same `ca_choices` and `ca_duels` tables as new columns, with one migration? (The tables are live, so this would be a migration to add columns.)
6. **When to look at the results:** after each batch, or only at the end of a tournament?

## Notes

- No new PR yet. The current work is merged as PR #289, and nothing else is pending on the branch.
- Testing place and time needs the real device. The headless browser can fake the clock, but not GPS.
