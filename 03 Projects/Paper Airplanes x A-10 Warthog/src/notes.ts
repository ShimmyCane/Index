// Notes for improvement. Saved on this device first (never sent anywhere by itself).
// Each note has a project and sub-project, a status (open, done or closed), a
// description, an identifier (N-0001 …), and a snapshot of identifiers taken when
// it was written. The identifier index says what each code means.
namespace PA {
  export const NOTES_PROJECT = 'Paper Airplanes x A-10 Warthog';
  const NOTES_KEY = 'pa_warthog.notes';

  export type NoteStatus = 'open' | 'done' | 'closed';
  export type NoteSort = 'time' | 'status' | 'sub';

  export interface Note {
    identifier: string;          // N-0001
    time: string;                // ISO time, when it was written
    project: string;
    sub: string;                 // sub-project: plane and view, e.g. "A-10 jet / chase"
    item: string;                // what was on screen
    status: NoteStatus;
    description: string;
    ids: { [code: string]: string | number };
  }

  // The identifier index: what each code in a note means. Values are stored with each note,
  // so this list can grow without changing old notes.
  export const INDEX: { code: string; name: string; meaning: string; unit: string }[] = [
    { code: 'HP', name: 'Health', meaning: 'Hull left, as a share of full', unit: '%' },
    { code: 'TIME', name: 'Time played', meaning: 'How long this flight has been going', unit: 'm:ss' },
    { code: 'ALT', name: 'Height', meaning: 'Height above the ground under the plane', unit: 'm' },
    { code: 'SPD', name: 'Speed', meaning: 'Airspeed in knots', unit: 'kt' },
    { code: 'AOA', name: 'Angle of attack', meaning: 'Nose angle against the flight path (over 15° stalls)', unit: '°' },
    { code: 'VIEW', name: 'Camera view', meaning: 'Chase, top-down or cockpit', unit: '' },
    { code: 'PLANE', name: 'Plane', meaning: 'A-10 jet or paper glider', unit: '' },
    { code: 'MISS', name: 'Missiles', meaning: 'Missiles in stock (of six)', unit: 'count' },
    { code: 'GUN', name: 'Gun aim', meaning: 'Straight, or how far down it points at a ground target', unit: '°' },
    { code: 'LEFT', name: 'Targets left', meaning: 'Ground targets still standing', unit: 'count' },
    { code: 'SCORE', name: 'Score', meaning: 'Points this flight', unit: 'pts' },
    { code: 'SAFE', name: 'Safe flight', meaning: 'Floor above the ground is on (1) or off (0)', unit: '' },
    { code: 'INV', name: 'Invincible', meaning: 'Hits do no harm (1) or they do (0)', unit: '' },
  ];

  // Memory copy, used when the device will not keep notes (and in the tests).
  let memory: Note[] | null = null;

  export function loadNotes(): Note[] {
    if (memory) return memoryCopy();
    try {
      const raw = localStorage.getItem(NOTES_KEY);
      return raw ? (JSON.parse(raw) as Note[]) : [];
    } catch (e) {
      return memoryCopy();
    }
  }

  function memoryCopy(): Note[] {
    return memory ? memory.slice() : [];
  }

  function saveNotes(list: Note[]): void {
    memory = list.slice();
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(list));
    } catch (e) {
      // Kept in memory for this visit only.
    }
  }

  export function nextIdentifier(list: Note[]): string {
    let top = 0;
    for (const n of list) {
      const m = /^N-(\d+)$/.exec(n.identifier);
      if (m) top = Math.max(top, +m[1]);
    }
    return 'N-' + String(top + 1).padStart(4, '0');
  }

  export function addNote(description: string, item: string, sub: string, ids: Note['ids'], when = new Date()): Note {
    const list = loadNotes();
    const note: Note = {
      identifier: nextIdentifier(list),
      time: when.toISOString(),
      project: NOTES_PROJECT,
      sub,
      item,
      status: 'open',
      description: description.trim(),
      ids,
    };
    list.push(note);
    saveNotes(list);
    return note;
  }

  export function setStatus(identifier: string, status: NoteStatus): void {
    const list = loadNotes();
    for (const n of list) if (n.identifier === identifier) n.status = status;
    saveNotes(list);
  }

  export function sortNotes(list: Note[], by: NoteSort): Note[] {
    const order: { [s: string]: number } = { open: 0, done: 1, closed: 2 };
    return list.slice().sort((a, b) => {
      if (by === 'status') return order[a.status] - order[b.status] || a.identifier.localeCompare(b.identifier);
      if (by === 'sub') return a.sub.localeCompare(b.sub) || a.identifier.localeCompare(b.identifier);
      return a.identifier.localeCompare(b.identifier);
    });
  }

  // The identifiers at this moment in the game. Each code is written with its value.
  export function snapshot(g: Game, settings: Settings): Note['ids'] {
    const p = g.plane;
    const secs = Math.floor(g.time);
    return {
      HP: Math.round(Math.max(0, g.hull)),
      TIME: Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0'),
      ALT: Math.round(p.h - groundAt(p.X, p.Z)),
      SPD: Math.round(p.speed * 1.94),
      AOA: Math.round((p.alpha * 180) / Math.PI),
      VIEW: settings.view,
      PLANE: settings.mode === 'glider' ? 'paper glider' : 'A-10 jet',
      MISS: g.missileStock,
      GUN: g.aim.mode === 'ground' ? Number(((Math.abs(g.aim.pitch) * 180) / Math.PI).toFixed(1)) : 0,
      LEFT: g.mission.targets.filter(t => t.alive).length,
      SCORE: g.score,
      SAFE: settings.safeFlight,
      INV: settings.invincible,
    };
  }

  export function subProject(settings: Settings): string {
    return (settings.mode === 'glider' ? 'paper glider' : 'A-10 jet') + ' / ' + settings.view;
  }

  export function statusCount(list: Note[]): { open: number; done: number; closed: number } {
    const c = { open: 0, done: 0, closed: 0 };
    for (const n of list) c[n.status]++;
    return c;
  }
}
