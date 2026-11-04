# Settings Gear (⚙️)

Purpose
One consistent ⚙️ button and drawer for every kids' iPad app and nursery web app. It holds the options, the opt-in error panel, the database check and any page links, so the main play area stays clean. Compiled from the ⚙️ work in Adventure, Felix Maze, Make 3D and Chinese Character Sudoku. Use it with `ipad_website.md` (layout and look) and `supabase_project.md` (database rules).

When to use
- Any app that has options, modes, or a secret or secondary control.
- Any app that talks to a database or loads remote data (adds the status pill and database check).
- Any app that prints (the ⚙️ must not print).

---

## 1. The button

- Fixed in the lower right: `right: 18px; bottom: calc(18px + env(safe-area-inset-bottom))`.
- Round, 64–68 px, large emoji `⚙️`, `aria-label="Settings"`, `aria-expanded`, `aria-controls` pointing to the drawer.
- Put a second floating control in the lower left (Chinese Character Sudoku's "▶ 笔顺" button), never a third. Give the two corners the same bottom offset.
- Reserve bottom padding in the footer or content so the gear never covers a status chip or the last control (Make 3D lost its model-check chip under the gear until the footer had room).
- Hide the gear and drawer in print: `@media print { .gear, .drawer, .errors { display: none !important; } }`. Felix Maze's answer key sits in ⚙️ and must not print.
- Add `[hidden] { display: none !important; }`. A `display:flex` rule otherwise overrides the `hidden` attribute.

## 2. The drawer

- Closed by default. Opens above the gear as a card (`bottom: 100px; width: min(360px, 92vw); max-height: 70vh; overflow-y: auto`).
- For many settings (about ten or more), use a full-height side sheet instead (Chinese Character Sudoku: `right:0; top:0; bottom:0; width:min(420px,100vw)`).
- Include a close button (✖, 48 px or more) in the header.
- Every control is 48 px high or more. Labels are plain words, with a short sub-hint where the choice needs one ("放对马上变绿", "关：看不到淡淡的字").
- Order, top to bottom. Leave out any section the app doesn't need:
  1. **Mode or game switch.** Links with hash routes (`#v1`, `#v2`, `#v3`) so a mode can be bookmarked. Remember the last choice.
  2. **Options.** Segmented buttons (see §3). Rows that belong to one mode are hidden with `data-games="grid lines"`.
  3. **Pages.** Links to the app's other pages, leaving out the current page (Adventure: Story / World / Under the hood / All projects).
  4. **Database.** Status line, Sign in (only when signed out), Sync, Check database, Sign out.
  5. **Show errors** checkbox (always last among the controls).
  6. **Version log.** Its own collapsible panel, closed by default, always last. See section 9.
- Anything hidden from the screen must stay reachable here. Never remove a feature just to save space (`ipad_website.md`).
- Say which settings restart the current item. Changing a setting that changes what is shown (for example, the tracing guide) starts that character again. Say so in the row's hint.

## 3. Options as segmented buttons

- One settings object, saved to localStorage in a try/catch. Each `.seg` has a `data-key`, and each button has a `data-v`.
- Render the drawer from that object after every change (`renderSettings()`). Don't keep a second copy of the state in the DOM.
- Store booleans as `0`/`1` in the buttons so the same code handles them all.
- A saved value from an older version may not match a new option. Fall back to the default for any key that is missing.

## 4. Errors: opt-in, at the bottom

- One `logError(message)` function. It appends to a list whether or not the panel is shown, so turning "Show errors" on reveals what already happened.
- The panel sits at the bottom, behind the "Show errors" toggle, and never at the top. `left: 16px; right: 100px` keeps it clear of the gear. Max height 30vh, scrolls.
- Empty state: "No problems so far." Never force errors on screen.
- Catch page errors too (`window.addEventListener('error', …)`).
- Offline is not an error. If the database can't be reached, say "this device only" in the status line, not an error on every load (Felix Maze).

## 5. Database block (apps that use Supabase)

- A header status pill outside the drawer: `💾 this device` · `☁️ synced` · `⚠️ check`. Tapping it opens the drawer.
- Check database pings each table the app uses and prints ✅/❌ per table. Add the same check to a `_logError` panel. An empty result with no error usually means row-level security, so the check should say so.
- Only the publishable key appears in browser code. Sign-in uses the family account when the app shares a login.
- Sign-in and Sync stay in the drawer. The app never prompts for sign-in in the play area.

## 6. Narrow screens

- On iPad portrait or a phone, the play area comes first and the drawer scrolls over it. Don't let the panels above the play area push the play area out of view (Make 3D).
- Check the gear against controls at 390 × 844, 768 × 1024 and 1180 × 820.

## 7. Starter (copy and rename)

```html
<button class="gear" id="gear" aria-label="Settings" aria-expanded="false" aria-controls="drawer">⚙️</button>
<aside class="drawer" id="drawer" hidden>
  <div class="drawerHead"><h2>Settings</h2><button class="mini" id="closeDrawer" aria-label="Close">✖</button></div>
  <div class="setting"><label>Sound</label>
    <div class="seg" data-key="sound"><button data-v="1">On</button><button data-v="0">Off</button></div></div>
  <label class="toggle"><input type="checkbox" id="showErrors"> Show errors</label>
  <details class="versionLog">
    <summary>📜 Version log <span id="versionNow"></span></summary>
    <ol id="versionList"></ol>
  </details>
</aside>
<script src="js/version.js"></script>
<div id="errorsPanel" class="errorsPanel" hidden></div>
```

```js
const KEY = 'app.settings';
const DEFAULTS = { sound: 1, showErrors: false };
let settings = { ...DEFAULTS };
try { settings = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (e) {}
const errors = [];
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch (e) {} };
function logError(msg) { errors.push(new Date().toLocaleTimeString() + '  ' + msg); renderErrors(); }
function renderErrors() {
  const box = document.getElementById('errorsPanel');
  box.hidden = !settings.showErrors;
  box.textContent = errors.length ? errors.join('\n') : 'No problems so far.';
}
function renderSettings() {
  document.querySelectorAll('.seg').forEach(seg => {
    const v = String(settings[seg.dataset.key]);
    seg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
  });
  document.getElementById('showErrors').checked = !!settings.showErrors;
  renderErrors();
}
const gear = document.getElementById('gear'), drawer = document.getElementById('drawer');
const setOpen = open => { drawer.hidden = !open; gear.setAttribute('aria-expanded', String(open)); };
gear.addEventListener('click', () => setOpen(drawer.hidden));
document.getElementById('closeDrawer').addEventListener('click', () => setOpen(false));
document.querySelectorAll('.seg button').forEach(b => b.addEventListener('click', () => {
  const v = b.dataset.v;
  settings[b.parentElement.dataset.key] = (v === '0' || v === '1') ? +v : v;
  save(); renderSettings();
}));
document.getElementById('showErrors').addEventListener('change', e => { settings.showErrors = e.target.checked; save(); renderErrors(); });
window.addEventListener('error', e => logError(e.message));
renderSettings();
```

```css
[hidden] { display: none !important; }
.gear { position: fixed; right: 18px; bottom: calc(18px + env(safe-area-inset-bottom)); width: 68px; height: 68px;
  border-radius: 50%; font-size: 32px; z-index: 30; background: #ffe9a8; border: 3px solid #2f2d3d;
  box-shadow: 0 4px 0 #2f2d3d; cursor: pointer; }
.drawer { position: fixed; right: 18px; bottom: 100px; width: min(360px, 92vw); max-height: 70vh; overflow-y: auto;
  z-index: 40; background: #fffdf7; border: 3px solid #2f2d3d; border-radius: 20px; box-shadow: 0 6px 0 #2f2d3d; padding: 14px; }
.setting { padding: 10px 0; }
.seg { display: flex; gap: 8px; }
.seg button { flex: 1; min-height: 52px; border: 3px solid #2f2d3d; border-radius: 16px; background: #fff;
  font-size: 18px; font-weight: 700; cursor: pointer; }
.seg button.on { background: #bfe8d2; }
.toggle { display: flex; align-items: center; gap: 10px; min-height: 48px; font-weight: 700; }
.versionLog { margin-top: 10px; border: 3px solid #2f2d3d; border-radius: 16px; padding: 8px 12px; background: #fff; }
.versionLog summary { min-height: 44px; display: flex; align-items: center; font-weight: 700; cursor: pointer; }
.versionLog ol { padding-left: 18px; margin: 8px 0 0; }
.errorsPanel { position: fixed; left: 16px; right: 100px; bottom: 16px; max-height: 30vh; overflow: auto; z-index: 25;
  background: #fff0ee; border: 3px solid #2f2d3d; border-radius: 16px; padding: 8px 12px; font: 14px monospace; white-space: pre-wrap; }
@media print { .gear, .drawer, .errorsPanel { display: none !important; } }
```

Version log data (starter, a separate file `js/version.js`, loaded at the end of the body)
```js
// js/version.js: the only file to edit when a change is made. Newest entry first.
window.APP_VERSION = '0.2.0';
window.APP_CHANGELOG = [
  { version: '0.2.0', date: '2026-11-04', changes: ['Added the version log panel inside the settings.'] },
  { version: '0.1.0', date: '2026-11-03', changes: ['First build: a sound setting and an error panel.'] }
];
(function () {
  var now = document.getElementById('versionNow'), list = document.getElementById('versionList');
  if (!now || !list) return;                      // the page has no version panel
  now.textContent = 'v' + window.APP_VERSION;
  list.textContent = '';
  window.APP_CHANGELOG.forEach(function (entry) {
    var li = document.createElement('li'), head = document.createElement('b'), ul = document.createElement('ul');
    head.textContent = 'v' + entry.version + ' · ' + entry.date;
    entry.changes.forEach(function (c) { var x = document.createElement('li'); x.textContent = c; ul.appendChild(x); });
    li.appendChild(head); li.appendChild(ul); list.appendChild(li);
  });
})();
```

## 8. Checks before calling it done

Run in a headless browser (Chromium at `/opt/pw-browsers/chromium` with `--no-sandbox`), then say what was not tested on a real iPad.
- Open and close the drawer. The gear keeps working after a page reload.
- Each segmented option changes the app and survives a reload.
- Show errors off → no panel. Turn it on → earlier errors appear. Zero console errors.
- Version log: closed by default; the summary shows the current version; the newest entry is first; the entry for the current version matches `APP_VERSION`.
- The gear does not cover a control or chip at 390 × 844, 768 × 1024 and 1180 × 820.
- Print preview hides the gear and the drawer.
- Database apps: "Check database" lists each table; a signed-out run says "this device only", not an error.

## 9. Version log (required in every app)

- Every app has one version log, inside ⚙️, as its own panel. It is closed by default. Its summary shows the current version (for example "📜 Version log v0.3.0"), so the version is visible without opening it.
- The data lives apart from the logic, in `js/version.js`: `APP_VERSION` (the current version) and `APP_CHANGELOG` (newest first). Each entry: `version` (major.minor.patch), `date` (ISO), and `changes` (one line each, plain words).
- **The bump rule.** Every change a user could see gets a new version in the same commit that makes it:
  - patch (0.3.1): a fix or a wording change;
  - minor (0.4.0): a new feature or a new option;
  - major (1.0.0): a change that alters saved data or the rules a child already knows. Add a note on how old saves are handled.
- **Wording by track** (`project_track.md`). Track A: short and plain ("You can now undo twice."). Track B: precise, with units and the setting it affects ("Dimensions now shown in feet and inches; stored in inches.").
- **Keep the history.** Never delete an old entry; fix a typo only. The log is the record of what changed for the person testing the app.
- **Saved data.** Store the version with any saved state (see `lessons_pool.md`, "Store the data version with saved state"). Drop a save from an older major version, or migrate it, and say so in the entry.
- **Exceptions.** A frozen, numbered page (for example `living_room_v1.html` to `living_room_v10.html`) is its own version: its file name is the version, so it has no ⚙️ log. A project whose only page is one of these keeps its log in the pointer file (`CLAUDE.md`). Ask Jimmy before adding one to a frozen page.
- **Dynamic drawers.** If the app builds its drawer in JavaScript (Shimmy Specs, Felix Maze, Adventure), `js/version.js` defines `window.renderVersionLog()` and calls it once on load. The app calls `renderVersionLog()` again right after it builds the drawer. Felix Maze and Adventure load `js/version.js` from their shared `common.js` after the drawer exists.
- The starter below does this. A project that already has a changelog (Chinese Character Sudoku's drawer, Fishes' `CHANGELOG.md`) moves it to this panel when it next changes. Do not add a second log.

## Sources (pattern learned in)
- Adventure: ⚙️ with page links, Show errors, Check database, Sign out. `js/common.js` `buildChrome()`.
- Felix Maze: ⚙️ with the sweet-spot faces, answer key (JPEG), sync, errors, print hidden. `js/common.js` `init()`.
- Make 3D: ⚙️ with axis, ground, display and units settings; footer padding; narrow-screen order.
- Chinese Character Sudoku: game switcher in ⚙️ (hash links), segmented settings, data-driven rows, side sheet, lower-left button.
