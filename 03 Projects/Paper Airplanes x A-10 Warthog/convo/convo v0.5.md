# Convo v0.5 — round 3 requests, and what is built

Date: 2026-11-18. Follows `convo v0.4.md`.

## Requests and status

- **Family database sign-in:** built (drawer ▸ ☁️ Family database). Email and password go to the family project's sign-in. Only the publishable key is in the browser code. The password is cleared after each try and not kept. Check database says whether the saved sign-in still works. **Not yet:** saving flights to the database. That needs a table, written as a SQL file and pasted by Jimmy (supabase-link). Sign-in was tested with a made-up account, and it reports a plain "Sign-in failed (401)".
- **Radar:** built (top left). Heading-up, range 1,200 m, rings at 400, 800 and 1,200 m. Colours: red army, green farm, blue town, purple airfield, deep blue ships, brown rail, orange guns and SAM sites. White dots for glider rings.
- **Missile count and reload:** built. Six missiles (HUD: 🚀 6/6). Drawer ▸ Safety and reload: **Automatic** brings one back every 3 s, up to six; **Off** means six, then none.
- **Gun modes:** built. With aircraft within 900 m ahead, the gun points straight. With a ground target within 700 m ahead, it points down at it, with the bullet's drop allowed for (HUD shows the declination, e.g. "1.0° down").
- **Safe flight (default on):** built. Below 30 m above the ground the plane levels out and pulls up. Below 8 m it cannot sink further. The message says "Safe flight: pulling up".
- **Invincibility:** built (drawer ▸ Safety and reload). Shells and missiles do no harm; a crash only bounces the plane.
- **More world (iteration 1):** built.
  - Farm houses and barns; town towers; army tanks (main battle tank, light tank, armoured carrier), trucks, a fuel tanker, a SAM launcher with radar, flak guns; barracks, a hangar, parked jets; warships at sea; railway wagons.
  - The sea starts at 1,300 m east, and the ground colours change by biome (sea, farm, town, army).
  - Assets live in `src/assets/` (aircraft, vehicles, buildings, naval), each a short painter in code.
- **Merge:** after tests (26 flight and rule checks) and a headless browser pass (no page errors; a 401 from a wrong login is the server's normal reply).

## Not done yet (iterations 2–3, as asked)

- Better sprites: more detail, shading and sizes per type. The current ones are first drafts.
- Flying enemy aircraft and moving ships, instead of parked jets and static ships.
- Full railway lines, roads, a city street grid, and an airfield layout.
- Sea and coast details (surf, the shore).
- Saving scores and flights to the family database (needs the table SQL and a paste by Jimmy).

## Questions for Jimmy

- **Q13.** Is the family login to use the same account as the Paper Airplanes flights table, or a separate one?
- **Q14.** Should the safe-flight floor be 30 m (as now), or lower for a harder game?
- **Q15.** For iteration 2, which should come first: better sprites, moving aircraft and ships, or the railway and roads?
