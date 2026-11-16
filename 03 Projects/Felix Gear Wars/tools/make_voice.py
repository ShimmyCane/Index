#!/usr/bin/env python3
"""Record Felix Gear Wars' story cards with a narrator voice (Kokoro-82M, the same open model Adventure uses).

It runs on this computer: no account, no key, nothing is sent to a voice service.
Each level has three reading tiers (caption, short, story). Every tier is recorded, so the voice reads
exactly what the card shows. Output: audio/<level>.<tier>.mp3 and js/audio_manifest.js (what exists, how long).

Setup (once, outside the repo; the model files are not committed). The same steps as Adventure's tools/make_voice.py:
  python3 -m venv venv && . venv/bin/activate && pip install kokoro-onnx soundfile numpy
  npm pack kokoro-q8-shards kokoro-js && for f in *.tgz; do tar xzf $f --one-top-level; done
  cat kokoro-q8-shards-1.0.0/package/kokoro-q8.part*.bin > model_q8.onnx
  python3 -c "import glob,os,numpy as n; n.savez('voices.npz', **{os.path.basename(f)[:-4]:
      n.fromfile(f,dtype=n.float32).reshape(-1,1,256) for f in glob.glob('kokoro-js-1.2.1/package/voices/*.bin')})"
Run:
  python3 -I tools/make_voice.py --model <dir with model_q8.onnx and voices.npz> [--force] [--voice bm_fable] [--speed 0.92] [ids...]
Without ids every level and the free-for-all card are recorded. A clip is skipped when its text and voice are unchanged
(the text hash is kept in the manifest), unless --force.
"""
import argparse, datetime, hashlib, json, os, subprocess, tempfile
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SR = 24000
LEAD = 0.25
TIERS = [('cap', 'cap'), ('short', 'short'), ('story', 'story')]


def load_stories():
    js = ("require(process.argv[1]+'/js/data.js');const F=globalThis.FGW;const out={};"
          "F.STORIES.forEach((s,i)=>{out['c'+(Math.floor(i/3)+1)+'l'+(i%3+1)]=s;});out.free=F.freeConfig().story;"
          "process.stdout.write(JSON.stringify(out));")
    r = subprocess.run(['node', '-e', js, ROOT], capture_output=True, text=True, check=True)
    return json.loads(r.stdout)


def load_manifest():
    path = os.path.join(ROOT, 'js', 'audio_manifest.js')
    if not os.path.exists(path):
        return {}
    js = "global.window={};eval(require('fs').readFileSync(process.argv[1],'utf8'));process.stdout.write(JSON.stringify(window.FGW_AUDIO||{}));"
    r = subprocess.run(['node', '-e', js, path], capture_output=True, text=True)
    return json.loads(r.stdout) if r.returncode == 0 and r.stdout else {}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--model', required=True)
    ap.add_argument('--voice', default='bm_fable')
    ap.add_argument('--speed', type=float, default=0.92)
    ap.add_argument('--force', action='store_true')
    ap.add_argument('ids', nargs='*')
    a = ap.parse_args()
    from kokoro_onnx import Kokoro
    import soundfile as sf
    kokoro = Kokoro(os.path.join(a.model, 'model_q8.onnx'), os.path.join(a.model, 'voices.npz'))
    stories = load_stories()
    manifest = load_manifest()
    os.makedirs(os.path.join(ROOT, 'audio'), exist_ok=True)
    ids = a.ids or list(stories)
    for lid in ids:
        entry = manifest.get(lid, {})
        for tier, key in TIERS:
            text = stories[lid][key]
            h = hashlib.sha1((a.voice + str(a.speed) + text).encode()).hexdigest()[:10]
            rel = 'audio/%s.%s.mp3' % (lid, tier)
            out = os.path.join(ROOT, rel)
            if not a.force and entry.get(tier, {}).get('hash') == h and os.path.exists(out):
                continue
            audio, sr = kokoro.create(text, voice=a.voice, speed=a.speed, lang='en-us')
            audio = np.concatenate([np.zeros(int(SR * LEAD), dtype=np.float32), audio.astype(np.float32), np.zeros(int(SR * 0.2), dtype=np.float32)])
            fade = int(SR * 0.025); audio[:fade + int(SR * LEAD)] *= np.linspace(0, 1, fade + int(SR * LEAD))
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
                sf.write(tmp.name, audio, SR)
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp.name, '-ac', '1', '-b:a', '48k', out], check=True)
            os.unlink(tmp.name)
            entry[tier] = {'src': rel, 'duration': round(len(audio) / SR, 2), 'hash': h}
            print('recorded', rel, entry[tier]['duration'], 's')
        manifest[lid] = entry
    body = ('// Made by tools/make_voice.py (Kokoro %s, speed %s). Which story clips exist and how long they are.\n'
            'window.FGW_AUDIO = %s;\n') % (a.voice, a.speed, json.dumps(manifest, indent=1, sort_keys=True))
    with open(os.path.join(ROOT, 'js', 'audio_manifest.js'), 'w') as f:
        f.write(body)
    print('manifest written, made', datetime.date.today())


if __name__ == '__main__':
    main()
