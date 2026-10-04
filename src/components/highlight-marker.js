// -----------------------------------------
// HIGHLIGHT MARKER TEXT REVEAL
// Based on Osmo's "Highlight Marker Text Reveal": each line of text is covered by
// a highlighter bar that scales away when the element scrolls into view.
//
// Unlike Osmo's version, the text is never split or restyled: the lines are
// measured where the browser already draws them, and the bars are drawn in an
// overlay on top. So line breaks, heading heights and text trimming stay exactly
// as designed, and ascenders / descenders are never clipped.
//
// Webflow setup: add  data-highlight-marker-reveal  to a text element (a heading,
// or a Rich Text wrapper).
// Optional attributes (Osmo's):
//   data-marker-direction      right (default) | left | up | down
//   data-marker-theme          bar colour: a swatch name (e.g. insight-blue), a CSS
//                              variable (--my-colour) or any CSS colour / gradient;
//                              default is the brand gradient set in highlight-marker.css
//   data-marker-scroll-start   ScrollTrigger start, default "top 90%"
//   data-marker-stagger        ms between lines, default 100
//   data-marker-stagger-start  "end" to start from the last line
//
// Plays once. initHighlightMarker(scope) / destroyHighlightMarker(scope)
// -----------------------------------------

gsap.registerPlugin(ScrollTrigger);

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
        if (reduceMotion) { show(); return; }

        const direction = el.getAttribute("data-marker-direction") || defaults.direction;
        const background = resolveBackground(el.getAttribute("data-marker-theme"));
        const scrollStart = el.getAttribute("data-marker-scroll-start") || defaults.scrollStart;
        const staggerStart = el.getAttribute("data-marker-stagger-start") || defaults.staggerStart;
        const staggerOffset = (parseFloat(el.getAttribute("data-marker-stagger")) || defaults.stagger) / 1000;
        const dirConfig = directionMap[direction] || directionMap.right;

        // Overlay for the bars, on top of the (untouched) text
        const setPosition = getComputedStyle(el).position === "static";
        if (setPosition) el.style.position = "relative";
        const overlay = document.createElement("div");
        overlay.className = "hm-overlay";
        overlay.setAttribute("aria-hidden", "true");
        el.appendChild(overlay);

        const state = { timeline: null, trigger: null, played: false };

        // Where the browser draws each line of text, relative to the overlay
        function measureLines() {
            const box = el.getBoundingClientRect();
            const originX = box.left + el.clientLeft, originY = box.top + el.clientTop;
            const range = document.createRange();
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
                acceptNode: n => (n.parentElement.closest(".hm-overlay") || !n.textContent.trim())
                    ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
            });

            // Each text node can span several lines; merge the pieces that share a line
            const lines = [];
            for (let node = walker.nextNode(); node; node = walker.nextNode()) {
                range.selectNodeContents(node);
                for (const r of range.getClientRects()) {
                    if (!r.width || !r.height) continue;
                    const mid = (r.top + r.bottom) / 2;
                    const line = lines.find(l => mid > l.top && mid < l.bottom);
                    if (line) {
                        line.left = Math.min(line.left, r.left); line.right = Math.max(line.right, r.right);
                        line.top = Math.min(line.top, r.top); line.bottom = Math.max(line.bottom, r.bottom);
                    } else {
                        lines.push({ left: r.left, right: r.right, top: r.top, bottom: r.bottom });
                    }
                }
            }
            lines.sort((a, b) => a.top - b.top);

            // Keep a small gap between bars where tight line spacing makes them overlap.
            // The gap comes out of the top of the lower bar (there's spare room above the
            // tallest letters), never the bottom of the upper one (its descenders).
            for (let i = 0; i < lines.length - 1; i++) {
                const a = lines[i], b = lines[i + 1];
                const gap = Math.max(2, 0.04 * (a.bottom - a.top));
                if (a.bottom > b.top - gap) b.top = Math.min(a.bottom + gap, b.bottom - 1);
            }

            return lines.map(l => ({ left: l.left - originX, top: l.top - originY, width: l.right - l.left, height: l.bottom - l.top }));
        }

        function build() {
            state.timeline?.kill();
            state.trigger?.kill();
            overlay.replaceChildren();

            // Already revealed: nothing to cover any more
            if (state.played) { show(); return; }

            const lines = measureLines();
            const tl = gsap.timeline({ paused: true, onComplete: () => { state.played = true; overlay.replaceChildren(); } });

            lines.forEach((line, i) => {
                const bar = document.createElement("div");
                bar.className = "hm-bar";
                Object.assign(bar.style, {
                    left: line.left + "px", top: line.top + "px",
                    width: line.width + "px", height: line.height + "px",
                    transformOrigin: dirConfig.origin,
                });
                if (background) bar.style.background = background;
                overlay.appendChild(bar);

                const staggerIndex = staggerStart === "end" ? lines.length - 1 - i : i;
                tl.to(bar, {
                    [dirConfig.prop]: 0,
                    duration: defaults.barDuration,
                    ease: defaults.barEase,
                }, staggerIndex * staggerOffset);
            });

            // Bars now cover the text, so the element can be shown
            show();

            state.timeline = tl;
            state.trigger = ScrollTrigger.create({
                trigger: el,
                start: scrollStart,
                once: true,
                onEnter: () => tl.play(),
            });
        }

        build();

        // Re-measure when the element's size changes (e.g. the text re-wraps)
        let queued = false, lastWidth = el.offsetWidth;
        const resizeObserver = new ResizeObserver(() => {
            if (queued || state.played || el.offsetWidth === lastWidth) return;
            queued = true;
            requestAnimationFrame(() => {
                queued = false;
                lastWidth = el.offsetWidth;
                // don't interrupt a reveal that's already playing
                if (!state.timeline || state.timeline.progress() === 0) build();
            });
        });
        resizeObserver.observe(el);

        highlightMarkers.push({
            el,
            destroy() {
                resizeObserver.disconnect();
                state.timeline?.kill();
                state.trigger?.kill();
                overlay.remove();
                if (setPosition) el.style.position = "";
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

// Runs once per page load, after fonts are ready so the lines are measured correctly
// (scope/teardown functions above are available if ever needed).
const bootHighlightMarker = () => document.fonts.ready.then(() => initHighlightMarker());
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootHighlightMarker); else bootHighlightMarker();
