"""Fill in pinyin and traditional forms in assets/characters.json, and check assets/phrases.json.

Optional helper; the game runs without it. Needs: pip install pypinyin opencc-python-reimplemented
Run from the project folder: python3 tools/build_data.py
"""
import json, os, re
from pypinyin import pinyin
import opencc

HERE = os.path.dirname(os.path.abspath(__file__))
CHARS = os.path.join(HERE, '..', 'assets', 'characters.json')
PHRASES = os.path.join(HERE, '..', 'assets', 'phrases.json')
# Default reading for characters with several, picked for young readers.
DEFAULT_READINGS = {'长': 'cháng', '干': 'gān', '只': 'zhī', '种': 'zhǒng', '还': 'hái', '乐': 'lè'}
# Fixes for words the converters get wrong.
WORD_FIX = {'两只': ['liǎng zhī', '兩隻'], '肚子': ['dù zi', '肚子'], '刚才': ['gāng cái', '剛才']}
HAN = re.compile(r'^[一-鿿]{2}$')


def dump(data, path):
    # One entry per line (lists: 20 words per line), so the files stay easy to edit by hand.
    j = lambda v: json.dumps(v, ensure_ascii=False)
    def val(v):
        if isinstance(v, list):
            rows = [', '.join(j(w) for w in v[i:i + 20]) for i in range(0, len(v), 20)]
            return '[\n  ' + ',\n  '.join(rows) + '\n ]'
        if isinstance(v, dict):
            return '{\n  ' + ',\n  '.join(f'{j(k)}: {j(x)}' for k, x in v.items()) + '\n }'
        return j(v)
    body = ',\n'.join(f' {j(k)}: {val(v)}' for k, v in data.items())
    open(path, 'w', encoding='utf-8').write('{\n' + body + '\n}\n')


def main():
    s2t = opencc.OpenCC('s2tw')
    cdata = json.load(open(CHARS, encoding='utf-8'))
    pdata = json.load(open(PHRASES, encoding='utf-8'))

    # Phrases: keep two-character words with two different characters, drop duplicates.
    seen, clean, bad = set(), [], []
    for w in pdata['phrases']:
        if not HAN.match(w) or w[0] == w[1]:
            bad.append(w)
        elif w not in seen:
            seen.add(w)
            clean.append(w)
    pdata['phrases'] = clean
    for w in pdata['lesson']:
        if w not in seen and HAN.match(w):
            clean.append(w)
            seen.add(w)

    # Every character used anywhere gets a pinyin + traditional entry.
    all_chars = ''.join(cdata['categories'].values()) + ''.join(clean)
    missing = sorted({c for w in clean for c in w} - set(''.join(cdata['categories'].values())))
    if missing:
        cdata['categories']['其他'] = cdata['categories'].get('其他', '') + ''.join(missing)
    # Keep earlier hand fixes, but drop characters that are no longer in the bank.
    chars = {c: v for c, v in cdata.get('chars', {}).items() if c in set(all_chars)}
    for c in dict.fromkeys(all_chars):
        if c not in chars:
            chars[c] = [pinyin(c)[0][0], s2t.convert(c)]
    for c, py in DEFAULT_READINGS.items():
        if c in chars:
            chars[c][0] = py
    cdata['chars'] = chars

    # Words where a character reads or is written differently from its default (还书 huán, 头发 髮).
    words = {}
    for w in clean:
        if not all(c in chars for c in w):
            continue
        py = ' '.join(p[0] for p in pinyin(w))
        tc = s2t.convert(w)
        if py != ' '.join(chars[c][0] for c in w) or tc != ''.join(chars[c][1] for c in w):
            words[w] = [py, tc]
    words.update({w: v for w, v in WORD_FIX.items() if w in seen})
    cdata['words'] = words

    dump(cdata, CHARS)
    dump(pdata, PHRASES)
    print(f'{len(chars)} characters, {len(words)} word readings, {len(clean)} phrases, {len(pdata["lesson"])} lesson words')
    if bad:
        print('Skipped (not two different Chinese characters):', ' '.join(bad))
    if missing:
        print('Added to category 其他 (not in the three photos):', ''.join(missing))


if __name__ == '__main__':
    main()
