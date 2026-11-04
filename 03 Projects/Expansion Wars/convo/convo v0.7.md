# Expansion Wars — Convo v0.7 (version 2: country layer)

**Project:** Expansion Wars
**Round:** 8 — archive of version 1, and a first proposal for version 2 with a country layer. Answers from Jimmy go inline under each question.

## Done this round

- **Version 1 archived** in `V1/` (a copy of the game as it stood). The ⚙️ settings have a "Play version 1 (archive)" link. Checked: the link opens the archived game.

## Version 2 proposal: a country layer

**The idea.** Two zoom levels, one game. Zoomed out, you see the country: nations, their provinces, trade routes and borders, and the diplomacy. Zoomed in on a province, you play the battle we have now (villages, cities, fortresses, soldiers, roads). Peace is the usual state; war is a choice that costs something.

**Provinces.** A nation is a group of provinces. A province is one of today's maps (its regions are the villages, cities and fortresses). Zoom out and the provinces join up into nations.

**Four things to track.**
- **Food** comes from villages (the mushrooms are the farms). Armies eat it. Without food, soldiers leave.
- **Gold** comes from cities and trade routes. It pays for trade deals, tribute and alliances.
- **Stone** comes from fortresses. It pays for building and for upgrades.
- **Reputation** is a trust score between each pair of nations. It is not spent. It sets trade prices and whether a nation will accept an alliance or a ceasefire.

**Diplomacy (the simple menu).** Propose trade, propose a ceasefire, propose an alliance, ask for tribute. The other nation accepts when reputation and its needs match. Breaking a treaty, or attacking an ally, lowers reputation with everyone who saw it.

**War.** Declaring war costs reputation. Fights happen in provinces, as now. Allies join the fight, which gives the team battles you described.

**Pace.** The country layer ticks every 10 seconds (trade, food, reputation). Province battles stay real-time.

## Questions

1. **Zoom model.** Zoomed out, the whole country; tap a province to zoom in and play it. Is that the right model? Should a battle always happen in a province, or can nations fight on the country map?

   > **Jimmy:**

2. **Resources.** Food, gold and stone, plus reputation. Is that the right list? Anything missing (for example soldiers as a resource, or wood)?

   > **Jimmy:**

3. **Who negotiates.** Only computer nations, or can players in a multiplayer level negotiate with each other?

   > **Jimmy:**

4. **Reputation.** What raises it and what lowers it? My proposal: honouring a trade or ceasefire raises it; breaking a treaty or attacking an ally lowers it.

   > **Jimmy:**

5. **Pace.** Real-time, with the country ticking every 10 seconds, or turn-based on the country map?

   > **Jimmy:**

6. **Levels.** Does version 2 replace levels 10 to 15, or sit beside them as its own set?

   > **Jimmy:**

7. **Settings.** Is the "Play version 1 (archive)" link in ⚙️ what you meant by archiving it in the settings?

   > **Jimmy:**

---

_Answers go in `convo/convo v0.8.md` once this round is complete._
