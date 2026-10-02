// -----------------------------------------
// DRAW PATH (Features page card connectors)
// Short gradient connectors from the bottom of each card to the top of the next,
// drawn as you scroll, with a soft glow. The card crossing the middle of the
// screen fades its outline to its own colour.
//
// Webflow setup:
//   [data-draw-path-card="insight-blue"]      on each card, in order, OR on any element
//                                             containing it (e.g. its section, handy when
//                                             the card is a component instance). The
//                                             outline that changes colour is the first
//                                             bordered element at or inside it. The value
//                                             is a swatch name (--swatch--<value>) or any
//                                             CSS colour.
//   [data-draw-path-wrap]                     optional: the element containing the cards;
//                                             defaults to the cards' common parent
//
// Inspired by Osmo's "Draw path on scroll", but the connectors are computed from
// the cards' live positions (so they line up at every width) and drawn with
// stroke-dashoffset (no DrawSVG plugin needed).
// initDrawPath(scope) / destroyDrawPath(scope)
// -----------------------------------------

gsap.registerPlugin(ScrollTrigger);

const drawPaths = []; // { wrap, destroy }

// The element whose outline changes colour: the marked element itself if it has a
// border, otherwise the first bordered element inside it
function drawPathOutlined(marker) {
    const hasBorder = (node) => {
        const cs = getComputedStyle(node);
        return parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== "none";
    };
    if (hasBorder(marker)) return marker;
    return [...marker.querySelectorAll("*")].find(hasBorder) || marker;
}

