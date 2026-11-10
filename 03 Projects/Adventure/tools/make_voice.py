#!/usr/bin/env python3
"""Record Adventure's voiced chapters with a cast of Kokoro voices.

Borrowed from the Voice repo (ShimmyCane/Voice) tools/make_kokoro.py, simplified to English and
line-level timings. Kokoro-82M is an open voice model (Apache 2.0) that runs on
this computer: no account, no key for the voices, nothing is sent to a voice service.

Three modes:
  (default) [ids]  bundled chapters in story/<id>.js  → audio/<id>.cast.mp3 + story/<id>.audio.js
  --samples        voice candidates in story/voice_samples.js → audio/samples/<role>.<voice>[.<speed>].mp3
  --db [--force]   the storyteller's chapters in the Family database (published, with a script):
                   records each one whose recording is missing or out of date, uploads the MP3 to the
                   private bucket adv-audio, and saves its timings in adv_chapters.audio.
                   Chapters grow from the family's scenes, so their audio never goes into the repo.

Voices: each line is read in its speaker's voice (script.cast[who].voice) at the speaker's speed
(cast[who].speed, or the line's own speed). In --db mode the "Voices" setting entry (picked on
voices.html) overrides the cast, so a new storyteller voice re-records every chapter.

Database access (--db): in a Claude cloud session the network proxy signs requests to the Family
project. Elsewhere, set SUPABASE_SERVICE_KEY in the environment (never in a file in this repo).

Setup (once, outside the repo; the model files are not committed):
  python3 -m venv venv && . venv/bin/activate && pip install kokoro-onnx soundfile
  npm pack kokoro-q8-shards kokoro-js && for f in *.tgz; do tar xzf $f --one-top-level; done
  cat kokoro-q8-shards-1.0.0/package/kokoro-q8.part*.bin > model_q8.onnx
  python3 -c "import glob,os,numpy as n; n.savez('voices.npz', **{os.path.basename(f)[:-4]:
      n.fromfile(f,dtype=n.float32).reshape(-1,1,256) for f in glob.glob('kokoro-js-1.2.1/package/voices/*.bin')})"
Run:
  python3 -I tools/make_voice.py --model <dir with model_q8.onnx and voices.npz> [ids | --samples | --db]
"""
import argparse, datetime, glob, hashlib, json, os, re, subprocess, tempfile, urllib.parse, urllib.request
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SR = 24000
GAP = 0.55          # silence between lines (seconds)
LEAD = 0.3          # silence at the start
DEFAULT_SPEED = 0.92
SPARE_VOICES = ['bf_emma', 'am_michael', 'bf_lily', 'am_adam', 'af_bella', 'bm_daniel', 'af_sky', 'bm_lewis']
BUCKET = 'adv-audio'


# ------------------------------------------------------------------ files and baking
def load_js(pattern, var):
    files = sorted(f for f in glob.glob(os.path.join(ROOT, 'story', pattern)) if not f.endswith('.audio.js'))
    js = ("const fs=require('fs');global.window={};for(const f of JSON.parse(process.argv[1])){"
          "eval(fs.readFileSync(f,'utf8'));}process.stdout.write(JSON.stringify(window[process.argv[2]]||{}));")
    out = subprocess.run(['node', '-e', js, json.dumps(files), var], capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def cast_for(story, voices_setting=None):
    """Speaker → {voice, speed}: the script's cast, overridden by the Voices setting, with spare voices for gaps."""
    cast, spare = {}, iter(SPARE_VOICES)
    over = (voices_setting or {}).get('cast', {})
    for who in dict.fromkeys([*story.get('cast', {}), *(l['who'] for l in story['script'])]):
        c = dict(story.get('cast', {}).get(who, {}))
        c.update({k: v for k, v in over.get(who, {}).items() if k in ('voice', 'speed')})
        if not c.get('voice'):
            c['voice'] = 'bm_fable' if who == 'narrator' else next(spare, 'bf_emma')
        cast[who] = {'voice': c['voice'], 'speed': float(c.get('speed') or DEFAULT_SPEED)}
    return cast


def bake(lines, cast, kokoro, log=True):
    """Lines [{who, text, speed?}] → (float32 audio, [[start, end], ...])."""
    chunks, timings, t = [np.zeros(int(LEAD * SR), dtype=np.float32)], [], LEAD
    for i, line in enumerate(lines):
        c = cast[line['who']]
        audio, sr = kokoro.create(line['text'], voice=c['voice'], speed=float(line.get('speed') or c['speed']), lang='en-us')
        assert sr == SR
        dur = len(audio) / SR
        timings.append([round(t, 3), round(t + dur, 3)])
        chunks += [audio.astype(np.float32), np.zeros(int(GAP * SR), dtype=np.float32)]
        t += dur + GAP
        if log:
            print(f"  {i + 1}/{len(lines)} {line['who']:9s} {c['voice']:11s} {dur:5.1f}s", flush=True)
    return np.concatenate(chunks), timings


def mp3(wav, out_path):
    import soundfile as sf
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
        sf.write(tmp.name, wav, SR)
    try:
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp.name, '-ac', '1', '-b:a', '64k', out_path], check=True)
    finally:
        os.unlink(tmp.name)


def info(story, cast, wav, timings, **extra):
    return {**extra, 'service': 'Kokoro', 'voices': {k: v['voice'] for k, v in cast.items()},
            'speeds': {k: v['speed'] for k, v in cast.items()}, 'duration': round(len(wav) / SR, 2),
            'made': datetime.date.today().isoformat(), 'timing': 'per line; words estimated by length',
            'lines': timings, 'source': [l['text'] for l in story['script']]}


