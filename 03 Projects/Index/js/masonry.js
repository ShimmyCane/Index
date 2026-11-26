// Home page: the Polygonal Masonry style, after the Inca walls of Cusco.
// The whole page is one wall built around a twelve-angled stone that carries the site's name.
// Stones of very different sizes lock into each other with tongues and steps. Thin joints separate stones;
// a wider pale seam shows where one category ends and the next begins. Flat colour, no shading.
//
// How it is made: stones are packed on a hidden grid, steps are cut by handing grid cells from one stone to
// the next, then the shared corners are nudged so edges lean. Neighbours share corners, so there are no gaps.
window.Masonry = (function () {
    var ROUND = 7;        // how rounded each stone corner is, in px
    var HERO = 'hero';    // the twelve-angled stone

    // Repeatable "random" numbers from a text, so the wall looks the same on every visit.
    function rng(text) {
        var h = 2166136261;
        for (var i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
        return function () {
            h = Math.imul(h ^ (h >>> 15), 2246822507);
            h = Math.imul(h ^ (h >>> 13), 3266489909);
            h ^= h >>> 16;
            return (h >>> 0) / 4294967296;
        };
    }
    function between(r, a, b) { return a + (b - a) * r(); }
    function whole(r, a, b) { return a + Math.floor(r() * (b - a + 1)); }

    // ---- packing helpers, also used by bauhaus.js ----

    // Split pieces, in order, into rows that each fit the width.
    function courses(pieces, width, minRows) {
        var total = pieces.reduce(function (sum, s) { return sum + s.want; }, 0);
        var count = Math.max(minRows || 1, Math.round(total / width));
        var rows, ok = false;
        while (!ok) {
            rows = [];
            var row = [], done = 0;
            pieces.forEach(function (s, i) {
                row.push(s);
                done += s.want;
                var left = pieces.length - i - 1;
                var rowsLeft = count - rows.length - 1;
                var next = left ? pieces[i + 1].want : 0;
                if (rowsLeft > 0 && left && (done + next / 2 >= total * (rows.length + 1) / count || left <= rowsLeft)) {
                    rows.push(row);
                    row = [];
                }
            });
            if (row.length) rows.push(row);
            ok = count >= pieces.length || rows.every(function (r) {
                return r.reduce(function (sum, s) { return sum + s.min; }, 0) <= width;
            });
            count++;
        }
        return rows;
    }

    // Give each piece in a row its width: its share, but never narrower than its longest word.
    function fit(row, width) {
        var free = row.slice(), room = width, changed = true;
        while (changed) {
            changed = false;
            var want = free.reduce(function (sum, s) { return sum + s.want; }, 0);
            for (var i = free.length - 1; i >= 0; i--) {
                if (free[i].want / want * room < free[i].min) {
                    free[i].w = free[i].min;
                    room -= free[i].min;
                    free.splice(i, 1);
                    changed = true;
                    break;
                }
            }
        }
        var rest = free.reduce(function (sum, s) { return sum + s.want; }, 0);
        free.forEach(function (s) { s.w = s.want / rest * room; });
    }

    // ---- the grid ----

    function Grid(cols) { this.cols = cols; this.rows = []; this.sky = []; for (var c = 0; c < cols; c++) this.sky.push(0); }
    Grid.prototype.at = function (c, r) { return c >= 0 && c < this.cols && this.rows[r] ? this.rows[r][c] : undefined; };
    Grid.prototype.set = function (c, r, id) { (this.rows[r] || (this.rows[r] = []))[c] = id; };
    Grid.prototype.block = function (c0, r0, w, h, id) {
        for (var c = c0; c < c0 + w; c++) {
            for (var r = r0; r < r0 + h; r++) this.set(c, r, id);
            this.sky[c] = Math.max(this.sky[c], r0 + h);
        }
    };

    // Lay the stones, lowest gap first. A gap too narrow for the next stone is filled by growing the stones
    // around it, which is what cuts the steps and notches.
    function pack(grid, stones, r) {
        var next = 0, guard = 0;
        while (next < stones.length && guard++ < 2000) {
            var level = Math.min.apply(null, grid.sky);
            var start = grid.sky.indexOf(level), end = start;
            while (end < grid.cols && grid.sky[end] === level) end++;
            var run = end - start, stone = stones[next];
            if (run < stone.minCols) {
                var left = start > 0 ? grid.sky[start - 1] : Infinity;
                var right = end < grid.cols ? grid.sky[end] : Infinity;
                var upTo = Math.min(left, right);
                var side = left <= right ? start - 1 : end;
                for (var c = start; c < end; c++) {
                    var below = grid.at(c, level - 1);
                    for (var row = level; row < upTo; row++) {
                        // grow the stone below; the twelve-angled stone never grows, so there a side stone grows instead
                        var owner = below !== HERO && below !== undefined ? below : grid.at(side, row);
                        if (owner === HERO || owner === undefined) owner = grid.at(side === end ? start - 1 : end, row);
                        grid.set(c, row, owner);
                    }
                    grid.sky[c] = upTo;
                }
                continue;
            }
            var w = Math.min(stone.cols, run);
            if (run - w < 3) w = run <= stone.cols + 3 ? run : run - 3;
            if (w < stone.minCols) w = run;
            var from = r() < 0.5 ? start : end - w;
            var h = stone.height;
            // do not line up the top edge with a neighbour's: long straight seams look like brickwork
            if (grid.sky[from - 1] === level + h || grid.sky[from + w] === level + h) h++;
            grid.block(from, level, w, h, next);
            next++;
        }
        // level the foot of the wall by growing the lowest stones down to it
        var foot = Math.max.apply(null, grid.sky);
        for (var col = 0; col < grid.cols; col++) {
            var last = grid.at(col, grid.sky[col] - 1);
            for (var y = grid.sky[col]; y < foot; y++) grid.set(col, y, last);
            grid.sky[col] = foot;
        }
        return foot;
    }

    // The best rectangle of a stone's own cells for its label.
    function labelSpot(grid, id, height, minCols) {
        var best = null;
        for (var r0 = 0; r0 < height; r0++) {
            var open = [];
            for (var c = 0; c < grid.cols; c++) open[c] = true;
            for (var r1 = r0; r1 < height; r1++) {
                for (var c1 = 0; c1 < grid.cols; c1++) open[c1] = open[c1] && grid.at(c1, r1) === id;
                var start = -1;
                for (var c2 = 0; c2 <= grid.cols; c2++) {
                    if (c2 < grid.cols && open[c2]) { if (start < 0) start = c2; continue; }
                    if (start >= 0) {
                        var w = c2 - start, h = r1 - r0 + 1;
                        var score = Math.min(w, minCols + 3) * Math.min(h, 4) + (w >= minCols ? 100 : 0) + (h >= 3 ? 100 : h * 20);
                        if (!best || score > best.score) best = { c: start, r: r0, w: w, h: h, score: score };
                        start = -1;
                    }
                }
            }
        }
        return best;
    }

    // Extra steps: along some level seams, the upper stone takes a small bite out of the one below it.
    function cutSteps(grid, stones, height, r) {
        for (var row = 1; row < height - 1; row++) {
            var c = 0;
            while (c < grid.cols) {
                var top = grid.at(c, row - 1), bottom = grid.at(c, row), end = c;
                while (end < grid.cols && grid.at(end, row - 1) === top && grid.at(end, row) === bottom) end++;
                if (top !== bottom && typeof top === 'number' && typeof bottom === 'number' && end - c >= 3 && r() < 0.5) {
                    var bite = whole(r, 1, Math.min(2, end - c - 2));
                    var from = r() < 0.5 ? c : end - bite;
                    for (var i = from; i < from + bite; i++) grid.set(i, row, top);
                    var spot = labelSpot(grid, bottom, height, stones[bottom].minCols);
                    if (!spot || spot.w < stones[bottom].minCols || spot.h < 3 || !joined(grid, bottom, height)) {
                        for (var k = from; k < from + bite; k++) grid.set(k, row, bottom);
                    }
                }
                c = Math.max(end, c + 1);
            }
        }
    }

    // Tongues: along a shared side, one stone pushes into the middle of the other, so the two lock together.
    // A tongue is only kept if the stone that gives way is still in one piece and still has room for its label.
    function cutTongues(grid, stones, height, r) {
        var done = {};
        function attempt(cells, taker, giver) {
            if (!cells.every(function (c) { return grid.at(c[0], c[1]) === giver; })) return false;
            cells.forEach(function (c) { grid.set(c[0], c[1], taker); });
            var spot = labelSpot(grid, giver, height, stones[giver].minCols);
            if (spot && spot.w >= stones[giver].minCols && spot.h >= 3 && joined(grid, giver, height)) return true;
            cells.forEach(function (c) { grid.set(c[0], c[1], giver); });
            return false;
        }
        function stone(id) { return typeof id === 'number'; }
        var spots = [];
        for (var y = 0; y < height; y++) for (var x = 0; x < grid.cols; x++) spots.push([x, y, r()]);
        spots.sort(function (a, b) { return a[2] - b[2]; });
        spots.forEach(function (s) {
            var x = s[0], y = s[1];
            // an upright side: A on the left, B on the right, with the same pair above and below the tongue
            var a = grid.at(x, y), b = grid.at(x + 1, y);
            if (stone(a) && stone(b) && a !== b) {
                var pair = Math.min(a, b) + 'v' + Math.max(a, b);
                if ((done[pair] || 0) < 1 && grid.at(x, y - 1) === a && grid.at(x + 1, y - 1) === b) {
                    var tall = r() < 0.6 ? 2 : 1;
                    if (grid.at(x, y + tall) === a && grid.at(x + 1, y + tall) === b) {
                        var intoB = r() < 0.5;
                        var cells = [];
                        for (var i = 0; i < tall; i++) cells.push([intoB ? x + 1 : x, y + i]);
                        if (attempt(cells, intoB ? a : b, intoB ? b : a)) done[pair] = 1;
                    }
                }
            }
            // a level side: C above, D below
            var c = grid.at(x, y), d = grid.at(x, y + 1);
            if (stone(c) && stone(d) && c !== d) {
                var key = Math.min(c, d) + 'h' + Math.max(c, d);
                if ((done[key] || 0) < 1 && grid.at(x - 1, y) === c && grid.at(x - 1, y + 1) === d) {
                    var wide = r() < 0.6 ? 2 : 1;
                    if (grid.at(x + wide, y) === c && grid.at(x + wide, y + 1) === d) {
                        var down = r() < 0.5;
                        var row = [];
                        for (var j = 0; j < wide; j++) row.push([x + j, down ? y + 1 : y]);
                        if (attempt(row, down ? c : d, down ? d : c)) done[key] = 1;
                    }
                }
            }
        });
    }

    // How many patches there are beyond one for each category.
    function countPatches(grid, stones, height) {
        var seen = {}, patches = 0, groups = {};
        for (var r = 0; r < height; r++) {
            for (var c = 0; c < grid.cols; c++) {
                var first = grid.at(c, r);
                if (!stones[first] || seen[c + ',' + r]) continue;
                var group = stones[first].group;
                groups[group] = true;
                patches++;
                var queue = [[c, r]];
                seen[c + ',' + r] = true;
                while (queue.length) {
                    var p = queue.pop();
                    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (step) {
                        var x = p[0] + step[0], y = p[1] + step[1], id = grid.at(x, y);
                        if (stones[id] && stones[id].group === group && !seen[x + ',' + y]) { seen[x + ',' + y] = true; queue.push([x, y]); }
                    });
                }
            }
        }
        return patches - Object.keys(groups).length;
    }

    // True when a stone's cells are all in one piece.
    function joined(grid, id, height) {
        var all = [], seen = {};
        for (var r = 0; r < height; r++) for (var c = 0; c < grid.cols; c++) if (grid.at(c, r) === id) all.push([c, r]);
        if (!all.length) return false;
        var queue = [all[0]], count = 0;
        seen[all[0]] = true;
        while (queue.length) {
            var p = queue.pop();
            count++;
            [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (step) {
                var q = [p[0] + step[0], p[1] + step[1]];
                if (!seen[q] && grid.at(q[0], q[1]) === id) { seen[q] = true; queue.push(q); }
            });
        }
        return count === all.length;
    }

    // Walk round a stone's cells and list the grid points on its edge, in order.
    function edgeLoop(cells) {
        var edges = {};
        function key(x, y) { return x + ',' + y; }
        function add(x0, y0, x1, y1) {
            var back = edges[key(x1, y1)];
            if (back) {
                for (var i = 0; i < back.length; i++) {
                    if (back[i][0] === x0 && back[i][1] === y0) {
                        back.splice(i, 1);
                        if (!back.length) delete edges[key(x1, y1)];
                        return;
                    }
                }
            }
            (edges[key(x0, y0)] || (edges[key(x0, y0)] = [])).push([x1, y1]);
        }
        cells.forEach(function (cell) {
            var x = cell[0], y = cell[1];
            add(x, y, x + 1, y); add(x + 1, y, x + 1, y + 1); add(x + 1, y + 1, x, y + 1); add(x, y + 1, x, y);
        });
        var first = Object.keys(edges)[0].split(',').map(Number);
        var loop = [first], here = first, prev = null, guard = 0;
        while (guard++ < 4000) {
            var out = edges[key(here[0], here[1])];
            if (!out || !out.length) break;
            var pick = 0;
            if (out.length > 1 && prev) {
                var dx = here[0] - prev[0], dy = here[1] - prev[1];
                out.forEach(function (o, i) { if ((o[0] - here[0]) === -dy && (o[1] - here[1]) === dx) pick = i; });
            }
            var to = out.splice(pick, 1)[0];
            prev = here;
            here = to;
            if (here[0] === first[0] && here[1] === first[1]) break;
            loop.push(here);
        }
        return loop;
    }
    function isCorner(a, b, c) { return (b[0] - a[0]) * (c[1] - b[1]) !== (b[1] - a[1]) * (c[0] - b[0]); }
    function cornersOf(loop) {
        return loop.filter(function (p, i) { return isCorner(loop[(i + loop.length - 1) % loop.length], p, loop[(i + 1) % loop.length]); });
    }

    // A path through the corner points, each corner slightly rounded.
    function outline(pts) {
        var d = '';
        pts.forEach(function (p, i) {
            var prev = pts[(i + pts.length - 1) % pts.length], next = pts[(i + 1) % pts.length];
            function toward(q) {
                var len = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
                var k = Math.min(ROUND, len * 0.35) / len;
                return [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k];
            }
            var a = toward(prev), b = toward(next);
            d += (i ? 'L' : 'M') + a[0].toFixed(1) + ' ' + a[1].toFixed(1) +
                 'Q' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ' ' + b[0].toFixed(1) + ' ' + b[1].toFixed(1);
        });
        return d + 'Z';
    }

    // The joint round each stone: one dark line, nothing else.
    function drawing(d, w, h) {
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '">' +
            '<clipPath id="c"><path d="' + d + '"/></clipPath>' +
            '<path d="' + d + '" fill="none" stroke="#2b2118" stroke-width="3.6" clip-path="url(#c)"/></svg>';
        return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
    }

    var api = { rng: rng, courses: courses, fit: fit, neighbours: null };

    function build(page) {
        var items = Array.prototype.slice.call(page.querySelectorAll('.wall li'));
        var title = page.querySelector('header');
        var style = getComputedStyle(page);
        var x0 = parseFloat(style.paddingLeft);
        var y0 = parseFloat(style.paddingTop);
        var width = page.clientWidth - x0 - parseFloat(style.paddingRight);
        page.classList.add('one-wall');
        if (!width || !items.length) return;
        var narrow = width < 560;
        y0 = Math.max(y0, narrow ? 80 : 74);   // keep the top corners clear of the corner buttons
        var r = rng('cusco ' + items.length);
        var cols = Math.max(12, Math.round(width / (narrow ? 22 : 29)));
        var u = width / cols, v = narrow ? 18 : 21;
        var ctx = document.createElement('canvas').getContext('2d');
        var font = getComputedStyle(items[0].firstElementChild);
        ctx.font = font.fontWeight + ' ' + font.fontSize + ' ' + font.fontFamily;

        // sizes: like the real wall, a few very large stones among many middling and small ones
        var stones = items.map(function (li) {
            var text = li.textContent.trim().toUpperCase();
            var longest = Math.max.apply(null, text.split(/\s+/).map(function (word) {
                return ctx.measureText(word).width + word.length * parseFloat(font.fontSize) * 0.04;
            }));
            var minCols = Math.min(cols, Math.max(2, Math.ceil((longest + (narrow ? 34 : 38)) / u)));
            var big = /3x2|6x2|6x1/.test(li.getAttribute('data-size') || '');
            var roll = r();
            var extra = big ? whole(r, 3, 5) : roll < 0.3 ? 1 : roll < 0.8 ? 2 : 4;
            var height = big ? whole(r, 6, 8) : roll < 0.25 ? 4 : roll < 0.8 ? whole(r, 4, 5) : 7;
            var group = li.closest('section').querySelector('h2').textContent.trim();
            return { li: li, group: group, minCols: minCols, cols: Math.min(cols, minCols + extra), height: height };
        });

        function layOut(r) {
            // the twelve-angled stone sits at the top, in the middle
            var grid = new Grid(cols);
            var heroCols = narrow ? cols - 4 : Math.max(12, Math.round(cols * 0.46));
            var heroRows = narrow ? 6 : 8;
            var heroAt = Math.floor((cols - heroCols) / 2);
            grid.block(heroAt, 0, heroCols, heroRows, HERO);
            var fillers = [];
            function filler(c, row, w, h) {
                var id = 'filler' + fillers.length;
                grid.block(c, row, w, h, id);
                fillers.push(id);
            }
            // on a narrow screen there is no room for stones beside it, so small packing stones go there
            if (narrow) {
                var rightAt = heroAt + heroCols;
                filler(0, 0, heroAt, 3); filler(0, 3, heroAt, heroRows - 3);
                filler(rightAt, 0, cols - rightAt, 4); filler(rightAt, 4, cols - rightAt, heroRows - 4);
            }
            var height = pack(grid, stones, r);

            // give the big stone its four notches: four corners cut from a rectangle make twelve
            [[heroAt, 0, -1], [heroAt + heroCols - 1, 0, 1], [heroAt, heroRows - 2, -1], [heroAt + heroCols - 1, heroRows - 2, 1]].forEach(function (n) {
                [0, 1].forEach(function (dy) {
                    var neighbour = grid.at(n[0] + n[2], n[1] + dy);
                    if (neighbour !== undefined && neighbour !== HERO) grid.set(n[0], n[1] + dy, neighbour);
                });
            });
            cutSteps(grid, stones, height, r);
            cutTongues(grid, stones, height, r);
            return { grid: grid, height: height, fillers: fillers, heroAt: heroAt };
        }

        // try arrangements until every category is one connected patch, so its seam reads clearly
        var plan, patches = Infinity;
        for (var attempt = 0; attempt < 60 && patches > 0; attempt++) {
            var next = layOut(rng('cusco ' + items.length + ' ' + attempt));
            var extra = countPatches(next.grid, stones, next.height);
            if (extra < patches) { plan = next; patches = extra; }
        }
        var grid = plan.grid, height = plan.height, fillers = plan.fillers;

        // outlines, and the corners that stones share
        var cells = {};
        for (var row = 0; row < height; row++) {
            for (var c = 0; c < cols; c++) {
                var id = grid.at(c, row);
                (cells[id] || (cells[id] = [])).push([c, row]);
            }
        }
        var loops = {}, shared = {};
        Object.keys(cells).forEach(function (id) {
            loops[id] = edgeLoop(cells[id]);
            cornersOf(loops[id]).forEach(function (p) { shared[p[0] + ',' + p[1]] = true; });
        });

        // nudge the shared corners so the edges lean
        var moved = {};
        Object.keys(shared).forEach(function (k) {
            var p = k.split(',').map(Number);
            var side = p[0] === 0 || p[0] === cols, end = p[1] === 0 || p[1] === height;
            var jitter = rng('corner ' + k);
            moved[k] = [p[0] * u + (side ? between(jitter, -2, 2) : between(jitter, -u * 0.19, u * 0.19)),
                        p[1] * v + (end ? between(jitter, -2, 2) : between(jitter, -v * 0.24, v * 0.24))];
            moved[k][0] = Math.max(0, Math.min(width, moved[k][0]));
            moved[k][1] = Math.max(0, Math.min(height * v, moved[k][1]));
        });
        // the twelve-angled stone has straight sides: points part way along a side stay on the straight line
        var heroCorners = cornersOf(loops[HERO]);
        heroCorners.forEach(function (a, i) {
            var b = heroCorners[(i + 1) % heroCorners.length];
            var A = moved[a[0] + ',' + a[1]], B = moved[b[0] + ',' + b[1]];
            loops[HERO].forEach(function (p) {
                var along = b[0] !== a[0] ? (p[0] - a[0]) / (b[0] - a[0]) : (p[1] - a[1]) / (b[1] - a[1]);
                if (!isCorner(a, p, b) && along > 0 && along < 1 && shared[p[0] + ',' + p[1]]) {
                    moved[p[0] + ',' + p[1]] = [A[0] + (B[0] - A[0]) * along, A[1] + (B[1] - A[1]) * along];
                }
            });
        });

        // who touches whom, so that tile-colors.js can colour the wall exactly like a map
        var touch = {};
        function meet(a, b) {
            if (a === undefined || b === undefined || a === b) return;
            (touch[a] || (touch[a] = {}))[b] = true;
            (touch[b] || (touch[b] = {}))[a] = true;
        }
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < cols; x++) {
                meet(grid.at(x, y), grid.at(x + 1, y));
                meet(grid.at(x, y), grid.at(x, y + 1));
                meet(grid.at(x, y), grid.at(x + 1, y + 1));
                meet(grid.at(x + 1, y), grid.at(x, y + 1));
            }
        }
        api.neighbours = new Map();
        stones.forEach(function (s, i) {
            api.neighbours.set(s.li, Object.keys(touch[i] || {}).filter(function (k) { return stones[k]; }).map(function (k) { return stones[k].li; }));
        });

        function shape(id) {
            var pts = loops[id].filter(function (p) { return shared[p[0] + ',' + p[1]]; }).map(function (p) { return moved[p[0] + ',' + p[1]]; });
            var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
            var left = Math.floor(Math.min.apply(null, xs)), top = Math.floor(Math.min.apply(null, ys));
            var local = pts.map(function (p) { return [p[0] - left, p[1] - top]; });
            return { left: left, top: top, w: Math.ceil(Math.max.apply(null, xs)) - left, h: Math.ceil(Math.max.apply(null, ys)) - top, d: outline(local) };
        }
        function position(el, s) {
            el.style.cssText = 'left:' + (x0 + s.left) + 'px;top:' + (y0 + s.top) + 'px;width:' + s.w + 'px;height:' + s.h + 'px';
        }

        stones.forEach(function (stone, i) {
            if (!loops[i]) return;
            var s = shape(i);
            var spot = labelSpot(grid, i, height, stone.minCols);
            var a = stone.li.firstElementChild;
            position(stone.li, s);
            a.style.clipPath = 'path("' + s.d + '")';
            var pad = [spot.r * v - s.top + 2, s.left + s.w - (spot.c + spot.w) * u + 5, s.top + s.h - (spot.r + spot.h) * v + 2, spot.c * u - s.left + 5];
            a.style.padding = pad.map(function (n) { return Math.max(2, Math.round(n)) + 'px'; }).join(' ');
            a.style.backgroundImage = drawing(s.d, s.w, s.h);
        });

        function decoration(kind, s, picture) {
            var el = document.createElement('div');
            el.className = 'made-stone ' + kind;
            el.setAttribute('aria-hidden', 'true');
            position(el, s);
            el.style.clipPath = 'path("' + s.d + '")';
            el.style.backgroundImage = picture;
            page.appendChild(el);
        }
        fillers.forEach(function (id) { if (loops[id]) { var s = shape(id); decoration('packing-stone', s, drawing(s.d, s.w, s.h)); } });

        // the twelve-angled stone
        var hero = shape(HERO);
        decoration('hero-stone', hero, drawing(hero.d, hero.w, hero.h));
        page.setAttribute('data-hero-corners', heroCorners.length);

        // category boundaries: a wider pale seam wherever two categories meet
        var seam = '';
        Object.keys(loops).forEach(function (id) {
            if (!stones[id]) return;
            var corners = loops[id].filter(function (p) { return shared[p[0] + ',' + p[1]]; });
            corners.forEach(function (p, i) {
                var q = corners[(i + 1) % corners.length];
                // the first grid step from p toward q, and the cell on the far side of it
                var dx = Math.sign(q[0] - p[0]), dy = Math.sign(q[1] - p[1]);
                var one, two;
                if (dx) { var cx = dx > 0 ? p[0] : p[0] - 1; one = grid.at(cx, p[1] - 1); two = grid.at(cx, p[1]); }
                else { var cy = dy > 0 ? p[1] : p[1] - 1; one = grid.at(p[0] - 1, cy); two = grid.at(p[0], cy); }
                var other = String(one) === String(id) ? two : one;
                if (!stones[other] || stones[other].group === stones[id].group || Number(other) < Number(id)) return;
                var from = moved[p[0] + ',' + p[1]], to = moved[q[0] + ',' + q[1]];
                seam += 'M' + from[0].toFixed(1) + ' ' + from[1].toFixed(1) + 'L' + to[0].toFixed(1) + ' ' + to[1].toFixed(1);
            });
        });
        var lines = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        lines.setAttribute('class', 'made-stone category-seams');
        lines.setAttribute('aria-hidden', 'true');
        lines.setAttribute('width', width);
        lines.setAttribute('height', height * v);
        lines.style.cssText = 'left:' + x0 + 'px;top:' + y0 + 'px';
        lines.innerHTML = '<path d="' + seam + '" fill="none" stroke="#2b2118" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>' +
                          '<path d="' + seam + '" fill="none" stroke="#fffdf6" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>';
        page.appendChild(lines);
        page.setAttribute('data-seams', seam.split('M').length - 1);

        title.style.cssText = 'left:' + (x0 + hero.left) + 'px;top:' + (y0 + hero.top) + 'px;width:' + hero.w + 'px;height:' + hero.h + 'px';
        page.style.height = (y0 + height * v + 72) + 'px';
    }

    api.reset = function (wall) {
        var page = wall.closest('main');
        page.classList.remove('one-wall');
        page.removeAttribute('data-hero-corners');
        page.removeAttribute('data-seams');
        page.style.height = '';
        page.querySelector('header').style.cssText = '';
        Array.prototype.forEach.call(page.querySelectorAll('.made-stone'), function (el) { el.remove(); });
        wall.style.height = '';
        wall.classList.remove('built');
        Array.prototype.forEach.call(wall.children, function (li) {
            li.style.cssText = '';
            var a = li.firstElementChild;
            a.style.clipPath = '';
            a.style.backgroundImage = '';
            a.style.padding = '';
        });
        api.neighbours = null;
    };
    api.apply = function () {
        if (document.body.getAttribute('data-style') === 'polygonal') build(document.querySelector('main'));
    };
    return api;
})();
