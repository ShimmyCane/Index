// Boot: the page, the controls (drag or joystick, action buttons), the fading
// settings gear, the HUD, the settings drawer, opt-in errors, and the frame loop.
namespace PA {
  const SETTINGS_KEY = 'pa_warthog.settings';
  const DEFAULTS: Settings = { mode: 'jet', control: 'drag', view: 'chase', sound: 1, forces: 0, showErrors: 0 };
  const VIEW_ORDER: View[] = ['chase', 'top', 'cockpit'];
  const TUTORIAL_KEY = 'pa_warthog.tutorialSeen';
  const DEAD = 0.06;          // a small dead zone around the centre
  const GEAR_SECONDS = 2000;  // the settings gear fades after this long untouched

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

  // Input sources. The one in use wins: drag, then joystick, then keys.
  const keys = { up: false, down: false, left: false, right: false };
  let dragAxes: Axes | null = null;
  let stickAxes: Axes | null = null;
  let dragId = -1;
  let stickId = -1;

  function applyBodyClasses(): void {
    document.body.classList.toggle('glider', settings.mode === 'glider');
    document.body.classList.toggle('jet', settings.mode === 'jet');
    document.body.classList.toggle('joy', settings.control === 'stick');
  }

  function renderSettings(): void {
    document.querySelectorAll<HTMLElement>('.seg').forEach(seg => {
      const key = seg.dataset.key as keyof Settings;
      const v = String(settings[key]);
      seg.querySelectorAll<HTMLButtonElement>('button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
    });
    $<HTMLInputElement>('showErrors').checked = settings.showErrors === 1;
    applyBodyClasses();
    renderErrors();
  }

  function onSeg(key: keyof Settings, value: string): void {
    if (key === 'mode' || key === 'control' || key === 'view') {
      (settings as unknown as Record<string, unknown>)[key] = value;
    } else {
      settings[key] = +value;
    }
    if (key === 'sound') sound.enabled = settings.sound === 1;
    saveSettings();
    renderSettings();
    if (key === 'mode') restart();
    if (key === 'control') {
      dragAxes = null;
      stickAxes = null;
      dragId = -1;
      stickId = -1;
    }
  }

  function restart(): void {
    game.settings = settings;
    game.newFlight(Math.floor(Math.random() * 100000));
    $('overlay').hidden = true;
  }

  // Capture can fail for a pointer the browser no longer tracks; that is not a reason to stop.
  function capture(el: HTMLElement, id: number): void {
    try {
      el.setPointerCapture(id);
    } catch (e) {
      // Ignored: the pointer still reaches the element through its events.
    }
  }

  // ---- Keys -------------------------------------------------------------

  const keyMap: { [code: string]: string } = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    Space: 'fire',
    ShiftLeft: 'boost', ShiftRight: 'boost',
    KeyM: 'missile',
    KeyV: 'view',
  };

  function bindKeys(): void {
    window.addEventListener('keydown', e => {
      const k = keyMap[e.code];
      if (!k) return;
      e.preventDefault();
      if (k === 'view') {
        cycleView();
      } else if (k === 'fire' || k === 'boost' || k === 'missile') {
        sound.unlock();
        game.held[k] = true;
      } else {
        keys[k as 'up' | 'down' | 'left' | 'right'] = true;
      }
    });
    window.addEventListener('keyup', e => {
      const k = keyMap[e.code];
      if (!k) return;
      if (k === 'fire' || k === 'boost' || k === 'missile') game.held[k] = false;
      else keys[k as 'up' | 'down' | 'left' | 'right'] = false;
    });
    window.addEventListener('blur', () => {
      keys.up = keys.down = keys.left = keys.right = false;
      game.held.fire = game.held.boost = game.held.missile = false;
      dragAxes = null;
      stickAxes = null;
    });
  }

  // The camera views in turn: chase, top-down, cockpit (also the V key).
  function cycleView(): void {
    const next = VIEW_ORDER[(VIEW_ORDER.indexOf(settings.view) + 1) % VIEW_ORDER.length];
    settings.view = next;
    saveSettings();
    renderSettings();
  }

  // ---- Drag relative to the centre of the screen ------------------------

  const IGNORE = '.actions, .stick, #gear, .gearHot, .drawer, .errorsPanel, .tutorial, button, input, label';

