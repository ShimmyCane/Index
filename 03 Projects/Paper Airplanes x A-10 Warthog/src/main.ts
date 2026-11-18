// Boot: the page, the buttons, the keyboard, the settings drawer, and the frame loop.
namespace PA {
  const SETTINGS_KEY = 'pa_warthog.settings';
  const DEFAULTS: Settings = { mode: 'jet', size: 'full', sound: 1, forces: 0, showErrors: 0 };

  const $ = <T extends HTMLElement>(id: string): T => {
    const el = document.getElementById(id);
    if (!el) throw new Error('missing #' + id);
    return el as T;
  };

  const errors: string[] = [];

  function logError(message: string): void {
    errors.push(new Date().toLocaleTimeString() + '  ' + message);
    renderErrors();
  }

  function renderErrors(): void {
    const box = $('errorsPanel');
    box.hidden = !settings.showErrors;
    box.textContent = errors.length ? errors.join('\n') : 'No problems so far.';
  }

  function loadSettings(): Settings {
    try {
      return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
    } catch (e) {
      return { ...DEFAULTS };
    }
  }

  function saveSettings(): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      logError('Could not save settings on this device: ' + String(e));
    }
  }

  const settings: Settings = loadSettings();
  const sound = new Sound();
  sound.enabled = settings.sound === 1;
  let game: Game;

  function renderSettings(): void {
    document.querySelectorAll<HTMLElement>('.seg').forEach(seg => {
      const key = seg.dataset.key as keyof Settings;
      const v = String(settings[key]);
      seg.querySelectorAll<HTMLButtonElement>('button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
    });
    $<HTMLInputElement>('showErrors').checked = settings.showErrors === 1;
    document.body.classList.toggle('paper', settings.mode === 'paper');
    renderErrors();
  }

  function onSeg(key: keyof Settings, value: string): void {
    const restarts = key === 'mode' || key === 'size';
    if (key === 'mode' || key === 'size') {
      (settings as unknown as Record<string, unknown>)[key] = value;
    } else {
      settings[key] = +value;
    }
    if (key === 'sound') sound.enabled = settings.sound === 1;
    saveSettings();
    renderSettings();
    if (restarts) {
      game.settings = settings;
      newMission();
    }
  }

  function newMission(): void {
    game.settings = settings;
    game.onSound = name => sound.play(name);
    game.newMission(Math.floor(Math.random() * 100000));
    $('overlay').hidden = true;
  }

  // Keys and touch buttons both set the same held flags.
  const keyMap: { [code: string]: keyof Held } = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowRight: 'more', KeyD: 'more',
    ArrowLeft: 'less', KeyA: 'less',
    Space: 'fire', KeyF: 'fire',
  };

  function setHeld(k: keyof Held, on: boolean): void {
    if (on) sound.unlock();
    game.held[k] = on;
  }

  function bindInput(): void {
    window.addEventListener('keydown', e => {
      const k = keyMap[e.code];
      if (!k) return;
      e.preventDefault();
      setHeld(k, true);
    });
    window.addEventListener('keyup', e => {
      const k = keyMap[e.code];
      if (k) setHeld(k, false);
    });
    window.addEventListener('blur', () => {
      (Object.keys(game.held) as (keyof Held)[]).forEach(k => setHeld(k, false));
    });
    document.querySelectorAll<HTMLButtonElement>('.controls button').forEach(b => {
      const k = b.dataset.k as keyof Held;
      const press = (e: PointerEvent) => {
        e.preventDefault();
        b.setPointerCapture(e.pointerId);
        setHeld(k, true);
      };
      const release = () => setHeld(k, false);
      b.addEventListener('pointerdown', press);
      b.addEventListener('pointerup', release);
      b.addEventListener('pointercancel', release);
      b.addEventListener('lostpointercapture', release);
    });
  }

  function hud(): void {
    const g = game;
    const p = g.plane;
    $('score').textContent = String(g.score);
    $('kills').textContent = g.kills + ' / ' + g.mission.targets.length;
    $('ammo').textContent = g.mission.mode === 'jet' ? String(g.ammo) : '—';
    $('hoops').textContent = g.hoopsPassed + ' / ' + g.mission.hoops.length;
    $('hull').style.width = Math.max(0, g.hull) + '%';
    $('speed').textContent = Math.round(p.speed * 1.94) + ' kt';
    $('alt').textContent = Math.round(p.h - groundAt(p.x)) + ' m';
    $('aoa').textContent = (p.alpha * 180 / Math.PI).toFixed(0) + '°';
    $('stall').hidden = !p.stalled || g.phase !== 'flying';
  }

  function message(): string {
    const g = game;
    const p = g.plane;
    if (g.phase !== 'flying') return '';
    if (p.stalled) return 'Too steep! Nose down to get the air flowing again.';
    if (g.mission.mode === 'paper') {
      return p.vy < -1 ? 'Gliding down. Fly through the rings.' : 'Let the wings carry you.';
    }
    if (p.vy < -2 && p.h - groundAt(p.x) < 25) return 'Losing height: nose up or add power.';
    if (p.speed < 35) return 'Slow: add power (+) to keep the wings working.';
    return g.targetsLeft() > 0 ? 'Hold FIRE over the targets.' : '';
  }

  function overlay(): void {
    const g = game;
    const box = $('overlay');
    if (g.phase === 'flying') {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    let title = '', text = '';
    if (g.phase === 'crashed') {
      title = 'Crashed!';
      text = g.mission.mode === 'paper'
        ? 'The glider touched down.'
        : 'Try again: keep the speed up and the nose level.';
    } else if (g.phase === 'landed') {
      title = 'Landed!';
      text = 'Rings flown: ' + g.hoopsPassed + ' of ' + g.mission.hoops.length + '. Score ' + g.score + '.';
    } else if (g.phase === 'won') {
      title = 'Mission complete';
      text = '★'.repeat(g.stars) + '☆'.repeat(3 - g.stars) + '  Score ' + g.score + ', hull ' + Math.round(g.hull) + '%.';
    }
    $('ovTitle').textContent = title;
    $('ovText').textContent = text;
  }

  let last = 0;
  let hudTimer = 0;
  function frame(now: number): void {
    const dt = last ? (now - last) / 1000 : 0;
    last = now;
    try {
      game.update(dt);
      const scene = $<HTMLCanvasElement>('view');
      const ctx = scene.getContext('2d');
      if (ctx) render(ctx, game);
      sound.setThrottle(game.plane.throttle, game.phase === 'flying' && game.mission.mode === 'jet');
      hudTimer += dt;
      if (hudTimer > 0.1) {
        hudTimer = 0;
        hud();
        overlay();
        $('msg').textContent = message();
      }
    } catch (e) {
      logError('Frame: ' + String(e));
    }
    requestAnimationFrame(frame);
  }

  function boot(): void {
    game = new Game(settings);
    game.onSound = name => sound.play(name);
    renderSettings();

    window.addEventListener('error', e => logError(e.message));
    window.addEventListener('unhandledrejection', e => logError('Promise: ' + String(e.reason)));

    const gear = $('gear');
    const drawer = $('drawer');
    const setOpen = (open: boolean) => {
      drawer.hidden = !open;
      gear.setAttribute('aria-expanded', String(open));
    };
    gear.addEventListener('click', () => setOpen(drawer.hidden));
    $('closeDrawer').addEventListener('click', () => setOpen(false));

    document.querySelectorAll<HTMLButtonElement>('.seg button').forEach(b => {
      b.addEventListener('click', () => onSeg(b.parentElement!.dataset.key as keyof Settings, b.dataset.v || '0'));
    });
    $<HTMLInputElement>('showErrors').addEventListener('change', e => {
      settings.showErrors = (e.target as HTMLInputElement).checked ? 1 : 0;
      saveSettings();
      renderErrors();
    });
    $('restart').addEventListener('click', () => { newMission(); setOpen(false); });
    $('again').addEventListener('click', () => newMission());
    $('version').textContent = 'Version ' + VERSION;

    bindInput();
    renderErrors();
    requestAnimationFrame(frame);
  }

  // Only start the page in a browser (the flight test loads this file in Node).
  if (typeof document !== 'undefined') boot();
}
