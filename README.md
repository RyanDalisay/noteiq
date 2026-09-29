# NoteIQ site code

Custom JS/CSS for the NoteIQ marketing site (Webflow), hosted on Cloudflare Pages (project `noteiq`). GSAP and its plugins, Lenis and Barba are loaded by Webflow's own custom code, not by this repo.

## Layout

- `src/main.js`, `src/main.css`: fixed underlay nav setup
- `src/barba.js`: page transitions; always bundled last
- `src/animations/`: NoteIQ animations (`data-niq-anim`)
- `src/components/`: other site components
- `build.mjs`: build config and **load order** (add new files to the `JS` / `CSS` lists there)
- `webflow/loader.html`: the snippet pasted into Webflow
- `assets/videos/`: source videos (not deployed)

## Develop

```sh
npm install
npm run dev     # builds, watches src/, serves dist/ at http://localhost:8000
npm run build   # minified dist/bundle.js + dist/bundle.css
```

## Workflow

1. Work on the `staging` branch and push. Cloudflare Pages deploys it to https://staging.noteiq.pages.dev.
2. Preview on the `.webflow.io` domain. The loader serves staging there.
3. Test in a browser, then merge `staging` into `main`. Pages deploys https://noteiq.pages.dev, which the live domain loads.

`dist/` is not committed. Cloudflare Pages builds it itself (build command `npm run build`, output directory `dist`).

## Webflow setup

Paste `webflow/loader.html` into Site settings > Custom code > Footer code ("Before `</body>` tag"). It must come **after** Webflow's GSAP, Lenis and Barba script tags, because the bundle uses them as soon as it runs.
