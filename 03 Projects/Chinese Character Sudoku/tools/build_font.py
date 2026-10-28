"""Build assets/fonts/wenkai-subset.woff2: a small LXGW WenKai (霞鹜文楷, a Kai-style calligraphy font)
holding only the characters the game uses, so it works offline and looks the same on every iPad.

Needs: pip install fonttools brotli
Get the font slices once:  npm pack lxgw-wenkai-webfont && tar xzf lxgw-wenkai-webfont-*.tgz
Run from the project folder:  python3 tools/build_font.py path/to/package/files
Extra characters can be passed after the folder, e.g.  python3 tools/build_font.py path/to/files 汉字
"""
import glob, json, logging, os, sys, tempfile
from fontTools import subset, merge
from fontTools.ttLib import TTFont

logging.getLogger('fontTools').setLevel(logging.ERROR)  # the font has Apple tables fonttools can't subset; harmless
HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, '..', 'assets')
OUT = os.path.join(ASSETS, 'fonts', 'wenkai-subset.woff2')
# Characters in the page itself that use the Kai font (title, celebration text) plus punctuation.
UI_CHARS = '汉字数独太棒了！描红笔顺'


def needed_chars(extra):
    cdata = json.load(open(os.path.join(ASSETS, 'characters.json'), encoding='utf-8'))
    pdata = json.load(open(os.path.join(ASSETS, 'phrases.json'), encoding='utf-8'))
    chars = set(''.join(cdata['categories'].values())) | set(''.join(pdata['phrases']))
    chars |= {t for _, t in cdata['chars'].values() for t in t}          # traditional forms
    chars |= {c for _, t in cdata.get('words', {}).values() for c in t}   # word-specific traditional forms
    chars |= set(UI_CHARS) | set(extra)
    return sorted(chars)


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    folder, extra = sys.argv[1], ''.join(sys.argv[2:])
    wanted = needed_chars(extra)
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
    print(f'{len(wanted) - len(remaining)} of {len(wanted)} characters, {os.path.getsize(OUT) / 1024:.0f} KB -> {os.path.relpath(OUT)}')
    if remaining:
        print('Not in the font (falls back to the system font):', ''.join(sorted(remaining)))


if __name__ == '__main__':
    main()