  function dz(v: number): number {
    if (Math.abs(v) < DEAD) return 0;
    return Math.sign(v) * (Math.abs(v) - DEAD) / (1 - DEAD);
  }

  function axesFromPoint(x: number, y: number): Axes {
    const nx = Math.max(-1, Math.min(1, (x - window.innerWidth / 2) / (window.innerWidth / 2)));
    const ny = Math.max(-1, Math.min(1, (y - window.innerHeight / 2) / (window.innerHeight / 2)));
    return { yaw: dz(nx), pitch: dz(-ny) };
  }

  function bindDrag(): void {
    const play = $('play');
    play.addEventListener('pointerdown', e => {
      if (settings.control !== 'drag') return;
      if ((e.target as Element).closest(IGNORE)) return;
      sound.unlock();
      dragId = e.pointerId;
      capture(play, e.pointerId);
      dragAxes = axesFromPoint(e.clientX, e.clientY);
    });
    play.addEventListener('pointermove', e => {
      if (e.pointerId === dragId) dragAxes = axesFromPoint(e.clientX, e.clientY);
    });
    const end = (e: PointerEvent) => {
      if (e.pointerId === dragId) {
        dragId = -1;
        dragAxes = null;
      }
    };
    play.addEventListener('pointerup', end);
    play.addEventListener('pointercancel', end);
  }

  // ---- Joystick (lower left) --------------------------------------------

  function bindStick(): void {
    const stick = $('stick');
    const knob = $('knob');
    const move = (e: PointerEvent) => {
      const r = stick.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const radius = r.width / 2;
      let dx = (e.clientX - cx) / radius, dy = (e.clientY - cy) / radius;
      const len = Math.hypot(dx, dy);
      if (len > 1) { dx /= len; dy /= len; }
      knob.style.transform = `translate(${dx * radius * 0.6}px, ${dy * radius * 0.6}px)`;
      stickAxes = { yaw: dz(dx), pitch: dz(-dy) };
    };
    stick.addEventListener('pointerdown', e => {
      sound.unlock();
      stickId = e.pointerId;
      capture(stick, e.pointerId);
      move(e);
    });
    stick.addEventListener('pointermove', e => {
      if (e.pointerId === stickId) move(e);
    });
    const end = (e: PointerEvent) => {
      if (e.pointerId !== stickId) return;
      stickId = -1;
      stickAxes = null;
      knob.style.transform = '';
    };
    stick.addEventListener('pointerup', end);
    stick.addEventListener('pointercancel', end);
  }

  // ---- Action buttons (lower right) -------------------------------------

  function bindActions(): void {
    document.querySelectorAll<HTMLButtonElement>('.actions button').forEach(b => {
      const k = b.dataset.k as 'fire' | 'boost' | 'missile';
      b.addEventListener('pointerdown', e => {
        e.preventDefault();
        sound.unlock();
        capture(b, e.pointerId);
        game.held[k] = true;
        wakeGear();
      });
      const release = () => { game.held[k] = false; };
      b.addEventListener('pointerup', release);
      b.addEventListener('pointercancel', release);
      b.addEventListener('lostpointercapture', release);
    });
  }

  // ---- Settings gear: fades in the jet view, after two seconds untouched ---

  let gearTimer = 0;

  function drawerOpen(): boolean {
    return !$('drawer').hidden;
  }

  function wakeGear(): void {
    const gear = $('gear');
    gear.classList.add('awake');
    window.clearTimeout(gearTimer);
    if (!drawerOpen()) {
      gearTimer = window.setTimeout(() => gear.classList.remove('awake'), GEAR_SECONDS);
    }
  }

  function bindGear(): void {
    const gear = $('gear');
    const drawer = $('drawer');
    const setOpen = (open: boolean) => {
      drawer.hidden = !open;
      gear.setAttribute('aria-expanded', String(open));
      if (open) {
        window.clearTimeout(gearTimer);
        gear.classList.add('awake');
      } else {
        wakeGear();
      }
    };
    gear.addEventListener('click', () => setOpen(drawer.hidden));
    $('closeDrawer').addEventListener('click', () => setOpen(false));
    $('gearHot').addEventListener('pointerdown', e => {
      e.preventDefault();
      wakeGear();
    });
    wakeGear();
  }

  // ---- HUD and messages -------------------------------------------------

