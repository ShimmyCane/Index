// Home page: colour the tiles like countries on a map. Tiles that touch never share a colour,
// and the order does not repeat in a pattern. Each style has its own palette.
// A tile's own colour in index.html (--c) is only the fallback if this script does not run.
(function () {
    var BRIGHT = ['#ff6b6b', '#ffb02e', '#ff6fb2', '#2ec4a0', '#a193f7', '#5aa2ff', '#b6e34a'];
    var PALETTES = {
        geometric: BRIGHT,
        sticker: BRIGHT,
        stamps: BRIGHT,
        pixel: BRIGHT,
        // the wooden toy: red, yellow, blue, green and white
        bauhaus: ['#c4161c', '#f5c211', '#1f2a72', '#4a6a24', '#ecece6'],
        // the bright colours the wall had before
        polygonal: ['#ff6b6b', '#ffb02e', '#ff4fa3', '#2ec4a0', '#8a7cf0', '#3d8bff', '#b6e34a', '#ff9e8a', '#8fe0bd']
    };

    function hash(text) {
        var h = 2166136261;
        for (var i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
        return h >>> 0;
    }

    // Two tiles are neighbours when their boxes are close and sit side by side or one above the other.
    function touching(a, b, reach) {
        var gapX = Math.max(a.x, b.x) - Math.min(a.x + a.w, b.x + b.w);
        var gapY = Math.max(a.y, b.y) - Math.min(a.y + a.h, b.y + b.h);
        return gapX <= reach && gapY <= reach && (gapX < -8 || gapY < -8);
    }

    // black or white lettering, whichever reads better on the colour
    function lettering(colour) {
        var n = parseInt(colour.slice(1), 16);
        var light = 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
        return light > 140 ? '#17171c' : '#ffffff';
    }

    function paint(tile, colour) {
        tile.style.setProperty('--tile', colour);
        tile.style.setProperty('--on', lettering(colour));
    }

    function colourWall(tiles, palette, reach) {
        var used = palette.map(function () { return 0; });
        var placed = [];
        var last = -1;
        Array.prototype.forEach.call(tiles, function (li) {
            // offset values ignore the tilt and hover transforms
            var box = { x: li.offsetLeft, y: li.offsetTop, w: li.offsetWidth, h: li.offsetHeight };
            // the stone wall knows exactly who touches whom; elsewhere, measure the boxes
            var exact = window.Masonry && window.Masonry.neighbours && window.Masonry.neighbours.get(li);
            var near = placed.filter(function (p) { return exact ? exact.indexOf(p.li) >= 0 : touching(box, p, reach); });
            var seed = hash(li.textContent.trim());
            var best = 0, bestScore = Infinity;
            palette.forEach(function (colour, i) {
                var clash = near.filter(function (p) { return p.colour === i; }).length;
                // avoid neighbours first, then the previous tile's colour, then the most used colours
                var score = clash * 1000 + (i === last ? 100 : 0) + used[i] * 10 + ((seed >>> (i * 3)) & 7);
                if (score < bestScore) { bestScore = score; best = i; }
            });
            used[best]++;
            last = best;
            box.colour = best;
            box.li = li;
            placed.push(box);
            paint(li.firstElementChild, palette[best]);
        });
    }

    var REACH = { sticker: 40, stamps: 40, polygonal: 6 };

    function refresh() {
        var style = document.body.getAttribute('data-style');
        var walls = Array.prototype.slice.call(document.querySelectorAll('.wall'));
        var builders = [window.Masonry, window.Bauhaus].filter(Boolean);
        // clear every built layout first, then build the one for this style
        walls.forEach(function (wall) { builders.forEach(function (b) { b.reset(wall); }); });
        builders.forEach(function (b) { b.apply(); });
        // the polygonal wall is a single map; the other styles colour each section by itself
        var maps = style === 'polygonal' ? [document.querySelectorAll('.wall li')] : walls.map(function (w) { return w.children; });
        maps.forEach(function (tiles) {
            colourWall(tiles, PALETTES[style] || BRIGHT, REACH[style] || 18);
        });
        // a rearranged ship keeps the colours it was saved with
        walls.forEach(function (wall) {
            (wall.pieces || []).forEach(function (p) {
                if (p.rec && p.rec.colour) paint(p.li.firstElementChild, p.rec.colour);
            });
        });
        document.dispatchEvent(new CustomEvent('tiles-drawn'));
    }

    window.TileColors = {
        refresh: refresh,
        paint: paint,
        palette: function (style) { return PALETTES[style] || BRIGHT; }
    };

    var timer = null;
    function soon() {
        clearTimeout(timer);
        timer = setTimeout(refresh, 60);
    }

    // redo the walls when the style changes, the Nursery tiles reorder, or the width changes
    new MutationObserver(refresh).observe(document.body, { attributes: true, attributeFilter: ['data-style'] });
    Array.prototype.forEach.call(document.querySelectorAll('.wall'), function (wall) {
        new MutationObserver(soon).observe(wall, { childList: true });
    });
    var width = window.innerWidth;
    window.addEventListener('resize', function () {
        if (window.innerWidth !== width) { width = window.innerWidth; soon(); }
    });

    refresh();
})();
