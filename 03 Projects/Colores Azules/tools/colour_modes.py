#!/usr/bin/env python3
"""Colour sets for Colores Azules, made without any LLM.

Three families, all deterministic:
  pure     12 single hues at full strength (the colour wheel in 30 degree steps)
  mixed    blends of neighbouring hues, and of blue with each hue
  palettes groups of five colours built from harmony templates (analogous,
           split complementary, triadic, tetradic, blue-anchored). Each palette
           gets a harmony score; the top scoring ones are marked "recommended".

Run from the project folder:
  python3 tools/colour_modes.py
It writes data/colour_modes.js, which the page loads as window.COLOUR_MODES.
Change the constants below and re-run to change the sets.
"""
import colorsys
import json
import os

HUES = [i * 30 for i in range(12)]          # 0, 30, ... 330
BLUE_HUE = 220                               # the reference blue
PURE_S, PURE_L = 0.85, 0.50


def hsl_hex(h, s, l):
    r, g, b = colorsys.hls_to_rgb((h % 360) / 360.0, l, s)
    return "#%02X%02X%02X" % (round(r * 255), round(g * 255), round(b * 255))


def rgb(hex_):
    return tuple(int(hex_[i:i + 2], 16) for i in (1, 3, 5))


def hsl_of(hex_):
    r, g, b = [v / 255.0 for v in rgb(hex_)]
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    return round(h * 360) % 360, round(s * 100), round(l * 100)


def mix(a, b, t=0.5):
    ra, rb = rgb(a), rgb(b)
    return "#%02X%02X%02X" % tuple(round(x * (1 - t) + y * t) for x, y in zip(ra, rb))


def hue_gap(a, b):
    d = abs(a - b) % 360
    return min(d, 360 - d)


def pure():
    out = []
    for h in HUES:
        hex_ = hsl_hex(h, PURE_S, PURE_L)
        out.append({"id": "pure-%03d" % h, "hex": hex_, "hue": h, "label": "pure hue %d" % h})
    return out


def mixed():
    out, seen = [], set()
    base = {h: hsl_hex(h, PURE_S, PURE_L) for h in HUES}
    for h in HUES:                                     # neighbour blends
        n = (h + 30) % 360
        hex_ = mix(base[h], base[n])
        if hex_ not in seen:
            seen.add(hex_)
            out.append({"id": "mix-n-%03d" % h, "hex": hex_, "hue": hsl_of(hex_)[0], "label": "blend %d and %d" % (h, n)})
    blue = hsl_hex(BLUE_HUE, PURE_S, PURE_L)
    for h in HUES:                                     # blue blended with each hue
        if hue_gap(h, BLUE_HUE) < 15:
            continue
        hex_ = mix(blue, base[h])
        if hex_ not in seen:
            seen.add(hex_)
            out.append({"id": "mix-b-%03d" % h, "hex": hex_, "hue": hsl_of(hex_)[0], "label": "blue with %d" % h})
    return out


TEMPLATES = {
    "analogous": [-60, -30, 0, 30, 60],
    "split-complementary": [0, 30, 150, 180, 210],
    "triadic": [0, 30, 120, 150, 240],
    "tetradic": [0, 60, 180, 240, 120],
    "blue-anchored": [0, 40, 100, 160, 220],
}
LIGHTNESS_PATTERNS = {
    "even": [0.42, 0.52, 0.62, 0.72, 0.82],
    "deep": [0.22, 0.38, 0.5, 0.62, 0.78],
}


def harmony(hues, lights):
    """Higher is better: colours should be clearly apart in hue and in lightness."""
    gaps = [hue_gap(a, b) for i, a in enumerate(hues) for b in hues[i + 1:]]
    hue_spread = min(gaps) / 60.0                      # 1.0 when every pair is 60 degrees or more apart
    light_spread = (max(lights) - min(lights)) / 0.4   # 1.0 when the lightness range is 0.4
    return round(min(hue_spread, 1.0) * 0.6 + min(light_spread, 1.0) * 0.4, 3)


def palettes(count=30, recommended=10):
    cands, seen = [], set()
    for tname, offsets in TEMPLATES.items():
        for seed in HUES:
            for pname, lights in LIGHTNESS_PATTERNS.items():
                if tname == "blue-anchored":            # always built around the reference blue
                    hues = [(BLUE_HUE + o) % 360 for o in offsets]
                    if seed != HUES[0]:                 # other seeds shift the whole palette
                        hues = [(h + seed) % 360 for h in hues]
                else:
                    hues = [(seed + o) % 360 for o in offsets]
                hexes = [hsl_hex(h, PURE_S, l) for h, l in zip(hues, lights)]
                key = tuple(hexes)
                if key in seen:
                    continue
                seen.add(key)
                cands.append({"template": tname, "seed": seed, "pattern": pname,
                              "hexes": hexes, "score": harmony(hues, lights)})
    # keep a share of every template, so one template cannot fill the whole list
    per = count // len(TEMPLATES)
    chosen = []
    for tname in TEMPLATES:
        group = sorted((c for c in cands if c["template"] == tname),
                       key=lambda c: (-c["score"], c["seed"], c["pattern"]))
        chosen += group[:per]
    chosen.sort(key=lambda c: (-c["score"], c["template"], c["seed"], c["pattern"]))
    out = []
    for i, c in enumerate(chosen):
        out.append({"id": "pal-%03d" % i, "hexes": c["hexes"], "template": c["template"],
                    "seed": c["seed"], "pattern": c["pattern"], "score": c["score"],
                    "recommended": i < recommended})
    return out


def build():
    return {"pure": pure(), "mixed": mixed(), "palettes": palettes()}


if __name__ == "__main__":
    data = build()
    here = os.path.dirname(os.path.abspath(__file__))
    out_path = os.path.join(here, "..", "data", "colour_modes.js")
    with open(out_path, "w") as f:
        f.write("// generated by tools/colour_modes.py; do not edit by hand\n")
        f.write("window.COLOUR_MODES = " + json.dumps(data, indent=1) + ";\n")
    print("pure", len(data["pure"]), "mixed", len(data["mixed"]), "palettes", len(data["palettes"]),
          "recommended", sum(p["recommended"] for p in data["palettes"]))
    print("wrote", os.path.normpath(out_path))
