# NoteIQ site code

Custom JS/CSS for the NoteIQ Webflow site, bundled with esbuild (`build.mjs`) and served by a static-assets-only Cloudflare Worker (`wrangler.jsonc`, deployed by Workers Builds): `staging` builds the preview at https://staging-noteiq.ryan-200.workers.dev (loaded on `*.webflow.io`), `main` deploys production at https://noteiq.ryan-200.workers.dev (loaded everywhere else). See README.md for the workflow.

## Build

- `npm run build` writes `dist/bundle.js` and `dist/bundle.css`; `npm run dev` watches and serves `dist/` on :8000.
- Load order lives in the `JS` / `CSS` lists in `build.mjs`. New files must be added there. `src/site.js` stays first (it sets the global GSAP defaults and Lenis).
- JS files are concatenated into one scope before bundling, so top-level names must be unique across files (the build fails otherwise).
- GSAP (and plugins) and Lenis are globals from Webflow's custom code; don't bundle or import them.
- There is no Barba: every page is a full load, with CSS cross-document View Transitions and hover prerendering set up in `webflow/head.html`.
- The bundle is injected by `webflow/footer.html` (CSS by `webflow/head.html`), usually after DOMContentLoaded has fired. Initialize with `if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();`, never a bare DOMContentLoaded listener.

## Project rules

- Every NoteIQ animation mounts on an empty Div with `data-niq-anim="<name>"` and has its own class prefix (`na-` hero, `at-` transcription, `gc-` compliance, `ii-` interface, `lt-` threads, `ot-` thread-bg, `au-` audit). Never style or animate the mount Div itself from the animation code; Webflow interactions control its opacity and transform (on /home-2's sticky tabs, `src/components/sticky-tabs.js` controls the panels' opacity instead).
- Every page is a full page load, so scripts initialize once per page with the readyState pattern above; no page-swap re-init or teardown is needed. Prerendered pages run their scripts before they're shown, so don't start anything that depends on being visible until it is (IntersectionObserver-based pausing already handles this).
- NoteIQ animations register with `window.NIQAnims` (automatic mount and cleanup via MutationObserver). They must pause off-screen, respect `prefers-reduced-motion`, and set their own ease and duration on every tween, because the site sets global GSAP defaults (site.js).
- Don't modify global Lumos classes; scope everything.
- Test changes in a browser before committing.
