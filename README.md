# NoteIQ site code

Custom JS/CSS for the NoteIQ marketing site (Webflow), served by a static-assets-only Cloudflare Worker (`noteiq`, configured in `wrangler.jsonc`) and deployed with Workers Builds. GSAP and its plugins, Lenis and Barba are loaded by Webflow's own custom code, not by this repo.

## Layout

- `src/main.js`, `src/main.css`: fixed underlay nav setup
- `src/barba.js`: page transitions; always bundled last
- `src/animations/`: NoteIQ animations (`data-niq-anim`)
- `src/components/`: other site components
- `build.mjs`: build config and **load order** (add new files to the `JS` / `CSS` lists there)
- `wrangler.jsonc`: Worker config; serves `dist/` as static assets
- `webflow/loader.html`: the snippet pasted into Webflow
- `assets/videos/`: source videos (not deployed)

## Develop

```sh
npm install
npm run dev     # builds, watches src/, serves dist/ at http://localhost:8000
npm run build   # minified dist/bundle.js + dist/bundle.css
```

## Workflow

1. Work on the `staging` branch and push. Workers Builds builds it and uploads a preview version (its URL is in the Cloudflare dashboard); production is not affected.
2. Preview on the `.webflow.io` domain. The loader serves the staging build there.
3. Test in a browser, then merge `staging` into `main` and push. Workers Builds deploys `main` to production, which the live domain loads.

`dist/` is not committed. Workers Builds runs `npm run build`, then deploys `dist/` as set in `wrangler.jsonc`.

> The URLs in `webflow/loader.html` still point at the old Pages hosts and will be updated to the Worker URLs after the first deploy.

## Webflow setup

Paste `webflow/loader.html` into Site settings > Custom code > Footer code ("Before `</body>` tag"). It must come **after** Webflow's GSAP, Lenis and Barba script tags, because the bundle uses them as soon as it runs.
