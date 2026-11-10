/* Voice — Kokoro live worker. Runs the voice model off the page's main thread,
   so the page stays responsive while the model loads and speaks.
   Messages in:  {type:'load', id, device}  {type:'generate', id, text, voice, speed}
   Messages out: {type:'progress', loaded, total, file}  {type:'done', id, audio, rate}  {type:'error', id, message} */
import { KokoroTTS } from '../lib/kokoro.web.js';

const MODEL = 'onnx-community/Kokoro-82M-v1.0-ONNX';
let tts = null, device = '';

self.onmessage = async (e) => {
  const m = e.data;
  try {
    if (m.type === 'load') {
      if (!tts || device !== m.device) {
        device = m.device;
        tts = await KokoroTTS.from_pretrained(MODEL, {
          dtype: m.device === 'webgpu' ? 'fp32' : 'q8',
          device: m.device,
          progress_callback: (p) => {
            if (p.status === 'progress' && p.total) self.postMessage({ type: 'progress', file: p.file, loaded: p.loaded, total: p.total });
          }
        });
      }
      self.postMessage({ type: 'done', id: m.id });
    } else if (m.type === 'generate') {
      const raw = await tts.generate(m.text, { voice: m.voice, speed: m.speed || 1 });
      const audio = raw.audio;
      self.postMessage({ type: 'done', id: m.id, audio, rate: raw.sampling_rate }, [audio.buffer]);
    }
  } catch (err) {
    self.postMessage({ type: 'error', id: m.id, message: (err && err.message) || String(err) });
  }
};
