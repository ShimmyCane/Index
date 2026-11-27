#!/usr/bin/env python3
"""Squarified treemap for the tournament card.

The 63 blues that did not win are laid out in a rectangle. Area follows how
much each one mattered (its score). Items are placed largest first, from the
left, so importance runs left to right; each rectangle stays close to square.

Usage:
  python3 treemap_layout.py layout.json            # prints the layout as JSON
  python3 treemap_layout.py layout.json --preview out.png

layout.json: {"width": 224, "height": 96, "items": [{"hex": "#1E50A2", "score": 2}, ...]}
"""
import json
import sys


def squarify(weights, x, y, w, h):
    """Return one (x, y, w, h) rectangle per weight, in the same order.

    weights must already be sorted largest first. Each zero or negative weight
    must have been floored by the caller, so every rectangle has area.
    """
    total = float(sum(weights))
    if total <= 0 or w <= 0 or h <= 0:
        return [(x, y, 0.0, 0.0) for _ in weights]
    scale = w * h / total
    areas = [wt * scale for wt in weights]
    out = []

    def worst(row, side):
        s = sum(row)
        return max(max(side * side * r / (s * s), (s * s) / (side * side * r)) for r in row)

    i = 0
    while i < len(areas):
        side = min(w, h)
        row = [areas[i]]
        i += 1
        while i < len(areas) and worst(row + [areas[i]], side) <= worst(row, side):
            row.append(areas[i])
            i += 1
        s = sum(row)
        if w >= h:                      # lay the row as a column on the left
            cw = s / h
            yy = y
            for a in row:
                rh = a / cw
                out.append((x, yy, cw, rh))
                yy += rh
            x += cw
            w -= cw
        else:                           # lay the row across the top
            rh = s / w
            xx = x
            for a in row:
                cw = a / rh
                out.append((xx, y, cw, rh))
                xx += cw
            y += rh
            h -= rh
    return out


def layout(items, width, height, floor=0.15):
    """items: list of {hex, score}. Returns list of {hex, score, x, y, w, h}, largest first."""
    ordered = sorted(items, key=lambda it: -it["score"])
    weights = [max(float(it["score"]), 0.0) + floor for it in ordered]
    rects = squarify(weights, 0.0, 0.0, float(width), float(height))
    return [
        {"hex": it["hex"], "score": it["score"], "x": round(x, 2), "y": round(y, 2), "w": round(w, 2), "h": round(h, 2)}
        for it, (x, y, w, h) in zip(ordered, rects)
    ]


def preview(rows, width, height, path, scale=2):
    from PIL import Image, ImageDraw

    img = Image.new("RGB", (int(width * scale) + 1, int(height * scale) + 1), (246, 243, 236))
    d = ImageDraw.Draw(img)
    for r in rows:
        box = [r["x"] * scale, r["y"] * scale, (r["x"] + r["w"]) * scale - 1, (r["y"] + r["h"]) * scale - 1]
        d.rectangle(box, fill=r["hex"], outline=(246, 243, 236))
    img.save(path)


if __name__ == "__main__":
    src = json.load(open(sys.argv[1]))
    rows = layout(src["items"], src["width"], src["height"])
    if "--preview" in sys.argv:
        preview(rows, src["width"], src["height"], sys.argv[sys.argv.index("--preview") + 1])
    else:
        print(json.dumps(rows))
