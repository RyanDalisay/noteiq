# noteiq

A live mirror of an [Odyn](https://app.odyn.dev) project. Synced one-way from Odyn to GitHub on every successful production deploy, so every version of your code is preserved in your own repository.

**Latest version:** v7
**Deployed:** 2026-09-29T18:07:15.548Z

## Layout

- `src/` — current project source. Mirrors what you write in the Odyn editor.
- `dist/v1/` … `dist/v7/` — built artifacts for each deploy. Versions accumulate; nothing here is ever overwritten.
- `dist/latest/` — built artifacts for v7 (the most recent deploy). Overwritten on every deploy; files no longer produced are removed.
- Each deploy commit is tagged `v{n}`.

## One-way mirror

Odyn is the source of truth. Edits made in this repo will **not** sync back to Odyn — they will be overwritten by the next deploy. Clone the repo any time to inspect the project locally, browse version history, or mirror the artifacts to other hosts.

## Serve from jsDelivr (optional)

If this repo is **public** on GitHub, [jsDelivr](https://www.jsdelivr.com/github) will serve any file under `dist/` over a free global CDN. This is in addition to your Odyn-hosted CDN URLs, not a replacement — the URLs in the Odyn dashboard are faster, with proper cache invalidation.

For jsDelivr embeds in production, **always pin to a version tag**. Tagged URLs are immutable and cached forever; branch-path URLs (`@main/dist/latest/...`) are cached for up to 12 hours, so they lag your deploys.

### Pinned to v7 (recommended for jsDelivr — immutable, cached forever)

- `transcription.js` → https://cdn.jsdelivr.net/gh/RyanDalisay/noteiq@v7/dist/v7/transcription.js
- `main.js` → https://cdn.jsdelivr.net/gh/RyanDalisay/noteiq@v7/dist/v7/main.js
- `progress-nav.js` → https://cdn.jsdelivr.net/gh/RyanDalisay/noteiq@v7/dist/v7/progress-nav.js
- `radial-gsap-slider.js` → https://cdn.jsdelivr.net/gh/RyanDalisay/noteiq@v7/dist/v7/radial-gsap-slider.js
- `scaling-scroll.js` → https://cdn.jsdelivr.net/gh/RyanDalisay/noteiq@v7/dist/v7/scaling-scroll.js
- `table-of-contents.js` → https://cdn.jsdelivr.net/gh/RyanDalisay/noteiq@v7/dist/v7/table-of-contents.js
- `tabsystemautoplay.js` → https://cdn.jsdelivr.net/gh/RyanDalisay/noteiq@v7/dist/v7/tabsystemautoplay.js
- `thread-bg.js` → https://cdn.jsdelivr.net/gh/RyanDalisay/noteiq@v7/dist/v7/thread-bg.js
- `threads.js` → https://cdn.jsdelivr.net/gh/RyanDalisay/noteiq@v7/dist/v7/threads.js
- `barba.js` → https://cdn.jsdelivr.net/gh/RyanDalisay/noteiq@v7/dist/v7/barba.js
- `compliance.js` → https://cdn.jsdelivr.net/gh/RyanDalisay/noteiq@v7/dist/v7/compliance.js
- `draggable-marquee.js` → https://cdn.jsdelivr.net/gh/RyanDalisay/noteiq@v7/dist/v7/draggable-marquee.js

…and 19 more under `dist/v7/`.

`dist/latest/` is best used for direct GitHub raw, GitHub Pages, or local checkout — not for jsDelivr-fronted production traffic.

If this repo is private, jsDelivr cannot reach it — keep using your Odyn-hosted CDN URLs.
