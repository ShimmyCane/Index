// Home page: put the tiles in your own order. "Reorder" turns on dragging: drop a tile on another one in
// the same section to take its place. The order is saved on this device and used by every style.
// (Bauhaus has its own free-moving "Edit blocks" button instead.)
(function () {
    var STORE = 'index-order';
    var walls = Array.prototype.slice.call(document.querySelectorAll('.wall'));

    function nameOf(wall) { return wall.closest('section').querySelector('h2').textContent.trim(); }
    function keyOf(li) { return li.querySelector('a').getAttribute('href'); }
    function orderOf(wall) { return Array.prototype.map.call(wall.children, keyOf); }

    var starting = {};   // the order the page loaded with, before yours
    walls.forEach(function (wall) { starting[nameOf(wall)] = orderOf(wall); });

    var memory = null;
    function read() {
        if (memory) return memory;
        try { memory = JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (e) { memory = {}; }
        return memory;
    }
    var failed = false;
    function write(data) {
        memory = data;
        try { localStorage.setItem(STORE, JSON.stringify(data)); failed = false; } catch (e) { failed = true; }
    }

    // put a section's tiles in the given order; tiles the list does not know stay at the end
    function put(wall, keys) {
        var byKey = {};
        Array.prototype.forEach.call(wall.children, function (li) { byKey[keyOf(li)] = li; });
        var wanted = keys.map(function (k) { return byKey[k]; }).filter(Boolean);
        Array.prototype.forEach.call(wall.children, function (li) { if (wanted.indexOf(li) < 0) wanted.push(li); });
        var same = wanted.every(function (li, i) { return wall.children[i] === li; });
        if (!same) wanted.forEach(function (li) { wall.appendChild(li); });
    }
    function applyAll() {
        var saved = read();
        walls.forEach(function (wall) { put(wall, saved[nameOf(wall)] || starting[nameOf(wall)]); });
    }
    applyAll();

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'reorder-edit';
    toggle.textContent = '↕️ Reorder';
    toggle.setAttribute('aria-pressed', 'false');
    var bar = document.createElement('div');
    bar.className = 'reorder-tools';
    bar.hidden = true;
    var hint = document.createElement('p');
    hint.setAttribute('role', 'status');
    bar.appendChild(hint);
    function button(label, action) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = label;
        b.addEventListener('click', action);
        bar.appendChild(b);
        return b;
    }
    document.body.appendChild(toggle);
    document.body.appendChild(bar);

    var on = false;
    var history = [];
    function copy() { return JSON.parse(JSON.stringify(read())); }
    function say() {
        hint.textContent = failed ? 'This browser could not save. The order lasts until you leave the page.'
            : 'Drag a tile onto another in the same group. Saved on this device.';
        undo.disabled = !history.length;
    }
    var undo = button('↩️ Undo', function () {
        if (!history.length) return;
        write(history.pop());
        applyAll();
        say();
    });
    button('🔄 Original order', function () {
        history.push(copy());
        write({});
        applyAll();
        say();
    });

    // move one tile to another's place in the same section
    function move(li, target) {
        var wall = li.parentNode;
        if (!target || target === li || target.parentNode !== wall) return false;
        history.push(copy());
        if (history.length > 60) history.shift();
        var list = Array.prototype.slice.call(wall.children);
        var forward = list.indexOf(li) < list.indexOf(target);
        wall.insertBefore(li, forward ? target.nextSibling : target);
        var data = copy();
        data[nameOf(wall)] = orderOf(wall);
        write(data);
        say();
        return true;
    }

    function setOn(next) {
        on = next;
        document.body.classList.toggle('reordering', on);
        toggle.textContent = on ? '✓ Done' : '↕️ Reorder';
        toggle.setAttribute('aria-pressed', String(on));
        bar.hidden = !on;
        history = [];
        say();
    }
    toggle.addEventListener('click', function () { setOn(!on); });

    function tileAt(node) {
        var a = node && node.closest && node.closest('.wall a');
        return a ? a.parentNode : null;
    }

    // while reordering, taps do not open pages
    document.addEventListener('click', function (e) {
        if (on && tileAt(e.target)) { e.preventDefault(); e.stopPropagation(); }
    }, true);
    ['dragstart', 'contextmenu'].forEach(function (type) {
        document.addEventListener(type, function (e) { if (on && tileAt(e.target)) e.preventDefault(); });
    });

    var drag = null;
    function clear() {
        if (!drag) return;
        if (drag.ghost) drag.ghost.remove();
        drag.li.classList.remove('moving');
        if (drag.target) drag.target.classList.remove('target');
        clearInterval(drag.scroller);
        drag = null;
    }
    function aim() {
        var under = tileAt(document.elementFromPoint(drag.x, drag.y));
        if (under && (under === drag.li || under.parentNode !== drag.li.parentNode)) under = null;
        if (under === drag.target) return;
        if (drag.target) drag.target.classList.remove('target');
        drag.target = under;
        if (under) under.classList.add('target');
    }
    document.addEventListener('pointerdown', function (e) {
        var li = on && !drag && !(e.button > 0) && tileAt(e.target);
        if (!li) return;
        e.preventDefault();
        drag = { id: e.pointerId, li: li, x: e.clientX, y: e.clientY, fromX: e.clientX, fromY: e.clientY, ghost: null, target: null };
        try { e.target.setPointerCapture(e.pointerId); } catch (err) { /* not supported */ }
    });
    document.addEventListener('pointermove', function (e) {
        if (!drag || e.pointerId !== drag.id) return;
        drag.x = e.clientX;
        drag.y = e.clientY;
        if (!drag.ghost) {
            if (Math.hypot(drag.x - drag.fromX, drag.y - drag.fromY) < 6) return;
            drag.ghost = document.createElement('div');
            drag.ghost.className = 'reorder-ghost';
            drag.ghost.textContent = drag.li.textContent.trim();
            document.body.appendChild(drag.ghost);
            drag.li.classList.add('moving');
            // near the top or bottom of the screen, the page scrolls along
            drag.scroller = setInterval(function () {
                var step = drag.y < 90 ? -12 : drag.y > window.innerHeight - 90 ? 12 : 0;
                if (step) { window.scrollBy(0, step); aim(); }
            }, 30);
        }
        drag.ghost.style.left = drag.x + 'px';
        drag.ghost.style.top = drag.y + 'px';
        aim();
    });
    document.addEventListener('pointerup', function (e) {
        if (!drag || e.pointerId !== drag.id) return;
        var li = drag.li, target = drag.target;
        clear();
        move(li, target);
    });
    document.addEventListener('pointercancel', clear);

    // with a keyboard: focus a tile and use the arrow keys
    document.addEventListener('keydown', function (e) {
        var step = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key];
        var li = on && step && tileAt(document.activeElement);
        if (!li) return;
        e.preventDefault();
        if (move(li, step < 0 ? li.previousElementSibling : li.nextElementSibling)) li.querySelector('a').focus();
    });

    // Bauhaus has its own editor, so reordering ends there
    new MutationObserver(function () {
        if (on && document.body.getAttribute('data-style') === 'bauhaus') setOn(false);
    }).observe(document.body, { attributes: true, attributeFilter: ['data-style'] });
})();
