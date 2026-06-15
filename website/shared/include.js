/**
 * Shared partial includes (nav + footer) + active-nav highlighting.
 *
 * Each page contains <div data-include="../shared/nav.html"></div> and a footer
 * equivalent. This fetches those files, injects them, then highlights the nav
 * link matching the current page's folder (e.g. /website/programs/ -> "Programs").
 *
 * Note: browsers block fetch() on file:// URLs, so the nav/footer only render
 * when the site is *served* (local server or the live host). Page copy shows
 * either way. In the WordPress build these partials are replaced by the theme
 * header/footer — see README.
 */
document.addEventListener('DOMContentLoaded', function () {
    var slots = document.querySelectorAll('[data-include]');
    var remaining = slots.length;

    if (remaining === 0) {
        markActiveLink();
        return;
    }

    slots.forEach(function (slot) {
        fetch(slot.getAttribute('data-include'))
            .then(function (res) { return res.ok ? res.text() : ''; })
            .then(function (html) { slot.innerHTML = html; })
            .catch(function () { /* unserved (file://) or missing — leave empty */ })
            .finally(function () {
                remaining -= 1;
                if (remaining === 0) markActiveLink();
            });
    });

    function markActiveLink() {
        // current page folder, e.g. ".../website/programs/index.html" -> "programs"
        var parts = location.pathname.replace(/\/index\.html$/, '').split('/').filter(Boolean);
        var current = parts[parts.length - 1] || 'homepage';
        document.querySelectorAll('.nav__link').forEach(function (link) {
            var href = link.getAttribute('href') || '';
            var seg = href.replace(/\/$/, '').split('/').filter(Boolean).pop();
            if (seg && seg === current) {
                link.classList.add('is-active');
            }
        });
    }
});
