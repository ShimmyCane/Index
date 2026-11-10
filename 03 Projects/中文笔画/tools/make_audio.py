#!/usr/bin/env python3
"""Record each character in data/batches.json with Kokoro, ahead of time: audio/u<hex>.mp3.

Kokoro-82M (Apache 2.0) runs on this computer: no account, no key, nothing is sent anywhere.
Same approach as 03 Projects/Voice/tools/make_kokoro.py. Voice: zf_xiaoxiao (Mandarin female).

Setup (once, outside the repo; the model files are not committed):
  python3 -m venv venv && . venv/bin/activate
  pip install kokoro-onnx "misaki[zh]" soundfile
  Download from the kokoro-onnx GitHub release "model-files-v1.0":
    kokoro-v1.0.onnx and voices-v1.0.bin, into one folder
  ffmpeg on the PATH (converts WAV to MP3)
Run from the project folder:
  python3 -I tools/make_audio.py path/to/model_folder
A character's file name is its code point, so 黃 is audio/u9ec3.mp3. The page plays this file
when it exists and falls back to the iPad voice when it does not.
"""
import json, os, subprocess, sys, tempfile

import soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
VOICE = 'zf_xiaoxiao'
SPEED = 0.8   # slower than normal, for children


def characters():
    src = json.load(open(os.path.join(ROOT, 'data', 'batches.json'), encoding='utf-8'))
    return list(dict.fromkeys(i['ch'] for b in src['batches'] for i in b['items']))


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    folder = sys.argv[1]
    k = Kokoro(os.path.join(folder, 'kokoro-v1.0.onnx'), os.path.join(folder, 'voices-v1.0.bin'))
    out_dir = os.path.join(ROOT, 'audio')
    os.makedirs(out_dir, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        for ch in characters():
            samples, rate = k.create(ch, voice=VOICE, speed=SPEED, lang='cmn')
            wav = os.path.join(tmp, 'a.wav')
            sf.write(wav, samples, rate)
            mp3 = os.path.join(out_dir, f'u{ord(ch):x}.mp3')
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', '64k', mp3], check=True)
            print(f'{ch} -> {os.path.relpath(mp3, ROOT)} ({len(samples) / rate:.2f} s)')


if __name__ == '__main__':
    main()
