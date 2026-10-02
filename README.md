# NoteIQ site code

Custom JS/CSS for the NoteIQ marketing site (Webflow), served by a static-assets-only Cloudflare Worker (`noteiq`, configured in `wrangler.jsonc`) and deployed with Workers Builds. GSAP and its plugins and Lenis are loaded by Webflow's own custom code, not by this repo. Every page is a full page load; page transitions are CSS cross-document View Transitions, and links are prerendered on hover (both in `webflow/head.html`).

## Layout

- `src/main.js`, `src/main.css`: fixed underlay nav setup
- `src/site.js`: GSAP defaults and Lenis smooth scroll; always bundled first
- `src/animations/`: NoteIQ animations (`data-niq-anim`)
- `src/components/`: other site components
- `build.mjs`: build config and **load order** (add new files to the `JS` / `CSS` lists there)
- `wrangler.jsonc`: Worker config; serves `dist/` as static assets
- `webflow/head.html`, `webflow/footer.html`: the snippets pasted into Webflow
- `assets/videos/`: source videos (not deployed)

## Develop

```sh
npm install
npm run dev     # builds, watches src/, serves dist/ at http://localhost:8000
npm run build   # minified dist/bundle.js + dist/bundle.css
```

## Workflow

1. Work on the `staging` branch and push. Workers Builds builds it as a preview of the Worker at https://staging-noteiq.ryan-200.workers.dev; production is not affected.
2. Preview on the `.webflow.io` domain. The Webflow snippets load the staging preview there.
3. Test in a browser, then merge `staging` into `main` and push. Workers Builds deploys `main` to production at https://noteiq.ryan-200.workers.dev, which every other domain (including the live site) loads.

`dist/` is not committed. Workers Builds runs `npm run build`, then deploys `dist/` as set in `wrangler.jsonc`.

## Webflow setup

Two snippets go in Site settings > Custom code:

- `webflow/head.html` goes in Head code ("Inside `<head>` tag"). It sets up the page transitions (CSS cross-document View Transitions: a cross-fade between pages with the nav held still, off for reduced motion) and prerenders same-site links on hover (speculation rules). It also picks the host (staging on `*.webflow.io`, production everywhere else), stores it on `window.__niqBase`, preconnects to both Worker hosts, and loads `bundle.css`. The transition CSS is inline on purpose: it has to be there before the new page's first paint.
- `webflow/footer.html` goes in Footer code ("Before `</body>` tag"). It loads `bundle.js` from `window.__niqBase`, and checks the hostname itself if that is missing. It must come **after** Webflow's GSAP and Lenis script tags, because the bundle uses them as soon as it runs.


