// Home page: order the Nursery tiles by how often they are opened on this device.
(function () {
    var TRACK_KEY = 'nursery-clicks';
    var SHAPES = ['hex', 'tri', 'chev', 'dia', 'pent', 'notch', 'para'];
    var SIZES = ['w2 h2', 'w2', ''];
    var nurseryWall = document.getElementById('nursery-wall');
    if (!nurseryWall) return;

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
        // an order you dragged yourself (arrange.js) wins over the click order
        try { if (JSON.parse(localStorage.getItem('index-order') || '{}').Nursery) return; } catch (e) { /* storage blocked */ }
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

    nurseryWall.addEventListener('click', function (e) {
        var link = e.target.closest('a[href]');
        if (link) {
            var li = link.closest('li[data-track]');
            if (li) {
                incrementClick(li.getAttribute('data-track'));
                setTimeout(reorganizeNursery, 100);
            }
        }
    });

    reorganizeNursery();
})();
