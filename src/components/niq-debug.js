// -----------------------------------------
// NIQ DEBUG PANEL (only with ?niq-debug=1 in the URL)
// For checking the animations on a real device: shows, for every
// [data-niq-anim] mount, its size, the artboard ("-stage") scale, opacity and
// CSS animation state, the GSAP timeline time, plus device info and any
// JavaScript errors. "Copy" puts the report on the clipboard to paste back.
// Bundled right after site.js so it catches errors from everything after it.
// -----------------------------------------

const niqDebugErrors = [];

function initNiqDebug() {
    if (!/[?&]niq-debug=1\b/.test(location.search)) return;

    window.addEventListener("error", e => niqDebugErrors.push(`${e.message} @ ${(e.filename || "").split("/").pop()}:${e.lineno}`));
    window.addEventListener("unhandledrejection", e => niqDebugErrors.push(`promise: ${e.reason && (e.reason.message || e.reason)}`));

    const panel = document.createElement("div");
    panel.style.cssText = "position:fixed;left:8px;right:8px;bottom:8px;z-index:2147483647;max-height:55vh;overflow:auto;" +
        "background:rgba(15,23,42,.94);color:#e2e8f0;font:11px/1.45 ui-monospace,Menlo,monospace;padding:10px;border-radius:10px;" +
        "-webkit-user-select:text;user-select:text;";
    const bar = document.createElement("div");
    bar.style.cssText = "display:flex;gap:8px;margin-bottom:8px;";
    const button = (label, onClick) => {
        const b = document.createElement("button");
        b.textContent = label;
        b.style.cssText = "font:600 12px system-ui;padding:6px 10px;border-radius:6px;border:0;background:#5d3fd3;color:#fff;";
        b.addEventListener("click", onClick);
        bar.appendChild(b);
        return b;
    };
    const pre = document.createElement("pre");
    pre.style.cssText = "margin:0;white-space:pre-wrap;word-break:break-word;";
    panel.append(bar, pre);

    const round = n => Math.round(n * 10) / 10;

    function report() {
        const lines = [
            `UA: ${navigator.userAgent}`,
            `viewport ${innerWidth}x${innerHeight} dpr ${devicePixelRatio} scrollY ${Math.round(scrollY)}`,
            `reduced motion: ${matchMedia("(prefers-reduced-motion: reduce)").matches}`,
            `css trig+cqw: ${CSS.supports("transform", "scale(tan(atan2(100cqw, 1000px)))")}  container-type: ${CSS.supports("container-type", "inline-size")}`,
            `gsap ${window.gsap ? gsap.version : "MISSING"}  ScrollTrigger ${!!window.ScrollTrigger}  NIQAnims ${!!window.NIQAnims}`,
            "",
        ];

        document.querySelectorAll("[data-niq-anim]").forEach((mount) => {
            const r = mount.getBoundingClientRect();
            const cs = getComputedStyle(mount);
            lines.push(`■ ${mount.getAttribute("data-niq-anim")}  class="${mount.className}"`);
            lines.push(`  mount ${round(r.width)}x${round(r.height)} at y=${Math.round(r.top + scrollY)} display:${cs.display} opacity:${cs.opacity} visibility:${cs.visibility} onscreen:${r.bottom > 0 && r.top < innerHeight}`);

            const stage = mount.querySelector('[class*="-stage"]');
            if (stage) {
                const s = getComputedStyle(stage);
                const sr = stage.getBoundingClientRect();
                const anims = stage.getAnimations ? stage.getAnimations().map(a => `${a.animationName || "anim"}:${a.playState}`).join(",") : "n/a";
                lines.push(`  stage .${[...stage.classList].join(".")} css ${s.width}x${s.height} drawn ${round(sr.width)}x${round(sr.height)}`);
                lines.push(`  transform: ${s.transform}`);
                lines.push(`  opacity:${s.opacity} visibility:${s.visibility} animations:[${anims}]`);
            } else {
                lines.push(`  no stage element (children: ${mount.children.length})`);
            }

            const tl = mount._niq;
            if (tl && tl.time) lines.push(`  timeline t=${tl.time().toFixed(2)} paused:${tl.paused()}`);
            const svg = mount.querySelector("svg");
            if (svg) { const vr = svg.getBoundingClientRect(); lines.push(`  first svg drawn ${round(vr.width)}x${round(vr.height)}`); }
            lines.push("");
        });

        lines.push(`errors (${niqDebugErrors.length}):`);
        niqDebugErrors.forEach(e => lines.push(`  ${e}`));
        return lines.join("\n");
    }

    let paused = false;
    button("Copy", function () {
        const text = report();
        const done = () => { this.textContent = "Copied"; setTimeout(() => (this.textContent = "Copy"), 1500); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done, () => { selectReport(); });
        } else selectReport();
    });
    button("Pause", function () { paused = !paused; this.textContent = paused ? "Resume" : "Pause"; });
    button("Hide", () => panel.remove());

    // Fallback when the clipboard API is blocked: select the text for a manual copy
    function selectReport() {
        const range = document.createRange();
        range.selectNodeContents(pre);
        const sel = getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    document.body.appendChild(panel);
    const update = () => { if (!paused) pre.textContent = report(); };
    update();
    setInterval(update, 1000);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initNiqDebug); else initNiqDebug();
