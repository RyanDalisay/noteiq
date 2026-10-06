// -----------------------------------------
// COUNT UP
// Counts a number in the text up from 0 when the element scrolls into view
// (its top 90% down the screen): fast at first, easing into the final value.
//
// Webflow setup: add the class  niq-count-up  (e.g. in a Lumos component's
// Classes prop) or the attribute  data-count-up  to the text element. The first
// number in its text is animated; the words around it stay ("50 hours",
// "17.5 hours", "$1,200"). Decimals and thousands separators are kept.
// Optional attributes:
//   data-count-from       start value (default 0)
//   data-count-duration   seconds (default 2)
//
// The final text is in the HTML, so without JavaScript (or with reduced
// motion) the real number simply shows.
// initCountUp(scope) / destroyCountUp(scope)
// -----------------------------------------

gsap.registerPlugin(ScrollTrigger);

const countUps = []; // { el, destroy }

function initCountUp(scope = document) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    scope.querySelectorAll(".niq-count-up, [data-count-up]").forEach((el) => {
        if (countUps.some(c => c.el === el)) return;

        // The text node holding the first number
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let node, match;
        while ((node = walker.nextNode())) {
            match = node.nodeValue.match(/\d[\d,]*(\.\d+)?/);
            if (match) break;
        }
        if (!node || !match) return;

        const raw = match[0];
        const target = parseFloat(raw.replace(/,/g, ""));
        const decimals = match[1] ? match[1].length - 1 : 0;
        const grouped = raw.includes(",");
        const from = parseFloat(el.getAttribute("data-count-from")) || 0;
        const duration = parseFloat(el.getAttribute("data-count-duration")) || 2;
        const format = n => grouped
            ? n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
            : n.toFixed(decimals);

        // Put the number in its own span, sized to the final value, so the
        // surrounding (centered) text doesn't shift while the digits change
        const before = node.nodeValue.slice(0, match.index);
        const after = node.nodeValue.slice(match.index + raw.length);
        const span = document.createElement("span");
        span.className = "cu-num";
        span.textContent = raw;
        const parent = node.parentNode;
        parent.insertBefore(document.createTextNode(before), node);
        parent.insertBefore(span, node);
        parent.insertBefore(document.createTextNode(after), node);
        parent.removeChild(node);
        span.style.minWidth = span.getBoundingClientRect().width + "px";

        const counter = { value: from };
        span.textContent = format(from);

        const tween = gsap.to(counter, {
            value: target,
            duration,
            ease: "expo.out",
            paused: true,
            onUpdate: () => { span.textContent = format(counter.value); },
            onComplete: () => { span.textContent = raw; },
        });
        const trigger = ScrollTrigger.create({
            trigger: el,
            start: "top 90%",
            once: true,
            onEnter: () => tween.play(),
        });

        countUps.push({
            el,
            destroy() {
                trigger.kill();
                tween.kill();
                span.replaceWith(document.createTextNode(raw));
                el.normalize();
            },
        });
    });
}

function destroyCountUp(scope = document) {
    for (let i = countUps.length - 1; i >= 0; i--) {
        const c = countUps[i];
        if (scope !== document && !scope.contains(c.el)) continue;
        c.destroy();
        countUps.splice(i, 1);
    }
}

// Runs once per page load, after fonts are ready so the reserved width matches
// the final number (scope/teardown functions above are available if ever needed)
const bootCountUp = () => document.fonts.ready.then(() => initCountUp());
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootCountUp); else bootCountUp();
