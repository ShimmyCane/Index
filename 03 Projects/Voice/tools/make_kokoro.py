#!/usr/bin/env python3
"""Make Kokoro narration (MP3 + word timings) for Voice stories.

Kokoro-82M is an open voice model (Apache 2.0). It runs on this computer:
no account, no key, nothing is sent anywhere.

Script stories (story.script + story.cast): the voice 'cast' reads each line in its
speaker's voice at the line's speed; any other voice reads every line itself.

Output, per story and voice:
  audio/<id>.<voice>.mp3          the narration
  stories/<id>.audio.js           word timings for every voice of that story
                                  (window.VOICE_AUDIO[id][trackKey] = {...})

Word timings are estimated: each phrase (up to a comma or full stop) is made
separately, so phrase starts are exact; words inside a phrase share its length
by how many sounds they have.

Setup (once, outside the repo; the model files are not committed):
  python3 -m venv venv && . venv/bin/activate
  pip install kokoro-onnx "misaki[zh]" soundfile
  npm pack kokoro-q8-shards kokoro-js      # model weights + voices from npm
  cat kokoro-q8.part{0..5}.bin > model_q8.onnx
  (voices.npz is built from kokoro-js/voices/*.bin, see build_voices())
Run:
  python3 -I tools/make_kokoro.py --model <dir with model_q8.onnx> [story ids]
"""
import argparse, glob, json, os, re, subprocess, sys, datetime
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SR = 24000
PAUSE = {'comma': 0.18, 'sentence': 0.45, 'para': 0.9}
SENT_END = '.!?。！？'
PHRASE_END = SENT_END + ',;:，；：、'
CLOSERS = '"\'”’」）)'
OPENERS = '"“‘「（('
ZH_PUNCT = {'，': ',', '。': '.', '！': '!', '？': '?', '；': ';', '：': ':', '、': ',',
            '“': '"', '”': '"', '‘': "'", '’': "'", '（': '(', '）': ')'}


