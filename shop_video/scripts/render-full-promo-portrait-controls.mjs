import { existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { bundle, webpack } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import manifest from "../src/config/fullPromoManifest.json" with { type: "json" };

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = resolve(projectRoot, "output", "unlimitsub_full_promo_9x16_v2_controls");
const keyFrames = [75, 194, 149, 86, 205, 150, 104];
const entryPoint = resolve(projectRoot, "src", "index.tsx");

rmSync(outputDirectory, { recursive: true, force: true });
mkdirSync(outputDirectory, { recursive: true });
console.log("Bundling the vertical promo composition for scene-by-scene review...");
const serveUrl = await bundle(entryPoint, (progress) => {
  if (progress === 1 || progress === 0) return;
  console.log(`Bundling ${Math.round(progress)}%`);
}, {
  publicDir: resolve(projectRoot, "public"),
  webpackOverride: (configuration) => {
    const optionalBackgroundAssets = [
      "bg-far.png",
      "bg-lights.png",
      "bg-haze.png",
      "bg-particles.png",
      "bg-bokeh.png",
      "bg-floor.png",
    ];
    const definitions = Object.fromEntries(optionalBackgroundAssets.map((fileName, index) => [
      `__REMOTION_HAS_${["BG_FAR", "BG_LIGHTS", "BG_HAZE", "BG_PARTICLES", "BG_BOKEH", "BG_FLOOR"][index]}__`,
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
  id: "UnlimitSubFullPromoVertical",
  logLevel: "error",
});

let startFrame = 0;
const sceneStarts = [];
for (const [index, scene] of manifest.scenes.entries()) {
  sceneStarts.push(startFrame);
  const localFrame = Math.min(keyFrames[index], scene.durationInFrames - 1);
  const globalFrame = startFrame + localFrame;
  const output = resolve(outputDirectory, `scene-${String(index + 1).padStart(2, "0")}-frame-${globalFrame}.png`);
  await renderStill({
    serveUrl,
    composition,
    frame: globalFrame,
    output,
    imageFormat: "png",
    overwrite: true,
    logLevel: "error",
  });
  console.log(`Scene ${index + 1}: frame ${globalFrame} -> ${output}`);
  if (index < manifest.scenes.length - 1) {
    startFrame += scene.durationInFrames - manifest.transitionFrames;
  }
}

for (let index = 0; index < manifest.scenes.length - 1; index += 1) {
  const transitionStart = sceneStarts[index + 1] + manifest.scenes[index + 1].preRollFrames;
  const positions = [
    ["before", transitionStart - 1],
    ["middle", transitionStart + Math.floor(manifest.transitionFrames / 2)],
    ["after", transitionStart + manifest.transitionFrames],
  ];
  for (const [label, frame] of positions) {
    const output = resolve(outputDirectory, `transition-${String(index + 1).padStart(2, "0")}-${label}-frame-${frame}.png`);
    await renderStill({
      serveUrl,
      composition,
      frame,
      output,
      imageFormat: "png",
      overwrite: true,
      logLevel: "error",
    });
    console.log(`Transition ${index + 1} ${label}: frame ${frame} -> ${output}`);
  }
}
