# Drawing clouds in 3-D: what the field does, and what the MVP does

Research note for Generate Clouds, 2026-11-15.

## The standard method: march a ray through a density field

A cloud has no surface, so it cannot be a mesh. For each pixel, step along the view ray; at each step ask "how dense is the cloud here?", then step a few times toward the sun to ask "how much cloud is between here and the light?". Add up the light, fade it by what is in front. This is ray marching, and it is what games and films use.

The best-known real-time version is Guerrilla Games' work for Horizon Zero Dawn (Schneider and Vos, 2015) and its later Nubis system (2017, 2022):
- **Shape from noise.** A low-frequency 3-D "Perlin-Worley" noise gives billowy bases; higher-frequency Worley noise erodes the edges. Worley noise is the cauliflower look; Perlin noise keeps the pieces connected.
- **A weather map** from above says where clouds are, how much, and what type.
- **A height profile per type** shapes each cloud between its base and top (flat for stratus, rounded for cumulus, anvil for cumulonimbus).
- **Lighting:** Beer's law for shadowing, a forward-peaked phase function for the silver lining, and a "powder" term for the dark creases.
- **Speed:** render a quarter of the pixels each frame and reuse the rest from the last frame.

For the air itself, the usual reference is Hillaire (2020, used in Unreal Engine): small lookup tables for transmittance, multiple scattering and the sky view, cheap enough for phones.

## What the MVP does

| Part | MVP | A fuller version |
|---|---|---|
| Density noise | Value noise from one 256 × 256 texture (a classic shader trick), 4 octaves, with a ridged detail pass | Perlin-Worley 3-D textures, baked once |
| Layers | Two marched volumes (low, mid) in spherical shells, plus one flat high layer | Any number of layers; cirrus as a volume |
| Weather map | Noise, biased by the cover percentage from the data | Satellite image or radar as the map |
| Type | Six low types, two mid, three high, as a table of numbers (`js/skymodel.js`) | Blends between types across the sky |
| Light | Beer's law, two-lobe phase function, a slow-fading second term, ambient from the sky | Multiple-scattering octaves, cloud-to-cloud shadows, shadows on the ground |
| Air | Single scattering marched per pixel, ozone, a blue second-bounce fill | Hillaire's lookup tables |
| Speed | Half resolution by default, sharper or coarser by itself to stay smooth | Reuse of the previous frame, blue-noise jitter |
| Time | Wind drift per layer, slow change of shape, cover follows the next hour's data | A small fluid or growth model per cloud |
| Output | PNG view up to 4K and a 2:1 panorama up to 8K, drawn in tiles | EXR/HDR with real brightness for lighting a render |

## Why a panorama export works as a backdrop

An equirectangular image (2:1, longitude across, latitude up) wraps onto a sphere without seams. Rendering programs accept it as a sky dome or environment map. The MVP's PNG is tone-mapped to 8 bits, so it is a **backdrop**, not yet a light source: an HDR file would be needed to light a scene with it.

## Ideas worth testing next

1. Bake a Perlin-Worley 3-D texture (`/bake-cache`) for rounder cumulus.
2. Write 32-bit HDR (Radiance `.hdr` is simple to write in the browser) so the panorama can light a render.
3. Fly-through camera path as a looping motion file.
4. Cloud shadows on a ground plane, and a horizon with terrain from elevation data.
5. A frame sequence export (15 s at 30 frames) for video.

## Sources

- Schneider and Vos, "The Real-time Volumetric Cloudscapes of Horizon Zero Dawn", SIGGRAPH 2015: https://www.advances.realtimerendering.com/s2015/The%20Real-time%20Volumetric%20Cloudscapes%20of%20Horizon%20-%20Zero%20Dawn%20-%20ARTR.pdf
- Schneider, "Nubis: Authoring Real-Time Volumetric Cloudscapes with the Decima Engine", 2017: https://www.guerrilla-games.com/read/nubis-authoring-real-time-volumetric-cloudscapes-with-the-decima-engine
- Schneider, "Nubis, Evolved", SIGGRAPH 2022: https://advances.realtimerendering.com/s2022/SIGGRAPH2022-Advances-NubisEvolved-NoVideos.pdf
- Hillaire, "A Scalable and Production Ready Sky and Atmosphere Rendering Technique", 2020: https://diglib.eg.org/handle/10.1111/cgf14050
