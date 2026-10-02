gsap.registerPlugin(Observer, ScrollTrigger);

// -----------------------------------------
// DRAGGABLE MARQUEE
// initDraggableMarquee(scope)    → sets up every marquee inside `scope` (default: whole page)
// destroyDraggableMarquee(scope) → tears down every marquee inside `scope`
// -----------------------------------------

const draggableMarquees = []; // { wrapper, loop, observer, trigger, timeScaleTween }

function initDraggableMarquee(scope = document) {
    const wrappers = scope.querySelectorAll("[data-draggable-marquee-init]");

    const getNumberAttr = (el, name, fallback) => {
        const value = parseFloat(el.getAttribute(name));
        return Number.isFinite(value) ? value : fallback;
    };

    wrappers.forEach((wrapper) => {
        if (wrapper.getAttribute("data-draggable-marquee-init") === "initialized") return;

        const collection = wrapper.querySelector("[data-draggable-marquee-collection]");
        const list = wrapper.querySelector("[data-draggable-marquee-list]");
        if (!collection || !list) return;

        const duration = getNumberAttr(wrapper, "data-duration", 20);
        const multiplier = getNumberAttr(wrapper, "data-multiplier", 40);
        const sensitivity = getNumberAttr(wrapper, "data-sensitivity", 0.01);

        const wrapperWidth = wrapper.getBoundingClientRect().width;
        const listWidth = list.scrollWidth || list.getBoundingClientRect().width;
        if (!wrapperWidth || !listWidth) return;

        // Make enough duplicates to cover screen
        const minRequiredWidth = wrapperWidth + listWidth + 2;
        while (collection.scrollWidth < minRequiredWidth) {
            const listClone = list.cloneNode(true);
            listClone.setAttribute("data-draggable-marquee-clone", "");
            listClone.setAttribute("aria-hidden", "true");
            collection.appendChild(listClone);
        }

        const wrapX = gsap.utils.wrap(-listWidth, 0);

        gsap.set(collection, { x: 0 });

        const marqueeLoop = gsap.to(collection, {
            x: -listWidth,
            duration,
            ease: "none",
            repeat: -1,
            onReverseComplete: () => marqueeLoop.progress(1),
            modifiers: {
                x: (x) => wrapX(parseFloat(x)) + "px"
            },
        });

        // Direction can be used for css + set initial direction on load
        const initialDirectionAttr = (wrapper.getAttribute("data-direction") || "left").toLowerCase();
        const baseDirection = initialDirectionAttr === "right" ? -1 : 1;

        const timeScale = { value: 1 };

        timeScale.value = baseDirection;
        wrapper.setAttribute("data-direction", baseDirection < 0 ? "right" : "left");

        if (baseDirection < 0) marqueeLoop.progress(1);

        function applyTimeScale() {
            marqueeLoop.timeScale(timeScale.value);
            wrapper.setAttribute("data-direction", timeScale.value < 0 ? "right" : "left");
        }

        applyTimeScale();

        const instance = { wrapper, loop: marqueeLoop, observer: null, trigger: null, timeScale };

        // Drag observer
        instance.observer = Observer.create({
            target: wrapper,
            type: "pointer,touch",
            preventDefault: true,
            debounce: false,
            onChangeX: (observerEvent) => {
                let velocityTimeScale = observerEvent.velocityX * -sensitivity;
                velocityTimeScale = gsap.utils.clamp(-multiplier, multiplier, velocityTimeScale);

                gsap.killTweensOf(timeScale);

                const restingDirection = velocityTimeScale < 0 ? -1 : 1;

                gsap.timeline({ onUpdate: applyTimeScale })
                    .to(timeScale, { value: velocityTimeScale, duration: 0.1, overwrite: true })
                    .to(timeScale, { value: restingDirection, duration: 1.0 });
            }
        });

        // Pause marquee when scrolled out of view
        instance.trigger = ScrollTrigger.create({
            trigger: wrapper,
            start: "top bottom",
            end: "bottom top",
            onEnter: () => { marqueeLoop.resume(); applyTimeScale(); instance.observer.enable(); },
            onEnterBack: () => { marqueeLoop.resume(); applyTimeScale(); instance.observer.enable(); },
            onLeave: () => { marqueeLoop.pause(); instance.observer.disable(); },
            onLeaveBack: () => { marqueeLoop.pause(); instance.observer.disable(); }
        });

        draggableMarquees.push(instance);
        wrapper.setAttribute("data-draggable-marquee-init", "initialized");
    });
}

function destroyDraggableMarquee(scope = document) {
    for (let i = draggableMarquees.length - 1; i >= 0; i--) {
        const m = draggableMarquees[i];
        if (scope !== document && !scope.contains(m.wrapper)) continue;

        gsap.killTweensOf(m.timeScale);
        if (m.loop) m.loop.kill();
        if (m.observer) m.observer.kill();
        if (m.trigger) m.trigger.kill();

        // Put the markup back the way Webflow rendered it, so it can be set up again
        m.wrapper.querySelectorAll("[data-draggable-marquee-clone]").forEach((clone) => clone.remove());
        const collection = m.wrapper.querySelector("[data-draggable-marquee-collection]");
        if (collection) gsap.set(collection, { clearProps: "transform" });
        m.wrapper.setAttribute("data-draggable-marquee-init", "");

        draggableMarquees.splice(i, 1);
    }
}

// Runs once per page load (scope/teardown functions above are available if ever needed).
// Wrapped so the DOMContentLoaded event isn't passed in as `scope`.
const bootDraggableMarquee = () => initDraggableMarquee();
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootDraggableMarquee); else bootDraggableMarquee();
