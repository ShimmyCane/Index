#!/usr/bin/env python3
"""Draw the synthetic samples. None is from a real project. Run: python3 tools/make_sample.py

- inputs/detail_sample.png: a parapet section with deliberate faults, so a review has something to find.
- inputs/detail_slop.png: a drawing that should be rejected at the gate.
- library/good_details/077100_roof_parapet/*.jpg: the same parapet drawn correctly, cropped per rulebook item.
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


def draw_sample():
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
    return img



def scallop_free_line(d, pts, colour, width):
    d.line(pts, fill=colour, width=width, joint="curve")


def draw_good():
    """The same parapet drawn correctly. Used only as the 'what good looks like' reference."""
    img = Image.new("RGB", (W, H), (251, 250, 247))
    d = ImageDraw.Draw(img)
    f, small, big = font(20), font(17), font(30)
    BLUE, GREEN = (30, 90, 170), (40, 130, 70)
    wall = (900, 270, 1060, 1120)
    d.rectangle(wall, fill=(226, 226, 222), outline=INK, width=3)
    hatch(d, wall, 26, (150, 150, 146))
    # continuous exterior insulation and cladding run to the top of the parapet, and insulation wraps the roof side
    d.rectangle((1060, 270, 1120, 1120), fill=(247, 226, 190), outline=INK, width=2)
    hatch(d, (1060, 270, 1120, 1120), 14, (200, 160, 100), -1)
    d.rectangle((1120, 290, 1150, 1120), fill=(214, 200, 190), outline=INK, width=2)
    d.rectangle((860, 270, 900, 556), fill=(247, 226, 190), outline=INK, width=2)
    hatch(d, (860, 270, 900, 556), 14, (200, 160, 100), -1)
    # roof slab, tapered insulation, cant
    d.rectangle((140, 640, 900, 705), fill=(214, 214, 210), outline=INK, width=3)
    hatch(d, (140, 640, 900, 705), 22, (140, 140, 136))
    d.polygon([(140, 575), (860, 556), (860, 640), (140, 640)], fill=(247, 226, 190), outline=INK)
    d.polygon([(800, 556), (860, 556), (860, 500)], fill=(200, 180, 150), outline=INK)
    # wood blocking on top, sloped to the roof side
    d.polygon([(860, 270), (1120, 246), (1120, 270)], fill=(222, 190, 140), outline=INK)
    # air and water barrier on the wall (blue), lapped over the top
    d.line([(1062, 1120), (1062, 268), (1120, 244)], fill=BLUE, width=4)
    # roof membrane up the cant, up the parapet, over the top and down the outside face (black)
    d.line([(140, 571), (800, 552), (856, 498), (856, 266), (1124, 241), (1124, 300)], fill=(20, 20, 20), width=6)
    # counter-flashing / termination at 8 in above the roof
    d.line([(846, 400), (856, 400)], fill=GREEN, width=8)
    # sloped coping with drips both sides and a cleat
    d.line([(826, 300), (826, 262), (1152, 232), (1152, 320)], fill=(120, 130, 145), width=7)
    d.line([(826, 300), (816, 310)], fill=(120, 130, 145), width=5)
    d.line([(1152, 320), (1162, 330)], fill=(120, 130, 145), width=5)
    d.line([(140, 520), (140, 740)], fill=INK, width=2)
    d.line([(880, 1120), (1170, 1120)], fill=INK, width=2)
    # 8 in dimension for the base flashing
    d.line([(780, 400), (780, 552)], fill=INK, width=2)
    d.line([(770, 400), (790, 400)], fill=INK, width=2); d.line([(770, 552), (790, 552)], fill=INK, width=2)
    d.text((690, 462), '8" MIN.', fill=INK, font=small)
    label(d, "PREFIN. ALUM. COPING, SLOPE TO ROOF, DRIP EA. SIDE", (640, 190), (880, 256), f)
    label(d, "CONT. CLEAT", (1230, 330), (1152, 310), f)
    label(d, "P.T. WOOD BLOCKING, SLOPED", (1230, 200), (1040, 258), f)
    label(d, "MEMBRANE OVER TOP OF PARAPET", (640, 240), (990, 252), f)
    label(d, "8\" CMU PARAPET, REINF. PER STRUCT.", (1230, 460), (1000, 470), f)
    label(d, "TERMINATION BAR + COUNTER-FLASHING", (600, 380), (846, 400), f)
    label(d, "CANT STRIP", (600, 500), (826, 530), f)
    label(d, "ROOF MEMBRANE", (400, 470), (430, 562), f)
    label(d, "TAPERED ROOF INSULATION", (480, 800), (520, 600), f)
    label(d, "CONCRETE ROOF SLAB", (480, 850), (600, 675), f)
    label(d, "AIR + WATER BARRIER, LAP TO ROOF MEMBRANE", (1230, 600), (1062, 610), f)
    label(d, "2\" CONT. RIGID INSULATION TO TOP OF PARAPET", (1230, 820), (1090, 830), f)
    label(d, "METAL PANEL CLADDING", (1230, 900), (1135, 910), f)
    d.text((140, 80), "PARAPET AT LOW-SLOPE ROOF (REFERENCE)", fill=INK, font=big)
    d.text((140, 122), "SYNTHETIC SAMPLE OF A CORRECT DETAIL - NOT FOR CONSTRUCTION", fill=(120, 120, 120), font=small)
    d.line([(1180, 1150), (1380, 1150)], fill=INK, width=4)
    for x in (1180, 1280, 1380):
        d.line([(x, 1140), (x, 1160)], fill=INK, width=3)
    d.text((1180, 1162), '0        6"       12"     SCALE 1 1/2" = 1\'-0"', fill=INK, font=small)
    return img


def draw_slop():
    """A drawing that should be rejected at the gate: no labels, no scale, unclear geometry."""
    import random
    rnd = random.Random(7)
    img = Image.new("RGB", (W, H), (251, 250, 247))
    d = ImageDraw.Draw(img)
    def wobble(a, b, n=14):
        pts = [(a[0] + (b[0] - a[0]) * i / n + rnd.uniform(-9, 9), a[1] + (b[1] - a[1]) * i / n + rnd.uniform(-9, 9)) for i in range(n + 1)]
        d.line(pts, fill=(90, 90, 90), width=3, joint="curve")
    for a, b in [((200, 600), (900, 590)), ((880, 300), (900, 1000)), ((1000, 320), (1010, 980)), ((860, 290), (1050, 300)),
                 ((210, 660), (880, 655)), ((600, 400), (870, 560)), ((1010, 620), (1200, 640)), ((300, 520), (500, 700))]:
        wobble(a, b)
    d.text((620, 380), "flashing??", fill=(110, 110, 110), font=font(22))
    d.text((1060, 600), "typ.", fill=(110, 110, 110), font=font(22))
    d.text((140, 80), "roof edge thing", fill=(90, 90, 90), font=font(30))
    d.text((140, 122), "SYNTHETIC SAMPLE OF A DRAWING THAT SHOULD BE REJECTED", fill=(120, 120, 120), font=font(17))
    return img


# Crops of the good detail, one per rulebook item: (left, top, right, bottom) in pixels.
GOOD_CROPS = {"RP-1": (780, 170, 1240, 350), "RP-2": (640, 340, 960, 620), "RP-3": (800, 200, 1200, 340),
              "RP-4": (980, 200, 1560, 660), "RP-5": (840, 230, 1200, 700), "RP-6": (560, 150, 1560, 420),
              "RP-7": (880, 400, 1560, 520)}


def main():
    draw_sample().save(ROOT / "inputs" / "detail_sample.png", optimize=True)
    draw_slop().save(ROOT / "inputs" / "detail_slop.png", optimize=True)
    folder = ROOT / "library" / "good_details" / "077100_roof_parapet"
    folder.mkdir(parents=True, exist_ok=True)
    good = draw_good()
    good.convert("RGB").resize((800, 600)).save(folder / "whole.jpg", quality=80)
    for item, box in GOOD_CROPS.items():
        crop = good.crop(box)
        crop.thumbnail((520, 520))
        crop.save(folder / (item + ".jpg"), quality=82)
    print("wrote the sample, the slop sample and %d good-detail images" % (len(GOOD_CROPS) + 1))


if __name__ == "__main__":
    main()
