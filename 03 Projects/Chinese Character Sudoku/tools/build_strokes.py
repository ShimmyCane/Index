"""Build assets/strokes.json: stroke outlines and stroke order for the recently learned characters
(lessonChars in assets/phrases.json), used by the 3.0 tracing game.

Data: hanzi-writer-data (Make Me a Hanzi, Arphic Public License; see assets/ARPHICPL.TXT).
Get it once:  npm pack hanzi-writer-data && tar xzf hanzi-writer-data-*.tgz
Run from the project folder:  python3 tools/build_strokes.py path/to/package
Add --all to include every character in the 字库 instead of only the recent ones.
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, '..', 'assets')


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if not args:
        sys.exit(__doc__)
    folder = args[0]
    pdata = json.load(open(os.path.join(ASSETS, 'phrases.json'), encoding='utf-8'))
    cdata = json.load(open(os.path.join(ASSETS, 'characters.json'), encoding='utf-8'))
    chars = ''.join(cdata['categories'].values()) if '--all' in sys.argv else pdata['lessonChars']
    out, missing = {}, []
    for c in dict.fromkeys(chars):
        path = os.path.join(folder, c + '.json')
        if not os.path.exists(path):
            missing.append(c)
            continue
        d = json.load(open(path, encoding='utf-8'))
        out[c] = {'strokes': d['strokes'], 'medians': d['medians'], 'radStrokes': d.get('radStrokes', [])}
    dest = os.path.join(ASSETS, 'strokes.json')
    with open(dest, 'w', encoding='utf-8') as f:
        f.write('{\n' + ',\n'.join(f'{json.dumps(k, ensure_ascii=False)}: {json.dumps(v, ensure_ascii=False, separators=(",", ":"))}' for k, v in out.items()) + '\n}\n')
    print(f'{len(out)} characters, {os.path.getsize(dest) / 1024:.0f} KB -> {os.path.relpath(dest)}')
    if missing:
        print('No stroke data for:', ''.join(missing))


if __name__ == '__main__':
    main()