def load_stories():
    """Read stories/*.js with node (they are plain scripts that push to window.VOICE_STORIES)."""
    files = sorted(f for f in glob.glob(os.path.join(ROOT, 'stories', '*.js')) if not f.endswith('.audio.js'))
    js = ("const fs=require('fs');global.window={};for(const f of JSON.parse(process.argv[1])){"
          "eval(fs.readFileSync(f,'utf8'));}process.stdout.write(JSON.stringify(window.VOICE_STORIES));")
    out = subprocess.run(['node', '-e', js, json.dumps(files)], capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def tokenize(par, lang):
    """Split a paragraph into display tokens. The page shows exactly these tokens."""
    if lang != 'zh':
        return par.split()
    import jieba
    raw = [w for w in jieba.cut(par) if w.strip()]
    toks, carry = [], ''
    for w in raw:
        if all(c in OPENERS for c in w):
            carry += w
        elif all(not c.isalnum() for c in w) and toks:
            toks[-1] += w
        else:
            toks.append(carry + w)
            carry = ''
    if carry:
        toks.append(carry)
    return toks


def ends(tok, chars):
    t = tok.rstrip(CLOSERS)
    return bool(t) and t[-1] in chars


def phrases(tokens):
    cur = []
    for i, t in enumerate(tokens):
        cur.append(i)
        if ends(t, PHRASE_END) or i == len(tokens) - 1:
            yield cur
            cur = []


def trim(a, thr=0.008):
    idx = np.where(np.abs(a) > thr)[0]
    if len(idx) == 0:
        return a
    s = max(0, idx[0] - int(0.02 * SR))
    e = min(len(a), idx[-1] + int(0.06 * SR))
    return a[s:e]


def build_voices(js_voice_dir, out):
    v = {os.path.basename(f)[:-4]: np.fromfile(f, dtype=np.float32).reshape(-1, 1, 256)
         for f in glob.glob(os.path.join(js_voice_dir, '*.bin'))}
    np.savez(out, **v)


def line_voice(story, p, voice):
    """Voice and speed for paragraph p. voice 'cast' = each script line in its speaker's voice."""
    line = (story.get('script') or [{}] * len(story['paragraphs']))[p]
    if voice == 'cast':
        return story['cast'][line['who']]['voice'], line.get('speed', 0.92)
    return voice, (0.9 if story['lang'] == 'zh' else 0.92)


def make(story, voice, kokoro, g2p_zh):
    lang = story['lang']
    words_out, chunks, t = [], [], 0.0
    for p, par in enumerate(story['paragraphs']):
        v, speed = line_voice(story, p, voice)
        toks = tokenize(par, lang)
        row = [[w, 0, 0] for w in toks]
        for ph in phrases(toks):
            text = (''.join if lang == 'zh' else ' '.join)(toks[i] for i in ph)
            if lang == 'zh':
                pho = g2p_zh(text)
                pho = pho[0] if isinstance(pho, tuple) else pho
                pho = ''.join(ZH_PUNCT.get(c, c) for c in pho)
                audio, _ = kokoro.create(pho, voice=v, is_phonemes=True, speed=speed)
                weights = [max(1, sum(1 for c in toks[i] if '一' <= c <= '鿿')) for i in ph]
            else:
                audio, _ = kokoro.create(text, voice=v, speed=speed, lang='en-us' if v[0] == 'a' else 'en-gb')
                weights = [max(1, len(re.sub(r'[^A-Za-z]', '', toks[i]))) + 1 for i in ph]
            audio = trim(np.asarray(audio, dtype=np.float32))
            d = len(audio) / SR
            tot, acc = float(sum(weights)), 0.0
            for i, w in zip(ph, weights):
                row[i][1] = round(t + d * acc / tot, 3)
                acc += w
                row[i][2] = round(t + d * acc / tot, 3)
            chunks.append(audio)
            t += d
            last = toks[ph[-1]]
            gap = PAUSE['para'] if ph[-1] == len(toks) - 1 else PAUSE['sentence'] if ends(last, SENT_END) else PAUSE['comma']
            chunks.append(np.zeros(int(gap * SR), dtype=np.float32))
            t += gap
        words_out.append(row)
    return np.concatenate(chunks), words_out, round(t, 2)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--model', required=True, help='folder with model_q8.onnx and voices.npz')
    ap.add_argument('ids', nargs='*')
    a = ap.parse_args()
    from kokoro_onnx import Kokoro
    import soundfile as sf
    kokoro = Kokoro(os.path.join(a.model, 'model_q8.onnx'), os.path.join(a.model, 'voices.npz'))
    g2p_zh = None
    for story in load_stories():
        if story.get('script'):
            story['paragraphs'] = [line['text'] for line in story['script']]
        if a.ids and story['id'] not in a.ids:
            continue
        if story['lang'] == 'zh' and g2p_zh is None:
            from misaki import zh
            g2p_zh = zh.ZHG2P()
        tracks = {}
        for voice in story.get('kokoroVoices', []):
            audio, words, dur = make(story, voice, kokoro, g2p_zh)
            wav = os.path.join(a.model, f"{story['id']}.{voice}.wav")
            mp3 = f"audio/{story['id']}.{voice}.mp3"
            sf.write(wav, audio, SR)
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-ac', '1', '-c:a', 'libmp3lame',
                            '-b:a', '64k', os.path.join(ROOT, mp3)], check=True)
            tracks['kokoro:' + voice] = {
                'service': 'Kokoro', 'voice': voice,
                'cast': {k: c['voice'] for k, c in story.get('cast', {}).items()} if voice == 'cast' else None, 'src': mp3, 'duration': dur,
                'made': datetime.date.today().isoformat(), 'timing': 'estimated per phrase',
                'source': story['paragraphs'], 'words': words}
            print(f"{story['id']} {voice}: {dur}s -> {mp3}")
        path = os.path.join(ROOT, 'stories', f"{story['id']}.audio.js")
        with open(path, 'w', encoding='utf-8') as f:
            f.write('// Made by tools/make_kokoro.py. Do not edit by hand.\n')
            f.write('window.VOICE_AUDIO = window.VOICE_AUDIO || {};\n')
            f.write(f"window.VOICE_AUDIO[{json.dumps(story['id'])}] = ")
            f.write(json.dumps(tracks, ensure_ascii=False, separators=(',', ':')))
            f.write(';\n')


if __name__ == '__main__':
    main()
