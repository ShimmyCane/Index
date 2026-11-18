# Convo v0.8 — modes, the tag, chaff, graphics

Date: 2026-11-18. Follows `convo v0.7.md`.

## Answers

- **Q10:** fine; newer instructions supersede it.
- **Q11:** yes, the stacked-slice plane is part of the graphics component. Built: the plane is drawn in four slices, lower ones darker.
- **Q12:** chaff now. The loop manoeuvre and a second missile slot later.
- **Q13:** the family account.
- **Q14:** 30 m is good.
- **Q15:** both: better sprites and moving aircraft and ships. Built: more moving aircraft (enemy and allied). **Not built yet:** moving ships and better sprites (next art pass).
- **Q16 (modes):** normal is the default. Felix mode is the easy one: the plane never goes down and nothing runs out. In normal mode the gun and missiles run out, and a reload is triggered from ⚙️ (the gun back to full, and two missiles). Finishing a mission objective restocks everything (the GTA-style reset). Modes can be split further later.
- **Q18:** yes, the gun ammo is limited (and recharges slowly).
- **Q19:** in Felix mode the flight just carries on; the score is not important.

## Built

- **Two modes:** Normal (limited supplies; three hits and the plane is down, then it blinks and carries on at full health) and Felix (easy; never down, unlimited ammo, missiles and chaff).
- **Mission objectives:** normal mode asks you to destroy 4 to 6 ground targets. Done, and a mission-complete banner restocks everything.
- **Targeting:** holding MISSILE locks onto a target in front. The ring fills over about 1.2 s; a quick tap fires nothing.
- **The tag:** an enemy missile after you shows a TAGGED pill, a beep that speeds up as it closes, and a red ring that collapses as it nears.
- **Escape:** a hard turn held for about 0.6 s breaks the enemy's lock; CHAFF (button or C) releases two decoys that draw the missile away.
- **Graphics:** the plane grows from 25% to 33% of the screen width as the turn tightens; wisps stream from the wing tips in a hard turn; a flame from the engines when boosting; a cloud trail; dust kicked up when low and fast.

## Interpretations to confirm

- **"Graphics … 25 to 33% of the screen":** read as the plane's size on screen, growing with turn tightness. If you meant the camera zoom, say so.
- **Downed in normal mode:** the plane blinks and carries on at full health, but the mission restarts with the ammo and missiles left over (not restocked). Score is kept.
- **Reload from ⚙️:** the gun to full and two missiles, with a 45 s cooldown.

## Open

- **Q20.** Downed in normal mode: restart the mission with what is left, or restock as well?
- **Q21.** A mission loading screen between missions (the "810" style)? Not built.
- **Q22.** The sample repo: studied for technique only (sprite stacking, flame, post-processing); nothing copied. Is there anything specific in it you want as the next graphics step?
