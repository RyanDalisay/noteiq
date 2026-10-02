// -----------------------------------------
// OSMO PAGE TRANSITION BOILERPLATE
// -----------------------------------------

gsap.registerPlugin(CustomEase);

history.scrollRestoration = "manual";

let lenis = null;
let nextPage = document;
let onceFunctionsInitialized = false;

const hasLenis = typeof window.Lenis !== "undefined";
const hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";

const rmMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
let reducedMotion = rmMQ.matches;
rmMQ.addEventListener?.("change", e => (reducedMotion = e.matches));
rmMQ.addListener?.(e => (reducedMotion = e.matches));

const has = (s) => !!nextPage.querySelector(s);

let staggerDefault = 0.05;
let durationDefault = 0.6;

CustomEase.create("osmo", "0.625, 0.05, 0, 1");
gsap.defaults({ ease: "osmo", duration: durationDefault });



// -----------------------------------------
// FUNCTION REGISTRY
// -----------------------------------------

function initOnceFunctions() {
    initLenis();
    if (onceFunctionsInitialized) return;
    onceFunctionsInitialized = true;

    // Runs once on first load
    // if (has('[data-something]')) initSomething();
}

function initBeforeEnterFunctions(next) {
    nextPage = next || document;

    // Runs before the enter animation
    // if (has('[data-something]')) initSomething();

    // NoteIQ animations (Odyn): set up the new page's animations before it fades in.
    // The animation files also do this automatically; calling it here just guarantees
    // the order. Safe to call more than once.
    if (has('[data-niq-anim]')) initNoteIQAnimations(nextPage);
}

function initAfterEnterFunctions(next) {
    nextPage = next || document;

    // Runs after enter animation completes
    // if (has('[data-something]')) initSomething();

    // Draggable marquee: measured after the new page is in its final layout
    if (has('[data-draggable-marquee-init]') && typeof initDraggableMarquee === "function") {
        initDraggableMarquee(nextPage);
    }

    // Interactive dots grid: canvases are sized to the new page's final layout
    if (has('[data-dots-canvas-init]') && typeof initInteractiveDotsGridBackground === "function") {
        initInteractiveDotsGridBackground(nextPage);
    }


    if (hasLenis) {
        lenis.resize();
    }

    if (hasScrollTrigger) {
        ScrollTrigger.refresh();
    }
}



// -----------------------------------------
// PAGE TRANSITIONS
// -----------------------------------------

function runPageOnceAnimation(next) {
    const tl = gsap.timeline();

    tl.call(() => {
        resetPage(next);
    }, null, 0);

    return tl;
}

function runPageLeaveAnimation(current, next) {

    const tl = gsap.timeline({
        onComplete: () => {
            current.remove();
        }
    });

    if (reducedMotion) {
        // Immediate swap behavior if user prefers reduced motion
        return tl.set(current, { autoAlpha: 0 });
    }

    tl.to(current, {
        autoAlpha: 0,
        ease: "power1.in",
        duration: 0.5,
    }, 0);

    return tl;
}

function runPageEnterAnimation(next) {
    const tl = gsap.timeline();

    if (reducedMotion) {
        // Immediate swap behavior if user prefers reduced motion
        tl.set(next, { autoAlpha: 1 });
        tl.add("pageReady");
        tl.call(resetPage, [next], "pageReady");
        return new Promise(resolve => tl.call(resolve, null, "pageReady"));
    }

    tl.add("startEnter", 0);

    tl.fromTo(next, {
        autoAlpha: 0,
    }, {
        autoAlpha: 1,
        ease: "power1.inOut",
        duration: 0.75,
    }, "startEnter");

    // Animate the h1 in — guarded so pages without an h1 don't throw
    const heading = next.querySelector('h1');
    if (heading) {
        tl.fromTo(heading, {
            yPercent: 25,
            autoAlpha: 0,
        }, {
            yPercent: 0,
            autoAlpha: 1,
            ease: "expo.out",
            duration: 1,
        }, "< 0.3");
    }

    tl.add("pageReady");
    tl.call(resetPage, [next], "pageReady");

    return new Promise(resolve => {
        tl.call(resolve, null, "pageReady");
    });
}



// -----------------------------------------
// BARBA HOOKS + INIT
// -----------------------------------------

barba.hooks.beforeEnter(data => {
    // Position new container on top
    gsap.set(data.next.container, {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
    });

    if (lenis && typeof lenis.stop === "function") {
        lenis.stop();
    }

    initBeforeEnterFunctions(data.next.container);
    applyThemeFrom(data.next.container);
});

barba.hooks.afterLeave(data => {
    // Tear down page scripts that keep running on their own (loops, drag listeners)
    if (typeof destroyDraggableMarquee === "function") {
        destroyDraggableMarquee(data.current.container);
    }

    if (typeof destroyInteractiveDotsGridBackground === "function") {
        destroyInteractiveDotsGridBackground(data.current.container);
    }

    if (hasScrollTrigger) {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    }
});