# ------------------------------------------------------------------ modes
def make_bundled(ids, kokoro):
    for story in load_js('*.js', 'ADV_SCRIPTS').values():
        if ids and story['id'] not in ids:
            continue
        cast = cast_for(story)
        wav, timings = bake(story['script'], cast, kokoro)
        rel = f"audio/{story['id']}.cast.mp3"
        mp3(wav, os.path.join(ROOT, rel))
        data = info(story, cast, wav, timings, src=rel)
        with open(os.path.join(ROOT, 'story', story['id'] + '.audio.js'), 'w', encoding='utf-8') as f:
            f.write('// Made by tools/make_voice.py. Do not edit by hand.\n'
                    'window.ADV_AUDIO = window.ADV_AUDIO || {};\n'
                    f"window.ADV_AUDIO[{json.dumps(story['id'])}] = {json.dumps(data, ensure_ascii=False)};\n")
        print(f"{story['id']}: {data['duration']}s → {rel}")


def sample_name(role, cand):
    speed = cand.get('speed')
    return f"{role['key']}.{cand['voice']}" + (f".{speed:g}" if speed else '') + '.mp3'


def make_samples(kokoro):
    os.makedirs(os.path.join(ROOT, 'audio', 'samples'), exist_ok=True)
    for role in load_js('voice_samples.js', 'ADV_VOICE_SAMPLES')['roles']:
        for cand in role['candidates']:
            cast = {role['key']: {'voice': cand['voice'], 'speed': cand.get('speed', role['speed'])}}
            wav, _ = bake([{'who': role['key'], 'text': role['text']}], cast, kokoro, log=False)
            name = sample_name(role, cand)
            mp3(wav, os.path.join(ROOT, 'audio', 'samples', name))
            print(f"  {name}  {len(wav) / SR:.1f}s", flush=True)


def project_url():
    cfg = open(os.path.join(ROOT, 'js', 'config.js')).read()
    return os.environ.get('SUPABASE_URL') or re.search(r"url:\s*'([^']+)'", cfg).group(1)


def api(method, path, body=None, ctype='application/json', headers=None):
    req = urllib.request.Request(project_url() + path, method=method, data=body)
    key = os.environ.get('SUPABASE_SERVICE_KEY')
    if key:
        req.add_header('apikey', key)
        req.add_header('Authorization', 'Bearer ' + key)
    if body is not None:
        req.add_header('Content-Type', ctype)
    for k, v in (headers or {}).items():
        req.add_header(k, v)
    with urllib.request.urlopen(req, timeout=60) as res:
        text = res.read().decode('utf-8') if 'json' in (res.headers.get('Content-Type') or '') else ''
        return json.loads(text) if text else None


def make_db(kokoro, force=False, dry=False):
    rows = api('GET', '/rest/v1/adv_entries?kind=eq.setting&title=eq.Voices&select=body')
    voices = {}
    if rows:
        try:
            voices = json.loads(rows[0]['body'])
        except ValueError:
            print('The Voices setting is not valid JSON; using the cast in each script.')
    q = urllib.parse.urlencode({'status': 'eq.published', 'script': 'not.is.null',
                                'select': 'id,book,number,title,script,audio', 'order': 'book,number'})
    for ch in api('GET', '/rest/v1/adv_chapters?' + q) or []:
        story = ch['script']
        if not story or not story.get('script'):
            continue
        cast = cast_for(story, voices)
        source = [l['text'] for l in story['script']]
        want = {k: v['voice'] for k, v in cast.items()}
        speeds = {k: v['speed'] for k, v in cast.items()}
        old = ch.get('audio') or {}
        label = f"Book {ch['book']} chapter {ch['number']}: {ch['title']}"
        if not force and old.get('source') == source and old.get('voices') == want and old.get('speeds') == speeds:
            print(f"{label}: up to date")
            continue
        if dry:
            print(f"{label}: would record ({len(source)} lines)")
            continue
        print(f"{label}: recording", flush=True)
        wav, timings = bake(story['script'], cast, kokoro)
        digest = hashlib.sha1(json.dumps([source, want, speeds]).encode()).hexdigest()[:10]
        path = f"b{ch['book']}c{ch['number']}-{digest}.mp3"
        with tempfile.TemporaryDirectory() as d:
            out = os.path.join(d, 'a.mp3')
            mp3(wav, out)
            api('POST', f'/storage/v1/object/{BUCKET}/{path}', open(out, 'rb').read(), 'audio/mpeg', {'x-upsert': 'true'})
        data = info(story, cast, wav, timings, path=path)
        api('PATCH', f"/rest/v1/adv_chapters?id=eq.{ch['id']}", json.dumps({'audio': data}).encode(),
            headers={'Prefer': 'return=minimal'})
        print(f"{label}: {data['duration']}s → {BUCKET}/{path}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--model', required=True, help='folder with model_q8.onnx and voices.npz')
    ap.add_argument('--samples', action='store_true', help='bake the voice test samples')
    ap.add_argument('--db', action='store_true', help="record the storyteller's chapters into the adv-audio bucket")
    ap.add_argument('--force', action='store_true', help='with --db: record even if up to date')
    ap.add_argument('--dry-run', action='store_true', help='with --db: only say what would be recorded')
    ap.add_argument('ids', nargs='*')
    a = ap.parse_args()
    from kokoro_onnx import Kokoro
    kokoro = Kokoro(os.path.join(a.model, 'model_q8.onnx'), os.path.join(a.model, 'voices.npz'))
    if a.samples:
        make_samples(kokoro)
    elif a.db:
        make_db(kokoro, a.force, a.dry_run)
    else:
        make_bundled(a.ids, kokoro)


if __name__ == '__main__':
    main()
