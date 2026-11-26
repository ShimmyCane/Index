// Home page: order the Nursery tiles by how often they are opened on this device.
(function () {
    var TRACK_KEY = 'nursery-clicks';
    var SHAPES = ['hex', 'tri', 'chev', 'dia', 'pent', 'notch', 'para'];
    var SIZES = ['w2 h2', 'w2', ''];
    var nurseryWall = document.getElementById('nursery-wall');
    if (!nurseryWall) return;

    // The ⚙️ switch (pull request #279) turns the ordering by visits off and on.
    var REORDER_KEY = 'nursery-reorder';
    var toggle = document.getElementById('reorder-toggle');
    // Remember the original order and sizes so turning it off can restore them.
    var originals = Array.from(nurseryWall.querySelectorAll('li[data-track]')).map(function (li) {
        return { li: li, cls: li.getAttribute('class') };
    });

    function getReorderOn() {
        try { return localStorage.getItem(REORDER_KEY) !== 'off'; } catch (e) { return true; }
    }
    function setReorderOn(on) {
        try { localStorage.setItem(REORDER_KEY, on ? 'on' : 'off'); } catch (e) { /* storage blocked */ }
    }
    // an order you dragged yourself (arrange.js) wins over both
    function draggedOrder() {
        try { return !!JSON.parse(localStorage.getItem('index-order') || '{}').Nursery; } catch (e) { return false; }
    }

    function getClicks(trackId) {
        try {
            var data = JSON.parse(localStorage.getItem(TRACK_KEY) || '{}');
            return data[trackId] || 0;
        } catch (e) { return 0; }
    }

    function incrementClick(trackId) {
        try {
            var data = JSON.parse(localStorage.getItem(TRACK_KEY) || '{}');
            data[trackId] = (data[trackId] || 0) + 1;
            localStorage.setItem(TRACK_KEY, JSON.stringify(data));
        } catch (e) { /* storage blocked */ }
    }

    function reorganizeNursery() {
        if (draggedOrder()) return;
        var items = Array.from(nurseryWall.querySelectorAll('li[data-track]'));
        items.sort(function (a, b) {
            return getClicks(b.getAttribute('data-track')) - getClicks(a.getAttribute('data-track'));
        });

        items.forEach(function (item, index) {
            var oldClasses = item.getAttribute('class') || '';
            var newClass = SIZES[Math.min(index, SIZES.length - 1)];
            if (newClass) {
                item.setAttribute('class', newClass + ' ' + (oldClasses.match(/data-\w+/) ? oldClasses.match(/data-\w+/)[0] : ''));
            }
            nurseryWall.appendChild(item);
        });
    }

    function restoreNursery() {
        var keep = draggedOrder();
        originals.forEach(function (o) {
            if (o.cls === null) o.li.removeAttribute('class');
            else o.li.setAttribute('class', o.cls);
            if (!keep) nurseryWall.appendChild(o.li);
        });
    }

    function applyReorder(on) {
        if (toggle) {
            toggle.setAttribute('aria-pressed', String(on));
            toggle.textContent = 'Reorder & favourites: ' + (on ? 'on' : 'off');
        }
        if (on) reorganizeNursery();
        else restoreNursery();
    }

    nurseryWall.addEventListener('click', function (e) {
        var link = e.target.closest('a[href]');
        if (link && getReorderOn()) {
            var li = link.closest('li[data-track]');
            if (li) {
                incrementClick(li.getAttribute('data-track'));
                setTimeout(reorganizeNursery, 100);
            }
        }
    });

    if (toggle) {
        toggle.addEventListener('click', function () {
            var on = !getReorderOn();
            setReorderOn(on);
            applyReorder(on);
            // redraw, so the cut and built styles follow the new order and sizes
            if (window.TileColors) window.TileColors.refresh();
        });
    }

    applyReorder(getReorderOn());
})();
