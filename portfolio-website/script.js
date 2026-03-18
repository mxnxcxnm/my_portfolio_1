// script.js — Slide navigation engine

document.addEventListener('DOMContentLoaded', function () {

    // ── SECTION DEFINITIONS ──────────────────────────────
    // Each entry matches one group of slides in the HTML.
    // htmlSec is the number in slide-[htmlSec]-[page] IDs.
    const SECTIONS = [
        { htmlSec: 1, title: 'ABOUT ME',           pages: 2 },
        { htmlSec: 2, title: 'MY RESUME',          pages: 6 },
        { htmlSec: 3, title: 'BLVCKNODES & MEDIA', pages: 3 },
        { htmlSec: 4, title: 'PORTFOLIO PROJECTS', pages: 4 },
        { htmlSec: 5, title: 'NEXT BIG PROJECTS',  pages: 2 },
    ];

    let currentSec  = 0; // 0 = hero
    let currentPage = 0;

    // ── HELPERS ──────────────────────────────────────────
    function slideId(sec, page) {
        return `slide-${sec}-${page}`;
    }
    function bnavId(sec, page) {
        return `bnav-${sec}-${page}`;
    }
    function secInfo(htmlSec) {
        return SECTIONS.find(s => s.htmlSec === htmlSec) || null;
    }
    function pageCount(htmlSec) {
        if (htmlSec === 0) return 1;
        return secInfo(htmlSec)?.pages ?? 1;
    }

    // ── CORE NAVIGATION ──────────────────────────────────
    function goTo(sec, page) {
        const prev = document.getElementById(slideId(currentSec, currentPage));
        if (prev) prev.classList.remove('active');

        currentSec  = sec;
        currentPage = page;

        const next = document.getElementById(slideId(currentSec, currentPage));
        if (next) next.classList.add('active');

        updateAllNavs();
    }

    function navigate(dir) {
        let sec  = currentSec;
        let page = currentPage + dir;

        if (sec === 0) {
            // Hero: right only → first section
            if (dir === 1) goTo(1, 0);
            return;
        }

        if (page < 0) {
            // Step back to previous section's last page
            if (sec === 1) { goTo(0, 0); return; }
            const prevSec = sec - 1;
            goTo(prevSec, pageCount(prevSec) - 1);
        } else if (page >= pageCount(sec)) {
            // Step forward to next section's first page
            const nextSec = sec + 1;
            if (!secInfo(nextSec)) return; // already on last section
            goTo(nextSec, 0);
        } else {
            goTo(sec, page);
        }
    }

    // ── BOTTOM NAV BUILDER ───────────────────────────────
    function buildAllNavs() {
        document.querySelectorAll('.bottom-nav').forEach(nav => {
            nav.innerHTML = '';
            SECTIONS.forEach(sec => {
                const div = document.createElement('div');
                div.className = 'nav-section';

                const numEl   = document.createElement('span');
                numEl.className = 'section-num';
                numEl.textContent = sec.htmlSec;

                const titleEl = document.createElement('span');
                titleEl.className = 'section-title';
                titleEl.textContent = sec.title;
                titleEl.addEventListener('click', () => goTo(sec.htmlSec, 0));

                const dotsEl = document.createElement('div');
                dotsEl.className = 'page-dots';
                for (let p = 0; p < sec.pages; p++) {
                    const dot = document.createElement('span');
                    dot.className = 'dot';
                    dot.textContent = p + 1;
                    dot.dataset.sec  = sec.htmlSec;
                    dot.dataset.page = p;
                    dot.addEventListener('click', () => goTo(sec.htmlSec, p));
                    dotsEl.appendChild(dot);
                }

                div.appendChild(numEl);
                div.appendChild(titleEl);
                div.appendChild(dotsEl);
                nav.appendChild(div);
            });
        });
    }

    function updateAllNavs() {
        document.querySelectorAll('.bottom-nav').forEach(nav => {
            nav.querySelectorAll('.nav-section').forEach(div => {
                const titleEl = div.querySelector('.section-title');
                // Find which htmlSec this nav-section represents
                const firstDot = div.querySelector('.dot');
                if (!firstDot) return;
                const thisSec = parseInt(firstDot.dataset.sec);
                div.classList.toggle('active-section', thisSec === currentSec);
            });

            nav.querySelectorAll('.dot').forEach(dot => {
                const ds = parseInt(dot.dataset.sec);
                const dp = parseInt(dot.dataset.page);
                dot.classList.toggle('current-dot', ds === currentSec && dp === currentPage);
            });
        });
    }

    // ── ARROW VISIBILITY ─────────────────────────────────
    // Arrows are controlled by .hidden in HTML per-slide.
    // No JS needed — they're hardcoded correctly per slide.

    // ── KEYBOARD ─────────────────────────────────────────
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') navigate(1);
        if (e.key === 'ArrowLeft')  navigate(-1);
    });

    // ── WIRE UP ARROW BUTTONS ────────────────────────────
    // Arrow buttons use onclick="navigate(1)" in HTML,
    // but navigate() is defined here — expose it globally.
    window.navigate = navigate;
    window.goTo     = goTo;

    // ── INIT ─────────────────────────────────────────────
    buildAllNavs();
    updateAllNavs();
});
