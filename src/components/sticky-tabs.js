// -----------------------------------------
// STICKY TABS — replaces the Webflow IX2 "Layout 350 image N"
// interactions on the feature sticky tabs (/home-2).
// Each .feature-sticky-tabs_content block shows the matching panel (the Nth child
// of .feature-sticky-tabs_desktop-image-wrapper) while it crosses the middle of
// the screen. Desktop/tablet only (768px+), like the original interaction.
// While a block still has a Webflow interaction (data-w-id), this stays out of
// the way and lets Webflow run it.
// initStickyTabs(scope)    → sets up every sticky tabs component inside `scope`
// destroyStickyTabs(scope) → tears them down
// -----------------------------------------

gsap.registerPlugin(ScrollTrigger);

const stickyTabs = []; // { component, mm }

function initStickyTabs(scope = document) {
    scope.querySelectorAll(".feature-sticky-tabs_component").forEach((component) => {
        if (stickyTabs.some(t => t.component === component)) return;

        const blocks = [...component.querySelectorAll(".feature-sticky-tabs_content")];
        const wrapper = component.querySelector(".feature-sticky-tabs_desktop-image-wrapper");
        const panels = wrapper ? [...wrapper.children] : [];
        if (!blocks.length || !panels.length) return;
        if (blocks.some(block => block.hasAttribute("data-w-id"))) return; // Webflow interaction still in place

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const mm = gsap.matchMedia();

        mm.add("(min-width: 768px)", (context) => {
            let active = -1;

            // A named context method, so fades started later (from scroll callbacks)
            // are recorded too and undone by mm.revert()
            context.add("show", (index, immediate) => {
                index = Math.min(index, panels.length - 1);
                if (index === active) return;
                active = index;
                panels.forEach((panel, i) => {
                    gsap.to(panel, {
                        opacity: i === index ? 1 : 0,
                        duration: immediate || reduceMotion ? 0 : 0.5,
                        ease: "power1.inOut",
                        overwrite: true,
                    });
                });
            });

            // Start on the block that's already past the middle of the screen (or the first)
            const middle = window.innerHeight / 2;
            const startIndex = blocks.reduce((found, block, i) => block.getBoundingClientRect().top <= middle ? i : found, 0);
            context.show(startIndex, true);

            // Only switch when a block becomes active, so the first/last panel
            // stays up before the first block and after the last one
            blocks.forEach((block, i) => {
                ScrollTrigger.create({
                    trigger: block,
                    start: "top center",
                    end: "bottom center",
                    onToggle: self => self.isActive && context.show(i),
                });
            });
        });

        stickyTabs.push({ component, mm });
    });
}

function destroyStickyTabs(scope = document) {
    for (let i = stickyTabs.length - 1; i >= 0; i--) {
        const t = stickyTabs[i];
        if (scope !== document && !scope.contains(t.component)) continue;

        t.mm.revert(); // kills its ScrollTriggers and tweens, and removes the inline opacity
        stickyTabs.splice(i, 1);
    }
}

// Runs once per page load (scope/teardown functions above are available if ever needed).
// Wrapped so the DOMContentLoaded event isn't passed in as `scope`.
const bootStickyTabs = () => initStickyTabs();
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootStickyTabs); else bootStickyTabs();
