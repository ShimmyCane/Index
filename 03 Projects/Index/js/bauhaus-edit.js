// Home page: the "Edit blocks" button for the Bauhaus style. Drag the pieces, change their shape, size and
// colour, and undo. Changes are saved on this device as you go, and are there on the next visit.
(function () {
    var ship = window.Bauhaus;
    if (!ship) return;
    var SNAP = 11;   // how close, in px, a piece must be to settle against another

    function el(tag, className, text) {
        var node = document.createElement(tag);
        node.className = className;
        if (text) node.textContent = text;
        return node;
    }
    function button(bar, label, action) {
        var b = el('button', '', label);
        b.type = 'button';
        b.addEventListener('click', action);
        bar.appendChild(b);
        return b;
    }

    var toggle = el('button', 'ship-edit', '✏️ Edit blocks');
    toggle.type = 'button';
    toggle.setAttribute('aria-pressed', 'false');
    var bar = el('div', 'ship-tools');
    bar.hidden = true;
    var hint = el('p', 'ship-hint');
    hint.setAttribute('role', 'status');
    bar.appendChild(hint);
    document.body.appendChild(toggle);
    document.body.appendChild(bar);

    var selected = null;   // { wall, key }
    var history = [];

    function walls() { return Array.prototype.slice.call(document.querySelectorAll('.wall.ship')); }
    function find(sel) {
        if (!sel) return null;
        var wall = walls().filter(function (w) { return w.shipName === sel.name; })[0];
        var piece = wall && wall.pieces.filter(function (p) { return p.key === sel.key; })[0];
        return piece ? { wall: wall, piece: piece } : null;
    }

    function copy(data) { return JSON.parse(JSON.stringify(data)); }
    function remember() {
        history.push(copy(ship.read()));
        if (history.length > 60) history.shift();
    }

    // save every piece of one ship, so that moving one never shuffles the others
    function save(wall) {
        var data = copy(ship.read());
        var size = ship.sizeName(wall), width = wall.clientWidth;
        var records = {};
        wall.pieces.forEach(function (p) {
            var rec = p.rec;
            records[p.key] = {
                x: Math.round(rec.x / width * 10000) / 10000, w: Math.round(rec.w / width * 10000) / 10000,
                lift: Math.round(rec.lift), h: Math.round(rec.h), shape: rec.shape, flip: rec.flip, z: rec.z || 1,
                colour: p.li.firstElementChild.style.getPropertyValue('--tile')
            };
        });
        (data[size] || (data[size] = {}))[wall.shipName] = records;
        ship.write(data);
    }

    function say() {
        hint.textContent = ship.saveFailed ? 'This browser could not save. Changes last until you leave the page.'
            : find(selected) ? 'Selected: ' + find(selected).piece.li.textContent.trim() + '. Saved on this device.'
            : 'Drag a block. Tap one to change it. Changes save on this device.';
    }

    function mark() {
        walls().forEach(function (wall) {
            wall.pieces.forEach(function (p) { p.li.classList.remove('picked'); });
        });
        var hit = find(selected);
        if (hit) hit.piece.li.classList.add('picked');
        needsPiece.forEach(function (b) { b.disabled = !hit; });
        undo.disabled = !history.length;
        say();
    }

    function redraw() { window.TileColors.refresh(); mark(); }

    // change the selected piece, keep it inside its ship, then save
    function change(edit) {
        var hit = find(selected);
        if (!hit) return;
        remember();
        var rec = hit.piece.rec, width = hit.wall.clientWidth;
        var middle = rec.x + rec.w / 2;
        edit(rec, hit);
        rec.w = Math.min(width, Math.max(rec.w, ship.minWidth(hit.piece, rec.shape)));
        rec.x = Math.max(0, Math.min(width - rec.w, middle - rec.w / 2));
        ship.height(hit.wall);
        hit.wall.pieces.forEach(function (p) { ship.draw(hit.wall, p); });
        save(hit.wall);
        redraw();
    }

    var needsPiece = [
        button(bar, '🔷 Shape', function () {
            change(function (rec, hit) {
                rec.shape = ship.names[(ship.names.indexOf(rec.shape) + 1) % ship.names.length];
                rec.h = ship.tall(hit.wall, rec.shape);
            });
        }),
        button(bar, '↔️ Flip', function () { change(function (rec) { rec.flip = rec.flip ? 0 : 1; }); }),
        button(bar, '➕ Bigger', function () {
            change(function (rec) { rec.w *= 1.15; rec.h = Math.min(260, rec.h * 1.15); });
        }),
        button(bar, '➖ Smaller', function () {
            change(function (rec, hit) { rec.w /= 1.15; rec.h = Math.max(ship.tall(hit.wall, rec.shape) * 0.82, rec.h / 1.15); });
        }),
        button(bar, '🎨 Colour', function () {
            change(function (rec, hit) {
                var palette = window.TileColors.palette('bauhaus');
                var now = hit.piece.li.firstElementChild.style.getPropertyValue('--tile');
                rec.colour = palette[(palette.indexOf(now) + 1) % palette.length];
                window.TileColors.paint(hit.piece.li.firstElementChild, rec.colour);
            });
        })
    ];
    // rebuild the picked piece's section as the next picture
    needsPiece.push(button(bar, '🖼️ Picture', function () {
        var hit = find(selected);
        if (!hit) return;
        remember();
        var data = copy(ship.read());
        var size = ship.sizeName(hit.wall), name = hit.wall.shipName;
        var next = ship.figures[(ship.figures.indexOf(hit.wall.getAttribute('data-figure')) + 1) % ship.figures.length];
        data.figures = data.figures || {};
        (data.figures[size] || (data.figures[size] = {}))[name] = next;
        if (data[size]) delete data[size][name];
        ship.write(data);
        redraw();
    }));
    var undo = button(bar, '↩️ Undo', function () {
        if (!history.length) return;
        ship.write(history.pop());
        redraw();
    });
    button(bar, '🔄 Start over', function () {
        var wall = walls()[0];
        if (!wall) return;
        remember();
        var data = copy(ship.read());
        delete data[ship.sizeName(wall)];
        if (data.figures) delete data.figures[ship.sizeName(wall)];
        ship.write(data);
        selected = null;
        redraw();
    });

    function setEditing(on) {
        ship.editing = on;
        document.body.classList.toggle('ship-editing', on);
        toggle.textContent = on ? '✓ Done' : '✏️ Edit blocks';
        toggle.setAttribute('aria-pressed', String(on));
        bar.hidden = !on;
        selected = null;
        history = [];
        redraw();
    }
    toggle.addEventListener('click', function () { setEditing(!ship.editing); });

    // while editing, a tap picks a piece up instead of opening its page (and does not count as a Nursery visit)
    document.addEventListener('click', function (e) {
        if (ship.editing && e.target.closest('.wall a')) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);
    document.addEventListener('dragstart', function (e) {
        if (ship.editing && e.target.closest && e.target.closest('.wall a')) e.preventDefault();
    });
    document.addEventListener('contextmenu', function (e) {
        if (ship.editing && e.target.closest('.wall a')) e.preventDefault();
    });

    // ---- dragging ----
    var drag = null;
    function pieceAt(target) {
        var a = target.closest && target.closest('.wall.ship a');
        if (!a) return null;
        var li = a.parentNode, wall = li.parentNode;
        var piece = wall.pieces.filter(function (p) { return p.li === li; })[0];
        return piece ? { a: a, wall: wall, piece: piece } : null;
    }

    document.addEventListener('pointerdown', function (e) {
        if (!ship.editing || drag || e.button > 0) return;
        var hit = pieceAt(e.target);
        if (!hit) return;
        e.preventDefault();
        selected = { name: hit.wall.shipName, key: hit.piece.key };
        mark();
        drag = { id: e.pointerId, wall: hit.wall, piece: hit.piece, x: e.clientX, y: e.clientY,
                 fromX: hit.piece.rec.x, fromLift: hit.piece.rec.lift, moved: false };
        try { hit.a.setPointerCapture(e.pointerId); } catch (err) { /* not supported */ }
    });

    // keep a piece on its ship: inside the sides, above the bottom of the hull, below the top of the space
    function keepIn(wall, rec) {
        var highest = wall.shipHeight - wall.shipHull - rec.h;
        rec.x = Math.max(0, Math.min(wall.clientWidth - rec.w, rec.x));
        rec.lift = Math.max(-wall.shipHull * 0.6, Math.min(highest, rec.lift));
    }

    // settle against the deck, on top of another piece, or beside one
    function settle(wall, piece) {
        var rec = piece.rec;
        var bestLift = null, bestX = null;
        function near(value, target, best) {
            var off = Math.abs(value - target);
            return off <= SNAP && (best === null || off < Math.abs(value - best)) ? target : best;
        }
        bestLift = near(rec.lift, 0, bestLift);
        wall.pieces.forEach(function (other) {
            if (other === piece) return;
            var o = other.rec;
            if (rec.x < o.x + o.w && rec.x + rec.w > o.x) bestLift = near(rec.lift, o.lift + o.h + 2, bestLift);
            if (rec.lift < o.lift + o.h && rec.lift + rec.h > o.lift) {
                bestX = near(rec.x, o.x + o.w + 2, bestX);
                bestX = near(rec.x, o.x - rec.w - 2, bestX);
                bestLift = near(rec.lift, o.lift, bestLift);
            }
        });
        if (bestLift !== null) rec.lift = bestLift;
        if (bestX !== null) rec.x = bestX;
    }

    document.addEventListener('pointermove', function (e) {
        if (!drag || e.pointerId !== drag.id) return;
        var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (!drag.moved) {
            if (Math.hypot(dx, dy) < 4) return;
            drag.moved = true;
            remember();
            drag.piece.rec.z = 1 + drag.wall.pieces.reduce(function (most, p) { return Math.max(most, p.rec.z || 1); }, 1);
        }
        drag.piece.rec.x = drag.fromX + dx;
        drag.piece.rec.lift = drag.fromLift - dy;
        keepIn(drag.wall, drag.piece.rec);
        ship.draw(drag.wall, drag.piece);
        drag.piece.li.classList.add('picked');
    });

    function drop(e) {
        if (!drag || e.pointerId !== drag.id) return;
        var done = drag;
        drag = null;
        if (!done.moved) return;
        settle(done.wall, done.piece);
        keepIn(done.wall, done.piece.rec);
        ship.height(done.wall);
        done.wall.pieces.forEach(function (p) { ship.draw(done.wall, p); });
        save(done.wall);
        mark();
    }
    document.addEventListener('pointerup', drop);
    document.addEventListener('pointercancel', drop);

    // arrow keys move the selected piece (with Shift, one pixel at a time)
    document.addEventListener('keydown', function (e) {
        var step = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
        var hit = ship.editing && step && find(selected);
        if (!hit) return;
        e.preventDefault();
        remember();
        var size = e.shiftKey ? 1 : 8;
        hit.piece.rec.x += step[0] * size;
        hit.piece.rec.lift += step[1] * size;
        keepIn(hit.wall, hit.piece.rec);
        ship.draw(hit.wall, hit.piece);
        hit.piece.li.classList.add('picked');
        save(hit.wall);
        undo.disabled = false;
    });

    // leaving the Bauhaus style ends editing
    new MutationObserver(function () {
        if (ship.editing && document.body.getAttribute('data-style') !== 'bauhaus') setEditing(false);
    }).observe(document.body, { attributes: true, attributeFilter: ['data-style'] });
})();
