import { existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { bundle, webpack } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = resolve(projectRoot, "output", "first_v2_cadr_vertical_controls");
const entryPoint = resolve(projectRoot, "src", "index.tsx");
const frames = [0, 20, 40, 60, 80, 105, 130, 155, 180, 209];

mkdirSync(outputDirectory, { recursive: true });
console.log("Bundling the portrait site-tour composition for frame review...");
const serveUrl = await bundle(entryPoint, (progress) => {
  if (progress === 1 || progress === 0) return;
  console.log(`Bundling ${Math.round(progress)}%`);
}, {
  publicDir: resolve(projectRoot, "public"),
  webpackOverride: (configuration) => {
    const names = ["BG_FAR", "BG_LIGHTS", "BG_HAZE", "BG_PARTICLES", "BG_BOKEH", "BG_FLOOR"];
    const files = ["bg-far.png", "bg-lights.png", "bg-haze.png", "bg-particles.png", "bg-bokeh.png", "bg-floor.png"];
    const definitions = Object.fromEntries(files.map((fileName, index) => [
      `__REMOTION_HAS_${names[index]}__`,
      JSON.stringify(existsSync(resolve(projectRoot, "public", "assets", fileName))),
    ]));
    return {
      ...configuration,
      plugins: [...(configuration.plugins ?? []), new webpack.DefinePlugin(definitions)],
    };
  },
});

const composition = await selectComposition({
  serveUrl,
  id: "UnlimitSubSiteTourVertical",
  logLevel: "error",
});

for (const frame of frames) {
  const output = resolve(outputDirectory, `frame-${String(frame).padStart(3, "0")}.png`);
  await renderStill({
    serveUrl,
    composition,
    frame,
    output,
    imageFormat: "png",
    overwrite: true,
    logLevel: "error",
  });
  console.log(`Frame ${frame}: ${output}`);
}
