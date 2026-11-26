// Home page: the settings gear and the style picker.
(function () {
    var body = document.body;
    var gear = document.getElementById('gear');
    var panel = document.getElementById('panel');
    var options = panel.querySelectorAll('button[data-style]');
    var KEY = 'index-style';

    function setStyle(name) {
        body.setAttribute('data-style', name);
        options.forEach(function (b) {
            b.setAttribute('aria-pressed', String(b.getAttribute('data-style') === name));
        });
        try { localStorage.setItem(KEY, name); } catch (e) { /* storage blocked */ }
    }

    function togglePanel(open) {
        panel.hidden = !open;
        gear.setAttribute('aria-expanded', String(open));
    }

    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) { /* storage blocked */ }
    setStyle(saved && panel.querySelector('[data-style="' + saved + '"]') ? saved : 'geometric');

    gear.addEventListener('click', function () { togglePanel(panel.hidden); });
    options.forEach(function (b) {
        b.addEventListener('click', function () { setStyle(b.getAttribute('data-style')); });
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') togglePanel(false);
    });
})();