  function hud(): void {
    const g = game;
    const p = g.plane;
    $('score').textContent = String(g.score);
    $('kills').textContent = String(g.kills);
    $('hoops').textContent = g.mission.hoops.length ? g.hoopsPassed + ' / ' + g.mission.hoops.length : '—';
    $('hull').style.width = Math.max(0, g.hull) + '%';
    $('missile').textContent = g.missileCool > 0 ? Math.ceil(g.missileCool) + 's' : 'ready';
    $('speed').textContent = Math.round(p.speed * 1.94) + ' kt';
    $('alt').textContent = Math.round(p.h - groundAt(p.X, p.Z)) + ' m';
    $('aoa').textContent = (p.alpha * 180 / Math.PI).toFixed(0) + '°';
    $('stall').hidden = !p.stalled || g.phase !== 'flying';
  }

  function message(): string {
    const g = game;
    const p = g.plane;
    if (g.phase === 'crashed') return 'Ejected! The parachute is open. Back in the air soon.';
    if (g.phase !== 'flying') return '';
    if (p.stalled) return 'Too steep! Ease the nose down to get the air flowing.';
    if (g.settings.mode === 'glider') return 'Fly through the rings.';
    if (p.vy < -2 && p.h - groundAt(p.X, p.Z) < 25) return 'Losing height: nose up or hold BOOST.';
    return 'Drag from the middle to steer. FIRE the gun, MISSILE for a target ahead.';
  }

  function overlay(): void {
    const g = game;
    const box = $('overlay');
    if (g.phase !== 'landed') {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    $('ovTitle').textContent = 'Landed!';
    $('ovText').textContent = 'Rings flown: ' + g.hoopsPassed + ' of ' + g.mission.hoops.length + '.';
  }

  // ---- First-run tutorial (shown once per device) -----------------------

  function tutorialSeen(): boolean {
    try {
      return localStorage.getItem(TUTORIAL_KEY) === '1';
    } catch (e) {
      return true;
    }
  }

  function showTutorial(): void {
    if (tutorialSeen()) return;
    const card = $('tutorial');
    card.hidden = false;
    card.addEventListener('pointerdown', () => {
      card.hidden = true;
      try {
        localStorage.setItem(TUTORIAL_KEY, '1');
      } catch (e) {
        // Not saved on this device: it may show again next time, which is fine.
      }
    }, { once: true });
  }

  // ---- Frame loop -------------------------------------------------------

  function resolveAxes(): Axes {
    if (dragAxes) return dragAxes;
    if (stickAxes) return stickAxes;
    const yaw = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    const pitch = (keys.up ? 1 : 0) - (keys.down ? 1 : 0);
    return { yaw, pitch };
  }

  let last = 0;
  let hudTimer = 0;
  function frame(now: number): void {
    const dt = last ? (now - last) / 1000 : 0;
    last = now;
    try {
      game.axes = resolveAxes();
      game.update(dt);
      const ctx = $<HTMLCanvasElement>('view').getContext('2d');
      if (ctx) render(ctx, game);
      sound.setThrottle(game.plane.throttle, game.phase === 'flying' && game.settings.mode === 'jet');
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
    game.settings = settings;
    game.onSound = name => sound.play(name);
    renderSettings();

    window.addEventListener('error', e => logError(e.message));
    window.addEventListener('unhandledrejection', e => logError('Promise: ' + String(e.reason)));

    document.querySelectorAll<HTMLButtonElement>('.seg button').forEach(b => {
      b.addEventListener('click', () => onSeg(b.parentElement!.dataset.key as keyof Settings, b.dataset.v || '0'));
    });
    $<HTMLInputElement>('showErrors').addEventListener('change', e => {
      settings.showErrors = (e.target as HTMLInputElement).checked ? 1 : 0;
      saveSettings();
      renderErrors();
    });
    $('restart').addEventListener('click', () => { restart(); $('drawer').hidden = true; });
    $('again').addEventListener('click', () => restart());
    $('version').textContent = 'Version ' + VERSION;

    bindKeys();
    showTutorial();
    bindDrag();
    bindStick();
    bindActions();
    bindGear();
    renderErrors();
    requestAnimationFrame(frame);
  }

  // Only start the page in a browser (the flight test loads this file in Node).
  if (typeof document !== 'undefined') boot();
}
