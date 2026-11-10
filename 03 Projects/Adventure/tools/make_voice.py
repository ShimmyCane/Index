#!/usr/bin/env python3
"""Make the recorded cast narration for Adventure's voiced chapters (story/<id>.js).

Borrowed from 03 Projects/Voice/tools/make_kokoro.py, simplified to English and
line-level timings. Kokoro-82M is an open voice model (Apache 2.0) that runs on
this computer: no account, no key, nothing is sent anywhere.

Each script line is read in its speaker's Kokoro voice (cast[who].voice) at the
line's speed. Output:
  audio/<id>.cast.mp3        the narration
  story/<id>.audio.js        window.ADV_AUDIO[id] = { src, duration, lines: [[start, end]], source: [texts] }
The page highlights words inside a line by their length, and uses the iPad voice
if `source` no longer matches the script text.

Setup (once, outside the repo; the model files are not committed):
  python3 -m venv venv && . venv/bin/activate && pip install kokoro-onnx soundfile
  npm pack kokoro-q8-shards kokoro-js && for f in *.tgz; do tar xzf $f --one-top-level; done
  cat kokoro-q8-shards-1.0.0/package/kokoro-q8.part*.bin > model_q8.onnx
  voices.npz: python3 -c "import glob,os,numpy as n; n.savez('voices.npz', **{os.path.basename(f)[:-4]:
      n.fromfile(f,dtype=n.float32).reshape(-1,1,256) for f in glob.glob('kokoro-js-1.2.1/package/voices/*.bin')})"
Run:
  python3 -I tools/make_voice.py --model <dir with model_q8.onnx and voices.npz> [ids]
"""
import argparse, datetime, glob, json, os, subprocess, tempfile
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SR = 24000
GAP = 0.55          # silence between lines (seconds)
LEAD = 0.3          # silence at the start


def load_scripts():
    files = sorted(f for f in glob.glob(os.path.join(ROOT, 'story', '*.js')) if not f.endswith('.audio.js'))
    js = ("const fs=require('fs');global.window={};for(const f of JSON.parse(process.argv[1])){"
          "eval(fs.readFileSync(f,'utf8'));}process.stdout.write(JSON.stringify(Object.values(window.ADV_SCRIPTS||{})));")
    out = subprocess.run(['node', '-e', js, json.dumps(files)], capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def make(story, kokoro):
    chunks, lines, t = [np.zeros(int(LEAD * SR), dtype=np.float32)], [], LEAD
    for i, line in enumerate(story['script']):
        voice = story['cast'][line['who']]['voice']
        audio, sr = kokoro.create(line['text'], voice=voice, speed=line.get('speed', 0.92), lang='en-us')
        assert sr == SR
        dur = len(audio) / SR
        lines.append([round(t, 3), round(t + dur, 3)])
        chunks += [audio.astype(np.float32), np.zeros(int(GAP * SR), dtype=np.float32)]
        t += dur + GAP
        print(f"  {i + 1}/{len(story['script'])} {line['who']:9s} {dur:5.1f}s", flush=True)
    wav = np.concatenate(chunks)
    rel = f"audio/{story['id']}.cast.mp3"
    import soundfile as sf
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
        sf.write(tmp.name, wav, SR)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp.name, '-ac', '1', '-b:a', '64k',
                        os.path.join(ROOT, rel)], check=True)
        os.unlink(tmp.name)
    data = {'src': rel, 'service': 'Kokoro', 'voices': {k: v['voice'] for k, v in story['cast'].items()},
            'duration': round(len(wav) / SR, 2), 'made': datetime.date.today().isoformat(),
            'timing': 'per line; words estimated by length', 'lines': lines,
            'source': [l['text'] for l in story['script']]}
    with open(os.path.join(ROOT, 'story', story['id'] + '.audio.js'), 'w', encoding='utf-8') as f:
        f.write('// Made by tools/make_voice.py. Do not edit by hand.\n'
                'window.ADV_AUDIO = window.ADV_AUDIO || {};\n'
                f"window.ADV_AUDIO[{json.dumps(story['id'])}] = {json.dumps(data, ensure_ascii=False)};\n")
    print(f"{story['id']}: {data['duration']}s → {rel}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--model', required=True, help='folder with model_q8.onnx and voices.npz')
    ap.add_argument('ids', nargs='*')
    a = ap.parse_args()
    from kokoro_onnx import Kokoro
    kokoro = Kokoro(os.path.join(a.model, 'model_q8.onnx'), os.path.join(a.model, 'voices.npz'))
    for story in load_scripts():
        if not a.ids or story['id'] in a.ids:
            make(story, kokoro)


if __name__ == '__main__':
    main()
