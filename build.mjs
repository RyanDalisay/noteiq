// Builds dist/bundle.js and dist/bundle.css from src/.
//   node build.mjs          one-off minified build
//   node build.mjs --dev    build, watch src/, and serve dist/ locally
import * as esbuild from "esbuild";
import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";

const SRC = path.resolve("src");
const OUT = path.resolve("dist");

// Load order: site.js first (GSAP defaults + Lenis), then the Odyn v7 order.
const JS = [
  "site.js",
  "main.js",
  "components/gradientwavetext.js",
  "components/tabsystemautoplay.js",
  "components/linerevealtestimonials.js",
  "components/radial-gsap-slider.js",
  "components/table-of-contents.js",
  "components/scaling-scroll.js",
  "components/draggable-marquee.js",
  "components/progress-nav.js",
  "components/interactive-dots-grid.js",
  "components/sticky-tabs.js",
  "components/draw-path.js",
  "components/highlight-marker.js",
  "animations/hero.js",
  "animations/transcription.js",
  "animations/compliance.js",
  "animations/interface.js",
  "animations/threads.js",
  "animations/thread-bg.js",
  "animations/audit.js",
];

const CSS = [
  "components/tabsystemautoplay.css",
  "components/linerevealtestimonials.css",
  "components/radial-gsap-slider.css",
  "main.css",
  "components/comparison-table.css",
  "components/progress-nav.css",
  "components/draw-path.css",
  "components/highlight-marker.css",
  "animations/hero.css",
  "animations/transcription.css",
  "animations/compliance.css",
  "animations/interface.css",
  "animations/threads.css",
  "animations/thread-bg.css",
  "animations/audit.css",
];

// The JS files are concatenated into one scope before bundling (as Odyn did),
// so files can call each other's top-level functions by name (e.g. table-of-contents.js uses site.js's `lenis`).
// Duplicate top-level names across files fail the build instead of the page.
const concatEntry = {
  name: "concat-entry",
  setup(build) {
    build.onResolve({ filter: /^niq:bundle\.js$/ }, (args) => ({ path: args.path, namespace: "niq" }));
    build.onLoad({ filter: /.*/, namespace: "niq" }, async () => {
      const files = JS.map((f) => path.join(SRC, f));
      const parts = await Promise.all(
        files.map(async (file, i) => `// ---- ${JS[i]} ----\n${await readFile(file, "utf8")}\n`)
      );
      return { contents: parts.join("\n"), loader: "js", resolveDir: SRC, watchFiles: files };
    });
  },
};

const cssEntry = {
  name: "css-entry",
  setup(build) {
    build.onResolve({ filter: /^niq:bundle\.css$/ }, (args) => ({ path: args.path, namespace: "niq" }));
    build.onLoad({ filter: /.*/, namespace: "niq" }, () => ({
      contents: CSS.map((f) => `@import "./${f}";`).join("\n"),
      loader: "css",
      resolveDir: SRC,
    }));
  },
};

const shared = { bundle: true, minify: true, legalComments: "none", logLevel: "info" };

const jsOptions = {
  ...shared,
  entryPoints: { bundle: "niq:bundle.js" },
  outdir: OUT,
  format: "iife",
  plugins: [concatEntry],
};

const cssOptions = {
  ...shared,
  entryPoints: { bundle: "niq:bundle.css" },
  outdir: OUT,
  plugins: [cssEntry],
};

await mkdir(OUT, { recursive: true });

if (process.argv.includes("--dev")) {
  const js = await esbuild.context(jsOptions);
  const css = await esbuild.context(cssOptions);
  await Promise.all([js.watch(), css.watch()]);
  const { hosts, port } = await js.serve({ servedir: OUT, port: 8000 });
  console.log(`Serving dist/ at http://${hosts[0] === "0.0.0.0" ? "localhost" : hosts[0]}:${port}`);
} else {
  await Promise.all([esbuild.build(jsOptions), esbuild.build(cssOptions)]);
}