barba.hooks.enter(data => {
    initBarbaNavUpdate(data);
});

barba.hooks.afterEnter(data => {
    // Run page functions
    initAfterEnterFunctions(data.next.container);

    // Restart Webflow interactions (scroll fades etc.) for the new page
    reinitWebflow(data);

    // Settle
    if (hasLenis) {
        lenis.resize();
        lenis.start();
    }

    if (hasScrollTrigger) {
        ScrollTrigger.refresh();
    }
});

barba.init({
    debug: true, // Set to 'false' in production
    timeout: 7000,
    preventRunning: true,
    transitions: [
        {
            name: "default",
            sync: true,

            // First load
            async once(data) {
                initOnceFunctions();

                return runPageOnceAnimation(data.next.container);
            },

            // Current page leaves
            async leave(data) {
                return runPageLeaveAnimation(data.current.container, data.next.container);
            },

            // New page enters
            async enter(data) {
                return runPageEnterAnimation(data.next.container);
            }
        }
    ],
});



// -----------------------------------------
// GENERIC + HELPERS
// -----------------------------------------

const themeConfig = {
    light: {
        nav: "dark",
        transition: "light"
    },
    dark: {
        nav: "light",
        transition: "dark"
    }
};

function applyThemeFrom(container) {
    const pageTheme = container?.dataset?.pageTheme || "light";
    const config = themeConfig[pageTheme] || themeConfig.light;

    document.body.dataset.pageTheme = pageTheme;
    const transitionEl = document.querySelector('[data-theme-transition]');
    if (transitionEl) {
        transitionEl.dataset.themeTransition = config.transition;
    }

    const nav = document.querySelector('[data-theme-nav]');
    if (nav) {
        nav.dataset.themeNav = config.nav;
    }
}

function initLenis() {
    if (lenis) return; // already created
    if (!hasLenis) return;

    lenis = new Lenis({
        lerp: 0.165,
        wheelMultiplier: 1.25,
    });

    if (hasScrollTrigger) {
        lenis.on("scroll", ScrollTrigger.update);
    }

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
}

function resetPage(container) {
    window.scrollTo(0, 0);
    // Clear everything the transition set on the container (position from
    // beforeEnter, opacity/visibility from the autoAlpha fade), so it matches a fresh load
    gsap.set(container, { clearProps: "position,top,left,right,opacity,visibility" });

    if (hasLenis) {
        lenis.resize();
        lenis.start();
    }
}

function debounceOnWidthChange(fn, ms) {
    let last = innerWidth,
        timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            if (innerWidth !== last) {
                last = innerWidth;
                fn.apply(this, args);
            }
        }, ms);
    };
}

function initBarbaNavUpdate(data) {
    var tpl = document.createElement('template');
    tpl.innerHTML = data.next.html.trim();
    var nextNodes = tpl.content.querySelectorAll('[data-barba-update]');
    var currentNodes = document.querySelectorAll('nav [data-barba-update]');

    currentNodes.forEach(function (curr, index) {
        var next = nextNodes[index];
        if (!next) return;

        // Aria-current sync
        var newStatus = next.getAttribute('aria-current');
        if (newStatus !== null) {
            curr.setAttribute('aria-current', newStatus);
        } else {
            curr.removeAttribute('aria-current');
        }

        // Class list sync
        var newClassList = next.getAttribute('class') || '';
        curr.setAttribute('class', newClassList);
    });
}



// -----------------------------------------
// NOTEIQ ANIMATIONS + WEBFLOW INTERACTIONS
// -----------------------------------------

// Mounts any NoteIQ animations inside the new container (hero, transcription,
// compliance, interface, threads, thread-bg). Old containers are cleaned up
// automatically when Barba removes them.
function initNoteIQAnimations(container) {
    if (window.NIQAnims && typeof window.NIQAnims.mount === "function") {
        window.NIQAnims.mount(container || document);
    }
}

// Webflow keys its interactions (IX2) to the page ID on <html data-wf-page>.
// After a Barba swap, hand it the new page's ID and restart the engine so
// scroll-triggered fades (and other Webflow components) work on the new page.
function reinitWebflow(data) {
    if (!window.Webflow) return;

    try {
        var doc = new DOMParser().parseFromString(data.next.html, "text/html");
        var pageId = doc.documentElement.getAttribute("data-wf-page");
        if (pageId) document.documentElement.setAttribute("data-wf-page", pageId);
    } catch (e) { /* keep the current page id if parsing fails */ }

    window.Webflow.destroy();
    window.Webflow.ready();

    var ix2 = window.Webflow.require && window.Webflow.require("ix2");
    if (ix2 && typeof ix2.init === "function") ix2.init();
}
