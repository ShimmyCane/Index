# Expansion Wars — Convo v0.4

**Project:** Expansion Wars
**Round:** 5 — feedback notes read from the family table on 2026-11-03 (9 open notes, 6 on Level 5 Hills). Answers from Jimmy go inline under each question.

## What the notes asked for, and where it stands

Built, checked in the code:
- Soldiers fight when they collide on the way (Level 2 note). Roads only meet at spots, so armies can only meet head-on on one road.
- The 3-second countdown on every start (Level 4 note).

Process note, adopted: "LLM should mark tasks done by themselves." Todo items are ticked in the same change that builds them. Notes are marked done after Jimmy confirms, using the skill's update.

Answered in this round and being built: question 1 (upgrades for every spot, capture drops one grade), question 2 (mushrooms are the smallest villages), and the fortress part of question 1 (metropolis becomes fortress, fortresses shoot).

Not answered yet: questions 3, 4, 5 and 6 below.

## Questions

1. **All territories can be upgraded; capture drops the grade.** Your note says: "When taken over the element will drop down in grade. All territories can be upgraded." Today only cities upgrade, and a captured city resets to village.
   - Which spots should upgrade: mushrooms (see question 2), cities and fortresses?
   - When a spot is captured, should it drop one grade (metropolis to city, city to town, and so on), or reset to village as now?
   - What does a fortress upgrade do? It has no tiers yet.

   > **Jimmy:** The mushrooms should be the very smallest villages and capped. When they upgrade, they become cities. Yes, a captured spot drops one grade. When cities fully upgrade they become fortresses, and fortresses shoot within a small radius around their territory and prevent enemy movement.

   > **Built, with my defaults (check these):**
   > - Mushroom: village tier, cap 20, rate 1.0 a second. Upgrading one costs 20 soldiers and turns it into a city at town tier (cap 40, rate 2.0).
   > - Capture drops one grade: metropolis to city, city to town, town to village. A village stays a village.
   > - Metropolis to fortress: a second upgrade costs 40 soldiers. The fortress has cap 40, grows at 0.5 a second, and does not upgrade further.
   > - Fortress range: 120 map units (about a third of a screen). Enemy armies that enter the range stop and lose 2 soldiers a second. Not yet confirmed: the range, the damage, and whether a fortress should also stop its own team's armies (it does not).

2. **The simple mushrooms are villages.** Your note says: "The simple mushrooms are villages." So the mushroom factories would join the same tier ladder as cities, starting at village.
   - Should mushrooms get the same caps (20, 40, 60, 80)? Today they grow without a cap.
   - Should the ladder be the same for mushrooms and cities, with the same costs and rates?

   > **Jimmy:** The mushrooms should be the very smallest villages and capped. (See the built defaults under question 1: capped at 20, and an upgrade turns the mushroom into a city at town tier.)

3. **Surrender.** Your note says: "AI will surrender when they are beyond saving. User too. Toggle to allow surrender should be in settings."
   - What does "beyond saving" mean? Proposed default: a player with no spots, or with fewer soldiers than the spots they hold would need to defend, and no way back. Give me your rule.
   - Should the surrender toggle be on or off by default?
   - When a player surrenders, what happens to their spots: they go neutral, or to the player who took the most?

   > **Jimmy:**

4. **Upgrades take longer each tier.** Your note says: "It takes progressively longer to upgrade. During which it does not increase their army, making them vulnerable. Animate dust to visually suggest the upgrade."
   - How long should each upgrade take? Proposed default: town 3 seconds, city 6 seconds, metropolis 10 seconds.
   - During an upgrade, the city stops growing but keeps its soldiers. If the city is attacked and captured mid-upgrade, should the upgrade be cancelled and the soldiers kept?
   - Should the dust be a puff of dust at the city's foot, or something else?

   > **Jimmy:**

5. **Zoom out to fit.** Your note says: "For levels that map expands beyond the screen. Allow ability to zoom out to fit all. The elements should stay Same size."
   - Zooming out with spots the same size means the spots will overlap on a wide field. Is that acceptable, or should spots shrink when you zoom out?
   - Is this the same zoom as the level 10 zoom in the todo, or a separate control?

   > **Jimmy:**

6. **Test note.** The note "Test note 1" (Level 4 Valley) is a test. Mark it done, or keep it open?

   > **Jimmy:**

---

_Answers go in `convo/convo v0.5.md` once this round is complete._
