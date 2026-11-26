// Home page: the Bauhaus Blocks style, after the wooden ship-building toy by Alma Siedhoff-Buscher (1923).
// Each section builds its own picture (a ship, a castle, a house, a bridge, a tree or a train). Colours come from tile-colors.js.
// A ship you have rearranged (bauhaus-edit.js) is saved on this device and shown your way.
window.Bauhaus = (function () {
    var STORE = 'index-ship-v1';
    var HEADROOM = 130;   // extra space above each ship while editing, in px

    // Every shape is drawn standing on its flat foot. X() mirrors it when the piece is flipped.
    // side, top and foot are the shares of the box that a label must stay out of. "side" is the slanted side.
    // tall is the height a piece takes when it gets this shape: [phone, wide].
    var SHAPES = {
        block: { side: 0, top: 0, foot: 0, tall: [52, 60], align: 'center', path: function (X, w, h) {
            return 'M' + X(0) + ' 0L' + X(w) + ' 0L' + X(w) + ' ' + h + 'L' + X(0) + ' ' + h + 'Z'; } },
        sail: { side: 0.18, top: 0, foot: 0, tall: [140, 196], align: 'end', path: function (X, w, h) {
            return 'M' + X(0) + ' 0C' + X(w * 0.5) + ' ' + h * 0.2 + ' ' + X(w * 0.9) + ' ' + h * 0.56 + ' ' + X(w) + ' ' + h + 'L' + X(0) + ' ' + h + 'Z'; } },
        triangle: { side: 0.34, top: 0, foot: 0, tall: [128, 166], align: 'end', path: function (X, w, h) {
            return 'M' + X(0) + ' 0L' + X(w) + ' ' + h + 'L' + X(0) + ' ' + h + 'Z'; } },
        funnel: { side: 0, top: 0, foot: 0, tall: [84, 108], align: 'end', path: function (X, w, h) {
            return 'M' + X(0) + ' 13Q' + X(0) + ' 0 ' + X(w / 2) + ' 0Q' + X(w) + ' 0 ' + X(w) + ' 13L' + X(w) + ' ' + h + 'L' + X(0) + ' ' + h + 'Z'; } },
        dome: { side: 0.05, top: 0, foot: 0, tall: [86, 104], align: 'end', path: function (X, w, h) {
            return 'M' + X(0) + ' ' + h + 'L' + X(0) + ' ' + h * 0.62 + 'C' + X(0) + ' ' + h * -0.2 + ' ' + X(w) + ' ' + h * -0.2 + ' ' + X(w) + ' ' + h * 0.62 + 'L' + X(w) + ' ' + h + 'Z'; } },
        quarter: { side: 0.12, top: 0, foot: 0, tall: [96, 124], align: 'end', path: function (X, w, h) {
            return 'M' + X(0) + ' 0C' + X(w * 0.58) + ' 0 ' + X(w) + ' ' + h * 0.44 + ' ' + X(w) + ' ' + h + 'L' + X(0) + ' ' + h + 'Z'; } },
        roof: { side: 0, top: 0.3, foot: 0, tall: [92, 112], align: 'end', path: function (X, w, h) {
            return 'M' + X(0) + ' ' + h + 'L' + X(0) + ' ' + h * 0.38 + 'L' + X(w / 2) + ' 0L' + X(w) + ' ' + h * 0.38 + 'L' + X(w) + ' ' + h + 'Z'; } },
        wheel: { side: 0.08, top: 0.18, foot: 0.18, tall: [92, 118], align: 'center', path: function (X, w, h) {
            return 'M' + X(0) + ' ' + h / 2 + 'C' + X(0) + ' ' + h * -0.167 + ' ' + X(w) + ' ' + h * -0.167 + ' ' + X(w) + ' ' + h / 2 +
                   'C' + X(w) + ' ' + h * 1.167 + ' ' + X(0) + ' ' + h * 1.167 + ' ' + X(0) + ' ' + h / 2 + 'Z'; } },
        wedge: { side: 0.14, top: 0, foot: 0, tall: [52, 60], align: 'center', path: function (X, w, h) {
            return 'M' + X(0) + ' 0L' + X(w * 0.76) + ' 0L' + X(w) + ' ' + h + 'L' + X(0) + ' ' + h + 'Z'; } },
        arch: { side: 0, top: 0, foot: 0.42, tall: [74, 82], align: 'center', path: function (X, w, h) {
            return 'M' + X(0) + ' 0L' + X(w) + ' 0L' + X(w) + ' ' + h + 'L' + X(w * 0.74) + ' ' + h + 'C' + X(w * 0.74) + ' ' + h * 0.46 + ' ' + X(w * 0.26) + ' ' + h * 0.46 + ' ' + X(w * 0.26) + ' ' + h + 'L' + X(0) + ' ' + h + 'Z'; } },
        stairs: { side: 0, top: 0.4, foot: 0, tall: [84, 96], align: 'center', path: function (X, w, h) {
            return 'M' + X(0) + ' 0L' + X(w * 0.46) + ' 0L' + X(w * 0.46) + ' ' + h * 0.4 + 'L' + X(w) + ' ' + h * 0.4 + 'L' + X(w) + ' ' + h + 'L' + X(0) + ' ' + h + 'Z'; } }
    };
    var NAMES = Object.keys(SHAPES);
    var TOPS = ['sail', 'triangle', 'funnel', 'dome', 'sail', 'roof', 'quarter', 'triangle', 'wheel'];

    // ---- the pictures ----
    // base is the height of what the picture stands on: [phone, wide].
    // Each other picture is a plan: level(n, narrow) lists the places in row n from the ground up, and
    // caps are the pieces that finish it. A place is [left, right, shape, flipped], as shares of the width.
    var FIGURES = {
        ship: { base: [46, 76] },
        castle: {
            base: [16, 20],
            level: function (n, narrow) {
                if (narrow) {
                    if (n < 2) return [[0.02, 0.32, 'block'], [0.33, 0.67, n ? 'block' : 'arch'], [0.68, 0.98, 'block']];
                    return [[0.02, 0.32, 'block'], [0.68, 0.98, 'block']];
                }
                if (n === 0) return [[0.03, 0.23, 'block'], [0.24, 0.41, 'block'], [0.415, 0.585, 'arch'], [0.59, 0.76, 'block'], [0.77, 0.97, 'block']];
                if (n === 1) return [[0.03, 0.23, 'block'], [0.24, 0.499, 'block'], [0.501, 0.76, 'block'], [0.77, 0.97, 'block']];
                if (n === 2) return [[0.03, 0.23, 'block'], [0.28, 0.42, 'block'], [0.58, 0.72, 'block'], [0.77, 0.97, 'block']];
                return [[0.03, 0.23, 'block'], [0.77, 0.97, 'block']];
            },
            caps: function (total, narrow) { return narrow ? [[0.02, 0.32, 'roof'], [0.68, 0.98, 'roof']] : [[0.03, 0.23, 'roof'], [0.77, 0.97, 'roof']]; }
        },
        house: {
            base: [16, 20],
            level: function (n, narrow) {
                var edge = narrow ? 0.05 : 0.17, third = (1 - 2 * edge) / 3;
                if (n % 2 === 0) return [[edge, edge + third, 'block'], [edge + third, edge + 2 * third, n ? 'block' : 'arch'], [edge + 2 * third, 1 - edge, 'block']];
                return [[edge, 0.5, 'block'], [0.5, 1 - edge, 'block']];
            },
            caps: function (total, narrow) {
                var edge = narrow ? 0.01 : 0.11;
                return [[edge, 0.499, 'triangle', 1], [0.501, 1 - edge, 'triangle', 0]];
            }
        },
        bridge: {
            base: [30, 38],
            level: function (n, narrow) {
                if (narrow) return n === 0 ? [[0.01, 0.495, 'arch'], [0.505, 0.99, 'arch']] : [[0.04, 0.5, 'block'], [0.5, 0.96, 'block']];
                if (n === 0) return [[0.01, 0.17, 'block'], [0.175, 0.495, 'arch'], [0.505, 0.825, 'arch'], [0.83, 0.99, 'block']];
                if (n === 1) return [[0, 0.25, 'block'], [0.25, 0.5, 'block'], [0.5, 0.75, 'block'], [0.75, 1, 'block']];
                return [[0.14, 0.38, 'block'], [0.385, 0.615, 'block'], [0.62, 0.86, 'block']];
            },
            caps: function (total, narrow) {
                if (narrow) return [[0.08, 0.42, 'roof'], [0.58, 0.92, 'dome']];
                return total < 8 ? [[0.4, 0.6, 'dome']] : [[0.12, 0.31, 'roof'], [0.4, 0.6, 'dome'], [0.69, 0.88, 'roof']];
            }
        },
        tree: {
            base: [26, 34],
            level: function (n, narrow) {
                if (n === 0) return [narrow ? [0.33, 0.67, 'block'] : [0.41, 0.59, 'block']];
                if (narrow) return [[0.05, 0.495, 'wheel'], [0.505, 0.95, 'wheel']];
                if (n === 1) return [[0.19, 0.39, 'wheel'], [0.4, 0.6, 'wheel'], [0.61, 0.81, 'wheel']];
                return [[0.28, 0.495, 'wheel'], [0.505, 0.72, 'wheel']];
            },
            caps: function (total, narrow) { return [narrow ? [0.3, 0.7, 'roof'] : [0.39, 0.61, 'roof']]; }
        },
        train: {
            base: [34, 44],
            level: function (n, narrow) {
                if (narrow) return [[0, 0.485, n % 2 ? 'dome' : 'block'], [0.515, 1, n % 2 ? 'wedge' : 'block']];
                if (n === 0) return [[0, 0.235, 'block'], [0.255, 0.49, 'block'], [0.51, 0.745, 'block'], [0.765, 1, 'block']];
                return [[0.01, 0.22, 'block'], [0.265, 0.48, 'dome'], [0.52, 0.735, 'stairs'], [0.775, 0.99, 'wedge']];
            },
            caps: function (total) { return total < 5 ? [] : [[0.04, 0.2, 'funnel']]; }
        }
    };
    var FIGURE_NAMES = Object.keys(FIGURES);
    var STARTS_AS = { Games: 'ship', Learning: 'castle', Family: 'house', Architecture: 'bridge', Nursery: 'tree' };

    var api = { shapes: SHAPES, names: NAMES, figures: FIGURE_NAMES, editing: false, saveFailed: false };

    // ---- the saved arrangement ----
    var memory = null;
    api.read = function () {
        if (memory) return memory;
        try { memory = JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (e) { memory = {}; }
        return memory;
    };
    api.write = function (data) {
        memory = data;
        try { localStorage.setItem(STORE, JSON.stringify(data)); api.saveFailed = false; } catch (e) { api.saveFailed = true; }
    };
    api.sizeName = function (wall) { return wall.clientWidth < 560 ? 'narrow' : 'wide'; };
    function sectionName(wall) { return wall.closest('section').querySelector('h2').textContent.trim(); }

    function narrowWall(wall) { return wall.clientWidth < 560; }
    api.tall = function (wall, shape) { return SHAPES[shape].tall[narrowWall(wall) ? 0 : 1]; };

    // the narrowest a piece can be with its longest word still inside the shape
    api.minWidth = function (piece, shape) {
        var kind = SHAPES[shape];
        return Math.ceil(piece.text / (1 - kind.side - (shape === 'stairs' ? 0.05 : 0)) + (shape === 'block' ? 36 : 28));
    };

    // ---- drawing ----
    api.draw = function (wall, piece) {
        var rec = piece.rec, kind = SHAPES[rec.shape] || SHAPES.block;
        var w = Math.round(rec.w), h = Math.round(rec.h);
        var li = piece.li, a = li.firstElementChild;
        var top = wall.shipHeight - wall.shipHull - rec.lift - h;
        li.style.cssText = 'left:' + Math.round(rec.x) + 'px;top:' + Math.round(top) + 'px;width:' + w + 'px;height:' + h + 'px;z-index:' + (rec.z || 1);
        li.setAttribute('data-piece', rec.shape);
        function X(v) { return Math.round((rec.flip ? w - v : v) * 10) / 10; }
        a.style.clipPath = 'path("' + kind.path(X, w, h) + '")';
        var slant = Math.floor(w * kind.side) + 4;
        // low flat pieces keep their right end free for the heart
        var heart = h < 70 ? 24 : 0;
        a.style.padding = Math.round(h * kind.top + 2) + 'px ' + ((rec.flip ? 4 : slant) + heart) + 'px ' + Math.round(h * kind.foot + (kind.align === 'end' ? 8 : 2)) + 'px ' + (rec.flip ? slant : 4) + 'px';
        a.style.alignItems = kind.align === 'end' ? 'flex-end' : 'center';
        if (window.Hearts) window.Hearts.place(li);
    };

    // the ship is as tall as its highest piece, plus the hull (and room to stack while editing)
    api.height = function (wall) {
        var high = wall.pieces.reduce(function (most, p) { return Math.max(most, p.rec.lift + p.rec.h); }, 0);
        wall.shipHeight = Math.round(high + wall.shipHull + 3 + (api.editing ? HEADROOM : 0));
        wall.style.height = wall.shipHeight + 'px';
    };

    // which picture a section builds: your choice, or the one it starts as
    api.figureOf = function (wall) {
        var chosen = ((api.read().figures || {})[api.sizeName(wall)] || {})[wall.shipName];
        return FIGURES[chosen] ? chosen : STARTS_AS[wall.shipName] || 'train';
    };

    // Lay out a picture from its plan. Each piece drops until it rests on what is under it.
    function arrangeFigure(wall, figure, pieces) {
        var width = wall.clientWidth, narrow = narrowWall(wall);
        var plan = FIGURES[figure];
        var caps = plan.caps(pieces.length, narrow);
        caps = caps.slice(0, Math.max(0, Math.min(caps.length, pieces.length - 2)));
        var body = pieces.length - caps.length;
        var places = [];
        for (var n = 0; body > 0; n++) {
            var level = plan.level(n, narrow);
            if (body < level.length) {
                // the last, part-filled row shares out the room the full row would have had
                var from = level[0][0], to = level[level.length - 1][1], each = (to - from) / body;
                var short_ = [];
                for (var k = 0; k < body; k++) {
                    var like = level[k === body - 1 ? level.length - 1 : k];
                    short_.push([from + k * each, from + (k + 1) * each - 0.004, like[2], like[3]]);
                }
                level = short_;
            }
            var rowTall = Math.max.apply(null, level.map(function (s) { return s[2] === 'arch' ? api.tall(wall, 'arch') : api.tall(wall, 'block'); }));
            level.forEach(function (s) { places.push({ at: s, row: n, tall: s[2] === 'block' || s[2] === 'arch' || s[2] === 'wedge' ? rowTall : api.tall(wall, s[2]) }); });
            body -= level.length;
        }
        caps.forEach(function (s) { places.push({ at: s, row: 999, tall: api.tall(wall, s[2]) }); });

        // the longest names get the widest places
        var byRoom = places.slice().sort(function (a, b) { return (b.at[1] - b.at[0]) - (a.at[1] - a.at[0]); });
        var byName = pieces.slice().sort(function (a, b) { return b.text - a.text; });
        byRoom.forEach(function (place, i) { place.piece = byName[i]; });

        var down = [];
        places.forEach(function (place) {
            var piece = place.piece, shape = place.at[2];
            var x = place.at[0] * width + 1, w = (place.at[1] - place.at[0]) * width - 2;
            if (w < api.minWidth(piece, shape)) {
                if (w >= api.minWidth(piece, 'block')) shape = 'block';
                else { shape = 'block'; var wider = Math.min(width, api.minWidth(piece, shape)); x -= (wider - w) / 2; w = wider; }
            }
            x = Math.max(0, Math.min(width - w, x));
            var lift = down.reduce(function (high, o) {
                return x < o.x + o.w - 3 && x + w > o.x + 3 ? Math.max(high, o.lift + o.h + 2) : high;
            }, 0);
            piece.rec = { x: x, lift: lift, w: w, h: place.tall, shape: shape, flip: place.at[3] || 0, z: 1 };
            down.push(piece.rec);
        });
    }

    // ---- the first arrangement of a ship ----
    function arrangeShip(wall, wallIndex, pieces) {
        var width = wall.clientWidth;
        var narrow = narrowWall(wall);
        var r = window.Masonry.rng('ship' + wallIndex);
        var deckWidth = width * 0.9;
        var start = (width - deckWidth) / 2;
        var gap = narrow ? 5 : 12;
        function topShape(i) { return TOPS[(i + wallIndex * 2) % TOPS.length]; }
        function topMin(i) { return api.minWidth(pieces[i], topShape(i)); }
        function need(n) {
            var total = gap * (n - 1);
            for (var i = 0; i < n; i++) total += topMin(i);
            return total;
        }
        // about a third of the tiles stand on top, as long as their labels fit side by side
        var count = Math.min(narrow ? 3 : 5, Math.max(1, Math.round(pieces.length * 0.35)), pieces.length - 1);
        while (count > 0 && need(count) > deckWidth * 0.86) count--;

        var deck = pieces.slice(count);
        deck.forEach(function (p) {
            p.min = api.minWidth(p, 'block');
            p.want = Math.max(p.min, (narrow ? width / 2.8 : width / 5) * (0.5 + r()));
        });
        var rows = window.Masonry.courses(deck, deckWidth * 0.86, 1);
        var rowWidths = rows.map(function (row, k) {
            return deckWidth * (rows.length > 1 ? 0.86 + 0.14 * k / (rows.length - 1) : 1);
        });
        rows.forEach(function (row, k) { window.Masonry.fit(row, rowWidths[k]); });

        var blockHeight = api.tall(wall, 'block') + 2;
        rows.forEach(function (row, k) {
            var left = start + (deckWidth - rowWidths[k]) / 2;
            row.forEach(function (p, n) {
                var shape = 'block', flip = 0;
                var end = n === 0 || n === row.length - 1;
                // the ends of a deck slope like a bow and stern
                if (end && k < rows.length - 1 && p.w - 2 >= api.minWidth(p, 'wedge') && r() < 0.7) {
                    shape = 'wedge';
                    flip = n === 0 ? 1 : 0;
                }
                p.rec = { x: left, lift: (rows.length - 1 - k) * blockHeight, w: p.w - 2, h: blockHeight - 2, shape: shape, flip: flip, z: 1 };
                left += p.w;
            });
        });

        var topWidth = rowWidths[0] || deckWidth;
        var x = start + (deckWidth - topWidth) / 2;
        var share = (topWidth - gap * Math.max(0, count - 1)) / (count || 1);
        var widths = [], i;
        for (i = 0; i < count; i++) widths.push(Math.max(topMin(i), Math.min(share * (0.7 + 0.3 * r()), narrow ? 150 : 200)));
        var used = widths.reduce(function (s, w) { return s + w; }, 0);
        if (used + gap * (count - 1) > topWidth) {
            widths = widths.map(function (w, n) { return topMin(n) + (topWidth - need(count)) / count; });
            used = widths.reduce(function (s, w) { return s + w; }, 0);
        }
        var spread = count > 1 ? (topWidth - used) / (count - 1) : 0;
        if (count === 1) x += (topWidth - used) * 0.6;
        for (i = 0; i < count; i++) {
            var shape = topShape(i);
            pieces[i].rec = { x: x, lift: rows.length * blockHeight, w: widths[i], h: api.tall(wall, shape), shape: shape,
                              flip: /sail|triangle|quarter/.test(shape) && (i + wallIndex) % 2 ? 1 : 0, z: 1 };
            x += widths[i] + spread;
        }
    }

    function build(wall, wallIndex) {
        var items = Array.prototype.slice.call(wall.children);
        wall.classList.add('ship');
        var width = wall.clientWidth;
        if (!width || !items.length) return;
        var ctx = document.createElement('canvas').getContext('2d');
        var font = getComputedStyle(items[0].firstElementChild);
        ctx.font = font.fontWeight + ' ' + font.fontSize + ' ' + font.fontFamily;

        var pieces = items.map(function (li) {
            var a = li.firstElementChild;
            a.setAttribute('draggable', 'false');
            var longest = Math.max.apply(null, a.textContent.trim().split(/\s+/).map(function (word) {
                return ctx.measureText(word).width;
            }));
            return { li: li, text: longest, key: a.getAttribute('href') };
        });
        wall.pieces = pieces;
        wall.shipName = sectionName(wall);
        var figure = api.figureOf(wall);
        wall.setAttribute('data-figure', figure);
        wall.shipHull = FIGURES[figure].base[narrowWall(wall) ? 0 : 1];
        if (figure === 'ship') arrangeShip(wall, wallIndex, pieces);
        else arrangeFigure(wall, figure, pieces);

        // your own arrangement wins; widths and positions are kept as shares of the ship's width
        var saved = (api.read()[api.sizeName(wall)] || {})[wall.shipName] || {};
        pieces.forEach(function (p) {
            var s = saved[p.key];
            if (!s || !SHAPES[s.shape]) return;
            var w = Math.min(width, Math.max(s.w * width, api.minWidth(p, s.shape)));
            p.rec = { x: Math.max(0, Math.min(width - w, s.x * width)), lift: s.lift, w: w, h: s.h, shape: s.shape, flip: s.flip, z: s.z, colour: s.colour };
        });

        wall.style.setProperty('--hull', wall.shipHull + 'px');
        api.height(wall);
        pieces.forEach(function (p) { api.draw(wall, p); });
    }

    api.reset = function (wall) {
        wall.classList.remove('ship');
        wall.removeAttribute('data-figure');
        wall.style.removeProperty('--hull');
        wall.pieces = null;
        Array.prototype.forEach.call(wall.children, function (li) {
            li.removeAttribute('data-piece');
            li.firstElementChild.style.alignItems = '';
            li.firstElementChild.removeAttribute('draggable');
        });
    };
    api.apply = function () {
        if (document.body.getAttribute('data-style') !== 'bauhaus') return;
        Array.prototype.forEach.call(document.querySelectorAll('.wall'), build);
    };
    return api;
})();