function initDrawPath(scope = document) {
    // Wrappers: explicit [data-draw-path-wrap] elements, plus the common parent of any
    // marked cards that aren't inside one
    const wraps = new Set(scope.querySelectorAll("[data-draw-path-wrap]"));
    scope.querySelectorAll("[data-draw-path-card]").forEach((marker) => {
        if (!marker.closest("[data-draw-path-wrap]") && marker.parentElement) wraps.add(marker.parentElement);
    });

    wraps.forEach((wrap) => {
        if (drawPaths.some(d => d.wrap === wrap)) return;

        // Marked elements in this wrapper (not nested inside another marked element)
        const markers = [...wrap.querySelectorAll("[data-draw-path-card]")]
            .filter(m => !m.parentElement.closest("[data-draw-path-card]"));
        if (markers.length < 2) return;
        const cards = markers.map(drawPathOutlined);

        const NS = "http://www.w3.org/2000/svg";
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const uid = "dp" + Math.random().toString(36).slice(2, 7);

        // Resolve a swatch name / CSS colour to rgb() so GSAP and SVG can use it
        function resolveColor(value, el) {
            const css = /[#(]/.test(value) ? value : `var(--swatch--${value})`;
            const probe = document.createElement("span");
            probe.style.color = css;
            el.appendChild(probe);
            const resolved = getComputedStyle(probe).color;
            probe.remove();
            return resolved;
        }

        const colors = markers.map((marker, i) => resolveColor(marker.getAttribute("data-draw-path-card"), cards[i]));
        const restingBorders = cards.map(card => getComputedStyle(card).borderTopColor);

        // One SVG layer over the wrapper; connectors only sit in the gaps between cards
        const setPosition = getComputedStyle(wrap).position === "static";
        if (setPosition) wrap.style.position = "relative";

        const svg = document.createElementNS(NS, "svg");
        svg.setAttribute("class", "dp-svg");
        svg.setAttribute("aria-hidden", "true");
        const defs = document.createElementNS(NS, "defs");
        svg.appendChild(defs);

        function el(tag, attrs, parent) {
            const node = document.createElementNS(NS, tag);
            for (const k in attrs) node.setAttribute(k, attrs[k]);
            if (parent) parent.appendChild(node);
            return node;
        }

        const connectors = cards.slice(0, -1).map((card, i) => {
            const grad = el("linearGradient", { id: `${uid}-g${i}`, gradientUnits: "userSpaceOnUse" }, defs);
            el("stop", { offset: "0", "stop-color": colors[i] }, grad);
            el("stop", { offset: "1", "stop-color": colors[i + 1] }, grad);
            const blur = el("filter", { id: `${uid}-f${i}`, filterUnits: "userSpaceOnUse" }, defs);
            el("feGaussianBlur", { stdDeviation: "5" }, blur);

            const g = el("g", { class: "dp-connector" }, svg);
            const glow = el("path", { class: "dp-glow", pathLength: "1", stroke: `url(#${grad.id})`, filter: `url(#${blur.id})` }, g);
            const line = el("path", { class: "dp-line", pathLength: "1", stroke: `url(#${grad.id})` }, g);
            return { grad, blur, glow, line, top: 0, bottom: 0 };
        });

        wrap.appendChild(svg);

        // Lay the connectors out from the cards' current positions
        function layout() {
            const w = wrap.getBoundingClientRect();
            svg.setAttribute("width", w.width);
            svg.setAttribute("height", w.height);
            svg.setAttribute("viewBox", `0 0 ${w.width} ${w.height}`);

            connectors.forEach((c, i) => {
                const a = cards[i].getBoundingClientRect();
                const b = cards[i + 1].getBoundingClientRect();
                const x = ((a.left + a.width / 2) + (b.left + b.width / 2)) / 2 - w.left;
                const y1 = a.bottom - w.top;
                const y2 = Math.max(y1, b.top - w.top);
                const d = `M${x.toFixed(1)} ${y1.toFixed(1)}V${y2.toFixed(1)}`;
                c.line.setAttribute("d", d);
                c.glow.setAttribute("d", d);
                c.grad.setAttribute("x1", x); c.grad.setAttribute("x2", x);
                c.grad.setAttribute("y1", y1); c.grad.setAttribute("y2", y2);
                for (const [k, v] of Object.entries({ x: x - 40, y: y1 - 40, width: 80, height: y2 - y1 + 80 })) c.blur.setAttribute(k, v);
                c.top = y1; c.bottom = y2;
            });
        }
        layout();

        const triggers = [];
        const wrapTop = () => wrap.getBoundingClientRect().top + window.scrollY;

        // Connectors: draw as each gap passes the middle of the screen (linear, scrubbed)
        connectors.forEach((c) => {
            const paths = [c.line, c.glow];
            // Tweened as an attribute: GSAP rounds px CSS values, and with pathLength=1
            // that would make the line pop in instead of drawing
            if (reduceMotion) { gsap.set(paths, { attr: { "stroke-dashoffset": 0 } }); return; }
            gsap.set(paths, { attr: { "stroke-dashoffset": 1 } });
            const tween = gsap.to(paths, {
                attr: { "stroke-dashoffset": 0 },
                ease: "none",
                duration: 1,
                scrollTrigger: {
                    trigger: wrap,
                    start: () => wrapTop() + c.top - window.innerHeight / 2,
                    end: () => wrapTop() + c.bottom - window.innerHeight / 2,
                    scrub: true,
                    invalidateOnRefresh: true,
                },
            });
            triggers.push(tween.scrollTrigger);
        });

        // Cards: the one crossing the middle of the screen takes its colour
        cards.forEach((card, i) => {
            triggers.push(ScrollTrigger.create({
                trigger: card,
                start: "top center",
                end: "bottom center",
                onToggle: (self) => {
                    gsap.to(card, {
                        borderColor: self.isActive ? colors[i] : restingBorders[i],
                        duration: reduceMotion ? 0 : 0.4,
                        ease: "power1.out",
                        overwrite: true,
                        onComplete: () => { if (!self.isActive) gsap.set(card, { clearProps: "borderColor" }); },
                    });
                },
            }));
        });

        // Re-lay out when the wrapper or any card changes size (fonts, images, breakpoints)
        let queued = false;
        const resizeObserver = new ResizeObserver(() => {
            if (queued) return;
            queued = true;
            requestAnimationFrame(() => { queued = false; layout(); ScrollTrigger.refresh(); });
        });
        [wrap, ...cards].forEach(node => resizeObserver.observe(node));

        drawPaths.push({
            wrap,
            destroy() {
                resizeObserver.disconnect();
                triggers.forEach(t => t && t.kill());
                connectors.forEach(c => gsap.killTweensOf([c.line, c.glow]));
                cards.forEach(card => { gsap.killTweensOf(card); gsap.set(card, { clearProps: "borderColor" }); });
                svg.remove();
                if (setPosition) wrap.style.position = "";
            },
        });
    });
}

function destroyDrawPath(scope = document) {
    for (let i = drawPaths.length - 1; i >= 0; i--) {
        const d = drawPaths[i];
        if (scope !== document && !scope.contains(d.wrap)) continue;
        d.destroy();
        drawPaths.splice(i, 1);
    }
}

// Runs once per page load (scope/teardown functions above are available if ever needed).
// Wrapped so the DOMContentLoaded event isn't passed in as `scope`.
const bootDrawPath = () => initDrawPath();
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootDrawPath); else bootDrawPath();
