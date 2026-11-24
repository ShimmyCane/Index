#!/usr/bin/env python3
"""sticker_cut.py: cut stickers out of a picture on a light background.

Used by /make-sticker and by Felix Stickers test sheets.

Modes:
  sticker_cut.py sheet <image> <outdir>
      A picture with several stickers (a sheet). Writes:
        <outdir>/base.png        the picture with every sticker painted over in white (the sheet background)
        <outdir>/pieces/pNN.png  one transparent cutout per sticker, cropped to its box
        <outdir>/pieces.json     [{file, box:{x,y,w,h}, area}] in reading order (top to bottom, left to right)
        <outdir>/overlay.png     the picture with numbered boxes, to check the cuts by eye

  sticker_cut.py one <image> <out.png> [--max-side N]
      One sticker on a light background. Writes the largest piece as a transparent PNG
      cropped to its box (scaled so its longer side is N px, if given), and prints the box.

  sticker_cut.py slot <base.png> <w> <h>
      Finds an empty spot on a sheet background (a white rectangle w x h, with a 12 px margin)
      nearest the middle of the sheet. Prints x, y. Used when a new sticker is added to a sheet.

How it works: pixels that are light (brightness >= --light) and connected to the picture's edge
are the background, including the cream halo around a sticker. Everything else is the sticker,
including light areas that are enclosed by its dark outline (for example a plate's cream centre).
The cut is the mask of each piece; no colour is guessed.

Needs: Python 3, Pillow, numpy, scipy.  Nothing is sent anywhere.
"""
import argparse
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage


def foreground(rgb, light):
    """Return a boolean mask of the sticker pixels (True = sticker)."""
    lum = rgb.mean(axis=2)
    is_light = lum >= light
    labels, _ = ndimage.label(is_light)  # 4-connected light regions
    edge = set(np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]])))
    edge.discard(0)
    background = np.isin(labels, list(edge))
    return ~background


def pieces_of(fg, min_area):
    """Label the sticker mask into pieces; keep the ones with at least min_area pixels."""
    labels, n = ndimage.label(fg, structure=np.ones((3, 3)))  # 8-connected
    out = []
    for k in range(1, n + 1):
        ys, xs = np.nonzero(labels == k)
        area = ys.size
        if area < min_area:
            continue
        out.append({'mask_id': k, 'x0': int(xs.min()), 'y0': int(ys.min()),
                    'x1': int(xs.max()) + 1, 'y1': int(ys.max()) + 1, 'area': int(area)})
    return labels, out


def cutout(rgb, labels, p):
    """Transparent RGBA crop of one piece, using its own mask only."""
    x0, y0, x1, y1 = p['x0'], p['y0'], p['x1'], p['y1']
    crop = rgb[y0:y1, x0:x1]
    alpha = ((labels[y0:y1, x0:x1] == p['mask_id']) * 255).astype(np.uint8)
    rgba = np.dstack([crop.astype(np.uint8), alpha])
    return Image.fromarray(rgba, 'RGBA')


