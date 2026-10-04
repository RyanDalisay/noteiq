// -----------------------------------------
// HIGHLIGHT MARKER TEXT REVEAL
// Based on Osmo's "Highlight Marker Text Reveal": each line of text is covered by
// a highlighter bar that scales away when the element scrolls into view.
//
// Webflow setup: add  data-highlight-marker-reveal  to a text element.
// Optional attributes (Osmo's):
//   data-marker-direction      right (default) | left | up | down
//   data-marker-theme          bar colour: a swatch name (e.g. insight-blue), a CSS
//                              variable (--my-colour) or any CSS colour / gradient;
//                              default is the brand gradient set in highlight-marker.css
//   data-marker-scroll-start   ScrollTrigger start, default "top 90%"
//   data-marker-stagger        ms between lines, default 100
//   data-marker-stagger-start  "end" to start from the last line
//
// Skips text that another script already splits (gradient wave text, line reveal
// testimonials). Plays once; re-splits (resize, fonts) keep revealed text revealed.
// initHighlightMarker(scope) / destroyHighlightMarker(scope)
// -----------------------------------------

gsap.registerPlugin(ScrollTrigger, SplitText);

const highlightMarkers = []; // { el, destroy }

function initHighlightMarker(scope = document) {
    const defaults = {
        direction: "right",
        scrollStart: "top 90%",
        staggerStart: "start",
        stagger: 100,
        barDuration: 0.6,
        barEase: "power3.inOut",
    };

    const directionMap = {
        right: { prop: "scaleX", origin: "right center" },
        left: { prop: "scaleX", origin: "left center" },
        up: { prop: "scaleY", origin: "center top" },
        down: { prop: "scaleY", origin: "center bottom" },
    };

    // Text another script already splits: leave it alone
    const SPLIT_ELSEWHERE = "[data-gradient-wave-text], [data-testimonial-split]";

    // Swatch name, CSS variable, or raw CSS colour / gradient. Empty = CSS default gradient.
    function resolveBackground(value) {
        if (!value) return "";
        if (value.startsWith("--")) return `var(${value})`;
        if (/^[a-z0-9-]+$/i.test(value) && !CSS.supports("color", value)) return `var(--swatch--${value})`;
        return value;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    scope.querySelectorAll("[data-highlight-marker-reveal]").forEach((el) => {
        if (highlightMarkers.some(h => h.el === el)) return;

        const show = () => gsap.set(el, { autoAlpha: 1 });
        if (reduceMotion || el.closest(SPLIT_ELSEWHERE) || el.querySelector(SPLIT_ELSEWHERE)) { show(); return; }

        const direction = el.getAttribute("data-marker-direction") || defaults.direction;
        const background = resolveBackground(el.getAttribute("data-marker-theme"));
        const scrollStart = el.getAttribute("data-marker-scroll-start") || defaults.scrollStart;
        const staggerStart = el.getAttribute("data-marker-stagger-start") || defaults.staggerStart;
        const staggerOffset = (parseFloat(el.getAttribute("data-marker-stagger")) || defaults.stagger) / 1000;
        const dirConfig = directionMap[direction] || directionMap.right;

        const state = { timeline: null, trigger: null, played: false };

        const split = SplitText.create(el, {
            type: "lines",
            linesClass: "hm-line",
            autoSplit: true,
            onSplit(self) {
                // Teardown the previous build (autoSplit re-splits on resize / font load)
                state.timeline?.kill();
                state.trigger?.kill();
                el.querySelectorAll(".hm-bar").forEach(bar => bar.remove());

                const lines = self.lines;
                const tl = gsap.timeline({ paused: true, onComplete: () => { state.played = true; } });

                lines.forEach((line, i) => {
                    gsap.set(line, { position: "relative", overflow: "hidden" });

                    const bar = document.createElement("div");
                    bar.className = "hm-bar";
                    bar.style.transformOrigin = dirConfig.origin;
                    if (background) bar.style.background = background;
                    line.appendChild(bar);

                    const staggerIndex = staggerStart === "end" ? lines.length - 1 - i : i;
                    tl.to(bar, {
                        [dirConfig.prop]: 0,
                        duration: defaults.barDuration,
                        ease: defaults.barEase,
                    }, staggerIndex * staggerOffset);
                });

                // Bars now cover the text, so the element can be shown
                show();

                // Already revealed before this re-split: stay revealed, don't replay
                if (state.played) { tl.progress(1); state.timeline = tl; return; }

                state.timeline = tl;
                state.trigger = ScrollTrigger.create({
                    trigger: el,
                    start: scrollStart,
                    once: true,
                    onEnter: () => tl.play(),
                });
            },
        });

        highlightMarkers.push({
            el,
            destroy() {
                state.timeline?.kill();
                state.trigger?.kill();
                el.querySelectorAll(".hm-bar").forEach(bar => bar.remove());
                split.revert();
                gsap.set(el, { clearProps: "visibility,opacity" });
            },
        });
    });
}

function destroyHighlightMarker(scope = document) {
    for (let i = highlightMarkers.length - 1; i >= 0; i--) {
        const h = highlightMarkers[i];
        if (scope !== document && !scope.contains(h.el)) continue;
        h.destroy();
        highlightMarkers.splice(i, 1);
    }
}

// Runs once per page load, after fonts are ready so the lines split correctly
// (scope/teardown functions above are available if ever needed).
const bootHighlightMarker = () => document.fonts.ready.then(() => initHighlightMarker());
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootHighlightMarker); else bootHighlightMarker();
