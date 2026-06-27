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
        onIncludesReady();
        return;
    }

    slots.forEach(function (slot) {
        fetch(slot.getAttribute('data-include'))
            .then(function (res) { return res.ok ? res.text() : ''; })
            .then(function (html) { slot.innerHTML = html; })
            .catch(function () { /* unserved (file://) or missing — leave empty */ })
            .finally(function () {
                remaining -= 1;
                if (remaining === 0) onIncludesReady();
            });
    });

    function onIncludesReady() {
        markActiveLink();
        initContactModal();
        loadHubSpotForms();
    }

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

    // Contact form modal
    function initContactModal() {
        var lb = document.getElementById('contact-form');
        if (!lb) return;
        var closeBtn = lb.querySelector('.lightbox__close');
        var lastFocus = null;

        function open(trigger) {
            lastFocus = trigger || document.activeElement;
            lb.hidden = false;
            void lb.offsetWidth;
            lb.classList.add('is-open');
            document.body.style.overflow = 'hidden';
            if (closeBtn) closeBtn.focus();
            document.addEventListener('keydown', onKey, true);
        }
        function close() {
            lb.classList.add('is-closing');
            lb.classList.remove('is-open');
            document.removeEventListener('keydown', onKey, true);
            document.body.style.overflow = '';
            setTimeout(function () {
                lb.hidden = true;
                lb.classList.remove('is-closing');
                if (lastFocus && lastFocus.focus) lastFocus.focus();
            }, 200);
        }
        function onKey(e) {
            if (e.key === 'Escape') { e.preventDefault(); close(); }
        }
        document.addEventListener('click', function (e) {
            var opener = e.target.closest('[data-open-modal="contact-form"]');
            if (opener) { e.preventDefault(); open(opener); return; }
            if (e.target.closest('#contact-form [data-close-modal]')) close();
        });
    }

    // Load HubSpot forms script if form containers exist
    function loadHubSpotForms() {
        if (document.querySelector('.hs-form-frame') && !document.querySelector('script[src*="hsforms"]')) {
            var script = document.createElement('script');
            script.src = 'https://js.hsforms.net/forms/embed/21395487.js';
            script.defer = true;
            document.body.appendChild(script);
        }
    }
});