def reading_order(pieces):
    # Rows are grouped by the top edge in bands of 60 px, then left to right.
    return sorted(pieces, key=lambda p: (p['y0'] // 60, p['x0']))


def cmd_sheet(args):
    img = Image.open(args.image).convert('RGB')
    rgb = np.array(img).astype(np.int32)
    fg = foreground(rgb, args.light)
    labels, pieces = pieces_of(fg, args.min_area)
    pieces = reading_order(pieces)

    os.makedirs(os.path.join(args.outdir, 'pieces'), exist_ok=True)

    # Base: paint every sticker pixel (and a 3 px margin) white, so the sheet keeps the rest of the picture.
    grown = ndimage.binary_dilation(fg, iterations=3)
    base = np.array(img)
    base[grown] = 255
    Image.fromarray(base, 'RGB').save(os.path.join(args.outdir, 'base.png'), optimize=True)

    manifest = []
    overlay = img.copy()
    draw = ImageDraw.Draw(overlay)
    for i, p in enumerate(pieces, start=1):
        name = 'p%02d.png' % i
        cutout(rgb, labels, p).save(os.path.join(args.outdir, 'pieces', name), optimize=True)
        box = {'x': p['x0'], 'y': p['y0'], 'w': p['x1'] - p['x0'], 'h': p['y1'] - p['y0']}
        manifest.append({'file': 'pieces/' + name, 'box': box, 'area': p['area']})
        draw.rectangle([p['x0'], p['y0'], p['x1'], p['y1']], outline=(255, 0, 180), width=4)
        draw.text((p['x0'] + 6, p['y0'] + 4), str(i), fill=(255, 0, 180))
    overlay.save(os.path.join(args.outdir, 'overlay.png'))
    with open(os.path.join(args.outdir, 'pieces.json'), 'w') as f:
        json.dump({'ref': {'w': img.width, 'h': img.height}, 'pieces': manifest}, f, indent=2)
    print('pieces: %d (min area %d px)' % (len(manifest), args.min_area))
    for i, m in enumerate(manifest, start=1):
        b = m['box']
        print('  p%02d  x=%4d y=%4d w=%4d h=%4d  area=%d' % (i, b['x'], b['y'], b['w'], b['h'], m['area']))


def cmd_one(args):
    img = Image.open(args.image).convert('RGB')
    rgb = np.array(img).astype(np.int32)
    fg = foreground(rgb, args.light)
    labels, pieces = pieces_of(fg, args.min_area)
    if not pieces:
        sys.exit('no sticker found; try a lower --light or a smaller --min-area')
    big = max(pieces, key=lambda p: p['area'])
    out = cutout(rgb, labels, big)
    if args.max_side:
        k = args.max_side / float(max(out.size))
        if k < 1:
            out = out.resize((max(1, round(out.width * k)), max(1, round(out.height * k))), Image.LANCZOS)
    out.save(args.out, optimize=True)
    b = big
    print('box x=%d y=%d w=%d h=%d area=%d; saved %dx%d -> %s' % (
        b['x0'], b['y0'], b['x1'] - b['x0'], b['y1'] - b['y0'], b['area'], out.width, out.height, args.out))


def cmd_slot(args):
    base = np.array(Image.open(args.base).convert('L')).astype(np.float64)
    h, w = base.shape
    ok = (base >= 246).astype(np.float64)  # near-white: nothing drawn here
    m = 12
    for spec in args.avoid or []:           # existing sticker boxes (erased on the base) are not free
        x, y, bw, bh = [int(v) for v in spec.split(',')]
        ok[max(0, y - m):y + bh + m, max(0, x - m):x + bw + m] = 0
    # integral image: count of white pixels in any rectangle, in O(1)
    S = np.zeros((h + 1, w + 1)); S[1:, 1:] = ok.cumsum(0).cumsum(1)
    rw, rh = args.w + 2 * m, args.h + 2 * m
    best = None
    cx, cy = w / 2.0, h / 2.0
    for y in range(0, h - rh + 1, 4):
        for x in range(0, w - rw + 1, 4):
            total = S[y + rh, x + rw] - S[y, x + rw] - S[y + rh, x] + S[y, x]
            if total >= rw * rh:
                d = (x + rw / 2.0 - cx) ** 2 + (y + rh / 2.0 - cy) ** 2
                if best is None or d < best[0]:
                    best = (d, x + m, y + m)
    if best is None:
        sys.exit('no empty %dx%d spot on this sheet; make the sticker smaller' % (args.w, args.h))
    print('x=%d y=%d' % (best[1], best[2]))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--light', type=float, default=235, help='brightness (0-255) at or above which a pixel is background')
    sub = ap.add_subparsers(dest='cmd', required=True)
    s = sub.add_parser('sheet')
    s.add_argument('image')
    s.add_argument('outdir')
    s.add_argument('--min-area', type=int, default=2000, help='smallest piece kept, in pixels')
    s.set_defaults(fn=cmd_sheet)
    o = sub.add_parser('one')
    o.add_argument('image')
    o.add_argument('out')
    o.add_argument('--min-area', type=int, default=500)
    o.add_argument('--max-side', type=int, default=0, help='scale down so the longer side is this many px')
    o.set_defaults(fn=cmd_one)
    t = sub.add_parser('slot')
    t.add_argument('base')
    t.add_argument('w', type=int)
    t.add_argument('h', type=int)
    t.add_argument('--avoid', action='append', metavar='X,Y,W,H', help='an existing sticker box; repeat for each')
    t.set_defaults(fn=cmd_slot)
    args = ap.parse_args()
    args.fn(args)


if __name__ == '__main__':
    main()
