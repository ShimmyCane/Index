# Felix Gear Wars: champions

The **boss gear** (a purple gear with a crown inside) needs 100 turns of the heart (⚙️ ratio 10 to 200). When it fills, a **random champion** steps out. Each is a different awesome unit with its own power. Stats are for level 1 and grow 2.2× per gear level, like every fighter (`F.CHAMPS` in `js/data.js`).

| Champion | Health | Attack | Defence | Range | Speed | Power |
|---|---|---|---|---|---|---|
| Dragon | 420 | 36 | 10 | 300 | 70 | **Flies** (spearmen, knights and other melee fighters cannot reach it) and breathes fire on everything in front of it, hurting less the farther away they stand. |
| King | 620 | 30 | 22 | 56 | 50 | **Rallies:** fighters within 320 px get +30% attack, and he heals them 4 health a second. |
| Felix the Cart | 520 | 26 | 28 | 40 | 140 | **Rolls straight through the enemy**, hurting everything it touches every half second and knocking it back. Stops to smash towers and the fortress. |
| Griffin | 300 | 40 | 6 | 50 | 150 | **Flies** over the front line and **dives on the back line** (archers, mages, catapults first) with a strong first strike. |
| Golem | 1100 | 34 | 40 | 52 | 28 | **Stomps:** every hit shakes the ground, hurting and **slowing** every enemy within 130 px for 2.4 seconds. |
| Unicorn | 360 | 20 | 14 | 220 | 70 | **Heals** all fighters within 360 px for 7% of their health every 2.2 seconds, and throws rainbow bolts. |

- Flying champions are drawn above the ground and are hit only by ranged fighters, castles, towers and bolts.
- A champion also gets the culture's star bonus if its type matched (it never does, the star is for the eight normal fighters).
- The champion is shown with a crown over its head, its own HP bar and the gold stars of its gear level.
- Powers are checked by `node`-level tests in the session log (breath hits all three enemies in a row for about 30% each; spearmen do 0% to a dragon; the cart knocks back 64 px; the golem slows; the unicorn heals; the king rallies).
