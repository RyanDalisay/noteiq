// -----------------------------------------
// SITE SETUP: GSAP defaults + Lenis smooth scroll
// Every page is a full page load; page transitions are CSS cross-document
// View Transitions (webflow/head.html), so this runs once per page.
// Bundled first so the GSAP defaults apply to everything after it.
// -----------------------------------------

// CustomEase is loaded by webflow/footer.html just before this bundle. If it's ever
// missing (e.g. mid-way through a custom-code change), fall back to a close ease
// rather than stopping the whole bundle.
if (typeof window.CustomEase !== "undefined") {
    gsap.registerPlugin(CustomEase);
    CustomEase.create("osmo", "0.625, 0.05, 0, 1");
    gsap.defaults({ ease: "osmo", duration: 0.6 });
} else {
    gsap.defaults({ ease: "power3.out", duration: 0.6 });
}

let lenis = null; // also used by table-of-contents.js to scroll to headings

function initLenis() {
    if (lenis || typeof window.Lenis === "undefined") return;

    lenis = new Lenis({
        lerp: 0.165,
        wheelMultiplier: 1.25,
    });

    if (typeof window.ScrollTrigger !== "undefined") {
        lenis.on("scroll", ScrollTrigger.update);
    }

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initLenis); else initLenis();
