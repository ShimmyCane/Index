"""Build assets/fonts/wenkai-subset.woff2: a small LXGW WenKai (霞鹜文楷, a Kai-style calligraphy font)
holding only the characters this page shows (the weekly batches, plus the title and cheer text),
so it works offline and looks the same on every iPad.

Needs: pip install fonttools brotli
Get the font slices once:  npm pack lxgw-wenkai-webfont && tar xzf lxgw-wenkai-webfont-*.tgz
Run from the project folder:  python3 tools/build_font.py path/to/lxgw-wenkai-webfont/files
"""
import glob, json, logging, os, sys, tempfile
from fontTools import subset, merge
from fontTools.ttLib import TTFont

logging.getLogger('fontTools').setLevel(logging.ERROR)  # the font has Apple tables fonttools can't subset; harmless
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
OUT = os.path.join(ROOT, 'assets', 'fonts', 'wenkai-subset.woff2')
# Characters in the page itself that use the Kai font (title, tab, celebration text) plus punctuation.
UI_CHARS = '中文筆畫第課太棒了！寫完答案好下一個字'


def needed_chars():
    src = json.load(open(os.path.join(ROOT, 'data', 'batches.json'), encoding='utf-8'))
    chars = {i['ch'] for b in src['batches'] for i in b['items']}
    return sorted(chars | set(UI_CHARS))


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    folder = sys.argv[1]
    wanted = needed_chars()
    remaining = set(wanted)
    parts = []
    tmp = tempfile.mkdtemp()
    for path in sorted(glob.glob(os.path.join(folder, 'lxgwwenkai-regular-subset-*.woff2'))):
        font = TTFont(path)
        cmap = font.getBestCmap()
        here = [c for c in wanted if ord(c) in cmap]
        if not here:
            continue
        opts = subset.Options()
        opts.layout_features = []
        opts.notdef_outline = False
        opts.glyph_names = False
        opts.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14]
        sub = subset.Subsetter(opts)
        sub.populate(text=''.join(here))
        sub.subset(font)
        out = os.path.join(tmp, f'part{len(parts)}.ttf')
        font.flavor = None
        font.save(out)
        parts.append(out)
        remaining -= set(here)
    if not parts:
        sys.exit('No glyphs found. Is the folder the lxgw-wenkai-webfont "files" folder?')
    merged = merge.Merger().merge(parts)
    merged.flavor = 'woff2'
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    merged.save(OUT)
    print(f'{len(wanted) - len(remaining)} of {len(wanted)} characters, {os.path.getsize(OUT) / 1024:.0f} KB -> {os.path.relpath(OUT, ROOT)}')
    if remaining:
        print('Not in the font (falls back to the system font):', ''.join(sorted(remaining)))


if __name__ == '__main__':
    main()
