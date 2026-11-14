#!/usr/bin/env python3
"""Draw the synthetic sample detail (inputs/detail_sample.png).

A low-slope roof parapet section with four deliberate faults, so the review has
something to find. It is not from any real project. Run: python3 tools/make_sample.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
W, H = 1600, 1200
INK = (31, 35, 40)


def font(size):
    for name in ("DejaVuSans.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "Arial.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def hatch(d, box, step, colour, slope=1):
    x0, y0, x1, y1 = box
    for k in range(-(y1 - y0), x1 - x0, step):
        a = (x0 + max(k, 0), y0 + max(-k, 0))
        n = min(x1 - a[0], y1 - a[1])
        b = (a[0] + n, a[1] + n)
        if slope < 0:
            a, b = (a[0], y0 + y1 - a[1]), (b[0], y0 + y1 - b[1])
        d.line([a, b], fill=colour, width=1)


def label(d, text, at, to, f):
    d.line([at, to], fill=INK, width=2)
    d.ellipse([to[0] - 4, to[1] - 4, to[0] + 4, to[1] + 4], fill=INK)
    left = at[0] < to[0]
    w = d.textlength(text, font=f)
    d.text((at[0] - w - 8 if left else at[0] + 8, at[1] - 11), text, fill=INK, font=f)


def main():
    img = Image.new("RGB", (W, H), (251, 250, 247))
    d = ImageDraw.Draw(img)
    f, small, big = font(20), font(17), font(30)

    # CMU backup wall and parapet (one piece, uninsulated above the roof line)
    wall = (900, 250, 1060, 1120)
    d.rectangle(wall, fill=(226, 226, 222), outline=INK, width=3)
    hatch(d, wall, 26, (150, 150, 146))
    # exterior insulation and cladding stop at the roof deck: fault (thermal bridge)
    d.rectangle((1060, 640, 1120, 1120), fill=(247, 226, 190), outline=INK, width=2)
    hatch(d, (1060, 640, 1120, 1120), 14, (200, 160, 100), -1)
    d.rectangle((1120, 640, 1150, 1120), fill=(214, 200, 190), outline=INK, width=2)
    # roof slab and insulation
    d.rectangle((140, 640, 900, 705), fill=(214, 214, 210), outline=INK, width=3)
    hatch(d, (140, 640, 900, 705), 22, (140, 140, 136))
    d.rectangle((140, 560, 900, 640), fill=(247, 226, 190), outline=INK, width=2)
    hatch(d, (140, 560, 900, 640), 14, (200, 160, 100), -1)
    # roof membrane: turns up the parapet only 60 px (about 4 in at this scale): fault
    d.line([(140, 556), (896, 556), (896, 496)], fill=(20, 20, 20), width=6)
    # flat coping, no slope, no drip, nothing under it: two faults
    d.rectangle((880, 232, 1080, 250), fill=(190, 196, 204), outline=INK, width=3)
    # break lines
    for x in (140,):
        d.line([(x, 520), (x, 740)], fill=INK, width=2)
    d.line([(880, 1120), (1170, 1120)], fill=INK, width=2)

    label(d, "PREFIN. ALUM. COPING", (1230, 200), (1040, 240), f)
    label(d, "8\" CMU PARAPET", (1230, 380), (1010, 400), f)
    label(d, "ROOF MEMBRANE, TURN UP 4\"", (520, 440), (894, 520), f)
    label(d, "TAPERED ROOF INSULATION", (480, 800), (520, 600), f)
    label(d, "CONCRETE ROOF SLAB", (480, 850), (600, 675), f)
    label(d, "2\" RIGID INSULATION", (1230, 820), (1090, 830), f)
    label(d, "METAL PANEL CLADDING", (1230, 900), (1135, 910), f)

    d.text((140, 80), "PARAPET AT LOW-SLOPE ROOF", fill=INK, font=big)
    d.text((140, 122), "SYNTHETIC SAMPLE - NOT FOR CONSTRUCTION", fill=(120, 120, 120), font=small)
    d.text((140, 1140), "EXTERIOR  >", fill=(120, 120, 120), font=small)
    d.text((1180, 1140), "(no scale shown on purpose)", fill=(150, 150, 150), font=small)
    out = ROOT / "inputs" / "detail_sample.png"
    img.save(out, optimize=True)
    print("wrote", out)


if __name__ == "__main__":
    main()
