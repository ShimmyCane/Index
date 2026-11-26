// Home page: a heart in the upper right of every tile. Your favourites are saved on this device.
window.Hearts = (function () {
    var STORE = 'index-favs';
    var HALF = 17;   // half the heart's tap area, as set in the stylesheet
    var favourites = [];
    try { favourites = JSON.parse(localStorage.getItem(STORE) || '[]') || []; } catch (e) { favourites = []; }

    // A tile can be any shape, so the heart looks for the spot nearest the upper right that is
    // inside the shape and clear of the words.
    var pen = document.createElement('canvas').getContext('2d');

    function length(text, whole) {
        var total = 0;
        (text.match(/[+-]?\s*[\d.]+(px|%)?/g) || []).forEach(function (part) {
            var clean = part.replace(/\s+/g, '');
            var n = parseFloat(clean);
            total += clean.indexOf('%') >= 0 ? n / 100 * whole : n;
        });
        return total;
    }
    // the tile's cut shape as a path in its own box, or null when it is a plain box
    function shapeOf(a) {
        var clip = getComputedStyle(a).clipPath;
        var w = a.offsetWidth, h = a.offsetHeight;
        var path = clip.match(/^path\((?:\w+,\s*)?"(.*)"\)/);
        if (path) return new Path2D(path[1]);
        if (clip.indexOf('polygon(') !== 0) {
            var round = getComputedStyle(a).borderTopRightRadius;
            if (round === '50%') { var oval = new Path2D(); oval.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, 7); return oval; }
            return null;
        }
        var poly = new Path2D();
        clip.slice(8, -1).split(/,(?![^(]*\))/).forEach(function (pair, i) {
            var bits = pair.trim().match(/calc\([^)]*\)|\S+/g);
            var x = length(bits[0], w), y = length(bits[1], h);
            if (i) poly.lineTo(x, y); else poly.moveTo(x, y);
        });
        poly.closePath();
        return poly;
    }

    function place(li) {
        var heart = li.querySelector('.heart');
        var a = li.querySelector('a');
        if (!heart || !a.offsetWidth) return;
        var w = a.offsetWidth, h = a.offsetHeight;
        var shape = shapeOf(a);
        var box = a.getBoundingClientRect();
        var range = document.createRange();
        range.selectNodeContents(a);
        var words = Array.prototype.map.call(range.getClientRects(), function (t) {
            return { l: t.left - box.left, t: t.top - box.top + 3, r: t.right - box.left, b: t.bottom - box.top - 3 };
        });
        function fits(x, y, r, clear) {
            if (x - r < 0 || y - r < 0 || x + r > w || y + r > h) return false;
            if (shape) {
                for (var k = 0; k < 8; k++) {
                    if (!pen.isPointInPath(shape, x + Math.cos(k * Math.PI / 4) * r, y + Math.sin(k * Math.PI / 4) * r)) return false;
                }
            }
            return !clear || words.every(function (t) {
                return Math.hypot(x - Math.max(t.l, Math.min(x, t.r)), y - Math.max(t.t, Math.min(y, t.b))) >= r - 1;
            });
        }
        // stickers are tilted, so their heart is pinned on the corner like a second little sticker
        if (document.body.getAttribute('data-style') === 'sticker') {
            heart.style.left = (a.offsetLeft + w - 15) + 'px';
            heart.style.top = (a.offsetTop - 19) + 'px';
            return;
        }
        var best = null;
        [[17, true], [14, true], [12, true], [11, false]].some(function (rule) {
            var score = Infinity;
            for (var y = rule[0] + 1; y <= h - rule[0]; y += 3) {
                for (var x = w - rule[0] - 1; x >= rule[0]; x -= 3) {
                    var s = (w - x) + y * 1.6;
                    if (s < score && fits(x, y, rule[0], rule[1])) { score = s; best = [x, y]; }
                }
            }
            return !!best;
        });
        if (!best) best = [w - 15, 15];
        heart.style.left = Math.round(a.offsetLeft + best[0] - HALF) + 'px';
        heart.style.top = Math.round(a.offsetTop + best[1] - HALF) + 'px';
    }

    function show(heart, href, name) {
        var loved = favourites.indexOf(href) >= 0;
        heart.setAttribute('aria-pressed', String(loved));
        heart.setAttribute('aria-label', (loved ? 'Remove ' : 'Add ') + name + (loved ? ' from favourites' : ' to favourites'));
        heart.parentNode.classList.toggle('loved', loved);
    }

    var tiles = Array.prototype.slice.call(document.querySelectorAll('.wall li'));
    tiles.forEach(function (li) {
        var a = li.querySelector('a');
        var href = a.getAttribute('href');
        var heart = document.createElement('button');
        heart.type = 'button';
        heart.className = 'heart';   // the heart itself is drawn by the stylesheet
        li.appendChild(heart);
        show(heart, href, a.textContent.trim());
        heart.addEventListener('click', function () {
            var at = favourites.indexOf(href);
            if (at >= 0) favourites.splice(at, 1); else favourites.push(href);
            try { localStorage.setItem(STORE, JSON.stringify(favourites)); } catch (e) { /* storage blocked */ }
            show(heart, href, a.textContent.trim());
        });
    });

    function placeAll() { tiles.forEach(place); }
    document.addEventListener('tiles-drawn', placeAll);
    window.addEventListener('load', placeAll);
    window.addEventListener('resize', function () { setTimeout(placeAll, 90); });
    placeAll();

    return { place: place, placeAll: placeAll };
})();
