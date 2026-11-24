#!/usr/bin/env python3
"""frames_to_gif: turn a folder of PNG frames into an animated GIF.

Usage:
  python3 frames_to_gif.py <frames_dir> <out.gif> [--scale 0.67] [--ms 80] [--colors 128] [--every 1] [--hold-last 6]

--scale      resize (0.67 keeps the file small enough to share)
--ms         milliseconds per frame
--every      keep every Nth frame (2 halves the length)
--colors     palette size (lower = smaller file)
--hold-last  extra copies of the last frame, so the end can be seen
Frames are sorted by name (f0000.png, f0001.png, ...). Run with a Python that has Pillow.
"""
import argparse, glob, os, sys
from PIL import Image

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('frames_dir'); ap.add_argument('out')
    ap.add_argument('--scale', type=float, default=0.67)
    ap.add_argument('--ms', type=int, default=80)
    ap.add_argument('--colors', type=int, default=128)
    ap.add_argument('--every', type=int, default=1)
    ap.add_argument('--hold-last', type=int, default=6)
    a = ap.parse_args()
    files = sorted(glob.glob(os.path.join(a.frames_dir, '*.png')))[::a.every]
    if not files:
        sys.exit('no frames in ' + a.frames_dir)
    frames = []
    for f in files:
        im = Image.open(f).convert('RGB')
        w, h = int(im.width * a.scale), int(im.height * a.scale)
        frames.append(im.resize((w, h), Image.LANCZOS).quantize(colors=a.colors))
    frames += [frames[-1]] * a.hold_last
    frames[0].save(a.out, save_all=True, append_images=frames[1:], duration=a.ms, loop=0, optimize=True)
    print(f'{len(frames)} frames, {os.path.getsize(a.out) // 1024} KB -> {a.out}')

if __name__ == '__main__':
    main()
