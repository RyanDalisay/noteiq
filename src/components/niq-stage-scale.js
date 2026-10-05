// -----------------------------------------
// NIQ STAGE SCALE
// The NoteIQ animations draw on a fixed-size artboard (the "-stage" element,
// e.g. 1000 x 1500) scaled to fit their mount. The CSS used to work the scale
// out on its own with scale(tan(atan2(100cqw, 1000px))), but Safari on iOS 26
// evaluates that wrongly for some sizes (negative, too large: the artwork is
// drawn off the panel). So the scale is measured here instead and handed to
// the CSS as --niq-scale on the stage; the CSS formula stays as the fallback.
// Bundled after the animations, so their stages already exist.
// initNiqStageScale(scope)
// -----------------------------------------

const niqStageScaleObserver = window.ResizeObserver ? new ResizeObserver((entries) => {
    entries.forEach(entry => setNiqStageScale(entry.target, entry.contentRect.width));
}) : null;

function setNiqStageScale(mount, width) {
    const stage = mount.querySelector('[class*="-stage"]');
    if (!stage || !stage.offsetWidth) return;
    // width: the mount's content box, which is what 100cqw measured
    stage.style.setProperty("--niq-scale", width / stage.offsetWidth);
}

function initNiqStageScale(scope = document) {
    scope.querySelectorAll("[data-niq-mounted]").forEach((mount) => {
        if (mount._niqScaled) return;
        mount._niqScaled = true;

        const cs = getComputedStyle(mount);
        setNiqStageScale(mount, mount.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));
        if (niqStageScaleObserver) niqStageScaleObserver.observe(mount);
    });
}

// Runs once per page load, and again whenever an animation mounts later
// (the shared NIQAnims registry marks mounts with data-niq-mounted)
const bootNiqStageScale = () => {
    initNiqStageScale();
    new MutationObserver(() => initNiqStageScale())
        .observe(document.body, { subtree: true, attributes: true, attributeFilter: ["data-niq-mounted"] });
};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootNiqStageScale); else bootNiqStageScale();
