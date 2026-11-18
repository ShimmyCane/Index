# Generate Clouds — notes v1 (the first set of comments, archived 2026-11-18)

These are the nine notes Jimmy wrote in the page's "Notes for improvement" box on 2026-11-16, on version 0.4.0. They were sent to the studio database (`gc_notes`) when he signed in, and read from there on 2026-11-18. This file is the fixed first set: it is not edited again. Notes are quoted as written. Places are named generally (no coordinates). Status is as of version 0.6.0.

| # | About | Note, as written | What 0.6.0 did |
|---|---|---|---|
| 1 | A map point near Wellington | "When zoomed super high out and looking down, I'm expecting to see a layout similar to that of the world map. Not a generative ground plan. Fix" | **Built.** The ground beyond the local map is now the real Earth (NASA Blue Marble, 2048 × 1024): continents, oceans and ice in the right places, from the ground to 400 km. Checked by looking straight down over Tokyo and Sydney. |
| 2 | A map point near Wellington | "When I look out, I should see basic constellations. Stars and suns" | **Not yet.** Needs a star list and constellation figures. Plan and questions in `convo v0.8.md`. |
| 3 | A map point near Wellington | "For notes, include an elevation marker too" | **Built.** Every note now says the camera height above sea level, the ground height under the camera, and whether it is over water. |
| 4 | A map point near Wellington | "When at the ground I should see the accurate floor terrain, be it google map or other of forest or water or sand or city." | **Partly.** Ground shape is finer (500 m near the place) and far ground is the real Earth, but near the camera the colours are still made up by rule. Real ground cover needs a picture source; options and a licence question in `convo v0.8.md`. |
| 5 | A map point near Wellington | "When in ocean. I want to see waves, depending on tides and area of the ocean. Reference real maps when possible." | **Built, not yet checked live.** Waves now follow the marine model for that spot: height, wave period (sets the distance between waves), direction, swell against wind waves, and the tide, which raises or lowers the water. |
| 6 | Oklahoma City | "When in ocean. I want to see waves. Let's keep the camera above the ocean for now." | **Built.** Over water the camera cannot go below 2 m above the highest crest, and it follows the tide. No underwater view. |
| 7 | Oklahoma City | "The ground should reflect elevation changes as well." | **Built.** A finer height map (about 90 m) around the place, and a Land relief setting (True, 2×, 4×) so gentle land can be read. |
| 8 | Oklahoma City | "In settings, have a toggle to hide the bottom (animation) panel." | **Built.** ⚙️ → Bottom bar → Hide. |
| 9 | Oklahoma City | "When high in the elevation Cloud and weather formation should reflect more regional patterns based on actual data." | **Built, not yet checked live.** Above 15 km a second weather grid is fetched (81 places, 250 km apart, 2000 km across) and cloud cover follows it; far clouds are drawn as larger systems instead of grain. |

Marked done in the database: none yet. Jimmy confirms which, then the notes get `status = 'done'` and the `Done- ` prefix.
