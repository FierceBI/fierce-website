/**
 * Curriculum carousel — center "peek" view, auto-advancing.
 *
 * Shows three cards at once: a scaled-down left and right peek with a full-size
 * card centered. Auto-advances right-to-left every 6s, pauses on hover and when
 * the tab is hidden, supports arrows / clickable dots / touch swipe, and loops
 * seamlessly using cloned cards at each end. Respects prefers-reduced-motion
 * (auto-advance off, manual controls only).
 */
(function () {
    var root = document.querySelector('[data-carousel]');
    if (!root) return;

    var viewport = root.querySelector('.carousel__viewport');
    var track = root.querySelector('.carousel__track');
    var dotsWrap = root.querySelector('[data-carousel-dots]');
    var prevBtn = root.querySelector('[data-carousel-prev]');
    var nextBtn = root.querySelector('[data-carousel-next]');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var DURATION = 800;     // must match the CSS transition
    var INTERVAL = 6000;    // auto-advance cadence
    var RESUME = 2000;      // resume delay after hover leaves
    var CLONES = 2;         // cloned cards at each end (peek + seamless wrap)

    var originals = Array.prototype.slice.call(track.children);
    var n = originals.length;
    if (n === 0) return;

    // Clone edges so the peek is filled at the ends and the loop is seamless.
    var firstChild = track.firstChild;
    originals.slice(n - CLONES).forEach(function (c) {            // head: last N, in order
        track.insertBefore(c.cloneNode(true), firstChild);
    });
    originals.slice(0, CLONES).forEach(function (c) {            // tail: first N, in order
        track.appendChild(c.cloneNode(true));
    });
    Array.prototype.slice.call(track.children).forEach(function (c, i) {
        if (i < CLONES || i >= CLONES + n) c.setAttribute('aria-hidden', 'true');
    });

    var cards = Array.prototype.slice.call(track.children);
    var FIRST = CLONES;          // DOM index of real card 0
    var LAST = CLONES + n - 1;   // DOM index of real card n-1
    var pos = FIRST;
    var timer = null, resumeTimer = null, locked = false;

    // Dots (one per real module)
    var dots = originals.map(function (_, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'carousel__dot';
        b.setAttribute('aria-label', 'Go to module ' + (i + 1));
        b.addEventListener('click', function () { go(FIRST + i, true); restart(); });
        dotsWrap.appendChild(b);
        return b;
    });

    function realIndex() { return ((pos - FIRST) % n + n) % n; }

    function render(animate) {
        track.style.transition = animate ? '' : 'none';
        var card = cards[pos];
        var x = viewport.clientWidth / 2 - (card.offsetLeft + card.offsetWidth / 2);
        track.style.transform = 'translateX(' + x + 'px)';
        cards.forEach(function (c, i) { c.classList.toggle('is-active', i === pos); });
        var ri = realIndex();
        dots.forEach(function (d, i) { d.classList.toggle('is-active', i === ri); });
        if (!animate) { void track.offsetWidth; track.style.transition = ''; }  // flush, then re-enable
    }

    function go(target, animate) {
        if (locked) return;
        pos = target;
        render(animate);
        if (pos > LAST || pos < FIRST) {            // landed on a clone — snap back seamlessly
            locked = true;
            setTimeout(function () {
                pos = pos > LAST ? FIRST + (pos - LAST - 1) : LAST - (FIRST - 1 - pos);
                render(false);
                locked = false;
            }, DURATION + 20);
        }
    }

    function next() { go(pos + 1, true); }
    function prev() { go(pos - 1, true); }

    function start() { if (reduce || timer) return; timer = setInterval(next, INTERVAL); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); if (resumeTimer) { clearTimeout(resumeTimer); resumeTimer = null; } start(); }

    // Pause on hover, resume shortly after leaving
    root.addEventListener('mouseenter', function () { stop(); if (resumeTimer) clearTimeout(resumeTimer); });
    root.addEventListener('mouseleave', function () {
        if (resumeTimer) clearTimeout(resumeTimer);
        resumeTimer = setTimeout(start, RESUME);
    });

    // Pause when the tab/window is not visible
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) stop(); else start();
    });

    nextBtn.addEventListener('click', function () { next(); restart(); });
    prevBtn.addEventListener('click', function () { prev(); restart(); });

    // Touch swipe (mobile)
    var startX = null;
    viewport.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; stop(); }, { passive: true });
    viewport.addEventListener('touchend', function (e) {
        if (startX === null) return;
        var dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 40) { if (dx < 0) next(); else prev(); }
        startX = null;
        restart();
    });

    // Keep centered on resize (no animation)
    var resizeT;
    window.addEventListener('resize', function () {
        clearTimeout(resizeT);
        resizeT = setTimeout(function () { render(false); }, 150);
    });

    function init() { render(false); start(); }
    if (document.readyState === 'complete') init();
    else window.addEventListener('load', init);
})();
