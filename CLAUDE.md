# NoteIQ site code

Custom JS/CSS for the NoteIQ Webflow site, bundled with esbuild (`build.mjs`) and served by a static-assets-only Cloudflare Worker (`wrangler.jsonc`, deployed by Workers Builds): `staging` builds the preview at https://staging-noteiq.ryan-200.workers.dev (loaded on `*.webflow.io`), `main` deploys production at https://noteiq.ryan-200.workers.dev (loaded everywhere else). See README.md for the workflow.

## Build

- `npm run build` writes `dist/bundle.js` and `dist/bundle.css`; `npm run dev` watches and serves `dist/` on :8000.
- Load order lives in the `JS` / `CSS` lists in `build.mjs`. New files must be added there. `src/barba.js` stays last.
- JS files are concatenated into one scope before bundling, so top-level names must be unique across files (the build fails otherwise). barba.js calls some of them by name.
- GSAP (and plugins), Lenis and Barba are globals from Webflow's custom code. Don't bundle or import them.
- The bundle is injected by `webflow/loader.html`, usually after DOMContentLoaded has fired. Initialize with `if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();`, never a bare DOMContentLoaded listener.

## Project rules

- Every NoteIQ animation mounts on an empty Div with `data-niq-anim="<name>"` and has its own class prefix (`na-` hero, `at-` transcription, `gc-` compliance, `ii-` interface, `lt-` threads, `ot-` thread-bg). Never style or animate the mount Div itself; Webflow interactions control its opacity and transform.
- Scripts must work with Barba: initialize on first load AND inside a container passed from barba.js (`initAfterEnterFunctions`). Anything continuous (loops, observers, drag or scroll listeners) needs a teardown called from `afterLeave`.
- NoteIQ animations register with `window.NIQAnims` (automatic mount and cleanup via MutationObserver). They must pause off-screen, respect `prefers-reduced-motion`, and set their own ease and duration on every tween, because the site sets global GSAP defaults (barba.js).
- Don't modify global Lumos classes; scope everything.
- Test changes in a browser before committing.
